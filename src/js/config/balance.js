// Difficulty curve.
//
// Two things make the game harder: the wave number within a map, and how far
// through the campaign the map is. Both feed enemy health; income grows much
// more slowly than health, so every wave is a tighter fit than the one before.
//
// These numbers were tuned against an auto-player that builds sensibly but
// never mazes: it should win the early maps with lives to spare, scrape through
// the middle ones, and need real play (mazing, the right powers, upgrades over
// sprawl) to finish the late ones.

/**
 * An enemy carrying a trophy runs home this much faster. Enemies have to come
 * back past the towers with what they took, which on its own made every map
 * much easier than the old "reach the goal and it's gone" rule; the sprint
 * puts the difficulty back (tuned with the auto-player against the old game).
 */
export const CARRY_SPEED = 2.0;

/**
 * Enemies are this much tougher than before trophies, for the same reason:
 * a trip there and back past the towers is two chances to stop them.
 */
export const TROPHY_HP = 1.6;

/** Enemy health multiplier. `mapIndex` is 0 for a world's first map. */
export function enemyHpScale(wave, mapIndex = 0) {
  const w = Math.max(1, wave);
  const waveScale = 1 + w * HP_PER_WAVE + Math.pow(w / HP_CURVE_WAVES, HP_CURVE_POWER) * HP_CURVE_WEIGHT;
  return waveScale * (1 + Math.max(0, mapIndex) * HP_PER_MAP) * TROPHY_HP;
}

/**
 * Money a whole wave pays out when every enemy in it is killed.
 *
 * Income is set per wave, not per enemy: each enemy's reward is its share of
 * this bounty (bigger enemies still pay more). Wave sizes grow quickly, and
 * paying a fixed price per head let late-game income outrun enemy health
 * tenfold, until the board was wall-to-wall towers.
 */
export function waveBounty(wave, mapIndex = 0) {
  const base = BOUNTY_BASE + Math.max(1, wave) * BOUNTY_PER_WAVE;
  // Later maps pay a little more, but less than their enemies toughen up.
  return Math.round(base * (1 + Math.max(0, mapIndex) * BOUNTY_PER_MAP));
}

/** Fallback per-enemy reward multiplier for enemies spawned outside a wave. */
export function enemyRewardScale(wave) {
  return Math.min(REWARD_CAP, 1 + Math.max(1, wave) * REWARD_PER_WAVE);
}

/** Enemy speed multiplier: later maps are a little quicker. */
export function enemySpeedScale(mapIndex = 0) {
  return 1 + Math.min(9, Math.max(0, mapIndex)) * SPEED_PER_MAP;
}

export const HP_PER_WAVE = 0.10;
export const HP_CURVE_WAVES = 18;
export const HP_CURVE_POWER = 2;
export const HP_CURVE_WEIGHT = 1;
export const HP_PER_MAP = 0.08;
export const BOUNTY_BASE = 45;
export const BOUNTY_PER_WAVE = 6;
export const BOUNTY_PER_MAP = 0.04;
export const REWARD_PER_WAVE = 0.015;
export const REWARD_CAP = 2;
export const SPEED_PER_MAP = 0.02;
