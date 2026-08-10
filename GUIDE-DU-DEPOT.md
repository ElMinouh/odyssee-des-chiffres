# Guide du dépôt — L'Odyssée du Savoir

> Ce document est pensé pour un **humain** qui reprend ce projet — toi dans 2 ans,
> ou quelqu'un d'autre — sans accès à l'historique des conversations avec l'assistant IA.
> Pour le détail des décisions techniques, voir `ADR.md`. Pour la QA manuelle,
> voir `CHECKLIST-non-regression.md`.

## C'est quoi ?

Un jeu éducatif (calcul mental, français, histoire) pour enfants de la Maternelle
au Collège, sous forme de PWA (application web installable, fonctionne hors-ligne).
Nom affiché aux joueurs : **« L'Odyssée du Savoir »**. Nom du dépôt/du projet en
interne : `odyssee-des-chiffres`.

## Comment ça tourne (architecture en une image)

```
┌─────────────────────────────────────────┐
│  PWA statique (ce dépôt)                 │
│  HTML + CSS + JS vanilla, sans framework │
│  ni bundler (choix assumé, voir ADR-20)  │
│  Service Worker (sw.js) : mode hors-ligne│
└───────────────┬───────────────┬─────────┘
                │               │
        ┌───────▼──────┐ ┌──────▼────────┐
        │ Worker        │ │ Worker         │
        │ odyssee-sync  │ │ odyssee-chat   │
        │ (sauvegarde   │ │ (messagerie    │
        │  cloud profil)│ │  entre enfants)│
        │ Cloudflare KV │ │ Cloudflare D1  │
        └───────────────┘ └────────────────┘
```

- Le jeu lui-même est 100% côté client (pas de serveur applicatif) — tout tourne
  dans le navigateur, sauvegardé dans `localStorage`.
- Deux petits serveurs (« Workers » Cloudflare, gratuits) sont optionnels :
  la synchro cloud (`odyssee-sync`, un profil = une clé KV) et la messagerie
  entre enfants (`odyssee-chat`, base de données D1 — voir `schema.sql`,
  `DEPLOY.md`, `test-worker.html`).
- Aucun des deux Workers n'est indispensable pour jouer : sans eux, le jeu
  fonctionne en local uniquement.

## Où sont les choses

| Quoi | Où |
|---|---|
| Le jeu (front-end) | `index.html`, `styles.css`, `js/*.js` |
| Le mode hors-ligne | `sw.js` (Service Worker, stratégie de cache expliquée en tête de fichier) |
| Les Workers Cloudflare | `odyssee-chat.js` (+ `schema.sql`), `odyssee-sync` (pas dans ce dépôt — code à récupérer sur le dashboard Cloudflare, voir ADR-53 et suivants pour le contexte) |
| Les tests automatiques | `tests/*.test.js` + `tests/helpers/loadGame.js` |
| L'historique des décisions | `ADR.md` — **toujours commencer par là** pour comprendre "pourquoi c'est fait comme ça" |
| La checklist de QA manuelle | `CHECKLIST-non-regression.md` |

## Lancer le projet en local

```powershell
npm install
npm run start:python   # ou npm run start / npm run start:node
```
Puis ouvrir `http://localhost:8000`.

## Lancer les tests

```powershell
npm test        # 182+ tests Vitest, doivent tous passer
npm run lint     # ESLint — 0 erreur attendu (les warnings existants ne sont pas bloquants)
```

## Comment se fait un déploiement

**Manuel, volontairement** (pas de CI/CD de déploiement — voir ADR-20) :
1. Le code est poussé sur GitHub (`git push`).
2. Le site est servi automatiquement (vérifier le connecteur configuré :
   GitHub Pages / Netlify / Cloudflare Pages selon ce qui a été mis en place —
   voir l'historique de déploiement du compte d'hébergement).
3. Un filet de sécurité automatique existe : `.github/workflows/ci.yml` relance
   les tests + le lint à chaque push (ADR-52), sans déployer quoi que ce soit
   lui-même.
4. Les Workers Cloudflare se déploient séparément, à la main, depuis le
   dashboard Cloudflare (copier-coller du code — voir `DEPLOY.md` pour
   `odyssee-chat`).

## Convention la plus importante à connaître

**Avant tout changement de code, présenter le problème / pourquoi c'est un
problème / la solution proposée / sa difficulté, et attendre une validation
explicite avant de coder** (ADR-19, réaffirmée ADR-22). C'est la règle de
fonctionnement n°1 de ce projet, peu importe qui l'exécute.

## Cycle de retest des scores d'audit

Ce projet a accumulé plusieurs audits qui ont chacun produit un score chiffré
(qualité perçue, pédagogique, engagement...). **Principe à respecter** : tout
score d'audit doit être revérifié après environ 5 conversations/chantiers de
changements substantiels touchant son périmètre, et le résultat consigné dans
`ADR.md`. Un score qui n'est jamais revérifié ne prouve rien sur l'efficacité
réelle des correctifs qui en ont découlé.

## Si l'assistant IA qui a construit ce projet n'est plus disponible

- `ADR.md` est la source de vérité n°1 — il explique le "pourquoi", pas
  seulement le "quoi".
- Les 182+ tests Vitest sont le filet de sécurité pour toute modification —
  toujours les lancer avant et après un changement.
- Le projet suit une discipline de vérification systématique du code réel
  avant toute affirmation ou correction (ne jamais supposer, toujours vérifier)
  — à reproduire par quiconque reprend ce projet, humain ou IA.
