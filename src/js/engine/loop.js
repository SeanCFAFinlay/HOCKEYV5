// Main game loop with fixed timestep
// Uses accumulator pattern for deterministic physics

import { getState, setLastTime, addAnimTime, setWaveActive, setRunning, setAutoWave, setAutoWaveTimer, updateRunStats } from './state.js';
import { emit, GameEvents } from './events.js';
import { updateEnemies } from '../systems/enemies.js';
import { updateTowers } from '../systems/towers.js';
import { updateProjectiles } from '../systems/projectiles.js';
import { updateParticles } from '../systems/particles.js';
import { updateAnimations } from '../rendering/animations.js';
import { updateTrails } from '../rendering/trails.js';
import { updateCamera } from './camera.js';
import { updateHUD } from '../ui/hud.js';
import { processWaveSpawns, startWave } from '../systems/waves.js';
import { updatePreviewAnimation } from './input.js';
import { createVictoryEffect, createDefeatEffect } from '../systems/particles.js';
import { updatePerfOverlay } from '../ui/perf-overlay.js';
import { updateMinimap } from '../ui/minimap.js';
import { updateLights } from './scene.js';
import * as PostProcessing from './postprocessing.js';
import { enableAutoQuality, updateAutoQuality } from './auto-quality.js';
import { updateTargetingFeedback } from '../rendering/targeting-feedback.js';
import { didWaveCostLives, shouldAutoStartNextWave } from '../systems/auto-wave.js';

// Fixed timestep configuration
const FIXED_DT = 1 / 60;         // 60 FPS physics
const MAX_FRAME_TIME = 0.25;     // Cap at 250ms to prevent spiral
const MAX_STEPS_PER_FRAME = 5;   // Max physics steps per render frame

// Loop state
let accumulator = 0;
let gameTime = 0;
let lastFrameTime = 0;
let frameId = null;

// Hit-stop state (milliseconds remaining)
let hitStopRemaining = 0;

function getOptionalPostProcessingExport(name) {
  if (!Object.prototype.hasOwnProperty.call(PostProcessing, name)) return null;
  const value = PostProcessing[name];
  return typeof value === 'function' ? value : null;
}

function updateOptionalScreenEffects(dt) {
  const update = getOptionalPostProcessingExport('updateScreenEffects');
  if (update) update(dt);
}

/**
 * Trigger a hit-stop freeze frame effect.
 * Uses max of current vs new to prevent additive stacking.
 * @param {number} durationMs - Duration in milliseconds
 */
export function triggerHitStop(durationMs) {
  if (durationMs <= 0) {
    hitStopRemaining = 0;
    return;
  }
  hitStopRemaining = Math.max(hitStopRemaining, durationMs);
}

/**
 * Get current hit-stop remaining time in ms (for testing/debugging)
 * @returns {number}
 */
export function getHitStopRemaining() {
  return hitStopRemaining;
}

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

  // Calculate raw frame delta (seconds)
  const rawFrameTime = Math.max(0, (currentTime - lastFrameTime) / 1000);
  lastFrameTime = currentTime;

  // Clamp frame time to prevent death spiral
  const clampedFrameTime = Math.min(rawFrameTime, MAX_FRAME_TIME);
  updateAutoQuality(clampedFrameTime);

  // Real elapsed ms for hit-stop decrement (unaffected by game speed)
  const realDeltaMs = clampedFrameTime * 1000;

  // Handle hit-stop: decrement using real time, skip all game logic
  if (hitStopRemaining > 0) {
    hitStopRemaining = Math.max(0, hitStopRemaining - realDeltaMs);
    updateOptionalScreenEffects(clampedFrameTime);
    updateTargetingFeedback();
    renderFrame(state);
    updatePerfOverlay(clampedFrameTime, 0);
    frameId = requestAnimationFrame(gameLoop);
    return;
  }

  // Apply game speed multiplier
  const frameTime = clampedFrameTime * state.gameSpeed;

  // Accumulate time
  accumulator += frameTime;

  // Fixed timestep physics updates
  let steps = 0;
  while (accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
    processWaveSpawns(FIXED_DT, gameTime);
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
  updateTrails(frameTime);
  updateAnimations(frameTime);
  updatePreviewAnimation(frameTime);
  updateCamera(frameTime);
  updateLights(gameTime);
  updateOptionalScreenEffects(frameTime);
  updateTargetingFeedback();

  renderFrame(state);

  updateMinimap();
  updatePerfOverlay(frameTime, steps);

  // Check wave completion
  checkWaveCompletion();

  // Continue loop
  frameId = requestAnimationFrame(gameLoop);
}

/**
 * Render one frame via post-processing composer or direct renderer
 * @param {Object} state - Game state
 */
function renderFrame(state) {
  if (state.renderer && state.scene && state.camera) {
    try {
      const getComposer = getOptionalPostProcessingExport('getComposer');
      const ppComposer = getComposer ? getComposer() : null;
      if (ppComposer) {
        ppComposer.render();
      } else {
        state.renderer.setRenderTarget(null);
        state.renderer.render(state.scene, state.camera);
      }
    } catch (e) {
      // Post-processing failed — fall back to direct render
      state.renderer.setRenderTarget(null);
      state.renderer.render(state.scene, state.camera);
    }
  }
}

/**
 * Check if current wave is complete
 */
function checkWaveCompletion() {
  const state = getState();

  // Check game-over condition first
  if (state.lives <= 0 && state.running) {
    setRunning(false);
    updateRunStats({ result: 'lose', enemiesEscaped: Math.max(0, (state.mapData?.lives || 0) - state.lives) });
    emit(GameEvents.GAME_LOSE, { wave: state.wave, score: state.score });
    return;
  }

  if (state.waveActive &&
      state.spawnsPending === 0 &&
      state.enemies.length === 0 &&
      state.projectiles.length === 0) {

    setWaveActive(false);
    updateRunStats({ wavesCompleted: state.wave });
    const autoWavePausedForLeaks = didWaveCostLives(state) && state.autoWave;
    if (autoWavePausedForLeaks) {
      setAutoWave(false);
    }
    emit(GameEvents.WAVE_COMPLETE, { wave: state.wave });
    updateHUD();

    // Auto-wave handling: use setTimeout for player-friendly delay between waves.
    // Guard flag prevents double-fire if checkWaveCompletion runs in the same frame.
    if (shouldAutoStartNextWave(state)) {
      if (state.autoWaveTimer) clearTimeout(state.autoWaveTimer);

      // Scale delay by game speed (650ms at 1x, 325ms at 2x, 217ms at 3x)
      const delay = 650 / state.gameSpeed;

      const timer = setTimeout(() => {
        const currentState = getState();
        if (currentState.running && !currentState.waveActive && shouldAutoStartNextWave(currentState)) {
          startWave();
        }
      }, delay);

      setAutoWaveTimer(timer);
    }

    // Check win condition
    if (state.gameMode !== 'endless' && state.mapData && state.wave >= state.mapData.waves) {
      // Victory celebration effect
      createVictoryEffect();

      updateRunStats({ result: 'win' });
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
  enableAutoQuality(true);

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
  enableAutoQuality(false);
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
