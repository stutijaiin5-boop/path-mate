const CACHE_NAME = 'goal-execution-v1';
const ASSETS = [
  '/',
  '/static/style.css',
  '/static/app.js',
  '/static/particles.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/reports') || url.pathname.startsWith('/export') || url.pathname.startsWith('/analytics') || url.pathname.startsWith('/actions') || url.pathname.startsWith('/calendar')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Goal Execution Reminder';
  const options = {
    body: data.body || 'Time to check your actions!',
    icon: '/static/icon.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
