const CACHE = 'optimists-cc-v5';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for the app shell (news/fixtures data is baked into index.html,
// so "offline" means the last-synced snapshot, not live data).
// Network-first for anything else (e.g. if the app ever calls out), falling
// back to cache so it still works with no connection.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isShellFile = SHELL.some(p => url.pathname.endsWith(p.replace('./', '/')) || url.pathname.endsWith('/'));

  if (isShellFile) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  } else {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
