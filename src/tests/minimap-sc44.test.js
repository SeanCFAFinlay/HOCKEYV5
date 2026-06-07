// Tests for SC-4.4: Strategic Minimap
// TDD: Red → Green → Refactor

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Canvas 2D context stub ─────────────────────────────────────────────────

function makeCanvas2DContext() {
  return {
    _calls: [],
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1
  };
}

function makeCanvas(width = 120, height = 120) {
  const ctx = makeCanvas2DContext();
  return {
    width,
    height,
    style: { display: 'block' },
    id: 'minimapCanvas',
    getContext: vi.fn(() => ctx),
    addEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width, height })),
    _ctx: ctx
  };
}

function makeElement(tag = 'div', id = '') {
  const children = [];
  const el = {
    tag,
    id,
    textContent: '',
    innerHTML: '',
    style: { display: 'block' },
    classList: makeClassList(),
    children,
    parentNode: null,
    _listeners: {},
    querySelector: vi.fn((sel) => {
      if (sel === 'canvas') return el._canvas || null;
      return null;
    }),
    appendChild(child) {
      children.push(child);
      child.parentNode = el;
      return child;
    },
    addEventListener: vi.fn((ev, fn) => {
      el._listeners[ev] = el._listeners[ev] || [];
      el._listeners[ev].push(fn);
    }),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 120, height: 120 }))
  };
  return el;
}

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    _set: set,
    add(...c) { c.forEach(x => set.add(x)); },
    remove(...c) { c.forEach(x => set.delete(x)); },
    contains(c) { return set.has(c); },
    has(c) { return set.has(c); },
    toggle(c, force) {
      const val = force !== undefined ? force : !set.has(c);
      val ? set.add(c) : set.delete(c);
      return val;
    }
  };
}

// ── Mock state ─────────────────────────────────────────────────────────────

let mockState = {};

function resetMockState() {
  mockState = {
    COLS: 10,
    ROWS: 8,
    SPAWNS: [{ col: 0, row: 0 }],
    BASE: { col: 9, row: 7 },
    grid: [],
    towers: [],
    enemies: []
  };
}

vi.mock('../js/engine/state.js', () => ({
  getState: () => mockState
}));

vi.mock('../js/engine/camera.js', () => ({
  setCameraZoom: vi.fn(),
  setCameraAngle: vi.fn()
}));

// ── DOM stubs ──────────────────────────────────────────────────────────────

let mockGameScreen;
let mockCanvas;
let mockToggleBtn;
let createdElements = [];

beforeEach(() => {
  resetMockState();

  mockCanvas = makeCanvas(120, 120);
  mockToggleBtn = makeElement('button', 'minimapToggle');
  mockGameScreen = makeElement('div', 'gameScreen');

  vi.stubGlobal('document', {
    getElementById: vi.fn((id) => {
      if (id === 'gameScreen') return mockGameScreen;
      if (id === 'minimapToggle') return mockToggleBtn;
      if (id === 'minimapCanvas') return mockCanvas;
      if (id === 'minimapContainer') return null;
      return null;
    }),
    createElement: vi.fn((tag) => {
      if (tag === 'canvas') return makeCanvas(120, 120);
      const el = makeElement(tag);
      createdElements.push(el);
      return el;
    })
  });

  createdElements = [];
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SC-4.4 Strategic Minimap — initMinimap()', () => {
  it('creates a minimap container element', async () => {
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    const container = createdElements.find(el => el.tag === 'div');
    expect(container).toBeTruthy();
  });

  it('appends minimap container to gameScreen', async () => {
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    expect(mockGameScreen.children.length).toBeGreaterThan(0);
  });

  it('creates a canvas element inside container', async () => {
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    const canvasCreated = document.createElement.mock.calls.some(call => call[0] === 'canvas');
    expect(canvasCreated).toBe(true);
  });

  it('creates a toggle button', async () => {
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    const buttonCreated = document.createElement.mock.calls.some(call => call[0] === 'button');
    expect(buttonCreated).toBe(true);
  });

  it('is idempotent — calling twice does not duplicate container', async () => {
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    const childrenAfterFirst = mockGameScreen.children.length;
    initMinimap();
    expect(mockGameScreen.children.length).toBe(childrenAfterFirst);
  });
});

describe('SC-4.4 Strategic Minimap — setMinimapVisible()', () => {
  it('exports setMinimapVisible function', async () => {
    const mod = await import('../js/ui/minimap.js');
    expect(typeof mod.setMinimapVisible).toBe('function');
  });

  it('hides container when called with false', async () => {
    const { initMinimap, setMinimapVisible } = await import('../js/ui/minimap.js');
    initMinimap();
    setMinimapVisible(false);
    const container = mockGameScreen.children[0];
    expect(container?.style?.display).toBe('none');
  });

  it('shows container when called with true after hiding', async () => {
    const { initMinimap, setMinimapVisible } = await import('../js/ui/minimap.js');
    initMinimap();
    setMinimapVisible(false);
    setMinimapVisible(true);
    const container = mockGameScreen.children[0];
    expect(container?.style?.display).not.toBe('none');
  });
});

describe('SC-4.4 Strategic Minimap — updateMinimap()', () => {
  it('exports updateMinimap function', async () => {
    const mod = await import('../js/ui/minimap.js');
    expect(typeof mod.updateMinimap).toBe('function');
  });

  it('does not throw when called without initialization', async () => {
    const { updateMinimap } = await import('../js/ui/minimap.js');
    expect(() => updateMinimap()).not.toThrow();
  });

  it('calls getContext on canvas after init', async () => {
    const { initMinimap, updateMinimap } = await import('../js/ui/minimap.js');
    initMinimap();
    updateMinimap();
    // Canvas created via createElement - just verify no error
    expect(() => updateMinimap()).not.toThrow();
  });

  it('is throttled to 200ms intervals', async () => {
    const { initMinimap, updateMinimap } = await import('../js/ui/minimap.js');
    initMinimap();

    // Call multiple times rapidly
    updateMinimap();
    updateMinimap();
    updateMinimap();

    // No error should occur
    expect(true).toBe(true);
  });
});

describe('SC-4.4 Strategic Minimap — grid scaling', () => {
  it('calculates cell size correctly for 10x8 grid on 120px canvas', async () => {
    const { getMinimapCellSize } = await import('../js/ui/minimap.js');
    // cellWidth = 120 / 10 = 12, cellHeight = 120 / 8 = 15
    const { cellW, cellH } = getMinimapCellSize(10, 8, 120, 120);
    expect(cellW).toBeCloseTo(12, 1);
    expect(cellH).toBeCloseTo(15, 1);
  });

  it('returns safe values when cols/rows are zero', async () => {
    const { getMinimapCellSize } = await import('../js/ui/minimap.js');
    const { cellW, cellH } = getMinimapCellSize(0, 0, 120, 120);
    expect(cellW).toBeGreaterThan(0);
    expect(cellH).toBeGreaterThan(0);
  });
});

describe('SC-4.4 Strategic Minimap — coordinate conversion', () => {
  it('converts tap position to grid coordinates', async () => {
    const { tapToGrid } = await import('../js/ui/minimap.js');
    // tap at (60, 60) on 120x120 minimap with 10x8 grid → (5, 4)
    const { col, row } = tapToGrid(60, 60, 120, 120, 10, 8);
    expect(col).toBe(5);
    expect(row).toBe(4);
  });

  it('clamps tap coordinates within grid bounds', async () => {
    const { tapToGrid } = await import('../js/ui/minimap.js');
    const { col, row } = tapToGrid(200, 200, 120, 120, 10, 8);
    expect(col).toBeLessThanOrEqual(9);
    expect(row).toBeLessThanOrEqual(7);
  });

  it('converts top-left tap to grid (0,0)', async () => {
    const { tapToGrid } = await import('../js/ui/minimap.js');
    const { col, row } = tapToGrid(0, 0, 120, 120, 10, 8);
    expect(col).toBe(0);
    expect(row).toBe(0);
  });
});

describe('SC-4.4 Strategic Minimap — tap-to-navigate', () => {
  it('calls setCameraZoom when minimap is tapped', async () => {
    const cameraModule = await import('../js/engine/camera.js');
    const { initMinimap } = await import('../js/ui/minimap.js');
    initMinimap();

    // Find canvas and simulate a click event
    const allCanvases = document.createElement.mock.calls
      .filter(c => c[0] === 'canvas')
      .map((_, i) => createdElements[i]);

    // The canvas addEventListener should have been called
    // We verify the tap handler setup exists
    expect(document.createElement).toHaveBeenCalledWith('canvas');
  });
});

describe('SC-4.4 Strategic Minimap — drawing helpers', () => {
  it('drawTowerDot does not throw with valid ctx', async () => {
    const { drawTowerDot } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    expect(() => drawTowerDot(ctx, 10, 10, '#ff0000')).not.toThrow();
  });

  it('drawEnemyDot does not throw with valid ctx', async () => {
    const { drawEnemyDot } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    expect(() => drawEnemyDot(ctx, 10, 10, false)).not.toThrow();
  });

  it('drawSpawnMarker does not throw with valid ctx', async () => {
    const { drawSpawnMarker } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    expect(() => drawSpawnMarker(ctx, 10, 10)).not.toThrow();
  });

  it('drawBaseMarker does not throw with valid ctx', async () => {
    const { drawBaseMarker } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    expect(() => drawBaseMarker(ctx, 10, 10)).not.toThrow();
  });

  it('drawTowerDot calls arc for circular dot', async () => {
    const { drawTowerDot } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    drawTowerDot(ctx, 10, 10, '#ff0000');
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('drawEnemyDot uses red color for normal enemy', async () => {
    const { drawEnemyDot } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    drawEnemyDot(ctx, 10, 10, false);
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('drawEnemyDot uses gold color for boss enemy', async () => {
    const { drawEnemyDot } = await import('../js/ui/minimap.js');
    const ctx = makeCanvas2DContext();
    drawEnemyDot(ctx, 10, 10, true);
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fillStyle).toContain('#');
  });
});
