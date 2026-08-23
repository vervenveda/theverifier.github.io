/* The Verifier · offline application shell · v1.2.0
   Caches same-origin application code and stable directory data.
   Generated news JSON is deliberately network-first and is NOT cache-first here;
   user editions/history live in IndexedDB through the Local Browser Cloud. */
const CACHE_NAME = "the-verifier-shell-v3";
const SHELL = [
  "./",
  "./index.html",
  "./assets/verifier-safety.js",
  "./assets/verifier-local-cloud.js",
  "./assets/verifier-news-data.js",
  "./data/sources.json",
  "./apps/daily_digest_index.html",
  "./apps/Modern_News_Engine_index.html",
  "./apps/global_news_digest_index.html",
  "./apps/interactive_news_index.html",
  "./apps/education_news_index.html",
  "./apps/kids_news_network_index.html",
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
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("the-verifier-shell-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Generated current-news data must not become stale because of a cache-first shell.
  // If the network is unavailable, the apps fall back to IndexedDB editions/history.
  if (url.pathname.includes("/data/generated/")) return;

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
