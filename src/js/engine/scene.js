// Three.js scene setup with enhanced graphics
// Improved lighting, materials, and visual effects

import { getState, setThreeObjects, setCells, clearCells } from './state.js';
import { updateCamera, initCameraState, computeFitDistance } from './camera.js';
import { attachHandlers } from './input.js';
import { addObstacleVisuals } from '../rendering/obstacles.js';
import { addSpawnAndPenVisuals } from '../rendering/markers.js';
import { buildCells, buildLights, addPerimeterDecor } from '../rendering/environment.js';
import { getQualityTier, getQualityName, applyRendererQuality } from '../rendering/quality.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { createPathPreview } from '../rendering/path-preview.js';
import { initPostProcessing, resizePostProcessing, setPostProcessingQuality } from './postprocessing.js';
import { setSceneEnvMap } from '../rendering/tower-meshes.js';
import { on, GameEvents } from './events.js';
import { initTrails, cleanupTrails } from '../rendering/trails.js';

// Store ambient particles for animation
let ambientParticles = null;
let ambientTime = 0;

// Store spotlights for animation updates
let sceneSpotlights = [];
let spotBaseIntensities = [];

// SC-2.6: Placement grid mesh (module-level for visibility toggling)
let placementGrid = null;

// SC-2.6: Cached ice scratch normal map canvas texture (generated once)
let _iceScratchNormalMap = null;

// Cached floor textures — survive game restarts, cleared on theme change
let _iceTexture = null;
let _grassTexture = null;
let _lastIceThemeKey = null;
let _lastGrassThemeKey = null;

// SC-2.6: Wire grid visibility to tower selection and wave state
on(GameEvents.UI_TOWER_SELECT, ({ tower }) => {
  setGridVisible(tower !== null && tower !== undefined);
});

// Hide grid when wave starts or ends
on(GameEvents.WAVE_START, () => setGridVisible(false));
on(GameEvents.WAVE_END,   () => setGridVisible(false));

/**
 * SC-2.6: Show or hide the placement grid overlay.
 * @param {boolean} visible
 */
export function setGridVisible(visible) {
  if (placementGrid) {
    placementGrid.visible = Boolean(visible);
  }
}

/**
 * SC-2.6: Create (or return cached) ice scratch normal map texture.
 * Draws 40 random thin lines to simulate skate scratches.
 * @returns {THREE.CanvasTexture}
 */
export function createIceScratchNormalMap() {
  if (_iceScratchNormalMap) return _iceScratchNormalMap;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Neutral normal map base: RGB(128,128,255)
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(128,128,255,0.3)';
  ctx.lineWidth = 1;

  const scratchCount = 30 + Math.floor(Math.random() * 20);
  for (let i = 0; i < scratchCount; i++) {
    const x1 = Math.random() * 512;
    const y1 = Math.random() * 512;
    const len = 30 + Math.random() * 80;
    const angle = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
    ctx.stroke();
  }

  _iceScratchNormalMap = new THREE.CanvasTexture(canvas);
  _iceScratchNormalMap.wrapS = THREE.RepeatWrapping;
  _iceScratchNormalMap.wrapT = THREE.RepeatWrapping;
  return _iceScratchNormalMap;
}

/**
 * SC-2.6: Build the placement grid LineSegments for the full COLS x ROWS arena.
 * Grid is hidden by default; shown via setGridVisible(true).
 */
function buildPlacementGrid(scene, COLS, ROWS) {
  const hw = COLS / 2;
  const hh = ROWS / 2;

  const positions = [];
  const indices = [];
  let idx = 0;

  // Vertical lines (along Z axis, stepping X from -hw to +hw)
  for (let c = 0; c <= COLS; c++) {
    const x = -hw + c;
    positions.push(x, 0, -hh, x, 0, hh);
    indices.push(idx, idx + 1);
    idx += 2;
  }

  // Horizontal lines (along X axis, stepping Z from -hh to +hh)
  for (let r = 0; r <= ROWS; r++) {
    const z = -hh + r;
    positions.push(-hw, 0, z, hw, 0, z);
    indices.push(idx, idx + 1);
    idx += 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute
    ? new THREE.Float32BufferAttribute(positions, 3)
    : new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setIndex(indices);

  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.35,
    transparent: true
  });

  const grid = new THREE.LineSegments(geo, mat);
  grid.position.y = 0.02;
  grid.visible = false;
  scene.add(grid);
  placementGrid = grid;
}

export function init3D() {
  const state = getState();
  const { themeData, COLS, ROWS } = state;
  const quality = getQualityTier();
  const visuals = getVisualProfile(themeData);

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

  // Create scene
  const scene = new THREE.Scene();
  const isHockey = state.theme === 'hockey';
  const isSoccer = state.theme === 'soccer';

  const bgColor = visuals.map.background;
  scene.background = new THREE.Color(bgColor);

  scene.fog = new THREE.FogExp2(visuals.map.fog || bgColor, (visuals.map.fogDensity || 0.007) * 0.55);

  // Camera with good FOV. Distance is aspect-aware so the arena frames properly
  // on a portrait phone as well as a widescreen monitor — see computeFitDistance.
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
  const camDist = computeFitDistance(COLS, ROWS, w / h);
  const camHeight = camDist * 0.55;

  // High-performance renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    powerPreference: 'high-performance',
    alpha: false
  });

  renderer.setSize(w, h);
  applyRendererQuality(renderer);

  // Enhanced shadows
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Tone mapping – ACES filmic with restrained exposure to prevent washout
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = visuals.lighting.exposure || 0.9;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // === STADIUM SKY DOME ===
  buildSkyDome(scene, isHockey, COLS, ROWS, visuals);

  // === ENHANCED LIGHTING SYSTEM ===

  // Hemisphere light – sky/ground ambient bounce (reduced to prevent washout)
  const hemiLight = new THREE.HemisphereLight(
    visuals.lighting.hemiSky,
    visuals.lighting.hemiGround,
    visuals.lighting.hemiIntensity
  );
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // Main directional light (sun / overhead floodlight) – reduced for readability
  const sun = new THREE.DirectionalLight(
    visuals.lighting.sun,
    visuals.lighting.sunIntensity
  );
  sun.position.set(COLS * 0.4, 28, ROWS * 0.25);
  sun.castShadow = true;

  const shadowMapSize = quality.shadowMapSize;
  sun.shadow.mapSize.width = shadowMapSize;
  sun.shadow.mapSize.height = shadowMapSize;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left   = -COLS * 1.3;
  sun.shadow.camera.right  =  COLS * 1.3;
  sun.shadow.camera.top    =  ROWS * 1.3;
  sun.shadow.camera.bottom = -ROWS * 1.3;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  // Rim/fill light – adds depth from opposite side (gentle)
  const rimLight = new THREE.DirectionalLight(
    visuals.lighting.rim,
    visuals.lighting.rimIntensity
  );
  rimLight.position.set(-COLS * 0.5, 18, -ROWS * 0.5);
  scene.add(rimLight);

  // Stadium SpotLights from corner poles (real illumination, not just decorative)
  const hw = COLS / 2;
  const hh = ROWS / 2;
  // All four spots aim at the arena centre, so their intensities add up there.
  // The default is deliberately conservative: a theme that forgets to set this
  // should look flat, not blown out to white.
  const spotIntensity = quality.spotLights
    ? (visuals.lighting.spotIntensity ?? 3)
    : 0;

  // Cone variety: alternating wide/tight angles and warm/cool colors
  const spotAngles = [Math.PI * 0.35, Math.PI * 0.22, Math.PI * 0.35, Math.PI * 0.22];
  const spotColors  = [0xfff5e0, 0xe8f0ff, 0xfff5e0, 0xe8f0ff]; // warm / cool alternating

  const spotPositions = [
    [-hw - 3, 9, -hh - 3],
    [-hw - 3, 9,  hh + 3],
    [ hw + 3, 9, -hh - 3],
    [ hw + 3, 9,  hh + 3]
  ];

  // Pick 2 spotlights closest to camera default position for shadow casting
  const camDefaultZ = ROWS * 0.85 * 0.5;
  const sortedByDist = spotPositions
    .map(([x, , z], i) => {
      const dx = x;
      const dz = z - camDefaultZ;
      return { i, dist: Math.sqrt(dx * dx + dz * dz) };
    })
    .sort((a, b) => a.dist - b.dist);
  const shadowSpotIndices = new Set([sortedByDist[0].i, sortedByDist[1].i]);

  sceneSpotlights = [];
  spotBaseIntensities = [];

  spotPositions.forEach(([x, y, z], i) => {
    if (spotIntensity > 0) {
      const spot = new THREE.SpotLight(spotColors[i], spotIntensity, 40, spotAngles[i], 0.35, 1.2);
      spot.position.set(x, y, z);
      spot.target.position.set(0, 0, 0);

      // Enable shadows on the 2 closest spots when on high quality
      if (getQualityName() === 'high' && shadowSpotIndices.has(i)) {
        spot.castShadow = true;
        spot.shadow.mapSize.width  = 512;
        spot.shadow.mapSize.height = 512;
      } else {
        spot.castShadow = false;
      }

      sceneSpotlights.push(spot);
      spotBaseIntensities.push(spotIntensity);
      scene.add(spot);
      scene.add(spot.target);
    }

    // Subtle point light glow at fixture position (reduced intensity)
    if (quality.pointLights) {
      const pt = new THREE.PointLight(spotColors[i], isHockey ? 0.10 : 0.20, 12);
      pt.position.set(x, y, z);
      scene.add(pt);
    }
  });

  // Subtle colored accent lights (reduced for color preservation)
  const accentColor = visuals.lighting.accent;
  const accentPositions = [
    [-hw * 0.5, 2, -hh * 0.5],
    [ hw * 0.5, 2,  hh * 0.5]
  ];
  accentPositions.forEach(([x, y, z]) => {
    if (quality.pointLights) {
      const pt = new THREE.PointLight(accentColor, isHockey ? 0.08 : 0.15, 10);
      pt.position.set(x, y, z);
      scene.add(pt);
    }
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Store in state
  setThreeObjects(scene, camera, renderer, raycaster, mouse);

  // Initialize post-processing pipeline
  try {
    initPostProcessing(renderer, scene, camera);
    setPostProcessingQuality(getQualityName() || 'high');
  } catch (e) {
    console.warn('Post-processing init failed, using direct render:', e);
    // Ensure we fall back to direct rendering
    try { setPostProcessingQuality('low'); } catch (_) {}
  }

  // Update camera state
  const stateRef = getState();
  stateRef.camDist = camDist;
  stateRef.camHeight = camHeight;
  updateCamera();

  // Build arena based on theme
  if (isHockey) {
    buildHockeyRink();
  } else if (isSoccer) {
    buildSoccerPitch();
  } else {
    buildOrbitalPlatform();
  }

  // Add ambient particles
  createAmbientParticles(visuals);

  // Path preview lines (spawn → base)
  try { createPathPreview(scene); } catch (e) { console.warn('Path preview init failed:', e); }

  // SC-2.5: Generate PMREMGenerator envMap for metallic reflections
  _generateEnvMap(renderer, scene);

  // SC-3.3: Initialize projectile trail pool
  try { initTrails(scene); } catch (e) { console.warn('Trails init failed:', e); }

  // Setup input handlers on canvas
  attachHandlers(canvas);
}

/**
 * Generate a simple envMap from the built scene and apply to metallic materials.
 * Uses PMREMGenerator to process scene lighting into a cubemap.
 */
function _generateEnvMap(renderer, scene) {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envRenderTarget = pmrem.fromScene(scene);
    setSceneEnvMap(envRenderTarget.texture);
    pmrem.dispose();
  } catch (e) {
    // PMREMGenerator may not be available in all contexts (e.g. tests)
  }
}

/**
 * Build a large hemisphere sky dome with a gradient texture
 */
function buildSkyDome(scene, isHockey, COLS, ROWS, visuals) {
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 4;
  skyCanvas.height = 256;
  const ctx = skyCanvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  const bg = new THREE.Color(visuals.map.background);
  const fog = new THREE.Color(visuals.map.fog || visuals.map.background);
  gradient.addColorStop(0, `#${fog.clone().multiplyScalar(1.45).getHexString()}`);
  gradient.addColorStop(0.42, `#${fog.getHexString()}`);
  gradient.addColorStop(0.72, `#${bg.clone().multiplyScalar(0.9).getHexString()}`);
  gradient.addColorStop(1, `#${bg.getHexString()}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 256);

  const skyTex = new THREE.CanvasTexture(skyCanvas);
  skyTex.magFilter = THREE.LinearFilter;
  skyTex.minFilter = THREE.LinearFilter;

  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    fog: false
  });

  const skyGeo = new THREE.SphereGeometry(120, 32, 16);
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // Stars / dust field for hockey; subtle for soccer
  const quality = getQualityTier();
  const starCount = isHockey ? quality.skyParticles : Math.floor(quality.skyParticles * 0.45);
  const starPositions = new Float32Array(starCount * 3);
  const starColors    = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI * 0.5; // Upper hemisphere only
    const r = 90 + Math.random() * 10;
    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 5;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const brightness = 0.4 + Math.random() * 0.6;
    const accent = new THREE.Color(visuals.lighting.accent);
    starColors[i * 3]     = accent.r * brightness;
    starColors[i * 3 + 1] = accent.g * brightness;
    starColors[i * 3 + 2] = accent.b * brightness;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });

  scene.add(new THREE.Points(starGeo, starMat));
}

/**
 * Get or create the ice floor texture, keyed by theme floor colors.
 * Cached at module level — survives game restarts.
 */
function getIceTexture(visuals) {
  const key = visuals.map.floor.base + '|' + visuals.map.floor.line + '|' + visuals.map.floor.scratch;
  if (_iceTexture && _lastIceThemeKey === key) return _iceTexture;

  if (_iceTexture) _iceTexture.dispose();

  const iceCanvas = document.createElement('canvas');
  iceCanvas.width = 512;
  iceCanvas.height = 512;
  const ctx = iceCanvas.getContext('2d');

  ctx.fillStyle = visuals.map.floor.base;
  ctx.fillRect(0, 0, 512, 512);

  const iceGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 390);
  iceGrad.addColorStop(0, 'rgba(255,255,255,0.035)');
  iceGrad.addColorStop(0.52, 'rgba(53,140,178,0.16)');
  iceGrad.addColorStop(1, 'rgba(5,45,80,0.32)');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = visuals.map.floor.line;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 48; i++) {
    const y = i * 11;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.strokeStyle = visuals.map.floor.scratch;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 105; i++) {
    const x1 = Math.random() * 512;
    const y1 = Math.random() * 512;
    const len = 20 + Math.random() * 60;
    const angle = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 55; i++) {
    const r = Math.random() * 1.8 + 0.3;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _iceTexture = new THREE.CanvasTexture(iceCanvas);
  _lastIceThemeKey = key;
  return _iceTexture;
}

/**
 * Get or create the grass floor texture, keyed by theme floor colors.
 * Cached at module level — survives game restarts.
 */
function getGrassTexture(visuals) {
  const key = visuals.map.floor.base + '|' + visuals.map.floor.alt + '|' + visuals.map.floor.blade;
  if (_grassTexture && _lastGrassThemeKey === key) return _grassTexture;

  if (_grassTexture) _grassTexture.dispose();

  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = 512;
  grassCanvas.height = 512;
  const ctx = grassCanvas.getContext('2d');

  const STRIPE_COUNT = 12;
  const stripH = 512 / STRIPE_COUNT;
  for (let i = 0; i < STRIPE_COUNT; i++) {
    ctx.fillStyle = i % 2 === 0 ? visuals.map.floor.alt : visuals.map.floor.base;
    ctx.fillRect(0, i * stripH, 512, stripH);

    const edgeAlpha = 0.04;
    ctx.fillStyle = i % 2 === 0
      ? `rgba(255,255,255,${edgeAlpha})`
      : `rgba(0,40,0,${edgeAlpha})`;
    ctx.fillRect(0, i * stripH, 512, 3);
  }

  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
    ctx.fillRect(i * 64, 0, 64, 512);
  }

  for (let i = 0; i < 2400; i++) {
    const alpha = 0.06 + Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(0,70,20,${alpha})`
      : visuals.map.floor.blade;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random(), 3 + Math.random() * 3);
  }

  _grassTexture = new THREE.CanvasTexture(grassCanvas);
  _lastGrassThemeKey = key;
  return _grassTexture;
}

function buildHockeyRink() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const visuals = getVisualProfile(themeData);
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  // === ENHANCED ICE FLOOR ===
  const iceTexture = getIceTexture(visuals);
  iceTexture.wrapS = THREE.RepeatWrapping;
  iceTexture.wrapT = THREE.RepeatWrapping;
  iceTexture.repeat.set(COLS / 4, ROWS / 4);
  iceTexture.anisotropy = getQualityTier().anisotropy;

  // SC-2.6: Ice scratch normal map applied to main floor
  const scratchNormalMap = createIceScratchNormalMap();
  scratchNormalMap.repeat.set(COLS / 4, ROWS / 4);

  const iceMat = new THREE.MeshStandardMaterial({
    color: visuals.map.floor.meshColor,
    map: iceTexture,
    normalMap: scratchNormalMap,
    normalScale: new THREE.Vector2(0.18, 0.18),
    metalness: visuals.map.floor.metalness ?? 0.02,
    roughness: visuals.map.floor.roughness ?? 0.42,
    envMapIntensity: 0.14
  });

  const ice = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), iceMat);
  ice.rotation.x = -Math.PI / 2;
  ice.receiveShadow = true;
  scene.add(ice);

  // SC-2.6: Reflective ice "mirror" layer below the main floor (Y = -0.01)
  const iceReflectMat = new THREE.MeshStandardMaterial({
    color: 0x6fa9c9,
    metalness: 0.02,
    roughness: 0.32,
    opacity: 0.035,
    transparent: true
  });
  const iceReflect = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), iceReflectMat);
  iceReflect.rotation.x = -Math.PI / 2;
  iceReflect.position.y = -0.01;
  scene.add(iceReflect);

  // Subtle reflective gloss layer (reduced opacity to prevent washout)
  const reflectMat = new THREE.MeshStandardMaterial({
    color: 0xb7d4e6,
    metalness: 0.18,
    roughness: 0.46,
    transparent: true,
    opacity: 0.018
  });
  const reflect = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), reflectMat);
  reflect.rotation.x = -Math.PI / 2;
  reflect.position.y = 0.005;
  scene.add(reflect);

  // === BOARDS === (tinted slightly to not blow out white)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xb8c5d0,
    roughness: 0.48,
    metalness: 0.04
  });

  const topCapMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    roughness: 0.35,
    metalness: 0.4,
    emissive: 0xffcc00,
    emissiveIntensity: 0.12
  });

  const boards = [
    [0, -hh - 0.7, COLS + 1.5, 0.6, 0.35],
    [0,  hh + 0.7, COLS + 1.5, 0.6, 0.35],
    [-hw - 0.7, 0, 0.35, 0.6, ROWS + 1.5],
    [ hw + 0.7, 0, 0.35, 0.6, ROWS + 1.5]
  ];

  boards.forEach(([x, z, w, bh, d]) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(w, bh, d), boardMat);
    board.position.set(x, bh / 2, z);
    board.castShadow = true;
    board.receiveShadow = true;
    scene.add(board);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.08, d + 0.05), topCapMat);
    cap.position.set(x, bh + 0.04, z);
    scene.add(cap);
  });

  // === ICE LINES (bolder colors for contrast) ===
  const redMat = new THREE.MeshBasicMaterial({ color: 0xd7193f, side: THREE.DoubleSide });

  const blueMat = new THREE.MeshBasicMaterial({ color: 0x006fc9, side: THREE.DoubleSide });

  const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.22, ROWS), redMat);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.y = 0.016;
  scene.add(centerLine);

  [-hw * 0.38, hw * 0.38].forEach(x => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.22, ROWS), blueMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.016, 0);
    scene.add(line);
  });

  // Center circle
  const circle = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.38, 64), redMat);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 0.017;
  scene.add(circle);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 32),
    new THREE.MeshBasicMaterial({ color: 0xd7193f, side: THREE.DoubleSide })
  );
  dot.rotation.x = -Math.PI / 2;
  dot.position.y = 0.018;
  scene.add(dot);

  // Faceoff circles and defensive goal creases
  const creaseMat = new THREE.MeshStandardMaterial({
    color: 0x6ed7ff,
    emissive: 0x1e90ff,
    emissiveIntensity: 0.16,
    transparent: true,
    opacity: 0.58,
    roughness: 0.55
  });
  const faceoffXs = [-hw * 0.55, hw * 0.55];
  const faceoffZs = [-hh * 0.42, hh * 0.42];
  faceoffXs.forEach(x => {
    faceoffZs.forEach(z => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.82, 56), redMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.018, z);
      scene.add(ring);

      const faceDot = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), redMat);
      faceDot.rotation.x = -Math.PI / 2;
      faceDot.position.set(x, 0.019, z);
      scene.add(faceDot);
    });
  });

  [BASE_SAFE_X(-hw), BASE_SAFE_X(hw)].forEach(x => {
    const crease = new THREE.Mesh(new THREE.CircleGeometry(0.72, 36), creaseMat);
    crease.rotation.x = -Math.PI / 2;
    crease.position.set(x, 0.0185, 0);
    crease.scale.z = 0.62;
    scene.add(crease);
  });

  // Add visual elements
  addObstacleVisuals(hw, hh);
  addSpawnAndPenVisuals(hw, hh);
  buildCells(hw, hh);
  buildLights(hw, hh);

  // SC-2.6: Placement grid overlay
  buildPlacementGrid(scene, COLS, ROWS);
}

function BASE_SAFE_X(x) {
  return x < 0 ? x + 1.0 : x - 1.0;
}

function buildSoccerPitch() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const visuals = getVisualProfile(themeData);
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  // === ENHANCED GRASS FLOOR ===
  const grassTexture = getGrassTexture(visuals);
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(COLS / 8, ROWS / 8);
  grassTexture.anisotropy = getQualityTier().anisotropy;

  const grassMat = new THREE.MeshStandardMaterial({
    color: visuals.map.floor.meshColor,
    map: grassTexture,
    roughness: 0.88,
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
    emissiveIntensity: 0.12,
    roughness: 0.88
  });

  // Center line
  const midLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, ROWS + 0.5), lineMat);
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.y = 0.022;
  scene.add(midLine);

  // Center circle
  const center = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.48, 64), lineMat);
  center.rotation.x = -Math.PI / 2;
  center.position.y = 0.022;
  scene.add(center);

  // Center spot
  const spot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), lineMat);
  spot.rotation.x = -Math.PI / 2;
  spot.position.y = 0.023;
  scene.add(spot);

  // Boundary lines
  const boundaryPositions = [
    [0, -hh, COLS + 0.5, 0.13],
    [0,  hh, COLS + 0.5, 0.13],
    [-hw, 0, 0.13, ROWS + 0.5],
    [ hw, 0, 0.13, ROWS + 0.5]
  ];

  boundaryPositions.forEach(([x, z, lw, lh]) => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.022, z);
    scene.add(line);
  });

  // Goal boxes
  const boxW = Math.max(2.5, COLS * 0.2);
  const boxH = Math.max(2.2, ROWS * 0.3);

  [[-hw, 0], [hw, 0]].forEach(([baseX, z]) => {
    const side    = baseX < 0 ? 1 : -1;
    const centerX = baseX + (boxW / 2) * side;

    const topLine = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.13), lineMat);
    topLine.rotation.x = -Math.PI / 2;
    topLine.position.set(centerX, 0.022, z - boxH / 2);
    scene.add(topLine);

    const botLine = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.13), lineMat);
    botLine.rotation.x = -Math.PI / 2;
    botLine.position.set(centerX, 0.022, z + boxH / 2);
    scene.add(botLine);

    const endLine = new THREE.Mesh(new THREE.PlaneGeometry(0.13, boxH), lineMat);
    endLine.rotation.x = -Math.PI / 2;
    endLine.position.set(baseX + boxW * side, 0.022, z);
    scene.add(endLine);

    // Six-yard box, penalty spot, and bright goal mouth.
    const smallBoxW = Math.max(1.2, boxW * 0.42);
    const smallBoxH = Math.max(1.2, boxH * 0.42);
    const smallCenterX = baseX + (smallBoxW / 2) * side;
    [
      [smallCenterX, z - smallBoxH / 2, smallBoxW, 0.11],
      [smallCenterX, z + smallBoxH / 2, smallBoxW, 0.11],
      [baseX + smallBoxW * side, z, 0.11, smallBoxH]
    ].forEach(([lx, lz, lw, lh]) => {
      const smallLine = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), lineMat);
      smallLine.rotation.x = -Math.PI / 2;
      smallLine.position.set(lx, 0.024, lz);
      scene.add(smallLine);
    });

    const penaltySpot = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), lineMat);
    penaltySpot.rotation.x = -Math.PI / 2;
    penaltySpot.position.set(baseX + boxW * 0.65 * side, 0.025, z);
    scene.add(penaltySpot);

    const goalMouth = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, Math.max(1.5, ROWS * 0.18)),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    goalMouth.rotation.x = -Math.PI / 2;
    goalMouth.position.set(baseX + 0.08 * side, 0.026, z);
    scene.add(goalMouth);
  });

  // Add visual elements
  addObstacleVisuals(hw, hh);
  addSpawnAndPenVisuals(hw, hh);
  buildCells(hw, hh);
  buildLights(hw, hh);

  // SC-2.6: Placement grid overlay
  buildPlacementGrid(scene, COLS, ROWS);
}

function buildOrbitalPlatform() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const visuals = getVisualProfile(themeData);
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  const panelCanvas = document.createElement('canvas');
  panelCanvas.width = 512;
  panelCanvas.height = 512;
  const ctx = panelCanvas.getContext('2d');
  ctx.fillStyle = visuals.map.floor.base;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = visuals.map.floor.line;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    const p = i * 64;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 512);
    ctx.moveTo(0, p);
    ctx.lineTo(512, p);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.34)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 32; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.strokeRect(x, y, 22 + Math.random() * 50, 8 + Math.random() * 30);
  }

  const panelTexture = new THREE.CanvasTexture(panelCanvas);
  panelTexture.wrapS = THREE.RepeatWrapping;
  panelTexture.wrapT = THREE.RepeatWrapping;
  panelTexture.repeat.set(COLS / 6, ROWS / 6);
  panelTexture.anisotropy = getQualityTier().anisotropy;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS + 4, ROWS + 4),
    new THREE.MeshStandardMaterial({
      color: visuals.map.floor.meshColor,
      map: panelTexture,
      roughness: visuals.map.floor.roughness,
      metalness: visuals.map.floor.metalness,
      emissive: 0x130b2e,
      emissiveIntensity: 0.18
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.34,
    metalness: 0.75,
    emissive: visuals.map.path.emissive,
    emissiveIntensity: 0.18
  });
  [
    [0, -hh - 0.8, COLS + 1.8, 0.34],
    [0, hh + 0.8, COLS + 1.8, 0.34],
    [-hw - 0.8, 0, 0.34, ROWS + 1.8],
    [hw + 0.8, 0, 0.34, ROWS + 1.8]
  ].forEach(([x, z, w, d]) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, d), edgeMat);
    rail.position.set(x, 0.17, z);
    rail.castShadow = true;
    rail.receiveShadow = true;
    scene.add(rail);
  });

  addObstacleVisuals(hw, hh);
  addSpawnAndPenVisuals(hw, hh);
  buildCells(hw, hh);
  buildLights(hw, hh);

  // SC-2.6: Placement grid overlay
  buildPlacementGrid(scene, COLS, ROWS);
}

/**
 * Create floating ambient particles
 */
function createAmbientParticles(visuals) {
  const state = getState();
  const { scene, COLS, ROWS } = state;

  const particleCount = getQualityTier().ambientParticles;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);

  const color = new THREE.Color(visuals.lighting.accent);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * COLS * 1.5;
    positions[i * 3 + 1] = Math.random() * 8 + 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * ROWS * 1.5;

    const brightness = 0.4 + Math.random() * 0.6;
    colors[i * 3]     = color.r * brightness;
    colors[i * 3 + 1] = color.g * brightness;
    colors[i * 3 + 2] = color.b * brightness;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  ambientParticles = new THREE.Points(geometry, material);
  scene.add(ambientParticles);
}

/**
 * Update spotlight intensities with subtle flicker animation.
 * Call from the game loop each frame with accumulated time.
 * @param {number} time - Accumulated time in seconds
 */
export function updateLights(time) {
  for (let i = 0; i < sceneSpotlights.length; i++) {
    const spot = sceneSpotlights[i];
    const base = spotBaseIntensities[i];
    spot.intensity = base + Math.sin(time * 0.5 + i) * 0.01 * base;
  }
}

/**
 * Update ambient particles (call from animation loop)
 */
export function updateAmbientParticles(dt) {
  if (!ambientParticles) return;

  const positions = ambientParticles.geometry.attributes.position.array;
  const state = getState();

  ambientTime += dt;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += dt * 0.25;

    if (positions[i + 1] > 10) {
      positions[i + 1] = 0.5;
    }

    // Slight drift using accumulated time instead of Date.now()
    positions[i]     += Math.sin(ambientTime * 0.8 + i) * dt * 0.08;
    positions[i + 2] += Math.cos(ambientTime * 0.8 + i) * dt * 0.08;
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
  applyRendererQuality(renderer);
  resizePostProcessing(w, h);
}

/**
 * Clean up scene for game reset
 */
export function cleanupScene() {
  const state = getState();
  const { scene } = state;

  ambientParticles = null;
  sceneSpotlights = [];
  spotBaseIntensities = [];
  placementGrid = null;
  cleanupTrails();

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
