// Player abilities: three buttons the player fires during a match.
//
// The mechanics are shared by every world; only the name, icon and flavour
// change, so each world feels like its own game without nine sets of rules
// to balance.
//
//   strike - aimed: tap the button, then tap the board. A blast that hurts and
//            staggers everything near the spot. Scales with the wave so it
//            stays useful late.
//   freeze - instant: every enemy on the board is slowed hard for a few
//            seconds (bosses less).
//   rally  - instant: every tower fires faster for a few seconds.

export const ABILITY_RULES = {
  strike: {
    cooldown: 35,          // seconds of game time
    radius: 2.2,           // tiles
    delay: 0.45,           // seconds between the tap and the hit, for the fall
    damage: wave => 70 + 22 * wave,
    bossMult: 0.6,         // bosses take less
    stagger: 1.2
  },
  freeze: {
    cooldown: 55,
    duration: 4,           // seconds of heavy slow
    mult: 0.25             // enemies move at 25% speed (bosses are resisted by status rules)
  },
  rally: {
    cooldown: 70,
    duration: 8,
    fireRate: 1.6          // towers' cooldowns tick 60% faster
  }
};

export const ABILITY_ORDER = ['strike', 'freeze', 'rally'];

// Per-world names and icons (icons from ui/icons.js).
const WORLD_ABILITIES = {
  hockey:  { strike: ['Slapshot Barrage', 'stick'],   freeze: ['Zamboni Freeze', 'snowflake'], rally: ['Power Play', 'bolt'] },
  soccer:  { strike: ['Free Kick', 'ball'],           freeze: ['Offside Trap', 'net'],         rally: ['Home Crowd', 'star'] },
  space:   { strike: ['Orbital Strike', 'comet'],     freeze: ['EMP Pulse', 'atom'],           rally: ['Overclock', 'bolt'] },
  kitchen: { strike: ['Pan Slam', 'pan'],             freeze: ['Freezer Door', 'snowflake'],   rally: ['Spice Rush', 'flame'] },
  golf:    { strike: ['Tee Off', 'putter'],           freeze: ['Sprinkler Soak', 'spray'],     rally: ['Caddie Cheer', 'golfflag'] },
  bowling: { strike: ['Strike!', 'bowlball'],         freeze: ['Lane Wax', 'spiral'],          rally: ['Disco Fever', 'disco'] },
  bathtub: { strike: ['Cannonball', 'cannon'],        freeze: ['Cold Tap', 'tap'],             rally: ['Full Steam', 'shower'] },
  garden:  { strike: ['Pot Drop', 'pot'],             freeze: ['Frost Night', 'snowflake'],    rally: ['Fertiliser', 'seedbomb'] },
  sushi:   { strike: ['Wasabi Bomb', 'flame'],        freeze: ['Ice Bath', 'kakigori'],        rally: ['Rush Hour', 'luckycat'] }
};

const FALLBACK = { strike: ['Airstrike', 'comet'], freeze: ['Deep Freeze', 'snowflake'], rally: ['Rally', 'bolt'] };

const BLURB = {
  strike: 'Tap the board to blast an area',
  freeze: 'Slows every enemy on the board',
  rally: 'Every tower fires faster'
};

/** Name, icon and description of each ability for a world. */
export function abilitiesForWorld(themeId) {
  const set = WORLD_ABILITIES[themeId] || FALLBACK;
  return ABILITY_ORDER.map(id => ({
    id,
    name: set[id][0],
    icon: set[id][1],
    blurb: BLURB[id],
    cooldown: ABILITY_RULES[id].cooldown
  }));
}
