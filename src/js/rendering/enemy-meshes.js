// Enemy mesh creation with pooling support and enhanced visuals

import { getState } from '../engine/state.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { getQualityName } from '../rendering/quality.js';

// Mesh pool for recycling
const meshPool = [];
const MAX_POOL_SIZE = 30;

// Shared enhanced materials (created once, reused)
let sharedMaterials = null;

/**
 * Initialize shared materials for better performance
 */
function getSharedMaterials() {
  if (sharedMaterials) return sharedMaterials;

  sharedMaterials = {
    // Puck body - dark rubber with subtle sheen for contrast against ice
    puckBody: new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.5,
      roughness: 0.35,
      envMapIntensity: 0.6
    }),
    // Soccer ball - clean white with controlled brightness
    ballBody: new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.08,
      roughness: 0.45,
      envMapIntensity: 0.4
    }),
    // Fire body - vivid emissive glow
    fireBody: new THREE.MeshStandardMaterial({
      color: 0xff2200,
      metalness: 0.15,
      roughness: 0.5,
      emissive: 0xff1800,
      emissiveIntensity: 0.5
    }),
    // Gold crown - rich metallic
    gold: new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.90,
      roughness: 0.08,
      emissive: 0x996600,
      emissiveIntensity: 0.25
    }),
    // Crown gem - vivid glowing red
    gemRed: new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.25,
      roughness: 0.2,
      emissive: 0xff0000,
      emissiveIntensity: 0.7
    }),
    // Armor plates - steel blue-grey for contrast
    armor: new THREE.MeshStandardMaterial({
      color: 0x4a5c6e,
      metalness: 0.80,
      roughness: 0.25,
      envMapIntensity: 0.8
    }),
    // Health bar gradient
    hpFull: new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide }),
    hpMid: new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide }),
    hpLow: new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }),
    // Trail effect
    trail: new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    }),
    trailFire: new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    })
  };

  return sharedMaterials;
}

/**
 * Return enemy mesh to pool for recycling
 * @param {Object} enemy - Enemy with mesh to return
 */
export function returnEnemyMesh(enemy) {
  if (!enemy.mesh) return;

  // Clear enemy-specific references
  enemy.hpBar = null;
  enemy.flames = null;
  enemy.wings = null;
  enemy.crownGem = null;

  // For now, we don't pool complex meshes - just dispose
  // Future optimization: pool by enemy type
  disposeGroup(enemy.mesh);
  enemy.mesh = null;
}

/**
 * Dispose of a THREE.Group and all children
 * @param {THREE.Group} group
 */
function disposeGroup(group) {
  const shared = sharedMaterials ? Object.values(sharedMaterials) : [];
  group.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => {
          if (!shared.includes(m)) m.dispose();
        });
      } else if (!shared.includes(obj.material)) {
        obj.material.dispose();
      }
    }
  });
}

export function createEnemyMesh(enemy) {
  const state = getState();
  const { theme, themeData, COLS, ROWS } = state;
  const visuals = getVisualProfile(themeData);
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const group = new THREE.Group();
  const isHockey = theme === 'hockey';
  const isSpace = theme === 'space';
  const sz = (enemy.sz || 1) * 0.34;
  const mats = getSharedMaterials();
  const roleKey = enemy.slot || enemy.role?.toLowerCase() || 'swarm';
  const visual = visuals.enemies[roleKey] || visuals.enemies[enemy.role?.toLowerCase()] || visuals.enemies.swarm;

  // Select appropriate body material
  let bodyMat;
  if (enemy.fire) {
    bodyMat = mats.fireBody;
  } else if (visual?.color !== undefined) {
    bodyMat = new THREE.MeshStandardMaterial({
      color: visual.color,
      metalness: isSpace ? 0.65 : (isHockey ? 0.24 : 0.45),
      // Glossier + a stronger self-glow so each type's identity colour reads
      // against the now-brighter ice. Hockey emissive was 0.11 — barely lit —
      // which is why the pieces looked washed and hard to tell apart.
      roughness: isSpace ? 0.22 : (isHockey ? 0.4 : 0.32),
      emissive: visual.accent || visual.color,
      emissiveIntensity: isSpace ? 0.36 : (isHockey ? 0.3 : 0.24)
    });
  } else if (isHockey) {
    bodyMat = mats.puckBody;
  } else if (!isSpace) {
    bodyMat = mats.ballBody;
  }

  if (isHockey) {
    // Determine enemy type by name for special visuals
    const enemyName = enemy.nm || '';
    const isSpeedSkater = enemyName.includes('Speed Skater');
    const isDefenseman = enemyName.includes('Defenseman');
    const isEnforcer = enemyName.includes('Enforcer');
    
    // Adjust body material for new enemy types – vivid distinct colors
    // Glossier and brighter self-glow than before (was ~0.12-0.20 emissive,
    // 0.50-0.54 roughness) so the three special types stay distinct against the
    // reflective ice.
    if (isSpeedSkater) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x00ddee, // Bright cyan for speed
        metalness: 0.28,
        roughness: 0.4,
        emissive: 0x00c2d6,
        emissiveIntensity: 0.42
      });
    } else if (isDefenseman) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2247c4, // Bold blue for defenseman
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x14307f,
        emissiveIntensity: 0.34,
        envMapIntensity: 0.5
      });
    } else if (isEnforcer) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0xdd2a2a, // Saturated red for enforcer
        metalness: 0.28,
        roughness: 0.42,
        emissive: 0x8f1414,
        emissiveIntensity: 0.36
      });
    }
    
    // PUCK - Enhanced with beveled edges and glow
    const puckBody = new THREE.Mesh(new THREE.CylinderGeometry(sz, sz, sz * 0.3, 32), bodyMat);
    puckBody.rotation.x = Math.PI / 2;
    puckBody.castShadow = true;
    puckBody.receiveShadow = true;
    group.add(puckBody);

    // Polished edge ring with subtle themed glow
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      metalness: 0.75,
      roughness: 0.25,
      emissive: enemy.fire ? 0x441100 : 0x0a1830,
      emissiveIntensity: 0.25
    });
    const edgeRing = new THREE.Mesh(
      new THREE.TorusGeometry(sz, sz * 0.06, 12, 48),
      edgeMat
    );
    edgeRing.rotation.x = Math.PI / 2;
    group.add(edgeRing);

    // Inner bevel detail
    const bevelRing = new THREE.Mesh(
      new THREE.TorusGeometry(sz * 0.85, sz * 0.03, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.7, roughness: 0.3 })
    );
    bevelRing.rotation.x = Math.PI / 2;
    bevelRing.position.z = sz * 0.14;
    group.add(bevelRing);

    // SPECIAL FEATURES FOR NEW ENEMY TYPES
    if (isSpeedSkater) {
      // Speed lines trailing behind
      for (let i = 0; i < 5; i++) {
        const speedLine = new THREE.Mesh(
          new THREE.PlaneGeometry(sz * 0.15, sz * 0.03),
          new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.6 - i * 0.1,
            side: THREE.DoubleSide
          })
        );
        speedLine.position.set(0, sz * 0.1, -sz * (0.4 + i * 0.15));
        speedLine.rotation.x = -Math.PI / 2;
        group.add(speedLine);
      }
      // Energy glow
      const speedGlow = new THREE.Mesh(
        new THREE.SphereGeometry(sz * 0.6, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.2 })
      );
      speedGlow.position.y = 0;
      group.add(speedGlow);
      enemy.speedGlow = speedGlow;
    }

    if (isDefenseman) {
      // Extra armor shoulder pads
      const shoulderPadMat = new THREE.MeshStandardMaterial({
        color: 0x334466,
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.0
      });
      [-1, 1].forEach(side => {
        const shoulderPad = new THREE.Mesh(
          new THREE.BoxGeometry(sz * 0.3, sz * 0.25, sz * 0.2),
          shoulderPadMat
        );
        shoulderPad.position.set(side * sz * 0.7, sz * 0.1, 0);
        shoulderPad.castShadow = true;
        group.add(shoulderPad);
        
        // Reflective stripe
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(sz * 0.32, sz * 0.05, sz * 0.22),
          new THREE.MeshStandardMaterial({ color: 0xaaccff, metalness: 0.9, roughness: 0.1 })
        );
        stripe.position.set(side * sz * 0.7, sz * 0.15, 0);
        group.add(stripe);
      });
    }

    if (isEnforcer) {
      // Spiked helmet effect
      const spikeCount = 6;
      for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2;
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(sz * 0.08, sz * 0.25, 6),
          new THREE.MeshStandardMaterial({ 
            color: 0xdd3333, 
            metalness: 0.8, 
            roughness: 0.2,
            emissive: 0x440000,
            emissiveIntensity: 0.4
          })
        );
        spike.position.set(Math.cos(angle) * sz * 0.7, sz * 0.3, Math.sin(angle) * sz * 0.7);
        spike.rotation.set(0, 0, -Math.PI / 3);
        spike.castShadow = true;
        group.add(spike);
      }
      // Battle scars/scratches (as decorative lines)
      const scarMat = new THREE.MeshBasicMaterial({ color: 0x880000, side: THREE.DoubleSide });
      for (let i = 0; i < 3; i++) {
        const scar = new THREE.Mesh(
          new THREE.PlaneGeometry(sz * 0.5, sz * 0.02),
          scarMat
        );
        scar.position.set(0, sz * 0.05, sz * 0.16);
        scar.rotation.z = Math.random() * Math.PI;
        group.add(scar);
      }
    }

    if (!enemy.fire) {
      // Glowing team logo
      const logoMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.9
      });
      const logo = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.5, 24), logoMat);
      logo.position.z = sz * 0.16;
      group.add(logo);

      // Logo glow ring
      const logoGlow = new THREE.Mesh(
        new THREE.RingGeometry(sz * 0.48, sz * 0.55, 24),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 })
      );
      logoGlow.position.z = sz * 0.155;
      group.add(logoGlow);
      enemy.logoGlow = logoGlow;
    }

    // Boss crown - enhanced with glow
    if (enemy.boss) {
      const crownBase = new THREE.Mesh(
        new THREE.TorusGeometry(sz * 0.6, 0.06, 12, 24),
        mats.gold
      );
      crownBase.position.y = sz * 0.25;
      crownBase.rotation.x = Math.PI / 2;
      crownBase.castShadow = true;
      group.add(crownBase);

      // Crown glow aura
      const crownGlow = new THREE.Mesh(
        new THREE.TorusGeometry(sz * 0.65, 0.1, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.25 })
      );
      crownGlow.position.y = sz * 0.25;
      crownGlow.rotation.x = Math.PI / 2;
      group.add(crownGlow);
      enemy.crownGlow = crownGlow;

      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.07, sz * 0.6, 6),
          mats.gold
        );
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * sz * 0.6, sz * 0.55, Math.sin(angle) * sz * 0.6);
        spike.castShadow = true;
        group.add(spike);
      }

      // Glowing center gem
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.1, 1),
        mats.gemRed
      );
      gem.position.y = sz * 0.58;
      group.add(gem);
      enemy.crownGem = gem;

      // Gem glow effect
      const gemGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 })
      );
      gemGlow.position.y = sz * 0.58;
      group.add(gemGlow);
      enemy.gemGlow = gemGlow;
    }
  } else if (isSpace) {
    // ORBITAL DRONE - emissive core with class rings
    const orb = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 18), bodyMat);
    orb.castShadow = true;
    orb.receiveShadow = true;
    group.add(orb);

    const accent = visual?.accent || 0x67e8f9;
    const ringMat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const ringCount = enemy.boss ? 3 : (enemy.armor ? 2 : 1);
    for (let i = 0; i < ringCount; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(sz * (0.95 + i * 0.18), sz * 0.035, 8, 32), ringMat);
      ring.rotation.x = Math.PI / 2 + i * 0.45;
      ring.rotation.y = i * 0.8;
      group.add(ring);
      enemy.orbitalRings = enemy.orbitalRings || [];
      enemy.orbitalRings.push(ring);
    }

    if (enemy.role === 'SPEEDSTER' || enemy.speedClass === 'very_fast') {
      for (let i = 0; i < 4; i++) {
        const streak = new THREE.Mesh(
          new THREE.CylinderGeometry(sz * 0.018, sz * 0.03, sz * 1.4, 5),
          ringMat
        );
        streak.rotation.x = Math.PI / 2;
        streak.position.z = -sz * (0.6 + i * 0.2);
        group.add(streak);
      }
    }

    if (enemy.boss) {
      const crown = new THREE.Mesh(new THREE.TorusGeometry(sz * 1.25, sz * 0.08, 8, 32), mats.gold);
      crown.position.y = sz * 0.9;
      crown.rotation.x = Math.PI / 2;
      group.add(crown);
      enemy.crownGlow = crown;
    }
    
    // Add particle effects for space enemies
    const qualityTier = getQualityName();
    if (qualityTier !== 'low') {
      // Particle system for energy trails
      const particles = new THREE.Group();
      
      // Create a few floating particles around the enemy
      for (let i = 0; i < 15; i++) {
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(sz * 0.03, 8, 8),
          new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: 0.7
          })
        );
        
        // Random position around the enemy
        const angle = Math.random() * Math.PI * 2;
        const distance = sz * (0.5 + Math.random() * 0.5);
        particle.position.set(
          Math.cos(angle) * distance,
          Math.sin(Math.random() * Math.PI) * sz * 0.5,
          Math.sin(angle) * distance
        );
        
        particles.add(particle);
      }
      
      group.add(particles);
      enemy.particleSystem = particles;
    }
  } else {
    // SOCCER BALL - Enhanced with better geometry and shine
    const ballBody = new THREE.Mesh(new THREE.SphereGeometry(sz, 32, 32), bodyMat);
    ballBody.castShadow = true;
    ballBody.receiveShadow = true;
    group.add(ballBody);

    // Pentagon patches with better materials
    if (!enemy.fire) {
      const patchMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.1,
        roughness: 0.6
      });
      const pentagonPositions = [
        [0, 1, 0], [0, -1, 0], 
        [1, 0, 0], [-1, 0, 0],
        [0, 0, 1], [0, 0, -1]
      ];
      for (let i = 0; i < pentagonPositions.length; i++) {
        const pos = pentagonPositions[i];
        const patch = new THREE.Mesh(
          new THREE.SphereGeometry(sz * 0.4, 8, 8),
          patchMat
        );
        patch.position.set(pos[0] * sz * 0.9, pos[1] * sz * 0.9, pos[2] * sz * 0.9);
        patch.lookAt(0, 0, 0);
        group.add(patch);
      }
    }

    // Add a subtle glow to the ball
    const ballGlow = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 1.05, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      })
    );
    group.add(ballGlow);
    enemy.ballGlow = ballGlow;
  }

  // Armor plates - enhanced with metallic sheen (metalness >= 0.8)
  if (enemy.armor > 0 && !enemy.boss) {
    const plateCount = Math.min(4 + enemy.armor, 8);

    // Override armor material with higher metalness for sheen effect
    const sheenArmorMat = new THREE.MeshStandardMaterial({
      color: 0x4a5c6e,
      metalness: 0.85,
      roughness: 0.18,
      envMapIntensity: 1.0
    });

    for (let i = 0; i < plateCount; i++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(sz * 0.42, sz * 0.42, 0.05),
        sheenArmorMat
      );
      const angle = (i / plateCount) * Math.PI * 2 + Math.PI / plateCount;
      plate.position.set(Math.cos(angle) * sz * 0.98, 0, Math.sin(angle) * sz * 0.98);
      plate.lookAt(0, 0, 0);
      plate.castShadow = true;
      plate.receiveShadow = true;
      group.add(plate);

      // Plate edge highlight
      const edgeHighlight = new THREE.Mesh(
        new THREE.BoxGeometry(sz * 0.44, sz * 0.44, 0.02),
        new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.4 })
      );
      edgeHighlight.position.copy(plate.position);
      edgeHighlight.position.multiplyScalar(1.02);
      edgeHighlight.lookAt(0, 0, 0);
      group.add(edgeHighlight);
    }

    // Enhanced rivets with metallic shine
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.95,
      roughness: 0.05
    });
    for (let i = 0; i < plateCount * 2; i++) {
      const rivet = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 8),
        rivetMat
      );
      const angle = (i / (plateCount * 2)) * Math.PI * 2;
      rivet.position.set(
        Math.cos(angle) * sz * 1.08,
        Math.sin(angle * 3) * sz * 0.18,
        Math.sin(angle) * sz * 1.08
      );
      rivet.castShadow = true;
      group.add(rivet);
    }

    // Armor glow when taking damage
    const armorGlow = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 1.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x6688aa, transparent: true, opacity: 0 })
    );
    group.add(armorGlow);
    enemy.armorGlow = armorGlow;

    // Metallic rim highlight mesh
    const rimHighlight = new THREE.Mesh(
      new THREE.TorusGeometry(sz * 1.05, sz * 0.018, 8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xc8d8e8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
    );
    rimHighlight.rotation.x = Math.PI / 2;
    group.add(rimHighlight);
    enemy.rimHighlight = rimHighlight;
  }

  // Health bar - enhanced with border and glow
  const hpHeight = enemy.boss ? sz * 1.8 : sz * 1.5;

  // Outer border
  const hpBorderGeo = new THREE.PlaneGeometry(sz * 2.6, 0.22);
  const hpBorder = new THREE.Mesh(hpBorderGeo, new THREE.MeshBasicMaterial({
    color: 0x222222,
    side: THREE.DoubleSide
  }));
  hpBorder.position.y = hpHeight;
  hpBorder.rotation.x = -Math.PI / 2;
  group.add(hpBorder);

  // Background
  const hpBgGeo = new THREE.PlaneGeometry(sz * 2.5, 0.18);
  const hpBg = new THREE.Mesh(hpBgGeo, new THREE.MeshBasicMaterial({
    color: 0x111111,
    side: THREE.DoubleSide
  }));
  hpBg.position.y = hpHeight + 0.005;
  hpBg.rotation.x = -Math.PI / 2;
  group.add(hpBg);

  // Health fill
  const hpBarGeo = new THREE.PlaneGeometry(sz * 2.3, 0.14);
  const hpBar = new THREE.Mesh(hpBarGeo, mats.hpFull.clone());
  hpBar.position.y = hpHeight + 0.01;
  hpBar.rotation.x = -Math.PI / 2;
  // Smooth fill transition userData
  hpBar.userData.targetWidth = 1.0;
  hpBar.userData.currentWidth = 1.0;
  group.add(hpBar);
  enemy.hpBar = hpBar;
  enemy.hpSize = sz * 2.3;

  // Damage flash overlay — white plane that appears briefly on hit
  const hpFlashGeo = new THREE.PlaneGeometry(sz * 2.3, 0.14);
  const hpDamageFlash = new THREE.Mesh(hpFlashGeo, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  }));
  hpDamageFlash.position.y = hpHeight + 0.012;
  hpDamageFlash.rotation.x = -Math.PI / 2;
  group.add(hpDamageFlash);
  enemy.hpDamageFlash = hpDamageFlash;

  // Health bar shine
  const hpShineGeo = new THREE.PlaneGeometry(sz * 2.3, 0.04);
  const hpShine = new THREE.Mesh(hpShineGeo, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  }));
  hpShine.position.y = hpHeight + 0.015;
  hpShine.position.z = -sz * 0.02;
  hpShine.rotation.x = -Math.PI / 2;
  group.add(hpShine);

  // Store reference for HP color changes
  enemy.hpMats = mats;

  // Movement trail ribbons for fast enemies (SC-5.5: skip on low quality)
  const qualityTier = getQualityName();
  const isFastEnemy = enemy.speed === 'fast' || enemy.speed === 'very_fast';
  if (isFastEnemy && qualityTier !== 'low') {
    group.userData.hasTrail = true;
    const enemyColor = (enemy.fire ? 0xff6600 : 0x00d4ff);
    const trailOpacities = [0.3, 0.15, 0.08];
    enemy.trailMeshes = [];
    for (let i = 0; i < trailOpacities.length; i++) {
      const trailPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(sz * 0.3, sz * 0.2),
        new THREE.MeshBasicMaterial({
          color: enemyColor,
          transparent: true,
          opacity: trailOpacities[i],
          side: THREE.DoubleSide
        })
      );
      trailPlane.position.set(0, 0, -sz * (0.5 + i * 0.35));
      trailPlane.rotation.x = -Math.PI / 2;
      group.add(trailPlane);
      enemy.trailMeshes.push(trailPlane);
    }
  }

  // Motion trail group (populated during movement)
  enemy.trailParticles = [];

  // === STATUS EFFECT VISUALS ===
  // These are created once and toggled visible based on status

  // Slow effect - ice crystals and frost aura
  const slowGroup = new THREE.Group();
  slowGroup.visible = false;

  // Frost aura ring
  const frostAura = new THREE.Mesh(
    new THREE.RingGeometry(sz * 0.9, sz * 1.1, 24),
    new THREE.MeshBasicMaterial({
      color: 0x88ddff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    })
  );
  frostAura.rotation.x = -Math.PI / 2;
  frostAura.position.y = 0.05;
  slowGroup.add(frostAura);

  // Ice crystals orbiting - 10 crystals on high, 4 on low quality (SC-5.5)
  const qualityForCrystals = getQualityName();
  const CRYSTAL_COUNT = qualityForCrystals === 'low' ? 4 : 10;
  enemy.iceCrystals = [];
  for (let i = 0; i < CRYSTAL_COUNT; i++) {
    const sizeVariation = 0.06 + (i % 3) * 0.02; // 0.06, 0.08, 0.10 cycling
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(sz * sizeVariation, 0),
      new THREE.MeshStandardMaterial({
        color: 0xaaeeff,
        transparent: true,
        opacity: 0.85,
        emissive: 0x88ddff,
        emissiveIntensity: 0.4
      })
    );
    const angle = (i / CRYSTAL_COUNT) * Math.PI * 2;
    crystal.position.set(
      Math.cos(angle) * sz * 1.0,
      sz * 0.3 + Math.sin(i) * sz * 0.1,
      Math.sin(angle) * sz * 1.0
    );
    slowGroup.add(crystal);
    enemy.iceCrystals.push({ mesh: crystal, baseAngle: angle });
  }

  // Frost particles floating up
  enemy.frostParticles = [];
  for (let i = 0; i < 4; i++) {
    const frost = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 0.04, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xccffff,
        transparent: true,
        opacity: 0.7
      })
    );
    const angle = (i / 4) * Math.PI * 2;
    frost.position.set(
      Math.cos(angle) * sz * 0.6,
      sz * 0.5,
      Math.sin(angle) * sz * 0.6
    );
    slowGroup.add(frost);
    enemy.frostParticles.push({ mesh: frost, offset: i });
  }

  group.add(slowGroup);
  enemy.slowGroup = slowGroup;
  enemy.frostAura = frostAura;

  // Burn effect - fire particles and heat shimmer
  const burnGroup = new THREE.Group();
  burnGroup.visible = false;

  // Heat shimmer aura
  const heatAura = new THREE.Mesh(
    new THREE.SphereGeometry(sz * 1.2, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    })
  );
  burnGroup.add(heatAura);

  // Burn flames
  enemy.burnFlames = [];
  for (let i = 0; i < 8; i++) {
    const burnFlame = new THREE.Mesh(
      new THREE.ConeGeometry(sz * 0.1, sz * 0.25, 6),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff2200 : 0xff6600,
        transparent: true,
        opacity: 0.85
      })
    );
    const angle = (i / 8) * Math.PI * 2;
    burnFlame.position.set(
      Math.cos(angle) * sz * 0.75,
      sz * 0.15,
      Math.sin(angle) * sz * 0.75
    );
    burnFlame.rotation.x = Math.PI / 2;
    burnGroup.add(burnFlame);
    enemy.burnFlames.push({ mesh: burnFlame, baseAngle: angle });
  }

  // Heat distortion ring - animated torus above enemy
  const heatRing = new THREE.Mesh(
    new THREE.TorusGeometry(sz * 0.8, sz * 0.03, 8, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    })
  );
  heatRing.position.y = sz * 0.8;
  heatRing.rotation.x = Math.PI / 2;
  burnGroup.add(heatRing);
  enemy.heatRing = heatRing;

  // Ember particles - 8 on high, 3 on low quality (SC-5.5)
  const qualityForEmbers = getQualityName();
  const EMBER_COUNT = qualityForEmbers === 'low' ? 3 : 8;
  enemy.burnEmbers = [];
  for (let i = 0; i < EMBER_COUNT; i++) {
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 0.03, 4, 4),
      new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.9
      })
    );
    const angle = (i / 8) * Math.PI * 2;
    ember.position.set(
      Math.cos(angle) * sz * 0.5,
      sz * 0.8 + (i % 3) * sz * 0.1,
      Math.sin(angle) * sz * 0.5
    );
    burnGroup.add(ember);
    enemy.burnEmbers.push({ mesh: ember, offset: i });
  }

  group.add(burnGroup);
  enemy.burnGroup = burnGroup;
  enemy.heatAura = heatAura;

  // Boss upgrades: scale 1.3x + pulsing aura (SC-5.5: skip aura on low quality)
  if (enemy.boss) {
    group.scale.x = 1.3;
    group.scale.y = 1.3;
    group.scale.z = 1.3;

    const qualityForAura = getQualityName();
    if (qualityForAura !== 'low') {
      const auraRadius = sz * 1.6;
      const bossAura = new THREE.Mesh(
        new THREE.SphereGeometry(auraRadius, 16, 12),
        new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide
        })
      );
      group.add(bossAura);
      enemy.bossAura = bossAura;
      
      // Add pulsing effect to boss aura
      const pulseSpeed = 1.5;
      const pulseIntensity = 0.3;
      enemy.pulseOffset = Math.random() * Math.PI * 2;
      enemy.pulseSpeed = pulseSpeed;
      enemy.pulseIntensity = pulseIntensity;
    }
    
    // Add special boss effects
    if (qualityTier !== 'low') {
      // Boss energy rings
      const bossRings = new THREE.Group();
      
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(sz * (1.2 + i * 0.2), sz * 0.05, 16, 32),
          new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
          })
        );
        ring.rotation.x = Math.PI / 2;
        bossRings.add(ring);
      }
      
      group.add(bossRings);
      enemy.bossRings = bossRings;
    }
  }

  group.position.set(enemy.x, enemy.flying ? 1.2 : 0.2, enemy.z);

  return group;
}
