// SC-5.3: Music System Tests
// TDD Red phase: describe desired behavior for music state manager

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── Mock audio.js ───────────────────────────────────────────────────────────

const mockPlayMusic = vi.fn();
const mockStopMusic = vi.fn();
const mockRegisterSound = vi.fn();

vi.mock('../js/engine/audio.js', () => ({
  playMusic: mockPlayMusic,
  stopMusic: mockStopMusic,
  registerSound: mockRegisterSound,
}));

// ── Mock events.js ──────────────────────────────────────────────────────────

const eventHandlers = {};
const mockOn = vi.fn((event, handler) => {
  if (!eventHandlers[event]) eventHandlers[event] = [];
  eventHandlers[event].push(handler);
  return () => {};
});

const mockGameEvents = {
  WAVE_START: 'wave:start',
  WAVE_END: 'wave:end',
  GAME_WIN: 'game:win',
  GAME_LOSE: 'game:lose',
  GAME_START: 'game:start',
};

vi.mock('../js/engine/events.js', () => ({
  on: mockOn,
  GameEvents: {
    WAVE_START: 'wave:start',
    WAVE_END: 'wave:end',
    GAME_WIN: 'game:win',
    GAME_LOSE: 'game:lose',
    GAME_START: 'game:start',
  },
}));

// Helper: emit mock events
function emitEvent(event, payload) {
  const handlers = eventHandlers[event] || [];
  handlers.forEach(h => h(payload));
}

// ── Import module under test ────────────────────────────────────────────────

const { initMusic, setMusicState, getMusicState } = await import('../js/engine/music.js');

// ── Tests ───────────────────────────────────────────────────────────────────

describe('SC-5.3 Music System', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear event handlers
    Object.keys(eventHandlers).forEach(k => delete eventHandlers[k]);
    // Re-initialize for each test
    initMusic();
  });

  // ── initMusic ──────────────────────────────────────────────────────────────

  describe('initMusic', () => {
    it('registers all 5 music tracks on init', () => {
      expect(mockRegisterSound).toHaveBeenCalledTimes(5);
    });

    it('registers music_menu track', () => {
      expect(mockRegisterSound).toHaveBeenCalledWith('music_menu', expect.any(String));
    });

    it('registers music_gameplay track', () => {
      expect(mockRegisterSound).toHaveBeenCalledWith('music_gameplay', expect.any(String));
    });

    it('registers music_boss track', () => {
      expect(mockRegisterSound).toHaveBeenCalledWith('music_boss', expect.any(String));
    });

    it('registers music_victory track', () => {
      expect(mockRegisterSound).toHaveBeenCalledWith('music_victory', expect.any(String));
    });

    it('registers music_defeat track', () => {
      expect(mockRegisterSound).toHaveBeenCalledWith('music_defeat', expect.any(String));
    });

    it('subscribes to game events', () => {
      expect(mockOn).toHaveBeenCalled();
    });
  });

  // ── getMusicState / setMusicState ──────────────────────────────────────────

  describe('getMusicState', () => {
    it('returns null before any state is set', () => {
      // fresh initMusic resets state
      expect(getMusicState()).toBeNull();
    });
  });

  describe('setMusicState', () => {
    it('sets state to menu and plays music_menu', () => {
      setMusicState('menu');
      expect(getMusicState()).toBe('menu');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_menu');
    });

    it('sets state to gameplay and plays music_gameplay', () => {
      setMusicState('gameplay');
      expect(getMusicState()).toBe('gameplay');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_gameplay');
    });

    it('sets state to boss and plays music_boss', () => {
      setMusicState('boss');
      expect(getMusicState()).toBe('boss');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_boss');
    });

    it('sets state to victory, stops current and plays music_victory', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      setMusicState('victory');
      expect(getMusicState()).toBe('victory');
      expect(mockStopMusic).toHaveBeenCalledWith(2000);
      expect(mockPlayMusic).toHaveBeenCalledWith('music_victory');
    });

    it('sets state to defeat, stops current and plays music_defeat', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      setMusicState('defeat');
      expect(getMusicState()).toBe('defeat');
      expect(mockStopMusic).toHaveBeenCalledWith(2000);
      expect(mockPlayMusic).toHaveBeenCalledWith('music_defeat');
    });

    it('crossfades when changing between looping tracks (menu → gameplay)', () => {
      setMusicState('menu');
      vi.clearAllMocks();

      setMusicState('gameplay');
      expect(mockStopMusic).toHaveBeenCalledWith(2000);
      expect(mockPlayMusic).toHaveBeenCalledWith('music_gameplay');
    });

    it('does not re-trigger when same state set twice', () => {
      setMusicState('menu');
      vi.clearAllMocks();

      setMusicState('menu');
      expect(mockPlayMusic).not.toHaveBeenCalled();
    });

    it('does not throw on unknown state', () => {
      expect(() => setMusicState('unknown_state')).not.toThrow();
    });

    it('handles rapid state transitions without crashing', () => {
      expect(() => {
        setMusicState('menu');
        setMusicState('gameplay');
        setMusicState('boss');
        setMusicState('victory');
        setMusicState('defeat');
      }).not.toThrow();
    });
  });

  // ── Event-driven transitions ───────────────────────────────────────────────

  describe('event-driven music transitions', () => {
    it('switches to boss music on boss wave start (wave % 5 === 0)', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      emitEvent('wave:start', { wave: 5 });
      expect(getMusicState()).toBe('boss');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_boss');
    });

    it('switches to boss music on wave 10', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      emitEvent('wave:start', { wave: 10 });
      expect(getMusicState()).toBe('boss');
    });

    it('does NOT switch to boss music on non-boss wave (wave 3)', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      emitEvent('wave:start', { wave: 3 });
      expect(getMusicState()).toBe('gameplay');
      expect(mockPlayMusic).not.toHaveBeenCalled();
    });

    it('returns to gameplay music after boss wave ends', () => {
      setMusicState('boss');
      vi.clearAllMocks();

      emitEvent('wave:end', { wave: 5 });
      expect(getMusicState()).toBe('gameplay');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_gameplay');
    });

    it('switches to victory music on GAME_WIN', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      emitEvent('game:win', {});
      expect(getMusicState()).toBe('victory');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_victory');
    });

    it('switches to defeat music on GAME_LOSE', () => {
      setMusicState('gameplay');
      vi.clearAllMocks();

      emitEvent('game:lose', {});
      expect(getMusicState()).toBe('defeat');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_defeat');
    });

    it('switches to gameplay music on GAME_START', () => {
      setMusicState('menu');
      vi.clearAllMocks();

      emitEvent('game:start', {});
      expect(getMusicState()).toBe('gameplay');
      expect(mockPlayMusic).toHaveBeenCalledWith('music_gameplay');
    });

    it('does not return to gameplay after boss wave ends if game is over', () => {
      setMusicState('defeat');
      vi.clearAllMocks();

      emitEvent('wave:end', { wave: 5 });
      // Should not override a terminal state
      expect(getMusicState()).toBe('defeat');
    });
  });

  // ── Crossfade behavior ────────────────────────────────────────────────────

  describe('crossfade behavior', () => {
    it('crossfade uses 2000ms fade duration', () => {
      setMusicState('menu');
      vi.clearAllMocks();

      setMusicState('gameplay');
      expect(mockStopMusic).toHaveBeenCalledWith(2000);
    });

    it('no stopMusic call when transitioning FROM null (first play)', () => {
      // state is null after initMusic
      setMusicState('menu');
      expect(mockStopMusic).not.toHaveBeenCalled();
      expect(mockPlayMusic).toHaveBeenCalledWith('music_menu');
    });
  });

});
