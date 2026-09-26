-- Base de données D1 pour la messagerie « odyssee-chat »
CREATE TABLE IF NOT EXISTS users (
  id      TEXT PRIMARY KEY,   -- code ami (public, partageable)
  secret  TEXT NOT NULL,      -- secret privé (jamais partagé) : sert à authentifier
  name    TEXT,               -- prénom affiché
  avatar  TEXT,               -- avatar choisi (audit AUD-01-003 : colonne utilisée par le
                               -- code depuis l'origine mais absente d'ici, cf. migration-avatar.sql)
  disabled INTEGER DEFAULT 0, -- messagerie suspendue par ce profil (AUD-02-044, cf. migration-user-disabled.sql)
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
  ts     INTEGER NOT NULL,
  tmp_id TEXT                 -- audit AUD-07-006 : id client, déduplique un envoi
                               -- renvoyé après un timeout (voir migration-msg-tmpid.sql)
);
CREATE INDEX IF NOT EXISTS idx_msg_conv  ON messages (conv, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_tmpid ON messages (sender, tmp_id) WHERE tmp_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_b ON contacts (b, status);

-- Ajoutée audit AUD-07-010 (audit performances 2026-09-26) : résumé "dernier
-- message par conversation" par PARTICIPANT, tenu à jour à chaque envoi
-- (msgSend). Remplace la requête msgLatest() qui scannait auparavant toute la
-- table `messages` (LIKE avec wildcard en tête pour la moitié des
-- conversations, non indexable) — voir migration-conv-summary.sql pour la
-- base réelle, avec un backfill des données déjà en place.
CREATE TABLE IF NOT EXISTS conv_summary (
  conv          TEXT PRIMARY KEY,
  participant_a TEXT NOT NULL,
  participant_b TEXT NOT NULL,
  last_id       INTEGER,
  last_ts       INTEGER
);
CREATE INDEX IF NOT EXISTS idx_convsum_a ON conv_summary (participant_a);
CREATE INDEX IF NOT EXISTS idx_convsum_b ON conv_summary (participant_b);

-- Ajoutées ADR-56 (méta-audit Lot 5) : utilisées par le code (blocage de
-- contact, accusés de lecture) mais absentes de ce fichier jusqu'ici — voir
-- migration-blocks-reads.sql pour la migration à rejouer sur la base réelle.
CREATE TABLE IF NOT EXISTS blocks (
  blocker TEXT NOT NULL,
  blocked TEXT NOT NULL,
  ts      INTEGER,
  PRIMARY KEY (blocker, blocked)
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker);

CREATE TABLE IF NOT EXISTS reads (
  conv   TEXT NOT NULL,
  reader TEXT NOT NULL,
  upto   INTEGER,
  ts     INTEGER,
  PRIMARY KEY (conv, reader)
);

-- Ajoutée AUD-06-004 (audit sécurité 2026-09-25) : jetons de transfert
-- d'identité à usage unique, valables 10 minutes (voir migration-transfers.sql
-- pour la base réelle).
CREATE TABLE IF NOT EXISTS transfers (
  token   TEXT PRIMARY KEY,
  id      TEXT NOT NULL,
  secret  TEXT NOT NULL,
  expires INTEGER NOT NULL
);
