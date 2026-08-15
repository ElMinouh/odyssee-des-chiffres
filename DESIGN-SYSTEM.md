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

## Historique

Ce fichier documente l'état du design system tel qu'il ressort de l'audit graphique/DA
du module Aventure (voir `Audit-Graphique-DA-Module-Aventure.docx`) et des correctifs
des Lots 1 à 6 qui en découlent (v12.4.6 à v12.4.11). À mettre à jour si de nouveaux
tokens ou familles de composants sont introduits.
