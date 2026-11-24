// Trophies: what the enemies are after.
//
// The goal holds a stock of trophies. An enemy that reaches the goal grabs one
// and runs back to the gate it came from. Kill it on the way and the trophy
// drops where it fell, then floats slowly home; any enemy that passes close
// can grab it again. A trophy carried out through a gate is gone for good, and
// the match is lost when every trophy is gone.
//
// `state.lives` counts the trophies not yet stolen (at home, carried, or on
// the floor), so the HUD, auto-wave and the lose check work unchanged.

import { getState } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';

// A dropped trophy floats home this fast (tiles per second)...
const RETURN_SPEED = 0.75;
// ...and an enemy this close to one picks it up.
const PICKUP_RADIUS = 0.5;
const GOLD = 0xffc93c;
// Sizes: on the goal they stand in rows; carried or loose they're bigger so
// you can spot which enemy has one from the default camera.
const HOME_SCALE = 0.22;
const CARRY_SCALE = 0.34;

let trophies = [];      // { state: 'home'|'carried'|'dropped', carrier, x, z, mesh }
let total = 0;
let template = null;

// ── Visuals ─────────────────────────────────────────────────────────────────

function buildTemplate() {
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.75, roughness: 0.28, emissive: 0x6a4600, emissiveIntensity: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3b2a12, metalness: 0.2, roughness: 0.7 });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.26, 0.62, 14), gold);
  cup.position.y = 0.95;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.34, 8), gold);
  stem.position.y = 0.48;
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.62), dark);
  base.position.y = 0.16;
  const handleGeo = new THREE.TorusGeometry(0.2, 0.05, 6, 12, Math.PI);
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(handleGeo, gold);
    h.position.set(0.5 * s, 1.0, 0);
    h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(h);
  }
  g.add(cup, stem, base);
  g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return g;
}

function makeMesh() {
  if (!template) template = buildTemplate();
  const m = template.clone();
  m.scale.setScalar(HOME_SCALE);
  return m;
}

// Home trophies stand in rows on the goal tile.
function homeSpot(i, n) {
  const { BASE, COLS, ROWS } = getState();
  const cx = BASE.x - COLS / 2 + 0.5;
  const cz = BASE.y - ROWS / 2 + 0.5;
  const perRow = n <= 9 ? 3 : n <= 16 ? 4 : 5;
  const rows = Math.ceil(n / perRow);
  const gap = 0.25;
  const r = Math.floor(i / perRow);
  const c = i % perRow;
  const inRow = Math.min(perRow, n - r * perRow);
  return {
    x: cx - 0.12 + (r - (rows - 1) / 2) * gap,
    z: cz + (c - (inRow - 1) / 2) * gap
  };
}

function layoutHome() {
  const home = trophies.filter(t => t.state === 'home');
  home.forEach((t, i) => {
    const p = homeSpot(i, home.length);
    t.x = p.x;
    t.z = p.z;
    if (t.mesh) { t.mesh.position.set(p.x, 0.12, p.z); t.mesh.rotation.set(0, 0, 0); t.mesh.scale.setScalar(HOME_SCALE); }
  });
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

/** New match: put `count` trophies on the goal. Call once the scene exists. */
export function initTrophies(count) {
  clearTrophies();
  const { scene } = getState();
  total = Math.max(1, count | 0);
  for (let i = 0; i < total; i++) {
    const t = { state: 'home', carrier: null, x: 0, z: 0, mesh: null };
    if (scene) { t.mesh = makeMesh(); scene.add(t.mesh); }
    trophies.push(t);
  }
  layoutHome();
}

export function clearTrophies() {
  const { scene } = getState();
  for (const t of trophies) if (t.mesh && scene) scene.remove(t.mesh);
  trophies = [];
}

export const trophyTotal = () => total;
export const trophiesHome = () => trophies.reduce((n, t) => n + (t.state === 'home'), 0);
export const trophiesLoose = () => trophies.reduce((n, t) => n + (t.state === 'dropped'), 0);

// ── What enemies do with them ───────────────────────────────────────────────

/** Enemy reached the goal: take a trophy if one is there. */
export function takeFromHome(e) {
  const t = trophies.find(x => x.state === 'home');
  if (!t) return false;
  t.state = 'carried';
  t.carrier = e;
  e.carrying = t;
  layoutHome();
  emit(GameEvents.TROPHY_TAKEN, { enemy: e });
  return true;
}

/** A free enemy passing a dropped trophy grabs it. Returns true if it did. */
export function pickUpNear(e) {
  if (e.carrying) return false;
  const r2 = PICKUP_RADIUS * PICKUP_RADIUS;
  for (const t of trophies) {
    if (t.state !== 'dropped') continue;
    const dx = t.x - e.x;
    const dz = t.z - e.z;
    if (dx * dx + dz * dz > r2) continue;
    t.state = 'carried';
    t.carrier = e;
    e.carrying = t;
    return true;
  }
  return false;
}

/** The carrier died: its trophy falls where it was. */
export function dropFrom(e) {
  const t = e.carrying;
  if (!t) return;
  t.state = 'dropped';
  t.carrier = null;
  t.x = e.x;
  t.z = e.z;
  e.carrying = null;
  emit(GameEvents.TROPHY_DROPPED, { x: t.x, z: t.z });
}

/** The carrier got out through a gate: that trophy is lost. */
export function stealFrom(e) {
  const t = e.carrying;
  if (!t) return false;
  const { scene } = getState();
  if (t.mesh && scene) scene.remove(t.mesh);
  trophies.splice(trophies.indexOf(t), 1);
  e.carrying = null;
  return true;
}

/** Per fixed step: carried trophies ride their carrier, dropped ones float home. */
export function updateTrophies(dt) {
  if (!trophies.length) return;
  const { BASE, COLS, ROWS } = getState();
  if (!BASE) return;
  const bx = BASE.x - COLS / 2 + 0.5;
  const bz = BASE.y - ROWS / 2 + 0.5;
  let arrived = false;
  const now = performance.now() / 1000;

  for (const t of trophies) {
    if (t.state === 'carried' && t.carrier) {
      const c = t.carrier;
      t.x = c.x;
      t.z = c.z;
      if (t.mesh) {
        t.mesh.scale.setScalar(CARRY_SCALE);
        t.mesh.position.set(c.x, (c.y || 0.2) + 0.55 + (c.sz || 1) * 0.25, c.z);
        t.mesh.rotation.y += dt * 3;
      }
    } else if (t.state === 'dropped') {
      const dx = bx - t.x;
      const dz = bz - t.z;
      const d = Math.hypot(dx, dz);
      const step = RETURN_SPEED * dt;
      if (d <= step + 0.05) {
        t.state = 'home';
        arrived = true;
      } else {
        t.x += (dx / d) * step;
        t.z += (dz / d) * step;
        if (t.mesh) {
          t.mesh.scale.setScalar(CARRY_SCALE);
          t.mesh.position.set(t.x, 0.45 + Math.sin(now * 4 + t.x) * 0.08, t.z);
          t.mesh.rotation.y += dt * 2;
        }
      }
    }
  }
  if (arrived) {
    layoutHome();
    emit(GameEvents.TROPHY_HOME, {});
  }
}
