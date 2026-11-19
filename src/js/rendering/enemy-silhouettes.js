// Role silhouettes for enemies.
//
// Every enemy used to be its theme's base shape (a puck, a ball, an orb) with a
// colour. At the game camera that reads as "some discs". This adds the parts
// that make a role recognisable from its outline alone — wings on flyers, horns
// on elites, a ram on bruisers, a helmet on armoured enemies — plus a face, so
// they read as characters heading somewhere rather than tokens sliding along.
//
// Everything is measured in body radii (`sz`), with +Z as the direction of
// travel (systems/enemies.js turns the mesh to face its heading).

import { composeGeometry } from './geo-utils.js';

const DARK = 0x10151f;

/** Cone whose base sits on the origin, so scaling Y makes it lick upward. */
function flameGeometry(radius, height) {
  const geo = new THREE.ConeGeometry(radius, height, 7);
  geo.translate(0, height / 2, 0);
  return geo;
}

/** A swept wing lying flat, hinged at the origin and reaching along +X. */
function wingGeometry(span) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.38);
  shape.lineTo(span, 0.12);
  shape.lineTo(span * 0.86, -0.22);
  shape.lineTo(span * 0.62, -0.12);
  shape.lineTo(span * 0.46, -0.48);
  shape.lineTo(span * 0.26, -0.3);
  shape.lineTo(0, -0.42);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

const sphere = (r, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const cone = (r, h, seg = 7) => new THREE.ConeGeometry(r, h, seg);

/**
 * Where the face goes. A ball's face wraps its front; a puck stands on edge
 * with its flat side forward, so the face sits just proud of that side.
 */
function faceLayout(shape) {
  if (shape === 'disc') return { z: 0.2, eyeX: 0.36, eyeY: 0.2, flat: 0.45 };
  return { z: 0.84, eyeX: 0.36, eyeY: 0.26, flat: 0.7 };
}

function addFace(parts, shape, mood) {
  const f = faceLayout(shape);
  const eyeR = mood === 'big' ? 0.26 : 0.21;
  // On a ball the eyes sit on a dark mask: white eyes vanish on a white ball.
  if (shape !== 'disc') {
    parts.dark.push({ geo: sphere(0.6, 14, 10), p: [0, f.eyeY, 0.5], s: [1.35, 0.62, 0.72] });
  }
  for (const side of [-1, 1]) {
    parts.white.push({ geo: sphere(eyeR), p: [side * f.eyeX, f.eyeY, f.z], s: [1, 1, f.flat] });
    parts.dark.push({ geo: sphere(eyeR * 0.5, 8, 6), p: [side * f.eyeX * 0.94, f.eyeY - 0.02, f.z + eyeR * f.flat * 0.8], s: [1, 1, 0.6] });
    if (mood !== 'big') {
      // Brows slanting down toward the middle: an angry glare.
      const tilt = mood === 'furious' ? 0.6 : 0.38;
      parts.dark.push({
        geo: box(0.44, 0.1, 0.12),
        p: [side * f.eyeX, f.eyeY + eyeR * 1.05, f.z + eyeR * f.flat * 0.7],
        r: [0, 0, -side * tilt]
      });
    }
  }
}

function addFeet(parts, spread, size) {
  for (const side of [-1, 1]) {
    parts.dark.push({ geo: sphere(size), p: [side * spread, -0.92, 0.18], s: [1, 0.55, 1.5] });
  }
}

function addHorns(parts, size, spread) {
  for (const side of [-1, 1]) {
    parts.accent.push({ geo: cone(0.17 * size, 0.75 * size), p: [side * spread, 0.92, 0.1], r: [0.25, 0, -side * 0.55] });
    parts.accent.push({ geo: cone(0.11 * size, 0.5 * size), p: [side * (spread + 0.34 * size), 1.32 * (0.75 + size * 0.25), 0.2], r: [0.5, 0, -side * 0.15] });
  }
}

/**
 * Add the role's silhouette to an enemy's mesh group.
 *
 * Static parts are merged to one mesh per material. Wings and flames stay
 * separate and are stored on the enemy, where rendering/animations.js already
 * looks for them (`enemy.wings`, `enemy.flames`).
 *
 * @param {THREE.Group} group
 * @param {object} enemy
 * @param {number} sz - body radius in world units
 * @param {'disc'|'ball'} shape - the theme's base body
 * @param {number} accentColor
 */
export function addRoleSilhouette(group, enemy, sz, shape, accentColor) {
  const role = (enemy.role || 'SWARM').toUpperCase();
  const parts = { dark: [], accent: [], white: [] };
  const flames = [];   // [x, y, z, radius, height]
  let wingSpan = 0;

  switch (role) {
    case 'FIRE':
      addFace(parts, shape, 'angry');
      addFeet(parts, 0.42, 0.24);
      flames.push([0, 0.9, -0.05, 0.3, 0.85], [-0.38, 0.8, -0.1, 0.2, 0.55], [0.38, 0.8, -0.1, 0.2, 0.55]);
      break;

    case 'FLYING':
      addFace(parts, shape, 'big');
      wingSpan = 1.7;
      // Tail fin, so it has a front and a back from above.
      parts.accent.push({ geo: cone(0.22, 0.7, 4), p: [0, 0.25, -1.05], r: [-1.2, 0, 0], s: [0.35, 1, 1] });
      break;

    case 'FLYING_FIRE':
      addFace(parts, shape, 'furious');
      wingSpan = 1.9;
      flames.push([0, 0.2, -0.95, 0.3, 0.9], [-0.3, 0.1, -0.85, 0.18, 0.55], [0.3, 0.1, -0.85, 0.18, 0.55]);
      break;

    case 'ARMORED':
      addFace(parts, shape, 'angry');
      addFeet(parts, 0.5, 0.32);
      // Helmet dome with a crest and a jaw guard.
      parts.dark.push({ geo: new THREE.SphereGeometry(1.06, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.36), p: [0, 0.08, 0], s: shape === 'disc' ? [1, 1, 0.42] : 1 });
      parts.accent.push({ geo: box(0.16, 0.3, shape === 'disc' ? 0.7 : 1.4), p: [0, 1.12, -0.05] });
      parts.dark.push({ geo: box(1.5, 0.14, 0.2), p: [0, -0.28, shape === 'disc' ? 0.22 : 0.92] });
      break;

    case 'BRUISER':
      addFace(parts, shape, 'furious');
      addFeet(parts, 0.5, 0.3);
      // Ram bar out front, and a fist on each side.
      parts.accent.push({ geo: box(2.0, 0.3, 0.3), p: [0, -0.2, shape === 'disc' ? 0.5 : 1.05] });
      for (const side of [-1, 1]) {
        parts.accent.push({ geo: cone(0.2, 0.42, 6), p: [side * 0.92, -0.2, shape === 'disc' ? 0.7 : 1.25], r: [Math.PI / 2, 0, 0] });
        parts.dark.push({ geo: sphere(0.34), p: [side * 1.22, -0.1, 0.25] });
      }
      break;

    case 'SPEEDSTER':
      addFace(parts, shape, 'angry');
      // Swept mohawk fin and two back-raked spines: reads as "fast" standing still.
      parts.accent.push({ geo: cone(0.3, 1.3, 4), p: [0, 0.95, -0.35], r: [-1.05, 0, 0], s: [0.3, 1, 1] });
      for (const side of [-1, 1]) {
        parts.accent.push({ geo: cone(0.13, 0.9, 5), p: [side * 0.62, 0.42, -0.72], r: [-1.25, 0, 0] });
        parts.dark.push({ geo: box(0.1, 0.12, 1.3), p: [side * 0.4, -0.98, 0.1] });
      }
      break;

    case 'ELITE':
      addFace(parts, shape, 'furious');
      addFeet(parts, 0.5, 0.3);
      addHorns(parts, 1, 0.5);
      flames.push([0, 0.92, -0.25, 0.26, 0.7]);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        if (Math.cos(a) > 0.8 && shape !== 'disc') continue;
        parts.dark.push({ geo: cone(0.12, 0.42, 5), p: [Math.sin(a) * 1.08, -0.38, Math.cos(a) * (shape === 'disc' ? 0.2 : 1.08)], r: [Math.cos(a) * 1.57, 0, -Math.sin(a) * 1.57] });
      }
      break;

    case 'BOSS':
      addFace(parts, shape, 'furious');
      addFeet(parts, 0.56, 0.38);
      addHorns(parts, 1.35, 0.72);
      // Tusks and shoulder spikes.
      for (const side of [-1, 1]) {
        parts.white.push({ geo: cone(0.11, 0.5, 6), p: [side * 0.3, -0.34, shape === 'disc' ? 0.34 : 0.95], r: [-0.5, 0, 0] });
        parts.dark.push({ geo: cone(0.2, 0.62, 5), p: [side * 1.12, 0.3, -0.05], r: [0, 0, -side * 1.15] });
        parts.dark.push({ geo: cone(0.15, 0.46, 5), p: [side * 1.05, -0.2, -0.3], r: [0, 0, -side * 1.5] });
      }
      break;

    default: // SWARM and anything unrecognised
      addFace(parts, shape, 'big');
      addFeet(parts, 0.4, 0.24);
      // A little antenna-tuft so the smallest enemy still has a top.
      parts.accent.push({ geo: cone(0.12, 0.4, 5), p: [0, 1.08, 0] });
      break;
  }

  const fiery = flames.length > 0;
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor, metalness: 0.35, roughness: 0.4,
    emissive: accentColor, emissiveIntensity: 0.35
  });
  const materials = {
    dark: new THREE.MeshStandardMaterial({ color: DARK, metalness: 0.3, roughness: 0.55 }),
    accent: accentMat,
    white: new THREE.MeshBasicMaterial({ color: 0xffffff })
  };

  for (const key of ['dark', 'accent', 'white']) {
    if (!parts[key].length) continue;
    const mesh = new THREE.Mesh(composeGeometry(parts[key]), materials[key]);
    mesh.scale.setScalar(sz);
    mesh.castShadow = key !== 'white';
    group.add(mesh);
  }

  if (wingSpan) {
    const wingMat = new THREE.MeshStandardMaterial({
      color: accentColor, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide,
      emissive: fiery ? 0xff4400 : accentColor, emissiveIntensity: fiery ? 0.6 : 0.3
    });
    enemy.wings = [1, -1].map(side => {
      const geo = wingGeometry(wingSpan);
      if (side < 0) geo.scale(-1, 1, 1);
      const wing = new THREE.Mesh(geo, wingMat);
      wing.scale.setScalar(sz);
      wing.position.set(side * sz * 0.7, sz * 0.25, 0);
      wing.castShadow = true;
      group.add(wing);
      return wing;
    });
  }

  if (fiery) {
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff8a1f, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffe27a });
    enemy.flames = [];
    for (const [x, y, z, r, h] of flames) {
      const tail = z < -0.6;   // tail flames trail backward instead of rising
      for (const [mat, k] of [[flameMat, 1], [coreMat, 0.5]]) {
        const flame = new THREE.Mesh(flameGeometry(r * k * sz, h * k * sz), mat);
        flame.position.set(x * sz, y * sz, z * sz);
        if (tail) flame.rotation.x = -Math.PI / 2;
        group.add(flame);
        enemy.flames.push(flame);
      }
    }
  }
}
