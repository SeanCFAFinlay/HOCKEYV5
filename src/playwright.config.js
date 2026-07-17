import { defineConfig } from '@playwright/test';

/**
 * Not vite's default 4173: that port is a popular default and this harness
 * silently tested a *different* project's dev server that happened to be
 * listening on it. Paired with reuseExistingServer:false below, so a stray
 * server can never stand in for the real build again.
 */
const PORT = Number(process.env.SHOT_PORT || 4319);

/**
 * Visual/layout harness for the mobile UI work.
 *
 * Runs against the production build rather than the dev server, so what is
 * measured is what ships.
 *
 * Deliberately NOT using toHaveScreenshot() pixel baselines: the game renders a
 * live 3D scene with a running animation loop, ambient particles and bloom, so
 * no two frames are identical and a pixel baseline would fail forever. The
 * screenshots here are artifacts for a human to compare across a change; the
 * automated assertions cover what is genuinely deterministic (layout overflow,
 * element geometry, touch-target sizes).
 */
export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.spec.js',
  outputDir: './tests/visual/.output',
  // The 3D scene needs a moment to build on a cold headless GPU.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    screenshot: 'off',
    trace: process.env.CI ? 'retain-on-failure' : 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        // SwiftShader: headless Chromium has no real GPU, and the game refuses
        // to start without a WebGL context.
        launchOptions: {
          args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader']
        }
      }
    }
  ],

  webServer: {
    // --host 127.0.0.1 is required, not cosmetic: vite preview otherwise binds
    // `localhost`, which resolves to ::1 only, and the readiness check below
    // (and every request from the browser) hits 127.0.0.1 and gets nothing.
    command: `npm run build && npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    // Never reuse. strictPort makes a collision fail loudly instead of quietly
    // serving whatever else is on the port.
    reuseExistingServer: false,
    timeout: 120_000
  }
});
