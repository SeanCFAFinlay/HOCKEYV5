// Upgrade panel logic

import { describePower } from '../config/powers.js';
import { getState, setSelectedPlaced, dispatch, ActionTypes, addMoney, removeTower } from '../engine/state.js';
import { emit, GameEvents } from '../engine/events.js';
import { playSound, playSoundAt } from '../engine/audio.js';
import { onNavChanged } from '../systems/pathfinding.js';
import { createTowerMesh, updateTowerRangeGeometry } from '../rendering/tower-meshes.js';
import { updateHUD } from './hud.js';
import { createImpact, createExplosion } from '../systems/particles.js';
import { renderUpgradePath, applyMaxLevelState, animateStat } from './upgrade-path.js';
import { icon } from './icons.js';
import { worldToScreen } from './currency-fly.js';
import { buzz } from './mobile.js';

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

const PRIORITY_OPTIONS = [
  { value: 'first', label: 'First' },
  { value: 'strong', label: 'Strong' },
  { value: 'close', label: 'Close' },
  { value: 'weak', label: 'Weak' },
  { value: 'last', label: 'Last' }
];

/** The power line: what the tower does now, and what the next level changes. */
function renderPower(td, lv) {
  const el = document.getElementById('upPower');
  if (!el) return;
  const now = describePower(td, lv);
  if (!now) { el.innerHTML = ''; return; }
  const next = lv < 3 ? describePower(td, lv + 1) : null;
  el.innerHTML =
    `<strong>${now.name}</strong><span>${now.text}</span>` +
    (next && next.text !== now.text ? `<small>Next level: ${next.text}</small>` : '');
}

/** Highest level-4 value of a stat across the world's towers, for bar scale. */
function statCeiling(towers, key) {
  let max = 0;
  for (const t of towers) {
    const arr = t[key];
    if (!arr) continue;
    const v = arr[3] ?? arr[arr.length - 1];
    if (v > max) max = v;
  }
  return max || 1;
}

const STAT_FORMAT = {
  dmg: v => String(Math.round(v)),
  rng: v => v.toFixed(1),
  rate: v => v.toFixed(2)
};

const STAT_IDS = { dmg: ['upDmg', 'upDmgNext'], rng: ['upRng', 'upRngNext'], rate: ['upRate', 'upRateNext'] };

/** One stat row: number, delta to the next level, and the bar. */
function renderStat(key, td, lv, towers) {
  const fmt = STAT_FORMAT[key];
  const now = td[key][lv];
  const next = lv < 3 ? td[key][lv + 1] : null;
  const valueEl = document.getElementById(STAT_IDS[key][0]);
  const nextEl = document.getElementById(STAT_IDS[key][1]);
  if (valueEl) valueEl.textContent = fmt(now);
  if (nextEl) nextEl.textContent = next == null ? 'MAX' : (next > now ? '+' + fmt(next - now) : '');
  const row = typeof document.querySelector === 'function'
    ? document.querySelector(`.upgrade-stat[data-stat="${key}"]`) : null;
  if (!row) return;
  row.classList.toggle('improving', next != null && next > now);
  const ceiling = statCeiling(towers, key);
  const nowBar = row.querySelector('.now');
  const gainBar = row.querySelector('.gain');
  // Square-root scale: a sniper's damage or a fast tower's range still shows
  // as a real bar next to the line-up's biggest hitter.
  const scale = v => Math.min(100, Math.sqrt(Math.max(0, v) / ceiling) * 100);
  const nowPct = scale(now);
  const gainPct = next == null ? 0 : Math.max(0, scale(next) - nowPct);
  if (nowBar) nowBar.style.width = nowPct + '%';
  if (gainBar) { gainBar.style.left = nowPct + '%'; gainBar.style.width = gainPct + '%'; }
}

function upgradeLabel(lv, cost, money) {
  return money >= cost ? `Upgrade to Lv ${lv + 2}` : `Need $${cost - Math.floor(money)} more`;
}

export function showUpgrade(tower) {
  const state = getState();
  const { themeData } = state;

  setSelectedPlaced(tower);
  const td = themeData.towers.find(t => t.id === tower.type);
  const sheet = document.getElementById('upgradeSheet');
  const maxed = tower.lv >= 3;

  if (sheet && sheet.style && typeof sheet.style.setProperty === 'function') {
    sheet.style.setProperty('--tc', td.clr || '#38bdf8');
  }
  document.getElementById('upIcon').innerHTML = icon(td.icon);
  document.getElementById('upName').textContent = td.nm;
  document.getElementById('upLevel').textContent = maxed ? 'Max level' : `Level ${tower.lv + 1} of 4`;
  document.getElementById('upRole').textContent = ROLE_DESCRIPTIONS[td.role] || td.role || '';

  for (const key of ['dmg', 'rng', 'rate']) renderStat(key, td, tower.lv, themeData.towers);

  const rate = state.sellRate || 0.6;   // raised by the Trade-in upgrade
  let sellVal = Math.floor(td.cost * rate);
  for (let i = 0; i < tower.lv; i++) {
    sellVal += Math.floor(td.up[i] * rate);
  }
  document.getElementById('upSell').textContent = sellVal;

  const btn = document.getElementById('upBtn');
  const label = document.getElementById('upBtnLabel');
  if (maxed) {
    btn.disabled = true;
    btn.classList.toggle('available', false);
    document.getElementById('upCost').textContent = '---';
  } else {
    const cost = td.up[tower.lv];
    document.getElementById('upCost').textContent = cost;
    const canUpgrade = state.money >= cost;
    btn.disabled = !canUpgrade;
    btn.classList.toggle('available', canUpgrade);
    if (label) label.textContent = upgradeLabel(tower.lv, cost, state.money);
  }

  renderPower(td, tower.lv);
  renderUpgradePath(td, tower.lv);
  applyMaxLevelState(maxed);
  renderPriorityControls(tower);

  sheet.classList.add('show');
}

/** Keep the Upgrade button honest as money changes while the sheet is open. */
export function refreshUpgradeAffordability() {
  const state = getState();
  const tower = state.selectedPlaced;
  const sheet = document.getElementById('upgradeSheet');
  if (!tower || !sheet || !sheet.classList.contains('show') || tower.lv >= 3) return;
  const td = state.themeData?.towers.find(t => t.id === tower.type);
  if (!td) return;
  const cost = td.up[tower.lv];
  const can = state.money >= cost;
  const btn = document.getElementById('upBtn');
  const label = document.getElementById('upBtnLabel');
  if (!btn) return;
  btn.disabled = !can;
  btn.classList.toggle('available', can);
  if (label) label.textContent = upgradeLabel(tower.lv, cost, state.money);
}

/** "LEVEL 3" rising off the tower, plus a flash across the sheet. */
function celebrateLevel(tower, td) {
  const sheet = document.getElementById('upgradeSheet');
  if (sheet) {
    sheet.classList.remove('leveled');
    void sheet.offsetWidth; // restart the animation
    sheet.classList.add('leveled');
    clearTimeout(sheet._lvTimer);
    sheet._lvTimer = setTimeout(() => sheet.classList.remove('leveled'), 900);
  }
  try {
    const state = getState();
    const canvas = state.renderer && state.renderer.domElement;
    if (!canvas || !state.camera || !document.body) return;
    const hw = state.COLS / 2, hh = state.ROWS / 2;
    const p = worldToScreen(tower.x - hw + 0.5, 1.4, tower.y - hh + 0.5, state.camera, canvas);
    const pop = document.createElement('div');
    pop.className = 'level-pop' + (tower.lv >= 3 ? ' max' : '');
    pop.style.left = p.x + 'px';
    pop.style.top = p.y + 'px';
    pop.style.setProperty('--tc', td.clr || '#ffd700');
    pop.innerHTML = tower.lv >= 3 ? '<b>MAX</b><span>LEVEL</span>' : `<span>LEVEL</span><b>${tower.lv + 1}</b>`;
    document.body.appendChild(pop);
    setTimeout(() => { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 1300);
  } catch (e) { /* cosmetic only */ }
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

  const prevLv = selectedPlaced.lv;
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
    updateTowerRangeGeometry(selectedPlaced);
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

  playSound('upgrade');
  buzz('upgrade');
  emit(GameEvents.TOWER_UPGRADE, { tower: selectedPlaced });
  updateHUD();
  showUpgrade(selectedPlaced);
  celebrateLevel(selectedPlaced, td);

  // Animate stat counters from old → new values
  animateStat(document.getElementById('upDmg'), td.dmg[prevLv], td.dmg[selectedPlaced.lv], 450);
  animateStat(document.getElementById('upRng'), td.rng[prevLv], td.rng[selectedPlaced.lv], 450, 1);
  animateStat(document.getElementById('upRate'), td.rate[prevLv], td.rate[selectedPlaced.lv], 450, 2);
}

function getPriorityLabel(priority) {
  return PRIORITY_OPTIONS.find(option => option.value === priority)?.label || 'First';
}

function renderPriorityControls(tower) {
  const controls = document.getElementById('priorityControls');
  const label = document.getElementById('upPriorityLabel');
  if (!controls || !tower) return;

  const current = tower.priority || 'first';
  if (label) label.textContent = getPriorityLabel(current);

  controls.innerHTML = PRIORITY_OPTIONS.map(option => `
    <button
      type="button"
      class="priority-btn${option.value === current ? ' active' : ''}"
      data-priority="${option.value}"
    >${option.label}</button>
  `).join('');

  controls.querySelectorAll('.priority-btn').forEach(btn => {
    btn.onclick = () => setTowerPriorityFromUI(btn.dataset.priority);
  });
}

export function setTowerPriorityFromUI(priority) {
  const option = PRIORITY_OPTIONS.find(item => item.value === priority);
  const tower = getState().selectedPlaced;
  if (!option || !tower) return;

  tower.priority = option.value;
  renderPriorityControls(tower);
  emit(GameEvents.UI_UPDATE, {
    kind: 'tower-priority',
    tower,
    priority: option.value
  });
}

export function sellTower() {
  const state = getState();
  const { selectedPlaced, themeData, grid, scene } = state;

  if (!selectedPlaced) return;

  const td = themeData.towers.find(t => t.id === selectedPlaced.type);
  const rate = state.sellRate || 0.6;
  let val = Math.floor(td.cost * rate);
  for (let i = 0; i < selectedPlaced.lv; i++) {
    val += Math.floor(td.up[i] * rate);
  }

  addMoney(val); // Use addMoney so money subscribers and events fire properly

  if (selectedPlaced.mesh) {
    scene.remove(selectedPlaced.mesh); // Also removes rangeMesh (it's a child of the group)
  }

  const cell = grid[selectedPlaced.y][selectedPlaced.x];
  if (cell) cell.tower = null;

  removeTower(selectedPlaced); // Use removeTower dispatch so REMOVE_TOWER events fire

  emit(GameEvents.TOWER_SELL, { tower: selectedPlaced, value: val });
  {
    const state2 = getState();
    const hw = state2.COLS / 2;
    const hh = state2.ROWS / 2;
    buzz('sell');
    playSoundAt('towerSell', selectedPlaced.x - hw + 0.5, selectedPlaced.y - hh + 0.5);
  }

  onNavChanged();
  hideUpgrade();
  updateHUD();
}

// window.doUpgrade and window.sellTower exposed in main.js
