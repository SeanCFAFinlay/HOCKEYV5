// Tests for SC-3.4: Currency Fly-to-HUD
// worldToScreen helper + CurrencyFlyPool behavior

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal DOM stubs ──────────────────────────────────────────────────────

function makeElement(id = '') {
  const el = {
    id,
    style: { cssText: '', display: '', opacity: '', left: '', top: '' },
    className: '',
    classList: {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      contains(c) { return this._classes.has(c); }
    },
    getBoundingClientRect() {
      return { left: 800, top: 20, width: 60, height: 24 };
    },
    get offsetWidth() { return 60; },
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    remove: vi.fn(),
    textContent: '',
    children: []
  };
  // appendChid puts item in children array
  el.appendChild = vi.fn(child => el.children.push(child));
  return el;
}

// Stub document.createElement for pool init in node environment
global.document = global.document || {
  createElement: vi.fn(() => makeElement())
};

// ── Import module under test ───────────────────────────────────────────────

import { worldToScreen, CurrencyFlyPool } from '../js/ui/currency-fly.js';

// ══════════════════════════════════════════════════════════════════════════
// worldToScreen helper
// ══════════════════════════════════════════════════════════════════════════

describe('worldToScreen', () => {
  beforeEach(() => {
    global.THREE = {
      Vector3: vi.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.project = vi.fn((camera) => {
          camera.project(this);
          return this;
        });
      })
    };
  });

  afterEach(() => {
    delete global.THREE;
  });

  it('converts NDC center (0,0) to canvas center', () => {
    const camera = {
      project: vi.fn(vec => { vec.x = 0; vec.y = 0; vec.z = 0.5; })
    };
    const canvas = { width: 800, height: 600 };
    const pos = worldToScreen(0, 0, 0, camera, canvas);
    expect(pos.x).toBeCloseTo(400);
    expect(pos.y).toBeCloseTo(300);
  });

  it('converts NDC (-1, 1) to top-left corner', () => {
    const camera = {
      project: vi.fn(vec => { vec.x = -1; vec.y = 1; vec.z = 0.5; })
    };
    const canvas = { width: 800, height: 600 };
    const pos = worldToScreen(0, 0, 0, camera, canvas);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo(0);
  });

  it('converts NDC (1, -1) to bottom-right corner', () => {
    const camera = {
      project: vi.fn(vec => { vec.x = 1; vec.y = -1; vec.z = 0.5; })
    };
    const canvas = { width: 800, height: 600 };
    const pos = worldToScreen(0, 0, 0, camera, canvas);
    expect(pos.x).toBeCloseTo(800);
    expect(pos.y).toBeCloseTo(600);
  });

  it('calls camera.project with a vector containing the world position', () => {
    const camera = {
      project: vi.fn(vec => { vec.x = 0; vec.y = 0; vec.z = 0; })
    };
    const canvas = { width: 100, height: 100 };
    worldToScreen(3, 2, 1, camera, canvas);
    // Vector passed to project should carry (3,2,1) before project mutates it
    expect(global.THREE.Vector3).toHaveBeenCalledWith(3, 2, 1);
    expect(camera.project).toHaveBeenCalledOnce();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// CurrencyFlyPool
// ══════════════════════════════════════════════════════════════════════════

describe('CurrencyFlyPool', () => {
  let container;
  let pool;

  beforeEach(() => {
    container = makeElement('flyContainer');
    container.children = [];
    // appendChid puts item in children array for inspection
    container.appendChild = vi.fn(el => container.children.push(el));
    pool = new CurrencyFlyPool(container, 10);
  });

  it('initialises a pool of 10 hidden elements', () => {
    expect(container.appendChild).toHaveBeenCalledTimes(10);
  });

  it('acquire() returns an element', () => {
    const el = pool.acquire();
    expect(el).toBeTruthy();
  });

  it('acquire() up to MAX_POOL returns unique elements', () => {
    const els = new Set();
    for (let i = 0; i < 10; i++) {
      els.add(pool.acquire());
    }
    expect(els.size).toBe(10);
  });

  it('acquire() beyond pool limit returns null', () => {
    for (let i = 0; i < 10; i++) pool.acquire();
    expect(pool.acquire()).toBeNull();
  });

  it('release() returns element back to available pool', () => {
    const el = pool.acquire();
    pool.release(el);
    // After release, we can acquire again
    const el2 = pool.acquire();
    expect(el2).toBeTruthy();
  });

  it('active count tracks correctly', () => {
    pool.acquire();
    pool.acquire();
    expect(pool.activeCount()).toBe(2);
    const el = pool.acquire();
    expect(pool.activeCount()).toBe(3);
    pool.release(el);
    expect(pool.activeCount()).toBe(2);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// showCurrencyFly
// ══════════════════════════════════════════════════════════════════════════

describe('showCurrencyFly integration', () => {
  let rafCallbacks;
  let originalRaf;
  let container;
  let moneyEl;

  beforeEach(() => {
    rafCallbacks = [];
    originalRaf = global.requestAnimationFrame;
    global.requestAnimationFrame = vi.fn(cb => {
      rafCallbacks.push(cb);
      return rafCallbacks.length - 1;
    });
    global.performance = { now: vi.fn(() => 0) };

    container = makeElement('flyContainer');
    container.children = [];
    container.appendChild = vi.fn(el => container.children.push(el));

    moneyEl = makeElement('moneyStat');
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRaf;
  });

  it('can import showCurrencyFly without error', async () => {
    const mod = await import('../js/ui/currency-fly.js');
    expect(typeof mod.showCurrencyFly).toBe('function');
  });

  it('showCurrencyFly accepts (amount, startX, startY, targetEl, pool) without throwing', async () => {
    const { showCurrencyFly, CurrencyFlyPool } = await import('../js/ui/currency-fly.js');
    const p = new CurrencyFlyPool(container, 10);
    expect(() => showCurrencyFly(50, 200, 300, moneyEl, p)).not.toThrow();
  });

  it('showCurrencyFly does not throw when pool is exhausted', async () => {
    const { showCurrencyFly, CurrencyFlyPool } = await import('../js/ui/currency-fly.js');
    const p = new CurrencyFlyPool(container, 10);
    // Exhaust pool
    for (let i = 0; i < 10; i++) p.acquire();
    expect(() => showCurrencyFly(10, 100, 100, moneyEl, p)).not.toThrow();
  });
});
