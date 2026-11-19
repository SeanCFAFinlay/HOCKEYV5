// Status effects on enemies: chill, freeze, shock, stagger, burn, expose,
// knockback.
//
// Pure game logic, no rendering: every function takes an enemy object and
// changes plain numbers on it. systems/damage.js applies effects when a shot
// lands, systems/enemies.js ticks them and reads the speed multiplier, and
// rendering/status-fx.js draws them.
//
// Crowd control is capped two ways so stacked towers cannot hold an enemy
// still forever: after a freeze, a stun or a knockback the enemy is immune to
// that one effect for a short while, and bosses shrug most of it off.

import { BURN_STACK_BONUS, SHATTER_BONUS } from '../config/powers.js';

export const CHILL_MULT = 0.5;
/** Share of a freeze or stun that lands on a boss. */
export const BOSS_CC = 0.4;
const FREEZE_IMMUNITY = 2.5;
const SHOCK_IMMUNITY = 1.5;
const KNOCK_IMMUNITY = 2.0;

/** The status fields a fresh enemy starts with. */
export function freshStatus() {
  return {
    slow: 0,            // seconds of chill left
    slowMult: CHILL_MULT,
    frost: 0,           // 0..1 build-up toward a freeze
    frozen: 0,          // seconds frozen solid
    freezeImmune: 0,
    shock: 0,           // seconds stunned by electricity
    shockImmune: 0,
    stagger: 0,         // seconds of heavy slow after a blast
    staggerMult: 1,
    burnT: 0,           // seconds of burn left
    burnD: 0,           // burn damage per second (already includes stacks)
    burnBase: 0,
    burnStacks: 0,
    burnSpread: 0,      // radius the fire jumps on death
    exposed: 0,         // seconds marked
    exposeAmt: 0,
    knock: 0,           // tiles still to be thrown back
    knockImmune: 0
  };
}

/**
 * Chill: slow the enemy and build toward a freeze.
 * @param {object} e - enemy
 * @param {number} dur - seconds of slow
 * @param {number} build - frost added, 0..1 (1 / hits-to-freeze)
 * @param {number} freezeDur - seconds frozen if this hit completes the build-up
 * @returns {boolean} true if this hit froze the enemy solid
 */
export function applyChill(e, dur, build = 0, freezeDur = 0) {
  e.slow = Math.max(e.slow || 0, dur);
  e.slowMult = CHILL_MULT;
  if (!(build > 0) || (e.frozen || 0) > 0 || (e.freezeImmune || 0) > 0) return false;

  e.frost = (e.frost || 0) + build;
  if (e.frost < 0.999) return false;

  const t = freezeDur * (e.boss ? BOSS_CC : 1);
  e.frost = 0;
  e.frozen = t;
  e.freezeImmune = t + FREEZE_IMMUNITY;
  return true;
}

/**
 * Shock: a short stun.
 * @returns {boolean} true if the stun landed (false while immune)
 */
export function applyShock(e, dur) {
  if ((e.shockImmune || 0) > 0) return false;
  const t = dur * (e.boss ? BOSS_CC : 1);
  e.shock = Math.max(e.shock || 0, t);
  e.shockImmune = t + SHOCK_IMMUNITY;
  return true;
}

/** Stagger: a brief, heavy slow from a blast. */
export function applyStagger(e, dur, mult = 0.3) {
  e.stagger = Math.max(e.stagger || 0, dur * (e.boss ? BOSS_CC : 1));
  e.staggerMult = mult;
}

/**
 * Burn: damage over time that ignores armor. Each application refreshes the
 * timer and adds a stack, up to `maxStacks`.
 * @param {number} spread - radius the fire jumps when this enemy dies (0 = none)
 */
export function applyBurn(e, dps, dur, maxStacks = 1, spread = 0) {
  e.burnT = Math.max(e.burnT || 0, dur);
  e.burnBase = Math.max(e.burnBase || 0, dps);
  e.burnStacks = Math.min(Math.max(1, maxStacks), (e.burnStacks || 0) + 1);
  e.burnD = e.burnBase * (1 + BURN_STACK_BONUS * (e.burnStacks - 1));
  e.burnSpread = Math.max(e.burnSpread || 0, spread);
}

/** Expose: the enemy takes `amt` more damage from every source for `dur`. */
export function applyExpose(e, dur, amt) {
  e.exposed = Math.max(e.exposed || 0, dur);
  e.exposeAmt = Math.max(e.exposeAmt || 0, amt);
}

/**
 * Knockback: throw the enemy back along its route. Bosses are too heavy to
 * move and only stagger.
 * @returns {boolean} true if the enemy was thrown
 */
export function applyKnockback(e, dist) {
  if (e.boss) {
    applyStagger(e, 0.8);
    return false;
  }
  if ((e.knockImmune || 0) > 0) return false;
  e.knock = Math.max(e.knock || 0, dist);
  e.knockImmune = KNOCK_IMMUNITY;
  return true;
}

/**
 * Advance every timer by dt and apply burn damage.
 * @returns {number} burn damage dealt this tick
 */
export function tickStatus(e, dt) {
  const down = key => { if (e[key] > 0) e[key] = Math.max(0, e[key] - dt); };
  down('slow');
  down('frozen');
  down('freezeImmune');
  down('shock');
  down('shockImmune');
  down('stagger');
  down('exposed');
  down('knockImmune');

  // Frost that is not topped up melts away.
  if (e.frost > 0 && !(e.slow > 0)) e.frost = Math.max(0, e.frost - dt * 0.5);
  if (!(e.exposed > 0)) e.exposeAmt = 0;

  let burned = 0;
  if (e.burnT > 0) {
    burned = e.burnD * Math.min(dt, e.burnT);
    e.hp -= burned;
    e.burnT = Math.max(0, e.burnT - dt);
    if (e.burnT === 0) {
      e.burnStacks = 0;
      e.burnBase = 0;
      e.burnD = 0;
      e.burnSpread = 0;
    }
  }
  return burned;
}

/** True while the enemy cannot move at all. */
export function isStunned(e) {
  return (e.frozen || 0) > 0 || (e.shock || 0) > 0;
}

/** How fast the enemy moves right now, as a multiple of its base speed. */
export function speedMultiplier(e) {
  if (isStunned(e)) return 0;
  let mult = 1;
  if ((e.slow || 0) > 0) mult = Math.min(mult, e.slowMult || CHILL_MULT);
  if ((e.stagger || 0) > 0) mult = Math.min(mult, e.staggerMult || 0.3);
  return mult;
}

/** Damage multiplier from statuses: frozen enemies shatter, exposed ones are marked. */
export function damageMultiplier(e) {
  let mult = 1;
  if ((e.frozen || 0) > 0) mult += SHATTER_BONUS;
  if ((e.exposed || 0) > 0) mult += e.exposeAmt || 0;
  return mult;
}
