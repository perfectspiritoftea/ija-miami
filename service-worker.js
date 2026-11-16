const CACHE_NAME = 'ija-hub-v2-minimal';
const LOCAL_ASSETS = ['./','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest','./assets/ija-symbol.svg','./assets/ija-icon-192.png','./assets/ija-icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ija-hub-') && key !== CACHE_NAME).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(fetch(event.request).then(response => {if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy)); } return response; }).catch(() => caches.match(event.request)));
});
