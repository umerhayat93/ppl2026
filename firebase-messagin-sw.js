// firebase-messaging-sw.js
// Required for Firebase Cloud Messaging background notifications
// Must be at the ROOT of your site (same level as index.html)

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Same config as index.html ──
firebase.initializeApp({
  apiKey:            "AIzaSyDATjYYpyRmuEWbWMQlwAF7bjtVcIxCVxc",
  authDomain:        "ppl2206.firebaseapp.com",
  databaseURL:       "https://ppl2206-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "ppl2206",
  storageBucket:     "ppl2206.firebasestorage.app",
  messagingSenderId: "189867901536",
  appId:             "1:189867901536:web:3a9a95b9889c04bdacf905",
  measurementId:     "G-N48LR9DPL4"
});

const messaging = firebase.messaging();

// Handle background push messages (app is closed or in background)
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  const notifTitle = title || 'PPL 2026 Update';
  const notifBody  = body  || 'New update from Pattan Premier League';

  // Pick icon based on content
  let icon = 'icons/icon-192.png';
  let badge = 'icons/icon-192.png';

  self.registration.showNotification(notifTitle, {
    body:    notifBody,
    icon:    icon,
    badge:   badge,
    tag:     'ppl-update-' + Date.now(),
    vibrate: [200, 100, 200],
    data:    { url: '/' },
    actions: [
      { action: 'open',    title: '📱 Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// Also handle Firebase Realtime Database notification broadcast
// (for browsers that support it without FCM token)
self.addEventListener('push', event => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.notification?.title || data.title || 'PPL 2026';
    const body  = data.notification?.body  || data.body  || '';
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon:    'icons/icon-192.png',
        badge:   'icons/icon-192.png',
        tag:     'ppl-' + Date.now(),
        vibrate: [200, 100, 200],
        data:    { url: '/' }
      })
    );
  } catch(e) { console.error('Push parse error:', e); }
});
