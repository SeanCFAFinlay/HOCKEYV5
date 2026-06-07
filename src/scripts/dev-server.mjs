import { fileURLToPath } from 'node:url';
import { installViteSpawnGuard } from './vite-spawn-guard.mjs';

installViteSpawnGuard();

const { createServer } = await import('vite');

const args = process.argv.slice(2);
const root = fileURLToPath(new URL('..', import.meta.url));

function readOption(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1 || index === args.length - 1) return fallback;
  return args[index + 1];
}

const host = readOption('--host', '127.0.0.1');
const port = Number(readOption('--port', '5173'));
const strictPort = args.includes('--strictPort');

const server = await createServer({
  root,
  configFile: false,
  resolve: {
    preserveSymlinks: true
  },
  server: {
    host,
    port,
    strictPort
  }
});

await server.listen();
server.printUrls();

async function shutdown() {
  await server.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
