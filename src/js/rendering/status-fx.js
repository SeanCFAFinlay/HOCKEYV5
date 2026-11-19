// Status effect visuals: what a chilled, frozen, burning, shocked or marked
// enemy looks like.
//
// Enemy materials are shared between enemies, so an enemy cannot simply be
// tinted. Each affected enemy instead gets a small group of overlay meshes
// that follows it: an ice block, flames, crackling arcs, a frost ring, a
// target mark. The group lives in the scene (not inside the enemy's mesh), so
// it is untouched by the enemy's hit-punch scaling and by mesh disposal.
//
// Geometry and materials are created once and shared by every enemy.

import { getState } from '../engine/state.js';

let shared = null;

function assets() {
  if (shared) return shared;
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

  // A jagged arc: three thin boxes end to end, kinked.
  const arc = new THREE.BufferGeometry();
  {
    const pts = [[-0.9, 0.1, 0], [-0.3, -0.25, 0.1], [0.25, 0.3, -0.1], [0.9, -0.05, 0]];
    const pos = [];
    const w = 0.15;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      // Two crossed quads per segment so the arc has width from any angle.
      pos.push(
        a[0], a[1] - w, a[2], b[0], b[1] - w, b[2], b[0], b[1] + w, b[2],
        a[0], a[1] - w, a[2], b[0], b[1] + w, b[2], a[0], a[1] + w, a[2],
        a[0], a[1], a[2] - w, b[0], b[1], b[2] - w, b[0], b[1], b[2] + w,
        a[0], a[1], a[2] - w, b[0], b[1], b[2] + w, a[0], a[1], a[2] + w
      );
    }
    arc.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  }

  shared = {
    geo: {
      ice: new THREE.IcosahedronGeometry(1, 0),
      spike: new THREE.ConeGeometry(0.28, 1, 4),
      flame: new THREE.ConeGeometry(0.34, 1, 6).translate(0, 0.5, 0),
      ring: new THREE.RingGeometry(0.82, 1.08, 28).rotateX(-Math.PI / 2),
      flake: new THREE.OctahedronGeometry(0.13, 0),
      arc,
      mark: new THREE.TorusGeometry(0.62, 0.09, 6, 24).rotateX(Math.PI / 2),
      tick: new THREE.BoxGeometry(0.5, 0.1, 0.1),
      glow: new THREE.SphereGeometry(1, 12, 8)
    },
    mat: {
      ice: new THREE.MeshStandardMaterial({
        color: 0xc8f2ff, emissive: 0x4fb8ff, emissiveIntensity: 0.35,
        roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.72,
        flatShading: true, depthWrite: false
      }),
      frost: new THREE.MeshBasicMaterial({ color: 0x9be8ff, opacity: 0.55, side: THREE.DoubleSide, ...add }),
      flake: new THREE.MeshBasicMaterial({ color: 0xe6fbff, opacity: 0.9, ...add }),
      flameOuter: new THREE.MeshBasicMaterial({ color: 0xff5a1f, opacity: 0.75, ...add }),
      flameInner: new THREE.MeshBasicMaterial({ color: 0xffd34d, opacity: 0.9, ...add }),
      arc: new THREE.MeshBasicMaterial({ color: 0xfff7a8, opacity: 0.95, side: THREE.DoubleSide, ...add }),
      arcGlow: new THREE.MeshBasicMaterial({ color: 0x8fd3ff, opacity: 0.6, side: THREE.DoubleSide, ...add }),
      shockGlow: new THREE.MeshBasicMaterial({ color: 0xfff27a, opacity: 0.28, ...add }),
      mark: new THREE.MeshBasicMaterial({ color: 0xff3b3b, opacity: 0.9, transparent: true, depthTest: false })
    }
  };
  return shared;
}

function mesh(geo, mat, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  parent.add(m);
  return m;
}

/** Build one effect's meshes the first time an enemy needs it. */
function part(fx, name) {
  if (fx.parts[name]) return fx.parts[name];
  const { geo, mat } = assets();
  const g = new THREE.Group();
  fx.group.add(g);

  switch (name) {
    case 'ice': {
      mesh(geo.ice, mat.ice, g);
      // Shards jutting out of the block so it reads as ice, not a bubble.
      [[0.5, 0.75, 0.2, 0.5], [-0.6, 0.6, -0.3, -0.6], [0.1, 0.85, -0.55, 0.2], [-0.2, 0.7, 0.6, -0.3]].forEach(([x, y, z, tilt]) => {
        const s = mesh(geo.spike, mat.ice, g);
        s.position.set(x, y, z);
        s.rotation.set(z * 0.9, 0, -tilt);
        s.scale.setScalar(0.7);
      });
      break;
    }
    case 'chill': {
      g.userData.ring = mesh(geo.ring, mat.frost, g);
      g.userData.flakes = [0, 1, 2].map(() => mesh(geo.flake, mat.flake, g));
      break;
    }
    case 'burn': {
      g.userData.flames = [0, 1, 2, 3].map(i => {
        const outer = mesh(geo.flame, mat.flameOuter, g);
        const inner = mesh(geo.flame, mat.flameInner, outer);
        inner.scale.set(0.5, 0.62, 0.5);
        const a = i * 1.7 + 0.4;
        outer.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55);
        return outer;
      });
      break;
    }
    case 'shock': {
      g.userData.arcs = [0, 1, 2, 3].map(i => mesh(geo.arc, i >= 2 ? mat.arcGlow : mat.arc, g));
      g.userData.glow = mesh(geo.glow, mat.shockGlow, g);
      break;
    }
    case 'mark': {
      mesh(geo.mark, mat.mark, g).renderOrder = 998;
      [0, 1, 2, 3].forEach(i => {
        const t = mesh(geo.tick, mat.mark, g);
        const a = i * Math.PI / 2;
        t.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8);
        t.rotation.y = -a;
        t.renderOrder = 998;
      });
      break;
    }
  }

  fx.parts[name] = g;
  return g;
}

function show(fx, name, on) {
  if (!on) {
    if (fx.parts[name]) fx.parts[name].visible = false;
    return null;
  }
  const g = part(fx, name);
  g.visible = true;
  return g;
}

/**
 * Sync one enemy's status visuals with its status. Call every frame.
 * @param {object} e - enemy
 * @param {number} t - animation clock, seconds
 */
export function updateStatusFx(e, t) {
  const frozen = e.frozen > 0;
  const chilled = !frozen && e.slow > 0;
  const burning = e.burnT > 0;
  const shocked = e.shock > 0;
  const marked = e.exposed > 0;
  const any = frozen || chilled || burning || shocked || marked;

  if (!any) {
    if (e.fx) e.fx.group.visible = false;
    return;
  }

  const { scene } = getState();
  if (!scene) return;

  if (!e.fx) {
    e.fx = { group: new THREE.Group(), parts: {} };
    scene.add(e.fx.group);
  }
  const fx = e.fx;
  fx.group.visible = true;

  // r is the enemy's body radius in world units; the body's centre sits a
  // little above where the enemy "stands".
  const r = (e.sz || 1) * 0.42 * (e.boss ? 1.3 : 1);
  const cy = e.flying ? e.y : e.y + Math.max(0.05, r * 1.02 - 0.18);
  fx.group.position.set(e.x, 0, e.z);

  const ice = show(fx, 'ice', frozen);
  if (ice) {
    ice.position.y = cy;
    // A last shiver as it thaws.
    const thaw = e.frozen < 0.3 ? 1 + Math.sin(t * 60) * 0.03 : 1;
    ice.scale.setScalar(r * 1.75 * thaw);
    ice.rotation.y = (e.x * 3.1 + e.z * 1.7) % 6.28;
  }

  const chill = show(fx, 'chill', chilled);
  if (chill) {
    const ring = chill.userData.ring;
    ring.position.y = e.flying ? e.y - r : 0.06;
    ring.scale.setScalar(r * (1.35 + Math.sin(t * 4) * 0.08));
    chill.userData.flakes.forEach((f, i) => {
      const a = t * 2.2 + i * 2.094;
      f.position.set(Math.cos(a) * r * 1.3, cy + Math.sin(t * 3 + i) * r * 0.5, Math.sin(a) * r * 1.3);
      f.rotation.set(t * 2, t * 3, 0);
      f.scale.setScalar(0.6 + (e.frost || 0) * 0.9);
    });
  }

  const burn = show(fx, 'burn', burning);
  if (burn) {
    burn.position.y = cy - r * 0.2;
    const heat = 0.75 + Math.min(4, e.burnStacks || 1) * 0.16;
    const live = Math.min(4, 1 + (e.burnStacks || 1));
    burn.userData.flames.forEach((f, i) => {
      f.visible = i < live;
      const flick = 0.75 + Math.sin(t * 15 + i * 1.9) * 0.3 + Math.sin(t * 23 + i) * 0.12;
      f.scale.set(r * 1.1 * heat, r * 2.3 * heat * flick, r * 1.1 * heat);
      f.rotation.z = Math.sin(t * 7 + i * 2.3) * 0.18;
    });
    burn.scale.set(1, 1, 1);
    burn.rotation.y = t * 0.8;
  }

  const shock = show(fx, 'shock', shocked);
  if (shock) {
    shock.position.y = cy;
    // Snap to a new random pose ~20 times a second so the arcs crackle.
    const step = Math.floor(t * 20);
    shock.userData.arcs.forEach((a, i) => {
      const seed = step * 7.13 + i * 3.7 + e.x * 5;
      a.rotation.set(Math.sin(seed) * 3.1, Math.sin(seed * 1.7) * 3.1, Math.sin(seed * 2.3) * 3.1);
      a.scale.setScalar(r * (1.2 + (Math.sin(seed * 3.3) + 1) * 0.3));
    });
    // A flickering glow so the stun reads even when the arcs are edge-on.
    shock.userData.glow.scale.setScalar(r * (1.25 + (step % 2) * 0.25));
    // The enemy itself shudders.
    if (e.mesh) {
      e.mesh.position.x = e.x + Math.sin(t * 90) * 0.035;
      e.mesh.position.z = e.z + Math.cos(t * 77) * 0.035;
    }
  }

  const mark = show(fx, 'mark', marked);
  if (mark) {
    mark.position.y = cy + r * 1.9 + 0.25;
    mark.rotation.y = t * 2.4;
    mark.scale.setScalar(Math.max(0.6, r * 1.4) * (1 + Math.sin(t * 6) * 0.08));
  }
}

/** Remove an enemy's status visuals (it died, escaped, or the game ended). */
export function detachStatusFx(e) {
  if (!e || !e.fx) return;
  const { scene } = getState();
  if (scene) scene.remove(e.fx.group);
  e.fx = null;
}
