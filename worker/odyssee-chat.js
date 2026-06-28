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
// ─────────────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const MAXLEN = 1000;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const convKey = (a, b) => [a, b].sort().join('|');

async function getUser(env, id) {
  return await env.DB.prepare('SELECT id,name,secret FROM users WHERE id=?').bind(id).first();
}
async function auth(env, id, secret) {
  if (!id || !secret) return null;
  const u = await getUser(env, id);
  return (u && u.secret === secret) ? u : null;
}
async function related(env, a, b) {
  return await env.DB.prepare('SELECT status FROM contacts WHERE a=? AND b=?').bind(a, b).first();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'method' }, 405);

    let body = {};
    try { body = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
    const path = new URL(request.url).pathname.replace(/\/+$/, '');

    try {
      switch (path) {
        case '/register':       return await register(env, body);
        case '/friend/request': return await friendRequest(env, body);
        case '/friend/list':    return await friendList(env, body);
        case '/friend/accept':  return await friendAccept(env, body);
        case '/friend/decline': return await friendDecline(env, body);
        case '/friend/remove':  return await friendRemove(env, body);
        case '/msg/send':       return await msgSend(env, body);
        case '/msg/fetch':      return await msgFetch(env, body);
        case '/msg/latest':     return await msgLatest(env, body);
        default:                return json({ error: 'not_found' }, 404);
      }
    } catch (e) {
      return json({ error: 'server', detail: String((e && e.message) || e) }, 500);
    }
  },
};

// Enregistre (ou met à jour le prénom d') un profil de messagerie.
async function register(env, b) {
  const id = String(b.id || '').trim();
  const secret = String(b.secret || '').trim();
  const name = String(b.name || '').slice(0, 40);
  if (id.length < 4 || secret.length < 8) return json({ error: 'invalid' }, 400);
  const existing = await getUser(env, id);
  if (existing) {
    if (existing.secret !== secret) return json({ error: 'taken' }, 403);
    await env.DB.prepare('UPDATE users SET name=? WHERE id=?').bind(name, id).run();
    return json({ ok: true, id, name });
  }
  await env.DB.prepare('INSERT INTO users (id,secret,name,created) VALUES (?,?,?,?)')
    .bind(id, secret, name, Date.now()).run();
  return json({ ok: true, id, name });
}

// Demande d'ami : « moi » demande le profil identifié par `code`.
async function friendRequest(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const code = String(b.code || '').trim();
  if (!code || code === me.id) return json({ error: 'invalid' }, 400);
  const target = await getUser(env, code); if (!target) return json({ error: 'no_such_code' }, 404);

  const fwd = await related(env, me.id, code);
  if (fwd && fwd.status === 'accepted') return json({ ok: true, status: 'accepted' });

  const now = Date.now();
  // Si la cible m'avait déjà demandé → acceptation automatique (validation des 2 côtés)
  const rev = await related(env, code, me.id);
  if (rev && rev.status === 'pending') {
    await env.DB.prepare("UPDATE contacts SET status='accepted' WHERE a=? AND b=?").bind(code, me.id).run();
    await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'accepted', ?) ON CONFLICT(a,b) DO UPDATE SET status='accepted'")
      .bind(me.id, code, now).run();
    return json({ ok: true, status: 'accepted' });
  }
  await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'pending', ?) ON CONFLICT(a,b) DO NOTHING")
    .bind(me.id, code, now).run();
  return json({ ok: true, status: 'pending', name: target.name });
}

// Liste des contacts acceptés + demandes reçues (incoming) + envoyées (outgoing).
async function friendList(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const contacts = (await env.DB.prepare(
    "SELECT c.b AS id, u.name AS name FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='accepted' ORDER BY u.name"
  ).bind(me.id).all()).results || [];
  const incoming = (await env.DB.prepare(
    "SELECT c.a AS id, u.name AS name FROM contacts c JOIN users u ON u.id=c.a WHERE c.b=? AND c.status='pending' ORDER BY u.name"
  ).bind(me.id).all()).results || [];
  const outgoing = (await env.DB.prepare(
    "SELECT c.b AS id, u.name AS name FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='pending' ORDER BY u.name"
  ).bind(me.id).all()).results || [];
  return json({ ok: true, contacts, incoming, outgoing });
}

// Accepte une demande reçue de `from` (déclenché côté parent dans l'appli).
async function friendAccept(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const from = String(b.from || '').trim();
  const req = await related(env, from, me.id);
  if (!req || req.status !== 'pending') return json({ error: 'no_request' }, 404);
  const now = Date.now();
  await env.DB.prepare("UPDATE contacts SET status='accepted' WHERE a=? AND b=?").bind(from, me.id).run();
  await env.DB.prepare("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'accepted', ?) ON CONFLICT(a,b) DO UPDATE SET status='accepted'")
    .bind(me.id, from, now).run();
  return json({ ok: true });
}

async function friendDecline(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const from = String(b.from || '').trim();
  await env.DB.prepare("DELETE FROM contacts WHERE a=? AND b=? AND status='pending'").bind(from, me.id).run();
  return json({ ok: true });
}

async function friendRemove(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const other = String(b.other || '').trim();
  await env.DB.prepare('DELETE FROM contacts WHERE (a=? AND b=?) OR (a=? AND b=?)').bind(me.id, other, other, me.id).run();
  return json({ ok: true });
}

// Envoi d'un message (uniquement vers un contact accepté).
async function msgSend(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const to = String(b.to || '').trim();
  const text = String(b.body || '').replace(/\s+$/, '').slice(0, MAXLEN);
  if (!text) return json({ error: 'empty' }, 400);
  const rel = await related(env, me.id, to);
  if (!rel || rel.status !== 'accepted') return json({ error: 'not_contact' }, 403);
  const ts = Date.now();
  const r = await env.DB.prepare('INSERT INTO messages (conv,sender,body,ts) VALUES (?,?,?,?)')
    .bind(convKey(me.id, to), me.id, text, ts).run();
  const mid = (r && r.meta && r.meta.last_row_id != null) ? r.meta.last_row_id : (r && r.lastRowId) || null;
  return json({ ok: true, id: mid, ts });
}

// Récupère les messages d'une conversation depuis l'id `since` (sondage).
async function msgFetch(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const withId = String(b.with || '').trim();
  const since = parseInt(b.since, 10) || 0;
  const rel = await related(env, me.id, withId);
  if (!rel || rel.status !== 'accepted') return json({ error: 'not_contact' }, 403);
  const rows = (await env.DB.prepare(
    'SELECT id,sender,body,ts FROM messages WHERE conv=? AND id>? ORDER BY id LIMIT 200'
  ).bind(convKey(me.id, withId), since).all()).results || [];
  return json({ ok: true, messages: rows });
}

// Dernier id de message par conversation (pour les badges « non lus »).
async function msgLatest(env, b) {
  const me = await auth(env, b.id, b.secret); if (!me) return json({ error: 'auth' }, 401);
  const rows = (await env.DB.prepare(
    'SELECT conv, MAX(id) AS last FROM messages WHERE conv LIKE ? OR conv LIKE ? GROUP BY conv'
  ).bind(me.id + '|%', '%|' + me.id).all()).results || [];
  const latest = {};
  for (const r of rows) {
    const parts = String(r.conv).split('|');
    const other = parts[0] === me.id ? parts[1] : parts[0];
    latest[other] = r.last;
  }
  return json({ ok: true, latest });
}
