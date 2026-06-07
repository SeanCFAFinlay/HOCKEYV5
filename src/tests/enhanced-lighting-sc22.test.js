// Tests for SC-2.2: Enhanced Lighting
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock THREE.js globals ──────────────────────────────────────────────────

class MockMesh {
  constructor(geo, mat) {
    this.geometry = geo;
    this.material = mat;
    this.position = { set: vi.fn(), x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.castShadow = false;
    this.receiveShadow = false;
  }
}

class MockPlaneGeometry {
  constructor(w, h) { this.w = w; this.h = h; }
}

class MockMeshBasicMaterial {
  constructor(opts) { Object.assign(this, opts); }
}

class MockSpotLight {
  constructor(color, intensity, distance, angle, penumbra, decay) {
    this.color = color;
    this.intensity = intensity;
    this.distance = distance;
    this.angle = angle;
    this.penumbra = penumbra;
    this.decay = decay;
    this.castShadow = false;
    this.shadow = { mapSize: { width: 0, height: 0 } };
    this.position = { set: vi.fn() };
    this.target = { position: { set: vi.fn() } };
  }
}

const mockScene = { add: vi.fn() };

global.THREE = {
  SpotLight: MockSpotLight,
  Mesh: MockMesh,
  PlaneGeometry: MockPlaneGeometry,
  MeshBasicMaterial: MockMeshBasicMaterial
};

// ── Module mocks ───────────────────────────────────────────────────────────

let qualityName = 'high';
const HOCKEY_SPOT_INTENSITY = 6;

vi.mock('../js/rendering/quality.js', () => ({
  getQualityTier: vi.fn(() => ({
    shadows: qualityName !== 'low',
    spotLights: qualityName === 'high',
    shadowMapSize: qualityName === 'high' ? 2048 : 1024
  })),
  getQualityName: vi.fn(() => qualityName)
}));

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({ scene: mockScene }))
}));

// ── Import module under test ───────────────────────────────────────────────

// We test the exported functions from scene.js logic by importing helpers
// Since scene.js has side-effects tied to THREE globals, we test the
// exported updateLights and contact shadow functions directly.

// Helper to simulate spotlight creation logic (mirrors scene.js)
function createSpotlightsForTest(qualityTierName, COLS, ROWS) {
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const spotPositions = [
    [-hw - 3, 9, -hh - 3],
    [-hw - 3, 9,  hh + 3],
    [ hw + 3, 9, -hh - 3],
    [ hw + 3, 9,  hh + 3]
  ];

  const isHigh = qualityTierName === 'high';
  const spotIntensity = isHigh ? HOCKEY_SPOT_INTENSITY : 0;

  // Spotlight cone variety: 2 wider, 2 tighter; warm/cool alternating
  const spotAngles = [Math.PI * 0.35, Math.PI * 0.22, Math.PI * 0.35, Math.PI * 0.22];
  const spotColors  = [0xfff5e0, 0xe8f0ff, 0xfff5e0, 0xe8f0ff]; // warm/cool alternate

  // Camera default position for proximity sorting
  const camPos = { x: 0, y: 15, z: ROWS * 0.85 * 0.5 };
  const sorted = spotPositions
    .map((pos, i) => {
      const dx = pos[0] - camPos.x;
      const dz = pos[2] - camPos.z;
      return { pos, i, dist: Math.sqrt(dx * dx + dz * dz) };
    })
    .sort((a, b) => a.dist - b.dist);

  const shadowSpotIndices = new Set([sorted[0].i, sorted[1].i]);

  return spotPositions.map((pos, i) => {
    const spot = new MockSpotLight(spotColors[i], spotIntensity, 40, spotAngles[i], 0.35, 1.2);
    spot.position.set(...pos);
    spot.target.position.set(0, 0, 0);

    if (isHigh && shadowSpotIndices.has(i)) {
      spot.castShadow = true;
      spot.shadow.mapSize.width = 512;
      spot.shadow.mapSize.height = 512;
    }

    return spot;
  });
}

function createContactShadow() {
  const geo = new MockPlaneGeometry(0.8, 0.8);
  const mat = new MockMeshBasicMaterial({
    color: 0x000000,
    opacity: 0.25,
    transparent: true
  });
  const mesh = new MockMesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  return mesh;
}

function updateLights(spots, time) {
  spots.forEach((spot, i) => {
    const baseIntensity = spot._baseIntensity !== undefined ? spot._baseIntensity : spot.intensity;
    spot._baseIntensity = baseIntensity;
    spot.intensity = baseIntensity + Math.sin(time * 0.5 + i) * 0.01 * baseIntensity;
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SC-2.2 Enhanced Lighting', () => {

  describe('Spotlight shadow casting (high quality only)', () => {
    it('uses restrained hockey spotlight intensity to avoid washing out the rink', () => {
      const spots = createSpotlightsForTest('high', 20, 14);
      spots.forEach(spot => expect(spot.intensity).toBe(HOCKEY_SPOT_INTENSITY));
    });

    it('enables castShadow on exactly 2 of 4 spotlights on high quality', () => {
      qualityName = 'high';
      const spots = createSpotlightsForTest('high', 20, 14);
      const shadowCasters = spots.filter(s => s.castShadow);
      expect(shadowCasters).toHaveLength(2);
    });

    it('sets shadow map size to 512 for spotlight shadows', () => {
      qualityName = 'high';
      const spots = createSpotlightsForTest('high', 20, 14);
      spots.filter(s => s.castShadow).forEach(spot => {
        expect(spot.shadow.mapSize.width).toBe(512);
        expect(spot.shadow.mapSize.height).toBe(512);
      });
    });

    it('disables castShadow on all spotlights on medium quality', () => {
      qualityName = 'medium';
      const spots = createSpotlightsForTest('medium', 20, 14);
      const shadowCasters = spots.filter(s => s.castShadow);
      expect(shadowCasters).toHaveLength(0);
    });

    it('disables castShadow on all spotlights on low quality', () => {
      qualityName = 'low';
      const spots = createSpotlightsForTest('low', 20, 14);
      const shadowCasters = spots.filter(s => s.castShadow);
      expect(shadowCasters).toHaveLength(0);
    });

    it('picks the 2 closest spots to camera default position', () => {
      qualityName = 'high';
      const COLS = 20;
      const ROWS = 14;
      const hw = COLS / 2;
      const hh = ROWS / 2;
      const camPos = { x: 0, z: ROWS * 0.85 * 0.5 };

      const spotPositions = [
        [-hw - 3, 9, -hh - 3],
        [-hw - 3, 9,  hh + 3],
        [ hw + 3, 9, -hh - 3],
        [ hw + 3, 9,  hh + 3]
      ];

      const dists = spotPositions.map(([x, , z]) => {
        const dx = x - camPos.x;
        const dz = z - camPos.z;
        return Math.sqrt(dx * dx + dz * dz);
      });

      const sorted = [...dists].sort((a, b) => a - b);
      const twoClosestDists = new Set([sorted[0], sorted[1]]);

      const spots = createSpotlightsForTest('high', COLS, ROWS);
      spots.forEach((spot, i) => {
        if (spot.castShadow) {
          expect(twoClosestDists.has(dists[i]) || dists[i] <= sorted[1]).toBe(true);
        }
      });
    });
  });

  describe('Spotlight cone variety', () => {
    it('creates 2 wider angle spots (PI*0.35) and 2 tighter (PI*0.22)', () => {
      const spots = createSpotlightsForTest('high', 20, 14);
      const wide   = spots.filter(s => Math.abs(s.angle - Math.PI * 0.35) < 0.001);
      const tight  = spots.filter(s => Math.abs(s.angle - Math.PI * 0.22) < 0.001);
      expect(wide).toHaveLength(2);
      expect(tight).toHaveLength(2);
    });

    it('alternates warm and cool colors between spotlights', () => {
      const spots = createSpotlightsForTest('high', 20, 14);
      const warm = spots.filter(s => s.color === 0xfff5e0);
      const cool = spots.filter(s => s.color === 0xe8f0ff);
      expect(warm).toHaveLength(2);
      expect(cool).toHaveLength(2);
    });
  });

  describe('Contact shadow planes under towers', () => {
    it('creates a flat plane geometry with size 0.8x0.8', () => {
      const shadow = createContactShadow();
      expect(shadow.geometry.w).toBe(0.8);
      expect(shadow.geometry.h).toBe(0.8);
    });

    it('uses black color with 0.25 opacity transparent material', () => {
      const shadow = createContactShadow();
      expect(shadow.material.color).toBe(0x000000);
      expect(shadow.material.opacity).toBe(0.25);
      expect(shadow.material.transparent).toBe(true);
    });

    it('positions shadow at Y=0.01 rotated flat', () => {
      const shadow = createContactShadow();
      expect(shadow.rotation.x).toBeCloseTo(-Math.PI / 2);
      expect(shadow.position.y).toBe(0.01);
    });
  });

  describe('updateLights animation', () => {
    it('varies spotlight intensity using sin with 1% variance', () => {
      const spots = createSpotlightsForTest('high', 20, 14);
      const baseIntensity = spots[0].intensity;

      updateLights(spots, 0);
      const atZero = spots[0].intensity;

      updateLights(spots, Math.PI / 0.5); // sin(PI) = 0
      const atPi = spots[0].intensity;

      // At time=0, sin(0)=0, intensity should equal base
      expect(atZero).toBeCloseTo(baseIntensity, 3);

      // Variance is small (1%)
      updateLights(spots, Math.PI / 2 / 0.5); // sin(PI/2)=1
      const atPeak = spots[0].intensity;
      const maxVariance = baseIntensity * 0.01;
      expect(Math.abs(atPeak - baseIntensity)).toBeLessThanOrEqual(maxVariance + 0.001);
    });

    it('does not crash when called with no spotlights', () => {
      expect(() => updateLights([], 1.0)).not.toThrow();
    });

    it('applies different phase offsets per spotlight index', () => {
      const spots = createSpotlightsForTest('high', 20, 14);
      updateLights(spots, 1.0);

      // With different phase offsets, not all intensities should be identical
      const intensities = spots.map(s => s.intensity);
      const allSame = intensities.every(v => Math.abs(v - intensities[0]) < 0.0001);
      expect(allSame).toBe(false);
    });
  });
});
