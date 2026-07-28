// FixIt AI Service Worker — Phase 1: App shell cache only
// Full offline + push deferred to Phase 9 (D11)

const CACHE_NAME = 'fixitai-v1';
const SHELL_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for all requests (app requires internet for AI)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
