self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('war-room-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/css/design-system.css',
        '/src/js/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});