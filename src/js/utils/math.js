// Math utilities and Three.js polyfills

// three.js r128 does not include CapsuleGeometry; build one from a cylinder + two spheres.
export function makeCapsule(radius, height, material, radialSegments = 12) {
  const g = new THREE.Group();
  const cylH = Math.max(0.0001, height);
  const cyl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, cylH, radialSegments),
    material
  );
  cyl.castShadow = true;
  cyl.receiveShadow = true;
  g.add(cyl);

  const sphTop = new THREE.Mesh(
    new THREE.SphereGeometry(radius, radialSegments, Math.max(8, Math.floor(radialSegments * 0.75))),
    material
  );
  sphTop.position.y = cylH / 2;
  sphTop.castShadow = true;
  sphTop.receiveShadow = true;
  g.add(sphTop);

  const sphBot = new THREE.Mesh(
    new THREE.SphereGeometry(radius, radialSegments, Math.max(8, Math.floor(radialSegments * 0.75))),
    material
  );
  sphBot.position.y = -cylH / 2;
  sphBot.castShadow = true;
  sphBot.receiveShadow = true;
  g.add(sphBot);

  return g;
}
