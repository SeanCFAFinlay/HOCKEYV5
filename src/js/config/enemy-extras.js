// The three enemy types that act on each other, added to every world.
//
//   SPLITTER  breaks into SPLITLINGs when it dies
//   SHIELDER  projects a shield: allies standing near it take less damage
//   HEALER    pulses, mending allies around it
//
// Stats are shared by every world, like the original seven; each world only
// renames them (EXTRA_NAMES) and models them (its theme kit, or
// rendering/enemy-models.js for hockey, soccer and space). Abilities are run by
// systems/enemy-abilities.js and read the `split` and `aura` fields below.
//
// A SPLITLING is never picked by the wave generator (`spawnOnly`); it only
// appears when a splitter dies, and is modelled as a small splitter.

const meta = (role, threatTags, unlockWave, waveWeight, speedClass, rewardClass, extra = {}) => ({
  role,
  slot: role.toLowerCase(),
  threatTags,
  unlockWave,
  waveWeight,
  speedClass,
  rewardClass,
  ...extra
});

export const SPLIT_CHILD_ID = 'e14';

export const EXTRA_ENEMIES = [
  {
    id: 'e11',
    nm: 'Splitter',
    // Not tagged 'swarm': swarm waves send swarm enemies in pairs, and a pair of
    // splitters is six enemies.
    ...meta('SPLITTER', ['ground', 'splitter'], 4, 0.6, 'normal', 'low'),
    hp: 120,
    spd: 1.7,
    rwd: 16,
    sz: 1.2,
    split: { into: SPLIT_CHILD_ID, count: 2 }
  },
  {
    id: 'e12',
    nm: 'Shielder',
    ...meta('SHIELDER', ['ground', 'armor', 'support'], 7, 0.4, 'slow', 'medium'),
    hp: 240,
    spd: 0.95,
    rwd: 36,
    armor: 0.2,
    sz: 1.35,
    // Allies within `radius` tiles take `reduce` less damage. Not stackable.
    aura: { kind: 'shield', radius: 1.9, reduce: 0.3 }
  },
  {
    id: 'e13',
    nm: 'Healer',
    ...meta('HEALER', ['ground', 'support'], 8, 0.4, 'normal', 'medium'),
    hp: 150,
    spd: 1.25,
    rwd: 32,
    sz: 1.15,
    // Every `every` seconds, allies within `radius` tiles regain `pct` of max health.
    aura: { kind: 'heal', radius: 2.1, pct: 0.04, every: 1.2 }
  },
  {
    id: SPLIT_CHILD_ID,
    nm: 'Splitling',
    // Not fast: a splitter often dies near the goal, and quick children there
    // ran straight in before any tower could turn on them.
    ...meta('SPLITLING', ['ground', 'swarm'], 999, 0, 'normal', 'low', { spawnOnly: true }),
    hp: 22,
    spd: 1.9,
    rwd: 3,
    sz: 0.62
  }
];

/** Per-world names, keyed by world id then enemy id. */
export const EXTRA_NAMES = {
  hockey:  { e11: 'Split Puck',   e12: 'Goalie',        e13: 'Team Trainer',  e14: 'Puck Chip' },
  soccer:  { e11: 'Cluster Ball', e12: 'Goalkeeper',    e13: 'Physio',        e14: 'Mini Ball' },
  space:   { e11: 'Swarm Pod',    e12: 'Shield Drone',  e13: 'Repair Drone',  e14: 'Nanodrone' },
  kitchen: { e11: 'Spider Mum',   e12: 'Shell Snail',   e13: 'Nurse Ladybird', e14: 'Spiderling' },
  golf:    { e11: 'Egg Clutch',   e12: 'Stego Shield',  e13: 'Medisaur',      e14: 'Hatchling' },
  bowling: { e11: 'Split Pin',    e12: 'Bumper Ghost',  e13: 'Candle Wraith', e14: 'Pinlet' },
  bathtub: { e11: 'Mother Duck',  e12: 'Tin Turtle',    e13: 'Sponge Medic',  e14: 'Duckling' },
  garden:  { e11: 'Aphid Queen',  e12: 'Pill Bug',      e13: 'Compost Worm',  e14: 'Aphid' },
  sushi:   { e11: 'Roe Bomb',     e12: 'Bento Guard',   e13: 'Miso Medic',    e14: 'Roe Pearl' },
  pizza:   { e11: 'Mama Raccoon', e12: 'Box-Lid Rat',   e13: 'Sauce Medic',   e14: 'Raccoon Kit' },
  library: { e11: 'Paper Stack',  e12: 'Bookend Knight', e13: 'Glue Pot',     e14: 'Loose Page' },
  arcade:  { e11: 'Pixel Blob',   e12: 'Barrier Bot',   e13: 'Med Bot',       e14: 'Pixel' }
};

/** The four extra enemies, named for one world. */
export function extraEnemiesFor(worldId) {
  const names = EXTRA_NAMES[worldId] || {};
  return EXTRA_ENEMIES.map(e => ({ ...e, nm: names[e.id] || e.nm }));
}

/** Default colours for the new roles when a world's visuals don't set them. */
export const EXTRA_ROLE_VISUALS = {
  splitter: { color: 0x8d5bd6, accent: 0xe3c4ff },
  splitling: { color: 0x8d5bd6, accent: 0xe3c4ff },
  shielder: { color: 0x3b6fd8, accent: 0x9fd8ff },
  healer: { color: 0x2fae5a, accent: 0xb6ffcf }
};
