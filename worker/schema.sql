-- Base de données D1 pour la messagerie « odyssee-chat »
CREATE TABLE IF NOT EXISTS users (
  id      TEXT PRIMARY KEY,   -- code ami (public, partageable)
  secret  TEXT NOT NULL,      -- secret privé (jamais partagé) : sert à authentifier
  name    TEXT,               -- prénom affiché
  created INTEGER
);
CREATE TABLE IF NOT EXISTS contacts (
  a       TEXT NOT NULL,      -- de
  b       TEXT NOT NULL,      -- vers
  status  TEXT NOT NULL,      -- 'pending' (a a demandé b) | 'accepted'
  created INTEGER,
  PRIMARY KEY (a, b)
);
CREATE TABLE IF NOT EXISTS messages (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  conv   TEXT NOT NULL,       -- clé de conversation = les deux codes triés, joints par '|'
  sender TEXT NOT NULL,
  body   TEXT NOT NULL,
  ts     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_msg_conv  ON messages (conv, id);
CREATE INDEX IF NOT EXISTS idx_contacts_b ON contacts (b, status);
