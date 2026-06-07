// SC-5.2: Sound Effects Integration Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock audio module ──────────────────────────────────────────────────────────
const mockPlaySound = vi.fn();
const mockPlaySoundAt = vi.fn();
const mockRegisterSound = vi.fn();

vi.mock('../js/engine/audio.js', () => ({
  playSound: mockPlaySound,
  playSoundAt: mockPlaySoundAt,
  registerSound: mockRegisterSound,
  initAudio: vi.fn(),
}));

// ── Import module under test ────────────────────────────────────────────────────
const { SOUNDS, registerAllSounds } = await import('../js/config/sounds.js');

describe('SC-5.2 Sound Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── SOUNDS catalogue ────────────────────────────────────────────────────────

  describe('SOUNDS constant', () => {
    it('exports a SOUNDS object', () => {
      expect(SOUNDS).toBeDefined();
      expect(typeof SOUNDS).toBe('object');
    });

    it('contains all required sound keys', () => {
      const required = [
        'towerPlace', 'towerFire', 'towerSell',
        'enemyDeath', 'enemyDeathBoss',
        'waveStart', 'waveComplete',
        'moneyGain', 'upgrade', 'uiClick',
        'gameWin', 'gameLose',
      ];
      for (const key of required) {
        expect(SOUNDS).toHaveProperty(key);
      }
    });

    it('each sound entry has a url property', () => {
      for (const [name, entry] of Object.entries(SOUNDS)) {
        expect(entry).toHaveProperty('url', expect.any(String));
      }
    });

    it('each sound entry has category "sfx"', () => {
      for (const [name, entry] of Object.entries(SOUNDS)) {
        expect(entry.category).toBe('sfx');
      }
    });

    it('sound URLs are non-empty strings', () => {
      for (const [name, entry] of Object.entries(SOUNDS)) {
        expect(entry.url.length).toBeGreaterThan(0);
      }
    });
  });

  // ── registerAllSounds ────────────────────────────────────────────────────────

  describe('registerAllSounds', () => {
    it('exports registerAllSounds function', () => {
      expect(typeof registerAllSounds).toBe('function');
    });

    it('calls registerSound for each sound in SOUNDS', () => {
      registerAllSounds();
      const expectedCount = Object.keys(SOUNDS).length;
      expect(mockRegisterSound).toHaveBeenCalledTimes(expectedCount);
    });

    it('calls registerSound with correct name and url', () => {
      registerAllSounds();
      for (const [name, entry] of Object.entries(SOUNDS)) {
        expect(mockRegisterSound).toHaveBeenCalledWith(name, entry.url);
      }
    });

    it('does not throw when called multiple times', () => {
      expect(() => {
        registerAllSounds();
        registerAllSounds();
      }).not.toThrow();
    });
  });
});

// ── Fire sound throttling ────────────────────────────────────────────────────────
describe('SC-5.2 Fire Sound Throttling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('playFireSound exists as an exported function', async () => {
    const mod = await import('../js/config/sounds.js');
    expect(typeof mod.playFireSound).toBe('function');
  });

  it('plays sound when tower has no previous fire sound timestamp', async () => {
    vi.clearAllMocks();
    const { playFireSound } = await import('../js/config/sounds.js');
    const tower = { x: 0, y: 0 };
    playFireSound(tower, 0, 0);
    expect(mockPlaySoundAt).toHaveBeenCalledWith('towerFire', 0, 0);
  });

  it('throttles fire sound: does not play within 100ms', async () => {
    vi.clearAllMocks();
    const { playFireSound } = await import('../js/config/sounds.js');
    const tower = { x: 1, y: 1 };
    const now = Date.now();
    tower._lastFireSoundMs = now - 50; // 50ms ago — should be throttled
    playFireSound(tower, 1, 1);
    expect(mockPlaySoundAt).not.toHaveBeenCalled();
  });

  it('plays fire sound when > 100ms have elapsed since last play', async () => {
    vi.clearAllMocks();
    const { playFireSound } = await import('../js/config/sounds.js');
    const tower = { x: 2, y: 2 };
    tower._lastFireSoundMs = Date.now() - 200; // 200ms ago — should play
    playFireSound(tower, 2, 2);
    expect(mockPlaySoundAt).toHaveBeenCalledWith('towerFire', 2, 2);
  });

  it('updates _lastFireSoundMs on tower after playing', async () => {
    vi.clearAllMocks();
    const { playFireSound } = await import('../js/config/sounds.js');
    const tower = { x: 3, y: 3 };
    const before = Date.now();
    playFireSound(tower, 3, 3);
    expect(tower._lastFireSoundMs).toBeGreaterThanOrEqual(before);
  });
});
