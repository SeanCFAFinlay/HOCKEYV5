// The playing board as a physical object.
//
// The playfield used to be one flat textured plane with props dotted on it.
// This builds it as a thing with height:
//
//   - a thick slab standing in a moat, with a painted fascia, a lip and a foot
//   - a raised, bevelled tile per grid cell (one InstancedMesh) with dark
//     grooves between, textured with the theme's own floor so ice stays ice
//   - a kerb round the edge with corner posts, open where the spawn tunnels
//     and the base stand
//   - obstacle cells as continuous walls: runs of adjacent cells merge into one
//     barrier with posts at the ends and corners; a lone cell gets a plinth
//     with one prop on it
//   - soft contact shadows where all of that meets the floor
//
// Heights are fixed by gameplay: the walking surface (tile tops) is y = 0, so
// towers, enemies, range rings and previews sit exactly where they always did.
// The relief is cut downwards (grooves, moat), never built up under the units.
//
// Everything is merged per material: the whole board costs about ten draw
// calls however many obstacle cells there are. Nothing here runs per frame.

import { getState } from '../engine/state.js';
import { composeGeometry, bakeStaticMeshes, shareEquivalentMaterials } from './geo-utils.js';
import { hash2 } from '../utils/rng.js';
import { G } from './model-kit.js';

/** Shared measurements, in grid cells. */
export const BOARD = {
  GROOVE: 0.07,   // depth of the gap between tiles
  TILE: 0.95,     // tile footprint within its cell
  EDGE: 1.0,      // slab reaches this far beyond the grid
  MOAT: 1.5,      // width of the trench between slab and stands
  DEPTH: 1.0,     // slab thickness (moat depth)
  KERB_AT: 0.62,  // kerb centre line, beyond the grid edge
  KERB_T: 0.4     // kerb thickness
};

/**
 * Per-theme look of the walls, kerb and slab. Four materials each:
 *   body   the wall mass          cap     its top (the surface seen from above)
 *   accent a stripe / glow        base    dark footing, moat and plinths
 * `cap` must contrast with the theme's floor: from the game camera it is most
 * of what you see of a wall. Colours are darker than they will look: the
 * arenas are brightly lit and pale colours wash out to white.
 */
const STYLES = {
  hockey: {
    // Obstacles are rink-side kit, not more boards: navy crash pads with an
    // orange stripe and a pylon on each end.
    wall: { h: 0.5, t: 0.6, r: 0.07, stripe: [0.22, 0.3] },
    // One sheet of ice: the tile relief is barely there.
    tile: { groove: 0.86, checker: 0, size: 0.98 },
    // The boards: white, yellow kick plate, blue cap rail, cut corners, ads.
    kerb: {
      h: 0.62, chamfer: 1.15, stripe: [0, 0.13], ads: 'rink', adY: [0.17, 0.52],
      body: { color: 0xe6edf3, rough: 0.45 },
      cap: { color: 0x083f80, rough: 0.4, metal: 0.3 },
      accent: { color: 0xffcc00, rough: 0.4, metal: 0.2 }
    },
    baseGap: 1.12,
    post: { shape: 'box', top: 'cone', topBucket: 'accent' },
    body: { color: 0x24476e, rough: 0.7 },
    cap: { color: 0x132a45, rough: 0.6 },
    accent: { color: 0xe8552e, rough: 0.5 },
    base: { color: 0x17304d, rough: 0.8 },
    side: 'fascia'
  },
  soccer: {
    // Obstacles are a free-kick wall: training mannequins on a weighted beam.
    wall: { h: 0.14, t: 0.5, r: 0.03, stripe: [0.05, 0.09], kind: 'mannequins' },
    // A pitch has no wall round it: low advertising hoardings set back from
    // the touchline, and a flag at each corner.
    kerb: {
      h: 0.34, t: 0.12, at: 0.86, stripe: [0, 0.04], ads: 'pitch', adY: [0.05, 0.32], corner: 'flag',
      body: { color: 0xf1f3ee, rough: 0.6 },
      cap: { color: 0x1e293b, rough: 0.6 },
      accent: { color: 0xdc2626, rough: 0.5 }
    },
    baseGap: 1.3,
    post: { shape: 'none' },
    body: { color: 0x1f2937, rough: 0.7 },
    cap: { color: 0xf5b301, rough: 0.5 },
    accent: { color: 0xf97316, rough: 0.5 },
    base: { color: 0x10301a, rough: 0.9 },
    side: 'soil'
  },
  space: {
    wall: { h: 0.58, t: 0.62, r: 0.04, stripe: [0.3, 0.37] },
    kerbH: 0.36, baseGap: 0.95,
    post: { shape: 'cyl', top: 'octa', topBucket: 'accent' },
    body: { color: 0x2a3152, rough: 0.4, metal: 0.7 },
    cap: { color: 0x5b21b6, rough: 0.3, metal: 0.3, glow: 0.22 },
    accent: { color: 0x67e8f9, rough: 0.3, glow: 0.9 },
    base: { color: 0x0e1222, rough: 0.6, metal: 0.5 },
    side: 'hull'
  },
  kitchen: {
    wall: { h: 0.5, t: 0.62, r: 0.06, stripe: [0.2, 0.28] },
    kerbH: 0.36, baseGap: 0.95,
    post: { shape: 'cyl', top: 'sphere', topBucket: 'accent' },
    body: { color: 0x5a3216, rough: 0.7 },
    cap: { color: 0x8a1408, rough: 0.4, metal: 0.1 },
    accent: { color: 0xf3ead8, rough: 0.5 },
    base: { color: 0x4a2f1c, rough: 0.85 },
    side: 'cabinet'
  },
  golf: {
    wall: { h: 0.42, t: 0.6, r: 0.05, stripe: [0.17, 0.25] },
    kerbH: 0.34, baseGap: 1.15,
    // The fringe: a darker collar of longer grass round the green.
    tile: { apron: 0.62 },
    post: { shape: 'box', top: 'sphere', topBucket: 'cap' },
    body: { color: 0xff4fb8, rough: 0.45, glow: 0.12 },
    cap: { color: 0xf4f6f8, rough: 0.4 },
    accent: { color: 0x39ff88, rough: 0.4, glow: 0.8 },
    base: { color: 0x1a1f4a, rough: 0.8 },
    side: 'soil'
  },
  bowling: {
    wall: { h: 0.44, t: 0.6, r: 0.07, stripe: [0.24, 0.32] },
    kerbH: 0.34, baseGap: 1.3,
    post: { shape: 'box', top: 'pin', topBucket: 'body' },
    body: { color: 0xf4f1ea, rough: 0.25 },
    cap: { color: 0x0c9c8a, rough: 0.3, metal: 0.2, glow: 0.3 },
    accent: { color: 0xd9263a, rough: 0.35 },
    base: { color: 0x1c1233, rough: 0.6, metal: 0.2 },
    side: 'lane'
  }
};

export function getBoardStyle(theme) {
  return STYLES[theme] || STYLES.space;
}

function makeMat(def) {
  return new THREE.MeshStandardMaterial({
    color: def.color,
    roughness: def.rough ?? 0.6,
    metalness: def.metal ?? 0.05,
    emissive: def.glow ? def.color : 0x000000,
    emissiveIntensity: def.glow || 0
  });
}

/**
 * The board materials for a theme, made once per scene build. The kerb shares
 * the walls' materials unless the theme gives it its own (`style.kerb.body`…).
 */
export function makeBoardMaterials(theme) {
  const s = getBoardStyle(theme);
  const mats = { body: makeMat(s.body), cap: makeMat(s.cap), accent: makeMat(s.accent), base: makeMat(s.base) };
  if (s.kerb?.body) {
    mats.kbody = makeMat(s.kerb.body);
    mats.kcap = makeMat(s.kerb.cap);
    mats.kaccent = makeMat(s.kerb.accent);
  }
  return mats;
}

// ── Geometry collection ─────────────────────────────────────────────────────

function makeCollector() {
  const parts = { body: [], cap: [], accent: [], base: [], kbody: [], kcap: [], kaccent: [] };
  return {
    parts,
    /** Axis-aligned box given by its extents. `r` rounds the edges. */
    box(bucket, x0, x1, y0, y1, z0, z1, r = 0) {
      const w = x1 - x0, h = y1 - y0, d = z1 - z0;
      if (w <= 1e-4 || h <= 1e-4 || d <= 1e-4) return;
      const geo = r > 0.005 ? G.rbox(w, h, d, r) : new THREE.BoxGeometry(w, h, d);
      parts[bucket].push({ geo, p: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
    },
    add(bucket, geo, p = [0, 0, 0], r = [0, 0, 0], s = 1) {
      parts[bucket].push({ geo, p, r, s });
    }
  };
}

function flush(collector, mats, scene) {
  for (const key of Object.keys(collector.parts)) {
    const list = collector.parts[key];
    if (!list.length) continue;
    const mesh = new THREE.Mesh(composeGeometry(list), mats[key]);
    const glows = mats[key].emissiveIntensity > 0.4;
    mesh.castShadow = key !== 'base' && !glows;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}

const PIN_PROFILE = [[0.085, 0], [0.125, 0.1], [0.135, 0.18], [0.07, 0.33], [0.085, 0.42], [0.06, 0.5], [0, 0.5]];

/** A post: where a wall ends or turns, and at the kerb corners. */
function addPost(c, style, x, z, half, height) {
  const post = style.post;
  if (post.shape === 'cyl') {
    c.add('body', new THREE.CylinderGeometry(half, half * 1.08, height, 14), [x, height / 2, z]);
  } else {
    c.box('body', x - half, x + half, 0, height, z - half, z + half, 0.03);
  }
  c.box('cap', x - half - 0.03, x + half + 0.03, height, height + 0.05, z - half - 0.03, z + half + 0.03, 0.02);
  const top = post.topBucket || 'cap';
  const y = height + 0.05;
  if (post.top === 'sphere') c.add(top, new THREE.SphereGeometry(0.19, 14, 10), [x, y + 0.15, z]);
  else if (post.top === 'octa') c.add(top, new THREE.OctahedronGeometry(0.17, 0), [x, y + 0.2, z]);
  else if (post.top === 'pin') c.add(top, G.lathe(PIN_PROFILE, 12), [x, y, z]);
  else if (post.top === 'cone') c.add(top, new THREE.ConeGeometry(0.15, 0.36, 12), [x, y + 0.18, z]);
}

// ── Advertising on the kerb ─────────────────────────────────────────────────

/** A strip of made-up sponsors, eight panels long, that tiles sideways. */
function paintAds(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const rink = kind === 'rink';
  const inks = ['#d7193f', '#0b4f9c', '#0f766e', '#f59e0b', '#7c3aed', '#111827', '#0b4f9c', '#d7193f'];
  const words = ['PH', 'ICEHAUS', 'GO!', 'NORTH', 'TD', 'ZAMBO', 'RINK 5', 'PUCK'];
  const pitchWords = ['PH', 'KICKOFF', 'GOAL!', 'UNITED', 'TD', 'BOOT CO', 'PITCH 5', 'FC'];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 8; i++) {
    const x = i * 64;
    // Rink boards are white with coloured marks; pitch hoardings are solid colour.
    ctx.fillStyle = rink ? '#eef2f6' : inks[i];
    ctx.fillRect(x, 0, 64, 64);
    ctx.fillStyle = rink ? inks[i] : '#ffffff';
    if (i % 3 === 2) ctx.fillRect(x + 6, 46, 52, 6);
    ctx.font = `900 ${i % 2 ? 17 : 24}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText((rink ? words : pitchWords)[i], x + 32, 30, 56);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, 0, 1, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  return texture;
}

/**
 * @param {Array<{a:number[], b:number[], n:number[]}>} faces - inner kerb faces
 *   as [x, z] end points with the direction they look
 */
function buildAds(scene, faces, kind, y0, y1) {
  if (!faces.length) return;
  const out = { position: [], normal: [], uv: [] };
  for (const { a, b, n } of faces) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.3) continue;
    const o = 0.012;
    const A = [a[0] + n[0] * o, a[1] + n[1] * o], B = [b[0] + n[0] * o, b[1] + n[1] * o];
    pushQuad(out, [A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]], [n[0], 0, n[1]]);
    // Read left to right from the pitch side, whichever way the quad was wound.
    const flip = (b[0] - a[0]) * n[1] - (b[1] - a[1]) * n[0] > 0;
    const reps = len / 8;
    const start = out.position.length - 18;
    for (let v = 0; v < 6; v++) {
      const px = out.position[start + v * 3], py = out.position[start + v * 3 + 1], pz = out.position[start + v * 3 + 2];
      const atA = Math.abs(px - A[0]) < 1e-6 && Math.abs(pz - A[1]) < 1e-6;
      out.uv.push((atA !== flip) ? 0 : reps, py > (y0 + y1) / 2 ? 1 : 0);
    }
  }
  const mesh = new THREE.Mesh(toGeometry(out), new THREE.MeshStandardMaterial({ map: paintAds(kind), roughness: 0.6, metalness: 0.05 }));
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// ── Walking surface: tiles, grooves, apron ──────────────────────────────────

/** Push a quad, wound so it faces `hint`. */
function pushQuad(out, a, b, c, d, hint) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  nx /= len; ny /= len; nz /= len;
  let order = [a, b, c, a, c, d];
  if (nx * hint[0] + ny * hint[1] + nz * hint[2] < 0) {
    order = [a, c, b, a, d, c];
    nx = -nx; ny = -ny; nz = -nz;
  }
  for (const v of order) {
    out.position.push(v[0], v[1], v[2]);
    out.normal.push(nx, ny, nz);
  }
}

function toGeometry(out) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(out.position), 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(out.normal), 3));
  const uv = out.uv ? new Float32Array(out.uv) : new Float32Array(out.position.length / 3 * 2);
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** One tile, 1 x 1 in plan, top face at y = 0, bevelled edge, skirt to -depth. */
function makeTileGeometry(depth) {
  const out = { position: [], normal: [] };
  const o = 0.5, bevel = 0.05, i = o - bevel, drop = -0.045;
  pushQuad(out, [-i, 0, -i], [i, 0, -i], [i, 0, i], [-i, 0, i], [0, 1, 0]);
  const sides = [
    [[-i, -i], [i, -i], [o, -o], [-o, -o], [0, -1]],
    [[i, i], [-i, i], [-o, o], [o, o], [0, 1]],
    [[i, -i], [i, i], [o, o], [o, -o], [1, 0]],
    [[-i, i], [-i, -i], [-o, -o], [-o, o], [-1, 0]]
  ];
  for (const [a, b, c, d, n] of sides) {
    pushQuad(out, [a[0], 0, a[1]], [b[0], 0, b[1]], [c[0], drop, c[1]], [d[0], drop, d[1]], [n[0], 1, n[1]]);
    pushQuad(out, [d[0], drop, d[1]], [c[0], drop, c[1]], [c[0], -depth, c[1]], [d[0], -depth, d[1]], [n[0], 0, n[1]]);
  }
  return toGeometry(out);
}

/**
 * Take a floor material's texture coordinates from world position instead of
 * the mesh, so hundreds of separate tiles show one continuous floor texture.
 */
function useWorldUv(material, width, depth) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uBoardSize = { value: new THREE.Vector2(width, depth) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform vec2 uBoardSize;')
      .replace(
        '#include <uv_vertex>',
        `#ifdef USE_UV
          vec4 boardPos = vec4( position, 1.0 );
          #ifdef USE_INSTANCING
            boardPos = instanceMatrix * boardPos;
          #endif
          boardPos = modelMatrix * boardPos;
          vUv = ( uvTransform * vec3( boardPos.x / uBoardSize.x + 0.5, 0.5 - boardPos.z / uBoardSize.y, 1.0 ) ).xy;
        #endif`
      );
  };
  // Distinct from every unpatched material's program.
  material.customProgramCacheKey = () => 'board-world-uv';
}

/**
 * Tiles, grooves and the apron between the grid and the kerb.
 * Reads the floor plane the theme's arena builder registered as
 * `state.boardFloor` (already lowered to the bottom of the grooves) and reuses
 * its material, so the tiles carry the theme's own floor.
 */
export function buildBoardSurface(hw, hh) {
  const state = getState();
  const { COLS, ROWS, scene, mapIndex } = state;
  const floor = state.boardFloor;
  const width = floor?.geometry?.parameters?.width || COLS + 2;
  const depth = floor?.geometry?.parameters?.height || ROWS + 2;
  const tile = getBoardStyle(state.theme).tile || {};
  const tileSize = tile.size ?? BOARD.TILE;
  const checker = tile.checker ?? 0.045;

  let tileMat;
  if (floor?.material) {
    tileMat = floor.material.clone();
    // What is left of the original plane is the bottom of the grooves.
    floor.material.color.multiplyScalar(tile.groove ?? 0.4);
    if (floor.material.emissiveIntensity) floor.material.emissiveIntensity *= 0.3;
    floor.material.envMapIntensity = 0;
    floor.material.roughness = 0.95;
  } else {
    tileMat = new THREE.MeshStandardMaterial({ color: 0x7a8794, roughness: 0.7 });
  }
  useWorldUv(tileMat, width, depth);

  const tiles = new THREE.InstancedMesh(makeTileGeometry(BOARD.GROOVE), tileMat, COLS * ROWS);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  const seed = (mapIndex + 1) * 7919;
  let i = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      dummy.position.set(x - hw + 0.5, 0, y - hh + 0.5);
      dummy.scale.set(tileSize, 1, tileSize);
      dummy.updateMatrix();
      tiles.setMatrixAt(i, dummy.matrix);
      // A faint checker plus a little noise: enough to count cells by eye.
      const shade = ((x + y) % 2 ? 1 - checker : 1) - hash2(x, y, seed) * checker * 0.8;
      tiles.setColorAt(i, tint.setScalar(shade));
      i++;
    }
  }
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  tiles.receiveShadow = true;
  tiles.frustumCulled = false;
  scene.add(tiles);

  // Apron: the strip of floor between the grid and the slab edge.
  const out = { position: [], normal: [] };
  const ix = hw + (1 - tileSize) / 2, iz = hh + (1 - tileSize) / 2;
  const ex = hw + BOARD.EDGE, ez = hh + BOARD.EDGE;
  const up = [0, 1, 0];
  const g = -BOARD.GROOVE;
  for (const s of [-1, 1]) {
    pushQuad(out, [-ex, 0, s * iz], [ex, 0, s * iz], [ex, 0, s * ez], [-ex, 0, s * ez], up);
    pushQuad(out, [s * ix, 0, -iz], [s * ex, 0, -iz], [s * ex, 0, iz], [s * ix, 0, iz], up);
    pushQuad(out, [-ix, 0, s * iz], [ix, 0, s * iz], [ix, g, s * iz], [-ix, g, s * iz], [0, 0, -s]);
    pushQuad(out, [s * ix, 0, -iz], [s * ix, 0, iz], [s * ix, g, iz], [s * ix, g, -iz], [-s, 0, 0]);
  }
  // A theme can shade the apron differently from the playing surface (the
  // fringe round a putting green, the approach beside a lane).
  let apronMat = tileMat;
  if (tile.apron) {
    apronMat = tileMat.clone();
    apronMat.color.multiplyScalar(tile.apron);
    useWorldUv(apronMat, width, depth);
  }
  const apron = new THREE.Mesh(toGeometry(out), apronMat);
  apron.receiveShadow = true;
  scene.add(apron);
}

// ── Slab fascia ─────────────────────────────────────────────────────────────

/** Paint a 512 x 128 strip (4 cells wide, the slab's depth high) that tiles sideways. */
function paintFascia(kind, visuals) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const W = 512, H = 128;
  const accent = '#' + new THREE.Color(visuals.lighting.accent).getHexString();

  if (kind === 'fascia') {
    // Rink boards: white panels, a kick plate, sponsor-style colour blocks.
    ctx.fillStyle = '#dfe7ee'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0b5cad'; ctx.fillRect(0, 30, W, 12);
    ctx.fillStyle = '#d7193f'; ctx.fillRect(0, 46, W, 6);
    ctx.fillStyle = '#f2c230'; ctx.fillRect(0, H - 26, W, 26);
    ctx.fillStyle = 'rgba(20,40,70,0.35)';
    for (let x = 0; x < W; x += 128) ctx.fillRect(x, 0, 3, H);
    ctx.fillStyle = '#8b98a8';
    for (let x = 16; x < W; x += 32) { ctx.fillRect(x, 8, 4, 4); ctx.fillRect(x, H - 14, 4, 4); }
  } else if (kind === 'soil') {
    // A cut through the ground: turf, topsoil, darker subsoil with stones.
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#6b4a2b'); g.addColorStop(0.5, '#4f3520'); g.addColorStop(1, '#2e2016');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      const y = 22 + ((i * 53) % 100), x = (i * 97) % W, r = 2 + (i % 5);
      ctx.fillStyle = i % 3 ? 'rgba(170,150,125,0.55)' : 'rgba(30,20,12,0.5)';
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(20,12,6,0.35)';
    ctx.fillRect(0, 58, W, 3); ctx.fillRect(0, 96, W, 2);
    ctx.fillStyle = visuals.map.floor.base; ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let x = 0; x < W; x += 8) ctx.fillRect(x, 10 + ((x * 7) % 9), 4, 8);
  } else if (kind === 'cabinet') {
    // Under the worktop: cupboard doors and a drawer, with knobs.
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) {
      const x = i * 128;
      ctx.fillStyle = i % 2 ? '#d9c9a8' : '#cdbb97';
      ctx.fillRect(x + 6, 8, 116, 30);
      ctx.fillRect(x + 6, 44, 116, 78);
      ctx.strokeStyle = 'rgba(90,58,34,0.6)'; ctx.lineWidth = 3;
      ctx.strokeRect(x + 16, 54, 96, 58);
      ctx.fillStyle = '#c2452d';
      ctx.beginPath(); ctx.arc(x + 64, 23, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + (i % 2 ? 26 : 102), 82, 5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'lane') {
    // The side of a bowling lane: boards on edge, a neon strip, the gutter lip.
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#a8733d' : '#bd8548';
      ctx.fillRect(0, i * 16, W, 16);
    }
    ctx.fillStyle = 'rgba(40,20,10,0.4)';
    for (let x = 0; x < W; x += 64) ctx.fillRect(x + ((x / 64) % 2) * 20, 0, 2, H);
    ctx.fillStyle = '#1c1233'; ctx.fillRect(0, 44, W, 26);
    ctx.fillStyle = accent; ctx.fillRect(0, 52, W, 9);
    ctx.fillStyle = '#2dd4bf';
    for (let x = 20; x < W; x += 64) ctx.fillRect(x, 96, 24, 6);
  } else {
    // Hull plating with a light strip and vents.
    ctx.fillStyle = '#1b2036'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,140,200,0.35)'; ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 64) ctx.strokeRect(x + 2, 2, 60, H - 4);
    ctx.fillStyle = accent; ctx.fillRect(0, 26, W, 8);
    ctx.fillStyle = '#67e8f9';
    for (let x = 12; x < W; x += 64) ctx.fillRect(x, 60, 14, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let x = 34; x < W; x += 64) for (let y = 78; y < 112; y += 8) ctx.fillRect(x, y, 22, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function buildFascia(scene, hw, hh, kind, visuals) {
  const ex = hw + BOARD.EDGE, ez = hh + BOARD.EDGE;
  const top = -0.16, bottom = -BOARD.DEPTH;
  const out = { position: [], normal: [], uv: [] };
  let run = 0;
  const side = (a, b, n) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    pushQuad(out, [a[0], top, a[1]], [b[0], top, b[1]], [b[0], bottom, b[1]], [a[0], bottom, a[1]], n);
    // pushQuad may flip the winding; both orders start at `a`, so tag by x/z.
    const u0 = run / 4, u1 = (run + len) / 4;
    const start = out.position.length - 18;
    for (let v = 0; v < 6; v++) {
      const px = out.position[start + v * 3], py = out.position[start + v * 3 + 1], pz = out.position[start + v * 3 + 2];
      const atA = Math.abs(px - a[0]) < 1e-6 && Math.abs(pz - a[1]) < 1e-6;
      out.uv.push(atA ? u0 : u1, py > (top + bottom) / 2 ? 1 : 0);
    }
    run += len;
  };
  side([-ex, ez], [ex, ez], [0, 0, 1]);
  side([ex, ez], [ex, -ez], [1, 0, 0]);
  side([ex, -ez], [-ex, -ez], [0, 0, -1]);
  side([-ex, -ez], [-ex, ez], [-1, 0, 0]);

  const texture = paintFascia(kind, visuals);
  const mesh = new THREE.Mesh(toGeometry(out), new THREE.MeshStandardMaterial({
    map: texture, roughness: 0.75, metalness: 0.05,
    // The moat is in shadow; let the fascia carry a little of its own light.
    emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: 0.22
  }));
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// ── Contact shadows ─────────────────────────────────────────────────────────

let _blobTexture = null;
function getBlobTexture() {
  if (_blobTexture) return _blobTexture;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  // A dark square with a soft edge: the core is hidden under the object, the
  // edge is the shadow you see creeping out from under it.
  const core = size * (1 / 1.5), steps = 12;
  for (let i = 0; i < steps; i++) {
    const grow = (1 - i / (steps - 1)) * (size - core) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    const o = (size - core) / 2 - grow;
    ctx.beginPath();
    const r = grow + 2;
    ctx.moveTo(o + r, o);
    ctx.arcTo(size - o, o, size - o, size - o, r);
    ctx.arcTo(size - o, size - o, o, size - o, r);
    ctx.arcTo(o, size - o, o, o, r);
    ctx.arcTo(o, o, size - o, o, r);
    ctx.fill();
  }
  _blobTexture = new THREE.CanvasTexture(canvas);
  return _blobTexture;
}

/** @param {Array<{x:number,z:number,w:number,d:number}>} rects - footprints to ground */
function buildContactShadows(scene, rects) {
  if (!rects.length) return;
  const mat = new THREE.MeshBasicMaterial({
    map: getBlobTexture(), transparent: true, opacity: 0.62, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
  });
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mat, rects.length);
  const dummy = new THREE.Object3D();
  rects.forEach((r, i) => {
    dummy.position.set(r.x, 0.006, r.z);
    // The texture's dark core is 1/1.5 of its width.
    dummy.scale.set(r.w + 0.5, 1, r.d + 0.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  scene.add(mesh);
}

// ── Slab, kerb, walls ───────────────────────────────────────────────────────

/**
 * Build everything that stands on or around the board.
 * @param {number} hw - half the grid width
 * @param {number} hh - half the grid depth
 * @param {(kind:number)=>THREE.Object3D} makeProp - the theme's obstacle prop
 */
export function buildBoardStructures(hw, hh, makeProp) {
  const state = getState();
  const { theme, mapIndex, grid, ROWS, COLS, scene, SPAWNS, BASE, themeData } = state;
  const visuals = themeData?.visuals;
  const style = getBoardStyle(theme);
  const mats = state.boardMaterials = makeBoardMaterials(theme);
  const c = makeCollector();
  const shadows = [];
  const seed = ((mapIndex + 1) * 10007 + 47) >>> 0;

  // --- Slab: lip, foot, moat ---
  const ex = hw + BOARD.EDGE, ez = hh + BOARD.EDGE;
  const mx = ex + BOARD.MOAT, mz = ez + BOARD.MOAT;
  const D = BOARD.DEPTH;
  const ringBoxes = (bucket, x0, z0, grow, y0, y1) => {
    // Four boxes framing the rectangle x0 x z0, `grow` thick, outside it.
    c.box(bucket, -x0 - grow, x0 + grow, y0, y1, z0, z0 + grow);
    c.box(bucket, -x0 - grow, x0 + grow, y0, y1, -z0 - grow, -z0);
    c.box(bucket, x0, x0 + grow, y0, y1, -z0, z0);
    c.box(bucket, -x0 - grow, -x0, y0, y1, -z0, z0);
  };
  ringBoxes('cap', ex, ez, 0.07, -0.16, 0);
  ringBoxes('base', ex, ez, 0.24, -D, -D + 0.2);
  ringBoxes('base', mx, mz, 0.22, -D, 0.07);
  c.box('base', -mx - 0.1, mx + 0.1, -D - 0.1, -D, -mz - 0.1, mz + 0.1);
  if (visuals && typeof document !== 'undefined') buildFascia(scene, hw, hh, style.side, visuals);

  // --- Kerb, open at the spawn tunnels and the base ---
  const K = style.kerb || {};
  const kAt = K.at ?? BOARD.KERB_AT, kT = K.t ?? BOARD.KERB_T;
  const kx = hw + kAt, kz = hh + kAt, kt = kT / 2, kh = K.h ?? style.kerbH;
  // The kerb uses the walls' materials unless the theme gave it its own.
  const own = Boolean(mats.kbody);
  const KB = own ? 'kbody' : 'body', KC = own ? 'kcap' : 'cap', KA = own ? 'kaccent' : 'accent';
  const kStripe = K.stripe || style.wall.stripe.map(v => v * kh / style.wall.h);
  const cut = K.chamfer || 0;
  const adFaces = [];
  const kerbRun = (x0, x1, z0, z1) => {
    c.box(KB, x0, x1, 0, kh, z0, z1);
    c.box(KA, x0 - 0.015, x1 + 0.015, kStripe[0], kStripe[1], z0 - 0.015, z1 + 0.015);
    c.box(KC, x0 - 0.04, x1 + 0.04, kh, kh + 0.07, z0 - 0.04, z1 + 0.04, 0.02);
    // The face that looks at the board carries the advertising.
    if (x1 - x0 > z1 - z0) {
      const outer = (z0 + z1) / 2 > 0, zi = outer ? z0 : z1;
      adFaces.push({ a: [x0, zi], b: [x1, zi], n: [0, outer ? -1 : 1] });
    } else {
      const outer = (x0 + x1) / 2 > 0, xi = outer ? x0 : x1;
      adFaces.push({ a: [xi, z0], b: [xi, z1], n: [outer ? -1 : 1, 0] });
    }
  };
  // With cut corners the straight runs stop short and a diagonal joins them.
  const endX = cut ? kx - cut : kx + kt, endZ = cut ? kz - cut : kz - kt;
  kerbRun(-endX, endX, -kz - kt, -kz + kt);
  kerbRun(-endX, endX, kz - kt, kz + kt);
  const sideRun = (x, gaps) => {
    // gaps: [centre z, half width], sorted
    let from = -endZ;
    for (const [gz, half] of gaps.sort((a, b) => a[0] - b[0])) {
      if (gz - half > from) kerbRun(x - kt, x + kt, from, gz - half);
      from = Math.max(from, gz + half);
    }
    if (endZ > from) kerbRun(x - kt, x + kt, from, endZ);
  };
  sideRun(-kx, (SPAWNS || []).filter(s => s.x === 0).map(s => [s.y - hh + 0.5, 0.66]));
  sideRun(kx, BASE && BASE.x === COLS - 1 ? [[BASE.y - hh + 0.5, style.baseGap]] : []);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      if (cut) {
        const cx = sx * (kx - cut / 2), cz = sz * (kz - cut / 2);
        const len = cut * Math.SQRT2 + kT * 0.42, turn = [0, Math.atan2(sz, sx), 0];
        c.add(KB, new THREE.BoxGeometry(len, kh, kT), [cx, kh / 2, cz], turn);
        c.add(KA, new THREE.BoxGeometry(len + 0.02, kStripe[1] - kStripe[0], kT + 0.03), [cx, (kStripe[0] + kStripe[1]) / 2, cz], turn);
        c.add(KC, new THREE.BoxGeometry(len + 0.04, 0.07, kT + 0.08), [cx, kh + 0.035, cz], turn);
        // Solid behind the diagonal, so no ice shows outside the boards.
        const ox = sx * (kx + kt), oz = sz * (kz + kt), leg = cut + kt;
        const wedge = G.plate([[ox, -oz], [ox - sx * leg, -oz], [ox, -(oz - sz * leg)]], kh * 0.92);
        wedge.rotateX(-Math.PI / 2);
        c.add(KB, wedge, [0, kh * 0.46, 0]);
      } else if (K.corner === 'flag') {
        const fx = sx * (hw + 0.1), fz = sz * (hh + 0.1);
        c.add(KB, new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), [fx, 0.5, fz]);
        c.add(KA, new THREE.BoxGeometry(0.3, 0.2, 0.015), [fx + sx * 0.15, 0.88, fz]);
      } else {
        addPost(c, style, sx * kx, sz * kz, kt + 0.07, kh + 0.55);
      }
    }
  }
  if (K.ads && typeof document !== 'undefined') buildAds(scene, adFaces, K.ads, K.adY[0], K.adY[1]);
  // The kerb's shadow on the apron, one strip a side.
  shadows.push({ x: 0, z: -kz, w: kx * 2, d: kT }, { x: 0, z: kz, w: kx * 2, d: kT });
  shadows.push({ x: -kx, z: 0, w: kT, d: kz * 2 }, { x: kx, z: 0, w: kT, d: kz * 2 });

  // --- Obstacle walls ---
  const isOb = (x, y) => y >= 0 && y < ROWS && x >= 0 && x < COLS && grid[y][x].type === 'obstacle';
  const { h, t, r, stripe } = style.wall;
  const half = t / 2, inset = (1 - t) / 2, foot = 0.08;
  const inRun = new Set();
  const key = (x, y) => x + ',' + y;

  const wallRun = (x0, x1, z0, z1, alongX) => {
    // (x0..x1, z0..z1) is the run's full cell footprint in world units.
    const cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
    const bx0 = alongX ? x0 + inset : cx - half, bx1 = alongX ? x1 - inset : cx + half;
    const bz0 = alongX ? cz - half : z0 + inset, bz1 = alongX ? cz + half : z1 - inset;
    c.box('base', x0 + 0.02, x1 - 0.02, 0, foot, z0 + 0.02, z1 - 0.02, 0.02);
    if (style.wall.kind === 'mannequins') {
      // A free-kick wall: a weighted beam with two mannequins to a cell,
      // shoulder to shoulder, so the line is as solid as a wall.
      c.box('body', bx0, bx1, foot, foot + h, bz0, bz1, r);
      c.box('accent', bx0 - 0.015, bx1 + 0.015, foot + stripe[0], foot + stripe[1], bz0 - 0.015, bz1 + 0.015);
      const count = Math.round((alongX ? x1 - x0 : z1 - z0) * 2);
      for (let i = 0; i < count; i++) {
        const along = (alongX ? x0 : z0) + 0.25 + i * 0.5;
        const px = alongX ? along : cx, pz = alongX ? cz : along;
        const wx = (alongX ? 0.4 : 0.15) / 2, wz = (alongX ? 0.15 : 0.4) / 2;
        c.box('body', px - 0.05, px + 0.05, foot + h, 0.34, pz - 0.05, pz + 0.05);
        c.box('cap', px - wx, px + wx, 0.32, 0.82, pz - wz, pz + wz, 0.06);
        c.add('cap', new THREE.SphereGeometry(0.115, 10, 8), [px, 0.95, pz]);
      }
      return;
    }
    c.box('body', bx0, bx1, foot, h, bz0, bz1, r);
    c.box('accent', bx0 - 0.015, bx1 + 0.015, stripe[0], stripe[1], bz0 - 0.015, bz1 + 0.015);
    c.box('cap', bx0 - 0.04, bx1 + 0.04, h, h + 0.07, bz0 - 0.04, bz1 + 0.04, 0.025);
  };

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isOb(x, y) || isOb(x - 1, y)) continue;
      let x1 = x;
      while (isOb(x1 + 1, y)) x1++;
      if (x1 === x) continue;
      wallRun(x - hw, x1 + 1 - hw, y - hh, y + 1 - hh, true);
      for (let i = x; i <= x1; i++) inRun.add(key(i, y));
    }
  }
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (!isOb(x, y) || isOb(x, y - 1)) continue;
      let y1 = y;
      while (isOb(x, y1 + 1)) y1++;
      if (y1 === y) continue;
      wallRun(x - hw, x + 1 - hw, y - hh, y1 + 1 - hh, false);
      for (let i = y; i <= y1; i++) inRun.add(key(x, i));
    }
  }

  // Solid blocks: where four cells meet, close the hole between their walls.
  const props = new THREE.Group();
  const crowned = new Set();
  const placeProp = (wx, wy, wz, scale, salt) => {
    if (!makeProp) return;
    const prop = makeProp(Math.floor(hash2(salt, salt * 3 + 1, seed) * 5));
    prop.position.set(wx, wy, wz);
    prop.scale.multiplyScalar(scale);
    // Quarter turns only, plus a few degrees: placed, not scattered.
    prop.rotation.y = Math.floor(hash2(salt * 5, salt, seed + 99) * 4) * (Math.PI / 2) + (hash2(salt, 7, seed) - 0.5) * 0.3;
    props.add(prop);
  };
  for (let y = 0; y < ROWS - 1; y++) {
    for (let x = 0; x < COLS - 1; x++) {
      if (!(isOb(x, y) && isOb(x + 1, y) && isOb(x, y + 1) && isOb(x + 1, y + 1))) continue;
      const wx = x + 1 - hw, wz = y + 1 - hh, f = inset + 0.01;
      c.box('base', wx - 0.1, wx + 0.1, 0, foot, wz - 0.1, wz + 0.1);
      c.box('body', wx - f, wx + f, foot, h, wz - f, wz + f);
      c.box('cap', wx - f - 0.01, wx + f + 0.01, h, h + 0.07, wz - f - 0.01, wz + f + 0.01);
      // One big prop on top of a block, where there is room for it.
      const clear = ![[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1]]
        .some(([dx, dy]) => crowned.has(key(x + dx, y + dy)));
      if (clear) {
        crowned.add(key(x, y));
        placeProp(wx, h + 0.07, wz, 1.5, x * 31 + y * 17 + 5);
      }
    }
  }

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!isOb(x, y)) continue;
      const wx = x - hw + 0.5, wz = y - hh + 0.5;
      shadows.push({ x: wx, z: wz, w: 1, d: 1 });

      if (!inRun.has(key(x, y))) {
        // A lone cell: one prop, centred on a plinth that fills the cell.
        c.box('base', wx - 0.45, wx + 0.45, 0, 0.14, wz - 0.45, wz + 0.45, 0.04);
        c.box('body', wx - 0.39, wx + 0.39, 0.14, 0.22, wz - 0.39, wz + 0.39, 0.03);
        c.box('cap', wx - 0.34, wx + 0.34, 0.22, 0.25, wz - 0.34, wz + 0.34);
        placeProp(wx, 0.25, wz, 1.45, x * 13 + y * 29 + 1);
        continue;
      }

      const e = isOb(x + 1, y), w = isOb(x - 1, y), n = isOb(x, y - 1), s = isOb(x, y + 1);
      const count = e + w + n + s;
      const straight = count === 2 && ((e && w) || (n && s));
      if (style.post.shape !== 'none' && (count === 1 || (count === 2 && !straight))) addPost(c, style, wx, wz, half + 0.05, h + 0.13);

    }
  }

  flush(c, mats, scene);

  if (props.children.length) {
    props.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    shareEquivalentMaterials(props);
    bakeStaticMeshes(props);
    scene.add(props);
  }

  // Ground the spawn tunnels and the base as well.
  for (const sp of SPAWNS || []) shadows.push({ x: sp.x - hw + 0.5 - 0.75, z: sp.y - hh + 0.5, w: 0.5, d: 1.2 });
  if (BASE) shadows.push({ x: BASE.x - hw + 0.5 + 1.0, z: BASE.y - hh + 0.5, w: 0.4, d: 1.4 });
  if (typeof document !== 'undefined') buildContactShadows(scene, shadows);
}
