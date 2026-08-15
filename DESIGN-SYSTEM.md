# Design System — L'Odyssée du Savoir

Document créé lors du Lot 7 de l'audit graphique/DA (module Aventure), pour que les
tokens existants soient réellement consultés avant d'introduire une nouvelle valeur —
c'était le constat le plus structurant de cet audit (18 valeurs de rayon en dur contre
4 tokens définis, 130 `box-shadow` dont 5 seulement passaient par les tokens prévus).

## Règle d'or

**Avant d'écrire une nouvelle valeur de rayon, d'ombre, d'espacement ou de durée,
vérifier si un token ci-dessous convient déjà — même approximativement.** Une valeur
« presque » alignée (11px à côté d'un token à 12px) n'apporte rien et complique la
lecture du design system pour la suite.

## Tokens disponibles (`:root` dans `styles.css`)

| Catégorie | Tokens | Valeurs |
|---|---|---|
| Couleur | `--primary`, `--accent`, `--bg`, `--glow` | redéfinis par thème (`html[data-theme=...]`) |
| Rayon | `--radius-sm` / `-md` / `-lg` / `-pill` | 8px / 12px / 18px / 999px |
| Rayon (par cycle) | mêmes tokens, redéfinis sous `html[data-cycle=...]` | plus rond en maternelle, plus anguleux en collège |
| Ombre | `--shadow-card` / `-popup` / `-modal` | carte, panneau flottant, modale plein écran |
| Espacement | `--space-1` à `--space-6` | échelle d'espacement standard |
| Durée | `--dur-fast` / `-base` / `-slow` | 150ms / 300ms / 600ms |
| Surface | `--surface-1` / `-2` / `-3` | fonds neutres (panneaux secondaires type tiroir) |

## Règle : durée UI vs durée « spectacle »

Deux familles de durées coexistent, volontairement :

- **Durée UI** (hover, ouverture de tiroir, changement d'état) → toujours `--dur-fast/base/slow`.
- **Durée « spectacle »** (pulsation de zone active, apparition de parchemin, animations
  narratives) → libre, réglée au cas par cas selon le rythme voulu. Ce n'est **pas** un
  oubli si une animation narrative n'utilise pas un token de durée UI.

## Règle : contraste texte/fond sur la carte

Le module a 8 thèmes de carte (`html[data-theme]`), de très clairs (banquise, sakura) à
très sombres (nuit, espace). **Tout texte libre posé directement sur le fond de carte**
(pas dans un panneau à fond opaque) doit systématiquement reprendre le pattern déjà
utilisé sur `.archipel-region-name` / `.archipel-zone-label` : halo de `text-shadow`
multi-directionnel et/ou fond semi-opaque — jamais du texte nu. Ne pas redécouvrir ce
problème composant par composant.

## Choix assumés (pour ne pas les re-questionner sans raison)

- Les 3 boutons de la barre d'outils de la carte (Carnet, Boussole, Mini-carte) ont des
  couleurs de fond **fixes**, indépendantes des 8 thèmes de carte — identité stable de
  la barre d'outils, choix volontaire.
- La Boussole reste plus légère visuellement que Carnet/Mini-carte (rond = action
  immédiate, carré = ouvre un panneau) — cohérent avec la maquette validée à l'origine
  de ces 3 icônes.
- Le trophée de zone conquise affiche l'emoji du boss vaincu spécifique à la zone (pas
  un pictogramme générique) — c'est voulu, ne pas le vectoriser en un symbole fixe.

## Inventaire des familles de composants (module Aventure)

Pour éviter qu'un futur ajout ne duplique un composant existant sous un autre nom :

| Famille | Composants | Fichier |
|---|---|---|
| Badge d'état de zone | `.archipel-zone-check`, `.archipel-zone-lock`, `.archipel-zone-star` | styles.css + icônes SVG dans index.html |
| Modale plein écran | `.story-parchment`, `.advlog-modal`, `.archipel-shop-content` | styles.css |
| Panneau ancré (tiroir) | `.map-drawer` | styles.css |
| Bouton de barre d'outils | `.compass-btn`, `.map-carnet-btn`, `.map-tool-btn` | styles.css |
| Icône de navigation SVG | `icon-compass-*`, `icon-carnet-*`, `icon-minimap-*` (par cycle) | index.html (`<defs>`) |
| Icône d'état SVG | `icon-zone-lock`, `icon-zone-check`, `icon-zone-star` | index.html (`<defs>`) |

## Créer une nouvelle Odyssée : checklist obligatoire

Section ajoutée après le chantier des 86 répliques de boss (v12.4.16 à v12.4.21), pour
qu'une future Odyssée (nouveau cycle, nouvelle matière) applique d'emblée ce qui a dû
être corrigé après coup sur les 7 Odyssées existantes. À suivre dans l'ordre, pour
CHAQUE zone de la nouvelle Odyssée :

### 1. Ne jamais hériter un boss sans le relire

Si la nouvelle Odyssée est **dérivée** d'une Odyssée existante (via `.map()`, comme
`MAT_ZONES_FR` dérive de `MAT_ZONES`), `bossName`/`boss` ne s'héritent JAMAIS
correctement d'office — ils viennent de l'Odyssée source, pensée pour un tout autre
univers. Pour chaque zone dérivée :
- Lire le label de la zone (souvent déjà réécrit pour la nouvelle Odyssée) et le thème
  général du livre/région.
- Si le boss hérité ne colle pas au lieu, créer une entrée dans une table
  `_XXX_BOSS_OVERRIDES` dédiée (voir `_MATFR_BOSS_OVERRIDES`, `_PRIMFR_BOSS_OVERRIDES`,
  `_PRIMHIST_BOSS_OVERRIDES`, `_COLFR_BOSS_OVERRIDES` dans `07-story.js` comme modèles).
- Un boss peut être excellent tel quel (ex. tout `COL_ZONES`, aucune correction) — ne
  pas changer pour changer, seulement si l'adéquation lieu/histoire est réellement en jeu.

### 2. Le piège des deux emplacements (à vérifier SYSTÉMATIQUEMENT)

Chaque zone définit le boss à **deux endroits distincts**, qui doivent toujours être
synchronisés :
- `zone.bossName` / `zone.boss` → sert au trophée de zone conquise (carte).
- `zone.steps[].name` / `zone.steps[].emoji` (l'entrée `type:'boss'`) → c'est CE QUI EST
  RÉELLEMENT AFFICHÉ pendant le combat (titre, portrait, voix).

Une simple table d'overrides sur `bossName`/`boss` ne suffit pas : il faut aussi
remapper `steps[]` (voir le pattern `steps: z.steps.map(s => s.type==='boss' ? ... )`
dans `07-story.js`). Ce bug s'est produit deux fois (Français Maternelle v12.4.17→18,
Histoire Primaire v12.4.19) avant d'être documenté ici.

### 3. Une réplique de boss unique, écrite pour ce lieu

- Une seule phrase par boss (`_BOSS_LINES[zoneId]` dans `02-data.js`), jamais deux
  concaténées ("enjeu narratif" + réplique) — supprimé en v12.4.14, ne pas réintroduire.
- Le ton suit le cycle : `tender` pour maternelle (menace jamais explicite, registre
  doux — voir `MONSTER_DIALOGUES.tender`), `standard` sinon (peut être dramatique/
  menaçant, adapté à l'âge).
- Si aucune entrée n'existe dans `_BOSS_LINES`, le pool générique partagé
  (`MONSTER_DIALOGUES.boss` dans `07-map.js`) sert de repli — mais une réplique dédiée
  est toujours préférable pour l'immersion.

### 4. Le thème réel de la zone pilote l'îlot, pas la région

Chaque zone doit avoir un champ `theme` cohérent avec SON histoire, choisi parmi les 9
valeurs existantes (`standard`, `foret`, `volcan`, `ocean`, `banquise`, `chateau`,
`sakura`, `nuit`, `espace` — voir `styles[theme]` dans `_renderIslandSvg`, `07-map.js`).
Ce thème pilote automatiquement : la couleur/texture de l'îlot, ses motifs décoratifs,
les PNJ (`_NPCS_BY_THEME`) et la météo (`_WEATHER_BY_THEME`) de la région — un thème mal
choisi déforme les quatre à la fois. Ne jamais laisser un thème par défaut/hérité sans
vérifier qu'il correspond au lieu réellement décrit par le label de la zone.

### 5. Design system (rayons, ombres, espacements, durées)

Voir les sections « Règle d'or » et « Tokens disponibles » plus haut dans ce document —
s'applique à tout nouveau composant visuel, pas seulement aux Odyssées.

### 6. Réutiliser le motif ornemental ❖ plutôt qu'en inventer un nouveau

Pour tout nouveau titre/en-tête ajouté (section de Carnet, nom affiché en grand...),
reprendre le pattern déjà posé sur `.archipel-region-name`, `.archipel-zone-label`,
`#monster-intro-name` et `.advlog-section-title` (ornements `❖` en `::before`/`::after`)
plutôt que d'inventer un traitement typographique différent — sauf contrainte technique
réelle (ex. titre de carte : largeur contrainte + troncature, écarté pour cette raison).

## Historique

Ce fichier documente l'état du design system tel qu'il ressort de l'audit graphique/DA
du module Aventure (voir `Audit-Graphique-DA-Module-Aventure.docx`), des correctifs des
Lots 1 à 7 qui en découlent (v12.4.6 à v12.4.11), des 3 points hors-lot de direction
artistique (v12.4.12/12.4.13), et du chantier des 86 répliques de boss avec correction
des identités (v12.4.14 à v12.4.21). À mettre à jour si de nouveaux tokens, familles de
composants, ou règles de cohérence narrative sont introduits.
