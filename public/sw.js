// Service Worker para Colibri Arroyo Seco Dashboard
const CACHE_NAME = 'colibri-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/App.css',
  '/colors.css',
  '/index.css'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', event => {
  // No cachear requests POST/PUT/DELETE
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Devolver del cache si existe
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        // No cachear respuestas inválidas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Usar página offline si está disponible
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/colibri.png',
    badge: '/colibri.png',
    tag: 'colibri-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Colibri Arroyo Seco', options)
  );
});

// Notificación click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
