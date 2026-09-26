-- Migration : ajoute la colonne tmp_id à la table messages (audit performances
-- AUD-07-006, 2026-09-26) — sans danger à rejouer sur la base réelle : la
-- colonne ADD COLUMN échoue proprement si elle existe déjà.
--
-- À FAIRE AVANT de déployer la nouvelle version d'odyssee-chat.js (elle lit et
-- écrit cette colonne dans msgSend()). Avant d'exécuter ce script : sauvegarder
-- la base (wrangler d1 export odyssee-chat-db --output backup-avant-migration.sql).

ALTER TABLE messages ADD COLUMN tmp_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_tmpid ON messages (sender, tmp_id) WHERE tmp_id IS NOT NULL;
