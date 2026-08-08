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

*Document vivant — toute nouvelle décision d'architecture significative doit y être ajoutée, avec son numéro d'ADR, son contexte, sa décision et sa conséquence pour le futur.*
