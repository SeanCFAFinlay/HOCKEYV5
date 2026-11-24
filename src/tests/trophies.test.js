// The trophy rules (systems/trophies.js): grab at the goal, drop on death,
// float home, re-grab, steal at the gate.

import { describe, it, expect, beforeEach, vi } from 'vitest';

const state = { scene: null, BASE: { x: 9, y: 5 }, COLS: 10, ROWS: 11 };
vi.mock('../js/engine/state.js', () => ({ getState: () => state }));
vi.mock('../js/engine/events.js', () => ({ emit: vi.fn(), GameEvents: {} }));

const T = await import('../js/systems/trophies.js');

// World position of the goal tile's centre.
const goal = { x: state.BASE.x - state.COLS / 2 + 0.5, z: state.BASE.y - state.ROWS / 2 + 0.5 };

describe('trophies', () => {
  beforeEach(() => T.initTrophies(5));

  it('start on the goal', () => {
    expect(T.trophyTotal()).toBe(5);
    expect(T.trophiesHome()).toBe(5);
    expect(T.trophiesLoose()).toBe(0);
  });

  it('an enemy at the goal takes one, and only while any are there', () => {
    const enemies = Array.from({ length: 6 }, () => ({ x: goal.x, z: goal.z }));
    const took = enemies.map(e => T.takeFromHome(e));
    expect(took).toEqual([true, true, true, true, true, false]);
    expect(T.trophiesHome()).toBe(0);
    expect(enemies[0].carrying).toBeTruthy();
    expect(enemies[5].carrying).toBeFalsy();
  });

  it('a killed carrier drops it, and it floats back home', () => {
    const e = { x: goal.x, z: goal.z };
    T.takeFromHome(e);
    e.x = goal.x - 3;          // carried three tiles away, then killed
    T.dropFrom(e);
    expect(e.carrying).toBeNull();
    expect(T.trophiesLoose()).toBe(1);
    expect(T.trophiesHome()).toBe(4);
    for (let i = 0; i < 60 * 8; i++) T.updateTrophies(1 / 60);   // 8 s
    expect(T.trophiesLoose()).toBe(0);
    expect(T.trophiesHome()).toBe(5);
  });

  it('another enemy can pick up a dropped one on its way', () => {
    const a = { x: goal.x, z: goal.z };
    T.takeFromHome(a);
    a.x = goal.x - 4;
    T.dropFrom(a);
    const b = { x: goal.x - 4.2, z: goal.z };
    expect(T.pickUpNear(b)).toBe(true);
    expect(b.carrying).toBeTruthy();
    expect(T.trophiesLoose()).toBe(0);
    // Already carrying: can't take a second.
    a.carrying = null;
    T.takeFromHome(a); a.x = goal.x - 4; T.dropFrom(a);
    expect(T.pickUpNear(b)).toBe(false);
  });

  it('carried out through the gate, it is gone for good', () => {
    const e = { x: goal.x, z: goal.z };
    T.takeFromHome(e);
    expect(T.stealFrom(e)).toBe(true);
    expect(T.trophyTotal()).toBe(5);              // the stock it started with
    expect(T.trophiesHome() + T.trophiesLoose()).toBe(4);
    // Leaving empty-handed steals nothing.
    expect(T.stealFrom({ x: 0, z: 0 })).toBe(false);
  });
});
