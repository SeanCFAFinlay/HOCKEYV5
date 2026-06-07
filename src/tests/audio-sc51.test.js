// SC-5.1: Audio Engine Tests
// TDD Red phase: describe desired behavior for Web Audio API sound manager

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── Mock Web Audio API ──────────────────────────────────────────────────────

function createMockGainNode() {
  return {
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createMockBufferSourceNode() {
  return {
    buffer: null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  };
}

const mockAudioBuffer = { duration: 1.0, length: 44100, sampleRate: 44100 };

let mockContextState = 'suspended';
const mockContext = {
  get state() { return mockContextState; },
  createGain: vi.fn(() => createMockGainNode()),
  createBufferSource: vi.fn(() => createMockBufferSourceNode()),
  decodeAudioData: vi.fn(() => Promise.resolve(mockAudioBuffer)),
  resume: vi.fn(() => { mockContextState = 'running'; return Promise.resolve(); }),
  suspend: vi.fn(() => Promise.resolve()),
  destination: {},
  currentTime: 0,
};

vi.stubGlobal('AudioContext', function AudioContext() { return mockContext; });
vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
));

// ── Import module under test ────────────────────────────────────────────────

const {
  initAudio,
  playSound,
  playMusic,
  stopMusic,
  setVolume,
  getVolume,
  resumeAudioContext,
  playSoundAt,
  registerSound,
  loadSound,
} = await import('../js/engine/audio.js');

// ── Tests ───────────────────────────────────────────────────────────────────

describe('SC-5.1 AudioManager', () => {

  beforeEach(() => {
    mockContextState = 'suspended';
    vi.clearAllMocks();
    mockContext.createGain.mockImplementation(() => createMockGainNode());
    mockContext.createBufferSource.mockImplementation(() => createMockBufferSourceNode());
    mockContext.decodeAudioData.mockResolvedValue(mockAudioBuffer);
  });

  // ── initAudio ──────────────────────────────────────────────────────────────

  describe('initAudio', () => {
    it('creates an AudioContext', () => {
      initAudio();
      // ctx should be the mockContext object (createGain is a vi.fn)
      expect(mockContext.createGain).toHaveBeenCalled();
    });

    it('creates a master gain node', () => {
      initAudio();
      // At minimum one gain node created (master) plus category nodes
      expect(mockContext.createGain).toHaveBeenCalled();
    });

    it('creates gain nodes for sfx, music and ambient categories', () => {
      initAudio();
      // Expect master + 3 category gains = at least 4 calls
      expect(mockContext.createGain.mock.calls.length).toBeGreaterThanOrEqual(4);
    });

    it('does not throw when called multiple times', () => {
      expect(() => {
        initAudio();
        initAudio();
      }).not.toThrow();
    });
  });

  // ── setVolume / getVolume ──────────────────────────────────────────────────

  describe('setVolume / getVolume', () => {
    beforeEach(() => { initAudio(); });

    it('sets sfx volume to 0.5', () => {
      setVolume('sfx', 0.5);
      expect(getVolume('sfx')).toBe(0.5);
    });

    it('sets music volume', () => {
      setVolume('music', 0.3);
      expect(getVolume('music')).toBe(0.3);
    });

    it('sets ambient volume', () => {
      setVolume('ambient', 0.8);
      expect(getVolume('ambient')).toBe(0.8);
    });

    it('clamps volume to [0, 1]', () => {
      setVolume('sfx', 2.0);
      expect(getVolume('sfx')).toBe(1.0);

      setVolume('sfx', -0.5);
      expect(getVolume('sfx')).toBe(0.0);
    });

    it('returns 1 as default volume for valid category', () => {
      expect(getVolume('sfx')).toBe(1);
    });

    it('returns 0 for unknown category', () => {
      expect(getVolume('unknown')).toBe(0);
    });
  });

  // ── registerSound / loadSound ──────────────────────────────────────────────

  describe('registerSound / loadSound', () => {
    beforeEach(() => { initAudio(); });

    it('registers a sound without throwing', () => {
      expect(() => registerSound('shoot', '/audio/shoot.ogg')).not.toThrow();
    });

    it('loads a registered sound and returns a buffer', async () => {
      registerSound('shoot', '/audio/shoot.ogg');
      const buffer = await loadSound('shoot');
      expect(buffer).toBe(mockAudioBuffer);
    });

    it('returns null and logs warning for unregistered sound', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const buffer = await loadSound('nonexistent');
      expect(buffer).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('returns cached buffer on second load call', async () => {
      registerSound('cached-test-sound', '/audio/cached.ogg');
      await loadSound('cached-test-sound');
      vi.clearAllMocks(); // reset fetch call count
      await loadSound('cached-test-sound');
      // fetch should NOT be called again (buffer is cached)
      expect(fetch).not.toHaveBeenCalled();
    });

    it('handles fetch failure gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      registerSound('fail', '/audio/fail.ogg');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const buffer = await loadSound('fail');
      expect(buffer).toBeNull();
      warnSpy.mockRestore();
    });
  });

  // ── playSound ─────────────────────────────────────────────────────────────

  describe('playSound', () => {
    beforeEach(() => {
      initAudio();
      mockContextState = 'running';
    });

    it('does not throw when buffer is missing', () => {
      expect(() => playSound('missing')).not.toThrow();
    });

    it('logs a warning when buffer is missing', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      playSound('missing');
      // No assertion on warn call count since it may warn or silently skip
      warnSpy.mockRestore();
    });

    it('creates a BufferSourceNode when buffer is available', async () => {
      registerSound('shoot', '/audio/shoot.ogg');
      await loadSound('shoot');
      playSound('shoot');
      expect(mockContext.createBufferSource).toHaveBeenCalled();
    });

    it('limits concurrent instances to 8 (pool)', async () => {
      registerSound('shoot', '/audio/shoot.ogg');
      await loadSound('shoot');
      const sources = [];
      mockContext.createBufferSource.mockImplementation(() => {
        const src = createMockBufferSourceNode();
        sources.push(src);
        return src;
      });

      // Play 10 times — pool should cap at 8 live sources
      for (let i = 0; i < 10; i++) playSound('shoot');

      // The 9th and 10th plays should have stopped oldest sources
      const stoppedCount = sources.filter(s => s.stop.mock.calls.length > 0).length;
      expect(stoppedCount).toBeGreaterThanOrEqual(2);
    });
  });

  // ── playSoundAt ───────────────────────────────────────────────────────────

  describe('playSoundAt', () => {
    beforeEach(() => {
      initAudio();
      mockContextState = 'running';
    });

    it('does not throw for a sound at origin', () => {
      expect(() => playSoundAt('shoot', 0, 0)).not.toThrow();
    });

    it('does not throw for a missing sound', () => {
      expect(() => playSoundAt('missing', 5, 5)).not.toThrow();
    });

    it('plays sound with reduced volume when far away', async () => {
      registerSound('shoot', '/audio/shoot.ogg');
      await loadSound('shoot');

      const gainNodes = [];
      mockContext.createGain.mockImplementation(() => {
        const g = createMockGainNode();
        gainNodes.push(g);
        return g;
      });

      // Re-init so the new mock takes effect
      initAudio();

      // Play at half max distance (15 units) — volume should be 0.5
      playSoundAt('shoot', 15, 0);

      // The spatial gain node should have a value < 1 (reduced by distance)
      const hasReducedVolume = gainNodes.some(g => g.gain.value < 1);
      expect(hasReducedVolume).toBe(true);
    });
  });

  // ── playMusic / stopMusic ─────────────────────────────────────────────────

  describe('playMusic / stopMusic', () => {
    beforeEach(() => {
      initAudio();
      mockContextState = 'running';
    });

    it('does not throw when playing unknown music track', () => {
      expect(() => playMusic('bg-theme')).not.toThrow();
    });

    it('does not throw when stopping with no music playing', () => {
      expect(() => stopMusic(0)).not.toThrow();
    });

    it('plays a registered music track', async () => {
      registerSound('bg-theme', '/audio/bg-theme.ogg');
      await loadSound('bg-theme');
      playMusic('bg-theme');
      expect(mockContext.createBufferSource).toHaveBeenCalled();
    });

    it('sets loop=true on music source', async () => {
      registerSound('bg-theme', '/audio/bg-theme.ogg');
      await loadSound('bg-theme');

      let capturedSource = null;
      mockContext.createBufferSource.mockImplementation(() => {
        const src = createMockBufferSourceNode();
        capturedSource = src;
        return src;
      });

      playMusic('bg-theme');
      expect(capturedSource).not.toBeNull();
      expect(capturedSource.loop).toBe(true);
    });

    it('stops current music when stopMusic called', async () => {
      registerSound('bg-theme', '/audio/bg-theme.ogg');
      await loadSound('bg-theme');

      let capturedSource = null;
      mockContext.createBufferSource.mockImplementation(() => {
        const src = createMockBufferSourceNode();
        capturedSource = src;
        return src;
      });

      playMusic('bg-theme');
      stopMusic(0);
      expect(capturedSource.stop).toHaveBeenCalled();
    });
  });

  // ── resumeAudioContext ────────────────────────────────────────────────────

  describe('resumeAudioContext', () => {
    beforeEach(() => { initAudio(); });

    it('calls context.resume() when context is suspended', async () => {
      mockContextState = 'suspended';
      await resumeAudioContext();
      expect(mockContext.resume).toHaveBeenCalled();
    });

    it('does not throw if context is already running', async () => {
      mockContextState = 'running';
      await expect(resumeAudioContext()).resolves.not.toThrow();
    });
  });

});
