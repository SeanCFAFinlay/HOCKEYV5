// Hit flash for enemies.
//
// Enemy geometry and materials are shared by every enemy of a type, so a hit
// must not recolour the material itself — that would flash the whole wave.
// Instead each mesh of the struck enemy is pointed at a "flash variant" of its
// material for a few frames and then pointed back. A variant is made once per
// material and colour and cached, so a flash allocates nothing.

// The cache lives here, not in material.userData: Material.clone() deep-copies
// userData through JSON, and a material stored in there (pointing back at its
// source) sends that copy into endless recursion.
const variantCache = new WeakMap();

function flashVariant(mat, color) {
  let cache = variantCache.get(mat);
  if (!cache) variantCache.set(mat, cache = {});
  let variant = cache[color];
  if (!variant) {
    variant = mat.clone();
    variant.emissive.setHex(color);
    variant.emissiveIntensity = 0.5;
    variant.userData = { shared: true };
    cache[color] = variant;
  }
  return variant;
}

/**
 * Flash every lit mesh under `root` with a colour.
 * State lives in root.userData so the game loop can tick it down with dt.
 * @param {THREE.Object3D} root
 * @param {number} color - hex
 * @param {number} duration - seconds
 */
export function flashMesh(root, color, duration) {
  // A hit that lands mid-flash keeps the first flash's record of the real
  // materials, or the flash variant itself would be saved as the "original".
  const swaps = (root.userData.flashActive && root.userData.flashSwaps) || new Map();

  root.traverse((child) => {
    if (!child.isMesh || !child.material || Array.isArray(child.material)) return;
    const base = swaps.get(child) || child.material;
    if (!base.emissive || !base.userData) return;
    swaps.set(child, base);
    child.material = flashVariant(base, color);
  });

  root.userData.flashActive = true;
  root.userData.flashRemaining = duration;
  root.userData.flashSwaps = swaps;
}

/** Put the real materials back (flash over, or the mesh is being recycled). */
export function clearFlash(root) {
  if (!root || !root.userData) return;
  const swaps = root.userData.flashSwaps;
  if (swaps) swaps.forEach((base, child) => { child.material = base; });
  root.userData.flashActive = false;
  root.userData.flashSwaps = null;
}

/** Tick a flash forward; call once a frame. */
export function tickFlash(root, dt) {
  if (!root.userData.flashActive) return;
  root.userData.flashRemaining -= dt;
  if (root.userData.flashRemaining <= 0) clearFlash(root);
}
