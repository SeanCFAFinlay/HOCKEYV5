// ARCADE MELTDOWN
//
// Somebody kicked the change machine and every cabinet on the floor glitched at
// once. The characters have climbed out of their screens — ghosts, gremlins,
// saucers, a cartridge on legs — and they are heading for the prize counter.
// The towers are the arcade itself: light guns, a coin pusher, a claw machine,
// a pinball bumper wired to the mains.
//
// Everything leans into chunky pixels: enemies are built from voxels (see
// `pixels` below), screens show pixel art, the carpet is the classic neon
// confetti on midnight blue.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from '../rendering/geo-utils.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'arcade',
  name: 'Arcade Meltdown',
  shortName: 'Arcade',
  icon: 'joystick',
  sortOrder: 120,
  description: 'The machines glitched and the game characters escaped. Hold the floor with the arcade itself before they loot the prize counter.',
  color: '#ff3df0',
  groundColor: 0x2a2052,
  pathColor: 0x6fe8ff,
  envColor: 0x0a0618,
  environmentSkin: { arena: 'arcade floor', floor: 'neon carpet', markerIcon: '🕹️' },
  enemySkin: { body: 'pixel', icon: 'pixelghost' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Lightgun Turret', icon: 'lightgun', clr: '#2ee6ff' },
    t2: { nm: 'Laser Sniper', icon: 'arcadecab', clr: '#7dff6a' },
    t3: { nm: 'Coin Pusher', icon: 'coinpusher', clr: '#ffd23a' },
    t4: { nm: 'Pause Ray', icon: 'pausebtn', clr: '#3fb8ff' },
    t5: { nm: 'Claw Grabber', icon: 'crane', clr: '#ff8a1f' },
    t6: { nm: 'Tesla Bumper', icon: 'pinball', clr: '#b98cff' },
    t7: { nm: 'Flame Joystick', icon: 'firestick', clr: '#ff4a2e' },
    t8: { nm: 'Mega Cabinet', icon: 'megacab', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Pixel Ghost' },
    e2: { nm: 'Glitch Gremlin' },
    e3: { nm: 'Saucer Bug' },
    e4: { nm: 'Tank Cartridge' },
    e5: { nm: 'Joystick Ninja' },
    e6: { nm: 'Fireball Sprite' },
    e7: { nm: 'HIGH SCORE' }
  },
  maps: [
    ['Level 1-1', 'A simple run past the cabinets - learn the basics'],
    ['Insert Coin', 'Open centre, two ways in'],
    ['Pixel Maze', 'Tight lanes between the machines'],
    ['Bonus Stage', 'Long floor, heavy traffic'],
    ['Two Player Mode', 'They come from everywhere'],
    ['Speed Run', 'Narrow and fast'],
    ['Neon Night', 'Wide open and bright'],
    ['Glitch Zone', 'Mixed pressure, little room'],
    ['Boss Rush', 'The big spread'],
    ['Last Continue', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x0a0618,
    fog: 0x140a2e,
    fogDensity: 0.006,
    floor: {
      base: '#221a46',
      meshColor: 0x9a92c8,
      roughness: 0.85,
      metalness: 0.02,
      emissive: 0x1a0f3a,
      emissiveIntensity: 0.14
    },
    rail: { color: 0x241c48, roughness: 0.4, metalness: 0.3 },
    path: { color: 0x6fe8ff, emissive: 0x0e4a66, opacity: 0.24, edge: 0x22e8ff },
    buildZone: { color: 0xffd6ff, opacity: 0.08, line: 0xff3df0 },
    obstacle: { accent: 0xff3df0 },
    base: { color: 0xffd23a, icon: 'PRIZE COUNTER' },
    spawn: { color: 0xff3df0, icon: 'GAME OVER?' }
  },
  lighting: {
    hemiSky: 0xd8d0ff,
    hemiGround: 0x2a1450,
    hemiIntensity: 0.4,
    sun: 0xf4eaff,
    sunIntensity: 0.8,
    rim: 0x22e8ff,
    rimIntensity: 0.4,
    accent: 0xff3df0,
    spotIntensity: 2.5,
    exposure: 0.68
  },
  ui: { accent: '#ff3df0', dark: '#0a0618' },
  crowd: { fans: [0xff3df0, 0x22e8ff, 0xffe23a, 0x5dff6a, 0xf4f1ff], seat: 0x1a1236 },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    // A light-gun shot: a short cyan streak.
    ball: { mesh: 'laser', model: 'pixelBolt', debris: 'pixels', debrisColor: 0x2ee6ff, flight: 'tracer', trail: 'laser', impact: 'spark', color: 0x2ee6ff, speed: 17 },
    // The sniper's beam.
    curveBall: { mesh: 'beam', debris: 'pixels', debrisColor: 0x7dff6a, flight: 'tracer', trail: 'line', impact: 'spark', color: 0x7dff6a, speed: 20 },
    // A gold pixel block, lobbed off the coin pusher.
    headButt: { mesh: 'block', model: 'arcadeToken', debris: 'pixels', debrisColor: 0xffd23a, flight: 'lob', trail: 'gold', impact: 'ring', color: 0xffd23a, speed: 8.5, size: 1.15 },
    // Pause rings.
    tackle: { mesh: 'ring', model: 'pauseIcon', debris: 'pixels', debrisColor: 0x7fd8ff, flight: 'ring', trail: 'frost', impact: 'freeze', color: 0x7fd8ff, speed: 9 },
    // The claw coming down.
    glove: { mesh: 'block', model: 'craneClaw', debris: 'pixels', debrisColor: 0xff8a1f, flight: 'punch', trail: 'dust', impact: 'slam', color: 0xff8a1f, speed: 8.8, size: 1.15 },
    chain: { mesh: 'bolt', model: 'pinball', debris: 'sparks', debrisColor: 0xc9a6ff, flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xc9a6ff, speed: 15 },
    flare: { mesh: 'plasma', model: 'pixelFire', debris: 'embers', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff4a1a, speed: 11, size: 0.85 },
    // A star off the mega screen: extra life.
    legend: { mesh: 'star', model: 'pixelStar', debris: 'pixels', debrisColor: 0xffc928, flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0x45e8ff, accent: 0xff3df0 },
    fire: { body: 'bug', color: 0x9b4dff, accent: 0xffe23a },
    flying: { body: 'bug', color: 0x22c84a, accent: 0xff3df0 },
    armored: { body: 'bug', color: 0x8d93a8, accent: 0xff4a6a },
    elite: { body: 'bug', color: 0x1d1b2c, accent: 0xff2d55 },
    flying_fire: { body: 'bug', color: 0xff4a0a, accent: 0xffc800 },
    boss: { body: 'bug', color: 0xeeeaff, accent: 0xff2d55 },
    splitter: { body: 'bug', color: 0xb8ff2e, accent: 0xff3df0 },
    splitling: { body: 'bug', color: 0xb8ff2e, accent: 0xff3df0 },
    shielder: { body: 'bug', color: 0x3a6fd8, accent: 0x22e8ff },
    healer: { body: 'bug', color: 0x9ff2c4, accent: 0x5dff6a }
  },
  towers: { family: 'arcade', base: 0x1a1236, metal: 0xd7dde5, levelGlow: 0xff3df0 }
};

// ── Shared surfaces ─────────────────────────────────────────────────────────

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

const NEON = { pink: 0xff3df0, cyan: 0x22e8ff, yellow: 0xffe23a, green: 0x5dff6a, orange: 0xff8a1f, purple: 0x9a6bff, red: 0xff2d55 };

const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.paint(0x121018, { gloss: 0.75 });
const CASE = () => M.paint(0x1c1838, { gloss: 0.85 });           // cabinet laminate
const GLASS = () => M.glass(0xcfe8ff, 0.24);
const GOLD = () => M.paint(0xffbf1a, { gloss: 0.9, glow: 0.3 });   // reads as gold under the arcade lights; metal goes black

/** Where shots leave the figure, in model units (see rendering/tower-meshes.js). */
function muzzle(m, x, y, z) {
  m.object.userData.muzzle = { x: x * m.scale, y: y * m.scale, z: z * m.scale };
}

/**
 * Pixel art as voxels. `art` is rows of characters, top row first; each one
 * names an entry in `pal` ('.' is empty). An entry is a material, or
 * [material, depth, z] to make that colour stand proud of the rest. Runs of one
 * character on a row become one box. The picture is centred on `p`, facing +Z.
 */
function pixels(m, art, pal, { px = 0.1, d = 0.1, p = [0, 0, 0], r = [0, 0, 0] } = {}) {
  const g = m.group({ p, r });
  const rows = art.length, cols = Math.max(...art.map(s => s.length));
  for (let j = 0; j < rows; j++) {
    const row = art[j];
    for (let i = 0; i < row.length;) {
      const ch = row[i];
      const entry = pal[ch];
      if (!entry) { i++; continue; }
      let k = i;
      while (k < row.length && row[k] === ch) k++;
      const [mat, depth = d, z = 0] = Array.isArray(entry) ? entry : [entry];
      g.add(G.box((k - i) * px, px, depth), mat, { p: [(i + (k - i) / 2 - cols / 2) * px, ((rows - 1) / 2 - j) * px, z] });
      i = k;
    }
  }
  return g;
}

/** A line of thin boxes along a path of [z, y] points at side `x`: neon trim. */
function trim(m, pts, x, mat, t = 0.014) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [z0, y0] = pts[i], [z1, y1] = pts[i + 1];
    const dz = z1 - z0, dy = y1 - y0, len = Math.hypot(dz, dy);
    m.add(G.box(t, t, len + t), mat, { p: [x, (y0 + y1) / 2, (z0 + z1) / 2], r: [-Math.atan2(dy, dz), 0, 0], shadow: false });
  }
}

// Side profile of an upright cabinet, [z, y], one unit tall and 0.6 deep:
// kick panel, control panel, a screen leaning back, the marquee overhang.
const CAB = [[-0.3, 0], [0.3, 0], [0.3, 0.4], [0.38, 0.45], [0.38, 0.49], [0.2, 0.55], [0.12, 0.86], [0.27, 0.9], [0.27, 1.0], [-0.3, 1.0]];

/**
 * An upright arcade cabinet standing on `y0`, `w` wide, `h` tall, `d` deep.
 * Returns where its screen and control panel are, for dressing.
 */
function cabinet(m, { w, h, d, y0 = 0, x = 0, z = 0, body, edge, marquee, screen = 0x0a1630 }) {
  const k = d / 0.6;
  const pts = CAB.map(([pz, py]) => [pz * k, py * h]);
  const g = m.group({ p: [x, y0, z] });
  g.add(G.plate(pts, w), body, { r: [0, -HALF_PI, 0] });
  // T-moulding round both sides, in neon.
  if (edge) for (const s of [-1, 1]) trim(g, [...pts, pts[0]], s * (w / 2 + 0.004), edge, Math.max(0.012, w * 0.05));
  // The screen: dark glass tilted back, a bezel round it.
  const [sz0, sy0] = pts[5], [sz1, sy1] = pts[6];
  const tilt = Math.atan2(sz1 - sz0, sy1 - sy0);
  const sh = Math.hypot(sz1 - sz0, sy1 - sy0);
  const scr = { x, y: y0 + (sy0 + sy1) / 2, z: z + (sz0 + sz1) / 2 + 0.006, tilt, w: w * 0.8, h: sh * 0.86 };
  g.add(G.box(w * 0.9, sh * 0.98, 0.012), BLACK(), { p: [0, scr.y - y0, scr.z - z - 0.006], r: [tilt, 0, 0] });
  g.add(new THREE.PlaneGeometry(scr.w, scr.h), M.glow(screen), { p: [0, scr.y - y0, scr.z - z + 0.002], r: [tilt, 0, 0], shadow: false });
  // The marquee.
  const [mz, my0] = pts[7], [, my1] = pts[8];
  if (marquee) g.add(new THREE.PlaneGeometry(w * 0.86, (my1 - my0) * 0.74), marquee, { p: [0, (my0 + my1) / 2, mz + 0.004], shadow: false });
  // The coin door on the kick panel.
  g.add(G.rbox(w * 0.36, h * 0.16, 0.02, 0.006), BLACK(), { p: [0, h * 0.2, pts[1][0] + 0.004] });
  for (const s of [-1, 1]) g.add(G.box(w * 0.04, h * 0.05, 0.012), M.glow(NEON.red), { p: [s * w * 0.08, h * 0.22, pts[1][0] + 0.016], shadow: false });
  return { scr, panel: { y: y0 + 0.52 * h, z: z + 0.29 * k } };
}

/** Pixel art drawn onto a cabinet screen returned by `cabinet`. */
function screenArt(m, scr, art, pal, px) {
  pixels(m, art, pal, { px, d: 0.006, p: [scr.x, scr.y, scr.z + 0.004], r: [scr.tilt, 0, 0] });
}

/** An arcade push button: black collar, glossy dome, on a surface at `p`. */
function button(m, p, color, r = 0.035, tilt = [0, 0, 0]) {
  const g = m.group({ p, r: tilt });
  g.add(G.cyl(r * 1.25, r * 1.3, r * 0.5, 14), BLACK(), { p: [0, r * 0.25, 0] });
  g.add(G.dome(r, 14), M.paint(color, { gloss: 0.9, glow: 0.45 }), { p: [0, r * 0.45, 0], s: [1, 0.6, 1] });
  return g;
}

/** A bat-top joystick standing on a surface at `p`. */
function joystick(m, p, ball = NEON.red, k = 1) {
  m.add(G.cyl(0.03 * k, 0.034 * k, 0.012 * k, 12), BLACK(), { p });
  m.add(G.cyl(0.008 * k, 0.008 * k, 0.08 * k, 8), CHROME(), { p: [p[0], p[1] + 0.04 * k, p[2]] });
  m.add(G.sphere(0.026 * k, 12, 10), M.paint(ball, { gloss: 0.9, glow: 0.3 }), { p: [p[0], p[1] + 0.09 * k, p[2]] });
}

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

function lightgunTurret(m, c) {
  // Two light guns on a swivel yoke over a little console, cords coiled down
  // to it. They fire as fast as you can pull a trigger.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.2 });
  const dark = CASE();
  const tip = M.glow(NEON.orange);
  m.add(G.rbox(0.48, 0.1, 0.44, 0.03), dark, { p: [0, 0.17, 0] });
  m.add(G.rbox(0.5, 0.025, 0.46, 0.01), M.glow(c.color), { p: [0, 0.135, 0], shadow: false });
  // The console's score window: four seven-segment digits.
  m.add(G.box(0.26, 0.06, 0.012), M.glow(0x060312), { p: [0, 0.18, 0.222], shadow: false });
  for (let i = 0; i < 4; i++) {
    m.add(G.box(0.032, 0.008, 0.004), M.glow(NEON.red), { p: [-0.09 + i * 0.06, 0.2, 0.23], shadow: false });
    m.add(G.box(0.032, 0.008, 0.004), M.glow(NEON.red), { p: [-0.09 + i * 0.06, 0.16, 0.23], shadow: false });
    for (const s of [-1, 1]) m.add(G.box(0.007, 0.03, 0.004), M.glow(NEON.red), { p: [-0.09 + i * 0.06 + s * 0.016, 0.18, 0.23], shadow: false });
  }
  // The swivel post and yoke.
  m.add(G.lathe([[0.12, 0], [0.12, 0.03], [0.06, 0.06], [0.05, 0.22], [0.07, 0.25], [0, 0.25]], 16), BLACK(), { p: [0, 0.22, -0.02] });
  m.add(G.rbox(0.34, 0.05, 0.1, 0.02), body, { p: [0, 0.48, -0.02] });
  for (const s of [-1, 1]) m.add(G.rbox(0.04, 0.12, 0.08, 0.015), body, { p: [s * 0.17, 0.53, -0.02] });
  // The guns: chunky plastic pistols with orange tips.
  const guns = m.group({ p: [0, 0.56, 0] });
  for (const s of [-1, 1]) {
    const g = guns.group({ p: [s * 0.095, 0, 0] });
    g.add(G.rbox(0.075, 0.09, 0.26, 0.025), body, { p: [0, 0, 0.02] });
    g.add(G.rbox(0.06, 0.15, 0.07, 0.02), dark, { p: [0, -0.1, -0.07], r: [-0.35, 0, 0] });
    g.add(G.cyl(0.03, 0.034, 0.12, 12), dark, { p: [0, 0.008, 0.2], r: [HALF_PI, 0, 0] });
    g.add(G.torus(0.03, 0.01, 6, 14), tip, { p: [0, 0.008, 0.262], shadow: false });
    g.add(G.box(0.016, 0.02, 0.05), dark, { p: [0, 0.055, 0.1] });                 // front sight
    g.add(G.box(0.012, 0.04, 0.02), CHROME(), { p: [0, -0.06, 0.0] });             // trigger
    g.add(G.box(0.078, 0.012, 0.2), M.glow(0xffffff, 0.85), { p: [0, 0.012, 0.03], shadow: false });   // a racing stripe
  }
  guns.object.scale.setScalar(1.3);
  m.anim(guns.object, 'bob');
  // Coiled cords from the grips down to the console.
  for (const s of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, a = t * 6 * TAU;
      pts.push([s * (0.13 + Math.sin(a) * 0.025), 0.45 - t * 0.24, -0.12 + Math.cos(a) * 0.025 - t * 0.05]);
    }
    m.add(G.tube(pts, 0.008, 5), BLACK());
  }
  // "PLAYER 1" lamp.
  const lamp = m.add(G.sphere(0.03, 10, 8), M.glow(NEON.green, 0.9), { p: [0, 0.68, -0.08], shadow: false });
  m.anim(lamp, 'blink');
  muzzle(m, 0, 0.57, 0.37);
}

function laserSniper(m, c) {
  // A narrow cabinet with a long-barrelled laser rifle bolted to its roof and
  // a crosshair on the screen.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.15 });
  const glow = M.glow(c.color);
  const { scr, panel } = cabinet(m, { w: 0.3, h: 0.66, d: 0.38, y0: 0.12, z: -0.04, body: CASE(), edge: glow, marquee: M.glow(c.color, 0.95), screen: 0x041a0c });
  // Crosshair on the screen.
  screenArt(m, scr, [
    '...G...',
    '...G...',
    '.......',
    'GG.R.GG',
    '.......',
    '...G...',
    '...G...'
  ], { G: M.glow(c.color), R: M.glow(NEON.red) }, 0.026);
  for (const s of [-1, 1]) button(m, [s * 0.07, panel.y, panel.z], s > 0 ? NEON.yellow : NEON.red, 0.022, [0.32, 0, 0]);
  // Side art: body-coloured lightning flash.
  for (const s of [-1, 1]) m.add(G.plate([[0, 0], [0.08, 0.12], [0.04, 0.12], [0.1, 0.24], [0.02, 0.1], [0.06, 0.1]], 0.006), body, { p: [s * 0.153, 0.32, -0.08], r: [0, s * HALF_PI, 0] });
  // The rifle on its roof mount.
  m.add(G.rbox(0.12, 0.05, 0.14, 0.015), BLACK(), { p: [0, 0.805, -0.08] });
  const rifle = m.group({ p: [0, 0.87, -0.04] });
  rifle.add(G.rbox(0.09, 0.08, 0.3, 0.025), body, { p: [0, 0, -0.02] });
  rifle.add(G.cyl(0.022, 0.026, 0.34, 12), CHROME(), { p: [0, 0, 0.28], r: [HALF_PI, 0, 0] });
  for (const z of [0.18, 0.3, 0.42]) rifle.add(G.cyl(0.034, 0.034, 0.02, 12), BLACK(), { p: [0, 0, z], r: [HALF_PI, 0, 0] });
  rifle.add(G.cyl(0.028, 0.028, 0.02, 12), glow, { p: [0, 0, 0.455], r: [HALF_PI, 0, 0], shadow: false });
  // The scope, lens lit.
  rifle.add(G.cyl(0.03, 0.03, 0.22, 12), BLACK(), { p: [0, 0.075, 0.02], r: [HALF_PI, 0, 0] });
  for (const z of [-0.09, 0.13]) rifle.add(G.cyl(0.04, 0.034, 0.04, 12), BLACK(), { p: [0, 0.075, z], r: [HALF_PI, 0, 0] });
  rifle.add(G.cyl(0.032, 0.032, 0.006, 12), M.glow(NEON.red), { p: [0, 0.075, 0.153], r: [HALF_PI, 0, 0], shadow: false });
  rifle.add(G.rbox(0.05, 0.08, 0.06, 0.015), BLACK(), { p: [0, -0.07, -0.08], r: [-0.3, 0, 0] });
  m.anim(rifle.object, 'bob');
  // The laser sight, flickering out ahead.
  const beam = m.add(G.cyl(0.005, 0.005, 0.3, 4), M.glow(NEON.red, 0.6), { p: [0, 0.87, 0.57], r: [HALF_PI, 0, 0], shadow: false });
  m.anim(beam, 'blink');
  muzzle(m, 0, 0.87, 0.42);
}

function coinPusher(m, c) {
  // A coin pusher: a glass case of shelves heaped with gold, a chasing light
  // rail over it and the next coin flipping up out of the hopper.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.15 });
  const gold = GOLD();
  const coin = G.cyl(0.042, 0.042, 0.012, 14);
  m.add(G.rbox(0.54, 0.24, 0.48, 0.03), CASE(), { p: [0, 0.24, 0] });
  m.add(G.rbox(0.56, 0.03, 0.5, 0.012), body, { p: [0, 0.37, 0] });
  // The win tray at the front, with spilled coins.
  m.add(G.rbox(0.36, 0.06, 0.08, 0.015), BLACK(), { p: [0, 0.18, 0.27] });
  for (const [x, rz] of [[-0.08, 0.2], [0.04, -0.3], [0.1, 0.1]]) m.add(coin, gold, { p: [x, 0.22, 0.27], r: [0.2, 0, rz] });
  m.add(G.box(0.3, 0.06, 0.012), M.glow(c.color), { p: [0, 0.3, 0.245], shadow: false });
  for (let i = 0; i < 3; i++) m.add(G.box(0.05, 0.03, 0.006), M.glow(0x2a0a10), { p: [-0.09 + i * 0.09, 0.3, 0.253], shadow: false });
  // The case: glass all round, neon corner posts, a roof.
  m.add(G.box(0.5, 0.3, 0.44), GLASS(), { p: [0, 0.535, 0], shadow: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.box(0.03, 0.31, 0.03), M.glow(c.color), { p: [sx * 0.25, 0.535, sz * 0.22], shadow: false });
  m.add(G.rbox(0.56, 0.05, 0.5, 0.015), CASE(), { p: [0, 0.71, 0] });
  // Inside: two steel shelves, coins heaped on them, the pusher block at the back.
  for (const [y, z] of [[0.4, 0.04], [0.5, -0.06]]) m.add(G.box(0.46, 0.012, 0.3), CHROME(), { p: [0, y, z] });
  m.add(G.rbox(0.44, 0.06, 0.08, 0.01), body, { p: [0, 0.54, -0.17] });
  for (let i = 0; i < 18; i++) {
    const x = -0.19 + (i % 6) * 0.076 + ((i * 7) % 3) * 0.008, top = i < 9;
    m.add(coin, gold, { p: [x, top ? 0.514 + (i % 2) * 0.012 : 0.414 + (i % 3) * 0.012, top ? -0.05 + (i % 3) * 0.05 : 0.06 + (i % 3) * 0.05], r: [((i * 3) % 5) * 0.12, 0, ((i * 5) % 7) * 0.1] });
  }
  // A light rail over the roof: bulbs that chase.
  for (let i = 0; i < 6; i++) {
    const bulb = m.add(G.sphere(0.022, 8, 6), M.glow(i % 2 ? NEON.pink : NEON.yellow, 0.9), { p: [-0.21 + i * 0.084, 0.745, 0.23], shadow: false });
    if (i % 2) m.anim(bulb, 'blink');
  }
  // The hopper on the roof and the coin it flips.
  m.add(G.lathe([[0.06, 0], [0.12, 0.08], [0.13, 0.1], [0.11, 0.1], [0.05, 0.02], [0, 0.02]], 16), CHROME(), { p: [0, 0.735, -0.04] });
  const big = m.group({ p: [0, 0.92, 0.02] });
  big.add(G.cyl(0.085, 0.085, 0.022, 20), gold, { r: [HALF_PI, 0, 0] });
  big.add(G.torus(0.07, 0.008, 5, 18), M.glow(0xfff0a0), { p: [0, 0, 0.012], shadow: false });
  big.add(G.star(0.04, 0.017, 0.01), M.glow(0x7a4a00), { p: [0, 0, 0.016], shadow: false });
  m.anim(big.object, 'float');
  muzzle(m, 0, 0.92, 0.04);
}

function pauseRay(m, c) {
  // The biggest pause button in the building, on a pedestal, wired to a ray
  // that freezes whatever it points at. Frost creeps up its base.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.25 });
  const ice = M.glass(0xe6f8ff, 0.6);
  m.add(G.lathe([[0.27, 0], [0.29, 0.03], [0.26, 0.07], [0.15, 0.1], [0.12, 0.32], [0.2, 0.36], [0, 0.36]], 22), CASE(), { p: [0, 0.12, 0] });
  m.add(G.torus(0.27, 0.014, 6, 24), M.glow(c.color), { p: [0, 0.165, 0], r: [HALF_PI, 0, 0], shadow: false });
  // The button: a black housing tilted toward the field, the dome lit, the
  // pause glyph across it.
  const head = m.group({ p: [0, 0.52, -0.05], r: [0.55, 0, 0] });
  head.add(G.cyl(0.25, 0.26, 0.08, 24), BLACK(), { p: [0, 0, 0] });
  head.add(G.torus(0.235, 0.018, 6, 24), M.glow(0xeafcff), { p: [0, 0.04, 0], r: [HALF_PI, 0, 0], shadow: false });
  head.add(G.dome(0.21, 22), body, { p: [0, 0.04, 0], s: [1, 0.55, 1] });
  for (const s of [-1, 1]) head.add(G.rbox(0.06, 0.04, 0.19, 0.012), M.glow(0x0a1640), { p: [s * 0.055, 0.15, 0], shadow: false });
  // The ray: a short barrel out front, rings of light down it.
  m.add(G.cyl(0.05, 0.06, 0.18, 14), CHROME(), { p: [0, 0.33, 0.2], r: [HALF_PI, 0, 0] });
  const rings = m.group({ p: [0, 0.33, 0.27] });
  for (let i = 0; i < 3; i++) rings.add(G.torus(0.055 + i * 0.012, 0.01, 6, 18), M.energy(c.color, 0.9 - i * 0.2), { p: [0, 0, i * 0.035], shadow: false });
  m.anim(rings.object, 'pulse');
  m.add(G.sphere(0.035, 10, 8), M.glow(0xffffff), { p: [0, 0.33, 0.3], shadow: false });
  // Frost on the pedestal.
  [[0.19, 0.2, 0.06, 0.5], [-0.17, 0.18, 0.12, 0.8], [0.02, 0.17, -0.22, 0.6], [-0.2, 0.16, -0.12, 0.45], [0.2, 0.15, -0.14, 0.7]].forEach(([x, y, z, k]) => {
    m.add(new THREE.OctahedronGeometry(0.07, 0), ice, { p: [x, y + 0.04 * k, z], s: [k, k * 2.2, k], r: [0.2 * x, x * 4, 0.3 * z] });
  });
  // Pixel snowflake floating over it.
  const flake = pixels(m, ['.W.W.', 'W.W.W', '.WWW.', 'W.W.W', '.W.W.'], { W: M.glow(0xeafcff) }, { px: 0.03, d: 0.012, p: [0, 0.86, -0.02] });
  m.anim(flake.object, 'float');
  muzzle(m, 0, 0.33, 0.32);
}

function clawGrabber(m, c) {
  // A claw machine shrunk to a cabinet you could carry: plush prizes in the
  // pit, a gantry and a three-fingered claw that drops on anything close.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.18 });
  const glow = M.glow(c.color);
  m.add(G.rbox(0.52, 0.26, 0.5, 0.03), body, { p: [0, 0.25, 0] });
  m.add(G.rbox(0.54, 0.04, 0.52, 0.012), CASE(), { p: [0, 0.39, 0] });
  // Control panel: joystick and a drop button; the prize door.
  m.add(G.rbox(0.44, 0.05, 0.1, 0.015), CASE(), { p: [0, 0.34, 0.27], r: [0.3, 0, 0] });
  joystick(m, [-0.1, 0.37, 0.28], NEON.red);
  button(m, [0.1, 0.36, 0.28], NEON.green, 0.03, [0.3, 0, 0]);
  m.add(G.rbox(0.14, 0.1, 0.02, 0.01), BLACK(), { p: [0.14, 0.2, 0.252] });
  m.add(G.box(0.1, 0.012, 0.01), M.glow(NEON.yellow), { p: [0.14, 0.235, 0.264], shadow: false });
  // The glass box and its frame.
  m.add(G.box(0.48, 0.36, 0.46), GLASS(), { p: [0, 0.59, 0], shadow: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.box(0.028, 0.37, 0.028), CASE(), { p: [sx * 0.245, 0.59, sz * 0.235] });
  for (const sz of [-1, 1]) m.add(G.box(0.5, 0.018, 0.018), glow, { p: [0, 0.415, sz * 0.24], shadow: false });
  m.add(G.rbox(0.54, 0.07, 0.52, 0.02), body, { p: [0, 0.8, 0] });
  m.add(new THREE.PlaneGeometry(0.42, 0.045), M.glow(0xffffff, 0.95), { p: [0, 0.8, 0.262], shadow: false });
  // Plush in the pit: round little bears in candy colours.
  [[-0.13, -0.1, 0xff8fc8], [0.1, -0.12, 0x7fd8ff], [0.0, 0.06, 0xffe23a], [-0.14, 0.1, 0x8dff7a], [0.14, 0.1, 0xc9a6ff]].forEach(([x, z, col], i) => {
    const fur = M.paint(col, { gloss: 0.2, glow: 0.12 });
    m.add(G.sphere(0.075, 10, 8), fur, { p: [x, 0.49, z] });
    m.add(G.sphere(0.055, 10, 8), fur, { p: [x, 0.58, z + 0.01] });
    for (const s of [-1, 1]) m.add(G.sphere(0.02, 6, 5), fur, { p: [x + s * 0.04, 0.625, z] });
    m.add(G.box(0.03, 0.01, 0.005), M.glow(0x1a1020), { p: [x, 0.585, z + 0.064], shadow: false });
    if (i === 2) m.add(G.star(0.03, 0.013, 0.008), M.glow(0xffffff), { p: [x, 0.5, z + 0.07], shadow: false });
  });
  // Gantry rail under the roof, and the claw on its cable.
  m.add(G.box(0.44, 0.02, 0.03), CHROME(), { p: [0, 0.755, 0] });
  m.add(G.rbox(0.07, 0.04, 0.07, 0.01), BLACK(), { p: [0, 0.73, 0] });
  const claw = m.group({ p: [0, 0.7, 0] });
  claw.add(G.cyl(0.004, 0.004, 0.06, 4), CHROME(), { p: [0, -0.01, 0] });
  claw.add(G.cyl(0.03, 0.035, 0.04, 10), CHROME(), { p: [0, -0.05, 0] });
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3, cx = Math.sin(a), cz = Math.cos(a);
    claw.add(G.tube([[cx * 0.025, -0.06, cz * 0.025], [cx * 0.07, -0.09, cz * 0.07], [cx * 0.05, -0.14, cz * 0.05]], 0.008, 5), CHROME());
  }
  m.anim(claw.object, 'bob');
  // Marquee bulbs.
  for (let i = 0; i < 5; i++) {
    const b = m.add(G.sphere(0.018, 8, 6), M.glow(i % 2 ? NEON.yellow : 0xffffff, 0.9), { p: [-0.2 + i * 0.1, 0.845, 0.25], shadow: false });
    if (i % 2 === 0) m.anim(b, 'blink');
  }
  muzzle(m, 0, 0.6, 0.27);
}

function teslaBumper(m, c) {
  // A pop bumper lifted off a pinball table, flippers and all, with a Tesla
  // coil on its crown. The ball keeps going round; the arcs jump between foes.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.25 });
  const copper = M.metal(0xc97a3a, { rough: 0.3 });
  // A wedge of playfield, neon-edged.
  m.add(G.rbox(0.56, 0.06, 0.56, 0.02), CASE(), { p: [0, 0.15, 0] });
  m.add(G.box(0.5, 0.008, 0.5), M.paint(0x2a1858, { gloss: 0.9, glow: 0.1 }), { p: [0, 0.183, 0] });
  for (let i = 0; i < 4; i++) m.add(G.box(i % 2 ? 0.012 : 0.54, 0.02, i % 2 ? 0.54 : 0.012), M.glow(c.color), { p: [i === 1 ? -0.27 : i === 3 ? 0.27 : 0, 0.19, i === 0 ? -0.27 : i === 2 ? 0.27 : 0], shadow: false });
  // Arrow inserts lit on the playfield.
  for (const [x, z, a] of [[-0.17, 0.12, 0.6], [0.17, 0.12, -0.6], [0, -0.19, Math.PI]]) {
    m.add(G.plate([[0, 0.05], [-0.035, 0], [0.035, 0]], 0.004), M.glow(NEON.yellow, 0.9), { p: [x, 0.19, z], r: [-HALF_PI, 0, a], shadow: false });
  }
  // Flippers at the front.
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.02, 0.02, 0.04, 10), CHROME(), { p: [s * 0.14, 0.2, 0.2] });
    m.add(G.plate([[0, 0.02], [0.13, 0.008], [0.13, -0.008], [0, -0.02]], 0.03), M.paint(0xffffff, { gloss: 0.8, glow: 0.2 }), { p: [s * 0.14, 0.205, 0.2], r: [-HALF_PI, 0, s > 0 ? Math.PI + 0.35 : -0.35] });
  }
  // The bumper: a base, the lit skirt ring, a mushroom cap with a star.
  m.add(G.cyl(0.14, 0.16, 0.08, 20), BLACK(), { p: [0, 0.23, -0.02] });
  m.add(G.torus(0.15, 0.025, 8, 24), M.glow(c.color), { p: [0, 0.29, -0.02], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.cyl(0.09, 0.1, 0.12, 16), M.glass(0xffffff, 0.5), { p: [0, 0.34, -0.02] });
  m.add(G.cyl(0.07, 0.07, 0.1, 14), M.energy(c.color, 0.5), { p: [0, 0.34, -0.02], shadow: false });
  m.add(G.lathe([[0.18, 0], [0.18, 0.03], [0.15, 0.06], [0.06, 0.08], [0, 0.08]], 22), body, { p: [0, 0.4, -0.02] });
  m.add(G.star(0.07, 0.03, 0.01), M.glow(0xffffff), { p: [0, 0.485, -0.02], r: [-HALF_PI, 0, 0], shadow: false });
  // The coil: copper windings on a post, the terminal ball on top.
  m.add(G.cyl(0.03, 0.04, 0.24, 10), BLACK(), { p: [0, 0.6, -0.02] });
  for (let i = 0; i < 6; i++) m.add(G.torus(0.042, 0.011, 5, 14), copper, { p: [0, 0.51 + i * 0.03, -0.02], r: [HALF_PI, 0, 0] });
  m.add(G.torus(0.09, 0.025, 8, 20), CHROME(), { p: [0, 0.74, -0.02], r: [HALF_PI, 0, 0] });
  const ball = m.add(G.sphere(0.06, 12, 10), M.glow(0xeee0ff), { p: [0, 0.8, -0.02], shadow: false });
  m.anim(ball, 'pulse');
  const arc = m.add(G.tube([[-0.09, 0.74, -0.02], [-0.04, 0.82, 0.03], [0.02, 0.77, -0.05], [0.07, 0.85, 0], [0.12, 0.8, -0.02]], 0.007, 4), M.glow(0xffffff, 0.9), { shadow: false });
  m.anim(arc, 'blink');
  // The ball, still in play.
  const pin = m.add(G.sphere(0.04, 12, 10), CHROME(), { p: [0, 0.23, 0] });
  m.anim(pin, 'orbit', { radius: 0.22 * m.scale });
  muzzle(m, 0, 0.82, -0.02);
}

function flameJoystick(m, c) {
  // A joystick the size of a fire hydrant: push it forward and the nozzle in
  // its base breathes fire. Two giant buttons for a combo.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.22 });
  const steel = M.metal(0x3b4048, { rough: 0.45 });
  m.add(G.rbox(0.48, 0.16, 0.46, 0.04), CASE(), { p: [0, 0.2, 0] });
  m.add(G.rbox(0.42, 0.02, 0.4, 0.01), steel, { p: [0, 0.285, 0] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.cyl(0.012, 0.012, 0.01, 8), CHROME(), { p: [sx * 0.18, 0.297, sz * 0.17] });
  // Flame decals on the sides of the base.
  for (const s of [-1, 1]) m.add(G.plate([[0, 0], [0.3, 0], [0.24, 0.05], [0.3, 0.09], [0.18, 0.07], [0.2, 0.12], [0.08, 0.06]], 0.006), M.glow(NEON.orange, 0.95), { p: [s * 0.243, 0.15, -0.15], r: [0, s * HALF_PI, 0], shadow: false });
  button(m, [-0.15, 0.29, 0.13], NEON.yellow, 0.05);
  button(m, [0.15, 0.29, 0.13], NEON.cyan, 0.05);
  // The stick: dust boot, shaft, a huge ball, tilted forward.
  m.add(G.lathe([[0.1, 0], [0.1, 0.02], [0.07, 0.05], [0.05, 0.08], [0.03, 0.1], [0, 0.1]], 16), BLACK(), { p: [0, 0.29, -0.06] });
  const stick = m.group({ p: [0, 0.36, -0.06], r: [0.3, 0, 0] });
  stick.add(G.cyl(0.024, 0.024, 0.28, 10), CHROME(), { p: [0, 0.14, 0] });
  stick.add(G.sphere(0.13, 18, 14), body, { p: [0, 0.34, 0] });
  stick.add(G.sphere(0.04, 8, 6), M.glow(0xffffff, 0.8), { p: [-0.05, 0.39, 0.08], shadow: false });   // highlight
  for (const [x, z, h, o] of [[0, 0, 0.18, 0], [0.06, -0.03, 0.12, 2], [-0.06, 0.02, 0.12, 4]]) {
    const lick = stick.group({ p: [x, 0.44, z] });
    lick.add(G.cone(0.04, h, 7), M.energy(0xff7a1f, 0.8), { p: [0, h / 2, 0], shadow: false });
    m.anim(lick.object, 'flame', { offset: o });
  }
  m.anim(stick.object, 'bob');
  // The nozzle at the front of the base, and the jet.
  m.add(G.cyl(0.05, 0.065, 0.08, 12), steel, { p: [0, 0.2, 0.26], r: [HALF_PI, 0, 0] });
  m.add(G.torus(0.05, 0.012, 6, 14), M.glow(NEON.orange), { p: [0, 0.2, 0.3], shadow: false });
  const jet = m.group({ p: [0, 0.2, 0.3], r: [HALF_PI, 0, 0] });
  jet.add(G.cone(0.05, 0.18, 8), M.energy(0xff5a1a, 0.85), { p: [0, 0.09, 0], shadow: false });
  jet.add(G.cone(0.025, 0.11, 6), M.glow(0xffe27a), { p: [0, 0.055, 0], shadow: false });
  m.anim(jet.object, 'flame');
  muzzle(m, 0, 0.2, 0.36);
}

function megaCabinet(m, c) {
  // The deluxe cabinet at the back of the arcade: gold trim, speakers, two
  // sticks, a crown on the marquee. When it fires, the screen fires.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.2 });
  const glow = M.glow(c.color);
  const { scr, panel } = cabinet(m, { w: 0.46, h: 0.78, d: 0.5, y0: 0.12, z: -0.04, body: M.paint(0x2a1450, { gloss: 0.85 }), edge: glow, marquee: M.glow(c.color, 0.95), screen: 0x0c0420 });
  // On the screen: a boss skull with a target over it.
  screenArt(m, scr, [
    'R.........R',
    '...WWWWW...',
    '..WWWWWWW..',
    '..WKKWKKW..',
    '..WWWKWWW..',
    '...WKWKW...',
    'R.........R'
  ], { W: M.glow(0xf4f2ff), K: M.glow(NEON.pink), R: M.glow(NEON.red) }, 0.03);
  // Control panel: two sticks, six buttons.
  for (const s of [-1, 1]) {
    joystick(m, [s * 0.14, panel.y, panel.z], s > 0 ? NEON.cyan : NEON.red, 1.1);
    for (let i = 0; i < 3; i++) button(m, [s * (0.02 + i * 0.035), panel.y, panel.z], [NEON.yellow, NEON.green, NEON.pink][i], 0.014, [0.32, 0, 0]);
  }
  // Speakers either side of the screen, and gold trim.
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.07, 0.22, 0.06, 0.02), body, { p: [s * 0.265, 0.62, 0.02] });
    for (const y of [0.56, 0.68]) {
      m.add(G.cyl(0.026, 0.026, 0.012, 14), BLACK(), { p: [s * 0.265, y, 0.054], r: [HALF_PI, 0, 0] });
      m.add(G.torus(0.026, 0.006, 5, 14), glow, { p: [s * 0.265, y, 0.06], shadow: false });
    }
  }
  // Pixel crown on the marquee.
  pixels(m, ['Y.Y.Y', 'YYYYY', 'YRYRY'], { Y: GOLD(), R: M.glow(NEON.red) }, { px: 0.035, d: 0.03, p: [0, 0.98, 0.06] });
  // An extra-life star hovering over it all.
  const star = m.add(G.star(0.07, 0.03, 0.02), M.glow(0xfff3a0), { p: [0, 1.06, 0.06], shadow: false });
  m.anim(star, 'float');
  muzzle(m, 0, scr.y, scr.z + 0.04);
}

const TOWERS = [lightgunTurret, laserSniper, coinPusher, pauseRay, clawGrabber, teslaBumper, flameJoystick, megaCabinet];

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

/** Two blocky legs that stride with the gait. */
function legs(m, mat, shoe, { x = 0.26, hip = -0.45, len = 0.36, w = 0.16, amp = 0.8 } = {}) {
  for (const s of [-1, 1]) {
    const g = part(m, { k: 'swing', ax: 'x', amp, ph: s > 0 ? 0 : Math.PI }, { p: [s * x, hip, 0] });
    g.add(G.box(w, len, w), mat, { p: [0, -len / 2, 0] });
    g.add(G.box(w * 1.3, w * 0.6, w * 1.7), shoe, { p: [0, -len - w * 0.2, w * 0.25] });
  }
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, outline, { y = 0.3, z = -0.1, hinge = 0.25 } = {}) {
  mat.side = THREE.DoubleSide;
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate(outline, 0.04);
    geo.rotateX(-HALF_PI);                         // outline +y becomes "towards the tail"
    if (s < 0) geo.scale(-1, 1, 1);
    return m.add(geo, mat, { p: [s * hinge, y, z], shadow: false });
  });
}

/**
 * A flickering flame. The animator overwrites a flame's X/Y scale, so the mesh
 * sits at scale 1 inside a holder that carries the creature's size.
 */
function flame(m, enemy, { p, r = [0, 0, 0], rad = 0.14, h = 0.5, color = 0xff8a1f, seg = 4 }) {
  const holder = m.group({ p, r });
  holder.object.scale.setScalar(m.scale);
  const geo = G.cone(rad, h, seg);
  geo.translate(0, h / 2, 0);
  const mesh = new THREE.Mesh(geo, M.energy(color, 0.9));
  holder.object.add(mesh);
  (enemy.flames = enemy.flames || []).push(mesh);
}

/** A stepped outline: pixel-art wings. [x, y] cells, built as stairs. */
const PIXEL_WING = [[0, -0.2], [0.3, -0.2], [0.3, -0.35], [0.6, -0.35], [0.6, -0.5], [0.9, -0.5], [0.9, -0.2], [1.1, -0.2], [1.1, 0.05], [0.8, 0.05], [0.8, 0.2], [0.5, 0.2], [0.5, 0.32], [0.2, 0.32], [0.2, 0.2], [0, 0.2]];
const BUG_WING = [[0, -0.12], [0.35, -0.3], [0.75, -0.3], [1.0, -0.12], [1.0, 0.12], [0.7, 0.3], [0.3, 0.26], [0, 0.12]];

function pixelGhost(m, enemy, c) {
  // A ghost from a cabinet nobody remembers the name of: horned, one huge
  // eye, a grin full of teeth, a three-point hem. All voxels.
  const sheet = M.paint(c.color, { gloss: 0.5, glow: 0.38 });
  const eye = M.glow(0xffffff);
  const pupil = M.glow(0x14082a);
  const mouth = M.glow(0x2a0838);
  const tooth = M.glow(0xffffff);
  const horn = M.paint(c.accent, { gloss: 0.6, glow: 0.5 });
  const art = [
    'H........H',
    'HH.SSSS.HH',
    '.SSSSSSSS.',
    'SSSSSSSSSS',
    'SSSEEEESSS',
    'SSEEEPPESS',
    'SSEEEPPESS',
    'SSSEEEESSS',
    'SSSSSSSSSS',
    'SMTMTMTMMS',
    'SSMMMMMMSS',
    'SSSSSSSSSS',
    'SSS.SS.SSS',
    'SS..SS..SS'
  ];
  pixels(m, art, {
    S: sheet, H: horn,
    E: [eye, 0.86, 0.02], P: [pupil, 0.9, 0.04],
    M: [mouth, 0.84, 0.01], T: [tooth, 0.86, 0.02]
  }, { px: 0.135, d: 0.8, p: [0, -0.02, 0] });
  // Stubby arms, flailing.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'z', amp: 0.5, f: 2, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.68, -0.05, 0.05] });
    arm.add(G.box(0.27, 0.135, 0.27), sheet, { p: [s * 0.13, 0, 0] });
    arm.add(G.box(0.135, 0.135, 0.2), sheet, { p: [s * 0.25, 0.13, 0] });
  }
  // A glow under it, to say it is floating.
  m.add(G.box(0.9, 0.02, 0.6), M.energy(c.color, 0.25), { p: [0, -1.0, 0], shadow: false });
}

function glitchGremlin(m, enemy, c) {
  // A gremlin that chewed through a power cable: purple, bat-eared, its
  // outline tearing into cyan and magenta copies, sparks off its ears.
  const hide = M.paint(c.color, { gloss: 0.5, glow: 0.22 });
  const spark = c.accent;
  const art = [
    'G..........G',
    'GG........GG',
    'GGG.GGGG.GGG',
    '.GGGGGGGGGG.',
    '..GYYGGYYG..',
    '..GYKGGKYG..',
    '..GGGGGGGG..',
    '..GWMWMWMG..',
    '..GMWMWMWG..',
    '...GGGGGG...',
    '..GGGGGGGG..',
    '..GGGGGGGG..'
  ];
  const pal = {
    G: hide,
    Y: [M.glow(spark), 0.74, 0.02], K: [M.glow(0x120018), 0.78, 0.04],
    W: [M.glow(0xffffff), 0.74, 0.02], M: [M.glow(0x2a0010), 0.72, 0.01]
  };
  pixels(m, art, pal, { px: 0.13, d: 0.7, p: [0, 0.1, 0] });
  // The glitch: torn copies of its silhouette in the two RGB-split colours,
  // jittering left and right of it.
  for (const [col, s, f] of [[NEON.cyan, -1, 23], [NEON.pink, 1, 19]]) {
    const ghost = part(m, { k: 'sway', ax: 'y', amp: 0.09, f, ph: s }, { p: [s * 0.05, 0.1, -0.02] });
    pixels(ghost, art.map((row, j) => (j % 3 === 1 ? row : row.replace(/[A-Z]/g, ch => (j % 2 ? ch : '.')))), { ...Object.fromEntries('GYKWM'.split('').map(k => [k, M.energy(col, 0.16)])) }, { px: 0.13, d: 0.74 });
  }
  // Scanline tears across the body.
  for (const [y, w, x] of [[0.25, 1.1, 0.18], [-0.2, 0.8, -0.2]]) {
    const tear = part(m, { k: 'sway', ax: 'y', amp: 0.25, f: 31, ph: y * 9 }, { p: [x, y, 0] });
    tear.add(G.box(w, 0.035, 0.76), M.energy(0xffffff, 0.3), { shadow: false });
  }
  // Clawed arms.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.9, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.58, -0.25, 0.05] });
    arm.add(G.box(0.13, 0.32, 0.13), hide, { p: [0, -0.12, 0.05], r: [0.4, 0, 0] });
    for (const dx of [-0.04, 0.04]) arm.add(G.box(0.04, 0.1, 0.04), M.glow(0xffffff), { p: [dx, -0.3, 0.16], shadow: false });
  }
  legs(m, hide, M.paint(0x2a1450, { gloss: 0.6 }), { x: 0.2, hip: -0.62, len: 0.22, w: 0.15 });
  // Sparks: off both ear tips and the crown of the head.
  flame(m, enemy, { p: [-0.72, 0.85, 0], r: [0, 0, 0.5], rad: 0.09, h: 0.4, color: spark });
  flame(m, enemy, { p: [0.72, 0.85, 0], r: [0, 0, -0.5], rad: 0.09, h: 0.4, color: spark });
  flame(m, enemy, { p: [0, 0.68, -0.1], rad: 0.13, h: 0.5, color: NEON.cyan });
}

function saucerBug(m, enemy, c) {
  // A beetle that learned to fly by stealing a flying saucer: chunky stepped
  // hull, a lamp ring that chases round, a glass dome with the pilot in it,
  // compound eyes on the bow and six legs dangling.
  const hull = M.paint(c.color, { gloss: 0.8, glow: 0.25 });
  const under = M.paint(0x1c2a3a, { gloss: 0.7 });
  m.add(G.cyl(0.55, 0.92, 0.18, 8), hull, { p: [0, 0.02, 0], r: [0, Math.PI / 8, 0] });
  m.add(G.cyl(0.92, 0.7, 0.14, 8), under, { p: [0, -0.14, 0], r: [0, Math.PI / 8, 0] });
  m.add(G.cyl(0.36, 0.5, 0.12, 8), hull, { p: [0, 0.16, 0], r: [0, Math.PI / 8, 0] });
  m.add(G.cyl(0.42, 0.34, 0.1, 8), M.glow(c.accent), { p: [0, -0.26, 0], r: [0, Math.PI / 8, 0], shadow: false });
  // The lamp ring, chasing.
  const lamps = part(m, { k: 'spin', ax: 'y', sp: 2.6 }, { p: [0, 0.02, 0] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    lamps.add(G.box(0.12, 0.08, 0.12), M.glow(i % 2 ? NEON.yellow : c.accent), { p: [Math.sin(a) * 0.86, 0, Math.cos(a) * 0.86], r: [0, a, 0], shadow: false });
  }
  // The dome and its pilot: a blocky bug head with feelers.
  m.add(G.dome(0.4, 16), M.glass(0xcff8ff, 0.32), { p: [0, 0.22, 0] });
  pixels(m, ['A...A', '.A.A.', 'BBBBB', 'BRBRB', 'BBBBB'], { A: M.glow(c.accent), B: M.paint(0x2a6a2a, { glow: 0.3 }), R: [M.glow(NEON.red), 0.2, 0.01] }, { px: 0.09, d: 0.18, p: [0, 0.42, 0.05] });
  // Compound eyes on the bow, mandibles below.
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.17, 8, 6), M.glow(NEON.red), { p: [s * 0.3, 0.02, 0.78], s: [1, 0.8, 0.7], shadow: false });
    m.add(G.sphere(0.07, 6, 5), M.glow(0xffffff), { p: [s * 0.34, 0.08, 0.88], shadow: false });
    m.add(G.box(0.07, 0.07, 0.3), under, { p: [s * 0.14, -0.16, 0.86], r: [0, -s * 0.5, 0] });
  }
  // Six legs hanging under the hull.
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const leg = part(m, { k: 'swing', ax: 'z', amp: 0.25, f: 1.5, ph: i * 2 + (s > 0 ? 0 : 1) }, { p: [s * 0.4, -0.2, -0.3 + i * 0.3] });
    leg.add(G.tube([[0, 0, 0], [s * 0.2, -0.2, 0], [s * 0.18, -0.6, 0.05]], 0.04, 4), under);
    leg.add(G.box(0.08, 0.08, 0.08), M.glow(c.color), { p: [s * 0.18, -0.62, 0.05], shadow: false });
  }
  wings(m, enemy, M.energy(0xbfffd0, 0.4), BUG_WING, { y: 0.28, z: -0.25, hinge: 0.3 });
}

function tankCartridge(m, enemy, c) {
  // A game cartridge that put on armour: grooved grey shell, a label for a
  // tank game, a visor slit for eyes, a cannon on its shoulder and tracks for
  // feet. The gold contacts show at the hem.
  const shell = M.paint(c.color, { gloss: 0.45, glow: 0.08 });
  const armour = M.metal(0x5a6070, { rough: 0.4 });
  const label = M.paint(c.accent, { gloss: 0.6, glow: 0.3 });
  m.add(G.rbox(1.24, 1.26, 0.5, 0.06), shell, { p: [0, 0.02, 0] });
  // The grip ridges along the top.
  for (let i = 0; i < 3; i++) m.add(G.box(1.1, 0.035, 0.52), M.paint(0x6c7184, { gloss: 0.4 }), { p: [0, 0.54 - i * 0.07, 0] });
  // The label: a stripe, a pixel tank on it, a visor across the top.
  m.add(G.rbox(1.0, 0.72, 0.04, 0.02), label, { p: [0, -0.1, 0.26] });
  m.add(G.box(1.0, 0.1, 0.045), M.glow(0x1a0a20), { p: [0, 0.16, 0.262], shadow: false });
  for (const s of [-1, 1]) m.add(G.box(0.22, 0.07, 0.05), M.glow(NEON.yellow), { p: [s * 0.22, 0.16, 0.27], shadow: false });
  pixels(m, ['...KK.KKKK', '..KKKK....', 'KKKKKKKK..', 'K.K.K.K...'], { K: M.glow(0x1a0a20) }, { px: 0.06, d: 0.012, p: [0.05, -0.24, 0.285] });
  for (let i = 0; i < 3; i++) m.add(G.box(0.18, 0.04, 0.045), M.glow(0xffffff), { p: [-0.3 + i * 0.3, -0.44, 0.262], shadow: false });
  // Contacts at the hem.
  for (let i = 0; i < 9; i++) m.add(G.box(0.07, 0.08, 0.02), GOLD(), { p: [-0.48 + i * 0.12, -0.54, 0.258] });
  // Armour plates bolted to the sides, and a shoulder cannon.
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.14, 0.9, 0.64, 0.03), armour, { p: [s * 0.68, 0.0, 0] });
    for (const y of [-0.3, 0, 0.3]) m.add(G.cyl(0.035, 0.035, 0.03, 8), CHROME(), { p: [s * 0.76, y, 0.2], r: [0, 0, HALF_PI] });
  }
  const gun = part(m, { k: 'sway', ax: 'y', amp: 0.3, f: 1.3 }, { p: [0.36, 0.72, -0.05] });
  gun.add(G.rbox(0.34, 0.18, 0.34, 0.03), armour);
  gun.add(G.cyl(0.05, 0.05, 0.5, 10), M.metal(0x3b4048, { rough: 0.4 }), { p: [0, 0.02, 0.3], r: [HALF_PI, 0, 0] });
  gun.add(G.cyl(0.07, 0.07, 0.06, 10), BLACK(), { p: [0, 0.02, 0.55], r: [HALF_PI, 0, 0] });
  // Track feet.
  for (const s of [-1, 1]) {
    const g = part(m, { k: 'swing', ax: 'x', amp: 0.35, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.36, -0.62, 0] });
    g.add(G.box(0.16, 0.14, 0.16), armour, { p: [0, -0.06, 0] });
    g.add(G.rbox(0.26, 0.2, 0.62, 0.08), BLACK(), { p: [0, -0.22, 0.04] });
    for (const z of [-0.18, 0.04, 0.26]) g.add(G.cyl(0.07, 0.07, 0.28, 10), armour, { p: [0, -0.22, z], r: [0, 0, HALF_PI] });
  }
}

function joystickNinja(m, enemy, c) {
  // A joystick that took up the martial arts: the base is its body, the ball
  // its head in a mask and headband, buttons for shoulder pads, a pixel
  // katana across its back and a shuriken in each hand.
  const base = M.paint(c.color, { gloss: 0.8, glow: 0.06 });
  const ball = M.paint(c.accent, { gloss: 0.9, glow: 0.3 });
  const sash = M.paint(c.accent, { gloss: 0.4, glow: 0.2 });
  m.add(G.rbox(0.74, 0.6, 0.56, 0.08), base, { p: [0, -0.22, 0] });
  m.add(G.rbox(0.66, 0.04, 0.5, 0.01), M.metal(0x9aa0b0, { rough: 0.3 }), { p: [0, 0.09, 0] });
  m.add(G.box(0.76, 0.1, 0.58), sash, { p: [0, -0.36, 0] });                      // the belt
  m.add(G.box(0.14, 0.24, 0.04), sash, { p: [0.2, -0.5, 0.3], r: [0, 0, 0.2] });
  for (const s of [-1, 1]) button(m, [s * 0.36, 0.08, 0], s > 0 ? NEON.cyan : NEON.yellow, 0.14, [0, 0, -s * 0.4]);
  // The neck: a dust boot and a chrome stick.
  m.add(G.lathe([[0.18, 0], [0.16, 0.05], [0.08, 0.12], [0, 0.12]], 14), BLACK(), { p: [0, 0.1, 0] });
  m.add(G.cyl(0.06, 0.06, 0.24, 10), CHROME(), { p: [0, 0.3, 0] });
  // The head, masked: only a white slit of eyes shows; a headband with tails.
  const cloth = M.paint(0x15141c, { gloss: 0.35 });
  m.add(G.sphere(0.36, 18, 14), ball, { p: [0, 0.6, 0] });
  m.add(G.sphere(0.368, 18, 12), cloth, { p: [0, 0.5, 0.005], s: [1, 0.55, 1] });          // the mask, over the lower face
  for (const s of [-1, 1]) m.add(G.box(0.12, 0.045, 0.04), M.glow(0xffffff), { p: [s * 0.1, 0.67, 0.34], r: [0, s * 0.3, -s * 0.22], shadow: false });
  m.add(G.torus(0.31, 0.045, 6, 22), cloth, { p: [0, 0.78, 0], r: [HALF_PI, 0, 0] });
  m.add(G.rbox(0.16, 0.08, 0.03, 0.01), M.paint(0xc8d0e0, { gloss: 0.9, glow: 0.2 }), { p: [0, 0.79, 0.33], r: [-0.4, 0, 0] });
  for (const s of [-1, 1]) {
    const tail = part(m, { k: 'sway', ax: 'y', amp: 0.3, f: 6, ph: s }, { p: [s * 0.06, 0.78, -0.3] });
    tail.add(G.box(0.07, 0.04, 0.4), sash, { p: [s * 0.05, -0.05, -0.18], r: [0.3, s * 0.25, 0] });
  }
  // The katana on its back.
  pixels(m, ['.......WW', '......WW.', '.....WW..', '....WW...', '...WW....', '.YYY.....', 'BB.Y.....', 'B........'], { W: M.metal(0xe6eef8, { rough: 0.15 }), Y: GOLD(), B: BLACK() }, { px: 0.11, d: 0.06, p: [0, 0.0, -0.34], r: [0, Math.PI, 0] });
  // Arms with a shuriken each.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.8, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.46, -0.05, 0.05] });
    arm.add(G.box(0.14, 0.36, 0.14), base, { p: [s * 0.04, -0.16, 0.06], r: [0.5, 0, s * 0.2] });
    arm.add(G.box(0.16, 0.14, 0.16), sash, { p: [s * 0.08, -0.32, 0.18] });
    arm.add(G.star(0.16, 0.05, 0.03, 4), M.metal(0xe6eef8, { rough: 0.15 }), { p: [s * 0.08, -0.32, 0.3], r: [0, 0, 0.4] });
  }
  legs(m, base, sash, { x: 0.2, hip: -0.5, len: 0.34, w: 0.15, amp: 0.9 });
}

function fireballSprite(m, enemy, c) {
  // A fireball that leapt out of its game: a ball of voxels, white-hot at the
  // front, red at the back, a tail of embers, pixel wings, and an expression.
  const core = M.paint(c.accent, { gloss: 0.4, glow: 0.85 });
  const hot = M.paint(0xff9a1a, { gloss: 0.4, glow: 0.8 });
  const mid = M.paint(c.color, { gloss: 0.4, glow: 0.7 });
  const outer = M.paint(0xc8140a, { gloss: 0.4, glow: 0.6 });
  const v = 0.2;
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) {
    const d = Math.hypot(i, j, k);
    if (d > 3.3 || d < 2.2) continue;                     // a shell: the inside is never seen
    const mat = k >= 2 ? core : k >= 1 ? hot : k >= -1 ? mid : outer;
    m.add(G.box(v, v, v), mat, { p: [i * v, j * v, k * v], shadow: false });
  }
  // The tail: shrinking cubes trailing back and up.
  [[0, 0.1, -0.78, 0.32, mid], [0.08, 0.22, -1.0, 0.25, outer], [-0.05, 0.34, -1.18, 0.18, outer], [0.03, 0.46, -1.32, 0.12, outer]].forEach(([x, y, z, s, mat]) => {
    m.add(G.box(s, s, s), mat, { p: [x, y, z], r: [0.3, 0.5, 0.2], shadow: false });
  });
  // The face, on the white-hot front.
  for (const s of [-1, 1]) {
    m.add(G.box(0.16, 0.2, 0.04), M.glow(0x1a0505), { p: [s * 0.16, 0.1, 0.71], shadow: false });
    m.add(G.box(0.06, 0.06, 0.04), M.glow(0xffffff), { p: [s * 0.13, 0.15, 0.735], shadow: false });
    m.add(G.box(0.2, 0.05, 0.04), M.glow(0x1a0505), { p: [s * 0.17, 0.25, 0.71], r: [0, 0, s * 0.35], shadow: false });
  }
  m.add(G.box(0.3, 0.08, 0.04), M.glow(0x1a0505), { p: [0, -0.18, 0.71], shadow: false });
  m.add(G.box(0.1, 0.08, 0.04), M.glow(0x1a0505), { p: [0, -0.12, 0.71], shadow: false });
  wings(m, enemy, M.paint(0xffb02a, { gloss: 0.5, glow: 0.55 }), PIXEL_WING, { y: 0.2, z: -0.05, hinge: 0.6 });
  flame(m, enemy, { p: [0, 0.1, -0.6], r: [-HALF_PI - 0.4, 0, 0], rad: 0.24, h: 0.7 });
  flame(m, enemy, { p: [0, 0.5, -0.2], r: [-0.6, 0, 0], rad: 0.16, h: 0.45, color: 0xffd23a });
}

/** The boss's scoreboard: a strip of digits that scrolls forever (browser only). */
let scoreTex = null;
function scoreTexture() {
  if (scoreTex || typeof document === 'undefined') return scoreTex;
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#07020f';
  ctx.fillRect(0, 0, 512, 64);
  ctx.font = '900 40px "Courier New", Courier, monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  // Two copies, so a half-width window can scroll round without a seam.
  for (const x of [128, 384]) {
    ctx.fillStyle = '#ff3df0';
    ctx.fillText('HI', x - 88, 34);
    ctx.fillStyle = '#ffe23a';
    ctx.fillText('9999990', x + 26, 34);
  }
  scoreTex = new THREE.CanvasTexture(cv);
  scoreTex.wrapS = THREE.RepeatWrapping;
  scoreTex.repeat.set(0.5, 1);
  scoreTex.encoding = THREE.sRGBEncoding;
  const tick = () => {
    scoreTex.offset.x = (performance.now() / 6000) % 1;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return scoreTex;
}

function highScore(m, enemy, c) {
  // The machine that ate the leaderboard: a giant pixel skull, half robot,
  // chomping, its record score rolling across its forehead, a pixel crown on
  // top and bits of itself glitching loose. It floats on two jets.
  const bone = M.paint(c.color, { gloss: 0.55, glow: 0.16 });
  const socket = M.glow(0x14061f);
  const eye = M.glow(c.accent);
  const steel = M.paint(0x4a5478, { gloss: 0.7, glow: 0.08 });
  const px = 0.125, d = 1.15;
  pixels(m, [
    '....SSSSSS....',
    '..SSSSSSSSSS..',
    '.SSSSSSSSSSSS.',
    'SSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSS',
    'SSEEEESSEEEESS',
    'SSERRESSERRESS',
    'SSERRESSERRESS',
    'SSEEEESSEEEESS',
    'SSSSSSNNSSSSSS',
    '.SSSSNNNNSSSS.',
    '..SSSSSSSSSS..'
  ], {
    S: bone, N: [socket, d + 0.02, 0.01],
    E: [socket, d + 0.02, 0.01], R: [eye, d + 0.06, 0.03]
  }, { px, d, p: [0, 0.22, 0] });
  // The jaw, chomping on its own hinge.
  const jaw = part(m, { k: 'swing', ax: 'x', amp: 0.22, f: 2 }, { p: [0, -0.5, -0.4] });
  pixels(jaw, ['..TKTKTTKTKT..', '..SSSSSSSSSS..', '...SSSSSSSS...'], { S: bone, T: M.glow(0xffffff), K: socket }, { px, d: d * 0.9, p: [0, -0.22, 0.4] });
  // Robot half: steel plates over the back of the skull, bolts at the
  // temples, an antenna, cables hanging off the back.
  m.add(G.rbox(1.82, 0.9, 0.5, 0.05), steel, { p: [0, 0.4, -0.42] });
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.1, 0.1, 0.1, 6), steel, { p: [s * 0.92, 0.1, 0.1], r: [0, 0, HALF_PI] });
    m.add(G.cyl(0.05, 0.05, 0.14, 6), M.glow(NEON.cyan), { p: [s * 0.94, 0.1, 0.1], r: [0, 0, HALF_PI], shadow: false });
    m.add(G.tube([[s * 0.6, 0.0, -0.66], [s * 0.7, -0.4, -0.8], [s * 0.5, -0.8, -0.7]], 0.04, 5), BLACK());
  }
  m.add(G.cyl(0.02, 0.02, 0.4, 6), steel, { p: [0.55, 1.1, -0.3] });
  part(m, { k: 'pulse', f: 6, amp: 0.4 }, { p: [0.55, 1.32, -0.3] }).add(G.sphere(0.06, 8, 6), M.glow(NEON.red), { shadow: false });
  // The scoreboard across the forehead.
  m.add(G.rbox(1.02, 0.3, 0.06, 0.02), BLACK(), { p: [0, 0.62, d / 2 + 0.03] });
  const tex = scoreTexture();
  m.add(new THREE.PlaneGeometry(0.92, 0.22), tex ? new THREE.MeshBasicMaterial({ map: tex }) : M.glow(NEON.yellow), { p: [0, 0.62, d / 2 + 0.065], shadow: false });
  // A pixel crown, with its gem.
  pixels(m, ['Y..Y..Y', 'YY.Y.YY', 'YYYYYYY'], { Y: M.paint(0xffc928, { gloss: 0.8, glow: 0.45 }) }, { px: 0.1, d: 0.3, p: [0, 1.17, 0.05] });
  const holder = m.group({ p: [0, 1.2, 0.2] });
  holder.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), M.glow(c.accent));
  holder.object.add(enemy.crownGem);
  // Pieces glitching off it.
  [[-1.05, 0.55, 0.2, NEON.cyan, 7], [1.08, -0.2, 0.3, NEON.pink, 9], [-0.95, -0.35, -0.2, NEON.yellow, 11], [0.95, 0.75, -0.1, NEON.cyan, 13]].forEach(([x, y, z, col, f]) => {
    const bit = part(m, { k: 'pulse', f, amp: 0.6, ph: x }, { p: [x, y, z] });
    bit.add(G.box(0.14, 0.14, 0.14), M.energy(col, 0.8), { shadow: false });
  });
  // The jets it hovers on.
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.1, 0.14, 0.18, 8), steel, { p: [s * 0.72, -0.5, -0.3] });
    flame(m, enemy, { p: [s * 0.72, -0.58, -0.3], r: [Math.PI, 0, 0], rad: 0.12, h: 0.36, color: NEON.cyan });
  }
}

/** One wobbly voxel slime: a dome of cubes with two eyes, centred on `p`. */
function blobBody(m, { p = [0, 0, 0], px = 0.13, body, shine, eyeY = 0 }) {
  pixels(m, [
    '...BBBB...',
    '.BBWBBBBB.',
    'BBWBBBBBBB',
    'BBBEEBEEBB',
    'BBBEKBEKBB',
    'BBBBBBBBBB',
    'BBBBMMBBBB',
    '.BBBBBBBB.'
  ], {
    B: body, W: [shine, px * 7.4, 0.01],
    E: [M.glow(0xffffff), px * 7.4, 0.01], K: [M.glow(0x14082a), px * 7.6, 0.02], M: [M.glow(0x2a0838), px * 7.3, 0.005]
  }, { px, d: px * 7, p: [p[0], p[1] + eyeY, p[2]] });
}

function pixelMite(m, c) {
  // A single escaped pixel: one wobbling voxel slime with stubby feet.
  const body = M.paint(c.color, { gloss: 0.7, glow: 0.4 });
  blobBody(m, { p: [0, -0.25, 0], px: 0.17, body, shine: M.glow(0xffffff) });
  legs(m, body, M.paint(c.accent, { gloss: 0.6, glow: 0.4 }), { x: 0.4, hip: -0.8, len: 0.08, w: 0.18, amp: 1 });
}

function pixelBlob(m, enemy, c) {
  // A slime made of three smaller slimes stuck together, glowing seams
  // between them: knock it down and it falls apart into the three.
  if (enemy.mini) return pixelMite(m, c);
  const body = M.paint(c.color, { gloss: 0.7, glow: 0.38 });
  const shine = M.glow(0xffffff);
  const seam = M.energy(c.accent, 0.85);
  blobBody(m, { p: [-0.5, -0.5, 0.05], px: 0.11, body, shine });
  blobBody(m, { p: [0.5, -0.5, 0.05], px: 0.11, body, shine });
  blobBody(m, { p: [0, 0.36, 0], px: 0.12, body: M.paint(c.color, { gloss: 0.7, glow: 0.55 }), shine });
  // The seams: glowing cracks where the three pieces meet, standing proud
  // of the slime so they read from every side.
  m.add(G.box(0.12, 0.86, 1.0), seam, { p: [0, -0.52, 0.02], shadow: false });
  m.add(G.box(1.6, 0.12, 1.0), seam, { p: [0, -0.08, 0.02], shadow: false });
  for (const x of [-0.3, 0.3]) m.add(G.box(0.12, 0.12, 1.02), M.glow(0xffffff), { p: [x, -0.08, 0.02], shadow: false });
  // Drips of slime along the base, and a glitch pixel flying off the top.
  for (const x of [-0.8, -0.1, 0.6]) m.add(G.box(0.11, 0.18, 0.11), body, { p: [x, -0.98, 0.3] });
  const bit = part(m, { k: 'pulse', f: 8, amp: 0.5, ph: 0 }, { p: [0.55, 0.85, 0] });
  bit.add(G.box(0.14, 0.14, 0.14), M.energy(c.accent, 0.9), { shadow: false });
}

function barrierBot(m, enemy, c) {
  // A blocky security robot that pushes a glowing barrier panel in front of
  // it, a projector dish on its head keeping the field lit.
  const shell = M.paint(c.color, { gloss: 0.8, glow: 0.2 });
  const dark = M.paint(0x1a1236, { gloss: 0.7 });
  const field = M.energy(c.accent, 0.42);
  field.side = THREE.DoubleSide;
  m.add(G.rbox(0.9, 0.8, 0.7, 0.08), shell, { p: [0, -0.15, -0.15] });
  m.add(G.rbox(0.6, 0.42, 0.5, 0.06), shell, { p: [0, 0.48, -0.2] });                                // head
  m.add(G.box(0.48, 0.12, 0.04), dark, { p: [0, 0.5, 0.06] });
  for (const s of [-1, 1]) m.add(G.box(0.12, 0.08, 0.05), M.glow(NEON.yellow), { p: [s * 0.12, 0.5, 0.08], shadow: false });
  // The projector dish on top.
  m.add(G.cyl(0.04, 0.04, 0.18, 8), CHROME(), { p: [0, 0.78, -0.2] });
  const dish = part(m, { k: 'spin', ax: 'y', sp: 2 }, { p: [0, 0.9, -0.2] });
  dish.add(G.cyl(0.24, 0.06, 0.1, 10), CHROME());
  dish.add(G.sphere(0.07, 8, 6), M.glow(c.accent), { p: [0, 0.07, 0], shadow: false });
  // Chest lights and a hazard stripe.
  for (let i = 0; i < 4; i++) m.add(G.box(0.12, 0.12, 0.04), M.glow(i % 2 ? NEON.yellow : 0x1a1236), { p: [-0.27 + i * 0.18, -0.4, 0.21], shadow: false });
  // The barrier: a chrome frame holding a pane of light, pixel grid on it.
  const shield = part(m, { k: 'swing', ax: 'x', amp: 0.08, ph: 0 }, { p: [0, -0.1, 0.6] });
  shield.add(G.box(1.5, 1.3, 0.04), field, { shadow: false });
  for (const s of [-1, 1]) {
    shield.add(G.box(0.1, 1.42, 0.12), CHROME(), { p: [s * 0.78, 0, 0] });
    shield.add(G.box(1.66, 0.1, 0.12), CHROME(), { p: [0, s * 0.68, 0] });
  }
  for (const x of [-0.375, 0, 0.375]) shield.add(G.box(0.02, 1.3, 0.05), M.glow(c.accent), { p: [x, 0, 0], shadow: false });
  for (const y of [-0.32, 0.32]) shield.add(G.box(1.5, 0.02, 0.05), M.glow(c.accent), { p: [0, y, 0], shadow: false });
  // Arms out to the frame.
  for (const s of [-1, 1]) {
    m.add(G.box(0.14, 0.14, 0.7), dark, { p: [s * 0.5, 0.0, 0.25] });
    m.add(G.box(0.2, 0.2, 0.2), shell, { p: [s * 0.52, 0.0, -0.05] });
  }
  // Treads.
  for (const s of [-1, 1]) {
    const g = part(m, { k: 'swing', ax: 'x', amp: 0.3, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.32, -0.58, -0.15] });
    g.add(G.rbox(0.26, 0.3, 0.74, 0.08), BLACK(), { p: [0, -0.24, 0.02] });
    for (const z of [-0.22, 0.02, 0.26]) g.add(G.cyl(0.08, 0.08, 0.28, 8), CHROME(), { p: [0, -0.24, z], r: [0, 0, HALF_PI] });
  }
}

function medBot(m, enemy, c) {
  // A round little nurse robot: a screen face showing a green pixel cross, a
  // flashing beacon on top and a repair wand in each claw.
  const shell = M.paint(c.color, { gloss: 0.85, glow: 0.2 });
  const trimMat = M.paint(c.accent, { gloss: 0.6, glow: 0.45 });
  const heal = M.glow(c.accent);
  m.add(G.capsule(0.55, 1.4, 18), shell, { p: [0, -0.86, -0.05], s: [1, 1, 0.9] });
  m.add(G.torus(0.55, 0.05, 6, 20), trimMat, { p: [0, -0.3, -0.05], r: [HALF_PI, 0, 0] });
  // The screen and the pixel cross on it.
  m.add(G.rbox(0.86, 0.66, 0.08, 0.06), M.paint(0x0a1630, { gloss: 0.9 }), { p: [0, 0.1, 0.46] });
  pixels(m, ['..GG..', '..GG..', 'GGGGGG', 'GGGGGG', '..GG..', '..GG..'], { G: heal }, { px: 0.085, d: 0.02, p: [0, 0.1, 0.51] });
  // Eyes in the screen's top corners.
  for (const s of [-1, 1]) m.add(G.box(0.08, 0.08, 0.02), M.glow(0xffffff), { p: [s * 0.33, 0.33, 0.51], shadow: false });
  // The beacon, pulsing.
  m.add(G.cyl(0.12, 0.14, 0.08, 10), CHROME(), { p: [0, 0.58, -0.05] });
  const beacon = part(m, { k: 'pulse', f: 4, amp: 0.35 }, { p: [0, 0.72, -0.05] });
  beacon.add(G.box(0.2, 0.2, 0.2), M.glow(c.accent), { shadow: false });
  beacon.add(G.box(0.36, 0.36, 0.36), M.energy(c.accent, 0.3), { shadow: false });
  // Arms with repair wands.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.4, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.58, -0.1, 0] });
    arm.add(G.box(0.12, 0.12, 0.36), CHROME(), { p: [s * 0.05, -0.05, 0.16] });
    arm.add(G.cyl(0.04, 0.04, 0.34, 8), M.paint(0xffffff, { gloss: 0.8 }), { p: [s * 0.05, 0.1, 0.34] });
    arm.add(G.box(0.12, 0.12, 0.12), heal, { p: [s * 0.05, 0.3, 0.34], shadow: false });
  }
  // Rolling on a single caster wheel.
  m.add(G.box(0.3, 0.16, 0.3), M.paint(0x1a1236, { gloss: 0.7 }), { p: [0, -0.84, 0] });
  const wheel = part(m, { k: 'roll', rad: 0.12 }, { p: [0, -0.88, 0] });
  wheel.add(G.cyl(0.12, 0.12, 0.2, 10), BLACK(), { r: [0, 0, HALF_PI] });
}

const ENEMIES = {
  SPLITTER: pixelBlob,
  SHIELDER: barrierBot,
  HEALER: medBot,
  SWARM: pixelGhost,
  FIRE: glitchGremlin,
  FLYING: saucerBug,
  ARMORED: tankCartridge,
  ELITE: joystickNinja,
  FLYING_FIRE: fireballSprite,
  BOSS: highScore
};

// ── Arena ───────────────────────────────────────────────────────────────────

/**
 * Seamless 512px tile: midnight carpet with the classic neon confetti —
 * squiggles, triangles, rings, bolts and dots. Everything is drawn nine times
 * (once per neighbouring tile) so shapes that cross an edge wrap cleanly.
 */
function paintFloor(ctx, size) {
  ctx.fillStyle = '#221a46';
  ctx.fillRect(0, 0, size, size);
  // Pile texture: fine dark and light flecks.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(10, 4, 30, 0.22)' : 'rgba(150, 130, 220, 0.1)';
    ctx.fillRect(rnd() * size, rnd() * size, 2, 2);
  }
  const colours = ['#ff3df0', '#22e8ff', '#ffe23a', '#5dff6a', '#ff8a1f', '#a77bff'];
  const shapes = [];
  for (let i = 0; i < 46; i++) shapes.push({ x: rnd() * size, y: rnd() * size, a: rnd() * TAU, k: i % 6, c: colours[(i * 5) % colours.length], s: 12 + rnd() * 10 });
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
    for (const sh of shapes) {
      ctx.save();
      ctx.translate(sh.x + ox, sh.y + oy);
      ctx.rotate(sh.a);
      ctx.strokeStyle = ctx.fillStyle = sh.c;
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = 4;
      const s = sh.s;
      ctx.beginPath();
      switch (sh.k) {
        case 0: // squiggle
          ctx.moveTo(-s * 1.4, 0);
          for (let t = 1; t <= 6; t++) ctx.lineTo(-s * 1.4 + t * s * 0.47, t % 2 ? -s * 0.4 : s * 0.4);
          ctx.stroke();
          break;
        case 1: // triangle outline
          ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, s * 0.6); ctx.lineTo(-s * 0.9, s * 0.6); ctx.closePath();
          ctx.stroke();
          break;
        case 2: // ring
          ctx.arc(0, 0, s * 0.6, 0, TAU);
          ctx.stroke();
          break;
        case 3: // lightning bolt
          ctx.moveTo(-s * 0.3, -s); ctx.lineTo(s * 0.3, -s * 0.1); ctx.lineTo(-s * 0.2, 0); ctx.lineTo(s * 0.3, s);
          ctx.stroke();
          break;
        case 4: // crescent arc
          ctx.arc(0, 0, s * 0.8, 0.2, Math.PI - 0.2);
          ctx.stroke();
          break;
        default: // a scatter of dots
          for (const [dx, dy] of [[0, 0], [s * 0.6, s * 0.2], [-s * 0.4, s * 0.5]]) { ctx.moveTo(dx + 3.5, dy); ctx.arc(dx, dy, 3.5, 0, TAU); }
          ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // a mini cabinet, screen on
      const { scr } = cabinet(m, { w: 0.42, h: 0.8, d: 0.5, body: CASE(), edge: M.glow(NEON.pink), marquee: M.glow(NEON.cyan, 0.95), screen: 0x0a0a30 });
      screenArt(m, scr, ['.Y..Y.', 'YYYYYY', 'Y.YY.Y', '.Y..Y.'], { Y: M.glow(NEON.green) }, 0.04);
      break;
    }
    case 1: { // a gumball machine
      m.add(G.lathe([[0.2, 0], [0.22, 0.03], [0.14, 0.08], [0.1, 0.3], [0.16, 0.34], [0, 0.34]], 16), M.paint(0xd9263a, { gloss: 0.85, glow: 0.15 }), { p: [0, 0, 0] });
      m.add(G.rbox(0.08, 0.06, 0.02, 0.01), CHROME(), { p: [0, 0.22, 0.11] });
      m.add(G.sphere(0.22, 18, 14), M.glass(0xffffff, 0.28), { p: [0, 0.54, 0] });
      [[0.08, 0.45, 0.06, NEON.yellow], [-0.1, 0.46, -0.02, NEON.cyan], [0.02, 0.5, -0.1, NEON.green], [-0.04, 0.58, 0.08, NEON.pink], [0.1, 0.6, -0.04, NEON.orange], [-0.08, 0.64, -0.06, NEON.purple], [0.0, 0.42, 0.0, NEON.pink]]
        .forEach(([x, y, z, col]) => m.add(G.sphere(0.06, 8, 6), M.paint(col, { gloss: 0.9, glow: 0.35 }), { p: [x, y, z] }));
      m.add(G.cyl(0.08, 0.1, 0.06, 14), M.paint(0xd9263a, { gloss: 0.85 }), { p: [0, 0.78, 0] });
      break;
    }
    case 2: { // a ticket dispenser tower, a ribbon of tickets spilling out
      m.add(G.rbox(0.36, 0.66, 0.3, 0.04), CASE(), { p: [0, 0.33, 0] });
      m.add(G.rbox(0.3, 0.12, 0.02, 0.01), M.glow(0x07020f), { p: [0, 0.52, 0.152], shadow: false });
      for (let i = 0; i < 3; i++) m.add(G.box(0.05, 0.06, 0.01), M.glow(NEON.red), { p: [-0.08 + i * 0.08, 0.52, 0.165], shadow: false });
      m.add(G.box(0.38, 0.04, 0.32), M.glow(NEON.yellow), { p: [0, 0.68, 0], shadow: false });
      const tix = M.paint(0xffcf3a, { gloss: 0.4, glow: 0.25 });
      for (let i = 0; i < 6; i++) m.add(G.box(0.12, 0.006, 0.08), tix, { p: [0, 0.3 - i * 0.05, 0.19 + i * 0.03], r: [0.9 - i * 0.12, 0, 0] });
      m.add(G.box(0.12, 0.01, 0.3), tix, { p: [0.02, 0.006, 0.36], r: [0, 0.3, 0] });
      break;
    }
    case 3: { // a bin of plush prizes
      m.add(G.cyl(0.32, 0.28, 0.3, 8), M.paint(0x1c2a8a, { gloss: 0.6, glow: 0.1 }), { p: [0, 0.15, 0] });
      m.add(G.torus(0.32, 0.03, 6, 8), M.glow(NEON.cyan), { p: [0, 0.3, 0], r: [HALF_PI, 0, Math.PI / 8], shadow: false });
      [[0, 0.38, 0, 0xff8fc8], [0.15, 0.34, 0.1, 0x7fd8ff], [-0.14, 0.34, -0.08, 0xffe23a], [-0.1, 0.35, 0.14, 0x8dff7a], [0.12, 0.35, -0.14, 0xc9a6ff]].forEach(([x, y, z, col]) => {
        const fur = M.paint(col, { gloss: 0.2, glow: 0.15 });
        m.add(G.sphere(0.12, 10, 8), fur, { p: [x, y, z] });
        for (const s of [-1, 1]) m.add(G.sphere(0.04, 6, 5), fur, { p: [x + s * 0.08, y + 0.1, z] });
      });
      break;
    }
    default: { // a token stack and change machine
      m.add(G.rbox(0.4, 0.5, 0.3, 0.04), M.paint(0x8a93a8, { gloss: 0.7 }), { p: [0, 0.25, 0] });
      m.add(G.box(0.3, 0.08, 0.02), M.glow(NEON.green), { p: [0, 0.4, 0.152], shadow: false });
      m.add(G.rbox(0.2, 0.08, 0.06, 0.02), BLACK(), { p: [0, 0.12, 0.17] });
      for (let i = 0; i < 6; i++) m.add(G.cyl(0.06, 0.06, 0.02, 14), GOLD(), { p: [0.27, 0.01 + i * 0.022, 0.05] });
      m.add(G.cyl(0.06, 0.06, 0.02, 14), GOLD(), { p: [-0.26, 0.04, 0.12], r: [0.3, 0, 1.2] });
    }
  }
  return g;
}

/** A neon sign's face, drawn on a canvas (only ever called in the browser). */
function neonTexture(text, color, { w = 1024, h = 256, font = 150 } = {}) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#0a0618';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.font = `900 ${font}px "Courier New", Courier, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, h / 2 + 6);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = color;
  ctx.fillText(text, w / 2, h / 2 + 6);
  const tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  return tex;
}

/** A cabinet the size of a house, for the back wall, `art` on its screen. */
function bigCabinet(color, art, artColor) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  const { scr, panel } = cabinet(m, { w: 3.0, h: 7.2, d: 3.6, body: CASE(), edge: M.glow(color), marquee: M.glow(color, 0.95), screen: 0x06061c });
  screenArt(m, scr, art, { X: M.glow(artColor), W: M.glow(0xffffff) }, 0.24);
  joystick(m, [-0.6, panel.y, panel.z], NEON.red, 8);
  for (let i = 0; i < 3; i++) button(m, [0.1 + i * 0.36, panel.y, panel.z], [NEON.yellow, NEON.cyan, NEON.green][i], 0.13, [0.32, 0, 0]);
  return g;
}

/** Merge a scenery group's static meshes: it never moves. */
function bake(g) {
  shareEquivalentMaterials(g);
  bakeStaticMeshes(g);
  return g;
}

/**
 * Scenery outside the play area. Returns the objects it adds so the camera can
 * hide any that end up between it and the board.
 */
function buildSurround(scene, hw, hh) {
  const out = [];
  const place = (g, x, z, ry = 0) => { bake(g); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); out.push(g); return g; };

  // The back wall: a row of towering cabinets and the HIGH SCORE sign.
  // Attract-mode screens, all original: a rocket, a heart, a skull, a
  // diamond and a cat face.
  const ARTS = [
    [['...XX...', '..XXXX..', '..XWWX..', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', '...WW...', '..W..W..'], NEON.cyan],
    [['.XX..XX.', 'XXXXXXXX', 'XWXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...'], NEON.pink],
    [['..XXXX..', '.XXXXXX.', 'XX..X..X', 'XX..X..X', 'XXXXXXXX', '.XX..XX.', '.X.XX.X.'], 0xf4f2ff],
    [['..XXXX..', '.XWXXXX.', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...'], NEON.green],
    [['X......X', 'XX....XX', 'XXXXXXXX', 'X.XXXX.X', 'XXXWWXXX', '.XXXXXX.', '..X..X..'], NEON.yellow]
  ];
  const cabColours = [NEON.pink, NEON.cyan, NEON.yellow, NEON.green, NEON.purple];
  const row = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const cab = bigCabinet(cabColours[i], ARTS[i][0], ARTS[i][1]);
    cab.position.set((i - 2) * 3.6, 0, 0);
    row.add(cab);
  }
  let m = modeller(row, 1);
  m.add(G.box(19, 0.3, 0.3), M.glow(NEON.cyan), { p: [0, 0.15, 2.6], shadow: false });          // floor neon in front of them
  // The sign: a frame on two posts above the cabinets.
  for (const s of [-1, 1]) m.add(G.rbox(0.4, 13, 0.4, 0.08), CASE(), { p: [s * 7.4, 6.5, -2.3] });
  m.add(G.rbox(15.4, 3.4, 0.5, 0.15), CASE(), { p: [0, 11.6, -2.0] });
  m.add(new THREE.PlaneGeometry(14.6, 2.9), new THREE.MeshBasicMaterial({ map: neonTexture('HIGH SCORE', '#ff3df0'), fog: false }), { p: [0, 11.6, -1.73], shadow: false });
  for (const [y, col] of [[13.45, NEON.cyan], [9.75, NEON.pink]]) m.add(G.cyl(0.09, 0.09, 15.4, 8), M.glow(col), { p: [0, y, -1.7], r: [0, 0, HALF_PI], shadow: false });
  place(row, 0, -hh - 9.5);

  // A claw machine big enough to climb into, off the left side.
  const claw = new THREE.Group();
  m = modeller(claw, 1);
  m.add(G.rbox(4.2, 2.6, 4.2, 0.2), M.paint(0xff3df0, { gloss: 0.85, glow: 0.18 }), { p: [0, 1.3, 0] });
  m.add(G.box(4.0, 3.8, 4.0), GLASS(), { p: [0, 4.5, 0], shadow: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.box(0.2, 3.9, 0.2), M.glow(NEON.cyan), { p: [sx * 2.05, 4.5, sz * 2.05], shadow: false });
  m.add(G.rbox(4.4, 0.8, 4.4, 0.2), M.paint(0xff3df0, { gloss: 0.85, glow: 0.18 }), { p: [0, 6.8, 0] });
  m.add(new THREE.PlaneGeometry(3.8, 0.55), new THREE.MeshBasicMaterial({ map: neonTexture('PRIZE GRAB', '#22e8ff', { font: 140 }), fog: false }), { p: [2.22, 6.8, 0], r: [0, HALF_PI, 0], shadow: false });
  [[0.8, 0.7, 0xff8fc8], [-0.6, -0.4, 0x7fd8ff], [0.3, -1.1, 0xffe23a], [-1.1, 0.9, 0x8dff7a], [1.2, -0.5, 0xc9a6ff], [-0.2, 0.2, 0xff8a1f]].forEach(([x, z, col]) => {
    const fur = M.paint(col, { gloss: 0.2, glow: 0.15 });
    m.add(G.sphere(0.6, 12, 10), fur, { p: [x, 3.2, z] });
    m.add(G.sphere(0.45, 12, 10), fur, { p: [x, 3.95, z] });
    for (const s of [-1, 1]) m.add(G.sphere(0.16, 8, 6), fur, { p: [x + s * 0.3, 4.32, z] });
  });
  m.add(G.box(3.6, 0.15, 0.25), CHROME(), { p: [0, 6.2, 0] });
  m.add(G.cyl(0.03, 0.03, 1.0, 4), CHROME(), { p: [0.4, 5.7, 0] });
  m.add(G.cyl(0.25, 0.3, 0.3, 10), CHROME(), { p: [0.4, 5.15, 0] });
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3;
    m.add(G.tube([[0.4 + Math.sin(a) * 0.2, 5.0, Math.cos(a) * 0.2], [0.4 + Math.sin(a) * 0.55, 4.7, Math.cos(a) * 0.55], [0.4 + Math.sin(a) * 0.4, 4.3, Math.cos(a) * 0.4]], 0.06, 6), CHROME());
  }
  place(claw, -hw - 8, -hh * 0.25, 0.25);

  // An air-hockey table, near left.
  const air = new THREE.Group();
  m = modeller(air, 1);
  m.add(G.rbox(6.4, 0.5, 3.6, 0.15), CASE(), { p: [0, 2.2, 0] });
  m.add(G.box(6.0, 0.06, 3.2), M.paint(0xf4f6ff, { gloss: 0.9, glow: 0.18 }), { p: [0, 2.47, 0] });
  for (const s of [-1, 1]) m.add(G.box(6.4, 0.2, 0.15), M.glow(NEON.pink), { p: [0, 2.55, s * 1.74], shadow: false });
  for (const s of [-1, 1]) m.add(G.box(0.15, 0.2, 3.6), M.glow(NEON.cyan), { p: [s * 3.14, 2.55, 0], shadow: false });
  m.add(G.box(0.06, 0.02, 3.2), M.glow(NEON.red), { p: [0, 2.51, 0], shadow: false });
  m.add(G.torus(0.6, 0.04, 6, 24), M.glow(NEON.red), { p: [0, 2.51, 0], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.cyl(0.3, 0.3, 0.1, 18), M.paint(0xff2d55, { gloss: 0.8, glow: 0.4 }), { p: [0.8, 2.56, 0.4] });
  for (const [x, col] of [[-2.2, NEON.cyan], [2.4, NEON.yellow]]) {
    m.add(G.cyl(0.45, 0.5, 0.18, 18), M.paint(col, { gloss: 0.8, glow: 0.3 }), { p: [x, 2.6, -0.3] });
    m.add(G.cyl(0.18, 0.2, 0.4, 14), M.paint(col, { gloss: 0.8, glow: 0.3 }), { p: [x, 2.85, -0.3] });
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.rbox(0.4, 2.0, 0.4, 0.08), BLACK(), { p: [sx * 2.8, 1.0, sz * 1.4] });
  place(air, -hw - 7.5, hh * 0.9, 0.1);

  // Skee-ball lanes off the right side: three long ramps and their targets.
  const skee = new THREE.Group();
  m = modeller(skee, 1);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 2.4, col = [NEON.pink, NEON.yellow, NEON.cyan][i];
    const lane = m.group({ p: [x, 0, 0] });
    lane.add(G.plate([[-4, 0], [4, 0], [4, 4.6], [3.2, 4.6], [2.4, 2.0], [-4, 1.0]], 2.0), CASE(), { r: [0, -HALF_PI, 0] });
    lane.add(G.box(1.6, 0.05, 6.6), M.paint(0xc9894a, { gloss: 0.5 }), { p: [0, 1.52, -0.75], r: [-0.155, 0, 0] });
    for (const s of [-1, 1]) lane.add(G.box(0.08, 0.1, 6.6), M.glow(col), { p: [s * 1.0, 1.62, -0.75], r: [-0.155, 0, 0], shadow: false });
    for (const [r, y, z] of [[0.75, 2.8, 2.6], [0.5, 3.32, 2.76], [0.3, 3.96, 2.96]]) lane.add(G.torus(r, 0.06, 6, 20), M.glow(col), { p: [0, y, z], r: [0.3, 0, 0], shadow: false });
    lane.add(G.rbox(1.8, 1.0, 0.3, 0.08), CASE(), { p: [0, 5.2, 3.6] });
    lane.add(new THREE.PlaneGeometry(1.5, 0.7), M.glow(0x07020f), { p: [0, 5.2, 3.45], r: [0, Math.PI, 0], shadow: false });
    lane.add(G.sphere(0.26, 12, 10), M.paint(0xf4c46a, { gloss: 0.5 }), { p: [0.3, 1.3, -3.8] });
  }
  place(skee, hw + 8.5, -hh * 0.2, HALF_PI);

  // The prize counter, near right: a glass case of plush, a giant bear-blob
  // on top, the wall of prizes behind.
  const prize = new THREE.Group();
  m = modeller(prize, 1);
  m.add(G.rbox(7.0, 2.4, 2.0, 0.15), CASE(), { p: [0, 1.2, 0] });
  m.add(G.box(6.6, 1.6, 1.6), GLASS(), { p: [0, 3.2, 0], shadow: false });
  m.add(G.box(7.0, 0.12, 2.0), M.glow(NEON.yellow), { p: [0, 2.44, 0], shadow: false });
  m.add(G.box(7.0, 0.12, 2.0), M.glow(NEON.pink), { p: [0, 4.04, 0], shadow: false });
  for (let i = 0; i < 6; i++) {
    const col = [0xff8fc8, 0x7fd8ff, 0xffe23a, 0x8dff7a, 0xc9a6ff, 0xff8a1f][i];
    m.add(G.sphere(0.4, 10, 8), M.paint(col, { gloss: 0.2, glow: 0.15 }), { p: [-2.6 + i * 1.05, 2.95, 0.1] });
    m.add(G.star(0.3, 0.13, 0.08), M.glow(col), { p: [-2.6 + i * 1.05, 3.6, 0.2], shadow: false });
  }
  const blob = M.paint(0xff8fc8, { gloss: 0.25, glow: 0.2 });
  m.add(G.sphere(1.3, 18, 14), blob, { p: [1.6, 5.2, -0.1] });
  m.add(G.sphere(0.95, 18, 14), blob, { p: [1.6, 6.9, -0.1] });
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.35, 10, 8), blob, { p: [1.6 + s * 0.7, 7.6, -0.1] });
    m.add(G.sphere(0.14, 8, 6), M.glow(0x1a1020), { p: [1.6 + s * 0.32, 7.0, 0.76], shadow: false });
  }
  m.add(G.sphere(0.2, 8, 6), M.paint(0xffffff, { gloss: 0.4 }), { p: [1.6, 6.75, 0.85], s: [1.3, 0.8, 0.6] });
  m.add(G.rbox(8.0, 6.0, 0.4, 0.15), M.paint(0x241c48, { gloss: 0.5 }), { p: [0, 5.0, -2.4] });
  m.add(new THREE.PlaneGeometry(6.0, 1.3), new THREE.MeshBasicMaterial({ map: neonTexture('PRIZES', '#ffe23a', { font: 170 }), fog: false }), { p: [-0.8, 7.0, -2.18], shadow: false });
  place(prize, hw + 7, hh * 0.9, -0.5);

  return out;
}

// ── Projectiles ─────────────────────────────────────────────────────────────
//
// Units: 1 = a shot's radius, nose along +Z (see rendering/projectile-models.js).

const SHOTS = {
  pixelBolt(m, { color }) {
    // A light-gun round: a short train of glowing pixels, brightest at the nose.
    m.add(G.box(0.8, 0.8, 0.8), M.glow(0xffffff), { p: [0, 0, 0.9] });
    m.add(G.box(0.8, 0.8, 0.8), M.glow(color), { p: [0, 0, 0] });
    m.add(G.box(0.6, 0.6, 0.6), M.energy(color, 0.7), { p: [0, 0, -0.8], shadow: false });
    m.add(G.box(0.4, 0.4, 0.4), M.energy(color, 0.45), { p: [0, 0, -1.4], shadow: false });
  },
  arcadeToken(root) {
    // A gold arcade token off the pusher, star stamped on the face, flying
    // face-on to the camera.
    const m = root.group({ r: [0, HALF_PI, 0] });
    m.add(G.cyl(1.1, 1.1, 0.3, 20), GOLD(), { r: [HALF_PI, 0, 0] });
    m.add(G.torus(1.05, 0.1, 5, 20), M.paint(0xe09a10, { gloss: 0.9, glow: 0.3 }));
    for (const s of [-1, 1]) m.add(G.star(0.55, 0.22, 0.06), M.paint(0xfff0a0, { gloss: 0.9, glow: 0.5 }), { p: [0, 0, s * 0.16] });
  },
  pauseIcon(root) {
    // A pause symbol in a glowing ring, side-on so it reads from above.
    const m = root.group({ r: [0, HALF_PI, 0] });
    const glow = M.glow(0x7fd8ff);
    for (const s of [-1, 1]) m.add(G.box(0.36, 1.1, 0.2), M.glow(0xffffff), { p: [s * 0.3, 0, 0] });
    m.add(G.torus(1.0, 0.12, 6, 4, TAU), glow, { r: [0, 0, Math.PI / 4] });
    m.add(G.box(1.6, 1.6, 0.1), M.energy(0x7fd8ff, 0.25), { shadow: false });
  },
  craneClaw(m) {
    // The prize crane's claw, prongs first, cable trailing.
    m.add(G.cyl(0.45, 0.55, 0.6, 10), CHROME(), { r: [HALF_PI, 0, 0] });
    m.add(G.box(0.3, 0.3, 0.3), M.paint(0xff8a1f, { gloss: 0.8, glow: 0.4 }), { p: [0, 0, -0.45] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      const x = Math.cos(a), y = Math.sin(a);
      m.add(G.tube([[x * 0.3, y * 0.3, 0.2], [x * 0.9, y * 0.9, 0.8], [x * 0.4, y * 0.4, 1.4]], 0.12, 5), CHROME());
    }
    m.add(G.cyl(0.06, 0.06, 1.4, 5), BLACK(), { p: [0, 0, -1.2], r: [HALF_PI, 0, 0] });
  },
  pinball(m) {
    // A chrome pinball, crackling with the bumper's charge.
    m.add(G.sphere(0.95, 16, 12), M.metal(0xeef3f8, { rough: 0.08 }));
    m.add(G.sphere(0.3, 8, 6), M.glow(0xffffff), { p: [-0.35, 0.45, 0.55], shadow: false });
    m.add(G.sphere(1.25, 10, 8), M.energy(0xc9a6ff, 0.3), { shadow: false });
  },
  pixelFire(m) {
    // An 8-bit fireball: stacked cubes, white-hot nose, red tail.
    m.add(G.box(1.0, 1.0, 1.0), M.glow(0xffe27a), { p: [0, 0, 0.3] });
    m.add(G.box(0.5, 0.5, 0.5), M.glow(0xffffff), { p: [0, 0, 0.85] });
    for (const [x, y, z, k, col] of [[0.5, 0.3, -0.2, 0.6, 0xff8a1f], [-0.45, -0.3, -0.3, 0.6, 0xff8a1f], [0.2, -0.4, -0.8, 0.5, 0xff4a1a], [-0.2, 0.35, -1.0, 0.4, 0xff2d1a], [0, 0, -1.5, 0.3, 0xc8140a]]) {
      m.add(G.box(k, k, k), M.glow(col), { p: [x, y, z] });
    }
  },
  pixelStar(m) {
    // The extra-life star off the mega screen, in chunky pixels.
    pixels(m, [
      '....Y....',
      '...YYY...',
      'YYYYYYYYY',
      '.YYKYKYY.',
      '..YYYYY..',
      '.YYY.YYY.',
      'YY.....YY'
    ], { Y: M.paint(0xffc928, { gloss: 0.8, glow: 0.6 }), K: [M.glow(0x2a1450), 0.5, 0.02] }, { px: 0.3, d: 0.45, r: [0, HALF_PI, 0] });
  }
};

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0x45e8ff, accent: ctx.accent ?? 0xff3df0 });
  },

  /** Themed shot models: see rendering/projectile-models.js. */
  buildProjectile(name, m, ctx) {
    const build = SHOTS[name];
    if (!build) return false;
    build(m, ctx);
    return true;
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
