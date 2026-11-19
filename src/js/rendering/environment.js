// Environment rendering - cells, lights, perimeter decor, and stadium stands

import { getState } from '../engine/state.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { getQualityName } from './quality.js';
import { composeGeometry } from './geo-utils.js';

export function buildCells(hw, hh) {
  const state = getState();
  const { COLS, ROWS, scene, grid, themeData } = state;
  const visuals = getVisualProfile(themeData);

  state.cells = [];

  const rayGeo = new THREE.PlaneGeometry(1, 1);
  // Pick targets only. `visible: false` on the material keeps them out of the
  // render list entirely (they were 198 fully transparent draw calls) while
  // Raycaster, which ignores material visibility, still hits them.
  const rayMat = new THREE.MeshBasicMaterial({ visible: false });
  const pathMat = new THREE.MeshBasicMaterial({
    color: visuals.map.path.color,
    transparent: true,
    opacity: visuals.map.path.opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const buildMat = new THREE.MeshBasicMaterial({
    color: visuals.map.buildZone.color,
    transparent: true,
    opacity: visuals.map.buildZone.opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const obstacleMat = new THREE.MeshBasicMaterial({
    color: visuals.map.obstacle.accent,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  // Tile overlays, bucketed by material: one InstancedMesh per kind instead of
  // one Mesh per tile (~200 draw calls down to 3).
  const tiles = new Map([
    [pathMat, []],
    [buildMat, []],
    [obstacleMat, []]
  ]);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = new THREE.Mesh(rayGeo, rayMat);
      cell.rotation.x = -Math.PI / 2;
      cell.position.set(x - hw + 0.5, 0.22, y - hh + 0.5);
      cell.userData = { x, y, isCell: true };
      scene.add(cell);
      state.cells.push(cell);

      const type = grid[y]?.[x]?.type;
      let mat = null;
      if (type === 'spawn' || type === 'base') mat = pathMat;
      else if (type === 'ground') mat = buildMat;
      else if (type === 'obstacle') mat = obstacleMat;

      if (mat) {
        tiles.get(mat).push({
          x: x - hw + 0.5,
          y: type === 'ground' ? 0.026 : 0.035,
          z: y - hh + 0.5,
          size: type === 'ground' ? 0.84 : 0.96
        });
      }
    }
  }

  const tileGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const dummy = new THREE.Object3D();
  tiles.forEach((list, mat) => {
    if (!list.length) return;
    const inst = new THREE.InstancedMesh(tileGeo, mat, list.length);
    list.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.scale.set(t.size, 1, t.size);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.renderOrder = mat === buildMat ? 2 : 3;
    // Instances span the whole board; the base geometry's bounds do not.
    inst.frustumCulled = false;
    scene.add(inst);
  });
}

export function buildLights(hw, hh) {
  const state = getState();
  const { scene, theme, themeData } = state;
  const visuals = getVisualProfile(themeData);
  const isHockey = theme === 'hockey';

  const positions = [
    [-hw - 3, -hh - 3],
    [-hw - 3,  hh + 3],
    [ hw + 3, -hh - 3],
    [ hw + 3,  hh + 3]
  ];

  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.55,
    roughness: 0.58
  });

  const fixtureGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffe4a6,
    emissive: 0xffb84d,
    emissiveIntensity: 0.32,
    roughness: 0.34,
    metalness: 0.12
  });

  const fixtureMat = new THREE.MeshStandardMaterial({
    color: 0x263143,
    metalness: 0.62,
    roughness: 0.44
  });

  // Each floodlight tower is one group so the camera can hide the whole thing
  // when it is standing next to it (see updateCamera): the default camera sits
  // almost exactly on one corner, and its tower used to fill a third of the view.
  state.cameraOccluders = [];

  positions.forEach(([x, z]) => {
    const tower = new THREE.Group();
    tower.userData.anchor = { x, z };
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 9, 10),
      poleMat
    );
    pole.position.set(x, 4.5, z);
    pole.castShadow = true;
    tower.add(pole);

    // Cross arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.14, 0.14),
      poleMat
    );
    arm.position.set(x, 9.1, z);
    tower.add(arm);

    // Light fixture housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.22, 0.8),
      fixtureMat
    );
    housing.position.set(x, 8.9, z);
    tower.add(housing);

    // Glowing lens panel
    const lens = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.08, 0.7),
      fixtureGlowMat
    );
    lens.position.set(x, 8.76, z);
    tower.add(lens);

    // Flare halo
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({
        color: visuals.lighting.accent,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(x, 8.75, z);
    tower.add(halo);

    // Visible beam through the arena haze. Part of the tower group, so it is
    // hidden along with the tower when the camera is standing inside it.
    if (getQualityName() !== 'low') tower.add(makeLightShaft(x, z, visuals.lighting.sun));

    scene.add(tower);
    state.cameraOccluders.push(tower);
  });

  // Stadium bleacher stands (simple stepped geometry)
  buildStadiumStands(hw, hh, isHockey, visuals);
  buildArenaShell(hw, hh, visuals);
}

/**
 * Build simple stadium stands around the arena for atmosphere
 */
/**
 * Texture for the far wall of the arena: tier upon tier of distant spectators
 * fading up into the dark, with the odd camera flash. Painted once to a canvas.
 */
function makeBowlTexture(accent) {
  const w = 1024;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const accentCss = '#' + new THREE.Color(accent).getHexString();

  // Canvas y runs top-down: the top of the wall is dark, the bottom is lit.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#02050b');
  sky.addColorStop(0.55, '#0a1524');
  sky.addColorStop(1, '#16263c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Tiers of seats: rows of small dots, denser and brighter lower down.
  const palette = ['#dbe7f5', '#8fb4e0', accentCss, '#f3d27a', '#e07a7a'];
  for (let row = 0; row < 26; row++) {
    const y = h - 6 - row * 8.5;
    const fade = 1 - row / 26;
    for (let x = 2; x < w; x += 6) {
      if (Math.random() > 0.72) continue;
      ctx.globalAlpha = (0.1 + Math.random() * 0.3) * fade;
      ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
      ctx.fillRect(x + Math.random() * 2, y + Math.random() * 2, 2.4, 3.2);
    }
  }

  // Balcony fronts between tiers, lit in the theme colour.
  ctx.fillStyle = accentCss;
  [h - 72, h - 150].forEach((y, i) => {
    ctx.globalAlpha = 0.5 - i * 0.2;
    ctx.fillRect(0, y, w, 2);
  });

  // Camera flashes.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 46; i++) {
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    const size = 1 + Math.random() * 2;
    ctx.fillRect(Math.random() * w, h - 10 - Math.random() * 190, size, size);
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = 4;
  return texture;
}

/** Scrolling message for the LED ribbon board that rings the stands. */
function makeRibbonTexture(accent, message) {
  const w = 2048;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const accentCss = '#' + new THREE.Color(accent).getHexString();

  ctx.fillStyle = '#060b14';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accentCss;
  ctx.fillRect(0, 0, w, 5);
  ctx.fillRect(0, h - 5, w, 5);

  ctx.font = '700 34px "Segoe UI", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  const unit = `${message}   ◆   `;
  const unitWidth = ctx.measureText(unit).width;
  // Whole repeats only, stretched to fit, so the texture tiles without a seam.
  const repeats = Math.max(1, Math.round(w / unitWidth));
  ctx.save();
  ctx.scale(w / (repeats * unitWidth), 1);
  for (let i = 0; i < repeats; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : accentCss;
    ctx.fillText(unit, i * unitWidth, h / 2 + 1);
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * Everything beyond the stands. The arena used to float in a void: no floor,
 * nothing behind the top row, and a flat background colour. This adds
 *
 *   - a concourse floor, so the stands sit on something
 *   - a back wall closing off each stand, topped by a scrolling LED ribbon board
 *   - a distant upper bowl of spectators, which gives the background depth and
 *     parallax when the camera turns
 *
 * Seven draw calls in total.
 */
function buildArenaShell(hw, hh, visuals) {
  const state = getState();
  const { scene } = state;
  const accent = visuals.lighting.accent;
  const background = new THREE.Color(visuals.map.background);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(70, 48).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: background.clone().lerp(new THREE.Color(0x24364f), 0.35), roughness: 0.95, metalness: 0 })
  );
  floor.position.y = -0.15;   // clear of the playfield at y = 0, even at low depth precision
  floor.receiveShadow = true;
  scene.add(floor);

  // Far enough out that the camera never reaches it (camera MAX_DIST is 50).
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(66, 66, 34, 48, 1, true),
    new THREE.MeshBasicMaterial({ map: makeBowlTexture(accent), side: THREE.BackSide, fog: false })
  );
  bowl.position.y = 14;
  scene.add(bowl);

  // Stand geometry, matching buildStadiumStands.
  const frontGap = 1.05;
  const standDepth = 2.5;
  const standTop = 1.8;
  const back = frontGap + standDepth + 0.12;
  const sides = [
    [0, -(hh + back), hw * 2 + 2 + 2 * back, 0],
    [0,  (hh + back), hw * 2 + 2 + 2 * back, Math.PI],
    [-(hw + back), 0, hh * 2 + 2, Math.PI / 2],
    [ (hw + back), 0, hh * 2 + 2, -Math.PI / 2]
  ];

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f1826, roughness: 0.85, metalness: 0.15 });
  const ribbonSource = makeRibbonTexture(accent, `${visuals.map.base.icon}   ◆   ${visuals.map.spawn.icon} INCOMING`);
  const ribbonHeight = 0.6;
  const ribbons = [];

  sides.forEach(([x, z, width, rotY]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, standTop + 0.1, 0.24), wallMat);
    wall.position.set(x, (standTop + 0.1) / 2, z);
    wall.rotation.y = rotY;
    scene.add(wall);

    const texture = ribbonSource.clone();
    texture.needsUpdate = true;
    // Keep the lettering the same size on the long and short sides.
    texture.repeat.x = width / (ribbonHeight * (2048 / 64));
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(width, ribbonHeight),
      new THREE.MeshBasicMaterial({ map: texture, fog: false })
    );
    // Plane faces +Z by default; each rotY above turns it to face the rink.
    ribbon.position.set(x + Math.sin(rotY) * 0.13, standTop + 0.1 + ribbonHeight / 2, z + Math.cos(rotY) * 0.13);
    ribbon.rotation.y = rotY;
    scene.add(ribbon);
    ribbons.push(texture);
  });

  // Scroll the message. Tied to the game clock so it stops when paused.
  floor.onBeforeRender = () => {
    const offset = (getState().animTime || 0) * 0.03;
    for (const texture of ribbons) texture.offset.x = offset;
  };
}

/**
 * A soft shaft of light from a floodlight down onto the playfield.
 * @returns {THREE.Mesh}
 */
function makeLightShaft(x, z, color) {
  const from = new THREE.Vector3(x, 8.7, z);
  const to = new THREE.Vector3(x * 0.3, 0, z * 0.3);
  const length = from.distanceTo(to);

  const shaft = new THREE.Mesh(
    // Cone apex is at +Y: the narrow end sits at the lamp.
    new THREE.ConeGeometry(4.2, length, 20, 1, true),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.03,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false
    })
  );
  shaft.position.copy(from).add(to).multiplyScalar(0.5);
  shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), from.clone().sub(to).normalize());
  shaft.renderOrder = 5;
  return shaft;
}

/**
 * Make an instanced crowd material sway on the GPU.
 *
 * Each spectator bobs on their own phase, and a slow "stadium wave" travels
 * round the stands. It is all done in the vertex shader from the instance's
 * world position, so a few hundred animated spectators cost no CPU and no
 * per-frame buffer uploads.
 */
function animateCrowdMaterial(material, mesh, lift) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCrowdTime = { value: 0 };
    material.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uCrowdTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 crowdPos = instanceMatrix[3].xyz;
          float crowdPhase = crowdPos.x * 1.7 + crowdPos.z * 2.3;
          float crowdBob = sin(uCrowdTime * 3.2 + crowdPhase) * 0.5 + 0.5;
          float crowdWave = pow(max(0.0, sin(uCrowdTime * 0.9 - atan(crowdPos.z, crowdPos.x) * 2.0)), 10.0);
          transformed.y += (crowdBob * 0.035 + crowdWave * 0.2) * ${lift.toFixed(2)};
        #endif`
      );
  };
  // Driven by the game's animation clock, not wall time, so the crowd freezes
  // with everything else when the game is paused.
  mesh.onBeforeRender = () => {
    const shader = material.userData.shader;
    if (shader) shader.uniforms.uCrowdTime.value = getState().animTime || 0;
  };
}

function buildStadiumStands(hw, hh, isHockey, visuals) {
  const state = getState();
  const { scene } = state;

  const standDepth = 2.5;
  const rowCount   = 4;
  const rowHeight  = 0.45;
  const rowDepth   = standDepth / rowCount;

  // Supporters' colours.
  const fanColors = visuals.crowd?.fans ? visuals.crowd.fans : isHockey
    ? [0x1d6fd1, 0x123c6b, 0xd42f2f, 0xfacc15, 0xf1f5f9]
    : [visuals.lighting.accent, visuals.map.floor.meshColor || 0x1a5c1a, 0xcc8800, 0xf1f5f9];
  const skinTones = [0xf1c9a5, 0xe0ac7e, 0xc68642, 0x8d5524, 0xffdbac];
  const seatColor = visuals.crowd?.seat ?? (isHockey ? 0x16304f : 0x1c2433);
  // Fraction of seats filled. The gaps matter: a 100% full stand reads as a texture.
  const OCCUPANCY = 0.86;

  const frontGap = 1.05;

  // Define stands by their front edge. Local +Z points outward from the rink.
  const sides = [
    // [frontX, frontZ, width, rotY]
    [0, -(hh + frontGap), hw * 2 + 2, Math.PI],
    [0,  (hh + frontGap), hw * 2 + 2, 0],
    [-(hw + frontGap), 0, hh * 2 + 2, Math.PI / 2],
    [ (hw + frontGap), 0, hh * 2 + 2, -Math.PI / 2]
  ];

  const transformStandPoint = (frontX, frontZ, localX, localZ, rotY) => {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    return [
      frontX + localX * cosR - localZ * sinR,
      frontZ + localX * sinR + localZ * cosR
    ];
  };

  const stepMat = new THREE.MeshStandardMaterial({ color: 0x162133, roughness: 0.9, metalness: 0.1 });
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0x25364a, roughness: 0.7, metalness: 0.2 });

  // Every seat and spectator in the arena, collected first so the whole crowd
  // can be drawn as three instanced meshes (it was ~500 separate ones).
  const seats = [];
  const fans = [];

  sides.forEach(([frontX, frontZ, sideWidth, rotY]) => {
    const seatsPerRow = Math.floor(sideWidth / 0.6);
    const seatW = sideWidth / seatsPerRow;

    for (let row = 0; row < rowCount; row++) {
      const y = row * rowHeight + rowHeight / 2;
      const localZ = row * rowDepth + rowDepth * 0.5;

      // Stepped platform
      const step = new THREE.Mesh(new THREE.BoxGeometry(sideWidth, rowHeight, rowDepth), stepMat);
      step.receiveShadow = true;
      const [stepX, stepZ] = transformStandPoint(frontX, frontZ, 0, localZ, rotY);
      step.position.set(stepX, y, stepZ);
      step.rotation.y = rotY;
      scene.add(step);

      for (let s = 0; s < seatsPerRow; s++) {
        const localX = -sideWidth / 2 + s * seatW + seatW / 2;
        const [seatX, seatZ] = transformStandPoint(frontX, frontZ, localX, localZ, rotY);
        const seatY = y + rowHeight * 0.2;
        seats.push({ x: seatX, y: seatY, z: seatZ, rotY, w: seatW * 0.72 });

        if (Math.random() < OCCUPANCY) {
          fans.push({
            x: seatX,
            y: seatY + rowHeight * 0.3,
            z: seatZ,
            // Nobody sits perfectly square to the ice.
            rotY: rotY + (Math.random() - 0.5) * 0.5,
            height: 0.85 + Math.random() * 0.35,
            color: fanColors[Math.floor(Math.random() * fanColors.length)],
            skin: skinTones[Math.floor(Math.random() * skinTones.length)]
          });
        }
      }
    }

    // Concrete barrier at front of stand
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(sideWidth, 0.5, 0.2), barrierMat);
    barrier.castShadow = true;
    barrier.receiveShadow = true;
    barrier.position.set(frontX, 0.25, frontZ);
    barrier.rotation.y = rotY;
    scene.add(barrier);
  });

  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();

  const seatMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, rowHeight * 0.55, rowDepth * 0.6),
    new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.8, metalness: 0.05 }),
    seats.length
  );
  seats.forEach((seat, i) => {
    dummy.position.set(seat.x, seat.y, seat.z);
    dummy.rotation.set(0, seat.rotY, 0);
    dummy.scale.set(seat.w, 1, 1);
    dummy.updateMatrix();
    seatMesh.setMatrixAt(i, dummy.matrix);
  });
  seatMesh.receiveShadow = true;
  seatMesh.frustumCulled = false;
  scene.add(seatMesh);

  if (!fans.length) return;

  // A tapered torso plus shoulders and a faceted head: about 30 triangles per
  // spectator. At stand distance the silhouette is all that reads.
  const bodyGeo = composeGeometry([
    { geo: new THREE.CylinderGeometry(0.1, 0.15, 0.3, 6), p: [0, 0.15, 0] },
    { geo: new THREE.BoxGeometry(0.34, 0.07, 0.12), p: [0, 0.27, 0] }
  ]);
  const headGeo = new THREE.IcosahedronGeometry(0.085, 0).translate(0, 0.4, 0);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0 });
  const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, fans.length);
  const heads = new THREE.InstancedMesh(headGeo, headMat, fans.length);

  fans.forEach((fan, i) => {
    dummy.position.set(fan.x, fan.y, fan.z);
    dummy.rotation.set(0, fan.rotY, 0);
    dummy.scale.set(1, fan.height, 1);
    dummy.updateMatrix();
    bodies.setMatrixAt(i, dummy.matrix);
    heads.setMatrixAt(i, dummy.matrix);
    bodies.setColorAt(i, tint.setHex(fan.color));
    heads.setColorAt(i, tint.setHex(fan.skin));
  });

  [bodies, heads].forEach((mesh) => {
    mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    scene.add(mesh);
  });
  animateCrowdMaterial(bodyMat, bodies, 1);
  animateCrowdMaterial(headMat, heads, 1);
}

export function addPerimeterDecor(hw, hh) {
  const state = getState();
  const { theme, scene, themeData } = state;
  const visuals = getVisualProfile(themeData);
  const isHockey = theme === 'hockey';
  const isSoccer = theme === 'soccer';

  const ring = [];
  const pad = 1.6;

  for (let x = -hw - pad; x <= hw + pad; x += 1.2) {
    ring.push([x, -hh - pad]);
    ring.push([x,  hh + pad]);
  }
  for (let z = -hh - pad; z <= hh + pad; z += 1.2) {
    ring.push([-hw - pad, z]);
    ring.push([ hw + pad, z]);
  }

  const place = (wx, wz) => {
    if (isHockey) {
      const kind = Math.floor(Math.random() * 4);
      if (kind === 0) {
        for (let i = 0; i < 3; i++) {
          const puck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.05, 18),
            new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7, metalness: 0.05 })
          );
          puck.position.set(wx, 0.08 + i * 0.055, wz);
          puck.castShadow = true;
          scene.add(puck);
        }
      } else if (kind === 1) {
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.65, 10),
          new THREE.MeshStandardMaterial({ color: 0xcaa472, roughness: 0.85 })
        );
        shaft.rotation.z = Math.random() * Math.PI;
        shaft.position.set(wx, 0.14, wz);
        shaft.castShadow = true;
        scene.add(shaft);

        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.04, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 })
        );
        blade.position.set(wx + 0.18, 0.08, wz + 0.05);
        blade.castShadow = true;
        scene.add(blade);
      } else if (kind === 2) {
        const helm = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
          new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6, metalness: 0.1 })
        );
        helm.position.set(wx, 0.20, wz);
        helm.castShadow = true;
        scene.add(helm);
      } else {
        const glove = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.16, 0.22),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
        );
        glove.position.set(wx, 0.14, wz);
        glove.rotation.y = Math.random() * Math.PI;
        glove.castShadow = true;
        scene.add(glove);
      }
    } else if (isSoccer) {
      const kind = Math.floor(Math.random() * 4);
      if (kind === 0) {
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65, metalness: 0.05 })
        );
        ball.position.set(wx, 0.18, wz);
        ball.castShadow = true;
        scene.add(ball);

        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.15, 0.02, 10, 18),
          new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 })
        );
        band.rotation.x = Math.PI / 2;
        band.position.set(wx, 0.18, wz);
        band.castShadow = true;
        scene.add(band);
      } else if (kind === 1) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.40, 12),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.65, metalness: 0.05 })
        );
        cone.position.set(wx, 0.20, wz);
        cone.castShadow = true;
        scene.add(cone);
      } else if (kind === 2) {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.60, 10),
          new THREE.MeshStandardMaterial({ color: 0xcfd3df, metalness: 0.8, roughness: 0.2 })
        );
        pole.position.set(wx, 0.30, wz);
        pole.castShadow = true;
        scene.add(pole);

        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.26, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65, side: THREE.DoubleSide })
        );
        flag.position.set(wx + 0.12, 0.50, wz);
        flag.rotation.y = Math.PI / 2;
        scene.add(flag);
      } else {
        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.12, 0.16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.65, metalness: 0.05 })
        );
        shoe.position.set(wx, 0.12, wz);
        shoe.rotation.y = Math.random() * Math.PI;
        shoe.castShadow = true;
        scene.add(shoe);
      }
    } else {
      const kind = Math.floor(Math.random() * 4);
      const neon = new THREE.MeshStandardMaterial({
        color: visuals.lighting.accent,
        emissive: visuals.lighting.accent,
        emissiveIntensity: 0.65,
        roughness: 0.35,
        metalness: 0.4
      });
      const dark = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45, metalness: 0.7 });
      if (kind === 0) {
        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), dark);
        pylon.position.set(wx, 0.4, wz);
        scene.add(pylon);
        const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), neon);
        cap.position.set(wx, 0.88, wz);
        scene.add(cap);
      } else if (kind === 1) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.44), dark);
        crate.position.set(wx, 0.16, wz);
        crate.rotation.y = Math.random() * Math.PI;
        scene.add(crate);
      } else if (kind === 2) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 24), neon);
        ring.position.set(wx, 0.26, wz);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
      } else {
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), dark);
        antenna.position.set(wx, 0.35, wz);
        scene.add(antenna);
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), neon);
        dot.position.set(wx, 0.75, wz);
        scene.add(dot);
      }
    }
  };

  for (let i = 0; i < ring.length; i++) {
    if (Math.random() < 0.24) {
      place(ring[i][0] + (Math.random() - 0.5) * 0.25, ring[i][1] + (Math.random() - 0.5) * 0.25);
    }
  }

}
