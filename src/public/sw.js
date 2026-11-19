// Offline support for the installed game.
//
// Pages are fetched network-first, so a new deploy is picked up the next time
// the game is opened online. Everything else (hashed scripts and styles, the
// Three.js build and fonts from their CDNs) is served from cache when present
// and refreshed in the background.

const CACHE = 'hockey-td-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(['./', 'manifest.webmanifest'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function store(request, response) {
  // Opaque responses (cross-origin without CORS) are still worth keeping.
  if (response && (response.ok || response.type === 'opaque')) {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(r => store(request, r)).catch(() => caches.match(request).then(r => r || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(r => store(request, r)).catch(() => cached);
      return cached || fresh;
    })
  );
});
