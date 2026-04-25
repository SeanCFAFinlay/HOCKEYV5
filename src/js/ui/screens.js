// Screen management - menu, map selection, game

import { THEMES } from '../config/themes.js';
import { generateWaves } from '../config/waves.js';
import {
  getState,
  setTheme,
  setMapData,
  setMapDimensions,
  setMoney,
  setLives,
  setWave,
  setScore,
  setGameSpeed,
  setWaves,
  setKills,
  resetGameState
} from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { generateMap } from '../systems/map.js';
import { clearPathCache } from '../systems/pathfinding.js';
import { clearSpawnQueue } from '../systems/waves.js';
import { init3D, onResize, cleanupScene } from '../engine/scene.js';
import { startGameLoop, stopGameLoop, resetGameTime } from '../engine/loop.js';
import { initCameraState } from '../engine/camera.js';
import { updateHUD, renderTowers, initHUD, resetHUD } from './hud.js';
import { performFullCleanup } from '../engine/cleanup.js';
import { getMapsWithProgress, getThemeProgress, getStarDisplay } from '../systems/progression.js';

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function selectTheme(t) {
  const themeData = THEMES[t];
  setTheme(t, themeData);

  // Get maps with progression data
  const mapsWithProgress = getMapsWithProgress(t, themeData.maps);
  const themeProgressData = getThemeProgress(t, themeData.maps.length);

  document.getElementById('mapTitle').textContent = themeData.icon + ' ' + themeData.name;
  document.getElementById('mapTitle').style.color = themeData.color;

  const grid = document.getElementById('mapGrid');
  grid.innerHTML = '';

  mapsWithProgress.forEach((m, i) => {
    const card = document.createElement('div');
    const isLocked = !m.unlocked;

    card.className = 'map-card' + (isLocked ? ' locked' : '') + (m.completed ? ' completed' : '');
    card.style.setProperty('--c', themeData.color);

    // Show earned stars (0-3) or difficulty stars if not played
    const starDisplay = m.stars > 0
      ? getStarDisplay(m.stars, 3)
      : [1, 2, 3, 4, 5].map(n => `<span class="${n <= m.diff ? 'diff' : ''}">☆</span>`).join('');

    // Best score display with fallback to highscore system
    let bestScoreHTML = '';
    if (m.bestScore > 0) {
      bestScoreHTML = `<div class="map-best-score">Best: ${m.bestScore.toLocaleString()}</div>`;
    }

    card.innerHTML = `
      <div class="map-card-icon">${isLocked ? '🔒' : themeData.icon}</div>
      <div class="map-card-name">${m.name}</div>
      <div class="map-card-info">${m.waves} Waves • ${m.cols}×${m.rows}</div>
      <div class="map-stars${m.stars > 0 ? ' earned' : ''}">${starDisplay}</div>
      ${bestScoreHTML}
    `;

    if (!isLocked) {
      card.onclick = () => startGame(i);
    } else {
      card.onclick = () => {
        // Show locked message
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
      };
    }

    grid.appendChild(card);
  });

  showScreen('mapScreen');
}

export function startGame(idx) {
  const state = getState();
  const { themeData } = state;
  const mapData = themeData.maps[idx];

  // Set map data
  setMapData(mapData, idx);
  setMapDimensions(mapData.cols, mapData.rows);
  setMoney(mapData.money);
  setLives(mapData.lives);
  setWave(0);
  setScore(0);
  setKills(0);
  setGameSpeed(1);

  // Reset all systems
  resetGameState();
  clearPathCache();
  clearSpawnQueue();
  resetGameTime();

  // Reset UI
  const ab = document.getElementById('autoBtn');
  if (ab) {
    ab.textContent = 'AUTO: OFF';
    ab.classList.remove('on');
  }

  // Reset speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', +btn.dataset.speed === 1);
  });

  // Generate map and waves
  generateMap();
  setWaves(generateWaves(mapData.waves));

  showScreen('gameScreen');

  // Wait for layout before initializing 3D
  (function waitForLayout() {
    const wrap = document.querySelector('.canvas-wrap');
    const w = wrap ? wrap.getBoundingClientRect().width : 0;
    const h = wrap ? wrap.getBoundingClientRect().height : 0;

    if (w < 20 || h < 20) {
      requestAnimationFrame(waitForLayout);
      return;
    }

    // Initialize 3D scene
    init3D();
    onResize();

    // Initialize camera
    initCameraState();

    // Initialize UI
    initHUD();
    renderTowers();
    updateHUD();

    // Start game loop
    startGameLoop();

    // Emit game start event
    emit(GameEvents.GAME_START, {
      theme: state.theme,
      map: mapData.name,
      waves: mapData.waves
    });
  })();
}

export function exitGame() {
  const state = getState();
  const theme = state.theme;

  // Perform full cleanup
  performFullCleanup();

  // Hide modals
  document.getElementById('winModal')?.classList.remove('show');
  document.getElementById('loseModal')?.classList.remove('show');

  emit(GameEvents.GAME_RESET, {});

  // Return to theme selection
  selectTheme(theme);
}

/**
 * Replay the same map immediately
 */
export function replayGame() {
  const state = getState();
  const mapIdx = state.mapIndex;

  // Hide modals
  document.getElementById('winModal')?.classList.remove('show');
  document.getElementById('loseModal')?.classList.remove('show');

  // Stop current game
  stopGameLoop();

  // Cleanup
  if (state.autoWaveTimer) {
    clearTimeout(state.autoWaveTimer);
  }

  cleanupScene();

  // Restart same map
  setTimeout(() => {
    startGame(mapIdx);
  }, 100);
}

/**
 * Replay the same map immediately
 */
export function replayGame() {
  const state = getState();
  const mapIdx = state.mapIndex;

  // Hide modals
  document.getElementById('winModal')?.classList.remove('show');
  document.getElementById('loseModal')?.classList.remove('show');

  // Stop current game
  stopGameLoop();

  // Cleanup
  if (state.autoWaveTimer) {
    clearTimeout(state.autoWaveTimer);
  }

  cleanupScene();

  // Restart same map
  setTimeout(() => {
    startGame(mapIdx);
  }, 100);
}

// Expose to window for HTML onclick handlers
window.showScreen = showScreen;
window.selectTheme = selectTheme;
window.exitGame = exitGame;
window.replayGame = replayGame;
