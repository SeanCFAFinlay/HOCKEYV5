// Event system - pub/sub for decoupled communication

const listeners = new Map();
const onceListeners = new Map();

/**
 * Subscribe to an event
 * @param {string} event - Event name
 * @param {Function} handler - Callback function
 * @returns {Function} Unsubscribe function
 */
export function on(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  listeners.get(event).push(handler);

  // Return unsubscribe function
  return () => off(event, handler);
}

/**
 * Subscribe to an event once
 * @param {string} event - Event name
 * @param {Function} handler - Callback function
 */
export function once(event, handler) {
  if (!onceListeners.has(event)) {
    onceListeners.set(event, []);
  }
  onceListeners.get(event).push(handler);
}

/**
 * Unsubscribe from an event
 * @param {string} event - Event name
 * @param {Function} handler - Callback function
 */
export function off(event, handler) {
  if (listeners.has(event)) {
    const handlers = listeners.get(event);
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }
}

/**
 * Emit an event
 * @param {string} event - Event name
 * @param {*} payload - Event data
 */
export function emit(event, payload) {
  // Regular listeners
  if (listeners.has(event)) {
    listeners.get(event).forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Event handler error for ${event}:`, err);
      }
    });
  }

  // Once listeners
  if (onceListeners.has(event)) {
    const handlers = onceListeners.get(event);
    onceListeners.set(event, []);
    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Once handler error for ${event}:`, err);
      }
    });
  }
}

/**
 * Clear all listeners (for testing/reset)
 */
export function clearAllListeners() {
  listeners.clear();
  onceListeners.clear();
}

// Event type constants for type safety
export const GameEvents = {
  // Wave events
  WAVE_START: 'wave:start',
  WAVE_END: 'wave:end',
  WAVE_COMPLETE: 'wave:complete',

  // Enemy events
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_DEATH: 'enemy:death',
  ENEMY_ESCAPE: 'enemy:escape',
  ENEMY_HIT: 'enemy:hit',
  ENEMY_KILL: 'enemy:kill',

  // Tower events
  TOWER_PLACE: 'tower:place',
  TOWER_SELL: 'tower:sell',
  TOWER_UPGRADE: 'tower:upgrade',
  TOWER_FIRE: 'tower:fire',
  TOWER_DESTROYED: 'tower:destroyed',

  // Projectile events
  PROJECTILE_CREATE: 'projectile:create',
  PROJECTILE_HIT: 'projectile:hit',

  // Game state events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_WIN: 'game:win',
  GAME_LOSE: 'game:lose',
  GAME_RESET: 'game:reset',

  // State change events
  MONEY_CHANGE: 'state:money',
  LIVES_CHANGE: 'state:lives',
  SCORE_CHANGE: 'state:score',
  NAV_CHANGE: 'state:nav',

  // UI events
  UI_UPDATE: 'ui:update',
  UI_TOWER_SELECT: 'ui:tower_select',
  UI_SELL_MODE: 'ui:sell_mode'
};
