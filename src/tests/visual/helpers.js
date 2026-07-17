import { expect } from '@playwright/test';

/**
 * Drive the real UI rather than calling into the app's globals: the point of
 * this harness is to prove a player can reach these screens by touching things.
 * (startGame() isn't on window anyway — map cards bind it directly.)
 */

/** Load the app and wait for the menu to be interactive. */
export async function gotoMenu(page) {
  await page.goto('/');
  // index.html force-hides #appLoader after 2s regardless of JS state, so
  // waiting on the loader alone would pass even if the app never booted.
  await expect(page.locator('#menuScreen.active')).toBeVisible();
  await expect(page.locator('#themeCards .menu-card').first()).toBeVisible();
}

/** Menu -> map grid for the given theme (defaults to the first, hockey). */
export async function gotoMapScreen(page, themeIndex = 0) {
  await page.locator('#themeCards .menu-card').nth(themeIndex).click();
  await expect(page.locator('#mapScreen.active')).toBeVisible();
  await expect(page.locator('#mapGrid .map-card').first()).toBeVisible();
}

/** Map grid -> a running game on the first unlocked map. */
export async function gotoGame(page, mode = 'campaign') {
  const card = page.locator('#mapGrid .map-card:not(.locked)').first();
  await card.locator(`[data-mode="${mode}"]`).click();
  await expect(page.locator('#gameScreen.active')).toBeVisible();
  await expect(page.locator('.canvas-wrap canvas')).toBeVisible();
  await expect(page.locator('#towerBar .tower-btn').first()).toBeVisible();
}

/**
 * Horizontal overflow check.
 *
 * Compares scrollWidth against the viewport rather than clientWidth: an element
 * pushing the document wider is the bug we care about, and on a page that
 * cannot scroll horizontally (touch-action/overflow rules) clientWidth can
 * already equal scrollWidth while content still spills.
 */
export async function expectNoHorizontalOverflow(page, viewportWidth) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      // Ignore elements that are deliberately scrolled containers' children.
      if (r.right > doc.clientWidth + 1 || r.left < -1) {
        offenders.push({
          sel: el.tagName.toLowerCase() +
               (el.id ? '#' + el.id : '') +
               (typeof el.className === 'string' && el.className
                 ? '.' + el.className.trim().split(/\s+/).join('.')
                 : ''),
          left: Math.round(r.left),
          right: Math.round(r.right)
        });
      }
    }
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders: offenders.slice(0, 10)
    };
  });

  expect(
    overflow.scrollWidth,
    `document overflows horizontally at ${viewportWidth}px. ` +
    `Offenders: ${JSON.stringify(overflow.offenders, null, 2)}`
  ).toBeLessThanOrEqual(overflow.clientWidth);
}

/**
 * Wait for the active screen to finish arriving, then let the scene settle.
 *
 * base.css gives every `.screen` an `animation: screen-in 0.3s` starting at
 * opacity 0. A screen is display:none until it gets `.active`, so that
 * animation only begins the moment the screen becomes active -- i.e. exactly
 * when the navigation helpers above return. Screenshotting straight away
 * captures a near-invisible screen, and freezing animations at that point
 * (which an earlier version of this helper did) pins it at opacity 0 forever.
 *
 * Playwright's toBeVisible() ignores opacity, so nothing else here catches it:
 * the assertions pass and the screenshots come out blank. Hence waiting for the
 * animation to finish, and the explicit opacity guard.
 */
export async function settle(page, ms = 1200) {
  await page.waitForFunction(() => {
    const s = document.querySelector('.screen.active');
    if (!s) return false;
    // Only this element's own animations (screen-in). Descendants may run
    // infinite pulse/glow animations that never reach 'finished'.
    return s.getAnimations().every(a => a.playState === 'finished');
  }, null, { timeout: 5000 });

  await page.waitForTimeout(ms);

  const opacity = await page.evaluate(() => {
    const s = document.querySelector('.screen.active');
    return s ? Number(getComputedStyle(s).opacity) : 0;
  });
  expect(opacity, 'active screen is transparent; the screenshot would be blank').toBeGreaterThan(0.99);
}
