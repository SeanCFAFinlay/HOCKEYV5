// Synthesised sound effects.
//
// The audio engine and every trigger in the game were wired up long ago, but
// the files they pointed at (audio/sfx/*.mp3, audio/ambient/*.ogg) were never
// added, so the game shipped silent. Rather than depend on assets, each sound
// is rendered here straight into an AudioBuffer when audio starts. It costs a
// few milliseconds, adds nothing to the download, and works offline.

const TAU = Math.PI * 2;

/** Render `seconds` of mono audio from a per-sample function of time. */
function render(ctx, seconds, fn) {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(seconds * rate));
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = fn(i / rate, i);
  // Short fade at both ends so nothing clicks.
  const fade = Math.min(Math.floor(rate * 0.004), length >> 1);
  for (let i = 0; i < fade; i++) {
    data[i] *= i / fade;
    data[length - 1 - i] *= i / fade;
  }
  return buffer;
}

const noise = () => Math.random() * 2 - 1;
const decay = (t, rate) => Math.exp(-t * rate);

/** Phase of a tone gliding from f0 to f1 over `dur` seconds (exponential). */
function glide(t, f0, f1, dur) {
  const k = Math.log(f1 / f0) / dur;
  return TAU * f0 * (Math.exp(k * Math.min(t, dur)) - 1) / k;
}

const saw = phase => 2 * ((phase / TAU) % 1) - 1;
const square = phase => (Math.sin(phase) >= 0 ? 1 : -1);

/** One-pole low-pass noise source; `amount` near 1 is darker. */
function darkNoise(amount) {
  let last = 0;
  return () => (last = last * amount + noise() * (1 - amount));
}

/** A run of notes, each a soft bell: [frequency, startTime]. */
function chime(ctx, notes, noteLength, level = 0.4) {
  const total = notes[notes.length - 1][1] + noteLength;
  return render(ctx, total, t => {
    let v = 0;
    for (const [freq, start] of notes) {
      const lt = t - start;
      if (lt < 0 || lt > noteLength) continue;
      v += (Math.sin(TAU * freq * lt) + 0.35 * Math.sin(TAU * freq * 2 * lt)) * decay(lt, 5 / noteLength);
    }
    return v * level;
  });
}

/** Seamless noise bed: the tail is cross-faded into the head so it loops. */
function loopBed(ctx, seconds, sample) {
  const rate = ctx.sampleRate;
  const overlap = Math.floor(rate * 0.6);
  const length = Math.floor(seconds * rate);
  const raw = new Float32Array(length + overlap);
  for (let i = 0; i < raw.length; i++) raw[i] = sample(i / rate);
  const buffer = ctx.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    if (i < overlap) {
      const k = i / overlap;
      data[i] = raw[i] * k + raw[length + i] * (1 - k);
    } else {
      data[i] = raw[i];
    }
  }
  return buffer;
}

function crowdBed(ctx, brightness) {
  const body = darkNoise(0.985);
  const air = darkNoise(brightness);
  return loopBed(ctx, 6, t => {
    // Slow swells, so it breathes like a crowd rather than hissing like a fan.
    const swell = 0.7 + 0.2 * Math.sin(TAU * t / 3) + 0.1 * Math.sin(TAU * t / 1.2 + 1);
    return (body() * 5 + air() * 0.9) * swell * 0.5;
  });
}

const BUILDERS = {
  // ── Towers ──
  towerPlace: ctx => render(ctx, 0.22, t =>
    Math.sin(glide(t, 190, 62, 0.2)) * decay(t, 16) * 0.8 + noise() * decay(t, 70) * 0.25),
  towerSell: ctx => chime(ctx, [[990, 0], [660, 0.08]], 0.22, 0.35),
  upgrade: ctx => chime(ctx, [[523, 0], [659, 0.07], [784, 0.14], [1047, 0.21]], 0.3, 0.3),

  // ── Tower fire, one voice per projectile family ──
  towerFire: ctx => render(ctx, 0.11, t =>
    Math.sin(glide(t, 900, 260, 0.1)) * decay(t, 38) * 0.45 + noise() * decay(t, 85) * 0.4),
  fire_zap: ctx => render(ctx, 0.14, t =>
    saw(glide(t, 2100, 320, 0.13)) * decay(t, 26) * 0.28 + Math.sin(glide(t, 1050, 160, 0.13)) * decay(t, 22) * 0.3),
  fire_thump: ctx => render(ctx, 0.24, t =>
    Math.sin(glide(t, 150, 46, 0.22)) * decay(t, 13) * 0.85 + noise() * decay(t, 55) * 0.3),
  fire_flame: ctx => {
    const n = darkNoise(0.9);
    return render(ctx, 0.3, t => n() * Math.sin(Math.PI * Math.min(1, t / 0.3)) * 1.5);
  },
  fire_hiss: ctx => {
    let last = 0;
    return render(ctx, 0.18, t => {
      const x = noise();
      const high = x - last;   // crude high-pass: icy rather than rumbly
      last = x;
      return high * decay(t, 20) * 0.3;
    });
  },
  fire_hum: ctx => render(ctx, 0.26, t =>
    (Math.sin(TAU * 330 * t + 3 * Math.sin(TAU * 28 * t)) + 0.5 * Math.sin(TAU * 495 * t)) *
    Math.sin(Math.PI * Math.min(1, t / 0.26)) * 0.3),

  // ── Enemies ──
  enemyDeath: ctx => render(ctx, 0.15, t =>
    Math.sin(glide(t, 560, 110, 0.14)) * decay(t, 24) * 0.55 + noise() * decay(t, 60) * 0.3),
  enemyDeathBoss: ctx => {
    const n = darkNoise(0.93);
    return render(ctx, 1.1, t =>
      Math.sin(glide(t, 95, 28, 1.0)) * decay(t, 3.2) * 0.9 + n() * decay(t, 4.5) * 2.2);
  },

  // ── Waves and results ──
  waveStart: ctx => render(ctx, 0.75, t => {
    // Arena goal horn: two detuned low reeds.
    const env = Math.min(1, t / 0.03) * (t > 0.55 ? Math.max(0, 1 - (t - 0.55) / 0.2) : 1);
    return (saw(TAU * 196 * t) + saw(TAU * 247.5 * t) + 0.6 * square(TAU * 98 * t)) * env * 0.16;
  }),
  waveComplete: ctx => chime(ctx, [[523, 0], [659, 0.1], [784, 0.2]], 0.4, 0.32),
  gameWin: ctx => chime(ctx, [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42], [784, 0.6], [1047, 0.74]], 0.7, 0.3),
  gameLose: ctx => chime(ctx, [[392, 0], [349, 0.28], [311, 0.56], [233, 0.84]], 0.8, 0.34),

  // ── UI ──
  moneyGain: ctx => chime(ctx, [[1319, 0], [1976, 0.05]], 0.16, 0.2),
  uiClick: ctx => render(ctx, 0.04, t => Math.sin(TAU * 1500 * t) * decay(t, 120) * 0.3),

  // ── Ambient beds and one-shots ──
  ambient_crowd_hockey: ctx => crowdBed(ctx, 0.7),
  ambient_crowd_soccer: ctx => crowdBed(ctx, 0.82),
  ambient_arena_echo: ctx => {
    const n = darkNoise(0.996);
    return loopBed(ctx, 5, () => n() * 9);
  },
  ambient_wind: ctx => {
    const n = darkNoise(0.97);
    return loopBed(ctx, 7, t => n() * (0.6 + 0.4 * Math.sin(TAU * t / 3.5)) * 1.6);
  },
  ambient_space_hum: ctx => loopBed(ctx, 4, t =>
    (Math.sin(TAU * 55 * t) + 0.5 * Math.sin(TAU * 82.5 * t) + 0.3 * Math.sin(TAU * 110 * t + Math.sin(TAU * 0.25 * t))) * 0.25),
  ambient_skates: ctx => {
    let last = 0;
    return render(ctx, 0.35, t => {
      const x = noise();
      const high = x - last;
      last = x;
      return high * Math.sin(Math.PI * t / 0.35) * 0.25;
    });
  },
  ambient_vuvuzela: ctx => render(ctx, 0.9, t =>
    saw(TAU * (233 + 2 * Math.sin(TAU * 5 * t)) * t) * Math.sin(Math.PI * t / 0.9) * 0.14),
  ambient_ping: ctx => render(ctx, 0.5, t => Math.sin(TAU * 1760 * t) * decay(t, 9) * 0.2)
};

export const SYNTH_SOUND_NAMES = Object.keys(BUILDERS);

// Every buffer is normalised to a peak level, so loudness is set here in one
// place instead of by the arithmetic inside each recipe.
const DEFAULT_PEAK = 0.45;
const PEAKS = {
  enemyDeathBoss: 0.8, waveStart: 0.5, gameWin: 0.5, gameLose: 0.5,
  towerFire: 0.3, fire_zap: 0.26, fire_thump: 0.4, fire_flame: 0.3, fire_hiss: 0.24, fire_hum: 0.26,
  enemyDeath: 0.32, moneyGain: 0.2, uiClick: 0.2,
  ambient_crowd_hockey: 0.3, ambient_crowd_soccer: 0.3, ambient_arena_echo: 0.16,
  ambient_wind: 0.2, ambient_space_hum: 0.22, ambient_skates: 0.3, ambient_vuvuzela: 0.25, ambient_ping: 0.25
};

function normalise(buffer, peak) {
  const data = buffer.getChannelData(0);
  let max = 0;
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
  if (max < 1e-6) return buffer;
  const k = peak / max;
  for (let i = 0; i < data.length; i++) data[i] *= k;
  return buffer;
}

/**
 * Render every synthesised sound into `store(name, buffer)`.
 * A sound that fails to render is skipped; the rest still play.
 *
 * @param {BaseAudioContext} ctx
 * @param {(name: string, buffer: AudioBuffer) => void} store
 */
export function installSynthSounds(ctx, store) {
  if (!ctx || typeof ctx.createBuffer !== 'function') return 0;
  let built = 0;
  for (const [name, build] of Object.entries(BUILDERS)) {
    try {
      store(name, normalise(build(ctx), PEAKS[name] ?? DEFAULT_PEAK));
      built++;
    } catch (err) {
      console.warn(`[Synth] Could not render "${name}":`, err);
    }
  }
  return built;
}
