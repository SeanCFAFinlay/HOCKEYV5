// Animation updates for towers and enemies

import { getState } from '../engine/state.js';
import { updateEmissiveFlashes } from './tower-meshes.js';
import { tickDamageAnimations } from '../systems/damage.js';

// ── Enemy Death Animation ──────────────────────────────────────────────────

/**
 * Dying mesh entries: { mesh, scene, elapsed, duration, onComplete }
 */
const dyingMeshes = [];

/**
 * Register an enemy mesh for a brief death animation before scene removal.
 * The mesh scales down, spins, and fades over 150ms then is removed.
 * @param {THREE.Object3D} mesh
 * @param {THREE.Scene} scene
 * @param {Function} [onComplete] - Called after animation completes
 */
export function addDyingEnemy(mesh, scene, onComplete) {
  if (!mesh || !scene) {
    if (onComplete) onComplete();
    return;
  }
  dyingMeshes.push({ mesh, scene, elapsed: 0, duration: 0.15, onComplete });
}

function updateDyingMeshes(dt) {
  for (let i = dyingMeshes.length - 1; i >= 0; i--) {
    const entry = dyingMeshes[i];
    entry.elapsed += dt;
    const t = Math.min(1, entry.elapsed / entry.duration);

    // Scale down
    const s = 1 - t;
    entry.mesh.scale.setScalar(s);

    // Spin on Y axis
    entry.mesh.rotation.y += dt * 15;

    // Fade opacity on all materials
    entry.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = 1 - t;
      }
    });

    if (t >= 1) {
      entry.scene.remove(entry.mesh);
      if (entry.onComplete) entry.onComplete();
      dyingMeshes.splice(i, 1);
    }
  }
}

// ── Ease Out Bounce ────────────────────────────────────────────────────────

function easeOutBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/**
 * Update tower drop animations stored in mesh.userData.dropAnim.
 * Called each frame from updateAnimations or directly.
 * @param {Array} towers - Array of tower objects
 * @param {number} dt - Delta time in seconds
 */
export function updateTowerDropAnimations(towers, dt) {
  for (const tower of towers) {
    const mesh = tower.mesh;
    if (!mesh || !mesh.userData.dropAnim) continue;

    const anim = mesh.userData.dropAnim;
    anim.elapsed += dt;

    const t = Math.min(1, anim.elapsed / anim.duration);
    mesh.position.y = anim.startY * (1 - easeOutBounce(t));

    if (t >= 1) {
      mesh.position.y = 0;
      delete mesh.userData.dropAnim;
    }
  }
}

export function updateAnimations(dt) {
  const state = getState();
  const { towers, enemies, animTime } = state;
  const t = animTime;

  // SC-2.5: decay emissive flash
  updateEmissiveFlashes(towers, dt);

  // SC-3.2: tower drop animations
  updateTowerDropAnimations(towers, dt);

  // Death animations for recently killed enemies
  updateDyingMeshes(dt);

  // Animate towers
  towers.forEach(tw => {
    // Animate base glow
    if (tw.baseGlow) {
      tw.baseGlow.material.opacity = 0.3 + Math.sin(t * 2) * 0.15;
    }

    // Animate base rim
    if (tw.baseRim) {
      tw.baseRim.material.opacity = 0.7 + Math.sin(t * 3) * 0.2;
    }

    // Firing flash effect
    if (tw.firingFlash && tw.firingFlash > 0) {
      tw.firingFlash -= dt * 3;
      if (tw.baseGlow) {
        tw.baseGlow.material.opacity = Math.min(0.8, tw.firingFlash);
      }
    }

    if (!tw.animParts) return;

    tw.animParts.forEach(part => {
      if (!part.mesh) return;

      switch (part.type) {
        case 'pulse':
          const pulseScale = 1 + Math.sin(t * 4.5 + (part.offset || 0)) * 0.18;
          part.mesh.scale.setScalar(pulseScale);
          break;

        case 'spin':
          part.mesh.rotation.y += dt * (part.speed || 1) * 2.5;
          break;

        case 'bob':
          if (!part._baseY) part._baseY = part.mesh.position.y;
          part.mesh.position.y = part._baseY + Math.sin(t * 2) * 0.03;
          break;

        case 'float':
          const floatOffset = part.offset || 0;
          part.mesh.position.y += Math.sin(t * 3.5 + floatOffset * 0.8) * 0.004;
          part.mesh.rotation.y = t * 0.5 + floatOffset;
          break;

        case 'flame':
          const flameScale = 0.75 + Math.sin(t * 12 + (part.offset || 0) * 0.6) * 0.35;
          part.mesh.scale.y = flameScale;
          part.mesh.scale.x = 0.85 + Math.sin(t * 9 + (part.offset || 0)) * 0.25;
          part.mesh.rotation.z = Math.sin(t * 6 + (part.offset || 0)) * 0.1;
          break;

        case 'orbit':
          const orbitAngle = t * 1.8 + (part.offset || 0) * (Math.PI * 2 / 3);
          const orbitY = part.mesh.position.y;
          part.mesh.position.x = Math.cos(orbitAngle) * (part.radius || 0.25);
          part.mesh.position.z = Math.sin(orbitAngle) * (part.radius || 0.25);
          part.mesh.rotation.y = orbitAngle + Math.PI;
          break;

        case 'blink':
          part.mesh.visible = Math.sin(t * 6) > 0;
          part.mesh.material.opacity = 0.4 + Math.sin(t * 8) * 0.2;
          break;

        case 'punch':
          const punchPhase = Math.abs(Math.sin(t * 4 + part.side * 1.5));
          part.mesh.position.z = 0.1 + punchPhase * 0.18;
          part.mesh.scale.setScalar(1 + punchPhase * 0.1);
          break;

        case 'reach':
          part.mesh.position.x = 0.3 + Math.sin(t * 2.5) * 0.12;
          part.mesh.position.y = 0.6 + Math.cos(t * 2.5) * 0.06;
          part.mesh.rotation.z = Math.sin(t * 2) * 0.1;
          break;
      }
    });
  });

  // Animate enemies
  enemies.forEach(e => {
    // Tick game-loop-integrated damage animations (flash + punch)
    if (e.mesh) tickDamageAnimations(e.mesh, dt);

    // Animate flames with more dynamic motion
    if (e.flames) {
      e.flames.forEach((flame, i) => {
        const flameScale = 0.7 + Math.sin(t * 14 + i * 0.7) * 0.45;
        flame.scale.y = flameScale;
        flame.scale.x = 0.8 + Math.sin(t * 11 + i * 1.2) * 0.3;
        flame.rotation.z = Math.sin(t * 6 + i) * 0.15;
      });
    }

    // Animate fire glow pulsing
    if (e.fireGlow) {
      const glowScale = 1 + Math.sin(t * 5) * 0.15;
      e.fireGlow.scale.setScalar(glowScale);
      e.fireGlow.material.opacity = 0.12 + Math.sin(t * 7) * 0.05;
    }

    // Animate fire core
    if (e.fireCore) {
      e.fireCore.scale.setScalar(1 + Math.sin(t * 8) * 0.2);
    }

    // Animate embers floating up
    if (e.embers) {
      e.embers.forEach((ember, i) => {
        ember.position.y += dt * 0.8;
        ember.material.opacity = 0.8 - (ember.position.y - 0.6) * 0.5;
        if (ember.position.y > 1.5) {
          ember.position.y = 0.6 + Math.random() * 0.3;
          ember.material.opacity = 0.8;
        }
        ember.scale.setScalar(0.8 + Math.sin(t * 10 + i) * 0.3);
      });
    }

    // Animate wings with more fluid motion
    if (e.wings) {
      e.wings.forEach((wing, i) => {
        const side = i === 0 ? 1 : -1;
        wing.rotation.z = Math.sin(t * 10) * 0.35 * side;
        wing.rotation.x = Math.sin(t * 6 + 0.5) * 0.1;
      });
    }

    // Animate flying sparkles
    if (e.flyingSparkles) {
      e.flyingSparkles.forEach((sparkle, i) => {
        sparkle.rotation.y = t * 3 + i;
        sparkle.rotation.x = t * 2;
        sparkle.material.opacity = 0.5 + Math.sin(t * 8 + i * 2) * 0.3;
        sparkle.scale.setScalar(0.8 + Math.sin(t * 6 + i) * 0.3);
      });
    }

    // Animate boss crown gem with glow
    if (e.crownGem) {
      const gemScale = 1 + Math.sin(t * 4) * 0.25;
      e.crownGem.scale.setScalar(gemScale);
      e.crownGem.rotation.y = t * 2;
    }

    // Animate gem glow
    if (e.gemGlow) {
      e.gemGlow.scale.setScalar(1 + Math.sin(t * 5) * 0.3);
      e.gemGlow.material.opacity = 0.25 + Math.sin(t * 6) * 0.1;
    }

    // Animate crown glow
    if (e.crownGlow) {
      e.crownGlow.material.opacity = 0.2 + Math.sin(t * 4) * 0.1;
      e.crownGlow.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }

    // Animate logo glow (pucks)
    if (e.logoGlow) {
      e.logoGlow.material.opacity = 0.4 + Math.sin(t * 3) * 0.2;
    }

    if (e.orbitalRings) {
      e.orbitalRings.forEach((ring, i) => {
        ring.rotation.z += dt * (1.2 + i * 0.45);
        ring.rotation.y += dt * (0.7 + i * 0.25);
        ring.material.opacity = 0.45 + Math.sin(t * 4 + i) * 0.18;
      });
    }

    // Update health bar color and smooth lerp fill width
    if (e.hpBar && e.hp !== undefined && e.maxHp !== undefined && e.hpMats) {
      const hpPercent = e.hp / e.maxHp;
      if (hpPercent <= 0.25) {
        e.hpBar.material.color.setHex(0xef4444);
      } else if (hpPercent <= 0.5) {
        e.hpBar.material.color.setHex(0xeab308);
      } else {
        e.hpBar.material.color.setHex(0x22c55e);
      }

      // Smooth fill transition: lerp currentWidth toward targetWidth
      const ud = e.hpBar.userData;
      if (ud && ud.targetWidth !== undefined && ud.currentWidth !== undefined) {
        ud.targetWidth = hpPercent;
        ud.currentWidth += (ud.targetWidth - ud.currentWidth) * Math.min(1, dt * 8);
        e.hpBar.scale.x = Math.max(0, ud.currentWidth);
      }
    }

    // Fade out damage flash overlay
    if (e.hpDamageFlash && e.hpDamageFlash.material.opacity > 0) {
      e.hpDamageFlash.material.opacity = Math.max(0,
        e.hpDamageFlash.material.opacity - dt * 5
      );
    }

    // Boss aura pulsing at 2Hz (scale 1.0 - 1.1)
    if (e.bossAura) {
      const auraScale = 1.0 + Math.sin(t * 2 * Math.PI * 2) * 0.05;
      e.bossAura.scale.setScalar(auraScale);
      e.bossAura.material.opacity = 0.1 + Math.sin(t * 2 * Math.PI * 2 + 0.5) * 0.04;
    }

    // Animate heat ring (burn status effect distortion ring)
    if (e.heatRing && e.burnGroup && e.burnGroup.visible) {
      const ringScale = 1.0 + Math.sin(t * 8) * 0.15;
      e.heatRing.scale.setScalar(ringScale);
      e.heatRing.material.opacity = 0.3 + Math.sin(t * 6 + 1) * 0.12;
    }

    // === STATUS EFFECT ANIMATIONS ===

    // Slow effect (ice)
    if (e.slowGroup) {
      const isSlowed = e.slow && e.slow > 0;
      e.slowGroup.visible = isSlowed;

      if (isSlowed) {
        // Animate frost aura pulsing
        if (e.frostAura) {
          const frostScale = 1 + Math.sin(t * 4) * 0.1;
          e.frostAura.scale.setScalar(frostScale);
          e.frostAura.material.opacity = 0.3 + Math.sin(t * 3) * 0.15;
        }

        // Animate ice crystals orbiting
        if (e.iceCrystals) {
          e.iceCrystals.forEach((crystal, i) => {
            const orbitAngle = crystal.baseAngle + t * 2;
            const sz = (e.sz || 1) * 0.28;
            crystal.mesh.position.x = Math.cos(orbitAngle) * sz * 1.0;
            crystal.mesh.position.z = Math.sin(orbitAngle) * sz * 1.0;
            crystal.mesh.position.y = sz * 0.3 + Math.sin(t * 4 + i) * sz * 0.15;
            crystal.mesh.rotation.y = t * 3;
            crystal.mesh.rotation.x = t * 2;
          });
        }

        // Animate frost particles floating
        if (e.frostParticles) {
          e.frostParticles.forEach((frost, i) => {
            frost.mesh.position.y += dt * 0.5;
            frost.mesh.material.opacity = 0.7 - frost.mesh.position.y * 0.3;

            // Reset when too high
            const sz = (e.sz || 1) * 0.28;
            if (frost.mesh.position.y > sz * 1.5) {
              frost.mesh.position.y = sz * 0.2;
              frost.mesh.material.opacity = 0.7;
            }
          });
        }
      }
    }

    // Burn effect (fire)
    if (e.burnGroup) {
      const isBurning = e.burnT && e.burnT > 0;
      e.burnGroup.visible = isBurning;

      if (isBurning) {
        // Animate heat aura pulsing
        if (e.heatAura) {
          const heatScale = 1 + Math.sin(t * 6) * 0.15;
          e.heatAura.scale.setScalar(heatScale);
          e.heatAura.material.opacity = 0.12 + Math.sin(t * 8) * 0.05;
        }

        // Animate burn flames flickering
        if (e.burnFlames) {
          e.burnFlames.forEach((flame, i) => {
            const sz = (e.sz || 1) * 0.28;
            const flameScale = 0.7 + Math.sin(t * 12 + i * 0.8) * 0.4;
            flame.mesh.scale.y = flameScale;
            flame.mesh.scale.x = 0.8 + Math.sin(t * 10 + i) * 0.3;
            flame.mesh.rotation.z = Math.sin(t * 8 + i) * 0.2;

            // Slight position wobble
            const wobbleAngle = flame.baseAngle + Math.sin(t * 5 + i) * 0.1;
            flame.mesh.position.x = Math.cos(wobbleAngle) * sz * 0.75;
            flame.mesh.position.z = Math.sin(wobbleAngle) * sz * 0.75;
          });
        }

        // Animate burn embers rising
        if (e.burnEmbers) {
          e.burnEmbers.forEach((ember, i) => {
            ember.mesh.position.y += dt * 1.2;
            ember.mesh.material.opacity = 0.9 - ember.mesh.position.y * 0.4;
            ember.mesh.scale.setScalar(0.7 + Math.sin(t * 15 + i * 2) * 0.3);

            // Reset when too high
            const sz = (e.sz || 1) * 0.28;
            if (ember.mesh.position.y > sz * 2.0) {
              ember.mesh.position.y = sz * 0.3;
              ember.mesh.position.x = (Math.random() - 0.5) * sz * 1.0;
              ember.mesh.position.z = (Math.random() - 0.5) * sz * 1.0;
              ember.mesh.material.opacity = 0.9;
            }
          });
        }
      }
    }
  });
}
