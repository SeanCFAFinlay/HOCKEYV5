// Surface textures for the board's walls, kerb and slab.
//
// The board materials (rendering/board.js) used to be flat colour. Each world
// now gives each material a surface - wood grain, brick, brushed metal, vinyl,
// lacquer - painted once into a small greyscale canvas. The texture multiplies
// the material's own colour (so every world keeps its palette) and doubles as
// a bump map, so grain and mortar catch the light.
//
// UVs are projected from world position (flush() in board.js), so a long wall
// and a short one show the same grain at the same size instead of one texture
// stretched over each box.

const SIZE = 256;
const cache = new Map();

// World -> material bucket -> surface kind. Buckets: body, cap, accent, base
// (walls and slab) and kbody, kcap, kaccent (the kerb, when the world gives it
// its own materials). Missing = plain.
export const THEME_SURFACES = {
  hockey:  { body: 'vinyl', cap: 'vinyl', base: 'concrete', kbody: 'plastic', kcap: 'plastic', kaccent: 'plastic' },
  soccer:  { body: 'plastic', cap: 'plastic', base: 'turf', kbody: 'plastic', kcap: 'plastic', kaccent: 'plastic' },
  space:   { body: 'panels', cap: 'metal', base: 'panels' },
  kitchen: { body: 'wood', cap: 'laminate', accent: 'tile', base: 'planks' },
  golf:    { body: 'plastic', cap: 'plastic', base: 'stone' },
  bowling: { body: 'lacquer', cap: 'plastic', accent: 'plastic', base: 'carpet' },
  bathtub: { body: 'soap', cap: 'soap', base: 'tile', kbody: 'enamel', kcap: 'enamel', kaccent: 'tile' },
  garden:  { body: 'terracotta', cap: 'hedge', accent: 'planks', base: 'soil', kbody: 'hedge', kcap: 'hedge', kaccent: 'planks' },
  sushi:   { body: 'lacquer', cap: 'lacquer', base: 'planks', kbody: 'bamboo', kcap: 'bamboo', kaccent: 'bamboo' },
  pizza:   { body: 'cardboard', cap: 'cardboard', accent: 'plastic', base: 'brick', kbody: 'tile', kcap: 'laminate', kaccent: 'tile' },
  library: { body: 'books', cap: 'wood', accent: 'wood', base: 'planks', kbody: 'wood', kcap: 'wood', kaccent: 'wood' },
  arcade:  { body: 'plastic', cap: 'metal', base: 'carpet', kbody: 'metal', kcap: 'plastic', kaccent: 'plastic' }
};

// Relief on the floor tiles, taken from the world's own painted floor. Ice
// and bathwater stay glassy; grass, wood and carpet get some tooth.
const FLOOR_BUMP = { hockey: 0, space: 0.004, bathtub: 0.003, bowling: 0.004, arcade: 0.01, default: 0.014 };

export function floorBump(theme) {
  return FLOOR_BUMP[theme] ?? FLOOR_BUMP.default;
}

// How strongly each kind bumps (world units-ish; three.js bumpScale).
const BUMP = {
  wood: 0.012, planks: 0.02, brick: 0.035, stone: 0.03, concrete: 0.015, metal: 0.004,
  panels: 0.02, plastic: 0.003, vinyl: 0.012, laminate: 0.004, tile: 0.02, lacquer: 0.003,
  soap: 0.004, enamel: 0.003, terracotta: 0.012, hedge: 0.04, bamboo: 0.015, cardboard: 0.012,
  books: 0.025, carpet: 0.01, turf: 0.02, soil: 0.03
};

// Texture repeats per world unit.
const SCALE = { brick: 1, tile: 1.5, panels: 0.8, books: 1.4, planks: 0.7, bamboo: 1.2 };

/** Seeded random, so every texture paints the same each time. */
function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const grey = v => {
  const c = Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${c},${c},${c})`;
};

function speckle(g, r, n, lo, hi, size = 1.5) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = grey(lo + r() * (hi - lo));
    const s = size * (0.5 + r());
    g.fillRect(r() * SIZE, r() * SIZE, s, s);
  }
}

function streaks(g, r, n, lo, hi, horizontal = true, len = SIZE) {
  for (let i = 0; i < n; i++) {
    g.strokeStyle = grey(lo + r() * (hi - lo));
    g.globalAlpha = 0.25 + r() * 0.4;
    g.lineWidth = 0.6 + r() * 1.4;
    const a = r() * SIZE, b = r() * SIZE, l = len * (0.3 + r() * 0.7);
    g.beginPath();
    if (horizontal) { g.moveTo(b, a); g.lineTo(b + l, a + (r() - 0.5) * 2); }
    else { g.moveTo(a, b); g.lineTo(a + (r() - 0.5) * 2, b + l); }
    g.stroke();
  }
  g.globalAlpha = 1;
}

function blotches(g, r, n, lo, hi, rmin, rmax) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = grey(lo + r() * (hi - lo));
    g.globalAlpha = 0.18 + r() * 0.3;
    g.beginPath();
    g.ellipse(r() * SIZE, r() * SIZE, rmin + r() * (rmax - rmin), rmin + r() * (rmax - rmin), r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
}

/** Wood grain running along U, wavy, with the odd knot. */
function woodGrain(g, r, base) {
  g.fillStyle = grey(base); g.fillRect(0, 0, SIZE, SIZE);
  for (let y = 0; y < SIZE; y += 2) {
    const v = base - 22 + Math.sin(y * 0.11 + Math.sin(y * 0.031) * 3) * 16 + r() * 8;
    g.fillStyle = grey(v);
    g.globalAlpha = 0.55;
    g.fillRect(0, y, SIZE, 1 + (r() < 0.2 ? 1 : 0));
  }
  g.globalAlpha = 1;
  streaks(g, r, 60, base - 50, base - 20, true);
  for (let k = 0; k < 2; k++) {
    const x = r() * SIZE, y = r() * SIZE;
    for (let i = 6; i > 0; i--) {
      g.strokeStyle = grey(base - 60 + i * 6); g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(x, y, i * 3.2, i * 1.4, 0, 0, Math.PI * 2); g.stroke();
    }
  }
}

const PAINTERS = {
  wood(g, r) { woodGrain(g, r, 225); },
  planks(g, r) {
    woodGrain(g, r, 220);
    // Board seams every quarter, butt joints staggered.
    g.fillStyle = grey(120);
    for (let y = 0; y < SIZE; y += SIZE / 4) {
      g.fillRect(0, y, SIZE, 3);
      const off = (y / (SIZE / 4)) % 2 ? SIZE * 0.3 : SIZE * 0.75;
      g.fillRect(off, y, 3, SIZE / 4);
    }
  },
  brick(g, r) {
    g.fillStyle = grey(150); g.fillRect(0, 0, SIZE, SIZE);   // mortar
    const bh = SIZE / 8, bw = SIZE / 4;
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let col = -1; col < 5; col++) {
        g.fillStyle = grey(200 + r() * 45);
        g.fillRect(col * bw + off + 3, row * bh + 3, bw - 6, bh - 6);
      }
    }
    speckle(g, r, 1500, 150, 255, 2);
  },
  stone(g, r) {
    g.fillStyle = grey(215); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 80, 150, 255, 8, 30);
    speckle(g, r, 2500, 140, 255, 2);
  },
  concrete(g, r) {
    g.fillStyle = grey(225); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 40, 180, 250, 10, 40);
    speckle(g, r, 3000, 170, 255, 1.5);
    for (let i = 0; i < 40; i++) { g.fillStyle = grey(150); g.fillRect(r() * SIZE, r() * SIZE, 2, 2); }
  },
  metal(g, r) {
    g.fillStyle = grey(225); g.fillRect(0, 0, SIZE, SIZE);
    streaks(g, r, 400, 180, 255, true);
    streaks(g, r, 12, 150, 190, false, 40);
  },
  panels(g, r) {
    PAINTERS.metal(g, r);
    // Panel seams and rivets.
    g.fillStyle = grey(120);
    g.fillRect(0, 0, SIZE, 3); g.fillRect(0, SIZE / 2, SIZE, 3); g.fillRect(0, 0, 3, SIZE); g.fillRect(SIZE / 2, SIZE / 2, 3, SIZE / 2);
    g.fillStyle = grey(160);
    for (const [x, y] of [[12, 12], [SIZE - 12, 12], [12, SIZE / 2 - 10], [SIZE - 12, SIZE / 2 - 10], [12, SIZE / 2 + 12], [SIZE - 12, SIZE - 12]]) {
      g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill();
    }
  },
  plastic(g, r) {
    g.fillStyle = grey(240); g.fillRect(0, 0, SIZE, SIZE);
    speckle(g, r, 1200, 215, 255, 1.2);
    streaks(g, r, 10, 200, 230, true, 60);
  },
  vinyl(g, r) {
    // Stitched padding: a fine pebble grain and a seam every half.
    g.fillStyle = grey(230); g.fillRect(0, 0, SIZE, SIZE);
    speckle(g, r, 6000, 195, 255, 1.6);
    g.strokeStyle = grey(150); g.lineWidth = 2; g.setLineDash([6, 5]);
    for (const y of [SIZE * 0.25, SIZE * 0.75]) { g.beginPath(); g.moveTo(0, y); g.lineTo(SIZE, y); g.stroke(); }
    g.setLineDash([]);
  },
  laminate(g, r) {
    g.fillStyle = grey(232); g.fillRect(0, 0, SIZE, SIZE);
    speckle(g, r, 4000, 180, 255, 1.8);
  },
  tile(g, r) {
    g.fillStyle = grey(160); g.fillRect(0, 0, SIZE, SIZE);  // grout
    const n = 4, s = SIZE / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      g.fillStyle = grey(232 + r() * 20);
      g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x * s + 6, y * s + 6, s - 18, 4);
    }
  },
  lacquer(g, r) {
    g.fillStyle = grey(238); g.fillRect(0, 0, SIZE, SIZE);
    streaks(g, r, 40, 215, 250, true);
    speckle(g, r, 300, 225, 255, 1);
  },
  soap(g, r) {
    g.fillStyle = grey(240); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 30, 220, 255, 10, 40);
    // Tiny bubbles.
    for (let i = 0; i < 60; i++) {
      g.strokeStyle = grey(205); g.lineWidth = 1;
      g.beginPath(); g.arc(r() * SIZE, r() * SIZE, 1 + r() * 3, 0, Math.PI * 2); g.stroke();
    }
  },
  enamel(g, r) {
    g.fillStyle = grey(244); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 15, 228, 255, 20, 60);
  },
  terracotta(g, r) {
    g.fillStyle = grey(222); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 60, 175, 245, 6, 24);
    speckle(g, r, 3500, 150, 255, 1.6);
    // Ribs round the pot.
    g.fillStyle = grey(175);
    for (let y = 18; y < SIZE; y += 64) g.fillRect(0, y, SIZE, 4);
  },
  hedge(g, r) {
    g.fillStyle = grey(170); g.fillRect(0, 0, SIZE, SIZE);
    for (let i = 0; i < 2200; i++) {
      g.fillStyle = grey(120 + r() * 135);
      g.beginPath();
      g.ellipse(r() * SIZE, r() * SIZE, 2 + r() * 4, 1.2 + r() * 2, r() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
  },
  bamboo(g, r) {
    g.fillStyle = grey(225); g.fillRect(0, 0, SIZE, SIZE);
    streaks(g, r, 80, 190, 240, true);
    // Nodes across the cane.
    for (let x = 30; x < SIZE; x += 90 + r() * 20) {
      g.fillStyle = grey(150); g.fillRect(x, 0, 4, SIZE);
      g.fillStyle = grey(250); g.fillRect(x + 4, 0, 3, SIZE);
    }
  },
  cardboard(g, r) {
    g.fillStyle = grey(222); g.fillRect(0, 0, SIZE, SIZE);
    // Flutes showing through, a printed band and a tape strip.
    for (let x = 0; x < SIZE; x += 6) { g.fillStyle = grey(206 + (x % 12 ? 10 : 0)); g.fillRect(x, 0, 3, SIZE); }
    speckle(g, r, 1500, 170, 245, 1.5);
    g.fillStyle = grey(245); g.globalAlpha = 0.6; g.fillRect(0, SIZE * 0.45, SIZE, SIZE * 0.1); g.globalAlpha = 1;
  },
  books(g, r) {
    // Rows of spines: varied widths and shades, gilt bands, a shelf line.
    const rows = 2, rh = SIZE / rows;
    for (let row = 0; row < rows; row++) {
      let x = 0;
      while (x < SIZE) {
        const w = 10 + r() * 22;
        const shade = 140 + r() * 115;
        const top = row * rh + 6 + r() * 14;
        g.fillStyle = grey(shade); g.fillRect(x, top, w - 1.5, (row + 1) * rh - top - 4);
        g.fillStyle = grey(Math.min(255, shade + 50));
        g.fillRect(x + 1, top + 10, w - 4, 3);
        g.fillRect(x + 1, (row + 1) * rh - 18, w - 4, 3);
        x += w;
      }
      g.fillStyle = grey(110); g.fillRect(0, (row + 1) * rh - 4, SIZE, 4);
    }
  },
  carpet(g, r) {
    g.fillStyle = grey(200); g.fillRect(0, 0, SIZE, SIZE);
    speckle(g, r, 9000, 150, 255, 1.4);
    // Confetti shapes, as greyscale; the material colour tints them.
    for (let i = 0; i < 90; i++) {
      g.fillStyle = grey(250); g.globalAlpha = 0.55;
      const x = r() * SIZE, y = r() * SIZE, s = 4 + r() * 8;
      if (r() < 0.5) g.fillRect(x, y, s, s * 0.4);
      else { g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + s * 0.5); g.lineTo(x, y + s); g.fill(); }
    }
    g.globalAlpha = 1;
  },
  turf(g, r) {
    g.fillStyle = grey(200); g.fillRect(0, 0, SIZE, SIZE);
    streaks(g, r, 1500, 150, 255, false, 10);
  },
  soil(g, r) {
    g.fillStyle = grey(200); g.fillRect(0, 0, SIZE, SIZE);
    blotches(g, r, 120, 130, 240, 3, 14);
    speckle(g, r, 4000, 120, 255, 2);
  }
};

/** The canvas texture for a surface kind (shared, made once). */
export function surfaceTexture(kind) {
  if (!PAINTERS[kind] || typeof document === 'undefined' || typeof THREE === 'undefined') return null;
  if (cache.has(kind)) return cache.get(kind);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const g = canvas.getContext('2d');
  if (!g) return null;
  const r = rand([...kind].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  PAINTERS[kind](g, r);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.encoding = THREE.sRGBEncoding;
  cache.set(kind, tex);
  return tex;
}

/** Surface kind for a world's bucket, or null. */
export function surfaceKind(theme, bucket) {
  return THEME_SURFACES[theme]?.[bucket] || null;
}

/**
 * Put a surface on a board material. The texture multiplies the colour, so
 * the colour is lifted a touch to keep the overall brightness.
 */
export function applySurface(mat, kind) {
  const tex = surfaceTexture(kind);
  if (!tex || !mat) return false;
  mat.map = tex;
  mat.bumpMap = tex;
  mat.bumpScale = BUMP[kind] ?? 0.01;
  mat.color.multiplyScalar(1.08);
  mat.userData.surfaceScale = SCALE[kind] || 1;
  mat.needsUpdate = true;
  return true;
}

/**
 * Box-project UVs from world position: each face takes the two axes it lies
 * across, so texel size is the same on every wall whatever its length.
 */
export function projectUvs(geometry, scale = 1) {
  const pos = geometry.getAttribute('position');
  const nor = geometry.getAttribute('normal');
  if (!pos || !nor) return;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = x; v = z; }        // tops
    else if (ax >= az) { u = z; v = y; }                // faces along z
    else { u = x; v = y; }                              // faces along x
    uv[i * 2] = u * scale;
    uv[i * 2 + 1] = v * scale;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
