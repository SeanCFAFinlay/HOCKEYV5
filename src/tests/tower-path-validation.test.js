// Tests for SC-1.1: Path Validation on Tower Placement
// Ensures wouldBlockPath() detects path-blocking tower placements

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Provide window global for non-browser test environments
if (typeof window === 'undefined') {
  global.window = {};
}

// ── Mock dependencies ──────────────────────────────────────────────────────

let mockState = {};

vi.mock('../js/engine/state.js', () => ({
  getState: () => mockState,
  addTower: vi.fn(),
  removeTower: vi.fn(),
  setSelectedTower: vi.fn(),
  setSellMode: vi.fn(),
  addMoney: vi.fn(),
  dispatch: vi.fn(),
  ActionTypes: { ADD_MONEY: 'ADD_MONEY' }
}));

vi.mock('../js/engine/events.js', () => ({
  emit: vi.fn(),
  GameEvents: {
    TOWER_SELL: 'tower:sell',
    TOWER_PLACE: 'tower:place',
    NAV_CHANGE: 'state:nav'
  }
}));

vi.mock('../js/systems/pathfinding.js', () => ({
  onNavChanged: vi.fn(),
  findPathGrid: vi.fn()
}));

vi.mock('../js/rendering/tower-meshes.js', () => ({
  createTowerMesh: vi.fn(() => ({ type: 'Mesh' }))
}));

vi.mock('../js/systems/projectiles.js', () => ({
  createProjectile: vi.fn()
}));

vi.mock('../js/ui/hud.js', () => ({
  updateHUD: vi.fn(),
  renderTowers: vi.fn()
}));

vi.mock('../js/ui/upgrade-sheet.js', () => ({
  showUpgrade: vi.fn(),
  hideUpgrade: vi.fn()
}));

vi.mock('../js/utils/assertions.js', () => ({
  assertDefined: vi.fn(),
  assertValidGridPos: vi.fn(),
  warnIf: vi.fn()
}));

vi.mock('../js/systems/particles.js', () => ({
  spawnGroundRipple: vi.fn(),
  spawnTowerDust: vi.fn(),
  spawnDustPuff: vi.fn()
}));

vi.mock('../js/engine/camera.js', () => ({
  shakeCamera: vi.fn(),
  updateCamera: vi.fn()
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'ground', tower: null }))
  );
}

function makeBaseState(cols = 5, rows = 5) {
  const grid = makeGrid(cols, rows);
  return {
    COLS: cols,
    ROWS: rows,
    grid,
    SPAWNS: [{ x: 0, y: 2 }],
    BASE: { x: cols - 1, y: 2 },
    navVersion: 1,
    money: 999,
    selectedTower: 'basic',
    sellMode: false,
    themeData: {
      towers: [{ id: 'basic', cost: 10, dmg: [5], rng: [3], rate: [1], up: [] }]
    },
    scene: { add: vi.fn(), remove: vi.fn() },
    towers: []
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('wouldBlockPath (SC-1.1)', () => {
  let wouldBlockPath;
  let findPathGrid;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../js/systems/towers.js');
    wouldBlockPath = mod.wouldBlockPath;
    const pfMod = await import('../js/systems/pathfinding.js');
    findPathGrid = pfMod.findPathGrid;
  });

  it('exports wouldBlockPath as a function', () => {
    expect(typeof wouldBlockPath).toBe('function');
  });

  it('returns false when placement leaves path open for all spawns', () => {
    const state = makeBaseState(5, 5);
    mockState = state;

    // Path exists after placement (mock returns a path)
    findPathGrid.mockReturnValue([[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]]);

    // Placing at (2, 0) — top row, should not block mid-row path
    expect(wouldBlockPath(2, 0)).toBe(false);
  });

  it('returns true when placement blocks ALL paths from a spawn to base', () => {
    const state = makeBaseState(3, 3);
    // Single spawn at (0,1), base at (2,1)
    state.SPAWNS = [{ x: 0, y: 1 }];
    state.BASE = { x: 2, y: 1 };
    mockState = state;

    // Mock: no path found after simulated placement
    findPathGrid.mockReturnValue(null);

    // Placing at (1,1) would block the only path
    expect(wouldBlockPath(1, 1)).toBe(true);
  });

  it('returns true if ANY spawn loses its path', () => {
    const state = makeBaseState(5, 5);
    state.SPAWNS = [{ x: 0, y: 1 }, { x: 0, y: 3 }];
    state.BASE = { x: 4, y: 2 };
    mockState = state;

    // First spawn has path, second does not
    findPathGrid
      .mockReturnValueOnce([[0, 1], [1, 1], [2, 1], [3, 2], [4, 2]])
      .mockReturnValueOnce(null);

    expect(wouldBlockPath(2, 2)).toBe(true);
  });

  it('returns false when ALL spawns still have paths', () => {
    const state = makeBaseState(5, 5);
    state.SPAWNS = [{ x: 0, y: 1 }, { x: 0, y: 3 }];
    state.BASE = { x: 4, y: 2 };
    mockState = state;

    // Both spawns have valid paths
    findPathGrid
      .mockReturnValue([[0, 1], [1, 1], [4, 2]]);

    expect(wouldBlockPath(2, 0)).toBe(false);
  });

  it('restores cell.tower to null after rejected simulation', () => {
    const state = makeBaseState(3, 3);
    state.SPAWNS = [{ x: 0, y: 1 }];
    state.BASE = { x: 2, y: 1 };
    mockState = state;

    findPathGrid.mockReturnValue(null);

    wouldBlockPath(1, 1);

    // The cell must be restored — no lingering tower simulation
    expect(state.grid[1][1].tower).toBeNull();
  });

  it('restores cell.tower to null after successful check too', () => {
    const state = makeBaseState(3, 3);
    state.SPAWNS = [{ x: 0, y: 1 }];
    state.BASE = { x: 2, y: 1 };
    mockState = state;

    findPathGrid.mockReturnValue([[0, 1], [1, 0], [2, 1]]);

    wouldBlockPath(1, 1);

    expect(state.grid[1][1].tower).toBeNull();
  });

  it('skips spawns that share the same cell as placement (spawn-as-tower edge case)', () => {
    // If spawn is at the placement cell, the cell is type=spawn, not ground, so placement
    // would not normally happen. But wouldBlockPath should handle gracefully.
    const state = makeBaseState(3, 3);
    state.SPAWNS = [{ x: 1, y: 0 }, { x: 0, y: 1 }];
    state.BASE = { x: 2, y: 1 };
    mockState = state;

    // Second spawn has a path
    findPathGrid.mockReturnValue([[0, 1], [1, 1], [2, 1]]);

    // Placing at a different cell; wouldBlockPath must not crash
    expect(() => wouldBlockPath(1, 2)).not.toThrow();
  });
});

describe('handleCellTap path validation integration (SC-1.1)', () => {
  let handleCellTap;
  let findPathGrid;
  let addTower;
  let dispatch;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../js/systems/towers.js');
    handleCellTap = mod.handleCellTap;
    const pfMod = await import('../js/systems/pathfinding.js');
    findPathGrid = pfMod.findPathGrid;
    const stateMod = await import('../js/engine/state.js');
    addTower = stateMod.addTower;
    dispatch = stateMod.dispatch;
  });

  it('rejects placement when wouldBlockPath returns true', () => {
    const state = makeBaseState(5, 5);
    mockState = state;

    // null path = would block
    findPathGrid.mockReturnValue(null);

    handleCellTap(2, 2);

    // Tower must NOT be placed
    expect(state.grid[2][2].tower).toBeNull();
    expect(addTower).not.toHaveBeenCalled();
  });

  it('allows placement when path remains open', () => {
    const state = makeBaseState(5, 5);
    mockState = state;

    // Valid path exists
    findPathGrid.mockReturnValue([[0, 2], [2, 2], [4, 2]]);

    handleCellTap(2, 0);

    // Tower should be placed
    expect(state.grid[0][2].tower).not.toBeNull();
    expect(addTower).toHaveBeenCalled();
  });
});
