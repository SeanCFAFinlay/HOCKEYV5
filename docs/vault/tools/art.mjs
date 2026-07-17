// Schematic asset art generator.
//
// Renders 2D SVG portraits from the SAME primitive parameters the real
// Three.js builders use in src/js/rendering/*.js. These are cabinet-projection
// schematics, not renders: geometry, dimensions and colours are transcribed
// from the mesh code, but lighting, materials and post-processing are not
// simulated. When the mesh code changes, re-run `npm run vault` and diff.

// ── Projection ─────────────────────────────────────────────────────────────
// Cabinet projection: +y is up, +z points toward the viewer (down-left).
// The game models towers facing +z, so a flat front elevation would hide every
// barrel, stick and nozzle. This keeps them visible.

const Z_X = -0.42; // how far +z shifts left
const Z_Y = -0.20; // how far +z shifts down

export function makeProjector({ scale, cx, groundY }) {
  const project = (x, y, z = 0) => [
    cx + (x + z * Z_X) * scale,
    groundY - (y + z * Z_Y) * scale
  ];
  project.scale = scale;
  return project;
}

// ── Vector helpers ─────────────────────────────────────────────────────────

const n = v => (Math.round(v * 100) / 100);

// Apply an XYZ-euler rotation to the cylinder/cone default axis (0,1,0).
function axisOf([rx = 0, ry = 0, rz = 0]) {
  // Three.js default euler order is XYZ: R = Rx * Ry * Rz applied to (0,1,0).
  let v = [0, 1, 0];
  v = [
    v[0] * Math.cos(rz) - v[1] * Math.sin(rz),
    v[0] * Math.sin(rz) + v[1] * Math.cos(rz),
    v[2]
  ];
  v = [
    v[0] * Math.cos(ry) + v[2] * Math.sin(ry),
    v[1],
    -v[0] * Math.sin(ry) + v[2] * Math.cos(ry)
  ];
  v = [
    v[0],
    v[1] * Math.cos(rx) - v[2] * Math.sin(rx),
    v[1] * Math.sin(rx) + v[2] * Math.cos(rx)
  ];
  return v;
}

const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];

function perp2(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
}

const poly = (pts, fill, op = 1, extra = '') =>
  `<polygon points="${pts.map(p => `${n(p[0])},${n(p[1])}`).join(' ')}" fill="${fill}"${
    op < 1 ? ` opacity="${op}"` : ''
  }${extra}/>`;

// ── Primitive renderers ────────────────────────────────────────────────────
// Each takes a part descriptor transcribed from the mesh code plus the
// projector, and returns an SVG fragment.

const RENDER = {
  // CylinderGeometry(radiusTop, radiusBottom, height) — a tapered barrel.
  cyl(p, P, fill) {
    const dir = axisOf(p.rot || [0, 0, 0]);
    const pos = p.pos;
    const bottom = add(pos, dir, -p.len / 2);
    const top = add(pos, dir, p.len / 2);
    const a = P(...bottom);
    const b = P(...top);
    const u = perp2(a, b);
    const rb = p.rb * P.scale;
    const rt = p.rt * P.scale;
    return poly(
      [
        [a[0] + u[0] * rb, a[1] + u[1] * rb],
        [b[0] + u[0] * rt, b[1] + u[1] * rt],
        [b[0] - u[0] * rt, b[1] - u[1] * rt],
        [a[0] - u[0] * rb, a[1] - u[1] * rb]
      ],
      fill,
      p.op ?? 1
    );
  },

  // BoxGeometry(width, height, depth) — drawn as its front face plus a top
  // face, so slabs read as solids rather than flat rectangles.
  box(p, P, fill) {
    const [w, h, d] = p.size;
    const [x, y, z] = p.pos;
    const front = [
      P(x - w / 2, y - h / 2, z + d / 2),
      P(x + w / 2, y - h / 2, z + d / 2),
      P(x + w / 2, y + h / 2, z + d / 2),
      P(x - w / 2, y + h / 2, z + d / 2)
    ];
    const topFace = [
      P(x - w / 2, y + h / 2, z + d / 2),
      P(x + w / 2, y + h / 2, z + d / 2),
      P(x + w / 2, y + h / 2, z - d / 2),
      P(x - w / 2, y + h / 2, z - d / 2)
    ];
    return (
      poly(topFace, fill, (p.op ?? 1) * 0.72) + poly(front, fill, p.op ?? 1)
    );
  },

  // SphereGeometry(radius) — optional non-uniform scale, optional top-half only.
  sph(p, P, fill) {
    const [sx = 1, sy = 1] = p.scale || [];
    const c = P(...p.pos);
    const rx = p.r * sx * P.scale;
    const ry = p.r * sy * P.scale;
    if (p.half) {
      // Hemisphere (helmets/masks): a dome sitting on its equator.
      return `<path d="M ${n(c[0] - rx)} ${n(c[1])} A ${n(rx)} ${n(ry)} 0 0 1 ${n(
        c[0] + rx
      )} ${n(c[1])} Z" fill="${fill}"${p.op < 1 ? ` opacity="${p.op}"` : ''}/>`;
    }
    return `<ellipse cx="${n(c[0])}" cy="${n(c[1])}" rx="${n(rx)}" ry="${n(
      ry
    )}" fill="${fill}"${p.op < 1 ? ` opacity="${p.op}"` : ''}/>`;
  },

  // ConeGeometry(radius, height)
  cone(p, P, fill) {
    const dir = axisOf(p.rot || [0, 0, 0]);
    const base = add(p.pos, dir, -p.h / 2);
    const apex = add(p.pos, dir, p.h / 2);
    const a = P(...base);
    const b = P(...apex);
    const u = perp2(a, b);
    const r = p.r * P.scale;
    return poly(
      [[a[0] + u[0] * r, a[1] + u[1] * r], b, [a[0] - u[0] * r, a[1] - u[1] * r]],
      fill,
      p.op ?? 1
    );
  },

  // TorusGeometry(radius, tube) — orientation decides how much it foreshortens.
  // Default ring lies in XY (faces camera); rotation.x=PI/2 lays it flat in XZ;
  // rotation.y=PI/2 turns it edge-on.
  tor(p, P, fill) {
    const [rx = 0, ry = 0] = p.rot || [];
    const c = P(...p.pos);
    const R = p.R * P.scale;
    const flatX = Math.abs(Math.abs(rx) - Math.PI / 2) < 0.3;
    const edgeOn = Math.abs(Math.abs(ry) - Math.PI / 2) < 0.3;
    const erx = edgeOn ? R * 0.34 : R;
    const ery = flatX ? R * 0.34 : R;
    return `<ellipse cx="${n(c[0])}" cy="${n(c[1])}" rx="${n(erx)}" ry="${n(
      ery
    )}" fill="none" stroke="${fill}" stroke-width="${n(
      Math.max(p.tube * 2 * P.scale, 1)
    )}"${p.op < 1 ? ` opacity="${p.op}"` : ''}/>`;
  },

  // RingGeometry(inner, outer)
  ring(p, P, fill) {
    const c = P(...p.pos);
    const mid = ((p.ri + p.ro) / 2) * P.scale;
    return `<ellipse cx="${n(c[0])}" cy="${n(c[1])}" rx="${n(mid)}" ry="${n(
      mid * (p.flat ? 0.34 : 1)
    )}" fill="none" stroke="${fill}" stroke-width="${n(
      Math.max((p.ro - p.ri) * P.scale, 1)
    )}"${p.op < 1 ? ` opacity="${p.op}"` : ''}/>`;
  },

  // OctahedronGeometry(radius) — gems, crystals, sparkles.
  oct(p, P, fill) {
    const c = P(...p.pos);
    const r = p.r * P.scale;
    return poly(
      [
        [c[0], c[1] - r],
        [c[0] + r * 0.72, c[1]],
        [c[0], c[1] + r],
        [c[0] - r * 0.72, c[1]]
      ],
      fill,
      p.op ?? 1
    );
  },

  // CircleGeometry / PlaneGeometry — decals, vents, windows.
  circ(p, P, fill) {
    const c = P(...p.pos);
    const r = p.r * P.scale;
    return `<ellipse cx="${n(c[0])}" cy="${n(c[1])}" rx="${n(r)}" ry="${n(
      r * (p.flat ? 0.34 : 1)
    )}" fill="${fill}"${p.op < 1 ? ` opacity="${p.op}"` : ''}/>`;
  },

  plane(p, P, fill) {
    return RENDER.box({ ...p, size: [p.w, p.h, 0] }, P, fill);
  }
};

// ── Part list rendering ────────────────────────────────────────────────────

export function renderParts(parts, P, palette) {
  // Draw far (low z) first so near parts overlap them, matching the projection.
  return [...parts]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (a.p.pos[2] ?? 0) - (b.p.pos[2] ?? 0) || a.i - b.i)
    .map(({ p }) => {
      const fill = palette[p.fill] || p.fill || '#888';
      return RENDER[p.t] ? RENDER[p.t](p, P, fill) : '';
    })
    .join('\n    ');
}

// ── Document chrome ────────────────────────────────────────────────────────

export const hex = v => (typeof v === 'number' ? '#' + v.toString(16).padStart(6, '0') : v);

export function svgDoc({ w, h, bg, accent, body, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(
    title
  )}">
  <title>${esc(title)}</title>
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${body}
</svg>
`;
}

export const esc = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Ground contact shadow, mirroring the fake shadow plane the real towers use.
export function groundShadow(P, r = 0.44, op = 0.34) {
  const c = P(0, 0, 0);
  return `<ellipse cx="${n(c[0])}" cy="${n(c[1])}" rx="${n(r * P.scale)}" ry="${n(
    r * P.scale * 0.3
  )}" fill="#000" opacity="${op}" filter="url(#soft)"/>`;
}
