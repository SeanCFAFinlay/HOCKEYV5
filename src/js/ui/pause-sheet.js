/**
 * Pause / overflow menu.
 *
 * The phone HUD can only justify four things: pause, wave, money, lives.
 * Everything else a player wants occasionally rather than constantly lives
 * here — the secondary stats, auto-wave, settings, restart and exit.
 *
 * Exports: initPauseSheet(), togglePauseMenu(), closePauseMenu(), isPauseMenuOpen()
 */

import { getState } from '../engine/state.js';
import { setPaused, isPaused } from '../engine/loop.js';
import { toggleAutoWave } from '../systems/waves.js';

let overlayEl = null;
let lastFocused = null;

function $(id) {
  return document.getElementById(id);
}

/** Mirror current game state into the sheet. Called every time it opens. */
function syncPauseSheet() {
  const state = getState();

  const wave = $('pauseWave');
  if (wave) {
    const total = state.mapData?.waves ?? 0;
    wave.textContent = state.gameMode === 'endless'
      ? `Wave ${state.wave} · Endless`
      : `Wave ${state.wave}/${total}`;
  }

  const kills = $('pauseKills');
  if (kills) kills.textContent = String(state.kills ?? 0);

  const score = $('pauseScore');
  if (score) score.textContent = (state.score ?? 0).toLocaleString();

  const enemies = $('pauseEnemies');
  if (enemies) enemies.textContent = String(state.enemies?.length ?? 0);

  syncAutoSwitch();
}

function syncAutoSwitch() {
  const btn = $('pauseAutoBtn');
  if (!btn) return;
  const on = !!getState().autoWave;
  // role="switch" carries the state for assistive tech; the class drives paint.
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  btn.classList.toggle('on', on);
}

export function isPauseMenuOpen() {
  return !!overlayEl && !overlayEl.hidden;
}

export function openPauseMenu() {
  if (!overlayEl || isPauseMenuOpen()) return;
  lastFocused = document.activeElement;
  setPaused(true);
  syncPauseSheet();
  overlayEl.hidden = false;
  $('pauseResumeBtn')?.focus();
}

export function closePauseMenu() {
  if (!overlayEl || !isPauseMenuOpen()) return;
  overlayEl.hidden = true;
  setPaused(false);
  // Return focus to whatever opened the sheet, rather than dumping the
  // keyboard user back at the top of the document.
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  lastFocused = null;
}

export function togglePauseMenu() {
  if (isPauseMenuOpen()) closePauseMenu();
  else openPauseMenu();
}

/**
 * Wire the sheet up. Safe to call more than once.
 * @param {{onRestart: Function, onExit: Function}} handlers
 */
export function initPauseSheet({ onRestart, onExit } = {}) {
  overlayEl = $('pauseOverlay');
  if (!overlayEl) return;

  $('pauseResumeBtn')?.addEventListener('click', closePauseMenu);

  $('pauseAutoBtn')?.addEventListener('click', () => {
    toggleAutoWave();
    syncAutoSwitch();
  });

  $('pauseRestartBtn')?.addEventListener('click', () => {
    // Unpause first: restarting from a paused menu would otherwise hand the new
    // game a frozen loop.
    closePauseMenu();
    onRestart?.();
  });

  $('pauseExitBtn')?.addEventListener('click', () => {
    closePauseMenu();
    onExit?.();
  });

  // Tapping the backdrop resumes; tapping the sheet itself must not.
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closePauseMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPauseMenuOpen()) {
      e.preventDefault();
      // stopImmediatePropagation: input.js also listens for Escape to deselect
      // a tower, and closing the menu should not also clear the selection.
      e.stopImmediatePropagation();
      closePauseMenu();
    }
  }, true);

  // Keep the sheet honest if something else pauses the game.
  if (isPaused() && overlayEl.hidden) setPaused(false);
}
