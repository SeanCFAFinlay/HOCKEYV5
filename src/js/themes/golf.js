// KAIJU MINI-GOLF
//
// Defend the 18th hole. The arena is a neon crazy-golf course at night; the
// enemies are rampaging monsters the size of golf balls, and the towers are
// the course's own obstacles fighting back — windmill, clown mouth,
// loop-the-loop, volcano and friends.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'golf',
  name: 'Kaiju Mini-Golf',
  shortName: 'Mini-Golf',
  icon: 'golfflag',
  sortOrder: 50,
  description: 'Defend the 18th hole. Crazy-golf obstacles versus monsters the size of golf balls.',
  color: '#39ff88',
  groundColor: 0x1f8f43,
  pathColor: 0x7de0a0,
  envColor: 0x070a1c,
  environmentSkin: { arena: 'course', floor: 'felt', markerIcon: '⛳' },
  enemySkin: { body: 'kaiju', icon: 'monster' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Ball Cannon', icon: 'cannon', clr: '#4d8dff' },
    t2: { nm: 'Lighthouse', icon: 'target', clr: '#ff4545' },
    t3: { nm: 'Windmill', icon: 'windmill', clr: '#ff6fb1' },
    t4: { nm: 'Water Hazard', icon: 'snowflake', clr: '#2fe6d0' },
    t5: { nm: 'Clown Mouth', icon: 'clown', clr: '#b06bff' },
    t6: { nm: 'Loop-the-Loop', icon: 'loop', clr: '#f5ee4a' },
    t7: { nm: 'Volcano', icon: 'volcano', clr: '#ff6a1a' },
    t8: { nm: "Champion's Cup", icon: 'trophy', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Lil Lizard' },
    e2: { nm: 'Magmasaur' },
    e3: { nm: 'Pterodinky' },
    e4: { nm: 'Ankylo Tank' },
    e5: { nm: 'Tricerabrute' },
    e6: { nm: 'Ember Drake' },
    e7: { nm: 'Parzilla' }
  },
  maps: [
    ['The First Tee', 'A gentle par 3 - learn the basics'],
    ['Dogleg Left', 'Open centre, two ways in'],
    ['Windmill Alley', 'Tight lanes between the sails'],
    ['The Back Nine', 'Long fairway, heavy traffic'],
    ['Night Round', 'They come from everywhere'],
    ['The Bridge', 'Narrow and fast'],
    ['Lava Lagoon', 'Wide open and hot'],
    ['Sand Trap', 'Mixed pressure, little room'],
    ['Monster Par 5', 'The big one'],
    ['The 18th Hole', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x070a1c,
    fog: 0x0b1030,
    fogDensity: 0.006,
    floor: {
      base: '#16793a',
      meshColor: 0xb4d6bc,
      roughness: 0.82,
      metalness: 0.02,
      emissive: 0x0b3a1c,
      emissiveIntensity: 0.2
    },
    rail: { color: 0xff4fb8, roughness: 0.35, metalness: 0.1 },
    path: { color: 0xd6ffe4, emissive: 0x1f8a4a, opacity: 0.3, edge: 0x39ff88 },
    buildZone: { color: 0xeafff2, opacity: 0.08, line: 0x39ff88 },
    obstacle: { accent: 0xff4fd8 },
    base: { color: 0x39ff88, icon: 'DEFEND THE 18TH' },
    spawn: { color: 0xff3b6b, icon: 'KAIJU' }
  },
  lighting: {
    hemiSky: 0xc4d2ff,
    hemiGround: 0x164a2a,
    hemiIntensity: 0.34,
    sun: 0xe4eaff,
    sunIntensity: 0.66,
    rim: 0xff4fd8,
    rimIntensity: 0.34,
    accent: 0x39ff88,
    spotIntensity: 1.7,
    exposure: 0.6
  },
  ui: { accent: '#39ff88', dark: '#070a1c' },
  crowd: { fans: [0x39ff88, 0xff4fd8, 0x3fe0ff, 0xf5ee4a, 0xffffff], seat: 0x1a1f4a },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    // Cannon: golf balls. Lighthouse: a beam. Windmill: a flung sail. Water
    // hazard: a splash. Clown: its red nose. Loop: lightning. Volcano: lava
    // rock. Cup: the golden ball.
    ball: { mesh: 'ball', model: 'golfBall', debris: 'dirt', debrisColor: 0x2f8f43, flight: 'lob', trail: 'dust', impact: 'spark', color: 0xffffff, speed: 9.5, size: 0.9 },
    curveBall: { mesh: 'tracer', debris: 'sparks', debrisColor: 0xfff3a0, flight: 'tracer', trail: 'line', impact: 'spark', color: 0xfff3a0, speed: 13 },
    headButt: { mesh: 'ring', model: 'sails', debris: 'chunks', debrisColor: 0xff6fb1, flight: 'ring', trail: 'shock', impact: 'ring', color: 0xff6fb1, speed: 8.5 },
    tackle: { mesh: 'shard', model: 'splash', debris: 'drops', debrisColor: 0x7ff5ff, flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x7ff5ff, speed: 9.5 },
    glove: { mesh: 'ball', model: 'clownNose', debris: 'dirt', debrisColor: 0x2f8f43, flight: 'punch', trail: 'gold', impact: 'slam', color: 0xd9b8ff, speed: 8.8, size: 1.2 },
    chain: { mesh: 'bolt', debris: 'sparks', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xf5ee4a, speed: 15 },
    flare: { mesh: 'plasma', model: 'lavaRock', debris: 'embers', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff5a14, speed: 11, size: 0.85 },
    legend: { mesh: 'ball', model: 'goldBall', debris: 'sparks', debrisColor: 0xffc928, flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case. No green bodies: the floor is green.
  enemies: {
    swarm: { body: 'bug', color: 0xa855f7, accent: 0xffe14d },
    fire: { body: 'bug', color: 0xe0321f, accent: 0xffb347 },
    flying: { body: 'bug', color: 0xf2e3c4, accent: 0xff8a3d },
    armored: { body: 'bug', color: 0x3f5fb8, accent: 0xffd23f },
    elite: { body: 'bug', color: 0xc2591c, accent: 0xfff0c8 },
    flying_fire: { body: 'bug', color: 0xffb01f, accent: 0xff3d1f },
    boss: { body: 'bug', color: 0x3a3c96, accent: 0x19d8ff },
    splitter: { body: 'bug', color: 0xfff1d6, accent: 0xff7a3a },
    splitling: { body: 'bug', color: 0xfff1d6, accent: 0xff7a3a },
    shielder: { body: 'bug', color: 0xd8b25a, accent: 0x3fd0ff },
    healer: { body: 'bug', color: 0xff8fc4, accent: 0x5cff9a }
  },
  towers: { family: 'golf', base: 0x1b2140, metal: 0xd7dde5, levelGlow: 0x39ff88 }
};

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);
const NAVY = () => M.matte(0x1b2140);
const BALL = () => M.paint(0xf7f9fb, { gloss: 0.6, glow: 0.12 });
const HALF_PI = Math.PI / 2;

/** A part that throbs. 'pulse' overwrites scale, so it goes in its own group. */
function pulsing(m, p, geo, mat, offset = 0) {
  const g = m.group({ p });
  g.add(geo, mat, { shadow: false });
  m.anim(g.object, 'pulse', { offset });
  return g;
}

function ballCannon(m, c) {
  // A toy cannon on cart wheels, fed from a tube of range balls.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.16 });
  const white = M.paint(0xf4f6f8, { gloss: 0.6 });
  const black = BLACK();
  const ball = BALL();
  m.add(G.rbox(0.46, 0.04, 0.56, 0.015), NAVY(), { p: [0, 0.14, 0] });                // tee mat
  m.add(G.rbox(0.2, 0.14, 0.3, 0.04), M.matte(0x2a2f3a), { p: [0, 0.27, -0.05] });    // carriage
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.13, 0.13, 0.05, 18), black, { p: [s * 0.15, 0.27, -0.05], r: [0, 0, HALF_PI] });
    m.add(G.cyl(0.075, 0.075, 0.058, 14), white, { p: [s * 0.15, 0.27, -0.05], r: [0, 0, HALF_PI] });
    m.add(G.sphere(0.03, 8, 6), body, { p: [s * 0.18, 0.27, -0.05] });
    m.add(G.sphere(0.035, 10, 8), body, { p: [s * 0.18, 0.185, 0.22] });              // tee markers
  }
  // Barrel: turned, flared at the muzzle, tipped up a little.
  const barrel = m.group({ p: [0, 0.43, -0.1], r: [HALF_PI - 0.35, 0, 0] });
  barrel.add(G.lathe([[0, -0.2], [0.08, -0.2], [0.13, -0.15], [0.14, -0.02], [0.115, 0.3], [0.14, 0.32], [0.14, 0.4], [0.1, 0.4]]), body);
  barrel.add(G.cyl(0.1, 0.1, 0.012, 16), black, { p: [0, 0.392, 0] });
  barrel.add(G.torus(0.134, 0.018, 8, 20), white, { p: [0, 0.08, 0], r: [HALF_PI, 0, 0] });
  barrel.add(G.torus(0.146, 0.016, 8, 20), white, { p: [0, 0.36, 0], r: [HALF_PI, 0, 0] });
  barrel.add(G.sphere(0.04, 10, 8), CHROME(), { p: [0, -0.21, 0] });
  barrel.add(G.sphere(0.085, 14, 10), ball, { p: [0, 0.41, 0] });                     // ball in the muzzle
  // Feed tube with balls dropping through it.
  m.add(G.cyl(0.075, 0.05, 0.06, 14), CHROME(), { p: [0, 0.57, -0.17] });
  m.add(G.cyl(0.068, 0.068, 0.3, 16), M.glass(0xbfe9ff, 0.3), { p: [0, 0.74, -0.17], shadow: false });
  m.add(G.torus(0.068, 0.012, 6, 16), CHROME(), { p: [0, 0.89, -0.17], r: [HALF_PI, 0, 0] });
  const feed = m.group({ p: [0, 0.74, -0.17] });
  for (let i = 0; i < 3; i++) feed.add(G.sphere(0.05, 12, 8), ball, { p: [0, -0.09 + i * 0.1, 0] });
  m.anim(feed.object, 'bob');
}

function lighthouse(m, c) {
  // Candy-striped tower on a rock; the lamp sweeps, the spotlight aims.
  const red = M.paint(c.color, { gloss: 0.8, glow: 0.18 });
  const white = M.paint(0xf4f6f8, { gloss: 0.7 });
  const rock = M.paint(0x59607a, { gloss: 0.1 });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3 + 0.4;
    m.add(G.sphere(0.1, 7, 5), rock, { p: [Math.sin(a) * 0.2, 0.15, Math.cos(a) * 0.2], s: [1.1, 0.6, 0.9] });
  }
  const r = y => 0.2 - 0.09 * (y / 0.48);
  for (let i = 0; i < 4; i++) {
    m.add(G.lathe([[r(i * 0.12), 0], [r((i + 1) * 0.12), 0.12]]), i % 2 ? white : red, { p: [0, 0.14 + i * 0.12, 0] });
  }
  m.add(G.rbox(0.08, 0.13, 0.03, 0.012), BLACK(), { p: [0, 0.205, 0.185], r: [-0.18, 0, 0] });      // door
  const lit = M.glow(0xfff3a0);
  m.add(G.box(0.04, 0.05, 0.02), lit, { p: [0, 0.44, 0.142] });
  m.add(G.box(0.04, 0.05, 0.02), lit, { p: [0.12, 0.32, 0.1], r: [0, 0.9, 0] });
  // Gallery, lantern room and roof.
  m.add(G.cyl(0.17, 0.14, 0.03, 16), NAVY(), { p: [0, 0.635, 0] });
  m.add(G.torus(0.16, 0.01, 6, 20), CHROME(), { p: [0, 0.7, 0], r: [HALF_PI, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    m.add(G.cyl(0.007, 0.007, 0.06, 5), CHROME(), { p: [Math.sin(a) * 0.16, 0.67, Math.cos(a) * 0.16] });
  }
  m.add(G.cyl(0.085, 0.085, 0.14, 12), M.glass(0xfff3a0, 0.4), { p: [0, 0.72, 0], shadow: false });
  m.add(G.sphere(0.05, 10, 8), lit, { p: [0, 0.72, 0], shadow: false });
  m.add(G.cone(0.14, 0.12, 12), red, { p: [0, 0.85, 0] });
  // Spotlight on the rail, pointing where it shoots.
  m.add(G.cyl(0.04, 0.028, 0.1, 12), CHROME(), { p: [0, 0.675, 0.2], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.034, 0.034, 0.01, 12), lit, { p: [0, 0.675, 0.252], r: [HALF_PI, 0, 0], shadow: false });
  // The sweeping beam.
  const beam = m.group({ p: [0, 0.72, 0] });
  const ray = M.energy(0xfff3a0, 0.32);
  beam.add(G.cone(0.085, 0.22, 10), ray, { p: [0, 0, 0.15], r: [-HALF_PI, 0, 0], shadow: false });
  beam.add(G.cone(0.085, 0.22, 10), ray, { p: [0, 0, -0.15], r: [HALF_PI, 0, 0], shadow: false });
  m.anim(beam.object, 'spin', { speed: 1.1 });
}

function windmill(m, c) {
  // The classic: six-sided tapering house, pointed cap, four lattice sails.
  const body = M.paint(c.color, { gloss: 0.7, glow: 0.16 });
  const white = M.paint(0xf7f4ee, { gloss: 0.6 });
  const neon = M.glow(0xffffff);
  const hex = [0, Math.PI / 6, 0];                                       // a flat side faces +Z
  m.add(G.cyl(0.275, 0.285, 0.05, 6), white, { p: [0, 0.145, 0], r: hex });
  m.add(G.lathe([[0.25, 0], [0.26, 0.03], [0.16, 0.46], [0.17, 0.48], [0.17, 0.5]], 6), body, { p: [0, 0.14, 0], r: hex });
  m.add(G.cyl(0.21, 0.21, 0.03, 6), white, { p: [0, 0.645, 0], r: hex });
  m.add(G.cone(0.2, 0.21, 6), M.paint(0x2c3266, { gloss: 0.5 }), { p: [0, 0.765, 0], r: hex });
  m.add(G.torus(0.212, 0.012, 5, 6), neon, { p: [0, 0.42, 0], r: [HALF_PI, 0, 0], shadow: false });   // neon band
  // The tunnel the ball goes through, a lit window above it.
  m.add(G.rbox(0.13, 0.17, 0.03, 0.02), white, { p: [0, 0.25, 0.202], r: [-0.2, 0, 0] });
  m.add(G.rbox(0.095, 0.14, 0.036, 0.02), BLACK(), { p: [0, 0.24, 0.206], r: [-0.2, 0, 0] });
  m.add(G.box(0.05, 0.06, 0.02), M.glow(0xfff3a0), { p: [0, 0.48, 0.16], r: [-0.2, 0, 0] });
  m.add(G.sphere(0.035, 10, 8), BALL(), { p: [0.1, 0.2, 0.27] });
  // Sails turn about the axle (the group's Y axis laid along Z).
  m.add(G.cyl(0.02, 0.02, 0.14, 8), CHROME(), { p: [0, 0.62, 0.2], r: [HALF_PI, 0, 0] });
  const sails = m.group({ p: [0, 0.62, 0.265], r: [HALF_PI, 0, 0] });
  const cloth = M.paint(0xfff6e0, { gloss: 0.3, glow: 0.1 });
  const edge = M.glow(c.color);
  sails.add(G.sphere(0.04, 10, 8), CHROME());
  for (let i = 0; i < 4; i++) {
    const blade = sails.group({ r: [0, i * HALF_PI + 0.3, 0] });
    blade.add(G.box(0.02, 0.016, 0.27), white, { p: [0, 0, 0.14] });
    blade.add(G.box(0.085, 0.006, 0.19), cloth, { p: [0.05, 0, 0.175] });
    blade.add(G.box(0.01, 0.012, 0.19), edge, { p: [0.095, 0, 0.175], shadow: false });
    for (let k = 0; k < 3; k++) blade.add(G.box(0.085, 0.012, 0.008), white, { p: [0.05, 0, 0.085 + k * 0.09] });
  }
  m.anim(sails.object, 'spin', { speed: 1.1 });
}

function waterHazard(m, c) {
  // A pond with a sprinkler in it: everything it soaks slows down.
  const rim = M.paint(c.color, { gloss: 0.85, glow: 0.2 });
  const chrome = CHROME();
  m.add(G.lathe([[0, 0], [0.27, 0], [0.31, 0.05], [0.31, 0.1], [0.275, 0.1], [0.26, 0.05], [0, 0.04]], 28), rim, { p: [0, 0.12, 0] });
  m.add(G.cyl(0.272, 0.272, 0.01, 28), M.paint(0x1fb8e6, { gloss: 0.95, glow: 0.55 }), { p: [0, 0.195, 0] });
  const ripple = m.group({ p: [0, 0.203, 0] });
  ripple.add(G.ring(0.13, 0.15, 24), M.glow(0xdffcff, 0.6), { r: [-HALF_PI, 0, 0], shadow: false });
  m.anim(ripple.object, 'pulse');
  // Rubber duck.
  const duck = M.paint(0xffd91a, { gloss: 0.8, glow: 0.2 });
  m.add(G.sphere(0.045, 10, 8), duck, { p: [0.15, 0.225, 0.12], s: [1, 0.8, 1.25] });
  m.add(G.sphere(0.03, 10, 8), duck, { p: [0.15, 0.27, 0.15] });
  m.add(G.cone(0.014, 0.035, 6), M.paint(0xff7a1a), { p: [0.15, 0.265, 0.185], r: [HALF_PI, 0, 0] });
  // Hazard stake at the back.
  m.add(G.cyl(0.012, 0.012, 0.26, 6), M.paint(0xf4f6f8), { p: [-0.17, 0.33, -0.17] });
  m.add(G.rbox(0.15, 0.08, 0.014, 0.008), M.paint(0xff3b6b, { gloss: 0.6, glow: 0.3 }), { p: [-0.17, 0.44, -0.165], r: [0, 0.6, 0] });
  // Riser and the spinning head with its arcs of water.
  m.add(G.lathe([[0.055, 0], [0.03, 0.04], [0.024, 0.42], [0.04, 0.44], [0.04, 0.48]], 12), chrome, { p: [0, 0.2, 0] });
  const head = m.group({ p: [0, 0.7, 0] });
  head.add(G.rbox(0.075, 0.07, 0.18, 0.025), rim, { p: [0, 0.01, 0] });
  head.add(G.cyl(0.02, 0.03, 0.07, 10), chrome, { p: [0, 0.02, 0.12], r: [HALF_PI, 0, 0] });
  head.add(G.cyl(0.016, 0.022, 0.05, 10), chrome, { p: [0, 0.02, -0.11], r: [-HALF_PI, 0, 0] });
  head.add(G.rbox(0.03, 0.02, 0.12, 0.008), chrome, { p: [0.03, 0.06, 0.03], r: [0, 0.5, 0] });   // hammer arm
  const water = M.energy(0xbff8ff, 0.75);
  head.add(G.tube([[0, 0.03, 0.15], [0, 0.11, 0.21], [0, 0.07, 0.27], [0, -0.12, 0.31]], 0.014, 6), water, { shadow: false });
  head.add(G.tube([[0, 0.03, -0.13], [0, 0.08, -0.18], [0, 0.03, -0.23], [0, -0.1, -0.26]], 0.01, 6), water, { shadow: false });
  for (const [y, z, r] of [[-0.18, 0.315, 0.022], [0.0, 0.3, 0.016], [-0.15, -0.265, 0.016]]) {
    head.add(G.sphere(r, 8, 6), M.glow(0xdffcff), { p: [0, y, z], shadow: false });
  }
  m.anim(head.object, 'spin', { speed: 1.6 });
}

function clownMouth(m, c) {
  // The one everybody remembers: putt into the mouth. This one bites back.
  const hair = M.paint(c.color, { gloss: 0.5, glow: 0.22 });
  const face = M.paint(0xfbf7f0, { gloss: 0.75, glow: 0.05 });
  const red = M.paint(0xff2d3d, { gloss: 0.85, glow: 0.3 });
  const black = BLACK();
  m.add(G.lathe([[0.12, 0], [0.27, 0.015], [0.3, 0.05], [0.2, 0.09], [0.1, 0.1]], 16), hair, { p: [0, 0.12, 0] });   // ruff
  m.add(G.sphere(0.26, 24, 18), face, { p: [0, 0.45, 0] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.115, 10, 8), hair, { p: [s * 0.215, 0.56, -0.03] });
    m.add(G.sphere(0.09, 10, 8), hair, { p: [s * 0.235, 0.44, -0.05] });
    m.add(G.sphere(0.085, 10, 8), hair, { p: [s * 0.17, 0.66, -0.06] });
    // Eyes: diamond make-up, black pupil, a glint.
    m.add(G.star(0.085, 0.032, 0.012, 4), M.paint(0x2fa8ff, { gloss: 0.6, glow: 0.3 }), { p: [s * 0.105, 0.57, 0.205], r: [-0.42, s * 0.42, 0] });
    m.add(G.sphere(0.03, 10, 8), black, { p: [s * 0.105, 0.57, 0.218] });
    m.add(G.sphere(0.01, 6, 5), M.glow(0xffffff), { p: [s * 0.098, 0.58, 0.245], shadow: false });
    m.add(G.sphere(0.045, 10, 8), M.paint(0xff8fb0, { gloss: 0.4 }), { p: [s * 0.185, 0.43, 0.16], s: [1, 1, 0.4] });   // cheeks
    m.add(G.rbox(0.05, 0.05, 0.02, 0.008), face, { p: [s * 0.03, 0.425, 0.238] });                                        // teeth
  }
  // The mouth: dark throat, fat red lips, tongue rolled out as the ramp.
  m.add(G.sphere(0.15, 16, 12), M.matte(0x1a0508), { p: [0, 0.36, 0.17], s: [1, 0.75, 0.55] });
  m.add(G.torus(0.14, 0.036, 10, 26), red, { p: [0, 0.36, 0.222], s: [1, 0.76, 1] });
  const tongue = m.group({ p: [0, 0.295, 0.25] });
  tongue.add(G.rbox(0.12, 0.03, 0.17, 0.014), M.paint(0xff5d7a, { gloss: 0.7, glow: 0.2 }), { p: [0, 0, 0.02], r: [0.3, 0, 0] });
  tongue.add(G.sphere(0.035, 10, 8), BALL(), { p: [0, 0.035, 0.03] });
  m.anim(tongue.object, 'bob');
  pulsing(m, [0, 0.5, 0.265], G.sphere(0.06, 12, 10), red);                                   // honking nose
  // Party hat.
  m.add(G.torus(0.1, 0.02, 6, 18), red, { p: [0, 0.7, -0.01], r: [HALF_PI, 0, 0] });
  m.add(G.cone(0.1, 0.2, 14), M.paint(0xffe14d, { gloss: 0.7, glow: 0.2 }), { p: [0, 0.795, -0.015], r: [-0.08, 0, 0] });
  m.add(G.sphere(0.026, 8, 6), red, { p: [0, 0.895, -0.024] });
}

function loopTheLoop(m, c) {
  // A vertical loop of neon track with a charged ball that never stops; the
  // coil in the middle is where the lightning comes from.
  const neon = M.paint(c.color, { gloss: 0.8, glow: 0.85 });
  const chrome = CHROME();
  const cy = 0.54, R = 0.3;
  m.add(G.rbox(0.6, 0.05, 0.24, 0.02), NAVY(), { p: [0, 0.145, 0] });
  m.add(G.torus(R, 0.028, 8, 40), M.matte(0x2a2f4a), { p: [0, cy, 0], s: [1, 1, 1.9] });           // track bed
  for (const z of [-0.055, 0.055]) m.add(G.torus(R, 0.015, 6, 40), neon, { p: [0, cy, z] });       // rails
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.17, 0.02, 0.11, 0.008), neon, { p: [s * 0.2, 0.2, 0], r: [0, 0, s * 0.3] });    // entry/exit ramps
    for (const z of [-1, 1]) {
      m.add(G.tube([[s * 0.27, 0.16, z * 0.1], [s * 0.31, 0.36, z * 0.08], [s * 0.3, cy, z * 0.06]], 0.012, 6), chrome);
    }
  }
  // Tesla coil in the eye of the loop.
  m.add(G.tube([[0, 0.17, -0.09], [0, 0.36, -0.13], [0, cy, -0.03]], 0.014, 6), chrome);
  for (const rz of [0.5, -0.5]) m.add(G.torus(0.08, 0.008, 5, 18), chrome, { p: [0, cy, 0], r: [HALF_PI + rz, 0, rz] });
  pulsing(m, [0, cy, 0], G.sphere(0.055, 12, 10), M.glow(0xfffbd0));
  const arc = M.energy(0xffffff, 0.6);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.6, pts = [];
    for (let k = 0; k <= 4; k++) {
      const t = 0.05 + (k / 4) * 0.2, j = (k % 2 ? 1 : -1) * (k && k < 4 ? 0.03 : 0);
      pts.push([Math.cos(a) * t - Math.sin(a) * j, cy + Math.sin(a) * t + Math.cos(a) * j, 0]);
    }
    m.anim(m.add(G.tube(pts, 0.007, 4), arc, { shadow: false }), 'blink');
  }
  // The ball riding the inside of the loop (group Y laid along Z, so it spins in the loop's plane).
  const rider = m.group({ p: [0, cy, 0], r: [HALF_PI, 0, 0] });
  rider.add(G.sphere(0.048, 12, 10), M.glow(0xffffff), { p: [0.222, 0, 0], shadow: false });
  rider.add(G.sphere(0.075, 10, 8), M.energy(c.color, 0.5), { p: [0.222, 0, 0], shadow: false });
  rider.add(G.sphere(0.035, 8, 6), M.energy(c.color, 0.4), { p: [0.2, 0, 0.1], shadow: false });
  m.anim(rider.object, 'spin', { speed: 2.4 });
}

function volcano(m, c) {
  // Rock cone, glowing crater, lava down the flanks, smoke above.
  const rock = M.paint(0x4a302c, { gloss: 0.12 });
  const lava = M.paint(c.color, { gloss: 0.6, glow: 0.95 });
  const hot = M.glow(0xffc04a);
  const flank = [[0.115, 0.5], [0.14, 0.42], [0.19, 0.3], [0.24, 0.16], [0.3, 0.04]];
  m.add(G.lathe([[0.31, 0], [0.3, 0.04], [0.24, 0.16], [0.19, 0.3], [0.14, 0.42], [0.115, 0.5], [0.09, 0.49], [0.05, 0.44], [0, 0.44]], 10), rock, { p: [0, 0.12, 0] });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + 0.9;
    m.add(G.sphere(0.085, 6, 5), rock, { p: [Math.sin(a) * 0.25, 0.16, Math.cos(a) * 0.25], s: [1.1, 0.75, 1] });
  }
  m.add(G.cyl(0.088, 0.088, 0.012, 12), hot, { p: [0, 0.585, 0], shadow: false });           // lava lake
  m.add(G.torus(0.105, 0.022, 6, 12), lava, { p: [0, 0.615, 0], r: [HALF_PI, 0, 0] });        // glowing rim
  // Lava streams follow the flank; some run all the way down.
  [[0.75, 5], [2.3, 4], [3.6, 5], [5.25, 3]].forEach(([a, n], i) => {
    const pts = flank.slice(0, n).map(([r, y], k) => {
      const w = a + Math.sin(k * 1.7 + i) * 0.12;
      return [Math.sin(w) * (r + 0.004), 0.12 + y, Math.cos(w) * (r + 0.004)];
    });
    m.add(G.tube(pts, 0.032, 6), lava);
    const end = pts[pts.length - 1];
    m.add(G.sphere(0.05, 8, 6), lava, { p: [end[0], end[1], end[2]], s: [1.4, 0.6, 1.4] });
  });
  // The hole the ball is meant to go through.
  m.add(G.rbox(0.1, 0.11, 0.05, 0.03), BLACK(), { p: [0, 0.165, 0.275] });
  m.add(G.torus(0.06, 0.012, 6, 12, Math.PI), hot, { p: [0, 0.17, 0.302], shadow: false });
  // Fire in the crater.
  const fire = m.group({ p: [0, 0.59, 0] });
  fire.add(G.cone(0.095, 0.26, 9), M.glow(0xff7a1a, 0.9), { p: [0, 0.13, 0], shadow: false });
  fire.add(G.cone(0.05, 0.17, 7), M.glow(0xffe07a), { p: [0, 0.085, 0], shadow: false });
  m.anim(fire.object, 'flame');
  const smoke = M.glow(0xb9b2c6, 0.45);
  for (let i = 0; i < 3; i++) {
    pulsing(m, [0.02 * (i - 1), 0.75 + i * 0.055, -0.01 * i], G.sphere(0.04 + i * 0.006, 8, 6), smoke, i * 1.4);
  }
}

function championsCup(m, c) {
  // The trophy itself, and the one perfect ball that hovers over it.
  const gold = M.paint(c.color, { gloss: 0.95, glow: 0.22 });
  gold.metalness = 0.6;
  m.add(G.rbox(0.38, 0.14, 0.38, 0.03), NAVY(), { p: [0, 0.19, 0] });
  m.add(G.rbox(0.32, 0.03, 0.32, 0.012), gold, { p: [0, 0.272, 0] });
  m.add(G.rbox(0.22, 0.07, 0.012, 0.006), gold, { p: [0, 0.19, 0.192] });
  m.add(G.box(0.16, 0.012, 0.006), BLACK(), { p: [0, 0.2, 0.2] });
  m.add(G.box(0.11, 0.012, 0.006), BLACK(), { p: [0, 0.175, 0.2] });
  m.add(G.lathe([
    [0.11, 0], [0.12, 0.02], [0.05, 0.06], [0.035, 0.12], [0.06, 0.16], [0.14, 0.22], [0.2, 0.32],
    [0.215, 0.42], [0.2, 0.43], [0.185, 0.42], [0.17, 0.33], [0.1, 0.24], [0, 0.22]
  ], 28), gold, { p: [0, 0.285, 0] });
  m.add(G.torus(0.047, 0.014, 6, 16), gold, { p: [0, 0.42, 0], r: [HALF_PI, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.torus(0.078, 0.018, 8, 16, Math.PI), gold, { p: [s * 0.2, 0.62, 0], r: [0, 0, -s * HALF_PI] });   // handles
  }
  m.add(G.star(0.06, 0.026, 0.012), M.glow(0xffffff), { p: [0, 0.63, 0.212], shadow: false });
  // The ball, and stars circling it.
  const ball = m.group({ p: [0, 0.815, 0] });
  ball.add(G.sphere(0.07, 16, 12), BALL());
  ball.add(G.sphere(0.1, 12, 10), M.energy(c.color, 0.35), { shadow: false });
  m.anim(ball.object, 'float');
  const halo = m.group({ p: [0, 0.8, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    halo.add(G.star(0.04, 0.017, 0.012), M.glow(0xfff3a0), { p: [Math.cos(a) * 0.17, (i - 1) * 0.03, Math.sin(a) * 0.17], r: [0, HALF_PI - a, 0], shadow: false });
  }
  m.anim(halo.object, 'spin', { speed: 0.9 });
}

const TOWERS = [ballCannon, lighthouse, windmill, waterHazard, clownMouth, loopTheLoop, volcano, championsCup];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, faces +Z, and its feet reach about y = -0.95.

function eyes(m, { x = 0.2, y = 0.12, z = 0.9, r = 0.12, color = 0xffffff, pupil = 0x000000 } = {}) {
  for (const s of [-1, 1]) {
    m.add(G.sphere(r, 10, 8), M.glow(color), { p: [s * x, y, z], shadow: false });
    m.add(G.sphere(r * 0.5, 8, 6), M.glow(pupil), { p: [s * x * 0.98, y, z + r * 0.75], shadow: false });
  }
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, outline, { y = 0.3, z = -0.1, hinge = 0.25 } = {}) {
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate(outline, 0.03);
    geo.rotateX(-Math.PI / 2);                      // outline +y becomes "towards the tail"
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

/** A thick tapering tail pointing back and down. */
function tail(m, mat, { r = 0.26, len = 1, p = [0, -0.42, -0.85], droop = 0.3 } = {}) {
  m.add(G.cone(r, len, 10), mat, { p, r: [-HALF_PI - droop, 0, 0] });
}

/** Thighs, feet and toe claws of an upright biped. */
function bipedLegs(m, mat, claw, { x = 0.33, r = 0.24 } = {}) {
  for (const s of [-1, 1]) {
    m.add(G.sphere(r, 10, 8), mat, { p: [s * x, -0.5, -0.05], s: [0.85, 1.15, 1.1] });
    m.add(G.sphere(r * 0.82, 10, 8), mat, { p: [s * (x + 0.02), -0.84, 0.16], s: [1, 0.55, 1.6] });
    for (const dx of [-0.09, 0, 0.09]) {
      m.add(G.cone(r * 0.16, r * 0.5, 5), claw, { p: [s * (x + 0.02) + dx * r * 4, -0.88, 0.16 + r * 1.35], r: [HALF_PI, 0, 0] });
    }
  }
}

/** A plate standing along the spine, leaning back by `lean`. */
function spinePlate(m, mat, outline, p, lean, s = 1, thick = 0.06) {
  m.add(G.plate(outline, thick), mat, { p, r: [-lean, HALF_PI, 0], s });
}

const DIAMOND = [[0, -0.05], [0.17, 0.2], [0, 0.46], [-0.17, 0.2]];
const MAPLE = [[-0.07, -0.05], [0.07, -0.05], [0.21, 0.2], [0.1, 0.23], [0.17, 0.42], [0.05, 0.36], [0, 0.56], [-0.05, 0.36], [-0.17, 0.42], [-0.1, 0.23], [-0.21, 0.2]];

function lizard(m, enemy, c) {
  // All head and eyes: a hatchling that thinks it is forty storeys tall.
  const skin = M.paint(c.color, { gloss: 0.6, glow: 0.16 });
  const belly = M.paint(c.accent, { gloss: 0.4, glow: 0.1 });
  const bone = M.paint(0xfffbe6, { gloss: 0.5 });
  m.add(G.sphere(0.45, 14, 10), skin, { p: [0, -0.2, -0.1], s: [0.85, 0.9, 1.1] });
  m.add(G.sphere(0.36, 12, 10), belly, { p: [0, -0.28, 0.1], s: [0.8, 0.8, 0.9] });
  m.add(G.sphere(0.42, 14, 12), skin, { p: [0, 0.38, 0.32], s: [1, 0.9, 1] });           // head
  m.add(G.sphere(0.25, 12, 10), skin, { p: [0, 0.28, 0.66], s: [1, 0.7, 1] });            // snout
  for (const s of [-1, 1]) {
    m.add(G.cone(0.04, 0.12, 5), bone, { p: [s * 0.1, 0.13, 0.8], r: [Math.PI, 0, 0] }); // fangs
    m.add(G.tube([[s * 0.33, -0.05, 0.2], [s * 0.44, -0.15, 0.42], [s * 0.36, -0.2, 0.58]], 0.06, 5), skin);
  }
  tail(m, skin, { r: 0.26, len: 1.0, p: [0, -0.42, -0.82] });
  bipedLegs(m, skin, bone, { x: 0.32, r: 0.23 });
  for (const [y, z, lean, h] of [[0.78, 0.26, 0.1, 0.24], [0.6, -0.04, 0.9, 0.22], [0.26, -0.42, 1.0, 0.2], [-0.08, -0.6, 1.3, 0.16]]) {
    m.add(G.cone(0.08, h, 5), belly, { p: [0, y, z], r: [-lean, 0, 0] });                 // spines
  }
  eyes(m, { x: 0.23, y: 0.5, z: 0.6, r: 0.15 });
}

function magmasaur(m, enemy, c) {
  // Stocky upright fire-breather: molten belly, glowing back plates.
  const skin = M.paint(c.color, { gloss: 0.5, glow: 0.2 });
  const molten = M.paint(c.accent, { gloss: 0.6, glow: 0.95 });
  const dark = M.matte(0x3a0d08);
  m.add(G.sphere(0.58, 14, 12), skin, { p: [0, -0.15, -0.05], s: [0.95, 1.05, 0.9] });
  m.add(G.sphere(0.45, 12, 10), molten, { p: [0, -0.2, 0.2], s: [0.8, 0.9, 0.6] });
  m.add(G.sphere(0.36, 12, 10), skin, { p: [0, 0.52, 0.22] });                              // head
  m.add(G.sphere(0.26, 12, 10), skin, { p: [0, 0.54, 0.54], s: [1, 0.6, 1.1] });            // upper jaw
  m.add(G.sphere(0.23, 12, 10), skin, { p: [0, 0.33, 0.47], s: [1, 0.42, 1.1] });           // lower jaw
  m.add(G.sphere(0.15, 10, 8), M.glow(0xffc04a), { p: [0, 0.43, 0.55], shadow: false });    // furnace
  for (const s of [-1, 1]) {
    m.add(G.cone(0.07, 0.26, 6), dark, { p: [s * 0.2, 0.88, 0.12], r: [-0.3, 0, -s * 0.3] });   // horns
    m.add(G.tube([[s * 0.48, 0.05, 0.1], [s * 0.6, -0.1, 0.38], [s * 0.48, -0.15, 0.55]], 0.085, 6), skin);
  }
  tail(m, skin, { r: 0.3, len: 0.95, p: [0, -0.5, -0.8] });
  bipedLegs(m, skin, dark, { x: 0.38, r: 0.28 });
  spinePlate(m, molten, DIAMOND, [0, 0.72, -0.1], 0.25, 0.8);
  spinePlate(m, molten, DIAMOND, [0, 0.38, -0.42], 0.75, 1);
  spinePlate(m, molten, DIAMOND, [0, -0.05, -0.56], 1.2, 0.85);
  spinePlate(m, molten, DIAMOND, [0, -0.36, -0.86], 1.45, 0.6);
  eyes(m, { x: 0.2, y: 0.68, z: 0.48, r: 0.1, color: 0xffe07a });
  flame(m, enemy, { p: [0, 0.43, 0.68], r: [HALF_PI, 0, 0], rad: 0.15, h: 0.55 });
}

function pterosaur(m, enemy, c) {
  // Long beak, long crest, leathery wings: unmistakable from above.
  const skin = M.paint(c.color, { gloss: 0.5, glow: 0.14 });
  const bright = M.paint(c.accent, { gloss: 0.6, glow: 0.3 });
  m.add(G.sphere(0.4, 12, 10), skin, { p: [0, 0, -0.15], s: [0.8, 0.75, 1.4] });
  m.add(G.sphere(0.28, 12, 10), skin, { p: [0, 0.2, 0.52], s: [0.9, 0.9, 1.1] });
  m.add(G.cone(0.15, 0.8, 8), bright, { p: [0, 0.13, 1.08], r: [HALF_PI, 0, 0], s: [0.8, 1, 1] });     // beak
  m.add(G.cone(0.12, 0.75, 6), bright, { p: [0, 0.48, 0.12], r: [-HALF_PI + 0.5, 0, 0], s: [0.5, 1, 1] });   // crest
  m.add(G.cone(0.1, 0.55, 6), skin, { p: [0, 0, -0.9], r: [-HALF_PI, 0, 0] });
  m.add(G.star(0.13, 0.06, 0.03, 4), bright, { p: [0, 0, -1.2], r: [HALF_PI, 0, 0] });                  // tail vane
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.15, -0.2, -0.45], [s * 0.2, -0.5, -0.55], [s * 0.2, -0.62, -0.38]], 0.04, 5), skin);
  }
  eyes(m, { x: 0.2, y: 0.3, z: 0.66, r: 0.08 });
  wings(m, enemy, M.paint(c.accent, { gloss: 0.3, glow: 0.22 }),
    [[0, -0.28], [0.55, -0.42], [1.05, -0.32], [1.55, 0.05], [1.08, 0.1], [0.82, 0.36], [0.55, 0.16], [0.28, 0.46], [0, 0.3]], { y: 0.22, z: -0.1, hinge: 0.22 });
}

function ankylo(m, enemy, c) {
  // A walking bunker: studded dome, side spikes, club tail.
  const shell = M.paint(c.color, { gloss: 0.55, glow: 0.2 });
  const hide = M.paint(0xe9dcbd, { gloss: 0.3 });
  const stud = M.paint(c.accent, { gloss: 0.7, glow: 0.35 });
  const dark = M.matte(0x1c2238);
  m.add(G.sphere(0.85, 16, 12), shell, { p: [0, 0, -0.1], s: [1, 0.62, 1.15] });
  m.add(G.sphere(0.75, 14, 10), hide, { p: [0, -0.2, -0.1], s: [0.95, 0.5, 1.1] });
  m.add(G.torus(0.82, 0.07, 6, 22), dark, { p: [0, -0.12, -0.1], r: [HALF_PI, 0, 0], s: [1, 1.15, 1] });
  m.add(G.cone(0.11, 0.24, 6), stud, { p: [0, 0.6, -0.1] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.52;
    m.add(G.cone(0.1, 0.22, 6), stud, { p: [Math.sin(a) * 0.5, 0.48, -0.1 + Math.cos(a) * 0.58], r: [Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5] });
  }
  for (const s of [-1, 1]) {
    for (const z of [-0.6, -0.1, 0.4]) m.add(G.cone(0.09, 0.3, 6), stud, { p: [s * 0.9, -0.12, z], r: [0, 0, -s * HALF_PI] });
    m.add(G.cyl(0.17, 0.2, 0.46, 10), hide, { p: [s * 0.5, -0.72, 0.42] });
    m.add(G.cyl(0.17, 0.2, 0.46, 10), hide, { p: [s * 0.5, -0.72, -0.62] });
  }
  m.add(G.sphere(0.3, 12, 10), hide, { p: [0, -0.12, 0.95], s: [1, 0.8, 1.1] });            // head
  m.add(G.sphere(0.27, 12, 8), shell, { p: [0, 0.02, 0.9], s: [1.1, 0.5, 1.1] });           // skull plate
  m.add(G.cone(0.1, 0.18, 6), dark, { p: [0, -0.18, 1.3], r: [HALF_PI + 0.3, 0, 0] });      // beak
  eyes(m, { x: 0.21, y: -0.06, z: 1.12, r: 0.07 });
  m.add(G.tube([[0, -0.2, -1.0], [0, -0.32, -1.35], [0, -0.22, -1.65]], 0.1, 7), hide);
  m.add(G.sphere(0.22, 10, 8), shell, { p: [0, -0.2, -1.75], s: [1.3, 0.8, 1] });           // club
  for (const s of [-1, 1]) m.add(G.cone(0.07, 0.2, 5), stud, { p: [s * 0.32, -0.2, -1.75], r: [0, 0, -s * HALF_PI] });
}

function tricerabrute(m, enemy, c) {
  // Three horns and a frill like a shield: the heavy that leads the charge.
  const skin = M.paint(c.color, { gloss: 0.55, glow: 0.18 });
  const bone = M.paint(c.accent, { gloss: 0.6, glow: 0.25 });
  const dark = M.matte(0x3d1a08);
  m.add(G.sphere(0.7, 16, 12), skin, { p: [0, -0.05, -0.3], s: [0.9, 0.85, 1.25] });
  m.add(G.sphere(0.4, 14, 10), skin, { p: [0, 0, 0.7], s: [0.95, 0.9, 1.15] });
  // Frill: a disc behind the head, leaning back, knobbed along the top edge.
  const frill = m.group({ p: [0, 0.32, 0.36], r: [HALF_PI + 0.45, 0, 0] });
  frill.add(G.cyl(0.64, 0.64, 0.09, 20), skin);
  frill.add(G.cyl(0.46, 0.46, 0.1, 20), M.paint(0xff8a3d, { gloss: 0.5, glow: 0.45 }), { p: [0, 0.005, 0] });
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    frill.add(G.sphere(0.1, 8, 6), bone, { p: [Math.cos(a) * 0.63, 0, Math.sin(a) * 0.63] });
  }
  for (const s of [-1, 1]) {
    m.add(G.cone(0.09, 0.65, 8), bone, { p: [s * 0.21, 0.5, 1.0], r: [0.9, 0, 0] });        // brow horns
    m.add(G.cyl(0.2, 0.22, 0.5, 10), skin, { p: [s * 0.42, -0.7, 0.3] });
    m.add(G.cyl(0.2, 0.22, 0.5, 10), skin, { p: [s * 0.45, -0.7, -0.75] });
    for (const z of [0.3, -0.75]) m.add(G.cyl(0.225, 0.225, 0.07, 10), dark, { p: [s * (z > 0 ? 0.42 : 0.45), -0.915, z] });
  }
  m.add(G.cone(0.08, 0.3, 8), bone, { p: [0, 0.2, 1.2], r: [0.5, 0, 0] });                  // nose horn
  m.add(G.cone(0.2, 0.36, 8), dark, { p: [0, -0.14, 1.14], r: [HALF_PI + 0.5, 0, 0] });     // beak
  tail(m, skin, { r: 0.3, len: 0.8, p: [0, -0.2, -1.3], droop: 0.15 });
  for (let i = 0; i < 4; i++) m.add(G.cone(0.08, 0.26, 5), bone, { p: [0, 0.6 - i * 0.07, -0.2 - i * 0.28], r: [-0.2 - i * 0.15, 0, 0] });
  eyes(m, { x: 0.3, y: 0.1, z: 0.98, r: 0.08, color: 0xffe14d });
}

function emberDrake(m, enemy, c) {
  // A dragon in miniature: long neck, bat wings, tail alight.
  const skin = M.paint(c.color, { gloss: 0.7, glow: 0.28 });
  const red = M.paint(c.accent, { gloss: 0.5, glow: 0.3 });
  m.add(G.sphere(0.42, 12, 10), skin, { p: [0, 0, -0.2], s: [0.8, 0.8, 1.4] });
  m.add(G.tube([[0, 0.05, 0.2], [0, 0.42, 0.48], [0, 0.56, 0.78]], 0.15, 8), skin);          // neck
  m.add(G.sphere(0.26, 12, 10), skin, { p: [0, 0.58, 0.85], s: [0.9, 0.85, 1.2] });
  m.add(G.sphere(0.17, 10, 8), skin, { p: [0, 0.52, 1.12], s: [1, 0.7, 1.2] });
  for (const s of [-1, 1]) {
    m.add(G.cone(0.055, 0.3, 6), red, { p: [s * 0.14, 0.84, 0.66], r: [-0.7, 0, 0] });       // horns
    m.add(G.sphere(0.13, 8, 6), skin, { p: [s * 0.22, -0.32, -0.3], s: [0.8, 1, 1.4] });     // tucked legs
  }
  m.add(G.tube([[0, 0, -0.7], [0, 0.08, -1.15], [0, 0.3, -1.5]], 0.1, 7), skin);
  for (let i = 0; i < 3; i++) m.add(G.cone(0.07, 0.22, 5), red, { p: [0, 0.38, 0.05 - i * 0.3], r: [-0.3, 0, 0] });
  eyes(m, { x: 0.17, y: 0.67, z: 0.98, r: 0.07, color: 0xfffbd0 });
  wings(m, enemy, red,
    [[0, -0.3], [0.6, -0.48], [1.45, -0.28], [1.22, 0.05], [1.02, 0.34], [0.8, 0.1], [0.56, 0.42], [0.34, 0.14], [0, 0.3]], { y: 0.28, z: -0.15, hinge: 0.22 });
  flame(m, enemy, { p: [0, 0.3, -1.5], r: [-0.9, 0, 0], rad: 0.15, h: 0.55 });
  flame(m, enemy, { p: [0, 0.5, 1.28], r: [HALF_PI, 0, 0], rad: 0.1, h: 0.4 });
}

function parzilla(m, enemy, c) {
  // The classic: upright, thick tail, rows of glowing dorsal plates, a mouth
  // charging up something terrible.
  const skin = M.paint(c.color, { gloss: 0.3, glow: 0.22 });
  const belly = M.paint(0x8f8fd0, { gloss: 0.3, glow: 0.06 });
  const plate = M.glow(c.accent);
  const bone = M.paint(0xfffbe6, { gloss: 0.5 });
  m.add(G.sphere(0.68, 18, 14), skin, { p: [0, -0.1, -0.1], s: [0.95, 1.1, 0.9] });
  m.add(G.sphere(0.52, 14, 12), belly, { p: [0, -0.2, 0.18], s: [0.85, 0.95, 0.6] });
  m.add(G.sphere(0.42, 14, 10), skin, { p: [0, 0.5, 0.1] });                                   // neck
  m.add(G.sphere(0.36, 14, 12), skin, { p: [0, 0.8, 0.28], s: [0.95, 0.85, 1.1] });            // skull
  m.add(G.rbox(0.42, 0.2, 0.5, 0.08), skin, { p: [0, 0.8, 0.66] });                            // snout
  m.add(G.rbox(0.36, 0.1, 0.44, 0.04), skin, { p: [0, 0.57, 0.58], r: [0.3, 0, 0] });          // jaw
  m.add(G.rbox(0.3, 0.02, 0.36, 0.008), M.matte(0x2a0a12), { p: [0, 0.695, 0.66] });           // roof of mouth
  for (const x of [-0.15, -0.05, 0.05, 0.15]) {
    m.add(G.cone(0.035, 0.11, 5), bone, { p: [x, 0.655, 0.88], r: [Math.PI, 0, 0] });
    m.add(G.cone(0.03, 0.09, 5), bone, { p: [x * 0.9, 0.59, 0.77] });
  }
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.2, 0.06, 0.2, 0.02), skin, { p: [s * 0.2, 0.98, 0.5], r: [0.2, 0, -s * 0.35] });   // brows
    m.add(G.sphere(0.065, 8, 6), M.glow(c.accent), { p: [s * 0.2, 0.9, 0.56], shadow: false });
    m.add(G.sphere(0.03, 6, 5), M.glow(0xffffff), { p: [s * 0.2, 0.9, 0.615], shadow: false });
    m.add(G.tube([[s * 0.55, 0.2, 0.05], [s * 0.76, 0, 0.36], [s * 0.6, -0.04, 0.62]], 0.11, 7), skin);  // arms
    for (const dx of [-0.07, 0.07]) m.add(G.cone(0.035, 0.14, 5), bone, { p: [s * 0.6 + dx, -0.05, 0.74], r: [HALF_PI, 0, 0] });
  }
  tail(m, skin, { r: 0.42, len: 1.35, p: [0, -0.5, -0.95], droop: 0.25 });
  bipedLegs(m, skin, bone, { x: 0.46, r: 0.34 });
  // Dorsal plates: a big centre row with a smaller row either side.
  const rows = [[1.02, 0.02, 0.15, 0.6], [0.55, -0.42, 0.65, 1.05], [0.12, -0.64, 1.1, 0.95], [-0.24, -0.86, 1.35, 0.7], [-0.44, -1.28, 1.4, 0.45]];
  for (const [y, z, lean, s] of rows) {
    spinePlate(m, plate, MAPLE, [0, y, z], lean, s);
    for (const side of [-1, 1]) spinePlate(m, plate, MAPLE, [side * 0.24 * s, y - 0.06, z + 0.06], lean, s * 0.55);
  }
  // The charge building in its throat (animated as the boss gem).
  const throat = m.group({ p: [0, 0.66, 0.66] });
  throat.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.sphere(0.1, 8, 6), M.glow(c.accent));
  throat.object.add(enemy.crownGem);
}

function eggClutch(m, enemy, c) {
  // A waddling heap of cracked kaiju eggs, a baby already peeking out of the
  // top one. A Hatchling (enemy.mini) is one baby in the bottom half of its shell.
  const shell = M.paint(c.color, { gloss: 0.6, glow: 0.12 });
  const skin = M.paint(c.accent, { gloss: 0.6, glow: 0.2 });
  const speck = M.paint(0x3a3c96, { gloss: 0.4 });
  const crack = M.glow(0xffe14d);
  const bone = M.paint(0xfffbe6, { gloss: 0.5 });
  // Stubby clawed feet under it all.
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.2, 10, 8), skin, { p: [s * 0.3, -0.84, 0.12], s: [1, 0.6, 1.5] });
    for (const dx of [-0.08, 0.08]) m.add(G.cone(0.04, 0.14, 5), bone, { p: [s * 0.3 + dx, -0.88, 0.42], r: [HALF_PI, 0, 0] });
  }
  if (enemy.mini) {
    const cup = M.paint(c.color, { gloss: 0.6, glow: 0.12 });
    cup.side = THREE.DoubleSide;
    m.add(G.dome(0.62), cup, { p: [0, -0.15, 0], r: [Math.PI, 0, 0], s: [1, 1.1, 1] });   // lower half-shell
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      m.add(G.cone(0.12, 0.22, 4), cup, { p: [Math.cos(a) * 0.55, -0.06, Math.sin(a) * 0.55] });   // jagged rim
    }
    m.add(G.sphere(0.4, 12, 10), skin, { p: [0, 0.18, 0.08] });
    m.add(G.sphere(0.24, 10, 8), skin, { p: [0, 0.12, 0.42], s: [1, 0.7, 1] });
    for (const s of [-1, 1]) m.add(G.cone(0.035, 0.1, 5), bone, { p: [s * 0.09, -0.02, 0.56], r: [Math.PI, 0, 0] });
    eyes(m, { x: 0.18, y: 0.32, z: 0.38, r: 0.13 });
    return;
  }
  // Three eggs in a ring, one on top.
  const eggs = [[0, -0.42, 0.32, 0], [-0.36, -0.42, -0.24, 0.2], [0.36, -0.42, -0.24, -0.2], [0, 0.28, -0.05, 0]];
  eggs.forEach(([x, y, z, tilt], i) => {
    m.add(G.sphere(0.44, 14, 12), shell, { p: [x, y, z], r: [0, 0, tilt], s: [0.85, 1.12, 0.85] });
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + i, h = (k % 2 ? 0.15 : -0.12);
      m.add(G.sphere(0.07, 6, 5), speck, { p: [x + Math.cos(a) * 0.36, y + h, z + Math.sin(a) * 0.36], s: [1, 1, 0.5] });
    }
    if (i < 3) {
      // A glowing zig-zag crack across the front of each lower egg.
      const fx = x * 1.15, fz = z + (z > 0 ? 0.37 : 0.05) + 0.02;
      m.add(G.tube([[fx - 0.22, y + 0.05, fz], [fx - 0.1, y + 0.16, fz + 0.03], [fx, y + 0.02, fz + 0.04], [fx + 0.1, y + 0.18, fz + 0.03], [fx + 0.22, y + 0.06, fz]], 0.03, 4), crack, { shadow: false });
    }
  });
  // The top egg has hatched open: a baby head pokes out.
  m.add(G.torus(0.3, 0.06, 6, 12), crack, { p: [0, 0.62, -0.05], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.sphere(0.3, 12, 10), skin, { p: [0, 0.78, 0.0] });
  m.add(G.sphere(0.18, 10, 8), skin, { p: [0, 0.74, 0.26], s: [1, 0.7, 1] });
  eyes(m, { x: 0.13, y: 0.88, z: 0.22, r: 0.1 });
}

function stegoShield(m, enemy, c) {
  // A stegosaurus whose back plates glow like a force field: the plates are
  // what shelter everything around it.
  const skin = M.paint(c.color, { gloss: 0.5, glow: 0.16 });
  const plate = M.paint(c.accent, { gloss: 0.8, glow: 0.7 });
  const bone = M.paint(0xfffbe6, { gloss: 0.5 });
  const dark = M.matte(0x2a1d10);
  m.add(G.sphere(0.7, 16, 12), skin, { p: [0, -0.2, -0.1], s: [0.85, 0.72, 1.25] });
  m.add(G.tube([[0, -0.25, 0.7], [0, -0.38, 0.95], [0, -0.42, 1.12]], 0.18, 7), skin);           // neck
  m.add(G.sphere(0.22, 12, 10), skin, { p: [0, -0.4, 1.2], s: [0.85, 0.75, 1.3] });               // small head
  eyes(m, { x: 0.13, y: -0.33, z: 1.32, r: 0.06 });
  for (const s of [-1, 1]) {
    for (const z of [0.45, -0.6]) {
      m.add(G.cyl(0.15, 0.17, 0.5, 10), skin, { p: [s * 0.4, -0.7, z] });
      m.add(G.cyl(0.18, 0.18, 0.07, 10), dark, { p: [s * 0.4, -0.92, z] });
    }
  }
  // Tail with the four-spike thagomizer.
  m.add(G.tube([[0, -0.2, -0.95], [0, -0.25, -1.3], [0, -0.1, -1.65]], 0.13, 7), skin);
  for (const s of [-1, 1]) for (const z of [-1.45, -1.65]) m.add(G.cone(0.05, 0.32, 6), bone, { p: [s * 0.18, -0.02, z], r: [0, 0, -s * 1.1] });
  // Two staggered rows of big glowing plates along the arched spine.
  const spine = [[0.72, 0.1, -0.35, 0.8], [0.4, 0.33, -0.15, 1.15], [0.05, 0.42, 0.0, 1.35], [-0.32, 0.36, 0.2, 1.25], [-0.68, 0.16, 0.5, 0.95], [-1.0, -0.06, 0.85, 0.6]];
  spine.forEach(([z, y, lean, s], i) => {
    const x = (i % 2 ? 1 : -1) * 0.1;
    spinePlate(m, plate, DIAMOND, [x, y + 0.02, z], lean, s, 0.07);
  });
}

function medisaur(m, enemy, c) {
  // A duck-billed dino with a glowing crest, hugging a first-aid kit.
  const skin = M.paint(c.color, { gloss: 0.55, glow: 0.16 });
  const crest = M.paint(c.accent, { gloss: 0.8, glow: 0.8 });
  const white = M.paint(0xf7f9fb, { gloss: 0.6, glow: 0.12 });
  const bone = M.paint(0xfffbe6, { gloss: 0.5 });
  m.add(G.sphere(0.52, 14, 12), skin, { p: [0, -0.18, -0.08], s: [0.9, 1.05, 0.95] });
  m.add(G.sphere(0.3, 12, 10), skin, { p: [0, 0.48, 0.18] });                                       // head
  m.add(G.sphere(0.22, 12, 10), M.paint(0xffe4a8, { gloss: 0.5 }), { p: [0, 0.38, 0.48], s: [1.05, 0.5, 1.3] });   // duck bill
  m.add(G.tube([[0, 0.66, 0.1], [0, 0.88, -0.1], [0, 0.95, -0.42], [0, 0.88, -0.62]], 0.09, 7), crest);           // crest
  eyes(m, { x: 0.18, y: 0.58, z: 0.38, r: 0.09 });
  tail(m, skin, { r: 0.24, len: 0.95, p: [0, -0.42, -0.85] });
  bipedLegs(m, skin, bone, { x: 0.3, r: 0.22 });
  // First-aid kit held to the chest: white box, handle, green cross.
  m.add(G.rbox(0.56, 0.42, 0.22, 0.05), white, { p: [0, -0.16, 0.5] });
  m.add(G.torus(0.1, 0.025, 5, 12, Math.PI), white, { p: [0, 0.05, 0.5] });
  m.add(G.box(0.3, 0.09, 0.03), M.glow(c.accent), { p: [0, -0.16, 0.62], shadow: false });
  m.add(G.box(0.09, 0.3, 0.03), M.glow(c.accent), { p: [0, -0.16, 0.62], shadow: false });
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.42, 0.05, 0.1], [s * 0.38, -0.08, 0.38], [s * 0.26, -0.12, 0.52]], 0.07, 5), skin);   // arms
}

const ENEMIES = {
  SPLITTER: eggClutch,
  SHIELDER: stegoShield,
  HEALER: medisaur,
  SWARM: lizard,
  FIRE: magmasaur,
  FLYING: pterosaur,
  ARMORED: ankylo,
  ELITE: tricerabrute,
  FLYING_FIRE: emberDrake,
  BOSS: parzilla
};

// ── Projectiles ─────────────────────────────────────────────────────────────
//
// Units: 1 = a shot's radius, nose along +Z. See rendering/projectile-models.js.

/** A dimpled ball: a sphere studded with shallow darker dimples. */
function dimpledBall(m, mat, dimple, r = 0.85) {
  m.add(G.sphere(r, 18, 14), mat);
  for (let i = 0; i < 14; i++) {
    const y = 1 - (i + 0.5) / 7, rr = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.4;
    m.add(G.sphere(r * 0.13, 6, 5), dimple, { p: [Math.cos(a) * rr * r * 0.92, y * r * 0.92, Math.sin(a) * rr * r * 0.92] });
  }
}

const PROJECTILES = {
  golfBall(m) {
    dimpledBall(m, M.paint(0xf7f9fb, { gloss: 0.6, glow: 0.25 }), M.paint(0xdfe5ec, { gloss: 0.3, glow: 0.1 }));
  },
  sails(m, { color }) {
    // A windmill's four-bladed sail cross, spinning flat as it skims along.
    const g = m.group({ r: [0.35, 0, 0] });
    const cloth = M.paint(0xfff6e0, { gloss: 0.3, glow: 0.25 }), edge = M.glow(color);
    g.add(G.sphere(0.22, 10, 8), M.metal(0xdfe6ee));
    for (let i = 0; i < 4; i++) {
      const blade = g.group({ r: [0, i * HALF_PI + 0.3, 0] });
      blade.add(G.box(0.12, 0.1, 1.3), M.paint(0xf7f4ee), { p: [0, 0, 0.65] });
      blade.add(G.box(0.5, 0.06, 0.95), cloth, { p: [0.28, 0, 0.78] });
      blade.add(G.box(0.08, 0.08, 0.95), edge, { p: [0.54, 0, 0.78] });
    }
  },
  splash(m, { color }) {
    const water = M.paint(color, { gloss: 1, glow: 0.45 });
    m.add(G.sphere(0.6, 14, 10), water, { p: [0, 0, 0.2] });
    m.add(G.cone(0.58, 1.3, 14), water, { p: [0, 0, -0.62], r: [-HALF_PI, 0, 0] });
    m.add(G.sphere(0.16, 8, 6), M.glow(0xffffff), { p: [0.22, 0.3, 0.5] });
  },
  clownNose(m) {
    // The clown's big red honker, launched.
    m.add(G.sphere(0.85, 16, 12), M.paint(0xff2d3d, { gloss: 0.95, glow: 0.35 }));
    m.add(G.sphere(0.2, 8, 6), M.glow(0xffffff), { p: [0.3, 0.42, 0.55] });
  },
  lavaRock(m) {
    // A lump of volcanic rock, glowing through its cracks.
    const rock = M.paint(0x3a2622, { gloss: 0.1 });
    rock.flatShading = true;
    m.add(G.sphere(0.8, 7, 5), rock, { s: [1, 0.85, 1.1] });
    const hot = M.glow(0xffb03a);
    m.add(G.tube([[-0.5, 0.5, 0.4], [-0.1, 0.65, 0.2], [0.2, 0.55, 0.5], [0.6, 0.35, 0.4]], 0.08, 4), hot);
    m.add(G.tube([[-0.6, -0.2, 0.6], [-0.2, 0.1, 0.8], [0.3, -0.1, 0.75]], 0.07, 4), hot);
    m.add(G.sphere(0.6, 10, 8), M.energy(0xff6a1a, 0.4), { p: [0, 0, -0.6], shadow: false });
  },
  goldBall(m) {
    // The champion's golden ball, with a star stamped on it.
    const gold = M.metal(0xffc83a, { rough: 0.22 });
    gold.emissive = new THREE.Color(0x6b4300);
    gold.emissiveIntensity = 0.6;
    dimpledBall(m, gold, gold);
    m.add(G.star(0.4, 0.17, 0.08), M.glow(0xffffff), { p: [0.84, 0, 0], r: [0, HALF_PI, 0] });
    m.add(G.star(0.4, 0.17, 0.08), M.glow(0xffffff), { p: [-0.84, 0, 0], r: [0, HALF_PI, 0] });
  }
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: mown stripes of putting-green felt and a chalk ring. */
function paintFloor(ctx, size) {
  const bands = 4, w = size / bands;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = i % 2 ? '#136f33' : '#198540';
    ctx.fillRect(i * w, 0, w, size);
  }
  // Felt nap: short flecks, lighter and darker, all the same way up.
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(210, 255, 220, 0.05)' : 'rgba(0, 40, 12, 0.07)';
    ctx.fillRect(Math.random() * (size - 2), Math.random() * (size - 4), 1.5, 3.5);
  }
  // Painted course markings, kept faint so the pieces on top stay readable.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.17)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const [x, y] of [[w, w], [3 * w, w], [w, 3 * w], [3 * w, 3 * w]]) {
    ctx.fillRect(x - 9, y - 1.5, 18, 3);
    ctx.fillRect(x - 1.5, y - 9, 3, 18);
  }
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // golf bag with clubs
      const bag = M.paint(0xff4fb8, { gloss: 0.6, glow: 0.15 });
      m.add(G.lathe([[0.17, 0], [0.2, 0.04], [0.19, 0.62], [0.22, 0.66], [0.22, 0.72]], 16), bag, { p: [0, 0, 0] });
      m.add(G.cyl(0.2, 0.2, 0.02, 16), BLACK(), { p: [0, 0.69, 0] });
      m.add(G.rbox(0.2, 0.26, 0.08, 0.03), M.paint(0xf4f6f8, { gloss: 0.5 }), { p: [0, 0.3, 0.19] });
      m.add(G.tube([[0.17, 0.6, -0.08], [0.32, 0.4, -0.1], [0.19, 0.15, -0.08]], 0.02, 6), BLACK());
      [[-0.08, 0.02, 0.2], [0.07, 0.06, 0.28], [0, -0.08, 0.14]].forEach(([x, z, h]) => {
        m.add(G.cyl(0.012, 0.012, 0.3 + h, 6), CHROME(), { p: [x, 0.8 + h / 2, z] });
        m.add(G.rbox(0.1, 0.05, 0.035, 0.012), CHROME(), { p: [x + 0.03, 0.96 + h, z] });
      });
      break;
    }
    case 1: { // bucket of range balls
      m.add(G.lathe([[0.2, 0], [0.22, 0.02], [0.3, 0.4], [0.31, 0.42], [0.28, 0.4], [0, 0.36]], 18), M.paint(0xf5ee4a, { gloss: 0.7, glow: 0.12 }), { p: [0, 0, 0] });
      m.add(G.torus(0.29, 0.015, 6, 20, Math.PI), CHROME(), { p: [0, 0.4, 0], r: [0.5, 0, 0] });
      const ball = BALL();
      for (const [x, y, z] of [[-0.12, 0.42, 0.05], [0.1, 0.43, -0.08], [0.06, 0.42, 0.13], [-0.05, 0.44, -0.13], [0, 0.52, 0], [0.38, 0.08, 0.2]]) {
        m.add(G.sphere(0.085, 10, 8), ball, { p: [x, y, z] });
      }
      break;
    }
    case 2: { // garden gnome
      m.add(G.lathe([[0.2, 0], [0.22, 0.04], [0.19, 0.3], [0.12, 0.4]], 14), M.paint(0x3b82f6, { gloss: 0.6, glow: 0.1 }), { p: [0, 0, 0] });
      m.add(G.sphere(0.15, 12, 10), M.paint(0xf7c9a0, { gloss: 0.4 }), { p: [0, 0.48, 0] });
      m.add(G.cone(0.15, 0.3, 10), M.paint(0xf4f6f8, { gloss: 0.3 }), { p: [0, 0.36, 0.09], r: [Math.PI - 0.25, 0, 0] });   // beard
      m.add(G.sphere(0.04, 8, 6), M.paint(0xf29a8a), { p: [0, 0.48, 0.15] });
      m.add(G.cone(0.17, 0.42, 12), M.paint(0xff3b3b, { gloss: 0.7, glow: 0.25 }), { p: [0, 0.77, -0.01], r: [-0.08, 0, 0] });
      m.add(G.rbox(0.2, 0.05, 0.14, 0.02), BLACK(), { p: [0, 0.03, 0.12] });
      break;
    }
    case 3: { // neon flamingo
      const pink = M.paint(0xff5fb0, { gloss: 0.7, glow: 0.7 });
      m.add(G.cyl(0.2, 0.22, 0.04, 16), NAVY(), { p: [0, 0.02, 0] });
      m.add(G.cyl(0.012, 0.012, 0.5, 6), pink, { p: [0.03, 0.28, 0] });
      m.add(G.tube([[-0.03, 0.5, 0], [-0.04, 0.3, 0.02], [0.08, 0.32, 0.02]], 0.012, 5), pink);
      m.add(G.sphere(0.17, 14, 10), pink, { p: [0, 0.6, -0.03], s: [0.75, 0.8, 1.25] });
      m.add(G.tube([[0, 0.65, 0.14], [0, 0.85, 0.28], [0, 1.02, 0.16], [0, 1.1, 0.24]], 0.035, 7), pink);
      m.add(G.sphere(0.06, 10, 8), pink, { p: [0, 1.1, 0.26] });
      m.add(G.cone(0.035, 0.13, 6), BLACK(), { p: [0, 1.06, 0.34], r: [HALF_PI + 0.7, 0, 0] });
      break;
    }
    default: { // practice hole with its flag
      m.add(G.cyl(0.3, 0.32, 0.03, 20), M.paint(0xf4f6f8, { gloss: 0.5 }), { p: [0, 0.015, 0] });
      m.add(G.cyl(0.2, 0.2, 0.034, 20), BLACK(), { p: [0, 0.016, 0] });
      m.add(G.cyl(0.015, 0.015, 1.1, 6), M.paint(0xf5ee4a, { gloss: 0.6, glow: 0.3 }), { p: [0, 0.55, 0] });
      m.add(G.plate([[0, 0], [0.34, -0.11], [0, -0.22]], 0.015), M.paint(0xff3b6b, { gloss: 0.6, glow: 0.45 }), { p: [0.01, 1.08, 0] });
      m.add(G.sphere(0.085, 10, 8), BALL(), { p: [0.3, 0.085, 0.22] });
    }
  }
  return g;
}

/** A neon sign texture, drawn on a canvas (only ever called in the browser). */
function signTexture(text, color) {
  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0b0f2a';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.font = '900 150px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 36;
  ctx.fillStyle = color;
  ctx.fillText(text, 512, 132);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.75;
  ctx.fillText(text, 512, 132);
  return new THREE.CanvasTexture(cv);
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => { g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };
  const rock = M.paint(0x3a2a40, { gloss: 0.1 });
  const lava = M.glow(0xff7a1f);
  const white = M.paint(0xf4f6f8, { gloss: 0.6, glow: 0.2 });

  // The course's big finish: a stepped volcano with lava spilling off each tier.
  const volcanoG = new THREE.Group();
  let m = modeller(volcanoG, 1);
  m.add(G.lathe([[6.4, 0], [5.9, 1.4], [4.7, 1.6], [4.3, 3.6], [3.3, 3.8], [2.9, 6.0], [2.1, 6.2], [1.7, 8.4], [1.3, 8.2], [0.9, 7.6], [0, 7.6]], 14), rock, { p: [0, 0, 0] });
    m.add(G.cyl(1.25, 1.25, 0.1, 14), M.glow(0xffc04a), { p: [0, 8.05, 0], shadow: false });
  m.add(G.torus(1.55, 0.22, 6, 14), lava, { p: [0, 8.35, 0], r: [HALF_PI, 0, 0], shadow: false });
  for (const a of [0.25, 1.2, -0.6, 2.4]) {
    const pts = [[1.7, 8.4], [2.1, 6.2], [2.9, 6.0], [3.3, 3.8], [4.3, 3.6], [4.7, 1.6], [5.9, 1.4], [6.4, 0.1]]
      .map(([r, y]) => [Math.sin(a) * (r + 0.05), y, Math.cos(a) * (r + 0.05)]);
    m.add(G.tube(pts, 0.28, 6), lava, { shadow: false });
  }
  m.add(G.cone(1.0, 3.2, 9), M.energy(0xff6a1a, 0.7), { p: [0, 9.6, 0], shadow: false });
  for (const [x, y, r] of [[0.3, 11.6, 1.0], [-0.5, 12.9, 1.3], [0.6, 14.4, 1.6]]) m.add(G.sphere(r, 9, 7), M.glow(0x3a3550, 0.55), { p: [x, y, 0], shadow: false });
  volcanoG.scale.setScalar(0.85);
  place(volcanoG, hw * 0.4, -hh - 13);

  // The neon sign over the first tee.
  const sign = new THREE.Group();
  m = modeller(sign, 0.85);
  const pink = M.glow(0xff4fd8), green = M.glow(0x39ff88);
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.22, 0.3, 7.5, 10), NAVY(), { p: [s * 5.2, 3.75, 0] });
    m.add(G.cyl(0.08, 0.08, 7.5, 6), s < 0 ? pink : green, { p: [s * 5.2, 3.75, 0.3], shadow: false });
  }
  m.add(G.rbox(11.4, 3.0, 0.4, 0.15), NAVY(), { p: [0, 7.4, 0] });
  m.add(new THREE.PlaneGeometry(10.8, 2.6), new THREE.MeshBasicMaterial({ map: signTexture('KAIJU GOLF', '#39ff88'), fog: false, toneMapped: false }), { p: [0, 7.4, 0.22], shadow: false });
  m.add(G.torus(5.3, 0.13, 6, 30, Math.PI), pink, { p: [0, 8.9, 0], s: [1, 0.5, 1], shadow: false });
  m.add(G.torus(4.7, 0.09, 6, 30, Math.PI), green, { p: [0, 8.9, 0], s: [1, 0.48, 1], shadow: false });
  m.add(G.sphere(1.0, 16, 12), white, { p: [0, 12.3, 0] });                       // golf ball on top
  m.add(G.lathe([[0.12, 0], [0.16, 0.5], [0.5, 0.85], [0.5, 0.9]], 10), M.paint(0xff8a3d, { glow: 0.4 }), { p: [0, 10.5, 0] });
  place(sign, -hw * 0.45, -hh - 9);

  // A windmill the size of a house on the far end, facing the course.
  const mill = new THREE.Group();
  m = modeller(mill, 1);
  const hex = [0, Math.PI / 6, 0];
  m.add(G.lathe([[3.0, 0], [3.1, 0.3], [1.9, 6.0], [2.0, 6.2]], 6), M.paint(0xff6fb1, { gloss: 0.6, glow: 0.25 }), { p: [0, 0, 0], r: hex });
  m.add(G.cyl(2.4, 2.4, 0.3, 6), white, { p: [0, 6.35, 0], r: hex });
  m.add(G.cone(2.3, 2.4, 6), M.paint(0x2c3266, { gloss: 0.5, glow: 0.15 }), { p: [0, 7.7, 0], r: hex });
  m.add(G.rbox(1.3, 2.0, 0.3, 0.2), BLACK(), { p: [0, 1.0, 2.5], r: [-0.19, 0, 0] });
  m.add(G.box(0.7, 0.9, 0.2), M.glow(0xfff3a0), { p: [0, 4.2, 1.95], r: [-0.19, 0, 0], shadow: false });
  m.add(G.cyl(0.2, 0.2, 1.4, 8), CHROME(), { p: [0, 6.3, 2.2], r: [HALF_PI, 0, 0] });
  const sails = m.group({ p: [0, 6.3, 2.9], r: [0, 0, 0.5] });
  for (let i = 0; i < 4; i++) {
    const blade = sails.group({ r: [0, 0, i * HALF_PI] });
    blade.add(G.box(0.2, 4.2, 0.14), white, { p: [0, 2.1, 0] });
    blade.add(G.box(1.1, 3.0, 0.06), M.paint(0xfff6e0, { gloss: 0.3, glow: 0.25 }), { p: [0.6, 2.6, 0] });
    blade.add(G.box(0.1, 3.0, 0.1), pink, { p: [1.18, 2.6, 0], shadow: false });
  }
  place(mill, -hw - 10, -hh * 0.25, HALF_PI);

  // Giant balls on tees in the corners.
  for (const [x, z, k, col] of [[-hw - 8.5, hh * 0.95, 1, 0xff8a3d], [-hw - 9, -hh - 9.5, 1.35, 0x3fe0ff], [hw + 1.5, -hh - 9, 0.9, 0xf5ee4a]]) {
    const tee = new THREE.Group();
    m = modeller(tee, k);
    m.add(G.lathe([[0.35, 0], [0.45, 2.2], [1.1, 3.0], [1.15, 3.15], [0.9, 3.1], [0, 2.9]], 14), M.paint(col, { gloss: 0.7, glow: 0.4 }), { p: [0, 0, 0] });
    m.add(G.sphere(1.7, 20, 16), white, { p: [0, 4.6, 0] });
    place(tee, x, z);
  }

  // The skyline the kaiju came from, with a moon over it.
  const city = new THREE.Group();
  m = modeller(city, 1);
  const tower = M.matte(0x161b40);
  const lit = [M.glow(0xfff3a0), M.glow(0x3fe0ff), M.glow(0xff4fd8)];
  [[-15, 9, 3], [-11, 12.5, 2.6], [-7.5, 7.5, 3.2], [-3.5, 11, 2.8], [0.5, 8.5, 3.4], [4.5, 13, 2.6], [8, 9.5, 3], [11.5, 6.5, 3.2], [15, 11, 2.8]].forEach(([x, h, w], i) => {
    m.add(G.box(w, h, w), tower, { p: [x, h / 2, (i % 3) * 0.8] });
    for (let y = 2.2 + (i % 2) * 0.6; y < h - 0.6; y += 1.5) {
      m.add(G.box(w * (0.35 + ((i + y * 2) % 3) * 0.2), 0.3, 0.1), lit[(i + Math.round(y)) % 3], { p: [x - w * 0.1 * ((i % 3) - 1), y, (i % 3) * 0.8 + w / 2 + 0.03], shadow: false });
    }
  });
  m.add(G.sphere(2.6, 20, 16), M.glow(0xf2f0d8), { p: [-9, 19, -4], shadow: false });
  place(city, -hw * 0.1, -hh - 22);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0xa855f7, accent: ctx.accent ?? 0xffe14d });
  },

  /** Themed shot models; false for names this kit doesn't know. */
  buildProjectile(name, m, ctx) {
    const build = PROJECTILES[name];
    if (!build) return false;
    build(m, ctx);
    return true;
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
