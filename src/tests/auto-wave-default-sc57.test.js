import { describe, expect, it, vi } from 'vitest';

describe('SC-5.7 auto-wave default', () => {
  it('new/reset runs keep auto-wave enabled by default', async () => {
    vi.resetModules();
    const { getState, resetGameState, setAutoWave } = await import('../js/engine/state.js');

    setAutoWave(false);
    resetGameState();

    expect(getState().autoWave).toBe(true);
  });

  it('still lets players turn auto-wave off manually during a run', async () => {
    vi.resetModules();
    const { getState, setAutoWave } = await import('../js/engine/state.js');

    setAutoWave(false);

    expect(getState().autoWave).toBe(false);
  });
});
