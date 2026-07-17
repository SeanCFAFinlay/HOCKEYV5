import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { VIEWPORTS, MIN_TOUCH_PX } from './viewports.js';
import {
  gotoMenu, gotoMapScreen, gotoGame,
  expectNoHorizontalOverflow, settle
} from './helpers.js';

/**
 * Screenshots land in tests/visual/screenshots/<label>/, where the label comes
 * from SHOT_LABEL. Capture `baseline` before a UI change and `after` following
 * it, then compare the two directories by eye:
 *
 *   SHOT_LABEL=baseline npm run shots
 *   ...make the change...
 *   SHOT_LABEL=after    npm run shots
 *
 * They are artifacts, not pixel baselines — see playwright.config.js.
 */
const LABEL = process.env.SHOT_LABEL || 'current';
const SHOT_DIR = join('tests', 'visual', 'screenshots', LABEL);

test.beforeAll(async () => {
  await mkdir(SHOT_DIR, { recursive: true });
});

async function shoot(page, name) {
  await page.screenshot({ path: join(SHOT_DIR, `${name}.png`) });
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      hasTouch: true,
      isMobile: vp.phone
    });

    test('menu, map and game render without horizontal overflow', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('pageerror', e => consoleErrors.push(String(e)));

      await gotoMenu(page);
      await settle(page, 400);
      await shoot(page, `${vp.name}-1-menu`);
      await expectNoHorizontalOverflow(page, vp.width);

      await gotoMapScreen(page);
      await settle(page, 400);
      await shoot(page, `${vp.name}-2-maps`);
      await expectNoHorizontalOverflow(page, vp.width);

      await gotoGame(page);
      await settle(page, 1200);
      await shoot(page, `${vp.name}-3-game`);
      await expectNoHorizontalOverflow(page, vp.width);

      // The app warns rather than throws when audio files 404, and every sound
      // is currently missing, so audio noise is filtered out deliberately.
      const real = consoleErrors.filter(e => !/audio|sound|\.mp3|\.ogg|\.wav/i.test(e));
      expect(real, `console errors: ${real.join('\n')}`).toEqual([]);
    });

    test('the whole rink is framed on screen', async ({ page }) => {
      await gotoMenu(page);
      await gotoMapScreen(page);
      await gotoGame(page);
      await settle(page);

      // Guards the aspect-aware camera fix (F8): on a portrait phone the old
      // distance cropped the rink and put the spawn off the left edge.
      const canvas = page.locator('.canvas-wrap canvas');
      const box = await canvas.boundingBox();
      expect(box.width).toBeGreaterThan(0);
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(Math.round(box.x + box.width)).toBeLessThanOrEqual(vp.width + 1);
    });

    if (vp.phone && !vp.landscape) {
      test('primary controls meet the touch-target floor', async ({ page }) => {
        await gotoMenu(page);
        await gotoMapScreen(page);
        await gotoGame(page);
        await settle(page, 600);

        // Tower buttons and the start button are the controls a player hits
        // every single wave.
        const { undersized, measured } = await page.evaluate((min) => {
          const out = [];
          let count = 0;
          const sel = ['#startBtn', '#towerBar .tower-btn', '.action-btn'];
          for (const s of sel) {
            for (const el of document.querySelectorAll(s)) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;
              count++;
              if (r.height < min) {
                out.push({
                  sel: s,
                  text: (el.textContent || '').trim().slice(0, 18),
                  h: Math.round(r.height),
                  w: Math.round(r.width)
                });
              }
            }
          }
          return { undersized: out, measured: count };
        }, MIN_TOUCH_PX);

        // Without this, the assertion below passes when the selectors match
        // nothing at all -- a test that goes green precisely when the UI is
        // most broken. 8 towers + 6 action buttons are on screen today.
        expect(measured, 'no controls were measured; selectors are stale').toBeGreaterThanOrEqual(10);

        expect(
          undersized,
          `controls shorter than ${MIN_TOUCH_PX}px: ${JSON.stringify(undersized, null, 2)}`
        ).toEqual([]);
      });
    }
  });
}
