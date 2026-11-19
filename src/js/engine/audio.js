// SC-5.1: Audio Engine — Web Audio API sound manager

import { installSynthSounds } from './synth.js';

const POOL_MAX = 8;
const MAX_DISTANCE = 30;
const CROSSFADE_MS = 2000;

// ── Module state ─────────────────────────────────────────────────────────────

let ctx = null;
let masterGain = null;

const categoryGains = {};
const categoryVolumes = { sfx: 1, music: 1, ambient: 1 };

const soundRegistry = {};   // name → url
const soundBuffers = {};    // name → AudioBuffer | null | Promise
const soundPools = {};      // name → Array<AudioBufferSourceNode>

let musicSource = null;
let musicGain = null;
let currentMusicName = null;

// ── Initialization ────────────────────────────────────────────────────────────

export function initAudio() {
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  // A limiter on the way out: a late wave can fire a dozen sounds in one frame,
  // and without it they sum past full scale and crackle.
  if (typeof ctx.createDynamicsCompressor === 'function') {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 8;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.15;
    masterGain.connect(limiter);
    limiter.connect(ctx.destination);
  } else {
    masterGain.connect(ctx.destination);
  }

  // Reset category volumes to defaults
  categoryVolumes.sfx = 1;
  categoryVolumes.music = 1;
  categoryVolumes.ambient = 1;

  for (const cat of ['sfx', 'music', 'ambient']) {
    const g = ctx.createGain();
    g.gain.value = categoryVolumes[cat];
    g.connect(masterGain);
    categoryGains[cat] = g;
  }

  // Every sound is synthesised up front (see synth.js); nothing is downloaded.
  try {
    installSynthSounds(ctx, (name, buffer) => { soundBuffers[name] = buffer; });
  } catch (err) {
    console.warn('[Audio] Synth sounds unavailable:', err);
  }

  _wireUserGesture();
}

/** True once a sound of this name has a buffer ready to play. */
export function hasSound(name) {
  return !!_getBuffer(name);
}

function _wireUserGesture() {
  const handler = () => {
    resumeAudioContext();
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
  }
}

// ── Volume control ────────────────────────────────────────────────────────────

export function setVolume(category, level) {
  if (!(category in categoryVolumes)) return;
  const clamped = Math.min(1, Math.max(0, level));
  categoryVolumes[category] = clamped;
  if (categoryGains[category]) {
    categoryGains[category].gain.value = clamped;
  }
}

export function getVolume(category) {
  if (!(category in categoryVolumes)) return 0;
  return categoryVolumes[category];
}

// ── Sound registration & loading ──────────────────────────────────────────────

export function registerSound(name, url) {
  soundRegistry[name] = url;
}

export async function loadSound(name) {
  if (!(name in soundRegistry)) {
    console.warn(`[Audio] Sound not registered: ${name}`);
    return null;
  }

  // Return cached buffer (already resolved — not a Promise)
  if (soundBuffers[name] !== undefined && !(soundBuffers[name] instanceof Promise)) {
    return soundBuffers[name];
  }

  // Return in-progress promise
  if (soundBuffers[name] instanceof Promise) {
    return soundBuffers[name];
  }

  // Start loading
  const loadPromise = _fetchBuffer(name);
  soundBuffers[name] = loadPromise;

  const buffer = await loadPromise;
  soundBuffers[name] = buffer;
  return buffer;
}

async function _fetchBuffer(name) {
  try {
    const resp = await fetch(soundRegistry[name]);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const arrayBuf = await resp.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuf);
  } catch (err) {
    console.warn(`[Audio] Failed to load "${name}": ${err.message}`);
    return null;
  }
}

function _getBuffer(name) {
  const buf = soundBuffers[name];
  if (!buf || buf instanceof Promise) return null;
  return buf;
}

// ── Sound playback ────────────────────────────────────────────────────────────

export function playSound(name, options = {}) {
  if (!ctx) return;
  const buffer = _getBuffer(name);
  if (!buffer) {
    // Silently skip — buffer may not be loaded yet
    return;
  }
  const bus = categoryGains[options.category] || categoryGains.sfx;
  _playBuffer(name, buffer, _withVolume(bus, options.volume), options);
}

/** Stop every playing instance of a sound (used for ambient loops). */
export function stopSound(name) {
  const pool = soundPools[name];
  if (!pool) return;
  for (const source of pool.splice(0)) {
    try { source.stop(); } catch (_) { /* already ended */ }
  }
}

function _withVolume(destination, volume) {
  if (volume === undefined || volume === 1) return destination;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  gain.connect(destination);
  return gain;
}

export function playSoundAt(name, worldX, worldZ, options = {}) {
  if (!ctx) return;
  const buffer = _getBuffer(name);
  if (!buffer) return;

  const volume = _distanceVolume(worldX, worldZ) * (options.volume ?? 1);
  if (volume <= 0) return;

  const spatialGain = ctx.createGain();
  spatialGain.gain.value = volume;
  spatialGain.connect(categoryGains.sfx);

  _playBuffer(name, buffer, spatialGain, options);
}

function _distanceVolume(x, z) {
  const dist = Math.sqrt(x * x + z * z);
  return Math.min(1, Math.max(0, 1 - dist / MAX_DISTANCE));
}

function _playBuffer(name, buffer, destinationNode, options = {}) {
  if (!soundPools[name]) soundPools[name] = [];
  const pool = soundPools[name];

  // Steal oldest if pool full
  if (pool.length >= POOL_MAX) {
    const oldest = pool.shift();
    try { oldest.stop(); } catch (_) { /* already ended */ }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = options.loop ?? false;
  if (options.rate && source.playbackRate) source.playbackRate.value = options.rate;
  source.connect(destinationNode);
  source.start(options.when ?? 0);
  pool.push(source);

  source.onended = () => {
    const idx = pool.indexOf(source);
    if (idx !== -1) pool.splice(idx, 1);
  };
}

// ── Music ─────────────────────────────────────────────────────────────────────

export function playMusic(name) {
  if (!ctx) return;
  const buffer = _getBuffer(name);
  if (!buffer) return;

  if (musicSource && currentMusicName !== name) {
    _crossfadeToTrack(name, buffer);
    return;
  }

  _startMusicTrack(name, buffer, 1);
}

function _startMusicTrack(name, buffer, initialVolume) {
  const gain = ctx.createGain();
  gain.gain.value = initialVolume;
  gain.connect(categoryGains.music);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  source.start(0);

  musicSource = source;
  musicGain = gain;
  currentMusicName = name;

  source.onended = () => {
    if (musicSource === source) {
      musicSource = null;
      musicGain = null;
      currentMusicName = null;
    }
  };
}

function _crossfadeToTrack(name, buffer) {
  const fadeSec = CROSSFADE_MS / 1000;
  const now = ctx.currentTime;

  if (musicGain) {
    musicGain.gain.linearRampToValueAtTime(0, now + fadeSec);
    const oldSource = musicSource;
    setTimeout(() => {
      try { oldSource.stop(); } catch (_) { /* already ended */ }
    }, CROSSFADE_MS + 100);
  }

  _startMusicTrack(name, buffer, 0);
  musicGain.gain.linearRampToValueAtTime(1, now + fadeSec);
}

export function stopMusic(fadeMs = 0) {
  if (!musicSource) return;

  if (fadeMs <= 0) {
    try { musicSource.stop(); } catch (_) { /* already ended */ }
    musicSource = null;
    musicGain = null;
    currentMusicName = null;
    return;
  }

  const fadeSec = fadeMs / 1000;
  const now = ctx.currentTime;
  musicGain.gain.linearRampToValueAtTime(0, now + fadeSec);
  const src = musicSource;
  setTimeout(() => {
    try { src.stop(); } catch (_) { /* already ended */ }
  }, fadeMs + 100);

  musicSource = null;
  musicGain = null;
  currentMusicName = null;
}

// ── Context resume ────────────────────────────────────────────────────────────

export async function resumeAudioContext() {
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
}
