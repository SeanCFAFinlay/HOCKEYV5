// Modelling toolkit for towers, props and enemies.
//
// The original towers were stacks of raw cylinders, spheres and boxes, which is
// why they read as "primitives" rather than objects. Real objects have turned
// profiles, rounded edges and bent tubes. This gives builders those shapes in
// one line each, plus a small set of materials that look like actual surfaces
// (enamel paint, chrome, glass, rubber) instead of one generic plastic.
//
// Usage inside a tower builder:
//
//   const m = modeller(turret, scale);
//   m.add(G.lathe([[0.2, 0], [0.24, 0.1], [0.12, 0.4]]), M.paint(0xcc3333), { p: [0, 0.12, 0] });
//   const fan = m.add(G.box(0.4, 0.02, 0.06), M.metal(), { p: [0, 0.6, 0.1] });
//   m.anim(fan, 'spin', { speed: 2 });
//
// Geometry is authored in "model units": a tower figure is about 0.85 tall and
// 0.3 in radius, standing on y = 0.12, facing +Z. The modeller multiplies by the
// tower's scale, so builders never repeat `* scale`.

// ── Geometry ────────────────────────────────────────────────────────────────

export const G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),

  /** Box with rounded edges and corners. `r` is the edge radius. */
  rbox(w, h, d, r = 0.02) {
    const rr = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    const x = -w / 2 + rr, y = -h / 2 + rr, iw = w - rr * 2, ih = h - rr * 2;
    const shape = new THREE.Shape();
    shape.moveTo(x, y);
    shape.lineTo(x + iw, y);
    shape.lineTo(x + iw, y + ih);
    shape.lineTo(x, y + ih);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(1e-4, d - rr * 2),
      bevelEnabled: true, bevelThickness: rr, bevelSize: rr, bevelSegments: 3, curveSegments: 4
    });
    geo.translate(0, 0, -(d - rr * 2) / 2);
    return geo;
  },

  cyl: (rTop, rBottom, h, seg = 20) => new THREE.CylinderGeometry(rTop, rBottom, h, seg),
  /** Open-ended tube wall (no caps): labels, bands, lampshades. */
  sleeve: (rTop, rBottom, h, seg = 20) => new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, true),
  cone: (r, h, seg = 16) => new THREE.ConeGeometry(r, h, seg),
  sphere: (r, w = 18, h = 14) => new THREE.SphereGeometry(r, w, h),
  /** `arc` below 2*PI gives a partial ring: handles, arches, hoops. */
  torus: (R, r, tube = 10, seg = 28, arc = Math.PI * 2) => new THREE.TorusGeometry(R, r, tube, seg, arc),
  ring: (inner, outer, seg = 28) => new THREE.RingGeometry(inner, outer, seg),

  /** Upper half of a sphere (a dome), open at the bottom. */
  dome: (r, seg = 20) => new THREE.SphereGeometry(r, seg, 10, 0, Math.PI * 2, 0, Math.PI / 2),

  /**
   * A turned profile, like something made on a lathe: a vase, a bottle, a
   * chess piece. `profile` is a list of [radius, height] from bottom to top.
   */
  lathe(profile, seg = 24) {
    return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg);
  },

  /** A pill: a cylinder with rounded ends, standing upright, `h` tall overall. */
  capsule(r, h, seg = 16) {
    const body = Math.max(0, h - r * 2);
    const pts = [];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push([Math.cos(a) * r, r + Math.sin(a) * r]); }
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push([Math.cos(a) * r, r + body + Math.sin(a) * r]); }
    return G.lathe(pts, seg);
  },

  /** A bent pipe through a list of [x, y, z] points. */
  tube(points, r = 0.015, seg = 8) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    return new THREE.TubeGeometry(curve, Math.max(8, points.length * 6), r, seg, false);
  },

  /** A flat outline (list of [x, y]) given thickness: blades, fins, signs. */
  plate(outline, thickness = 0.02) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    geo.translate(0, 0, -thickness / 2);
    return geo;
  },

  /** Five-pointed star plate. */
  star(outer, inner, thickness = 0.03, points = 5) {
    const outline = [];
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? inner : outer;
      outline.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return G.plate(outline, thickness);
  }
};

// ── Materials ───────────────────────────────────────────────────────────────

const hex = c => (c && c.isColor ? c.getHex() : c);

export const M = {
  /** Glossy enamel paint: appliances, toys, signage. */
  paint: (color, { gloss = 0.7, glow = 0 } = {}) => new THREE.MeshStandardMaterial({
    color: hex(color), metalness: 0.15, roughness: 1 - gloss * 0.8,
    emissive: hex(color), emissiveIntensity: glow, envMapIntensity: 0.9
  }),
  /** Polished metal. Default is chrome; pass a colour for brass, copper, gold. */
  metal: (color = 0xcfd8e3, { rough = 0.16 } = {}) => new THREE.MeshStandardMaterial({
    color: hex(color), metalness: 0.95, roughness: rough, envMapIntensity: 1.1
  }),
  /** Matte surface: rubber, felt, cast iron, wood. */
  matte: (color = 0x16181d) => new THREE.MeshStandardMaterial({ color: hex(color), metalness: 0.05, roughness: 0.85 }),
  /** Tinted see-through glass or plastic. */
  glass: (color = 0x9fdcff, opacity = 0.38) => new THREE.MeshStandardMaterial({
    color: hex(color), metalness: 0.1, roughness: 0.08, transparent: true, opacity, envMapIntensity: 1.4, depthWrite: false
  }),
  /** Self-lit: bulbs, screens, neon, heating elements. Not affected by lights. */
  glow: (color, opacity = 1) => new THREE.MeshBasicMaterial({
    color: hex(color), transparent: opacity < 1, opacity
  }),
  /** Additive halo for flames, beams and energy. */
  energy: (color, opacity = 0.75) => new THREE.MeshBasicMaterial({
    color: hex(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false
  })
};

// ── Placement ───────────────────────────────────────────────────────────────

/**
 * @param {THREE.Object3D} target - where meshes go (usually the turret group)
 * @param {number} scale - world units per model unit
 */
export function modeller(target, scale = 1) {
  target.userData.animParts = target.userData.animParts || [];
  const root = target;

  const make = parent => ({
    scale,

    /**
     * Add a mesh.
     * @param {THREE.BufferGeometry} geo
     * @param {THREE.Material} mat
     * @param {{p?: number[], r?: number[], s?: number|number[], shadow?: boolean}} [opts]
     *   p position, r rotation (radians), s extra scale — all in model units
     */
    add(geo, mat, { p = [0, 0, 0], r = [0, 0, 0], s = 1, shadow = true } = {}) {
      const mesh = new THREE.Mesh(geo, mat);
      const sv = typeof s === 'number' ? [s, s, s] : s;
      mesh.position.set(p[0] * scale, p[1] * scale, p[2] * scale);
      mesh.rotation.set(r[0], r[1], r[2]);
      mesh.scale.set(sv[0] * scale, sv[1] * scale, sv[2] * scale);
      mesh.castShadow = shadow;
      mesh.receiveShadow = shadow;
      parent.add(mesh);
      return mesh;
    },

    /**
     * A sub-assembly that moves as one (a rotor, an arm, a lid). Returns a
     * modeller for building into it; `.object` is the group, for animating.
     */
    group({ p = [0, 0, 0], r = [0, 0, 0] } = {}) {
      const g = new THREE.Group();
      g.position.set(p[0] * scale, p[1] * scale, p[2] * scale);
      g.rotation.set(r[0], r[1], r[2]);
      parent.add(g);
      const sub = make(g);
      sub.object = g;
      return sub;
    },

    /**
     * Animate a mesh or group. Types understood by rendering/animations.js:
     *   'spin'  { speed }      turns about its own Y axis
     *   'pulse' { offset }     scale throbs (resets scale to ~1: use on a group)
     *   'bob'                  drifts up and down
     *   'float' { offset }     slow hover and turn
     *   'flame' { offset }     flickers (scale X/Y: use on a group)
     *   'orbit' { offset, radius }  circles the turret's axis (radius in world units)
     *   'blink'                flashes (needs a transparent material)
     */
    anim(object, type, extra = {}) {
      root.userData.animParts.push({ mesh: object, type, ...extra });
      return object;
    }
  });

  const m = make(target);
  m.object = target;
  return m;
}
