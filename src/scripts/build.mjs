import { installViteSpawnGuard } from './vite-spawn-guard.mjs';

installViteSpawnGuard();

const { build } = await import('vite');

await build({
  configFile: false,
  resolve: {
    preserveSymlinks: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssMinify: false
  }
});
