import { test, expect } from '@playwright/test';
import { gotoMenu, gotoMapScreen, gotoGame, settle, expectNoHorizontalOverflow } from './helpers.js';

/**
 * The action bar went from six controls (1x/2x/3x, SELL, AUTO, START) to two.
 * These specs cover the things that removal could plausibly have broken, in a
 * browser — the unit suite mocks the DOM and cannot see any of it.
 */

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  hasTouch: true,
  isMobile: true
});

async function startedGame(page) {
  await gotoMenu(page);
  await gotoMapScreen(page);
  await gotoGame(page);
  await settle(page, 1200);
}

test('the speed button cycles 1x -> 2x -> 3x -> 1x', async ({ page }) => {
  await startedGame(page);
  const speed = page.locator('#speedBtn');

  await expect(speed).toHaveText('1×');
  await expect(speed).not.toHaveClass(/boosted/);

  await speed.click();
  await expect(speed).toHaveText('2×');
  await expect(speed).toHaveClass(/boosted/);

  await speed.click();
  await expect(speed).toHaveText('3×');

  await speed.click();
  await expect(speed).toHaveText('1×');
  // Back to normal speed, so the lit state must clear.
  await expect(speed).not.toHaveClass(/boosted/);
});

test('the speed button describes what it does to a screen reader', async ({ page }) => {
  await startedGame(page);
  const speed = page.locator('#speedBtn');
  // "1×" alone would not tell a screen reader user that this cycles.
  await expect(speed).toHaveAttribute('aria-label', /speed.*tap to change/i);
});

/*
 * There is deliberately no test here asserting that 3x simulates three times as
 * fast, though that is the thing one most wants to pin down.
 *
 * The loop advances at most MAX_STEPS_PER_FRAME (5) fixed 1/60s steps per
 * rendered frame, so it can only simulate ~83ms of game time per frame. True 3x
 * therefore needs a frame every <=27ms, i.e. >=36fps. Headless chromium draws
 * this scene through SwiftShader well below that, so the speed multiplier gets
 * clamped and the measurement reports the software renderer's throughput rather
 * than the game's. An earlier version of this test duly recorded 3x as *slower*
 * than 1x.
 *
 * Verified by hand against a real render instead: with no towers, 1x had leaked
 * 1 life at t=6s and 3x had leaked 3.
 *
 * Worth knowing that the same clamp applies on a real device: at 30fps, 3x
 * silently delivers about 2.5x, and less as the frame rate drops.
 */

test('the enemy counter reports the wave as soon as it starts', async ({ page }) => {
  await startedGame(page);
  await expect(page.locator('#enemyCount')).toHaveText('0');

  await page.locator('#startBtn').click();
  // startWave() used to call updateHUD() before setSpawnsPending(), so the
  // counter renders enemies(0) + pending(0) = 0 and -- since the loop only
  // refreshes the HUD on wave completion -- stayed at 0 for the whole spawn
  // phase, until the first kill or leak happened to refresh it.
  await expect(page.locator('#enemyCount')).not.toHaveText('0', { timeout: 3000 });
});

test('number keys still set speed now that the per-speed buttons are gone', async ({ page }) => {
  await startedGame(page);
  const speed = page.locator('#speedBtn');

  // The keyboard handler used to synthesise a click on a .speed-btn matching
  // data-speed; those buttons no longer exist, so it now calls controls.js.
  await page.keyboard.press('3');
  await expect(speed).toHaveText('3×');

  await page.keyboard.press('1');
  await expect(speed).toHaveText('1×');
});

test('the retired SELL and AUTO buttons are gone, and START survives', async ({ page }) => {
  await startedGame(page);

  await expect(page.locator('#sellBtn')).toHaveCount(0);
  await expect(page.locator('#autoBtn')).toHaveCount(0);
  await expect(page.locator('#startBtn')).toBeVisible();
  await expect(page.locator('.action-bar > *')).toHaveCount(2);
});

test('selecting a tower still works without sell mode', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await startedGame(page);

  // tower-bar.js and hud.js both used to poke #sellBtn unguarded on every
  // selection, which would throw a TypeError now that the button is gone.
  const first = page.locator('#towerBar .tower-btn').first();
  await first.click();
  await expect(first).toHaveClass(/selected/);

  await first.click();
  await expect(first).not.toHaveClass(/selected/);

  expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
});

test('the two-control action bar does not overflow the narrowest phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await startedGame(page);
  await expectNoHorizontalOverflow(page, 320);

  // Both controls must still clear the touch guideline on both axes — the old
  // speed buttons were 40px wide, under the 44px floor.
  for (const sel of ['#speedBtn', '#startBtn']) {
    const box = await page.locator(sel).boundingBox();
    expect(box.height, `${sel} height`).toBeGreaterThanOrEqual(44);
    expect(box.width, `${sel} width`).toBeGreaterThanOrEqual(44);
  }
});
