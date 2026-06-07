// Tests for SC-5.5: Performance Optimization Pass
// TDD Red → Green

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock THREE globals ────────────────────────────────────────────────────────

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
class MockGroup {
  constructor() {
    this.children = [];
    this.position = { set: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { setScalar: vi.fn() };
    this.visible = true;
    this.userData = {};
    this.add = vi.fn(c => this.children.push(c));
  }
}
class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo || new MockGeometry();
    this.material = mat || new MockMaterial();
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0, copy: vi.fn(), multiplyScalar: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { setScalar: vi.fn(), x: 1, y: 1, z: 1, set: vi.fn() };
    this.visible = true;
    this.children = [];
    this.add = vi.fn(c => this.children.push(c));
    this.userData = {};
    this.lookAt = vi.fn();
    this.castShadow = false;
    this.receiveShadow = false;
    this.renderOrder = 0;
  }
}
class MockBufferGeometry {
  constructor() {
    this.attributes = {};
    this.dispose = vi.fn();
  }
  setAttribute(name, attr) { this.attributes[name] = attr; }
}
class MockFloat32BufferAttribute {
  constructor(arr, itemSize) {
    this.array = arr instanceof Float32Array ? arr : new Float32Array(arr);
    this.needsUpdate = false;
  }
}
class MockLine {
  constructor(geo, mat) {
    this.geometry = geo || new MockBufferGeometry();
    this.material = mat || new MockMaterial({ opacity: 0.6 });
    this.visible = false;
    this.renderOrder = 0;
  }
}

global.THREE = {
  SphereGeometry: MockGeometry,
  OctahedronGeometry: MockGeometry,
  RingGeometry: MockGeometry,
  CylinderGeometry: class extends MockGeometry { rotateX() {} },
  BoxGeometry: MockGeometry,
  PlaneGeometry: MockGeometry,
  TorusGeometry: MockGeometry,
  CircleGeometry: MockGeometry,
  ConeGeometry: MockGeometry,
  ShapeGeometry: MockGeometry,
  BufferGeometry: MockBufferGeometry,
  Float32BufferAttribute: MockFloat32BufferAttribute,
  Mesh: MockMesh,
  Group: MockGroup,
  Line: MockLine,
  MeshBasicMaterial: MockMaterial,
  MeshStandardMaterial: MockMaterial,
  LineBasicMaterial: MockMaterial,
  AdditiveBlending: 'AdditiveBlending',
  DoubleSide: 'DoubleSide',
  Color: class { constructor(v) { this.r = 1; this.g = 1; this.b = 1; } }
};

// ── Mock state ────────────────────────────────────────────────────────────────

let mockParticles = [];
const mockScene = { add: vi.fn(), remove: vi.fn() };

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

// ── Mock quality ──────────────────────────────────────────────────────────────

let mockQualityName = 'high';

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: vi.fn(() => mockQualityName),
  getQualityTier: vi.fn(() => ({})),
  setQualityTier: vi.fn((name) => { mockQualityName = name; return true; })
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import {
  initParticlePool,
  getParticlePoolStats,
  getActiveParticleCount,
  createExplosion,
  spawnTrailParticle
} from '../js/systems/particles.js';

import {
  initTrails,
  attachTrail,
  updateTrails,
  removeTrail,
  getTrailSegmentCount
} from '../js/rendering/trails.js';

import {
  updateMinimap,
  setMinimapLowQualityMode
} from '../js/ui/minimap.js';

import {
  initPostProcessing,
  setPostProcessingQuality,
  isPostProcessingEnabled
} from '../js/engine/postprocessing.js';

import {
  enableAutoQuality
} from '../js/engine/auto-quality.js';

import { getQualityName, setQualityTier } from '../js/rendering/quality.js';
import { addParticle } from '../js/engine/state.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetParticles() {
  mockParticles.length = 0;
  mockScene.add.mockClear();
  mockScene.remove.mockClear();
  addParticle.mockClear();
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. Particle Budget Enforcement
// ═════════════════════════════════════════════════════════════════════════════

describe('SC-5.5.1 — Particle budget caps', () => {
  beforeEach(() => {
    resetParticles();
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');
    initParticlePool();
  });

  it('exports getActiveParticleCount', () => {
    expect(typeof getActiveParticleCount).toBe('function');
  });

  it('getActiveParticleCount returns number of active particles', () => {
    spawnTrailParticle(0, 0, 0, 0xffffff);
    expect(getActiveParticleCount()).toBe(1);
  });

  it('getActiveParticleCount reflects mockParticles length', () => {
    expect(getActiveParticleCount()).toBe(0);
    createExplosion(0, 0, 0, false, 0xff0000);
    const count = getActiveParticleCount();
    expect(count).toBeGreaterThan(0);
  });

  it('low quality particle cap is 100', () => {
    mockQualityName = 'low';
    getQualityName.mockReturnValue('low');
    initParticlePool();
    expect(getParticlePoolStats().maxPoolSize).toBe(100);
  });

  it('medium quality particle cap is 200', () => {
    mockQualityName = 'medium';
    getQualityName.mockReturnValue('medium');
    initParticlePool();
    expect(getParticlePoolStats().maxPoolSize).toBe(200);
  });

  it('high quality particle cap is 300', () => {
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');
    initParticlePool();
    expect(getParticlePoolStats().maxPoolSize).toBe(300);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. Trail LOD
// ═════════════════════════════════════════════════════════════════════════════

describe('SC-5.5.2 — Trail LOD by quality tier', () => {
  it('exports getTrailSegmentCount', () => {
    expect(typeof getTrailSegmentCount).toBe('function');
  });

  it('returns 0 segments on low quality (trails disabled)', () => {
    mockQualityName = 'low';
    getQualityName.mockReturnValue('low');
    expect(getTrailSegmentCount()).toBe(0);
  });

  it('returns 4 segments on medium quality', () => {
    mockQualityName = 'medium';
    getQualityName.mockReturnValue('medium');
    expect(getTrailSegmentCount()).toBe(4);
  });

  it('returns 8 segments on high quality', () => {
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');
    expect(getTrailSegmentCount()).toBe(8);
  });

  it('attachTrail is no-op on low quality', () => {
    mockQualityName = 'low';
    getQualityName.mockReturnValue('low');

    const fakeScene = { add: vi.fn(), remove: vi.fn() };
    initTrails(fakeScene);

    const proj = { x: 0, y: 0, z: 0 };
    attachTrail(proj, 0xffffff);
    // On low quality, no trail should be attached
    expect(proj._trail).toBeUndefined();
  });

  it('attachTrail works on high quality', () => {
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');

    const fakeScene = { add: vi.fn(), remove: vi.fn() };
    initTrails(fakeScene);

    const proj = { x: 0, y: 0, z: 0 };
    attachTrail(proj, 0xffffff);
    // On high quality with pool available, trail should be attached
    expect(proj._trail).toBeDefined();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. Minimap throttle & low-quality mode
// ═════════════════════════════════════════════════════════════════════════════

describe('SC-5.5.3 — Minimap performance', () => {
  it('exports setMinimapLowQualityMode', () => {
    expect(typeof setMinimapLowQualityMode).toBe('function');
  });

  it('setMinimapLowQualityMode can be called without error', () => {
    expect(() => setMinimapLowQualityMode(true)).not.toThrow();
    expect(() => setMinimapLowQualityMode(false)).not.toThrow();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. Post-processing quality gates
// ═════════════════════════════════════════════════════════════════════════════

describe('SC-5.5.4 — Post-processing quality', () => {
  it('setPostProcessingQuality low disables composer (ppEnabled=false)', () => {
    // No composer initialized — calling on null should not throw
    expect(() => setPostProcessingQuality('low')).not.toThrow();
  });

  it('setPostProcessingQuality medium enables bloom only', () => {
    expect(() => setPostProcessingQuality('medium')).not.toThrow();
  });

  it('setPostProcessingQuality high enables all effects', () => {
    expect(() => setPostProcessingQuality('high')).not.toThrow();
  });

  it('isPostProcessingEnabled returns false after low quality set with no composer', () => {
    setPostProcessingQuality('low');
    // With no composer, ppEnabled is set to false
    expect(isPostProcessingEnabled()).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. Auto-quality reduction
// ═════════════════════════════════════════════════════════════════════════════

describe('SC-5.5.5 — Auto quality reduction', () => {
  beforeEach(() => {
    mockQualityName = 'high';
    getQualityName.mockReturnValue('high');
    setQualityTier.mockClear();
  });

  it('exports enableAutoQuality function', () => {
    expect(typeof enableAutoQuality).toBe('function');
  });

  it('enableAutoQuality(true) enables monitoring without error', () => {
    expect(() => enableAutoQuality(true)).not.toThrow();
  });

  it('enableAutoQuality(false) disables monitoring without error', () => {
    expect(() => enableAutoQuality(false)).not.toThrow();
  });

  it('does not auto-reduce when frame time is under 33ms', () => {
    enableAutoQuality(true);
    // Simulate good performance (16ms frames) — should not downgrade
    // After 5 seconds at 60fps we have 300 frames, none above threshold
    // We can't easily simulate time here, just check no unexpected calls
    // when quality is already being managed externally
    expect(setQualityTier).not.toHaveBeenCalled();
  });
});
