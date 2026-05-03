/**
 * Service Worker — L'Odyssée des Chiffres
 *
 * Stratégie : "cache first" pour les ressources connues, "network first" pour la
 * navigation (HTML), avec fallback offline minimal.
 *
 * v8.2.3 : corrige le bug de fallback qui faisait que TOUTES les pages servaient
 * index.html (rendant la page debug et certains liens inaccessibles).
 */
'use strict';

const CACHE_VERSION = 'v8.2.6';
const CACHE_NAME = `odyssee-${CACHE_VERSION}`;

// Ressources critiques précachées au premier chargement.
const CRITICAL_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/01-core.js',
  './js/02-data.js',
  './js/03-figurines-data.js',
  './js/04-questions.js',
  './js/05-profile.js',
  './js/06a-adaptive.js',
  './js/06b-time-block.js',
  './js/06c-seasonal.js',
  './js/06d-cinematics.js',
  './js/07-game.js',
  './js/08-ui.js',
  './js/09-parent.js',
  './js/10-figurines.js',
  './js/11-init.js',
];

// Ressources optionnelles (un 404 ne casse pas l'installation).
const OPTIONAL_URLS = [
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon-32.png',
  './assets/apple-touch-icon.png',
  './assets/portraits.svg',
  './assets/fonts/google-fonts.css',
];

// URLs jamais interceptées par le SW (debug, outils, etc.)
// Elles passent toujours en direct au réseau, sans cache.
const SW_BYPASS = [
  '/debug.html',
  '/debug',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(CRITICAL_URLS);
      } catch (err) {
        console.error('[SW] précache critique échec global, fallback unitaire :', err);
        for (const url of CRITICAL_URLS) {
          try { await cache.add(url); } catch (e) { console.warn('[SW] skip', url); }
        }
      }
      for (const url of OPTIONAL_URLS) {
        try {
          const resp = await fetch(url, { cache: 'no-cache' });
          if (resp && resp.ok) await cache.put(url, resp);
        } catch (e) { /* silencieux : optionnel */ }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('odyssee-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll({type:'window'}).then(clients => {
          clients.forEach(c => c.postMessage({type:'SW_UPDATED', version: CACHE_VERSION}));
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Hors de notre origine : on laisse passer (Google Fonts, CDN, etc.)
  if (url.origin !== self.location.origin) return;

  // Bypass total pour les URLs de debug — passent direct au réseau
  if (SW_BYPASS.some(p => url.pathname.endsWith(p))) {
    return; // ne pas appeler respondWith → comportement navigateur normal
  }

  // CORRECTIF v8.2.3 : pour la navigation (chargement de page HTML),
  // on fait NETWORK FIRST avec fallback cache. Évite le bug "tout pointe sur index.html".
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la page navigée si succès
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone)).catch(()=>{});
          }
          return response;
        })
        .catch(async () => {
          // Hors ligne : essaie d'abord la page exacte demandée dans le cache
          const cache = await caches.open(CACHE_NAME);
          const exact = await cache.match(request);
          if (exact) return exact;
          // Sinon retombe sur index.html UNIQUEMENT si la page demandée est l'app principale
          // (start_url, racine, ou index.html), pas pour /debug.html ou autre
          if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname.endsWith('/index.html')) {
            const idx = await cache.match('./index.html');
            if (idx) return idx;
          }
          // Sinon : 404 propre
          return new Response('Page non disponible hors ligne', {
            status: 404,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          });
        })
    );
    return;
  }

  // Pour les ressources (CSS, JS, images) : stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone()).catch(()=>{});
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({type:'SW_UPDATED', version: CACHE_VERSION});
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.source?.postMessage({type:'CACHE_CLEARED'}));
  }
});
