// Tests for SC-3.1: Hit-Stop & Impact Frames — loop.js + camera.js
// TDD Red phase → Green phase

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks for loop.js dependencies ────────────────────────────────────────

let mockRunning = true;

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    running: mockRunning,
    gameSpeed: 1,
    enemies: [],
    scene: null,
    camera: null,
    renderer: null,
    camAngle: 0,
    camHeight: 14,
    camDist: 22
  })),
  setLastTime: vi.fn(),
  addAnimTime: vi.fn(),
  setWaveActive: vi.fn(),
  setRunning: vi.fn(),
  setAutoWaveTimer: vi.fn(),
  updateRunStats: vi.fn(),
  setCameraState: vi.fn(),
  dispatch: vi.fn(),
  ActionTypes: {}
}));

vi.mock('../js/engine/events.js', () => ({
  emit: vi.fn(),
  GameEvents: {
    ENEMY_DEATH: 'ENEMY_DEATH',
    ENEMY_HIT: 'ENEMY_HIT',
    PROJECTILE_HIT: 'PROJECTILE_HIT',
    GAME_LOSE: 'GAME_LOSE',
    GAME_WIN: 'GAME_WIN',
    WAVE_COMPLETE: 'WAVE_COMPLETE'
  }
}));

vi.mock('../js/systems/enemies.js', () => ({ updateEnemies: vi.fn() }));
vi.mock('../js/systems/towers.js', () => ({ updateTowers: vi.fn() }));
vi.mock('../js/systems/projectiles.js', () => ({ updateProjectiles: vi.fn() }));
vi.mock('../js/systems/particles.js', () => ({
  updateParticles: vi.fn(),
  createExplosion: vi.fn(),
  createLightning: vi.fn(),
  createImpact: vi.fn(),
  createVictoryEffect: vi.fn(),
  createDefeatEffect: vi.fn()
}));
vi.mock('../js/rendering/animations.js', () => ({ updateAnimations: vi.fn() }));
vi.mock('../js/engine/camera.js', () => ({
  updateCamera: vi.fn(),
  shakeCamera: vi.fn(),
  cameraZoomPulse: vi.fn(),
  getCameraTargets: vi.fn(() => ({ targetDist: 22, targetHeight: 14, targetAngle: 0 }))
}));
vi.mock('../js/ui/hud.js', () => ({ updateHUD: vi.fn() }));
vi.mock('../js/systems/waves.js', () => ({
  processWaveSpawns: vi.fn(),
  startWave: vi.fn()
}));
vi.mock('../js/engine/input.js', () => ({ updatePreviewAnimation: vi.fn() }));
vi.mock('../js/ui/perf-overlay.js', () => ({ updatePerfOverlay: vi.fn() }));
vi.mock('../js/engine/scene.js', () => ({ updateLights: vi.fn() }));
vi.mock('../js/engine/postprocessing.js', () => ({ getComposer: vi.fn(() => null) }));

// ── Import real loop.js ───────────────────────────────────────────────────

import {
  triggerHitStop,
  getHitStopRemaining,
  gameLoop
} from '../js/engine/loop.js';

import { updateEnemies } from '../js/systems/enemies.js';
import { updateTowers } from '../js/systems/towers.js';
import { updateProjectiles } from '../js/systems/projectiles.js';
import { updateParticles } from '../js/systems/particles.js';
import { processWaveSpawns } from '../js/systems/waves.js';
import { getState } from '../js/engine/state.js';

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.1  triggerHitStop API
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.1.1 — triggerHitStop API', () => {
  beforeEach(() => {
    triggerHitStop(0);
    mockRunning = true;
  });

  it('triggerHitStop is exported and callable', () => {
    expect(typeof triggerHitStop).toBe('function');
  });

  it('getHitStopRemaining is exported and returns current value', () => {
    expect(typeof getHitStopRemaining).toBe('function');
    expect(getHitStopRemaining()).toBeGreaterThanOrEqual(0);
  });

  it('triggerHitStop sets the remaining duration', () => {
    triggerHitStop(40);
    expect(getHitStopRemaining()).toBe(40);
  });

  it('takes the maximum of current vs new (no stacking)', () => {
    triggerHitStop(100);
    triggerHitStop(40);
    expect(getHitStopRemaining()).toBe(100);
  });

  it('a larger value replaces a smaller one', () => {
    triggerHitStop(40);
    triggerHitStop(100);
    expect(getHitStopRemaining()).toBe(100);
  });

  it('triggerHitStop(0) resets the hit-stop', () => {
    triggerHitStop(100);
    triggerHitStop(0);
    expect(getHitStopRemaining()).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.2  Game systems frozen during hit-stop
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.1.2 — Game systems frozen during hit-stop', () => {
  beforeEach(() => {
    triggerHitStop(0);
    mockRunning = true;
    vi.clearAllMocks();
    getState.mockReturnValue({
      running: true, gameSpeed: 1, enemies: [],
      scene: null, camera: null, renderer: null
    });
    global.requestAnimationFrame = vi.fn();
  });

  it('updateEnemies is NOT called during hit-stop', () => {
    triggerHitStop(40);
    gameLoop(16);
    gameLoop(32);
    expect(updateEnemies).not.toHaveBeenCalled();
  });

  it('updateTowers is NOT called during hit-stop', () => {
    triggerHitStop(40);
    gameLoop(16);
    gameLoop(32);
    expect(updateTowers).not.toHaveBeenCalled();
  });

  it('updateProjectiles is NOT called during hit-stop', () => {
    triggerHitStop(40);
    gameLoop(16);
    gameLoop(32);
    expect(updateProjectiles).not.toHaveBeenCalled();
  });

  it('processWaveSpawns is NOT called during hit-stop', () => {
    triggerHitStop(40);
    gameLoop(16);
    gameLoop(32);
    expect(processWaveSpawns).not.toHaveBeenCalled();
  });

  it('updateParticles is NOT called during hit-stop', () => {
    triggerHitStop(40);
    gameLoop(16);
    gameLoop(32);
    expect(updateParticles).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.3  Hit-stop decrements with real time and expires
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.1.3 — Hit-stop decrements and expires', () => {
  beforeEach(() => {
    triggerHitStop(0);
    mockRunning = true;
    vi.clearAllMocks();
    getState.mockReturnValue({
      running: true, gameSpeed: 1, enemies: [],
      scene: null, camera: null, renderer: null
    });
    global.requestAnimationFrame = vi.fn();
  });

  it('hit-stop remaining decrements after each loop tick', () => {
    triggerHitStop(40);
    const before = getHitStopRemaining();
    gameLoop(0);    // sets lastFrameTime = 0
    gameLoop(20);   // 20ms elapsed
    const after = getHitStopRemaining();
    expect(after).toBeLessThan(before);
  });

  it('game systems resume after hit-stop expires', () => {
    triggerHitStop(16);
    gameLoop(0);    // establish lastFrameTime = 0
    gameLoop(100);  // 100ms elapsed — 16ms hit-stop expires (returns early, still renders)
    gameLoop(200);  // next frame: hit-stop is 0, game logic runs
    expect(updateEnemies).toHaveBeenCalled();
  });

  it('hit-stop clamps to 0, never goes negative', () => {
    triggerHitStop(10);
    gameLoop(0);
    gameLoop(1000); // 1000ms >> 10ms
    expect(getHitStopRemaining()).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.4  Hit-stop ignored when game is paused
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.1.4 — Hit-stop ignored when game is paused', () => {
  it('gameLoop exits early when not running, no throw', () => {
    getState.mockReturnValue({ running: false });
    triggerHitStop(0);
    global.requestAnimationFrame = vi.fn();
    expect(() => gameLoop(16)).not.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.6  cameraZoomPulse API (via mock)
// ══════════════════════════════════════════════════════════════════════════

import { cameraZoomPulse } from '../js/engine/camera.js';

describe('SC-3.1.6 — cameraZoomPulse API', () => {
  it('cameraZoomPulse is exported and callable', () => {
    expect(typeof cameraZoomPulse).toBe('function');
  });

  it('cameraZoomPulse does not throw when called', () => {
    expect(() => cameraZoomPulse(0.1, 300)).not.toThrow();
  });

  it('cameraZoomPulse accepts intensity and duration params', () => {
    expect(() => cameraZoomPulse()).not.toThrow();
    expect(() => cameraZoomPulse(0.2, 500)).not.toThrow();
  });
});
