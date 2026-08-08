# ADR — L'Odyssée du Savoir

Journal des décisions d'architecture et de choix de conception du projet. Centralise ce qui, jusqu'ici, ne vivait que dans les documents de transition entre conversations.

> **Note de transparence** : les ADR-1 à ADR-18 sont reconstituées ici à partir de leurs intitulés thématiques tels que résumés dans le document de contexte cumulatif (v10) — le détail argumenté complet de chacune (contexte précis, alternatives écartées) vit dans les documents de transition des conversations 1 à 9 et n'a pas été reproduit intégralement faute d'accès à ces documents sources. Les ADR-19 à ADR-24 sont, elles, intégrales.

---

## ADR-1 à ADR-18 — Résumé thématique (fondations du projet, conversations 1 à 9)

Décisions actées, non remises en cause à ce jour :

1. **Stabilité des identifiants internes** — les `id` (questions, figurines, ouvrages) ne changent jamais une fois publiés, pour ne pas casser les sauvegardes des joueurs.
2. **Cibles de longueur de lecture par cycle scolaire** — chaque ouvrage narratif respecte une fourchette de mots adaptée à l'âge (Maternelle/Primaire/Collège).
3. **Processus de validation des contenus narratifs** — relecture systématique avant intégration.
4. **Tons narratifs différenciés par cycle** — registre qui progresse avec l'âge du joueur.
5. **Figurines sous licence classées définitivement hors de portée** — jamais intégrées au jeu (voir aussi ADR-9).
6. **Équilibre action/légèreté/suspense** — rééquilibrage transversal des histoires.
7. **Vérification factuelle des collections** (figurines, contenus historiques).
8. **Priorité aux bugs réels sur la conformité stricte à un audit** — un audit peut se tromper, le code réel fait foi.
9. **Figurines sous licence : décision définitive** (doublon thématique de la 5, confirmé séparément lors de l'audit technique).
10. **Tests en conditions réelles** plutôt que suppositions.
11. **Limitation de débit des Workers** — compteur KV échantillonné à 1 requête sur 50 pour respecter le plan gratuit Cloudflare.
12. **Filet de tests plutôt que refonte** — `validate()` non réécrite, mais protégée par des tests.
13. **Séparation stricte jeu / Workers** — le jeu ne doit jamais dépendre d'un comportement non documenté du backend.
14. **Fusion cloud non destructive** — une synchronisation ne doit jamais écraser silencieusement des données locales plus récentes.
15. **Discipline de revérification systématique** — toute affirmation technique est vérifiée dans le code avant d'être présentée comme un fait.
16. **Convention de nommage `.test.js`** pour tous les fichiers de test.
17. **Discipline de présentation par lots avant codage** — voir ADR-19 pour la version consolidée et réaffirmée.
18. **Refus définitif de la minification/du build** — voir ADR-20 pour la version consolidée et réaffirmée.

---

## ADR-19 — Discipline de présentation par lots avant codage

**Contexte** (5e conversation) : lors d'un audit UX en plusieurs lots, du code a été écrit sans présentation préalable détaillée.

**Décision** : pour tout chantier en lots, présenter systématiquement AVANT tout codage le(s) problème(s), pourquoi c'est un problème, la solution proposée et son degré de difficulté, puis attendre une validation explicite avant d'écrire le moindre code.

---

## ADR-20 — Refus définitif de la minification/du build

**Contexte** : plusieurs audits (performances notamment) ont soulevé l'absence de build/minification comme piste d'optimisation.

**Décision** : refus définitif et reconfirmé (9e conversation) après examen sincère des alternatives. Le projet reste 100% vanilla JS sans framework ni bundler, pour préserver la simplicité d'un développeur non technicien qui doit pouvoir comprendre ce qui se passe.

**Réévaluation prévue** : si la taille des fichiers narratifs continue de croître significativement (signalé par l'audit de cohérence globale, 07-story.js déjà à 448 Ko).

---

## ADR-21 — Cohérence spotlight/scroll onboarding

**Contexte** (9e conversation) : le spotlight d'onboarding nécessitait deux itérations pour bien fonctionner avec le scroll de la page.

**Décision** : le spotlight d'onboarding reste la seule exception documentée et volontaire au piège de focus clavier uniforme (`trapFocus`) appliqué à toutes les autres fenêtres modales.

---

## ADR-22 — Réaffirmation stricte de la discipline de présentation par lots

**Contexte** (10e conversation) : lors d'un chantier en 8 lots, un lot a été codé après simple annonce d'intention, sans repasser par la présentation détaillée pourtant redemandée en début de chantier.

**Décision** : l'ADR-19 est confirmée sans aucune exception, y compris en fin de série de lots. Un "ok" donné à une proposition de découpage en sous-lots ne vaut jamais validation anticipée du contenu technique de chacun de ces lots — chaque lot individuel doit recevoir sa propre présentation avant tout code, sauf autorisation explicite de Cyril pour un sous-lot nommément désigné.

**Conséquence** : ne jamais interpréter un "continue"/"ok" générique donné en fin de lot comme une autorisation à sauter la présentation du lot suivant.

---

## ADR-23 — Clôture sans code d'un point d'audit après vérification du code réel

**Contexte** (10e conversation) : un audit décrivait un problème de duplication de classes CSS de bouton, à corriger par un composant de base.

**Découverte** : l'inspection du code réel a montré que la quasi-totalité des classes citées s'appliquent sur des `<button>` qui héritent déjà de la règle de base via la cascade CSS normale — pas une duplication non maîtrisée mais le fonctionnement normal de la cascade.

**Décision** : clore la fiche sans écrire de code plutôt que de fabriquer un composant pour un problème qui n'existe pas réellement.

**Conséquence** : illustre concrètement la discipline de revérification (thème n°15 des ADR-1 à 18) — un audit produit en une seule passe peut surestimer la gravité d'un point ; vérifier le code réel avant de coder reste la règle, même quand l'audit semble catégorique.

---

## ADR-24 — Stratégie de cache "network-first" pour les ressources critiques (formalisation)

**Contexte** (audit de cohérence globale, 10e conversation) : la stratégie de cache du Service Worker — network-first pour HTML/CSS/JS, stale-while-revalidate pour les assets statiques — a été signalée par trois audits indépendants (technique, performances, cohérence globale) sans jamais être remise en cause dans les faits. Elle n'existait jusqu'ici que sous forme de commentaire dans `sw.js`, jamais comme décision actée.

**Raisonnement** : pour un jeu éducatif mis à jour régulièrement par un seul développeur, la fraîcheur garantie du contenu (nouveaux contenus narratifs, correctifs de bugs, patchs de sécurité) prime sur le gain de vitesse d'un cache-first strict. Le mode hors-ligne reste assuré par le fallback sur le cache en cas d'échec réseau — le compromis n'est donc pas "vitesse contre disponibilité offline", seulement "vitesse contre fraîcheur", et la fraîcheur gagne pour ce projet.

**Décision** : le choix network-first est acté comme définitif et documenté ici. Il ne doit plus être signalé comme point d'audit ouvert dans de futurs audits techniques ou performances — seulement réévalué si le profil d'usage change radicalement (ex. bascule vers un usage à connexion très instable).

**Alternative écartée** : cache-first avec invalidation par version — rejetée car elle réintroduirait un risque de contenu périmé affiché à l'utilisateur entre deux déploiements, contraire à la priorité du projet sur la fiabilité du contenu pédagogique.

---

## ADR-25 — Tokens `--space-*` conservés en base de travail future

**Contexte** (audit de cohérence globale, 10e conversation) : les tokens `--space-1` à `--space-6` (`styles.css`), créés lors de l'audit DA (6e conversation), n'ont été adoptés par aucun des 4 audits suivants.

**Décision** (Cyril) : conserver ces tokens tels quels plutôt que les retirer. Ce ne sont pas des tokens morts inutiles mais une base prête à l'emploi pour de futurs lots (nouveaux écrans, refontes ciblées de marges/paddings).

**Conséquence** : ne plus signaler ce point comme "incohérence" dans de futurs audits — c'est un choix assumé, pas un oubli. Réévaluer seulement si, après plusieurs autres conversations, l'usage reste toujours à zéro.

---

## ADR-26 — Mode Chrono activé pour toutes les matières

**Contexte** (audit de cohérence globale, 10e conversation) : le bouton Chrono était affiché pour Français/Histoire mais le minuteur ne se déclenchait jamais (`GM.subject==='math'` requis dans `07-game.js`) — le bouton mentait silencieusement.

**Décision** (Cyril) : plutôt que masquer le bouton, rendre le Chrono réellement fonctionnel dans les 3 matières. Retrait de la condition `subject==='math'` sur l'affichage du HUD et le déclenchement du minuteur.

**Conséquence** : le mode Chrono est désormais symétrique entre Maths, Français et Histoire. Plus d'asymétrie pédagogique à documenter — le point est clos.

---

## ADR-27 — Filet de tests de non-régression narrative

**Contexte** (audit de cohérence globale, 10e conversation) : règle du projet jamais formalisée en test — tout lecteur de contenu narratif doit toujours afficher un bouton de fermeture. Déjà oubliée une fois par le passé (`_renderColBook`), corrigée manuellement, sans protection automatisée.

**Décision** : ajout de `tests/narrative-regression_test.js`, qui vérifie pour les 5 fonctions de rendu narratif du projet (`_renderColBook`, `_renderHistBook`, `_openBossCard`, `_renderTaleIllus`, `openAdventureLog`) que le HTML généré contient bien un bouton avec le SVG de fermeture unifié.

**Changement d'outillage associé** : le harness de test (`tests/helpers/loadGame.js`) a été enrichi de deux façons — (1) un registre des éléments créés via `document.createElement`, pour pouvoir inspecter le dernier overlay généré depuis un test ; (2) `querySelector()` sur un élément factice renvoie désormais un élément factice plutôt que `null`, pour ne pas faire planter le code de production qui chaîne `.querySelector(...).addEventListener(...)` sans garde de nullité (comportement fidèle à un vrai DOM, où le sélecteur trouve toujours l'élément qui vient d'être inséré). Vérifié sans régression sur les 177 tests préexistants (182 au total après ajout).

**Conséquence** : toute future fonction de rendu de contenu narratif devrait être ajoutée à ce filet de test plutôt que de créer un nouveau fichier de test ad hoc pour la même règle.

---

## ADR-28 — Harmonisation du ton des messages d'erreur de synchronisation cloud

**Contexte** (audit de cohérence globale, 10e conversation) : les Workers Cloudflare ne renvoient que des codes techniques (`not_found`, `rate_limited`, `server`...) — le "ton" se joue entièrement côté front-end (`09-parent.js`) au moment de traduire ces codes pour l'utilisateur. Deux endroits en rupture avec le soin apporté ailleurs : (1) `doCloudSyncNow` affichait un échec toujours générique ("⚠️ Échec de synchronisation"), sans jamais différencier la cause, alors que le succès juste au-dessus est chaleureux et spécifique ; (2) le cas générique de `_doForceCloudRestoreProceed` et de `doCloudRestore` (ancienne méthode) laissait fuiter le code technique brut du Worker directement à l'écran (ex. "❌ Erreur : server").

**Décision** : `doCloudSyncNow` différencie désormais le message selon `_cloudLastError` (réseau / serveur indisponible / trop de tentatives) via `getCloudStatus()`. Les deux fallbacks génériques de restauration affichent un message chaleureux ("Une erreur inattendue est survenue, réessaie dans quelques instants.") au lieu du code brut.

**Conséquence** : toute nouvelle intégration d'un appel Worker côté front-end doit suivre ce même principe — jamais de code d'erreur technique affiché tel quel à l'utilisateur, toujours au moins un message générique chaleureux en dernier recours.

---

## ADR-29 — Feedback explicatif obligatoire (`hint`) pour toute question, toute matière

**Contexte** (12e conversation, audit pédagogique) : l'inspection du code réel a montré que le feedback sur erreur se limitait, dans la quasi-totalité des générateurs mathématiques, à afficher la bonne réponse (`showCorr()` → `q.hint` ou fallback `Réponse : X`) sans jamais expliquer le raisonnement. Français et Histoire disposaient déjà de l'infrastructure (`_frQ`/`_frText`/`_histQ` acceptent un paramètre `hint`) mais certains appels se contentaient d'échoer la réponse (`hint: f.ok`) sans réelle valeur explicative.

**Décision** : tout générateur de question, dans toute matière actuelle (maths, français, histoire) ou future, doit fournir un champ `hint` qui explique le *raisonnement* ou la *règle* permettant de trouver la réponse — jamais une simple répétition de la réponse elle-même. Un hint qui ne fait qu'échoer `res`/`ok`/`answer` sans ajouter d'information n'est pas conforme à cette règle.

**Conséquence** : lors de l'ajout d'une nouvelle matière ou d'un nouveau générateur, le hint explicatif fait partie intégrante du travail — au même titre que la génération de la question elle-même. Un audit futur peut vérifier la conformité en cherchant les cas où `hint` est absent ou identique à la réponse affichée.

---

## ADR-30 — Révision espacée par cases Leitner + rappel inter-session (toutes matières)

**Contexte** (12e conversation, audit pédagogique, Lot 2) : le système de révision espacée initial (ADR historique, chantier 1.2) reposait sur un plafond brut de 30 erreurs purgées par ancienneté, sans notion de progression de maîtrise, sans distinction entre erreur d'inattention et erreur de compréhension, et sans aucune réactivation entre deux sessions de jeu.

**Décision** : le journal d'erreurs (`P.errorLog`) adopte un système à cases inspiré de Leitner (`box: 0-3`, délais cibles croissants avant reprogrammation : immédiat / 3h / 1j / 7j). Une réponse trop rapide (< 2s, `INATTENTION_MS_THRESHOLD`) est traitée hors case, retestée presque aussitôt. La case maximale déclenche une vérification différée finale avant retrait définitif du suivi, plutôt qu'un retrait après une seule série de bonnes réponses rapprochées. Au retour d'une absence d'au moins un jour (`P.lastPlayTs`), 2-3 révisions sont forcées en tête de session, toutes matières confondues, via `checkInterSessionRevision()`.

**Portée multi-matières** : ce mécanisme vit entièrement dans `06a-adaptive.js`, indépendant de toute logique propre à une matière — il s'applique nativement aux maths, au français, à l'histoire, et à toute matière future sans code supplémentaire, du moment que le générateur de questions journalise ses erreurs via `logError()`/`clearErrorFromLog()` comme le font déjà les trois matières actuelles.

**Conséquence** : toute nouvelle matière doit réutiliser `logError`/`clearErrorFromLog`/`getRevisionErrorToAsk` plutôt que réinventer un mécanisme de révision propre — c'est la garantie que ce standard (cases Leitner, détection d'inattention, rappel inter-session) s'applique automatiquement.

---

## ADR-31 — Interleaving volontaire générique (toutes matières)

**Contexte** (12e conversation, audit pédagogique, Lot 3) : le mélange des types de question était un pur effet de bord du tirage aléatoire dans les pools de chaque générateur. Quand deux catégories proches étaient simultanément en difficulté pour un enfant, rien ne forçait à les présenter en alternance rapprochée, alors que la littérature (Rohrer & Taylor) montre que l'alternance de notions proches aide à mieux les distinguer.

**Décision** : un unique point d'accroche générique dans `generateQ()` (`07-game.js`), `applyInterleaveGuard()` (`06a-adaptive.js`), détecte les 2 catégories réellement les plus faibles du moment (via les stats déjà suivies : `P.opStats` pour les maths, `P.opStatsFr`/`P.opStatsHist` pour le français/l'histoire — pas de liste de paires "confusables" fabriquée à l'avance) et force/favorise leur alternance. Hors boss et hors maternelle. Alternance quasi garantie en maths (catégorie connue avant génération), favorisée par nouveaux tirages successifs en français/histoire (catégorie connue seulement après génération, via `_frCatOf`/`_histCatOf`).

**Portée multi-matières** : ce mécanisme est branché une seule fois, au point d'appel générique du générateur de question (`_subjGen()` dans `generateQ()`), pas par matière. Toute matière future suivant le même schéma (« générateur de niveau → question avec `opKey` ») en bénéficie automatiquement sans code supplémentaire, à condition d'alimenter des stats de catégorie par matière comme le font déjà `opStats`/`opStatsFr`/`opStatsHist`.

**Conséquence** : une nouvelle matière qui introduirait un système de stats différent du format `{ok, fail}` par catégorie devra adapter `_catStatsFor()` en conséquence — seul point de couplage explicite à maintenir.

---

*Document vivant — toute nouvelle décision d'architecture significative doit y être ajoutée, avec son numéro d'ADR, son contexte, sa décision et sa conséquence pour le futur.*
