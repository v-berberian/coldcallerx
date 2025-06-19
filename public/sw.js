const CACHE_NAME = "coldcall-x-v1";

// Only cache in production
const isProduction =
  location.hostname !== "localhost" && location.hostname !== "127.0.0.1";

self.addEventListener("install", function (event) {
  if (isProduction) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        // Only cache essential resources in production
        return cache.addAll(["/", "/manifest.json"]);
      })
    );
  }
});

self.addEventListener("fetch", function (event) {
  // Skip caching for development
  if (!isProduction) {
    return;
  }

  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip caching for Vite dev server resources
  if (
    event.request.url.includes("@vite") ||
    event.request.url.includes("@react-refresh") ||
    event.request.url.includes("localhost")
  ) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(function () {
        // If both cache and network fail, return a fallback
        return fetch(event.request);
      })
  );
});

self.addEventListener("activate", function (event) {
  if (isProduction) {
    event.waitUntil(
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});
