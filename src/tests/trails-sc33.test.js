// Tests for SC-3.3: Projectile Trails
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockBufferGeometry {
  constructor() {
    this.attributes = {};
    this.dispose = vi.fn();
  }
  setAttribute(name, attr) {
    this.attributes[name] = attr;
  }
}

class MockFloat32BufferAttribute {
  constructor(array, itemSize) {
    this.array = array instanceof Float32Array ? array : new Float32Array(array);
    this.itemSize = itemSize;
    this.needsUpdate = false;
  }
}

class MockLineBasicMaterial {
  constructor(opts = {}) {
    Object.assign(this, opts);
    this.opacity = opts.opacity ?? 1.0;
    this.color = opts.color ?? 0xffffff;
    this.transparent = opts.transparent ?? false;
    this.dispose = vi.fn();
  }
}

class MockLine {
  constructor(geo, mat) {
    this.geometry = geo || new MockBufferGeometry();
    this.material = mat || new MockLineBasicMaterial();
    this.visible = false;
    this.renderOrder = 0;
    this.userData = {};
  }
}

const mockScene = {
  add: vi.fn(),
  remove: vi.fn()
};

global.THREE = {
  BufferGeometry: MockBufferGeometry,
  Float32BufferAttribute: MockFloat32BufferAttribute,
  LineBasicMaterial: MockLineBasicMaterial,
  Line: MockLine,
  Color: class {
    constructor(c) { this._c = c; }
  }
};

// ── Quality mock (SC-5.5 adds quality import to trails.js) ────────────────

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: vi.fn(() => 'high'),
  getQualityTier: vi.fn(() => ({})),
  setQualityTier: vi.fn()
}));

// ── Import under test ──────────────────────────────────────────────────────

import {
  initTrails,
  attachTrail,
  updateTrails,
  removeTrail,
  cleanupTrails,
  getTrailPoolStats
} from '../js/rendering/trails.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeProjectile(x = 0, y = 0.45, z = 0) {
  return { x, y, z, mesh: { position: { x, y, z } } };
}

function resetAll() {
  mockScene.add.mockClear();
  mockScene.remove.mockClear();
  cleanupTrails();
  initTrails(mockScene);
}

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.1  initTrails — pool creation
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.1 — initTrails pool creation', () => {
  beforeEach(resetAll);

  it('initTrails is exported and callable', () => {
    expect(typeof initTrails).toBe('function');
  });

  it('creates a pool of 30 trail Line objects', () => {
    const stats = getTrailPoolStats();
    expect(stats.poolSize).toBe(30);
  });

  it('adds all trail lines to scene on init', () => {
    expect(mockScene.add).toHaveBeenCalledTimes(30);
  });

  it('trail lines are initially hidden', () => {
    const stats = getTrailPoolStats();
    expect(stats.activeCount).toBe(0);
  });

  it('each trail line has BufferGeometry with position attribute', () => {
    const stats = getTrailPoolStats();
    expect(stats.poolSize).toBe(30);
    // Verify scene.add was called with Line objects (MockLine instances)
    const calls = mockScene.add.mock.calls;
    expect(calls.length).toBe(30);
    calls.forEach(([line]) => {
      expect(line).toBeInstanceOf(MockLine);
      expect(line.geometry).toBeInstanceOf(MockBufferGeometry);
      expect(line.geometry.attributes.position).toBeTruthy();
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.2  attachTrail — pool checkout
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.2 — attachTrail pool checkout', () => {
  beforeEach(resetAll);

  it('attachTrail is exported and callable', () => {
    expect(typeof attachTrail).toBe('function');
  });

  it('reduces pool available count by 1 when attaching a trail', () => {
    const before = getTrailPoolStats().availableCount;
    const proj = makeProjectile();
    attachTrail(proj, 0xff0000);
    const after = getTrailPoolStats().availableCount;
    expect(after).toBe(before - 1);
  });

  it('increases active count by 1 when attaching', () => {
    const before = getTrailPoolStats().activeCount;
    const proj = makeProjectile();
    attachTrail(proj, 0x00ff00);
    const after = getTrailPoolStats().activeCount;
    expect(after).toBe(before + 1);
  });

  it('makes the trail line visible', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0x0000ff);
    const stats = getTrailPoolStats();
    expect(stats.activeCount).toBe(1);
  });

  it('does not crash when pool is empty (graceful degradation)', () => {
    // Exhaust the pool
    const projects = [];
    for (let i = 0; i < 30; i++) {
      const p = makeProjectile(i, 0.45, 0);
      projects.push(p);
      attachTrail(p, 0xffffff);
    }
    // This one should gracefully skip
    const extra = makeProjectile(99, 0.45, 0);
    expect(() => attachTrail(extra, 0xffffff)).not.toThrow();
    expect(getTrailPoolStats().activeCount).toBe(30); // still 30, not 31
  });

  it('attaches projectile reference to trail userData', () => {
    const proj = makeProjectile(1, 0.5, 2);
    attachTrail(proj, 0xff8800);
    // projectile should have _trail reference (or trail data stored somewhere)
    expect(proj._trail).toBeTruthy();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.3  updateTrails — position shift
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.3 — updateTrails position shift', () => {
  beforeEach(resetAll);

  it('updateTrails is exported and callable', () => {
    expect(typeof updateTrails).toBe('function');
  });

  it('does not throw when no trails are active', () => {
    expect(() => updateTrails(0.016)).not.toThrow();
  });

  it('marks geometry needsUpdate after updating active trail', () => {
    const proj = makeProjectile(0, 0.45, 0);
    attachTrail(proj, 0xff0000);

    // Move projectile
    proj.x = 1;
    proj.y = 0.5;
    proj.z = 1;

    updateTrails(0.016);

    const trail = proj._trail;
    expect(trail.geometry.attributes.position.needsUpdate).toBe(true);
  });

  it('updates the newest trail point to projectile position', () => {
    const proj = makeProjectile(5, 0.45, 3);
    attachTrail(proj, 0x00ffff);

    proj.x = 6;
    proj.y = 0.5;
    proj.z = 4;
    updateTrails(0.016);

    // Newest position (index 0) should match projectile
    const pos = proj._trail.geometry.attributes.position.array;
    expect(pos[0]).toBeCloseTo(6, 3);
    expect(pos[1]).toBeCloseTo(0.5, 3);
    expect(pos[2]).toBeCloseTo(4, 3);
  });

  it('advances fading trails toward removal', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0xffffff);
    removeTrail(proj);

    const before = getTrailPoolStats().activeCount;
    // Advance past TRAIL_FADE_TIME (200ms = 0.2s)
    updateTrails(0.1);
    updateTrails(0.15);

    const after = getTrailPoolStats().activeCount;
    expect(after).toBeLessThan(before);
  });

  it('fading trail opacity decreases over time', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0xffffff);
    const trail = proj._trail;
    const opacityBefore = trail.material.opacity;

    removeTrail(proj); // start fading
    updateTrails(0.05);

    expect(trail.material.opacity).toBeLessThan(opacityBefore);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.4  removeTrail — fade and recycle
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.4 — removeTrail fade and recycle', () => {
  beforeEach(resetAll);

  it('removeTrail is exported and callable', () => {
    expect(typeof removeTrail).toBe('function');
  });

  it('does not immediately hide the trail (starts fade)', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0xff0000);
    removeTrail(proj);
    // Still active (fading)
    expect(getTrailPoolStats().activeCount).toBe(1);
  });

  it('does not crash when called on projectile without trail', () => {
    const proj = makeProjectile();
    expect(() => removeTrail(proj)).not.toThrow();
  });

  it('returns trail to pool after fade completes', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0xff0000);
    removeTrail(proj);

    // Simulate fade time (200ms)
    updateTrails(0.25);

    expect(getTrailPoolStats().availableCount).toBe(30);
  });

  it('recycled trail can be reattached to a new projectile', () => {
    const p1 = makeProjectile(0, 0.45, 0);
    attachTrail(p1, 0xff0000);
    removeTrail(p1);
    updateTrails(0.25); // complete fade

    const p2 = makeProjectile(5, 0.45, 5);
    expect(() => attachTrail(p2, 0x00ff00)).not.toThrow();
    expect(getTrailPoolStats().activeCount).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.5  cleanupTrails
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.5 — cleanupTrails', () => {
  it('cleanupTrails is exported and callable', () => {
    expect(typeof cleanupTrails).toBe('function');
  });

  it('resets active count to 0', () => {
    initTrails(mockScene);
    const proj = makeProjectile();
    attachTrail(proj, 0xff0000);
    cleanupTrails();
    expect(getTrailPoolStats().activeCount).toBe(0);
  });

  it('resets pool size to 0 after cleanup', () => {
    initTrails(mockScene);
    cleanupTrails();
    expect(getTrailPoolStats().poolSize).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.3.6  getTrailPoolStats
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.3.6 — getTrailPoolStats', () => {
  beforeEach(resetAll);

  it('returns poolSize, activeCount, availableCount', () => {
    const stats = getTrailPoolStats();
    expect(stats).toHaveProperty('poolSize');
    expect(stats).toHaveProperty('activeCount');
    expect(stats).toHaveProperty('availableCount');
  });

  it('poolSize equals activeCount + availableCount', () => {
    const proj = makeProjectile();
    attachTrail(proj, 0xffffff);
    const stats = getTrailPoolStats();
    expect(stats.poolSize).toBe(stats.activeCount + stats.availableCount);
  });
});
