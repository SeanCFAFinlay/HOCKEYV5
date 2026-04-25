// Spawn and base marker rendering

import { getState } from '../engine/state.js';
import { makeTextSprite } from './sprites.js';
import { getVisualProfile } from '../config/visual-profiles.js';

export function addSpawnAndPenVisuals(hw, hh) {
  const state = getState();
  const { theme, SPAWNS, BASE, scene, themeData } = state;
  const visuals = getVisualProfile(themeData);

  if (!Array.isArray(SPAWNS) || !BASE) return;

  const isHockey = theme === 'hockey';

  const spawnRingMat = new THREE.MeshStandardMaterial({
    color: visuals.map.spawn.color,
    roughness: 0.35,
    metalness: 0.35,
    emissive: 0x220000
  });
  const spawnCoreMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.55,
    metalness: 0.45,
    emissive: 0x05070a
  });

  const baseMat = new THREE.MeshStandardMaterial({
    color: visuals.map.base.color,
    roughness: 0.35,
    metalness: 0.40,
    emissive: 0x241a00
  });
  const netMat = new THREE.MeshStandardMaterial({
      color: theme === 'space' ? 0x67e8f9 : 0xffffff,
    roughness: 0.85,
    metalness: 0.02
  });

  function makeGoal() {
    const g = new THREE.Group();
    const w = 1.2, h = 0.75, d = 0.45;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, 0.07), baseMat);
    frame.position.set(0, h, 0);
    frame.castShadow = true;
    g.add(frame);

    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), baseMat);
    postL.position.set(-w / 2, h / 2, 0);
    postL.castShadow = true;
    g.add(postL);

    const postR = postL.clone();
    postR.position.x = w / 2;
    g.add(postR);

    const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, 0.07), baseMat);
    back.position.set(0, h, -d);
    back.castShadow = true;
    g.add(back);

    const net = new THREE.Mesh(new THREE.PlaneGeometry(w, h), netMat);
    net.position.set(0, h / 2, -d / 2);
    net.rotation.y = Math.PI;
    net.receiveShadow = true;
    g.add(net);

    if (isHockey) {
      const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 24), spawnCoreMat);
      puck.rotation.x = Math.PI / 2;
      puck.position.set(0, 0.06, 0.12);
      puck.castShadow = true;
      g.add(puck);
    } else {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), spawnCoreMat);
      ball.position.set(0, 0.18, 0.12);
      ball.castShadow = true;
      g.add(ball);
    }

    return g;
  }

  // Spawn portals
  for (const s of SPAWNS) {
    const wx = s.x - hw + 0.5;
    const wz = s.y - hh + 0.5;

    const grp = new THREE.Group();
    grp.position.set(wx, 0, wz);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 18, 44), spawnRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    ring.castShadow = true;
    grp.add(ring);

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 28), spawnCoreMat);
    core.position.y = 0.06;
    core.castShadow = true;
    grp.add(core);

    const spr = makeTextSprite(visuals.map.spawn.icon || 'ENEMY', { font: 'bold 46px system-ui', bg: 'rgba(0,0,0,0.45)' });
    spr.position.set(0, 1.05, 0);
    spr.scale.set(1.4, 0.7, 1);
    grp.add(spr);

    scene.add(grp);
  }

  // Base / defender end
  {
    const wx = BASE.x - hw + 0.5;
    const wz = BASE.y - hh + 0.5;

    const grp = new THREE.Group();
    grp.position.set(wx, 0, wz);

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 28), baseMat);
    plate.position.y = 0.06;
    plate.castShadow = true;
    grp.add(plate);

    const goal = makeGoal();
    goal.position.set(0, 0.12, -0.15);
    goal.castShadow = true;
    grp.add(goal);

    const spr = makeTextSprite(visuals.map.base.icon || (isHockey ? 'DEFEND HOCKEY' : 'DEFEND'), { font: 'bold 46px system-ui', bg: 'rgba(0,0,0,0.45)' });
    spr.position.set(0, 1.15, 0);
    spr.scale.set(1.6, 0.75, 1);
    grp.add(spr);

    scene.add(grp);
  }
}
