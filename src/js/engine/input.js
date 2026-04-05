// Input handling - touch, mouse, keyboard events
// Includes placement preview and smooth interactions

import { getState, setDragging, setDragMoved, setLastPosition, setTouchStart } from './state.js';
import { rotateCamera, zoomIn, zoomOut } from './camera.js';
import { handleCellTap } from '../systems/towers.js';
import { onResize } from './scene.js';

// Preview mesh for tower placement
let previewMesh = null;
let previewCell = null;

// Track pinch distance separately from tap-timestamp to avoid type mismatch
let pinchStartDist = 0;

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
  // Wait for canvas to be available
  const checkCanvas = () => {
    const wrap = document.querySelector('.canvas-wrap');
    const canvas = wrap?.querySelector('canvas');

    if (canvas) {
      attachHandlers(canvas);
    } else {
      // Canvas will be created when game starts
      // Set up a mutation observer or just rely on game start
    }
  };

  // Set up window resize handler immediately
  window.addEventListener('resize', debouncedResize);

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

  // Touch events need preventDefault for game control, so not passive
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });
  
  // Mouse events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseLeave);
  
  // Wheel needs preventDefault for zoom control
  canvas.addEventListener('wheel', onWheel, { passive: false });
  
  // Click for tap handling
  canvas.addEventListener('click', onClick);
}

function onTouchStart(e) {
  e.preventDefault();

  if (e.touches.length === 1) {
    setDragging(true);
    setDragMoved(false);
    setLastPosition(e.touches[0].clientX, e.touches[0].clientY);
    setTouchStart(Date.now()); // Only used for tap timing
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStartDist = Math.sqrt(dx * dx + dy * dy); // Use local var for pinch
    setDragMoved(true); // Pinch is never a tap
  }
}

function onTouchMove(e) {
  e.preventDefault();
  const state = getState();

  if (e.touches.length === 1 && state.dragging) {
    const dx = e.touches[0].clientX - state.lastX;
    const dy = e.touches[0].clientY - state.lastY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setDragMoved(true);
    }

    // Normalize rotation sensitivity by DPI (capped at 2x)
    const dpiScale = Math.min(window.devicePixelRatio || 1, 2);
    rotateCamera(-dx * 0.008 / dpiScale);
    state.camHeight = Math.max(5, Math.min(30, state.camHeight - dy * 0.05 / dpiScale));

    setLastPosition(e.touches[0].clientX, e.touches[0].clientY);
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Use local pinchStartDist (not touchStart) to avoid type mismatch
    state.camDist = Math.max(8, Math.min(40, state.camDist - (dist - pinchStartDist) * 0.04));
    pinchStartDist = dist;
  }
}

function onTouchEnd(e) {
  const state = getState();

  // Only treat as a tap if: no drag movement AND it was a single-touch AND time was short
  if (!state.dragMoved && e.changedTouches.length === 1 && Date.now() - state.touchStart < TAP_THRESHOLD_MS) {
    handleTap(e.changedTouches[0]);
  }

  setDragging(false);
  hidePreview();
}

function onMouseDown(e) {
  if (e.button !== 0) return; // Only left click

  setDragging(true);
  setDragMoved(false);
  setLastPosition(e.clientX, e.clientY);
}

function onMouseMove(e) {
  const state = getState();

  // Update placement preview
  if (state.selectedTower && !state.dragging) {
    updatePreview(e);
  }

  if (!state.dragging) return;

  const dx = e.clientX - state.lastX;
  const dy = e.clientY - state.lastY;

  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    setDragMoved(true);
  }

  // Update camera rotation
  rotateCamera(-dx * 0.008);
  state.camHeight = Math.max(5, Math.min(30, state.camHeight - dy * 0.05));

  setLastPosition(e.clientX, e.clientY);
}

function onMouseUp() {
  setDragging(false);
}

function onMouseLeave() {
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

function onClick(e) {
  const state = getState();
  if (!state.dragMoved) {
    handleTap(e);
  }
}

/**
 * Handle tap/click on game grid
 * @param {Event} e - Mouse or touch event
 */
function handleTap(e) {
  const state = getState();
  const { renderer, raycaster, mouse, camera, cells } = state;

  if (!renderer || !raycaster || !camera) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cells);

  if (hits.length > 0) {
    const { x, y } = hits[0].object.userData;
    handleCellTap(x, y);
    hidePreview();
  }
}

/**
 * Update placement preview position
 * @param {Event} e - Mouse event
 */
function updatePreview(e) {
  const state = getState();
  const { renderer, raycaster, mouse, camera, cells, grid, selectedTower, themeData, scene, COLS, ROWS } = state;

  if (!renderer || !raycaster || !camera || !selectedTower) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cells);

  if (hits.length > 0) {
    const { x, y } = hits[0].object.userData;
    const cell = grid[y][x];

    // Only show preview on valid cells
    if (cell.type === 'ground' && !cell.tower) {
      if (previewCell?.x !== x || previewCell?.y !== y) {
        showPreview(x, y);
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

  const affordable = money >= td.cost;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  // Remove old preview
  if (previewMesh) {
    scene.remove(previewMesh);
  }

  // Create preview mesh
  previewMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16),
    new THREE.MeshBasicMaterial({
      color: affordable ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.5
    })
  );

  previewMesh.position.set(x - hw + 0.5, 0.05, y - hh + 0.5);
  scene.add(previewMesh);

  // Add range indicator
  const rangeMesh = new THREE.Mesh(
    new THREE.RingGeometry(td.rng[0] - 0.05, td.rng[0], 64),
    new THREE.MeshBasicMaterial({
      color: affordable ? 0x00ff00 : 0xff0000,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    })
  );
  rangeMesh.rotation.x = -Math.PI / 2;
  rangeMesh.position.set(x - hw + 0.5, 0.02, y - hh + 0.5);
  previewMesh.add(rangeMesh);

  previewCell = { x, y };
}

/**
 * Hide placement preview
 */
function hidePreview() {
  const state = getState();

  if (previewMesh && state.scene) {
    state.scene.remove(previewMesh);
    previewMesh = null;
  }

  previewCell = null;
}

/**
 * Clear preview (call on game end)
 */
export function clearPreview() {
  hidePreview();
}
