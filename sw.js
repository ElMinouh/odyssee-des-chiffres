/**
 * Service Worker — L'Odyssée des Chiffres
 *
 * Stratégie :
 *   - Au premier chargement, on met en cache l'app complète (HTML, CSS, JS, assets).
 *   - Aux visites suivantes : "cache first" pour servir instantanément, et la mise à jour
 *     se fait en arrière-plan ("stale-while-revalidate").
 *   - Hors ligne, l'app reste pleinement fonctionnelle (pas d'API distante critique).
 *
 * Pour forcer un rechargement complet après modification : changer CACHE_VERSION.
 */
'use strict';

const CACHE_VERSION = 'v7.5.0'; // chantier B4 skin de zone pendant la partie
const CACHE_NAME = `odyssee-${CACHE_VERSION}`;

// Ressources à mettre en cache au premier chargement (squelette de l'app).
// Les portraits SVG (sprite) sont chargés ici aussi : leur taille est < 500 ko.
const PRECACHE_URLS = [
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
  './assets/portraits.svg',
  './assets/icon.svg',
'./assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/fonts/google-fonts.css',
  './assets/fonts/nunito-400.woff2',
  './assets/fonts/nunito-600.woff2',
  './assets/fonts/nunito-700.woff2',
  './assets/fonts/nunito-900.woff2',
  './assets/fonts/cinzeldecorative-700.woff2',
];

// ── Installation : pré-cache des fichiers de base ──────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activation : nettoyage des anciens caches ──────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('odyssee-') && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        // Chantier A1 : prévenir tous les clients qu'une nouvelle version est active
        self.clients.matchAll({type:'window'}).then(clients => {
          clients.forEach(c => c.postMessage({type:'SW_UPDATED', version: CACHE_VERSION}));
        });
      })
  );
});

// ── Fetch : stale-while-revalidate ────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // On ne cache que les requêtes GET de notre origine.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Polices Google, GIFs Giphy, etc. : laisser passer sans intercepter.
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          // On ne cache que les réponses 200 OK.
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => cached); // hors ligne : retomber sur le cache.
        // On retourne le cache immédiatement s'il existe, sinon on attend le réseau.
        return cached || networkFetch;
      })
    )
  );
});

// ── Message : permettre au client de forcer un skipWaiting ou obtenir la version
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({type:'SW_UPDATED', version: CACHE_VERSION});
  }
});