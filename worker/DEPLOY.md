# Déploiement de la messagerie « odyssee-chat »

Ce dossier contient le **petit serveur** (Worker Cloudflare) qui sert de boîte
aux lettres pour la messagerie, et sa base de données.

- `odyssee-chat.js` — le code du Worker
- `schema.sql` — les tables de la base de données
- `DEPLOY.md` — ce guide

Tu vas tout faire depuis le **tableau de bord Cloudflare** (aucun code à écrire).
Compte le temps : ~10 minutes, une seule fois.

---

## Étape 1 — Créer la base de données (D1)

1. Va sur https://dash.cloudflare.com → menu **Workers & Pages** → **D1 SQL Database**.
2. Clique **Create database**.
3. Nom : `odyssee-chat-db` → **Create**.

## Étape 2 — Créer les tables

1. Ouvre la base `odyssee-chat-db` → onglet **Console** (ou **Query**).
2. Ouvre le fichier `schema.sql`, **copie tout son contenu**, colle-le dans la
   console, puis clique **Execute** (ou **Run**).
3. Tu dois voir les tables `users`, `contacts`, `messages` créées.

## Étape 3 — Créer le Worker

1. Retour dans **Workers & Pages** → **Create** → **Create Worker**.
2. Nom : `odyssee-chat` → **Deploy** (il déploie un exemple par défaut, c'est normal).
3. Clique **Edit code** (ou **Continue to project** → **Edit code**).
4. **Efface tout** le code affiché, puis **colle tout le contenu** de
   `odyssee-chat.js`. Clique **Deploy**.

## Étape 4 — Relier la base au Worker (IMPORTANT)

1. Dans le Worker `odyssee-chat` → onglet **Settings** → **Bindings** (ou
   **Variables** → **D1 database bindings**).
2. **Add binding** → type **D1 database**.
3. **Variable name** : tape exactement `DB` (deux lettres, majuscules).
   ⚠️ Ce nom doit être `DB`, sinon le Worker ne trouvera pas la base.
4. **D1 database** : choisis `odyssee-chat-db`.
5. **Save / Deploy**.

## Étape 5 — Récupérer l'adresse du Worker

En haut de la page du Worker, tu vois son adresse, du type :

```
https://odyssee-chat.TON-SOUS-DOMAINE.workers.dev
```

**Copie cette adresse et donne-la-moi.** Je l'inscrirai dans l'appli
(constante `CHAT_API`) pour relier les deux.

---

## Vérifier que ça marche (facultatif)

Dans un terminal (ou n'importe quel outil qui fait une requête), tu peux tester :

```bash
curl -X POST https://odyssee-chat.TON-SOUS-DOMAINE.workers.dev/register \
  -H "Content-Type: application/json" \
  -d '{"id":"TEST-1234","secret":"un-secret-de-test","name":"Test"}'
```

Réponse attendue :

```json
{"ok":true,"id":"TEST-1234","name":"Test"}
```

Si tu vois `{"ok":true,...}`, le serveur fonctionne. 🎉

---

## Mise à jour (v12.8.11, audit performances) — migrations + Cron Trigger

Cette version ajoute une table (`conv_summary`) et une colonne (`tmp_id`) à la
base existante, plus une purge automatique hebdomadaire des vieux messages.
**À faire AVANT de redéployer `odyssee-chat.js`** :

1. **Sauvegarder la base** (recommandé, jamais fait automatiquement) :
   ```bash
   wrangler d1 export odyssee-chat-db --output backup-avant-migration.sql
   ```
2. **Rejouer les 2 migrations** sur `odyssee-chat-db` (Console D1 du dashboard,
   coller-exécuter chaque fichier ; ou `wrangler d1 execute odyssee-chat-db --file=./migration-XXX.sql --remote`) :
   - `migration-conv-summary.sql`
   - `migration-msg-tmpid.sql`
3. **Redéployer** `odyssee-chat.js` (Étape 3 ci-dessus, ou `wrangler deploy`).
4. **Configurer le Cron Trigger** (purge hebdomadaire des messages de plus de
   2 ans) — nécessaire seulement si le Worker a été déployé via le dashboard
   (copier-coller) plutôt qu'avec `wrangler deploy`, qui applique automatiquement
   le `[triggers]` de `wrangler.toml` :
   - Dans le Worker `odyssee-chat` → onglet **Triggers** → **Cron Triggers** → **Add Cron Trigger**.
   - Expression : `0 3 * * 0` (dimanche 3h UTC).
   - Sans cette étape, le code de purge existe mais n'est jamais déclenché — sans danger, juste sans effet.

## Alternative : en ligne de commande (wrangler)

Si tu préfères le CLI :

```bash
npm install -g wrangler
wrangler login

# 1. créer la base
wrangler d1 create odyssee-chat-db
# → copie le "database_id" affiché dans wrangler.toml (voir ci-dessous)

# 2. créer les tables
wrangler d1 execute odyssee-chat-db --file=./schema.sql --remote

# 3. déployer le Worker
wrangler deploy
```

Avec un fichier `wrangler.toml` à placer dans ce dossier :

```toml
name = "odyssee-chat"
main = "odyssee-chat.js"
compatibility_date = "2024-11-01"

[[d1_databases]]
binding = "DB"
database_name = "odyssee-chat-db"
database_id = "REMPLACE-PAR-L-ID-AFFICHE"
```

---

## Notes

- **Coût** : largement dans l'offre gratuite Cloudflare pour un cercle familial.
- **Sécurité** : chaque profil a un *code ami* public (pour être ajouté) et un
  *secret* privé (jamais partagé) qui authentifie ses requêtes. Partager son
  code ami ne donne pas accès aux messages.
- **Indépendant de la sauvegarde** : ce Worker est séparé de `odyssee-sync`
  (les profils). Aucun risque pour tes sauvegardes existantes.

## Limites du plan Cloudflare Free et point de rupture estimé (audit performances AUD-07-009)

Plan utilisé pour ce projet : **Cloudflare Free**. Limites publiques au
moment de la rédaction (2026-09-26) — à revérifier sur le dashboard/la page
tarifaire Cloudflare avant toute décision d'échelle, ces chiffres peuvent
évoluer :
- **Workers (requêtes)** : 100 000 requêtes/jour, partagées entre TOUS les
  Workers du compte (`odyssee-chat` + `odyssee-sync` cumulés) — c'est la
  limite la PLUS BASSE des trois ci-dessous, donc le vrai facteur limitant.
- **D1 (lectures/écritures)** : 5 000 000 lignes lues/jour, 100 000 lignes
  écrites/jour, 5 Go de stockage — largement au-dessus du besoin réel avant
  que la limite Workers ci-dessus ne soit atteinte la première.
- **KV** : 1 000 écritures/jour (déjà anticipée dans le code par
  échantillonnage, voir `SAMPLE_RATE` dans les deux Workers).

**Estimation du point de rupture** (calcul, pas une mesure — à valider par un
test de charge réel si l'usage se rapproche de ce seuil) : le client sonde
toutes les 4s par conversation ouverte + toutes les 25s pour les badges
(`js/17-messaging.js`). Pour un enfant avec ~1h de messagerie active par jour :
≈ 900 requêtes (sondage conversation) + ≈ 144 requêtes (badges) ≈ **1 050
requêtes/jour/enfant actif**. Rapporté à la limite Workers (100 000/jour,
partagée avec le reste de l'app et `odyssee-sync`) :

```
100 000 requêtes/jour ÷ 1 050 requêtes/jour/enfant ≈ 95 enfants actifs simultanés/jour
```

Au-delà de cet ordre de grandeur (environ une centaine d'enfants utilisant
activement la messagerie le même jour), le plan Free serait probablement
insuffisant : Cloudflare bloque ou dégrade les requêtes au-delà du quota
journalier plutôt que de facturer automatiquement. Une classe entière (25-30
élèves) reste largement dans la marge ; un établissement scolaire complet
(plusieurs centaines d'élèves) dépasserait cet ordre de grandeur.
**Si l'usage réel approche ce seuil** : passer au plan Cloudflare Workers Paid
(quota bien plus élevé, facturation à l'usage) avant qu'une saturation ne
survienne en pleine period d'usage.
