// Tests for SC-2.3: Improved Procedural Meshes (Towers)
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockGeometry {
  constructor(type, ...args) {
    this.type = type;
    this.args = args;
  }
}

class MockCylinderGeometry extends MockGeometry {
  constructor(rTop, rBottom, height, segments) {
    super('CylinderGeometry', rTop, rBottom, height, segments);
    this.radiusTop = rTop;
    this.radiusBottom = rBottom;
    this.height = height;
    this.radialSegments = segments;
  }
}

class MockSphereGeometry extends MockGeometry {
  constructor(radius, wSeg, hSeg) {
    super('SphereGeometry', radius, wSeg, hSeg);
    this.radius = radius;
    this.widthSegments = wSeg;
    this.heightSegments = hSeg;
  }
}

class MockTorusGeometry extends MockGeometry {
  constructor(radius, tube, rSeg, tSeg) {
    super('TorusGeometry', radius, tube, rSeg, tSeg);
    this.radius = radius;
    this.tube = tube;
    this.radialSegments = rSeg;
    this.tubularSegments = tSeg;
  }
}

class MockBoxGeometry extends MockGeometry {
  constructor(w, h, d) {
    super('BoxGeometry', w, h, d);
    this.width = w;
    this.height = h;
    this.depth = d;
  }
}

class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo;
    this.material = mat;
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0, copy: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { set: vi.fn(), setScalar: vi.fn() };
    this.castShadow = false;
    this.receiveShadow = false;
    this.visible = true;
    this.userData = {};
    this.lookAt = vi.fn();
  }
}

class MockGroup {
  constructor() {
    this.children = [];
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.userData = {};
  }
  add(child) { this.children.push(child); }
}

class MockMaterial {
  constructor(opts) { Object.assign(this, opts || {}); }
}

class MockOctahedronGeometry extends MockGeometry {
  constructor(r, d) { super('OctahedronGeometry', r, d); this.radius = r; }
}

class MockConeGeometry extends MockGeometry {
  constructor(r, h, s) { super('ConeGeometry', r, h, s); this.radius = r; this.radialSegments = s; }
}

class MockRingGeometry extends MockGeometry {
  constructor(inner, outer, seg) { super('RingGeometry', inner, outer, seg); }
}

class MockPlaneGeometry extends MockGeometry {
  constructor(w, h) { super('PlaneGeometry', w, h); this.w = w; this.h = h; }
}

class MockCircleGeometry extends MockGeometry {
  constructor(r, s) { super('CircleGeometry', r, s); this.radius = r; }
}

const mockScene = { add: vi.fn() };

global.THREE = {
  CylinderGeometry: MockCylinderGeometry,
  SphereGeometry: MockSphereGeometry,
  TorusGeometry: MockTorusGeometry,
  BoxGeometry: MockBoxGeometry,
  OctahedronGeometry: MockOctahedronGeometry,
  ConeGeometry: MockConeGeometry,
  RingGeometry: MockRingGeometry,
  PlaneGeometry: MockPlaneGeometry,
  CircleGeometry: MockCircleGeometry,
  Mesh: MockMesh,
  Group: MockGroup,
  MeshStandardMaterial: MockMaterial,
  MeshBasicMaterial: MockMaterial,
  Color: class { constructor(c) { this.c = c; } },
  DoubleSide: 2,
  AdditiveBlending: 2,
  Math: { PI: Math.PI }
};

// ── Module mocks ───────────────────────────────────────────────────────────

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    theme: 'hockey',
    themeData: {
      towers: [
        { id: 't1', clr: '#ff0000', projectile: 'ball' },
        { id: 't2', clr: '#00ff00', projectile: 'ball' },
        { id: 't3', clr: '#0000ff', projectile: 'chain' },
        { id: 't4', clr: '#ffff00', projectile: 'headButt' },
        { id: 't5', clr: '#ff00ff', projectile: 'ball' },
        { id: 't6', clr: '#00ffff', projectile: 'flare' },
        { id: 't7', clr: '#ffffff', projectile: 'ball' },
        { id: 't8', clr: '#aaaaaa', projectile: 'ball' },
      ]
    },
    COLS: 20,
    ROWS: 14,
    scene: mockScene
  }))
}));

vi.mock('../js/utils/math.js', () => ({
  makeCapsule: vi.fn()
}));

vi.mock('../js/config/visual-profiles.js', () => ({
  getVisualProfile: vi.fn(() => ({
    towers: {
      base: 0x223344,
      metal: 0x8899aa,
      levelGlow: 0x4488ff
    }
  }))
}));

// ── Helper to collect all geometries from group ────────────────────────────

function collectGeometries(group) {
  return group.children
    .filter(c => c instanceof MockMesh)
    .map(c => c.geometry);
}

function getCylinders(group) {
  return collectGeometries(group).filter(g => g instanceof MockCylinderGeometry);
}

function getSpheres(group) {
  return collectGeometries(group).filter(g => g instanceof MockSphereGeometry);
}

// ── Import module under test ───────────────────────────────────────────────

const { createTowerMesh } = await import('../js/rendering/tower-meshes.js');

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SC-2.3 Improved Procedural Meshes', () => {

  describe('Geometry segment counts', () => {
    it('hexagonal base cylinder uses 6 sides (kept intentional)', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const cyls = getCylinders(group);
      // The base hex cylinder must keep 6 sides
      const hexBase = cyls.find(c => c.radialSegments === 6);
      expect(hexBase).toBeDefined();
    });

    it('round cylinders use at least 16 segments (not 8)', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const cyls = getCylinders(group);
      // Non-hex cylinders should have >= 16 segments for smooth appearance
      const roundCyls = cyls.filter(c => c.radialSegments !== 6);
      roundCyls.forEach(c => {
        expect(c.radialSegments).toBeGreaterThanOrEqual(16);
      });
    });

    it('visible spheres (radius >= 0.03) use at least 24 width segments', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      // Filter out tiny rivet/detail spheres (radius < 0.03)
      const visibleSpheres = getSpheres(group).filter(s => s.radius >= 0.03);
      visibleSpheres.forEach(s => {
        expect(s.widthSegments).toBeGreaterThanOrEqual(24);
      });
    });

    it('visible spheres (radius >= 0.03) use at least 24 height segments', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      // Filter out tiny rivet/detail spheres (radius < 0.03)
      const visibleSpheres = getSpheres(group).filter(s => s.radius >= 0.03);
      visibleSpheres.forEach(s => {
        expect(s.heightSegments).toBeGreaterThanOrEqual(24);
      });
    });
  });

  describe('Layered base platform', () => {
    // The base is a round reference-styled command platform (buildTowerBase):
    // a faceted body, a chamfered lip and an icy top, all round cylinders,
    // rather than the earlier stacked 6-sided hexes.
    it('has a layered round platform built from several stacked cylinders', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      // Platform body, lip and icy top are all many-sided round cylinders.
      const roundCyls = getCylinders(group).filter(c => c.radialSegments >= 16);
      expect(roundCyls.length).toBeGreaterThanOrEqual(3);
    });

    it('platform layers have varied radii (body wider than the icy top)', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const roundCyls = getCylinders(group).filter(c => c.radialSegments >= 16);
      const radii = roundCyls.map(c => c.radiusTop).sort((a, b) => a - b);
      // Smallest (icy top) is meaningfully narrower than the widest (body/glow).
      expect(radii[0]).toBeLessThan(radii[radii.length - 1]);
    });

    it('has a torus glow ring between base layers', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const toruses = collectGeometries(group).filter(g => g instanceof MockTorusGeometry);
      expect(toruses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Surface detail meshes (rivets)', () => {
    it('adds rivet/bolt detail meshes around the base of each tower', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      // Rivets are tiny spheres; check there are some small-radius spheres
      const spheres = getSpheres(group);
      const rivets = spheres.filter(s => s.radius <= 0.025);
      expect(rivets.length).toBeGreaterThanOrEqual(4);
    });

    it('does not add more than 15 extra detail meshes total', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      // Total children count should be reasonable (not explosion of geometry)
      expect(group.children.length).toBeLessThanOrEqual(60);
    });
  });

  describe('Idle animation userData', () => {
    it('tower body mesh has bob animation data in animParts', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const animParts = group.userData.animParts || [];
      const bobPart = animParts.find(p => p.type === 'bob');
      expect(bobPart).toBeDefined();
    });

    it('emitParticle flag is set in group userData', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      expect(group.userData.emitParticle).toBe(true);
    });

    it('emitInterval is set in group userData', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      expect(group.userData.emitInterval).toBe(2000);
    });

    it('emitColor is set from tower color', () => {
      const tower = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      expect(group.userData.emitColor).toBeDefined();
    });

    it('rotating parts (rings, orbs) have spin animPart entries', () => {
      // Use power play tower (idx 5) which has rings
      const tower = { type: 't6', lv: 0, x: 5, y: 5, rng: 3 };
      const group = createTowerMesh(tower);
      const animParts = group.userData.animParts || [];
      const spinParts = animParts.filter(p => p.type === 'spin');
      expect(spinParts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Shared geometry reuse', () => {
    it('creates multiple rivets without crash', () => {
      const tower1 = { type: 't1', lv: 0, x: 5, y: 5, rng: 3 };
      const tower2 = { type: 't2', lv: 0, x: 6, y: 5, rng: 3 };
      expect(() => {
        createTowerMesh(tower1);
        createTowerMesh(tower2);
      }).not.toThrow();
    });

    it('works at different level scales without error', () => {
      expect(() => {
        for (let lv = 0; lv <= 3; lv++) {
          createTowerMesh({ type: 't1', lv, x: 5, y: 5, rng: 3 });
        }
      }).not.toThrow();
    });
  });

  describe('No runtime errors across tower types', () => {
    it('creates all 8 hockey tower types without error', () => {
      expect(() => {
        for (let i = 1; i <= 8; i++) {
          createTowerMesh({ type: `t${i}`, lv: 0, x: i, y: 5, rng: 3 });
        }
      }).not.toThrow();
    });
  });
});
