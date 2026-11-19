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
