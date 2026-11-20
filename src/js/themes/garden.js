// GARDEN GNOME UPRISING
//
// Defend the prize pumpkin. The arena is a back garden at night: tilled soil
// under the moon, clipped hedges, terracotta planters and strings of warm
// lights. The enemies are everything that eats a vegetable patch — slugs,
// caterpillars, pigeons, snails, moles, a crow and one enormous rabbit — and
// the towers are the gnomes and the garden kit fighting back.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from '../rendering/geo-utils.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'garden',
  name: 'Garden Gnome Uprising',
  shortName: 'Garden',
  icon: 'gnome',
  sortOrder: 80,
  description: 'Defend the prize pumpkin. Gnomes and garden kit versus everything that nibbles, burrows and pecks.',
  color: '#ffd24a',
  groundColor: 0xa9794e,
  pathColor: 0xd9b98a,
  envColor: 0x0a1228,
  environmentSkin: { arena: 'garden', floor: 'soil', markerIcon: '🎃' },
  enemySkin: { body: 'pest', icon: 'bug' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Pea-Shooter Gnome', icon: 'gnome', clr: '#f04438' },
    t2: { nm: 'Angler Gnome', icon: 'fishrod', clr: '#4d8dff' },
    t3: { nm: 'Seed-Bomb Pot', icon: 'seedbomb', clr: '#f062c0' },
    t4: { nm: 'Watering Can', icon: 'wateringcan', clr: '#2fc8f0' },
    t5: { nm: 'Welly Wallop', icon: 'welly', clr: '#52d273' },
    t6: { nm: 'Bug Zapper', icon: 'zapper', clr: '#a78bfa' },
    t7: { nm: 'Tiki Torch', icon: 'tiki', clr: '#ff7a1a' },
    t8: { nm: 'Gnome King', icon: 'crown', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Slug' },
    e2: { nm: 'Chilli Caterpillar' },
    e3: { nm: 'Angry Pigeon' },
    e4: { nm: 'Iron Snail' },
    e5: { nm: 'Miner Mole' },
    e6: { nm: 'Cinder Crow' },
    e7: { nm: 'Baron von Nibble' }
  },
  maps: [
    ['The Veg Patch', 'A simple run to the pumpkin - learn the basics'],
    ['Potting Shed', 'Open centre, two ways in'],
    ['Bean Rows', 'Tight lanes between the canes'],
    ['The Long Border', 'Long garden, heavy traffic'],
    ['Midnight Raid', 'They come from everywhere'],
    ['Garden Path', 'Narrow and fast'],
    ['Bonfire Night', 'Wide open and hot'],
    ['Compost Corner', 'Mixed pressure, little room'],
    ['Village Show', 'The big one'],
    ['Harvest Moon', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x0a1228,
    fog: 0x101a38,
    fogDensity: 0.006,
    floor: {
      base: '#7d5230',
      meshColor: 0xa89a8e,
      roughness: 0.9,
      metalness: 0.0,
      emissive: 0x2a1a0c,
      emissiveIntensity: 0.14
    },
    rail: { color: 0x2f6b34, roughness: 0.85, metalness: 0.02 },
    path: { color: 0xffe9bd, emissive: 0x7a5516, opacity: 0.3, edge: 0xffd24a },
    buildZone: { color: 0xfff3d6, opacity: 0.09, line: 0xffd24a },
    obstacle: { accent: 0xffb347 },
    base: { color: 0xffa62b, icon: 'DEFEND THE PUMPKIN' },
    spawn: { color: 0xff4d5e, icon: 'PESTS' }
  },
  // Moonlight from above, lantern light from the sides.
  lighting: {
    hemiSky: 0xc4d4ff,
    hemiGround: 0x5a3f26,
    hemiIntensity: 0.44,
    sun: 0xe2eaff,
    sunIntensity: 0.86,
    rim: 0xffb45a,
    rimIntensity: 0.36,
    accent: 0xffc56b,
    spotIntensity: 2.3,
    exposure: 0.72
  },
  ui: { accent: '#ffd24a', dark: '#0a1228' },
  crowd: { fans: [0xe5352b, 0x3b82f6, 0xf7f4ec, 0x4fa33f, 0xffd24a], seat: 0x4a3220 },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    ball: { mesh: 'ball', flight: 'tracer', trail: 'line', impact: 'spark', color: 0x9be04a, speed: 7.5, size: 0.6 },            // a pea
    curveBall: { mesh: 'tracer', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xdfeaff, speed: 13 },               // the cast hook
    headButt: { mesh: 'sphere', flight: 'lob', trail: 'dust', impact: 'ring', color: 0x7a4a26, speed: 8.5, size: 1.25 },        // a seed bomb
    tackle: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x8fe3ff, speed: 9.5 },                  // a jet of water
    glove: { mesh: 'block', flight: 'punch', trail: 'dust', impact: 'slam', color: 0x52d273, speed: 8.8, size: 1.2 },           // the boot
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xc9b6ff, speed: 15 },
    flare: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff6a14, speed: 11, size: 0.85 },
    legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case. Nothing soil-brown: the floor is soil.
  enemies: {
    swarm: { body: 'bug', color: 0xa8c414, accent: 0xe9e6a0 },
    fire: { body: 'bug', color: 0xe62e1f, accent: 0xffc23d },
    flying: { body: 'bug', color: 0x9fb2d6, accent: 0x7b5fc4 },
    armored: { body: 'bug', color: 0x2c86c9, accent: 0xffd23f },
    elite: { body: 'bug', color: 0x5a5682, accent: 0xffc928 },
    flying_fire: { body: 'bug', color: 0x23213a, accent: 0xff4a08 },
    boss: { body: 'bug', color: 0xf3ead9, accent: 0xffd23f }
  },
  towers: { family: 'garden', base: 0x4a3220, metal: 0xd7dde5, levelGlow: 0xffd24a }
};

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;
const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);
const IRON = () => M.matte(0x2a2d33);
const WOOD = () => M.paint(0x8a5a33, { gloss: 0.25 });
const TERRACOTTA = () => M.paint(0xc8643a, { gloss: 0.3 });
const LEAF = () => M.paint(0x4fa33f, { gloss: 0.45, glow: 0.08 });
const SKIN = () => M.paint(0xf2c29b, { gloss: 0.35, glow: 0.05 });
const BEARD = () => M.paint(0xf7f4ec, { gloss: 0.3, glow: 0.08 });

/** A part that throbs. 'pulse' overwrites scale, so it goes in its own group. */
function pulsing(m, p, geo, mat, offset = 0) {
  const g = m.group({ p });
  g.add(geo, mat, { shadow: false });
  m.anim(g.object, 'pulse', { offset });
  return g;
}

/** Where shots leave the figure, in model units (the engine wants turret-local units). */
function muzzle(m, x, y, z) {
  m.object.userData.muzzle = { x: x * m.scale, y: y * m.scale, z: z * m.scale };
}

/**
 * A garden gnome: boots, belted coat, round head, big nose, white beard and a
 * pointed hat. Stands on `y0`, `k` times life size (life size is 0.8 tall with
 * the default hat). Arms are left to the caller, who knows what he is holding.
 */
function gnome(m, { y0 = 0.12, k = 1, hat, coat, hatH = 0.3 }) {
  const P = (x, y, z) => [x * k, y0 + y * k, z * k];
  const skin = SKIN(), beard = BEARD(), boot = M.matte(0x2b1d14);
  for (const s of [-1, 1]) m.add(G.rbox(0.09 * k, 0.06 * k, 0.16 * k, 0.025 * k), boot, { p: P(s * 0.065, 0.03, 0.04) });
  m.add(G.lathe([[0.1, 0], [0.15, 0.03], [0.165, 0.14], [0.13, 0.27], [0.085, 0.32], [0, 0.33]].map(([r, h]) => [r * k, h * k]), 16), coat, { p: P(0, 0.05, 0) });
  m.add(G.torus(0.158 * k, 0.018 * k, 6, 20), boot, { p: P(0, 0.17, 0), r: [HALF_PI, 0, 0] });                 // belt
  m.add(G.rbox(0.055 * k, 0.05 * k, 0.02 * k, 0.008 * k), M.metal(0xffcc33, { rough: 0.3 }), { p: P(0, 0.17, 0.168) });
  m.add(G.sphere(0.105 * k, 16, 12), skin, { p: P(0, 0.43, 0.01) });
  m.add(G.sphere(0.038 * k, 10, 8), M.paint(0xe88f78, { gloss: 0.5 }), { p: P(0, 0.425, 0.118) });           // nose
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.015 * k, 8, 6), BLACK(), { p: P(s * 0.044, 0.458, 0.098) });
    m.add(G.sphere(0.03 * k, 8, 6), skin, { p: P(s * 0.105, 0.43, 0.0) });                                     // ears
  }
  m.add(G.cone(0.1 * k, 0.22 * k, 12), beard, { p: P(0, 0.32, 0.068), r: [Math.PI - 0.24, 0, 0] });           // beard
  m.add(G.sphere(0.07 * k, 10, 8), beard, { p: P(0, 0.392, 0.085), s: [1.35, 0.55, 0.8] });                   // moustache
  m.add(G.cone(0.125 * k, hatH * k, 14), hat, { p: P(0, 0.5 + hatH / 2, -0.015), r: [-0.1, 0, 0] });
  m.add(G.torus(0.108 * k, 0.022 * k, 6, 18), hat, { p: P(0, 0.5, 0), r: [HALF_PI, 0, 0] });
}

/** A sleeved arm from a shoulder to a hand, with the hand on the end. */
function arm(m, mat, points, r = 0.03) {
  m.add(G.tube(points, r, 6), mat);
  const end = points[points.length - 1];
  m.add(G.sphere(r * 1.25, 8, 6), SKIN(), { p: end });
}

function peaShooter(m, c) {
  // The classic red-hatted gnome, cheeks puffed, a cane pea-shooter at his lips.
  const hat = c.bodyMat || M.paint(c.color, { gloss: 0.7, glow: 0.2 });
  const coat = M.paint(0x3f6fb5, { gloss: 0.45 });
  m.add(G.lathe([[0.22, 0], [0.26, 0.02], [0.24, 0.045], [0, 0.05]], 14), M.paint(0x7c8a66, { gloss: 0.1 }), { p: [0, 0.12, 0] });   // mossy stone
  gnome(m, { y0: 0.16, k: 0.94, hat, coat });
  const mouthY = 0.535;
  const cane = M.paint(0xb7d65a, { gloss: 0.5, glow: 0.1 });
  m.add(G.cyl(0.026, 0.026, 0.27, 10), cane, { p: [0, mouthY, 0.215], r: [HALF_PI, 0, 0] });
  for (const z of [0.16, 0.25, 0.345]) m.add(G.torus(0.03, 0.009, 6, 12), M.paint(0x6f8f2f, { gloss: 0.4 }), { p: [0, mouthY, z] });
  for (const s of [-1, 1]) {
    arm(m, coat, [[s * 0.13, 0.43, 0], [s * 0.18, 0.47, 0.12], [s * 0.045, mouthY - 0.01, 0.2 + (s > 0 ? 0.06 : 0)]]);
    m.add(G.sphere(0.04, 8, 6), SKIN(), { p: [s * 0.075, 0.55, 0.085] });                                     // puffed cheeks
  }
  pulsing(m, [0, mouthY, 0.365], G.sphere(0.036, 10, 8), M.glow(0xb6f25a));                                    // the next pea
  // A basket of ammunition at his feet.
  m.add(G.lathe([[0.06, 0], [0.09, 0.02], [0.1, 0.09], [0.085, 0.09], [0, 0.05]], 12), WOOD(), { p: [0.19, 0.165, 0.1] });
  const pea = M.paint(0x8fd63f, { gloss: 0.7, glow: 0.25 });
  for (const [x, y, z] of [[0.17, 0.25, 0.1], [0.21, 0.25, 0.08], [0.19, 0.255, 0.13], [0.19, 0.285, 0.1]]) m.add(G.sphere(0.028, 8, 6), pea, { p: [x, y, z] });
  const bell = m.group({ p: [0, 0.905, -0.045] });
  bell.add(G.sphere(0.026, 8, 6), M.metal(0xffcc33, { rough: 0.3 }));                                          // bell on the hat
  m.anim(bell.object, 'bob');
  muzzle(m, 0, mouthY, 0.37);
}

function angler(m, c) {
  // The fishing gnome on his toadstool: a long cane rod, and a very sharp hook.
  const hat = c.bodyMat || M.paint(c.color, { gloss: 0.7, glow: 0.2 });
  const coat = M.paint(0x4c9a52, { gloss: 0.45 });
  const cream = M.paint(0xf1e7d0, { gloss: 0.3 });
  m.add(G.lathe([[0.1, 0], [0.11, 0.02], [0.07, 0.1], [0.08, 0.16]], 12), cream, { p: [0, 0.12, -0.04] });                     // stalk
  m.add(G.lathe([[0, 0], [0.2, 0], [0.25, 0.025], [0.22, 0.08], [0.11, 0.125], [0, 0.135]], 18), M.paint(0xb8743c, { gloss: 0.45 }), { p: [0, 0.27, -0.04] });
  for (const [x, z, r] of [[0.13, 0.08, 0.035], [-0.15, 0.02, 0.03], [-0.05, -0.2, 0.035], [0.14, -0.14, 0.028], [-0.03, 0.14, 0.025]]) {
    m.add(G.sphere(r, 8, 6), cream, { p: [x, 0.345 - Math.hypot(x, z + 0.04) * 0.12, z - 0.04], s: [1, 0.45, 1] });            // spots
  }
  gnome(m, { y0: 0.33, k: 0.74, hat, coat, hatH: 0.3 });
  // Legs dangling over the edge.
  const boot = M.matte(0x2b1d14);
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.055, 0.4, 0.08], [s * 0.06, 0.39, 0.19], [s * 0.06, 0.31, 0.215]], 0.032, 6), M.paint(0x3b4a6b, { gloss: 0.3 }));
    m.add(G.rbox(0.065, 0.05, 0.11, 0.02), boot, { p: [s * 0.06, 0.285, 0.235] });
  }
  // Rod, reel, line and float.
  const tip = [0.02, 0.83, 0.36];
  m.add(G.tube([[0.1, 0.46, 0.08], [0.1, 0.62, 0.17], [0.07, 0.8, 0.27], tip], 0.011, 6), M.paint(0xd9b45a, { gloss: 0.5 }));
  m.add(G.cyl(0.02, 0.02, 0.12, 8), BLACK(), { p: [0.1, 0.5, 0.1], r: [0.5, 0, 0] });                                          // grip
  m.add(G.cyl(0.03, 0.03, 0.03, 10), CHROME(), { p: [0.125, 0.53, 0.12], r: [0, 0, HALF_PI] });                                // reel
  arm(m, coat, [[0.1, 0.63, 0], [0.15, 0.56, 0.08], [0.1, 0.52, 0.11]], 0.024);
  arm(m, coat, [[-0.1, 0.63, 0], [-0.1, 0.52, 0.1], [0.07, 0.47, 0.085]], 0.024);
  m.add(G.cyl(0.004, 0.004, 0.25, 4), M.glow(0xeaf2ff), { p: [tip[0], tip[1] - 0.125, tip[2]], shadow: false });               // line
  const float = m.group({ p: [tip[0], 0.55, tip[2]] });
  float.add(G.sphere(0.04, 10, 8), M.paint(0xf4f6f8, { gloss: 0.7, glow: 0.15 }), { p: [0, -0.012, 0] });
  float.add(G.dome(0.042, 10), M.paint(0xff3b3b, { gloss: 0.7, glow: 0.35 }), { p: [0, -0.01, 0] });
  float.add(G.cyl(0.006, 0.006, 0.07, 5), BLACK(), { p: [0, 0.055, 0] });
  float.add(G.torus(0.028, 0.008, 5, 10, Math.PI), CHROME(), { p: [0.0, -0.075, 0], r: [0, 0, Math.PI] });                      // hook
  m.anim(float.object, 'bob');
  muzzle(m, tip[0], 0.52, tip[2]);
}

function seedBombPot(m, c) {
  // A glazed flowerpot slung in a timber cradle like a mortar, a seed bomb in
  // its mouth and more stacked behind.
  const glaze = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.14 });
  const wood = WOOD();
  const tilt = 0.8;
  m.add(G.rbox(0.44, 0.045, 0.52, 0.015), wood, { p: [0, 0.143, 0] });
  for (const s of [-1, 1]) {
    m.add(G.plate([[-0.2, 0], [0.2, 0], [0.07, 0.3], [-0.07, 0.3]], 0.04), wood, { p: [s * 0.215, 0.165, 0.0], r: [0, HALF_PI, 0] });   // cheeks
    m.add(G.cyl(0.035, 0.035, 0.02, 10), IRON(), { p: [s * 0.24, 0.41, 0], r: [0, 0, HALF_PI] });
  }
  m.add(G.cyl(0.018, 0.018, 0.5, 8), IRON(), { p: [0, 0.41, 0], r: [0, 0, HALF_PI] });                                         // trunnion
  const pot = m.group({ p: [0, 0.41, 0], r: [tilt, 0, 0] });
  pot.add(G.lathe([[0, -0.15], [0.09, -0.15], [0.105, -0.13], [0.165, 0.13], [0.2, 0.13], [0.2, 0.2], [0.168, 0.2], [0.15, 0.13], [0.08, -0.09], [0, -0.09]], 20), glaze);
  pot.add(G.torus(0.134, 0.014, 6, 20), M.paint(0xfff6e0, { gloss: 0.6, glow: 0.1 }), { p: [0, 0.0, 0], r: [HALF_PI, 0, 0] });
  pot.add(G.cyl(0.155, 0.155, 0.012, 16), M.matte(0x2a1c12), { p: [0, 0.12, 0] });                                             // soil
  // The bomb: a ball of clay and seed with a shoot already coming up.
  const bomb = pot.group({ p: [0, 0.22, 0] });
  const clay = M.paint(0x6b4426, { gloss: 0.2 });
  const seed = M.paint(0xf0dca0, { gloss: 0.4, glow: 0.1 });
  bomb.add(G.sphere(0.115, 14, 10), clay);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, e = 0.25 + (i % 3) * 0.45;
    bomb.add(G.sphere(0.022, 6, 5), seed, { p: [Math.cos(a) * Math.cos(e) * 0.112, Math.sin(e) * 0.112, Math.sin(a) * Math.cos(e) * 0.112] });
  }
  bomb.add(G.tube([[0, 0.1, 0], [0.01, 0.16, 0.0], [0, 0.2, -0.02]], 0.012, 5), LEAF());
  for (const s of [-1, 1]) bomb.add(G.sphere(0.04, 8, 6), LEAF(), { p: [s * 0.04, 0.21, -0.02], s: [1.1, 0.35, 0.7] });
  m.anim(bomb.object, 'bob');
  // Spares on the cradle.
  for (const [x, z] of [[-0.11, -0.19], [0.11, -0.19], [0, -0.13]]) m.add(G.sphere(0.06, 10, 8), clay, { p: [x, 0.215, z] });
  m.add(G.sphere(0.06, 10, 8), clay, { p: [0, 0.3, -0.17] });
  muzzle(m, 0, 0.41 + Math.cos(tilt) * 0.28, Math.sin(tilt) * 0.28);
}

function wateringCan(m, c) {
  // Tipped up on an upturned pot and pouring: whatever it soaks slows down.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.14 });
  const dark = M.paint(0x157a9c, { gloss: 0.7 });
  m.add(G.lathe([[0.21, 0], [0.22, 0.035], [0.2, 0.05], [0.15, 0.17], [0, 0.17]], 16), TERRACOTTA(), { p: [0, 0.12, -0.03] });
  const tilt = 0.32;
  const can = m.group({ p: [0, 0.3, -0.05], r: [tilt, 0, 0] });
  can.add(G.lathe([[0, 0], [0.16, 0], [0.175, 0.02], [0.175, 0.31], [0.16, 0.33], [0, 0.33]], 20), body);
  for (const y of [0.05, 0.28]) can.add(G.torus(0.177, 0.012, 6, 22), dark, { p: [0, y, 0], r: [HALF_PI, 0, 0] });
  can.add(G.lathe([[0.176, 0], [0.176, 0.06], [0.15, 0.1]], 20), dark, { p: [0, 0.33, 0] });                                   // collar
  can.add(G.tube([[0, 0.3, -0.16], [0, 0.34, -0.3], [0, 0.14, -0.33], [0, 0.05, -0.17]], 0.02, 7), dark);                      // back handle
  can.add(G.tube([[0, 0.38, -0.13], [0, 0.5, -0.02], [0, 0.4, 0.12]], 0.018, 7), dark);                                        // carry handle
  // Spout and rose.
  const end = [0, 0.38, 0.33];
  can.add(G.tube([[0, 0.05, 0.14], [0, 0.2, 0.24], end], 0.032, 8), body);
  can.add(G.tube([[0, 0.3, 0.17], [0, 0.31, 0.24]], 0.012, 5), dark);                                                           // brace
  const rose = can.group({ p: end, r: [0.85, 0, 0] });
  rose.add(G.lathe([[0.034, -0.02], [0.04, 0], [0.085, 0.07], [0.085, 0.085], [0, 0.09]], 14), dark);
  for (let i = 0; i < 6; i++) rose.add(G.sphere(0.012, 6, 5), M.glow(0xeafcff), { p: [Math.cos(i * 1.05) * 0.05, 0.092, Math.sin(i * 1.05) * 0.05], shadow: false });
  // A daisy painted on the side.
  can.add(G.star(0.07, 0.035, 0.012, 8), M.paint(0xffffff, { gloss: 0.4, glow: 0.2 }), { p: [0, 0.17, 0.176] });
  can.add(G.sphere(0.024, 8, 6), M.paint(0xffd21a, { glow: 0.3 }), { p: [0, 0.17, 0.184], s: [1, 1, 0.5] });
  // The pour: drops falling from the rose.
  const water = M.energy(0xbff4ff, 0.8);
  const mz = [0, 0.3 + 0.44 * Math.cos(tilt) - 0.4 * Math.sin(tilt), -0.05 + 0.44 * Math.sin(tilt) + 0.4 * Math.cos(tilt)];
  [[0, -0.02, 0.02, 0.03], [0.035, -0.09, 0.05, 0.024], [-0.03, -0.15, 0.07, 0.028], [0.01, -0.22, 0.085, 0.022]].forEach(([x, y, z, r], i) => {
    pulsing(m, [mz[0] + x, mz[1] + y, mz[2] + z], G.sphere(r, 8, 6), water, i * 1.6);
  });
  muzzle(m, mz[0], mz[1], mz[2]);
}

function wellyWallop(m, c) {
  // One green wellington on a very large spring. It only knows one move.
  const rubber = c.bodyMat || M.paint(c.color, { gloss: 0.8, glow: 0.14 });
  const sole = M.matte(0x1d2a20);
  m.add(G.rbox(0.4, 0.045, 0.5, 0.015), WOOD(), { p: [0, 0.143, 0.02] });
  m.add(G.cyl(0.14, 0.15, 0.03, 16), IRON(), { p: [0, 0.18, -0.04] });
  const steel = CHROME();
  for (let i = 0; i < 4; i++) {
    m.add(G.torus(0.11, 0.02, 6, 20), steel, { p: [0, 0.215 + i * 0.047, -0.04], r: [HALF_PI + (i % 2 ? 0.16 : -0.16), 0, 0] });
  }
  const boot = m.group({ p: [0, 0.4, -0.04] });
  boot.add(G.cyl(0.13, 0.13, 0.02, 14), IRON(), { p: [0, -0.01, 0] });
  boot.add(G.rbox(0.21, 0.04, 0.44, 0.018), sole, { p: [0, 0.02, 0.1] });
  for (const z of [-0.06, 0.06, 0.18, 0.28]) boot.add(G.box(0.2, 0.02, 0.05), sole, { p: [0, -0.008, z] });                    // tread
  boot.add(G.rbox(0.19, 0.13, 0.3, 0.06), rubber, { p: [0, 0.1, 0.12] });                                                       // foot
  boot.add(G.sphere(0.105, 14, 10), rubber, { p: [0, 0.105, 0.26], s: [0.93, 0.72, 1] });                                       // toe
  boot.add(G.lathe([[0.098, 0], [0.1, 0.18], [0.112, 0.37], [0.124, 0.4], [0.124, 0.42], [0.1, 0.42]], 16), rubber, { p: [0, 0.06, -0.04] });
  boot.add(G.torus(0.118, 0.016, 6, 20), M.paint(0xf7f4ec, { gloss: 0.5, glow: 0.1 }), { p: [0, 0.42, -0.04], r: [HALF_PI, 0, 0] });   // cuff
  boot.add(G.cyl(0.098, 0.098, 0.01, 14), BLACK(), { p: [0, 0.476, -0.04] });
  boot.add(G.torus(0.035, 0.01, 5, 10, Math.PI), sole, { p: [0, 0.46, -0.165], r: [0, HALF_PI, 0] });                           // pull loop
  boot.add(G.star(0.05, 0.022, 0.012), M.paint(0xffe14d, { gloss: 0.6, glow: 0.4 }), { p: [0.1, 0.3, 0.0], r: [0, HALF_PI, 0] });
  boot.add(G.star(0.05, 0.022, 0.012), M.paint(0xffe14d, { gloss: 0.6, glow: 0.4 }), { p: [-0.1, 0.3, 0.0], r: [0, -HALF_PI, 0] });
  m.anim(boot.object, 'bob');
  muzzle(m, 0, 0.5, 0.33);
}

function bugZapper(m, c) {
  // A lantern on a stake, humming violet. Moths cannot help themselves.
  const cap = c.bodyMat || M.paint(c.color, { gloss: 0.8, glow: 0.2 });
  const iron = IRON();
  m.add(G.lathe([[0.19, 0], [0.21, 0.025], [0.1, 0.06], [0.04, 0.09], [0.032, 0.28], [0.06, 0.31]], 14), iron, { p: [0, 0.12, 0] });
  m.add(G.lathe([[0.06, 0], [0.16, 0.02], [0.18, 0.05], [0.16, 0.06], [0, 0.06]], 16), cap, { p: [0, 0.42, 0] });               // tray
  m.add(G.lathe([[0.2, 0], [0.2, 0.025], [0.12, 0.09], [0.05, 0.12], [0, 0.125]], 16), cap, { p: [0, 0.73, 0] });                // roof
  m.add(G.torus(0.04, 0.011, 6, 14), iron, { p: [0, 0.88, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    m.add(G.cyl(0.006, 0.006, 0.26, 4), iron, { p: [Math.sin(a) * 0.155, 0.605, Math.cos(a) * 0.155] });
  }
  for (const y of [0.53, 0.68]) m.add(G.torus(0.155, 0.008, 5, 20), iron, { p: [0, y, 0], r: [HALF_PI, 0, 0] });
  // The tubes, and the glow round them.
  const tube = M.glow(0xe6dbff);
  for (const x of [-0.045, 0.045]) m.add(G.cyl(0.028, 0.028, 0.24, 8), tube, { p: [x, 0.605, 0], shadow: false });
  pulsing(m, [0, 0.605, 0], G.sphere(0.13, 12, 10), M.energy(c.color, 0.5));
  const spark = M.energy(0xffffff, 0.7);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    const pts = [0, 1, 2, 3].map(k => [Math.sin(a) * (0.05 + k * 0.035), 0.56 + k * 0.035 + (k % 2 ? 0.03 : -0.02) + i * 0.02, Math.cos(a) * (0.05 + k * 0.035)]);
    m.anim(m.add(G.tube(pts, 0.007, 4), spark, { shadow: false }), 'blink');
  }
  // Moths circling the light.
  const moths = m.group({ p: [0, 0.62, 0] });
  const wing = M.paint(0xf1e7d0, { gloss: 0.2, glow: 0.3 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU, y = (i - 1) * 0.07;
    moths.add(G.sphere(0.014, 6, 5), BLACK(), { p: [Math.cos(a) * 0.25, y, Math.sin(a) * 0.25] });
    moths.add(G.plate([[-0.04, 0.03], [0, 0], [0.04, 0.03], [0.03, -0.02], [0, 0], [-0.03, -0.02]], 0.006), wing, { p: [Math.cos(a) * 0.25, y, Math.sin(a) * 0.25], r: [0.6, -a, 0], shadow: false });
  }
  m.anim(moths.object, 'spin', { speed: 0.9 });
  muzzle(m, 0, 0.62, 0.16);
}

function tikiTorch(m, c) {
  // A carved totem with a bowl of fire for a hat and a grass skirt.
  const wood = M.paint(0x8a5530, { gloss: 0.3 });
  const paint = c.bodyMat || M.paint(c.color, { gloss: 0.6, glow: 0.3 });
  const straw = M.paint(0xd9b45a, { gloss: 0.25 });
  m.add(G.lathe([[0.13, 0], [0.145, 0.02], [0.125, 0.3], [0.13, 0.42], [0.17, 0.48], [0.215, 0.55], [0.215, 0.6], [0.17, 0.6], [0.14, 0.55], [0, 0.54]], 14), wood, { p: [0, 0.12, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + 0.3;
    m.add(G.cone(0.05, 0.19, 5), straw, { p: [Math.sin(a) * 0.17, 0.2, Math.cos(a) * 0.17], r: [Math.cos(a) * 0.55 + Math.PI, 0, -Math.sin(a) * 0.55] });
  }
  m.add(G.torus(0.14, 0.02, 6, 16), straw, { p: [0, 0.29, 0], r: [HALF_PI, 0, 0] });
  // The face.
  const lit = M.glow(0xffc04a);
  m.add(G.rbox(0.2, 0.035, 0.05, 0.012), paint, { p: [0, 0.535, 0.118], r: [0.05, 0, 0] });                                     // brow
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.06, 0.035, 0.03, 0.01), lit, { p: [s * 0.055, 0.49, 0.118], r: [0, 0, -s * 0.35], shadow: false });           // eyes
    m.add(G.rbox(0.035, 0.1, 0.03, 0.01), paint, { p: [s * 0.1, 0.42, 0.085], r: [0, s * 0.7, 0] });                             // cheek marks
  }
  m.add(G.plate([[-0.03, 0], [0.03, 0], [0.012, 0.1], [-0.012, 0.1]], 0.05), wood, { p: [0, 0.39, 0.135] });                      // nose
  m.add(G.rbox(0.15, 0.065, 0.03, 0.012), BLACK(), { p: [0, 0.345, 0.118] });                                                    // mouth
  for (const x of [-0.045, -0.015, 0.015, 0.045]) m.add(G.box(0.022, 0.03, 0.02), M.paint(0xfffbe6, { glow: 0.15 }), { p: [x, 0.36, 0.128] });
  m.add(G.torus(0.2, 0.024, 6, 20), paint, { p: [0, 0.72, 0], r: [HALF_PI, 0, 0] });                                             // bowl rim
  m.add(G.cyl(0.165, 0.165, 0.012, 14), M.glow(0xffb03a), { p: [0, 0.7, 0], shadow: false });                                    // oil
  const fire = m.group({ p: [0, 0.7, 0] });
  fire.add(G.cone(0.12, 0.22, 9), M.glow(0xff7a1a, 0.92), { p: [0, 0.11, 0], shadow: false });
  fire.add(G.cone(0.065, 0.15, 7), M.glow(0xffe07a), { p: [0, 0.075, 0], shadow: false });
  m.anim(fire.object, 'flame');
  muzzle(m, 0, 0.78, 0.12);
}

function gnomeKing(m, c) {
  // His Majesty, enthroned, with the golden fork of office.
  const robe = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.2 });
  const gold = M.metal(0xffcc33, { rough: 0.25 });
  const velvet = M.paint(0xc2202e, { gloss: 0.4, glow: 0.12 });
  const ermine = BEARD();
  const wood = M.paint(0x6b4426, { gloss: 0.35 });
  // Throne.
  m.add(G.rbox(0.44, 0.1, 0.4, 0.03), wood, { p: [0, 0.17, -0.02] });
  m.add(G.rbox(0.4, 0.58, 0.06, 0.03), wood, { p: [0, 0.45, -0.22] });
  m.add(G.rbox(0.3, 0.4, 0.02, 0.01), velvet, { p: [0, 0.48, -0.188] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.04, 10, 8), gold, { p: [s * 0.18, 0.77, -0.22] });
    m.add(G.rbox(0.05, 0.14, 0.3, 0.02), wood, { p: [s * 0.215, 0.29, -0.05] });                                                 // arm rests
    m.add(G.sphere(0.035, 8, 6), gold, { p: [s * 0.215, 0.37, 0.09] });
  }
  // The king: a wide robe with an ermine hem, then the usual gnome on top.
  m.add(G.lathe([[0.25, 0], [0.26, 0.03], [0.2, 0.2], [0.12, 0.32]], 16), robe, { p: [0, 0.2, 0.02] });
  m.add(G.torus(0.255, 0.03, 6, 22), ermine, { p: [0, 0.22, 0.02], r: [HALF_PI, 0, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU + 0.2;
    m.add(G.sphere(0.012, 5, 4), BLACK(), { p: [Math.sin(a) * 0.28, 0.225, 0.02 + Math.cos(a) * 0.28] });
  }
  gnome(m, { y0: 0.2, k: 1, hat: velvet, coat: robe, hatH: 0.15 });
  // Crown round the cap.
  m.add(G.sleeve(0.118, 0.11, 0.055, 16), gold, { p: [0, 0.725, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    m.add(G.cone(0.028, 0.075, 4), gold, { p: [Math.sin(a) * 0.114, 0.785, Math.cos(a) * 0.114] });
    m.add(G.sphere(0.014, 6, 5), M.glow(i % 2 ? 0x4dd2ff : 0xff3b5c), { p: [Math.sin(a + 0.52) * 0.118, 0.725, Math.cos(a + 0.52) * 0.118], shadow: false });
  }
  m.add(G.sphere(0.03, 8, 6), gold, { p: [0, 0.875, -0.03] });
  // The fork, held out like a sceptre.
  const lean = 0.55, hx = 0.215, hy = 0.44, hz = 0.16;
  const fork = m.group({ p: [hx, hy, hz], r: [lean, 0, 0] });
  fork.add(G.cyl(0.014, 0.014, 0.4, 6), wood, { p: [0, 0.0, 0] });
  fork.add(G.rbox(0.06, 0.02, 0.025, 0.008), wood, { p: [0, -0.2, 0] });                                                         // D-grip
  fork.add(G.box(0.13, 0.02, 0.02), gold, { p: [0, 0.2, 0] });
  for (const x of [-0.055, 0, 0.055]) fork.add(G.cone(0.012, 0.13, 5), gold, { p: [x, 0.27, 0] });
  arm(m, robe, [[0.14, 0.52, 0.02], [0.23, 0.44, 0.08], [hx, hy, hz]], 0.034);
  arm(m, robe, [[-0.14, 0.52, 0.02], [-0.22, 0.42, 0.06], [-0.215, 0.38, 0.1]], 0.034);
  const tip = [hx, hy + Math.cos(lean) * 0.34, hz + Math.sin(lean) * 0.34];
  pulsing(m, tip, G.star(0.05, 0.022, 0.012), M.glow(0xfff3a0));
  muzzle(m, tip[0], tip[1], tip[2]);
}

const TOWERS = [peaShooter, angler, seedBombPot, wateringCan, wellyWallop, bugZapper, tikiTorch, gnomeKing];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, faces +Z, and touches the ground at about y = -0.95.

/** A sub-assembly that moves; `anim` is plain data read by rendering/enemy-anim.js. */
function part(m, anim, opts) {
  const g = m.group(opts);
  g.object.userData.anim = anim;
  return g;
}

function eyes(m, { x = 0.2, y = 0.12, z = 0.9, r = 0.12, color = 0xffffff, pupil = 0x000000, brow = 0, browMat = null } = {}) {
  for (const s of [-1, 1]) {
    m.add(G.sphere(r, 10, 8), M.glow(color), { p: [s * x, y, z], shadow: false });
    m.add(G.sphere(r * 0.5, 8, 6), M.glow(pupil), { p: [s * x * 0.98, y, z + r * 0.75], shadow: false });
    if (brow) m.add(G.box(r * 2.1, r * 0.4, r * 0.5), browMat || BLACK(), { p: [s * x, y + r * 0.9, z + r * 0.5], r: [0.4, 0, -s * brow], shadow: false });
  }
}

/** An eye on a stalk that sways as the creature moves along. */
function stalkEye(m, mat, s, { x, y, z, len = 0.5, r = 0.15, splay = 0.3 }) {
  const stalk = part(m, { k: 'sway', ax: 'x', f: 3.2, amp: 0.16, ph: s > 0 ? 0 : 1.6 }, { p: [s * x, y, z], r: [0.15, 0, -s * splay] });
  stalk.add(G.cyl(r * 0.32, r * 0.45, len, 6), mat, { p: [0, len / 2, 0] });
  stalk.add(G.sphere(r, 10, 8), M.glow(0xffffff), { p: [0, len + r * 0.5, 0], shadow: false });
  stalk.add(G.sphere(r * 0.5, 8, 6), M.glow(0x000000), { p: [0, len + r * 0.55, r * 0.72], shadow: false });
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, outline, { y = 0.3, z = -0.1, hinge = 0.25 } = {}) {
  mat.side = THREE.DoubleSide;                     // the mirrored wing is wound the other way
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate(outline, 0.035);
    geo.rotateX(-HALF_PI);                         // outline +y becomes "towards the tail"
    if (s < 0) geo.scale(-1, 1, 1);
    return m.add(geo, mat, { p: [s * hinge, y, z], shadow: false });
  });
}

/**
 * A flickering flame. The animator overwrites a flame's X/Y scale, so the mesh
 * sits at scale 1 inside a holder that carries the creature's size.
 */
function flame(m, enemy, { p, r = [0, 0, 0], rad = 0.14, h = 0.5, color = 0xff8a1f }) {
  const holder = m.group({ p, r });
  holder.object.scale.setScalar(m.scale);
  const geo = G.cone(rad, h, 7);
  geo.translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, M.energy(color, 0.9));
  holder.object.add(mesh);
  (enemy.flames = enemy.flames || []).push(mesh);
}

const FEATHER_WING = [[0, -0.3], [0.5, -0.42], [1.05, -0.3], [1.45, -0.02], [1.18, 0.08], [1.22, 0.3], [0.9, 0.24], [0.85, 0.48], [0.5, 0.3], [0.38, 0.5], [0, 0.3]];
const EMBER_WING = [[0, -0.28], [0.5, -0.5], [0.95, -0.38], [1.6, -0.5], [1.2, -0.08], [1.6, 0.22], [1.0, 0.18], [1.05, 0.6], [0.6, 0.3], [0.4, 0.62], [0, 0.3]];

function slug(m, enemy, c) {
  // Low, long and glistening, with its eyes out on stalks and a trail behind.
  const skin = M.paint(c.color, { gloss: 0.9, glow: 0.1 });
  const belly = M.paint(c.accent, { gloss: 0.6, glow: 0.12 });
  const mantle = M.paint(0x6f8a12, { gloss: 0.8, glow: 0.08 });
  m.add(G.cyl(0.42, 0.2, 0.02, 12), M.glass(0xe6fff0, 0.4), { p: [0, -0.94, -1.05], s: [1, 1, 1.7], shadow: false });   // slime
  m.add(G.sphere(0.5, 14, 10), belly, { p: [0, -0.74, -0.1], s: [1.0, 0.4, 1.75] });                                     // foot
  m.add(G.sphere(0.5, 14, 10), skin, { p: [0, -0.5, -0.12], s: [0.86, 0.78, 1.55] });
  m.add(G.cone(0.34, 0.8, 10), skin, { p: [0, -0.68, -1.05], r: [-HALF_PI, 0, 0], s: [1, 1, 0.6] });                     // tail
  m.add(G.sphere(0.42, 12, 10), mantle, { p: [0, -0.24, -0.08], s: [0.82, 0.62, 1.05] });                                // mantle
  for (const [x, z] of [[0.12, 0.1], [-0.14, -0.1], [0.05, -0.35], [-0.04, 0.3]]) m.add(G.sphere(0.07, 6, 5), skin, { p: [x, 0.0, z - 0.08], s: [1, 0.4, 1] });
  m.add(G.sphere(0.38, 12, 10), skin, { p: [0, -0.26, 0.62], s: [0.92, 0.95, 0.95] });                                   // head
  m.add(G.torus(0.13, 0.035, 5, 10, Math.PI), M.matte(0x4a5210), { p: [0, -0.32, 0.95], r: [0.2, 0, Math.PI] });         // grin
  for (const s of [-1, 1]) {
    stalkEye(m, skin, s, { x: 0.17, y: -0.02, z: 0.68, len: 0.48, r: 0.17 });
    m.add(G.cone(0.05, 0.18, 5), skin, { p: [s * 0.2, -0.5, 0.95], r: [HALF_PI + 0.3, 0, -s * 0.3] });                   // feelers
  }
}

function caterpillar(m, enemy, c) {
  // A chilli-red inchworm, arched mid-stride and alight along its back.
  const body = M.paint(c.color, { gloss: 0.75, glow: 0.42 });
  const band = M.paint(c.accent, { gloss: 0.6, glow: 0.6 });
  const dark = M.matte(0x4a120a);
  const segs = [[-0.98, -0.66, 0.26], [-0.56, -0.42, 0.32], [-0.1, -0.36, 0.35], [0.34, -0.52, 0.34]];
  segs.forEach(([z, y, r], i) => {
    m.add(G.sphere(r, 12, 10), body, { p: [0, y, z] });
    m.add(G.torus(r * 0.86, 0.06, 5, 14), band, { p: [0, y, z + r * 0.62] });
    for (const s of [-1, 1]) m.add(G.sphere(0.1, 6, 5), dark, { p: [s * r * 0.6, i === 1 || i === 2 ? y - r * 0.9 : -0.88, z], s: [1, 1.2, 1] });
    flame(m, enemy, { p: [0, y + r * 0.75, z], rad: 0.13 + i * 0.01, h: 0.42 + (i % 2) * 0.12 });
  });
  m.add(G.cone(0.1, 0.3, 6), band, { p: [0, -0.5, -1.25], r: [-HALF_PI - 0.6, 0, 0] });                                  // tail spike
  m.add(G.sphere(0.42, 14, 12), body, { p: [0, -0.3, 0.74] });                                                           // head
  m.add(G.sphere(0.2, 10, 8), band, { p: [0, -0.46, 1.04], s: [1.2, 0.6, 0.8] });                                        // jaws
  for (const s of [-1, 1]) {
    m.add(G.cone(0.05, 0.16, 5), dark, { p: [s * 0.12, -0.56, 1.14], r: [HALF_PI + 0.5, 0, s * 0.4] });
    m.add(G.tube([[s * 0.15, 0.05, 0.75], [s * 0.3, 0.42, 0.85], [s * 0.36, 0.48, 1.02]], 0.035, 5), dark);              // antennae
    m.add(G.sphere(0.07, 6, 5), M.glow(0xffc23d), { p: [s * 0.36, 0.48, 1.04], shadow: false });
  }
  eyes(m, { x: 0.19, y: -0.16, z: 1.03, r: 0.13, color: 0xfff3a0, brow: 0.45, browMat: dark });
}

function pigeon(m, enemy, c) {
  // Plump, cross and iridescent about the neck. It has seen the seedlings.
  const grey = M.paint(c.color, { gloss: 0.5, glow: 0.14 });
  const neck = M.paint(c.accent, { gloss: 0.9, glow: 0.3 });
  const dark = M.paint(0x4a556e, { gloss: 0.4 });
  const orange = M.paint(0xff8a1f, { gloss: 0.6, glow: 0.3 });
  m.add(G.sphere(0.55, 14, 12), grey, { p: [0, -0.05, -0.12], s: [0.95, 0.88, 1.25] });
  m.add(G.sphere(0.4, 12, 10), neck, { p: [0, 0.08, 0.3], s: [0.95, 1.05, 0.9] });                                       // chest and neck
  m.add(G.sphere(0.3, 12, 10), grey, { p: [0, 0.48, 0.5] });                                                             // head
  m.add(G.cone(0.1, 0.34, 8), orange, { p: [0, 0.42, 0.9], r: [HALF_PI, 0, 0] });                                         // beak
  m.add(G.sphere(0.08, 8, 6), M.paint(0xffffff, { gloss: 0.4 }), { p: [0, 0.5, 0.78], s: [1.2, 0.7, 1] });                // cere
  eyes(m, { x: 0.2, y: 0.55, z: 0.66, r: 0.1, color: 0xffb020, brow: 0.5, browMat: dark });
  m.add(G.plate([[-0.22, 0], [0.22, 0], [0.42, -0.62], [0.14, -0.55], [0, -0.68], [-0.14, -0.55], [-0.42, -0.62]], 0.06), dark, { p: [0, 0.0, -0.66], r: [HALF_PI + 0.15, 0, 0] });   // tail fan
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.16, -0.4, 0.05], [s * 0.18, -0.62, 0.1], [s * 0.18, -0.66, 0.26]], 0.04, 5), orange);           // tucked feet
    m.add(G.box(0.05, 0.08, 0.5), M.paint(0xf4f6f8, { glow: 0.2 }), { p: [s * 0.5, 0.14, -0.25], r: [0, s * 0.25, 0] }); // wing bar at the shoulder
  }
  wings(m, enemy, M.paint(0x7f93bb, { gloss: 0.35, glow: 0.18 }), FEATHER_WING, { y: 0.16, z: -0.08, hinge: 0.3 });
}

function snail(m, enemy, c) {
  // A snail that has riveted an iron band round its shell and means business.
  const flesh = M.paint(0xf2d9a2, { gloss: 0.7, glow: 0.14 });
  const shell = M.paint(c.color, { gloss: 0.8, glow: 0.2 });
  const whorl = M.paint(0x8fd0ff, { gloss: 0.8, glow: 0.25 });
  const iron = M.metal(0x8f98a6, { rough: 0.4 });
  const rivet = M.paint(c.accent, { gloss: 0.8, glow: 0.4 });
  m.add(G.sphere(0.5, 14, 10), flesh, { p: [0, -0.74, 0.0], s: [0.82, 0.42, 2.05] });                                    // foot
  m.add(G.tube([[0, -0.7, 0.55], [0, -0.32, 0.84], [0, 0.0, 0.94]], 0.21, 8), flesh);                                    // neck
  m.add(G.sphere(0.28, 12, 10), flesh, { p: [0, 0.05, 0.98] });
  m.add(G.torus(0.1, 0.03, 5, 10, Math.PI), M.matte(0x6b4a1c), { p: [0, -0.04, 1.23], r: [0.2, 0, Math.PI] });
  for (const s of [-1, 1]) stalkEye(m, flesh, s, { x: 0.13, y: 0.22, z: 1.0, len: 0.42, r: 0.15, splay: 0.35 });
  // The shell: a fat coil, a paler whorl stepping out on each side.
  m.add(G.sphere(0.74, 18, 14), shell, { p: [0, 0.05, -0.28], s: [0.66, 1, 1] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.5, 14, 10), whorl, { p: [s * 0.36, 0.05, -0.28], s: [0.4, 1, 1] });
    m.add(G.sphere(0.3, 12, 8), shell, { p: [s * 0.5, 0.05, -0.28], s: [0.4, 1, 1] });
    m.add(G.sphere(0.13, 8, 6), rivet, { p: [s * 0.6, 0.05, -0.28], s: [0.6, 1, 1] });
  }
  m.add(G.torus(0.75, 0.075, 6, 26), iron, { p: [0, 0.05, -0.28], r: [0, HALF_PI, 0] });                                 // the band
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.2;
    if (Math.sin(a) < -0.75) continue;                                                                                   // none underneath
    m.add(G.sphere(0.075, 6, 5), rivet, { p: [0, 0.05 + Math.sin(a) * 0.82, -0.28 + Math.cos(a) * 0.82] });
  }
  m.add(G.cone(0.11, 0.3, 6), iron, { p: [0, 0.96, -0.28] });                                                            // spike on top
}

function mole(m, enemy, c) {
  // Velvet coat, star-pink nose, shovels for hands and a miner's lamp to see
  // the carrots by.
  const fur = M.paint(c.color, { gloss: 0.3, glow: 0.14 });
  const pink = M.paint(0xff9fb0, { gloss: 0.5, glow: 0.2 });
  const claw = M.paint(0xfffbe6, { gloss: 0.6, glow: 0.1 });
  const helmet = M.paint(c.accent, { gloss: 0.85, glow: 0.3 });
  const dark = M.matte(0x1d1b2a);
  m.add(G.sphere(0.72, 16, 12), fur, { p: [0, -0.2, -0.22], s: [0.98, 0.95, 1.1] });
  m.add(G.sphere(0.5, 12, 10), M.paint(0x8a86b0, { gloss: 0.3, glow: 0.1 }), { p: [0, -0.32, 0.2], s: [0.85, 0.8, 0.7] });   // belly
  m.add(G.sphere(0.46, 14, 12), fur, { p: [0, 0.12, 0.45] });                                                            // head
  m.add(G.cone(0.26, 0.55, 12), fur, { p: [0, 0.02, 0.92], r: [HALF_PI, 0, 0] });                                         // snout
  m.add(G.sphere(0.1, 10, 8), pink, { p: [0, 0.02, 1.2] });
  for (let i = 0; i < 6; i++) m.add(G.cone(0.03, 0.12, 4), pink, { p: [Math.cos(i * 1.05) * 0.11, 0.02 + Math.sin(i * 1.05) * 0.11, 1.2], r: [HALF_PI, 0, 0] });   // star nose
  for (const s of [-1, 1]) {
    m.add(G.box(0.07, 0.14, 0.04), claw, { p: [s * 0.045, -0.16, 1.02] });                                               // teeth
    m.add(G.torus(0.085, 0.02, 5, 12), dark, { p: [s * 0.15, 0.2, 0.84] });                                              // spectacles
    m.add(G.sphere(0.035, 6, 5), M.glow(0x000000), { p: [s * 0.15, 0.2, 0.84], shadow: false });
    // Digging hands, swinging as it waddles.
    const hand = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.62, -0.22, 0.3] });
    hand.add(G.sphere(0.24, 10, 8), pink, { p: [s * 0.08, -0.12, 0.2], s: [1.1, 0.5, 1.2] });
    for (const dx of [-0.14, 0, 0.14]) hand.add(G.cone(0.055, 0.3, 5), claw, { p: [s * 0.08 + dx, -0.14, 0.52], r: [HALF_PI + 0.2, 0, 0] });
    const foot = part(m, { k: 'swing', ax: 'x', amp: 0.45, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.4, -0.78, -0.35] });
    foot.add(G.sphere(0.2, 8, 6), pink, { p: [0, -0.08, 0.1], s: [1, 0.5, 1.5] });
  }
  m.add(G.cone(0.07, 0.4, 6), pink, { p: [0, -0.5, -1.05], r: [-HALF_PI - 0.3, 0, 0] });                                 // tail
  // Hard hat, brim forward, with the lamp lit.
  m.add(G.dome(0.44, 16), helmet, { p: [0, 0.3, 0.4], s: [1, 0.85, 1.05] });
  m.add(G.cyl(0.5, 0.5, 0.05, 18), helmet, { p: [0, 0.31, 0.5], s: [1, 1, 1.1] });
  m.add(G.box(0.1, 0.4, 0.06), M.paint(0xffffff, { glow: 0.2 }), { p: [0, 0.6, 0.4], r: [HALF_PI, 0, 0] });               // stripe
  m.add(G.cyl(0.13, 0.1, 0.14, 10), dark, { p: [0, 0.52, 0.8], r: [HALF_PI, 0, 0] });
  m.add(G.sphere(0.1, 8, 6), M.glow(0xfff3a0), { p: [0, 0.52, 0.88], shadow: false });
  flame(m, enemy, { p: [0, 0.6, 0.78], rad: 0.12, h: 0.5 });
  // Pickaxe slung across the back.
  m.add(G.cyl(0.04, 0.04, 1.2, 6), M.paint(0x8a5a33, { gloss: 0.3 }), { p: [0, 0.3, -0.7], r: [0.5, 0, 0.9] });
  m.add(G.tube([[0.2, 0.92, -0.7], [0.5, 0.82, -0.86], [0.72, 0.52, -0.94]], 0.05, 5), M.metal(0xb9c4d2, { rough: 0.35 }));
}

function crow(m, enemy, c) {
  // Soot-black, long in the beak, wings like sheets of flame.
  const black = M.paint(c.color, { gloss: 0.7, glow: 0.1 });
  const ember = M.paint(c.accent, { gloss: 0.4, glow: 0.95 });
  const beak = M.paint(0xffb01f, { gloss: 0.7, glow: 0.4 });
  m.add(G.sphere(0.45, 14, 10), black, { p: [0, 0, -0.12], s: [0.8, 0.75, 1.5] });
  m.add(G.sphere(0.3, 12, 10), black, { p: [0, 0.26, 0.56] });
  m.add(G.cone(0.12, 0.6, 8), beak, { p: [0, 0.2, 1.05], r: [HALF_PI + 0.12, 0, 0] });
  for (let i = 0; i < 3; i++) m.add(G.cone(0.07, 0.3, 5), ember, { p: [0, 0.52 - i * 0.05, 0.42 - i * 0.16], r: [-0.9 - i * 0.2, 0, 0] });   // crest
  eyes(m, { x: 0.2, y: 0.33, z: 0.74, r: 0.09, color: 0xff3d1f, pupil: 0xfff3a0, brow: 0.5, browMat: black });
  m.add(G.plate([[-0.18, 0], [0.18, 0], [0.34, -0.7], [0, -0.55], [-0.34, -0.7]], 0.05), black, { p: [0, 0.02, -0.7], r: [HALF_PI + 0.1, 0, 0] });   // tail
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.15, -0.3, -0.1], [s * 0.17, -0.5, -0.3], [s * 0.17, -0.52, -0.1]], 0.035, 5), beak);                // talons
  wings(m, enemy, ember, EMBER_WING, { y: 0.14, z: -0.1, hinge: 0.24 });
  flame(m, enemy, { p: [0, 0.05, -1.3], r: [-HALF_PI - 0.2, 0, 0], rad: 0.17, h: 0.65 });
  flame(m, enemy, { p: [0, 0.5, 0.2], r: [-0.5, 0, 0], rad: 0.1, h: 0.4 });
}

function rabbit(m, enemy, c) {
  // Baron von Nibble: a rabbit the size of the shed, crowned, and already
  // halfway through somebody's prize carrot.
  const fur = M.paint(c.color, { gloss: 0.3, glow: 0.14 });
  const white = M.paint(0xffffff, { gloss: 0.3, glow: 0.12 });
  const pink = M.paint(0xff9fb0, { gloss: 0.5, glow: 0.2 });
  const gold = M.metal(0xffcc33, { rough: 0.2 });
  m.add(G.sphere(0.85, 18, 14), fur, { p: [0, -0.15, -0.3], s: [0.95, 0.92, 1.1] });                                     // haunches
  m.add(G.sphere(0.58, 16, 12), white, { p: [0, -0.05, 0.36], s: [0.9, 1, 0.8] });                                       // chest
  m.add(G.sphere(0.5, 16, 12), fur, { p: [0, 0.62, 0.55] });                                                             // head
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.24, 12, 10), white, { p: [s * 0.18, 0.47, 0.94] });                                                 // cheeks
    for (let w = 0; w < 3; w++) m.add(G.cyl(0.008, 0.008, 0.5, 4), M.matte(0x3a3340), { p: [s * 0.5, 0.48 + (w - 1) * 0.06, 0.98], r: [0, 0, HALF_PI + s * (w - 1) * 0.22] });
    // Ears: one proud, one flopped at the tip.
    const ear = part(m, { k: 'sway', ax: 'x', f: 2.4, amp: 0.1, ph: s > 0 ? 0 : 1.3 }, { p: [s * 0.22, 0.98, 0.42], r: [-0.18, 0, -s * 0.2] });
    ear.add(G.capsule(0.15, s > 0 ? 0.95 : 0.6), fur, { s: [1, 1, 0.45] });
    ear.add(G.capsule(0.08, s > 0 ? 0.78 : 0.48), pink, { p: [0, 0.07, 0.05], s: [1, 1, 0.3] });
    if (s < 0) {
      const flop = ear.group({ p: [0, 0.55, 0.02], r: [1.9, 0, 0] });
      flop.add(G.capsule(0.15, 0.48), fur, { s: [1, 1, 0.45] });
      flop.add(G.capsule(0.08, 0.38), pink, { p: [0, 0.05, -0.05], s: [1, 1, 0.3] });
    }
    // Great thumping feet.
    const foot = part(m, { k: 'swing', ax: 'x', amp: 0.35, ph: 0 }, { p: [s * 0.52, -0.7, -0.1] });
    foot.add(G.sphere(0.27, 10, 8), white, { p: [0, -0.12, 0.3], s: [0.9, 0.5, 2.0] });
    // Paws round the carrot.
    m.add(G.sphere(0.17, 10, 8), fur, { p: [s * 0.24, 0.12, 0.98] });
  }
  m.add(G.sphere(0.09, 10, 8), pink, { p: [0, 0.6, 1.08] });                                                             // nose
  m.add(G.box(0.2, 0.2, 0.05), white, { p: [0, 0.33, 1.06] });                                                           // buck teeth
  m.add(G.box(0.015, 0.2, 0.055), M.matte(0x9a8f80), { p: [0, 0.33, 1.062] });
  eyes(m, { x: 0.25, y: 0.78, z: 0.9, r: 0.11, color: 0xffffff, pupil: 0xb3122a, brow: 0.5, browMat: M.matte(0x6b5a48) });
  // The carrot.
  m.add(G.cone(0.14, 0.75, 10), M.paint(0xff7a1a, { gloss: 0.6, glow: 0.35 }), { p: [0, 0.1, 1.36], r: [HALF_PI + 0.3, 0, 0] });
  for (const x of [-0.1, 0, 0.1]) m.add(G.cone(0.06, 0.3, 5), LEAF(), { p: [x, 0.3, 0.98], r: [-0.4, 0, -x * 4] });
  m.add(G.sphere(0.3, 12, 10), white, { p: [0, -0.1, -1.28] });                                                          // scut
  // Crown between the ears, the jewel pulsing.
  m.add(G.torus(0.2, 0.05, 6, 18), gold, { p: [0, 1.08, 0.52], r: [HALF_PI, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    m.add(G.cone(0.055, 0.22, 4), gold, { p: [Math.sin(a) * 0.2, 1.22, 0.52 + Math.cos(a) * 0.2] });
  }
  const jewel = m.group({ p: [0, 1.12, 0.74] });
  jewel.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.sphere(0.08, 8, 6), M.glow(0xff2a4a));
  jewel.object.add(enemy.crownGem);
}

const ENEMIES = {
  SWARM: slug,
  FIRE: caterpillar,
  FLYING: pigeon,
  ARMORED: snail,
  ELITE: mole,
  FLYING_FIRE: crow,
  BOSS: rabbit
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: dark crumbly soil, pebbles, the odd seedling. */
function paintFloor(ctx, size) {
  ctx.fillStyle = '#7d5230';
  ctx.fillRect(0, 0, size, size);
  // Clods: soft light and dark patches, kept off the tile's edge so it repeats.
  for (let i = 0; i < 90; i++) {
    const r = 14 + Math.random() * 30;
    const x = r + Math.random() * (size - r * 2), y = r + Math.random() * (size - r * 2);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, i % 2 ? 'rgba(168, 116, 70, 0.22)' : 'rgba(48, 28, 12, 0.2)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Crumb: light and dark flecks.
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(232, 190, 140, 0.13)' : 'rgba(40, 22, 8, 0.16)';
    ctx.fillRect(Math.random() * (size - 4), Math.random() * (size - 4), 1.5 + Math.random() * 3, 1.5 + Math.random() * 2.5);
  }
  // Pebbles.
  for (let i = 0; i < 26; i++) {
    const x = 10 + Math.random() * (size - 20), y = 10 + Math.random() * (size - 20), r = 2.5 + Math.random() * 3.5;
    ctx.fillStyle = 'rgba(50, 30, 14, 0.25)';
    ctx.beginPath(); ctx.ellipse(x + 1.5, y + 2, r * 1.3, r, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = i % 3 ? 'rgba(214, 205, 190, 0.8)' : 'rgba(160, 150, 140, 0.8)';
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, 0, 0, TAU); ctx.fill();
  }
  // Seedlings: two leaves apiece, kept small so the pieces on top stay readable.
  for (let i = 0; i < 12; i++) {
    const x = 16 + Math.random() * (size - 32), y = 16 + Math.random() * (size - 32);
    ctx.fillStyle = i % 2 ? 'rgba(96, 170, 70, 0.75)' : 'rgba(126, 196, 86, 0.75)';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(x + s * 5, y, 5.5, 2.6, s * 0.5, 0, TAU); ctx.fill();
    }
  }
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // pot of tulips
      m.add(G.lathe([[0.17, 0], [0.19, 0.02], [0.27, 0.3], [0.3, 0.3], [0.3, 0.38], [0.26, 0.38], [0, 0.34]], 16), TERRACOTTA(), { p: [0, 0, 0] });
      const stem = LEAF();
      [[0, 0, 0xff4d6d], [0.13, 0.06, 0xffd24a], [-0.12, 0.08, 0xff8a3d], [0.03, -0.14, 0xf4f6f8], [-0.08, -0.1, 0xc77dff]].forEach(([x, z, col], i) => {
        const h = 0.36 + (i % 3) * 0.07;
        m.add(G.cyl(0.014, 0.014, h, 5), stem, { p: [x, 0.36 + h / 2, z] });
        m.add(G.sphere(0.07, 8, 6), stem, { p: [x + 0.05, 0.46, z], s: [1.2, 0.3, 0.5] });
        m.add(G.lathe([[0.02, 0], [0.065, 0.04], [0.07, 0.1], [0.045, 0.15]], 8), M.paint(col, { gloss: 0.6, glow: 0.3 }), { p: [x, 0.35 + h, z] });
      });
      break;
    }
    case 1: { // toadstools
      const stalk = M.paint(0xf1e7d0, { gloss: 0.3 });
      const cap = M.paint(0xe5352b, { gloss: 0.7, glow: 0.2 });
      const spot = M.paint(0xffffff, { gloss: 0.4, glow: 0.25 });
      [[0, 0, 1], [0.24, 0.12, 0.6], [-0.2, 0.16, 0.5]].forEach(([x, z, k]) => {
        m.add(G.lathe([[0.1, 0], [0.11, 0.03], [0.07, 0.3], [0.08, 0.36]].map(([r, y]) => [r * k, y * k]), 10), stalk, { p: [x, 0, z] });
        m.add(G.lathe([[0, 0], [0.24, 0], [0.3, 0.03], [0.26, 0.12], [0.13, 0.2], [0, 0.22]].map(([r, y]) => [r * k, y * k]), 16), cap, { p: [x, 0.34 * k, z] });
        for (let i = 0; i < 5; i++) {
          const a = i * 1.3 + k * 3, r = 0.15 + (i % 2) * 0.07;
          m.add(G.sphere(0.04 * k, 6, 5), spot, { p: [x + Math.cos(a) * r * k, (0.34 + 0.2 - r * 0.42) * k, z + Math.sin(a) * r * k], s: [1, 0.45, 1] });
        }
      });
      break;
    }
    case 2: { // storm lantern
      const iron = IRON();
      m.add(G.lathe([[0.2, 0], [0.22, 0.03], [0.2, 0.09], [0.12, 0.12]], 14), iron, { p: [0, 0, 0] });
      m.add(G.cyl(0.13, 0.15, 0.32, 12), M.glass(0xffe2a0, 0.45), { p: [0, 0.28, 0], shadow: false });
      m.add(G.sphere(0.075, 10, 8), M.glow(0xffc56b), { p: [0, 0.25, 0], s: [1, 1.5, 1], shadow: false });
      m.add(G.sphere(0.2, 10, 8), M.energy(0xffb347, 0.25), { p: [0, 0.28, 0], shadow: false });
      m.add(G.lathe([[0.16, 0], [0.16, 0.03], [0.07, 0.11], [0.05, 0.16]], 14), iron, { p: [0, 0.44, 0] });
      m.add(G.torus(0.16, 0.014, 5, 16, Math.PI), iron, { p: [0, 0.46, 0] });
      for (const s of [-1, 1]) m.add(G.cyl(0.01, 0.01, 0.34, 4), iron, { p: [s * 0.16, 0.29, 0] });
      break;
    }
    case 3: { // bird bath
      const stone = M.paint(0xb9bcc0, { gloss: 0.2 });
      m.add(G.lathe([[0.22, 0], [0.24, 0.04], [0.1, 0.1], [0.07, 0.4], [0.12, 0.46], [0.3, 0.52], [0.32, 0.58], [0.28, 0.58], [0.1, 0.5], [0, 0.5]], 18), stone, { p: [0, 0, 0] });
      m.add(G.cyl(0.27, 0.27, 0.01, 18), M.paint(0x4db8e6, { gloss: 0.95, glow: 0.4 }), { p: [0, 0.555, 0] });
      const bird = M.paint(0xe5352b, { gloss: 0.5, glow: 0.2 });                                // a robin on the rim
      m.add(G.sphere(0.07, 10, 8), M.paint(0x8a5a33, { gloss: 0.3 }), { p: [0.27, 0.66, 0], s: [1, 0.95, 1.25] });
      m.add(G.sphere(0.05, 8, 6), bird, { p: [0.27, 0.65, 0.05] });
      m.add(G.cone(0.015, 0.045, 5), M.paint(0xffc21a), { p: [0.27, 0.69, 0.1], r: [HALF_PI, 0, 0] });
      break;
    }
    default: { // cabbage and carrots
      const outer = M.paint(0x5fae4a, { gloss: 0.5, glow: 0.1 });
      m.add(G.sphere(0.24, 14, 10), M.paint(0xa8dc7a, { gloss: 0.5, glow: 0.12 }), { p: [-0.06, 0.2, -0.04], s: [1, 0.85, 1] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        m.add(G.sphere(0.2, 8, 6), outer, { p: [-0.06 + Math.cos(a) * 0.19, 0.12, -0.04 + Math.sin(a) * 0.19], s: [1, 0.75, 0.35], r: [0, -a + HALF_PI, 0] });
      }
      for (const [x, z] of [[0.28, 0.18], [0.34, -0.02], [0.2, 0.32]]) {
        m.add(G.cone(0.06, 0.12, 7), M.paint(0xff7a1a, { gloss: 0.5, glow: 0.25 }), { p: [x, 0.03, z], r: [Math.PI, 0, 0] });
        for (const d of [-0.5, 0, 0.5]) m.add(G.cone(0.03, 0.26, 4), LEAF(), { p: [x + d * 0.06, 0.2, z], r: [0, 0, -d * 0.6] });
      }
    }
  }
  return g;
}

/** Strings of warm bulbs on poles along the far side of the board and down the spawn end. */
function stringLights(scene, hw, hh) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  const pole = M.paint(0x5b3d24, { gloss: 0.2 });
  const wire = M.matte(0x1c1a22);
  const bulbs = [M.glow(0xffd27a), M.glow(0xff9d5c), M.glow(0xfff1c2)];
  const ex = hw + 0.96, ez = hh + 0.96, H = 3.0;
  const posts = [[-ex, ez], [-ex, -ez], [0, -ez], [ex, -ez]];
  for (const [x, z] of posts) {
    m.add(G.cyl(0.045, 0.065, H, 8), pole, { p: [x, H / 2, z] });
    m.add(G.sphere(0.1, 8, 6), bulbs[0], { p: [x, H + 0.08, z], shadow: false });
  }
  let n = 0;
  for (let i = 0; i < posts.length - 1; i++) {
    const [ax, az] = posts[i], [bx, bz] = posts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const steps = Math.max(4, Math.round(len / 0.9));
    const sag = Math.min(0.55, len * 0.05);
    const pts = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, y = H - Math.sin(t * Math.PI) * sag;
      const x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      pts.push([x, y, z]);
      if (k > 0 && k < steps) m.add(G.sphere(0.075, 7, 5), bulbs[n++ % 3], { p: [x, y - 0.09, z], shadow: false });
    }
    m.add(G.tube(pts, 0.012, 4), wire, { shadow: false });
  }
  bakeStaticMeshes(g);
  scene.add(g);
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => {
    shareEquivalentMaterials(g);
    bakeStaticMeshes(g);
    g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g;
  };
  const warm = M.glow(0xffc56b);
  const wood = M.paint(0x7a5234, { gloss: 0.2, glow: 0.06 });
  const leaf = M.paint(0x2f7a3a, { gloss: 0.3, glow: 0.12 });

  stringLights(scene, hw, hh);

  // The potting shed, lamp on, tools against the wall.
  const shed = new THREE.Group();
  let m = modeller(shed, 1);
  m.add(G.box(8, 5.6, 6), wood, { p: [0, 2.8, 0] });
  for (let x = -3.5; x <= 3.5; x += 1) m.add(G.box(0.06, 5.6, 0.05), M.matte(0x4a3220), { p: [x, 2.8, 3.02] });          // plank joints
  m.add(G.plate([[-4.7, 0], [4.7, 0], [0, 3.0]], 6.8), M.paint(0x35405e, { gloss: 0.3, glow: 0.08 }), { p: [0, 5.6, 0] });
  m.add(G.rbox(2.0, 3.8, 0.2, 0.06), M.paint(0x2f7a55, { gloss: 0.5, glow: 0.1 }), { p: [-1.6, 1.9, 3.05] });            // door
  m.add(G.sphere(0.14, 8, 6), M.metal(0xffcc33), { p: [-0.9, 1.9, 3.2] });
  m.add(G.box(2.3, 2.0, 0.12), M.paint(0xf4f1e6, { gloss: 0.4 }), { p: [2.0, 3.2, 3.02] });                              // window frame
  m.add(G.box(1.95, 1.65, 0.14), warm, { p: [2.0, 3.2, 3.03], shadow: false });
  m.add(G.box(0.1, 1.65, 0.18), M.paint(0xf4f1e6), { p: [2.0, 3.2, 3.03] });
  m.add(G.box(1.95, 0.1, 0.18), M.paint(0xf4f1e6), { p: [2.0, 3.2, 3.03] });
  m.add(G.box(2.5, 0.4, 0.5), TERRACOTTA(), { p: [2.0, 2.0, 3.25] });                                                    // window box
  for (const [x, col] of [[1.1, 0xff4d6d], [1.7, 0xffd24a], [2.3, 0xf4f6f8], [2.9, 0xff8a3d]]) m.add(G.sphere(0.24, 8, 6), M.paint(col, { glow: 0.35 }), { p: [x, 2.42, 3.3] });
  m.add(G.sphere(0.3, 10, 8), warm, { p: [0.1, 4.5, 3.3], shadow: false });                                              // porch lamp
  m.add(G.sphere(0.7, 10, 8), M.energy(0xffb347, 0.22), { p: [0.1, 4.5, 3.3], shadow: false });
  m.add(G.cyl(0.07, 0.07, 4.2, 6), M.paint(0xb88a52, { gloss: 0.3 }), { p: [3.6, 2.1, 3.3], r: [0, 0, 0.12] });          // spade
  m.add(G.rbox(0.7, 1.0, 0.06, 0.03), M.metal(0xb9c4d2, { rough: 0.4 }), { p: [3.82, 0.5, 3.3], r: [0, 0, 0.12] });
  place(shed, -hw * 0.5, -hh - 10.5, 0.15);

  // An old apple tree hung with lanterns.
  const tree = new THREE.Group();
  m = modeller(tree, 1);
  m.add(G.lathe([[1.5, 0], [1.0, 1.2], [0.8, 4.0], [1.1, 5.6]], 10), M.paint(0x4f3724, { gloss: 0.15, glow: 0.05 }), { p: [0, 0, 0] });
  for (const [x, y, z, r] of [[0, 8.2, 0, 3.6], [-2.8, 7.0, 0.6, 2.6], [2.9, 7.2, -0.3, 2.8], [0.6, 10.4, -0.4, 2.6], [-1.2, 6.6, 2.0, 2.2], [1.8, 6.4, 1.8, 2.0]]) {
    m.add(G.sphere(r, 12, 9), leaf, { p: [x, y, z] });
  }
  [[-3.2, 4.4, 1.6], [2.6, 4.9, 2.2], [0.2, 4.2, 3.0], [-1.6, 5.0, 3.0], [3.9, 5.2, 0.2]].forEach(([x, y, z], i) => {
    m.add(G.cyl(0.02, 0.02, 1.2, 4), M.matte(0x1c1a22), { p: [x, y + 0.8, z] });
    m.add(G.sphere(0.32, 10, 8), i % 2 ? M.glow(0xff9d5c) : warm, { p: [x, y, z], s: [1, 1.25, 1], shadow: false });
    m.add(G.sphere(0.62, 8, 6), M.energy(0xffb347, 0.2), { p: [x, y, z], shadow: false });
  });
  for (const [x, y, z] of [[-2.0, 6.2, 2.9], [1.2, 7.6, 3.2], [3.4, 6.4, 1.9], [-0.4, 9.2, 2.9]]) m.add(G.sphere(0.3, 8, 6), M.paint(0xe5352b, { gloss: 0.7, glow: 0.3 }), { p: [x, y, z] });
  place(tree, hw * 0.45, -hh - 12.5);

  // Sunflowers, taller than the shed, nodding over the spawn side.
  const flowers = new THREE.Group();
  m = modeller(flowers, 1);
  const petal = M.paint(0xffc928, { gloss: 0.5, glow: 0.4 });
  const stalk = M.paint(0x3f8f3a, { gloss: 0.3, glow: 0.1 });
  [[0, 0, 7.6, 1], [0.6, 3.4, 6.2, 0.85], [-0.4, -3.2, 8.6, 1.1]].forEach(([x, z, h, k]) => {
    m.add(G.cyl(0.14 * k, 0.2 * k, h, 7), stalk, { p: [x, h / 2, z] });
    for (const [y, s] of [[h * 0.35, 1], [h * 0.55, -1]]) m.add(G.sphere(1.0 * k, 8, 6), stalk, { p: [x, y, z + s * 0.9 * k], s: [0.5, 0.12, 1] });
    const head = m.group({ p: [x + 0.35 * k, h, z], r: [0, HALF_PI, -0.25] });
    head.add(G.star(1.7 * k, 1.1 * k, 0.12, 14), petal);
    head.add(G.cyl(0.95 * k, 0.95 * k, 0.3, 16), M.paint(0x5a3a1c, { gloss: 0.2 }), { r: [HALF_PI, 0, 0] });
  });
  place(flowers, -hw - 9.5, -hh * 0.2);

  // A wheelbarrow of pumpkins by the near corner.
  const barrow = new THREE.Group();
  m = modeller(barrow, 1);
  const green = M.paint(0x2f8f6a, { gloss: 0.6, glow: 0.1 });
  m.add(G.lathe([[1.2, 0], [1.9, 1.3], [2.0, 1.3], [1.3, -0.1]], 4), green, { p: [0, 1.1, 0], r: [0, Math.PI / 4, 0], s: [1.25, 1, 0.9] });
  m.add(G.cyl(0.8, 0.8, 0.3, 16), BLACK(), { p: [2.3, 0.8, 0], r: [HALF_PI, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.08, 0.08, 4.6, 6), wood, { p: [-0.6, 1.3, s * 0.9], r: [0, 0, HALF_PI - 0.12] });
    m.add(G.cyl(0.08, 0.08, 1.2, 6), wood, { p: [-1.4, 0.6, s * 0.9] });
  }
  for (const [x, z, r] of [[-0.3, 0.2, 0.95], [0.9, -0.3, 0.75], [0.2, -0.5, 0.6]]) {
    m.add(G.sphere(r, 12, 9), M.paint(0xff8a1f, { gloss: 0.6, glow: 0.25 }), { p: [x, 2.3 + r * 0.5, z], s: [1, 0.8, 1] });
    m.add(G.cyl(0.08, 0.12, 0.3, 5), stalk, { p: [x, 2.3 + r * 1.35, z] });
  }
  place(barrow, -hw - 8.5, hh * 0.95, 0.5);

  // The harvest moon over it all.
  const sky = new THREE.Group();
  m = modeller(sky, 1);
  m.add(G.sphere(3.0, 20, 16), M.glow(0xf6f1d4), { p: [0, 20, 0], shadow: false });
  m.add(G.sphere(3.8, 16, 12), M.energy(0xbcd0ff, 0.14), { p: [0, 20, 0], shadow: false });
  for (const [x, y, r] of [[-0.9, 20.6, 0.6], [0.8, 19.3, 0.45], [0.5, 21.2, 0.3]]) m.add(G.sphere(r, 8, 6), M.glow(0xddd6b4), { p: [x, y, 2.75], s: [1, 1, 0.2], shadow: false });
  place(sky, -hw * 0.05, -hh - 26);

  return out;
}

export const kit = {
  /**
   * @param {THREE.Group} turret - the part of the tower that turns to aim
   * @param {number} idx - 0-7, matching t1-t8
   * @param {{scale: number, lv: number, color: THREE.Color}} ctx
   */
  buildTower(turret, idx, ctx) {
    (TOWERS[idx] || TOWERS[0])(modeller(turret, ctx.scale), ctx);
  },

  /**
   * @param {THREE.Group} group - the enemy's mesh group
   * @param {object} enemy - set enemy.wings / enemy.flames to have them animated
   * @param {number} sz - body radius in world units
   * @param {{color: number, accent: number}} ctx - from visuals.enemies[role]
   */
  buildEnemy(group, enemy, sz, ctx) {
    const build = ENEMIES[(enemy.role || 'SWARM').toUpperCase()] || ENEMIES.SWARM;
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0xa8c414, accent: ctx.accent ?? 0xffd23f });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
