// Enemy spawning and movement with state machine
// Delta-time based, deterministic movement

import { enemyHpScale, enemyRewardScale, enemySpeedScale } from '../config/balance.js';
import { getState, addEnemy, decrementLives, decrementSpawnsPending, addMoney, addScore, incrementKills } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { playSoundAt } from '../engine/audio.js';
import { findPathGrid, onNavChanged } from './pathfinding.js';
import { createEnemyMesh, returnEnemyMesh } from '../rendering/enemy-meshes.js';
import { attachEnemyPowerLabel } from '../rendering/sprites.js';
import { updateHUD } from '../ui/hud.js';
import { triggerCurrencyFly } from '../ui/currency-fly.js';
import { hideUpgrade } from '../ui/upgrade-sheet.js';
import { assertDefined, assertPositiveNumber, warnIf } from '../utils/assertions.js';
import { cameraBossTrack } from '../engine/camera.js';
import { freshStatus, tickStatus, speedMultiplier, applyBurn } from './status.js';
import { detachStatusFx } from '../rendering/status-fx.js';

// How fast a knocked-back enemy is thrown, in tiles per second.
const KNOCK_SPEED = 7;

// Enemy state machine states
export const EnemyState = {
  SPAWNING: 'spawning',
  MOVING: 'moving',
  ATTACKING: 'attacking',
  DEAD: 'dead',
  EXITED: 'exited'
};

/**
 * Spawn a new enemy
 * @param {Object} ed - Enemy definition
 */
export function spawnEnemy(ed) {
  // Validate enemy definition
  assertDefined(ed, 'enemy definition');
  assertDefined(ed.id, 'enemy.id');
  assertPositiveNumber(ed.hp, 'enemy.hp');
  assertPositiveNumber(ed.spd, 'enemy.spd');
  assertPositiveNumber(ed.rwd, 'enemy.rwd');

  const state = getState();
  const { COLS, ROWS, SPAWNS, wave, scene } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  // Validate game state
  warnIf(SPAWNS.length === 0, 'No spawn points defined');

  // Deterministic spawn point selection
  const spawnIndex = state.enemies.length % SPAWNS.length;
  const s = SPAWNS[spawnIndex] || { x: 0, y: Math.floor(ROWS / 2) };

  // Health, reward and speed for this wave on this map (config/balance.js).
  const mapIndex = state.mapIndex || 0;
  const hpScale = enemyHpScale(wave, mapIndex);
  // Enemies queued by a wave carry their share of that wave's bounty.
  const rewardScale = ed.rwdScale ?? enemyRewardScale(wave);
  const speed = ed.spd * enemySpeedScale(mapIndex);

  const e = {
    // Identity
    type: ed.id,
    configId: ed.id,
    nm: ed.nm,
    role: ed.role,
    slot: ed.slot || ed.role?.toLowerCase(),
    threatTags: ed.threatTags || [],
    speedClass: ed.speedClass,
    rewardClass: ed.rewardClass,
    id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

    // State machine
    state: EnemyState.SPAWNING,

    // Position (world coords)
    spawn: { x: s.x, y: s.y },
    x: s.x - hw + 0.5,
    y: 0.2,
    z: s.y - hh + 0.5,

    // Previous position for interpolation
    prevX: s.x - hw + 0.5,
    prevY: 0.2,
    prevZ: s.y - hh + 0.5,

    hp: ed.hp * hpScale,
    maxHp: ed.hp * hpScale,
    baseSpd: speed,
    spd: speed,
    rwd: Math.max(1, Math.round(ed.rwd * rewardScale)),
    sz: ed.sz || 1,
    armor: ed.armor || 0,

    // Flags
    fire: ed.fire || false,
    flying: ed.flying || false,
    boss: ed.boss || false,

    // Pathfinding
    pathIdx: 1,
    path: null,
    navV: -1,

    // Status effects (chill, freeze, shock, burn, ... see systems/status.js)
    ...freshStatus(),

    // Attack state
    attackTarget: null,
    attackCooldown: 0,

    // Visual
    mesh: null,
    hpBar: null,
    hpSize: 0.4
  };

  // Create mesh from pool
  e.mesh = createEnemyMesh(e);

  if (e.mesh) {
    e.mesh.position.set(e.x, e.flying ? 1.2 : 0.2, e.z);
    scene.add(e.mesh);
    attachEnemyPowerLabel(e);
  }

  // Transition to moving state
  e.state = EnemyState.MOVING;

  addEnemy(e);
  decrementSpawnsPending();

  // Dynamic camera: track boss briefly when it spawns
  if (e.boss) {
    cameraBossTrack(e.x, e.z);
  }
}

/**
 * Update all enemies
 * @param {number} dt - Fixed delta time
 */
export function updateEnemies(dt) {
  const state = getState();
  const { COLS, ROWS, enemies, grid, BASE, navVersion, towers, scene } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    // Skip dead/exited enemies
    if (e.state === EnemyState.DEAD || e.state === EnemyState.EXITED) {
      continue;
    }

    // Store previous position for interpolation
    e.prevX = e.x;
    e.prevY = e.y;
    e.prevZ = e.z;

    // Process status effects
    updateStatusEffects(e, dt);

    // Check death from burn damage
    if (e.hp <= 0) {
      handleEnemyDeath(e, i);
      continue;
    }

    // Current speed: chilled and staggered enemies crawl, frozen and stunned
    // ones do not move at all.
    const currentSpeed = e.baseSpd * speedMultiplier(e);

    // A thrown enemy lets go of whatever it was attacking.
    if (e.knock > 0 && e.state === EnemyState.ATTACKING) {
      e.state = EnemyState.MOVING;
      e.attackTarget = null;
    }

    // State machine update
    switch (e.state) {
      case EnemyState.MOVING:
        if (e.flying) {
          updateFlyingEnemy(e, dt, currentSpeed, hw, hh, i);
        } else {
          updateGroundEnemy(e, dt, currentSpeed, hw, hh, i);
        }
        break;

      case EnemyState.ATTACKING:
        updateAttackingEnemy(e, dt, currentSpeed, hw, hh, i);
        break;
    }

    // Update health bar
    updateHealthBar(e);

    // Update mesh position
    if (e.mesh && e.state !== EnemyState.DEAD && e.state !== EnemyState.EXITED) {
      e.mesh.position.set(e.x, e.y, e.z);
    }
  }
}

/**
 * Update status effects (slow, burn)
 */
function updateStatusEffects(e, dt) {
  tickStatus(e, dt);
}

/**
 * Throw a ground enemy back along the route it has already walked.
 * `path[pathIdx - 1]` is the tile behind it.
 */
function knockBackAlongPath(e, dt, hw, hh) {
  let step = Math.min(e.knock, KNOCK_SPEED * dt);
  e.knock -= step;

  while (step > 0.0001) {
    const prev = e.path && e.path[e.pathIdx - 1];
    if (!prev) { e.knock = 0; return; }

    const cx = prev[0] - hw + 0.5;
    const cz = prev[1] - hh + 0.5;
    const dx = cx - e.x;
    const dz = cz - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= step) {
      e.x = cx;
      e.z = cz;
      step -= dist;
      // Nothing recorded further back than the start of this route.
      if (e.pathIdx > 1) e.pathIdx--;
      else { e.knock = 0; return; }
    } else {
      e.x += (dx / dist) * step;
      e.z += (dz / dist) * step;
      step = 0;
    }
  }
}

/**
 * Update flying enemy - straight to base
 */
function updateFlyingEnemy(e, dt, speed, hw, hh, index) {
  const state = getState();
  const { BASE } = state;

  const tx = BASE.x - hw + 0.5;
  const tz = BASE.y - hh + 0.5;
  const dx = tx - e.x;
  const dz = tz - e.z;
  const dist = Math.sqrt(dx * dx + dz * dz) || 0.001;

  // Knocked back: thrown directly away from the base.
  if (e.knock > 0) {
    const step = Math.min(e.knock, KNOCK_SPEED * dt);
    e.knock -= step;
    e.x -= (dx / dist) * step;
    e.z -= (dz / dist) * step;
    e.y = 1.2;
    return;
  }

  const move = speed * dt;

  // Check if reached base
  if (dist <= move + 0.35) {
    handleEnemyEscape(e, index);
    return;
  }

  // Move towards base
  e.x += (dx / dist) * move;
  e.z += (dz / dist) * move;
  e.y = 1.2;

  // Face direction of movement
  if (e.mesh) {
    e.mesh.rotation.y = Math.atan2(dx, dz);
  }
}

/**
 * Update ground enemy - A* pathfinding
 */
function updateGroundEnemy(e, dt, speed, hw, hh, index) {
  const state = getState();
  const { COLS, ROWS, grid, BASE, navVersion, towers, scene } = state;

  // Convert to grid coords
  const gx = Math.max(0, Math.min(COLS - 1, Math.floor(e.x + hw)));
  const gy = Math.max(0, Math.min(ROWS - 1, Math.floor(e.z + hh)));

  // Check if path needs update
  if (e.navV !== navVersion || !e.path) {
    e.path = findPathGrid(gx, gy, BASE.x, BASE.y);
    e.stuck = !e.path;
    e.pathIdx = 1;
    e.navV = navVersion;
  }

  // No valid path
  if (!e.path || e.path.length < 2) {
    if (gx === BASE.x && gy === BASE.y) {
      handleEnemyEscape(e, index);
    }
    return;
  }

  if (e.knock > 0) {
    knockBackAlongPath(e, dt, hw, hh);
    e.y = 0.2;
    return;
  }

  // Get current target cell
  const step = e.path[Math.min(e.pathIdx, e.path.length - 1)];
  const sx = step[0];
  const sy = step[1];
  const stepCell = grid[sy] && grid[sy][sx];

  // Check if target cell has a tower - switch to attack mode
  if (stepCell && stepCell.tower) {
    e.state = EnemyState.ATTACKING;
    e.attackTarget = stepCell.tower;
    updateAttackingEnemy(e, dt, speed, hw, hh, index);
    return;
  }

  // Normal pathfinding movement
  let remaining = speed * dt;

  while (remaining > 0 && e.pathIdx < e.path.length) {
    const cell = e.path[e.pathIdx];
    const cx = cell[0] - hw + 0.5;
    const cz = cell[1] - hh + 0.5;

    const dx = cx - e.x;
    const dz = cz - e.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Reached current waypoint
    if (dist < 0.001) {
      e.pathIdx++;
      continue;
    }

    // Move towards waypoint
    if (dist <= remaining) {
      e.x = cx;
      e.z = cz;
      remaining -= dist;
      e.pathIdx++;
    } else {
      const ratio = remaining / dist;
      e.x += dx * ratio;
      e.z += dz * ratio;
      remaining = 0;
    }

    // Face direction of movement
    if (e.mesh && (Math.abs(dx) + Math.abs(dz) > 0.001)) {
      e.mesh.rotation.y = Math.atan2(dx, dz);
    }

    // Check if reached base
    const cgx = Math.max(0, Math.min(COLS - 1, Math.floor(e.x + hw)));
    const cgy = Math.max(0, Math.min(ROWS - 1, Math.floor(e.z + hh)));

    if (cgx === BASE.x && cgy === BASE.y) {
      handleEnemyEscape(e, index);
      return;
    }
  }

  e.y = 0.2;
}

/**
 * Update attacking enemy - attacking a tower
 */
function updateAttackingEnemy(e, dt, speed, hw, hh, index) {
  const state = getState();
  const { grid, towers, scene, COLS, ROWS, BASE } = state;

  // Check if target tower still exists
  if (!e.attackTarget || e.attackTarget.hp <= 0) {
    e.state = EnemyState.MOVING;
    e.attackTarget = null;
    e.navV = -1; // Force path recalc
    return;
  }

  const tower = e.attackTarget;
  const tx = tower.x - hw + 0.5;
  const tz = tower.y - hh + 0.5;

  const dx = tx - e.x;
  const dz = tz - e.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  // Move towards tower if not in attack range
  if (dist > 0.55) {
    const move = speed * dt;
    const ratio = Math.min(move / dist, 1);
    e.x += dx * ratio;
    e.z += dz * ratio;

    if (e.mesh) {
      e.mesh.rotation.y = Math.atan2(dx, dz);
    }
  } else {
    // In range - attack tower
    const attackDamage = 35 * dt;
    tower.hp = (tower.hp ?? 160) - attackDamage;

    // Tower destroyed
    if (tower.hp <= 0) {
      if (tower.mesh) scene.remove(tower.mesh);
      if (tower.rangeMesh) scene.remove(tower.rangeMesh);

      const towerIdx = towers.indexOf(tower);
      if (towerIdx !== -1) towers.splice(towerIdx, 1);

      const cell = grid[tower.y][tower.x];
      if (cell) cell.tower = null;

      emit(GameEvents.TOWER_DESTROYED, { tower });
      hideUpgrade(); // Auto-close upgrade sheet if this tower was selected
      onNavChanged();

      e.state = EnemyState.MOVING;
      e.attackTarget = null;
    }
  }

  e.y = 0.2;
}

/**
 * Handle enemy death
 */
function handleEnemyDeath(e, index) {
  const state = getState();

  e.state = EnemyState.DEAD;

  // Award rewards immediately
  addMoney(e.rwd);
  addScore(Math.floor(e.rwd * 1.5));
  incrementKills();

  // Fly-to currency effect
  triggerCurrencyFly(e.rwd, e.x, e.y ?? 0.5, e.z);

  // Remove from active enemies array immediately so towers don't target it
  state.enemies.splice(index, 1);

  // Ignite: a burning enemy that dies sets its neighbours alight.
  if (e.burnT > 0 && e.burnSpread > 0) {
    const r2 = e.burnSpread * e.burnSpread;
    state.enemies.forEach(other => {
      const dx = other.x - e.x;
      const dz = other.z - e.z;
      if (dx * dx + dz * dz < r2) applyBurn(other, e.burnBase, Math.max(2, e.burnT), 1);
    });
  }
  detachStatusFx(e);

  // SC-5.2: enemy death sound (boss vs normal)
  const deathSound = e.boss ? 'enemyDeathBoss' : 'enemyDeath';
  playSoundAt(deathSound, e.x, e.z);

  emit(GameEvents.ENEMY_DEATH, { enemy: e, reward: e.rwd });
  updateHUD();

  // Remove mesh and dispose
  if (e.mesh) {
    state.scene.remove(e.mesh);
    returnEnemyMesh(e);
  }
}

/**
 * Handle enemy escape (reached base)
 */
function handleEnemyEscape(e, index) {
  const state = getState();

  e.state = EnemyState.EXITED;
  detachStatusFx(e);

  // Remove mesh
  if (e.mesh) {
    state.scene.remove(e.mesh);
    returnEnemyMesh(e);
  }

  decrementLives();

  // Remove from array
  state.enemies.splice(index, 1);

  emit(GameEvents.ENEMY_ESCAPE, { enemy: e });
  updateHUD();
}

/**
 * Update health bar display
 */
function updateHealthBar(e) {
  if (e.hpBar) {
    const ratio = Math.max(0, e.hp / e.maxHp);
    if (!e.hpShown && ratio < 1 && e.hpParts) {
      e.hpShown = true;
      e.hpParts.forEach(part => { part.visible = true; });
    }
    e.hpBar.scale.x = ratio;
    e.hpBar.position.x = -e.hpSize * (1 - ratio) / 2;
  }
}

/**
 * Remove enemy by reference or index
 */
export function removeEnemy(e, i) {
  const state = getState();
  detachStatusFx(e);

  if (e.mesh) {
    state.scene.remove(e.mesh);
    returnEnemyMesh(e);
  }

  if (typeof i === 'number') {
    state.enemies.splice(i, 1);
  } else {
    const idx = state.enemies.indexOf(e);
    if (idx !== -1) state.enemies.splice(idx, 1);
  }
}
