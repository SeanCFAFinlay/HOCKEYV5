// Damage calculations and hit handling
// Includes visual feedback and effects

import { getState } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { createExplosion, createLightning, createImpact, spawnGroundRipple } from './particles.js';
import { triggerHitStop } from '../engine/loop.js';
import { cameraZoomPulse, triggerCameraShake } from '../engine/camera.js';
import { getPower, powerValue } from '../config/powers.js';
import { flashMesh, tickFlash } from '../rendering/hit-flash.js';
import { applyChill, applyShock, applyStagger, applyBurn, applyExpose, applyKnockback, damageMultiplier } from './status.js';

// Hit flash duration
const FLASH_DURATION = 0.1;

/**
 * Handle projectile hit.
 *
 * Plain damage first, then the firing tower's power (config/powers.js): each
 * role does something different when its shot lands.
 * @param {Object} p - Projectile
 */
export function handleHit(p) {
  const state = getState();
  const { enemies } = state;
  const tw = p.tower;
  const power = getPower(tw);
  const pv = arr => powerValue(arr, tw.lv || 0);
  const targetAlive = !!p.target && enemies.includes(p.target);
  let dmg = tw.dmg;
  let isCrit = false;

  // Critical hit check
  if (tw.crit && Math.random() < tw.crit) {
    dmg *= 3;
    isCrit = true;
    createExplosion(p.x, p.y, p.z, false, 0xffd700);
  }

  // Giant Slayer: a slice of the target's max health on top, capped at doubling
  // the hit so it is strong against big targets without one-shotting bosses.
  if (power?.id === 'giantSlayer' && targetAlive) {
    dmg += Math.min(dmg, p.target.maxHp * pv(power.pctMaxHp));
  }

  // Splash damage
  if (tw.splash) {
    const stagger = power?.id === 'shockwave' ? pv(power.stagger) : 0;
    enemies.forEach(e => {
      const dx = e.x - p.x;
      const dz = e.z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < tw.splash) {
        const splashDmg = dmg * (1 - dist / tw.splash / 2);
        hurtEnemy(e, splashDmg, isCrit);
        // Shockwave: everything caught in the blast staggers.
        if (stagger) applyStagger(e, stagger, power.staggerMult);
        if (p.impactKind === 'gravity' && dist > 0.05) {
          const pull = 0.18 * (1 - dist / tw.splash);
          e.x -= (dx / dist) * pull;
          e.z -= (dz / dist) * pull;
          e.slow = Math.max(e.slow || 0, 0.6);
        }
      }
    });
    createThemedImpact(p);
    triggerCameraShake(0.08, 200); // Heavy shake for splash impacts
  }
  // Chain lightning
  else if (tw.chain && targetAlive) {
    // Electrocute: every enemy the lightning touches is stunned.
    const stun = power?.id === 'electrocute' ? pv(power.stun) : 0;
    const zap = (e) => {
      if (stun && applyShock(e, stun)) createImpact(e.x, 0.5, e.z, 0xfff7a8);
    };

    let current = p.target;
    hurtEnemy(current, dmg, isCrit);
    zap(current);

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
        createLightning(current.x, current.z, next.x, next.z, p.trailColor);
        hurtEnemy(next, dmg * 0.5, false);
        zap(next);
        hitTargets.add(next);
        current = next;
      }
    }
    createThemedImpact(p, isCrit);
  }
  // Single target
  else if (targetAlive) {
    const target = p.target;
    const pierce = power?.id === 'pierce';
    hurtEnemy(target, dmg, isCrit, { pierce });

    // Armor Pierce: the shot ignored armor; now mark the target for everyone.
    if (pierce) applyExpose(target, power.exposeDur, pv(power.expose));

    // Chill, building to a freeze
    if (tw.slow) {
      const freeze = power?.id === 'freeze' ? power : null;
      const froze = applyChill(
        target,
        tw.slowDur,
        freeze ? 1 / pv(freeze.hitsToFreeze) : 0,
        freeze ? pv(freeze.freezeDur) : 0
      );
      if (froze) {
        createImpact(target.x, 0.5, target.z, 0xdff8ff);
        spawnGroundRipple(target.x, target.z, 0x9be8ff);
        showStatusText(target.x, 0.7, target.z, 'FROZEN', '#9be8ff');
      } else if (target.mesh) {
        flashMesh(target.mesh, 0x7fe9ff, FLASH_DURATION);
      }

      // The spray catches whoever is standing next to the target.
      const radius = freeze ? pv(freeze.chillRadius) : 0;
      if (radius > 0) {
        enemies.forEach(e => {
          if (e === target) return;
          const dx = e.x - target.x;
          const dz = e.z - target.z;
          if (dx * dx + dz * dz < radius * radius) applyChill(e, tw.slowDur * 0.6);
        });
      }
    }

    // Burn
    if (tw.burn) {
      const ignite = power?.id === 'ignite' ? power : null;
      applyBurn(target, tw.burn, tw.burnDur, ignite ? pv(ignite.stacks) : 1, ignite ? pv(ignite.spread) : 0);
      if (target.mesh) {
        flashMesh(target.mesh, 0xff4400, FLASH_DURATION);
      }
    }

    // Body Check: throw the target back the way it came.
    if (power?.id === 'knockback' && applyKnockback(target, pv(power.dist))) {
      spawnGroundRipple(target.x, target.z, p.trailColor || 0xffffff);
      triggerCameraShake(0.06, 140);
    }

    createThemedImpact(p, isCrit);
  }

  emit(GameEvents.PROJECTILE_HIT, {
    projectile: p,
    tower: tw,
    target: p.target,
    damage: dmg,
    critical: isCrit
  });
}

function createThemedImpact(p, isCrit = false) {
  const color = isCrit ? 0xffd700 : (p.trailColor || 0xffffff);
  switch (p.impactKind) {
    case 'frost':
      // Puck strike: a sharp chip of ice.
      createImpact(p.x, p.y, p.z, 0xcdf6ff);
      break;
    case 'freeze':
      // Ice spray: frost bursts out and spreads across the surface.
      createImpact(p.x, p.y, p.z, 0x9be8ff);
      spawnGroundRipple(p.x, p.z, 0xbdf3ff);
      break;
    case 'burn':
      createExplosion(p.x, p.y, p.z, true, color);
      break;
    case 'ring':
    case 'gravity':
      // Area hits land with a shockwave rolling out along the ground.
      createExplosion(p.x, p.y, p.z, false, color);
      spawnGroundRipple(p.x, p.z, color);
      break;
    case 'slam':
    case 'save':
      createImpact(p.x, p.y, p.z, color);
      spawnGroundRipple(p.x, p.z, color);
      break;
    case 'crit':
      createExplosion(p.x, p.y, p.z, false, 0xffd700);
      spawnGroundRipple(p.x, p.z, 0xffe680);
      break;
    case 'chain':
      createImpact(p.x, p.y, p.z, 0xffffff);
      createImpact(p.x, p.y, p.z, color);
      break;
    default:
      createImpact(p.x, p.y, p.z, color);
  }
}

/**
 * Apply damage to enemy
 * @param {Object} e - Enemy
 * @param {number} dmg - Raw damage
 * @param {boolean} isCrit - Is critical hit
 * @param {{pierce?: boolean}} [opts] - pierce: ignore the enemy's armor
 */
export function hurtEnemy(e, dmg, isCrit = false, opts = {}) {
  // Armor is skipped by piercing shots; frozen and marked enemies take more.
  const armor = opts.pierce ? 0 : e.armor;
  // Tower hits get the player's permanent damage upgrade; abilities don't.
  const perk = opts.ability ? 1 : (getState().perkDamage || 1);
  const actualDmg = dmg * perk * (1 - armor) * damageMultiplier(e);
  e.hp -= actualDmg;

  // Visual feedback - flash and scale
  if (e.mesh) {
    flashMesh(e.mesh, isCrit ? 0xffd700 : 0xff4444, FLASH_DURATION);
    punchScale(e.mesh, isCrit ? 1.3 : 1.15);
    showDamageNumber(e.x, e.y || 0.5, e.z, actualDmg, isCrit);
  }

  // Hit-stop feedback
  if (e.hp <= 0) {
    if (e.boss) {
      triggerHitStop(100);
      cameraZoomPulse(0.1, 300);
      triggerCameraShake(0.15, 250); // Heavy shake for boss kill
    } else {
      triggerHitStop(40);
      triggerCameraShake(0.05, 150); // Light shake for normal kill
    }
  } else if (isCrit) {
    triggerHitStop(16);
    triggerCameraShake(0.10, 200); // Medium shake for crit
  }

  emit(GameEvents.ENEMY_HIT, {
    enemy: e,
    damage: actualDmg,
    critical: isCrit,
    remainingHp: e.hp
  });
}

/**
 * Punch scale effect stored in mesh.userData for game-loop integration.
 * @param {THREE.Object3D} mesh - Mesh to scale
 * @param {number} scale - Peak scale multiplier
 */
function punchScale(mesh, scale) {
  // Always punch from the resting size. A hit that lands while an earlier punch
  // is still easing back must not take the swollen size as the new normal, or
  // anything hit often enough (a boss) inflates without limit.
  const originalScale = mesh.userData.punchActive && mesh.userData.punchTargetScale
    ? mesh.userData.punchTargetScale.clone()
    : mesh.scale.clone();
  mesh.scale.copy(originalScale).multiplyScalar(scale);

  mesh.userData.punchActive = true;
  mesh.userData.punchTime = 0;
  mesh.userData.punchDuration = 0.15;
  mesh.userData.punchStartScale = mesh.scale.clone();
  mesh.userData.punchTargetScale = originalScale;
}

/**
 * Tick damage animations (flash + punch) forward by dt.
 * Call this from the game loop each frame.
 * @param {THREE.Object3D} mesh
 * @param {number} dt - Delta time in seconds
 */
export function tickDamageAnimations(mesh, dt) {
  if (!mesh || !mesh.userData) return;

  // Flash: see rendering/hit-flash.js (materials are shared between enemies).
  tickFlash(mesh, dt);

  if (mesh.userData.punchActive) {
    mesh.userData.punchTime += dt;
    const t = Math.min(1, mesh.userData.punchTime / mesh.userData.punchDuration);
    const eased = 1 - Math.pow(1 - t, 3);
    mesh.scale.lerpVectors(mesh.userData.punchStartScale, mesh.userData.punchTargetScale, eased);
    if (t >= 1) {
      mesh.userData.punchActive = false;
    }
  }
}

/**
 * Show damage number (floating text sprite)
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {number} damage - Damage amount
 * @param {boolean} isCrit - Is critical
 */
export function showDamageNumber(x, y, z, damage, isCrit) {
  const state = getState();
  if (!state.scene) return;

  const text = Math.floor(damage).toString();
  const fontSize = isCrit ? 48 : 32;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Outline
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 4;
  ctx.strokeText(text, 64, 32);

  // Fill
  ctx.fillStyle = isCrit ? '#ffd700' : '#ffffff';
  ctx.fillText(text, 64, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y + 0.5, z);
  sprite.scale.set(1.2, 0.6, 1);
  if (isCrit) sprite.scale.multiplyScalar(1.4);
  sprite.renderOrder = 999;
  state.scene.add(sprite);

  // Animate upward and fade out
  const startY = y + 0.5;
  const duration = 800;
  const startTime = performance.now();

  function animate() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(1, elapsed / duration);

    sprite.position.y = startY + t * 1.5;
    mat.opacity = 1 - t * t;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      state.scene.remove(sprite);
      mat.dispose();
      texture.dispose();
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Float a short word above an enemy when a status lands ("FROZEN").
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {string} text
 * @param {string} color - CSS colour
 */
export function showStatusText(x, y, z, text, color = '#ffffff') {
  const state = getState();
  if (!state.scene || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 5;
  ctx.strokeText(text, 128, 32);
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, y + 0.6, z);
  sprite.scale.set(2.0, 0.5, 1);
  sprite.renderOrder = 999;
  state.scene.add(sprite);

  const startY = y + 0.6;
  const startTime = performance.now();
  function animate() {
    const t = Math.min(1, (performance.now() - startTime) / 900);
    sprite.position.y = startY + t * 1.1;
    mat.opacity = 1 - t * t;
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      state.scene.remove(sprite);
      mat.dispose();
      texture.dispose();
    }
  }
  requestAnimationFrame(animate);
}
