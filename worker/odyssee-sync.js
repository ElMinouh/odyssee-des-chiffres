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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
 if (code.length < 4 || code.length > 40) return false;
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
async function rateLimited(env, ip, limit = 1000, windowSec = 60) {
 if (!ip) return false; // pas d'IP connue : on ne bloque pas (fail-open)
 const key = 'rl:' + ip;
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
   try { limited = await rateLimited(env, ip); } catch (e) { limited = false; }
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
     } catch (e) { }
    }
    payload._syncedAt = Date.now();
    await env.PROFILES.put(key, JSON.stringify(payload));
    return new Response(JSON.stringify({ status: 'ok', syncedAt: payload._syncedAt }), {
     headers: { ...cors, 'Content-Type': 'application/json' },
    });
   }
   // v2 (audit n°30) : l'endpoint DELETE public a été retiré — le client ne
   // l'a jamais appelé (vérifié dans tout le code de l'app), et il permettait
   // à quiconque connaissant un code de supprimer définitivement un profil
   // avec aussi peu de preuve qu'une simple lecture. La "suppression de
   // profil" côté parent n'a jamais touché aux données cloud ; ce retrait n'a
   // donc aucun impact fonctionnel.
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