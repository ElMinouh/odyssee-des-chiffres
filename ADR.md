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

## ADR-91 — Lot 4 (chantier de fond) de l'audit Immersion narrative : habillage diégétique des questions, identité narrative du héros

**Contexte** : l'audit Immersion Narrative & Motivation avait identifié le seul vrai point aveugle touchant l'ACTION réelle du joueur (pas seulement ce qu'il lit) : les questions de calcul restent 100% numériques quel que soit le thème (N1), et le héros n'a aucune identité narrative propre au-delà du ton piloté par l'âge (N8). Cyril a demandé explicitement une variété suffisante pour N1.

**Décision** :
1. **N1** : mise en scène narrative affichée en `toast()`, **UNE SEULE FOIS par entrée en zone** (jamais à chaque question — arbitrage validé avec Cyril, pour ne pas lasser avec un pool réduit ni surcharger chaque calcul), jamais en maternelle. 45 phrases (5 par thème × 9 thèmes, `_STAGING_LINES_BY_THEME`, `07-map.js`), déclenchée dans `renderQ()` (`07-game.js`) via une variable de session `_lastStagingZoneId` (non persistée).
2. **N8** : trait de héros choisi UNE SEULE FOIS, au tout premier lancement (profil neuf, aucune zone battue) — **2 traits** (Courageux/Malin), pas 3 comme initialement esquissé : `_showChoiceModal()` (mécanisme déjà existant du moment charnière, ADR-50/59) ne supporte que 2 boutons, et l'étendre à 3 aurait touché un composant partagé pour un gain marginal. Le trait teinte occasionnellement (25% des cas, bonne réponse uniquement) le commentaire du compagnon déjà existant (`_companionComment`), plutôt qu'un nouveau système de dialogue.

**Avantages** : N1 comble le seul point aveugle qui touchait l'action réelle (pas la lecture passive) ; N8 renforce l'identification sans réécrire aucun des 172 textes existants — les deux réutilisent des mécanismes déjà en place (`toast`, `_showChoiceModal`, `_companionComment`) plutôt que d'en inventer de nouveaux.

**Inconvénients** : N8 réduit de 3 à 2 traits pour rester dans les limites du composant existant — ajustement pragmatique fait en cours d'implémentation, pas re-soumis à validation séparée (impact mineur sur la proposition déjà validée). Le test bout-en-bout complet de `_showChoiceModal` (simuler un vrai clic) n'est pas possible avec le harnais actuel (`querySelector` du stub renvoie un élément jetable, non récupérable) — la couverture s'arrête donc à vérifier que le bon embranchement se déclenche (callback non appelé synchronement), pas le clic réel.

**Impact** : `07-map.js` (`_STAGING_LINES_BY_THEME`, `_pickStagingLine`, `_HERO_TRAIT_LINES`, `_companionComment`), `07-game.js` (`_lastStagingZoneId`, injection dans `renderQ()`), `07-story.js` (`_maybeShowStory`, choix de trait), `05-profile.js` (whitelist `heroTrait`), v12.4.50. Garde-fou de non-régression : `hero-trait-and-staging_test.js`.

**Clôture** : les 4 lots de l'audit Immersion Narrative & Motivation (19e conversation) sont désormais tous livrés (N1 à N8).

---

## ADR-92 — Compléments légers post-audit : prénom du joueur dans les répliques PNJ, éveil du Talisman, écho du trait au générique de fin

**Contexte** : suite aux 4 lots de l'audit Immersion Narrative, Cyril a demandé d'autres pistes. 6 ont été proposées (réutilisant systématiquement des mécanismes tout juste construits par les Lots 1 à 4) ; Cyril a validé l'implémentation de 3 d'entre elles (les plus légères) et demandé le détail de la 6e (fragments de lore hors-combat) sans l'implémenter.

**Décision** :
1. **Prénom réel dans les PNJ** : les 18 répliques `lineDone` de `_NPCS_BY_THEME` utilisent désormais `{hero}`, substitué par `P.name` dans `_resolveNpcLine()` — même mécanique que `_pickCallbackLine()` (Lot 3, N3).
2. **Le Talisman s'éveille** : une modale unique (`talisman_complete_reveal`) se déclenche exactement au moment où le 5e et dernier cristal se débloque (`P.talismanRevealShown`, flag one-shot). Scope volontairement limité à l'Odyssée 'prim' — les 6 autres Odyssées ont chacune leur propre système de collection (armure, bibliothèque, arc-en-ciel...), non couvert ici.
3. **Écho de l'épilogue** : une page finale supplémentaire, choisie selon `P.heroTrait`, clôt l'épilogue de chaque Odyssée — boucle la boucle ouverte par le tout premier choix du jeu (N8, Lot 4).

**Avantages** : 3 ajouts qui réutilisent entièrement des mécanismes déjà construits et testés (aucune nouvelle infrastructure), coût d'implémentation très faible.

**Inconvénients** : le point 4 (Talisman) ne couvre qu'une seule des 7 Odyssées — étendre aux 6 autres systèmes de collection reste un chantier distinct si Cyril le souhaite un jour, chacun ayant sa propre condition de complétion à vérifier individuellement.

**Impact** : `07-map.js` (`_resolveNpcLine`, substitution `{hero}`), `07-game.js` (détection de complétion du Talisman), `07-story.js` (page finale d'épilogue), `05-profile.js` (whitelist `talismanRevealShown`), v12.4.51. Garde-fou de non-régression : `npc-hero-name-talisman-epilogue_test.js`.

---

## ADR-93 — Règle de canal de diffusion narrative : toast furtif vs modale bloquante

**Contexte** : l'audit de Cohérence Globale (19e conversation, C1) a constaté que la mise en scène de zone (N1) utilise `toast()` tandis que le callback de chapitre (N3), le cliffhanger (N7), le choix de trait (N8) et l'éveil du Talisman (point 4) utilisent tous `_showStoryModal()`/`_showChoiceModal()` — chaque choix était défendable individuellement au moment de sa livraison, mais aucune règle écrite ne fixait quand utiliser l'un ou l'autre. Risque : la prochaine fonctionnalité narrative choisirait son canal au jugé.

**Décision** (règle, pas de changement de code — les usages actuels respectent déjà cette règle a posteriori) :
- **`toast()`** : contenu court (une phrase), à fréquence élevée (potentiellement à chaque zone/question), dont la compréhension complète n'est pas indispensable — le joueur peut le manquer sans perdre le fil de l'histoire. Exemple : mise en scène de zone (N1).
- **`_showStoryModal()` / `_showChoiceModal()`** : tout contenu qui doit être lu en entier au moins une fois pour rester cohérent avec la suite (progression narrative, choix qui a des conséquences stockées, révélation ponctuelle). Exemple : prologue, chapitres, twists, moments charnières, callback (N3), choix de trait (N8), éveil du Talisman.

**Avantages** : donne un critère explicite et rapide à appliquer pour toute future fonctionnalité narrative, sans avoir à redébattre du canal à chaque fois.

**Impact** : règle à appliquer par défaut dans toute future conversation touchant à la narration — aucun fichier de code modifié par cette entrée.

---

## ADR-94 — Registre des voix narratives actives du module Aventure

**Contexte** : l'audit de Cohérence Globale (C5, la seule incohérence classée « Importante ») a constaté que le joueur est désormais adressé par au moins 4 voix distinctes, ajoutées séparément au fil des Lots, sans qu'aucun document ne fixe qui parle, quand, ni pourquoi ce sont des voix différentes plutôt qu'une seule. Risque : une 5e voix future (ex. le point 6, fragments de lore, mis en attente) pourrait être ajoutée sans cohérence avec les 4 existantes.

**Décision** — registre de référence, à consulter avant tout nouvel ajout narratif :

| Voix | Fonction | Déclencheur | Canal | Code |
|---|---|---|---|---|
| **Le Chroniqueur** | Se souvient d'une performance réelle passée du joueur | Entrée dans un nouveau chapitre (région) | Modale (page finale du chapitre) | `_pickCallbackLine()`, 07-story.js |
| **Le Compagnon** | Commente en direct, régulièrement, pendant le jeu | Toutes les ~3 questions, sur bonne/mauvaise réponse | Inline (bulle de dialogue) | `_companionComment()`, 07-map.js |
| **Les PNJ** | Réagissent à la progression du joueur dans LEUR région | Clic sur un PNJ de la carte | Modale légère (bulle flottante) | `_resolveNpcLine()`, 07-map.js |
| **Les objets magiques** | S'animent/prennent vie à un moment de complétion précis | Complétion d'une collection (Talisman) | Modale (une seule fois, one-shot) | injection dans `endGame()`, 07-game.js |

**Règle pour toute voix future** : avant d'ajouter une 5e voix, vérifier qu'elle occupe un rôle réellement distinct des 4 ci-dessus (pas une redite), et l'ajouter à ce tableau dans la même conversation que son implémentation — pas après coup.

**Impact** : règle à appliquer par défaut dans toute future conversation touchant à la narration — aucun fichier de code modifié par cette entrée. Concerne directement le point 6 (fragments de lore hors-combat) si ce chantier est un jour lancé.

---

## ADR-95 — Lot 2 de l'audit Cohérence Globale : rééquilibrage de la variété de combat, ton adapté au choix de trait

**Contexte** : l'audit de Cohérence Globale a trouvé deux tensions mineures/moyennes : le pool de feedback de combat (C3, vu à chaque question) restait bien plus petit que le pool du journal de voyage (vu 1 fois par zone), un ratio variété/fréquence inversé ; et le texte du choix de trait de héros (C4) restait le seul contenu narratif identique quel que soit l'âge, dans un système par ailleurs entièrement écrit sur mesure via `_dialogueTone()`.

**Décision** :
1. **C3** : `COMBAT_HIT_MSGS` passe de 10 à 20 entrées, `COMBAT_MISS_MSGS` de 5 à 10 (`01-core.js`) — aucun changement de logique de tirage, extension pure des pools.
2. **C4** : le texte du choix de trait (`_maybeShowStory`, 07-story.js) se branche désormais sur `_dialogueTone()`, avec une variante « tender » plus simple pour la maternelle (« tu es plutôt... ») en plus du texte standard existant.

**Avantages** : aligne ces deux derniers points sur la discipline déjà appliquée partout ailleurs dans le module (variété proportionnée à l'exposition, ton adapté à l'âge) — zéro nouvelle infrastructure.

**Inconvénients** : aucun identifié.

**Impact** : `01-core.js` (pools étendus), `07-story.js` (texte de choix par ton), v12.4.52. Garde-fou de non-régression : `dialogue-tone-and-combat-variety_test.js`.

---

## ADR-96 — Lot 3 de l'audit Cohérence Globale : révélation de collection généralisée aux 7 Odyssées

**Contexte** : ADR-92 avait limité l'éveil de collection au Talisman (Odyssée 'prim'), les 6 autres Odyssées (arc-en-ciel, livre, badge, armure, bibliothèque FR, bibliothèque Histoire) restant sans moment de clôture équivalent — asymétrie relevée par l'audit de Cohérence Globale (C2). Chacune des 6 collections a été vérifiée individuellement dans le code réel avant implémentation (ADR-84) : les conditions de complétion diffèrent réellement (flag epilogue additionnel pour `mat`/`primhist`, structure par objet plutôt que tableau pour `col`, périmètre de régions à 5 plutôt que 6 pour `colfr`/`primhist`).

**Décision** : table générique `_COLLECTION_REVEAL` (07-boss.js), une entrée par advKey (flag one-shot, titre, emoji, texte, fonction `check()` propre) — remplace le bloc Talisman-seul d'ADR-92 dans `endGame()` par une lecture générique de cette table. Volontairement PAS de fonction de vérification unique partagée : les 7 conditions étant réellement différentes, une fausse généralisation aurait été plus fragile que 7 fonctions courtes explicites.

**Avantages** : les 7 Odyssées ont désormais un moment de révélation symétrique ; ajouter une 8e Odyssée future n'exige qu'une nouvelle entrée dans la table, pas de nouveau branchement dans `endGame()`.

**Inconvénients** : aucun identifié — chaque condition a été testée individuellement (10 tests dédiés) avant livraison.

**Impact** : `07-boss.js` (`_COLLECTION_REVEAL`), `07-game.js` (bloc générique remplaçant celui d'ADR-92), `05-profile.js` (whitelist des 6 nouveaux flags), v12.4.53. Garde-fou de non-régression : `collection-reveal-all-odysseys_test.js`.

**Clôture** : les 5 décisions "à appliquer immédiatement" de l'audit Cohérence Globale (C1 à C5) sont désormais toutes livrées.

---

## ADR-97 — Correctif du reset Odyssée non propagé entre appareils (Option A) + extension du nettoyage aux champs narratifs récents

**Contexte** : Cyril a signalé qu'un reset d'Odyssée fait sur un appareil n'était pas visible sur d'autres appareils du même profil. Investigation : `resetAdventure()` écrit uniquement dans `localStorage` (jamais de push cloud explicite) ; et même après une synchronisation ultérieure, `_mergeCloudProfiles()` fait l'UNION des zones vaincues (`uniq(local.mapBossBeaten, imported.mapBossBeaten)`) et le MAX des étapes de zone — une stratégie de fusion conçue pour ne jamais perdre de progression, qui réinjecte donc silencieusement l'ancienne progression du cloud par-dessus un reset local dès le sync suivant.

**Décision** : Option A retenue (des 2 présentées à Cyril) — `resetAdventure()` pousse désormais immédiatement le profil reseté vers le cloud (`pushProfileToCloud(true)`) si un code cloud existe, plutôt que d'attendre la synchronisation périodique. Placé délibérément AVANT `renderMap()` dans la fonction (préoccupations indépendantes — un échec de rendu de carte ne doit jamais bloquer la propagation cloud).

**Limite assumée** : ce correctif réduit fortement la fenêtre du bug mais ne l'élimine pas totalement — si le serveur répond `conflict_kept_server` (logique de conflit côté serveur, hors de portée de ce correctif car le code serveur n'est pas dans ce dépôt) ou si un autre appareil se synchronise dans l'intervalle très court avant ce push, l'ancien profil peut encore réapparaître. **Option B (marqueur de reset respecté par la fusion) reste la correction de la cause racine**, à envisager si le problème persiste malgré ce correctif.

**Découverte adjacente (corrigée au même endroit)** : `resetAdventure()` ne nettoyait pas les champs narratifs ajoutés après ADR-52 (`journalEntriesByAdv`, `lastTwistLineByAdv`, les 7 flags de révélation de collection) — exactement le risque que le commentaire d'ADR-52 avait anticipé. Corrigé dans le même passage. `heroTrait` n'est volontairement PAS effacé (trait de personnage, pas progression d'Odyssée).

**Découverte adjacente (harnais de test)** : `document.documentElement.getAttribute` n'était pas stubbé (`loadGame.js`) — bloquait tout test déclenchant `applyAppearance()`. Corrigé au passage (retourne `null`, comportement standard d'un attribut absent).

**Impact** : `10-figurines.js` (`resetAdventure`), `loadGame.js` (stub `getAttribute`, `setPushProfileToCloud`), v12.4.54. Garde-fous de non-régression : `reset-adventure_test.js` (étendu, 4 tests). **Point de vigilance pour l'avenir** : tout nouveau champ persistant lié à une Odyssée doit être ajouté à la fois à `resetAdventure()` ET à la liste blanche de `validateProfile()` (ADR-80) dans la même conversation que sa création.

---

## ADR-98 — Correction de la cause racine du reset Odyssée non propagé (Option B) : marqueur de reset respecté par la fusion cloud

**Contexte** : après l'Option A (ADR-97, push immédiat), Cyril a demandé une évaluation honnête de sa suffisance. Analyse : A corrige uniquement l'appareil où le reset est fait — un AUTRE appareil, resté sur son ancienne progression locale, déclenche `_importProfileFromServer()` → `_mergeCloudProfiles(P, imported)` à son prochain sync, où `imported` est déjà correctement reseté (grâce à A), mais où l'union historique (`mapBossBeaten`) et le max historique (`zoneProgress`) réinjectent quand même l'ancienne progression LOCALE de cet autre appareil par-dessus le reset. A ne suffisait donc pas — confirmé par le raisonnement, implémenté ensuite (Option B).

**Décision** : `resetAdventure()` marque `data.adventureResetAt = Date.now()`. `_mergeCloudProfiles(local, imported)` compare `local.adventureResetAt` et `imported.adventureResetAt` : le côté au reset le PLUS RÉCENT devient autoritaire pour l'ensemble des champs de progression d'Odyssée (`mapBossBeaten`, `zoneProgress`, et tous les champs narratifs listés dans `ODYSSEY_PROGRESS_FIELDS`) — plus d'union ni de max pour ces champs dans ce cas précis, une préférence explicite. Si aucun côté n'a de reset plus récent que l'autre (cas normal, immense majorité des synchronisations), le comportement historique (union/max) reste strictement inchangé — vérifié par les 12 tests de fusion déjà existants, tous passés sans modification.

**Avantages** : corrige la cause racine dans tous les scénarios (pas seulement celui de l'appareil qui reset) ; rétrocompatible par construction (`adventureResetAt` absent des deux côtés → `resetWinner=null` → ancien comportement au caractère près) ; xp/stars/figurines restent garantis au max quel que soit le reset (contrat affiché à l'utilisateur, jamais remis en cause).

**Limite assumée** : ne protège que contre la fusion CLIENT (`_mergeCloudProfiles`). Le mécanisme `conflict_kept_server` de `pushProfileToCloud()` dépend d'une logique côté serveur non présente dans ce dépôt — si le serveur lui-même rejette un push de reset comme "moins avancé" avant même d'atteindre la fusion client, ce correctif ne peut rien y faire. À vérifier si le problème persistait malgré ADR-97+98.

**Impact** : `12-cloud.js` (`_mergeCloudProfiles`), `10-figurines.js` (`resetAdventure`, marqueur), `05-profile.js` (whitelist `adventureResetAt`), v12.4.55. Garde-fous de non-régression : `cloud-merge-reset-marker_test.js` (9 tests, dont le scénario exact du bug signalé), `cloud-merge_test.js` (12 tests existants, tous inchangés).

---

## ADR-99 — Cause racine véritable du reset non propagé : la synchronisation de routine ne consultait jamais le cloud (push-only), même après ADR-97/98

**Contexte** : Cyril a signalé, après ADR-97 (push immédiat) et ADR-98 (fusion respectant un reset), que le reset ne se propageait TOUJOURS PAS. Investigation approfondie : `scheduleCloudSync()` (timer périodique, toutes les `CLOUD_SYNC_INTERVAL_MS`) et `syncCloudOnEndGame()` appellent uniquement `pushProfileToCloud()` — jamais de pull. Le seul chemin qui appelait `_mergeCloudProfiles()` (donc qui aurait pu bénéficier d'ADR-98) était la réponse `conflict_kept_server` du SERVEUR à un push — une logique côté serveur non présente dans ce dépôt, donc hors de contrôle. Un appareil resté sur une ancienne progression ne relisait donc jamais le cloud de lui-même : il se contentait de repousser sa propre copie, encore et encore, sans jamais se corriger ni corriger le cloud si le serveur n'avait pas sa propre protection anti-régression. Ce n'est pas spécifique aux resets — deux appareils du même profil peuvent diverger durablement en usage normal, la fusion n'ayant jamais l'occasion de s'exécuter.

**Décision** : `pushProfileToCloud()` fait désormais un PULL + FUSION avant de préparer le payload à pousser (réutilise `_importProfileFromServer()`, déjà éprouvée par le chemin de conflit existant, qui appelle `_mergeCloudProfiles()` — donc bénéficie automatiquement de la logique de reset d'ADR-98). Best-effort : si le pull échoue (hors ligne, aucun profil serveur au tout premier push), le push direct de `P` reste le repli, comme avant ce correctif — aucun blocage possible de la sauvegarde locale.

**Avantages** : corrige la cause racine réelle, entièrement côté client, sans dépendre d'une logique serveur invisible. Un seul point de correction (`pushProfileToCloud`) bénéficie automatiquement à TOUS les déclencheurs de synchronisation existants (timer, fin de partie, changement de visibilité) sans avoir à les toucher individuellement. Corrige aussi, en creux, la divergence générale entre appareils (pas seulement le cas du reset).

**Limite assumée** : double le nombre d'appels réseau par cycle de synchronisation (GET puis POST, au lieu de POST seul) — négligeable vu l'intervalle de plusieurs minutes entre synchronisations. Le harnais de test n'a pas de réseau réel ; la couverture vérifie l'orchestration (pull→fusion→P mis à jour) avec un pull stubbé, pas l'appel réseau final lui-même (limite déjà assumée pour tout le module cloud, voir note historique dans `loadGame.js`).

**Impact** : `12-cloud.js` (`pushProfileToCloud`), `loadGame.js` (exposition `pushProfileToCloud` réelle + stub `setPullProfileFromCloud`), v12.4.56. Garde-fou de non-régression : `cloud-sync-pull-before-push_test.js` (4 tests).

---

## ADR-100 — Rafraîchissement automatique de la carte après une synchronisation cloud en arrière-plan

**Contexte** : Cyril a vérifié un reset propagé après ADR-99 (reset à 20h55, vérifié sur un autre appareil à 21h10 — pas encore visible, puis correct après réouverture). Investigation : `_importProfileFromServer()` corrige bien `P` en quelques secondes après l'ouverture (`initCloudSync()`, push initial à +3s), mais `updateMenuUI()` (seul rafraîchissement appelé après une fusion) ne touche que l'écran d'accueil (étoiles, avatar, XP) — jamais la carte Aventure. Si celle-ci était déjà affichée au moment de la synchro, l'écran restait visuellement périmé malgré une donnée déjà correcte, jusqu'à une prochaine navigation.

**Décision** : `_importProfileFromServer()` redessine désormais la carte (`renderMap()`) si l'écran `#v-map` est actuellement affiché (pas masqué), immédiatement après la fusion — même pattern déjà utilisé par `resetAdventure()` elle-même. Appel isolé dans son propre `try/catch`, indépendant de celui d'`updateMenuUI()` : un échec de l'un ne doit jamais empêcher l'autre (même principe qu'ADR-97 — préoccupations indépendantes).

**Avantages** : ferme la dernière lacune visible du correctif ADR-99 — la donnée ET l'affichage se corrigent maintenant ensemble, sans attendre une navigation.

**Impact** : `12-cloud.js` (`_importProfileFromServer`), `loadGame.js` (exposition + stub `setRenderMap`), v12.4.57. Garde-fou de non-régression : `cloud-sync-pull-before-push_test.js` (2 tests ajoutés, 6 au total).

---

## ADR-101 — Nettoyage du code mort du module Aventure (audit de branchement)

**Contexte** : Cyril a demandé un audit vérifiant que chaque fonction prévue dans l'Aventure est bien branchée et active. Croisement systématique de toutes les fonctions définies dans `07-map.js`, `07-game.js`, `07-boss.js`, `07-story.js`, `19-onboarding.js` contre tous leurs appels possibles (JS direct, onclick, chaînes générées) sur l'ensemble du projet. 10 fonctions confirmées sans aucun appelant, chacune vérifiée manuellement pour écarter les faux positifs (ADR-84).

**Décision** :
1. **8 fonctions supprimées** (aucun appelant, aucun test, aucune valeur de réutilisation identifiée) : `startMapBoss()` (remplacée par `startMapStep()`), `openZone()` (remplacée par `requestZoneOpen()`), `onMapNodeClick()` (wrapper mort), `mapCenterOnAvatar()` (aucun bouton relié), `showTrans()` (remplacée par la cinématique d'entrée de zone), `_narrateStop()`/`_narratePause()`/`_narrateStory()` (entièrement dupliquées et remplacées par `_bStop`/`_bPause`/`_bPlay`, locales à `_showStoryModal`, version améliorée avec enchaînement multi-pages).
2. **2 fonctions RÉUTILISÉES plutôt que supprimées** : `ob3IsCompleted()`/`ob4IsCompleted()` étaient déjà testées unitairement (`onboarding-system4_test.js`) mais jamais appelées en production — `_obShouldAutoStart3()`/`_obShouldAutoStart4()` dupliquaient leur logique en dur au lieu de les appeler. Corrigé par réutilisation (même esprit qu'ADR-79 : la duplication est le vrai défaut, pas l'existence de la fonction).
3. **1 fonction identifiée mais volontairement non touchée** : `toggleRegion()` — no-op intentionnel, déjà auto-documenté comme tel dans le code, pas un défaut.
4. **1 fonction hors périmètre** : `startHomework()` (07-game.js) — orpheline également, mais appartient au mode "devoirs", pas à l'Aventure ; non traitée ici sur demande explicite de Cyril de rester dans le périmètre des 7 Odyssées.

**Avantages** : réduit la surface de code à maintenir/comprendre pour toute future conversation ; élimine une vraie duplication de logique (onboarding) plutôt que de la contourner.

**Impact** : `07-map.js`, `07-game.js`, `07-story.js`, `19-onboarding.js`, v12.4.58. Aucun nouveau test requis (suppression pure de code déjà sans appelant, vérifiée par la suite existante : 278/278 inchangés, y compris `onboarding-system4_test.js` qui couvre désormais un chemin réellement emprunté par le code de production).

---

---

## ADR-102 — Scission structurelle de 07-story.js (ADR-54, lot low-risk)

**Contexte** : ADR-54 anticipait un chargement différé du contenu narratif de `07-story.js`, en misant sur l'extraction de 2 fonctions structurelles utilisées ailleurs. Un audit avant codage a révélé que le fichier est bien plus imbriqué qu'estimé : **24 fonctions** appelées depuis d'autres fichiers (`07-map.js`, `07-game.js`, `07-boss.js`, `05-profile.js`, `10-figurines.js`, `11-init.js`), pas 2 — le chargement différé complet reste un chantier plus lourd que prévu, non tenté ici.

**Décision** : extraction d'un premier lot low-risk — les 5 fonctions purement structurelles zone↔région (`_regionOfZone`, `_zonesOfRegion`, `_lastRegionId`, `_regionConquered`, `_zoneReachable`), sans lien avec le contenu narratif, déplacées vers un nouveau fichier `07-story-core.js`, chargé avant `07-map.js`. Ne réduit pas encore le poids au chargement (le gros du texte narratif reste dans `07-story.js`), mais clarifie la frontière et prépare un futur lazy-load.

**Impact** : `index.html` (nouveau `<script>`), `sw.js` (`CACHE_VERSION` v12.4.59, nouvel asset précaché), `package.json`, 20 fichiers de test (`FILES` complété). Vérifié par comparaison stricte de la liste d'échecs avant/après extraction (identique) — voir ADR-104 pour le contexte des échecs préexistants observés à ce moment-là.

---

## ADR-103 — Réparation de `startHomework()` : la carte "Devoir du jour" ne déclenchait jamais le mode devoir

**Contexte** : `startHomework()` avait été identifiée orpheline dès ADR-101 (point 4), mais laissée hors périmètre (audit limité à l'Aventure). Investigation approfondie ici : ce n'est pas seulement du code mort — un devoir assigné par un parent ne progressait **jamais**, faute de déclencheur. `_trackHomework()` n'incrémente la progression que si `GM.homework===true`, un flag uniquement mis à `true` par `startHomework()` elle-même, qui n'était appelée nulle part (aucun bouton, aucun `onclick`). Comparaison avec le "défi de la semaine" (`wc-box`), qui fonctionne parce qu'il track en continu sans dépendre d'un mode explicite.

**Décision** : ajout d'un bouton "▶ Commencer le devoir" sur la carte d'accueil (`onclick="startHomework()"`), maquette validée avant codage. Infobulle parent (`PARENT_GUIDES.objectifs`) mise à jour pour mentionner ce geste côté enfant, qui n'était pas nécessaire avant (le texte laissait croire à un déclenchement automatique).

**Impact** : `index.html`, `styles.css` (`.btn-start-homework`), `09-parent.js` (infobulle), v12.4.60.

---

## ADR-104 — Dérive découverte de `tests/helpers/loadGame.js` et `.eslintrc.json` : deux listes manuelles désynchronisées, remplacées par génération automatique

**Contexte** : en vérifiant ADR-102 dans un bac à sable Vitest reconstitué localement, la copie de `loadGame.js` alors disponible s'est révélée gravement obsolète (60/275 tests en échec, faute d'exposition de fonctions pourtant bien réelles dans le jeu) — alors que le dépôt réel de Cyril n'affichait qu'un seul échec, sans rapport (voir ADR-106). Cause racine identifiée : `.eslintrc.json` (clé `globals`) et `loadGame.js` (objet `__api`) étaient deux **listes manuelles** de toutes les fonctions/constantes globales du jeu — jamais synchronisées de façon fiable au fil des conversations. Confirmé par ESLint lui-même : 110 warnings "non défini" sur du code pourtant bien présent (`_pickStagingLine`, `_resolveNpcLine`, `_COLLECTION_REVEAL`, `trapFocus`, `showConfirm`…).

**Décision** : nouveau script `scripts/gen-test-api.mjs` qui scanne `js/*.js` (déclarations top-level `function`/`const`/`let`/`var`, y compris `async function` et les déclarateurs multiples séparés par virgule) et régénère automatiquement la clé `globals` de `.eslintrc.json` ainsi que le bloc d'exposition de `loadGame.js` — délimité par des marqueurs (`BLOC AUTO-GÉNÉRÉ` / `FIN BLOC AUTO-GÉNÉRÉ`) pour ne jamais toucher aux accesseurs de test réellement sur mesure (19 au total : `setP`, `getGM`, `_domEl`, `setShowConfirm`, `setRenderMap`, `setPullProfileFromCloud`…), qui restent écrits à la main.

**Résultat mesuré** : 110 → 0 warning ESLint "non défini" ; 275/275 tests (contre 269/275 avant correction, au passage, de deux accesseurs de test spécifiquement absents de la copie stale : `setRenderMap`, `setPullProfileFromCloud`).

**Point de vigilance pour l'avenir** : relancer `npm run sync:test-api` après tout ajout d'une fonction/constante globale dans `js/*.js` — élimine cette classe de bug entière plutôt que de compter sur une discipline manuelle, qui a déjà failli deux fois.

**Impact** : `.eslintrc.json`, `tests/helpers/loadGame.js`, `scripts/gen-test-api.mjs` (nouveau), `package.json` (script `sync:test-api`). Aucun bump de version (fichiers de tooling, jamais servis au joueur).

---

## ADR-105 — Nettoyage de 22 fonctions/variables mortes (audit `no-unused-vars`), et incohérence assumée avec ADR-101 sur `toggleRegion()`

**Contexte** : sur 314 warnings ESLint "variable inutilisée", 292 sont des faux positifs (ESLint ne voit pas qu'une fonction est appelée depuis un autre fichier ou un `onclick=""` de `index.html` — limite structurelle de l'architecture multi-fichiers globaux). Les 22 restants ont été vérifiés un par un contre l'usage réel dans tout le projet (aucune occurrence nulle part ailleurs, pas même en commentaire).

**Décision** : suppression des 22 (18 fonctions + 4 variables locales : `oldLvl`/`newLvl` dans `gainXP()`, `islandDone`, `searchId`). Vérification approfondie de `oldLvl`/`newLvl` pour écarter tout risque de bug caché du même type que `startHomework()` (ADR-103) : confirmé sans risque, ancien mécanisme de détection de niveau, remplacé depuis par `isUnlocked()` + flag localStorage, jamais nettoyé.

**Point de transparence** : `toggleRegion()` (`07-map.js`) fait partie des 22 supprimées. Or ADR-101 (point 3) avait explicitement choisi de **ne pas** la supprimer ("no-op intentionnel, déjà auto-documenté comme tel dans le code, pas un défaut"). Revérifié ici : toujours aucun appelant, ni alors ni maintenant — sa suppression ne change strictement aucun comportement (275/275 tests inchangés). La divergence vient d'un critère différent entre les deux audits (ADR-101 choisissait de la garder par prudence documentaire ; celui-ci a traité "aucun appelant nulle part" comme suffisant). Signalé pour traçabilité, sans conséquence fonctionnelle.

**Décision distincte (Prettier)** : les 31 fichiers non conformes à `format:check` ne seront **pas** reformatés — un test sur un fichier représentatif montre que Prettier réécrirait ~2400 lignes sur un fichier qui en fait ~900 (le style du projet, volontairement compact, est structurellement incompatible avec le multi-lignes que Prettier impose sans option pour l'éviter). `format:check` restera en échec ; assumé, sans action prévue.

**Impact** : `01-core.js`, `02-data.js`, `05-profile.js`, `06b-time-block.js`, `07-boss.js`, `07-map.js`, `09-parent.js`, `10-figurines.js`, `12-cloud.js`, `16-francais.js`, `17-messaging.js`, `19-onboarding.js`. Aucun bump de version (aucune fonction supprimée n'était appelée, donc aucun changement de comportement joueur). 275/275 tests inchangés.

---

## ADR-106 — Correction d'une assertion de test obsolète (`npc-progression-recognition_test.js`)

**Contexte** : Cyril a signalé un échec isolé (274/275) sans lien avec une livraison en cours. `_resolveNpcLine()` substitue bel et bien `{hero}` par le prénom du joueur (fonctionnalité v12.4.51, testée et confirmée ailleurs par `npc-hero-name-talisman-epilogue_test.js`) — mais ce test-ci, plus ancien, comparait encore au texte brut non substitué, jamais mis à jour lors de l'ajout de cette fonctionnalité.

**Décision** : assertion corrigée pour tenir compte de la substitution attendue. Fichier de test uniquement, aucun impact sur le jeu.

**Impact** : `tests/npc-progression-recognition_test.js`. Pas de bump de version.

---

---

## ADR-107 — Quiz d'ouverture d'Odyssée : 3 questions adaptées au thème, au lieu d'une seule question générique

**Contexte** : la question unique "Qui es-tu, héros ?" (Courageux/Malin, ADR N8 v12.4.50) était identique pour les 7 Odyssées, sans lien avec leur thème (Calcultopia, Verbopolis, Sidéris...). Cyril a demandé plus de questions, plus de variété, adaptées à chaque Odyssée — avec une contrainte forte : les réponses doivent être rappelées plus tard dans l'histoire, de façon cohérente, sans en changer le fond ni en diminuer la qualité.

**Décision** : 3 questions indépendantes (« approche face au danger », « ce qui motive », « comment se voit la réussite »), 4 réponses chacune. Les **clés de réponse** (brave/malin/loyal/curieux, protecteur/enquêteur/ambitieux/réparateur, rassurant/déterminé/joyeux/réfléchi) sont **identiques pour les 7 Odyssées** ; seuls les intitulés changent, adaptés au vocabulaire et au ton de chaque royaume (ex. maternelle : phrasing simple et tendre ; collège : registre plus mature). Ce choix de clés partagées permet un système de rappel unique, réutilisable partout, plutôt que 7 mécanismes disjoints.

**Point d'architecture important** : le trait de personnage reste **global et permanent** (comme l'ancien `heroTrait`, jamais effacé par `resetAdventure()`) — il n'est donc posé **qu'une seule fois**, avant la toute première zone battue, dans l'Odyssée que l'enfant choisit de jouer en premier. Les 6 autres jeux de questions ne seront jamais vus par un enfant qui commence par une 7ᵉ Odyssée précise — mais le **rappel**, lui (répliques de combat + phrase de clôture d'épilogue), est recalculé à chaque fois en fonction de l'Odyssée **en cours**, pas de celle où la question a été posée : un enfant qui a répondu en jouant à Calcultopia entend un rappel en vocabulaire de Sidéris s'il joue ensuite au collège. C'est ce qui rend le système « adapté à l'Odyssée » malgré une question posée une seule fois.

**Rappel narratif** : 2 canaux, comme l'ancien système — répliques de combat occasionnelles (25 % de chance après une bonne réponse, un des 3 traits tiré au hasard) et une phrase de clôture d'épilogue **composée** à partir des 3 traits en une seule phrase (pas 3 lignes façon liste), pour ne pas dégrader la qualité de l'épilogue existant.

**Impact** :
- `07-story.js` : `_HERO_QUIZ` (questions par Odyssée), `_HERO_EPILOGUE_FRAGMENTS` (fragments de clôture par Odyssée), chaînage des 3 questions dans `_maybeShowStory()`, `_showChoiceModal()` généralisée à N réponses (jusqu'à 4), compatible avec l'ancien format à 2 boutons (moments charnières mi-Odyssée, inchangés).
- `07-map.js` : `_HERO_TRAIT_LINES` restructurée par Odyssée (12 valeurs × 7), `_companionComment()` tire parmi les 3 traits définis.
- `05-profile.js` : `heroTraitApproche`/`heroTraitMoteur`/`heroTraitStyle` remplacent `heroTrait` ; migration automatique de l'ancien champ vers le premier axe pour ne perdre aucun choix déjà fait.
- `10-figurines.js` : commentaire de `resetAdventure()` mis à jour (3 champs, au lieu d'un seul, explicitement non effacés).
- `tests/hero-trait-and-staging_test.js` et `tests/dialogue-tone-and-combat-variety_test.js` : réécrits pour le nouveau système (l'ancien testait une variation par âge/ton qui n'existe plus, remplacée par une variation par Odyssée).
- v12.4.61. 279/279 tests (+6 par rapport à avant ce lot).

**Point de transparence (v12.4.62)** : le quiz était initialement placé AVANT le prologue. Cyril a jugé cela incohérent — le héros ne sait pas encore, à ce stade, quel rôle il va avoir ni ce qu'il devra faire. Repositionné après le prologue, avant le premier exercice : simple inversion d'ordre dans `_maybeShowStory()` (le quiz vérifie désormais aussi que le prologue a été vu), sans impact sur le contenu des questions ni sur le mécanisme de rappel. 280/280 tests.

**Bug introduit par cette inversion, corrigé en v12.4.63** : le quiz n'apparaissait plus du tout après le repositionnement. Cause : `_showStoryModal(_STORY.intro, _done)` appelait directement le callback final `_done` à la fermeture du prologue, au lieu de rebalayer la chaîne via `_maybeShowStory(_done)` — ce qui ne posait aucun problème dans l'ancien ordre (le quiz, placé avant, avait déjà fini son travail avant que le prologue ne soit jamais atteint), mais empêchait totalement d'atteindre le bloc du quiz une fois celui-ci déplacé après. Corrigé en passant `()=>_maybeShowStory(_done)` comme callback de fermeture du prologue.

**Angle mort de la suite de tests** : ce bug n'a pas été détecté par les 280 tests automatisés, car `tests/helpers/loadGame.js` neutralise `setTimeout` (`() => 0`, ne déclenche jamais le callback) — utilisé par `_showStoryModal` pour animer la fermeture avant d'appeler `onDone`. La chaîne "fermeture d'une fenêtre d'histoire → étape suivante" n'est donc jamais réellement exercée par la suite automatisée ; seul un test manuel en conditions réelles l'a révélé. Non traité ici (changer ce stub est un chantier à part, avec son propre risque de régression sur d'autres tests qui pourraient reposer implicitement sur ce comportement neutralisé) — signalé pour référence future.

---

---

## ADR-108 — Cause racine réelle des points 1 et 4 (ADR-102 à 107) : la fusion cloud effaçait la progression narrative locale à chaque synchronisation

**Contexte** : malgré les correctifs des ADR précédents (sauvegarde immédiate, retrait d'un `loadProfile()` non justifié), Cyril a continué à observer le prologue/les chapitres réapparaître "à chaque nouveau lieu" et l'avatar systématiquement reprojeté au 1er lieu du 1er îlot. Les logs de la console navigateur, fournis par Cyril, ont révélé la vraie cause : `pushProfileToCloud()` fait un pull + fusion **avant chaque synchronisation** (ADR-99), déclenchée après **chaque partie** via `syncCloudOnEndGame()` — soit toutes les 15 à 40 secondes en jeu actif, un rythme bien plus élevé qu'anticipé lors des correctifs précédents.

**Le vrai bug** : dans `_mergeCloudProfiles()`, tous les champs de `ODYSSEY_PROGRESS_FIELDS` (dont `storySeen` et `mapAvatarZoneByAdv`) prenaient **systématiquement la valeur du côté "imported" (serveur)** en fusion normale (aucun reset en jeu) — jamais fusionnés, contrairement à `mapBossBeaten`/`ownedFigurines`/etc. qui font correctement l'union. Comme le serveur n'a pas toujours reçu la toute dernière progression locale au moment du pull (latence réseau, cycles de synchro qui se chevauchent), la fusion **écrasait silencieusement** un contenu narratif tout juste vu (`storySeen`) ou une position d'avatar tout juste atteinte (`mapAvatarZoneByAdv`) par une version serveur légèrement en retard. Aggravant : si la carte est affichée au moment de la synchro, `_importProfileFromServer()` la redessine **immédiatement** avec cette position "périmée" — d'où le caractère systématique et immédiat du bug de l'avatar.

**Décision** : en fusion normale (aucun reset en jeu), chaque champ de `ODYSSEY_PROGRESS_FIELDS` est désormais fusionné selon sa nature — union pour les listes de "vu/accompli" (`storySeen`, `_epilogueBonusCredited`), OR logique pour les flags de révélation (`talismanRevealShown` et les 6 autres), fusion superficielle préférant le local pour les maps de choix/lignes utilisées (`majorChoiceByAdv`, `twistLinesUsedByAdv`, `lastTwistLineByAdv`, `journalEntriesByAdv`), préférence locale pour la position courante (`mapAvatarZone`, `mapAvatarZoneByAdv`, `storyPageIdx`) puisque l'appareil actif est le plus légitime pour dire où le joueur en est maintenant. Le cas d'un reset plus récent (`resetWinner`) garde son comportement exact d'avant (priorité totale, sans fusion) — inchangé.

**Point de méthode à retenir** : les ADR-104/107 (correctifs de sauvegarde immédiate, retrait d'un `loadProfile()`) n'étaient pas la cause, mais des améliorations défensives raisonnables faites en cours de route — gardées, sans effet néfaste, mais insuffisantes seules. La cause réelle n'a été trouvée qu'en demandant à Cyril les logs de la console navigateur, qui ont révélé un rythme de synchronisation cloud (15-40s) bien plus élevé que ce que l'analyse statique du code seule avait permis d'anticiper.

**Impact** : `12-cloud.js` (`_mergeCloudProfiles`), nouveaux tests dans `tests/cloud-merge_test.js` (6 ajoutés, verrouillent ce comportement). v12.4.67. 286/286 tests (280 + 6 nouveaux).

---

---

## ADR-109 — "Retour à la carte" doit toujours mener à la carte du monde ; incohérence narrative des moments charnières sur 4 Odyssées

**Contexte (bouton)** : le correctif ADR-108/v12.4.68 avait relabellisé le bouton en "Retour à la zone" quand la zone n'est pas terminée, pour que le libellé corresponde à la vraie destination de `returnMenu()`. Cyril a clarifié qu'il voulait l'inverse : un bouton "Retour à la carte" qui mène RÉELLEMENT à la carte du monde, systématiquement — le retour à la zone étant déjà couvert par le bouton "Retour au lieu" juste à côté.

**Décision (bouton)** : nouvelle fonction `returnToWorldMap()`, sans condition, appelée par `endReplayAction()` à la place de `returnMenu()`. `returnMenu()` garde son comportement d'origine (retour "intelligent" à la zone si elle n'est pas terminée) pour ses autres usages (bouton "Retour au menu", notamment) — non touché.

**Contexte (incohérence narrative)** : en signalant à nouveau le "Verger des Oranges qui reprend des couleurs" après une réinitialisation complète de l'Odyssée, Cyril a prouvé que ce n'était pas un résidu du bug cloud (ADR-108) mais un **vrai bug de contenu, actif**. Cause : `_maybeShowMajorMoment()` se déclenche dès l'arrivée dans une région (avant d'y avoir joué la moindre zone), et le texte `council` de 4 Odyssées (mat/ce1, primfr/ce1, matfr/ce1, colfr/ce1) célébrait à tort la région **qu'on vient d'atteindre** plutôt que la région **précédente, déjà entièrement conquise** — contrairement au modèle correct suivi par prim/col/primhist ("Un royaume déjà libéré", qui parle du passé).

**Décision (incohérence narrative)** : les 4 textes corrigés pour célébrer la région précédente (ex. mat/ce1 : "la Plaine des Coquelicots est redevenue toute rouge" au lieu de "le Verger des Oranges reprend des couleurs"). Règle de discipline ajoutée en commentaire au-dessus de `_MAJOR_MOMENT` pour éviter la récidive sur une future Odyssée : le texte `council` ne doit jamais prétendre que la région tout juste atteinte a déjà progressé.

**Impact** : `01-core.js` (`returnToWorldMap`), `07-game.js` (libellé simplifié), `07-story.js` (4 textes corrigés + règle de discipline). v12.4.69. 286/286 tests inchangés.

---

---

## ADR-110 — Texte d'ouverture de lieu (pendant, à l'arrivée, de _ZONE_OUTRO) — Lot 1/7 : mat

**Contexte** : chaque lieu conquis affiche déjà un texte de fin unique (`_ZONE_OUTRO`, 172 lieux). Cyril a demandé le pendant symétrique : un texte unique à l'ARRIVÉE, au tout premier clic sur un lieu, avant sa 1ère étape — décrivant le lieu, mettant en scène le rôle du héros, cohérent avec le thème et le boss local. Périmètre confirmé : 195 lieux sur les 7 Odyssées (23 en primaire ×3, 30 en maternelle ×2, 33 en collège ×2). Ordre de traitement choisi par Cyril : maternelles, puis primaires, puis collèges.

**Décision** : nouvelle structure `_ZONE_INTRO` (même forme que `_ZONE_OUTRO` : clé = id de zone, `{emoji, text}`), nouvelle fonction `_maybeShowZoneIntro()` (miroir exact de `_maybeShowZoneOutro()`, même présentation, gating par `storySeen` avec le préfixe `zintro_`). Chaque texte est écrit en MIROIR de son `_ZONE_OUTRO` correspondant (même personnage/problème local, posé plutôt que résolu) et référence le nom du boss de fin de lieu pour annoncer, en douceur, le défi à venir — jamais un indice sur la façon de le résoudre (même règle que le chapitre d'entrée, ADR-49). Une règle de discipline est documentée en commentaire au-dessus de `_ZONE_INTRO` pour les prochains lots.

**Intégration dans la chaîne narrative** : ajouté comme toute dernière étape de `_maybeShowStory()`, après le chapitre d'entrée et le moment charnière (qui, eux, ne se déclenchent qu'à l'entrée d'une RÉGION) — le texte d'ouverture de lieu, lui, se vérifie à CHAQUE lieu, quelle que soit la région.

**Ce lot couvre les 7 Odyssées au complet (195/195 lieux)** : mat (30), matfr (30), prim (23), primfr (23), primhist (23), col (33), colfr (33). Rédigé et livré en 3 groupes dans la même conversation (maternelles, puis primaires, puis collèges, à la demande de Cyril), chaque lieu vérifié individuellement contre son `_ZONE_OUTRO` correspondant pour garantir la cohérence du personnage/problème local, et contre son `bossName` pour le nom exact du boss annoncé.

**Impact** : `07-story.js` (`_ZONE_INTRO`, 195 entrées, `_maybeShowZoneIntro`, chaînage dans `_maybeShowStory`), `tests/zone-intro_test.js` (couverture exhaustive automatisée des 195 lieux + substitution `{hero}`/`{villain}`). v12.4.71. 291/291 tests.

---

---

## ADR-111 — Checklist consolidée : ajouter une nouvelle Odyssée ou du contenu narratif majeur

**Contexte** : cette conversation (ADR-102 à 110) a révélé, un par un, une série de règles de cohérence narrative et de pièges techniques — chacun découvert à la dure, sur les 7 Odyssées existantes. Cyril a demandé qu'elles soient **actées** pour s'appliquer **automatiquement** à toute future Odyssée (8e, 9e...) ou tout futur contenu narratif majeur, sans avoir à redécouvrir chaque piège un par un. Cette entrée sert de **check-list de référence unique** — à consulter systématiquement AVANT d'écrire ou de modifier du contenu narratif, plutôt que de relire les 10 ADR individuels.

### Check-list technique (mécanique, pas contenu)

1. **Après tout ajout d'une fonction/constante globale dans `js/*.js`** → lancer `npm run sync:test-api` (régénère `.eslintrc.json` + `tests/helpers/loadGame.js` automatiquement). Ne jamais éditer ces deux fichiers à la main pour cette partie (ADR-104).
2. **Tout marquage "contenu narratif vu"** (`_markStorySeen` et équivalents) doit utiliser une sauvegarde **immédiate** (`saveProfileNow`), jamais différée — une fenêtre de sauvegarde différée est une fenêtre où un rechargement de profil peut faire perdre le marquage et provoquer une réapparition du contenu (ADR-108).
3. **Tout nouveau champ de progression narrative persistant** (sur le modèle de `storySeen`, `mapAvatarZoneByAdv`, `majorChoiceByAdv`, les flags `xxxRevealShown`...) doit être ajouté à `ODYSSEY_PROGRESS_FIELDS` dans `_mergeCloudProfiles()` (12-cloud.js) **avec une vraie stratégie de fusion** (union pour les listes de "vu", OR logique pour les flags booléens, préférence locale pour une position courante) — jamais laissé fusionner par défaut ("imported gagne"), qui a causé une perte silencieuse de progression à chaque synchro cloud de routine (ADR-108). Même vigilance que celle déjà documentée en ADR-52 pour `resetAdventure()`/`validateProfile()` : un nouveau champ oublié à un seul de ces 3 endroits (validateProfile, resetAdventure, _mergeCloudProfiles) est un bug latent.
4. **Tout bouton dont le libellé promet une destination précise** ("Retour à la carte", etc.) doit RÉELLEMENT y mener, sans condition cachée qui redirige ailleurs selon le contexte — sinon écrire un libellé différent selon le cas, ou une fonction dédiée sans branche conditionnelle surprenante (ADR-109).

### Check-list de contenu narratif (cohérence de l'histoire)

5. **Trait de héros (quiz d'ouverture)** : 3 questions indépendantes par Odyssée, mêmes clés de réponse partout (brave/malin/loyal/curieux, protecteur/enquêteur/ambitieux/réparateur, rassurant/déterminé/joyeux/réfléchi) — seuls les intitulés changent. Posé UNE FOIS **PAR ODYSSÉE** (v12.7.0, ADR-113 — plus un choix de personnage global unique), juste après le prologue de CETTE Odyssée (jamais avant — le héros ne sait pas encore quel rôle il va avoir). Tout nouveau champ de ce type doit être stocké en `ByAdv` (voir ADR-113) et suivre la règle du point 3 ci-dessus.
6. **Moment charnière régional** (`_MAJOR_MOMENT`, texte `council`) : se déclenche dès l'arrivée dans une région, AVANT d'y avoir joué la moindre zone. Le texte doit donc célébrer la région **précédente** (déjà entièrement conquise), jamais la région qu'on vient d'atteindre — piège rencontré sur 4 Odyssées à la fois (ADR-109).
7. **Texte d'ouverture et de fin de lieu** (`_ZONE_INTRO` / `_ZONE_OUTRO`) : toujours écrits **en paire, en miroir exact** — l'intro pose un problème local et nomme le boss de fin de lieu (sans donner d'indice sur la solution) ; l'outro le résout. Jamais l'un sans l'autre. Le ton doit correspondre à l'âge de l'Odyssée (tendre en maternelle, standard en primaire, plus mature en collège) — voir le modèle des 195 lieux déjà rédigés (ADR-110).
8. **Avant d'écrire un nouveau texte narratif touchant un lieu ou une région**, toujours relire le texte correspondant déjà existant (outro si on écrit l'intro, chapitre de région si on écrit un moment charnière) pour vérifier qu'aucune référence temporelle ne se contredit (ne jamais prétendre qu'un lieu a déjà progressé avant d'y avoir joué).
9. **Avant d'ajouter un élément visuel à l'écran d'un lieu**, toujours vérifier PAR OÙ le joueur y accède réellement en jeu — ce projet a plusieurs écrans "lieu" qui coexistent pour des raisons historiques (`openArchipelZoom()`, l'écran réellement ouvert au clic sur un lieu depuis la carte ; `renderZoneMap()`/`v-zone`, un repli plus ancien utilisé seulement au retour d'une partie en cours). Modifier le mauvais des deux produit un correctif invisible en pratique, sans qu'aucun test ne le révèle si le test cible directement la fonction modifiée plutôt que le chemin réel (ADR-112, correctif v12.5.1).
10. **Toute nouvelle modale susceptible de s'ouvrir PAR-DESSUS un écran déjà affiché** (ex. un lieu déjà ouvert) doit vérifier son z-index contre celui de cet écran, avec une classe dédiée plutôt que de relever le z-index de base d'une famille de modales partagée par d'autres usages qui n'ont pas ce besoin (ADR-112, correctif v12.5.2).

**Impact** : aucun changement de code dans cette entrée — c'est une checklist de référence, pas un correctif. Sert de point d'entrée unique pour toute future conversation touchant à une nouvelle Odyssée ou à du contenu narratif transverse.

---

## ADR-112 — Fragments de lore hors-combat (5e voix narrative, "Le Monde") — pilote sur mat

**Contexte** : point 6 identifié dès la session 19 (fragments de lore hors-combat), explicitement différé à l'époque. Cyril a demandé son lancement cette session : des éléments cliquables **optionnels**, sans aucun rapport avec les questions/calculs, qui racontent un peu du MONDE plutôt que l'histoire personnelle du héros (contrairement à `_ZONE_INTRO`/`_ZONE_OUTRO`/`_MAJOR_MOMENT`, qui parlent tous du parcours du joueur). Objectif explicite : une 2e boucle de motivation, indépendante de la réussite scolaire — la curiosité pure.

**Clarifications obtenues avant codage** (maquette validée avant toute implémentation, règle du projet) : les objets peuvent se trouver À LA FOIS sur la carte générale et dans les différents lieux (deux ancrages distincts, pas un seul) ; fréquence choisie : environ 1 zone sur 2-3 ; nom de l'onglet du Carnet : **"Trésors"** (pas "Codex", jugé trop abstrait pour des enfants) ; lancement en pilote sur une seule Odyssée (mat, maths maternelle) avant extension aux 6 autres une fois validé en usage réel.

**Décision — architecture technique** :
- Deux ancrages, tous deux rattachés à un `zoneId` existant (aucun nouveau système de coordonnées) :
  - type `'zone'` : visible dans la liste des étapes DU lieu concerné (`renderZoneMap`, 07-map.js) — trouvé EN JOUANT ce lieu.
  - type `'map'` : visible sur la carte archipel, en léger décalage du nœud de ce lieu (`renderMap`, 07-map.js), dès que la région n'est plus dans le brouillard — **indépendant du verrouillage de la zone elle-même** (curiosité pure, pas de gating scolaire).
- Nouvelle structure `_LORE_FRAGMENTS` (07-story.js), clé = advKey, valeur = tableau de `{id, type, zoneId, emoji, title, text}`.
- Marquage : `P.loreFoundIdsByAdv[advKey]` (liste, pattern `storySeen`, scindé par Odyssée comme `mapAvatarZoneByAdv`).
- **Ajouté à `ODYSSEY_PROGRESS_FIELDS` (12-cloud.js) avec une vraie stratégie de fusion DÈS SA CRÉATION** (union des ids trouvés, par advKey) — application directe de la règle ADR-111 pt.3, pour ne jamais reproduire le bug ADR-108 sur ce nouveau champ.
- Modale dédiée `_showLoreModal()`, volontairement séparée de `_showStoryModal()` (plus simple : une page, pas de narration audio) — même famille visuelle (`.story-overlay`/`.story-parchment`), avec un accent violet (`#b39ddb`) et un bandeau "🌍 Secret du monde" propres au Monde, distincts du parchemin doré de l'histoire du héros. Enregistré au registre des voix narratives (ADR-94) comme 5e voix : "Le Monde" — déclenchée par un clic volontaire du joueur, canal modale.
- Nouvel onglet **"Trésors"** du Carnet (`_advTresorsHtml()`, 07-boss.js) : texte complet pour les fragments trouvés, silhouette "❔ Secret non découvert" sinon, compteur X/Y.

**Pilote livré** : Odyssée 'mat' (maths maternelle) uniquement, 12 fragments (7 de type 'zone', 5 de type 'map'), répartis sur les 5 régions (cp:3, ce1:2, ce2:3, cm1:2, final:2) — chaque texte rédigé dans le ton tendre propre à la maternelle, cohérent avec le thème visuel de sa région, et RICHE (plusieurs phrases par fragment, jamais une simple étiquette). Les 6 autres Odyssées suivront une fois ce pilote validé en usage réel par Cyril.

**Alternatives rejetées** : un système de coordonnées libre indépendant des zones (rejeté — complexité de layout inutile, l'ancrage par zoneId réutilise tout ce qui existe déjà) ; réutiliser `_showStoryModal()` telle quelle pour la modale de lore (rejeté — risque de régression sur une fonction déjà fragile et abondamment utilisée ailleurs ; une fonction dédiée, plus simple, isole le risque).

**Impact** : `07-story.js` (`_LORE_FRAGMENTS`, `_isLoreFound`, `_markLoreFound`, `_openLoreFragment`, `_showLoreModal`), `07-map.js` (`_loreZoneStepHtml` dans `renderZoneMap`, points de lore dans `renderMap`), `07-boss.js` (onglet "Trésors", `_advTresorsHtml`), `05-profile.js` (whitelist `loreFoundIdsByAdv`), `12-cloud.js` (`ODYSSEY_PROGRESS_FIELDS` + fusion en union par advKey), `styles.css` (`.lore-point`, `.zone-step.lore-step`, `.lore-parchment`/`.lore-badge`, `.tresor-row`). v12.5.0. Garde-fous de non-régression : `tests/lore-fragments.test.js` (13 tests), `tests/lore-fragments-cloud-merge.test.js` (5 tests). 309/309 tests.

**Correctif v12.5.1 (signalé par Cyril immédiatement après livraison)** : "je vois ceux sur les îlots [la carte], je ne vois pas ceux dans les lieux". Cause : le jeu a en réalité **deux écrans distincts pour un lieu** — `openArchipelZoom()` (la fenêtre "zoom" réellement ouverte par `requestZoneOpen()` au clic sur un lieu depuis la carte, l'écran que voit le joueur dans l'immense majorité des cas) et `renderZoneMap()`/`v-zone` (un écran plus ancien, utilisé seulement en repli quand on revient d'une partie en cours via `returnMenu()`/`quitGame()`, sans jamais repasser par la carte). Le fragment "de site" avait été câblé UNIQUEMENT dans le second — jamais visible en pratique. Corrigé en ajoutant le point de lore dans `openArchipelZoom()` également (position pseudo-aléatoire dans la scène, écartée des nœuds d'étape par une passe de répulsion simple, calculée après le tracé du sentier pour ne jamais l'influencer), avec rafraîchissement en direct (`data-lore-id`) sans reconstruire toute la modale. **Nouveau test dédié** (`openArchipelZoom() — le fragment "de site" apparaît bien dans l'écran RÉELLEMENT ouvert au clic sur un lieu`) pour verrouiller le bon écran à l'avenir. Point de méthode retenu : pour toute future extension touchant à l'affichage d'un lieu, toujours vérifier PAR OÙ le joueur y accède réellement en jeu (ici, deux chemins distincts existaient, un seul dominant) avant de choisir où intégrer un nouvel élément visuel. v12.5.1, 311/311 tests.

**Correctif v12.5.2 (signalé par Cyril dans la foulée)** : "la page de texte ne s'ouvre pas, il faut fermer le lieu pour qu'elle apparaisse". Cause : conflit d'empilement (z-index) — `.archipel-zoom-overlay` (l'écran du lieu) est à 1000, tandis que `.story-overlay` (toute la famille de modales narratives, dont la nouvelle modale de lore) reste à 300. La modale s'ouvrait bien, mais DERRIÈRE l'écran du lieu encore affiché, invisible jusqu'à sa fermeture. Corrigé en donnant à la modale de lore une classe dédiée `.lore-overlay` (`z-index:1100`), plutôt que de relever le z-index de base de `.story-overlay` (qui aurait pu avoir des effets de bord ailleurs, sur des usages qui ne s'ouvrent jamais par-dessus un lieu). v12.5.2, 311/311 tests (1 test ajusté pour refléter la nouvelle classe).

**Extension v12.6.0 (les 6 autres Odyssées)** : le pilote 'mat' ayant été validé en usage réel (plus aucun bug de visibilité rapporté après v12.5.2), extension du système à `matfr`, `prim`, `primfr`, `primhist`, `col`, `colfr` en une seule fois, comme convenu avec Cyril dès le lancement du chantier. **65 nouveaux fragments** rédigés (12+9+9+9+13+13), portant le total à **77 fragments sur les 7 Odyssées**. Répartition : matfr 12 (même distribution que mat, ton tendre) ; prim/primfr/primhist 9 chacune (même sélection de lieux miroir d'une Odyssée à l'autre, pour garder une cohérence de structure malgré des univers différents) ; col/colfr 13 chacune. Tonalité adaptée par niveau (maternelle tendre, primaire aventure légère, collège vocabulaire plus riche avec un soupçon de mystère jamais anxiogène). Fait notable : `primhist` (périodes historiques réelles) et `primfr`/`colfr` (univers de mots/langue) ont permis des fragments doublement pertinents — curieux ET, pour primhist, véridiques historiquement, renforçant la vocation éducative de cette Odyssée. Aucun nouveau code de plomberie nécessaire : le système (ancrage par zoneId, fusion cloud en union, affichage carte + `openArchipelZoom`) généralisait déjà correctement aux 7 Odyssées dès sa conception v12.5.0/v12.5.2. **6 nouveaux tests dédiés** (intégrité multi-Odyssées, absence de doublon d'id global, visibilité réelle dans `openArchipelZoom` sur les 6 nouvelles Odyssées). v12.6.0, 314/314 tests.

---

## ADR-113 — Trait de héros propre à chaque Odyssée (plus un choix de personnage global)

**Contexte** : ADR-107/108 avaient conçu le quiz de trait de héros (3 questions × 4 réponses) comme un choix de personnage GLOBAL, posé une seule fois dans la vie entière d'un profil (à la toute première Odyssée jouée), puis réutilisé tel quel pour le rappel (répliques de combat + phrase d'épilogue) dans TOUTES les Odyssées suivantes, sans jamais être reposé. Cyril a testé "La Bibliothèque infinie" (colfr) sur un profil ayant déjà joué et progressé en maths maternelle (mat) : aucun quiz ne s'est affiché, comportement conforme à la conception d'origine mais jugé insatisfaisant à l'usage — **demande explicite de changement** : "il faut que le questionnaire s'affiche 1 fois à CHAQUE début d'histoire car une même personne peut faire des choix différents selon les odyssées."

**Décision** : le trait de héros devient un choix **propre à chaque Odyssée**, posé une fois par Odyssée (juste après SON prologue, comme avant), et non plus une fois pour tout le profil.
- Stockage : `P.heroTraitApprocheByAdv`, `P.heroTraitMoteurByAdv`, `P.heroTraitStyleByAdv` — chacun un objet `{advKey: valeur}` — remplacent les 3 anciens champs plats `heroTraitApproche/Moteur/Style`.
- Déclenchement (`_maybeShowStory`, 07-story.js) : le garde-fou "ne jamais interrompre une Odyssée où le joueur a déjà progressé" reste présent mais est désormais **scopé à l'Odyssée courante** (vérifie si un boss a été battu PARMI LES ZONES DE CETTE Odyssée, via `MAP_ZONES`, la variable déjà permutée par `startAdventure()`), plutôt que sur `P.mapBossBeaten` global.
- Lecture du trait (répliques de combat `_companionComment()` 07-map.js ; phrase de clôture d'épilogue, 07-story.js) : les deux lisent désormais `heroTrait*ByAdv[advKey]` pour l'Odyssée EN COURS/qui se termine, au lieu du champ global.
- Reset complet (`resetAdventure()`, 10-figurines.js, qui remet à zéro les 7 Odyssées à la fois) : les 3 maps ByAdv sont désormais remises à `{}` — cohérent avec "toutes les histoires seront à redécouvrir" (sous l'ancien système, le trait global était volontairement épargné par ce reset, car ce n'était pas une progression d'Odyssée ; ce n'est plus le cas maintenant que c'est un choix RATTACHÉ à chaque histoire).
- Fusion cloud (`_mergeCloudProfiles`, 12-cloud.js) : les 3 nouveaux champs sont ajoutés à `ODYSSEY_PROGRESS_FIELDS` avec la MÊME stratégie de fusion que `majorChoiceByAdv`/`journalEntriesByAdv` (fusion superficielle par advKey, priorité au local en cas de conflit sur une même clé) — dès leur création, en application stricte de la règle ADR-111 pt.3, pour ne pas reproduire le bug ADR-108 sur ce nouveau champ.
- Migration (`validateProfile()`, 05-profile.js) : un profil ayant déjà répondu sous l'ancien système global voit sa réponse reprise pour `P.lastAdventure` (à défaut `'prim'`) — approximation ponctuelle, appliquée une seule fois (tant qu'aucun axe n'a de valeur `ByAdv`). Toute autre Odyssée déjà jouée avant cette mise à jour, mais non retenue par cette heuristique, ne perd aucune progression réelle (étoiles, zones, figurines...) — elle perd seulement, au pire, la petite touche de saveur des répliques liées au trait, et le questionnaire ne se represente pas non plus pour elle tant qu'elle a du boss battu (même garde-fou que pour une Odyssée neuve).

**Alternatives rejetées** : reconstituer précisément, pour CHAQUE Odyssée déjà jouée avant cette mise à jour, laquelle avait "réellement" reçu la réponse historique (en croisant `P.mapBossBeaten` avec les jeux d'ids de zone des 7 Odyssées) — rejeté pour complexité disproportionnée par rapport à l'enjeu réel (une simple migration ponctuelle et approximative suffit ; aucune perte de progression réelle n'est en jeu, seulement une possible re-question ou une flaveur de réplique en moins sur d'anciennes parties).

**Impact** : `05-profile.js` (whitelist + migration), `07-story.js` (déclenchement du quiz scopé par Odyssée, lecture épilogue), `07-map.js` (`_companionComment`), `10-figurines.js` (`resetAdventure`), `12-cloud.js` (`ODYSSEY_PROGRESS_FIELDS` + fusion). Checklist ADR-111 pt.5 mise à jour en conséquence. v12.7.0. Tests réécrits : `tests/hero-trait-and-staging.test.js` (adapté au stockage ByAdv, ajout d'un scénario multi-Odyssées) + 3 nouveaux tests de fusion cloud dédiés.

---

## ADR-114 — Décor universel par lieu (thème + petits motifs), sur tous les niveaux

**Contexte** : signalement d'un bug d'affichage en maternelle (bandeau de titre incohérent avec le lieu réellement joué), qui a révélé un bug de navigation bien plus important (voir ADR-115bis ci-dessous, section "écran de lieu"). En creusant le décor visuel demandé pour habiller l'écran de jeu maternelle, Cyril a précisé une exigence transverse : *"ces personnalisations de l'écran de jeu doivent concerner toutes les odyssées de toutes les matières de tous les niveaux actuels et futurs"*.

**Découverte en investiguant** : le fond coloré par lieu existait déjà, de longue date, pour tous les niveaux non-maternelle, via `applyTheme(zone.theme)` (mécanisme universel préexistant, jamais documenté comme tel). Seule la maternelle avait un système séparé et plus doux (délibérément, pour rester calme pour les tout-petits). Seuls les "petits motifs" (nouveauté) manquaient partout.

**Décision** : deux mécanismes complémentaires, tous deux appelés depuis `startMapStep()` (07-map.js) pour tous les niveaux :
- `applyTheme(zone.theme)` (préexistant, inchangé) — habillage global (couleurs, variables CSS).
- `_applyZoneMotifs(zone)` (nouveau) — 2 petits emoji discrets (`#zone-motifs`), réutilisant l'unique emoji déjà curé par thème dans `_THEME_META` (aucun contenu nouveau créé). Pose `#v-game.has-zone-motifs` (contexte d'empilement CSS, `position:relative;z-index:0`) UNIQUEMENT quand des motifs sont réellement affichés — indispensable, `position:relative` seul ne crée pas de nouveau contexte d'empilement CSS et un enfant en `z-index:-1` peut alors se retrouver peint avant le fond de son propre parent (piège rencontré et corrigé en cours de route, deux vagues de correctifs avant la vraie cause trouvée).
- Maternelle : `_matApplyAmbiance()` simplifiée, garde un fond doux séparé mais suit désormais le vrai thème du lieu (au lieu du monde générique du niveau), délègue les motifs au système central.

**Alternatives rejetées** : un système de motifs propre à la maternelle uniquement (rejeté dès la première demande de généralisation de Cyril, en cours de chantier — aurait dupliqué `_matRenderMotifs()` par niveau au lieu d'une fonction universelle).

**Impact** : `07-map.js` (`_applyZoneMotifs`, `_ZONE_MOTIF_POS`), `07-game.js` (vidage des motifs dans `startGame()`/`endGame()`), `13-maternelle.js` (`_matApplyAmbiance()` simplifiée), `index.html`/`styles.css` (`#zone-motifs`, `.zone-motif`, `#v-game.has-zone-motifs`). v12.7.3-v12.7.5. Tests : `tests/decor-par-lieu.test.js` (13 tests au total sur ce chantier, dont un confirmant explicitement le fonctionnement sur un niveau non-maternelle).

---

## ADR-115 — Notification de nouveau contenu (licences/figurines)

**Contexte** : à l'occasion de l'ajout des licences Avatar et Tobie Lolness, Cyril a demandé un système à portée générale et future : informer le joueur, à sa prochaine connexion, de tout nouveau contenu ajouté au jeu — en réutilisant les fenêtres/inserts déjà existants plutôt qu'un nouveau composant. Maquette validée avant codage (règle du projet).

**Décision** : registre chronologique `_CONTENT_UPDATES` (03-figurines-data.js), chaque entrée montrée une seule fois par profil. Orchestrateur `_maybeShowContentUpdate(afterCb)` : vérifie `P.contentUpdatesSeen`, affiche la plus ancienne annonce non vue via `_showStoryModal()` (réutilise le parchemin narratif déjà utilisé pour les chapitres ET les fragments de lore — troisième usage cohérent, aucune nouvelle mécanique de modale créée), marque comme vue, sauvegarde. Point d'accroche : `gotoSubjects()` (01-core.js, bouton CONTINUER de l'écran d'accueil), imbriqué juste après la garde d'identité/PIN déjà existante (`_pcMaybeShow()`), même pattern "garde puis continue". Si plusieurs annonces ont été manquées (absence prolongée du joueur), elles s'enchaînent naturellement une par session, jamais toutes d'un coup.

**Alternatives rejetées** : une bannière permanente sur l'écran d'accueil plutôt qu'une modale ponctuelle (rejeté — moins cohérent avec les autres mécanismes d'annonce du jeu, et risque d'être ignorée/oubliée par un enfant).

**Impact** : `03-figurines-data.js` (`_CONTENT_UPDATES`, `_maybeShowContentUpdate`), `01-core.js` (`gotoSubjects()`), `05-profile.js` (whitelist `contentUpdatesSeen`), `12-cloud.js` (`ODYSSEY_PROGRESS_FIELDS`, fusion en union — appliqué dès la création du champ, règle ADR-111 pt.3), `styles.css` (`.new-item-row`/`.new-item-emoji`). v12.7.9. Tests : `tests/new-licenses-and-content-update.test.js`.

---

## ADR-116 — Déblocage par complétion de licence (générique, piloté par la donnée)

**Contexte** : réponse à une question de Cyril ("comment gagner Balaïna et Cœur de Balaïna concrètement ?") qui a révélé un vrai manque : ces deux figurines avaient été posées en rareté `exclusif`/prix 0 sans qu'aucun mécanisme d'attribution n'ait jamais été construit. Ajustement demandé : Balaïna doit être achetable normalement, Cœur de Balaïna reste à débloquer par complétion mais avec un mode d'acquisition clairement indiqué au joueur (pas un déblocage silencieux). Extension demandée dans la foulée à 11 figurines supplémentaires d'autres licences (Huntrix, Saja Boys, Garmadon Quatre Bras, Goku Ultra Instinct, Frieza Doré, Mew, Mewtwo, Goldorak, Goldorak & Soucoupe, Cobra Rugball, L'Atlantis).

**Décision** : plutôt qu'une fonction dédiée par licence, un mécanisme générique unique `_checkLicenseCompletions()` (10-figurines.js), piloté par un flag booléen `completionLock:true` posé sur chaque figurine concernée (+ un champ `unlockHint` pour le message affiché en boutique à la place du libellé générique trompeur "à gagner en boss"). Toute future figurine "à débloquer par complétion" n'a besoin que de ces deux champs, sans code supplémentaire. Point de conception non trivial : le calcul des "figurines requises" exclut, pour une figurine verrouillée donnée, les AUTRES figurines elles-mêmes `completionLock:true` de la même licence — nécessaire car Goldorak et Dragon Ball ont chacune 2 figurines verrouillées ; sans cette exclusion, un calcul naïf créerait un blocage circulaire. Les figurines verrouillées d'une même licence se débloquent alors simultanément, dès que le reste de la collection "normale" est complet. Appelé après tout ajout à `P.ownedFigurines` (achat, drop de boss — désormais retiré, voir ADR-117 —, figurine saisonnière).

**Alternatives rejetées** : une fonction spécifique par licence (`_checkTobieLolnessCompletion()`, approche initiale v12.7.11) — remplacée dès la 2e demande d'extension dans la même conversation pour éviter la prolifération de code dupliqué.

**Impact** : `10-figurines.js` (`_checkLicenseCompletions`, `buyFigurine()`), `03-figurines-data.js` (12 figurines converties : Cœur de Balaïna + 11 autres, champs `completionLock`/`unlockHint`), `06c-seasonal.js` (`unlockSeasonalFigurine()`, appel ajouté par cohérence). v12.7.11-v12.7.12. Tests : `tests/major-choice-whitelist.test.js` n'est pas concerné ; couverts par une extension de `tests/new-licenses-and-content-update.test.js` (24 tests au total sur ce fichier, dont un cas dédié aux 2 figurines verrouillées d'une même licence, testé sur Goldorak, et un test négatif équivalent sur Dragon Ball).

---

## ADR-117 — Retrait du drop de figurine rare au boss (mécanisme jamais fonctionnel) + source unique pour la liste des licences en boutique

**Contexte** : en auditant le code de fin de combat de boss (`07-game.js`), un mécanisme de "drop de figurine rare" comparait sur chaque figurine un champ `f.rarity` qui n'a jamais existé (le vrai champ est `r`) — ce mécanisme n'a donc probablement jamais fonctionné, sans que personne ne s'en aperçoive. Dans la même conversation, la liste des licences affichées en boutique (`SHOP_LICENSES`) s'est révélée être une liste séparée, maintenue à la main, en retard sur la vraie liste des univers (`UNIVERS_LIST`) — cause du bug "Avatar et Tobie Lolness invisibles en boutique" alors que leurs figurines existaient bien en données.

**Décision** : le bloc de code mort comparant `f.rarity`/`RARE_LIKE` est retiré de `07-game.js` (les drapeaux `dropRare:true` laissés sur certaines définitions de boss, `02-data.js`, sont volontairement laissés inertes — aucun effet, aucun risque à les retirer plus tard). La liste de la boutique est reconstruite par `_buildShopLicenses()`, dérivée automatiquement de `UNIVERS_LIST` (avec 3 exceptions historiques conservées pour leur libellé/icône propre : `none`/`all`/`mine`, `nj`/`mv`/`sx`) — plus aucune liste manuelle à maintenir en double ; toute licence ajoutée à `UNIVERS_LIST` apparaît désormais automatiquement en boutique.

**Alternatives rejetées** : réparer le champ `f.rarity` plutôt que retirer le mécanisme (rejeté — aucune figurine n'a jamais porté ce champ, il n'y a donc rien de réel à "réparer") ; corriger une seule fois la liste de boutique à la main sans la dériver (rejeté — ne prévient pas la même récidive sur une future licence).

**Impact** : `07-game.js` (retrait du bloc mort), `10-figurines.js` (`_buildShopLicenses()`). v12.7.13. Tests : `tests/boss-drop-removal-license-unification.test.js`.

---

## ADR-118 — Solde d'étoiles dérivé de deux compteurs monotones, jamais fusionné directement

**Contexte** : le bug le plus critique du projet à ce jour. Le solde d'étoiles (`P.stars`) était fusionné en cloud par un simple maximum — correct pour un compteur qui ne fait qu'augmenter, mais fondamentalement faux pour une monnaie qui peut diminuer (un achat). Un achat local suivi d'une fermeture/réouverture du jeu remontait le solde à son maximum historique, la figurine achetée restant acquise — exploit trivial et répétable à l'infini, signalé par Cyril en des termes vifs ("mon fils a acheté plus de 300 figurines en faisant seulement une demi-Odyssée").

**Décision** : `stars` n'est plus jamais fusionné ni assigné directement lors d'une synchronisation. Deux compteurs qui ne font QUE croître sont introduits : `_totalStarsEarned` (incrémenté à chaque gain réel — victoire de partie, bonus, correction parentale à la hausse) et `_totalStarsSpent` (incrémenté au point de dépense unique `spend()`, `07-game.js`, et par toute correction parentale à la baisse). `_mergeCloudProfiles()` (`12-cloud.js`) fusionne ces deux compteurs par un simple maximum (sûr, puisqu'ils ne redescendent jamais), puis calcule `out.stars = Math.max(0, out._totalStarsEarned - out._totalStarsSpent)`. Aucun code applicatif ne doit plus écrire `P.stars` directement lors d'une fusion ou d'une désérialisation.

**Alternatives rejetées** : horodater et rejouer chaque transaction individuelle (rejeté — complexité disproportionnée ; seul le solde final compte, pas la chronologie complète).

**Impact** : `05-profile.js` (`validateProfile()` : `_totalStarsEarned`/`_totalStarsSpent` whitelistés et clampés), `07-game.js` (`spend()`, points de crédit de gain), `12-cloud.js` (`_mergeCloudProfiles()`). v12.7.21. Tests : `tests/stars-only-on-win.test.js`, `tests/stars-ledger-cloud-merge.test.js`.

---

## ADR-119 — Migration rétroactive du ledger d'étoiles restreinte au seul chargement primaire du profil actif

**Contexte** : la migration ponctuelle qui initialise `_totalStarsEarned`/`_totalStarsSpent` pour un profil créé avant ADR-118 (`out._totalStarsEarned = Math.max(out._totalStarsEarned, out.stars)`) s'exécutait dans `validateProfile()` sans distinction de contexte d'appel. Or `validateProfile()` est aussi appelée sur des copies de profil "non primaires", potentiellement périmées : `parentRemoveFigurines()`, `_pushOtherProfileToCloud()`, `_importProfileFromServer()`. Une telle copie migrée à tort pouvait "légitimer" un solde déjà gonflé (lui-même hérité de l'ancien bug de fusion par maximum, ADR-118) comme nouveau plancher de `_totalStarsEarned`, qui se propageait ensuite à tous les appareils via la fusion (`maxN`, qui ne redescend jamais) — cause probable de l'inflation du solde observée (~1500 → plus de 7000⭐).

**Décision** : `validateProfile()` accepte un second paramètre d'options, `{allowStarsMigration:false}` passé systématiquement par tout appel qui n'est PAS le chargement primaire du profil actif sur son propre appareil (`loadProfile()`, `05-profile.js` — seul appel qui garde `allowStarsMigration` à sa valeur par défaut/`true`). La migration ne peut donc plus jamais s'exécuter sur une copie secondaire du profil.

**Alternatives rejetées** : supprimer entièrement la migration rétroactive après un délai de grâce (rejeté — un profil ancien jamais rechargé sur son appareil principal perdrait alors tout accès légitime à son solde existant).

**Impact** : `05-profile.js` (`validateProfile(opts)`), `10-figurines.js` (`parentRemoveFigurines`, `parentSetStars`), `12-cloud.js` (`_pushOtherProfileToCloud`, `_importProfileFromServer`, pull cloud). v12.7.21-v12.7.23.

---

## ADR-120 — Suppression de figurine par un parent : blocage réversible par horodatage, jamais permanent

**Contexte** : la fonctionnalité de modération parentale (retrait de figurine depuis la Vue Parent, rendue nécessaire par l'enquête sur les 300+ figurines achetées par erreur) devait empêcher qu'une figurine retirée ne réapparaisse silencieusement (rachat accidentel, fusion cloud avec un appareil resté sur l'ancien état, déblocage automatique de complétion de licence) — tout en restant réversible si l'enfant regagne légitimement la figurine plus tard (nouvel achat volontaire, par exemple).

**Décision** : `parentRemoveFigurines()` retire l'id de `ownedFigurines` et l'ajoute à un registre d'horodatages, `data.blockedFigurinesAt[id] = Date.now()` — pas un simple flag booléen ni une liste plate figée. `buyFigurine()` enregistre symétriquement `P.figAcquiredAt[id]` à chaque acquisition. `_mergeCloudProfiles()` (`12-cloud.js`) fusionne les deux registres par un maximum (`_mergeMaxTs`, sûrs à fusionner puisqu'eux aussi ne font qu'avancer), puis exclut de `ownedFigurines` toute figurine dont le blocage est plus récent que sa dernière acquisition (gardée seulement si `acquiredAt > blockedAt`). Un rachat légitime posté APRÈS le retrait l'emporte donc naturellement. `_checkLicenseCompletions()` refuse spécifiquement de réattribuer automatiquement une figurine de complétion retirée par un parent, ce déblocage étant automatique et non délibéré (contrairement à un achat ou un boss saisonnier).

**Alternatives rejetées** : une liste plate `blockedFigurines` sans horodatage (rejeté — rendrait tout retrait permanent et empêcherait un rachat légitime ultérieur).

**Impact** : `10-figurines.js` (`parentRemoveFigurines`, `buyFigurine`, `_checkLicenseCompletions`), `12-cloud.js` (`_mergeCloudProfiles`, `_mergeMaxTs`). v12.7.18-v12.7.19. Tests : `tests/parent-figurine-removal.test.js`.

---

## ADR-121 — Stade de héros : cliquet à sens unique par RANG, pas par simple inégalité

**Contexte** : signalé par Cyril, l'animation d'évolution de héros ("ÉVOLUTION ! APPRENTI...") réapparaissait en boucle après une synchronisation cloud. Cause : la fusion cloud sur `heroStageId` pouvait, selon l'ordre des synchronisations, retenir une lecture transitoirement basse d'un compteur tout juste introduit, faisant "reculer" le stade affiché après une fusion malheureuse.

**Décision** : une table de correspondance `_HERO_STAGE_RANK` (`{oeuf:0, apprenti:1, aventurier:2, maitre:3, legende:4}`) permet de comparer deux stades par RANG plutôt que par égalité de chaîne. `_mergeCloudProfiles()` ne retient le stade importé que si son rang est strictement supérieur à celui du stade local — cliquet à sens unique, le stade affiché ne peut plus jamais reculer après une fusion. En complément, `heroStageRewardsCredited` (liste des paliers déjà récompensés) est fusionné par union plutôt que par écrasement, pour qu'un palier déjà crédité sur un appareil ne puisse plus jamais être récompensé une seconde fois après fusion.

**Alternatives rejetées** : comparer directement les chaînes `heroStageId` (rejeté — aucune relation d'ordre fiable entre des identifiants textuels sans table de correspondance dédiée).

**Point de dette assumé, PARTIELLEMENT RÉGULARISÉ en v12.7.30** : `_HERO_STAGE_RANK` était dupliqué dans `12-cloud.js` plutôt que dérivé de la structure `HERO_STAGES` existante (`02-data.js`) — risque de désynchronisation si un stade était un jour ajouté/retiré/réordonné. Corrigé : `_stageRankOf(id)` dérive désormais le rang de l'index réel dans `HERO_STAGES` en priorité. Un correctif immédiat (même conversation) a révélé qu'une table de repli reste nécessaire : `tests/onboarding-and-hero-stage-persistence.test.js` charge `12-cloud.js` isolément (`loadGame(['12-cloud.js'])`, convention de test unitaire de ce projet), sans `HERO_STAGES` — `_HERO_STAGE_RANK_FALLBACK` (même 5 valeurs) n'est utilisé QUE dans ce cas, jamais en production où `02-data.js` précède toujours `12-cloud.js`. La duplication n'est donc pas totalement éliminée, mais son seul point de divergence possible (l'oubli de mettre à jour le repli en même temps que `HERO_STAGES`) n'affecte que les tests unitaires isolés, jamais le comportement réel en jeu.

**Impact** : `12-cloud.js` (`_mergeCloudProfiles`, `_stageRankOf` + `_HERO_STAGE_RANK_FALLBACK` remplacent `_HERO_STAGE_RANK`). v12.7.15, dette partiellement régularisée v12.7.30. Tests : `tests/hero-stage-one-way-ratchet.test.js`, `tests/onboarding-and-hero-stage-persistence.test.js` (491/491 confirmés verts après correctif).

---

## ADR-122 — Récap "Précédemment dans..." : réutilisation du Carnet existant plutôt que duplication ; fusion cloud proportionnée à un champ cosmétique

**Contexte** : Cyril a demandé une fenêtre de récap narratif au retour dans une Odyssée après 1 jour ou plus d'absence, pour que le joueur se remémore l'histoire générale et sache où il en est. Investigation préalable (avant toute proposition) : découverte que le jeu possédait déjà un Carnet d'aventure complet (`openAdventureLog()`, cliffhanger `P.lastTwistLineByAdv`, journal de voyage `P.journalEntriesByAdv`) — décision immédiate de construire la nouvelle fenêtre par-dessus/à côté de cette infrastructure plutôt que de la dupliquer (option validée par Cyril parmi 3 proposées : mini-fenêtre + bouton-pont vers le Carnet complet).

**Décision** : nouveau champ persistant `P.lastAdvVisitDayByAdv` (`{advKey: jour}`), comparé à `todayKey()` par égalité stricte uniquement. Contenu fusionné littérairement en un texte continu (pas d'encarts séparés, à la demande explicite de Cyril après une 1ère itération de maquette) par `_advRecapText()` (`07-story.js`). Déclenchement par `_maybeShowOdysseyRecap()`, inséré dans la chaîne de `setTimeout` déjà existante de `openMap()`, systématiquement AVANT `_maybeShowStory()` — jamais en parallèle, pour ne jamais superposer deux modales. Détection de progression volontairement indépendante de toute convention d'id de chapitre (`mapBossBeaten`/`zoneProgress`) après découverte que l'Odyssée `prim` utilise un id d'intro nu `'intro'`, contrairement aux 6 autres (`'{advKey}_intro'`) — un test basé sur cette convention aurait donc silencieusement échoué pour `prim` uniquement. **Nuance de fusion cloud introduite par cette décision** : ce nouveau champ étant purement cosmétique/UX (dans le pire des cas, un récap affiché une fois de trop ou de pas assez — coût trivial, aucun impact sur l'économie ni la progression), il reçoit une fusion simple par `Object.assign` (priorité au local par clé), sans la discipline stricte de dérivation par compteurs monotones réservée aux champs économiques (ADR-118) — à condition, désormais, de toujours justifier explicitement ce choix plutôt que de l'appliquer par oubli.

**Alternatives rejetées** : dupliquer le contenu du Carnet dans un nouvel écran indépendant (rejeté d'emblée — l'infrastructure existante couvrait déjà l'essentiel du besoin) ; ouvrir directement le Carnet complet sans mini-fenêtre de transition (rejeté par Cyril — moins de contrôle sur le contenu affiché en priorité).

**Impact** : `07-story.js` (`_ADV_RECAP`, `_advRecapConfig`, `_advRecapText`, `_recapToggleSpeak`, `_openOdysseyRecap`/`closeOdysseyRecap`, `_closeOdysseyRecapThenOpenLog`, `_maybeShowOdysseyRecap`), `07-map.js` (`openMap()`), `05-profile.js` (whitelist), `10-figurines.js` (`resetAdventure()`), `12-cloud.js` (`ODYSSEY_PROGRESS_FIELDS` + fusion), `styles.css` (`.recap-*`), `index.html` (cache-buster CSS `?v=1083`). v12.7.29. Tests : `tests/odyssey-recap.test.js` (+ extension de `tests/reset-adventure.test.js`).

---

## ADR-123 — Confirmation renforcée par retype de texte, générique (`showConfirm()`)

**Contexte** : dette technique héritée (v23) — "Reset Aventure" (7 Odyssées à la fois, irréversible) n'avait qu'une confirmation simple (`showConfirm()`), risque de clic accidentel ou mal compris. Maquette validée par Cyril avant code : retype du prénom exact du profil, bouton grisé tant que le texte ne correspond pas.

**Décision** : plutôt qu'un dialogue dédié à "Reset Aventure", `showConfirm()` (`01-core.js`) gagne un paramètre générique `opts.retypeValue` — quand fourni, un champ texte est inséré, le bouton de confirmation reste `disabled` (opacité réduite) jusqu'à correspondance exacte (`trim()`, sensible à la casse) entre la saisie et `retypeValue`, et le clic sur le bouton ok re-vérifie la correspondance par sécurité avant d'appeler `onConfirm()`. `resetAdventure()` (`10-figurines.js`) l'utilise avec `retypeValue:playerName` et `danger:true`. Réutilisable tel quel pour tout futur reset/action sensible (ex. "Reset Total") sans nouveau code.

**Alternatives rejetées** : un dialogue spécifique à "Reset Aventure" (rejeté — duplique le style/comportement de `showConfirm()` déjà partagé par toutes les confirmations du jeu, alors qu'un simple paramètre suffit).

**Impact** : `01-core.js` (`showConfirm()`), `10-figurines.js` (`resetAdventure()`). v12.7.32. Tests : `tests/reset-adventure-retype-confirm.test.js` (vérification au niveau source — le harnais de test n'a pas de DOM réel pour simuler la saisie, même limite déjà documentée pour `checkHeroStageProgress()`, ADR-121).

---

## ADR-124 — File d'attente de retry pour `_pushOtherProfileToCloud()`

**Contexte** : dette technique héritée (v23) — une correction parentale sur un profil non actif sur cet appareil (retrait de figurine, modification du solde d'étoiles) passe par `_pushOtherProfileToCloud()` (ADR-97/v12.7.22) pour propager immédiatement le changement au cloud. En cas d'échec réseau au moment précis de l'action, rien ne relançait l'envoi — la correction restait bloquée en local, potentiellement indéfiniment si le profil ciblé ne redevient jamais actif sur cet appareil.

**Décision** : petite file d'attente persistée en `localStorage` (`PENDING_OTHER_PUSH_KEY`, une simple liste de noms de profils — pas de payload dupliqué, la copie la plus fraîche est toujours relue depuis `localStorage` au moment de la relance). `_pushOtherProfileToCloud()` ajoute le nom à la file sur tout chemin d'échec (réponse HTTP non-ok, exception) et le retire sur succès. `_flushPendingOtherProfilePushes()` parcourt la file et retente chaque nom : ignore et nettoie silencieusement un profil supprimé ou dont le cloud a été désactivé entre-temps, retente sinon via `_pushOtherProfileToCloud()` (qui se recharge elle-même de la file en cas de nouvel échec). Branchée à 3 endroits, tous best-effort et non bloquants : le timer de sync existant (`scheduleCloudSync`, toutes les 5 min), le retour en ligne (`_onOnline`), et le chargement (`initCloudSync`, 4s après boot) — ces deux derniers indépendamment de `P.cloudEnabled`, puisque la file peut concerner un profil différent de celui actif sur l'appareil.

**Alternatives rejetées** : file d'attente avec payload complet dupliqué à chaque échec (rejeté — complexité et risque de rejouer une version périmée du profil ; relire `localStorage` au moment de la relance est plus sûr et plus simple) ; retry avec backoff exponentiel dédié (rejeté — le timer de sync existant (5 min) suffit largement pour une action de modération parentale, pas de contrainte de latence forte).

**Impact** : `12-cloud.js` (`PENDING_OTHER_PUSH_KEY`, `_getPendingOtherPushes`, `_setPendingOtherPushes`, `_addPendingOtherPush`, `_removePendingOtherPush`, `_flushPendingOtherProfilePushes`, `_pushOtherProfileToCloud`, `scheduleCloudSync`, `_onOnline`, `initCloudSync`). v12.7.33. Tests : `tests/pending-other-profile-push-retry.test.js`.

---

## ADR-125 — Notification de nouveau contenu : marquage "vu" post-affichage + points d'accroche supplémentaires

**Contexte** : suite à l'ajout des 22 figurines exclusives (v12.7.34), Cyril a constaté que la notif "nouveau contenu" (ADR-115) ne s'était jamais réellement affichée à l'écran malgré une entrée `_CONTENT_UPDATES` valide. Cause : `_maybeShowContentUpdate()` marquait `P.contentUpdatesSeen` AVANT même de tenter l'affichage — toute défaillance silencieuse de `_showStoryModal()` (absente, erreur) consommait la notif sans jamais la montrer, sans retry possible. Cyril a aussi demandé d'élargir les points de déclenchement, jusqu'ici limités au clic sur CONTINUER de l'écran d'accueil (`gotoSubjects()`), à deux moments naturels supplémentaires : l'ouverture d'une matière et la création d'une nouvelle Odyssée.

**Décision** : (1) `_maybeShowContentUpdate()` (03-figurines-data.js) ne pousse plus l'id dans `P.contentUpdatesSeen` qu'immédiatement avant l'appel réel à `_showStoryModal()` — si celle-ci est absente, la fonction ressort sans rien marquer, permettant un nouvel essai au prochain point d'accroche plutôt que de perdre l'annonce. (2) Nouveaux points d'accroche, même pattern "garde puis continue" que l'existant : `chooseSubject()` (01-core.js, ouverture d'une matière math/fr/hist) et `startAdventure()` (07-map.js, création d'une nouvelle Odyssée) — mais PAS quand `startAdventure` est appelée avec `skipMapOpen:true` (cas `continueAdventure()`, simple reprise d'une Odyssée déjà en cours, pas un vrai nouveau point d'entrée).

**Alternatives rejetées** : détecter une "réussite d'affichage" via un callback de rendu DOM de `_showStoryModal()` (rejeté — sur-ingénierie ; la seule vraie faille observée était l'absence pure et simple de la fonction, couverte par le `typeof` déjà en place).

**Impact** : `03-figurines-data.js` (`_maybeShowContentUpdate`), `01-core.js` (`chooseSubject`, nouvelle `_chooseSubjectProceed`), `07-map.js` (`startAdventure`). v12.7.36.

---

## ADR-126 — Figurines completionLock : de l'auto-don gratuit à l'achat gated par complétion

**Contexte** : depuis ADR-116 (v12.7.11-12), une figurine `completionLock:true` était offerte AUTOMATIQUEMENT et GRATUITEMENT (`p:0`) dès que le reste de la collection de sa licence était réuni. Cyril a demandé un changement de fond : ces figurines doivent rester à débloquer par la complétion de la licence, mais devenir ACHETABLES (avec des étoiles) plutôt qu'offertes — la complétion ouvre le droit d'achat, elle ne donne plus la figurine elle-même. Décision explicite prise avec Cyril sur deux points : (1) rétroactivité — les joueurs ayant déjà reçu une de ces figurines gratuitement se la voient retirer (rachetable normalement ensuite), plutôt que de la conserver en exception ; (2) prix — un prix fixe unique de 500⭐ pour les 34 figurines concernées, plutôt qu'un prix au cas par cas.

**Décision** : 
- Toutes les figurines `completionLock:true` (34 au total) passent de `p:0` à `p:500` dans `03-figurines-data.js`. Les textes `unlockHint` sont reformulés ("Débloqué en réunissant..." → "Achetable en réunissant...") pour refléter le nouveau sens.
- `_checkLicenseCompletions()` (10-figurines.js, auto-don) est remplacée par `_isLicenseCompletionUnlocked(fig)`, une fonction de lecture pure (aucun effet de bord) qui répond juste "cette figurine est-elle éligible à l'achat ?" — même logique d'exclusion des autres figurines `completionLock` de la même licence qu'avant (évite le blocage circulaire type Goldorak/Dragon Ball).
- `buyFigurine()` consulte `_isLicenseCompletionUnlocked()` et refuse l'achat (toast avec l'`unlockHint`, aucune étoile dépensée) tant que la licence de base n'est pas complète ; une fois complète, l'achat se déroule normalement (dépense d'étoiles incluse) — même parcours qu'une figurine ordinaire.
- Boutique (`_renderFigurinesShop()`) : bouton d'achat (prix affiché) au lieu du message verrouillé, dès que `_isLicenseCompletionUnlocked()` répond vrai.
- L'appel résiduel à l'ancien mécanisme dans `unlockSeasonalFigurine()` (06c-seasonal.js) est retiré (plus rien à vérifier après un gain saisonnier, puisqu'il n'y a plus d'auto-don).
- **Migration rétroactive** : nouvelle étape `_MIGRATIONS[9]` (05-profile.js, `SAVE_VERSION` 8→9) — retire de `P.ownedFigurines` toute figurine `completionLock` déjà présente, pour tout profil chargé avec `_v<9`. Appliquée par `migrateProfile()`, déjà invoquée à tous les points d'entrée existants (chargement local ET tous les pulls cloud dans `12-cloud.js`) — aucun nouveau point d'accroche nécessaire. Idempotente (ne fait rien si déjà migré) et sûre pour la fusion cloud : les deux côtés (local et importé) passent par la même migration avant l'union `ownedFigurines`, donc aucun risque qu'un appareil non encore migré réinjecte la figurine retirée.

**Alternatives rejetées** : conserver gratuitement les figurines déjà données et n'appliquer le changement qu'aux futures complétions (rejeté par Cyril — préfère la cohérence globale, quitte à retirer l'existant) ; prix variable par figurine (rejeté par Cyril — simplicité d'un prix fixe unique).

**Impact** : `03-figurines-data.js` (34 figurines `p:0→500`, textes `unlockHint`), `10-figurines.js` (`_checkLicenseCompletions` → `_isLicenseCompletionUnlocked`, `buyFigurine()`, rendu boutique), `06c-seasonal.js` (`unlockSeasonalFigurine()`), `05-profile.js` (`SAVE_VERSION` 9, `_MIGRATIONS[9]`). v12.7.37. Tests : `tests/new-licenses-and-content-update.test.js` (bloc `_checkLicenseCompletions()` entièrement réécrit en `_isLicenseCompletionUnlocked()`/`buyFigurine()`, + nouveau bloc migration V9).

---

## ADR-127 — Figurines de franchises sous droits tiers : risque IP accepté consciemment pour l'usage privé actuel

**Contexte** : l'audit technique AUD-01 (2026-09-21) a identifié un risque de propriété intellectuelle : 461 figurines à collectionner, dont plus de 300 sont des personnages directement issus de franchises sous droits (Dragon Ball 45, Marvel 33, DC Comics 28, Pokémon 27, Star Wars 23, Harry Potter 17, Mario Bros 11, Astérix, Tintin, Goldorak, etc. — comptage exact par le champ `uni` dans `03-figurines-data.js`). Ce risque avait déjà été signalé dans l'audit précédent (constat n°8, ~420 figurines à l'époque) ; il s'est objectivement aggravé depuis (deux licences entières nouvelles : DC Comics, Goldorak).

**Décision** : Cyril confirme que l'usage de l'app reste strictement privé/familial (pas de diffusion publique, pas de store, pas de monétisation) à la date de cet ADR. Le risque juridique pratique (contrefaçon droit d'auteur/marques) est donc jugé faible dans ces conditions et consciemment accepté tel quel — aucune action de remplacement des figurines n'est engagée maintenant.

**Condition de réouverture explicite** : ce point doit être reconsidéré AVANT toute évolution vers une diffusion plus large (publication sur un store, partage d'un lien public à grande échelle, monétisation). Si une telle évolution est envisagée un jour, le jeu dispose déjà d'un précédent de création de personnages originaux (monstres/boss/héros des Odyssées) — le même travail créatif serait la voie de remplacement à privilégier plutôt qu'un retrait pur et simple des franchises tierces.

**Alternatives rejetées** : aucune action de remplacement immédiate (rejetée à ce stade — coût de recréation de ~300 figurines disproportionné pour un risque jugé faible en usage privé) ; retrait partiel ciblé sur les licences les plus emblématiques (non retenu, incohérent tant que l'usage reste privé pour l'ensemble).

**Impact** : aucun changement de code. Décision de gouvernance/produit à ré-évaluer si le contexte de diffusion change. Constat AUD-01-014 (audit technique) clos par cette décision.

---

## ADR-128 — CSP `unsafe-inline` : réduction reportée, pas engagée maintenant

**Contexte** : l'audit technique AUD-01 (constat AUD-01-005) a relevé que `script-src 'self' 'unsafe-inline'` (CSP, `index.html`) neutralise l'essentiel de la protection anti-XSS visée par la CSP elle-même, à cause de l'usage massif d'attributs `onclick=`/`onkeydown=` inline générés en HTML à travers tout `js/` (des centaines d'occurrences). Retirer `unsafe-inline` exigerait de migrer tous ces gestionnaires vers `addEventListener`, fichier par fichier — un refactor transversal à forte surface de régression (tout élément cliquable du jeu), sans commune mesure avec les autres correctifs ponctuels de ce cycle d'audit.

**Décision** : Cyril choisit de ne pas attaquer ce chantier maintenant. Le risque XSS réel est jugé faible en l'état : pas d'input utilisateur libre injecté en HTML ailleurs que la messagerie enfant-à-enfant, déjà échappée (`esc()`) des deux côtés (client `js/17-messaging.js` et Worker `worker/odyssee-chat.js`, vérifié lors de ce même audit).

**Alternatives rejetées** : correctif partiel (migrer seulement quelques fichiers) — rejeté, `unsafe-inline` reste nécessaire tant qu'UN SEUL gestionnaire inline subsiste ailleurs, donc un partiel n'apporte aucun gain de sécurité réel tout en fragmentant le code.

**Impact** : aucun changement de code. Si ce chantier est repris un jour, prévoir un projet dédié avec son propre plan module par module (pas un lot ponctuel) — voir `Audit_technique_Odyssee_des_Chiffres_2026-09-21.md`, section AUD-01-005, pour le détail technique.

---

## ADR-129 — Lot 0.1 (audit fonctionnel AUD-02) : `nextTurn()` ne régénère plus le combat en cours après une erreur

**Contexte** : l'audit fonctionnel AUD-02 (2026-09-21) a identifié deux bugs CRITIQUES de même cause racine dans `nextTurn()` (`07-game.js`). `hitPlayer()` rappelle `nextTurn()` après toute mauvaise réponse, dans la seule intention d'afficher la question suivante — mais `nextTurn()` réexécutait systématiquement l'intégralité de la mise en place d'un combat : PV du monstre remis à `monsterMaxHP`, `bossEnraged`/`bossShieldActive`/`bossShieldHits`/`bossFury` réinitialisés (AUD-02-007, touche tout monstre à PV multiples — boss ou non, dès CE1 où `HP_LVL>1`), et recalcul du compteur de questions. En mode classique (hors carte), la vérification de fin de partie (`GS.qCount>=_qTarget`) était évaluée AVANT toute vérification des PV du monstre : une erreur sur la question du boss déclenchait donc directement `endGame(true)` — une victoire — sans que le boss ait jamais atteint 0 PV (AUD-02-008).

**Décision** : un nouveau champ d'état `GS._turnSetupDone` (initialisé à `false` par `resetGS()`, `01-core.js`) distingue désormais une VRAIE nouvelle rencontre (mise en place jamais faite pour ce combat) d'une simple continuation du même combat après une erreur. En tête de `nextTurn()` (`07-game.js`), avant toute autre logique : si `GS._turnSetupDone && GS.monsterHP>0`, on se contente de générer la question suivante et de l'afficher — exactement le même chemin que celui déjà emprunté par une bonne réponse qui ne tue pas le monstre (`validate()`). Ce court-circuit étant placé AVANT la vérification de fin de partie, AUD-02-008 est fermé par construction : cette vérification ne peut plus jamais être atteinte tant qu'un monstre (boss ou non) a des PV restants. `GS._turnSetupDone=true` est posé à la fin du bloc de mise en place réelle, pour tout monstre — le correctif couvre donc un périmètre plus large que le seul combat de boss identifié par l'audit (tout monstre à PV multiples, CE1 à 3E).

**Alternatives rejetées** : plafonner/limiter la régénération plutôt que l'éliminer (rejeté — la régénération n'a jamais été une mécanique de jeu voulue, seulement un effet de bord de la structure de `nextTurn()` ; aucune trace d'intention produit en ce sens) ; distinguer les deux cas via `GS.monsterHP` seul sans nouveau champ d'état (rejeté — `resetGS()` initialise `monsterHP` à `1`, valeur indiscernable d'un « vrai » monstre à 1 PV en cours de combat, ce qui aurait fait sauter la mise en place initiale d'un combat de boss sur la carte : `startMapStep()` (`07-map.js`) positionne `GS.isBoss` avant d'appeler `nextTurn()`, donc le seul couple `isBoss`+`monsterHP>0` était également ambigu au tout premier appel).

**Impact** : `01-core.js` (`GS`, `resetGS()` : ajout de `_turnSetupDone`), `07-game.js` (`nextTurn()`). v12.7.43. Tests : `tests/boss-fight-continuation-no-reset.test.js` (assertions source sur la position du garde-fou + reproduction fidèle de la logique de décision sur les scénarios exacts du signalement, même limite de harnais déjà documentée pour `validate()`/formule de PV du boss — `nextTurn()` a trop d'effets de bord navigateur, `performance.now()` et canvas de confettis, pour être exécutée bout-en-bout dans ce harnais). 554/554 tests verts. Constats AUD-02-007 et AUD-02-008 (audit fonctionnel) clos par ce lot.

---

## ADR-130 — Lot 0.2 (audit fonctionnel AUD-02) : blocage de matières réellement appliqué + question secrète obligatoire pour la récupération du code parent

**Contexte** : l'audit fonctionnel AUD-02 a identifié deux constats CRITIQUES indépendants dans l'espace parent. (1) AUD-02-027 : `saveBlockedSubjects()` (`09-parent.js`) écrivait `P.blockedSubjects`/`localStorage`, mais aucun point du moteur de jeu ne relisait ce champ — un enfant pouvait jouer normalement dans une matière que son parent avait cochée comme interdite, sans aucun message, alors que l'UI (confirmation sonore, message vert, guide pas-à-pas) laissait croire à une protection active. (2) AUD-02-028 : le parcours « Code parent oublié ? » (`recoverParentPin()`) révélait le code par défaut `1234` en clair, sans aucune vérification d'identité, dès lors qu'aucune question secrète n'avait été configurée — cas par défaut de tout foyer n'ayant jamais visité les réglages avancés, annulant de fait toute la protection parentale. (3) AUD-02-029, même fonction : la vérification de la question secrète, quand elle existait, n'était soumise à aucun verrou anti-brute-force, contrairement au code PIN principal (`checkPin()`).

**Décision** :
- `chooseSubject()` (`01-core.js`), seul point d'entrée d'une matière depuis l'écran « Choisis ta matière », consulte désormais `P.blockedSubjects` et refuse l'accès (toast adapté à l'âge, aucun changement de `GM.subject`) avant même de proposer la matière — plutôt que de dupliquer la vérification dans chaque module de contenu (maths/français/histoire), qui partagent tous ce même point d'entrée.
- `savePin()` (`09-parent.js`) rend désormais la question secrète et sa réponse OBLIGATOIRES pour enregistrer un nouveau code parent personnalisé — refus explicite avec message si l'une des deux manque. C'est l'option validée par Cyril parmi 3 proposées (obligatoire / blocage sans alternative / vérification par email parent) : simple, cohérente avec l'existant, ne collecte aucune nouvelle donnée personnelle.
- `recoverParentPin()` (`09-parent.js`) distingue maintenant 3 cas avant toute question : (a) verrou anti-brute-force actif → refus immédiat ; (b) aucun code n'a jamais été personnalisé (`localStorage.parentPin` absent) → le rappel du code par défaut `1234` reste affiché, car un enfant peut de toute façon l'obtenir en le tapant directement à l'écran de verrouillage (`checkStoredPin()` l'accepte tant qu'aucun code n'est stocké) — le révéler ici n'ouvre donc aucune protection supplémentaire ; (c) un code personnalisé existe mais aucune question secrète n'a été configurée (compte créé avant ce correctif) → AUCUNE récupération automatique, message honnête invitant à configurer une question dès que possible, sans jamais révéler le code réel. Quand une question secrète existe, sa vérification partage désormais le MÊME compteur de tentatives et le même verrou 30s que `checkPin()` (`getPinAttempts`/`setPinAttempts`/`getPinLockUntil`/`setPinLockUntil`) — une stratégie combinant essais sur le PIN et sur la question secrète ne permet donc plus de contourner la limite globale.

**Alternatives rejetées** : pour AUD-02-028, bloquer purement et simplement la récupération sans question secrète configurée (rejeté par Cyril — aucun canal de support n'existe dans l'app, un parent resterait bloqué hors de son propre espace sans recours) ; vérification par email parent (rejeté — nouvelle donnée personnelle à collecter et Worker dédié à écrire, effort disproportionné pour ce lot d'urgence). Pour AUD-02-027, dupliquer la vérification dans chaque module de matière plutôt qu'au point d'entrée commun (rejeté — `chooseSubject()` est déjà le point de passage obligé documenté comme tel dans la checklist d'ajout de matière, `01-core.js` lignes 1451-1473).

**Impact** : `01-core.js` (`chooseSubject()`), `09-parent.js` (`savePin()`, `recoverParentPin()`), `index.html` (libellé « obligatoire » sur le champ question secrète). v12.7.44. Tests : `tests/blocked-subjects-enforced.test.js`, `tests/parent-pin-recovery-hardening.test.js` (branches sans appel à `prompt()`/`showAlert()`, non stubbés dans le harnais — même limite documentée qu'ADR-129 ; les branches interactives restent à vérifier manuellement, voir checklist de livraison). 565/565 tests verts. Constats AUD-02-027, AUD-02-028 et AUD-02-029 (audit fonctionnel) clos par ce lot.

**Limite connue non traitée par ce lot** : un foyer ayant déjà personnalisé son code parent AVANT ce correctif, sans avoir configuré de question secrète, perd tout recours de récupération automatique (cas (c) ci-dessus) — seul un effacement complet des données de l'application (et donc de tous les profils) permet de repartir sur le code par défaut. Aucune migration automatique n'est possible (aucune information ne permet de deviner une question secrète a posteriori) ; la seule action possible est d'inviter ces foyers à configurer une question secrète dès leur prochaine connexion à l'espace parent.

---

## ADR-131 — Lot 0.3 (audit fonctionnel AUD-02) : les figurines saisonnières/anniversaire ne sont plus achetables en boutique

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-035, CRITIQUE) a identifié que les 21 figurines saisonnières/anniversaire (`uk:'sx'`, `03-figurines-data.js`, commentaire d'origine « Non-achetables (p:0) — uniquement obtenues en battant le boss correspondant ») n'ont pas de flag `completionLock`. `renderFigurinesShop()` (`10-figurines.js`) n'affichait le message « verrouillé » que pour les figurines `completionLock` ; toute autre figurine — y compris celles à `p:0` — retombait dans la branche générique et affichait un bouton d'achat cliquable à « 0 ⭐ ». `buyFigurine()` ne vérifiait de son côté que la règle `completionLock` ; `spend(0, cb)` réussit toujours (`(P.stars||0)<0` est faux). N'importe quel enfant pouvait donc obtenir gratuitement, en un clic depuis le filtre « ✨ Saisonnier », n'importe laquelle de ces figurines — y compris les 5 gâteaux d'anniversaire nominatifs (`sx_anniv_soren/peyo/tomi/papa/maman`) sans porter le prénom concerné — des mois avant la date réelle de l'évènement, sans jamais affronter le boss correspondant.

**Décision** : une figurine est désormais non-achetable en boutique si elle n'a PAS de `completionLock` ET que son prix n'est pas strictement positif (`!fig.completionLock && !(fig.p>0)`), sur le même principe que la garde déjà existante pour `completionLock` (défense en profondeur à deux niveaux, comme le faisait déjà cette dernière) :
- `renderFigurinesShop()` affiche pour ces figurines le même style de message que pour une figurine verrouillée (« 🏆 À gagner en battant son boss »), sans bouton d'achat.
- `buyFigurine()` refuse explicitement l'achat (toast dédié) si cette condition est vraie, même si un bouton était resté affiché par erreur sur un rendu boutique périmé — même logique de défense que la garde `completionLock` déjà en place.
- Seul `unlockSeasonalFigurine()` (`06c-seasonal.js`, appelé après la victoire du boss saisonnier du jour) reste capable d'attribuer ces figurines — comportement inchangé.

**Alternatives rejetées** : ajouter un flag `completionLock:true` factice sur ces figurines pour réutiliser telle quelle la garde existante (rejeté — `completionLock` porte une sémantique précise, « débloquée par complétion du reste de la licence », sans rapport avec le mécanisme saisonnier ; l'utiliser à mauvais escient aurait été trompeur et aurait fait apparaître un texte `unlockHint` de complétion incohérent) ; masquer entièrement ces figurines de la boutique plutôt que de les afficher en « verrouillé » (rejeté — l'enfant doit pouvoir les voir dans son catalogue de collection pour savoir ce qu'il lui reste à obtenir, seul le bouton d'achat doit disparaître).

**Impact** : `10-figurines.js` (`renderFigurinesShop()`, `buyFigurine()`). v12.7.45. Tests : `tests/seasonal-figurines-not-purchasable.test.js` (refus d'achat, non-régression sur les figurines normales et sur le déblocage par complétion de licence ADR-126, rendu boutique sans bouton). 573/573 tests verts. Constat AUD-02-035 (audit fonctionnel) clos par ce lot — referme aussi, en pratique, la contradiction notée par l'audit avec ADR-126 (les figurines de complétion sont payantes par décision produit délibérée ; ce même principe d'exclusivité gagnée ne doit pas pouvoir être contourné par un autre mécanisme à prix nul).

---

## ADR-132 — Lot 1.1 (audit fonctionnel AUD-02, Phase 1) : la durée d'un événement décompte aussi sur les mauvaises réponses

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-009) a identifié que `GS.eventLeft` (durée restante d'un événement aléatoire, ex. « Monstre Enragé » réduisant le minuteur) ne se décrémentait que dans la branche « bonne réponse » de `validate()` (`07-game.js`). Un enfant qui enchaînait des mauvaises réponses pendant un tel événement le subissait indéfiniment, jusqu'à ce qu'il parvienne enfin à réussir suffisamment de questions — l'inverse de l'intention pédagogique du produit, qui exclut déjà explicitement cet événement du Mode Serein (ADR-38) pour ne pas ajouter de pression aux enfants en difficulté.

**Décision** : la même décrémentation (`if(GS.activeEvent){GS.eventLeft--;if(GS.eventLeft<=0)GS.activeEvent=null;}`) est désormais posée aussi en tête de la branche « mauvaise réponse » de `validate()`. Un événement à durée 2 se termine donc après 2 questions jouées, quel que soit leur résultat — comme son texte d'annonce le laisse d'ailleurs déjà entendre (« pendant 2 questions »).

**Alternatives rejetées** : ne décrémenter que sur les erreurs consécutives à un certain seuil (rejeté — sur-ingénierie pour un correctif dont le besoin réel est juste « chaque question compte », qu'elle soit juste ou fausse) ; suspendre l'effet de l'événement après une erreur plutôt que de le clore (rejeté — changerait le sens même de l'événement, non demandé par l'audit).

**Impact** : `07-game.js` (`validate()`, branche mauvaise réponse). v12.7.46. Tests : `tests/event-duration-counts-wrong-answers.test.js`. 578/578 tests verts. Constat AUD-02-009 (audit fonctionnel) clos par ce lot.

---

## ADR-133 — Lot 1.2 (audit fonctionnel AUD-02, Phase 1) : sélecteurs d'enfant synchronisés + alerte messagerie persistante dans le résumé hebdo

**Contexte** : deux constats indépendants de l'espace parent (`09-parent.js`), tous deux liés à un défaut de cohérence entre onglets/périodes plutôt qu'à une donnée mal calculée. (1) AUD-02-030 : les 6 sélecteurs d'enfant de l'espace parent (Suivi, Devoir, Mode serein, Horaires, Filtres, Matières autorisées) sont chacun peuplés indépendamment depuis le même roster (`openParent()`, `_refreshAllParentPlayerSelects()`) mais jamais synchronisés entre eux — changer d'enfant dans un onglet n'avait aucune influence sur les autres, qui restaient sur le premier enfant du roster par défaut. Dans un foyer multi-enfants, un parent pressé pouvait ainsi donner un devoir, bloquer une matière ou modifier des horaires pour un AUTRE enfant que celui qu'il venait de consulter, sans aucun signal. (2) AUD-02-046 : la section messagerie du résumé hebdomadaire (`renderWeeklySummary()`) n'était rendue que si la messagerie était activée au moment de la CONSULTATION (`chatIsEnabledByName`), pas si elle l'était pendant la semaine affichée — un parent qui suspend la messagerie après un incident de mots bloqués perd, en consultant le résumé plus tard, la trace même de l'incident qui a motivé sa décision.

**Décision** :
- Nouvelle fonction `_onParentPlayerSelectChange(name)` (`09-parent.js`), branchée sur l'`onchange` des 6 sélecteurs (`index.html`, remplace leur ancien `onchange` individuel) : propage la valeur choisie aux 6 sélecteurs, puis relance immédiatement le même bloc de rechargement que `ptab('encadrement')` (Devoir, Mode serein, Horaires, Filtres, Matières) plus `renderReport()`/`renderReportView()` pour l'onglet Suivi — le panneau actuellement visible reflète donc tout de suite le bon enfant, pas seulement au prochain changement d'onglet. Aucune vérification de la liste d'options du `<select>` cible n'est nécessaire : les 6 sélecteurs sont toujours peuplés depuis le même roster, une valeur choisie dans l'un est donc garantie présente dans tous les autres.
- La section messagerie de `renderWeeklySummary()` s'affiche désormais si la messagerie est active MAINTENANT **ou** s'il existe des données de mots bloqués pour LA SEMAINE consultée (`chatFlagsThis.length>0`), indépendamment de l'état d'activation actuel.

**Alternatives rejetées** : pour AUD-02-030, un unique sélecteur d'enfant global en haut de l'espace parent plutôt que 6 sélecteurs synchronisés (rejeté — refonte de navigation plus large que ce que demande le constat, chaque onglet garde son ancre visuelle propre) ; pour AUD-02-046, afficher systématiquement la section messagerie même sans aucune donnée pertinente (rejeté — reproduirait le bruit déjà critiqué ailleurs dans l'audit, la section reste masquée si ni l'état courant ni l'historique de la semaine ne la justifient).

**Impact** : `09-parent.js` (`_onParentPlayerSelectChange()`, `renderWeeklySummary()`), `index.html` (6 attributs `onchange`). v12.7.47. Tests : `tests/parent-player-selectors-synced.test.js`, `tests/weekly-summary-chat-alert-persists.test.js`. 584/584 tests verts (`scripts/gen-test-api.mjs` relancé pour exposer la nouvelle fonction au harnais de test, comme documenté par le script lui-même). Constats AUD-02-030 et AUD-02-046 (audit fonctionnel) clos par ce lot.

---

## ADR-134 — Lot 1.3 (audit fonctionnel AUD-02, Phase 1) : import de profil migré/validé, avec comparaison avant écrasement

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-020, Élevée) a identifié que `importProfileFile()` (`09-parent.js`) écrivait le contenu brut d'un fichier importé directement en `localStorage`, sans jamais appeler `migrateProfile()`/`validateProfile()` — contrairement à `restoreProfileByCode()`/`forceRestoreFromCloud()` (`12-cloud.js`), qui migrent et valident systématiquement tout profil entrant. Un fichier corrompu, tronqué, ou issu d'une très ancienne version traversait donc la validation sans être neutralisé, avec un risque de plantage d'écran ultérieur sur des champs non bornés (ex. `quests`, cf. AUD-02-021, à traiter séparément). De plus, la confirmation d'import n'affichait que le contenu du FICHIER, jamais l'état du profil déjà présent sur l'appareil qui allait être écrasé — un parent pouvait ainsi perdre irréversiblement une progression récente sans en avoir conscience au moment de confirmer.

**Décision** : chaque profil du fichier importé est désormais passé par `migrateProfile()` puis `validateProfile(profil, nom, {allowStarsMigration:false})` — même discipline et mêmes options que les autres points d'entrée non-primaires déjà en place (`12-cloud.js`, conformément à ADR-119) — avant même d'être inclus dans le résumé de confirmation. La modale de confirmation affiche en plus, pour chaque profil qui existe déjà sur l'appareil, une ligne dédiée (« ⚠️ Remplace le profil actuel sur cet appareil : X⭐, Y figurines, Z parties gagnées ») construite à partir du profil réellement stocké, pour que le parent voie ce qu'il perd avant de confirmer.

**Alternatives rejetées** : bloquer purement et simplement l'import d'un fichier dont un profil échoue la migration/validation, pour l'ensemble du fichier (rejeté — un fichier multi-profils valide dans son ensemble ne doit pas être rejeté en bloc à cause d'un seul profil corrompu ; le profil fautif est simplement ignoré, comme le fait déjà `isValidPlayerData()` pour les cas grossièrement invalides) ; fusionner le profil importé avec l'existant plutôt qu'un écrasement complet (rejeté — hors périmètre de ce constat, qui porte sur la validation et la transparence de l'écrasement, pas sur son remplacement par une fusion ; une vraie fusion partagerait les mêmes risques déjà documentés pour la fusion cloud, AUD-02-023).

**Impact** : `09-parent.js` (`importProfileFile()`). v12.7.48. Tests : `tests/profile-import-migrates-and-compares.test.js` (migration/validation effective, comparaison avant écrasement, fichier corrompu rejeté proprement). `tests/helpers/loadGame.js` reçoit un stub minimal `FileReader` (synchrone, lit `file.__content`), ajout purement additif sans impact sur les 89 autres fichiers de test ; `tests/setup.js` (`ALLOWED_ERRORS`) reçoit une entrée pour le log applicatif intentionnel `[import] erreur :`, exercé volontairement par le test du fichier corrompu. 589/589 tests verts. Constat AUD-02-020 (audit fonctionnel) clos par ce lot.

---

## ADR-135 — Lot 1.4 (audit fonctionnel AUD-02, Phase 1) : synchronisation cloud transparente — alerte d'échec + résumé de fusion

**Contexte** : l'audit fonctionnel AUD-02 a identifié deux défauts de transparence de la synchronisation cloud (`12-cloud.js`), tous deux réels mais SANS remettre en cause la robustesse du mécanisme de fusion lui-même (union/maximum plutôt qu'écrasement, cf. points forts de l'audit). (1) AUD-02-024 : un échec de `pushProfileToCloud()` ne produisait ni toast ni alerte visible — seuls `console.warn()` et `_cloudLastError` (jamais affiché nulle part dans l'UI) en gardaient la trace. Un parent pouvait croire la sauvegarde active pendant des semaines alors qu'elle échouait silencieusement à chaque tentative (toutes les `CLOUD_SYNC_INTERVAL_MS`, 5 min). (2) AUD-02-023 : en cas de fusion réussie (conflit ou synchronisation de routine), rien n'indiquait au parent CE QUI avait changé — seul un toast fugace de 3s apparaissait dans le cas spécifique d'un conflit détecté côté serveur, jamais pour une synchronisation de routine qui modifie pourtant `P` de la même façon.

**Décision** :
- Un compteur `_cloudFailStreak` (échecs consécutifs) est incrémenté à chaque échec de `pushProfileToCloud()` (HTTP non-ok ou exception), remis à zéro à chaque succès. Au 3e échec consécutif (~15 min de panne persistante à l'intervalle normal — seuil choisi pour ignorer un simple aléa réseau isolé), un toast unique (`_cloudFailAlerted` évite la répétition à chaque tentative suivante) avertit le parent, et l'indicateur permanent (`refreshCloudIndicator()`, déjà affiché sous la carte joueur) remplace l'heure de dernière synchro — potentiellement ancienne et silencieusement plus à jour — par un message d'erreur explicite.
- `_importProfileFromServer()` — seul point où le résultat d'une fusion est réellement appliqué au profil actif — capture désormais, juste avant d'écraser `P`, un résumé en clair (`_summarizeCloudMerge()`) limité aux quelques champs qu'un parent reconnaît : étoiles (dérivées du ledger `_totalStarsEarned`/`_totalStarsSpent`, ADR-118, pas du champ brut potentiellement non pertinent), figurines nouvellement reçues, stade de héros, position sur la carte. Ce résumé est exposé via `getCloudStatus().lastMergeSummary` et affiché dans le panneau Cloud de l'espace parent (`renderCloudPanel()`, 09-parent.js), sous la ligne « Dernière sync ».

**Alternatives rejetées** : instrumenter `_mergeCloudProfiles()` elle-même pour tracer chaque champ modifié parmi sa trentaine de règles (rejeté — fonction déjà dense et sensible, un tel changement invasif aurait été disproportionné par rapport au besoin réel du parent, qui ne reconnaît de toute façon que quelques champs ; on compare avant/après au niveau du seul point d'application à `P`, sans toucher à la logique de fusion elle-même) ; alerter dès le 1er échec de synchronisation (rejeté — un aléa réseau isolé est normal et ne doit pas générer une fausse alerte à chaque coupure Wi-Fi momentanée) ; journal technique exhaustif façon `getSyncDiag()` affiché par défaut (rejeté — déjà disponible séparément pour qui en a besoin, le résumé du parent doit rester lisible en une ligne par changement).

**Impact** : `12-cloud.js` (`_cloudFailStreak`, `_cloudFailAlerted`, `_cloudSyncFailed()`, `_cloudLastMergeSummary`, `_summarizeCloudMerge()`, `pushProfileToCloud()`, `_importProfileFromServer()`, `refreshCloudIndicator()`, `getCloudStatus()`), `09-parent.js` (`renderCloudPanel()`). v12.7.49. Tests : `tests/cloud-sync-failure-and-merge-transparency.test.js`. 596/596 tests verts. Constats AUD-02-023 et AUD-02-024 (audit fonctionnel) clos par ce lot.

---

## ADR-136 — Lot 1.5 (audit fonctionnel AUD-02, Phase 1) : les resets « irréversibles » purgent aussi les données orphelines

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-025, Élevée) a identifié que `resetProfile()` (`10-figurines.js`) et `_resetAllConfirm()` (`09-parent.js`) — toutes deux qualifiées d'« action irréversible » dans leur texte de confirmation — n'effaçaient en réalité que `localStorage['user_'+nom]`. Trois autres structures restaient orphelines sous le même prénom : l'anniversaire (`birthdays`, `02-data.js`), l'historique de messagerie (`chatProfiles`, `17-messaging.js`) et les horaires autorisés (`block_'+nom`, `06b-time-block.js`) — ce alors que `renameProfile()` (même fichier, plus haut) migre déjà `user_`/`block_` ensemble lors d'un renommage, signe que le besoin de cohérence multi-clés était déjà reconnu ailleurs dans le code, simplement pas répliqué côté suppression. Un parent qui recréait plus tard un profil avec le même prénom (cousin, ami de passage, second enfant) en héritait silencieusement.

**Décision** : nouvelle fonction `_purgeChildData(name)` (`09-parent.js`, à côté de `resetAllProfiles()`) qui supprime `block_'+name`, retire l'entrée `name` de `birthdays` et de `chatProfiles`. Appelée en plus de la suppression de `user_'+name` dans `resetProfile()` et dans la boucle de `_resetAllConfirm()`. `pmRemoveProfile()` (suppression douce depuis « Comptes ») n'est PAS concernée par ce lot : elle documente et assume déjà explicitement la conservation des données (« Sa progression restera stockée sur l'appareil », texte de confirmation), contrairement aux deux fonctions corrigées ici qui promettent une remise à zéro complète.

**Alternatives rejetées** : étendre aussi ce correctif à `renameProfile()` (rejeté pour ce lot — la fonction migre déjà `user_`/`block_`, l'absence de `birthdays`/`chatProfiles` y est un gap similaire mais distinct, hors du périmètre validé pour ce lot, à traiter séparément si confirmé) ; ajouter une option de suppression réellement définitive et irréversible séparée du reset actuel (rejeté — hors périmètre du constat, qui porte sur la cohérence du reset EXISTANT avec son propre message, pas sur l'ajout d'une nouvelle fonctionnalité).

**Impact** : `09-parent.js` (`_purgeChildData()`, `_resetAllConfirm()`), `10-figurines.js` (`resetProfile()`). v12.7.50. Tests : `tests/reset-purges-orphaned-child-data.test.js` (`scripts/gen-test-api.mjs` relancé). 601/601 tests verts. Constat AUD-02-025 (audit fonctionnel) clos par ce lot.

---

## ADR-137 — Lot 1.6 (audit fonctionnel AUD-02, Phase 1, dernier lot) : message bloqué non perdu + annulation de demande d'ami

**Contexte** : l'audit fonctionnel AUD-02 a identifié deux défauts de parcours dans la messagerie enfant-à-enfant (`17-messaging.js` + `worker/odyssee-chat.js`), sous l'angle fonctionnel/UX — la sécurité du filtre elle-même (substring vs mot entier) était déjà couverte par l'audit technique AUD-01-001. (1) AUD-02-040 : `chatSendCurrent()` vidait le champ de saisie AVANT l'envoi, y compris quand `_chatSend()` bloquait le message (filtre client ou serveur) — l'enfant devait retaper l'intégralité de son message de mémoire, sans savoir quel mot avait posé problème (toast générique). (2) AUD-02-041 : `friendList()` (Worker) renvoyait déjà `outgoing` (demandes d'ami envoyées, encore en attente) mais rien côté client ne le lisait ni ne l'affichait, et aucune route serveur ne permettait à l'expéditeur d'annuler sa propre demande (seul `/friend/decline`, côté DESTINATAIRE, existait) — une demande envoyée par erreur restait engagée indéfiniment, invisible.

**Décision** :
- `_chatFindBlockedWord(txt)` remplace le simple booléen `_chatContainsBlockedWord()` (conservée comme alias) et renvoie le mot effectivement trouvé. `_chatSend()` l'utilise pour un toast précis (« Message bloqué (mot : « X ») ») et renvoie désormais `true` sur toute issue qui ne doit pas vider le champ (blocage client, blocage/erreur serveur), `undefined` sinon (message envoyé ou mis en file d'attente hors-ligne). `chatSendCurrent()` ne vide le champ que si `_chatSend()` n'a PAS renvoyé `true`.
- Nouvelle route `/friend/cancel` (`worker/odyssee-chat.js`, `friendCancel()`), symétrique de `friendDecline()` mais côté EXPÉDITEUR : supprime la ligne `contacts` `pending` où `a`=soi-même et `b`=le destinataire ciblé. Nouvelle fonction cliente `chatFriendCancel()` + `chatCancelContact()`, et `renderContactsScreen()` affiche désormais une section « 📤 Demandes envoyées » (lue depuis `data.outgoing`, déjà fourni par le serveur) avec un bouton Annuler par demande.

**Alternatives rejetées** : pour AUD-02-040, indiquer aussi le mot bloqué dans le cas d'un blocage détecté côté SERVEUR (rejeté pour ce lot — le Worker ne renvoie actuellement que `{error:'blocked_word'}` sans préciser le mot ; l'exposer nécessiterait un changement de contrat d'API plus large, hors périmètre de ce correctif qui répare déjà le cas le plus fréquent, le blocage client) ; pour AUD-02-041, purger l'historique ou notifier automatiquement le destinataire lors d'une annulation (rejeté — hors périmètre du constat, qui porte uniquement sur la possibilité de retirer une demande encore en attente, pas sur la vie de la conversation elle-même, déjà couverte séparément par AUD-02-043).

**Impact** : `17-messaging.js` (`_chatFindBlockedWord()`, `_chatContainsBlockedWord()`, `_chatSend()`, `chatSendCurrent()`, `chatFriendCancel()`, `chatCancelContact()`, `renderContactsScreen()`), `worker/odyssee-chat.js` (`friendCancel()`, route `/friend/cancel` — **à redéployer séparément sur Cloudflare**, cf. `worker/DEPLOY.md`, ce lot ne déploie pas le Worker lui-même). v12.7.51. Tests : `tests/chat-blocked-message-not-lost.test.js`, `tests/worker-friend-cancel.test.js` (premier test automatisé pour ce Worker, via un mock D1 minimal `tests/helpers/fakeD1.js`, réutilisable pour de prochains lots — comble un angle mort documenté par l'audit technique AUD-01, section C7). `tests/helpers/loadGame.js` reçoit un accesseur `setMsgConv` (pattern déjà établi) et des stubs `focus()`/`blur()`/`click()` sur l'élément DOM factice, additifs. `scripts/gen-test-api.mjs` relancé. `--max-warnings` du lint passe de 339 à 340 (`chatCancelContact()`, appelée uniquement depuis un attribut `onclick` généré en chaîne, comme `chatAcceptContact()`/`chatDeclineContact()`/`chatRemoveContact()` déjà acceptées au même titre). 613/613 tests verts. Constats AUD-02-040 et AUD-02-041 (audit fonctionnel) clos par ce lot — **Phase 1 de l'audit fonctionnel AUD-02 entièrement close.**

---

## ADR-138 — Lot 2.1 (audit fonctionnel AUD-02, Phase 2) : niveau scolaire réel choisi à la création d'un profil

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-001, Élevée) a identifié que `defProfile()` (`05-profile.js`) démarre systématiquement tout nouveau profil en CP, quel que soit l'âge réel de l'enfant déclaré ailleurs (anniversaire) — un enfant de CM2 doit enchaîner 12 victoires cumulées (CE1+CE2+CM1) sur du contenu trop facile avant d'atteindre son vrai niveau, faute de tout réglage à la création.

**Décision** : un sélecteur de niveau scolaire (`pm-new-level`, mêmes optgroups Maternelle/Primaire/Collège que le sélecteur `hw-level` existant) accompagne désormais le champ prénom dans « Ajouter un enfant » (`pmAddProfile()`, `09-parent.js`). Le choix n'est PAS appliqué immédiatement — aucun profil n'existe encore tant que l'enfant ne s'est pas connecté une première fois (architecture de création paresseuse déjà en place, dont dépend par ailleurs la détection « ne s'est jamais connecté » de `renderCloudPanel()`). Il est mémorisé (`_setPendingStartLevel()`, `localStorage['pendingStartLevel']`) puis consommé une seule fois, UNIQUEMENT dans la branche « aucune sauvegarde existante » de `loadProfile()` (`05-profile.js`) — jamais sur un profil déjà existant, même corrompu. `_applyStartLevel()` ne court-circuite jamais `isUnlocked()`/`prevWins()` : elle crédite honnêtement `levelWins` (ET `levelWinsBySubj.{math,fr,hist}`, qui a la PRIORITÉ sur `levelWins` dès qu'il existe — même vide — dans `_subjWins()`) de chaque niveau précédent au seuil exigé par le niveau SUIVANT dans la chaîne, pour que le niveau choisi soit débloqué naturellement, exactement comme s'il avait été atteint en jouant.

**Alternatives rejetées** : pré-créer immédiatement le profil complet à `pmAddProfile()` plutôt que de mémoriser un choix en attente (rejeté — casserait la détection « ne s'est jamais connecté » déjà utilisée ailleurs, sans bénéfice réel) ; écrire directement `P.prefs.level` sans créditer `levelWins`/`levelWinsBySubj` (rejeté — laisserait le niveau affiché comme choisi mais visuellement verrouillé 🔒 dans le sélecteur de niveau du jeu, `applyPrefs()`, une confusion pire que le défaut initial).

**Impact** : `index.html` (sélecteur `pm-new-level`), `09-parent.js` (`pmAddProfile()`), `05-profile.js` (`_setPendingStartLevel()`, `_consumePendingStartLevel()`, `_applyStartLevel()`, `loadProfile()`). v12.7.52. Tests : `tests/start-level-at-profile-creation.test.js`. `tests/helpers/loadGame.js` reçoit un stub `getAttribute()` sur l'élément DOM factice (additif — `initAppearance()` en avait besoin, jamais exercé par un test avant celui-ci qui est le premier à appeler `loadProfile()` directement). 622/622 tests verts. Constat AUD-02-001 (audit fonctionnel) clos par ce lot.

**Note technique** : la ligne de commande `npm run sync:test-api` a échoué une fois pendant ce lot (« Ancre "globalThis.__api = {" introuvable ») — cause : le fichier `tests/helpers/loadGame.js` s'était retrouvé en fins de ligne CRLF dans la copie de travail (normalisation Git locale), alors que le script compare des marqueurs terminés par `\n` (LF). Corrigé en ré-normalisant le fichier en LF avant de relancer le script ; aucun changement de contenu réel, juste une reconversion de fin de ligne — sans rapport avec ce lot, mentionné ici pour mémoire si ça se reproduit.

---

## ADR-139 — Lot 2.2 (audit fonctionnel AUD-02, Phase 2) : correction de la séquence causale pluie/nuage/arc-en-ciel (maternelle)

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-018) a relevé que `HIST_MAT_MS_SEQ3` (`18-histoire.js`), banque de séquences « remets dans le bon ordre » pour la maternelle (module repères temporels/causaux, MS 4-5 ans), présentait l'ordre pluie → nuage → arc-en-ciel comme LA bonne réponse (`_histMatMS_seq3()` utilise l'ordre littéral du tableau comme vérité terrain, sans autre source). Cet ordre inverse la causalité réelle : le nuage précède la pluie, et l'arc-en-ciel n'apparaît qu'après, quand le soleil revient. Un enfant qui a l'intuition correcte (nuage avant pluie) était marqué faux par le jeu.

**Décision** : l'entrée est corrigée en `['☁️','🌧️','🌈']` (nuage → pluie → arc-en-ciel). Correction ponctuelle d'une donnée de contenu, aucun changement de logique.

**Alternatives rejetées** : aucune — correction factuelle non ambiguë, sans compromis à arbitrer.

**Impact** : `18-histoire.js` (`HIST_MAT_MS_SEQ3`). v12.7.53. Tests : `tests/histoire-maternelle-sequence-causality.test.js`. 624/624 tests verts. Constat AUD-02-018 (audit fonctionnel) clos par ce lot.

---

## ADR-140 — Lot 2.3 (audit fonctionnel AUD-02, Phase 2) : robustesse de validateProfile() — bornage + garde-fou automatisé, et découverte de 9 champs déjà oubliés (dont 2 régressions critiques)

**Contexte** : l'audit fonctionnel AUD-02 avait identifié deux problèmes distincts dans `validateProfile()` (`05-profile.js`) : (AUD-02-021) les champs `quests`, `weeklyChallenge` et `homework` échappaient au bornage systématique appliqué à ~70 autres champs, avec un risque de plantage concret pour `quests` (`renderQuests()`, `07-game.js`, fait `P.quests.map(...)` sans vérifier le type) ; (AUD-02-022) le pattern même de liste blanche est structurellement fragile — tout champ écrit ailleurs via `P.xxx=...` mais oublié de cette liste est supprimé SILENCIEUSEMENT à chaque rechargement de profil, un bug déjà survenu 4 fois en production (`onbAccountSeen`, `onbMapSeen`, `lastAdventure`, `twistLinesUsedByAdv`, tous documentés en commentaire dans le fichier). L'audit demandait un garde-fou automatisé pour prévenir une récidive.

**Découverte en construisant ce garde-fou** : le scan automatisé (comparaison de tout `P.champ=` du code source contre la liste blanche réelle de `validateProfile()`) a immédiatement trouvé **9 champs déjà dans cet état**, jamais détectés jusqu'ici faute d'outillage — exactement le risque que le garde-fou est censé prévenir, matérialisé. Deux d'entre eux annulaient silencieusement un correctif de cette même série d'audits, déjà livré et considéré clos :
- **`blockedSubjects`** (AUD-02-027, Lot 0.2, CRITIQUE) : le blocage de matières redevenait sans aucun effet dès le rechargement de profil suivant celui où le parent l'avait activé — la matière restait bloquée en apparence dans l'espace parent, mais l'enfant y avait de nouveau accès après un simple retour à l'accueil.
- **`chatFlags`** (AUD-02-046, Lot 1.2, Élevée) : l'historique des mots bloqués en mémoire (`P.chatFlags`) était tronqué à chaque rechargement — le résumé hebdomadaire lit heureusement le stockage brut directement (non affecté dans l'immédiat), mais tout `saveProfile()` suivant un rechargement écrasait ce stockage brut avec la version tronquée, effaçant progressivement l'historique réel au fil des sessions.

Les 7 autres (`streak`/`streakLastDate`, `sessionObjective`, `lastPlayTs`, `calmModeExplained`, `senseMsgDate`, `masteryAnnounced`) dégradaient des mécanismes de confort (ex. le streak de jours consécutifs, mis en avant avec bienveillance dans son propre commentaire de code comme "aucune perte d'acquis en cas de rupture", repartait en réalité à 1 à CHAQUE rechargement, pas seulement après une vraie rupture d'un jour).

**Décision** : (1) `quests`/`weeklyChallenge`/`homework` sont désormais typés et bornés champ par champ, sur le même modèle que le reste du fichier — une entrée malformée est neutralisée (`null`, ou filtrée si elle fait partie d'un tableau) plutôt que de traverser intacte. (2) Les 9 champs découverts sont ajoutés à la liste blanche, avec bornage approprié à leur type réel. (3) Nouveau test `tests/profile-fields-whitelist-guard.test.js` : scanne tout `js/*.js` à la recherche d'affectations `P.champ=`/`++`/`--`/`+=`/`-=` (commentaires exclus, pour éviter les faux positifs), et échoue si l'une d'elles cible un champ absent de la liste blanche de `validateProfile()` — CI protégée contre toute récidive future de ce pattern précis, sans attendre qu'un symptôme indirect (bug relancé en boucle, alerte parentale manquante) ne le révèle des mois plus tard.

**Alternatives rejetées** : abandonner le pattern de liste blanche au profit d'un `Object.assign` permissif (rejeté — la liste blanche est précisément ce qui protège contre un profil corrompu/malveillant en écrivant n'importe quel champ arbitraire ; le bon correctif est de la tenir à jour automatiquement, pas de la supprimer) ; ignorer silencieusement les 9 champs trouvés en les ajoutant à une liste d'exceptions plutôt que de les whitelister réellement (rejeté — deux d'entre eux sont des régressions actives sur des correctifs CRITIQUE/Élevé déjà livrés dans cette même série d'audits ; les laisser en l'état aurait été contraire à l'esprit même de ce lot).

**Impact** : `05-profile.js` (`validateProfile()` : bornage de `quests`/`weeklyChallenge`/`homework`, ajout de `blockedSubjects`/`chatFlags`/`streak`/`streakLastDate`/`sessionObjective`/`lastPlayTs`/`calmModeExplained`/`senseMsgDate`/`masteryAnnounced`). v12.7.54. Tests : `tests/profile-fields-bounded.test.js` (13 tests), `tests/profile-fields-whitelist-guard.test.js` (garde-fou automatisé, 2 tests dont un auto-test du scanner lui-même). 639/639 tests verts. Constats AUD-02-021 et AUD-02-022 (audit fonctionnel) clos par ce lot — referme aussi, en pratique, une régression latente sur AUD-02-027 (Lot 0.2) et une dégradation progressive sur AUD-02-046 (Lot 1.2).

---

## ADR-141 — Lot 2.4 (audit fonctionnel AUD-02, Phase 2) : l'export est proposé avant une réinitialisation totale

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-034) a relevé que « Réinitialiser TOUS les profils » (`resetAllProfiles()`/`_resetAllConfirm()`, `09-parent.js`) exécute la remise à zéro immédiatement dès validation (re-saisie exacte de la liste des prénoms, garde-fou déjà solide), sans jamais proposer d'exporter une sauvegarde au préalable — alors que la fonctionnalité d'export (`exportProfileFile()`) existe déjà dans le même onglet, à quelques centimètres du bouton de réinitialisation.

**Décision** : la modale de confirmation affiche désormais un bouton « 💾 Exporter une sauvegarde de tous les profils d'abord », qui appelle `exportProfileFile()` (comportement identique au bouton dédié de l'onglet Cloud, aucune duplication de logique) et confirme le succès par un message dans la modale elle-même. Le bouton reste une proposition, pas une obligation : la re-saisie de la liste des prénoms suffit toujours à débloquer la réinitialisation, avec ou sans export préalable — ce lot ajoute une option de sécurité supplémentaire, il ne restreint pas ce qui existait déjà.

**Alternatives rejetées** : rendre l'export obligatoire avant de pouvoir réinitialiser (rejeté — un parent qui souhaite délibérément tout effacer, y compris ses propres sauvegardes locales, doit rester libre de le faire ; le rôle de ce lot est de PROPOSER un filet de sécurité, pas de l'imposer) ; déclencher l'export automatiquement sans action explicite du parent (rejeté — un téléchargement de fichier déclenché sans clic explicite est une mauvaise pratique UX et peut être bloqué par le navigateur).

**Impact** : `09-parent.js` (`resetAllProfiles()`, `_resetAllExportFirst()`). v12.7.55. Tests : `tests/reset-all-proposes-export-first.test.js`. `tests/helpers/loadGame.js` reçoit un accesseur `setExportProfileFile` (pattern déjà établi — `exportProfileFile()` utilise `Blob`/`URL.createObjectURL`, des API navigateur non stubbées dans ce harnais Node). `scripts/gen-test-api.mjs` relancé. 642/642 tests verts. Constat AUD-02-034 (audit fonctionnel) clos par ce lot.

---

## ADR-142 — Lot 2.5 (audit fonctionnel AUD-02, Phase 2) : journal fonctionnel lisible par un parent

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-026, Moyenne) a relevé qu'un parent n'a aucune visibilité sur les évènements silencieux qui modifient les données de son enfant (migrations de version, imports de fichier, conflits de synchronisation cloud résolus). Seul `getSyncDiag()` (`12-cloud.js`) existait — un diagnostic technique en `sessionStorage` (effacé à la fermeture de l'onglet), explicitement pensé pour être copié-collé à un support technique, pas pour être lu par un parent qui constate une anomalie (étoiles qui changent, figurine disparue) et cherche à comprendre pourquoi.

**Décision** : `logProfileEvent(name, texte)`/`getProfileLog(name)`/`clearProfileLog(name)` (`05-profile.js`) tiennent un journal persistant (`localStorage['profileLog_'+nom]`, 50 entrées max, purgé avec le reste des données du profil par `_purgeChildData()` lors d'un reset — pas un audit trail permanent, juste de quoi comprendre une anomalie récente sur le profil actuellement actif) alimenté à 3 points : `migrateProfile()` quand une VRAIE migration a lieu (pas à chaque chargement d'un profil déjà à jour) ; `importProfileFile()` (`09-parent.js`) à chaque profil importé ; `_importProfileFromServer()` (`12-cloud.js`) uniquement quand la fusion a réellement changé quelque chose — en réutilisant directement `_summarizeCloudMerge()` du Lot 1.4 (AUD-02-023), pas de nouvelle logique de comparaison. Affiché dans un nouvel accordéon « 📖 Journal du profil » de l'onglet Suivi de l'espace parent (`renderProfileLog()`), pour le profil actuellement sélectionné, avec un bouton pour l'effacer.

**Alternatives rejetées** : journaliser CHAQUE synchronisation cloud, y compris sans changement (rejeté — noierait le journal d'entrées vides à chaque synchronisation de routine, toutes les 5 minutes en jeu actif) ; en faire un historique permanent survivant à un reset de profil (rejeté — contredirait l'esprit du Lot 1.5/AUD-02-025, qui purge délibérément toute donnée rattachée à un prénom lors d'un reset qualifié d'irréversible) ; fusionner ce journal avec le diagnostic technique existant (rejeté — publics différents, le parent a besoin de phrases lisibles, pas de lignes `[cloud] upload échec : 500`).

**Impact** : `05-profile.js` (`logProfileEvent()`, `getProfileLog()`, `clearProfileLog()`, `migrateProfile()`), `09-parent.js` (`importProfileFile()`, `renderProfileLog()`, `_purgeChildData()`, branchement dans `ptab()`/`_onParentPlayerSelectChange()`/`checkPin()`), `12-cloud.js` (`_importProfileFromServer()`), `index.html` (accordéon « Journal du profil »). v12.7.56. Tests : `tests/profile-functional-log.test.js`, `tests/cloud-merge-logs-functional-event.test.js`. `scripts/gen-test-api.mjs` relancé. Lint `--max-warnings` 340 → 341 (`getProfileLog`/`clearProfileLog` utilisées uniquement depuis un autre fichier concaténé, invisible à l'analyse ESLint par fichier — même pattern déjà accepté pour de nombreuses autres fonctions). 653/653 tests verts. Constat AUD-02-026 (audit fonctionnel) clos par ce lot.

---

## ADR-143 — Lot 2.6 (audit fonctionnel AUD-02, Phase 2) : seuils de "point faible" harmonisés entre le bandeau et le conseil hebdomadaire

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-031, Moyenne) a relevé que trois calculs différents de « point faible » coexistent dans le même écran Suivi de l'espace parent : le bandeau global (`renderReport()`, `09-parent.js`, seuil `t>2 && ok/t<.7` sur `opStats` cumulatif) ; le conseil de la semaine (`_weeklyAdvice()`, MÊME donnée `opStats` cumulative, mais seuil `t>5 && ok/t<.6`) ; et l'indicateur de progression par notion (`_progPanelHtml()`, `06a-adaptive.js`, donnée `yearProgress` totalement différente, scopée à un niveau précis). Les deux premiers portaient sur la MÊME donnée avec des seuils différents, pouvant donc se contredire sans raison légitime (ex. bandeau « Aucun point faible ! » pendant que le conseil cible une opération que le bandeau vient de dire saine). Le troisième a une portée légitimement différente (une notion précise dans un niveau précis, pas une moyenne globale), mais rien n'expliquait cette différence à l'écran.

**Décision** : le seuil de `_weeklyAdvice()` (priorité 3, « opération faible ») est aligné sur celui du bandeau (`t>2 && ok/t<.7`) — même donnée, même verdict, plus de contradiction possible entre les deux. L'indicateur par notion de `_progPanelHtml()` reste volontairement distinct (portée réellement différente) mais affiche désormais un texte de clarification (« Sur cette notion précise en {niveau} — indépendant du bilan global ci-dessus ») pour qu'un parent comprenne pourquoi les deux peuvent légitimement diverger, plutôt que de le lire comme une incohérence.

**Alternatives rejetées** : fusionner les trois indicateurs en un seul calcul unifié (rejeté — le troisième porte sur une donnée et une granularité fondamentalement différentes ; une fusion forcée aurait soit perdu la précision par notion, soit compliqué inutilement le bandeau global) ; garder les seuils différents mais ajouter une explication (rejeté pour les deux PREMIERS calculs — contrairement au troisième, ils portent sur exactement la même donnée : la seule justification cohérente est l'alignement, pas une explication de leur différence).

**Impact** : `09-parent.js` (`_weeklyAdvice()`), `06a-adaptive.js` (`_progPanelHtml()`). v12.7.57. Tests : `tests/weak-point-thresholds-consistent.test.js` — a immédiatement détecté une régression introduite pendant ce lot (une suppression accidentelle de la déclaration `const opN` lors de l'édition), corrigée avant commit. 657/657 tests verts. Constat AUD-02-031 (audit fonctionnel) clos par ce lot.

---

## ADR-144 — Lot 2.7 (audit fonctionnel AUD-02, Phase 2, effort élevé) : gating par phase des générateurs de calcul mental de base (CE1-CM2)

**Contexte** : l'audit fonctionnel AUD-02 (constats AUD-02-014 et AUD-02-015) a identifié que `04-questions.js` — le module qui porte la proposition de valeur principale du produit (calcul mental) — ne suivait pas le système de phase (progression douce début/milieu/fin d'année) déjà appliqué aux autres modules de contenu (maternelle, primaire enrichi, collège, français, histoire) et documenté comme règle de maintenance obligatoire dans le README du projet. Seule la PLAGE de nombres était resserrée en début d'année (`_ari()`/`_progScaleRange()`), jamais la VARIÉTÉ de types de questions : un enfant en tout début d'année de CE1 pouvait recevoir dès sa première question un nombre manquant en soustraction, un des types les plus abstraits du niveau. De plus, l'auto-contrôle `_progSelfCheck()` (censé garantir qu'aucun générateur n'est sans phase) ne scannait pas ce fichier.

**Décision** : chaque générateur non-boss de CE1, CE2, CM1 et CM2 (`genQ_CE1`/`genQ_CE2`/`genQ_CM1`/`genQ_CM2`) consulte désormais `_progPhase(niveau)` (déjà utilisée par les autres modules, `06a-adaptive.js`) pour restreindre son pool de types en phase 1/2, avec un principe simple et vérifié par les tests : **le comportement en phase 3 reste EXACTEMENT identique à avant ce lot** (aucune régression pour un profil déjà avancé dans l'année) — seules les phases 1 et 2 deviennent plus progressives :
- **CE1** : nombre manquant réservé à partir de la phase 2 (phase 1 : addition/soustraction seules).
- **CE2** : nombre manquant réservé à partir de la phase 2 ; la table de 3 (jugée la plus difficile des 4 proposées) réservée à la phase 3.
- **CM1** : nombre manquant à partir de la phase 2 ; géométrie (la matière la plus éloignée du calcul mental pur à ce niveau) réservée à la phase 3.
- **CM2** : géométrie à partir de la phase 2 ; fractions (notion la plus abstraite de ce niveau) réservées à la phase 3.

`genQ_CP` n'a pas été touché : son générateur non-boss ne propose déjà qu'un seul type (addition simple), sans variété à gater. Les pools de BOSS (`_nextBossType`, tous niveaux) n'ont pas non plus été touchés — un combat de boss reste, comme avant, l'occasion d'un défi complet dès le premier affrontement ; seule la pratique courante (hors boss) est concernée par ce lot, cohérent avec le périmètre du constat.

**Écart assumé sur AUD-02-015** (`_progSelfCheck()`) : l'audit demandait de « généraliser `_progSelfCheck()` pour scanner aussi... les générateurs de `04-questions.js` ». Ce n'est PAS ce qui a été fait, pour une raison structurelle et non une facilité : `_progSelfCheck()` scanne des pools de FONCTIONS individuellement taguées `.ph` (`_PRIM_POOL`/`_MAT_POOL`/`_COL_POOL`) — un pattern que `04-questions.js` n'utilise pas et n'a pas été converti pour utiliser (un seul générateur par niveau, avec des pools de chaînes construits en ligne, comme le confirme la lecture du fichier). Convertir `04-questions.js` vers le pattern function-array-with-.ph aurait été un refactor bien plus large et risqué que le gating lui-même, disproportionné pour ce lot. La protection équivalente est assurée différemment : des tests dédiés (`tests/question-generators-phase-gating.test.js`) vérifient mécaniquement, pour chaque niveau et chaque notion gatée, que la phase 1 ne produit JAMAIS le type réservé et que la phase 3 le produit bien — une régression future de ce gating ferait donc échouer la suite de tests, but différent de `_progSelfCheck()` (détection au chargement de l'app) mais avec la même finalité (empêcher une récidive silencieuse). Le même écart existe pour `16-francais.js`/`18-histoire.js` (non touchés par ce lot, hors périmètre validé) : ces modules utilisent aussi des blocs `if(phase<=1)` inline plutôt que des fonctions taguées `.ph`, et gagneraient au même traitement dans un futur lot dédié.

**Alternatives rejetées** : convertir `04-questions.js` vers le pattern `.ph`-par-fonction pour permettre un scan uniforme par `_progSelfCheck()` (rejeté — refactor disproportionné pour ce lot, risque de régression sur le module le plus central du produit sans bénéfice fonctionnel supplémentaire pour les familles) ; gater aussi les pools de boss (rejeté — un combat de boss est déjà conçu comme un défi complet, contrairement à la pratique courante ; le gater aurait changé un comportement de jeu au-delà du périmètre du constat) ; retirer entièrement `af.sub` du pool CE1 en phase 1/2 (rejeté — sans effet réel constaté : le choix de l'opération +/− est déjà randomisé indépendamment de la présence de `'sub'` dans le pool, un second constat, mineur et non lié à la phase, qui mériterait sa propre investigation hors de ce lot).

**Impact** : `04-questions.js` (`_curPhase()`, `genQ_CE1`, `genQ_CE2`, `genQ_CM1`, `genQ_CM2`). v12.7.58. Tests : `tests/question-generators-phase-gating.test.js` (11 tests : phase 1 sans le type réservé, phase 3 avec, non-régression du pool de boss). 668/668 tests verts, y compris la suite de tests mathématiques déjà existante (`genq-invariants.test.js` et consorts) — confirmant qu'aucune correction de calcul n'a été altérée, seule la SÉLECTION des types a été restreinte en début d'année. Constats AUD-02-014 (clos) et AUD-02-015 (clos avec l'écart structurel documenté ci-dessus, protection équivalente assurée par les tests dédiés) closes par ce lot.

---

## ADR-145 — Lot 2.8 (audit fonctionnel AUD-02, Phase 2, contenu) : français CM2 différencié de CM1

**Contexte** : l'audit fonctionnel AUD-02 (constat AUD-02-016, Moyenne) a relevé que `GEN_FR.CM2` pointait directement vers `genFR_CM1` — un enfant de CM2 recevait exactement le même contenu de français qu'un enfant de CM1 (mêmes homophones, participes passés, fonctions grammaticales), sans aucune notion nouvelle du programme CM2. Contrairement aux autres lots de cette série, celui-ci exigeait la création de contenu pédagogique réel, pas seulement un correctif de code — le contenu proposé (8 phrases sur le discours direct/indirect, plus la réutilisation de bancs existants) a donc été présenté et validé explicitement avant toute intégration.

**Décision** : nouveau générateur `genFR_CM2()`, phase-gaté comme `genFR_CM1()`, construit sur 3 piliers : (1) les bases CM déjà éprouvées en phase 1 (homophones, conjugaison, COD — mêmes banques que CM1, pas de rupture pédagogique) ; (2) contenu réellement nouveau — `FR_DISCOURS` (8 phrases, discours direct « guillemets + deux-points » vs indirect « que/infinitif », programme officiel CM2) — introduit à partir de la phase 2 ; (3) réutilisation de bancs déjà existants mais jusqu'ici réservés à la 6e — `FR6_PHRASE` (phrase simple/complexe, phase 2) et `FR6_FONC` (sujet/COD/complément circonstanciel, phase 3 seulement) — sur exactement le même principe déjà appliqué ailleurs dans ce fichier (la 5e réutilise déjà `_fr6_phrase()` en phase 1 comme première exposition en douceur) : aucun contenu dupliqué, juste un palier d'introduction avancé d'un niveau, cohérent avec le programme réel.

**Alternatives rejetées** : dupliquer `FR6_PHRASE`/`FR6_FONC` sous des noms CM2 propres plutôt que les réutiliser (rejeté — duplication de contenu sans bénéfice, le pattern de réutilisation entre niveaux proches est déjà la convention établie de ce fichier) ; introduire aussi des notions de niveau 4e/3e (subordonnées relatives/conjonctives par type, `FR4_SUB`) dès le CM2 (rejeté — jugé trop avancé pour le cycle 3, le discours rapporté et la phrase complexe suffisent à combler l'écart réel avec le programme CM2 sans survendre le niveau).

**Impact** : `16-francais.js` (`FR_DISCOURS`, `_frCM2_discours()`, `genFR_CM2()`, `GEN_FR.CM2`). v12.7.59. Tests : `tests/french-cm2-differentiated.test.js` (contenu des 8 phrases, gating par phase, non-régression de CM1 qui ne doit jamais recevoir le contenu CM2). `scripts/gen-test-api.mjs` relancé. 675/675 tests verts. Constat AUD-02-016 (audit fonctionnel) clos par ce lot.

---

---

## ADR-146 — Lot 2.9 (audit fonctionnel AUD-02, Phase 2) : complétude de la licence Saisonnier et confirmation d'achat de figurine

**Contexte** : l'audit fonctionnel AUD-02 a relevé deux constats sur la boutique de figurines. AUD-02-037 : le compteur de complétion de la licence Saisonnier (uk:'sx') comptait les 21 figurines du catalogue, dont 5 gâteaux d'anniversaire nominatifs (`sx_anniv_soren`/`peyo`/`tomi`/`papa`/`maman`) plus le générique `sx_anniv` — un joueur donné ne peut structurellement en obtenir qu'UN SEUL (le sien si câblé, sinon le générique), jamais les 6 variantes ; le dénominateur affiché (« X / 21 ») était donc structurellement inatteignable, même en jouant parfaitement. AUD-02-039 : aucune confirmation n'existait avant un achat de figurine, quel que soit son prix (jusqu'à 500⭐) — un double-tap accidentel sur mobile dépensait définitivement des étoiles sans recours.

**Décision** : (1) nouvelle fonction partagée `_playerBirthdayFigId(playerName)` (`03-figurines-data.js`) — extraite de la logique déjà existante dans `getActiveSeasonalBoss()` (`06c-seasonal.js`, qui l'appelle désormais au lieu de dupliquer le calcul) — détermine la seule variante d'anniversaire réellement accessible à un joueur donné. Nouvelle fonction `_countableFigurines(playerName)` filtre le catalogue pour exclure du DÉNOMINATEUR toute variante d'anniversaire autre que celle-ci (16 figurines "sx" comptables au lieu de 21) ; la grille elle-même reste complète (toutes les figurines restent visibles/possédables si débloquées par un autre moyen), seul le compteur X/Y affiché change. `_renderFigurinesShop()`, `renderFigCollection()` et l'accordéon par licence utilisent désormais ce total corrigé. (2) `buyFigurine()` (`10-figurines.js`) : le corps de l'achat est extrait dans une closure `_doBuy`, appelée soit immédiatement (achat <200⭐, comportement inchangé), soit via `showConfirm()` (achat ≥200⭐) — seuil choisi pour ne pas frictionner les petits achats fréquents tout en protégeant les achats coûteux et rares contre un double-tap accidentel.

**Alternatives rejetées** : exiger une confirmation pour TOUT achat, quel que soit le prix (rejeté — friction inutile pour les figurines à faible coût, régulièrement achetées, sans risque réel en cas d'erreur) ; retirer entièrement les variantes d'anniversaire non-accessibles du catalogue `FIGURINES` plutôt que les filtrer au niveau de l'affichage (rejeté — ces entrées doivent rester dans le catalogue pour que le boss d'anniversaire puisse toujours les débloquer selon le joueur concerné ; seule la fonction de COMPTAGE devait changer, pas les données sources).

**Impact** : `js/03-figurines-data.js` (`_playerBirthdayFigId`, `_countableFigurines`), `js/06c-seasonal.js` (`getActiveSeasonalBoss`, réutilise `_playerBirthdayFigId`), `js/10-figurines.js` (`buyFigurine`, `_renderFigurinesShop`, `renderFigCollection`). v12.7.60. Tests : `tests/figurines-completion-and-purchase-confirm.test.js` (10 tests : identification de la variante d'anniversaire, dénominateur corrigé à 16, non-régression des autres licences, seuil de confirmation à 200⭐). Ce lot a nécessité la mise à jour de 4 fichiers de tests pré-existants (`tests/stars-ledger-cloud-merge.test.js`, `tests/seasonal-figurines-not-purchasable.test.js`, `tests/new-licenses-and-content-update.test.js`, `tests/parent-figurine-removal.test.js`) qui appelaient `buyFigurine()` sur des figurines ≥200⭐ sans simuler la confirmation (`api.setShowConfirm((msg, onConfirm) => onConfirm())`) — comportement attendu de la nouvelle UX, pas une régression fonctionnelle. 685/685 tests verts. Constats AUD-02-037 et AUD-02-039 (audit fonctionnel) clos par ce lot.

---

---

## ADR-147 — Lot 2.10 (audit fonctionnel AUD-02, Phase 2) : messagerie — visibilité des refus, purge de l'historique au retrait, état injoignable

**Contexte** : l'audit fonctionnel AUD-02 a relevé trois constats sur la messagerie fermée (`worker/odyssee-chat.js` + `js/17-messaging.js`), tous P2/Moyenne. AUD-02-042 : `friendDecline()` supprimait la ligne `pending` sans notification — l'expéditeur d'une demande refusée ne pouvait jamais distinguer un refus d'une absence de réponse. AUD-02-043 : `friendRemove()` ne supprimait que la relation `contacts`, jamais la table `messages` (clé de conversation déterministe) — tout l'historique ressurgissait intégralement en cas de réconciliation, alors que le message affiché au retrait (« Vous ne pourrez plus vous écrire ») laisse croire à une rupture propre et définitive. AUD-02-044 : la désactivation de la messagerie (`chatDisableForProfile()`) était un état 100% LOCAL, jamais communiqué au serveur — un ami restait un contact `accepted` valide indéfiniment, sans qu'aucun signal ne distingue « hors-ligne temporairement » de « parti pour toujours ».

**Décision** : (1) **AUD-02-042** : `friendDecline()` marque désormais `status='declined'` au lieu de supprimer la ligne ; `friendList()` expose une nouvelle liste `declined` (demandes envoyées puis refusées, distincte de `outgoing`) ; `friendCancel()` (déjà existante depuis le Lot 1.6) est étendue pour effacer aussi une notice `declined` une fois lue côté client, réutilisant le même bouton « Annuler »/« OK » plutôt qu'une route dédiée ; `friendRequest()` peut relancer une demande après un refus via un upsert conditionnel (`ON CONFLICT ... DO UPDATE ... WHERE status='declined'`, ne touche jamais un pending/accepted existant). (2) **AUD-02-043** : `friendRemove()` purge désormais aussi `messages` et `reads` pour la clé de conversation des deux comptes — le message affiché au retrait devient enfin littéralement vrai. (3) **AUD-02-044** : nouvelle colonne `users.disabled` (migration dédiée), nouvelle route `/account/setenabled` appelée par `chatEnableForProfile()`/`chatDisableForProfile()` (devenues asynchrones, appel réseau fire-and-forget qui ne conditionne jamais l'état local déjà appliqué), exposée par `friendList()` sur les contacts acceptés ; `renderContactsScreen()` affiche un badge « injoignable » en conséquence.

**Alternatives rejetées** : bloquer l'envoi de messages côté serveur vers un contact désactivé (rejeté — l'audit demande un signal visuel, pas un blocage ; un message envoyé avant une réactivation ultérieure doit rester livrable, comme avant) ; détecter l'état « injoignable » par une heuristique d'inactivité prolongée plutôt qu'un flag explicite (rejeté — plus fragile, faux positifs pendant les vacances scolaires, et ne correspond pas au texte de l'audit qui vise précisément la désactivation parentale) ; créer une route dédiée `/friend/dismiss-declined` plutôt que réutiliser `/friend/cancel` (rejeté — `friendCancel()` fait déjà exactement ce qu'il faut une fois son `WHERE` étendu, une route dédiée aurait été une duplication pure).

**Impact** : `worker/odyssee-chat.js` (`friendRequest`, `friendList`, `friendDecline`, `friendCancel`, `friendRemove`, nouvelle `setEnabled`), `worker/schema.sql` + nouvelle migration `worker/migration-user-disabled.sql` (**à exécuter manuellement sur le dashboard Cloudflare avant déploiement du Worker** — comme pour les migrations précédentes de ce fichier), `js/17-messaging.js` (`chatEnableForProfile`, `chatDisableForProfile`, `renderContactsScreen`). v12.7.61. Tests : `tests/worker-friend-decline-and-remove-purge.test.js` (9 tests, worker via mock D1 étendu — `tests/helpers/fakeD1.js` gagne le support de `messages`/`reads`/`users.disabled` et des nouvelles requêtes SQL), `tests/messaging-declined-and-unreachable-badges.test.js` (4 tests, rendu client, via deux nouveaux accesseurs de test `setChatFriendList`/`setMsgProf` contournant la limite déjà documentée du sandbox sur les appels réseau réels). 696/696 tests verts. Constats AUD-02-042, AUD-02-043 et AUD-02-044 (audit fonctionnel) clos par ce lot — dernier lot de la Phase 2 du plan de remédiation.

---

---

## ADR-148 — Lot 3.1 (audit fonctionnel AUD-02, Phase 3) : onboarding / création de profil

**Contexte** : la Phase 3 (« Excellence / Perfectionnement ») regroupe des constats de confort et de cas limites, moins critiques que les Phases 1/2 mais toujours dignes de correction. Ce lot traite cinq constats de la zone onboarding/création de profil, tous d'effort Faible. AUD-02-002 : au tout premier lancement, sur un concours de timing défavorable, le sélecteur « Autre joueur… » (seule option quand le roster est vide) pouvait rester sans champ de saisie visible — valider dans cet état créait un profil littéralement nommé « Joueur », jamais ajouté au roster, donc invisible du parent. AUD-02-003 : « Ajouter un profil » avec un champ vide ne produisait aucun effet visible, contrairement au cas doublon qui affiche un toast. AUD-02-004 : jour et mois d'anniversaire validés indépendamment (chacun clampé séparément), acceptant des dates calendairement impossibles (« 31 avril »). AUD-02-005 : la récupération du code parent oublié utilisait des `prompt()` natifs du navigateur, en rupture avec le reste de l'app (modales stylées), au moment le plus sensible du parcours. AUD-02-006 : les 22 étapes du Système 2 de visite guidée s'enchaînaient automatiquement 350ms après les 10 étapes du Système 1, sans point de pause proposé.

**Décision** : (1) **AUD-02-002** : nouvelle fonction `_syncCustomZoneVisibility()` (05-profile.js), appelée à la fois par `onPlayerChange()` (déjà existant) et juste après la restauration de `lastPlayer` au boot (11-init.js) — la visibilité du champ suit désormais systématiquement la valeur réelle du sélecteur, quel que soit le chemin de boot emprunté. En complément, `loadProfile()` pose un marqueur `P._unnamed` (champ de session pur, jamais persisté — documenté dans `KNOWN_TRANSIENT_FIELDS`, tests/profile-fields-whitelist-guard.test.js) quand le nom résolu n'est que le repli littéral 'Joueur' sans aucune saisie réelle ; `saveProfile()`/`saveProfileNow()` refusent d'écrire tant que ce marqueur est actif — un vrai prénom saisi lève le verrou de lui-même au prochain `loadProfile()`. Un profil « Joueur » réellement choisi par une famille (déjà sauvegardé) n'est jamais bloqué. (2) **AUD-02-003** : `pmAddProfile()` affiche désormais un toast (« Merci d'indiquer un prénom. ») sur champ vide, symétrique au cas doublon. (3) **AUD-02-004** : `pmSetBirthday()` valide la cohérence jour/mois (table des jours par mois, 29 pour février par prudence bissextile) avant d'appeler `setBirthday()` — une combinaison invalide est refusée avec un toast explicite, sans écraser l'état précédemment enregistré. (4) **AUD-02-005** : nouvelle fonction générique `showPrompt()` (01-core.js), même gabarit visuel que `showAlert`/`showConfirm`, remplace les deux `prompt()` natifs de `recoverParentPin()` (question secrète, puis nouveau code). (5) **AUD-02-006** : `_obFinishClick()` propose désormais un choix explicite (`showConfirm`, « Voir maintenant » / « Plus tard ») avant d'enchaîner sur le Système 2, au lieu d'un démarrage automatique forcé ; la logique d'affichage est extraite dans `_obOfferSystem2Chain()`, appelée depuis le `setTimeout` existant — même principe de séparation « décision pure / effet » déjà en usage dans ce fichier (`_obShouldChainToSystem2` etc.), qui la rend directement testable indépendamment du minutage.

**Alternatives rejetées** : bloquer complètement le jeu tant qu'aucun nom n'est saisi au premier lancement (rejeté — changement de flux plus large et risqué que le correctif ciblé retenu, disproportionné pour un effort Faible ; le marqueur `_unnamed` obtient le même résultat — aucune persistance fantôme — sans toucher au flux d'affichage) ; clamper silencieusement le jour au maximum du mois plutôt que refuser (rejeté — l'audit demande explicitement un refus avec message, pas une correction silencieuse qui masquerait l'erreur de saisie) ; généraliser `showPrompt()` à d'autres usages de `prompt()`/`confirm()` natifs du projet dans ce même lot (aucun autre trouvé dans le périmètre audité — `recoverParentPin()` était le seul reste).

**Impact** : `js/01-core.js` (`showPrompt`), `js/05-profile.js` (`_syncCustomZoneVisibility`, `onPlayerChange`, `loadProfile`, `saveProfile`, `saveProfileNow`), `js/09-parent.js` (`pmAddProfile`, `pmSetBirthday`, `recoverParentPin`), `js/11-init.js`, `js/19-onboarding.js` (`_obFinishClick`, `_obOfferSystem2Chain`). v12.7.62. Tests : `tests/onboarding-lot31-first-launch-and-recovery.test.js` (15 tests). Deux tests pré-existants ajustés en conséquence (jamais leur logique métier, seulement leur mesure) : `tests/parent-pin-recovery-hardening.test.js` (fenêtre de lecture du source de `recoverParentPin()` élargie, fonction légitimement plus longue après le remplacement des `prompt()`) et `tests/profile-fields-whitelist-guard.test.js` (`_unnamed` documenté dans `KNOWN_TRANSIENT_FIELDS`, champ de session volontairement non persistant). 711/711 tests verts. Constats AUD-02-002, AUD-02-003, AUD-02-004, AUD-02-005 et AUD-02-006 (audit fonctionnel) clos par ce lot.

---

---

## ADR-149 — Lot 3.3 (audit fonctionnel AUD-02, Phase 3) : contenu résiduel — ordinaux maternelle, unlockHint dynamique

**Contexte** : deux constats d'effort Faible/Observation, portant sur un contenu ou un texte techniquement présent mais silencieusement incorrect ou inutilisé. AUD-02-017 : `_matRang` (13-maternelle.js, « Touche le premier/deuxième/… objet », programme « Explorer le monde » cycle 1) était codé, avec un commentaire dédié, mais absent de `_MAT_POOL` (PS/MS/GS) et du dictionnaire de phases — aucun enfant ne le voyait jamais jouer. AUD-02-038 : le texte `unlockHint` affiché sur une figurine `completionLock` encore verrouillée (« Achetable en réunissant les N autres figurines <Licence> ») était une chaîne figée en dur par figurine dans `03-figurines-data.js`, alors que `_isLicenseCompletionUnlocked()` (10-figurines.js) recalcule, lui, dynamiquement la même condition — cohérent aujourd'hui, mais rien ne garantissait que les deux resteraient synchronisés après un futur ajout de figurine à une licence existante.

**Décision** : (1) **AUD-02-017** : `_matRang` ajouté à `_MAT_POOL.MS` (niveau où la notion d'ordinalité est introduite dans le programme officiel) avec `_matRang:2` dans le dictionnaire de phases (`PH`, IIFE de fin de fichier) — comportement identique aux autres exercices relationnels déjà en phase 2 (`_matAssocie`, `_matRanger`). PS et GS non touchés (hors périmètre du constat). (2) **AUD-02-038** : nouvelle fonction `_licenseUnlockHint(fig, fallback)` (10-figurines.js), qui recalcule le texte à partir des MÊMES données que `_isLicenseCompletionUnlocked()` (`FIGURINES.filter(f => f.uk===fig.uk && f.id!==fig.id && !f.completionLock)`), remplace la lecture de `fig.unlockHint` aux deux points d'affichage (boutique, `_renderFigurinesShop()`) et de refus d'achat (`buyFigurine()`) — les deux ne peuvent structurellement plus diverger, puisqu'ils partagent désormais le même calcul. Le champ `unlockHint` reste présent dans les données (pas de migration nécessaire) mais n'est plus lu par le code.

**Alternatives rejetées** : ajouter `_matRang` à PS et GS également, pas seulement MS (rejeté — hors périmètre du constat, qui demandait juste « au moins un niveau » ; MS est le niveau pédagogiquement le plus approprié pour introduire cette notion) ; supprimer purement et simplement le champ `unlockHint` des données (rejeté — suppression de données non nécessaire pour corriger le bug, et `unlockHint` reste un champ documentaire utile même non lu par le code actuel).

**Impact** : `js/13-maternelle.js` (`_MAT_POOL.MS`, dictionnaire `PH`), `js/10-figurines.js` (`_licenseUnlockHint`, `_renderFigurinesShop`, `buyFigurine`). v12.7.63. Tests : `tests/residual-content-lot33.test.js` (9 tests, dont un test « cœur du correctif » simulant l'ajout d'une figurine à une licence existante et vérifiant que le texte affiché s'actualise automatiquement). Note harnais : la vérification directe de `.ph` sur une fonction n'est pas possible dans le sandbox de test (l'IIFE source utilise `window[name]`, et `window` y est un stub séparé du contexte global, pas un alias comme dans un vrai navigateur — limite pré-existante, déjà documentée pour `_progSelfCheck()`, ADR-144) ; vérifié au niveau source à la place. 720/720 tests verts. Constats AUD-02-017 et AUD-02-038 (audit fonctionnel) clos par ce lot.

---

---

## ADR-150 — Lot 3.2 (audit fonctionnel AUD-02, Phase 3) : cohérence des règles secondaires du jeu

**Contexte** : trois constats sur des règles annexes du mode Combat/aventure. AUD-02-010 : potion (`useItem('potion')`) et pouvoir « heal » n'avaient aucun plafond de PV, tandis que l'événement aléatoire « Soin Magique » plafonnait à 8 (une valeur arbitraire, jamais atteignable en pratique) — incohérent avec la compétence achetable « Armure (+1❤️ max) », qui suggère l'existence d'un plafond de vie clair. AUD-02-012 : le mode Combat multijoueur affiche toujours 3/3 étoiles en fin de partie, sans passer par `computeStars()` — l'audit demandait de confirmer si ce comportement est un choix assumé ou un oubli. AUD-02-013 : en mort subite, `GS._noPVLossStreak` (compteur global de bonnes réponses consécutives, tous joueurs confondus) n'était pas explicitement remis à zéro au moment où le nombre de joueurs vivants passe de 3 à 2 — risque qu'un streak accumulé à 3 joueurs déclenche une mort subite immédiate dès l'élimination du 3e, sans vrai duel de 5 tours entre les 2 survivants.

**Décision** : (1) **AUD-02-010** : nouvelle fonction `_pvMax()` (01-core.js), point de vérité unique = `3+(P.skills.shield||0)` — déjà la formule utilisée pour l'initialisation de `GS.pv` (`resetGS()`) et des joueurs Combat, mais dupliquée à deux endroits et jamais réutilisée comme PLAFOND. Réutilisée désormais aux quatre sources de soin : potion, pouvoir « heal » (mode normal ET mode Combat, qui utilisait un `6` codé en dur — valeur numériquement déjà correcte, mais non dérivée), et l'événement « Soin Magique » (qui utilisait `8`, non dérivé). (2) **AUD-02-012** : **choix assumé, documenté ici, aucun changement de code.** Le mode Combat affiche systématiquement 3/3 étoiles en fin de partie par choix de valorisation collective — l'esprit du mode Combat est la compétition entre joueurs (classement, coups portés, combo), pas une notation individuelle par rapport à un barème de performance comme en mode solo ; passer par `computeStars()` pénaliserait arbitrairement le joueur éliminé en premier sur une mécanique (PV, élimination) sans rapport avec la qualité de ses réponses. (3) **AUD-02-013** : dans `validateCombat()`, au moment précis où une élimination fait passer `combatPlayers.filter(p=>p.alive).length` à exactement 2, `GS._noPVLossStreak` est désormais explicitement remis à 0 — garantie structurelle et non-incidente (indépendante de tout autre point de remise à zéro existant par ailleurs) que le streak de mort subite ne peut plus jamais provenir d'une période où 3 joueurs ou plus étaient encore en vie.

**Alternatives rejetées** (AUD-02-012) : aligner le mode Combat sur `computeStars()` (rejeté — changerait un comportement de jeu délibéré, la performance individuelle n'étant pas la métrique pertinente d'un mode fondamentalement compétitif/collectif ; l'audit lui-même qualifiait ce constat d'« Observation », pas d'anomalie confirmée) ; masquer complètement les étoiles en mode Combat plutôt que d'en afficher 3 fixes (rejeté — changement d'écran de fin plus large que nécessaire, alors que le choix actuel, une fois documenté, est cohérent avec l'esprit collectif du mode).

**Impact** : `js/01-core.js` (`_pvMax`, `resetGS`), `js/07-game.js` (`useItem`, `usePower`, `_startEvent` [effet `heal_all`], initialisation des joueurs Combat, `validateCombat`). v12.7.64. Tests : `tests/combat-rules-lot32-pv-cap-and-sudden-death.test.js` (8 tests, dont un vérifiant que le streak déclenche bien la mort subite au 5ᵉ tour d'un VRAI duel post-transition). 728/728 tests verts. Constats AUD-02-010 et AUD-02-013 (audit fonctionnel) clos par correctif ; AUD-02-012 clos par décision documentée (aucun changement de comportement).

---

---

## ADR-151 — AUD-02-019 (audit fonctionnel AUD-02, Phase 3) : décision de positionnement produit — jeu multi-matières assumé

**Contexte** : ce constat, unique de sa catégorie (« Vision produit », gravité Observation), n'est pas un bug mais une question de cadrage produit laissée implicite. Le positionnement affiché (`package.json`, `GUIDE-DU-DEPOT.md`) présentait historiquement le projet comme un « jeu de calcul mental », alors que le contenu réel comporte déjà deux moteurs de quiz disciplinaires complets et matures (`16-francais.js`, 1029 lignes ; `18-histoire.js`, 1213 lignes), et que `06a-adaptive.js` (`_PROG_SUBJ_LABEL`) prévoit déjà des libellés pour géographie, anglais, SVT et physique-chimie — sans qu'aucun générateur correspondant n'existe encore. L'audit demandait de trancher consciemment plutôt que de laisser cette dérive de scope se poursuivre sans décision assumée.

**Décision** : le produit est formellement acté comme un **jeu de révisions multi-matières pour la Maternelle au Collège**, dont le calcul mental reste le socle historique et le plus développé, mais qui intègre pleinement le français et l'histoire au même niveau d'exigence pédagogique (progression par phase, adaptativité, boss, figurines de récompense partagées). Le nom interne du dépôt (`odyssee-des-chiffres`) reste inchangé pour ne pas casser l'historique Git/déploiement/URLs, mais est désormais explicitement documenté comme un nom hérité, distinct du positionnement réel actuel. `package.json` (`description`) et `GUIDE-DU-DEPOT.md` (section « C'est quoi ? ») sont mis à jour en conséquence, avec un renvoi explicite vers ce ADR.

**Alternatives rejetées** : recentrer strictement le produit sur le calcul mental, en retirant ou isolant français/histoire de son périmètre « officiel » (rejeté — ces deux matières sont déjà pleinement développées, testées et utilisées ; un tel recentrage serait un changement de produit bien plus lourd que ce que ce constat, coté Observation/Faible, justifie) ; renommer le dépôt/projet interne pour refléter le nouveau positionnement (rejeté — coût opérationnel disproportionné, aucun bénéfice fonctionnel pour les familles, le nom interne n'étant de toute façon jamais affiché aux joueurs, qui voient « L'Odyssée du Savoir »).

**Impact** : `package.json` (`description`), `GUIDE-DU-DEPOT.md` (section « C'est quoi ? »). v12.7.65. Aucun changement fonctionnel — décision et documentation uniquement, conformément à l'effort « Faible (décision + documentation) » de l'audit. Constat AUD-02-019 (audit fonctionnel) clos par ce lot.

---

---

## ADR-152 — Lot 3.4 (audit fonctionnel AUD-02, Phase 3, dernier lot) : confort parental — dérogation horaire, résumé hebdo enrichi

**Contexte** : dernier lot du plan de remédiation, effort Moyen. AUD-02-033 : un enfant bloqué par les horaires n'avait aucun moyen, depuis son écran, de déclencher une dérogation ponctuelle — seule option, le parent modifiant manuellement les horaires, avec un risque réel d'oubli de les remettre ensuite. AUD-02-047 : le résumé hebdomadaire parent n'affichait qu'une métrique — les messages bloqués par le filtre de langage — sans aucune vision du reste de la vie sociale (amis, échanges) ; la vue « conversations » en lecture seule (« Voir → ») masquait en plus totalement les demandes d'amis en attente, visibles uniquement dans un panneau Options séparé que le parent devait savoir consulter.

**Décision** : (1) **AUD-02-033** : nouveau bouton « 🔓 Dérogation ponctuelle (code parent) » sur l'écran de blocage, déclenchant `requestTemporaryUnblock()` (06b-time-block.js) — réutilise `showPrompt()` (01-core.js, Lot 3.1) pour la saisie et `checkStoredPin()` (déjà utilisée ailleurs pour des re-saisies de code parent hors Vue Parent) pour la vérification. Un code correct pose un horodatage `blockOverrideUntil_<nom>` en localStorage (1 heure, choix délibéré : assez pour une session, jamais un contournement permanent) ; `isTimeBlocked()` le consulte en priorité, avant même la logique horaire existante — reste un « confort parental, pas un dispositif de sécurité », cohérent avec l'esprit déjà documenté de ce module. (2) **AUD-02-047, volet enrichissement** : nouvelle route `/msg/latest` étendue (paramètre optionnel `since`, renvoie `weekCount`, sans effet sur les appels existants qui l'omettent) et `friendList()` expose désormais `created` (date d'acceptation) sur les contacts — deux ajouts additifs, sans migration de schéma. Côté client, `_weeklySocialStats()`/`_fillWeeklySocialStats()` (17-messaging.js) calculent amis/nouveaux amis de la semaine/demandes en attente/messages échangés et remplissent un nouveau bloc `#wreport-social` dans `renderWeeklySummary()` (09-parent.js), en asynchrone après le rendu synchrone principal — même principe que `_renderOptMsgManage()`. (3) **AUD-02-047, volet unification des vues** : `renderContactsScreen()` affiche désormais les sections « Demandes reçues/envoyées/refusées » **même en mode lecture seule** (visualisation parentale) — seuls les boutons d'action (Accepter/Refuser/Annuler) restent réservés à l'enfant, qui reste seul décisionnaire de ses contacts. Un parent utilisant « Voir → » depuis le résumé hebdo n'a donc plus besoin de savoir se rendre dans un panneau Options distinct pour seulement CONSTATER une demande en attente.

**Alternatives rejetées** (033) : dérogation permanente jusqu'à réactivation manuelle du blocage (rejeté — recrée exactement le risque d'oubli que ce constat cherche à éviter) ; dérogation sans re-saisie de code (rejeté — casserait le contrôle parental lui-même, l'enfant pourrait se débloquer seul). (047) : calculer le volume de messages entièrement côté client en rejouant l'historique complet de chaque conversation (rejeté — coûteux en requêtes et en données transférées ; un compteur serveur dédié, néanmoins optionnel et rétrocompatible, est bien moins cher) ; fusionner complètement les deux écrans (résumé hebdo et panneau Options) en un seul (rejeté — portée largement supérieure à l'effort Moyen budgété ; l'unification demandée par l'audit portait sur la VISIBILITÉ des demandes, pas sur une refonte d'écran).

**Impact** : `js/06b-time-block.js` (`_blockOverrideActive`, `_blockOverrideKey`, `requestTemporaryUnblock`, `isTimeBlocked`), `index.html` (bouton dérogation), `js/17-messaging.js` (`_weeklySocialStats`, `_fillWeeklySocialStats`, `renderContactsScreen`), `js/09-parent.js` (`renderWeeklySummary`), `worker/odyssee-chat.js` (`msgLatest`, `friendList`). v12.7.66. Seuil de lint (`--max-warnings`) ajusté de 341 à 342 (avertissement attendu : `requestTemporaryUnblock`, appelée uniquement depuis l'`onclick` de `index.html`, invisible à l'analyse par fichier d'ESLint — même limite déjà documentée pour les autres fonctions de ce module). Tests : `tests/parental-comfort-lot34.test.js` (11 tests, client), `tests/worker-weekly-social-stats.test.js` (4 tests, worker via mock D1 étendu). 743/743 tests verts. Constats AUD-02-033 et AUD-02-047 (audit fonctionnel) clos par ce lot — **dernier lot du plan de remédiation en 4 phases de l'audit fonctionnel du 2026-09-21.**

---

---

---

## ADR-153 — AUD-05-007 (audit accessibilité 2026-09-25) : minuteur du mode Chrono, choix assumé, aucun changement de code

**Contexte** : l'audit accessibilité relève que `startChrono()` (`js/07-game.js:359-362`) impose un minuteur fixe de 60 secondes, non ajustable ni désactivable, alors que le mode Normal bénéficie déjà d'un réglage « Temps par question » (normal/×1,5/illimité, décision antérieure P1). WCAG 2.2.1 (Minutage ajustable) exige qu'un contenu limité dans le temps puisse être ajusté ou désactivé, sauf si le minutage est essentiel à l'activité et que le prolonger l'invaliderait — une exception documentée nulle part jusqu'ici pour ce mode.

**Décision** : **choix assumé, documenté ici, aucun changement de code.** Le mode « Chrono » a pour identité et pour seule mécanique de différenciation un temps limité assumé — c'est l'exception WCAG 2.2.1 qui s'applique explicitement (« le minutage est un élément essentiel de l'activité et le prolonger l'invaliderait »). Le mode Normal, qui possède déjà son propre réglage de temps ajustable/illimité, reste l'option pleinement accessible pour tout enfant ayant besoin de plus de temps ; le Chrono n'a pas vocation à devenir une variante de ce même mode sous un autre nom.

**Alternatives rejetées** : réutiliser `TIMER_SCALES` (normal/relaxed/unlimited) sur le mode Chrono, comme en mode Normal (rejeté — dénaturerait l'identité du mode pour tous les joueurs, et toucherait l'équilibrage du score/difficulté de ce mode spécifiquement calibré sur 60s, pour un effort et un risque disproportionnés par rapport au constat, coté Moyenne) ; masquer ou retirer le mode Chrono du choix proposé aux enfants ayant déclaré un besoin d'accessibilité (rejeté — aucun mécanisme de ce type n'existe ailleurs dans le jeu, et le mode Normal couvre déjà entièrement le besoin sans qu'il soit nécessaire de retirer une option à qui la choisit délibérément).

**Impact** : aucun fichier de code modifié. v12.8.6 (pas de bump de version, décision seule). Constat AUD-05-007 (audit accessibilité) clos par décision documentée — aucun changement de comportement.

## ADR-154 — Lot 1 (audit sécurité AUD-06, 2026-09-25) : XSS panneau Cloud, suppression de profil, verrou PIN, re-verrouillage Vue Parent

**Contexte** : l'audit de sécurité avancé (`Audit_securite_Odyssee_des_Chiffres_2026-09-25.docx`) a identifié 11 constats ; ce lot traite les 4 premiers (les plus simples côté code client, sans impact sur les Workers Cloudflare) :
- AUD-06-001 (🔴 CRITIQUE) : `_populateCloudPlayerSelect()` (`js/09-parent.js`) insérait le nom d'un profil dans `innerHTML` sans `esc()` — un nom contenant `"><svg onload=...>` exécutait du script dans la Vue Parent déverrouillée.
- AUD-06-002 (🟠 ÉLEVÉE) : `_pmConfirmDelete()` (bouton « Supprimer » du gestionnaire de profils) ne faisait que retirer le prénom du roster — `localStorage['user_'+nom]` et les données annexes (anniversaire, blocage horaire, journal, messagerie) restaient intactes indéfiniment, malgré une confirmation explicitement destructive.
- AUD-06-005 (🟡 MOYENNE) : le verrou anti-brute-force du PIN (5 tentatives / 30s) n'était appliqué que dans `checkPin()` (l'écran) — un appel direct de `checkStoredPin()`/`verifySecureValue()` depuis la console contournait entièrement le compteur.
- AUD-06-006 (🟡 MOYENNE) : le mode Parent déverrouillé ne se re-verrouillait jamais automatiquement — un retour à `v-parent` via la pile de navigation (`navBack()`) laissait l'écran déverrouillé sans nouvelle saisie du PIN.

**Décision** :
1. `esc()` appliqué aux deux insertions de `js/09-parent.js:_populateCloudPlayerSelect()` (alignement sur `optSelectProfile()`, déjà corrigée sous AUD-01-007).
2. `_pmConfirmDelete()` appelle désormais `_purgeChildData(n)` (purge déjà utilisée par `resetProfile()`, AUD-02-025) **et** `localStorage.removeItem('user_'+n)`.
3. Le verrou (`_pinLocked()`/`_pinRegisterAttempt()`, nouveaux) est déplacé DANS `verifySecureValue()` et le raccourci « aucun code défini » de `checkStoredPin()` (`js/01-core.js`) — point d'entrée le plus bas commun à tous les appelants (PIN principal, question secrète de récupération, blocage horaire, messagerie). `checkPin()`/`recoverParentPin()` (`js/09-parent.js`) simplifiés en consommateurs de cet état, sans plus le gérer eux-mêmes.
4. `showView(id)` (`js/01-core.js`) force désormais le voile PIN (`parent-lock` visible, `parent-content` masqué) à **chaque** entrée sur `'v-parent'`, quel que soit le chemin (`openParent()`, `navBack()`, `goHome()`) — choix retenu : re-verrouillage systématique, sans fenêtre de grâce (validé explicitement avec l'utilisateur plutôt que la solution alternative « re-verrouiller seulement au retour au menu »).

**Alternatives rejetées** : pour le point 4, une temporisation d'inactivité (re-verrouiller après N minutes sans interaction) — rejetée, plus complexe à implémenter et à tester qu'un re-verrouillage systématique à l'entrée, pour un bénéfice UX marginal dans ce contexte (le parent re-saisit un PIN à 4 chiffres, pas un mot de passe long).

**Impact** : `js/01-core.js`, `js/09-parent.js` modifiés. `tests/parent-pin-recovery-hardening.test.js` mis à jour (le test vérifiait au niveau source que `recoverParentPin()` gérait elle-même le compteur — vérifie désormais que `_pinRegisterAttempt()`/`verifySecureValue()`, dans `01-core.js`, le font). v12.8.6 → **v12.8.7** (`package.json` + `sw.js` `CACHE_VERSION`). Suite complète (743 tests) et lint (0 erreur, 340 warnings) verts après correctif. Constats AUD-06-001/002/005/006 clos.

## ADR-155 — Lot 2 (audit sécurité AUD-06, 2026-09-25) : effacement RGPD côté cloud, transfert de messagerie sécurisé, validation de code resserrée

**Contexte** : suite du Lot 1 (ADR-154), portant cette fois sur les 2 Workers Cloudflare :
- AUD-06-003 (🟠 ÉLEVÉE) : aucune route ne permettait d'effacer les données côté cloud (KV `odyssee-sync`) ni le compte de messagerie (D1 `odyssee-chat`) — l'endpoint DELETE d'`odyssee-sync` avait été retiré sous AUD-01-002 faute d'appelant légitime, sans qu'une alternative sécurisée soit réintroduite. Une suppression locale de profil (même complète depuis le Lot 1) laissait donc les données enfant orphelines indéfiniment côté serveur.
- AUD-06-004 (🟡 MOYENNE) : le transfert manuel d'identité de messagerie entre appareils (`chatExportIdentityCode()`/`chatImportIdentityCode()`, `js/17-messaging.js`) encodait id+secret en Base64 — réversible sans clé par quiconque interceptait le « code » (capture d'écran, mauvais copier-coller).
- AUD-06-008 (🟢 FAIBLE) : `isValidCode()` (`worker/odyssee-sync.js`) acceptait des codes dès 4 caractères, plus permissif que le format réellement généré côté client (6 caractères aléatoires CSPRNG + préfixe).

**Décision** :
1. `DELETE /profile/:code` réintroduit dans `odyssee-sync.js`, authentifié par le même `code` que GET/POST (pas plus de surface d'attaque que l'existant). `js/12-cloud.js` expose `_cloudDeleteProfile(code)`.
2. `/account/delete` ajouté à `odyssee-chat.js` (authentifié par `id`+`secret`, comme toutes les autres routes) : purge `messages`, `reads`, `contacts`, `blocks`, `transfers` et la ligne `users` du compte. `js/17-messaging.js` expose `_chatDeleteAccountForProfile(name)`.
3. `_pmConfirmDelete()` (`js/09-parent.js`, bouton « Supprimer » de la Vue Parent) appelle désormais ces deux fonctions **avant** la purge locale (AUD-06-002, Lot 1) — best-effort : un échec réseau ne bloque jamais la suppression locale.
4. `/transfer/create` + `/transfer/claim` ajoutés à `odyssee-chat.js`, nouvelle table D1 `transfers` (`worker/schema.sql` pour les bases neuves, `worker/migration-transfers.sql` pour la base réelle) : jeton aléatoire à usage unique, valable 10 minutes, qui donne accès une seule fois à l'identité réelle (`id`+`secret`) — remplace le Base64 dans `chatExportIdentityCode()`/`chatImportIdentityCode()`.
5. `isValidCode()` (`odyssee-sync.js`) et son miroir client `isValidCloudCode()` (`js/12-cloud.js`) resserrés à 8 caractères minimum.

**Alternatives rejetées** : pour le point 4, une purge/rotation périodique automatique du secret plutôt qu'un jeton de transfert dédié — rejetée, ne résout pas le problème initial (le secret réel reste affiché/copié quelque part au moment du transfert lui-même) ; pour le point 1, une confirmation supplémentaire côté client avant DELETE (au-delà de la confirmation « retaper le prénom » déjà existante pour la suppression locale) — jugée redondante, la suppression cloud étant déclenchée par la même action utilisateur déjà confirmée.

**Impact** : `worker/odyssee-sync.js`, `worker/odyssee-chat.js`, `worker/schema.sql` modifiés ; `worker/migration-transfers.sql` créé. `js/09-parent.js`, `js/12-cloud.js`, `js/17-messaging.js` modifiés côté client. v12.8.7 → **v12.8.8** (`package.json` + `sw.js` `CACHE_VERSION`). Suite complète (743 tests) et lint (0 erreur, 340 warnings) verts. **Déploiement manuel requis** (`worker/DEPLOY.md`) avant que ce lot soit fonctionnel en production : exécuter `migration-transfers.sql` puis redéployer les deux Workers — sans quoi le client appelle des routes qui n'existent pas encore côté serveur (dégradation silencieuse déjà vérifiée : la suppression locale et le message d'erreur du transfert restent corrects, seule la partie serveur est inopérante). Constats AUD-06-003/004/008 clos (sous réserve du déploiement).

## ADR-156 — Lot 3 (audit sécurité AUD-06, 2026-09-25) : journalisation, hygiène de déploiement, décisions documentées

**Contexte** : derniers constats de l'audit sécurité, faible effort chacun :
- AUD-06-007 (🟢 FAIBLE) : `_diagLog()` (`js/12-cloud.js`) journalisait le `cloudCode` en clair (console + `sessionStorage['_syncDiag']`), inconditionnellement, indépendamment du flag `CLOUD_VERBOSE`.
- AUD-06-010 (🔵 OBSERVATION) : `debug.html` et `worker/test-worker.html` restent accessibles publiquement (Cloudflare Pages sert par défaut tout le dépôt, aucune exclusion configurée).
- AUD-06-009 (🔵 OBSERVATION) : pas de cloisonnement entre profils enfants sur un même appareil — déjà un choix assumé, documenté en commentaire dans `js/06b-time-block.js` (« fail-open, confort parental, pas un dispositif de sécurité »), jamais formalisé en ADR.
- AUD-06-011 (🔵 OBSERVATION) : pas de protection anti-bot sur le jeu — pas d'enjeu compétitif/économique identifié dans ce contexte.

**Décision** :
1. `_redactCloudCodes()` ajoutée dans `js/12-cloud.js`, appliquée dans `_diagLog()` : masque partiellement (garde 2 premiers + 2 derniers caractères du suffixe) tout token au format `PREFIX-XXXXXX` avant écriture — plutôt qu'une suppression totale du diagnostic (qui sert aussi de support à distance via `getSyncDiag()`, où vérifier visuellement "le bon code a été tapé" reste utile) ou qu'une simple dépendance à `CLOUD_VERBOSE` (qui aurait coupé tout le diagnostic, pas seulement la donnée sensible).
2. `_redirects` créé à la racine : `/worker/*` renvoie `index.html` avec un code HTTP 404, sans supprimer les fichiers du dépôt (`worker/test-worker.html` reste utile comme outil de test manuel après modification d'`odyssee-chat.js`, documenté dans `Audit_technique_Odyssee_des_Chiffres_2026-09-21.md`). `debug.html` reste servi tel quel (déjà protégé par le PIN parental depuis un correctif antérieur V8, outil de diagnostic à distance utile).
3. AUD-06-009 : décision actée ici, aucun changement de code — l'absence de cloisonnement entre profils est un choix architectural cohérent avec le positionnement du projet (application 100% locale, sans backend d'autorisation par profil, cf. CLAUDE.md section 2).
4. AUD-06-011 : aucune action — à réévaluer uniquement si un classement social ou multijoueur en ligne était ajouté à l'avenir.

**Alternatives rejetées** : pour le point 1, suppression complète des lignes contenant `cloudCode` — rejetée, aurait dégradé l'utilité du diagnostic de support sans réduire le risque de façon significative (le masquage partiel suffit à empêcher la réutilisation directe par un tiers qui lirait la console). Pour le point 2, bloquer aussi `debug.html` — rejetée, outil de diagnostic à distance encore utilisé et déjà protégé par PIN, contrairement à `test-worker.html` qui n'a aucun usage en production.

**Impact** : `js/12-cloud.js` modifié, `_redirects` créé à la racine. v12.8.8 → **v12.8.9** (`package.json` + `sw.js` `CACHE_VERSION`). Suite complète (743 tests) et lint (0 erreur, 340 warnings) verts. Vérifié en navigateur réel : `cloudCode=TESTINE-AB3K9X` devient `cloudCode=TESTINE-AB**9X` dans `sessionStorage['_syncDiag']`. Les 11 constats de l'audit sécurité AUD-06 (2026-09-25) sont désormais tous traités (Lots 1, 2, 3).

## ADR-157 — Ménage lint post-audit (2026-09-25) : `no-useless-escape` et `no-var`, un piège vm découvert

**Contexte** : demande explicite de nettoyer les warnings ESLint restants (hors périmètre de l'audit AUD-06) : 7 `no-useless-escape` (échappement `\/`/`\-` inutile dans des classes de caractères de regex) et 29 `no-var`.

**Décision** :
1. Les 7 `no-useless-escape` corrigés sans risque (`js/05-profile.js`, `js/06a-adaptive.js` ×3, `js/07-game.js`, `js/08-ui.js`, `js/09-parent.js`) — retrait d'un backslash devant `/` ou `-` à l'intérieur d'une classe `[...]`, où il ne change strictement rien au comportement de la regex (confirmé par ESLint lui-même : cette règle ne signale que des échappements prouvés inutiles).
2. 27 des 29 `no-var` convertis en `let`/`const` selon qu'ils sont réassignés ou non (`js/07-game.js`, `js/08-ui.js`, `js/09-parent.js`, `js/17-messaging.js`) — vérifié au préalable qu'aucun code ne les référence via `window.<nom>` (recherche exhaustive, aucune occurrence).
3. **2 exceptions gardées en `var`, découvertes par régression** : `_msgProf`/`_msgReadOnly` (`js/17-messaging.js`). `tests/helpers/loadGame.js` (`setMsgProf()`) les réassigne depuis l'extérieur du bac à sable `vm` via `globalThis._msgProf = ...` — ce mécanisme ne fonctionne qu'avec `var` (qui crée une propriété sur l'objet global du contexte `vm`, contextifié à partir de l'objet `sandbox`) ; `let`/`const` créent une liaison lexicale séparée, invisible à cette écriture externe. Conséquence concrète observée : 6 tests plantaient avec `TypeError: Cannot read properties of null (reading 'chatId')`, `_msgProf` interne restant `null` malgré l'assignation externe réussie sur la propriété `globalThis._msgProf` (deux emplacements de stockage différents, silencieusement divergents).

**Alternatives rejetées** : convertir `_msgProf`/`_msgReadOnly` en `let` et adapter `setMsgProf()` pour écrire ailleurs (ex. un objet d'état exposé) — rejeté ici, hors périmètre d'un ménage lint cosmétique ; à reconsidérer si `17-messaging.js` est un jour restructuré plus en profondeur.

**Portée générale de la découverte** : tout futur `var`→`let`/`const` sur une variable de module doit désormais être vérifié aussi contre `tests/helpers/loadGame.js` (recherche `globalThis.<nom>\s*=`), en plus de la recherche `window.<nom>` déjà réflexe — pas seulement contre le code applicatif.

**Impact** : `js/05-profile.js`, `js/06a-adaptive.js`, `js/07-game.js`, `js/08-ui.js`, `js/09-parent.js`, `js/17-messaging.js` modifiés. v12.8.9 → **v12.8.10** (`package.json` + `sw.js` `CACHE_VERSION`). Lint : 340 → 303 warnings (0 erreur, seuil `--max-warnings` inchangé à 344). Suite complète (743 tests) verte après correction de la régression découverte.

---

## ADR-158 — Lot A (audit performances AUD-07, 2026-09-26) : scalabilité messagerie D1 — résumé indexé, idempotence, rate-limit par compte

**Contexte** : l'audit performances/scalabilité/résilience (2026-09-26) a identifié une chaîne de risques concentrée sur `worker/odyssee-chat.js` : `msgLatest()` scannait l'intégralité de la table `messages` pour la moitié des conversations (LIKE avec wildcard en tête, non indexable — AUD-07-010) ; cette même table ne disposait d'aucune purge (AUD-07-011) ; l'envoi de message n'avait aucune protection contre une duplication après un timeout client (AUD-07-006) ; le rate-limiting (`odyssee-chat.js` et `odyssee-sync.js`) est calibré par IP pour un usage familial (~15 utilisateurs/IP), incompatible avec une IP partagée d'établissement scolaire (AUD-07-008) ; `friendList()` enchaînait 5 requêtes D1 séquentielles sans raison (AUD-07-012).

**Décision** :
1. Nouvelle table `conv_summary(conv, participant_a, participant_b, last_id, last_ts)`, indexée sur chaque participant, tenue à jour à chaque `msgSend()`. `msgLatest()` l'interroge désormais au lieu de scanner `messages` ; le calcul de `weekCount` filtre par égalité exacte sur `conv IN (...)` (indexable) plutôt que par LIKE. Migration : `worker/migration-conv-summary.sql` (avec backfill des conversations déjà existantes).
2. Purge des messages de plus de 2 ans, via un handler `scheduled()` du Worker déclenché par un Cron Trigger Cloudflare (`wrangler.toml`, `[triggers] crons`) — configuration manuelle du Cron Trigger requise côté dashboard si le Worker est déployé sans `wrangler deploy` (voir `DEPLOY.md`).
3. Colonne `tmp_id` sur `messages` (index unique partiel `(sender, tmp_id) WHERE tmp_id IS NOT NULL`) : le client (`js/17-messaging.js`) génère un identifiant à la création d'un message et le réutilise pour tout renvoi automatique (file d'attente hors-ligne) ; `msgSend()` détecte un `tmp_id` déjà inséré et renvoie le même résultat au lieu de dupliquer. Migration : `worker/migration-msg-tmpid.sql`.
4. Rate-limiting généralisé à une clé quelconque (plus seulement une IP) dans les deux Workers ; ajout d'une limite par COMPTE authentifié (`msgSend`/`msgFetch`/`msgLatest` côté chat, GET/POST `/profile/` côté sync), en complément — jamais en remplacement — de la limite par IP existante.
5. `friendList()` : les 5 requêtes D1 indépendantes sont lancées via `Promise.all` plutôt qu'en séquence.

**Alternative rejetée pour la purge** : conditionner la suppression à l'inactivité de la conversation (pas seulement à l'âge du message) — jugée disproportionnée pour ce lot ; la purge inconditionnelle par âge (2 ans) est plus simple à vérifier et suffisante pour l'objectif (borner la croissance de la table).

**Conséquence** : `worker/odyssee-chat.js`, `worker/odyssee-sync.js`, `worker/schema.sql`, `js/17-messaging.js`, `tests/helpers/fakeD1.js` modifiés ; 2 nouveaux fichiers de migration à rejouer manuellement sur la base D1 réelle AVANT redéploiement du Worker (voir `DEPLOY.md`), ainsi qu'un Cron Trigger à configurer une fois. v12.8.10 → **v12.8.11**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

---

## ADR-159 — Lot B (audit performances AUD-07, 2026-09-26) : reconciliation cloud immédiate, limites Free documentées, dégradation gracieuse messagerie, observabilité des échecs silencieux

**Contexte** : suite du lot A. AUD-07-007 (conflit de synchro cloud) a été réévalué à la baisse en cours de lot : `js/12-cloud.js` dispose déjà d'un système de fusion non destructif (`_mergeCloudProfiles`, ~30 règles, ADR-97/98/99/111/112/113) appliqué même après un rejet serveur (`_importProfileFromServer` refusionne systématiquement avec `P` courant) — aucune perte de données réelle, contrairement à ce que l'audit initial (lecture isolée du seul code serveur) avait supposé. Le seul résidu identifié : le profil fusionné correct restait local jusqu'au prochain cycle de sync (5 min) avant que le serveur ne le reflète aussi. AUD-07-009 (limites D1/Workers non documentées), AUD-07-014 (aucune dégradation gracieuse de la messagerie si le Worker/D1 est indisponible) et AUD-07-015 (`catch(e){}` vides sur des échecs pertinents) traités tels quels.

**Décision** :
1. `pushProfileToCloud()` : après un conflit résolu et fusionné en local, re-push immédiat (une seule fois, non récursif) au lieu d'attendre le cycle programmé — ferme le résidu identifié ci-dessus.
2. `worker/DEPLOY.md` : nouvelle section documentant les limites du plan Cloudflare Free (Workers 100 000 req/j, D1 5M lectures/100k écritures/j, KV 1000 écritures/j) et une estimation chiffrée du point de rupture (~95 enfants actifs/jour avec 1h de messagerie chacun, limité par le quota Workers — pas D1).
3. `js/17-messaging.js` : cache local (`localStorage`, 50 messages/conversation) des derniers messages connus par conversation, affiché avec un état explicite si le Worker/D1 est indisponible à l'ouverture, au lieu d'un blocage total — la messagerie était la seule fonctionnalité sociale du produit sans aucun repli hors-ligne.
4. 6 `catch(e){}` vides désormais loggés (`console.error`/`console.warn`, comportement fonctionnel inchangé) : purge des jetons de transfert expirés et parsing d'un profil KV corrompu (Workers), écriture `lastPlayer`/`addToRoster` après restauration cloud et 3 migrations de `renameProfile()` (client), auto-diagnostic `_progSelfCheck()` des pools de questions.

**Écarté** : 2 `catch(e){}` sur `_MP.io.disconnect()` (`js/07-map.js:3119,3218`) initialement signalés par l'exploration comme un "canal multijoueur réseau" — vérification faite, `_MP` est le parallax de la carte principale et `.io` un `IntersectionObserver` local, aucun réseau impliqué. Risque quasi nul (`.disconnect()` d'un `IntersectionObserver` ne lève pratiquement jamais), hors du périmètre résilience réseau/backend visé par ce constat — laissés tels quels plutôt que de coder un correctif sans valeur réelle.

**Conséquence** : `js/12-cloud.js`, `js/17-messaging.js`, `js/09-parent.js`, `js/06a-adaptive.js`, `worker/odyssee-chat.js`, `worker/odyssee-sync.js`, `worker/DEPLOY.md` modifiés. v12.8.11 → **v12.8.12**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

---

## ADR-160 — Lot C (audit performances AUD-07, 2026-09-26) : debounce + pagination sur le rendu figurines, AUD-07-017 invalidé

**Contexte** : suite du lot B. AUD-07-017 (écritures localStorage hors `validateProfile()`) a été réévalué à la baisse en cours de lot, comme AUD-07-007 avant lui : vérification des 7 emplacements cités — 2 des 3 dans `js/10-figurines.js` appellent déjà `validateProfile()` ; les 5 restants (`resetAdventure`, `toggleCalmMode`, `toggleDyslexiaFont`, `saveHomework`, `clearHomework`) ne touchent jamais les tableaux non bornés (`history`/`errors`/`chatFlags`) visés par le constat — aucun risque réel de croissance. Non traité : router ces écritures par `validateProfile()` (liste blanche de champs) aurait risqué de supprimer silencieusement `photo`/`playerCode`, absents de cette liste — un vrai risque de régression pour un problème qui n'existe pas.

AUD-07-003 (filtre/tri/comptage recalculés à chaque frappe) et AUD-07-004 (reconstruction DOM complète, jusqu'à ~482 cartes) traités tels quels.

**Décision** :
1. Debounce (200ms) sur les 2 barres de recherche du catalogue de figurines (`js/10-figurines.js` boutique, `js/09-parent.js` gestion parent) — `_shopOnSearchInput`/`_pfigOnSearchInput`.
2. `js/10-figurines.js` (boutique, `_renderFigurinesShop`) : mémoïsation du résultat filtré/trié (clé = filtre+recherche+tri+nombre de figurines possédées), pagination par lots de 60 avec bouton "Afficher plus" au lieu de construire les ~482 cartes d'un coup.
3. `js/10-figurines.js` (collection, `renderFigCollection`, vue "Tout") : même pagination, pour les collectionneurs avancés possédant beaucoup de figurines.

**Vérifié en navigateur** (`preview_start` + `javascript_tool`, profil réel, 477 figurines catalogue) : chargement initial de la boutique = 60 cartes + bouton "Afficher plus (422 restantes)" ; clic sur le bouton → 120 cartes ; frappe dans la recherche → grille inchangée immédiatement, filtrée après le délai de debounce (2 résultats sur "goku"). Aucune erreur console.

**Conséquence** : `js/10-figurines.js`, `js/09-parent.js`, `index.html` modifiés. v12.8.12 → **v12.8.13**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

---

## ADR-161 — Lot D (audit performances AUD-07, 2026-09-26) : Service Worker stale-while-revalidate pour le code, filet de chargement complété

**Contexte** : suite du lot C. AUD-07-002 (network-first systématique sur JS/CSS), AUD-07-016 (filet de 8s de `js/11-init.js` qui révèle l'app sans vérifier son intégrité si `window.onload` n'a jamais eu l'occasion de se déclencher) et AUD-07-023 (commentaire `sw.js` obsolète) traités. AUD-07-001 (scission de `07-story.js`, chargement différé du contenu narratif) explicitement reporté après le lot E — chantier lourd, mieux vérifiable une fois un outil de mesure de performance en place (AUD-07-018).

**Décision** :
1. `sw.js` : le cas spécial "network-first" pour CSS/JS/webmanifest/JSON est retiré — ces fichiers passent désormais par la même stratégie stale-while-revalidate déjà utilisée pour les images/fonts (cache servi immédiatement, revalidation réseau en arrière-plan). La fraîcheur reste garantie par le `CACHE_NAME` versionné (`CACHE_VERSION`, déjà bumpée à chaque livraison fonctionnelle, CLAUDE.md) et par la notification `SW_UPDATED` déjà câblée côté client (bandeau "Nouvelle version disponible").
2. `js/11-init.js` : le filet indépendant de 8s (`waitReadyThen`, déjà présent — pas un nouveau mécanisme) appelle désormais `_bootSanityCheck()` avant de révéler l'app si `window._appReady` n'est jamais devenu vrai, pour afficher le bandeau d'erreur explicite plutôt qu'un écran potentiellement cassé sans message.
3. `sw.js` : commentaire de poids du précache mis à jour (3,02 Mo, v12.8.13).

**Vérifié en navigateur** (`preview_start`) : nouveau cache `odyssee-v12.8.14` créé au chargement, bandeau "Nouvelle version disponible" affiché et fonctionnel (clic → ancien cache purgé, app sur la nouvelle version), aucune erreur console.

**Conséquence** : `sw.js`, `js/11-init.js` modifiés. v12.8.13 → **v12.8.14**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

---

## ADR-162 — Lot E (audit performances AUD-07, 2026-09-26) : mesure de performance réelle, backoff du polling messagerie, nettoyage innerHTML

**Contexte** : dernier lot codable de l'audit AUD-07. AUD-07-019/020/021 (croissance du catalogue, poids de profil, boucles RAF en combat) restent des observations documentées sans action de code possible sans mesure empirique sur appareil réel — non traités, volontairement.

**Décision** :
1. `js/01-core.js` : instrumentation Core Web Vitals natifs (`PerformanceObserver`, zéro dépendance) — LCP, CLS, INP (approximé via l'Event Timing API). Stocké en `localStorage` (20 dernières sessions), consultable via `_perfReport()` depuis la console. Aucune télémétrie envoyée : c'est un outil de diagnostic local, pas un système de collecte en production (aucune infrastructure pour ça).
2. `js/17-messaging.js` : les deux boucles de polling (conversation 4s, badges 25s) passent d'un `setInterval` fixe à un `setTimeout` auto-replanifié avec backoff exponentiel (doublement de l'intervalle par échec consécutif, plafonné à 60s/120s), retour immédiat à la cadence normale au premier succès. `_convFetch()` et `chatRefreshBadges()`/`chatSyncTick()` renvoient désormais explicitement un booléen de succès pour piloter ce backoff.
3. `js/07-game.js` : les 2 `innerHTML +=` de fin de partie remplacés par `insertAdjacentHTML('beforeend', ...)`, qui ajoute sans relire/réécrire le contenu déjà présent.

**Vérifié en navigateur** (`preview_start`, onglet neuf) : `_perfReport()` renvoie des métriques réelles mesurées (LCP/CLS capturés dès le chargement), fonctions de polling (`_startConvPoll`, `chatStartBadgePoll`) présentes et saines, aucune erreur console.

**Conséquence** : `js/01-core.js`, `js/17-messaging.js`, `js/07-game.js` modifiés. Nouvelles globales ajoutées → `npm run sync:test-api` exécuté (1940 entrées régénérées dans `.eslintrc.json`/`tests/helpers/loadGame.js`). v12.8.14 → **v12.8.15**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

Ceci clôt les lots codables de l'audit AUD-07 (Phases 0-2 de son plan de remédiation). Reste en suspens, à reconsidérer maintenant qu'un outil de mesure existe : AUD-07-001 (scission de `07-story.js`, Phase 3 de l'audit).

---

## ADR-163 — Lot F (audit performances AUD-07, 2026-09-26) : chargement différé de 07-story.js (AUD-07-001)

**Contexte** : dernier point de l'audit AUD-07, explicitement reporté après les lots A-E (voir ADR-158 à ADR-162) faute d'outil de mesure. Mesure réelle non concluante en pratique (LCP non mesurable proprement depuis l'environnement de dev disponible pour cette session, cache navigateur de l'outil de test non représentatif — voir discussion en session), décision prise sur la seule base du poids déjà connu (632 Ko, en croissance continue, ADR-54) plutôt que d'attendre indéfiniment une mesure.

**Découverte en creusant** : l'étape 1 du plan ADR-54 (extraction des helpers structurels `_regionOfZone`/`_zonesOfRegion` vers `07-story-core.js`) avait déjà été faite lors d'une conversation antérieure. `07-story.js` ne contient pas QUE du texte narratif : aussi les données de zones/régions des variantes Français/Histoire (`MAT_ZONES_FR`, `COL_ZONES_FR`, etc.) — `startAdventure()` (`07-map.js`) est le SEUL point d'entrée réel vers ce fichier (3 sites d'appel).

**Décision** :
1. `sw.js` : `07-story.js` retiré de `CRITICAL_URLS` (bloquant le premier écran), ajouté à `OPTIONAL_URLS` (précaché à l'installation pour le hors-ligne, sans bloquer).
2. `index.html` : `<script defer src="js/07-story.js">` retiré.
3. `js/07-story-core.js` : nouvelle fonction `_ensureStoryLoaded()` — injecte dynamiquement `<script src="js/07-story.js">`, résout immédiatement si déjà chargé (détecté via `typeof _STORY`).
4. `js/11-init.js` (`window.onload`) : déclenche `_ensureStoryLoaded()` en arrière-plan (fire-and-forget), tôt mais pas au tout premier tick — et retire `'07-story': ['_storyText']` de `_bootSanityCheck()` (son absence à ce stade est désormais normale).
5. `js/07-map.js` : `startAdventure()`/`continueAdventure()` restent **synchrones** (important) — si `_STORY` n'est pas encore défini, la fonction se relance elle-même une fois `_ensureStoryLoaded()` résolu, au lieu de devenir `async`.

**Alternative essayée puis rejetée** : rendre `startAdventure()`/`continueAdventure()` `async` avec `await _ensureStoryLoaded()`. Cassait 304 tests — le harnais de test (`tests/helpers/loadGame.js`) concatène tous les fichiers d'un test en UN SEUL script `vm` ; `typeof _STORY` au chargement d'un module qui n'a pas encore atteint la déclaration `let _STORY` (plus loin dans ce même script concaténé) lève `ReferenceError` (zone morte temporelle), contrairement à un vrai navigateur où chaque `<script>` non chargé laisse l'identifiant simplement non déclaré. La version synchrone avec relance interne évite complètement ce piège (identique au comportement existant dans le cas courant où le fichier est déjà chargé, y compris dans TOUS les tests) et ne nécessite de gérer l'attente que dans le cas réel rare (réseau lent).

**Vérifié en navigateur** (`preview_start`, contournement du cache tenace de l'outil de test via injection de contenu fraîchement récupéré) : `_ensureStoryLoaded()` charge bien `07-story.js` dynamiquement, `_STORY` passe de `undefined` à un objet peuplé, `startAdventure('mat', true)` fonctionne normalement une fois chargé (30 zones, story correcte, `GM.adventure` posé).

**Conséquence** : `sw.js`, `index.html`, `js/07-story-core.js`, `js/07-map.js`, `js/11-init.js` modifiés. Poids du précache critique : 3,02 → **2,42 Mo** (retrait des 630 Ko de contenu narratif du chemin bloquant). `npm run sync:test-api` exécuté (nouvelle globale `_ensureStoryLoaded`). v12.8.15 → **v12.8.16**. Suite complète (743 tests) verte, lint inchangé (0 erreur, 303 warnings).

Ceci clôt l'intégralité de l'audit performances AUD-07 (23 constats : traités, invalidés à la relecture avec justification, ou documentés comme observations sans action de code possible).

---

---

## ADR-164 — Lot 1 (audit cohérence globale AUD-09, 2026-09-26) : séquencement des audits documenté, nom de package conservé, `format` non destructif par défaut

**Contexte** : AUD-09 (audit de cohérence globale) constate que 4 des 8 audits sectoriels (fonctionnel AUD-02, sécurité AUD-06, performances AUD-07, qualité perçue AUD-08) ont été intégralement traités et vérifiés, alors que 3 autres (technique AUD-01, ergonomique AUD-03, graphique AUD-04) n'ont fait l'objet d'aucun lot de correction — dont un P0 (AUD-03-012 : fenêtre de choix d'objectif du jour sans issue tactile) et un P1 (AUD-04-001 : trois langages visuels concurrents) toujours ouverts. Rien ne documentait ce séquencement (AUD-09-001), ni le décalage entre le nom de package `odyssee-des-chiffres` et le repositionnement multi-matières déjà acté en ADR-151 (AUD-09-002), ni le risque de `npm run format` destructif par défaut sur un code dont l'indentation réelle ne suit pas la convention Prettier (AUD-09-008).

**Décision** :
1. Séquencement audits : assumé rétroactivement — sécurité, fonctionnel et performances traités en priorité car directement actionnables par du code/tests vérifiables, ergonomie/graphisme/technique reportés car nécessitant des arbitrages de design assumés côté humain. **AUD-01 (technique), AUD-03 (ergonomique) et AUD-04 (graphique) sont replanifiés en priorité immédiate après ce lot 1**, en commençant par leurs points P0/P1 (AUD-03-012, AUD-04-001).
2. `package.json` : nom `odyssee-des-chiffres` **conservé** (renommage écarté — lien historique avec le nom du dépôt Git et risque de casse d'URLs/outillage jugé disproportionné pour un gain cosmétique). Décision documentée ici plutôt qu'un renommage silencieux.
3. `package.json` : `format` devient `prettier --check` (non destructif, nouveau défaut) ; l'ancien comportement destructif est déplacé vers `format:write`, à lancer uniquement de façon volontaire et validée.
4. `CLAUDE.md` §5 mis à jour pour refléter l'état réel des 9 audits (pas seulement le fonctionnel).

**Conséquence** : `package.json`, `CLAUDE.md` modifiés. Aucun changement fonctionnel (doc/tooling) → pas de bump de version ni de `CACHE_VERSION` (règle CLAUDE.md §7 limitée aux changements fonctionnels livrés). Suite de tests non affectée (aucun fichier `js/*.js` touché).

---

---

## ADR-165 — Lot 2 (audit cohérence globale AUD-09, 2026-09-26) : AUD-09-005/AUD-09-007 invalidés à la vérification

**Contexte** : AUD-09-005 affirmait qu'un commentaire de code citant AUD-05-006 (erreur de code parent non annoncée aux lecteurs d'écran) n'était suivi d'aucun correctif réel. AUD-09-007 affirmait que ce même parcours restait fragile côté contraste (AUD-05-004, texte blanc sur boutons QCM bleu/vert).

**Vérification effectuée avant tout codage** (superpowers:systematic-debugging) :
1. `js/09-parent.js:40-43` (`checkPin()`) : un appel `toast('❌ Code incorrect, réessaie.', 2500)` est bien présent en plus du changement de placeholder, avec commentaire citant explicitement AUD-05-006. `#toast` (`index.html:173`) porte `role="status" aria-live="polite"`. **AUD-05-006 et AUD-09-005 sont donc déjà corrigés** — le constat AUD-09-005 se trompait en lisant le commentaire sans voir l'appel `toast()` juste au-dessus.
2. `css/styles.css:78` (`button`, texte `#fff`) sur `.qcm-btn` (`background:#1f6391`) et `.qcm-btn.correct` (`background:#1e8449`, `css/styles.css:201-202`) : calcul de contraste WCAG 2.1 direct → **6,46:1** (blanc/bleu) et **4,72:1** (blanc/vert), les deux au-dessus du seuil AA texte normal (4,5:1). **AUD-05-004 et AUD-09-007 sont donc invalidés** sur les couleurs actuelles — pas de bug de contraste actif sur ce composant.

**Décision** : classer AUD-05-004, AUD-05-006, AUD-09-005 et AUD-09-007 comme invalidés (non reproductibles avec le code actuel), plutôt que de coder un correctif inutile sur un problème déjà résolu ou jamais avéré. Aucune modification de code.

**Conséquence** : aucun fichier `js/*.js` ou `css/*.css` modifié. Pas de bump de version. Reste ouvert dans AUD-05 : AUD-05-001/002/003/005/008/009/010 (non concernés par cette vérification).

---

---

## ADR-166 — Lot 3 (audit cohérence globale AUD-09, 2026-09-26) : garde-fou automatisé sur le drift des tokens CSS (AUD-09-003)

**Contexte** : CLAUDE.md §4 documente la règle « vérifier les tokens existants avant d'écrire une nouvelle valeur de rayon/ombre en CSS », sans aucun contrôle automatisé. AUD-04-003/004 (audit graphique, jamais traité — voir ADR-164) mesuraient déjà une dérive significative ; AUD-09-003 confirme et chiffre le problème pour `border-radius` (84 valeurs brutes) puis, mesure plus précise via regex plutôt que grep manuel, pour `box-shadow` (135 valeurs brutes, bien plus que les 102 estimés à l'oral dans AUD-09).

**Décision** : nouveau script `scripts/check-css-tokens.mjs` (même esprit que `check-test-filenames.mjs`, ADR-85) — compte les déclarations `border-radius`/`box-shadow` en valeur brute dans `css/styles.css` et échoue si ce compte **augmente** par rapport à la référence figée ici (84 / 135). N'importe pas de nouvelle dépendance (pas de stylelint, cohérent avec CLAUDE.md §2 « devDependencies uniquement »). Ne bloque pas la dette déjà présente (chantier de fond réservé à AUD-04-003/004, hors scope de ce lot) — bloque seulement son aggravation. Commande manuelle `npm run check:css-tokens`, non branchée en `pretest` (cohérent avec `check:test-filenames`, lui aussi manuel à ce jour).

**Conséquence** : `scripts/check-css-tokens.mjs` créé, `package.json` et `CLAUDE.md` §6 mis à jour. Aucun fichier `js/*.js` ou `css/*.css` modifié — pas de bump de version. La baseline (84/135) ne doit baisser qu'en traitant réellement AUD-04-003/004, jamais en assouplissant ce script.

---

---

## ADR-167 — Lot 4 (audit cohérence globale AUD-09, 2026-09-26) : AUD-09-004 invalidé à la vérification

**Contexte** : AUD-09-004 affirmait deux angles morts qualité simultanés en CI — (1) le lint ne pourrait jamais faire échouer le pipeline (reprenant AUD-01-019), (2) la couverture de test à 0% ne serait accompagnée d'aucun signal de substitution documenté (reprenant AUD-01-020).

**Vérification effectuée avant tout codage** :
1. Test direct : `npx eslint js/ --max-warnings 1` sur le code actuel → `exit code: 1`. `.github/workflows/ci.yml` lance `npm run lint` (`eslint js/ --max-warnings 344`) sans `continue-on-error`. **Le lint échoue bien la CI** si le seuil de warnings est dépassé, ou si une erreur apparaît. AUD-01-019 et la première moitié d'AUD-09-004 sont invalidés.
2. `vitest.config.mjs:9-22` documente déjà en détail la cause de la couverture à 0% (concaténation de tout `js/*.js` dans un seul `vm.Script` synthétique via `tests/helpers/loadGame.js`, empêchant V8 de relier l'exécution aux fichiers sources) et acte explicitement le report du correctif à un lot dédié futur. **Ce n'est pas un angle mort silencieux** — c'est une limite connue, expliquée et assumée. La seconde moitié d'AUD-09-004 est invalidée ; AUD-01-020 reste valide en tant que tel (limite réelle) mais n'est pas un « angle mort sans signal », contrairement à ce qu'affirmait AUD-09-004.

**Décision** : classer AUD-09-004 comme invalidé (prémisses fausses ou déjà couvertes). Aucune modification de code. Correction cosmétique de passage : `.github/workflows/ci.yml`, commentaire d'en-tête mis à jour (« 182 tests » → « 743 tests », obsolète depuis la croissance de la suite).

**Conséquence** : `.github/workflows/ci.yml` modifié (commentaire uniquement, aucun changement de comportement). Pas de bump de version. AUD-01-020 (couverture 0%) reste une dette connue et documentée, à traiter dans un lot dédié si un jour priorisé — hors scope de ce constat.

---

---

## ADR-168 — Lot 5 (traitement du solde AUD-01, 2026-09-26) : échappement renderErrors(), doc obsolète, table Nouvel An chinois étendue

**Contexte** : AUD-09 avait classé AUD-01 (audit technique) comme « jamais engagé », faute d'entrée ADR dédiée. Vérification directe du code (recherche des commentaires `AUD-01-0xx` dans les fichiers sources) montre que c'était trompeur : 15 des 34 constats sont déjà corrigés en code (dont AUD-01-021, 022, 030, 031, sans ADR associée), 8 sont déjà acceptés/documentés comme dette assumée, 1 est une décision produit pure (AUD-01-014, hors scope code). Seuls AUD-01-017, 023, 028 restaient réellement ouverts et actionnables à faible effort.

**Décision** :
1. `js/08-ui.js` (`renderErrors()`) : le fallback affichant une entrée d'historique d'erreur non reconnue par la regex passe désormais par `esc()`, par cohérence avec le reste du fichier (source interne à ce jour, pas un correctif de faille active).
2. `GUIDE-DU-DEPOT.md` : mentions obsolètes « 182+ tests » remplacées par une formulation non chiffrée (743 aujourd'hui, ce nombre continuera de changer).
3. `js/06c-seasonal.js` (`_CHINESE_NY`) : table étendue de 2035 à 2045 (dates vérifiées via recherche web, chinesefortunecalendar.com — pas inventées). Reste une table figée à réétendre avant 2045, pas un calcul algorithmique (hors scope, effort disproportionné pour ce lot).

**Conséquence** : `js/08-ui.js`, `js/06c-seasonal.js`, `GUIDE-DU-DEPOT.md` modifiés. Aucun changement de comportement observable pour l'utilisateur (correctifs défensifs/doc) → pas de bump de version. 743 tests verts, lint inchangé (0 erreur, 303 warnings).

**Reste ouvert dans AUD-01** : AUD-01-005 (CSP unsafe-inline, effort élevé), AUD-01-009 (CVE dev-only Vitest), AUD-01-014 (décision IP figurines, produit), AUD-01-025/026/027 (dette architecturale, refonte disproportionnée à ce stade), AUD-01-032/033/034 (observations, pas d'action code requise).

---

---

## ADR-169 — Lot 8 (traitement du solde AUD-03, 2026-09-26) : reset total re-saisi, boutique non vide par défaut, token texte secondaire

**Contexte** : après ADR-168 (AUD-01), vérification systématique du même type sur AUD-03 (ergonomique, 47 constats) : 42 étaient déjà corrigés en code sans ADR (dont le P0 AUD-03-012, dead-end tactile — bouton « Plus tard » + clic-fond déjà présents dans `showObjectiveChoice()`). AUD-03-008 et AUD-03-015 also déjà fixés (zone cliquable 40×40px sur le bouton œil ; Échap appelle déjà `onCancel` dans `showConfirm`/`showPrompt`). Seuls AUD-03-007, 026, 039 restaient réellement ouverts.

**Décision** :
1. `js/10-figurines.js` (`resetProfile()`) : `retypeValue:playerName` ajouté à l'appel `showConfirm`, au même niveau d'exigence que `resetAdventure()` — corrige l'inversion de friction (l'action la plus grave était jusqu'ici la plus facile à valider).
2. `js/03-figurines-data.js` : `_figFilter` par défaut passe de `'none'` à `'all'` — la boutique affiche désormais le catalogue complet (déjà paginé, ADR-160) dès l'ouverture plutôt qu'un écran vide invitant à choisir une licence.
3. `css/styles.css` : token `--text-muted:#bdc3c7` ajouté à `:root` et documenté dans le commentaire de palette. **Pas de migration en masse** des ~20 occurrences déjà présentes de `#bdc3c7` : un mécanisme de surcharge thème clair/sakura (`[style*="color:#bdc3c7"]`) cible cette valeur littérale dans des styles inline générés en JS — la remplacer par `var(--text-muted)` casserait ce sélecteur sans un chantier dédié. Le token existe pour tout nouveau style ; c'est une consolidation partielle, assumée comme telle.

**Vérifié en navigateur** (`preview_start`) : boutique affiche 60 cartes au premier rendu (`_figFilter==='all'`), aucune erreur console liée à ce changement.

**Conséquence** : `js/10-figurines.js`, `js/03-figurines-data.js`, `css/styles.css` modifiés. Pas de bump de version (comportement amélioré mais mineur, pas de changement fonctionnel majeur — à la discrétion de l'utilisateur s'il préfère bump). 743 tests verts, lint inchangé (0 erreur, 303 warnings), `check:css-tokens` inchangé (84/135).

**Reste ouvert** : AUD-04 (11/15 constats, essentiellement de l'illustration — emoji→icônes, monstres, avatar — hors scope d'un lot de code pur), AUD-01 (005/009/014/025/026/027, dette assumée ou décision produit).

---

---

## ADR-170 — Clôture de la vérification AUD-04 (2026-09-26) : tout le codable sans nouvel asset était déjà fait

**Contexte** : après ADR-168/169 (AUD-01/AUD-03), même vérification systématique sur AUD-04 (graphique, 15 constats). Résultat : AUD-04-001 (fil visuel doré, "Lot 6/7/8"), AUD-04-003 (radius, sous garde-fou ADR-166), AUD-04-010 (état actif `.shop-quick-btn`, commenté), AUD-04-012 (contraste badge version, `rgba(255,255,255,.85)` + `text-shadow`), AUD-04-015 (icône 💬 remplaçant "GB") et **AUD-04-007** (checkbox custom `css/styles.css:96-99`, `appearance:none` + coche + `--accent` + `focus-visible` — exactement la solution recommandée) sont déjà en code, sans ADR ni commentaire de traçabilité pour la plupart.

**Décision** : aucune ligne de code à ajouter pour ce lot. Classer AUD-04-001/003/007/010/012/015 comme traités et vérifiés.

**Reste réellement ouvert dans AUD-04** :
- **AUD-04-002/005/006/009** (icônes emoji, monstres de combat, sélecteur d'avatar, écran des titres) : travail d'illustration/assets, pas de code pur — nécessite des arbitrages visuels humains (style, budget d'assets), hors périmètre d'un lot de correction automatisé. À planifier comme un chantier de design à part.
- **AUD-04-004** (ombres portées hors tokens) : sous garde-fou anti-régression (ADR-166, `check:css-tokens`) mais pas corrigé au fond — même situation que AUD-04-003 avant elle.
- **AUD-04-008/009/011/013/014** : gravité FAIBLE/MOYENNE/OBSERVATION, P2/P3. Les écrans exacts décrits (rangées de filtres, badge Guérison, cartes de mode, boutons lecteur média) n'ont pas pu être localisés avec certitude par recherche dans le code (possible évolution de structure depuis le 25/09) — nécessitent une inspection visuelle en navigateur plutôt qu'une déduction par grep, reportée à une session dédiée.

**Conséquence** : aucun fichier modifié par ce lot. Pas de bump de version.

**Bilan de la vérification AUD-01/03/04/05 (2026-09-26, ADR-164 à ADR-170)** : sur 106 constats cumulés (34+47+15+10), 15+42+6+10 = 73 étaient déjà corrigés en code sans trace ADR, 9 traités dans cette session (lots 5/8), 8 sont de la dette technique assumée ou des décisions produit hors code, et il reste un solde honnête de ~16 constats réellement ouverts (surtout AUD-04, illustration).

---

*Document vivant — toute nouvelle décision d'architecture significative doit y être ajoutée, avec son numéro d'ADR, son contexte, sa décision et sa conséquence pour le futur.*
