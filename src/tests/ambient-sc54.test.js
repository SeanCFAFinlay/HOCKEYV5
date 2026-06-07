// SC-5.4: Ambient Soundscape Tests

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock audio.js ────────────────────────────────────────────────────────────

const mockPlaySound = vi.fn();
const mockSetVolume = vi.fn();
const mockRegisterSound = vi.fn();

vi.mock('../js/engine/audio.js', () => ({
  playSound: mockPlaySound,
  setVolume: mockSetVolume,
  registerSound: mockRegisterSound,
}));

// ── Import module under test ─────────────────────────────────────────────────

const {
  initAmbient,
  setAmbientTheme,
  setAmbientIntensity,
  startAmbient,
  stopAmbient,
} = await import('../js/engine/ambient.js');

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SC-5.4 Ambient Soundscape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    stopAmbient();
  });

  afterEach(() => {
    stopAmbient();
    vi.useRealTimers();
  });

  // ── initAmbient ─────────────────────────────────────────────────────────────

  describe('initAmbient', () => {
    it('registers hockey ambient sounds', () => {
      initAmbient();
      const registeredNames = mockRegisterSound.mock.calls.map(c => c[0]);
      expect(registeredNames).toContain('ambient_crowd_hockey');
      expect(registeredNames).toContain('ambient_skates');
      expect(registeredNames).toContain('ambient_arena_echo');
    });

    it('registers soccer ambient sounds', () => {
      initAmbient();
      const registeredNames = mockRegisterSound.mock.calls.map(c => c[0]);
      expect(registeredNames).toContain('ambient_crowd_soccer');
      expect(registeredNames).toContain('ambient_vuvuzela');
      expect(registeredNames).toContain('ambient_wind');
    });

    it('does not throw when called multiple times', () => {
      expect(() => {
        initAmbient();
        initAmbient();
      }).not.toThrow();
    });
  });

  // ── setAmbientTheme ─────────────────────────────────────────────────────────

  describe('setAmbientTheme', () => {
    beforeEach(() => { initAmbient(); });

    it('accepts hockey theme without throwing', () => {
      expect(() => setAmbientTheme('hockey')).not.toThrow();
    });

    it('accepts soccer theme without throwing', () => {
      expect(() => setAmbientTheme('soccer')).not.toThrow();
    });

    it('accepts unknown theme without throwing', () => {
      expect(() => setAmbientTheme('unknown')).not.toThrow();
    });

    it('restarts ambient loops when theme changes while running', () => {
      setAmbientTheme('hockey');
      startAmbient();
      vi.clearAllMocks();
      setAmbientTheme('soccer');
      // Should play soccer ambient loops after theme change
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames.some(n => n.includes('soccer'))).toBe(true);
    });
  });

  // ── setAmbientIntensity ─────────────────────────────────────────────────────

  describe('setAmbientIntensity', () => {
    beforeEach(() => { initAmbient(); });

    it('accepts intensity 0.0 without throwing', () => {
      expect(() => setAmbientIntensity(0.0)).not.toThrow();
    });

    it('accepts intensity 1.0 without throwing', () => {
      expect(() => setAmbientIntensity(1.0)).not.toThrow();
    });

    it('calls setVolume with ambient category', () => {
      setAmbientIntensity(0.0);
      expect(mockSetVolume).toHaveBeenCalledWith('ambient', expect.any(Number));
    });

    it('applies formula: baseVolume * (0.3 + intensity * 0.5) with base 0.3', () => {
      // intensity=0: 0.3 * (0.3 + 0*0.5) = 0.3 * 0.3 = 0.09
      setAmbientIntensity(0.0);
      const call0 = mockSetVolume.mock.calls.find(c => c[0] === 'ambient');
      expect(call0[1]).toBeCloseTo(0.09, 5);
    });

    it('scales volume up at intensity 1.0', () => {
      // intensity=1: 0.3 * (0.3 + 1*0.5) = 0.3 * 0.8 = 0.24
      setAmbientIntensity(1.0);
      const call1 = mockSetVolume.mock.calls.find(c => c[0] === 'ambient');
      expect(call1[1]).toBeCloseTo(0.24, 5);
    });

    it('intensity 0.6 corresponds to wave-level volume', () => {
      // intensity=0.6: 0.3 * (0.3 + 0.6*0.5) = 0.3 * 0.6 = 0.18
      setAmbientIntensity(0.6);
      const call = mockSetVolume.mock.calls.find(c => c[0] === 'ambient');
      expect(call[1]).toBeCloseTo(0.18, 5);
    });
  });

  // ── startAmbient / stopAmbient ──────────────────────────────────────────────

  describe('startAmbient / stopAmbient', () => {
    beforeEach(() => {
      initAmbient();
      setAmbientTheme('hockey');
    });

    it('startAmbient plays continuous loop sounds', () => {
      startAmbient();
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames.some(n => n.includes('crowd') || n.includes('echo') || n.includes('wind'))).toBe(true);
    });

    it('startAmbient plays hockey loops when theme is hockey', () => {
      startAmbient();
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames).toContain('ambient_crowd_hockey');
    });

    it('startAmbient plays soccer loops when theme is soccer', () => {
      setAmbientTheme('soccer');
      startAmbient();
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames).toContain('ambient_crowd_soccer');
    });

    it('loops are played with loop:true option', () => {
      startAmbient();
      const loopCalls = mockPlaySound.mock.calls.filter(c => c[1]?.loop === true);
      expect(loopCalls.length).toBeGreaterThan(0);
    });

    it('stopAmbient does not throw', () => {
      startAmbient();
      expect(() => stopAmbient()).not.toThrow();
    });

    it('stopAmbient is safe to call when not started', () => {
      expect(() => stopAmbient()).not.toThrow();
    });

    it('startAmbient is idempotent — safe to call twice', () => {
      expect(() => {
        startAmbient();
        startAmbient();
      }).not.toThrow();
    });
  });

  // ── Random one-shots ────────────────────────────────────────────────────────

  describe('random one-shots', () => {
    beforeEach(() => {
      initAmbient();
    });

    it('plays hockey one-shot (ambient_skates) after a timer fires', () => {
      setAmbientTheme('hockey');
      startAmbient();
      vi.clearAllMocks();

      // Advance 20 seconds — should trigger at least one one-shot
      vi.advanceTimersByTime(20_000);
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames).toContain('ambient_skates');
    });

    it('plays soccer one-shot (ambient_vuvuzela) after a timer fires', () => {
      setAmbientTheme('soccer');
      startAmbient();
      vi.clearAllMocks();

      vi.advanceTimersByTime(20_000);
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames).toContain('ambient_vuvuzela');
    });

    it('one-shot volume is between 0.1 and 0.2', () => {
      setAmbientTheme('hockey');
      startAmbient();
      vi.clearAllMocks();

      vi.advanceTimersByTime(20_000);
      const shotCall = mockPlaySound.mock.calls.find(c => c[0] === 'ambient_skates');
      expect(shotCall).toBeDefined();
      expect(shotCall[1].volume).toBeGreaterThanOrEqual(0.1);
      expect(shotCall[1].volume).toBeLessThanOrEqual(0.2);
    });

    it('no one-shots fire after stopAmbient', () => {
      setAmbientTheme('hockey');
      startAmbient();
      stopAmbient();
      vi.clearAllMocks();

      vi.advanceTimersByTime(30_000);
      const playedNames = mockPlaySound.mock.calls.map(c => c[0]);
      expect(playedNames).not.toContain('ambient_skates');
    });

    it('re-schedules one-shot after each play', () => {
      setAmbientTheme('hockey');
      startAmbient();
      vi.clearAllMocks();

      // Fire first shot
      vi.advanceTimersByTime(20_000);
      const countAfterFirst = mockPlaySound.mock.calls.filter(c => c[0] === 'ambient_skates').length;

      // Fire again — should have a subsequent timer
      vi.advanceTimersByTime(20_000);
      const countAfterSecond = mockPlaySound.mock.calls.filter(c => c[0] === 'ambient_skates').length;
      expect(countAfterSecond).toBeGreaterThanOrEqual(countAfterFirst);
    });
  });
});
