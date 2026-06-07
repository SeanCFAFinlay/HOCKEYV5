// SC-3.7: Screen Effects Tests
// TDD Red phase: describe desired behavior for dynamic screen effects

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── Mock THREE globals ──────────────────────────────────────────────────────

function MockWebGLRenderTarget() {
  this.texture = {};
  this.setSize = vi.fn();
  this.dispose = vi.fn();
}

function MockShaderMaterial(opts) {
  this.uniforms = (opts && opts.uniforms) ? opts.uniforms : {};
  this.vertexShader   = opts && opts.vertexShader;
  this.fragmentShader = opts && opts.fragmentShader;
  this.type = 'ShaderMaterial';
}

function MockOrthographicCamera() {
  this.updateProjectionMatrix = vi.fn();
}

function MockScene() {
  this.add = vi.fn();
}

function MockPlaneGeometry() {}
function MockMesh() {}

function MockVector2(x, y) {
  this.x = x;
  this.y = y;
}

function MockVector3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.set = vi.fn((nextX, nextY, nextZ) => {
    this.x = nextX;
    this.y = nextY;
    this.z = nextZ;
    return this;
  });
}

function MockColor(hex = 0xffffff) {
  this.hex = hex;
  this.r = 1;
  this.g = 1;
  this.b = 1;
  this.setHex = vi.fn((nextHex) => {
    this.hex = nextHex;
    return this;
  });
}

const mockRenderer = {
  domElement: { nodeName: 'CANVAS', width: 800, height: 600 },
  getSize: vi.fn(() => ({ width: 800, height: 600 })),
  getPixelRatio: vi.fn(() => 1),
  render: vi.fn(),
  setRenderTarget: vi.fn(),
  clear: vi.fn(),
  autoClear: true,
  capabilities: { isWebGL2: false }
};

const mockScene  = { isScene: true };
const mockCamera = { isCamera: true };

beforeEach(() => {
  globalThis.THREE = {
    WebGLRenderTarget:   vi.fn(function(w, h, opts) { MockWebGLRenderTarget.call(this); }),
    LinearFilter:        1006,
    RGBAFormat:          1023,
    HalfFloatType:       1016,
    UnsignedByteType:    1009,
    NoBlending:          0,
    NormalBlending:      1,
    AdditiveBlending:    2,
    ShaderMaterial:      vi.fn(function(opts) { MockShaderMaterial.call(this, opts); }),
    OrthographicCamera:  vi.fn(function() { MockOrthographicCamera.call(this); }),
    Scene:               vi.fn(function() { MockScene.call(this); }),
    PlaneGeometry:       vi.fn(function() { MockPlaneGeometry.call(this); }),
    Mesh:                vi.fn(function() { MockMesh.call(this); }),
    Vector2:             vi.fn(function(x, y) { MockVector2.call(this, x, y); }),
    Vector3:             vi.fn(function(x, y, z) { MockVector3.call(this, x, y, z); }),
    Color:               vi.fn(function(hex) { MockColor.call(this, hex); })
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.resetModules();
  vi.useRealTimers();
});

// ── Helper to get fresh module + initialized composer ──────────────────────

async function makeComposer() {
  vi.resetModules();
  const mod = await import('../js/engine/postprocessing.js');
  const composer = mod.initPostProcessing(mockRenderer, mockScene, mockCamera);
  return { mod, composer };
}

// ── setDangerVignette ───────────────────────────────────────────────────────

describe('setDangerVignette', () => {
  it('is exported as a function', async () => {
    const { mod } = await makeComposer();
    expect(typeof mod.setDangerVignette).toBe('function');
  });

  it('activates danger mode without throwing', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.setDangerVignette(true)).not.toThrow();
  });

  it('deactivates danger mode without throwing', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.setDangerVignette(false)).not.toThrow();
  });

  it('works before initPostProcessing is called (no-op)', async () => {
    vi.resetModules();
    const mod = await import('../js/engine/postprocessing.js');
    expect(() => mod.setDangerVignette(true)).not.toThrow();
  });

  it('sets dangerMode flag on the vignette pass when active', async () => {
    const { mod, composer } = await makeComposer();
    mod.setDangerVignette(true);
    const vp = composer.passes.find(p => p.name === 'VignettePass');
    expect(vp).toBeDefined();
    // dangerMode uniform or internal flag should be set
    expect(vp.uniforms.dangerMode.value).toBe(1);
  });

  it('clears dangerMode flag when deactivated', async () => {
    const { mod, composer } = await makeComposer();
    mod.setDangerVignette(true);
    mod.setDangerVignette(false);
    const vp = composer.passes.find(p => p.name === 'VignettePass');
    expect(vp.uniforms.dangerMode.value).toBe(0);
  });
});

// ── triggerScreenFlash ──────────────────────────────────────────────────────

describe('triggerScreenFlash', () => {
  it('is exported as a function', async () => {
    const { mod } = await makeComposer();
    expect(typeof mod.triggerScreenFlash).toBe('function');
  });

  it('accepts no arguments (defaults)', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.triggerScreenFlash()).not.toThrow();
  });

  it('accepts color and duration arguments', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.triggerScreenFlash(0xffffff, 100)).not.toThrow();
  });

  it('works before initPostProcessing is called (no-op)', async () => {
    vi.resetModules();
    const mod = await import('../js/engine/postprocessing.js');
    expect(() => mod.triggerScreenFlash()).not.toThrow();
  });

  it('adds or enables a FlashPass in the composer passes', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerScreenFlash(0xffffff, 200);
    const fp = composer.passes.find(p => p.name === 'FlashPass');
    expect(fp).toBeDefined();
    expect(fp.enabled).toBe(true);
  });

  it('flash pass has flashOpacity uniform', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerScreenFlash(0xffffff, 200);
    const fp = composer.passes.find(p => p.name === 'FlashPass');
    expect(fp.uniforms).toHaveProperty('flashOpacity');
  });

  it('flash pass stores flashColor as an RGB color uniform', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerScreenFlash(0xff8844, 200);
    const fp = composer.passes.find(p => p.name === 'FlashPass');
    expect(fp.uniforms).toHaveProperty('flashColor');
    expect(fp.uniforms.flashColor.value).toHaveProperty('x');
    expect(fp.uniforms.flashColor.value).toHaveProperty('y');
    expect(fp.uniforms.flashColor.value).toHaveProperty('z');
    expect(globalThis.THREE.Color).toHaveBeenCalledWith(0xff8844);
    expect(fp.uniforms.flashColor.value.set).toHaveBeenCalledWith(1, 1, 1);
  });
});

// ── triggerChromaticAberration ──────────────────────────────────────────────

describe('triggerChromaticAberration', () => {
  it('is exported as a function', async () => {
    const { mod } = await makeComposer();
    expect(typeof mod.triggerChromaticAberration).toBe('function');
  });

  it('accepts no arguments (defaults)', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.triggerChromaticAberration()).not.toThrow();
  });

  it('accepts intensity and duration arguments', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.triggerChromaticAberration(0.005, 200)).not.toThrow();
  });

  it('works before initPostProcessing is called (no-op)', async () => {
    vi.resetModules();
    const mod = await import('../js/engine/postprocessing.js');
    expect(() => mod.triggerChromaticAberration()).not.toThrow();
  });

  it('enables ChromaticAberrationPass in the composer', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerChromaticAberration(0.005, 200);
    const cp = composer.passes.find(p => p.name === 'ChromaticAberrationPass');
    expect(cp).toBeDefined();
    expect(cp.enabled).toBe(true);
  });

  it('sets initial intensity on the ChromaticAberrationPass uniform', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerChromaticAberration(0.008, 200);
    const cp = composer.passes.find(p => p.name === 'ChromaticAberrationPass');
    expect(cp.uniforms.intensity.value).toBeCloseTo(0.008);
  });
});

// ── setSpeedEffect ──────────────────────────────────────────────────────────

describe('setSpeedEffect', () => {
  it('is exported as a function', async () => {
    const { mod } = await makeComposer();
    expect(typeof mod.setSpeedEffect).toBe('function');
  });

  it('accepts speedMultiplier without throwing', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.setSpeedEffect(1)).not.toThrow();
    expect(() => mod.setSpeedEffect(2)).not.toThrow();
    expect(() => mod.setSpeedEffect(3)).not.toThrow();
  });

  it('works before initPostProcessing is called (no-op)', async () => {
    vi.resetModules();
    const mod = await import('../js/engine/postprocessing.js');
    expect(() => mod.setSpeedEffect(3)).not.toThrow();
  });

  it('at 1x speed, vignette darkness is at normal level (≤0.4)', async () => {
    const { mod, composer } = await makeComposer();
    mod.setSpeedEffect(1);
    const vp = composer.passes.find(p => p.name === 'VignettePass');
    expect(vp.uniforms.speedDarkness.value).toBeLessThanOrEqual(0.4);
  });

  it('at 3x speed, vignette speed darkness is greater than at 1x', async () => {
    const { mod, composer } = await makeComposer();
    mod.setSpeedEffect(1);
    const vp = composer.passes.find(p => p.name === 'VignettePass');
    const val1x = vp.uniforms.speedDarkness.value;

    mod.setSpeedEffect(3);
    const val3x = vp.uniforms.speedDarkness.value;

    expect(val3x).toBeGreaterThan(val1x);
  });
});

// ── updateScreenEffects ─────────────────────────────────────────────────────

describe('updateScreenEffects', () => {
  it('is exported as a function', async () => {
    const { mod } = await makeComposer();
    expect(typeof mod.updateScreenEffects).toBe('function');
  });

  it('accepts a dt argument without throwing', async () => {
    const { mod } = await makeComposer();
    expect(() => mod.updateScreenEffects(0.016)).not.toThrow();
  });

  it('works before initPostProcessing is called (no-op)', async () => {
    vi.resetModules();
    const mod = await import('../js/engine/postprocessing.js');
    expect(() => mod.updateScreenEffects(0.016)).not.toThrow();
  });

  it('updates danger vignette darkness over time (pulsing)', async () => {
    const { mod, composer } = await makeComposer();
    mod.setDangerVignette(true);

    const vp = composer.passes.find(p => p.name === 'VignettePass');
    const before = vp.uniforms.darkness.value;

    // advance half a period (0.5s at 1Hz) so the pulse moves
    mod.updateScreenEffects(0.25);
    mod.updateScreenEffects(0.25);

    const after = vp.uniforms.darkness.value;
    // darkness should have changed due to pulse
    expect(after).not.toBeCloseTo(before, 1);
  });

  it('decays chromatic aberration intensity over time', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerChromaticAberration(0.01, 200);

    const cp = composer.passes.find(p => p.name === 'ChromaticAberrationPass');
    const initial = cp.uniforms.intensity.value;

    mod.updateScreenEffects(0.1); // 100ms
    const after = cp.uniforms.intensity.value;

    expect(after).toBeLessThan(initial);
  });

  it('disables ChromaticAberrationPass after full duration elapses', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerChromaticAberration(0.01, 200);

    const cp = composer.passes.find(p => p.name === 'ChromaticAberrationPass');

    mod.updateScreenEffects(0.201); // past 200ms
    expect(cp.enabled).toBe(false);
  });

  it('flash opacity ramps 0→peak→0 over the flash duration', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerScreenFlash(0xffffff, 200);

    const fp = composer.passes.find(p => p.name === 'FlashPass');

    // at midpoint opacity should be non-zero
    mod.updateScreenEffects(0.1);
    const mid = fp.uniforms.flashOpacity.value;
    expect(mid).toBeGreaterThan(0);

    // after full duration it should be near 0 / disabled
    mod.updateScreenEffects(0.101);
    expect(fp.uniforms.flashOpacity.value).toBeCloseTo(0, 2);
  });

  it('disables FlashPass after duration elapses', async () => {
    const { mod, composer } = await makeComposer();
    mod.triggerScreenFlash(0xffffff, 100);

    const fp = composer.passes.find(p => p.name === 'FlashPass');
    mod.updateScreenEffects(0.101); // past 100ms
    expect(fp.enabled).toBe(false);
  });
});
