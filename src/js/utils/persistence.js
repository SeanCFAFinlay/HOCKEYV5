// Persistence utilities - localStorage-backed progression
// Schema is versioned to safely handle future changes.
//
// Storage key: 'hockeyTD_v1'
// Schema v1:
//   bestScores: { [themeKey_mapIndex]: number }  — high score per map
//   bestWaves:  { [themeKey_mapIndex]: number }  — best wave reached per map
//   settings:   { quality: 'auto'|'low'|'high', sfx: bool }

const STORAGE_KEY = 'hockeyTD_v1';
const SCHEMA_VERSION = 1;

/**
 * Load persisted data, returning defaults if missing or corrupt.
 * @returns {Object} Save data
 */
export function loadSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaults();

    const parsed = JSON.parse(raw);

    // Version migration: add new keys without breaking old saves
    if (!parsed.version || parsed.version < SCHEMA_VERSION) {
      return migrateData(parsed);
    }

    return parsed;
  } catch (e) {
    console.warn('[Persistence] Failed to load save data, using defaults.', e);
    return createDefaults();
  }
}

/**
 * Save data to localStorage.
 * @param {Object} data - Save data object (as returned by loadSaveData)
 */
export function saveSaveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: SCHEMA_VERSION }));
  } catch (e) {
    console.warn('[Persistence] Failed to write save data.', e);
  }
}

/**
 * Record a completed run and persist if it's a new best.
 * @param {string} theme - 'hockey' or 'soccer'
 * @param {number} mapIndex - Map index (0-9)
 * @param {number} score - Run score
 * @param {number} wave - Wave reached
 * @returns {{ newBestScore: boolean, newBestWave: boolean }}
 */
export function recordRun(theme, mapIndex, score, wave) {
  const data = loadSaveData();
  const key = `${theme}_${mapIndex}`;

  const prevScore = data.bestScores[key] ?? 0;
  const prevWave  = data.bestWaves[key]  ?? 0;

  const newBestScore = score > prevScore;
  const newBestWave  = wave  > prevWave;

  if (newBestScore) data.bestScores[key] = score;
  if (newBestWave)  data.bestWaves[key]  = wave;

  saveSaveData(data);
  return { newBestScore, newBestWave };
}

/**
 * Get the best score for a specific map.
 * @param {string} theme
 * @param {number} mapIndex
 * @returns {number}
 */
export function getBestScore(theme, mapIndex) {
  const data = loadSaveData();
  return data.bestScores[`${theme}_${mapIndex}`] ?? 0;
}

/**
 * Get the best wave reached for a specific map.
 * @param {string} theme
 * @param {number} mapIndex
 * @returns {number}
 */
export function getBestWave(theme, mapIndex) {
  const data = loadSaveData();
  return data.bestWaves[`${theme}_${mapIndex}`] ?? 0;
}

/**
 * Load persisted settings.
 * @returns {{ quality: string, sfx: boolean }}
 */
export function loadSettings() {
  return loadSaveData().settings;
}

/**
 * Persist a settings change.
 * @param {Object} updates - Partial settings object
 */
export function saveSettings(updates) {
  const data = loadSaveData();
  data.settings = { ...data.settings, ...updates };
  saveSaveData(data);
}

// --- Internal helpers ---

function createDefaults() {
  return {
    version: SCHEMA_VERSION,
    bestScores: {},
    bestWaves: {},
    settings: { quality: 'auto', sfx: true }
  };
}

function migrateData(old) {
  const defaults = createDefaults();
  // Preserve any valid existing keys
  if (old.bestScores && typeof old.bestScores === 'object') {
    defaults.bestScores = old.bestScores;
  }
  if (old.bestWaves && typeof old.bestWaves === 'object') {
    defaults.bestWaves = old.bestWaves;
  }
  if (old.settings && typeof old.settings === 'object') {
    defaults.settings = { ...defaults.settings, ...old.settings };
  }
  return defaults;
}
