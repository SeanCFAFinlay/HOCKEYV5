// Main entry point - Hockey vs Soccer TD
// Initializes all systems and exposes window handlers

// Import event system first
import { on, GameEvents } from './engine/events.js';

// Import UI modules (these set up window handlers)
import './ui/screens.js';
import { initModals } from './ui/modals.js';
import './ui/upgrade-sheet.js';
import './ui/controls.js';

// Import input handlers
import { setupInputHandlers } from './engine/input.js';

// Import camera controls
import { zoomIn, zoomOut, resetCam } from './engine/camera.js';

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

  // Set up input handlers
  setupInputHandlers();

  // Initialize speed buttons
  initSpeedButtons();

  // Initialize modal event listeners (win/lose handlers via game events)
  initModals();

  // Set up global event handlers for debugging
  if (DEBUG) {
    setupDebugListeners();
  }

  console.log('Initialization complete');
});

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
