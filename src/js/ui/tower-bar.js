// Tower bar selection logic
// Most tower bar functionality is in hud.js
// This file can be extended for additional tower bar features

import { getState, setSelectedTower, setSellMode } from '../engine/state.js';
import { renderTowers } from './hud.js';
import { hideUpgrade } from './upgrade-sheet.js';

export function selectTowerType(towerId) {
  const state = getState();
  const { themeData, money, selectedTower } = state;

  const td = themeData.towers.find(t => t.id === towerId);
  if (!td || money < td.cost) return;

  setSelectedTower(selectedTower === towerId ? null : towerId);
  setSellMode(false);
  document.getElementById('sellBtn').classList.remove('active');
  hideUpgrade();
  renderTowers();
}

export function clearTowerSelection() {
  setSelectedTower(null);
  renderTowers();
}
