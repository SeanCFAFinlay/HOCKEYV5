// Text sprites for labels

import { getState } from '../engine/state.js';

export function makeTextSprite(text, opts = {}) {
  const color = opts.color || '#ffffff';
  const bg = opts.bg || 'rgba(0,0,0,0.55)';
  const font = opts.font || 'bold 54px system-ui, -apple-system, Segoe UI, Roboto, Arial';

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Rounded rect background
  const r = 22;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, w / 2, h / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });

  const spr = new THREE.Sprite(mat);
  spr.scale.set(0.85, 0.42, 1);
  spr.renderOrder = 999;

  return spr;
}

export function attachEnemyPowerLabel(e) {
  const state = getState();

  if (!e || !e.mesh) return;

  // Define "power" as a compact strength indicator
  const power = Math.max(1, Math.round((e.maxHp / 20) + (state.wave * 0.6) + (e.armor ? 2 : 0) + (e.boss ? 6 : 0)));
  e.power = power;

  const label = makeTextSprite(String(power), { color: '#ffffff', bg: 'rgba(0,0,0,0.55)' });
  label.position.set(0, (e.flying ? 1.05 : 0.65) * (e.sz || 1), 0);
  e.mesh.add(label);
  e.label = label;
}
