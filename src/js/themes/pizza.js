// PIZZA DELIVERY DASH
//
// Somebody left the back door open and the whole neighbourhood smelled the
// oven. The arena is the floor of a little pizzeria — checker tiles, flour
// everywhere, the brick oven roaring at the far wall — and the pests are
// coming for the counter: raccoons, a chilli with a temper, a gull, an
// armoured pineapple (nobody ordered it), a food critic and, worst of all, the
// Health Inspector. The towers are whatever was to hand in the kitchen.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'pizza',
  name: 'Pizza Delivery Dash',
  shortName: 'Pizza',
  icon: 'pizzaslice',
  sortOrder: 100,
  description: 'The pests smelled the oven. Hold the pizzeria floor with the kitchen\'s tools before they reach the counter.',
  color: '#ff5a3c',
  groundColor: 0xead7b4,
  pathColor: 0x8a4a32,
  envColor: 0x1a0f0c,
  environmentSkin: { arena: 'pizzeria', floor: 'checker tile', markerIcon: '🍕' },
  enemySkin: { body: 'pests', icon: 'pizzaslice' },
  recommendedTowers: ['t1', 't3', 't4'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Dough Slinger', icon: 'standmixer', clr: '#ffb347' },
    t2: { nm: 'Pizza Peel Sniper', icon: 'pizzapeel', clr: '#e8433a' },
    t3: { nm: 'Sauce Ladle', icon: 'sauceladle', clr: '#ff6b4a' },
    t4: { nm: 'Mozzarella Stretcher', icon: 'cheesepull', clr: '#ffe27a' },
    t5: { nm: 'Rolling Pin', icon: 'rollingpin', clr: '#d99a4e' },
    t6: { nm: 'Garlic Zapper', icon: 'garlicbulb', clr: '#c9ff6a' },
    t7: { nm: 'Wood-Fired Oven', icon: 'pizzaoven', clr: '#ff7a1f' },
    t8: { nm: 'Golden Pizza Cutter', icon: 'pizzacutter', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Hungry Raccoon' },
    e2: { nm: 'Hot Pepper Gremlin' },
    e3: { nm: 'Greedy Seagull' },
    e4: { nm: 'Armoured Pineapple' },
    e5: { nm: 'Food Critic' },
    e6: { nm: 'Flaming Calzone' },
    e7: { nm: 'The Health Inspector' }
  },
  maps: [
    ['Grand Opening', 'A simple run to the counter - learn the basics'],
    ['Takeaway Window', 'Open centre, two ways in'],
    ['Topping Bar', 'Tight lanes between the tubs'],
    ['Delivery Route', 'Long run, heavy traffic'],
    ['Friday Rush', 'They come from everywhere'],
    ['Thin Crust', 'Narrow and fast'],
    ['Oven Floor', 'Wide open and hot'],
    ['Extra Toppings', 'Mixed pressure, little room'],
    ['Family Size', 'The big spread'],
    ['Closing Time', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x1a0f0c,
    fog: 0x24140f,
    fogDensity: 0.006,
    floor: {
      base: '#efe2c8',
      meshColor: 0xa8998a,
      roughness: 0.42,
      metalness: 0.03,
      emissive: 0x2a1208,
      emissiveIntensity: 0.06
    },
    rail: { color: 0x2f8a3a, roughness: 0.5, metalness: 0.05 },
    path: { color: 0x3a2620, emissive: 0x1a0c08, opacity: 0.42, edge: 0xff5a3c },
    buildZone: { color: 0xfff3d6, opacity: 0.1, line: 0xff5a3c },
    obstacle: { accent: 0xf3ead8 },
    base: { color: 0xffc94a, icon: 'GUARD THE COUNTER' },
    spawn: { color: 0x3fbf5a, icon: 'BACK DOOR' }
  },
  lighting: {
    hemiSky: 0xffe2bc,
    hemiGround: 0x2c1a14,
    hemiIntensity: 0.42,
    sun: 0xffd29a,
    sunIntensity: 0.9,
    rim: 0xff6a3a,
    rimIntensity: 0.32,
    accent: 0xff5a3c,
    spotIntensity: 2.3,
    exposure: 0.72
  },
  ui: { accent: '#ff5a3c', dark: '#1a0f0c' },
  crowd: { fans: [0xff5a3c, 0xfbf7ee, 0x2f8a3a, 0xffc94a, 0xd8322a], seat: 0x3a2018 },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    // A ball of dough, lobbed.
    ball: { mesh: 'ball', flight: 'lob', trail: 'dust', impact: 'spark', color: 0xf6e2b8, speed: 11, size: 0.72 },
    // A slice of pepperoni, frisbeed off the peel.
    curveBall: { mesh: 'puck', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xe8433a, speed: 14 },
    // A ladle of hot sauce.
    headButt: { mesh: 'orb', flight: 'lob', trail: 'dust', impact: 'ring', color: 0xe23a1e, speed: 8.5, size: 1.15 },
    // Strings of mozzarella.
    tackle: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0xffe9a0, speed: 9.5 },
    // The rolling pin's bonk.
    glove: { mesh: 'block', flight: 'punch', trail: 'dust', impact: 'slam', color: 0xd99a4e, speed: 8.8, size: 1.2 },
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xd6ff7a, speed: 15 },
    flare: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff6a14, speed: 11, size: 0.85 },
    legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0x8a8d96, accent: 0x26272d },
    fire: { body: 'bug', color: 0xe0301e, accent: 0x3a9a2a },
    flying: { body: 'bug', color: 0xf4f6f8, accent: 0xffb020 },
    armored: { body: 'bug', color: 0xe6a21e, accent: 0x3f9a3a },
    elite: { body: 'bug', color: 0x2a2440, accent: 0xc8322a },
    flying_fire: { body: 'bug', color: 0xc8742c, accent: 0xff5a14 },
    boss: { body: 'bug', color: 0xeef2f5, accent: 0x2a5ad8 }
  },
  towers: { family: 'pizza', base: 0x2a1812, metal: 0xd7dde5, levelGlow: 0xff5a3c }
};

// ── Shared surfaces ─────────────────────────────────────────────────────────

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

const STEEL = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);
const WOOD = () => M.paint(0xd2a066, { gloss: 0.3 });
const DARKWOOD = () => M.paint(0x6a3e22, { gloss: 0.3 });
const CRUST = () => M.paint(0xe2a95c, { gloss: 0.35, glow: 0.1 });
const DOUGH = () => M.paint(0xf6e6c6, { gloss: 0.25, glow: 0.12 });
const SAUCE = () => M.paint(0xc8301c, { gloss: 0.75, glow: 0.16 });
const CHEESE = () => M.paint(0xffd866, { gloss: 0.55, glow: 0.2 });
const PEPPERONI = () => M.paint(0xb3261a, { gloss: 0.6, glow: 0.12 });
const BASIL = () => M.paint(0x2f8a3a, { gloss: 0.5, glow: 0.1 });
const WHITE = () => M.paint(0xfbf7ee, { gloss: 0.6 });
const GOLD = () => M.metal(0xffcc33, { rough: 0.25 });
const COPPER = () => M.metal(0xc97a3a, { rough: 0.3 });

/** Where shots leave the figure, in model units (see rendering/tower-meshes.js). */
function muzzle(m, x, y, z) {
  m.object.userData.muzzle = { x: x * m.scale, y: y * m.scale, z: z * m.scale };
}

/**
 * A whole pizza lying flat, radius `R`, its underside at the group origin:
 * crust ring, sauce, cheese, pepperoni and a leaf or two of basil.
 */
function pie(m, { p = [0, 0, 0], r = [0, 0, 0], R = 0.3, pep = 7, basil = 3 } = {}) {
  const g = m.group({ p, r });
  g.add(G.cyl(R * 0.96, R, R * 0.08, 28), CRUST(), { p: [0, R * 0.04, 0] });
  g.add(G.torus(R * 0.92, R * 0.1, 8, 28), CRUST(), { p: [0, R * 0.1, 0], r: [HALF_PI, 0, 0] });
  g.add(G.cyl(R * 0.86, R * 0.86, R * 0.03, 26), SAUCE(), { p: [0, R * 0.095, 0] });
  g.add(G.cyl(R * 0.8, R * 0.8, R * 0.03, 22), CHEESE(), { p: [0, R * 0.115, 0] });
  for (let i = 0; i < pep; i++) {
    const a = (i / Math.max(1, pep - 1)) * TAU + 0.3, d = i === pep - 1 ? 0 : R * 0.52;
    g.add(G.cyl(R * 0.15, R * 0.15, R * 0.035, 14), PEPPERONI(), { p: [Math.cos(a) * d, R * 0.14, Math.sin(a) * d] });
  }
  for (let i = 0; i < basil; i++) {
    const a = i * 2.2 + 1.1;
    g.add(G.sphere(R * 0.1, 8, 6), BASIL(), { p: [Math.cos(a) * R * 0.3, R * 0.15, Math.sin(a) * R * 0.3], r: [0, a, 0], s: [1.6, 0.25, 0.9] });
  }
  return g;
}

/** A single slice, tip toward +Z, lying in its own XZ plane, `k` times a 0.5-long slice. */
function slice(m, { p = [0, 0, 0], r = [0, 0, 0], k = 1 } = {}) {
  const g = m.group({ p, r });
  const tri = G.plate([[0, 0.5], [-0.24, 0], [0.24, 0]], 0.05);
  g.add(tri, CHEESE(), { r: [HALF_PI, 0, 0], s: k });
  g.add(G.plate([[0, 0.44], [-0.2, 0.03], [0.2, 0.03]], 0.06), CHEESE(), { p: [0, 0.006 * k, 0.02 * k], r: [HALF_PI, 0, 0], s: k });
  g.add(G.cyl(0.04, 0.04, 0.5, 8), CRUST(), { p: [0, 0.02 * k, -0.02 * k], r: [0, 0, HALF_PI], s: k });
  for (const [x, z] of [[0, 0.28], [-0.08, 0.1], [0.09, 0.12]]) {
    g.add(G.cyl(0.05, 0.05, 0.02, 12), PEPPERONI(), { p: [x * k, 0.035 * k, z * k], s: k });
  }
  // A drip of cheese off the tip.
  g.add(G.sphere(0.035, 8, 6), CHEESE(), { p: [0, -0.04 * k, 0.48 * k], s: [k, k * 1.8, k] });
  return g;
}

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

function doughSlinger(m, c) {
  // A stand mixer in the tower's colour, dough hook whirring, flinging the
  // next ball of dough off the top of the bowl.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.12 });
  const dough = DOUGH();
  m.add(G.rbox(0.36, 0.06, 0.52, 0.025), body, { p: [0, 0.15, -0.02] });                          // foot
  m.add(G.rbox(0.14, 0.42, 0.16, 0.05), body, { p: [0, 0.39, -0.2] });                            // column
  m.add(G.rbox(0.18, 0.17, 0.5, 0.075), body, { p: [0, 0.665, -0.04] });                          // head
  m.add(G.sphere(0.088, 14, 10), body, { p: [0, 0.665, 0.2], s: [1, 0.95, 0.6] });
  m.add(G.box(0.186, 0.03, 0.42), STEEL(), { p: [0, 0.625, -0.04] });                             // chrome band
  m.add(G.cyl(0.032, 0.032, 0.21, 10), BLACK(), { p: [0, 0.6, -0.2], r: [0, 0, HALF_PI] });       // tilt hinge
  m.add(G.cyl(0.008, 0.008, 0.08, 6), STEEL(), { p: [0.11, 0.69, -0.16], r: [0, 0, -0.9] });     // speed lever
  m.add(G.sphere(0.024, 8, 6), BLACK(), { p: [0.14, 0.715, -0.16] });
  // The bowl, clamped to the foot, heaped with dough.
  m.add(G.cyl(0.1, 0.11, 0.025, 16), STEEL(), { p: [0, 0.19, 0.07] });
  m.add(G.lathe([[0.05, 0], [0.1, 0.01], [0.16, 0.06], [0.185, 0.16], [0.195, 0.19], [0.175, 0.19], [0.165, 0.08], [0.06, 0.03], [0, 0.03]], 22), STEEL(), { p: [0, 0.2, 0.07] });
  for (const s of [-1, 1]) m.add(G.torus(0.04, 0.01, 5, 10, Math.PI), STEEL(), { p: [s * 0.19, 0.33, 0.07], r: [0, HALF_PI, s * HALF_PI] });
  m.add(G.sphere(0.165, 16, 10), dough, { p: [0, 0.37, 0.07], s: [1, 0.48, 1] });
  // The hook, spinning in the dough.
  const hook = m.group({ p: [0, 0.58, 0.08] });
  hook.add(G.cyl(0.014, 0.014, 0.08, 6), STEEL(), { p: [0, -0.03, 0] });
  const spiral = [];
  for (let i = 0; i <= 10; i++) { const a = i * 0.75, t = i / 10; spiral.push([Math.sin(a) * 0.06 * (1 - t * 0.4), -0.06 - t * 0.17, Math.cos(a) * 0.06 * (1 - t * 0.4)]); }
  hook.add(G.tube(spiral, 0.013, 6), STEEL());
  m.anim(hook.object, 'spin', { speed: 6 });
  // Flour on the foot, and a ball of dough on its way out.
  for (const [x, z, k] of [[-0.1, 0.2, 1], [0.12, 0.18, 0.7], [0.03, 0.24, 0.55]]) {
    m.add(G.sphere(0.045 * k, 8, 6), M.paint(0xffffff, { gloss: 0.1, glow: 0.3 }), { p: [x, 0.18, z], s: [1.8, 0.25, 1.4] });
  }
  const ball = m.group({ p: [0, 0.6, 0.32] });
  ball.add(G.sphere(0.075, 12, 10), dough, { s: [1, 0.9, 1] });
  ball.add(G.sphere(0.1, 10, 8), M.energy(0xffffff, 0.2), { shadow: false });
  m.anim(ball.object, 'bob');
  muzzle(m, 0, 0.6, 0.34);
}

function peelSniper(m, c) {
  // A long wooden pizza peel on a tripod, a pepper grinder for a scope and a
  // round of pepperoni on the blade, ready to frisbee across the room.
  const paint = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.14 });
  const iron = M.matte(0x2a2d33);
  m.add(G.lathe([[0.22, 0], [0.24, 0.025], [0.2, 0.05], [0, 0.05]], 20), DARKWOOD(), { p: [0, 0.12, 0] });
  for (let i = 0; i < 3; i++) {
    const a = i * (TAU / 3) + 0.5;
    m.add(G.tube([[0, 0.44, 0], [Math.sin(a) * 0.14, 0.3, Math.cos(a) * 0.14], [Math.sin(a) * 0.21, 0.17, Math.cos(a) * 0.21]], 0.017, 6), iron);
  }
  m.add(G.cyl(0.055, 0.07, 0.09, 12), paint, { p: [0, 0.45, 0] });
  const gun = m.group({ p: [0, 0.51, 0] });
  // Handle: long, with a striped grip in the tower's colour.
  gun.add(G.cyl(0.026, 0.026, 0.62, 10), WOOD(), { p: [0, 0, -0.08], r: [HALF_PI, 0, 0] });
  gun.add(G.sphere(0.036, 10, 8), WOOD(), { p: [0, 0, -0.39] });
  gun.add(G.cyl(0.034, 0.034, 0.16, 10), paint, { p: [0, 0, -0.27], r: [HALF_PI, 0, 0] });
  for (const z of [-0.33, -0.21]) gun.add(G.cyl(0.037, 0.037, 0.018, 10), WHITE(), { p: [0, 0, z], r: [HALF_PI, 0, 0] });
  // The blade.
  gun.add(G.plate([[-0.05, 0], [0.05, 0], [0.15, 0.06], [0.165, 0.22], [0.125, 0.29], [-0.125, 0.29], [-0.165, 0.22], [-0.15, 0.06]], 0.016), WOOD(), { p: [0, 0, 0.2], r: [HALF_PI, 0, 0] });
  gun.add(G.cyl(0.105, 0.105, 0.022, 18), PEPPERONI(), { p: [0, 0.019, 0.39] });
  for (const [x, z] of [[0.04, 0.37], [-0.03, 0.42], [-0.04, 0.35], [0.03, 0.43]]) gun.add(G.sphere(0.014, 6, 4), M.paint(0xf3d2a0, { glow: 0.2 }), { p: [x, 0.031, z], s: [1, 0.3, 1] });
  // The scope: a pepper grinder on two clamps.
  const grinder = G.lathe([[0.035, 0], [0.046, 0.03], [0.04, 0.12], [0.052, 0.18], [0.032, 0.22], [0.012, 0.24]], 14);
  gun.add(grinder, DARKWOOD(), { p: [0, 0.08, -0.22], r: [HALF_PI, 0, 0] });
  gun.add(G.sphere(0.016, 8, 6), STEEL(), { p: [0, 0.08, 0.025] });
  gun.add(G.cyl(0.03, 0.03, 0.01, 12), M.glow(0xff3a2a), { p: [0, 0.08, -0.224], r: [HALF_PI, 0, 0], shadow: false });
  for (const z of [-0.15, -0.04]) gun.add(G.rbox(0.03, 0.05, 0.03, 0.008), iron, { p: [0, 0.045, z] });
  m.anim(gun.object, 'bob');
  const glint = m.add(G.star(0.05, 0.016, 0.006, 4), M.glow(0xffffff, 0.9), { p: [0.1, 0.56, 0.44], shadow: false });
  m.anim(glint, 'blink');
  muzzle(m, 0, 0.53, 0.42);
}

function sauceLadle(m, c) {
  // A stockpot of tomato sauce on a gas ring, bubbling, and a ladle swinging
  // a scoop of it up and out.
  const enamel = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.12 });
  const sauce = SAUCE();
  m.add(G.rbox(0.5, 0.07, 0.5, 0.03), BLACK(), { p: [0, 0.155, 0] });
  for (const s of [-1, 1]) m.add(G.cyl(0.03, 0.03, 0.03, 10), M.paint(0xe23a2a, { gloss: 0.8 }), { p: [s * 0.15, 0.17, 0.25], r: [HALF_PI, 0, 0] });
  // The ring of blue flame under the pot.
  m.add(G.torus(0.17, 0.02, 6, 22), M.glow(0x2a6ad8), { p: [0, 0.198, 0], r: [HALF_PI, 0, 0], shadow: false });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const lick = m.group({ p: [Math.cos(a) * 0.2, 0.19, Math.sin(a) * 0.2] });
    lick.add(G.cone(0.022, 0.07, 5), M.energy(0x5ab4ff, 0.85), { p: [0, 0.035, 0], shadow: false });
    m.anim(lick.object, 'flame', { offset: i });
  }
  // The pot.
  m.add(G.lathe([[0.19, 0], [0.23, 0.015], [0.24, 0.05], [0.24, 0.3], [0.255, 0.31], [0.25, 0.325], [0.225, 0.32], [0.225, 0.05], [0, 0.04]], 26), enamel, { p: [0, 0.2, 0] });
  m.add(G.torus(0.243, 0.012, 6, 26), STEEL(), { p: [0, 0.523, 0], r: [HALF_PI, 0, 0] });
  m.add(G.sleeve(0.242, 0.242, 0.05, 26), WHITE(), { p: [0, 0.34, 0] });
  for (const s of [-1, 1]) m.add(G.torus(0.055, 0.016, 6, 12, Math.PI), BLACK(), { p: [s * 0.25, 0.46, 0], r: [0, HALF_PI, s * HALF_PI] });
  m.add(G.cyl(0.226, 0.226, 0.02, 24), sauce, { p: [0, 0.49, 0] });
  m.add(G.sphere(0.05, 8, 6), BASIL(), { p: [-0.1, 0.502, 0.06], r: [0, 0.6, 0], s: [1.6, 0.25, 0.9] });
  m.add(G.sphere(0.04, 8, 6), BASIL(), { p: [0.12, 0.502, -0.08], r: [0, 2.0, 0], s: [1.6, 0.25, 0.9] });
  for (const [x, z, o] of [[0.06, 0.1, 0], [-0.08, -0.1, 1.2], [0.12, -0.02, 2.4]]) {
    const bub = m.group({ p: [x, 0.5, z] });
    bub.add(G.dome(0.035, 10), sauce);
    m.anim(bub.object, 'pulse', { offset: o });
  }
  // The ladle, swung up over the rim, sauce brimming in its bowl.
  const ladle = m.group({ p: [0, 0.5, -0.18] });
  ladle.add(G.tube([[0, -0.03, 0.06], [0, 0.18, -0.06], [0, 0.32, 0.04], [0, 0.29, 0.25]], 0.017, 6), STEEL());
  ladle.add(G.torus(0.025, 0.008, 5, 10), STEEL(), { p: [0, 0.27, -0.04] });
  ladle.add(G.lathe([[0, 0], [0.05, 0.006], [0.082, 0.03], [0.092, 0.065], [0.085, 0.068], [0.075, 0.036], [0.045, 0.016], [0, 0.012]], 16), STEEL(), { p: [0, 0.25, 0.32] });
  ladle.add(G.sphere(0.08, 12, 8), sauce, { p: [0, 0.31, 0.32], s: [1, 0.5, 1] });
  m.anim(ladle.object, 'bob');
  for (let i = 0; i < 2; i++) {
    const puff = m.add(G.sphere(0.05 + i * 0.015, 10, 8), M.energy(0xffffff, 0.24 - i * 0.07), { p: [0.1 - i * 0.05, 0.6 + i * 0.11, -0.05], shadow: false });
    m.anim(puff, 'pulse', { offset: i * 1.5 });
  }
  // A tomato waiting its turn.
  m.add(G.sphere(0.06, 12, 10), M.paint(0xe5352b, { gloss: 0.9, glow: 0.12 }), { p: [0.2, 0.25, 0.2], s: [1, 0.85, 1] });
  m.add(G.star(0.03, 0.012, 0.01, 5), BASIL(), { p: [0.2, 0.305, 0.2], r: [-HALF_PI, 0, 0] });
  muzzle(m, 0, 0.82, 0.14);
}

function mozzarellaStretcher(m, c) {
  // A ball of fresh mozzarella on a caprese board, two forks pulling it
  // apart: long, sticky strings, which is how it slows things down.
  const strand = c.bodyMat || M.paint(c.color, { gloss: 0.6, glow: 0.35 });
  const mozz = M.paint(0xfdfaf2, { gloss: 0.85, glow: 0.16 });
  m.add(G.cyl(0.3, 0.31, 0.045, 26), WOOD(), { p: [0, 0.143, 0] });
  m.add(G.torus(0.305, 0.012, 5, 26), DARKWOOD(), { p: [0, 0.166, 0], r: [HALF_PI, 0, 0] });
  // Caprese round the front: tomato slices and basil.
  for (let i = 0; i < 5; i++) {
    const a = 0.7 + i * 0.42, x = Math.cos(a) * 0.23, z = Math.sin(a) * 0.23;
    m.add(G.cyl(0.055, 0.055, 0.02, 14), M.paint(0xe5352b, { gloss: 0.8, glow: 0.14 }), { p: [x, 0.18 + i * 0.002, z], r: [0.15, 0, 0] });
    m.add(G.cyl(0.035, 0.035, 0.022, 10), M.paint(0xff9a7a, { gloss: 0.6 }), { p: [x, 0.181 + i * 0.002, z], r: [0.15, 0, 0] });
    if (i % 2 === 0) m.add(G.sphere(0.045, 8, 6), BASIL(), { p: [x * 0.8, 0.2, z * 0.8], r: [0, a, 0], s: [1.6, 0.25, 0.9] });
  }
  // The bowl of brine and the ball.
  m.add(G.lathe([[0.08, 0], [0.12, 0.01], [0.16, 0.08], [0.17, 0.12], [0.16, 0.12], [0.14, 0.04], [0, 0.02]], 20), M.glass(0xe8f4ff, 0.5), { p: [0, 0.165, -0.04] });
  m.add(G.cyl(0.15, 0.15, 0.01, 20), M.glass(0xd6ecff, 0.45), { p: [0, 0.26, -0.04] });
  m.add(G.sphere(0.165, 18, 14), mozz, { p: [0, 0.38, -0.04], s: [1, 0.88, 1] });
  // Two forks, pulled apart, strings sagging between them and the ball.
  const pull = m.group({ p: [0, 0, -0.04] });
  for (const s of [-1, 1]) {
    const tx = s * 0.3, ty = 0.5;
    pull.add(G.tube([[tx, ty, 0], [s * 0.33, 0.66, 0], [s * 0.35, 0.86, -0.02]], 0.018, 6), STEEL());
    pull.add(G.capsule(0.03, 0.16, 10), strand, { p: [s * 0.35, 0.78, -0.02] });
    for (const dz of [-0.04, 0, 0.04]) pull.add(G.cone(0.01, 0.08, 5), STEEL(), { p: [tx - s * 0.025, ty - 0.01, dz], r: [0, 0, s * (HALF_PI + 0.3)] });
    for (const [dz, sag] of [[-0.06, 0.08], [0, 0.12], [0.06, 0.06], [0.03, 0.16]]) {
      pull.add(G.tube([[s * 0.12, 0.42, dz * 0.8], [s * 0.2, 0.42 - sag, dz], [tx - s * 0.04, ty - 0.01, dz * 0.6]], 0.012, 5), strand);
    }
    pull.add(G.sphere(0.03, 8, 6), strand, { p: [tx - s * 0.04, ty - 0.01, 0] });
  }
  m.anim(pull.object, 'bob');
  // A string reaching out to whatever comes close.
  const reach = m.group({ p: [0, 0.4, 0.12] });
  reach.add(G.tube([[0, 0, -0.02], [0, -0.04, 0.08], [0, 0.03, 0.18]], 0.016, 5), strand);
  reach.add(G.sphere(0.04, 10, 8), strand, { p: [0, 0.035, 0.19] });
  m.anim(reach.object, 'pulse');
  muzzle(m, 0, 0.44, 0.32);
}

function rollingPin(m, c) {
  // A rolling pin on a hinged arm over a floured board: it rolls flat
  // whatever wanders under it. A sack of flour keeps the arm in balance.
  const pin = c.bodyMat || M.paint(c.color, { gloss: 0.45, glow: 0.1 });
  const dark = DARKWOOD();
  m.add(G.rbox(0.56, 0.05, 0.5, 0.015), WOOD(), { p: [0, 0.145, 0.02] });
  m.add(G.cyl(0.2, 0.2, 0.022, 22), DOUGH(), { p: [0, 0.18, 0.1], s: [1.05, 1, 0.75] });
  for (const [x, z, k] of [[-0.2, 0.18, 1], [0.18, 0.22, 0.8], [0.22, -0.02, 0.6], [-0.15, -0.05, 0.7]]) {
    m.add(G.sphere(0.06 * k, 8, 6), M.paint(0xffffff, { gloss: 0.1, glow: 0.35 }), { p: [x, 0.172, z], s: [1.8, 0.15, 1.3] });
  }
  // The sack.
  m.add(G.lathe([[0.12, 0], [0.15, 0.04], [0.15, 0.24], [0.1, 0.32], [0.05, 0.34], [0.06, 0.38], [0, 0.39]], 14), M.paint(0xf4efe2, { gloss: 0.2, glow: 0.08 }), { p: [0, 0.17, -0.3], s: [1.3, 1, 0.7] });
  m.add(G.sleeve(0.152, 0.152, 0.06, 14), M.paint(0x2a5ad8, { gloss: 0.4, glow: 0.1 }), { p: [0, 0.3, -0.3], s: [1.3, 1, 0.7] });
  m.add(G.torus(0.05, 0.012, 5, 10), M.paint(0xc62a1a, { gloss: 0.5 }), { p: [0, 0.52, -0.3], r: [HALF_PI, 0, 0] });
  // Uprights and pivot.
  for (const s of [-1, 1]) m.add(G.rbox(0.05, 0.36, 0.07, 0.012), dark, { p: [s * 0.24, 0.33, -0.16] });
  m.add(G.cyl(0.016, 0.016, 0.54, 8), M.metal(0x3b4048, { rough: 0.5 }), { p: [0, 0.48, -0.16], r: [0, 0, HALF_PI] });
  // The arm and the pin.
  const arm = m.group({ p: [0, 0.48, -0.16], r: [0.58, 0, 0] });
  for (const s of [-1, 1]) arm.add(G.rbox(0.03, 0.035, 0.46, 0.01), dark, { p: [s * 0.24, 0, 0.21] });
  arm.add(G.cyl(0.075, 0.075, 0.36, 18), pin, { p: [0, 0, 0.42], r: [0, 0, HALF_PI] });
  for (const s of [-1, 1]) {
    arm.add(G.cyl(0.03, 0.03, 0.11, 10), dark, { p: [s * 0.235, 0, 0.42], r: [0, 0, HALF_PI] });
    arm.add(G.sphere(0.036, 10, 8), dark, { p: [s * 0.3, 0, 0.42] });
    arm.add(G.torus(0.076, 0.006, 4, 18), M.paint(0xfdfaf2, { gloss: 0.3 }), { p: [s * 0.13, 0, 0.42], r: [0, HALF_PI, 0] });
  }
  for (const [x, a] of [[-0.08, 0.4], [0.05, 1.6], [0.12, 2.6]]) arm.add(G.sphere(0.024, 6, 5), M.paint(0xffffff, { glow: 0.3 }), { p: [x, Math.sin(a) * 0.072, 0.42 + Math.cos(a) * 0.072], s: [1.6, 0.4, 1] });
  m.anim(arm.object, 'bob');
  muzzle(m, 0, 0.3, 0.26);
}

function garlicZapper(m, c) {
  // A bulb of garlic on a Tesla coil. Nothing hungry likes it; the arcs jump
  // from its stalk to the copper prongs and on down the line.
  const zap = c.bodyMat || M.paint(c.color, { gloss: 0.7, glow: 0.45 });
  const skin = M.paint(0xf6f0e2, { gloss: 0.4, glow: 0.14 });
  const streak = M.paint(0xc89ac0, { gloss: 0.4, glow: 0.12 });
  const porcelain = M.paint(0xf4f0e6, { gloss: 0.95 });
  m.add(G.lathe([[0.22, 0], [0.25, 0.02], [0.25, 0.06], [0.2, 0.08], [0, 0.08]], 22), BLACK(), { p: [0, 0.12, 0] });
  m.add(G.cyl(0.035, 0.035, 0.3, 10), BLACK(), { p: [0, 0.34, 0] });
  // The coil, wound round the post.
  const coil = [];
  for (let i = 0; i <= 40; i++) { const a = i * 0.55; coil.push([Math.sin(a) * 0.075, 0.22 + i * 0.006, Math.cos(a) * 0.075]); }
  m.add(G.tube(coil, 0.012, 5), COPPER());
  for (const y of [0.2, 0.46]) m.add(G.lathe([[0.12, 0], [0.13, 0.015], [0.09, 0.035], [0, 0.035]], 16), porcelain, { p: [0, y, 0] });
  m.add(G.torus(0.1, 0.018, 6, 18), COPPER(), { p: [0, 0.5, 0], r: [HALF_PI, 0, 0] });
  // The bulb: a ring of cloves leaning in, papery skin, a purple streak or two.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    const cl = m.group({ p: [0, 0, 0], r: [0, a, 0] });
    cl.add(G.sphere(0.1, 12, 10), skin, { p: [0, 0.64, 0.105], r: [-0.32, 0, 0], s: [0.78, 1.45, 0.9] });
    if (i % 2) cl.add(G.sphere(0.1, 10, 8), streak, { p: [0, 0.63, 0.115], r: [-0.32, 0, 0], s: [0.25, 1.3, 0.85] });
  }
  m.add(G.sphere(0.12, 12, 10), skin, { p: [0, 0.66, 0], s: [1, 1.3, 1] });
  m.add(G.cone(0.06, 0.18, 10), skin, { p: [0, 0.86, 0] });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    m.add(G.tube([[0, 0.53, 0], [Math.cos(a) * 0.05, 0.5, Math.sin(a) * 0.05], [Math.cos(a) * 0.09, 0.505, Math.sin(a) * 0.09]], 0.006, 4), M.paint(0xd8c9a0, { gloss: 0.2 }));
  }
  // The stalk lit up, the prongs and arcs.
  const tip = m.add(G.sphere(0.045, 12, 10), M.glow(c.color), { p: [0, 0.96, 0], shadow: false });
  m.anim(tip, 'pulse');
  const halo = m.group({ p: [0, 0.96, 0] });
  halo.add(G.sphere(0.09, 10, 8), M.energy(c.color, 0.35), { shadow: false });
  m.anim(halo.object, 'pulse', { offset: 1 });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.2, 0.18, 0], [s * 0.24, 0.45, 0], [s * 0.22, 0.72, 0]], 0.014, 6), COPPER());
    m.add(G.sphere(0.032, 10, 8), zap, { p: [s * 0.22, 0.74, 0] });
    const arc = m.add(G.tube([[s * 0.22, 0.75, 0], [s * 0.16, 0.83, 0.03], [s * 0.1, 0.84, -0.02], [s * 0.05, 0.92, 0.01], [0, 0.95, 0]], 0.007, 4), M.glow(0xffffff, 0.9), { shadow: false });
    m.anim(arc, 'blink');
  }
  const spark = m.add(G.sphere(0.022, 6, 5), M.glow(c.color), { p: [0, 0.78, 0], shadow: false });
  m.anim(spark, 'orbit', { radius: 0.24 * m.scale });
  muzzle(m, 0, 0.96, 0);
}

function woodOven(m, c) {
  // A little wood-fired oven: brick plinth, a tiled dome, the mouth full of
  // fire and a pizza cooking at the back of it.
  // Terracotta, not the shared enamel: a pale glossy dome reads as a bun.
  const dome = M.paint(0xb8461e, { gloss: 0.35, glow: 0.12 });
  const brick = M.paint(0x8a3a26, { gloss: 0.2 });
  const stone = M.paint(0xe2d6c0, { gloss: 0.3 });
  const ember = M.glow(0xff8a1f);
  m.add(G.rbox(0.6, 0.15, 0.58, 0.02), brick, { p: [0, 0.195, 0] });
  for (const y of [0.17, 0.22]) m.add(G.box(0.605, 0.008, 0.585), M.paint(0xd8c8b0, { gloss: 0.1 }), { p: [0, y, 0] });   // mortar
  m.add(G.rbox(0.64, 0.035, 0.62, 0.012), stone, { p: [0, 0.285, 0] });
  m.add(G.lathe([[0.28, 0], [0.285, 0.06], [0.26, 0.16], [0.2, 0.26], [0.11, 0.32], [0, 0.34]], 26), dome, { p: [0, 0.3, -0.02] });
  // A band of tiles in green, white and red.
  [0x2f8a3a, 0xfbf7ee, 0xd8322a].forEach((color, i) => {
    m.add(G.torus(0.287, 0.02, 6, 10, TAU / 3), M.paint(color, { gloss: 0.8, glow: 0.12 }), { p: [0, 0.37, -0.02], r: [HALF_PI, 0, i * TAU / 3 + 0.5] });
  });
  // The mouth: a stone arch, the fire inside, the pizza at the back.
  m.add(G.torus(0.12, 0.03, 6, 14, Math.PI), stone, { p: [0, 0.4, 0.25] });
  for (const s of [-1, 1]) m.add(G.rbox(0.06, 0.1, 0.07, 0.012), stone, { p: [s * 0.12, 0.35, 0.25] });
  const hole = [[-0.1, 0], [0.1, 0]];
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; hole.push([Math.cos(a) * 0.1, 0.1 + Math.sin(a) * 0.1]); }
  m.add(G.plate(hole, 0.01), M.glow(0x2a0c04), { p: [0, 0.3, 0.255], shadow: false });
  m.add(G.plate(hole, 0.01), ember, { p: [0, 0.3, 0.21], s: [0.8, 0.8, 1], shadow: false });
  m.add(G.cyl(0.06, 0.06, 0.012, 14), CHEESE(), { p: [0, 0.31, 0.2] });
  for (const [x, o] of [[-0.05, 0], [0.05, 1.7], [0, 3]]) {
    const lick = m.group({ p: [x, 0.31, 0.19] });
    lick.add(G.cone(0.035, 0.12, 6), M.energy(0xff7a1f, 0.85), { p: [0, 0.06, 0], shadow: false });
    m.anim(lick.object, 'flame', { offset: o });
  }
  const jet = m.group({ p: [0, 0.35, 0.27], r: [HALF_PI, 0, 0] });
  jet.add(G.cone(0.05, 0.16, 8), M.energy(0xff6a1a, 0.8), { p: [0, 0.08, 0], shadow: false });
  jet.add(G.cone(0.025, 0.1, 6), M.glow(0xffe27a), { p: [0, 0.05, 0], shadow: false });
  m.anim(jet.object, 'flame');
  // Chimney, and smoke.
  m.add(G.cyl(0.05, 0.06, 0.2, 10), brick, { p: [0.06, 0.68, -0.14] });
  m.add(G.cyl(0.07, 0.07, 0.03, 10), stone, { p: [0.06, 0.785, -0.14] });
  for (let i = 0; i < 2; i++) {
    const puff = m.add(G.sphere(0.05 + i * 0.02, 10, 8), M.energy(0xbfb3a8, 0.24 - i * 0.07), { p: [0.06 + i * 0.03, 0.86 + i * 0.1, -0.14], shadow: false });
    m.anim(puff, 'pulse', { offset: i * 1.4 });
  }
  // Logs stacked by the mouth.
  for (const [x, y, z] of [[-0.21, 0.33, 0.22], [-0.25, 0.33, 0.12], [-0.23, 0.38, 0.17]]) {
    m.add(G.cyl(0.026, 0.026, 0.22, 8), DARKWOOD(), { p: [x, y, z], r: [HALF_PI, 0, 0.1] });
    m.add(G.cyl(0.022, 0.022, 0.222, 8), WOOD(), { p: [x, y, z], r: [HALF_PI, 0, 0.1], s: [1, 0.98, 1] });
  }
  muzzle(m, 0, 0.36, 0.32);
}

function goldenCutter(m, c) {
  // A pizza cutter the size of a cartwheel, gold-handled and crowned, rolling
  // through a whole pie on a cake stand. It cuts bosses into slices.
  const gold = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.2 });
  m.add(G.lathe([[0.17, 0], [0.18, 0.02], [0.07, 0.06], [0.05, 0.13], [0.27, 0.15], [0.29, 0.17], [0, 0.17]], 24), M.paint(0xfbf7ee, { gloss: 0.9 }), { p: [0, 0.12, 0] });
  m.add(G.torus(0.29, 0.012, 5, 26), GOLD(), { p: [0, 0.29, 0], r: [HALF_PI, 0, 0] });
  pie(m, { p: [0, 0.29, 0], R: 0.28, pep: 7, basil: 3 });
  // The cut it has already made.
  m.add(G.box(0.012, 0.012, 0.5), M.paint(0x8a2a14, { gloss: 0.6 }), { p: [0, 0.335, 0] });
  // The wheel.
  const wheel = m.group({ p: [0, 0.52, 0.06], r: [0, 0, HALF_PI] });
  wheel.add(G.cyl(0.2, 0.2, 0.022, 36), M.metal(0xeef3f8, { rough: 0.12 }));
  wheel.add(G.torus(0.2, 0.007, 4, 36), M.glow(0xffffff, 0.9), { r: [HALF_PI, 0, 0], shadow: false });
  wheel.add(G.cyl(0.055, 0.055, 0.07, 16), gold);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    wheel.add(G.cyl(0.022, 0.022, 0.026, 10), M.matte(0x8a96a4), { p: [Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12] });
  }
  m.anim(wheel.object, 'spin', { speed: 3 });
  // Guard fork and handle.
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.03, 8, 6), gold, { p: [s * 0.05, 0.52, 0.06] });
    m.add(G.tube([[s * 0.05, 0.52, 0.06], [s * 0.06, 0.64, -0.06], [0, 0.73, -0.18]], 0.02, 6), gold);
  }
  m.add(G.cyl(0.045, 0.055, 0.34, 12), gold, { p: [0, 0.83, -0.31], r: [-0.9, 0, 0] });
  for (const k of [0.25, 0.5, 0.75]) m.add(G.torus(0.05, 0.01, 5, 14), BLACK(), { p: [0, 0.73 + k * 0.2, -0.18 - k * 0.26], r: [HALF_PI - 0.9, 0, 0] });
  // A crown on the end of the handle.
  const crown = m.group({ p: [0, 0.96, -0.47], r: [-0.4, 0, 0] });
  crown.add(G.sleeve(0.06, 0.06, 0.05, 12), GOLD());
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    crown.add(G.cone(0.02, 0.06, 4), GOLD(), { p: [Math.cos(a) * 0.055, 0.05, Math.sin(a) * 0.055] });
  }
  crown.add(G.sphere(0.02, 8, 6), M.glow(0xe23a2a), { p: [0, 0.01, 0.06], shadow: false });
  const star = m.add(G.star(0.055, 0.022, 0.012), M.glow(0xfff3a0), { p: [0.2, 0.86, 0.14], shadow: false });
  m.anim(star, 'float');
  muzzle(m, 0, 0.62, 0.28);
}

const TOWERS = [doughSlinger, peelSniper, sauceLadle, mozzarellaStretcher, rollingPin, garlicZapper, woodOven, goldenCutter];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, faces +Z, and its feet reach about y = -0.95.

/** A sub-assembly that moves with the gait: see rendering/enemy-anim.js. */
function part(m, anim, opts) {
  const g = m.group(opts);
  g.object.userData.anim = anim;
  return g;
}

/** `brow` above zero frowns, below zero looks worried. */
function eyes(m, { x = 0.2, y = 0.12, z = 0.9, r = 0.12, color = 0xffffff, pupil = 0x15171c, brow = 0, browMat = null } = {}) {
  for (const s of [-1, 1]) {
    m.add(G.sphere(r, 10, 8), M.glow(color), { p: [s * x, y, z], shadow: false });
    m.add(G.sphere(r * 0.5, 8, 6), M.glow(pupil), { p: [s * x * 0.96, y, z + r * 0.72], shadow: false });
    if (brow) m.add(G.box(r * 2.2, r * 0.4, r * 0.5), browMat || M.matte(0x15171c), { p: [s * x, y + r * 0.95, z + r * 0.45], r: [0.35, 0, s * brow], shadow: false });
  }
}

/** Two short legs that stride with the gait. */
function legs(m, mat, shoe, { x = 0.26, hip = -0.4, len = 0.42, r = 0.08, amp = 0.8, z = 0 } = {}) {
  for (const s of [-1, 1]) {
    const g = part(m, { k: 'swing', ax: 'x', amp, ph: s > 0 ? 0 : Math.PI }, { p: [s * x, hip, z] });
    g.add(G.cyl(r, r * 0.85, len, 8), mat, { p: [0, -len / 2, 0] });
    g.add(G.sphere(r * 1.6, 8, 6), shoe, { p: [0, -len - 0.02, r * 0.9], s: [1, 0.6, 1.5] });
  }
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, outline, { y = 0.3, z = -0.1, hinge = 0.25 } = {}) {
  mat.side = THREE.DoubleSide;
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate(outline, 0.03);
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

const FEATHER = [[0, -0.26], [0.4, -0.36], [0.82, -0.26], [1.05, 0], [0.84, 0.06], [0.86, 0.26], [0.6, 0.2], [0.56, 0.4], [0.32, 0.26], [0.22, 0.42], [0, 0.26]];
const FIRE_WING = [[0, -0.28], [0.5, -0.5], [0.95, -0.38], [1.45, -0.48], [1.15, -0.08], [1.5, 0.22], [0.95, 0.18], [1.0, 0.58], [0.58, 0.3], [0.4, 0.6], [0, 0.3]];

function raccoon(m, enemy, c) {
  // A raccoon in its own bandit mask, a stolen slice held out in front.
  const fur = M.paint(c.color, { gloss: 0.3, glow: 0.12 });
  const dark = M.paint(c.accent, { gloss: 0.35, glow: 0.05 });
  const pale = M.paint(0xeee9df, { gloss: 0.3, glow: 0.14 });
  m.add(G.sphere(0.6, 16, 12), fur, { p: [0, -0.22, -0.12], s: [1, 0.95, 1.12] });
  m.add(G.sphere(0.46, 14, 10), pale, { p: [0, -0.26, 0.12], s: [0.9, 0.9, 0.7] });                // belly
  m.add(G.sphere(0.44, 18, 14), fur, { p: [0, 0.36, 0.36], s: [1.12, 0.95, 1] });                // head
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.2, 10, 8), pale, { p: [s * 0.26, 0.27, 0.6], s: [1.1, 0.8, 0.8] });        // cheek ruffs
    m.add(G.cone(0.14, 0.24, 6), fur, { p: [s * 0.3, 0.78, 0.28], r: [0, 0, -s * 0.35] });      // ears
    m.add(G.cone(0.08, 0.15, 6), dark, { p: [s * 0.3, 0.76, 0.32], r: [0, 0, -s * 0.35] });
  }
  // The mask, and the white brow over it.
  m.add(G.sphere(0.3, 14, 8), dark, { p: [0, 0.44, 0.58], s: [1.55, 0.5, 0.8] });
  m.add(G.sphere(0.25, 12, 8), pale, { p: [0, 0.62, 0.6], s: [1.3, 0.3, 0.6] });
  eyes(m, { x: 0.17, y: 0.46, z: 0.78, r: 0.1 });
  // Snout and nose.
  m.add(G.sphere(0.16, 12, 10), pale, { p: [0, 0.28, 0.82], s: [1, 0.8, 1.3] });
  m.add(G.sphere(0.07, 10, 8), M.paint(0x15171c, { gloss: 0.95 }), { p: [0, 0.32, 1.02] });
  m.add(G.torus(0.06, 0.018, 5, 10, Math.PI), M.glow(0x5a1626), { p: [0, 0.2, 0.96], r: [0, 0, Math.PI], shadow: false });   // grin
  // The ringed tail, swishing.
  const tail = part(m, { k: 'swing', ax: 'y', amp: 0.4, f: 1.5, ph: 0 }, { p: [0, -0.25, -0.7] });
  for (let i = 0; i < 6; i++) {
    tail.add(G.sphere(0.2 - i * 0.015, 10, 8), i % 2 ? dark : fur, { p: [0, i * 0.12, -i * 0.13], s: [1, 1, 0.9] });
  }
  // The slice, held up in both paws.
  slice(m, { p: [0, -0.02, 0.68], r: [-0.55, 0, 0], k: 0.95 });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.42, 0.0, 0.25], [s * 0.36, -0.1, 0.55], [s * 0.2, -0.02, 0.76]], 0.07, 6), fur);
    m.add(G.sphere(0.08, 8, 6), dark, { p: [s * 0.2, -0.02, 0.78] });
  }
  legs(m, dark, dark, { x: 0.3, hip: -0.58, len: 0.3, r: 0.09, amp: 0.9 });
}

function pepperGremlin(m, enemy, c) {
  // A red chilli with a green cap, fists up, head on fire.
  const skin = M.paint(c.color, { gloss: 0.9, glow: 0.18 });
  const green = M.paint(c.accent, { gloss: 0.55, glow: 0.14 });
  const dark = M.matte(0x1f4a14);
  m.add(G.lathe([[0, 0], [0.32, 0.06], [0.52, 0.3], [0.58, 0.66], [0.52, 0.98], [0.32, 1.16], [0, 1.2]], 22), skin, { p: [0, -0.62, 0] });
  // The tail of the pod, curling round behind.
  m.add(G.tube([[0, -0.5, -0.05], [0, -0.78, -0.24], [0, -0.74, -0.56], [0, -0.48, -0.74]], 0.14, 8), skin);
  m.add(G.cone(0.13, 0.26, 8), skin, { p: [0, -0.36, -0.78], r: [-0.2, 0, 0] });
  // A shine down the front, and the cap.
  m.add(G.sphere(0.12, 8, 6), M.paint(0xff9a7a, { gloss: 0.9, glow: 0.4 }), { p: [0.24, 0.24, 0.42], s: [0.5, 1.6, 0.4], r: [0, 0, -0.2] });
  m.add(G.sphere(0.36, 16, 8), green, { p: [0, 0.56, 0], s: [1, 0.36, 1] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.3;
    m.add(G.sphere(0.15, 8, 6), green, { p: [Math.sin(a) * 0.34, 0.5, Math.cos(a) * 0.34], r: [0, a, 0], s: [0.8, 0.35, 1.3] });
  }
  m.add(G.tube([[0, 0.6, 0], [0, 0.82, -0.04], [0.08, 0.96, -0.16]], 0.065, 6), green);
  eyes(m, { x: 0.2, y: 0.16, z: 0.54, r: 0.15, brow: 0.55, browMat: dark });
  m.add(G.rbox(0.34, 0.13, 0.06, 0.03), M.glow(0x3a0d08), { p: [0, -0.14, 0.58], shadow: false });
  for (const x of [-0.1, 0, 0.1]) m.add(G.box(0.075, 0.07, 0.03), M.glow(0xffffff), { p: [x, -0.12, 0.615], shadow: false });
  // Fists up.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.8, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.55, -0.05, 0.05] });
    arm.add(G.tube([[0, 0, 0], [s * 0.14, 0.06, 0.12], [s * 0.12, 0.2, 0.26]], 0.055, 6), green);
    arm.add(G.sphere(0.11, 8, 6), green, { p: [s * 0.12, 0.22, 0.28] });
  }
  legs(m, green, green, { x: 0.22, hip: -0.6, len: 0.28, r: 0.075, amp: 0.9 });
  flame(m, enemy, { p: [-0.05, 0.62, -0.12], rad: 0.22, h: 0.7 });
  flame(m, enemy, { p: [-0.32, 0.5, -0.12], rad: 0.12, h: 0.4, color: 0xffb347 });
  flame(m, enemy, { p: [0.3, 0.5, -0.14], rad: 0.12, h: 0.4, color: 0xffb347 });
}

function seagull(m, enemy, c) {
  // A gull who has never once been told no. It has your slice.
  const white = M.paint(c.color, { gloss: 0.45, glow: 0.18 });
  const grey = M.paint(0x9aa6b4, { gloss: 0.4, glow: 0.12 });
  const beak = M.paint(c.accent, { gloss: 0.6, glow: 0.3 });
  const black = M.paint(0x1a1c22, { gloss: 0.5 });
  m.add(G.sphere(0.5, 16, 12), white, { p: [0, 0, -0.1], s: [1, 0.88, 1.55] });
  m.add(G.sphere(0.48, 16, 10), grey, { p: [0, 0.14, -0.2], s: [1.04, 0.5, 1.45] });          // the grey mantle
  m.add(G.sphere(0.32, 16, 12), white, { p: [0, 0.32, 0.62] });
  m.add(G.cone(0.095, 0.42, 8), beak, { p: [0, 0.27, 1.0], r: [HALF_PI, 0, 0] });
  m.add(G.sphere(0.05, 8, 6), M.paint(0xe23a2a, { glow: 0.4 }), { p: [0, 0.22, 1.0] });          // the red spot
  m.add(G.sphere(0.04, 8, 6), beak, { p: [0, 0.25, 1.2], s: [1, 1.2, 1] });
  eyes(m, { x: 0.17, y: 0.42, z: 0.82, r: 0.075, color: 0xfff3c2, brow: 0.65, browMat: grey });
  // The slice it took, dangling from its beak.
  slice(m, { p: [0.08, 0.14, 1.06], r: [0.2, 1.4, 1.2], k: 0.8 });
  // Tail: grey with black tips.
  m.add(G.plate([[-0.26, 0], [0.26, 0], [0.2, 0.42], [-0.2, 0.42]], 0.04), grey, { p: [0, 0.06, -0.8], r: [HALF_PI + 0.25, 0, 0] });
  m.add(G.plate([[-0.2, 0.3], [0.2, 0.3], [0.2, 0.44], [-0.2, 0.44]], 0.05), black, { p: [0, 0.06, -0.8], r: [HALF_PI + 0.25, 0, 0] });
  // Feet tucked up underneath.
  for (const s of [-1, 1]) m.add(G.sphere(0.1, 8, 6), M.paint(0xff9a3a, { glow: 0.2 }), { p: [s * 0.16, -0.44, -0.1], s: [1, 0.4, 1.6] });
  wings(m, enemy, grey, FEATHER, { y: 0.16, z: -0.05, hinge: 0.42 });
}

function pineapple(m, enemy, c) {
  // The topping nobody asked for, in a rind of armour, crowned in leaves and
  // carrying a ring of itself for a shield.
  const gold = M.paint(c.color, { gloss: 0.5, glow: 0.16 });
  const rind = M.paint(0x6a3c10, { gloss: 0.6, glow: 0.05 });
  const tipMat = M.paint(0xffe27a, { gloss: 0.6, glow: 0.3 });
  const leaf = M.paint(c.accent, { gloss: 0.6, glow: 0.12 });
  const up = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3();
  const cy = -0.18, rx = 0.62, ry = 0.76;
  m.add(G.sphere(0.62, 20, 14), gold, { p: [0, cy, 0], s: [1, ry / 0.62, 1] });
  // The diamond plates, each a little pyramid pointing out of the surface.
  for (let j = 0; j < 6; j++) {
    const lat = -0.95 + j * 0.38;
    const count = 11 - Math.abs(j - 2.5) * 1.2 | 0;
    for (let i = 0; i < count; i++) {
      const lon = (i / count) * TAU + j * 0.3;
      const x = Math.cos(lat) * Math.sin(lon) * rx, y = Math.sin(lat) * ry, z = Math.cos(lat) * Math.cos(lon) * rx;
      if (z > 0.3 && y > -0.3 && y < 0.45 && Math.abs(x) < 0.4) continue;        // leave the face clear
      n.set(x / (rx * rx), y / (ry * ry), z / (rx * rx)).normalize();
      const mesh = m.add(G.cone(0.13, 0.2, 4), rind, { p: [x + n.x * 0.05, cy + y + n.y * 0.05, z + n.z * 0.05] });
      mesh.quaternion.setFromUnitVectors(up, n);
      const tip = m.add(G.sphere(0.03, 6, 4), tipMat, { p: [x + n.x * 0.15, cy + y + n.y * 0.15, z + n.z * 0.15] });
      tip.quaternion.copy(mesh.quaternion);
    }
  }
  // The crown: two tiers of spiky leaves.
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU, inner = i % 2 === 0;
    const g = m.group({ p: [0, cy + ry - 0.05, 0], r: [0, a, 0] });
    g.add(G.plate([[-0.08, 0], [0.08, 0], [0.025, 0.55], [0, 0.62], [-0.025, 0.55]], 0.035), leaf, { r: [inner ? 0.25 : 0.75, 0, 0], s: inner ? 1.15 : 0.95 });
  }
  // Face: furious.
  eyes(m, { x: 0.2, y: 0.08, z: 0.6, r: 0.14, brow: 0.55, browMat: rind });
  m.add(G.torus(0.1, 0.03, 5, 10, Math.PI), M.glow(0x3a1a08), { p: [0, -0.16, 0.62], shadow: false });          // frown
  // The shield: a pineapple ring on the left arm.
  const shield = part(m, { k: 'swing', ax: 'x', amp: 0.25, ph: 0 }, { p: [-0.62, -0.18, 0.3] });
  shield.add(G.tube([[0.1, 0.05, -0.1], [-0.02, 0, 0.05], [-0.06, 0, 0.18]], 0.06, 6), leaf);
  shield.add(G.cyl(0.34, 0.34, 0.08, 22), M.paint(0xffd447, { gloss: 0.7, glow: 0.3 }), { p: [-0.08, 0, 0.24], r: [0, 0, HALF_PI], s: [1, 1, 1] });
  shield.add(G.torus(0.34, 0.035, 6, 22), rind, { p: [-0.08, 0, 0.24], r: [0, HALF_PI, 0] });
  shield.add(G.cyl(0.1, 0.1, 0.09, 14), M.paint(0xfff0b0, { gloss: 0.5, glow: 0.2 }), { p: [-0.08, 0, 0.24], r: [0, 0, HALF_PI] });
  // And a fist on the right.
  const fist = part(m, { k: 'swing', ax: 'x', amp: 0.7, ph: Math.PI }, { p: [0.6, -0.15, 0.1] });
  fist.add(G.tube([[0, 0, 0], [0.12, -0.08, 0.15], [0.1, 0.0, 0.3]], 0.06, 6), leaf);
  fist.add(G.sphere(0.1, 8, 6), leaf, { p: [0.1, 0.02, 0.32] });
  legs(m, leaf, rind, { x: 0.26, hip: -0.72, len: 0.16, r: 0.1, amp: 0.6 });
}

function foodCritic(m, enemy, c) {
  // Black polo neck, red beret, a monocle, a nose that has smelled better,
  // and a notepad full of one-star reviews.
  const coat = M.paint(c.color, { gloss: 0.5, glow: 0.1 });
  const beret = M.paint(c.accent, { gloss: 0.3, glow: 0.2 });
  const skin = M.paint(0xf2c6a0, { gloss: 0.4, glow: 0.12 });
  const ink = M.paint(0x1a1513, { gloss: 0.6 });
  legs(m, M.paint(0x1b1b24, { gloss: 0.3 }), M.paint(0x0e0e12, { gloss: 0.95 }), { x: 0.16, hip: -0.48, len: 0.42, r: 0.075, amp: 0.6 });
  m.add(G.lathe([[0, 0], [0.4, 0], [0.44, 0.1], [0.38, 0.55], [0.3, 0.88], [0.18, 0.98], [0, 1.0]], 20), coat, { p: [0, -0.56, 0] });
  // A striped scarf, one end flung back.
  m.add(G.torus(0.22, 0.075, 8, 20), M.paint(0xf3ead8, { gloss: 0.3, glow: 0.14 }), { p: [0, 0.4, 0.02], r: [HALF_PI, 0, 0] });
  for (const a of [0.5, 2.1, 3.7, 5.3]) m.add(G.torus(0.22, 0.078, 8, 4, 0.5), beret, { p: [0, 0.4, 0.02], r: [HALF_PI, 0, a] });
  m.add(G.rbox(0.13, 0.36, 0.04, 0.02), M.paint(0xf3ead8, { gloss: 0.3, glow: 0.14 }), { p: [0.12, 0.28, -0.3], r: [0.9, 0.2, 0.1] });
  // Head, held high.
  m.add(G.sphere(0.3, 18, 14), skin, { p: [0, 0.7, 0.02] });
  m.add(G.cone(0.065, 0.3, 8), skin, { p: [0, 0.73, 0.4], r: [HALF_PI - 0.5, 0, 0] });                  // the nose, up
  for (const s of [-1, 1]) {
    m.add(G.tube([[0, 0.6, 0.3], [s * 0.1, 0.59, 0.31], [s * 0.17, 0.63, 0.27], [s * 0.18, 0.68, 0.25]], 0.022, 5), ink);   // moustache
    m.add(G.sphere(0.07, 10, 8), M.glow(0xffffff), { p: [s * 0.11, 0.78, 0.25], shadow: false });
    m.add(G.sphere(0.035, 8, 6), M.glow(0x15171c), { p: [s * 0.11, 0.77, 0.3], shadow: false });
    m.add(G.sphere(0.075, 10, 6), skin, { p: [s * 0.11, 0.8, 0.255], s: [1.05, 0.55, 1.05] });          // heavy lids
  }
  m.add(G.torus(0.08, 0.013, 6, 16), GOLD(), { p: [0.11, 0.78, 0.31] });                                 // monocle
  m.add(G.tube([[0.19, 0.76, 0.3], [0.26, 0.55, 0.24], [0.2, 0.38, 0.28]], 0.007, 4), GOLD());
  m.add(G.sphere(0.3, 16, 8), beret, { p: [0.04, 0.95, -0.03], r: [0, 0, -0.22], s: [1.15, 0.3, 1.15] });
  m.add(G.cyl(0.02, 0.025, 0.07, 6), beret, { p: [0.0, 1.05, -0.03] });
  // Notepad on the left, pen poised on the right.
  const pad = part(m, { k: 'swing', ax: 'x', amp: 0.3, ph: 0 }, { p: [-0.4, 0.15, 0.05] });
  pad.add(G.tube([[0, 0, 0], [-0.08, -0.14, 0.16], [0.02, -0.08, 0.34]], 0.07, 6), coat);
  pad.add(G.rbox(0.26, 0.34, 0.03, 0.01), M.paint(0xfdfaf2, { gloss: 0.3, glow: 0.2 }), { p: [0.08, -0.02, 0.42], r: [-0.5, 0.35, 0] });
  for (let i = 0; i < 4; i++) pad.add(G.box(0.18, 0.015, 0.01), M.glow(0x2a5ad8), { p: [0.08, 0.06 - i * 0.05, 0.43 - i * 0.025], r: [-0.5, 0.35, 0], shadow: false });
  pad.add(G.star(0.05, 0.02, 0.012), M.glow(0xe23a2a), { p: [0.11, -0.13, 0.36], r: [-0.5, 0.35, 0], shadow: false });
  const pen = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: Math.PI }, { p: [0.4, 0.15, 0.05] });
  pen.add(G.tube([[0, 0, 0], [0.08, -0.12, 0.16], [0.02, -0.04, 0.34]], 0.07, 6), coat);
  pen.add(G.sphere(0.07, 8, 6), skin, { p: [0.02, -0.03, 0.36] });
  pen.add(G.cyl(0.015, 0.012, 0.26, 6), GOLD(), { p: [0.02, 0.05, 0.4], r: [0.5, 0, -0.3] });
}

function calzone(m, enemy, c) {
  // A calzone that overproofed, caught fire and flew out of the oven.
  const crust = M.paint(c.color, { gloss: 0.4, glow: 0.12 });
  const char = M.paint(0x6a3416, { gloss: 0.3 });
  const sauce = SAUCE();
  const body = new THREE.SphereGeometry(0.6, 22, 12, 0, TAU, 0, HALF_PI);
  m.add(body, crust, { p: [0, -0.2, 0], s: [0.72, 0.9, 1.4] });
  m.add(G.cyl(0.6, 0.6, 0.06, 22), char, { p: [0, -0.22, 0], s: [0.72, 1, 1.4] });
  // The crimped seam round its edge.
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU;
    m.add(G.sphere(0.11, 8, 6), crust, { p: [Math.sin(a) * 0.43, -0.2, Math.cos(a) * 0.84], r: [0, a, 0], s: [1.2, 0.75, 0.8] });
  }
  // Scorch marks, oregano, and the slits it vents through.
  for (const [x, y, z, k] of [[0.18, 0.28, 0.1, 1], [-0.2, 0.2, -0.35, 0.8], [0.1, 0.12, -0.6, 0.7]]) {
    m.add(G.sphere(0.1 * k, 8, 6), char, { p: [x, y, z], s: [1, 0.35, 1.4] });
  }
  for (let i = 0; i < 7; i++) m.add(G.sphere(0.022, 5, 4), M.paint(0x3f7a2a), { p: [Math.sin(i * 2.1) * 0.25, 0.25 - (i % 3) * 0.05, Math.cos(i * 2.1) * 0.5 - 0.1] });
  for (const z of [-0.2, 0.15]) m.add(G.box(0.05, 0.03, 0.22), M.glow(0xffa040), { p: [0, 0.32, z], shadow: false });
  // Face at the front end, sauce at the corner of its mouth.
  eyes(m, { x: 0.17, y: 0.06, z: 0.74, r: 0.12, brow: 0.5, browMat: char });
  m.add(G.torus(0.1, 0.03, 5, 10, Math.PI), M.glow(0x5a1626), { p: [0, -0.08, 0.8], r: [0, 0, Math.PI], shadow: false });
  m.add(G.sphere(0.05, 8, 6), sauce, { p: [0.09, -0.18, 0.8], s: [1, 1.6, 1] });
  flame(m, enemy, { p: [0, 0.3, -0.2], rad: 0.14, h: 0.5 });
  flame(m, enemy, { p: [0, 0.3, 0.15], rad: 0.1, h: 0.38, color: 0xffb347 });
  flame(m, enemy, { p: [0, -0.1, -0.84], r: [-HALF_PI, 0, 0], rad: 0.15, h: 0.6 });
  wings(m, enemy, M.paint(c.accent, { gloss: 0.4, glow: 0.6 }), FIRE_WING, { y: 0.0, z: -0.05, hinge: 0.36 });
  // Sauce bubbling out along the seam.
  for (const [a, k] of [[0.5, 1], [1.4, 0.8], [2.6, 1.1], [4.0, 0.9], [5.2, 0.7]]) {
    m.add(G.sphere(0.075 * k, 8, 6), SAUCE(), { p: [Math.sin(a) * 0.46, -0.12, Math.cos(a) * 0.88], s: [1, 0.8, 1] });
  }
}

function healthInspector(m, enemy, c) {
  // The one they all fear: white coat, hairnet, glasses, a clipboard of
  // violations and a FAIL stamp raised high.
  const coat = M.paint(c.color, { gloss: 0.5, glow: 0.14 });
  const tie = M.paint(c.accent, { gloss: 0.6, glow: 0.2 });
  const skin = M.paint(0xe8b894, { gloss: 0.4, glow: 0.12 });
  const ink = M.paint(0x1a1513, { gloss: 0.6 });
  legs(m, M.paint(0x2a2f3a, { gloss: 0.3 }), M.paint(0x0e0e12, { gloss: 0.95 }), { x: 0.3, hip: -0.45, len: 0.4, r: 0.12, amp: 0.5 });
  m.add(G.lathe([[0, 0], [0.62, 0], [0.68, 0.1], [0.68, 0.6], [0.62, 0.95], [0.42, 1.12], [0, 1.15]], 24), coat, { p: [0, -0.58, 0] });
  // Shirt, tie, lapels, buttons.
  m.add(G.plate([[-0.16, 0], [0.16, 0], [0.05, -0.55], [-0.05, -0.55]], 0.04), M.paint(0xcfe0f5, { gloss: 0.4, glow: 0.12 }), { p: [0, 0.54, 0.6], r: [-0.3, 0, 0] });
  m.add(G.plate([[-0.05, 0], [0.05, 0], [0.07, -0.36], [0, -0.44], [-0.07, -0.36]], 0.05), tie, { p: [0, 0.5, 0.64], r: [-0.3, 0, 0] });
  for (const s of [-1, 1]) m.add(G.plate([[0, 0], [s * 0.2, -0.05], [s * 0.06, -0.55]], 0.04), coat, { p: [s * 0.12, 0.55, 0.6], r: [-0.3, 0, 0] });
  for (const y of [-0.05, -0.25]) m.add(G.sphere(0.04, 8, 6), M.metal(0x8a96a4), { p: [0.1, y, 0.68] });
  // Breast pocket: pens and a thermometer. ID badge on the other side.
  m.add(G.rbox(0.2, 0.16, 0.04, 0.01), coat, { p: [-0.33, 0.22, 0.58], r: [-0.2, -0.35, 0] });
  [[0x2a5ad8, -0.39], [0xe23a2a, -0.33], [0xd7dde5, -0.27]].forEach(([color, x]) => {
    m.add(G.cyl(0.018, 0.018, 0.16, 6), M.paint(color, { gloss: 0.8, glow: 0.2 }), { p: [x, 0.33, 0.56], r: [-0.2, -0.35, 0] });
  });
  m.add(G.rbox(0.18, 0.22, 0.02, 0.01), M.paint(0xfbf7ee, { gloss: 0.5, glow: 0.2 }), { p: [0.34, 0.18, 0.6], r: [-0.25, 0.35, 0] });
  m.add(G.box(0.18, 0.05, 0.025), tie, { p: [0.34, 0.27, 0.6], r: [-0.25, 0.35, 0] });
  // Head, glasses, frown, and the hairnet.
  m.add(G.sphere(0.4, 20, 16), skin, { p: [0, 0.96, 0.04] });
  m.add(G.sphere(0.36, 16, 10), M.paint(0x7a6650, { gloss: 0.3 }), { p: [0, 1.1, -0.02], s: [1.05, 0.65, 1.05] });
  m.add(G.dome(0.415, 18), M.glass(0xffffff, 0.35), { p: [0, 1.0, 0.0], s: [1, 0.85, 1] });
  m.add(G.torus(0.405, 0.025, 6, 26), M.paint(0xfbf7ee, { gloss: 0.4, glow: 0.2 }), { p: [0, 1.02, 0.0], r: [HALF_PI + 0.08, 0, 0] });
  for (const a of [0, 0.7, -0.7, HALF_PI]) m.add(G.torus(0.41, 0.006, 3, 20, Math.PI), M.glow(0xffffff, 0.7), { p: [0, 1.0, 0], r: [0, a, 0], s: [1, 0.85, 1], shadow: false });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.065, 10, 8), M.glow(0xffffff), { p: [s * 0.14, 1.0, 0.36], shadow: false });
    m.add(G.sphere(0.032, 8, 6), M.glow(0x15171c), { p: [s * 0.14, 0.99, 0.41], shadow: false });
    m.add(G.torus(0.095, 0.017, 6, 16), ink, { p: [s * 0.14, 1.0, 0.4] });
    m.add(G.box(0.2, 0.06, 0.06), ink, { p: [s * 0.15, 1.13, 0.38], r: [0.3, 0, s * 0.35] });                 // stern brows
    m.add(G.cyl(0.01, 0.01, 0.3, 4), ink, { p: [s * 0.24, 1.0, 0.24], r: [HALF_PI, 0, 0] });                  // arms of the glasses
  }
  m.add(G.box(0.08, 0.015, 0.015), ink, { p: [0, 1.0, 0.41] });
  m.add(G.sphere(0.07, 8, 6), skin, { p: [0, 0.9, 0.44], s: [1, 1.1, 1] });
  m.add(G.torus(0.09, 0.022, 5, 10, Math.PI), M.glow(0x5a1626), { p: [0, 0.74, 0.39], shadow: false });          // frown
  // The clipboard, held out to show you everything you did wrong.
  const board = part(m, { k: 'swing', ax: 'x', amp: 0.2, ph: 0 }, { p: [-0.6, 0.35, 0.15] });
  board.add(G.tube([[0, 0, 0], [0.05, -0.15, 0.25], [0.3, -0.1, 0.52]], 0.1, 6), coat);
  board.add(G.sphere(0.09, 8, 6), skin, { p: [0.3, -0.08, 0.56] });
  const tilt = [-0.55, 0.25, 0];
  board.add(G.rbox(0.5, 0.62, 0.035, 0.02), M.paint(0x9a6a3a, { gloss: 0.4 }), { p: [0.45, 0.06, 0.64], r: tilt });
  board.add(G.box(0.42, 0.52, 0.01), M.paint(0xfdfaf2, { gloss: 0.3, glow: 0.25 }), { p: [0.45, 0.03, 0.665], r: tilt });
  board.add(G.rbox(0.18, 0.07, 0.04, 0.01), M.metal(0xb8c2cc), { p: [0.45, 0.34, 0.62], r: tilt });
  for (let i = 0; i < 4; i++) {
    const y = 0.2 - i * 0.12, z = 0.665 + 0.012 + i * 0.065;
    board.add(G.box(0.24, 0.02, 0.01), M.glow(0x3a3f4a), { p: [0.5, y, z], r: tilt, shadow: false });
    for (const k of [-1, 1]) board.add(G.box(0.08, 0.02, 0.01), M.glow(0xe23a2a), { p: [0.32, y, z + 0.005], r: [tilt[0], tilt[1], k * 0.8], shadow: false });
  }
  // The stamp, raised high: its red pad is the crown gem that throbs.
  const stamp = part(m, { k: 'swing', ax: 'x', amp: 0.35, ph: Math.PI }, { p: [0.6, 0.35, 0.1] });
  stamp.add(G.tube([[0, 0, 0], [0.18, 0.25, 0.1], [0.2, 0.55, 0.25]], 0.1, 6), coat);
  stamp.add(G.sphere(0.09, 8, 6), skin, { p: [0.2, 0.6, 0.27] });
  stamp.add(G.sphere(0.085, 10, 8), M.paint(0x6a3e22, { gloss: 0.6 }), { p: [0.2, 0.78, 0.27] });
  stamp.add(G.cyl(0.03, 0.03, 0.18, 8), M.paint(0x6a3e22, { gloss: 0.6 }), { p: [0.2, 0.64, 0.27] });
  stamp.add(G.rbox(0.26, 0.06, 0.18, 0.02), BLACK(), { p: [0.2, 0.52, 0.27] });
  const pad = stamp.group({ p: [0.2, 0.47, 0.27] });
  pad.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.cyl(0.12, 0.12, 0.05, 14), M.glow(0xe23a2a));
  pad.object.add(enemy.crownGem);
}

const ENEMIES = {
  SWARM: raccoon,
  FIRE: pepperGremlin,
  FLYING: seagull,
  ARMORED: pineapple,
  ELITE: foodCritic,
  FLYING_FIRE: calzone,
  BOSS: healthInspector
};

// ── Arena ───────────────────────────────────────────────────────────────────

/**
 * Seamless 512px tile covering four cells: red and cream checker tiles, two to
 * a cell, grouted, worn, and dusted with flour.
 */
function paintFloor(ctx, size) {
  const n = 8, s = size / n;
  // A fixed pseudo-random sequence so the tile repeats identically.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const red = (x + y) % 2 === 1;
      const v = (rnd() - 0.5) * 14;
      ctx.fillStyle = red ? `rgb(${196 + v}, ${66 + v * 0.4}, ${50 + v * 0.3})` : `rgb(${244 + v * 0.5}, ${232 + v * 0.5}, ${208 + v * 0.5})`;
      ctx.fillRect(x * s, y * s, s, s);
      // A soft glaze highlight on the upper-left of each tile.
      const grd = ctx.createLinearGradient(x * s, y * s, x * s + s, y * s + s);
      grd.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      grd.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      grd.addColorStop(1, 'rgba(60, 20, 10, 0.08)');
      ctx.fillStyle = grd;
      ctx.fillRect(x * s, y * s, s, s);
    }
  }
  // Grout.
  ctx.fillStyle = 'rgba(120, 92, 70, 0.6)';
  for (let i = 0; i <= n; i++) {
    ctx.fillRect(i * s - 1.5, 0, 3, size);
    ctx.fillRect(0, i * s - 1.5, size, 3);
  }
  // Flour: soft drifts and fine specks, kept away from the tile's edges so it
  // never cuts off at a seam.
  for (let i = 0; i < 6; i++) {
    const x = 60 + rnd() * (size - 120), y = 60 + rnd() * (size - 120), r = 18 + rnd() * 34;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 252, 244, 0.42)');
    g.addColorStop(1, 'rgba(255, 252, 244, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 252, 244, 0.55)';
  for (let i = 0; i < 160; i++) ctx.fillRect(8 + rnd() * (size - 16), 8 + rnd() * (size - 16), 1.6, 1.6);
  // A few crumbs and a basil leaf someone dropped.
  ctx.fillStyle = 'rgba(190, 130, 60, 0.6)';
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(20 + rnd() * (size - 40), 20 + rnd() * (size - 40), 1.5 + rnd() * 2, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(47, 120, 52, 0.7)';
  ctx.beginPath(); ctx.ellipse(330, 150, 9, 4, 0.6, 0, TAU); ctx.fill();
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // a stack of pizza boxes, slightly askew
      const kraft = M.paint(0xc89a62, { gloss: 0.2 }), print = M.paint(0xc62a1a, { gloss: 0.4, glow: 0.12 });
      for (let i = 0; i < 4; i++) {
        const ry = (i % 2 ? 0.12 : -0.08) * (i + 1) * 0.5;
        m.add(G.rbox(0.62, 0.1, 0.62, 0.015), kraft, { p: [0, 0.05 + i * 0.105, 0], r: [0, ry, 0] });
        m.add(G.box(0.63, 0.012, 0.08), print, { p: [0, 0.07 + i * 0.105, 0], r: [0, ry, 0] });
      }
      m.add(G.cyl(0.14, 0.14, 0.01, 18), print, { p: [0, 0.426, 0], r: [0, 0.2, 0] });
      m.add(G.cyl(0.09, 0.09, 0.012, 18), M.paint(0xfbf7ee, { gloss: 0.4, glow: 0.15 }), { p: [0, 0.43, 0] });
      break;
    }
    case 1: { // a big tin of tomatoes
      m.add(G.cyl(0.26, 0.26, 0.56, 22), M.metal(0xc8d0d8, { rough: 0.3 }), { p: [0, 0.28, 0] });
      m.add(G.sleeve(0.262, 0.262, 0.38, 22), M.paint(0xd8322a, { gloss: 0.6, glow: 0.12 }), { p: [0, 0.28, 0] });
      m.add(G.sleeve(0.264, 0.264, 0.08, 22), M.paint(0x2f8a3a, { gloss: 0.6, glow: 0.12 }), { p: [0, 0.28, 0] });
      for (const y of [0.02, 0.54]) m.add(G.torus(0.26, 0.015, 5, 22), M.metal(0xc8d0d8, { rough: 0.3 }), { p: [0, y, 0], r: [HALF_PI, 0, 0] });
      m.add(G.sphere(0.09, 12, 10), M.paint(0xe5352b, { gloss: 0.9, glow: 0.15 }), { p: [0.1, 0.62, 0.05] });
      m.add(G.star(0.04, 0.015, 0.012, 5), BASIL(), { p: [0.1, 0.71, 0.05], r: [-HALF_PI, 0, 0] });
      break;
    }
    case 2: { // parmesan and chilli shakers
      const glass = M.glass(0xf6fbff, 0.45);
      [[-0.13, 0xfff3c2], [0.14, 0xd8322a]].forEach(([x, fill]) => {
        m.add(G.lathe([[0.1, 0], [0.12, 0.02], [0.12, 0.3], [0.1, 0.34]], 16), glass, { p: [x, 0, 0] });
        m.add(G.cyl(0.105, 0.105, 0.22, 14), M.paint(fill, { gloss: 0.3, glow: 0.15 }), { p: [x, 0.13, 0] });
        m.add(G.lathe([[0.1, 0], [0.105, 0.05], [0.07, 0.11], [0, 0.12]], 14), M.metal(0xdfe6ee), { p: [x, 0.33, 0] });
      });
      break;
    }
    case 3: { // a sack of flour, a scoop stuck in it
      m.add(G.lathe([[0.24, 0], [0.3, 0.06], [0.3, 0.34], [0.22, 0.48], [0.12, 0.52], [0, 0.52]], 18), M.paint(0xf4efe2, { gloss: 0.15, glow: 0.08 }), { p: [0, 0, 0], s: [1.05, 1, 0.8] });
      m.add(G.sleeve(0.302, 0.302, 0.1, 18), M.paint(0x2a5ad8, { gloss: 0.4, glow: 0.12 }), { p: [0, 0.22, 0], s: [1.05, 1, 0.8] });
      m.add(G.sphere(0.2, 14, 8), M.paint(0xffffff, { gloss: 0.1, glow: 0.3 }), { p: [0, 0.5, 0], s: [1, 0.3, 0.8] });
      m.add(G.cyl(0.02, 0.02, 0.26, 8), M.metal(0xdfe6ee), { p: [0.06, 0.62, 0], r: [0, 0, -0.5] });
      m.add(G.dome(0.07, 12), M.metal(0xdfe6ee), { p: [0.0, 0.53, 0], r: [Math.PI, 0, 0] });
      break;
    }
    default: { // a pot of basil
      m.add(G.lathe([[0.16, 0], [0.2, 0.3], [0.23, 0.32], [0.23, 0.36], [0.19, 0.36], [0, 0.3]], 18), M.paint(0xb8552e, { gloss: 0.3 }), { p: [0, 0, 0] });
      m.add(G.cyl(0.19, 0.19, 0.02, 16), M.matte(0x3b2a1c), { p: [0, 0.33, 0] });
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, r = 0.05 + (i % 3) * 0.05;
        m.add(G.sphere(0.08, 8, 6), BASIL(), { p: [Math.cos(a) * r, 0.42 + (i % 4) * 0.06, Math.sin(a) * r], r: [0.5, a, 0.2], s: [1.4, 0.3, 0.9] });
      }
    }
  }
  return g;
}

/** A sign board's face, drawn on a canvas (only ever called in the browser). */
function signTexture(text, { bg = '#2a120c', edge = '#d8a84a', ink = '#fbf2dc', font = '900 150px Georgia, "Times New Roman", serif', glow = null } = {}) {
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 256);
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 996, 228);
  }
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 40; }
  ctx.fillStyle = ink;
  ctx.fillText(text, 512, 134);
  if (glow) ctx.fillText(text, 512, 134);
  return new THREE.CanvasTexture(cv);
}

/** Red-and-white gingham, for the tablecloths. */
function ginghamTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fbf4ea';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = 'rgba(206, 40, 32, 0.55)';
  for (let i = 0; i < 8; i += 2) { ctx.fillRect(i * 16, 0, 16, 128); ctx.fillRect(0, i * 16, 128, 16); }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

/** A café table with a gingham cloth, two chairs, a candle in a bottle and a pie. */
function table(m, x, z, cloth) {
  const iron = M.paint(0x24262c, { gloss: 0.5 });
  m.add(G.cyl(0.18, 0.18, 2.4, 10), iron, { p: [x, 1.2, z] });
  m.add(G.cyl(1.0, 1.1, 0.1, 18), iron, { p: [x, 0.05, z] });
  m.add(G.cyl(2.4, 2.4, 0.12, 28), M.paint(0x6a3e22, { gloss: 0.3 }), { p: [x, 2.45, z] });
  m.add(G.sleeve(2.55, 2.75, 0.9, 28), cloth, { p: [x, 2.1, z] });
  m.add(G.cyl(2.52, 2.52, 0.04, 28), cloth, { p: [x, 2.53, z] });
  pie(m, { p: [x + 0.6, 2.56, z - 0.3], R: 1.0, pep: 7, basil: 4 });
  // Chianti bottle in its straw basket, a candle in its neck.
  m.add(G.lathe([[0.45, 0], [0.55, 0.3], [0.5, 0.75], [0.2, 1.3], [0.16, 2.0], [0.2, 2.1]], 16), M.glass(0x2f6a3a, 0.75), { p: [x - 1.2, 2.55, z + 0.6] });
  m.add(G.lathe([[0.47, 0], [0.57, 0.3], [0.52, 0.75], [0.4, 0.9]], 16), M.paint(0xd8b468, { gloss: 0.15 }), { p: [x - 1.2, 2.55, z + 0.6] });
  m.add(G.cyl(0.11, 0.11, 0.6, 8), M.paint(0xfbf7ee, { gloss: 0.4 }), { p: [x - 1.2, 4.9, z + 0.6] });
  const fl = m.group({ p: [x - 1.2, 5.25, z + 0.6] });
  fl.add(G.cone(0.1, 0.35, 8), M.energy(0xffc06a, 0.9), { p: [0, 0.17, 0], shadow: false });
  m.anim(fl.object, 'flame');
  // Chairs.
  for (const s of [-1, 1]) {
    const cx = x + s * 3.3;
    m.add(G.cyl(1.0, 1.0, 0.14, 18), M.paint(0xc62a1a, { gloss: 0.6 }), { p: [cx, 1.6, z] });
    for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) m.add(G.cyl(0.07, 0.07, 1.6, 6), iron, { p: [cx + dx, 0.8, z + dz] });
    m.add(G.torus(0.9, 0.08, 6, 16, Math.PI), iron, { p: [cx + s * 0.9, 2.6, z], r: [0, HALF_PI, 0] });
    for (const dz of [-0.85, 0.85]) m.add(G.cyl(0.07, 0.07, 1.1, 6), iron, { p: [cx + s * 0.9, 2.1, z + dz] });
  }
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => { g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };

  // The back wall: a great brick oven, tiled in the colours of the flag, its
  // mouth full of fire, the sign over it and a neon OPEN in the window.
  const wall = new THREE.Group();
  let m = modeller(wall, 1);
  const brick = M.paint(0x8a3424, { gloss: 0.2 });
  const mortar = M.paint(0xd8c8b0, { gloss: 0.1 });
  const stone = M.paint(0xe2d6c0, { gloss: 0.3 });
  m.add(G.rbox(14, 3.2, 6, 0.2), brick, { p: [0, 1.6, 0] });
  for (const y of [0.8, 1.6, 2.4]) m.add(G.box(14.05, 0.08, 6.05), mortar, { p: [0, y, 0] });
  m.add(G.rbox(14.6, 0.4, 6.6, 0.1), stone, { p: [0, 3.4, 0] });
  m.add(G.lathe([[6.2, 0], [6.2, 1.0], [5.8, 3.4], [4.6, 5.6], [2.6, 7.0], [0, 7.4]], 36), M.paint(0xb8552e, { gloss: 0.35, glow: 0.06 }), { p: [0, 3.6, 0] });
  [0x2f8a3a, 0xfbf7ee, 0xd8322a].forEach((color, i) => {
    m.add(G.torus(6.1, 0.3, 6, 14, TAU / 3), M.paint(color, { gloss: 0.8, glow: 0.15 }), { p: [0, 4.4, 0], r: [HALF_PI, 0, i * TAU / 3 - HALF_PI] });
  });
  for (const y of [6.4, 8.4]) m.add(G.torus(y < 7 ? 5.1 : 3.4, 0.12, 5, 30), mortar, { p: [0, y, 0], r: [HALF_PI, 0, 0] });
  // The mouth, on the board side.
  const mouth = [[-2.4, 0], [2.4, 0]];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; mouth.push([Math.cos(a) * 2.4, 1.6 + Math.sin(a) * 2.0]); }
  m.add(G.plate(mouth, 0.1), M.glow(0x2a0c04), { p: [0, 3.6, 6.15], shadow: false });
  m.add(G.plate(mouth, 0.1), M.glow(0xff7a1f), { p: [0, 3.6, 5.2], s: [0.85, 0.75, 1], shadow: false });
  m.add(G.torus(2.5, 0.35, 6, 20, Math.PI), stone, { p: [0, 5.2, 6.2], s: [1, 0.85, 1] });
  for (const s of [-1, 1]) m.add(G.rbox(0.7, 1.7, 0.7, 0.08), stone, { p: [s * 2.5, 4.45, 6.2] });
  for (const [x, o] of [[-1.2, 0], [0, 1.4], [1.2, 2.6], [-0.6, 3.6], [0.7, 4.4]]) {
    const lick = m.group({ p: [x, 3.6, 5.6] });
    lick.add(G.cone(0.6, 2.2 - Math.abs(x) * 0.5, 8), M.energy(0xff7a1f, 0.85), { p: [0, 1.0, 0], shadow: false });
    m.anim(lick.object, 'flame', { offset: o });
  }
  m.add(new THREE.CircleGeometry(3.4, 24), M.energy(0xff8a3a, 0.25), { p: [0, 0.02, 8.6], r: [-HALF_PI, 0, 0], shadow: false });
  // Chimney and the sign.
  m.add(G.cyl(0.9, 1.0, 5.5, 14), brick, { p: [0, 12.8, -1.0] });
  m.add(G.cyl(1.2, 1.2, 0.4, 14), stone, { p: [0, 15.6, -1.0] });
  m.add(G.rbox(11, 2.6, 0.4, 0.12), M.paint(0x2a120c, { gloss: 0.3 }), { p: [0, 13.0, 3.2] });
  m.add(new THREE.PlaneGeometry(10.4, 2.3), new THREE.MeshBasicMaterial({ map: signTexture('PIZZERIA'), fog: false }), { p: [0, 13.0, 3.42], shadow: false });
  for (const s of [-1, 1]) m.add(G.cyl(0.1, 0.1, 3.2, 6), M.paint(0x24262c), { p: [s * 4.5, 10.3, 3.2] });
  // The neon OPEN sign, hung beside the oven.
  m.add(G.rbox(5.2, 2.2, 0.3, 0.2), M.paint(0x14161c, { gloss: 0.6 }), { p: [-9.8, 6.5, 2.0] });
  m.add(new THREE.PlaneGeometry(5.0, 2.0), new THREE.MeshBasicMaterial({
    map: signTexture('OPEN', { bg: '#14161c', edge: '#3fdcff', ink: '#ff5a7a', glow: '#ff2a5a', font: '900 190px "Segoe UI", Arial, sans-serif' }), fog: false
  }), { p: [-9.8, 6.5, 2.17], shadow: false });
  m.add(G.cyl(0.12, 0.12, 6.5, 8), M.paint(0x24262c), { p: [-9.8, 3.25, 2.0] });
  m.add(G.sphere(1.6, 12, 10), M.energy(0xff2a5a, 0.12), { p: [-9.8, 6.5, 2.6], s: [2, 1, 0.3], shadow: false });
  place(wall, 0, -hh - 10.5);

  // Pizza boxes stacked for the delivery run, the top one open.
  const boxes = new THREE.Group();
  m = modeller(boxes, 1);
  const kraft = M.paint(0xc89a62, { gloss: 0.2 }), print = M.paint(0xc62a1a, { gloss: 0.4, glow: 0.12 });
  for (let i = 0; i < 7; i++) {
    const ry = Math.sin(i * 1.7) * 0.12;
    m.add(G.rbox(4.6, 0.62, 4.6, 0.08), kraft, { p: [0, 0.31 + i * 0.64, 0], r: [0, ry, 0] });
    m.add(G.box(4.62, 0.1, 0.7), print, { p: [0, 0.5 + i * 0.64, 0], r: [0, ry, 0] });
  }
  const top = 7 * 0.64;
  m.add(G.rbox(4.6, 0.12, 4.6, 0.04), kraft, { p: [0, top + 0.06, 0] });
  pie(m, { p: [0, top + 0.12, 0], R: 2.0, pep: 8, basil: 4 });
  const lid = m.group({ p: [0, top + 0.1, -2.3], r: [-1.9, 0, 0] });
  lid.add(G.rbox(4.6, 0.1, 4.6, 0.04), kraft, { p: [0, 0, 2.3] });
  lid.add(G.cyl(1.2, 1.2, 0.04, 22), print, { p: [0, 0.06, 2.3] });
  lid.add(G.cyl(0.8, 0.8, 0.05, 22), M.paint(0xfbf7ee, { gloss: 0.4, glow: 0.15 }), { p: [0, 0.07, 2.3] });
  place(boxes, -hw - 8, -hh * 0.25, 0.35);

  // The delivery scooter, top box on the back, parked by the side door.
  const scooter = new THREE.Group();
  m = modeller(scooter, 1);
  const red = M.paint(0xd8322a, { gloss: 0.9, glow: 0.12 });
  const rubber = M.matte(0x1a1c20);
  const chrome = M.metal(0xd7dde5, { rough: 0.2 });
  for (const z of [-2.6, 2.6]) {
    m.add(G.torus(1.0, 0.38, 10, 22), rubber, { p: [0, 1.38, z], r: [0, HALF_PI, 0] });
    m.add(G.cyl(0.62, 0.62, 0.4, 16), chrome, { p: [0, 1.38, z], r: [0, 0, HALF_PI] });
  }
  m.add(G.rbox(1.8, 0.5, 4.2, 0.2), red, { p: [0, 1.9, -0.2] });                                     // floorboard
  m.add(G.rbox(2.0, 1.8, 2.4, 0.6), red, { p: [0, 2.8, -1.9] });                                     // rear body
  m.add(G.rbox(1.4, 0.4, 2.0, 0.18), M.paint(0x2a1c18, { gloss: 0.4 }), { p: [0, 3.85, -1.6] });     // seat
  m.add(G.rbox(1.8, 3.6, 0.8, 0.3), red, { p: [0, 3.2, 2.2], r: [-0.25, 0, 0] });                    // front shield
  m.add(G.cyl(0.14, 0.14, 2.6, 8), chrome, { p: [0, 5.2, 2.7] });
  m.add(G.cyl(0.11, 0.11, 2.6, 8), chrome, { p: [0, 6.4, 2.7], r: [0, 0, HALF_PI] });
  m.add(G.sphere(0.45, 12, 10), M.glow(0xfff3b0), { p: [0, 5.4, 3.05], s: [1, 1, 0.5], shadow: false });   // headlamp
  for (const s of [-1, 1]) m.add(G.sphere(0.32, 10, 8), chrome, { p: [s * 1.3, 6.6, 2.6], s: [1, 1, 0.5] });   // mirrors
  // The top box.
  m.add(G.rbox(2.6, 2.2, 2.6, 0.2), M.paint(0xfbf7ee, { gloss: 0.6 }), { p: [0, 5.2, -2.6] });
  m.add(G.rbox(2.64, 0.5, 2.64, 0.15), red, { p: [0, 6.0, -2.6] });
  slice(m, { p: [0, 5.1, -1.28], r: [HALF_PI, Math.PI, 0], k: 3.2 });
  place(scooter, -hw - 7.5, hh * 0.85, 0.6);

  // Tables out front, clothed in gingham, candles lit.
  const tables = new THREE.Group();
  m = modeller(tables, 1);
  const cloth = new THREE.MeshStandardMaterial({ map: ginghamTexture(), roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
  table(m, 0, 0, cloth);
  table(m, 4.6, -7.5, cloth);
  place(tables, hw + 4, -hh - 6.5, -0.3);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0x8a8d96, accent: ctx.accent ?? 0x26272d });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
