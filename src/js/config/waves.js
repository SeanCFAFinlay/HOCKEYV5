// Data-driven wave generation.
// Enemy selection is based on enemy metadata, never array position.

import { getState } from '../engine/state.js';

export const WaveTheme = {
  SWARM: 'swarm',
  TANK_RUSH: 'tank_rush',
  AIR_RAID: 'air_raid',
  MIXED: 'mixed',
  FIRE_WAVE: 'fire_wave',
  BOSS: 'boss',
  RECOVERY: 'recovery'
};

const THEME_RULES = {
  [WaveTheme.SWARM]: {
    label: 'Swarm',
    tags: ['swarm', 'speed'],
    fallbackRoles: ['SWARM', 'SPEEDSTER'],
    budget: 7.5,
    countScale: 1.28,
    boss: false
  },
  [WaveTheme.TANK_RUSH]: {
    label: 'Heavy',
    tags: ['armor', 'tank', 'bruiser'],
    fallbackRoles: ['ARMORED', 'BRUISER', 'ELITE'],
    budget: 5.2,
    countScale: 0.78,
    boss: false
  },
  [WaveTheme.AIR_RAID]: {
    label: 'Air Raid',
    tags: ['air', 'flying'],
    fallbackRoles: ['FLYING', 'FLYING_FIRE'],
    budget: 5.4,
    countScale: 0.86,
    boss: false
  },
  [WaveTheme.FIRE_WAVE]: {
    label: 'Inferno',
    tags: ['fire'],
    fallbackRoles: ['FIRE', 'ELITE', 'FLYING_FIRE'],
    budget: 5.8,
    countScale: 0.9,
    boss: false
  },
  [WaveTheme.BOSS]: {
    label: 'BOSS',
    tags: ['boss'],
    fallbackRoles: ['BOSS'],
    budget: 2.2,
    countScale: 0.25,
    boss: true
  },
  [WaveTheme.RECOVERY]: {
    label: 'Breather',
    tags: ['swarm', 'ground'],
    fallbackRoles: ['SWARM'],
    budget: 4.5,
    countScale: 0.72,
    boss: false
  },
  [WaveTheme.MIXED]: {
    label: 'Mixed',
    tags: ['ground', 'swarm', 'fire', 'armor', 'air'],
    fallbackRoles: ['SWARM', 'FIRE', 'FLYING', 'ARMORED', 'BRUISER', 'ELITE', 'FLYING_FIRE'],
    budget: 6.2,
    countScale: 1,
    boss: false
  }
};

const ROLE_COST = {
  SWARM: 1,
  SPEEDSTER: 1.15,
  FIRE: 1.35,
  FLYING: 1.45,
  BRUISER: 1.9,
  ARMORED: 2.25,
  FLYING_FIRE: 2.25,
  ELITE: 2.8,
  BOSS: 8
};

/**
 * Generate wave compositions for a content pack.
 * @param {number} num
 * @param {Object=} themeData
 * @param {Object=} options
 * @returns {Array<Object>} Array of { enemyId: count } wave records.
 */
export function generateWaves(num, themeData = getState().themeData, options = {}) {
  const enemies = themeData?.enemies || [];
  const waves = [];

  for (let wave = 1; wave <= num; wave++) {
    const theme = getWaveTheme(wave, num, options.mode);
    const waveData = composeWave(enemies, wave, num, theme, options);
    waves.push(waveData);
  }

  return waves;
}

export function composeWave(enemies, wave, totalWaves, theme, options = {}) {
  const rule = THEME_RULES[theme] || THEME_RULES[WaveTheme.MIXED];
  const difficulty = getDifficultyMultiplier(wave, totalWaves, options.mode);
  const composition = {};

  if (rule.boss) {
    addBosses(composition, enemies, wave, difficulty);
  }

  const candidates = getCandidates(enemies, wave, rule);
  const supportRule = rule.boss ? THEME_RULES[WaveTheme.MIXED] : rule;
  const supportCandidates = candidates.length ? candidates : getCandidates(enemies, wave, supportRule);
  const budget = Math.max(3, rule.budget + wave * rule.countScale * difficulty);
  spendBudget(composition, supportCandidates, budget, wave, theme);

  if (theme !== WaveTheme.RECOVERY && theme !== WaveTheme.BOSS) {
    addSupportPressure(composition, enemies, wave, difficulty);
  }

  return cleanComposition(composition);
}

function addBosses(composition, enemies, wave, difficulty) {
  const bosses = enemies.filter(e => e.boss || e.role === 'BOSS' || e.threatTags?.includes('boss'));
  if (!bosses.length) return;

  const boss = pickWeighted(bosses, wave);
  composition[boss.id] = (composition[boss.id] || 0) + Math.max(1, Math.floor(1 + wave / 18 * difficulty));
}

function spendBudget(composition, candidates, budget, wave, theme) {
  if (!candidates.length) return;

  let remaining = budget;
  let guard = 0;
  while (remaining > 0.75 && guard < 80) {
    const enemy = pickWeighted(candidates, wave + guard);
    const cost = getEnemyCost(enemy);
    if (cost <= remaining || !composition[enemy.id]) {
      composition[enemy.id] = (composition[enemy.id] || 0) + getCountBundle(enemy, theme);
      remaining -= cost;
    } else {
      remaining -= 0.5;
    }
    guard++;
  }
}

function addSupportPressure(composition, enemies, wave, difficulty) {
  const support = enemies.filter(e =>
    (e.role === 'SWARM' || e.threatTags?.includes('swarm')) &&
    (e.unlockWave || 1) <= wave &&
    !e.boss
  );
  if (!support.length) return;

  const basic = pickWeighted(support, wave * 3);
  const supportCount = Math.floor(Math.max(0, (wave - 2) * 0.22 * difficulty));
  if (supportCount > 0) composition[basic.id] = (composition[basic.id] || 0) + supportCount;
}

function getCandidates(enemies, wave, rule) {
  return enemies.filter(enemy => {
    if ((enemy.unlockWave || 1) > wave) return false;
    if (enemy.bossWaveOnly && !rule.boss) return false;
    if (enemy.boss && !rule.boss) return false;

    const tags = enemy.threatTags || [];
    const tagMatch = rule.tags.some(tag => tags.includes(tag));
    const roleMatch = rule.fallbackRoles.includes(enemy.role);
    return tagMatch || roleMatch;
  });
}

function getEnemyCost(enemy) {
  return ROLE_COST[enemy.role] || (enemy.boss ? ROLE_COST.BOSS : 1.5);
}

function getCountBundle(enemy, theme) {
  if (enemy.boss) return 1;
  if (theme === WaveTheme.SWARM && (enemy.threatTags?.includes('swarm') || enemy.role === 'SPEEDSTER')) return 2;
  return 1;
}

function pickWeighted(candidates, seed) {
  const total = candidates.reduce((sum, e) => sum + (e.waveWeight || 1), 0);
  let roll = seededUnit(seed) * total;
  for (const enemy of candidates) {
    roll -= enemy.waveWeight || 1;
    if (roll <= 0) return enemy;
  }
  return candidates[candidates.length - 1];
}

function cleanComposition(composition) {
  const clean = {};
  for (const [id, count] of Object.entries(composition)) {
    const rounded = Math.floor(count);
    if (rounded > 0) clean[id] = rounded;
  }
  return clean;
}

export function getWaveTheme(wave, total, mode = 'campaign') {
  if (mode === 'endless' && wave > total) {
    if (wave % 10 === 0) return WaveTheme.BOSS;
    if (wave % 10 === 1) return WaveTheme.RECOVERY;
  }

  if (wave <= 2) return WaveTheme.MIXED;
  if (wave % 5 === 0) return WaveTheme.BOSS;
  if (wave % 5 === 1 && wave > 5) return WaveTheme.RECOVERY;

  const cyclePosition = (wave - 3) % 8;
  switch (cyclePosition) {
    case 0: return WaveTheme.SWARM;
    case 2: return WaveTheme.AIR_RAID;
    case 4: return WaveTheme.TANK_RUSH;
    case 6: return WaveTheme.FIRE_WAVE;
    default: return WaveTheme.MIXED;
  }
}

function getDifficultyMultiplier(wave, total, mode = 'campaign') {
  if (mode === 'endless') {
    return 1.15 + Math.min(2.5, wave * 0.035);
  }

  const progress = wave / total;
  if (progress < 0.2) return 0.85;
  if (progress < 0.6) return 1.0;
  if (progress < 0.8) return 1.18;
  return 1.38;
}

function seededUnit(seed) {
  let s = (seed * 0x9E3779B1) >>> 0;
  s = (s + 0x6D2B79F5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), s | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function getWaveThemeName(wave, total) {
  const theme = getWaveTheme(wave, total);
  return THEME_RULES[theme]?.label || 'Mixed';
}

export function getWavePreview(waveData, enemies) {
  const byId = new Map(enemies.map(enemy => [enemy.id, enemy]));
  const entries = Object.entries(waveData || {})
    .map(([id, count]) => {
      const enemy = byId.get(id);
      if (!enemy) return null;
      return {
        id,
        count,
        name: enemy.nm,
        role: enemy.role,
        tags: enemy.threatTags || [],
        boss: !!enemy.boss,
        flying: !!enemy.flying,
        armor: !!enemy.armor,
        fire: !!enemy.fire,
        rewardClass: enemy.rewardClass
      };
    })
    .filter(Boolean);

  const pressureTags = [...new Set(entries.flatMap(entry => entry.tags))].slice(0, 5);
  return { entries, pressureTags };
}
