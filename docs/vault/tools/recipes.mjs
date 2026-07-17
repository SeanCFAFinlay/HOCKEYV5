// Part lists transcribed from the real mesh builders.
//
//   towers  -> src/js/rendering/tower-meshes.js  (buildHockey/Soccer/SpaceTowerMesh)
//   enemies -> src/js/rendering/enemy-meshes.js  (createEnemyMesh)
//
// Dimensions and positions here mirror the source 1:1 so the schematics stay
// honest. Anything the source randomises (crystals, dust, smoke, sparkles) is
// re-created with a seeded RNG below, so regenerating the vault produces a
// byte-identical diff instead of churn.

const PI = Math.PI;

// Deterministic stand-in for the Math.random() calls in the mesh code.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const ring = (R, tube, pos, rot, fill, op) => ({ t: 'tor', R, tube, pos, rot, fill, op });

// ── Shared tower plinth ────────────────────────────────────────────────────
// Every tower gets this from createTowerMesh() before the per-type builder runs:
// hex base, inner hex, base glow, rim torus and level stars.

export function towerBase(level = 0) {
  const scale = 1 + level * 0.08;
  const parts = [
    { t: 'cyl', rt: 0.4 * scale, rb: 0.45 * scale, len: 0.12, pos: [0, 0.06, 0], fill: 'base' },
    { t: 'tor', R: 0.42 * scale, tube: 0.012, pos: [0, 0.02, 0], rot: [PI / 2, 0, 0], fill: 'glow', op: 0.4 },
    { t: 'cyl', rt: 0.28 * scale, rb: 0.32 * scale, len: 0.06, pos: [0, 0.15, 0], fill: 'base' },
    { t: 'tor', R: 0.34 * scale, tube: 0.018, pos: [0, 0.145, 0], rot: [PI / 2, 0, 0], fill: 'glow', op: 0.9 },
    { t: 'tor', R: 0.26 * scale, tube: 0.012, pos: [0, 0.18, 0], rot: [PI / 2, 0, 0], fill: '#333344' }
  ];
  // Level indicator stars — one per level, at 90-degree steps starting at -Y.
  for (let i = 0; i <= level; i++) {
    const a = (i / 4) * PI * 2 - PI / 2;
    parts.push({
      t: 'oct',
      r: 0.045,
      pos: [Math.cos(a) * 0.35 * scale, 0.14, Math.sin(a) * 0.35 * scale],
      fill: 'gold'
    });
  }
  return parts;
}

// ── Hockey towers ──────────────────────────────────────────────────────────

const HOCKEY = [
  // t1 Slap Shot — skater winding up, puck held at the blade.
  () => [
    { t: 'cyl', rt: 0.15, rb: 0.18, len: 0.35, pos: [0, 0.3, 0], fill: 'body' },
    { t: 'sph', r: 0.1, pos: [0, 0.55, 0], fill: 'white' },
    { t: 'sph', r: 0.11, pos: [0, 0.57, 0], fill: 'body', half: true },
    { t: 'cyl', rt: 0.02, rb: 0.02, len: 0.6, pos: [0.2, 0.35, 0], rot: [0, 0, 0.4], fill: 'dark' },
    { t: 'box', size: [0.2, 0.04, 0.06], pos: [0.35, 0.12, 0], fill: 'dark' },
    { t: 'circ', r: 0.06, pos: [0.35, 0.16, 0.01], fill: 'glow' }
  ],

  // t2 Sniper — tripod-mounted rifle with scope and laser sight.
  () => {
    const parts = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * PI * 2;
      parts.push({
        t: 'cyl', rt: 0.02, rb: 0.03, len: 0.3,
        pos: [Math.cos(a) * 0.12, 0.18, Math.sin(a) * 0.12], fill: 'metal'
      });
    }
    parts.push(
      { t: 'box', size: [0.15, 0.12, 0.35], pos: [0, 0.4, 0], fill: 'body' },
      { t: 'cyl', rt: 0.025, rb: 0.03, len: 0.5, pos: [0, 0.4, 0.4], rot: [PI / 2, 0, 0], fill: 'metal' },
      { t: 'cyl', rt: 0.035, rb: 0.035, len: 0.15, pos: [0, 0.52, 0.1], rot: [PI / 2, 0, 0], fill: 'dark' },
      { t: 'circ', r: 0.03, pos: [0, 0.52, 0.18], fill: '#ff0000' },
      { t: 'cyl', rt: 0.005, rb: 0.005, len: 0.8, pos: [0, 0.52, 0.55], rot: [PI / 2, 0, 0], fill: '#ff0000', op: 0.6 }
    );
    return parts;
  },

  // t3 Enforcer — broad-shouldered bruiser, red gloves, impact rings.
  () => {
    const parts = [
      { t: 'cyl', rt: 0.2, rb: 0.25, len: 0.4, pos: [0, 0.32, 0], fill: 'body' },
      { t: 'box', size: [0.5, 0.12, 0.2], pos: [0, 0.52, 0], fill: 'body' },
      { t: 'sph', r: 0.1, pos: [0, 0.68, 0], fill: 'white' },
      { t: 'sph', r: 0.1, pos: [-0.35, 0.5, 0.1], fill: '#ff0000' },
      { t: 'sph', r: 0.1, pos: [0.35, 0.5, 0.1], fill: '#ff0000' }
    ];
    for (let i = 0; i < 3; i++) {
      parts.push(ring(0.15 + i * 0.08, 0.015, [0.4, 0.5, 0.2], [0, PI / 2, 0], 'body', 0.3 - i * 0.1));
    }
    return parts;
  },

  // t4 Ice Spray — zamboni with a coolant tank and a nozzle rake.
  () => {
    const r = rng(4);
    const parts = [
      { t: 'box', size: [0.4, 0.25, 0.5], pos: [0, 0.25, 0], fill: 'body' },
      { t: 'box', size: [0.25, 0.18, 0.2], pos: [0, 0.42, -0.1], fill: 'white' },
      { t: 'plane', w: 0.08, h: 0.08, pos: [0.126, 0.44, -0.1], fill: '#88ccff' },
      { t: 'cyl', rt: 0.1, rb: 0.1, len: 0.35, pos: [0, 0.3, 0.15], rot: [PI / 2, 0, 0], fill: 'glow' }
    ];
    for (let i = 0; i < 5; i++) {
      parts.push({ t: 'cone', r: 0.03, h: 0.1, pos: [(i - 2) * 0.08, 0.18, 0.35], rot: [-PI / 2, 0, 0], fill: 'glow' });
    }
    for (let i = 0; i < 8; i++) {
      parts.push({
        t: 'oct', r: 0.025,
        pos: [(r() - 0.5) * 0.3, 0.35 + r() * 0.2, 0.4 + r() * 0.15], fill: 'glow'
      });
    }
    return parts;
  },

  // t5 Goalie — leg pads, blocker, catching glove, caged mask.
  () => {
    const parts = [
      { t: 'box', size: [0.12, 0.4, 0.15], pos: [-0.1, 0.3, 0.08], fill: 'white' },
      { t: 'box', size: [0.12, 0.4, 0.15], pos: [0.1, 0.3, 0.08], fill: 'white' },
      { t: 'box', size: [0.35, 0.3, 0.2], pos: [0, 0.55, 0], fill: 'body' },
      { t: 'box', size: [0.18, 0.22, 0.04], pos: [-0.28, 0.5, 0.12], fill: 'white' },
      { t: 'sph', r: 0.1, pos: [0.28, 0.55, 0.12], fill: 'body' },
      { t: 'sph', r: 0.11, pos: [0, 0.78, 0], fill: 'white' }
    ];
    for (let i = 0; i < 5; i++) {
      parts.push({ t: 'cyl', rt: 0.008, rb: 0.008, len: 0.13, pos: [(i - 2) * 0.025, 0.76, 0.1], rot: [PI / 2, 0, 0], fill: 'metal' });
    }
    return parts;
  },

  // t6 Power Play — tesla coil, stacked rings, electrode crown.
  () => {
    const parts = [
      { t: 'cyl', rt: 0.2, rb: 0.25, len: 0.2, pos: [0, 0.2, 0], fill: 'metal' },
      { t: 'cyl', rt: 0.08, rb: 0.15, len: 0.5, pos: [0, 0.5, 0], fill: 'body' }
    ];
    for (let i = 0; i < 6; i++) {
      parts.push(ring(0.12 - i * 0.01, 0.015, [0, 0.3 + i * 0.08, 0], [PI / 2, 0, 0], 'glow'));
    }
    parts.push({ t: 'sph', r: 0.1, pos: [0, 0.85, 0], fill: 'glow' });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2;
      parts.push(
        { t: 'cyl', rt: 0.015, rb: 0.015, len: 0.2, pos: [Math.cos(a) * 0.18, 0.35, Math.sin(a) * 0.18], fill: 'metal' },
        { t: 'sph', r: 0.025, pos: [Math.cos(a) * 0.18, 0.46, Math.sin(a) * 0.18], fill: 'glow' }
      );
    }
    return parts;
  },

  // t7 Hot Stick — vented furnace throwing a flame column.
  () => {
    const parts = [{ t: 'cyl', rt: 0.18, rb: 0.22, len: 0.3, pos: [0, 0.25, 0], fill: 'dark' }];
    for (let i = 0; i < 4; i++) {
      parts.push({ t: 'box', size: [0.12, 0.02, 0.04], pos: [0, 0.2 + i * 0.06, 0.2], fill: '#ff4400' });
    }
    parts.push({ t: 'cyl', rt: 0.06, rb: 0.1, len: 0.15, pos: [0, 0.48, 0], fill: 'metal' });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      parts.push({ t: 'cone', r: 0.06, h: 0.25, pos: [Math.cos(a) * 0.04, 0.7, Math.sin(a) * 0.04], fill: '#ff2200', op: 0.9 });
    }
    parts.push({ t: 'cone', r: 0.08, h: 0.35, pos: [0, 0.75, 0], fill: '#ffaa00', op: 0.7 });
    return parts;
  },

  // t8 Captain — the trophy: stem, cup, spiked crown, floating gem.
  () => {
    const parts = [
      { t: 'box', size: [0.35, 0.15, 0.35], pos: [0, 0.19, 0], fill: 'dark' },
      { t: 'cyl', rt: 0.06, rb: 0.1, len: 0.25, pos: [0, 0.4, 0], fill: 'gold' },
      { t: 'cyl', rt: 0.18, rb: 0.1, len: 0.25, pos: [0, 0.65, 0], fill: 'gold' },
      ring(0.06, 0.015, [-0.22, 0.65, 0], [0, -PI / 2, 0], 'gold'),
      ring(0.06, 0.015, [0.22, 0.65, 0], [0, PI / 2, 0], 'gold'),
      { t: 'cyl', rt: 0.12, rb: 0.1, len: 0.06, pos: [0, 0.82, 0], fill: 'gold' }
    ];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      parts.push({ t: 'cone', r: 0.025, h: 0.1, pos: [Math.cos(a) * 0.08, 0.9, Math.sin(a) * 0.08], fill: 'gold' });
    }
    parts.push({ t: 'oct', r: 0.04, pos: [0, 0.95, 0], fill: '#ff0000' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      parts.push({ t: 'oct', r: 0.02, pos: [Math.cos(a) * 0.25, 0.7 + Math.sin(a * 2) * 0.1, Math.sin(a) * 0.25], fill: 'gold' });
    }
    return parts;
  }
];

// ── Soccer towers ──────────────────────────────────────────────────────────

// Pentagon decals scattered over a ball, matching the fibonacci-ish placement
// the mesh code uses (setFromSphericalCoords over an index sweep).
function ballPatches(centre, radius, count, size) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i + 1) / count);
    const theta = Math.sqrt(count * PI) * phi;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    if (z < 0) continue; // back-facing decals are hidden by the ball
    parts.push({ t: 'circ', r: size, pos: [centre[0] + x, centre[1] + y, centre[2] + z], fill: 'dark' });
  }
  return parts;
}

const SOCCER = [
  // t1 Striker — planted leg, kicking leg, ball at the boot.
  () => [
    { t: 'cyl', rt: 0.04, rb: 0.05, len: 0.3, pos: [-0.08, 0.25, 0], fill: 'white' },
    { t: 'cyl', rt: 0.04, rb: 0.05, len: 0.3, pos: [0.08, 0.25, 0.1], rot: [-0.5, 0, 0], fill: 'white' },
    { t: 'cyl', rt: 0.12, rb: 0.14, len: 0.3, pos: [0, 0.5, 0], fill: 'body' },
    { t: 'sph', r: 0.08, pos: [0, 0.72, 0], fill: 'white' },
    { t: 'box', size: [0.08, 0.05, 0.15], pos: [0.08, 0.12, 0.2], fill: 'body' },
    { t: 'sph', r: 0.07, pos: [0.1, 0.15, 0.35], fill: 'white' },
    ...ballPatches([0.1, 0.15, 0.35], 0.072, 6, 0.02)
  ],

  // t2 Free Kick — ball on a tee, target arm, laser sight and reticle.
  () => [
    { t: 'cyl', rt: 0.2, rb: 0.25, len: 0.12, pos: [0, 0.16, 0], fill: 'dark' },
    { t: 'sph', r: 0.12, pos: [0, 0.35, 0], fill: 'white' },
    ...ballPatches([0, 0.35, 0], 0.122, 12, 0.035),
    { t: 'box', size: [0.04, 0.04, 0.4], pos: [0, 0.55, 0.2], fill: 'metal' },
    { t: 'cyl', rt: 0.008, rb: 0.008, len: 0.6, pos: [0, 0.55, 0.7], rot: [PI / 2, 0, 0], fill: '#ff0000', op: 0.5 },
    { t: 'ring', ri: 0.08, ro: 0.1, pos: [0, 0.55, 1.0], fill: 'glow' }
  ],

  // t3 Header — player pitched forward mid-header, impact rings at the brow.
  () => {
    const parts = [
      { t: 'cyl', rt: 0.12, rb: 0.14, len: 0.35, pos: [0, 0.45, 0.1], rot: [0.8, 0, 0], fill: 'body' },
      { t: 'sph', r: 0.1, pos: [0, 0.55, 0.35], fill: 'white' },
      { t: 'cyl', rt: 0.03, rb: 0.04, len: 0.25, pos: [-0.2, 0.5, 0.15], rot: [0, 0, 0.8], fill: 'body' },
      { t: 'cyl', rt: 0.03, rb: 0.04, len: 0.25, pos: [0.2, 0.5, 0.15], rot: [0, 0, -0.8], fill: 'body' }
    ];
    for (let i = 0; i < 3; i++) {
      parts.push(ring(0.12 + i * 0.08, 0.012, [0, 0.55, 0.45], [PI / 2, 0, 0], 'body', 0.4 - i * 0.1));
    }
    return parts;
  },

  // t4 Tackle — a slide tackle frozen mid-motion, dust trailing behind.
  () => {
    const r = rng(11);
    const parts = [];
    for (let i = 0; i < 5; i++) {
      parts.push({
        t: 'sph', r: 0.06 - i * 0.01,
        pos: [-0.15 + i * 0.08, 0.12, (r() - 0.5) * 0.1], fill: '#8b7355', op: 0.4 - i * 0.07
      });
    }
    parts.push(
      { t: 'cyl', rt: 0.1, rb: 0.12, len: 0.3, pos: [-0.05, 0.22, 0], rot: [0, 0, PI / 2], fill: 'body' },
      { t: 'cyl', rt: 0.04, rb: 0.05, len: 0.35, pos: [0.2, 0.18, 0], rot: [0, 0, PI / 2], fill: 'white' },
      { t: 'box', size: [0.1, 0.06, 0.08], pos: [0.38, 0.18, 0], fill: 'body' }
    );
    for (let i = 0; i < 4; i++) {
      parts.push({ t: 'cyl', rt: 0.012, rb: 0.015, len: 0.03, pos: [0.38, 0.14, (i - 1.5) * 0.02], fill: 'glow' });
    }
    return parts;
  },

  // t5 Keeper — goal frame with the keeper diving across it.
  () => [
    { t: 'cyl', rt: 0.03, rb: 0.03, len: 0.6, pos: [-0.25, 0.4, 0], fill: 'white' },
    { t: 'cyl', rt: 0.03, rb: 0.03, len: 0.6, pos: [0.25, 0.4, 0], fill: 'white' },
    { t: 'cyl', rt: 0.03, rb: 0.03, len: 0.5, pos: [0, 0.7, 0], rot: [0, 0, PI / 2], fill: 'white' },
    { t: 'cyl', rt: 0.1, rb: 0.12, len: 0.3, pos: [0.1, 0.45, 0.1], rot: [0, 0, -0.6], fill: 'body' },
    { t: 'box', size: [0.1, 0.12, 0.06], pos: [-0.1, 0.6, 0.15], fill: 'glow' },
    { t: 'box', size: [0.1, 0.12, 0.06], pos: [0.3, 0.6, 0.15], fill: 'glow' }
  ],

  // t6 Playmaker — hub with three balls orbiting a glowing core.
  () => {
    const parts = [
      { t: 'cyl', rt: 0.2, rb: 0.25, len: 0.15, pos: [0, 0.18, 0], fill: 'dark' },
      { t: 'cyl', rt: 0.1, rb: 0.1, len: 0.1, pos: [0, 0.32, 0], fill: 'metal' }
    ];
    for (let i = 0; i < 2; i++) {
      parts.push(ring(0.25, 0.01, [0, 0.45, 0], [PI / 2 + i * 0.5, 0, 0], 'body', 0.4));
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * PI * 2;
      const c = [Math.cos(a) * 0.25, 0.45, Math.sin(a) * 0.25];
      parts.push({ t: 'sph', r: 0.06, pos: c, fill: 'white' });
      parts.push(...ballPatches(c, 0.062, 3, 0.015));
    }
    parts.push({ t: 'oct', r: 0.08, pos: [0, 0.5, 0], fill: 'glow' });
    return parts;
  },

  // t7 Flare — three-tube launcher venting flares and smoke.
  () => {
    const r = rng(23);
    const parts = [{ t: 'cyl', rt: 0.18, rb: 0.22, len: 0.2, pos: [0, 0.2, 0], fill: 'dark' }];
    for (let i = 0; i < 3; i++) {
      parts.push({ t: 'cyl', rt: 0.05, rb: 0.06, len: 0.25, pos: [(i - 1) * 0.1, 0.42, 0], rot: [-0.2, 0, 0], fill: 'metal' });
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        parts.push({
          t: 'cone', r: 0.04 - j * 0.01, h: 0.15 + j * 0.1,
          pos: [(i - 1) * 0.1, 0.6 + j * 0.1, 0.05],
          fill: j % 2 === 0 ? '#ff2200' : '#ff6600', op: j % 2 === 0 ? 0.9 : 0.8
        });
      }
    }
    for (let i = 0; i < 4; i++) {
      parts.push({ t: 'sph', r: 0.04, pos: [(r() - 0.5) * 0.2, 0.9 + i * 0.08, (r() - 0.5) * 0.1], fill: '#555555', op: 0.3 });
    }
    return parts;
  },

  // t8 Legend — gold statue on a plinth, arms raised, aura rings.
  () => {
    const parts = [
      { t: 'box', size: [0.4, 0.12, 0.4], pos: [0, 0.16, 0], fill: 'dark' },
      { t: 'box', size: [0.3, 0.06, 0.02], pos: [0, 0.18, 0.2], fill: 'gold' },
      { t: 'cyl', rt: 0.12, rb: 0.15, len: 0.08, pos: [0, 0.27, 0], fill: 'gold' },
      { t: 'cyl', rt: 0.08, rb: 0.1, len: 0.3, pos: [0, 0.48, 0], fill: 'gold' },
      { t: 'sph', r: 0.07, pos: [0, 0.7, 0], fill: 'gold' },
      { t: 'cyl', rt: 0.025, rb: 0.03, len: 0.2, pos: [-0.12, 0.7, 0], rot: [0, 0, 0.6], fill: 'gold' },
      { t: 'cyl', rt: 0.025, rb: 0.03, len: 0.2, pos: [0.12, 0.7, 0], rot: [0, 0, -0.6], fill: 'gold' },
      { t: 'cyl', rt: 0.08, rb: 0.06, len: 0.05, pos: [0, 0.8, 0], fill: 'gold' }
    ];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      parts.push({ t: 'cone', r: 0.015, h: 0.06, pos: [Math.cos(a) * 0.05, 0.86, Math.sin(a) * 0.05], fill: 'gold' });
    }
    for (let i = 0; i < 3; i++) {
      parts.push(ring(0.2 + i * 0.1, 0.01, [0, 0.5 + i * 0.15, 0], [PI / 2, 0, 0], '#ffd700', 0.3 - i * 0.08));
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      parts.push({ t: 'oct', r: 0.02, pos: [Math.cos(a) * 0.3, 0.5 + Math.sin(a * 2) * 0.15, Math.sin(a) * 0.3], fill: 'gold' });
    }
    return parts;
  }
];

// ── Space towers ───────────────────────────────────────────────────────────
// The space family does NOT branch per tower id — it branches on the inherited
// soccer projectile type, so 8 towers resolve to only 5 silhouettes.

const emitter = (height, parts = []) => [
  { t: 'cyl', rt: 0.08, rb: 0.13, len: height, pos: [0, 0.22 + height / 2, 0], fill: 'metal' },
  { t: 'oct', r: 0.14, pos: [0, 0.32 + height, 0], fill: 'glow' },
  ...parts
];

export function spaceTowerParts(projectileType, idx) {
  if (projectileType === 'ball' || idx === 0) {
    return emitter(0.55, [
      { t: 'cyl', rt: 0.12, rb: 0.08, len: 0.18, pos: [0, 0.58, 0.24], rot: [PI / 2, 0, 0], fill: 'glow' }
    ]);
  }
  if (projectileType === 'curveBall' || projectileType === 'flare') {
    return [
      { t: 'cyl', rt: 0.22, rb: 0.28, len: 0.28, pos: [0, 0.28, 0], fill: 'body' },
      { t: 'cyl', rt: 0.09, rb: 0.13, len: 0.55, pos: [0, 0.47, 0.28], rot: [PI / 2, 0, 0], fill: 'metal' },
      ring(0.13, 0.025, [0, 0.47, 0.58], [PI / 2, 0, 0], 'glow')
    ];
  }
  if (projectileType === 'headButt') {
    const parts = emitter(0.38);
    for (let i = 0; i < 3; i++) {
      parts.push(ring(0.18 + i * 0.08, 0.018, [0, 0.5 + i * 0.08, 0], [PI / 2 + i * 0.45, 0, 0], 'glow'));
    }
    return parts;
  }
  if (projectileType === 'chain') {
    const parts = emitter(0.62);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      parts.push({
        t: 'cyl', rt: 0.018, rb: 0.018, len: 0.34,
        pos: [Math.cos(a) * 0.22, 0.52, Math.sin(a) * 0.22], rot: [0, 0, PI / 2], fill: 'metal'
      });
    }
    return parts;
  }
  // Fallback turret — shared by tackle / glove / legend.
  return emitter(0.5, [ring(0.28, 0.022, [0, 0.36, 0], [PI / 2, 0, 0], 'glow')]);
}

export function towerParts(family, idx, projectileType) {
  if (family === 'hockey') return HOCKEY[idx]();
  if (family === 'soccer') return SOCCER[idx]();
  return spaceTowerParts(projectileType, idx);
}

// The distinct-silhouette key, used to flag reskins that share art.
export function silhouetteKey(family, idx, projectileType) {
  if (family !== 'space') return `${family}:${idx}`;
  if (projectileType === 'ball' || idx === 0) return 'space:laser';
  if (projectileType === 'curveBall' || projectileType === 'flare') return 'space:plasma-cannon';
  if (projectileType === 'headButt') return 'space:gravity-ring';
  if (projectileType === 'chain') return 'space:arc-reactor';
  return 'space:generic-turret';
}

// ── Enemies ────────────────────────────────────────────────────────────────
// createEnemyMesh() composes: body (puck/ball/orb) + slot effects. Colours come
// from the theme's visual profile; `sz` is (enemy.sz || 1) * 0.34.

export const ENEMY_MATS = {
  puckBody: '#0a0a0a',
  ballBody: '#eeeeee',
  fireBody: '#ff2200',
  gold: '#ffcc00',
  armor: '#4a5c6e'
};

// Hockey overrides three enemies by NAME rather than by slot (see
// enemy-meshes.js:164-194) — transcribed here so the art matches.
export const HOCKEY_NAME_OVERRIDES = {
  'Speed Skater': '#00ddee',
  Defenseman: '#1a3388',
  Enforcer: '#bb2222'
};

export function enemyParts({ body, sz, bodyColor, accent, effects = [], fire, boss }) {
  const parts = [];

  if (body === 'puck') {
    // Cylinder rotated PI/2 about x — the flat face points at the camera.
    parts.push({ t: 'circ', r: sz, pos: [0, 0, 0], fill: bodyColor });
    parts.push(ring(sz, sz * 0.06, [0, 0, 0.01], [0, 0, 0], '#3a3a4a'));
    parts.push(ring(sz * 0.85, sz * 0.03, [0, 0, 0.14 * sz], [0, 0, 0], '#222233'));
    parts.push({ t: 'circ', r: sz * 0.5, pos: [0, 0, 0.15 * sz], fill: accent, op: 0.85 });
    parts.push({ t: 'ring', ri: sz * 0.48, ro: sz * 0.55, pos: [0, 0, 0.16 * sz], fill: accent, op: 0.5 });
  } else if (body === 'ball') {
    parts.push({ t: 'sph', r: sz, pos: [0, 0, 0], fill: bodyColor });
    parts.push(...ballPatches([0, 0, 0], sz * 1.01, 8, sz * 0.22));
  } else {
    // orb
    parts.push({ t: 'sph', r: sz, pos: [0, 0, 0], fill: bodyColor });
    for (let i = 0; i < 2; i++) {
      parts.push(ring(sz * (0.95 + i * 0.18), sz * 0.035, [0, 0, 0], [PI / 2 + i * 0.4, 0, 0], accent, 0.8));
    }
  }

  if (effects.includes('armorPlates')) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * PI * 2 + PI / 4;
      parts.push({
        t: 'box', size: [sz * 0.42, sz * 0.42, 0.05],
        pos: [Math.cos(a) * sz * 0.72, Math.sin(a) * sz * 0.72, sz * 0.2], fill: ENEMY_MATS.armor
      });
    }
  }

  if (effects.includes('spikes')) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      parts.push({
        t: 'cone', r: sz * 0.1, h: sz * 0.25,
        pos: [Math.cos(a) * sz * 1.05, Math.sin(a) * sz * 1.05, 0],
        rot: [0, 0, a - PI / 2], fill: accent
      });
    }
  }

  if (effects.includes('speedLines')) {
    for (let i = 0; i < 5; i++) {
      parts.push({
        t: 'plane', w: sz * 0.5, h: sz * 0.04,
        pos: [-sz * (1.2 + i * 0.28), sz * 0.1, 0], fill: '#00ffff', op: 0.6 - i * 0.1
      });
    }
  }

  if (effects.includes('wings')) {
    for (const side of [-1, 1]) {
      parts.push({
        t: 'cone', r: sz * 0.28, h: sz * 1.0,
        pos: [side * sz * 1.05, sz * 0.35, -sz * 0.1],
        rot: [0, 0, side * 1.15], fill: accent, op: 0.75
      });
    }
  }

  if (effects.includes('crown') || boss) {
    parts.push(ring(sz * 1.25, sz * 0.08, [0, sz * 0.2, 0.1], [PI / 2, 0, 0], ENEMY_MATS.gold));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      parts.push({
        t: 'cone', r: sz * 0.09, h: sz * 0.28,
        pos: [Math.cos(a) * sz * 0.55, sz * 1.12, Math.sin(a) * sz * 0.55], fill: ENEMY_MATS.gold
      });
    }
  }

  if (fire) {
    parts.push({ t: 'sph', r: sz * 1.15, pos: [0, 0, -0.02], fill: '#ff6600', op: 0.22 });
  }

  return parts;
}
