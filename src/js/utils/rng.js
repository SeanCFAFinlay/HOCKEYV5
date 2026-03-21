// Random number generation utilities

import { getState } from '../engine/state.js';

export function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function makeSeededRng() {
  const state = getState();
  const { theme, mapIndex } = state;
  const themeSalt = (theme === 'hockey') ? 17 : 29;
  const seed = ((mapIndex + 1) * 10007 + themeSalt) >>> 0;
  return mulberry32(seed);
}

export function hash2(x, y, seed) {
  // cheap stable hash -> [0,1)
  let h = (seed ^ (x * 374761393) ^ (y * 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
