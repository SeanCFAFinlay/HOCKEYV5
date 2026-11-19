// Environment rendering - cells, lights, perimeter decor, and stadium stands

import { getState } from '../engine/state.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { getQualityName } from './quality.js';
import { BOARD, buildBoardSurface } from './board.js';
import { buildStands, buildSkyBoxes } from './crowd.js';
import { buildArenaDetails } from './arena-details.js';

// Stands start beyond the moat that surrounds the board slab.
const STAND_GAP = BOARD.EDGE + BOARD.MOAT + 0.12;

export function buildCells(hw, hh) {
  const state = getState();
  const { COLS, ROWS, scene } = state;

  state.cells = [];

  const rayGeo = new THREE.PlaneGeometry(1, 1);
  // Pick targets only. `visible: false` on the material keeps them out of the
  // render list entirely (they were 198 fully transparent draw calls) while
  // Raycaster, which ignores material visibility, still hits them.
  const rayMat = new THREE.MeshBasicMaterial({ visible: false });

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = new THREE.Mesh(rayGeo, rayMat);
      cell.rotation.x = -Math.PI / 2;
      cell.position.set(x - hw + 0.5, 0.22, y - hh + 0.5);
      cell.userData = { x, y, isCell: true };
      scene.add(cell);
      state.cells.push(cell);
    }
  }

  // The visible grid: a raised, bevelled tile per cell (see board.js). It
  // replaces the flat translucent overlays that used to tint each cell.
  buildBoardSurface(hw, hh);
}

export function buildLights(hw, hh) {
  const state = getState();
  const { scene, themeData } = state;
  const visuals = getVisualProfile(themeData);

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

  // Stands and crowd (rendering/crowd.js), then what lies beyond them.
  buildStands(hw, hh, visuals, STAND_GAP);
  buildArenaShell(hw, hh, visuals);

  // Markings, benches, glass and the rest of what makes each arena the real
  // place. Last, because it adds to the camera's list of things to hide.
  buildArenaDetails(hw, hh);
}

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

  // A disc with the moat cut out of it, so the board slab stands in a trench.
  const disc = new THREE.Shape();
  disc.absarc(0, 0, 70, 0, Math.PI * 2, false);
  const mx = hw + BOARD.EDGE + BOARD.MOAT + 0.1;
  const mz = hh + BOARD.EDGE + BOARD.MOAT + 0.1;
  const moat = new THREE.Path();
  moat.moveTo(-mx, -mz);
  moat.lineTo(-mx, mz);
  moat.lineTo(mx, mz);
  moat.lineTo(mx, -mz);
  moat.closePath();
  disc.holes.push(moat);

  const floor = new THREE.Mesh(
    new THREE.ShapeGeometry(disc, 48).rotateX(-Math.PI / 2),
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
  const frontGap = STAND_GAP;
  const standDepth = 2.5;
  const standTop = 1.8;
  const back = frontGap + standDepth + 0.12;
  const sides = [
    [0, -(hh + back), hw * 2 + 2 * back, 0],
    [0,  (hh + back), hw * 2 + 2 * back, Math.PI],
    [-(hw + back), 0, hh * 2 + 2 * back, Math.PI / 2],
    [ (hw + back), 0, hh * 2 + 2 * back, -Math.PI / 2]
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

  // A row of lit boxes above the ribbon, with people at the glass.
  if (getQualityName() !== 'low') buildSkyBoxes(sides, standTop + 0.1 + ribbonHeight, accent);

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
