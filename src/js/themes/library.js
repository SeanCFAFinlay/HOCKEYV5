// HAUNTED LIBRARY
//
// The clock strikes midnight and the books leave the shelves. The arena is the
// floor of an old reading room: polished parquet, towering shelves, candles and
// green banker's lamps. The enemies are the collection itself — footnotes,
// matchbooks, paperbacks, encyclopedias, a ghost who still shushes, and a tome
// so overdue it grew teeth — and the towers are the library's own fittings,
// standing guard over the librarian's desk.
//
// Same three exports as the reference theme (kitchen.js): pack (names),
// visuals (look), kit (models). See js/themes/index.js for how they plug in.

import { G, M, modeller } from '../rendering/model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from '../rendering/geo-utils.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'library',
  name: 'Haunted Library',
  shortName: 'Library',
  icon: 'grimoire',
  sortOrder: 110,
  description: 'Midnight, and the books are leaving the shelves. Guard the librarian\'s desk before the whole collection walks out.',
  color: '#8f7bff',
  groundColor: 0x8a5a34,
  pathColor: 0x4a2c1a,
  envColor: 0x120d1c,
  environmentSkin: { arena: 'reading room', floor: 'parquet', markerIcon: '📚' },
  enemySkin: { body: 'book', icon: 'grimoire' },
  recommendedTowers: ['t1', 't4', 't7'],
  pressureType: 'mixed_lanes',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Bookmark Blades', icon: 'bookmark', clr: '#e0475a' },
    t2: { nm: 'Quill Sniper', icon: 'quill', clr: '#e8e2ff' },
    t3: { nm: 'Ink Bottle', icon: 'inkbottle', clr: '#6b5cff' },
    t4: { nm: 'Hush Owl', icon: 'hushowl', clr: '#b9a6ff' },
    t5: { nm: 'Lion Bookend', icon: 'bookend', clr: '#d9a441' },
    t6: { nm: 'Lightning Globe', icon: 'lampglobe', clr: '#5fe3d0' },
    t7: { nm: 'Candelabra', icon: 'candelabra', clr: '#ff8a3d' },
    t8: { nm: 'Overdue Stamp', icon: 'overduestamp', clr: '#ff4d6d' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Scuttling Footnote' },
    e2: { nm: 'Burning Matchbook' },
    e3: { nm: 'Flapping Paperback' },
    e4: { nm: 'Encyclopedia Golem' },
    e5: { nm: 'Shushing Spectre' },
    e6: { nm: 'Flaming Manuscript' },
    e7: { nm: 'The Overdue Tome' }
  },
  maps: [
    ['Late Return', 'One quiet aisle - learn the basics'],
    ['Reading Room', 'Open floor, two ways in'],
    ['The Stacks', 'Tight lanes between the shelves'],
    ['Card Catalogue', 'Long drawers, heavy traffic'],
    ['Midnight Chime', 'They come from every shelf'],
    ['Rolling Ladder', 'Narrow and fast'],
    ['Candlelit Hall', 'Wide open and flickering'],
    ['Restricted Section', 'Mixed pressure, little room'],
    ['Lost and Found', 'The whole collection'],
    ['Closing Time', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x120d1c,
    fog: 0x1c1428,
    fogDensity: 0.006,
    floor: {
      base: '#8a5a34',
      meshColor: 0xa07e62,
      roughness: 0.38,
      metalness: 0.04,
      emissive: 0x2a1408,
      emissiveIntensity: 0.1
    },
    rail: { color: 0x5a3420, roughness: 0.45, metalness: 0.08 },
    path: { color: 0x2c2238, emissive: 0x1a1030, opacity: 0.44, edge: 0x8f7bff },
    buildZone: { color: 0xf1e2bd, opacity: 0.1, line: 0x8f7bff },
    obstacle: { accent: 0xc9992e },
    base: { color: 0x7dffb0, icon: 'GUARD THE DESK' },
    spawn: { color: 0x9a7bff, icon: 'OFF THE SHELF' }
  },
  lighting: {
    hemiSky: 0xffe3c0,
    hemiGround: 0x2a1a3c,
    hemiIntensity: 0.44,
    sun: 0xffd9a0,
    sunIntensity: 1.0,
    rim: 0x7f6bff,
    rimIntensity: 0.38,
    accent: 0xc7b0ff,
    spotIntensity: 2.5,
    exposure: 0.74
  },
  ui: { accent: '#8f7bff', dark: '#120d1c' },
  // The audience in the stands: pale reading-room ghosts.
  crowd: { fans: [0xcfc4ff, 0x9ff5e6, 0xf1e2bd, 0xb27aff, 0x6fd4c4], seat: 0x2a160c },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    // A thrown bookmark: one bright red streak.
    ball: { mesh: 'tracer', model: 'bookmark', debris: 'paper', debrisColor: 0xf3e6c4, flight: 'tracer', trail: 'line', impact: 'spark', color: 0xff5a6e, speed: 13 },
    // A flick of ink off the nib, very fast and very straight.
    curveBall: { mesh: 'tracer', model: 'quillDart', debris: 'drops', debrisColor: 0x2a1f4a, flight: 'tracer', trail: 'line', impact: 'spark', color: 0xe8e2ff, speed: 15 },
    // A blob of ink, lobbed.
    headButt: { mesh: 'orb', model: 'inkBlob', debris: 'drops', debrisColor: 0x3a2a9a, flight: 'lob', trail: 'dust', impact: 'ring', color: 0x6b5cff, speed: 8.5, size: 1.2 },
    // A soft ring of "shhh".
    tackle: { mesh: 'ring', debris: 'paper', debrisColor: 0xc8b8ff, flight: 'ring', trail: 'frost', impact: 'freeze', color: 0xc8b8ff, speed: 9 },
    // The bookend's weight.
    glove: { mesh: 'block', model: 'hardback', debris: 'paper', debrisColor: 0xf3e6c4, flight: 'punch', trail: 'dust', impact: 'slam', color: 0xd9a441, speed: 8.8, size: 1.2 },
    chain: { mesh: 'bolt', debris: 'sparks', debrisColor: 0x7ff5e6, flight: 'bolt', trail: 'electric', impact: 'chain', color: 0x7ff5e6, speed: 15 },
    flare: { mesh: 'plasma', debris: 'embers', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff7a1f, speed: 11, size: 0.85 },
    // The stamp's verdict.
    legend: { mesh: 'star', model: 'overdueStamp', debris: 'paper', debrisColor: 0xff4d6d, flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xff4d6d, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0xf1e2bd, accent: 0x2a1f3a },
    fire: { body: 'bug', color: 0xd8342a, accent: 0xffd447 },
    flying: { body: 'bug', color: 0x2f9d8a, accent: 0xffd447 },
    armored: { body: 'bug', color: 0x24346e, accent: 0xd9a441 },
    elite: { body: 'bug', color: 0xbff8ee, accent: 0x7a3a8a },
    flying_fire: { body: 'bug', color: 0xead7a8, accent: 0xff7a1f },
    boss: { body: 'bug', color: 0x4a1f5e, accent: 0x7dffb0 },
    splitter: { body: 'bug', color: 0xe6eef8, accent: 0xc8102e },
    splitling: { body: 'bug', color: 0xf6f0e0, accent: 0x2a1f3a },
    shielder: { body: 'bug', color: 0x4a4f5a, accent: 0xd9a441 },
    healer: { body: 'bug', color: 0x2f9a5a, accent: 0x9dffc0 }
  },
  towers: { family: 'library', base: 0x2a160c, metal: 0xd4a24a, levelGlow: 0x8f7bff }
};

// ── Shared surfaces ─────────────────────────────────────────────────────────

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;

const BRASS = () => M.metal(0xd4a24a, { rough: 0.28 });
const GILT = () => M.paint(0xe0b04a, { gloss: 0.8, glow: 0.2 });
const WALNUT = () => M.paint(0x4a2a18, { gloss: 0.45 });
const OAK = () => M.paint(0x9a6a3a, { gloss: 0.4 });
const PAGES = () => M.paint(0xf3e6c4, { gloss: 0.2, glow: 0.12 });
const INK = () => M.paint(0x1a1430, { gloss: 0.8 });
const WAX = () => M.paint(0xf6ecd2, { gloss: 0.35, glow: 0.18 });
const BLACK = () => M.matte(0x16121c);

/** Leather bindings, darker than they will look under the reading lamps. */
const BINDINGS = [0x7a1e22, 0x1f5a3a, 0x24346e, 0x5a2a6a, 0xa8702a, 0x2a4a5a, 0x8a3a1a, 0x3a2a1a];

/** Where shots leave the figure, in model units (see rendering/tower-meshes.js). */
function muzzle(m, x, y, z) {
  m.object.userData.muzzle = { x: x * m.scale, y: y * m.scale, z: z * m.scale };
}

/**
 * A closed hardback lying flat: `w` across (X), `t` thick, `d` deep (Z), spine
 * on the -X side. Two boards, a spine, and the page block showing between.
 */
function book(m, { p = [0, 0, 0], r = [0, 0, 0], w = 0.4, t = 0.08, d = 0.5, cover, bands = true }) {
  const g = m.group({ p, r });
  const board = Math.max(0.008, t * 0.14);
  for (const s of [-1, 1]) g.add(G.rbox(w, board, d, board * 0.45), cover, { p: [0, s * (t - board) / 2, 0] });
  g.add(G.rbox(board * 1.6, t, d, board * 0.7), cover, { p: [-w / 2 + board * 0.8, 0, 0] });
  g.add(G.box(w - board * 2.4, t - board * 1.9, d - board * 2.2), PAGES(), { p: [board * 0.4, 0, 0] });
  if (bands) for (const z of [-d * 0.3, d * 0.3]) g.add(G.box(board * 1.8, t * 1.02, Math.max(0.01, d * 0.04)), GILT(), { p: [-w / 2 + board * 0.8, 0, z] });
  return g;
}

/** A canvas-lettered texture (only ever called in the browser), cached by text. */
const textures = new Map();
function letterTexture(text, { bg = '#f3e6c4', fg = '#c8102e', w = 512, h = 192, font = '900 118px Georgia, "Times New Roman", serif', frame = true } = {}) {
  const key = `${text}|${bg}|${fg}|${w}|${h}`;
  if (textures.has(key)) return textures.get(key);
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = fg;
  if (frame) { ctx.lineWidth = 12; ctx.strokeRect(14, 14, w - 28, h - 28); }
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fg;
  ctx.fillText(text, w / 2, h / 2 + 6);
  const tex = new THREE.CanvasTexture(cv);
  textures.set(key, tex);
  return tex;
}

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

function bookmarkBlades(m, c) {
  // A pile of books with a brass spindle through it, and a rack of steel
  // bookmarks spinning on top like a fan of throwing knives.
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.7, glow: 0.14 });
  book(m, { p: [0, 0.165, 0], w: 0.56, t: 0.09, d: 0.46, cover: M.paint(BINDINGS[1], { gloss: 0.5 }) });
  book(m, { p: [0.01, 0.255, 0.01], r: [0, 0.35, 0], w: 0.5, t: 0.09, d: 0.42, cover: M.paint(BINDINGS[2], { gloss: 0.5 }) });
  book(m, { p: [0, 0.34, 0], r: [0, -0.2, 0], w: 0.46, t: 0.08, d: 0.38, cover: body });
  // The open book on top, pages riffling.
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.2, 0.014, 0.3, 0.005), body, { p: [s * 0.1, 0.39, 0], r: [0, 0, s * 0.12] });
    m.add(G.box(0.19, 0.03, 0.28), PAGES(), { p: [s * 0.1, 0.405, 0], r: [0, 0, s * 0.12] });
  }
  m.add(G.cyl(0.03, 0.04, 0.32, 10), BRASS(), { p: [0, 0.55, 0] });
  // The rack: five bookmark blades, each with its ribbon.
  const rack = m.group({ p: [0, 0.66, 0] });
  const steel = M.metal(0xdfe6ee, { rough: 0.2 });
  const ribbon = M.paint(c.color, { gloss: 0.5, glow: 0.35 });
  rack.add(G.cyl(0.07, 0.07, 0.04, 14), BRASS());
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const arm = rack.group({ r: [0, a, 0] });
    arm.add(G.plate([[-0.035, 0], [0.035, 0], [0.035, 0.2], [0, 0.26], [-0.035, 0.2]], 0.01), steel, { p: [0, 0, 0.04], r: [HALF_PI, 0, 0] });
    arm.add(G.box(0.05, 0.012, 0.03), ribbon, { p: [0, 0.008, 0.06] });
    arm.add(G.tube([[0, 0, 0.29], [0.02, -0.04, 0.33], [-0.01, -0.09, 0.34]], 0.009, 4), ribbon);
    arm.add(G.sphere(0.018, 6, 5), GILT(), { p: [-0.01, -0.1, 0.34] });
  }
  rack.add(G.sphere(0.04, 10, 8), GILT(), { p: [0, 0.04, 0] });
  m.anim(rack.object, 'spin', { speed: 3 });
  // A ribbon marker trailing out of the bottom book.
  m.add(G.tube([[0.12, 0.165, 0.22], [0.14, 0.13, 0.28], [0.1, 0.125, 0.33]], 0.012, 4), ribbon);
  muzzle(m, 0, 0.66, 0.3);
}

function quillSniper(m, c) {
  // A long goose quill laid on a brass rest like a rifle, sighted through a
  // reading glass, an inkwell at its heel.
  const vane = c.bodyMat || M.paint(c.color, { gloss: 0.35, glow: 0.18 });
  const wood = WALNUT();
  m.add(G.rbox(0.5, 0.06, 0.5, 0.02), wood, { p: [0, 0.15, 0] });                                  // writing slope
  m.add(G.rbox(0.44, 0.012, 0.44, 0.004), M.paint(0x1f5a3a, { gloss: 0.3 }), { p: [0, 0.185, 0] });  // leather inset
  // The inkwell.
  m.add(G.lathe([[0.1, 0], [0.12, 0.02], [0.12, 0.08], [0.07, 0.12], [0.04, 0.13], [0.04, 0.16]], 16), M.glass(0x2a1f5a, 0.7), { p: [-0.17, 0.19, -0.14] });
  m.add(G.cyl(0.095, 0.105, 0.07, 14), M.paint(0x3a1f8f, { gloss: 0.9, glow: 0.4 }), { p: [-0.17, 0.235, -0.14] });
  m.add(G.cyl(0.05, 0.05, 0.02, 12), BRASS(), { p: [-0.17, 0.355, -0.14] });
  // The rest: a brass fork on a turned post.
  m.add(G.lathe([[0.06, 0], [0.07, 0.02], [0.03, 0.05], [0.022, 0.3], [0.035, 0.33]], 12), BRASS(), { p: [0.04, 0.19, 0.06] });
  for (const s of [-1, 1]) m.add(G.cyl(0.012, 0.012, 0.09, 6), BRASS(), { p: [0.04 + s * 0.04, 0.56, 0.06], r: [0, 0, s * 0.4] });
  // The quill.
  const quill = m.group({ p: [0.04, 0.58, 0.02], r: [-0.18, 0, 0] });
  quill.add(G.cyl(0.014, 0.02, 0.68, 8), M.paint(0xf6efd8, { gloss: 0.6 }), { p: [0, 0, 0], r: [HALF_PI, 0, 0] });
  // The vane, flat to the camera, with the barbs split here and there.
  quill.add(G.plate([
    [-0.34, 0], [-0.3, 0.05], [-0.16, 0.085], [-0.05, 0.09], [0.0, 0.06], [0.04, 0.085], [0.14, 0.06], [0.22, 0.02], [0.24, 0],
    [0.2, -0.03], [0.1, -0.06], [0.06, -0.04], [0.0, -0.07], [-0.12, -0.075], [-0.26, -0.05]
  ], 0.012), vane, { p: [0, 0.014, -0.1], r: [HALF_PI, 0, HALF_PI], s: [1.25, 1.7, 1] });
  quill.add(G.box(0.004, 0.014, 0.5), M.paint(0xf6efd8, { glow: 0.3 }), { p: [0, 0.02, -0.08] });   // the rachis line
  quill.add(G.cone(0.02, 0.09, 8), BRASS(), { p: [0, 0, 0.38], r: [HALF_PI, 0, 0] });               // the nib
  quill.add(G.box(0.002, 0.004, 0.06), BLACK(), { p: [0, 0.012, 0.38] });
  const drop = quill.add(G.sphere(0.022, 8, 6), M.energy(0x9d8bff, 0.9), { p: [0, 0, 0.44], shadow: false });
  // The reading glass, clipped on as a sight.
  quill.add(G.cyl(0.008, 0.008, 0.08, 6), BRASS(), { p: [0, 0.05, 0.12] });
  quill.add(G.torus(0.055, 0.01, 6, 18), BRASS(), { p: [0, 0.12, 0.12] });
  quill.add(G.cyl(0.05, 0.05, 0.006, 16), M.glass(0xdff6ff, 0.45), { p: [0, 0.12, 0.12], r: [HALF_PI, 0, 0] });
  m.anim(quill.object, 'bob');
  m.anim(drop, 'blink');
  muzzle(m, 0.04, 0.66, 0.4);
}

function inkBottle(m, c) {
  // A squat bottle of enchanted ink on a blotter: the cork has popped and the
  // ink is climbing out to throw itself.
  const ink = M.paint(c.color, { gloss: 0.9, glow: 0.4 });
  const body = c.bodyMat || ink;
  m.add(G.rbox(0.6, 0.03, 0.5, 0.012), M.paint(0x1f5a3a, { gloss: 0.25 }), { p: [0, 0.135, 0] });   // blotter
  for (const s of [-1, 1]) m.add(G.rbox(0.07, 0.045, 0.52, 0.015), WALNUT(), { p: [s * 0.29, 0.145, 0] });
  // Glass, then the ink inside it.
  m.add(G.lathe([[0.2, 0], [0.26, 0.02], [0.27, 0.16], [0.22, 0.25], [0.1, 0.3], [0.085, 0.36], [0.1, 0.39], [0.1, 0.41]], 22), M.glass(0x2a2048, 0.55), { p: [0, 0.15, 0] });
  m.add(G.lathe([[0.18, 0], [0.245, 0.02], [0.255, 0.16], [0.2, 0.23], [0, 0.24]], 20), body, { p: [0, 0.16, 0] });
  m.add(G.sleeve(0.272, 0.272, 0.1, 22), M.paint(0xf3e6c4, { gloss: 0.2, glow: 0.12 }), { p: [0, 0.24, 0] });  // label
  m.add(G.cyl(0.05, 0.05, 0.02, 14), M.paint(0xb3202a, { gloss: 0.6, glow: 0.25 }), { p: [0, 0.24, 0.272], r: [HALF_PI, 0, 0] });   // wax seal
  m.add(G.torus(0.1, 0.016, 6, 16), BRASS(), { p: [0, 0.555, 0], r: [HALF_PI, 0, 0] });
  // A drip down the shoulder.
  m.add(G.tube([[0.08, 0.56, 0.06], [0.16, 0.44, 0.12], [0.22, 0.36, 0.14], [0.235, 0.3, 0.14]], 0.016, 5), ink);
  m.add(G.sphere(0.024, 8, 6), ink, { p: [0.235, 0.29, 0.14] });
  // The ink, rising out of the neck in a blob.
  const blob = m.group({ p: [0, 0.6, 0.02] });
  blob.add(G.sphere(0.1, 14, 10), ink, { p: [0, 0.06, 0], s: [1, 1.15, 1] });
  blob.add(G.sphere(0.05, 10, 8), ink, { p: [0.08, 0.13, 0.04] });
  blob.add(G.sphere(0.035, 8, 6), ink, { p: [-0.07, 0.15, -0.03] });
  blob.add(G.sphere(0.13, 12, 10), M.energy(c.color, 0.25), { p: [0, 0.07, 0], shadow: false });
  for (const s of [-1, 1]) blob.add(G.sphere(0.022, 8, 6), M.glow(0xffffff), { p: [s * 0.04, 0.1, 0.085], shadow: false });
  m.anim(blob.object, 'pulse');
  // The cork, still in the air.
  const cork = m.group({ p: [0.15, 0.86, -0.08], r: [0.5, 0, 0.6] });
  cork.add(G.cyl(0.06, 0.05, 0.1, 12), M.paint(0xb5824a, { gloss: 0.15 }));
  m.anim(cork.object, 'float');
  muzzle(m, 0, 0.72, 0.05);
}

function hushOwl(m, c) {
  // A sleepy reading-room owl in a nightcap, perched on the dictionaries, ringing
  // the quiet bell. Everything near it slows down to whisper.
  const feather = c.bodyMat || M.paint(c.color, { gloss: 0.4, glow: 0.14 });
  const pale = M.paint(0xf3eadf, { gloss: 0.3, glow: 0.15 });
  const dark = M.paint(0x5a4a8a, { gloss: 0.35 });
  const orange = M.paint(0xf0a030, { gloss: 0.6, glow: 0.2 });
  book(m, { p: [0, 0.165, 0], w: 0.56, t: 0.09, d: 0.44, cover: M.paint(BINDINGS[0], { gloss: 0.5 }) });
  book(m, { p: [0, 0.25, 0], r: [0, 0.25, 0], w: 0.48, t: 0.08, d: 0.38, cover: M.paint(BINDINGS[3], { gloss: 0.5 }) });
  // Body, belly and folded wings.
  m.add(G.sphere(0.2, 18, 14), feather, { p: [0, 0.47, -0.02], s: [1, 1.15, 0.92] });
  m.add(G.sphere(0.15, 14, 10), pale, { p: [0, 0.44, 0.08], s: [1, 1.15, 0.6] });
  for (let i = 0; i < 3; i++) m.add(G.torus(0.035, 0.008, 4, 8, Math.PI), dark, { p: [-0.05 + i * 0.05, 0.4 + (i % 2) * 0.06, 0.168], r: [0, 0, Math.PI], shadow: false });   // chest marks
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.13, 12, 10), feather, { p: [s * 0.17, 0.45, -0.04], r: [0, 0, s * 0.25], s: [0.45, 1.15, 0.95] });
    m.add(G.cone(0.03, 0.07, 6), orange, { p: [s * 0.06, 0.3, 0.12], r: [HALF_PI + 0.3, 0, 0] });   // talons over the edge
  }
  m.add(G.cone(0.08, 0.16, 6), feather, { p: [0, 0.32, -0.2], r: [-2.4, 0, 0] });                     // tail
  // The head, nodding off.
  const head = m.group({ p: [0, 0.72, 0] });
  head.add(G.sphere(0.17, 18, 14), feather, { s: [1.12, 0.95, 1] });
  for (const s of [-1, 1]) {
    head.add(G.cyl(0.08, 0.08, 0.02, 16), pale, { p: [s * 0.075, 0, 0.14], r: [HALF_PI, 0, 0] });              // face discs
    head.add(G.sphere(0.055, 12, 10), M.glow(0xffd447), { p: [s * 0.075, -0.005, 0.15], shadow: false });
    head.add(G.sphere(0.026, 8, 6), M.glow(0x1a1430), { p: [s * 0.075, -0.015, 0.195], shadow: false });
    head.add(G.dome(0.06, 12), feather, { p: [s * 0.075, 0.0, 0.152], r: [0.25, 0, 0] });  // heavy lids
    head.add(G.cone(0.04, 0.1, 5), feather, { p: [s * 0.12, 0.14, -0.01], r: [0, 0, -s * 0.35] });             // ear tufts
  }
  head.add(G.cone(0.025, 0.07, 6), orange, { p: [0, -0.06, 0.18], r: [HALF_PI + 0.5, 0, 0] });
  // Nightcap, flopping over to one side, with its pompom.
  const cap = M.paint(0x3a3a8a, { gloss: 0.3, glow: 0.12 });
  head.add(G.cyl(0.165, 0.17, 0.05, 16), pale, { p: [0, 0.1, -0.01], r: [-0.15, 0, 0.1] });
  head.add(G.cone(0.15, 0.3, 14), cap, { p: [-0.05, 0.24, -0.04], r: [-0.2, 0, 0.55] });
  head.add(G.sphere(0.04, 8, 6), pale, { p: [-0.18, 0.34, -0.07] });
  m.anim(head.object, 'float');
  // The hand bell, held out on a wing, swinging.
  const bell = m.group({ p: [0.2, 0.5, 0.14] });
  bell.add(G.cyl(0.015, 0.02, 0.1, 6), WALNUT(), { p: [0, 0.07, 0] });
  bell.add(G.lathe([[0.075, 0], [0.07, 0.01], [0.05, 0.05], [0.04, 0.1], [0.02, 0.12], [0, 0.12]], 14), BRASS(), { p: [0, -0.1, 0] });
  bell.add(G.sphere(0.018, 6, 5), BRASS(), { p: [0, -0.11, 0] });
  m.anim(bell.object, 'bob');
  // "Shh": three Zs drifting up.
  const zz = M.energy(c.color, 0.85);
  const Z = [[-0.05, 0.05], [0.05, 0.05], [0.05, 0.03], [-0.02, -0.03], [0.05, -0.03], [0.05, -0.05], [-0.05, -0.05], [-0.05, -0.03], [0.02, 0.03], [-0.05, 0.03]];
  [[-0.2, 0.95, 0.02, 1], [-0.27, 1.06, -0.02, 0.75]].forEach(([x, y, z, k], i) => {
    const zg = m.group({ p: [x, y, z] });
    zg.add(G.plate(Z, 0.012), zz, { s: k * 1.3, shadow: false });
    m.anim(zg.object, 'float', { offset: i * 1.7 });
  });
  muzzle(m, 0.2, 0.42, 0.2);
}

function lionBookend(m, c) {
  // A heavy bronze lion bookend holding up a row of folios. It shoves back
  // anything that gets too close.
  const bronze = c.bodyMat || M.metal(c.color, { rough: 0.3 });
  const marble = M.paint(0x24302c, { gloss: 0.9 });
  const vein = M.paint(0xcfd8d0, { gloss: 0.6, glow: 0.1 });
  m.add(G.rbox(0.6, 0.08, 0.54, 0.02), marble, { p: [0, 0.16, 0] });
  for (const [x, z, a] of [[-0.18, 0.1, 0.4], [0.1, -0.15, -0.6], [0.2, 0.18, 0.2]]) m.add(G.box(0.16, 0.004, 0.012), vein, { p: [x, 0.2, z], r: [0, a, 0] });
  // The folios, upright at the back, leaning on the bookend's plate.
  [[-0.2, 0x7a1e22, 0.44], [-0.1, 0x24346e, 0.5], [0.0, 0x1f5a3a, 0.46], [0.1, 0x5a2a6a, 0.52], [0.2, 0xa8702a, 0.42]].forEach(([x, col, h], i) => {
    book(m, { p: [x, 0.2 + h / 2, -0.17], r: [0, HALF_PI, HALF_PI + (i === 4 ? 0.12 : 0)], w: 0.24, t: 0.085, d: h, cover: M.paint(col, { gloss: 0.5 }) });
  });
  // The bookend plate and its base tongue.
  m.add(G.rbox(0.56, 0.5, 0.05, 0.015), bronze, { p: [0, 0.45, -0.02] });
  m.add(G.rbox(0.56, 0.02, 0.24, 0.008), bronze, { p: [0, 0.21, -0.12] });
  // The lion.
  const lion = m.group({ p: [0, 0.48, 0.1] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    lion.add(G.cone(0.06, 0.14, 6), bronze, { p: [Math.cos(a) * 0.17, Math.sin(a) * 0.17, -0.03], r: [0, 0, a - HALF_PI] });   // mane
  }
  lion.add(G.sphere(0.19, 16, 12), bronze, { p: [0, 0, -0.02], s: [1, 1, 0.55] });
  lion.add(G.sphere(0.14, 14, 12), bronze, { p: [0, 0.01, 0.05], s: [1, 1.05, 0.8] });
  lion.add(G.sphere(0.07, 12, 10), bronze, { p: [0, -0.05, 0.15], s: [1.2, 0.85, 0.9] });   // muzzle
  lion.add(G.sphere(0.028, 8, 6), BLACK(), { p: [0, -0.02, 0.21] });
  for (const s of [-1, 1]) {
    lion.add(G.sphere(0.045, 8, 6), bronze, { p: [s * 0.11, 0.12, 0.02] });                                   // ears
    lion.add(G.sphere(0.024, 8, 6), M.glow(0xffe27a), { p: [s * 0.055, 0.05, 0.155], shadow: false });
    lion.add(G.box(0.06, 0.016, 0.02), bronze, { p: [s * 0.055, 0.085, 0.16], r: [0, 0, s * 0.3] });            // brows
  }
  // The knocker ring through its jaws.
  lion.add(G.torus(0.075, 0.018, 8, 20), M.metal(0xffd36a, { rough: 0.2 }), { p: [0, -0.15, 0.17], r: [0.2, 0, 0] });
  m.anim(lion.object, 'bob');
  for (const s of [-1, 1]) m.add(G.sphere(0.05, 10, 8), bronze, { p: [s * 0.24, 0.73, -0.02] });            // finials
  muzzle(m, 0, 0.4, 0.3);
}

function lightningGlobe(m, c) {
  // A reading lamp somebody rewired: a plasma globe on a brass column, in an
  // armillary ring, arcing to whatever walks past.
  const glow = c.color;
  const shade = M.glass(0x2f9d57, 0.75);
  shade.emissive = new THREE.Color(0x1f7a40);
  shade.emissiveIntensity = 0.5;
  book(m, { p: [0, 0.165, 0], w: 0.56, t: 0.09, d: 0.46, cover: c.bodyMat || M.paint(0x24346e, { gloss: 0.5 }) });
  m.add(G.lathe([[0.18, 0], [0.19, 0.02], [0.14, 0.05], [0.06, 0.08], [0.04, 0.2], [0.055, 0.23], [0.035, 0.3], [0.05, 0.33]], 18), BRASS(), { p: [0, 0.21, 0] });
  // A little green banker's shade on a swan neck at the back: a reading lamp still.
  m.add(G.tube([[0.12, 0.25, -0.12], [0.2, 0.5, -0.18], [0.16, 0.66, -0.2]], 0.014, 6), BRASS());
  m.add(G.lathe([[0.1, 0], [0.09, 0.02], [0.05, 0.06], [0.02, 0.07]], 14), shade, { p: [0.16, 0.6, -0.2], r: [0.3, 0, -0.3] });
  m.add(G.sphere(0.03, 8, 6), M.glow(0xfff1c2), { p: [0.15, 0.6, -0.19], shadow: false });
  // The globe.
  m.add(G.sphere(0.2, 22, 16), M.glass(0xdff0ff, 0.28), { p: [0, 0.72, 0] });
  m.add(G.sphere(0.2, 16, 12), M.energy(glow, 0.12), { p: [0, 0.72, 0], shadow: false });
  m.add(G.sphere(0.045, 10, 8), M.glow(0xffffff), { p: [0, 0.72, 0], shadow: false });
  m.add(G.sphere(0.07, 10, 8), M.energy(glow, 0.6), { p: [0, 0.72, 0], shadow: false });
  const arcs = m.group({ p: [0, 0.72, 0] });
  const arcMat = M.energy(glow, 0.95);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU, el = (i % 3 - 1) * 0.5;
    const end = [Math.cos(a) * Math.cos(el) * 0.19, Math.sin(el) * 0.19, Math.sin(a) * Math.cos(el) * 0.19];
    const mid = [end[0] * 0.5 + Math.sin(a * 3) * 0.03, end[1] * 0.5 + 0.03, end[2] * 0.5 - Math.cos(a * 3) * 0.03];
    arcs.add(G.tube([[0, 0, 0], mid, end], 0.006, 4), arcMat, { shadow: false });
  }
  m.anim(arcs.object, 'spin', { speed: 1.6 });
  // The armillary ring and the electrode on top.
  m.add(G.torus(0.235, 0.012, 6, 30), BRASS(), { p: [0, 0.72, 0], r: [0, 0, 0.35] });
  m.add(G.torus(0.235, 0.01, 6, 30), BRASS(), { p: [0, 0.72, 0], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.012, 0.012, 0.1, 6), BRASS(), { p: [0, 0.96, 0] });
  const tip = m.add(G.sphere(0.035, 10, 8), M.glow(glow), { p: [0, 1.02, 0], shadow: false });
  m.anim(tip, 'pulse');
  const spark = m.add(G.star(0.06, 0.02, 0.006, 4), M.glow(0xffffff, 0.9), { p: [0, 1.02, 0.02], shadow: false });
  m.anim(spark, 'blink');
  muzzle(m, 0, 0.98, 0);
}

function candelabra(m, c) {
  // A three-branch brass candelabra stood on a hymn book, every wick lit and
  // the wax running.
  const brass = c.bodyMat || BRASS();
  book(m, { p: [0, 0.165, 0], w: 0.56, t: 0.09, d: 0.46, cover: M.paint(BINDINGS[0], { gloss: 0.5 }) });
  m.add(G.lathe([[0.2, 0], [0.21, 0.015], [0.17, 0.03], [0.08, 0.05], [0.05, 0.09], [0.07, 0.12], [0.04, 0.15], [0.035, 0.36], [0.06, 0.39], [0.04, 0.42]], 18), brass, { p: [0, 0.21, 0] });
  // The branches: two scrolls out to a cup on each side.
  const cups = [[0, 0.66, 0], [-0.22, 0.56, 0.02], [0.22, 0.56, 0.02]];
  for (const s of [-1, 1]) {
    m.add(G.tube([[0, 0.5, 0], [s * 0.1, 0.42, 0.01], [s * 0.2, 0.46, 0.02], [s * 0.22, 0.54, 0.02]], 0.018, 6), brass);
    m.add(G.sphere(0.022, 8, 6), brass, { p: [s * 0.12, 0.41, 0.01] });
  }
  cups.forEach(([x, y, z], i) => {
    m.add(G.lathe([[0.02, 0], [0.07, 0.02], [0.08, 0.03], [0.05, 0.04]], 14), brass, { p: [x, y - 0.04, z] });
    const h = i ? 0.2 : 0.24;
    m.add(G.cyl(0.04, 0.042, h, 12), WAX(), { p: [x, y + h / 2, z] });
    // Drips, down the side facing the camera.
    m.add(G.capsule(0.013, 0.08, 6), WAX(), { p: [x + 0.03, y + h - 0.09, z + 0.025] });
    m.add(G.capsule(0.011, 0.05, 6), WAX(), { p: [x - 0.025, y + h - 0.06, z + 0.03] });
    m.add(G.cyl(0.004, 0.004, 0.03, 4), BLACK(), { p: [x, y + h + 0.015, z] });
    const fl = m.group({ p: [x, y + h + 0.02, z] });
    fl.add(G.cone(0.03, 0.1, 8), M.energy(0xff8a1f, 0.9), { p: [0, 0.05, 0], shadow: false });
    fl.add(G.cone(0.016, 0.06, 6), M.glow(0xfff2b0), { p: [0, 0.03, 0], shadow: false });
    fl.add(G.sphere(0.08, 10, 8), M.energy(0xffb347, 0.18), { p: [0, 0.05, 0], shadow: false });
    m.anim(fl.object, 'flame', { offset: i * 1.3 });
  });
  // A puddle of wax on the book and a stray candle stub.
  m.add(G.sphere(0.07, 12, 6), WAX(), { p: [0.16, 0.21, 0.14], s: [1, 0.15, 0.8] });
  m.add(G.cyl(0.03, 0.033, 0.06, 10), WAX(), { p: [-0.18, 0.24, 0.15] });
  muzzle(m, 0, 0.95, 0.02);
}

function overdueStamp(m, c) {
  // The head librarian's own date stamp, the size of a anvil, hung in a brass
  // press over a dated slip: one thump and it is OVERDUE.
  const rubber = c.bodyMat || M.paint(c.color, { gloss: 0.5, glow: 0.25 });
  const oak = OAK();
  const brass = BRASS();
  m.add(G.rbox(0.62, 0.07, 0.56, 0.02), WALNUT(), { p: [0, 0.155, 0] });
  // The slip, lettered.
  const tex = letterTexture('OVERDUE', { font: '900 84px Georgia, "Times New Roman", serif' });
  const slipMat = tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25 }) : PAGES();
  m.add(G.box(0.4, 0.008, 0.16), slipMat, { p: [0, 0.194, 0.17], r: [0, 0.08, 0] });
  // The ink pad, in its tin.
  m.add(G.rbox(0.2, 0.04, 0.14, 0.01), M.metal(0x3b4048, { rough: 0.4 }), { p: [-0.16, 0.21, -0.12] });
  m.add(G.box(0.17, 0.01, 0.11), M.paint(0xb3102a, { gloss: 0.2, glow: 0.2 }), { p: [-0.16, 0.232, -0.12] });
  // The press: two posts and a crossbar.
  for (const s of [-1, 1]) {
    m.add(G.lathe([[0.045, 0], [0.05, 0.02], [0.025, 0.05], [0.022, 0.66], [0.035, 0.69]], 10), brass, { p: [s * 0.27, 0.19, 0] });
    m.add(G.sphere(0.04, 10, 8), GILT(), { p: [s * 0.27, 0.9, 0] });
  }
  m.add(G.rbox(0.6, 0.05, 0.07, 0.015), brass, { p: [0, 0.86, 0] });
  // The stamp, on a spring.
  const stamp = m.group({ p: [0, 0.83, 0.02] });
  const coil = [];
  for (let i = 0; i <= 24; i++) { const a = i * 0.8; coil.push([Math.cos(a) * 0.035, -i * 0.006, Math.sin(a) * 0.035]); }
  stamp.add(G.tube(coil, 0.006, 4), M.metal(0xdfe6ee));
  stamp.add(G.lathe([[0.0, 0], [0.07, 0.01], [0.09, 0.05], [0.07, 0.1], [0.04, 0.12], [0.035, 0.18], [0.06, 0.2], [0.065, 0.22]], 16), oak, { p: [0, -0.4, 0] });
  stamp.add(G.sphere(0.09, 14, 10), M.paint(0x7a1e22, { gloss: 0.8 }), { p: [0, -0.14, 0], s: [1, 0.8, 1] });     // the knob
  stamp.add(G.rbox(0.3, 0.05, 0.2, 0.015), brass, { p: [0, -0.42, 0] });
  stamp.add(G.rbox(0.28, 0.06, 0.18, 0.012), oak, { p: [0, -0.47, 0] });
  stamp.add(G.rbox(0.27, 0.035, 0.17, 0.01), rubber, { p: [0, -0.515, 0] });
  stamp.add(G.box(0.22, 0.006, 0.03), M.glow(0xffd0d8), { p: [0, -0.534, 0], shadow: false });
  m.anim(stamp.object, 'bob');
  // A gold star sticker for the good borrowers, floating over the press.
  const star = m.add(G.star(0.06, 0.025, 0.012), M.glow(0xffd447), { p: [0, 1.0, 0.04], shadow: false });
  m.anim(star, 'float');
  muzzle(m, 0, 0.36, 0.22);
}

const TOWERS = [bookmarkBlades, quillSniper, inkBottle, hushOwl, lionBookend, lightningGlobe, candelabra, overdueStamp];

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

const FIRE_WING = [[0, -0.28], [0.5, -0.5], [0.95, -0.38], [1.45, -0.48], [1.15, -0.08], [1.5, 0.22], [0.95, 0.18], [1.0, 0.58], [0.58, 0.3], [0.4, 0.6], [0, 0.3]];
/** An asterisk: the footnote's mark. */
const ASTERISK = (() => {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + HALF_PI, r = i % 2 ? 0.1 : 0.3;
    out.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
})();

function footnote(m, enemy, c) {
  // A scrap of paper folded like a beetle's shell, asterisk on its back, six
  // inky legs going as fast as they can.
  const paper = M.paint(c.color, { gloss: 0.25, glow: 0.2 });
  const ink = M.paint(c.accent, { gloss: 0.6 });
  m.add(G.sphere(0.55, 14, 10), M.paint(0x3a2a4a, { gloss: 0.3 }), { p: [0, -0.2, 0], s: [1, 0.45, 1.15] });   // underside
  for (const s of [-1, 1]) {
    // The two halves of the fold, meeting in a ridge along the back.
    m.add(G.rbox(0.64, 0.05, 1.3, 0.02), paper, { p: [s * 0.28, 0.0, 0], r: [0, 0, -s * 0.42] });
    // Lines of small print on each half.
    for (let i = 0; i < 5; i++) m.add(G.box(0.4 - (i === 4 ? 0.18 : 0), 0.012, 0.035), ink, { p: [s * (0.3 + (i === 4 ? -0.07 : 0)) , 0.04, -0.4 + i * 0.17], r: [0, 0, -s * 0.42], shadow: false });
  }
  // The asterisk, standing on the ridge.
  m.add(G.plate(ASTERISK, 0.05), M.paint(0x8f7bff, { gloss: 0.5, glow: 0.6 }), { p: [0, 0.42, -0.1], r: [-0.4, 0, 0] });
  // A little numeral of a face at the front.
  eyes(m, { x: 0.2, y: 0.0, z: 0.62, r: 0.15, brow: -0.3, browMat: ink });
  m.add(G.torus(0.07, 0.022, 5, 10, Math.PI), M.glow(0x7a1626), { p: [0, -0.17, 0.66], r: [0, 0, Math.PI], shadow: false });
  // Antennae: two ink strokes with a full stop on each.
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.1, 0.1, 0.6], [s * 0.2, 0.42, 0.78], [s * 0.36, 0.5, 0.7]], 0.022, 5), ink);
    m.add(G.sphere(0.055, 8, 6), ink, { p: [s * 0.36, 0.5, 0.7] });
  }
  // Six legs.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const leg = part(m, { k: 'swing', ax: 'z', amp: 0.4, f: 1.5, ph: (i + (s > 0 ? 0 : 1)) * Math.PI }, { p: [s * 0.45, -0.22, -0.36 + i * 0.36] });
      leg.add(G.tube([[0, 0, 0], [s * 0.22, 0.1, (i - 1) * 0.08], [s * 0.32, -0.62, (i - 1) * 0.14]], 0.06, 5), ink);
      leg.add(G.sphere(0.07, 6, 5), ink, { p: [s * 0.32, -0.64, (i - 1) * 0.14] });
    }
  }
}

function matchbook(m, enemy, c) {
  // A matchbook from the reading-room bar, flap torn open, every head alight
  // and its temper with them.
  const card = M.paint(c.color, { gloss: 0.5, glow: 0.18 });
  const stick = M.paint(0xf1dcaa, { gloss: 0.3 });
  const head = M.paint(0xff4a2a, { gloss: 0.6, glow: 0.4 });
  const striker = M.matte(0x4a2a1a);
  m.add(G.rbox(0.96, 1.08, 0.3, 0.05), card, { p: [0, -0.25, 0] });
  m.add(G.box(0.98, 0.18, 0.31), striker, { p: [0, -0.67, 0.002] });                                 // the strip
  m.add(G.box(0.7, 0.07, 0.02), M.paint(c.accent, { gloss: 0.6, glow: 0.4 }), { p: [0, 0.05, 0.155] });   // the printed band
  m.add(G.cyl(0.09, 0.09, 0.02, 14), M.paint(c.accent, { gloss: 0.6, glow: 0.4 }), { p: [0.3, -0.12, 0.155], r: [HALF_PI, 0, 0] });
  // The flap, folded back.
  m.add(G.rbox(0.96, 0.5, 0.06, 0.03), card, { p: [0, 0.48, -0.26], r: [-0.6, 0, 0] });
  // A row of matches standing up out of it, heads burning.
  for (let i = 0; i < 5; i++) {
    const x = -0.36 + i * 0.18, tall = 0.42 + (i % 2) * 0.06;
    m.add(G.box(0.1, tall, 0.06), stick, { p: [x, 0.25 + tall / 2, -0.05] });
    m.add(G.capsule(0.075, 0.2, 10), head, { p: [x, 0.25 + tall - 0.04, -0.05] });
  }
  flame(m, enemy, { p: [0, 0.82, -0.05], rad: 0.3, h: 0.75 });
  flame(m, enemy, { p: [-0.3, 0.78, -0.05], rad: 0.16, h: 0.45, color: 0xffb347 });
  flame(m, enemy, { p: [0.3, 0.78, -0.05], rad: 0.16, h: 0.45, color: 0xffb347 });
  // Face.
  eyes(m, { x: 0.22, y: -0.12, z: 0.17, r: 0.15, brow: 0.5, browMat: striker });
  m.add(G.rbox(0.34, 0.1, 0.04, 0.02), M.glow(0x3a0d08), { p: [0, -0.4, 0.17], shadow: false });
  for (const x of [-0.09, 0, 0.09]) m.add(G.box(0.07, 0.05, 0.03), M.glow(0xffffff), { p: [x, -0.385, 0.19], shadow: false });
  // Matchstick arms, waving, and legs.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.9, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.5, -0.2, 0] });
    arm.add(G.box(0.07, 0.45, 0.07), stick, { p: [s * 0.12, 0.15, 0], r: [0, 0, -s * 0.6] });
    arm.add(G.sphere(0.07, 8, 6), head, { p: [s * 0.26, 0.34, 0] });
  }
  legs(m, stick, striker, { x: 0.24, hip: -0.76, len: 0.2, r: 0.06 });
}

function paperback(m, enemy, c) {
  // A paperback flapping its covers like wings, spine up, pages fluttering,
  // its bookmark lolling out like a tongue.
  const cover = M.paint(c.color, { gloss: 0.6, glow: 0.2 });
  const spine = M.paint(c.accent, { gloss: 0.6, glow: 0.35 });
  m.add(G.cyl(0.11, 0.11, 1.15, 10), spine, { p: [0, 0.15, 0], r: [HALF_PI, 0, 0] });
  for (const z of [-0.36, 0.36]) m.add(G.torus(0.115, 0.02, 4, 12), M.paint(0x1a1430, { gloss: 0.5 }), { p: [0, 0.15, z] });
  // The page block, fanned open beneath the spine.
  const page = PAGES();
  page.side = THREE.DoubleSide;
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.16;
    m.add(G.box(0.02, 0.7, 1.05), page, { p: [Math.sin(a) * 0.35, 0.15 - Math.cos(a) * 0.35, 0], r: [0, 0, a] });
  }
  // The covers are the wings: each a group of board and endpaper.
  enemy.wings = [1, -1].map(s => {
    const w = m.group({ p: [s * 0.08, 0.15, 0] });
    const cGeo = G.box(0.85, 0.05, 1.12);
    cGeo.translate(0.425, 0, 0);
    cGeo.rotateZ(-0.35);
    if (s < 0) cGeo.scale(-1, 1, 1);
    w.add(cGeo, cover);
    const pGeo = G.box(0.8, 0.02, 1.06);
    pGeo.translate(0.4, -0.04, 0);
    pGeo.rotateZ(-0.35);
    if (s < 0) pGeo.scale(-1, 1, 1);
    w.add(pGeo, page);
    // A title panel on the cover.
    const tGeo = G.box(0.4, 0.06, 0.34);
    tGeo.translate(0.5, 0.01, 0.12);
    tGeo.rotateZ(-0.35);
    if (s < 0) tGeo.scale(-1, 1, 1);
    w.add(tGeo, M.paint(0xffd447, { gloss: 0.6, glow: 0.4 }));
    return w.object;
  });
  // Face on the front edge of the pages.
  eyes(m, { x: 0.17, y: -0.02, z: 0.56, r: 0.14 });
  m.add(G.tube([[0, -0.3, 0.52], [0.04, -0.5, 0.7], [-0.03, -0.66, 0.78]], 0.04, 5), M.paint(0xe0475a, { gloss: 0.4, glow: 0.4 }));   // ribbon tongue
  // A loose page left behind it.
  m.add(G.box(0.4, 0.015, 0.5), page, { p: [0.1, -0.05, -0.85], r: [0.5, 0.3, 0.2] });
}

function encyclopediaGolem(m, enemy, c) {
  // A volume of the encyclopedia, A to Z, walking on two more and swinging the
  // supplements: thick boards, brass corners, very hard to put down.
  const cover = M.paint(c.color, { gloss: 0.6, glow: 0.12 });
  const gilt = M.paint(c.accent, { gloss: 0.8, glow: 0.3 });
  const brass = M.metal(c.accent, { rough: 0.3 });
  const page = PAGES();
  // The body: a fat book standing, front cover to the enemy.
  m.add(G.rbox(1.1, 1.2, 0.12, 0.03), cover, { p: [0, 0.05, 0.3] });
  m.add(G.rbox(1.1, 1.2, 0.12, 0.03), cover, { p: [0, 0.05, -0.3] });
  m.add(G.rbox(0.16, 1.2, 0.72, 0.05), cover, { p: [-0.5, 0.05, 0] });
  m.add(G.box(0.96, 1.1, 0.5), page, { p: [0.05, 0.05, 0] });
  for (const y of [-0.35, 0.05, 0.45]) m.add(G.box(0.18, 0.06, 0.74), gilt, { p: [-0.51, y, 0] });     // spine bands
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    m.add(G.plate([[0, 0], [0.24, 0], [0, 0.24]], 0.05), brass, { p: [sx * 0.52, 0.05 + sy * 0.57, 0.37], r: [0, sx < 0 ? 0 : Math.PI, sy < 0 ? 0 : (sx < 0 ? -HALF_PI : HALF_PI)] });
  }
  // The title panel and a brass clasp across the fore-edge.
  m.add(G.rbox(0.55, 0.22, 0.03, 0.02), gilt, { p: [0, -0.28, 0.37] });
  m.add(G.box(0.4, 0.04, 0.035), M.paint(c.color, { glow: 0.1 }), { p: [0, -0.28, 0.385] });
  m.add(G.rbox(0.14, 0.24, 0.8, 0.03), brass, { p: [0.56, -0.05, 0] });
  // Eyes in a heavy visor.
  eyes(m, { x: 0.22, y: 0.3, z: 0.38, r: 0.12, color: 0xfff27a, brow: 0.5, browMat: brass });
  // Volume II on top, as a helmet.
  m.add(G.rbox(0.9, 0.16, 0.62, 0.03), M.paint(0x7a1e22, { gloss: 0.6 }), { p: [0, 0.74, -0.02], r: [0, 0, 0.06] });
  m.add(G.box(0.8, 0.12, 0.56), page, { p: [0.03, 0.74, -0.02], r: [0, 0, 0.06] });
  // Arms: stacks of supplements.
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.66, 0.35, 0] });
    for (let i = 0; i < 3; i++) arm.add(G.rbox(0.3, 0.16, 0.36, 0.03), M.paint(BINDINGS[(i + (s > 0 ? 2 : 4)) % 8], { gloss: 0.5 }), { p: [s * 0.08, -0.15 - i * 0.18, 0], r: [0, i * 0.3, 0] });
    arm.add(G.rbox(0.36, 0.2, 0.42, 0.04), cover, { p: [s * 0.08, -0.72, 0.04] });
  }
  // Legs: two thick volumes each.
  for (const s of [-1, 1]) {
    const leg = part(m, { k: 'swing', ax: 'x', amp: 0.5, ph: s > 0 ? 0 : Math.PI }, { p: [s * 0.3, -0.55, 0] });
    leg.add(G.rbox(0.32, 0.3, 0.4, 0.04), M.paint(BINDINGS[s > 0 ? 5 : 6], { gloss: 0.5 }), { p: [0, -0.15, 0] });
    leg.add(G.rbox(0.36, 0.14, 0.54, 0.04), cover, { p: [0, -0.35, 0.06] });
  }
}

function shushingSpectre(m, enemy, c) {
  // The ghost of a librarian who never retired: hair in a bun with a pencil
  // through it, spectacles on a chain, a finger to her lips, a book to hand.
  const ghost = M.paint(c.color, { gloss: 0.4, glow: 0.55 });
  ghost.transparent = true;
  ghost.opacity = 0.88;
  const shawl = M.paint(c.accent, { gloss: 0.3, glow: 0.25 });
  const rim = M.paint(0x2a1f3a, { gloss: 0.8 });
  m.add(G.lathe([[0.62, 0], [0.58, 0.2], [0.5, 0.6], [0.44, 0.9], [0.4, 1.1], [0.34, 1.3], [0.2, 1.42], [0, 1.46]], 22), ghost, { p: [0, -0.85, 0] });
  // A ragged hem.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    m.add(G.cone(0.14, 0.26, 6), ghost, { p: [Math.sin(a) * 0.55, -0.92, Math.cos(a) * 0.55], r: [Math.PI, 0, 0] });
  }
  m.add(G.sphere(0.9, 14, 10), M.energy(0x9ff5e6, 0.07), { p: [0, -0.1, 0], shadow: false });          // the haunt
  // The shawl round her shoulders.
  m.add(G.torus(0.42, 0.11, 8, 22), shawl, { p: [0, 0.12, 0], r: [HALF_PI + 0.12, 0, 0] });
  m.add(G.cone(0.2, 0.36, 4), shawl, { p: [0, -0.06, -0.38], r: [-2.6, 0, 0] });
  // The bun, and the pencil through it.
  m.add(G.sphere(0.2, 12, 10), M.paint(0x9aa6c8, { gloss: 0.4, glow: 0.35 }), { p: [0, 0.68, -0.12] });
  m.add(G.cyl(0.03, 0.03, 0.62, 6), M.paint(0xffc928, { gloss: 0.6, glow: 0.3 }), { p: [0, 0.72, -0.12], r: [0.3, 0, 1.2] });
  m.add(G.cone(0.03, 0.08, 6), M.paint(0x3a2a1a), { p: [0.3, 0.84, -0.02], r: [0.3, 0, 1.2 - Math.PI] });
  m.add(G.cyl(0.032, 0.032, 0.05, 6), M.paint(0xff8fa3, { glow: 0.3 }), { p: [-0.3, 0.6, -0.22], r: [0.3, 0, 1.2] });
  // Cat-eye spectacles and the chain that keeps them.
  for (const s of [-1, 1]) {
    m.add(G.sphere(0.12, 10, 8), M.glow(0x1a1430), { p: [s * 0.17, 0.4, 0.33], s: [1, 0.85, 0.4], shadow: false });
    m.add(G.sphere(0.06, 8, 6), M.glow(0x7dffb0), { p: [s * 0.17, 0.4, 0.38], shadow: false });
    m.add(G.torus(0.13, 0.025, 5, 16), rim, { p: [s * 0.17, 0.41, 0.4], s: [1, 0.8, 1] });
    m.add(G.cone(0.045, 0.12, 4), rim, { p: [s * 0.32, 0.5, 0.39], r: [0, 0, -s * 0.9] });   // the flicks
    m.add(G.tube([[s * 0.3, 0.4, 0.36], [s * 0.42, 0.1, 0.3], [s * 0.36, -0.06, 0.25]], 0.01, 4), M.paint(0xffd447, { glow: 0.4 }));
  }
  m.add(G.box(0.08, 0.03, 0.04), rim, { p: [0, 0.42, 0.42] });
  // The pursed mouth, mid-shush, and the finger to it.
  m.add(G.torus(0.05, 0.022, 5, 12), M.glow(0x3a1f4a), { p: [0, 0.17, 0.44], shadow: false });
  const shush = part(m, { k: 'swing', ax: 'x', amp: 0.12, ph: 0 }, { p: [0.36, -0.05, 0.18] });
  shush.add(G.tube([[0, 0, 0], [-0.08, 0.08, 0.16], [-0.24, 0.12, 0.26]], 0.08, 6), ghost);
  shush.add(G.sphere(0.09, 8, 6), ghost, { p: [-0.28, 0.14, 0.27] });
  shush.add(G.capsule(0.03, 0.16, 6), ghost, { p: [-0.3, 0.17, 0.28] });
  // The other arm holds a book to her chest.
  const off = part(m, { k: 'swing', ax: 'x', amp: 0.25, ph: Math.PI }, { p: [-0.38, -0.05, 0.12] });
  off.add(G.tube([[0, 0, 0], [0.05, -0.2, 0.18], [0.18, -0.24, 0.3]], 0.08, 6), ghost);
  book(off, { p: [0.12, -0.24, 0.38], r: [0.2, -HALF_PI, HALF_PI], w: 0.36, t: 0.09, d: 0.46, cover: M.paint(0x24346e, { gloss: 0.5, glow: 0.15 }) });
}

function manuscript(m, enemy, c) {
  // A manuscript scroll, burning at both ends and flying on wings of fire,
  // still wax-sealed in the middle.
  const parch = M.paint(c.color, { gloss: 0.25, glow: 0.22 });
  const char = M.paint(0x2a1a10, { gloss: 0.2 });
  const roller = M.paint(0x6a3a1a, { gloss: 0.6 });
  const ink = M.paint(0x3a2a4a, { gloss: 0.4 });
  // The sheet, sagging slightly between its rollers.
  for (let i = 0; i < 5; i++) {
    const z = -0.48 + i * 0.24, y = -Math.sin((i / 4) * Math.PI) * 0.06;
    m.add(G.box(1.0, 0.03, 0.26), parch, { p: [0, y, z] });
  }
  for (let i = 0; i < 6; i++) m.add(G.box(0.7 - (i % 3) * 0.12, 0.01, 0.03), ink, { p: [-0.06, 0.0, -0.4 + i * 0.13], shadow: false });
  // Rollers and their knobs.
  for (const z of [-0.62, 0.62]) {
    m.add(G.cyl(0.14, 0.14, 1.06, 14), parch, { p: [0, 0.05, z], r: [0, 0, HALF_PI] });
    m.add(G.cyl(0.05, 0.05, 1.34, 8), roller, { p: [0, 0.05, z], r: [0, 0, HALF_PI] });
    for (const s of [-1, 1]) m.add(G.sphere(0.09, 8, 6), roller, { p: [s * 0.69, 0.05, z] });
  }
  // Charred edges along the sides.
  for (const s of [-1, 1]) m.add(G.box(0.06, 0.035, 1.2), char, { p: [s * 0.5, 0, 0] });
  // The seal, and the face above it.
  m.add(G.cyl(0.14, 0.14, 0.05, 14), M.paint(0xb3102a, { gloss: 0.6, glow: 0.45 }), { p: [0, 0.03, 0.2] });
  eyes(m, { x: 0.18, y: 0.22, z: 0.66, r: 0.12, color: 0xfff27a, brow: 0.5, browMat: char });
  // Fire along the back roller, and from the corners.
  flame(m, enemy, { p: [0, 0.18, -0.65], r: [-0.8, 0, 0], rad: 0.22, h: 0.7 });
  flame(m, enemy, { p: [-0.45, 0.12, -0.62], r: [-0.6, 0, 0.3], rad: 0.12, h: 0.45, color: 0xffb347 });
  flame(m, enemy, { p: [0.45, 0.12, -0.62], r: [-0.6, 0, -0.3], rad: 0.12, h: 0.45, color: 0xffb347 });
  flame(m, enemy, { p: [0.5, 0.05, 0.1], r: [0, 0, -0.5], rad: 0.08, h: 0.3 });
  wings(m, enemy, M.paint(c.accent, { gloss: 0.4, glow: 0.55 }), FIRE_WING, { y: 0.06, z: -0.1, hinge: 0.5 });
}

function overdueTome(m, enemy, c) {
  // The book that never came back: a grimoire as big as a desk, chained shut
  // and chewing through the chain, one eye open on the cover.
  const leather = M.paint(c.color, { gloss: 0.55, glow: 0.18 });
  const brass = M.metal(0xd4a24a, { rough: 0.3 });
  brass.emissive = new THREE.Color(0x5a3a00);
  brass.emissiveIntensity = 0.4;
  const page = PAGES();
  const tooth = M.paint(0xfff6dc, { gloss: 0.6, glow: 0.2 });
  const iron = M.metal(0x8a909a, { rough: 0.4 });
  // The lower board and its block of pages.
  m.add(G.rbox(1.8, 0.14, 1.5, 0.05), leather, { p: [0, -0.5, 0] });
  m.add(G.box(1.66, 0.32, 1.36), page, { p: [0, -0.3, 0.02] });
  // The spine at the back: rounded and banded.
  m.add(new THREE.CylinderGeometry(0.42, 0.42, 1.8, 16, 1, false, 0, Math.PI), leather, { p: [0, -0.08, -0.72], r: [0, 0, HALF_PI] });
  for (const x of [-0.6, -0.2, 0.2, 0.6]) m.add(G.torus(0.43, 0.035, 5, 16, Math.PI), brass, { p: [x, -0.08, -0.72], r: [0, HALF_PI, 0] });
  // The upper half: hinged at the spine, jaws open.
  const jaw = m.group({ p: [0, 0.2, -0.7], r: [-0.42, 0, 0] });
  jaw.add(G.rbox(1.8, 0.14, 1.5, 0.05), leather, { p: [0, 0.12, 0.72] });
  jaw.add(G.box(1.66, 0.3, 1.36), page, { p: [0, -0.06, 0.74] });
  // Brass corners and a gilt border on the cover.
  for (const sx of [-1, 1]) {
    jaw.add(G.rbox(0.3, 0.05, 0.3, 0.02), brass, { p: [sx * 0.78, 0.2, 1.35] });
    jaw.add(G.box(0.04, 0.03, 1.3), M.paint(0xe0b04a, { glow: 0.3 }), { p: [sx * 0.72, 0.2, 0.72] });
  }
  // The eye, set into the cover.
  jaw.add(G.sphere(0.36, 16, 12), M.paint(0x2a1030, { gloss: 0.5 }), { p: [0, 0.2, 0.68], s: [1.25, 0.45, 1] });   // socket
  jaw.add(G.sphere(0.27, 16, 12), M.paint(0xfff3d6, { gloss: 0.8, glow: 0.45 }), { p: [0, 0.28, 0.68], s: [1.15, 0.6, 1] });
  const iris = jaw.group({ p: [0, 0.42, 0.72] });
  iris.object.scale.setScalar(m.scale);
  enemy.crownGem = new THREE.Mesh(G.sphere(0.15, 12, 10).scale(1, 0.4, 1), M.glow(c.accent));
  iris.object.add(enemy.crownGem);
  jaw.add(G.sphere(0.06, 8, 6), M.glow(0x1a1430), { p: [0, 0.48, 0.74], s: [0.5, 0.4, 1.6], shadow: false });
  for (const s of [-1, 1]) jaw.add(G.box(0.5, 0.06, 0.1), leather, { p: [s * 0.28, 0.36, 0.42], r: [0, s * 0.35, 0] });   // a frown
  // Teeth along both page edges.
  for (let i = 0; i < 8; i++) {
    const x = -0.72 + i * (1.44 / 7);
    jaw.add(G.cone(0.08, 0.26, 6), tooth, { p: [x, -0.28, 1.34], r: [Math.PI, 0, 0] });
    m.add(G.cone(0.08, 0.24, 6), tooth, { p: [x + 0.1, -0.02, 0.62] });
  }
  // The mouth's glow, and the ribbon of a tongue.
  m.add(G.box(1.5, 0.04, 1.1), M.glow(0x5a0f2a), { p: [0, -0.12, 0.08], shadow: false });
  m.add(G.tube([[0, -0.1, 0.3], [0.1, -0.1, 0.75], [-0.05, -0.32, 0.95], [0.05, -0.6, 1.05]], 0.07, 6), M.paint(0xe0475a, { gloss: 0.4, glow: 0.45 }));   // a ribbon of a tongue
  // The chain, bitten through, links hanging off one side; the padlock dangling.
  for (let i = 0; i < 7; i++) {
    const z = -0.5 + i * 0.2;
    m.add(G.torus(0.08, 0.025, 5, 10), iron, { p: [0.95, -0.25 - Math.sin(i * 0.45) * 0.15, z], r: [0, i % 2 ? HALF_PI : 0, HALF_PI] });
  }
  for (let i = 0; i < 5; i++) m.add(G.torus(0.08, 0.025, 5, 10), iron, { p: [-0.95, -0.4 - i * 0.1, 0.2 + i * 0.05], r: [i % 2 ? HALF_PI : 0, 0, 0] });
  m.add(G.rbox(0.26, 0.24, 0.1, 0.04), brass, { p: [-0.95, -0.82, 0.42] });
  m.add(G.torus(0.09, 0.025, 5, 12, Math.PI), iron, { p: [-0.95, -0.68, 0.42] });
  m.add(G.box(0.04, 0.08, 0.02), M.glow(c.accent), { p: [-0.95, -0.84, 0.48], shadow: false });
  // Four stubby clawed feet at the corners.
  [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.5], [0.7, -0.5]].forEach(([x, z], i) => {
    const foot = part(m, { k: 'swing', ax: 'x', amp: 0.4, ph: (i % 2 ^ (i > 1 ? 1 : 0)) ? Math.PI : 0 }, { p: [x, -0.56, z] });
    foot.add(G.cyl(0.12, 0.1, 0.26, 8), leather, { p: [0, -0.13, 0] });
    for (const dx of [-0.08, 0, 0.08]) foot.add(G.cone(0.04, 0.16, 5), brass, { p: [dx, -0.32, 0.1], r: [HALF_PI + 0.4, 0, 0] });
  });
  // A few loose pages, caught in its wake.
  for (const [x, y, z, a] of [[-0.4, 0.9, -0.6, 0.6], [0.55, 0.75, -0.9, -0.8], [0.0, 1.0, -1.05, 0.2]]) {
    m.add(G.box(0.3, 0.012, 0.38), page, { p: [x, y, z], r: [a, a * 1.5, a * 0.5] });
  }
}

function loosePage(m, c) {
  // A single loose page folded into a little tent, scurrying on two inky legs.
  const paper = M.paint(c.color, { gloss: 0.25, glow: 0.22 });
  paper.side = THREE.DoubleSide;
  const ink = M.paint(c.accent, { gloss: 0.6 });
  for (const s of [-1, 1]) {
    m.add(G.box(0.05, 1.0, 1.15), paper, { p: [s * 0.3, -0.18, 0], r: [0, 0, s * 0.55] });
    for (let i = 0; i < 4; i++) m.add(G.box(0.012, 0.04, 0.7 - (i === 3 ? 0.3 : 0)), ink, { p: [s * (0.24 + i * 0.1), 0.1 - i * 0.16, 0], r: [0, 0, s * 0.55], shadow: false });
  }
  m.add(G.box(0.1, 0.05, 1.15), paper, { p: [0, 0.27, 0] });                                      // the crease
  m.add(G.cone(0.1, 0.2, 4), M.paint(0xe0475a, { gloss: 0.4, glow: 0.4 }), { p: [0.3, 0.35, -0.45], r: [0, 0, -0.6] });   // dog-ear
  eyes(m, { x: 0.18, y: -0.1, z: 0.6, r: 0.16 });
  legs(m, ink, ink, { x: 0.2, hip: -0.62, len: 0.3, r: 0.06, amp: 1 });
}

function paperStack(m, enemy, c) {
  // A teetering stack of loose sheets tied up with red string, a paperclip
  // on top. Every sheet is already sliding: one hit and they all go.
  if (enemy.mini) return loosePage(m, c);
  const paper = M.paint(c.color, { gloss: 0.25, glow: 0.18 });
  const edge = PAGES();
  const string = M.paint(c.accent, { gloss: 0.5, glow: 0.3 });
  const ink = M.paint(0x2a1f3a, { gloss: 0.6 });
  for (let i = 0; i < 9; i++) {
    const y = -0.62 + i * 0.16;
    const sx = Math.sin(i * 2.3) * 0.08, sz = Math.cos(i * 1.7) * 0.08, ry = Math.sin(i * 1.3) * 0.22;
    m.add(G.box(1.1, 0.13, 1.3), i % 2 ? paper : edge, { p: [sx, y, sz], r: [0, ry, Math.sin(i) * 0.03] });
    m.add(G.box(1.12, 0.012, 1.32), ink, { p: [sx, y + 0.065, sz], r: [0, ry, Math.sin(i) * 0.03], shadow: false });
  }
  // One sheet sliding loose off the top, and one blowing away behind.
  m.add(G.box(0.9, 0.03, 1.1), paper, { p: [0.4, 0.86, -0.1], r: [0.1, 0.5, -0.35] });
  m.add(G.box(0.5, 0.02, 0.6), paper, { p: [-0.5, 0.75, -0.75], r: [0.7, 0.4, 0.5] });
  // The string, tied in a cross, with a bow on top.
  m.add(G.box(1.18, 1.5, 0.05), string, { p: [0, 0.03, 0] });
  m.add(G.box(0.05, 1.5, 1.38), string, { p: [0, 0.03, 0] });
  for (const s of [-1, 1]) m.add(G.torus(0.13, 0.035, 5, 12), string, { p: [s * 0.14, 0.86, 0], r: [0, 0, s * 0.5] });
  // A paperclip.
  m.add(G.torus(0.14, 0.025, 4, 14), M.metal(0xdfe6ee), { p: [-0.42, 0.62, 0.66], s: [0.7, 1.6, 1] });
  // Face on the front edge.
  eyes(m, { x: 0.24, y: 0.18, z: 0.68, r: 0.15, brow: -0.35, browMat: ink });
  m.add(G.torus(0.08, 0.025, 5, 10, Math.PI), M.glow(0x7a1626), { p: [0, -0.05, 0.68], shadow: false });   // worried mouth
  legs(m, ink, ink, { x: 0.32, hip: -0.68, len: 0.26, r: 0.07, amp: 0.8 });
}

function bookendKnight(m, enemy, c) {
  // A cast-iron knight-head bookend come to life: a chess knight's horse head
  // on a plinth, carrying its own L-shaped brass bookend as a tower shield.
  const iron = M.paint(c.color, { gloss: 0.6, glow: 0.1 });
  const brass = M.metal(c.accent, { rough: 0.3 });
  brass.emissive = new THREE.Color(0x4a2a00);
  brass.emissiveIntensity = 0.35;
  const felt = M.matte(0x1f5a3a);
  // Plinth body.
  m.add(G.lathe([[0.55, 0], [0.58, 0.08], [0.48, 0.16], [0.4, 0.4], [0.36, 0.7], [0, 0.72]], 20), iron, { p: [0, -0.7, -0.1] });
  m.add(G.cyl(0.6, 0.6, 0.06, 20), felt, { p: [0, -0.68, -0.1] });
  // The horse head, chin tucked, facing forward.
  m.add(G.sphere(0.32, 14, 10), iron, { p: [0, 0.18, -0.15], s: [0.9, 1.3, 1] });                  // neck
  m.add(G.rbox(0.42, 0.34, 0.66, 0.12), iron, { p: [0, 0.5, 0.14], r: [0.45, 0, 0] });             // muzzle
  m.add(G.sphere(0.27, 12, 10), iron, { p: [0, 0.58, -0.08] });                                    // brow
  for (const s of [-1, 1]) {
    m.add(G.cone(0.08, 0.26, 6), iron, { p: [s * 0.13, 0.9, -0.12], r: [-0.2, 0, -s * 0.2] });      // ears
    m.add(G.sphere(0.06, 8, 6), M.glow(0x16121c), { p: [s * 0.08, 0.26, 0.38], shadow: false });  // nostrils
  }
  // Mane: a crest of brass plates down the back of the neck.
  for (let i = 0; i < 5; i++) m.add(G.box(0.06, 0.18, 0.12), brass, { p: [0, 0.78 - i * 0.16, -0.34 - i * 0.03], r: [-0.3 - i * 0.12, 0, 0] });
  eyes(m, { x: 0.2, y: 0.62, z: 0.12, r: 0.09, color: 0xfff27a, brow: 0.5, browMat: brass });
  // The shield: the brass bookend's upright plate, held in front, with a
  // book stamped into it and a gilt rim.
  const shield = part(m, { k: 'swing', ax: 'x', amp: 0.1, ph: 0 }, { p: [0.08, -0.1, 0.62] });
  shield.add(G.rbox(1.3, 1.4, 0.08, 0.06), brass);
  shield.add(G.rbox(1.38, 0.1, 0.5, 0.03), brass, { p: [0, -0.7, -0.2] });                         // the foot of the L
  shield.add(G.rbox(1.14, 1.24, 0.03, 0.04), M.paint(0x24346e, { gloss: 0.6, glow: 0.15 }), { p: [0, 0, 0.05] });
  for (let i = 0; i < 4; i++) {
    const x = -0.36 + i * 0.24;
    shield.add(G.rbox(0.18, 0.8 - (i % 2) * 0.12, 0.04, 0.02), M.paint(BINDINGS[(i * 3) % 8], { gloss: 0.5, glow: 0.12 }), { p: [x, -0.1 - (i % 2) * 0.06, 0.08] });
    shield.add(G.box(0.18, 0.04, 0.05), GILT(), { p: [x, 0.12 - (i % 2) * 0.12, 0.09] });
  }
  // A hoof gripping the edge, and a stubby leg pair under the plinth.
  m.add(G.tube([[0.3, 0.1, -0.05], [0.55, 0.0, 0.25], [0.66, 0.05, 0.55]], 0.08, 6), iron);
  legs(m, iron, felt, { x: 0.26, hip: -0.7, len: 0.22, r: 0.1, amp: 0.5 });
}

function gluePot(m, enemy, c) {
  // A pot of bookbinder's glue, white glue running down its sides, a brush
  // stuck in the top and a green label with a cross: it mends spines.
  const pot = M.paint(c.color, { gloss: 0.7, glow: 0.2 });
  const glue = M.paint(0xfbf8ee, { gloss: 0.95, glow: 0.3 });
  const heal = M.glow(c.accent);
  const wood = OAK();
  m.add(G.lathe([[0, 0], [0.52, 0], [0.6, 0.08], [0.62, 0.5], [0.58, 0.95], [0.48, 1.05], [0.5, 1.12], [0, 1.12]], 22), pot, { p: [0, -0.86, 0] });
  m.add(G.torus(0.5, 0.06, 6, 22), pot, { p: [0, 0.26, 0], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(0.46, 0.46, 0.04, 20), glue, { p: [0, 0.25, 0] });
  // Glue running over the lip and down the sides.
  for (const [a, len] of [[0.3, 0.5], [1.4, 0.3], [2.5, 0.65], [3.6, 0.4], [4.7, 0.55], [5.6, 0.35]]) {
    m.add(G.capsule(0.07, len, 8), glue, { p: [Math.sin(a) * 0.57, 0.28 - len, Math.cos(a) * 0.57] });
  }
  // The label: cream, with a glowing green cross.
  m.add(G.sleeve(0.625, 0.62, 0.36, 22, 1), PAGES(), { p: [0, -0.4, 0] });
  m.add(G.box(0.3, 0.09, 0.03), heal, { p: [0, -0.4, 0.64], shadow: false });
  m.add(G.box(0.09, 0.3, 0.03), heal, { p: [0, -0.4, 0.64], shadow: false });
  // The brush, standing in the glue, bristles dripping.
  const brush = part(m, { k: 'swing', ax: 'z', amp: 0.15, f: 1, ph: 0 }, { p: [0.1, 0.25, -0.1] });
  brush.add(G.cyl(0.05, 0.06, 0.8, 8), wood, { p: [0, 0.45, 0], r: [0, 0, -0.25] });
  brush.add(G.cyl(0.075, 0.075, 0.12, 8), M.metal(0xd4a24a), { p: [-0.03, 0.08, 0], r: [0, 0, -0.25] });
  brush.add(G.sphere(0.1, 8, 6), glue, { p: [-0.005, 0.0, 0], s: [1, 1.4, 1] });
  // A soft green halo hovering over the pot.
  const halo = part(m, { k: 'pulse', f: 3, amp: 0.25 }, { p: [0, 0.55, 0] });
  halo.add(G.torus(0.32, 0.035, 6, 20), M.energy(c.accent, 0.6), { r: [HALF_PI, 0, 0], shadow: false });
  // Face, and stubby arms holding a strip of binding tape.
  eyes(m, { x: 0.2, y: 0.02, z: 0.6, r: 0.13 });
  m.add(G.torus(0.08, 0.025, 5, 10, Math.PI), M.glow(0x3a1f4a), { p: [0, -0.14, 0.62], r: [0, 0, Math.PI], shadow: false });
  for (const s of [-1, 1]) {
    const arm = part(m, { k: 'swing', ax: 'x', amp: 0.35, ph: s > 0 ? Math.PI : 0 }, { p: [s * 0.6, -0.2, 0.05] });
    arm.add(G.tube([[0, 0, 0], [s * 0.12, -0.05, 0.18], [s * 0.05, 0.05, 0.34]], 0.05, 6), pot);
    arm.add(G.sphere(0.08, 8, 6), pot, { p: [s * 0.05, 0.06, 0.36] });
  }
  m.add(G.box(0.9, 0.08, 0.02), M.paint(0x7dffb0, { gloss: 0.5, glow: 0.5 }), { p: [0, -0.12, 0.42] });
  legs(m, pot, M.paint(0x2a1f3a, { gloss: 0.6 }), { x: 0.26, hip: -0.84, len: 0.1, r: 0.08, amp: 0.8 });
}

const ENEMIES = {
  SPLITTER: paperStack,
  SHIELDER: bookendKnight,
  HEALER: gluePot,
  SWARM: footnote,
  FIRE: matchbook,
  FLYING: paperback,
  ARMORED: encyclopediaGolem,
  ELITE: shushingSpectre,
  FLYING_FIRE: manuscript,
  BOSS: overdueTome
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: block parquet, polished, laid in alternating squares. */
function paintFloor(ctx, size) {
  const n = 8, b = size / n, strips = 4, sw = b / strips;
  const tones = ['#8f5e36', '#83552f', '#9a6a3e', '#7b4e2b', '#93643a', '#875a33'];
  let k = 0;
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const across = (bx + by) % 2 === 0;
      for (let s = 0; s < strips; s++) {
        const tone = tones[(k++ * 7 + bx * 3 + by * 5) % tones.length];
        ctx.fillStyle = tone;
        const x = bx * b + (across ? 0 : s * sw), y = by * b + (across ? s * sw : 0);
        const w = across ? b : sw, h = across ? sw : b;
        ctx.fillRect(x, y, w, h);
        // Grain along each strip.
        ctx.strokeStyle = s % 2 ? 'rgba(60, 30, 12, 0.18)' : 'rgba(255, 220, 170, 0.1)';
        ctx.lineWidth = 1;
        for (let g = 1; g < 3; g++) {
          ctx.beginPath();
          if (across) {
            const gy = y + (g / 3) * h;
            ctx.moveTo(x, gy);
            ctx.bezierCurveTo(x + w * 0.3, gy - 1.5, x + w * 0.7, gy + 1.5, x + w, gy);
          } else {
            const gx = x + (g / 3) * w;
            ctx.moveTo(gx, y);
            ctx.bezierCurveTo(gx + 1.5, y + h * 0.3, gx - 1.5, y + h * 0.7, gx, y + h);
          }
          ctx.stroke();
        }
        // The seam between strips.
        ctx.fillStyle = 'rgba(40, 20, 8, 0.45)';
        if (across) ctx.fillRect(x, y, w, 1.2); else ctx.fillRect(x, y, 1.2, h);
      }
      // The block's own edge, darker.
      ctx.strokeStyle = 'rgba(36, 18, 6, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx * b + 1, by * b + 1, b - 2, b - 2);
    }
  }
  // Polish: a soft sheen across the boards, and the odd worn patch.
  const sheen = ctx.createLinearGradient(0, 0, size, size);
  sheen.addColorStop(0, 'rgba(255, 230, 190, 0.07)');
  sheen.addColorStop(0.5, 'rgba(255, 230, 190, 0)');
  sheen.addColorStop(1, 'rgba(255, 230, 190, 0.07)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
  for (const [x, y, r] of [[150, 340, 46], [400, 120, 38]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255, 220, 170, 0.08)');
    g.addColorStop(1, 'rgba(255, 220, 170, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/** Deterministic little random, so every library is shelved the same way. */
function shelver(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // a teetering stack of books with a candle on top
      [[0.62, 0.11, 0.48, 0], [0.56, 0.09, 0.44, 0.3], [0.6, 0.12, 0.46, -0.2], [0.5, 0.08, 0.4, 0.5], [0.46, 0.1, 0.36, 0.1]].reduce((y, [w, t, d, ry], i) => {
        book(m, { p: [0, y + t / 2, 0], r: [0, ry, 0], w, t, d, cover: M.paint(BINDINGS[i % 8], { gloss: 0.5, glow: 0.06 }) });
        return y + t;
      }, 0);
      m.add(G.lathe([[0.08, 0], [0.09, 0.015], [0.05, 0.03]], 12), BRASS(), { p: [0, 0.5, 0] });
      m.add(G.cyl(0.04, 0.042, 0.18, 10), WAX(), { p: [0, 0.62, 0] });
      m.add(G.cone(0.03, 0.09, 8), M.glow(0xffb347), { p: [0, 0.76, 0], shadow: false });
      m.add(G.sphere(0.12, 8, 6), M.energy(0xffb347, 0.2), { p: [0, 0.76, 0], shadow: false });
      break;
    }
    case 1: { // a terrestrial globe on a turned stand
      m.add(G.lathe([[0.24, 0], [0.25, 0.03], [0.1, 0.06], [0.05, 0.1], [0.04, 0.26], [0.07, 0.3]], 16), WALNUT(), { p: [0, 0, 0] });
      m.add(G.sphere(0.26, 20, 14), M.paint(0x2a6a8a, { gloss: 0.6, glow: 0.12 }), { p: [0, 0.58, 0] });
      for (const [x, y, z, s] of [[0.1, 0.66, 0.2, 0.12], [-0.15, 0.52, 0.18, 0.1], [0.05, 0.48, -0.22, 0.13], [-0.2, 0.68, -0.08, 0.08]]) {
        m.add(G.sphere(s, 8, 6), M.paint(0xc9b06a, { gloss: 0.4, glow: 0.12 }), { p: [x, y, z], s: [1, 0.7, 0.5] });
      }
      m.add(G.torus(0.29, 0.014, 6, 28), BRASS(), { p: [0, 0.58, 0], r: [0, HALF_PI, 0.4] });
      break;
    }
    case 2: { // a lectern with the register open on it
      m.add(G.rbox(0.42, 0.05, 0.34, 0.02), WALNUT(), { p: [0, 0.025, 0] });
      m.add(G.lathe([[0.06, 0], [0.05, 0.1], [0.04, 0.45], [0.07, 0.5]], 10), WALNUT(), { p: [0, 0.05, 0] });
      m.add(G.rbox(0.5, 0.04, 0.38, 0.015), WALNUT(), { p: [0, 0.6, 0], r: [0.45, 0, 0] });
      for (const s of [-1, 1]) m.add(G.box(0.22, 0.03, 0.32), PAGES(), { p: [s * 0.115, 0.63, 0.01], r: [0.45, 0, s * 0.08] });
      m.add(G.tube([[0.02, 0.66, 0.1], [0.04, 0.55, 0.22], [0.03, 0.45, 0.24]], 0.012, 4), M.paint(0xe0475a, { glow: 0.3 }));
      break;
    }
    case 3: { // an hourglass, running out
      for (const y of [0.02, 0.62]) m.add(G.rbox(0.42, 0.05, 0.42, 0.02), WALNUT(), { p: [0, y, 0] });
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3; m.add(G.cyl(0.02, 0.02, 0.58, 6), WALNUT(), { p: [Math.cos(a) * 0.17, 0.32, Math.sin(a) * 0.17] }); }
      m.add(G.lathe([[0.14, 0], [0.12, 0.1], [0.03, 0.27], [0.12, 0.44], [0.14, 0.54]], 16), M.glass(0xe6f8ff, 0.35), { p: [0, 0.05, 0] });
      m.add(G.lathe([[0.13, 0], [0.1, 0.06], [0, 0.1]], 14), M.paint(0xe0b860, { gloss: 0.3, glow: 0.2 }), { p: [0, 0.06, 0] });
      m.add(G.lathe([[0.09, 0], [0.04, 0.08], [0.01, 0.12]], 14), M.paint(0xe0b860, { gloss: 0.3, glow: 0.2 }), { p: [0, 0.38, 0] });
      break;
    }
    default: { // a basket of scrolls
      m.add(G.lathe([[0.2, 0], [0.24, 0.05], [0.28, 0.3], [0.3, 0.32]], 16), M.paint(0x9a6a3a, { gloss: 0.15 }), { p: [0, 0, 0] });
      for (const y of [0.1, 0.2]) m.add(G.torus(0.26 + y * 0.12, 0.012, 4, 18), M.paint(0x6a4a2a), { p: [0, y, 0], r: [HALF_PI, 0, 0] });
      for (const [x, z, ax, az, h] of [[0.06, 0.05, 0.2, -0.1, 0.6], [-0.1, 0, -0.15, 0.2, 0.5], [0.05, -0.1, 0.1, 0.3, 0.55], [-0.04, 0.12, -0.3, -0.2, 0.45]]) {
        m.add(G.cyl(0.05, 0.05, h, 10), PAGES(), { p: [x, 0.18 + h / 2, z], r: [ax, 0, az] });
        m.add(G.torus(0.052, 0.012, 4, 10), M.paint(0xb3102a, { glow: 0.2 }), { p: [x, 0.3 + h * 0.3, z], r: [HALF_PI + ax, 0, az] });
      }
    }
  }
  return g;
}

/**
 * A run of shelving `w` wide and `h` tall, facing +Z, every shelf full. Built
 * into `m` at x, z.
 */
function bookcase(m, x, z, w, h, seed, { d = 1.2, ladder = false } = {}) {
  const rnd = shelver(seed);
  const wood = WALNUT();
  const dark = M.paint(0x24130a, { gloss: 0.2 });
  const covers = BINDINGS.map(col => M.paint(col, { gloss: 0.45, glow: 0.07 }));
  const gilt = GILT();
  const t = 0.22, shelf = 1.5;
  m.add(G.box(w, h, 0.12), dark, { p: [x, h / 2, z - d / 2 + 0.06] });                                // back
  for (const s of [-1, 1]) m.add(G.box(t, h, d), wood, { p: [x + s * (w / 2 - t / 2), h / 2, z] });   // ends
  m.add(G.rbox(w + 0.5, 0.5, d + 0.3, 0.08), wood, { p: [x, h + 0.25, z + 0.05] });                     // crown
  m.add(G.box(w + 0.3, 0.12, d + 0.15), gilt, { p: [x, h - 0.02, z + 0.05] });
  m.add(G.box(w + 0.1, 0.4, d + 0.1), wood, { p: [x, 0.2, z + 0.02] });                                 // plinth
  for (let y = 0.4; y < h - 0.3; y += shelf) {
    m.add(G.box(w - t * 2, 0.08, d - 0.1), wood, { p: [x, y, z] });
    // The books on this shelf.
    let bx = x - w / 2 + t + 0.04;
    const end = x + w / 2 - t - 0.04;
    while (bx < end - 0.2) {
      const bw = 0.16 + rnd() * 0.22, bh = (0.75 + rnd() * 0.5) * (shelf - 0.2);
      if (rnd() < 0.07) { bx += 0.3; continue; }                                                     // a gap
      const lean = rnd() < 0.08 ? 0.18 : 0;
      const ci = Math.floor(rnd() * covers.length);
      m.add(G.box(bw, bh, d * 0.72), covers[ci], { p: [bx + bw / 2, y + 0.04 + bh / 2, z + 0.02], r: [0, 0, -lean] });
      if (rnd() < 0.6) for (const f of [0.2, 0.8]) m.add(G.box(bw + 0.01, 0.04, 0.02), gilt, { p: [bx + bw / 2 - lean * bh * (f - 0.5), y + 0.04 + bh * f, z + 0.02 + d * 0.36], r: [0, 0, -lean] });
      bx += bw + 0.01;
    }
  }
  if (ladder) {
    // A rolling ladder hooked on a brass rail, leaned out from the shelves.
    const brass = BRASS();
    m.add(G.cyl(0.05, 0.05, w, 8), brass, { p: [x, h - 0.6, z + d / 2 + 0.25], r: [0, 0, HALF_PI] });
    const lx = x + w * 0.2, foot = z + d / 2 + 2.0, top = h - 0.6;
    for (const s of [-1, 1]) m.add(G.tube([[lx + s * 0.4, 0.05, foot], [lx + s * 0.4, top, z + d / 2 + 0.3]], 0.07, 6), OAK());
    const steps = Math.floor(top / 0.55);
    for (let i = 1; i < steps; i++) {
      const f = i / steps;
      m.add(G.cyl(0.04, 0.04, 0.8, 6), OAK(), { p: [lx, f * top, foot + (z + d / 2 + 0.3 - foot) * f], r: [0, 0, HALF_PI] });
    }
    for (const s of [-1, 1]) m.add(G.cyl(0.14, 0.14, 0.08, 12), brass, { p: [lx + s * 0.4, 0.14, foot], r: [0, 0, HALF_PI] });
  }
}

/** A candle on a dish, `k` times life size, lit. */
function candle(m, x, y, z, k = 1, h = 0.5) {
  m.add(G.lathe([[0.2 * k, 0], [0.22 * k, 0.03 * k], [0.08 * k, 0.06 * k]], 12), BRASS(), { p: [x, y, z] });
  m.add(G.cyl(0.07 * k, 0.075 * k, h * k, 10), WAX(), { p: [x, y + (0.06 + h / 2) * k, z] });
  m.add(G.cone(0.05 * k, 0.16 * k, 8), M.glow(0xffc56b), { p: [x, y + (0.15 + h) * k, z], shadow: false });
  m.add(G.sphere(0.25 * k, 8, 6), M.energy(0xffb347, 0.22), { p: [x, y + (0.15 + h) * k, z], shadow: false });
}

/** A green banker's lamp, `k` times life size. */
function bankersLamp(m, x, y, z, k = 1) {
  const brass = BRASS();
  m.add(G.lathe([[0.3 * k, 0], [0.32 * k, 0.04 * k], [0.15 * k, 0.1 * k], [0.06 * k, 0.12 * k]], 16), brass, { p: [x, y, z] });
  m.add(G.cyl(0.03 * k, 0.03 * k, 0.6 * k, 8), brass, { p: [x, y + 0.4 * k, z] });
  m.add(new THREE.CylinderGeometry(0.36 * k, 0.36 * k, 0.4 * k, 18, 1, true, 0, Math.PI), M.paint(0x1f7a40, { gloss: 0.9, glow: 0.45 }), { p: [x, y + 0.78 * k, z], r: [0, 0, HALF_PI], s: [1, 1, 0.55] });
  m.add(G.box(0.68 * k, 0.04 * k, 0.32 * k), M.glow(0xfff1c2), { p: [x, y + 0.72 * k, z], shadow: false });
  m.add(G.sphere(0.8 * k, 10, 8), M.energy(0xffe6a8, 0.12), { p: [x, y + 0.5 * k, z], shadow: false });
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

  // The far wall: shelving three bays wide, a rose window over the middle bay.
  const wall = new THREE.Group();
  let m = modeller(wall, 1);
  const span = Math.max(26, hw * 2 + 6);
  const bay = span / 3;
  bookcase(m, -bay, 0, bay - 0.3, 11, 7, { ladder: true });
  bookcase(m, bay, 0, bay - 0.3, 11, 19);
  bookcase(m, 0, 0, bay - 0.3, 6.2, 31);
  // The window: tracery round a wheel of coloured glass.
  const stone = M.paint(0x5a5068, { gloss: 0.3, glow: 0.08 });
  const glass = [0x8f7bff, 0x5fe3d0, 0xffc94a, 0xe0475a, 0x6ab0ff, 0x7dffb0];
  const wy = 11.2, wr = 3.6;
  m.add(new THREE.CircleGeometry(wr, 32), M.glow(0x2a1a4a), { p: [0, wy, -0.55], shadow: false });
  for (let i = 0; i < 12; i++) {
    m.add(new THREE.CircleGeometry(wr * 0.92, 4, (i / 12) * TAU + 0.04, TAU / 12 - 0.08), M.glow(glass[i % glass.length], 0.85), { p: [0, wy, -0.5], shadow: false });
    m.add(G.box(0.12, wr, 0.2), stone, { p: [Math.cos((i / 12) * TAU) * wr / 2, wy + Math.sin((i / 12) * TAU) * wr / 2, -0.4], r: [0, 0, (i / 12) * TAU + HALF_PI] });
  }
  m.add(new THREE.CircleGeometry(wr * 0.3, 20), M.glow(0xfff1c2), { p: [0, wy, -0.45], shadow: false });
  m.add(G.torus(wr, 0.3, 8, 40), stone, { p: [0, wy, -0.4] });
  m.add(G.torus(wr * 0.32, 0.12, 6, 24), stone, { p: [0, wy, -0.38] });
  m.add(new THREE.CircleGeometry(wr * 1.6, 32), M.energy(0x8f7bff, 0.08), { p: [0, wy, -0.3], shadow: false });
  place(wall, 0, -hh - 9.5);

  // Shelving down both sides, facing in.
  for (const s of [-1, 1]) {
    const side = new THREE.Group();
    m = modeller(side, 1);
    const len = Math.max(18, hh * 2 + 4);
    bookcase(m, 0, 0, len, 9, s > 0 ? 43 : 57, { ladder: s < 0 });
    place(side, s * (hw + 9.5), 0, -s * HALF_PI);
  }

  // The grandfather clock, standing out from the left-hand shelves, at midnight.
  const clock = new THREE.Group();
  m = modeller(clock, 1);
  const case_ = M.paint(0x3a1f10, { gloss: 0.6 });
  m.add(G.rbox(2.2, 0.6, 1.4, 0.1), case_, { p: [0, 0.3, 0] });
  m.add(G.rbox(1.9, 2.6, 1.2, 0.1), case_, { p: [0, 1.9, 0] });
  m.add(G.rbox(1.5, 4.0, 1.0, 0.08), case_, { p: [0, 5.2, 0] });
  m.add(G.box(0.9, 3.0, 0.1), M.glass(0xffd9a0, 0.35), { p: [0, 5.0, 0.52] });
  m.add(G.cyl(0.03, 0.03, 2.2, 6), BRASS(), { p: [0, 5.4, 0.42] });
  m.add(G.cyl(0.32, 0.32, 0.08, 18), BRASS(), { p: [0, 4.2, 0.42], r: [HALF_PI, 0, 0] });               // pendulum bob
  m.add(G.rbox(2.2, 2.4, 1.3, 0.12), case_, { p: [0, 8.4, 0] });
  m.add(G.cyl(0.9, 0.9, 0.1, 28), M.glow(0xf6ecd2), { p: [0, 8.4, 0.66], r: [HALF_PI, 0, 0], shadow: false });
  m.add(G.torus(0.92, 0.07, 6, 28), BRASS(), { p: [0, 8.4, 0.7] });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; m.add(G.box(0.06, 0.16, 0.02), BLACK(), { p: [Math.sin(a) * 0.75, 8.4 + Math.cos(a) * 0.75, 0.72], r: [0, 0, -a], shadow: false }); }
  m.add(G.box(0.07, 0.7, 0.03), BLACK(), { p: [0, 8.72, 0.74], shadow: false });                         // both hands at twelve
  m.add(G.box(0.1, 0.5, 0.03), BLACK(), { p: [0.02, 8.64, 0.75], r: [0, 0, -0.04], shadow: false });
  m.add(G.plate([[-1.2, 0], [1.2, 0], [0, 1.0]], 1.3), case_, { p: [0, 9.6, 0] });                       // pediment
  m.add(G.sphere(0.2, 10, 8), GILT(), { p: [0, 10.7, 0] });
  place(clock, -hw - 6.5, -hh - 3, 0.5);

  // A reading table off the near right corner: lamps lit, candles, a pile of books.
  const table = new THREE.Group();
  m = modeller(table, 1);
  const top = 2.4;
  m.add(G.rbox(6.4, 0.25, 3.0, 0.08), WALNUT(), { p: [0, top, 0] });
  m.add(G.box(6.0, 0.04, 2.6), M.paint(0x1f5a3a, { gloss: 0.3 }), { p: [0, top + 0.14, 0] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) m.add(G.lathe([[0.18, 0], [0.22, 0.3], [0.12, 0.8], [0.16, 1.6], [0.12, 2.3]], 10), WALNUT(), { p: [sx * 2.8, 0, sz * 1.2] });
  bankersLamp(m, -1.6, top + 0.16, -0.5, 1.6);
  bankersLamp(m, 1.9, top + 0.16, -0.5, 1.6);
  candle(m, 0.4, top + 0.16, 0.6, 1.8, 0.6);
  [0, 1, 2, 3].reduce((y, i) => {
    book(m, { p: [-0.4, y + 0.14, 0.7], r: [0, i * 0.35, 0], w: 1.3, t: 0.28, d: 1.0, cover: M.paint(BINDINGS[(i * 3) % 8], { gloss: 0.5, glow: 0.08 }) });
    return y + 0.28;
  }, top + 0.16);
  place(table, hw + 6.5, hh * 0.6, -0.3);

  // Candles on tall stands, down the far side.
  const stands = new THREE.Group();
  m = modeller(stands, 1);
  for (const x of [-hw * 0.6, 0, hw * 0.6]) {
    m.add(G.lathe([[0.6, 0], [0.62, 0.1], [0.2, 0.3], [0.1, 0.5], [0.08, 4.0], [0.2, 4.1], [0.4, 4.3]], 14), BRASS(), { p: [x, 0, 0] });
    candle(m, x, 4.3, 0, 2.0, 0.6);
  }
  place(stands, 0, -hh - 4.2);

  // Candles floating over the stands on every side, the way they do here.
  // One group per side, so the camera can hide whichever side it looks over.
  const rnd = shelver(97);
  for (let side = 0; side < 4; side++) {
    const along = side < 2, s = side % 2 ? 1 : -1;
    const half = along ? hw + 3 : hh + 3;
    const floating = new THREE.Group();
    m = modeller(floating, 1);
    for (let i = 0; i < 7; i++) {
      const f = ((i + 0.5) / 7 * 2 - 1) * half, off = rnd() * 2;
      const x = along ? f : off, z = along ? off : f;
      const h = 0.6 + rnd() * 0.6, y = 5.5 + rnd() * 2.5;
      m.add(G.cyl(0.12, 0.13, h, 10), WAX(), { p: [x, y, z] });
      m.add(G.cone(0.08, 0.26, 8), M.glow(0xffc56b), { p: [x, y + h / 2 + 0.14, z], shadow: false });
      m.add(G.sphere(0.4, 8, 6), M.energy(0xffb347, 0.18), { p: [x, y + h / 2 + 0.14, z], shadow: false });
    }
    if (along) place(floating, 0, s * (hh + 4.5));
    else place(floating, s * (hw + 4.5), 0);
  }

  return out;
}

// ── Projectiles ─────────────────────────────────────────────────────────────
//
// Units: 1 = a shot's radius, nose along +Z (see rendering/projectile-models.js).

const SHOTS = {
  bookmark(m) {
    // A steel bookmark blade, point first, its red ribbon streaming behind.
    m.add(G.plate([[-0.35, -1.2], [0.35, -1.2], [0.35, 0.9], [0, 1.5], [-0.35, 0.9]], 0.08), M.metal(0xdfe6ee, { rough: 0.2 }), { r: [HALF_PI, 0, 0] });
    m.add(G.box(0.5, 0.12, 0.3), GILT(), { p: [0, 0, -1.0] });
    m.add(G.tube([[0, 0, -1.2], [0.25, 0.05, -1.7], [-0.2, -0.05, -2.2], [0.1, 0, -2.6]], 0.14, 5), M.paint(0xe0475a, { gloss: 0.5, glow: 0.45 }));
  },
  quillDart(m) {
    // A flick off the quill: a steel nib dripping ink, a wisp of feather.
    m.add(G.cone(0.32, 1.1, 8), M.metal(0xd4a24a, { rough: 0.25 }), { p: [0, 0, 0.7], r: [HALF_PI, 0, 0] });
    m.add(G.sphere(0.3, 8, 6), INK(), { p: [0, 0, 1.1], s: [1, 1, 1.4] });
    const feather = M.paint(0xe8e2ff, { gloss: 0.4, glow: 0.4 });
    feather.side = THREE.DoubleSide;
    m.add(G.plate([[0, 0], [0.5, -0.6], [0.45, -1.8], [0, -2.4], [-0.3, -1.6], [-0.35, -0.6]], 0.04), feather, { p: [0, 0, 0.2], r: [HALF_PI, 0, 0] });
    m.add(G.cyl(0.06, 0.06, 2.6, 5), M.paint(0xf3e6c4, { glow: 0.2 }), { p: [0, 0, -0.9], r: [HALF_PI, 0, 0] });
  },
  inkBlob(m) {
    // A blob of ink, lobbed, wobbling and flinging droplets.
    const ink = M.paint(0x3a2a9a, { gloss: 0.95, glow: 0.3 });
    m.add(G.sphere(1, 14, 10), ink, { s: [1, 0.9, 1.1] });
    m.add(G.cone(0.55, 1.2, 10), ink, { p: [0, 0.1, -1.1], r: [-HALF_PI, 0, 0] });
    for (const [x, y, z, k] of [[0.8, 0.5, 0.3, 0.28], [-0.7, 0.6, -0.4, 0.22], [0.3, -0.7, -0.8, 0.2]]) m.add(G.sphere(k, 8, 6), ink, { p: [x, y, z] });
    m.add(G.sphere(0.25, 8, 6), M.glow(0xb8aaff), { p: [-0.35, 0.55, 0.6], shadow: false });
  },
  hardback(m) {
    // A heavy hardback, flung spine first.
    book(m, { p: [0, 0, 0], r: [0, HALF_PI, 0], w: 2.2, t: 0.9, d: 1.7, cover: M.paint(0x7a1e22, { gloss: 0.5, glow: 0.12 }) });
    m.add(G.rbox(0.9, 0.04, 0.5, 0.02), GILT(), { p: [0, 0.46, 0] });
  },
  overdueStamp(m) {
    // The rubber stamp itself, pad first: red rubber, brass ferrule, wooden knob.
    m.add(G.rbox(1.6, 1.0, 0.25, 0.06), M.paint(0xff4d6d, { gloss: 0.5, glow: 0.45 }), { p: [0, 0, 0.75] });
    m.add(G.rbox(1.7, 1.1, 0.4, 0.08), WALNUT(), { p: [0, 0, 0.45] });
    m.add(G.cyl(0.3, 0.4, 0.4, 12), BRASS(), { p: [0, 0, 0.05], r: [HALF_PI, 0, 0] });
    m.add(G.cyl(0.2, 0.25, 0.9, 10), OAK(), { p: [0, 0, -0.55], r: [HALF_PI, 0, 0] });
    m.add(G.sphere(0.48, 12, 10), OAK(), { p: [0, 0, -1.1] });
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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0xf1e2bd, accent: ctx.accent ?? 0x2a1f3a });
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
