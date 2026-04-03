// Main game loop with fixed timestep
// Uses accumulator pattern for deterministic physics

import { getState, setLastTime, addAnimTime, setWaveActive, setRunning, setAutoWaveTimer } from './state.js';
import { emit, GameEvents } from './events.js';
import { updateEnemies } from '../systems/enemies.js';
import { updateTowers } from '../systems/towers.js';
import { updateProjectiles } from '../systems/projectiles.js';
import { updateParticles } from '../systems/particles.js';
import { updateAnimations } from '../rendering/animations.js';
import { updateCamera } from './camera.js';
import { updateHUD } from '../ui/hud.js';
import { processWaveSpawns, startWave } from '../systems/waves.js';

// Fixed timestep configuration
const FIXED_DT = 1 / 60;         // 60 FPS physics
const MAX_FRAME_TIME = 0.25;     // Cap at 250ms to prevent spiral
const MAX_STEPS_PER_FRAME = 5;   // Max physics steps per render frame

// Loop state
let accumulator = 0;
let gameTime = 0;
let lastFrameTime = 0;
let frameId = null;

/**
 * Main game loop with fixed timestep accumulator pattern
 * @param {number} currentTime - Current timestamp from RAF
 */
export function gameLoop(currentTime) {
  const state = getState();

  if (!state.running) {
    frameId = null;
    return;
  }

  // Calculate frame delta
  let frameTime = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  // Clamp frame time to prevent death spiral
  if (frameTime > MAX_FRAME_TIME) {
    frameTime = MAX_FRAME_TIME;
  }

  // Apply game speed multiplier
  frameTime *= state.gameSpeed;

  // Accumulate time
  accumulator += frameTime;

  // Fixed timestep physics updates
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
    // Process wave spawns (game-time based)
    processWaveSpawns(FIXED_DT, gameTime);

    // Update all systems with fixed dt
    updateEnemies(FIXED_DT);
    updateTowers(FIXED_DT, gameTime);
    updateProjectiles(FIXED_DT);
    updateParticles(FIXED_DT);

    accumulator -= FIXED_DT;
    gameTime += FIXED_DT;
    steps++;
  }

  // Variable update for smooth animations
  addAnimTime(frameTime);
  updateAnimations(frameTime);
  updateCamera(frameTime);

  // Render
  if (state.renderer && state.scene && state.camera) {
    state.renderer.render(state.scene, state.camera);
  }

  // Check wave completion
  checkWaveCompletion();

  // Continue loop
  frameId = requestAnimationFrame(gameLoop);
}

/**
 * Check if current wave is complete
 */
function checkWaveCompletion() {
  const state = getState();

  // Check game-over condition first
  if (state.lives <= 0 && state.running) {
    setRunning(false);
    emit(GameEvents.GAME_LOSE, { wave: state.wave, score: state.score });
    return;
  }

  if (state.waveActive &&
      state.spawnsPending === 0 &&
      state.enemies.length === 0 &&
      state.projectiles.length === 0) {

    setWaveActive(false);
    emit(GameEvents.WAVE_COMPLETE, { wave: state.wave });
    updateHUD();

    // Auto-wave handling: use setTimeout for player-friendly delay between waves.
    // Guard flag prevents double-fire if checkWaveCompletion runs in the same frame.
    if (state.autoWave && state.wave < (state.mapData?.waves ?? 0)) {
      if (state.autoWaveTimer) clearTimeout(state.autoWaveTimer);

      const timer = setTimeout(() => {
        const currentState = getState();
        if (currentState.running && !currentState.waveActive && currentState.autoWave) {
          startWave();
        }
      }, 650);

      setAutoWaveTimer(timer);
    }

    // Check win condition
    if (state.mapData && state.wave >= state.mapData.waves) {
      emit(GameEvents.GAME_WIN, { score: state.score, wave: state.wave }); // modals.js handles display
      setRunning(false);
    }
  }
}

/**
 * Start the game loop
 */
export function startGameLoop() {
  // Reset timing state
  accumulator = 0;
  gameTime = 0;
  lastFrameTime = performance.now();

  setRunning(true);
  setLastTime(lastFrameTime);

  // Start the loop
  frameId = requestAnimationFrame(gameLoop);
}

/**
 * Stop the game loop
 */
export function stopGameLoop() {
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  setRunning(false);
}

/**
 * Get current game time
 * @returns {number} Game time in seconds
 */
export function getGameTime() {
  return gameTime;
}

/**
 * Reset game time
 */
export function resetGameTime() {
  gameTime = 0;
  accumulator = 0;
}
