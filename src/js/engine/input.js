// Input handling - touch, mouse, keyboard events
// Mobile-first input state machine with improved gesture handling

import { getState, setDragging, setDragMoved, setLastPosition, setTouchStart, dispatch, ActionTypes } from './state.js';
import { rotateCamera, zoomIn, zoomOut } from './camera.js';
import { handleCellTap } from '../systems/towers.js';
import { onResize } from './scene.js';
import { showUpgrade } from '../ui/upgrade-sheet.js';

// Input state machine states
export const InputState = {
  IDLE: 'idle',
  CAMERA_DRAG: 'camera_drag',
  PINCH_ZOOM: 'pinch_zoom',
  AWAITING_TAP: 'awaiting_tap',
  UI_BLOCKED: 'ui_blocked'
};

// Configuration
const DRAG_THRESHOLD = 8; // Pixels - must move this far to count as drag
const TAP_MAX_DURATION = 250; // ms - tap must be shorter than this
const LONG_PRESS_DURATION = 400; // ms - hold for this long for detail view
const PINCH_SENSITIVITY = 0.04;
const DRAG_SENSITIVITY = 0.008;
const HEIGHT_SENSITIVITY = 0.05;

// Input state
let inputState = InputState.IDLE;
let touchStartPos = { x: 0, y: 0 };
let touchStartTime = 0;
let pinchStartDist = 0;
let longPressTimer = null;
let longPressTriggered = false;
let lastTouchCell = null;

// Preview mesh for tower placement - enhanced components
let previewGroup = null;
let previewCell = null;
let previewAnimTime = 0;

// Preview materials (cached)
let previewMaterials = {
  validBase: null,
  invalidBase: null,
  validGlow: null,
  invalidGlow: null,
  validRange: null,
  invalidRange: null,
  gridHighlight: null
};

function initPreviewMaterials() {
  if (previewMaterials.validBase) return;

  previewMaterials.validBase = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    metalness: 0.3,
    roughness: 0.5,
    transparent: true,
    opacity: 0.7
  });
  previewMaterials.invalidBase = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.3,
    roughness: 0.5,
    transparent: true,
    opacity: 0.7
  });
  previewMaterials.validGlow = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  previewMaterials.invalidGlow = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  });
  previewMaterials.validRange = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  });
  previewMaterials.invalidRange = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide
  });
  previewMaterials.gridHighlight = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
}

/**
 * Get current input state
 * @returns {string}
 */
export function getInputState() {
  return inputState;
}

// Maximum time in ms between touchstart and touchend to count as a tap
const TAP_THRESHOLD_MS = 200;

// Debounce resize to prevent layout thrashing
let resizeTimeout = null;
const RESIZE_DEBOUNCE_MS = 150;

function debouncedResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    onResize();
    resizeTimeout = null;
  }, RESIZE_DEBOUNCE_MS);
}

/**
 * Set up all input handlers
 */
export function setupInputHandlers() {
  // Set up window resize handler immediately
  window.addEventListener('resize', debouncedResize);

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Check for canvas periodically
  const checkCanvas = () => {
    const wrap = document.querySelector('.canvas-wrap');
    const canvas = wrap?.querySelector('canvas');
    if (canvas) {
      attachHandlers(canvas);
    }
  };

  // Set up window resize handler immediately
  window.addEventListener('resize', onResize);

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Check for canvas periodically
  checkCanvas();
}

/**
 * Set up keyboard shortcuts for common actions
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const state = getState();
    
    // Only allow shortcuts during active gameplay
    if (!state.running) return;

    switch(e.key.toLowerCase()) {
      case ' ':
      case 'enter':
        // Start wave
        e.preventDefault();
        if (typeof window.startWave === 'function') {
          window.startWave();
        }
        break;

      case 's':
        // Toggle sell mode
        e.preventDefault();
        if (typeof window.toggleSell === 'function') {
          window.toggleSell();
        }
        break;

      case 'a':
        // Toggle auto-wave
        e.preventDefault();
        if (typeof window.toggleAutoWave === 'function') {
          window.toggleAutoWave();
        }
        break;

      case '1':
      case '2':
      case '3':
        // Set game speed
        e.preventDefault();
        const speed = parseInt(e.key);
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
          const btnSpeed = parseInt(btn.dataset.speed);
          btn.classList.toggle('active', btnSpeed === speed);
          if (btnSpeed === speed) btn.click();
        });
        break;

      case 'escape':
        // Deselect tower / cancel sell mode
        e.preventDefault();
        import('./state.js').then(({ setSelectedTower, setSellMode }) => {
          setSelectedTower(null);
          setSellMode(false);
          document.getElementById('sellBtn')?.classList.remove('active');
        });
        import('../ui/upgrade-sheet.js').then(({ hideUpgrade }) => {
          hideUpgrade();
        });
        import('../ui/hud.js').then(({ renderTowers }) => {
          renderTowers();
        });
        break;

      case 'q':
      case 'w':
      case 'e':
      case 'r':
      case 't':
      case 'y':
      case 'u':
      case 'i':
        // Quick-select towers (1st through 8th tower)
        e.preventDefault();
        const towerKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
        const towerIndex = towerKeys.indexOf(e.key.toLowerCase());
        if (towerIndex >= 0 && state.themeData) {
          const tower = state.themeData.towers[towerIndex];
          if (tower && state.money >= tower.cost) {
            import('./state.js').then(({ setSelectedTower, setSellMode }) => {
              setSelectedTower(tower.id);
              setSellMode(false);
              document.getElementById('sellBtn')?.classList.remove('active');
            });
            import('../ui/upgrade-sheet.js').then(({ hideUpgrade }) => {
              hideUpgrade();
            });
            import('../ui/hud.js').then(({ renderTowers }) => {
              renderTowers();
            });
          }
        }
        break;
    }
  });
}

/**
 * Attach handlers to canvas element
 * @param {HTMLCanvasElement} canvas
 */
export function attachHandlers(canvas) {
  if (!canvas) return;

  // Touch events (mobile) - need preventDefault for game control
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  canvas.addEventListener('touchcancel', onTouchCancel, { passive: false });

  // Mouse events (desktop)
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseLeave);

  // Wheel needs preventDefault for zoom control
  canvas.addEventListener('wheel', onWheel, { passive: false });
}

/**
 * Check if touch is over a UI element
 * @param {Touch|MouseEvent} e
 * @returns {boolean}
 */
function isTouchOverUI(e) {
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  for (const el of elements) {
    // Check if any parent is a UI element
    if (el.closest('.hud') ||
        el.closest('.bottom-ui') ||
        el.closest('.cam-btns') ||
        el.closest('.upgrade-sheet') ||
        el.closest('.modal-overlay')) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate distance between two touches
 */
function getTouchDistance(e) {
  if (e.touches.length < 2) return 0;
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Cancel any pending long press
 */
function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

/**
 * Handle long press - show tower details if over a tower
 */
function handleLongPress() {
  longPressTriggered = true;

  if (lastTouchCell) {
    const state = getState();
    const { grid } = state;
    const cell = grid[lastTouchCell.y]?.[lastTouchCell.x];

    if (cell?.tower) {
      showUpgrade(cell.tower);
    }
  }
}

// ==================== TOUCH HANDLERS ====================

function onTouchStart(e) {
  e.preventDefault();

  // Check if touch is on UI
  if (isTouchOverUI(e.touches[0])) {
    inputState = InputState.UI_BLOCKED;
    return;
  }

  // Single touch
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    touchStartTime = Date.now();
    longPressTriggered = false;
    inputState = InputState.AWAITING_TAP;

    setDragging(true);
    setDragMoved(false);
    setLastPosition(touch.clientX, touch.clientY);
    setTouchStart(touchStartTime);

    // Track cell under touch for long press
    lastTouchCell = getCellUnderPoint(touch);

    // Start long press timer
    cancelLongPress();
    longPressTimer = setTimeout(handleLongPress, LONG_PRESS_DURATION);
  }
  // Two-finger pinch
  else if (e.touches.length === 2) {
    cancelLongPress();
    inputState = InputState.PINCH_ZOOM;
    pinchStartDist = getTouchDistance(e);
    setTouchStart(pinchStartDist);
    setDragMoved(true); // Pinch is never a tap
  }
}

function onTouchMove(e) {
  e.preventDefault();
  const state = getState();

  if (inputState === InputState.UI_BLOCKED) return;

  // Single touch - camera drag or awaiting tap
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.x;
    const dy = touch.clientY - touchStartPos.y;
    const totalDistance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've moved enough to count as a drag
    if (totalDistance > DRAG_THRESHOLD) {
      cancelLongPress();
      inputState = InputState.CAMERA_DRAG;
      setDragMoved(true);
    }

    // If dragging, update camera
    if (inputState === InputState.CAMERA_DRAG) {
      const moveDx = touch.clientX - state.lastX;
      const moveDy = touch.clientY - state.lastY;

      rotateCamera(-moveDx * DRAG_SENSITIVITY);
      const newHeight = Math.max(5, Math.min(30, state.camHeight - moveDy * HEIGHT_SENSITIVITY));
      dispatch(ActionTypes.SET_CAMERA_STATE, { height: newHeight });

      setLastPosition(touch.clientX, touch.clientY);
    }
  }
  // Two-finger pinch zoom
  else if (e.touches.length === 2 && inputState === InputState.PINCH_ZOOM) {
    const currentDist = getTouchDistance(e);
    const pinchDelta = currentDist - state.touchStart;

    const newDist = Math.max(8, Math.min(40, state.camDist - pinchDelta * PINCH_SENSITIVITY));
    dispatch(ActionTypes.SET_CAMERA_STATE, { dist: newDist });
    setTouchStart(currentDist);
  }
}

function onTouchEnd(e) {
  cancelLongPress();
  const state = getState();

  if (inputState === InputState.UI_BLOCKED) {
    inputState = InputState.IDLE;
    return;
  }

  // Check for tap (short duration, minimal movement, no long press)
  const touchDuration = Date.now() - touchStartTime;
  const wasTap = !state.dragMoved &&
                 touchDuration < TAP_MAX_DURATION &&
                 !longPressTriggered &&
                 inputState !== InputState.PINCH_ZOOM;

  if (wasTap && e.changedTouches.length > 0) {
    handleTap(e.changedTouches[0]);
  }

  // Reset state
  inputState = InputState.IDLE;
  setDragging(false);
  lastTouchCell = null;
  hidePreview();
}

function onTouchCancel(e) {
  cancelLongPress();
  inputState = InputState.IDLE;
  setDragging(false);
  lastTouchCell = null;
  hidePreview();
}

// ==================== MOUSE HANDLERS ====================

function onMouseDown(e) {
  if (e.button !== 0) return; // Only left click

  // Check if click is on UI
  if (isTouchOverUI(e)) {
    inputState = InputState.UI_BLOCKED;
    return;
  }

  touchStartPos = { x: e.clientX, y: e.clientY };
  touchStartTime = Date.now();
  inputState = InputState.AWAITING_TAP;

  setDragging(true);
  setDragMoved(false);
  setLastPosition(e.clientX, e.clientY);
}

function onMouseMove(e) {
  const state = getState();

  // Update placement preview when hovering (not dragging)
  if (state.selectedTower && inputState === InputState.IDLE) {
    updatePreview(e);
  }

  if (inputState === InputState.UI_BLOCKED) return;
  if (!state.dragging) return;

  const dx = e.clientX - touchStartPos.x;
  const dy = e.clientY - touchStartPos.y;
  const totalDistance = Math.sqrt(dx * dx + dy * dy);

  // Check if we've moved enough to count as a drag
  if (totalDistance > DRAG_THRESHOLD / 2) { // Smaller threshold for mouse
    inputState = InputState.CAMERA_DRAG;
    setDragMoved(true);
  }

  // If dragging, update camera
  if (inputState === InputState.CAMERA_DRAG) {
    const moveDx = e.clientX - state.lastX;
    const moveDy = e.clientY - state.lastY;

    rotateCamera(-moveDx * DRAG_SENSITIVITY);
    const newHeight = Math.max(5, Math.min(30, state.camHeight - moveDy * HEIGHT_SENSITIVITY));
    dispatch(ActionTypes.SET_CAMERA_STATE, { height: newHeight });

    setLastPosition(e.clientX, e.clientY);
  }
}

function onMouseUp(e) {
  const state = getState();

  if (inputState === InputState.UI_BLOCKED) {
    inputState = InputState.IDLE;
    setDragging(false);
    return;
  }

  // Check for click (minimal movement)
  if (!state.dragMoved) {
    handleTap(e);
  }

  inputState = InputState.IDLE;
  setDragging(false);
}

function onMouseLeave() {
  inputState = InputState.IDLE;
  setDragging(false);
  hidePreview();
}

function onWheel(e) {
  e.preventDefault();
  if (e.deltaY > 0) {
    zoomOut();
  } else {
    zoomIn();
  }
}

// ==================== TAP HANDLING ====================

/**
 * Get the grid cell under a point
 * @param {Touch|MouseEvent} e
 * @returns {Object|null} Cell coordinates {x, y} or null
 */
function getCellUnderPoint(e) {
  const state = getState();
  const { renderer, raycaster, mouse, camera, cells } = state;

  if (!renderer || !raycaster || !camera || !cells) return null;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cells);

  if (hits.length > 0) {
    return hits[0].object.userData;
  }
  return null;
}

/**
 * Handle tap/click on game grid
 * @param {Event} e - Mouse or touch event
 */
function handleTap(e) {
  const cell = getCellUnderPoint(e);

  if (cell) {
    handleCellTap(cell.x, cell.y);
    hidePreview();
  }
}

// ==================== PREVIEW HANDLING ====================

/**
 * Update placement preview position
 * @param {Event} e - Mouse event
 */
function updatePreview(e) {
  const state = getState();
  const { renderer, raycaster, mouse, camera, cells, grid, selectedTower, themeData, scene, COLS, ROWS } = state;

  if (!renderer || !raycaster || !camera || !selectedTower) return;

  const cell = getCellUnderPoint(e);

  if (cell) {
    const gridCell = grid[cell.y]?.[cell.x];

    // Only show preview on valid cells
    if (gridCell?.type === 'ground' && !gridCell.tower) {
      if (previewCell?.x !== cell.x || previewCell?.y !== cell.y) {
        showPreview(cell.x, cell.y);
      }
    } else {
      hidePreview();
    }
  } else {
    hidePreview();
  }
}

/**
 * Show placement preview at cell
 * @param {number} x - Grid X
 * @param {number} y - Grid Y
 */
function showPreview(x, y) {
  const state = getState();
  const { COLS, ROWS, scene, selectedTower, themeData, money } = state;

  if (!scene || !selectedTower) return;

  const td = themeData.towers.find(t => t.id === selectedTower);
  if (!td) return;

  initPreviewMaterials();

  const affordable = money >= td.cost;
  const hw = COLS / 2;
  const hh = ROWS / 2;
  const worldX = x - hw + 0.5;
  const worldZ = y - hh + 0.5;

  // Remove old preview
  hidePreview();

  // Create preview group
  previewGroup = new THREE.Group();
  previewGroup.position.set(worldX, 0, worldZ);
  previewGroup.userData = { baseMat: null, glowMesh: null, rangeMesh: null };

  // Grid cell highlight (square underneath)
  const gridGeo = new THREE.PlaneGeometry(0.95, 0.95);
  const gridHighlight = new THREE.Mesh(gridGeo, previewMaterials.gridHighlight);
  gridHighlight.rotation.x = -Math.PI / 2;
  gridHighlight.position.y = 0.01;
  previewGroup.add(gridHighlight);

  // Hexagonal base platform
  const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.12, 6);
  const baseMat = affordable ? previewMaterials.validBase : previewMaterials.invalidBase;
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0.06;
  previewGroup.add(baseMesh);
  previewGroup.userData.baseMesh = baseMesh;

  // Glow ring underneath
  const glowGeo = new THREE.CylinderGeometry(0.42, 0.47, 0.02, 6);
  const glowMat = affordable ? previewMaterials.validGlow : previewMaterials.invalidGlow;
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.y = 0.01;
  previewGroup.add(glowMesh);
  previewGroup.userData.glowMesh = glowMesh;

  // Outer glow ring
  const outerGlowGeo = new THREE.TorusGeometry(0.42, 0.03, 8, 6);
  const outerGlow = new THREE.Mesh(outerGlowGeo, glowMat);
  outerGlow.rotation.x = Math.PI / 2;
  outerGlow.position.y = 0.12;
  previewGroup.add(outerGlow);
  previewGroup.userData.outerGlow = outerGlow;

  // Range indicator - outer edge
  const rangeGeo = new THREE.RingGeometry(td.rng[0] - 0.08, td.rng[0], 64);
  const rangeMat = affordable ? previewMaterials.validRange : previewMaterials.invalidRange;
  const rangeMesh = new THREE.Mesh(rangeGeo, rangeMat);
  rangeMesh.rotation.x = -Math.PI / 2;
  rangeMesh.position.y = 0.02;
  previewGroup.add(rangeMesh);
  previewGroup.userData.rangeMesh = rangeMesh;

  // Range indicator - inner fill (very subtle)
  const rangeFillGeo = new THREE.CircleGeometry(td.rng[0] - 0.08, 64);
  const rangeFillMat = new THREE.MeshBasicMaterial({
    color: affordable ? 0x22c55e : 0xef4444,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide
  });
  const rangeFill = new THREE.Mesh(rangeFillGeo, rangeFillMat);
  rangeFill.rotation.x = -Math.PI / 2;
  rangeFill.position.y = 0.015;
  previewGroup.add(rangeFill);

  // Tower icon indicator (floating above)
  const iconGeo = new THREE.OctahedronGeometry(0.08, 0);
  const iconMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(td.clr),
    transparent: true,
    opacity: 0.9
  });
  const iconMesh = new THREE.Mesh(iconGeo, iconMat);
  iconMesh.position.y = 0.35;
  previewGroup.add(iconMesh);
  previewGroup.userData.iconMesh = iconMesh;

  scene.add(previewGroup);
  previewCell = { x, y };
  previewAnimTime = 0;
}

/**
 * Hide placement preview
 */
function hidePreview() {
  const state = getState();

  if (previewGroup && state.scene) {
    // Dispose all geometries in the group
    previewGroup.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      // Don't dispose cached materials
      if (child.material && !Object.values(previewMaterials).includes(child.material)) {
        child.material.dispose();
      }
    });

    state.scene.remove(previewGroup);
    previewGroup = null;
  }

  previewCell = null;
}

/**
 * Clear preview (call on game end)
 */
export function clearPreview() {
  hidePreview();
}

/**
 * Update preview animation (call from game loop)
 * @param {number} dt - Delta time
 */
export function updatePreviewAnimation(dt) {
  if (!previewGroup) return;

  previewAnimTime += dt;
  const t = previewAnimTime;

  // Animate glow pulsing
  if (previewGroup.userData.glowMesh) {
    const glowScale = 1 + Math.sin(t * 4) * 0.1;
    previewGroup.userData.glowMesh.scale.setScalar(glowScale);
    previewGroup.userData.glowMesh.material.opacity = 0.3 + Math.sin(t * 3) * 0.15;
  }

  // Animate outer glow ring
  if (previewGroup.userData.outerGlow) {
    previewGroup.userData.outerGlow.material.opacity = 0.5 + Math.sin(t * 5) * 0.2;
  }

  // Animate floating icon
  if (previewGroup.userData.iconMesh) {
    previewGroup.userData.iconMesh.position.y = 0.35 + Math.sin(t * 3) * 0.05;
    previewGroup.userData.iconMesh.rotation.y = t * 2;
  }

  // Animate range mesh
  if (previewGroup.userData.rangeMesh) {
    previewGroup.userData.rangeMesh.material.opacity = 0.12 + Math.sin(t * 2) * 0.05;
  }
}

/**
 * Reset input state (call on game reset)
 */
export function resetInputState() {
  cancelLongPress();
  inputState = InputState.IDLE;
  lastTouchCell = null;
  hidePreview();
}
