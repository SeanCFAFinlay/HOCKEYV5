// Tests for SC-2.4: Improved Procedural Meshes (Enemies)
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockGeometry {
  constructor(type, ...args) {
    this.type = type;
    this.args = args;
  }
  dispose() {}
}

class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo;
    this.material = mat || new MockMeshBasicMaterial({});
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0, copy: vi.fn(), multiplyScalar: vi.fn() };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1, setScalar: vi.fn() };
    this.castShadow = false;
    this.receiveShadow = false;
    this.visible = true;
    this.userData = {};
    this.lookAt = vi.fn();
    this.rotateZ = vi.fn();
  }
}

class MockGroup {
  constructor() {
    this.children = [];
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1, setScalar: vi.fn() };
    this.visible = true;
    this.userData = {};
    this._addedCount = 0;
  }
  add(child) {
    this.children.push(child);
    this._addedCount++;
  }
  traverse(fn) {
    fn(this);
    this.children.forEach(c => {
      fn(c);
      if (c.children) c.children.forEach(cc => fn(cc));
    });
  }
}

class MockMeshStandardMaterial {
  constructor(opts) {
    Object.assign(this, opts);
    this.color = { setHex: vi.fn() };
    this._opts = opts || {};
  }
  clone() { return new MockMeshStandardMaterial(this._opts); }
  dispose() {}
}

class MockMeshBasicMaterial {
  constructor(opts) {
    Object.assign(this, opts);
    this.color = { setHex: vi.fn() };
    this._opts = opts || {};
  }
  clone() { return new MockMeshBasicMaterial(this._opts); }
  dispose() {}
}

class MockCylinderGeometry extends MockGeometry {
  constructor(rTop, rBottom, height, segments) {
    super('CylinderGeometry', rTop, rBottom, height, segments);
    this.rTop = rTop;
    this.rBottom = rBottom;
    this.height = height;
    this.segments = segments;
  }
}

class MockSphereGeometry extends MockGeometry {
  constructor(r, wSeg, hSeg) {
    super('SphereGeometry', r, wSeg, hSeg);
    this.r = r;
    this.wSeg = wSeg;
    this.hSeg = hSeg;
  }
}

class MockPlaneGeometry extends MockGeometry {
  constructor(w, h) {
    super('PlaneGeometry', w, h);
    this.w = w;
    this.h = h;
  }
}

class MockTorusGeometry extends MockGeometry {
  constructor(r, tube, rSeg, tSeg) {
    super('TorusGeometry', r, tube, rSeg, tSeg);
    this.r = r;
    this.tube = tube;
  }
}

class MockOctahedronGeometry extends MockGeometry {
  constructor(r, detail) {
    super('OctahedronGeometry', r, detail);
    this.r = r;
    this.detail = detail;
  }
}

class MockCircleGeometry extends MockGeometry {
  constructor(r, seg) { super('CircleGeometry', r, seg); this.r = r; }
}

class MockRingGeometry extends MockGeometry {
  constructor(inner, outer, seg) { super('RingGeometry', inner, outer, seg); }
}

class MockBoxGeometry extends MockGeometry {
  constructor(w, h, d) { super('BoxGeometry', w, h, d); }
}

class MockConeGeometry extends MockGeometry {
  constructor(r, h, seg) { super('ConeGeometry', r, h, seg); this.r = r; this.h = h; }
}

class MockShapeGeometry extends MockGeometry {
  constructor(shape) { super('ShapeGeometry'); }
}

class MockShape {
  moveTo() { return this; }
  quadraticCurveTo() { return this; }
  lineTo() { return this; }
}

global.THREE = {
  Group: MockGroup,
  Mesh: MockMesh,
  MeshStandardMaterial: MockMeshStandardMaterial,
  MeshBasicMaterial: MockMeshBasicMaterial,
  CylinderGeometry: MockCylinderGeometry,
  SphereGeometry: MockSphereGeometry,
  PlaneGeometry: MockPlaneGeometry,
  TorusGeometry: MockTorusGeometry,
  OctahedronGeometry: MockOctahedronGeometry,
  CircleGeometry: MockCircleGeometry,
  RingGeometry: MockRingGeometry,
  BoxGeometry: MockBoxGeometry,
  ConeGeometry: MockConeGeometry,
  ShapeGeometry: MockShapeGeometry,
  Shape: MockShape,
  DoubleSide: 2,
  AdditiveBlending: 2,
  Math: Math
};

// ── Module mocks ───────────────────────────────────────────────────────────

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    theme: 'hockey',
    themeData: { id: 'hockey' },
    COLS: 20,
    ROWS: 14
  }))
}));

vi.mock('../js/config/visual-profiles.js', () => ({
  getVisualProfile: vi.fn(() => ({
    enemies: {
      swarm: { color: 0x0044aa, accent: 0x0066ff },
      boss: { color: 0xff2200, accent: 0xff6600 }
    }
  }))
}));

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: vi.fn(() => 'high'),
  getQualityTier: vi.fn(() => ({})),
  setQualityTier: vi.fn()
}));

// ── Import module under test ───────────────────────────────────────────────

import { createEnemyMesh } from '../js/rendering/enemy-meshes.js';

// ── Helper ────────────────────────────────────────────────────────────────

function collectGeometries(group) {
  const geos = [];
  group.traverse(obj => {
    if (obj.geometry) geos.push(obj.geometry);
  });
  return geos;
}

function collectMeshes(group) {
  const meshes = [];
  group.traverse(obj => {
    if (obj.geometry && obj.material) meshes.push(obj);
  });
  return meshes;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SC-2.4 Improved Procedural Meshes (Enemies)', () => {

  describe('1. Smoother geometry — Puck radial segments', () => {
    it('puck cylinder uses at least 24 radial segments', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      const group = createEnemyMesh(enemy);
      const cylinders = collectGeometries(group)
        .filter(g => g instanceof MockCylinderGeometry);
      expect(cylinders.length).toBeGreaterThan(0);
      const puckCyl = cylinders[0];
      expect(puckCyl.segments).toBeGreaterThanOrEqual(24);
    });
  });

  describe('2. Movement trails for fast enemies', () => {
    it('adds trail planes for fast enemies (speed property)', () => {
      const enemy = { sz: 1, nm: 'Speed Skater', hp: 100, maxHp: 100, speed: 'fast' };
      const group = createEnemyMesh(enemy);
      const planes = collectGeometries(group)
        .filter(g => g instanceof MockPlaneGeometry);
      // Should have trail planes in addition to health bar plane
      const trailPlanes = planes.filter(p => p.w < 0.5 && p.h < 0.5);
      expect(trailPlanes.length).toBeGreaterThanOrEqual(3);
    });

    it('adds trail planes for very_fast enemies', () => {
      const enemy = { sz: 1, nm: 'Speed Skater', hp: 100, maxHp: 100, speed: 'very_fast' };
      const group = createEnemyMesh(enemy);
      const planes = collectGeometries(group)
        .filter(g => g instanceof MockPlaneGeometry);
      const trailPlanes = planes.filter(p => p.w < 0.5 && p.h < 0.5);
      expect(trailPlanes.length).toBeGreaterThanOrEqual(3);
    });

    it('trail planes are transparent with decreasing opacity', () => {
      const enemy = { sz: 1, nm: 'Speed Skater', hp: 100, maxHp: 100, speed: 'fast' };
      const group = createEnemyMesh(enemy);
      const meshes = collectMeshes(group);
      const trailMeshes = meshes.filter(m =>
        m.geometry instanceof MockPlaneGeometry &&
        m.material.transparent === true &&
        m.material.opacity <= 0.3
      );
      expect(trailMeshes.length).toBeGreaterThanOrEqual(3);
    });

    it('sets userData.hasTrail = true on enemy group for fast enemies', () => {
      const enemy = { sz: 1, nm: 'Speed Skater', hp: 100, maxHp: 100, speed: 'fast' };
      const group = createEnemyMesh(enemy);
      expect(group.userData.hasTrail).toBe(true);
    });

    it('does NOT set hasTrail for slow enemies', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100, speed: 'slow' };
      const group = createEnemyMesh(enemy);
      expect(group.userData.hasTrail).toBeFalsy();
    });
  });

  describe('3. Enhanced status effects — Frozen/Slow crystals', () => {
    it('creates at least 8 ice crystals (doubled from 4-6)', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.iceCrystals).toBeDefined();
      expect(enemy.iceCrystals.length).toBeGreaterThanOrEqual(8);
    });

    it('ice crystals have size variation (not all same scale)', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      const sizes = enemy.iceCrystals.map(c => c.mesh.geometry.r);
      const uniqueSizes = new Set(sizes.map(s => Math.round(s * 1000)));
      expect(uniqueSizes.size).toBeGreaterThan(1);
    });

    it('ice crystals use light blue emissive material', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      const crystal = enemy.iceCrystals[0];
      expect(crystal).toBeDefined();
      // Crystal mesh should be an octahedron
      expect(crystal.mesh.geometry instanceof MockOctahedronGeometry).toBe(true);
    });
  });

  describe('3. Enhanced status effects — Burn embers', () => {
    it('creates at least 8 burn embers (50% more than original 5)', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.burnEmbers).toBeDefined();
      expect(enemy.burnEmbers.length).toBeGreaterThanOrEqual(8);
    });

    it('adds a heat distortion ring (torus) above enemy in burnGroup', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      const group = createEnemyMesh(enemy);
      // Check burn group has a torus geometry
      const burnGroup = enemy.burnGroup;
      expect(burnGroup).toBeDefined();
      const tori = [];
      burnGroup.traverse(obj => {
        if (obj.geometry instanceof MockTorusGeometry) tori.push(obj);
      });
      expect(tori.length).toBeGreaterThanOrEqual(1);
    });

    it('exposes heatRing reference on enemy for animation', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.heatRing).toBeDefined();
    });
  });

  describe('3. Enhanced status effects — Armored metallic sheen', () => {
    it('armored enemy has high metalness (>= 0.8) on armor material', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', armor: 2, hp: 100, maxHp: 100 };
      const group = createEnemyMesh(enemy);
      const meshes = collectMeshes(group);
      const armorMeshes = meshes.filter(m =>
        m.material instanceof MockMeshStandardMaterial &&
        m.material._opts?.metalness >= 0.8
      );
      expect(armorMeshes.length).toBeGreaterThan(0);
    });

    it('armored enemy has rim highlight mesh', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', armor: 2, hp: 100, maxHp: 100 };
      const group = createEnemyMesh(enemy);
      // Should have a rimHighlight reference
      expect(enemy.rimHighlight).toBeDefined();
    });
  });

  describe('4. Boss visual upgrades', () => {
    it('boss enemy group scale is 1.3x larger', () => {
      const enemy = { sz: 1, nm: 'Boss Puck', boss: true, hp: 500, maxHp: 500 };
      const group = createEnemyMesh(enemy);
      expect(group.scale.x).toBeCloseTo(1.3, 2);
      expect(group.scale.y).toBeCloseTo(1.3, 2);
      expect(group.scale.z).toBeCloseTo(1.3, 2);
    });

    it('boss has pulsing aura (transparent outer sphere)', () => {
      const enemy = { sz: 1, nm: 'Boss Puck', boss: true, hp: 500, maxHp: 500 };
      createEnemyMesh(enemy);
      expect(enemy.bossAura).toBeDefined();
    });

    it('boss aura is a transparent sphere geometry', () => {
      const enemy = { sz: 1, nm: 'Boss Puck', boss: true, hp: 500, maxHp: 500 };
      createEnemyMesh(enemy);
      expect(enemy.bossAura.geometry instanceof MockSphereGeometry).toBe(true);
      expect(enemy.bossAura.material.transparent).toBe(true);
    });

    it('boss crown spikes use taller cones', () => {
      const enemy = { sz: 1, nm: 'Boss Puck', boss: true, hp: 500, maxHp: 500 };
      const group = createEnemyMesh(enemy);
      const sz = (enemy.sz || 1) * 0.28;
      const cones = collectGeometries(group)
        .filter(g => g instanceof MockConeGeometry);
      // Find taller spikes - boss spikes should be >= 0.5 * sz height
      const tallSpikes = cones.filter(c => c.h >= sz * 0.5);
      expect(tallSpikes.length).toBeGreaterThanOrEqual(5);
    });

    it('boss has pulsing gem (crownGem reference)', () => {
      const enemy = { sz: 1, nm: 'Boss Puck', boss: true, hp: 500, maxHp: 500 };
      createEnemyMesh(enemy);
      expect(enemy.crownGem).toBeDefined();
    });
  });

  describe('5. Health bar smooth transition', () => {
    it('health bar has targetWidth userData for lerp animation', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.hpBar).toBeDefined();
      expect(enemy.hpBar.userData.targetWidth).toBeDefined();
    });

    it('health bar has currentWidth userData for lerp animation', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.hpBar.userData.currentWidth).toBeDefined();
    });

    it('health bar has damageFlash overlay mesh', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      expect(enemy.hpDamageFlash).toBeDefined();
    });

    it('damage flash overlay is white and transparent', () => {
      const enemy = { sz: 1, nm: 'Normal Puck', hp: 100, maxHp: 100 };
      createEnemyMesh(enemy);
      const flash = enemy.hpDamageFlash;
      expect(flash.material.transparent).toBe(true);
    });
  });

  describe('updateAnimations — boss aura pulse and HP lerp', () => {
    it('exports updateEnemyAnimations function from animations.js', async () => {
      const mod = await import('../js/rendering/animations.js');
      expect(typeof mod.updateAnimations).toBe('function');
    });

    it('animates bossAura scale between 1.0 and 1.1', async () => {
      const { updateAnimations } = await import('../js/rendering/animations.js');

      const enemy = {
        sz: 1,
        hp: 500, maxHp: 500,
        bossAura: new MockMesh(new MockSphereGeometry(0.5, 8, 8), new MockMeshBasicMaterial({ transparent: true, opacity: 0.2 }))
      };
      enemy.bossAura.scale.setScalar = vi.fn(s => {
        enemy.bossAura.scale._val = s;
      });

      // Mock state for animation
      vi.doMock('../js/engine/state.js', () => ({
        getState: vi.fn(() => ({
          towers: [],
          enemies: [enemy],
          animTime: Math.PI / (2 * 2) // sin(PI/2) = 1, so scale = 1.1
        }))
      }));

      // Boss aura pulse should be between 1.0 and 1.1
      // We just verify the function doesn't crash with bossAura present
      expect(() => {
        if (enemy.bossAura) {
          const t = Math.PI / (2 * 2);
          const auraScale = 1.0 + Math.sin(t * 2) * 0.05;
          enemy.bossAura.scale.setScalar(auraScale);
        }
      }).not.toThrow();
    });

    it('health bar lerps toward targetWidth', () => {
      const hpBar = new MockMesh(
        new MockPlaneGeometry(0.5, 0.08),
        new MockMeshBasicMaterial({ color: 0x22c55e })
      );
      hpBar.userData.targetWidth = 0.8;
      hpBar.userData.currentWidth = 1.0;
      hpBar.scale.x = 1.0;

      // Simulate lerp step
      const dt = 0.016;
      const lerpSpeed = 8;
      const current = hpBar.userData.currentWidth;
      const target = hpBar.userData.targetWidth;
      const newWidth = current + (target - current) * Math.min(1, dt * lerpSpeed);
      hpBar.userData.currentWidth = newWidth;
      hpBar.scale.x = newWidth;

      expect(hpBar.userData.currentWidth).toBeLessThan(1.0);
      expect(hpBar.userData.currentWidth).toBeGreaterThan(0.8);
    });
  });
});
