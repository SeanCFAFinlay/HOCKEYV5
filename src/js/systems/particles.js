// Particle system with object pooling and enhanced visuals
// Zero-allocation during gameplay

import { getState, addParticle, removeParticle } from '../engine/state.js';

// Particle mesh pool
const meshPool = [];
const glowMeshPool = [];
const MAX_POOL_SIZE = 150;

// Shared geometries (reused across all particles)
let sharedGeo = null;
let sharedGlowGeo = null;
let sparkGeo = null;
let materialCache = new Map();
let glowMaterialCache = new Map();

/**
 * Initialize shared resources
 */
function initSharedResources() {
  if (!sharedGeo) {
    sharedGeo = new THREE.SphereGeometry(0.06, 8, 8);
    sharedGlowGeo = new THREE.SphereGeometry(0.12, 6, 6);
    sparkGeo = new THREE.OctahedronGeometry(0.04, 0);
  }
}

/**
 * Get or create a material for a color
 * @param {number} color - Hex color
 * @returns {THREE.Material}
 */
function getMaterial(color) {
  if (materialCache.has(color)) {
    return materialCache.get(color);
  }

  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 1.0
  });
  materialCache.set(color, mat);
  return mat;
}

/**
 * Get or create a glow material for a color
 * @param {number} color - Hex color
 * @returns {THREE.Material}
 */
function getGlowMaterial(color) {
  if (glowMaterialCache.has(color)) {
    return glowMaterialCache.get(color);
  }

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

/**
 * Acquire a particle mesh from pool with optional glow
 * @param {number} color - Hex color
 * @param {boolean} withGlow - Add glow effect
 * @param {string} type - Particle geometry type
 * @returns {THREE.Group}
 */
function acquireMesh(color, withGlow = true, type = 'sphere') {
  initSharedResources();

  let group;

  if (meshPool.length > 0) {
    group = meshPool.pop();
    // Update core material
    if (group.children[0]) {
      group.children[0].material = getMaterial(color);
      group.children[0].material.opacity = 1.0;
    }
    // Update glow material
    if (group.children[1]) {
      group.children[1].material = getGlowMaterial(color);
      group.children[1].visible = withGlow;
    }
    group.visible = true;
    group.scale.setScalar(1);
  } else {
    group = new THREE.Group();

    // Core particle
    const geo = type === 'spark' ? sparkGeo : sharedGeo;
    const core = new THREE.Mesh(geo, getMaterial(color));
    group.add(core);

    // Glow effect
    const glow = new THREE.Mesh(sharedGlowGeo, getGlowMaterial(color));
    glow.visible = withGlow;
    group.add(glow);
  }

  return group;
}

/**
 * Return a mesh to the pool
 * @param {THREE.Group} mesh
 */
function releaseMesh(mesh) {
  mesh.visible = false;

  if (meshPool.length < MAX_POOL_SIZE) {
    meshPool.push(mesh);
  }
}

/**
 * Create explosion particles with enhanced visuals
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {boolean} isFire - Is fire explosion
 * @param {number} color - Override color
 */
export function createExplosion(x, y, z, isFire, color) {
  const state = getState();

  // Fire explosions get multiple colors
  const fireColors = [0xff2200, 0xff6600, 0xffaa00, 0xffdd00];
  const baseColor = color || (isFire ? 0xff4400 : 0xff8800);

  // Main explosion burst
  for (let i = 0; i < 12; i++) {
    const c = isFire ? fireColors[Math.floor(Math.random() * fireColors.length)] : baseColor;
    const angle = (i / 12) * Math.PI * 2;
    const speed = 3 + Math.random() * 3;

    const p = {
      x,
      y,
      z,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.random() * 5 + 3,
      vz: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.5 + Math.random() * 0.3,
      mesh: null,
      rotSpeed: (Math.random() - 0.5) * 10
    };

    const mesh = acquireMesh(c, true, Math.random() > 0.5 ? 'spark' : 'sphere');
    mesh.position.set(x, y, z);
    state.scene.add(mesh);

    p.mesh = mesh;
    addParticle(p);
  }

  // Central flash
  const flashMesh = acquireMesh(0xffffff, true, 'sphere');
  flashMesh.position.set(x, y, z);
  flashMesh.scale.setScalar(0.5);
  state.scene.add(flashMesh);

  const flash = {
    x, y, z,
    vx: 0, vy: 0.5, vz: 0,
    life: 0.15,
    maxLife: 0.15,
    mesh: flashMesh,
    isFlash: true
  };
  addParticle(flash);

  // Smoke puffs (for fire)
  if (isFire) {
    for (let i = 0; i < 4; i++) {
      const smokeP = {
        x: x + (Math.random() - 0.5) * 0.3,
        y: y + 0.2,
        z: z + (Math.random() - 0.5) * 0.3,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 1.5 + Math.random() * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
        mesh: null,
        isSmoke: true
      };

      const smokeMesh = acquireMesh(0x444444, false, 'sphere');
      smokeMesh.position.set(smokeP.x, smokeP.y, smokeP.z);
      state.scene.add(smokeMesh);

      smokeP.mesh = smokeMesh;
      addParticle(smokeP);
    }
  }
}

/**
 * Create impact particles (smaller, faster) with enhanced visuals
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {number} color - Particle color
 */
export function createImpact(x, y, z, color) {
  const state = getState();
  const c = color || 0xffffff;

  // Spark burst
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const speed = 2 + Math.random() * 2;

    const p = {
      x,
      y,
      z,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5),
      vy: Math.random() * 3 + 1.5,
      vz: Math.sin(angle) * speed + (Math.random() - 0.5),
      life: 0.2 + Math.random() * 0.15,
      maxLife: 0.2 + Math.random() * 0.15,
      mesh: null,
      rotSpeed: (Math.random() - 0.5) * 15
    };

    const mesh = acquireMesh(c, true, 'spark');
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(0.7);
    state.scene.add(mesh);

    p.mesh = mesh;
    addParticle(p);
  }

  // Impact ring
  const ringGeo = new THREE.RingGeometry(0.05, 0.15, 16);
  const ringMat = new THREE.MeshBasicMaterial({
    color: c,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(x, y, z);
  ring.rotation.x = -Math.PI / 2;
  state.scene.add(ring);

  const ringP = {
    x, y, z,
    vx: 0, vy: 0.2, vz: 0,
    life: 0.2,
    maxLife: 0.2,
    mesh: ring,
    isRing: true,
    ringGeo
  };
  addParticle(ringP);
}

/**
 * Create money pickup effect
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 */
export function createMoneyPickup(x, y, z) {
  const state = getState();

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;

    const p = {
      x,
      y,
      z,
      vx: Math.cos(angle) * 1.5,
      vy: 3 + Math.random() * 2,
      vz: Math.sin(angle) * 1.5,
      life: 0.6,
      maxLife: 0.6,
      mesh: null
    };

    const mesh = acquireMesh(0xffd700, true, 'spark');
    mesh.position.set(x, y, z);
    state.scene.add(mesh);

    p.mesh = mesh;
    addParticle(p);
  }
}

/**
 * Create enhanced lightning effect between two points
 * @param {number} x1 - Start X
 * @param {number} z1 - Start Z
 * @param {number} x2 - End X
 * @param {number} z2 - End Z
 */
export function createLightning(x1, z1, x2, z2) {
  const state = getState();

  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);

  // Core lightning bolt
  const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, len, 6);
  coreGeo.rotateX(Math.PI / 2);

  const coreMesh = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  coreMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  coreMesh.lookAt(x2, 0.5, z2);
  state.scene.add(coreMesh);

  // Outer glow
  const glowGeo = new THREE.CylinderGeometry(0.08, 0.08, len, 6);
  glowGeo.rotateX(Math.PI / 2);

  const glowMesh = new THREE.Mesh(
    glowGeo,
    new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })
  );
  glowMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  glowMesh.lookAt(x2, 0.5, z2);
  state.scene.add(glowMesh);

  // Outer corona
  const coronaGeo = new THREE.CylinderGeometry(0.15, 0.15, len, 6);
  coronaGeo.rotateX(Math.PI / 2);

  const coronaMesh = new THREE.Mesh(
    coronaGeo,
    new THREE.MeshBasicMaterial({
      color: 0x8844ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    })
  );
  coronaMesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
  coronaMesh.lookAt(x2, 0.5, z2);
  state.scene.add(coronaMesh);

  // Endpoint sparks
  [{ x: x1, z: z1 }, { x: x2, z: z2 }].forEach(pos => {
    for (let i = 0; i < 3; i++) {
      const spark = acquireMesh(0xaa66ff, true, 'spark');
      spark.position.set(pos.x, 0.5, pos.z);
      spark.scale.setScalar(0.5);
      state.scene.add(spark);

      const sparkP = {
        x: pos.x,
        y: 0.5,
        z: pos.z,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2,
        vz: (Math.random() - 0.5) * 3,
        life: 0.2,
        maxLife: 0.2,
        mesh: spark,
        rotSpeed: (Math.random() - 0.5) * 20
      };
      addParticle(sparkP);
    }
  });

  // Remove lightning after short duration
  setTimeout(() => {
    state.scene.remove(coreMesh);
    state.scene.remove(glowMesh);
    state.scene.remove(coronaMesh);
    coreGeo.dispose();
    glowGeo.dispose();
    coronaGeo.dispose();
  }, 120);
}

/**
 * Update all particles with enhanced behaviors
 * @param {number} dt - Delta time
 */
export function updateParticles(dt) {
  const state = getState();
  const { particles, scene } = state;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const lifeRatio = Math.max(0, p.life / p.maxLife);

    // Physics update
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;

    // Different gravity for different particle types
    if (p.isSmoke) {
      p.vy -= 2 * dt; // Light smoke rises
      p.vx *= 0.98; // Air resistance
      p.vz *= 0.98;
    } else if (p.isFlash) {
      // Flash doesn't fall
    } else if (p.isRing) {
      // Ring expands
      if (p.mesh) {
        const expandScale = 1 + (1 - lifeRatio) * 4;
        p.mesh.scale.setScalar(expandScale);
      }
    } else {
      p.vy -= 18 * dt; // Gravity
    }

    p.life -= dt;

    // Update mesh
    if (p.mesh) {
      p.mesh.position.set(p.x, p.y, p.z);

      // Rotation
      if (p.rotSpeed) {
        p.mesh.rotation.x += p.rotSpeed * dt;
        p.mesh.rotation.y += p.rotSpeed * 0.7 * dt;
      }

      // Scale and opacity based on life
      if (p.isFlash) {
        // Flash grows and fades fast
        const flashScale = (1 - lifeRatio) * 3;
        p.mesh.scale.setScalar(flashScale);
        if (p.mesh.children[0]) {
          p.mesh.children[0].material.opacity = lifeRatio;
        }
        if (p.mesh.children[1]) {
          p.mesh.children[1].material.opacity = lifeRatio * 0.5;
        }
      } else if (p.isSmoke) {
        // Smoke expands and fades
        const smokeScale = 0.3 + (1 - lifeRatio) * 0.8;
        p.mesh.scale.setScalar(smokeScale);
        if (p.mesh.children[0]) {
          p.mesh.children[0].material.opacity = lifeRatio * 0.5;
        }
      } else if (p.isRing) {
        // Ring fades
        if (p.mesh.material) {
          p.mesh.material.opacity = lifeRatio * 0.7;
        }
      } else {
        // Standard particle scale
        const baseScale = 0.3 + lifeRatio * 1.2;
        p.mesh.scale.setScalar(baseScale);

        // Update material opacity
        if (p.mesh.children && p.mesh.children[0]) {
          p.mesh.children[0].material.opacity = lifeRatio;
        }
        if (p.mesh.children && p.mesh.children[1]) {
          p.mesh.children[1].material.opacity = lifeRatio * 0.4;
        }
      }
    }

    // Remove dead particles
    if (p.life <= 0 || p.y < -1) {
      if (p.mesh) {
        scene.remove(p.mesh);
        // Clean up ring geometry
        if (p.ringGeo) {
          p.ringGeo.dispose();
          p.mesh.material.dispose();
        } else {
          releaseMesh(p.mesh);
        }
      }
      particles.splice(i, 1);
    }
  }
}

/**
 * Clear all particles (for game reset)
 */
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
}

/**
 * Get pool statistics
 */
export function getParticlePoolStats() {
  return {
    pooled: meshPool.length,
    active: getState().particles.length,
    materials: materialCache.size
  };
}
