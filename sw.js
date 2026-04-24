// Keep RELEASE in sync with APP_REV_STAMP / DISPLAY_VERSION in app.js and the versioned app.js query in index.html.
const RELEASE = "699rev146";
const CACHE_NAME = `cogspeed-v${RELEASE}-shell-v${RELEASE}`;
const APP_SHELL = [
  "./",
  "./index.html",
  `./app.js?v=${RELEASE}`,
  "./manifest.json",
  "./privacy.html",
  "./terms.html",
  "./about.html",
  "./technical-overview-v92.html",
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
  "./gear6.png",
  "./scheduler-soft-chime.wav",
  "./surv01_jet1.jpeg",
  "./surv02_jet2.png",
  "./surv03_tank.png",
  "./surv04_cannon.png",
  "./surv05_ship.png",
  "./surv06_submarine.png",
  "./surv07_rocket.jpeg",
  "./surv08_missile_battery.png",
  "./surv09_spaceship1.png",
  "./surv10_spaceship2.png",
  "./surv11_helicopter.jpeg",
  "./surv12_rpg.png",
  "./mem01_triangle.png",
  "./mem02_bear.png",
  "./mem03_circle.png",
  "./mem04_lion.png",
  "./mem05_square.png",
  "./mem06_snake.png",
  "./mem07_apple.png",
  "./mem08_boat.png",
  "./mem09_banana.png",
  "./mem10_car.png",
  "./mem11_strawberry.png",
  "./mem12_airplane.png",
  "./scheduler-beep.wav",
  "./scheduler-double-beep.wav"
];


// Core shell assets must install atomically so the app can boot offline.
// Larger media assets are cached opportunistically so one missing file does not abort SW install.
const CORE_ASSETS = [
  "./",
  "./index.html",
  `./app.js?v=${RELEASE}`,
  "./manifest.json",
  "./privacy.html",
  "./terms.html",
  "./about.html",
  "./icon-192.png",
  "./icon-512.png"
];
const OPTIONAL_ASSETS = APP_SHELL.filter(url => !CORE_ASSETS.includes(url));

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.all(OPTIONAL_ASSETS.map(async url => {
      try {
        await cache.add(url);
      } catch (err) {
        // Optional asset failures must not abort SW install.
      }
    }));
  })());
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

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const resp = await fetch(req);
      if (resp && resp.ok) {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return resp;
    } catch (err) {
      if (req.mode === "navigate") {
        const fallback = await caches.match("./index.html");
        return fallback || fetch("./index.html");
      }
      return (await caches.match(req)) || Response.error();
    }
  })());
});