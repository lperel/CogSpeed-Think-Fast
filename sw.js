// Keep RELEASE in sync with APP_VERSION in app.js and the versioned app.js query in index.html.
const RELEASE = "629";
const CACHE_NAME = `cogspeed-v${RELEASE}-shell-v${RELEASE}`;
const APP_SHELL = [
  "./",
  "./index.html",
  `./app.js?v=${RELEASE}`,
  "./manifest.json",
  "./privacy.html",
  "./terms.html",
  "./about.html",
  "./CogSpeed.jpeg",
  "./GMM FIREBIRD.png",
  "./brain-background.jpeg",
  "./gmm_firebird_intro_fast.gif",
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


self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
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
  // Only cache same-origin requests — do not cache external APIs (e.g. Nominatim geocoding).
  if (!req.url.startsWith(self.location.origin)) return;

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
