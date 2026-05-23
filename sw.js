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

const CACHE_VERSION = 'v8.7.22';
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
  './js/12-cloud.js',
];

// Ressources optionnelles (un 404 ne casse pas l'installation).
const OPTIONAL_URLS = [
  // Icônes PWA et logos visuels (chantier v8.5.0)
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-192.png',
  './assets/icon-maskable-512.png',
  './assets/favicon-32.png',
  './assets/apple-touch-icon.png',
  './assets/logo-main.webp',
  './assets/logo-circle.webp',
  // Autres assets
  './assets/portraits.svg',
  './assets/fonts/google-fonts.css',
  // GIFs de fin de partie (chantier v8.4.0) — précachés pour fonctionnement offline
  './assets/gifs/ax_obelix.gif',
  './assets/gifs/bl_happydance.gif',
  './assets/gifs/cz_hyoga.gif',
  './assets/gifs/cz_lion.gif',
  './assets/gifs/cz_seiya.gif',
  './assets/gifs/cz_shiryu.gif',
  './assets/gifs/db_goku.gif',
  './assets/gifs/db_krilin.gif',
  './assets/gifs/db_tortue_geniale.gif',
  './assets/gifs/db_trunks.gif',
  './assets/gifs/db_vegeta.gif',
  './assets/gifs/dc_batman.gif',
  './assets/gifs/dr_krokmou.gif',
  './assets/gifs/dr_mains.gif',
  './assets/gifs/fr_cerf.gif',
  './assets/gifs/fr_elsa.gif',
  './assets/gifs/fr_olaf.gif',
  './assets/gifs/gd_actarus.gif',
  './assets/gifs/hp_harry_potter.gif',
  './assets/gifs/hp_hermione.gif',
  './assets/gifs/hp_ron_weasley.gif',
  './assets/gifs/kp_applause.gif',
  './assets/gifs/mc_tao.gif',
  './assets/gifs/mi_ladybug.gif',
  './assets/gifs/mk_donald.gif',
  './assets/gifs/mk_mickey.gif',
  './assets/gifs/mr_mario.gif',
  './assets/gifs/mv_hulk.gif',
  './assets/gifs/mv_ironman.gif',
  './assets/gifs/nj_danse.gif',
  './assets/gifs/ot_hyuga.gif',
  './assets/gifs/ot_tsubasa.gif',
  './assets/gifs/pj_victoire.gif',
  './assets/gifs/pk_pikachu.gif',
  './assets/gifs/sc_dance.gif',
  './assets/gifs/sm_lune.gif',
  './assets/gifs/sp_toutes.gif',
  './assets/gifs/sw_dark_vador.gif',
  './assets/gifs/sw_yoda.gif',
  './assets/gifs/tu_highfive.gif',
  './assets/gifs/zl_link.gif',
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

  // Pour les ressources (CSS, JS, images) :
  // - CSS et JS : NETWORK FIRST (toujours essayer la fraîcheur, fallback cache si offline)
  // - Images et autres : stale-while-revalidate (perf optimale, MAJ en arrière-plan)
  const pathname = url.pathname;
  const isCodeAsset = /\.(css|js|webmanifest|json)$/i.test(pathname);
  
  if (isCodeAsset) {
    // NETWORK FIRST : indispensable pour que les nouvelles versions soient
    // détectées immédiatement (résout les bugs de cache CSS/JS persistant).
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone)).catch(()=>{});
        }
        return response;
      }).catch(() =>
        caches.open(CACHE_NAME).then(c => c.match(request))
      )
    );
    return;
  }

  // STALE-WHILE-REVALIDATE pour images, fonts, etc.
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
