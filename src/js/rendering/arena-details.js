// The details that make each arena the real place.
//
//   hockey   regulation ice markings, glass above the boards, players' benches
//            and penalty boxes, a scoreboard
//   soccer   corner arcs and the penalty "D", dugouts on the far touchline
//   bowling  approach dots, the foul line and the lane arrows
//   golf     a tee mat at each spawn
//
// Everything on the playing surface here is flat paint: nothing stands on a
// walkable or buildable cell. Benches and dugouts stand outside the kerb, on
// decks over the moat. Tall things (glass, scoreboard) are registered with the
// camera so they hide when the camera is on their side of the board.

import { getState } from '../engine/state.js';
import { composeGeometry } from './geo-utils.js';
import { BOARD, getBoardStyle } from './board.js';

const FLAT = [-Math.PI / 2, 0, 0];

/** Collects flat shapes by colour; one mesh per colour when flushed. */
function makePaint(scene) {
  const byColor = new Map();
  const put = (color, geo, x, z, y) => {
    if (!byColor.has(color)) byColor.set(color, []);
    byColor.get(color).push({ geo, p: [x, y, z], r: FLAT });
  };
  return {
    rect: (color, x, z, w, d, y = 0.012) => put(color, new THREE.PlaneGeometry(w, d), x, z, y),
    ring: (color, x, z, r0, r1, start = 0, length = Math.PI * 2, y = 0.012) => put(color, new THREE.RingGeometry(r0, r1, 48, 1, start, length), x, z, y),
    disc: (color, x, z, r, start = 0, length = Math.PI * 2, y = 0.012) => put(color, new THREE.CircleGeometry(r, 28, start, length), x, z, y),
    shape: (color, geo, x, z, y = 0.012) => put(color, geo, x, z, y),
    flush() {
      for (const [color, list] of byColor) {
        const mesh = new THREE.Mesh(composeGeometry(list), new THREE.MeshBasicMaterial({
          color, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
        }));
        scene.add(mesh);
      }
    }
  };
}

/** Collects boxes and other solids by material; one mesh per material. */
function makeSolids(scene) {
  const byMat = new Map();
  const add = (mat, geo, p, r) => {
    if (!byMat.has(mat)) byMat.set(mat, []);
    byMat.get(mat).push({ geo, p, r });
  };
  return {
    add,
    box: (mat, x0, x1, y0, y1, z0, z1) => add(mat, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]),
    flush() {
      for (const [mat, list] of byMat) {
        const mesh = new THREE.Mesh(composeGeometry(list), mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    }
  };
}

const std = (color, rough = 0.7, metal = 0.05) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });

/** Hide `object` when the camera is on its side of the board (see engine/camera.js). */
function hideWhenNear(state, object, x, z) {
  object.userData.anchor = { x, z };
  state.cameraOccluders = state.cameraOccluders || [];
  state.cameraOccluders.push(object);
}

/**
 * A bench on a deck over the moat, on the far (-Z) side of the board, with a
 * row of seated figures. Used for players' benches, penalty boxes and dugouts.
 */
function addBench(solids, mats, hh, x, width, { team, head, count, roof = false, wall = 0.8 }) {
  const z0 = -(hh + BOARD.EDGE), z1 = z0 - 1.35;
  const x0 = x - width / 2, x1 = x + width / 2;
  solids.box(mats.deck, x0, x1, -0.14, 0, z1, z0);
  solids.box(mats.deck, x0 + 0.2, x1 - 0.2, -BOARD.DEPTH, -0.14, z1 + 0.3, z1 + 0.6);
  solids.box(mats.wall, x0, x1, 0, wall, z1, z1 + 0.1);                       // back
  for (const sx of [x0, x1 - 0.1]) solids.box(mats.wall, sx, sx + 0.1, 0, wall * 0.75, z1, z0 - 0.25);
  solids.box(mats.trim, x0 + 0.15, x1 - 0.15, 0.2, 0.27, z1 + 0.3, z1 + 0.62);   // the bench itself
  if (roof) {
    solids.add(mats.roof, new THREE.CylinderGeometry(0.75, 0.75, width, 12, 1, true, 0, Math.PI / 2), [x, wall - 0.05, z1 + 0.8], [0, 0, Math.PI / 2]);
  }
  for (let i = 0; i < count; i++) {
    const px = x0 + 0.4 + (i + 0.5) * ((width - 0.8) / count);
    const who = Array.isArray(team) ? team[i % team.length] : team;
    solids.add(who, new THREE.CylinderGeometry(0.1, 0.13, 0.32, 8), [px, 0.43, z1 + 0.46]);
    solids.add(who, new THREE.BoxGeometry(0.16, 0.1, 0.3), [px, 0.3, z1 + 0.62]);              // lap
    solids.add(head, new THREE.SphereGeometry(0.095, 10, 8), [px, 0.68, z1 + 0.46]);
  }
}

// ── Hockey ──────────────────────────────────────────────────────────────────

function glassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(190, 225, 255, 0.10)';
  ctx.fillRect(0, 0, 128, 64);
  // A sheen across each pane, a stanchion between panes, the top rail.
  const sheen = ctx.createLinearGradient(0, 0, 128, 64);
  sheen.addColorStop(0.35, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.16)');
  sheen.addColorStop(0.65, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = 'rgba(225, 235, 245, 0.85)';
  ctx.fillRect(0, 0, 4, 64);
  ctx.fillRect(0, 0, 128, 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function scoreboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050a14';
  ctx.fillRect(0, 0, 512, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1d6fd1'; ctx.fillRect(16, 16, 150, 56);
  ctx.fillStyle = '#d42f2f'; ctx.fillRect(346, 16, 150, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px "Segoe UI", Arial, sans-serif';
  ctx.fillText('HOME', 91, 46);
  ctx.fillText('AWAY', 421, 46);
  ctx.font = '900 120px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ffd23a';
  ctx.fillText('3', 91, 156);
  ctx.fillText('2', 421, 156);
  ctx.font = '900 64px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#ff4b4b';
  ctx.fillText('12:47', 256, 120);
  ctx.font = '700 26px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#9fd8ff';
  ctx.fillText('PERIOD 2', 256, 46);
  ctx.fillText('SHOTS  24 - 19', 256, 206);
  return new THREE.CanvasTexture(canvas);
}

function buildRink(state, hw, hh) {
  const { scene, BASE } = state;
  const style = getBoardStyle('hockey');
  const paint = makePaint(scene);
  const RED = 0xc8102e, BLUE = 0x0b4f9c, CREASE = 0x4db8ff;

  // Lines: centre red, two blue, a goal line at each end.
  const blueX = hw * 0.3, goalX = hw + 0.2;
  paint.rect(RED, 0, 0, 0.16, hh * 2);
  for (const s of [-1, 1]) {
    paint.rect(BLUE, s * blueX, 0, 0.2, hh * 2);
    paint.rect(RED, s * goalX, 0, 0.05, hh * 2 + 0.3);
  }
  // Centre circle and spot in blue.
  paint.ring(BLUE, 0, 0, 1.24, 1.32);
  paint.disc(BLUE, 0, 0, 0.14);
  // End-zone faceoff circles with their spots and hash marks; neutral-zone spots.
  const circleX = (blueX + hw) / 2 + 0.1, circleZ = hh * 0.5, radius = Math.min(1.15, hh * 0.21);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cx = sx * circleX, cz = sz * circleZ;
      paint.ring(RED, cx, cz, radius - 0.07, radius);
      paint.disc(RED, cx, cz, 0.16);
      for (const hx of [-1, 1]) for (const hz of [-1, 1]) paint.rect(RED, cx + hx * 0.28, cz + hz * (radius + 0.14), 0.06, 0.28);
      paint.disc(RED, sx * (blueX - 0.7), cz, 0.15);
    }
  }
  // The crease in front of the goal, wherever this arena's goal is.
  if (BASE) {
    const bz = BASE.y - hh + 0.5;
    paint.disc(CREASE, goalX, bz, 0.95, Math.PI / 2, Math.PI);
    paint.ring(RED, goalX, bz, 0.95, 1.01, Math.PI / 2, Math.PI, 0.013);
  }
  paint.flush();

  // Glass above the boards: one translucent strip a side.
  const K = style.kerb;
  const kx = hw + BOARD.KERB_AT, kz = hh + BOARD.KERB_AT;
  const y0 = K.h + 0.07, height = 0.8;
  const glass = new THREE.MeshBasicMaterial({ map: glassTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const pane = (x, z, length, rotY) => {
    const geo = new THREE.PlaneGeometry(length, height);
    const uv = geo.attributes.uv;
    const panes = Math.max(1, Math.round(length / 1.6));
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * panes);
    const mesh = new THREE.Mesh(geo, glass);
    mesh.position.set(x, y0 + height / 2, z);
    mesh.rotation.y = rotY;
    mesh.renderOrder = 4;
    scene.add(mesh);
    // Anchored well outside its own side, so it goes when the camera is there.
    hideWhenNear(state, mesh, Math.sign(x) * (hw + 10), Math.sign(z) * (hh + 10));
  };
  pane(0, -kz, (kx - K.chamfer) * 2, 0);
  pane(0, kz, (kx - K.chamfer) * 2, 0);
  pane(-kx, 0, (kz - K.chamfer) * 2, Math.PI / 2);
  pane(kx, 0, (kz - K.chamfer) * 2, Math.PI / 2);

  // Benches and penalty boxes along the far side.
  const solids = makeSolids(scene);
  const mats = { deck: std(0x1f2f45, 0.85), wall: std(0xe6edf3, 0.5), trim: std(0x8a5a33, 0.7) };
  const home = std(0x1d6fd1, 0.6), away = std(0xd42f2f, 0.6), helmet = std(0xf1f5f9, 0.35), stripes = std(0x15171c, 0.6);
  const benchW = Math.min(4.2, hw * 0.42);
  addBench(solids, mats, hh, -hw * 0.5, benchW, { team: home, head: helmet, count: 5 });
  addBench(solids, mats, hh, hw * 0.5, benchW, { team: away, head: helmet, count: 5 });
  addBench(solids, mats, hh, -0.85, 1.4, { team: away, head: helmet, count: 1, wall: 0.6 });
  addBench(solids, mats, hh, 0.85, 1.4, { team: stripes, head: helmet, count: 1, wall: 0.6 });   // the officials
  solids.flush();

  // Scoreboard over the far stand.
  const board = new THREE.Group();
  const standBack = hh + BOARD.EDGE + BOARD.MOAT + 0.12 + 2.5;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.7, 0.5), std(0x111827, 0.5, 0.6));
  frame.position.set(0, 5.6, 0);
  board.add(frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 2.3), new THREE.MeshBasicMaterial({ map: scoreboardTexture(), fog: false }));
  screen.position.set(0, 5.6, 0.26);
  board.add(screen);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.3, 0.22), std(0x111827, 0.5, 0.6));
    leg.position.set(s * 2.2, 2.15, -0.1);
    board.add(leg);
  }
  board.position.set(0, 0, -(standBack + 0.5));
  scene.add(board);
  hideWhenNear(state, board, 0, -(standBack + 0.5));
}

// ── Soccer ──────────────────────────────────────────────────────────────────

function buildPitch(state, hw, hh) {
  const { scene, COLS, ROWS, BASE } = state;
  const paint = makePaint(scene);
  const WHITE = 0xffffff;

  // Corner arcs.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      // A quarter circle opening into the pitch. Angles are measured in the
      // flat plane before it is laid down, where +Y becomes -Z.
      const start = sx < 0 ? (sz < 0 ? -Math.PI / 2 : 0) : (sz < 0 ? Math.PI : Math.PI / 2);
      paint.ring(WHITE, sx * hw, sz * hh, 0.5, 0.6, start, Math.PI / 2, 0.022);
    }
  }
  // The "D" outside each penalty area. Same measurements as the boxes drawn
  // in engine/scene.js; the defended end's box is centred on the goal.
  const boxW = Math.max(2.5, COLS * 0.2), boxH = Math.max(2.2, ROWS * 0.3);
  const limit = Math.max(0, hh - boxH / 2);
  const baseZ = BASE ? Math.max(-limit, Math.min(limit, BASE.y - hh + 0.5)) : 0;
  for (const [side, z] of [[-1, 0], [1, baseZ]]) {
    const spotX = side * (hw - boxW * 0.65);
    const reach = boxW * 0.35, radius = Math.max(1.25, reach + 0.45);
    const half = Math.acos(Math.min(1, reach / radius));
    const centre = side > 0 ? Math.PI : 0;
    paint.ring(WHITE, spotX, z, radius - 0.1, radius, centre - half, half * 2, 0.022);
  }
  paint.flush();

  // Dugouts on the far touchline, one a side of halfway.
  const solids = makeSolids(scene);
  const mats = {
    deck: std(0x23402b, 0.9), wall: std(0xf1f3ee, 0.6), trim: std(0x1e293b, 0.7),
    roof: new THREE.MeshStandardMaterial({ color: 0xbfe3f2, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  };
  const visuals = state.themeData?.visuals;
  const home = std(visuals?.lighting?.accent ?? 0x22c55e, 0.6), away = std(0xcc8800, 0.6), skin = std(0xe0ac7e, 0.7);
  const width = Math.min(3.6, hw * 0.4);
  addBench(solids, mats, hh, -hw * 0.38, width, { team: home, head: skin, count: 5, roof: true, wall: 0.95 });
  addBench(solids, mats, hh, hw * 0.38, width, { team: away, head: skin, count: 5, roof: true, wall: 0.95 });
  solids.flush();
}

// ── Bowling ─────────────────────────────────────────────────────────────────

function buildLane(state, hw, hh) {
  const paint = makePaint(state.scene);
  const INK = 0x3b2412;
  const span = hh * 2;
  // Approach dots, the foul line, then the seven arrows in a V, all pointing
  // down the lane toward the ball return.
  for (let i = 0; i < 7; i++) {
    const z = (i - 3) * (span / 8);
    paint.disc(INK, -hw * 0.86, z, 0.07);
    if (i % 2 === 0) paint.disc(INK, -hw * 0.74, z, 0.07);
    const arrow = new THREE.Shape();
    arrow.moveTo(0.34, 0);
    arrow.lineTo(-0.2, 0.13);
    arrow.lineTo(-0.2, -0.13);
    arrow.closePath();
    paint.shape(INK, new THREE.ShapeGeometry(arrow), -hw * 0.3 + (3 - Math.abs(i - 3)) * 0.55, z);
  }
  paint.rect(INK, -hw * 0.62, 0, 0.07, span);
  paint.flush();
}

// ── Golf ────────────────────────────────────────────────────────────────────

function buildTees(state, hw, hh) {
  const paint = makePaint(state.scene);
  for (const s of state.SPAWNS || []) {
    const x = s.x - hw + 0.5, z = s.y - hh + 0.5;
    paint.rect(0x0f3d24, x, z, 0.86, 0.86, 0.009);        // the mat
    paint.rect(0x1c5c38, x, z, 0.7, 0.7, 0.0095);
    for (const side of [-1, 1]) paint.disc(0xf4f6f8, x - 0.3, z + side * 0.3, 0.06, 0, Math.PI * 2, 0.0105);   // tee markers
  }
  paint.flush();
}

/** Called once per scene build, after the stands and lights exist. */
export function buildArenaDetails(hw, hh) {
  const state = getState();
  if (typeof document === 'undefined') return;
  switch (state.theme) {
    case 'hockey': buildRink(state, hw, hh); break;
    case 'soccer': buildPitch(state, hw, hh); break;
    case 'bowling': buildLane(state, hw, hh); break;
    case 'golf': buildTees(state, hw, hh); break;
    default: break;
  }
}
