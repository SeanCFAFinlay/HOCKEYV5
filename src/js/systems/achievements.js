// Achievement system - track and award player accomplishments
// Integrates with events and storage

import { on, emit, GameEvents } from '../engine/events.js';
import { getState } from '../engine/state.js';
import { addAchievement, hasAchievement, getAchievements, getStats } from './storage.js';

// Achievement definitions
export const ACHIEVEMENTS = {
  // First-time achievements
  FIRST_WIN: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    category: 'beginner'
  },
  FIRST_PERFECT: {
    id: 'first_perfect',
    name: 'Perfect Defense',
    description: 'Win a game without losing any lives',
    icon: '🛡️',
    category: 'beginner'
  },
  TOWER_MASTER: {
    id: 'tower_master',
    name: 'Tower Master',
    description: 'Place 100 towers total',
    icon: '🏗️',
    category: 'progression'
  },
  EXTERMINATOR: {
    id: 'exterminator',
    name: 'Exterminator',
    description: 'Defeat 1000 enemies total',
    icon: '💀',
    category: 'progression'
  },
  MILLIONAIRE: {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Earn 100,000 gold total',
    icon: '💰',
    category: 'progression'
  },

  // Skill achievements
  THREE_STARS: {
    id: 'three_stars',
    name: 'Perfect Rating',
    description: 'Get 3 stars on any map',
    icon: '⭐',
    category: 'skill'
  },
  SPEEDRUNNER: {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Win a game in under 5 minutes',
    icon: '⚡',
    category: 'skill'
  },
  NO_TOWERS_LOST: {
    id: 'no_towers_lost',
    name: 'Indestructible',
    description: 'Win a game without losing any towers',
    icon: '🔒',
    category: 'skill'
  },
  BOSS_SLAYER: {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat 10 bosses',
    icon: '👑',
    category: 'skill'
  },

  // Theme completion
  HOCKEY_MASTER: {
    id: 'hockey_master',
    name: 'Hockey Champion',
    description: 'Complete all Hockey maps',
    icon: '🏒',
    category: 'completion'
  },
  SOCCER_MASTER: {
    id: 'soccer_master',
    name: 'Soccer Champion',
    description: 'Complete all Soccer maps',
    icon: '⚽',
    category: 'completion'
  },
  ALL_STARS_HOCKEY: {
    id: 'all_stars_hockey',
    name: 'Hockey All-Star',
    description: 'Get 3 stars on all Hockey maps',
    icon: '🌟',
    category: 'completion'
  },
  ALL_STARS_SOCCER: {
    id: 'all_stars_soccer',
    name: 'Soccer All-Star',
    description: 'Get 3 stars on all Soccer maps',
    icon: '🌟',
    category: 'completion'
  },

  // Challenge achievements
  MINIMALIST: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Win with only 3 towers placed',
    icon: '🎯',
    category: 'challenge'
  },
  HIGH_SCORE: {
    id: 'high_score',
    name: 'High Scorer',
    description: 'Score over 50,000 in a single game',
    icon: '📈',
    category: 'challenge'
  },
  SURVIVOR: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Win with only 1 life remaining',
    icon: '❤️',
    category: 'challenge'
  }
};

// Session tracking for achievements
let sessionData = {
  towersPlaced: 0,
  towersLost: 0,
  livesLost: 0,
  bossesKilled: 0,
  startTime: 0
};

/**
 * Initialize achievement system
 */
export function initAchievements() {
  // Track game start
  on(GameEvents.GAME_START, () => {
    sessionData = {
      towersPlaced: 0,
      towersLost: 0,
      livesLost: 0,
      bossesKilled: 0,
      startTime: Date.now()
    };
  });

  // Track towers
  on(GameEvents.TOWER_PLACE, () => {
    sessionData.towersPlaced++;
  });

  on(GameEvents.TOWER_DESTROYED, () => {
    sessionData.towersLost++;
  });

  // Track lives
  on(GameEvents.LIVES_CHANGE, () => {
    sessionData.livesLost++;
  });

  // Track enemy deaths for boss tracking
  on(GameEvents.ENEMY_DEATH, ({ enemy }) => {
    if (enemy.boss) {
      sessionData.bossesKilled++;
    }
  });

  // Check achievements on game win
  on(GameEvents.GAME_WIN, ({ score }) => {
    checkWinAchievements(score);
  });

  // Check progression achievements after stat updates
  on(GameEvents.PROGRESSION_UPDATE, ({ grade }) => {
    checkProgressionAchievements(grade);
  });

  console.log('Achievement system initialized');
}

/**
 * Check achievements triggered by winning
 * @param {number} score - Final score
 */
function checkWinAchievements(score) {
  const state = getState();
  const gameTime = Date.now() - sessionData.startTime;

  // First win
  awardIfNew(ACHIEVEMENTS.FIRST_WIN.id);

  // Perfect defense (no lives lost)
  if (sessionData.livesLost === 0) {
    awardIfNew(ACHIEVEMENTS.FIRST_PERFECT.id);
  }

  // No towers lost
  if (sessionData.towersLost === 0) {
    awardIfNew(ACHIEVEMENTS.NO_TOWERS_LOST.id);
  }

  // Speedrunner (under 5 minutes)
  if (gameTime < 5 * 60 * 1000) {
    awardIfNew(ACHIEVEMENTS.SPEEDRUNNER.id);
  }

  // Minimalist (3 or fewer towers)
  if (sessionData.towersPlaced <= 3) {
    awardIfNew(ACHIEVEMENTS.MINIMALIST.id);
  }

  // High score
  if (score >= 50000) {
    awardIfNew(ACHIEVEMENTS.HIGH_SCORE.id);
  }

  // Survivor (exactly 1 life left)
  if (state.lives === 1) {
    awardIfNew(ACHIEVEMENTS.SURVIVOR.id);
  }
}

/**
 * Check achievements based on progression/stats
 * @param {Object} grade - Grade data from progression system
 */
function checkProgressionAchievements(grade) {
  const stats = getStats();

  // Three stars on any map
  if (grade.stars === 3) {
    awardIfNew(ACHIEVEMENTS.THREE_STARS.id);
  }

  // Tower master (100 towers placed)
  if (stats.totalTowersPlaced >= 100) {
    awardIfNew(ACHIEVEMENTS.TOWER_MASTER.id);
  }

  // Exterminator (1000 kills)
  if (stats.totalKills >= 1000) {
    awardIfNew(ACHIEVEMENTS.EXTERMINATOR.id);
  }

  // Millionaire (100k gold)
  if (stats.totalMoneyEarned >= 100000) {
    awardIfNew(ACHIEVEMENTS.MILLIONAIRE.id);
  }

  // Check theme completion (would need to be called with full progress data)
  checkThemeCompletionAchievements();
}

/**
 * Check theme completion achievements
 */
function checkThemeCompletionAchievements() {
  // This would need access to full theme progress
  // For now, emit an event that the UI can use to check
  emit(GameEvents.CHECK_THEME_ACHIEVEMENTS, {});
}

/**
 * Award achievement if not already unlocked
 * @param {string} achievementId - Achievement ID
 * @returns {boolean} Whether achievement was newly awarded
 */
function awardIfNew(achievementId) {
  if (addAchievement(achievementId)) {
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);

    if (achievement) {
      emit(GameEvents.ACHIEVEMENT_UNLOCKED, {
        achievement,
        timestamp: Date.now()
      });
      console.log(`Achievement unlocked: ${achievement.name}`);
    }

    return true;
  }
  return false;
}

/**
 * Manually award an achievement (for special cases)
 * @param {string} achievementId - Achievement ID
 */
export function awardAchievement(achievementId) {
  awardIfNew(achievementId);
}

/**
 * Get all achievements with unlock status
 * @returns {Array} Achievements with unlocked flag
 */
export function getAllAchievements() {
  const unlocked = getAchievements();

  return Object.values(ACHIEVEMENTS).map(achievement => ({
    ...achievement,
    unlocked: unlocked.includes(achievement.id)
  }));
}

/**
 * Get achievements by category
 * @param {string} category - Category name
 * @returns {Array} Achievements in category
 */
export function getAchievementsByCategory(category) {
  return getAllAchievements().filter(a => a.category === category);
}

/**
 * Get achievement progress summary
 * @returns {Object} Progress summary
 */
export function getAchievementProgress() {
  const all = Object.values(ACHIEVEMENTS);
  const unlocked = getAchievements();

  return {
    total: all.length,
    unlocked: unlocked.length,
    percent: Math.round((unlocked.length / all.length) * 100)
  };
}

/**
 * Get specific achievement data
 * @param {string} achievementId - Achievement ID
 * @returns {Object|null} Achievement data or null
 */
export function getAchievement(achievementId) {
  const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
  if (!achievement) return null;

  return {
    ...achievement,
    unlocked: hasAchievement(achievementId)
  };
}

// Add new event types
GameEvents.ACHIEVEMENT_UNLOCKED = 'achievement:unlocked';
GameEvents.CHECK_THEME_ACHIEVEMENTS = 'achievement:check_theme';
