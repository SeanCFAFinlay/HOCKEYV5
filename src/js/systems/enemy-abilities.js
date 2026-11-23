// What enemies do to each other and to the board, beyond walking.
//
//   split   a splitter that dies leaves smaller copies where it fell
//   shield  allies near a shielder take less damage (systems/damage.js reads
//           `enemy.shielded`)
//   heal    a healer pulses, mending allies around it
//   fire    a burning enemy that dies scorches the towers next to it, which
//           stop firing for a moment
//
// Definitions live in config/enemy-extras.js (`split`, `aura`) and on the
// original enemies (`fire`). Everything here runs in the fixed step.

import { getState } from '../engine/state.js';
import { spawnEnemy } from './enemies.js';
import { spawnGroundRipple, createImpact } from './particles.js';
import { burstDebris } from './impact-fx.js';
import { flashTowerEmissive } from '../rendering/tower-meshes.js';

// A dying fire enemy scorches towers within this many tiles...
const SCORCH_RADIUS = 1.0;
// ...and they hold fire this long...
const SCORCH_SECONDS = 0.5;
// ...then shrug off further scorching for a while, so a whole fire wave dying
// on one tower can't keep it switched off.
const SCORCH_IMMUNE = 2.5;

const HEAL_COLOR = 0x5dff8f;
const SHIELD_COLOR = 0x8fd8ff;

/**
 * Mark who is shielded and run heal pulses. Call once per fixed step, before
 * enemies move and towers fire.
 * @param {number} dt
 */
export function updateEnemyAuras(dt) {
  const { enemies } = getState();
  if (!enemies.length) return;

  for (const e of enemies) { e.shielded = false; }

  for (const src of enemies) {
    const aura = src.aura;
    if (!aura || src.hp <= 0) continue;
    const r2 = aura.radius * aura.radius;

    // Bosses are too big to protect: no shield, no healing. A heal is also
    // capped at a fifth of the healer's own health, so it mends a regular
    // enemy by its share but can't pour thousands into a giant.
    if (aura.kind === 'shield') {
      for (const e of enemies) {
        if (e === src || e.hp <= 0 || e.boss) continue;
        const dx = e.x - src.x;
        const dz = e.z - src.z;
        if (dx * dx + dz * dz <= r2) {
          e.shielded = true;
          e.shieldReduce = Math.max(e.shieldReduce || 0, aura.reduce);
        }
      }
    } else if (aura.kind === 'heal') {
      src.healT = (src.healT ?? aura.every * 0.5) - dt;
      if (src.healT > 0) continue;
      src.healT = aura.every;
      let mended = 0;
      for (const e of enemies) {
        if (e === src || e.hp <= 0 || e.hp >= e.maxHp || e.boss) continue;
        const dx = e.x - src.x;
        const dz = e.z - src.z;
        if (dx * dx + dz * dz > r2) continue;
        e.hp = Math.min(e.maxHp, e.hp + Math.min(e.maxHp * aura.pct, src.maxHp * 0.2));
        mended++;
        if (mended <= 6) burstDebris(e.x, (e.y || 0.2) + 0.45, e.z, 'heal', HEAL_COLOR, 3);
      }
      // Pulse even when nobody needed it, so the player learns what it does.
      spawnGroundRipple(src.x, src.z, HEAL_COLOR);
    }
  }

  // Shield bubbles follow the flag (rendering/enemy-meshes.js builds them).
  for (const e of enemies) {
    if (e.shieldBubble) e.shieldBubble.visible = !!e.shielded;
    if (!e.shielded) e.shieldReduce = 0;
  }
}

/**
 * Damage multiplier from a shielder's aura.
 * @param {object} e
 */
export function shieldMultiplier(e) {
  return e.shielded ? 1 - (e.shieldReduce || 0) : 1;
}

/**
 * Death effects. Called by systems/enemies.js after the enemy has left the
 * active list (so children it spawns are not counted against it).
 * @param {object} e
 */
export function onEnemyDied(e) {
  if (e.split) splitApart(e);
  if (e.fire) scorchTowers(e);
}

function splitApart(e) {
  const state = getState();
  const ed = state.themeData?.enemies?.find(d => d.id === e.split.into);
  if (!ed) return;
  const count = e.split.count || 2;
  const reward = Math.max(1, Math.round((e.splitReward || 0) / count));
  // Children stay inside the tile their parent died on: a tile next door may
  // hold a tower or a wall, and an enemy that starts there has no route.
  const hw = state.COLS / 2;
  const hh = state.ROWS / 2;
  const cx = Math.floor(e.x + hw) - hw;
  const cz = Math.floor(e.z + hh) - hh;
  const inTile = (v, lo) => Math.min(lo + 0.92, Math.max(lo + 0.08, v));
  for (let i = 0; i < count; i++) {
    // Fan out a little so the children don't stack into one target.
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const r = 0.18 + Math.random() * 0.08;
    spawnEnemy({ ...ed, rwdFixed: reward }, {
      child: true,
      at: { x: inTile(e.x + Math.cos(a) * r, cx), z: inTile(e.z + Math.sin(a) * r, cz) },
      path: e.path,
      pathIdx: e.pathIdx,
      navV: e.navV
    });
  }
  createImpact(e.x, 0.5, e.z, e.splitColor || 0xe3c4ff);
  burstDebris(e.x, 0.45, e.z, 'chunks', e.splitColor || 0xb48cff, 8);
}

function scorchTowers(e) {
  const { towers, COLS, ROWS } = getState();
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const r2 = SCORCH_RADIUS * SCORCH_RADIUS;
  burstDebris(e.x, 0.35, e.z, 'embers', 0xff6a1a, 9);
  spawnGroundRipple(e.x, e.z, 0xff7a2a);
  for (const tw of towers) {
    const dx = tw.x - hw + 0.5 - e.x;
    const dz = tw.y - hh + 0.5 - e.z;
    if (dx * dx + dz * dz > r2) continue;
    if (tw.scorchT > 0 || tw.scorchImmune > 0) continue;
    try { flashTowerEmissive(tw.mesh, 0xff5a1a, 260); } catch { /* headless tests */ }
    tw.scorchT = SCORCH_SECONDS;
    tw.scorchImmune = SCORCH_SECONDS + SCORCH_IMMUNE;
  }
}

export { HEAL_COLOR, SHIELD_COLOR };
