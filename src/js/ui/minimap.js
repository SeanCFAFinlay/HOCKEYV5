// Strategic Minimap — SC-4.4
// 2D canvas overlay: top-down grid view with towers, enemies, spawns, base.

import { getState } from '../engine/state.js';
import { setCameraZoom, setCameraAngle } from '../engine/camera.js';
import {
  drawTowerDot, drawEnemyDot, drawSpawnMarker, drawBaseMarker,
  drawGrid, drawObstacles
} from './minimap-draw.js';

const CANVAS_SIZE        = 120;
const UPDATE_INTERVAL_MS = 200;

let container        = null;
let canvas           = null;
let ctx              = null;
let visible          = true;
let lastDrawTime     = -Infinity;
// SC-5.5: low quality — only update on explicit calls, not on the game loop
let _lowQualityMode  = false;

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialize the minimap. Idempotent — safe to call multiple times.
 */
export function initMinimap() {
  if (container) return;

  container = _buildContainer();
  canvas    = _buildCanvas(container);
  ctx       = canvas.getContext('2d');

  const toggleBtn = _buildToggleButton(container);
  canvas.addEventListener('click', _handleMinimapTap);
  canvas.addEventListener('touchstart', _handleMinimapTouch, { passive: true });
  toggleBtn.addEventListener('click', _handleToggle);

  const gameScreen = document.getElementById('gameScreen') || document.body;
  gameScreen.appendChild(container);
}

/**
 * Show or hide the minimap.
 * @param {boolean} show
 */
export function setMinimapVisible(show) {
  visible = show;
  if (container) container.style.display = show ? 'block' : 'none';
}

/**
 * Redraw minimap (throttled to 200ms). Call from game loop every frame.
 * On 'low' quality mode, auto-update is disabled — call forceMinimapRedraw()
 * explicitly on tower place/sell events.
 */
export function updateMinimap() {
  if (!canvas || !ctx || !visible) return;
  if (_lowQualityMode) return; // SC-5.5: low quality — skip automatic updates
  const now = performance.now();
  if (now - lastDrawTime < UPDATE_INTERVAL_MS) return;
  lastDrawTime = now;
  _drawMinimap();
}

/**
 * SC-5.5: Set minimap to low-quality mode (no auto-update from game loop).
 * On 'low' quality, only explicit calls to forceMinimapRedraw() trigger a draw.
 * @param {boolean} enabled
 */
export function setMinimapLowQualityMode(enabled) {
  _lowQualityMode = !!enabled;
}

/**
 * Force an immediate minimap redraw regardless of quality mode.
 * Use on tower place / sell events when in low quality mode.
 */
export function forceMinimapRedraw() {
  if (!canvas || !ctx || !visible) return;
  lastDrawTime = performance.now();
  _drawMinimap();
}

// ── Exported helpers (for testability) ────────────────────────────────────

export { drawTowerDot, drawEnemyDot, drawSpawnMarker, drawBaseMarker };

/**
 * Calculate cell dimensions for minimap.
 */
export function getMinimapCellSize(cols, rows, canvasW, canvasH) {
  return {
    cellW: cols > 0 ? canvasW / cols : canvasW,
    cellH: rows > 0 ? canvasH / rows : canvasH
  };
}

/**
 * Convert tap position to grid coordinates.
 */
export function tapToGrid(tapX, tapY, canvasW, canvasH, cols, rows) {
  const col = Math.min(cols - 1, Math.max(0, Math.floor((tapX / canvasW) * cols)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((tapY / canvasH) * rows)));
  return { col, row };
}

// ── DOM builders ───────────────────────────────────────────────────────────

// Presentation lives in css/hud.css (and css/responsive.css) rather than inline
// here, so the minimap can shrink on small screens like everything else. Only
// `display` is still driven from JS — see setMinimapVisible.
function _buildContainer() {
  const el = document.createElement('div');
  el.id = 'minimapContainer';
  return el;
}

function _buildCanvas(parent) {
  const c = document.createElement('canvas');
  c.id = 'minimapCanvas';
  c.width  = CANVAS_SIZE;
  c.height = CANVAS_SIZE;
  parent.appendChild(c);
  return c;
}

function _buildToggleButton(parent) {
  const btn = document.createElement('button');
  btn.id = 'minimapToggle';
  btn.textContent = 'M';
  btn.setAttribute('aria-label', 'Toggle minimap');
  parent.appendChild(btn);
  return btn;
}

// ── Rendering ──────────────────────────────────────────────────────────────

function _drawMinimap() {
  const { COLS, ROWS, grid, towers, enemies, SPAWNS, BASE } = getState();
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (!COLS || !ROWS) return;

  const { cellW, cellH } = getMinimapCellSize(COLS, ROWS, CANVAS_SIZE, CANVAS_SIZE);
  drawGrid(ctx, cellW, cellH, COLS, ROWS, CANVAS_SIZE);
  drawObstacles(ctx, grid, cellW, cellH, COLS);
  _renderTowers(towers, cellW, cellH);
  _renderEnemies(enemies, cellW, cellH, COLS, ROWS);
  _renderMarkers(SPAWNS, BASE, cellW, cellH);
}

function _renderTowers(towers, cellW, cellH) {
  if (!towers) return;
  towers.forEach(t => {
    if (t.col === undefined || t.row === undefined) return;
    drawTowerDot(ctx, (t.col + 0.5) * cellW, (t.row + 0.5) * cellH, t.color || t.clr || '#00d4ff');
  });
}

function _renderEnemies(enemies, cellW, cellH, cols, rows) {
  if (!enemies) return;
  enemies.forEach(e => {
    if (e.x === undefined || e.z === undefined) return;
    const x = ((e.x + cols / 2) / cols) * CANVAS_SIZE;
    const y = ((e.z + rows / 2) / rows) * CANVAS_SIZE;
    drawEnemyDot(ctx, x, y, !!e.boss);
  });
}

function _renderMarkers(spawns, base, cellW, cellH) {
  if (spawns) {
    spawns.forEach(sp => drawSpawnMarker(ctx, (sp.col + 0.5) * cellW, (sp.row + 0.5) * cellH));
  }
  if (base) {
    drawBaseMarker(ctx, (base.col + 0.5) * cellW, (base.row + 0.5) * cellH);
  }
}

// ── Event handlers ─────────────────────────────────────────────────────────

function _handleToggle() {
  visible = !visible;
  if (canvas) canvas.style.display = visible ? 'block' : 'none';
}

function _handleMinimapTap(evt) {
  const rect = canvas.getBoundingClientRect();
  _navigateToTap(evt.clientX - rect.left, evt.clientY - rect.top, rect.width, rect.height);
}

function _handleMinimapTouch(evt) {
  if (!evt.touches || !evt.touches[0]) return;
  const rect = canvas.getBoundingClientRect();
  const t = evt.touches[0];
  _navigateToTap(t.clientX - rect.left, t.clientY - rect.top, rect.width, rect.height);
}

function _navigateToTap(tapX, tapY, canvasW, canvasH) {
  const { COLS, ROWS } = getState();
  if (!COLS || !ROWS) return;

  const { col, row } = tapToGrid(tapX, tapY, canvasW, canvasH, COLS, ROWS);
  const worldX = (col - COLS / 2) * 2;
  const worldZ = (row - ROWS / 2) * 2;
  const angle  = Math.atan2(worldX, worldZ);
  const dist   = Math.sqrt(worldX * worldX + worldZ * worldZ) + 14;

  setCameraAngle(angle + Math.PI / 4);
  setCameraZoom(Math.min(dist, 30), 14);
}
