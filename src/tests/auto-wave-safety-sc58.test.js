import { describe, expect, it } from 'vitest';

import { didWaveCostLives, shouldAutoStartNextWave } from '../js/systems/auto-wave.js';

describe('SC-5.8 auto-wave safety brake', () => {
  it('detects when a wave leaked lives', () => {
    expect(didWaveCostLives({ waveStartLives: 20, lives: 18 })).toBe(true);
    expect(didWaveCostLives({ waveStartLives: 20, lives: 20 })).toBe(false);
  });

  it('allows auto-wave to continue after a clean wave', () => {
    expect(shouldAutoStartNextWave({
      autoWave: true,
      wave: 1,
      mapData: { waves: 5 },
      waveStartLives: 20,
      lives: 20
    })).toBe(true);
  });

  it('pauses auto-wave after leaks so the player can rebuild', () => {
    expect(shouldAutoStartNextWave({
      autoWave: true,
      wave: 1,
      mapData: { waves: 5 },
      waveStartLives: 20,
      lives: 16
    })).toBe(false);
  });
});
