// HUD updates and tower bar rendering

import { getState, setSelectedTower, subscribeToState, setRunning } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { hideUpgrade } from './upgrade-sheet.js';
import { resetGameSpeed } from './controls.js';
import { icon } from './icons.js';
import { createDefeatEffect } from '../systems/particles.js';
import { getWaveThemeName, getWavePreview } from '../config/waves.js';
import { initCurrencyFly } from './currency-fly.js';
import { initTooltips, attachTooltip, hideTooltip } from './tooltips.js';
import { setDangerVignette } from '../engine/postprocessing.js';

// DOM element cache
let domCache = null;

// Initialization flag
let initialized = false;

// Track previous money for animation direction
let prevMoneyValue = 0;

// Tower bar button cache: avoids recreating buttons on every render
let _towerBarButtons = [];
let _towerBarTheme = null;

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
    wavePreview: document.getElementById('wavePreview')
  };
}

/**
 * Initialize HUD system
 */
export function initHUD() {
  if (initialized) return;

  cacheDOMElements();
  prevMoneyValue = getState().money;

  // Initialize currency fly-to effect
  if (domCache.moneyStat) initCurrencyFly(domCache.moneyStat);

  // Initialize tooltips
  initTooltips();

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

      setDangerVignette(newVal <= threshold && newVal > 0);
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

    // Show wave announcement overlay
    const state = getState();
    const totalWaves = state.mapData?.waves || 20;
    const themeName = getWaveThemeName(wave, totalWaves);
    const isBoss = themeName === 'BOSS';
    showWaveAnnouncement(wave, themeName, isBoss);

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
    hideUpgrade();
    // Modal is handled by modals.js event listener
  });

  on(GameEvents.GAME_WIN, () => {
    if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';
    hideUpgrade();
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

  // Update wave button. Auto-wave now shows in the pause sheet, which syncs
  // itself each time it opens.
  if (domCache.startBtn) domCache.startBtn.disabled = state.waveActive;

  // Update lives warning
  if (domCache.livesStat && state.mapData) {
    const threshold = Math.ceil(state.mapData.lives * 0.25);
    if (state.lives <= threshold && state.lives > 0) {
      domCache.livesStat.classList.add('warning');
    } else {
      domCache.livesStat.classList.remove('warning');
    }
    setDangerVignette(state.lives <= threshold && state.lives > 0);
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
 * Get an enemy icon (SVG markup) based on theme and traits. The dominant trait
 * wins: boss > fire > flying > base type. Returns inline SVG, not emoji.
 */
function getEnemyIcon(enemy, theme) {
  const base = theme === 'hockey' ? 'stick' : 'ball';
  if (enemy.boss) return icon('crown');
  if (enemy.fire) return icon('flame');
  if (enemy.flying) return icon('wings');
  return icon(base);
}

/**
 * Render tower selection bar.
 * Creates buttons once per theme; subsequent calls only update classes.
 */
export function renderTowers() {
  const state = getState();
  const { themeData, money, selectedTower } = state;

  if (!domCache) cacheDOMElements();

  const bar = domCache.towerBar || document.getElementById('towerBar');
  if (!bar || !themeData) return;

  const needsRebuild = _towerBarTheme !== themeData;

  if (needsRebuild) {
    _buildTowerButtons(bar, themeData);
    _towerBarTheme = themeData;
  }

  // Fast path: just update classes
  themeData.towers.forEach((t, i) => {
    const btn = _towerBarButtons[i];
    if (!btn) return;

    const affordable = money >= t.cost;
    const selected = selectedTower === t.id;

    btn.className = 'tower-btn' +
      (affordable ? '' : ' disabled') +
      (selected ? ' selected' : '');
  });
}

/**
 * Build tower buttons once and store references.
 * @param {HTMLElement} bar - The tower bar container
 * @param {Object} themeData - Current theme data
 */
function _buildTowerButtons(bar, themeData) {
  bar.innerHTML = '';
  _towerBarButtons = [];

  const fragment = document.createDocumentFragment();

  themeData.towers.forEach(t => {
    const btn = document.createElement('div');
    const roleDisplay = ROLE_DISPLAY[t.role] || '';

    btn.className = 'tower-btn';
    btn.style.setProperty('--c', t.clr);
    btn.innerHTML = `
      <div class="tower-btn-icon">${icon(t.icon)}</div>
      <div class="tower-btn-name">${t.nm}</div>
      ${roleDisplay ? `<div class="tower-btn-role">${roleDisplay}</div>` : ''}
      <div class="tower-btn-cost">$${t.cost}</div>
    `;

    btn.onclick = () => {
      hideTooltip();
      const s = getState();
      const affordable = s.money >= t.cost;
      const selected = s.selectedTower === t.id;
      if (affordable) {
        setSelectedTower(selected ? null : t.id);
        hideUpgrade();
        renderTowers();
      }
    };

    attachTooltip(btn, t);
    _towerBarButtons.push(btn);
    fragment.appendChild(btn);
  });

  bar.appendChild(fragment);
}

/**
 * Compute difficulty rating 1–5 based on total enemy HP.
 * @param {Array} entries - Preview entries with {count, hp}
 * @param {number} averageHpPerWave - Baseline HP for rating 1
 * @returns {number} 1–5
 */
export function computeWaveDifficulty(entries, averageHpPerWave) {
  const totalHp = entries.reduce((sum, e) => sum + (e.hp || 0) * (e.count || 1), 0);
  const baseline = (averageHpPerWave || 600) * 1.5;
  return Math.min(5, Math.max(1, Math.ceil(totalHp / baseline)));
}

/**
 * Determine the primary wave type from entries for border styling.
 * @param {Array} entries
 * @returns {string} 'boss'|'air'|'fire'|'tank'|'swarm'|'mixed'
 */
export function getWaveTypeClass(entries) {
  if (entries.some(e => e.boss || (e.tags || []).includes('boss'))) return 'boss';
  const tagCounts = { air: 0, fire: 0, tank: 0, swarm: 0 };
  entries.forEach(e => {
    const tags = e.tags || [];
    if (tags.includes('air') || tags.includes('flying')) tagCounts.air += e.count || 1;
    if (tags.includes('fire')) tagCounts.fire += e.count || 1;
    if (tags.includes('armor') || tags.includes('tank')) tagCounts.tank += e.count || 1;
    if (tags.includes('swarm') || tags.includes('speed')) tagCounts.swarm += e.count || 1;
  });
  const max = Math.max(...Object.values(tagCounts));
  if (max === 0) return 'mixed';
  const dominant = Object.entries(tagCounts).find(([, v]) => v === max)[0];
  return dominant;
}

/**
 * Get speed indicator emoji for an enemy.
 * @param {string} speedClass
 * @returns {string}
 */
export function getSpeedIndicator(speedClass) {
  if (speedClass === 'slow') return 'turtle';
  if (speedClass === 'fast' || speedClass === 'very_fast') return 'bolt';
  return 'runner';
}

/**
 * Get special ability badges HTML for an enemy entry.
 * @param {Object} entry
 * @returns {string}
 */
function getAbilityBadges(entry) {
  const tags = new Set(entry.tags || []);
  const badges = [];
  if (entry.boss || tags.has('boss')) badges.push('crown');
  if (entry.flying || tags.has('air')) badges.push('wings');
  if (entry.armor || tags.has('armor')) badges.push('shield');
  if (entry.fire || tags.has('fire')) badges.push('flame');
  return badges.map(name => icon(name)).join('');
}

/**
 * Build and display the enhanced wave preview panel.
 * Exported for testability.
 */
export function buildEnhancedWavePreview() {
  const panel = document.getElementById('wavePreview');
  const headerEl = document.getElementById('wavePreviewHeader');
  const bodyEl = document.getElementById('wavePreviewBody');

  if (!panel) return;

  const state = getState();
  const { wave, WAVES, themeData, waveActive } = state;

  // Hide if wave is active or no more waves
  if (waveActive || !WAVES || wave >= WAVES.length) {
    panel.style.display = 'none';
    return;
  }

  const nextWaveData = WAVES[wave];
  if (!nextWaveData) {
    panel.style.display = 'none';
    return;
  }

  const preview = getWavePreview(nextWaveData, themeData.enemies);
  if (!preview.entries.length) {
    panel.style.display = 'none';
    return;
  }

  // Enrich entries with HP data from themeData.enemies
  const byId = new Map((themeData.enemies || []).map(e => [e.id, e]));
  const richEntries = preview.entries.map(entry => {
    const enemyDef = byId.get(entry.id);
    return { ...entry, hp: enemyDef?.hp || 0, speedClass: enemyDef?.speedClass || 'normal' };
  });

  // Calculate average HP across all enemies in all waves (rough baseline)
  const averageHpPerWave = computeAverageHpBaseline(WAVES, themeData.enemies);
  const difficulty = computeWaveDifficulty(richEntries, averageHpPerWave);
  const waveType = getWaveTypeClass(richEntries);
  const maxHp = Math.max(...richEntries.map(e => e.hp), 1);

  // Update border type class
  ['boss', 'air', 'fire', 'tank', 'swarm', 'mixed'].forEach(t => panel.classList.remove(`wp-type-${t}`));
  panel.classList.add(`wp-type-${waveType}`);

  // Render header
  if (headerEl) {
    const skulls = icon('skull').repeat(difficulty);
    headerEl.innerHTML = `<span class="wp-label">NEXT WAVE</span><span class="wp-skulls">${skulls}</span>`;
  }

  // Render enemy rows
  if (bodyEl) {
    bodyEl.innerHTML = richEntries.map(entry => buildEnemyRow(entry, maxHp)).join('');
  }

  panel.style.display = 'flex';
}

function computeAverageHpBaseline(WAVES, enemies) {
  if (!WAVES || !WAVES.length) return 600;
  const byId = new Map((enemies || []).map(e => [e.id, e]));
  const sample = WAVES.slice(0, Math.min(5, WAVES.length));
  const totals = sample.map(waveData => {
    return Object.entries(waveData).reduce((sum, [id, count]) => {
      return sum + ((byId.get(id)?.hp || 0) * count);
    }, 0);
  });
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  return avg || 600;
}

function buildEnemyRow(entry, maxHp) {
  const speed = icon(getSpeedIndicator(entry.speedClass));
  const badges = getAbilityBadges(entry);
  const hpPct = Math.max(8, Math.round((entry.hp / maxHp) * 100));
  return `<div class="wp-enemy-row">
    <span class="wp-enemy-name">${entry.name}</span>
    <span class="wp-enemy-count">×${entry.count}</span>
    <span class="wp-speed">${speed}</span>
    <span class="wp-badges">${badges}</span>
    <div class="wp-hp-bar-wrap"><div class="wp-hp-bar" style="width:${hpPct}%"></div></div>
  </div>`;
}

/**
 * Show a compact preview of the next wave's enemy composition.
 * Displayed between waves so players can plan.
 */
function showWavePreview() {
  buildEnhancedWavePreview();
}

// Wave announcement container (created once, reused)
let announceContainer = null;
let announceClearTimer = null;

/**
 * Show a dramatic wave announcement overlay.
 * @param {number} waveNumber - Current wave number
 * @param {string} themeName  - Wave theme label (e.g. "Swarm", "Heavy")
 * @param {boolean} isBoss    - Whether this is a boss wave
 */
export function showWaveAnnouncement(waveNumber, themeName, isBoss) {
  const container = getOrCreateAnnounceContainer();
  resetAnnounceState(container);
  populateAnnounceContent(container, waveNumber, themeName, isBoss);
  triggerAnnounceAnimation(container, isBoss);
}

function getOrCreateAnnounceContainer() {
  if (announceContainer) return announceContainer;

  const el = document.createElement('div');
  el.classList.add('wave-announce');

  const numEl = document.createElement('div');
  numEl.classList.add('wave-announce-number');

  const themeEl = document.createElement('div');
  themeEl.classList.add('wave-announce-theme');

  el.appendChild(numEl);
  el.appendChild(themeEl);

  const gameScreen = document.getElementById('gameScreen') || document.body;
  gameScreen.appendChild(el);

  announceContainer = el;
  return el;
}

function resetAnnounceState(container) {
  container.classList.remove('active', 'boss');

  if (announceClearTimer) {
    clearTimeout(announceClearTimer);
    announceClearTimer = null;
  }
}

function populateAnnounceContent(container, waveNumber, themeName, isBoss) {
  const numEl = container.querySelector('.wave-announce-number');
  const themeEl = container.querySelector('.wave-announce-theme');

  if (numEl) {
    numEl.textContent = isBoss ? `WARNING  WAVE ${waveNumber}` : `WAVE ${waveNumber}`;
  }

  if (themeEl) {
    themeEl.textContent = themeName;
    themeEl.className = 'wave-announce-theme';
    const themeClass = resolveThemeClass(themeName);
    if (themeClass) themeEl.classList.add(themeClass);
  }
}

function resolveThemeClass(themeName) {
  const themeClassMap = {
    'Swarm': 'swarm',
    'Heavy': 'heavy',
    'Air Raid': 'air-raid',
    'Inferno': 'inferno',
    'BOSS': 'boss',
    'Breather': 'breather',
    'Mixed': 'mixed'
  };
  return themeClassMap[themeName] || themeName.toLowerCase().replace(/\s+/g, '-');
}

function triggerAnnounceAnimation(container, isBoss) {
  if (isBoss) {
    container.classList.add('boss');
    triggerBossVignette();
  }

  container.classList.add('active');

  announceClearTimer = setTimeout(() => {
    container.classList.remove('active');
    announceClearTimer = null;
  }, 2500);
}

function triggerBossVignette() {
  const gameScreen = document.getElementById('gameScreen');
  if (!gameScreen) return;

  gameScreen.classList.add('boss-vignette');
  setTimeout(() => gameScreen.classList.remove('boss-vignette'), 1800);
}

/**
 * Reset HUD for new game
 */
export function resetHUD() {
  if (!domCache) cacheDOMElements();

  // Clear tower button cache so buttons are rebuilt for new theme
  _towerBarButtons = [];
  _towerBarTheme = null;

  // Reset previous money tracking
  prevMoneyValue = getState().money;

  updateHUD();

  // Hide wave preview on reset
  if (domCache.wavePreview) domCache.wavePreview.style.display = 'none';

  // Reset speed back to 1x
  resetGameSpeed();

  // Reset wave theme
  if (domCache.waveTheme) {
    domCache.waveTheme.textContent = '';
    domCache.waveTheme.className = 'hud-wave-theme';
  }

  // Reset lives warning
  if (domCache.livesStat) {
    domCache.livesStat.classList.remove('warning');
  }
  setDangerVignette(false);

  // Reset money animations
  if (domCache.moneyStat) {
    domCache.moneyStat.classList.remove('pulse-gain', 'pulse-spend');
  }

  // Reset enemy counter
  if (domCache.enemyCounter) {
    domCache.enemyCounter.classList.remove('active');
  }
}
