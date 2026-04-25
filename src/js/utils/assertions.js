// Runtime assertions for catching issues during gameplay
// Lightweight checks that can be disabled in production

// Set to false in production for performance
const ASSERTIONS_ENABLED = true;

/**
 * Assert a condition is true
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message if assertion fails
 */
export function assert(condition, message) {
  if (ASSERTIONS_ENABLED && !condition) {
    console.error(`[ASSERTION FAILED] ${message}`);
    if (typeof window !== 'undefined' && window.__DEBUG_BREAK_ON_ASSERT) {
      debugger;
    }
  }
}

/**
 * Assert a value is defined (not null/undefined)
 * @param {*} value - Value to check
 * @param {string} name - Variable name for error message
 */
export function assertDefined(value, name) {
  if (ASSERTIONS_ENABLED && (value === null || value === undefined)) {
    console.error(`[ASSERTION FAILED] ${name} is ${value}`);
  }
}

/**
 * Assert a value is a positive number
 * @param {*} value - Value to check
 * @param {string} name - Variable name for error message
 */
export function assertPositiveNumber(value, name) {
  if (ASSERTIONS_ENABLED && (typeof value !== 'number' || value <= 0 || isNaN(value))) {
    console.error(`[ASSERTION FAILED] ${name} must be positive number, got: ${value}`);
  }
}

/**
 * Assert an array has expected length
 * @param {Array} arr - Array to check
 * @param {number} length - Expected length
 * @param {string} name - Variable name for error message
 */
export function assertArrayLength(arr, length, name) {
  if (ASSERTIONS_ENABLED) {
    if (!Array.isArray(arr)) {
      console.error(`[ASSERTION FAILED] ${name} must be an array`);
    } else if (arr.length !== length) {
      console.error(`[ASSERTION FAILED] ${name} length must be ${length}, got: ${arr.length}`);
    }
  }
}

/**
 * Assert a value is within a range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {string} name - Variable name for error message
 */
export function assertInRange(value, min, max, name) {
  if (ASSERTIONS_ENABLED && (typeof value !== 'number' || value < min || value > max)) {
    console.error(`[ASSERTION FAILED] ${name} must be between ${min} and ${max}, got: ${value}`);
  }
}

/**
 * Assert an object has required keys
 * @param {Object} obj - Object to check
 * @param {string[]} keys - Required keys
 * @param {string} name - Object name for error message
 */
export function assertHasKeys(obj, keys, name) {
  if (ASSERTIONS_ENABLED) {
    if (!obj || typeof obj !== 'object') {
      console.error(`[ASSERTION FAILED] ${name} must be an object`);
      return;
    }
    const missing = keys.filter(k => !(k in obj));
    if (missing.length > 0) {
      console.error(`[ASSERTION FAILED] ${name} missing keys: ${missing.join(', ')}`);
    }
  }
}

/**
 * Assert a grid position is valid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cols - Grid columns
 * @param {number} rows - Grid rows
 */
export function assertValidGridPos(x, y, cols, rows) {
  if (ASSERTIONS_ENABLED) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) {
      console.error(`[ASSERTION FAILED] Grid position (${x}, ${y}) out of bounds (${cols}x${rows})`);
    }
  }
}

/**
 * Assert an enemy has valid state
 * @param {Object} enemy - Enemy to validate
 */
export function assertValidEnemy(enemy) {
  if (ASSERTIONS_ENABLED && enemy) {
    assertDefined(enemy.type, 'enemy.type');
    assertPositiveNumber(enemy.maxHp, 'enemy.maxHp');
    assertPositiveNumber(enemy.baseSpd, 'enemy.baseSpd');
    if (enemy.hp <= 0 && enemy.state !== 'dead' && enemy.state !== 'exited') {
      console.error(`[ASSERTION FAILED] Enemy has hp=${enemy.hp} but state=${enemy.state}`);
    }
  }
}

/**
 * Assert a tower has valid state
 * @param {Object} tower - Tower to validate
 */
export function assertValidTower(tower) {
  if (ASSERTIONS_ENABLED && tower) {
    assertDefined(tower.type, 'tower.type');
    assertInRange(tower.lv, 0, 3, 'tower.lv');
    assertPositiveNumber(tower.dmg, 'tower.dmg');
    assertPositiveNumber(tower.rng, 'tower.rng');
    assertPositiveNumber(tower.rate, 'tower.rate');
  }
}

/**
 * Log a warning if a condition indicates a potential issue
 * @param {boolean} condition - Condition to check
 * @param {string} message - Warning message
 */
export function warnIf(condition, message) {
  if (ASSERTIONS_ENABLED && condition) {
    console.warn(`[WARNING] ${message}`);
  }
}
