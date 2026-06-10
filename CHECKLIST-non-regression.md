# ✅ Checklist de non-régression — L'Odyssée des Chiffres

À parcourir sur un **vrai appareil** (mobile de préférence) après chaque gros déploiement.
Coche au fur et à mesure. Si un point échoue, note la version et le niveau concerné.

> Astuce : tester d'abord en navigation privée (cache vierge), puis recharger une 2e fois
> pour vérifier que le Service Worker a bien pris la nouvelle version.

## 1. Démarrage & installation
- [ ] La page se charge sans écran blanc ; la bonne version est active (vérifier le `v=` / cache-buster).
- [ ] Installation PWA possible (ajout à l'écran d'accueil) et lancement hors-ligne OK.
- [ ] Bascule mode clair / sombre (Paramètres) effective et **persistante** après rechargement.

## 2. Profil & sauvegarde
- [ ] Création d'un profil enfant (nom, avatar) puis sélection.
- [ ] Les progrès (étoiles, figurines, avatars débloqués) sont conservés après fermeture/réouverture.
- [ ] Synchronisation cloud : sauvegarde puis restauration sur un autre support (si utilisée).

## 3. Déroulé d'une partie (les 3 cycles)
- [ ] **Maternelle** (PS/MS/GS) : visuels concrets affichés (dés, ten-frame, main, dominos, collections) ; QCM cliquable, bonne/mauvaise réponse colorée.
- [ ] **Primaire** (CP→CM2) : questions de base + exercices bonus ; figures lisibles (fractions, droite, horloge, formes, combinatoire, symétrie).
- [ ] **Collège** (6e→3e) : questions + exercices bonus ; figures C4/C5 (Pythagore, angles, parallèles, Thalès, solides, diagrammes) proportionnelles et lisibles.
- [ ] La voix lit la question (si activée) avec la voix choisie.

## 4. Progression adaptative (cœur du système)
- [ ] En réussissant, les nombres deviennent plus grands ; en échouant, ils redescendent.
- [ ] Sur un niveau donné, jouer longtemps fait apparaître de **nouveaux types** d'exercices bonus (effet « début → milieu → fin d'année »).
- [ ] Vue parent → jauge « Progression d'année » cohérente ; encadré « points faibles » avec libellés corrects.

## 5. Boss
- [ ] Apparition d'un boss : intro affichée, voix adaptée (grave au collège, douce en maternelle).
- [ ] Les longues répliques ne sont **pas coupées** (voix qui va au bout).
- [ ] Boss vaincu → récompense / trophée sur la zone.

## 6. Carte / mode Odyssée (O3-B)
- [ ] La carte-archipel s'affiche ; les îlots non débloqués sont sous **brouillard**.
- [ ] L'avatar se déplace **pas à pas** vers la zone, avec le **bon transport** selon la région.
- [ ] Conquête d'une zone → cinématique de victoire ; conquête d'une île → cinématique d'île.
- [ ] Les îlots débloqués affichent leurs **particules ambiantes**.

## 7. Livre (narration)
- [ ] Ouvrir une histoire : boutons ▶ / ⏸ / ⏹ présents sur chaque page.
- [ ] ▶ lit la page avec une voix de conteur ; ⏸ met en pause ; ▶ reprend ; ⏹ arrête.
- [ ] Changer de page ou fermer **coupe** la lecture en cours (pas de chevauchement).

## 8. Voix (Paramètres)
- [ ] La liste « Voix du conteur » se remplit avec les voix de l'appareil.
- [ ] Choisir une voix + « Tester » lit l'extrait ; le choix est **conservé** après rechargement.
- [ ] La voix choisie s'applique aux questions, aux boss et au livre.

## 9. Sons & vibrations
- [ ] Jingles de bonne réponse / palier / victoire OK.
- [ ] Vibrations (si supportées) sans blocage.
- [ ] Couper la voix / la musique (toggles accueil) fonctionne.

## 10. Robustesse
- [ ] Rotation écran / petit écran : rien ne déborde (surtout figures Thalès, solides, combinatoire).
- [ ] Aucune erreur dans la console navigateur pendant une partie complète.
- [ ] Après mise à jour, l'ancienne version ne « colle » pas (le SW sert bien la nouvelle).

---
*Référence rapide des derniers ajouts à surveiller : figures collège C4/C5, lot 6e, polish primaire (combinatoire/angle/symétrie), narration du livre, sélecteur de voix, rééquilibrage des phases de fin d'année (PS, MS, CP, CE1, 5e).*
