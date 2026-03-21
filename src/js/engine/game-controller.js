// Game Controller - Orchestrates the entire game lifecycle
// Ensures deterministic update order and system synchronization

import { getState, setRunning, setLastTime, setWaveActive, setAutoWaveTimer } from './state.js';
import { emit, GameEvents } from './events.js';
import { updateCamera } from './camera.js';
import { updateEnemies } from '../systems/enemies.js';
import { updateTowers } from '../systems/towers.js';
import { updateProjectiles } from '../systems/projectiles.js';
import { updateParticles } from '../systems/particles.js';
import { updateAnimations } from '../rendering/animations.js';
import { processWaveSpawns, checkWaveCompletion } from '../systems/waves.js';

// Fixed timestep configuration
const FIXED_TIMESTEP = 1 / 60;  // 60 FPS physics
const MAX_DELTA = 0.25;          // Max frame time to prevent spiral of death
const MAX_STEPS = 5;             // Max physics steps per frame

// Game state
let accumulator = 0;
let gameTime = 0;
let frameId = null;
let lastFrameTime = 0;
let isPaused = false;

/**
 * Initialize the game systems
 * Called after 3D scene is set up
 */
export function initGame() {
  const state = getState();

  accumulator = 0;
  gameTime = 0;
  lastFrameTime = performance.now();
  isPaused = false;

  emit(GameEvents.GAME_START, { wave: state.wave, lives: state.lives });
}

/**
 * Start the game loop
 */
export function startGame() {
  if (frameId) return;

  const state = getState();
  setRunning(true);
  lastFrameTime = performance.now();

  frameId = requestAnimationFrame(gameLoop);
}

/**
 * Main game loop with fixed timestep
 */
function gameLoop(currentTime) {
  const state = getState();

  if (!state.running) {
    frameId = null;
    return;
  }

  // Calculate delta with cap
  let delta = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  // Clamp delta to prevent death spiral
  if (delta > MAX_DELTA) {
    delta = MAX_DELTA;
  }

  // Apply game speed
  delta *= state.gameSpeed;

  // Accumulate time
  accumulator += delta;

  // Fixed timestep physics updates
  let steps = 0;
  while (accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS) {
    fixedUpdate(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
    gameTime += FIXED_TIMESTEP;
    steps++;
  }

  // Variable update for rendering interpolation
  variableUpdate(delta, accumulator / FIXED_TIMESTEP);

  // Render
  render();

  // Continue loop
  frameId = requestAnimationFrame(gameLoop);
}

/**
 * Fixed timestep update - physics and game logic
 * @param {number} dt - Fixed delta time
 */
function fixedUpdate(dt) {
  const state = getState();

  // 1. Process wave spawns (tied to game time, not wall clock)
  processWaveSpawns(dt);

  // 2. Update enemies (AI, movement, status effects)
  updateEnemies(dt);

  // 3. Update towers (targeting, shooting)
  updateTowers(dt, gameTime);

  // 4. Update projectiles (movement, collision)
  updateProjectiles(dt);

  // 5. Update particles (visual effects)
  updateParticles(dt);

  // 6. Check wave completion
  checkWaveCompletion();

  // 7. Check game over conditions
  checkGameState();
}

/**
 * Variable update - interpolation for smooth rendering
 * @param {number} dt - Variable delta time
 * @param {number} alpha - Interpolation factor (0-1)
 */
function variableUpdate(dt, alpha) {
  // Camera smoothing
  updateCamera(dt);

  // Animation updates
  updateAnimations(dt);
}

/**
 * Render the scene
 */
function render() {
  const state = getState();

  if (state.renderer && state.scene && state.camera) {
    state.renderer.render(state.scene, state.camera);
  }
}

/**
 * Check game state for win/lose conditions
 */
function checkGameState() {
  const state = getState();

  // Check lose condition
  if (state.lives <= 0 && state.running) {
    setRunning(false);
    emit(GameEvents.GAME_LOSE, { wave: state.wave, score: state.score });
    return;
  }

  // Check win condition (after wave completion)
  if (!state.waveActive &&
      state.spawnsPending === 0 &&
      state.enemies.length === 0 &&
      state.wave >= state.mapData.waves) {
    setRunning(false);
    emit(GameEvents.GAME_WIN, { score: state.score, wave: state.wave });
  }
}

/**
 * Pause the game
 */
export function pauseGame() {
  if (isPaused) return;

  isPaused = true;
  const state = getState();
  setRunning(false);

  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  emit(GameEvents.GAME_PAUSE, {});
}

/**
 * Resume the game
 */
export function resumeGame() {
  if (!isPaused) return;

  isPaused = false;
  lastFrameTime = performance.now();
  startGame();

  emit(GameEvents.GAME_RESUME, {});
}

/**
 * Reset the game state
 */
export function resetGame() {
  // Stop loop
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  // Clear timers
  const state = getState();
  if (state.autoWaveTimer) {
    clearTimeout(state.autoWaveTimer);
    setAutoWaveTimer(null);
  }

  // Reset timing
  accumulator = 0;
  gameTime = 0;
  isPaused = false;

  emit(GameEvents.GAME_RESET, {});
}

/**
 * Get current game time (fixed timestep time)
 */
export function getGameTime() {
  return gameTime;
}

/**
 * Check if game is paused
 */
export function isGamePaused() {
  return isPaused;
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.__gameController = {
    getGameTime,
    isGamePaused,
    pauseGame,
    resumeGame
  };
}
