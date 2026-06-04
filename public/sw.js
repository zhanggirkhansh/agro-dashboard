const CACHE_NAME = "westkazagro-v1";

// Статика которую кешируем при установке
const PRECACHE_URLS = ["/", "/livestock", "/batches", "/analytics"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Только GET, только свой origin
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // API-запросы к Supabase — только сеть, без кеша
  if (url.hostname.includes("supabase")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Кешируем успешные ответы на статику
        if (response.ok && (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/favicon"))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
