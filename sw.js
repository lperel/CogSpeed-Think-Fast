const CACHE_NAME = "cogspeed-v21-shell-v32";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js?v=103b",
  "./manifest.json",
  "./privacy.html",
  "./terms.html",
  "./icon-192.png",
  "./icon-512.png",
  "./gear0.png",
  "./gear1.png",
  "./gear2.png",
  "./gear3.png",
  "./gear4.png",
  "./gear5.png",
  "./gear6.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return resp;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
