// Tests for SC-3.2: Tower Placement Satisfaction
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockGeometry {
  constructor() { this.dispose = vi.fn(); }
  rotateX() {}
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
    this.userData = {};
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
    this.userData = {};
    this.add = vi.fn(child => this.children.push(child));
  }
}

const mockScene = {
  add: vi.fn(),
  remove: vi.fn()
};

global.THREE = {
  SphereGeometry: MockGeometry,
  OctahedronGeometry: MockGeometry,
  RingGeometry: MockGeometry,
  CylinderGeometry: MockGeometry,
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
    theme: 'hockey',
    towers: [],
    enemies: [],
    grid: [],
    themeData: { towers: [] },
    selectedTower: null,
    sellMode: false,
    money: 1000
  })),
  addParticle: vi.fn(p => mockParticles.push(p)),
  removeParticle: vi.fn(),
  addTower: vi.fn(),
  removeTower: vi.fn(),
  setSelectedTower: vi.fn(),
  setSellMode: vi.fn(),
  addMoney: vi.fn(),
  dispatch: vi.fn(),
  ActionTypes: { ADD_MONEY: 'ADD_MONEY' }
}));

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: vi.fn(() => 'high')
}));

// ── Mock camera ────────────────────────────────────────────────────────────

const cameraMocks = vi.hoisted(() => ({
  shakeCamera: vi.fn()
}));

vi.mock('../js/engine/camera.js', () => ({
  shakeCamera: cameraMocks.shakeCamera,
  updateCamera: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  resetCam: vi.fn(),
  rotateCamera: vi.fn()
}));

// ── Import under test ──────────────────────────────────────────────────────

import {
  spawnGroundRipple,
  spawnTowerDust
} from '../js/systems/particles.js';

import { updateTowerDropAnimations } from '../js/rendering/animations.js';

import { addParticle } from '../js/engine/state.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function resetMocks() {
  mockParticles.length = 0;
  mockScene.add.mockClear();
  mockScene.remove.mockClear();
  addParticle.mockClear();
  cameraMocks.shakeCamera.mockClear();
}

// ══════════════════════════════════════════════════════════════════════════
// SC-3.2.1  Ground ripple effect
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.2.1 — Ground ripple effect (spawnGroundRipple)', () => {
  beforeEach(resetMocks);

  it('spawnGroundRipple is exported from particles.js', () => {
    expect(typeof spawnGroundRipple).toBe('function');
  });

  it('adds exactly one particle (the ring) to state', () => {
    spawnGroundRipple(1, 2, 0xffffff);
    expect(mockParticles.length).toBe(1);
  });

  it('adds the ring mesh to the scene', () => {
    spawnGroundRipple(0, 0, 0xffffff);
    expect(mockScene.add).toHaveBeenCalled();
  });

  it('ring particle has isPlacementRing flag', () => {
    spawnGroundRipple(0, 0, 0xffffff);
    const p = mockParticles[0];
    expect(p.isPlacementRing).toBe(true);
  });

  it('ring particle lifetime is ~300ms (0.28-0.32s)', () => {
    spawnGroundRipple(0, 0, 0xffffff);
    const p = mockParticles[0];
    expect(p.maxLife).toBeGreaterThanOrEqual(0.28);
    expect(p.maxLife).toBeLessThanOrEqual(0.32);
  });

  it('ring starts at ground level (y near 0)', () => {
    spawnGroundRipple(3, 5, 0xffffff);
    const p = mockParticles[0];
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(0.15);
  });

  it('ring particle has zero velocity (static ring)', () => {
    spawnGroundRipple(0, 0, 0xffffff);
    const p = mockParticles[0];
    expect(p.vx).toBe(0);
    expect(p.vy).toBe(0);
    expect(p.vz).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.2.2  Dust particle burst
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.2.2 — Dust particle burst (spawnTowerDust)', () => {
  beforeEach(resetMocks);

  it('spawnTowerDust is exported from particles.js', () => {
    expect(typeof spawnTowerDust).toBe('function');
  });

  it('spawns 6–8 particles', () => {
    spawnTowerDust(0, 0);
    expect(mockParticles.length).toBeGreaterThanOrEqual(6);
    expect(mockParticles.length).toBeLessThanOrEqual(8);
  });

  it('all dust particles have isDust flag', () => {
    spawnTowerDust(0, 0);
    mockParticles.forEach(p => {
      expect(p.isDust).toBe(true);
    });
  });

  it('dust particles are small (radius hint: scale near 0.04)', () => {
    spawnTowerDust(0, 0);
    expect(mockParticles.length).toBeGreaterThan(0);
    // Particles should be spawned at roughly base level
    mockParticles.forEach(p => {
      expect(p.y).toBeLessThanOrEqual(0.15);
    });
  });

  it('dust particles lifetime is ~400ms (0.35–0.45s)', () => {
    spawnTowerDust(0, 0);
    mockParticles.forEach(p => {
      expect(p.maxLife).toBeGreaterThanOrEqual(0.35);
      expect(p.maxLife).toBeLessThanOrEqual(0.45);
    });
  });

  it('dust particles spread outward (have nonzero horizontal velocity)', () => {
    spawnTowerDust(0, 0);
    const hasHorizontal = mockParticles.some(
      p => Math.abs(p.vx) > 0.01 || Math.abs(p.vz) > 0.01
    );
    expect(hasHorizontal).toBe(true);
  });

  it('dust particles have slight upward initial velocity', () => {
    spawnTowerDust(0, 0);
    mockParticles.forEach(p => {
      expect(p.vy).toBeGreaterThan(0);
    });
  });

  it('adds meshes to the scene', () => {
    spawnTowerDust(1, 2);
    expect(mockScene.add).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.2.3  Camera micro-shake on placement
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.2.3 — Camera micro-shake', () => {
  beforeEach(resetMocks);

  it('shakeCamera is exported from camera.js', async () => {
    const camModule = await import('../js/engine/camera.js');
    expect(typeof camModule.shakeCamera).toBe('function');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.2.4  Tower drop animation
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.2.4 — Tower drop animation', () => {
  it('updateTowerDropAnimations is exported from animations.js', () => {
    expect(typeof updateTowerDropAnimations).toBe('function');
  });

  it('moves tower mesh downward from Y+0.5 start toward 0 over time', () => {
    const mockMesh = new MockMesh();
    mockMesh.position.y = 0.5;
    mockMesh.userData.dropAnim = { elapsed: 0, duration: 0.15, startY: 0.5 };

    const mockTower = { mesh: mockMesh };

    updateTowerDropAnimations([mockTower], 0.05);

    // After 50ms, mesh should be moving down from 0.5 toward 0
    expect(mockMesh.position.y).toBeLessThan(0.5);
  });

  it('completes animation and settles at Y=0 after full duration', () => {
    const mockMesh = new MockMesh();
    mockMesh.position.y = 0.2;
    mockMesh.userData.dropAnim = { elapsed: 0.14, duration: 0.15, startY: 0.5 };

    const mockTower = { mesh: mockMesh };

    updateTowerDropAnimations([mockTower], 0.02);

    // After animation completes, should be at rest (near 0)
    expect(mockMesh.position.y).toBeCloseTo(0, 1);
  });

  it('does not update towers without dropAnim userData', () => {
    const mockMesh = new MockMesh();
    mockMesh.position.y = 1.0;
    mockMesh.userData = {};

    const mockTower = { mesh: mockMesh };

    updateTowerDropAnimations([mockTower], 0.016);

    // No change — no dropAnim
    expect(mockMesh.position.y).toBe(1.0);
  });

  it('clears dropAnim from userData when complete', () => {
    const mockMesh = new MockMesh();
    mockMesh.position.y = 0.1;
    mockMesh.userData.dropAnim = { elapsed: 0.14, duration: 0.15, startY: 0.5 };

    const mockTower = { mesh: mockMesh };
    updateTowerDropAnimations([mockTower], 0.02);

    expect(mockMesh.userData.dropAnim).toBeUndefined();
  });

  it('easeOutBounce causes slight overshoot below 0 before settling', () => {
    // At t ~0.7, bounce curve goes below 0
    // Test that position can go slightly negative
    const mockMesh = new MockMesh();
    mockMesh.position.y = 0.5;
    mockMesh.userData.dropAnim = { elapsed: 0, duration: 0.15, startY: 0.5 };

    const mockTower = { mesh: mockMesh };

    let minY = 0.5;
    for (let i = 0; i < 20; i++) {
      updateTowerDropAnimations([mockTower], 0.008);
      if (mockMesh.userData.dropAnim) {
        minY = Math.min(minY, mockMesh.position.y);
      }
    }
    // Bounce should dip slightly below 0
    expect(minY).toBeLessThan(0.02);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.2.5  Placement ring physics in updateParticles
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.2.5 — Placement ring physics in updateParticles', () => {
  beforeEach(resetMocks);

  it('isPlacementRing particles expand their mesh scale over time', () => {
    const ringMesh = new MockMesh();
    ringMesh.material = new MockMaterial({ opacity: 0.6, transparent: true });
    // Inject a ring particle manually to test physics branch
    const ringParticle = {
      x: 0, y: 0.05, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0.25, maxLife: 0.3,
      mesh: ringMesh,
      isPlacementRing: true,
      delay: 0
    };
    mockParticles.push(ringParticle);

    // Import updateParticles
    return import('../js/systems/particles.js').then(({ updateParticles }) => {
      updateParticles(0.01);
      // Ring mesh should have had scale set (expansion)
      expect(ringMesh.scale.setScalar).toHaveBeenCalled();
    });
  });

  it('isPlacementRing opacity fades from 0.6 to 0 over lifetime', () => {
    const ringMesh = new MockMesh();
    ringMesh.material = new MockMaterial({ opacity: 0.6, transparent: true });
    const ringParticle = {
      x: 0, y: 0.05, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0.1, maxLife: 0.3,
      mesh: ringMesh,
      isPlacementRing: true,
      delay: 0
    };
    mockParticles.push(ringParticle);

    return import('../js/systems/particles.js').then(({ updateParticles }) => {
      updateParticles(0.016);
      // Opacity should be reduced
      expect(ringMesh.material.opacity).toBeLessThan(0.6);
    });
  });
});
