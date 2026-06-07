// Enemy Path Preview Lines — SC-1.5
// Shows dashed path lines from each spawn to the base

/* global THREE */
import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { findPathGrid } from '../systems/pathfinding.js';

const OPACITY_FULL = 0.3;
const OPACITY_WAVE = 0.15;
const LINE_Y = 0.05;

// Theme colors
const THEME_COLORS = {
  hockey: 0x88ddff,
  soccer: 0x88ffaa,
  default: 0x88ddff
};

// Module-level state — pooled line objects
let previewLines = [];

/**
 * Get theme color for the current state
 * @param {object} state
 * @returns {number} hex color
 */
function getThemeColor(state) {
  return THEME_COLORS[state.theme] ?? THEME_COLORS.default;
}

/**
 * Convert a grid path to world positions at Y=0.05
 * @param {Array} path - array of [gridX, gridY] pairs
 * @param {number} hw - half grid width
 * @param {number} hh - half grid height
 * @returns {Float32Array} flat xyz positions
 */
function pathToWorldPositions(path, hw, hh) {
  const count = path.length;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [gx, gy] = path[i];
    positions[i * 3]     = gx - hw + 0.5;
    positions[i * 3 + 1] = LINE_Y;
    positions[i * 3 + 2] = gy - hh + 0.5;
  }
  return positions;
}

/**
 * Create a dashed line material for path preview
 * @param {number} color - hex color
 * @returns {THREE.LineDashedMaterial}
 */
function createLineMaterial(color) {
  return new THREE.LineDashedMaterial({
    color,
    dashSize: 0.3,
    gapSize: 0.2,
    opacity: OPACITY_FULL,
    transparent: true
  });
}

/**
 * Initialize the path preview system.
 * Creates one Line per spawn, adds them to the scene.
 * @param {THREE.Scene} scene
 * @returns {object} handle for external reference (currently unused)
 */
export function createPathPreview(scene) {
  const state = getState();
  const { SPAWNS } = state;
  const color = getThemeColor(state);

  // Dispose any previous lines
  disposeLines(scene);
  previewLines = [];

  for (let i = 0; i < SPAWNS.length; i++) {
    const geo = new THREE.BufferGeometry();
    const mat = createLineMaterial(color);
    const line = new THREE.Line(geo, mat);
    line.visible = true;
    scene.add(line);
    previewLines.push(line);
  }

  // Auto-update on nav changes (tower placed/sold)
  on(GameEvents.NAV_CHANGE, updatePathPreview);

  return { lines: previewLines };
}

/**
 * Update all path preview lines based on current pathfinding state.
 * Reuses existing Line/Geometry objects — no new allocations per call.
 */
export function updatePathPreview() {
  if (previewLines.length === 0) return;

  const state = getState();
  const { SPAWNS, BASE, COLS, ROWS } = state;

  if (!BASE || !SPAWNS) return;

  const hw = COLS / 2;
  const hh = ROWS / 2;

  for (let i = 0; i < previewLines.length; i++) {
    const line = previewLines[i];
    const spawn = SPAWNS[i];

    if (!spawn) {
      line.visible = false;
      continue;
    }

    const path = findPathGrid(spawn.x, spawn.y, BASE.x, BASE.y);

    if (!path || path.length === 0) {
      line.visible = false;
      continue;
    }

    line.visible = true;

    const positions = pathToWorldPositions(path, hw, hh);
    line.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    line.computeLineDistances();
  }
}

/**
 * Show or hide all path preview lines.
 * During active waves, lines are faded (opacity 0.15) rather than hidden.
 * @param {boolean} visible - true = full opacity, false = hidden or faded
 * @param {boolean} [waveActive=false] - if true, fade instead of hide
 */
export function setPathPreviewVisible(visible, waveActive = false) {
  for (const line of previewLines) {
    if (visible) {
      line.visible = true;
      line.material.opacity = OPACITY_FULL;
    } else if (waveActive) {
      line.visible = true;
      line.material.opacity = OPACITY_WAVE;
    } else {
      line.visible = false;
    }
  }
}

/**
 * Dispose all preview lines and remove from scene
 * @param {THREE.Scene} scene
 */
function disposeLines(scene) {
  for (const line of previewLines) {
    if (scene) scene.remove(line);
    if (line.geometry) line.geometry.dispose();
    if (line.material) line.material.dispose();
  }
}
