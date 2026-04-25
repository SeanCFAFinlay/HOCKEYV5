import { getState } from '../engine/state.js';
import { getQualityName } from '../rendering/quality.js';

let enabled = false;
let el = null;
let frames = 0;
let elapsed = 0;

export function initPerfOverlay() {
  const params = new URLSearchParams(window.location.search);
  enabled = params.get('perf') === '1';
  if (!enabled) return;

  el = document.createElement('div');
  el.className = 'perf-overlay';
  document.body.appendChild(el);
}

export function updatePerfOverlay(dt, physicsSteps = 0) {
  if (!enabled || !el) return;

  frames++;
  elapsed += dt;
  if (elapsed < 0.35) return;

  const state = getState();
  const fps = Math.round(frames / elapsed);
  const info = state.renderer?.info;
  el.textContent = [
    `${fps} fps`,
    `${Math.round(elapsed / frames * 1000)} ms`,
    `q:${getQualityName()}`,
    `steps:${physicsSteps}`,
    `draw:${info?.render?.calls ?? 0}`,
    `tri:${info?.render?.triangles ?? 0}`,
    `e:${state.enemies.length}`,
    `p:${state.projectiles.length}`,
    `fx:${state.particles.length}`
  ].join(' | ');

  frames = 0;
  elapsed = 0;
}

export function showPerfOverlay(show = true) {
  enabled = show;
  if (enabled && !el) {
    el = document.createElement('div');
    el.className = 'perf-overlay';
    document.body.appendChild(el);
  }
  if (el) el.style.display = enabled ? 'block' : 'none';
}
