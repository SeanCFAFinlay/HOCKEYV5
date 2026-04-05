// Enemy mesh creation with pooling support and enhanced visuals

import { getState } from '../engine/state.js';

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
    // Puck body - dark with subtle metallic sheen
    puckBody: new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.6,
      roughness: 0.3,
      envMapIntensity: 0.8
    }),
    // Soccer ball - glossy white
    ballBody: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.4,
      envMapIntensity: 0.5
    }),
    // Fire body - emissive glow
    fireBody: new THREE.MeshStandardMaterial({
      color: 0xff3300,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0xff2200,
      emissiveIntensity: 0.6
    }),
    // Gold crown
    gold: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0xaa8800,
      emissiveIntensity: 0.3
    }),
    // Crown gem - glowing red
    gemRed: new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.3,
      roughness: 0.2,
      emissive: 0xff0000,
      emissiveIntensity: 0.8
    }),
    // Armor plates
    armor: new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.0
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
  group.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

export function createEnemyMesh(enemy) {
  const state = getState();
  const { theme, COLS, ROWS } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const group = new THREE.Group();
  const isHockey = theme === 'hockey';
  const sz = (enemy.sz || 1) * 0.28;
  const mats = getSharedMaterials();

  // Select appropriate body material
  let bodyMat;
  if (enemy.fire) {
    bodyMat = mats.fireBody;
  } else if (isHockey) {
    bodyMat = mats.puckBody;
  } else {
    bodyMat = mats.ballBody;
  }

  if (isHockey) {
    // Determine enemy type by name for special visuals
    const enemyName = enemy.nm || '';
    const isSpeedSkater = enemyName.includes('Speed Skater');
    const isDefenseman = enemyName.includes('Defenseman');
    const isEnforcer = enemyName.includes('Enforcer');
    
    // Adjust body material for new enemy types
    if (isSpeedSkater) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff, // Bright cyan for speed
        metalness: 0.7,
        roughness: 0.2,
        emissive: 0x00aaaa,
        emissiveIntensity: 0.5
      });
    } else if (isDefenseman) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0x2244aa, // Dark blue for defenseman
        metalness: 0.6,
        roughness: 0.3,
        envMapIntensity: 0.8
      });
    } else if (isEnforcer) {
      bodyMat = new THREE.MeshStandardMaterial({
        color: 0xaa2222, // Dark red for enforcer
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x440000,
        emissiveIntensity: 0.3
      });
    }
    
    // PUCK - Enhanced with beveled edges and glow
    const puckBody = new THREE.Mesh(new THREE.CylinderGeometry(sz, sz, sz * 0.3, 32), bodyMat);
    puckBody.rotation.x = Math.PI / 2;
    puckBody.castShadow = true;
    puckBody.receiveShadow = true;
    group.add(puckBody);

    // Polished edge ring with subtle glow
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x444455,
      metalness: 0.8,
      roughness: 0.2,
      emissive: enemy.fire ? 0x331100 : 0x001122,
      emissiveIntensity: 0.3
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
          new THREE.ConeGeometry(0.06, sz * 0.45, 6),
          mats.gold
        );
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * sz * 0.6, sz * 0.48, Math.sin(angle) * sz * 0.6);
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
        [0.894, 0.447, 0], [0.276, 0.447, 0.851], [-0.724, 0.447, 0.526],
        [-0.724, 0.447, -0.526], [0.276, 0.447, -0.851],
        [0.724, -0.447, 0.526], [-0.276, -0.447, 0.851], [-0.894, -0.447, 0],
        [-0.276, -0.447, -0.851], [0.724, -0.447, -0.526]
      ];

      pentagonPositions.forEach(([px, py, pz]) => {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(sz * 0.32, 5), patchMat);
        patch.position.set(px * sz * 1.01, py * sz * 1.01, pz * sz * 1.01);
        patch.lookAt(0, 0, 0);
        patch.rotateZ(Math.PI / 5);
        group.add(patch);
      });

      // Subtle shine highlight
      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(sz * 0.25, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
      );
      shine.position.set(sz * 0.4, sz * 0.5, sz * 0.4);
      group.add(shine);
    }

    // Boss crown - enhanced with glow
    if (enemy.boss) {
      const crownBase = new THREE.Mesh(
        new THREE.TorusGeometry(sz * 0.7, 0.07, 12, 24),
        mats.gold
      );
      crownBase.position.y = sz * 0.85;
      crownBase.rotation.x = Math.PI / 2;
      crownBase.castShadow = true;
      group.add(crownBase);

      // Crown glow aura
      const crownGlow = new THREE.Mesh(
        new THREE.TorusGeometry(sz * 0.75, 0.12, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.25 })
      );
      crownGlow.position.y = sz * 0.85;
      crownGlow.rotation.x = Math.PI / 2;
      group.add(crownGlow);
      enemy.crownGlow = crownGlow;

      for (let i = 0; i < 5; i++) {
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.07, sz * 0.55, 6),
          mats.gold
        );
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.cos(angle) * sz * 0.7, sz * 1.1, Math.sin(angle) * sz * 0.7);
        spike.castShadow = true;
        group.add(spike);
      }

      // Glowing center gem
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 1),
        mats.gemRed
      );
      gem.position.y = sz * 1.25;
      group.add(gem);
      enemy.crownGem = gem;

      // Gem glow effect
      const gemGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 })
      );
      gemGlow.position.y = sz * 1.25;
      group.add(gemGlow);
      enemy.gemGlow = gemGlow;
    }
  }

  // Fire effects - enhanced with layered glow
  if (enemy.fire) {
    const flameCount = enemy.boss ? 12 : 6;
    enemy.flames = [];

    // Outer fire glow
    const fireGlow = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 1.3, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.15 })
    );
    group.add(fireGlow);
    enemy.fireGlow = fireGlow;

    // Main flames
    for (let i = 0; i < flameCount; i++) {
      const flameColor = i % 3 === 0 ? 0xff2200 : (i % 3 === 1 ? 0xff6600 : 0xffaa00);
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(sz * 0.22, sz * 0.6, 8),
        new THREE.MeshBasicMaterial({ color: flameColor, transparent: true, opacity: 0.9 })
      );
      const angle = (i / flameCount) * Math.PI * 2;
      flame.position.set(Math.cos(angle) * sz * 0.65, sz * 0.35, Math.sin(angle) * sz * 0.65);
      group.add(flame);
      enemy.flames.push(flame);
    }

    // Inner flames - bright core
    for (let i = 0; i < 5; i++) {
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(sz * 0.18, sz * 0.7, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.95 })
      );
      const angle = (i / 5) * Math.PI * 2 + 0.4;
      innerFlame.position.set(Math.cos(angle) * sz * 0.35, sz * 0.4, Math.sin(angle) * sz * 0.35);
      group.add(innerFlame);
      enemy.flames.push(innerFlame);
    }

    // Hot core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(sz * 0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffff66, transparent: true, opacity: 0.6 })
    );
    core.position.y = sz * 0.2;
    group.add(core);
    enemy.fireCore = core;

    // Embers
    enemy.embers = [];
    for (let i = 0; i < 6; i++) {
      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(sz * 0.05, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.8 })
      );
      const angle = (i / 6) * Math.PI * 2;
      ember.position.set(Math.cos(angle) * sz * 0.8, sz * 0.6 + Math.random() * sz * 0.3, Math.sin(angle) * sz * 0.8);
      group.add(ember);
      enemy.embers.push(ember);
    }
  }

  // Flying wings - enhanced with glow and detail
  if (enemy.flying) {
    enemy.wings = [];

    // Wing glow aura
    const wingGlowMat = new THREE.MeshBasicMaterial({
      color: 0x66bbff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x88ddff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const wingDetailMat = new THREE.MeshBasicMaterial({
      color: 0xaaeeff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    [-1, 1].forEach(side => {
      // Outer glow wing
      const glowShape = new THREE.Shape();
      glowShape.moveTo(0, 0);
      glowShape.quadraticCurveTo(sz * 0.8, sz * 0.4, sz * 1.4, 0);
      glowShape.quadraticCurveTo(sz * 0.8, -sz * 0.3, 0, 0);
      const glowWing = new THREE.Mesh(new THREE.ShapeGeometry(glowShape), wingGlowMat);
      glowWing.position.set(side * sz * 0.5, sz * 0.2, 0);
      glowWing.rotation.y = side * 0.3;
      glowWing.scale.x = side;
      group.add(glowWing);

      // Main wing
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.quadraticCurveTo(sz * 0.7, sz * 0.35, sz * 1.25, 0);
      wingShape.quadraticCurveTo(sz * 0.7, -sz * 0.22, 0, 0);
      const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat);
      wing.position.set(side * sz * 0.5, sz * 0.2, 0);
      wing.rotation.y = side * 0.3;
      wing.scale.x = side;
      group.add(wing);
      enemy.wings.push(wing);

      // Wing detail lines
      for (let i = 1; i <= 3; i++) {
        const lineShape = new THREE.Shape();
        lineShape.moveTo(0, 0);
        lineShape.lineTo(sz * (0.3 + i * 0.25), sz * (0.1 - i * 0.03));
        const line = new THREE.Mesh(
          new THREE.ShapeGeometry(lineShape),
          wingDetailMat
        );
        line.position.set(side * sz * 0.5, sz * 0.2, 0.001 * side);
        line.rotation.y = side * 0.3;
        line.scale.x = side;
        group.add(line);
      }
    });

    // Trail sparkles for flying enemies
    enemy.flyingSparkles = [];
    for (let i = 0; i < 4; i++) {
      const sparkle = new THREE.Mesh(
        new THREE.OctahedronGeometry(sz * 0.06, 0),
        new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.7 })
      );
      sparkle.position.set(0, sz * 0.2, -sz * 0.5 - i * sz * 0.3);
      group.add(sparkle);
      enemy.flyingSparkles.push(sparkle);
    }
  }

  // Armor plates - enhanced with better materials and detail
  if (enemy.armor > 0 && !enemy.boss) {
    const plateCount = Math.min(4 + enemy.armor, 8);

    for (let i = 0; i < plateCount; i++) {
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(sz * 0.42, sz * 0.42, 0.05),
        mats.armor
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
  }

  // Health bar - enhanced with border and glow
  const hpHeight = enemy.boss ? sz * 1.8 : sz * 1.5;

  // Outer border
  const hpBorderGeo = new THREE.PlaneGeometry(sz * 2.3, 0.16);
  const hpBorder = new THREE.Mesh(hpBorderGeo, new THREE.MeshBasicMaterial({
    color: 0x444444,
    side: THREE.DoubleSide
  }));
  hpBorder.position.y = hpHeight;
  hpBorder.rotation.x = -Math.PI / 2;
  group.add(hpBorder);

  // Background
  const hpBgGeo = new THREE.PlaneGeometry(sz * 2.2, 0.12);
  const hpBg = new THREE.Mesh(hpBgGeo, new THREE.MeshBasicMaterial({
    color: 0x1a1a1a,
    side: THREE.DoubleSide
  }));
  hpBg.position.y = hpHeight + 0.005;
  hpBg.rotation.x = -Math.PI / 2;
  group.add(hpBg);

  // Health fill
  const hpBarGeo = new THREE.PlaneGeometry(sz * 2, 0.08);
  const hpBar = new THREE.Mesh(hpBarGeo, mats.hpFull.clone());
  hpBar.position.y = hpHeight + 0.01;
  hpBar.rotation.x = -Math.PI / 2;
  group.add(hpBar);
  enemy.hpBar = hpBar;
  enemy.hpSize = sz * 2;

  // Health bar shine
  const hpShineGeo = new THREE.PlaneGeometry(sz * 2, 0.03);
  const hpShine = new THREE.Mesh(hpShineGeo, new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  }));
  hpShine.position.y = hpHeight + 0.015;
  hpShine.position.z = -sz * 0.02;
  hpShine.rotation.x = -Math.PI / 2;
  group.add(hpShine);

  // Store reference for HP color changes
  enemy.hpMats = mats;

  // Motion trail group (populated during movement)
  enemy.trailParticles = [];

  group.position.set(enemy.x, enemy.flying ? 1.2 : 0.2, enemy.z);

  return group;
}
