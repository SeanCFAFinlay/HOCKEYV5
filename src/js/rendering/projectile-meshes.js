// Projectile visuals — one distinct, readable shape per projectile kind.
//
// Every geometry and material here is built once and shared by every shot of
// that kind. Firing used to allocate a fresh geometry, a fresh material and
// three 16x16 glow spheres per shot and dispose them all on impact; a
// fast-firing tower churned through hundreds of GPU objects a minute.
//
// Convention: geometry "forward" is +Z, which is the axis Object3D.lookAt()
// points at its target, so oriented projectiles fly nose-first.

import { composeGeometry } from './geo-utils.js';

const _geos = new Map();
const _mats = new Map();
let _haloTexture = null;

const HALF_PI = Math.PI / 2;

/** Five-point star, extruded — the boss-killer shot. */
function starGeometry(outer, inner, depth) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 + HALF_PI;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: depth * 0.3, bevelSegments: 1, steps: 1
  });
  geo.center();
  return geo;
}

const GEOMETRY_BUILDERS = {
  // Flat disc that skims the ice.
  puck: () => composeGeometry([
    { geo: new THREE.CylinderGeometry(0.17, 0.17, 0.07, 20) },
    { geo: new THREE.TorusGeometry(0.17, 0.016, 6, 20), r: [HALF_PI, 0, 0] }
  ]),

  // Long needle: bright fat head, tail tapering to nothing.
  tracer: () => new THREE.CylinderGeometry(0.05, 0.004, 1.0, 6).rotateX(HALF_PI),

  // Constant-width energy bar for lasers and beams.
  laser: () => new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6).rotateX(HALF_PI),
  beam: () => new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6).rotateX(HALF_PI),

  // A thrown hammer: heavy head on a handle.
  block: () => composeGeometry([
    { geo: new THREE.BoxGeometry(0.3, 0.17, 0.17), p: [0, 0, 0.17] },
    { geo: new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), r: [HALF_PI, 0, 0], p: [0, 0, -0.1] }
  ]),

  // Three splayed ice needles — reads as a spray, not a single bullet.
  shard: () => composeGeometry([
    { geo: new THREE.OctahedronGeometry(0.09, 0), s: [0.6, 0.6, 2.6] },
    { geo: new THREE.OctahedronGeometry(0.075, 0), s: [0.6, 0.6, 2.2], p: [0.15, 0.02, -0.08], r: [0, 0.32, 0] },
    { geo: new THREE.OctahedronGeometry(0.075, 0), s: [0.6, 0.6, 2.2], p: [-0.15, -0.02, -0.08], r: [0, -0.32, 0] }
  ]),

  // Catching glove: padded fist, thumb and cuff.
  sphere: () => composeGeometry([
    { geo: new THREE.SphereGeometry(0.17, 12, 10), s: [1, 0.82, 1.15] },
    { geo: new THREE.SphereGeometry(0.075, 8, 6), p: [0.16, 0.02, 0.04] },
    { geo: new THREE.CylinderGeometry(0.13, 0.15, 0.12, 12), r: [HALF_PI, 0, 0], p: [0, 0, -0.2] }
  ]),

  // Jagged zig-zag.
  bolt: () => composeGeometry([
    { geo: new THREE.BoxGeometry(0.06, 0.06, 0.3), p: [0.06, 0, 0.36], r: [0, 0.45, 0] },
    { geo: new THREE.BoxGeometry(0.06, 0.06, 0.3), p: [-0.05, 0, 0.12], r: [0, -0.5, 0] },
    { geo: new THREE.BoxGeometry(0.06, 0.06, 0.3), p: [0.05, 0, -0.12], r: [0, 0.5, 0] },
    { geo: new THREE.BoxGeometry(0.05, 0.05, 0.28), p: [-0.05, 0, -0.36], r: [0, -0.45, 0] }
  ]),

  // Fireball: round head with a flame tail streaming behind.
  plasma: () => composeGeometry([
    { geo: new THREE.IcosahedronGeometry(0.15, 1) },
    { geo: new THREE.ConeGeometry(0.12, 0.4, 8), r: [-HALF_PI, 0, 0], p: [0, 0, -0.24] }
  ]),

  // Plain energy orb.
  orb: () => new THREE.IcosahedronGeometry(0.17, 2),

  star: () => starGeometry(0.27, 0.115, 0.07),

  // Faceted ball, so its spin is visible.
  ball: () => new THREE.IcosahedronGeometry(0.16, 1),

  // Shockwave ring, flying face-on.
  ring: () => new THREE.TorusGeometry(0.19, 0.04, 8, 22),

  // Sliding boot / wedge.
  cone: () => composeGeometry([
    { geo: new THREE.ConeGeometry(0.12, 0.36, 10), r: [HALF_PI, 0, 0], p: [0, 0, 0.08] },
    { geo: new THREE.BoxGeometry(0.2, 0.05, 0.3), p: [0, -0.07, -0.06] }
  ])
};

/**
 * How each mesh kind is shaded. `surface`:
 *   solid — lit, with a self-glow in the projectile colour
 *   dark  — near-black body with a coloured glow (the puck)
 *   ice   — pale, slightly translucent
 *   glow  — unlit additive energy
 *   hot   — unlit opaque (fire reads wrong when additive washes it to white)
 * `halo` sets the size of the soft glow behind the shape; 0 for none.
 */
const SHADING = {
  puck:   { surface: 'dark',  halo: 0.3 },
  tracer: { surface: 'glow',  halo: 0.16 },
  laser:  { surface: 'glow',  halo: 0.14 },
  beam:   { surface: 'glow',  halo: 0.18 },
  block:  { surface: 'solid', halo: 0.34 },
  shard:  { surface: 'ice',   halo: 0.3 },
  sphere: { surface: 'solid', halo: 0.34 },
  bolt:   { surface: 'glow',  halo: 0.24 },
  plasma: { surface: 'hot',   halo: 0.4 },
  orb:    { surface: 'hot',   halo: 0.42 },
  star:   { surface: 'solid', halo: 0.48, metal: true },
  ball:   { surface: 'solid', halo: 0.28, flat: true, body: 0xffffff },
  ring:   { surface: 'glow',  halo: 0 },
  cone:   { surface: 'solid', halo: 0.26 }
};

function getGeometry(kind) {
  let geo = _geos.get(kind);
  if (!geo) {
    geo = (GEOMETRY_BUILDERS[kind] || GEOMETRY_BUILDERS.orb)();
    _geos.set(kind, geo);
  }
  return geo;
}

function getMaterial(kind, color) {
  const hex = new THREE.Color(color).getHex();
  const key = `${kind}:${hex}`;
  let mat = _mats.get(key);
  if (mat) return mat;

  const shade = SHADING[kind] || SHADING.orb;
  switch (shade.surface) {
    case 'glow':
      mat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
      break;
    case 'hot':
      mat = new THREE.MeshBasicMaterial({ color: hex });
      break;
    case 'ice':
      mat = new THREE.MeshStandardMaterial({ color: 0xdff7ff, emissive: hex, emissiveIntensity: 0.55, metalness: 0.2, roughness: 0.08, transparent: true, opacity: 0.92 });
      break;
    case 'dark':
      mat = new THREE.MeshStandardMaterial({ color: 0x0c1016, emissive: hex, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.25 });
      break;
    default:
      mat = new THREE.MeshStandardMaterial({
        color: shade.body ?? hex,
        emissive: hex,
        emissiveIntensity: shade.body ? 0.22 : 0.45,
        metalness: shade.metal ? 0.9 : 0.35,
        roughness: shade.metal ? 0.15 : 0.4,
        flatShading: !!shade.flat
      });
  }
  _mats.set(key, mat);
  return mat;
}

/** Soft radial falloff, shared by every halo: bright centre fading to nothing. */
function getHaloTexture() {
  if (_haloTexture) return _haloTexture;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  _haloTexture = new THREE.CanvasTexture(canvas);
  return _haloTexture;
}

function getHaloMaterial(color) {
  const hex = new THREE.Color(color).getHex();
  const key = `halo:${hex}`;
  let mat = _mats.get(key);
  if (!mat) {
    mat = new THREE.SpriteMaterial({ map: getHaloTexture(), color: hex, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    _mats.set(key, mat);
  }
  return mat;
}

/**
 * Build the mesh for one shot. Geometry and materials are shared — never
 * dispose them when the projectile is removed.
 *
 * @param {string} kind - mesh kind from the theme's visual profile
 * @param {number|THREE.Color} color
 * @param {number} [size=1] - uniform scale
 * @returns {THREE.Mesh}
 */
export function createProjectileMesh(kind, color, size = 1) {
  const key = GEOMETRY_BUILDERS[kind] ? kind : 'orb';
  const mesh = new THREE.Mesh(getGeometry(key), getMaterial(key, color));
  mesh.scale.setScalar(size);
  mesh.userData.sharedResources = true;

  // A halo only slightly larger than the shape itself: enough to lift the shot
  // off the playfield and feed the bloom pass, never enough to hide what it is.
  const haloRadius = SHADING[key].halo;
  if (haloRadius > 0) {
    // A camera-facing sprite: one quad, and a smooth falloff a sphere can't give.
    const halo = new THREE.Sprite(getHaloMaterial(color));
    const diameter = haloRadius * 3.4;
    halo.scale.setScalar(diameter);
    halo.renderOrder = 998;
    mesh.add(halo);
    mesh.userData.halo = halo;
    mesh.userData.haloRadius = diameter;
  }
  return mesh;
}

/** Drop every cached GPU resource (scene teardown). They rebuild on demand. */
export function disposeProjectileResources() {
  _geos.forEach(g => g.dispose());
  _mats.forEach(m => m.dispose());
  _geos.clear();
  _mats.clear();
  if (_haloTexture) { _haloTexture.dispose(); _haloTexture = null; }
}
