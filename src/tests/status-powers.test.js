// Status effects and tower powers. These modules are plain logic with no
// rendering, so they are tested directly rather than through mocks.

import { describe, it, expect } from 'vitest';
import {
  freshStatus, applyChill, applyShock, applyStagger, applyBurn, applyExpose,
  applyKnockback, tickStatus, speedMultiplier, damageMultiplier, isStunned, BOSS_CC
} from '../js/systems/status.js';
import { POWERS, getPower, describePower, powerValue, SHATTER_BONUS, BURN_STACK_BONUS } from '../js/config/powers.js';
import { HOCKEY_TOWERS, SOCCER_TOWERS } from '../js/config/towers.js';

const enemy = (extra = {}) => ({ hp: 1000, maxHp: 1000, armor: 0, ...freshStatus(), ...extra });

describe('chill and freeze', () => {
  it('a chill halves speed and wears off', () => {
    const e = enemy();
    applyChill(e, 2);
    expect(speedMultiplier(e)).toBe(0.5);
    tickStatus(e, 2.1);
    expect(speedMultiplier(e)).toBe(1);
  });

  it('freezes solid on the hit that completes the build-up, not before', () => {
    const e = enemy();
    expect(applyChill(e, 2, 1 / 3, 1.2)).toBe(false);
    expect(applyChill(e, 2, 1 / 3, 1.2)).toBe(false);
    expect(isStunned(e)).toBe(false);
    expect(applyChill(e, 2, 1 / 3, 1.2)).toBe(true);
    expect(e.frozen).toBeCloseTo(1.2);
    expect(speedMultiplier(e)).toBe(0);
  });

  it('a frozen enemy thaws, then cannot be frozen again straight away', () => {
    const e = enemy();
    applyChill(e, 2, 1, 1);
    tickStatus(e, 1.05);
    expect(e.frozen).toBe(0);
    expect(e.freezeImmune).toBeGreaterThan(0);
    expect(applyChill(e, 2, 1, 1)).toBe(false);
    expect(e.frozen).toBe(0);
    // ...but it is still slowed.
    expect(speedMultiplier(e)).toBe(0.5);
    tickStatus(e, 3);
    expect(applyChill(e, 2, 1, 1)).toBe(true);
  });

  it('frozen enemies take extra damage', () => {
    const e = enemy();
    expect(damageMultiplier(e)).toBe(1);
    applyChill(e, 2, 1, 1);
    expect(damageMultiplier(e)).toBeCloseTo(1 + SHATTER_BONUS);
  });

  it('bosses are frozen for a fraction of the time', () => {
    const e = enemy({ boss: true });
    applyChill(e, 2, 1, 2);
    expect(e.frozen).toBeCloseTo(2 * BOSS_CC);
  });

  it('frost that is not topped up melts', () => {
    const e = enemy();
    applyChill(e, 0.5, 0.5, 1);
    tickStatus(e, 0.6);       // chill ends
    tickStatus(e, 2);         // frost melts
    expect(e.frost).toBe(0);
  });
});

describe('shock', () => {
  it('stuns, then grants a window of immunity', () => {
    const e = enemy();
    expect(applyShock(e, 0.4)).toBe(true);
    expect(speedMultiplier(e)).toBe(0);
    tickStatus(e, 0.45);
    expect(speedMultiplier(e)).toBe(1);
    expect(applyShock(e, 0.4)).toBe(false);
    tickStatus(e, 2);
    expect(applyShock(e, 0.4)).toBe(true);
  });
});

describe('stagger', () => {
  it('is a heavy slow, and the slowest effect wins', () => {
    const e = enemy();
    applyChill(e, 2);
    applyStagger(e, 0.5, 0.3);
    expect(speedMultiplier(e)).toBe(0.3);
    tickStatus(e, 0.6);
    expect(speedMultiplier(e)).toBe(0.5);
  });
});

describe('burn', () => {
  it('deals its damage over its duration and then stops', () => {
    const e = enemy();
    applyBurn(e, 10, 3);
    let burned = 0;
    for (let i = 0; i < 100; i++) burned += tickStatus(e, 0.05);
    expect(burned).toBeCloseTo(30, 5);
    expect(e.hp).toBeCloseTo(970, 5);
    expect(e.burnT).toBe(0);
    expect(e.burnStacks).toBe(0);
  });

  it('stacks up to the cap, each stack adding a share of the base burn', () => {
    const e = enemy();
    applyBurn(e, 10, 3, 3);
    expect(e.burnD).toBeCloseTo(10);
    applyBurn(e, 10, 3, 3);
    applyBurn(e, 10, 3, 3);
    applyBurn(e, 10, 3, 3);
    expect(e.burnStacks).toBe(3);
    expect(e.burnD).toBeCloseTo(10 * (1 + 2 * BURN_STACK_BONUS));
  });

  it('ignores armor', () => {
    const e = enemy({ armor: 0.9 });
    applyBurn(e, 10, 1);
    tickStatus(e, 1);
    expect(e.hp).toBeCloseTo(990, 5);
  });
});

describe('expose and knockback', () => {
  it('a marked enemy takes more damage until the mark expires', () => {
    const e = enemy();
    applyExpose(e, 4, 0.25);
    expect(damageMultiplier(e)).toBeCloseTo(1.25);
    tickStatus(e, 4.1);
    expect(damageMultiplier(e)).toBe(1);
  });

  it('knockback throws normal enemies and only staggers bosses', () => {
    const e = enemy();
    expect(applyKnockback(e, 1.5)).toBe(true);
    expect(e.knock).toBe(1.5);
    expect(applyKnockback(e, 1.5)).toBe(false); // immune for a moment

    const boss = enemy({ boss: true });
    expect(applyKnockback(boss, 1.5)).toBe(false);
    expect(boss.knock).toBe(0);
    expect(boss.stagger).toBeGreaterThan(0);
  });
});

describe('tower powers', () => {
  it('every tower in every table has a power with four levels of values', () => {
    for (const td of [...HOCKEY_TOWERS, ...SOCCER_TOWERS]) {
      const power = getPower(td);
      expect(power, `${td.nm} (${td.role})`).toBeTruthy();
      for (const [key, value] of Object.entries(power)) {
        if (Array.isArray(value)) expect(value, `${power.id}.${key}`).toHaveLength(4);
      }
    }
  });

  it('the eight roles get eight different powers', () => {
    const ids = HOCKEY_TOWERS.map(td => getPower(td).id);
    expect(new Set(ids).size).toBe(8);
    expect(Object.keys(POWERS)).toHaveLength(8);
  });

  it('describes each power with real numbers at every level', () => {
    for (const td of HOCKEY_TOWERS) {
      for (let lv = 0; lv < 4; lv++) {
        const d = describePower(td, lv);
        expect(d.name.length).toBeGreaterThan(2);
        expect(d.text, `${td.nm} lv${lv}`).not.toMatch(/undefined|NaN|null/);
      }
    }
  });

  it('powers grow, never shrink, with level', () => {
    const freeze = POWERS.CROWD_CONTROL;
    expect(powerValue(freeze.hitsToFreeze, 3)).toBeLessThan(powerValue(freeze.hitsToFreeze, 0));
    expect(powerValue(freeze.freezeDur, 3)).toBeGreaterThan(powerValue(freeze.freezeDur, 0));
    expect(powerValue(POWERS.CHAIN.stun, 3)).toBeGreaterThan(powerValue(POWERS.CHAIN.stun, 0));
    // Out-of-range levels clamp instead of returning undefined.
    expect(powerValue(freeze.freezeDur, 9)).toBe(freeze.freezeDur[3]);
    expect(powerValue(freeze.freezeDur, undefined)).toBe(freeze.freezeDur[0]);
  });
});
