// Phone helpers: vibration feedback, pausing when the app is put away, and
// keeping the screen awake while a game is on.
//
// None of this exists on a desktop browser, and every API used here is
// optional on phones too (iOS Safari has no vibration), so every call is
// guarded and failing quietly is the expected outcome.

import { getState } from '../engine/state.js';

// Read straight from storage (the key settings.js uses) rather than importing
// the settings panel, which would drag the renderer into every module that
// wants a buzz.
function hapticsOn() {
  try {
    const raw = localStorage.getItem('hockeyTD_settings');
    return !raw || JSON.parse(raw).haptics !== false;
  } catch { return true; }
}

const PATTERNS = {
  tick: 8,            // preview a tile
  build: 18,          // tower placed
  upgrade: [14, 40, 22],
  sell: 12,
  invalid: [10, 30, 10],
  lifeLost: 45
};

/** Short vibration for a game event, if the phone and the player allow it. */
export function buzz(kind) {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    if (!hapticsOn()) return;
    const pattern = PATTERNS[kind];
    if (pattern) navigator.vibrate(pattern);
  } catch { /* no vibration here */ }
}

let wakeLock = null;

async function holdScreenAwake() {
  try {
    if (wakeLock || !navigator.wakeLock || document.hidden) return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener?.('release', () => { wakeLock = null; });
  } catch { wakeLock = null; }
}

function letScreenSleep() {
  try { wakeLock?.release(); } catch { /* already gone */ }
  wakeLock = null;
}

/** Called when a game starts and when it ends. */
export function setGameActive(active) {
  if (active) holdScreenAwake();
  else letScreenSleep();
}

/**
 * Wire the page-lifecycle hooks once.
 * @param {{pause: Function, isPaused: Function}} opts - open the pause menu / is it paused
 */
export function initMobileHelpers({ pause, isPaused = () => false } = {}) {
  if (typeof document === 'undefined') return;
  const onHide = () => {
    const state = getState();
    // A call, a notification or the app switcher would otherwise leave the
    // waves running with nobody watching.
    if (state.running && !isPaused()) pause?.();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onHide();
    else if (getState().running) holdScreenAwake(); // the lock drops when hidden
  });
  window.addEventListener('pagehide', onHide);
}
