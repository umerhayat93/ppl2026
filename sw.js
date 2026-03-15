// PPL 2026 Main Service Worker
const CACHE = 'ppl2026-v4';
const STATIC = ['/', '/index.html', '/manifest.json', '/firebase-messaging-sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});

// Fallback push handler (when firebase-messaging-sw.js is not active)
self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    const title = data.notification?.title || 'PPL 2026';
    const body  = data.notification?.body  || '';
    e.waitUntil(
      self.registration.showNotification(title, {
        body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
        tag: 'ppl-' + Date.now(), vibrate: [200, 100, 200]
      })
    );
  } catch(err) {}
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) { if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
