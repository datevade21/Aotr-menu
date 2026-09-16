const CACHE_NAME = 'cathub-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cho tải trực tiếp từ mạng, không can thiệp (Firestore cần mạng thật)
  event.respondWith(fetch(event.request));
});
