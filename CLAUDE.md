# CLAUDE.md — Mémoire de contexte rapide

> Ce fichier est un résumé pour démarrer vite, pas une doc exhaustive.
> Pour le détail des décisions et leur "pourquoi" : **`ADR.md`** (source de vérité n°1).
> Pour la structure générale côté humain : `GUIDE-DU-DEPOT.md`.

## 1. Vue d'ensemble

**« L'Odyssée du Savoir »** (nom interne du dépôt : `odyssee-des-chiffres`) est un jeu
éducatif **multi-matières** (calcul mental, français, histoire — architecture déjà
préparée pour géo/anglais/SVT/physique-chimie) pour enfants de la Maternelle au
Collège. PWA installable, fonctionne hors-ligne.

- Genre : jeu de questions/réponses à progression adaptative (boss, figurines à
  collectionner, mode Combat multijoueur local), avec contrôle parental intégré
  (PIN, blocage horaire, filtres de contenu, messagerie surveillée entre enfants).
- Positionnement multi-matières assumé consciemment (voir ADR-151, constat AUD-02-019)
  malgré le nom historique du dépôt centré "chiffres".

## 2. Stack technique

- **Aucun framework, aucun bundler** — HTML + CSS + JS vanilla, choix assumé (ADR-20).
- JS en **script classique** (`sourceType: "script"`, pas de modules ES) : tous les
  fichiers `js/*.js` sont concaténés via des `<script>` successifs dans `index.html`
  et partagent le **même scope global**.
- `sw.js` : Service Worker pour le mode hors-ligne (cache versionné, `CACHE_VERSION`).
- Deux **Workers Cloudflare optionnels** (le jeu marche sans eux, en local pur) :
  - `worker/odyssee-sync.js` — sauvegarde cloud du profil (Cloudflare KV).
  - `worker/odyssee-chat.js` — messagerie entre enfants (Cloudflare D1, voir `schema.sql`).
- Tests : **Vitest** (`tests/**/*.test.js`).
- Qualité : **ESLint** (`.eslintrc.json`, warnings seuillés) + **Prettier** configuré
  mais peu suivi dans le code existant (indentation réelle : 1 espace, pas 2 —
  ne pas reformater en masse sans validation explicite). `npm run format` est donc
  `--check` par défaut (non destructif) ; `npm run format:write` (destructif) est
  réservé à un usage volontaire et validé (AUD-09-008, ADR-164).
- `devDependencies` uniquement (`vitest`, `eslint`, `prettier`, `@vitest/coverage-v8`)
  — aucune dépendance runtime, aucun `npm install` requis pour jouer (juste servir
  les fichiers statiques).

## 3. Architecture du projet

```
index.html          → point d'entrée unique : toutes les "vues" (#v-menu, #v-game,
                       #v-parent...) sont des <div> dans la même page, affichées/
                       masquées via showView(id) (01-core.js). Charge tous les js/*.js.
sw.js                → Service Worker (stratégie de cache expliquée en tête de fichier).
js/                  → toute la logique, numérotée par domaine (ordre de chargement =
                       ordre numérique, IMPORTANT car pas de modules → dépendances
                       implicites par ordre de script) :
  01-core.js           état global (P, GM, GS), helpers transverses, modales stylées
                        (showAlert/showConfirm/showPrompt), showView()
  02-data.js           constantes de données, roster de profils, anniversaires
  03-figurines-data.js catalogue des figurines à collectionner
  04-questions.js       générateurs de questions calcul mental (CP à CM2)
  05-profile.js         chargement/sauvegarde/validation du profil (P)
  06a-adaptive.js       progression adaptative par phase (P9, voir README.md)
  06b-time-block.js     blocage horaire parental + filtres d'opérations
  06c-seasonal.js       boss saisonniers/anniversaire
  06d-cinematics.js     cinématiques
  07-*.js               boucle de jeu (combat, carte, histoire/scénario Odyssée)
  08-ui.js              rendu UI générique
  09-parent.js           Vue Parent (PIN, gestion profils, résumé hebdo, options)
  10-figurines.js        boutique/collection de figurines
  11-init.js             séquence de démarrage (window.onload)
  12-cloud.js            synchro cloud (parle à worker/odyssee-sync.js)
  13/14/15-*.js          générateurs maternelle / primaire enrichi / collège
  16-francais.js         générateurs français
  17-messaging.js        messagerie enfants (parle à worker/odyssee-chat.js)
  18-histoire.js         générateurs histoire
  19-onboarding.js       visite guidée (Système 1 parent express, Système 2 complet)
css/styles.css       → tokens de design (voir DESIGN-SYSTEM.md) + tout le CSS
assets/               → images, figurines, fonts, gifs, musique
audio/cris/           → cris/sons de personnages
worker/                → code des 2 Workers Cloudflare + schema.sql + migrations SQL
                          + DEPLOY.md (déploiement MANUEL, jamais via git push)
tests/                 → suites Vitest + tests/helpers/loadGame.js (charge les VRAIS
                          fichiers js/ dans un sandbox `vm` Node — pas de mocks du
                          jeu lui-même, voir section 4)
scripts/                → gen-test-api.mjs (régénère l'API de test + globals ESLint),
                          check-test-filenames.mjs (garde-fou nommage *.test.js)
ADR.md                  → journal des décisions d'architecture, append-only
```

Pas de dossier "scènes/niveaux" séparé : les niveaux scolaires (CP…3e) et les
7 "Odyssées" (mondes/histoires) sont des données dans `js/02-data.js` et les
fichiers `07-*.js`/`13/14/15/16/18-*.js`, pas des fichiers par niveau.

## 4. Conventions de code

- **Nommage** : camelCase pour variables/fonctions. Préfixe `_` = fonction/variable
  interne (autorisée à être "unused" par ESLint dans un seul fichier — normal si
  appelée depuis un `onclick=` HTML ou un autre fichier).
- **État global en singletons** : `P` (profil actif), `GM` (config de partie en cours),
  `GS` (état de session/combat en cours) — définis dans `01-core.js`, mutés partout.
- **Pattern "pool + phase pédagogique"** (`.ph` = 1/2/3, début/milieu/fin d'année) :
  règle de maintenance **obligatoire** documentée dans `README.md` — tout nouveau
  générateur de question doit être ajouté à son pool ET recevoir une phase.
- **Modales stylées** : toujours `showAlert()`/`showConfirm()`/`showPrompt()`
  (01-core.js) — jamais `alert()`/`confirm()`/`prompt()` natifs du navigateur.
- **Fichiers numérotés** = ordre de chargement réel dans `index.html` ; ne jamais
  réordonner sans vérifier les dépendances implicites entre fichiers.
- Linter : ESLint avec seuil `--max-warnings` (actuellement 342, dans `package.json`)
  — le seuil monte volontairement à chaque nouvelle fonction légitimement invisible
  à l'analyse par fichier (ex. appelée seulement depuis un `onclick=` HTML).

## 5. État d'avancement

- 743 tests Vitest verts, 92 fichiers de test.
- **État réel des 9 audits** (voir ADR-164 pour le séquencement retenu et sa justification) :
  - Intégralement traités et vérifiés : **AUD-02 fonctionnel** (47 constats, ADR-129→152),
    **AUD-06 sécurité** (11 constats, ADR-154→156), **AUD-07 performances/scalabilité**
    (23 constats, ADR-158→163), **AUD-08 qualité perçue** (6 constats, commits
    4629655/876dd4c/75865c8).
  - **Jamais engagés** (aucun lot de correction à ce jour) : **AUD-01 technique**
    (34 constats, dont 2 P0), **AUD-03 ergonomique** (47 constats, dont le P0
    AUD-03-012 : fenêtre de choix d'objectif du jour sans issue tactile), **AUD-04
    graphique** (15 constats, dont le P1 AUD-04-001 : trois langages visuels
    concurrents).
  - **AUD-05 accessibilité** : 1 point acté sans changement de code (AUD-05-007,
    ADR-153), le reste (9 constats, dont 3 P1) non traité.
  - **AUD-09 cohérence globale** (2026-09-26) : 8 constats de gouvernance/cohérence,
    lot 1 en cours (ADR-164).
- Reste en attente côté déploiement (action manuelle, pas automatisable par Claude) :
  - `worker/migration-user-disabled.sql` à exécuter sur le dashboard Cloudflare
    (base `odyssee-chat-db`) avant de redéployer `worker/odyssee-chat.js`.
  - `worker/odyssee-chat.js` lui-même à redéployer (route `/msg/latest` enrichie,
    `friendList` expose `created`) — pas de migration requise pour ce second point.
- Dette connue : `npm run test:coverage` rapporte 0% partout (limite de l'outillage,
  pas un manque de tests réel — expliqué en tête de `vitest.config.mjs`).
- Autre audit disponible : `Audit_technique_Odyssee_des_Chiffres_2026-09-21.md`
  (angle technique/sécurité, distinct de l'audit fonctionnel ci-dessus).

## 6. Commandes utiles

```bash
npm run start:python     # sert le jeu en local sur http://localhost:8000
                          # (ou npm run start / npm run start:node)
npm test                 # suite Vitest complète (doit être 100% verte)
npm run test:watch       # Vitest en mode watch
npm run lint              # ESLint (0 erreur attendu)
npm run lint:fix          # ESLint --fix
npm run format             # Prettier --check (défaut non destructif, voir section 4)
npm run format:write       # Prettier --write (peu utilisé, voir section 4 — ne jamais
                            # lancer en masse sans validation explicite)
npm run sync:test-api      # RÉGÉNÈRE tests/helpers/loadGame.js + .eslintrc.json
                            # après tout ajout de fonction/const globale — OBLIGATOIRE
npm run check:test-filenames  # vérifie que tests/*.js finit bien par .test.js
```

Déploiement du site : `git push` seulement (voir `GUIDE-DU-DEPOT.md` pour le détail
de l'hébergement). Déploiement des Workers Cloudflare : **manuel**, dashboard
Cloudflare, jamais via git (`worker/DEPLOY.md`).

## 7. Notes pour Claude

- **Règle n°1 du projet, sans exception** : avant tout changement de code, présenter
  problème / pourquoi c'est un problème / solution proposée / difficulté, et attendre
  une validation explicite avant de coder (ADR-19, réaffirmée ADR-22).
- **Toujours répondre en français** dans ce projet, quelle que soit la session.
- Après avoir ajouté une fonction/constante globale dans `js/*.js`, lancer
  `npm run sync:test-api` — sinon elle est invisible des tests ET d'ESLint.
- `tests/helpers/loadGame.js` charge les **vrais fichiers sources** dans un sandbox
  `vm` Node (pas des mocks du jeu) — `window` y est un stub **séparé** du contexte
  global (pas un alias comme dans un vrai navigateur : `window[x]` ne trouve JAMAIS
  une fonction/variable globale du jeu). `setTimeout` y est un no-op (callback jamais
  exécuté) — toute logique dans un `setTimeout()` doit être extraite dans une fonction
  nommée séparée pour rester testable (pattern déjà utilisé partout, voir
  `_obOfferSystem2Chain` dans `19-onboarding.js` pour un exemple récent).
- Piège CRLF/LF connu (ADR-138) : `scripts/gen-test-api.mjs` cherche des marqueurs
  terminés par `\n` dans `loadGame.js` — une normalisation CRLF locale (Git Windows)
  peut le casser silencieusement. Si le script ne trouve plus ses marqueurs, vérifier
  les fins de ligne du fichier avant de chercher ailleurs.
- Ne jamais casser un test préexistant : suite complète + lint avant ET après tout
  changement, jamais seulement le nouveau test.
- `ADR.md` est numéroté et append-only — toute décision d'architecture significative
  y gagne une entrée (contexte / décision / alternatives rejetées / impact).
- Avant d'écrire une nouvelle valeur de rayon/ombre/espacement en CSS, vérifier les
  tokens existants dans `DESIGN-SYSTEM.md`/`styles.css` (`:root`).
- `git add` ciblé uniquement (jamais `-A`) ; commits avec trailer
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Version : `package.json` (`"version"`) ET `sw.js` (`CACHE_VERSION`) bumpés
  **ensemble** à chaque changement fonctionnel livré.
