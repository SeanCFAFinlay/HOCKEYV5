// Text sprites for labels

import { getState } from '../engine/state.js';

// One texture + material per distinct label. Enemy power numbers repeat
// constantly, and each used to get its own canvas and GPU texture upload at
// spawn; a wave of thirty "12"s now shares one.
const _spriteMaterials = new Map();

const CANVAS_W = 256;
const CANVAS_H = 128;

/**
 * @param {string} text
 * @param {object} [opts]
 * @param {string} [opts.color='#ffffff']
 * @param {string|null} [opts.bg] - plate colour; null draws outlined text with no plate
 * @param {string} [opts.font]
 * @param {number[]} [opts.scale] - sprite [width, height] in world units
 */
export function makeTextSprite(text, opts = {}) {
  const color = opts.color || '#ffffff';
  const bg = opts.bg === undefined ? 'rgba(0,0,0,0.55)' : opts.bg;
  const font = opts.font || 'bold 54px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const scale = opts.scale || [0.85, 0.42];

  const key = `${text}|${color}|${bg}|${font}`;
  let mat = _spriteMaterials.get(key);

  if (!mat) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    const w = CANVAS_W;
    const h = CANVAS_H;

    if (bg) {
      // Rounded rect plate
      const r = 22;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(w, 0, w, h, r);
      ctx.arcTo(w, h, 0, h, r);
      ctx.arcTo(0, h, 0, 0, r);
      ctx.arcTo(0, 0, w, 0, r);
      ctx.closePath();
      ctx.fill();
    }

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Long labels used to run off both edges of the canvas ("DEFEND HOCKEY"
    // rendered as "FEND HOCK"). Squeeze to fit instead of clipping.
    const available = w - 28;
    const measured = ctx.measureText(text).width;
    ctx.save();
    ctx.translate(w / 2, h / 2 + 2);
    if (measured > available) ctx.scale(available / measured, 1);

    if (!bg) {
      // No plate: a dark outline keeps the text legible over anything.
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12;
      ctx.strokeStyle = 'rgba(6,12,22,0.9)';
      ctx.strokeText(text, 0, 0);
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 8;
    }
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    _spriteMaterials.set(key, mat);
  }

  const spr = new THREE.Sprite(mat);
  spr.scale.set(scale[0], scale[1], 1);
  spr.renderOrder = 999;

  return spr;
}

/**
 * Float a small strength number over an enemy.
 *
 * Bosses and tougher enemies get a gold number; the rank and file get white.
 * No backing plate — a dark box over every enemy hid the enemies themselves.
 */
export function attachEnemyPowerLabel(e) {
  const state = getState();

  if (!e || !e.mesh) return;

  // Define "power" as a compact strength indicator
  const power = Math.max(1, Math.round((e.maxHp / 20) + (state.wave * 0.6) + (e.armor ? 2 : 0) + (e.boss ? 6 : 0)));
  e.power = power;

  const tough = e.boss || e.armor > 0;
  const label = makeTextSprite(String(power), {
    color: tough ? '#ffd257' : '#ffffff',
    bg: null,
    font: 'bold 76px system-ui, -apple-system, Segoe UI, Roboto, Arial',
    scale: e.boss ? [0.8, 0.4] : [0.56, 0.28]
  });
  label.position.set(0, e.mesh.userData?.topY ?? (e.flying ? 1.05 : 0.65) * (e.sz || 1), 0);
  e.mesh.add(label);
  e.label = label;
}
