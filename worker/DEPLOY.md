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
