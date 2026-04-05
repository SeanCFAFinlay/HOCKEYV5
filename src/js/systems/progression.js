// Progression system - map completion grading, unlocks, and rewards
// Integrates with storage and events

import { on, emit, GameEvents } from '../engine/events.js';
import { getState } from '../engine/state.js';
import {
  saveMapCompletion,
  getMapProgress,
  isMapUnlocked,
  getTotalStars,
  updateStats
} from './storage.js';

// Star thresholds (percentage of max possible score)
const STAR_THRESHOLDS = {
  1: 0.3,   // 30% of max score = 1 star
  2: 0.6,   // 60% of max score = 2 stars
  3: 0.9    // 90% of max score = 3 stars
};

// Bonus multipliers for grading
const GRADING_BONUSES = {
  NO_LIVES_LOST: 1.5,      // Perfect defense bonus
  FAST_CLEAR: 1.2,         // Cleared quickly bonus
  NO_TOWERS_LOST: 1.1,     // All towers survived
  UNDER_BUDGET: 1.1        // Didn't spend all money
};

// Track game session stats for grading
let sessionStats = {
  startLives: 0,
  livesLost: 0,
  towersLost: 0,
  towersPlaced: 0,
  moneyEarned: 0,
  startTime: 0,
  endTime: 0
};

/**
 * Initialize progression system - set up event listeners
 */
export function initProgression() {
  // Track game start
  on(GameEvents.GAME_START, ({ theme, map, waves }) => {
    const state = getState();
    sessionStats = {
      startLives: state.lives,
      livesLost: 0,
      towersLost: 0,
      towersPlaced: 0,
      moneyEarned: 0,
      startTime: Date.now(),
      endTime: 0
    };
  });

  // Track lives lost
  on(GameEvents.LIVES_CHANGE, ({ lives }) => {
    const state = getState();
    if (lives < state.lives) {
      sessionStats.livesLost++;
    }
  });

  // Track towers placed
  on(GameEvents.TOWER_PLACE, () => {
    sessionStats.towersPlaced++;
  });

  // Track towers lost
  on(GameEvents.TOWER_DESTROYED, () => {
    sessionStats.towersLost++;
  });

  // Track money earned
  on(GameEvents.MONEY_CHANGE, ({ delta }) => {
    if (delta > 0) {
      sessionStats.moneyEarned += delta;
    }
  });

  // Handle game win
  on(GameEvents.GAME_WIN, ({ score, wave }) => {
    sessionStats.endTime = Date.now();
    handleGameComplete(true, score);
  });

  // Handle game lose
  on(GameEvents.GAME_LOSE, ({ score, wave }) => {
    sessionStats.endTime = Date.now();
    handleGameComplete(false, score);
  });

  console.log('Progression system initialized');
}

/**
 * Handle game completion (win or lose)
 * @param {boolean} won - Whether player won
 * @param {number} score - Final score
 */
function handleGameComplete(won, score) {
  const state = getState();
  const { theme, mapIndex, mapData, kills } = state;

  // Calculate grade
  const grade = calculateGrade(score, mapData, won);

  // Save progress
  saveMapCompletion(theme, mapIndex, score, grade.stars, won);

  // Update global stats
  updateStats({
    totalKills: kills || 0,
    totalScore: score,
    totalGamesPlayed: 1,
    totalGamesWon: won ? 1 : 0,
    totalTowersPlaced: sessionStats.towersPlaced,
    totalMoneyEarned: sessionStats.moneyEarned
  });

  // Emit progression event with grade details
  emit(GameEvents.PROGRESSION_UPDATE, {
    theme,
    mapIndex,
    won,
    score,
    grade,
    sessionStats,
    newRecord: grade.isNewRecord
  });

  // Check for newly unlocked map
  if (won && mapIndex + 1 < state.themeData.maps.length) {
    const nextMapUnlocked = isMapUnlocked(theme, mapIndex + 1);
    if (nextMapUnlocked) {
      emit(GameEvents.MAP_UNLOCKED, {
        theme,
        mapIndex: mapIndex + 1,
        mapName: state.themeData.maps[mapIndex + 1].name
      });
    }
  }
}

/**
 * Calculate grade based on score and bonuses
 * @param {number} score - Final score
 * @param {Object} mapData - Map configuration
 * @param {boolean} won - Whether player won
 * @returns {Object} Grade details
 */
function calculateGrade(score, mapData, won) {
  // Base max score estimation (rough heuristic)
  const baseMaxScore = mapData.waves * 500 + mapData.lives * 100;

  // Calculate bonuses
  let multiplier = 1.0;
  const bonuses = [];

  if (sessionStats.livesLost === 0 && won) {
    multiplier *= GRADING_BONUSES.NO_LIVES_LOST;
    bonuses.push('Perfect Defense');
  }

  if (sessionStats.towersLost === 0 && won) {
    multiplier *= GRADING_BONUSES.NO_TOWERS_LOST;
    bonuses.push('No Towers Lost');
  }

  // Adjusted score with bonuses
  const adjustedScore = score * multiplier;

  // Calculate star rating
  let stars = 0;
  if (won) {
    const ratio = adjustedScore / baseMaxScore;
    if (ratio >= STAR_THRESHOLDS[3]) stars = 3;
    else if (ratio >= STAR_THRESHOLDS[2]) stars = 2;
    else if (ratio >= STAR_THRESHOLDS[1]) stars = 1;
    else stars = 1;  // Minimum 1 star for winning
  }

  // Check if new record
  const state = getState();
  const existing = getMapProgress(state.theme, state.mapIndex);
  const isNewRecord = !existing || score > existing.bestScore;
  const isNewStars = !existing || stars > existing.stars;

  return {
    stars,
    adjustedScore: Math.floor(adjustedScore),
    multiplier,
    bonuses,
    isNewRecord,
    isNewStars,
    timeTaken: sessionStats.endTime - sessionStats.startTime
  };
}

/**
 * Get display data for map selection screen
 * @param {string} theme - Theme name
 * @param {Array} maps - Array of map configs
 * @returns {Array} Maps with progress info
 */
export function getMapsWithProgress(theme, maps) {
  return maps.map((map, index) => {
    const progress = getMapProgress(theme, index);
    const unlocked = isMapUnlocked(theme, index);

    return {
      ...map,
      index,
      unlocked,
      completed: progress?.completed || false,
      stars: progress?.stars || 0,
      bestScore: progress?.bestScore || 0
    };
  });
}

/**
 * Get total progress for a theme
 * @param {string} theme - Theme name
 * @param {number} totalMaps - Total maps in theme
 * @returns {Object} Progress summary
 */
export function getThemeProgress(theme, totalMaps) {
  const stars = getTotalStars(theme);
  const maxStars = totalMaps * 3;

  let completedMaps = 0;
  for (let i = 0; i < totalMaps; i++) {
    const progress = getMapProgress(theme, i);
    if (progress?.completed) completedMaps++;
  }

  return {
    stars,
    maxStars,
    completedMaps,
    totalMaps,
    percentComplete: Math.round((completedMaps / totalMaps) * 100)
  };
}

/**
 * Get star rating display (for UI)
 * @param {number} stars - Star count (0-3)
 * @param {number} maxStars - Maximum stars (default 3)
 * @returns {string} Star display string
 */
export function getStarDisplay(stars, maxStars = 3) {
  const filled = '★'.repeat(stars);
  const empty = '☆'.repeat(maxStars - stars);
  return filled + empty;
}

// Add new event types
GameEvents.PROGRESSION_UPDATE = 'progression:update';
GameEvents.MAP_UNLOCKED = 'progression:map_unlocked';
