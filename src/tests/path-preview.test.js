// Tests for SC-1.5: Enemy Path Preview Lines
// TDD Red phase — describes desired behavior of path-preview.js

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── THREE.js mock ──────────────────────────────────────────────────────────

const mockGeometrySetAttribute = vi.fn();
const mockGeometryDispose = vi.fn();
const mockComputeLineDistances = vi.fn();

function makeBufferGeometry() {
  return {
    setAttribute: mockGeometrySetAttribute,
    dispose: mockGeometryDispose,
    attributes: {}
  };
}

const mockSceneAdd = vi.fn();
const mockSceneRemove = vi.fn();

function makeScene() {
  return { add: mockSceneAdd, remove: mockSceneRemove };
}

const mockMaterialDispose = vi.fn();

// Use vi.fn() constructors so `new` works
const mockLineDashedMaterial = vi.fn().mockImplementation(function (opts) {
  Object.assign(this, opts);
  this.dispose = mockMaterialDispose;
});

const mockLine = vi.fn().mockImplementation(function (geo, mat) {
  this.geometry = geo;
  this.material = mat;
  this.visible = true;
  this.computeLineDistances = mockComputeLineDistances;
});

const mockBufferAttribute = vi.fn().mockImplementation(function (arr, itemSize) {
  this.array = arr;
  this.itemSize = itemSize;
});

const mockBufferGeometry = vi.fn().mockImplementation(makeBufferGeometry);

vi.mock('three', () => ({
  Line: mockLine,
  BufferGeometry: mockBufferGeometry,
  LineDashedMaterial: mockLineDashedMaterial,
  BufferAttribute: mockBufferAttribute
}));

global.THREE = {
  Line: mockLine,
  BufferGeometry: mockBufferGeometry,
  LineDashedMaterial: mockLineDashedMaterial,
  BufferAttribute: mockBufferAttribute
};

// ── Events mock ────────────────────────────────────────────────────────────

vi.mock('../js/engine/events.js', () => ({
  on: vi.fn(),
  off: vi.fn(),
  GameEvents: { NAV_CHANGE: 'state:nav', WAVE_START: 'wave:start', WAVE_END: 'wave:end' }
}));

// ── State mock ─────────────────────────────────────────────────────────────

let mockState = {};

vi.mock('../js/engine/state.js', () => ({
  getState: () => mockState
}));

// ── Pathfinding mock ───────────────────────────────────────────────────────

const mockFindPathGrid = vi.fn();

vi.mock('../js/systems/pathfinding.js', () => ({
  findPathGrid: (...args) => mockFindPathGrid(...args)
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'ground', tower: null }))
  );
}

function setupState(overrides = {}) {
  const COLS = 10;
  const ROWS = 8;
  mockState = {
    theme: 'hockey',
    COLS,
    ROWS,
    SPAWNS: [{ x: 0, y: 0 }, { x: 9, y: 7 }],
    BASE: { x: 5, y: 4 },
    grid: makeGrid(COLS, ROWS),
    waveActive: false,
    ...overrides
  };
}

// ── Tests: createPathPreview ───────────────────────────────────────────────

describe('createPathPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupState();
  });

  it('creates one Line per spawn point', async () => {
    const { createPathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);

    // 2 spawns → 2 lines added to scene
    expect(mockSceneAdd).toHaveBeenCalledTimes(2);
  });

  it('uses LineDashedMaterial with correct properties', async () => {
    const { createPathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);

    expect(mockLineDashedMaterial).toHaveBeenCalled();
    const instance = mockLineDashedMaterial.mock.instances[0];
    expect(instance.transparent).toBe(true);
    expect(instance.opacity).toBe(0.3);
    expect(instance.dashSize).toBeGreaterThan(0);
    expect(instance.gapSize).toBeGreaterThan(0);
  });

  it('uses hockey theme color (light cyan 0x88ddff) for hockey theme', async () => {
    const { createPathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);

    const instance = mockLineDashedMaterial.mock.instances[0];
    expect(instance.color).toBe(0x88ddff);
  });

  it('uses soccer theme color (light green 0x88ffaa) for soccer theme', async () => {
    setupState({ theme: 'soccer' });
    const { createPathPreview } = await import('../js/rendering/path-preview.js');
    vi.clearAllMocks();
    const scene = makeScene();

    createPathPreview(scene);

    const instance = mockLineDashedMaterial.mock.instances[0];
    expect(instance.color).toBe(0x88ffaa);
  });

  it('returns a handle object', async () => {
    const { createPathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    const handle = createPathPreview(scene);

    expect(handle).toBeDefined();
    expect(typeof handle).toBe('object');
  });
});

// ── Tests: updatePathPreview ───────────────────────────────────────────────

describe('updatePathPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupState();
  });

  it('calls findPathGrid for each spawn pointing to BASE', async () => {
    const { createPathPreview, updatePathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();
    mockFindPathGrid.mockReturnValue([[0, 0], [1, 0], [2, 0]]);

    createPathPreview(scene);
    updatePathPreview();

    expect(mockFindPathGrid).toHaveBeenCalledTimes(2);
    const { SPAWNS, BASE } = mockState;
    expect(mockFindPathGrid).toHaveBeenCalledWith(SPAWNS[0].x, SPAWNS[0].y, BASE.x, BASE.y);
    expect(mockFindPathGrid).toHaveBeenCalledWith(SPAWNS[1].x, SPAWNS[1].y, BASE.x, BASE.y);
  });

  it('hides line when path is null', async () => {
    const { createPathPreview, updatePathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();
    mockFindPathGrid
      .mockReturnValueOnce(null)
      .mockReturnValueOnce([[0, 0], [5, 4]]);

    createPathPreview(scene);
    updatePathPreview();

    const lines = mockLine.mock.instances;
    expect(lines[0].visible).toBe(false);
    expect(lines[1].visible).toBe(true);
  });

  it('calls computeLineDistances after updating geometry with a valid path', async () => {
    const { createPathPreview, updatePathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();
    mockFindPathGrid.mockReturnValue([[0, 0], [1, 0], [2, 0], [5, 4]]);

    createPathPreview(scene);
    vi.clearAllMocks();
    mockFindPathGrid.mockReturnValue([[0, 0], [1, 0], [2, 0], [5, 4]]);
    updatePathPreview();

    expect(mockComputeLineDistances).toHaveBeenCalled();
  });

  it('places line points at Y=0.05', async () => {
    const { createPathPreview, updatePathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();
    mockFindPathGrid.mockReturnValue([[0, 0], [1, 0]]);

    createPathPreview(scene);
    updatePathPreview();

    // BufferAttribute called with a Float32Array; Y values are at indices 1, 4, ...
    const attrInstances = mockBufferAttribute.mock.instances;
    const posAttr = attrInstances.find(a => a.itemSize === 3);
    expect(posAttr).toBeDefined();
    // Y value of first point (index 1 in flat array)
    expect(posAttr.array[1]).toBeCloseTo(0.05, 3);
  });

  it('reuses geometry — no new Line objects created on repeated updates', async () => {
    const { createPathPreview, updatePathPreview } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();
    mockFindPathGrid.mockReturnValue([[0, 0], [5, 4]]);

    createPathPreview(scene);
    const initialLineCount = mockLine.mock.calls.length;

    updatePathPreview();
    updatePathPreview();
    updatePathPreview();

    expect(mockLine.mock.calls.length).toBe(initialLineCount);
  });
});

// ── Tests: setPathPreviewVisible ───────────────────────────────────────────

describe('setPathPreviewVisible', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupState();
  });

  it('hides all lines when visible=false', async () => {
    const { createPathPreview, setPathPreviewVisible } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);
    setPathPreviewVisible(false);

    const lines = mockLine.mock.instances;
    lines.forEach(line => {
      expect(line.visible).toBe(false);
    });
  });

  it('shows all lines when visible=true', async () => {
    const { createPathPreview, setPathPreviewVisible } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);
    setPathPreviewVisible(false);
    setPathPreviewVisible(true);

    const lines = mockLine.mock.instances;
    lines.forEach(line => {
      expect(line.visible).toBe(true);
    });
  });

  it('fades lines to opacity 0.15 during active wave', async () => {
    const { createPathPreview, setPathPreviewVisible } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);
    setPathPreviewVisible(false, true); // waveActive = true

    const lines = mockLine.mock.instances;
    lines.forEach(line => {
      expect(line.material.opacity).toBe(0.15);
      expect(line.visible).toBe(true);
    });
  });

  it('restores opacity to 0.3 when wave ends', async () => {
    const { createPathPreview, setPathPreviewVisible } = await import('../js/rendering/path-preview.js');
    const scene = makeScene();

    createPathPreview(scene);
    setPathPreviewVisible(false, true);  // wave starts — fade
    setPathPreviewVisible(true, false);  // wave ends — full

    const lines = mockLine.mock.instances;
    lines.forEach(line => {
      expect(line.material.opacity).toBe(0.3);
    });
  });
});
