// Tests for SC-4.3: Upgrade Path Visualization
// TDD Red phase — describes expected behavior

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal DOM stubs ─────────────────────────────────────────────────────────

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    _set: set,
    add(...c) { c.forEach(x => set.add(x)); },
    remove(...c) { c.forEach(x => set.delete(x)); },
    contains(c) { return set.has(c); },
    toggle(c, force) {
      const val = force !== undefined ? force : !set.has(c);
      val ? set.add(c) : set.delete(c);
    }
  };
}

function makeEl(id, textContent = '') {
  const children = [];
  const style = {};
  const cl = makeClassList();

  const el = {
    id,
    textContent,
    style,
    classList: cl,
    _children: children,
    innerHTML: '',
    appendChild(child) { children.push(child); return child; },
    querySelectorAll(sel) { return queryAll(el, sel); },
    querySelector(sel) { return queryAll(el, sel)[0] || null; },
  };
  return el;
}

// Simple flat querySelectorAll supporting class and tag selectors
function queryAll(root, sel) {
  const results = [];
  function walk(node) {
    if (!node || !node._children) return;
    for (const child of node._children) {
      const matches = matchesSelector(child, sel);
      if (matches) results.push(child);
      walk(child);
    }
  }
  walk(root);
  return results;
}

function matchesSelector(el, sel) {
  if (sel.startsWith('.')) {
    return el.classList && el.classList.contains(sel.slice(1));
  }
  return false;
}

// DOM element registry
let domElements = {};

function resetDOM() {
  domElements = {};

  const upgradeSheet = makeEl('upgradeSheet');
  const upgradePath = makeEl('upgradePath');
  const upBtn = makeEl('upBtn');
  upBtn.disabled = false;

  domElements = { upgradeSheet, upgradePath, upBtn };
}

// Override getElementById used by the module
vi.stubGlobal('document', {
  getElementById: (id) => domElements[id] || null,
  createElement: (tag) => {
    const el = makeEl('', '');
    el._tag = tag;
    el._children = [];
    el.style = {};
    el.classList = makeClassList();
    el.appendChild = (child) => { el._children.push(child); return child; };
    el.querySelectorAll = (sel) => queryAll(el, sel);
    el.querySelector = (sel) => queryAll(el, sel)[0] || null;
    return el;
  }
});

// ── Mock tower data ───────────────────────────────────────────────────────────

const mockTowerDef = {
  id: 't1',
  nm: 'Slap Shot',
  icon: '🏒',
  role: 'ANTI-SWARM',
  cost: 80,
  clr: '#00d4ff',
  dmg: [25, 40, 60, 90],
  rng: [2.8, 3.2, 3.6, 4.1],
  rate: [1.2, 1.4, 1.7, 2.0],
  up: [60, 100, 170],
};

// ── Tests for renderUpgradePath ───────────────────────────────────────────────

describe('renderUpgradePath', () => {
  beforeEach(() => {
    resetDOM();
  });

  it('renders 4 nodes and 3 connectors into #upgradePath', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 0);

    const container = domElements.upgradePath;
    const nodes = container.querySelectorAll('.upgrade-node');
    const connectors = container.querySelectorAll('.upgrade-connector');

    expect(nodes).toHaveLength(4);
    expect(connectors).toHaveLength(3);
  });

  it('marks level 0 as current, levels 1-3 as future', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 0);

    const container = domElements.upgradePath;
    const nodes = container.querySelectorAll('.upgrade-node');

    expect(nodes[0].classList.contains('current')).toBe(true);
    expect(nodes[1].classList.contains('current')).toBe(false);
    expect(nodes[2].classList.contains('current')).toBe(false);
    expect(nodes[3].classList.contains('current')).toBe(false);
  });

  it('marks levels below current as completed', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 2);

    const container = domElements.upgradePath;
    const nodes = container.querySelectorAll('.upgrade-node');

    expect(nodes[0].classList.contains('completed')).toBe(true);
    expect(nodes[1].classList.contains('completed')).toBe(true);
    expect(nodes[2].classList.contains('current')).toBe(true);
    expect(nodes[3].classList.contains('current')).toBe(false);
    expect(nodes[3].classList.contains('completed')).toBe(false);
  });

  it('fills connectors up to current level', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 2);

    const container = domElements.upgradePath;
    const connectors = container.querySelectorAll('.upgrade-connector');

    expect(connectors[0].classList.contains('filled')).toBe(true);
    expect(connectors[1].classList.contains('filled')).toBe(true);
    expect(connectors[2].classList.contains('filled')).toBe(false);
  });

  it('shows damage value in each node label', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 1);

    const container = domElements.upgradePath;
    const labels = container.querySelectorAll('.upgrade-node-label');

    expect(labels[0].textContent).toBe('25');
    expect(labels[1].textContent).toBe('40');
    expect(labels[2].textContent).toBe('60');
    expect(labels[3].textContent).toBe('90');
  });

  it('shows MAX marker on last node at max level', async () => {
    const { renderUpgradePath } = await import('../js/ui/upgrade-path.js');
    renderUpgradePath(mockTowerDef, 3);

    const container = domElements.upgradePath;
    const nodes = container.querySelectorAll('.upgrade-node');
    expect(nodes[3].querySelector('.upgrade-node-max')).not.toBeNull();
  });
});

// ── Tests for applyMaxLevelState ──────────────────────────────────────────────

describe('applyMaxLevelState', () => {
  beforeEach(() => {
    resetDOM();
  });

  it('hides upgrade button when at max level', async () => {
    const { applyMaxLevelState } = await import('../js/ui/upgrade-path.js');
    applyMaxLevelState(true);

    const btn = domElements.upBtn;
    expect(btn.style.display).toBe('none');
  });

  it('adds max-level class to upgradeSheet when at max level', async () => {
    const { applyMaxLevelState } = await import('../js/ui/upgrade-path.js');
    applyMaxLevelState(true);

    const sheet = domElements.upgradeSheet;
    expect(sheet.classList.contains('max-level')).toBe(true);
  });

  it('restores upgrade button when not at max level', async () => {
    const { applyMaxLevelState } = await import('../js/ui/upgrade-path.js');
    applyMaxLevelState(true);
    applyMaxLevelState(false);

    const btn = domElements.upBtn;
    expect(btn.style.display).toBe('');
  });

  it('removes max-level class when not at max level', async () => {
    const { applyMaxLevelState } = await import('../js/ui/upgrade-path.js');
    applyMaxLevelState(true);
    applyMaxLevelState(false);

    const sheet = domElements.upgradeSheet;
    expect(sheet.classList.contains('max-level')).toBe(false);
  });
});

// ── Tests for animateStat ─────────────────────────────────────────────────────

describe('animateStat', () => {
  let rafCallback = null;

  beforeEach(() => {
    resetDOM();
    rafCallback = null;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      rafCallback = cb;
      return 1;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('animates a numeric stat from oldValue to newValue', async () => {
    const { animateStat } = await import('../js/ui/upgrade-path.js');

    const el = makeEl('upDmg', '25');
    animateStat(el, 25, 40, 300);

    // First frame sets startTime=0
    rafCallback(0);
    // Mid-animation at 150ms
    rafCallback(150);
    const midVal = parseFloat(el.textContent);
    expect(midVal).toBeGreaterThan(25);
    expect(midVal).toBeLessThan(40);

    // End of animation (past duration)
    rafCallback(9999);
    expect(el.textContent).toBe('40');
  });

  it('snaps to final value when time exceeds duration', async () => {
    const { animateStat } = await import('../js/ui/upgrade-path.js');

    const el = makeEl('upDmg', '25');
    animateStat(el, 25, 40, 300);
    // Init startTime=0, then jump past duration
    rafCallback(0);
    rafCallback(9999);
    expect(el.textContent).toBe('40');
  });

  it('works with decimal values, rounding to 2 decimal places', async () => {
    const { animateStat } = await import('../js/ui/upgrade-path.js');

    const el = makeEl('upRng', '2.8');
    animateStat(el, 2.8, 3.2, 300, 2);

    rafCallback(0);
    rafCallback(9999);
    expect(el.textContent).toBe('3.20');
  });
});
