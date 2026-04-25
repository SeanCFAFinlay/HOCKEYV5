// Tower definitions for each theme
// Each tower has a clear tactical identity and role

/**
 * TOWER ROLES:
 * - ANTI-SWARM: Fast-firing, moderate damage, good vs many weak enemies
 * - SNIPER: High damage, slow rate, long range - vs high HP targets
 * - SPLASH: Area damage - vs groups
 * - CROWD CONTROL: Slow effect - supports other towers
 * - CHOKEPOINT: High damage, short range - defends specific spots
 * - CHAIN: Multi-target - vs spread out groups
 * - DOT: Damage over time - vs tanky enemies
 * - BOSS KILLER: Massive single-hit damage, crit chance
 */

export const HOCKEY_TOWERS = [
  {
    id: 't1',
    nm: 'Slap Shot',
    icon: '🏒',
    role: 'ANTI-SWARM',  // Fast base tower, good vs basic pucks
    cost: 80,
    clr: '#00d4ff',
    dmg: [25, 40, 60, 90],
    rng: [2.8, 3.2, 3.6, 4.1],
    rate: [1.2, 1.4, 1.7, 2.0],
    up: [60, 100, 170],
    projectile: 'puck'
  },
  {
    id: 't2',
    nm: 'Sniper',
    icon: '🎯',
    role: 'SNIPER',  // Long range, high damage - vs armored/boss
    cost: 150,
    clr: '#ef4444',
    dmg: [70, 110, 165, 250],
    rng: [4.5, 5.0, 5.6, 6.2],
    rate: [0.5, 0.6, 0.72, 0.85],
    up: [110, 190, 320],
    projectile: 'dart'
  },
  {
    id: 't3',
    nm: 'Enforcer',
    icon: '👊',
    role: 'SPLASH',  // Area damage - clears groups
    cost: 120,
    clr: '#f97316',
    dmg: [45, 70, 105, 160],
    rng: [2.5, 2.9, 3.3, 3.8],
    rate: [0.55, 0.65, 0.78, 0.92],
    up: [90, 155, 260],
    splash: [1.2, 1.5, 1.8, 2.2],
    projectile: 'hammer'
  },
  {
    id: 't4',
    nm: 'Ice Spray',
    icon: '❄️',
    role: 'CROWD_CONTROL',  // Slows enemies for other towers
    cost: 90,
    clr: '#38bdf8',
    dmg: [18, 28, 42, 60],
    rng: [3.0, 3.4, 3.8, 4.3],
    rate: [1.3, 1.55, 1.8, 2.1],
    up: [65, 115, 190],
    slow: 0.5,
    slowDur: [2, 2.5, 3.2, 4],
    projectile: 'shard'
  },
  {
    id: 't5',
    nm: 'Goalie',
    icon: '🥅',
    role: 'CHOKEPOINT',  // High damage, short range - last defense
    cost: 200,
    clr: '#ffd700',
    dmg: [100, 155, 230, 350],
    rng: [2.0, 2.4, 2.8, 3.2],
    rate: [0.7, 0.85, 1.0, 1.2],
    up: [140, 250, 420],
    projectile: 'glove'
  },
  {
    id: 't6',
    nm: 'Power Play',
    icon: '⚡',
    role: 'CHAIN',  // Hits multiple enemies in sequence
    cost: 160,
    clr: '#a855f7',
    dmg: [35, 55, 82, 125],
    rng: [3.5, 4.0, 4.5, 5.1],
    rate: [0.85, 1.0, 1.15, 1.35],
    up: [120, 200, 340],
    chain: [2, 3, 4, 6],
    chainRng: 2.2,
    projectile: 'lightning'
  },
  {
    id: 't7',
    nm: 'Hot Stick',
    icon: '🔥',
    role: 'DOT',  // Burn damage over time - good vs tanks
    cost: 140,
    clr: '#f97316',
    dmg: [15, 24, 36, 52],
    rng: [2.6, 3.0, 3.4, 3.9],
    rate: [3.5, 4.2, 5.0, 6.0],
    up: [100, 175, 290],
    burn: [10, 16, 24, 35],
    burnDur: 3,
    projectile: 'fireball'
  },
  {
    id: 't8',
    nm: 'Captain',
    icon: '👑',
    role: 'BOSS_KILLER',  // Massive crit damage, very slow
    cost: 280,
    clr: '#fbbf24',
    dmg: [200, 320, 480, 720],
    rng: [5.5, 6.1, 6.8, 7.5],
    rate: [0.2, 0.26, 0.33, 0.42],
    up: [200, 360, 600],
    crit: 0.4,
    projectile: 'star'
  }
];

export const SOCCER_TOWERS = [
  {
    id: 't1',
    nm: 'Striker',
    icon: '⚽',
    role: 'ANTI-SWARM',  // Fast base tower
    cost: 80,
    clr: '#22c55e',
    dmg: [28, 44, 66, 100],
    rng: [2.6, 3.0, 3.4, 3.9],
    rate: [1.15, 1.35, 1.6, 1.9],
    up: [60, 100, 170],
    projectile: 'ball'
  },
  {
    id: 't2',
    nm: 'Free Kick',
    icon: '🎯',
    role: 'SNIPER',  // Long range precision
    cost: 150,
    clr: '#fbbf24',
    dmg: [75, 118, 175, 265],
    rng: [4.8, 5.3, 5.9, 6.5],
    rate: [0.48, 0.58, 0.7, 0.84],
    up: [110, 190, 320],
    projectile: 'curveBall'
  },
  {
    id: 't3',
    nm: 'Header',
    icon: '🤕',
    role: 'SPLASH',  // Area damage
    cost: 120,
    clr: '#3b82f6',
    dmg: [50, 78, 118, 178],
    rng: [2.8, 3.2, 3.6, 4.1],
    rate: [0.5, 0.6, 0.72, 0.86],
    up: [90, 155, 260],
    splash: [1.3, 1.6, 2.0, 2.4],
    projectile: 'headButt'
  },
  {
    id: 't4',
    nm: 'Tackle',
    icon: '🦶',
    role: 'CROWD_CONTROL',  // Slow effect
    cost: 90,
    clr: '#f97316',
    dmg: [20, 32, 48, 70],
    rng: [2.8, 3.2, 3.6, 4.1],
    rate: [1.25, 1.48, 1.72, 2.0],
    up: [65, 115, 190],
    slow: 0.5,
    slowDur: [1.8, 2.4, 3.0, 3.8],
    projectile: 'tackle'
  },
  {
    id: 't5',
    nm: 'Keeper',
    icon: '🧤',
    role: 'CHOKEPOINT',  // High damage, short range
    cost: 200,
    clr: '#a855f7',
    dmg: [110, 170, 255, 385],
    rng: [1.8, 2.2, 2.6, 3.0],
    rate: [0.75, 0.9, 1.05, 1.25],
    up: [140, 250, 420],
    projectile: 'glove'
  },
  {
    id: 't6',
    nm: 'Playmaker',
    icon: '🔄',
    role: 'CHAIN',  // Multi-target
    cost: 160,
    clr: '#06b6d4',
    dmg: [38, 60, 90, 135],
    rng: [3.8, 4.3, 4.9, 5.5],
    rate: [0.82, 0.96, 1.12, 1.3],
    up: [120, 200, 340],
    chain: [2, 3, 5, 7],
    chainRng: 2.5,
    projectile: 'chain'
  },
  {
    id: 't7',
    nm: 'Flare',
    icon: '🔥',
    role: 'DOT',  // Burn damage
    cost: 140,
    clr: '#ef4444',
    dmg: [16, 26, 40, 58],
    rng: [2.4, 2.8, 3.2, 3.7],
    rate: [3.2, 3.9, 4.7, 5.6],
    up: [100, 175, 290],
    burn: [12, 18, 28, 40],
    burnDur: 3.5,
    projectile: 'flare'
  },
  {
    id: 't8',
    nm: 'Legend',
    icon: '👑',
    role: 'BOSS_KILLER',  // Massive crit damage
    cost: 280,
    clr: '#fbbf24',
    dmg: [220, 350, 525, 790],
    rng: [5.2, 5.8, 6.5, 7.2],
    rate: [0.18, 0.24, 0.31, 0.4],
    up: [200, 360, 600],
    crit: 0.45,
    projectile: 'legend'
  }
];
