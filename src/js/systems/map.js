// Map generation - grid setup and obstacle placement
// Uses map layout and spawn config for strategic identity

import { getState, setGrid, setSpawnsAndBase, incrementNavVersion } from '../engine/state.js';
import { mulberry32, makeSeededRng, hash2 } from '../utils/rng.js';
import { findPathGrid } from './pathfinding.js';
import { HOCKEY_LEVEL_LAYOUTS } from '../config/level-layouts.js';
import { MapLayout } from '../config/maps.js';

/**
 * Get spawn positions based on layout type and spawn count
 */
function getSpawnPositions(layout, spawnCount, COLS, ROWS, rng) {
  const SPAWNS = [];
  const ySpan = Math.max(3, Math.floor(ROWS * 0.55));
  const yMin = Math.floor((ROWS - ySpan) * 0.5);

  switch (layout) {
    case MapLayout.FUNNEL:
      // Single or clustered spawns - converge to chokepoint
      for (let i = 0; i < spawnCount; i++) {
        const baseY = yMin + Math.floor(((i + 0.5) / spawnCount) * ySpan);
        const jitter = Math.floor((rng() - 0.5) * 2);
        const sy = Math.max(0, Math.min(ROWS - 1, baseY + jitter));
        SPAWNS.push({ x: 0, y: sy });
      }
      break;

    case MapLayout.SPLIT_LANE:
      // Spawns spread across distinct vertical lanes
      const laneGap = Math.floor(ROWS / (spawnCount + 1));
      for (let i = 0; i < spawnCount; i++) {
        const sy = Math.max(1, Math.min(ROWS - 2, laneGap * (i + 1)));
        SPAWNS.push({ x: 0, y: sy });
      }
      break;

    case MapLayout.CROSSOVER:
      // Spawns at top and bottom, paths cross in middle
      if (spawnCount >= 2) {
        SPAWNS.push({ x: 0, y: Math.floor(ROWS * 0.2) });
        SPAWNS.push({ x: 0, y: Math.floor(ROWS * 0.8) });
      }
      for (let i = 2; i < spawnCount; i++) {
        const sy = Math.floor(ROWS * 0.5) + (i % 2 === 0 ? -1 : 1) * Math.floor(i / 2);
        SPAWNS.push({ x: 0, y: Math.max(0, Math.min(ROWS - 1, sy)) });
      }
      break;

    case MapLayout.OPEN_CENTER:
      // Spawns distributed evenly
      for (let i = 0; i < spawnCount; i++) {
        const baseY = yMin + Math.floor(((i + 0.5) / spawnCount) * ySpan);
        SPAWNS.push({ x: 0, y: baseY });
      }
      break;

    case MapLayout.CHOKEPOINT:
      // Spawns at extremes, natural chokepoints in path
      if (spawnCount >= 2) {
        SPAWNS.push({ x: 0, y: Math.floor(ROWS * 0.15) });
        SPAWNS.push({ x: 0, y: Math.floor(ROWS * 0.85) });
      }
      for (let i = 2; i < spawnCount; i++) {
        const sy = Math.floor(ROWS * 0.5) + (rng() - 0.5) * ROWS * 0.3;
        SPAWNS.push({ x: 0, y: Math.max(0, Math.min(ROWS - 1, Math.floor(sy))) });
      }
      break;

    case MapLayout.MAZE:
      // Clustered spawns - enemies navigate maze together
      const centerY = Math.floor(ROWS / 2);
      for (let i = 0; i < spawnCount; i++) {
        const offset = Math.floor((i - (spawnCount - 1) / 2) * 2);
        SPAWNS.push({ x: 0, y: Math.max(0, Math.min(ROWS - 1, centerY + offset)) });
      }
      break;

    case MapLayout.GAUNTLET:
      // Spawns clustered at one side, long run to base
      for (let i = 0; i < spawnCount; i++) {
        const baseY = yMin + Math.floor(((i + 0.5) / spawnCount) * ySpan);
        SPAWNS.push({ x: 0, y: baseY });
      }
      break;

    case MapLayout.MULTI_BASE:
      // Spawns distributed to test multiple entry defenses
      const segmentHeight = Math.floor(ROWS / spawnCount);
      for (let i = 0; i < spawnCount; i++) {
        const sy = Math.floor(segmentHeight * (i + 0.5));
        SPAWNS.push({ x: 0, y: Math.max(0, Math.min(ROWS - 1, sy)) });
      }
      break;

    default:
      // Default distribution
      for (let i = 0; i < spawnCount; i++) {
        const baseY = yMin + Math.floor(((i + 0.5) / spawnCount) * ySpan);
        SPAWNS.push({ x: 0, y: baseY });
      }
  }

  return SPAWNS;
}

export function generateMap() {
  const state = getState();
  const { COLS, ROWS, theme, mapIndex, themeData } = state;

  // Get map config for layout and spawn count
  const mapData = themeData?.maps?.[mapIndex] || {};
  const layout = mapData.layout || MapLayout.FUNNEL;
  const spawnCount = mapData.spawns || 3;

  // Initialize grid
  const grid = [];
  for (let y = 0; y < ROWS; y++) {
    grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      grid[y][x] = { type: 'ground', tower: null };
    }
  }

  // Deterministic spawn points based on layout
  const rng = makeSeededRng();
  const SPAWNS = getSpawnPositions(layout, spawnCount, COLS, ROWS, rng);

  // Defender base on the right edge
  const ySpan = Math.max(3, Math.floor(ROWS * 0.55));
  const yMin = Math.floor((ROWS - ySpan) * 0.5);
  const BASE = { x: COLS - 1, y: yMin + Math.floor(rng() * ySpan) };

  // Mark tiles
  for (const s of SPAWNS) {
    grid[s.y][s.x].type = 'spawn';
  }
  grid[BASE.y][BASE.x].type = 'base';

  setGrid(grid);
  setSpawnsAndBase(SPAWNS, BASE);

  // Place obstacles based on layout
  generateObstacles(layout);

  incrementNavVersion();
}

/**
 * Generate obstacles based on map layout type
 * Each layout creates distinct strategic patterns
 */
export function generateObstacles(layout) {
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

  // Get level-specific layout if available (hockey only for now)
  const levelLayout = (theme === 'hockey' && mapIndex < HOCKEY_LEVEL_LAYOUTS.length) 
    ? HOCKEY_LEVEL_LAYOUTS[mapIndex] 
    : null;

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

  // Corridor bias helper - distance from direct spawn-to-base paths
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

  // Use level-specific obstacle count if available
  let target;
  if (levelLayout && levelLayout.layout.obstacleCount) {
    target = levelLayout.layout.obstacleCount;
  } else {
    target = Math.max(10, Math.floor(COLS * ROWS * (0.09 + mapIndex * 0.01)));
  }

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

  // Layout-specific obstacle generators
  const genFunnel = () => {
    // Create walls that funnel enemies toward center chokepoint
    const cx = Math.floor(COLS * 0.5);
    const cy = Math.floor(ROWS * 0.5);

    // Upper funnel wall
    addWall(Math.floor(COLS * 0.25), 1, true, Math.floor(COLS * 0.35));
    // Lower funnel wall
    addWall(Math.floor(COLS * 0.25), ROWS - 2, true, Math.floor(COLS * 0.35));

    // Scattered obstacles near walls to create channeling
    for (let i = 0; i < target * 0.6; i++) {
      const nearTop = rng() < 0.5;
      const x = Math.floor(COLS * 0.2) + Math.floor(rng() * COLS * 0.5);
      const y = nearTop ? (2 + Math.floor(rng() * 2)) : (ROWS - 4 + Math.floor(rng() * 2));
      if (rng() < 0.6) place(x, y);
    }
  };

  const genSplitLane = () => {
    // Create horizontal dividers to separate lanes
    const laneCount = Math.max(2, SPAWNS.length);
    const laneHeight = Math.floor(ROWS / laneCount);

    for (let lane = 1; lane < laneCount; lane++) {
      const wallY = lane * laneHeight;
      const wallStartX = Math.floor(COLS * 0.15);
      const wallLen = Math.floor(COLS * 0.6);
      // Leave gaps for strategic tower placement
      for (let x = wallStartX; x < wallStartX + wallLen; x++) {
        if ((x - wallStartX) % 5 !== 2 && rng() < 0.85) {
          place(x, wallY);
        }
      }
    }

    // Add some scattered obstacles in each lane
    for (let i = 0; i < target * 0.3; i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 1 + Math.floor(rng() * (ROWS - 2));
      if (corridorDist(x, y) > 2 && rng() < 0.4) place(x, y);
    }
  };

  const genCrossover = () => {
    // Create X-pattern where paths cross in center
    const cx = Math.floor(COLS * 0.5);
    const cy = Math.floor(ROWS * 0.5);

    // Diagonal obstacle bands
    for (let i = 0; i < target; i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 1 + Math.floor(rng() * (ROWS - 2));

      // More obstacles away from the X crossing paths
      const distFromCenter = Math.abs(x - cx) + Math.abs(y - cy);
      const onDiagonal = Math.abs((x - 2) / (COLS - 4) - (y - 1) / (ROWS - 2)) < 0.2 ||
                         Math.abs((x - 2) / (COLS - 4) + (y - 1) / (ROWS - 2) - 1) < 0.2;

      if (!onDiagonal && distFromCenter > 3 && rng() < 0.55) {
        place(x, y);
      }
    }

    // Central island for tower placement
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= 1 && rng() < 0.7) {
          place(cx + dx, cy + dy);
        }
      }
    }
  };

  const genOpenCenter = () => {
    // Obstacles mostly on edges, open center for flexible placement
    const minX = 2, maxX = COLS - 3;
    const minY = 2, maxY = ROWS - 3;

    // Sparse edge obstacles
    for (let x = minX; x <= maxX; x++) {
      if (rng() < 0.45) place(x, 1);
      if (rng() < 0.45) place(x, ROWS - 2);
    }
    for (let y = minY; y <= maxY; y++) {
      if (rng() < 0.45) place(1, y);
      if (rng() < 0.45) place(COLS - 2, y);
    }

    // Very sparse center obstacles
    for (let i = 0; i < target * 0.3; i++) {
      const x = 3 + Math.floor(rng() * (COLS - 6));
      const y = 3 + Math.floor(rng() * (ROWS - 6));
      if (rng() < 0.25) place(x, y);
    }
  };

  const genChokepoint = () => {
    // Create natural narrow passages
    const cx = Math.floor(COLS * 0.5);

    // Multiple chokepoint walls with small gaps
    const wallPositions = [0.3, 0.5, 0.7];
    wallPositions.forEach((pos, idx) => {
      const wallX = Math.floor(COLS * pos);
      const gapY = Math.floor(ROWS * (0.3 + idx * 0.2));
      const gapSize = 2;

      for (let y = 1; y < ROWS - 1; y++) {
        if (Math.abs(y - gapY) > gapSize && rng() < 0.8) {
          place(wallX, y);
        }
      }
    });

    // Add blocking obstacles to force use of chokepoints
    for (let i = 0; i < target * 0.4; i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 1 + Math.floor(rng() * (ROWS - 2));
      if (corridorDist(x, y) > 3 && rng() < 0.5) place(x, y);
    }
  };

  const genMaze = () => {
    // Winding paths through many obstacles
    // Create a maze-like pattern with clear but long paths
    const stripeEvery = 3;

    for (let x = 2; x < COLS - 2; x++) {
      if (x % stripeEvery !== 0) continue;
      const gapY = Math.floor(ROWS * (0.2 + rng() * 0.6));
      for (let y = 1; y < ROWS - 1; y++) {
        if (Math.abs(y - gapY) > 1 && rng() < 0.75) {
          place(x, y);
        }
      }
    }

    // Add horizontal connectors
    for (let y = 2; y < ROWS - 2; y += 3) {
      const startX = 1 + Math.floor(rng() * 3);
      const len = 2 + Math.floor(rng() * 3);
      for (let x = startX; x < startX + len && x < COLS - 2; x++) {
        if (rng() < 0.6) place(x, y);
      }
    }
  };

  const genGauntlet = () => {
    // Long corridors with obstacles on sides - sustained firepower test
    const corridorWidth = Math.max(3, Math.floor(ROWS * 0.35));
    const corridorTop = Math.floor((ROWS - corridorWidth) / 2);
    const corridorBottom = corridorTop + corridorWidth;

    // Fill areas outside corridor with obstacles
    for (let x = 2; x < COLS - 2; x++) {
      for (let y = 1; y < corridorTop - 1; y++) {
        if (rng() < 0.75) place(x, y);
      }
      for (let y = corridorBottom + 1; y < ROWS - 1; y++) {
        if (rng() < 0.75) place(x, y);
      }
    }

    // Add scattered obstacles within corridor for tower positions
    for (let i = 0; i < target * 0.2; i++) {
      const x = 3 + Math.floor(rng() * (COLS - 6));
      const y = corridorTop + Math.floor(rng() * corridorWidth);
      if (rng() < 0.3) place(x, y);
    }
  };

  const genMultiBase = () => {
    // Multiple entry points require distributed defense
    // Create islands for tower clusters
    const islands = [
      [Math.floor(COLS * 0.35), Math.floor(ROWS * 0.25)],
      [Math.floor(COLS * 0.65), Math.floor(ROWS * 0.25)],
      [Math.floor(COLS * 0.35), Math.floor(ROWS * 0.75)],
      [Math.floor(COLS * 0.65), Math.floor(ROWS * 0.75)],
      [Math.floor(COLS * 0.5), Math.floor(ROWS * 0.5)]
    ];

    islands.forEach(([ix, iy]) => {
      const r = 1 + Math.floor(rng() * 2);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= r && rng() < 0.7) {
            place(ix + dx, iy + dy);
          }
        }
      }
    });

    // Connect with sparse obstacles
    for (let i = 0; i < target * 0.3; i++) {
      const x = 2 + Math.floor(rng() * (COLS - 4));
      const y = 1 + Math.floor(rng() * (ROWS - 2));
      if (rng() < 0.35) place(x, y);
    }
  };

  // Select generator based on layout type
  switch (layout) {
    case MapLayout.FUNNEL: genFunnel(); break;
    case MapLayout.SPLIT_LANE: genSplitLane(); break;
    case MapLayout.CROSSOVER: genCrossover(); break;
    case MapLayout.OPEN_CENTER: genOpenCenter(); break;
    case MapLayout.CHOKEPOINT: genChokepoint(); break;
    case MapLayout.MAZE: genMaze(); break;
    case MapLayout.GAUNTLET: genGauntlet(); break;
    case MapLayout.MULTI_BASE: genMultiBase(); break;
    default: genFunnel(); break;
  }

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
