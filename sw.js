const CACHE_NAME = 'fy-orbit-v2'; // Updated to kill the old cache
const assets = [
  '/',
  '/index.html',
  '/auth/login.html',
  '/assets/img/icon.png'
];

// 1. Install Service Worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Forces this new worker to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// 2. Activate & Clean Up Old Caches (Kills ucc-v1)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetching Assets (NETWORK FIRST STRATEGY)
self.addEventListener('fetch', event => {
  // Ignore external API calls (like Firebase) so they don't break
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // Step 1: Try to get the absolute newest code from VS Code / Internet
    fetch(event.request)
      .then(networkResponse => {
        return networkResponse;
      })
      .catch(() => {
        // Step 2: If the network fails (offline), pull from the Cache
        return caches.match(event.request);
      })
  );
});