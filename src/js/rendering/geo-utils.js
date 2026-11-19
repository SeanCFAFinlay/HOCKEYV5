// Geometry helpers: merging many small meshes into few draw calls.
//
// The game builds everything from primitives, and each primitive used to be its
// own Mesh — a tower was ~45 draw calls, and every one of those is drawn again
// in the shadow pass. Three r128's core build has no BufferGeometryUtils (that
// lives in examples/), so the small merge needed here is implemented directly.

/**
 * Merge geometries into one non-indexed BufferGeometry (position + normal).
 * UVs are dropped: nothing merged here is textured.
 *
 * @param {Array<{geometry: THREE.BufferGeometry, matrix?: THREE.Matrix4}>} entries
 * @returns {THREE.BufferGeometry}
 */
export function mergeGeometries(entries) {
  const parts = [];
  let total = 0;

  for (const { geometry, matrix } of entries) {
    if (!geometry?.attributes?.position) continue;
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    if (!g.attributes.normal) g.computeVertexNormals();
    if (matrix) g.applyMatrix4(matrix);
    parts.push(g);
    total += g.attributes.position.count;
  }

  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  let offset = 0;
  for (const g of parts) {
    position.set(g.attributes.position.array, offset);
    normal.set(g.attributes.normal.array, offset);
    offset += g.attributes.position.count * 3;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  merged.computeBoundingSphere();
  merged.computeBoundingBox();
  return merged;
}

/**
 * Shorthand: build one geometry from primitives placed with position/rotation/scale.
 *
 * @param {Array<{geo: THREE.BufferGeometry, p?: number[], r?: number[], s?: number[]|number}>} pieces
 * @returns {THREE.BufferGeometry}
 */
export function composeGeometry(pieces) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const entries = pieces.map(({ geo, p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
    const sv = typeof s === 'number' ? [s, s, s] : s;
    q.setFromEuler(e.set(r[0], r[1], r[2]));
    m.compose(new THREE.Vector3(p[0], p[1], p[2]), q, new THREE.Vector3(sv[0], sv[1], sv[2]));
    return { geometry: geo, matrix: m.clone() };
  });
  const out = mergeGeometries(entries);
  pieces.forEach(({ geo }) => geo.dispose());
  return out;
}

/**
 * Collapse every static mesh under `root` into one mesh per material.
 *
 * Anything in `exclude` (or below an excluded object) is left alone — those are
 * the parts something animates or holds a reference to. Meshes are grouped by
 * material and shadow flags, so the result looks identical; it just costs one
 * draw call per material instead of one per primitive.
 *
 * Must run before `root` is positioned in the world: transforms are baked
 * relative to `root`.
 *
 * @param {THREE.Object3D} root
 * @param {Set<THREE.Object3D>} [exclude]
 * @returns {number} how many meshes were removed
 */
export function bakeStaticMeshes(root, exclude = new Set()) {
  root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();

  // Excluded, or hidden — a mesh inside a hidden group (a status effect waiting
  // to be switched on, say) must not be baked into something always visible.
  const isExcluded = (obj) => {
    for (let o = obj; o && o !== root; o = o.parent) {
      if (exclude.has(o) || !o.visible) return true;
    }
    return false;
  };

  root.traverse((obj) => {
    if (obj === root || !obj.isMesh || obj.isInstancedMesh || obj.isSkinnedMesh) return;
    if (Array.isArray(obj.material) || !obj.geometry?.attributes?.position) return;
    if (isExcluded(obj)) return;

    const key = `${obj.material.uuid}|${obj.castShadow ? 1 : 0}${obj.receiveShadow ? 1 : 0}|${obj.renderOrder}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { material: obj.material, castShadow: obj.castShadow, receiveShadow: obj.receiveShadow, renderOrder: obj.renderOrder, meshes: [] };
      buckets.set(key, bucket);
    }
    bucket.meshes.push(obj);
  });

  let removed = 0;
  for (const bucket of buckets.values()) {
    if (bucket.meshes.length < 2) continue;

    const merged = new THREE.Mesh(
      mergeGeometries(bucket.meshes.map(mesh => ({
        geometry: mesh.geometry,
        matrix: new THREE.Matrix4().multiplyMatrices(rootInv, mesh.matrixWorld)
      }))),
      bucket.material
    );
    merged.castShadow = bucket.castShadow;
    merged.receiveShadow = bucket.receiveShadow;
    merged.renderOrder = bucket.renderOrder;

    for (const mesh of bucket.meshes) {
      mesh.parent.remove(mesh);
      removed++;
    }
    root.add(merged);
  }
  return removed;
}

/**
 * Point every mesh under `root` that uses an equivalent material at one shared
 * instance. Builders tend to write `new MeshStandardMaterial({...})` inline per
 * prop, which gives each mesh a unique material and so defeats merging; run
 * this first and bakeStaticMeshes() can then collapse them.
 *
 * Only plain untextured materials are considered equivalent.
 *
 * @param {THREE.Object3D} root
 * @returns {number} how many distinct materials remain
 */
export function shareEquivalentMaterials(root) {
  const canonical = new Map();
  root.traverse((obj) => {
    const m = obj.material;
    if (!obj.isMesh || !m || Array.isArray(m) || m.map || m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) return;
    const key = [
      m.type, m.color?.getHex(), m.emissive?.getHex(), m.emissiveIntensity,
      m.roughness, m.metalness, m.opacity, m.transparent, m.side, m.blending,
      m.depthWrite, m.flatShading, m.envMapIntensity
    ].join('|');
    const shared = canonical.get(key);
    if (shared) obj.material = shared;
    else canonical.set(key, m);
  });
  return canonical.size;
}
