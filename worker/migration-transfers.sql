-- Migration pour « odyssee-chat-db » — AUD-06-004 (audit sécurité 2026-09-25)
--
-- Cette table est utilisée par odyssee-chat.js (transferCreate()/transferClaim())
-- pour le transfert d'identité de messagerie entre appareils par jeton à usage
-- unique, valable 10 minutes — remplace l'ancien schéma côté client qui
-- encodait id+secret en Base64 (réversible sans clé, exposé si intercepté).
-- CREATE TABLE IF NOT EXISTS : sans danger à rejouer, que la table existe déjà
-- ou non.
--
-- À exécuter dans le dashboard Cloudflare : base « odyssee-chat-db » →
-- onglet Console/Query → coller tout le contenu → Execute. À FAIRE AVANT de
-- déployer la nouvelle version de worker/odyssee-chat.js (qui lit/écrit cette
-- table dès le premier appel à /transfer/create ou /transfer/claim ; les
-- autres routes, y compris /account/delete, ne sont pas affectées par son
-- absence — accountDelete() tolère déjà une table transfers manquante).

CREATE TABLE IF NOT EXISTS transfers (
  token   TEXT PRIMARY KEY,
  id      TEXT NOT NULL,
  secret  TEXT NOT NULL,
  expires INTEGER NOT NULL
);
