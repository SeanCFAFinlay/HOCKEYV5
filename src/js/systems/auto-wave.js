export function didWaveCostLives(state) {
  const startLives = Number.isFinite(state.waveStartLives)
    ? state.waveStartLives
    : state.lives;

  return state.lives < startLives;
}

export function shouldAutoStartNextWave(state) {
  const maxWave = state.mapData?.waves ?? 0;
  return Boolean(
    state.autoWave &&
    state.wave < maxWave &&
    !didWaveCostLives(state)
  );
}
