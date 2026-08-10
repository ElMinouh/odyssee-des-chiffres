// ─────────────────────────────────────────────────────────────────────
// Worker Cloudflare — « odyssee-chat »
// Messagerie fermée (contacts validés des deux côtés) pour L'Odyssée des Chiffres.
//
// Sécurité : chaque profil possède un CODE AMI public (id, partageable pour
// être ajouté) ET un SECRET privé (jamais partagé). Toutes les requêtes
// fournissent id + secret ; le Worker vérifie le couple avant d'autoriser.
// Partager son code ami ne donne donc jamais accès à ses messages.
//
// Binding attendu : env.DB  → base de données D1 (voir schema.sql).
//
// Audit fonctionnel (#16) : ajout de l'accusé de lecture. Nécessite la
// migration SQL fournie séparément (table `reads`) avant déploiement de ce
// fichier — sinon /msg/markread et le champ otherReadUpTo de /msg/fetch
// échoueront (table absente).
// ─────────────────────────────────────────────────────────────────────

// v2 (audit n°33) : liste blanche stricte au lieu de '*', alignée sur le
// Worker odyssee-sync — aucune raison objective d'être plus permissif ici.
const ALLOWED_ORIGINS = [
  'https://odyssee-des-chiffres.pages.dev',
  'http://localhost:8788',
];
function corsFor(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
const MAXLEN = 1000;

// v3 (ADR-56, méta-audit Lot 5, pt.2) : défense en profondeur — le filtre
// existait déjà côté client (17-messaging.js, _CHAT_BLOCKED_WORDS) mais un
// client modifié ou un appel direct à l'API le contournait totalement, faute
// de toute vérification serveur. Liste IDENTIQUE au client : si l'une des
// deux évolue, penser à répercuter le changement dans l'autre (pas de
// source unique possible entre un Worker et un fichier front séparés).
const BLOCKED_WORDS = [
  'con','connard','connasse','encul','merde','putain','salope','pute',
  'batard','bâtard','nique','niquer','pd','pédé','abruti','débile','crétin',
];
function containsBlockedWord(txt) {
  const norm = String(txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED_WORDS.some(w => norm.includes(w));
}

const json = (obj, status = 200, cors = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...cors } });

const convKey = (a, b) => [a, b].sort().join('|');

async function getUser(env, id) {
  return await env.DB.prepare('SELECT id,name,secret,avatar FROM users WHERE id=?').bind(id).first();
}
async function auth(env, id, secret) {
  if (!id || !secret) return null;
  const u = await getUser(env, id);
  return (u && u.secret === secret) ? u : null;
}
async function related(env, a, b) {
  return await env.DB.prepare('SELECT status FROM contacts WHERE a=? AND b=?').bind(a, b).first();
}

// v3 (correctif) : même bug corrigé qu'odyssee-sync (fenêtre à heure de départ
// fixe, ne se réinitialise plus à chaque requête). Seuil calibré pour la
// messagerie : le client sonde toutes les 4s par conversation ouverte
// (~15 req/min/conversation) + toutes les 25s pour les badges — 300/min
// couvre confortablement jusqu'à ~15 utilisateurs avec conversation ouverte
// derrière la même IP, tout en restant dissuasif contre un abus scripté.
// v4 (option B) : mêmes deux correctifs que odyssee-sync — échantillonnage
// des écritures KV (facteur ~50, pour rester très confortablement sous le
// quota gratuit de 1000 écritures/jour vu le sondage client toutes les 4s)
// et repli sûr si KV échoue (jamais de plantage du Worker pour cette raison).
const SAMPLE_RATE = 50;
async function rateLimited(env, ip, limit = 2000, windowSec = 60) {
 if (!ip || !env.RATELIMIT) return false; // binding absent : ne bloque pas (fail-open)
 const key = 'rl:' + ip;
 const now = Date.now();
 let win = null;
 try {
  const raw = await env.RATELIMIT.get(key);
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
   await env.RATELIMIT.put(key, JSON.stringify(win), { expirationTtl: windowSec * 2 });
  } catch (e) { /* échec d'écriture : on ne compte pas cette fois, on ne casse rien */ }
 }
 return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const CORS = corsFor(origin);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'method' }, 405, CORS);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    let limited = false;
    try { limited = await rateLimited(env, ip); } catch (e) { limited = false; }
    if (limited) return json({ error: 'rate_limited' }, 429, CORS);

    let body = {};
    try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400, CORS); }
    const path = new URL(request.url).pathname.replace(/\/+$/, '');

    try {
      switch (path) {
        case '/register':       return await register(env, body, CORS);
        case '/friend/request': return await friendRequest(env, body, CORS);
        case '/friend/list':    return await friendList(env, body, CORS);
        case '/friend/accept':  return await friendAccept(env, body, CORS);
        case '/friend/decline': return await friendDecline(env, body, CORS);
        case '/friend/remove':  return await friendRemove(env, body, CORS);
        case '/friend/block':   return await friendBlock(env, body, CORS);
        case '/friend/unblock': return await friendUnblock(env, body, CORS);
        case '/msg/send':       return await msgSend(env, body, CORS);
        case '/msg/fetch':      return await msgFetch(env, body, CORS);
        case '/msg/latest':     return await msgLatest(env, body, CORS);
        case '/msg/markread':   return await msgMarkRead(env, body, CORS);
        default:                return json({ error: 'not_found' }, 404, CORS);
      }
    } catch (e) {
      // v2 (audit n°36) : le détail de l'exception ne part plus au client
      // (risque de fuite d'implémentation) — seulement dans les Journaux
      // Workers (déjà activés côté dashboard), via console.error.
      console.error('[odyssee-chat] erreur serveur', e);
      return json({ error: 'server' }, 500, CORS);
    }
  },
};

// Enregistre (ou met à jour le prénom d') un profil de messagerie.
async function register(env, b, CORS) {
  const id = String(b.id || '').trim();
  const secret = String(b.secret || '').trim();
  const name = String(b.name || '').slice(0, 40);
  const avatar = String(b.avatar || '').slice(0, 8);
  if (id.length < 4 || secret.length < 8) return json({ error: 'invalid' }, 400, CORS);
  const existing = await getUser(env, id);
  if (existing) {
    if (existing.secret !== secret) return json({ error: 'taken' }, 403, CORS);
    await env.DB.prepare('UPDATE users SET name=?, avatar=? WHERE id=?').bind(name, avatar, id).run();
    return json({ ok: true, id, name, avatar }, 200, CORS);
  }
  await env.DB.prepare('INSERT INTO users (id,secret,name,avatar,created) VALUES (?,?,?,?,?)')
    .bind(id, secret, name, avatar, Date.now()).run();
  return json({ ok: true, id, name, avatar }, 200, CORS);
}

// Demande d'ami : « moi » demande le profil identifié par `code`.
async function friendRequest(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const code = String(b.code || '').trim();
  if (!code || code === me.id) return json({ error: 'invalid' }, 400, CORS);
  const target = await getUser(env, code); if (!target) return json({ error: 'no_such_code' }, 404, CORS);

  const fwd = await related(env, me.id, code);
  if (fwd && fwd.status === 'accepted') return json({ ok: true, status: 'accepted' }, 200, CORS);

  const now = Date.now();
  // Si la cible m'avait déjà demandé → acceptation automatique (validation des 2 côtés)
  const rev = await related(env, code, me.id);
  if (rev && rev.status === 'pending') {
    await env.DB.prepare("UPDATE contacts SET status='accepted' WHERE a=? AND b=?").bind(code, me.id).run();
    await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'accepted', ?) ON CONFLICT(a,b) DO UPDATE SET status='accepted'")
      .bind(me.id, code, now).run();
    return json({ ok: true, status: 'accepted' }, 200, CORS);
  }
  await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'pending', ?) ON CONFLICT(a,b) DO NOTHING")
    .bind(me.id, code, now).run();
  // v2 (audit n°34) : on ne renvoie plus name/avatar de la cible ici — cette
  // information n'est plus révélée qu'après acceptation effective, via
  // /friend/list (déjà correctement restreint à l'utilisateur authentifié).
  return json({ ok: true, status: 'pending' }, 200, CORS);
}

// Liste des contacts acceptés + demandes reçues (incoming) + envoyées (outgoing).
async function friendList(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const blk = (await env.DB.prepare('SELECT blocked FROM blocks WHERE blocker=?').bind(me.id).all()).results || [];
  const blockedSet = new Set(blk.map(r => r.blocked));
  const drop = arr => arr.filter(x => !blockedSet.has(x.id));
  const contacts = drop((await env.DB.prepare(
    "SELECT c.b AS id, u.name AS name, u.avatar AS avatar FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='accepted' ORDER BY u.name"
  ).bind(me.id).all()).results || []);
  const incoming = drop((await env.DB.prepare(
    "SELECT c.a AS id, u.name AS name, u.avatar AS avatar FROM contacts c JOIN users u ON u.id=c.a WHERE c.b=? AND c.status='pending' ORDER BY u.name"
  ).bind(me.id).all()).results || []);
  const outgoing = drop((await env.DB.prepare(
    "SELECT c.b AS id, u.name AS name, u.avatar AS avatar FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='pending' ORDER BY u.name"
  ).bind(me.id).all()).results || []);
  const blocked = (await env.DB.prepare(
    "SELECT bl.blocked AS id, u.name AS name, u.avatar AS avatar FROM blocks bl JOIN users u ON u.id=bl.blocked WHERE bl.blocker=? ORDER BY u.name"
  ).bind(me.id).all()).results || [];
  return json({ ok: true, contacts, incoming, outgoing, blocked }, 200, CORS);
}

// true si a a bloqué b, OU b a bloqué a (blocage dans un sens => silence des 2 côtés).
async function isBlocked(env, a, c) {
  const r = await env.DB.prepare('SELECT 1 FROM blocks WHERE (blocker=? AND blocked=?) OR (blocker=? AND blocked=?) LIMIT 1')
    .bind(a, c, c, a).first();
  return !!r;
}
async function friendBlock(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const other = String(b.other || '').trim();
  if (!other) return json({ error: 'invalid' }, 400, CORS);
  await env.DB.prepare('INSERT INTO blocks (blocker,blocked,ts) VALUES (?,?,?) ON CONFLICT(blocker,blocked) DO NOTHING')
    .bind(me.id, other, Date.now()).run();
  return json({ ok: true }, 200, CORS);
}
async function friendUnblock(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const other = String(b.other || '').trim();
  await env.DB.prepare('DELETE FROM blocks WHERE blocker=? AND blocked=?').bind(me.id, other).run();
  return json({ ok: true }, 200, CORS);
}

// Accepte une demande reçue de `from` (déclenché côté parent dans l'appli).
async function friendAccept(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const from = String(b.from || '').trim();
  const req = await related(env, from, me.id);
  if (!req || req.status !== 'pending') return json({ error: 'no_request' }, 404, CORS);
  const now = Date.now();
  await env.DB.prepare("UPDATE contacts SET status='accepted' WHERE a=? AND b=?").bind(from, me.id).run();
  await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'accepted', ?) ON CONFLICT(a,b) DO UPDATE SET status='accepted'")
    .bind(me.id, from, now).run();
  return json({ ok: true }, 200, CORS);
}

async function friendDecline(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const from = String(b.from || '').trim();
  await env.DB.prepare("DELETE FROM contacts WHERE a=? AND b=? AND status='pending'").bind(from, me.id).run();
  return json({ ok: true }, 200, CORS);
}

async function friendRemove(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const other = String(b.other || '').trim();
  await env.DB.prepare('DELETE FROM contacts WHERE (a=? AND b=?) OR (a=? AND b=?)').bind(me.id, other, other, me.id).run();
  return json({ ok: true }, 200, CORS);
}

// Envoi d'un message (uniquement vers un contact accepté).
async function msgSend(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const to = String(b.to || '').trim();
  const text = String(b.body || '').replace(/\s+$/, '').slice(0, MAXLEN);
  if (!text) return json({ error: 'empty' }, 400, CORS);
  if (containsBlockedWord(text)) return json({ error: 'blocked_word' }, 400, CORS);
  const rel = await related(env, me.id, to);
  if (!rel || rel.status !== 'accepted') return json({ error: 'not_contact' }, 403, CORS);
  if (await isBlocked(env, me.id, to)) return json({ error: 'blocked' }, 403, CORS);
  const ts = Date.now();
  const r = await env.DB.prepare('INSERT INTO messages (conv,sender,body,ts) VALUES (?,?,?,?)')
    .bind(convKey(me.id, to), me.id, text, ts).run();
  const mid = (r && r.meta && r.meta.last_row_id != null) ? r.meta.last_row_id : (r && r.lastRowId) || null;
  return json({ ok: true, id: mid, ts }, 200, CORS);
}

// Récupère les messages d'une conversation depuis l'id `since` (sondage).
async function msgFetch(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const withId = String(b.with || '').trim();
  const since = parseInt(b.since, 10) || 0;
  const rel = await related(env, me.id, withId);
  if (!rel || rel.status !== 'accepted') return json({ error: 'not_contact' }, 403, CORS);
  if (await isBlocked(env, me.id, withId)) return json({ ok: true, messages: [] }, 200, CORS);
  const rows = (await env.DB.prepare(
    'SELECT id,sender,body,ts FROM messages WHERE conv=? AND id>? ORDER BY id LIMIT 200'
  ).bind(convKey(me.id, withId), since).all()).results || [];
  // #16 (accusé de lecture) : jusqu'où l'AUTRE participant a lu cette
  // conversation, pour que l'expéditeur sache si SES messages ont été vus.
  const readRow = await env.DB.prepare(
    'SELECT upto, ts FROM reads WHERE conv=? AND reader=?'
  ).bind(convKey(me.id, withId), withId).first();
  return json({
    ok: true,
    messages: rows,
    otherReadUpTo: readRow ? readRow.upto : 0,
    otherReadTs: readRow ? readRow.ts : 0,
  }, 200, CORS);
}

// Dernier id de message par conversation (pour les badges « non lus »).
async function msgLatest(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const rows = (await env.DB.prepare(
    'SELECT conv, MAX(id) AS last FROM messages WHERE conv LIKE ? OR conv LIKE ? GROUP BY conv'
  ).bind(me.id + '|%', '%|' + me.id).all()).results || [];
  const latest = {};
  for (const r of rows) {
    const parts = String(r.conv).split('|');
    const other = parts[0] === me.id ? parts[1] : parts[0];
    latest[other] = r.last;
  }
  return json({ ok: true, latest }, 200, CORS);
}

// #16 (accusé de lecture) : marque la conversation avec `with` comme lue par
// moi jusqu'à l'id `upto`. N'écrase jamais un `upto` plus avancé déjà connu
// (MAX), au cas où deux requêtes arriveraient dans le désordre.
async function msgMarkRead(env, b, CORS) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401, CORS);
  const withId = String(b.with || '').trim();
  const upto = parseInt(b.upto, 10) || 0;
  const rel = await related(env, me.id, withId);
  if (!rel || rel.status !== 'accepted') return json({ error: 'not_contact' }, 403, CORS);
  const conv = convKey(me.id, withId);
  const ts = Date.now();
  await env.DB.prepare(
    'INSERT INTO reads (conv,reader,upto,ts) VALUES (?,?,?,?) ' +
    'ON CONFLICT(conv,reader) DO UPDATE SET upto=MAX(upto,excluded.upto), ts=excluded.ts'
  ).bind(conv, me.id, upto, ts).run();
  return json({ ok: true }, 200, CORS);
}
