// Tower placement, targeting, and shooting
// Uses delta-time based cooldowns, not wall clock

import { getState, addTower, removeTower, setSelectedTower, addMoney, dispatch, ActionTypes } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { onNavChanged, findPathGrid } from './pathfinding.js';
import { createTowerMesh, flashTowerEmissive } from '../rendering/tower-meshes.js';
import { createProjectile } from './projectiles.js';
import { updateHUD, renderTowers } from '../ui/hud.js';
import { showUpgrade, hideUpgrade } from '../ui/upgrade-sheet.js';
import { assertDefined, assertValidGridPos, warnIf } from '../utils/assertions.js';
import { spawnGroundRipple, spawnTowerDust } from './particles.js';
import { shakeCamera } from '../engine/camera.js';
import { playFireSound } from '../config/sounds.js';
import { playSoundAt } from '../engine/audio.js';

// Targeting priority modes
export const TargetPriority = {
  FIRST: 'first',     // Furthest along path
  LAST: 'last',       // Closest to spawn
  STRONGEST: 'strong', // Highest HP
  CLOSEST: 'close',   // Nearest to tower
  WEAKEST: 'weak'     // Lowest HP
};

/**
 * Check if placing a tower at (col, row) would block all paths from any spawn to base.
 * @returns {boolean} true if placement would block paths
 */
export function wouldBlockPath(col, row) {
  const state = getState();
  const { grid, COLS, ROWS } = state;
  const cell = grid[row] && grid[row][col];
  if (!cell || cell.tower || cell.type !== 'ground') return true;

  // Temporarily simulate tower placement
  cell.tower = { id: '__sim__' };
  try {
    const spawns = [];
    const bases = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x].type === 'spawn') spawns.push({ x, y });
        if (grid[y][x].type === 'base') bases.push({ x, y });
      }
    }
    const base = state.BASE || bases[0];
    if (!base) return false;
    for (const s of (state.SPAWNS || spawns)) {
      const path = findPathGrid(s.x, s.y, base.x, base.y);
      if (!path || path.length === 0) return true;
    }
    return false;
  } finally {
    cell.tower = null;
  }
}

/**
 * Handle tap on a grid cell
 */
export function handleCellTap(x, y) {
  const state = getState();
  const { grid, themeData, selectedTower, money, scene, COLS, ROWS } = state;

  // Validate grid position
  assertValidGridPos(x, y, COLS, ROWS);
  warnIf(!grid[y] || !grid[y][x], `Invalid grid cell at (${x}, ${y})`);

  const cell = grid[y][x];
  if (!cell) return;

  // Selling is not a mode here any more: tapping a placed tower opens its sheet,
  // which owns the sell action (ui/upgrade-sheet.js sellTower). This used to
  // carry a duplicate of that same sell logic behind a global sellMode flag.

  // Show upgrade for existing tower
  if (cell.tower) {
    showUpgrade(cell.tower);
    return;
  }

  hideUpgrade();

  // Place new tower
  if (selectedTower && cell.type === 'ground') {
    const td = themeData.towers.find(t => t.id === selectedTower);

    // Validate tower definition exists
    warnIf(!td, `Tower definition not found for ID: ${selectedTower}`);
    if (!td) return;

    if (money >= td.cost) {
      if (wouldBlockPath(x, y)) {
        shakeCamera(0.18, 0.08);
        return;
      }

      const tower = {
        type: selectedTower,
        x,
        y,
        lv: 0,
        dmg: td.dmg[0],
        rng: td.rng[0],
        rate: td.rate[0],
        cooldown: 0,        // Timer-based cooldown
        hp: 160,
        maxHp: 160,
        priority: TargetPriority.FIRST  // Default targeting
      };

      if (td.splash) tower.splash = td.splash[0];
      if (td.slow) {
        tower.slow = td.slow;
        tower.slowDur = td.slowDur[0];
      }
      if (td.chain) {
        tower.chain = td.chain[0];
        tower.chainRng = td.chainRng;
      }
      if (td.burn) {
        tower.burn = td.burn[0];
        tower.burnDur = td.burnDur;
      }
      if (td.crit) tower.crit = td.crit;

      tower.mesh = createTowerMesh(tower);

      // SC-3.2: drop animation — start mesh 0.5 above final position
      if (tower.mesh && tower.mesh.position && tower.mesh.userData !== undefined) {
        tower.mesh.position.y = 0.5;
        tower.mesh.userData.dropAnim = {
          elapsed: 0,
          duration: 0.15,
          startY: 0.5
        };
      }

      addTower(tower);
      cell.tower = tower;

      // SC-3.2: placement satisfaction effects
      const state = getState();
      const hw = state.COLS / 2;
      const hh = state.ROWS / 2;
      const wx = x - hw + 0.5;
      const wz = y - hh + 0.5;

      spawnGroundRipple(wx, wz, 0xffffff);
      spawnTowerDust(wx, wz);
      shakeCamera(0.3, 0.08);
      playSoundAt('towerPlace', wx, wz);

      dispatch(ActionTypes.ADD_MONEY, -td.cost);
      onNavChanged();
      updateHUD();
    }
  }
}

/**
 * Update all towers - targeting and shooting
 * @param {number} dt - Fixed delta time
 * @param {number} gameTime - Current game time
 */
export function updateTowers(dt, gameTime) {
  const state = getState();
  const { COLS, ROWS, towers, enemies } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  for (const tw of towers) {
    // Reduce cooldown
    tw.cooldown -= dt;

    const tx = tw.x - hw + 0.5;
    const tz = tw.y - hh + 0.5;

    // Find best target every tick so selected-tower feedback stays live.
    const target = findTarget(tw, enemies, tx, tz);
    tw.currentTarget = target;

    // Skip firing if still on cooldown.
    if (tw.cooldown > 0) continue;

    if (target) {
      const p = createProjectile(tw, target, tx, tz);
      if (p) {
        state.projectiles.push(p);
        emit(GameEvents.TOWER_FIRE, { tower: tw, target });
        // SC-2.5: emissive pulse on fire
        flashTowerEmissive(tw.mesh, null, 100);
        // SC-5.2: throttled fire sound
        playFireSound(tw, tx, tz);
      }

      // Set cooldown based on fire rate
      tw.cooldown = 1 / tw.rate;

      // Rotate tower to face target
      if (tw.mesh) {
        const angle = Math.atan2(target.x - tx, target.z - tz);
        tw.mesh.rotation.y = angle;
      }
    }
  }
}

/**
 * Find best target for a tower based on priority
 * @param {Object} tower - Tower object
 * @param {Array} enemies - Array of enemies
 * @param {number} tx - Tower world X
 * @param {number} tz - Tower world Z
 * @returns {Object|null} Best target or null
 */
function findTarget(tower, enemies, tx, tz) {
  let target = null;
  let bestScore = -Infinity;

  const priority = tower.priority || TargetPriority.FIRST;

  for (const e of enemies) {
    const dx = e.x - tx;
    const dz = e.z - tz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Check range
    if (dist >= tower.rng) continue;

    // Calculate score based on priority
    let score = 0;

    switch (priority) {
      case TargetPriority.FIRST:
        // Furthest along path + boss bonus
        score = e.pathIdx * 100 - dist + (e.boss ? 500 : 0);
        break;

      case TargetPriority.LAST:
        // Closest to spawn
        score = -e.pathIdx * 100 - dist;
        break;

      case TargetPriority.STRONGEST:
        // Highest current HP
        score = e.hp + (e.boss ? 10000 : 0);
        break;

      case TargetPriority.WEAKEST:
        // Lowest current HP
        score = -e.hp;
        break;

      case TargetPriority.CLOSEST:
        // Nearest to tower
        score = -dist;
        break;

      default:
        score = e.pathIdx * 100 - dist;
    }

    if (score > bestScore) {
      bestScore = score;
      target = e;
    }
  }

  return target;
}

/**
 * Cycle tower targeting priority
 * @param {Object} tower - Tower to update
 */
export function cycleTowerPriority(tower) {
  const priorities = Object.values(TargetPriority);
  const currentIdx = priorities.indexOf(tower.priority || TargetPriority.FIRST);
  tower.priority = priorities[(currentIdx + 1) % priorities.length];
}

/**
 * Set tower targeting priority directly.
 * @param {Object} tower - Tower to update
 * @param {string} priority - TargetPriority value
 * @returns {boolean} true when applied
 */
export function setTowerPriority(tower, priority) {
  if (!tower || !Object.values(TargetPriority).includes(priority)) return false;
  tower.priority = priority;
  return true;
}

/**
 * Get ordered priority options for UI controls.
 * @returns {Array<{value:string,label:string}>}
 */
export function getPriorityOptions() {
  return Object.values(TargetPriority).map(value => ({
    value,
    label: getPriorityName(value)
  }));
}

/**
 * Get priority display name
 * @param {string} priority - Priority value
 * @returns {string} Display name
 */
export function getPriorityName(priority) {
  switch (priority) {
    case TargetPriority.FIRST: return 'First';
    case TargetPriority.LAST: return 'Last';
    case TargetPriority.STRONGEST: return 'Strong';
    case TargetPriority.WEAKEST: return 'Weak';
    case TargetPriority.CLOSEST: return 'Close';
    default: return 'First';
  }
}
