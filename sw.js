// Cache-first service worker for the app shell.
// Bump CACHE on releases to evict stale assets.

const CACHE = 'frosthaven-companion-v7';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',

  // app code
  './js/app.js',
  './js/store.js',
  './js/db.js',
  './js/dom.js',
  './js/snow.js',
  './js/commands.js',
  './js/history.js',
  './js/data/classes.js',
  './js/data/resources.js',
  './js/data/xp-thresholds.js',
  './js/views/select.js',
  './js/views/sheet.js',
  './js/views/retired.js',
  './js/views/notes-drawer.js',
  './js/views/actions-drawer.js',

  // icons + splash
  './icons/app/icon.svg',
  './icons/app/icon-180.svg',
  './icons/app/icon-maskable.svg',
  './icons/app/splash.svg',

  // self-hosted fonts
  './fonts/crimson-pro.woff2',
  './fonts/crimson-pro-italic.woff2',
  './fonts/im-fell-english.woff2',
  './fonts/im-fell-english-italic.woff2',
  './fonts/im-fell-english-sc.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Only intercept same-origin requests; everything we need is local now.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
