// SC-5.2: Sound Effects Registry — centralized sound catalogue

import { registerSound, playSound, playSoundAt } from '../engine/audio.js';

// ── Sound catalogue ────────────────────────────────────────────────────────────

export const SOUNDS = {
  towerPlace:     { url: 'audio/sfx/tower-place.mp3',   category: 'sfx' },
  towerFire:      { url: 'audio/sfx/tower-fire.mp3',    category: 'sfx' },
  towerSell:      { url: 'audio/sfx/tower-sell.mp3',    category: 'sfx' },
  enemyDeath:     { url: 'audio/sfx/enemy-death.mp3',   category: 'sfx' },
  enemyDeathBoss: { url: 'audio/sfx/boss-death.mp3',    category: 'sfx' },
  waveStart:      { url: 'audio/sfx/wave-start.mp3',    category: 'sfx' },
  waveComplete:   { url: 'audio/sfx/wave-complete.mp3', category: 'sfx' },
  moneyGain:      { url: 'audio/sfx/coin.mp3',          category: 'sfx' },
  upgrade:        { url: 'audio/sfx/upgrade.mp3',       category: 'sfx' },
  uiClick:        { url: 'audio/sfx/click.mp3',         category: 'sfx' },
  gameWin:        { url: 'audio/sfx/victory.mp3',       category: 'sfx' },
  gameLose:       { url: 'audio/sfx/defeat.mp3',        category: 'sfx' },
};

// ── Registration ───────────────────────────────────────────────────────────────

export function registerAllSounds() {
  for (const [name, entry] of Object.entries(SOUNDS)) {
    registerSound(name, entry.url);
  }
}

// ── Fire sound throttle (100ms per-tower) ──────────────────────────────────────

const FIRE_THROTTLE_MS = 100;

export function playFireSound(tower, worldX, worldZ) {
  const now = Date.now();
  if (tower._lastFireSoundMs !== undefined &&
      now - tower._lastFireSoundMs < FIRE_THROTTLE_MS) {
    return;
  }
  tower._lastFireSoundMs = now;
  playSoundAt('towerFire', worldX, worldZ);
}
