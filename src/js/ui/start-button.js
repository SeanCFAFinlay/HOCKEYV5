// The START button's label.
//
// Between waves it is the call to action and names the wave it will start.
// During a wave it cannot be pressed, so instead of a dead grey "START" it
// becomes a read-out: which wave is running, how many enemies are left, and a
// fill that grows as they are cleared. hud.js still owns the disabled state.

import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';

let timer = null;
let waveTotal = 0;

function parts() {
  const btn = document.getElementById('startBtn');
  if (!btn) return null;
  return { btn, main: btn.querySelector('.start-main'), sub: btn.querySelector('.start-sub') };
}

function remaining(state) {
  return (state.enemies?.length || 0) + (state.spawnsPending || 0);
}

function showIdle() {
  stopTimer();
  const p = parts();
  if (!p || !p.main) return;
  const state = getState();
  const total = state.mapData?.waves || 0;
  const next = (state.wave || 0) + 1;
  p.main.textContent = '▶ Start';
  p.sub.textContent = total && next <= total ? `Wave ${next} of ${total}` : '';
  p.btn.style.setProperty('--p', '0%');
}

function showProgress() {
  const p = parts();
  if (!p || !p.main) return;
  const state = getState();
  if (!state.waveActive) { showIdle(); return; }
  const left = remaining(state);
  if (left > waveTotal) waveTotal = left;
  p.main.textContent = `Wave ${state.wave}`;
  p.sub.textContent = left === 1 ? '1 enemy left' : `${left} enemies left`;
  const done = waveTotal > 0 ? 1 - left / waveTotal : 0;
  p.btn.style.setProperty('--p', `${Math.round(Math.max(0, Math.min(1, done)) * 100)}%`);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function initStartButton() {
  if (!parts()) return;

  on(GameEvents.WAVE_START, () => {
    waveTotal = 0;
    stopTimer();
    showProgress();
    timer = setInterval(showProgress, 250);
  });
  on(GameEvents.WAVE_COMPLETE, showIdle);
  on(GameEvents.GAME_START, showIdle);
  on(GameEvents.GAME_RESET, showIdle);
  on(GameEvents.GAME_WIN, stopTimer);
  on(GameEvents.GAME_LOSE, stopTimer);

  showIdle();
}
