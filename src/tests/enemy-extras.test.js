// The support enemies (config/enemy-extras.js) and how waves use them.

import { describe, it, expect } from 'vitest';
import { EXTRA_ENEMIES, EXTRA_NAMES, extraEnemiesFor, SPLIT_CHILD_ID } from '../js/config/enemy-extras.js';
import { SOCCER_ENEMIES, HOCKEY_ENEMIES } from '../js/config/enemies.js';
import { generateWaves } from '../js/config/waves.js';

const WORLDS = ['hockey', 'soccer', 'space', 'kitchen', 'golf', 'bowling', 'bathtub', 'garden', 'sushi', 'pizza', 'library', 'arcade'];

describe('extra enemies', () => {
  it('every world names all four', () => {
    for (const w of WORLDS) {
      const names = EXTRA_NAMES[w];
      expect(names, w).toBeTruthy();
      for (const e of EXTRA_ENEMIES) expect(names[e.id], `${w} ${e.id}`).toMatch(/\S/);
      const list = extraEnemiesFor(w);
      expect(list.map(e => e.nm)).toEqual(EXTRA_ENEMIES.map(e => names[e.id]));
    }
  });

  it('do not reuse an id the original rosters already have', () => {
    const taken = new Set([...HOCKEY_ENEMIES, ...SOCCER_ENEMIES].map(e => e.id));
    for (const e of EXTRA_ENEMIES) expect(taken.has(e.id), e.id).toBe(false);
  });

  it('the splitter splits into the spawn-only splitling', () => {
    const splitter = EXTRA_ENEMIES.find(e => e.split);
    const child = EXTRA_ENEMIES.find(e => e.id === SPLIT_CHILD_ID);
    expect(splitter.split.into).toBe(SPLIT_CHILD_ID);
    expect(child.spawnOnly).toBe(true);
    expect(splitter.split.count).toBeGreaterThan(1);
  });

  it('shield and heal auras are described', () => {
    const shield = EXTRA_ENEMIES.find(e => e.aura?.kind === 'shield');
    const heal = EXTRA_ENEMIES.find(e => e.aura?.kind === 'heal');
    expect(shield.aura.reduce).toBeGreaterThan(0);
    expect(shield.aura.reduce).toBeLessThan(1);
    expect(heal.aura.pct).toBeGreaterThan(0);
    expect(heal.aura.every).toBeGreaterThan(0);
  });
});

describe('waves with the extra enemies', () => {
  const themeData = { enemies: [...SOCCER_ENEMIES, ...extraEnemiesFor('soccer')] };
  const waves = generateWaves(20, themeData);
  const ids = waves.flatMap(w => Object.keys(w));

  it('never sends a splitling directly', () => {
    expect(ids).not.toContain(SPLIT_CHILD_ID);
  });

  it('send splitters, shielders and healers over a campaign', () => {
    for (const id of ['e11', 'e12', 'e13']) expect(ids, id).toContain(id);
  });

  it('hold each one back until its unlock wave', () => {
    waves.forEach((w, i) => {
      for (const id of Object.keys(w)) {
        const def = themeData.enemies.find(e => e.id === id);
        expect(def.unlockWave, `${id} in wave ${i + 1}`).toBeLessThanOrEqual(i + 1);
      }
    });
  });

  it('do not send splitters in pairs on swarm waves', () => {
    // A pair of splitters is six enemies; they are deliberately not tagged swarm.
    const splitter = themeData.enemies.find(e => e.id === 'e11');
    expect(splitter.threatTags).not.toContain('swarm');
  });
});
