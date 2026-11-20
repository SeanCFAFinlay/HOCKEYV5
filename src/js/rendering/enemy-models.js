// Enemy bodies: the built-in worlds' models, and the template cache every
// world's enemies are instanced from.
//
// An enemy type is modelled once into a template: static parts are merged to
// one mesh per material, and the parts that move (legs, arms, rotors, wings,
// flames) stay as small sub-groups tagged with how they move. Each enemy on
// the board is then a clone of that template, sharing its geometry and
// materials — so nothing here may tint or resize a material per enemy.
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, faces +Z, and its feet reach y = -1. Builders get a
// modeller (rendering/model-kit.js) already scaled to the enemy's size.
//
// Moving parts are tagged through `part()`; rendering/enemy-anim.js reads the
// tag. Builders may also set `proto.wings`, `proto.flames` and `proto.crownGem`
// exactly as the theme kits do (rendering/animations.js animates those).

import { G, M, modeller } from './model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from './geo-utils.js';

const HALF = Math.PI / 2;
const TAU = Math.PI * 2;

// The kit's paint and chrome mirror the arena strongly, which is right for a
// tower but bleaches a small creature on bright ice. Enemies get the same
// surfaces with the reflection turned well down, so their own colour carries.
const P = (color, { gloss = 0.6, glow = 0.1 } = {}) => new THREE.MeshStandardMaterial({
  color, metalness: 0.1, roughness: 1 - gloss * 0.75, emissive: color, emissiveIntensity: glow, envMapIntensity: 0.3
});
const MT = (color = 0xb9c4d2, { rough = 0.3 } = {}) => new THREE.MeshStandardMaterial({
  color, metalness: 0.85, roughness: rough, envMapIntensity: 0.7
});

// ── Shared building blocks ──────────────────────────────────────────────────

/** A sub-assembly that moves. `anim` is plain data: see enemy-anim.js. */
function part(m, anim, opts) {
  const g = m.group(opts);
  g.object.userData.anim = anim;
  return g;
}

function eyes(m, { x = 0.3, y = 0.2, z = 0.6, r = 0.2, white = 0xffffff, pupil = 0x05070c, brow = 0, browMat = null, socket = null, flat = 0.7, look = 0.72 } = {}) {
  for (const s of [-1, 1]) {
    if (socket) m.add(G.sphere(r * 1.25, 10, 8), socket, { p: [s * x, y, z - r * 0.22], s: [1, 1, flat], shadow: false });
    m.add(G.sphere(r, 12, 10), M.glow(white), { p: [s * x, y, z], s: [1, 1, flat], shadow: false });
    m.add(G.sphere(r * 0.52, 8, 6), M.glow(pupil), { p: [s * x * 0.93, y - r * 0.04, z + r * flat * look], s: [1, 1, 0.6], shadow: false });
    if (brow) {
      m.add(G.box(r * 1.9, r * 0.3, r * 0.4), browMat || M.matte(0x0b0d12), { p: [s * x, y + r * 0.95, z + r * 0.45], r: [0.5, 0, -s * brow], shadow: false });
    }
  }
}

/**
 * A flickering flame (rendering/animations.js overwrites its X/Y scale, so the
 * mesh sits at scale 1 inside a holder that carries the creature's size).
 */
function flame(m, proto, { p, r = [0, 0, 0], rad = 0.16, h = 0.6, color = 0xff8a1f, core = 0xffe27a }) {
  const holder = m.group({ p, r });
  holder.object.scale.setScalar(m.scale);
  const geo = G.cone(rad, h, 7);
  geo.translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, M.energy(color, 0.9));
  holder.object.add(mesh);
  if (core) {
    const inner = G.cone(rad * 0.5, h * 0.55, 6);
    inner.translate(0, h * 0.275, 0);
    mesh.add(new THREE.Mesh(inner, M.glow(core)));
  }
  (proto.flames = proto.flames || []).push(mesh);
}

/** Two wings hinged at the body; rendering/animations.js flaps `proto.wings`. */
function wings(m, proto, mat, outline, { x = 0.3, y = 0.3, z = 0, thick = 0.04 } = {}) {
  mat.side = THREE.DoubleSide;
  proto.wings = [1, -1].map(s => {
    const geo = G.plate(outline, thick);
    geo.rotateX(-HALF);                    // outline +y becomes "towards the tail"
    if (s < 0) geo.scale(-1, 1, 1);
    return m.add(geo, mat, { p: [s * x, y, z] });
  });
}

const FEATHER_WING = [[0, -0.3], [0.5, -0.42], [1.05, -0.3], [1.5, -0.02], [1.2, 0.08], [1.25, 0.3], [0.9, 0.24], [0.85, 0.48], [0.5, 0.3], [0.38, 0.5], [0, 0.3]];
const FLAME_WING = [[0, -0.28], [0.5, -0.5], [0.95, -0.38], [1.55, -0.5], [1.2, -0.08], [1.6, 0.22], [1.0, 0.18], [1.05, 0.6], [0.6, 0.3], [0.4, 0.62], [0, 0.3]];

// ── Hockey: pucks with attitude, and the skaters who shoot them ─────────────

/** A puck's turned profile: flat faces, a bevelled rim. */
function puckGeo(r, h) {
  const b = Math.min(0.07, h * 0.2);
  return G.lathe([[0, 0], [r - b, 0], [r, b], [r, h - b], [r - b, h], [0, h]], 28);
}

/** A puck lying flat with its top face at y = top. */
function puck(m, { r = 0.82, h = 0.5, top = 0.2, body, band = null, bandH = 0.3, logo = null }) {
  const y = top - h;
  m.add(puckGeo(r, h), body, { p: [0, y, 0] });
  if (band) m.add(G.sleeve(r + 0.02, r + 0.02, h * bandH, 28), band, { p: [0, y + h / 2, 0], shadow: false });
  if (logo) m.add(G.ring(r * 0.4, r * 0.64, 28), logo, { p: [0, top + 0.015, 0], r: [-HALF, 0, 0], shadow: false });
}

/** A short leg ending in a skate (or a boot when `blade` is null), swinging at the hip. */
function leg(m, s, { x, hip, len = 0.4, r = 0.13, mat, boot = null, blade = null, amp = 0.7, bootL = 0.42, z = 0, ph = null }) {
  const g = part(m, { k: 'swing', ax: 'x', amp, ph: ph ?? (s > 0 ? 0 : Math.PI) }, { p: [s * x, hip, z] });
  g.add(G.cyl(r, r * 0.9, len, 8), mat, { p: [0, -len / 2, 0] });
  g.add(G.rbox(r * 2.4, r * 1.7, bootL, 0.05), boot || mat, { p: [0, -len - r * 0.3, bootL * 0.22] });
  if (blade) g.add(G.box(0.05, 0.08, bootL * 1.3), blade, { p: [0, -len - r * 1.3, bootL * 0.22] });
  return g;
}

function hkPuck(m, proto, c) {
  // The rank and file: a regulation puck that grew legs and a grudge.
  const rubber = P(0x15171d, { gloss: 0.55 });
  const neon = M.glow(c.accent);
  const white = P(0xf4f8ff, { gloss: 0.6 });
  puck(m, { r: 0.84, h: 0.52, top: 0.22, body: rubber, band: neon, bandH: 0.26, logo: neon });
  eyes(m, { x: 0.33, y: 0.3, z: 0.5, r: 0.27, brow: 0.35 });
  m.add(G.rbox(0.42, 0.11, 0.06, 0.02), M.glow(0xffffff), { p: [0, -0.12, 0.84], shadow: false });   // gritted teeth
  for (const s of [-1, 1]) {
    leg(m, s, { x: 0.36, hip: -0.28, len: 0.4, mat: rubber, boot: white, blade: MT(), amp: 0.8 });
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.9, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.86, -0.05, 0] });
    arm.add(G.capsule(0.09, 0.42, 6), rubber, { p: [0, -0.4, 0] });
    arm.add(G.sphere(0.15, 8, 6), white, { p: [0, -0.42, 0.02] });
  }
}

function hkHotPuck(m, proto, c) {
  // Left on the heater: the rubber glows, the top face is a hotplate.
  const hot = P(0xc8260f, { gloss: 0.5, glow: 0.55 });
  const char = M.matte(0x260d08);
  puck(m, { r: 0.84, h: 0.52, top: 0.2, body: hot, band: M.glow(0xffc23d), bandH: 0.18 });
  m.add(G.cyl(0.6, 0.6, 0.03, 24), M.glow(0xffb02e), { p: [0, 0.215, 0], shadow: false });
  m.add(G.torus(0.72, 0.06, 6, 24), char, { p: [0, 0.2, 0], r: [HALF, 0, 0] });
  eyes(m, { x: 0.33, y: 0.26, z: 0.56, r: 0.24, white: 0xfff1a8, brow: 0.55, browMat: char });
  m.add(G.plate([[-0.24, 0.06], [-0.12, -0.02], [0, 0.06], [0.12, -0.02], [0.24, 0.06], [0.2, -0.1], [-0.2, -0.1]], 0.05), M.glow(0xffe27a), { p: [0, -0.13, 0.85], shadow: false });
  for (const s of [-1, 1]) leg(m, s, { x: 0.36, hip: -0.3, len: 0.38, mat: char, blade: MT(0x8a8f99), amp: 0.7 });
  flame(m, proto, { p: [0, 0.2, -0.15], rad: 0.3, h: 0.95 });
  flame(m, proto, { p: [-0.4, 0.2, -0.3], rad: 0.2, h: 0.6 });
  flame(m, proto, { p: [0.4, 0.2, -0.3], rad: 0.2, h: 0.6 });
}

function hkFlyingPuck(m, proto, c) {
  // A chip shot that never came down: beanie rotor, goggles, landing skids.
  const shell = P(0x1b86d8, { gloss: 0.7, glow: 0.25 });
  const white = P(0xf4fbff, { gloss: 0.6, glow: 0.1 });
  const dark = M.matte(0x0c1b2b);
  puck(m, { r: 0.8, h: 0.46, top: 0.12, body: shell, band: white, bandH: 0.3 });
  m.add(G.rbox(1.0, 0.24, 0.16, 0.06), dark, { p: [0, 0.02, 0.72] });                          // goggle strap
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.2, 0.2, 0.14, 14), white, { p: [s * 0.25, 0.04, 0.78], r: [HALF, 0, 0] });
    m.add(G.sphere(0.16, 10, 8), M.glow(0x16e0ff), { p: [s * 0.25, 0.04, 0.83], s: [1, 1, 0.5], shadow: false });
    m.add(G.sphere(0.07, 8, 6), M.glow(0x05070c), { p: [s * 0.24, 0.03, 0.91], s: [1, 1, 0.5], shadow: false });
    m.add(G.tube([[s * 0.4, -0.3, 0.3], [s * 0.5, -0.62, 0.35], [s * 0.5, -0.62, -0.35], [s * 0.4, -0.3, -0.3]], 0.045, 6), dark);
  }
  m.add(G.plate([[0, 0], [0.34, 0.12], [0.42, 0.42], [0.1, 0.34]], 0.05), white, { p: [0, 0.1, -0.62], r: [0, HALF, 0] });   // tail fin
  m.add(G.cyl(0.06, 0.08, 0.34, 8), dark, { p: [0, 0.29, 0] });
  const rotor = part(m, { k: 'spin', ax: 'y', sp: 26 }, { p: [0, 0.5, 0] });
  for (let i = 0; i < 3; i++) rotor.add(G.rbox(0.2, 0.03, 1.0, 0.012), dark, { p: [Math.sin(i * TAU / 3) * 0.5, 0, Math.cos(i * TAU / 3) * 0.5], r: [0, i * TAU / 3, 0] });
  rotor.add(G.sphere(0.11, 8, 6), P(0xffc928, { glow: 0.3 }));
  m.add(G.cyl(1.0, 1.0, 0.012, 24), M.glass(0x2a5d8a, 0.22), { p: [0, 0.5, 0], shadow: false });  // rotor blur
}

function hkHeavyPuck(m, proto, c) {
  // Two pucks thick, banded in steel, wearing a goalie's cage.
  const shell = P(c.color, { gloss: 0.6, glow: 0.2 });
  const steel = MT(0xaab8c8, { rough: 0.32 });
  const dark = M.matte(0x0c1424);
  puck(m, { r: 0.9, h: 0.78, top: 0.26, body: shell });
  for (const y of [-0.34, 0.08]) m.add(G.torus(0.92, 0.075, 6, 28), steel, { p: [0, y, 0], r: [HALF, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.39;
    m.add(G.cone(0.09, 0.2, 6), steel, { p: [Math.sin(a) * 1.0, -0.13, Math.cos(a) * 1.0], r: [Math.cos(a) * HALF, 0, -Math.sin(a) * HALF] });
  }
  // Helmet: a steel cap, a crest, and a barred visor with eyes glaring through.
  m.add(G.dome(0.72, 18), steel, { p: [0, 0.26, 0], s: [1, 0.5, 1] });
  m.add(G.rbox(0.14, 0.26, 1.2, 0.05), P(c.accent, { gloss: 0.7, glow: 0.3 }), { p: [0, 0.56, -0.05] });
  m.add(G.rbox(1.0, 0.3, 0.1, 0.04), dark, { p: [0, 0.0, 0.88], shadow: false });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.11, 8, 6), M.glow(c.accent), { p: [s * 0.24, 0.0, 0.92], s: [1.3, 0.8, 0.5], shadow: false });
    leg(m, s, { x: 0.42, hip: -0.42, len: 0.28, r: 0.17, mat: dark, boot: steel, amp: 0.45, bootL: 0.5 });
  }
  for (const x of [-0.36, 0, 0.36]) m.add(G.cyl(0.025, 0.025, 0.34, 5), steel, { p: [x, 0.0, 0.95], shadow: false });
}

function hkInfernoPuck(m, proto, c) {
  // Molten core in a cracked iron shell, horned and armoured.
  const iron = MT(0x4a5670, { rough: 0.5 });
  const lava = M.glow(0xff8a1f);
  const char = P(0x2a1210, { gloss: 0.4 });
  const bone = P(0xf3e6c4, { gloss: 0.5 });
  puck(m, { r: 0.86, h: 0.72, top: 0.24, body: char, band: lava, bandH: 0.5 });
  m.add(G.cyl(0.66, 0.66, 0.03, 24), lava, { p: [0, 0.255, 0], shadow: false });
  // Six plates round the rim with glowing gaps between them.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + TAU / 12;
    if (Math.cos(a) > 0.8) continue;       // leave the face clear
    m.add(G.rbox(0.62, 0.62, 0.12, 0.04), iron, { p: [Math.sin(a) * 0.9, -0.12, Math.cos(a) * 0.9], r: [0, a, 0] });
  }
  m.add(G.rbox(0.9, 0.2, 0.14, 0.04), iron, { p: [0, -0.38, 0.86] });                        // jaw guard
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.5, 0.2, 0], [s * 0.95, 0.4, 0.05], [s * 1.0, 0.85, 0.2]], 0.12, 7), bone);   // horns
    m.add(G.cone(0.12, 0.3, 7), bone, { p: [s * 1.0, 1.0, 0.25], r: [0.3, 0, 0] });
    leg(m, s, { x: 0.4, hip: -0.42, len: 0.28, r: 0.17, mat: char, boot: iron, amp: 0.45, bootL: 0.5 });
  }
  eyes(m, { x: 0.3, y: 0.0, z: 0.84, r: 0.2, white: 0xffe27a, pupil: 0x3a0a00, brow: 0.6, browMat: iron, flat: 0.5 });
  flame(m, proto, { p: [0, 0.24, -0.1], rad: 0.34, h: 1.0 });
  flame(m, proto, { p: [-0.38, 0.24, -0.35], rad: 0.2, h: 0.6 });
  flame(m, proto, { p: [0.38, 0.24, -0.35], rad: 0.2, h: 0.6 });
}

function hkFlyingFire(m, proto, c) {
  // A slapshot on fire: comet tail, wings of flame.
  const hot = P(0xe8430f, { gloss: 0.6, glow: 0.45 });
  const char = M.matte(0x2a0f08);
  puck(m, { r: 0.72, h: 0.44, top: 0.2, body: hot, band: M.glow(0xffe27a), bandH: 0.22 });
  m.add(G.cyl(0.5, 0.5, 0.03, 20), M.glow(0xffd34d), { p: [0, 0.215, 0], shadow: false });
  eyes(m, { x: 0.28, y: 0.24, z: 0.48, r: 0.22, white: 0xd9f7ff, brow: 0.6, browMat: char });
  wings(m, proto, M.glow(0xff7a14), FLAME_WING, { x: 0.45, y: 0.02, z: 0 });
  flame(m, proto, { p: [0, 0, -0.6], r: [-HALF, 0, 0], rad: 0.32, h: 1.1 });
  flame(m, proto, { p: [-0.3, 0, -0.55], r: [-HALF, 0, 0.3], rad: 0.18, h: 0.65 });
  flame(m, proto, { p: [0.3, 0, -0.55], r: [-HALF, 0, -0.3], rad: 0.18, h: 0.65 });
}

function hkBossPuck(m, proto, c) {
  // The puck every other puck answers to: crowned, gold-banded, all teeth.
  const rubber = P(0x0d0e12, { gloss: 0.85 });
  const gold = MT(0xffc531, { rough: 0.22 });
  gold.emissive = new THREE.Color(0x7a4a00);
  gold.emissiveIntensity = 0.45;
  const bone = P(0xfffbe6, { gloss: 0.6 });
  puck(m, { r: 0.9, h: 0.82, top: 0.3, body: rubber });
  for (const y of [-0.36, 0.14]) m.add(G.torus(0.91, 0.07, 6, 30), gold, { p: [0, y, 0], r: [HALF, 0, 0] });
  m.add(G.ring(0.42, 0.74, 28), gold, { p: [0, 0.315, 0], r: [-HALF, 0, 0], shadow: false });
  // Face on the rim: burning eyes under a gold brow, a jagged mouth.
  eyes(m, { x: 0.34, y: 0.02, z: 0.86, r: 0.2, white: 0xff3b1f, pupil: 0xfff2b0, brow: 0.5, browMat: gold, flat: 0.5 });
  m.add(G.plate([[-0.5, 0.08], [-0.36, -0.02], [-0.24, 0.08], [-0.12, -0.02], [0, 0.08], [0.12, -0.02], [0.24, 0.08], [0.36, -0.02], [0.5, 0.08], [0.4, -0.16], [-0.4, -0.16]], 0.08), bone, { p: [0, -0.3, 0.89], shadow: false });
  // Crown.
  m.add(G.sleeve(0.46, 0.4, 0.22, 18), gold, { p: [0, 0.42, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    m.add(G.cone(0.11, 0.36, 4), gold, { p: [Math.sin(a) * 0.44, 0.7, Math.cos(a) * 0.44] });
  }
  const gem = m.group({ p: [0, 0.48, 0.47] });
  gem.object.scale.setScalar(m.scale);
  proto.crownGem = new THREE.Mesh(G.sphere(0.11, 8, 6), M.glow(0xff2a2a));
  gem.object.add(proto.crownGem);
  for (const s of [-1, 1]) {
    m.add(G.cone(0.15, 0.4, 6), gold, { p: [s * 0.86, 0.44, -0.2], r: [0, 0, -s * 0.7] });   // shoulder spikes
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.84, -0.02, 0.3] });
    arm.add(G.capsule(0.14, 0.5, 8), rubber, { p: [0, -0.5, 0.1] });
    arm.add(G.sphere(0.25, 10, 8), rubber, { p: [0, -0.56, 0.2] });
    arm.add(G.torus(0.19, 0.07, 6, 14), gold, { p: [0, -0.56, 0.3] });
    leg(m, s, { x: 0.44, hip: -0.5, len: 0.2, r: 0.18, mat: rubber, boot: gold, amp: 0.4, bootL: 0.56 });
  }
}

/**
 * A stocky skater. Everything above the hips is built into a group tipped
 * forward by `lean`, so one builder gives an upright bruiser or a racing crouch.
 */
function skater(m, proto, o) {
  const jersey = P(o.jersey, { gloss: 0.5, glow: 0.22 });
  const trim = P(o.trim, { gloss: 0.55, glow: 0.12 });
  const pants = P(o.pants, { gloss: 0.4, glow: 0.08 });
  const skin = P(o.skin || 0xf0b98a, { gloss: 0.35, glow: 0.08 });
  const glove = P(o.glove || o.pants, { gloss: 0.5, glow: 0.1 });
  const steel = MT();
  const b = o.bulk || 1;
  const hip = -0.32;
  for (const s of [-1, 1]) {
    leg(m, s, { x: 0.2 * b, hip, len: 0.42, r: 0.14 * Math.sqrt(b), mat: pants, blade: steel, amp: o.stride || 0.6, bootL: o.bladeL || 0.44 });
  }
  const up = m.group({ p: [0, hip, 0], r: [o.lean || 0, 0, 0] });
  up.add(G.rbox(0.72 * b, 0.66, 0.48, 0.14), jersey, { p: [0, 0.34, 0] });
  up.add(G.rbox(0.75 * b, 0.12, 0.5, 0.04), trim, { p: [0, 0.1, 0] });                       // hem stripe
  up.add(G.rbox(0.3, 0.3, 0.04, 0.015), trim, { p: [0, 0.4, -0.245] });                      // number patch
  for (const s of [-1, 1]) {
    up.add(G.sphere(0.23, 12, 8), o.pads ? trim : jersey, { p: [s * 0.38 * b, 0.6, 0], s: [1.25, 0.8, 1.25] });
  }
  // Head.
  const hy = 1.0, hz = 0.05;
  up.add(G.sphere(0.3, 14, 10), skin, { p: [0, hy, hz] });
  if (o.helmet != null) {
    const lid = P(o.helmet, { gloss: 0.8, glow: 0.15 });
    up.add(new THREE.SphereGeometry(0.345, 16, 10, 0, TAU, 0, Math.PI * 0.56), lid, { p: [0, hy + 0.02, hz - 0.01], r: [-0.42, 0, 0] });
    if (o.tail) up.add(G.cone(0.28, 0.6, 12), lid, { p: [0, hy + 0.1, hz - 0.42], r: [-HALF - 0.25, 0, 0], s: [0.9, 1, 0.7] });
    if (o.visor) up.add(G.rbox(0.5, 0.15, 0.2, 0.05), P(0x0a1622, { gloss: 0.95 }), { p: [0, hy + 0.02, hz + 0.2] });
    if (o.cage) {
      for (const y of [-0.16, -0.04]) up.add(G.torus(0.3, 0.022, 5, 14, Math.PI), steel, { p: [0, hy + y, hz + 0.04], r: [HALF, 0, 0], s: [1, 1, 1], shadow: false });
      for (const x of [-0.12, 0.12]) up.add(G.cyl(0.02, 0.02, 0.26, 5), steel, { p: [x, hy - 0.1, hz + 0.29], shadow: false });
    }
  }
  if (!o.visor) {
    for (const s of [-1, 1]) {
      up.add(G.sphere(0.075, 8, 6), M.glow(0xffffff), { p: [s * 0.12, hy - 0.02, hz + 0.265], s: [1, 1.1, 0.5], shadow: false });
      up.add(G.sphere(0.04, 6, 5), M.glow(0x05070c), { p: [s * 0.115, hy - 0.025, hz + 0.3], s: [1, 1, 0.5], shadow: false });
    }
  }
  return { up, jersey, trim, pants, skin, glove, steel, b, hy, hz };
}

function hkSpeedSkater(m, proto, c) {
  // A sprinter in a skin suit: bent double, one arm behind, long blades.
  const k = skater(m, proto, { jersey: 0x0c2740, trim: 0x00e5ff, pants: 0x0c2740, glove: 0x00e5ff, helmet: 0x00d8f0, tail: true, visor: true, lean: 0.95, bulk: 0.85, stride: 1.0, bladeL: 0.62 });
  const { up, jersey, glove } = k;
  up.add(G.rbox(0.14, 0.5, 0.05, 0.02), M.glow(0x00e5ff), { p: [0, 0.36, -0.25], shadow: false });      // racing stripe
  up.add(G.capsule(0.09, 0.56, 6), jersey, { p: [0.12, 0.42, -0.34], r: [0, 0, 0.5] });                    // arm folded on the back
  const arm = part(up, { k: 'swing', ax: 'x', amp: 1.1, ph: 0, base: -0.6 }, { p: [-0.36, 0.56, 0] });
  arm.add(G.capsule(0.09, 0.5, 6), jersey, { p: [0, -0.48, 0] });
  arm.add(G.sphere(0.13, 8, 6), glove, { p: [0, -0.5, 0] });
}

function hkDefenseman(m, proto, c) {
  // A wall on skates: huge pads, caged helmet, stick held across like a gate.
  const k = skater(m, proto, { jersey: 0x2450d8, trim: 0xf2f6ff, pants: 0x101b3d, glove: 0xf2f6ff, helmet: 0x2450d8, cage: true, pads: true, bulk: 1.5, lean: 0.18, stride: 0.4 });
  const { up, jersey, glove, steel, b } = k;
  const wood = P(0xe2bd7c, { gloss: 0.4, glow: 0.1 });
  for (const s of [-1, 1]) {
    up.add(G.rbox(0.4, 0.1, 0.5, 0.04), steel, { p: [s * 0.4 * b, 0.74, 0] });                              // shoulder plates
    up.add(G.tube([[s * 0.42 * b, 0.55, 0.02], [s * 0.6 * b, 0.36, 0.3], [s * 0.42 * b, 0.3, 0.52]], 0.13, 7), jersey);
    up.add(G.rbox(0.3, 0.32, 0.3, 0.09), glove, { p: [s * 0.42 * b, 0.3, 0.56] });
    up.add(G.rbox(0.3, 0.42, 0.12, 0.05), glove, { p: [s * 0.2 * b, -0.42 + 0.32, 0.26], shadow: false }); // shin pads (ride on the hips)
  }
  up.add(G.cyl(0.05, 0.05, 2.1, 6), wood, { p: [0, 0.3, 0.62], r: [0, 0, HALF] });
  up.add(G.rbox(0.42, 0.14, 0.06, 0.02), M.matte(0x16181d), { p: [1.1, 0.2, 0.62], r: [0, 0, -0.5] });
  up.add(G.rbox(0.5, 0.2, 0.05, 0.02), P(0xf2f6ff, { gloss: 0.5 }), { p: [0, 0.46, 0.245] });        // chest crest
}

function hkEnforcer(m, proto, c) {
  // Gloves off, helmet off, fists up: he is not here for the puck.
  const k = skater(m, proto, { jersey: c.color, trim: 0x16181d, pants: 0x16181d, glove: 0xf0b98a, pads: true, bulk: 1.28, lean: 0.3, stride: 0.6 });
  const { up, jersey, skin, hy, hz } = k;
  const black = M.matte(0x16181d);
  up.add(G.rbox(0.12, 0.2, 0.52, 0.04), black, { p: [0, hy + 0.3, hz - 0.04] });                            // mohawk
  up.add(G.rbox(0.2, 0.07, 0.04, 0.015), P(0xffffff), { p: [0.13, hy + 0.1, hz + 0.27], r: [0, 0, 0.4], shadow: false });   // plaster
  up.add(G.rbox(0.2, 0.06, 0.04, 0.01), M.glow(0xffffff), { p: [0, hy - 0.15, hz + 0.27], shadow: false }); // gritted grin
  up.add(G.box(0.05, 0.065, 0.045), black, { p: [0.04, hy - 0.15, hz + 0.275], shadow: false });            // missing tooth
  for (const s of [-1, 1]) {
    up.add(G.box(0.2, 0.05, 0.05), black, { p: [s * 0.12, hy + 0.09, hz + 0.27], r: [0, 0, -s * 0.5], shadow: false });
    for (let i = 0; i < 2; i++) up.add(G.cone(0.08, 0.26, 5), MT(0xd0d6de), { p: [s * (0.36 + i * 0.16) * k.b, 0.76 - i * 0.04, 0], r: [0, 0, -s * (0.2 + i * 0.5)] });
    const arm = part(up, { k: 'swing', ax: 'x', amp: 0.45, ph: s > 0 ? 0 : Math.PI, base: -1.75, f: 2 }, { p: [s * 0.46 * k.b, 0.56, 0.02] });
    arm.add(G.capsule(0.12, 0.46, 7), jersey, { p: [0, -0.44, 0] });
    arm.add(G.sphere(0.19, 10, 8), skin, { p: [0, -0.5, 0] });
    arm.add(G.torus(0.13, 0.04, 5, 12), P(0xffffff), { p: [0, -0.36, 0], r: [HALF, 0, 0] });         // taped wrist
  }
}

// ── Soccer: the balls fight back ────────────────────────────────────────────

// The twelve vertices of an icosahedron: where a football's pentagons sit.
const ICO = (() => {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [];
  for (const a of [-1, 1]) for (const b of [-t, t]) v.push([0, a, b], [a, b, 0], [b, 0, a]);
  return v.map(([x, y, z]) => { const n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; });
})();

/** A football: a sphere with pentagonal panels. The two front panels are left off for the face. */
function football(m, { r = 0.74, y = 0, base, patch, cap = 0.42 }) {
  m.add(G.sphere(r, 24, 16), base, { p: [0, y, 0] });
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const [dx, dy, dz] of ICO) {
    if (dz > 0.8) continue;
    q.setFromUnitVectors(up, new THREE.Vector3(dx, dy, dz));
    e.setFromQuaternion(q);
    m.add(new THREE.SphereGeometry(r * 1.036, 5, 3, 0, TAU, 0, cap), patch, { p: [0, y, 0], r: [e.x, e.y, e.z], shadow: false });
  }
}

/** A short sock-and-boot leg with studs. */
function bootLeg(m, s, { x = 0.3, hip = -0.5, len = 0.26, r = 0.12, sock, boot, amp = 0.8, bootL = 0.42 }) {
  const g = part(m, { k: 'swing', ax: 'x', amp, ph: s > 0 ? 0 : Math.PI }, { p: [s * x, hip, 0] });
  g.add(G.cyl(r, r, len, 8), sock, { p: [0, -len / 2, 0] });
  const by = -len - r * 0.7;
  g.add(G.sphere(r * 1.5, 10, 8), boot, { p: [0, by, bootL * 0.25], s: [1, 0.7, bootL / (r * 3) * 1.6] });
  return g;
}

function scBall(m, proto, c) {
  const white = P(0xf6f6f2, { gloss: 0.6, glow: 0.12 });
  const black = P(0x14161a, { gloss: 0.5 });
  football(m, { r: 0.74, y: 0.02, base: white, patch: black });
  eyes(m, { x: 0.27, y: 0.2, z: 0.6, r: 0.24, socket: M.glow(0x14161a), brow: 0.3 });
  m.add(G.rbox(0.3, 0.07, 0.05, 0.02), M.glow(0x14161a), { p: [0, -0.2, 0.74], shadow: false });
  const boot = P(0xd0101c, { gloss: 0.7, glow: 0.12 });
  for (const s of [-1, 1]) bootLeg(m, s, { x: 0.3, hip: -0.52, sock: white, boot, amp: 0.9 });
}

function scFireBall(m, proto, c) {
  // A screamer: the leather is alight and the panels have charred.
  const hot = P(0xd8300c, { gloss: 0.5, glow: 0.42 });
  const char = M.matte(0x2a0f08);
  football(m, { r: 0.74, y: 0.02, base: hot, patch: char });
  eyes(m, { x: 0.27, y: 0.2, z: 0.6, r: 0.23, white: 0xffe680, socket: char, brow: 0.55, browMat: char });
  m.add(G.plate([[-0.2, 0.05], [-0.1, -0.03], [0, 0.05], [0.1, -0.03], [0.2, 0.05], [0.16, -0.1], [-0.16, -0.1]], 0.05), M.glow(0xffe27a), { p: [0, -0.22, 0.73], shadow: false });
  for (const s of [-1, 1]) bootLeg(m, s, { x: 0.3, hip: -0.52, sock: char, boot: char, amp: 0.8 });
  flame(m, proto, { p: [0, 0.66, -0.1], rad: 0.32, h: 0.95 });
  flame(m, proto, { p: [-0.4, 0.5, -0.25], rad: 0.2, h: 0.6 });
  flame(m, proto, { p: [0.4, 0.5, -0.25], rad: 0.2, h: 0.6 });
  flame(m, proto, { p: [0, 0.3, -0.62], r: [-0.9, 0, 0], rad: 0.22, h: 0.7 });
}

function scFlyingBall(m, proto, c) {
  // Lofted and staying up: feathered wings, a tail, boots tucked.
  const white = P(0xf2fdff, { gloss: 0.65, glow: 0.2 });
  const sky = P(0x1596e8, { gloss: 0.7, glow: 0.22 });
  football(m, { r: 0.66, y: 0, base: white, patch: sky });
  eyes(m, { x: 0.24, y: 0.16, z: 0.54, r: 0.22, socket: M.glow(0x12303d) });
  wings(m, proto, P(0xffffff, { gloss: 0.3, glow: 0.7 }), FEATHER_WING, { x: 0.5, y: 0.12, z: 0 });
  for (const a of [-0.45, 0, 0.45]) {
    m.add(G.plate([[-0.1, 0], [0, 0.6], [0.1, 0]], 0.04), sky, { p: [Math.sin(a) * 0.2, 0.05, -0.6], r: [-HALF + 0.25, 0, a * 1.2] });
  }
  for (const s of [-1, 1]) m.add(G.sphere(0.16, 8, 6), sky, { p: [s * 0.24, -0.62, 0.08], s: [1, 0.6, 1.6] });
}

function scHeavyBall(m, proto, c) {
  // An old lace-up medicine ball in a steel helmet and hobnailed boots.
  const leather = P(0x1f5a2c, { gloss: 0.4, glow: 0.18 });
  const panel = P(0xb7e04a, { gloss: 0.4, glow: 0.15 });
  const steel = MT(0xb4bfcc, { rough: 0.35 });
  const dark = M.matte(0x101812);
  football(m, { r: 0.82, y: 0.04, base: leather, patch: panel, cap: 0.36 });
  m.add(G.torus(0.84, 0.07, 6, 28), steel, { p: [0, -0.08, 0], r: [HALF, 0, 0] });            // waist band
  // Helmet with a nose guard.
  m.add(G.dome(0.7, 20), steel, { p: [0, 0.46, 0], s: [1, 0.7, 1] });
  m.add(G.torus(0.7, 0.06, 6, 28), steel, { p: [0, 0.46, 0], r: [HALF, 0, 0] });
  m.add(G.rbox(0.14, 0.5, 0.1, 0.04), steel, { p: [0, 0.26, 0.76], r: [-0.45, 0, 0] });
  m.add(G.rbox(0.12, 0.26, 0.9, 0.05), P(0xc40f24, { gloss: 0.6, glow: 0.15 }), { p: [0, 1.0, -0.05] });   // crest
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.12, 8, 6), M.glow(0xfff6a8), { p: [s * 0.3, 0.04, 0.78], s: [1.2, 0.9, 0.5], shadow: false });
    m.add(G.sphere(0.055, 6, 5), M.glow(0x05070c), { p: [s * 0.29, 0.03, 0.84], s: [1, 1, 0.5], shadow: false });
    bootLeg(m, s, { x: 0.36, hip: -0.6, len: 0.2, r: 0.16, sock: dark, boot: steel, amp: 0.45, bootL: 0.5 });
    for (let i = 0; i < 3; i++) {
      const a = s * (0.9 + i * 0.55);
      m.add(G.cone(0.08, 0.18, 6), steel, { p: [Math.sin(a) * 0.92, -0.08, Math.cos(a) * 0.92], r: [Math.cos(a) * HALF, 0, -Math.sin(a) * HALF] });
    }
  }
}

function scInfernoBall(m, proto, c) {
  // Cooled lava crust over a molten core: every panel seam glows.
  const crust = P(0x1f0f0b, { gloss: 0.35 });
  const lava = M.glow(0xff7a1a);
  const bone = P(c.accent, { gloss: 0.5, glow: 0.2 });
  const iron = MT(0x59606e, { rough: 0.5 });
  football(m, { r: 0.8, y: 0.02, base: crust, patch: lava, cap: 0.3 });
  m.add(G.rbox(1.0, 0.24, 0.16, 0.05), iron, { p: [0, -0.38, 0.66] });                         // jaw plate
  for (const x of [-0.3, -0.1, 0.1, 0.3]) m.add(G.cone(0.06, 0.16, 4), M.glow(0xffe27a), { p: [x, -0.2, 0.76], r: [0.2, 0, 0], shadow: false });
  eyes(m, { x: 0.28, y: 0.2, z: 0.68, r: 0.2, white: 0xffe27a, pupil: 0x3a0a00, brow: 0.6, browMat: iron });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.45, 0.55, 0.05], [s * 0.88, 0.72, 0.1], [s * 0.95, 1.08, 0.25]], 0.11, 7), bone);
    m.add(G.cone(0.11, 0.26, 7), bone, { p: [s * 0.95, 1.2, 0.29], r: [0.3, 0, 0] });
    bootLeg(m, s, { x: 0.36, hip: -0.6, len: 0.2, r: 0.16, sock: crust, boot: iron, amp: 0.45, bootL: 0.5 });
  }
  flame(m, proto, { p: [0, 0.72, -0.1], rad: 0.34, h: 0.95 });
  flame(m, proto, { p: [-0.42, 0.55, -0.3], rad: 0.2, h: 0.6 });
  flame(m, proto, { p: [0.42, 0.55, -0.3], rad: 0.2, h: 0.6 });
}

function scFlyingFire(m, proto, c) {
  // A meteor of a volley: white-hot panels, wings of flame, a comet tail.
  const hot = P(0xe03a0c, { gloss: 0.5, glow: 0.45 });
  const white = M.glow(0xffd34d);
  football(m, { r: 0.64, y: 0, base: hot, patch: white, cap: 0.34 });
  eyes(m, { x: 0.24, y: 0.16, z: 0.52, r: 0.21, white: 0xdff6ff, socket: M.matte(0x2a0f08), brow: 0.6, browMat: M.matte(0x2a0f08) });
  wings(m, proto, M.glow(0xff7a14), FLAME_WING, { x: 0.45, y: 0.1, z: 0 });
  flame(m, proto, { p: [0, 0, -0.5], r: [-HALF, 0, 0], rad: 0.34, h: 1.15 });
  flame(m, proto, { p: [-0.3, 0.1, -0.45], r: [-HALF, 0, 0.3], rad: 0.18, h: 0.7 });
  flame(m, proto, { p: [0.3, 0.1, -0.45], r: [-HALF, 0, -0.3], rad: 0.18, h: 0.7 });
}

function scBossBall(m, proto, c) {
  // The match ball of the final: gold panels, a crown, keeper's gloves the size of doors.
  const white = P(0xf7f4ea, { gloss: 0.7, glow: 0.12 });
  const gold = MT(0xffc531, { rough: 0.22 });
  gold.emissive = new THREE.Color(0x7a4a00);
  gold.emissiveIntensity = 0.5;
  const dark = M.matte(0x16181d);
  const red = P(0xc40f24, { gloss: 0.6, glow: 0.12 });
  football(m, { r: 0.88, y: 0.02, base: white, patch: gold, cap: 0.4 });
  eyes(m, { x: 0.3, y: 0.24, z: 0.72, r: 0.22, white: 0xff3b1f, pupil: 0xfff2b0, socket: M.glow(0x16181d), brow: 0.55, browMat: dark });
  m.add(G.plate([[-0.42, 0.08], [-0.28, -0.02], [-0.14, 0.08], [0, -0.02], [0.14, 0.08], [0.28, -0.02], [0.42, 0.08], [0.34, -0.14], [-0.34, -0.14]], 0.08), M.glow(0x16181d), { p: [0, -0.26, 0.82], shadow: false });
  for (const x of [-0.21, -0.07, 0.07, 0.21]) m.add(G.cone(0.055, 0.14, 4), M.glow(0xffffff), { p: [x, -0.24, 0.87], r: [Math.PI, 0, 0], shadow: false });
  // Crown.
  m.add(G.sleeve(0.44, 0.38, 0.22, 18), gold, { p: [0, 0.93, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    m.add(G.cone(0.11, 0.34, 4), gold, { p: [Math.sin(a) * 0.42, 1.2, Math.cos(a) * 0.42] });
  }
  const gem = m.group({ p: [0, 0.96, 0.44] });
  gem.object.scale.setScalar(m.scale);
  proto.crownGem = new THREE.Mesh(G.sphere(0.1, 8, 6), M.glow(0x2dd4ff));
  gem.object.add(proto.crownGem);
  m.add(G.torus(0.885, 0.07, 6, 28, Math.PI * 0.5), red, { p: [0, 0.02, 0], r: [0, 0.3, 0.6] });   // captain's armband
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.45, ph: s > 0 ? Math.PI : 0, base: -0.5 }, { p: [s * 0.74, 0.05, 0.3] });
    arm.add(G.capsule(0.12, 0.46, 7), white, { p: [s * 0.06, -0.46, 0] });
    arm.add(G.rbox(0.4, 0.44, 0.2, 0.08), red, { p: [s * 0.08, -0.62, 0.02] });                 // glove palm
    for (let i = 0; i < 4; i++) arm.add(G.capsule(0.055, 0.22, 5), P(0xffffff, { gloss: 0.5 }), { p: [s * 0.08 + (i - 1.5) * 0.095, -1.0, 0.02] });
    bootLeg(m, s, { x: 0.38, hip: -0.68, len: 0.14, r: 0.17, sock: red, boot: dark, amp: 0.45, bootL: 0.56 });
  }
}

// ── Space: the outpost's own machines, gone rogue ───────────────────────────

/** A jointed robot leg: thigh out and down to a foot pad. Swings at the hip. */
function botLeg(m, { x, z, mat, foot, ph, amp = 0.5, r = 0.07, reach = 0.5, hip = -0.2 }) {
  const s = Math.sign(x) || 1;
  const g = part(m, { k: 'swing', ax: 'x', amp, ph }, { p: [x, hip, z] });
  const footY = -1 - hip + r * 1.1;
  g.add(G.tube([[0, 0, 0], [s * reach * 0.7, 0.22, 0], [s * reach, footY, 0]], r, 6), mat);
  g.add(G.sphere(r * 1.9, 8, 6), foot || mat, { p: [s * reach, footY, 0.02], s: [1.1, 0.6, 1.5] });
  return g;
}

function spDrone(m, proto, c) {
  // A maintenance crawler: one big eye, four quick legs, an aerial.
  const shell = P(0xe9fbff, { gloss: 0.8, glow: 0.15 });
  const teal = P(0x0fb5d6, { gloss: 0.7, glow: 0.25 });
  const dark = M.matte(0x101827);
  m.add(G.sphere(0.6, 18, 12), shell, { p: [0, 0, 0], s: [1, 0.72, 1.08] });
  m.add(G.dome(0.42, 14), teal, { p: [0, 0.22, -0.08], s: [1, 0.7, 1] });
  m.add(G.torus(0.6, 0.06, 6, 22), teal, { p: [0, -0.05, 0], r: [HALF, 0, 0], s: [1, 1.08, 1] });
  m.add(G.cyl(0.3, 0.33, 0.12, 16), dark, { p: [0, 0.06, 0.55], r: [HALF, 0, 0] });
  m.add(G.sphere(0.24, 12, 10), M.glow(c.color), { p: [0, 0.06, 0.6], s: [1, 1, 0.5], shadow: false });
  m.add(G.sphere(0.1, 8, 6), M.glow(0xffffff), { p: [0.04, 0.1, 0.71], s: [1, 1, 0.5], shadow: false });
  m.add(G.cyl(0.02, 0.02, 0.5, 5), dark, { p: [0.2, 0.62, -0.2] });
  const tip = part(m, { k: 'pulse', f: 9, amp: 0.4 }, { p: [0.2, 0.9, -0.2] });
  tip.add(G.sphere(0.08, 8, 6), M.glow(0xff5ca8), { shadow: false });
  let i = 0;
  for (const z of [0.3, -0.3]) for (const s of [-1, 1]) botLeg(m, { x: s * 0.42, z, mat: dark, foot: teal, ph: (i++ % 3 === 0) ? 0 : Math.PI, amp: 0.7, reach: 0.42, hip: -0.15 });
}

function spFireDrone(m, proto, c) {
  // A welder that will not switch off: twin stacks venting flame, hot grille.
  const shell = P(0xd9361a, { gloss: 0.7, glow: 0.3 });
  const dark = M.matte(0x1c1420);
  const hot = M.glow(0xffb02e);
  m.add(G.rbox(0.95, 0.7, 1.0, 0.2), shell, { p: [0, 0.02, 0] });
  m.add(G.rbox(0.7, 0.3, 0.1, 0.04), dark, { p: [0, 0.14, 0.5] });                              // visor
  m.add(G.rbox(0.5, 0.1, 0.06, 0.02), hot, { p: [0, 0.14, 0.54], shadow: false });               // one angry slit
  for (let i = 0; i < 3; i++) m.add(G.box(0.5, 0.045, 0.04), hot, { p: [0, -0.1 - i * 0.09, 0.51], shadow: false });   // grille
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.14, 0.17, 0.5, 10), dark, { p: [s * 0.26, 0.55, -0.26] });                      // stacks
    m.add(G.torus(0.15, 0.04, 5, 12), MT(0xd7dde5), { p: [s * 0.26, 0.8, -0.26], r: [HALF, 0, 0] });
    flame(m, proto, { p: [s * 0.26, 0.78, -0.26], rad: 0.16, h: 0.7, color: 0xff7a3a });
    botLeg(m, { x: s * 0.4, z: 0, mat: dark, foot: shell, ph: s > 0 ? 0 : Math.PI, amp: 0.7, r: 0.09, reach: 0.22, hip: -0.3 });
    m.add(G.rbox(0.14, 0.4, 0.5, 0.05), dark, { p: [s * 0.5, 0.05, 0] });
  }
  m.add(G.sphere(0.2, 8, 6), M.energy(0xff7a3a, 0.5), { p: [0, 0.45, -0.26], s: [2, 0.5, 1], shadow: false });
}

function spFlyingDrone(m, proto, c) {
  // A quadcopter: four rotors, a camera eye slung underneath.
  const shell = P(0x18a6e0, { gloss: 0.75, glow: 0.22 });
  const dark = M.matte(0x111a2c);
  const white = P(0xf2fbff, { gloss: 0.6, glow: 0.15 });
  m.add(G.sphere(0.46, 16, 12), shell, { p: [0, 0, 0], s: [1, 0.62, 1.2] });
  m.add(G.rbox(0.36, 0.1, 0.5, 0.04), white, { p: [0, 0.27, -0.05] });
  m.add(G.sphere(0.22, 12, 10), dark, { p: [0, -0.2, 0.34] });
  m.add(G.sphere(0.14, 10, 8), M.glow(c.accent), { p: [0, -0.22, 0.5], s: [1, 1, 0.6], shadow: false });
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.2, -0.2, 0.2], [s * 0.34, -0.55, 0.3], [s * 0.34, -0.55, -0.3], [s * 0.2, -0.2, -0.2]], 0.035, 5), dark);
  const blur = M.glass(c.accent, 0.22);
  for (const [sx, sz2] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const x = sx * 0.72, z = sz2 * 0.66;
    m.add(G.tube([[sx * 0.2, 0.05, sz2 * 0.2], [x, 0.12, z]], 0.06, 6), dark);
    m.add(G.cyl(0.1, 0.12, 0.16, 10), white, { p: [x, 0.16, z] });
    m.add(G.cyl(0.44, 0.44, 0.012, 20), blur, { p: [x, 0.27, z], shadow: false });
    m.add(G.torus(0.45, 0.03, 5, 20), shell, { p: [x, 0.25, z], r: [HALF, 0, 0] });               // rotor guard
    const rotor = part(m, { k: 'spin', ax: 'y', sp: 30 * sx * sz2 }, { p: [x, 0.27, z] });
    rotor.add(G.rbox(0.84, 0.02, 0.1, 0.008), white);
  }
}

function spHeavyDrone(m, proto, c) {
  // A cargo hauler up-armoured into a tank: treads, slab plating, a dozer blade.
  const hull = P(0x343c4c, { gloss: 0.6, glow: 0.1 });
  const plate = P(0xf2b705, { gloss: 0.7, glow: 0.18 });
  const steel = MT(0xb9c2d6, { rough: 0.35 });
  const dark = M.matte(0x0f0a1f);
  m.add(G.rbox(1.1, 0.5, 1.6, 0.12), hull, { p: [0, -0.25, 0] });
  m.add(G.rbox(0.9, 0.2, 1.3, 0.08), plate, { p: [0, 0.08, -0.05] });
  m.add(G.rbox(0.36, 0.12, 0.5, 0.04), plate, { p: [0, 0.2, 0.62], r: [0.5, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.34, 0.5, 1.8, 0.16), dark, { p: [s * 0.72, -0.72, 0] });                        // tread
    m.add(G.rbox(0.4, 0.14, 1.6, 0.05), plate, { p: [s * 0.72, -0.42, 0] });                       // tread guard
    for (const z of [-0.6, 0, 0.6]) {
      const wheel = part(m, { k: 'roll', rad: 0.2 }, { p: [s * 0.9, -0.74, z] });
      wheel.add(G.cyl(0.2, 0.2, 0.05, 8), steel, { r: [0, 0, HALF] });
    }
  }
  // Turret: a low dome with a glowing sensor slit and a stubby gun.
  m.add(G.dome(0.5, 16), plate, { p: [0, 0.18, -0.12], s: [1, 0.75, 1] });
  m.add(G.rbox(0.5, 0.09, 0.08, 0.03), M.glow(c.accent), { p: [0, 0.32, 0.33], shadow: false });
  m.add(G.cyl(0.08, 0.08, 0.6, 8), steel, { p: [0, 0.3, 0.6], r: [HALF, 0, 0] });
  m.add(G.rbox(1.5, 0.42, 0.1, 0.04), steel, { p: [0, -0.6, 0.94], r: [-0.25, 0, 0] });            // dozer blade
  for (const x of [-0.5, 0, 0.5]) m.add(G.cone(0.07, 0.2, 5), steel, { p: [x, -0.76, 1.02], r: [HALF + 0.3, 0, 0] });
}

function spInfernoDrone(m, proto, c) {
  // A reactor on legs, running far past its limits.
  const hull = P(0x8f0f24, { gloss: 0.65, glow: 0.1 });
  const dark = M.matte(0x1a0f18);
  const steel = MT(0xb9c2d6, { rough: 0.35 });
  const hot = M.glow(0xffa01f);
  m.add(G.rbox(0.95, 0.8, 0.8, 0.2), hull, { p: [0, 0.05, 0] });
  m.add(G.cyl(0.3, 0.3, 0.1, 16), dark, { p: [0, 0.08, 0.4], r: [HALF, 0, 0] });
  const core = part(m, { k: 'pulse', f: 6, amp: 0.14 }, { p: [0, 0.08, 0.44] });
  core.add(G.sphere(0.23, 12, 10), hot, { s: [1, 1, 0.5], shadow: false });
  m.add(G.rbox(0.44, 0.24, 0.4, 0.08), dark, { p: [0, 0.58, 0.1] });                               // head
  m.add(G.rbox(0.34, 0.07, 0.06, 0.02), M.glow(0xffe27a), { p: [0, 0.6, 0.31], shadow: false });
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.36, 0.34, 0.6, 0.1), hull, { p: [s * 0.66, 0.34, 0] });                         // shoulder pods
    m.add(G.cone(0.1, 0.32, 5), steel, { p: [s * 0.86, 0.5, 0], r: [0, 0, -s * 1.0] });
    m.add(G.cyl(0.11, 0.13, 0.2, 10), dark, { p: [s * 0.62, 0.58, -0.14] });
    flame(m, proto, { p: [s * 0.62, 0.66, -0.14], rad: 0.17, h: 0.75, color: 0xff7a3a });
    m.add(G.cyl(0.11, 0.11, 0.6, 8), steel, { p: [s * 0.66, 0.2, 0.42], r: [HALF, 0, 0] });        // arm cannons
    m.add(G.cyl(0.07, 0.07, 0.03, 8), hot, { p: [s * 0.66, 0.2, 0.73], r: [HALF, 0, 0], shadow: false });
    const g = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.3, -0.34, 0] });
    g.add(G.rbox(0.26, 0.42, 0.3, 0.08), dark, { p: [0, -0.22, 0] });
    g.add(G.rbox(0.34, 0.2, 0.56, 0.07), hull, { p: [0, -0.54, 0.1] });
  }
}

function spFlyingFire(m, proto, c) {
  // An interceptor: dart fuselage, delta wing, twin afterburners.
  const hull = P(0xe0245e, { gloss: 0.75, glow: 0.25 });
  const dark = M.matte(0x1a0f2a);
  const cyan = M.glow(c.accent);
  m.add(G.capsule(0.26, 1.7, 12), hull, { p: [0, 0, -0.8], r: [HALF, 0, 0], s: [1, 1, 0.8] });
  m.add(G.cone(0.22, 0.5, 12), dark, { p: [0, 0, 1.05], r: [HALF, 0, 0], s: [1, 1, 0.8] });        // nose
  m.add(G.sphere(0.2, 12, 8), M.glass(c.accent, 0.75), { p: [0, 0.17, 0.4], s: [0.8, 0.7, 1.7] }); // canopy
  const wing = G.plate([[0, 0.5], [1.25, -0.55], [1.25, -0.8], [0.3, -0.7], [0, -0.8], [-0.3, -0.7], [-1.25, -0.8], [-1.25, -0.55]], 0.06);
  wing.rotateX(HALF);
  m.add(wing, dark, { p: [0, -0.02, 0] });
  for (const s of [-1, 1]) {
    m.add(G.box(0.05, 0.07, 0.5), cyan, { p: [s * 1.24, -0.02, -0.66], shadow: false });           // wingtip lights
    m.add(G.plate([[0, 0], [0.3, 0], [0.42, 0.4], [0.24, 0.4]], 0.04), hull, { p: [s * 0.3, 0.02, -0.5], r: [0, -HALF, s * 0.3] });   // tail fins
    m.add(G.cyl(0.15, 0.13, 0.4, 10), dark, { p: [s * 0.22, 0, -0.75], r: [HALF, 0, 0] });         // engines
    flame(m, proto, { p: [s * 0.22, 0, -0.92], r: [-HALF, 0, 0], rad: 0.14, h: 0.95, color: 0xff7a3a });
  }
}

function spBossDrone(m, proto, c) {
  // The station's defence core, walking: one vast eye, a halo of gold.
  const hull = P(0x161d2e, { gloss: 0.85, glow: 0.05 });
  const gold = MT(0xffc531, { rough: 0.22 });
  gold.emissive = new THREE.Color(0x7a4a00);
  gold.emissiveIntensity = 0.5;
  const dark = M.matte(0x0a0d16);
  m.add(G.sphere(0.8, 22, 16), hull, { p: [0, 0.05, 0] });
  m.add(G.torus(0.8, 0.06, 6, 30), gold, { p: [0, 0.05, 0], r: [0, HALF, 0] });                    // seam over the crown
  m.add(G.dome(0.82, 18), gold, { p: [0, 0.42, 0], s: [0.62, 0.55, 0.62] });
  // The eye.
  m.add(G.cyl(0.46, 0.5, 0.14, 22), gold, { p: [0, 0.05, 0.72], r: [HALF, 0, 0] });
  m.add(G.cyl(0.38, 0.38, 0.05, 22), dark, { p: [0, 0.05, 0.79], r: [HALF, 0, 0], shadow: false });
  const iris = m.group({ p: [0, 0.05, 0.81] });
  iris.object.scale.setScalar(m.scale);
  proto.crownGem = new THREE.Mesh(G.sphere(0.24, 12, 10).scale(1, 1, 0.4), M.glow(0xff3b1f));
  iris.object.add(proto.crownGem);
  m.add(G.sphere(0.09, 8, 6), M.glow(0xfff2b0), { p: [0, 0.05, 0.91], s: [1, 1, 0.5], shadow: false });
  m.add(G.rbox(1.0, 0.16, 0.2, 0.05), gold, { p: [0, 0.52, 0.7], r: [0.5, 0, 0] });                // brow plate
  // Sensor crown.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    m.add(G.cone(0.07, 0.42, 5), gold, { p: [Math.sin(a) * 0.32, 1.0, Math.cos(a) * 0.32], r: [Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3] });
  }
  const halo = part(m, { k: 'spin', ax: 'y', sp: 1.6 }, { p: [0, 0.05, 0], r: [0.3, 0, 0.12] });
  halo.add(G.torus(1.02, 0.045, 6, 40), gold, { r: [HALF, 0, 0] });
  for (let i = 0; i < 3; i++) halo.add(G.sphere(0.1, 8, 6), M.glow(0x67e8f9), { p: [Math.sin(i * TAU / 3) * 1.02, 0, Math.cos(i * TAU / 3) * 1.02], shadow: false });
  let i = 0;
  for (const z of [0.42, -0.42]) for (const s of [-1, 1]) {
    const g = botLeg(m, { x: s * 0.6, z, mat: dark, foot: gold, ph: (i++ % 3 === 0) ? 0 : Math.PI, amp: 0.4, r: 0.11, reach: 0.4, hip: -0.3 });
    g.add(G.sphere(0.17, 8, 6), gold, { p: [s * 0.28, 0.2, 0] });                                   // knee
  }
  for (const s of [-1, 1]) m.add(G.cyl(0.09, 0.09, 0.5, 8), dark, { p: [s * 0.78, -0.1, 0.4], r: [HALF, 0, 0] });
}

// ── Gaits ───────────────────────────────────────────────────────────────────
//
// How a body moves as a whole (rendering/enemy-anim.js):
//   step   stride frequency, in cycles' worth of phase per body radius travelled
//   bob    hop height per step       rock  side-to-side roll per step
//   lean   forward pitch when moving nod   pitch wobble per step
//   yaw    left-right wiggle per step squash stretch/squash per step
//   hover  idle float height (flyers) bank  roll into a turn

const GAIT = {
  run: { step: 2.6, bob: 0.1, rock: 0.07, lean: 0.14 },
  scuttle: { step: 3.4, bob: 0.03, yaw: 0.14, rock: 0.05, lean: 0.05 },
  waddle: { step: 2.4, bob: 0.06, rock: 0.16, lean: 0.08 },
  stomp: { step: 2.2, bob: 0.07, rock: 0.1, lean: 0.06, squash: 0.05 },
  trundle: { step: 5, bob: 0.015, rock: 0.02, nod: 0.02 },
  skate: { step: 1.5, bob: 0.03, rock: 0.2, yaw: 0.12, lean: 0.1, bank: 0.6 },
  wobble: { step: 2.6, bob: 0.07, rock: 0.24, lean: 0.05 },
  hover: { hover: 0.1, hoverF: 3.2, lean: 0.22, bank: 0.7, sway: 0.06 },
  soar: { hover: 0.12, hoverF: 2.2, lean: 0.12, bank: 0.8, sway: 0.1 },
  buzz: { hover: 0.06, hoverF: 9, lean: 0.25, bank: 0.6, sway: 0.05 }
};

const BUILTIN = {
  hockey: {
    e1: [hkPuck, GAIT.run], e2: [hkHotPuck, GAIT.run], e3: [hkFlyingPuck, GAIT.hover],
    e4: [hkHeavyPuck, GAIT.stomp], e5: [hkInfernoPuck, GAIT.stomp], e6: [hkFlyingFire, GAIT.soar],
    e7: [hkBossPuck, GAIT.stomp], e8: [hkSpeedSkater, GAIT.skate],
    e9: [hkDefenseman, { ...GAIT.skate, rock: 0.1, yaw: 0.06, step: 1.8 }], e10: [hkEnforcer, { ...GAIT.skate, rock: 0.14, step: 1.8 }]
  },
  soccer: {
    e1: [scBall, GAIT.run], e2: [scFireBall, GAIT.run], e3: [scFlyingBall, GAIT.soar],
    e4: [scHeavyBall, GAIT.stomp], e5: [scInfernoBall, GAIT.stomp], e6: [scFlyingFire, GAIT.soar], e7: [scBossBall, GAIT.stomp]
  },
  space: {
    e1: [spDrone, GAIT.scuttle], e2: [spFireDrone, GAIT.waddle], e3: [spFlyingDrone, GAIT.hover],
    e4: [spHeavyDrone, GAIT.trundle], e5: [spInfernoDrone, GAIT.stomp], e6: [spFlyingFire, { ...GAIT.soar, hover: 0.05, lean: 0.05 }], e7: [spBossDrone, GAIT.stomp]
  }
};

// Ids by role, for an enemy that arrives without a known id.
const ROLE_ID = { SWARM: 'e1', FIRE: 'e2', FLYING: 'e3', ARMORED: 'e4', ELITE: 'e5', FLYING_FIRE: 'e6', BOSS: 'e7', SPEEDSTER: 'e8', BRUISER: 'e10' };

// The kit themes model their own enemies; these say how each one carries itself.
const KIT_GAITS = {
  kitchen: { SWARM: GAIT.scuttle, FIRE: GAIT.scuttle, FLYING: GAIT.buzz, ARMORED: { ...GAIT.scuttle, step: 2.4 }, ELITE: GAIT.scuttle, FLYING_FIRE: GAIT.buzz, BOSS: { ...GAIT.scuttle, step: 1.8, bob: 0.06 } },
  golf: { SWARM: GAIT.waddle, FIRE: GAIT.waddle, FLYING: GAIT.soar, ARMORED: { ...GAIT.stomp, rock: 0.05 }, ELITE: GAIT.stomp, FLYING_FIRE: GAIT.soar, BOSS: GAIT.stomp },
  bowling: { SWARM: GAIT.wobble, FIRE: GAIT.wobble, FLYING: GAIT.soar, ARMORED: GAIT.stomp, ELITE: GAIT.wobble, FLYING_FIRE: GAIT.soar, BOSS: { ...GAIT.wobble, rock: 0.14, step: 2 } }
};

// ── Templates ───────────────────────────────────────────────────────────────

const templates = new Map();

const isMoving = o => !!(o.userData.anim || o.userData.ref);

/** Merge everything that does not move, per moving part and per material. */
function bake(group) {
  shareEquivalentMaterials(group);
  const pivots = [];
  group.traverse(o => { if (o !== group && isMoving(o)) pivots.push(o); });
  const all = new Set(pivots);
  group.updateMatrixWorld(true);
  bakeStaticMeshes(group, all);
  for (const p of pivots) {
    if (p.isMesh) continue;
    const others = new Set(pivots);
    others.delete(p);
    bakeStaticMeshes(p, others);
  }
  // Drop the holders the merge emptied.
  const prune = (o) => {
    for (let i = o.children.length - 1; i >= 0; i--) {
      const child = o.children[i];
      prune(child);
      if (!child.isMesh && !child.children.length && !isMoving(child)) o.remove(child);
    }
  };
  prune(group);
  group.traverse(o => {
    if (!o.isMesh) return;
    o.geometry.userData.shared = true;
    o.material.userData.shared = true;
  });
}

function buildTemplate(enemy, sz, theme, visual, kit) {
  const group = new THREE.Group();
  const role = (enemy.role || 'SWARM').toUpperCase();
  // The builders write wings/flames/crownGem onto the "enemy" they are given.
  const proto = { role: enemy.role, nm: enemy.nm, type: enemy.type, fire: enemy.fire, flying: enemy.flying, boss: enemy.boss, armor: enemy.armor, sz: enemy.sz };
  const known = new Set(Object.keys(proto));
  const ctx = { visual, color: visual?.color ?? 0x888888, accent: visual?.accent ?? visual?.color ?? 0xffffff };
  let gait;

  if (typeof kit?.buildEnemy === 'function') {
    kit.buildEnemy(group, proto, sz, ctx);
    gait = kit.enemyGaits?.[role] || KIT_GAITS[theme]?.[role];
  } else {
    const set = BUILTIN[theme] || BUILTIN.soccer;
    const entry = set[enemy.type] || set[ROLE_ID[role]] || set.e1;
    entry[0](modeller(group, sz), proto, ctx);
    gait = entry[1];
  }
  if (!gait) gait = enemy.flying ? GAIT.hover : GAIT.run;
  delete group.userData.animParts;

  // Tag what the builder handed back, so a clone can find its own copies.
  for (const [key, value] of Object.entries(proto)) {
    if (known.has(key)) continue;
    const list = Array.isArray(value) ? value : [value];
    list.forEach((o, i) => {
      if (!o || !o.isObject3D) return;
      o.userData.ref = key;
      o.userData.refIdx = Array.isArray(value) ? i : -1;
    });
  }

  bake(group);
  return { group, gait };
}

/** Identity of a body: two enemies with the same key look exactly alike. */
export function enemyBodyKey(enemy, sz, theme) {
  return [theme, enemy.type || enemy.nm || '', enemy.role || '', sz.toFixed(3), enemy.fire ? 1 : 0, enemy.flying ? 1 : 0, enemy.boss ? 1 : 0].join('|');
}

/**
 * A new body for an enemy: a clone of its type's template.
 *
 * @returns {{body: THREE.Group, gait: object, refs: object}} `refs` holds the
 *   clone's own animated parts — wings, flames, crownGem, and `rigParts`
 *   ([{o, a}] for enemy-anim.js) — ready to be copied onto the enemy.
 */
export function createEnemyBody(enemy, sz, theme, visual, kit) {
  const key = enemyBodyKey(enemy, sz, theme);
  let tpl = templates.get(key);
  if (!tpl) {
    tpl = buildTemplate(enemy, sz, theme, visual, kit);
    templates.set(key, tpl);
  }

  const body = tpl.group.clone(true);
  body.rotation.order = 'YXZ';
  const refs = { rigParts: [] };
  body.traverse(o => {
    const { anim, ref, refIdx } = o.userData;
    if (anim) refs.rigParts.push({ o, a: anim, base: o.rotation[anim.ax || 'x'] });
    if (ref) {
      if (refIdx >= 0) (refs[ref] = refs[ref] || [])[refIdx] = o;
      else refs[ref] = o;
    }
  });
  return { body, gait: tpl.gait, refs };
}
