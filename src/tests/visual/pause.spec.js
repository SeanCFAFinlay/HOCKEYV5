import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';
import { gotoMenu, gotoMapScreen, gotoGame, settle } from './helpers.js';

/**
 * Pause has to be verified in a browser: the unit suite mocks the DOM and never
 * runs the loop, so it cannot tell a frozen simulation from a running one.
 *
 * The observable is frame identity. Paused, the loop keeps rendering but runs no
 * fixed-timestep updates, so consecutive canvas frames are byte-identical.
 * Running, they are not. That distinguishes a real pause from merely hiding the
 * board behind an overlay.
 */

const hash = buf => crypto.createHash('md5').update(buf).digest('hex');

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

test('pause freezes the simulation and resume restarts it', async ({ page }) => {
  await startedGame(page);

  // Start a wave so there is something moving to freeze.
  await page.locator('#startBtn').click();
  await page.waitForTimeout(2500);

  const canvas = page.locator('.canvas-wrap canvas');

  const runA = hash(await canvas.screenshot());
  await page.waitForTimeout(600);
  const runB = hash(await canvas.screenshot());
  expect(runA, 'frames should change while the game runs').not.toBe(runB);

  await page.locator('.hud-menu').click();
  await expect(page.locator('#pauseOverlay')).toBeVisible();

  // Screenshot the canvas element, not the page: the overlay covers the board.
  const pauseA = hash(await canvas.screenshot());
  await page.waitForTimeout(800);
  const pauseB = hash(await canvas.screenshot());
  expect(pauseA, 'frames must be identical while paused').toBe(pauseB);

  await page.locator('#pauseResumeBtn').click();
  await expect(page.locator('#pauseOverlay')).toBeHidden();

  const resA = hash(await canvas.screenshot());
  await page.waitForTimeout(700);
  const resB = hash(await canvas.screenshot());
  expect(resA, 'frames should change again after resuming').not.toBe(resB);
});

test('the pause sheet reports live game state', async ({ page }) => {
  await startedGame(page);
  await page.locator('#startBtn').click();
  await page.waitForTimeout(2500);
  await page.locator('.hud-menu').click();

  await expect(page.locator('#pauseWave')).toHaveText(/Wave 1\/\d+/);
  // A wave is in progress, so enemies must be on the board. Guards against the
  // stats rendering as a hardcoded 0.
  await expect(page.locator('#pauseEnemies')).not.toHaveText('0');
});

test('auto-start waves can be toggled from the pause sheet', async ({ page }) => {
  await startedGame(page);
  await page.locator('.hud-menu').click();

  const auto = page.locator('#pauseAutoBtn');
  const before = await auto.getAttribute('aria-checked');
  await auto.click();
  expect(await auto.getAttribute('aria-checked')).not.toBe(before);
});

test('the backdrop and Escape both resume', async ({ page }) => {
  await startedGame(page);

  await page.locator('.hud-menu').click();
  await expect(page.locator('#pauseOverlay')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#pauseOverlay')).toBeHidden();

  await page.locator('.hud-menu').click();
  await expect(page.locator('#pauseOverlay')).toBeVisible();
  // Click the backdrop itself, well clear of the sheet.
  await page.locator('#pauseOverlay').click({ position: { x: 8, y: 8 } });
  await expect(page.locator('#pauseOverlay')).toBeHidden();
});
