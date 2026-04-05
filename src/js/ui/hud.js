// HUD updates and tower bar rendering

import { getState, setSelectedTower, setSellMode, subscribeToState, setRunning } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { hideUpgrade } from './upgrade-sheet.js';
import { createDefeatEffect } from '../systems/particles.js';
import { getWaveThemeName } from '../config/waves.js';

// DOM element cache
let domCache = null;

// Initialization flag
let initialized = false;

// Track previous money for animation direction
let prevMoneyValue = 0;

// Tower role display names
const ROLE_DISPLAY = {
  'ANTI-SWARM': 'Fast',
  'SNIPER': 'Sniper',
  'SPLASH': 'AOE',
  'CROWD_CONTROL': 'Slow',
  'CHOKEPOINT': 'Guard',
  'CHAIN': 'Chain',
  'DOT': 'Burn',
  'BOSS_KILLER': 'Boss'
};

/**
 * Cache DOM elements
 */
function cacheDOMElements() {
  domCache = {
    moneyVal: document.getElementById('moneyVal'),
    moneyStat: document.getElementById('moneyStat'),
    waveNum: document.getElementById('waveNum'),
    waveMax: document.getElementById('waveMax'),
    waveTheme: document.getElementById('waveTheme'),
    livesVal: document.getElementById('livesVal'),
    livesStat: document.getElementById('livesStat'),
    scoreVal: document.getElementById('scoreVal'),
    killsVal: document.getElementById('killsVal'),
    enemyCount: document.getElementById('enemyCount'),
    enemyCounter: document.getElementById('enemyCounter'),
    startBtn: document.getElementById('startBtn'),
    towerBar: document.getElementById('towerBar'),
    sellBtn: document.getElementById('sellBtn'),
    wavePreview: document.getElementById('wavePreview'),
    wavePreviewContent: document.getElementById('wavePreviewContent')
  };
}

/**
 * Initialize HUD system
 */
export function initHUD() {
  if (initialized) return;

  cacheDOMElements();
  prevMoneyValue = getState().money;

  // Subscribe to state changes
  subscribeToState('money', (newVal, oldVal) => {
    if (domCache.moneyVal) domCache.moneyVal.textContent = newVal;

    // Trigger money animation
    if (domCache.moneyStat && oldVal !== undefined) {
      const delta = newVal - oldVal;
      domCache.moneyStat.classList.remove('pulse-gain', 'pulse-spend');

      // Force reflow to restart animation
      void domCache.moneyStat.offsetWidth;

      if (delta > 0) {
        domCache.moneyStat.classList.add('pulse-gain');
      } else if (delta < 0) {
        domCache.moneyStat.classList.add('pulse-spend');
      }
    }

    renderTowers();
  });

  subscribeToState('lives', (newVal) => {
    if (domCache.livesVal) domCache.livesVal.textContent = newVal;

    // Low lives warning
    if (domCache.livesStat) {
      const state = getState();
      const maxLives = state.mapData?.lives || 20;
      const threshold = Math.ceil(maxLives * 0.25);

      if (newVal <= threshold && newVal > 0) {
        domCache.livesStat.classList.add('warning');
      } else {
        domCache.livesStat.classList.remove('warning');
      }
    }
  });

  subscribeToState('score', (newVal) => {
    if (domCache.scoreVal) domCache.scoreVal.textContent = newVal;
  });

  subscribeToState('kills', (newVal) => {
    if (domCache.killsVal) domCache.killsVal.textContent = newVal;
  });

  // Subscribe to events
  on(GameEvents.WAVE_START, ({ wave }) => {
    if (domCache.waveNum) domCache.waveNum.textContent = wave;
    if (domCache.startBtn) domCache.startBtn.disabled = true;

    // Hide wave preview while wave is active
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';

    // Update wave theme
    updateWaveTheme(wave);

    // Activate enemy counter
    if (domCache.enemyCounter) {
      domCache.enemyCounter.classList.add('active');
    }
  });

  on(GameEvents.WAVE_COMPLETE, () => {
    if (domCache.startBtn) domCache.startBtn.disabled = false;

    // Show preview of upcoming wave
    showWavePreview();

    // Clear wave theme after wave
    if (domCache.waveTheme) {
      domCache.waveTheme.textContent = '';
      domCache.waveTheme.className = 'hud-wave-theme';
    }

    // Deactivate enemy counter
    if (domCache.enemyCounter) {
      domCache.enemyCounter.classList.remove('active');
    }
  });

  on(GameEvents.GAME_LOSE, () => {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    // Modal is handled by modals.js event listener
  });

  on(GameEvents.GAME_WIN, () => {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    // Modal is handled by modals.js event listener
  });

  initialized = true;
}

/**
 * Update wave theme display
 */
function updateWaveTheme(wave) {
  if (!domCache.waveTheme) return;

  const state = getState();
  const totalWaves = state.mapData?.waves || 20;
  const themeName = getWaveThemeName(wave, totalWaves);

  domCache.waveTheme.textContent = themeName;
  domCache.waveTheme.className = 'hud-wave-theme';

  // Add theme-specific class for coloring
  const themeClass = themeName.toLowerCase().replace(' ', '-');
  if (themeClass === 'air-raid') {
    domCache.waveTheme.classList.add('air');
  } else if (themeClass === 'inferno') {
    domCache.waveTheme.classList.add('fire');
  } else {
    domCache.waveTheme.classList.add(themeClass);
  }
}

/**
 * Update all HUD elements (full refresh)
 */
export function updateHUD() {
  const state = getState();

  // Ensure cache exists
  if (!domCache) cacheDOMElements();

  // Update money
  if (domCache.moneyVal) domCache.moneyVal.textContent = state.money;

  // Update wave counter
  if (domCache.waveNum) domCache.waveNum.textContent = state.wave;
  if (domCache.waveMax && state.mapData) domCache.waveMax.textContent = state.mapData.waves;

  // Update lives
  if (domCache.livesVal) domCache.livesVal.textContent = state.lives;

  // Update score
  if (domCache.scoreVal) domCache.scoreVal.textContent = state.score;

  // Update kills
  if (domCache.killsVal) domCache.killsVal.textContent = state.kills;

  // Update enemy count
  if (domCache.enemyCount) {
    const remaining = state.enemies.length + state.spawnsPending;
    domCache.enemyCount.textContent = remaining;
  }

  // Update wave button
  if (domCache.startBtn) domCache.startBtn.disabled = state.waveActive;

  // Update lives warning
  if (domCache.livesStat && state.mapData) {
    const threshold = Math.ceil(state.mapData.lives * 0.25);
    if (state.lives <= threshold && state.lives > 0) {
      domCache.livesStat.classList.add('warning');
    } else {
      domCache.livesStat.classList.remove('warning');
    }
  }

  // Update enemy counter active state
  if (domCache.enemyCounter) {
    if (state.waveActive) {
      domCache.enemyCounter.classList.add('active');
    } else {
      domCache.enemyCounter.classList.remove('active');
    }
  }

  // Check for game over (handled by loop.js and modals.js)
  if (state.lives <= 0 && state.running) {
    // Defeat visual effect
    createDefeatEffect();
    // Modal display handled by modals.js event listener
  }

  renderTowers();
}

/**
 * Update wave preview panel
 */
function updateWavePreview() {
  const state = getState();
  const previewPanel = document.getElementById('wavePreview');
  const previewEnemies = document.getElementById('wavePreviewEnemies');

  if (!previewPanel || !previewEnemies) return;

  // Show preview only when wave is not active and there are more waves
  if (!state.waveActive && state.wave < state.mapData.waves && state.WAVES) {
    const nextWave = state.WAVES[state.wave];
    
    if (nextWave && Object.keys(nextWave).length > 0) {
      previewEnemies.innerHTML = '';

      Object.entries(nextWave).forEach(([enemyId, count]) => {
        const enemy = state.themeData.enemies.find(e => e.id === enemyId);
        if (enemy && count > 0) {
          const enemyDiv = document.createElement('div');
          enemyDiv.className = 'wave-preview-enemy';
          enemyDiv.innerHTML = `
            <span class="wave-preview-enemy-count">${count}×</span>
            <span class="wave-preview-enemy-icon" title="${enemy.nm}">${getEnemyIcon(enemy, state.theme)}</span>
          `;
          previewEnemies.appendChild(enemyDiv);
        }
      });

      previewPanel.style.display = 'block';
    } else {
      previewPanel.style.display = 'none';
    }
  } else {
    previewPanel.style.display = 'none';
  }
}

/**
 * Get enemy icon/emoji based on theme
 */
function getEnemyIcon(enemy, theme) {
  // Simple mapping - could be enhanced
  if (theme === 'hockey') {
    if (enemy.boss) return '🏒💀';
    if (enemy.fire && enemy.flying) return '🔥🏒';
    if (enemy.fire) return '🔥';
    if (enemy.flying) return '🏒✈️';
    return '🏒';
  } else {
    if (enemy.boss) return '⚽💀';
    if (enemy.fire && enemy.flying) return '🔥⚽';
    if (enemy.fire) return '🔥';
    if (enemy.flying) return '⚽✈️';
    return '⚽';
  }
}

/**
 * Render tower selection bar
 */
export function renderTowers() {
  const state = getState();
  const { themeData, money, selectedTower } = state;

  if (!domCache) cacheDOMElements();

  const bar = domCache.towerBar || document.getElementById('towerBar');
  if (!bar || !themeData) return;

  // Use document fragment for batch DOM updates
  const fragment = document.createDocumentFragment();

  themeData.towers.forEach(t => {
    const btn = document.createElement('div');
    const affordable = money >= t.cost;
    const selected = selectedTower === t.id;

    btn.className = 'tower-btn' +
      (affordable ? '' : ' disabled') +
      (selected ? ' selected' : '');

    btn.style.setProperty('--c', t.clr);

    // Get role display name
    const roleDisplay = ROLE_DISPLAY[t.role] || '';

    btn.innerHTML = `
      <div class="tower-btn-icon">${t.icon}</div>
      <div class="tower-btn-name">${t.nm}</div>
      ${roleDisplay ? `<div class="tower-btn-role">${roleDisplay}</div>` : ''}
      <div class="tower-btn-cost">$${t.cost}</div>
    `;

    btn.onclick = () => {
      if (affordable) {
        setSelectedTower(selected ? null : t.id);
        setSellMode(false);
        const sellBtn = document.getElementById('sellBtn');
        if (sellBtn) sellBtn.classList.remove('active');
        hideUpgrade();
        renderTowers();
      }
    };

    fragment.appendChild(btn);
  });

  // Clear and append all at once
  bar.innerHTML = '';
  bar.appendChild(fragment);
}

/**
 * Show a compact preview of the next wave's enemy composition.
 * Displayed between waves so players can plan.
 */
function showWavePreview() {
  if (!domCache) cacheDOMElements();

  const state = getState();
  const { wave, WAVES, themeData } = state;

  // Don't show if no upcoming wave
  if (!WAVES || wave >= WAVES.length) {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    return;
  }

  // state.wave is the last completed wave (1-based after increment).
  // WAVES is a 0-indexed array, so WAVES[state.wave] is the *next* wave's data.
  const nextWaveData = WAVES[wave];
  if (!nextWaveData) {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    return;
  }

  const parts = [];
  Object.entries(nextWaveData).forEach(([id, count]) => {
    const ed = themeData.enemies.find(e => e.id === id);
    if (ed && count > 0) {
      // Build a compact label: count × name, with icon cues for flags
      const flags = (ed.boss ? '👑' : '') + (ed.flying ? '✈' : '') + (ed.fire ? '🔥' : '') + (ed.armor ? '🛡' : '');
      parts.push(`${count}×${ed.nm}${flags ? ' ' + flags : ''}`);
    }
  });

  if (parts.length === 0) {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    return;
  }

  if (domCache.wavePreviewContent) domCache.wavePreviewContent.textContent = parts.join('  ·  ');
  if (domCache.wavePreview) domCache.wavePreview.style.display = 'flex';
}

/**
 * Reset HUD for new game
 */
export function resetHUD() {
  if (!domCache) cacheDOMElements();

  // Reset previous money tracking
  prevMoneyValue = getState().money;

  updateHUD();

  // Hide wave preview on reset
  if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';

  // Reset sell button
  if (domCache.sellBtn) domCache.sellBtn.classList.remove('active');

  // Reset auto button
  const autoBtn = document.getElementById('autoBtn');
  if (autoBtn) {
    autoBtn.textContent = 'AUTO: OFF';
    autoBtn.classList.remove('on');
  }

  // Reset speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', +btn.dataset.speed === 1);
  });

  // Reset wave theme
  if (domCache.waveTheme) {
    domCache.waveTheme.textContent = '';
    domCache.waveTheme.className = 'hud-wave-theme';
  }

  // Reset lives warning
  if (domCache.livesStat) {
    domCache.livesStat.classList.remove('warning');
  }

  // Reset money animations
  if (domCache.moneyStat) {
    domCache.moneyStat.classList.remove('pulse-gain', 'pulse-spend');
  }

  // Reset enemy counter
  if (domCache.enemyCounter) {
    domCache.enemyCounter.classList.remove('active');
  }
}
