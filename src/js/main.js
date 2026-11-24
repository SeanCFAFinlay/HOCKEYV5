// Main entry point - Hockey vs Soccer TD
// Initializes all systems and exposes window handlers

// Fonts ship with the game rather than coming from Google Fonts, so the app
// looks right offline and on first launch.
import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Ask the browser to keep this game's saves. Without it Safari may clear
// stored data for a site not visited for a week; an installed app is granted
// this, and it costs nothing to ask.
try { navigator.storage?.persist?.().catch(() => {}); } catch { /* unsupported */ }

// Import event system first
import { on, GameEvents } from './engine/events.js';

// Import audio system
import { initAudio, playSound } from './engine/audio.js';
import { registerAllSounds } from './config/sounds.js';

// Import config validation
import { runValidation } from './config/validation.js';
import { THEMES } from './config/themes.js';

// Import productization systems
import { initStorage } from './systems/storage.js';
import { initProgression } from './systems/progression.js';
import { initAchievements, getAllAchievements, getAchievementProgress } from './systems/achievements.js';
import * as Settings from './systems/settings.js';
import { initSettings, openSettings } from './ui/settings.js';

// Import UI modules
import { showScreen, showScreenWithAnimation, selectTheme, exitGame, replayGame as replayGameScreens } from './ui/screens.js';
import { initModals, closeModal } from './ui/modals.js';
import { initPauseSheet, togglePauseMenu, closePauseMenu, openPauseMenu } from './ui/pause-sheet.js';
import { initAppShell } from './native/app-shell.js';
import { initMobileHelpers } from './ui/mobile.js';
import { initMusicControl } from './ui/music-control.js';
import { initUpgradesButton } from './ui/perks-screen.js';
import { initTutorial } from './ui/tutorial.js';
import { isPaused } from './engine/loop.js';
import { initIcons, icon } from './ui/icons.js';
import { phLogo, applyBrandFavicon } from './ui/brand.js';
import { doUpgrade, hideUpgrade, sellTower, setTowerPriorityFromUI } from './ui/upgrade-sheet.js';
import './ui/controls.js';

// Import input handlers
import { setupInputHandlers } from './engine/input.js';

// Import camera controls
import { zoomIn, zoomOut, resetCam, shakeCamera, cameraVictoryOrbit, cameraDefeatDrop } from './engine/camera.js';

// Import control initializers
import { initSpeedButtons } from './ui/controls.js';
import { updateViewOffset } from './engine/scene.js';
import { initBuildStrip } from './ui/build-strip.js';
import { initStartButton } from './ui/start-button.js';

// Import tower bar
import { selectTowerType } from './ui/tower-bar.js';

// Import wave system. Auto-wave is toggled from the pause sheet, which imports
// it directly, so it no longer needs a window global.
import { startWave } from './systems/waves.js';

// Import music system
import { initMusic, setMusicState } from './engine/music.js';

// Import ambient soundscape
import { initAmbient, setAmbientTheme, setAmbientIntensity, startAmbient, stopAmbient } from './engine/ambient.js';

// Import HUD
import { initHUD } from './ui/hud.js';
import { initPerfOverlay, showPerfOverlay } from './ui/perf-overlay.js';
import { initMinimap } from './ui/minimap.js';

// Debug mode
const DEBUG = false;

function updateBottomUIClearance() {
  const bottomUI = document.querySelector('.bottom-ui');
  const rect = bottomUI?.getBoundingClientRect();
  const compactBottomUI = window.matchMedia('(max-height: 500px) and (orientation: landscape)').matches;
  const fallbackHeight = compactBottomUI ? 76 : 176;
  // Measured from the dock's top edge to the bottom of the screen, not just its
  // height: on a desktop the dock floats a little above the bottom.
  const measuredHeight = rect && rect.height > 20 ? window.innerHeight - rect.top : fallbackHeight;
  const clearance = Math.ceil(measuredHeight + 8);
  document.documentElement.style.setProperty('--bottom-ui-clearance', `${clearance}px`);
  updateViewOffset();
}

function scheduleBottomUIClearanceUpdate() {
  requestAnimationFrame(updateBottomUIClearance);
}

function initBottomUIClearanceObserver() {
  const bottomUI = document.querySelector('.bottom-ui');
  if (!bottomUI) return;

  scheduleBottomUIClearanceUpdate();

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(scheduleBottomUIClearanceUpdate);
    resizeObserver.observe(bottomUI);
  }

  const bottomObserver = new MutationObserver(scheduleBottomUIClearanceUpdate);
  bottomObserver.observe(bottomUI, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) {
    const screenObserver = new MutationObserver(scheduleBottomUIClearanceUpdate);
    screenObserver.observe(gameScreen, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  window.addEventListener('resize', scheduleBottomUIClearanceUpdate, { passive: true });
  window.addEventListener('orientationchange', scheduleBottomUIClearanceUpdate, { passive: true });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Hockey vs Soccer TD - Initializing...');

  try {
  // Fill static [data-icon] placeholders (HUD, menu logo, modals) with SVG.
  initIcons();

  // PH Interactive Studios branding: the mark on the splash + menu, and the
  // browser-tab favicon. (Vector recreation of the studio logo — swap for the
  // real PNG in ui/brand.js when it's on disk.)
  document.querySelectorAll('[data-brand]').forEach(el => { el.innerHTML = phLogo({ size: 96 }); });
  document.querySelectorAll('[data-brand-small]').forEach(el => { el.innerHTML = phLogo({ size: 40 }); });
  // One icon per world on the splash, in menu order.
  const loaderWorlds = document.getElementById('loaderWorlds');
  if (loaderWorlds) {
    loaderWorlds.innerHTML = Object.values(THEMES)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((t, i) => `<span style="--wc:${t.color};--i:${i}" title="${t.name}">${icon(t.icon)}</span>`)
      .join('');
  }
  try { applyBrandFavicon(); } catch (e) { /* favicon is non-critical */ }

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

  // SC-5.2: Initialize audio and register all SFX
  try { initAudio(); registerAllSounds(); } catch(e) { console.warn('Audio init failed:', e); }

  // Initialize music system and start menu music
  try { initMusic(); setMusicState('menu'); } catch(e) { console.warn('Music init failed:', e); }

  // Initialize ambient soundscape
  try { initAmbient(); } catch(e) { console.warn('Ambient init failed:', e); }
  import('./ui/settings.js').then(m => m.applyAudioSettings()).catch(() => {});

  // Set up input handlers
  setupInputHandlers();

  // Initialize speed buttons
  initSpeedButtons();
  try { initBuildStrip(); initStartButton(); } catch(e) { console.warn('Control init failed:', e); }
  initPerfOverlay();
  try { initMinimap(); } catch(e) { console.warn('Minimap init failed:', e); }

  // Initialize modal event listeners (win/lose handlers via game events)
  initModals();

  // Pause / overflow menu. Restart and exit are injected rather than imported
  // by the sheet itself, to keep ui/pause-sheet.js from depending on screens.js.
  initPauseSheet({ onRestart: replayGameScreens, onExit: exitGame });
  initAppShell();
  initMobileHelpers({ pause: openPauseMenu, isPaused });
  initMusicControl();
  initUpgradesButton();
  initTutorial();

  // Initialize settings panel (loads settings, applies, injects buttons)
  try { initSettings(); } catch(e) { console.warn('Settings init failed:', e); }
  initBottomUIClearanceObserver();

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
    // Ambient intensity: boss wave = 0.8, normal wave = 0.6
    const isBossWave = wave % 5 === 0 && wave > 0;
    setAmbientIntensity(isBossWave ? 0.8 : 0.6);
  });

  on(GameEvents.WAVE_COMPLETE, () => {
    setAmbientIntensity(0.3);
  });

  on(GameEvents.GAME_START, ({ theme }) => {
    if (theme) setAmbientTheme(theme);
    startAmbient();
  });

  // SC-5.2: Game outcome sounds
  on(GameEvents.GAME_LOSE, () => {
    shakeCamera(0.8, 0.6);
    cameraDefeatDrop();
    stopAmbient();
    playSound('gameLose');
  });

  on(GameEvents.GAME_WIN, () => {
    cameraVictoryOrbit();
    stopAmbient();
    playSound('gameWin');
  });

  // Set up global event handlers for debugging
  if (DEBUG) {
    setupDebugListeners();
  }

  } catch (e) {
    console.error('Initialization error:', e);
  }

  // Fade the splash out once initialized. It stays up for at least ~0.9s from
  // page start so it reads as a title card rather than a flicker.
  const loader = document.getElementById('appLoader');
  if (loader) {
    const wait = Math.max(100, 900 - performance.now());
    setTimeout(() => {
      loader.classList.add('hidden');
    }, wait);
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
    <div class="achievement-icon">${icon(achievement.icon)}</div>
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

// Expose functions to window for HTML onclick handlers (single authoritative location)
const appGlobal = globalThis.window || globalThis;
Object.assign(appGlobal, {
  zoomIn,
  zoomOut,
  resetCam,
  selectTowerType,
  startWave,
  showScreen,
  showScreenWithAnimation,
  selectTheme,
  exitGame,
  togglePauseMenu,
  closePauseMenu,
  replayGame: replayGameScreens,
  closeModal,
  doUpgrade,
  hideUpgrade,
  sellTower,
  setTowerPriorityFromUI
});

// Expose debug tools
if (DEBUG) {
  appGlobal.__debug = {
    getState: () => import('./engine/state.js').then(m => m.getState()),
    getPoolStats: () => import('./engine/pools.js').then(m => m.getPoolStats()),
    getPathCacheStats: () => import('./systems/pathfinding.js').then(m => m.getPathCacheStats()),
    showPerf: showPerfOverlay
  };
}

appGlobal.__perf = { show: showPerfOverlay };
appGlobal.openSettings = openSettings;
