// Tests for SC-1.4: Active Mid-Wave Repathing
// Red phase: describes desired behavior for the three improvements.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock dependencies ──────────────────────────────────────────────────────

let mockState = {};
const mockIncrementNavVersion = vi.fn();

vi.mock('../js/engine/state.js', () => ({
  getState: () => mockState,
  incrementNavVersion: mockIncrementNavVersion
}));

vi.mock('../js/engine/events.js', () => ({
  emit: vi.fn(),
  GameEvents: { NAV_CHANGE: 'state:nav' }
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'ground', tower: null }))
  );
}

function setTower(grid, x, y) {
  grid[y][x] = { type: 'ground', tower: { id: 'T' } };
}

function makeEnemy(overrides = {}) {
  return {
    flying: false,
    x: 0,
    y: 0.2,
    z: 0,
    path: null,
    pathIdx: 1,
    navV: -1,
    stuck: false,
    ...overrides
  };
}

// ── Tests: blocked-cell push-off ───────────────────────────────────────────

describe('onNavChanged — SC-1.4 improvements', () => {
  let onNavChanged;

  beforeEach(async () => {
    vi.resetModules();
    mockIncrementNavVersion.mockClear();
    const mod = await import('../js/systems/pathfinding.js');
    onNavChanged = mod.onNavChanged;
  });

  // ── Test 1: Enemy on blocked cell gets pushed to open neighbor ────────────
  it('pushes enemy off a newly-blocked cell to the nearest open neighbor', () => {
    const COLS = 5;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);
    const hw = COLS / 2;
    const hh = ROWS / 2;

    // Enemy standing at world position that maps to grid cell (2,2)
    // Grid (2,2) center in world: (2 - hw + 0.5, _, 2 - hh + 0.5) = (0.5, _, 0.5)
    const enemy = makeEnemy({ x: 0.5, z: 0.5 });

    // Place tower on cell (2,2) — enemy's current grid cell
    setTower(grid, 2, 2);

    mockState = {
      COLS, ROWS, grid,
      navVersion: 1,
      enemies: [enemy],
      BASE: { x: 4, y: 4 }
    };

    onNavChanged();

    // Enemy's grid position should now be on an open cell
    const newGx = Math.max(0, Math.min(COLS - 1, Math.floor(enemy.x + hw)));
    const newGy = Math.max(0, Math.min(ROWS - 1, Math.floor(enemy.z + hh)));
    const cell = grid[newGy][newGx];
    expect(cell.tower).toBeNull();
  });

  // ── Test 2: Path starts from current continuous position (no snap) ────────
  it('new path waypoints start close to enemy current world position (no snap)', () => {
    const COLS = 7;
    const ROWS = 7;
    const grid = makeGrid(COLS, ROWS);
    const hw = COLS / 2;
    const hh = ROWS / 2;

    // Enemy between cells (1,1) and (2,1) — world x=1.0 maps to grid x=Math.floor(1.0+3.5)=4
    // Put enemy at a position clearly within a valid cell (1,1) but off-centre
    // Grid cell (1,1) center world = (1 - 3.5 + 0.5, _, 1 - 3.5 + 0.5) = (-2.0, _, -2.0)
    // Offset slightly: x = -1.8, z = -2.0
    const enemy = makeEnemy({ x: -1.8, z: -2.0 });

    mockState = {
      COLS, ROWS, grid,
      navVersion: 2,
      enemies: [enemy],
      BASE: { x: 6, y: 6 }
    };

    onNavChanged();

    // Enemy should have a path
    expect(enemy.path).not.toBeNull();
    expect(enemy.path.length).toBeGreaterThan(0);

    // The first step in the path should match the grid cell of the enemy's
    // current position (path starts from where the enemy actually is)
    const gx = Math.max(0, Math.min(COLS - 1, Math.floor(enemy.x + hw)));
    const gy = Math.max(0, Math.min(ROWS - 1, Math.floor(enemy.z + hh)));
    const firstStep = enemy.path[0];
    expect(firstStep[0]).toBe(gx);
    expect(firstStep[1]).toBe(gy);
  });

  // ── Test 3: Null path sets e.stuck = true, enemy doesn't crash ───────────
  it('sets e.stuck=true when no path exists, clears it when path found later', () => {
    const COLS = 3;
    const ROWS = 3;
    const grid = makeGrid(COLS, ROWS);

    // Block all routes from (1,0) to (1,2)
    setTower(grid, 0, 1);
    setTower(grid, 1, 1);
    setTower(grid, 2, 1);

    const hw = COLS / 2;
    const hh = ROWS / 2;
    // Enemy at grid (1,0) — world: (1-1.5+0.5, _, 0-1.5+0.5) = (0, _, -1)
    const enemy = makeEnemy({ x: 0, z: -1 });

    mockState = {
      COLS, ROWS, grid,
      navVersion: 3,
      enemies: [enemy],
      BASE: { x: 1, y: 2 }
    };

    onNavChanged();

    // Path is blocked — enemy should be stuck
    expect(enemy.path).toBeNull();
    expect(enemy.stuck).toBe(true);

    // Now open the path
    grid[1][0] = { type: 'ground', tower: null };
    grid[1][1] = { type: 'ground', tower: null };
    grid[1][2] = { type: 'ground', tower: null };
    mockState = { ...mockState, grid, navVersion: 4 };

    // Re-import to get fresh module (no stale cache)
    // We just call onNavChanged again directly
    onNavChanged();

    expect(enemy.path).not.toBeNull();
    expect(enemy.stuck).toBe(false);
  });

  // ── Test 4: Flying enemies are unaffected ─────────────────────────────────
  it('flying enemies are not repathed and retain their path/navV', () => {
    const COLS = 5;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);

    const originalPath = [[1, 1], [2, 2]];
    const flyingEnemy = makeEnemy({
      flying: true,
      path: originalPath,
      navV: 99
    });

    mockState = {
      COLS, ROWS, grid,
      navVersion: 5,
      enemies: [flyingEnemy],
      BASE: { x: 4, y: 4 }
    };

    onNavChanged();

    expect(flyingEnemy.path).toBe(originalPath); // unchanged reference
    expect(flyingEnemy.navV).toBe(99);           // navV not updated
  });

  // ── Test 5: navVersion cache invalidation stays intact ────────────────────
  it('increments navVersion and clears path cache on nav change', () => {
    const COLS = 5;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);

    mockState = {
      COLS, ROWS, grid,
      navVersion: 1,
      enemies: [],
      BASE: { x: 4, y: 4 }
    };

    onNavChanged();

    expect(mockIncrementNavVersion).toHaveBeenCalledOnce();
  });

  // ── Test 6: Enemy not on blocked cell is still repathed normally ──────────
  it('enemy not on a blocked cell receives a new valid path', () => {
    const COLS = 7;
    const ROWS = 7;
    const grid = makeGrid(COLS, ROWS);

    const hw = COLS / 2;
    const hh = ROWS / 2;
    // Enemy at cell (1,1): world = (1-3.5+0.5, _, 1-3.5+0.5) = (-2, _, -2)
    const enemy = makeEnemy({ x: -2.0, z: -2.0 });

    // Tower on a completely different cell (5,5)
    setTower(grid, 5, 5);

    mockState = {
      COLS, ROWS, grid,
      navVersion: 2,
      enemies: [enemy],
      BASE: { x: 6, y: 6 }
    };

    onNavChanged();

    expect(enemy.path).not.toBeNull();
    expect(enemy.stuck).toBeFalsy();
    // Path should not go through (5,5)
    const towerVisited = enemy.path.some(([px, py]) => px === 5 && py === 5);
    expect(towerVisited).toBe(false);
  });
});
