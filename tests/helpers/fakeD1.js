// Mock minimal, en mémoire, de l'API D1 (env.DB.prepare(sql).bind(...).run()/
// .all()/.first()) utilisée par worker/odyssee-chat.js. Ne couvre QUE les
// requêtes SQL réellement présentes dans ce fichier (users, contacts) — pas un
// moteur SQL générique. Sert de première brique de test pour ce Worker, qui
// n'en avait aucun (AUD-01, section C7) : à étendre au fil des prochains lots
// qui le touchent, plutôt que de le récrire à chaque fois.
export function makeFakeD1() {
  const users = new Map(); // id -> {id,secret,name,avatar,created}
  const contacts = []; // {a,b,status,created}

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
            return null;
          },
          async all() {
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='accepted'")) {
              const [a] = args;
              return { results: contacts.filter(c => c.a === a && c.status === 'accepted').map(c => ({ id: c.b, ...userView(c.b) })) };
            }
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.a WHERE c.b=? AND c.status='pending'")) {
              const [b] = args;
              return { results: contacts.filter(c => c.b === b && c.status === 'pending').map(c => ({ id: c.a, ...userView(c.a) })) };
            }
            if (s.includes("FROM contacts c JOIN users u ON u.id=c.b WHERE c.a=? AND c.status='pending'")) {
              const [a] = args;
              return { results: contacts.filter(c => c.a === a && c.status === 'pending').map(c => ({ id: c.b, ...userView(c.b) })) };
            }
            if (s.startsWith('SELECT blocked FROM blocks WHERE blocker=?')) {
              return { results: [] };
            }
            return { results: [] };
          },
          async run() {
            if (s.startsWith('INSERT INTO users')) {
              const [id, secret, name, avatar, created] = args;
              users.set(id, { id, secret, name, avatar, created });
              return { success: true };
            }
            if (s.startsWith('UPDATE users SET name=?, avatar=? WHERE id=?')) {
              const [name, avatar, id] = args;
              const u = users.get(id); if (u) { u.name = name; u.avatar = avatar; }
              return { success: true };
            }
            if (s.startsWith("INSERT INTO contacts (a,b,status,created) VALUES (?,?, 'pending', ?)")) {
              const [a, b, created] = args;
              if (!findContact(a, b)) contacts.push({ a, b, status: 'pending', created });
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
            if (s.startsWith("DELETE FROM contacts WHERE a=? AND b=? AND status='pending'")) {
              const [a, b] = args;
              const idx = contacts.findIndex(c => c.a === a && c.b === b && c.status === 'pending');
              if (idx >= 0) contacts.splice(idx, 1);
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
    return { name: u.name || '', avatar: u.avatar || '' };
  }

  return {
    DB: { prepare },
    _seedUser(id, secret, name = '', avatar = '') { users.set(id, { id, secret, name, avatar, created: Date.now() }); },
    _contacts: contacts,
  };
}
