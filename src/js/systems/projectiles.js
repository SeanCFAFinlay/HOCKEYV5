// Projectile creation and movement with enhanced visuals

import { getState, removeProjectile } from '../engine/state.js';
import { handleHit } from './damage.js';
import { getVisualProfile } from '../config/visual-profiles.js';

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

export function createProjectile(tw, target, sx, sz) {
  const state = getState();
  const { theme, themeData, scene } = state;
  const visuals = getVisualProfile(themeData);

  const td = themeData.towers.find(t => t.id === tw.type);
  const idx = themeData.towers.indexOf(td);
  const isHockey = theme === 'hockey';
  const profile = visuals.projectiles[td.projectile] || Object.values(visuals.projectiles)[0];

  let geo, mat;
  let speed = 8.5;
  let trailColor = null;
  const c = new THREE.Color(td.clr);

  // Theme-specific projectile shapes with enhanced visuals
  if (theme === 'space') {
    ({ geo, mat } = createProfileProjectile(profile, c));
    trailColor = profile.color || c;
    speed = profile.speed || 12;
  } else if (isHockey) {
    switch (idx) {
      case 0: // Slap Shot - glowing puck projectile
        geo = new THREE.CylinderGeometry(0.08, 0.08, 0.025, 20);
        mat = new THREE.MeshStandardMaterial({
          color: 0x111111,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.6
        });
        trailColor = 0x00d4ff;
        speed = 10.0;
        break;
      case 1: // Sniper - tracer round
        geo = new THREE.CylinderGeometry(0.02, 0.04, 0.15, 8);
        mat = new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0xff6600,
          emissiveIntensity: 0.8
        });
        trailColor = 0xff6600;
        speed = 12;
        break;
      case 2: // Enforcer - hammer/fist impact wave
        geo = new THREE.BoxGeometry(0.12, 0.12, 0.06);
        mat = new THREE.MeshStandardMaterial({ 
          color: 0xffaa44, 
          metalness: 0.6,
          roughness: 0.3,
          emissive: 0xff6600,
          emissiveIntensity: 0.5
        });
        trailColor = 0xff8844;
        speed = 7.5;
        break;
      case 3: // Ice Spray - spinning ice shard
        geo = new THREE.OctahedronGeometry(0.09, 0);
        mat = new THREE.MeshStandardMaterial({
          color: 0xaaffff,
          metalness: 0.4,
          roughness: 0.1,
          emissive: 0x66ddff,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.9
        });
        trailColor = 0x99eeff;
        speed = 9.0;
        break;
      case 4: // Goalie - glove save missile
        geo = new THREE.SphereGeometry(0.1, 16, 16);
        mat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.6,
          roughness: 0.2,
          emissive: 0xffaa00,
          emissiveIntensity: 0.6
        });
        trailColor = 0xffdd44;
        speed = 8.5;
        break;
      case 5: // Power Play - electric bolt
        geo = new THREE.CylinderGeometry(0.02, 0.04, 0.22, 6);
        mat = new THREE.MeshBasicMaterial({ 
          color: 0xffff00,
          transparent: true,
          opacity: 0.95
        });
        trailColor = 0xdddd00;
        speed = 16;
        break;
      case 6: // Hot Stick - blazing fireball
        geo = new THREE.SphereGeometry(0.09, 16, 16);
        mat = new THREE.MeshBasicMaterial({ 
          color: 0xff3300,
          transparent: true,
          opacity: 0.9
        });
        trailColor = 0xff4400;
        speed = 11.0;
        break;
      case 7: // Captain - power star
        geo = new THREE.OctahedronGeometry(0.11, 1);
        mat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.95,
          roughness: 0.05,
          emissive: 0xffbb00,
          emissiveIntensity: 0.8
        });
        trailColor = 0xffd700;
        speed = 11.0;
        break;
      default:
        geo = new THREE.SphereGeometry(0.06, 10, 10);
        mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.1 });
        trailColor = c;
    }
  } else {
    switch (idx) {
      case 0: // Striker - mini ball
        geo = new THREE.SphereGeometry(0.06, 16, 16);
        mat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.1,
          roughness: 0.5,
          emissive: 0x22aa22,
          emissiveIntensity: 0.3
        });
        trailColor = 0x22c55e;
        speed = 9.0;
        break;
      case 1: // Free Kick - curved shot
        geo = new THREE.CylinderGeometry(0.02, 0.04, 0.2, 8);
        mat = new THREE.MeshStandardMaterial({
          color: 0x88eeff,
          metalness: 0.5,
          roughness: 0.2,
          emissive: 0x44aaff,
          emissiveIntensity: 0.7
        });
        trailColor = 0x88eeff;
        speed = 11.0;
        break;
      case 2: // Header - shockwave
        geo = new THREE.TorusGeometry(0.06, 0.025, 8, 16);
        mat = new THREE.MeshBasicMaterial({ color: 0x22dddd, transparent: true, opacity: 0.8 });
        trailColor = 0x22dddd;
        speed = 8.0;
        break;
      case 3: // Tackle - slide tackle wave
        geo = new THREE.ConeGeometry(0.06, 0.12, 8);
        mat = new THREE.MeshStandardMaterial({
          color: 0x8b6914,
          metalness: 0.3,
          roughness: 0.7,
          emissive: 0x443300,
          emissiveIntensity: 0.3
        });
        trailColor = 0xaa8833;
        speed = 8.5;
        break;
      case 4: // Keeper - diving save
        geo = new THREE.SphereGeometry(0.09, 12, 12);
        mat = new THREE.MeshStandardMaterial({
          color: 0x88eeff,
          metalness: 0.4,
          roughness: 0.3,
          emissive: 0x44aaff,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.85
        });
        trailColor = 0x88eeff;
        break;
      case 5: // Playmaker - pass beam
        geo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6);
        mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        trailColor = 0xffffff;
        speed = 12;
        break;
      case 6: // Flare - firework
        geo = new THREE.OctahedronGeometry(0.06, 0);
        mat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        trailColor = 0xff6644;
        speed = 9.0;
        break;
      case 7: // Legend - golden trophy shot
        geo = new THREE.OctahedronGeometry(0.08, 1);
        mat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.95,
          roughness: 0.05,
          emissive: 0xffaa00,
          emissiveIntensity: 0.7
        });
        trailColor = 0xffd700;
        speed = 11.0;
        break;
      default:
        geo = new THREE.SphereGeometry(0.06, 10, 10);
        mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3 });
        trailColor = c;
    }
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.scale.multiplyScalar(1.4);

  // Enhanced glow effect with multiple layers
  const glowCol = trailColor || (mat && mat.color) || new THREE.Color(c);

  // Inner glow
  const innerGlowGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const innerGlowMat = new THREE.MeshBasicMaterial({
    color: glowCol,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
  innerGlow.renderOrder = 998;
  mesh.add(innerGlow);

  // Outer glow
  const outerGlowGeo = new THREE.SphereGeometry(0.18, 10, 10);
  const outerGlowMat = new THREE.MeshBasicMaterial({
    color: glowCol,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
  outerGlow.renderOrder = 997;
  mesh.add(outerGlow);

  mesh.position.set(sx, 0.45, sz);
  scene.add(mesh);

  // Trigger tower firing flash
  if (tw.baseGlow) {
    tw.firingFlash = 1.0;
  }

  return {
    mesh,
    tower: tw,
    target,
    tx: target.x,
    ty: (target.y != null ? target.y : (target.flying ? 1.2 : 0.2)),
    tz: target.z,
    x: sx,
    z: sz,
    y: 0.45,
    vx: 0,
    vz: 0,
    vy: 0,
    t: 0,
    speed,
    trailColor,
    trailKind: profile.trail,
    impactKind: profile.impact,
    curve: profile.curve || 0,
    beam: !!profile.beam,
    trail: [],
    trailTimer: 0
  };
}

function createProfileProjectile(profile, fallbackColor) {
  const color = profile?.color || fallbackColor;
  const meshType = profile?.mesh || 'sphere';
  let geo;
  let mat;

  switch (meshType) {
    case 'laser':
      geo = new THREE.CylinderGeometry(0.018, 0.035, 0.55, 8);
      mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending });
      break;
    case 'plasma':
      geo = new THREE.SphereGeometry(0.1, 16, 12);
      mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending });
      break;
    case 'ring':
      geo = new THREE.TorusGeometry(0.09, 0.025, 8, 22);
      mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.86, blending: THREE.AdditiveBlending });
      break;
    case 'bolt':
    case 'beam':
      geo = new THREE.CylinderGeometry(0.025, 0.045, 0.24, 6);
      mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
      break;
    case 'star':
      geo = new THREE.OctahedronGeometry(0.11, 1);
      mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.08, metalness: 0.8 });
      break;
    default:
      geo = new THREE.SphereGeometry(0.08, 14, 12);
      mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.3 });
  }

  return { geo, mat };
}

export function updateProjectiles(dt) {
  const state = getState();
  const { projectiles, enemies, scene } = state;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];

    // Update target position if still alive
    if (enemies.includes(p.target)) {
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
      handleHit(p);
      if (p.mesh) {
        scene.remove(p.mesh);
        disposeObject(p.mesh);
      }
      // Clean up trail particles
      if (p.trail) {
        p.trail.forEach(t => returnTrailParticle(t, scene));
      }
      projectiles.splice(i, 1);
    } else {
      // Spawn trail particles
      if (p.trailColor && p.trail) {
        p.trailTimer += dt;
        if (p.trailTimer >= 0.03) {
          p.trailTimer = 0;
          const particle = getTrailParticle(p.trailColor, p.trailKind);
          particle.position.set(p.x, p.y, p.z);
          if (p.trailKind === 'spin' || p.trailKind === 'curve') {
            particle.position.x += Math.sin(p.t * 12) * 0.08;
            particle.position.z += Math.cos(p.t * 12) * 0.08;
          }
          scene.add(particle);
          p.trail.push(particle);

          // Limit trail length
          if (p.trail.length > 8) {
            const old = p.trail.shift();
            returnTrailParticle(old, scene);
          }
        }

        // Fade trail particles
        p.trail.forEach((t, idx) => {
          const fade = (idx + 1) / p.trail.length;
          t.material.opacity = 0.5 * fade;
          t.scale.setScalar(0.5 + 0.5 * fade);
        });
      }

      const curveOffset = p.curve ? Math.sin(p.t * 7) * p.curve * 0.015 : 0;
      p.x += (dx / dist) * move + curveOffset * dz;
      p.y += (dy / dist) * move;
      p.z += (dz / dist) * move - curveOffset * dx;

      if (p.mesh) {
        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.rotation.y += dt * 12;
        p.mesh.rotation.x += dt * 8;

        // Pulsing glow effect
        const pulse = 1 + Math.sin(p.t * 15) * 0.15;
        if (p.mesh.children[0]) {
          p.mesh.children[0].scale.setScalar(pulse);
        }
        if (p.mesh.children[1]) {
          p.mesh.children[1].scale.setScalar(pulse * 1.1);
        }
      }

      p.t += dt;
    }
  }
}
