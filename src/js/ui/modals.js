// Modal dialog management

import { getState } from '../engine/state.js';
import { selectTheme } from './screens.js';
import { saveHighScore, getHighScore } from '../systems/highscores.js';

export function closeModal(type) {
  const state = getState();
  
  // Save high score if applicable
  if (type === 'win' || type === 'lose') {
    const { theme, mapIndex, wave, score, mapData } = state;
    if (theme && mapIndex != null && mapData) {
      saveHighScore(theme, mapIndex, wave, score, mapData.name);
    }
  }
  
  document.getElementById(type + 'Modal').classList.remove('show');
  selectTheme(state.theme);
}

/**
 * Show modal with high score comparison
 */
export function showGameOverModal(type) {
  const state = getState();
  const { theme, mapIndex, wave, score, mapData } = state;
  
  const modal = document.getElementById(type + 'Modal');
  const waveEl = document.getElementById(type + (type === 'win' ? 'Waves' : 'Wave'));
  const scoreEl = document.getElementById(type + 'Score');
  
  if (waveEl) waveEl.textContent = wave;
  if (scoreEl) scoreEl.textContent = score;
  
  // Check for high score
  const highScore = getHighScore(theme, mapIndex);
  let highScoreMsg = '';
  
  if (highScore) {
    if (wave > highScore.wave || (wave === highScore.wave && score > highScore.score)) {
      highScoreMsg = '<div style="color: #ffd700; font-size: 0.9rem; margin-top: 10px;">🏆 NEW HIGH SCORE!</div>';
    } else {
      highScoreMsg = `<div style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 8px;">Best: Wave ${highScore.wave} • ${highScore.score} pts</div>`;
    }
  } else {
    highScoreMsg = '<div style="color: #ffd700; font-size: 0.9rem; margin-top: 10px;">🏆 FIRST SCORE!</div>';
  }
  
  // Add high score message to modal stats
  const modalStats = modal.querySelector('.modal-stats');
  if (modalStats && !modalStats.querySelector('.highscore-msg')) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'highscore-msg';
    msgDiv.innerHTML = highScoreMsg;
    msgDiv.style.gridColumn = '1 / -1';
    modalStats.appendChild(msgDiv);
  }
  
  modal.classList.add('show');
}

// Expose to window for HTML onclick handlers
window.closeModal = closeModal;
