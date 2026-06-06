
## Progression adaptative (P9) — règle de maintenance

La difficulté de chaque classe suit une **progression intra-année** (jauge `P.yearProgress`, phases début/milieu/fin). Chaque générateur de question porte une **phase** `.ph` (1, 2 ou 3) qui conditionne son apparition.

**À CHAQUE ajout d'exercice ou de module à la base de questions, vérifier impérativement :**
1. Le nouveau générateur est bien ajouté à son pool (`_PRIM_POOL`, `_MAT_POOL`, `_COL_POOL`, …).
2. Une **phase** lui est attribuée (`.ph = 1|2|3`) dans le bloc de phases du module (début/milieu/fin d'année selon le programme).
3. Console : `_progSelfCheck()` ne doit signaler **aucun** générateur sans phase.
4. Le gating est testé : la variété de questions en **phase 1** doit être **inférieure** à celle en **phase 3**.
5. Si le type introduit une nouvelle catégorie d'erreur, ajouter son libellé dans `_PROG_OPLABEL` (pour la vue parent « point faible »).

Un auto-contrôle s'exécute 4 s après le chargement et avertit dans la console si un générateur n'a pas de phase.
