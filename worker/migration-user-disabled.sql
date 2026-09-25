-- Migration pour « odyssee-chat-db » — audit fonctionnel AUD-02-044 (2026-09-21)
--
-- La colonne `disabled` permet de savoir, côté serveur, qu'un profil a
-- suspendu sa messagerie (chatDisableForProfile, 17-messaging.js) — état
-- auparavant purement local, jamais communiqué au Worker. friendList()
-- l'expose désormais aux amis de ce profil pour afficher un état
-- "injoignable" plutôt que de laisser un ami envoyer des messages dans le
-- vide indéfiniment sans le savoir.
--
-- Sans danger à rejouer sur la base réelle : ALTER TABLE ADD COLUMN échoue
-- proprement (colonne déjà présente) si elle a déjà été ajoutée à la main.
--
-- À exécuter dans le dashboard Cloudflare : base « odyssee-chat-db » →
-- onglet Console/Query → coller tout le contenu → Execute. À FAIRE AVANT de
-- déployer la nouvelle version de worker/odyssee-chat.js (qui lit/écrit
-- cette colonne dès son premier appel).

ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0;
