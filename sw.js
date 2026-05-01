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
 *
 * Chantier hotfix v8.2.1 :
 *   - Précache résilient : si une URL est absente (404), le SW continue au lieu de planter
 *   - Liste de précache nettoyée (suppression des URLs fantômes qui causaient ERR_FAILED)
 */
'use strict';

const CACHE_VERSION = 'v8.2.1'; // hotfix précache résilient
const CACHE_NAME = `odyssee-${CACHE_VERSION}`;

// Ressources critiques à mettre en cache au premier chargement.
// IMPORTANT : seuls les fichiers vraiment essentiels au boot. Les autres sont cachés
// à la volée par la stratégie stale-while-revalidate au premier accès.
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

// Ressources optionnelles : si elles existent, on les cache. Si elles renvoient 404,
// on continue sans planter. C'est CRUCIAL pour ne pas casser l'installation du SW.
const OPTIONAL_URLS = [
  './assets/icon.svg',
  './assets/favicon-32.png',
  './assets/apple-touch-icon.png',
  './assets/portraits.svg',
  './assets/fonts/google-fonts.css',
];

// ── Installation : pré-cache résilient ─────────────────────────────
// On cache les URLs critiques en mode strict (échec = échec installation),
// et les URLs optionnelles en mode "best effort" (un 404 ne casse rien).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // Étape 1 : URLs critiques — toutes obligatoires
        try {
          await cache.addAll(CRITICAL_URLS);
          console.info('[SW] précache critique OK');
        } catch (err) {
          console.error('[SW] précache critique ÉCHEC :', err);
          // On ne plante pas pour autant — on cache une par une pour identifier
          // celle qui pose problème et garder les autres
          for (const url of CRITICAL_URLS) {
            try { await cache.add(url); }
            catch (e) { console.warn('[SW] impossible de cacher', url, e); }
          }
        }
        // Étape 2 : URLs optionnelles — un 404 est silencieusement ignoré
        for (const url of OPTIONAL_URLS) {
          try {
            const resp = await fetch(url, { cache: 'no-cache' });
            if (resp && resp.ok) {
              await cache.put(url, resp);
            }
          } catch (e) {
            // Silence : URL optionnelle absente, ce n'est pas grave
          }
        }
      })
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

// ── Fetch : stale-while-revalidate avec fallback réseau ────────────
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
            cache.put(request, response.clone()).catch(()=>{});
          }
          return response;
        }).catch(() => {
          // Hors ligne : retomber sur le cache si dispo.
          // Pour la navigation HTML : retomber sur index.html en dernier recours
          // (évite l'écran ERR_FAILED quand l'app est installée et offline).
          if (cached) return cached;
          if (request.mode === 'navigate' || request.destination === 'document') {
            return cache.match('./index.html');
          }
          // Pas de fallback : laisser passer l'erreur réseau
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
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
  // Nouveau : permettre au client de forcer un nettoyage complet (debug/recovery)
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => event.source?.postMessage({type:'CACHE_CLEARED'}));
  }
});
