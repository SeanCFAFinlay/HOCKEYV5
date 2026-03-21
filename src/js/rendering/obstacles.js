// Obstacle visual rendering

import { getState } from '../engine/state.js';
import { hash2 } from '../utils/rng.js';

export function addObstacleVisuals(hw, hh) {
  const state = getState();
  const { theme, mapIndex, grid, ROWS, COLS, scene } = state;
  const isHockey = theme === 'hockey';
  const themeSalt = isHockey ? 17 : 29;
  const seed = ((mapIndex + 1) * 10007 + themeSalt) >>> 0;

  const baseY = 0.12;

  const mat = {
    metal: new THREE.MeshStandardMaterial({ color: 0xcfd3df, roughness: 0.25, metalness: 0.85 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xcaa472, roughness: 0.75, metalness: 0.05 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.65, metalness: 0.05 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.02 }),
    ice: new THREE.MeshStandardMaterial({ color: 0x7fe9ff, roughness: 0.35, metalness: 0.20 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.65, metalness: 0.05 }),
    red: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.55, metalness: 0.10 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.35 })
  };

  const jitter = (x, y, mag = 0.07) => (hash2(x, y, seed) - 0.5) * 2 * mag;

  function hockeyProp(kind) {
    const g = new THREE.Group();

    if (kind === 0) {
      // Hockey stick + puck
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 12), mat.wood);
      shaft.rotation.z = Math.PI / 2;
      shaft.position.set(0, 0.34, 0);
      g.add(shaft);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.10), mat.rubber);
      blade.position.set(0.55, 0.14, 0);
      g.add(blade);
      const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 18), mat.rubber);
      puck.position.set(0.35, 0.10, 0.10);
      g.add(puck);
    } else if (kind === 1) {
      // Skate
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.28), mat.ice);
      boot.position.y = 0.30;
      boot.position.x = -0.05;
      g.add(boot);
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), mat.ice);
      toe.position.set(0.28, 0.30, 0);
      g.add(toe);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.10), mat.metal);
      blade.position.set(0, 0.11, 0);
      g.add(blade);
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.02, 0.12), mat.metal);
      blade2.position.set(0, 0.09, 0);
      g.add(blade2);
    } else if (kind === 2) {
      // Helmet + visor
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.70), mat.red);
      helm.position.y = 0.45;
      g.add(helm);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 10, 26), mat.rubber);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 0.36, 0.18);
      g.add(rim);
      const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.22), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.0 }));
      visor.position.set(0, 0.40, 0.20);
      g.add(visor);
    } else if (kind === 3) {
      // Cones + tape roll
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 14), mat.gold);
      cone.position.y = 0.30;
      g.add(cone);
      const tape = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 10, 18), mat.white);
      tape.rotation.x = Math.PI / 2;
      tape.position.set(0.20, 0.14, 0.10);
      g.add(tape);
    } else {
      // Goal frame chunk
      const postMat = mat.red;
      const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.0, transparent: true, opacity: 0.35, wireframe: true });
      const postH = 0.55, postW = 0.62, depth = 0.35;
      const postGeo = new THREE.CylinderGeometry(0.03, 0.03, postH, 10);
      const p1 = new THREE.Mesh(postGeo, postMat);
      p1.position.set(-depth * 0.5, postH / 2, -postW / 2);
      const p2 = new THREE.Mesh(postGeo, postMat);
      p2.position.set(-depth * 0.5, postH / 2, postW / 2);
      g.add(p1);
      g.add(p2);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, postW, 10), postMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(-depth * 0.5, postH, 0);
      g.add(bar);
      const net = new THREE.Mesh(new THREE.BoxGeometry(depth, postH, postW), netMat);
      net.position.set(0, postH / 2, 0);
      g.add(net);
    }

    g.scale.setScalar(1.18);
    return g;
  }

  function soccerProp(kind) {
    const g = new THREE.Group();

    if (kind === 0) {
      // Soccer ball on stand
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), mat.white);
      ball.position.y = 0.35;
      g.add(ball);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 10, 24), mat.rubber);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.35;
      g.add(band);
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.16, 0.18, 12), mat.grass);
      stand.position.y = 0.10;
      g.add(stand);
    } else if (kind === 1) {
      // Cleat
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.22, 0.30), mat.red);
      shoe.position.y = 0.24;
      g.add(shoe);
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), mat.red);
      toe.position.set(0.34, 0.24, 0);
      g.add(toe);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.32), mat.rubber);
      sole.position.y = 0.11;
      g.add(sole);
      for (let i = -2; i <= 2; i++) {
        const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), mat.rubber);
        stud.position.set(i * 0.12, 0.06, (i % 2 === 0 ? 0.10 : -0.10));
        g.add(stud);
      }
    } else if (kind === 2) {
      // Corner flag
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 10), mat.metal);
      pole.position.y = 0.47;
      g.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.28), mat.gold);
      flag.position.set(0.20, 0.75, 0);
      flag.rotation.y = Math.PI / 2;
      g.add(flag);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 12), mat.grass);
      base.position.y = 0.06;
      g.add(base);
    } else if (kind === 3) {
      // Whistle + lanyard
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.28), mat.white);
      body.position.y = 0.26;
      g.add(body);
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.30, 12), mat.rubber);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(0.14, 0.26, 0);
      g.add(hole);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 10, 20), mat.metal);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.18, 0.33, 0);
      g.add(ring);
    } else {
      // Mini goal / net
      const postMat = mat.white;
      const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.0, transparent: true, opacity: 0.30, wireframe: true });
      const postH = 0.60, postW = 0.78, depth = 0.40;
      const postGeo = new THREE.CylinderGeometry(0.03, 0.03, postH, 10);
      const p1 = new THREE.Mesh(postGeo, postMat);
      p1.position.set(-depth * 0.5, postH / 2, -postW / 2);
      const p2 = new THREE.Mesh(postGeo, postMat);
      p2.position.set(-depth * 0.5, postH / 2, postW / 2);
      g.add(p1);
      g.add(p2);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, postW, 10), postMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(-depth * 0.5, postH, 0);
      g.add(bar);
      const net = new THREE.Mesh(new THREE.BoxGeometry(depth, postH, postW), netMat);
      net.position.set(0, postH / 2, 0);
      g.add(net);
    }

    g.scale.setScalar(1.18);
    return g;
  }

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x].type !== 'obstacle') continue;

      const r = hash2(x, y, seed);
      const kind = Math.floor(r * 5);

      const wx = x - hw + 0.5;
      const wz = y - hh + 0.5;

      const prop = isHockey ? hockeyProp(kind) : soccerProp(kind);
      prop.position.set(wx + jitter(x, y, 0.06), baseY, wz + jitter(y, x, 0.06));
      prop.rotation.y = (hash2(y, x, seed + 1234) - 0.5) * 0.6;
      prop.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      scene.add(prop);
    }
  }
}
