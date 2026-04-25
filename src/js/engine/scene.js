// Three.js scene setup with enhanced graphics
// Improved lighting, materials, and visual effects

import { getState, setThreeObjects, setCells, clearCells } from './state.js';
import { updateCamera, initCameraState } from './camera.js';
import { attachHandlers } from './input.js';
import { addObstacleVisuals } from '../rendering/obstacles.js';
import { addSpawnAndPenVisuals } from '../rendering/markers.js';
import { buildCells, buildLights, addPerimeterDecor } from '../rendering/environment.js';
import { getQualityTier, applyRendererQuality } from '../rendering/quality.js';
import { getVisualProfile } from '../config/visual-profiles.js';

// Store ambient particles for animation
let ambientParticles = null;
let ambientTime = 0;

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

  scene.fog = new THREE.FogExp2(visuals.map.fog || bgColor, visuals.map.fogDensity || 0.007);

  // Camera with good FOV
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
  const camDist = Math.max(COLS, ROWS) * 0.85;
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
  const spotColor   = visuals.lighting.sun;
  const spotIntensity = quality.spotLights ? (isHockey ? 22 : 18) : 0; // Reduced from 60/50 to prevent washout

  const spotPositions = [
    [-hw - 3, 9, -hh - 3],
    [-hw - 3, 9,  hh + 3],
    [ hw + 3, 9, -hh - 3],
    [ hw + 3, 9,  hh + 3]
  ];

  spotPositions.forEach(([x, y, z]) => {
    if (spotIntensity > 0) {
      const spot = new THREE.SpotLight(spotColor, spotIntensity, 40, Math.PI * 0.28, 0.35, 1.2);
      spot.position.set(x, y, z);
      spot.target.position.set(0, 0, 0);
      spot.castShadow = false; // No shadow from spots (perf)
      scene.add(spot);
      scene.add(spot.target);
    }

    // Subtle point light glow at fixture position (reduced intensity)
    if (quality.pointLights) {
      const pt = new THREE.PointLight(spotColor, isHockey ? 0.25 : 0.20, 12);
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
      const pt = new THREE.PointLight(accentColor, 0.15, 10);
      pt.position.set(x, y, z);
      scene.add(pt);
    }
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
  } else if (isSoccer) {
    buildSoccerPitch();
  } else {
    buildOrbitalPlatform();
  }

  // Add ambient particles
  createAmbientParticles(visuals);

  // Setup input handlers on canvas
  attachHandlers(canvas);
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

function buildHockeyRink() {
  const state = getState();
  const { scene, themeData, COLS, ROWS } = state;
  const visuals = getVisualProfile(themeData);
  const hw = COLS / 2;
  const hh = ROWS / 2;

  clearCells();

  // === ENHANCED ICE FLOOR ===
  const iceCanvas = document.createElement('canvas');
  iceCanvas.width = 512;
  iceCanvas.height = 512;
  const ctx = iceCanvas.getContext('2d');

  // Base ice color – slightly more blue to retain color identity
  ctx.fillStyle = visuals.map.floor.base;
  ctx.fillRect(0, 0, 512, 512);

  const iceGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 390);
  iceGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
  iceGrad.addColorStop(0.55, 'rgba(110,190,225,0.08)');
  iceGrad.addColorStop(1, 'rgba(20,80,120,0.18)');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle snow-groomed directional lines
  ctx.strokeStyle = visuals.map.floor.line;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 48; i++) {
    const y = i * 11;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Subtle cross scratches
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

  // Sparkle specular highlights (reduced brightness)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = 0; i < 120; i++) {
    const r = Math.random() * 1.8 + 0.3;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const iceTexture = new THREE.CanvasTexture(iceCanvas);
  iceTexture.wrapS = THREE.RepeatWrapping;
  iceTexture.wrapT = THREE.RepeatWrapping;
  iceTexture.repeat.set(COLS / 4, ROWS / 4);
  iceTexture.anisotropy = getQualityTier().anisotropy;

  const iceMat = new THREE.MeshStandardMaterial({
    color: visuals.map.floor.meshColor,
    map: iceTexture,
    metalness: 0.12,
    roughness: 0.12,
    envMapIntensity: 0.75
  });

  const ice = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), iceMat);
  ice.rotation.x = -Math.PI / 2;
  ice.receiveShadow = true;
  scene.add(ice);

  // Subtle reflective gloss layer (reduced opacity to prevent washout)
  const reflectMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeff,
    metalness: 0.85,
    roughness: 0.15,
    transparent: true,
    opacity: 0.095
  });
  const reflect = new THREE.Mesh(new THREE.PlaneGeometry(COLS + 2, ROWS + 2), reflectMat);
  reflect.rotation.x = -Math.PI / 2;
  reflect.position.y = 0.005;
  scene.add(reflect);

  // === BOARDS === (tinted slightly to not blow out white)
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xd8dfe8,
    roughness: 0.35,
    metalness: 0.08
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
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xdd1111,
    emissive: 0xdd1111,
    emissiveIntensity: 0.25,
    roughness: 0.70
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x1166dd,
    emissive: 0x0055cc,
    emissiveIntensity: 0.20,
    roughness: 0.70
  });

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
    new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0xcc0000, emissiveIntensity: 0.25 })
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
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = 512;
  grassCanvas.height = 512;
  const ctx = grassCanvas.getContext('2d');

  // Alternating mow stripes (richer, more saturated greens)
  const stripH = 512 / 12;
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? visuals.map.floor.alt : visuals.map.floor.base;
    ctx.fillRect(0, i * stripH, 512, stripH);
  }

  // Faint lengthwise mowing variation to avoid flat green wash.
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
    ctx.fillRect(i * 64, 0, 64, 512);
  }

  // Grass blade texture noise
  for (let i = 0; i < 2400; i++) {
    const alpha = 0.06 + Math.random() * 0.06;
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(0,70,20,${alpha})`
      : visuals.map.floor.blade;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random(), 3 + Math.random() * 3);
  }

  const grassTexture = new THREE.CanvasTexture(grassCanvas);
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
