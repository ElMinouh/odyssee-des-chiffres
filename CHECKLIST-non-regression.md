# ✅ Checklist de non-régression — L'Odyssée des Chiffres

À parcourir sur un **vrai appareil** (mobile de préférence) après chaque gros déploiement.
Coche au fur et à mesure. Si un point échoue, note la version et le niveau concerné.

> Astuce : tester d'abord en navigation privée (cache vierge), puis recharger une 2e fois
> pour vérifier que le Service Worker a bien pris la nouvelle version.

> 🧪 = ce point (ou une partie de sa logique interne) est déjà couvert par un test Vitest
> automatique, lancé à chaque livraison — il reste listé ici car le test ne peut pas
> vérifier le **rendu visuel/sonore réel sur un vrai appareil**, seulement la logique.
> Un point sans 🧪 est **uniquement** vérifiable à la main.

## 1. Démarrage & installation
- [ ] La page se charge sans écran blanc ; la bonne version est active (vérifier le `v=` / cache-buster).
- [ ] Installation PWA possible (ajout à l'écran d'accueil) et lancement hors-ligne OK.
- [ ] Bascule mode clair / sombre (Paramètres) effective et **persistante** après rechargement.

## 2. Profil & sauvegarde
- [ ] Création d'un profil enfant (nom, avatar) puis sélection. 🧪 photo de profil validée par `photo-playercode_test.js`
- [ ] Les progrès (étoiles, figurines, avatars débloqués) sont conservés après fermeture/réouverture. 🧪 déblocages par niveau/matière couverts par `profile-unlock_test.js` ; renommage de profil par `rename-profile_test.js`
- [ ] Synchronisation cloud : sauvegarde puis restauration sur un autre support (si utilisée). 🧪 fusion non destructive couverte par `cloud-merge_test.js` — seul le vrai aller-retour réseau reste manuel

## 3. Déroulé d'une partie (les 3 cycles)
- [ ] **Maternelle** (PS/MS/GS) : visuels concrets affichés (dés, ten-frame, main, dominos, collections) ; QCM cliquable, bonne/mauvaise réponse colorée. Pas de test automatisé (rendu visuel).
- [ ] **Primaire** (CP→CM2) : questions de base + exercices bonus ; figures lisibles (fractions, droite, horloge, formes, combinatoire, symétrie). 🧪 exactitude réponse/question couverte par `genq-invariants_test.js` — la lisibilité des figures reste manuelle.
- [ ] **Collège** (6e→3e) : questions + exercices bonus ; figures C4/C5 (Pythagore, angles, parallèles, Thalès, solides, diagrammes) proportionnelles et lisibles. Pas de test automatisé (rendu visuel des figures).
- [ ] La voix lit la question (si activée) avec la voix choisie. Pas de test automatisé (dépend de l'appareil/synthèse vocale).

## 4. Progression adaptative (cœur du système)
- [ ] En réussissant, les nombres deviennent plus grands ; en échouant, ils redescendent. 🧪 logique de validation (score, combo, PV) couverte par `validate-characterization_test.js` — la progression de difficulté sur plusieurs parties reste manuelle.
- [ ] Sur un niveau donné, jouer longtemps fait apparaître de **nouveaux types** d'exercices bonus (effet « début → milieu → fin d'année »). Pas de test automatisé (effet cumulatif long terme).
- [ ] Vue parent → jauge « Progression d'année » cohérente ; encadré « points faibles » avec libellés corrects. 🧪 structure des stats couverte par `opstats_test.js` — l'affichage réel dans la Vue Parent reste manuel.

## 5. Boss
- [ ] Apparition d'un boss : intro affichée, voix adaptée (grave au collège, douce en maternelle). Pas de test automatisé (rendu audio/visuel).
- [ ] Les longues répliques ne sont **pas coupées** (voix qui va au bout). Pas de test automatisé.
- [ ] Boss vaincu → récompense / trophée sur la zone. 🧪 logique de victoire/dégâts couverte par `validate-characterization_test.js` — l'affichage de la récompense reste manuel.

## 6. Carte / mode Odyssée (O3-B)
- [ ] La carte-archipel s'affiche ; les îlots non débloqués sont sous **brouillard**. Pas de test automatisé (rendu visuel).
- [ ] L'avatar se déplace **pas à pas** vers la zone, avec le **bon transport** selon la région. Pas de test automatisé (animation).
- [ ] Conquête d'une zone → cinématique de victoire ; conquête d'une île → cinématique d'île. 🧪 validité structurelle des zones/régions couverte par `tech-debt-fixes_test.js` et `odyssee-temps_test.js` — le rendu de la cinématique reste manuel.
- [ ] Les îlots débloqués affichent leurs **particules ambiantes**. Pas de test automatisé (rendu visuel).

## 7. Livre (narration)
- [ ] Ouvrir une histoire : boutons ▶ / ⏸ / ⏹ présents sur chaque page. Pas de test automatisé sur ces 3 boutons précis (voir point suivant pour le bouton ✕).
- [ ] ▶ lit la page avec une voix de conteur ; ⏸ met en pause ; ▶ reprend ; ⏹ arrête. Pas de test automatisé (audio).
- [ ] Changer de page ou fermer **coupe** la lecture en cours (pas de chevauchement). Pas de test automatisé.
- [ ] **Carnet / collections de tomes** (Chroniques du Temps, tomes Collège Français, contes bonus Maths/Docteur Babel/Conte du Livre) : bouton **✕** visible et fonctionnel dès la couverture, permettant de refermer le livre **à tout moment**, sans devoir le feuilleter jusqu'au bout (régression corrigée v11.7.2 sur les tomes Collège Français — à re-tester en priorité). 🧪 présence du bouton de fermeture couverte pour 5 fonctions de rendu narratif par `narrative-regression_test.js` — le clic réel et le rendu visuel restent manuels.
- [ ] Carnet à tomes multiples : chaque tome débloqué affiche clairement qu'il est cliquable (halo/icône) et son état verrouillé/déverrouillé est cohérent avec la progression réelle. Pas de test automatisé (rendu visuel).

## 8. Voix (Paramètres)
- [ ] La liste « Voix du conteur » se remplit avec les voix de l'appareil. Pas de test automatisé (dépend de l'appareil).
- [ ] Choisir une voix + « Tester » lit l'extrait ; le choix est **conservé** après rechargement. Pas de test automatisé (audio).
- [ ] La voix choisie s'applique aux questions, aux boss et au livre. Pas de test automatisé.

## 9. Sons & vibrations
- [ ] Jingles de bonne réponse / palier / victoire OK. Pas de test automatisé (audio).
- [ ] Vibrations (si supportées) sans blocage. Pas de test automatisé.
- [ ] Couper la voix / la musique (toggles accueil) fonctionne. 🧪 logique de mise en sourdine (ducking) couverte par `music-ducking_test.js` — le rendu audio réel reste manuel.

## 10. Robustesse
- [ ] Rotation écran / petit écran : rien ne déborde (surtout figures Thalès, solides, combinatoire). Pas de test automatisé (rendu visuel).
- [ ] Aucune erreur dans la console navigateur pendant une partie complète. 🧪 échappement HTML de base couvert par `jsattr_test.js` (protection XSS élémentaire) — la surveillance console en conditions réelles reste manuelle.
- [ ] Après mise à jour, l'ancienne version ne « colle » pas (le SW sert bien la nouvelle). Pas de test automatisé (Service Worker non couvert par la suite Vitest actuelle).

---
*Référence rapide des derniers ajouts à surveiller : figures collège C4/C5, lot 6e, polish primaire (combinatoire/angle/symétrie), narration du livre, sélecteur de voix, rééquilibrage des phases de fin d'année (PS, MS, CP, CE1, 5e), Collège Français (histoire principale réécrite + collection 5 tomes, carnet réduit de 7 à 5 tomes, correctif bouton ✕ manquant sur le lecteur de tomes).*
