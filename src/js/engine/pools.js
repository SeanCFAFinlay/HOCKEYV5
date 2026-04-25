// Object pooling system for zero-allocation game loop
// Pools: enemies, projectiles, particles

/**
 * Generic object pool
 */
class ObjectPool {
  constructor(factory, reset, initialSize = 20) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    this.active = new Set();

    // Pre-allocate
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Get an object from the pool
   * @param {...any} args - Arguments to pass to reset function
   * @returns {Object} Pooled or new object
   */
  acquire(...args) {
    let obj;

    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory();
    }

    this.reset(obj, ...args);
    this.active.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   * @param {Object} obj - Object to return
   */
  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Release all active objects
   */
  releaseAll() {
    this.active.forEach(obj => {
      this.pool.push(obj);
    });
    this.active.clear();
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      pooled: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size
    };
  }
}

// Particle pool (increased size for large waves and 3x speed)
const particlePool = new ObjectPool(
  // Factory
  () => ({
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
    life: 0,
    maxLife: 0,
    mesh: null,
    color: 0xffffff,
    scale: 1
  }),
  // Reset
  (p, x, y, z, vx, vy, vz, life, color) => {
    p.x = x || 0;
    p.y = y || 0;
    p.z = z || 0;
    p.vx = vx || 0;
    p.vy = vy || 0;
    p.vz = vz || 0;
    p.life = life || 0.5;
    p.maxLife = life || 0.5;
    p.color = color || 0xffffff;
    p.scale = 1;
  },
  150 // Initial size (increased from 50 for large waves)
);

// Projectile pool (increased for many towers firing simultaneously)
const projectilePool = new ObjectPool(
  // Factory
  () => ({
    mesh: null,
    tower: null,
    target: null,
    tx: 0, ty: 0, tz: 0,
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0, vz: 0,
    t: 0,
    speed: 8.5,
    active: false
  }),
  // Reset
  (p, tower, target, sx, sz, speed) => {
    p.tower = tower;
    p.target = target;
    p.tx = target ? target.x : 0;
    p.ty = target ? (target.y != null ? target.y : (target.flying ? 1.2 : 0.2)) : 0;
    p.tz = target ? target.z : 0;
    p.x = sx || 0;
    p.y = 0.45;
    p.z = sz || 0;
    p.vx = 0;
    p.vy = 0;
    p.vz = 0;
    p.t = 0;
    p.speed = speed || 8.5;
    p.active = true;
  },
  100 // Initial size (increased from 30 for many simultaneous projectiles)
);

// Vector3 pool for temporary calculations
const vec3Pool = [];
const MAX_VEC3_POOL = 100; // Increased from 50

/**
 * Acquire a particle from pool
 */
export function acquireParticle(x, y, z, vx, vy, vz, life, color) {
  return particlePool.acquire(x, y, z, vx, vy, vz, life, color);
}

/**
 * Release a particle to pool
 */
export function releaseParticle(particle) {
  particlePool.release(particle);
}

/**
 * Acquire a projectile from pool
 */
export function acquireProjectile(tower, target, sx, sz, speed) {
  return projectilePool.acquire(tower, target, sx, sz, speed);
}

/**
 * Release a projectile to pool
 */
export function releaseProjectile(projectile) {
  projectile.active = false;
  projectilePool.release(projectile);
}

/**
 * Get a temporary Vector3
 * @returns {THREE.Vector3}
 */
export function getTempVec3() {
  if (vec3Pool.length > 0) {
    return vec3Pool.pop();
  }
  return new THREE.Vector3();
}

/**
 * Return a temporary Vector3
 * @param {THREE.Vector3} vec
 */
export function returnTempVec3(vec) {
  if (vec3Pool.length < MAX_VEC3_POOL) {
    vec.set(0, 0, 0);
    vec3Pool.push(vec);
  }
}

/**
 * Get pool statistics for debugging
 */
export function getPoolStats() {
  return {
    particles: particlePool.getStats(),
    projectiles: projectilePool.getStats(),
    vec3: { pooled: vec3Pool.length }
  };
}

/**
 * Reset all pools (for game reset)
 */
export function resetAllPools() {
  particlePool.releaseAll();
  projectilePool.releaseAll();
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.__pools = {
    getStats: getPoolStats,
    reset: resetAllPools
  };
}
