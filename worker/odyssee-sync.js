// ─────────────────────────────────────────────────────────────────────
// Worker Cloudflare — « odyssee-sync »
// Sauvegarde cloud des profils (KV, une clé = un profil, code d'accès haché).
//
// Rapatrié dans ce dépôt le 2026-09-21 (audit AUD-01-002) : ce fichier n'était
// jusqu'ici versionné nulle part, seulement déployé à la main depuis le
// dashboard Cloudflare — angle mort de traçabilité pour le composant qui
// manipule le plus de données personnelles d'enfants. Récupéré tel quel via
// l'API Cloudflare (GET /workers/scripts/odyssee-sync), aucune modification.
// Binding attendu : env.PROFILES → KV namespace "odyssee-profiles" (partagé
// avec odyssee-chat, qui l'utilise uniquement pour son propre rate-limit).
// ─────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
 'https://odyssee-des-chiffres.pages.dev',
 'http://localhost:8788',
];

function corsHeaders(origin) {
 const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
 return {
  'Access-Control-Allow-Origin': allowed,
  // v7 (audit sécurité AUD-06-003) : DELETE ajouté — voir plus bas, route de
  // suppression réintroduite (retirée sous AUD-01-002 faute d'usage légitime
  // à l'époque) pour donner un moyen d'effacement RGPD, authentifiée par le
  // même `code` que GET/POST (pas plus de surface d'attaque que l'existant).
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Player-Code',
  'Access-Control-Max-Age': '86400',
 };
}

async function hashCode(code) {
 const buf = new TextEncoder().encode(code);
 const hash = await crypto.subtle.digest('SHA-256', buf);
 return Array.from(new Uint8Array(hash))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
}

function isValidCode(code) {
 if (typeof code !== 'string') return false;
 // AUD-06-008 (audit sécurité 2026-09-25) : seuil relevé de 4 à 8 — aucun code
 // réel généré côté client (generateCloudCode(), js/12-cloud.js) n'est jamais
 // plus court que ça (nom réduit à 1 caractère + '-' + 6 caractères
 // aléatoires CSPRNG). Un seuil plus permissif que le format réel n'ouvre
 // aucune fonctionnalité légitime, seulement une entropie inutilement faible
 // en cas d'appel API hors client officiel. Miroir exact de isValidCloudCode()
 // côté client (js/12-cloud.js) — garder les deux synchronisés.
 if (code.length < 8 || code.length > 40) return false;
 return /^[A-Z0-9-]+$/i.test(code);
}

function isValidProfile(p) {
 return p && typeof p === 'object'
  && typeof p.name === 'string'
  && typeof p.xp === 'number'
  && p.xp >= 0 && p.xp < 100000000
  && JSON.stringify(p).length < 200000;
}

// v5 (option B) : le plan KV gratuit est plafonné à 1000 écritures/jour — en
// écrivant à CHAQUE requête acceptée, un usage intensif normal (plusieurs
// enfants, synchro régulière) pouvait épuiser ce quota, et une écriture KV en
// échec aurait alors fait planter le Worker entier (erreur 500) jusqu'au
// lendemain minuit UTC. Deux correctifs :
//  1) Échantillonnage : on n'écrit qu'1 fois sur SAMPLE_RATE en moyenne, en
//     incrémentant alors le compteur de SAMPLE_RATE d'un coup (estimation non
//     biaisée). Réduit les écritures d'un facteur ~50, largement sous le
//     quota même en usage intensif. Le seuil réel appliqué a une précision de
//     ±SAMPLE_RATE — négligeable vu le seuil (1000/min).
//  2) Repli sûr (try/catch) : si KV échoue quand même (quota épuisé pour
//     d'autres raisons, panne temporaire...), on n'écrit/relit simplement pas
//     cette fois — on ne bloque JAMAIS le Worker à cause d'une erreur KV.
const SAMPLE_RATE = 50;
// v6 (audit performances AUD-07-008) : généralisée à une clé quelconque, comme
// pour odyssee-chat.js — permet d'ajouter une limite par CODE en plus de
// celle par IP (une IP partagée, ex. établissement scolaire, ne doit pas faire
// échouer la synchro de tout un groupe d'utilisateurs légitimes).
async function rateLimited(env, key, limit = 1000, windowSec = 60) {
 if (!key) return false; // pas de clé connue : on ne bloque pas (fail-open)
 const now = Date.now();
 let win = null;
 try {
  const raw = await env.PROFILES.get(key);
  win = raw ? JSON.parse(raw) : null;
 } catch (e) { win = null; }
 if (!win || (now - win.start) >= windowSec * 1000) {
  win = { start: now, count: 0 };
 }
 if (win.count >= limit) {
  return true;
 }
 if (Math.random() < 1 / SAMPLE_RATE) {
  win.count += SAMPLE_RATE;
  try {
   await env.PROFILES.put(key, JSON.stringify(win), { expirationTtl: windowSec * 2 });
  } catch (e) { /* échec d'écriture : on ne compte pas cette fois, on ne casse rien */ }
 }
 return false;
}

export default {
 async fetch(request, env) {
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin);
  if (request.method === 'OPTIONS') {
   return new Response(null, { status: 204, headers: cors });
  }

  // v6 (audit performances #4) : toute la logique métier est désormais
  // enveloppée dans un try/catch global — jusqu'ici absent de ce Worker,
  // contrairement à odyssee-chat qui l'avait déjà (audit n°36). Sans ce
  // filet, une exception (ex. écriture KV en échec car quota de 1000
  // écritures/jour dépassé) remontait telle quelle hors du handler fetch(),
  // et Cloudflare renvoyait alors une erreur générique de plateforme au lieu
  // du JSON {error:...} propre que le reste de l'API renvoie partout
  // ailleurs. Le comportement métier est strictement identique ; seule la
  // gestion de l'échec change.
  try {
   const ip = request.headers.get('CF-Connecting-IP') || '';
   let limited = false;
   try { limited = await rateLimited(env, 'rl:' + ip); } catch (e) { limited = false; }
   if (limited) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
     status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   const url = new URL(request.url);
   const path = url.pathname;
   if (path === '/' || path === '/health') {
    return new Response(JSON.stringify({ ok: true, version: 'v1.0.0' }), {
     headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   if (request.method === 'GET' && path.startsWith('/profile/')) {
    const code = decodeURIComponent(path.slice(9));
    if (!isValidCode(code)) {
     return new Response(JSON.stringify({ error: 'invalid_code' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    const key = await hashCode(code);
    // v6 (audit performances AUD-07-008) : limite complémentaire par code, en
    // plus de celle par IP — une IP scolaire partagée ne doit pas bloquer la
    // synchro de tous les profils qui la partagent légitimement.
    if (await rateLimited(env, 'rlacct:' + key, 120, 60)) {
     return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    const data = await env.PROFILES.get(key);
    if (!data) {
     return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    return new Response(data, {
     headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   if (request.method === 'POST' && path.startsWith('/profile/')) {
    const code = decodeURIComponent(path.slice(9));
    if (!isValidCode(code)) {
     return new Response(JSON.stringify({ error: 'invalid_code' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    let payload;
    try { payload = await request.json(); }
    catch (e) {
     return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    if (!isValidProfile(payload)) {
     return new Response(JSON.stringify({ error: 'invalid_profile' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    const key = await hashCode(code);
    if (await rateLimited(env, 'rlacct:' + key, 120, 60)) {
     return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    const existing = await env.PROFILES.get(key);
    if (existing) {
     try {
      const old = JSON.parse(existing);
      // v6 (audit performances #5) : Cloudflare KV est "eventually
      // consistent" — une écriture peut mettre jusqu'à 60 secondes à se
      // propager à l'ensemble du réseau Cloudflare. Cette lecture peut donc,
      // dans de rares cas (deux appareils synchronisant depuis deux régions
      // différentes à quelques secondes d'écart), ne pas refléter la toute
      // dernière écriture connue ailleurs — risque théorique de "lost
      // update" sur la résolution de conflit ci-dessous. Risque accepté et
      // documenté plutôt que corrigé : une cohérence forte (migration vers
      // Durable Objects) serait disproportionnée pour un usage familial, où
      // deux synchronisations à moins d'une minute d'écart exact restent
      // rares. À reconsidérer uniquement si une vraie perte de progression
      // est un jour rapportée.
      if ((old.xp || 0) > (payload.xp || 0)) {
       return new Response(JSON.stringify({ status: 'conflict_kept_server', profile: old }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
       });
      }
     } catch (e) {
      // v2 (audit performances AUD-07-015) : un profil KV corrompu (JSON
      // invalide) tombait silencieusement dans l'écrasement inconditionnel
      // ci-dessous, sans aucune trace de la corruption détectée — invisible
      // dans les Journaux Workers, aucun moyen de savoir qu'un incident a eu
      // lieu. Le comportement (écraser quand même) reste inchangé.
      console.error('[odyssee-sync] profil KV corrompu (JSON.parse a échoué), écrasement quand même', key, e);
     }
    }
    payload._syncedAt = Date.now();
    await env.PROFILES.put(key, JSON.stringify(payload));
    return new Response(JSON.stringify({ status: 'ok', syncedAt: payload._syncedAt }), {
     headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   // v7 (audit sécurité AUD-06-003) : DELETE réintroduit — v2 (audit n°30)
   // l'avait retiré car aucun appelant légitime n'existait alors ET connaître
   // un code suffisait à supprimer définitivement, "aussi peu de preuve
   // qu'une simple lecture". Ce risque n'a pas changé (le code EST le seul
   // facteur d'authentification de tout ce Worker, comme pour GET/POST) —
   // mais son absence totale laissait les familles sans AUCUN moyen légitime
   // d'effacer leurs données une fois synchronisées (constat AUD-06-003,
   // droit à l'effacement RGPD). Appelée par _pmConfirmDelete() côté client
   // (js/09-parent.js, via cloudDeleteProfile(), js/12-cloud.js) avant la
   // purge locale d'un profil.
   if (request.method === 'DELETE' && path.startsWith('/profile/')) {
    const code = decodeURIComponent(path.slice(9));
    if (!isValidCode(code)) {
     return new Response(JSON.stringify({ error: 'invalid_code' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
     });
    }
    const key = await hashCode(code);
    await env.PROFILES.delete(key);
    return new Response(JSON.stringify({ status: 'ok' }), {
     headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   return new Response(JSON.stringify({ error: 'not_found' }), {
    status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
   });
  } catch (e) {
   // v6 (audit performances #4) : le détail de l'exception ne part pas au
   // client (cohérent avec odyssee-chat) — seulement dans les Journaux
   // Workers (déjà activés côté dashboard), via console.error.
   console.error('[odyssee-sync] erreur serveur', e);
   return new Response(JSON.stringify({ error: 'server' }), {
    status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
   });
  }
 },
};