// Environment rendering - cells, lights, perimeter decor, and stadium stands

import { getState } from '../engine/state.js';
import { getVisualProfile } from '../config/visual-profiles.js';

export function buildCells(hw, hh) {
  const state = getState();
  const { COLS, ROWS, scene, grid, themeData } = state;
  const visuals = getVisualProfile(themeData);

  state.cells = [];

  const rayGeo = new THREE.PlaneGeometry(1, 1);
  const rayMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
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
        const visual = new THREE.Mesh(new THREE.PlaneGeometry(type === 'ground' ? 0.84 : 0.96, type === 'ground' ? 0.84 : 0.96), mat);
        visual.rotation.x = -Math.PI / 2;
        visual.position.set(x - hw + 0.5, type === 'ground' ? 0.026 : 0.035, y - hh + 0.5);
        visual.renderOrder = type === 'ground' ? 2 : 3;
        scene.add(visual);
      }
    }
  }
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
    color: 0x2a2a3a,
    metalness: 0.7,
    roughness: 0.4
  });

  const fixtureGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e0,
    emissive: 0xfff8e0,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.3
  });

  const fixtureMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.8,
    roughness: 0.3
  });

  positions.forEach(([x, z]) => {
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 9, 10),
      poleMat
    );
    pole.position.set(x, 4.5, z);
    pole.castShadow = true;
    scene.add(pole);

    // Cross arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.14, 0.14),
      poleMat
    );
    arm.position.set(x, 9.1, z);
    scene.add(arm);

    // Light fixture housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.22, 0.8),
      fixtureMat
    );
    housing.position.set(x, 8.9, z);
    scene.add(housing);

    // Glowing lens panel
    const lens = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.08, 0.7),
      fixtureGlowMat
    );
    lens.position.set(x, 8.76, z);
    scene.add(lens);

    // Flare halo
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({
        color: visuals.lighting.accent,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(x, 8.75, z);
    scene.add(halo);
  });

  // Stadium bleacher stands (simple stepped geometry)
  buildStadiumStands(hw, hh, isHockey, visuals);
}

/**
 * Build simple stadium stands around the arena for atmosphere
 */
function buildStadiumStands(hw, hh, isHockey, visuals) {
  const state = getState();
  const { scene } = state;

  const standDepth = 2.5;
  const rowCount   = 4;
  const rowHeight  = 0.45;
  const rowDepth   = standDepth / rowCount;

  // Seat colors – alternating accent colors
  const seatColors = isHockey
    ? [0x1a3a6e, 0x0d2050, 0xcc1111, 0x0a1838]
    : [visuals.lighting.accent, visuals.map.floor.meshColor || 0x1a5c1a, 0xcc8800, 0x103010];

  // Define stands on all 4 sides
  const sides = [
    // [centerX, centerZ, width, rotY]
    [0,      -(hh + 1.5 + standDepth / 2), hw * 2 + 2, 0          ],
    [0,       (hh + 1.5 + standDepth / 2), hw * 2 + 2, Math.PI    ],
    [-(hw + 1.5 + standDepth / 2), 0,      hh * 2 + 2, Math.PI / 2],
    [ (hw + 1.5 + standDepth / 2), 0,      hh * 2 + 2, -Math.PI / 2]
  ];

  sides.forEach(([cx, cz, sideWidth, rotY]) => {
    for (let row = 0; row < rowCount; row++) {
      const y     = row * rowHeight + rowHeight / 2;
      const depth = rowDepth;

      // Stepped platform
      const stepMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1
      });
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(sideWidth, rowHeight, depth),
        stepMat
      );
      step.receiveShadow = true;
      scene.add(step);

      // Seat row – randomize individual seat colors for crowd feel
      const seatsPerRow = Math.floor(sideWidth / 0.6);
      const seatW = sideWidth / seatsPerRow;

      for (let s = 0; s < seatsPerRow; s++) {
        const colorIdx = Math.floor(Math.random() * seatColors.length);
        const seatMat = new THREE.MeshStandardMaterial({
          color: seatColors[colorIdx],
          roughness: 0.8,
          metalness: 0.05
        });
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(seatW * 0.72, rowHeight * 0.55, depth * 0.6),
          seatMat
        );
        seat.castShadow = false;
        seat.receiveShadow = true;

        // Position in local stand space, then transform
        const localX = -sideWidth / 2 + s * seatW + seatW / 2;
        const localY = y + rowHeight * 0.2;
        const localZ = row * rowDepth;

        const cosR = Math.cos(rotY);
        const sinR = Math.sin(rotY);

        seat.position.set(
          cx + localX * cosR - localZ * sinR,
          localY,
          cz + localX * sinR + localZ * cosR
        );
        seat.rotation.y = rotY;
        scene.add(seat);
      }

      // Position the step platform
      const localZ = row * rowDepth;
      const cosR = Math.cos(rotY);
      const sinR = Math.sin(rotY);
      step.position.set(
        cx - localZ * sinR,
        y,
        cz + localZ * cosR
      );
      step.rotation.y = rotY;
    }

    // Concrete barrier at front of stand
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      roughness: 0.7,
      metalness: 0.2
    });
    const barrier = new THREE.Mesh(
      new THREE.BoxGeometry(sideWidth, 0.5, 0.2),
      barrierMat
    );
    barrier.castShadow = true;
    barrier.receiveShadow = true;
    barrier.position.set(cx, 0.25, cz);
    barrier.rotation.y = rotY;
    scene.add(barrier);
  });
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
