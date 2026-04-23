// Main entry point - Hockey vs Soccer TD
// Initializes all systems and exposes window handlers

// Import event system first
import { on, GameEvents } from './engine/events.js';

// Import config validation
import { runValidation } from './config/validation.js';
import { THEMES } from './config/themes.js';

// Import productization systems
import { initStorage } from './systems/storage.js';
import { initProgression } from './systems/progression.js';
import { initAchievements, getAllAchievements, getAchievementProgress } from './systems/achievements.js';
import * as Settings from './systems/settings.js';

// Import UI modules (these set up window handlers)
import './ui/screens.js';
import { initModals } from './ui/modals.js';
import './ui/upgrade-sheet.js';
import './ui/controls.js';

// Import input handlers
import { setupInputHandlers } from './engine/input.js';

// Import camera controls
import { zoomIn, zoomOut, resetCam, shakeCamera } from './engine/camera.js';

// Import control initializers
import { initSpeedButtons } from './ui/controls.js';

// Import tower bar
import { selectTowerType } from './ui/tower-bar.js';

// Import tower system for sell toggle
import { toggleSell } from './systems/towers.js';

// Import wave system
import { startWave, toggleAutoWave } from './systems/waves.js';

// Import HUD
import { initHUD } from './ui/hud.js';

// Debug mode
const DEBUG = false;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Hockey vs Soccer TD - Initializing...');

  // Validate all config data on startup
  const configValid = runValidation(THEMES, false);
  if (!configValid) {
    console.warn('Config validation failed - game may have issues');
  }

  // Initialize productization systems
  initStorage();
  initProgression();
  initAchievements();
  console.log('Save/progression systems initialized');

  // Set up input handlers
  setupInputHandlers();

  // Initialize speed buttons
  initSpeedButtons();

  // Initialize modal event listeners (win/lose handlers via game events)
  initModals();

  // Set up achievement notification listener
  on(GameEvents.ACHIEVEMENT_UNLOCKED, ({ achievement }) => {
    showAchievementNotification(achievement);
  });

  // Wire camera shake to gameplay events for game feel
  on(GameEvents.ENEMY_ESCAPE, () => {
    shakeCamera(0.4, 0.35);
  });

  on(GameEvents.ENEMY_DEATH, ({ enemy }) => {
    if (enemy.boss) {
      shakeCamera(0.7, 0.5);
    }
  });

  on(GameEvents.WAVE_START, ({ wave }) => {
    // Shake on boss waves (every 5th)
    if (wave % 5 === 0 && wave > 0) {
      shakeCamera(0.5, 0.4);
    }
  });

  on(GameEvents.GAME_LOSE, () => {
    shakeCamera(0.8, 0.6);
  });

  // Set up global event handlers for debugging
  if (DEBUG) {
    setupDebugListeners();
  }

  // Hide loader once initialized
  const loader = document.getElementById('appLoader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 100);
  }

  console.log('Initialization complete');
});

/**
 * Show achievement unlock notification
 * @param {Object} achievement - Achievement data
 */
function showAchievementNotification(achievement) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-text">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.name}</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Debug event listeners
function setupDebugListeners() {
  on(GameEvents.GAME_START, (data) => {
    console.log('[EVENT] Game started:', data);
  });

  on(GameEvents.WAVE_START, (data) => {
    console.log('[EVENT] Wave started:', data);
  });

  on(GameEvents.WAVE_COMPLETE, (data) => {
    console.log('[EVENT] Wave complete:', data);
  });

  on(GameEvents.ENEMY_SPAWN, (data) => {
    console.log('[EVENT] Enemy spawned:', data.enemy.type);
  });

  on(GameEvents.ENEMY_DEATH, (data) => {
    console.log('[EVENT] Enemy died:', data.enemy.type, 'Reward:', data.reward);
  });

  on(GameEvents.TOWER_PLACE, (data) => {
    console.log('[EVENT] Tower placed:', data.tower.type);
  });

  on(GameEvents.GAME_WIN, (data) => {
    console.log('[EVENT] Game won! Score:', data.score);
  });

  on(GameEvents.GAME_LOSE, (data) => {
    console.log('[EVENT] Game lost at wave:', data.wave);
  });
}

// Expose functions to window for HTML onclick handlers
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetCam = resetCam;
window.selectTowerType = selectTowerType;
window.toggleSell = toggleSell;
window.startWave = startWave;
window.toggleAutoWave = toggleAutoWave;

// Expose debug tools
if (DEBUG) {
  window.__debug = {
    getState: () => import('./engine/state.js').then(m => m.getState()),
    getPoolStats: () => import('./engine/pools.js').then(m => m.getPoolStats()),
    getPathCacheStats: () => import('./systems/pathfinding.js').then(m => m.getPathCacheStats())
  };
}
