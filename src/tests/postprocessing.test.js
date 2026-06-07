// SC-2.1: Post-Processing Pipeline Tests
// TDD Red phase: describe desired behavior

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── Mock THREE globals ──────────────────────────────────────────────────────

const mockRenderTarget = {
  setSize: vi.fn(),
  dispose: vi.fn(),
  texture: {},
  depthBuffer: true,
  stencilBuffer: false
};

function MockWebGLRenderTarget() {
  return Object.assign(this, { ...mockRenderTarget });
}
MockWebGLRenderTarget.prototype.setSize = vi.fn();
MockWebGLRenderTarget.prototype.dispose = vi.fn();
const mockWebGLRenderTarget = vi.fn(MockWebGLRenderTarget);

const mockScene = { isScene: true };
const mockCamera = { isCamera: true };

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

// ── Constructor mocks (must be usable with `new`) ───────────────────────────

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

// ── Setup globals before module import ─────────────────────────────────────

beforeEach(() => {
  globalThis.THREE = {
    WebGLRenderTarget: mockWebGLRenderTarget,
    LinearFilter: 1006,
    RGBAFormat: 1023,
    HalfFloatType: 1016,
    UnsignedByteType: 1009,
    NoBlending: 0,
    NormalBlending: 1,
    AdditiveBlending: 2,
    ShaderMaterial:      vi.fn(function(opts) { MockShaderMaterial.call(this, opts); }),
    OrthographicCamera:  vi.fn(function() { MockOrthographicCamera.call(this); }),
    Scene:               vi.fn(function() { MockScene.call(this); }),
    PlaneGeometry:       vi.fn(function() { MockPlaneGeometry.call(this); }),
    Mesh:                vi.fn(function() { MockMesh.call(this); }),
    Vector2:             vi.fn(function(x, y) { MockVector2.call(this, x, y); }),
    Vector3:             vi.fn(function(x, y, z) { MockVector3.call(this, x, y, z); }),
    Color:               vi.fn(function(hex) { MockColor.call(this, hex); })
  };
});

afterEach(() => {
  vi.resetModules();
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('initPostProcessing', () => {
  it('returns a composer object with render and setSize methods', async () => {
    const { initPostProcessing } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);

    expect(composer).toBeDefined();
    expect(typeof composer.render).toBe('function');
    expect(typeof composer.setSize).toBe('function');
  });

  it('returns composer with passes array containing at least a render pass', async () => {
    const { initPostProcessing } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);

    expect(Array.isArray(composer.passes)).toBe(true);
    expect(composer.passes.length).toBeGreaterThanOrEqual(1);
  });

  it('returns composer referencing the provided renderer', async () => {
    const { initPostProcessing } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);

    expect(composer.renderer).toBe(mockRenderer);
  });

  it('stores scene and camera references', async () => {
    const { initPostProcessing } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);

    // At minimum, the first pass should reference scene and camera
    const renderPass = composer.passes[0];
    expect(renderPass.scene).toBe(mockScene);
    expect(renderPass.camera).toBe(mockCamera);
  });
});

describe('resizePostProcessing', () => {
  it('returns false (no-op) before initPostProcessing is called', async () => {
    vi.resetModules();
    const { resizePostProcessing } = await import('../js/engine/postprocessing.js');
    const result = resizePostProcessing(1024, 768);
    expect(result).toBe(false);
  });

  it('calls setSize on composer after init', async () => {
    vi.resetModules();
    const { initPostProcessing, resizePostProcessing } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);
    const setSizeSpy = vi.spyOn(composer, 'setSize');

    resizePostProcessing(1280, 720);

    expect(setSizeSpy).toHaveBeenCalledWith(1280, 720);
  });

  it('returns true after a successful resize', async () => {
    vi.resetModules();
    const { initPostProcessing, resizePostProcessing } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    const result = resizePostProcessing(1280, 720);
    expect(result).toBe(true);
  });
});

describe('setPostProcessingQuality', () => {
  it('disables post-processing for low tier', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality, isPostProcessingEnabled } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    setPostProcessingQuality('low');
    expect(isPostProcessingEnabled()).toBe(false);
  });

  it('enables post-processing for medium tier', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality, isPostProcessingEnabled } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    setPostProcessingQuality('medium');
    expect(isPostProcessingEnabled()).toBe(true);
  });

  it('enables post-processing for high tier', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality, isPostProcessingEnabled } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    setPostProcessingQuality('high');
    expect(isPostProcessingEnabled()).toBe(true);
  });

  it('sets bloom strength to 0.14 for medium tier', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality, getBloomStrength } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    setPostProcessingQuality('medium');
    expect(getBloomStrength()).toBeCloseTo(0.14);
  });

  it('sets bloom strength to 0.26 for high tier', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality, getBloomStrength } = await import('../js/engine/postprocessing.js');
    initPostProcessing(mockRenderer, mockScene, mockCamera);

    setPostProcessingQuality('high');
    expect(getBloomStrength()).toBeCloseTo(0.26);
  });
});

describe('composer render method', () => {
  it('calls through to renderer.render when invoked', async () => {
    vi.resetModules();
    const { initPostProcessing } = await import('../js/engine/postprocessing.js');
    const localRenderer = { ...mockRenderer, render: vi.fn() };
    const composer = initPostProcessing(localRenderer, mockScene, mockCamera);

    composer.render();

    expect(localRenderer.render).toHaveBeenCalledWith(mockScene, mockCamera);
  });
});

describe('vignette pass', () => {
  it('composer has a vignette pass with offset and darkness uniforms (high quality)', async () => {
    vi.resetModules();
    const { initPostProcessing, setPostProcessingQuality } = await import('../js/engine/postprocessing.js');
    const composer = initPostProcessing(mockRenderer, mockScene, mockCamera);
    setPostProcessingQuality('high');

    const vignettePass = composer.passes.find(p => p.name === 'VignettePass');
    expect(vignettePass).toBeDefined();
    expect(vignettePass.uniforms).toHaveProperty('offset');
    expect(vignettePass.uniforms).toHaveProperty('darkness');
    expect(vignettePass.uniforms.offset.value).toBeCloseTo(0.95);
    expect(vignettePass.uniforms.darkness.value).toBeCloseTo(0.4);
  });
});
