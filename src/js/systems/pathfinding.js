// A* pathfinding with path caching
// Optimized to only recalculate when map changes

import { getState, incrementNavVersion } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';

// Path cache - stores computed paths keyed by start position
let pathCache = new Map();
let cacheNavVersion = -1;

// Direction vectors for neighbors (4-way)
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Find path using A* algorithm with caching
 * @param {number} sx - Start X (grid coords)
 * @param {number} sy - Start Y (grid coords)
 * @param {number} gx - Goal X (grid coords)
 * @param {number} gy - Goal Y (grid coords)
 * @param {boolean} allowBreak - Allow breaking through towers
 * @returns {Array|null} Path array or null
 */
export function findPathGrid(sx, sy, gx, gy, allowBreak) {
  const state = getState();
  const { COLS, ROWS, grid, navVersion } = state;

  // Check cache validity
  if (navVersion !== cacheNavVersion) {
    pathCache.clear();
    cacheNavVersion = navVersion;
  }

  // Check cache
  const cacheKey = `${sx},${sy}-${gx},${gy}-${allowBreak ? 1 : 0}`;
  if (pathCache.has(cacheKey)) {
    // Return a copy to prevent mutation
    return pathCache.get(cacheKey).map(p => [...p]);
  }

  // Compute path
  const path = computePath(sx, sy, gx, gy, allowBreak, COLS, ROWS, grid);

  // Cache result (even null paths)
  if (path) {
    pathCache.set(cacheKey, path);
    // Return a copy
    return path.map(p => [...p]);
  }

  pathCache.set(cacheKey, null);
  return null;
}

/**
 * Internal A* computation
 */
function computePath(sx, sy, gx, gy, allowBreak, COLS, ROWS, grid) {
  const inBounds = (x, y) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
  const key = (x, y) => (x << 16) | y; // Faster than string concat
  const h = (x, y) => Math.abs(gx - x) + Math.abs(gy - y); // Manhattan distance

  // Use typed arrays for better performance
  const gScore = new Map();
  const fScore = new Map();
  const came = new Map();

  // Binary heap for open set (priority queue)
  const open = new MinHeap();

  const startK = key(sx, sy);
  gScore.set(startK, 0);
  fScore.set(startK, h(sx, sy));
  open.insert(sx, sy, h(sx, sy));

  /**
   * Get movement cost for a cell
   */
  const getCost = (x, y) => {
    const c = grid[y][x];
    if (c.type === 'obstacle') return Infinity;
    if (c.tower) return allowBreak ? 30 : Infinity;
    return 1;
  };

  while (!open.isEmpty()) {
    const { x: cx, y: cy } = open.extractMin();

    // Found goal
    if (cx === gx && cy === gy) {
      return reconstructPath(came, cx, cy, key);
    }

    const cK = key(cx, cy);
    const cG = gScore.get(cK) ?? Infinity;

    // Check neighbors
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (!inBounds(nx, ny)) continue;

      const stepCost = getCost(nx, ny);
      if (stepCost === Infinity) continue;

      const nK = key(nx, ny);
      const tentative = cG + stepCost;
      const prev = gScore.get(nK);

      if (prev === undefined || tentative < prev) {
        came.set(nK, cK);
        gScore.set(nK, tentative);
        const f = tentative + h(nx, ny);
        fScore.set(nK, f);
        open.insert(nx, ny, f);
      }
    }
  }

  return null;
}

/**
 * Reconstruct path from came map
 */
function reconstructPath(came, gx, gy, keyFn) {
  const path = [];
  let curK = keyFn(gx, gy);
  let cur = [gx, gy];
  path.push(cur);

  while (came.has(curK)) {
    const prevK = came.get(curK);
    const px = prevK >> 16;
    const py = prevK & 0xFFFF;
    cur = [px, py];
    curK = prevK;
    path.push(cur);
  }

  path.reverse();
  return path;
}

/**
 * Called when navigation map changes (tower placed/sold, etc.)
 */
export function onNavChanged() {
  const state = getState();
  const { COLS, ROWS, enemies, BASE } = state;

  // Increment version to invalidate caches
  incrementNavVersion();
  pathCache.clear();
  cacheNavVersion = state.navVersion;

  const hw = COLS / 2;
  const hh = ROWS / 2;

  // Re-path all ground enemies
  for (const e of enemies) {
    if (e.flying) continue;

    const gx = Math.max(0, Math.min(COLS - 1, Math.floor(e.x + hw)));
    const gy = Math.max(0, Math.min(ROWS - 1, Math.floor(e.z + hh)));

    e.path = findPathGrid(gx, gy, BASE.x, BASE.y, true);
    e.pathIdx = 1;
    e.navV = state.navVersion;
  }

  emit(GameEvents.NAV_CHANGE, { version: state.navVersion });
}

/**
 * Clear all cached paths
 */
export function clearPathCache() {
  pathCache.clear();
  cacheNavVersion = -1;
}

/**
 * Get cache statistics
 */
export function getPathCacheStats() {
  return {
    size: pathCache.size,
    version: cacheNavVersion
  };
}

/**
 * Simple binary min-heap for A* open set
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(x, y, priority) {
    this.heap.push({ x, y, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  bubbleDown(i) {
    const len = this.heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;

      if (left < len && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < len && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest === i) break;

      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}
