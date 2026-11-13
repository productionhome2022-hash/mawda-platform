/* Firebase Hosting injects the registered Web app configuration through /__/firebase/init.js. */
importScripts('/__/firebase/10.13.0/firebase-app-compat.js');
importScripts('/__/firebase/10.13.0/firebase-messaging-compat.js');
importScripts('/__/firebase/init.js');

if (firebase.apps.length > 0 && firebase.messaging) {
  firebase.messaging.isSupported().then((supported) => {
    if (!supported) return;
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || 'إشعار جديد من مودة';
      const options = {
        body: payload.notification?.body || 'لديك تحديث جديد. افتح مودة لمتابعته.',
        icon: '/icons/Icon-192.png',
        data: payload.data || {},
        tag: payload.data?.messageId || payload.data?.roomId || 'mawda-notification',
        renotify: false,
      };
      self.registration.showNotification(title, options);
    });
  }).catch((error) => {
    console.warn('Mawda background messaging is unavailable', error);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => 'focus' in client);
    if (existing) return existing.focus();
    return clients.openWindow('/');
  }));
});
