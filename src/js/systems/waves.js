// Wave management with game-time based spawning
// No setTimeout - all spawns tied to fixed timestep

import { getState, setWaveActive, incrementWave, setSpawnsPending, decrementSpawnsPending } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { spawnEnemy } from './enemies.js';
import { updateHUD } from '../ui/hud.js';

// Spawn queue state
let spawnQueue = [];
let spawnTimer = 0;
const SPAWN_INTERVAL = 0.45; // 450ms between spawns in game-time

/**
 * Start a new wave
 */
export function startWave() {
  const state = getState();
  const { wave, mapData, WAVES, themeData, waveActive } = state;

  if (waveActive || wave >= mapData.waves) return;

  setWaveActive(true);
  incrementWave();

  const currentWave = state.wave;
  emit(GameEvents.WAVE_START, { wave: currentWave });
  updateHUD();

  const waveData = WAVES[currentWave - 1] || {};

  // Build spawn queue
  spawnQueue = [];
  let totalSpawns = 0;

  Object.entries(waveData).forEach(([id, count]) => {
    const ed = themeData.enemies.find(e => e.id === id);
    if (ed) {
      for (let i = 0; i < count; i++) {
        spawnQueue.push({ ...ed }); // Clone enemy data
        totalSpawns++;
      }
    }
  });

  // Shuffle spawn queue for variety (deterministic with wave seed)
  shuffleArray(spawnQueue, currentWave);

  setSpawnsPending(totalSpawns);
  spawnTimer = 0;
}

/**
 * Process wave spawns - called every fixed timestep
 * @param {number} dt - Fixed delta time
 * @param {number} gameTime - Current game time
 */
export function processWaveSpawns(dt, gameTime) {
  const state = getState();

  if (!state.waveActive || spawnQueue.length === 0) return;

  spawnTimer += dt;

  while (spawnTimer >= SPAWN_INTERVAL && spawnQueue.length > 0) {
    const enemyData = spawnQueue.shift();
    spawnEnemy(enemyData);
    spawnTimer -= SPAWN_INTERVAL;
  }
}

/**
 * Check if wave is complete
 */
export function checkWaveCompletion() {
  const state = getState();

  if (state.waveActive &&
      spawnQueue.length === 0 &&
      state.spawnsPending === 0 &&
      state.enemies.length === 0) {
    setWaveActive(false);
    emit(GameEvents.WAVE_END, { wave: state.wave });
    updateHUD();
    return true;
  }

  return false;
}

/**
 * Toggle auto-wave mode
 */
export function toggleAutoWave() {
  const state = getState();
  state.autoWave = !state.autoWave;

  const b = document.getElementById('autoBtn');
  if (b) {
    b.textContent = state.autoWave ? 'AUTO: ON' : 'AUTO: OFF';
    b.classList.toggle('on', state.autoWave);
  }
}

/**
 * Get remaining spawns in queue
 */
export function getRemainingSpawns() {
  return spawnQueue.length;
}

/**
 * Clear spawn queue (for reset)
 */
export function clearSpawnQueue() {
  spawnQueue = [];
  spawnTimer = 0;
}

/**
 * Deterministic array shuffle using wave number as seed
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Seed value (wave number)
 */
function shuffleArray(array, seed) {
  let m = array.length;
  let t, i;

  // Seeded random function (mulberry32)
  let s = seed;
  const random = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  while (m) {
    i = Math.floor(random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

// Expose to window for HTML onclick
window.startWave = startWave;
window.toggleAutoWave = toggleAutoWave;
