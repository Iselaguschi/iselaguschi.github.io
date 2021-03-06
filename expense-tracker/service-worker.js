var cacheName = 'weatherPWA-step-6-3';
var filesToCache = [
    'styles/inline.css',
    'index.html',
    'scripts/fk-expense-tracker-main.js'
];

/*
 * Service Worker gets installed.
 * */

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

/*
 * Service Worker is activated. Refreshes the Cache if a file has changed.
 * */

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

/*
 * Requests are sent to the service worker. If the worker has cached the file requested,
 * he returns it. Otherwise he returns the request.
 * */

self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
});