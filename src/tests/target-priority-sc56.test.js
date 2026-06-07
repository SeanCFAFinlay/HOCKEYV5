import { beforeEach, describe, expect, it, vi } from 'vitest';

let selectedTower;
const emit = vi.fn();

vi.mock('../js/engine/state.js', () => ({
  getState: () => ({ selectedPlaced: selectedTower }),
  setSelectedPlaced: vi.fn(),
  dispatch: vi.fn(),
  ActionTypes: { ADD_MONEY: 'ADD_MONEY' },
  addMoney: vi.fn(),
  removeTower: vi.fn()
}));

vi.mock('../js/engine/events.js', () => ({
  emit,
  GameEvents: { UI_UPDATE: 'ui:update', TOWER_UPGRADE: 'tower:upgrade', TOWER_SELL: 'tower:sell' }
}));

vi.mock('../js/engine/audio.js', () => ({
  playSound: vi.fn(),
  playSoundAt: vi.fn()
}));

vi.mock('../js/systems/pathfinding.js', () => ({
  onNavChanged: vi.fn()
}));

vi.mock('../js/rendering/tower-meshes.js', () => ({
  createTowerMesh: vi.fn(() => ({ type: 'towerMesh' })),
  updateTowerRangeGeometry: vi.fn()
}));

vi.mock('../js/ui/hud.js', () => ({
  updateHUD: vi.fn()
}));

vi.mock('../js/systems/particles.js', () => ({
  createImpact: vi.fn(),
  createExplosion: vi.fn()
}));

vi.mock('../js/ui/upgrade-path.js', () => ({
  renderUpgradePath: vi.fn(),
  applyMaxLevelState: vi.fn(),
  animateStat: vi.fn()
}));

vi.stubGlobal('document', {
  getElementById: vi.fn(() => null)
});

describe('SC-5.6 — tower targeting priority controls', () => {
  beforeEach(() => {
    selectedTower = { priority: 'first' };
    emit.mockClear();
  });

  it('sets the selected tower priority from upgrade-sheet UI', async () => {
    const { setTowerPriorityFromUI } = await import('../js/ui/upgrade-sheet.js');

    setTowerPriorityFromUI('strong');

    expect(selectedTower.priority).toBe('strong');
    expect(emit).toHaveBeenCalledWith('ui:update', {
      kind: 'tower-priority',
      tower: selectedTower,
      priority: 'strong'
    });
  });

  it('ignores invalid priority values', async () => {
    const { setTowerPriorityFromUI } = await import('../js/ui/upgrade-sheet.js');

    setTowerPriorityFromUI('not-a-priority');

    expect(selectedTower.priority).toBe('first');
    expect(emit).not.toHaveBeenCalled();
  });
});
