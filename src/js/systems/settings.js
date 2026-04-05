// Game settings system
// Manages user preferences with persistence

import { getSetting, setSetting, getSettings } from './storage.js';
import { emit, GameEvents } from '../engine/events.js';

// Default settings (also defined in storage.js but duplicated for reference)
const SETTING_DEFAULTS = {
  musicVolume: 0.7,
  sfxVolume: 1.0,
  showDamageNumbers: true,
  showRangeIndicators: true,
  autoWaveDefault: false,
  defaultGameSpeed: 1
};

// Setting metadata for UI generation
export const SETTING_METADATA = {
  musicVolume: {
    label: 'Music Volume',
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    category: 'audio'
  },
  sfxVolume: {
    label: 'Sound Effects',
    type: 'slider',
    min: 0,
    max: 1,
    step: 0.1,
    category: 'audio'
  },
  showDamageNumbers: {
    label: 'Show Damage Numbers',
    type: 'toggle',
    category: 'gameplay'
  },
  showRangeIndicators: {
    label: 'Show Range Indicators',
    type: 'toggle',
    category: 'gameplay'
  },
  autoWaveDefault: {
    label: 'Auto-Wave by Default',
    type: 'toggle',
    category: 'gameplay'
  },
  defaultGameSpeed: {
    label: 'Default Game Speed',
    type: 'select',
    options: [
      { value: 1, label: '1x (Normal)' },
      { value: 2, label: '2x (Fast)' },
      { value: 3, label: '3x (Faster)' }
    ],
    category: 'gameplay'
  }
};

/**
 * Get a setting value
 * @param {string} key - Setting key
 * @returns {*} Setting value
 */
export function get(key) {
  const value = getSetting(key);
  return value !== undefined ? value : SETTING_DEFAULTS[key];
}

/**
 * Set a setting value
 * @param {string} key - Setting key
 * @param {*} value - New value
 */
export function set(key, value) {
  setSetting(key, value);

  // Emit event for reactive updates
  emit(GameEvents.SETTING_CHANGED, { key, value });

  // Apply setting immediately if applicable
  applySettingImmediately(key, value);
}

/**
 * Apply certain settings immediately
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
function applySettingImmediately(key, value) {
  switch (key) {
    case 'musicVolume':
      // Would control music volume if music system exists
      break;
    case 'sfxVolume':
      // Would control SFX volume if audio system exists
      break;
  }
}

/**
 * Get all settings
 * @returns {Object} All settings
 */
export function getAll() {
  const stored = getSettings();
  return { ...SETTING_DEFAULTS, ...stored };
}

/**
 * Reset all settings to defaults
 */
export function resetToDefaults() {
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    setSetting(key, value);
  }

  emit(GameEvents.SETTINGS_RESET, { settings: SETTING_DEFAULTS });
}

/**
 * Get settings grouped by category
 * @returns {Object} Settings by category
 */
export function getByCategory() {
  const all = getAll();
  const categories = {};

  for (const [key, meta] of Object.entries(SETTING_METADATA)) {
    const category = meta.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      key,
      value: all[key],
      ...meta
    });
  }

  return categories;
}

/**
 * Validate a setting value
 * @param {string} key - Setting key
 * @param {*} value - Value to validate
 * @returns {boolean} Whether value is valid
 */
export function isValidValue(key, value) {
  const meta = SETTING_METADATA[key];
  if (!meta) return false;

  switch (meta.type) {
    case 'slider':
      return typeof value === 'number' && value >= meta.min && value <= meta.max;
    case 'toggle':
      return typeof value === 'boolean';
    case 'select':
      return meta.options.some(opt => opt.value === value);
    default:
      return true;
  }
}

// Add new event types
GameEvents.SETTING_CHANGED = 'settings:changed';
GameEvents.SETTINGS_RESET = 'settings:reset';
