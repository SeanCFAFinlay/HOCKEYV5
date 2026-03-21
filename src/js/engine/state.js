// Centralized game state with dispatch pattern
// Single source of truth - all mutations through dispatch()

import { emit, GameEvents } from './events.js';

// Action types
export const ActionTypes = {
  // Game state
  SET_THEME: 'SET_THEME',
  SET_MAP: 'SET_MAP',
  SET_MONEY: 'SET_MONEY',
  ADD_MONEY: 'ADD_MONEY',
  SET_LIVES: 'SET_LIVES',
  DECREMENT_LIVES: 'DECREMENT_LIVES',
  SET_WAVE: 'SET_WAVE',
  INCREMENT_WAVE: 'INCREMENT_WAVE',
  SET_SCORE: 'SET_SCORE',
  ADD_SCORE: 'ADD_SCORE',
  SET_GAME_SPEED: 'SET_GAME_SPEED',

  // Wave state
  SET_WAVE_ACTIVE: 'SET_WAVE_ACTIVE',
  SET_AUTO_WAVE: 'SET_AUTO_WAVE',
  SET_SPAWNS_PENDING: 'SET_SPAWNS_PENDING',
  DECREMENT_SPAWNS: 'DECREMENT_SPAWNS',

  // Entity management
  ADD_TOWER: 'ADD_TOWER',
  REMOVE_TOWER: 'REMOVE_TOWER',
  ADD_ENEMY: 'ADD_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  ADD_PROJECTILE: 'ADD_PROJECTILE',
  REMOVE_PROJECTILE: 'REMOVE_PROJECTILE',
  ADD_PARTICLE: 'ADD_PARTICLE',
  REMOVE_PARTICLE: 'REMOVE_PARTICLE',

  // Navigation
  INCREMENT_NAV_VERSION: 'INCREMENT_NAV_VERSION',

  // UI state
  SET_SELECTED_TOWER: 'SET_SELECTED_TOWER',
  SET_SELECTED_PLACED: 'SET_SELECTED_PLACED',
  SET_SELL_MODE: 'SET_SELL_MODE',

  // Game loop
  SET_RUNNING: 'SET_RUNNING',
  SET_LAST_TIME: 'SET_LAST_TIME',
  ADD_ANIM_TIME: 'ADD_ANIM_TIME',

  // Three.js
  SET_THREE_OBJECTS: 'SET_THREE_OBJECTS',
  SET_CELLS: 'SET_CELLS',
  SET_GRID: 'SET_GRID',

  // Camera
  SET_CAMERA_STATE: 'SET_CAMERA_STATE',

  // Input
  SET_DRAGGING: 'SET_DRAGGING',
  SET_DRAG_MOVED: 'SET_DRAG_MOVED',
  SET_LAST_POSITION: 'SET_LAST_POSITION',
  SET_TOUCH_START: 'SET_TOUCH_START',

  // Map
  SET_SPAWNS_AND_BASE: 'SET_SPAWNS_AND_BASE',
  SET_WAVES: 'SET_WAVES',
  SET_MAP_DIMENSIONS: 'SET_MAP_DIMENSIONS',

  // Misc
  SET_AUTO_WAVE_TIMER: 'SET_AUTO_WAVE_TIMER',
  RESET_GAME_STATE: 'RESET_GAME_STATE'
};

// Initial state
const initialState = {
  // Theme state
  theme: null,
  themeData: null,
  mapData: null,
  mapIndex: 0,

  // Map state
  COLS: 0,
  ROWS: 0,
  PATH: [],
  SPAWNS: [],
  BASE: null,
  WAVES: [],

  // Game state
  money: 0,
  lives: 0,
  wave: 0,
  score: 0,
  gameSpeed: 1,
  autoWave: false,
  autoWaveTimer: null,
  spawnsPending: 0,

  // Entity arrays
  grid: [],
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],

  // Navigation version (increments on path changes)
  navVersion: 0,

  // UI state
  selectedTower: null,
  selectedPlaced: null,
  sellMode: false,
  waveActive: false,

  // Game loop state
  running: false,
  lastTime: 0,
  animTime: 0,

  // Three.js objects
  scene: null,
  camera: null,
  renderer: null,
  raycaster: null,
  mouse: null,
  cells: [],

  // Camera state
  camAngle: Math.PI / 4,
  camHeight: 14,
  camDist: 22,
  targetCamAngle: Math.PI / 4,
  targetCamHeight: 14,
  targetCamDist: 22,

  // Input state
  dragging: false,
  dragMoved: false,
  lastX: 0,
  lastY: 0,
  touchStart: 0
};

// Create state copy
const state = { ...initialState };

// State change subscribers
const subscribers = new Map();

/**
 * Subscribe to state changes
 * @param {string} key - State key to watch
 * @param {Function} callback - Called with (newValue, oldValue)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToState(key, callback) {
  if (!subscribers.has(key)) {
    subscribers.set(key, []);
  }
  subscribers.get(key).push(callback);

  return () => {
    const subs = subscribers.get(key);
    const idx = subs.indexOf(callback);
    if (idx !== -1) subs.splice(idx, 1);
  };
}

/**
 * Notify subscribers of state change
 */
function notifySubscribers(key, newValue, oldValue) {
  if (subscribers.has(key)) {
    subscribers.get(key).forEach(cb => cb(newValue, oldValue));
  }
}

/**
 * Dispatch an action to modify state
 * @param {string} type - Action type
 * @param {*} payload - Action payload
 */
export function dispatch(type, payload) {
  switch (type) {
    // Theme & Map
    case ActionTypes.SET_THEME:
      state.theme = payload.theme;
      state.themeData = payload.themeData;
      break;

    case ActionTypes.SET_MAP:
      state.mapData = payload.mapData;
      state.mapIndex = payload.mapIndex;
      break;

    case ActionTypes.SET_MAP_DIMENSIONS:
      state.COLS = payload.cols;
      state.ROWS = payload.rows;
      break;

    case ActionTypes.SET_SPAWNS_AND_BASE:
      state.SPAWNS = payload.spawns;
      state.BASE = payload.base;
      break;

    case ActionTypes.SET_WAVES:
      state.WAVES = payload;
      break;

    case ActionTypes.SET_GRID:
      state.grid = payload;
      break;

    // Money
    case ActionTypes.SET_MONEY:
      const oldMoney = state.money;
      state.money = payload;
      notifySubscribers('money', payload, oldMoney);
      emit(GameEvents.MONEY_CHANGE, { money: payload, delta: payload - oldMoney });
      break;

    case ActionTypes.ADD_MONEY:
      const prevMoney = state.money;
      state.money += payload;
      notifySubscribers('money', state.money, prevMoney);
      emit(GameEvents.MONEY_CHANGE, { money: state.money, delta: payload });
      break;

    // Lives
    case ActionTypes.SET_LIVES:
      const oldLives = state.lives;
      state.lives = payload;
      notifySubscribers('lives', payload, oldLives);
      emit(GameEvents.LIVES_CHANGE, { lives: payload });
      break;

    case ActionTypes.DECREMENT_LIVES:
      const prevLives = state.lives;
      state.lives--;
      notifySubscribers('lives', state.lives, prevLives);
      emit(GameEvents.LIVES_CHANGE, { lives: state.lives });
      break;

    // Wave
    case ActionTypes.SET_WAVE:
      state.wave = payload;
      break;

    case ActionTypes.INCREMENT_WAVE:
      state.wave++;
      break;

    // Score
    case ActionTypes.SET_SCORE:
      const oldScore = state.score;
      state.score = payload;
      notifySubscribers('score', payload, oldScore);
      emit(GameEvents.SCORE_CHANGE, { score: payload });
      break;

    case ActionTypes.ADD_SCORE:
      const prevScore = state.score;
      state.score += payload;
      notifySubscribers('score', state.score, prevScore);
      emit(GameEvents.SCORE_CHANGE, { score: state.score });
      break;

    // Game speed
    case ActionTypes.SET_GAME_SPEED:
      state.gameSpeed = payload;
      break;

    // Wave state
    case ActionTypes.SET_WAVE_ACTIVE:
      state.waveActive = payload;
      break;

    case ActionTypes.SET_AUTO_WAVE:
      state.autoWave = payload;
      break;

    case ActionTypes.SET_AUTO_WAVE_TIMER:
      state.autoWaveTimer = payload;
      break;

    case ActionTypes.SET_SPAWNS_PENDING:
      state.spawnsPending = payload;
      break;

    case ActionTypes.DECREMENT_SPAWNS:
      if (state.spawnsPending > 0) state.spawnsPending--;
      break;

    // Entities
    case ActionTypes.ADD_TOWER:
      state.towers.push(payload);
      emit(GameEvents.TOWER_PLACE, { tower: payload });
      break;

    case ActionTypes.REMOVE_TOWER:
      const towerIdx = state.towers.indexOf(payload);
      if (towerIdx !== -1) state.towers.splice(towerIdx, 1);
      break;

    case ActionTypes.ADD_ENEMY:
      state.enemies.push(payload);
      emit(GameEvents.ENEMY_SPAWN, { enemy: payload });
      break;

    case ActionTypes.REMOVE_ENEMY:
      if (typeof payload === 'number') {
        state.enemies.splice(payload, 1);
      } else {
        const idx = state.enemies.indexOf(payload);
        if (idx !== -1) state.enemies.splice(idx, 1);
      }
      break;

    case ActionTypes.ADD_PROJECTILE:
      state.projectiles.push(payload);
      break;

    case ActionTypes.REMOVE_PROJECTILE:
      if (typeof payload === 'number') {
        state.projectiles.splice(payload, 1);
      } else {
        const idx = state.projectiles.indexOf(payload);
        if (idx !== -1) state.projectiles.splice(idx, 1);
      }
      break;

    case ActionTypes.ADD_PARTICLE:
      state.particles.push(payload);
      break;

    case ActionTypes.REMOVE_PARTICLE:
      if (typeof payload === 'number') {
        state.particles.splice(payload, 1);
      }
      break;

    // Navigation
    case ActionTypes.INCREMENT_NAV_VERSION:
      state.navVersion++;
      emit(GameEvents.NAV_CHANGE, { version: state.navVersion });
      break;

    // UI state
    case ActionTypes.SET_SELECTED_TOWER:
      state.selectedTower = payload;
      emit(GameEvents.UI_TOWER_SELECT, { tower: payload });
      break;

    case ActionTypes.SET_SELECTED_PLACED:
      state.selectedPlaced = payload;
      break;

    case ActionTypes.SET_SELL_MODE:
      state.sellMode = payload;
      emit(GameEvents.UI_SELL_MODE, { mode: payload });
      break;

    // Game loop
    case ActionTypes.SET_RUNNING:
      state.running = payload;
      break;

    case ActionTypes.SET_LAST_TIME:
      state.lastTime = payload;
      break;

    case ActionTypes.ADD_ANIM_TIME:
      state.animTime += payload;
      break;

    // Three.js
    case ActionTypes.SET_THREE_OBJECTS:
      state.scene = payload.scene;
      state.camera = payload.camera;
      state.renderer = payload.renderer;
      state.raycaster = payload.raycaster;
      state.mouse = payload.mouse;
      break;

    case ActionTypes.SET_CELLS:
      state.cells = payload;
      break;

    // Camera
    case ActionTypes.SET_CAMERA_STATE:
      if (payload.angle !== undefined) state.camAngle = payload.angle;
      if (payload.height !== undefined) state.camHeight = payload.height;
      if (payload.dist !== undefined) state.camDist = payload.dist;
      if (payload.targetAngle !== undefined) state.targetCamAngle = payload.targetAngle;
      if (payload.targetHeight !== undefined) state.targetCamHeight = payload.targetHeight;
      if (payload.targetDist !== undefined) state.targetCamDist = payload.targetDist;
      break;

    // Input
    case ActionTypes.SET_DRAGGING:
      state.dragging = payload;
      break;

    case ActionTypes.SET_DRAG_MOVED:
      state.dragMoved = payload;
      break;

    case ActionTypes.SET_LAST_POSITION:
      state.lastX = payload.x;
      state.lastY = payload.y;
      break;

    case ActionTypes.SET_TOUCH_START:
      state.touchStart = payload;
      break;

    // Reset
    case ActionTypes.RESET_GAME_STATE:
      state.grid = [];
      state.towers = [];
      state.enemies = [];
      state.projectiles = [];
      state.particles = [];
      state.selectedTower = null;
      state.selectedPlaced = null;
      state.sellMode = false;
      state.waveActive = false;
      state.spawnsPending = 0;
      state.autoWave = false;
      state.autoWaveTimer = null;
      state.animTime = 0;
      break;

    default:
      console.warn('Unknown action type:', type);
  }
}

// Read-only access to state
export function getState() {
  return state;
}

// Legacy setters (for gradual migration) - these now use dispatch internally
export function setTheme(theme, themeData) {
  dispatch(ActionTypes.SET_THEME, { theme, themeData });
}

export function setMapData(mapData, mapIndex) {
  dispatch(ActionTypes.SET_MAP, { mapData, mapIndex });
}

export function setMapDimensions(cols, rows) {
  dispatch(ActionTypes.SET_MAP_DIMENSIONS, { cols, rows });
}

export function setSpawnsAndBase(spawns, base) {
  dispatch(ActionTypes.SET_SPAWNS_AND_BASE, { spawns, base });
}

export function setWaves(waves) {
  dispatch(ActionTypes.SET_WAVES, waves);
}

export function setGrid(grid) {
  dispatch(ActionTypes.SET_GRID, grid);
}

export function setMoney(money) {
  dispatch(ActionTypes.SET_MONEY, money);
}

export function addMoney(amount) {
  dispatch(ActionTypes.ADD_MONEY, amount);
}

export function setLives(lives) {
  dispatch(ActionTypes.SET_LIVES, lives);
}

export function decrementLives() {
  dispatch(ActionTypes.DECREMENT_LIVES);
}

export function setWave(wave) {
  dispatch(ActionTypes.SET_WAVE, wave);
}

export function incrementWave() {
  dispatch(ActionTypes.INCREMENT_WAVE);
}

export function setScore(score) {
  dispatch(ActionTypes.SET_SCORE, score);
}

export function addScore(amount) {
  dispatch(ActionTypes.ADD_SCORE, amount);
}

export function setGameSpeed(speed) {
  dispatch(ActionTypes.SET_GAME_SPEED, speed);
}

export function setAutoWave(autoWave) {
  dispatch(ActionTypes.SET_AUTO_WAVE, autoWave);
}

export function setAutoWaveTimer(timer) {
  dispatch(ActionTypes.SET_AUTO_WAVE_TIMER, timer);
}

export function setSpawnsPending(count) {
  dispatch(ActionTypes.SET_SPAWNS_PENDING, count);
}

export function decrementSpawnsPending() {
  dispatch(ActionTypes.DECREMENT_SPAWNS);
}

export function incrementNavVersion() {
  dispatch(ActionTypes.INCREMENT_NAV_VERSION);
}

export function setSelectedTower(tower) {
  dispatch(ActionTypes.SET_SELECTED_TOWER, tower);
}

export function setSelectedPlaced(tower) {
  dispatch(ActionTypes.SET_SELECTED_PLACED, tower);
}

export function setSellMode(mode) {
  dispatch(ActionTypes.SET_SELL_MODE, mode);
}

export function setWaveActive(active) {
  dispatch(ActionTypes.SET_WAVE_ACTIVE, active);
}

export function setRunning(running) {
  dispatch(ActionTypes.SET_RUNNING, running);
}

export function setLastTime(time) {
  dispatch(ActionTypes.SET_LAST_TIME, time);
}

export function addAnimTime(dt) {
  dispatch(ActionTypes.ADD_ANIM_TIME, dt);
}

export function setThreeObjects(scene, camera, renderer, raycaster, mouse) {
  dispatch(ActionTypes.SET_THREE_OBJECTS, { scene, camera, renderer, raycaster, mouse });
}

export function setCells(cells) {
  dispatch(ActionTypes.SET_CELLS, cells);
}

export function setCameraState(angle, height, dist) {
  dispatch(ActionTypes.SET_CAMERA_STATE, { angle, height, dist });
}

export function setDragging(dragging) {
  dispatch(ActionTypes.SET_DRAGGING, dragging);
}

export function setDragMoved(moved) {
  dispatch(ActionTypes.SET_DRAG_MOVED, moved);
}

export function setLastPosition(x, y) {
  dispatch(ActionTypes.SET_LAST_POSITION, { x, y });
}

export function setTouchStart(value) {
  dispatch(ActionTypes.SET_TOUCH_START, value);
}

export function addTower(tower) {
  dispatch(ActionTypes.ADD_TOWER, tower);
}

export function removeTower(tower) {
  dispatch(ActionTypes.REMOVE_TOWER, tower);
}

export function addEnemy(enemy) {
  dispatch(ActionTypes.ADD_ENEMY, enemy);
}

export function removeEnemy(index) {
  dispatch(ActionTypes.REMOVE_ENEMY, index);
}

export function addProjectile(projectile) {
  dispatch(ActionTypes.ADD_PROJECTILE, projectile);
}

export function removeProjectile(index) {
  dispatch(ActionTypes.REMOVE_PROJECTILE, index);
}

export function addParticle(particle) {
  dispatch(ActionTypes.ADD_PARTICLE, particle);
}

export function removeParticle(index) {
  dispatch(ActionTypes.REMOVE_PARTICLE, index);
}

export function clearCells() {
  dispatch(ActionTypes.SET_CELLS, []);
}

export function resetGameState() {
  dispatch(ActionTypes.RESET_GAME_STATE);
}
