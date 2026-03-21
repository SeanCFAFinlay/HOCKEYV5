// HUD updates and tower bar rendering

import { getState, setSelectedTower, setSellMode, subscribeToState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { hideUpgrade } from './upgrade-sheet.js';

// DOM element cache
let domCache = null;

// Initialization flag
let initialized = false;

/**
 * Cache DOM elements
 */
function cacheDOMElements() {
  domCache = {
    moneyVal: document.getElementById('moneyVal'),
    waveNum: document.getElementById('waveNum'),
    waveMax: document.getElementById('waveMax'),
    livesVal: document.getElementById('livesVal'),
    scoreVal: document.getElementById('scoreVal'),
    startBtn: document.getElementById('startBtn'),
    towerBar: document.getElementById('towerBar'),
    loseModal: document.getElementById('loseModal'),
    loseWave: document.getElementById('loseWave'),
    loseScore: document.getElementById('loseScore'),
    sellBtn: document.getElementById('sellBtn')
  };
}

/**
 * Initialize HUD system
 */
export function initHUD() {
  if (initialized) return;

  cacheDOMElements();

  // Subscribe to state changes
  subscribeToState('money', (newVal) => {
    if (domCache.moneyVal) domCache.moneyVal.textContent = newVal;
    renderTowers();
  });

  subscribeToState('lives', (newVal) => {
    if (domCache.livesVal) domCache.livesVal.textContent = newVal;
  });

  subscribeToState('score', (newVal) => {
    if (domCache.scoreVal) domCache.scoreVal.textContent = newVal;
  });

  // Subscribe to events
  on(GameEvents.WAVE_START, ({ wave }) => {
    if (domCache.waveNum) domCache.waveNum.textContent = wave;
    if (domCache.startBtn) domCache.startBtn.disabled = true;
  });

  on(GameEvents.WAVE_COMPLETE, () => {
    if (domCache.startBtn) domCache.startBtn.disabled = false;
  });

  on(GameEvents.GAME_LOSE, ({ wave, score }) => {
    if (domCache.loseWave) domCache.loseWave.textContent = wave;
    if (domCache.loseScore) domCache.loseScore.textContent = score;
    if (domCache.loseModal) domCache.loseModal.classList.add('show');
  });

  initialized = true;
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

  // Update wave button
  if (domCache.startBtn) domCache.startBtn.disabled = state.waveActive;

  // Check for game over
  if (state.lives <= 0 && state.running) {
    const loseModal = document.getElementById('loseModal');
    const loseWave = document.getElementById('loseWave');
    const loseScore = document.getElementById('loseScore');

    if (loseWave) loseWave.textContent = state.wave;
    if (loseScore) loseScore.textContent = state.score;
    if (loseModal) loseModal.classList.add('show');

    state.running = false;
    return;
  }

  renderTowers();
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

    btn.innerHTML = `
      <div class="tower-btn-icon">${t.icon}</div>
      <div class="tower-btn-name">${t.nm}</div>
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
 * Reset HUD for new game
 */
export function resetHUD() {
  if (!domCache) cacheDOMElements();

  updateHUD();

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
}
