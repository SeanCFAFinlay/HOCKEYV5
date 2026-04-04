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

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function selectTheme(t) {
  const themeData = THEMES[t];
  setTheme(t, themeData);

  document.getElementById('mapTitle').textContent = themeData.icon + ' ' + themeData.name;
  document.getElementById('mapTitle').style.color = themeData.color;

  const grid = document.getElementById('mapGrid');
  grid.innerHTML = '';

  // Import high scores
  import('../systems/highscores.js').then(({ getHighScore }) => {
    themeData.maps.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'map-card';
      card.style.setProperty('--c', themeData.color);
      
      // Get high score for this map
      const highScore = getHighScore(t, i);
      const highScoreHTML = highScore 
        ? `<div class="map-card-highscore">Best: Wave ${highScore.wave}</div>`
        : '';
      
      card.innerHTML = `
        <div class="map-card-icon">${themeData.icon}</div>
        <div class="map-card-name">${m.name}</div>
        <div class="map-card-info">${m.waves} Waves • ${m.cols}×${m.rows}</div>
        <div class="map-stars">${[1, 2, 3, 4, 5].map(n => `<span class="${n <= m.diff ? 'on' : ''}">⭐</span>`).join('')}</div>
        ${highScoreHTML}
      `;
      card.onclick = () => startGame(i);
      grid.appendChild(card);
    });
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

  // Stop game loop
  stopGameLoop();

  // Cleanup
  if (state.autoWaveTimer) {
    clearTimeout(state.autoWaveTimer);
  }

  // Hide modals
  document.getElementById('winModal')?.classList.remove('show');
  document.getElementById('loseModal')?.classList.remove('show');

  emit(GameEvents.GAME_RESET, {});

  // Return to theme selection
  selectTheme(state.theme);
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
