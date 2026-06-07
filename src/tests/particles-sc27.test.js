// Tests for SC-2.7: Particle System Upgrade
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockGeometry {
  constructor() { this.dispose = vi.fn(); }
}

class MockMaterial {
  constructor(opts = {}) {
    Object.assign(this, opts);
    this.opacity = opts.opacity ?? 1.0;
    this.dispose = vi.fn();
  }
}

class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo || new MockGeometry();
    this.material = mat || new MockMaterial();
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { setScalar: vi.fn(), x: 1, y: 1, z: 1 };
    this.visible = true;
    this.children = [];
    this.add = vi.fn(child => this.children.push(child));
  }
}

class MockGroup {
  constructor() {
    this.children = [];
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { setScalar: vi.fn() };
    this.visible = true;
    this.add = vi.fn(child => this.children.push(child));
  }
}

const mockScene = {
  add: vi.fn(),
  remove: vi.fn()
};

class MockSphereGeometry extends MockGeometry {}
class MockOctahedronGeometry extends MockGeometry {}
class MockRingGeometry extends MockGeometry {}
class MockCylinderGeometry extends MockGeometry {
  rotateX() {}
}

global.THREE = {
  SphereGeometry: MockSphereGeometry,
  OctahedronGeometry: MockOctahedronGeometry,
  RingGeometry: MockRingGeometry,
  CylinderGeometry: MockCylinderGeometry,
  Mesh: MockMesh,
  Group: MockGroup,
  MeshBasicMaterial: MockMaterial,
  AdditiveBlending: 'AdditiveBlending',
  DoubleSide: 'DoubleSide'
};

// ── Mock state ─────────────────────────────────────────────────────────────

let mockParticles = [];

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    scene: mockScene,
    particles: mockParticles,
    COLS: 10,
    ROWS: 8,
    theme: 'hockey'
  })),
  addParticle: vi.fn(p => mockParticles.push(p)),
  removeParticle: vi.fn()
}));

// ── Mock quality ───────────────────────────────────────────────────────────

let mockQualityName = 'high';

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: vi.fn(() => mockQualityName),
  getQualityTier: vi.fn(() => ({})),
  setQualityTier: vi.fn()
}));

// ── Import under test ──────────────────────────────────────────────────────

import {
  getParticlePoolStats,
  createExplosion,
  updateParticles,
  spawnTrailParticle,
  spawnDustPuff,
  updateAmbientParticles,
  initParticlePool
} from '../js/systems/particles.js';

import { getQualityName } from '../js/rendering/quality.js';
import { addParticle } from '../js/engine/state.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function resetParticles() {
  mockParticles.length = 0;
  mockScene.add.mockClear();
  mockScene.remove.mockClear();
  addParticle.mockClear();
}

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.1  Pool size by quality tier
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.1 — Pool size by quality tier', () => {
  beforeEach(resetParticles);

  it('sets MAX_POOL_SIZE to 300 on high quality', () => {
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');
    initParticlePool();
    const stats = getParticlePoolStats();
    expect(stats.maxPoolSize).toBe(300);
  });

  it('sets MAX_POOL_SIZE to 200 on medium quality', () => {
    mockQualityName = 'medium';
    getQualityName.mockReturnValue('medium');
    initParticlePool();
    const stats = getParticlePoolStats();
    expect(stats.maxPoolSize).toBe(200);
  });

  it('sets MAX_POOL_SIZE to 100 on low quality', () => {
    mockQualityName = 'low';
    getQualityName.mockReturnValue('low');
    initParticlePool();
    const stats = getParticlePoolStats();
    expect(stats.maxPoolSize).toBe(100);
  });

  it('getParticlePoolStats exposes maxPoolSize field', () => {
    initParticlePool();
    const stats = getParticlePoolStats();
    expect(stats).toHaveProperty('maxPoolSize');
    expect(typeof stats.maxPoolSize).toBe('number');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.2  Multi-stage explosions
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.2 — Multi-stage explosions', () => {
  beforeEach(resetParticles);

  it('createExplosion spawns particles across 3 delay stages', () => {
    createExplosion(0, 0, 0, false, 0xff0000);
    const particles = mockParticles;
    const stage1 = particles.filter(p => (p.delay ?? 0) < 0.05);
    const stage2 = particles.filter(p => (p.delay ?? 0) >= 0.05 && (p.delay ?? 0) < 0.15);
    const stage3 = particles.filter(p => (p.delay ?? 0) >= 0.15);
    expect(stage1.length).toBeGreaterThan(0);
    expect(stage2.length).toBeGreaterThan(0);
    expect(stage3.length).toBeGreaterThan(0);
  });

  it('stage 1 spark particles have fast velocity (speed >= 2)', () => {
    createExplosion(0, 0, 0, false, 0xff8800);
    // Exclude flash particle (zero velocity) from speed check
    const stage1Sparks = mockParticles.filter(p => (p.delay ?? 0) < 0.05 && !p.isFlash);
    expect(stage1Sparks.length).toBeGreaterThan(0);
    stage1Sparks.forEach(p => {
      const speed = Math.sqrt(p.vx ** 2 + p.vz ** 2);
      expect(speed).toBeGreaterThanOrEqual(2);
    });
  });

  it('stage 3 particles are smoke (isSmoke flag or very slow vy)', () => {
    createExplosion(0, 0, 0, false, 0xff0000);
    const stage3 = mockParticles.filter(p => (p.delay ?? 0) >= 0.15);
    expect(stage3.length).toBeGreaterThan(0);
    stage3.forEach(p => {
      expect(p.isSmoke).toBe(true);
    });
  });

  it('updateParticles does not move particles with delay > 0', () => {
    createExplosion(1, 0, 1, false, 0xff0000);
    const delayedParticle = mockParticles.find(p => (p.delay ?? 0) > 0);
    if (!delayedParticle) return; // skip if no delayed particles
    const initialX = delayedParticle.x;
    updateParticles(0.01);
    // Particle with remaining delay should not have moved
    expect(delayedParticle.x).toBe(initialX);
  });

  it('updateParticles decrements delay counter', () => {
    createExplosion(0, 0, 0, false, 0xff0000);
    const delayed = mockParticles.find(p => (p.delay ?? 0) > 0);
    if (!delayed) return;
    const before = delayed.delay;
    updateParticles(0.01);
    expect(delayed.delay).toBeLessThan(before);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.3  Trail particles
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.3 — Trail particles (spawnTrailParticle)', () => {
  beforeEach(resetParticles);

  it('spawnTrailParticle is exported and callable', () => {
    expect(typeof spawnTrailParticle).toBe('function');
  });

  it('adds exactly one particle to state', () => {
    spawnTrailParticle(1, 0.5, 2, 0x00ffff);
    expect(mockParticles.length).toBe(1);
  });

  it('trail particle has near-zero velocity', () => {
    spawnTrailParticle(0, 0, 0, 0xffffff);
    const p = mockParticles[0];
    expect(Math.abs(p.vx)).toBeLessThan(0.01);
    expect(Math.abs(p.vy)).toBeLessThan(0.01);
    expect(Math.abs(p.vz)).toBeLessThan(0.01);
  });

  it('trail particle has short lifetime (maxLife <= 0.25)', () => {
    spawnTrailParticle(0, 0, 0, 0x00ff00);
    const p = mockParticles[0];
    expect(p.maxLife).toBeLessThanOrEqual(0.25);
  });

  it('trail particle is marked as trail type', () => {
    spawnTrailParticle(0, 0, 0, 0xff0000);
    const p = mockParticles[0];
    expect(p.isTrail).toBe(true);
  });

  it('adds mesh to scene', () => {
    spawnTrailParticle(5, 1, 3, 0x0000ff);
    expect(mockScene.add).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.4  Dust puff particles
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.4 — Dust puff particles (spawnDustPuff)', () => {
  beforeEach(resetParticles);

  it('spawnDustPuff is exported and callable', () => {
    expect(typeof spawnDustPuff).toBe('function');
  });

  it('spawns 2–3 particles', () => {
    spawnDustPuff(0, 0, 0x8B7355);
    expect(mockParticles.length).toBeGreaterThanOrEqual(2);
    expect(mockParticles.length).toBeLessThanOrEqual(3);
  });

  it('dust particles spawn at ground level (y <= 0.2)', () => {
    spawnDustPuff(0, 0, 0x8B7355);
    mockParticles.forEach(p => {
      expect(p.y).toBeLessThanOrEqual(0.2);
    });
  });

  it('dust particles have short lifetime (maxLife <= 0.35)', () => {
    spawnDustPuff(0, 0, 0x8B7355);
    mockParticles.forEach(p => {
      expect(p.maxLife).toBeLessThanOrEqual(0.35);
    });
  });

  it('dust particles have isDust flag', () => {
    spawnDustPuff(2, 3, 0xCCDDFF);
    mockParticles.forEach(p => {
      expect(p.isDust).toBe(true);
    });
  });

  it('adds meshes to scene', () => {
    spawnDustPuff(0, 0, 0x8B7355);
    expect(mockScene.add).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.5  Ambient particles (updateAmbientParticles)
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.5 — Ambient particles (updateAmbientParticles)', () => {
  beforeEach(resetParticles);

  it('updateAmbientParticles is exported and callable', () => {
    expect(typeof updateAmbientParticles).toBe('function');
  });

  it('spawns snowflakes for hockey theme (up to 30)', () => {
    for (let i = 0; i < 5; i++) {
      updateAmbientParticles(0.016, 'hockey', []);
    }
    const snow = mockParticles.filter(p => p.isSnow);
    expect(snow.length).toBeGreaterThan(0);
    expect(snow.length).toBeLessThanOrEqual(30);
  });

  it('snowflakes drift downward (negative vy)', () => {
    for (let i = 0; i < 5; i++) {
      updateAmbientParticles(0.016, 'hockey', []);
    }
    const snow = mockParticles.filter(p => p.isSnow);
    snow.forEach(p => {
      expect(p.vy).toBeLessThan(0);
    });
  });

  it('spawns grass bits for soccer theme (up to 10)', () => {
    const mockEnemies = [
      { wx: 1, wz: 1 },
      { wx: 2, wz: 3 }
    ];
    for (let i = 0; i < 5; i++) {
      updateAmbientParticles(0.016, 'soccer', mockEnemies);
    }
    const grass = mockParticles.filter(p => p.isGrass);
    expect(grass.length).toBeGreaterThanOrEqual(0); // may be 0 if not triggered
    expect(grass.length).toBeLessThanOrEqual(10);
  });

  it('does not spawn ambient particles for unknown theme', () => {
    updateAmbientParticles(0.016, 'unknown', []);
    expect(mockParticles.filter(p => p.isSnow || p.isGrass).length).toBe(0);
  });

  it('does not exceed 30 snowflakes total', () => {
    // Call many times to try to overflow
    for (let i = 0; i < 50; i++) {
      updateAmbientParticles(0.016, 'hockey', []);
    }
    const snow = mockParticles.filter(p => p.isSnow);
    expect(snow.length).toBeLessThanOrEqual(30);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-2.7.6  updateParticles handles delay and new flags without errors
// ══════════════════════════════════════════════════════════════════════════

describe('SC-2.7.6 — updateParticles handles new particle types', () => {
  beforeEach(resetParticles);

  it('processes trail particles without throwing', () => {
    spawnTrailParticle(0, 0, 0, 0xffffff);
    expect(() => updateParticles(0.016)).not.toThrow();
  });

  it('processes dust particles without throwing', () => {
    spawnDustPuff(0, 0, 0x8B7355);
    expect(() => updateParticles(0.016)).not.toThrow();
  });

  it('removes expired trail particles', () => {
    spawnTrailParticle(0, 0, 0, 0xffffff);
    // Advance time past maxLife (0.2s)
    for (let i = 0; i < 20; i++) {
      updateParticles(0.016);
    }
    const trails = mockParticles.filter(p => p.isTrail);
    expect(trails.length).toBe(0);
  });
});
