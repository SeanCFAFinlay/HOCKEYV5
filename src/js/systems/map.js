// Map generation - grid setup and obstacle placement.
//
// Every layout type is a designed pattern, scaled to the map's size: solid
// straight walls, mirrored where the design is symmetric, with deliberate gaps.
// Nothing is scattered at random, so a map reads at a glance and the route the
// enemies take is the one the walls describe.
//
// Enemies enter from spawn cells on the left edge and head for one base cell in
// the middle of the right edge.

import { getState, setGrid, setSpawnsAndBase, incrementNavVersion } from '../engine/state.js';
import { findPathGrid } from './pathfinding.js';
import { MapLayout } from '../config/maps.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Rows the spawns sit on: `count` rows spread evenly and symmetrically about
 * the middle row, reaching `reach` (a share of the map height) either side.
 */
function spreadRows(count, ROWS, reach) {
  const mid = Math.floor(ROWS / 2);
  if (count <= 1) return [mid];
  const span = Math.max(count - 1, Math.round(ROWS * reach));
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push(clamp(Math.round(mid + (i / (count - 1) - 0.5) * 2 * span), 1, ROWS - 2));
  }
  return rows;
}

/** Spawn cells for a layout. Always on the left edge, never jittered. */
function getSpawnPositions(layout, spawnCount, COLS, ROWS) {
  const mid = Math.floor(ROWS / 2);
  let rows;

  switch (layout) {
    case MapLayout.FUNNEL:
      rows = spreadRows(spawnCount, ROWS, 0.2);
      break;
    case MapLayout.SPLIT_LANE:
      // Half the spawns in each lane, clear of the divider on the middle row.
      rows = spreadRows(spawnCount, ROWS, 0.3).map(y => (y === mid ? y - 1 : y));
      break;
    case MapLayout.CROSSOVER: {
      // Outer lanes first; any spare spawns come up the middle.
      const edge = Math.max(1, Math.round(ROWS * 0.1));
      rows = [edge, ROWS - 1 - edge];
      if (spawnCount >= 4) rows.push(edge + 2, ROWS - 3 - edge);
      else if (spawnCount === 3) rows.push(mid);
      rows = rows.slice(0, Math.max(1, spawnCount)).sort((a, b) => a - b);
      break;
    }
    case MapLayout.CHOKEPOINT:
      rows = spreadRows(spawnCount, ROWS, 0.34);
      break;
    case MapLayout.MAZE:
      rows = spreadRows(spawnCount, ROWS, 0.12);
      break;
    case MapLayout.GAUNTLET:
      // Inside the corridor.
      rows = spreadRows(spawnCount, ROWS, 0.1);
      break;
    case MapLayout.MULTI_BASE:
      rows = spreadRows(spawnCount, ROWS, 0.32);
      break;
    default: // OPEN_CENTER and anything unknown
      rows = spreadRows(spawnCount, ROWS, 0.22);
  }

  // Two spawns can never share a cell.
  const used = new Set();
  return rows.map(y => {
    let row = y;
    while (used.has(row) && row < ROWS - 2) row++;
    used.add(row);
    return { x: 0, y: row };
  });
}

export function generateMap() {
  const state = getState();
  const { COLS, ROWS, mapIndex, themeData } = state;

  const mapData = themeData?.maps?.[mapIndex] || {};
  const layout = mapData.layout || MapLayout.FUNNEL;
  const spawnCount = mapData.spawns || 3;

  const grid = [];
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      grid[y][x] = { type: 'ground', tower: null };
    }
  }

  const SPAWNS = getSpawnPositions(layout, spawnCount, COLS, ROWS);
  // The base is always the middle of the right edge.
  const BASE = { x: COLS - 1, y: Math.floor(ROWS / 2) };

  for (const s of SPAWNS) {
    grid[s.y][s.x].type = 'spawn';
  }
  grid[BASE.y][BASE.x].type = 'base';

  setGrid(grid);
  setSpawnsAndBase(SPAWNS, BASE);

  generateObstacles(layout);

  incrementNavVersion();
}

/**
 * Lay out the obstacles for a layout type. Deterministic: the same map always
 * comes out the same. Maps that share a layout type differ by size and by
 * `flip`, which picks the mirror image of the lopsided designs.
 */
export function generateObstacles(layout) {
  const state = getState();
  const { COLS, ROWS, theme, mapIndex, grid, SPAWNS, BASE } = state;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x].type === 'obstacle') grid[y][x].type = 'ground';
    }
  }

  const W = COLS;
  const H = ROWS;
  const mid = Math.floor(H / 2);
  // Lopsided designs come in two mirror-image forms; which one a map gets
  // depends on the world and the map, so the same layout type is not always
  // the same way up.
  const themeSalt = Math.max(0, ['hockey', 'soccer', 'space', 'kitchen', 'golf', 'bowling'].indexOf(theme));
  const flip = (mapIndex + themeSalt) % 2 === 1;

  /** Column at a share of the map width. */
  const X = f => clamp(Math.round(f * (W - 1)), 0, W - 1);

  const place = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    if (grid[y][x].type !== 'ground') return;
    // Keep the cells around every spawn and the base clear.
    for (const s of SPAWNS) {
      if (Math.abs(x - s.x) + Math.abs(y - s.y) <= 1) return;
    }
    if (Math.abs(x - BASE.x) + Math.abs(y - BASE.y) <= 1) return;
    grid[y][x].type = 'obstacle';
  };
  const hline = (x0, x1, y) => { for (let x = x0; x <= x1; x++) place(x, y); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) place(x, y); };
  const rect = (x, y, w, h) => { for (let j = 0; j < h; j++) hline(x, x + w - 1, y + j); };
  const plus = (cx, cy, arm) => { hline(cx - arm, cx + arm, cy); vline(cx, cy - arm, cy + arm); };

  switch (layout) {
    case MapLayout.OPEN_CENTER: {
      // A bracket in each corner and one island in the middle.
      const ax = Math.max(3, Math.round(W * 0.2));
      const ay = Math.max(2, Math.round(H * 0.22));
      for (const top of [true, false]) {
        const y = top ? 1 : H - 2;
        const dir = top ? 1 : -1;
        hline(2, 2 + ax - 1, y);
        hline(W - 2 - ax, W - 3, y);
        for (let i = 1; i < ay; i++) {
          place(2, y + dir * i);
          place(W - 3, y + dir * i);
        }
      }
      plus(X(0.5), mid, 1);
      break;
    }

    case MapLayout.SPLIT_LANE: {
      // One long divider makes two lanes; staggered baffles make each lane weave.
      hline(3, W - 5, mid);
      const lane = mid;                       // rows above the divider
      const tooth = Math.max(2, Math.floor(lane / 2));
      let i = 0;
      for (let x = 6; x <= W - 7; x += 5, i++) {
        if (i % 2 === 0) {
          vline(x, mid - tooth, mid - 1);     // off the divider, upper lane
          vline(x, mid + 1, mid + tooth);     // off the divider, lower lane
        } else {
          vline(x, 0, tooth - 1);             // off the top edge
          vline(x, H - tooth, H - 1);         // off the bottom edge
        }
      }
      break;
    }

    case MapLayout.CHOKEPOINT: {
      // Three walls right across the map, each with one gate, never in line.
      const high = Math.round(H * 0.24);
      const low = Math.round(H * 0.74) - 1;
      const gates = flip ? [low, high, mid - 1] : [high, low, mid - 1];
      [0.28, 0.5, 0.72].forEach((f, i) => {
        const x = X(f);
        const g = gates[i];
        vline(x, 0, g - 1);
        vline(x, g + 2, H - 1);
      });
      break;
    }

    case MapLayout.CROSSOVER: {
      // Two outer lanes fenced off from the middle, an island where they meet,
      // and a gate in front of the base that everything has to cross through.
      const bar = Math.round(H * 0.33);
      hline(2, X(0.38), bar);
      hline(2, X(0.38), H - 1 - bar);
      rect(X(0.5) - 1, mid - 1, 3, 3);
      const gate = X(0.7);
      vline(gate, 0, mid - 2);
      vline(gate, mid + 2, H - 1);
      break;
    }

    case MapLayout.MAZE: {
      // Switchbacks: walls reaching in from the top and bottom edges by turns.
      const reach = Math.round(H * 0.55);
      let i = 0;
      for (let x = 4; x <= W - 4; x += 5, i++) {
        if ((i % 2 === 0) !== flip) vline(x, 0, reach);
        else vline(x, H - 1 - reach, H - 1);
      }
      break;
    }

    case MapLayout.GAUNTLET: {
      // A walled corridor with teeth to slalom through; terraces either side
      // for towers.
      const half = Math.max(2, Math.floor(H * 0.18));
      const top = mid - half - 1;
      const bottom = mid + half + 1;
      hline(0, W - 4, top);
      hline(0, W - 4, bottom);
      let i = 0;
      for (let x = 5; x <= W - 6; x += 5, i++) {
        if ((i % 2 === 0) !== flip) vline(x, top + 1, mid);
        else vline(x, mid, bottom - 1);
      }
      break;
    }

    case MapLayout.MULTI_BASE: {
      // Five islands in a quincunx, and a screen in front of the base.
      const iy = Math.round(H * 0.26);
      for (const fx of [0.3, 0.62]) {
        rect(X(fx) - 1, iy - 1, 3, 2);
        rect(X(fx) - 1, H - 1 - iy, 3, 2);
      }
      plus(X(0.46), mid, 1);
      vline(W - 5, mid - 2, mid + 2);
      break;
    }

    default: {
      // FUNNEL: two jaws close to a three-wide mouth, with a post behind it.
      const x0 = X(0.2);
      const x1 = X(0.5);
      hline(x0, x1, 1);
      hline(x0, x1, H - 2);
      vline(x1, 1, mid - 2);
      vline(x1, mid + 2, H - 2);
      vline(Math.min(W - 4, x1 + 3), mid - 1, mid + 1);
    }
  }

  ensureRoutes(grid, SPAWNS, BASE, COLS, ROWS);
}

/**
 * Every spawn must be able to reach the base. The designs above guarantee it;
 * this is the safety net for an unusual map size. A blocked spawn gets a
 * corridor cut for it: along its own row, then down the last free column.
 */
function ensureRoutes(grid, SPAWNS, BASE, COLS, ROWS) {
  const reachable = s => {
    // findPathGrid caches by nav version: bump it so the current grid is seen.
    incrementNavVersion();
    const p = findPathGrid(s.x, s.y, BASE.x, BASE.y);
    return !!(p && p.length > 0);
  };
  const clear = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
    if (grid[y][x].type === 'obstacle') grid[y][x].type = 'ground';
  };

  for (const s of SPAWNS) {
    if (reachable(s)) continue;
    const col = COLS - 2;
    for (let x = s.x; x <= col; x++) clear(x, s.y);
    for (let y = Math.min(s.y, BASE.y); y <= Math.max(s.y, BASE.y); y++) clear(col, y);
  }
}
