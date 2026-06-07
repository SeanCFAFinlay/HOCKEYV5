// Tests for SC-1.3: True Tower Blocking (Remove allowBreak Cost Hack)
// Red phase: these tests describe the desired behavior AFTER the change.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mock dependencies ──────────────────────────────────────────────────────

let mockState = {};

vi.mock('../js/engine/state.js', () => ({
  getState: () => mockState,
  incrementNavVersion: vi.fn()
}));

vi.mock('../js/engine/events.js', () => ({
  emit: vi.fn(),
  GameEvents: { NAV_CHANGE: 'state:nav' }
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build a flat grid of plain cells */
function makeGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: 'ground', tower: null }))
  );
}

/** Place a tower marker at grid cell (x, y) */
function setTower(grid, x, y) {
  grid[y][x] = { type: 'ground', tower: { id: 'T' } };
}

/** Place a static obstacle at grid cell (x, y) */
function setObstacle(grid, x, y) {
  grid[y][x] = { type: 'obstacle', tower: null };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('findPathGrid — tower blocking (SC-1.3)', () => {
  let findPathGrid;
  let clearPathCache;

  beforeEach(async () => {
    vi.resetModules();
    // Re-import after resetModules so cacheNavVersion resets
    const mod = await import('../js/systems/pathfinding.js');
    findPathGrid = mod.findPathGrid;
    clearPathCache = mod.clearPathCache;
  });

  it('finds a path on a clear grid', () => {
    const COLS = 5;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const path = findPathGrid(0, 0, 4, 4);
    expect(path).not.toBeNull();
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toEqual([0, 0]);
    expect(path[path.length - 1]).toEqual([4, 4]);
  });

  it('returns null when a tower completely blocks all routes', () => {
    // 3x3 grid with towers sealing the middle row — no way around
    const COLS = 3;
    const ROWS = 3;
    const grid = makeGrid(COLS, ROWS);
    // Block entire middle row: (0,1), (1,1), (2,1)
    setTower(grid, 0, 1);
    setTower(grid, 1, 1);
    setTower(grid, 2, 1);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const path = findPathGrid(1, 0, 1, 2);
    expect(path).toBeNull();
  });

  it('routes around a tower rather than through it', () => {
    // 3x5 grid: tower at (1,2) blocking the centre
    const COLS = 3;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);
    setTower(grid, 1, 2);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const path = findPathGrid(1, 0, 1, 4);
    expect(path).not.toBeNull();
    // Path must not step through the tower cell
    const towerVisited = path.some(([px, py]) => px === 1 && py === 2);
    expect(towerVisited).toBe(false);
  });

  it('findPathGrid accepts only 4 positional arguments (no allowBreak)', () => {
    // The function signature should have arity 4: sx, sy, gx, gy
    expect(findPathGrid.length).toBe(4);
  });

  it('tower cell treated as impassable regardless of old allowBreak value', () => {
    // Even passing a 5th truthy argument must NOT let enemies through towers
    const COLS = 3;
    const ROWS = 3;
    const grid = makeGrid(COLS, ROWS);
    setTower(grid, 0, 1);
    setTower(grid, 1, 1);
    setTower(grid, 2, 1);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    // Calling with extra truthy arg (legacy call pattern) still returns null
    const path = findPathGrid(1, 0, 1, 2, true);
    expect(path).toBeNull();
  });

  it('static obstacles remain impassable', () => {
    const COLS = 3;
    const ROWS = 3;
    const grid = makeGrid(COLS, ROWS);
    setObstacle(grid, 0, 1);
    setObstacle(grid, 1, 1);
    setObstacle(grid, 2, 1);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const path = findPathGrid(1, 0, 1, 2);
    expect(path).toBeNull();
  });

  it('path is cached and returns independent copies', () => {
    const COLS = 5;
    const ROWS = 1;
    const grid = makeGrid(COLS, ROWS);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const p1 = findPathGrid(0, 0, 4, 0);
    const p2 = findPathGrid(0, 0, 4, 0);
    expect(p1).not.toBe(p2);      // different array references (copies)
    expect(p1).toEqual(p2);       // same content
  });

  it('cache invalidates when navVersion changes', () => {
    const COLS = 5;
    const ROWS = 5;
    const grid = makeGrid(COLS, ROWS);
    mockState = { COLS, ROWS, grid, navVersion: 1 };

    const p1 = findPathGrid(0, 0, 4, 4);

    // Block the direct path and bump navVersion
    setTower(grid, 0, 1);
    setTower(grid, 1, 1);
    setTower(grid, 2, 1);
    setTower(grid, 3, 1);
    setTower(grid, 4, 1);
    mockState = { COLS, ROWS, grid, navVersion: 2 };

    const p2 = findPathGrid(0, 0, 4, 4);
    expect(p2).toBeNull();
  });
});
