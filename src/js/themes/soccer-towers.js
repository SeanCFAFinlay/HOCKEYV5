// Soccer towers, remodelled: eight posed footballer figurines.
//
// The originals were a cylinder torso with a sphere on top, eight times over.
// These are built on a small posable figure (`figure`): boots with studs, socks
// with a turned calf, shorts, a tapering shirt with collar, hoops and a number,
// arms with hands, and a head with a hairstyle. Each tower gives it a different
// pose, build and props so the outline alone says which one it is.
//
// Model units: stand on y = 0.12, about 0.8 tall, within 0.32 of the axis,
// facing +Z (so +X is the figure's left). `m.add` multiplies by the tower scale.
//
// Nothing here touches THREE at import time: all geometry is built in functions.

import { G, M, modeller } from '../rendering/model-kit.js';

const GROUND = 0.12;
const ANKLE = 0.064;            // ankle height of a planted boot, studs on the turf
const THIGH = 0.16, SHIN = 0.155, UPPER = 0.115, FORE = 0.105;
const SQUASH = 0.68;            // a torso is wider than it is deep

// ── Small maths, on plain [x, y, z] arrays ──────────────────────────────────

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Where and how to place something authored along +Y so it runs from a to b. */
function orient(a, b) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const len = Math.max(d.length(), 1e-4);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return { len, r: [e.x, e.y, e.z], mid: lerp(a, b, 0.5) };
}

/** A tapered limb segment from a (radius ra) to b (radius rb). */
function bone(mm, mat, a, b, ra, rb, seg = 12) {
  const o = orient(a, b);
  return mm.add(G.cyl(rb, ra, o.len, seg), mat, { p: o.mid, r: o.r });
}

/**
 * Two-bone reach: the middle joint (knee, elbow) for a limb from `root` to
 * `target`, bending toward `hint`. Returns [joint, end]; `end` is pulled in if
 * the target is out of reach.
 */
function reach(root, target, l1, l2, hint) {
  const a = new THREE.Vector3(root[0], root[1], root[2]);
  const d = new THREE.Vector3(target[0], target[1], target[2]).sub(a);
  const dist = Math.min(Math.max(d.length(), 1e-3), (l1 + l2) * 0.995);
  d.normalize();
  const along = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const out = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const h = new THREE.Vector3(hint[0], hint[1], hint[2]);
  h.addScaledVector(d, -h.dot(d));
  if (h.lengthSq() < 1e-6) h.set(d.y, -d.x, 0.001);
  h.normalize();
  const j = a.clone().addScaledVector(d, along).addScaledVector(h, out);
  const e = a.clone().addScaledVector(d, dist);
  return [[j.x, j.y, j.z], [e.x, e.y, e.z]];
}

// ── Shared parts ────────────────────────────────────────────────────────────

const ballGeos = {};

/** A unit football: one mesh, the twelve dark panels painted per face. */
function ballGeo(light, dark) {
  const key = light + '|' + dark;
  if (ballGeos[key]) return ballGeos[key];
  const geo = new THREE.IcosahedronGeometry(1, 5);
  const t = (1 + Math.sqrt(5)) / 2;
  const centres = [];
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    centres.push(new THREE.Vector3(0, s1, s2 * t).normalize(), new THREE.Vector3(s1, s2 * t, 0).normalize(), new THREE.Vector3(s2 * t, 0, s1).normalize());
  }
  const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3);
  const cl = new THREE.Color(light), cd = new THREE.Color(dark), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k)));
    c.normalize();
    const patch = centres.some(v => v.dot(c) > 0.925) ? cd : cl;
    for (let k = 0; k < 3; k++) colors.set([patch.r, patch.g, patch.b], (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  ballGeos[key] = geo;
  return geo;
}

/**
 * Add a football of radius `r`. It gets its own material (so the static merge
 * never strips its panel colours). `glow` tints it for the special balls.
 */
function ball(mm, r, p, { light = 0xffffff, dark = 0x16181d, glow = 0, glowColor = 0xffffff } = {}) {
  const hexOf = v => (v && v.isColor ? v.getHex() : v);
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.42, metalness: 0.05,
    emissive: hexOf(glowColor), emissiveIntensity: glow
  });
  return mm.add(ballGeo(hexOf(light), hexOf(dark)), mat, { p, s: r, r: [0.4, 0.3, 0.2] });
}

/** A shirt number in seven-segment strokes; build inside a group facing +Z. */
function digits(mm, mat, text, { h = 0.085, w = 0.04, t = 0.013 } = {}) {
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgecd', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const chars = String(text).split('');
  const gap = w + 0.02;
  chars.forEach((ch, i) => {
    const x0 = (i - (chars.length - 1) / 2) * gap;
    for (const s of SEG[ch] || '') {
      if (s === 'a' || s === 'g' || s === 'd') {
        mm.add(G.box(w + t, t, 0.008), mat, { p: [x0, s === 'a' ? h / 2 : s === 'd' ? -h / 2 : 0, 0] });
      } else {
        const right = s === 'b' || s === 'c', upper = s === 'b' || s === 'f';
        mm.add(G.box(t, h / 2 + t, 0.008), mat, { p: [x0 + (right ? w / 2 : -w / 2), upper ? h / 4 : -h / 4, 0] });
      }
    }
  });
}

/** A football boot at the ankle: upper, sole, laces and four studs. */
function boot(mm, ankle, rot, kit) {
  const b = mm.group({ p: ankle, r: [rot[0] || 0, rot[1] || 0, rot[2] || 0] });
  b.add(G.sphere(1, 14, 10), kit.boots, { p: [0, -0.02, 0.034], s: [0.043, 0.04, 0.082] });
  b.add(G.sphere(1, 14, 8), kit.sole, { p: [0, -0.044, 0.034], s: [0.04, 0.014, 0.084] });
  b.add(G.box(0.022, 0.008, 0.05), kit.laces, { p: [0, 0.012, 0.05], r: [0.42, 0, 0] });
  for (const x of [-0.021, 0.021]) for (const z of [-0.02, 0.085]) {
    b.add(G.cyl(0.007, 0.009, 0.014, 6), kit.sole, { p: [x, -0.058, z] });
  }
}

/**
 * The posable footballer.
 *
 * Coordinates are figure-local: feet on y = 0, facing +Z. The pelvis position
 * and `lean` (the torso's rotation) set the trunk; each leg is given an ankle
 * target and each arm a hand target, and the knees and elbows are solved.
 *
 * @param {object} m - turret modeller
 * @param {object} o
 *   at, k (overall size), bulk (width of trunk and limbs), pelvis, lean, head (tilt),
 *   legR/legL { ankle, foot: [pitch, yaw], knee: bend hint },
 *   armR/armL { hand, elbow: bend hint },
 *   kit { shirt, shorts, socks, skin, boots, sole, laces, trim, hair },
 *   sleeves 'short' | 'long', trousers, hoops, number, hair, hands
 * @returns {{root, torso, head, handR, handL, headAt}} modellers and positions
 */
function figure(m, o) {
  const kit = o.kit, k = o.k ?? 1, b = o.bulk ?? 1;
  const pelvis = o.pelvis ?? [0, 0.38, 0], lean = o.lean ?? [0, 0, 0];
  const root = m.group({ p: o.at ?? [0, GROUND, 0] });
  root.object.scale.setScalar(k);
  const euler = new THREE.Euler(lean[0], lean[1], lean[2]);
  const trunk = v => {
    const p = new THREE.Vector3(v[0], v[1], v[2]).applyEuler(euler);
    return [pelvis[0] + p.x, pelvis[1] + p.y, pelvis[2] + p.z];
  };

  // Trunk: shorts, then a shirt turned to a taper and squashed front-to-back.
  const torso = root.group({ p: pelvis, r: lean });
  const flat = [b, 1, SQUASH * b];
  torso.add(G.lathe([[0, -0.075], [0.07, -0.07], [0.098, -0.045], [0.1, 0], [0.094, 0.035]]), kit.shorts, { s: flat });
  torso.add(G.lathe([
    [0.097, 0.0], [0.09, 0.02], [0.086, 0.07], [0.1, 0.13], [0.116, 0.178], [0.108, 0.208], [0.062, 0.228], [0.04, 0.238]
  ]), kit.shirt, { s: flat });
  torso.add(G.torus(0.046, 0.012, 6, 16), kit.trim, { p: [0, 0.236, 0], r: [Math.PI / 2, 0, 0], s: [b, b, 1] });   // collar
  torso.add(G.cyl(0.033, 0.036, 0.05, 10), kit.skin, { p: [0, 0.255, 0] });                                    // neck
  torso.add(G.cyl(0.014, 0.014, 0.008, 8), kit.trim, { p: [0.05 * b, 0.165, 0.071 * b], r: [Math.PI / 2 - 0.2, 0, 0] });   // crest
  for (const y of o.hoops || []) {
    const r0 = 0.086 + Math.max(0, y - 0.07) * 0.24;
    torso.add(G.sleeve(r0 + 0.012, r0 + 0.004, 0.032), kit.trim, { p: [0, y, 0], s: flat });
  }
  if (o.number != null) {
    const back = torso.group({ p: [0, 0.14, -0.073 * b], r: [-0.14, Math.PI, 0] });
    digits(back, kit.trim, o.number);
  }

  // Head: face, ears and one of a few hairstyles.
  const head = torso.group({ p: [0, 0.315, 0], r: o.head ?? [0, 0, 0] });
  head.add(G.sphere(0.08, 18, 14), kit.skin, { s: [0.96, 1, 0.98] });
  for (const x of [-0.03, 0.03]) head.add(G.sphere(0.012, 8, 6), kit.sole, { p: [x, 0.008, 0.072] });
  for (const x of [-0.077, 0.077]) head.add(G.sphere(0.016, 8, 6), kit.skin, { p: [x, -0.005, 0] });
  head.add(G.sphere(0.012, 8, 6), kit.skin, { p: [0, -0.014, 0.078] });
  const hair = o.hair || 'short';
  if (hair !== 'none' && hair !== 'bald') head.add(G.dome(0.085, 16), kit.hair, { r: [-0.38, 0, 0] });
  if (hair === 'mohawk') {
    const crest = [];
    for (let i = 0; i <= 8; i++) { const a = 0.25 + (i / 8) * 2.45; crest.push([Math.cos(a) * 0.104, Math.sin(a) * 0.104]); }
    for (let i = 8; i >= 0; i--) { const a = 0.25 + (i / 8) * 2.45; crest.push([Math.cos(a) * 0.07, Math.sin(a) * 0.07]); }
    head.add(G.plate(crest, 0.026), kit.hair, { r: [0, Math.PI / 2, 0] });
  } else if (hair === 'band') {
    head.add(G.torus(0.081, 0.011, 6, 18), kit.trim, { p: [0, 0.03, 0], r: [Math.PI / 2 - 0.25, 0, 0] });
  } else if (hair === 'bun') {
    head.add(G.sphere(0.034, 10, 8), kit.hair, { p: [0, 0.07, -0.06] });
    head.add(G.torus(0.081, 0.009, 6, 18), kit.trim, { p: [0, 0.035, 0], r: [Math.PI / 2 - 0.25, 0, 0] });
  } else if (hair === 'long') {
    head.add(G.sphere(1, 12, 10), kit.hair, { p: [0, -0.03, -0.045], s: [0.082, 0.085, 0.055] });
  } else if (hair === 'cap') {
    head.add(G.dome(0.088, 16), kit.shirt, { p: [0, 0.012, 0] });
    head.add(G.rbox(0.11, 0.012, 0.075, 0.005), kit.shirt, { p: [0, 0.03, 0.105], r: [0.18, 0, 0] });
    head.add(G.sphere(0.012, 8, 6), kit.trim, { p: [0, 0.1, 0] });
  }

  // Legs: thigh under the shorts, knee, a turned calf in a sock, boot.
  for (const side of [-1, 1]) {
    const leg = side < 0 ? o.legR : o.legL;
    const hip = trunk([side * 0.055 * b, -0.02, 0]);
    const [knee, ankle] = reach(hip, leg.ankle, THIGH, SHIN, leg.knee ?? [0, 0, 1]);
    if (o.trousers) {
      bone(root, kit.shorts, hip, knee, 0.058 * b, 0.048 * b);
      root.add(G.sphere(0.047 * b, 10, 8), kit.shorts, { p: knee });
      bone(root, kit.shorts, knee, ankle, 0.046 * b, 0.04 * b);
    } else {
      bone(root, kit.skin, hip, knee, 0.052 * b, 0.041 * b);
      bone(root, kit.shorts, hip, lerp(hip, knee, 0.58), 0.064 * b, 0.059 * b);
      root.add(G.sphere(0.042 * b, 10, 8), kit.skin, { p: knee });
      const o2 = orient(ankle, knee), L = o2.len;
      root.add(G.lathe([[0.03 * b, 0], [0.035 * b, L * 0.25], [0.045 * b, L * 0.62], [0.04 * b, L * 0.9], [0.03 * b, L * 0.97]], 12), kit.socks, { p: ankle, r: o2.r });
      bone(root, kit.trim, lerp(ankle, knee, 0.76), lerp(ankle, knee, 0.9), 0.046 * b, 0.044 * b);   // sock top
    }
    root.add(G.sphere(0.047 * b, 10, 8), kit.shorts, { p: hip });
    boot(root, ankle, leg.foot ?? [0, 0], kit);
  }

  // Arms: sleeve, elbow, forearm, hand.
  const hands = [];
  for (const side of [-1, 1]) {
    const arm = side < 0 ? o.armR : o.armL;
    const shoulder = trunk([side * 0.122 * b, 0.192, 0]);
    const [elbow, hand] = reach(shoulder, arm.hand, UPPER, FORE, arm.elbow ?? [side * 0.4, -1, -0.5]);
    root.add(G.sphere(0.046 * b, 10, 8), kit.shirt, { p: shoulder });
    if (o.sleeves === 'long') {
      bone(root, kit.shirt, shoulder, elbow, 0.041 * b, 0.035 * b);
      root.add(G.sphere(0.035 * b, 8, 6), kit.shirt, { p: elbow });
      bone(root, kit.shirt, elbow, hand, 0.035 * b, 0.029 * b);
      bone(root, kit.trim, lerp(elbow, hand, 0.8), hand, 0.032 * b, 0.031 * b);
    } else {
      bone(root, kit.skin, shoulder, elbow, 0.033 * b, 0.028 * b);
      bone(root, kit.shirt, shoulder, lerp(shoulder, elbow, 0.62), 0.044 * b, 0.041 * b);
      bone(root, kit.trim, lerp(shoulder, elbow, 0.56), lerp(shoulder, elbow, 0.68), 0.043 * b, 0.042 * b);
      root.add(G.sphere(0.029 * b, 8, 6), kit.skin, { p: elbow });
      bone(root, kit.skin, elbow, hand, 0.028 * b, 0.023 * b);
    }
    if (o.hands !== false) root.add(G.sphere(0.031, 10, 8), kit.skin, { p: hand });
    hands.push(hand);
  }

  return { root, torso, head, handR: hands[0], handL: hands[1], headAt: trunk([0, 0.315, 0]) };
}

/** The materials a figure wears. Shirt is the tower's flashing body material. */
function strip(c, { skin = 0xe0ac69, hair = 0x2a1a12, shorts = 0xf4f6f8, socks = null, boots = 0x15171c, trim = 0xffffff, sole = 0x101216 } = {}) {
  return {
    shirt: c.bodyMat,
    shorts: M.paint(shorts, { gloss: 0.35 }),
    socks: M.paint(socks ?? c.color, { gloss: 0.4, glow: 0.12 }),
    skin: M.paint(skin, { gloss: 0.3 }),
    hair: M.matte(hair),
    boots: M.paint(boots, { gloss: 0.8 }),
    sole: M.matte(sole),
    laces: M.paint(0xffffff, { gloss: 0.4 }),
    trim: M.paint(trim, { gloss: 0.5 })
  };
}

// ── The eight ───────────────────────────────────────────────────────────────

function striker(m, c) {
  // Mid-shot: planted on the left foot, right leg drawn right back, arms flung
  // out for balance, the ball waiting in front of the standing boot.
  const kit = strip(c, { skin: 0xc68642, hair: 0x1b1210, boots: 0xff5a1f });
  figure(m, {
    kit, at: [0, GROUND, -0.08], pelvis: [0, 0.365, 0], lean: [0.3, 0.3, 0], head: [-0.2, -0.2, 0],
    hoops: [0.1], number: 9, hair: 'mohawk',
    legL: { ankle: [0.07, ANKLE, 0.04], foot: [0, 0.15] },
    legR: { ankle: [-0.11, 0.3, -0.25], foot: [1.35, 0], knee: [0, -0.5, 1] },
    armL: { hand: [0.3, 0.5, 0.1], elbow: [0, -1, -0.3] },
    armR: { hand: [-0.22, 0.42, -0.14], elbow: [-0.6, -0.4, -1] }
  });
  const shot = ball(m, 0.066, [-0.03, GROUND + 0.066, 0.2]);
  m.anim(shot, 'spin', { speed: 2.2 });
  // Turf kicked up behind the swing.
  const turf = M.paint(0x2f9e44, { gloss: 0.2 });
  for (const [x, y, z] of [[-0.14, 0.15, -0.2], [-0.2, 0.2, -0.12], [-0.08, 0.14, -0.28]]) {
    m.add(G.rbox(0.03, 0.018, 0.03, 0.006), turf, { p: [x, y, z], r: [x * 9, y * 7, z * 5] });
  }
}

function freeKick(m, c) {
  // The set-piece stance: feet planted wide, hands on hips, ball placed, and a
  // training-dummy wall to bend it round. The dotted arc is the shot to come.
  const kit = strip(c, { skin: 0xf1c27d, hair: 0x3b2a1a, shorts: 0x1e2a5a, boots: 0xf4f6f8, sole: 0x1e2a5a });
  figure(m, {
    kit, at: [0, GROUND, -0.14], pelvis: [0, 0.372, 0], lean: [-0.06, 0, 0], head: [0.1, 0, 0],
    number: 7, hair: 'band',
    legL: { ankle: [0.115, ANKLE, 0], foot: [0, 0.35], knee: [0.3, 0, 1] },
    legR: { ankle: [-0.115, ANKLE, 0], foot: [0, -0.35], knee: [-0.3, 0, 1] },
    armL: { hand: [0.1, 0.385, 0.03], elbow: [1, 0, -0.5] },
    armR: { hand: [-0.1, 0.385, 0.03], elbow: [-1, 0, -0.5] }
  });
  ball(m, 0.058, [0, GROUND + 0.058, 0.06]);
  // Two flat training dummies on a weighted bar.
  const dummy = M.paint(0x24408e, { gloss: 0.6 });
  const outline = [[-0.045, 0], [-0.058, 0.17], [-0.034, 0.195], [-0.03, 0.215], [-0.036, 0.25], [0, 0.272], [0.036, 0.25], [0.03, 0.215], [0.034, 0.195], [0.058, 0.17], [0.045, 0]];
  for (const x of [-0.075, 0.075]) m.add(G.plate(outline, 0.022), dummy, { p: [x, GROUND + 0.02, 0.27] });
  m.add(G.rbox(0.3, 0.025, 0.07, 0.01), M.matte(0x15171c), { p: [0, GROUND + 0.012, 0.27] });
  // The curl: dots growing along the flight, ending in the struck ball.
  const curve = new THREE.CatmullRomCurve3([[0.02, 0.2, 0.1], [0.2, 0.42, 0.16], [0.22, 0.62, 0.3], [0.06, 0.64, 0.42]].map(p => new THREE.Vector3(p[0], p[1], p[2])));
  const trail = M.glow(0xfff06a);
  for (let i = 1; i <= 7; i++) {
    const p = curve.getPoint(i / 8.6);
    m.add(G.sphere(0.009 + i * 0.0022, 8, 6), trail, { p: [p.x, p.y, p.z], shadow: false });
  }
  const end = curve.getPoint(1);
  const struck = m.group({ p: [end.x, end.y, end.z] });
  const curler = ball(struck, 0.05, [0, 0, 0], { glow: 0.35, glowColor: c.color });
  struck.add(G.sphere(0.068, 12, 10), M.glow(0xfff06a, 0.35), { shadow: false });
  m.anim(curler, 'spin', { speed: 3 });
  m.anim(struck.object, 'pulse');
}

function header(m, c) {
  // Off the ground, back arched, legs tucked, arms thrown wide, forehead
  // through the ball. Launch streaks tie him to the turf.
  const kit = strip(c, { skin: 0x8d5524, hair: 0x101010, boots: 0xffd23a });
  const f = figure(m, {
    kit, k: 0.92, at: [0, 0.185, -0.07], pelvis: [0, 0.37, 0], lean: [0.34, 0, 0], head: [0.22, 0, 0],
    hoops: [0.06, 0.13], number: 4, hair: 'short',
    legL: { ankle: [0.075, 0.2, -0.19], foot: [1.1, 0.2], knee: [0.2, -0.3, 1] },
    legR: { ankle: [-0.075, 0.26, -0.22], foot: [1.2, -0.2], knee: [-0.2, -0.3, 1] },
    armL: { hand: [0.3, 0.52, -0.1], elbow: [0, -1, -0.6] },
    armR: { hand: [-0.3, 0.52, -0.1], elbow: [0, -1, -0.6] }
  });
  // Ball at the forehead, with the shock of the contact around it.
  const h = f.headAt;
  const at = [0, 0.185 + 0.92 * (h[1] + 0.03), -0.07 + 0.92 * (h[2] + 0.135)];
  const impact = m.group({ p: at });
  ball(impact, 0.062, [0, 0, 0]);
  const shock = M.glow(c.color, 0.85);
  impact.add(G.torus(0.085, 0.01, 6, 22), shock, { r: [0.5, 0, 0], shadow: false });
  impact.add(G.torus(0.11, 0.006, 6, 22), shock, { r: [0.5, 0, 0], p: [0, -0.012, 0.02], shadow: false });
  m.anim(impact.object, 'pulse');
  // Launch: a ripple on the turf and three streaks up to the boots.
  const streak = M.glow(c.color, 0.7);
  for (const x of [-0.08, 0, 0.08]) {
    m.add(G.tube([[x * 1.5, 0.13, 0.0], [x * 1.1, 0.2, -0.09], [x, 0.33 - Math.abs(x) * 0.5, -0.2]], 0.011, 5), streak, { shadow: false });
  }
  const ripple = m.group({ p: [0, 0.13, -0.02] });
  ripple.add(G.torus(0.13, 0.012, 6, 24), streak, { r: [Math.PI / 2, 0, 0], shadow: false });
  m.anim(ripple.object, 'pulse', { offset: 1.5 });
}

function tackle(m, c) {
  // The slide: low along the turf, one leg hooked out studs-first, the other
  // folded, a hand planted behind. The corner flag gives the low pose a marker.
  const kit = strip(c, { skin: 0xffdbac, hair: 0x7a2e12, shorts: 0x15171c, boots: 0x15171c, sole: 0xf4f6f8 });
  figure(m, {
    kit, bulk: 1.1, at: [0, GROUND, 0], pelvis: [0, 0.105, 0.02], lean: [-0.9, 0, 0.12], head: [0.7, 0, 0],
    hoops: [0.1], number: 6, hair: 'short',
    legR: { ankle: [-0.05, 0.08, 0.34], foot: [-0.75, 0.1], knee: [0, 1, 0.2] },
    legL: { ankle: [0.17, 0.05, 0.12], foot: [0.2, 0.9, -1.2], knee: [1, 0.45, 0.6] },
    armL: { hand: [0.19, 0.035, -0.2], elbow: [0.6, 0, -1] },
    armR: { hand: [-0.25, 0.38, -0.02], elbow: [-1, -0.5, -0.3] }
  });
  // The ball he is taking, and the spray off the leading boot.
  const won = ball(m, 0.058, [0.07, GROUND + 0.075, 0.36]);
  m.anim(won, 'spin', { speed: 3 });
  const dust = M.glow(0xf3e6c4, 0.6);
  [[-0.14, 0.19, 0.34, 0.045], [-0.18, 0.25, 0.24, 0.035], [-0.06, 0.17, 0.44, 0.03]].forEach(([x, y, z, r], i) => {
    const puff = m.group({ p: [x, y, z] });
    puff.add(G.sphere(r, 10, 8), dust, { shadow: false });
    m.anim(puff.object, 'pulse', { offset: i * 1.7 });
  });
  const turf = M.paint(0x2f9e44, { gloss: 0.2 });
  for (const [x, y, z] of [[-0.1, 0.24, 0.36], [-0.16, 0.17, 0.3], [0.0, 0.26, 0.4], [-0.2, 0.21, 0.24]]) {
    m.add(G.rbox(0.032, 0.018, 0.03, 0.006), turf, { p: [x, y, z], r: [x * 11, y * 9, z * 7] });
  }
  m.add(G.rbox(0.09, 0.006, 0.34, 0.003), M.matte(0x6b4a2b), { p: [-0.04, GROUND + 0.004, 0.06] });   // skid mark
  // Corner flag.
  m.add(G.cyl(0.011, 0.013, 0.74, 8), M.paint(0xffffff, { gloss: 0.5 }), { p: [-0.21, GROUND + 0.37, -0.21] });
  m.add(G.lathe([[0.04, 0], [0.03, 0.02], [0.014, 0.035]], 10), M.matte(0x15171c), { p: [-0.21, GROUND, -0.21] });
  m.add(G.plate([[0, 0], [0.2, -0.06], [0, -0.13]], 0.01), M.paint(c.color, { gloss: 0.5, glow: 0.35 }), { p: [-0.2, GROUND + 0.74, -0.21], r: [0, -0.5, 0] });
}

function keeper(m, c) {
  // Set on his line: wide stance, knees bent, big gloves spread, with the goal
  // and its net behind him.
  const kit = strip(c, { skin: 0xe0ac69, hair: 0x2a1a12, shorts: 0x15171c, boots: 0x15171c, sole: 0xf4f6f8, trim: 0xd9ff3a });
  const f = figure(m, {
    kit, bulk: 1.1, at: [0, GROUND, 0.04], pelvis: [0, 0.335, 0], lean: [0.14, 0, 0],
    sleeves: 'long', number: 1, hair: 'cap', hands: false,
    legL: { ankle: [0.15, ANKLE, 0.02], foot: [0, 0.4], knee: [0.5, 0, 1] },
    legR: { ankle: [-0.15, ANKLE, 0.02], foot: [0, -0.4], knee: [-0.5, 0, 1] },
    armL: { hand: [0.27, 0.6, 0.1], elbow: [0.6, -1, -0.2] },
    armR: { hand: [-0.27, 0.6, 0.1], elbow: [-0.6, -1, -0.2] }
  });
  // Gloves: padded palm, four fingers, thumb, wrist strap.
  const pad = M.paint(0xf4f6f8, { gloss: 0.5 });
  const grip = M.paint(c.color, { gloss: 0.6, glow: 0.5 });
  [f.handR, f.handL].forEach((hand, i) => {
    const side = i ? 1 : -1;
    const g = f.root.group({ p: [hand[0] + side * 0.012, hand[1] + 0.03, hand[2]], r: [-0.15, 0, -side * 0.35] });
    g.add(G.rbox(0.09, 0.085, 0.045, 0.018), pad, { p: [0, 0, 0] });
    for (let k = 0; k < 4; k++) g.add(G.rbox(0.021, 0.06, 0.036, 0.009), pad, { p: [-0.034 + k * 0.0226, 0.062 + (k === 1 || k === 2 ? 0.008 : 0), 0] });
    g.add(G.rbox(0.024, 0.05, 0.034, 0.009), pad, { p: [-side * 0.056, 0.0, 0], r: [0, 0, side * 0.7] });
    g.add(G.rbox(0.06, 0.055, 0.008, 0.004), grip, { p: [0, 0, 0.024] });
    g.add(G.rbox(0.094, 0.022, 0.05, 0.008), grip, { p: [0, -0.048, 0] });
    m.anim(g.object, 'pulse', { offset: i * 3.14 });
  });
  // Goal: posts, crossbar, back stanchions, and a net of fine cord.
  const post = M.paint(0xffffff, { gloss: 0.7 });
  const W = 0.285, Z = -0.1, TOP = 0.76, BACK = -0.3;
  for (const s of [-1, 1]) {
    m.add(G.cyl(0.018, 0.018, TOP - GROUND, 10), post, { p: [s * W, (TOP + GROUND) / 2, Z] });
    m.add(G.sphere(0.018, 8, 6), post, { p: [s * W, TOP, Z] });
    bone(m, post, [s * W, TOP, Z], [s * W, GROUND + 0.01, BACK], 0.009, 0.009, 6);
    bone(m, post, [s * W, GROUND + 0.01, Z], [s * W, GROUND + 0.01, BACK], 0.009, 0.009, 6);
  }
  m.add(G.cyl(0.018, 0.018, W * 2, 10), post, { p: [0, TOP, Z], r: [0, 0, Math.PI / 2] });
  m.add(G.cyl(0.009, 0.009, W * 2, 6), post, { p: [0, GROUND + 0.01, BACK], r: [0, 0, Math.PI / 2] });
  const cord = M.matte(0xdfe6ee);
  const top = x => [x, TOP, Z], foot = x => [x, GROUND + 0.01, BACK];
  for (let i = 1; i < 10; i++) { const x = -W + (i / 10) * W * 2; bone(m, cord, top(x), foot(x), 0.0035, 0.0035, 4); }
  for (let j = 1; j < 8; j++) bone(m, cord, lerp(top(-W), foot(-W), j / 8), lerp(top(W), foot(W), j / 8), 0.0035, 0.0035, 4);
  for (const s of [-1, 1]) for (let j = 1; j < 4; j++) {
    bone(m, cord, lerp(top(s * W), foot(s * W), j / 4), [s * W, GROUND + 0.01, Z + (BACK - Z) * (j / 4)], 0.0035, 0.0035, 4);
    bone(m, cord, lerp(top(s * W), foot(s * W), j / 4), [s * W, TOP - (TOP - GROUND) * (j / 4), Z], 0.0035, 0.0035, 4);
  }
}

function playmaker(m, c) {
  // The number ten: slight, upright, a foot on the ball, pointing the pass he
  // wants and holding the tactics board. The passes circle his head.
  const kit = strip(c, { skin: 0xf1c27d, hair: 0x5a3a1a, boots: 0x15171c, trim: 0xffffff });
  const f = figure(m, {
    kit, bulk: 0.9, at: [0, GROUND, -0.05], pelvis: [0, 0.376, 0], lean: [0.04, -0.12, 0],
    hoops: [0.15], number: 10, hair: 'bun',
    legL: { ankle: [0.085, 0.178, 0.14], foot: [0.3, 0.1], knee: [0.15, 0, 1] },
    legR: { ankle: [-0.07, ANKLE, -0.02], foot: [0, -0.2] },
    armR: { hand: [-0.13, 0.56, 0.21], elbow: [-0.6, -1, 0] },
    armL: { hand: [0.2, 0.4, 0.1], elbow: [0.6, -0.2, -1] }
  });
  ball(f.root, 0.058, [0.085, 0.058, 0.175]);
  f.root.add(G.rbox(0.05, 0.024, 0.02, 0.008), M.paint(0xffd23a, { gloss: 0.6, glow: 0.3 }), { p: lerp([0.11, 0.568, 0], [0.2, 0.4, 0.1], 0.3), r: [0, 0, 0.4] });   // armband
  // Tactics board in the left hand: pitch, halfway line, centre circle, magnets.
  const hl = f.handL;
  const board = f.root.group({ p: [hl[0] + 0.02, hl[1] + 0.085, hl[2] + 0.03], r: [-0.55, 0.5, 0] });
  board.add(G.rbox(0.17, 0.22, 0.014, 0.006), M.matte(0x1b1e24));
  board.add(G.box(0.15, 0.2, 0.004), M.paint(0x2f9e44, { gloss: 0.3 }), { p: [0, 0, 0.008] });
  const chalk = M.glow(0xffffff);
  board.add(G.box(0.15, 0.005, 0.003), chalk, { p: [0, 0, 0.011] });
  board.add(G.torus(0.028, 0.003, 4, 16), chalk, { p: [0, 0, 0.011] });
  for (const y of [-0.085, 0.085]) board.add(G.box(0.06, 0.004, 0.003), chalk, { p: [0, y * 0.78, 0.011] });
  const magnet = M.glow(c.color);
  for (const [x, y] of [[-0.04, 0.05], [0.03, 0.035], [0.0, -0.05], [0.045, -0.04]]) board.add(G.cyl(0.011, 0.011, 0.006, 8), magnet, { p: [x, y, 0.013], r: [Math.PI / 2, 0, 0] });
  // Three passes in orbit, on a visible lane.
  m.add(G.torus(0.27, 0.006, 5, 40), M.glow(c.color, 0.7), { p: [0, 0.79, 0], r: [Math.PI / 2, 0, 0], shadow: false });
  for (let i = 0; i < 3; i++) {
    const pass = ball(m, 0.042, [0.27, 0.79, 0], { dark: c.color, glow: 0.45, glowColor: c.color });
    m.anim(pass, 'orbit', { offset: i, radius: 0.27 * c.scale });
  }
}

function flare(m, c) {
  // Not a player: an ultra off the terraces. Hood up, scarf over the face,
  // megaphone at the mouth, a lit flare thrust forward and pouring smoke.
  const kit = strip(c, { skin: 0xe0ac69, shorts: 0x1e2a44, boots: 0xf4f6f8, sole: 0xd8dde3, trim: 0xffffff });
  const f = figure(m, {
    kit, k: 0.93, bulk: 1.12, at: [0, GROUND, -0.06], pelvis: [0, 0.375, 0], lean: [0.05, 0.1, 0],
    sleeves: 'long', trousers: true, hair: 'none',
    legL: { ankle: [0.09, ANKLE, 0.07], foot: [0, 0.25] },
    legR: { ankle: [-0.09, ANKLE, -0.06], foot: [0, -0.3] },
    armL: { hand: [0.22, 0.6, 0.16], elbow: [0.5, -1, -0.3] },
    armR: { hand: [-0.07, 0.63, 0.14], elbow: [-1, -1, 0] }
  });
  // Hood with a peak, hoodie pocket and drawstrings, scarf in club stripes.
  f.head.add(G.sphere(1, 16, 12), c.bodyMat, { p: [0, 0.006, -0.02], s: [0.092, 0.096, 0.088] });
  f.head.add(G.sphere(1, 12, 10), c.bodyMat, { p: [0, -0.055, -0.05], s: [0.078, 0.06, 0.06] });
  f.head.add(G.torus(0.074, 0.014, 6, 18), c.bodyMat, { p: [0, 0.006, 0.03] });
  f.torso.add(G.rbox(0.12, 0.06, 0.02, 0.01), c.bodyMat, { p: [0, 0.07, 0.066] });
  const white = kit.trim, stripe = M.paint(0x15171c, { gloss: 0.4 });
  f.torso.add(G.torus(0.06, 0.026, 8, 18), white, { p: [0, 0.25, 0.005], r: [Math.PI / 2, 0, 0], s: [1.1, 1, 1] });
  for (let i = 0; i < 4; i++) {
    f.torso.add(G.rbox(0.045, 0.04, 0.016, 0.006), i % 2 ? white : stripe, { p: [0.05, 0.215 - i * 0.04, 0.085 - i * 0.004] });
  }
  // Megaphone.
  const h = f.headAt;
  f.root.add(G.lathe([[0.014, 0], [0.018, 0.05], [0.058, 0.15], [0.064, 0.156], [0.054, 0.15], [0.012, 0.05], [0.008, 0.01]], 16), white, { p: [h[0] - 0.02, h[1] - 0.03, h[2] + 0.075], r: [Math.PI / 2 - 0.15, 0, 0] });
  f.root.add(G.torus(0.061, 0.008, 6, 18), stripe, { p: [h[0] - 0.02, h[1] - 0.007, h[2] + 0.226], r: [-0.15, 0, 0] });
  // The flare: tube, cap, and a flame that flickers along its axis.
  const hand = f.handL, dir = [0.3, 0.7, 0.65];
  const tip = [hand[0] + dir[0] * 0.13, hand[1] + dir[1] * 0.13, hand[2] + dir[2] * 0.13];
  const butt = [hand[0] - dir[0] * 0.05, hand[1] - dir[1] * 0.05, hand[2] - dir[2] * 0.05];
  bone(f.root, M.paint(0xf4f6f8, { gloss: 0.5 }), butt, tip, 0.018, 0.018, 10);
  bone(f.root, M.paint(c.color, { gloss: 0.6, glow: 0.4 }), lerp(butt, tip, 0.55), lerp(butt, tip, 0.8), 0.021, 0.021, 10);
  const o = orient(butt, tip);
  const burn = f.root.group({ p: tip, r: o.r });
  const flame = burn.group();
  flame.add(G.cone(0.066, 0.2, 10), M.glow(0xff3b1f, 0.9), { p: [0, 0.1, 0], shadow: false });
  flame.add(G.cone(0.038, 0.13, 8), M.glow(0xffd23a), { p: [0, 0.065, 0], shadow: false });
  flame.add(G.sphere(0.03, 8, 6), M.glow(0xffffff), { p: [0, 0.01, 0], shadow: false });
  m.anim(flame.object, 'flame');
  // Smoke rolling back over his shoulder.
  [[0.3, 0.87, 0.1, 0.045, 0xff9a8a, 0.75], [0.27, 0.88, -0.04, 0.055, 0xe9c9c9, 0.6], [0.2, 0.87, -0.2, 0.066, 0xdcdce4, 0.45]].forEach(([x, y, z, r, col, op], i) => {
    const puff = m.group({ p: [x, y, z] });
    puff.add(G.sphere(r, 10, 8), M.glow(col, op), { shadow: false, s: [1, 0.8, 1.15] });
    m.anim(puff.object, 'pulse', { offset: i * 1.4 });
  });
}

function legend(m, c) {
  // A gilded statue on a plinth, lifting the cup with both hands.
  const stone = M.paint(0x23262e, { gloss: 0.75 });
  const gold = c.goldMat;
  m.add(G.lathe([[0.27, 0], [0.28, 0.02], [0.27, 0.04], [0.22, 0.055], [0.2, 0.07], [0.2, 0.115], [0.225, 0.13], [0.225, 0.15], [0, 0.15]], 28), stone, { p: [0, GROUND, 0] });
  m.add(G.torus(0.275, 0.012, 6, 30), gold, { p: [0, GROUND + 0.022, 0], r: [Math.PI / 2, 0, 0] });
  m.add(G.torus(0.227, 0.01, 6, 30), gold, { p: [0, GROUND + 0.14, 0], r: [Math.PI / 2, 0, 0] });
  m.add(G.rbox(0.15, 0.045, 0.012, 0.005), gold, { p: [0, GROUND + 0.092, 0.2] });
  m.add(G.star(0.03, 0.013, 0.01), c.bodyMat, { p: [0, GROUND + 0.092, 0.208] });

  const dark = M.metal(0xb8860b, { rough: 0.3 });
  const kit = {
    shirt: c.bodyMat, shorts: dark, socks: c.bodyMat, skin: gold, hair: dark,
    boots: gold, sole: dark, laces: gold, trim: gold
  };
  const K = 0.66, TOPY = GROUND + 0.15;
  const f = figure(m, {
    kit, k: K, at: [0, TOPY, -0.02], pelvis: [0, 0.38, 0], lean: [-0.1, 0, 0], head: [-0.25, 0, 0],
    number: 10, hair: 'long', hoops: [0.1],
    legL: { ankle: [0.09, ANKLE, 0.04], foot: [0, 0.3] },
    legR: { ankle: [-0.09, ANKLE, -0.03], foot: [0, -0.3] },
    armL: { hand: [0.1, 0.78, 0.04], elbow: [1, -0.2, -0.2] },
    armR: { hand: [-0.1, 0.78, 0.04], elbow: [-1, -0.2, -0.2] }
  });
  // The cup: turned bowl and stem, two handles, held between the hands.
  const cup = f.root.group({ p: [0, 0.69, 0.05] });
  cup.add(G.lathe([
    [0.05, 0], [0.056, 0.014], [0.03, 0.034], [0.016, 0.07], [0.022, 0.1], [0.064, 0.135], [0.088, 0.2], [0.096, 0.27],
    [0.086, 0.268], [0.078, 0.2], [0.05, 0.15], [0, 0.14]
  ], 20), gold);
  for (const s of [-1, 1]) cup.add(G.torus(0.045, 0.011, 6, 14, Math.PI), gold, { p: [s * 0.09, 0.2, 0], r: [0, 0, -s * Math.PI / 2] });
  cup.add(G.torus(0.09, 0.008, 6, 20), c.bodyMat, { p: [0, 0.262, 0], r: [Math.PI / 2, 0, 0] });
  // A glint over the cup, and stars circling the plinth.
  const glint = m.group({ p: [0, TOPY + K * 0.99, 0.01] });
  glint.add(G.star(0.05, 0.015, 0.008, 4), M.energy(0xfff3b0, 0.9), { shadow: false });
  glint.add(G.sphere(0.022, 8, 6), M.glow(0xffffff), { shadow: false });
  m.anim(glint.object, 'pulse');
  const starMat = M.paint(0xffd84a, { gloss: 0.8, glow: 0.7 });
  for (let i = 0; i < 3; i++) {
    const star = m.add(G.star(0.05, 0.022, 0.016), starMat, { p: [0.3, 0.44, 0] });
    m.anim(star, 'orbit', { offset: i, radius: 0.3 * c.scale });
  }
}

const TOWERS = [striker, freeKick, header, tackle, keeper, playmaker, flare, legend];

/**
 * @param {THREE.Group} turret - the part of the tower that turns to aim
 * @param {number} idx - 0-7, matching t1-t8
 * @param {{scale: number, lv: number, color: THREE.Color, bodyMat: THREE.Material, goldMat: THREE.Material}} ctx
 */
export function buildTower(turret, idx, ctx) {
  (TOWERS[idx] || TOWERS[0])(modeller(turret, ctx.scale), ctx);
}
