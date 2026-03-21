// Wave generation logic
// Creates enemy composition for each wave based on wave number

import { getState } from '../engine/state.js';

export function generateWaves(num) {
  const { themeData } = getState();
  const waves = [];
  const e = themeData.enemies;

  for (let w = 1; w <= num; w++) {
    const wv = {};
    wv[e[0].id] = 5 + Math.floor(w * 1.3);
    if (w >= 2) wv[e[1].id] = Math.floor(w * 0.6);
    if (w >= 3) wv[e[2].id] = Math.floor(w * 0.7);
    if (w >= 5) wv[e[3].id] = Math.floor((w - 3) * 0.4);
    if (w >= 8) wv[e[4].id] = Math.floor((w - 6) * 0.25);
    if (w >= 10) wv[e[5].id] = Math.floor((w - 8) * 0.35);
    if (w % 5 === 0) wv[e[6].id] = 1 + Math.floor(w / 12);
    waves.push(wv);
  }

  return waves;
}
