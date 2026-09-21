-- Migration pour « odyssee-chat-db » — audit AUD-01-003 (2026-09-21)
--
-- La colonne `avatar` est utilisée par odyssee-chat.js (register/getUser)
-- depuis l'origine mais n'a jamais été versionnée dans schema.sql — même
-- schéma d'écart que blocks/reads (cf. migration-blocks-reads.sql). Sans
-- cette colonne, toute reconstruction de la base depuis schema.sql casse
-- /register et /friend/list (colonne inexistante).
--
-- Sans danger à rejouer sur la base réelle : ALTER TABLE ADD COLUMN échoue
-- proprement (colonne déjà présente) si elle a déjà été ajoutée à la main
-- sur le dashboard — dans ce cas, ignorer l'erreur et ne rien faire de plus.
--
-- À exécuter dans le dashboard Cloudflare : base « odyssee-chat-db » →
-- onglet Console/Query → coller tout le contenu → Execute.

ALTER TABLE users ADD COLUMN avatar TEXT;
