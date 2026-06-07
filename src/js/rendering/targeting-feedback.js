import { getState } from '../engine/state.js';
import { hideAllTowerRanges, setTowerRangeVisible } from './tower-meshes.js';

let feedbackScene = null;
let targetLine = null;
let targetRing = null;
let selectedTowerRef = null;

function resetFeedbackObjects() {
  if (feedbackScene) {
    if (targetLine) feedbackScene.remove(targetLine);
    if (targetRing) feedbackScene.remove(targetRing);
  }
  targetLine = null;
  targetRing = null;
  feedbackScene = null;
}

function ensureFeedbackObjects(scene) {
  if (!scene) return false;

  if (feedbackScene && feedbackScene !== scene) {
    resetFeedbackObjects();
  }

  feedbackScene = scene;

  if (!targetLine) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
    targetLine = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.68
      })
    );
    targetLine.visible = false;
    targetLine.renderOrder = 1000;
    scene.add(targetLine);
  }

  if (!targetRing) {
    targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.44, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide
      })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.045;
    targetRing.visible = false;
    targetRing.renderOrder = 1000;
    scene.add(targetRing);
  }

  return true;
}

function setFeedbackColor(color) {
  if (targetLine?.material?.color?.set) targetLine.material.color.set(color);
  if (targetRing?.material?.color?.set) targetRing.material.color.set(color);
}

function setLinePositions(start, end) {
  const attr = targetLine?.geometry?.attributes?.position;
  if (!attr?.array) return;

  attr.array[0] = start.x;
  attr.array[1] = start.y;
  attr.array[2] = start.z;
  attr.array[3] = end.x;
  attr.array[4] = end.y;
  attr.array[5] = end.z;
  attr.needsUpdate = true;
}

function getTowerAccent(tower, themeData) {
  const towerDef = themeData?.towers?.find(t => t.id === tower?.type);
  return towerDef?.clr || '#ffffff';
}

function hideTargetMarker() {
  if (targetLine) targetLine.visible = false;
  if (targetRing) targetRing.visible = false;
}

export function updateTargetingFeedback() {
  const state = getState();
  const { scene, selectedPlaced, towers, enemies, COLS, ROWS, themeData } = state;

  if (!selectedPlaced && !selectedTowerRef && !targetLine && !targetRing) return;
  if (!ensureFeedbackObjects(scene)) return;

  if (selectedTowerRef !== selectedPlaced) {
    hideAllTowerRanges(towers);
    selectedTowerRef = selectedPlaced || null;
  }

  if (!selectedPlaced) {
    hideTargetMarker();
    return;
  }

  setTowerRangeVisible(selectedPlaced, true);
  setFeedbackColor(getTowerAccent(selectedPlaced, themeData));

  const target = selectedPlaced.currentTarget;
  if (!target || !enemies.includes(target)) {
    hideTargetMarker();
    return;
  }

  const hw = COLS / 2;
  const hh = ROWS / 2;
  const start = {
    x: selectedPlaced.x - hw + 0.5,
    y: 0.62,
    z: selectedPlaced.y - hh + 0.5
  };
  const end = {
    x: target.x,
    y: (target.y ?? (target.flying ? 1.2 : 0.2)) + 0.22,
    z: target.z
  };

  setLinePositions(start, end);
  targetLine.visible = true;

  targetRing.position.x = target.x;
  targetRing.position.z = target.z;
  targetRing.scale.setScalar(Math.max(0.8, target.sz || 1));
  targetRing.visible = true;
}

export function clearTargetingFeedback() {
  hideAllTowerRanges(getState().towers || []);
  selectedTowerRef = null;
  hideTargetMarker();
}
