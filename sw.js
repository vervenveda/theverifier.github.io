/* The Verifier · offline application shell · v1.0.0
   Caches only same-origin application assets. News/feed responses remain in IndexedDB
   through the Local Browser Cloud and are not intercepted here. */
const CACHE_NAME = "the-verifier-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./assets/verifier-safety.js",
  "./assets/verifier-local-cloud.js",
  "./data/sources.json",
  "./apps/daily_digest_index.html",
  "./apps/global_news_digest_index.html",
  "./apps/live_news_index.html",
  "./apps/news_feed_index.html",
  "./apps/world_wire_index.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("the-verifier-shell-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    }))
  );
});
