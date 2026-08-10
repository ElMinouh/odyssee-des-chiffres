-- Migration pour « odyssee-chat-db » — ADR-56 (méta-audit Lot 5)
--
-- Ces 2 tables sont utilisées par odyssee-chat.js (blocage de contact,
-- accusés de lecture) mais absentes du schema.sql original — soit un export
-- non mis à jour, soit ajoutées à la main sur le dashboard sans migration
-- versionnée. CREATE TABLE IF NOT EXISTS : sans danger à rejouer, que les
-- tables existent déjà ou non.
--
-- À exécuter dans le dashboard Cloudflare : base « odyssee-chat-db » →
-- onglet Console/Query → coller tout le contenu → Execute.

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
