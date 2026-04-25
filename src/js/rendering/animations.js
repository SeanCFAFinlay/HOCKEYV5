// Animation updates for towers and enemies

import { getState } from '../engine/state.js';

export function updateAnimations(dt) {
  const state = getState();
  const { towers, enemies, animTime } = state;
  const t = animTime;

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

    // Update health bar color based on HP percentage
    if (e.hpBar && e.hp !== undefined && e.maxHp !== undefined && e.hpMats) {
      const hpPercent = e.hp / e.maxHp;
      if (hpPercent <= 0.25) {
        e.hpBar.material.color.setHex(0xef4444);
      } else if (hpPercent <= 0.5) {
        e.hpBar.material.color.setHex(0xeab308);
      } else {
        e.hpBar.material.color.setHex(0x22c55e);
      }
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
