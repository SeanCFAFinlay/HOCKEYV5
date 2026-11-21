// Which layout each world's arenas use.
//
// Every world shares the same ten map slots (size, waves, money, spawns), and
// they all used to share the same layout per slot too, so arena 4 played the
// same in every world. Now each slot has a difficulty tier with a pool of
// designs, and each world walks the pools from its own starting point: the
// first arena is always a gentle one, the last ones are always demanding, and
// no two worlds run the same sequence.

import { MapLayout as L } from './maps.js';

// Pools per arena slot (index 0-9). Early pools are open and forgiving; later
// ones have tighter gates, longer detours and more ways in.
const TIERS = [
  /* 1 */ [L.FUNNEL, L.OPEN_CENTER, L.FORK, L.RING],
  /* 2 */ [L.OPEN_CENTER, L.CROSS, L.RING, L.FORK, L.PINBALL],
  /* 3 */ [L.SPLIT_LANE, L.ZIGZAG, L.RIVER, L.CHOKEPOINT, L.HOURGLASS],
  /* 4 */ [L.CHOKEPOINT, L.SERPENT, L.ZIGZAG, L.PINBALL, L.CROSSOVER],
  /* 5 */ [L.CROSSOVER, L.CASTLE, L.HOURGLASS, L.COMB, L.RIVER],
  /* 6 */ [L.MAZE, L.COMB, L.SERPENT, L.GAUNTLET, L.SPLIT_LANE],
  /* 7 */ [L.GAUNTLET, L.RIVER, L.CASTLE, L.ZIGZAG, L.MAZE],
  /* 8 */ [L.SPLIT_LANE, L.HOURGLASS, L.MULTI_BASE, L.CROSSOVER, L.COMB],
  /* 9 */ [L.MULTI_BASE, L.CASTLE, L.HOURGLASS, L.SERPENT, L.CHOKEPOINT],
  /* 10 */ [L.CROSSOVER, L.MAZE, L.GAUNTLET, L.MULTI_BASE, L.RIVER]
];

// Order fixes each world's offset into the pools. New worlds go on the end so
// existing worlds keep their maps.
const WORLD_ORDER = ['hockey', 'soccer', 'space', 'kitchen', 'golf', 'bowling', 'bathtub', 'garden', 'sushi', 'pizza', 'library', 'arcade'];

/**
 * The layout for arena `index` of a world. Avoids repeating a layout the same
 * world already used on an earlier arena where the pool allows.
 */
export function layoutFor(worldId, index, fallback) {
  const pool = TIERS[index];
  if (!pool) return fallback;
  const w = WORLD_ORDER.indexOf(worldId);
  const salt = w < 0 ? [...String(worldId)].reduce((a, c) => a + c.charCodeAt(0), 0) : w;
  const used = new Set();
  for (let i = 0; i < index; i++) used.add(pick(TIERS[i], salt, i, used));
  return pick(pool, salt, index, used);
}

/** Small integer hash, so neighbouring worlds don't fall into step. */
function mix(a, b) {
  let h = Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 7, 0x85ebca6b);
  h ^= h >>> 15;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 13;
  return h >>> 0;
}

function pick(pool, salt, index, used) {
  const start = mix(salt, index) % pool.length;
  for (let k = 0; k < pool.length; k++) {
    const choice = pool[(start + k) % pool.length];
    if (!used.has(choice)) return choice;
  }
  return pool[start];
}

// What the player is told about each layout (map cards and the loading card),
// so the description always matches the arena they get.
export const LAYOUT_BLURB = {
  [L.FUNNEL]: 'Two jaws close to one narrow mouth',
  [L.OPEN_CENTER]: 'Wide open - build your own maze',
  [L.SPLIT_LANE]: 'A long divider makes two lanes',
  [L.CROSSOVER]: 'Outer lanes meet at a gate by the goal',
  [L.CHOKEPOINT]: 'Three walls, one gate in each',
  [L.MAZE]: 'Switchbacks from wall to wall',
  [L.GAUNTLET]: 'A walled corridor full of teeth',
  [L.MULTI_BASE]: 'Islands everywhere and a screen at the goal',
  [L.SERPENT]: 'A boxed S-bend: three long passes',
  [L.ZIGZAG]: 'Two staircases - zig, then zag',
  [L.HOURGLASS]: 'Bastions squeeze them to a narrow waist',
  [L.CROSS]: 'A great plus quarters the floor',
  [L.RING]: 'Through the ring, or the long way round',
  [L.FORK]: 'A wedge splits them, a screen rejoins them',
  [L.COMB]: 'One lane under a row of pockets',
  [L.PINBALL]: 'Bumpers scattered all over',
  [L.CASTLE]: 'The goal is walled in - one gate',
  [L.RIVER]: 'Two rivers, and the bridges never line up'
};
