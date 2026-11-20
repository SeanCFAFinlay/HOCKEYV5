// SUSHI CONVEYOR
//
// Dinner is fighting back. The arena is the counter of a sushi bar; the enemies
// are the order itself — maki on little legs, a furious blob of wasabi, a crab,
// a shrimp in armour, an octopus — pouring out of the kitchen hatch, and the
// towers are the chef's tools standing between them and the customer's plate.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'sushi',
  name: 'Sushi Conveyor',
  shortName: 'Sushi',
  icon: 'nigiri',
  sortOrder: 90,
  description: 'Dinner is fighting back. Hold the bar with the chef\'s tools before the runaway sushi reaches the plate.',
  color: '#ff7a6b',
  groundColor: 0xd9b47c,
  pathColor: 0x8a6a48,
  envColor: 0x0f1424,
  environmentSkin: { arena: 'sushi bar', floor: 'hinoki', markerIcon: '🍣' },
  enemySkin: { body: 'sushi', icon: 'maki' },
  recommendedTowers: ['t1', 't3', 't4'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Chopstick Flicker', icon: 'chopsticks', clr: '#9bd43a' },
    t2: { nm: 'Sashimi Knife', icon: 'sashimiknife', clr: '#cfe0f0' },
    t3: { nm: 'Rice Cooker', icon: 'ricecooker', clr: '#ff8fa3' },
    t4: { nm: 'Ice Shaver', icon: 'kakigori', clr: '#4fd8f5' },
    t5: { nm: 'Mochi Mallet', icon: 'mochimallet', clr: '#d99a4e' },
    t6: { nm: 'Electric Eel', icon: 'eeljar', clr: '#b794ff' },
    t7: { nm: 'Charcoal Grill', icon: 'konro', clr: '#ff5a2e' },
    t8: { nm: 'Lucky Cat', icon: 'luckycat', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Runaway Maki' },
    e2: { nm: 'Wasabi Hothead' },
    e3: { nm: 'Flying Gyoza' },
    e4: { nm: 'Hardshell Crab' },
    e5: { nm: 'Tempura Samurai' },
    e6: { nm: 'Dragon Roll' },
    e7: { nm: 'Emperor Octopus' }
  },
  maps: [
    ['Opening Order', 'A simple run down the bar - learn the basics'],
    ['Bento Box', 'Open centre, two ways in'],
    ['Chopstick Alley', 'Tight lanes between the trays'],
    ['Conveyor Loop', 'Long counter, heavy traffic'],
    ['Lunch Rush', 'They come from everywhere'],
    ['Bamboo Mat', 'Narrow and fast'],
    ['Teppan Night', 'Wide open and hot'],
    ['Chef\'s Choice', 'Mixed pressure, little room'],
    ['All You Can Eat', 'The big spread'],
    ['Last Call', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x0f1424,
    fog: 0x161a30,
    fogDensity: 0.006,
    floor: {
      base: '#d2a86c',
      meshColor: 0x9c8866,
      roughness: 0.5,
      metalness: 0.03,
      emissive: 0x2a1608,
      emissiveIntensity: 0.06
    },
    rail: { color: 0x7d9a4a, roughness: 0.5, metalness: 0.05 },
    path: { color: 0x3b3a44, emissive: 0x1a1220, opacity: 0.42, edge: 0xff7a6b },
    buildZone: { color: 0xfff3d6, opacity: 0.1, line: 0xff7a6b },
    obstacle: { accent: 0xd4a53a },
    base: { color: 0xffd447, icon: 'DEFEND THE PLATE' },
    spawn: { color: 0xe23a2a, icon: 'ORDER UP' }
  },
  lighting: {
    hemiSky: 0xffe6c4,
    hemiGround: 0x2a1a2c,
    hemiIntensity: 0.4,
    sun: 0xffd6a0,
    sunIntensity: 0.9,
    rim: 0xff5a4a,
    rimIntensity: 0.3,
    accent: 0xff7a6b,
    spotIntensity: 2.3,
    exposure: 0.72
  },
  ui: { accent: '#ff7a6b', dark: '#0f1424' },
  crowd: { fans: [0xff8a6b, 0xfbf7ee, 0x9bd43a, 0xe23a2a, 0xffd447], seat: 0x3a2418 },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    // A flicked edamame bean.
    ball: { mesh: 'orb', flight: 'lob', trail: 'dust', impact: 'spark', color: 0x9bd43a, speed: 11, size: 0.62 },
    // A thrown blade: one long glint.
    curveBall: { mesh: 'tracer', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xe6f2ff, speed: 14 },
    // A rice ball, lobbed.
    headButt: { mesh: 'ball', flight: 'lob', trail: 'dust', impact: 'ring', color: 0xffd9e0, speed: 8.5, size: 1.25 },
    // Shaved ice.
    tackle: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x8fe6ff, speed: 9.5 },
    // The mallet head.
    glove: { mesh: 'block', flight: 'punch', trail: 'dust', impact: 'slam', color: 0xd99a4e, speed: 8.8, size: 1.2 },
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xc9a6ff, speed: 15 },
    flare: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff5a14, speed: 11, size: 0.85 },
    // A lucky star off the cat's paw.
    legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0x1c2f22, accent: 0xff8a6b },
    fire: { body: 'bug', color: 0x86c232, accent: 0xff7a1f },
    flying: { body: 'bug', color: 0xf3dfb0, accent: 0xc98a3c },
    armored: { body: 'bug', color: 0xd8452e, accent: 0xffd9c2 },
    elite: { body: 'bug', color: 0xe9a93c, accent: 0xff5a4a },
    flying_fire: { body: 'bug', color: 0x6fbf3a, accent: 0xff8a1f },
    boss: { body: 'bug', color: 0xa6427f, accent: 0xffd447 }
  },
  towers: { family: 'sushi', base: 0x2a1c16, metal: 0xd7dde5, levelGlow: 0xff7a6b }
};

// ── Shared surfaces ─────────────────────────────────────────────────────────

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

const STEEL = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);
const LACQUER = () => M.paint(0x1a1513, { gloss: 0.9 });
const RED = () => M.paint(0xc62a1a, { gloss: 0.85, glow: 0.12 });
const WOOD = () => M.paint(0xd9b27a, { gloss: 0.3 });
const DARKWOOD = () => M.paint(0x5a3520, { gloss: 0.35 });
const RICE = () => M.paint(0xfbf7ee, { gloss: 0.25, glow: 0.1 });
const NORI = () => M.paint(0x16261c, { gloss: 0.35 });
const SALMON = () => M.paint(0xff8a6b, { gloss: 0.6, glow: 0.15 });
const GOLD = () => M.metal(0xffcc33, { rough: 0.25 });

/** Where shots leave the figure, in model units (see rendering/tower-meshes.js). */
function muzzle(m, x, y, z) {
  m.object.userData.muzzle = { x: x * m.scale, y: y * m.scale, z: z * m.scale };
}

/** A rice ball: rounded triangle of rice with a strip of nori, facing +Z. */
function onigiri(m, k = 1) {
  m.add(G.plate([[-0.1, -0.08], [0.1, -0.08], [0.125, -0.04], [0.035, 0.11], [-0.035, 0.11], [-0.125, -0.04]], 0.1), RICE(), { s: k });
  m.add(G.rbox(0.09, 0.09, 0.106, 0.01), NORI(), { p: [0, -0.04 * k, 0], s: k });
}

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

function chopstickFlicker(m, c) {
  // A lacquer bowl of edamame and a pair of chopsticks, mid-flick.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.12 });
  const bean = M.paint(0x8fd14f, { gloss: 0.5, glow: 0.22 });
  m.add(G.lathe([
    [0.1, 0], [0.13, 0.02], [0.13, 0.05], [0.22, 0.13], [0.28, 0.25], [0.26, 0.26], [0.2, 0.15], [0.1, 0.09], [0, 0.09]
  ]), body, { p: [0, 0.12, -0.03] });
  m.add(G.torus(0.27, 0.012, 6, 24), GOLD(), { p: [0, 0.375, -0.03], r: [HALF_PI, 0, 0] });
  m.add(G.torus(0.125, 0.012, 6, 18), LACQUER(), { p: [0, 0.14, -0.03], r: [HALF_PI, 0, 0] });
  // The pile of pods.
  [[-0.1, 0.33, -0.06, 0.3], [0.08, 0.34, -0.1, 1.2], [0.02, 0.35, 0.06, 2.4], [-0.04, 0.39, -0.02, 0.9], [0.11, 0.33, 0.03, 2.0], [-0.13, 0.32, 0.07, 1.6]].forEach(([x, y, z, a]) => {
    m.add(G.sphere(0.06, 10, 8), bean, { p: [x, y, z - 0.03], r: [0, a, 0], s: [1.9, 0.7, 0.8] });
  });
  // Chopsticks, held at the back, tips forward and up, a bean pinched between.
  const sticks = m.group({ p: [0, 0.36, -0.2], r: [0.8, 0, 0] });
  for (const s of [-1, 1]) {
    sticks.add(G.cyl(0.007, 0.017, 0.66, 8), RED(), { p: [s * 0.03, 0.33, 0], r: [0, 0, s * 0.045] });
    sticks.add(G.cyl(0.019, 0.019, 0.1, 8), GOLD(), { p: [s * 0.04, 0.07, 0], r: [0, 0, s * 0.045] });
  }
  sticks.add(G.sphere(0.045, 10, 8), M.paint(0x9bd43a, { gloss: 0.6, glow: 0.5 }), { p: [0, 0.65, 0], s: [1, 1.7, 0.8] });
  m.anim(sticks.object, 'bob');
  // A rest for the chopsticks' heels, and a bean that got away.
  m.add(G.rbox(0.16, 0.06, 0.07, 0.025), RED(), { p: [0, 0.39, -0.25] });
  m.add(G.sphere(0.045, 8, 6), bean, { p: [0.2, 0.14, 0.22], s: [1.8, 0.7, 0.8] });
  muzzle(m, 0, 0.83, 0.27);
}

function sashimiKnife(m, c) {
  // A long yanagiba on a stand over a whetstone, edge to the enemy.
  const blade = c.bodyMat || M.metal(c.color);
  const wood = DARKWOOD();
  m.add(G.rbox(0.5, 0.045, 0.36, 0.015), WOOD(), { p: [0, 0.143, 0] });                        // cutting board
  m.add(G.rbox(0.2, 0.05, 0.3, 0.012), BLACK(), { p: [0.1, 0.19, 0] });                         // whetstone holder
  m.add(G.rbox(0.17, 0.07, 0.27, 0.012), M.paint(0x8fa3b8, { gloss: 0.2 }), { p: [0.1, 0.245, 0] });
  // Sashimi, sliced and fanned on the board.
  for (let i = 0; i < 3; i++) {
    m.add(G.rbox(0.1, 0.045, 0.05, 0.012), SALMON(), { p: [-0.15, 0.185, -0.08 + i * 0.075], r: [0.5, 0, 0] });
    m.add(G.box(0.102, 0.008, 0.012), RICE(), { p: [-0.15, 0.2, -0.07 + i * 0.075], r: [0.5, 0, 0] });
  }
  // The stand: a turned post with a forked cradle.
  m.add(G.lathe([[0.07, 0], [0.08, 0.02], [0.045, 0.06], [0.035, 0.42], [0.05, 0.47], [0.05, 0.5]], 14), wood, { p: [0, 0.165, -0.12] });
  for (const s of [-1, 1]) m.add(G.rbox(0.022, 0.1, 0.06, 0.008), wood, { p: [s * 0.03, 0.7, -0.12] });
  m.add(G.torus(0.04, 0.012, 6, 14), RED(), { p: [0, 0.6, -0.12], r: [HALF_PI, 0, 0] });
  // The knife.
  const knife = m.group({ p: [0, 0.7, 0] });
  knife.add(G.plate([[0, 0], [0.37, 0], [0.44, 0.04], [0.36, 0.075], [0, 0.075]], 0.014), blade, { p: [0, -0.01, -0.12], r: [0, -HALF_PI, 0] });
  knife.add(G.plate([[0.02, 0.004], [0.38, 0.004], [0.42, 0.03], [0.02, 0.02]], 0.017), STEEL(), { p: [0, -0.01, -0.12], r: [0, -HALF_PI, 0] });   // the ground edge
  knife.add(G.cyl(0.03, 0.026, 0.2, 8), wood, { p: [0, 0.028, -0.225], r: [HALF_PI, 0, 0] });
  knife.add(G.cyl(0.032, 0.032, 0.03, 8), BLACK(), { p: [0, 0.028, -0.125], r: [HALF_PI, 0, 0] });
  knife.add(G.tube([[0, 0.02, -0.33], [0.03, -0.06, -0.34], [0.01, -0.14, -0.33]], 0.008, 5), RED());   // tassel cord
  knife.add(G.sphere(0.02, 8, 6), RED(), { p: [0.01, -0.15, -0.33], s: [1, 1.8, 1] });
  m.anim(knife.object, 'bob');
  const glint = m.add(G.star(0.05, 0.016, 0.006, 4), M.glow(0xffffff, 0.9), { p: [0.012, 0.735, 0.3], r: [0, HALF_PI, 0], shadow: false });
  m.anim(glint, 'blink');
  muzzle(m, 0, 0.72, 0.32);
}

function riceCooker(m, c) {
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.1 });
  const white = M.paint(0xf7f4ee, { gloss: 0.8 });
  m.add(G.lathe([[0.2, 0], [0.26, 0.025], [0.29, 0.1], [0.29, 0.3], [0.27, 0.35], [0.24, 0.36], [0, 0.36]], 28), body, { p: [0, 0.13, 0] });
  m.add(G.cyl(0.24, 0.22, 0.03, 24), BLACK(), { p: [0, 0.13, 0] });
  m.add(G.torus(0.255, 0.018, 8, 28), STEEL(), { p: [0, 0.49, 0], r: [HALF_PI, 0, 0] });
  // Rice, heaped over the rim.
  m.add(G.sphere(0.235, 18, 10), RICE(), { p: [0, 0.485, 0], s: [1, 0.36, 1] });
  // The lid, flipped up at the back on its hinge.
  const lid = m.group({ p: [0, 0.5, -0.25], r: [-1.2, 0, 0] });
  lid.add(G.lathe([[0.2, 0], [0.19, 0.035], [0.11, 0.07], [0, 0.075]], 20), white, { p: [0, 0, 0.2] });
  lid.add(G.cyl(0.19, 0.19, 0.012, 20), STEEL(), { p: [0, -0.004, 0.2] });
  lid.add(G.rbox(0.07, 0.03, 0.04, 0.012), BLACK(), { p: [0, 0.09, 0.2] });
  m.add(G.rbox(0.12, 0.05, 0.05, 0.015), BLACK(), { p: [0, 0.48, -0.27] });                      // hinge
  // Control panel: cook and warm lamps, and the switch.
  m.add(G.rbox(0.17, 0.13, 0.03, 0.012), white, { p: [0, 0.28, 0.283] });
  m.add(G.sphere(0.018, 8, 6), M.glow(0xff7a1f), { p: [-0.045, 0.31, 0.3], shadow: false });
  m.add(G.sphere(0.018, 8, 6), M.glow(0x56ff9a), { p: [0.045, 0.31, 0.3], shadow: false });
  m.add(G.rbox(0.07, 0.03, 0.03, 0.01), BLACK(), { p: [0, 0.25, 0.305] });
  for (const s of [-1, 1]) m.add(G.rbox(0.05, 0.035, 0.1, 0.015), BLACK(), { p: [s * 0.3, 0.4, 0] });   // carry handles
  // A paddle stuck in the rice, and the next rice ball on its way up.
  m.add(G.plate([[-0.02, 0], [0.02, 0], [0.022, 0.13], [0.05, 0.19], [0.045, 0.26], [0, 0.29], [-0.045, 0.26], [-0.05, 0.19], [-0.022, 0.13]], 0.012), WOOD(), { p: [0.15, 0.48, -0.06], r: [0.25, 0.5, -0.35] });
  const ball = m.group({ p: [0, 0.69, 0.03] });
  onigiri(ball, 1.05);
  m.anim(ball.object, 'bob');
  for (let i = 0; i < 2; i++) {
    const puff = m.add(G.sphere(0.045 + i * 0.012, 10, 8), M.energy(0xffffff, 0.3 - i * 0.08), { p: [-0.13 + i * 0.03, 0.62 + i * 0.1, -0.02], shadow: false });
    m.anim(puff, 'pulse', { offset: i * 1.5 });
  }
  muzzle(m, 0, 0.74, 0.06);
}

function iceShaver(m, c) {
  // A hand-cranked kakigori machine: cast frame, a block of ice under the
  // press, a bowl of blue shaved ice below, a chute that throws it forward.
  const cast = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.12 });
  const ice = M.glass(0xe6f8ff, 0.72);
  m.add(G.rbox(0.46, 0.05, 0.42, 0.02), cast, { p: [0, 0.145, 0] });
  for (const s of [-1, 1]) {
    m.add(G.plate([[-0.08, 0], [0.08, 0], [0.05, 0.14], [0.035, 0.44], [0.06, 0.56], [-0.06, 0.56], [-0.035, 0.44], [-0.05, 0.14]], 0.045), cast, { p: [s * 0.2, 0.17, -0.02], r: [0, HALF_PI, 0] });
  }
  m.add(G.rbox(0.45, 0.07, 0.13, 0.025), cast, { p: [0, 0.74, -0.02] });
  m.add(G.rbox(0.2, 0.05, 0.016, 0.006), M.paint(0xf7f4ee, { gloss: 0.5 }), { p: [0, 0.74, 0.05] });   // maker's plate
  // The press: a screw through the top bar, a spiked plate, the ice.
  m.add(G.cyl(0.018, 0.018, 0.26, 8), STEEL(), { p: [0, 0.74, -0.02] });
  m.add(G.cyl(0.1, 0.1, 0.02, 16), STEEL(), { p: [0, 0.625, -0.02] });
  m.add(G.rbox(0.22, 0.19, 0.22, 0.02), ice, { p: [0, 0.52, -0.02] });
  m.add(G.rbox(0.16, 0.13, 0.16, 0.02), M.energy(0xbfefff, 0.35), { p: [0, 0.52, -0.02], shadow: false });
  m.add(G.rbox(0.36, 0.025, 0.28, 0.01), STEEL(), { p: [0, 0.41, -0.02] });                     // blade table
  const wheel = m.group({ p: [0, 0.87, -0.02] });
  wheel.add(G.torus(0.13, 0.016, 6, 22), cast, { r: [HALF_PI, 0, 0] });
  for (let i = 0; i < 3; i++) wheel.add(G.box(0.26, 0.014, 0.022), cast, { r: [0, i * Math.PI / 3, 0] });
  wheel.add(G.cyl(0.018, 0.022, 0.07, 8), DARKWOOD(), { p: [0.13, 0.04, 0] });
  m.anim(wheel.object, 'spin', { speed: 1.4 });
  // The bowl, heaped, with syrup.
  m.add(G.lathe([[0.06, 0], [0.08, 0.015], [0.15, 0.09], [0.17, 0.1], [0.14, 0.08], [0.06, 0.03], [0, 0.03]], 18), M.glass(0xffffff, 0.6), { p: [0, 0.17, 0.02] });
  m.add(G.lathe([[0.14, 0], [0.12, 0.07], [0.06, 0.13], [0, 0.15]], 14), M.paint(0xf4fbff, { gloss: 0.3, glow: 0.2 }), { p: [0, 0.25, 0.02] });
  m.add(G.lathe([[0.075, 0], [0.04, 0.045], [0, 0.06]], 12), M.paint(c.color, { gloss: 0.7, glow: 0.45 }), { p: [0, 0.345, 0.02] });
  // The chute, and what is coming down it.
  m.add(G.plate([[-0.08, 0], [0.08, 0], [0.05, 0.17], [-0.05, 0.17]], 0.012), STEEL(), { p: [0, 0.4, 0.12], r: [1.95, 0, 0] });
  const spray = m.group({ p: [0, 0.38, 0.31] });
  for (const [x, y, z, k] of [[0, 0, 0, 1], [0.05, 0.03, -0.03, 0.7], [-0.045, -0.02, -0.02, 0.75]]) {
    spray.add(new THREE.OctahedronGeometry(0.035, 0), M.energy(0xdff6ff, 0.7), { p: [x, y, z], s: [k, k, k * 1.8], shadow: false });
  }
  m.anim(spray.object, 'pulse');
  muzzle(m, 0, 0.4, 0.3);
}

function mochiMallet(m, c) {
  // A trip-hammer over a mortar of mochi: it flattens whatever comes close.
  const wood = c.bodyMat || M.paint(c.color, { gloss: 0.4, glow: 0.08 });
  const pale = WOOD();
  const iron = M.metal(0x3b4048, { rough: 0.5 });
  // The mortar (usu), hollowed from a log, roped round the rim.
  m.add(G.lathe([
    [0.19, 0], [0.22, 0.03], [0.21, 0.1], [0.24, 0.24], [0.25, 0.3], [0.22, 0.31], [0.19, 0.24], [0.1, 0.17], [0, 0.17]
  ], 22), wood, { p: [0, 0.12, 0.07] });
  m.add(G.torus(0.25, 0.018, 6, 24), M.paint(0xe9d9a6, { gloss: 0.15 }), { p: [0, 0.37, 0.07], r: [HALF_PI, 0, 0] });
  m.add(G.torus(0.215, 0.014, 6, 24), iron, { p: [0, 0.2, 0.07], r: [HALF_PI, 0, 0] });
  m.add(G.sphere(0.19, 16, 10), M.paint(0xfdfaf2, { gloss: 0.7, glow: 0.15 }), { p: [0, 0.39, 0.07], s: [1, 0.42, 1] });   // mochi
  // The post and pivot at the back.
  for (const s of [-1, 1]) m.add(G.rbox(0.04, 0.4, 0.07, 0.012), pale, { p: [s * 0.055, 0.32, -0.25] });
  m.add(G.rbox(0.2, 0.04, 0.12, 0.012), pale, { p: [0, 0.14, -0.25] });
  m.add(G.cyl(0.018, 0.018, 0.17, 8), iron, { p: [0, 0.45, -0.25], r: [0, 0, HALF_PI] });
  // The mallet (kine): long handle, heavy banded head.
  const mallet = m.group({ p: [0, 0.45, -0.25], r: [0.72, 0, 0] });
  mallet.add(G.cyl(0.02, 0.024, 0.56, 8), pale, { p: [0, 0.2, 0] });
  mallet.add(G.cyl(0.09, 0.09, 0.3, 16), wood, { p: [0, 0.42, 0.05], r: [HALF_PI, 0, 0] });
  for (const z of [-0.07, 0.17]) mallet.add(G.cyl(0.094, 0.094, 0.03, 16), iron, { p: [0, 0.42, z], r: [HALF_PI, 0, 0] });
  mallet.add(G.cyl(0.075, 0.075, 0.012, 16), M.paint(0xf3e3c0, { gloss: 0.3 }), { p: [0, 0.42, 0.203], r: [HALF_PI, 0, 0] });   // the striking face
  mallet.add(G.sphere(0.07, 10, 8), M.paint(0xfdfaf2, { gloss: 0.7 }), { p: [0, 0.4, 0.22], s: [0.9, 0.9, 0.35] });           // mochi stuck to it
  m.anim(mallet.object, 'bob');
  muzzle(m, 0, 0.62, 0.24);
}

function eelJar(m, c) {
  // An eel in a jar, wired up: the arcs leave from the terminals on the lid.
  const lidMat = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.2 });
  const copper = M.metal(0xc97a3a, { rough: 0.3 });
  m.add(G.lathe([[0.22, 0], [0.26, 0.02], [0.26, 0.06], [0.23, 0.08], [0, 0.08]], 24), LACQUER(), { p: [0, 0.12, 0] });
  m.add(G.cyl(0.215, 0.215, 0.012, 24), M.paint(0xd8c9a0, { gloss: 0.2 }), { p: [0, 0.205, 0] });            // sand
  m.add(G.lathe([[0.225, 0], [0.24, 0.04], [0.24, 0.4], [0.2, 0.47], [0.18, 0.49]], 24), M.glass(0xbfeaff, 0.32), { p: [0, 0.2, 0] });
  m.add(G.cyl(0.225, 0.225, 0.4, 20), M.energy(c.color, 0.16), { p: [0, 0.41, 0], shadow: false });
  // The eel: one lazy coil, head up at the front, turning in its jar.
  const eel = m.group({ p: [0, 0.22, 0] });
  const skin = M.paint(0x1f4e5a, { gloss: 0.8, glow: 0.12 });
  const coil = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14, a = -1.2 + t * 8.2, r = 0.15 - t * 0.03;
    coil.push([Math.sin(a) * r, 0.04 + t * 0.36, Math.cos(a) * r]);
  }
  eel.add(G.tube(coil, 0.042, 8), skin);
  const [hx, hy, hz] = coil[14];
  eel.add(G.sphere(0.06, 12, 10), skin, { p: [hx, hy + 0.01, hz], s: [1, 0.85, 1.25] });
  eel.add(G.sphere(0.036, 8, 6), skin, { p: coil[0] });
  for (const s of [-1, 1]) eel.add(G.sphere(0.017, 8, 6), M.glow(0xfff27a), { p: [hx + s * 0.035, hy + 0.035, hz + 0.045], shadow: false });
  for (let i = 2; i < 13; i += 2) eel.add(G.sphere(0.02, 6, 5), M.glow(c.color), { p: [coil[i][0] * 1.22, coil[i][1], coil[i][2] * 1.22], shadow: false });
  m.anim(eel.object, 'spin', { speed: 0.35 });
  // Lid, terminals and the lead down to the base.
  m.add(G.lathe([[0.2, 0], [0.21, 0.02], [0.2, 0.06], [0.1, 0.085], [0, 0.085]], 22), lidMat, { p: [0, 0.685, 0] });
  m.add(G.tube([[0.2, 0.72, -0.05], [0.29, 0.6, -0.08], [0.27, 0.3, -0.08], [0.24, 0.17, -0.06]], 0.012, 6), RED());
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.03, 0.035, 0.03, 10), BLACK(), { p: [s * 0.1, 0.775, 0] });
    m.add(G.cyl(0.012, 0.016, 0.12, 8), copper, { p: [s * 0.1, 0.83, 0] });
    const tip = m.add(G.sphere(0.035, 10, 8), M.glow(c.color), { p: [s * 0.1, 0.895, 0], shadow: false });
    m.anim(tip, 'pulse', { offset: s > 0 ? 1.5 : 0 });
  }
  const arc = m.add(G.tube([[-0.1, 0.895, 0], [-0.05, 0.915, 0.02], [0, 0.885, -0.015], [0.05, 0.915, 0.01], [0.1, 0.895, 0]], 0.008, 4), M.glow(0xffffff, 0.9), { shadow: false });
  m.anim(arc, 'blink');
  muzzle(m, 0, 0.9, 0);
}

function charcoalGrill(m, c) {
  // A table-top konro: glazed pot, live coals, skewers, a fan to keep it angry.
  const glaze = c.bodyMat || M.paint(c.color, { gloss: 0.8, glow: 0.15 });
  const iron = M.metal(0x2f3238, { rough: 0.55 });
  const ember = M.glow(0xff8a1f);
  m.add(G.rbox(0.44, 0.035, 0.44, 0.012), DARKWOOD(), { p: [0, 0.138, 0] });
  m.add(G.lathe([
    [0.18, 0], [0.22, 0.02], [0.25, 0.2], [0.27, 0.3], [0.27, 0.34], [0.23, 0.345], [0.21, 0.28], [0, 0.27]
  ], 24), glaze, { p: [0, 0.155, 0] });
  for (const y of [0.22, 0.46]) m.add(G.torus(y < 0.3 ? 0.228 : 0.272, 0.014, 6, 26), iron, { p: [0, y, 0], r: [HALF_PI, 0, 0] });
  // Coals.
  m.add(G.cyl(0.22, 0.22, 0.02, 20), BLACK(), { p: [0, 0.44, 0] });
  [[-0.1, -0.05], [0.07, -0.09], [0.11, 0.06], [-0.04, 0.1], [0, 0], [-0.14, 0.08]].forEach(([x, z], i) => {
    m.add(G.rbox(0.09, 0.05, 0.07, 0.018), i % 3 ? ember : BLACK(), { p: [x, 0.465, z], r: [0, i * 1.1, 0] });
  });
  // Grate, and two skewers across it.
  for (let i = -2; i <= 2; i++) m.add(G.cyl(0.006, 0.006, 0.5 - Math.abs(i) * 0.05, 5), iron, { p: [i * 0.08, 0.505, 0], r: [HALF_PI, 0, 0] });
  const meat = M.paint(0xb9642a, { gloss: 0.5, glow: 0.1 }), leek = M.paint(0xcfe58a, { gloss: 0.4 });
  for (const z of [-0.08, 0.06]) {
    m.add(G.cyl(0.007, 0.007, 0.56, 5), WOOD(), { p: [0.03, 0.525, z], r: [0, 0, HALF_PI] });
    for (let i = 0; i < 4; i++) m.add(G.rbox(0.07, 0.05, 0.06, 0.018), i % 2 ? leek : meat, { p: [-0.13 + i * 0.085, 0.527, z] });
  }
  // The vent at the front, breathing fire.
  m.add(G.rbox(0.15, 0.1, 0.03, 0.012), iron, { p: [0, 0.3, 0.238] });
  m.add(G.rbox(0.11, 0.06, 0.02, 0.008), ember, { p: [0, 0.3, 0.25], shadow: false });
  const jet = m.group({ p: [0, 0.3, 0.255], r: [HALF_PI, 0, 0] });
  jet.add(G.cone(0.045, 0.16, 8), M.energy(0xff6a1a, 0.85), { p: [0, 0.08, 0], shadow: false });
  jet.add(G.cone(0.022, 0.1, 6), M.glow(0xffe27a), { p: [0, 0.05, 0], shadow: false });
  m.anim(jet.object, 'flame');
  for (const [x, z, h, o] of [[-0.06, -0.02, 0.2, 0], [0.09, 0.03, 0.15, 2]]) {
    const lick = m.group({ p: [x, 0.5, z] });
    lick.add(G.cone(0.045, h, 7), M.energy(0xff7a1f, 0.8), { p: [0, h / 2, 0], shadow: false });
    m.anim(lick.object, 'flame', { offset: o });
  }
  // The fan (uchiwa), standing at the back.
  const fan = m.group({ p: [0, 0.5, -0.27], r: [-0.12, 0, 0] });
  fan.add(G.cyl(0.012, 0.014, 0.2, 6), WOOD(), { p: [0, 0.02, 0] });
  fan.add(G.cyl(0.17, 0.17, 0.014, 22), M.paint(0xf7f1e2, { gloss: 0.2 }), { p: [0, 0.23, 0], r: [HALF_PI, 0, 0], s: [1, 1, 0.95] });
  fan.add(G.cyl(0.075, 0.075, 0.018, 18), RED(), { p: [0, 0.24, 0], r: [HALF_PI, 0, 0] });
  m.anim(fan.object, 'bob');
  muzzle(m, 0, 0.3, 0.32);
}

function luckyCat(m, c) {
  // A golden maneki-neko on a cushion, one enormous paw raised to swat.
  const gold = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.2 });
  const white = M.paint(0xfdfaf2, { gloss: 0.7 });
  const red = RED();
  const pink = M.paint(0xff9aa8, { gloss: 0.5, glow: 0.15 });
  const ink = M.glow(0x1a1513);
  m.add(G.lathe([[0.24, 0], [0.28, 0.02], [0.28, 0.05], [0.24, 0.07], [0, 0.07]], 22), red, { p: [0, 0.12, 0] });       // cushion
  for (let i = 0; i < 4; i++) m.add(G.sphere(0.025, 8, 6), GOLD(), { p: [Math.sin(i * HALF_PI + 0.78) * 0.28, 0.155, Math.cos(i * HALF_PI + 0.78) * 0.28] });
  m.add(G.lathe([[0.16, 0], [0.22, 0.04], [0.23, 0.14], [0.2, 0.27], [0.14, 0.35], [0, 0.37]], 20), gold, { p: [0, 0.18, -0.01] });   // body
  m.add(G.sphere(0.15, 14, 10), white, { p: [0, 0.34, 0.1], s: [0.95, 1.05, 0.6] });                                    // bib
  m.add(G.sphere(0.2, 18, 14), gold, { p: [0, 0.63, 0.01], s: [1.1, 0.92, 1] });                                        // head
  for (const s of [-1, 1]) {
    m.add(G.cone(0.075, 0.13, 4), gold, { p: [s * 0.13, 0.82, 0], r: [0, Math.PI / 4, -s * 0.25] });
    m.add(G.cone(0.045, 0.085, 4), red, { p: [s * 0.13, 0.81, 0.022], r: [0, Math.PI / 4, -s * 0.25] });
    m.add(G.torus(0.035, 0.009, 5, 12, Math.PI), ink, { p: [s * 0.085, 0.655, 0.197], shadow: false });               // happy shut eyes
    for (const a of [-0.18, 0.12]) m.add(G.cyl(0.004, 0.004, 0.13, 4), ink, { p: [s * 0.2, 0.6 + a * 0.12, 0.15], r: [0, 0, HALF_PI + s * a], shadow: false });
    m.add(G.sphere(0.07, 10, 8), gold, { p: [s * 0.1, 0.2, 0.19], s: [1, 0.7, 1.2] });                                  // feet
  }
  m.add(G.sphere(0.022, 8, 6), pink, { p: [0, 0.615, 0.21] });
  m.add(G.torus(0.15, 0.024, 8, 22), red, { p: [0, 0.5, 0.01], r: [HALF_PI, 0, 0] });                                   // collar
  m.add(G.sphere(0.042, 10, 8), GOLD(), { p: [0, 0.465, 0.16] });                                                       // bell
  m.add(G.sphere(0.07, 10, 8), gold, { p: [0.05, 0.24, -0.23] });                                                       // tail
  // The coin it keeps, and the left paw holding it.
  m.add(G.cyl(0.085, 0.085, 0.02, 18), GOLD(), { p: [-0.12, 0.33, 0.215], r: [HALF_PI, 0, 0.15], s: [0.72, 1, 1] });
  for (let i = 0; i < 3; i++) m.add(G.box(0.07, 0.008, 0.004), ink, { p: [-0.12, 0.31 + i * 0.022, 0.228], r: [0, 0, 0.15], shadow: false });
  m.add(G.sphere(0.065, 10, 8), gold, { p: [-0.2, 0.36, 0.14], s: [0.9, 1.2, 1] });
  // The big paw.
  const paw = m.group({ p: [0.2, 0.5, 0.04] });
  paw.add(G.cyl(0.05, 0.065, 0.2, 10), gold, { p: [0.01, 0.08, 0.02], r: [0.2, 0, -0.12] });
  paw.add(G.sphere(0.115, 14, 12), gold, { p: [0.03, 0.25, 0.07], s: [1, 1.08, 0.85] });
  paw.add(G.sphere(0.045, 8, 6), pink, { p: [0.03, 0.225, 0.155], s: [1.2, 0.9, 0.5] });
  for (const dx of [-0.055, 0, 0.055]) paw.add(G.sphere(0.026, 8, 6), pink, { p: [0.03 + dx, 0.3 - Math.abs(dx) * 0.3, 0.15], s: [1, 1, 0.5] });
  m.anim(paw.object, 'bob');
  const star = m.add(G.star(0.055, 0.022, 0.012), M.glow(0xfff3a0), { p: [0.23, 0.9, 0.12], shadow: false });
  m.anim(star, 'float');
  muzzle(m, 0.23, 0.76, 0.2);
}

const TOWERS = [chopstickFlicker, sashimiKnife, riceCooker, iceShaver, mochiMallet, eelJar, charcoalGrill, luckyCat];

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
const FAN = [[0, 0], [0.15, 0.26], [0.06, 0.4], [0, 0.34], [-0.06, 0.4], [-0.15, 0.26]];

function maki(m, enemy, c) {
  // A slice of maki that has seen the soy sauce coming: all eyes and legs.
  const nori = M.paint(c.color, { gloss: 0.4, glow: 0.08 });
  const white = RICE();
  m.add(G.lathe([[0, 0], [0.58, 0], [0.63, 0.05], [0.63, 0.72], [0.6, 0.77], [0, 0.77]], 22), nori, { p: [0, -0.42, 0] });
  m.add(G.sphere(0.575, 18, 8), white, { p: [0, 0.34, 0], s: [1, 0.22, 1] });                                   // rice, seen from above
  m.add(G.cyl(0.27, 0.27, 0.06, 16), M.paint(c.accent, { gloss: 0.6, glow: 0.35 }), { p: [0, 0.45, 0] });       // salmon
  m.add(G.cyl(0.11, 0.11, 0.07, 10), M.paint(0x7cc242, { gloss: 0.5, glow: 0.25 }), { p: [0.17, 0.455, -0.11] });   // cucumber
  m.add(G.cyl(0.1, 0.1, 0.07, 10), M.paint(0xffd447, { gloss: 0.5, glow: 0.25 }), { p: [-0.16, 0.455, 0.1] });      // egg
  m.add(G.torus(0.6, 0.045, 6, 22), white, { p: [0, -0.42, 0], r: [HALF_PI, 0, 0] });                            // rice at the foot
  eyes(m, { x: 0.23, y: 0.08, z: 0.57, r: 0.18, brow: -0.35, browMat: white });
  m.add(G.sphere(0.1, 8, 6), M.glow(0x7a1626), { p: [0, -0.2, 0.61], s: [1, 1.25, 0.4], shadow: false });        // a small scream
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.9, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.6, 0.02, 0.05] });
    arm.add(G.cyl(0.05, 0.05, 0.34, 6), nori, { p: [s * 0.1, 0.13, 0], r: [0, 0, -s * 0.65] });
    arm.add(G.sphere(0.1, 8, 6), white, { p: [s * 0.22, 0.28, 0] });
  }
  legs(m, nori, RED(), { x: 0.26, hip: -0.4, len: 0.44, r: 0.08 });
}

function wasabi(m, enemy, c) {
  // A piped blob of wasabi with a temper: it hops, and its head is on fire.
  const paste = M.paint(c.color, { gloss: 0.45, glow: 0.22 });
  const dark = M.matte(0x2f5a12);
  m.add(G.lathe([
    [0, 0], [0.66, 0], [0.78, 0.1], [0.74, 0.3], [0.52, 0.42], [0.58, 0.54], [0.5, 0.72], [0.3, 0.82], [0.34, 0.94], [0.2, 1.14], [0.06, 1.3], [0, 1.32]
  ], 20), paste, { p: [0, -0.93, 0] });
  for (const [y, r] of [[-0.5, 0.56], [-0.1, 0.34]]) m.add(G.torus(r, 0.035, 5, 20), dark, { p: [0, y, 0], r: [HALF_PI, 0, 0] });   // the piping's creases
  eyes(m, { x: 0.26, y: -0.5, z: 0.63, r: 0.17, brow: 0.5, browMat: dark });
  m.add(G.rbox(0.36, 0.13, 0.06, 0.03), M.glow(0x3a0d08), { p: [0, -0.78, 0.74], shadow: false });
  for (const x of [-0.1, 0, 0.1]) m.add(G.box(0.08, 0.07, 0.03), M.glow(0xffffff), { p: [x, -0.76, 0.775], shadow: false });        // gritted teeth
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.2, 10, 8), paste, { p: [s * 0.42, -0.88, 0.42], s: [1, 0.5, 1.3] });                                    // feet
    m.add(G.cone(0.05, 0.16, 5), M.paint(0xd92b2b, { glow: 0.5 }), { p: [s * 0.5, -0.3, 0.3], r: [0.4, 0, -s * 1.1] });      // chilli flecks
  }
  flame(m, enemy, { p: [0, 0.3, 0], rad: 0.24, h: 0.75 });
  flame(m, enemy, { p: [-0.3, -0.12, -0.15], rad: 0.13, h: 0.4, color: 0xffb347 });
  flame(m, enemy, { p: [0.3, -0.12, -0.15], rad: 0.13, h: 0.4, color: 0xffb347 });
}

function gyoza(m, enemy, c) {
  // A pan-fried dumpling that grew wings and left before the dipping sauce.
  const skin = M.paint(c.color, { gloss: 0.45, glow: 0.2 });
  const seared = M.paint(c.accent, { gloss: 0.5, glow: 0.12 });
  m.add(G.sphere(0.62, 18, 12), skin, { p: [0, 0, 0], s: [1.3, 0.78, 0.74] });
  m.add(G.sphere(0.6, 16, 8), seared, { p: [0, -0.3, 0], s: [1.24, 0.34, 0.68] });                 // the browned underside
  // The crimped seam over the top.
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI, x = Math.cos(a) * 0.74, y = Math.sin(a) * 0.52;
    m.add(G.sphere(0.13, 8, 6), skin, { p: [x, y - 0.02, -0.14], r: [0, 0, a - HALF_PI], s: [0.75, 1.15, 0.8] });
  }
  eyes(m, { x: 0.27, y: 0.05, z: 0.4, r: 0.15 });
  for (const s of [-1, 1]) m.add(G.sphere(0.09, 8, 6), M.paint(0xff9aa8, { glow: 0.3 }), { p: [s * 0.5, -0.1, 0.36], s: [1, 0.6, 0.4] });   // blush
  m.add(G.torus(0.09, 0.025, 5, 10, Math.PI), M.glow(0x7a1626), { p: [0, -0.1, 0.46], r: [0, 0, Math.PI], shadow: false });               // grin
  wings(m, enemy, M.paint(0xffffff, { gloss: 0.4, glow: 0.3 }), FEATHER, { y: 0.16, z: -0.02, hinge: 0.68 });
}

function crab(m, enemy, c) {
  // Low, wide and plated: claws up, eyes on stalks.
  const shell = M.paint(c.color, { gloss: 0.85, glow: 0.14 });
  const under = M.paint(c.accent, { gloss: 0.4, glow: 0.1 });
  const dark = M.paint(0x8a1f14, { gloss: 0.6 });
  m.add(G.sphere(0.85, 18, 12), shell, { p: [0, -0.12, -0.05], s: [1.12, 0.52, 0.86] });
  m.add(G.sphere(0.8, 16, 8), under, { p: [0, -0.3, -0.03], s: [1.05, 0.34, 0.8] });
  // Plates: a ridge down the middle, studs round the front rim.
  m.add(G.sphere(0.4, 12, 8), dark, { p: [0, 0.22, -0.1], s: [1.3, 0.4, 1.0] });
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.42;
    m.add(G.cone(0.09, 0.2, 6), under, { p: [Math.sin(a) * 0.86, 0.02, 0.6 * Math.cos(a) + 0.05], r: [1.0, 0, -Math.sin(a) * 0.6] });
  }
  for (const [x, z] of [[-0.5, -0.3], [0.5, -0.3], [-0.6, 0.15], [0.6, 0.15], [0, -0.5]]) m.add(G.sphere(0.09, 8, 6), under, { p: [x, 0.22, z], s: [1, 0.4, 1] });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.22, 0.2, 0.5], [s * 0.26, 0.5, 0.6], [s * 0.27, 0.66, 0.66]], 0.05, 6), shell);
    // The claw: arm, fist, two pincers; it snaps as it walks.
    const claw = part(m, { k: 'swing', ax: 'x', amp: 0.22, f: 2, ph: s > 0 ? 0 : 1.6 }, { p: [s * 0.82, -0.1, 0.35] });
    claw.add(G.tube([[0, 0, 0], [s * 0.2, 0.12, 0.2], [s * 0.16, 0.3, 0.42]], 0.1, 6), shell);
    claw.add(G.sphere(0.27, 12, 10), shell, { p: [s * 0.14, 0.36, 0.6], s: [0.75, 0.8, 1.1] });
    claw.add(G.cone(0.13, 0.42, 8), shell, { p: [s * 0.14, 0.48, 0.95], r: [HALF_PI - 0.25, 0, 0], s: [0.7, 1, 1] });
    claw.add(G.cone(0.09, 0.34, 8), under, { p: [s * 0.14, 0.24, 0.9], r: [HALF_PI + 0.2, 0, 0], s: [0.7, 1, 1] });
    // Three walking legs a side.
    for (let i = 0; i < 3; i++) {
      const leg = part(m, { k: 'swing', ax: 'z', amp: 0.28, ph: (i + (s > 0 ? 0 : 1)) * Math.PI }, { p: [s * 0.72, -0.28, -0.42 + i * 0.3] });
      leg.add(G.tube([[0, 0, 0], [s * 0.3, 0.22, (i - 1) * 0.06], [s * 0.5, -0.62, (i - 1) * 0.14]], 0.065, 5), shell);
      leg.add(G.cone(0.06, 0.16, 5), dark, { p: [s * 0.5, -0.64, (i - 1) * 0.14], r: [Math.PI, 0, 0] });
    }
  }
  eyes(m, { x: 0.27, y: 0.7, z: 0.68, r: 0.15, brow: 0.45, browMat: dark });
}

function tempuraSamurai(m, enemy, c) {
  // A prawn in batter and armour, tail up like a topknot, skewer drawn.
  const batter = M.paint(c.color, { gloss: 0.3, glow: 0.18 });
  const tail = M.paint(c.accent, { gloss: 0.6, glow: 0.5 });
  const plate = M.paint(0x231a2e, { gloss: 0.85 });
  const lace = M.paint(0xffd447, { gloss: 0.6, glow: 0.35 });
  m.add(G.capsule(0.42, 1.28, 16), batter, { p: [0, -0.62, 0], r: [0.1, 0, 0] });
  // Crisp lumps of batter all over.
  for (let i = 0; i < 12; i++) {
    const a = i * 2.4, y = -0.45 + (i % 6) * 0.2 + (i > 5 ? 0.08 : 0), r = 0.38;
    m.add(G.sphere(0.14 + (i % 3) * 0.025, 7, 6), batter, { p: [Math.sin(a) * r, y, Math.cos(a) * r + y * 0.1] });
  }
  // Armour: a lacquered cuirass laced in gold, and shoulder guards.
  m.add(G.sleeve(0.47, 0.5, 0.42, 18), plate, { p: [0, -0.2, -0.02] });
  for (const y of [-0.34, -0.2, -0.06]) m.add(G.torus(0.49, 0.022, 5, 20), lace, { p: [0, y, -0.02], r: [HALF_PI, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.26, 0.3, 0.34, 0.05), plate, { p: [s * 0.56, 0.02, 0], r: [0, 0, s * 0.35] });
    m.add(G.box(0.27, 0.03, 0.35), lace, { p: [s * 0.58, -0.06, 0], r: [0, 0, s * 0.35] });
  }
  // Headband with the knot flying behind.
  m.add(G.torus(0.43, 0.05, 6, 20), M.paint(0xfbf7ee, { gloss: 0.3, glow: 0.2 }), { p: [0, 0.42, 0.03], r: [HALF_PI - 0.1, 0, 0] });
  m.add(G.cyl(0.09, 0.09, 0.03, 12), M.glow(0xe23a2a), { p: [0, 0.4, 0.46], r: [HALF_PI, 0, 0], shadow: false });
  for (const s of [-1, 1]) m.add(G.box(0.07, 0.03, 0.32), M.paint(0xfbf7ee, { glow: 0.2 }), { p: [s * 0.08, 0.42, -0.56], r: [0.3 * s, s * 0.25, 0] });
  // The tail, fanned out on top.
  for (const a of [-0.55, 0, 0.55]) m.add(G.plate(FAN, 0.07), tail, { p: [0, 0.62, -0.08], r: [-0.25, 0, a], s: 1.25 });
  eyes(m, { x: 0.17, y: 0.2, z: 0.4, r: 0.11, color: 0xfff3c2, brow: 0.5, browMat: plate });
  // Feelers swept back.
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.1, 0.5, 0.36], [s * 0.4, 0.95, 0.3], [s * 0.6, 0.9, -0.3]], 0.022, 5), tail);
  // Sword arm: a bamboo skewer, sizzling at the tip.
  const arm = part(m, { k: 'swing', ax: 'x', amp: 0.35, ph: 0 }, { p: [0.5, -0.12, 0.2] });
  arm.add(G.tube([[0, 0, 0], [0.12, -0.08, 0.2], [0.08, 0.02, 0.38]], 0.07, 6), batter);
  arm.add(G.cyl(0.03, 0.03, 0.95, 6), M.paint(0xe8d3a0, { gloss: 0.3 }), { p: [0.08, 0.3, 0.52], r: [0.5, 0, 0] });
  arm.add(G.cyl(0.05, 0.05, 0.22, 8), M.paint(0xc62a1a, { gloss: 0.7 }), { p: [0.08, -0.02, 0.345], r: [0.5, 0, 0] });
  arm.add(G.cyl(0.085, 0.085, 0.025, 10), lace, { p: [0.08, 0.085, 0.4], r: [0.5, 0, 0] });
  flame(arm, enemy, { p: [0.08, 0.7, 0.74], r: [0.5, 0, 0], rad: 0.09, h: 0.34 });
  const off = part(m, { k: 'swing', ax: 'x', amp: 0.6, ph: Math.PI }, { p: [-0.5, -0.12, 0.1] });
  off.add(G.tube([[0, 0, 0], [-0.14, -0.2, 0.1], [-0.12, -0.34, 0.26]], 0.07, 6), batter);
  legs(m, batter, plate, { x: 0.2, hip: -0.55, len: 0.3, r: 0.085, amp: 0.7 });
}

function dragonRoll(m, enemy, c) {
  // A dragon roll that took the name seriously: avocado scales, a prawn's
  // tail, and breath that could sear tuna.
  const scale = M.paint(c.color, { gloss: 0.6, glow: 0.22 });
  const scale2 = M.paint(0xb9e05c, { gloss: 0.6, glow: 0.22 });
  const roe = M.paint(c.accent, { gloss: 0.7, glow: 0.6 });
  const white = RICE();
  const horn = M.paint(0xe9a93c, { gloss: 0.3, glow: 0.2 });
  for (let i = 0; i < 4; i++) {
    const z = 0.32 - i * 0.37, r = 0.36 - i * 0.045, y = Math.sin(i * 1.5 + 0.4) * 0.07;
    m.add(G.cyl(r, r, 0.3, 16), white, { p: [0, y, z], r: [HALF_PI, 0, 0] });
    m.add(G.sphere(r * 1.08, 12, 8), i % 2 ? scale2 : scale, { p: [0, y + r * 0.36, z], s: [1.03, 0.78, 0.44] });
    m.add(G.cone(0.075, 0.22, 5), roe, { p: [0, y + r * 1.22, z - 0.04], r: [-0.3, 0, 0] });
    for (const s of [-1, 1]) m.add(G.sphere(0.055, 6, 5), roe, { p: [s * r * 0.98, y - r * 0.25, z] });
  }
  // Head.
  m.add(G.sphere(0.36, 14, 12), scale, { p: [0, 0.1, 0.72], s: [1, 0.9, 1.1] });
  m.add(G.rbox(0.36, 0.2, 0.34, 0.08), scale2, { p: [0, 0.04, 1.02] });
  m.add(G.rbox(0.3, 0.07, 0.3, 0.03), scale, { p: [0, -0.12, 0.98], r: [0.25, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.cone(0.065, 0.36, 6), horn, { p: [s * 0.2, 0.46, 0.55], r: [-0.7, 0, -s * 0.25] });
    m.add(G.tube([[s * 0.16, 0.02, 1.16], [s * 0.42, 0.2, 1.26], [s * 0.62, 0.02, 1.0], [s * 0.6, -0.14, 0.8]], 0.028, 5), roe);   // whiskers
    m.add(G.sphere(0.035, 6, 5), M.glow(0x1a1513), { p: [s * 0.08, 0.1, 1.19], shadow: false });
  }
  eyes(m, { x: 0.2, y: 0.25, z: 0.93, r: 0.1, color: 0xfff27a, brow: 0.5, browMat: scale });
  flame(m, enemy, { p: [0, -0.04, 1.18], r: [HALF_PI, 0, 0], rad: 0.12, h: 0.5 });
  // The prawn tail, and the fire it trails.
  for (const a of [-0.5, 0, 0.5]) m.add(G.plate(FAN, 0.05), M.paint(0xff6a4a, { gloss: 0.6, glow: 0.45 }), { p: [0, 0.02, -0.92], r: [-HALF_PI, 0, a], s: 1.1 });
  flame(m, enemy, { p: [0, 0.02, -1.2], r: [-HALF_PI, 0, 0], rad: 0.13, h: 0.5 });
  wings(m, enemy, M.paint(c.accent, { gloss: 0.4, glow: 0.45 }), FIRE_WING, { y: 0.2, z: -0.05, hinge: 0.3 });
}

function octopus(m, enemy, c) {
  // The head chef's worst order: an octopus the size of the rice tub, in a
  // headband, eight arms working.
  const skin = M.paint(c.color, { gloss: 0.55, glow: 0.2 });
  const pale = M.paint(0xf7c4d4, { gloss: 0.4, glow: 0.12 });
  const deep = M.paint(0x6a2452, { gloss: 0.5 });
  const cloth = M.paint(0xfbf7ee, { gloss: 0.3, glow: 0.2 });
  m.add(G.sphere(0.78, 22, 16), skin, { p: [0, 0.1, 0], s: [1, 1.05, 1] });
  m.add(G.sphere(0.64, 18, 14), skin, { p: [0, 0.52, -0.3], s: [1, 1, 1.05] });                    // the mantle, lolling back
  m.add(G.sphere(0.72, 18, 8), pale, { p: [0, -0.42, 0], s: [1.08, 0.36, 1.08] });                 // skirt
  for (const [x, y, z, r] of [[0.4, 0.86, -0.4, 0.14], [-0.3, 0.98, -0.2, 0.11], [0.1, 1.02, -0.62, 0.12], [-0.5, 0.62, -0.62, 0.13], [0.55, 0.5, -0.7, 0.1]]) {
    m.add(G.sphere(r, 8, 6), deep, { p: [x, y, z], s: [1, 0.5, 1] });                              // spots
  }
  // Face: heavy brows, bar pupils, a pursed funnel of a mouth.
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.2, 12, 10), M.glow(0xfff3c2), { p: [s * 0.3, 0.14, 0.68], shadow: false });
    m.add(G.rbox(0.2, 0.075, 0.05, 0.02), M.glow(0x1a1513), { p: [s * 0.3, 0.13, 0.86], shadow: false });
    m.add(G.rbox(0.44, 0.13, 0.16, 0.04), deep, { p: [s * 0.32, 0.36, 0.72], r: [0.3, 0, s * 0.42] });
  }
  m.add(G.torus(0.11, 0.05, 6, 14), pale, { p: [0, -0.2, 0.76] });
  m.add(G.cyl(0.07, 0.07, 0.02, 10), M.glow(0x3a0d1c), { p: [0, -0.2, 0.78], r: [HALF_PI, 0, 0], shadow: false });
  // Headband, its knot, and a golden crest: this one is in charge.
  m.add(G.torus(0.74, 0.07, 6, 28), cloth, { p: [0, 0.52, -0.02], r: [HALF_PI - 0.18, 0, 0] });
  for (const s of [-1, 1]) m.add(G.box(0.12, 0.04, 0.5), cloth, { p: [s * 0.14, 0.72, -0.95], r: [0.5, s * 0.3, 0] });
  const gold = M.metal(c.accent, { rough: 0.25 });
  gold.emissive = new THREE.Color(0x7a4a00);
  gold.emissiveIntensity = 0.5;
  m.add(G.torus(0.34, 0.06, 6, 18, Math.PI), gold, { p: [0, 0.78, 0.6], r: [-0.25, 0, 0], s: [1, 1.15, 1] });
  const sun = m.group({ p: [0, 0.6, 0.74] });
  sun.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.sphere(0.13, 10, 8), M.glow(0xe23a2a));
  sun.object.add(enemy.crownGem);
  // Eight arms, each curling up at the tip; they row as it moves.
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * TAU, cx = Math.sin(a), cz = Math.cos(a);
    const front = i === 0 || i === 7;
    const arm = part(m, { k: 'swing', ax: 'y', amp: 0.2, ph: i * Math.PI }, { p: [0, 0, 0] });
    const pts = front
      ? [[cx * 0.5, -0.45, cz * 0.5], [cx * 1.0, -0.72, cz * 0.95], [cx * 1.3, -0.35, cz * 1.2], [cx * 1.2, 0.12, cz * 1.3], [cx * 0.95, 0.3, cz * 1.25]]
      : [[cx * 0.5, -0.45, cz * 0.5], [cx * 0.95, -0.76, cz * 0.95], [cx * 1.3, -0.88, cz * 1.3], [cx * 1.5, -0.7, cz * 1.5], [cx * 1.42, -0.48, cz * 1.42]];
    arm.add(G.tube(pts, 0.13, 7), skin);
    arm.add(G.sphere(0.13, 8, 6), skin, { p: pts[4] });
    for (const k of [1, 2, 3]) arm.add(G.sphere(0.075, 6, 5), pale, { p: [pts[k][0], pts[k][1] - 0.1, pts[k][2]], s: [1, 0.6, 1] });
  }
}

const ENEMIES = {
  SWARM: maki,
  FIRE: wasabi,
  FLYING: gyoza,
  ARMORED: crab,
  ELITE: tempuraSamurai,
  FLYING_FIRE: dragonRoll,
  BOSS: octopus
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: a counter of pale hinoki boards, eight to the tile. */
function paintFloor(ctx, size) {
  const rows = 8, h = size / rows;
  const tones = ['#d9b47c', '#cda468', '#e0bd88', '#c89c62', '#d6ae76', '#e3c18d', '#cba36a', '#d4ab72'];
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = tones[r];
    ctx.fillRect(0, r * h, size, h);
    // Grain: long shallow waves with whole periods, so the tile repeats cleanly.
    for (let k = 0; k < 6; k++) {
      const y0 = r * h + 6 + k * (h - 12) / 5, amp = 1.5 + ((r * 3 + k) % 3), period = 1 + ((r + k) % 3), ph = r * 1.7 + k;
      ctx.strokeStyle = k % 2 ? 'rgba(120, 78, 36, 0.16)' : 'rgba(255, 236, 200, 0.14)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const y = y0 + Math.sin((x / size) * TAU * period + ph) * amp;
        if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    // Where two boards meet end to end, staggered row to row.
    const joint = (r * 197 + 60) % size;
    ctx.fillStyle = 'rgba(84, 52, 24, 0.5)';
    ctx.fillRect(joint, r * h, 2, h);
    // A knot now and then.
    if (r % 3 === 1) {
      const kx = (r * 131 + 300) % size, ky = r * h + h / 2;
      ctx.fillStyle = 'rgba(110, 66, 30, 0.35)';
      ctx.beginPath(); ctx.ellipse(kx, ky, 9, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(110, 66, 30, 0.25)';
      ctx.beginPath(); ctx.ellipse(kx, ky, 15, 9, 0, 0, TAU); ctx.stroke();
    }
  }
  // The gaps between boards.
  ctx.fillStyle = 'rgba(84, 52, 24, 0.55)';
  for (let r = 0; r < rows; r++) ctx.fillRect(0, r * h - 1, size, 2);
  ctx.fillStyle = 'rgba(255, 240, 210, 0.22)';
  for (let r = 0; r < rows; r++) ctx.fillRect(0, r * h + 1, size, 1.5);
}

/** One piece of nigiri, lying along Z: rice, a topping, optionally a nori belt. */
function nigiri(m, { p = [0, 0, 0], ry = 0, k = 1, top = 0xff8a6b, belt = false, stripes = true }) {
  const g = m.group({ p, r: [0, ry, 0] });
  g.add(G.rbox(0.2, 0.14, 0.42, 0.06), RICE(), { p: [0, 0.07 * k, 0], s: k });
  g.add(G.rbox(0.23, 0.07, 0.5, 0.03), M.paint(top, { gloss: 0.65, glow: 0.2 }), { p: [0, 0.165 * k, 0], s: k });
  if (stripes) for (const z of [-0.14, 0, 0.14]) g.add(G.box(0.235, 0.012, 0.025), M.paint(0xffd9cc, { gloss: 0.5, glow: 0.2 }), { p: [0, 0.2 * k, z * k], r: [0, 0.5, 0], s: k });
  if (belt) g.add(G.rbox(0.25, 0.2, 0.09, 0.02), NORI(), { p: [0, 0.11 * k, 0], s: k });
  return g;
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // soy-sauce bottle
      m.add(G.lathe([[0.17, 0], [0.2, 0.03], [0.21, 0.2], [0.15, 0.36], [0.07, 0.46], [0.07, 0.52]], 18), M.glass(0xfff1e0, 0.5), { p: [0, 0, 0] });
      m.add(G.lathe([[0.16, 0], [0.19, 0.03], [0.195, 0.2], [0.17, 0.28], [0, 0.28]], 18), M.paint(0x2a0f08, { gloss: 0.9 }), { p: [0, 0.015, 0] });
      m.add(G.lathe([[0.09, 0], [0.11, 0.02], [0.1, 0.09], [0.05, 0.12], [0, 0.12]], 14), RED(), { p: [0, 0.5, 0] });
      for (const s of [-1, 1]) m.add(G.cone(0.025, 0.07, 6), RED(), { p: [s * 0.11, 0.57, 0], r: [0, 0, -s * 1.2] });
      break;
    }
    case 1: { // a stack of conveyor plates, one piece left on top
      [0xe23a2a, 0x3b82f6, 0xffd447, 0x2f9d57, 0xff8fa3].forEach((color, i) => {
        m.add(G.lathe([[0.12, 0], [0.3, 0.035], [0.34, 0.07], [0.32, 0.075], [0.28, 0.05], [0.12, 0.025], [0, 0.025]], 22), M.paint(i % 2 ? 0xfdfaf2 : color, { gloss: 0.9 }), { p: [0, i * 0.055, 0] });
        m.add(G.torus(0.33, 0.012, 5, 22), M.paint(color, { gloss: 0.8, glow: 0.15 }), { p: [0, i * 0.055 + 0.072, 0], r: [HALF_PI, 0, 0] });
      });
      nigiri(m, { p: [0, 0.25, 0], ry: 0.5, k: 0.9 });
      break;
    }
    case 2: { // a cup of green tea
      m.add(G.lathe([[0.15, 0], [0.17, 0.02], [0.2, 0.36], [0.21, 0.4], [0.185, 0.4], [0.17, 0.08], [0, 0.06]], 20), M.paint(0x2a4f8a, { gloss: 0.85 }), { p: [0, 0, 0] });
      m.add(G.sleeve(0.197, 0.186, 0.07, 20), M.paint(0xfdfaf2, { gloss: 0.7 }), { p: [0, 0.22, 0] });
      m.add(G.cyl(0.185, 0.185, 0.01, 20), M.paint(0x9db83a, { gloss: 0.9, glow: 0.15 }), { p: [0, 0.35, 0] });
      for (let i = 0; i < 2; i++) m.add(G.sphere(0.07 + i * 0.02, 8, 6), M.energy(0xffffff, 0.22 - i * 0.07), { p: [0.03 * i, 0.5 + i * 0.14, 0], shadow: false });
      break;
    }
    case 3: { // wasabi and pickled ginger behind a leaf of plastic grass
      m.add(G.rbox(0.66, 0.05, 0.4, 0.02), LACQUER(), { p: [0, 0.025, 0] });
      m.add(G.lathe([[0.13, 0], [0.11, 0.08], [0.05, 0.14], [0, 0.16]], 12), M.paint(0x86c232, { gloss: 0.4, glow: 0.15 }), { p: [-0.17, 0.05, 0.04] });
      for (let i = 0; i < 5; i++) {
        const a = i * 1.3;
        m.add(G.sphere(0.09, 8, 6), M.paint(0xffa9b8, { gloss: 0.6, glow: 0.15 }), { p: [0.15 + Math.cos(a) * 0.05, 0.09 + i * 0.012, 0.03 + Math.sin(a) * 0.05], r: [0.4, a, 0], s: [1, 0.35, 0.8] });
      }
      m.add(G.plate([[-0.3, 0], [0.3, 0], [0.3, 0.2], [0.22, 0.3], [0.15, 0.2], [0.07, 0.3], [0, 0.2], [-0.07, 0.3], [-0.15, 0.2], [-0.22, 0.3], [-0.3, 0.2]], 0.012), M.paint(0x2f9d57, { gloss: 0.7, glow: 0.12 }), { p: [0, 0.05, -0.13] });
      break;
    }
    default: { // bamboo steamer, two tiers and a lid
      const bamboo = M.paint(0xdcc28a, { gloss: 0.3 }), band = M.paint(0x8a6a3a, { gloss: 0.3 });
      for (let i = 0; i < 2; i++) {
        m.add(G.cyl(0.32, 0.32, 0.17, 24), bamboo, { p: [0, 0.085 + i * 0.18, 0] });
        for (const y of [0.02, 0.15]) m.add(G.torus(0.322, 0.014, 5, 24), band, { p: [0, y + i * 0.18, 0], r: [HALF_PI, 0, 0] });
      }
      m.add(G.lathe([[0.33, 0], [0.33, 0.03], [0.2, 0.08], [0, 0.1]], 24), bamboo, { p: [0, 0.35, 0] });
      m.add(G.torus(0.33, 0.016, 5, 24), band, { p: [0, 0.365, 0], r: [HALF_PI, 0, 0] });
      m.add(G.torus(0.06, 0.016, 5, 12, Math.PI), band, { p: [0, 0.44, 0] });
    }
  }
  return g;
}

/** A sign board's face, drawn on a canvas (only ever called in the browser). */
function signTexture(text) {
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#2a170d';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = '#d4a53a';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 996, 228);
  ctx.font = '900 140px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fbf2dc';
  ctx.fillText(text, 512, 134);
  return new THREE.CanvasTexture(cv);
}

/** A paper lantern hanging from `y`, `k` times life size. */
function lantern(m, x, y, z, k = 1) {
  m.add(G.cyl(0.03 * k, 0.03 * k, 0.9 * k, 5), BLACK(), { p: [x, y - 0.45 * k, z] });
  m.add(G.sphere(k, 18, 12), M.paint(0xe23a2a, { gloss: 0.3, glow: 0.85 }), { p: [x, y - 2.0 * k, z], s: [1, 1.2, 1], shadow: false });
  for (const dy of [-0.85, 0.85]) m.add(G.cyl(0.5 * k, 0.5 * k, 0.22 * k, 14), BLACK(), { p: [x, y - (2.0 + dy * 1.3) * k, z] });
  for (let i = -2; i <= 2; i++) m.add(G.torus(Math.cos(i * 0.5) * k * 1.01, 0.03 * k, 4, 18), M.paint(0x8a1408, { gloss: 0.3, glow: 0.3 }), { p: [x, y - (2.0 - Math.sin(i * 0.5) * 1.2) * k, z], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.05 * k, 0.12 * k, 0.6 * k, 6), GOLD(), { p: [x, y - 3.5 * k, z] });
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => { g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };

  // The kitchen pass on the far side: a timber gate, a noren, three lanterns.
  const pass = new THREE.Group();
  let m = modeller(pass, 1);
  const timber = M.paint(0x3a2216, { gloss: 0.3 });
  const indigo = M.paint(0x24408e, { gloss: 0.2, glow: 0.12 });
  for (const s of [-1, 1]) m.add(G.rbox(0.8, 10.4, 0.8, 0.1), timber, { p: [s * 6.6, 5.2, 0] });
  m.add(G.rbox(17.5, 0.8, 1.0, 0.12), timber, { p: [0, 10.2, 0] });
  m.add(G.rbox(14, 0.5, 0.7, 0.1), timber, { p: [0, 8.6, 0] });
  m.add(new THREE.PlaneGeometry(12.4, 8.3), M.glow(0x6a3418), { p: [0, 4.2, -0.3], shadow: false });      // the kitchen's glow
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 2.5;
    m.add(G.box(2.3, 3.6, 0.08), indigo, { p: [x, 6.5, 0.2] });
    m.add(G.cyl(0.62, 0.62, 0.04, 20), M.glow(0xf6f1e4), { p: [x, 6.7, 0.26], r: [HALF_PI, 0, 0], shadow: false });
    m.add(G.cyl(0.4, 0.4, 0.05, 20), indigo, { p: [x, 6.7, 0.27], r: [HALF_PI, 0, 0], shadow: false });
  }
  m.add(G.rbox(8.4, 2.1, 0.3, 0.1), timber, { p: [0, 11.9, 0] });
  m.add(new THREE.PlaneGeometry(8.0, 1.8), new THREE.MeshBasicMaterial({ map: signTexture('SUSHI BAR'), fog: false }), { p: [0, 11.9, 0.17], shadow: false });
  for (const x of [-8.2, 0, 8.2]) lantern(m, x, x ? 9.9 : 15.6, x ? 0.2 : 0.4, x ? 0.95 : 0.7);
  place(pass, 0, -hh - 10);

  // A soy-sauce bottle the size of a telephone box.
  const soy = new THREE.Group();
  m = modeller(soy, 1);
  m.add(G.lathe([[1.7, 0], [2.0, 0.3], [2.1, 2.2], [1.6, 3.8], [0.75, 4.8], [0.75, 5.4]], 28), M.glass(0xfff1e0, 0.45), { p: [0, 0, 0] });
  m.add(G.lathe([[1.6, 0], [1.9, 0.3], [2.0, 2.2], [1.75, 3.0], [0, 3.0]], 28), M.paint(0x2a0f08, { gloss: 0.9 }), { p: [0, 0.12, 0] });
  m.add(G.lathe([[0.95, 0], [1.15, 0.2], [1.05, 0.95], [0.55, 1.25], [0, 1.25]], 20), M.paint(0xc62a1a, { gloss: 0.85, glow: 0.2 }), { p: [0, 5.2, 0] });
  for (const s of [-1, 1]) m.add(G.cone(0.26, 0.7, 8), M.paint(0xc62a1a, { gloss: 0.85, glow: 0.2 }), { p: [s * 1.15, 5.95, 0], r: [0, 0, -s * 1.2] });
  place(soy, -hw - 8, -hh * 0.25, 0.4);

  // Plates stacked as the bill comes: colour-coded, a piece of nigiri on top.
  const plates = new THREE.Group();
  m = modeller(plates, 1);
  [0xe23a2a, 0x3b82f6, 0xffd447, 0x2f9d57, 0xff8fa3, 0xe23a2a, 0x3b82f6].forEach((color, i) => {
    m.add(G.lathe([[0.9, 0], [2.2, 0.14], [2.45, 0.32], [2.35, 0.34], [2.1, 0.22], [0.9, 0.1], [0, 0.1]], 28), M.paint(i % 2 ? 0xfdfaf2 : color, { gloss: 0.95 }), { p: [0, i * 0.26, 0] });
    m.add(G.torus(2.4, 0.06, 5, 28), M.paint(color, { gloss: 0.8, glow: 0.2 }), { p: [0, i * 0.26 + 0.33, 0], r: [HALF_PI, 0, 0] });
  });
  nigiri(m, { p: [0, 1.75, 0], ry: 0.6, k: 5.2 });
  place(plates, -hw - 7.5, hh * 0.9, 0);

  // A cup of tea and a pair of chopsticks on their rest, off the far corner.
  const tea = new THREE.Group();
  m = modeller(tea, 1);
  m.add(G.lathe([[1.5, 0], [1.7, 0.2], [2.0, 3.4], [2.1, 3.8], [1.85, 3.8], [1.7, 0.8], [0, 0.6]], 26), M.paint(0x2a4f8a, { gloss: 0.85 }), { p: [0, 0, 0] });
  m.add(G.sleeve(1.97, 1.86, 0.7, 26), M.paint(0xfdfaf2, { gloss: 0.7 }), { p: [0, 2.1, 0] });
  m.add(G.cyl(1.85, 1.85, 0.06, 26), M.paint(0x9db83a, { gloss: 0.9, glow: 0.25 }), { p: [0, 3.4, 0] });
  for (let i = 0; i < 3; i++) m.add(G.sphere(0.7 + i * 0.25, 10, 8), M.energy(0xffffff, 0.2 - i * 0.05), { p: [0.3 * i, 4.8 + i * 1.4, 0], shadow: false });
  m.add(G.rbox(2.4, 0.7, 1.0, 0.3), M.paint(0xc62a1a, { gloss: 0.85 }), { p: [4.2, 0.35, 0.5] });
  for (const s of [-1, 1]) m.add(G.cyl(0.09, 0.2, 9, 8), M.paint(0x1a1513, { gloss: 0.9 }), { p: [4.2 + s * 0.35, 1.0, -2.6], r: [HALF_PI - 0.09, 0, 0] });
  place(tea, hw + 2.5, -hh - 9.5, -0.3);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0x1c2f22, accent: ctx.accent ?? 0xff8a6b });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
