// Three.js scene setup with enhanced graphics
// Improved lighting, materials, and visual effects

import { getState, setThreeObjects, setCells, clearCells } from './state.js';
import { updateCamera, initCameraState } from './camera.js';
import { attachHandlers } from './input.js';
import { addObstacleVisuals } from '../rendering/obstacles.js';
import { addSpawnAndPenVisuals } from '../rendering/markers.js';
import { buildCells, buildLights, addPerimeterDecor } from '../rendering/environment.js';

// Store ambient particles for animation
let ambientParticles = null;

export function init3D() {
  const state = getState();
  const { themeData, COLS, ROWS } = state;

  const wrap = document.querySelector('.canvas-wrap');

  // Clean up existing renderer
  if (state.renderer) {
    state.renderer.dispose();
    if (state.renderer.domElement && state.renderer.domElement.parentNode) {
      state.renderer.domElement.parentNode.removeChild(state.renderer.domElement);
    }
  }

  // Create or reuse canvas
  let canvas = wrap.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    wrap.appendChild(canvas);
  }

  let w = wrap ? wrap.clientWidth : 0;
  let h = wrap ? wrap.clientHeight : 0;

  if (!w || !h) {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
  }

  // Create scene with enhanced atmosphere
  const scene = new THREE.Scene();
  const isHockey = state.theme === 'hockey';

  // Dynamic background gradient
  scene.background = new THREE.Color(themeData.envColor);

  // Enhanced fog for depth
  scene.fog = new THREE.FogExp2(themeData.envColor, 0.015);

  // Camera with better FOV for mobile
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
  const camDist = Math.max(COLS, ROWS) * 0.85;
  const camHeight = camDist * 0.55;

  // High-performance renderer with enhanced settings
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false
  });

  renderer.setSize(w, h);
  
  // Adaptive pixel ratio: cap at 1.5x on mobile for better performance, 2x on desktop
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const maxPixelRatio = isMobile ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

  // Enhanced shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Tone mapping for better colors
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isHockey ? 1.1 : 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // === ENHANCED LIGHTING SYSTEM ===

  // Hemisphere light for natural ambient (sky/ground)
  const hemiLight = new THREE.HemisphereLight(
    isHockey ? 0x87ceeb : 0x87ceeb, // Sky color
    isHockey ? 0x444466 : 0x3d5c3d, // Ground color
    0.6
  );
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // Main directional light (sun)
  const sun = new THREE.DirectionalLight(0xffffff, isHockey ? 1.4 : 1.2);
  sun.position.set(COLS * 0.5, 30, ROWS * 0.3);
  sun.castShadow = true;

  // Adaptive shadow quality: lower on mobile for better performance
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shadowMapSize = isMobile ? 1024 : 2048;
  
  // Higher quality shadows
  sun.shadow.mapSize.width = shadowMapSize;
  sun.shadow.mapSize.height = shadowMapSize;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -COLS * 1.2;
  sun.shadow.camera.right = COLS * 1.2;
  sun.shadow.camera.top = ROWS * 1.2;
  sun.shadow.camera.bottom = -ROWS * 1.2;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Rim/fill light for better depth
  const rimLight = new THREE.DirectionalLight(
    isHockey ? 0x4488ff : 0x88ff88,
    0.4
  );
  rimLight.position.set(-COLS * 0.6, 20, -ROWS * 0.6);
  scene.add(rimLight);

  // Accent point lights at corners
  const accentColor = isHockey ? 0x00d4ff : 0x22c55e;
  const cornerPositions = [
    [-COLS / 2, 3, -ROWS / 2],
    [COLS / 2, 3, -ROWS / 2],
    [-COLS / 2, 3, ROWS / 2],
    [COLS / 2, 3, ROWS / 2]
  ];

  cornerPositions.forEach(([x, y, z]) => {
    const pointLight = new THREE.PointLight(accentColor, 0.3, 15);
    pointLight.position.set(x, y, z);
    scene.add(pointLight);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Store in state
  setThreeObjects(scene, camera, renderer, raycaster, mouse);

  // Update camera state
  const stateRef = getState();
  stateRef.camDist = camDist;
  stateRef.camHeight = camHeight;
  updateCamera();

  // Build arena based on theme
  if (isHockey) {
    buildHockeyRink();
  } else {
    buildSoccerPitch();
  }

  // Add ambient particles
  createAmbientParticles(isHockey);

  // Setup input handlers on canvas
  attachHandlers(canvas);
}

function buildHockeyRink() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  // === ENHANCED ICE FLOOR ===
  const iceColor = new THREE.Color(themeData.groundColor);

  // Create ice texture pattern
  const iceCanvas = document.createElement('canvas');
  iceCanvas.width = 512;
  iceCanvas.height = 512;
  const ctx = iceCanvas.getContext('2d');

  // Base ice color
  ctx.fillStyle = '#e8f4f8';
  ctx.fillRect(0, 0, 512, 512);

  // Add subtle scratches
  ctx.strokeStyle = 'rgba(200, 220, 230, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.lineTo(Math.random() * 512, Math.random() * 512);
    ctx.stroke();
  }

  // Add sparkles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const iceTexture = new THREE.CanvasTexture(iceCanvas);
  iceTexture.wrapS = THREE.RepeatWrapping;
  iceTexture.wrapT = THREE.RepeatWrapping;
  iceTexture.repeat.set(COLS / 4, ROWS / 4);

  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xe0f4f8,
    map: iceTexture,
    metalness: 0.1,
    roughness: 0.05,
    envMapIntensity: 0.5
  });

  const ice = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), iceMat);
  ice.rotation.x = -Math.PI / 2;
  ice.receiveShadow = true;
  scene.add(ice);

  // Reflective layer under ice
  const reflectMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.15
  });
  const reflect = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), reflectMat);
  reflect.rotation.x = -Math.PI / 2;
  reflect.position.y = 0.005;
  scene.add(reflect);

  // === ENHANCED BOARDS ===
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1
  });

  const topCapMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    roughness: 0.4,
    metalness: 0.3,
    emissive: 0xffcc00,
    emissiveIntensity: 0.1
  });

  const boards = [
    [0, -hh - 0.7, COLS + 1.5, 0.6, 0.35],
    [0, hh + 0.7, COLS + 1.5, 0.6, 0.35],
    [-hw - 0.7, 0, 0.35, 0.6, ROWS + 1.5],
    [hw + 0.7, 0, 0.35, 0.6, ROWS + 1.5]
  ];

  boards.forEach(([x, z, w, h, d]) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boardMat);
    board.position.set(x, h / 2, z);
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);

    // Yellow top cap
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.08, d + 0.05), topCapMat);
    cap.position.set(x, h + 0.04, z);
    scene.add(cap);
  });

  // === ENHANCED LINES ===
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    emissive: 0xcc0000,
    emissiveIntensity: 0.15,
    roughness: 0.8
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x0066dd,
    emissive: 0x0066dd,
    emissiveIntensity: 0.1,
    roughness: 0.8
  });

  const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, ROWS), redMat);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 0.015;
  scene.add(centerLine);

  [-hw * 0.38, hw * 0.38].forEach(x => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, ROWS), blueMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.015, 0);
    scene.add(line);
  });

  // Center circle with glow
  const circle = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.35, 64), redMat);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 0.016;
  scene.add(circle);

  // Center dot
  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 32),
    new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0xcc0000, emissiveIntensity: 0.2 })
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.y = 0.017;
  scene.add(dot);

  // Add visual elements
  addObstacleVisuals(hw, hh);
  addSpawnAndPenVisuals(hw, hh);
  buildCells(hw, hh);
  buildLights(hw, hh);
}

function buildSoccerPitch() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  // === ENHANCED GRASS FLOOR ===
  // Create grass texture with stripes
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = 512;
  grassCanvas.height = 512;
  const ctx = grassCanvas.getContext('2d');

  // Alternating grass stripes
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2d8a3e' : '#34a048';
    ctx.fillRect(0, i * 64, 512, 64);
  }

  // Add grass texture noise
  for (let i = 0; i < 2000; i++) {
    const shade = Math.random() > 0.5 ? 'rgba(0,50,0,0.1)' : 'rgba(50,100,50,0.1)';
    ctx.fillStyle = shade;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 4);
  }

  const grassTexture = new THREE.CanvasTexture(grassCanvas);
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(COLS / 8, ROWS / 8);

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x3cb371,
    map: grassTexture,
    roughness: 0.9,
    metalness: 0.0
  });

  const grass = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 4, ROWS + 4), grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  scene.add(grass);

  // === PITCH MARKINGS ===
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.1,
    roughness: 0.9
  });

  // Center line
  const midLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, ROWS + 0.5), lineMat);
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.y = 0.02;
  scene.add(midLine);

  // Center circle
  const center = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.45, 64), lineMat);
  center.rotation.x = -Math.PI / 2;
  center.position.y = 0.02;
  scene.add(center);

  // Center spot
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), lineMat);
  spot.rotation.x = -Math.PI / 2;
  spot.position.y = 0.021;
  scene.add(spot);

  // Boundary lines
  const boundaryPositions = [
    [0, -hh, COLS + 0.5, 0.12],  // Bottom
    [0, hh, COLS + 0.5, 0.12],   // Top
    [-hw, 0, 0.12, ROWS + 0.5], // Left
    [hw, 0, 0.12, ROWS + 0.5]   // Right
  ];

  boundaryPositions.forEach(([x, z, w, h]) => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.02, z);
    scene.add(line);
  });

  // Goal boxes
  const boxW = Math.max(2.5, COLS * 0.2);
  const boxH = Math.max(2.2, ROWS * 0.3);

  [[-hw, 0], [hw, 0]].forEach(([baseX, z]) => {
    const side = baseX < 0 ? 1 : -1;
    const centerX = baseX + (boxW / 2) * side;

    // Goal box lines
    const topLine = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.12), lineMat);
    topLine.rotation.x = -Math.PI / 2;
    topLine.position.set(centerX, 0.02, z - boxH / 2);
    scene.add(topLine);

    const botLine = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.12), lineMat);
    botLine.rotation.x = -Math.PI / 2;
    botLine.position.set(centerX, 0.02, z + boxH / 2);
    scene.add(botLine);

    const endLine = new THREE.Mesh(new THREE.PlaneGeometry(0.12, boxH), lineMat);
    endLine.rotation.x = -Math.PI / 2;
    endLine.position.set(baseX + boxW * side, 0.02, z);
    scene.add(endLine);
  });

  // Add visual elements
  addObstacleVisuals(hw, hh);
  addSpawnAndPenVisuals(hw, hh);
  buildCells(hw, hh);
  buildLights(hw, hh);
}

/**
 * Create floating ambient particles
 */
function createAmbientParticles(isHockey) {
  const state = getState();
  const { scene, COLS, ROWS } = state;

  // Reduce particle count on mobile for better performance
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const particleCount = isMobile ? 50 : 100;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color = isHockey ? new THREE.Color(0x88ddff) : new THREE.Color(0x88ff88);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * COLS * 1.5;
    positions[i * 3 + 1] = Math.random() * 8 + 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * ROWS * 1.5;

    const brightness = 0.5 + Math.random() * 0.5;
    colors[i * 3] = color.r * brightness;
    colors[i * 3 + 1] = color.g * brightness;
    colors[i * 3 + 2] = color.b * brightness;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  ambientParticles = new THREE.Points(geometry, material);
  scene.add(ambientParticles);
}

/**
 * Update ambient particles (call from animation loop)
 */
export function updateAmbientParticles(dt) {
  if (!ambientParticles) return;

  const positions = ambientParticles.geometry.attributes.position.array;
  const state = getState();
  const { ROWS } = state;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += dt * 0.3; // Float upward

    // Reset when too high
    if (positions[i + 1] > 10) {
      positions[i + 1] = 0.5;
    }

    // Slight drift
    positions[i] += Math.sin(Date.now() * 0.001 + i) * dt * 0.1;
    positions[i + 2] += Math.cos(Date.now() * 0.001 + i) * dt * 0.1;
  }

  ambientParticles.geometry.attributes.position.needsUpdate = true;
}

export function onResize() {
  const state = getState();
  const { camera, renderer } = state;

  if (!camera || !renderer) return;

  const wrap = document.querySelector('.canvas-wrap');
  let w = wrap ? wrap.clientWidth : 0;
  let h = wrap ? wrap.clientHeight : 0;

  if (!w || !h) {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
  }

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

/**
 * Clean up scene for game reset
 */
export function cleanupScene() {
  const state = getState();
  const { scene } = state;

  ambientParticles = null;

  if (!scene) return;

  while (scene.children.length > 0) {
    const obj = scene.children[0];
    scene.remove(obj);

    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  }
}
