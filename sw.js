const CACHE_VERSION = 'v2.1';
const CACHE_NAME = 'travel-app-' + CACHE_VERSION;

// Install: cache the main page
self.addEventListener('install', e => {
  self.skipWaiting(); // Activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html']).catch(() => {});
    })
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', e => {
  // Don't cache Firebase or API calls
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('nominatim')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
