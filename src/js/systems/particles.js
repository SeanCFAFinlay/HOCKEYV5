// Particle system with object pooling and enhanced visuals
// Zero-allocation during gameplay

import { getState, addParticle, removeParticle } from '../engine/state.js';
import { getQualityName } from '../rendering/quality.js';

// Particle mesh pool
const meshPool = [];

// Quality-gated pool size (set via initParticlePool)
let MAX_POOL_SIZE = 150;

// Ambient particle sub-pool
const ambientParticles = [];
const MAX_SNOW = 30;
const MAX_GRASS = 10;

// Shared geometries (reused across all particles)
let sharedGeo = null;
let sharedGlowGeo = null;
let sparkGeo = null;
let materialCache = new Map();
let glowMaterialCache = new Map();

// ── Pool Init ─────────────────────────────────────────────────────────────

/**
 * Initialize pool size based on quality tier.
 * Call once at game init or when quality changes.
 */
export function initParticlePool() {
  const quality = getQualityName();
  if (quality === 'high' || quality === 'ultra') {
    MAX_POOL_SIZE = 300;
  } else if (quality === 'medium') {
    MAX_POOL_SIZE = 200;
  } else {
    MAX_POOL_SIZE = 100;
  }
}

// ── Shared Resources ──────────────────────────────────────────────────────

function initSharedResources() {
  if (!sharedGeo) {
    sharedGeo = new THREE.SphereGeometry(0.06, 8, 8);
    sharedGlowGeo = new THREE.SphereGeometry(0.12, 6, 6);
    sparkGeo = new THREE.OctahedronGeometry(0.04, 0);
  }
}

function getMaterial(color) {
  if (materialCache.has(color)) return materialCache.get(color);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1.0 });
  materialCache.set(color, mat);
  return mat;
}

function getGlowMaterial(color) {
  if (glowMaterialCache.has(color)) return glowMaterialCache.get(color);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  glowMaterialCache.set(color, mat);
  return mat;
}

// ── Mesh Pool ─────────────────────────────────────────────────────────────

function acquireMesh(color, withGlow = true, type = 'sphere') {
  initSharedResources();

  let group;

  if (meshPool.length > 0) {
    group = meshPool.pop();
    if (group.children[0]) {
      group.children[0].material = getMaterial(color);
      group.children[0].material.opacity = 1.0;
    }
    if (group.children[1]) {
      group.children[1].material = getGlowMaterial(color);
      group.children[1].visible = withGlow;
    }
    group.visible = true;
    group.scale.setScalar(1);
  } else {
    group = new THREE.Group();
    const geo = type === 'spark' ? sparkGeo : sharedGeo;
    const core = new THREE.Mesh(geo, getMaterial(color));
    group.add(core);
    const glow = new THREE.Mesh(sharedGlowGeo, getGlowMaterial(color));
    glow.visible = withGlow;
    group.add(glow);
  }

  return group;
}

function releaseMesh(mesh) {
  mesh.visible = false;
  if (meshPool.length < MAX_POOL_SIZE) {
    meshPool.push(mesh);
  }
}

// ── Explosion (Multi-stage) ───────────────────────────────────────────────

/**
 * Create multi-stage explosion particles.
 * Stage 1 (0–50ms): bright flash + initial sparks
 * Stage 2 (50–150ms): debris particles with gravity
 * Stage 3 (150–400ms): smoke puffs, slow rising
 */
export function createExplosion(x, y, z, isFire, color) {
  const state = getState();
  const fireColors = [0xff2200, 0xff6600, 0xffaa00, 0xffdd00];
  const baseColor = color || (isFire ? 0xff4400 : 0xff8800);

  _spawnStage1(state, x, y, z, isFire, fireColors, baseColor);
  _spawnStage2(state, x, y, z, isFire, fireColors, baseColor);
  _spawnStage3(state, x, y, z);
}

function _spawnStage1(state, x, y, z, isFire, fireColors, baseColor) {
  // Central flash
  const flashMesh = acquireMesh(0xffffff, true, 'sphere');
  flashMesh.position.set(x, y, z);
  flashMesh.scale.setScalar(0.5);
  state.scene.add(flashMesh);
  addParticle({
    x, y, z,
    vx: 0, vy: 0.5, vz: 0,
    life: 0.15, maxLife: 0.15,
    mesh: flashMesh,
    isFlash: true,
    delay: 0
  });

  // Stage 1 sparks — fast, outward burst (delay < 50ms)
  for (let i = 0; i < 12; i++) {
    const c = isFire ? fireColors[Math.floor(Math.random() * fireColors.length)] : baseColor;
    const angle = (i / 12) * Math.PI * 2;
    const speed = 5 + Math.random() * 4;
    const mesh = acquireMesh(c, true, 'spark');
    mesh.position.set(x, y, z);
    state.scene.add(mesh);
    addParticle({
      x, y, z,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5),
      vy: Math.random() * 6 + 4,
      vz: Math.sin(angle) * speed + (Math.random() - 0.5),
      life: 0.5 + Math.random() * 0.2,
      maxLife: 0.5 + Math.random() * 0.2,
      mesh,
      rotSpeed: (Math.random() - 0.5) * 12,
      delay: 0
    });
  }
}

function _spawnStage2(state, x, y, z, isFire, fireColors, baseColor) {
  // Stage 2 debris — slower, gravity-affected (delay 50–150ms)
  for (let i = 0; i < 9; i++) {
    const c = isFire ? fireColors[Math.floor(Math.random() * fireColors.length)] : baseColor;
    const angle = (i / 6) * Math.PI * 2;
    const speed = 1.5 + Math.random() * 1.5;
    const mesh = acquireMesh(c, false, Math.random() > 0.5 ? 'sphere' : 'spark');
    mesh.position.set(x, y, z);
    state.scene.add(mesh);
    addParticle({
      x, y, z,
      vx: Math.cos(angle) * speed,
      vy: 1 + Math.random() * 2,
      vz: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.2,
      maxLife: 0.5 + Math.random() * 0.2,
      mesh,
      rotSpeed: (Math.random() - 0.5) * 8,
      delay: 0.05 + Math.random() * 0.1
    });
  }
}

function _spawnStage3(state, x, y, z) {
  // Stage 3 smoke — very slow, rising, fading (delay 150–400ms)
  for (let i = 0; i < 4; i++) {
    const mesh = acquireMesh(0x555555, false, 'sphere');
    const sx = x + (Math.random() - 0.5) * 0.3;
    const sy = y + 0.2;
    const sz = z + (Math.random() - 0.5) * 0.3;
    mesh.position.set(sx, sy, sz);
    state.scene.add(mesh);
    addParticle({
      x: sx, y: sy, z: sz,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 1.2 + Math.random() * 0.4,
      vz: (Math.random() - 0.5) * 0.4,
      life: 0.7 + Math.random() * 0.3,
      maxLife: 0.7 + Math.random() * 0.3,
      mesh,
      isSmoke: true,
      delay: 0.15 + Math.random() * 0.25
    });
  }
}

// ── Impact ────────────────────────────────────────────────────────────────

export function createImpact(x, y, z, color) {
  const state = getState();
  const c = color || 0xffffff;

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const speed = 2 + Math.random() * 2;
    const mesh = acquireMesh(c, true, 'spark');
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(0.7);
    state.scene.add(mesh);
    addParticle({
      x, y, z,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5),
      vy: Math.random() * 3 + 1.5,
      vz: Math.sin(angle) * speed + (Math.random() - 0.5),
      life: 0.2 + Math.random() * 0.15,
      maxLife: 0.2 + Math.random() * 0.15,
      mesh,
      rotSpeed: (Math.random() - 0.5) * 15,
      delay: 0
    });
  }

  const ringGeo = new THREE.RingGeometry(0.06, 0.22, 20);
  const ringMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(x, y, z);
  ring.rotation.x = -Math.PI / 2;
  state.scene.add(ring);
  addParticle({
    x, y, z,
    vx: 0, vy: 0.2, vz: 0,
    life: 0.2, maxLife: 0.2,
    mesh: ring,
    isRing: true,
    ringGeo,
    delay: 0
  });
}

// ── Trail Particle ────────────────────────────────────────────────────────

/**
 * Spawn a tiny trail particle at the given position.
 * High-frequency, uses pool efficiently.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} color
 */
export function spawnTrailParticle(x, y, z, color) {
  const state = getState();
  const mesh = acquireMesh(color, false, 'sphere');
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(0.4);
  state.scene.add(mesh);
  addParticle({
    x, y, z,
    vx: 0, vy: 0, vz: 0,
    life: 0.2, maxLife: 0.2,
    mesh,
    isTrail: true,
    delay: 0
  });
}

// ── Ground Ripple (Tower Placement) ──────────────────────────────────────

/**
 * Spawn an expanding ground ring at tower placement position.
 * Ring expands from radius 0.2 to 1.0 over 300ms, opacity fades 0.6 → 0.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 * @param {number} color - Ring color (e.g. 0xffffff)
 */
export function spawnGroundRipple(x, z, color) {
  const state = getState();
  const ringGeo = new THREE.RingGeometry(0.1, 0.25, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: color || 0xffffff,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(x, 0.05, z);
  ring.rotation.x = -Math.PI / 2;
  state.scene.add(ring);
  addParticle({
    x, y: 0.05, z,
    vx: 0, vy: 0, vz: 0,
    life: 0.3, maxLife: 0.3,
    mesh: ring,
    isPlacementRing: true,
    ringGeo,
    delay: 0
  });
}

// ── Tower Dust Burst (Tower Placement) ────────────────────────────────────

/**
 * Spawn 6–8 dust particles at tower base position.
 * Brown/tan color, spread outward with upward velocity, gravity-affected.
 * @param {number} x - World X position
 * @param {number} z - World Z position
 */
export function spawnTowerDust(x, z) {
  const state = getState();
  const count = 6 + Math.floor(Math.random() * 3); // 6, 7, or 8

  for (let i = 0; i < count; i++) {
    const mesh = acquireMesh(0x8B7355, false, 'sphere');
    mesh.position.set(x, 0.05, z);
    mesh.scale.setScalar(0.25);
    state.scene.add(mesh);

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 0.5 + Math.random() * 1.0;
    const lifetime = 0.35 + Math.random() * 0.1;

    addParticle({
      x, y: 0.05, z,
      vx: Math.cos(angle) * speed,
      vy: 0.2 + Math.random() * 0.3,
      vz: Math.sin(angle) * speed,
      life: lifetime,
      maxLife: lifetime,
      mesh,
      isDust: true,
      delay: 0
    });
  }
}

// ── Dust Puff ─────────────────────────────────────────────────────────────

/**
 * Spawn 2–3 dust particles at ground level.
 * @param {number} x
 * @param {number} z
 * @param {number} color - e.g. 0x8B7355 grass, 0xCCDDFF ice
 */
export function spawnDustPuff(x, z, color) {
  const state = getState();
  const count = 2 + Math.floor(Math.random() * 2); // 2 or 3

  for (let i = 0; i < count; i++) {
    const mesh = acquireMesh(color, false, 'sphere');
    const py = 0.05 + Math.random() * 0.1;
    mesh.position.set(x, py, z);
    mesh.scale.setScalar(0.35);
    state.scene.add(mesh);
    addParticle({
      x, y: py, z,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.1 + Math.random() * 0.2,
      vz: (Math.random() - 0.5) * 0.8,
      life: 0.3 + Math.random() * 0.05,
      maxLife: 0.3 + Math.random() * 0.05,
      mesh,
      isDust: true,
      delay: 0
    });
  }
}

// ── Ambient Particles ─────────────────────────────────────────────────────

/**
 * Update ambient/environmental particles per theme.
 * Called from the main game loop every frame.
 * @param {number} dt - Delta time in seconds
 * @param {string} theme - 'hockey' | 'soccer'
 * @param {Array} enemies - Array of active enemy objects with wx/wz
 */
export function updateAmbientParticles(dt, theme, enemies) {
  if (theme === 'hockey') {
    _updateSnow(dt);
  } else if (theme === 'soccer') {
    _updateGrassBits(dt, enemies);
  }
}

function _updateSnow(dt) {
  const state = getState();
  const currentSnow = ambientParticles.filter(p => p.isSnow && p.life > 0).length;
  if (currentSnow >= MAX_SNOW) return;

  const toSpawn = Math.min(2, MAX_SNOW - currentSnow);
  const hw = (state.COLS || 10) / 2;
  const hh = (state.ROWS || 8) / 2;

  for (let i = 0; i < toSpawn; i++) {
    const mesh = acquireMesh(0xffffff, false, 'sphere');
    const sx = (Math.random() - 0.5) * hw * 2;
    const sy = 3 + Math.random() * 3;
    const sz = (Math.random() - 0.5) * hh * 2;
    mesh.position.set(sx, sy, sz);
    mesh.scale.setScalar(0.25);
    state.scene.add(mesh);

    const p = {
      x: sx, y: sy, z: sz,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.5 + Math.random() * 0.5),
      vz: (Math.random() - 0.5) * 0.3,
      life: 4 + Math.random() * 3,
      maxLife: 4 + Math.random() * 3,
      mesh,
      isSnow: true,
      delay: 0
    };

    ambientParticles.push(p);
    addParticle(p);
  }
}

function _updateGrassBits(dt, enemies) {
  if (!enemies || enemies.length === 0) return;
  const state = getState();
  const currentGrass = ambientParticles.filter(p => p.isGrass && p.life > 0).length;
  if (currentGrass >= MAX_GRASS) return;

  // Randomly pick an enemy to spawn near
  if (Math.random() > 0.3) return;

  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  if (!enemy || enemy.wx === undefined) return;

  const mesh = acquireMesh(0x22c55e, false, 'spark');
  mesh.position.set(enemy.wx, 0.1, enemy.wz);
  mesh.scale.setScalar(0.2);
  state.scene.add(mesh);

  const p = {
    x: enemy.wx, y: 0.1, z: enemy.wz,
    vx: (Math.random() - 0.5) * 0.4,
    vy: 0.3 + Math.random() * 0.5,
    vz: (Math.random() - 0.5) * 0.4,
    life: 0.5 + Math.random() * 0.3,
    maxLife: 0.5 + Math.random() * 0.3,
    mesh,
    isGrass: true,
    delay: 0
  };

  ambientParticles.push(p);
  addParticle(p);
}

// ── Money Pickup ──────────────────────────────────────────────────────────

export function createMoneyPickup(x, y, z) {
  const state = getState();

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const mesh = acquireMesh(0xffd700, true, 'spark');
    mesh.position.set(x, y, z);
    state.scene.add(mesh);
    addParticle({
      x, y, z,
      vx: Math.cos(angle) * 1.5,
      vy: 3 + Math.random() * 2,
      vz: Math.sin(angle) * 1.5,
      life: 0.6, maxLife: 0.6,
      mesh,
      delay: 0
    });
  }
}

// ── Lightning ─────────────────────────────────────────────────────────────

export function createLightning(x1, z1, x2, z2) {
  const state = getState();
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);

  const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, len, 6);
  coreGeo.rotateX(Math.PI / 2);
  const coreMesh = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  coreMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  coreMesh.lookAt(x2, 0.5, z2);
  state.scene.add(coreMesh);

  const glowGeo = new THREE.CylinderGeometry(0.08, 0.08, len, 6);
  glowGeo.rotateX(Math.PI / 2);
  const glowMesh = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
    color: 0xa855f7, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
  }));
  glowMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  glowMesh.lookAt(x2, 0.5, z2);
  state.scene.add(glowMesh);

  const coronaGeo = new THREE.CylinderGeometry(0.15, 0.15, len, 6);
  coronaGeo.rotateX(Math.PI / 2);
  const coronaMesh = new THREE.Mesh(coronaGeo, new THREE.MeshBasicMaterial({
    color: 0x8844ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending
  }));
  coronaMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  coronaMesh.lookAt(x2, 0.5, z2);
  state.scene.add(coronaMesh);

  [{ x: x1, z: z1 }, { x: x2, z: z2 }].forEach(pos => {
    for (let i = 0; i < 3; i++) {
      const spark = acquireMesh(0xaa66ff, true, 'spark');
      spark.position.set(pos.x, 0.5, pos.z);
      spark.scale.setScalar(0.5);
      state.scene.add(spark);
      addParticle({
        x: pos.x, y: 0.5, z: pos.z,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2,
        vz: (Math.random() - 0.5) * 3,
        life: 0.2, maxLife: 0.2,
        mesh: spark,
        rotSpeed: (Math.random() - 0.5) * 20,
        delay: 0
      });
    }
  });

  setTimeout(() => {
    state.scene.remove(coreMesh);
    state.scene.remove(glowMesh);
    state.scene.remove(coronaMesh);
    coreGeo.dispose();
    glowGeo.dispose();
    coronaGeo.dispose();
  }, 120);
}

// ── Update ────────────────────────────────────────────────────────────────

/**
 * Update all particles with enhanced behaviors.
 * @param {number} dt - Delta time in seconds
 */
export function updateParticles(dt) {
  const state = getState();
  const { particles, scene } = state;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // Handle delay — skip physics/render until delay elapsed
    if (p.delay > 0) {
      p.delay -= dt;
      continue;
    }

    const lifeRatio = Math.max(0, p.life / p.maxLife);

    // Physics
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;

    _applyPhysics(p, dt, lifeRatio);

    p.life -= dt;

    if (p.mesh) {
      p.mesh.position.set(p.x, p.y, p.z);
      if (p.rotSpeed) {
        p.mesh.rotation.x += p.rotSpeed * dt;
        p.mesh.rotation.y += p.rotSpeed * 0.7 * dt;
      }
      _updateMeshVisuals(p, lifeRatio);
    }

    if (p.life <= 0 || p.y < -1) {
      _removeParticle(p, scene, particles, i);
    }
  }
}

function _applyPhysics(p, dt, lifeRatio) {
  if (p.isSmoke) {
    p.vy -= 2 * dt;
    p.vx *= 0.98;
    p.vz *= 0.98;
  } else if (p.isFlash || p.isTrail) {
    // No gravity
  } else if (p.isRing) {
    if (p.mesh) {
      const expandScale = 1 + (1 - lifeRatio) * 4;
      p.mesh.scale.setScalar(expandScale);
    }
  } else if (p.isSpawnRing) {
    if (p.mesh) {
      const expandScale = 1 + (1 - lifeRatio) * 8;
      p.mesh.scale.setScalar(expandScale);
      p.mesh.material.opacity = lifeRatio * 0.8;
    }
  } else if (p.isPlacementRing) {
    if (p.mesh) {
      // Expand from scale 1 to ~5 over lifetime
      const expandScale = 1 + (1 - lifeRatio) * 4;
      p.mesh.scale.setScalar(expandScale);
    }
  } else if (p.isDust) {
    p.vy -= 6 * dt;
    p.vx *= 0.95;
    p.vz *= 0.95;
  } else if (p.isSnow) {
    p.vx += (Math.random() - 0.5) * 0.02; // gentle sway
    p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
  } else if (p.isGrass) {
    p.vy -= 4 * dt;
  } else {
    p.vy -= 18 * dt; // standard gravity
  }
}

function _updateMeshVisuals(p, lifeRatio) {
  if (p.isFlash) {
    const flashScale = (1 - lifeRatio) * 3;
    p.mesh.scale.setScalar(flashScale);
    if (p.mesh.children[0]) p.mesh.children[0].material.opacity = lifeRatio;
    if (p.mesh.children[1]) p.mesh.children[1].material.opacity = lifeRatio * 0.5;
  } else if (p.isSmoke) {
    const smokeScale = 0.3 + (1 - lifeRatio) * 0.8;
    p.mesh.scale.setScalar(smokeScale);
    if (p.mesh.children[0]) p.mesh.children[0].material.opacity = lifeRatio * 0.5;
  } else if (p.isRing) {
    if (p.mesh.material) p.mesh.material.opacity = lifeRatio * 0.7;
  } else if (p.isPlacementRing) {
    if (p.mesh && p.mesh.material) p.mesh.material.opacity = lifeRatio * 0.6;
  } else if (p.isTrail) {
    const trailScale = 0.2 + lifeRatio * 0.3;
    p.mesh.scale.setScalar(trailScale);
    if (p.mesh.children[0]) p.mesh.children[0].material.opacity = lifeRatio * 0.8;
  } else if (p.isDust || p.isSnow || p.isGrass) {
    if (p.mesh.children[0]) p.mesh.children[0].material.opacity = lifeRatio * 0.6;
  } else {
    const baseScale = 0.3 + lifeRatio * 1.2;
    p.mesh.scale.setScalar(baseScale);
    if (p.mesh.children[0]) p.mesh.children[0].material.opacity = lifeRatio;
    if (p.mesh.children[1]) p.mesh.children[1].material.opacity = lifeRatio * 0.4;
  }
}

function _removeParticle(p, scene, particles, i) {
  if (p.mesh) {
    scene.remove(p.mesh);
    if (p.ringGeo || p.isSpawnRing) {
      if (p.ringGeo) p.ringGeo.dispose();
      if (p.mesh.geometry) p.mesh.geometry.dispose();
      if (p.mesh.material) p.mesh.material.dispose();
    } else {
      releaseMesh(p.mesh);
    }
  }
  // Clean up ambient tracking
  const ambIdx = ambientParticles.indexOf(p);
  if (ambIdx !== -1) ambientParticles.splice(ambIdx, 1);
  particles.splice(i, 1);
}

// ── Clear / Stats ─────────────────────────────────────────────────────────

export function clearAllParticles() {
  const state = getState();
  const { particles, scene } = state;

  for (const p of particles) {
    if (p.mesh) {
      scene.remove(p.mesh);
      releaseMesh(p.mesh);
    }
  }
  particles.length = 0;
  ambientParticles.length = 0;
}

export function getParticlePoolStats() {
  return {
    pooled: meshPool.length,
    active: getState().particles.length,
    materials: materialCache.size,
    maxPoolSize: MAX_POOL_SIZE
  };
}

/**
 * Returns the current number of live particles.
 * @returns {number}
 */
export function getActiveParticleCount() {
  return getState().particles.length;
}

// ── Wave Effects ──────────────────────────────────────────────────────────

export function createSpawnPulse() {
  const state = getState();
  const { SPAWNS, COLS, ROWS, scene } = state;
  if (!SPAWNS || !scene) return;

  const hw = COLS / 2;
  const hh = ROWS / 2;

  for (const spawn of SPAWNS) {
    const wx = spawn.x - hw + 0.5;
    const wz = spawn.y - hh + 0.5;

    const ringGeo = new THREE.RingGeometry(0.1, 0.3, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626, transparent: true, opacity: 0.8, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(wx, 0.1, wz);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    addParticle({ x: wx, y: 0.1, z: wz, vx: 0, vy: 0.5, vz: 0, life: 0.6, maxLife: 0.6, mesh: ring, isSpawnRing: true, ringGeo, delay: 0 });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 2 + Math.random() * 2;
      const mesh = acquireMesh(0xdc2626, true, 'spark');
      mesh.position.set(wx, 0.2, wz);
      scene.add(mesh);
      addParticle({
        x: wx, y: 0.2, z: wz,
        vx: Math.cos(angle) * speed, vy: 2 + Math.random() * 2, vz: Math.sin(angle) * speed,
        life: 0.5, maxLife: 0.5, mesh, rotSpeed: (Math.random() - 0.5) * 10, delay: 0
      });
    }
  }
}

export function createWaveComplete() {
  const state = getState();
  const { COLS, ROWS, scene, theme } = state;
  if (!scene) return;

  const hw = COLS / 2;
  const hh = ROWS / 2;
  const isHockey = theme === 'hockey';
  const colors = isHockey
    ? [0x00d4ff, 0x38bdf8, 0xfbbf24, 0xffffff]
    : [0x22c55e, 0x86efac, 0xfbbf24, 0xffffff];

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const speed = 3 + Math.random() * 3;
    const c = colors[Math.floor(Math.random() * colors.length)];
    const mesh = acquireMesh(c, true, Math.random() > 0.5 ? 'spark' : 'sphere');
    mesh.position.set(0, 1, 0);
    scene.add(mesh);
    addParticle({
      x: 0, y: 1, z: 0,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: 4 + Math.random() * 3,
      vz: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
      life: 1.0 + Math.random() * 0.5, maxLife: 1.0 + Math.random() * 0.5,
      mesh, rotSpeed: (Math.random() - 0.5) * 8, delay: 0
    });
  }

  for (let i = 0; i < 15; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, z;
    switch (side) {
      case 0: x = -hw + Math.random() * COLS; z = -hh; break;
      case 1: x = -hw + Math.random() * COLS; z = hh; break;
      case 2: x = -hw; z = -hh + Math.random() * ROWS; break;
      case 3: x = hw; z = -hh + Math.random() * ROWS; break;
    }
    const c = colors[Math.floor(Math.random() * colors.length)];
    const mesh = acquireMesh(c, true, 'spark');
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);
    addParticle({
      x, y: 0.5, z,
      vx: (Math.random() - 0.5) * 2, vy: 5 + Math.random() * 3, vz: (Math.random() - 0.5) * 2,
      life: 1.2, maxLife: 1.2,
      mesh, rotSpeed: (Math.random() - 0.5) * 12, delay: 0
    });
  }
}

export function createVictoryEffect() {
  const state = getState();
  const { COLS, ROWS, scene } = state;
  if (!scene) return;

  const colors = [0xffd700, 0xffaa00, 0xffffff, 0xfbbf24];

  for (let burst = 0; burst < 3; burst++) {
    setTimeout(() => {
      const bx = (Math.random() - 0.5) * COLS * 0.5;
      const bz = (Math.random() - 0.5) * ROWS * 0.5;
      for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        const speed = 4 + Math.random() * 4;
        const c = colors[Math.floor(Math.random() * colors.length)];
        const mesh = acquireMesh(c, true, Math.random() > 0.3 ? 'spark' : 'sphere');
        mesh.position.set(bx, 2, bz);
        state.scene.add(mesh);
        addParticle({
          x: bx, y: 2, z: bz,
          vx: Math.cos(angle) * speed, vy: 6 + Math.random() * 4, vz: Math.sin(angle) * speed,
          life: 1.5 + Math.random() * 0.5, maxLife: 1.5 + Math.random() * 0.5,
          mesh, rotSpeed: (Math.random() - 0.5) * 15, delay: 0
        });
      }
    }, burst * 300);
  }

  const hw = COLS / 2;
  const hh = ROWS / 2;
  const baseX = state.BASE ? state.BASE.x - hw + 0.5 : hw - 1;
  const baseZ = state.BASE ? state.BASE.y - hh + 0.5 : 0;

  for (let i = 0; i < 30; i++) {
    const mesh = acquireMesh(0xffd700, true, 'spark');
    const px = baseX + (Math.random() - 0.5) * 2;
    const py = 0.2;
    const pz = baseZ + (Math.random() - 0.5) * 2;
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    addParticle({
      x: px, y: py, z: pz,
      vx: (Math.random() - 0.5) * 1, vy: 2 + Math.random() * 2, vz: (Math.random() - 0.5) * 1,
      life: 1.5 + Math.random() * 1, maxLife: 1.5 + Math.random() * 1,
      mesh, rotSpeed: (Math.random() - 0.5) * 8, delay: 0
    });
  }
}

export function createDefeatEffect() {
  const state = getState();
  const { BASE, COLS, ROWS, scene } = state;
  if (!scene) return;

  const hw = COLS / 2;
  const hh = ROWS / 2;
  const baseX = BASE ? BASE.x - hw + 0.5 : hw - 1;
  const baseZ = BASE ? BASE.y - hh + 0.5 : 0;

  createExplosion(baseX, 0.5, baseZ, true, 0xff0000);

  for (let i = 0; i < 15; i++) {
    const mesh = acquireMesh(0x444444, false, 'sphere');
    const px = baseX + (Math.random() - 0.5) * 1.5;
    const py = 0.3;
    const pz = baseZ + (Math.random() - 0.5) * 1.5;
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    addParticle({
      x: px, y: py, z: pz,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 1.5 + Math.random(),
      vz: (Math.random() - 0.5) * 0.5,
      life: 2, maxLife: 2,
      mesh, isSmoke: true, delay: 0
    });
  }
}
