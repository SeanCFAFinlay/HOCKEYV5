// Themed projectile models: what a world's towers actually throw — a pea, a
// bath bomb, a hardback, a pixel bullet — instead of the generic shapes in
// rendering/projectile-meshes.js.
//
// A projectile profile opts in with `model: '<name>'`. The model comes from the
// world's theme kit (`kit.buildProjectile(name, m, ctx)`), or for hockey, soccer
// and space from BUILTIN below. An unknown name falls back to the profile's
// generic `mesh`, so a missing model can never break firing.
//
// Model units: 1 = a typical shot's radius (0.17 world units). Centre the shape
// on the origin and point its nose along +Z — Object3D.lookAt aims +Z at the
// target, so oriented flights fly nose-first. Keep it to a handful of parts.
//
// Each model is built once per world and colour into a template (static parts
// merged per material) and cloned per shot; clones share geometry and
// materials, so never dispose them and never tint them per shot.

import { G, M, modeller } from './model-kit.js';
import { bakeStaticMeshes, shareEquivalentMaterials } from './geo-utils.js';
import { getThemeKit } from '../themes/index.js';
import { createProjectileMesh } from './projectile-meshes.js';
import { BUILTIN_PROJECTILES } from './builtin-projectiles.js';

export const PROJECTILE_UNIT = 0.17;

const HALF = Math.PI / 2;
const templates = new Map();

// Hockey, soccer and space have no theme kit; their models live in
// rendering/builtin-projectiles.js as { worldId: { name: (m, ctx) => void } }.
const BUILTIN = BUILTIN_PROJECTILES;

function buildTemplate(theme, name, color) {
  const kit = getThemeKit(theme);
  const builder = BUILTIN[theme]?.[name];
  if (!builder && typeof kit?.buildProjectile !== 'function') return null;

  const group = new THREE.Group();
  const m = modeller(group, PROJECTILE_UNIT);
  const ctx = { color, G, M };
  let ok;
  try {
    ok = builder ? builder(m, ctx) : kit.buildProjectile(name, m, ctx);
  } catch (err) {
    console.warn(`[projectiles] model "${name}" failed for ${theme}:`, err);
    return null;
  }
  // A kit returns false (or builds nothing) for names it doesn't know.
  if (ok === false || !group.children.length) return null;

  shareEquivalentMaterials(group);
  group.updateMatrixWorld(true);
  bakeStaticMeshes(group, new Set());
  group.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = false;
    o.geometry.userData.shared = true;
    o.material.userData.shared = true;
  });
  return group;
}

/**
 * The mesh for one shot.
 * @param {string} theme - world id
 * @param {object} profile - projectile visual profile ({model?, mesh, ...})
 * @param {number} color
 * @param {number} size
 * @returns {THREE.Object3D}
 */
export function createShotMesh(theme, profile, color, size) {
  if (profile.model) {
    const key = `${theme}|${profile.model}|${color}`;
    let tpl = templates.get(key);
    if (tpl === undefined) {
      tpl = buildTemplate(theme, profile.model, color);
      templates.set(key, tpl);
    }
    if (tpl) {
      const shot = tpl.clone(true);
      shot.scale.setScalar(size);
      shot.userData.sharedResources = true;
      // A faint halo from the generic set keeps themed shots readable at
      // distance and feeds the bloom pass like every other shot.
      const glow = createProjectileMesh(profile.mesh || 'orb', color, 1);
      const halo = glow.userData.halo;
      if (halo) {
        halo.scale.setScalar(glow.userData.haloRadius * 0.8);
        shot.add(halo);
        shot.userData.halo = halo;
        shot.userData.haloRadius = glow.userData.haloRadius * 0.8;
      }
      return shot;
    }
  }
  return createProjectileMesh(profile.mesh, color, size);
}

/** Forget cached templates (scene teardown). */
export function clearProjectileModels() {
  templates.clear();
}

export { HALF };
