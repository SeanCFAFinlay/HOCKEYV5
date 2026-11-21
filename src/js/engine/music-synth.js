// Generated background music, one style per world.
//
// Nothing is downloaded: a small step sequencer schedules Web Audio
// oscillators and noise a moment ahead of time (the usual "lookahead" pattern),
// so it keeps perfect time even when the main thread stutters.
//
// Music is OFF by default and never starts on page load. It only plays during
// a match, and only once the player switches it on in Settings or the pause
// menu (the `music` setting).
//
// Intensity follows the match:
//   0  between waves - bass, chords and light hats
//   1  wave running  - full drums and the melody
//   2  boss on board - busier drums, octave bass, a little faster

import { getMusicBus } from './audio.js';

const LOOKAHEAD = 0.15;     // seconds scheduled ahead
const TICK_MS = 25;         // how often the scheduler wakes
const MASTER = 0.42;        // music sits under the effects

const SCALES = {
  minorPent: [0, 3, 5, 7, 10],
  majorPent: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  insen: [0, 1, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10]
};

// Chords are given as scale-degree roots; each chord stacks scale steps 0-2-4.
const STYLES = {
  hockey:  { bpm: 132, root: 40, scale: 'minor',      prog: [0, 5, 3, 4], lead: 'square',   bass: 'sawtooth', drums: 'rock',   swing: 0 },
  soccer:  { bpm: 124, root: 43, scale: 'major',      prog: [0, 4, 5, 3], lead: 'triangle', bass: 'square',   drums: 'samba',  swing: 0 },
  space:   { bpm: 112, root: 38, scale: 'dorian',     prog: [0, 3, 6, 4], lead: 'sawtooth', bass: 'sawtooth', drums: 'four',   swing: 0, arp: true },
  kitchen: { bpm: 142, root: 41, scale: 'mixolydian', prog: [0, 3, 6, 0], lead: 'square',   bass: 'square',   drums: 'rock',   swing: 0.12 },
  golf:    { bpm: 100, root: 45, scale: 'major',      prog: [0, 5, 1, 4], lead: 'sine',     bass: 'triangle', drums: 'light',  swing: 0.2 },
  bowling: { bpm: 116, root: 38, scale: 'blues',      prog: [0, 0, 2, 0], lead: 'triangle', bass: 'sawtooth', drums: 'swing',  swing: 0.28 },
  bathtub: { bpm: 108, root: 46, scale: 'majorPent',  prog: [0, 3, 1, 4], lead: 'sine',     bass: 'triangle', drums: 'light',  swing: 0.1 },
  garden:  { bpm: 104, root: 43, scale: 'majorPent',  prog: [0, 2, 3, 0], lead: 'triangle', bass: 'triangle', drums: 'light',  swing: 0.15 },
  sushi:   { bpm: 118, root: 45, scale: 'insen',      prog: [0, 3, 2, 4], lead: 'triangle', bass: 'square',   drums: 'taiko',  swing: 0 },
  // A tarantella bounce for the pizzeria, a creeping waltz-ish minor for the
  // library, and square-wave chiptune with arpeggios for the arcade.
  pizza:   { bpm: 148, root: 43, scale: 'major',      prog: [0, 4, 0, 3], lead: 'triangle', bass: 'triangle', drums: 'samba',  swing: 0.18 },
  library: { bpm: 90,  root: 38, scale: 'minor',      prog: [0, 5, 3, 4], lead: 'sine',     bass: 'triangle', drums: 'light',  swing: 0.22 },
  arcade:  { bpm: 152, root: 45, scale: 'minorPent',  prog: [0, 3, 4, 2], lead: 'square',   bass: 'square',   drums: 'four',   swing: 0, arp: true }
};
const DEFAULT_STYLE = 'hockey';

// Drum patterns, 16 steps: k = kick, s = snare, h = hat, o = open hat, t = tom.
const DRUMS = {
  rock:  { k: [0, 8, 10],          s: [4, 12],     h: [0, 2, 4, 6, 8, 10, 12, 14], o: [14] },
  samba: { k: [0, 3, 8, 11],       s: [6, 14],     h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], o: [] },
  four:  { k: [0, 4, 8, 12],       s: [4, 12],     h: [2, 6, 10, 14], o: [6, 14] },
  light: { k: [0, 10],             s: [8],         h: [0, 4, 8, 12], o: [] },
  swing: { k: [0, 8],              s: [4, 12],     h: [0, 3, 4, 7, 8, 11, 12, 15], o: [] },
  taiko: { k: [0, 6, 8],           s: [12],        h: [2, 6, 10, 14], o: [], t: [4, 13, 14] }
};

// ── State ────────────────────────────────────────────────────────────────────

let ctx = null;
let out = null;            // this module's gain into the music bus
let noiseBuf = null;
let timer = null;
let style = null;
let styleId = null;
let melody = [];           // 64 sixteenths (four bars): a midi note or null
let step = 0;              // 16th-note counter
let nextTime = 0;
let intensity = 0;
let target = 0;            // requested intensity (applied on the next bar)
let halted = false;        // paused

const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

function rng(seedStr) {
  let h = 2166136261;
  for (const ch of seedStr) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scaleNote(s, degree, octave = 0) {
  const sc = SCALES[s.scale];
  const n = sc.length;
  const d = ((degree % n) + n) % n;
  const o = Math.floor(degree / n) + octave;
  return s.root + sc[d] + 12 * o;
}

/** Chord tones (as scale degrees) for bar `bar`. */
function chordDegrees(s, bar) {
  const r = s.prog[bar % s.prog.length];
  return [r, r + 2, r + 4];
}

/** A catchy four-bar phrase per world: same world, same tune. */
function composeMelody(s, id) {
  const rand = rng('tune:' + id);
  const notes = new Array(64).fill(null);
  // Rhythm motif for one bar, reused with variations.
  const motif = [];
  for (let i = 0; i < 16; i++) motif.push(i % 4 === 0 ? rand() < 0.85 : i % 2 === 0 ? rand() < 0.45 : rand() < 0.15);
  let deg = s.prog[0] + 7;   // start an octave up on the tonic
  for (let bar = 0; bar < 4; bar++) {
    const chord = chordDegrees(s, bar).map(d => d + 7);
    for (let i = 0; i < 16; i++) {
      const on = bar === 3 && i >= 12 ? i === 12 : motif[i] !== (bar === 2 && rand() < 0.2);
      if (!on) continue;
      if (i % 4 === 0) {
        // Strong beats land on a chord tone near the last note.
        deg = chord.reduce((best, c) => Math.abs(c - deg) < Math.abs(best - deg) ? c : best, chord[0]);
      } else {
        deg += [-2, -1, -1, 1, 1, 2][Math.floor(rand() * 6)];
        deg = Math.max(s.prog[0] + 4, Math.min(s.prog[0] + 14, deg));
      }
      notes[bar * 16 + i] = scaleNote(s, deg, 1);
    }
  }
  return notes;
}

// ── Voices ───────────────────────────────────────────────────────────────────

function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone(type, freq, t, dur, peak, cutoff = 0, attack = 0.005, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (detune) o.detune.setValueAtTime(detune, t);
  const g = ctx.createGain();
  env(g, t, attack, peak, dur);
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff, t);
    o.connect(f); f.connect(g);
  } else {
    o.connect(g);
  }
  g.connect(out);
  o.start(t);
  o.stop(t + attack + dur + 0.05);
}

function noise(t, dur, peak, hp, bp = 0) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = bp ? 'bandpass' : 'highpass';
  f.frequency.setValueAtTime(bp || hp, t);
  const g = ctx.createGain();
  env(g, t, 0.002, peak, dur);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

function kick(t, peak = 0.9) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  const g = ctx.createGain();
  env(g, t, 0.002, peak, 0.22);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + 0.3);
}

function snare(t, peak = 0.35) {
  noise(t, 0.14, peak, 0, 1800);
  tone('triangle', 190, t, 0.08, peak * 0.6);
}

function tom(t, peak = 0.6) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.25);
  const g = ctx.createGain();
  env(g, t, 0.003, peak, 0.32);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + 0.4);
}

// ── Sequencer ────────────────────────────────────────────────────────────────

function stepDur() {
  const bpm = style.bpm * (intensity >= 2 ? 1.06 : 1);
  return 60 / bpm / 4;
}

function playStep(i, t) {
  const s = style;
  const inBar = i % 16;
  const bar = Math.floor(i / 16);
  const sd = stepDur();
  // Swing: push every off-beat 16th late.
  const tt = t + (inBar % 2 === 1 ? s.swing * sd : 0);
  if (inBar === 0) intensity = target;

  const chord = chordDegrees(s, bar);
  const drums = DRUMS[s.drums];

  // Chords: a soft pad at the top of each bar.
  if (inBar === 0) {
    for (const d of chord) {
      const f = midiHz(scaleNote(s, d, 1));
      tone('triangle', f, tt, sd * 15, 0.045, 1600, 0.08, -6);
      tone('triangle', f, tt, sd * 15, 0.045, 1600, 0.08, 6);
    }
  }

  // Bass: root on the beat, fifth on the "and" when things are busy.
  const bassRoot = scaleNote(s, chord[0], 0);
  if (inBar % 4 === 0 || (intensity >= 1 && inBar % 4 === 2 && Math.random() < 0.5)) {
    const n = inBar % 8 === 6 ? scaleNote(s, chord[2], 0) : bassRoot;
    tone(s.bass, midiHz(n - 12), tt, sd * 1.8, 0.16, 520 + intensity * 260);
    if (intensity >= 2) tone(s.bass, midiHz(n), tt, sd * 1.2, 0.06, 900);
  }

  // Arpeggio for the space world.
  if (s.arp && intensity >= 1 && inBar % 2 === 0) {
    const d = chord[(inBar / 2) % 3] + 7 * ((inBar >> 3) & 1);
    tone('sawtooth', midiHz(scaleNote(s, d, 1)), tt, sd * 0.9, 0.035, 2400);
  }

  // Drums.
  if (intensity >= 1) {
    if (drums.k.includes(inBar)) kick(tt);
    if (drums.s.includes(inBar)) snare(tt);
    if (drums.t && drums.t.includes(inBar)) tom(tt);
    if (drums.o.includes(inBar)) noise(tt, 0.18, 0.06, 6000);
    if (intensity >= 2 && inBar % 2 === 1) noise(tt, 0.03, 0.05, 8000);
  } else if (inBar === 0) {
    kick(tt, 0.45);
  }
  if (drums.h.includes(inBar)) noise(tt, 0.04, intensity >= 1 ? 0.07 : 0.035, 7500);

  // Melody.
  if (intensity >= 1) {
    const n = melody[i % 64];
    if (n != null) {
      const vib = s.lead === 'triangle' && s.drums === 'swing' ? 8 : 0;
      tone(s.lead, midiHz(n), tt, sd * 1.6, s.lead === 'square' || s.lead === 'sawtooth' ? 0.05 : 0.09, 3000, 0.006, vib);
    }
  }
}

function schedule() {
  if (!ctx || halted || !style) return;
  // Fell behind (tab was hidden)? Jump ahead instead of playing a burst.
  if (nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    try { playStep(step, nextTime); } catch { /* a voice failed; keep time */ }
    nextTime += stepDur();
    step = (step + 1) % 64;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Start (or switch to) a world's music. Safe to call repeatedly. */
export function startMusic(themeId) {
  const bus = getMusicBus();
  if (!bus) return;
  if (!ctx) {
    ctx = bus.ctx;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const id = STYLES[themeId] ? themeId : DEFAULT_STYLE;
  if (timer && styleId === id && !halted) return;
  stopMusic(0.2);
  style = STYLES[id];
  styleId = id;
  melody = composeMelody(style, id);
  out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(MASTER, ctx.currentTime + 1.2);
  out.connect(bus.bus);
  step = 0;
  intensity = target = 0;
  halted = false;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(schedule, TICK_MS);
  schedule();
}

/** Fade out and stop. */
export function stopMusic(fade = 0.6) {
  if (timer) clearInterval(timer);
  timer = null;
  if (out && ctx) {
    const g = out;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + Math.max(0.05, fade));
    } catch { /* ignore */ }
    setTimeout(() => { try { g.disconnect(); } catch { /* gone */ } }, (fade + 0.3) * 1000);
  }
  out = null;
  styleId = null;
}

/** 0 calm, 1 wave, 2 boss. Takes effect on the next bar so it stays in time. */
export function setMusicIntensity(level) {
  target = Math.max(0, Math.min(2, level | 0));
}

/** Pause: stop scheduling new notes (what's queued plays out). */
export function setMusicHalted(on) {
  halted = !!on;
  if (!halted && ctx) nextTime = ctx.currentTime + 0.05;
}

export function isMusicPlaying() {
  return !!timer;
}

export const MUSIC_STYLES = Object.keys(STYLES);
