// SC-5.4: Ambient Soundscape — per-theme ambient audio with intensity scaling

import { playSound, setVolume, registerSound } from './audio.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_VOLUME = 0.3;
const MIN_SHOT_INTERVAL_MS = 5_000;
const MAX_SHOT_INTERVAL_MS = 15_000;
const SHOT_VOLUME_MIN = 0.1;
const SHOT_VOLUME_MAX = 0.2;

const SOUND_DEFS = {
  hockey: {
    loops: ['ambient_crowd_hockey', 'ambient_arena_echo'],
    shot: 'ambient_skates',
  },
  soccer: {
    loops: ['ambient_crowd_soccer', 'ambient_wind'],
    shot: 'ambient_vuvuzela',
  },
};

const SOUND_URLS = {
  ambient_crowd_hockey: '/audio/ambient/crowd_hockey.ogg',
  ambient_skates:       '/audio/ambient/skates.ogg',
  ambient_arena_echo:   '/audio/ambient/arena_echo.ogg',
  ambient_crowd_soccer: '/audio/ambient/crowd_soccer.ogg',
  ambient_vuvuzela:     '/audio/ambient/vuvuzela.ogg',
  ambient_wind:         '/audio/ambient/wind.ogg',
};

// ── Module state ──────────────────────────────────────────────────────────────

let currentTheme = 'hockey';
let isRunning = false;
let shotTimerId = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcGain(intensity) {
  return BASE_VOLUME * (0.3 + intensity * 0.5);
}

function randomInterval() {
  return MIN_SHOT_INTERVAL_MS +
    Math.random() * (MAX_SHOT_INTERVAL_MS - MIN_SHOT_INTERVAL_MS);
}

function randomShotVolume() {
  return SHOT_VOLUME_MIN + Math.random() * (SHOT_VOLUME_MAX - SHOT_VOLUME_MIN);
}

function playLoops(theme) {
  const def = SOUND_DEFS[theme];
  if (!def) return;
  for (const name of def.loops) {
    playSound(name, { loop: true });
  }
}

function scheduleShot() {
  if (!isRunning) return;
  shotTimerId = setTimeout(() => {
    if (!isRunning) return;
    const def = SOUND_DEFS[currentTheme];
    if (def) {
      playSound(def.shot, { volume: randomShotVolume() });
    }
    scheduleShot();
  }, randomInterval());
}

function clearShotTimer() {
  if (shotTimerId !== null) {
    clearTimeout(shotTimerId);
    shotTimerId = null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function initAmbient() {
  for (const [name, url] of Object.entries(SOUND_URLS)) {
    registerSound(name, url);
  }
}

export function setAmbientTheme(theme) {
  currentTheme = theme;
  if (isRunning) {
    playLoops(theme);
  }
}

export function setAmbientIntensity(level) {
  const clamped = Math.min(1, Math.max(0, level));
  setVolume('ambient', calcGain(clamped));
}

export function startAmbient() {
  if (isRunning) return;
  isRunning = true;
  playLoops(currentTheme);
  scheduleShot();
}

export function stopAmbient() {
  isRunning = false;
  clearShotTimer();
}
