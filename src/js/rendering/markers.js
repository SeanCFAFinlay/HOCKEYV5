// Spawn and base landmarks.
//
// Spawns are covered tunnels that bridge the moat and open onto their cell:
// the place enemies visibly come out of. The base is the biggest thing on the
// board's edge and different in every theme (goal, reactor, fridge, 18th hole,
// ball return): the thing worth defending.
//
// Both stand outside the grid, in the gap the kerb leaves for them. The only
// thing drawn on the spawn/base cells themselves is flat paint.
//
// Each is authored in a local frame where +X points away from the board, then
// turned to suit the edge it stands on. Static parts are merged per material.

import { getState } from '../engine/state.js';
import { makeTextSprite } from './sprites.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { G, M, modeller } from './model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from './geo-utils.js';
import { BOARD, makeBoardMaterials } from './board.js';

const HALF_PI = Math.PI / 2;

/** One mesh from a list of quads (each four [x, y, z] corners), with tiling UVs. */
function quadMesh(quads, material, density = 5) {
  const position = [], uv = [];
  for (const [a, b, c, d] of quads) {
    const lu = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * density;
    const lv = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]) * density;
    for (const [p, u, v] of [[a, 0, 0], [b, lu, 0], [c, lu, lv], [a, 0, 0], [c, lu, lv], [d, 0, lv]]) {
      position.push(p[0], p[1], p[2]);
      uv.push(u, v);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

function netMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.strokeRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
}

function signMaterial(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#10143a';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 240, 112);
  ctx.fillStyle = color;
  ctx.font = '900 92px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 68);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide });
}

// ── Spawn tunnel ────────────────────────────────────────────────────────────

/**
 * A covered bridge over the moat with a lit mouth on the board side.
 * Local frame: cell centre at the origin, +X outward. Grid edge is x = 0.5.
 */
function buildTunnel(group, mats, look, theme) {
  const m = modeller(group, 1);
  const mouth = 0.62;                                  // just beyond the grid edge
  const far = 0.5 + BOARD.EDGE + BOARD.MOAT + 0.1;      // the stand front
  const len = far - mouth, mid = (far + mouth) / 2;
  const wallH = 0.72, halfW = 0.58;

  // Deck across the moat, on two piers.
  const slabEdge = 0.5 + BOARD.EDGE;
  m.add(G.box(far - slabEdge, 0.16, halfW * 2 + 0.16), mats.base, { p: [(far + slabEdge) / 2, -0.08, 0] });
  for (const x of [slabEdge + 0.45, far - 0.35]) m.add(G.box(0.3, BOARD.DEPTH - 0.16, halfW * 2 - 0.2), mats.base, { p: [x, -(BOARD.DEPTH + 0.16) / 2, 0] });

  // Walls and a barrel roof.
  // Built of whatever the arena's edge is built of.
  const shell = mats.kbody || mats.body, rib = mats.kcap || mats.cap;
  for (const s of [-1, 1]) m.add(G.box(len, wallH, 0.14), shell, { p: [mid, wallH / 2, s * (halfW + 0.01)] });
  m.add(new THREE.CylinderGeometry(halfW + 0.08, halfW + 0.08, len, 18, 1, false, 0, Math.PI), shell, { p: [mid, wallH, 0], r: [0, 0, HALF_PI] });
  // Ribs over the roof in the kerb's cap colour.
  for (const x of [mouth + len * 0.38, mouth + len * 0.72, far - 0.08]) {
    m.add(G.torus(halfW + 0.08, 0.05, 6, 18, Math.PI), rib, { p: [x, wallH, 0], r: [0, HALF_PI, 0] });
  }

  // The mouth: a heavy arch in the spawn colour, black inside.
  m.add(G.torus(halfW + 0.03, 0.1, 8, 20, Math.PI), look.frame, { p: [mouth, wallH, 0], r: [0, HALF_PI, 0] });
  for (const s of [-1, 1]) m.add(G.rbox(0.2, wallH, 0.2, 0.03), look.frame, { p: [mouth, wallH / 2, s * (halfW + 0.03)] });
  m.add(new THREE.PlaneGeometry(halfW * 2, wallH + halfW), look.dark, { p: [mouth + 0.45, (wallH + halfW) / 2, 0], r: [0, -HALF_PI, 0], shadow: false });
  // Rings of light receding into it.
  [[0.44, 0.5, 0.2], [0.28, 0.33, 0.3], [0.12, 0.17, 0.4]].forEach(([inner, outer, back]) => {
    m.add(G.ring(inner, outer, 24), look.glow, { p: [mouth + back, 0.56, 0], r: [0, -HALF_PI, 0], shadow: false });
  });
  // Warning lamps either side of the arch.
  for (const s of [-1, 1]) m.add(G.sphere(0.075, 10, 8), look.glow, { p: [mouth - 0.02, wallH + 0.12, s * (halfW + 0.03)], shadow: false });

  if (theme === 'space') {
    // A jump ring standing proud of the mouth.
    m.add(G.torus(0.86, 0.06, 8, 32), mats.accent, { p: [mouth - 0.06, 0.74, 0], r: [0, HALF_PI, 0], shadow: false });
  }

  if (theme === 'bathtub') {
    // The toys pour in through the tap: a chrome collar on the mouth of the
    // pipe and a red cross-head handle on top of it.
    const chrome = M.metal(0xd7dde5, { rough: 0.2 });
    const hot = M.paint(0xe5352b, { gloss: 0.85, glow: 0.25 });
    const top = wallH + halfW + 0.08;
    for (const x of [mouth + 0.22, mouth + len * 0.55]) m.add(G.torus(halfW + 0.12, 0.07, 8, 22, Math.PI), chrome, { p: [x, wallH, 0], r: [0, HALF_PI, 0] });
    m.add(G.lathe([[0.3, 0], [0.32, 0.06], [0.14, 0.14], [0.11, 0.42], [0.16, 0.46], [0, 0.5]], 14), chrome, { p: [mouth + 0.75, top - 0.06, 0] });
    m.add(G.sphere(0.15, 12, 10), hot, { p: [mouth + 0.75, top + 0.52, 0] });
    for (let i = 0; i < 4; i++) {
      const a = i * HALF_PI + 0.6;
      m.add(G.cyl(0.045, 0.045, 0.36, 8), chrome, { p: [mouth + 0.75 + Math.cos(a) * 0.26, top + 0.52, -Math.sin(a) * 0.26], r: [0, a, HALF_PI] });
      m.add(G.sphere(0.1, 10, 8), hot, { p: [mouth + 0.75 + Math.cos(a) * 0.46, top + 0.52, -Math.sin(a) * 0.46] });
    }
  }

  if (theme === 'sushi') {
    // The kitchen hatch: a noren curtain hung across the mouth on a pole.
    const cloth = M.paint(0x24408e, { gloss: 0.2, glow: 0.1 });
    const crest = M.glow(0xf6f1e4);
    const rodY = wallH + 0.42, x = mouth - 0.13;
    m.add(G.cyl(0.035, 0.035, halfW * 2 + 0.5, 8), M.paint(0x5a3520, { gloss: 0.3 }), { p: [x, rodY, 0], r: [HALF_PI, 0, 0] });
    for (let i = 0; i < 4; i++) {
      const z = (i - 1.5) * 0.3;
      m.add(G.box(0.025, 0.6, 0.275), cloth, { p: [x, rodY - 0.31, z] });
      m.add(G.cyl(0.075, 0.075, 0.012, 12), crest, { p: [x - 0.014, rodY - 0.26, z], r: [0, 0, HALF_PI], shadow: false });
    }
  }

  if (theme === 'library') {
    // The books come off the shelf: a ledge over the arch, a row of spines on
    // it, one already toppling out, and a candle at each end.
    const wood = M.paint(0x4a2a18, { gloss: 0.45 });
    const gilt = M.paint(0xe0b04a, { gloss: 0.8, glow: 0.2 });
    const ledgeY = wallH + halfW + 0.1, x = mouth + 0.05;
    m.add(G.rbox(0.36, 0.07, halfW * 2 + 0.6, 0.02), wood, { p: [x, ledgeY, 0] });
    const spines = [0x7a1e22, 0x1f5a3a, 0x24346e, 0x5a2a6a, 0xa8702a, 0x2a4a5a, 0x8a3a1a, 0x1f5a3a];
    let z = -halfW + 0.02;
    spines.forEach((color, i) => {
      const t = 0.11 + (i % 3) * 0.02, h = 0.3 + ((i * 5) % 4) * 0.05, lean = i === 6 ? 0.45 : 0;
      const cover = M.paint(color, { gloss: 0.5, glow: 0.1 });
      m.add(G.box(0.26, h, t), cover, { p: [x, ledgeY + 0.035 + h / 2, z + t / 2], r: [lean, 0, 0] });
      m.add(G.box(0.012, 0.03, t + 0.004), gilt, { p: [x - 0.13, ledgeY + 0.035 + h * 0.75, z + t / 2], r: [lean, 0, 0] });
      z += t + (lean ? 0.12 : 0.008);
    });
    for (const s of [-1, 1]) {
      m.add(G.cyl(0.05, 0.055, 0.22, 10), M.paint(0xf6ecd2, { gloss: 0.35, glow: 0.2 }), { p: [x, ledgeY + 0.145, s * (halfW + 0.2)] });
      m.add(G.cone(0.035, 0.1, 8), look.glow, { p: [x, ledgeY + 0.31, s * (halfW + 0.2)], shadow: false });
    }
  }

  if (theme === 'pizza') {
    // The pizzeria's back door: a red-and-white striped awning over the arch
    // with a scalloped edge, and a dented bin either side of it.
    const red = M.paint(0xc62a1a, { gloss: 0.5, glow: 0.15 });
    const white = M.paint(0xf6efe2, { gloss: 0.4, glow: 0.1 });
    const iron = M.paint(0x24262c, { gloss: 0.5 });
    const y = wallH + halfW + 0.24, x = mouth - 0.06, n = 7, w = (halfW * 2 + 0.5) / n;
    for (let i = 0; i < n; i++) {
      const z = (i - (n - 1) / 2) * w, mat = i % 2 ? white : red;
      m.add(G.box(0.62, 0.03, w), mat, { p: [x, y, z], r: [0, 0, 0.42] });
      m.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.03, 12, 1, false, 0, Math.PI), mat, { p: [x - 0.285, y - 0.13, z], r: [0, 0, -HALF_PI] });
    }
    for (const s of [-1, 1]) {
      m.add(G.tube([[mouth + 0.2, y + 0.12, s * (halfW + 0.2)], [x - 0.1, y - 0.06, s * (halfW + 0.2)], [mouth, wallH, s * (halfW + 0.12)]], 0.02, 5), iron);
      const bz = s * (halfW + 0.42);
      m.add(G.cyl(0.17, 0.15, 0.42, 14), M.metal(0x8a96a4, { rough: 0.4 }), { p: [mouth - 0.2, 0.21, bz] });
      m.add(G.cyl(0.19, 0.19, 0.04, 14), M.metal(0x8a96a4, { rough: 0.4 }), { p: [mouth - 0.2, 0.45, bz], r: [s * 0.25, 0, 0] });
    }
  }

  if (theme === 'arcade') {
    // The characters climb out of a cabinet: a lit marquee over the arch with
    // chasing bulbs, and a coin door either side.
    const laminate = M.paint(0x1c1838, { gloss: 0.85 });
    const y = wallH + halfW + 0.22, x = mouth - 0.08, w = halfW * 2 + 0.44;
    m.add(G.rbox(0.16, 0.34, w, 0.03), laminate, { p: [x, y, 0] });
    m.add(new THREE.PlaneGeometry(w - 0.1, 0.24), M.glow(0xff3df0), { p: [x - 0.085, y, 0], r: [0, -HALF_PI, 0], shadow: false });
    for (let i = 0; i < 7; i++) m.add(G.box(0.03, 0.05, 0.12), M.glow(0x2a0838), { p: [x - 0.09, y, (i - 3) * 0.17], shadow: false });
    for (let i = 0; i < 9; i++) m.add(G.sphere(0.035, 8, 6), M.glow(i % 2 ? 0xffe23a : 0x22e8ff), { p: [x - 0.09, y + 0.2, (i - 4) * (w / 9)], shadow: false });
    for (const s of [-1, 1]) {
      const z = s * (halfW + 0.3);
      m.add(G.rbox(0.14, 0.5, 0.3, 0.03), laminate, { p: [mouth - 0.05, 0.25, z] });
      for (const dz of [-0.06, 0.06]) m.add(G.box(0.02, 0.1, 0.03), M.glow(0xff2d55), { p: [mouth - 0.125, 0.33, z + dz], shadow: false });
      m.add(G.box(0.02, 0.06, 0.18), M.glow(0x22e8ff), { p: [mouth - 0.125, 0.16, z], shadow: false });
    }
  }

  // Painted on the spawn cell: chevrons pointing into the board.
  const chevron = G.plate([[0, 0.2], [-0.16, 0], [0, -0.2], [0.07, -0.2], [-0.06, 0], [0.07, 0.2]], 0.01);
  for (const x of [0.2, -0.05, -0.3]) {
    m.add(chevron.clone(), look.paint, { p: [x, 0.012, 0], r: [-HALF_PI, 0, 0], shadow: false });
  }
  chevron.dispose();
}

// ── Bases ───────────────────────────────────────────────────────────────────
// Local frame as above: the base cell is at the origin, structures stand at
// x > 0.5 (off the grid), facing -X.

function goal(m, look, { postColor, halfW, height, shelf, depth, r = 0.05 }) {
  const paint = M.paint(postColor, { gloss: 0.8, glow: 0.12 });
  const x0 = 0.74;
  for (const s of [-1, 1]) {
    m.add(G.cyl(r, r, height, 12), paint, { p: [x0, height / 2, s * halfW] });
    // Side frame: along the top shelf, then down the back.
    m.add(G.tube([[x0, height, s * halfW], [x0 + shelf, height, s * halfW], [x0 + depth, 0.05, s * halfW]], r * 0.7, 6), paint);
  }
  m.add(G.cyl(r, r, halfW * 2 + r * 2, 12), paint, { p: [x0, height, 0], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(r * 0.7, r * 0.7, halfW * 2, 8), paint, { p: [x0 + shelf, height, 0], r: [HALF_PI, 0, 0] });
  m.add(G.cyl(r * 0.7, r * 0.7, halfW * 2, 8), paint, { p: [x0 + depth, 0.05, 0], r: [HALF_PI, 0, 0] });

  const a = halfW, top = height, xs = x0 + shelf, xd = x0 + depth;
  const net = quadMesh([
    [[x0, top, -a], [x0, top, a], [xs, top, a], [xs, top, -a]],                   // roof
    [[xs, top, -a], [xs, top, a], [xd, 0.03, a], [xd, 0.03, -a]],                 // back
    [[x0, 0.03, -a], [x0, top, -a], [xs, top, -a], [xd, 0.03, -a]],               // sides
    [[x0, 0.03, a], [x0, top, a], [xs, top, a], [xd, 0.03, a]]
  ], look.net);
  net.userData.keep = true;
  m.object.add(net);
}

const BASES = {
  hockey(m, look) {
    goal(m, look, { postColor: 0xd7193f, halfW: 0.98, height: 1.2, shelf: 0.34, depth: 0.74, r: 0.06 });
    // The goal light behind the net.
    m.add(G.cyl(0.03, 0.03, 0.5, 8), M.metal(), { p: [1.4, 1.35, 0] });
    m.add(G.dome(0.11, 12), look.glow, { p: [1.4, 1.6, 0], shadow: false });
  },

  soccer(m, look) {
    goal(m, look, { postColor: 0xffffff, halfW: 1.08, height: 1.25, shelf: 0.3, depth: 0.74, r: 0.055 });
  },

  space(m, look, mats) {
    const x = 1.05;
    m.add(G.lathe([[0.5, 0], [0.55, 0.08], [0.34, 0.26], [0.26, 0.46], [0.36, 0.56], [0, 0.56]], 16), mats.body, { p: [x, 0, 0] });
    m.add(G.cyl(0.07, 0.07, 0.5, 10), look.glow, { p: [x, 0.8, 0], shadow: false });
    m.add(G.sphere(0.3, 18, 14), look.glow, { p: [x, 1.1, 0], shadow: false });
    m.add(G.sphere(0.4, 16, 12), M.energy(look.color, 0.25), { p: [x, 1.1, 0], shadow: false });
    m.add(G.torus(0.52, 0.035, 6, 28), mats.cap, { p: [x, 1.1, 0], r: [HALF_PI, 0.5, 0] });
    m.add(G.torus(0.6, 0.03, 6, 28), mats.accent, { p: [x, 1.1, 0], r: [0.4, 0, 0.9] });
    // Three containment arms.
    for (let i = 0; i < 3; i++) {
      const a = i * (Math.PI * 2 / 3) + 0.5, cx = Math.cos(a), cz = Math.sin(a);
      m.add(G.tube([[x + cx * 0.5, 0.05, cz * 0.5], [x + cx * 0.78, 0.7, cz * 0.78], [x + cx * 0.62, 1.45, cz * 0.62], [x + cx * 0.3, 1.66, cz * 0.3]], 0.045, 6), mats.body);
    }
  },

  kitchen(m, look) {
    // Seen from behind and above (the camera sits on the base side), so the
    // identity is in the silhouette: white box, both doors flung open, light
    // spilling out across the floor, a fruit bowl on top.
    const enamel = M.paint(0xdfe9ef, { gloss: 0.85 });
    const chrome = M.metal();
    const front = 1.02, depth = 0.5, x = front + depth / 2;
    m.add(G.rbox(depth, 1.6, 1.3, 0.06), enamel, { p: [x, 0.83, 0] });
    m.add(G.box(depth + 0.02, 0.03, 1.32), M.matte(0x8fa3ad), { p: [x, 1.16, 0] });        // freezer seam
    m.add(G.rbox(0.05, 0.05, 0.5, 0.02), chrome, { p: [front - 0.03, 1.26, 0] });            // freezer handle
    // The lit inside, with shelves and food.
    m.add(new THREE.PlaneGeometry(1.16, 1.02), M.glow(0xfff3b0), { p: [front - 0.008, 0.6, 0], r: [0, -HALF_PI, 0], shadow: false });
    for (const y of [0.42, 0.76]) m.add(G.box(0.05, 0.025, 1.14), chrome, { p: [front - 0.02, y, 0] });
    m.add(G.sphere(0.1, 10, 8), M.paint(0xe5352b, { gloss: 0.9 }), { p: [front - 0.03, 0.53, 0.3] });
    m.add(G.box(0.1, 0.14, 0.2), M.paint(0xffc93c), { p: [front - 0.03, 0.5, -0.2] });
    m.add(G.cyl(0.06, 0.06, 0.24, 10), M.paint(0x2f9d57, { gloss: 0.9 }), { p: [front - 0.03, 0.89, -0.3] });
    m.add(G.cyl(0.07, 0.07, 0.18, 10), M.paint(0xf5f5f0, { gloss: 0.9 }), { p: [front - 0.03, 0.86, 0.25] });
    // Both doors swung wide, door shelves stocked.
    for (const s of [-1, 1]) {
      const door = m.group({ p: [front, 0, s * 0.64], r: [0, s * 1.35, 0] });
      door.add(G.rbox(0.07, 1.02, 0.62, 0.03), enamel, { p: [-0.035, 0.61, -s * 0.31] });
      door.add(G.rbox(0.05, 0.5, 0.05, 0.02), chrome, { p: [-0.1, 0.62, -s * 0.54] });
      door.add(G.box(0.09, 0.13, 0.44), M.paint(s > 0 ? 0xe5352b : 0x3b82f6, { gloss: 0.8 }), { p: [0.045, 0.42, -s * 0.31] });
      door.add(G.box(0.09, 0.2, 0.44), M.paint(s > 0 ? 0x2f9d57 : 0xffc93c, { gloss: 0.8 }), { p: [0.045, 0.82, -s * 0.31] });
    }
    // Fridge light on the floor of the base cell.
    m.add(new THREE.PlaneGeometry(0.92, 0.92), M.energy(0xfff3b0, 0.32), { p: [0.02, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
    // Fruit bowl on top.
    m.add(G.lathe([[0.1, 0], [0.26, 0.1], [0.3, 0.16], [0.27, 0.16], [0.1, 0.04], [0, 0.04]], 16), M.paint(0x3b82f6, { gloss: 0.9 }), { p: [x, 1.63, 0.25] });
    [[0, 0xff8a3d], [2.1, 0xe5352b], [4.2, 0xffc93c]].forEach(([a, color]) => {
      m.add(G.sphere(0.1, 10, 8), M.paint(color, { gloss: 0.8 }), { p: [x + Math.cos(a) * 0.1, 1.78, 0.25 + Math.sin(a) * 0.1] });
    });
    m.add(G.rbox(0.3, 0.42, 0.14, 0.02), M.paint(0xff8a3d, { gloss: 0.5 }), { p: [x, 1.84, -0.35] });   // cereal box
  },

  golf(m, look) {
    const white = M.paint(0xf4f6f8, { gloss: 0.6, glow: 0.15 });
    const navy = M.paint(0x1a1f4a, { gloss: 0.5 });
    const pink = M.paint(0xff4fd8, { gloss: 0.6, glow: 0.45 });
    // The pin: tall, with a big pennant flying toward the board.
    m.add(G.cyl(0.035, 0.045, 2.1, 8), white, { p: [0.74, 1.05, 0] });
    m.add(G.plate([[0, 0], [0.95, -0.26], [0, -0.52]], 0.03), pink, { p: [0.74, 2.08, 0], r: [0, Math.PI, 0] });
    m.add(G.sphere(0.07, 8, 6), look.glow, { p: [0.74, 2.14, 0], shadow: false });
    // A giant ball on a tee either side, and the 18th's sign between them.
    for (const s of [-1, 1]) {
      m.add(G.lathe([[0.05, 0], [0.07, 0.3], [0.2, 0.44]], 10), M.paint(0xff8a3d, { glow: 0.3 }), { p: [1.02, 0, s * 0.86] });
      m.add(G.sphere(0.27, 16, 12), white, { p: [1.02, 0.68, s * 0.86] });
      m.add(G.cyl(0.045, 0.055, 1.0, 8), navy, { p: [1.3, 0.5, s * 0.5] });
    }
    m.add(G.rbox(0.1, 0.76, 1.4, 0.04), navy, { p: [1.3, 1.3, 0] });
    for (const [dx, ry] of [[-0.055, -HALF_PI], [0.055, HALF_PI]]) {
      // Both faces: the camera usually sits behind the base.
      const face = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.64), look.sign);
      face.position.set(1.3 + dx, 1.3, 0);
      face.rotation.y = ry;
      face.userData.keep = true;
      m.object.add(face);
    }
    // The cup's white liner.
    m.add(G.ring(0.2, 0.25, 24), white, { p: [0, 0.014, 0], r: [-HALF_PI, 0, 0], shadow: false });
  },

  bathtub(m, look) {
    // The plug hole is the base cell itself; the plug stands beside it on its
    // bead chain, hung from a chrome crook, with a life-ring for the defenders.
    const chrome = M.metal(0xd7dde5, { rough: 0.2 });
    const steel = M.paint(0xcfd8e3, { gloss: 0.9, glow: 0.1 });
    const rubber = M.paint(0xe5352b, { gloss: 0.6, glow: 0.18 });
    // The drain: dark hole, steel collar, cross-bars, water spiralling in.
    m.add(new THREE.CircleGeometry(0.27, 28), look.dark, { p: [0, 0.013, 0], r: [-HALF_PI, 0, 0], shadow: false });
    m.add(G.ring(0.25, 0.31, 28), steel, { p: [0, 0.015, 0], r: [-HALF_PI, 0, 0], shadow: false });
    for (const ry of [0, HALF_PI]) m.add(G.box(0.52, 0.02, 0.05), steel, { p: [0, 0.018, 0], r: [0, ry, 0], shadow: false });
    const swirl = M.glow(0xffffff, 0.55);
    [[0.34, 0.2], [0.4, 2.3], [0.46, 4.4]].forEach(([r, start]) => {
      m.add(new THREE.RingGeometry(r, r + 0.03, 24, 1, start, 1.9), swirl, { p: [0, 0.016, 0], r: [-HALF_PI, 0, 0], shadow: false });
    });
    // The plug, pulled.
    const px = 1.0, pz = -0.12;
    m.add(G.lathe([[0.3, 0], [0.45, 0.05], [0.47, 0.27], [0.4, 0.33], [0, 0.33]], 22), rubber, { p: [px, 0, pz] });
    m.add(G.cyl(0.2, 0.22, 0.05, 18), chrome, { p: [px, 0.35, pz] });
    m.add(G.torus(0.13, 0.035, 8, 18), chrome, { p: [px, 0.49, pz], r: [0, HALF_PI, 0] });
    // The crook it hangs from.
    m.add(G.lathe([[0.16, 0], [0.18, 0.04], [0.08, 0.1]], 14), chrome, { p: [1.22, 0, 0.82] });
    m.add(G.tube([[1.22, 0.05, 0.82], [1.22, 1.25, 0.82], [1.18, 1.68, 0.62], [1.05, 1.62, 0.3]], 0.075, 8), steel);
    m.add(G.sphere(0.13, 10, 8), look.glow, { p: [1.05, 1.62, 0.3], shadow: false });
    // Bead chain, sagging from the crook to the plug's ring.
    const from = [1.05, 1.58, 0.3], to = [px, 0.62, pz];
    for (let i = 1; i < 13; i++) {
      const t = i / 13, sag = Math.sin(t * Math.PI) * 0.32;
      m.add(G.sphere(0.065, 8, 6), steel, { p: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t - sag, from[2] + (to[2] - from[2]) * t] });
    }
    // A life-ring propped against the rim.
    const lean = [0.25, 0.9, 0];
    m.add(G.torus(0.27, 0.09, 8, 24), M.paint(0xf4f6f8, { gloss: 0.7, glow: 0.1 }), { p: [1.12, 0.34, -0.82], r: lean });
    const red = M.paint(0xe5352b, { gloss: 0.7, glow: 0.2 });
    for (let i = 0; i < 4; i++) m.add(G.torus(0.27, 0.094, 8, 6, 0.5), red, { p: [1.12, 0.34, -0.82], r: [lean[0], lean[1], i * HALF_PI + 0.5] });
  },

  garden(m, look) {
    // The vegetable patch: a raised bed with the prize pumpkin on its straw,
    // a first-prize rosette on a stake and a lantern on a crook to guard it by.
    const wood = M.paint(0x8a5a33, { gloss: 0.25 });
    const leaf = M.paint(0x4fa33f, { gloss: 0.45, glow: 0.1 });
    const pumpkin = M.paint(0xff8a1f, { gloss: 0.65, glow: 0.22 });
    const x = 1.12;
    m.add(G.rbox(0.92, 0.24, 1.84, 0.04), wood, { p: [x, 0.12, 0] });
    m.add(G.box(0.8, 0.04, 1.72), M.matte(0x3b2a1c), { p: [x, 0.235, 0] });
    for (const s of [-1, 1]) for (const dx of [-0.42, 0.42]) m.add(G.rbox(0.1, 0.34, 0.1, 0.02), wood, { p: [x + dx, 0.17, s * 0.88] });
    m.add(G.cyl(0.5, 0.56, 0.05, 14), M.paint(0xe2c56a, { gloss: 0.2, glow: 0.1 }), { p: [x, 0.28, 0] });        // straw
    // The pumpkin: eight fat ribs round a core, a crooked stalk, a curl of vine.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      m.add(G.sphere(0.3, 12, 10), pumpkin, { p: [x + Math.cos(a) * 0.24, 0.68, Math.sin(a) * 0.24], s: [0.78, 1.25, 0.78] });
    }
    m.add(G.sphere(0.36, 12, 10), pumpkin, { p: [x, 0.68, 0], s: [1, 1.1, 1] });
    m.add(G.tube([[x, 1.02, 0], [x + 0.02, 1.16, 0.02], [x - 0.08, 1.24, 0.06]], 0.045, 6), leaf);
    m.add(G.tube([[x, 1.04, 0], [x + 0.2, 1.1, -0.2], [x + 0.3, 0.9, -0.42], [x + 0.2, 0.6, -0.6], [x + 0.25, 0.32, -0.72]], 0.022, 5), leaf);
    for (const [dx, y, z, ry] of [[0.3, 0.92, -0.44, 0.4], [0.24, 0.36, -0.74, 1.2], [-0.3, 0.34, 0.66, 2.4]]) {
      m.add(G.sphere(0.17, 8, 6), leaf, { p: [x + dx, y, z], r: [0.3, ry, 0], s: [1.2, 0.18, 0.9] });
    }
    // Next year's entries, either side of it.
    for (const [dx, z] of [[-0.2, 0.68], [0.18, 0.74], [-0.02, -0.72]]) {
      m.add(G.sphere(0.13, 10, 8), M.paint(0xa8dc7a, { gloss: 0.5, glow: 0.12 }), { p: [x + dx, 0.33, z], s: [1, 0.85, 1] });
      for (let i = 0; i < 4; i++) m.add(G.sphere(0.11, 6, 5), leaf, { p: [x + dx + Math.cos(i * 1.6) * 0.1, 0.29, z + Math.sin(i * 1.6) * 0.1], s: [1, 0.6, 0.4], r: [0, -i * 1.6 + HALF_PI, 0] });
    }
    // First prize: a rosette on a stake, readable from both sides.
    const blue = M.paint(0x2f6fe0, { gloss: 0.6, glow: 0.3 });
    m.add(G.cyl(0.025, 0.03, 1.5, 6), wood, { p: [0.78, 0.75, 0.74] });
    m.add(G.star(0.26, 0.19, 0.05, 12), blue, { p: [0.78, 1.5, 0.74], r: [0, HALF_PI, 0] });
    m.add(G.cyl(0.14, 0.14, 0.07, 16), M.paint(0xfff3c2, { gloss: 0.6, glow: 0.3 }), { p: [0.78, 1.5, 0.74], r: [0, 0, HALF_PI] });
    for (const s of [-1, 1]) m.add(G.plate([[-0.05, 0], [0.05, 0], [0.07, -0.34], [0, -0.27], [-0.07, -0.34]], 0.03), blue, { p: [0.78, 1.3, 0.74 + s * 0.07], r: [s * 0.25, HALF_PI, 0] });
    // The lantern.
    const iron = M.matte(0x2a2d33);
    m.add(G.tube([[0.78, 0, -0.8], [0.78, 1.3, -0.8], [0.78, 1.62, -0.66], [0.78, 1.52, -0.46]], 0.03, 6), iron);
    m.add(G.cyl(0.006, 0.006, 0.16, 4), iron, { p: [0.78, 1.44, -0.46] });
    m.add(G.lathe([[0.1, 0], [0.11, 0.02], [0.05, 0.08]], 10), iron, { p: [0.78, 1.3, -0.46] });
    m.add(G.cyl(0.07, 0.085, 0.2, 10), look.glow, { p: [0.78, 1.2, -0.46], shadow: false });
    m.add(G.cyl(0.1, 0.1, 0.03, 10), iron, { p: [0.78, 1.09, -0.46] });
    m.add(G.sphere(0.24, 10, 8), M.energy(look.color, 0.28), { p: [0.78, 1.2, -0.46], shadow: false });
    // Lantern light on the base cell.
    m.add(new THREE.CircleGeometry(0.47, 24), M.energy(0xffc56b, 0.26), { p: [0.02, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
  },

  sushi(m, look) {
    // The customer's order, waiting at the end of the bar: a wooden geta with
    // two big pieces on it, tea, chopsticks, and a red lantern over the lot.
    const wood = M.paint(0xc99a5c, { gloss: 0.35 });
    const rice = M.paint(0xfbf7ee, { gloss: 0.25, glow: 0.12 });
    const nori = M.paint(0x16261c, { gloss: 0.35 });
    const black = M.paint(0x1a1513, { gloss: 0.9 });
    const x = 1.12;
    m.add(G.rbox(0.82, 0.09, 1.7, 0.03), wood, { p: [x, 0.24, 0] });
    for (const s of [-1, 1]) m.add(G.rbox(0.7, 0.2, 0.14, 0.03), wood, { p: [x, 0.1, s * 0.55] });
    // Salmon nigiri and an egg one with its belt of nori.
    [[-0.4, 0xff7a55, false], [0.36, 0xffd447, true]].forEach(([z, top, belt]) => {
      m.add(G.rbox(0.56, 0.24, 0.36, 0.1), rice, { p: [x, 0.41, z] });
      m.add(G.rbox(0.7, 0.12, 0.42, 0.05), M.paint(top, { gloss: 0.65, glow: 0.22 }), { p: [x, 0.58, z] });
      if (belt) m.add(G.rbox(0.14, 0.39, 0.45, 0.03), nori, { p: [x, 0.455, z] });
      else for (const dx of [-0.2, 0, 0.2]) m.add(G.box(0.035, 0.014, 0.43), M.paint(0xffd9cc, { glow: 0.25 }), { p: [x + dx, 0.642, z], r: [0, 0.45, 0] });
    });
    m.add(G.lathe([[0.12, 0], [0.1, 0.07], [0.04, 0.13], [0, 0.14]], 12), M.paint(0x86c232, { gloss: 0.4, glow: 0.2 }), { p: [x + 0.2, 0.285, 0.74] });   // wasabi
    m.add(G.sphere(0.11, 10, 8), M.paint(0xffa9b8, { gloss: 0.6, glow: 0.2 }), { p: [x - 0.12, 0.32, 0.74], s: [1, 0.6, 1] });                           // ginger
    // Chopsticks laid across the front on their rest.
    m.add(G.rbox(0.12, 0.08, 0.26, 0.03), M.paint(0xc62a1a, { gloss: 0.85 }), { p: [0.66, 0.04, -0.62] });
    for (const dz of [-0.05, 0.05]) m.add(G.cyl(0.014, 0.024, 1.3, 6), black, { p: [0.66, 0.1, -0.02 + dz], r: [HALF_PI + 0.035, 0, 0] });
    // A cup of tea.
    m.add(G.lathe([[0.13, 0], [0.15, 0.02], [0.18, 0.3], [0.165, 0.3], [0.14, 0.06], [0, 0.05]], 16), M.paint(0x2a4f8a, { gloss: 0.85 }), { p: [1.78, 0, 0.62] });
    m.add(G.cyl(0.16, 0.16, 0.01, 16), M.paint(0x9db83a, { gloss: 0.9, glow: 0.25 }), { p: [1.78, 0.25, 0.62] });
    // The lantern on its pole, so the plate can be found from across the bar.
    m.add(G.cyl(0.035, 0.05, 1.5, 8), black, { p: [1.72, 0.75, -0.3] });
    m.add(G.tube([[1.72, 1.48, -0.3], [1.66, 1.78, -0.3], [1.4, 1.84, -0.3], [1.3, 1.74, -0.3]], 0.03, 6), black);
    m.add(G.sphere(0.27, 16, 12), M.paint(0xe23a2a, { gloss: 0.3, glow: 0.85 }), { p: [1.3, 1.36, -0.3], s: [1, 1.2, 1], shadow: false });
    for (const y of [1.07, 1.65]) m.add(G.cyl(0.14, 0.14, 0.06, 12), black, { p: [1.3, y, -0.3] });
    m.add(G.cyl(0.015, 0.04, 0.2, 6), look.glow, { p: [1.3, 0.95, -0.3], shadow: false });
    m.add(G.sphere(0.4, 12, 10), M.energy(0xff6a3a, 0.2), { p: [1.3, 1.36, -0.3], shadow: false });
    // Lantern light on the base cell.
    m.add(new THREE.CircleGeometry(0.47, 24), M.energy(0xffc56b, 0.26), { p: [0.02, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
  },

  library(m, look) {
    // The librarian's desk, in front of the door to the restricted section:
    // a green banker's lamp, the bell, the returns pile, a round rug.
    const walnut = M.paint(0x4a2a18, { gloss: 0.5 });
    const leather = M.paint(0x1f5a3a, { gloss: 0.35, glow: 0.08 });
    const brass = M.metal(0xd4a24a, { rough: 0.28 });
    const gilt = M.paint(0xe0b04a, { gloss: 0.8, glow: 0.25 });
    const pages = M.paint(0xf3e6c4, { gloss: 0.2, glow: 0.15 });
    // The rug on the base cell.
    m.add(new THREE.CircleGeometry(0.47, 28), M.paint(0x7a1e22, { gloss: 0.1, glow: 0.15 }), { p: [0, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
    m.add(G.ring(0.4, 0.45, 28), M.paint(0xe0b04a, { gloss: 0.2, glow: 0.3 }), { p: [0, 0.013, 0], r: [-HALF_PI, 0, 0], shadow: false });
    // The door: oak, arched, studded, light leaking out round its edges.
    const dx = 1.78;
    m.add(G.box(0.1, 1.4, 1.1), M.glow(0x8f7bff, 0.9), { p: [dx + 0.06, 0.7, 0], shadow: false });
    m.add(G.rbox(0.12, 1.3, 0.96, 0.03), M.paint(0x6a4024, { gloss: 0.4 }), { p: [dx, 0.65, 0] });
    m.add(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 20, 1, false, 0, Math.PI), M.paint(0x6a4024, { gloss: 0.4 }), { p: [dx, 1.3, 0], r: [HALF_PI, 0, HALF_PI] });
    m.add(G.torus(0.6, 0.1, 6, 22, Math.PI), M.paint(0x5a5068, { gloss: 0.3 }), { p: [dx + 0.02, 1.3, 0], r: [0, HALF_PI, 0] });
    for (const s of [-1, 1]) m.add(G.box(0.2, 1.32, 0.18), M.paint(0x5a5068, { gloss: 0.3 }), { p: [dx + 0.02, 0.66, s * 0.6] });
    for (const y of [0.35, 1.05]) m.add(G.box(0.02, 0.06, 0.9), M.matte(0x2a2d33), { p: [dx - 0.065, y, 0] });     // iron straps
    m.add(G.torus(0.08, 0.02, 6, 14), brass, { p: [dx - 0.08, 0.7, 0.28], r: [0, HALF_PI, 0] });
    // The desk.
    const x = 1.05;
    m.add(G.rbox(0.62, 0.62, 1.7, 0.04), walnut, { p: [x, 0.31, 0] });
    m.add(G.rbox(0.7, 0.06, 1.82, 0.02), walnut, { p: [x, 0.65, 0] });
    m.add(G.box(0.6, 0.012, 1.64), leather, { p: [x, 0.685, 0] });
    for (const z of [-0.5, 0, 0.5]) m.add(G.box(0.02, 0.4, 0.42), M.paint(0x3a1f10, { gloss: 0.5 }), { p: [x - 0.31, 0.32, z] });   // carved panels
    m.add(G.box(0.02, 0.04, 1.6), gilt, { p: [x - 0.32, 0.58, 0] });
    // The banker's lamp.
    m.add(G.lathe([[0.12, 0], [0.13, 0.02], [0.06, 0.05], [0.025, 0.06]], 14), brass, { p: [x + 0.1, 0.69, 0.55] });
    m.add(G.cyl(0.015, 0.015, 0.34, 6), brass, { p: [x + 0.1, 0.88, 0.55] });
    m.add(new THREE.CylinderGeometry(0.15, 0.15, 0.36, 16, 1, false, 0, Math.PI), M.paint(0x1f7a40, { gloss: 0.9, glow: 0.5 }), { p: [x + 0.06, 1.05, 0.55], r: [HALF_PI, 0, 0], s: [1, 1, 0.7] });
    m.add(G.box(0.03, 0.26, 0.34), M.glow(0xfff1c2), { p: [x + 0.06, 1.0, 0.55], r: [0, 0, 0], shadow: false });
    m.add(G.sphere(0.4, 10, 8), M.energy(0xffe6a8, 0.16), { p: [x, 0.95, 0.55], shadow: false });
    // The service bell.
    m.add(G.cyl(0.08, 0.09, 0.03, 14), M.paint(0x1a1430, { gloss: 0.7 }), { p: [x - 0.08, 0.705, 0.05] });
    m.add(G.dome(0.07, 14), brass, { p: [x - 0.08, 0.72, 0.05] });
    m.add(G.sphere(0.018, 6, 5), brass, { p: [x - 0.08, 0.8, 0.05] });
    // The returns pile.
    [[0x7a1e22, 0.1, 0], [0x24346e, 0.08, 0.4], [0x5a2a6a, 0.09, -0.3], [0xa8702a, 0.07, 0.2]].reduce((y, [color, t, ry]) => {
      m.add(G.rbox(0.36, t, 0.46, 0.012), M.paint(color, { gloss: 0.5, glow: 0.08 }), { p: [x + 0.05, y + t / 2, -0.45], r: [0, ry, 0] });
      m.add(G.box(0.33, t * 0.75, 0.44), pages, { p: [x + 0.065, y + t / 2, -0.45], r: [0, ry, 0] });
      return y + t;
    }, 0.69);
    // A candle on the corner, lit in the spawn's ghost light.
    m.add(G.cyl(0.04, 0.045, 0.2, 10), M.paint(0xf6ecd2, { gloss: 0.35, glow: 0.2 }), { p: [x - 0.2, 0.79, -0.78] });
    m.add(G.cone(0.03, 0.09, 8), look.glow, { p: [x - 0.2, 0.94, -0.78], shadow: false });
    m.add(G.sphere(0.16, 8, 6), M.energy(look.color, 0.25), { p: [x - 0.2, 0.94, -0.78], shadow: false });
  },

  pizza(m, look) {
    // The front counter: a hot pizza in its open box, the till, the bell,
    // and a striped awning over it all with a giant slice on the roof, so the
    // counter can be found from anywhere in the room.
    const red = M.paint(0xc62a1a, { gloss: 0.6, glow: 0.12 });
    const cream = M.paint(0xf6efe2, { gloss: 0.5, glow: 0.1 });
    const green = M.paint(0x1f6a3a, { gloss: 0.6, glow: 0.1 });
    const kraft = M.paint(0xc89a62, { gloss: 0.2 });
    const chrome = M.metal(0xd7dde5, { rough: 0.2 });
    const crust = M.paint(0xe2a95c, { gloss: 0.35, glow: 0.12 });
    const cheese = M.paint(0xffd866, { gloss: 0.55, glow: 0.22 });
    const pep = M.paint(0xb3261a, { gloss: 0.6, glow: 0.15 });
    const x = 1.1;
    // The counter, tiled down the front in green, white and red.
    m.add(G.rbox(0.62, 0.62, 1.8, 0.04), red, { p: [x, 0.31, 0] });
    [green, cream, red].forEach((mat, i) => m.add(G.box(0.02, 0.1, 1.8), mat, { p: [x - 0.315, 0.44 - i * 0.1, 0] }));
    m.add(G.rbox(0.72, 0.06, 1.92, 0.02), M.paint(0xeee8de, { gloss: 0.85 }), { p: [x, 0.65, 0] });
    // The open box, a whole pie in it.
    m.add(G.rbox(0.56, 0.05, 0.56, 0.01), kraft, { p: [x - 0.04, 0.705, -0.42] });
    m.add(G.rbox(0.03, 0.56, 0.56, 0.01), kraft, { p: [x + 0.25, 0.97, -0.42], r: [0, 0, -0.2] });
    m.add(G.cyl(0.15, 0.15, 0.01, 18), red, { p: [x + 0.22, 1.0, -0.42], r: [0, 0, HALF_PI - 0.2] });
    m.add(G.cyl(0.24, 0.25, 0.03, 24), crust, { p: [x - 0.04, 0.74, -0.42] });
    m.add(G.torus(0.235, 0.03, 6, 24), crust, { p: [x - 0.04, 0.76, -0.42], r: [HALF_PI, 0, 0] });
    m.add(G.cyl(0.21, 0.21, 0.02, 22), cheese, { p: [x - 0.04, 0.762, -0.42] });
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI * 2, d = i === 6 ? 0 : 0.12;
      m.add(G.cyl(0.04, 0.04, 0.012, 12), pep, { p: [x - 0.04 + Math.cos(a) * d, 0.775, -0.42 + Math.sin(a) * d] });
    }
    for (let i = 0; i < 3; i++) m.add(G.sphere(0.08, 8, 6), M.energy(0xffffff, 0.2 - i * 0.05), { p: [x - 0.04, 0.9 + i * 0.14, -0.42 + i * 0.04], shadow: false });
    // The till.
    m.add(G.rbox(0.36, 0.2, 0.42, 0.03), cream, { p: [x + 0.08, 0.78, 0.48] });
    m.add(G.rbox(0.3, 0.16, 0.1, 0.02), cream, { p: [x + 0.16, 0.94, 0.48], r: [0, 0, 0.5] });
    m.add(G.box(0.01, 0.07, 0.2), M.glow(0x56ff9a), { p: [x + 0.11, 0.97, 0.48], r: [0, 0, 0.5], shadow: false });
    m.add(G.box(0.02, 0.05, 0.3), chrome, { p: [x - 0.1, 0.74, 0.48] });
    // The bell.
    m.add(G.cyl(0.07, 0.08, 0.025, 14), M.paint(0x1a1513, { gloss: 0.7 }), { p: [x - 0.18, 0.693, 0.05] });
    m.add(G.dome(0.065, 14), chrome, { p: [x - 0.18, 0.705, 0.05] });
    m.add(G.sphere(0.016, 6, 5), chrome, { p: [x - 0.18, 0.78, 0.05] });
    // The awning, on two posts behind the counter.
    const iron = M.paint(0x24262c, { gloss: 0.5 });
    for (const s of [-1, 1]) m.add(G.cyl(0.035, 0.04, 1.7, 8), iron, { p: [x + 0.42, 0.85, s * 0.98] });
    const n = 8, w = 2.1 / n;
    for (let i = 0; i < n; i++) {
      const z = (i - (n - 1) / 2) * w, mat = i % 2 ? cream : red;
      m.add(G.box(0.9, 0.035, w), mat, { p: [x + 0.06, 1.62, z], r: [0, 0, 0.42] });
      m.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.035, 12, 1, false, 0, Math.PI), mat, { p: [x - 0.36, 1.43, z], r: [0, 0, -HALF_PI] });
    }
    // The slice on the roof, tilted up to be seen.
    const roof = m.group({ p: [x + 0.15, 1.84, 0], r: [0, 0, 0.42] });
    roof.add(G.plate([[0, 0.85], [-0.4, 0], [0.4, 0]], 0.06), cheese, { r: [-HALF_PI, 0, 0], p: [0, 0, 0] });
    roof.add(G.cyl(0.06, 0.06, 0.84, 10), crust, { p: [0, 0.02, 0], r: [0, 0, HALF_PI] });
    for (const [dx, dz] of [[0, -0.45], [-0.14, -0.18], [0.15, -0.2]]) roof.add(G.cyl(0.08, 0.08, 0.02, 12), pep, { p: [dx, 0.04, dz] });
    // Warm light on the base cell.
    m.add(new THREE.CircleGeometry(0.47, 24), M.energy(0xffc56b, 0.26), { p: [0.02, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
  },

  arcade(m, look) {
    // The prize counter: a lit glass case of plush, the star prize (a giant
    // pink bear-blob) sitting on top, tickets spilling off the end, and a
    // neon star on a mast so it can be found from across the floor.
    const laminate = M.paint(0x1c1838, { gloss: 0.85 });
    const glass = M.glass(0xcfe8ff, 0.24);
    const x = 1.12;
    m.add(G.rbox(0.82, 0.36, 1.8, 0.04), laminate, { p: [x, 0.18, 0] });
    m.add(G.box(0.84, 0.05, 1.82), M.glow(0xffe23a), { p: [x, 0.385, 0], shadow: false });
    m.add(G.box(0.76, 0.4, 1.72), glass, { p: [x, 0.61, 0], shadow: false });
    m.add(G.box(0.84, 0.04, 1.82), M.glow(0xff3df0), { p: [x, 0.83, 0], shadow: false });
    [[-0.6, 0x7fd8ff], [-0.2, 0xffe23a], [0.2, 0x8dff7a], [0.6, 0xc9a6ff]].forEach(([z, col]) => {
      const fur = M.paint(col, { gloss: 0.2, glow: 0.18 });
      m.add(G.sphere(0.13, 10, 8), fur, { p: [x, 0.54, z] });
      m.add(G.sphere(0.1, 10, 8), fur, { p: [x - 0.02, 0.7, z] });
      for (const s of [-1, 1]) m.add(G.sphere(0.04, 6, 5), fur, { p: [x - 0.02, 0.78, z + s * 0.07] });
    });
    // The star prize.
    const pink = M.paint(0xff8fc8, { gloss: 0.25, glow: 0.22 });
    m.add(G.sphere(0.32, 16, 12), pink, { p: [x + 0.05, 1.15, 0.3] });
    m.add(G.sphere(0.24, 16, 12), pink, { p: [x, 1.56, 0.3] });
    for (const s of [-1, 1]) {
      m.add(G.sphere(0.09, 8, 6), pink, { p: [x, 1.76, 0.3 + s * 0.17] });
      m.add(G.sphere(0.04, 8, 6), M.glow(0x1a1020), { p: [x - 0.22, 1.6, 0.3 + s * 0.08], shadow: false });
      m.add(G.sphere(0.1, 8, 6), pink, { p: [x - 0.18, 1.12, 0.3 + s * 0.24] });
    }
    m.add(G.sphere(0.06, 8, 6), M.paint(0xffffff, { gloss: 0.4 }), { p: [x - 0.23, 1.52, 0.3], s: [0.6, 0.8, 1.3] });
    m.add(G.torus(0.2, 0.03, 6, 16), M.glow(0xffe23a), { p: [x, 1.38, 0.3], r: [HALF_PI, 0, 0], shadow: false });
    // Tickets, a ribbon of them running off the counter to the floor.
    const tix = M.paint(0xffcf3a, { gloss: 0.4, glow: 0.3 });
    for (let i = 0; i < 7; i++) m.add(G.box(0.16, 0.008, 0.1), tix, { p: [x - 0.3 - Math.min(i, 3) * 0.04, 0.86 - Math.max(0, i - 2) * 0.17, -0.55 - i * 0.02], r: [0, 0, i > 2 ? 1.2 : 0] });
    // The neon star on its mast.
    m.add(G.cyl(0.03, 0.04, 1.6, 8), laminate, { p: [x + 0.3, 1.6, -0.62] });
    m.add(G.star(0.26, 0.11, 0.06), look.glow, { p: [x + 0.3, 2.45, -0.62], r: [0, HALF_PI, 0], shadow: false });
    m.add(G.sphere(0.36, 12, 10), M.energy(look.color, 0.18), { p: [x + 0.3, 2.45, -0.62], shadow: false });
    // Neon glow on the base cell.
    m.add(new THREE.CircleGeometry(0.47, 24), M.energy(0xff3df0, 0.22), { p: [0.02, 0.011, 0], r: [-HALF_PI, 0, 0], shadow: false });
  },

  bowling(big, look) {
    // Built a third larger than drawn, pulled back in toward the board edge.
    const m = modeller(big.object, 1.32);
    const chrome = M.metal();
    const shell = M.paint(0x2a1c4a, { gloss: 0.85 });
    const x = 0.86;
    m.add(G.rbox(0.5, 0.2, 1.84, 0.05), shell, { p: [x, 0.1, 0] });                         // the rack
    for (const s of [-1, 1]) m.add(G.cyl(0.025, 0.025, 1.5, 8), chrome, { p: [x + s * 0.13, 0.27, 0.16], r: [HALF_PI, 0, 0] });
    [[0.82, 0x14b8a6], [0.38, 0xe11d8f], [-0.06, 0xf97316]].forEach(([z, color]) => {
      m.add(G.sphere(0.21, 16, 12), M.paint(color, { gloss: 0.95, glow: 0.15 }), { p: [x, 0.46, z] });
    });
    // The hood the balls come back out of.
    m.add(G.rbox(0.62, 0.78, 0.6, 0.12), shell, { p: [x, 0.5, -0.62] });
    m.add(G.cyl(0.2, 0.2, 0.04, 18), look.dark, { p: [x, 0.48, -0.31], r: [HALF_PI, 0, 0], shadow: false });
    m.add(G.torus(0.22, 0.035, 6, 20), look.glow, { p: [x, 0.48, -0.31], shadow: false });
    m.add(G.rbox(0.4, 0.05, 0.36, 0.02), look.glow, { p: [x, 0.915, -0.62], shadow: false });
    // A neon arrow on a mast over the hood, so it reads from across the alley.
    m.add(G.cyl(0.03, 0.03, 0.7, 8), chrome, { p: [x, 1.25, -0.62] });
    m.add(G.plate([[-0.22, 0.12], [0.22, 0.12], [0, -0.2]], 0.05), look.glow, { p: [x, 1.7, -0.62], r: [0, HALF_PI, 0], shadow: false });
  }
};

export function addSpawnAndPenVisuals(hw, hh) {
  const state = getState();
  const { theme, SPAWNS, BASE, COLS, scene, themeData } = state;
  const visuals = getVisualProfile(themeData);

  if (!Array.isArray(SPAWNS) || !BASE) return;

  const mats = state.boardMaterials || makeBoardMaterials(theme);
  const spawnColor = visuals.map.spawn.color;
  const baseColor = visuals.map.base.color;
  const label = { font: 'bold 46px system-ui', bg: 'rgba(0,0,0,0.45)' };

  // --- Spawn tunnels: all of them baked together ---
  const spawnLook = {
    frame: M.paint(spawnColor, { gloss: 0.7, glow: 0.35 }),
    glow: M.glow(spawnColor),
    paint: M.glow(spawnColor, 0.75),
    dark: new THREE.MeshBasicMaterial({ color: 0x05060a })
  };
  const gates = new THREE.Group();
  for (const s of SPAWNS) {
    const gate = new THREE.Group();
    buildTunnel(gate, mats, spawnLook, theme);
    gate.position.set(s.x - hw + 0.5, 0, s.y - hh + 0.5);
    // Spawns are on the left edge: outward is -X.
    gate.rotation.y = s.x === 0 ? Math.PI : 0;
    gates.add(gate);
  }
  bakeStaticMeshes(gates);
  scene.add(gates);

  for (const s of SPAWNS) {
    const spr = makeTextSprite(visuals.map.spawn.icon || 'ENEMY', label);
    const out = s.x === 0 ? -1 : 1;
    spr.position.set(s.x - hw + 0.5 + out * 0.7, 1.75, s.y - hh + 0.5);
    spr.scale.set(1.4, 0.7, 1);
    scene.add(spr);
  }

  // --- The base ---
  {
    const grp = new THREE.Group();
    const m = modeller(grp, 1);
    const look = {
      color: baseColor,
      glow: M.glow(baseColor),
      dark: new THREE.MeshBasicMaterial({ color: 0x05060a }),
      net: (theme === 'hockey' || theme === 'soccer') ? netMaterial() : null,
      sign: theme === 'golf' ? signMaterial('18', '#39ff88') : null
    };

    // Painted on the base cell: a target ring (and the cup, on the green).
    m.add(G.ring(0.3, 0.42, 32), M.glow(baseColor, 0.85), { p: [0, 0.012, 0], r: [-HALF_PI, 0, 0], shadow: false });
    if (theme === 'golf') m.add(new THREE.CircleGeometry(0.2, 24), look.dark, { p: [0, 0.013, 0], r: [-HALF_PI, 0, 0], shadow: false });

    (BASES[theme] || BASES.space)(m, look, mats);

    const keep = new Set();
    grp.traverse(o => { if (o.userData.keep) keep.add(o); });
    shareEquivalentMaterials(grp);
    bakeStaticMeshes(grp, keep);

    grp.position.set(BASE.x - hw + 0.5, 0, BASE.y - hh + 0.5);
    grp.rotation.y = BASE.x === COLS - 1 ? 0 : Math.PI;
    scene.add(grp);

    const spr = makeTextSprite(visuals.map.base.icon || 'DEFEND', label);
    // Clear of the tallest part of each base (the golf pin is the tallest).
    spr.position.set(BASE.x - hw + 0.5 + 0.6, theme === 'golf' ? 2.75 : 2.15, BASE.y - hh + 0.5);
    spr.scale.set(1.6, 0.75, 1);
    scene.add(spr);
  }
}
