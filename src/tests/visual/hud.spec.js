import { test, expect } from '@playwright/test';
import { gotoMenu, gotoMapScreen, gotoGame, settle } from './helpers.js';

/**
 * The phone HUD keeps four things: pause, wave, money, lives. Everything else
 * moved into the pause sheet. Tablets and desktop keep the full HUD.
 */

async function startedGame(page) {
  await gotoMenu(page);
  await gotoMapScreen(page);
  await gotoGame(page);
  await settle(page, 1000);
}

test.describe('phone', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true
  });

  test('only the four essentials stay on the HUD', async ({ page }) => {
    await startedGame(page);

    await expect(page.locator('.hud-menu')).toBeVisible();
    await expect(page.locator('.hud-wave')).toBeVisible();
    await expect(page.locator('#moneyStat')).toBeVisible();
    await expect(page.locator('#livesStat')).toBeVisible();

    await expect(page.locator('.hud-stat.kills')).toBeHidden();
    await expect(page.locator('.hud-stat.score')).toBeHidden();
    await expect(page.locator('.hud-center')).toBeHidden();
    await expect(page.locator('.hud-right .settings-btn')).toBeHidden();
  });

  test('what left the HUD is reachable from the pause sheet', async ({ page }) => {
    await startedGame(page);
    await page.locator('.hud-menu').click();

    // Hidden is only acceptable because it is all still one tap away.
    await expect(page.locator('#pauseKills')).toBeVisible();
    await expect(page.locator('#pauseScore')).toBeVisible();
    await expect(page.locator('#pauseEnemies')).toBeVisible();
    await expect(page.locator('#pauseAutoBtn')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('the HUD stays on one row', async ({ page }) => {
    await startedGame(page);

    // #minimapContainer is pinned at top:70px assuming a single-row HUD, so a
    // wrap here collides with it.
    const rows = await page.evaluate(() => {
      const tops = [...document.querySelectorAll('.hud-right > *')]
        .filter(el => getComputedStyle(el).display !== 'none')
        .map(el => Math.round(el.getBoundingClientRect().top));
      return new Set(tops).size;
    });
    expect(rows, 'HUD chips wrapped onto more than one row').toBeLessThanOrEqual(1);
  });

  test('the minimap starts collapsed and remembers being opened', async ({ page }) => {
    await startedGame(page);

    const map = page.locator('#minimapContainer');
    const canvas = page.locator('#minimapCanvas');
    const toggle = page.locator('#minimapToggle');

    await expect(map).toHaveClass(/collapsed/);
    await expect(canvas).toBeHidden();
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', /show minimap/i);

    await toggle.click();
    await expect(canvas).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', /hide minimap/i);

    // The choice must survive a reload, or it has to be made every wave.
    await page.reload();
    await startedGame(page);
    await expect(page.locator('#minimapContainer')).not.toHaveClass(/collapsed/);
    await expect(page.locator('#minimapCanvas')).toBeVisible();
  });

  test('the minimap toggle is a real touch target', async ({ page }) => {
    await startedGame(page);
    // It used to be a 10px-font chip pinned inside the map's corner.
    const box = await page.locator('#minimapToggle').boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true });

  test('keeps the full HUD and an expanded minimap', async ({ page }) => {
    await startedGame(page);

    // The reduction is a phone accommodation, not a redesign for every screen.
    await expect(page.locator('.hud-stat.kills')).toBeVisible();
    await expect(page.locator('.hud-stat.score')).toBeVisible();
    await expect(page.locator('#minimapContainer')).not.toHaveClass(/collapsed/);
  });
});
