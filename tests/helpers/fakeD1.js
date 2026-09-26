// Mock minimal, en mémoire, de l'API D1 (env.DB.prepare(sql).bind(...).run()/
// .all()/.first()) utilisée par worker/odyssee-chat.js. Ne couvre QUE les
// requêtes SQL réellement présentes dans ce fichier (users, contacts,
// messages) — pas un moteur SQL générique. Sert de première brique de test
// pour ce Worker, qui n'en avait aucun (AUD-01, section C7) : à étendre au
// fil des prochains lots qui le touchent, plutôt que de le récrire à chaque
// fois.
export function makeFakeD1() {
  const users = new Map(); // id -> {id,secret,name,avatar,disabled,created}
  const contacts = []; // {a,b,status,created}
  const messages = []; // {id,conv,sender,body,ts,tmp_id}
  const reads = []; // {conv,reader,upto,ts}
  // AUD-07-010 (audit performances 2026-09-26) : résumé "dernier message par
  // conversation" par participant — tenu par msgSend(), lu par msgLatest()
  // (remplace le scan LIKE sur `messages` que ce mock imitait auparavant).
  const convSummary = new Map(); // conv -> {conv,participant_a,participant_b,last_id,last_ts}
  let nextMsgId = 1;

  function findContact(a, b) {
    return contacts.find(c => c.a === a && c.b === b);
  }

  function prepare(sql) {
    const s = sql.replace(/\s+/g, ' ').trim();
    return {
      bind(...args) {
        return {
          async first() {
            if (s.startsWith('SELECT id,name,secret,avatar FROM users WHERE id=?')) {
              const [id] = args;
              return users.has(id) ? { ...users.get(id) } : null;
            }
            if (s.startsWith('SELECT status FROM contacts WHERE a=? AND b=?')) {
              const [a, b] = args;
              const c = findContact(a, b);
              return c ? { status: c.status } : null;
            }
            // AUD-07-010 : weekCount interroge désormais `conv IN (?,?,...)`
            // (liste des conv de l'appelant, connue via conv_summary) au lieu
            // du LIKE — nombre de `?` variable, d'où la regex plutôt qu'un
            // startsWith figé.
            if (/^SELECT COUNT\(\*\) AS c FROM messages WHERE conv IN \(/.test(s)) {
              const since = args[args.length - 1];
              const convs = new Set(args.slice(0, -1));
              const c = messages.filter(m => convs.has(m.conv) && m.ts >= since).length;
              return { c };
            }
            // AUD-07-006 : détection d'un renvoi (idempotence) — un message
            // déjà inséré avec ce (sender, tmp_id) ne doit pas être dupliqué.
            if (s.startsWith('SELECT id, ts FROM messages WHERE sender=? AND tmp_id=?')) {
              const [sender, tmpId] = args;
              const m = messages.find(x => x.sender === sender && x.tmp_id === tmpId);
              return m ? { id: m.id, ts: m.ts } : null;
            }
            return null;
          },
          async all() {
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='accepted'")) {
              const [a] = args;
              // AUD-02-047 : c.created (date d'acceptation) exposé pour le calcul des
              // "nouveaux amis de la semaine" côté client.
              return { results: contacts.filter(c => c.a === a && c.status === 'accepted').map(c => ({ id: c.b, ...userView(c.b), created: c.created })) };
            }
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.a WHERE c.b=? AND c.status='pending'")) {
              const [b] = args;
              return { results: contacts.filter(c => c.b === b && c.status === 'pending').map(c => ({ id: c.a, ...userView(c.a) })) };
            }
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='pending'")) {
              const [a] = args;
              return { results: contacts.filter(c => c.a === a && c.status === 'pending').map(c => ({ id: c.b, ...userView(c.b) })) };
            }
            // AUD-02-042 : demandes envoyées puis refusées (friendList declined).
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='declined'")) {
              const [a] = args;
              return { results: contacts.filter(c => c.a === a && c.status === 'declined').map(c => ({ id: c.b, ...userView(c.b) })) };
            }
            if (s.startsWith('SELECT blocked FROM blocks WHERE blocker=?')) {
              return { results: [] };
            }
            // AUD-02-043 : historique de conversation (msgFetch), utilisé par les
            // tests de purge pour vérifier qu'il est bien vide après retrait.
            if (s.startsWith('SELECT id,sender,body,ts FROM messages WHERE conv=? AND id>?')) {
              const [conv, afterId] = args;
              return { results: messages.filter(m => m.conv === conv && m.id > afterId).map(m => ({ ...m })) };
            }
            // AUD-07-010 : msgLatest() (worker) lit désormais conv_summary
            // (tenue à jour par msgSend()) au lieu de scanner `messages`.
            if (s.startsWith('SELECT conv, participant_a, participant_b, last_id AS last FROM conv_summary WHERE participant_a=? OR participant_b=?')) {
              const [id] = args;
              return { results: [...convSummary.values()].filter(r => r.participant_a === id || r.participant_b === id).map(r => ({ ...r, last: r.last_id })) };
            }
            return { results: [] };
          },
          async run() {
            if (s.startsWith('INSERT INTO users')) {
              const [id, secret, name, avatar, created] = args;
              users.set(id, { id, secret, name, avatar, disabled: 0, created });
              return { success: true };
            }
            if (s.startsWith('UPDATE users SET name=?, avatar=? WHERE id=?')) {
              const [name, avatar, id] = args;
              const u = users.get(id); if (u) { u.name = name; u.avatar = avatar; }
              return { success: true };
            }
            // AUD-02-044 : (dés)activation de la messagerie signalée au serveur.
            if (s.startsWith('UPDATE users SET disabled=? WHERE id=?')) {
              const [disabled, id] = args;
              const u = users.get(id); if (u) { u.disabled = disabled; }
              return { success: true };
            }
            // AUD-02-042 : demande 'pending', OU relance d'une demande 'declined'
            // (upsert conditionnel — ne touche jamais un pending/accepted existant).
            if (s.startsWith("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'pending', ?)")) {
              const [a, b, created] = args;
              const existing = findContact(a, b);
              if (!existing) contacts.push({ a, b, status: 'pending', created });
              else if (existing.status === 'declined') { existing.status = 'pending'; existing.created = created; }
              return { success: true };
            }
            if (s.startsWith("UPDATE contacts SET status='accepted' WHERE a=? AND b=?")) {
              const [a, b] = args;
              const c = findContact(a, b); if (c) c.status = 'accepted';
              return { success: true };
            }
            if (s.startsWith("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'accepted', ?)")) {
              const [a, b, created] = args;
              const c = findContact(a, b);
              if (c) c.status = 'accepted'; else contacts.push({ a, b, status: 'accepted', created });
              return { success: true };
            }
            // AUD-02-042 : refus marqué explicitement (ne supprime plus la ligne).
            if (s.startsWith("UPDATE contacts SET status='declined' WHERE a=? AND b=? AND status='pending'")) {
              const [a, b] = args;
              const c = findContact(a, b); if (c && c.status === 'pending') c.status = 'declined';
              return { success: true };
            }
            // friendCancel() : annule un pending OU efface une notice 'declined' lue.
            if (s.startsWith("DELETE FROM contacts WHERE a=? AND b=? AND status IN ('pending','declined')")) {
              const [a, b] = args;
              const idx = contacts.findIndex(c => c.a === a && c.b === b && (c.status === 'pending' || c.status === 'declined'));
              if (idx >= 0) contacts.splice(idx, 1);
              return { success: true };
            }
            // ancienne forme (compat, non utilisée par le Worker actuel mais gardée
            // au cas où un appelant historique la reconstruirait à l'identique).
            if (s.startsWith("DELETE FROM contacts WHERE a=? AND b=? AND status='pending'")) {
              const [a, b] = args;
              const idx = contacts.findIndex(c => c.a === a && c.b === b && c.status === 'pending');
              if (idx >= 0) contacts.splice(idx, 1);
              return { success: true };
            }
            if (s.startsWith("DELETE FROM contacts WHERE status='pending' AND ((a=? AND b=?) OR (a=? AND b=?))")) {
              const [a1, b1, a2, b2] = args;
              for (let i = contacts.length - 1; i >= 0; i--) {
                const c = contacts[i];
                if (c.status === 'pending' && ((c.a === a1 && c.b === b1) || (c.a === a2 && c.b === b2))) contacts.splice(i, 1);
              }
              return { success: true };
            }
            // friendRemove() : retire la relation dans les deux sens.
            if (s.startsWith('DELETE FROM contacts WHERE (a=? AND b=?) OR (a=? AND b=?)')) {
              const [a1, b1, a2, b2] = args;
              for (let i = contacts.length - 1; i >= 0; i--) {
                const c = contacts[i];
                if ((c.a === a1 && c.b === b1) || (c.a === a2 && c.b === b2)) contacts.splice(i, 1);
              }
              return { success: true };
            }
            // AUD-02-043 : purge de l'historique de conversation au retrait d'un ami.
            if (s.startsWith('DELETE FROM messages WHERE conv=?')) {
              const [conv] = args;
              for (let i = messages.length - 1; i >= 0; i--) if (messages[i].conv === conv) messages.splice(i, 1);
              return { success: true };
            }
            if (s.startsWith('DELETE FROM reads WHERE conv=?')) {
              const [conv] = args;
              for (let i = reads.length - 1; i >= 0; i--) if (reads[i].conv === conv) reads.splice(i, 1);
              return { success: true };
            }
            // AUD-07-010 : nettoyage de conv_summary en miroir de messages/reads
            // (friendRemove) et users/contacts/blocks (accountDelete).
            if (s.startsWith('DELETE FROM conv_summary WHERE conv=?')) {
              const [conv] = args;
              convSummary.delete(conv);
              return { success: true };
            }
            if (s.startsWith('DELETE FROM conv_summary WHERE participant_a=? OR participant_b=?')) {
              const [id] = args;
              for (const [conv, r] of convSummary) if (r.participant_a === id || r.participant_b === id) convSummary.delete(conv);
              return { success: true };
            }
            if (s.startsWith('INSERT INTO messages (conv,sender,body,ts,tmp_id) VALUES (?,?,?,?,?)')) {
              const [conv, sender, body, ts, tmpId] = args;
              const id = nextMsgId++;
              messages.push({ id, conv, sender, body, ts, tmp_id: tmpId ?? null });
              return { success: true, meta: { last_row_id: id } };
            }
            // AUD-07-010 : upsert du résumé par conversation, tenu à jour à
            // chaque envoi (msgSend) — lu ensuite par msgLatest().
            if (s.startsWith('INSERT INTO conv_summary (conv,participant_a,participant_b,last_id,last_ts) VALUES (?,?,?,?,?)')) {
              const [conv, participant_a, participant_b, last_id, last_ts] = args;
              convSummary.set(conv, { conv, participant_a, participant_b, last_id, last_ts });
              return { success: true };
            }
            return { success: true };
          },
        };
      },
    };
  }

  function userView(id) {
    const u = users.get(id) || {};
    return { name: u.name || '', avatar: u.avatar || '', disabled: u.disabled || 0 };
  }

  return {
    DB: { prepare },
    _seedUser(id, secret, name = '', avatar = '') { users.set(id, { id, secret, name, avatar, disabled: 0, created: Date.now() }); },
    _contacts: contacts,
    _messages: messages,
  };
}
