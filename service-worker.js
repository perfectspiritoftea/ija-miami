/* Network first for updates; offline fallback for previously visited pages. */
const CACHE_NAME = 'ija-hub-v5-cemetery-records';
const LOCAL_ASSETS = [
  './','./index.html','./events.html','./donate.html','./cemetery.html',
  './styles.css','./app.js','./calendar.js','./fundraising.js','./config.js',
  './zeffy-thermometer.html','./manifest.webmanifest',
  './assets/ija-symbol.svg','./assets/ija-icon-192.png','./assets/ija-icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ija-hub-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  // Never serve a pre-cached placeholder as a current event feed.
  if (new URL(event.request.url).pathname.endsWith('/events.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
