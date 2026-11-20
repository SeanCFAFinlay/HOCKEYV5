// Tower mesh creation with enhanced visuals

import { getState } from '../engine/state.js';
import { makeCapsule } from '../utils/math.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { bakeStaticMeshes } from './geo-utils.js';
import { getThemeKit } from '../themes/index.js';
import { buildTower as buildHockeyRemodel } from '../themes/hockey-towers.js';
import { buildTower as buildSoccerRemodel } from '../themes/soccer-towers.js';
// ── SC-2.5: Environment map + emissive flash ───────────────────────────────

// Shared environment map for metallic reflections
let _sceneEnvMap = null;

/**
 * Store a PMREMGenerator-processed envMap for metallic materials.
 * @param {THREE.Texture} envMap
 */
export function setSceneEnvMap(envMap) {
  _sceneEnvMap = envMap;
  if (towerMaterials) {
    _applyEnvMapToSharedMaterials(towerMaterials);
  }
}

function _applyEnvMapToSharedMaterials(mats) {
  if (!_sceneEnvMap) return;
  ['metal', 'gold'].forEach(key => {
    if (mats[key]?.metalness >= 0.5) {
      mats[key].envMap = _sceneEnvMap;
      mats[key].envMapIntensity = 0.6;
      mats[key].needsUpdate = true;
    }
  });
}

/**
 * Flash a tower mesh emissive on fire. Stores state in mesh.userData.
 * @param {THREE.Object3D|null} mesh
 * @param {number} color  - emissive color hint
 * @param {number} duration - decay hint in ms (default 100)
 */
export function flashTowerEmissive(mesh, color, duration = 120) {
  if (!mesh) return;
  if (!mesh.userData) return;
  mesh.userData.emissiveFlash = 0.8;
  mesh.userData.emissiveFlashDuration = duration;
  if (mesh.material?.emissiveIntensity !== undefined) {
    mesh.material.emissiveIntensity = 0.8;
  }
}

/**
 * Decay emissive flash each animation frame. Call from updateAnimations.
 * @param {Array} towers - array of tower objects with .mesh
 * @param {number} dt    - frame delta in seconds
 */
export function updateEmissiveFlashes(towers, dt) {
  for (const tw of towers) {
    const mesh = tw?.mesh;
    if (!mesh?.userData) continue;
    if (!mesh.userData.emissiveFlash) continue;

    const decayMs = mesh.userData.emissiveFlashDuration || 100;
    mesh.userData.emissiveFlash -= (1000 / decayMs) * dt;

    if (mesh.userData.emissiveFlash <= 0) {
      mesh.userData.emissiveFlash = 0;
    }

    if (mesh.material?.emissiveIntensity !== undefined) {
      mesh.material.emissiveIntensity = 0.12 + mesh.userData.emissiveFlash * 0.65;
    }
  }
}

// Shared detail geometries — created once, reused for all towers
let _detailSphereGeo = null;
let _detailBoxGeo = null;

function getDetailSphereGeo() {
  if (!_detailSphereGeo) _detailSphereGeo = new THREE.SphereGeometry(0.02, 8, 8);
  return _detailSphereGeo;
}

function getDetailBoxGeo() {
  if (!_detailBoxGeo) _detailBoxGeo = new THREE.BoxGeometry(0.04, 0.008, 0.02);
  return _detailBoxGeo;
}

/**
 * Platform footprint per tactical role.
 *
 * Every tower used to stand on the same large white disc with a red ring, and
 * from the game camera that disc *was* the tower: eight identical circles with
 * a small coloured shape on top. Now the footprint itself says what the tower
 * does, before the figure is even legible:
 *
 *   sides  - polygon side count (24 reads as round)
 *   radius - multiplier on BASE_RADIUS; few-sided shapes need more to look as big
 *   twist  - rotation so a flat edge, not a corner, faces the camera where wanted
 *   tiers  - extra stacked plinth layers (heavier towers stand taller)
 */
const BASE_SHAPES = {
  'ANTI-SWARM':  { sides: 24, radius: 1.0,  twist: 0,           tiers: 0 },
  SNIPER:        { sides: 6,  radius: 1.05, twist: 0,           tiers: 0 },
  SPLASH:        { sides: 8,  radius: 1.05, twist: Math.PI / 8, tiers: 1 },
  CROWD_CONTROL: { sides: 12, radius: 1.0,  twist: 0,           tiers: 0 },
  CHOKEPOINT:    { sides: 4,  radius: 1.22, twist: Math.PI / 4, tiers: 1 },
  CHAIN:         { sides: 3,  radius: 1.3,  twist: 0,           tiers: 0 },
  DOT:           { sides: 5,  radius: 1.1,  twist: 0,           tiers: 0 },
  BOSS_KILLER:   { sides: 10, radius: 1.08, twist: 0,           tiers: 2 }
};
const ROLE_BY_INDEX = ['ANTI-SWARM', 'SNIPER', 'SPLASH', 'CROWD_CONTROL', 'CHOKEPOINT', 'CHAIN', 'DOT', 'BOSS_KILLER'];

// Footprint radius in world units. A grid cell is 1 wide, so the platform stays
// inside its own cell (it used to be 0.78 — wider than the cell it stood on).
const BASE_RADIUS = 0.4;

/**
 * The platform a tower stands on. Keeps the reference-art language — faceted
 * body, chamfered lip, glowing strips set into the rim, a marked top surface —
 * but shaped by the tower's role and lit in the tower's own colour, so no two
 * tower types share a base.
 *
 * Assigns tower.baseGlow and tower.baseRim, which the firing flash pulses.
 *
 * @param {THREE.Group} group
 * @param {object} tower
 * @param {object} visuals - active visual profile
 * @param {string} theme
 * @param {THREE.Color} color - tower accent colour
 * @param {string} role - tactical role key into BASE_SHAPES
 */
function buildTowerBase(group, tower, visuals, theme, color, role) {
  const isHockey = theme === 'hockey';
  const shape = BASE_SHAPES[role] || BASE_SHAPES['ANTI-SWARM'];
  const sides = shape.sides;
  const R = BASE_RADIUS * shape.radius;
  const twist = shape.twist;

  // Body takes a little of the tower's colour so the whole unit reads as one.
  const bodyColor = new THREE.Color(isHockey ? 0x1c3a63 : visuals.towers.base).lerp(color, 0.22);
  const platMat = new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.7 });
  const lipMat = new THREE.MeshStandardMaterial({ color: bodyColor.clone().lerp(new THREE.Color(0xffffff), 0.14), metalness: 0.6, roughness: 0.35, envMapIntensity: 0.8 });
  const trimMat = new THREE.MeshStandardMaterial({ color: visuals.towers.metal, metalness: 0.9, roughness: 0.14 });

  // Optional lower plinth tiers for the heavy hitters.
  let lift = 0;
  for (let t = shape.tiers; t > 0; t--) {
    const tierR = R * (1 + t * 0.13);
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(tierR, tierR * 1.05, 0.06, sides), t % 2 ? trimMat : platMat);
    tier.position.y = 0.03 + lift;
    tier.rotation.y = twist;
    tier.castShadow = true;
    tier.receiveShadow = true;
    group.add(tier);
    lift += 0.05;
  }

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.1, 0.16, sides), platMat);
  platform.position.y = 0.08 + lift;
  platform.rotation.y = twist;
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  const lip = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R, 0.04, sides), lipMat);
  lip.position.y = 0.18 + lift;
  lip.rotation.y = twist;
  group.add(lip);

  // Top surface in a pale wash of the tower's colour.
  const topMat = new THREE.MeshStandardMaterial({
    color: color.clone().lerp(new THREE.Color(isHockey ? 0xe8f6ff : 0xdfe6f0), 0.62),
    metalness: 0.12, roughness: 0.24, envMapIntensity: 0.6
  });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.02, sides), topMat);
  top.position.y = 0.205 + lift;
  top.rotation.y = twist;
  top.receiveShadow = true;
  group.add(top);

  // Marking on the top surface, following the footprint's shape.
  const marking = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.5, 0.012, 6, Math.max(sides, 3)),
    new THREE.MeshBasicMaterial({ color })
  );
  marking.rotation.x = Math.PI / 2;
  marking.rotation.z = Math.PI / 2 - twist;
  marking.position.y = 0.218 + lift;
  group.add(marking);

  // Glowing strip on each face (eight, evenly spaced, on a round base), each
  // separated by a chrome rivet.
  const ledMat = new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending, depthWrite: false });
  const faces = sides > 12 ? 8 : sides;
  // Distance from centre to the middle of a flat face.
  const apothem = R * 1.05 * Math.cos(Math.PI / Math.max(sides, 3));
  const faceWidth = sides > 12 ? 0.16 : 2 * R * Math.sin(Math.PI / sides) * 0.6;
  for (let i = 0; i < faces; i++) {
    // CylinderGeometry puts its first vertex on +Z, so face centres sit half a step on.
    const a = twist + ((i + 0.5) / faces) * Math.PI * 2;
    const led = new THREE.Mesh(new THREE.BoxGeometry(faceWidth, 0.035, 0.02), ledMat);
    led.position.set(Math.sin(a) * (apothem + 0.012), 0.09 + lift, Math.cos(a) * (apothem + 0.012));
    led.rotation.y = a;
    group.add(led);

    // Chrome rivet between strips — at each corner on a polygonal base.
    const corner = twist + (i / faces) * Math.PI * 2;
    const stud = new THREE.Mesh(getDetailSphereGeo(), trimMat);
    stud.scale.setScalar(1.6);
    stud.position.set(Math.sin(corner) * R * 0.98, 0.17 + lift, Math.cos(corner) * R * 0.98);
    group.add(stud);
  }

  // Soft underglow puddle on the playfield beneath the platform.
  const baseGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.3, R * 1.35, 0.02, Math.max(sides, 3)),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  baseGlow.position.y = 0.012;
  baseGlow.rotation.y = twist;
  group.add(baseGlow);
  tower.baseGlow = baseGlow;

  // Accent rim the firing flash pulses.
  const baseRim = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.86, 0.016, 8, Math.max(sides, 3)),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  baseRim.rotation.x = Math.PI / 2;
  baseRim.rotation.z = Math.PI / 2 - twist;
  baseRim.position.y = 0.212 + lift;
  group.add(baseRim);
  tower.baseRim = baseRim;

  return { radius: R, top: 0.215 + lift };
}

/**
 * Team trim on the figure. Hockey towers keep the gold collar and shoulder
 * studs from the reference art; other themes have their own identity already.
 *
 * @param {THREE.Group} turret
 * @param {number} scale
 * @param {string} theme
 */
function addTowerDetail(turret, scale, theme) {
  if (theme !== 'hockey') return;
  const GOLD = 0xffd257;
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.95, roughness: 0.12, emissive: 0x5a3d00, emissiveIntensity: 0.3, envMapIntensity: 1 });
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2 * scale, 0.03 * scale, 8, 24), goldMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.26 * scale;
  collar.castShadow = true;
  turret.add(collar);

  for (let i = 0; i < 2; i++) {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.045 * scale, 10, 8), goldMat);
    stud.position.set((i ? 1 : -1) * 0.2 * scale, 0.26 * scale, 0);
    turret.add(stud);
  }
}

// Shared enhanced materials
let towerMaterials = null;

function getTowerMaterials() {
  if (towerMaterials) return towerMaterials;

  towerMaterials = {
    // Base platform - darker for contrast against arena
    base: new THREE.MeshStandardMaterial({
      color: 0x141428,
      metalness: 0.35,
      roughness: 0.65,
      envMapIntensity: 0.4
    }),
    // Chrome/steel parts - slightly tinted for warmth
    metal: new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      metalness: 0.85,
      roughness: 0.15,
      envMapIntensity: 0.9
    }),
    // Dark accents - deeper for contrast
    dark: new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      metalness: 0.45,
      roughness: 0.55
    }),
    // White parts (player bodies, pads) - slightly toned down
    white: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.08,
      roughness: 0.82
    }),
    // Gold/trophy parts - warmer, richer
    gold: new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.90,
      roughness: 0.08,
      emissive: 0x996600,
      emissiveIntensity: 0.18
    })
  };

  return towerMaterials;
}

function createRangeRing(innerRadius, outerRadius, color, opacity) {
  const safeInner = Math.max(0.05, innerRadius);
  const safeOuter = Math.max(safeInner + 0.03, outerRadius);
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(safeInner, safeOuter, 64),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  mesh.visible = false;
  return mesh;
}

export function updateTowerRangeGeometry(tower) {
  if (!tower?.rangeMeshes?.length) return;

  const range = tower.rng || 1;
  const radii = [
    [range - 0.1, range],
    [range - 0.22, range - 0.1],
    [range, range + 0.07]
  ];

  tower.rangeMeshes.forEach((mesh, index) => {
    if (!mesh) return;
    if (mesh.geometry) mesh.geometry.dispose();

    const [inner, outer] = radii[index] || radii[0];
    mesh.geometry = new THREE.RingGeometry(
      Math.max(0.05, inner),
      Math.max(Math.max(0.05, inner) + 0.03, outer),
      64
    );
  });
}

export function setTowerRangeVisible(tower, visible) {
  const rangeMeshes = tower?.rangeMeshes || (tower?.rangeMesh ? [tower.rangeMesh] : []);
  rangeMeshes.forEach(mesh => {
    if (mesh) mesh.visible = Boolean(visible);
  });
}

export function hideAllTowerRanges(towers = getState().towers || []) {
  towers.forEach(tower => setTowerRangeVisible(tower, false));
}

/**
 * What an upgrade adds. Each level puts a new, visible part on the tower so its
 * tier reads from across the board, not just from a slightly larger scale:
 *
 *   level 1 - a glowing power band round the figure
 *   level 2 - shards orbiting it
 *   level 3 - a gold crown floating overhead
 *
 * @param {THREE.Group} turret
 * @param {number} lv
 * @param {number} scale - figure scale
 * @param {THREE.Color} color
 * @param {THREE.Material} goldMat
 */
function addLevelFlair(turret, lv, scale, color, goldMat) {
  if (lv < 1) return;
  const parts = turret.userData.animParts;
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.27 * scale, 0.022 * scale, 6, 28), glow);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.3 * scale;
  turret.add(band);
  parts.push({ mesh: band, type: 'pulse' });

  if (lv >= 2) {
    const shardGeo = new THREE.OctahedronGeometry(0.05 * scale, 0);
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(shardGeo, glow);
      shard.scale.set(0.7, 1.6, 0.7);
      shard.position.y = 0.52 * scale;
      turret.add(shard);
      parts.push({ mesh: shard, type: 'orbit', offset: i, radius: 0.36 * scale });
    }
  }

  if (lv >= 3) {
    const crown = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15 * scale, 0.022 * scale, 6, 20), goldMat);
    ring.rotation.x = Math.PI / 2;
    crown.add(ring);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035 * scale, 0.11 * scale, 4), goldMat);
      spike.position.set(Math.cos(a) * 0.15 * scale, 0.06 * scale, Math.sin(a) * 0.15 * scale);
      crown.add(spike);
    }
    crown.position.y = 0.98 * scale;
    turret.add(crown);
    parts.push({ mesh: crown, type: 'spin', speed: 0.5 });
  }
}

/**
 * Hand-set muzzle points for figures the measurement below gets wrong, keyed
 * `theme:towerIndex`. Values are multiples of the figure's scale: [x, y, z].
 */
const MUZZLE_OVERRIDES = {};

let _mzV = null;
let _mzInv = null;
const MUZZLE_DEFAULT = { x: 0, y: 0.6, z: 0.3 };

/**
 * Measure where a figure's shots should leave it.
 *
 * Every figure faces +Z, so the muzzle is whatever sticks out furthest forward:
 * a barrel's mouth, a stick's blade, a boot. Figures with nothing pointing
 * forward (coils, beacons), and chain towers, fire from their top instead.
 * @returns {{x: number, y: number, z: number}} turret-local point
 */
function findMuzzle(turret, role) {
  try {
    return measureMuzzle(turret, role);
  } catch (e) {
    return MUZZLE_DEFAULT;
  }
}

function measureMuzzle(turret, role) {
  if (!_mzV) {
    _mzV = new THREE.Vector3();
    _mzInv = new THREE.Matrix4();
  }
  turret.updateMatrixWorld(true);
  _mzInv.copy(turret.matrixWorld).invert();

  const pts = [];
  let minZ = Infinity, maxZ = -Infinity, maxY = -Infinity;
  turret.traverse(o => {
    const pos = o.isMesh && o.geometry?.attributes?.position;
    if (!pos || o.visible === false) return;
    // Soft glows and halos are not part of the figure's shape.
    if (o.material?.blending === THREE.AdditiveBlending || (o.material?.transparent && o.material.opacity < 0.5)) return;
    const step = Math.max(1, Math.floor(pos.count / 120));
    for (let i = 0; i < pos.count; i += step) {
      _mzV.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).applyMatrix4(_mzInv);
      pts.push(_mzV.x, _mzV.y, _mzV.z);
      if (_mzV.z < minZ) minZ = _mzV.z;
      if (_mzV.z > maxZ) maxZ = _mzV.z;
      if (_mzV.y > maxY) maxY = _mzV.y;
    }
  });
  if (!pts.length) return MUZZLE_DEFAULT;

  const average = (pick) => {
    let x = 0, y = 0, z = 0, n = 0;
    for (let i = 0; i < pts.length; i += 3) {
      if (!pick(pts[i], pts[i + 1], pts[i + 2])) continue;
      x += pts[i]; y += pts[i + 1]; z += pts[i + 2]; n++;
    }
    return n ? { x: x / n, y: y / n, z: z / n } : null;
  };

  const depth = maxZ - minZ || 1;
  // Round figures (as deep behind as in front) have no front to fire from.
  const round = Math.abs(maxZ + minZ) < depth * 0.06;
  if (role === 'CHAIN' || round) {
    const top = average((x, y) => y > maxY - 0.08 * (maxY || 1));
    return { x: top.x, y: maxY, z: top.z };
  }
  const tip = average((x, y, z) => z > maxZ - depth * 0.06);
  return { x: tip.x, y: tip.y, z: maxZ };
}

export function createTowerMesh(tower) {
  const state = getState();
  const { theme, themeData, COLS, ROWS, scene } = state;
  const visuals = getVisualProfile(themeData);

  const td = themeData.towers.find(t => t.id === tower.type);
  const color = new THREE.Color(td.clr);
  const group = new THREE.Group();
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const lv = tower.lv || 0;
  const towerIdx = parseInt(tower.type.substring(1)) - 1;
  const role = td.role || ROLE_BY_INDEX[towerIdx] || 'ANTI-SWARM';

  // The figure is what identifies a tower, so it is the large part: taller than
  // its platform is wide, and it grows noticeably with each level. Purely
  // cosmetic — range rings use tower.rng directly.
  const scale = 1.75 + lv * 0.13;
  const mats = getTowerMaterials();

  const bodyEmissive = (theme === 'hockey' ? 0.26 : 0.24) + lv * 0.03;
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    metalness: theme === 'hockey' ? 0.3 : 0.5,
    roughness: theme === 'hockey' ? 0.4 : 0.35,
    emissive: color,
    emissiveIntensity: bodyEmissive
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: visuals.towers.metal,
    metalness: theme === 'space' ? 0.92 : (theme === 'hockey' ? 0.62 : 0.85),
    roughness: theme === 'space' ? 0.12 : (theme === 'hockey' ? 0.28 : 0.18),
    envMapIntensity: 0.9
  });
  const darkMat = mats.dark;
  const whiteMat = mats.white;
  const goldMat = mats.gold;

  // Platform: shaped by role, lit in the tower's colour. Stays put.
  const base = buildTowerBase(group, tower, visuals, theme, color, role);

  // Level pips: one gold gem per level along the front edge of the platform.
  for (let i = 0; i <= lv; i++) {
    const pip = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), goldMat);
    const angle = (i - lv / 2) * 0.42;
    pip.position.set(Math.sin(angle) * base.radius * 0.72, base.top + 0.03, Math.cos(angle) * base.radius * 0.72);
    group.add(pip);
  }

  // Turret: the figure itself. It alone turns to face targets and kicks back
  // when it fires, so a hexagonal or square platform never spins underneath it.
  const turret = new THREE.Group();
  turret.position.y = base.top - 0.2;
  group.add(turret);

  // Hockey and soccer figures are remodelled in js/themes/*-towers.js; the
  // original primitive builders below remain as the fallback.
  const kitCtx = { scale, lv, color, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat };
  if (theme === 'hockey' && buildHockeyRemodel) {
    turret.userData.animParts = [];
    buildHockeyRemodel(turret, towerIdx, kitCtx);
  } else if (theme === 'soccer' && buildSoccerRemodel) {
    turret.userData.animParts = [];
    buildSoccerRemodel(turret, towerIdx, kitCtx);
  } else if (theme === 'hockey') {
    buildHockeyTowerMesh(turret, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color);
  } else if (theme === 'soccer') {
    buildSoccerTowerMesh(turret, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color);
  } else if (getThemeKit(theme)?.buildTower) {
    turret.userData.animParts = [];
    getThemeKit(theme).buildTower(turret, towerIdx, { scale, lv, color, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat });
  } else {
    buildSpaceTowerMesh(turret, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color);
  }
  turret.userData.animParts = turret.userData.animParts || [];

  // Where shots leave this figure, in the turret's own space (+Z is forward).
  // A builder can set turret.userData.muzzle itself; otherwise it is measured.
  tower.muzzle = turret.userData.muzzle || MUZZLE_OVERRIDES[`${theme}:${towerIdx}`] || findMuzzle(turret, role);
  tower.muzzleBaseY = 0.08 + turret.position.y;

  // The remodelled hockey figures carry their own trim.
  if (!(theme === 'hockey' && buildHockeyRemodel)) addTowerDetail(turret, scale, theme);
  addLevelFlair(turret, lv, scale, color, goldMat);

  // Collapse everything that never moves into one mesh per material. A tower
  // was ~45 draw calls (and again in the shadow pass); the animated parts and
  // the pieces the firing flash drives are left as they are.
  const animParts = turret.userData.animParts;
  const live = new Set([turret, tower.baseGlow, tower.baseRim]);
  animParts.forEach(part => { if (part.mesh) live.add(part.mesh); });
  bakeStaticMeshes(turret, live);
  bakeStaticMeshes(group, live);

  // Range indicator - hidden by default and revealed for selected towers.
  const rangeOuter = createRangeRing(tower.rng - 0.1, tower.rng, color, 0.38);
  const rangeInner = createRangeRing(tower.rng - 0.22, tower.rng - 0.1, color, 0.16);
  const rangeGlow = createRangeRing(tower.rng, tower.rng + 0.07, color, 0.18);
  group.add(rangeOuter);
  group.add(rangeInner);
  group.add(rangeGlow);
  tower.rangeMeshes = [rangeOuter, rangeInner, rangeGlow];
  tower.rangeMesh = rangeOuter;
  group.userData.rangeMeshes = tower.rangeMeshes;

  // Contact shadow — a soft dark disc beneath the tower (all quality tiers)
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(base.radius * 1.25, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.28, transparent: true, depthWrite: false })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.006;
  group.add(shadowPlane);

  // Idle breathing: the figure, not the platform.
  animParts.push({ mesh: turret, type: 'bob' });

  // Particle emission flags for the animation system
  group.userData.emitParticle = true;
  group.userData.emitInterval = 2000;
  group.userData.emitColor = td.clr;
  group.userData.animParts = animParts;

  group.position.set(tower.x - hw + 0.5, 0.08, tower.y - hh + 0.5);
  scene.add(group);

  tower.animParts = animParts;
  tower.turret = turret;
  // Keep facing the same way across an upgrade rebuild.
  if (tower.aimAngle != null) turret.rotation.y = tower.aimAngle;
  // For the firing flash: the figure's own material and its resting glow.
  tower.bodyMat = bodyMat;
  tower.bodyEmissive = bodyEmissive;

  return group;
}

function buildHockeyTowerMesh(group, idx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color) {
  group.userData.animParts = [];

  switch (idx) {
    case 0: // Slap Shot
      const jersey = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.18 * scale, 0.35 * scale, 16), bodyMat);
      jersey.position.y = 0.3 * scale;
      jersey.castShadow = true;
      group.add(jersey);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), whiteMat);
      head.position.y = 0.55 * scale;
      group.add(head);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6), bodyMat);
      helmet.position.y = 0.57 * scale;
      group.add(helmet);

      const stickShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.6 * scale, 6), darkMat);
      stickShaft.position.set(0.2 * scale, 0.35 * scale, 0);
      stickShaft.rotation.z = 0.4;
      group.add(stickShaft);

      const stickBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2 * scale, 0.04 * scale, 0.06 * scale), darkMat);
      stickBlade.position.set(0.35 * scale, 0.12 * scale, 0);
      group.add(stickBlade);

      const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 0.02 * scale, 16), glowMat);
      puck.position.set(0.35 * scale, 0.16 * scale, 0);
      puck.rotation.x = Math.PI / 2;
      group.add(puck);
      group.userData.animParts.push({ mesh: puck, type: 'pulse' });
      break;

    case 1: // Sniper
      for (let i = 0; i < 3; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * scale, 0.03 * scale, 0.3 * scale, 6), metalMat);
        const angle = (i / 3) * Math.PI * 2;
        leg.position.set(Math.cos(angle) * 0.12 * scale, 0.18 * scale, Math.sin(angle) * 0.12 * scale);
        leg.rotation.x = Math.cos(angle) * 0.4;
        leg.rotation.z = Math.sin(angle) * 0.4;
        group.add(leg);
      }

      const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.15 * scale, 0.12 * scale, 0.35 * scale), bodyMat);
      rifleBody.position.y = 0.4 * scale;
      rifleBody.castShadow = true;
      group.add(rifleBody);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.03 * scale, 0.5 * scale, 16), metalMat);
      barrel.position.set(0, 0.4 * scale, 0.4 * scale);
      barrel.rotation.x = Math.PI / 2;
      group.add(barrel);

      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 0.15 * scale, 16), darkMat);
      scope.position.set(0, 0.52 * scale, 0.1 * scale);
      scope.rotation.x = Math.PI / 2;
      group.add(scope);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03 * scale, 12), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      lens.position.set(0, 0.52 * scale, 0.18 * scale);
      group.add(lens);

      const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.005 * scale, 0.005 * scale, 0.8 * scale, 16), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 }));
      laser.position.set(0, 0.52 * scale, 0.55 * scale);
      laser.rotation.x = Math.PI / 2;
      group.add(laser);
      group.userData.animParts.push({ mesh: laser, type: 'blink' });
      break;

    case 2: // Enforcer
      const enfBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 0.4 * scale, 16), bodyMat);
      enfBody.position.y = 0.32 * scale;
      enfBody.castShadow = true;
      group.add(enfBody);

      const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.12 * scale, 0.2 * scale), bodyMat);
      shoulders.position.y = 0.52 * scale;
      group.add(shoulders);

      const enfHead = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), whiteMat);
      enfHead.position.y = 0.68 * scale;
      group.add(enfHead);

      const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.2, roughness: 0.8 }));
      gloveL.position.set(-0.35 * scale, 0.5 * scale, 0.1 * scale);
      gloveL.castShadow = true;
      group.add(gloveL);
      group.userData.animParts.push({ mesh: gloveL, type: 'punch', side: -1 });

      const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.2, roughness: 0.8 }));
      gloveR.position.set(0.35 * scale, 0.5 * scale, 0.1 * scale);
      gloveR.castShadow = true;
      group.add(gloveR);
      group.userData.animParts.push({ mesh: gloveR, type: 'punch', side: 1 });

      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry((0.15 + i * 0.08) * scale, 0.015 * scale, 6, 20), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 - i * 0.1 }));
        ring.position.set(0.4 * scale, 0.5 * scale, 0.2 * scale);
        ring.rotation.y = Math.PI / 2;
        group.add(ring);
      }
      break;

    case 3: // Ice Spray
      const zambBody = new THREE.Mesh(new THREE.BoxGeometry(0.4 * scale, 0.25 * scale, 0.5 * scale), bodyMat);
      zambBody.position.y = 0.25 * scale;
      zambBody.castShadow = true;
      group.add(zambBody);

      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.18 * scale, 0.2 * scale), whiteMat);
      cab.position.set(0, 0.42 * scale, -0.1 * scale);
      group.add(cab);

      const window1 = new THREE.Mesh(new THREE.PlaneGeometry(0.08 * scale, 0.08 * scale), new THREE.MeshBasicMaterial({ color: 0x88ccff }));
      window1.position.set(0.126 * scale, 0.44 * scale, -0.1 * scale);
      window1.rotation.y = Math.PI / 2;
      group.add(window1);

      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.35 * scale, 16), glowMat);
      tank.position.set(0, 0.3 * scale, 0.15 * scale);
      tank.rotation.x = Math.PI / 2;
      group.add(tank);

      for (let i = 0; i < 5; i++) {
        const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.03 * scale, 0.1 * scale, 6), glowMat);
        nozzle.position.set((i - 2) * 0.08 * scale, 0.18 * scale, 0.35 * scale);
        nozzle.rotation.x = -Math.PI / 2;
        group.add(nozzle);
      }

      for (let i = 0; i < 8; i++) {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.025 * scale, 0), glowMat);
        crystal.position.set((Math.random() - 0.5) * 0.3 * scale, 0.35 * scale + Math.random() * 0.2 * scale, 0.4 * scale + Math.random() * 0.15 * scale);
        group.add(crystal);
        group.userData.animParts.push({ mesh: crystal, type: 'float', offset: i });
      }
      break;

    case 4: // Goalie
      const padL = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.4 * scale, 0.15 * scale), whiteMat);
      padL.position.set(-0.1 * scale, 0.3 * scale, 0.08 * scale);
      padL.castShadow = true;
      group.add(padL);

      const padR = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.4 * scale, 0.15 * scale), whiteMat);
      padR.position.set(0.1 * scale, 0.3 * scale, 0.08 * scale);
      padR.castShadow = true;
      group.add(padR);

      const goalieBody = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.3 * scale, 0.2 * scale), bodyMat);
      goalieBody.position.y = 0.55 * scale;
      goalieBody.castShadow = true;
      group.add(goalieBody);

      const blocker = new THREE.Mesh(new THREE.BoxGeometry(0.18 * scale, 0.22 * scale, 0.04 * scale), whiteMat);
      blocker.position.set(-0.28 * scale, 0.5 * scale, 0.12 * scale);
      group.add(blocker);

      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), bodyMat);
      glove.position.set(0.28 * scale, 0.55 * scale, 0.12 * scale);
      glove.scale.set(1, 1, 0.6);
      group.add(glove);

      const mask = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 24, 24), whiteMat);
      mask.position.y = 0.78 * scale;
      group.add(mask);

      for (let i = 0; i < 5; i++) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.13 * scale, 16), metalMat);
        bar.position.set((i - 2) * 0.025 * scale, 0.76 * scale, 0.1 * scale);
        bar.rotation.x = Math.PI / 2;
        group.add(bar);
      }
      break;

    case 5: // Power Play
      const coilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 0.2 * scale, 16), metalMat);
      coilBase.position.y = 0.2 * scale;
      coilBase.castShadow = true;
      group.add(coilBase);

      const coilTower = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.15 * scale, 0.5 * scale, 16), bodyMat);
      coilTower.position.y = 0.5 * scale;
      group.add(coilTower);

      for (let i = 0; i < 6; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry((0.12 - i * 0.01) * scale, 0.015 * scale, 8, 24), glowMat);
        ring.position.y = (0.3 + i * 0.08) * scale;
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        group.userData.animParts.push({ mesh: ring, type: 'spin', speed: 1 + i * 0.5 });
      }

      const electrode = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), glowMat);
      electrode.position.y = 0.85 * scale;
      group.add(electrode);
      group.userData.animParts.push({ mesh: electrode, type: 'pulse' });

      for (let i = 0; i < 4; i++) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.2 * scale, 16), metalMat);
        const angle = (i / 4) * Math.PI * 2;
        rod.position.set(Math.cos(angle) * 0.18 * scale, 0.35 * scale, Math.sin(angle) * 0.18 * scale);
        group.add(rod);

        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 24, 24), glowMat);
        tip.position.set(Math.cos(angle) * 0.18 * scale, 0.46 * scale, Math.sin(angle) * 0.18 * scale);
        group.add(tip);
      }
      break;

    case 6: // Hot Stick
      const furnace = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.3 * scale, 16), darkMat);
      furnace.position.y = 0.25 * scale;
      furnace.castShadow = true;
      group.add(furnace);

      for (let i = 0; i < 4; i++) {
        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.12 * scale, 0.02 * scale, 0.04 * scale), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
        vent.position.set(0, 0.2 * scale + i * 0.06 * scale, 0.2 * scale);
        group.add(vent);
      }

      const nozzle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 0.15 * scale, 16), metalMat);
      nozzle2.position.y = 0.48 * scale;
      group.add(nozzle2);

      const flameMat1 = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.9 });
      const flameMat3 = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.7 });

      for (let i = 0; i < 5; i++) {
        const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.06 * scale, 0.25 * scale, 8), flameMat1);
        const angle = (i / 5) * Math.PI * 2;
        flame1.position.set(Math.cos(angle) * 0.04 * scale, 0.7 * scale, Math.sin(angle) * 0.04 * scale);
        group.add(flame1);
        group.userData.animParts.push({ mesh: flame1, type: 'flame', offset: i });
      }

      const bigFlame = new THREE.Mesh(new THREE.ConeGeometry(0.08 * scale, 0.35 * scale, 8), flameMat3);
      bigFlame.position.y = 0.75 * scale;
      group.add(bigFlame);
      group.userData.animParts.push({ mesh: bigFlame, type: 'flame', offset: 0 });
      break;

    case 7: // Captain
      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.35 * scale, 0.15 * scale, 0.35 * scale), darkMat);
      pedestal.position.y = 0.19 * scale;
      pedestal.castShadow = true;
      group.add(pedestal);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 0.25 * scale, 16), goldMat);
      stem.position.y = 0.4 * scale;
      group.add(stem);

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.1 * scale, 0.25 * scale, 16), goldMat);
      cup.position.y = 0.65 * scale;
      cup.castShadow = true;
      group.add(cup);

      for (let i = 0; i < 2; i++) {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06 * scale, 0.015 * scale, 6, 12, Math.PI), goldMat);
        handle.position.set((i === 0 ? -0.22 : 0.22) * scale, 0.65 * scale, 0);
        handle.rotation.y = (i === 0 ? -Math.PI / 2 : Math.PI / 2);
        group.add(handle);
      }

      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.1 * scale, 0.06 * scale, 16), goldMat);
      crownBase.position.y = 0.82 * scale;
      group.add(crownBase);

      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.025 * scale, 0.1 * scale, 4), goldMat);
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * 0.08 * scale, 0.9 * scale, Math.sin(angle) * 0.08 * scale);
        group.add(spike);
      }

      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04 * scale, 0), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      gem.position.y = 0.95 * scale;
      group.add(gem);
      group.userData.animParts.push({ mesh: gem, type: 'spin', speed: 2 });

      for (let i = 0; i < 6; i++) {
        const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.02 * scale, 0), goldMat);
        const angle = (i / 6) * Math.PI * 2;
        sparkle.position.set(Math.cos(angle) * 0.25 * scale, 0.7 * scale + Math.sin(angle * 2) * 0.1 * scale, Math.sin(angle) * 0.25 * scale);
        group.add(sparkle);
        group.userData.animParts.push({ mesh: sparkle, type: 'orbit', offset: i, radius: 0.25 * scale });
      }
      break;
  }
}

function buildSoccerTowerMesh(group, idx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color) {
  group.userData.animParts = [];

  switch (idx) {
    case 0: // Striker
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.3 * scale, 16), whiteMat);
      legL.position.set(-0.08 * scale, 0.25 * scale, 0);
      group.add(legL);

      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.3 * scale, 16), whiteMat);
      legR.position.set(0.08 * scale, 0.25 * scale, 0.1 * scale);
      legR.rotation.x = -0.5;
      group.add(legR);

      const strikerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.3 * scale, 16), bodyMat);
      strikerBody.position.y = 0.5 * scale;
      strikerBody.castShadow = true;
      group.add(strikerBody);

      const strikerHead = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 24, 24), whiteMat);
      strikerHead.position.y = 0.72 * scale;
      group.add(strikerHead);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.05 * scale, 0.15 * scale), bodyMat);
      boot.position.set(0.08 * scale, 0.12 * scale, 0.2 * scale);
      group.add(boot);

      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 24, 24), whiteMat);
      ball.position.set(0.1 * scale, 0.15 * scale, 0.35 * scale);
      group.add(ball);
      group.userData.animParts.push({ mesh: ball, type: 'pulse' });

      for (let i = 0; i < 6; i++) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(0.02 * scale, 5), darkMat);
        const phi = Math.acos(-1 + (2 * i + 1) / 6);
        const theta = Math.sqrt(6 * Math.PI) * phi;
        patch.position.setFromSphericalCoords(0.072 * scale, phi, theta);
        patch.position.x += 0.1 * scale;
        patch.position.y += 0.15 * scale;
        patch.position.z += 0.35 * scale;
        patch.lookAt(0.1 * scale, 0.15 * scale, 0.35 * scale);
        group.add(patch);
      }
      break;

    case 1: // Free Kick
      const teeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 0.12 * scale, 16), darkMat);
      teeBase.position.y = 0.16 * scale;
      teeBase.castShadow = true;
      group.add(teeBase);

      const fkBall = new THREE.Mesh(new THREE.SphereGeometry(0.12 * scale, 24, 24), whiteMat);
      fkBall.position.y = 0.35 * scale;
      fkBall.castShadow = true;
      group.add(fkBall);

      for (let i = 0; i < 12; i++) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(0.035 * scale, 5), darkMat);
        const phi = Math.acos(-1 + (2 * i + 1) / 12);
        const theta = Math.sqrt(12 * Math.PI) * phi;
        patch.position.setFromSphericalCoords(0.122 * scale, phi, theta);
        patch.position.y += 0.35 * scale;
        patch.lookAt(0, 0.35 * scale, 0);
        group.add(patch);
      }

      const targetArm = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.04 * scale, 0.4 * scale), metalMat);
      targetArm.position.set(0, 0.55 * scale, 0.2 * scale);
      group.add(targetArm);

      const laserSight = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.6 * scale, 16), new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 }));
      laserSight.position.set(0, 0.55 * scale, 0.7 * scale);
      laserSight.rotation.x = Math.PI / 2;
      group.add(laserSight);
      group.userData.animParts.push({ mesh: laserSight, type: 'blink' });

      const reticle = new THREE.Mesh(new THREE.RingGeometry(0.08 * scale, 0.1 * scale, 24), glowMat);
      reticle.position.set(0, 0.55 * scale, 1.0 * scale);
      reticle.rotation.y = Math.PI / 2;
      group.add(reticle);
      group.userData.animParts.push({ mesh: reticle, type: 'spin', speed: 1 });
      break;

    case 2: // Header
      const headerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.35 * scale, 16), bodyMat);
      headerBody.position.set(0, 0.45 * scale, 0.1 * scale);
      headerBody.rotation.x = 0.8;
      headerBody.castShadow = true;
      group.add(headerBody);

      const headerHead = new THREE.Mesh(new THREE.SphereGeometry(0.1 * scale, 24, 24), whiteMat);
      headerHead.position.set(0, 0.55 * scale, 0.35 * scale);
      headerHead.castShadow = true;
      group.add(headerHead);

      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.25 * scale, 6), bodyMat);
      armL.position.set(-0.2 * scale, 0.5 * scale, 0.15 * scale);
      armL.rotation.z = 0.8;
      group.add(armL);

      const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.25 * scale, 6), bodyMat);
      armR.position.set(0.2 * scale, 0.5 * scale, 0.15 * scale);
      armR.rotation.z = -0.8;
      group.add(armR);

      for (let i = 0; i < 3; i++) {
        const impactRing = new THREE.Mesh(new THREE.TorusGeometry((0.12 + i * 0.08) * scale, 0.012 * scale, 6, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 - i * 0.1 }));
        impactRing.position.set(0, 0.55 * scale, 0.45 * scale);
        impactRing.rotation.x = Math.PI / 2;
        group.add(impactRing);
      }
      break;

    case 3: // Tackle
      for (let i = 0; i < 5; i++) {
        const dust = new THREE.Mesh(new THREE.SphereGeometry((0.06 - i * 0.01) * scale, 24, 24), new THREE.MeshBasicMaterial({ color: 0x8b7355, transparent: true, opacity: 0.4 - i * 0.07 }));
        dust.position.set(-0.15 * scale + i * 0.08 * scale, 0.12 * scale, (Math.random() - 0.5) * 0.1 * scale);
        group.add(dust);
      }

      const slideBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.12 * scale, 0.3 * scale, 16), bodyMat);
      slideBody.position.set(-0.05 * scale, 0.22 * scale, 0);
      slideBody.rotation.z = Math.PI / 2;
      slideBody.castShadow = true;
      group.add(slideBody);

      const extLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.35 * scale, 16), whiteMat);
      extLeg.position.set(0.2 * scale, 0.18 * scale, 0);
      extLeg.rotation.z = Math.PI / 2;
      group.add(extLeg);

      const tackleBoot = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.06 * scale, 0.08 * scale), bodyMat);
      tackleBoot.position.set(0.38 * scale, 0.18 * scale, 0);
      group.add(tackleBoot);

      for (let i = 0; i < 4; i++) {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * scale, 0.015 * scale, 0.03 * scale, 6), glowMat);
        stud.position.set(0.38 * scale, 0.14 * scale, (i - 1.5) * 0.02 * scale);
        group.add(stud);
      }
      break;

    case 4: // Keeper
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.6 * scale, 16), whiteMat);
      postL.position.set(-0.25 * scale, 0.4 * scale, 0);
      group.add(postL);

      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.6 * scale, 16), whiteMat);
      postR.position.set(0.25 * scale, 0.4 * scale, 0);
      group.add(postR);

      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.5 * scale, 16), whiteMat);
      crossbar.position.y = 0.7 * scale;
      crossbar.rotation.z = Math.PI / 2;
      group.add(crossbar);

      const keeperBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.12 * scale, 0.3 * scale, 16), bodyMat);
      keeperBody.position.set(0.1 * scale, 0.45 * scale, 0.1 * scale);
      keeperBody.rotation.z = -0.6;
      keeperBody.castShadow = true;
      group.add(keeperBody);

      const gloveL2 = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.12 * scale, 0.06 * scale), glowMat);
      gloveL2.position.set(-0.1 * scale, 0.6 * scale, 0.15 * scale);
      group.add(gloveL2);

      const gloveR2 = new THREE.Mesh(new THREE.BoxGeometry(0.1 * scale, 0.12 * scale, 0.06 * scale), glowMat);
      gloveR2.position.set(0.3 * scale, 0.6 * scale, 0.15 * scale);
      group.add(gloveR2);
      group.userData.animParts.push({ mesh: gloveR2, type: 'reach' });
      break;

    case 5: // Playmaker
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 0.15 * scale, 16), darkMat);
      platform.position.y = 0.18 * scale;
      platform.castShadow = true;
      group.add(platform);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.1 * scale, 16), metalMat);
      hub.position.y = 0.32 * scale;
      group.add(hub);
      group.userData.animParts.push({ mesh: hub, type: 'spin', speed: 1 });

      for (let i = 0; i < 2; i++) {
        const orbit = new THREE.Mesh(new THREE.TorusGeometry(0.25 * scale, 0.01 * scale, 8, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 }));
        orbit.position.y = 0.45 * scale;
        orbit.rotation.x = Math.PI / 2 + i * 0.5;
        group.add(orbit);
      }

      for (let i = 0; i < 3; i++) {
        const orbitBall = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 24, 24), whiteMat);
        const angle = (i / 3) * Math.PI * 2;
        orbitBall.position.set(Math.cos(angle) * 0.25 * scale, 0.45 * scale, Math.sin(angle) * 0.25 * scale);
        group.add(orbitBall);
        group.userData.animParts.push({ mesh: orbitBall, type: 'orbit', offset: i, radius: 0.25 * scale });

        for (let j = 0; j < 3; j++) {
          const patch = new THREE.Mesh(new THREE.CircleGeometry(0.015 * scale, 5), darkMat);
          const phi = Math.acos(-1 + (2 * j + 1) / 3);
          const theta = Math.sqrt(3 * Math.PI) * phi;
          patch.position.setFromSphericalCoords(0.062 * scale, phi, theta);
          patch.position.x += orbitBall.position.x;
          patch.position.y += orbitBall.position.y;
          patch.position.z += orbitBall.position.z;
          patch.lookAt(orbitBall.position);
          group.add(patch);
        }
      }

      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.08 * scale, 0), glowMat);
      core.position.y = 0.5 * scale;
      group.add(core);
      group.userData.animParts.push({ mesh: core, type: 'pulse' });
      break;

    case 6: // Flare
      const launcherBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.2 * scale, 16), darkMat);
      launcherBase.position.y = 0.2 * scale;
      launcherBase.castShadow = true;
      group.add(launcherBase);

      for (let i = 0; i < 3; i++) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * scale, 0.06 * scale, 0.25 * scale, 16), metalMat);
        tube.position.set((i - 1) * 0.1 * scale, 0.42 * scale, 0);
        tube.rotation.x = -0.2;
        group.add(tube);
      }

      const flareMat1 = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.9 });
      const flareMat2 = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const flare = new THREE.Mesh(new THREE.ConeGeometry((0.04 - j * 0.01) * scale, (0.15 + j * 0.1) * scale, 8), j % 2 === 0 ? flareMat1 : flareMat2);
          flare.position.set((i - 1) * 0.1 * scale, (0.6 + j * 0.1) * scale, 0.05 * scale);
          group.add(flare);
          group.userData.animParts.push({ mesh: flare, type: 'flame', offset: i * 3 + j });
        }
      }

      for (let i = 0; i < 4; i++) {
        const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.04 * scale, 24, 24), new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.3 }));
        smoke.position.set((Math.random() - 0.5) * 0.2 * scale, 0.9 * scale + i * 0.08 * scale, (Math.random() - 0.5) * 0.1 * scale);
        group.add(smoke);
        group.userData.animParts.push({ mesh: smoke, type: 'float', offset: i });
      }
      break;

    case 7: // Legend
      const legendPed = new THREE.Mesh(new THREE.BoxGeometry(0.4 * scale, 0.12 * scale, 0.4 * scale), darkMat);
      legendPed.position.y = 0.16 * scale;
      legendPed.castShadow = true;
      group.add(legendPed);

      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.06 * scale, 0.02 * scale), goldMat);
      plaque.position.set(0, 0.18 * scale, 0.2 * scale);
      group.add(plaque);

      const figBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 0.08 * scale, 16), goldMat);
      figBase.position.y = 0.27 * scale;
      group.add(figBase);

      const figBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 0.3 * scale, 16), goldMat);
      figBody.position.y = 0.48 * scale;
      figBody.castShadow = true;
      group.add(figBody);

      const figHead = new THREE.Mesh(new THREE.SphereGeometry(0.07 * scale, 24, 24), goldMat);
      figHead.position.y = 0.7 * scale;
      group.add(figHead);

      const figArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.03 * scale, 0.2 * scale, 6), goldMat);
      figArmL.position.set(-0.12 * scale, 0.7 * scale, 0);
      figArmL.rotation.z = 0.6;
      group.add(figArmL);

      const figArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.03 * scale, 0.2 * scale, 6), goldMat);
      figArmR.position.set(0.12 * scale, 0.7 * scale, 0);
      figArmR.rotation.z = -0.6;
      group.add(figArmR);

      const legendCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.06 * scale, 0.05 * scale, 6), goldMat);
      legendCrown.position.y = 0.8 * scale;
      group.add(legendCrown);

      for (let i = 0; i < 5; i++) {
        const crownSpike = new THREE.Mesh(new THREE.ConeGeometry(0.015 * scale, 0.06 * scale, 4), goldMat);
        const angle = (i / 5) * Math.PI * 2;
        crownSpike.position.set(Math.cos(angle) * 0.05 * scale, 0.86 * scale, Math.sin(angle) * 0.05 * scale);
        group.add(crownSpike);
      }

      for (let i = 0; i < 3; i++) {
        const aura = new THREE.Mesh(new THREE.TorusGeometry((0.2 + i * 0.1) * scale, 0.01 * scale, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 - i * 0.08 }));
        aura.position.y = (0.5 + i * 0.15) * scale;
        aura.rotation.x = Math.PI / 2;
        group.add(aura);
        group.userData.animParts.push({ mesh: aura, type: 'pulse', offset: i });
      }

      for (let i = 0; i < 8; i++) {
        const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.02 * scale, 0), goldMat);
        const angle = (i / 8) * Math.PI * 2;
        sparkle.position.set(Math.cos(angle) * 0.3 * scale, 0.5 * scale + Math.sin(angle * 2) * 0.15 * scale, Math.sin(angle) * 0.3 * scale);
        group.add(sparkle);
        group.userData.animParts.push({ mesh: sparkle, type: 'orbit', offset: i, radius: 0.3 * scale });
      }
      break;
  }
}

function buildSpaceTowerMesh(group, idx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color) {
  group.userData.animParts = group.userData.animParts || [];
  const parts = group.userData.animParts;

  const coreMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const add = (geo, mat, x, y, z, shadow = false) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x * scale, y * scale, z * scale);
    mesh.castShadow = shadow;
    group.add(mesh);
    return mesh;
  };

  // A drum every space tower stands on; what goes on top is unique per tower.
  const drum = (radius = 0.2, height = 0.16) =>
    add(new THREE.CylinderGeometry(radius * scale, radius * 1.2 * scale, height * scale, 12), darkMat, 0, 0.2 + height / 2, 0, true);

  const crystal = (y, radius = 0.14) => {
    const core = add(new THREE.OctahedronGeometry(radius * scale, 1), coreMat, 0, y, 0);
    parts.push({ mesh: core, type: 'spin', speed: 1.4 });
    parts.push({ mesh: core, type: 'pulse' });
    return core;
  };

  switch (idx) {
    case 0: { // Laser Emitter — slim mast, forward lens
      drum(0.16, 0.12);
      add(new THREE.CylinderGeometry(0.06 * scale, 0.1 * scale, 0.5 * scale, 10), metalMat, 0, 0.55, 0, true);
      const lensHousing = add(new THREE.CylinderGeometry(0.12 * scale, 0.1 * scale, 0.26 * scale, 12), bodyMat, 0, 0.84, 0.05, true);
      lensHousing.rotation.x = Math.PI / 2;
      const lens = add(new THREE.CylinderGeometry(0.085 * scale, 0.085 * scale, 0.04 * scale, 12), coreMat, 0, 0.84, 0.2);
      lens.rotation.x = Math.PI / 2;
      parts.push({ mesh: lens, type: 'pulse' });
      break;
    }

    case 1: { // Plasma Cannon — fat low barrel
      const body = add(new THREE.CylinderGeometry(0.22 * scale, 0.28 * scale, 0.3 * scale, 12), bodyMat, 0, 0.35, 0, true);
      body.castShadow = true;
      const barrel = add(new THREE.CylinderGeometry(0.1 * scale, 0.14 * scale, 0.62 * scale, 12), metalMat, 0, 0.56, 0.26, true);
      barrel.rotation.x = Math.PI / 2;
      const muzzle = add(new THREE.TorusGeometry(0.13 * scale, 0.028 * scale, 8, 20), coreMat, 0, 0.56, 0.58);
      parts.push({ mesh: muzzle, type: 'pulse' });
      for (const side of [-1, 1]) {
        add(new THREE.BoxGeometry(0.05 * scale, 0.14 * scale, 0.34 * scale), darkMat, side * 0.17, 0.56, 0.12);
      }
      break;
    }

    case 2: { // Gravity Well — gyroscope of nested rings
      drum(0.18, 0.14);
      crystal(0.72, 0.1);
      for (let i = 0; i < 3; i++) {
        const ring = add(new THREE.TorusGeometry((0.2 + i * 0.07) * scale, 0.02 * scale, 6, 28), coreMat, 0, 0.72, 0);
        ring.rotation.x = Math.PI / 2 + i * 0.9;
        ring.rotation.z = i * 0.7;
        parts.push({ mesh: ring, type: 'spin', speed: 0.8 + i * 0.4 });
      }
      break;
    }

    case 3: { // Ion Snare — a tuning fork with a ball of ions caught between the prongs
      drum(0.2, 0.14);
      add(new THREE.CylinderGeometry(0.07 * scale, 0.1 * scale, 0.22 * scale, 8), metalMat, 0, 0.45, 0, true);
      for (const side of [-1, 1]) {
        const prong = add(new THREE.BoxGeometry(0.06 * scale, 0.5 * scale, 0.1 * scale), bodyMat, side * 0.2, 0.78, 0, true);
        prong.rotation.z = -side * 0.22;
        const tip = add(new THREE.SphereGeometry(0.05 * scale, 8, 6), coreMat, side * 0.26, 1.04, 0);
        parts.push({ mesh: tip, type: 'pulse', offset: side });
      }
      add(new THREE.BoxGeometry(0.46 * scale, 0.06 * scale, 0.12 * scale), metalMat, 0, 0.56, 0);
      const ion = add(new THREE.IcosahedronGeometry(0.11 * scale, 1), coreMat, 0, 0.84, 0);
      parts.push({ mesh: ion, type: 'pulse' });
      break;
    }

    case 4: { // Shield Node — squat bunker under an energy dome
      add(new THREE.CylinderGeometry(0.3 * scale, 0.34 * scale, 0.2 * scale, 6), bodyMat, 0, 0.3, 0, true);
      add(new THREE.CylinderGeometry(0.2 * scale, 0.26 * scale, 0.12 * scale, 6), metalMat, 0, 0.46, 0, true);
      const domeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const dome = add(new THREE.SphereGeometry(0.4 * scale, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, 0, 0.3, 0);
      parts.push({ mesh: dome, type: 'pulse' });
      // Emitter fins round the rim.
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const fin = add(new THREE.BoxGeometry(0.04 * scale, 0.2 * scale, 0.08 * scale), darkMat, Math.cos(a) * 0.3, 0.42, Math.sin(a) * 0.3);
        fin.rotation.y = -a;
      }
      add(new THREE.SphereGeometry(0.08 * scale, 10, 8), coreMat, 0, 0.56, 0);
      break;
    }

    case 5: { // Arc Relay — tesla coil
      drum(0.2, 0.14);
      add(new THREE.CylinderGeometry(0.05 * scale, 0.09 * scale, 0.56 * scale, 8), metalMat, 0, 0.62, 0, true);
      for (let i = 0; i < 4; i++) {
        add(new THREE.TorusGeometry((0.17 - i * 0.025) * scale, 0.022 * scale, 6, 18), bodyMat, 0, 0.46 + i * 0.12, 0, true).rotation.x = Math.PI / 2;
      }
      const top = add(new THREE.SphereGeometry(0.13 * scale, 12, 10), coreMat, 0, 0.98, 0);
      parts.push({ mesh: top, type: 'pulse' });
      break;
    }

    case 6: { // Nova Flare — triple mortar angled skyward
      add(new THREE.CylinderGeometry(0.24 * scale, 0.28 * scale, 0.2 * scale, 8), bodyMat, 0, 0.3, 0, true);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const tube = add(new THREE.CylinderGeometry(0.075 * scale, 0.09 * scale, 0.42 * scale, 10), metalMat, Math.sin(a) * 0.11, 0.56, Math.cos(a) * 0.11 + 0.06, true);
        tube.rotation.x = 0.5;
        tube.rotation.z = -Math.sin(a) * 0.3;
        const mouth = add(new THREE.SphereGeometry(0.06 * scale, 8, 6), coreMat, Math.sin(a) * 0.15, 0.75, Math.cos(a) * 0.13 + 0.17);
        parts.push({ mesh: mouth, type: 'pulse', offset: i * 2 });
      }
      break;
    }

    default: { // Command Core — tall obelisk, gold halo rings, crowned with a star
      add(new THREE.CylinderGeometry(0.24 * scale, 0.28 * scale, 0.14 * scale, 4), darkMat, 0, 0.27, 0, true).rotation.y = Math.PI / 4;
      add(new THREE.CylinderGeometry(0.07 * scale, 0.17 * scale, 0.74 * scale, 4), bodyMat, 0, 0.7, 0, true).rotation.y = Math.PI / 4;
      for (let i = 0; i < 2; i++) {
        const halo = add(new THREE.TorusGeometry((0.26 - i * 0.07) * scale, 0.018 * scale, 6, 24), goldMat, 0, 0.62 + i * 0.26, 0);
        halo.rotation.x = Math.PI / 2 + (i ? -0.35 : 0.35);
        parts.push({ mesh: halo, type: 'spin', speed: i ? -0.9 : 0.7 });
      }
      const star = add(new THREE.OctahedronGeometry(0.13 * scale, 0), goldMat, 0, 1.2, 0, true);
      star.scale.set(1, 1.5, 1);
      parts.push({ mesh: star, type: 'spin', speed: 1.2 });
      const spark = add(new THREE.SphereGeometry(0.2 * scale, 10, 8), coreMat, 0, 1.2, 0);
      spark.material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
      parts.push({ mesh: spark, type: 'pulse' });
    }
  }
}
