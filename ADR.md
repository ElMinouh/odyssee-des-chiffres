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

**Limite connue** : si un chapitre a beaucoup plus de pages que de zones dans son îlot (ex. 11 pages pour 4 zones), les pages excédentaires s'accumulent et sont montrées d'un bloc avec la scène de victoire plutôt que d'être bien réparties. Pas de perte de contenu, mais moins fluide. Non corrigé à ce stade — à traiter si Cyril le demande.

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

*Document vivant — toute nouvelle décision d'architecture significative doit y être ajoutée, avec son numéro d'ADR, son contexte, sa décision et sa conséquence pour le futur.*
