// HAUNTED BOWLING ALLEY
//
// After closing time the lanes go dark, the blacklights stay on, and the pins
// come back as ghosts. They march down the boards toward the ball return; the
// alley's own fixtures - jukebox, nacho pump, disco ball, claw machine - are
// what you defend it with.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'bowling',
  name: 'Haunted Bowling Alley',
  shortName: 'Bowling',
  icon: 'pin',
  sortOrder: 60,
  description: 'Defend the ball return. Cosmic-bowling fixtures versus an alley full of ghost pins.',
  color: '#b388ff',
  groundColor: 0xc58a4a,
  pathColor: 0x7a5cc4,
  envColor: 0x0d0718,
  environmentSkin: { arena: 'alley', floor: 'lane', markerIcon: '🎳' },
  enemySkin: { body: 'pin', icon: 'ghost' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Ball Return', icon: 'bowlball', clr: '#2dd4bf' },
    t2: { nm: 'Disco Ball Laser', icon: 'disco', clr: '#b388ff' },
    t3: { nm: 'Jukebox', icon: 'jukebox', clr: '#ff4fa3' },
    t4: { nm: 'Nacho-Cheese Cannon', icon: 'cheese', clr: '#ffa51f' },
    t5: { nm: 'Claw Machine', icon: 'claw', clr: '#3b82f6' },
    t6: { nm: 'Neon Strike Sign', icon: 'bolt', clr: '#a3ff3d' },
    t7: { nm: 'Pizza Oven', icon: 'flame', clr: '#ff4d2e' },
    t8: { nm: 'Perfect-Game Trophy', icon: 'trophy', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Ghost Pin' },
    e2: { nm: 'Burning Pin' },
    e3: { nm: 'Lane Phantom' },
    e4: { nm: 'Possessed Ball' },
    e5: { nm: 'Cracked Pin' },
    e6: { nm: 'Flaming Skull' },
    e7: { nm: 'King Pin' }
  },
  maps: [
    ['Lane One', 'A straight roll to the ball return - learn the basics'],
    ['Open Frame', 'Open centre, two ways in'],
    ['Gutter Run', 'Tight lanes between the gutters'],
    ['League Night', 'Long lane, heavy traffic'],
    ['Cosmic Bowl', 'They come from everywhere'],
    ['Seven-Ten Split', 'Narrow and fast'],
    ['Snack Bar', 'Wide open and hot'],
    ['Arcade Corner', 'Mixed pressure, little room'],
    ['Pin Deck', 'The full rack'],
    ['Perfect Game', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x0d0718,
    fog: 0x160c2a,
    fogDensity: 0.006,
    floor: {
      base: '#b0783f',
      meshColor: 0x988c86,
      roughness: 0.3,
      metalness: 0.06,
      emissive: 0x2a1250,
      emissiveIntensity: 0.16
    },
    rail: { color: 0x2a1c4a, roughness: 0.4, metalness: 0.3 },
    path: { color: 0x7ef0e0, emissive: 0x1a6f78, opacity: 0.3, edge: 0x2dd4bf },
    buildZone: { color: 0xd9c8ff, opacity: 0.1, line: 0xb388ff },
    obstacle: { accent: 0xb388ff },
    base: { color: 0x2dd4bf, icon: 'DEFEND BALL RETURN' },
    spawn: { color: 0x7dff6a, icon: 'GHOST PINS' }
  },
  lighting: {
    hemiSky: 0xe6dcff,
    hemiGround: 0x2a1a4a,
    hemiIntensity: 0.38,
    sun: 0xfff0dc,
    sunIntensity: 0.85,
    rim: 0x2dd4bf,
    rimIntensity: 0.32,
    accent: 0xb388ff,
    spotIntensity: 2.6,
    exposure: 0.7
  },
  ui: { accent: '#b388ff', dark: '#0d0718' },
  crowd: { fans: [0xb388ff, 0x2dd4bf, 0xff4fa3, 0xf4f1ff, 0x7dff6a], seat: 0x1c1236 },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    ball: { mesh: 'ball', flight: 'slide', trail: 'dust', impact: 'spark', color: 0x2dd4bf, speed: 9.5, size: 0.9 },
    curveBall: { mesh: 'laser', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xc9a6ff, speed: 13 },
    headButt: { mesh: 'ring', flight: 'ring', trail: 'shock', impact: 'ring', color: 0xff4fa3, speed: 8.5 },
    tackle: { mesh: 'orb', flight: 'lob', trail: 'frost', impact: 'freeze', color: 0xffb62e, speed: 9.5 },
    glove: { mesh: 'star', flight: 'punch', trail: 'gold', impact: 'slam', color: 0x6ea8ff, speed: 8.8, size: 1.1 },
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xa3ff3d, speed: 15 },
    flare: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff5a14, speed: 11, size: 0.85 },
    legend: { mesh: 'ball', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0xeafff0, accent: 0xff2d55 },
    fire: { body: 'bug', color: 0xff6a24, accent: 0xffd23d },
    flying: { body: 'bug', color: 0x8eeaff, accent: 0x2dd4bf },
    armored: { body: 'bug', color: 0x24348f, accent: 0x7dff6a },
    elite: { body: 'bug', color: 0x5a2390, accent: 0xff3df0 },
    flying_fire: { body: 'bug', color: 0xffe39a, accent: 0x3a1030 },
    boss: { body: 'bug', color: 0xf6f1e6, accent: 0xffd700 }
  },
  towers: { family: 'bowling', base: 0x1c1236, metal: 0xd7dde5, levelGlow: 0xb388ff }
};

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);

/** A bowling ball with its three finger holes, facing up and forward. */
function bowlingBall(m, r, mat, holeMat, p = [0, 0, 0]) {
  m.add(G.sphere(r, 16, 12), mat, { p });
  for (const [x, y, z] of [[-0.24, 0.6, 0.76], [0.24, 0.6, 0.76], [0, 0.26, 0.96]]) {
    m.add(G.sphere(r * 0.16, 8, 6), holeMat, { p: [p[0] + x * r * 0.95, p[1] + y * r * 0.95, p[2] + z * r * 0.95] });
  }
}

function ballReturn(m, c) {
  // The hooded ball return: balls roll out of the mouth and along the rails.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.06 });
  const chrome = CHROME(), black = BLACK();
  m.add(G.rbox(0.44, 0.09, 0.6, 0.03), black, { p: [0, 0.165, 0] });                    // plinth
  m.add(G.rbox(0.4, 0.018, 0.56, 0.008), M.glow(c.color), { p: [0, 0.215, 0] });        // glow seam
  m.add(G.rbox(0.4, 0.36, 0.3, 0.13), body, { p: [0, 0.39, -0.14] });                   // hood
  m.add(G.cyl(0.115, 0.115, 0.02, 20), black, { p: [0, 0.38, 0.012], r: [Math.PI / 2, 0, 0] });   // mouth
  m.add(G.torus(0.12, 0.018, 8, 22), chrome, { p: [0, 0.38, 0.016] });
  for (const x of [-0.075, 0.075]) {
    m.add(G.tube([[x, 0.285, 0.0], [x, 0.265, 0.16], [x, 0.3, 0.27], [x, 0.38, 0.31]], 0.016, 6), chrome);   // rails
    m.add(G.cyl(0.014, 0.014, 0.07, 6), chrome, { p: [x, 0.235, 0.2] });
  }
  bowlingBall(m, 0.088, M.paint(0xff4fa3, { gloss: 0.95, glow: 0.12 }), black, [0, 0.365, 0.1]);
  // The ball about to be launched hops at the end of the rails.
  const shot = m.group({ p: [0, 0.4, 0.245] });
  bowlingBall(shot, 0.088, M.paint(0xb388ff, { gloss: 0.95, glow: 0.2 }), black);
  m.anim(shot.object, 'bob');
  // Rack ring on top with a spare ball turning in it.
  m.add(G.torus(0.1, 0.016, 6, 20), chrome, { p: [0, 0.585, -0.14], r: [Math.PI / 2, 0, 0] });
  const spare = m.group({ p: [0, 0.665, -0.14] });
  bowlingBall(spare, 0.1, M.paint(0xf4f1ff, { gloss: 0.95, glow: 0.1 }), black);
  m.anim(spare.object, 'spin', { speed: 1.4 });
  // Hand-dryer vent slats on the hood front.
  for (let i = 0; i < 3; i++) m.add(G.box(0.05, 0.008, 0.01), black, { p: [0.14, 0.5 - i * 0.022, 0.012] });
}

function discoLaser(m, c) {
  // Mirror ball in a yoke on a stand, with the laser head slung underneath.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.1 });
  const chrome = CHROME();
  m.add(G.lathe([[0.2, 0], [0.22, 0.03], [0.15, 0.07], [0.06, 0.1], [0.04, 0.15], [0.04, 0.3], [0.06, 0.34], [0, 0.36]]), body, { p: [0, 0.12, 0] });
  m.add(G.torus(0.21, 0.022, 8, 22, Math.PI), body, { p: [0, 0.67, 0], r: [0, 0, Math.PI] });       // yoke
  for (const s of [-1, 1]) m.add(G.cyl(0.012, 0.012, 0.07, 6), chrome, { p: [s * 0.185, 0.67, 0], r: [0, 0, Math.PI / 2] });
  const mirror = M.paint(0xe6ddff, { gloss: 1, glow: 0.14 });
  mirror.flatShading = true;
  mirror.metalness = 0.55;
  const ball = m.group({ p: [0, 0.67, 0] });
  ball.add(G.sphere(0.168, 11, 8), mirror);
  // Coloured glints on the facets and thin light rays that sweep round with it.
  const spots = [0xff4fa3, 0x2dd4bf, 0xffffff, 0xa3ff3d, 0xb388ff, 0xffc928];
  spots.forEach((col, i) => {
    const a = (i / spots.length) * Math.PI * 2, y = (i % 3 - 1) * 0.08, r = Math.sqrt(0.17 * 0.17 - y * y);
    ball.add(G.sphere(0.024, 6, 5), M.glow(col), { p: [Math.cos(a) * r, y, Math.sin(a) * r], shadow: false });
  });
  [0xff4fa3, 0x2dd4bf, 0xc9a6ff].forEach((col, i) => {
    ball.add(G.cyl(0.007, 0.007, 0.6, 5), M.energy(col, 0.7), { r: [0, (i / 3) * Math.PI, Math.PI / 2 + (i - 1) * 0.35], shadow: false });
  });
  m.anim(ball.object, 'spin', { speed: 1.2 });
  // Laser head: housing, barrel, and a lens that throbs.
  m.add(G.rbox(0.1, 0.08, 0.14, 0.02), BLACK(), { p: [0, 0.4, 0.04] });
  m.add(G.cyl(0.028, 0.034, 0.2, 12), chrome, { p: [0, 0.4, 0.19], r: [Math.PI / 2, 0, 0] });
  m.add(G.torus(0.034, 0.01, 6, 14), body, { p: [0, 0.4, 0.29] });
  const lens = m.group({ p: [0, 0.4, 0.295] });
  lens.add(G.sphere(0.03, 10, 8), M.glow(0xf1e6ff), { shadow: false });
  lens.add(G.sphere(0.055, 10, 8), M.energy(c.color, 0.55), { shadow: false });
  m.anim(lens.object, 'pulse');
}

function jukebox(m, c) {
  // The classic arched cabinet: neon tubes round the front, a record turning
  // in the window, and a speaker grille that pushes out the sound ring.
  const body = M.paint(c.color, { gloss: 0.9, glow: 0.06 });
  const chrome = CHROME(), black = BLACK();
  const arch = [[-0.23, 0], [0.23, 0]];
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; arch.push([Math.cos(a) * 0.23, 0.49 + Math.sin(a) * 0.23]); }
  m.add(G.plate(arch, 0.26), body, { p: [0, 0.16, 0] });
  m.add(G.rbox(0.52, 0.05, 0.32, 0.02), black, { p: [0, 0.145, 0] });
  // Neon: an outer amber arch that runs down both sides, an inner teal arch.
  const tubes = m.group({ p: [0, 0.65, 0.135] });
  const amber = M.glow(0xffd23d), teal = M.glow(0x2dd4bf);
  tubes.add(G.torus(0.195, 0.022, 8, 20, Math.PI), amber);
  for (const s of [-1, 1]) tubes.add(G.capsule(0.022, 0.42, 8), amber, { p: [s * 0.195, -0.42, 0] });
  tubes.add(G.torus(0.145, 0.016, 8, 18, Math.PI), teal);
  m.anim(tubes.object, 'pulse');
  // Record window.
  m.add(G.cyl(0.125, 0.125, 0.012, 22), black, { p: [0, 0.65, 0.132], r: [Math.PI / 2, 0, 0] });
  const deck = m.group({ p: [0, 0.65, 0.142], r: [Math.PI / 2, 0, 0] });
  const record = deck.group();
  record.add(G.cyl(0.105, 0.105, 0.008, 22), M.paint(0x0c0c10, { gloss: 0.95 }));
  record.add(G.cyl(0.04, 0.04, 0.012, 14), M.paint(0xffd23d, { gloss: 0.6, glow: 0.3 }));
  record.add(G.box(0.05, 0.012, 0.014), M.glow(0xffffff), { p: [0.07, 0, 0] });      // glint, so the spin shows
  m.anim(record.object, 'spin', { speed: 3 });
  // Selector strip and speaker grille.
  m.add(G.rbox(0.3, 0.04, 0.014, 0.006), M.glow(0xfff3d6), { p: [0, 0.485, 0.134] });
  m.add(G.rbox(0.3, 0.22, 0.014, 0.01), M.paint(0x2a1030, { gloss: 0.3 }), { p: [0, 0.33, 0.132] });
  for (let i = 0; i < 5; i++) m.add(G.box(0.014, 0.2, 0.012), chrome, { p: [-0.11 + i * 0.055, 0.33, 0.142] });
  const wave = m.group({ p: [0, 0.33, 0.16] });
  wave.add(G.torus(0.075, 0.012, 6, 20), M.energy(0xffffff, 0.75), { shadow: false });
  m.anim(wave.object, 'pulse', { offset: 1.2 });
  m.add(G.sphere(0.03, 10, 8), chrome, { p: [0, 0.885, 0] });                        // crown finial
}

function nachoCannon(m, c) {
  // A heated cheese pot with a pump mast and a dripping barrel.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.06 });
  const chrome = CHROME();
  const cheese = M.paint(0xffc21a, { gloss: 0.85, glow: 0.4 });
  const chip = M.paint(0xe6ab45, { gloss: 0.15 });
  m.add(G.lathe([[0.19, 0], [0.24, 0.03], [0.255, 0.22], [0.23, 0.28], [0.2, 0.28], [0.2, 0.24], [0, 0.24]]), body, { p: [0, 0.12, -0.03] });
  m.add(G.torus(0.215, 0.02, 6, 24), chrome, { p: [0, 0.4, -0.03], r: [Math.PI / 2, 0, 0] });      // rim
  m.add(G.cyl(0.258, 0.258, 0.03, 24), M.paint(0xd92b2b, { gloss: 0.6 }), { p: [0, 0.27, -0.03] });   // stripe
  m.add(G.sphere(0.2, 16, 10), cheese, { p: [0, 0.38, -0.03], s: [1, 0.3, 1] });                   // molten top
  // Tortilla chips standing in the cheese round the back.
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.62 + i * 0.44), x = Math.cos(a) * 0.15, z = -0.03 + Math.sin(a) * 0.15;
    m.add(G.plate([[-0.07, 0], [0.07, 0], [0, 0.17]], 0.014), chip, { p: [x, 0.4, z], r: [0, -a + Math.PI / 2, 0] });
  }
  // Pump mast and barrel.
  m.add(G.cyl(0.035, 0.04, 0.4, 10), chrome, { p: [0, 0.6, -0.03] });
  m.add(G.sphere(0.045, 10, 8), BLACK(), { p: [0, 0.84, -0.03] });
  m.add(G.cyl(0.075, 0.05, 0.36, 14), body, { p: [0, 0.7, 0.1], r: [Math.PI / 2 - 0.22, 0, 0] });
  m.add(G.torus(0.075, 0.016, 6, 16), chrome, { p: [0, 0.739, 0.275], r: [-0.22, 0, 0] });
  const blob = m.group({ p: [0, 0.735, 0.285] });
  blob.add(G.sphere(0.062, 12, 8), cheese);
  m.anim(blob.object, 'pulse');
  const drips = m.group({ p: [0, 0.66, 0.28] });
  drips.add(G.capsule(0.022, 0.13, 8), cheese, { p: [-0.02, -0.07, 0] });
  drips.add(G.capsule(0.018, 0.08, 8), cheese, { p: [0.03, -0.03, 0.01] });
  m.anim(drips.object, 'bob');
  // Spills: a run down the pot and a puddle under the muzzle.
  m.add(G.capsule(0.03, 0.16, 8), cheese, { p: [0.09, 0.26, 0.2] });
  m.add(G.sphere(0.09, 12, 8), cheese, { p: [0.04, 0.13, 0.27], s: [1, 0.2, 0.8] });
}

function clawMachine(m, c) {
  // Arcade crane: coloured cabinet, glass box of prizes, the claw bobbing inside.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.06 });
  const chrome = CHROME(), black = BLACK();
  m.add(G.rbox(0.46, 0.3, 0.42, 0.03), body, { p: [0, 0.27, 0] });
  m.add(G.box(0.41, 0.34, 0.37), M.glass(0xcfeaff, 0.22), { p: [0, 0.59, 0], shadow: false });
  for (const x of [-0.212, 0.212]) for (const z of [-0.192, 0.192]) m.add(G.box(0.036, 0.34, 0.036), body, { p: [x, 0.59, z] });
  m.add(G.rbox(0.46, 0.1, 0.42, 0.03), body, { p: [0, 0.81, 0] });
  m.add(G.rbox(0.34, 0.06, 0.012, 0.006), M.glow(0xffe45c), { p: [0, 0.81, 0.212] });               // marquee
  m.add(G.sphere(0.035, 10, 8), M.glow(0xff4fa3), { p: [0, 0.875, 0], shadow: false });             // beacon
  // Prizes heaped in the bottom of the glass.
  const prizes = [0xff4fa3, 0xffd23d, 0x7dff6a, 0xf4f1ff, 0xb388ff, 0xff7a2f];
  prizes.forEach((col, i) => {
    m.add(G.sphere(0.062, 10, 8), M.paint(col, { gloss: 0.6, glow: 0.25 }), { p: [-0.12 + (i % 3) * 0.12, 0.47 + (i > 2 ? 0.015 : 0), -0.07 + Math.floor(i / 3) * 0.14] });
  });
  // Gantry and claw.
  m.add(G.box(0.4, 0.02, 0.03), chrome, { p: [0, 0.745, 0.03] });
  const claw = m.group({ p: [0, 0.66, 0.03] });
  claw.add(G.cyl(0.007, 0.007, 0.16, 5), chrome, { p: [0, 0.05, 0] });
  claw.add(G.sphere(0.032, 10, 8), chrome, { p: [0, -0.03, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6, x = Math.cos(a), z = Math.sin(a);
    claw.add(G.tube([[x * 0.02, -0.04, z * 0.02], [x * 0.085, -0.08, z * 0.085], [x * 0.07, -0.15, z * 0.07], [x * 0.03, -0.17, z * 0.03]], 0.011, 5), chrome);
  }
  m.anim(claw.object, 'bob');
  // Control shelf: joystick, button, coin slot and prize chute.
  m.add(G.rbox(0.4, 0.03, 0.09, 0.012), black, { p: [0, 0.405, 0.235] });
  m.add(G.cyl(0.01, 0.01, 0.07, 6), chrome, { p: [-0.1, 0.45, 0.24] });
  m.add(G.sphere(0.028, 10, 8), M.paint(0xd92b2b, { gloss: 0.9, glow: 0.2 }), { p: [-0.1, 0.49, 0.24] });
  m.add(G.cyl(0.025, 0.025, 0.02, 12), M.glow(0x7dff6a), { p: [0.08, 0.425, 0.24] });
  m.add(G.rbox(0.16, 0.1, 0.012, 0.006), black, { p: [0.1, 0.22, 0.212] });
  m.add(G.box(0.012, 0.05, 0.008), M.glow(0xffe45c), { p: [-0.13, 0.26, 0.214] });
}

function neonSign(m, c) {
  // A round neon "strike" sign on its transformer: the bolt flickers and the
  // insulators arc up into the ring.
  const neon = M.glow(c.color);
  const dark = M.matte(0x1b1430);
  const ceramic = M.paint(0xf1ece2, { gloss: 0.8 });
  m.add(G.rbox(0.4, 0.15, 0.3, 0.03), dark, { p: [0, 0.195, 0] });
  m.add(G.rbox(0.41, 0.03, 0.31, 0.01), M.paint(c.color, { gloss: 0.7, glow: 0.4 }), { p: [0, 0.2, 0] });
  for (const s of [-1, 1]) {
    m.add(G.lathe([[0.045, 0], [0.06, 0.02], [0.04, 0.04], [0.06, 0.06], [0.04, 0.08], [0.06, 0.1], [0.03, 0.12], [0, 0.13]], 12), ceramic, { p: [s * 0.13, 0.27, 0] });
    m.add(G.tube([[s * 0.13, 0.4, 0], [s * 0.17, 0.44, 0.01], [s * 0.15, 0.47, -0.01], [s * 0.19, 0.51, 0]], 0.009, 5), M.energy(0xffffff, 0.9), { shadow: false });
  }
  m.add(G.cyl(0.03, 0.03, 0.14, 8), CHROME(), { p: [0, 0.33, -0.03] });                              // mast
  m.add(G.cyl(0.215, 0.215, 0.03, 28), dark, { p: [0, 0.63, -0.025], r: [Math.PI / 2, 0, 0] });      // sign board
  m.add(G.torus(0.225, 0.024, 8, 30), neon, { p: [0, 0.63, 0] });
  m.add(G.torus(0.18, 0.01, 6, 28), M.glow(0xff4fa3), { p: [0, 0.63, 0.0] });
  const bolt = [[0.04, 0.17], [-0.1, -0.03], [-0.015, -0.03], [-0.06, -0.17], [0.1, 0.035], [0.015, 0.035], [0.08, 0.17]];
  m.add(G.plate(bolt, 0.02), M.paint(c.color, { gloss: 0.5, glow: 0.55 }), { p: [0, 0.63, 0.0] });
  const flash = m.add(G.plate(bolt, 0.02), M.glow(0xfbffd6, 0.98), { p: [0, 0.63, 0.016], shadow: false });
  m.anim(flash, 'blink');
  for (const s of [-1, 1]) {
    const tip = m.group({ p: [s * 0.2, 0.52, 0] });
    tip.add(G.sphere(0.035, 8, 6), M.energy(c.color, 0.9), { shadow: false });
    m.anim(tip.object, 'pulse', { offset: s > 0 ? 1.5 : 0 });
  }
}

function pizzaOven(m, c) {
  // Brick dome oven: fire in the mouth, a pie on the way in, chimney at the back.
  const brick = M.paint(c.color, { gloss: 0.35, glow: 0.04 });
  const stone = M.paint(0xe9dcc3, { gloss: 0.25 });
  const iron = M.matte(0x1c1a1f);
  m.add(G.lathe([[0.27, 0], [0.295, 0.03], [0.295, 0.11], [0.27, 0.14], [0, 0.14]]), stone, { p: [0, 0.12, 0] });
  m.add(G.dome(0.275), brick, { p: [0, 0.26, -0.01], s: [1, 0.98, 1] });
  for (const [y, r] of [[0.33, 0.268], [0.42, 0.228], [0.49, 0.155]]) m.add(G.torus(r, 0.009, 4, 24), iron, { p: [0, y, -0.01], r: [Math.PI / 2, 0, 0] });   // mortar courses
  // Mouth: stone arch, glowing interior, flames.
  const mouth = [[-0.12, 0], [0.12, 0]];
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; mouth.push([Math.cos(a) * 0.12, 0.05 + Math.sin(a) * 0.12]); }
  m.add(G.plate(mouth, 0.06), iron, { p: [0, 0.26, 0.235] });
  m.add(G.plate(mouth, 0.02), M.glow(0xff7a1a), { p: [0, 0.262, 0.262], s: [0.86, 0.86, 1] });
  m.add(G.torus(0.13, 0.03, 6, 14, Math.PI), stone, { p: [0, 0.31, 0.255] });
  for (const s of [-1, 1]) m.add(G.box(0.055, 0.06, 0.06), stone, { p: [s * 0.13, 0.285, 0.255] });
  const fire = m.group({ p: [0, 0.27, 0.275] });
  [[0, 0.15, 0.045], [-0.055, 0.1, 0.035], [0.055, 0.11, 0.035]].forEach(([x, h, r]) => {
    fire.add(G.cone(r, h, 7), M.energy(0xffd23d, 0.9), { p: [x, h / 2, 0], shadow: false });
  });
  m.anim(fire.object, 'flame');
  // Pizza half-way in.
  m.add(G.cyl(0.085, 0.085, 0.014, 16), M.paint(0xd9973f, { gloss: 0.2 }), { p: [0, 0.27, 0.3] });
  m.add(G.cyl(0.07, 0.07, 0.016, 16), M.paint(0xffd76a, { gloss: 0.6, glow: 0.2 }), { p: [0, 0.272, 0.3] });
  for (const [x, z] of [[-0.03, 0.02], [0.035, 0.0], [0, -0.035]]) m.add(G.cyl(0.016, 0.016, 0.02, 8), M.paint(0xb3202a), { p: [x, 0.274, 0.3 + z] });
  // Chimney with a cowl and smoke.
  m.add(G.cyl(0.05, 0.065, 0.36, 12), iron, { p: [0, 0.62, -0.13] });
  m.add(G.lathe([[0.1, 0], [0.085, 0.02], [0, 0.07]], 12), iron, { p: [0, 0.815, -0.13] });
  for (const s of [-1, 1]) m.add(G.cyl(0.006, 0.006, 0.04, 4), iron, { p: [s * 0.04, 0.805, -0.13] });
  for (let i = 0; i < 2; i++) {
    const puff = m.group({ p: [0.02 * i, 0.8 + i * 0.07, -0.13 + (i ? 0 : 0.09)] });
    puff.add(G.sphere(0.035 + i * 0.012, 8, 6), M.energy(0xffb07a, 0.4 - i * 0.12), { shadow: false });
    m.anim(puff.object, 'pulse', { offset: i * 1.4 });
  }
  m.add(G.cyl(0.03, 0.03, 0.012, 12), M.glow(0xfff8e6), { p: [0.17, 0.4, 0.19], r: [Math.PI / 2 - 0.5, 0.6, 0] });   // thermometer
}

function trophy(m, c) {
  // The perfect-game cup: wooden plinth, two-handled gold cup, a golden ball
  // turning in the bowl.
  const gold = M.metal(0xffc83a, { rough: 0.26 });
  gold.emissive = new THREE.Color(0x6b4300);
  gold.emissiveIntensity = 0.55;
  const wood = M.paint(0x3a2416, { gloss: 0.5 });
  m.add(G.rbox(0.36, 0.1, 0.36, 0.02), wood, { p: [0, 0.17, 0] });
  m.add(G.rbox(0.28, 0.06, 0.28, 0.015), wood, { p: [0, 0.25, 0] });
  m.add(G.rbox(0.2, 0.05, 0.01, 0.004), M.glow(0xffe9a0), { p: [0, 0.17, 0.182] });                  // plaque
  m.add(G.lathe([
    [0.12, 0], [0.13, 0.02], [0.07, 0.05], [0.035, 0.09], [0.035, 0.15], [0.065, 0.17], [0.05, 0.19],
    [0.1, 0.21], [0.17, 0.28], [0.2, 0.36], [0.215, 0.44], [0.2, 0.44], [0.18, 0.36], [0.1, 0.26], [0, 0.24]
  ], 28), gold, { p: [0, 0.28, 0] });
  m.add(G.cyl(0.212, 0.207, 0.035, 28), M.paint(c.color, { gloss: 0.9, glow: 0.45 }), { p: [0, 0.675, 0] });   // rim band
  for (const s of [-1, 1]) m.add(G.torus(0.085, 0.018, 8, 16, Math.PI), gold, { p: [s * 0.195, 0.6, 0], r: [0, 0, -s * Math.PI / 2] });
  m.add(G.star(0.07, 0.03, 0.02), M.glow(0xfffbe0), { p: [0, 0.6, 0.2] });
  const ball = m.group({ p: [0, 0.77, 0] });
  bowlingBall(ball, 0.125, M.paint(c.color, { gloss: 0.95, glow: 0.4 }), M.matte(0x3a2400));
  m.anim(ball.object, 'spin', { speed: 1.1 });
  for (const [x, y, z, o] of [[-0.2, 0.8, 0.1, 0], [0.22, 0.74, -0.05, 1.6], [0.05, 0.5, 0.24, 3]]) {
    const glint = m.group({ p: [x, y, z] });
    glint.add(G.star(0.035, 0.012, 0.008, 4), M.energy(0xffffff, 0.9), { shadow: false });
    m.anim(glint.object, 'pulse', { offset: o });
  }
}

const TOWERS = [ballReturn, discoLaser, jukebox, nachoCannon, clawMachine, neonSign, pizzaOven, trophy];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, and faces +Z. A pin stands from y = -0.95 to about 0.95.

// A tenpin, turned: [radius, height] for a pin 1.9 tall.
const PIN = [
  [0.27, 0], [0.33, 0.04], [0.43, 0.3], [0.5, 0.58], [0.48, 0.82], [0.38, 1.05], [0.26, 1.22],
  [0.2, 1.34], [0.2, 1.42], [0.25, 1.54], [0.29, 1.66], [0.27, 1.78], [0.18, 1.87], [0, 1.9]
];

function pinGeo(fat = 1, h = 1.9, seg = 20) {
  return G.lathe(PIN.map(([r, y]) => [r * fat, y * h / 1.9]), seg);
}

/** A pin standing on y = -0.95 with the two neck stripes. */
function pinBody(m, mat, stripeMat, { fat = 1, h = 1.9 } = {}) {
  m.add(pinGeo(fat, h), mat, { p: [0, -0.95, 0] });
  const k = h / 1.9;
  for (const y of [1.3, 1.43]) m.add(G.torus(0.2 * fat, 0.04 * fat, 6, 18), stripeMat, { p: [0, -0.95 + y * k, 0], r: [Math.PI / 2, 0, 0] });
}

/** Hollow ghost eyes with lit pupils and an "ooo" mouth, on a surface at depth z. */
function face(m, { y = -0.15, z = 0.46, s = 1, pupil = 0x7dff6a, mouth = true, angry = false } = {}) {
  const hole = M.glow(0x07040d);
  for (const side of [-1, 1]) {
    m.add(G.sphere(0.13 * s, 10, 8), hole, { p: [side * 0.18 * s, y, z - 0.03 * s], s: [0.85, 1.15, 0.6], shadow: false });
    m.add(G.sphere(0.05 * s, 8, 6), M.glow(pupil), { p: [side * 0.17 * s, y - 0.01 * s, z + 0.045 * s], shadow: false });
    if (angry) m.add(G.box(0.26 * s, 0.06 * s, 0.05 * s), hole, { p: [side * 0.19 * s, y + 0.16 * s, z + 0.02 * s], r: [0, 0, -side * 0.5], shadow: false });
  }
  if (mouth) m.add(G.sphere(0.1 * s, 10, 8), hole, { p: [0, y - 0.27 * s, z + 0.0 * s], s: [0.9, 1.2, 0.5], shadow: false });
}

function flamesOn(m, enemy, list, color = 0xff8a1f) {
  enemy.flames = enemy.flames || [];
  for (const [x, y, z, h, r] of list) {
    const geo = G.cone(r, h, 7);
    geo.translate(0, h / 2, 0);
    enemy.flames.push(m.add(geo, M.energy(color, 0.9), { p: [x, y, z], shadow: false }));
  }
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, outline, { y = 0.2, z = -0.1, x = 0.25 } = {}) {
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate(outline, 0.03);
    geo.rotateX(-Math.PI / 2);
    if (s < 0) geo.scale(-1, 1, 1);
    return m.add(geo, mat, { p: [s * x, y, z], shadow: false });
  });
}

// Scalloped bat wing, seen from above (x out, y forward).
const BAT_WING = [[0, 0.3], [0.7, 0.5], [1.3, 0.35], [1.1, 0.05], [0.95, -0.25], [0.7, -0.05], [0.5, -0.35], [0.3, -0.1], [0, -0.25]];
// Tattered sheet sleeve.
const SHEET_WING = [[0, 0.3], [0.8, 0.35], [1.25, 0.1], [1.05, -0.1], [1.1, -0.35], [0.8, -0.2], [0.65, -0.45], [0.4, -0.22], [0, -0.3]];

function ghostPin(m, enemy, c) {
  const body = M.paint(c.color, { gloss: 0.8, glow: 0.32 });
  pinBody(m, body, M.paint(c.accent, { gloss: 0.8, glow: 0.4 }));
  face(m, { y: -0.2, z: 0.47 });
  // Stubby raised arms ("boo!") and a pool of ghost-light at the foot.
  for (const s of [-1, 1]) m.add(G.capsule(0.09, 0.4, 8), body, { p: [s * 0.46, -0.3, 0.1], r: [0.3, 0, -s * 0.9] });
  m.add(G.sphere(0.62, 14, 8), M.energy(0x7dff6a, 0.3), { p: [0, -0.92, 0], s: [1, 0.12, 1], shadow: false });
}

function burningPin(m, enemy, c) {
  const body = M.paint(c.color, { gloss: 0.6, glow: 0.55 });
  const char = M.matte(0x2a0f08);
  pinBody(m, body, char);
  m.add(G.sphere(0.3, 12, 8), char, { p: [0, 0.76, 0], s: [1, 0.75, 1] });           // scorched crown
  m.add(G.torus(0.33, 0.06, 6, 18), char, { p: [0, -0.9, 0], r: [Math.PI / 2, 0, 0] });
  face(m, { y: -0.2, z: 0.47, pupil: c.accent, angry: true });
  flamesOn(m, enemy, [[0, 0.8, 0, 0.75, 0.24], [-0.2, 0.45, -0.1, 0.5, 0.15], [0.22, 0.4, -0.05, 0.5, 0.15], [0, 0.2, -0.4, 0.6, 0.18]]);
  m.add(G.sphere(0.2, 8, 6), M.glow(c.accent), { p: [0, 0.85, 0], s: [1, 0.6, 1], shadow: false });   // ember
}

function lanePhantom(m, enemy, c) {
  // A sheet ghost with a scalloped hem, wearing a pin's red neck stripes.
  const sheet = M.paint(c.color, { gloss: 0.5, glow: 0.5 });
  m.add(G.lathe([[0.62, 0], [0.6, 0.12], [0.63, 0.4], [0.58, 0.8], [0.52, 1.15], [0.42, 1.45], [0.25, 1.68], [0, 1.76]], 20), sheet, { p: [0, -0.82, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    m.add(G.cone(0.2, 0.4, 6), sheet, { p: [Math.cos(a) * 0.5, -0.9, Math.sin(a) * 0.5], r: [Math.PI, 0, 0] });
  }
  for (const y of [0.42, 0.56]) m.add(G.torus(y > 0.5 ? 0.37 : 0.43, 0.035, 6, 18), M.paint(0xff2d55, { glow: 0.4 }), { p: [0, y, 0], r: [Math.PI / 2, 0, 0] });
  face(m, { y: 0.12, z: 0.53, s: 1.15, pupil: c.accent });
  wings(m, enemy, M.glass(c.accent, 0.6), SHEET_WING, { y: 0.0, x: 0.4, z: 0 });
  m.add(G.cone(0.3, 0.9, 8), M.energy(c.accent, 0.35), { p: [0, -0.6, -0.55], r: [-2.2, 0, 0], shadow: false });   // wispy tail
}

function possessedBall(m, enemy, c) {
  // A bowling ball whose three finger holes have become a face, strapped in
  // riveted iron.
  const shell = M.paint(c.color, { gloss: 0.97, glow: 0.18 });
  const iron = M.metal(0x9aa3b5, { rough: 0.4 });
  const hole = M.glow(0x05030a), lit = M.glow(c.accent);
  m.add(G.sphere(0.84, 22, 16), shell, { p: [0, -0.1, 0] });
  for (const [x, y, z, r] of [[-0.3, 0.2, 0.72, 0.19], [0.3, 0.2, 0.72, 0.19], [0, -0.28, 0.76, 0.22]]) {
    m.add(G.sphere(r, 12, 8), hole, { p: [x, y, z], s: [1, 1, 0.5], shadow: false });
    m.add(G.sphere(r * 0.55, 10, 8), lit, { p: [x, y - (y < 0 ? 0 : 0.02), z + 0.06], s: [1, y < 0 ? 0.6 : 1, 0.6], shadow: false });
  }
  // Armour: a band over the crown and one round the waist, studded.
  m.add(G.torus(0.85, 0.08, 6, 30), iron, { p: [0, -0.1, 0], r: [0, Math.PI / 2, 0] });
  m.add(G.torus(0.85, 0.07, 6, 30, Math.PI), iron, { p: [0, -0.1, 0], r: [Math.PI / 2, 0, 0], s: [1, -1, 1] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 4) * Math.PI;
    m.add(G.cone(0.1, 0.26, 6), iron, { p: [0, -0.1 + Math.sin(a) * 0.98, -Math.cos(a) * 0.98 * 0.98], r: [-(Math.PI / 2 - a), 0, 0] });
  }
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.22, 10, 8), M.matte(0x0d0b14), { p: [s * 0.4, -0.88, 0.25], s: [1, 0.5, 1.5] });    // feet
    m.add(G.torus(0.3, 0.035, 5, 16), M.paint(c.accent, { glow: 0.5 }), { p: [s * 0.6, 0.1, -0.2], r: [0.3, s * 1.1, 0] });   // marbling
  }
}

function crackedPin(m, enemy, c) {
  // A broken pin held together by spite: horns, shoulder spikes, lit cracks.
  const body = M.paint(c.color, { gloss: 0.7, glow: 0.3 });
  const crack = M.glow(c.accent);
  const horn = M.paint(0x1a0f24, { gloss: 0.8 });
  pinBody(m, body, M.metal(0xffcc33, { rough: 0.3 }), { fat: 1.15 });
  face(m, { y: -0.15, z: 0.55, s: 1.1, pupil: c.accent, angry: true, mouth: false });
  // Jagged grin.
  m.add(G.plate([[-0.26, 0.05], [-0.15, -0.04], [-0.07, 0.05], [0, -0.04], [0.07, 0.05], [0.15, -0.04], [0.26, 0.05], [0.15, -0.14], [0, -0.1], [-0.15, -0.14]], 0.06), crack, { p: [0, -0.5, 0.56], shadow: false });
  m.add(G.tube([[0.08, 0.86, 0.2], [-0.06, 0.62, 0.33], [0.1, 0.42, 0.25], [-0.02, 0.22, 0.36], [0.2, 0.05, 0.5]], 0.035, 5), crack, { shadow: false });
  m.add(G.tube([[-0.5, -0.3, 0.3], [-0.38, -0.55, 0.42], [-0.44, -0.75, 0.3]], 0.03, 5), crack, { shadow: false });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.24, 0.72, 0], [s * 0.6, 0.72, 0.05], [s * 0.74, 0.95, 0.12]], 0.09, 6), horn);
    m.add(G.cone(0.09, 0.3, 6), horn, { p: [s * 0.76, 1.1, 0.14], r: [0.15, 0, -s * 0.2] });
    for (let i = 0; i < 2; i++) m.add(G.cone(0.1, 0.34, 5), horn, { p: [s * (0.62 - i * 0.08), -0.3 + i * 0.4, -0.05], r: [0, 0, -s * (1.2 - i * 0.3)] });
  }
  // A chunk missing from the head.
  m.add(G.sphere(0.16, 8, 6), M.glow(0x07040d), { p: [0.2, 0.86, 0.14], shadow: false });
}

function flamingSkull(m, enemy, c) {
  const bone = M.paint(c.color, { gloss: 0.6, glow: 0.4 });
  const hole = M.glow(0x07040d);
  m.add(G.sphere(0.62, 16, 12), bone, { p: [0, 0.1, 0], s: [1, 1.02, 1.08] });           // cranium
  m.add(G.rbox(0.62, 0.36, 0.5, 0.12), bone, { p: [0, -0.48, 0.2] });                    // jaw
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.2, 12, 8), hole, { p: [s * 0.25, 0.1, 0.56], s: [1, 1.1, 0.5], shadow: false });
    m.add(G.sphere(0.09, 8, 6), M.glow(0xff6a1a), { p: [s * 0.25, 0.08, 0.62], shadow: false });
  }
  m.add(G.cone(0.09, 0.18, 4), hole, { p: [0, -0.18, 0.64], shadow: false });            // nose
  m.add(G.box(0.5, 0.035, 0.04), hole, { p: [0, -0.46, 0.45], shadow: false });          // teeth
  for (let i = 0; i < 5; i++) m.add(G.box(0.03, 0.22, 0.04), hole, { p: [-0.2 + i * 0.1, -0.46, 0.45], shadow: false });
  const wingMat = M.paint(c.accent, { gloss: 0.4, glow: 0.25 });
  wingMat.side = THREE.DoubleSide;
  wings(m, enemy, wingMat, BAT_WING, { y: 0.15, x: 0.45, z: -0.15 });
  flamesOn(m, enemy, [[0, 0.5, -0.1, 0.8, 0.34], [-0.36, 0.35, -0.25, 0.55, 0.2], [0.36, 0.35, -0.25, 0.55, 0.2], [0, 0.2, -0.6, 0.6, 0.22]], 0xff6a1a);
}

function kingPin(m, enemy, c) {
  // The King Pin: a huge pin in a fur-collared cape and a crown.
  const body = M.paint(c.color, { gloss: 0.85, glow: 0.22 });
  const gold = M.metal(0xffcc33, { rough: 0.2 });
  gold.emissive = new THREE.Color(0x6b4300);
  gold.emissiveIntensity = 0.5;
  pinBody(m, body, M.paint(0xd4142f, { gloss: 0.8, glow: 0.35 }), { fat: 1.5, h: 1.75 });
  face(m, { y: -0.3, z: 0.74, s: 1.4, pupil: 0xff2a2a, angry: true });
  // Cape: a part-turned sheet round the back, royal purple.
  const velvet = M.paint(0x6a1fb0, { gloss: 0.35, glow: 0.3 });
  velvet.side = THREE.DoubleSide;
  const cape = new THREE.LatheGeometry(
    [[0.5, 0.06], [0.7, -0.15], [0.9, -0.55], [1.02, -0.93]].map(([r, y]) => new THREE.Vector2(r, y)), 14, Math.PI * 0.5, Math.PI
  );
  m.add(cape, velvet);
  const fur = M.paint(0xffffff, { gloss: 0.2, glow: 0.2 });
  m.add(G.torus(0.5, 0.11, 8, 22), fur, { p: [0, 0.06, 0], r: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    m.add(G.sphere(0.045, 6, 5), M.matte(0x111111), { p: [Math.cos(a) * 0.58, 0.1, Math.sin(a) * 0.58] });
  }
  m.add(G.sphere(0.1, 10, 8), gold, { p: [0, 0.04, 0.61] });                              // clasp
  // Crown.
  m.add(G.sleeve(0.36, 0.3, 0.2, 16), gold, { p: [0, 0.86, 0] });
  m.add(G.torus(0.3, 0.05, 6, 20), gold, { p: [0, 0.77, 0], r: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 2;
    m.add(G.cone(0.09, 0.3, 4), gold, { p: [Math.cos(a) * 0.35, 1.08, Math.sin(a) * 0.35] });
    m.add(G.sphere(0.05, 6, 5), M.glow(i % 2 ? 0x2dd4bf : 0xff4fa3), { p: [Math.cos(a) * 0.35, 1.24, Math.sin(a) * 0.35], shadow: false });
  }
  enemy.crownGem = m.add(G.sphere(0.1, 8, 6), M.glow(0xff2a2a), { p: [0, 0.87, 0.36], shadow: false });
}

const ENEMIES = {
  SWARM: ghostPin,
  FIRE: burningPin,
  FLYING: lanePhantom,
  ARMORED: possessedBall,
  ELITE: crackedPin,
  FLYING_FIRE: flamingSkull,
  BOSS: kingPin
};

// ── Arena ───────────────────────────────────────────────────────────────────

/**
 * Seamless 512px tile: polished maple lane boards running along X (toward the
 * ball return), with the lane's guide dots and aiming arrows inlaid.
 */
function paintFloor(ctx, size) {
  const n = 16, bh = size / n;
  const tones = [['#b9804a', '#b0773f'], ['#b27a45', '#a9703b'], ['#bf874f', '#b67d45'], ['#ad753f', '#a46c37']];
  // Drawn with boards along x, then turned a quarter so they run down the lane.
  ctx.save();
  ctx.translate(size, 0);
  ctx.rotate(Math.PI / 2);
  for (let i = 0; i < n; i++) {
    const [a, b] = tones[(i * 5 + (i >> 2)) % tones.length];
    const g = ctx.createLinearGradient(0, i * bh, 0, (i + 1) * bh);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, i * bh, size, bh);
    // Grain: a few long faint streaks, kept inside the board.
    for (let k = 0; k < 5; k++) {
      const x = Math.random() * (size - 140), w = 60 + Math.random() * 80;
      ctx.fillStyle = `rgba(110, 62, 24, ${0.07 + Math.random() * 0.07})`;
      ctx.fillRect(x, i * bh + 4 + Math.random() * (bh - 8), w, 1.5);
    }
    // Seam along the bottom edge.
    ctx.fillStyle = 'rgba(74, 38, 14, 0.3)';
    ctx.fillRect(0, (i + 1) * bh - 2, size, 2);
    // Board ends.
    const jx = 30 + ((i * 197) % (size - 60));
    ctx.fillRect(jx, i * bh, 1.5, bh);
  }
  // Inlaid markings in dark walnut: seven guide dots, then the arrow chevron.
  ctx.fillStyle = 'rgba(72, 34, 14, 0.62)';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(96, 64 + i * 64, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  [[352, 256], [312, 160], [312, 352], [272, 64], [272, 448]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x + 34, y);
    ctx.lineTo(x - 22, y - 11);
    ctx.lineTo(x - 22, y + 11);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  const black = BLACK();
  switch (kind % 5) {
    case 0: { // stack of house balls
      const cols = [0xff4fa3, 0x2dd4bf, 0xb388ff, 0xffa51f];
      [[-0.2, 0.2, 0.12], [0.2, 0.2, 0.12], [0, 0.2, -0.22], [0, 0.52, 0]].forEach(([x, y, z], i) => {
        bowlingBall(m, 0.2, M.paint(cols[i], { gloss: 0.95, glow: 0.12 }), black, [x, y, z]);
      });
      break;
    }
    case 1: { // pair of rental shoes
      const red = M.paint(0xd4142f, { gloss: 0.6 }), blue = M.paint(0x2456c9, { gloss: 0.6 }), cream = M.paint(0xf1ece2, { gloss: 0.4 });
      for (const s of [-1, 1]) {
        const shoe = m.group({ p: [s * 0.16, 0, s * 0.04], r: [0, s * 0.18, 0] });
        shoe.add(G.rbox(0.22, 0.05, 0.56, 0.02), cream, { p: [0, 0.03, 0] });
        shoe.add(G.rbox(0.2, 0.2, 0.26, 0.07), red, { p: [0, 0.15, -0.14] });
        shoe.add(G.sphere(0.11, 12, 8), blue, { p: [0, 0.1, 0.14], s: [0.95, 0.75, 1.5] });
        shoe.add(G.torus(0.07, 0.022, 6, 14), cream, { p: [0, 0.255, -0.14], r: [Math.PI / 2, 0, 0] });
        for (let i = 0; i < 3; i++) shoe.add(G.box(0.1, 0.012, 0.02), cream, { p: [0, 0.185 - i * 0.02, 0.03 + i * 0.05] });
      }
      break;
    }
    case 2: { // ball bag
      const bag = M.paint(0x6a1fb0, { gloss: 0.4, glow: 0.1 });
      m.add(G.rbox(0.62, 0.42, 0.38, 0.15), bag, { p: [0, 0.22, 0] });
      m.add(G.rbox(0.64, 0.06, 0.39, 0.02), M.paint(0x2dd4bf, { gloss: 0.6, glow: 0.3 }), { p: [0, 0.16, 0] });
      m.add(G.box(0.4, 0.012, 0.03), M.metal(), { p: [0, 0.435, 0] });
      for (const z of [-0.09, 0.09]) m.add(G.torus(0.13, 0.022, 6, 16, Math.PI), black, { p: [0, 0.42, z] });
      break;
    }
    case 3: { // bar stool
      const chrome = M.metal();
      m.add(G.lathe([[0.26, 0], [0.28, 0.03], [0.1, 0.06], [0.04, 0.1], [0.04, 0.5], [0.12, 0.54]], 20), chrome);
      m.add(G.torus(0.17, 0.018, 6, 20), chrome, { p: [0, 0.24, 0], r: [Math.PI / 2, 0, 0] });
      m.add(G.cyl(0.25, 0.23, 0.1, 22), M.paint(0xd4142f, { gloss: 0.7 }), { p: [0, 0.59, 0] });
      m.add(G.torus(0.245, 0.02, 6, 24), chrome, { p: [0, 0.55, 0], r: [Math.PI / 2, 0, 0] });
      break;
    }
    default: { // tombstone score sheet: R.I.P. to a perfect game
      const outline = [[-0.26, 0], [0.26, 0]];
      for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; outline.push([Math.cos(a) * 0.26, 0.42 + Math.sin(a) * 0.26]); }
      m.add(G.plate(outline, 0.14), M.paint(0x8c93a6, { gloss: 0.2 }), { p: [0, 0, 0], r: [-0.06, 0, 0] });
      m.add(G.rbox(0.66, 0.08, 0.26, 0.02), M.paint(0x6b7183, { gloss: 0.2 }), { p: [0, 0.04, 0] });
      const lit = M.glow(0x7dff6a);
      for (let i = 0; i < 3; i++) {
        for (const r of [-0.8, 0.8]) m.add(G.box(0.022, 0.13, 0.01), lit, { p: [-0.14 + i * 0.14, 0.44, 0.05], r: [-0.06, 0, r], shadow: false });
      }
      m.add(G.box(0.36, 0.02, 0.01), lit, { p: [0, 0.3, 0.06], shadow: false });
      m.add(G.box(0.24, 0.02, 0.01), lit, { p: [0, 0.22, 0.065], shadow: false });
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
  const place = (g, x, z, ry = 0, y = 0) => { g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };
  const chrome = M.metal(0xd7dde5, { rough: 0.2 });
  const black = M.matte(0x0d0b14);

  // The pin deck: ten giant pins racked on the far side, apex toward the lanes,
  // a neon BOWL sign beside them.
  const deck = new THREE.Group();
  let m = modeller(deck, 1);
  m.add(G.rbox(15, 1, 12, 0.2), M.paint(0xc58a4a, { gloss: 0.8 }), { p: [0, 0.5, -4] });
  m.add(G.box(15.1, 0.25, 0.3), M.glow(0x2dd4bf), { p: [0, 0.6, 2.05] });
  const pinMat = M.paint(0xf4f1ea, { gloss: 0.9, glow: 0.3 });
  const stripe = M.paint(0xd4142f, { gloss: 0.8, glow: 0.4 });
  const K = 2.9;
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const geo = pinGeo(1, 1.9, 22);
      geo.scale(K, K, K);
      const x = (i - row / 2) * 3.3, z = -row * 2.8;
      m.add(geo, pinMat, { p: [x, 1, z] });
      for (const y of [1.3, 1.43]) m.add(G.torus(0.2 * K, 0.04 * K, 6, 20), stripe, { p: [x, 1 + y * K, z], r: [Math.PI / 2, 0, 0] });
    }
  }
  place(deck, hw * 0.35, -hh - 8.5);


  // Neon BOWL sign on posts beside the deck: lettering painted on a canvas,
  // framed in neon tube.
  const sign = new THREE.Group();
  m = modeller(sign, 1);
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 160;
  const cx = cv.getContext('2d');
  cx.fillStyle = '#120a24';
  cx.fillRect(0, 0, 512, 160);
  cx.font = '900 128px Arial Black, Impact, sans-serif';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.shadowColor = '#ff4fa3';
  cx.shadowBlur = 26;
  cx.fillStyle = '#ff7dc0';
  cx.fillText('BOWL', 256, 86);
  cx.shadowBlur = 0;
  cx.fillStyle = '#fff0f8';
  cx.fillText('BOWL', 256, 86);
  cx.lineWidth = 5;
  cx.strokeStyle = '#ff4fa3';
  cx.strokeText('BOWL', 256, 86);
  m.add(G.rbox(8.4, 3.1, 0.5, 0.15), black, { p: [0, 4.6, 0] });
  m.add(new THREE.PlaneGeometry(7.7, 2.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }), { p: [0, 4.6, 0.27], shadow: false });
  const tube = M.glow(0x2dd4bf);
  for (const y of [3.2, 6.0]) m.add(G.capsule(0.1, 8.2, 8), tube, { p: [-4.1, y, 0.28], r: [0, 0, -Math.PI / 2], shadow: false });
  for (const x of [-4.1, 4.1]) m.add(G.capsule(0.1, 2.8, 8), tube, { p: [x, 3.2, 0.28], shadow: false });
  for (const x of [-3, 3]) m.add(G.cyl(0.2, 0.2, 3.2, 10), black, { p: [x, 1.6, -0.1] });
  place(sign, -hw * 0.5, -hh - 8.5, 0.2);

  // A giant ball return down the far end, with house balls queued on its rails.
  const ret = new THREE.Group();
  m = modeller(ret, 1);
  m.add(G.rbox(4.4, 4.6, 4.2, 1.4), M.paint(0x2dd4bf, { gloss: 0.85, glow: 0.2 }), { p: [-2.9, 2.3, 0] });
  m.add(G.cyl(1.35, 1.35, 0.2, 24), black, { p: [-0.72, 2.2, 0], r: [0, 0, Math.PI / 2] });
  m.add(G.torus(1.4, 0.16, 8, 26), chrome, { p: [-0.66, 2.2, 0], r: [0, Math.PI / 2, 0] });
  for (const z of [-0.8, 0.8]) m.add(G.tube([[-0.8, 1.1, z], [2.5, 0.9, z], [4.6, 1.3, z], [5.4, 2.2, z]], 0.16, 8), chrome);
  for (const x of [1, 4.2]) m.add(G.cyl(0.14, 0.14, 1, 8), chrome, { p: [x, 0.5, 0] });
  const big = [[0.9, 0xff4fa3], [3.9, 0xb388ff]];
  for (const [x, col] of big) {
    m.add(G.sphere(1.45, 26, 18), M.paint(col, { gloss: 0.95, glow: 0.22 }), { p: [x, 2.35, 0] });
    for (const [hx, hy, hz] of [[-0.24, 0.6, 0.76], [0.24, 0.6, 0.76], [0, 0.26, 0.96]]) {
      m.add(G.sphere(0.23, 10, 8), black, { p: [x + hx * 1.4, 2.35 + hy * 1.4, hz * 1.4] });
    }
  }
  m.add(G.sphere(1.45, 26, 18), M.paint(0xffa51f, { gloss: 0.95, glow: 0.22 }), { p: [-2.9, 6.0, 0] });   // spare on top
  m.add(G.torus(1.3, 0.16, 8, 26), chrome, { p: [-2.9, 4.75, 0], r: [Math.PI / 2, 0, 0] });
  place(ret, -hw - 9.5, -hh * 0.35, Math.PI / 2);

  // A towering jukebox beside it.
  const juke = new THREE.Group();
  m = modeller(juke, 1);
  const arch = [[-2.3, 0], [2.3, 0]];
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; arch.push([Math.cos(a) * 2.3, 6.2 + Math.sin(a) * 2.3]); }
  m.add(G.plate(arch, 3), M.paint(0xff4fa3, { gloss: 0.9, glow: 0.22 }), { p: [0, 0.3, 0] });
  m.add(G.rbox(5.2, 0.4, 3.4, 0.1), black, { p: [0, 0.2, 0] });
  const amber = M.glow(0xffd23d);
  m.add(G.torus(1.95, 0.2, 8, 26, Math.PI), amber, { p: [0, 6.5, 1.55], shadow: false });
  for (const s of [-1, 1]) m.add(G.capsule(0.2, 5.6, 8), amber, { p: [s * 1.95, 0.9, 1.55], shadow: false });
  m.add(G.torus(1.45, 0.14, 8, 24, Math.PI), M.glow(0x2dd4bf), { p: [0, 6.5, 1.55], shadow: false });
  m.add(G.cyl(1.15, 1.15, 0.12, 28), M.paint(0x0c0c10, { gloss: 0.95 }), { p: [0, 6.5, 1.52], r: [Math.PI / 2, 0, 0] });
  m.add(G.cyl(0.42, 0.42, 0.16, 18), amber, { p: [0, 6.5, 1.54], r: [Math.PI / 2, 0, 0], shadow: false });
  m.add(G.rbox(3, 2.6, 0.14, 0.06), M.paint(0x2a1030, { gloss: 0.3 }), { p: [0, 2.6, 1.52] });
  for (let i = 0; i < 5; i++) m.add(G.box(0.14, 2.4, 0.1), chrome, { p: [-1.1 + i * 0.55, 2.6, 1.62] });
  m.add(G.rbox(3, 0.4, 0.14, 0.05), M.glow(0xfff3d6), { p: [0, 4.35, 1.54], shadow: false });
  place(juke, -hw - 9, hh * 0.3 + 3.6, Math.PI / 2);

  // The mirror ball, hung over the far corner.
  const disco = new THREE.Group();
  m = modeller(disco, 1);
  const mirror = M.paint(0xe6ddff, { gloss: 1, glow: 0.3 });
  mirror.flatShading = true;
  mirror.metalness = 0.55;
  m.add(G.sphere(1.9, 16, 11), mirror);
  m.add(G.cyl(0.05, 0.05, 12, 6), black, { p: [0, 7.9, 0] });
  m.add(G.cyl(0.35, 0.35, 0.3, 12), chrome, { p: [0, 1.95, 0] });
  [0xff4fa3, 0x2dd4bf, 0xa3ff3d, 0xffc928, 0xb388ff, 0xffffff, 0xff4fa3, 0x2dd4bf].forEach((col, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.3, y = ((i % 3) - 1) * 0.9, r = Math.sqrt(1.92 * 1.92 - y * y);
    m.add(G.sphere(0.26, 6, 5), M.glow(col), { p: [Math.cos(a) * r, y, Math.sin(a) * r], shadow: false });
  });
  place(disco, -hw - 7.5, -hh - 7.5, 0, 6.6);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0xeafff0, accent: ctx.accent ?? 0xff2d55 });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
