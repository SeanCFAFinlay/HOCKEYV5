// Game speed control.
//
// One cycling button rather than three: 1x/2x/3x each need a comfortable touch
// target, and three of them plus SELL, AUTO and START left no room for the game
// on a 320-390px screen. Speed is a low-frequency, low-stakes choice, so it can
// afford a tap to cycle; START cannot.
//
// This module owns the speed UI. Everything that used to reach into
// `.speed-btn` elements directly -- hud.js, screens.js, input.js -- now calls
// setGameSpeed()/cycleGameSpeed() here, so the button markup is described once.

import { setGameSpeed as setGameSpeedState } from '../engine/state.js';
import { setSpeedEffect } from '../engine/postprocessing.js';

export const SPEEDS = [1, 2, 3];

let current = 1;

function speedButton() {
  return document.getElementById('speedBtn');
}

/** Paint the button to match `current`. */
export function syncSpeedButton() {
  const btn = speedButton();
  if (!btn) return;
  btn.textContent = `${current}×`;
  btn.dataset.speed = String(current);
  // The label has to say what a tap does, not just the state: "1×" alone gives
  // a screen reader no clue this button cycles.
  btn.setAttribute('aria-label', `Game speed ${current}×. Tap to change speed.`);
  btn.classList.toggle('boosted', current > 1);
}

/** @returns {number} the active speed multiplier */
export function getGameSpeed() {
  return current;
}

/**
 * Set the game speed and sync the button.
 * @param {number} speed - one of SPEEDS; ignored otherwise
 */
export function setGameSpeed(speed) {
  if (!SPEEDS.includes(speed)) return;
  current = speed;
  setGameSpeedState(speed);
  setSpeedEffect(speed);
  syncSpeedButton();
}

/** Advance 1x -> 2x -> 3x -> 1x. */
export function cycleGameSpeed() {
  const next = SPEEDS[(SPEEDS.indexOf(current) + 1) % SPEEDS.length];
  setGameSpeed(next);
  return next;
}

/** Back to 1x. Called when a game starts or the HUD resets. */
export function resetGameSpeed() {
  setGameSpeed(1);
}

export function initSpeedButtons() {
  const btn = speedButton();
  if (!btn) return;
  btn.onclick = cycleGameSpeed;
  syncSpeedButton();
}
