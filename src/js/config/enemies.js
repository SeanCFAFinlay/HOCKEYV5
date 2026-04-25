// Enemy definitions for each theme.
// Core systems consume these as data, not by array position.
// Required metadata:
// role, threatTags, unlockWave, waveWeight, speedClass, rewardClass
//
// Balance notes:
//   - Base HP is scaled per-wave in systems/enemies.js: hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)
//   - Rewards are fixed values; stronger/boss enemies give more
//   - Armor reduces damage taken as a flat multiplier (e.g., 0.35 = 35% damage reduction)
//
// ENEMY ROLES:
// - SWARM: Fast, weak, comes in numbers - tests AoE
// - FIRE: On death creates burn effect, moderate stats
// - FLYING: Bypasses obstacles, ignores pathing - tests positioning
// - ARMORED: High HP, slow, damage reduction - tests sustained DPS
// - ELITE: Combined traits (fire + armor) - late game challenge
// - FLYING_FIRE: Flying + fire - aerial threat
// - BOSS: Massive HP, armor, slow - tests entire defense
// - SPEEDSTER: Extremely fast, fragile pressure
// - BRUISER: Medium-speed armored disruptor

const meta = (role, threatTags, unlockWave, waveWeight, speedClass, rewardClass, extra = {}) => ({
  role,
  slot: extra.slot || role.toLowerCase(),
  threatTags,
  unlockWave,
  waveWeight,
  speedClass,
  rewardClass,
  ...extra
});

export const HOCKEY_ENEMIES = [
  {
    id: 'e1',
    nm: 'Puck',
    ...meta('SWARM', ['ground', 'swarm'], 1, 1.4, 'fast', 'low'),
    hp: 50,
    spd: 2.4,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Hot Puck',
    ...meta('FIRE', ['ground', 'fire'], 2, 0.9, 'normal', 'low'),
    hp: 70,
    spd: 2.0,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Puck',
    ...meta('FLYING', ['air', 'flying'], 4, 0.75, 'fast', 'low'),
    hp: 45,
    spd: 2.8,
    rwd: 14, // Slightly higher - bypasses ground defenses
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Puck',
    ...meta('ARMORED', ['ground', 'armor', 'tank'], 6, 0.55, 'slow', 'medium'),
    hp: 250,
    spd: 0.7,
    rwd: 40, // Increased from 35 - high HP tank deserves more
    armor: 0.4,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Puck',
    ...meta('ELITE', ['ground', 'fire', 'armor', 'elite'], 10, 0.35, 'slow', 'high'),
    hp: 400,
    spd: 0.55,
    rwd: 65, // Increased from 55
    fire: true,
    armor: 0.3,
    sz: 1.5
  },
  {
    id: 'e6',
    nm: 'Flying Fire',
    ...meta('FLYING_FIRE', ['air', 'flying', 'fire', 'elite'], 12, 0.3, 'fast', 'medium'),
    hp: 120,
    spd: 2.2,
    rwd: 28, // Slightly increased - fire + flying combo
    flying: true,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e7',
    nm: 'Boss Puck',
    ...meta('BOSS', ['ground', 'armor', 'boss'], 5, 0.08, 'slow', 'boss', { bossWaveOnly: true }),
    hp: 2500,
    spd: 0.35,
    rwd: 380, // Unified with soccer boss
    armor: 0.35,
    boss: true,
    sz: 2.2
  },
  // NEW HOCKEY-THEMED ENEMIES
  {
    id: 'e8',
    nm: 'Speed Skater',
    ...meta('SPEEDSTER', ['ground', 'swarm', 'speed'], 4, 0.95, 'very_fast', 'low'),
    hp: 35,
    spd: 3.5, // Very fast
    rwd: 12,
    sz: 0.85
  },
  {
    id: 'e9',
    nm: 'Defenseman',
    ...meta('ARMORED', ['ground', 'armor', 'tank'], 7, 0.45, 'slow', 'medium'),
    hp: 350,
    spd: 0.6, // Slow but tanky
    rwd: 50,
    armor: 0.45,
    sz: 1.6
  },
  {
    id: 'e10',
    nm: 'Enforcer',
    ...meta('BRUISER', ['ground', 'armor', 'bruiser'], 6, 0.6, 'normal', 'medium'),
    hp: 180,
    spd: 1.5, // Medium speed
    rwd: 35,
    armor: 0.25,
    sz: 1.3
  }
];

export const SOCCER_ENEMIES = [
  {
    id: 'e1',
    nm: 'Ball',
    ...meta('SWARM', ['ground', 'swarm'], 1, 1.4, 'fast', 'low'),
    hp: 45,
    spd: 2.5,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Fire Ball',
    ...meta('FIRE', ['ground', 'fire'], 2, 0.9, 'normal', 'low'),
    hp: 65,
    spd: 2.1,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Ball',
    ...meta('FLYING', ['air', 'flying'], 4, 0.75, 'fast', 'low'),
    hp: 40,
    spd: 3.0,
    rwd: 14, // Matches hockey flying reward
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Ball',
    ...meta('ARMORED', ['ground', 'armor', 'tank'], 6, 0.55, 'slow', 'medium'),
    hp: 280,
    spd: 0.65,
    rwd: 40, // Increased from 35
    armor: 0.45,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Ball',
    ...meta('ELITE', ['ground', 'fire', 'armor', 'elite'], 10, 0.35, 'slow', 'high'),
    hp: 450,
    spd: 0.5,
    rwd: 65, // Increased from 55
    fire: true,
    armor: 0.35,
    sz: 1.5
  },
  {
    id: 'e6',
    nm: 'Flying Fire',
    ...meta('FLYING_FIRE', ['air', 'flying', 'fire', 'elite'], 12, 0.3, 'fast', 'medium'),
    hp: 130,
    spd: 2.3,
    rwd: 28, // Matches hockey
    flying: true,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e7',
    nm: 'Boss Ball',
    ...meta('BOSS', ['ground', 'armor', 'boss'], 5, 0.08, 'slow', 'boss', { bossWaveOnly: true }),
    hp: 2800,
    spd: 0.32,
    rwd: 380, // Unified with hockey boss (was 400, hockey was 350)
    armor: 0.38,
    boss: true,
    sz: 2.2
  }
];
