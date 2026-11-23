// Themed projectile models for the built-in worlds (hockey, soccer, space),
// which have no theme kit. See rendering/projectile-models.js for the contract:
// each entry is (m, ctx) => void, building in shot-radius units, nose on +Z.
// A world's visual profile opts a projectile in with `model: '<name>'`.

import { G, M } from './model-kit.js';

const HALF = Math.PI / 2;
const TAU = Math.PI * 2;

// Shared surfaces (shot templates are cached per world and colour, so these
// are only built a handful of times).
const P = (color, glow = 0.15, gloss = 0.6) => M.paint(color, { gloss, glow });

/** A puck lying flat, centred on the origin. */
function puckBody(m, { r = 0.9, h = 0.5, body, band = null }) {
  m.add(G.cyl(r, r, h, 20), body);
  if (band) m.add(G.sleeve(r + 0.02, r + 0.02, h * 0.3, 20), band);
}

// The twelve icosahedron vertices: where a football's pentagons sit.
const ICO = (() => {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [];
  for (const a of [-1, 1]) for (const b of [-t, t]) v.push([0, a, b], [a, b, 0], [b, 0, a]);
  return v.map(([x, y, z]) => { const n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; });
})();

/** A football: a sphere with twelve flat pentagon patches. */
function ball(m, { r = 0.9, base, patch }) {
  m.add(G.sphere(r, 16, 12), base);
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const [x, y, z] of ICO) {
    q.setFromUnitVectors(up, new THREE.Vector3(x, y, z));
    e.setFromQuaternion(q);
    m.add(G.cyl(r * 0.36, r * 0.36, 0.06, 5), patch, { p: [x * r * 0.98, y * r * 0.98, z * r * 0.98], r: [e.x, e.y, e.z] });
  }
}

/** A football boot pointing +Z, sole at y = -0.4: upper, heel, laces, studs. */
function boot(m, { upper, sole, lace, stud }) {
  m.add(G.sphere(0.6, 14, 10), upper, { p: [0, 0, 0.25], s: [0.8, 0.62, 1.55] });   // toe box and vamp
  m.add(G.rbox(0.92, 0.95, 0.8, 0.3), upper, { p: [0, 0.22, -0.55] });               // heel and collar
  m.add(G.rbox(1.0, 0.14, 2.2, 0.06), sole, { p: [0, -0.4, -0.05] });
  for (let i = 0; i < 3; i++) m.add(G.box(0.5, 0.06, 0.08), lace, { p: [0, 0.36 - i * 0.04, 0.0 + i * 0.25], r: [-0.25, 0, 0] });
  for (const [x, z] of [[-0.3, 0.75], [0.3, 0.75], [-0.3, 0.25], [0.3, 0.25], [-0.28, -0.75], [0.28, -0.75]]) {
    m.add(G.cyl(0.08, 0.11, 0.2, 6), stud, { p: [x, -0.56, z] });
  }
}

export const BUILTIN_PROJECTILES = {
  hockey: {
    // Slap Shot: a regulation puck, sliding flat.
    puck(m) {
      puckBody(m, { r: 0.95, h: 0.5, body: P(0x15171d, 0.05), band: M.glow(0x35d6ff) });
      m.add(G.ring(0.38, 0.6, 20), M.glow(0x35d6ff), { p: [0, 0.26, 0], r: [-HALF, 0, 0] });
    },
    // Sniper: a wrist shot on edge, spinning, a tape-orange rim.
    wrister(m) {
      m.add(G.cyl(0.8, 0.8, 0.42, 18), P(0x15171d, 0.05), { r: [0, 0, HALF] });
      m.add(G.torus(0.8, 0.07, 6, 20), M.glow(0xff5a36), { r: [0, HALF, 0] });
      m.add(G.cone(0.3, 1.6, 8), M.energy(0xff5a36, 0.55), { p: [0, 0, -1.2], r: [-HALF, 0, 0] });
    },
    // Enforcer: a double-thick puck strapped in steel, lobbed like a brick.
    heavyPuck(m) {
      puckBody(m, { r: 0.85, h: 0.9, body: P(0x1d2230, 0.08) });
      const steel = M.metal(0xb4c2d2, { rough: 0.3 });
      for (const y of [-0.25, 0.25]) m.add(G.torus(0.87, 0.07, 6, 20), steel, { p: [0, y, 0], r: [HALF, 0, 0] });
      m.add(G.cyl(0.4, 0.4, 0.04, 16), M.glow(0xff8a3c), { p: [0, 0.46, 0] });
    },
    // Ice Spray: a clear, pointed icicle.
    icicle(m) {
      const geo = new THREE.OctahedronGeometry(0.7, 0);
      geo.scale(0.75, 0.75, 1.9);
      m.add(geo, M.glass(0xbff4ff, 0.75));
      m.add(new THREE.OctahedronGeometry(0.35, 0), M.glow(0x7fe9ff), { s: [1, 1, 2.2] });
    },
    // Goalie: a trapper glove snapping shut.
    trapper(m) {
      const leather = P(0xf2f2ec, 0.12, 0.5);
      const trim = P(0xb779ff, 0.25);
      m.add(G.sphere(0.8, 14, 10), leather, { p: [0, 0, 0], s: [1, 0.5, 1.05] });          // palm pocket
      m.add(G.rbox(1.2, 0.4, 0.5, 0.18), trim, { p: [0, 0.05, -0.75] });                   // cuff
      m.add(G.rbox(0.36, 0.34, 1.2, 0.16), leather, { p: [-0.55, 0.15, 0.25], r: [0, 0.2, 0] });   // thumb
      m.add(G.rbox(0.9, 0.18, 0.5, 0.08), trim, { p: [0.05, 0.25, 0.75] });                // T-web
      for (const x of [-0.25, 0.1, 0.45]) m.add(G.cyl(0.035, 0.035, 0.5, 5), M.matte(0x2a1d40), { p: [x, 0.38, 0.1], r: [HALF, 0, 0] });
    },
    // Hot Stick: a puck on fire.
    flamingPuck(m) {
      puckBody(m, { r: 0.8, h: 0.45, body: P(0xc8260f, 0.5), band: M.glow(0xffc23d) });
      const fire = M.energy(0xff5a14, 0.85);
      m.add(G.cone(0.75, 1.9, 9), fire, { p: [0, 0.1, -1.1], r: [-HALF, 0, 0] });
      m.add(G.cone(0.4, 1.2, 8), M.glow(0xffe27a), { p: [0, 0.1, -0.8], r: [-HALF, 0, 0] });
    },
    // Captain: the gold "C" off the captain's sweater.
    captainC(m) {
      const gold = M.metal(0xffc531, { rough: 0.25 });
      gold.emissive = new THREE.Color(0x7a4a00);
      gold.emissiveIntensity = 0.6;
      m.add(G.torus(0.72, 0.24, 8, 22, TAU * 0.78), gold, { r: [-HALF, 0, TAU * 0.11 + HALF] });
      m.add(G.cyl(0.5, 0.5, 0.06, 18), P(0x0c1424, 0.05), { p: [0, -0.15, 0] });
      m.add(G.star(0.32, 0.14, 0.08), M.glow(0xfff2b0), { p: [0, 0.08, 0], r: [-HALF, 0, 0] });
    }
  },

  soccer: {
    // Striker: a classic black-and-white football.
    ball(m) {
      ball(m, { base: P(0xf6f6f2, 0.15), patch: P(0x14161a, 0.02) });
    },
    // Free Kick: a match ball in team blue, wrapped in a swerve stripe.
    swerveBall(m) {
      ball(m, { base: P(0xf6f6f2, 0.15), patch: P(0x1f7ae0, 0.25) });
      m.add(G.torus(0.95, 0.07, 6, 28), M.glow(0x5fd4ff), { r: [0.5, 0, 0.4] });
    },
    // Tackle: a studded boot sliding in, toe first.
    boot(m) {
      boot(m, { upper: P(0xf08a2c, 0.2), sole: P(0x16181d, 0.02), lace: P(0xffffff, 0.2), stud: M.metal(0xd7dde5) });
    },
    // Keeper: an open goalkeeper glove, fingers forward.
    keeperGlove(m) {
      const palm = P(0xb779ff, 0.22);
      const white = P(0xf4f4f4, 0.15);
      m.add(G.rbox(1.15, 0.38, 1.0, 0.16), palm, { p: [0, 0, -0.05] });
      m.add(G.rbox(1.2, 0.46, 0.45, 0.18), white, { p: [0, 0, -0.75] });                   // wrist strap
      for (let i = 0; i < 4; i++) m.add(G.capsule(0.13, 0.75, 8), white, { p: [-0.4 + i * 0.27, 0, 0.35], r: [HALF, 0, 0] });
      m.add(G.capsule(0.15, 0.6, 8), white, { p: [-0.6, 0, 0], r: [HALF, 0, 0.9] });       // thumb
    },
    // Flare: a red hand flare, lit end first.
    flareStick(m) {
      m.add(G.cyl(0.3, 0.3, 1.8, 12), P(0xd0101c, 0.25), { p: [0, 0, -0.2], r: [HALF, 0, 0] });
      m.add(G.cyl(0.33, 0.33, 0.4, 12), P(0xf2f2f2, 0.1), { p: [0, 0, -0.9], r: [HALF, 0, 0] });
      m.add(G.sphere(0.45, 10, 8), M.glow(0xffe0d0), { p: [0, 0, 0.8] });
      m.add(G.sphere(0.7, 10, 8), M.energy(0xff4444, 0.6), { p: [0, 0, 0.8] });
    },
    // Legend: the Golden Boot.
    goldenBoot(m) {
      const gold = M.metal(0xffc531, { rough: 0.22 });
      gold.emissive = new THREE.Color(0x7a4a00);
      gold.emissiveIntensity = 0.6;
      boot(m, { upper: gold, sole: gold, lace: M.glow(0xfff2b0), stud: gold });
    }
  },

  space: {
    // Plasma Cannon: a plasma slug held in two containment rings.
    plasmaSlug(m, ctx) {
      m.add(G.sphere(0.55, 12, 10), M.glow(0xf5e8ff), { s: [1, 1, 1.5] });
      m.add(G.sphere(0.85, 12, 10), M.energy(ctx.color, 0.55), { s: [1, 1, 1.4] });
      const ring = M.metal(0xc8d0e0, { rough: 0.3 });
      for (const z of [-0.45, 0.45]) m.add(G.torus(0.72, 0.09, 6, 20), ring, { p: [0, 0, z] });
    },
    // Ion Snare: a three-pronged grapple trailing an ion spark.
    ionSnare(m, ctx) {
      const steel = M.metal(0xb9c2d6, { rough: 0.3 });
      m.add(G.cyl(0.4, 0.4, 0.6, 12), steel, { r: [HALF, 0, 0] });
      m.add(G.sphere(0.32, 10, 8), M.glow(ctx.color), { p: [0, 0, -0.35] });
      for (let i = 0; i < 3; i++) {
        const a = i * TAU / 3;
        const x = Math.sin(a), y = Math.cos(a);
        m.add(G.tube([[x * 0.3, y * 0.3, 0.2], [x * 0.85, y * 0.85, 0.65], [x * 0.55, y * 0.55, 1.15]], 0.09, 5), steel);
        m.add(G.sphere(0.13, 6, 5), M.glow(ctx.color), { p: [x * 0.55, y * 0.55, 1.15] });
      }
    },
    // Shield Node: a flying hexagonal barrier plate.
    shieldPlate(m, ctx) {
      const hex = [];
      for (let i = 0; i < 6; i++) hex.push([Math.cos(i * TAU / 6) * 1.0, Math.sin(i * TAU / 6) * 1.0]);
      // Laid flat so it reads from the overhead camera, skimming like a disc.
      m.add(G.plate(hex, 0.16), M.glass(ctx.color, 0.6), { r: [-HALF, 0, 0] });
      m.add(G.torus(0.95, 0.07, 4, 6), M.glow(0xe0f0ff), { r: [-HALF, 0, 0] });
      m.add(G.cyl(0.3, 0.3, 0.3, 6), M.metal(0xc8d0e0, { rough: 0.3 }));
    },
    // Nova Flare: a flare canister burning pink from its tail.
    novaPod(m, ctx) {
      m.add(G.capsule(0.4, 1.7, 12), M.paint(0xe9eefc, { gloss: 0.8, glow: 0.1 }), { p: [0, 0, -0.85], r: [HALF, 0, 0] });
      m.add(G.cyl(0.42, 0.42, 0.25, 12), M.glow(ctx.color), { p: [0, 0, 0.1], r: [HALF, 0, 0] });
      m.add(G.cone(0.45, 1.4, 9), M.energy(ctx.color, 0.8), { p: [0, 0, -1.4], r: [-HALF, 0, 0] });
    },
    // Command Core: a gold-finned micro-missile.
    commandMissile(m) {
      const hull = M.paint(0x1a2236, { gloss: 0.85, glow: 0.05 });
      const gold = M.metal(0xffc531, { rough: 0.22 });
      gold.emissive = new THREE.Color(0x7a4a00);
      gold.emissiveIntensity = 0.6;
      m.add(G.cyl(0.36, 0.36, 1.5, 12), hull, { p: [0, 0, -0.1], r: [HALF, 0, 0] });
      m.add(G.cone(0.36, 0.7, 12), gold, { p: [0, 0, 1.0], r: [HALF, 0, 0] });
      for (let i = 0; i < 4; i++) {
        // Outline x = out from the hull, y = along it; then stand it radially.
        const fin = G.plate([[0.3, 0], [0.85, -0.2], [0.85, -0.55], [0.3, -0.65]], 0.06);
        fin.rotateX(HALF);
        fin.rotateZ(i * HALF + Math.PI / 4);
        m.add(fin, gold, { p: [0, 0, -0.35] });
      }
      m.add(G.cone(0.3, 0.9, 8), M.energy(0xffc928, 0.8), { p: [0, 0, -1.25], r: [-HALF, 0, 0] });
    }
  }
};
