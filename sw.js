// CogSpeed V14 service worker - network first, always fresh
const CACHE = "cogspeed-v16";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Always go network first, no caching
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
