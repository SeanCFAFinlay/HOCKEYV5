// Connects the generated music (engine/music-synth.js) to the match and the player's
// choice. Music is off unless the player has switched it on, and it only ever
// plays inside a match - never on the menus or at page load.

import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { startMusic, stopMusic, setMusicIntensity, setMusicHalted } from '../engine/music-synth.js';

const STORAGE_KEY = 'hockeyTD_settings';   // shared with ui/settings.js

export function isMusicEnabled() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return !!(raw && JSON.parse(raw).music === true);
  } catch { return false; }
}

export function setMusicEnabled(enabled) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const s = raw ? JSON.parse(raw) : {};
    s.music = !!enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* storage blocked: still apply for this session */ }
  apply(!!enabled);
  syncSwitches();
}

let enabledThisSession = null;   // set when storage is unavailable

function enabled() {
  return enabledThisSession ?? isMusicEnabled();
}

function inMatch() {
  return !!getState().running;
}

let bossOnBoard = false;
let waveOn = false;

function currentIntensity() {
  return bossOnBoard ? 2 : waveOn ? 1 : 0;
}

function apply(on) {
  enabledThisSession = on;
  if (on && inMatch()) {
    startMusic(getState().theme);
    setMusicIntensity(currentIntensity());
  } else {
    stopMusic(0.5);
  }
}

/** Reflect the setting in every music switch on screen. */
export function syncSwitches() {
  if (typeof document === 'undefined') return;
  const on = enabled();
  const btn = document.getElementById('pauseMusicBtn');
  if (btn) {
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    btn.classList.toggle('on', on);
  }
  document.querySelectorAll('input[data-setting-key="music"]').forEach(i => { i.checked = on; });
}

export function initMusicControl() {
  on(GameEvents.GAME_START, ({ theme } = {}) => {
    bossOnBoard = false;
    waveOn = false;
    if (enabled()) { startMusic(theme || getState().theme); setMusicIntensity(0); }
  });
  on(GameEvents.WAVE_START, () => { waveOn = true; setMusicIntensity(currentIntensity()); });
  on(GameEvents.ENEMY_SPAWN, ({ enemy } = {}) => {
    if (enemy?.boss && !bossOnBoard) { bossOnBoard = true; setMusicIntensity(2); }
  });
  const calm = () => { waveOn = false; bossOnBoard = false; setMusicIntensity(0); };
  on(GameEvents.WAVE_END, calm);
  on(GameEvents.WAVE_COMPLETE, calm);
  const end = () => { waveOn = false; bossOnBoard = false; stopMusic(1.2); };
  on(GameEvents.GAME_WIN, end);
  on(GameEvents.GAME_LOSE, end);
  on(GameEvents.GAME_RESET, () => stopMusic(0.3));

  document.getElementById('pauseMusicBtn')?.addEventListener('click', () => setMusicEnabled(!enabled()));
  syncSwitches();
}

/** The pause menu stops the music with the game. */
export function onPauseChanged(paused) {
  setMusicHalted(paused);
}
