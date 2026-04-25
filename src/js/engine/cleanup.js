// Centralized cleanup for game reset/exit
// Ensures all resources are properly disposed

import { getState, clearAutoWaveTimerSafe, resetGameState, getAllEntities } from './state.js';
import { clearSpawnQueue } from '../systems/waves.js';
import { clearPathCache } from '../systems/pathfinding.js';
import { clearAllParticles } from '../systems/particles.js';
import { returnEnemyMesh } from '../rendering/enemy-meshes.js';
import { stopGameLoop, resetGameTime } from './loop.js';
import { resetInputState } from './input.js';

/**
 * Dispose of a Three.js object and its resources
 * @param {THREE.Object3D} obj
 */
function disposeObject(obj) {
  if (!obj) return;

  if (obj.geometry) {
    obj.geometry.dispose();
  }

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => m.dispose());
    } else {
      obj.material.dispose();
    }
  }
}

/**
 * Dispose of a Three.js group/mesh and all children
 * @param {THREE.Object3D} group
 */
function disposeGroup(group) {
  if (!group) return;

  group.traverse((obj) => {
    disposeObject(obj);
  });
}

/**
 * Clean up all towers
 * @param {THREE.Scene} scene
 * @param {Array} towers
 */
function cleanupTowers(scene, towers) {
  for (const tower of towers) {
    if (tower.mesh) {
      scene.remove(tower.mesh);
      disposeGroup(tower.mesh);
    }
    if (tower.rangeMesh) {
      scene.remove(tower.rangeMesh);
      disposeGroup(tower.rangeMesh);
    }
  }
}

/**
 * Clean up all enemies
 * @param {THREE.Scene} scene
 * @param {Array} enemies
 */
function cleanupEnemies(scene, enemies) {
  for (const enemy of enemies) {
    if (enemy.mesh) {
      scene.remove(enemy.mesh);
      returnEnemyMesh(enemy);
    }
  }
}

/**
 * Clean up all projectiles
 * @param {THREE.Scene} scene
 * @param {Array} projectiles
 */
function cleanupProjectiles(scene, projectiles) {
  for (const projectile of projectiles) {
    if (projectile.mesh) {
      scene.remove(projectile.mesh);
      disposeGroup(projectile.mesh);
    }
    // Clean up trail particles
    if (projectile.trail) {
      for (const trailParticle of projectile.trail) {
        scene.remove(trailParticle);
      }
    }
  }
}

/**
 * Perform a full game cleanup
 * Call this when exiting or resetting the game
 */
export function performFullCleanup() {
  const state = getState();
  const { scene } = state;

  // 1. Stop the game loop first
  stopGameLoop();

  // 2. Clear timers
  clearAutoWaveTimerSafe();

  // 3. Clear spawn queue
  clearSpawnQueue();

  // 4. If we have a scene, clean up all entities visually
  if (scene) {
    const { towers, enemies, projectiles } = getAllEntities();

    cleanupTowers(scene, towers);
    cleanupEnemies(scene, enemies);
    cleanupProjectiles(scene, projectiles);
    clearAllParticles();
  }

  // 5. Clear pathfinding cache
  clearPathCache();

  // 6. Reset timing
  resetGameTime();

  // 7. Reset input state
  resetInputState();

  // 8. Reset game state (clears entity arrays)
  resetGameState();
}

/**
 * Perform a soft reset (keep scene, just reset game state)
 * Call this when restarting the same map
 */
export function performSoftReset() {
  const state = getState();
  const { scene, grid, ROWS, COLS } = state;

  // Stop loop
  stopGameLoop();

  // Clear timers
  clearAutoWaveTimerSafe();

  // Clear spawns
  clearSpawnQueue();

  // Clean entities
  if (scene) {
    const { towers, enemies, projectiles } = getAllEntities();

    cleanupTowers(scene, towers);
    cleanupEnemies(scene, enemies);
    cleanupProjectiles(scene, projectiles);
    clearAllParticles();
  }

  // Clear tower references from grid
  if (grid) {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y] && grid[y][x]) {
          grid[y][x].tower = null;
        }
      }
    }
  }

  // Clear path cache
  clearPathCache();

  // Reset timing
  resetGameTime();

  // Reset input
  resetInputState();

  // Reset state
  resetGameState();
}
