const CACHE_NAME = "festival-gps-v57";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260513-22",
  "./app.js?v=20260513-22",
  "./base44-config.js",
  "./firebase-config.js",
  "./manifest.webmanifest?v=20260513-22",
  "./assets/edc-grid-map.jpg?v=20260513-1",
  "./assets/icon.svg?v=20260513-22",
  "./assets/apple-touch-icon.png?v=20260513-22",
  "./assets/icon-192.png?v=20260513-22",
  "./assets/icon-512.png?v=20260513-22"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isAppAsset = url.origin === self.location.origin && (
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/manifest.webmanifest")
  );

  if (isAppAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok && event.request.mode === "navigate") {
            throw new Error("Navigation fallback");
          }
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => (
          cached || caches.match("./index.html") || caches.match("./")
        )))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => (
      cached || fetch(event.request).then((response) => {
        if (event.request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
    ))
  );
});
