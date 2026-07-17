import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pinned rather than left to the default glob. The default also matches
    // `*.spec.js`, which would sweep up the Playwright specs in tests/visual/ —
    // they import @playwright/test and would fail under vitest.
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**', 'tests/visual/**']
  }
});
