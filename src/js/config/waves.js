// Wave generation logic
// Creates tactical enemy compositions with varied pressure patterns
//
// Legacy scaling notes:
//   e[0] basic: grows steadily throughout the game
//   e[1] fire: appears wave 2+, moderate growth
//   e[2] flying: appears wave 3+, bypasses ground towers
//   e[3] heavy/armor: appears wave 5+, slow but tanky
//   e[4] inferno: appears wave 8+, fire+armor combo
//   e[5] flying fire: appears wave 10+, high mobility threat
//   e[6] boss: every 5th wave, count grows with map progression

import { getState } from '../engine/state.js';

/**
 * Wave composition themes for variety
 */
const WaveTheme = {
  SWARM: 'swarm',           // Many weak enemies
  TANK_RUSH: 'tank_rush',   // Few tanky enemies
  AIR_RAID: 'air_raid',     // Flying enemies
  MIXED: 'mixed',           // Balanced composition
  FIRE_WAVE: 'fire_wave',   // Fire enemies
  BOSS: 'boss',             // Boss + support
  RECOVERY: 'recovery'      // Easy wave after hard one
};

/**
 * Generate waves with tactical variety
 * @param {number} num - Total number of waves
 * @returns {Array} Array of wave compositions
 */
export function generateWaves(num) {
  const { themeData } = getState();
  const waves = [];
  const e = themeData.enemies;

  // Enemy type indices
  const BASIC = 0;      // e1: Puck/Ball
  const FIRE = 1;       // e2: Hot Puck/Fire Ball
  const FLYING = 2;     // e3: Flying Puck/Ball
  const ARMORED = 3;    // e4: Heavy Puck/Ball
  const ELITE = 4;      // e5: Inferno Puck/Ball (fire + armor)
  const FLYING_FIRE = 5; // e6: Flying Fire
  const BOSS = 6;       // e7: Boss

  for (let w = 1; w <= num; w++) {
    const wv = {};
    const theme = getWaveTheme(w, num);
    const difficulty = getDifficultyMultiplier(w, num);

    switch (theme) {
      case WaveTheme.SWARM:
        // Many weak enemies - tests AoE and fast-firing towers
        wv[e[BASIC].id] = Math.floor(8 + w * 1.5 * difficulty);
        if (w > 5) wv[e[FIRE].id] = Math.floor(w * 0.3);
        break;

      case WaveTheme.TANK_RUSH:
        // Fewer but tougher enemies - tests single-target DPS
        wv[e[BASIC].id] = Math.floor(3 + w * 0.5);
        wv[e[ARMORED].id] = Math.floor(1 + w * 0.25 * difficulty);
        if (w > 12) wv[e[ELITE].id] = Math.floor((w - 10) * 0.15);
        break;

      case WaveTheme.AIR_RAID:
        // Flying enemies bypass ground obstacles - tests positioning
        wv[e[BASIC].id] = Math.floor(3 + w * 0.4);
        wv[e[FLYING].id] = Math.floor(2 + w * 0.5 * difficulty);
        if (w > 15) wv[e[FLYING_FIRE].id] = Math.floor((w - 12) * 0.2);
        break;

      case WaveTheme.FIRE_WAVE:
        // Fire enemies - tests sustained damage and kiting
        wv[e[BASIC].id] = Math.floor(4 + w * 0.5);
        wv[e[FIRE].id] = Math.floor(3 + w * 0.6 * difficulty);
        if (w > 10) wv[e[ELITE].id] = Math.floor((w - 8) * 0.1);
        break;

      case WaveTheme.BOSS:
        // Boss wave with supporting enemies
        wv[e[BOSS].id] = 1 + Math.floor(w / 15);
        wv[e[BASIC].id] = Math.floor(4 + w * 0.3);
        wv[e[ARMORED].id] = Math.floor(w * 0.15);
        if (w > 20) wv[e[ELITE].id] = Math.floor((w - 15) * 0.1);
        break;

      case WaveTheme.RECOVERY:
        // Easy wave - breather after difficult wave
        wv[e[BASIC].id] = Math.floor(4 + w * 0.6);
        break;

      case WaveTheme.MIXED:
      default:
        // Balanced wave - tests overall strategy
        wv[e[BASIC].id] = Math.floor(4 + w * 0.8);
        if (w >= 2) wv[e[FIRE].id] = Math.floor(w * 0.35);
        if (w >= 4) wv[e[FLYING].id] = Math.floor(w * 0.25);
        if (w >= 6) wv[e[ARMORED].id] = Math.floor((w - 4) * 0.2);
        if (w >= 10) wv[e[ELITE].id] = Math.floor((w - 8) * 0.12);
        if (w >= 12) wv[e[FLYING_FIRE].id] = Math.floor((w - 10) * 0.15);
        break;
    }

    // NEW ENEMIES (only for hockey theme - check if they exist)
    // Add extra enemies to the wave composition if available
    if (e.length > 7) {
      // e[7] - speed skater: from wave 4, high count
      if (w >= 4) wv[e[7].id] = Math.floor((w - 2) * 0.8 * difficulty);

      // e[8] - defenseman: from wave 7, moderate count
      if (w >= 7) wv[e[8].id] = Math.floor((w - 5) * 0.3 * difficulty);

      // e[9] - enforcer: from wave 6, scales steadily
      if (w >= 6) wv[e[9].id] = Math.floor((w - 4) * 0.5 * difficulty);
    }

    // Clean up zero-count entries
    for (const key of Object.keys(wv)) {
      if (wv[key] <= 0) delete wv[key];
    }

    // NEW ENEMIES (only for hockey theme - check if they exist)
    if (e.length > 7) {
      // e[7] - speed skater: from wave 4, high count
      if (w >= 4) wv[e[7].id] = Math.floor((w - 2) * 0.8);

      // e[8] - defenseman: from wave 7, moderate count
      if (w >= 7) wv[e[8].id] = Math.floor((w - 5) * 0.3);

      // e[9] - enforcer: from wave 6, scales steadily
      if (w >= 6) wv[e[9].id] = Math.floor((w - 4) * 0.5);
    }

    waves.push(wv);
  }

  return waves;
}

/**
 * Determine wave theme based on wave number and total waves
 * Creates patterns of pressure and recovery
 * @param {number} wave - Current wave number (1-indexed)
 * @param {number} total - Total waves
 * @returns {string} WaveTheme
 */
function getWaveTheme(wave, total) {
  // Wave 1-2: Basic introduction
  if (wave <= 2) return WaveTheme.MIXED;

  // Boss waves every 5 waves
  if (wave % 5 === 0) return WaveTheme.BOSS;

  // Recovery wave after boss
  if (wave % 5 === 1 && wave > 5) return WaveTheme.RECOVERY;

  // Cycle through themed waves for variety
  const cyclePosition = (wave - 3) % 8;

  switch (cyclePosition) {
    case 0: return WaveTheme.SWARM;
    case 1: return WaveTheme.MIXED;
    case 2: return WaveTheme.AIR_RAID;
    case 3: return WaveTheme.MIXED;
    case 4: return WaveTheme.TANK_RUSH;
    case 5: return WaveTheme.MIXED;
    case 6: return WaveTheme.FIRE_WAVE;
    case 7: return WaveTheme.MIXED;
    default: return WaveTheme.MIXED;
  }
}

/**
 * Get difficulty multiplier based on wave progress
 * Difficulty ramps up through the game
 * @param {number} wave - Current wave
 * @param {number} total - Total waves
 * @returns {number} Multiplier (0.8 - 1.5)
 */
function getDifficultyMultiplier(wave, total) {
  const progress = wave / total;

  // Early game (first 20%): slightly easier
  if (progress < 0.2) return 0.8;

  // Mid game (20-60%): normal
  if (progress < 0.6) return 1.0;

  // Late game (60-80%): harder
  if (progress < 0.8) return 1.2;

  // End game (80-100%): hardest
  return 1.4;
}

/**
 * Get wave theme name for UI display
 * @param {number} wave - Wave number
 * @param {number} total - Total waves
 * @returns {string} Human-readable theme name
 */
export function getWaveThemeName(wave, total) {
  const theme = getWaveTheme(wave, total);

  switch (theme) {
    case WaveTheme.SWARM: return 'Swarm';
    case WaveTheme.TANK_RUSH: return 'Heavy';
    case WaveTheme.AIR_RAID: return 'Air Raid';
    case WaveTheme.FIRE_WAVE: return 'Inferno';
    case WaveTheme.BOSS: return 'BOSS';
    case WaveTheme.RECOVERY: return 'Breather';
    case WaveTheme.MIXED: return 'Mixed';
    default: return 'Mixed';
  }
}
