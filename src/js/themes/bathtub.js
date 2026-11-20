// BATHTUB NAVY
//
// Defend the plug. The arena is a bath at bath time: warm water over a tiled
// tub floor, soap bars for walls. The enemies are an invasion fleet of bath
// toys — rubber ducks, a tin submarine, a wind-up seaplane, an admiral in a toy
// battleship — and the towers are everything else within reach of the tub.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'bathtub',
  name: 'Bathtub Navy',
  shortName: 'Bathtub',
  icon: 'duck',
  sortOrder: 70,
  description: 'Defend the plug. Bathroom gadgets versus an invasion fleet of rubber ducks and tin toys.',
  color: '#35c9e8',
  groundColor: 0x3fb4cc,
  pathColor: 0xbfefff,
  envColor: 0x0a2530,
  environmentSkin: { arena: 'bathtub', floor: 'water', markerIcon: '🛁' },
  enemySkin: { body: 'toy', icon: 'duck' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Water Pistol', icon: 'pistol', clr: '#7ee03a' },
    t2: { nm: 'Shower Sniper', icon: 'shower', clr: '#a78bfa' },
    t3: { nm: 'Bath Bomber', icon: 'bathbomb', clr: '#ff5db1' },
    t4: { nm: 'Cold Tap', icon: 'tap', clr: '#38a8ff' },
    t5: { nm: 'Plunger', icon: 'plunger', clr: '#d9342b' },
    t6: { nm: 'Hairdryer', icon: 'dryer', clr: '#ffe14d' },
    t7: { nm: 'Steam Iron', icon: 'iron', clr: '#ff6410' },
    t8: { nm: 'Shampoo Rocket', icon: 'rocket', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Rubber Duck' },
    e2: { nm: 'Boiled Duck' },
    e3: { nm: 'Tin Seaplane' },
    e4: { nm: 'Wind-up Sub' },
    e5: { nm: 'Pirate Duck' },
    e6: { nm: 'Bottle Rocket' },
    e7: { nm: 'Admiral Quack' }
  },
  maps: [
    ['Bath Time', 'A gentle soak - learn the basics'],
    ['Soap Dish', 'Open centre, two ways in'],
    ['Shampoo Strait', 'Tight lanes between the bottles'],
    ['The Long Soak', 'Long tub, heavy traffic'],
    ['Midnight Dip', 'They come from everywhere'],
    ['The Overflow', 'Narrow and fast'],
    ['Hot Tap Bay', 'Wide open and hot'],
    ['Bubble Trouble', 'Mixed pressure, little room'],
    ['Battle of the Bath', 'The big one'],
    ['Pull the Plug', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x0a2530,
    fog: 0x103542,
    fogDensity: 0.006,
    floor: {
      base: '#2a9cbc',
      meshColor: 0x86aebd,
      roughness: 0.16,
      metalness: 0.08,
      emissive: 0x0b4a5c,
      emissiveIntensity: 0.22
    },
    rail: { color: 0xe4ecef, roughness: 0.25, metalness: 0.1 },
    path: { color: 0xeaffff, emissive: 0x1a7f96, opacity: 0.3, edge: 0xff7ab8 },
    buildZone: { color: 0xeaffff, opacity: 0.1, line: 0xff7ab8 },
    obstacle: { accent: 0xff7ab8 },
    base: { color: 0xfff27a, icon: 'DEFEND THE PLUG' },
    spawn: { color: 0xff4d4d, icon: 'TOYS' }
  },
  lighting: {
    hemiSky: 0xeafcff,
    hemiGround: 0x1d5566,
    hemiIntensity: 0.42,
    sun: 0xfff4dc,
    sunIntensity: 0.9,
    rim: 0xff7ab8,
    rimIntensity: 0.24,
    accent: 0x35c9e8,
    spotIntensity: 1.9,
    exposure: 0.68
  },
  ui: { accent: '#35c9e8', dark: '#0a2530' },
  crowd: { fans: [0xffd21a, 0xff7ab8, 0x35c9e8, 0xffffff, 0x9be3d0], seat: 0x1d4a5a },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    ball: { mesh: 'orb', flight: 'tracer', trail: 'aqua', impact: 'spark', color: 0x8fe6ff, speed: 11, size: 0.6 },            // squirt of water
    curveBall: { mesh: 'laser', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xd6f6ff, speed: 14 },                 // needle jet
    headButt: { mesh: 'ball', flight: 'lob', trail: 'shock', impact: 'ring', color: 0xff5db1, speed: 8.5, size: 1.15 },         // bath bomb
    tackle: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x9fe4ff, speed: 9.5 },                  // ice-cold spray
    glove: { mesh: 'cone', flight: 'punch', trail: 'dust', impact: 'slam', color: 0xd9342b, speed: 8.8, size: 1.2 },            // the plunger itself
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xffe14d, speed: 15 },
    flare: { mesh: 'orb', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xffd9b0, speed: 11, size: 0.8 },              // scalding steam
    legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case. No blue bodies: the floor is bathwater.
  enemies: {
    swarm: { body: 'bug', color: 0xffd21a, accent: 0xff7a1a },
    fire: { body: 'bug', color: 0xe8341f, accent: 0xffb347 },
    flying: { body: 'bug', color: 0xf4f1e6, accent: 0xe23b3b },
    armored: { body: 'bug', color: 0x55606e, accent: 0xe0a93a },
    elite: { body: 'bug', color: 0x2b2f3a, accent: 0xff3b3b },
    flying_fire: { body: 'bug', color: 0xd13bd6, accent: 0xffe14d },
    boss: { body: 'bug', color: 0xffcf1f, accent: 0x1c2a5e }
  },
  towers: { family: 'bathtub', base: 0x1d4a5a, metal: 0xd7dde5, levelGlow: 0x35c9e8 }
};

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);
const WHITE = () => M.paint(0xf4f6f8, { gloss: 0.75 });
const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

/** A part that throbs. 'pulse' overwrites scale, so it goes in its own group. */
function pulsing(m, p, geo, mat, offset = 0) {
  const g = m.group({ p });
  g.add(geo, mat, { shadow: false });
  m.anim(g.object, 'pulse', { offset });
  return g;
}

/** Points along a coil: `f(t, cos, sin)` returns each [x, y, z]. */
function helix(turns, f, perTurn = 10) {
  const n = Math.ceil(turns * perTurn), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * turns * TAU;
    pts.push(f(t, Math.cos(a), Math.sin(a)));
  }
  return pts;
}

function waterPistol(m, c) {
  // A chunky toy pistol on a swivel post, tank of water on its back.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.14 });   // flashes when it fires
  const orange = M.paint(0xff7a1a, { gloss: 0.8, glow: 0.2 });
  m.add(G.lathe([[0.17, 0], [0.19, 0.03], [0.09, 0.07], [0.05, 0.12], [0.05, 0.3]]), WHITE(), { p: [0, 0.12, 0.02] });
  m.add(G.rbox(0.13, 0.17, 0.42, 0.045), body, { p: [0, 0.5, -0.02] });                          // receiver
  m.add(G.cyl(0.05, 0.058, 0.18, 14), body, { p: [0, 0.53, 0.27], r: [HALF_PI, 0, 0] });         // barrel
  m.add(G.cyl(0.034, 0.052, 0.06, 14), orange, { p: [0, 0.53, 0.385], r: [HALF_PI, 0, 0] });     // nozzle
  m.add(G.box(0.02, 0.035, 0.05), orange, { p: [0, 0.6, 0.15] });                                // sight
  m.add(G.rbox(0.1, 0.25, 0.13, 0.04), body, { p: [0, 0.33, -0.17], r: [0.3, 0, 0] });           // grip
  m.add(G.torus(0.05, 0.012, 6, 12, Math.PI), orange, { p: [0, 0.415, -0.02], r: [Math.PI, HALF_PI, 0] });   // trigger guard
  m.add(G.box(0.02, 0.06, 0.02), orange, { p: [0, 0.39, -0.03], r: [0.3, 0, 0] });
  m.add(G.rbox(0.075, 0.055, 0.15, 0.02), orange, { p: [0, 0.445, 0.2] });                       // pump slide
  // The tank: clear plastic, half full.
  m.add(G.capsule(0.09, 0.32, 14), M.glass(0xd9fbff, 0.4), { p: [0, 0.7, -0.22], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.capsule(0.07, 0.24, 12), M.paint(0x35b8ff, { gloss: 0.9, glow: 0.45 }), { p: [0, 0.69, -0.18], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.cyl(0.05, 0.05, 0.04, 12), orange, { p: [0, 0.7, -0.235], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.03, 0.03, 0.08, 8), body, { p: [0, 0.61, -0.08] });                              // tank neck
  // A drop forming at the nozzle.
  pulsing(m, [0, 0.53, 0.43], G.sphere(0.028, 8, 6), M.glow(0xbff3ff));
  pulsing(m, [0, 0.42, 0.42], G.sphere(0.018, 8, 6), M.glow(0xbff3ff), 1.6);
}

function showerSniper(m, c) {
  // A riser with a hand shower on a gooseneck: one hole in the rose is a lot
  // more accurate than the rest.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.14 });
  const chrome = CHROME();
  m.add(G.lathe([[0.16, 0], [0.18, 0.025], [0.08, 0.06], [0.06, 0.1]]), chrome, { p: [0, 0.12, -0.12] });
  m.add(G.tube([[0, 0.2, -0.12], [0, 0.5, -0.14], [0, 0.72, -0.12], [0, 0.82, -0.02], [0, 0.78, 0.06]], 0.03, 8), chrome);
  m.add(G.capsule(0.05, 0.3, 12), body, { p: [0, 0.3, -0.13] });                                 // grip sleeve
  // Mixer valve on the riser, with its lever.
  m.add(G.cyl(0.06, 0.06, 0.1, 14), chrome, { p: [0.05, 0.26, -0.13], r: [0, 0, HALF_PI] });
  m.add(G.rbox(0.03, 0.14, 0.04, 0.012), body, { p: [0.11, 0.31, -0.13], r: [0, 0, -0.5] });
  // The hose spirals down the riser to the floor.
  m.add(G.tube(helix(4, (t, cs, sn) => [cs * 0.075, 0.68 - t * 0.5, -0.13 + sn * 0.075]), 0.014, 5), M.paint(0xb9c4d2, { gloss: 0.6 }));
  // The rose, pointing forward and a little down.
  const tilt = HALF_PI + 0.2, ax = [0, -Math.sin(0.2), Math.cos(0.2)];
  const H = [0, 0.74, 0.04];
  const along = d => [H[0], H[1] + ax[1] * d, H[2] + ax[2] * d];
  m.add(G.lathe([[0.035, 0], [0.05, 0.06], [0.13, 0.17], [0.15, 0.22], [0.15, 0.25], [0, 0.25]]), body, { p: H, r: [tilt, 0, 0] });
  m.add(G.torus(0.15, 0.014, 6, 24), chrome, { p: along(0.24), r: [tilt - HALF_PI, 0, 0] });
  m.add(G.cyl(0.125, 0.125, 0.012, 20), BLACK(), { p: along(0.252), r: [tilt, 0, 0] });
  m.add(G.cyl(0.022, 0.03, 0.05, 10), chrome, { p: along(0.275), r: [tilt, 0, 0] });               // the sniper jet
  // A scope clipped along the top.
  m.add(G.cyl(0.025, 0.025, 0.2, 10), BLACK(), { p: [0, 0.88, 0.1], r: [tilt, 0, 0] });
  m.add(G.cyl(0.03, 0.03, 0.02, 10), M.glow(0xff4d4d), { p: [0, 0.862, 0.2], r: [tilt, 0, 0], shadow: false });
  // Ring of lit nozzles turning on the face.
  const ring = m.group({ p: along(0.262), r: [tilt, 0, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ring.add(G.sphere(0.014, 6, 5), M.glow(0xd6f6ff), { p: [Math.cos(a) * 0.085, 0, Math.sin(a) * 0.085], shadow: false });
  }
  m.anim(ring.object, 'spin', { speed: 1.4 });
}

function bathBomber(m, c) {
  // A mortar in a soap dish, loaded with a fizzing bath bomb.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.8, glow: 0.14 });
  const white = WHITE();
  m.add(G.lathe([[0, 0], [0.25, 0], [0.3, 0.04], [0.3, 0.085], [0.26, 0.085], [0.24, 0.04], [0, 0.04]], 24), white, { p: [0, 0.12, 0] });
  const lean = 0.6, B = [0, 0.24, -0.1];
  const ax = [0, Math.cos(lean), Math.sin(lean)];
  const along = d => [0, B[1] + ax[1] * d, B[2] + ax[2] * d];
  m.add(G.lathe([[0.1, 0], [0.145, 0.04], [0.155, 0.3], [0.175, 0.34], [0.175, 0.41], [0.135, 0.41], [0.13, 0.12], [0, 0.1]], 20), body, { p: B, r: [lean, 0, 0] });
  m.add(G.torus(0.158, 0.016, 6, 22), white, { p: along(0.14), r: [lean + HALF_PI, 0, 0] });
  m.add(G.torus(0.178, 0.018, 6, 22), white, { p: along(0.38), r: [lean + HALF_PI, 0, 0] });
  m.add(G.sphere(0.07, 10, 8), CHROME(), { p: along(-0.01) });                                   // breech ball
  // Bipod.
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.13, along(0.3)[1], along(0.3)[2]], [s * 0.2, 0.3, 0.2], [s * 0.21, 0.17, 0.22]], 0.016, 6), CHROME());
  // The round in the mouth.
  const bomb = m.group({ p: along(0.43) });
  bomb.add(G.sphere(0.125, 14, 10), M.paint(0xb78bff, { gloss: 0.25, glow: 0.3 }));
  bomb.add(G.torus(0.126, 0.012, 5, 20), M.paint(0xfff27a, { gloss: 0.3, glow: 0.4 }), { r: [HALF_PI, 0, 0] });
  m.anim(bomb.object, 'pulse');
  // Spare rounds in the dish.
  [[-0.19, -0.1, 0x35c9e8], [0.2, -0.08, 0xfff27a], [-0.1, -0.21, 0x7ee03a]].forEach(([x, z, col]) => {
    m.add(G.sphere(0.065, 10, 8), M.paint(col, { gloss: 0.3, glow: 0.2 }), { p: [x, 0.225, z] });
  });
  // Fizz.
  const fizz = M.glass(0xffffff, 0.45);
  [[0.06, 0.8, 0.22, 0.03], [-0.05, 0.86, 0.2, 0.022], [0.01, 0.9, 0.26, 0.016]].forEach(([x, y, z, r], i) => {
    m.anim(m.add(G.sphere(r, 8, 6), fizz, { p: [x, y, z], shadow: false }), 'float', { offset: i * 1.3 });
  });
}

function coldTap(m, c) {
  // The cold tap, frozen solid: icicle on the spout, ice cubes round the foot.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.2 });
  const chrome = CHROME();
  const ice = M.glass(0xcdf3ff, 0.72);
  m.add(G.lathe([[0.17, 0], [0.185, 0.02], [0.11, 0.05], [0.09, 0.07]]), chrome, { p: [0, 0.12, -0.04] });
  m.add(G.lathe([[0.1, 0], [0.085, 0.1], [0.08, 0.34], [0.115, 0.4], [0.12, 0.48], [0.08, 0.54], [0.035, 0.57]]), body, { p: [0, 0.17, -0.04] });
  m.add(G.torus(0.088, 0.02, 8, 20), chrome, { p: [0, 0.36, -0.04], r: [HALF_PI, 0, 0] });
  m.add(G.torus(0.118, 0.016, 8, 20), chrome, { p: [0, 0.61, -0.04], r: [HALF_PI, 0, 0] });
  m.add(G.tube([[0, 0.61, -0.02], [0, 0.69, 0.12], [0, 0.65, 0.25], [0, 0.52, 0.29]], 0.046, 10), chrome);
  m.add(G.torus(0.046, 0.014, 6, 16), chrome, { p: [0, 0.515, 0.29], r: [HALF_PI, 0, 0] });
  // Cross-head handle, turning.
  const handle = m.group({ p: [0, 0.8, -0.04] });
  handle.add(G.cyl(0.02, 0.025, 0.1, 8), chrome, { p: [0, -0.04, 0] });
  handle.add(G.sphere(0.05, 12, 10), body);
  for (let i = 0; i < 4; i++) {
    const a = i * HALF_PI;
    handle.add(G.cyl(0.018, 0.018, 0.14, 8), chrome, { p: [Math.cos(a) * 0.09, 0, -Math.sin(a) * 0.09], r: [0, a, HALF_PI] });
    handle.add(G.sphere(0.04, 10, 8), body, { p: [Math.cos(a) * 0.17, 0, -Math.sin(a) * 0.17] });
  }
  handle.add(G.cyl(0.03, 0.03, 0.02, 12), M.glow(0xdff6ff), { p: [0, 0.05, 0], shadow: false });
  m.anim(handle.object, 'spin', { speed: 0.9 });
  // Icicles and the drip that never falls.
  m.add(G.cone(0.036, 0.2, 7), ice, { p: [0, 0.4, 0.29], r: [Math.PI, 0, 0], shadow: false });
  m.add(G.cone(0.02, 0.1, 6), ice, { p: [0, 0.59, 0.2], r: [Math.PI, 0, 0], shadow: false });
  m.add(G.cone(0.018, 0.09, 6), ice, { p: [0.03, 0.6, 0.1], r: [Math.PI, 0, 0], shadow: false });
  pulsing(m, [0, 0.27, 0.29], G.sphere(0.026, 8, 6), M.glow(0xdff6ff));
  // Ice cubes and frost round the foot.
  [[0.17, 0.12, 0.3], [-0.17, 0.1, -0.4], [0.06, -0.24, 0.9], [-0.06, 0.22, 0.2]].forEach(([x, z, ry]) => {
    m.add(G.rbox(0.1, 0.1, 0.1, 0.022), ice, { p: [x, 0.175, z], r: [0, ry, 0], shadow: false });
  });
  m.add(G.star(0.09, 0.03, 0.012, 6), M.glow(0xeafaff, 0.9), { p: [-0.19, 0.3, -0.13], r: [0, 0.6, 0], shadow: false });
}

function plunger(m, c) {
  // A sink plunger on a sprung arm. Anything that gets close gets plunged.
  const rubber = c.bodyMat || M.paint(c.color, { gloss: 0.55, glow: 0.14 });
  const wood = M.paint(0xc98f4e, { gloss: 0.4 });
  const chrome = CHROME();
  m.add(G.lathe([[0.2, 0], [0.22, 0.03], [0.12, 0.08], [0.06, 0.13], [0.05, 0.34], [0.085, 0.38], [0, 0.4]]), M.matte(0x2a2d33), { p: [0, 0.12, -0.04] });
  m.add(G.torus(0.07, 0.016, 6, 16), chrome, { p: [0, 0.5, -0.04], r: [HALF_PI, 0, 0] });
  const arm = m.group({ p: [0, 0.6, -0.04], r: [-0.1, 0, 0] });
  arm.add(G.rbox(0.09, 0.09, 0.12, 0.025), chrome, { p: [0, -0.02, -0.02] });                    // yoke
  arm.add(G.cyl(0.028, 0.028, 0.52, 10), wood, { p: [0, 0, -0.08], r: [HALF_PI, 0, 0] });
  arm.add(G.sphere(0.04, 10, 8), wood, { p: [0, 0, -0.35] });
  arm.add(G.tube(helix(5, (t, cs, sn) => [cs * 0.05, sn * 0.05, -0.3 + t * 0.24]), 0.011, 5), chrome);   // spring
  // The cup, open toward the enemy.
  arm.add(G.lathe([[0.035, 0], [0.065, 0.03], [0.1, 0.09], [0.185, 0.17], [0.22, 0.22], [0.2, 0.225], [0.165, 0.18], [0.08, 0.1], [0, 0.08]], 22), rubber, { p: [0, 0, 0.17], r: [HALF_PI, 0, 0] });
  arm.add(G.torus(0.21, 0.016, 6, 24), rubber, { p: [0, 0, 0.39] });
  arm.add(G.torus(0.1, 0.012, 6, 18), M.matte(0x7a1a14), { p: [0, 0, 0.265] });
  m.anim(arm.object, 'bob');
  // The cup is tipped up, so its top lip is frontmost: fire from its centre.
  m.object.userData.muzzle = { x: 0, y: 0.64 * m.scale, z: 0.36 * m.scale };
}

function hairdryer(m, c) {
  // Plugged in, switched on, and far too close to the bath.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.16 });
  const black = BLACK();
  m.add(G.lathe([[0, 0], [0.2, 0], [0.22, 0.03], [0.2, 0.06], [0, 0.06]]), WHITE(), { p: [0, 0.12, -0.04] });
  m.add(G.rbox(0.1, 0.4, 0.12, 0.04), body, { p: [0, 0.36, -0.07], r: [0.15, 0, 0] });           // handle
  m.add(G.rbox(0.04, 0.05, 0.02, 0.008), black, { p: [0, 0.4, 0.0], r: [0.15, 0, 0] });          // switches
  m.add(G.rbox(0.04, 0.03, 0.02, 0.008), M.glow(0xff4d4d), { p: [0, 0.33, -0.012], r: [0.15, 0, 0], shadow: false });
  // The barrel: fat motor housing tapering to the nozzle.
  m.add(G.lathe([[0.1, 0], [0.16, 0.04], [0.17, 0.2], [0.125, 0.33], [0.095, 0.44], [0.085, 0.44], [0.08, 0.36], [0, 0.34]], 22), body, { p: [0, 0.64, -0.22], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.105, 0.105, 0.02, 18), black, { p: [0, 0.64, -0.225], r: [HALF_PI, 0, 0] });     // intake grille
  for (const r of [0.04, 0.075]) m.add(G.torus(r, 0.008, 5, 18), CHROME(), { p: [0, 0.64, -0.238] });
  m.add(G.cyl(0.075, 0.1, 0.1, 16), black, { p: [0, 0.64, 0.26], r: [HALF_PI, 0, 0] });          // concentrator
  m.add(G.cyl(0.06, 0.06, 0.012, 14), M.glow(0xfff7c2), { p: [0, 0.64, 0.306], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.torus(0.168, 0.012, 6, 22), CHROME(), { p: [0, 0.64, -0.04] });
  // Flex and plug.
  m.add(G.tube([[0, 0.19, -0.12], [-0.08, 0.17, -0.24], [-0.21, 0.165, -0.2], [-0.25, 0.165, -0.04], [-0.2, 0.165, 0.08]], 0.016, 6), black);
  m.add(G.rbox(0.09, 0.05, 0.09, 0.015), WHITE(), { p: [-0.18, 0.17, 0.12], r: [0, -0.5, 0] });
  for (const dx of [-0.02, 0.02]) m.add(G.box(0.012, 0.012, 0.06), CHROME(), { p: [-0.155 + dx, 0.17, 0.18], r: [0, -0.5, 0] });
  // Arcing out of the nozzle.
  pulsing(m, [0, 0.64, 0.35], G.sphere(0.04, 10, 8), M.glow(0xfffbd0));
  const arc = M.energy(0xfff7a0, 0.7);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4, pts = [];
    for (let k = 0; k <= 4; k++) {
      const j = (k % 2 ? 1 : -1) * (k && k < 4 ? 0.03 : 0), spread = k * 0.022;
      pts.push([Math.cos(a) * spread - Math.sin(a) * j, 0.64 + Math.sin(a) * spread + Math.cos(a) * j, 0.32 + k * 0.03]);
    }
    m.anim(m.add(G.tube(pts, 0.007, 4), arc, { shadow: false }), 'blink');
  }
  // It is the chain tower, so the measured muzzle would be its top: fire from the nozzle.
  m.object.userData.muzzle = { x: 0, y: 0.64 * m.scale, z: 0.36 * m.scale };
}

const IRON = [[-0.17, -0.26], [0.17, -0.26], [0.2, -0.02], [0.14, 0.2], [0, 0.38], [-0.14, 0.2], [-0.2, -0.02]];

function steamIron(m, c) {
  // A steam iron reared up on a stand, soleplate glowing, nose toward the enemy.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.16 });
  const black = BLACK();
  m.add(G.lathe([[0.18, 0], [0.2, 0.03], [0.08, 0.07], [0.055, 0.12], [0.055, 0.26]]), M.matte(0x2a2d33), { p: [0, 0.12, -0.06] });
  const tip = 0.32;
  const iron = m.group({ p: [0, 0.44, -0.06], r: [-tip, 0, 0] });
  const flat = [HALF_PI, 0, 0];                                              // outline +y becomes forward
  iron.add(G.plate(IRON, 0.035), CHROME(), { p: [0, 0, 0], r: flat });                           // soleplate
  iron.add(G.plate(IRON, 0.02), M.glow(0xff5a14), { p: [0, -0.02, 0], r: flat, s: 0.88, shadow: false });   // the hot side
  iron.add(G.plate(IRON, 0.12), body, { p: [0, 0.075, 0], r: flat, s: [0.95, 0.95, 1] });
  iron.add(G.rbox(0.24, 0.1, 0.3, 0.045), body, { p: [0, 0.16, -0.08] });
  iron.add(G.sphere(0.1, 12, 10), M.glass(0xbfefff, 0.55), { p: [0, 0.15, 0.14], s: [1.1, 0.7, 1.5], shadow: false });   // water tank
  iron.add(G.tube([[0, 0.18, -0.2], [0, 0.31, -0.16], [0, 0.32, 0.06], [0, 0.2, 0.16]], 0.036, 8), black);                // handle
  iron.add(G.cyl(0.05, 0.05, 0.03, 14), M.paint(0xf4f6f8, { gloss: 0.7 }), { p: [0, 0.215, -0.05] });                     // dial
  iron.add(G.box(0.012, 0.012, 0.04), M.glow(0xd92b2b), { p: [0, 0.232, -0.04], shadow: false });
  iron.add(G.cyl(0.03, 0.04, 0.08, 8), black, { p: [0, 0.14, -0.27], r: [HALF_PI + 0.4, 0, 0] });                         // flex grommet
  m.add(G.tube([[0, 0.5, -0.3], [0.08, 0.36, -0.36], [0.16, 0.19, -0.26], [0.22, 0.17, -0.12]], 0.014, 6), black);
  // Where the nose is, in turret space.
  const nose = [0, 0.44 + Math.sin(tip) * 0.38, -0.06 + Math.cos(tip) * 0.38];
  const jet = m.group({ p: [nose[0], nose[1] - 0.01, nose[2]], r: [HALF_PI - tip, 0, 0] });
  jet.add(G.cone(0.05, 0.22, 9), M.energy(0xff7a1a, 0.8), { p: [0, 0.11, 0], shadow: false });
  jet.add(G.cone(0.026, 0.14, 7), M.glow(0xffe9c2), { p: [0, 0.07, 0], shadow: false });
  m.anim(jet.object, 'flame');
  const steam = M.glow(0xffffff, 0.42);
  for (let i = 0; i < 3; i++) {
    pulsing(m, [0.03 * (i - 1), nose[1] + 0.12 + i * 0.075, nose[2] - 0.06 - i * 0.03], G.sphere(0.04 + i * 0.012, 8, 6), steam, i * 1.4);
  }
  // The flex behind balances the nose in front, so the measurement calls it round.
  m.object.userData.muzzle = { x: 0, y: nose[1] * m.scale, z: (nose[2] + 0.02) * m.scale };
}

function shampooRocket(m, c) {
  // The big bottle, fins taped on, shaken hard and pointed at the admiral.
  const gold = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.2 });
  const red = M.paint(0xe5352b, { gloss: 0.8, glow: 0.15 });
  const white = WHITE();
  const chrome = CHROME();
  m.add(G.lathe([[0, 0], [0.26, 0], [0.28, 0.03], [0.26, 0.06], [0, 0.06]], 24), M.matte(0x2a2d33), { p: [0, 0.12, 0] });
  m.add(G.torus(0.22, 0.014, 5, 28), M.paint(0xffe14d, { gloss: 0.5, glow: 0.3 }), { p: [0, 0.182, 0], r: [HALF_PI, 0, 0] });
  const lean = 0.42, B = [0, 0.32, -0.13];
  const ax = [0, Math.cos(lean), Math.sin(lean)];
  const along = d => [0, B[1] + ax[1] * d, B[2] + ax[2] * d];
  // Launch cradle.
  m.add(G.tube([[0, 0.18, -0.22], [0, along(0.1)[1] - 0.02, along(0.1)[2] - 0.17], [0, along(0.36)[1], along(0.36)[2] - 0.17]], 0.016, 6), chrome);
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.17, 0.18, 0.08], [s * 0.15, 0.32, 0.02], [s * 0.1, along(0.2)[1], along(0.2)[2]]], 0.014, 6), chrome);
  const rocket = m.group({ p: B, r: [lean, 0, 0] });
  rocket.add(G.lathe([[0.07, 0], [0.13, 0.03], [0.14, 0.28], [0.125, 0.36], [0.06, 0.42], [0.055, 0.47]], 20), gold);
  rocket.add(G.sleeve(0.143, 0.143, 0.13, 20), white, { p: [0, 0.17, 0] });                      // label
  rocket.add(G.star(0.05, 0.022, 0.01), M.glow(0xff4d8f), { p: [0, 0.17, 0.146], shadow: false });
  rocket.add(G.cyl(0.066, 0.066, 0.05, 14), white, { p: [0, 0.495, 0] });                        // pump collar
  rocket.add(G.rbox(0.05, 0.03, 0.1, 0.012), white, { p: [0, 0.53, 0.04] });                     // pump spout
  rocket.add(G.cone(0.062, 0.11, 14), red, { p: [0, 0.575, 0] });                                // nose cone
  rocket.add(G.cyl(0.05, 0.075, 0.05, 12), BLACK(), { p: [0, -0.025, 0] });                      // nozzle
  for (let i = 0; i < 3; i++) {
    const a = i * (TAU / 3) + HALF_PI;
    rocket.add(G.plate([[0, 0], [0.13, -0.05], [0.13, 0.05], [0, 0.2]], 0.02), red, { p: [Math.cos(a) * 0.125, 0.0, -Math.sin(a) * 0.125], r: [0, a, 0] });
  }
  // Exhaust: foam and fire.
  const fire = m.group({ p: along(-0.05), r: [lean + Math.PI, 0, 0] });
  fire.add(G.cone(0.06, 0.2, 9), M.energy(0xffa23a, 0.85), { p: [0, 0.1, 0], shadow: false });
  fire.add(G.cone(0.03, 0.13, 7), M.glow(0xfff3c2), { p: [0, 0.065, 0], shadow: false });
  m.anim(fire.object, 'flame');
  const foam = M.glass(0xffffff, 0.6);
  for (let i = 0; i < 3; i++) {
    m.anim(m.add(G.sphere(0.035 - i * 0.006, 8, 6), foam, { p: [0, 0.24 + i * 0.03, 0], shadow: false }), 'orbit', { offset: i, radius: 0.25 * m.scale });
  }
  const tipAt = along(0.63);
  m.object.userData.muzzle = { x: 0, y: tipAt[1] * m.scale, z: tipAt[2] * m.scale };
}

const TOWERS = [waterPistol, showerSniper, bathBomber, coldTap, plunger, hairdryer, steamIron, shampooRocket];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the toy is centred on the origin, fits in a
// sphere of radius ~1, faces +Z, and its underside reaches about y = -0.93.

/** A part that moves with the gait; `anim` is read by rendering/enemy-anim.js. */
function part(m, anim, opts) {
  const g = m.group(opts);
  g.object.userData.anim = anim;
  return g;
}

/**
 * A flickering flame. The animator overwrites a flame's X/Y scale, so the mesh
 * sits at scale 1 inside a holder that carries the toy's size.
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

/**
 * The rubber duck every other duck is built on. `o` moves it, `k` sizes it.
 * With `flap`, its stubby wings are handed to the animator.
 */
function duckBody(m, enemy, body, beak, { o = [0, 0, 0], k = 1, flap = false, eye = 0x111111 } = {}) {
  const at = (x, y, z) => [o[0] + x * k, o[1] + y * k, o[2] + z * k];
  m.add(G.sphere(0.7, 18, 14), body, { p: at(0, -0.42, -0.1), s: [0.92 * k, 0.72 * k, 1.15 * k] });
  m.add(G.sphere(0.45, 14, 10), body, { p: at(0, -0.36, 0.38), s: [k, 0.9 * k, k] });            // chest
  m.add(G.cone(0.27, 0.55, 10), body, { p: at(0, -0.1, -0.86), r: [-0.8, 0, 0], s: k });         // perky tail
  m.add(G.sphere(0.43, 16, 12), body, { p: at(0, 0.3, 0.36), s: k });                            // head
  m.add(G.sphere(0.21, 12, 8), beak, { p: at(0, 0.25, 0.8), s: [1.2 * k, 0.42 * k, 1.2 * k] });
  m.add(G.sphere(0.16, 10, 8), beak, { p: at(0, 0.16, 0.76), s: [1.05 * k, 0.32 * k, k] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.08, 10, 8), M.glow(eye), { p: at(s * 0.21, 0.42, 0.7), s: k, shadow: false });
    m.add(G.sphere(0.028, 6, 5), M.glow(0xffffff), { p: at(s * 0.2, 0.455, 0.765), s: k, shadow: false });
  }
  const wings = [1, -1].map(s => {
    const geo = G.sphere(0.34, 12, 8);
    geo.scale(0.3, 0.62, 1);
    geo.translate(s * 0.05, -0.14, 0);                                       // hinged at the shoulder
    return m.add(geo, body, { p: at(s * 0.6, -0.2, -0.12), s: k });
  });
  if (flap) enemy.wings = wings;
}

function rubberDuck(m, enemy, c) {
  const body = M.paint(c.color, { gloss: 0.8, glow: 0.18 });
  duckBody(m, enemy, body, M.paint(c.accent, { gloss: 0.7, glow: 0.2 }), { flap: true });
}

function boiledDuck(m, enemy, c) {
  // Left in the hot tap too long, and furious about it.
  const body = M.paint(c.color, { gloss: 0.8, glow: 0.4 });
  const dark = M.matte(0x4a0d08);
  duckBody(m, enemy, body, M.paint(c.accent, { gloss: 0.7, glow: 0.4 }), { flap: true, eye: 0xfff27a });
  for (const s of [-1, 1]) {
    m.add(G.box(0.22, 0.06, 0.08), dark, { p: [s * 0.2, 0.54, 0.7], r: [0.3, 0, -s * 0.5], shadow: false });   // scowl
    m.add(G.cone(0.08, 0.26, 6), dark, { p: [s * 0.24, 0.72, 0.3], r: [0, 0, -s * 0.4] });                      // horns
  }
  flame(m, enemy, { p: [0, 0.66, 0.3], rad: 0.17, h: 0.55 });
  flame(m, enemy, { p: [0, 0.05, -0.5], rad: 0.2, h: 0.6 });
  flame(m, enemy, { p: [0, 0.05, -1.0], r: [-0.9, 0, 0], rad: 0.14, h: 0.45 });
}

function seaplane(m, enemy, c) {
  // Wind-up tin seaplane: high red wing, two floats, propeller a blur.
  const tin = M.paint(c.color, { gloss: 0.8, glow: 0.14 });
  const red = M.paint(c.accent, { gloss: 0.8, glow: 0.22 });
  const dark = M.matte(0x1c2230);
  m.add(G.capsule(0.27, 1.2, 14), tin, { p: [0, 0, -0.5], r: [HALF_PI, 0, 0] });
  m.add(G.cone(0.25, 0.75, 12), tin, { p: [0, 0.02, -0.72], r: [-HALF_PI, 0, 0] });              // tail boom
  m.add(G.cyl(0.29, 0.27, 0.18, 16), red, { p: [0, 0, 0.62], r: [HALF_PI, 0, 0] });              // cowl
  m.add(G.rbox(2.3, 0.07, 0.52, 0.03), red, { p: [0, 0.36, 0.12] });                             // wing
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.16, 0.16, 0.02, 14), tin, { p: [s * 0.82, 0.4, 0.12] });                       // roundels
    m.add(G.cyl(0.07, 0.07, 0.024, 10), red, { p: [s * 0.82, 0.402, 0.12] });
    m.add(G.cyl(0.03, 0.03, 0.34, 6), dark, { p: [s * 0.24, 0.2, 0.12], r: [0, 0, s * 0.5] });   // wing struts
    // Floats on their struts.
    m.add(G.capsule(0.14, 1.15, 10), tin, { p: [s * 0.44, -0.68, -0.5], r: [HALF_PI, 0, 0] });
    m.add(G.sphere(0.145, 10, 8), red, { p: [s * 0.44, -0.68, 0.52] });
    for (const z of [0.25, -0.2]) m.add(G.tube([[s * 0.44, -0.58, z], [s * 0.2, -0.15, z]], 0.03, 5), dark);
    m.add(G.sphere(0.07, 8, 6), M.glow(0xffffff), { p: [s * 0.12, 0.2, 0.56], shadow: false });  // eyes over the cowl
    m.add(G.sphere(0.035, 6, 5), M.glow(0x111111), { p: [s * 0.12, 0.2, 0.62], shadow: false });
  }
  m.add(G.sphere(0.2, 12, 10), M.paint(0x6fd2ff, { gloss: 0.95, glow: 0.3 }), { p: [0, 0.2, -0.28], s: [0.85, 0.75, 1.35] });   // canopy
  m.add(G.rbox(0.85, 0.05, 0.28, 0.02), red, { p: [0, 0.06, -0.95] });                           // tailplane
  m.add(G.plate([[-0.34, 0], [0, 0], [-0.06, 0.38], [-0.26, 0.38]], 0.05), red, { p: [0, 0.1, -0.72], r: [0, -HALF_PI, 0] });   // fin
  const prop = part(m, { k: 'spin', ax: 'z', sp: 26 }, { p: [0, 0, 0.74] });
  prop.add(G.cone(0.1, 0.2, 10), dark, { p: [0, 0, 0.08], r: [HALF_PI, 0, 0] });
  prop.add(G.box(1.0, 0.11, 0.03), dark);
  prop.add(G.box(0.11, 1.0, 0.03), dark);
  m.add(G.cyl(0.5, 0.5, 0.01, 20), M.glass(0xffffff, 0.16), { p: [0, 0, 0.74], r: [HALF_PI, 0, 0], shadow: false });
}

function submarine(m, enemy, c) {
  // A clockwork tin submarine: riveted, brass-bound, key turning in its back.
  const hull = M.paint(c.color, { gloss: 0.7, glow: 0.12 });
  const brass = M.paint(c.accent, { gloss: 0.85, glow: 0.2 });
  const dark = M.matte(0x1c222c);
  m.add(G.capsule(0.5, 1.9, 16), hull, { p: [0, -0.42, -0.95], r: [HALF_PI, 0, 0] });
  for (const z of [-0.5, 0.42]) m.add(G.torus(0.505, 0.04, 6, 24), brass, { p: [0, -0.42, z] });
  m.add(G.rbox(0.4, 0.42, 0.6, 0.13), hull, { p: [0, 0.2, -0.02] });                             // conning tower
  m.add(G.torus(0.2, 0.03, 6, 18), brass, { p: [0, 0.41, -0.02], r: [HALF_PI, 0, 0], s: [1, 1.4, 1] });
  m.add(G.tube([[0, 0.35, 0.08], [0, 0.82, 0.08], [0, 0.85, 0.26]], 0.05, 7), brass);            // periscope
  m.add(G.sphere(0.07, 8, 6), M.glow(0x9fe9ff), { p: [0, 0.85, 0.29], shadow: false });
  for (const s of [-1, 1]) {
    for (const z of [0.25, -0.2]) {
      m.add(G.cyl(0.13, 0.13, 0.05, 14), brass, { p: [s * 0.47, -0.3, z], r: [0, 0, HALF_PI] });   // portholes
      m.add(G.cyl(0.085, 0.085, 0.06, 12), M.glow(0xbff3ff), { p: [s * 0.475, -0.3, z], r: [0, 0, HALF_PI], shadow: false });
    }
    m.add(G.rbox(0.42, 0.05, 0.26, 0.02), brass, { p: [s * 0.62, -0.5, 0.5] });                  // dive planes
    m.add(G.rbox(0.4, 0.05, 0.26, 0.02), brass, { p: [s * 0.4, -0.42, -0.82] });
    // Headlamp eyes, glowering.
    m.add(G.sphere(0.14, 10, 8), M.glow(0xfff7c2), { p: [s * 0.2, -0.3, 0.84], shadow: false });
    m.add(G.sphere(0.07, 8, 6), M.glow(0x111111), { p: [s * 0.19, -0.31, 0.95], shadow: false });
    m.add(G.box(0.3, 0.07, 0.1), dark, { p: [s * 0.2, -0.14, 0.86], r: [0.5, 0, -s * 0.35], shadow: false });
  }
  m.add(G.rbox(0.05, 0.66, 0.3, 0.02), brass, { p: [0, -0.42, -0.82] });                         // rudder
  const prop = part(m, { k: 'spin', ax: 'z', sp: 14 }, { p: [0, -0.42, -1.0] });
  prop.add(G.cone(0.09, 0.18, 8), brass, { p: [0, 0, -0.06], r: [-HALF_PI, 0, 0] });
  for (let i = 0; i < 3; i++) prop.add(G.box(0.56, 0.13, 0.03), brass, { r: [0, 0, i * Math.PI / 3] });
  // The wind-up key.
  const key = part(m, { k: 'spin', ax: 'y', sp: 3.2 }, { p: [0, 0.05, -0.6] });
  key.add(G.cyl(0.035, 0.035, 0.34, 8), brass, { p: [0, 0.15, 0] });
  for (const s of [-1, 1]) key.add(G.torus(0.12, 0.04, 6, 16), brass, { p: [s * 0.14, 0.4, 0] });
}

function pirateDuck(m, enemy, c) {
  // Bicorne hat, red bandana, a cannon strapped to its back with the fuse lit.
  const body = M.paint(c.color, { gloss: 0.75, glow: 0.1 });
  const red = M.paint(c.accent, { gloss: 0.6, glow: 0.35 });
  const black = M.matte(0x0d0f14);
  const bone = M.paint(0xf4f1e6, { gloss: 0.4, glow: 0.2 });
  duckBody(m, enemy, body, M.paint(0xffa21f, { gloss: 0.7, glow: 0.25 }), { eye: 0xffffff });
  m.add(G.torus(0.4, 0.07, 6, 22), red, { p: [0, 0.5, 0.36], r: [HALF_PI + 0.12, 0, 0] });       // bandana
  m.add(G.cone(0.09, 0.3, 5), red, { p: [-0.4, 0.4, 0.02], r: [0, 0, 2.4] });                    // its knot
  m.add(G.sphere(0.11, 10, 8), black, { p: [0.21, 0.42, 0.69], s: [1, 1, 0.5] });                // eye patch
  m.add(G.sphere(0.04, 6, 5), M.glow(0x111111), { p: [-0.2, 0.42, 0.775], shadow: false });      // the eye that is left
  // The hat, broadside on.
  m.add(G.plate([[-0.66, 0], [-0.52, 0.22], [-0.2, 0.42], [0, 0.5], [0.2, 0.42], [0.52, 0.22], [0.66, 0], [0.3, -0.07], [-0.3, -0.07]], 0.34), black, { p: [0, 0.66, 0.32] });
  m.add(G.sphere(0.1, 10, 8), bone, { p: [0, 0.88, 0.5], s: [1, 1, 0.5] });                      // skull
  for (const rz of [0.7, -0.7]) m.add(G.rbox(0.34, 0.05, 0.03, 0.012), bone, { p: [0, 0.78, 0.5], r: [0, 0, rz] });
  m.add(G.torus(0.07, 0.02, 5, 12), M.paint(0xffcc33, { gloss: 0.9, glow: 0.3 }), { p: [0.44, 0.2, 0.3], r: [0, HALF_PI, 0] });   // earring
  // The cannon.
  const iron = M.paint(0x555c68, { gloss: 0.6 });
  m.add(G.cyl(0.14, 0.2, 0.75, 12), iron, { p: [0, 0.2, -0.42], r: [1.0, 0, 0] });
  m.add(G.torus(0.15, 0.04, 6, 16), red, { p: [0, 0.38, -0.14], r: [1.0 - HALF_PI, 0, 0] });
  m.add(G.sphere(0.2, 10, 8), iron, { p: [0, 0.0, -0.73] });
  flame(m, enemy, { p: [0, 0.14, -0.78], rad: 0.1, h: 0.42, color: 0xffc04a });
}

function bottleRocket(m, enemy, c) {
  // A firework on a stick, lit, and aimed at the bath.
  const body = M.paint(c.color, { gloss: 0.8, glow: 0.3 });
  const yellow = M.paint(c.accent, { gloss: 0.8, glow: 0.4 });
  const white = M.paint(0xf4f6f8, { gloss: 0.6, glow: 0.15 });
  m.add(G.cyl(0.3, 0.3, 1.1, 16), body, { p: [0, 0, -0.05], r: [HALF_PI, 0, 0] });
  for (const z of [0.28, -0.3]) m.add(G.cyl(0.305, 0.305, 0.13, 16), white, { p: [0, 0, z], r: [HALF_PI, 0, 0] });
  m.add(G.cone(0.33, 0.62, 16), yellow, { p: [0, 0, 0.8], r: [HALF_PI, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = i * HALF_PI + Math.PI / 4;
    const geo = G.plate([[0, 0.35], [0.4, -0.12], [0.4, -0.34], [0, -0.06]], 0.05);
    geo.rotateX(HALF_PI);                                                    // outline +y becomes forward
    m.add(geo, yellow, { p: [Math.cos(a) * 0.27, Math.sin(a) * 0.27, -0.55], r: [0, 0, a] });
  }
  m.add(G.cyl(0.035, 0.035, 0.9, 6), M.paint(0xc98f4e, { gloss: 0.3 }), { p: [0, -0.33, -0.85], r: [HALF_PI, 0, 0] });   // the stick
  m.add(G.star(0.16, 0.07, 0.02), yellow, { p: [0, 0.305, -0.02], r: [-HALF_PI, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.12, 10, 8), M.glow(0xffffff), { p: [s * 0.2, 0.17, 0.44], shadow: false });
    m.add(G.sphere(0.06, 8, 6), M.glow(0x111111), { p: [s * 0.2, 0.18, 0.54], shadow: false });
    m.add(G.box(0.26, 0.06, 0.08), M.matte(0x2a0a2c), { p: [s * 0.2, 0.31, 0.46], r: [0.2, 0, -s * 0.45], shadow: false });
  }
  flame(m, enemy, { p: [0, 0, -0.6], r: [-HALF_PI, 0, 0], rad: 0.24, h: 0.95, color: 0xff7a1a });
  flame(m, enemy, { p: [0, 0, -0.6], r: [-HALF_PI, 0, 0], rad: 0.12, h: 0.6, color: 0xfff27a });
}

const HULL = [[-0.56, -1.02], [0.56, -1.02], [0.64, 0.3], [0.34, 0.95], [0, 1.22], [-0.34, 0.95], [-0.64, 0.3]];

function admiralQuack(m, enemy, c) {
  // The fleet's flagship: a very large duck in a very small battleship.
  const body = M.paint(c.color, { gloss: 0.8, glow: 0.2 });
  const navy = M.paint(c.accent, { gloss: 0.6, glow: 0.1 });
  const grey = M.paint(0x8a95a3, { gloss: 0.6, glow: 0.06 });
  const dark = M.matte(0x2a313c);
  const gold = M.paint(0xffcc33, { gloss: 0.95, glow: 0.35 });
  const white = M.paint(0xf7f9fb, { gloss: 0.7, glow: 0.12 });
  const flat = [HALF_PI, 0, 0];                                              // outline +y becomes forward
  m.add(G.plate(HULL, 0.4), grey, { p: [0, -0.72, 0], r: flat });
  m.add(G.plate(HULL, 0.13), M.paint(0xd92b2b, { gloss: 0.6, glow: 0.15 }), { p: [0, -0.87, 0], r: flat, s: [1.03, 1.02, 1] });   // boot topping
  m.add(G.plate(HULL, 0.03), M.paint(0xc9a26a, { gloss: 0.3 }), { p: [0, -0.515, 0], r: flat, s: [0.9, 0.93, 1] });               // deck
  for (const s of [-1, 1]) for (const z of [-0.6, -0.2, 0.2]) {
    m.add(G.sphere(0.06, 8, 6), M.glow(0xfff7c2), { p: [s * 0.6, -0.68, z], shadow: false });    // portholes
  }
  // Forward turret, twin guns.
  m.add(G.cyl(0.2, 0.24, 0.17, 12), dark, { p: [0, -0.42, 0.72] });
  for (const s of [-1, 1]) m.add(G.cyl(0.045, 0.05, 0.46, 8), dark, { p: [s * 0.08, -0.4, 0.98], r: [HALF_PI - 0.12, 0, 0] });
  // Funnel and ensign aft.
  m.add(G.cyl(0.13, 0.16, 0.42, 12), dark, { p: [0, -0.3, -0.8] });
  m.add(G.cyl(0.14, 0.14, 0.08, 12), gold, { p: [0, -0.17, -0.8] });
  m.add(G.cyl(0.02, 0.02, 0.6, 5), dark, { p: [0.4, -0.22, -0.92] });
  m.add(G.plate([[0, 0], [0.34, -0.1], [0, -0.2]], 0.02), M.paint(0xd92b2b, { gloss: 0.5, glow: 0.3 }), { p: [0.4, 0.08, -0.92], r: [0, HALF_PI, 0] });
  // The admiral.
  const o = [0, 0.22, -0.12], k = 0.8;
  duckBody(m, enemy, body, M.paint(0xff8a1f, { gloss: 0.7, glow: 0.25 }), { o, k });
  const at = (x, y, z) => [o[0] + x * k, o[1] + y * k, o[2] + z * k];
  m.add(G.torus(0.36, 0.09, 6, 20), navy, { p: at(0, -0.02, 0.33), r: [HALF_PI - 0.2, 0, 0], s: k });   // collar
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.17, 10, 8), gold, { p: at(s * 0.56, 0.1, -0.05), s: [k, 0.5 * k, k] });            // epaulettes
    m.add(G.box(0.24, 0.06, 0.08), dark, { p: at(s * 0.21, 0.54, 0.7), r: [0.3, 0, -s * 0.35], shadow: false });
  }
  for (let i = 0; i < 3; i++) m.add(G.sphere(0.055, 8, 6), i === 1 ? gold : white, { p: at(-0.2 + i * 0.12, -0.16, 0.78), shadow: false });   // medals
  m.add(G.torus(0.11, 0.02, 5, 16), gold, { p: at(0.21, 0.42, 0.76), s: k });                    // monocle
  // Peaked cap.
  m.add(G.cyl(0.36, 0.36, 0.13, 18), navy, { p: at(0, 0.72, 0.3), s: k });
  m.add(G.lathe([[0.36, 0], [0.48, 0.1], [0.46, 0.18], [0, 0.22]], 18), white, { p: at(0, 0.78, 0.3), s: k });
  m.add(G.sphere(0.3, 12, 8), dark, { p: at(0, 0.67, 0.62), s: [1.1 * k, 0.16 * k, 0.8 * k] });   // peak
  m.add(G.torus(0.365, 0.03, 5, 20), gold, { p: at(0, 0.72, 0.3), r: [HALF_PI, 0, 0], s: k });
  // Cap badge (animated as the boss gem).
  const badge = m.group({ p: at(0, 0.8, 0.68) });
  badge.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.star(0.13, 0.06, 0.05), M.glow(0xffe14d));
  badge.object.add(enemy.crownGem);
}

const ENEMIES = {
  SWARM: rubberDuck,
  FIRE: boiledDuck,
  FLYING: seaplane,
  ARMORED: submarine,
  ELITE: pirateDuck,
  FLYING_FIRE: bottleRocket,
  BOSS: admiralQuack
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: tub tiles seen through bathwater, caustics, soap suds. */
function paintFloor(ctx, size) {
  // The same floor every time: a small seeded generator instead of Math.random.
  let seed = 20261;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const n = 4, cell = size / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const g = ctx.createLinearGradient(x * cell, y * cell, (x + 1) * cell, (y + 1) * cell);
      const deep = (x * 3 + y * 5) % 4 === 0;
      g.addColorStop(0, deep ? '#2596b8' : '#30a8c6');
      g.addColorStop(1, deep ? '#1b7fa3' : '#2392b3');
      ctx.fillStyle = g;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  // Pale grout, softened by the water over it.
  ctx.strokeStyle = 'rgba(225, 250, 255, 0.34)';
  ctx.lineWidth = 5;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size);
    ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell);
    ctx.stroke();
  }
  // Caustics: wobbling threads of light on the tub floor.
  ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const x = 30 + rnd() * (size - 60), y = 30 + rnd() * (size - 60);
    const a = rnd() * Math.PI * 2, len = 16 + rnd() * 26;
    ctx.strokeStyle = `rgba(235, 255, 255, ${0.1 + rnd() * 0.12})`;
    ctx.lineWidth = 1.5 + rnd() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a + 0.9) * len * 0.6, y + Math.sin(a + 0.9) * len * 0.6, x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  // Rafts of suds, and loose bubbles.
  for (let k = 0; k < 4; k++) {
    const cx = 70 + rnd() * (size - 140), cy = 70 + rnd() * (size - 140);
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 34, r = 5 + rnd() * 9;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rnd() * 0.3})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(120, 200, 225, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  for (let i = 0; i < 26; i++) {
    const x = 14 + rnd() * (size - 28), y = 14 + rnd() * (size - 28), r = 2.5 + rnd() * 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2); ctx.fill();
  }
}

/** A pump bottle, `h` tall. */
function pumpBottle(m, color, { p = [0, 0, 0], k = 1 } = {}) {
  const at = (x, y, z) => [p[0] + x * k, p[1] + y * k, p[2] + z * k];
  m.add(G.lathe([[0.2, 0], [0.23, 0.04], [0.23, 0.5], [0.13, 0.62], [0.08, 0.64], [0.08, 0.7]], 18), M.paint(color, { gloss: 0.85, glow: 0.1 }), { p: at(0, 0, 0), s: k });
  m.add(G.sleeve(0.234, 0.234, 0.22, 18), M.paint(0xf7f9fb, { gloss: 0.3 }), { p: at(0, 0.28, 0), s: k });
  const white = M.paint(0xf4f6f8, { gloss: 0.7 });
  m.add(G.cyl(0.095, 0.095, 0.07, 12), white, { p: at(0, 0.73, 0), s: k });
  m.add(G.cyl(0.025, 0.025, 0.14, 8), white, { p: at(0, 0.83, 0), s: k });
  m.add(G.rbox(0.09, 0.05, 0.26, 0.02), white, { p: at(0, 0.91, 0.07), s: k });
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // shampoo
      pumpBottle(m, 0x8b5cf6);
      break;
    }
    case 1: { // bar of soap in its dish, lathered
      m.add(G.lathe([[0, 0], [0.34, 0], [0.42, 0.06], [0.42, 0.1], [0.36, 0.1], [0.32, 0.05], [0, 0.05]], 20), M.paint(0xf7f9fb, { gloss: 0.9 }), { p: [0, 0, 0], s: [1, 1, 0.75] });
      m.add(G.rbox(0.5, 0.17, 0.32, 0.075), M.paint(0x9be3d0, { gloss: 0.6, glow: 0.1 }), { p: [0, 0.15, 0], r: [0, 0.2, 0.08] });
      const suds = M.glass(0xffffff, 0.7);
      for (const [x, y, z, r] of [[0.16, 0.27, 0.06, 0.07], [0.08, 0.3, -0.04, 0.05], [0.22, 0.24, -0.06, 0.045], [-0.2, 0.12, 0.2, 0.05]]) {
        m.add(G.sphere(r, 8, 6), suds, { p: [x, y, z] });
      }
      break;
    }
    case 2: { // sponge with a scourer back
      m.add(G.rbox(0.58, 0.24, 0.4, 0.07), M.paint(0xffa63d, { gloss: 0.1, glow: 0.08 }), { p: [0, 0.12, 0] });
      m.add(G.rbox(0.58, 0.07, 0.4, 0.03), M.matte(0x2f8f5a), { p: [0, 0.27, 0] });
      for (const [x, z] of [[-0.18, 0.201], [0.02, 0.201], [0.2, 0.201]]) m.add(G.sphere(0.03, 6, 5), M.matte(0xb86f1c), { p: [x, 0.1 + (x > 0 ? 0.05 : 0), z] });
      break;
    }
    case 3: { // toy sailing boat
      const flat = [Math.PI / 2, 0, 0];
      m.add(G.plate([[-0.17, -0.3], [0.17, -0.3], [0.2, 0.1], [0, 0.4], [-0.2, 0.1]], 0.16), M.paint(0xe5352b, { gloss: 0.8, glow: 0.1 }), { p: [0, 0.08, 0], r: flat });
      m.add(G.plate([[-0.17, -0.3], [0.17, -0.3], [0.2, 0.1], [0, 0.4], [-0.2, 0.1]], 0.02), M.paint(0xf7f9fb, { gloss: 0.6 }), { p: [0, 0.17, 0], r: flat, s: [0.9, 0.9, 1] });
      m.add(G.cyl(0.015, 0.015, 0.62, 6), M.paint(0xc98f4e), { p: [0, 0.48, 0] });
      m.add(G.plate([[0, 0], [0.32, 0], [0, 0.5]], 0.012), M.paint(0xf7f9fb, { gloss: 0.3, glow: 0.12 }), { p: [0, 0.24, -0.02], r: [0, Math.PI / 2, 0] });
      m.add(G.plate([[0, 0], [-0.22, 0], [0, 0.38]], 0.012), M.paint(0x35c9e8, { gloss: 0.3, glow: 0.15 }), { p: [0, 0.26, 0.03], r: [0, Math.PI / 2, 0] });
      break;
    }
    default: { // tooth mug and two brushes
      m.add(G.lathe([[0.19, 0], [0.22, 0.02], [0.24, 0.42], [0.215, 0.42], [0.195, 0.05], [0, 0.05]], 18), M.paint(0xff7ab8, { gloss: 0.85, glow: 0.08 }), { p: [0, 0, 0] });
      [[0.1, 0.25, 0x35c9e8], [-0.08, -0.3, 0x7ee03a]].forEach(([x, rz, col]) => {
        const brush = m.group({ p: [x, 0.05, 0], r: [0.1, 0, rz] });
        brush.add(G.cyl(0.022, 0.026, 0.72, 8), M.paint(col, { gloss: 0.8, glow: 0.12 }), { p: [0, 0.36, 0] });
        brush.add(G.rbox(0.05, 0.16, 0.035, 0.012), M.paint(col, { gloss: 0.8, glow: 0.12 }), { p: [0, 0.76, 0] });
        brush.add(G.rbox(0.045, 0.14, 0.06, 0.01), M.paint(0xf7f9fb, { gloss: 0.2 }), { p: [0, 0.76, 0.04] });
      });
    }
  }
  return g;
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => { g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };

  // The taps, looming over the far end of the bath: hot, cold, one big spout.
  const taps = new THREE.Group();
  let m = modeller(taps, 1);
  const chrome = M.metal(0xd7dde5, { rough: 0.2 });
  const tile = M.paint(0xe6f0f3, { gloss: 0.85 });
  m.add(G.rbox(17, 8.5, 1, 0.3), tile, { p: [0, 4.25, -1.6] });                                  // the tiled end wall
  m.add(G.box(17.02, 0.5, 1.02), M.paint(0x16a3b8, { gloss: 0.8, glow: 0.12 }), { p: [0, 6.6, -1.6] });
  m.add(G.box(17.02, 0.16, 1.02), M.paint(0xff7ab8, { gloss: 0.8, glow: 0.15 }), { p: [0, 6.1, -1.6] });
  m.add(G.lathe([[1.5, 0], [1.6, 0.25], [1.0, 0.6], [0.8, 1.6], [1.0, 2.0], [0, 2.2]], 20), chrome, { p: [0, 3.2, -0.6] });
  m.add(G.tube([[0, 5.0, -0.6], [0, 6.5, 0.8], [0, 6.1, 2.6], [0, 4.6, 3.1]], 0.6, 12), chrome);
  m.add(G.torus(0.6, 0.16, 8, 20), chrome, { p: [0, 4.55, 3.1], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.26, 0.38, 4.5, 10), M.energy(0xbfefff, 0.3), { p: [0, 2.3, 3.1], shadow: false });   // running water
  [[-4.2, 0xe5352b], [4.2, 0x2f8bff]].forEach(([x, col]) => {
    const paint = M.paint(col, { gloss: 0.85, glow: 0.25 });
    m.add(G.lathe([[1.0, 0], [1.1, 0.2], [0.6, 0.5], [0.5, 1.7], [0.75, 2.0], [0.3, 2.3]], 16), chrome, { p: [x, 3.2, -0.6] });
    m.add(G.sphere(0.45, 12, 10), paint, { p: [x, 5.9, -0.6] });
    for (let i = 0; i < 4; i++) {
      const a = i * HALF_PI + 0.5;
      m.add(G.cyl(0.14, 0.14, 1.1, 8), chrome, { p: [x + Math.cos(a) * 0.75, 5.9, -0.6 - Math.sin(a) * 0.75], r: [0, a, HALF_PI] });
      m.add(G.sphere(0.32, 10, 8), paint, { p: [x + Math.cos(a) * 1.35, 5.9, -0.6 - Math.sin(a) * 1.35] });
    }
  });
  place(taps, 0, -hh - 9.5);

  // A rubber duck the size of a car, watching the battle from the side.
  const bigDuck = new THREE.Group();
  m = modeller(bigDuck, 3.4);
  duckBody(m, {}, M.paint(0xffd21a, { gloss: 0.8, glow: 0.12 }), M.paint(0xff7a1a, { gloss: 0.7, glow: 0.15 }), { o: [0, 0.94, 0] });
  place(bigDuck, -hw - 8.5, -hh * 0.25, HALF_PI);

  // Bottles lined up along the rim.
  const bottles = new THREE.Group();
  m = modeller(bottles, 1);
  pumpBottle(m, 0x8b5cf6, { p: [0, 0, 0], k: 6.5 });
  pumpBottle(m, 0x2fbf8a, { p: [2.6, 0, 2.2], k: 5 });
  m.add(G.lathe([[1.0, 0], [1.15, 0.2], [1.15, 3.6], [0.5, 4.5], [0.45, 5.0]], 18), M.paint(0xff7ab8, { gloss: 0.85, glow: 0.12 }), { p: [-2.6, 0, 1.6] });
  m.add(G.cyl(0.55, 0.55, 0.6, 14), M.paint(0xf7f9fb, { gloss: 0.7 }), { p: [-2.6, 5.2, 1.6] });
  place(bottles, -hw - 8, hh * 0.9, 0.5);

  // A pink sponge and a bar of soap in the far corner.
  const sponge = new THREE.Group();
  m = modeller(sponge, 1);
  m.add(G.rbox(4.6, 2.0, 3.2, 0.5), M.paint(0xffa63d, { gloss: 0.1, glow: 0.1 }), { p: [0, 1.0, 0] });
  m.add(G.rbox(4.6, 0.5, 3.2, 0.2), M.matte(0x2f8f5a), { p: [0, 2.2, 0] });
  m.add(G.rbox(2.8, 1.0, 1.9, 0.45), M.paint(0x9be3d0, { gloss: 0.6, glow: 0.12 }), { p: [0.3, 2.95, 0.1], r: [0, 0.4, 0] });
  place(sponge, -hw - 8, -hh - 8.5, 0.4);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0xffd21a, accent: ctx.accent ?? 0xff7a1a });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
