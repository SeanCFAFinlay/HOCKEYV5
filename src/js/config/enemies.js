// Enemy definitions for each theme
// Each enemy has: id, nm (name), hp, spd (speed), rwd (reward), sz (size)
// Optional properties: fire, flying, armor, boss, role
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

export const HOCKEY_ENEMIES = [
  {
    id: 'e1',
    nm: 'Puck',
    role: 'SWARM',  // Basic enemy, comes in numbers
    hp: 50,
    spd: 2.4,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Hot Puck',
    role: 'FIRE',  // Fire trail on death
    hp: 70,
    spd: 2.0,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Puck',
    role: 'FLYING',  // Bypasses obstacles
    hp: 45,
    spd: 2.8,
    rwd: 14, // Slightly higher - bypasses ground defenses
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Puck',
    role: 'ARMORED',  // Tank - tests sustained DPS
    hp: 250,
    spd: 0.7,
    rwd: 40, // Increased from 35 - high HP tank deserves more
    armor: 0.4,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Puck',
    role: 'ELITE',  // Fire + Armor combined
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
    role: 'FLYING_FIRE',  // Flying fire - aerial threat
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
    role: 'BOSS',  // Ultimate challenge
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
    hp: 35,
    spd: 3.5, // Very fast
    rwd: 12,
    sz: 0.85
  },
  {
    id: 'e9',
    nm: 'Defenseman',
    hp: 350,
    spd: 0.6, // Slow but tanky
    rwd: 50,
    armor: 0.45,
    sz: 1.6
  },
  {
    id: 'e10',
    nm: 'Enforcer',
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
    role: 'SWARM',  // Basic enemy
    hp: 45,
    spd: 2.5,
    rwd: 10,
    sz: 1.0
  },
  {
    id: 'e2',
    nm: 'Fire Ball',
    role: 'FIRE',  // Fire trail
    hp: 65,
    spd: 2.1,
    rwd: 15,
    fire: true,
    sz: 1.0
  },
  {
    id: 'e3',
    nm: 'Flying Ball',
    role: 'FLYING',  // Bypasses obstacles
    hp: 40,
    spd: 3.0,
    rwd: 14, // Matches hockey flying reward
    flying: true,
    sz: 0.9
  },
  {
    id: 'e4',
    nm: 'Heavy Ball',
    role: 'ARMORED',  // Tank
    hp: 280,
    spd: 0.65,
    rwd: 40, // Increased from 35
    armor: 0.45,
    sz: 1.4
  },
  {
    id: 'e5',
    nm: 'Inferno Ball',
    role: 'ELITE',  // Fire + Armor
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
    role: 'FLYING_FIRE',  // Aerial threat
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
    role: 'BOSS',  // Ultimate challenge
    hp: 2800,
    spd: 0.32,
    rwd: 380, // Unified with hockey boss (was 400, hockey was 350)
    armor: 0.38,
    boss: true,
    sz: 2.2
  }
];
