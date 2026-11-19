// Hockey theme — the eight towers, remodelled.
//
// Six of them are hockey players at toy-figurine level (skates with blades,
// socks and shin guards, hockey pants, a turned jersey torso wider at the
// shoulders than the waist, arms that actually reach the stick, helmet with a
// visor or cage); two are arena machines (the ice resurfacer and the
// scoreboard/goal-light). All six players come from one posable `player()`
// rig, so what separates them is pose, bulk and equipment — the silhouette —
// not just jersey colour.
//
// Model units: stand on y = 0.12, about 0.8 tall, within 0.32 of the axis,
// facing +Z. `m.add` multiplies by the tower's scale. Nothing here runs at
// import time; THREE is only touched inside the builders.

import { G, M, modeller } from '../rendering/model-kit.js';

// ── Small vector helpers (plain [x, y, z] arrays) ───────────────────────────

const V = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  len: a => Math.hypot(a[0], a[1], a[2]),
  norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  // Same conventions as THREE's Euler rotations about X and Y.
  rx: (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)],
  ry: (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)]
};

/** Two-bone IK: where the knee/elbow goes between `a` and `b`, bulging toward `pole`. */
function bend(a, b, l1, l2, pole) {
  const d = V.sub(b, a), dist = V.len(d), reach = l1 + l2;
  if (dist >= reach * 0.999) return V.lerp(a, b, l1 / reach);
  const u = V.mul(d, 1 / dist);
  const along = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const out = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const p = V.norm(V.sub(pole, V.mul(u, V.dot(pole, u))));
  return V.add(V.add(a, V.mul(u, along)), V.mul(p, out));
}

/** A sub-assembly at `a` whose local +Y points at `b` (pads, anything strapped to a limb). */
function frame(g, a, b) {
  const sub = g.group({ p: a });
  const d = V.norm(V.sub(b, a));
  sub.object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(d[0], d[1], d[2]));
  return sub;
}

/** Part of a sphere shell. Front (+Z) is phi = PI/2, back is 3PI/2; theta runs from the crown down. */
const shell = (r, phi0, phiLen, th0, thLen) => new THREE.SphereGeometry(r, 18, 8, phi0, phiLen, th0, thLen);

// ── Shared surfaces ─────────────────────────────────────────────────────────

function palette(c, o = {}) {
  return {
    jersey: c.bodyMat,
    trim: M.paint(o.trim ?? 0xffffff, { gloss: 0.55 }),
    pants: M.paint(o.pants ?? 0x1c2440, { gloss: 0.3 }),
    sock: M.paint(o.sock ?? c.color, { gloss: 0.45, glow: o.sock != null ? 0 : 0.14 }),
    helmet: M.paint(o.helmet ?? c.color, { gloss: 0.92, glow: o.helmet != null ? 0 : 0.16 }),
    skin: M.paint(0xf0c39c, { gloss: 0.25 }),
    glove: M.paint(o.glove ?? 0x1c2440, { gloss: 0.45 }),
    boot: M.paint(0x16181d, { gloss: 0.6 }),
    steel: M.metal(o.blade ?? 0xdfe6ee),
    gold: M.metal(0xffd257),
    visor: M.glass(o.visor ?? 0xbfe9ff, 0.5),
    shaft: M.paint(o.shaft ?? 0x1a1c22, { gloss: 0.5 }),
    tape: M.paint(0xf4f6f8, { gloss: 0.3 }),
    grip: M.paint(c.color, { gloss: 0.5, glow: 0.35 }),
    ink: M.matte(0x15171c)
  };
}

// Seven-segment numerals: jersey numbers and the scoreboard.
const SEGMENTS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgecd', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

function digits(g, str, mat, { p = [0, 0, 0], r = [0, 0, 0], h = 0.07 } = {}) {
  const w = h * 0.5, t = h * 0.17;
  const d = g.group({ p, r });
  [...str].forEach((ch, i) => {
    const ox = (i - (str.length - 1) / 2) * (w + t * 2);
    for (const s of SEGMENTS[ch] || '') {
      const flat = 'adg'.includes(s);
      const x = flat ? 0 : ('bc'.includes(s) ? w / 2 : -w / 2);
      const y = s === 'a' ? h / 2 : s === 'd' ? -h / 2 : s === 'g' ? 0 : ('bf'.includes(s) ? h / 4 : -h / 4);
      d.add(G.box(flat ? w + t : t, flat ? t : h / 2 + t, t * 0.6), mat, { p: [ox + x, y, 0], shadow: false });
    }
  });
}

// ── The player rig ──────────────────────────────────────────────────────────
//
// Figure units: ice at y = 0, a standing figure is ~0.85 tall before `k`.

/** Skate: boot, white holder and a steel blade with a rockered toe. Origin is the ankle. */
function skate(f, P, ankle, yaw = 0, pitch = 0) {
  const s = f.group({ p: ankle, r: [pitch, yaw, 0] });
  s.add(G.rbox(0.078, 0.078, 0.15, 0.028), P.boot, { p: [0, -0.035, 0.025] });
  s.add(G.rbox(0.07, 0.03, 0.05, 0.012), P.trim, { p: [0, -0.015, 0.085] });            // toe cap
  s.add(G.box(0.03, 0.024, 0.15), P.trim, { p: [0, -0.07, 0.025] });                    // blade holder
  s.add(G.plate([[-0.09, 0], [0.09, 0], [0.108, 0.014], [0.1, 0.024], [-0.094, 0.024]], 0.012), P.steel,
    { p: [0, -0.09, 0.025], r: [0, -Math.PI / 2, 0] });
}

/** Stick: taped shaft and a two-piece blade so the toe curves. `bladeRot` aims the blade's length (+X local). */
function stick(f, P, butt, heel, bladeRot, { blade = P.shaft, toe = P.grip, r = 0.019, size = 1.4 } = {}) {
  f.add(G.tube([butt, heel], r, 8), P.shaft);
  f.add(G.tube([butt, V.lerp(butt, heel, 0.08)], r + 0.007, 8), P.tape);                // knob of tape
  const b = f.group({ p: heel, r: bladeRot });
  b.object.scale.setScalar(size);
  b.add(G.plate([[-0.014, -0.012], [0.09, -0.012], [0.09, 0.04], [0, 0.036], [-0.016, 0.012]], 0.022), blade);
  const tip = b.group({ p: [0.088, 0, 0], r: [0, -0.4, 0] });
  tip.add(G.plate([[0, -0.012], [0.07, -0.012], [0.086, 0], [0.09, 0.03], [0.07, 0.044], [0, 0.04]], 0.022), toe);
  return b;
}

/** A puck. */
const puck = (g, P, p) => g.add(G.cyl(0.042, 0.042, 0.022, 16), P.ink, { p });

function headgear(h, P, gear) {
  const fit = { p: [0, 0.012, -0.006], s: [1, 1.04, 1.08] };
  if (gear === 'none') {
    // Helmet off: cropped hair, a scowl, a shiner and a plaster.
    h.add(shell(0.089, 0, Math.PI * 2, 0, Math.PI * 0.42), M.matte(0x3a2416), { p: [0, 0.004, -0.01] });
    h.add(G.box(0.036, 0.012, 0.012), P.ink, { p: [-0.032, 0.026, 0.077], r: [0, 0, -0.4] });
    h.add(G.box(0.036, 0.012, 0.012), P.ink, { p: [0.032, 0.026, 0.077], r: [0, 0, 0.4] });
    h.add(G.sphere(0.022, 8, 6), M.matte(0x6b3a7a), { p: [0.032, 0.002, 0.07], s: [1, 1, 0.5] });
    h.add(G.box(0.05, 0.014, 0.01), P.tape, { p: [0, -0.042, 0.072] });                 // gritted teeth
    h.add(G.box(0.034, 0.016, 0.01), P.tape, { p: [-0.05, -0.012, 0.066], r: [0, -0.6, 0.5] });   // plaster
    return;
  }
  const low = gear === 'mask' ? 0.66 : 0.56;
  h.add(shell(0.097, 0, Math.PI * 2, 0, Math.PI * low), P.helmet, fit);
  h.add(shell(0.098, Math.PI + 0.25, Math.PI - 0.5, Math.PI * 0.5, Math.PI * 0.26), P.helmet, fit);   // ear and neck guard
  h.add(G.torus(0.1, 0.011, 6, 16, Math.PI), P.trim, { p: fit.p, r: [0, Math.PI / 2, 0], s: [1.08, 1.04, 1] });   // crown stripe
  if (gear === 'mask') {
    // Goalie mask: chin cup and a wire cage over the face.
    h.add(shell(0.098, Math.PI / 2 - 0.8, 1.6, Math.PI * 0.7, Math.PI * 0.22), P.helmet, fit);
    for (const y of [0.012, -0.022, -0.056]) {
      const R = Math.sqrt(0.106 * 0.106 - y * y), arc = 2.2;
      h.add(G.torus(R, 0.006, 5, 14, arc), P.steel, { p: [0, y, 0], r: [Math.PI / 2, 0, (Math.PI - arc) / 2] });
    }
    for (const x of [-0.036, 0, 0.036]) {
      const z = y => Math.sqrt(0.106 * 0.106 - x * x - y * y);
      h.add(G.tube([[x, 0.03, z(0.03)], [x, -0.02, z(0.02)], [x, -0.07, z(0.07)]], 0.006, 5), P.steel);
    }
  } else {
    h.add(shell(0.1, Math.PI / 2 - 1.05, 2.1, Math.PI * 0.44, Math.PI * 0.2), P.visor, { ...fit, shadow: false });
  }
}

/**
 * Build a posed player.
 * @returns {{f: object, t: object, T: Function, knees: number[][], ankles: number[][], hands: number[][], shoulders: number[][]}}
 *   f: modeller for the figure (figure units), t: modeller for the torso (leans with it),
 *   T: torso-local point -> figure point.
 */
function player(m, P, o = {}) {
  const {
    k = 0.9, hipY = 0.36, hipZ = 0, lean = 0.15, twist = 0, bulk = 1,
    feet = [{ x: -0.09, z: 0 }, { x: 0.09, z: 0 }],
    hands = [null, null], elbows = [null, null], arms = true, gloves = true,
    head = {}, number = null
  } = o;

  const f = m.group({ p: [0, 0.12, 0] });
  f.object.scale.setScalar(k);

  // Legs: hockey pants to the knee, sock over a shin guard below it.
  const knees = [], ankles = [];
  feet.forEach((ft, i) => {
    const side = i ? 1 : -1;
    const hip = [side * 0.075 * bulk, hipY, hipZ];
    const ankle = [ft.x, ft.y ?? 0.09, ft.z];
    const knee = ft.knee || bend(hip, ankle, 0.155, 0.155, [side * 0.25, 0.2, 1]);
    f.add(G.tube([hip, knee], 0.066 * bulk, 10), P.pants);
    f.add(G.sphere(0.058, 12, 10), P.sock, { p: knee });
    f.add(G.tube([knee, ankle], 0.05, 10), P.sock);
    f.add(G.tube([V.lerp(knee, ankle, 0.38), V.lerp(knee, ankle, 0.62)], 0.054, 10), P.trim);   // sock stripe
    skate(f, P, ankle, ft.yaw || 0, ft.pitch || 0);
    knees.push(knee); ankles.push(ankle);
  });
  f.add(G.sphere(0.1, 14, 10), P.pants, { p: [0, hipY + 0.01, hipZ], s: [1.45 * bulk, 0.88, 1.12 * bulk] });

  // Torso: a turned jersey, flattened front to back, shoulders wider than the hem.
  const waist = [0, hipY + 0.035, hipZ];
  const T = v => V.add(waist, V.rx(V.ry(v, twist), lean));
  const t = f.group({ p: waist, r: [lean, twist, 0] });
  const sx = 1.12 * bulk, sz = 0.76 * bulk;
  t.add(G.lathe([[0.1, 0], [0.128, 0.012], [0.126, 0.05], [0.12, 0.09], [0.148, 0.15], [0.172, 0.195], [0.158, 0.225], [0.09, 0.247], [0.045, 0.262]], 20),
    P.jersey, { s: [sx, 1, sz] });
  t.add(G.lathe([[0.129, 0.016], [0.135, 0.021], [0.135, 0.044], [0.128, 0.049]], 20), P.trim, { s: [sx, 1, sz] });   // hem stripe
  for (const side of [-1, 1]) {
    t.add(G.sphere(0.072, 14, 10), P.jersey, { p: [side * 0.2 * bulk, 0.2, 0], s: [1.15, 0.8, 1.05] });               // shoulder cap
    t.add(G.torus(0.062, 0.011, 6, 14), P.trim, { p: [side * 0.2 * bulk, 0.19, 0], r: [0, Math.PI / 2, side * 0.5], s: [1, 0.85, 1] });
  }
  t.add(G.torus(0.058, 0.017, 8, 18), P.gold, { p: [0, 0.252, 0], r: [Math.PI / 2, 0, 0] });                          // collar
  t.add(G.cyl(0.04, 0.045, 0.07, 10), P.skin, { p: [0, 0.275, 0.004] });                                              // neck
  if (number) {
    digits(t, number, P.trim, { p: [0, 0.14, -0.148 * sz - 0.004], r: [0.12, Math.PI, 0], h: 0.085 });
  }

  // Head.
  const h = f.group({ p: T([0, 0.345, 0.012]), r: [head.tilt ?? lean * 0.3, (head.turn ?? 0) + twist * 0.4, head.roll ?? 0] });
  h.add(G.sphere(0.084, 16, 12), P.skin);
  for (const x of [-0.03, 0.03]) h.add(G.sphere(0.013, 8, 6), P.ink, { p: [x, 0.002, 0.079] });
  headgear(h, P, head.gear || 'visor');

  // Arms: shoulder, bent elbow, glove on the target point.
  const shoulders = [-1, 1].map(side => T([side * 0.2 * bulk, 0.195, 0]));
  const grips = [0, 1].map(i => hands[i] || [(i ? 1 : -1) * 0.27 * bulk, hipY + 0.02, hipZ + 0.04]);
  if (arms) {
    [0, 1].forEach(i => {
      const side = i ? 1 : -1, sh = shoulders[i], hand = grips[i];
      const el = bend(sh, hand, 0.165, 0.165, elbows[i] || [side * 0.8, -0.5, -0.6]);
      const d = V.norm(V.sub(hand, el));
      const back = s => V.sub(hand, V.mul(d, s));
      const r = 0.047 * (0.55 + 0.45 * bulk);
      f.add(G.tube([sh, el, back(0.05)], r, 10), P.jersey);
      f.add(G.sphere(r + 0.008, 10, 8), P.jersey, { p: el });                             // elbow pad under the sleeve
      f.add(G.tube([back(0.135), back(0.1)], r + 0.005, 10), P.trim);                     // sleeve stripe
      if (gloves) {
        f.add(G.tube([back(0.09), back(0.025)], 0.056, 10), P.glove);                     // gauntlet cuff
        f.add(G.tube([back(0.095), back(0.078)], 0.059, 10), P.gold);
        f.add(G.rbox(0.088, 0.082, 0.092, 0.03), P.glove, { p: hand });
      }
    });
  }
  return { f, t, T, knees, ankles, hands: grips, shoulders, sz };
}

// ── 0 · Slap Shot — skater loaded over the puck ─────────────────────────────

function slapShot(m, c) {
  const P = palette(c, { shaft: 0xe2b56a });        // ash shaft: reads against jersey and ice
  const butt = [-0.09, 0.43, 0.08], heel = [0.2, 0.014, 0.28];
  const { f, t, sz } = player(m, P, {
    k: 0.92, hipY: 0.3, hipZ: -0.05, lean: 0.55, twist: -0.3,
    feet: [{ x: -0.13, z: -0.1, yaw: -0.35 }, { x: 0.12, z: 0.06, yaw: 0.15 }],
    hands: [V.lerp(butt, heel, 0.1), V.lerp(butt, heel, 0.45)],
    head: { tilt: 0.12 }, number: '9'
  });
  t.add(G.cyl(0.036, 0.036, 0.012, 14), P.gold, { p: [0, 0.15, 0.146 * sz], r: [Math.PI / 2, 0, 0] });   // crest
  stick(f, P, butt, heel, [0, Math.PI, 0], { blade: P.ink });
  // The puck on the blade, lit, and the next few lined up: this one fires fast.
  const live = f.group({ p: [0.08, 0.012, 0.36] });
  live.add(G.cyl(0.042, 0.042, 0.022, 16), P.ink);
  live.add(G.torus(0.056, 0.016, 6, 18), M.glow(c.color), { r: [Math.PI / 2, 0, 0], shadow: false });
  m.anim(live.object, 'pulse');
  for (const [x, z] of [[-0.15, 0.31], [-0.22, 0.23], [-0.27, 0.14]]) puck(f, P, [x, 0.011, z]);
}

// ── 1 · Sniper — down on one knee, sighting along the stick ─────────────────

function sniper(m, c) {
  const P = palette(c);
  const { f } = player(m, P, {
    k: 0.95, hipY: 0.25, hipZ: -0.02, lean: 0.12, twist: 0.65, bulk: 0.92,
    feet: [{ x: -0.09, z: 0.16, yaw: -0.1 }, { x: 0.1, z: -0.14, y: 0.115, pitch: 1.15, knee: [0.1, 0.065, 0.06] }],
    hands: [[0.1, 0.5, 0.27], [0.1, 0.49, 0.07]],
    elbows: [[-0.3, -1, 0.2], [0.8, -0.6, -0.2]],
    head: { tilt: 0.05, turn: -0.4, roll: -0.22 }, number: '19'
  });
  // The stick, shouldered like a rifle: blade for a stock, a scope on the shaft.
  stick(f, P, [0.1, 0.5, 0.46], [0.1, 0.5, -0.04], [-0.6, Math.PI / 2, 0], { toe: P.shaft });
  f.add(G.cyl(0.034, 0.034, 0.15, 12), P.ink, { p: [0.1, 0.56, 0.17], r: [Math.PI / 2, 0, 0] });
  f.add(G.cyl(0.042, 0.034, 0.035, 12), P.ink, { p: [0.1, 0.56, 0.255], r: [Math.PI / 2, 0, 0] });
  for (const z of [0.13, 0.21]) f.add(G.box(0.014, 0.03, 0.02), P.steel, { p: [0.1, 0.528, z] });
  f.add(G.cyl(0.034, 0.034, 0.006, 12), M.glow(0xff3b30), { p: [0.1, 0.56, 0.275], r: [Math.PI / 2, 0, 0], shadow: false });
  f.add(G.cyl(0.026, 0.022, 0.05, 10), P.steel, { p: [0.1, 0.5, 0.47], r: [Math.PI / 2, 0, 0] });      // muzzle ferrule
  // Laser sight.
  const beam = f.add(G.cyl(0.009, 0.009, 0.2, 6), M.glow(0xff2a2a, 0.7), { p: [0.1, 0.5, 0.6], r: [Math.PI / 2, 0, 0], shadow: false });
  m.anim(beam, 'blink');
  const dot = f.group({ p: [0.1, 0.5, 0.5] });
  dot.add(G.sphere(0.026, 8, 6), M.glow(0xff4a3a), { shadow: false });
  m.anim(dot.object, 'pulse');
  // Spare rounds.
  for (let i = 0; i < 3; i++) puck(f, P, [-0.21 + (i % 2) * 0.01, 0.011 + i * 0.023, -0.12]);
}

// ── 2 · Enforcer — helmet off, gloves dropped, fists pumping ────────────────

function enforcer(m, c) {
  const P = palette(c, { pants: 0x15171c, sock: 0x15171c, glove: 0x15171c });
  const bulk = 1.22;
  const { f, t, T, sz } = player(m, P, {
    k: 0.9, hipY: 0.33, lean: 0.22, bulk,
    feet: [{ x: -0.14, z: -0.03, yaw: -0.35 }, { x: 0.14, z: 0.05, yaw: 0.25 }],
    arms: false, head: { gear: 'none', tilt: 0.12 }, number: '44'
  });
  digits(t, '44', P.trim, { p: [0, 0.14, 0.15 * sz + 0.004], r: [-0.15, 0, 0], h: 0.085 });
  // Sleeves pushed up; the forearms drive through the elbow pads like pistons.
  for (const side of [-1, 1]) {
    const sh = T([side * 0.2 * bulk, 0.195, 0]);
    const el = [side * 0.25, 0.4, -0.02];
    f.add(G.tube([sh, el], 0.062, 10), P.jersey);
    f.add(G.sphere(0.074, 12, 10), P.trim, { p: el });
    const fist = f.group({ p: [side * 0.25, 0.4, 0.1] });
    fist.add(G.tube([[0, 0, -0.15], [0, 0, 0.06]], 0.048, 10), P.skin);
    fist.add(G.tube([[0, 0, 0.0], [0, 0, 0.06]], 0.053, 10), P.tape);                    // taped wrist
    fist.add(G.rbox(0.108, 0.102, 0.108, 0.038), P.skin, { p: [0, 0, 0.1] });
    fist.add(G.rbox(0.112, 0.05, 0.05, 0.015), P.tape, { p: [0, 0.004, 0.125] });        // taped knuckles
    m.anim(fist.object, 'punch', { side });
  }
  // The gloves he dropped.
  [[-0.07, 0.3, 0.5], [0.1, 0.33, -0.7]].forEach(([x, z, a]) => {
    const g = f.group({ p: [x, 0.04, z], r: [0, a, 0] });
    g.add(G.rbox(0.085, 0.07, 0.1, 0.03), P.glove, { p: [0, 0, 0.03] });
    g.add(G.rbox(0.095, 0.075, 0.07, 0.02), P.glove, { p: [0, 0, -0.05] });
    g.add(G.rbox(0.099, 0.079, 0.02, 0.008), P.gold, { p: [0, 0, -0.075] });
  });
}

// ── 3 · Ice Spray — ice resurfacer with a snow cannon ───────────────────────

function iceSpray(m, c) {
  const body = c.bodyMat;
  const white = M.paint(0xf4f7fa, { gloss: 0.75 });
  const dark = M.paint(0x1b2130, { gloss: 0.35 });
  const tyre = M.matte(0x15171c);
  const chrome = M.metal(0xdfe6ee);
  // Hull: the wedge-fronted snow tank and the low rear deck, cut from one side profile.
  m.add(G.plate([[-0.24, 0.2], [0.26, 0.2], [0.285, 0.25], [0.27, 0.4], [0.19, 0.47], [-0.02, 0.47], [-0.05, 0.38], [-0.24, 0.38]], 0.34),
    body, { r: [0, -Math.PI / 2, 0] });
  m.add(G.rbox(0.36, 0.07, 0.48, 0.025), dark, { p: [0, 0.2, 0.01] });                     // chassis skirt
  m.add(G.rbox(0.35, 0.032, 0.42, 0.01), white, { p: [0, 0.335, 0.04] });                  // waistline stripe
  m.add(G.rbox(0.27, 0.03, 0.17, 0.012), white, { p: [0, 0.478, 0.085] });                 // tank hatch
  m.add(G.rbox(0.35, 0.045, 0.04, 0.015), dark, { p: [0, 0.225, 0.275] });                 // bumper
  for (const x of [-0.11, 0.11]) m.add(G.cyl(0.03, 0.03, 0.012, 12), M.glow(0xfff3c0), { p: [x, 0.33, 0.281], r: [Math.PI / 2 - 0.13, 0, 0], shadow: false });
  for (const x of [-0.18, 0.18]) for (const z of [-0.14, 0.17]) {
    m.add(G.cyl(0.07, 0.07, 0.06, 18), tyre, { p: [x, 0.19, z], r: [0, 0, Math.PI / 2] });
    m.add(G.cyl(0.034, 0.034, 0.066, 12), white, { p: [x, 0.19, z], r: [0, 0, Math.PI / 2] });
  }
  // Conditioner (the blade box it drags) and its lift arms.
  m.add(G.rbox(0.33, 0.07, 0.08, 0.02), chrome, { p: [0, 0.165, -0.275] });
  m.add(G.rbox(0.34, 0.02, 0.03, 0.008), white, { p: [0, 0.13, -0.3] });
  for (const x of [-0.12, 0.12]) m.add(G.tube([[x, 0.36, -0.23], [x, 0.3, -0.29], [x, 0.2, -0.28]], 0.012, 6), chrome);
  // Driver on the rear deck.
  m.add(G.rbox(0.15, 0.05, 0.12, 0.02), tyre, { p: [0, 0.405, -0.14] });
  m.add(G.rbox(0.15, 0.15, 0.035, 0.015), tyre, { p: [0, 0.47, -0.205] });
  m.add(G.lathe([[0.06, 0], [0.078, 0.05], [0.088, 0.13], [0.05, 0.165], [0.03, 0.175]], 14), white, { p: [0, 0.42, -0.135], s: [1.1, 1, 0.8] });
  m.add(G.sphere(0.058, 12, 10), M.paint(0xf0c39c, { gloss: 0.25 }), { p: [0, 0.635, -0.125] });
  m.add(shell(0.066, 0, Math.PI * 2, 0, Math.PI * 0.55), M.paint(c.color, { gloss: 0.9, glow: 0.15 }), { p: [0, 0.642, -0.13] });
  m.add(G.tube([[0, 0.44, -0.02], [0, 0.52, -0.045]], 0.012, 6), tyre);                    // steering column
  m.add(G.torus(0.045, 0.01, 6, 16), tyre, { p: [0, 0.53, -0.05], r: [-0.9, 0, 0] });
  for (const s of [-1, 1]) {
    m.add(G.tube([[s * 0.09, 0.56, -0.135], [s * 0.085, 0.5, -0.09], [s * 0.045, 0.53, -0.055]], 0.024, 6), white);
    m.add(G.sphere(0.028, 8, 6), dark, { p: [s * 0.045, 0.53, -0.053] });
  }
  // Snow cannon: a swan-neck chute off the tank with a flared mouth.
  m.add(G.torus(0.045, 0.014, 6, 16), chrome, { p: [0.08, 0.475, 0.14], r: [Math.PI / 2, 0, 0] });
  m.add(G.tube([[0.08, 0.46, 0.14], [0.08, 0.63, 0.13], [0.07, 0.74, 0.2], [0.055, 0.76, 0.3]], 0.04, 10), white);
  m.add(G.torus(0.042, 0.012, 6, 16), body, { p: [0.079, 0.6, 0.131], r: [Math.PI / 2, 0, 0] });
  m.add(G.cyl(0.058, 0.04, 0.08, 14), body, { p: [0.052, 0.757, 0.335], r: [Math.PI / 2 + 0.1, 0, 0] });
  [0.41, 0.47].forEach((z, i) => {
    const puff = m.group({ p: [0.05, 0.745 - i * 0.02, z] });
    puff.add(G.sphere(0.05 + i * 0.015, 10, 8), M.glow(0xffffff, 0.9 - i * 0.25), { shadow: false });
    m.anim(puff.object, 'pulse', { offset: i * 1.6 });
  });
  const ice = M.glow(0xc8f1ff);
  [[0.0, 0.7, 0.44], [0.1, 0.78, 0.42], [0.06, 0.66, 0.5], [0.02, 0.8, 0.5]].forEach((p, i) => {
    const flake = m.add(new THREE.OctahedronGeometry(0.02, 0), ice, { p, shadow: false });
    m.anim(flake, 'float', { offset: i });
  });
  // Amber work beacon on a mast.
  m.add(G.cyl(0.01, 0.01, 0.2, 6), chrome, { p: [-0.13, 0.48, -0.2] });
  m.add(G.cyl(0.03, 0.03, 0.02, 10), tyre, { p: [-0.13, 0.585, -0.2] });
  const beacon = m.group({ p: [-0.13, 0.615, -0.2] });
  beacon.add(G.capsule(0.027, 0.06, 10), M.glow(0xffa51f), { p: [0, -0.025, 0], shadow: false });
  beacon.add(G.box(0.1, 0.02, 0.02), M.energy(0xffc24a, 0.7), { p: [0.03, 0.005, 0], shadow: false });
  m.anim(beacon.object, 'spin', { speed: 2.4 });
}

// ── 4 · Goalie — set in the butterfly in front of his net ───────────────────

function goalie(m, c) {
  const P = palette(c, { glove: 0x7a4a22 });
  const bulk = 1.18;
  const stickHand = [0.26, 0.3, 0.17];
  const { f, t, knees, ankles, hands, sz } = player(m, P, {
    k: 0.9, hipY: 0.28, hipZ: 0.02, lean: 0.38, bulk,
    feet: [{ x: -0.14, z: 0.07, yaw: -0.3 }, { x: 0.14, z: 0.07, yaw: 0.3 }],
    hands: [[-0.28, 0.42, 0.17], stickHand], gloves: false,
    head: { gear: 'mask', tilt: 0.08 }, number: '1'
  });
  digits(t, '1', P.trim, { p: [0, 0.14, 0.15 * sz + 0.004], r: [-0.15, 0, 0], h: 0.085 });

  // The net: red pipes, white mesh.
  const pipe = M.paint(0xd92b2b, { gloss: 0.85 });
  const cord = M.paint(0xffffff, { gloss: 0.2 });
  const gx = 0.25, gy = 0.47, gz = -0.12;
  for (const s of [-1, 1]) {
    f.add(G.tube([[s * gx, 0, gz], [s * gx, gy, gz]], 0.02, 8), pipe);
    f.add(G.sphere(0.02, 8, 6), pipe, { p: [s * gx, gy, gz] });
  }
  f.add(G.tube([[-gx, gy, gz], [gx, gy, gz]], 0.02, 8), pipe);
  f.add(G.tube([[-gx, 0.016, gz], [-0.24, 0.016, -0.23], [-0.12, 0.016, -0.3], [0.12, 0.016, -0.3], [0.24, 0.016, -0.23], [gx, 0.016, gz]], 0.014, 6), pipe);
  f.add(G.tube([[-gx, gy, gz], [-0.2, gy - 0.02, -0.19], [0, gy - 0.03, -0.215], [0.2, gy - 0.02, -0.19], [gx, gy, gz]], 0.011, 6), pipe);
  for (const x of [-0.2, -0.1, 0, 0.1, 0.2]) {
    const zt = -0.215 + Math.abs(x) * 0.13, zb = -0.3 + Math.abs(x) * 0.3;
    f.add(G.tube([[x, gy - 0.025, zt], [x, 0.016, zb]], 0.005, 4), cord);
  }
  for (const y of [0.13, 0.25, 0.36]) {
    const z = -0.29 + (y / gy) * 0.08;
    f.add(G.tube([[-gx, y, gz], [-0.2, y, z + 0.05], [0, y, z], [0.2, y, z + 0.05], [gx, y, gz]], 0.005, 4), cord);
  }
  f.add(G.box(0.46, 0.44, 0.004), M.glass(0xffffff, 0.22), { p: [0, 0.23, -0.262], r: [-0.19, 0, 0], shadow: false });

  // Leg pads: tall white slabs with knee rolls, strapped over the shins.
  const stripe = M.paint(c.color, { gloss: 0.7, glow: 0.2 });
  [0, 1].forEach(i => {
    const side = i ? 1 : -1;
    const a = [ankles[i][0] + side * 0.01, 0.015, ankles[i][2] + 0.085];
    const b = [knees[i][0] + side * 0.02, knees[i][1] + 0.13, knees[i][2] + 0.05];
    const L = V.len(V.sub(b, a));
    const pad = frame(f, a, b);
    pad.add(G.rbox(0.13, L, 0.072, 0.032), P.tape, { p: [0, L / 2, 0] });
    for (const u of [0.42, 0.56, 0.7]) pad.add(G.rbox(0.134, 0.028, 0.03, 0.012), P.tape, { p: [0, L * u, 0.03] });   // knee rolls
    pad.add(G.rbox(0.135, 0.034, 0.076, 0.012), stripe, { p: [0, L * 0.2, 0] });
    pad.add(G.rbox(0.135, 0.034, 0.076, 0.012), stripe, { p: [0, L * 0.88, 0] });
    pad.add(G.rbox(0.03, L * 0.86, 0.076, 0.012), stripe, { p: [side * 0.052, L / 2, 0] });                          // outer roll
  });

  // Blocker and stick: wide paddle, blade across the five-hole.
  f.add(G.rbox(0.09, 0.08, 0.08, 0.03), P.glove, { p: stickHand });
  f.add(G.rbox(0.13, 0.2, 0.04, 0.016), P.tape, { p: V.add(stickHand, [0.01, 0.01, 0.055]), r: [0.25, 0, -0.12] });
  f.add(G.rbox(0.134, 0.04, 0.044, 0.012), stripe, { p: V.add(stickHand, [0.01, 0.01, 0.055]), r: [0.25, 0, -0.12] });
  const heel = [0.13, 0.014, 0.29];
  const up = V.sub(stickHand, heel);
  stick(f, P, V.add(stickHand, V.mul(up, 0.5)), heel, [0, Math.PI, 0], { blade: P.tape, toe: P.tape, r: 0.016 });
  f.add(G.tube([V.add(heel, V.mul(up, 0.05)), V.add(heel, V.mul(up, 0.82))], 0.027, 8), P.tape);                     // paddle

  // Catching glove, up and open, with a save in the pocket.
  const mitt = f.group({ p: hands[0] });
  mitt.add(G.sphere(0.092, 14, 10), P.glove, { p: [0, 0.01, 0.03], s: [1, 1.05, 0.5] });
  mitt.add(G.torus(0.082, 0.014, 6, 18), P.gold, { p: [0, 0.01, 0.05], s: [1, 1.05, 1] });
  mitt.add(G.rbox(0.1, 0.05, 0.07, 0.02), P.glove, { p: [0, -0.07, 0.0] });                                          // cuff
  mitt.add(G.cyl(0.042, 0.042, 0.022, 16), P.ink, { p: [0, 0.012, 0.07], r: [Math.PI / 2, 0, 0] });
  m.anim(mitt.object, 'bob');
  const halo = mitt.group({ p: [0, 0.012, 0.085] });
  halo.add(G.torus(0.05, 0.009, 5, 16), M.energy(c.color, 0.9), { shadow: false });
  m.anim(halo.object, 'pulse');
}

// ── 5 · Power Play — centre-ice scoreboard with a goal light and arcing horns ─

function powerPlay(m, c) {
  const dark = M.metal(0x2a2f3a, { rough: 0.45 });
  const chrome = M.metal(0xdfe6ee);
  const ceramic = M.paint(0xf1ecff, { gloss: 0.85 });
  const lit = M.glow(c.color);
  const digit = M.glow(0xffffff);
  // Weighted base and a ribbed insulator column.
  m.add(G.lathe([[0.25, 0], [0.27, 0.025], [0.25, 0.05], [0.15, 0.075], [0.1, 0.1], [0.085, 0.14]]), dark, { p: [0, 0.12, 0] });
  m.add(G.torus(0.205, 0.012, 6, 28), lit, { p: [0, 0.185, 0], r: [Math.PI / 2, 0, 0], shadow: false });
  const ribs = [];
  for (let i = 0; i < 5; i++) ribs.push([0.055, i * 0.04], [0.098, i * 0.04 + 0.018], [0.055, i * 0.04 + 0.036]);
  m.add(G.lathe(ribs, 20), ceramic, { p: [0, 0.25, 0] });
  m.add(G.lathe([[0.06, 0], [0.17, 0.05], [0.17, 0.06]], 4), dark, { p: [0, 0.43, 0], r: [0, Math.PI / 4, 0] });       // yoke under the board
  // Four-sided scoreboard.
  m.add(G.rbox(0.36, 0.2, 0.36, 0.03), dark, { p: [0, 0.585, 0] });
  m.add(G.rbox(0.385, 0.03, 0.385, 0.012), c.bodyMat, { p: [0, 0.482, 0] });
  m.add(G.rbox(0.385, 0.03, 0.385, 0.012), c.bodyMat, { p: [0, 0.688, 0] });
  const screen = M.glow(new THREE.Color(c.color).multiplyScalar(0.55));
  for (let i = 0; i < 4; i++) {
    const face = m.group({ r: [0, i * Math.PI / 2, 0] });
    face.add(G.rbox(0.29, 0.14, 0.01, 0.004), screen, { p: [0, 0.585, 0.181], shadow: false });
    digits(face, i % 2 ? '5' : '2', digit, { p: [-0.075, 0.585, 0.19], h: 0.085 });
    digits(face, i % 2 ? '4' : '1', digit, { p: [0.075, 0.585, 0.19], h: 0.085 });
    for (const y of [0.565, 0.605]) face.add(G.box(0.016, 0.016, 0.008), digit, { p: [0, y, 0.19], shadow: false });
  }
  // Goal light on top: lit core under a tinted dome, with a beam that sweeps round.
  m.add(G.cyl(0.095, 0.105, 0.03, 20), chrome, { p: [0, 0.715, 0] });
  m.add(G.cyl(0.03, 0.03, 0.09, 10), M.glow(0xffffff), { p: [0, 0.775, 0], shadow: false });
  m.add(G.lathe([[0.082, 0], [0.082, 0.06], [0.066, 0.1], [0.036, 0.125], [0, 0.132]], 18), M.glass(c.color, 0.6), { p: [0, 0.73, 0], shadow: false });
  m.add(G.sphere(0.016, 8, 6), chrome, { p: [0, 0.866, 0] });
  const sweep = m.group({ p: [0, 0.785, 0] });
  for (const s of [-1, 1]) {
    sweep.add(G.cone(0.055, 0.2, 10), M.energy(c.color, 0.42), { p: [s * 0.13, 0, 0], r: [0, 0, s * Math.PI / 2], shadow: false });
  }
  sweep.add(G.plate([[-0.03, -0.04], [0.03, -0.04], [0.03, 0.04], [-0.03, 0.04]], 0.008), chrome, { p: [0, 0, 0] });
  m.anim(sweep.object, 'spin', { speed: 2.2 });
  // Discharge horns on the corners; arcs jump between the front pair and the back pair.
  const tips = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, z]) => [x * 0.2, 0.83, z * 0.2]);
  tips.forEach((tip, i) => {
    const [x, , z] = tip;
    m.add(G.tube([[x * 0.8, 0.7, z * 0.8], [x * 0.95, 0.76, z * 0.95], tip], 0.013, 6), chrome);
    m.add(G.torus(0.02, 0.007, 5, 10), chrome, { p: [x * 0.82, 0.712, z * 0.82], r: [Math.PI / 2, 0, 0] });
    const orb = m.group({ p: tip });
    orb.add(G.sphere(0.03, 10, 8), lit, { shadow: false });
    orb.add(G.sphere(0.046, 10, 8), M.energy(c.color, 0.45), { shadow: false });
    m.anim(orb.object, 'pulse', { offset: i * 1.4 });
  });
  [[0, 1], [2, 3]].forEach(([a, b]) => {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const p = V.lerp(tips[a], tips[b], k / 6);
      const j = k && k < 6 ? (k % 2 ? 1 : -1) : 0;
      pts.push([p[0], p[1] + j * 0.03 + Math.sin(k / 6 * Math.PI) * 0.03, p[2] + j * 0.02]);
    }
    const arc = m.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0), 18, 0.008, 5),
      M.energy(0xe9d5ff, 0.85), { shadow: false });
    m.anim(arc, 'blink');
  });
}

// ── 6 · Hot Stick — stick thrust forward like a torch, blade on fire ────────

function hotStick(m, c) {
  const P = palette(c, { helmet: 0x1a1a1f, pants: 0x2a1512, sock: 0x2a1512, glove: 0x2a1512, trim: 0xffd23a, visor: 0xff8a2a, shaft: 0x2a1512 });
  const butt = [0.14, 0.3, -0.12], heel = [-0.04, 0.5, 0.34];
  const { f, t, sz } = player(m, P, {
    k: 0.92, hipY: 0.34, lean: 0.12, twist: 0.45,
    feet: [{ x: -0.12, z: 0.09, yaw: -0.15 }, { x: 0.12, z: -0.09, yaw: 0.55 }],
    hands: [V.lerp(butt, heel, 0.6), V.lerp(butt, heel, 0.18)],
    head: { tilt: -0.05 }, number: '13'
  });
  // Flame crest on the chest.
  t.add(G.plate([[-0.04, -0.04], [0.04, -0.04], [0.05, 0.0], [0.025, 0.035], [0.02, 0.005], [0, 0.06], [-0.02, 0.01], [-0.03, 0.035], [-0.05, 0]], 0.01),
    M.glow(0xffd23a), { p: [0, 0.15, 0.146 * sz], r: [-0.15, 0, 0], shadow: false });
  const hot = M.glow(0xff8a2a);
  stick(f, P, butt, heel, [-1.2, -Math.PI / 2, 0], { blade: hot, toe: M.glow(0xffe08a) });
  f.add(G.tube([V.lerp(butt, heel, 0.62), heel], 0.024, 8), hot);                        // shaft glowing near the blade
  // Fire off the blade: two tongues out of step, each a hot core in a wider cone.
  const outer = M.glow(0xff4a12, 0.92), mid = M.glow(0xffb52e), core = M.glow(0xfff3c4);
  [[[-0.04, 0.56, 0.385], 1, 0], [[-0.04, 0.63, 0.43], 0.6, 2.2]].forEach(([p, s, offset]) => {
    const fl = f.group({ p });
    fl.add(G.cone(0.1 * s, 0.29 * s, 10), outer, { p: [0, 0.13 * s, 0], shadow: false });
    fl.add(G.cone(0.064 * s, 0.2 * s, 8), mid, { p: [0, 0.09 * s, 0.012], shadow: false });
    fl.add(G.cone(0.032 * s, 0.12 * s, 8), core, { p: [0, 0.055 * s, 0.022], shadow: false });
    m.anim(fl.object, 'flame', { offset });
  });
  [[-0.12, 0.74, 0.33], [0.05, 0.78, 0.42], [-0.02, 0.7, 0.5]].forEach((p, i) => {
    const e = f.add(new THREE.OctahedronGeometry(0.016, 0), mid, { p, shadow: false });
    m.anim(e, 'float', { offset: i * 2 });
  });
  // A puck left smouldering on the ice.
  puck(f, P, [-0.22, 0.011, 0.25]);
  f.add(G.torus(0.046, 0.01, 5, 16), hot, { p: [-0.22, 0.014, 0.25], r: [Math.PI / 2, 0, 0], shadow: false });
}

// ── 7 · Captain — the cup, hoisted overhead ─────────────────────────────────

function captain(m, c) {
  const P = palette(c, { blade: 0xffd257, pants: 0x161a2e });
  const bulk = 1.08;
  const { f, t, sz } = player(m, P, {
    k: 0.76, hipY: 0.34, lean: -0.05, bulk,
    feet: [{ x: -0.115, z: 0, yaw: -0.3 }, { x: 0.115, z: 0, yaw: 0.3 }],
    hands: [[-0.15, 0.835, 0.02], [0.15, 0.835, 0.02]],
    elbows: [[-1, 0, -0.25], [1, 0, -0.25]],
    head: { tilt: -0.28 }, number: '87'
  });
  // The "C", and a gold star crest.
  t.add(G.torus(0.028, 0.01, 6, 14, 4.5), P.gold, { p: [0.085, 0.185, 0.135 * sz], r: [0, 0, 0.9] });
  t.add(G.star(0.05, 0.022, 0.012), P.gold, { p: [-0.01, 0.12, 0.146 * sz], r: [-0.15, 0, 0] });
  // The cup: banded silver barrel, collar and a wide gold bowl — held level above the head.
  const silver = M.metal(0xe8edf3, { rough: 0.12 });
  const cup = f.group({ p: [0, 0.935, 0.02], r: [0, 0, Math.PI / 2] });
  cup.object.scale.setScalar(1.3);
  cup.add(G.lathe([
    [0.07, 0], [0.08, 0.008], [0.08, 0.03], [0.07, 0.036], [0.07, 0.15], [0.078, 0.155], [0.078, 0.172],
    [0.058, 0.182], [0.052, 0.215], [0.036, 0.232], [0.03, 0.25]
  ], 22), silver, { p: [0, -0.18, 0] });
  cup.add(G.lathe([[0.03, 0.245], [0.045, 0.262], [0.074, 0.3], [0.09, 0.36], [0.082, 0.36], [0.064, 0.305], [0, 0.285]], 22), P.gold, { p: [0, -0.18, 0] });
  for (const y of [0.019, 0.075, 0.115, 0.163]) cup.add(G.torus(0.074, 0.009, 6, 22), P.gold, { p: [0, y - 0.18, 0], r: [Math.PI / 2, 0, 0] });
  m.anim(cup.object, 'bob');
  // Glints.
  [[-0.3, 1.0, 0.05], [0.3, 0.84, 0.06], [-0.27, 0.74, 0.08]].forEach((p, i) => {
    const s = f.group({ p });
    s.add(G.star(0.045, 0.016, 0.01, 4), M.glow(0xfff1b8), { shadow: false });
    m.anim(s.object, 'pulse', { offset: i * 2.1 });
  });
}

const TOWERS = [slapShot, sniper, enforcer, iceSpray, goalie, powerPlay, hotStick, captain];

/**
 * @param {THREE.Group} turret - the part of the tower that turns to aim
 * @param {number} idx - 0-7, matching t1-t8
 * @param {{scale: number, lv: number, color: THREE.Color, bodyMat: THREE.Material}} ctx
 */
export function buildTower(turret, idx, ctx) {
  (TOWERS[idx] || TOWERS[0])(modeller(turret, ctx.scale), ctx);
}
