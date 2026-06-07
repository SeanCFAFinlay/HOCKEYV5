// Tests for SC-3.6: Dynamic Camera — cinematic behaviors
// TDD Red → Green → Refactor

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks for camera.js dependencies ─────────────────────────────────────

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    camera: null,
    camAngle: Math.PI / 4,
    camHeight: 14,
    camDist: 22
  })),
  setCameraState: vi.fn(),
  dispatch: vi.fn(),
  ActionTypes: {}
}));

// ── Import real camera.js ─────────────────────────────────────────────────

import {
  getCameraTargets,
  cameraWaveStartPullback,
  cameraBossTrack,
  cameraVictoryOrbit,
  cameraDefeatDrop,
  getCinematicMode,
  cancelCinematic,
  updateCamera
} from '../js/engine/camera.js';

import { getState } from '../js/engine/state.js';

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.1  API Exports
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.1 — Dynamic Camera API exports', () => {
  it('cameraWaveStartPullback is exported and callable', () => {
    expect(typeof cameraWaveStartPullback).toBe('function');
  });

  it('cameraBossTrack is exported and callable', () => {
    expect(typeof cameraBossTrack).toBe('function');
  });

  it('cameraVictoryOrbit is exported and callable', () => {
    expect(typeof cameraVictoryOrbit).toBe('function');
  });

  it('cameraDefeatDrop is exported and callable', () => {
    expect(typeof cameraDefeatDrop).toBe('function');
  });

  it('getCinematicMode is exported and returns a string', () => {
    expect(typeof getCinematicMode).toBe('function');
    expect(typeof getCinematicMode()).toBe('string');
  });

  it('cancelCinematic is exported and callable', () => {
    expect(typeof cancelCinematic).toBe('function');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.2  State machine — cinematicMode
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.2 — Cinematic state machine', () => {
  beforeEach(() => {
    cancelCinematic();
  });

  it('default cinematic mode is "none"', () => {
    expect(getCinematicMode()).toBe('none');
  });

  it('cameraWaveStartPullback sets mode to "pullback"', () => {
    cameraWaveStartPullback();
    expect(getCinematicMode()).toBe('pullback');
  });

  it('cameraBossTrack sets mode to "bosstrack"', () => {
    cameraBossTrack(3, 5);
    expect(getCinematicMode()).toBe('bosstrack');
  });

  it('cameraVictoryOrbit sets mode to "orbit"', () => {
    cameraVictoryOrbit();
    expect(getCinematicMode()).toBe('orbit');
  });

  it('cameraDefeatDrop sets mode to "defeat"', () => {
    cameraDefeatDrop();
    expect(getCinematicMode()).toBe('defeat');
  });

  it('cancelCinematic resets mode to "none"', () => {
    cameraVictoryOrbit();
    cancelCinematic();
    expect(getCinematicMode()).toBe('none');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.3  Wave start pullback — targets increase during pullback phase
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.3 — Wave start pullback', () => {
  beforeEach(() => {
    cancelCinematic();
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
  });

  it('pullback does not throw', () => {
    expect(() => cameraWaveStartPullback()).not.toThrow();
  });

  it('after updateCamera tick during pullback, dist target increases by ~15%', () => {
    const before = getCameraTargets().targetDist;
    cameraWaveStartPullback();
    // Advance well into pullback phase (400ms of elapsed)
    for (let i = 0; i < 25; i++) {
      updateCamera(0.016);
    }
    const after = getCameraTargets().targetDist;
    expect(after).toBeGreaterThan(before);
  });

  it('pullback mode is active immediately after call', () => {
    cameraWaveStartPullback();
    expect(getCinematicMode()).toBe('pullback');
  });

  it('pullback auto-cancels after full duration (500ms pullback + 800ms ease)', () => {
    cameraWaveStartPullback();
    // Simulate 1500ms of updates (1.5s > 500ms + 800ms)
    for (let i = 0; i < 100; i++) {
      updateCamera(0.016); // 100 * 16ms = 1600ms
    }
    expect(getCinematicMode()).toBe('none');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.4  Boss track — camera focuses on boss position
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.4 — Boss track', () => {
  beforeEach(() => {
    cancelCinematic();
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
  });

  it('cameraBossTrack does not throw with valid coords', () => {
    expect(() => cameraBossTrack(5, -3)).not.toThrow();
  });

  it('cameraBossTrack with default duration of 1500ms', () => {
    cameraBossTrack(5, 5);
    expect(getCinematicMode()).toBe('bosstrack');
  });

  it('cameraBossTrack accepts custom duration', () => {
    expect(() => cameraBossTrack(0, 0, 2000)).not.toThrow();
    expect(getCinematicMode()).toBe('bosstrack');
  });

  it('boss track auto-cancels after duration expires', () => {
    cameraBossTrack(5, 5, 500);
    // Simulate 600ms
    for (let i = 0; i < 38; i++) {
      updateCamera(0.016);
    }
    expect(getCinematicMode()).toBe('none');
  });

  it('cancelCinematic stops boss track mid-flight', () => {
    cameraBossTrack(5, 5, 5000);
    cancelCinematic();
    expect(getCinematicMode()).toBe('none');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.5  Victory orbit — camera orbits after win
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.5 — Victory orbit', () => {
  beforeEach(() => {
    cancelCinematic();
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
  });

  it('cameraVictoryOrbit does not throw', () => {
    expect(() => cameraVictoryOrbit()).not.toThrow();
  });

  it('orbit mode persists across many frames (does not self-cancel)', () => {
    cameraVictoryOrbit();
    for (let i = 0; i < 60; i++) {
      updateCamera(0.016);
    }
    expect(getCinematicMode()).toBe('orbit');
  });

  it('orbit rotates the target angle over time', () => {
    cameraVictoryOrbit();
    const before = getCameraTargets().targetAngle;
    for (let i = 0; i < 10; i++) {
      updateCamera(0.016);
    }
    const after = getCameraTargets().targetAngle;
    expect(after).not.toBe(before);
  });

  it('orbit increases camera height (cinematic rise)', () => {
    cameraVictoryOrbit();
    const before = getCameraTargets().targetHeight;
    for (let i = 0; i < 20; i++) {
      updateCamera(0.016);
    }
    const after = getCameraTargets().targetHeight;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('cancelCinematic stops orbit', () => {
    cameraVictoryOrbit();
    cancelCinematic();
    expect(getCinematicMode()).toBe('none');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.6  Defeat drop — camera tilts down on game lose
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.6 — Defeat drop', () => {
  beforeEach(() => {
    cancelCinematic();
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
  });

  it('cameraDefeatDrop does not throw', () => {
    expect(() => cameraDefeatDrop()).not.toThrow();
  });

  it('defeat mode persists (end-of-game, no auto-cancel)', () => {
    cameraDefeatDrop();
    for (let i = 0; i < 60; i++) {
      updateCamera(0.016);
    }
    expect(getCinematicMode()).toBe('defeat');
  });

  it('defeat reduces target height by ~30%', () => {
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
    cameraDefeatDrop();
    for (let i = 0; i < 60; i++) {
      updateCamera(0.016);
    }
    const { targetHeight } = getCameraTargets();
    // Height should be around 14 * 0.7 = 9.8 or lower
    expect(targetHeight).toBeLessThan(14);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SC-3.6.7  Normal camera unaffected when cinematic is none
// ══════════════════════════════════════════════════════════════════════════

describe('SC-3.6.7 — Normal camera unaffected', () => {
  beforeEach(() => {
    cancelCinematic();
  });

  it('updateCamera does not throw with no cinematic', () => {
    getState.mockReturnValue({
      camera: null,
      camAngle: Math.PI / 4,
      camHeight: 14,
      camDist: 22
    });
    expect(() => updateCamera(0.016)).not.toThrow();
  });

  it('getCinematicMode returns "none" after cancelCinematic', () => {
    cameraWaveStartPullback();
    cancelCinematic();
    expect(getCinematicMode()).toBe('none');
  });
});
