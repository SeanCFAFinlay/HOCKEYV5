// Map generation - grid setup and obstacle placement

import { getState, setGrid, setSpawnsAndBase, incrementNavVersion } from '../engine/state.js';
import { mulberry32, makeSeededRng, hash2 } from '../utils/rng.js';
import { findPathGrid } from './pathfinding.js';

export function generateMap() {
  const state = getState();
  const { COLS, ROWS, theme, mapIndex } = state;

  // Initialize grid
  const grid = [];
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      grid[y][x] = { type: 'ground', tower: null };
    }
  }

  // Deterministic spawn points and base position
  const rng = makeSeededRng();
  const ySpan = Math.max(3, Math.floor(ROWS * 0.55));
  const yMin = Math.floor((ROWS - ySpan) * 0.5);

  // Multiple enemy entry points along the left edge
  const spawnCount = 3;
  const SPAWNS = [];
  for (let i = 0; i < spawnCount; i++) {
    const baseY = yMin + Math.floor(((i + 0.5) / spawnCount) * ySpan);
    const jitter = Math.floor((rng() - 0.5) * 2);
    const sy = Math.max(0, Math.min(ROWS - 1, baseY + jitter));
    SPAWNS.push({ x: 0, y: sy });
  }

  // Defender base on the right edge
  const BASE = { x: COLS - 1, y: yMin + Math.floor(rng() * ySpan) };

  // Mark tiles
  for (const s of SPAWNS) {
    grid[s.y][s.x].type = 'spawn';
  }
  grid[BASE.y][BASE.x].type = 'base';

  setGrid(grid);
  setSpawnsAndBase(SPAWNS, BASE);

  // Place obstacles
  generateObstacles();

  incrementNavVersion();
}

export function generateObstacles() {
  const state = getState();
  const { COLS, ROWS, theme, mapIndex, grid, SPAWNS, BASE } = state;

  // Clear previous obstacles
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x].type === 'obstacle') {
        grid[y][x].type = 'ground';
      }
    }
  }

  const themeSalt = (theme === 'hockey') ? 17 : 29;
  const seed = ((mapIndex + 1) * 10007 + themeSalt) >>> 0;
  const rng = mulberry32(seed);

  const blocked = new Set([`${BASE.x},${BASE.y}`]);
  for (const s of SPAWNS) {
    blocked.add(`${s.x},${s.y}`);
  }

  const canPlace = (x, y) => {
    const key = `${x},${y}`;
    if (blocked.has(key)) return false;
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    if (grid[y][x].type !== 'ground') return false;
    // Buffer around spawns/base
    for (const s of SPAWNS) {
      if (Math.abs(x - s.x) + Math.abs(y - s.y) <= 1) return false;
    }
    if (Math.abs(x - BASE.x) + Math.abs(y - BASE.y) <= 1) return false;
    return true;
  };

  const place = (x, y) => {
    if (!canPlace(x, y)) return false;
    grid[y][x].type = 'obstacle';
    blocked.add(`${x},${y}`);
    return true;
  };

  // Corridor bias helper
  const corridorDist = (x, y) => {
    let best = 1e9;
    for (const s of SPAWNS) {
      const ax = s.x, ay = s.y, bx = BASE.x, by = BASE.y;
      const vx = bx - ax, vy = by - ay;
      const wx = x - ax, wy = y - ay;
      const vv = vx * vx + vy * vy || 1;
      let t = (wx * vx + wy * vy) / vv;
      t = Math.max(0, Math.min(1, t));
      const px = ax + t * vx, py = ay + t * vy;
      const d = Math.abs(px - x) + Math.abs(py - y);
      if (d < best) best = d;
    }
    return best;
  };

  const target = Math.max(10, Math.floor(COLS * ROWS * (0.09 + mapIndex * 0.01)));

  const addWall = (sx, sy, horiz, len) => {
    let ok = 0;
    for (let i = 0; i < len; i++) {
      const x = sx + (horiz ? i : 0);
      const y = sy + (horiz ? 0 : i);
      if (place(x, y)) ok++;
      else break;
    }
    return ok;
  };

  // Pattern generators
  const gen0 = () => {
    const cx = Math.floor(COLS * 0.5), cy = Math.floor(ROWS * 0.5);
    for (let i = 0; i < target; i++) {
      const a = rng() * Math.PI * 2;
      const r = 1.5 + rng() * Math.min(COLS, ROWS) * 0.28;
      const x = cx + Math.round(Math.cos(a) * r);
      const y = cy + Math.round(Math.sin(a) * r);
      if (corridorDist(x, y) <= 4 || rng() < 0.45) place(x, y);
    }
    addWall(Math.floor(COLS * 0.35), Math.floor(ROWS * 0.25), true, 4 + Math.floor(rng() * 4));
    addWall(Math.floor(COLS * 0.35), Math.floor(ROWS * 0.65), true, 4 + Math.floor(rng() * 4));
  };

  const gen1 = () => {
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        const band = ((x + y + mapIndex * 3) % 7);
        if (band === 0 && corridorDist(x, y) <= 5) { if (rng() < 0.65) place(x, y); }
        if (band === 1 && rng() < 0.10) place(x, y);
      }
    }
    addWall(Math.floor(COLS * 0.55), Math.floor(ROWS * 0.15), false, 3 + Math.floor(rng() * 4));
    addWall(Math.floor(COLS * 0.55), Math.floor(ROWS * 0.60), false, 3 + Math.floor(rng() * 4));
  };

  const gen2 = () => {
    const stripeEvery = 3;
    for (let x = 2; x < COLS - 2; x++) {
      if (x % stripeEvery !== 0) continue;
      for (let y = 1; y < ROWS - 1; y++) {
        if ((y + mapIndex) % 6 === 0) continue;
        if (rng() < 0.70) place(x, y);
      }
    }
    for (let i = 0; i < Math.floor(target * 0.25); i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 1 + Math.floor(rng() * (ROWS - 2));
      if (corridorDist(x, y) <= 3 && rng() < 0.6) place(x, y);
    }
  };

  const gen3 = () => {
    const islands = [
      [Math.floor(COLS * 0.25), Math.floor(ROWS * 0.25)],
      [Math.floor(COLS * 0.75), Math.floor(ROWS * 0.25)],
      [Math.floor(COLS * 0.25), Math.floor(ROWS * 0.75)],
      [Math.floor(COLS * 0.75), Math.floor(ROWS * 0.75)]
    ];
    islands.forEach(([ix, iy]) => {
      const r = 2 + Math.floor(rng() * 2);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= r && rng() < 0.8) place(ix + dx, iy + dy);
        }
      }
    });
    for (let i = 0; i < target; i++) {
      const edge = rng() < 0.5;
      const x = edge ? (rng() < 0.5 ? 1 : COLS - 2) : (2 + Math.floor(rng() * (COLS - 4)));
      const y = edge ? (2 + Math.floor(rng() * (ROWS - 4))) : (rng() < 0.5 ? 1 : ROWS - 2);
      if (rng() < 0.55) place(x, y);
    }
  };

  const gen4 = () => {
    const minX = 2, maxX = COLS - 3, minY = 2, maxY = ROWS - 3;
    for (let x = minX; x <= maxX; x++) {
      if (rng() < 0.85) place(x, minY);
      if (rng() < 0.85) place(x, maxY);
    }
    for (let y = minY; y <= maxY; y++) {
      if (rng() < 0.85) place(minX, y);
      if (rng() < 0.85) place(maxX, y);
    }
    for (let k = 0; k < 3; k++) {
      const ox = 3 + Math.floor(rng() * (COLS - 6));
      const oy = 3 + Math.floor(rng() * (ROWS - 6));
      if (grid[oy] && grid[oy][ox] && grid[oy][ox].type === 'obstacle') {
        grid[oy][ox].type = 'ground';
      }
    }
    for (let i = 0; i < target; i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 2 + Math.floor(rng() * (ROWS - 4));
      if (corridorDist(x, y) <= 4 && rng() < 0.7) place(x, y);
    }
  };

  // Select generator based on map index (cycle through 5 patterns for all 10 maps)
  [gen0, gen1, gen2, gen3, gen4][mapIndex % 5]();

  // Top up if under-filled
  let placed = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x].type === 'obstacle') placed++;
    }
  }

  let tries = 0;
  while (placed < target && tries < target * 60) {
    tries++;
    const x = 1 + Math.floor(rng() * (COLS - 2));
    const y = 1 + Math.floor(rng() * (ROWS - 2));
    const bias = corridorDist(x, y) <= 3 ? 0.75 : 0.25;
    if (rng() < bias && place(x, y)) placed++;
  }

  // Ensure walkable path exists
  for (let attempt = 0; attempt < 20; attempt++) {
    let ok = true;
    for (const s of SPAWNS) {
      const p = findPathGrid(s.x, s.y, BASE.x, BASE.y, false);
      if (!(p && p.length > 0)) {
        ok = false;
        break;
      }
    }
    if (ok) return;

    // Lighten obstacles if path blocked
    const rng2 = mulberry32((seed + 7777 + attempt * 101) >>> 0);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x].type !== 'obstacle') continue;
        if (rng2() < 0.18) grid[y][x].type = 'ground';
      }
    }
  }
}
