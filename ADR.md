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

## ADR-32 — Aide visuelle après échecs répétés sur une même question

**Contexte** (12e conversation, audit pédagogique, Lot 4) : la correction affichée après une erreur se limitait à un texte (`💡 Réponse : X` ou un hint depuis le Lot 1), quel que soit le nombre de fois où l'enfant se trompait sur la même question précise.

**Décision** : `showCorr()` (`07-game.js`) affiche désormais un visuel SVG simple (droite numérique pour +/−, groupement de points pour ×/÷, barre de fraction) en complément du texte, déclenché après 2 échecs consécutifs sur *exactement* la même question (`getFailStreak()`, `06a-adaptive.js`). Un cas ciblé existe aussi en français (carte de contraste pour les homophones). L'histoire n'a pas eu besoin d'ajout : ses questions de frise affichent déjà un visuel dès l'énoncé.

**Garde-fous** : chaque générateur de visuel refuse de produire un rendu si les nombres impliqués rendraient le visuel illisible (ex. bond de plus de 20 sur la droite numérique, plus de 48 points en groupement) — dans ce cas, la correction reste purement textuelle, sans erreur.

**Portée multi-matières** : point d'entrée unique `getVisualAid(subj, q)` — toute matière future ajoute sa propre branche dans cette fonction sans toucher au reste du mécanisme (déclenchement, compteur d'échecs, affichage).

---

## ADR-33 — Objectif de session visible (toutes matières)

**Contexte** (12e conversation, audit pédagogique, Lot 5) : l'enfant n'avait aucune visibilité sur ce qu'il allait travailler en lançant une partie, hors mode "Devoir du jour" fixé par un parent. Décision initiale d'un encart supplémentaire sur l'écran d'accueil écartée par Cyril (écran déjà chargé) au profit d'un toast au lancement de partie.

**Décision** : `getSessionObjectiveText(subj)` (`06a-adaptive.js`) génère un objectif à partir des stats du joueur — `analyzeOpProfile()` (déjà existant) pour les maths, nouvelle fonction miroir `analyzeCatProfile()` pour les matières à catégories (français, histoire). Calculé une seule fois par jour (`P.sessionObjective`, daté), pas à chaque partie, pour rester stable et lisible. Affiché en toast au lancement de partie (`startGame()`, `07-game.js`), jamais si un devoir parent est actif (pas de superposition de deux messages).

**Portée multi-matières** : `_catLabel(subj, cat)` suit la même convention que `_hwOpLabel()` (Chantier C3) — toute matière future à catégories ajoute un cas ici, réutilisant son propre `XXX_CAT_FILTERS`.

**Mise à jour (Lot 7, pt.11)** : plutôt que d'ajouter un second toast pour le "point faible formulé positivement" demandé au pt.11 de l'audit, la fonction a été enrichie pour produire une formulation double ("tu progresses bien en X — continuons Y") quand une force et une faiblesse nettement distinctes sont mesurables (écart de réussite ≥25 points, `analyzeOpProfile`/`analyzeCatProfile` retournent désormais aussi `strongest`) — un seul message par session, plus riche, au lieu de deux messages redondants.

**Conséquence** : une matière future sans système de catégories devra fournir l'équivalent d'`analyzeOpProfile`/`analyzeCatProfile` (ratio de réussite par sous-thème avec seuil de confiance) pour bénéficier de ce mécanisme — sinon elle retombe sur le message générique encourageant par défaut, ce qui reste correct mais moins ciblé.

---

## ADR-38 — Équilibre motivation extrinsèque/intrinsèque (choix assumé)

**Contexte** (12e conversation, audit pédagogique, Lot 6, pt.24) : l'audit a identifié une boucle de motivation presque exclusivement extrinsèque (étoiles, score, combos, PV, boss, figurines, badges) avec peu de leviers d'autonomie ou de sens. La littérature (Deci & Ryan, théorie de l'autodétermination) montre qu'une motivation extrinsèque forte peut, sur la durée, éroder la motivation intrinsèque si elle n'est pas équilibrée.

**Décision assumée** : le jeu reste, par choix de conception, riche en récompenses extrinsèques — c'est le moteur d'engagement principal du produit et une refonte complète n'est pas à l'ordre du jour. En revanche, la **conséquence anxiogène de l'erreur** (perte de vie, fin de partie possible) est traitée séparément : elle est neutralisée par défaut via le "Mode serein" (cf. ADR-34, Lot 6 pt.2), qui retire la pression de performance sans toucher au reste de la boucle motivationnelle (score, étoiles, combos restent inchangés). C'est un compromis délibéré : garder l'engagement fort du jeu tout en retirant spécifiquement la composante la plus problématique pour le droit à l'erreur, plutôt qu'une refonte motivationnelle globale.

**Conséquence** : les futurs audits pédagogiques ne doivent pas re-signaler "motivation trop extrinsèque" comme un manque non traité — c'est un choix de conception explicite, documenté ici. Un futur travail sur l'autonomie de choix côté enfant (pt.12 de l'audit initial, non traité dans cette série de lots) resterait pertinent et n'est pas invalidé par cette décision.

---

## ADR-34 — Mode serein (neutralisation de la perte de vie, hors maternelle)

**Contexte** (12e conversation, audit pédagogique, Lot 6, pt.2) : hors maternelle, une erreur décrémente les PV et peut terminer la partie — en tension avec le principe du droit à l'erreur, particulièrement pour les enfants anxieux ou en difficulté. Décision de conception demandée à Cyril entre 3 options ; choix retenu : mode optionnel contrôlé par le parent. **Défaut initial "actif" révisé en cours de conversation par Cyril → défaut final "désactivé"** (comportement classique conservé tant que le parent n'a rien changé).

**Décision** : `P.prefs.calmMode` (booléen, absent ou `false` = comportement classique, `true` = mode serein) contrôle `hitPlayer()` (`07-game.js`) — en mode serein, l'erreur reste visible et traitée (son, tremblement, feedback rouge, correction) mais ne décrémente pas les PV et ne peut pas déclencher `endGame(false)`. Un parent peut activer ce mode par enfant depuis l'onglet Encadrement de la Vue Parent (accordéon "🕊️ Mode serein", décoché par défaut).

**Portée** : ne concerne que le mode normal solo (`hitPlayer`). Le mode Combat multijoueur (`validateCombat`) reste inchangé — compétitif par nature entre plusieurs enfants, hors du périmètre de ce lot (le droit à l'erreur individuel n'est pas le même enjeu dans un contexte de jeu entre pairs qui a ses propres règles sociales).

**Conséquence** : toute future mécanique de "conséquence sur erreur" en mode solo devra vérifier `P.prefs.calmMode` de la même façon, pour rester cohérente avec ce réglage parent.

---

## ADR-35 — Cloisonnement de `classStats` par matière (pt.28)

**Contexte** (12e conversation, audit pédagogique, Lot 7, pt.28) : `_progWeakType()` calculait le "point faible n°1" à partir de `P.classStats[niveau][opKey]`, sans dimension matière — les catégories de français/histoire et les opérateurs mathématiques d'un même niveau scolaire (ex. "CE1") se retrouvaient mélangés dans le même comparatif. En pratique, ce bug était masqué car le panneau parent n'affichait le point faible que pour les maths (`curSubj==='math'` en dur) — ce qui empêchait aussi le pt.28 (repères de progression par matière) de fonctionner pour le français et l'histoire.

**Décision** : nouveau format `P.classStats[matière][niveau][opKey]`. Compatibilité ascendante : `_progWeakType()` retombe sur l'ancien format à plat (`P.classStats[niveau][opKey]`) uniquement pour la matière maths, si aucune donnée n'existe encore au nouveau format — aucune perte de l'historique des profils créés avant cette version. Le panneau "Point faible n°1" de la Vue Parent s'affiche désormais pour **toute matière jouée**, plus seulement les maths.

**Conséquence** : toute matière future doit appeler `_classStatUpdate(subj, level, opKey, correct)` avec sa propre clé de matière (comme le font déjà maths/français/histoire) pour bénéficier automatiquement du panneau "Point faible" et des repères de progression par compétence dans la Vue Parent.

---

## ADR-36 — Double codage visuel dès l'énoncé (fractions, géométrie)

**Contexte** (12e conversation, audit pédagogique, Lot 8, pt.17) : les questions de fractions (CM2/6e) et de géométrie (`GEO_Q`) n'affichaient un visuel qu'après 2 échecs consécutifs (Lot 4) ou jamais. Le principe du double codage (Mayer) veut que le visuel accompagne le texte dès la première présentation de la question, pas seulement en rattrapage.

**Décision** : `q.visualHtml` est désormais renseigné directement à la génération pour les fractions (réutilise `_svgFractionBar` du Lot 4) et pour les 5 générateurs de `GEO_Q` (3 nouveaux visuels : `_svgSquare`, `_svgRectangle`, `_svgTriangleAngles`, `02-data.js`/`06a-adaptive.js`). Aucun changement pour français/histoire — pas de grandeur à représenter géométriquement pour ce point précis de l'audit.

**Conséquence** : toute future notion mathématique impliquant une grandeur ou une forme représentable devrait suivre ce même principe — visuel posé dans `q.visualHtml` dès la génération plutôt qu'ajouté seulement en correction.

---

## ADR-37 — Contextualisation narrative des calculs (pt.15)

**Contexte** (12e conversation, audit pédagogique, Lot 9, pt.15, dernier point de cette série) : les calculs restaient presque toujours décontextualisés ("7 × 8") malgré une couche narrative riche par ailleurs, offrant peu d'occasions de transfert contextualisé.

**Décision** : `narrativeWrapMath()` (`06a-adaptive.js`) habille ~20% des questions d'addition/soustraction/multiplication de base (primaire, mode normal, hors boss/maternelle) dans une mise en situation à la 2e personne, en réutilisant uniquement des éléments génériques d'aventure (cristaux, pièces, parchemins, coffres) plutôt que de fouiller `07-story.js` en profondeur — portée volontairement scopée pour rester proportionnée. Le calcul interne (`a`, `b`, `res`, `opKey`) n'est jamais modifié, seul `q.display` change.

**Limite connue et acceptée** : la révision espacée (ADR-30, Lot 2) reconstruit une question rejouée à partir d'un motif `"12 - 5"` reconnaissable dans `q.display`. Une question narrativisée ne matche pas ce motif — elle reste suivie et comptée normalement dans le journal d'erreurs, mais ne sera pas reconstruite pour un replay automatique via ce mécanisme précis. Corriger ce point demanderait de dupliquer le stockage (snapshot complet comme pour les QCM) pour un gain marginal ; non traité dans ce lot.

**Portée** : maths uniquement — le français et l'histoire ont déjà des questions intrinsèquement contextualisées.

**Conséquence** : une future extension de ce mécanisme (autres opérateurs, mise en scène plus riche puisant dans le contenu narratif réel des chapitres) devrait garder le même principe : ne jamais modifier `a`/`b`/`res`/`opKey`, uniquement `display`.

---

---

## ADR-39 — Clés de paliers basées sur le seuil, pas sur l'index (pt.16)

**Contexte** (13e conversation, audit engagement, Lot 3, pt.16) : les paliers longue durée (`MILESTONES`, `02-data.js`) étaient trop espacés pour un jeune enfant (ex. Maître Calcul : 1000 → 5000 d'un coup). L'ajout de paliers intermédiaires était nécessaire, mais `checkMilestones()` identifiait chaque palier déjà validé par son INDEX dans le tableau (`id_0`, `id_1`...) — un ajout au milieu de la liste aurait décalé tous les index suivants et faussé rétroactivement les récompenses déjà obtenues par les enfants qui jouent déjà.

**Décision** : la clé de validation passe de `${id}_${index}` à `${id}_${goal}` (le seuil lui-même), stable quel que soit l'ordre ou le nombre de paliers ajoutés par la suite. Migration ponctuelle en V8 (`SAVE_VERSION`, `05-profile.js`) qui convertit les anciennes clés indexées vers le nouveau format, à partir d'une table figée des seuils tels qu'ils existaient AVANT ce lot (`_MIGRATIONS[8]`). Vérifiée manuellement (`mastermath_0`→`mastermath_100`, `explorer_1`→`explorer_3`, clé inconnue laissée intacte).

**Conséquence** : toute future insertion de palier intermédiaire dans `MILESTONES` est désormais sans risque pour les profils existants. Ne jamais revenir à une clé basée sur l'index.

---

## ADR-40 — File de messages séquentielle au démarrage de partie

**Contexte** (13e conversation, audit engagement, Lot 4) : `startGame()` (`07-game.js`) avait accumulé plusieurs messages d'accueil indépendants (objectif du jour, Mode serein, sens de la matière, accueil après absence, série de jours) chacun sur un délai fixe. Tous partagent le même élément `#toast` (`toast()`, `01-core.js`) : un second appel écrase le premier avant la fin de son affichage — les délais fixes se chevauchaient et rendaient certains messages invisibles.

**Décision** : les messages candidats sont empilés dans un tableau local (`_startMsgs`) puis défilés séquentiellement (délai cumulé = durée du message précédent + pause), au lieu de délais fixes indépendants. La boîte de dialogue de choix d'objectif (modale, pas un toast) reste prioritaire et s'affiche en premier quand elle est présente.

**Conséquence** : toute future addition de message de démarrage DOIT passer par `_startMsgs.push({text, dur})` plutôt que par un `setTimeout(()=>toast(...), délai_fixe)` isolé, sous peine de recréer le bug de chevauchement.

---

## ADR-41 — "Prochain badge" limité aux badges à données persistantes (pt.17)

**Contexte** (13e conversation, audit engagement, Lot 3, pt.17) : mise en avant du badge non obtenu le plus proche du déblocage. Plusieurs badges (`BADGES`, `02-data.js`) dépendent de l'état d'une partie EN COURS (`GS`, ex. `score50`, `no_error`) plutôt que de données persistantes du profil (`P`) — leur progression n'est pas mesurable en dehors d'une partie active.

**Décision** : `_BADGE_PROGRESS` (`07-game.js`) ne couvre que les badges calculables depuis `P` seul (`first_win`, `veteran`, `lvl10`, `combo5`, `combo10`, `map_boss1`). Les badges liés à `GS` sont exclus de la mise en avant plutôt que d'afficher une progression fictive ou toujours à 0%.

**Conséquence** : tout futur badge dont la condition ne dépend QUE de données persistantes de `P` peut être ajouté à `_BADGE_PROGRESS` pour bénéficier de la mise en avant ; un badge dépendant de `GS` ne le peut pas sans refonte (ex. stocker un meilleur score persistant par mode).

---

## ADR-42 — Ciblage partiel du défi hebdomadaire par faiblesse détectée (pt.22)

**Contexte** (13e conversation, audit engagement, Lot 3, pt.22) : le défi hebdomadaire (`WEEKLY_CH`, `02-data.js`) était tiré au hasard. L'audit recommandait de le cibler sur la faiblesse réelle du joueur, comme déjà fait pour les quêtes journalières intelligentes.

**Décision assumée** : seul le défi "Soustractions" (`w2`) a une correspondance fiable avec une clé de `P.opStats` (`weakOpKey:'-'`). Les défis "Tables de 2/7" et "Nombres manquants/Fractions" n'ont pas d'équivalent direct dans les stats persistantes actuelles (`P.opStats` ne distingue pas par table de multiplication) — leur ajouter un `weakOpKey` aurait fabriqué une correspondance artificielle. Quand la faiblesse détectée correspond à un `weakOpKey` connu, ce défi est favorisé à 70% (pas 100%, pour garder une part de variété) ; sinon, tirage aléatoire inchangé.

**Conséquence** : un ciblage plus complet nécessiterait un suivi de performance par table de multiplication (actuellement absent de `P.opStats`) — non traité dans ce lot, à envisager si ce niveau de granularité devient utile ailleurs.

---

## ADR-43 — Créateur d'avatar par calques : mis en pause (pt.28)

**Contexte** (13e conversation, audit engagement/gamification, point 28) : l'audit avait identifié à tort une absence de personnalisation d'avatar — le jeu permet déjà de choisir un avatar emoji parmi ceux débloqués selon le stade du héros (`renderAvatars()`/`selectAvatar()`, `08-ui.js`). Cyril souhaitait en réalité un système bien plus ambitieux : un vrai créateur par calques (silhouette, teint, coiffure, yeux, chapeau, visage, haut, bas, chaussures, accessoire en main), avec des centaines de combinaisons débloquées par la progression ou achetables en étoiles.

**Décision** : concept validé sur le fond (catégories, volume, double économie progression/étoiles sans nouvelle monnaie) après une maquette en style chibi. Le chantier est mis en pause avant tout code — Cyril a choisi de ne pas poursuivre pour l'instant, sans rejet du concept.

**Ce qui reste à faire si le chantier est repris** :
- Choisir et figer le style visuel final (base chibi validée, déclinaisons à approfondir).
- Concevoir le moteur de rendu (formes SVG paramétrables recolorées dynamiquement, plutôt que des centaines d'images dessinées à la main).
- Découper en lots successifs (moteur de rendu → écran de création → intégration boutique étoiles → déblocages par niveau → remplacement de l'avatar emoji dans les écrans qui l'affichent : combat, classement, dashboard, etc.).

**Conséquence** : le système d'avatar emoji actuel reste la personnalisation en place. Aucune régression, aucun code résiduel de ce chantier n'a été introduit.

---

## ADR-44 — Histoire déclenchée automatiquement aux moments-clés (chantier engagement narratif)

**Contexte** (14e conversation) : Cyril a signalé que les pages d'histoire (victoire d'îlot, chapitre d'entrée) n'apparaissaient qu'en rouvrant manuellement la carte (`_maybeShowStory()` n'était appelée que depuis `openMap()`), ce qui cassait l'immersion — le joueur devait "aller chercher" la suite de l'histoire au lieu qu'elle vienne à lui.

**Décision** : `_maybeShowStory()` accepte désormais un callback optionnel `afterCb`, permettant de la déclencher directement à la fin de la cinématique "ÎLOT CONQUIS" (`playIslandVictory`, boss d'îlot vaincu) et à la fin de l'animation de marche de l'avatar vers un nouvel îlot (`requestZoneOpen`), en chaînant l'action suivante (ouverture de la modale de zone) après la fermeture de la page d'histoire. `openMap()` conserve son appel existant en filet de sécurité (si le joueur ferme l'app avant de voir l'histoire, elle apparaîtra à la prochaine ouverture de la carte).

**Conséquence** : toute future page d'histoire à déclenchement automatique doit passer par `_maybeShowStory(afterCb)` plutôt que par un appel direct à `_showStoryModal()`, pour rester cohérente avec la chaîne d'affichage.

---

## ADR-45 — Ton des dialogues de combat adapté au cycle (maternelle vs primaire/collège)

**Contexte** (14e conversation, Lot B engagement narratif) : les dialogues de monstres/boss (`MONSTER_DIALOGUES`) et les taunts de mauvaise réponse (`WRONG_TAUNTS`) étaient un pool UNIQUE partagé par tous les niveaux, y compris la maternelle (3-6 ans) — un enfant de PS pouvait voir "${zone} sera ton tombeau" ou "Pathétique. Recommence." Le taunt de bonne réponse était déjà exclu en maternelle (remplacé par `_matCelebrate()`, un mécanisme visuel), mais pas le reste.

**Décision** : `MONSTER_DIALOGUES` est réorganisé en deux tons (`standard`, `tender`), sélectionnés via `_dialogueTone()` selon `_isMaternelle(GM.level)`. `WRONG_TAUNTS`/`CORRECT_TAUNTS` ont chacun un pendant `_TENDER`, sélectionné via `_taunt(kind)`. Le contenu `standard` est inchangé (primaire/collège).

**Conséquence** : toute future réplique de combat (monstre, taunt, réaction) doit être ajoutée aux DEUX pools (`standard` et `tender`) ou passer par un mécanisme équivalent — ne jamais réintroduire un pool unique partagé avec la maternelle.

---

## ADR-46 — Carnet fragmenté : le chapitre d'un îlot s'étale sur ses zones (pt.5)

**Contexte** (14e conversation, Lot C engagement narratif) : le chapitre d'une région (10-14 pages) s'affichait entièrement d'un bloc à l'entrée de l'îlot, puis plus rien jusqu'à la scène de victoire — l'histoire ressemblait à un prétexte plaqué au début/à la fin plutôt qu'à un fil continu.

**Décision** : le texte du chapitre n'est PAS réécrit. Il est simplement étalé : la page 0 s'affiche à l'entrée de l'îlot (`_maybeShowStory`, cas 4), les pages suivantes s'affichent une à une après chaque zone conquise (`_maybeShowZoneFragment`, appelée depuis le callback de `playZoneVictory` dans `07-game.js`), et la toute dernière page est systématiquement regroupée avec la scène de victoire du Cristal pour clore le chapitre en beauté. Un compteur persistant `P.storyPageIdx[regionId]` retient la prochaine page à montrer. Si un îlot a plus de pages que de zones intermédiaires, les pages non montrées s'accumulent et sont regroupées avec la victoire (aucun texte perdu). Le journal de quête (relecture manuelle) continue d'afficher le chapitre complet d'un bloc, inchangé — seul le déclenchement automatique en jeu est fragmenté.

**Conséquence** : un chapitre à une seule page n'est jamais fragmenté (comportement inchangé). Toute future page ajoutée à un chapitre existant profite automatiquement du même étalement, sans code supplémentaire. Ne jamais faire avancer `P.storyPageIdx` en dehors de `_advanceStoryPage()`.

---

## ADR-47 — Rebondissement mi-îlot et carte vivante (Lot D)

**Contexte** (14e conversation, Lot D engagement narratif) : au-delà du carnet fragmenté (ADR-46), Cyril souhaitait (1) un vrai rebondissement narratif au milieu de chaque îlot, et (2) que la carte du monde elle-même "vive" entre deux zones plutôt que de rester muette.

**Décision** :
- **pt.6** : `_maybeShowTwist()` déclenche, une seule fois par région, sur une zone choisie entre 33% et 66% de la progression de l'îlot (position variable par région via `_archHash`, non prévisible), une page générique de rebondissement (6 variantes, placeholder `{villain}`). Chaîné juste avant le fragment de carnet normal dans `07-game.js`.
- **pt.10** : `_maybeShowLivingMapCaption()`, appelée depuis `openMap()` (après vérification qu'aucune page d'histoire ne vient de s'afficher), montre ~35% du temps un bandeau sous l'avatar avec une phrase générique sur la zone suivante/précédente. Maquette validée par Cyril (Option A — bandeau flottant) avant tout code.

**Conséquence** : toute nouvelle mécanique narrative "ambiante" (déclenchée par le temps/la position plutôt que par une action précise) devrait suivre le même principe : contenu générique templaté + placeholders `{villain}`/`${zone}`, fréquence limitée, jamais deux fois de suite sur le même déclencheur.

---

## ADR-48 — Le système narratif automatique est générique par construction, y compris pour les futures Odyssées

**Contexte** (14e conversation) : Cyril a demandé confirmation que le système d'affichage automatique (entrée d'îlot, fragments de carnet, rebondissement, victoire, questgiver) fonctionne bien sur les 7 aventures existantes ET s'appliquera automatiquement à toute future Odyssée, sans code supplémentaire.

**Vérification effectuée** : inspection directe des données réelles (`_PRIM_STORY`, `_MAT_STORY`, `_MAT_STORY_FR`, `_PRIM_STORY_FR`, `_PRIM_STORY_HIST`, `_COL_STORY_FR`…) confirmant que `_maybeShowStory`/`_maybeShowZoneFragment`/`_maybeShowTwist`/`_pickQuestGiverLine` ne référencent jamais un nom d'aventure, de matière ou de niveau en dur — uniquement `_STORY`, `MAP_ZONES` et `_ARCH_REGIONS`, qui sont substitués dynamiquement par `07-map.js` selon `GM.adventure`.

**Décision / règle pour l'avenir** : toute nouvelle Odyssée (nouvelle matière, nouveau niveau, ou refonte narrative) hérite AUTOMATIQUEMENT de tout le système construit en 14e conversation (entrée d'îlot automatique, carnet fragmenté, rebondissement mi-îlot, carte vivante, questgiver, ton adapté à la maternelle), à condition de respecter les conventions déjà en place :
- une entrée dans `_ARCH_REGIONS_*` par région/îlot, avec un `id` stable ;
- un chapitre dans `_STORY.chapters[regionId]` avec un tableau `pages` (idéalement autant de pages que de zones + 1, pour une répartition régulière — voir limite ci-dessous) ;
- une scène dans `_STORY.victories[regionId]` pour chaque région non-finale ;
- les zones de la région listées dans `MAP_ZONES` avec `region: regionId` (ou `levels` correspondants).

**Limite connue — ⚠️ OBSOLÈTE, voir ADR-58** : ~~si un chapitre a beaucoup plus de pages que de zones dans son îlot (ex. 11 pages pour 4 zones), les pages excédentaires s'accumulent et sont montrées d'un bloc avec la scène de victoire plutôt que d'être bien réparties. Pas de perte de contenu, mais moins fluide. Non corrigé à ce stade — à traiter si Cyril le demande.~~ Cette limite décrivait un symptôme de l'ancien système de fragmentation du carnet (Lot C, ADR-46), retiré depuis par ADR-49 (v12.2.0). Un chapitre est désormais toujours montré entièrement d'un bloc à l'entrée de région ; la scène de victoire (`_STORY.victories[regionId]`) est un contenu totalement séparé, jamais mélangé aux pages du chapitre. Aucune correction nécessaire.

---

## ADR-49 — Annulation de la fragmentation du chapitre (ADR-46) : le briefing d'îlot doit rester un bloc

**Contexte** (14e conversation) : Cyril a fait remarquer, à juste titre, que le chapitre d'un îlot fonctionne comme un BRIEFING — il explique la situation et la mission (pourquoi le héros doit intervenir, ce qu'il doit y faire) AVANT que le joueur commence à agir. Or la fragmentation introduite par l'ADR-46 pouvait faire apparaître ces informations critiques (parfois dès la page 1, parfois bien plus loin) APRÈS que le joueur a déjà conquis une ou plusieurs zones, voire tout l'îlot. C'est une rupture de cohérence de fond, pas un détail cosmétique — quel que soit le découpage choisi, rien ne garantissait que l'information essentielle arrive avant l'action.

**Décision** : **ADR-46 est annulée.** Le chapitre d'entrée d'un îlot est de nouveau montré ENTIER, d'un bloc, à l'entrée de l'îlot — exactement comme avant le Lot C. `_nextStoryPage()`/`_advanceStoryPage()` sont conservées dans le code (compatibilité avec d'anciens profils ayant un `P.storyPageIdx` en cours) mais ne sont plus appelées activement.

**Remplacement** : la continuité narrative pendant l'îlot est désormais assurée par `_ZONE_OUTRO` — un texte **unique, écrit à la main, par zone** (172 zones au total, toutes les 7 aventures existantes), affiché après CHAQUE zone conquise via `_maybeShowZoneOutro()`. Contrairement à l'ancien fragment de chapitre, ce texte :
- ne révèle jamais d'information sur la mission (réservée au chapitre d'entrée) ;
- reste cohérent avec le lieu exact (nom de la zone, thème, boss vaincu) et le ton de l'aventure (fantaisie pour prim/mat, littéraire pour colfr, historique et sans compagnon pour primhist, etc.) ;
- varie par catégorie (remerciement des habitants, encouragement du compagnon, inquiétude du méchant, changement du décor, doute du héros, teaser) selon la position de la zone dans l'îlot.

**Conséquence pour l'avenir** : toute nouvelle région/îlot ajoutée à une aventure existante, ou toute nouvelle Odyssée, doit avoir une entrée `_ZONE_OUTRO[zoneId]` écrite à la main pour CHAQUE zone (pas de texte générique de repli). Le chapitre de région, lui, reste toujours un bloc unique montré à l'entrée — ne jamais le refragmenter sans repasser par cette même discussion de cohérence.

---

## ADR-50 — Moment charnière à mi-Odyssée : conseil + choix à poids narratif (pts 4 et 6, contenu validé)

**Contexte** (14e conversation) : ajout de deux nouveaux points d'engagement narratif — un "conseil" qui fait le point avec le compagnon en citant la progression réelle du joueur (pt.6), et un choix à 2 options dont une phrase de l'épilogue varie en conséquence (pt.4). Emplacement voulu par Cyril : **entre 1/3 et 2/3 de l'Odyssée**, sur une région choisie pour sa cohérence avec le lieu et le scénario — jamais un calcul arithmétique brut, jamais un copier-coller de situation d'une aventure à l'autre.

**Erreur initiale corrigée avant validation** : une première proposition plaquait un schéma "conseil de guerre contre le méchant" sur TOUTES les aventures, y compris la maternelle — alors qu'après relecture complète de `_MAT_STORY` et `_MAT_STORY_FR`, le méchant (Nuage Grognon / le Silence) n'apparaît JAMAIS avant la toute dernière région de ces deux histoires. Les régions intermédiaires n'ont aucune confrontation, juste "aider un petit ami à retrouver sa couleur/son mot". Leçon : **toujours relire le texte réel d'une histoire avant d'y greffer un nouveau système**, ne jamais supposer qu'une structure valable pour une aventure s'applique telle quelle à une autre.

**Décision (contenu validé par Cyril, à coder)** :

| Aventure | Région choisie | Nature du choix |
|---|---|---|
| Maths primaire | Royaumes Périlleux (cm1) | Pont fragile : traverser vite seul, ou consolider pour le groupe |
| Français primaire | Les Halles du Vocabulaire (ce2) | Texte effacé : déchiffrer vite au risque de se tromper, ou vérifier chaque mot |
| Maths maternelle | Les Bois Dorés (ce2, fin PS/début MS) | **Pas de méchant, pas d'enjeu** — juste un petit moment ludique avec le hibou |
| Français maternelle | Les Collines qui Chantent (ce2, fin PS/début MS) | **Pas de méchant, pas d'enjeu** — petit moment ludique avec l'écho |
| Maths collège | La Citadelle Algébrique (cm1) | Grimoire qui se désagrège : le recopier (temps perdu) ou le laisser (savoir perdu) |
| Français collège | Livre III — L'Art de Convaincre (ce2) | Pamphlet contre le Chancelier : publier tout de suite (risqué) ou attendre |
| Histoire primaire | Le Moyen Âge (cm1) | Choix stratégique (réparer les remparts vs partir en reconnaissance), pas moral — cohérent avec le contenu pédagogique réel |

**Règle pour toute future Odyssée** : ce moment charnière doit être conçu APRÈS relecture complète de l'histoire concernée, jamais par analogie avec une autre aventure. Pour les histoires sans confrontation directe au méchant en milieu de parcours (comme la maternelle), le mécanisme reste présent (conseil + petit choix) mais SANS enjeu moral ni mention du méchant — un simple moment de reconnaissance des amis déjà aidés.

**Statut technique** : **codé et testé** (v12.2.1). `_MAJOR_MOMENT` (07-story.js) centralise les 7 contenus. `_maybeShowMajorMoment()` se déclenche juste après l'affichage du chapitre d'entrée de la région désignée (chaînée depuis le cas 4 de `_maybeShowStory`) : conseil (`_showStoryModal`, 1 page) puis choix (`_showChoiceModal`, nouvelle fonction, 2 boutons empilés, même habillage visuel que le parchemin d'histoire — maquette validée avant code). Le choix est mémorisé dans `P.majorChoiceByAdv[advKey]`. La phrase de conséquence est ajoutée dynamiquement comme page supplémentaire de l'épilogue (cas 3 de `_maybeShowStory`), sans jamais modifier les tableaux `pages` statiques de `_STORY` eux-mêmes. Pour la maternelle, `epilogueA`/`epilogueB` valent `null` : aucune page n'est ajoutée à l'épilogue, conformément à la règle "pas d'enjeu, pas de branche".

---

## ADR-51 — Correctif du reset Odyssée : remise à zéro réellement complète (signalement Cyril)

**Contexte** (14e conversation) : Cyril a signalé 3 problèmes sur `resetAdventure()` (bouton "Reset Aventure", écran parent) :
1. Le message affiché ne parlait que de "l'aventure mathématique", alors que `P.mapBossBeaten` est une liste UNIQUE partagée par les 7 aventures (maths/français/histoire × maternelle/primaire/collège) — le reset touchait donc déjà, en réalité, les 7 à la fois, mais le texte mentait sur la portée.
2. `P.storySeen` (chapitres, victoires, épilogues déjà vus) n'était JAMAIS remis à zéro : après un reset, la progression de carte repartait de zéro mais les pages d'histoire déjà débloquées restaient marquées comme lues — incohérence directe avec le principe "comme si le joueur n'y avait jamais joué".
3. Seul l'ancien champ `P.mapAvatarZone` (compat historique, aventure `prim` uniquement) était réinitialisé — `P.mapAvatarZoneByAdv` (position par aventure, introduite quand le multi-aventures a été généralisé) ne l'était jamais : l'avatar des 6 autres aventures restait sur sa dernière zone jouée.

**Décision** : nouvelle fonction `_allOdysseyStorySeenIds()` (07-story.js) qui énumère, en lisant directement les 7 objets `_STORY` et les tableaux de zones/régions correspondants, la liste EXHAUSTIVE de tous les IDs `storySeen` possibles (intro, chapitres, victoires, épilogues, histoires bonus "Livre", fragments `outro_*` par zone, rebondissements `twist_*` par région, moment charnière `majormoment_*`). `resetAdventure()` filtre `P.storySeen` avec cette liste (+ un filet de sécurité regex `_p\d+$` pour d'anciens fragments de l'ADR-46, annulée) plutôt que de tenter une remise à zéro totale aveugle — pour ne jamais effacer par erreur un `storySeen` qui contiendrait, à l'avenir, une entrée sans rapport avec l'Odyssée. Reset désormais complet : `mapBossBeaten`, `mapAvatarZone` + `mapAvatarZoneByAdv`, `zoneProgress`, `storySeen` (filtré), `storyPageIdx`, `majorChoiceByAdv`, `twistLinesUsedByAdv`, `_epilogueBonusCredited`, `levelWins`. Message utilisateur corrigé pour annoncer honnêtement la portée réelle (7 aventures).

**Conséquence pour l'avenir** : toute nouvelle donnée persistée liée à l'Odyssée (nouveau système narratif, nouvelle Odyssée ajoutée) DOIT être ajoutée soit à `_allOdysseyStorySeenIds()` (si c'est un id dans `storySeen`), soit explicitement à la liste des champs réinitialisés dans `resetAdventure()` (si c'est un champ à part, comme `majorChoiceByAdv`) — sous peine de reproduire exactement ce bug pour la prochaine fonctionnalité.

---

## ADR-52 — Lint en routine de livraison + CI minimal + checklist annotée (méta-audit, Lot 1)

**Contexte** (méta-audit stratégique, prompt 12, Lot 1) : `eslintrc.json`/`_prettierrc.json` existaient depuis longtemps mais rien ne garantissait leur exécution avant chaque livraison, contrairement aux 182 tests Vitest, systématiquement lancés. Vérification du code réel : `npm run lint` (portée réelle `eslint js/`, pas les fichiers de test) renvoie **0 erreur, 457 avertissements** (essentiellement `no-unused-vars`/`no-undef`, non bloquants dans la config actuelle) — le code est donc déjà propre au sens strict du terme, aucun correctif nécessaire pour ce lot.

**Décision** :
1. `npm run lint` est désormais exécuté avant chaque livraison de code, au même titre que les tests — discipline de process, pas de changement de fichier source.
2. Ajout de `.github/workflows/ci.yml` (GitHub Actions) : lance `npm install && npm test && npm run lint` à chaque push/pull request. Utilise `npm install` et non `npm ci`, car `_gitignore` exclut volontairement `package-lock.json` (choix déjà en place, pas remis en cause ici). Ne change rien au déploiement manuel existant (PowerShell + copier-coller Cloudflare) — c'est un garde-fou supplémentaire, pas un remplacement. Non vérifiable depuis cet environnement (pas d'accès à l'exécution réelle de GitHub Actions) — à confirmer par Cyril après le premier push.
3. `CHECKLIST-non-regression.md` annotée point par point : chaque item déjà couvert (même partiellement) par un test Vitest porte désormais un repère 🧪 avec le nom du fichier de test concerné, pour éviter de re-tester à la main ce qui l'est déjà côté logique — la vérification manuelle reste nécessaire pour tout ce qui touche au rendu visuel/audio réel, qu'aucun test ne couvre.

**Conséquence** : toute nouvelle fonctionnalité livrée doit passer `npm run lint` sans nouvelle erreur (les avertissements existants ne sont pas bloquants, mais aucune nouvelle erreur ne doit apparaître). Tout nouveau test Vitest ajouté à `tests/` devrait être répercuté dans `CHECKLIST-non-regression.md` par un repère 🧪 sur le point qu'il couvre, pour que la checklist reste un reflet fidèle de ce qui est déjà automatisé.

---

## ADR-53 — Nettoyage du code mort d'ADR-49 + garde-fou de non-régression pour le reset (méta-audit, Lot 2)

**Contexte** (méta-audit stratégique, prompt 12, Lot 2) : `P.storyPageIdx`, `_nextStoryPage()` et `_advanceStoryPage()` (07-story.js) n'avaient plus aucun appelant depuis l'annulation de la fragmentation du carnet (ADR-46 → ADR-49), mais restaient dans le code. Par ailleurs, le bug corrigé par ADR-51 (champs persistants Odyssée oubliés dans `resetAdventure()`) n'avait aucune protection automatisée contre sa réapparition.

**Décision** :
1. `_nextStoryPage()` et `_advanceStoryPage()` supprimées de `07-story.js` (vérifié au préalable : aucun test, aucun autre fichier du jeu ne les référence). Le champ `P.storyPageIdx` lui-même n'est PAS retiré du reset (`resetAdventure()`, 10-figurines.js) — il continue d'être remis à `{}` par précaution pour d'anciens profils sauvegardés qui le porteraient encore.
2. Nouveau test `tests/reset-adventure.test.js` : construit un profil couvrant tous les champs persistants Odyssée actuellement connus (dont des ids `storySeen` obtenus dynamiquement via `_allOdysseyStorySeenIds()`, jamais recopiés à la main), appelle `resetAdventure()` via un `showConfirm` court-circuité, puis vérifie que chaque champ est bien nettoyé ET qu'un marqueur `storySeen` étranger à l'Odyssée survit (le filtre ne doit jamais tout effacer aveuglément). `tests/helpers/loadGame.js` a été enrichi de 3 nouvelles expositions pour permettre ce test : `resetAdventure`, `_allOdysseyStorySeenIds`, `setShowConfirm` (override du stub de confirmation, qui n'existait pas encore dans le harness — `showConfirm()` ouvre une vraie boîte de dialogue DOM que le sandbox de test ne simule pas).

**Limite assumée** : ce test protège contre une régression sur les champs déjà listés dans son `buildFullProfile()`. Il ne peut pas détecter automatiquement l'oubli d'un TOUT NOUVEAU champ persistant introduit par un futur système narratif — celui-ci doit être ajouté manuellement au test en même temps qu'à `resetAdventure()` (voir ADR-51, conséquence inchangée).

**Conséquence** : `tests/helpers/loadGame.js` expose désormais un point d'extension générique (`setShowConfirm`) réutilisable par tout futur test qui aurait besoin de déclencher une boîte de confirmation sans DOM réel.

---

## ADR-54 — Réévaluation d'ADR-20 + stratégie de chargement documentée (méta-audit, Lot 3)

**Contexte** (méta-audit stratégique, prompt 12, Lot 3) : ADR-20 (refus du bundler) posait une condition de réévaluation explicite si `07-story.js` continuait de grossir — franchie (488 Ko, contre 448 Ko lors de l'audit performances, 9e conversation), jamais retranchée depuis. Le méta-audit avait aussi relevé que tout le JS du projet est chargé en `<script defer>` synchrone dès le premier écran (`index.html`), y compris `07-story.js` et `03-figurines-data.js` (356 Ko), dont le contenu n'est utile qu'une fois en Odyssée / en boutique de figurines.

**Décision sur ADR-20** : **maintien du refus de bundler**, reconfirmé une 3e fois. La lisibilité pour un développeur non technicien reste prioritaire sur le gain de performance d'un build. La taille croissante de `07-story.js` est un vrai sujet, mais c'est un problème de **stratégie de chargement**, pas de tooling de build — traité séparément ci-dessous plutôt que par un bundler.

**Analyse sur `07-story.js`** : un vrai chargement différé (après l'écran d'accueil) nécessiterait de scinder le fichier, car il ne contient pas QUE des données narratives — il définit aussi `_regionOfZone()`/`_zonesOfRegion()`, utilisées par `07-map.js` (11 points d'appel). Un chargement différé naïf de tout le fichier casserait la carte. **Recommandation pour un futur lot dédié** (non fait ici) : extraire ces 2 fonctions structurelles + tout ce qui est appelé en dehors de `07-story.js` vers un petit fichier séparé chargé en synchrone, et ne différer que le reste (textes des 7 `_STORY`, `_ZONE_OUTRO`, `_MAJOR_MOMENT` — la quasi-totalité du poids du fichier). Non entrepris dans ce lot : c'est un vrai chantier de refactoring, pas une simple bascule de balise `<script>`.

**Analyse sur `03-figurines-data.js`** : contrairement à `07-story.js`, ce fichier est presque pur (données `FIGURINES`/`FIG_PAGES` + helpers d'images), et ses rares usages ailleurs (`07-game.js`, `09-parent.js`) sont dans des fonctions, pas au chargement — donc plus facilement différable en théorie. **Non implémenté dans ce lot** (étude seulement, comme demandé) : le risque principal serait un écran non repéré qui afficherait une figurine dès l'accueil (à vérifier avant toute implémentation future).

**Indicateur de poids du précache** : le précache critique du Service Worker (`CRITICAL_URLS` : tous les JS + CSS + HTML + manifest) pèse **~2,55 Mo** au total (mesuré à cette conversation). Commentaire daté ajouté dans `sw.js` au-dessus de `CRITICAL_URLS` — à remettre à jour à chaque livraison qui touche un fichier de cette liste, pour suivre l'évolution dans le temps sans outillage automatisé supplémentaire.

**Conséquence** : toute future demande de lazy-load de `07-story.js` doit d'abord passer par l'extraction des helpers structurels documentée ci-dessus — ne jamais différer le fichier entier tel quel.

---

## ADR-55 — Adoption complète des tokens `--space-*` + guide du dépôt (méta-audit, Lot 4)

**Contexte** (méta-audit stratégique, prompt 12, Lot 4) : les tokens `--space-1` à `--space-6` (créés lors de l'audit DA, 6e conversation, maintenus en base dormante par ADR-25) avaient 0 usage réel dans `styles.css` après 8 conversations, contre 458 déclarations `margin`/`padding`/`gap` en valeurs brutes. Décision explicitement redemandée à Cyril (retirer / adopter / laisser en l'état), avec clarification préalable que le gain visuel d'une adoption serait quasi invisible (différences typiques d'1-2px) — **Cyril a choisi l'adoption malgré ce gain surtout technique**, en connaissance de cause.

**Décision** : adoption par **unification complète** (Option B), via un script de transformation automatisé plutôt qu'une édition manuelle sur 458+ points (trop de surface d'erreur humaine) :
- Toute valeur `Npx` dans une déclaration `margin`/`padding`/`gap` (et leurs variantes `-top`/`-bottom`/`-left`/`-right`/`-inline`/`-block`) comprise entre 4 et 32px est remplacée par le token de l'échelle (4/8/12/16/24/32) le plus proche, égalité tranchée vers le haut.
- Les valeurs `0` et `auto` sont laissées inchangées (pas de token pour "aucun espace").
- Les valeurs hors échelle (<4px, ex. `1px 2px 3px` — décoratif fin — ou >32px, ex. grandes marges de mise en page) sont **laissées en px brut**, volontairement : les forcer sur l'échelle aurait produit des changements trop visibles (ex. `62px` compressé à `32px`, soit -48%).
- Les déclarations à unités mixtes non gérables sans risque (offsets négatifs de positionnement, `cm`, `env()`/`clamp()`) sont explicitement exclues et laissées intactes (9 cas).
- Résultat : 574 valeurs converties en `var(--space-N)`, dont 282 avec une valeur réellement arrondie (changement visuel mineur, 1-4px selon les cas) et 292 en renommage pur (valeur identique). Validé par un parseur CSS réel (`css` npm) après transformation : structure intacte, 1692 règles, aucune erreur de syntaxe. Diff visuel humain non fait depuis cet environnement (pas d'accès navigateur) — **à vérifier par Cyril via la checklist de non-régression**, section rendu visuel, avant de considérer ce lot définitivement clos.

**Guide du dépôt** : nouveau `GUIDE-DU-DEPOT.md` à la racine — point d'entrée pour un humain (pas un assistant IA) reprenant le projet sans historique de conversation : architecture en un schéma, où sont les choses, comment lancer/tester/déployer, et le principe du cycle de retest des scores d'audit (revérifier après ~5 conversations de changements substantiels sur le périmètre concerné, consigner dans `ADR.md`).

**Conséquence** : toute nouvelle règle de style margin/padding/gap devrait désormais utiliser `var(--space-N)` directement plutôt qu'une valeur brute, pour ne pas recréer la dérive corrigée ici. Le script de transformation n'est pas conservé dans le dépôt (usage ponctuel) — une future extension du même principe (ex. à `border-radius` ou aux couleurs) devrait repartir d'un script similaire, pas d'une édition manuelle.

---

## ADR-56 — Sécurité messagerie enfant : filtre serveur, migration SQL, signalement parent, headers durcis (méta-audit, Lot 5)

**Contexte** (méta-audit stratégique, prompt 12, Lot 5) : après obtention du code réel des 2 Workers Cloudflare (`odyssee-sync`, `odyssee-chat`) et de `schema.sql`, correction d'une erreur du méta-audit initial (la CSP n'était pas "limitée à `frame-ancestors`" comme affirmé en ne lisant que `_headers` — une CSP complète existe déjà via balise meta dans `index.html`). Deux vrais problèmes confirmés en lisant `odyssee-chat.js` : (1) le filtre de mots interdits (`_CHAT_BLOCKED_WORDS`, 17-messaging.js) n'existait QUE côté client, contournable par un client modifié ou un appel API direct ; (2) `schema.sql` ne définissait pas les tables `blocks`/`reads` pourtant utilisées par le code du Worker (écart entre le fichier versionné et la réalité probable de la base).

**Décision** :
1. `_headers` complété : `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (caméra/micro/géoloc refusés, inutilisés par le jeu).
2. `odyssee-chat.js` : même filtre de mots bloqués qu'au client, réappliqué côté serveur dans `msgSend()` avant insertion (défense en profondeur — le client reste la première ligne pour le message d'erreur immédiat ; le serveur devient la ligne qui ne peut pas être contournée). **La liste doit être maintenue identique des deux côtés manuellement** — pas de source unique possible entre un Worker et un fichier front séparés, aucune infrastructure de partage de code entre les deux dans ce projet.
3. `schema.sql` mis à jour pour refléter la réalité du code (`blocks`, `reads` ajoutées, `CREATE TABLE IF NOT EXISTS`) + fichier `migration-blocks-reads.sql` séparé, sans danger à rejouer sur la base réelle que les tables existent déjà ou non (non vérifiable depuis cet environnement, pas d'accès à la console D1).
4. Signalement parent (`P.chatFlags`, tableau d'événements `{ts, kind}`) : incrémenté côté client (blocage client) ET côté serveur (si le serveur devait bloquer un mot que le client n'a pas intercepté — signal plus fort). Affiché comme badge passif dans le résumé hebdomadaire de la Vue Parent (« ⚠️ N messages bloqués cette semaine »), filtré sur la fenêtre de la semaine affichée. Pas d'alerte push (aucune infrastructure serveur pour ça dans ce projet) — signalement passif, visible dès l'ouverture de l'écran, pas besoin d'aller chercher.

**Conséquence** : tout nouveau champ de contenu texte envoyé par un enfant vers un autre (s'il en apparaît un jour ailleurs que la messagerie) devrait suivre le même principe de défense en profondeur (filtre client ET serveur). `P.chatFlags` est un nouveau champ persistant **hors du périmètre Odyssée** — volontairement PAS ajouté à `_allOdysseyStorySeenIds()`/`resetAdventure()` (ADR-51), qui ne concernent que la progression narrative Odyssée ; un futur "Reset complet du profil" (s'il existe/est créé) devrait en revanche l'inclure.

---

## ADR-57 — QA contenu narratif : cohérence rebondissements, ton tender/standard testé, double codage Pythagore (méta-audit, Lot 6)

**Contexte** (méta-audit stratégique, prompt 12, Lot 6) : audit qualité du contenu narratif produit lors des conversations précédentes, sans repasser par un audit formel complet.

**Décision** :
1. **Rebondissements (ADR-47)** : 14 des 20 variantes mentionnent `{villain}` avec une agence active (« vient de repérer », « vient d'ordonner »...). Vérification faite : l'histoire maternelle (`_MAT_STORY`) établit que le méchant est nommé dès le prologue mais ne parle/n'agit que dans la toute dernière région. `_pickTwistLine()` restreint désormais le tirage, pour `mat`/`matfr` uniquement, aux 6 variantes sans `{villain}` (`_TWIST_LINES_VILLAIN_FREE_IDX`). Les 5 autres aventures gardent les 20 variantes.
2. **Ton tender/standard (ADR-45)** : nouveau test `tests/dialogue-tone.test.js` — vérifie que `_dialogueTone()` renvoie `tender` pour PS/MS/GS et `standard` pour tout le reste, et que les 2 pools de `MONSTER_DIALOGUES` ont des clés identiques et non vides. Garde-fou contre une régression du type de celle corrigée par ADR-45 (`WRONG_TAUNTS` unique et sombre, partagé par tous les niveaux avant correctif).
3. **172 textes de zone (v12.2.0)** : sondage sur 15/172 textes répartis sur les 7 aventures — aucune incohérence de ton trouvée (voix des compagnons fidèles à travers l'échantillon). Pas de relecture exhaustive (disproportionnée pour ce lot) — à refaire plus en profondeur seulement si un signalement concret apparaît.
4. **Double codage visuel (ADR-36)** : `_colPythReciproque` (seul générateur de géométrie collège sans `visualHtml`, oublié lors d'ADR-36) reçoit désormais le même triangle SVG que `_colPythHyp`/`_colPythCote` (`_colRightTriSvg`, sans `unknown` puisque les 3 côtés sont donnés).

**Reporté à un lot dédié** : extension du moment charnière (ADR-50) à 2-3 choix par Odyssée — chantier de contenu substantiel (14 nouveaux textes par point de choix ajouté, relecture complète des 7 histoires requise à nouveau par discipline ADR-50), volontairement sorti de ce lot pour ne pas le noyer dans des correctifs rapides.

**Conséquence** : toute future ligne ajoutée à `_TWIST_LINES` qui mentionnerait `{villain}` avec une agence active doit être exclue par défaut du pool maternelle, sauf vérification explicite de compatibilité avec `_MAT_STORY`/`_MAT_STORY_FR`.

---

## ADR-58 — Accessibilité alt=, correction ADR-48, coexistence des 2 systèmes de contextualisation (méta-audit, Lot 7)

**Contexte** (méta-audit stratégique, prompt 12, Lot 7) : dernier lot autonome avant blocage sur les documents d'audit manquants (points engagement/pédagogique/qualité perçue).

**Décision** :
1. **Accessibilité `alt=`** : recensement complet des balises `<img>` du projet (statiques dans `index.html` + générées dynamiquement en JS). Deux vrais gaps trouvés et corrigés :
   - Photos de profil (`01-core.js` `_setAvatarEl`, `05-profile.js`, `09-parent.js`) n'avaient **aucun `alt`** — corrigé : `alt="Photo de profil de {nom}"` là où le nom n'est pas déjà visible juste à côté (`_setAvatarEl`), `alt=""` là où il l'est déjà (confirmation profil, liste de gestion des profils) pour éviter la redondance.
   - Images de figurines (`03-figurines-data.js` `getCharPortrait()`) avaient `alt=""` **alors que ce sont de vraies figurines nommées**, pas de la décoration. `getCharPortrait()` accepte désormais `opts.name` (rétrocompatible, alt="" par défaut si absent) ; les 3 appelants qui n'affichent pas déjà le nom en texte adjacent (`09-parent.js`, grille de collection et étagère de `10-figurines.js`) le fournissent désormais. Le 4e appelant (visionneuse de figurine, nom déjà affiché dans `fig-vtitle` juste au-dessus) reste volontairement en `alt=""`.
   - Les logos statiques (`index.html`) avaient déjà un `alt` correct ou `aria-hidden="true"` — rien à changer.
2. **Correction d'ADR-48** : sa "limite connue" (pages de chapitre excédentaires accumulées à la scène de victoire) décrivait un symptôme de l'ancienne fragmentation du carnet (ADR-46), retirée depuis par ADR-49 (v12.2.0) — marquée obsolète, barrée, avec explication. Aucune correction de code nécessaire : un chapitre de 11 pages pour 4 zones est aujourd'hui simplement un livre plus long, lu d'un bloc à l'entrée de région, sans aucun lien avec la scène de victoire (contenu séparé).
3. **Coexistence documentée** : `narrativeWrapMath()` (`06a-adaptive.js`, ADR-37, ~20% des calculs primaire habillés d'un contexte narratif générique) et `_perfCallbackLine()` (`07-map.js`, Lot A/14e conv., callback de performance en intro de boss) poursuivent un objectif proche (ancrer le jeu dans l'histoire) via 2 fonctions indépendantes, écrites à des moments différents, sans référence croisée. Ce n'est pas un doublon nuisible — elles se déclenchent à des moments différents (pendant une question / à l'ouverture d'un combat) — mais **toute future contextualisation narrative d'un calcul doit d'abord vérifier l'existence de ces 2 fonctions avant d'en créer une 3e**, pour ne pas répéter cette dérive.

**Conséquence** : tout nouvel appel à `getCharPortrait()` doit fournir `opts.name` sauf si le nom de la figurine est déjà visible en texte adjacent à l'image.

---

## ADR-59 — Moment charnière étendu à 2 points de choix par Odyssée (méta-audit, point dédié)

**Contexte** : sur demande de Cyril, extension du moment charnière (ADR-50) de 1 à 2 points de choix par Odyssée sur les 7 aventures. Relecture complète des 7 histoires refaite avant proposition (discipline ADR-50), pour la région `ce1` cette fois — 7 concepts de choix proposés et validés par Cyril avant toute écriture de contenu.

**Décision** :
- `_MAJOR_MOMENT[advKey]` passe d'un objet unique à un **tableau de moments** (même forme interne : `region`/`council`/`choice`/`epilogueA`/`epilogueB`), pour permettre une extension future à un 3e point sans nouveau changement de structure.
- `_maybeShowMajorMoment()` retrouve désormais le bon moment par correspondance de région dans le tableau (`moments.findIndex`), plutôt que par un objet fixe — généricité complète, aucune limite codée en dur sur le nombre de moments.
- Chaque moment a son propre id (`majormoment_<adv>_<idx>`), donc son propre suivi `storySeen` indépendant — les 2 points d'une même Odyssée ne s'écrasent jamais l'un l'autre.
- `P.majorChoiceByAdv[advKey]` passe d'une simple lettre (`'A'`/`'B'`) à un **objet indexé par n° de moment** (`{0:'A', 1:'B'}`), pour mémoriser plusieurs choix indépendants.
- L'épilogue ajoute désormais une page bonus **par choix réellement fait** (0, 1 ou plusieurs selon combien de moments l'aventure définit) — pour mat/matfr, toujours aucune (epilogueA/B restent `null` sur les 2 moments, cohérent avec l'absence de méchant confronté avant la toute dernière région).
- `_allOdysseyStorySeenIds()` boucle désormais sur le tableau de chaque aventure pour générer tous les ids possibles (`_0`, `_0_council`, `_1`, `_1_council`...).
- Nouveau point de choix (région `ce1`, plus tôt dans l'Odyssée que le point existant) : hérissons (prim), lecture à voix haute (primfr), ourson triste (mat, sans enjeu), panier renversé (matfr, sans enjeu), partage de gâteau (col), marché des synonymes (colfr), bloc de pierre du chantier (primhist) — aucun ne touche au méchant, cohérent avec la leçon d'ADR-50.

**Vérification faite avant livraison** : simulation `vm` ciblée (méthode héritée des conversations précédentes) — positionnement successif de l'avatar sur les 2 régions d'une même Odyssée (`prim`), déclenchement des 2 moments avec des choix différents (A puis B), vérification que : les 2 `storySeen` sont bien indépendants, qu'un moment déjà vu ne se redéclenche pas, que les 2 choix cohabitent sans s'écraser, et que `_allOdysseyStorySeenIds()` connaît bien les 4 ids dérivés. Logique de construction des pages bonus d'épilogue vérifiée isolément (2 pages, dans l'ordre des moments). 186/186 tests Vitest réels passés après implémentation.

**Conséquence** : toute aventure future qui voudrait un 3e point de choix n'a qu'à ajouter une entrée au tableau `_MAJOR_MOMENT[advKey]` — aucun autre changement de code nécessaire, la structure est déjà généralisée pour un nombre arbitraire de moments.

---

⚠️ **Note de recopie (19e conversation)** : ADR-61 à ADR-70 restent non recopiées ici — leur texte source (16e/17e conversations) n'était pas disponible dans cet environnement de travail. ADR-71 à ADR-84 ci-dessous ont été recopiées depuis les documents de transition (v18 partiel fourni par Cyril + v19).

## ADR-71 — Mise en place réussie d'un harnais Vitest réel dans le sandbox de travail, remplaçant la vérification par relecture statique seule

**Contexte** : la v17 documentait un échec de toute exécution runtime du code du jeu dans l'environnement de travail (`require()`/`eval` incompatibles avec les scripts globaux `const`/`let` non-modules du projet), la vérification s'étant appuyée uniquement sur la relecture statique + la suite Vitest existante lancée telle quelle.

**Décision** : reconstituer intégralement l'arborescence attendue par le harnais de test réel du dépôt (`js/` + `tests/` + `tests/helpers/loadGame.js`, qui charge les fichiers via lecture + exécution `vm`, pas via `require()`), renommer les fichiers `*_test.js`→`*.test.js`, installer `vitest` via npm, et exécuter la vraie suite.

**Avantages** : vérification numérique exacte de chaque correctif (comptages, couleurs, distances, titres), pas seulement une relecture ; a permis de détecter/confirmer des chiffres précis (35/86, 50/86, 0/86 zones en chevauchement ; distance exacte 49,6px→88,0px) impossibles à obtenir par relecture seule.

**Inconvénients** : mise en place plus longue en tout début de conversation (environ 10-15 appels d'outil pour l'installation initiale) ; à refaire si le sandbox est réinitialisé entre deux conversations (probable, aucune persistance connue).

**Alternative rejetée** : continuer à se fier uniquement à la relecture statique, jugée insuffisante pour un chantier aussi quantitatif que celui de cette conversation (chevauchement de pastilles).

**Impact** : méthode utilisée pour les 5 livraisons de cette conversation, documentée comme procédure standard pour toute future conversation.

---

## ADR-72 — Audit combiné Esthétique/Ergonomie/Narratif restreint au module Aventure, comité de 7 rôles, méthodologie ancrée dans le code réel

**Contexte** : demande de Cyril de reproduire le niveau de rigueur du gabarit d'audit technique d'origine (3e conversation), mais restreint au module Aventure et combinant trois angles (esthétique, ergonomie, narration) plutôt qu'un seul comme les audits précédents.

**Décision** : comité simulé de 7 rôles couvrant les 3 dimensions, méthodologie strictement ancrée dans le code réel (aucun constat sans citation de fonction/valeur exacte), limite de périmètre explicitement assumée (pas de relecture exhaustive des 172+ zones, constats transversaux + échantillonnage).

**Avantages** : crédibilité, actionnabilité, cohérence avec les 2 audits Aventure précédents (16e UX, 17e DA) dont le score s'en trouve rapproché de façon cohérente (69/100, comme le 17e).

**Inconvénients** : le reste du logiciel (tableau de bord parent, boutique, messagerie) reste non réévalué sous cet angle combiné.

**Impact** : document Word 12 pages, 12 problèmes détaillés, 4 lots + 1 hors-lot.

---

## ADR-73 — Extension systématique du principe "le thème réel pilote tout" (ADR-67) à tout composant affichant une couleur/emoji/son lié à une région

**Contexte** : découverte que le principe acté en 17e conversation (ADR-67) n'avait été appliqué qu'aux 3 composants d'origine (îlots, PNJ, météo), alors que 4 autres composants visuels (fond de fiche de zone, bannière de transition, mini-carte, Journal/Progression du Carnet) et 1 composant sonore (signature audio régionale) souffraient du même défaut, découvert un par un lors de la phase de recherche de l'audit.

**Décision** : corriger tous les composants identifiés dans la même conversation (Lots 1, 2, et le hors-lot A7), et formaliser la règle comme systématique : tout nouveau composant du module Aventure affichant une information dépendant du "lieu" doit être vérifié contre ce principe avant livraison, pas seulement au moment où on le découvre en défaut.

**Avantages** : cohérence totale enfin atteinte sur tous les composants audités ; centralisation dans une source unique (`_THEME_META`) plutôt que des tables dupliquées (élimine le risque de divergence déjà constaté avec `regionAccent`).

**Inconvénients** : aucun identifié — le coût de correction s'est avéré faible une fois le pattern de la Phase 11 (17e conversation) réutilisé.

**Alternative rejetée** : traiter chaque composant comme un cas isolé sans centraliser — rejetée car c'est précisément l'absence de source unique qui avait permis la divergence `regionAccent`/`_BIOME_BANNER_META`.

**Impact** : `_THEME_META`, `_themeOfRegion()`, `_THEME_AUDIO_SIGNATURE` (Lots 1, 2, hors-lot A7).

---

## ADR-74 — Résolution de collision des pastilles d'étape calibrée sur une largeur conservatrice plutôt que sur le canevas virtuel de conception

**Contexte** : l'algorithme de positionnement des pastilles d'étape (bruit pseudo-aléatoire, sans vérification de distance minimale) produisait un chevauchement visible sur 41% des zones à la largeur de conception (480px) et 58% à une largeur mobile réaliste (330px), le rendu final utilisant des pourcentages de largeur (`xPct`) calculés pour un canevas plus large que ce qui est réellement disponible sur mobile.

**Décision** : ajouter une passe de résolution de collision itérative, mais calculer les distances dans un espace de référence délibérément plus étroit (340px) que le canevas de conception (480px), pour garantir la sécurité même au rendu réel le plus défavorable.

**Avantages** : un seul mécanisme corrige à la fois le bug de fond (chevauchement) et son aggravation sur mobile, sans avoir à recalculer les positions au moment du rendu réel.

**Inconvénients** : les constantes (largeur conservatrice 340px, distance minimale 88px) sont calibrées empiriquement sur l'échantillon des 86 zones actuelles — à revérifier si le jeu évolue vers des zones à un nombre d'étapes très différent des 5 habituelles.

**Alternative rejetée** : recalculer les positions au moment du rendu DOM réel — jugée disproportionnée face au gain marginal.

**Impact** : `openArchipelZoom()` (Lot 3, v12.4.24), vérifié sur les 86 zones réelles (0/86 chevauchement résiduel aux deux largeurs testées).

---

## ADR-75 — Titre narratif de l'Odyssée affiché sur la carte et le Carnet = contenu déjà écrit (`_STORY.intro.title`), jamais un nom inventé

**Contexte** : demande de Cyril d'afficher un titre stylisé de l'Odyssée sur la carte principale. Une première proposition de l'assistant (utiliser `STORY_KINGDOM`, le nom du "royaume" narratif) a été explicitement rejetée par Cyril, qui a précisé vouloir "le titre de l'odyssée qui existe déjà".

**Décision** : utiliser `_STORY.intro.title`, avec retrait du préfixe "Prologue —" quand il est présent (`prim`, `primhist`), plutôt que toute autre source de contenu narratif.

**Avantages** : zéro contenu inventé, cohérence totale avec le texte que le joueur a déjà lu en ouvrant son Odyssée pour la première fois, un seul point de maintenance.

**Inconvénients** : deux des sept titres (`primfr` "Le journal intime", `primhist` "L'héritage") sont plus sobres/courts que les cinq autres — assumé comme fidèle au ton déjà choisi, pas un défaut à corriger.

**Alternative rejetée** : `STORY_KINGDOM` — écarté explicitement par Cyril.

**Impact** : `_odysseyDisplayMeta()`, `_updateMapHeaderTitle()` (Lot 4, v12.4.25), appliqué au titre de carte et au sous-titre du Carnet (D1) depuis une source unique.

---

## ADR-76 — Distinction stricte entre `MUSICS` (jukebox persistant du joueur) et la signature sonore régionale (jingle contextuel court) — ne jamais les confondre

**Contexte** : Cyril a suggéré de réutiliser 36 pistes musicales qu'il a lui-même composées/choisies (`MUSICS`, `02-data.js`) pour enrichir la signature sonore régionale (A7). Vérification du code : `MUSICS` alimente `P.music`, une préférence de musique de fond persistante pour toute la session, jouée en boucle (`startMusic()`, `07-game.js`), achetée en boutique comme récompense de personnalisation — architecturalement indépendante de la région/zone traversée.

**Décision** : garder les deux systèmes strictement séparés ; les jingles courts de A7 restent synthétisés (`beep()`), indépendants du choix de musique de fond du joueur.

**Avantages** : aucune régression sur la fonctionnalité de personnalisation existante ; scope de A7 resté maîtrisé.

**Inconvénients** : les 36 pistes composées par Cyril restent inexploitées pour l'ambiance régionale — piste possible pour une future conversation si Cyril le souhaite explicitement, avec son oreille pour guider les 9 associations thème↔piste.

**Alternative rejetée** : assigner une piste des 36 par thème pour l'ambiance de zone/combat — proposée à Cyril mais non retenue.

**Impact** : `_THEME_AUDIO_SIGNATURE` reste un système de jingles synthétisés indépendant ; `MUSICS`/`P.music`/`startMusic()` non touchés cette conversation.

---

## ADR-77 — Validation par maquette réellement perceptible (visuelle ET désormais sonore) avant toute implémentation d'un changement perceptible

**Contexte** : la règle historique du projet ("validation de maquette obligatoire avant toute implémentation visuelle") ne mentionnait explicitement que le visuel. Pour le chantier des jingles thématiques (A7), l'assistant a construit une maquette HTML réellement écoutable (reproduisant exactement le moteur de synthèse Web Audio du jeu), sans que Cyril ne l'ait explicitement demandée sous cette forme.

**Décision**, confirmée a posteriori par l'usage que Cyril en a fait (il a identifié un problème réel — le jingle volcan "trop jeu vidéo" — uniquement rendu possible par l'écoute réelle) : étendre l'esprit de la règle de validation par maquette à tout changement perceptible, pas seulement visuel.

**Avantages** : a permis de détecter et corriger un problème (timbre `sawtooth` jugé artificiel) qu'aucune description textuelle n'aurait probablement révélé aussi clairement.

**Inconvénients** : demande plus d'effort de construction de maquette ; ne fonctionne que si l'environnement de travail permet de répliquer fidèlement le rendu réel.

**Alternative rejetée** : décrire les jingles proposés en texte (notes, tempo, timbre) sans maquette écoutable.

**Impact** : `maquette-jingles-a7.html`, `maquette-volcan-v2.html` (Phase 9), règle à reconduire pour tout futur changement sonore.

---

## ADR-78 — Discipline de regroupement de lots optimisée par Claude lui-même, sur consigne explicite de Cyril

**Contexte** : Cyril a demandé explicitement, pour le lot du dernier audit (Performances), que Claude regroupe lui-même les problèmes détectés « par lots cohérents stratégiquement et techniquement et économes en tokens », plutôt que de systématiquement proposer un lot par problème comme dans les audits précédents de cette même conversation.

**Décision** : pour les audits Fonctionnel, UX et Graphique/DA, Claude avait proposé des phases/lots séparés par défaut (un par problème pour l'UX, groupés par 3 pour le graphique) ; pour l'audit Performances, un lot unique regroupant les 3 problèmes (fichiers proches, difficulté faible pour chacun) a été proposé et validé directement.

**Avantages** : moins d'allers-retours de validation, moins de bumps de version consécutifs, cohérent avec la préférence d'économie de tokens de Cyril.

**Inconvénients** : un lot plus gros est plus difficile à valider point par point si un seul des problèmes posait question — mitigé par la présentation systématique de chaque problème séparément AVANT le code, même groupés en un seul lot de livraison.

**Impact** : cette discipline de regroupement doit être appliquée par défaut dans toute future conversation, sauf si Cyril demande explicitement un découpage plus fin.

---

## ADR-79 — Ne jamais créer de fonction globale sans vérifier au préalable qu'elle n'existe pas déjà ailleurs dans le projet

**Contexte** : la refonte de la fiche de zone (Phase 8-9) a créé une fonction `_buildZoomSceneHtml()` dans `07-map.js` sans vérifier si ce nom existait déjà ailleurs — une fonction homonyme, préexistante et plus aboutie, existait dans `07-boss.js` (chargé après `07-map.js`), qui l'écrasait silencieusement (JS non-modulaire, dernière déclaration globale du même nom gagne, aucune erreur ni avertissement). Le bug n'a été détecté qu'après livraison, via un retour utilisateur avec capture d'écran.

**Décision** : avant de déclarer toute nouvelle fonction/variable globale, exécuter systématiquement `grep -rn "function <nom>"` (et `<nom>\s*=` pour les variables) sur l'ensemble de `js/*.js`, pas seulement le fichier en cours d'édition.

**Avantages** : élimine un risque de classe de bug particulièrement insidieuse (aucune erreur, code apparemment correct, tests unitaires isolés qui passent puisqu'ils ne testent que la fonction extraite indépendamment du contexte réel du fichier).

**Inconvénients** : légère charge de vérification supplémentaire avant chaque nouvelle fonction — largement compensée par le coût du bug qu'elle évite.

**Alternative rejetée** : compter sur les tests Vitest pour détecter ce genre de collision — rejetée car le harnais Vitest de ce projet charge les fichiers demandés par CHAQUE test indépendamment (voir `loadGame.js`), et ne reproduit donc pas nécessairement l'ordre de chargement RÉEL de `index.html` avec TOUS les fichiers en même temps.

**Impact** : `_buildZoomSceneHtml` dupliquée supprimée de `07-map.js`, le catalogue de mots-clés branché sur la fonction préexistante de `07-boss.js` (v12.4.37).

---

## ADR-80 — Toute nouvelle propriété du profil joueur (P) doit être ajoutée à la liste blanche de désérialisation de `05-profile.js`

**Contexte** : le Système 4 d'onboarding (Phase 6) a introduit un nouveau marqueur `P.onbMapSeen`, sans l'ajouter à la liste blanche de désérialisation explicite de `loadProfile()`/`validateProfile()` (`05-profile.js`) — un mécanisme déjà documenté par un commentaire en 11.6.2 pour un champ analogue (`onbAccountSeen`), mais que Claude n'a pas reconnu comme applicable au nouveau champ au moment de l'écrire. Résultat : le marqueur était bien positionné à `true` et sauvegardé, mais effacé à chaque rechargement du profil, provoquant une répétition en boucle de la visite guidée.

**Décision** : formaliser cette règle comme systématique et l'ajouter à la liste des points de vigilance impératifs de tout document de transition futur.

**Avantages** : élimine une classe de bug déjà survenue deux fois dans l'historique du projet.

**Inconvénients** : aucun — c'est une case à cocher systématique, sans coût.

**Alternative rejetée** : remplacer la désérialisation champ par champ par une simple copie/fusion d'objet (`Object.assign` ou spread) — rejetée car cette liste blanche existe précisément pour valider/borner/typer chaque champ individuellement.

**Impact** : `onbMapSeen` ajouté aux 2 emplacements requis (v12.4.38) ; règle à vérifier pour tout futur champ de profil.

---

## ADR-81 — Le hash déterministe de contenu doit toujours porter sur la donnée la plus distinctive disponible (label plutôt qu'id)

**Contexte** : le tirage des combinaisons de décor (`_zoneDecorFor`) hashait initialement sur `zoneId` seul (ex. "mat_cp_1", "mat_cp_2"...) — des chaînes ne différant que par leur tout dernier caractère. L'algorithme `_archHash` (déjà existant dans le projet, type djb2) n'a pas un avalanche suffisant pour de telles quasi-répétitions.

**Décision** : hasher sur `label + '|' + zoneId` plutôt que sur l'id seul, chaque fois qu'une fonction de tirage déterministe doit différencier des entités dont les identifiants techniques se ressemblent fortement.

**Avantages** : distribution nettement meilleure, vérifiée (5/5 combos distincts sur le cas problématique, contre 2/5 avant), sans changer l'algorithme de hash lui-même.

**Inconvénients** : aucun identifié — le libellé est de toute façon toujours disponible partout où l'id l'est.

**Alternative rejetée** : remplacer `_archHash` par un algorithme de hash différent — rejetée car cela aurait changé le comportement de TOUS les usages existants de `_archHash` dans le projet.

**Impact** : `_zoneDecorFor()` (v12.4.40) ; règle à appliquer à toute future fonction de tirage déterministe basée sur un id de zone/entité au format répétitif.

---

## ADR-82 — Le décor décoratif doit être visuellement lié au niveau de zoom pour maîtriser le coût de rendu, sans JavaScript supplémentaire

**Contexte** : l'audit Performances (Phase 13) a révélé que le décor de la carte principale (`_buildZoneDecorHtml`) ajoutait 90 à 140 éléments DOM animés en continu par Odyssée, sans lien avec ce qui est réellement utile/visible à l'écran. Cyril a proposé une solution basée sur la portion réellement visible de la carte (viewport), avec un mécanisme d'intensité liée au zoom.

**Décision**, après réexamen de la structure réelle du composant : plutôt qu'un `IntersectionObserver`, exploiter le fait que le niveau de zoom (`_mapZoom`) est déjà matérialisé par une classe CSS sur le conteneur (`#map-zones.zoom-overview`, etc.) — une règle CSS pure suffit.

**Avantages** : solution nettement plus simple que prévu initialement, zéro risque de régression fonctionnelle.

**Inconvénients** : moins granulaire qu'une solution par viewport réel (masque TOUT le décor en vue d'ensemble) — jugé suffisant car la vue d'ensemble est justement le cas où le décor est le moins utile visuellement.

**Alternative envisagée mais non retenue faute de besoin** : ajouter un palier intermédiaire supplémentaire (réduire à 1-2 éléments plutôt que 0 en vue d'ensemble) — à raffiner seulement si le besoin se manifeste, pas avant.

**Impact** : règle CSS ajoutée sur `.zoom-overview .archipel-zone-decor, .zoom-overview .weather-particle` (v12.4.42).

---

## ADR-83 — Refaire un audit déjà mené doit produire une réévaluation sincère de l'état réel, jamais un rapport gonflé artificiellement

**Contexte** : la 19e conversation a demandé de refaire à zéro quatre audits déjà menés lors de conversations précédentes, chacun avec un gabarit demandant un nombre de points fixe (« Top 30 », « Top 20 »).

**Décision**, déjà appliquée avec succès en 18e conversation et reconduite ici : ne jamais padder artificiellement la liste de problèmes pour atteindre le nombre demandé par le gabarit — livrer le nombre réel de problèmes trouvés après vérification sincère dans le code, en l'expliquant explicitement dans le document.

**Avantages** : crédibilité totale des audits, confiance de Cyril dans le processus, scores de plus en plus élevés (69→87, 69→92) qui reflètent une amélioration réelle et mesurable plutôt qu'un artefact de rédaction.

**Inconvénients** : documents plus courts que le gabarit ne le suggère — mitigé par une explication systématique et visible du choix.

**Alternative rejetée** : inventer des points mineurs/cosmétiques pour combler le nombre demandé.

**Impact** : les 4 audits repris à zéro (Esthétique/Ergonomie/Narratif 87/100, Fonctionnel 86/100, UX 89/100, Graphique/DA 92/100) livrent chacun 3 à 5 problèmes réels plutôt que 20-30 points fabriqués.

---

## ADR-84 — Toute vérification numérique à grande échelle doit d'abord filtrer les faux positifs d'extraction avant d'être considérée fiable

**Contexte** : lors de la vérification de la variété des décors (Phase 11-12), une première extraction automatisée des « zones » du fichier `02-data.js` par expression régulière a capturé, en plus des vraies zones, des objets non-zone partageant accidentellement un champ `id:`/`label:'...'` (noms de succès/défis comme "Tables de 7", "Gagner 3 parties", "Bouclier") — produisant de faux doublons alarmants qui n'existaient pas dans le jeu réel.

**Décision** : ne jamais faire confiance à une extraction par regex générique sans un filtre de confirmation supplémentaire spécifique aux vrais objets recherchés (ici : exiger la présence du champ `theme:'...'`, propre aux seules zones) — et re-vérifier manuellement dans le code source tout résultat de vérification automatique qui semble suspect.

**Avantages** : évite de corriger des problèmes qui n'existent pas, et de passer à côté du seul vrai problème.

**Inconvénients** : demande une itération supplémentaire de script de vérification à chaque fois qu'une vérification à grande échelle est nécessaire.

**Impact** : passes de vérification de la Phase 11-12 (le premier script a rapporté 5 « doublons », dont 4 étaient des faux positifs et seul le 5e — après filtrage correct — était réel).

---

## ADR-85 — Toujours vérifier le pattern `include` réel de `vitest_config.js` avant de nommer un nouveau fichier de test, jamais se fier au nom affiché dans le projet Claude

**Contexte** : lors du Lot 2 de la 19e conversation (dette technique), 3 nouveaux fichiers de test ont été livrés nommés `*_test.js` (underscore), en calquant le nom tel qu'affiché dans la liste des fichiers du projet Claude (ex. `rename-profile_test.js`). Or le vrai dépôt utilise la convention `*.test.js` (point) depuis ADR-71, et `vitest_config.js` ne scanne que `tests/**/*.test.js`. Résultat : les 3 fichiers ont été poussés sur le dépôt mais jamais exécutés par `npm test` (toujours 186 tests, 18 fichiers, au lieu de 195/21) — bug détecté seulement via une capture d'écran de Cyril après coup.

**Décision** : avant de créer tout nouveau fichier de test, exécuter systématiquement `cat vitest_config.js` (ou équivalent) pour lire le pattern `include` réel, plutôt que de déduire la convention de nommage depuis les noms de fichiers affichés dans le projet Claude — ces derniers peuvent différer du nom réel dans le dépôt Git (l'affichage du projet semble substituer le point par un underscore pour au moins certains types de fichiers, cause exacte non identifiée).

**Avantages** : élimine une classe de bug silencieuse (aucune erreur, `git push` réussi, tests simplement jamais exécutés) déjà survenue une fois.

**Inconvénients** : aucun — une vérification systématique et quasi gratuite (un seul appel).

**Alternative rejetée** : renommer une bonne fois pour toutes les fichiers du projet Claude pour qu'ils correspondent au dépôt — impossible, l'assistant n'a aucun contrôle sur la façon dont le projet Claude nomme/affiche les fichiers qui lui sont fournis en tant que contexte.

**Impact** : règle à appliquer par défaut dans toute future conversation, dès le premier fichier de test créé ou modifié — vérifier `vitest_config.js` AVANT de choisir un nom de fichier, pas après livraison.

---

## ADR-86 — Distinction garantie des formes d'îlot entre les 7 Odyssées connues : table fixe en priorité, repli sur le hash générique pour toute Odyssée future (Option B hybride)

**Contexte** : ADR-29 (méta-audit, 3 variantes de forme par région) réduisait déjà le partage de forme entre Odyssées, mais restait un simple hash déterministe indépendant par (forme, Odyssée) — mathématiquement incapable de garantir l'absence totale de collision, quel que soit le nombre de variantes (vérifié par recherche exhaustive sur 20 000 valeurs de calibrage : aucune ne produit une bijection parfaite sur les 6 formes simultanément). Avec seulement 3 variantes, jusqu'à 4 des 7 Odyssées partageaient la même forme de base sur certaines régions.

**Décision**, validée par Cyril entre 2 options présentées (A. générique pur avec 7 variantes, garantie partielle ; B. table figée, garantie totale) : Option B, en version hybride — `_ISLAND_ODYSSEY_ORDER` (liste fixe des 7 Odyssées connues) donne un index direct et unique par Odyssée ; toute Odyssée absente de cette liste (future) retombe automatiquement sur l'ancien mécanisme de hash générique (`_archHash`), sans erreur ni crash.

**Avantages** : zéro partage de forme garanti dès aujourd'hui entre les 7 Odyssées connues, sur les 6 régions ; compatibilité ascendante préservée pour toute Odyssée future non encore répertoriée (ne casse rien, juste pas encore garantie unique).

**Inconvénients** : une future 8e Odyssée devra être ajoutée manuellement à `_ISLAND_ODYSSEY_ORDER` pour bénéficier à son tour de la garantie — sinon elle reste soumise au même risque résiduel de collision par hash que le système d'origine (ADR-29). Point de vigilance à reconduire dans tout futur document de transition dès qu'une nouvelle Odyssée est créée.

**Alternative rejetée** : Option A pure (rester 100% générique, juste augmenter à 7 variantes) — écartée par Cyril car elle n'éliminait pas le risque de collision (testé : max 2-3 Odyssées encore partagées selon la région, contre 4 avant).

**Impact** : `_ISLAND_PROFILE_VARIANTS` (6 formes × 7 profils, 4 nouveaux par forme validés sur `maquette-formes-ilots.html` avant implémentation), `_islandVariantIdx()`, `_ISLAND_ODYSSEY_ORDER` (v12.4.44). Garde-fou de non-régression : `island-shape-distinctness_test.js`.

---

## ADR-87 — Généraliser un motif de collection déjà inventé (emplacements vides visibles) plutôt que le laisser isolé à un seul composant

**Contexte** : l'audit Qualité Perçue #3 (19e conversation, restreint au module Aventure) a trouvé que la galerie de Trophées du Carnet masquait entièrement les boss non vaincus (aucun emplacement visible), alors que le Talisman/Arc-en-ciel — collection différente dans le même Carnet — affiche déjà ses emplacements vides (sertissures/bandes non remplies) pour tout ce qui n'est pas encore débloqué. Un second point (Q1) a aussi été trouvé : `aria-label` présent sur le bouton Boussole mais absent sur ses 2 voisins (Carnet, Mini-carte) de la même barre.

**Décision** :
1. **Q2** : `openAdventureLog()` génère désormais une médaille pour CHAQUE zone de l'Odyssée en cours (`MAP_ZONES`, périmètre identique à l'onglet Progression déjà existant — pas les 86 boss des 7 Odyssées), verrouillée (silhouette grisée + `#icon-zone-lock`, réutilisé tel quel) pour les non-vaincus. Le titre de section passe de `(${totalBeaten})` à `(${totalBeaten}/${totalZones})`, cohérent avec le format déjà utilisé par les barres de progression par région.
2. **Q1** : `aria-label` ajouté sur `#btn-carnet-map` et `#btn-minimap`.

**Avantages** : exploite l'effet Zeigarnik déjà démontré efficace sur le Talisman (une collection incomplète mais visible pousse davantage à la complétion qu'une liste qui grandit sans repère de fin) ; source unique de vérité (`MAP_ZONES`) déjà utilisée par le reste du Carnet, aucune nouvelle donnée à maintenir.

**Inconvénients** : aucun identifié — le motif de rendu (monture complète + contenu conditionnel) était déjà écrit ailleurs dans le même fichier (`_advTalismanHtml`), il ne restait qu'à l'appliquer au second composant de collection.

**Alternative rejetée** : limiter l'affichage aux boss déjà vaincus + un simple compteur textuel « X restants » — écartée car un compteur textuel n'a pas le même pouvoir d'anticipation visuelle qu'un emplacement réellement affiché (silhouette du boss visible, juste verrouillée).

**Impact** : `openAdventureLog()` (`07-boss.js`), `.advlog-medal.locked` (`styles.css`), v12.4.45. Garde-fou de non-régression : `trophy-locked-slots_test.js`. **Règle à reconduire** : tout futur système de collection ajouté au Carnet doit par défaut afficher ses emplacements non débloqués (jamais les omettre), sauf raison explicite contraire.

---

## ADR-88 — Lot 1 de l'audit Immersion narrative : cohérence du registre combat en cas d'échec, et progression dotée par le prologue

**Contexte** : l'audit Immersion Narrative & Motivation (19e conversation) a trouvé une asymétrie entre le feedback de victoire, déjà pleinement dans le registre du combat (`✅ TOUCHÉ ! ❤️X/Y`), et celui d'échec, un verdict générique hors-fiction (`💥 FAUX !`, N2) — alors qu'un taunt de monstre en personnage (`_taunt('wrong')`) existait déjà en parallèle, sans que le texte du feedback principal ne le rejoigne. Un second point (N6) notait que la barre de progression globale de l'Odyssée démarre à 0% malgré un moment narratif déjà vécu par le joueur (le prologue), perdant l'effet de "progression dotée" (endowed progress effect).

**Décision** :
1. **N2** : `hitPlayer('💥 FAUX !')` → `hitPlayer('💨 ESQUIVE !')` (`07-game.js`), symétrique à `TOUCHÉ`. Le cas "temps écoulé" reçoit le même traitement (`⌛ Trop lent, il esquive !`). Le cas "réponse invalide" (erreur technique, pas un échec de jeu) reste inchangé — hors périmètre.
2. **N6** : `globalPct` compte désormais `(totalBeaten+1)/(totalZones+1)`, le prologue agissant comme une étape acquise. Le libellé affiché devient explicitement `Prologue + X/Y zones · Z%` plutôt que de masquer le bonus — transparence délibérée plutôt qu'un pourcentage qui semblerait ne pas correspondre au compte de zones affiché.

**Avantages** : aucune rupture de fiction au moment le plus vulnérable de la partie (échec) ; gain de motivation dès la toute première session sans aucune nouvelle donnée à collecter.

**Inconvénients** : aucun identifié — changements de texte/calcul d'affichage isolés, aucun autre système touché. Les barres de progression PAR RÉGION restent volontairement un comptage brut, sans bonus (seule la barre globale de l'Odyssée est concernée).

**Impact** : `07-game.js` (L983, L310), `07-boss.js` (`globalPct`, libellé), v12.4.46. Garde-fous de non-régression : `combat-feedback-tone_test.js`, `odyssey-progress-bonus_test.js`.

**Complément (v12.4.47)** : suite au Lot 1, Cyril a demandé davantage de variété que le seul verbe fixe retenu par ADR-88 — remplacé par 2 pools (`COMBAT_HIT_MSGS`, 10 entrées ; `COMBAT_MISS_MSGS`, 5 entrées, `01-core.js`), tirage aléatoire (`_pickCombatHit()`/`_pickCombatMiss()`), symétrique au pattern déjà existant `WRONG_TAUNTS`/`CORRECT_TAUNTS`. Le suffixe ❤️PV reste toujours accolé au message de coup réussi.

---

## ADR-89 — Lot 2 de l'audit Immersion narrative : mémoire du monde (PNJ conscients de la progression, cliffhanger persistant)

**Contexte** : l'audit Immersion Narrative & Motivation a trouvé que les PNJ (`_NPCS_BY_THEME`) avaient une réplique fixe, indépendante de la progression du joueur dans leur région (N5), et que les rebondissements narratifs (`_pickTwistLine`/`_TWIST_LINES`) étaient tirés puis immédiatement perdus, sans aucune trace entre deux sessions (N7).

**Décision** :
1. **N5** : chaque PNJ des 9 thèmes (18 au total) reçoit un second champ `lineDone`, affiché à la place de `line` quand `_zonesOfRegion(regionId)` est intégralement vaincue (`P.mapBossBeaten`). Logique extraite dans une fonction pure `_resolveNpcLine(regionId, theme, idx)` (`07-map.js`), appelée par `_npcClicked()` — extraction motivée par la testabilité (le clic réel dépend du DOM, la logique de sélection non).
2. **N7** : `_maybeShowTwist()` (`07-story.js`) sauvegarde désormais le texte déjà substitué (jamais le template brut, pour rester valide si `{villain}` venait à changer) dans `P.lastTwistLineByAdv[advKey]`. `_advlogJournalHtml()` l'affiche en bandeau "⚡ À suivre..." en tête du Journal du Carnet, tant qu'un rebondissement plus récent n'a pas pris sa place.

**Découverte adjacente (corrigée au passage, coût marginal nul)** : `P.twistLinesUsedByAdv` (tirage sans remise des rebondissements par Odyssée, v12.1.8) n'avait jamais été ajouté à la liste blanche de désérialisation de `05-profile.js` — exactement le défaut documenté par ADR-80, mais sur un champ différent, jamais détecté jusqu'ici faute de test dédié. Ce Lot corrige les deux champs (`lastTwistLineByAdv` et `twistLinesUsedByAdv`) dans le même passage.

**Avantages** : renforce le sentiment de monde vivant (PNJ) et le rappel actif entre deux sessions (cliffhanger) sans nouvelle donnée lourde à collecter — tout reposait déjà sur des mécanismes existants (`mapBossBeaten`, `_pickTwistLine`).

**Inconvénients** : `_NPCS_FINAL` (PNJ de la région finale) n'a pas reçu de `lineDone` — hors périmètre de ce lot, repli silencieux sur `line` déjà géré si jamais un jour cette table gagne le même champ.

**Impact** : `07-map.js` (`_NPCS_BY_THEME`, `_resolveNpcLine`, `_npcClicked`), `07-story.js` (`_maybeShowTwist`, `_advlogJournalHtml`), `05-profile.js` (whitelist), `styles.css` (`.advlog-twist-teaser`), v12.4.48. Garde-fous de non-régression : `npc-progression-recognition_test.js`, `twist-cliffhanger-persistence_test.js`.

---

## ADR-90 — Lot 3 de l'audit Immersion narrative : le joueur comme auteur (callback de chapitre + carnet de voyage combinatoire)

**Contexte** : l'audit Immersion Narrative & Motivation a trouvé qu'aucun texte de chapitre ne référence une performance réelle du joueur (N3), et que le Carnet n'offre aucun récit à la première personne, seulement des statistiques froides (N4). Cyril a demandé explicitement une variété suffisante pour qu'aucune répétition ne soit perceptible.

**Décision** : système COMBINATOIRE plutôt qu'une liste de phrases entières écrites à la main — un ouvreur de lieu (3 par thème × 9 thèmes = 27) combiné à une issue de combat (4 par palier de performance × 3 paliers = 12), soit 324 combinaisons pour 172 zones. Le palier de performance (sans-faute / correct / difficile) est dérivé de `GS.errInGame` au moment de la victoire.
1. **N4** : à chaque première conquête de zone (`07-game.js`, juste après `P.mapBossBeaten.push`), une entrée `{text, flawless, bossName, zoneLabel}` est générée (`_pickJournalEntry`, `07-story.js`) et stockée dans `P.journalEntriesByAdv[advKey]` (plafond 20). Affichée comme "📖 Mon carnet de voyage" dans le Journal du Carnet (6 dernières, plus récentes en premier).
2. **N3** : à l'entrée du chapitre suivant (`_maybeShowStory`, partie 4), une page finale optionnelle (`_pickCallbackLine`) référence la DERNIÈRE entrée du journal — 5 variantes si sans-faute, 5 si victoire difficile. Absente naturellement pour le tout premier chapitre (aucune entrée encore).

**Avantages** : source de données unique (le journal alimente à la fois son propre affichage ET le callback de chapitre) ; variété vérifiée (test : ≥6 textes distincts sur 40 tirages pour un même thème+palier) ; aucun système de tracking supplémentaire, tout repose sur `GS.errInGame` déjà existant.

**Inconvénients** : le test bout-en-bout via `endGame()` s'est révélé trop couplé à des effets de bord DOM sans rapport (bouton retour module, XP, milestones) pour être fiable en isolation — la couverture repose donc sur `_pickJournalEntry`/`_pickCallbackLine` testés directement (identiques à ce qu'`endGame()` appelle, vérifié par relecture) plutôt que sur un test de bout en bout complet.

**Impact** : `07-story.js` (`_JOURNAL_THEME_OPENERS`, `_JOURNAL_OUTCOME_*`, `_pickJournalEntry`, `_CALLBACK_LINES_*`, `_pickCallbackLine`, `_advlogJournalHtml`, `_maybeShowStory`), `07-game.js` (injection post-victoire), `05-profile.js` (whitelist `journalEntriesByAdv`), `styles.css` (`.advlog-travel-log`), v12.4.49. Garde-fou de non-régression : `journal-callback-variety_test.js`.

---

*Document vivant — toute nouvelle décision d'architecture significative doit y être ajoutée, avec son numéro d'ADR, son contexte, sa décision et sa conséquence pour le futur.*
