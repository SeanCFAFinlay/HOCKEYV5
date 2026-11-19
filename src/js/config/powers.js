// Tower powers.
//
// Every tower role has one power on top of its plain damage. Powers are keyed
// by role, so each theme's eight towers get the same eight powers without the
// tower tables having to repeat them. Arrays are indexed by tower level (0-3).
//
// What each power does when a shot lands is in systems/damage.js; the lasting
// effects on enemies (chill, freeze, shock, burn, …) are in systems/status.js.

export const POWERS = {
  'ANTI-SWARM': {
    id: 'doubleTap',
    name: 'Double Tap',
    chance: [0.2, 0.26, 0.32, 0.4]        // chance a shot is followed by a second
  },
  SNIPER: {
    id: 'pierce',
    name: 'Armor Pierce',
    expose: [0.15, 0.2, 0.25, 0.3],       // extra damage the marked target takes from everything
    exposeDur: 4
  },
  SPLASH: {
    id: 'shockwave',
    name: 'Shockwave',
    stagger: [0.5, 0.6, 0.75, 0.9],       // seconds the blast leaves enemies staggering
    staggerMult: 0.3
  },
  CROWD_CONTROL: {
    id: 'freeze',
    name: 'Freeze',
    hitsToFreeze: [4, 3, 3, 2],           // chilling hits before the target freezes solid
    freezeDur: [1.0, 1.2, 1.5, 1.8],
    chillRadius: [0, 0.8, 1.0, 1.25]      // neighbours inside this are chilled too
  },
  CHOKEPOINT: {
    id: 'knockback',
    name: 'Body Check',
    dist: [1.0, 1.3, 1.6, 2.0]            // tiles the target is thrown back along its route
  },
  CHAIN: {
    id: 'electrocute',
    name: 'Electrocute',
    stun: [0.25, 0.3, 0.4, 0.5]           // seconds every struck enemy is stunned
  },
  DOT: {
    id: 'ignite',
    name: 'Ignite',
    stacks: [2, 3, 3, 4],                 // how hot the fire can get
    spread: [0, 0, 1.2, 1.5]              // radius the fire jumps when a burning enemy dies
  },
  BOSS_KILLER: {
    id: 'giantSlayer',
    name: 'Giant Slayer',
    pctMaxHp: [0.04, 0.05, 0.06, 0.08]    // bonus damage as a share of the target's max health
  }
};

/** A burn stack beyond the first adds this share of the base burn. */
export const BURN_STACK_BONUS = 0.35;
/** Frozen enemies take this much extra damage from every hit. */
export const SHATTER_BONUS = 0.5;

const lvOf = (arr, lv) => arr[Math.max(0, Math.min(arr.length - 1, lv || 0))];
const pct = v => `${Math.round(v * 100)}%`;
const secs = v => `${Number(v.toFixed(2))}s`;

/** The power for a tower definition or a placed tower (both carry `role`). */
export function getPower(tower) {
  return (tower && POWERS[tower.role]) || null;
}

/** A level's value from one of a power's per-level arrays. */
export function powerValue(arr, lv) {
  return lvOf(arr, lv);
}

/**
 * Player-facing description of a tower's power at a level.
 * @param {object} td - tower definition (config/towers.js)
 * @param {number} lv - 0-3
 * @returns {{name: string, text: string}|null}
 */
export function describePower(td, lv = 0) {
  const p = getPower(td);
  if (!p) return null;
  const at = arr => lvOf(arr, lv);
  let text = '';

  switch (p.id) {
    case 'doubleTap':
      text = `${pct(at(p.chance))} chance to fire a second shot at once.`;
      break;
    case 'pierce':
      text = `Ignores armor. The target takes +${pct(at(p.expose))} damage from everything for ${p.exposeDur}s.`;
      break;
    case 'shockwave':
      text = `The blast staggers every enemy it hits for ${secs(at(p.stagger))}.`;
      break;
    case 'freeze': {
      const r = at(p.chillRadius);
      text = `Slows by 50%. Every ${at(p.hitsToFreeze)} hits freezes the target solid for ${secs(at(p.freezeDur))}; frozen enemies take +${pct(SHATTER_BONUS)} damage.` +
        (r > 0 ? ' Chills enemies beside the target too.' : '');
      break;
    }
    case 'knockback':
      text = `Throws the target back ${at(p.dist)} ${at(p.dist) === 1 ? 'tile' : 'tiles'}. Bosses only stagger.`;
      break;
    case 'electrocute': {
      const jumps = Array.isArray(td.chain) ? at(td.chain) : (td.chain || 0);
      text = `Lightning jumps to ${jumps} more enemies and stuns each one for ${secs(at(p.stun))}.`;
      break;
    }
    case 'ignite': {
      const dps = Array.isArray(td.burn) ? at(td.burn) : (td.burn || 0);
      const spread = at(p.spread);
      text = `Burns for ${dps}/s over ${td.burnDur || 3}s, ignoring armor. Stacks ${at(p.stacks)} times.` +
        (spread > 0 ? ' The fire spreads when a burning enemy dies.' : '');
      break;
    }
    case 'giantSlayer':
      text = `${pct(td.crit || 0)} chance of a triple-damage hit, plus ${pct(at(p.pctMaxHp))} of the target's max health.`;
      break;
  }

  return { name: p.name, text };
}
