// Enemy movement animation: gait, lean, turning, limbs, rotors.
//
// The game moves an enemy's root group and snaps its heading. Everything here
// happens on the body inside that group, so the health bar and status overlays
// stay level while the creature bobs, rocks and leans.
//
// Stepping is driven by distance actually travelled, not by the clock: a
// frozen or stunned enemy stops mid-stride, a chilled one walks in slow motion,
// and feet never slide faster than the body moves.

const TAU = Math.PI * 2;
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const NO_GAIT = {};

/**
 * @param {object} e - enemy (needs e.mesh, e.body; optional e.gait, e.rigParts)
 * @param {number} t - animation clock, seconds
 * @param {number} dt - frame time, seconds
 * @param {THREE.Camera} [camera] - to keep the health bar square to the view
 */
export function animateEnemyBody(e, t, dt, camera) {
  const root = e.mesh;
  const body = e.body;
  if (!root || !body) return;
  const g = e.gait || NO_GAIT;

  let a = e.anim;
  if (!a) {
    a = e.anim = { x: e.x, z: e.z, ph: Math.random() * TAU, mv: 0, hd: root.rotation.y, seed: Math.random() * TAU, baseY: body.position.y };
  }

  // How far it really moved this frame.
  const dx = e.x - a.x, dz = e.z - a.z;
  a.x = e.x; a.z = e.z;
  const dist = Math.min(0.6, Math.sqrt(dx * dx + dz * dz));
  const r = (e.sz || 1) * 0.42 * (root.scale.x || 1);
  const moving = dt > 0 && dist / dt > 0.05 && !(e.knock > 0);
  a.mv += ((moving ? 1 : 0) - a.mv) * Math.min(1, dt * 8);
  a.ph += (dist / r) * (g.step || 2.5);
  const p = a.ph, mv = a.mv;

  // Turn smoothly instead of snapping at each corner, and bank into the turn.
  const turn = wrap(root.rotation.y - a.hd);
  a.hd += turn * Math.min(1, dt * (g.turn || 10));
  const lag = wrap(a.hd - root.rotation.y);

  const step = Math.sin(p);
  const lift = Math.abs(step);
  const unit = (e.sz || 1) * 0.42;      // one body radius, in the root's own units
  let y = a.baseY + lift * (g.bob || 0) * mv * unit;
  let rx = (g.lean || 0) * mv + Math.sin(p * 2) * (g.nod || 0) * mv;
  let rz = step * (g.rock || 0) * mv - lag * (g.bank || 0);
  let ry = lag + step * (g.yaw || 0) * mv;
  if (g.hover) {
    const f = g.hoverF || 3;
    y += Math.sin(t * f + a.seed) * g.hover * unit;
    rz += Math.sin(t * f * 0.5 + a.seed) * (g.sway || 0);
    rx += Math.cos(t * f * 0.7 + a.seed) * (g.sway || 0) * 0.5;
  }
  body.position.y = y;
  body.rotation.x = rx;
  body.rotation.y = ry;
  body.rotation.z = rz;

  // A little give in the body: squash on each footfall, breathing at rest.
  const sq = 1 + (lift - 0.5) * (g.squash || 0) * mv + Math.sin(t * 2.2 + a.seed) * 0.015 * (1 - mv);
  body.scale.y = sq;
  body.scale.x = body.scale.z = 1 / Math.sqrt(sq);

  const parts = e.rigParts;
  if (parts) {
    for (let i = 0; i < parts.length; i++) {
      const { o, a: s, base } = parts[i];
      switch (s.k) {
        case 'swing':
          o.rotation[s.ax] = (s.base ?? base) + Math.sin(p * (s.f || 1) + s.ph) * s.amp * mv;
          break;
        case 'spin':
          o.rotation[s.ax] += dt * s.sp;
          break;
        case 'sway':
          o.rotation[s.ax] = (s.base ?? base) + Math.sin(t * s.f + (s.ph || 0) + a.seed) * s.amp;
          break;
        case 'roll':
          o.rotation.x += dist / (s.rad * r);
          break;
        case 'pulse':
          o.scale.setScalar(1 + Math.sin(t * s.f + (s.ph || 0)) * s.amp);
          break;
      }
    }
  }

  // Health bar: lying flat, but always square to the camera rather than
  // turning with the enemy.
  if (e.hpHolder && camera) {
    e.hpHolder.rotation.y = Math.atan2(camera.position.x - e.x, camera.position.z - e.z) - root.rotation.y;
  }
}
