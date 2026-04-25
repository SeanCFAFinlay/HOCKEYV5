// Persistent storage system using localStorage
// Handles save/load with versioning and migration

const STORAGE_KEY = 'hockeyvssoccer_td';
const STORAGE_VERSION = 1;

// Default save data structure
const DEFAULT_SAVE = {
  version: STORAGE_VERSION,
  progression: {
    hockey: {},  // { mapIndex: { stars: 0-3, bestScore: 0, completed: false } }
    soccer: {}
  },
  achievements: [],  // Array of achievement IDs
  stats: {
    totalKills: 0,
    totalScore: 0,
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    totalTowersPlaced: 0,
    totalMoneyEarned: 0,
    playTime: 0  // seconds
  },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 1.0,
    showDamageNumbers: true,
    showRangeIndicators: true,
    autoWaveDefault: false,
    defaultGameSpeed: 1
  },
  lastPlayed: null
};

// Current save data (cached in memory)
let saveData = null;

/**
 * Initialize storage system - load existing save or create new
 * @returns {Object} Current save data
 */
export function initStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      // Check version and migrate if needed
      if (parsed.version !== STORAGE_VERSION) {
        saveData = migrateSaveData(parsed);
        persistSave();
      } else {
        saveData = parsed;
      }
    } else {
      saveData = { ...DEFAULT_SAVE };
      persistSave();
    }

    // Migrate data from legacy persistence systems
    migrateLegacyStorage();
  } catch (err) {
    console.warn('Failed to load save data, creating new save:', err);
    saveData = { ...DEFAULT_SAVE };
    persistSave();
  }

  return saveData;
}

/**
 * One-time migration from legacy persistence.js (hockeyTD_v1)
 * and highscores.js (hockeyVsSoccerTD_highscores) into unified storage.
 * Merges best scores/waves, then removes legacy keys.
 */
function migrateLegacyStorage() {
  let dirty = false;

  // Migrate from legacy persistence.js (key: 'hockeyTD_v1')
  try {
    const legacyRaw = localStorage.getItem('hockeyTD_v1');
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy.bestScores) {
        for (const [key, score] of Object.entries(legacy.bestScores)) {
          const [theme, mapIdx] = key.split('_');
          const idx = parseInt(mapIdx, 10);
          if (!isNaN(idx)) {
            const existing = saveData.progression[theme]?.[idx];
            if (!existing || score > (existing.bestScore || 0)) {
              if (!saveData.progression[theme]) saveData.progression[theme] = {};
              saveData.progression[theme][idx] = {
                ...( existing || { stars: 0, completed: false }),
                bestScore: Math.max(score, existing?.bestScore || 0)
              };
              dirty = true;
            }
          }
        }
      }
      localStorage.removeItem('hockeyTD_v1');
      console.log('[Storage] Migrated legacy persistence.js data');
    }
  } catch (e) {
    console.warn('[Storage] Failed to migrate legacy persistence data:', e);
  }

  // Migrate from legacy highscores.js (key: 'hockeyVsSoccerTD_highscores')
  try {
    const hsRaw = localStorage.getItem('hockeyVsSoccerTD_highscores');
    if (hsRaw) {
      const hs = JSON.parse(hsRaw);
      for (const [key, entry] of Object.entries(hs)) {
        const theme = entry.theme || key.split('_')[0];
        const idx = entry.mapIndex ?? parseInt(key.split('_')[1], 10);
        if (!isNaN(idx) && theme) {
          const existing = saveData.progression[theme]?.[idx];
          const bestScore = Math.max(entry.score || 0, existing?.bestScore || 0);
          if (!saveData.progression[theme]) saveData.progression[theme] = {};
          saveData.progression[theme][idx] = {
            ...( existing || { stars: 0, completed: false }),
            bestScore,
            completed: existing?.completed || false
          };
          dirty = true;
        }
      }
      localStorage.removeItem('hockeyVsSoccerTD_highscores');
      console.log('[Storage] Migrated legacy highscores.js data');
    }
  } catch (e) {
    console.warn('[Storage] Failed to migrate legacy highscores data:', e);
  }

  if (dirty) persistSave();
}

/**
 * Get current save data (initializes if needed)
 * @returns {Object} Current save data
 */
export function getSaveData() {
  if (!saveData) {
    initStorage();
  }
  return saveData;
}

/**
 * Persist save data to localStorage
 */
function persistSave() {
  try {
    saveData.lastPlayed = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (err) {
    console.error('Failed to save game data:', err);
  }
}

/**
 * Migrate save data from older version
 * @param {Object} oldData - Old save data
 * @returns {Object} Migrated save data
 */
function migrateSaveData(oldData) {
  console.log(`Migrating save data from v${oldData.version} to v${STORAGE_VERSION}`);

  // Start with default structure
  const newData = { ...DEFAULT_SAVE };

  // Preserve what we can from old data
  if (oldData.progression) newData.progression = oldData.progression;
  if (oldData.achievements) newData.achievements = oldData.achievements;
  if (oldData.stats) newData.stats = { ...DEFAULT_SAVE.stats, ...oldData.stats };
  if (oldData.settings) newData.settings = { ...DEFAULT_SAVE.settings, ...oldData.settings };

  newData.version = STORAGE_VERSION;
  return newData;
}

/**
 * Save map completion data
 * @param {string} theme - Theme name ('hockey' or 'soccer')
 * @param {number} mapIndex - Map index
 * @param {number} score - Final score
 * @param {number} stars - Stars earned (1-3)
 * @param {boolean} completed - Whether map was completed (won)
 */
export function saveMapCompletion(theme, mapIndex, score, stars, completed) {
  const data = getSaveData();

  if (!data.progression[theme]) {
    data.progression[theme] = {};
  }

  const existing = data.progression[theme][mapIndex] || {
    stars: 0,
    bestScore: 0,
    completed: false
  };

  // Only update if better
  data.progression[theme][mapIndex] = {
    stars: Math.max(existing.stars, stars),
    bestScore: Math.max(existing.bestScore, score),
    completed: existing.completed || completed
  };

  persistSave();
}

/**
 * Get map progress for a theme
 * @param {string} theme - Theme name
 * @param {number} mapIndex - Map index
 * @returns {Object|null} Map progress or null if not played
 */
export function getMapProgress(theme, mapIndex) {
  const data = getSaveData();
  return data.progression[theme]?.[mapIndex] || null;
}

/**
 * Check if a map is unlocked
 * @param {string} theme - Theme name
 * @param {number} mapIndex - Map index
 * @returns {boolean} Whether map is unlocked
 */
export function isMapUnlocked(theme, mapIndex) {
  // First map is always unlocked
  if (mapIndex === 0) return true;

  // Other maps require previous map to be completed
  const prevProgress = getMapProgress(theme, mapIndex - 1);
  return prevProgress?.completed === true;
}

/**
 * Get total stars for a theme
 * @param {string} theme - Theme name
 * @returns {number} Total stars earned
 */
export function getTotalStars(theme) {
  const data = getSaveData();
  const themeProgress = data.progression[theme] || {};

  return Object.values(themeProgress).reduce((sum, map) => sum + (map.stars || 0), 0);
}

/**
 * Update global stats
 * @param {Object} updates - Stats to update { statName: valueToAdd }
 */
export function updateStats(updates) {
  const data = getSaveData();

  for (const [key, value] of Object.entries(updates)) {
    if (key in data.stats) {
      data.stats[key] += value;
    }
  }

  persistSave();
}

/**
 * Get global stats
 * @returns {Object} Current stats
 */
export function getStats() {
  return getSaveData().stats;
}

/**
 * Add achievement
 * @param {string} achievementId - Achievement identifier
 * @returns {boolean} Whether achievement was newly added
 */
export function addAchievement(achievementId) {
  const data = getSaveData();

  if (data.achievements.includes(achievementId)) {
    return false;  // Already have this achievement
  }

  data.achievements.push(achievementId);
  persistSave();
  return true;
}

/**
 * Check if achievement is unlocked
 * @param {string} achievementId - Achievement identifier
 * @returns {boolean} Whether achievement is unlocked
 */
export function hasAchievement(achievementId) {
  return getSaveData().achievements.includes(achievementId);
}

/**
 * Get all unlocked achievements
 * @returns {string[]} Array of achievement IDs
 */
export function getAchievements() {
  return getSaveData().achievements;
}

/**
 * Update a setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
export function setSetting(key, value) {
  const data = getSaveData();

  if (key in data.settings) {
    data.settings[key] = value;
    persistSave();
  }
}

/**
 * Get a setting value
 * @param {string} key - Setting key
 * @returns {*} Setting value or undefined
 */
export function getSetting(key) {
  return getSaveData().settings[key];
}

/**
 * Get all settings
 * @returns {Object} All settings
 */
export function getSettings() {
  return getSaveData().settings;
}

/**
 * Reset all progress (for testing or user request)
 */
export function resetAllProgress() {
  saveData = { ...DEFAULT_SAVE };
  persistSave();
  console.log('All progress has been reset');
}

/**
 * Export save data as JSON string
 * @returns {string} JSON save data
 */
export function exportSaveData() {
  return JSON.stringify(getSaveData(), null, 2);
}

/**
 * Import save data from JSON string
 * @param {string} jsonStr - JSON save data
 * @returns {boolean} Whether import was successful
 */
export function importSaveData(jsonStr) {
  try {
    const imported = JSON.parse(jsonStr);

    // Basic validation
    if (!imported.version || !imported.progression) {
      throw new Error('Invalid save data format');
    }

    // Migrate if needed
    if (imported.version !== STORAGE_VERSION) {
      saveData = migrateSaveData(imported);
    } else {
      saveData = imported;
    }

    persistSave();
    return true;
  } catch (err) {
    console.error('Failed to import save data:', err);
    return false;
  }
}
