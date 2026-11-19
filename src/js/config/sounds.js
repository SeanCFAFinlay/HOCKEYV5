// SC-5.2: Sound Effects Registry — centralized sound catalogue

import { registerSound, playSound, playSoundAt, hasSound } from '../engine/audio.js';

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
  // Each projectile family has its own voice; a little random pitch keeps a
  // fast-firing tower from sounding like a machine loop.
  const voice = FIRE_VOICES[tower.fireVoice];
  const name = voice && hasSound(voice) ? voice : 'towerFire';
  playSoundAt(name, worldX, worldZ, { volume: 0.5, rate: 0.92 + Math.random() * 0.16 });
}

// Projectile flight style (config/visual-profiles.js) -> fire sound.
const FIRE_VOICES = {
  tracer: 'fire_zap',
  bolt: 'fire_zap',
  flame: 'fire_flame',
  spray: 'fire_hiss',
  heavy: 'fire_thump',
  lob: 'fire_thump',
  punch: 'fire_thump',
  ring: 'fire_hum',
  orb: 'fire_hum'
};
