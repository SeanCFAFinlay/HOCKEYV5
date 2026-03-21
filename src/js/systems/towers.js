// Tower placement, targeting, and shooting
// Uses delta-time based cooldowns, not wall clock

import { getState, addTower, removeTower, setSelectedTower, setSellMode, addMoney, dispatch, ActionTypes } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { onNavChanged } from './pathfinding.js';
import { createTowerMesh } from '../rendering/tower-meshes.js';
import { createProjectile } from './projectiles.js';
import { updateHUD, renderTowers } from '../ui/hud.js';
import { showUpgrade, hideUpgrade } from '../ui/upgrade-sheet.js';

// Targeting priority modes
export const TargetPriority = {
  FIRST: 'first',     // Furthest along path
  LAST: 'last',       // Closest to spawn
  STRONGEST: 'strong', // Highest HP
  CLOSEST: 'close',   // Nearest to tower
  WEAKEST: 'weak'     // Lowest HP
};

/**
 * Handle tap on a grid cell
 */
export function handleCellTap(x, y) {
  const state = getState();
  const { grid, themeData, selectedTower, sellMode, money, scene } = state;
  const cell = grid[y][x];

  // Sell mode
  if (sellMode && cell.tower) {
    const td = themeData.towers.find(t => t.id === cell.tower.type);
    let val = Math.floor(td.cost * 0.6);

    for (let i = 0; i < cell.tower.lv; i++) {
      val += Math.floor(td.up[i] * 0.6);
    }

    addMoney(val);

    if (cell.tower.mesh) {
      scene.remove(cell.tower.mesh);
    }
    if (cell.tower.rangeMesh) {
      scene.remove(cell.tower.rangeMesh);
    }

    emit(GameEvents.TOWER_SELL, { tower: cell.tower, value: val });
    removeTower(cell.tower);
    cell.tower = null;
    onNavChanged();
    hideUpgrade();
    updateHUD();
    return;
  }

  // Show upgrade for existing tower
  if (cell.tower) {
    showUpgrade(cell.tower);
    return;
  }

  hideUpgrade();

  // Place new tower
  if (selectedTower && cell.type === 'ground') {
    const td = themeData.towers.find(t => t.id === selectedTower);

    if (money >= td.cost) {
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
      addTower(tower);
      cell.tower = tower;

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

    // Skip if still on cooldown
    if (tw.cooldown > 0) continue;

    const tx = tw.x - hw + 0.5;
    const tz = tw.y - hh + 0.5;

    // Find best target based on priority
    const target = findTarget(tw, enemies, tx, tz);

    if (target) {
      const p = createProjectile(tw, target, tx, tz);
      if (p) {
        state.projectiles.push(p);
        emit(GameEvents.TOWER_FIRE, { tower: tw, target });
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
 * Toggle sell mode
 */
export function toggleSell() {
  const state = getState();
  const newMode = !state.sellMode;

  setSellMode(newMode);
  setSelectedTower(null);
  document.getElementById('sellBtn').classList.toggle('active', newMode);
  hideUpgrade();
  renderTowers();
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

// Expose to window for HTML onclick
window.toggleSell = toggleSell;
