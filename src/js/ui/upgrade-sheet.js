// Upgrade panel logic

import { getState, setSelectedPlaced, dispatch, ActionTypes, addMoney, removeTower } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { onNavChanged } from '../systems/pathfinding.js';
import { createTowerMesh } from '../rendering/tower-meshes.js';
import { updateHUD } from './hud.js';
import { createImpact, createExplosion } from '../systems/particles.js';

// Tower role descriptions for upgrade sheet
const ROLE_DESCRIPTIONS = {
  'ANTI-SWARM': 'Fast Attack',
  'SNIPER': 'Long Range',
  'SPLASH': 'Area Damage',
  'CROWD_CONTROL': 'Slows Enemies',
  'CHOKEPOINT': 'High Damage',
  'CHAIN': 'Multi-Target',
  'DOT': 'Burn Damage',
  'BOSS_KILLER': 'Boss Killer'
};

export function showUpgrade(tower) {
  const state = getState();
  const { themeData } = state;

  setSelectedPlaced(tower);
  const td = themeData.towers.find(t => t.id === tower.type);

  document.getElementById('upIcon').textContent = td.icon;
  document.getElementById('upName').textContent = td.nm;
  document.getElementById('upLevel').textContent = `Level ${tower.lv + 1} • Visual tier ${tower.lv + 1}/4`;
  document.getElementById('upRole').textContent = ROLE_DESCRIPTIONS[td.role] || td.role || '';
  document.getElementById('upDmg').textContent = td.dmg[tower.lv];
  document.getElementById('upRng').textContent = td.rng[tower.lv].toFixed(1);
  document.getElementById('upRate').textContent = td.rate[tower.lv].toFixed(2);

  let sellVal = Math.floor(td.cost * 0.6);
  for (let i = 0; i < tower.lv; i++) {
    sellVal += Math.floor(td.up[i] * 0.6);
  }
  document.getElementById('upSell').textContent = sellVal;

  if (tower.lv >= 3) {
    document.getElementById('upDmgNext').textContent = 'MAX';
    document.getElementById('upRngNext').textContent = 'MAX';
    document.getElementById('upRateNext').textContent = 'MAX';
    document.getElementById('upBtn').disabled = true;
    document.getElementById('upBtn').classList.toggle('available', false);
    document.getElementById('upCost').textContent = '---';
  } else {
    document.getElementById('upDmgNext').textContent = '→' + td.dmg[tower.lv + 1];
    document.getElementById('upRngNext').textContent = '→' + td.rng[tower.lv + 1].toFixed(1);
    document.getElementById('upRateNext').textContent = '→' + td.rate[tower.lv + 1].toFixed(2);
    document.getElementById('upCost').textContent = td.up[tower.lv];
    const canUpgrade = state.money >= td.up[tower.lv];
    document.getElementById('upBtn').disabled = !canUpgrade;
    document.getElementById('upBtn').classList.toggle('available', canUpgrade);
  }

  document.getElementById('upgradeSheet').classList.add('show');
}

export function hideUpgrade() {
  document.getElementById('upgradeSheet').classList.remove('show');
  setSelectedPlaced(null);
}

export function doUpgrade() {
  const state = getState();
  const { selectedPlaced, themeData, scene } = state;

  if (!selectedPlaced || selectedPlaced.lv >= 3) return;

  const td = themeData.towers.find(t => t.id === selectedPlaced.type);
  const upgradeCost = td.up[selectedPlaced.lv];
  if (state.money < upgradeCost) return;

  dispatch(ActionTypes.ADD_MONEY, -upgradeCost); // Use dispatch so subscribers fire
  selectedPlaced.lv++;
  selectedPlaced.hp = (selectedPlaced.hp || 160) + 60;
  selectedPlaced.dmg = td.dmg[selectedPlaced.lv];
  selectedPlaced.rng = td.rng[selectedPlaced.lv];
  selectedPlaced.rate = td.rate[selectedPlaced.lv];

  if (td.splash) selectedPlaced.splash = td.splash[selectedPlaced.lv];
  if (td.slowDur) selectedPlaced.slowDur = td.slowDur[selectedPlaced.lv];
  if (td.chain) selectedPlaced.chain = td.chain[selectedPlaced.lv];
  if (td.burn) selectedPlaced.burn = td.burn[selectedPlaced.lv];

  // Update range indicator - dispose old geometry to prevent memory leak
  if (selectedPlaced.rangeMesh) {
    if (selectedPlaced.rangeMesh.geometry) {
      selectedPlaced.rangeMesh.geometry.dispose();
    }
    selectedPlaced.rangeMesh.geometry = new THREE.RingGeometry(selectedPlaced.rng - 0.08, selectedPlaced.rng, 64);
  }

  // Rebuild mesh
  if (selectedPlaced.mesh) {
    scene.remove(selectedPlaced.mesh);
  }
  selectedPlaced.mesh = createTowerMesh(selectedPlaced);

  const hw = state.COLS / 2;
  const hh = state.ROWS / 2;
  const wx = selectedPlaced.x - hw + 0.5;
  const wz = selectedPlaced.y - hh + 0.5;
  createImpact(wx, 0.45, wz, parseInt(td.clr.replace('#', '0x'), 16));
  createExplosion(wx, 0.45, wz, false, parseInt(td.clr.replace('#', '0x'), 16));

  emit(GameEvents.TOWER_UPGRADE, { tower: selectedPlaced });
  updateHUD();
  showUpgrade(selectedPlaced);
}

export function sellTower() {
  const state = getState();
  const { selectedPlaced, themeData, grid, scene } = state;

  if (!selectedPlaced) return;

  const td = themeData.towers.find(t => t.id === selectedPlaced.type);
  let val = Math.floor(td.cost * 0.6);
  for (let i = 0; i < selectedPlaced.lv; i++) {
    val += Math.floor(td.up[i] * 0.6);
  }

  addMoney(val); // Use addMoney so money subscribers and events fire properly

  if (selectedPlaced.mesh) {
    scene.remove(selectedPlaced.mesh); // Also removes rangeMesh (it's a child of the group)
  }

  const cell = grid[selectedPlaced.y][selectedPlaced.x];
  if (cell) cell.tower = null;

  removeTower(selectedPlaced); // Use removeTower dispatch so REMOVE_TOWER events fire

  emit(GameEvents.TOWER_SELL, { tower: selectedPlaced, value: val });

  onNavChanged();
  hideUpgrade();
  updateHUD();
}

// Expose to window for HTML onclick handlers
window.doUpgrade = doUpgrade;
window.sellTower = sellTower;
