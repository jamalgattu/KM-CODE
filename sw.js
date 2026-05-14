// KM Code Service Worker — v3
// Relative paths: works at / (Cloudflare Pages) and /KM-CODE/ (GitHub Pages).
const CACHE = "km-code-v3";
const BASE = self.registration.scope; // e.g. "/" or "/KM-CODE/"

// Pre-cache just the shell. Static assets get cached lazily on first request.
const PRECACHE = [BASE, BASE + "manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => {
      return Promise.allSettled(PRECACHE.map((url) => c.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Never intercept Judge0 or any external API calls
  if (!url.pathname.startsWith(new URL(BASE).pathname)) return;

  // Navigation requests (page loads): network-first so updates ship immediately
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((r) => {
          // Cache the fresh HTML
          if (r.ok) caches.open(CACHE).then((c) => c.put(request, r.clone()));
          return r;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match(BASE) || caches.match(BASE + "index.html")
          )
        )
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): cache-first
  if (/\.(js|css|woff2?|ttf|png|svg|ico|jpg|jpeg|webp|json)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((r) => {
          if (r.ok) {
            const clone = r.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return r;
        });
      })
    );
  }
});
