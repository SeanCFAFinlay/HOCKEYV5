// Stands and the crowd in them.
//
// The spectators used to be identical pegs in random colours on bare steps.
// Now the stands have aisles with stairs, a front rail, tunnel portals and a
// row of lit boxes over the back wall, and the crowd is a crowd:
//
//   - builds, heights and skin tones vary; shirts are grouped into home and
//     away blocks between the aisles, with a few neutrals mixed in
//   - some wear hats; some hold scarves or signs overhead, wave flags or foam
//     fingers; there are a couple of drummers; cameras flash
//   - everyone sways on their own phase, some blocks bounce, and every so often
//     a wave goes round the ground
//   - they react to the game: a kill makes the stand nearest it jump with arms
//     up, clearing a wave sets the whole ground off, letting an enemy through
//     gets a slump, and a boss on the field keeps them on their feet
//
// All of it is instanced (one draw call per kind of thing) and animated in the
// vertex shader from five shared uniforms. No per-spectator JavaScript runs
// after the stands are built.

import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { getQualityName } from './quality.js';
import { composeGeometry } from './geo-utils.js';

// ── Reactions ───────────────────────────────────────────────────────────────

// Shared by every crowd material. Replaced on each scene build.
let live = null;
let subscribed = false;

function makeUniforms() {
  return {
    uCrowdTime: { value: 0 },
    uCheer: { value: new THREE.Vector3(0, 0, 0) },   // x, z of the last kill; strength
    uCheerAll: { value: 0 },
    uGroan: { value: 0 },
    uFrenzy: { value: 0 }
  };
}

function subscribe() {
  if (subscribed) return;
  subscribed = true;
  on(GameEvents.ENEMY_DEATH, (payload) => {
    if (!live) return;
    const enemy = payload?.enemy;
    const cheer = live.uniforms.uCheer.value;
    if (enemy && Number.isFinite(enemy.x) && Number.isFinite(enemy.z)) {
      cheer.x = enemy.x;
      cheer.y = enemy.z;
    }
    cheer.z = Math.min(1, cheer.z + (enemy?.boss ? 1 : 0.4));
    if (enemy?.boss) live.uniforms.uCheerAll.value = 1;
  });
  on(GameEvents.WAVE_COMPLETE, () => { if (live) live.uniforms.uCheerAll.value = 1; });
  on(GameEvents.ENEMY_ESCAPE, () => {
    if (!live) return;
    live.uniforms.uGroan.value = 1;
    live.uniforms.uCheer.value.z = 0;
    live.uniforms.uCheerAll.value = 0;
  });
}

/** Runs once a frame from one mesh's onBeforeRender: a handful of float ops. */
function tick() {
  if (!live) return;
  const state = getState();
  const u = live.uniforms;
  const now = state.animTime || 0;
  const dt = Math.min(0.1, Math.max(0, now - live.last));
  live.last = now;
  u.uCrowdTime.value = now;
  u.uCheer.value.z = Math.max(0, u.uCheer.value.z - dt * 0.55);
  u.uCheerAll.value = Math.max(0, u.uCheerAll.value - dt * 0.28);
  u.uGroan.value = Math.max(0, u.uGroan.value - dt * 0.5);

  // Is there a boss out? Looked up twice a second, not every frame.
  live.poll -= dt;
  if (live.poll <= 0) {
    live.poll = 0.5;
    live.boss = Array.isArray(state.enemies) && state.enemies.some(e => e && e.boss);
  }
  const target = live.boss ? 1 : 0;
  u.uFrenzy.value += (target - u.uFrenzy.value) * Math.min(1, dt * 2);
}

// ── Shader ──────────────────────────────────────────────────────────────────

const HEADER = `
uniform float uCrowdTime;
uniform vec3 uCheer;
uniform float uCheerAll;
uniform float uGroan;
uniform float uFrenzy;
attribute float aUp;
float crowdLift = 0.0;
float crowdRaise = 0.0;
`;

// Everything is derived from where the instance stands, so a spectator's body,
// head, hat, arms and whatever they are holding all move as one.
const MOTION = `
#ifdef USE_INSTANCING
  vec3 cPos = instanceMatrix[3].xyz;
  float cPh = cPos.x * 1.7 + cPos.z * 2.3;
  float cBob = sin(uCrowdTime * 3.2 + cPh) * 0.5 + 0.5;
  float cGate = smoothstep(0.5, 0.8, sin(uCrowdTime * 0.13));
  float cWave = pow(max(0.0, sin(uCrowdTime * 1.3 - atan(cPos.z, cPos.x))), 12.0) * cGate;
  vec2 cD = cPos.xz - uCheer.xy;
  float cCheer = clamp(uCheerAll + uCheer.z * (0.25 + 0.75 * exp(-dot(cD, cD) / 90.0)), 0.0, 1.0);
  float cKeen = step(0.3, fract(cPh * 0.37));
  float cCell = floor(cPos.x / 3.0) * 12.9 + floor(cPos.z / 3.0) * 78.2;
  float cBlock = step(0.7, fract(sin(cCell) * 437.5)) * max(0.0, sin(uCrowdTime * 0.4 + cCell));
  float cJump = abs(sin(uCrowdTime * (7.0 + uFrenzy * 3.0) + cPh)) * (cCheer * cKeen * 0.24 + cBlock * 0.07 + uFrenzy * 0.07);
  crowdLift = cBob * 0.03 + cWave * 0.22 + cJump - uGroan * 0.08;
  crowdRaise = clamp(aUp + cWave * 1.4 + cCheer * cKeen * 1.5 + uFrenzy * cKeen + cBlock * 0.8, 0.0, 1.0) * (1.0 - uGroan);
  MODE_LINES
#endif
`;

const MODES = {
  // Lean a little side to side; slump on a groan.
  body: 'transformed.x += sin(uCrowdTime * 1.7 + cPh) * 0.05 * transformed.y; transformed.y *= 1.0 - uGroan * 0.12;',
  // Arms fold away into the shoulders until raised.
  arms: 'transformed.y = 0.27 + (transformed.y - 0.27) * crowdRaise; transformed.xz *= 0.3 + 0.7 * crowdRaise;',
  // Things held overhead come down (and vanish) when the arms do.
  item: 'transformed *= step(0.08, crowdRaise); crowdLift += (crowdRaise - 1.0) * 0.3;',
  flag: 'transformed *= step(0.08, crowdRaise); crowdLift += (crowdRaise - 1.0) * 0.3; transformed.x += sin(uCrowdTime * 3.0 + cPh + transformed.y * 2.0) * 0.14 * max(0.0, transformed.y - 0.35);'
};

const PROJECT = `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition.y += crowdLift;
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

function animate(material, mode, uniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + HEADER)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + MOTION.replace('MODE_LINES', MODES[mode]))
      .replace('#include <project_vertex>', PROJECT);
  };
  material.customProgramCacheKey = () => 'crowd-' + mode;
}

// ── Build ───────────────────────────────────────────────────────────────────

const SKIN = [0xf1c9a5, 0xe0ac7e, 0xc68642, 0x8d5524, 0xffdbac, 0x6b4423];

/**
 * @param {number} hw - half the grid width
 * @param {number} hh - half the grid depth
 * @param {object} visuals - active visual profile
 * @param {number} frontGap - distance from the grid edge to the front of the stands
 */
export function buildStands(hw, hh, visuals, frontGap) {
  const state = getState();
  const { scene, theme } = state;
  const low = getQualityName() === 'low';
  const isHockey = theme === 'hockey';

  const standDepth = 2.5;
  const rowCount = 4;
  const rowHeight = 0.45;
  const rowDepth = standDepth / rowCount;
  const reach = 2 * (frontGap - 0.12);

  // Supporters' colours: the first is the home side, the second the visitors.
  const palette = visuals.crowd?.fans ? visuals.crowd.fans : isHockey
    ? [0x1d6fd1, 0xd42f2f, 0xf1f5f9, 0xfacc15, 0x123c6b]
    : [visuals.lighting.accent, 0xcc8800, 0xf1f5f9, visuals.map.floor.meshColor || 0x1a5c1a];
  const home = palette[0], away = palette[1] ?? 0xd42f2f;
  const neutrals = palette.slice(2).concat([0xf1f5f9, 0x334155, 0x94a3b8]);
  const seatColor = new THREE.Color(visuals.crowd?.seat ?? (isHockey ? 0x1d4270 : 0x263247));
  // Gaps matter: a 100% full stand reads as a texture.
  const OCCUPANCY = low ? 0.5 : 0.86;
  const AISLE_EVERY = 9;

  // Each stand by its front edge; local +Z points away from the board.
  const sides = [
    [0, -(hh + frontGap), hw * 2 + reach, Math.PI],
    [0, (hh + frontGap), hw * 2 + reach, 0],
    [-(hw + frontGap), 0, hh * 2 + reach, Math.PI / 2],
    [(hw + frontGap), 0, hh * 2 + reach, -Math.PI / 2]
  ];
  const toWorld = (fx, fz, lx, lz, rotY) => {
    const c = Math.cos(rotY), s = Math.sin(rotY);
    return [fx + lx * c - lz * s, fz + lx * s + lz * c];
  };

  const steps = [], trim = [], dark = [];
  const seats = [], fans = [];

  sides.forEach(([fx, fz, width, rotY], sideIndex) => {
    const perRow = Math.floor(width / 0.6);
    const seatW = width / perRow;
    const centre = Math.floor(perRow / 2);
    const box = (list, w, h, d, lx, y, lz) => {
      const [x, z] = toWorld(fx, fz, lx, lz, rotY);
      list.push({ geo: new THREE.BoxGeometry(w, h, d), p: [x, y, z], r: [0, rotY, 0] });
    };

    // Which side each block between two aisles supports.
    const blockTeam = [];
    for (let b = 0; b <= perRow / AISLE_EVERY + 1; b++) {
      const roll = Math.random();
      blockTeam.push(roll < 0.58 ? home : (roll < 0.86 ? away : null));
    }

    for (let row = 0; row < rowCount; row++) {
      const y = row * rowHeight + rowHeight / 2;
      const lz = row * rowDepth + rowDepth * 0.5;
      box(steps, width, rowHeight, rowDepth, 0, y, lz);

      for (let s = 0; s < perRow; s++) {
        const lx = -width / 2 + s * seatW + seatW / 2;
        if (s % AISLE_EVERY === AISLE_EVERY - 1) {
          // Stairway: a pale tread on the step and a half step in front of it.
          box(trim, seatW * 0.9, 0.03, rowDepth, lx, y + rowHeight / 2 + 0.015, lz);
          box(trim, seatW * 0.9, rowHeight / 2, rowDepth / 2, lx, y + rowHeight * 0.75, lz + rowDepth / 4);
          continue;
        }
        // Tunnel portal in the middle of the stand: no seats over it.
        if (row < 2 && Math.abs(s - centre) <= 1) continue;

        const [sx, sz] = toWorld(fx, fz, lx, lz, rotY);
        const seatY = y + rowHeight * 0.2;
        seats.push({ x: sx, y: seatY, z: sz, rotY, w: seatW * 0.72 });
        if (Math.random() >= OCCUPANCY) continue;

        const team = blockTeam[Math.floor(s / AISLE_EVERY)];
        // Mostly the block's colour, with the odd neutral in among them.
        const loyal = team !== null && Math.random() < 0.82;
        const child = Math.random() < 0.08;
        fans.push({
          x: sx, y: seatY + rowHeight * 0.3, z: sz,
          rotY: rotY + (Math.random() - 0.5) * 0.5,
          height: child ? 0.62 + Math.random() * 0.1 : 0.85 + Math.random() * 0.4,
          width: child ? 0.75 : 0.82 + Math.random() * 0.45,
          color: loyal ? (Math.random() < 0.85 ? team : 0xf1f5f9) : neutrals[Math.floor(Math.random() * neutrals.length)],
          team: loyal ? team : null,
          skin: SKIN[Math.floor(Math.random() * SKIN.length)]
        });
      }
    }

    // Front wall with a rail on posts.
    box(trim, width, 0.5, 0.2, 0, 0.25, 0);
    box(trim, width, 0.04, 0.05, 0, 0.7, 0);
    for (let lx = -width / 2 + 0.3; lx < width / 2; lx += 1.8) box(trim, 0.04, 0.2, 0.04, lx, 0.6, 0);

    // Tunnel portal: a concrete surround with a dark mouth.
    const portalW = seatW * 3;
    box(trim, portalW + 0.16, 0.86, rowDepth * 2, 0, 0.43, rowDepth);
    box(dark, portalW - 0.3, 0.66, 0.3, 0, 0.33, 0.05);

    // A couple of drummers at the front of the home end.
    if (!low && sideIndex < 2) {
      const lx = (sideIndex ? 1 : -1) * width * 0.2;
      const [dx, dz] = toWorld(fx, fz, lx, rowDepth * 0.5 - 0.22, rotY);
      dark.push({ geo: new THREE.CylinderGeometry(0.17, 0.17, 0.14, 14), p: [dx, rowHeight + 0.2, dz], r: [Math.PI / 2, 0, 0] });
      trim.push({ geo: new THREE.CylinderGeometry(0.175, 0.175, 0.1, 14), p: [dx, rowHeight + 0.2, dz], r: [Math.PI / 2, 0, 0] });
    }
  });

  const addMerged = (list, material, shadow) => {
    if (!list.length) return;
    const mesh = new THREE.Mesh(composeGeometry(list), material);
    mesh.receiveShadow = shadow;
    scene.add(mesh);
  };
  addMerged(steps, new THREE.MeshStandardMaterial({ color: 0x162133, roughness: 0.9, metalness: 0.1 }), true);
  addMerged(trim, new THREE.MeshStandardMaterial({ color: 0x2f3e55, roughness: 0.8, metalness: 0.15 }), true);
  addMerged(dark, new THREE.MeshBasicMaterial({ color: 0x04060a }), false);

  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();

  const instanced = (geometry, material, count) => {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  };
  const place = (mesh, i, x, y, z, rotY, sx, sy, sz, color) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, rotY, 0);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (color !== undefined) mesh.setColorAt(i, tint.set(color));
  };

  // Seats, a shade lighter and darker in alternate blocks so the rows read.
  const seatMesh = instanced(
    new THREE.BoxGeometry(1, rowHeight * 0.55, rowDepth * 0.6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.05 }),
    seats.length
  );
  seats.forEach((seat, i) => {
    place(seatMesh, i, seat.x, seat.y, seat.z, seat.rotY, seat.w, 1, 1);
    seatMesh.setColorAt(i, tint.copy(seatColor).multiplyScalar(1.15 + 0.5 * ((i * 7) % 3) / 2));
  });
  seatMesh.receiveShadow = true;
  if (seatMesh.instanceColor) seatMesh.instanceColor.needsUpdate = true;

  if (!fans.length) return;

  const uniforms = makeUniforms();
  live = { uniforms, last: state.animTime || 0, poll: 0, boss: false };
  subscribe();

  const crowdMaterial = (mode, opts = {}) => {
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0, ...opts });
    animate(material, mode, uniforms);
    return material;
  };
  const withUp = (geometry, values) => {
    geometry.setAttribute('aUp', new THREE.InstancedBufferAttribute(new Float32Array(values), 1));
    return geometry;
  };
  const finish = (mesh) => { if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; mesh.instanceMatrix.needsUpdate = true; };

  // A tapered torso, shoulders and a faceted head: about 30 triangles each.
  const bodies = instanced(composeGeometry([
    { geo: new THREE.CylinderGeometry(0.1, 0.15, 0.3, 6), p: [0, 0.15, 0] },
    { geo: new THREE.BoxGeometry(0.34, 0.07, 0.12), p: [0, 0.27, 0] }
  ]), crowdMaterial('body'), fans.length);
  const heads = instanced(new THREE.IcosahedronGeometry(0.085, 0).translate(0, 0.4, 0), crowdMaterial('body', { roughness: 0.7 }), fans.length);
  fans.forEach((fan, i) => {
    place(bodies, i, fan.x, fan.y, fan.z, fan.rotY, fan.width, fan.height, fan.width, fan.color);
    place(heads, i, fan.x, fan.y, fan.z, fan.rotY, 1, fan.height, 1, fan.skin);
  });
  finish(bodies);
  finish(heads);
  bodies.onBeforeRender = tick;

  if (low) return;

  // Who is holding what. Scarves and flags belong to the supporters' blocks.
  const banners = [], flags = [], fingers = [], hats = [];
  const armsUp = new Float32Array(fans.length);
  fans.forEach((fan, i) => {
    const roll = Math.random();
    if (fan.height < 0.75) { if (roll < 0.3) hats.push(i); return; }
    if (fan.team !== null && roll < 0.1) { banners.push({ i, w: 0.5, h: 0.075, color: roll < 0.05 ? fan.team : 0xf1f5f9 }); armsUp[i] = 1; }
    else if (roll < 0.135) { banners.push({ i, w: 0.48, h: 0.3, color: roll < 0.12 ? 0xf8fafc : 0xfde047 }); armsUp[i] = 1; }
    else if (fan.team !== null && roll < 0.17) { flags.push(i); armsUp[i] = 1; }
    else if (roll < 0.2) { fingers.push(i); armsUp[i] = 1; }
    else if (roll < 0.25) armsUp[i] = 1;            // just has their arms up
    if (Math.random() < 0.2) hats.push(i);
  });

  // Arms: everyone has them; the shader keeps them folded until they go up.
  const arms = instanced(withUp(composeGeometry([
    { geo: new THREE.BoxGeometry(0.05, 0.26, 0.05), p: [-0.19, 0.39, 0], r: [0, 0, 0.22] },
    { geo: new THREE.BoxGeometry(0.05, 0.26, 0.05), p: [0.19, 0.39, 0], r: [0, 0, -0.22] }
  ]), armsUp), crowdMaterial('arms'), fans.length);
  fans.forEach((fan, i) => place(arms, i, fan.x, fan.y, fan.z, fan.rotY, fan.width, fan.height, fan.width, i % 3 ? fan.color : fan.skin));
  finish(arms);

  const ones = n => new Array(n).fill(1);
  // Local offset (lx to the fan's right, ly up) into world space.
  const beside = (fan, lx) => [fan.x + lx * Math.cos(fan.rotY), fan.z - lx * Math.sin(fan.rotY)];

  if (hats.length) {
    const mesh = instanced(composeGeometry([
      { geo: new THREE.CylinderGeometry(0.07, 0.09, 0.07, 8), p: [0, 0.485, 0] },
      { geo: new THREE.SphereGeometry(0.03, 6, 5), p: [0, 0.54, 0] }
    ]), crowdMaterial('body'), hats.length);
    hats.forEach((fanIndex, i) => {
      const fan = fans[fanIndex];
      place(mesh, i, fan.x, fan.y, fan.z, fan.rotY, 1, fan.height, 1, fan.team ?? neutrals[i % neutrals.length]);
    });
    finish(mesh);
  }

  if (banners.length) {
    const mesh = instanced(withUp(new THREE.BoxGeometry(1, 1, 0.02), ones(banners.length)), crowdMaterial('item'), banners.length);
    banners.forEach((b, i) => {
      const fan = fans[b.i];
      place(mesh, i, fan.x, fan.y + 0.56 * fan.height + b.h / 2, fan.z, fan.rotY, b.w, b.h, 1, b.color);
    });
    finish(mesh);
  }

  if (flags.length) {
    const mesh = instanced(withUp(composeGeometry([
      { geo: new THREE.CylinderGeometry(0.012, 0.012, 1.0, 5), p: [0, 0.75, 0] },
      { geo: new THREE.BoxGeometry(0.42, 0.27, 0.012), p: [0.22, 1.1, 0] }
    ]), ones(flags.length)), crowdMaterial('flag'), flags.length);
    flags.forEach((fanIndex, i) => {
      const fan = fans[fanIndex];
      const [x, z] = beside(fan, 0.2);
      place(mesh, i, x, fan.y, z, fan.rotY, 1, 1, 1, fan.team);
    });
    finish(mesh);
  }

  if (fingers.length) {
    const mesh = instanced(withUp(composeGeometry([
      { geo: new THREE.BoxGeometry(0.11, 0.2, 0.05), p: [0, 0.1, 0] },
      { geo: new THREE.BoxGeometry(0.04, 0.17, 0.04), p: [0, 0.28, 0] }
    ]), ones(fingers.length)), crowdMaterial('item'), fingers.length);
    fingers.forEach((fanIndex, i) => {
      const fan = fans[fanIndex];
      const [x, z] = beside(fan, 0.2);
      place(mesh, i, x, fan.y + 0.5 * fan.height, z, fan.rotY, 1, 1, 1, fan.team ?? home);
    });
    finish(mesh);
  }

  // Camera flashes: points scattered through the crowd, each lit for the odd
  // ninth of a second; far more of them go off when the ground erupts.
  const flashCount = Math.min(140, fans.length);
  const flashAt = new Float32Array(flashCount * 3);
  for (let i = 0; i < flashCount; i++) {
    const fan = fans[Math.floor(Math.random() * fans.length)];
    flashAt.set([fan.x, fan.y + 0.5, fan.z], i * 3);
  }
  const flashGeo = new THREE.BufferGeometry();
  flashGeo.setAttribute('position', new THREE.BufferAttribute(flashAt, 3));
  const flashMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.55, sizeAttenuation: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false
  });
  flashMat.onBeforeCompile = (shader) => {
    shader.uniforms.uCrowdTime = uniforms.uCrowdTime;
    shader.uniforms.uCheerAll = uniforms.uCheerAll;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uCrowdTime;\nuniform float uCheerAll;')
      .replace(
        'gl_PointSize = size;',
        `float flashSeed = dot( position.xz, vec2( 12.9898, 78.233 ) ) + floor( uCrowdTime * 9.0 ) * 0.37;
        gl_PointSize = size * step( 0.975 - uCheerAll * 0.2, fract( sin( flashSeed ) * 43758.5453 ) );`
      );
  };
  flashMat.customProgramCacheKey = () => 'crowd-flash';
  const flashes = new THREE.Points(flashGeo, flashMat);
  flashes.frustumCulled = false;
  scene.add(flashes);
}

/**
 * A row of lit boxes over the back wall of each stand: one textured mesh.
 * @param {Array<[number, number, number, number]>} walls - [x, z, width, rotY] of each back wall
 * @param {number} baseY - height of the bottom of the row
 */
export function buildSkyBoxes(walls, baseY, accent) {
  const { scene } = getState();
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  // A continuous dark fascia with a band of glazing: most boxes dimly lit,
  // the odd one dark, a few heads at the glass.
  ctx.fillStyle = '#121a29';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#' + new THREE.Color(accent).getHexString();
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, 60, 256, 3);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 4; i++) {
    const x = i * 64 + 3;
    const lit = i !== 2;
    ctx.fillStyle = lit ? (i % 2 ? '#7d6a45' : '#4f6480') : '#1a2436';
    ctx.fillRect(x, 16, 58, 30);
    if (lit) {
      ctx.fillStyle = 'rgba(14,18,28,0.9)';
      for (let p = 0; p < 3; p++) {
        const px = x + 10 + p * 17 + (i * 5) % 6;
        ctx.beginPath(); ctx.arc(px, 37, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(px - 5.5, 40, 11, 6);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;

  const height = 0.8;
  const position = [], uv = [];
  for (const [x, z, width, rotY] of walls) {
    const c = Math.cos(rotY), s = Math.sin(rotY);
    // The wall's plane faces local +Z, which rotY turns toward the board.
    const corner = (lx, y) => [x + lx * c + 0.14 * s, y, z - lx * s + 0.14 * c];
    const a = corner(-width / 2, baseY), b = corner(width / 2, baseY);
    const d = corner(-width / 2, baseY + height), e = corner(width / 2, baseY + height);
    const reps = Math.max(1, Math.round(width / 7));
    for (const [p, u, v] of [[a, 0, 0], [b, reps, 0], [e, reps, 1], [a, 0, 0], [e, reps, 1], [d, 0, 1]]) {
      position.push(p[0], p[1], p[2]);
      uv.push(u, v);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture, fog: false }));
  scene.add(mesh);
}
