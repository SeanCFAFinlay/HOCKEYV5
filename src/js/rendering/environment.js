// Environment rendering - cells, lights, perimeter decor

import { getState } from '../engine/state.js';

export function buildCells(hw, hh) {
  const state = getState();
  const { COLS, ROWS, scene } = state;

  state.cells = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      cell.rotation.x = -Math.PI / 2;
      cell.position.set(x - hw + 0.5, 0.22, y - hh + 0.5);
      cell.userData = { x, y, isCell: true };
      scene.add(cell);
      state.cells.push(cell);
    }
  }
}

export function buildLights(hw, hh) {
  const state = getState();
  const { scene } = state;

  const positions = [
    [-hw - 3, -hh - 3],
    [-hw - 3, hh + 3],
    [hw + 3, -hh - 3],
    [hw + 3, hh + 3]
  ];

  positions.forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
    pole.position.set(x, 4, z);
    scene.add(pole);

    const light = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 1.4),
      new THREE.MeshBasicMaterial({ color: 0xffffdd })
    );
    light.position.set(x, 8.15, z);
    scene.add(light);
  });
}

export function addPerimeterDecor(hw, hh) {
  const state = getState();
  const { theme, scene } = state;
  const isHockey = theme === 'hockey';

  const ring = [];
  const pad = 1.6;

  for (let x = -hw - pad; x <= hw + pad; x += 1.2) {
    ring.push([x, -hh - pad]);
    ring.push([x, hh + pad]);
  }
  for (let z = -hh - pad; z <= hh + pad; z += 1.2) {
    ring.push([-hw - pad, z]);
    ring.push([hw + pad, z]);
  }

  const place = (wx, wz) => {
    if (isHockey) {
      const kind = Math.floor(Math.random() * 4);
      if (kind === 0) {
        // Stack of pucks
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
        // Mini stick
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
        // Helmet
        const helm = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 })
        );
        helm.position.set(wx, 0.20, wz);
        helm.castShadow = true;
        scene.add(helm);
      } else {
        // Glove
        const glove = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.16, 0.22),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
        );
        glove.position.set(wx, 0.14, wz);
        glove.rotation.y = Math.random() * Math.PI;
        glove.castShadow = true;
        scene.add(glove);
      }
    } else {
      const kind = Math.floor(Math.random() * 4);
      if (kind === 0) {
        // Soccer ball
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
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
        // Cone
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.40, 12),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.65 })
        );
        cone.position.set(wx, 0.20, wz);
        cone.castShadow = true;
        scene.add(cone);
      } else if (kind === 2) {
        // Corner flag
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
        // Cleat
        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.12, 0.16),
          new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.65 })
        );
        shoe.position.set(wx, 0.12, wz);
        shoe.rotation.y = Math.random() * Math.PI;
        shoe.castShadow = true;
        scene.add(shoe);
      }
    }
  };

  // Place a subset
  for (let i = 0; i < ring.length; i++) {
    if (Math.random() < 0.24) {
      place(ring[i][0] + (Math.random() - 0.5) * 0.25, ring[i][1] + (Math.random() - 0.5) * 0.25);
    }
  }
}
