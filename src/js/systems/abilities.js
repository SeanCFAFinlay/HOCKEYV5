// Player abilities: cooldowns, targeting and effects.
// Rules and per-world names live in config/abilities.js; the buttons in
// ui/ability-bar.js.

import { getState } from '../engine/state.js';
import { ABILITY_RULES, ABILITY_ORDER } from '../config/abilities.js';
import { hurtEnemy, showStatusText } from './damage.js';
import { applyChill, applyStagger } from './status.js';
import { createExplosion, spawnGroundRipple, createImpact } from './particles.js';
import { triggerCameraShake } from '../engine/camera.js';
import { playSound } from '../engine/audio.js';

const cooldowns = { strike: 0, freeze: 0, rally: 0 };
let targeting = null;        // ability id waiting for a board tap
let rallyLeft = 0;           // seconds of faster tower fire left
const pending = [];          // strikes falling: { x, z, t, marker, bolt }
let listener = null;

/** One listener told whenever cooldowns, targeting or rally change. */
export function setAbilityListener(fn) { listener = typeof fn === 'function' ? fn : null; }
function notify() { if (listener) listener(); }

/** Fresh cooldowns for a new match. Abilities start ready. */
export function resetAbilities() {
  for (const id of ABILITY_ORDER) cooldowns[id] = 0;
  targeting = null;
  rallyLeft = 0;
  getState().towerRateMult = 1;
  for (const p of pending.splice(0)) disposeStrikeVisuals(p);
  notify();
}

export function getCooldown(id) { return cooldowns[id] || 0; }
export function isReady(id) { return (cooldowns[id] || 0) <= 0; }
export function getTargeting() { return targeting; }
export function getRallyLeft() { return rallyLeft; }

/**
 * Press an ability button. Strike enters targeting (press again to cancel);
 * the others fire straight away.
 * @returns {boolean} whether anything happened
 */
export function pressAbility(id) {
  if (!ABILITY_RULES[id]) return false;
  if (targeting === id) { targeting = null; notify(); return true; }
  if (!isReady(id)) return false;
  const state = getState();
  if (!state.running) return false;

  if (id === 'strike') {
    targeting = 'strike';
    notify();
    return true;
  }
  if (id === 'freeze') castFreeze(state);
  if (id === 'rally') castRally(state);
  cooldowns[id] = ABILITY_RULES[id].cooldown;
  targeting = null;
  notify();
  return true;
}

export function cancelTargeting() {
  if (!targeting) return;
  targeting = null;
  notify();
}

/** Board tap while targeting: drop the strike on this world position. */
export function strikeAt(x, z) {
  if (targeting !== 'strike' || !isReady('strike')) return false;
  const rules = ABILITY_RULES.strike;
  pending.push({ x, z, t: rules.delay, ...makeStrikeVisuals(x, z) });
  cooldowns.strike = rules.cooldown;
  targeting = null;
  notify();
  return true;
}

/** Advance cooldowns, rally and falling strikes. Called from the fixed step. */
export function updateAbilities(dt) {
  let changed = false;
  for (const id of ABILITY_ORDER) {
    if (cooldowns[id] > 0) {
      const before = Math.ceil(cooldowns[id]);
      cooldowns[id] = Math.max(0, cooldowns[id] - dt);
      if (Math.ceil(cooldowns[id]) !== before) changed = true;
    }
  }
  if (rallyLeft > 0) {
    rallyLeft = Math.max(0, rallyLeft - dt);
    if (rallyLeft === 0) { changed = true; getState().towerRateMult = 1; }
  }
  for (let i = pending.length - 1; i >= 0; i--) {
    const p = pending[i];
    p.t -= dt;
    animateStrike(p);
    if (p.t <= 0) {
      pending.splice(i, 1);
      landStrike(p);
      disposeStrikeVisuals(p);
    }
  }
  if (changed) notify();
}

// ── Effects ──────────────────────────────────────────────────────────────────

function themeColor(state) {
  const c = state.themeData?.color || '#38bdf8';
  return parseInt(String(c).replace('#', ''), 16) || 0x38bdf8;
}

function landStrike(p) {
  const state = getState();
  const rules = ABILITY_RULES.strike;
  const dmg = rules.damage(Math.max(1, state.wave || 1));
  const r2 = rules.radius * rules.radius;
  let hits = 0;
  for (const e of [...(state.enemies || [])]) {
    if (!e || e.hp <= 0) continue;
    const dx = e.x - p.x, dz = e.z - p.z;
    if (dx * dx + dz * dz > r2) continue;
    hurtEnemy(e, dmg * (e.boss ? rules.bossMult : 1), true, { pierce: true });
    applyStagger(e, rules.stagger, 0.2);
    hits++;
  }
  const color = themeColor(state);
  try {
    createExplosion(p.x, 0.4, p.z, true, color);
    spawnGroundRipple(p.x, p.z, color);
    spawnGroundRipple(p.x, p.z, 0xffffff);
    triggerCameraShake(0.22, 320);
    playSound('enemyDeathBoss', { volume: 0.8 });
    if (hits >= 3) showStatusText(p.x, 1.6, p.z, `${hits} HIT!`, '#ffd166');
  } catch { /* cosmetic */ }
}

function castFreeze(state) {
  const rules = ABILITY_RULES.freeze;
  for (const e of state.enemies || []) {
    if (!e || e.hp <= 0) continue;
    applyChill(e, rules.duration);
    applyStagger(e, rules.duration, rules.mult);
    try { createImpact(e.x, 0.5, e.z, 0x9be7ff); } catch { /* cosmetic */ }
  }
  flashScreen('freeze');
  try { playSound('upgrade', { rate: 0.6, volume: 0.9 }); } catch { /* no audio */ }
}

function castRally(state) {
  rallyLeft = ABILITY_RULES.rally.duration;
  // towers.js reads this off the state, so it needs no import of this module.
  state.towerRateMult = ABILITY_RULES.rally.fireRate;
  const hw = state.COLS / 2, hh = state.ROWS / 2;
  for (const t of state.towers || []) {
    try { createImpact(t.x - hw + 0.5, 1.2, t.y - hh + 0.5, 0xffd166); } catch { /* cosmetic */ }
  }
  flashScreen('rally');
  try { playSound('waveStart', { rate: 1.25, volume: 0.9 }); } catch { /* no audio */ }
}

function flashScreen(kind) {
  if (typeof document === 'undefined' || !document.body) return;
  const el = document.createElement('div');
  el.className = `ability-flash ${kind}`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
}

// A target ring on the ice and a glowing bolt dropping onto it.
function makeStrikeVisuals(x, z) {
  const state = getState();
  if (!state.scene || typeof THREE === 'undefined') return {};
  const color = themeColor(state);
  const r = ABILITY_RULES.strike.radius;
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(r * 0.86, r, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(x, 0.06, z);
  const bolt = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false })
  );
  bolt.add(glow);
  bolt.position.set(x, 9, z);
  state.scene.add(marker);
  state.scene.add(bolt);
  return { marker, bolt };
}

function animateStrike(p) {
  const delay = ABILITY_RULES.strike.delay;
  const k = 1 - Math.max(0, p.t) / delay; // 0 → 1
  if (p.bolt) p.bolt.position.y = 9 * (1 - k * k) + 0.3;
  if (p.marker) {
    p.marker.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(k * 12));
    const s = 1 - 0.25 * k;
    p.marker.scale.set(s, s, s);
  }
}

function disposeStrikeVisuals(p) {
  const scene = getState().scene;
  for (const m of [p.marker, p.bolt]) {
    if (!m) continue;
    if (scene) scene.remove(m);
    m.traverse?.(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  }
}
