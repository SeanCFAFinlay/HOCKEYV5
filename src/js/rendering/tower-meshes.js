// Tower mesh creation with enhanced visuals

import { getState } from '../engine/state.js';
import { makeCapsule } from '../utils/math.js';
import { getVisualProfile } from '../config/visual-profiles.js';
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
 * The reference-art command platform every tower sits on: a round, faceted navy
 * disc with a chamfered top, glowing LED strips inset in the rim, red accent
 * panels, chrome rivets, and an icy top surface carrying a red face-off ring.
 * Modelled on the supplied hockey tower renders; accent colours track the theme.
 *
 * Assigns tower.baseGlow and tower.baseRim, which the firing flash pulses.
 *
 * @param {THREE.Group} group
 * @param {object} tower
 * @param {number} scale
 * @param {object} visuals - active visual profile
 * @param {string} theme
 * @param {THREE.Color} color - tower accent colour
 * @param {number} lv - upgrade level
 */
function buildTowerBase(group, tower, scale, visuals, theme, color, lv) {
  const isHockey = theme === 'hockey';
  // Brighter navy than the very-dark profile base so the platform reads as a
  // solid object, matching the reference. Non-hockey themes keep their own hue.
  const platformColor = isHockey ? 0x1c3a63 : visuals.towers.base;
  const ledColor = visuals.towers.levelGlow ?? 0x00d4ff;
  const redAccent = 0xd42f2f;
  const R = 0.52 * scale;

  // Main faceted platform body.
  const platMat = new THREE.MeshStandardMaterial({
    color: platformColor, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.7
  });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.08, 0.16, 20), platMat);
  platform.position.y = 0.08;
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  // Chamfered top lip, a touch lighter for edge definition.
  const lipMat = new THREE.MeshStandardMaterial({
    color: isHockey ? 0x24487a : platformColor, metalness: 0.6, roughness: 0.35, envMapIntensity: 0.8
  });
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R, 0.04, 20), lipMat);
  lip.position.y = 0.17;
  group.add(lip);

  // Icy top surface the character/turret stands on.
  const iceTopMat = new THREE.MeshStandardMaterial({
    color: 0xcfe8f6, metalness: 0.1, roughness: 0.22, envMapIntensity: 0.6
  });
  const iceTop = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.82, R * 0.82, 0.02, 32), iceTopMat);
  iceTop.position.y = 0.2;
  iceTop.receiveShadow = true;
  group.add(iceTop);

  // Red face-off ring on the ice, like the reference platforms.
  const faceoff = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.55, 0.012 * scale, 8, 40),
    new THREE.MeshBasicMaterial({ color: redAccent })
  );
  faceoff.rotation.x = Math.PI / 2;
  faceoff.position.y = 0.212;
  group.add(faceoff);

  // Glowing LED strips inset around the rim — the platform's signature.
  const ledMat = new THREE.MeshBasicMaterial({ color: ledColor, blending: THREE.AdditiveBlending, depthWrite: false });
  const redPanelMat = new THREE.MeshStandardMaterial({ color: redAccent, metalness: 0.3, roughness: 0.5, emissive: redAccent, emissiveIntensity: 0.25 });
  const rivetMat = new THREE.MeshStandardMaterial({ color: visuals.towers.metal, metalness: 0.9, roughness: 0.12 });
  const segCount = 8;
  for (let i = 0; i < segCount; i++) {
    const a = (i / segCount) * Math.PI * 2;
    const nx = Math.cos(a), nz = Math.sin(a);
    // Every third segment is a red accent panel; the rest are blue LED strips.
    if (i % 3 === 1) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.03 * scale, 0.1, 0.14 * scale), redPanelMat);
      panel.position.set(nx * R * 1.02, 0.08, nz * R * 1.02);
      panel.rotation.y = -a;
      group.add(panel);
    } else {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.02 * scale, 0.03, 0.13 * scale), ledMat);
      led.position.set(nx * R * 1.03, 0.1, nz * R * 1.03);
      led.rotation.y = -a;
      group.add(led);
    }
    // A chrome rivet above each segment boundary.
    const ra = a + Math.PI / segCount;
    const rivet = new THREE.Mesh(getDetailSphereGeo(), rivetMat);
    rivet.position.set(Math.cos(ra) * R * 1.0, 0.14, Math.sin(ra) * R * 1.0);
    group.add(rivet);
  }

  // Soft underglow puddle on the ice beneath the platform.
  const baseGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.15, R * 1.2, 0.02, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  baseGlow.position.y = 0.012;
  group.add(baseGlow);
  tower.baseGlow = baseGlow;

  // Accent rim the firing flash pulses.
  const baseRim = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.86, 0.016 * scale, 12, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  baseRim.rotation.x = Math.PI / 2;
  baseRim.position.y = 0.205;
  group.add(baseRim);
  tower.baseRim = baseRim;
}

/**
 * Universal high-tech detail added to every tower on top of its per-type build.
 * These read at the game's camera distance where fine geometry would not: a
 * slowly rotating holographic ring, glowing vent segments set into the base rim,
 * and a bright core spark. Kept cheap (shared-ish small geometry, additive
 * glows) and driven through the existing animParts system so it animates with
 * the rest of the tower.
 *
 * @param {THREE.Group} group
 * @param {number} scale
 * @param {THREE.Color} color - tower accent colour
 */
function addTowerDetail(group, scale, color, theme) {
  if (!group.userData.animParts) group.userData.animParts = [];
  const isHockey = theme === 'hockey';
  const GOLD = 0xffd257;

  // Holographic ring hovering just above the base — the clearest "this is a
  // built machine" cue at distance. Gold on hockey to carry the team look from
  // the reference art; the tower's accent colour elsewhere. Spins via 'spin'.
  const holo = new THREE.Mesh(
    new THREE.TorusGeometry(0.3 * scale, 0.01 * scale, 8, 40),
    new THREE.MeshBasicMaterial({ color: isHockey ? GOLD : color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  holo.rotation.x = Math.PI / 2;
  holo.position.y = 0.26;
  group.add(holo);
  group.userData.animParts.push({ mesh: holo, type: 'spin', speed: 0.6 });

  // Bright core spark low in the body, pulsing.
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.05 * scale, 24, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  core.position.y = 0.34 * scale;
  group.add(core);
  group.userData.animParts.push({ mesh: core, type: 'pulse' });

  // Hockey team trim: a solid gold collar band where the figure meets the
  // platform, and gold shoulder studs — the navy/gold/red uniform cue that ties
  // every hockey tower to the reference art regardless of its accent colour.
  if (isHockey) {
    const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.95, roughness: 0.12, emissive: 0x5a3d00, emissiveIntensity: 0.3, envMapIntensity: 1 });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2 * scale, 0.035 * scale, 12, 32), goldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.26 * scale;
    collar.castShadow = true;
    group.add(collar);

    for (let i = 0; i < 2; i++) {
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.05 * scale, 24, 24), goldMat);
      stud.position.set((i ? 1 : -1) * 0.2 * scale, 0.26 * scale, 0);
      group.add(stud);
    }
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
  // Base 1.5 (was 1.15) for real presence at the camera distance — the towers
  // were too small for their detail to read. Only the tower's own geometry keys
  // off `scale`; the range rings use tower.rng directly, so this is purely
  // cosmetic and never misstates range.
  const scale = 1.5 + lv * 0.1;
  const mats = getTowerMaterials();

  // Enhanced materials with emissive glow based on tower color
  const baseMat = new THREE.MeshStandardMaterial({
    color: visuals.towers.base,
    metalness: 0.45,
    roughness: 0.6,
    emissive: visuals.towers.base,
    emissiveIntensity: 0.08 + lv * 0.03
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    // Glossier + a stronger self-glow in the tower's own colour, matching the
    // enemy readability pass. Hockey was emissive 0.10 / roughness 0.56, which
    // read as a flat matte lump against the brighter ice. Emissive still ramps a
    // little with level so upgraded towers glow more.
    metalness: theme === 'hockey' ? 0.3 : 0.5,
    roughness: theme === 'hockey' ? 0.4 : 0.35,
    emissive: color,
    emissiveIntensity: (theme === 'hockey' ? 0.26 : 0.24) + lv * 0.03
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: visuals.towers.metal,
    // Cleaner chrome so it actually reflects the new scene environment.
    metalness: theme === 'space' ? 0.92 : (theme === 'hockey' ? 0.62 : 0.85),
    roughness: theme === 'space' ? 0.12 : (theme === 'hockey' ? 0.28 : 0.18),
    envMapIntensity: 0.9
  });
  const darkMat = mats.dark;
  const whiteMat = mats.white;
  const goldMat = mats.gold;

  // Reference-styled command platform: a round navy sci-fi disc with glowing
  // LED strips, red accent panels, chrome rivets and an icy top carrying a red
  // face-off ring. Sets tower.baseGlow / tower.baseRim for the firing flash.
  buildTowerBase(group, tower, scale, visuals, theme, color, lv);

  // Level indicator stars with glow
  for (let i = 0; i <= lv; i++) {
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), goldMat);
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
    star.position.set(Math.cos(angle) * 0.35 * scale, 0.14, Math.sin(angle) * 0.35 * scale);
    star.rotation.y = Math.PI / 4;
    star.castShadow = true;
    group.add(star);

    // Star glow
    const starGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 })
    );
    starGlow.position.copy(star.position);
    group.add(starGlow);
  }

  // Build tower based on type
  const towerIdx = parseInt(tower.type.substring(1)) - 1;

  if (theme === 'hockey') {
    buildHockeyTowerMesh(group, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color);
  } else if (theme === 'soccer') {
    buildSoccerTowerMesh(group, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color);
  } else {
    buildSpaceTowerMesh(group, towerIdx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color, td.projectile);
  }

  addUpgradeCollars(group, lv, scale, visuals.towers.levelGlow);
  addTowerDetail(group, scale, color, theme);

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

  // Contact shadow — a fake dark circle beneath the tower (all quality tiers)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.8),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.25, transparent: true })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  group.add(shadowPlane);

  // Idle bob animation — applied to all towers on the group level
  // Note: do NOT reset animParts — tower build functions already added entries
  if (!group.userData.animParts) group.userData.animParts = [];
  const bodyChildren = group.children.filter(c =>
    c.geometry instanceof THREE.CylinderGeometry &&
    c.geometry.radialSegments !== 6
  );
  const bobTarget = bodyChildren.length > 0 ? bodyChildren[0] : group.children[2];
  if (bobTarget) {
    group.userData.animParts.push({ mesh: bobTarget, type: 'bob' });
  }

  // Particle emission flags for the animation system
  group.userData.emitParticle = true;
  group.userData.emitInterval = 2000;
  group.userData.emitColor = td.clr;

  group.position.set(tower.x - hw + 0.5, 0.08, tower.y - hh + 0.5);
  scene.add(group);
  tower.animParts = group.userData.animParts || [];

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

function addUpgradeCollars(group, lv, scale, glowColor) {
  group.userData.animParts = group.userData.animParts || [];
  for (let i = 0; i < lv; i++) {
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry((0.5 + i * 0.08) * scale, 0.018, 8, 32),
      new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.24 + i * 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.2 + i * 0.08;
    group.add(collar);
    group.userData.animParts.push({ mesh: collar, type: 'spin', speed: 0.3 + i * 0.15 });
  }
}

function buildSpaceTowerMesh(group, idx, scale, bodyMat, glowMat, metalMat, darkMat, whiteMat, goldMat, color, projectileType) {
  group.userData.animParts = group.userData.animParts || [];

  const coreMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const makeEmitter = (height = 0.62) => {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.13 * scale, height * scale, 16), metalMat);
    mast.position.y = (0.22 + height / 2) * scale;
    mast.castShadow = true;
    group.add(mast);

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.14 * scale, 1), coreMat);
    core.position.y = (0.32 + height) * scale;
    group.add(core);
    group.userData.animParts.push({ mesh: core, type: 'spin', speed: 1.4 });
    group.userData.animParts.push({ mesh: core, type: 'pulse' });
    return core;
  };

  if (projectileType === 'ball' || idx === 0) {
    // Laser emitter
    makeEmitter(0.55);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.08 * scale, 0.18 * scale, 16), coreMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.58 * scale, 0.24 * scale);
    group.add(lens);
    group.userData.animParts.push({ mesh: lens, type: 'blink' });
  } else if (projectileType === 'curveBall' || projectileType === 'flare') {
    // Plasma cannon
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.28 * scale, 0.28 * scale, 16), bodyMat);
    base.position.y = 0.28 * scale;
    group.add(base);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * scale, 0.13 * scale, 0.55 * scale, 16), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.47 * scale, 0.28 * scale);
    group.add(barrel);
    const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.13 * scale, 0.025 * scale, 8, 24), coreMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.47 * scale, 0.58 * scale);
    group.add(muzzle);
    group.userData.animParts.push({ mesh: muzzle, type: 'spin', speed: 1.8 });
  } else if (projectileType === 'headButt') {
    // Gravity ring
    makeEmitter(0.38);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry((0.18 + i * 0.08) * scale, 0.018 * scale, 8, 36), coreMat);
      ring.position.y = (0.5 + i * 0.08) * scale;
      ring.rotation.x = Math.PI / 2 + i * 0.45;
      group.add(ring);
      group.userData.animParts.push({ mesh: ring, type: 'spin', speed: 0.8 + i * 0.35 });
    }
  } else if (projectileType === 'chain') {
    // Arc reactor
    const coil = makeEmitter(0.62);
    for (let i = 0; i < 5; i++) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * scale, 0.018 * scale, 0.34 * scale, 6), metalMat);
      const a = i / 5 * Math.PI * 2;
      rod.position.set(Math.cos(a) * 0.22 * scale, 0.52 * scale, Math.sin(a) * 0.22 * scale);
      rod.rotation.z = Math.PI / 2;
      group.add(rod);
    }
    coil.scale.setScalar(1.2);
  } else {
    // Defensive sci-fi turret fallback
    makeEmitter(0.5);
    const shield = new THREE.Mesh(new THREE.TorusGeometry(0.28 * scale, 0.022 * scale, 8, 32), coreMat);
    shield.rotation.x = Math.PI / 2;
    shield.position.y = 0.36 * scale;
    group.add(shield);
    group.userData.animParts.push({ mesh: shield, type: 'spin', speed: 1 });
  }
}
