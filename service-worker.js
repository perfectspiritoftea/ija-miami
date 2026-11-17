/* Network first for updates; offline fallback for previously visited pages. */
const CACHE_NAME = 'ija-hub-v3-calendar-giving';
const LOCAL_ASSETS = [
  './','./index.html','./events.html','./donate.html','./events.json',
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
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
