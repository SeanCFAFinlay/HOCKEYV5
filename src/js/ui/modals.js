// Modal dialog management

import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { selectTheme, startGame } from './screens.js';
import { recordRun, getBestScore } from '../utils/persistence.js';

/**
 * Initialize modal event listeners.
 * Modals react to game events — no direct calls needed from other modules.
 */
export function initModals() {
  on(GameEvents.GAME_WIN, ({ score, wave }) => {
    _showWinModal(score, wave);
  });

  on(GameEvents.GAME_LOSE, ({ wave, score }) => {
    _showLoseModal(wave, score);
  });
}

export function closeModal(type) {
  document.getElementById(type + 'Modal').classList.remove('show');
  const state = getState();
  selectTheme(state.theme);
}

/**
 * Replay the same map without returning to the menu.
 */
export function replayGame() {
  const state = getState();

  document.getElementById('winModal')?.classList.remove('show');
  document.getElementById('loseModal')?.classList.remove('show');

  startGame(state.mapIndex);
}

function _showWinModal(score, waves) {
  const state = getState();
  const { theme, mapIndex } = state;

  recordRun(theme, mapIndex, score, waves);
  const best = getBestScore(theme, mapIndex);

  const el = (id) => document.getElementById(id);
  if (el('winScore'))  el('winScore').textContent  = score;
  if (el('winWaves'))  el('winWaves').textContent  = waves;
  if (el('winBest'))   el('winBest').textContent   = best > 0 ? best : '—';
  el('winModal')?.classList.add('show');
}

function _showLoseModal(wave, score) {
  const state = getState();
  const { theme, mapIndex } = state;

  recordRun(theme, mapIndex, score, wave);
  const best = getBestScore(theme, mapIndex);

  const el = (id) => document.getElementById(id);
  if (el('loseWave'))  el('loseWave').textContent  = wave;
  if (el('loseScore')) el('loseScore').textContent = score;
  if (el('loseBest'))  el('loseBest').textContent  = best > 0 ? best : '—';
  el('loseModal')?.classList.add('show');
}

// Expose to window for HTML onclick handlers
window.closeModal = closeModal;
window.replayGame = replayGame;
