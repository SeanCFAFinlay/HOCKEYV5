// Tests for SC-3.1: Hit-Stop & Impact Frames — damage.js integration
// Tests that damage.js calls triggerHitStop correctly

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock loop.js FIRST (hoisted) ──────────────────────────────────────────

vi.mock('../js/engine/loop.js', () => ({
  triggerHitStop: vi.fn(),
  getHitStopRemaining: vi.fn(() => 0),
  gameLoop: vi.fn(),
  startGameLoop: vi.fn(),
  stopGameLoop: vi.fn(),
  getGameTime: vi.fn(() => 0),
  resetGameTime: vi.fn()
}));

// ── Mock camera.js ────────────────────────────────────────────────────────

vi.mock('../js/engine/camera.js', () => ({
  updateCamera: vi.fn(),
  cameraZoomPulse: vi.fn(),
  triggerCameraShake: vi.fn(),
  shakeCamera: vi.fn(),
  getCameraTargets: vi.fn(() => ({ targetDist: 22, targetHeight: 14, targetAngle: 0 }))
}));

// ── Mock state, events, particles ────────────────────────────────────────

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({ scene: null, enemies: [] }))
}));

vi.mock('../js/engine/events.js', () => ({
  emit: vi.fn(),
  GameEvents: {
    ENEMY_HIT: 'ENEMY_HIT',
    ENEMY_DEATH: 'ENEMY_DEATH',
    PROJECTILE_HIT: 'PROJECTILE_HIT'
  }
}));

vi.mock('../js/systems/particles.js', () => ({
  createExplosion: vi.fn(),
  createLightning: vi.fn(),
  createImpact: vi.fn()
}));

// ── Import damage.js under test ───────────────────────────────────────────

import { hurtEnemy } from '../js/systems/damage.js';
import { triggerHitStop } from '../js/engine/loop.js';
import { cameraZoomPulse } from '../js/engine/camera.js';

// ══════════════════════════════════════════════════════════════════════════
// SC-3.1.5  damage.js integration — triggerHitStop called on death
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.1.5 — damage.js calls triggerHitStop on enemy death', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls triggerHitStop(40) when a regular enemy dies', () => {
    const enemy = { hp: 10, armor: 0, boss: false, mesh: null };
    hurtEnemy(enemy, 10);
    expect(triggerHitStop).toHaveBeenCalledWith(40);
  });

  it('calls triggerHitStop(100) when a boss enemy dies', () => {
    const enemy = { hp: 10, armor: 0, boss: true, mesh: null };
    hurtEnemy(enemy, 10);
    expect(triggerHitStop).toHaveBeenCalledWith(100);
  });

  it('calls cameraZoomPulse on boss death', () => {
    const enemy = { hp: 10, armor: 0, boss: true, mesh: null };
    hurtEnemy(enemy, 10);
    expect(cameraZoomPulse).toHaveBeenCalledWith(0.1, 300);
  });

  it('does NOT call cameraZoomPulse on regular enemy death', () => {
    const enemy = { hp: 10, armor: 0, boss: false, mesh: null };
    hurtEnemy(enemy, 10);
    expect(cameraZoomPulse).not.toHaveBeenCalled();
  });

  it('calls triggerHitStop(16) on a critical hit (non-lethal)', () => {
    const enemy = { hp: 1000, armor: 0, boss: false, mesh: null };
    hurtEnemy(enemy, 10, true); // isCrit=true, non-lethal
    expect(triggerHitStop).toHaveBeenCalledWith(16);
  });

  it('does NOT call triggerHitStop on non-crit non-lethal hit', () => {
    const enemy = { hp: 1000, armor: 0, boss: false, mesh: null };
    hurtEnemy(enemy, 10, false);
    expect(triggerHitStop).not.toHaveBeenCalled();
  });

  it('death hit-stop takes priority over crit (boss dies on crit)', () => {
    const enemy = { hp: 10, armor: 0, boss: true, mesh: null };
    hurtEnemy(enemy, 10, true); // crit kill
    // Should call with 100 (boss death), not 16 (crit)
    expect(triggerHitStop).toHaveBeenCalledWith(100);
    expect(triggerHitStop).not.toHaveBeenCalledWith(16);
  });
});
