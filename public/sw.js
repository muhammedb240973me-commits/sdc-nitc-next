self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/mahabba-preview.jpg', // Uses your preview image as the notification icon
      badge: '/mahabba-preview.jpg',
      vibrate: [100, 50, 100],
      data: { url: 'https://sdcnitc.vercel.app/mahabba' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});