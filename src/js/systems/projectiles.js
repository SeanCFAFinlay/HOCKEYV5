// Projectile creation and movement

import { getState } from '../engine/state.js';
import { handleHit, hurtEnemy } from './damage.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { attachTrail, removeTrail } from '../rendering/trails.js';
import { createShotMesh } from '../rendering/projectile-models.js';
import { muzzleFlash, landingMarker, clearMarker, burstDebris } from './impact-fx.js';
import { createImpact } from './particles.js';

// Lobbed area shells (splash towers with a 'lob' flight) are true ballistic
// shots: aimed at where the target will be when they land, and they burst
// there whether or not it is still standing on the spot. The lead is capped so
// a shell never lands absurdly far from where the target is now.
const MAX_LEAD = 2.2;

// Sniper rounds carry on through their target and can hit enemies lined up
// behind it, for a share of the damage.
const PIERCE_EXTRA_HITS = 2;
const PIERCE_DAMAGE = 0.5;
const PIERCE_REACH = 2.6;      // tiles travelled after the first hit
const PIERCE_RADIUS = 0.42;    // how close an enemy must be to the line

// Trail particle pool for reuse
const trailPool = [];
const MAX_TRAIL_PARTICLES = 100;

function getTrailParticle(color, kind = 'default') {
  let particle = trailPool.pop();
  if (particle && particle.userData.kind !== kind) {
    disposeObject(particle);
    particle = null;
  }
  if (!particle) {
    const geo = kind === 'electric' || kind === 'laser'
      ? new THREE.OctahedronGeometry(0.045, 0)
      : new THREE.SphereGeometry(kind === 'spin' ? 0.055 : 0.04, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    particle = new THREE.Mesh(geo, mat);
    particle.userData.kind = kind;
  } else {
    particle.material.color.set(color);
    particle.material.opacity = 0.6;
  }
  particle.scale.setScalar(1);
  return particle;
}

function returnTrailParticle(particle, scene) {
  scene.remove(particle);
  if (trailPool.length < MAX_TRAIL_PARTICLES) {
    trailPool.push(particle);
  } else {
    disposeObject(particle);
  }
}

function disposeObject(obj) {
  obj.traverse?.((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

// Every shot is slowed to ~65% of its nominal speed so it is trackable in
// flight rather than reading only as a muzzle flash.
const VISIBLE_SPEED = 0.65;

// Height a shot leaves the tower at. Sliding shots start on the playfield.
const MUZZLE_Y = 0.75;
const SLIDE_Y = 0.16;

// Flight styles that should feel near-instant.
const FLIGHT_SPEED = { tracer: 1.9, bolt: 1.6 };

// The ribbon trail is enough for these; a dotted particle trail just adds noise.
const NO_PARTICLE_TRAIL = new Set(['tracer', 'bolt', 'ring']);
const MAX_TRAIL_DOTS = 5;

/**
 * Fire a projectile from a tower at a target.
 *
 * What the shot looks like and how it travels both come from the theme's
 * visual profile (config/visual-profiles.js -> projectiles): `mesh` picks the
 * shape (or `model`, a themed model from rendering/projectile-models.js),
 * `flight` picks the motion. Most shots home on their target in a straight
 * line, with arcs, curves and wobble applied to the rendered mesh only. Two
 * exceptions are gameplay, not looks: lobbed area shells fly ballistically to
 * a predicted landing point, and sniper rounds pierce (see constants above).
 */
export function createProjectile(tw, target, sx, sz) {
  const state = getState();
  const { themeData, scene } = state;
  const visuals = getVisualProfile(themeData);

  const td = themeData.towers.find(t => t.id === tw.type);
  const profile = visuals.projectiles[td.projectile] || Object.values(visuals.projectiles)[0];
  const color = profile.color ?? new THREE.Color(td.clr).getHex();
  const flight = profile.flight || 'orb';
  tw.fireVoice = flight;   // picks the fire sound (config/sounds.js)
  const size = profile.size || 1;

  // Leave from the figure's muzzle (measured when the tower is built), turned
  // to face the target. The turret snaps onto the target as it fires so the
  // shot is seen to come out of the barrel, not from beside it.
  const ddx = target.x - sx;
  const ddz = target.z - sz;
  const flat = Math.sqrt(ddx * ddx + ddz * ddz) || 1;
  const dirX = ddx / flat;
  const dirZ = ddz / flat;
  const mz = tw.muzzle;
  let startX, startZ, startY;
  if (mz) {
    // Never start beyond a target standing right next to the tower.
    const reach = Math.hypot(mz.x, mz.z) || 1;
    const k = Math.min(1, (flat * 0.7) / reach);
    const fwd = mz.z * k;
    const side = mz.x * k;
    startX = sx + dirX * fwd + dirZ * side;
    startZ = sz + dirZ * fwd - dirX * side;
    startY = (tw.muzzleBaseY || 0) + mz.y;
    if (tw.turret) tw.turret.rotation.y = Math.atan2(ddx, ddz);
  } else {
    const lead = Math.min(0.32, flat * 0.4);
    startX = sx + dirX * lead;
    startZ = sz + dirZ * lead;
    startY = MUZZLE_Y;
  }
  if (flight === 'slide') startY = SLIDE_Y;

  const mesh = createShotMesh(state.theme, profile, color, size);
  mesh.position.set(startX, startY, startZ);
  scene.add(mesh);
  muzzleFlash(startX, startY, startZ, color, dirX, dirZ, flight === 'slide' ? 0.6 : (profile.beam ? 0.8 : 1));

  // Tower reaction: glow flash, recoil kick, and turn the turret onto the target.
  if (tw.baseGlow) tw.firingFlash = 1.0;
  tw.recoil = 1;
  tw.aimAngle = Math.atan2(ddx, ddz);

  const projectile = {
    mesh,
    tower: tw,
    target,
    tx: target.x,
    ty: (target.y != null ? target.y : (target.flying ? 1.2 : 0.2)),
    tz: target.z,
    x: startX,
    z: startZ,
    y: startY,
    // Rendered position: logical position plus the flight-style offset.
    rx: startX,
    ry: startY,
    rz: startZ,
    t: 0,
    speed: (profile.speed || 9) * VISIBLE_SPEED * (FLIGHT_SPEED[flight] || 1),
    flight,
    meshKind: profile.mesh,
    size,
    // Longest distance-to-target seen, used to derive flight progress 0..1.
    d0: 0,
    // Unit vector perpendicular to the launch direction, for curving shots.
    perpX: dirZ,
    perpZ: -dirX,
    side: Math.random() < 0.5 ? -1 : 1,
    seed: Math.random() * 10,
    arc: 0.9 + flat * 0.28,
    trailColor: color,
    trailKind: profile.trail,
    impactKind: profile.impact,
    debris: profile.debris || null,
    debrisColor: profile.debrisColor,
    dirX,
    dirZ,
    ballistic: false,
    pierceLeft: td.role === 'SNIPER' ? PIERCE_EXTRA_HITS : 0,
    piercing: false,
    curve: profile.curve || 0,
    beam: !!profile.beam,
    trail: [],
    trailTimer: 0
  };

  if (tw.splash && flight === 'lob') aimBallistic(projectile, target, flat);

  attachTrail(projectile, color);
  placeProjectileMesh(projectile, flat);

  return projectile;
}

/**
 * Position, orient and scale a projectile's mesh for its flight style.
 * @param {object} p - projectile
 * @param {number} remaining - distance left to the target
 */
function placeProjectileMesh(p, remaining) {
  const m = p.mesh;
  if (!m) return;

  if (remaining > p.d0) p.d0 = remaining;
  const prog = p.d0 > 0 ? Math.min(1, Math.max(0, 1 - remaining / p.d0)) : 1;
  // 0 at launch and at impact, 1 at mid-flight.
  const env = 4 * prog * (1 - prog);
  const t = p.t;

  let x = p.x;
  let y = p.y;
  let z = p.z;
  let scale = p.size;
  let orient = true;
  let roll = 0;

  switch (p.flight) {
    case 'slide':
      // Skims the surface. A puck spins flat; anything else slides nose-first.
      if (p.meshKind === 'puck') {
        orient = false;
        m.rotation.set(0, t * 16, 0);
      }
      break;

    case 'tracer':
      break;

    case 'lob':
      // Thrown high, tumbling end over end, landing on the target.
      y += p.arc * env;
      orient = false;
      m.rotation.set(t * 11, Math.atan2(p.tx - p.x, p.tz - p.z), 0, 'YXZ');
      break;

    case 'spray':
      roll = t * 9;
      break;

    case 'punch':
      // Winds up, swells mid-flight, lands heavy.
      scale *= 0.8 + env * 0.5;
      break;

    case 'bolt':
      // Flickers between orientations so it crackles instead of flying like a stick.
      roll = Math.floor(t * 28 + p.seed) * 1.9;
      scale *= 0.9 + Math.abs(Math.sin(t * 40 + p.seed)) * 0.3;
      break;

    case 'flame': {
      const wobble = Math.sin(t * 26 + p.seed) * 0.06;
      x += p.perpX * wobble;
      z += p.perpZ * wobble;
      y += Math.cos(t * 21 + p.seed) * 0.04;
      // Starts as a spark and blooms as it travels.
      scale *= 0.65 + prog * 0.75;
      break;
    }

    case 'heavy':
      // Slow, weighty and unmistakable: rises slightly and turns broadside.
      y += 0.32 * env;
      orient = false;
      m.rotation.set(0, t * 7, 0);
      scale *= 1 + Math.sin(t * 10) * 0.08;
      break;

    case 'curve': {
      // Bends away from the straight line and back onto the target.
      const bow = p.curve * env * p.side * 0.6;
      x += p.perpX * bow;
      z += p.perpZ * bow;
      y += 0.3 * env;
      orient = false;
      m.rotation.set(t * 10, t * 13, 0);
      break;
    }

    case 'ring':
      // An expanding shockwave travelling face-on.
      scale *= 0.7 + prog * 1.4;
      break;

    default: // 'orb'
      orient = false;
      scale *= 1 + Math.sin(t * 18) * 0.12;
  }

  m.position.set(x, y, z);
  if (orient) {
    m.lookAt(p.tx, p.ty + (y - p.y), p.tz);
    if (roll) m.rotateZ(roll);
  }
  m.scale.setScalar(scale);

  const halo = m.userData.halo;
  if (halo) halo.scale.setScalar(m.userData.haloRadius * (1 + Math.sin(t * 15) * 0.15));

  p.rx = x;
  p.ry = y;
  p.rz = z;
}

/**
 * Turn a lobbed splash shot into a shell aimed at where its target will be.
 * The target's velocity comes from its last fixed step (prevX/prevZ).
 */
function aimBallistic(p, target, flat) {
  const FIXED_STEP = 1 / 60;
  const vx = (target.x - (target.prevX ?? target.x)) / FIXED_STEP;
  const vz = (target.z - (target.prevZ ?? target.z)) / FIXED_STEP;
  // Two passes: time of flight depends on the distance, which depends on the lead.
  let lx = target.x;
  let lz = target.z;
  let t = flat / p.speed;
  for (let k = 0; k < 2; k++) {
    lx = target.x + vx * t;
    lz = target.z + vz * t;
    const ldx = lx - target.x;
    const ldz = lz - target.z;
    const lead = Math.hypot(ldx, ldz);
    if (lead > MAX_LEAD) {
      lx = target.x + (ldx / lead) * MAX_LEAD;
      lz = target.z + (ldz / lead) * MAX_LEAD;
    }
    t = Math.hypot(lx - p.x, lz - p.z) / p.speed;
  }
  p.ballistic = true;
  p.tx = lx;
  p.tz = lz;
  // Shells burst at ground level, flyers caught in the blast included.
  p.ty = target.flying ? 1.0 : 0.25;
  p.arc = 0.9 + Math.hypot(lx - p.x, lz - p.z) * 0.32;
  p.marker = landingMarker(lx, lz, p.tower.splash, p.trailColor, t);
}

/** Start a sniper round's run on past its first target. */
function startPierce(p) {
  const ux = p.dirX || 0;
  const uz = p.dirZ || 1;
  p.piercing = true;
  p.pux = ux;
  p.puz = uz;
  p.pierceRun = 0;
  p.pierceHits = new Set([p.target]);
  p.flight = 'tracer';
  // Aim the mesh far down the line so lookAt keeps it pointing forward.
  p.tx = p.x + ux * 100;
  p.tz = p.z + uz * 100;
  p.ty = p.y;
}

/** Advance a piercing round; returns false once it is spent. */
function stepPierce(p, dt, enemies) {
  const move = p.speed * dt;
  p.x += p.pux * move;
  p.z += p.puz * move;
  p.t += dt;
  p.pierceRun += move;
  for (const e of enemies) {
    if (p.pierceLeft <= 0) break;
    if (p.pierceHits.has(e)) continue;
    const ex = e.x - p.x;
    const ez = e.z - p.z;
    if (ex * ex + ez * ez > PIERCE_RADIUS * PIERCE_RADIUS) continue;
    p.pierceHits.add(e);
    p.pierceLeft--;
    hurtEnemy(e, (p.tower.dmg || 0) * PIERCE_DAMAGE, false);
    createImpact(e.x, 0.5, e.z, p.trailColor);
    burstDebris(e.x, 0.5, e.z, p.debris || 'sparks', p.debrisColor ?? p.trailColor, 3, { dirX: p.pux, dirZ: p.puz, spread: 0.4 });
  }
  return p.pierceLeft > 0 && p.pierceRun < PIERCE_REACH;
}

function retireProjectile(p, i, projectiles, scene) {
  // Geometry and materials are shared across shots: remove, never dispose.
  if (p.mesh) scene.remove(p.mesh);
  if (p.trail) {
    p.trail.forEach(dot => returnTrailParticle(dot, scene));
  }
  if (p.marker) clearMarker(p.marker);
  // SC-3.3: Begin ribbon trail fade
  removeTrail(p);
  projectiles.splice(i, 1);
}

export function updateProjectiles(dt) {
  const state = getState();
  const { projectiles, enemies, scene } = state;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    if (p.piercing) {
      if (!stepPierce(p, dt, enemies)) {
        retireProjectile(p, i, projectiles, scene);
        continue;
      }
      placeProjectileMesh(p, 50);
      continue;
    }

    // Update target position if still alive (a ballistic shell keeps its aim)
    if (!p.ballistic && enemies.includes(p.target)) {
      p.tx = p.target.x;
      p.ty = p.target.y;
      p.tz = p.target.z;
    }

    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const dz = p.tz - p.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const move = p.speed * dt;

    if (dist <= move) {
      p.x = p.tx;
      p.y = p.ty;
      p.z = p.tz;
      handleHit(p);
      if (p.pierceLeft > 0 && !p.tower.splash && !p.tower.chain) {
        startPierce(p);
        continue;
      }
      retireProjectile(p, i, projectiles, scene);
      continue;
    }

    p.x += (dx / dist) * move;
    p.y += (dy / dist) * move;
    p.z += (dz / dist) * move;
    p.t += dt;

    placeProjectileMesh(p, dist - move);

    // Dotted particle trail, following the rendered (curved / arced) path.
    if (!NO_PARTICLE_TRAIL.has(p.flight)) {
      p.trailTimer += dt;
      if (p.trailTimer >= 0.04) {
        p.trailTimer = 0;
        const dot = getTrailParticle(p.trailColor, p.trailKind);
        dot.position.set(p.rx, p.ry, p.rz);
        scene.add(dot);
        p.trail.push(dot);
        if (p.trail.length > MAX_TRAIL_DOTS) {
          returnTrailParticle(p.trail.shift(), scene);
        }
      }

      const count = p.trail.length;
      for (let k = 0; k < count; k++) {
        const fade = (k + 1) / count;
        p.trail[k].material.opacity = 0.5 * fade;
        p.trail[k].scale.setScalar(0.6 + 0.9 * fade);
      }
    }
  }
}
