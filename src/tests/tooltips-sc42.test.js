// Tests for SC-4.2: Tower Info Tooltips
// TDD: Red → Green → Refactor

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal DOM stubs ──────────────────────────────────────────────────────

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    _set: set,
    add(...c) { c.forEach(x => set.add(x)); },
    remove(...c) { c.forEach(x => set.delete(x)); },
    contains(c) { return set.has(c); },
    has(c) { return set.has(c); },
    toggle(c, force) {
      const val = force !== undefined ? force : !set.has(c);
      val ? set.add(c) : set.delete(c);
    }
  };
}

function makeElement(tag = 'div', id = '') {
  const children = [];
  const el = {
    tag,
    id,
    textContent: '',
    innerHTML: '',
    style: { display: '' },
    dataset: {},
    classList: makeClassList(),
    children,
    parentNode: null,
    _listeners: {},
    querySelector(sel) { return findInTree(this, sel); },
    querySelectorAll(sel) { return findAllInTree(this, sel) || []; },
    appendChild(child) {
      children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      const i = children.indexOf(child);
      if (i !== -1) children.splice(i, 1);
    },
    addEventListener(ev, fn, opts) {
      this._listeners[ev] = this._listeners[ev] || [];
      this._listeners[ev].push(fn);
    },
    removeEventListener() {},
    getBoundingClientRect() {
      return { top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 };
    },
    get offsetWidth() { return 70; },
    get offsetHeight() { return 40; },
  };
  return el;
}

function findInTree(root, sel) {
  const cls = sel.replace('.', '');
  if (root.classList && root.classList.has(cls)) return root;
  for (const child of (root.children || [])) {
    const found = findInTree(child, sel);
    if (found) return found;
  }
  return null;
}

function findAllInTree(root, sel) {
  const results = [];
  const cls = sel.replace('.', '');
  for (const child of (root.children || [])) {
    if (child.classList && child.classList.has(cls)) results.push(child);
    results.push(...findAllInTree(child, sel));
  }
  return results;
}

// ── Mock DOM globals ──────────────────────────────────────────────────────

let bodyEl;
let createdElements;

function setupDOM() {
  createdElements = [];
  bodyEl = makeElement('body', 'body');

  global.document = {
    body: bodyEl,
    createElement(tag) {
      const el = makeElement(tag);
      createdElements.push(el);
      return el;
    },
    getElementById(id) {
      if (id === 'body') return bodyEl;
      return null;
    },
    querySelector(sel) { return null; },
  };

  global.window = {
    innerWidth: 390,
    innerHeight: 700,
  };
}

// ── Tower data fixture ─────────────────────────────────────────────────────

const MOCK_TOWER = {
  id: 't1',
  nm: 'Slap Shot',
  icon: 'stick',
  role: 'ANTI-SWARM',
  cost: 80,
  clr: '#00d4ff',
  dmg: [25, 40, 60, 90],
  rng: [2.8, 3.2, 3.6, 4.1],
  rate: [1.2, 1.4, 1.7, 2.0],
};

const MOCK_SNIPER = {
  id: 't2',
  nm: 'Sniper',
  icon: 'target',
  role: 'SNIPER',
  cost: 150,
  clr: '#ef4444',
  dmg: [70, 110, 165, 250],
  rng: [4.5, 5.0, 5.6, 6.2],
  rate: [0.5, 0.6, 0.72, 0.85],
};

const MOCK_SPLASH = {
  id: 't3',
  nm: 'Enforcer',
  icon: 'fist',
  role: 'SPLASH',
  cost: 120,
  clr: '#f97316',
  dmg: [45, 70, 105, 160],
  rng: [2.5, 2.9, 3.3, 3.8],
  rate: [0.55, 0.65, 0.78, 0.92],
  splash: [1.2, 1.5, 1.8, 2.2],
};

const MOCK_CROWD = {
  id: 't4',
  nm: 'Ice Spray',
  icon: 'snowflake',
  role: 'CROWD_CONTROL',
  cost: 90,
  clr: '#38bdf8',
  dmg: [18, 28, 42, 60],
  rng: [3.0, 3.4, 3.8, 4.3],
  rate: [1.3, 1.55, 1.8, 2.1],
  slow: 0.5,
  slowDur: [2, 2.5, 3.2, 4],
};

const MOCK_DOT = {
  id: 't7',
  nm: 'Hot Stick',
  icon: 'flame',
  role: 'DOT',
  cost: 140,
  clr: '#f97316',
  dmg: [15, 24, 36, 52],
  rng: [2.6, 3.0, 3.4, 3.9],
  rate: [3.5, 4.2, 5.0, 6.0],
  burn: [10, 16, 24, 35],
  burnDur: 3,
};

const MOCK_CHAIN = {
  id: 't6',
  nm: 'Power Play',
  icon: 'bolt',
  role: 'CHAIN',
  cost: 160,
  clr: '#a855f7',
  dmg: [35, 55, 82, 125],
  rng: [3.5, 4.0, 4.5, 5.1],
  rate: [0.85, 1.0, 1.15, 1.35],
  chain: [2, 3, 4, 6],
  chainRng: 2.2,
};

const MOCK_BOSS = {
  id: 't8',
  nm: 'Captain',
  icon: 'crown',
  role: 'BOSS_KILLER',
  cost: 280,
  clr: '#fbbf24',
  dmg: [200, 320, 480, 720],
  rng: [5.5, 6.1, 6.8, 7.5],
  rate: [0.2, 0.26, 0.33, 0.42],
  crit: 0.4,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SC-4.2 Tower Tooltips', () => {
  beforeEach(() => {
    setupDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  describe('buildTooltipContent', () => {
    it('returns HTML string containing tower name', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('Slap Shot');
    });

    it('returns HTML containing tower icon', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('<svg'); // tower icon is now inline SVG
    });

    it('returns HTML containing cost', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('80');
    });

    it('returns HTML containing dmg stat (level 0)', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('25');
    });

    it('returns HTML containing range stat (level 0)', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('2.8');
    });

    it('returns HTML containing fire rate stat (level 0)', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('1.2');
    });

    it('includes role badge text for SNIPER role', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_SNIPER);
      expect(html).toContain('SNIPER');
    });

    it('includes splash ability info for SPLASH tower', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_SPLASH);
      expect(html).toContain('splash');
    });

    it('includes slow ability info for CROWD_CONTROL tower', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_CROWD);
      expect(html).toContain('slow');
    });

    it('includes burn ability info for DOT tower', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_DOT);
      expect(html).toContain('burn');
    });

    it('includes chain ability info for CHAIN tower', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_CHAIN);
      expect(html).toContain('chain');
    });

    it('includes crit ability info for BOSS_KILLER tower', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_BOSS);
      expect(html).toContain('crit');
    });

    it('includes tooltip-arrow element', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('tooltip-arrow');
    });

    it('includes tooltip-stats element', async () => {
      const { buildTooltipContent } = await import('../js/ui/tooltips.js');
      const html = buildTooltipContent(MOCK_TOWER);
      expect(html).toContain('tooltip-stats');
    });
  });

  describe('getTooltipPosition', () => {
    it('positions tooltip above the button', async () => {
      const { getTooltipPosition } = await import('../js/ui/tooltips.js');
      const btnRect = { top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 };
      const pos = getTooltipPosition(btnRect, 200, 180, 700);
      // Tooltip top should be above button top
      expect(pos.top).toBeLessThan(btnRect.top);
    });

    it('clamps left edge to stay on screen', async () => {
      const { getTooltipPosition } = await import('../js/ui/tooltips.js');
      // Button near left edge
      const btnRect = { top: 600, left: 0, right: 70, bottom: 640, width: 70, height: 40 };
      const pos = getTooltipPosition(btnRect, 200, 180, 700);
      expect(pos.left).toBeGreaterThanOrEqual(0);
    });

    it('clamps right edge to stay on screen', async () => {
      const { getTooltipPosition } = await import('../js/ui/tooltips.js');
      // Button near right edge, viewport width 390
      const btnRect = { top: 600, left: 320, right: 390, bottom: 640, width: 70, height: 40 };
      const pos = getTooltipPosition(btnRect, 390, 180, 700);
      expect(pos.left + 180).toBeLessThanOrEqual(390 + 8); // allow small tolerance
    });
  });

  describe('initTooltips', () => {
    it('exports initTooltips function', async () => {
      const mod = await import('../js/ui/tooltips.js');
      expect(typeof mod.initTooltips).toBe('function');
    });

    it('creates a tooltip element and appends to body', async () => {
      const { initTooltips } = await import('../js/ui/tooltips.js');
      const tooltipsBefore = createdElements.filter(el =>
        el.classList && el.classList.has('tower-tooltip')
      ).length;
      initTooltips();
      // After init, tooltip element should exist (created via createElement)
      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );
      expect(tooltipEl).toBeDefined();
    });

    it('tooltip element is hidden initially', async () => {
      const { initTooltips } = await import('../js/ui/tooltips.js');
      initTooltips();
      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );
      expect(tooltipEl).toBeDefined();
      expect(tooltipEl.style.display).toBe('none');
    });
  });

  describe('attachTooltip', () => {
    it('exports attachTooltip function', async () => {
      const mod = await import('../js/ui/tooltips.js');
      expect(typeof mod.attachTooltip).toBe('function');
    });

    it('attaches mouseenter listener to button element', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);
      expect(btn._listeners['mouseenter']).toBeDefined();
      expect(btn._listeners['mouseenter'].length).toBeGreaterThan(0);
    });

    it('attaches mouseleave listener to button element', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      attachTooltip(btn, MOCK_TOWER);
      expect(btn._listeners['mouseleave']).toBeDefined();
    });

    it('attaches touchstart listener to button element', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      attachTooltip(btn, MOCK_TOWER);
      expect(btn._listeners['touchstart']).toBeDefined();
    });

    it('attaches touchend listener to button element', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      attachTooltip(btn, MOCK_TOWER);
      expect(btn._listeners['touchend']).toBeDefined();
    });

    it('shows tooltip after 300ms delay on mouseenter', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      // Before 300ms
      btn._listeners['mouseenter'][0]({});
      expect(tooltipEl.style.display).toBe('none');

      // After 300ms
      vi.advanceTimersByTime(300);
      expect(tooltipEl.style.display).not.toBe('none');
    });

    it('hides tooltip on mouseleave', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      // Show it
      btn._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(300);
      expect(tooltipEl.style.display).not.toBe('none');

      // Hide on leave
      btn._listeners['mouseleave'][0]({});
      expect(tooltipEl.style.display).toBe('none');
    });

    it('cancels tooltip timer if mouseleave before 300ms', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      btn._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(200); // less than 300ms
      btn._listeners['mouseleave'][0]({});
      vi.advanceTimersByTime(200); // advance past 300ms total

      // Tooltip should never have shown
      expect(tooltipEl.style.display).toBe('none');
    });

    it('shows tooltip on touchstart after 400ms (long press)', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      const mockTouchEvent = { touches: [{ clientX: 135, clientY: 620 }], preventDefault: vi.fn() };
      btn._listeners['touchstart'][0](mockTouchEvent);
      vi.advanceTimersByTime(400);
      expect(tooltipEl.style.display).not.toBe('none');
    });

    it('hides tooltip on touchend', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      const mockTouchEvent = { touches: [{ clientX: 135, clientY: 620 }], preventDefault: vi.fn() };
      btn._listeners['touchstart'][0](mockTouchEvent);
      vi.advanceTimersByTime(400);

      btn._listeners['touchend'][0]({});
      expect(tooltipEl.style.display).toBe('none');
    });

    it('updates tooltip content for different towers', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();

      const btn1 = makeElement('div');
      btn1.getBoundingClientRect = () => ({ top: 600, left: 10, right: 80, bottom: 640, width: 70, height: 40 });
      const btn2 = makeElement('div');
      btn2.getBoundingClientRect = () => ({ top: 600, left: 90, right: 160, bottom: 640, width: 70, height: 40 });

      attachTooltip(btn1, MOCK_TOWER);
      attachTooltip(btn2, MOCK_SNIPER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      // Hover first tower
      btn1._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(300);
      expect(tooltipEl.innerHTML).toContain('Slap Shot');

      // Leave and hover second tower
      btn1._listeners['mouseleave'][0]({});
      btn2._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(300);
      expect(tooltipEl.innerHTML).toContain('Sniper');
    });

    it('sets tooltip position style when showing', async () => {
      const { initTooltips, attachTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      btn._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(300);

      expect(tooltipEl.style.top).toBeDefined();
      expect(tooltipEl.style.left).toBeDefined();
    });
  });

  describe('hideTooltip', () => {
    it('exports hideTooltip function', async () => {
      const mod = await import('../js/ui/tooltips.js');
      expect(typeof mod.hideTooltip).toBe('function');
    });

    it('hides the tooltip element immediately', async () => {
      const { initTooltips, attachTooltip, hideTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      // Show it first
      btn._listeners['mouseenter'][0]({});
      vi.advanceTimersByTime(300);
      expect(tooltipEl.style.display).not.toBe('none');

      // Call hideTooltip
      hideTooltip();
      expect(tooltipEl.style.display).toBe('none');
    });

    it('cancels pending show timer', async () => {
      const { initTooltips, attachTooltip, hideTooltip } = await import('../js/ui/tooltips.js');
      initTooltips();
      const btn = makeElement('div');
      btn.getBoundingClientRect = () => ({ top: 600, left: 100, right: 170, bottom: 640, width: 70, height: 40 });
      attachTooltip(btn, MOCK_TOWER);

      const tooltipEl = createdElements.find(el =>
        el.classList && el.classList.has('tower-tooltip')
      );

      btn._listeners['mouseenter'][0]({});
      hideTooltip(); // cancel before 300ms
      vi.advanceTimersByTime(400);

      expect(tooltipEl.style.display).toBe('none');
    });
  });

  describe('getSpecialAbilityText', () => {
    it('exports getSpecialAbilityText function', async () => {
      const mod = await import('../js/ui/tooltips.js');
      expect(typeof mod.getSpecialAbilityText).toBe('function');
    });

    it('returns splash description for SPLASH tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_SPLASH);
      expect(text.toLowerCase()).toContain('splash');
    });

    it('returns slow description for CROWD_CONTROL tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_CROWD);
      expect(text.toLowerCase()).toContain('slow');
    });

    it('returns burn description for DOT tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_DOT);
      expect(text.toLowerCase()).toContain('burn');
    });

    it('returns chain description for CHAIN tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_CHAIN);
      expect(text.toLowerCase()).toContain('chain');
    });

    it('returns crit description for BOSS_KILLER tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_BOSS);
      expect(text.toLowerCase()).toContain('crit');
    });

    it('returns default description for basic ANTI-SWARM tower', async () => {
      const { getSpecialAbilityText } = await import('../js/ui/tooltips.js');
      const text = getSpecialAbilityText(MOCK_TOWER);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });
  });
});
