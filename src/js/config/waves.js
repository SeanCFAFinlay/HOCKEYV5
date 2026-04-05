// Wave generation logic
// Creates enemy composition for each wave based on wave number
//
// Scaling notes:
//   e[0] basic: grows steadily throughout the game
//   e[1] fire: appears wave 2+, moderate growth
//   e[2] flying: appears wave 3+, bypasses ground towers
//   e[3] heavy/armor: appears wave 5+, slow but tanky
//   e[4] inferno: appears wave 8+, fire+armor combo
//   e[5] flying fire: appears wave 10+, high mobility threat
//   e[6] boss: every 5th wave, count grows with map progression

import { getState } from '../engine/state.js';

export function generateWaves(num) {
  const { themeData } = getState();
  const waves = [];
  const e = themeData.enemies;

  for (let w = 1; w <= num; w++) {
    const wv = {};

    // e[0] - basic: always present, scales linearly
    wv[e[0].id] = 5 + Math.floor(w * 1.3);

    // e[1] - fire: from wave 2
    if (w >= 2) wv[e[1].id] = Math.floor(w * 0.6);

    // e[2] - flying: from wave 3
    if (w >= 3) wv[e[2].id] = Math.floor(w * 0.7);

    // e[3] - heavy/armored: from wave 5
    if (w >= 5) wv[e[3].id] = Math.floor((w - 3) * 0.4);

    // e[4] - inferno: from wave 8
    if (w >= 8) wv[e[4].id] = Math.floor((w - 6) * 0.25);

    // e[5] - flying fire: from wave 10
    if (w >= 10) wv[e[5].id] = Math.floor((w - 8) * 0.35);

    // e[6] - boss: every 5th wave, count scales slowly
    if (w % 5 === 0) wv[e[6].id] = 1 + Math.floor(w / 12);

    // NEW ENEMIES (only for hockey theme - check if they exist)
    if (e.length > 7) {
      // e[7] - speed skater: from wave 4, high count
      if (w >= 4) wv[e[7].id] = Math.floor((w - 2) * 0.8);

      // e[8] - defenseman: from wave 7, moderate count
      if (w >= 7) wv[e[8].id] = Math.floor((w - 5) * 0.3);

      // e[9] - enforcer: from wave 6, scales steadily
      if (w >= 6) wv[e[9].id] = Math.floor((w - 4) * 0.5);
    }

    waves.push(wv);
  }

  return waves;
}
