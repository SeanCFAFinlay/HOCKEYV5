// Damage calculations and hit handling
// Includes visual feedback and effects

import { getState } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { createExplosion, createLightning, createImpact } from './particles.js';

// Hit flash duration
const FLASH_DURATION = 0.1;

/**
 * Handle projectile hit
 * @param {Object} p - Projectile
 */
export function handleHit(p) {
  const state = getState();
  const { enemies } = state;
  const tw = p.tower;
  let dmg = tw.dmg;
  let isCrit = false;

  // Critical hit check
  if (tw.crit && Math.random() < tw.crit) {
    dmg *= 3;
    isCrit = true;
    createExplosion(p.x, p.y, p.z, false, 0xffd700);
  }

  // Splash damage
  if (tw.splash) {
    enemies.forEach(e => {
      const dx = e.x - p.x;
      const dz = e.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < tw.splash) {
        const splashDmg = dmg * (1 - dist / tw.splash / 2);
        hurtEnemy(e, splashDmg, isCrit);
      }
    });
    createExplosion(p.x, p.y, p.z, false);
  }
  // Chain lightning
  else if (tw.chain && p.target && enemies.includes(p.target)) {
    let current = p.target;
    hurtEnemy(current, dmg, isCrit);

    const hitTargets = new Set([current]);

    for (let c = 0; c < tw.chain; c++) {
      let next = null;
      let minDist = tw.chainRng;

      enemies.forEach(e => {
        if (hitTargets.has(e)) return;

        const dx = e.x - current.x;
        const dz = e.z - current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < minDist) {
          minDist = dist;
          next = e;
        }
      });

      if (next) {
        createLightning(current.x, current.z, next.x, next.z);
        hurtEnemy(next, dmg * 0.5, false);
        hitTargets.add(next);
        current = next;
      }
    }
  }
  // Single target
  else if (p.target && enemies.includes(p.target)) {
    hurtEnemy(p.target, dmg, isCrit);

    // Apply slow
    if (tw.slow) {
      p.target.slow = tw.slowDur;
      // Visual feedback for slow
      if (p.target.mesh) {
        flashMesh(p.target.mesh, 0x7fe9ff, FLASH_DURATION);
      }
    }

    // Apply burn
    if (tw.burn) {
      p.target.burnT = tw.burnDur;
      p.target.burnD = tw.burn;
      // Visual feedback for burn
      if (p.target.mesh) {
        flashMesh(p.target.mesh, 0xff4400, FLASH_DURATION);
      }
    }

    // Create impact particles
    createImpact(p.x, p.y, p.z, isCrit ? 0xffd700 : 0xffffff);
  }

  emit(GameEvents.PROJECTILE_HIT, {
    projectile: p,
    tower: tw,
    target: p.target,
    damage: dmg,
    critical: isCrit
  });
}

/**
 * Apply damage to enemy
 * @param {Object} e - Enemy
 * @param {number} dmg - Raw damage
 * @param {boolean} isCrit - Is critical hit
 */
export function hurtEnemy(e, dmg, isCrit = false) {
  const actualDmg = dmg * (1 - e.armor);
  e.hp -= actualDmg;

  // Visual feedback - flash and scale
  if (e.mesh) {
    // Flash effect
    flashMesh(e.mesh, isCrit ? 0xffd700 : 0xff4444, FLASH_DURATION);

    // Scale punch effect
    punchScale(e.mesh, isCrit ? 1.3 : 1.15);
  }

  emit(GameEvents.ENEMY_HIT, {
    enemy: e,
    damage: actualDmg,
    critical: isCrit,
    remainingHp: e.hp
  });
}

/**
 * Flash a mesh with a color
 * @param {THREE.Object3D} mesh - Mesh to flash
 * @param {number} color - Flash color
 * @param {number} duration - Flash duration
 */
function flashMesh(mesh, color, duration) {
  // Store original colors
  const originals = new Map();

  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      const mat = child.material;
      if (mat.emissive) {
        originals.set(mat, mat.emissive.getHex());
        mat.emissive.setHex(color);
        mat.emissiveIntensity = 0.5;
      }
    }
  });

  // Restore after duration
  setTimeout(() => {
    originals.forEach((originalColor, mat) => {
      mat.emissive.setHex(originalColor);
      mat.emissiveIntensity = 0;
    });
  }, duration * 1000);
}

/**
 * Punch scale effect (pop and return)
 * @param {THREE.Object3D} mesh - Mesh to scale
 * @param {number} scale - Target scale
 */
function punchScale(mesh, scale) {
  const originalScale = mesh.scale.clone();
  mesh.scale.multiplyScalar(scale);

  // Animate back using simple timeout steps
  const steps = 5;
  const stepTime = 30;

  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const t = i / steps;
      const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic
      mesh.scale.lerpVectors(
        originalScale.clone().multiplyScalar(scale),
        originalScale,
        eased
      );
    }, stepTime * i);
  }
}

/**
 * Show damage number (floating text)
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {number} damage - Damage amount
 * @param {boolean} isCrit - Is critical
 */
export function showDamageNumber(x, y, z, damage, isCrit) {
  // This would require a sprite/DOM overlay system
  // For now, we use the particle effects as feedback
}
