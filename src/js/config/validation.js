// Config validation module
// Validates all game configuration at startup to catch errors early

import { MapLayout } from './maps.js';

// Valid tower roles
const VALID_TOWER_ROLES = [
  'ANTI-SWARM', 'SNIPER', 'SPLASH', 'CROWD_CONTROL',
  'CHOKEPOINT', 'CHAIN', 'DOT', 'BOSS_KILLER'
];

// Valid enemy roles
const VALID_ENEMY_ROLES = [
  'SWARM', 'FIRE', 'FLYING', 'ARMORED',
  'ELITE', 'FLYING_FIRE', 'BOSS'
];

// Valid map layouts
const VALID_LAYOUTS = Object.values(MapLayout);

// Validation error class
class ConfigError extends Error {
  constructor(category, item, field, message) {
    super(`[${category}] ${item}: ${field} - ${message}`);
    this.category = category;
    this.item = item;
    this.field = field;
  }
}

/**
 * Validate a single tower config
 * @param {Object} tower - Tower config object
 * @param {string} themeName - Theme name for error messages
 * @returns {Array} Array of error messages
 */
function validateTower(tower, themeName) {
  const errors = [];
  const name = tower.nm || tower.id || 'Unknown';
  const prefix = `${themeName} tower "${name}"`;

  // Required string fields
  if (!tower.id || typeof tower.id !== 'string') {
    errors.push(`${prefix}: missing or invalid 'id'`);
  }
  if (!tower.nm || typeof tower.nm !== 'string') {
    errors.push(`${prefix}: missing or invalid 'nm' (name)`);
  }
  if (!tower.icon || typeof tower.icon !== 'string') {
    errors.push(`${prefix}: missing or invalid 'icon'`);
  }

  // Required numeric fields
  if (typeof tower.cost !== 'number' || tower.cost <= 0) {
    errors.push(`${prefix}: 'cost' must be a positive number`);
  }

  // Validate role
  if (!tower.role || !VALID_TOWER_ROLES.includes(tower.role)) {
    errors.push(`${prefix}: invalid 'role' "${tower.role}". Valid: ${VALID_TOWER_ROLES.join(', ')}`);
  }

  // Validate stat arrays (must have 4 levels)
  const statArrays = ['dmg', 'rng', 'rate'];
  for (const stat of statArrays) {
    if (!Array.isArray(tower[stat])) {
      errors.push(`${prefix}: '${stat}' must be an array`);
    } else if (tower[stat].length !== 4) {
      errors.push(`${prefix}: '${stat}' must have exactly 4 levels, has ${tower[stat].length}`);
    } else {
      // Check values are numbers and increasing (except rate which can vary)
      for (let i = 0; i < tower[stat].length; i++) {
        if (typeof tower[stat][i] !== 'number' || tower[stat][i] <= 0) {
          errors.push(`${prefix}: '${stat}[${i}]' must be a positive number`);
        }
      }
    }
  }

  // Validate upgrade costs (must have 3 levels)
  if (!Array.isArray(tower.up)) {
    errors.push(`${prefix}: 'up' (upgrade costs) must be an array`);
  } else if (tower.up.length !== 3) {
    errors.push(`${prefix}: 'up' must have exactly 3 upgrade costs, has ${tower.up.length}`);
  } else {
    for (let i = 0; i < tower.up.length; i++) {
      if (typeof tower.up[i] !== 'number' || tower.up[i] <= 0) {
        errors.push(`${prefix}: 'up[${i}]' must be a positive number`);
      }
    }
  }

  // Validate optional stat arrays (splash, slowDur, chain, burn)
  const optionalArrays = ['splash', 'slowDur', 'chain', 'burn'];
  for (const stat of optionalArrays) {
    if (tower[stat] !== undefined) {
      if (!Array.isArray(tower[stat])) {
        errors.push(`${prefix}: '${stat}' must be an array if present`);
      } else if (tower[stat].length !== 4) {
        errors.push(`${prefix}: '${stat}' must have exactly 4 levels, has ${tower[stat].length}`);
      }
    }
  }

  // Color validation
  if (!tower.clr || typeof tower.clr !== 'string') {
    errors.push(`${prefix}: missing or invalid 'clr' (color)`);
  }

  return errors;
}

/**
 * Validate a single enemy config
 * @param {Object} enemy - Enemy config object
 * @param {string} themeName - Theme name for error messages
 * @returns {Array} Array of error messages
 */
function validateEnemy(enemy, themeName) {
  const errors = [];
  const name = enemy.nm || enemy.id || 'Unknown';
  const prefix = `${themeName} enemy "${name}"`;

  // Required string fields
  if (!enemy.id || typeof enemy.id !== 'string') {
    errors.push(`${prefix}: missing or invalid 'id'`);
  }
  if (!enemy.nm || typeof enemy.nm !== 'string') {
    errors.push(`${prefix}: missing or invalid 'nm' (name)`);
  }

  // Validate role
  if (!enemy.role || !VALID_ENEMY_ROLES.includes(enemy.role)) {
    errors.push(`${prefix}: invalid 'role' "${enemy.role}". Valid: ${VALID_ENEMY_ROLES.join(', ')}`);
  }

  // Required numeric fields with ranges
  if (typeof enemy.hp !== 'number' || enemy.hp <= 0) {
    errors.push(`${prefix}: 'hp' must be a positive number`);
  }
  if (typeof enemy.spd !== 'number' || enemy.spd <= 0) {
    errors.push(`${prefix}: 'spd' must be a positive number`);
  }
  if (typeof enemy.rwd !== 'number' || enemy.rwd <= 0) {
    errors.push(`${prefix}: 'rwd' (reward) must be a positive number`);
  }

  // Optional numeric fields
  if (enemy.sz !== undefined && (typeof enemy.sz !== 'number' || enemy.sz <= 0)) {
    errors.push(`${prefix}: 'sz' (size) must be a positive number if present`);
  }
  if (enemy.armor !== undefined && (typeof enemy.armor !== 'number' || enemy.armor < 0 || enemy.armor >= 1)) {
    errors.push(`${prefix}: 'armor' must be between 0 and 1 if present`);
  }

  // Boolean flags
  if (enemy.fire !== undefined && typeof enemy.fire !== 'boolean') {
    errors.push(`${prefix}: 'fire' must be a boolean if present`);
  }
  if (enemy.flying !== undefined && typeof enemy.flying !== 'boolean') {
    errors.push(`${prefix}: 'flying' must be a boolean if present`);
  }
  if (enemy.boss !== undefined && typeof enemy.boss !== 'boolean') {
    errors.push(`${prefix}: 'boss' must be a boolean if present`);
  }

  return errors;
}

/**
 * Validate a single map config
 * @param {Object} map - Map config object
 * @param {string} themeName - Theme name for error messages
 * @param {number} index - Map index
 * @returns {Array} Array of error messages
 */
function validateMap(map, themeName, index) {
  const errors = [];
  const name = map.name || `Map ${index}`;
  const prefix = `${themeName} map "${name}"`;

  // Required string fields
  if (!map.name || typeof map.name !== 'string') {
    errors.push(`${prefix}: missing or invalid 'name'`);
  }

  // Required numeric fields with ranges
  if (typeof map.cols !== 'number' || map.cols < 10 || map.cols > 50) {
    errors.push(`${prefix}: 'cols' must be between 10 and 50`);
  }
  if (typeof map.rows !== 'number' || map.rows < 8 || map.rows > 30) {
    errors.push(`${prefix}: 'rows' must be between 8 and 30`);
  }
  if (typeof map.waves !== 'number' || map.waves < 5 || map.waves > 100) {
    errors.push(`${prefix}: 'waves' must be between 5 and 100`);
  }
  if (typeof map.money !== 'number' || map.money < 100) {
    errors.push(`${prefix}: 'money' must be at least 100`);
  }
  if (typeof map.lives !== 'number' || map.lives < 1 || map.lives > 50) {
    errors.push(`${prefix}: 'lives' must be between 1 and 50`);
  }
  if (typeof map.diff !== 'number' || map.diff < 1 || map.diff > 10) {
    errors.push(`${prefix}: 'diff' (difficulty) must be between 1 and 10`);
  }

  // Validate layout
  if (!map.layout || !VALID_LAYOUTS.includes(map.layout)) {
    errors.push(`${prefix}: invalid 'layout' "${map.layout}". Valid: ${VALID_LAYOUTS.join(', ')}`);
  }

  // Validate spawns
  if (typeof map.spawns !== 'number' || map.spawns < 1 || map.spawns > 6) {
    errors.push(`${prefix}: 'spawns' must be between 1 and 6`);
  }

  return errors;
}

/**
 * Validate a complete theme config
 * @param {string} themeName - Theme key
 * @param {Object} theme - Theme config object
 * @returns {Array} Array of error messages
 */
function validateTheme(themeName, theme) {
  const errors = [];
  const prefix = `Theme "${themeName}"`;

  // Required fields
  if (!theme.name || typeof theme.name !== 'string') {
    errors.push(`${prefix}: missing or invalid 'name'`);
  }
  if (!theme.icon || typeof theme.icon !== 'string') {
    errors.push(`${prefix}: missing or invalid 'icon'`);
  }
  if (!theme.color || typeof theme.color !== 'string') {
    errors.push(`${prefix}: missing or invalid 'color'`);
  }

  // Validate colors are numbers (Three.js hex)
  if (typeof theme.groundColor !== 'number') {
    errors.push(`${prefix}: 'groundColor' must be a hex number`);
  }
  if (typeof theme.pathColor !== 'number') {
    errors.push(`${prefix}: 'pathColor' must be a hex number`);
  }
  if (typeof theme.envColor !== 'number') {
    errors.push(`${prefix}: 'envColor' must be a hex number`);
  }

  // Validate arrays exist
  if (!Array.isArray(theme.towers)) {
    errors.push(`${prefix}: 'towers' must be an array`);
  } else if (theme.towers.length < 1) {
    errors.push(`${prefix}: must have at least 1 tower`);
  } else {
    // Validate each tower
    for (const tower of theme.towers) {
      errors.push(...validateTower(tower, themeName));
    }

    // Check for duplicate tower IDs
    const towerIds = theme.towers.map(t => t.id);
    const duplicateTowers = towerIds.filter((id, i) => towerIds.indexOf(id) !== i);
    if (duplicateTowers.length > 0) {
      errors.push(`${prefix}: duplicate tower IDs: ${duplicateTowers.join(', ')}`);
    }
  }

  if (!Array.isArray(theme.enemies)) {
    errors.push(`${prefix}: 'enemies' must be an array`);
  } else if (theme.enemies.length < 1) {
    errors.push(`${prefix}: must have at least 1 enemy`);
  } else {
    // Validate each enemy
    for (const enemy of theme.enemies) {
      errors.push(...validateEnemy(enemy, themeName));
    }

    // Check for duplicate enemy IDs
    const enemyIds = theme.enemies.map(e => e.id);
    const duplicateEnemies = enemyIds.filter((id, i) => enemyIds.indexOf(id) !== i);
    if (duplicateEnemies.length > 0) {
      errors.push(`${prefix}: duplicate enemy IDs: ${duplicateEnemies.join(', ')}`);
    }
  }

  if (!Array.isArray(theme.maps)) {
    errors.push(`${prefix}: 'maps' must be an array`);
  } else if (theme.maps.length < 1) {
    errors.push(`${prefix}: must have at least 1 map`);
  } else {
    // Validate each map
    theme.maps.forEach((map, index) => {
      errors.push(...validateMap(map, themeName, index));
    });
  }

  return errors;
}

/**
 * Validate all themes
 * @param {Object} themes - THEMES object
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateAllConfigs(themes) {
  const errors = [];
  const warnings = [];

  if (!themes || typeof themes !== 'object') {
    errors.push('THEMES must be a valid object');
    return { valid: false, errors, warnings };
  }

  const themeKeys = Object.keys(themes);
  if (themeKeys.length === 0) {
    errors.push('THEMES must have at least one theme');
    return { valid: false, errors, warnings };
  }

  // Validate each theme
  for (const themeName of themeKeys) {
    errors.push(...validateTheme(themeName, themes[themeName]));
  }

  // Check balance warnings
  for (const themeName of themeKeys) {
    const theme = themes[themeName];

    // Warn if tower costs vary too much
    if (theme.towers && theme.towers.length > 1) {
      const costs = theme.towers.map(t => t.cost);
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);
      if (maxCost > minCost * 5) {
        warnings.push(`${themeName}: large tower cost variance (${minCost} - ${maxCost})`);
      }
    }

    // Warn if starting money is less than cheapest tower
    if (theme.towers && theme.maps) {
      const cheapestTower = Math.min(...theme.towers.map(t => t.cost));
      for (const map of theme.maps) {
        if (map.money < cheapestTower) {
          warnings.push(`${themeName} map "${map.name}": starting money (${map.money}) < cheapest tower (${cheapestTower})`);
        }
      }
    }

    // Warn if difficulty doesn't match map order
    if (theme.maps && theme.maps.length > 1) {
      for (let i = 1; i < theme.maps.length; i++) {
        if (theme.maps[i].diff < theme.maps[i - 1].diff) {
          warnings.push(`${themeName}: map "${theme.maps[i].name}" has lower difficulty than previous map`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Run validation and log results
 * @param {Object} themes - THEMES object
 * @param {boolean} throwOnError - Whether to throw on validation errors
 * @returns {boolean} Whether validation passed
 */
export function runValidation(themes, throwOnError = false) {
  const result = validateAllConfigs(themes);

  if (result.errors.length > 0) {
    console.error('=== CONFIG VALIDATION ERRORS ===');
    result.errors.forEach(err => console.error('  ERROR:', err));
  }

  if (result.warnings.length > 0) {
    console.warn('=== CONFIG VALIDATION WARNINGS ===');
    result.warnings.forEach(warn => console.warn('  WARN:', warn));
  }

  if (result.valid) {
    console.log('Config validation passed');
  } else if (throwOnError) {
    throw new Error(`Config validation failed with ${result.errors.length} errors`);
  }

  return result.valid;
}

/**
 * Validate a single wave composition
 * @param {Object} waveData - Wave composition { enemyId: count }
 * @param {Array} enemies - Enemy definitions
 * @param {number} waveNum - Wave number for error messages
 * @returns {Array} Array of error messages
 */
export function validateWave(waveData, enemies, waveNum) {
  const errors = [];
  const enemyIds = enemies.map(e => e.id);

  for (const [enemyId, count] of Object.entries(waveData)) {
    if (!enemyIds.includes(enemyId)) {
      errors.push(`Wave ${waveNum}: unknown enemy ID "${enemyId}"`);
    }
    if (typeof count !== 'number' || count < 0) {
      errors.push(`Wave ${waveNum}: invalid count for "${enemyId}": ${count}`);
    }
  }

  return errors;
}
