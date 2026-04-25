// High score system using localStorage
// Tracks best scores per theme/map combination

const STORAGE_KEY = 'hockeyVsSoccerTD_highscores';

/**
 * Get all high scores from localStorage
 * @returns {Object} High scores object
 */
function getHighScores() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.warn('Failed to load high scores:', e);
    return {};
  }
}

/**
 * Save high scores to localStorage
 * @param {Object} scores - High scores object
 */
function saveHighScores(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.warn('Failed to save high scores:', e);
  }
}

/**
 * Get high score for a specific theme/map
 * @param {string} theme - Theme name (hockey/soccer)
 * @param {number} mapIndex - Map index
 * @returns {Object|null} High score entry or null
 */
export function getHighScore(theme, mapIndex) {
  const scores = getHighScores();
  const key = `${theme}_${mapIndex}`;
  return scores[key] || null;
}

/**
 * Check if current score beats the high score
 * @param {string} theme - Theme name
 * @param {number} mapIndex - Map index
 * @param {number} wave - Wave reached
 * @param {number} score - Score achieved
 * @returns {boolean} True if new high score
 */
export function isHighScore(theme, mapIndex, wave, score) {
  const current = getHighScore(theme, mapIndex);
  if (!current) return true;
  
  // Higher wave = better, or same wave with higher score
  return wave > current.wave || (wave === current.wave && score > current.score);
}

/**
 * Save a new high score
 * @param {string} theme - Theme name
 * @param {number} mapIndex - Map index
 * @param {number} wave - Wave reached
 * @param {number} score - Score achieved
 * @param {string} mapName - Map name
 * @returns {boolean} True if saved successfully
 */
export function saveHighScore(theme, mapIndex, wave, score, mapName) {
  if (!isHighScore(theme, mapIndex, wave, score)) {
    return false;
  }

  const scores = getHighScores();
  const key = `${theme}_${mapIndex}`;
  
  scores[key] = {
    theme,
    mapIndex,
    mapName,
    wave,
    score,
    date: new Date().toISOString()
  };

  saveHighScores(scores);
  return true;
}

/**
 * Get all high scores sorted by score
 * @returns {Array} Array of high score entries
 */
export function getAllHighScores() {
  const scores = getHighScores();
  return Object.values(scores).sort((a, b) => {
    if (b.wave !== a.wave) return b.wave - a.wave;
    return b.score - a.score;
  });
}

/**
 * Clear all high scores
 */
export function clearHighScores() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear high scores:', e);
  }
}
