// SC-5.3: Music State Manager
// Thin state machine that delegates to audio.js

import { playMusic, stopMusic, registerSound } from './audio.js';
import { on, GameEvents } from './events.js';

// ── Track URLs (placeholder) ──────────────────────────────────────────────────

const TRACKS = {
  music_menu:     '/audio/music/menu.ogg',
  music_gameplay: '/audio/music/gameplay.ogg',
  music_boss:     '/audio/music/boss.ogg',
  music_victory:  '/audio/music/victory.ogg',
  music_defeat:   '/audio/music/defeat.ogg',
};

// Terminal states that should not be overridden by wave events
const TERMINAL_STATES = new Set(['victory', 'defeat']);

const CROSSFADE_MS = 2000;

// ── Module state ──────────────────────────────────────────────────────────────

let currentState = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function isBossWave(wave) {
  return wave > 0 && wave % 5 === 0;
}

function crossfadeToTrack(hadPreviousState, trackName) {
  if (hadPreviousState) {
    stopMusic(CROSSFADE_MS);
  }
  playMusic(trackName);
}

function playStinger(trackName) {
  stopMusic(CROSSFADE_MS);
  playMusic(trackName);
}

// ── Event handlers ─────────────────────────────────────────────────────────────

function onWaveStart({ wave }) {
  if (TERMINAL_STATES.has(currentState)) return;
  if (isBossWave(wave)) {
    setMusicState('boss');
  }
}

function onWaveEnd(_payload) {
  if (TERMINAL_STATES.has(currentState)) return;
  if (currentState === 'boss') {
    setMusicState('gameplay');
  }
}

function onGameWin() {
  setMusicState('victory');
}

function onGameLose() {
  setMusicState('defeat');
}

function onGameStart() {
  setMusicState('gameplay');
}

// ── Public API ────────────────────────────────────────────────────────────────

export function initMusic() {
  // Register all tracks
  Object.entries(TRACKS).forEach(([name, url]) => registerSound(name, url));

  // Reset state
  currentState = null;

  // Subscribe to game events
  on(GameEvents.WAVE_START, onWaveStart);
  on(GameEvents.WAVE_END, onWaveEnd);
  on(GameEvents.GAME_WIN, onGameWin);
  on(GameEvents.GAME_LOSE, onGameLose);
  on(GameEvents.GAME_START, onGameStart);
}

export function getMusicState() {
  return currentState;
}

export function setMusicState(state) {
  if (state === currentState) return;
  if (!(state in STATE_ACTIONS)) return;

  const hadPrevious = currentState !== null;
  currentState = state;
  STATE_ACTIONS[state](hadPrevious);
}

// State action map — avoids if/else chains
const STATE_ACTIONS = {
  menu:      (had) => crossfadeToTrack(had, 'music_menu'),
  gameplay:  (had) => crossfadeToTrack(had, 'music_gameplay'),
  boss:      (had) => crossfadeToTrack(had, 'music_boss'),
  victory:   (_)   => playStinger('music_victory'),
  defeat:    (_)   => playStinger('music_defeat'),
};
