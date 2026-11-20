// Enemy mesh assembly and pooling.
//
// An enemy on the board is a root group holding:
//   - its body, a clone of the type's template (rendering/enemy-models.js for
//     hockey/soccer/space, the theme kits for the rest). Geometry and materials
//     are shared by every enemy of the type;
//   - a health bar, a ground shadow for flyers, the boss's floor aura;
//   - the frost and burn dressings that are switched on by status.
//
// The game moves and turns the root; rendering/enemy-anim.js animates the body
// inside it. Roots are pooled per enemy type and quality tier, so a returning
// group can only ever come back as the same kind of enemy.

import { getState } from '../engine/state.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { getQualityName } from '../rendering/quality.js';
import { getThemeKit } from '../themes/index.js';
import { createEnemyBody, enemyBodyKey } from './enemy-models.js';
import { clearFlash } from './hit-flash.js';

// Idle roots waiting for the next enemy of their type.
const meshPool = new Map();
const MAX_PER_TYPE = 16;
const MAX_POOL_SIZE = 96;
let pooledCount = 0;

// Geometry and materials used by every enemy (created once).
let sharedMaterials = null;
let sharedGeometry = null;

const share = (resource) => {
  if (resource.userData) resource.userData.shared = true;
  else resource.userData = { shared: true };
  return resource;
};

/** A round patch that fades out to its edge, for blob shadows. */
function softDiscTexture() {
  if (typeof document === 'undefined' || !THREE.CanvasTexture) return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const fade = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
  fade.addColorStop(0, 'rgba(0,0,0,1)');
  fade.addColorStop(0.55, 'rgba(0,0,0,0.75)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function getSharedMaterials() {
  if (sharedMaterials) return sharedMaterials;
  const basic = (opts) => share(new THREE.MeshBasicMaterial(opts));
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

  sharedMaterials = {
    // Health bar
    hpBorder: basic({ color: 0x222222, side: THREE.DoubleSide }),
    hpBg: basic({ color: 0x111111, side: THREE.DoubleSide }),
    hpFull: basic({ color: 0x22c55e, side: THREE.DoubleSide }),
    hpMid: basic({ color: 0xeab308, side: THREE.DoubleSide }),
    hpLow: basic({ color: 0xef4444, side: THREE.DoubleSide }),
    hpShine: basic({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    // Soft dark patch on the floor under anything airborne
    shadow: basic({ color: 0x000000, map: softDiscTexture(), transparent: true, opacity: 0.42, depthWrite: false }),
    // Boss floor aura
    bossAura: basic({ color: 0xffc400, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }),
    // Frost dressing
    frostAura: basic({ color: 0x88ddff, transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
    crystal: share(new THREE.MeshStandardMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.85, emissive: 0x88ddff, emissiveIntensity: 0.4 })),
    frost: basic({ color: 0xccffff, transparent: true, opacity: 0.7 }),
    // Burn dressing
    heatAura: basic({ color: 0xff4400, opacity: 0.15, ...additive }),
    burnFlameA: basic({ color: 0xff2200, transparent: true, opacity: 0.85 }),
    burnFlameB: basic({ color: 0xff6600, transparent: true, opacity: 0.85 }),
    heatRing: basic({ color: 0xff6600, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    ember: basic({ color: 0xffaa00, transparent: true, opacity: 0.9 })
  };
  return sharedMaterials;
}

function getSharedGeometry() {
  if (sharedGeometry) return sharedGeometry;
  sharedGeometry = {
    plane: share(new THREE.PlaneGeometry(1, 1)),
    disc: share(new THREE.CircleGeometry(1, 24)),
    auraRing: share(new THREE.RingGeometry(0.8, 1.15, 40)),
    frostRing: share(new THREE.RingGeometry(0.9, 1.1, 24)),
    // Three crystal sizes, cycled.
    crystals: [0.06, 0.08, 0.10].map(r => share(new THREE.OctahedronGeometry(r, 0))),
    speck: share(new THREE.SphereGeometry(0.04, 6, 6)),
    heatAura: share(new THREE.SphereGeometry(1.2, 12, 12)),
    burnFlame: share(new THREE.ConeGeometry(0.1, 0.25, 6)),
    heatRing: share(new THREE.TorusGeometry(0.8, 0.03, 8, 24)),
    ember: share(new THREE.SphereGeometry(0.03, 4, 4))
  };
  return sharedGeometry;
}

const setScale = (obj, x, y, z) => { obj.scale.x = x; obj.scale.y = y; obj.scale.z = z; };

/**
 * Hand an enemy's mesh back for reuse.
 * @param {Object} enemy - Enemy with mesh to return
 */
export function returnEnemyMesh(enemy) {
  const mesh = enemy.mesh;
  if (!mesh) return;

  // Whatever was hung on the mesh for this particular enemy comes off.
  clearFlash(mesh);
  if (enemy.label && typeof mesh.remove === 'function') mesh.remove(enemy.label);
  enemy.label = null;

  const bind = mesh.userData.bind;
  if (bind) for (const key of Object.keys(bind)) enemy[key] = null;
  enemy.hpBar = null;
  enemy.flames = null;
  enemy.wings = null;
  enemy.crownGem = null;
  enemy.anim = null;
  enemy.mesh = null;

  const key = mesh.userData.poolKey;
  const list = key ? (meshPool.get(key) || meshPool.set(key, []).get(key)) : null;
  if (list && list.length < MAX_PER_TYPE && pooledCount < MAX_POOL_SIZE) {
    list.push(mesh);
    pooledCount++;
  } else {
    disposeGroup(mesh);
  }
}

/**
 * Dispose of what belongs to one enemy alone. Shared geometry and materials
 * (flagged `userData.shared`) are left for the enemies still using them.
 * @param {THREE.Group} group
 */
function disposeGroup(group) {
  const mine = (resource) => resource && !resource.userData?.shared && typeof resource.dispose === 'function';
  group.traverse((obj) => {
    if (obj.isSprite) return;                       // label sprites share cached materials
    if (mine(obj.geometry)) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach(m => { if (mine(m)) m.dispose(); });
  });
}

/** Health bar: five flat strips in a holder that enemy-anim.js keeps square to the camera. */
function buildHealthBar(group, bind, sz, y, mats, geo) {
  const holder = new THREE.Group();
  holder.position.y = y;
  group.add(holder);

  const strip = (material, width, depth, lift, z = 0) => {
    const mesh = new THREE.Mesh(geo.plane, material);
    mesh.rotation.x = -Math.PI / 2;
    setScale(mesh, width, depth, 1);
    mesh.position.y = lift;
    mesh.position.z = z;
    holder.add(mesh);
    return mesh;
  };

  const fill = sz * 2.3;
  const hpBorder = strip(mats.hpBorder, sz * 2.6, 0.22, 0);
  const hpBg = strip(mats.hpBg, sz * 2.5, 0.18, 0.005);
  // The fill sits in its own holder scaled to the bar's length, so the game can
  // drive it in bar units: scale.x = fraction left, position.x = -(1 - fraction) / 2.
  const fillHolder = new THREE.Group();
  setScale(fillHolder, fill, 1, 1);
  holder.add(fillHolder);
  const hpBar = new THREE.Mesh(geo.plane, mats.hpFull);
  hpBar.rotation.x = -Math.PI / 2;
  setScale(hpBar, 1, 0.14, 1);
  hpBar.position.y = 0.01;
  hpBar.userData.targetWidth = 1.0;
  hpBar.userData.currentWidth = 1.0;
  fillHolder.add(hpBar);
  // White overlay that can be flashed on a hit (its opacity is per enemy).
  const hpDamageFlash = strip(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }), fill, 0.14, 0.012);
  const hpShine = strip(mats.hpShine, fill, 0.04, 0.015, -0.035);

  bind.hpHolder = holder;
  bind.hpBar = hpBar;
  bind.hpSize = 1;
  bind.hpDamageFlash = hpDamageFlash;
  bind.hpParts = [hpBorder, hpBg, hpBar, hpDamageFlash, hpShine];
  bind.hpMats = mats;
}

/** Frost and burn dressings, hidden until the status applies. */
function buildStatusDressing(group, bind, sz, lift, quality, mats, geo) {
  const low = quality === 'low';

  const slowGroup = new THREE.Group();
  slowGroup.visible = false;
  slowGroup.position.y = lift;
  const frostAura = new THREE.Mesh(geo.frostRing, mats.frostAura);
  frostAura.rotation.x = -Math.PI / 2;
  frostAura.position.y = 0.05 - lift;
  setScale(frostAura, sz, sz, sz);
  slowGroup.add(frostAura);

  // Ice crystals orbiting - 10 on high, 4 on low quality (SC-5.5)
  const CRYSTAL_COUNT = low ? 4 : 10;
  bind.iceCrystals = [];
  for (let i = 0; i < CRYSTAL_COUNT; i++) {
    const crystal = new THREE.Mesh(geo.crystals[i % 3], mats.crystal);
    const angle = (i / CRYSTAL_COUNT) * Math.PI * 2;
    setScale(crystal, sz, sz, sz);
    crystal.position.x = Math.cos(angle) * sz;
    crystal.position.y = sz * 0.3 + Math.sin(i) * sz * 0.1;
    crystal.position.z = Math.sin(angle) * sz;
    slowGroup.add(crystal);
    bind.iceCrystals.push({ mesh: crystal, baseAngle: angle });
  }

  bind.frostParticles = [];
  for (let i = 0; i < 4; i++) {
    const frost = new THREE.Mesh(geo.speck, mats.frost);
    const angle = (i / 4) * Math.PI * 2;
    setScale(frost, sz, sz, sz);
    frost.position.x = Math.cos(angle) * sz * 0.6;
    frost.position.y = sz * 0.5;
    frost.position.z = Math.sin(angle) * sz * 0.6;
    slowGroup.add(frost);
    bind.frostParticles.push({ mesh: frost, offset: i });
  }
  group.add(slowGroup);
  bind.slowGroup = slowGroup;
  bind.frostAura = frostAura;

  const burnGroup = new THREE.Group();
  burnGroup.visible = false;
  burnGroup.position.y = lift;
  const heatAura = new THREE.Mesh(geo.heatAura, mats.heatAura);
  setScale(heatAura, sz, sz, sz);
  burnGroup.add(heatAura);

  bind.burnFlames = [];
  for (let i = 0; i < 8; i++) {
    // The flicker overwrites a flame's X/Y scale, so its size rides on a holder.
    const holder = new THREE.Group();
    const angle = (i / 8) * Math.PI * 2;
    setScale(holder, sz, sz, sz);
    holder.position.x = Math.cos(angle) * sz * 0.75;
    holder.position.y = sz * 0.15;
    holder.position.z = Math.sin(angle) * sz * 0.75;
    const burnFlame = new THREE.Mesh(geo.burnFlame, i % 2 === 0 ? mats.burnFlameA : mats.burnFlameB);
    holder.add(burnFlame);
    burnGroup.add(holder);
    bind.burnFlames.push({ mesh: burnFlame, holder, baseAngle: angle });
  }

  // Heat distortion ring above the enemy
  const heatRing = new THREE.Mesh(geo.heatRing, mats.heatRing);
  heatRing.rotation.x = Math.PI / 2;
  const ringHolder = new THREE.Group();
  setScale(ringHolder, sz, sz, sz);
  ringHolder.add(heatRing);
  heatRing.position.y = 0.8;
  burnGroup.add(ringHolder);
  bind.heatRing = heatRing;

  // Ember particles - 8 on high, 3 on low quality (SC-5.5)
  const EMBER_COUNT = low ? 3 : 8;
  bind.burnEmbers = [];
  for (let i = 0; i < EMBER_COUNT; i++) {
    const holder = new THREE.Group();
    setScale(holder, sz, sz, sz);
    const ember = new THREE.Mesh(geo.ember, mats.ember);
    const angle = (i / 8) * Math.PI * 2;
    ember.position.x = Math.cos(angle) * 0.5;
    ember.position.y = 0.8 + (i % 3) * 0.1;
    ember.position.z = Math.sin(angle) * 0.5;
    holder.add(ember);
    burnGroup.add(holder);
    bind.burnEmbers.push({ mesh: ember, offset: i });
  }
  group.add(burnGroup);
  bind.burnGroup = burnGroup;
  bind.heatAura = heatAura;
}

/** Build a new root for this kind of enemy. Everything it sets up is recorded in `bind`. */
function buildEnemyMesh(enemy, sz, theme, visual, kit, quality, poolKey) {
  const mats = getSharedMaterials();
  const geo = getSharedGeometry();
  const group = new THREE.Group();
  const bind = {};
  const scale = enemy.boss ? 1.3 : 1;

  // Bosses stand a third larger again.
  setScale(group, scale, scale, scale);

  // The game puts a ground enemy's origin 0.2 above the floor — less than the
  // body's radius — so the body is lifted to stand on the floor. Flyers hang
  // around their origin.
  const lift = enemy.flying ? 0 : Math.max(0, sz * 1.02 - 0.18 / scale);

  const { body, gait, refs } = createEnemyBody(enemy, sz, theme, visual, kit);
  body.position.y = lift;
  group.add(body);
  Object.assign(bind, refs, { body, gait });

  buildHealthBar(group, bind, sz, lift + (enemy.boss ? sz * 1.8 : sz * 1.5), mats, geo);

  // Flyers get a soft shadow on the floor so their height reads; on the low
  // tier (no shadow maps) everything gets one.
  if (enemy.flying || quality === 'low') {
    const shadow = new THREE.Mesh(geo.disc, mats.shadow);
    const rootY = enemy.flying ? 1.2 : 0.2;
    const radius = sz * (enemy.flying ? 0.85 : 1.0);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = (0.045 - rootY) / scale;
    setScale(shadow, radius, radius, radius);
    shadow.renderOrder = 1;
    group.add(shadow);
  }

  // Movement trail ribbons for fast enemies (SC-5.5: skip on low quality)
  const isFastEnemy = enemy.speed === 'fast' || enemy.speed === 'very_fast';
  if (isFastEnemy && quality !== 'low') {
    group.userData.hasTrail = true;
    const enemyColor = (enemy.fire ? 0xff6600 : 0x00d4ff);
    bind.trailMeshes = [0.3, 0.15, 0.08].map((opacity, i) => {
      const trailPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(sz * 0.3, sz * 0.2),
        new THREE.MeshBasicMaterial({ color: enemyColor, transparent: true, opacity, side: THREE.DoubleSide })
      );
      trailPlane.position.y = lift;
      trailPlane.position.z = -sz * (0.5 + i * 0.35);
      trailPlane.rotation.x = -Math.PI / 2;
      group.add(trailPlane);
      return trailPlane;
    });
  }

  buildStatusDressing(group, bind, sz, lift, quality, mats, geo);

  // Boss: a pulsing gold ring on the floor around its feet (SC-5.5: skip on low).
  if (enemy.boss && quality !== 'low') {
    const bossAura = new THREE.Mesh(geo.auraRing, mats.bossAura);
    const radius = sz * 1.3;
    bossAura.rotation.x = -Math.PI / 2;
    bossAura.position.y = (0.05 - 0.2) / scale;
    const holder = new THREE.Group();
    setScale(holder, radius, radius, radius);
    holder.position.y = bossAura.position.y;
    bossAura.position.y = 0;
    holder.add(bossAura);
    group.add(holder);
    bind.bossAura = bossAura;
  }

  // Height (in the group's own units) that clears the body, for the label.
  group.userData.topY = lift + sz * 1.75;
  group.userData.baseScale = scale;
  group.userData.lift = lift;
  group.userData.poolKey = poolKey;
  group.userData.bind = bind;
  return group;
}

/** Put a root (new or from the pool) into its just-spawned state and wire it to the enemy. */
function bindEnemyMesh(group, enemy) {
  const bind = group.userData.bind;
  const scale = group.userData.baseScale || 1;
  Object.assign(enemy, bind);

  setScale(group, scale, scale, scale);
  group.rotation.y = 0;
  group.visible = true;
  group.userData.punchActive = false;

  const body = bind.body;
  body.position.y = group.userData.lift || 0;
  body.rotation.x = body.rotation.y = body.rotation.z = 0;
  setScale(body, 1, 1, 1);

  // An undamaged enemy shows no health bar: a full bar over every enemy is
  // clutter (and five draw calls each). It appears on the first hit; a boss
  // always shows one. See updateHealthBar in systems/enemies.js.
  bind.hpBar.material = bind.hpMats.hpFull;
  bind.hpBar.scale.x = 1;
  bind.hpBar.position.x = 0;
  bind.hpBar.userData.targetWidth = 1.0;
  bind.hpBar.userData.currentWidth = 1.0;
  bind.hpDamageFlash.material.opacity = 0;
  enemy.hpShown = !!enemy.boss;
  bind.hpParts.forEach(part => { part.visible = enemy.hpShown; });

  bind.slowGroup.visible = false;
  bind.burnGroup.visible = false;

  enemy.anim = null;
  enemy.trailParticles = [];
}

export function createEnemyMesh(enemy) {
  const state = getState();
  const { theme, themeData } = state;
  const visuals = getVisualProfile(themeData);
  // 0.42 (was 0.34): enemies were the smallest things on the board and hard to
  // tell apart at the game camera. Cosmetic only — hits are resolved on position.
  const sz = (enemy.sz || 1) * 0.42;
  const quality = getQualityName();
  // Plug-in themes model each enemy as its own creature.
  const kit = getThemeKit(theme);
  const roleKey = enemy.slot || enemy.role?.toLowerCase() || 'swarm';
  const visual = visuals.enemies[roleKey] || visuals.enemies[enemy.role?.toLowerCase()] || visuals.enemies.swarm;

  const fast = enemy.speed === 'fast' || enemy.speed === 'very_fast';
  const poolKey = `${enemyBodyKey(enemy, sz, theme)}|${quality}|${fast ? 1 : 0}`;
  const idle = meshPool.get(poolKey);
  let group = idle && idle.pop();
  if (group) pooledCount--;
  else group = buildEnemyMesh(enemy, sz, theme, visual, kit, quality, poolKey);

  bindEnemyMesh(group, enemy);
  group.position.set(enemy.x, enemy.flying ? 1.2 : 0.2, enemy.z);
  return group;
}
