const CACHE_NAME = 'toddler-games-v1';
const URLS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache the response for future offline use (cache-first dynamic)
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(req, copy);
            } catch (e) {
              // ignore
            }
          });
          return res;
        })
        .catch(() => {
          // Fallback to index.html for navigation requests (app shell)
          if (req.mode === 'navigate') return caches.match('/index.html');
          return new Response('', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
