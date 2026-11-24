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
  setWaves,
  setKills,
  setGameMode,
  setAutoWave,
  resetGameState
} from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { generateMap } from '../systems/map.js';
import { clearPathCache } from '../systems/pathfinding.js';
import { clearSpawnQueue } from '../systems/waves.js';
import { init3D, onResize, cleanupScene } from '../engine/scene.js';
import { startGameLoop, stopGameLoop, resetGameTime } from '../engine/loop.js';
import { initCameraState } from '../engine/camera.js';
import { setSpeedEffect } from '../engine/postprocessing.js';
import { clearTargetingFeedback } from '../rendering/targeting-feedback.js';
import { updateHUD, renderTowers, initHUD, resetHUD } from './hud.js';
import { resetGameSpeed } from './controls.js';
import { icon } from './icons.js';
import { performFullCleanup } from '../engine/cleanup.js';
import { getMapsWithProgress, getThemeProgress, getStarDisplay } from '../systems/progression.js';
import { showScreenAnimated, cancelTransition } from './transitions.js';
import { initAbilityBar, hideAbilityBar } from './ability-bar.js';
import { matchBonuses } from '../systems/perks.js';
import { refreshUpgradesButton } from './perks-screen.js';
import { showArenaLoader, hideArenaLoader } from './arena-loader.js';
import { warmUpShaders } from '../rendering/warmup.js';
import { hideUpgrade } from './upgrade-sheet.js';
import { resetInputState } from '../engine/input.js';

export function renderThemeCards() {
  const container = document.getElementById('themeCards');
  if (!container) return;

  const packs = Object.values(THEMES).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  container.innerHTML = '';

  let totalStars = 0;
  let totalCleared = 0;
  let totalArenas = 0;

  packs.forEach((pack, i) => {
    const progress = getThemeProgress(pack.id, pack.maps.length);
    totalStars += progress.stars;
    totalCleared += progress.completedMaps;
    totalArenas += progress.totalMaps;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = `menu-card ${pack.id}`;
    card.style.setProperty('--c', pack.color);
    card.style.setProperty('--i', i);
    card.onclick = () => selectTheme(pack.id);
    card.innerHTML = `
      <span class="menu-card-ghost">${icon(pack.icon)}</span>
      <span class="menu-card-art">${icon(pack.icon)}</span>
      <span class="menu-card-body">
        <span class="menu-card-name">${pack.name}</span>
        <span class="menu-card-desc">${pack.description}</span>
        <span class="menu-card-meta">
          <span class="menu-card-bar"><i style="width:${progress.percentComplete}%"></i></span>
          <span>${progress.completedMaps}/${progress.totalMaps} arenas</span>
          ${progress.stars > 0 ? `<span class="menu-card-stars">★ ${progress.stars}</span>` : ''}
        </span>
      </span>
      <span class="menu-card-arrow">›</span>
    `;
    container.appendChild(card);
  });

  refreshUpgradesButton();
  const summary = document.getElementById('menuProgress');
  if (summary) {
    summary.textContent = totalCleared > 0 ? `${totalCleared}/${totalArenas} cleared · ★ ${totalStars}` : `${packs.length} worlds`;
  }
}

/** 'OPEN_CENTER' -> 'Open center' */
function readable(tag) {
  const words = String(tag || '').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : '';
}

export function showScreen(id) {
  // Progress may have changed since the menu was last drawn.
  if (id === 'menuScreen') renderThemeCards();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

export function showScreenWithAnimation(id) {
  showScreenAnimated(id);
}

export function selectTheme(t) {
  const themeData = THEMES[t];
  setTheme(t, themeData);
  document.documentElement.style.setProperty('--theme-accent', themeData.visuals?.ui?.accent || themeData.color);
  document.documentElement.style.setProperty('--theme-dark', themeData.visuals?.ui?.dark || '#07090f');

  // Get maps with progression data
  const mapsWithProgress = getMapsWithProgress(t, themeData.maps);
  const themeProgressData = getThemeProgress(t, themeData.maps.length);

  document.getElementById('mapTitle').innerHTML = `${icon(themeData.icon)} <span>${themeData.name}</span>`;
  document.getElementById('mapTitle').style.color = themeData.color;
  const mapProgress = document.getElementById('mapProgress');
  if (mapProgress) {
    mapProgress.innerHTML =
      `<span>${themeProgressData.completedMaps}/${themeProgressData.totalMaps} cleared</span>` +
      `<span><b>★ ${themeProgressData.stars}</b>/${themeProgressData.maxStars}</span>`;
  }

  const grid = document.getElementById('mapGrid');
  grid.innerHTML = '';

  mapsWithProgress.forEach((m, i) => {
    const card = document.createElement('div');
    const isLocked = !m.unlocked;

    card.className = 'map-card' + (isLocked ? ' locked' : '') + (m.completed ? ' completed' : '');
    card.style.setProperty('--c', themeData.color);

    // Difficulty is five pips; the stars are what the player has earned (of 3).
    const diffPips = [1, 2, 3, 4, 5].map(n => `<i class="${n <= m.diff ? 'on' : ''}"></i>`).join('');
    const layoutName = readable(m.metadata?.layoutType || m.layout);
    const bestScore = m.bestScore > 0
      ? `<span class="map-best-score">Best ${m.bestScore.toLocaleString()}</span>`
      : '';
    const blurb = isLocked
      ? 'Clear the arena before this one to unlock it.'
      : (m.description || readable(m.metadata?.pressureType));

    card.innerHTML = `
      <div class="map-card-num">${isLocked ? icon('lock') : String(i + 1).padStart(2, '0')}</div>
      <div class="map-card-main">
        <div class="map-card-name">${m.name}</div>
        <div class="map-card-info">
          <span>${m.waves} waves</span>
          <span class="map-diff" title="Difficulty ${m.diff} of 5">${diffPips}</span>
          ${layoutName ? `<span>${layoutName}</span>` : ''}
          ${bestScore}
        </div>
        ${blurb ? `<div class="map-card-desc">${blurb}</div>` : ''}
      </div>
      <div class="map-stars${m.stars > 0 ? ' earned' : ''}" title="${m.stars} of 3 stars">${getStarDisplay(m.stars || 0, 3)}</div>
      ${!isLocked ? `
        <div class="map-card-modes">
          <button type="button" data-mode="campaign">▶ Play</button>
          <button type="button" data-mode="endless">Endless</button>
          <button type="button" data-mode="sandbox">Sandbox</button>
        </div>
      ` : ''}
    `;

    if (!isLocked) {
      card.onclick = () => startGame(i, 'campaign');
      card.querySelectorAll('[data-mode]').forEach(btn => {
        btn.onclick = (event) => {
          event.stopPropagation();
          startGame(i, btn.dataset.mode);
        };
      });
    } else {
      card.onclick = () => {
        // Show locked message
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 300);
      };
    }

    grid.appendChild(card);
  });

  showScreenAnimated('mapScreen');
}

const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

/**
 * Take down everything a finished match leaves over the board: the win/lose
 * card, the blur behind it (which also blocks taps), and a tower's upgrade
 * sheet. Without this the next match after a result stayed blurred and dead.
 */
function clearMatchOverlays() {
  document.getElementById('gameScreen')?.classList.remove('screen-blur');
  for (const id of ['winModal', 'loseModal']) {
    document.getElementById(id)?.classList.remove('show', 'modal-slide-up');
  }
  try { hideUpgrade(); } catch { /* sheet not built yet */ }
}

export function startGame(idx, mode = 'campaign') {
  const state = getState();
  const { themeData } = state;
  const baseMapData = themeData.maps[idx];
  const mapData = {
    ...baseMapData,
    waves: mode === 'endless' ? Math.max(baseMapData.waves, 120) : baseMapData.waves,
    money: mode === 'sandbox' ? Math.floor(baseMapData.money * (themeData.balance?.sandbox?.startingMoneyMultiplier || 3)) : baseMapData.money,
    lives: mode === 'sandbox' ? Math.floor(baseMapData.lives * (themeData.balance?.sandbox?.livesMultiplier || 3)) : baseMapData.lives
  };

  clearMatchOverlays();

  // Cover the screen with the arena card first; building the scene below
  // blocks the main thread for a moment.
  const loader = showArenaLoader({ themeData, mapData, mapIndex: idx, mode });
  loader.step('Laying out the arena', 18);

  // Set map data
  setMapData(mapData, idx);
  setMapDimensions(mapData.cols, mapData.rows);
  // Permanent upgrades bought with stars (systems/perks.js). The per-match
  // multipliers ride on the state so the systems need no import of perks.js.
  const bonus = matchBonuses();
  setMoney(mapData.money + bonus.cash);
  setLives(mapData.lives + bonus.lives);
  {
    const st = getState();
    st.perkDamage = bonus.perkDamage;
    st.perkBounty = bonus.perkBounty;
    st.perkCooldown = bonus.perkCooldown;
    st.sellRate = bonus.sellRate;
  }
  setWave(0);
  setScore(0);
  setKills(0);
  setGameMode(mode);
  clearTargetingFeedback();

  // Reset all systems
  resetGameState();
  clearPathCache();
  clearSpawnQueue();
  resetGameTime();
  setAutoWave(true);

  // Reset speed to 1x. Auto-wave state is shown by the pause sheet, which reads
  // it fresh each time it opens, so there is no button to reset here.
  resetGameSpeed();

  // Generate map and waves
  generateMap();
  setWaves(generateWaves(mapData.waves, themeData, { mode }));
  loader.step('Scouting the waves', 34);

  showScreenAnimated('gameScreen');

  // Wait for layout before initializing 3D. Each step yields a frame so the
  // loader's caption and bar actually paint between the heavy pieces.
  (async function build() {
    try {
      for (;;) {
        const wrap = document.querySelector('.canvas-wrap');
        const r = wrap ? wrap.getBoundingClientRect() : { width: 0, height: 0 };
        if (r.width >= 20 && r.height >= 20) break;
        await nextFrame();
      }

      loader.step(`Building the ${themeData.environmentSkin?.arena || 'arena'}`, 52);
      await nextFrame();
      await nextFrame();

      // Initialize 3D scene
      init3D();
      onResize();

      // Initialize camera
      initCameraState();

      loader.step('Filling the stands', 80);
      await nextFrame();

      // Compile every enemy, tower and shot shader now, under the loader,
      // rather than freezing the game the first time each one appears.
      loader.step('Warming up', 90);
      await nextFrame();
      warmUpShaders();

      // Initialize UI
      initHUD();
      renderTowers();
      updateHUD();
      initAbilityBar();

      // Start game loop
      startGameLoop();

      // Emit game start event
      emit(GameEvents.GAME_START, {
        theme: state.theme,
        map: mapData.name,
        waves: mapData.waves,
        mode
      });

      // Let the first frames render under the cover, then reveal.
      await nextFrame();
      await nextFrame();
    } finally {
      loader.done();
    }
  })();
}

export function exitGame() {
  const state = getState();
  const theme = state.theme;

  // Perform full cleanup
  hideArenaLoader();
  hideAbilityBar();
  performFullCleanup();
  clearTargetingFeedback();

  clearMatchOverlays();

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
  const mode = state.gameMode || 'campaign';

  clearMatchOverlays();

  // Stop current game
  stopGameLoop();
  setSpeedEffect(1);
  clearTargetingFeedback();
  resetInputState();
  hideArenaLoader();

  // Cleanup
  if (state.autoWaveTimer) {
    clearTimeout(state.autoWaveTimer);
  }

  cleanupScene();

  // Restart the same map in the same mode. Without gameMode, this defaulted to
  // 'campaign' and quietly turned an Endless or Sandbox run into a Campaign one.
  setTimeout(() => {
    startGame(mapIdx, mode);
  }, 100);
}

// window.showScreen, showScreenWithAnimation, selectTheme, exitGame, replayGame exposed in main.js

document.addEventListener('DOMContentLoaded', renderThemeCards);
