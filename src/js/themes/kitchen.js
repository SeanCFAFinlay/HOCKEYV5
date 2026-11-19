// KITCHEN NIGHTMARE
//
// Defend the fridge. The arena is a countertop; the enemies are everything that
// comes for your food — ants, flies, beetles, cockroaches, a rat — and the
// towers are the appliances fighting back.
//
// This file is the reference theme: pack (names), visuals (look), kit (models).
// See js/themes/index.js for how the three plug in.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Pack: names and menu text ───────────────────────────────────────────────

export const pack = {
  id: 'kitchen',
  name: 'Kitchen Nightmare',
  shortName: 'Kitchen',
  icon: 'toaster',
  sortOrder: 40,
  description: 'Defend the fridge. Appliances versus everything that crawls, buzzes and gnaws.',
  color: '#ff8a3d',
  groundColor: 0xe9dcc3,
  pathColor: 0xcbb994,
  envColor: 0x1a0f0a,
  environmentSkin: { arena: 'countertop', floor: 'tile', markerIcon: '🧊' },
  enemySkin: { body: 'bug', icon: 'bug' },
  recommendedTowers: ['t1', 't4', 't6'],
  pressureType: 'ground_swarm',
  // Keyed by the shared tower ids (t1 fast, t2 sniper, t3 splash, t4 slow,
  // t5 chokepoint, t6 chain, t7 burn, t8 boss killer).
  towers: {
    t1: { nm: 'Toaster', icon: 'toaster', clr: '#ff8a3d' },
    t2: { nm: 'Pepper Mill', icon: 'grinder', clr: '#c9a27a' },
    t3: { nm: 'Stand Mixer', icon: 'whisk', clr: '#ff5d8f' },
    t4: { nm: 'Spray Bottle', icon: 'spray', clr: '#38bdf8' },
    t5: { nm: 'Frying Pan', icon: 'pan', clr: '#94a3b8' },
    t6: { nm: 'Microwave', icon: 'microwave', clr: '#f5e663' },
    t7: { nm: 'Blowtorch', icon: 'torch', clr: '#ff4d2e' },
    t8: { nm: 'Pressure Cooker', icon: 'pot', clr: '#ffc928' }
  },
  // Keyed by the shared enemy ids (e1 swarm, e2 fire, e3 flying, e4 armoured,
  // e5 elite, e6 flying fire, e7 boss).
  enemies: {
    e1: { nm: 'Ant' },
    e2: { nm: 'Fire Ant' },
    e3: { nm: 'Housefly' },
    e4: { nm: 'Beetle' },
    e5: { nm: 'Cockroach' },
    e6: { nm: 'Wasp' },
    e7: { nm: 'Rat King' }
  },
  maps: [
    ['Breakfast Bar', 'A simple run to the fridge - learn the basics'],
    ['Chopping Board', 'Open centre, two ways in'],
    ['Spice Rack', 'Tight lanes between the jars'],
    ['Sunday Roast', 'Long kitchen, heavy traffic'],
    ['Midnight Snack', 'They come from everywhere'],
    ['Picnic Table', 'Narrow and fast'],
    ['Barbecue', 'Wide open and hot'],
    ['Bake Off', 'Mixed pressure, little room'],
    ['Banquet Hall', 'The big spread'],
    ['Last Supper', 'Everything, all at once']
  ]
};

// ── Visuals ─────────────────────────────────────────────────────────────────

export const visuals = {
  map: {
    background: 0x1a0f0a,
    fog: 0x24140c,
    fogDensity: 0.006,
    floor: {
      base: '#eadfc8',
      meshColor: 0xcfc8ba,
      roughness: 0.34,
      metalness: 0.04,
      emissive: 0x2a1a0c,
      emissiveIntensity: 0.12
    },
    rail: { color: 0x8a5a33, roughness: 0.6, metalness: 0.05 },
    path: { color: 0xffd9a0, emissive: 0x7a4a12, opacity: 0.34, edge: 0xff8a3d },
    buildZone: { color: 0xfff3d6, opacity: 0.1, line: 0xff8a3d },
    obstacle: { accent: 0xff8a3d },
    base: { color: 0x9fe3ff, icon: 'DEFEND FRIDGE' },
    spawn: { color: 0xef4444, icon: 'PESTS' }
  },
  lighting: {
    hemiSky: 0xfff1d6,
    hemiGround: 0x4a2f1c,
    hemiIntensity: 0.42,
    sun: 0xffe2b0,
    sunIntensity: 0.95,
    rim: 0xff8a3d,
    rimIntensity: 0.26,
    accent: 0xff8a3d,
    spotIntensity: 2.6,
    exposure: 0.74
  },
  ui: { accent: '#ff8a3d', dark: '#1a0f0a' },
  crowd: { fans: [0xff8a3d, 0xf5e663, 0xef4444, 0xffffff, 0x7c4a25], seat: 0x4a2f1c },
  // Keys are the shared projectile ids; see config/visual-profiles.js for the
  // mesh and flight vocabularies.
  projectiles: {
    ball: { mesh: 'block', flight: 'lob', trail: 'dust', impact: 'spark', color: 0xd9973f, speed: 9.5, size: 0.9 },
    curveBall: { mesh: 'tracer', flight: 'tracer', trail: 'line', impact: 'spark', color: 0x3a2a1c, speed: 13 },
    headButt: { mesh: 'ring', flight: 'ring', trail: 'shock', impact: 'ring', color: 0xff5d8f, speed: 8.5 },
    tackle: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x7fd6ff, speed: 9.5 },
    glove: { mesh: 'sphere', flight: 'punch', trail: 'gold', impact: 'slam', color: 0xb8c4d6, speed: 8.8, size: 1.1 },
    chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xf5e663, speed: 15 },
    flare: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff5a14, speed: 11, size: 0.85 },
    legend: { mesh: 'sphere', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.3 }
  },
  // Keys are enemy roles, lower case.
  enemies: {
    swarm: { body: 'bug', color: 0x2a1a12, accent: 0x8a5a33 },
    fire: { body: 'bug', color: 0xd9321f, accent: 0xffb347 },
    flying: { body: 'bug', color: 0x2f3a44, accent: 0x9fe3ff },
    armored: { body: 'bug', color: 0x1f5d3a, accent: 0x9be36b },
    elite: { body: 'bug', color: 0x6b3a1c, accent: 0xff8a3d },
    flying_fire: { body: 'bug', color: 0xf5c518, accent: 0x1a1a1a },
    boss: { body: 'bug', color: 0x6f6a66, accent: 0xffd700 }
  },
  towers: { family: 'kitchen', base: 0x3a2618, metal: 0xd7dde5, levelGlow: 0xff8a3d }
};

// ── Towers ──────────────────────────────────────────────────────────────────
//
// Model units: stand on y = 0.12, about 0.85 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale.

const CHROME = () => M.metal(0xdfe6ee);
const BLACK = () => M.matte(0x15171c);

function toaster(m, c) {
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.85, glow: 0.12 });   // flashes when it fires
  m.add(G.rbox(0.5, 0.34, 0.3, 0.07), body, { p: [0, 0.31, 0] });
  m.add(G.rbox(0.52, 0.05, 0.32, 0.02), CHROME(), { p: [0, 0.145, 0] });         // base plate
  m.add(G.rbox(0.4, 0.03, 0.2, 0.012), CHROME(), { p: [0, 0.485, 0] });          // top plate
  for (const x of [-0.09, 0.09]) m.add(G.box(0.13, 0.02, 0.15), BLACK(), { p: [x, 0.5, 0] });   // slots
  // Lever and dial on the front.
  m.add(G.box(0.03, 0.2, 0.012), BLACK(), { p: [0.2, 0.33, 0.156] });
  m.add(G.rbox(0.08, 0.035, 0.04, 0.012), CHROME(), { p: [0.2, 0.39, 0.175] });
  m.add(G.cyl(0.035, 0.035, 0.02, 16), CHROME(), { p: [-0.16, 0.25, 0.158], r: [Math.PI / 2, 0, 0] });
  // Glowing elements seen through the slots, and two slices mid-pop.
  for (const x of [-0.09, 0.09]) m.add(G.box(0.11, 0.012, 0.13), M.glow(0xff5a14), { p: [x, 0.492, 0] });
  const toast = M.paint(0xd9973f, { gloss: 0.15 });
  const crust = M.matte(0x8a5a2b);
  [-0.09, 0.09].forEach((x, i) => {
    const slice = m.group({ p: [x, 0.6 + i * 0.05, 0] });
    slice.add(G.rbox(0.03, 0.2, 0.13, 0.012), toast, { p: [0, 0, 0] });
    slice.add(G.rbox(0.034, 0.03, 0.134, 0.012), crust, { p: [0, 0.09, 0] });
    m.anim(slice.object, 'bob');
  });
  for (const [x, z] of [[-0.2, -0.11], [0.2, -0.11], [-0.2, 0.11], [0.2, 0.11]]) {
    m.add(G.cyl(0.03, 0.035, 0.03, 10), BLACK(), { p: [x, 0.125, z] });
  }
}

function pepperMill(m, c) {
  const wood = M.paint(c.color, { gloss: 0.55 });
  // A classic turned mill: foot, waist, shoulder, neck, cap.
  m.add(G.lathe([
    [0.17, 0], [0.19, 0.03], [0.17, 0.08], [0.11, 0.2], [0.09, 0.3], [0.13, 0.42],
    [0.15, 0.5], [0.1, 0.58], [0.07, 0.62], [0.12, 0.68], [0.13, 0.74], [0.08, 0.8], [0, 0.82]
  ]), wood, { p: [0, 0.12, 0] });
  m.add(G.torus(0.105, 0.016), CHROME(), { p: [0, 0.42, 0], r: [Math.PI / 2, 0, 0] });
  m.add(G.torus(0.085, 0.014), CHROME(), { p: [0, 0.73, 0], r: [Math.PI / 2, 0, 0] });
  // The crank on top turns; the barrel it fires from points forward.
  const crank = m.group({ p: [0, 0.95, 0] });
  crank.add(G.cyl(0.02, 0.02, 0.06, 8), CHROME(), { p: [0, 0, 0] });
  crank.add(G.rbox(0.2, 0.02, 0.035, 0.008), CHROME(), { p: [0.08, 0.03, 0] });
  crank.add(G.sphere(0.035), M.paint(0x15171c), { p: [0.17, 0.06, 0] });
  m.anim(crank.object, 'spin', { speed: 1.6 });
  m.add(G.cyl(0.035, 0.045, 0.22, 12), BLACK(), { p: [0, 0.6, 0.16], r: [Math.PI / 2, 0, 0] });
  m.add(G.torus(0.04, 0.01, 6, 14), CHROME(), { p: [0, 0.6, 0.27] });
  for (let i = 0; i < 3; i++) m.add(G.sphere(0.02, 8, 6), BLACK(), { p: [-0.05 + i * 0.05, 0.135, 0.2 + (i % 2) * 0.03] });
}

function standMixer(m, c) {
  const body = c.bodyMat || M.paint(c.color, { gloss: 0.9, glow: 0.1 });
  m.add(G.rbox(0.34, 0.06, 0.5, 0.025), body, { p: [0, 0.15, 0.02] });                 // foot
  m.add(G.rbox(0.14, 0.42, 0.14, 0.05), body, { p: [0, 0.37, -0.17] });                // neck
  m.add(G.rbox(0.2, 0.17, 0.46, 0.08), body, { p: [0, 0.62, 0.02] });                  // head
  m.add(G.cyl(0.06, 0.06, 0.03, 16), CHROME(), { p: [0, 0.62, 0.255], r: [Math.PI / 2, 0, 0] });
  m.add(G.sphere(0.022, 8, 6), M.glow(0xffffff), { p: [0.101, 0.62, -0.1] });
  // Steel bowl, turned.
  m.add(G.lathe([[0.05, 0], [0.13, 0.02], [0.19, 0.1], [0.21, 0.2], [0.2, 0.22], [0.185, 0.2], [0.17, 0.11], [0.11, 0.04], [0, 0.03]]), CHROME(), { p: [0, 0.18, 0.1] });
  // Whisk: wire loops on a spindle, spinning.
  const whisk = m.group({ p: [0, 0.5, 0.1] });
  whisk.add(G.cyl(0.015, 0.015, 0.1, 8), CHROME(), { p: [0, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    const wire = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, bulge = Math.sin(t * Math.PI) * 0.1;
      wire.push([Math.cos(a) * bulge * (t < 0.5 ? 1 : -1) * (t < 0.5 ? 1 : -1), -0.04 - Math.sin(t * Math.PI) * 0.17, Math.sin(a) * bulge]);
    }
    whisk.add(G.tube(wire, 0.008, 5), CHROME());
    whisk.add(G.torus(0.1, 0.007, 5, 16), CHROME(), { p: [0, -0.13, 0], r: [Math.PI / 2, 0, a], s: [1, 1, 1] });
  }
  m.anim(whisk.object, 'spin', { speed: 5 });
}

function sprayBottle(m, c) {
  const liquid = M.glass(c.color, 0.62);
  m.add(G.lathe([[0.16, 0], [0.18, 0.04], [0.18, 0.3], [0.15, 0.4], [0.07, 0.48], [0.06, 0.54]]), liquid, { p: [0, 0.12, 0] });
  m.add(G.lathe([[0.15, 0], [0.165, 0.04], [0.165, 0.2], [0, 0.2]]), M.energy(c.color, 0.45), { p: [0, 0.13, 0], shadow: false });
  m.add(G.cyl(0.075, 0.075, 0.06, 16), M.paint(0xffffff, { gloss: 0.6 }), { p: [0, 0.68, 0] });       // collar
  const white = M.paint(0xf4f6f8, { gloss: 0.7 });
  m.add(G.rbox(0.12, 0.13, 0.32, 0.04), white, { p: [0, 0.78, 0.06] });                              // head
  m.add(G.cyl(0.03, 0.04, 0.06, 12), M.paint(c.color, { gloss: 0.8 }), { p: [0, 0.78, 0.25], r: [Math.PI / 2, 0, 0] });   // nozzle
  m.add(G.plate([[0, 0], [0.05, 0], [0.09, -0.16], [0.05, -0.2], [0.02, -0.08]], 0.05), white, { p: [0, 0.72, 0.1], r: [0, -Math.PI / 2, 0] });   // trigger
  m.add(G.tube([[0, 0.66, 0], [0.01, 0.4, 0.01], [-0.03, 0.16, 0.02]], 0.008, 5), white);              // dip tube
  // Label, and a mist puff at the nozzle.
  m.add(G.cyl(0.183, 0.183, 0.13, 20), M.paint(0xffffff, { gloss: 0.3 }), { p: [0, 0.3, 0] });
  const mist = m.add(G.sphere(0.06, 10, 8), M.energy(0xdff6ff, 0.5), { p: [0, 0.78, 0.36], shadow: false });
  m.anim(mist, 'pulse');
}

function fryingPan(m, c) {
  // A weighted stand with a pan on a swinging arm: it clobbers what comes close.
  m.add(G.lathe([[0.2, 0], [0.22, 0.03], [0.12, 0.08], [0.07, 0.14], [0.06, 0.4], [0.09, 0.44], [0, 0.46]]), M.matte(0x2a2d33), { p: [0, 0.12, 0] });
  m.add(G.torus(0.08, 0.018), CHROME(), { p: [0, 0.56, 0], r: [Math.PI / 2, 0, 0] });
  const arm = m.group({ p: [0, 0.62, 0] });
  const iron = M.metal(0x3b4048, { rough: 0.5 });
  arm.add(G.cyl(0.025, 0.03, 0.34, 10), M.paint(0x8a4b22, { gloss: 0.4 }), { p: [0, 0.02, 0.02], r: [Math.PI / 2 - 0.25, 0, 0] });   // handle
  arm.add(G.torus(0.03, 0.008, 6, 12), CHROME(), { p: [0, -0.03, -0.14], r: [0.25, 0, 0] });
  arm.add(G.lathe([[0, 0], [0.17, 0], [0.21, 0.05], [0.22, 0.06], [0.2, 0.05], [0.165, 0.015], [0, 0.015]]), iron, { p: [0, 0.08, 0.36], r: [0.25, 0, 0] });
  arm.add(G.cyl(0.17, 0.17, 0.006, 24), M.paint(c.color, { gloss: 0.9, glow: 0.2 }), { p: [0, 0.098, 0.355], r: [0.25, 0, 0] });
  // A fried egg, because of course.
  arm.add(G.cyl(0.09, 0.1, 0.012, 14), M.paint(0xffffff, { gloss: 0.6 }), { p: [0.02, 0.108, 0.35], r: [0.25, 0, 0] });
  arm.add(G.sphere(0.04, 12, 8), M.paint(0xffc21a, { gloss: 0.9, glow: 0.25 }), { p: [0.02, 0.118, 0.35], s: [1, 0.5, 1] });
  m.anim(arm.object, 'bob');
}

function microwave(m, c) {
  const shell = M.paint(0xe8ebef, { gloss: 0.75 });
  m.add(G.rbox(0.56, 0.36, 0.36, 0.035), shell, { p: [0, 0.32, 0] });
  // Door with a window; inside, a lit turntable with something on it.
  m.add(G.rbox(0.36, 0.28, 0.02, 0.01), BLACK(), { p: [-0.07, 0.32, 0.182] });
  m.add(G.rbox(0.3, 0.22, 0.012, 0.008), M.energy(c.color, 0.55), { p: [-0.07, 0.32, 0.193], shadow: false });
  m.add(G.box(0.025, 0.24, 0.03), CHROME(), { p: [0.13, 0.32, 0.2] });            // handle
  // Control panel: display and buttons.
  m.add(G.rbox(0.12, 0.3, 0.012, 0.006), BLACK(), { p: [0.21, 0.32, 0.184] });
  m.add(G.box(0.09, 0.045, 0.006), M.glow(0x56ff9a), { p: [0.21, 0.42, 0.192] });
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
    m.add(G.rbox(0.035, 0.035, 0.012, 0.006), M.paint(0x9aa3ad), { p: [0.19 + k * 0.045, 0.35 - r * 0.05, 0.192] });
  }
  const plate = m.group({ p: [-0.07, 0.24, 0.06] });
  plate.add(G.cyl(0.1, 0.1, 0.008, 18), M.glass(0xffffff, 0.5), { p: [0, 0, 0] });
  plate.add(G.sphere(0.045, 10, 8), M.paint(0xff5d3a, { glow: 0.5 }), { p: [0.02, 0.04, 0] });
  m.anim(plate.object, 'spin', { speed: 0.8 });
  // Emitter prongs on top: where the arcs leave from.
  for (const x of [-0.12, 0.12]) {
    m.add(G.cyl(0.012, 0.018, 0.2, 8), CHROME(), { p: [x, 0.6, 0] });
    const tip = m.add(G.sphere(0.035, 10, 8), M.glow(c.color), { p: [x, 0.71, 0], shadow: false });
    m.anim(tip, 'pulse', { offset: x > 0 ? 1.5 : 0 });
  }
  for (const [x, z] of [[-0.22, -0.13], [0.22, -0.13], [-0.22, 0.13], [0.22, 0.13]]) m.add(G.cyl(0.03, 0.03, 0.03, 8), BLACK(), { p: [x, 0.13, z] });
}

function blowtorch(m, c) {
  // Gas canister, valve block, angled burner with a live flame.
  m.add(G.lathe([[0.13, 0], [0.16, 0.03], [0.16, 0.34], [0.12, 0.42], [0.06, 0.46], [0.06, 0.5]]), M.paint(0x2563eb, { gloss: 0.85 }), { p: [0, 0.12, -0.06] });
  m.add(G.cyl(0.163, 0.163, 0.1, 20), M.paint(0xfff3d6, { gloss: 0.4 }), { p: [0, 0.34, -0.06] });   // label
  m.add(G.cyl(0.165, 0.165, 0.018, 20), M.paint(c.color, { gloss: 0.6, glow: 0.3 }), { p: [0, 0.34, -0.06] });
  m.add(G.rbox(0.12, 0.09, 0.14, 0.025), M.metal(0xb88a3a, { rough: 0.3 }), { p: [0, 0.67, -0.04] });   // brass valve
  m.add(G.cyl(0.05, 0.05, 0.03, 10), M.paint(0xd92b2b, { gloss: 0.7 }), { p: [0.09, 0.67, -0.04], r: [0, 0, Math.PI / 2] });   // knob
  m.add(G.tube([[0, 0.7, 0.02], [0, 0.78, 0.1], [0, 0.78, 0.2]], 0.028, 8), CHROME());
  m.add(G.cyl(0.05, 0.035, 0.1, 14), M.metal(0x9aa3ad, { rough: 0.35 }), { p: [0, 0.78, 0.25], r: [Math.PI / 2, 0, 0] });   // burner
  // Flame: a hot core inside a wider cone, both flickering.
  const flame = m.group({ p: [0, 0.78, 0.3], r: [Math.PI / 2, 0, 0] });
  flame.add(G.cone(0.05, 0.3, 10), M.energy(0xff6a1a, 0.8), { p: [0, 0.15, 0], shadow: false });
  flame.add(G.cone(0.025, 0.2, 8), M.glow(0x9fd8ff), { p: [0, 0.1, 0], shadow: false });
  m.anim(flame.object, 'flame');
}

function pressureCooker(m, c) {
  const steel = M.metal(0xd7dde5, { rough: 0.22 });
  m.add(G.lathe([[0.24, 0], [0.27, 0.03], [0.28, 0.3], [0.27, 0.33], [0, 0.33]]), steel, { p: [0, 0.12, 0] });     // pot
  m.add(G.cyl(0.283, 0.283, 0.05, 28), M.paint(c.color, { gloss: 0.8, glow: 0.25 }), { p: [0, 0.3, 0] });           // band
  m.add(G.lathe([[0.29, 0], [0.29, 0.03], [0.2, 0.1], [0.08, 0.13], [0, 0.13]]), steel, { p: [0, 0.45, 0] });      // lid
  for (const s of [-1, 1]) {
    m.add(G.rbox(0.12, 0.04, 0.07, 0.015), BLACK(), { p: [s * 0.34, 0.42, 0] });                                   // side handles
    m.add(G.rbox(0.06, 0.03, 0.03, 0.01), BLACK(), { p: [s * 0.2, 0.56, 0], r: [0, 0, -s * 0.35] });               // lid clamps
  }
  // Pressure gauge on the front, needle in the red.
  m.add(G.cyl(0.085, 0.085, 0.03, 20), BLACK(), { p: [0, 0.3, 0.285], r: [Math.PI / 2, 0, 0] });
  m.add(G.cyl(0.07, 0.07, 0.008, 20), M.glow(0xfff8e6), { p: [0, 0.3, 0.303], r: [Math.PI / 2, 0, 0] });
  m.add(G.box(0.012, 0.06, 0.006), M.glow(0xd92b2b), { p: [0.02, 0.32, 0.31], r: [0, 0, -0.7] });
  // The rocker valve on top rattles and vents.
  const valve = m.group({ p: [0, 0.6, 0] });
  valve.add(G.cyl(0.035, 0.05, 0.07, 12), M.paint(0xd92b2b, { gloss: 0.8 }), { p: [0, 0.02, 0] });
  valve.add(G.sphere(0.03, 10, 8), CHROME(), { p: [0, 0.07, 0] });
  m.anim(valve.object, 'spin', { speed: 3 });
  for (let i = 0; i < 3; i++) {
    const puff = m.add(G.sphere(0.05 + i * 0.012, 10, 8), M.energy(0xffffff, 0.34 - i * 0.08), { p: [0, 0.74 + i * 0.09, 0], shadow: false });
    m.anim(puff, 'pulse', { offset: i * 1.3 });
  }
}

const TOWERS = [toaster, pepperMill, standMixer, sprayBottle, fryingPan, microwave, blowtorch, pressureCooker];

// ── Enemies ─────────────────────────────────────────────────────────────────
//
// Model units are body radii: the creature is centred on the origin, fits in a
// sphere of radius ~1, and faces +Z.

/** Three pairs of jointed legs under a body. */
function legs(m, mat, { spread = 0.55, reach = 0.75, y = -0.15, from = -0.35, step = 0.38, r = 0.045 } = {}) {
  for (let i = 0; i < 3; i++) {
    const z = from + i * step;
    for (const s of [-1, 1]) {
      m.add(G.tube([[s * spread * 0.4, y, z], [s * spread, y + 0.3, z + (i - 1) * 0.12], [s * (spread + reach * 0.5), -0.95, z + (i - 1) * 0.3]], r, 5), mat);
    }
  }
}

function eyes(m, { x = 0.2, y = 0.12, z = 0.9, r = 0.12, color = 0xffffff } = {}) {
  for (const s of [-1, 1]) {
    m.add(G.sphere(r, 10, 8), M.glow(color), { p: [s * x, y, z], shadow: false });
    m.add(G.sphere(r * 0.5, 8, 6), M.glow(0x000000), { p: [s * x * 0.98, y, z + r * 0.75], shadow: false });
  }
}

/** Two wings hinged at the body; rendering/animations.js flaps `enemy.wings`. */
function wings(m, enemy, mat, { span = 1.4, y = 0.45, z = -0.1 } = {}) {
  enemy.wings = [1, -1].map(s => {
    const geo = G.plate([[0, 0.28], [span, 0.42], [span * 1.08, 0], [span * 0.7, -0.3], [0, -0.2]], 0.02);
    geo.rotateX(-Math.PI / 2);
    if (s < 0) geo.scale(-1, 1, 1);
    return m.add(geo, mat, { p: [s * 0.25, y, z], shadow: false });
  });
}

function ant(m, enemy, c, fiery) {
  const shell = M.paint(c.color, { gloss: 0.75, glow: fiery ? 0.45 : 0.05 });
  const limb = M.matte(fiery ? 0x5a140a : 0x120b07);
  m.add(G.sphere(0.5, 14, 10), shell, { p: [0, 0, -0.55], s: [0.85, 0.8, 1.15] });   // abdomen
  m.add(G.sphere(0.3, 12, 8), shell, { p: [0, 0.02, 0.02] });                         // thorax
  m.add(G.sphere(0.36, 12, 10), shell, { p: [0, 0.12, 0.5] });                        // head
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.12, 0.35, 0.6], [s * 0.3, 0.75, 0.8], [s * 0.42, 0.7, 1.05]], 0.03, 5), limb);   // antennae
    m.add(G.cone(0.06, 0.22, 6), limb, { p: [s * 0.14, -0.02, 0.86], r: [Math.PI / 2, 0, s * 0.3] });      // mandibles
  }
  legs(m, limb);
  eyes(m, { x: 0.2, y: 0.2, z: 0.76, r: 0.1 });
  if (fiery) {
    enemy.flames = [];
    for (const [x, z, h] of [[0, -0.55, 0.7], [-0.2, -0.7, 0.45], [0.2, -0.4, 0.45]]) {
      const geo = G.cone(0.16, h, 7);
      geo.translate(0, h / 2, 0);
      enemy.flames.push(m.add(geo, M.energy(0xff8a1f, 0.9), { p: [x, 0.3, z], shadow: false }));
    }
  }
}

function housefly(m, enemy, c) {
  const body = M.paint(c.color, { gloss: 0.8 });
  m.add(G.sphere(0.55, 14, 10), body, { p: [0, 0, -0.25], s: [0.9, 0.85, 1.25] });
  m.add(G.sphere(0.36, 12, 10), body, { p: [0, 0.08, 0.5] });
  // Big compound eyes are what make a fly a fly.
  for (const s of [-1, 1]) m.add(G.sphere(0.24, 12, 10), M.paint(0xb3202a, { gloss: 0.95, glow: 0.35 }), { p: [s * 0.24, 0.16, 0.62] });
  for (let i = 0; i < 3; i++) m.add(G.torus(0.5 - i * 0.03, 0.03, 5, 14), M.matte(0x0f1418), { p: [0, 0, -0.1 - i * 0.28], s: [0.9, 0.85, 1] });
  legs(m, M.matte(0x0f1418), { spread: 0.4, reach: 0.5, r: 0.03 });
  wings(m, enemy, M.glass(c.accent, 0.4), { span: 1.5, y: 0.5 });
}

function beetle(m, enemy, c) {
  const shell = M.paint(c.color, { gloss: 0.95, glow: 0.1 });
  const dark = M.matte(0x0d1410);
  // Domed wing cases with a seam, a pronotum shield and a horn.
  m.add(G.sphere(0.85, 16, 12), shell, { p: [0, 0.05, -0.2], s: [0.95, 0.72, 1.15] });
  m.add(G.box(0.03, 0.05, 1.5), dark, { p: [0, 0.62, -0.3], r: [0.12, 0, 0] });
  m.add(G.sphere(0.55, 14, 10), M.paint(c.accent, { gloss: 0.9 }), { p: [0, 0.08, 0.55], s: [1.15, 0.7, 0.7] });
  m.add(G.sphere(0.3, 12, 8), dark, { p: [0, 0, 0.92] });
  m.add(G.tube([[0, 0.05, 0.95], [0, 0.45, 1.25], [0, 0.8, 1.2]], 0.07, 6), dark);
  m.add(G.cone(0.07, 0.25, 6), dark, { p: [0, 0.88, 1.12], r: [-0.5, 0, 0] });
  legs(m, dark, { spread: 0.75, reach: 0.6, r: 0.07, y: -0.25 });
  eyes(m, { x: 0.17, y: 0.08, z: 1.14, r: 0.07 });
}

function cockroach(m, enemy, c) {
  const shell = M.paint(c.color, { gloss: 0.9, glow: 0.18 });
  const dark = M.matte(0x1c0f07);
  m.add(G.sphere(0.8, 16, 10), shell, { p: [0, -0.05, -0.2], s: [0.85, 0.42, 1.4] });   // flat, long body
  m.add(G.sphere(0.5, 14, 10), M.paint(0x3a1f0f, { gloss: 0.9 }), { p: [0, 0.02, 0.62], s: [1.2, 0.45, 0.8] });   // shield
  m.add(G.sphere(0.24, 10, 8), dark, { p: [0, -0.05, 1.0] });
  for (const s of [-1, 1]) {
    // Absurdly long swept-back antennae.
    m.add(G.tube([[s * 0.1, 0.05, 1.1], [s * 0.6, 0.6, 0.9], [s * 0.95, 0.5, -0.2], [s * 1.0, 0.2, -0.9]], 0.025, 5), dark);
    m.add(G.cone(0.09, 0.5, 5), dark, { p: [s * 0.22, -0.02, -1.3], r: [-Math.PI / 2, 0, s * 0.3] });   // cerci
  }
  legs(m, dark, { spread: 0.7, reach: 0.75, r: 0.06, y: -0.2 });
  // Spines along the legs' line, and a burning stripe: it is the fire+armour elite.
  for (let i = 0; i < 5; i++) m.add(G.cone(0.06, 0.2, 5), M.paint(c.accent, { glow: 0.6 }), { p: [0, 0.3, -0.9 + i * 0.36] });
  eyes(m, { x: 0.13, y: 0.02, z: 1.18, r: 0.06, color: 0xffb347 });
}

function wasp(m, enemy, c) {
  const yellow = M.paint(c.color, { gloss: 0.85, glow: 0.3 });
  const black = M.matte(0x111111);
  m.add(G.sphere(0.34, 12, 10), black, { p: [0, 0.05, 0.55] });                                  // head
  m.add(G.sphere(0.36, 12, 10), yellow, { p: [0, 0, 0.05] });                                    // thorax
  m.add(G.sphere(0.5, 14, 10), yellow, { p: [0, -0.05, -0.65], s: [0.8, 0.8, 1.3] });            // abdomen
  for (let i = 0; i < 3; i++) m.add(G.torus(0.4 - i * 0.07, 0.07, 6, 16), black, { p: [0, -0.05, -0.4 - i * 0.3], s: [0.85, 0.85, 1] });
  m.add(G.cone(0.08, 0.45, 6), black, { p: [0, -0.08, -1.45], r: [-Math.PI / 2, 0, 0] });        // stinger
  for (const s of [-1, 1]) m.add(G.tube([[s * 0.1, 0.3, 0.7], [s * 0.3, 0.6, 0.95]], 0.03, 5), black);
  eyes(m, { x: 0.2, y: 0.12, z: 0.78, r: 0.12, color: 0xff3d1f });
  wings(m, enemy, M.glass(0xfff1c2, 0.45), { span: 1.3, y: 0.4 });
  enemy.flames = [];
  const geo = G.cone(0.14, 0.6, 7);
  geo.translate(0, 0.3, 0);
  enemy.flames.push(m.add(geo, M.energy(0xff6a1a, 0.85), { p: [0, -0.08, -1.3], r: [-Math.PI / 2, 0, 0], shadow: false }));
}

function ratKing(m, enemy, c) {
  const fur = M.paint(c.color, { gloss: 0.25 });
  const pink = M.paint(0xf2a0a8, { gloss: 0.5 });
  m.add(G.sphere(0.85, 18, 14), fur, { p: [0, 0, -0.25], s: [0.95, 0.9, 1.2] });            // haunches
  m.add(G.sphere(0.55, 16, 12), fur, { p: [0, 0.2, 0.5] });                                  // chest/head
  m.add(G.cone(0.34, 0.6, 14), fur, { p: [0, 0.12, 1.0], r: [Math.PI / 2, 0, 0] });           // snout
  m.add(G.sphere(0.09, 10, 8), pink, { p: [0, 0.12, 1.3] });                                  // nose
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.26, 0.26, 0.04, 16), pink, { p: [s * 0.42, 0.72, 0.4], r: [Math.PI / 2 - 0.3, 0, s * 0.4] });   // ears
    m.add(G.box(0.06, 0.16, 0.03), M.paint(0xfffbe6), { p: [s * 0.05, -0.03, 1.22] });        // teeth
    for (let w = 0; w < 3; w++) m.add(G.cyl(0.008, 0.008, 0.5, 4), M.matte(0x222222), { p: [s * 0.3, 0.1 + w * 0.05, 1.15], r: [0, 0, Math.PI / 2 + s * (w - 1) * 0.25] });
    for (const z of [-0.6, 0.45]) m.add(G.sphere(0.2, 10, 8), pink, { p: [s * 0.55, -0.82, z], s: [1, 0.5, 1.6] });   // paws
  }
  // Tail curling up and round.
  m.add(G.tube([[0, -0.3, -1.2], [0.5, -0.5, -1.9], [1.0, -0.1, -1.7], [1.1, 0.5, -1.2], [0.8, 0.8, -0.9]], 0.08, 7), pink);
  eyes(m, { x: 0.24, y: 0.42, z: 0.86, r: 0.1, color: 0xff2a2a });
  // A crown of cutlery: it is the Rat King.
  const gold = M.metal(0xffcc33, { rough: 0.2 });
  m.add(G.torus(0.34, 0.06, 6, 20), gold, { p: [0, 0.74, 0.5], r: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    m.add(G.cone(0.07, 0.3, 4), gold, { p: [Math.cos(a) * 0.34, 0.92, 0.5 + Math.sin(a) * 0.34] });
  }
  enemy.crownGem = m.add(G.sphere(0.09, 8, 6), M.glow(0xff2a2a), { p: [0, 0.84, 0.86], shadow: false });
}

const ENEMIES = {
  SWARM: (m, e, c) => ant(m, e, c, false),
  FIRE: (m, e, c) => ant(m, e, c, true),
  FLYING: housefly,
  ARMORED: beetle,
  ELITE: cockroach,
  FLYING_FIRE: wasp,
  BOSS: ratKing
};

// ── Arena ───────────────────────────────────────────────────────────────────

/** Seamless 512px tile: glazed cream tiles with grout, the odd terracotta one. */
function paintFloor(ctx, size) {
  const n = 4, cell = size / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const accent = (x * 7 + y * 3) % 5 === 0;
      const g = ctx.createLinearGradient(x * cell, y * cell, (x + 1) * cell, (y + 1) * cell);
      g.addColorStop(0, accent ? '#e9a877' : '#f6eedd');
      g.addColorStop(1, accent ? '#d98c5a' : '#e4d7bb');
      ctx.fillStyle = g;
      ctx.fillRect(x * cell + 3, y * cell + 3, cell - 6, cell - 6);
      // Glaze highlight along the top-left edges.
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x * cell + 3, y * cell + 3, cell - 6, 3);
      ctx.fillRect(x * cell + 3, y * cell + 3, 3, cell - 6);
    }
  }
  // Grout shows through the gaps (the base fill); darken it.
  ctx.strokeStyle = 'rgba(120, 96, 70, 0.9)';
  ctx.lineWidth = 6;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size);
    ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell);
    ctx.stroke();
  }
  // Crumbs.
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(${150 + Math.random() * 60 | 0}, ${100 + Math.random() * 40 | 0}, 50, 0.35)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 2 + Math.random() * 2);
  }
}

/** Obstacle props, one per `kind` 0-4. About one grid cell wide, standing on y = 0. */
function buildProp(kind) {
  const g = new THREE.Group();
  const m = modeller(g, 1);
  switch (kind % 5) {
    case 0: { // salt shaker
      m.add(G.lathe([[0.2, 0], [0.22, 0.05], [0.18, 0.4], [0.14, 0.5]]), M.glass(0xffffff, 0.55), { p: [0, 0, 0] });
      m.add(G.lathe([[0.19, 0], [0.19, 0.3], [0, 0.3]]), M.paint(0xffffff, { gloss: 0.2 }), { p: [0, 0.03, 0] });
      m.add(G.dome(0.15), M.metal(), { p: [0, 0.5, 0] });
      break;
    }
    case 1: { // stick of butter on a dish
      m.add(G.cyl(0.42, 0.36, 0.05, 20), M.paint(0xffffff, { gloss: 0.9 }), { p: [0, 0.03, 0] });
      m.add(G.rbox(0.56, 0.2, 0.26, 0.03), M.paint(0xffe27a, { gloss: 0.5 }), { p: [0, 0.16, 0] });
      break;
    }
    case 2: { // tomato
      m.add(G.sphere(0.32, 16, 12), M.paint(0xe5352b, { gloss: 0.9 }), { p: [0, 0.28, 0], s: [1, 0.85, 1] });
      m.add(G.star(0.14, 0.05, 0.02), M.matte(0x2f7d32), { p: [0, 0.55, 0], r: [-Math.PI / 2, 0, 0] });
      m.add(G.cyl(0.02, 0.025, 0.1, 6), M.matte(0x2f7d32), { p: [0, 0.6, 0] });
      break;
    }
    case 3: { // mug of coffee
      m.add(G.lathe([[0.2, 0], [0.24, 0.02], [0.24, 0.42], [0.21, 0.42], [0.21, 0.06], [0, 0.06]]), M.paint(0x3b82f6, { gloss: 0.85 }), { p: [0, 0, 0] });
      m.add(G.cyl(0.21, 0.21, 0.01, 20), M.paint(0x3a2314, { gloss: 0.9 }), { p: [0, 0.37, 0] });
      m.add(G.torus(0.12, 0.03, 8, 16, Math.PI), M.paint(0x3b82f6, { gloss: 0.85 }), { p: [0.24, 0.22, 0], r: [0, 0, -Math.PI / 2] });
      break;
    }
    default: { // wedge of cheese
      m.add(G.plate([[-0.3, 0], [0.3, 0], [-0.3, 0.34]], 0.36), M.paint(0xffc93c, { gloss: 0.45 }), { p: [0, 0.01, 0] });
      for (const [x, y] of [[-0.18, 0.1], [0, 0.06], [-0.2, 0.22]]) m.add(G.sphere(0.05, 8, 6), M.matte(0xd89b1c), { p: [x, y, 0.18] });
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

  // The fridge the whole game is about, looming over the far side.
  const fridge = new THREE.Group();
  let m = modeller(fridge, 1);
  const enamel = M.paint(0xdfe9ef, { gloss: 0.85 });
  m.add(G.rbox(7, 13, 5, 0.4), enamel, { p: [0, 6.5, 0] });
  m.add(G.box(7.02, 0.08, 5.02), M.matte(0x8fa3ad), { p: [0, 8.6, 0] });                       // freezer seam
  for (const y of [5.4, 10.6]) m.add(G.rbox(0.22, 2.6, 0.3, 0.1), M.metal(), { p: [-2.6, y, 2.65] });   // handles
  m.add(G.rbox(1.4, 1, 0.06, 0.03), M.paint(0xffe27a), { p: [1.4, 6.4, 2.54], r: [0, 0, 0.12] });      // note
  m.add(G.cyl(0.25, 0.25, 0.08, 16), M.paint(0xe5352b, { gloss: 0.9 }), { p: [1.9, 6.9, 2.58], r: [Math.PI / 2, 0, 0] });   // magnet
  place(fridge, 0, -hh - 9.5);

  // A kettle and a stack of plates along the far end.
  const kettle = new THREE.Group();
  m = modeller(kettle, 1);
  m.add(G.lathe([[1.9, 0], [2.1, 0.2], [2.0, 2.4], [1.4, 3.3], [0.9, 3.6], [0, 3.6]], 28), M.metal(0xd7dde5, { rough: 0.2 }), { p: [0, 0, 0] });
  m.add(G.sphere(0.35, 12, 10), M.matte(0x15171c), { p: [0, 3.8, 0] });
  m.add(G.tube([[1.7, 2.2, 0], [2.6, 2.9, 0], [3.0, 3.6, 0]], 0.3, 10), M.metal(0xd7dde5, { rough: 0.2 }));
  m.add(G.torus(1.5, 0.16, 8, 20, Math.PI), M.matte(0x15171c), { p: [0, 3.5, 0] });
  place(kettle, -hw - 8, -hh * 0.2, 0.6);

  const plates = new THREE.Group();
  m = modeller(plates, 1);
  for (let i = 0; i < 6; i++) {
    m.add(G.lathe([[0.9, 0], [2.2, 0.12], [2.4, 0.3], [2.3, 0.32], [2.1, 0.2], [0.9, 0.1], [0, 0.1]], 28), M.paint(i % 2 ? 0xffffff : 0xbfe3f2, { gloss: 0.95 }), { p: [0, i * 0.24, 0] });
  }
  place(plates, -hw - 7.5, hh * 0.9, 0);

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
    build(modeller(group, sz), enemy, { color: ctx.color ?? 0x2a1a12, accent: ctx.accent ?? 0xff8a3d });
  },

  paintFloor,
  floorTileSize: 4,
  buildProp,
  buildSurround
};
