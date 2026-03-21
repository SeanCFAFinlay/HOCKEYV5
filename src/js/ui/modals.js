// Modal dialog management

import { getState } from '../engine/state.js';
import { selectTheme } from './screens.js';

export function closeModal(type) {
  document.getElementById(type + 'Modal').classList.remove('show');
  const state = getState();
  selectTheme(state.theme);
}

// Expose to window for HTML onclick handlers
window.closeModal = closeModal;
