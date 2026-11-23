// Small pooled effects that give hits, shots and enemy abilities their own
// look: themed debris bursts, muzzle flashes and landing markers.
//
// Everything is pooled and every geometry/material is shared, so nothing here
// allocates GPU objects during play. Pieces fade by shrinking rather than by
// opacity, which is what lets them share one material per colour.
//
// Debris kinds (burstDebris):
//   chunks  small tumbling blocks          crumbs  irregular bits (food, rubble)
//   sparks  fast glowing streaks           embers  glowing bits drifting up
//   drops   water droplets                 ice     pale shards
//   paper   flat scraps fluttering down    leaves  flat green scraps fluttering
//   pixels  little cubes that don't spin   ecto    glowing blobs floating up
//   heal    green plus signs rising        dirt    dark crumbs

import { getState } from '../engine/state.js';
import { getQualityName } from '../rendering/quality.js';

const KINDS = {
  chunks: { geo: 'cube', size: 0.07, speed: [1.6, 3.2], up: [2, 4], gravity: 14, spin: 10, life: [0.45, 0.7], bounce: true },
  crumbs: { geo: 'crumb', size: 0.06, speed: [1.4, 3], up: [2, 3.6], gravity: 14, spin: 12, life: [0.4, 0.65], bounce: true },
  dirt: { geo: 'crumb', size: 0.055, speed: [1.2, 2.6], up: [2.4, 4], gravity: 15, spin: 9, life: [0.4, 0.6], bounce: true },
  sparks: { geo: 'streak', size: 0.06, speed: [3.5, 6], up: [1.5, 4], gravity: 10, spin: 0, life: [0.2, 0.35], glow: true, orient: true },
  embers: { geo: 'cube', size: 0.05, speed: [0.8, 2], up: [1.2, 2.8], gravity: -0.6, spin: 6, life: [0.5, 0.9], glow: true },
  drops: { geo: 'drop', size: 0.06, speed: [1.6, 3.2], up: [2.5, 4.5], gravity: 15, spin: 0, life: [0.35, 0.55], orient: true },
  ice: { geo: 'shard', size: 0.07, speed: [1.8, 3.4], up: [1.8, 3.4], gravity: 13, spin: 9, life: [0.4, 0.6], bounce: true },
  paper: { geo: 'flake', size: 0.11, speed: [1, 2.2], up: [1.8, 3], gravity: 3.2, spin: 7, life: [0.7, 1.1], flutter: true },
  leaves: { geo: 'flake', size: 0.1, speed: [1, 2.2], up: [1.6, 2.8], gravity: 3.4, spin: 7, life: [0.7, 1.1], flutter: true },
  pixels: { geo: 'cube', size: 0.075, speed: [1.6, 3], up: [2.2, 3.8], gravity: 12, spin: 0, life: [0.4, 0.6], snap: true },
  ecto: { geo: 'blob', size: 0.08, speed: [0.6, 1.6], up: [0.8, 1.8], gravity: -1.4, spin: 0, life: [0.5, 0.8], glow: true },
  heal: { geo: 'plus', size: 0.09, speed: [0.2, 0.5], up: [0.9, 1.4], gravity: 0, spin: 0, life: [0.55, 0.75], glow: true, billboard: true }
};

let geos = null;
const mats = new Map();
const free = new Map();     // geo name -> idle meshes
const active = [];
let flashTexture = null;

function maxActive() {
  const q = getQualityName();
  return q === 'low' ? 90 : q === 'medium' ? 160 : 260;
}

function initGeos() {
  if (geos) return;
  const plus = new THREE.BufferGeometry();
  {
    // A flat plus sign facing +Z, built from two boxes merged by hand.
    const a = new THREE.BoxGeometry(1, 0.34, 0.12);
    const b = new THREE.BoxGeometry(0.34, 1, 0.12);
    const pos = [...a.toNonIndexed().attributes.position.array, ...b.toNonIndexed().attributes.position.array];
    plus.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    plus.computeVertexNormals();
    a.dispose(); b.dispose();
  }
  geos = {
    cube: new THREE.BoxGeometry(1, 1, 1),
    crumb: new THREE.DodecahedronGeometry(0.62, 0),
    streak: new THREE.BoxGeometry(0.3, 0.3, 2.2),
    drop: new THREE.SphereGeometry(0.55, 6, 5).scale(1, 1, 1.9),
    shard: new THREE.OctahedronGeometry(0.6, 0).scale(0.55, 0.55, 1.5),
    flake: new THREE.PlaneGeometry(1, 0.72),
    blob: new THREE.IcosahedronGeometry(0.6, 1),
    plus,
    ring: new THREE.RingGeometry(0.82, 1, 32).rotateX(-Math.PI / 2)
  };
}

function material(kind, color) {
  const spec = KINDS[kind];
  const key = `${spec.glow ? 'g' : spec.geo === 'flake' ? 'f' : 's'}:${color}`;
  let m = mats.get(key);
  if (m) return m;
  if (spec.glow) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  } else if (spec.geo === 'flake') {
    m = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide });
  } else {
    m = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.18 });
  }
  mats.set(key, m);
  return m;
}

function acquire(geoName, mat) {
  initGeos();
  const list = free.get(geoName);
  const mesh = (list && list.pop()) || new THREE.Mesh(geos[geoName], mat);
  mesh.material = mat;
  mesh.visible = true;
  mesh.rotation.set(0, 0, 0);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

function release(p, scene) {
  scene.remove(p.mesh);
  const list = free.get(p.geo) || [];
  if (list.length < 120) list.push(p.mesh);
  free.set(p.geo, list);
}

const rand = ([a, b]) => a + Math.random() * (b - a);

/**
 * Throw a burst of themed debris.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {string} kind - one of KINDS (unknown kinds fall back to chunks)
 * @param {number} color
 * @param {number} [count=6]
 * @param {{dirX?:number, dirZ?:number, spread?:number, scale?:number}} [opts]
 *   dirX/dirZ bias the burst in a direction (e.g. along a shot)
 */
export function burstDebris(x, y, z, kind, color, count = 6, opts = {}) {
  const state = getState();
  if (!state.scene || typeof THREE === 'undefined') return;
  const spec = KINDS[kind] || KINDS.chunks;
  const k = KINDS[kind] ? kind : 'chunks';
  const room = maxActive() - active.length;
  if (room <= 0) return;
  const n = Math.min(count, room);
  const mat = material(k, color);
  const scale = (opts.scale || 1) * spec.size;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = rand(spec.speed);
    let vx = Math.cos(a) * sp;
    let vz = Math.sin(a) * sp;
    if (opts.dirX != null) {
      const bias = opts.spread ?? 0.6;
      vx = vx * bias + opts.dirX * sp * (1 - bias) * 1.6;
      vz = vz * bias + opts.dirZ * sp * (1 - bias) * 1.6;
    }
    const mesh = acquire(spec.geo, mat);
    const s = scale * (0.7 + Math.random() * 0.6);
    mesh.scale.setScalar(s);
    mesh.position.set(x, y, z);
    if (spec.spin) mesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);
    state.scene.add(mesh);
    const life = rand(spec.life);
    active.push({
      mesh, geo: spec.geo, spec, x, y, z, vx, vy: rand(spec.up), vz,
      life, maxLife: life, s, sx: (Math.random() - 0.5) * spec.spin, sy: (Math.random() - 0.5) * spec.spin,
      ph: Math.random() * 6
    });
  }
}

function flashMaterial(color) {
  const key = `flash:${color}`;
  let m = mats.get(key);
  if (m) return m;
  if (!flashTexture) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    flashTexture = new THREE.CanvasTexture(c);
  }
  m = new THREE.SpriteMaterial({ map: flashTexture, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  mats.set(key, m);
  return m;
}

const freeFlashes = [];

/**
 * A quick bloom of light where a shot leaves the tower, plus a couple of sparks
 * thrown forward.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} color
 * @param {number} dirX - unit direction of the shot (ground plane)
 * @param {number} dirZ
 * @param {number} [size=1]
 */
export function muzzleFlash(x, y, z, color, dirX, dirZ, size = 1) {
  const state = getState();
  if (!state.scene || typeof document === 'undefined') return;
  if (active.length >= maxActive()) return;
  const sprite = freeFlashes.pop() || new THREE.Sprite(flashMaterial(color));
  sprite.material = flashMaterial(color);
  sprite.position.set(x + dirX * 0.06, y, z + dirZ * 0.06);
  sprite.renderOrder = 997;
  sprite.visible = true;
  state.scene.add(sprite);
  active.push({ mesh: sprite, flash: true, life: 0.09, maxLife: 0.09, s: 0.55 * size });
  if (getQualityName() !== 'low') burstDebris(x, y, z, 'sparks', color, 2, { dirX, dirZ, spread: 0.25, scale: 0.7 });
}

/**
 * A ring on the floor where a lobbed shell will come down, shrinking to the
 * moment it lands.
 * @param {number} x
 * @param {number} z
 * @param {number} radius - the shell's blast radius, in tiles
 * @param {number} color
 * @param {number} seconds - time until impact
 */
export function landingMarker(x, z, radius, color, seconds) {
  const state = getState();
  if (!state.scene || typeof THREE === 'undefined') return null;
  initGeos();
  const key = `mark:${color}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
    mats.set(key, m);
  }
  const ring = new THREE.Mesh(geos.ring, m);
  ring.position.set(x, 0.06, z);
  ring.renderOrder = 2;
  state.scene.add(ring);
  const p = { mesh: ring, marker: true, life: seconds, maxLife: seconds, s: radius };
  ring.scale.setScalar(radius * 1.35);
  active.push(p);
  return p;
}

/** Remove a landing marker early (its shell landed). */
export function clearMarker(p) {
  if (p) p.life = 0;
}

/**
 * Advance every live effect. Called from systems/particles.js updateParticles.
 * @param {number} dt
 */
export function updateImpactFx(dt) {
  if (!active.length) return;
  const { scene } = getState();
  if (!scene) return;
  for (let i = active.length - 1; i >= 0; i--) {
    const p = active[i];
    p.life -= dt;
    if (p.life <= 0) {
      if (p.flash) { scene.remove(p.mesh); if (freeFlashes.length < 40) freeFlashes.push(p.mesh); }
      else if (p.marker) { scene.remove(p.mesh); }
      else release(p, scene);
      active.splice(i, 1);
      continue;
    }
    const t = p.life / p.maxLife;   // 1 -> 0
    if (p.flash) {
      p.mesh.scale.setScalar(p.s * (0.6 + (1 - t) * 1.2) * (t > 0.4 ? 1 : t / 0.4));
      continue;
    }
    if (p.marker) {
      // Closes in on the blast radius as the shell falls.
      p.mesh.scale.setScalar(p.s * (1 + 0.35 * t));
      continue;
    }
    const spec = p.spec;
    p.vy -= spec.gravity * dt;
    if (spec.flutter) {
      p.vx *= 0.96; p.vz *= 0.96;
      p.vy = Math.max(p.vy, -1.1);
      p.x += Math.sin(p.ph + p.life * 9) * 0.6 * dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    if (p.y < 0.05 && p.vy < 0) {
      if (spec.bounce && Math.abs(p.vy) > 1.5) { p.vy *= -0.35; p.vx *= 0.5; p.vz *= 0.5; }
      else { p.y = 0.05; p.vy = 0; p.vx *= 0.8; p.vz *= 0.8; }
    }
    const m = p.mesh;
    m.position.set(p.x, p.y, p.z);
    if (spec.orient) {
      m.lookAt(p.x + p.vx, p.y + p.vy, p.z + p.vz);
    } else if (spec.billboard) {
      const cam = getState().camera;
      if (cam) m.quaternion.copy(cam.quaternion);
    } else if (spec.spin) {
      m.rotation.x += p.sx * dt;
      m.rotation.y += p.sy * dt;
    }
    // Hold full size, then shrink away over the last 40% of life.
    m.scale.setScalar(p.s * (t > 0.4 ? 1 : t / 0.4));
  }
}

/** Drop every live effect (match end / restart). */
export function clearImpactFx() {
  const { scene } = getState();
  for (const p of active) if (scene) scene.remove(p.mesh);
  active.length = 0;
}

/** For tests and the perf overlay. */
export function getImpactFxCount() {
  return active.length;
}
