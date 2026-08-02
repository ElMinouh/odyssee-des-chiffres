# Audit technique complet — L'Odyssée des Chiffres

*Document en cours de construction, lot par lot. Version consolidée présentée à la fin.*

---

## Lot 1 — Cœur moteur (`01-core.js`, `11-init.js`, `loadGame.js`, `setup.js`)

### 🔴 Critique

**1. Point unique de rupture dans `window.onload`**
- **Description** : dans `11-init.js`, plusieurs appels ne sont pas protégés par try/catch (`$('gameModeSelect').addEventListener(...)`, `$('modeSelect').addEventListener(...)`, `$('parent-player').addEventListener(...)`) alors qu'ils précèdent tout le reste de l'initialisation (nettoyage profils, restauration `lastPlayer`, thème, `loadProfile()`, `setupNumpad()`, cloud sync…).
- **Pourquoi c'est un problème** : si un seul de ces éléments DOM est absent, l'exception JS non catchée stoppe net tout `onload` — le reste ne s'exécute jamais, silencieusement.
- **Conséquences** : écran figé/incomplet au démarrage sans message d'erreur visible, très difficile à diagnostiquer à distance.
- **Solution recommandée** : envelopper chaque bloc d'`onload` individuellement dans son propre try/catch, comme déjà fait pour la majorité des autres blocs.
- **Impact** : correctif localisé, zéro risque de régression.

### 🟠 Important

**2. Aucune remontée d'erreur (observabilité nulle)**
- Tous les `catch(e){}` avalent l'erreur sans trace exploitable à distance. Pour une app utilisée par des enfants sur leurs propres appareils, aucun moyen de savoir qu'un bug se produit chez un utilisateur réel.
- **Solution** : pas nécessairement prioritaire vu l'échelle du projet, mais un petit "journal technique" consultable en vue parent serait un gain à coût faible.

**3. Absence de système de modules — couplage global généralisé**
- Tout l'état (`P`, `GM`, `GS`, `combatCfg`, `powers`…) est en variables globales partagées entre ~25 fichiers concaténés en `<script>` classiques. Chaque appel inter-fichier se fait via `typeof fn==='function'`, jamais par référence garantie.
- C'est très probablement la cause racine des deux oublis de bouton ✕ déjà documentés dans l'historique du projet (section 17.9) — un copier-coller entre lecteurs sans vérification statique du contrat d'interface.
- **Solution** : une refonte modules ES + bundler serait disproportionnée. Étendre `_bootSanityCheck` à davantage de fonctions critiques est un gain à coût quasi nul.

**4. Triplication du code de synthèse vocale**
- `speak()`, `speakAs()` et `repeatQuestion()` recopient quasi à l'identique la création de `SpeechSynthesisUtterance`, le ducking musique, le try/catch.
- **Solution** : extraire `_speakUtterance(text, {pitch, rate, voice})` commune.

### 🟡 Moyen

**5. PIN parental faible (relativisé)**
- Hash DJB2 non salé, code par défaut `'1234'`. Mais tout étant côté client, aucun mécanisme de PIN ne serait vraiment sûr ici — ce n'est pas un vrai défaut de conception, plutôt une limite inhérente au 100% front-end. Vérifier juste qu'on incite le parent à changer le PIN par défaut.

**6. `eval()` dans `_bootSanityCheck`**
- `typeof eval(sym)` en fallback — mauvaise pratique, mais sans risque d'injection ici (liste de noms codés en dur). Remplacer par `typeof window[sym]` uniquement (le fallback eval est même redondant).

### 🟢 Mineur

**7. `loadGame.js`** : objet d'exposition `__api` en croissance manuelle continue (~100 lignes), fragile à l'oubli mais sans erreur explicite en cas d'omission.

**Synthèse lot 1** : fichiers globalement propres et défensifs. Le point n°1 est un vrai bug de robustesse à corriger rapidement ; le point n°3 explique une partie de la dette technique déjà observée par ailleurs.


---

## Lot 2 — Données (`02-data.js`, `03-figurines-data.js`)

### 🔴 Critique

**8. Risque juridique majeur : usage massif de propriété intellectuelle tierce**
- **Description** : `03-figurines-data.js` contient ~420 « figurines » à collectionner, dont plus de 300 sont des personnages directement issus de franchises sous droits (constaté par comptage du champ `uni`) : Dragon Ball (36), Marvel (33), Chevaliers du Zodiaque (31), DC Comics (28), Pokémon (27), Star Wars (17), Ninjago (13), Harry Potter (12), Goldorak (11), Astérix (9), Tintin (8), Mickey & Amis (8), Mario Bros (8), Tortues Ninja (7), Reine des Neiges (7), Pyjamasques (7), Miraculous (6), Sailor Moon (5), etc. — avec noms, descriptions détaillées et couleurs officielles des personnages.
- **Pourquoi c'est un problème** : ce n'est pas un bug technique mais un risque juridique réel de contrefaçon (droit d'auteur ET marques déposées) dès lors que l'app sort d'un usage strictement privé et personnel (famille) — publication sur un store, partage d'un lien public, monétisation, etc. Le fait que le contenu soit à visée éducative ou non commerciale ne suffit pas à écarter le risque.
- **Conséquences possibles** : mise en demeure, retrait forcé, dans les cas extrêmes poursuite — proportionnel à la visibilité/diffusion réelle de l'app, pas à l'intention.
- **Solution recommandée** : ce point dépasse le cadre technique — à traiter consciemment comme une décision produit. Si l'app reste un usage 100% privé/familial (pas de distribution publique), le risque pratique est faible. Si une diffusion plus large est envisagée un jour, il faudra remplacer ces figurines par des personnages originaux (le jeu en a déjà créé beaucoup pour les monstres/boss/héros des Odyssées — le même travail créatif est possible ici).
- **Impact sur le reste du projet** : aucun risque technique de régression à corriger maintenant ; c'est une information à connaître pour toute décision de diffusion future.

### 🟡 Moyen

**9. `heroGender()` — heuristique de genre fragile**
- **Description** (`02-data.js` L.28-34) : au-delà de la table `KNOWN_GENDERS` (papa/maman), le repli est *"finit par a/e → féminin"*.
- **Pourquoi c'est un problème** : de nombreux prénoms masculins français finissent en *-e* (Alexandre, Maxime, Timothée, Jérémie, Eliott, Guillaume...) et seraient mal genrés (accords "Aventurière" au lieu d'"Aventurier").
- **Conséquences** : erreur d'accord visible pour l'enfant concerné à chaque partie, pas de casse technique.
- **Solution recommandée** : à défaut de base de prénoms complète, prévoir un champ optionnel "genre" dans le profil géré par le parent (probablement déjà présent — à vérifier dans le lot Profil), et n'utiliser l'heuristique qu'en tout dernier recours si le parent ne l'a pas renseigné.
- **Impact** : correctif isolé, pas de régression.

### 🟢 Mineur

**10. Pas de doublons d'`id`** vérifié par script sur les 184 zones (`PRIM_ZONES` et consorts) — RAS, bonne hygiène de données.

**Synthèse lot 2** : `02-data.js` est propre (fonctions courtes, defensive coding cohérent avec le lot 1). Le vrai sujet de ce lot n'est pas technique : c'est le point n°8 (IP tierce), largement le risque le plus significatif détecté dans tout l'audit à ce stade.


---

## Lot 3 — Exercices / adaptatif (`04-questions.js`, `06a-adaptive.js`, `06b-time-block.js`, `06c-seasonal.js`, `06d-cinematics.js`)

### 🔴 Critique

**11. Bug avéré : mauvaise réponse calculée pour un type de question 5e (priorité opératoire)**
- **Description** (`04-questions.js`, fonction `genQ_5E`, branche `'prio'`, second cas aléatoire) :
  ```js
  else q=_mkQ(`${a*c+ri(1,9)} − ${b} × ${c}`, (a*c+0)-(b*c), 'prio');
  ```
  L'affichage calcule `a*c + X` (avec `X = ri(1,9)`, un nombre aléatoire tiré à la volée) comme premier terme de l'expression affichée, mais la réponse attendue (2ᵉ argument de `_mkQ`) est calculée séparément comme `a*c − b*c`, **sans jamais réutiliser ce `X`**.
- **Pourquoi c'est un problème** : la bonne réponse mathématique de l'expression *affichée* est `(a*c + X) − b*c`, alors que le jeu attend `a*c − b*c` — décalée exactement de la valeur `X` (entre 1 et 9). Un enfant qui répond correctement à la question posée sera donc compté comme faux, un jour sur deux dans ce sous-cas (`ri(0,1)` choisit entre deux formulations).
- **Conséquences** : dans une proportion significative des questions 5e de type « priorité opératoire » (elles-mêmes systématiquement dans le pool de génération), l'enfant obtient une correction erronée — impact direct sur la confiance en soi et sur la fiabilité perçue de l'app, pour le cœur même de sa mission (apprentissage des maths).
- **Solution recommandée** : stocker le tirage aléatoire dans une variable et l'inclure dans le calcul du résultat, par exemple :
  ```js
  const extra = ri(1,9);
  q = _mkQ(`${a*c+extra} − ${b} × ${c}`, (a*c+extra)-(b*c), 'prio');
  ```
- **Impact sur le reste du projet** : correctif d'une ligne, strictement local à cette branche, aucun risque de régression ailleurs.

### 🟠 Important

**12. `isTimeBlocked()` : verrouillage total silencieux en cas de config corrompue**
- **Description** (`06b-time-block.js`) : `cfg.start.split(':').map(Number)` — si `cfg.start`/`cfg.end` est absent, mal formé ou corrompu, `s`/`e` valent `NaN`. Toute comparaison avec `NaN` est `false`, donc `!(false&&false)` → `true` : la fonction considère alors que le jeu est **bloqué en permanence**, sans indication claire de la cause.
- **Conséquences** : un enfant peut se retrouver bloqué "pour toujours" à cause d'une donnée corrompue en localStorage, sans que le parent comprenne pourquoi (l'écran affichera "Jeu autorisé entre undefined et undefined" ou équivalent).
- **Solution recommandée** : valider `cfg.start`/`cfg.end` (regex `^\d{2}:\d{2}$`) dans `getBlockCfg`, et à défaut désactiver le blocage plutôt que de bloquer par défaut (fail-open plutôt que fail-closed, cohérent avec le fait que c'est un confort, pas une sécurité).
- **Impact** : correctif local, aucun changement de comportement pour les configs valides.

### 🟡 Moyen

**13. Table `_CHINESE_NY` à durée de vie limitée (expire en 2035)**
- **Description** (`06c-seasonal.js`) : la table de dates du Nouvel An chinois s'arrête à 2035. Après cette date, `_chineseNY()` renvoie `null` silencieusement — le boss saisonnier correspondant disparaît sans erreur ni avertissement.
- **Solution recommandée** : non urgent (10 ans devant vous), mais à noter dans un pense-bête technique pour extension périodique, ou remplacer par une formule de calcul si une telle formule existe pour cette fête (sinon, table à rallonger tous les 5-10 ans).

### 🟢 Mineur

**14. Duplication structurelle entre les 9 générateurs `genQ_*`**
- Chaque niveau (`CP` à `3E`) réimplémente un motif quasi identique (pool pondéré, tirage, anti-répétition, relance récursive en cas de doublon). Fonctionnellement correct partout sauf au point n°11, mais la logique de récursion + relance (`_seenQ`/`_trackQ`) mériterait une factorisation en une fonction générique paramétrée par niveau, pour réduire le risque qu'un futur bug similaire au n°11 se reproduise ailleurs à l'occasion d'un copier-coller.

**Synthèse lot 3** : ce lot contient la trouvaille la plus concrète de l'audit jusqu'ici (n°11) — un vrai bug fonctionnel affectant la justesse des corrections en 5e. Le reste (adaptatif, révision espacée, plateaux, cinématiques) est bien conçu et robuste.


---

## Lot 4 — Profil / Parent / Cloud (`05-profile.js`, `09-parent.js`, `12-cloud.js`)

### 🟢 Point positif à souligner
`05-profile.js` contient une couche de validation de sauvegarde (`validateProfile`, `_clampNum`, `_safeStr`, `_safeArr`…) particulièrement soignée : chaque champ est typé et borné avant d'entrer en mémoire, avec un système de migration versionné (`SAVE_VERSION` + `_MIGRATIONS`). C'est un des points les plus solides de tout le projet, à préserver tel quel dans toute évolution future.

### 🟠 Important

**15. Backend cloud (Cloudflare Worker) hors du périmètre audité — à vérifier séparément**
- **Description** (`12-cloud.js`) : le jeu s'appuie sur un vrai service distant (`https://odyssee-sync.air7841.workers.dev`) pour la sauvegarde/récupération de profil par "code joueur" (ex. `SOREN-7B4K9X`). Le code CLIENT gère bien la validation/migration des données reçues (réutilise `validateProfile`), mais **le code du Worker lui-même n'est pas dans les fichiers fournis** et n'a donc pas pu être audité (limitation de débit ("rate limiting"), contrôle d'accès, permissions KV, etc.).
- **Pourquoi c'est un problème** : le code joueur est la SEULE clé d'accès (lecture ET écriture) au profil cloud d'un enfant — quiconque l'obtient (capture d'écran, partage accidentel) peut lire ou écraser ce profil à distance. C'est un compromis raisonnable pour ce type de données (progression de jeu, pas de données sensibles), mais cela mérite d'être : (a) vérifié côté Worker (rate limiting anti-bruteforce sur `/profile/:code` en GET), et (b) communiqué clairement au parent ("ne partage pas ce code, comme un mot de passe").
- **Solution recommandée** : demander (dans une future conversation dédiée, hors périmètre de ce dépôt) le code source du Worker pour un audit complémentaire — ou au minimum confirmer qu'un rate limiting existe côté Cloudflare.

### 🟡 Moyen

**16. Duplication de la fonction d'échappement HTML**
- **Description** : `09-parent.js` définit sa propre `_esc()` (L.937, échappe seulement `&<>`) en plus de la fonction globale `esc()` de `01-core.js` (qui échappe aussi les guillemets). Dans l'usage actuel, `_esc()` n'est utilisée que dans du contenu texte HTML (jamais dans un attribut), donc pas de faille exploitable aujourd'hui — mais toute réutilisation future dans un attribut serait vulnérable.
- **Solution recommandée** : supprimer `_esc()` et réutiliser `esc()` partout (cohérent avec la mutualisation déjà faite pour `_jsAttr` — ADR-8).

### 🟢 Mineur

**17. Import de profil par fichier/code : re-validation différée mais bien présente**
- `importProfileFile`/`doImport` écrivent le JSON importé quasi brut dans `localStorage` (seuls `sanitizePlayerKey`/`isValidPlayerData` filtrent grossièrement), MAIS le prochain `loadProfile()` du profil concerné repasse systématiquement par `validateProfile()` — donc la fenêtre de données non bornées en storage est courte et sans conséquence pratique observée. Amélioration possible mais non urgente : appeler `validateProfile()` dès l'import plutôt qu'au prochain chargement.

**Synthèse lot 4** : lot globalement rassurant — validation de profil exemplaire, migration versionnée, sync cloud bien pensée côté client. Le point d'attention principal (n°15) est hors du code fourni et à traiter séparément.


---

## Lot 5 — Jeu / Carte / Boss / Histoire (`07-game.js`, `07-map.js`, `07-boss.js`, `07-story.js`)

### 🟢 Vérification ciblée (suite au bug du lot 3)
Après la découverte du bug n°11, une recherche systématique du même motif (une valeur aléatoire générée directement dans un template literal d'affichage, puis oubliée du calcul de la réponse) a été menée sur l'ensemble de ce lot. **Aucune occurrence supplémentaire trouvée** — les quelques usages de `ri()`/`Math.random()` dans des template literals ici ne concernent que des couleurs/décors cosmétiques, jamais une réponse attendue.

### 🟡 Moyen

**18. `validate()` — fonction critique de ~155 lignes, à responsabilités multiples**
- **Description** (`07-game.js` L.663-818) : cette fonction gère à elle seule la comparaison de la réponse, le calcul des points, les statistiques par opération/matière, les quêtes, la vie du boss (bouclier, enrage, furie), les figurines exclusives, l'audio, les vibrations, les animations DOM et la narration.
- **Pourquoi c'est un problème** : ce n'est pas un bug, mais une fonction de cette taille et de cette complexité cyclomatique est difficile à faire évoluer sans risque de régression (chaque nouvelle mécanique de boss y ajoute une branche supplémentaire) et quasiment impossible à tester unitairement dans l'état actuel (dépendances DOM directes type `$('feedback').style.color=...`).
- **Solution recommandée** : pas de refonte urgente, mais à la prochaine évolution significative du système de combat, envisager de séparer le calcul (points, stats, déblocages — testable sans DOM) de l'affichage (DOM, audio, animations).

**19. `_numberToFrenchWords()` — inexactitude grammaticale sur les grands nombres**
- **Description** (`07-boss.js` L.1311) : pour un nombre comme 80 000, la fonction produit "quatre-vingts mille" (avec le *s* de pluriel), alors que la règle grammaticale française retire le *s* de "quatre-vingt" quand il est suivi d'un autre nombre ("quatre-vingt mille").
- **Impact** : cas limite (nombres à 5+ chiffres, rarement atteints dans le gameplay actuel d'après les plages numériques observées dans le lot 3) — à corriger si l'usage de cette fonction s'étend, sinon non prioritaire.

### 🟢 Mineur

**20. `_numberToFrenchWords()` non prévue au-delà du million**
- Pas de gestion de "million" — si jamais un nombre ≥ 1 000 000 lui était passé, le résultat serait incorrect (aucun garde-fou). À vérifier si les plages d'appel actuelles restent bien sous ce seuil (semble être le cas au vu des générateurs audités en lot 3).

**Synthèse lot 5** : le cœur du moteur de jeu (validate, combat de boss, carte, narration) est dense mais fonctionnellement solide — aucun bug de justesse comparable à celui du lot 3 n'y a été détecté. Le point d'attention est la maintenabilité de `validate()`, pas sa correction.


---

## Lot 6 — UI / Figurines / Messagerie / Onboarding (`08-ui.js`, `10-figurines.js`, `17-messaging.js`, `19-onboarding.js`)

### 🟢 Point positif à souligner
`17-messaging.js` (messagerie enfant-à-enfant) est bien construite : tous les corps de message sont échappés via `_e()`/`esc()` avant insertion dans le DOM (`_renderBubbles`), le système fonctionne par contacts explicitement ajoutés (erreurs `not_contact`/`blocked` si la relation n'existe pas), avec file d'attente hors-ligne. C'est le seul endroit du projet où du texte véritablement saisi par un autre utilisateur est affiché — et c'est traité correctement.

### 🟡 Moyen

**21. Incohérence d'échappement HTML entre modules**
- **Description** (`08-ui.js`, `renderErrors()`, branches `fr`/`hist`, L.64 et L.70) : `e.q` et `e.ok` sont insérés directement dans `innerHTML` sans passer par `esc()`, contrairement à la pratique observée dans `17-messaging.js` ou ailleurs. Dans le flux de données actuel, `e.q`/`e.ok` proviennent de générateurs de questions internes (pas de saisie libre), donc pas d'exploitation possible aujourd'hui.
- **Solution recommandée** : passer ces deux valeurs par `esc()` par cohérence et par précaution (défense en profondeur), au cas où une future matière introduirait des questions à réponse libre.

**22. Messagerie enfant-à-enfant sans aucune modération de contenu**
- **Description** (`17-messaging.js`) : au-delà des phrases pré-écrites (`CHAT_PHRASES`) et autocollants, un champ de texte libre (`msg-input`/`chatSendCurrent`) permet d'envoyer n'importe quel message à un contact ajouté. Aucun filtre de contenu (mots interdits, longueur excessive détectée autrement que par la présence du champ, etc.) n'est appliqué.
- **Pourquoi c'est un point d'attention** : ce n'est pas un bug technique, mais un choix produit à assumer consciemment — la fonctionnalité est protégée par un système de contacts (ajout explicite, présumé validé côté parent via `_chatParentGate`) et non ouverte à des inconnus, ce qui limite beaucoup le risque. Mais un enfant reste libre d'écrire n'importe quoi à un contact ajouté (frère/sœur, cousin…).
- **Solution recommandée** : aucune action technique urgente ; s'assurer que la documentation/l'écran parent présente clairement cette fonctionnalité comme "messagerie libre entre contacts approuvés par un parent", pour que la décision reste éclairée.

**Synthèse lot 6** : lot sans bug détecté ; la messagerie est le module le plus sensible du point de vue "sécurité produit" (texte libre entre enfants) mais est techniquement bien implémentée (échappement correct, contacts gérés).


---

## Lot 7 — Matières (`13-maternelle.js`, `14-primaire.js`, `15-college.js`, `16-francais.js`, `18-histoire.js`)

### 🟢 Vérification ciblée
Même recherche que pour le lot 5 (valeur aléatoire injectée dans un affichage puis oubliée du calcul) : **aucune occurrence trouvée** dans ces 5 fichiers. Le bug du lot 3 (n°11) reste, à ce stade de l'audit, un cas isolé.

### 🟢 Point positif à souligner
`_colChoices()` (`15-college.js`) est un bon exemple de générateur de QCM robuste : les distracteurs sont dédoublonnés contre la bonne réponse ET entre eux via un `Set`, avec un mécanisme de repli qui génère des alternatives supplémentaires si les distracteurs fournis ne suffisent pas à atteindre 4 choix. Aucune collision bonne-réponse/distracteur possible.

### 🟢 Mineur

**23. `_colChoicesTxt()` sans mécanisme de repli (contrairement à `_colChoices()`)**
- **Description** (`15-college.js` L.99) : cette variante "texte" (utilisée pour l'algèbre : factorisation, réduction…) dédoublonne bien via `Set`, mais si les distracteurs fournis se recoupent entre eux ou avec la bonne réponse plus que prévu, elle peut renvoyer un QCM à seulement 2 ou 3 choix au lieu de 4 (pas de génération d'alternatives de repli comme dans `_colChoices`).
- **Impact** : cosmétique — la question reste juste, seul le nombre de boutons affichés peut varier occasionnellement. Non prioritaire.

**Synthèse lot 7** : les cinq générateurs de matières sont de bonne qualité, avec une attention réelle portée à l'anti-collision des QCM. Aucun bug de justesse détecté.


---

## Lot 8 — PWA / Configuration / Sécurité (`sw.js`, `index.html`, `manifest.webmanifest`, `styles.css`, configs)

### 🟢 Vérification ciblée : cohérence du cache PWA
Comparaison automatisée entre la liste `CRITICAL_URLS` du service worker et les fichiers `.js` réellement présents dans le projet : **les 25 fichiers correspondent exactement**, aucun oubli. L'ordre de chargement dans `index.html` respecte bien les dépendances (ex. `01-core.js` avant tout le reste, `11-init.js` en dernier). Le service worker lui-même est bien conçu : stratégie *network-first* pour le HTML/JS/CSS (évite le bug historique de cache figé), *stale-while-revalidate* pour les assets, bypass explicite pour `/debug.html`.

### 🟡 Moyen

**24. `no-undef: "off"` dans la configuration ESLint — la classe de bug la plus significative de l'audit n'est pas détectable statiquement**
- **Description** (`_eslintrc.json`) : la règle qui détecterait l'appel à une fonction/variable non définie est explicitement désactivée.
- **Pourquoi c'est un problème** : c'est une conséquence directe du point n°3 (lot 1, absence de modules) — activer `no-undef` tel quel produirait des centaines de faux positifs puisque toutes les fonctions sont des globales inter-fichiers. Résultat : aucun outil du projet ne peut détecter à la compilation/au lint un nom de fonction mal orthographié lors d'un copier-coller — exactement la cause probable des bugs historiques de bouton ✕ manquant (déjà signalés dans `CONTEXTE_TRANSITION_ODYSSEE_v2.md`).
- **Solution recommandée** : construire une liste `globals` ESLint exhaustive (un objet `{"nomDeFonction": "readonly", ...}` pour toutes les fonctions/constantes globales du projet, générable une fois par script à partir des déclarations `^function `/`^const [A-Z_]+=`), puis réactiver `no-undef`. Cela redonnerait un vrai filet de sécurité statique sans toucher à l'architecture.

**25. Absence de Content-Security-Policy**
- **Description** (`index.html`) : aucune balise `<meta http-equiv="Content-Security-Policy">` ni en-tête équivalent.
- **Pourquoi c'est un problème** : en cas de future faille XSS (même mineure, cf. point n°21), une CSP bien configurée limiterait fortement les dégâts possibles (empêcherait l'exécution de script injecté). Non urgent vu l'absence de vecteur d'injection actif constaté dans cet audit, mais recommandé en défense en profondeur.
- **Solution recommandée** : ajouter une CSP restrictive autorisant seulement le strict nécessaire (origine propre, `https://odyssee-sync.air7841.workers.dev` pour les appels réseau, Google Fonts).

### 🟢 Mineur

**26. Incohérence de versioning entre `package.json` (6.2.0) et `sw.js` (`CACHE_VERSION = 'v11.7.2'`)**
- Les deux numéros suivent des logiques différentes et ne sont manifestement plus synchronisés (les commentaires du code font référence à des jalons v8.x-v11.x bien après la version 6.2.0 du package). Purement cosmétique/métadonnées — aucun impact fonctionnel — mais à clarifier si `package.json` est censé refléter la version réelle de l'app.

**27. `?v=1094` isolé sur `11-init.js` dans `index.html`**
- Seul ce script porte un paramètre de cache-busting manuel, vestige probablement antérieur à la stratégie *network-first* du service worker (qui rend ce paramètre redondant aujourd'hui). Sans risque, mais source de confusion pour un futur contributeur qui se demandera pourquoi seul ce fichier a ce traitement.

**Synthèse lot 8** : bonne nouvelle sur le point le plus à risque (cohérence cache/fichiers, vérifiée automatiquement). Les points n°24 et 25 sont les deux améliorations de fond les plus utiles de ce lot.


---

## Lot 9 — Tests (`*_test.js`, `vitest_config.js`, `loadGame.js`, `setup.js`)

### 🔴 Critique

**28. Lacune de couverture majeure : aucun test sur les générateurs de questions numériques (le cœur du produit)**
- **Description** : la suite compte 122 tests répartis sur 12 fichiers (`rename-profile`, `opstats`, `jsattr`, `profile-unlock`, `histoire`, `hist-cat-filters`, `fr-cat-filters`, `tech-debt-fixes`, `epilogue-bonus`, `photo-playercode`, `music-ducking`, `odyssee-temps`). Recherche exhaustive (`grep`) : **aucun test n'appelle directement `genQ_CP`, `genQ_CE1`, `genQ_CE2`, `genQ_CM1`, `genQ_CM2`, `genQ_6E`, `genQ_5E`, `genQ_4E` ou `genQ_3E`** — les neuf générateurs de questions arithmétiques de `04-questions.js`.
- **Pourquoi c'est un problème** : c'est très exactement pourquoi le bug n°11 (réponse fausse en 5e, priorité opératoire) a pu passer inaperçu — la partie du code la plus critique pour la mission éducative du produit (« la bonne réponse affichée correspond-elle à la question posée ? ») est aussi la seule à n'avoir AUCUN filet de sécurité automatisé. Le reste du produit (profils, filtres, historique, corrections de bugs passés) est, à l'inverse, bien couvert et avec une bonne discipline (tests nommés `[fixé vX.Y.Z]` documentant explicitement une régression corrigée).
- **Solution recommandée** : ajouter, pour chaque `genQ_*`, un test de type "invariant" exécuté un grand nombre de fois (ex. 500-1000 itérations avec des mocks légers de `P`/`GM`), qui vérifie pour chaque question générée que `res` est bien la valeur mathématiquement correcte de l'expression contenue dans `display` (recalculée indépendamment, ou au moins validée par une expression régulière + `eval` contrôlé côté test). Un tel test aurait immédiatement détecté le bug n°11.
- **Impact** : ce n'est pas un correctif de code produit, mais l'investissement de test le plus rentable de tout l'audit — il aurait à lui seul évité la trouvaille la plus grave (n°11) et empêcherait toute régression future du même type dans ces générateurs très denses et très copié-collés (cf. n°14, lot 3).

### 🟢 Point positif à souligner
La qualité DES tests existants est bonne : noms de tests explicites, tests de non-régression documentés avec leur numéro de version de correction (ex. `[fixé v11.1.10] fr-opp...`), bon usage de `beforeEach`/`describe`. Le harnais `loadGame.js` (déjà noté en lot 1) permet de tester le vrai code du jeu sans duplication — bonne pratique d'ingénierie de test pour un projet sans framework/modules.

**Synthèse lot 9** : suite de tests disciplinée mais mal répartie — elle couvre bien la robustesse des profils et les corrections de bugs passés, mais laisse sans filet la fonctionnalité la plus sensible du produit (la justesse mathématique des questions).


---

# Vérification finale — seconde passe

**Question posée : "Si ce logiciel devait être utilisé demain par plusieurs milliers d'utilisateurs, quels problèmes ai-je pu manquer ?"**

En se plaçant dans cette hypothèse, trois zones supplémentaires méritent d'être signalées (au-delà des 28 points déjà détaillés) :

- **Le vrai goulot d'étranglement à l'échelle serait le backend Cloudflare Worker (point n°15), pas le code client.** Toute la logique jeu tourne en local (localStorage), donc le nombre d'utilisateurs simultanés n'a aucun impact sur les performances de l'app elle-même — seul le service de sync cloud verrait sa charge augmenter. C'est là que porterait un audit de montée en charge, pas sur les fichiers fournis ici.
- **Volume de données locales avec des milliers d'utilisateurs actifs sur la durée** : `P.ownedFigurines` est plafonné à 500 entrées (`05-profile.js`), `errorLog`/`historyDetailed`/`history` sont tous plafonnés (30-60 entrées) — bonne hygiène déjà en place, pas de croissance non bornée du localStorage identifiée.
- **Le risque IP (n°8) devient strictement proportionnel à l'échelle** : ce qui est un risque théorique à l'usage familial devient un risque réel et probable dès lors qu'on parle de "milliers d'utilisateurs" — ce point mérite d'être réévalué en priorité absolue si une diffusion à cette échelle est envisagée.

Aucun autre problème structurel majeur n'a été identifié lors de cette seconde passe : l'essentiel des risques d'échelle réels (n°15, n°8) était déjà couvert.

---

# Top 20 des améliorations les plus importantes

| # | Amélioration | Gravité | Lot |
|---|---|---|---|
| 1 | Corriger le calcul de réponse dans `genQ_5E` (branche priorité) | 🔴 Critique | 3 |
| 2 | Ajouter des tests d'invariant sur les 9 générateurs `genQ_*` | 🔴 Critique | 9 |
| 3 | Décider consciemment du sort des figurines sous licence tierce avant toute diffusion élargie | 🔴 Critique | 2 |
| 4 | Sécuriser `window.onload` (try/catch sur chaque bloc) | 🔴 Critique | 1 |
| 5 | Étendre `_bootSanityCheck` à davantage de fonctions inter-modules | 🟠 Important | 1 |
| 6 | Factoriser le code de synthèse vocale dupliqué 3x | 🟠 Important | 1 |
| 7 | Corriger `isTimeBlocked()` pour un fail-open sur config corrompue | 🟠 Important | 3 |
| 8 | Auditer séparément le Worker Cloudflare (rate limiting, permissions) | 🟠 Important | 4 |
| 9 | Réactiver `no-undef` avec une liste `globals` ESLint dédiée | 🟡 Moyen | 8 |
| 10 | Ajouter une Content-Security-Policy | 🟡 Moyen | 8 |
| 11 | Remplacer l'heuristique de genre par un champ profil explicite | 🟡 Moyen | 2 |
| 12 | Simplifier/découper `validate()` (calcul vs affichage) | 🟡 Moyen | 5 |
| 13 | Uniformiser l'échappement HTML (`esc()` partout, supprimer `_esc()` dupliqué) | 🟡 Moyen | 4/6 |
| 14 | Étendre la table `_CHINESE_NY` au-delà de 2035 | 🟡 Moyen | 3 |
| 15 | Corriger la règle grammaticale "quatre-vingt(s)" dans `_numberToFrenchWords` | 🟡 Moyen | 5 |
| 16 | Remplacer le fallback `eval()` de `_bootSanityCheck` par `window[sym]` | 🟡 Moyen | 1 |
| 17 | Documenter clairement la messagerie enfant-à-enfant comme non modérée | 🟡 Moyen | 6 |
| 18 | Factoriser les 9 générateurs `genQ_*` (motif commun) | 🟢 Mineur | 3 |
| 19 | Ajouter un mécanisme de repli à `_colChoicesTxt()` | 🟢 Mineur | 7 |
| 20 | Nettoyer les incohérences de versioning (`package.json` vs `sw.js`) | 🟢 Mineur | 8 |

---

# Plan d'action priorisé

**Court terme (prochaine session de travail, faible effort, fort impact)**
- #1 (bug genQ_5E) — une ligne à corriger.
- #4 (try/catch window.onload) — quelques minutes.
- #7 (isTimeBlocked fail-open) — quelques minutes.
- #16 (retirer eval() du bootcheck) — quelques minutes.

**Moyen terme (prochaines semaines, effort modéré)**
- #2 (tests d'invariant genQ_*) — le chantier le plus rentable de tout l'audit.
- #6 (factoriser la synthèse vocale).
- #9 (réactiver no-undef).
- #10 (CSP).
- #11 (champ genre explicite).
- #13 (uniformiser l'échappement).
- #14 (table Chinese New Year).

**Long terme (à réévaluer si le projet change d'échelle/de diffusion)**
- #3 (figurines sous licence tierce) — décision produit, pas technique.
- #8 (audit du Worker Cloudflare séparément).
- #12 (refonte de `validate()`).
- #17 (documentation messagerie).

---

# Maturité technique actuelle du projet

**Évaluation : Bêta avancée, proche de la Production pour un usage familial/privé.**

**Justification :**
- Les fondamentaux sont solides : validation de sauvegarde exemplaire (lot 4), gestion d'erreurs quasi systématique (try/catch omniprésents), service worker bien conçu avec cache cohérent (lot 8), suite de tests disciplinée bien que mal répartie (lot 9), architecture cloud sync réfléchie (lot 4).
- Un seul bug de correction fonctionnelle a été détecté sur l'ensemble du moteur de génération de questions (n°11) — c'est peu au vu du volume de code analysé (plus de 20 000 lignes), et il est trivial à corriger.
- Ce qui empêche la qualification "Production" pleine et entière :
  1. Le risque IP (n°8/n°3) est un frein réel à toute diffusion publique/commerciale, quelle que soit la qualité technique du code.
  2. Le point unique de rupture au démarrage (n°4/#4 dans le tableau) et l'absence de filet de test sur le cœur mathématique (n°28) sont deux fragilités "silencieuses" typiques d'un projet qui a grandi vite (nombreux "chantiers" successifs visibles dans les commentaires, v8.x → v11.x) sans qu'un audit consolidé n'ait encore eu lieu.
  3. L'absence de modules JS et la désactivation de `no-undef` limitent la capacité du projet à continuer de grandir sans accumuler plus de dette (déjà visible avec les 2 bugs de bouton ✕ historiques).
- Pour un usage strictement familial/privé (le contexte actuel d'après le document de transition fourni), le projet est largement prêt : les correctifs "court terme" ci-dessus suffiraient à lever les seuls points bloquants identifiés.


---

## Lot 10 (complément) — Worker Cloudflare `odyssee-sync` (audit point n°15)

*Code fourni directement par l'utilisateur depuis le dashboard Cloudflare (pas de repo Git connecté, aucune variable/secret configuré).*

### 🟢 Points positifs à souligner
- **CORS bien fait** : `ALLOWED_ORIGINS` est une liste blanche stricte (le domaine de prod + localhost pour le dev) — pas de wildcard `*`, pas de réflexion aveugle de l'origine de la requête. Une requête POST JSON déclenche un preflight CORS ; une origine non autorisée ne peut donc pas compléter une requête d'écriture cross-origin (pas de risque CSRF via un site tiers).
- Le code joueur est hashé (SHA-256) avant de servir de clé KV — bonne hygiène, même si ce n'est pas une protection en soi (voir plus bas).
- Validation raisonnable du payload (types, taille plafonnée à 200 Ko), gestion d'erreurs propre (try/catch, codes HTTP appropriés), pas de fuite d'info sensible dans les réponses.

### 🟠 Important

**29. Aucune limitation de débit (rate limiting)**
- **Description** : le Worker n'implémente aucun throttling applicatif — chaque code joueur (`NOM-XXXXXX`, où XXXXXX est un suffixe aléatoire de 6 caractères, ~1,3 milliard de combinaisons) est la SEULE clé d'accès en lecture (GET), écriture (POST) ET suppression (DELETE), sans aucune autre vérification.
- **Pourquoi c'est un problème** : rien n'empêche un acteur déterminé de tenter une énumération à distance (tester des suffixes en boucle pour un prénom connu/deviné). Cloudflare a des protections plateforme générales (anti-DDoS), mais rien de spécifique à cette API.
- **Conséquences possibles** : accès non autorisé à un profil si le code est deviné par force brute ciblée (plus réaliste si le prénom de l'enfant est connu, puisqu'il compose la moitié "lisible" du code).
- **Solution recommandée** : la plus simple, sans toucher au code du Worker — activer une **règle de limitation de débit** dans le dashboard Cloudflare (Sécurité → Limitation de débit / WAF Rate Limiting Rules), par exemple "max 20 requêtes/minute par IP sur `/profile/*`". Configuration en quelques clics, aucun déploiement de code nécessaire.
- **Impact** : aucun risque de régression, action 100% dashboard.

**30. Endpoint DELETE aussi peu protégé qu'un GET**
- **Description** : `DELETE /profile/{code}` supprime définitivement un profil cloud avec exactement la même "preuve d'autorisation" qu'une simple lecture — connaître (ou deviner) le code suffit.
- **Pourquoi c'est un problème** : une action destructive et irréversible ne devrait pas être aussi accessible qu'une lecture. C'est le point le plus sensible du Worker.
- **Conséquences possibles** : perte définitive de la sauvegarde cloud d'un enfant si son code fuite (capture d'écran partagée, etc.) ou est deviné.
- **Solution recommandée** (à choix, du plus simple au plus robuste) :
  - a) Exiger dans le corps de la requête DELETE le `name` du profil, et vérifier qu'il correspond à celui stocké (frein rapide contre un usage accidentel/superficiel, pas contre un attaquant qui a déjà lu le profil au préalable) ;
  - b) Ajouter un second facteur simple : exiger que le corps contienne le `_syncedAt` actuellement stocké (preuve qu'on a déjà lu ce profil juste avant) ;
  - c) Ne pas exposer DELETE publiquement du tout : le "désactiver la sync cloud" côté client (`disableCloudSync()`) n'a pas besoin d'effacer les données côté serveur, juste de ne plus les utiliser — supprimer l'endpoint DELETE réduirait la surface d'attaque sans perdre de fonctionnalité utile.
- **Impact** : dépend de l'option choisie ; (c) est la plus sûre et la plus simple à mettre en œuvre.

### 🟡 Moyen

**31. Résolution de conflit ("le plus d'XP gagne") falsifiable**
- **Description** : quiconque connaît un code peut pousser un profil avec un XP artificiellement élevé pour forcer l'écrasement définitif du vrai profil côté serveur.
- **Pourquoi c'est un problème** : ce mécanisme protège bien contre son cas d'usage prévu (synchronisation accidentelle entre deux appareils légitimes), mais n'offre aucune garantie face à un acteur malveillant disposant du code.
- **Solution recommandée** : non urgent pour un usage familial ; à mentionner comme limite connue plutôt qu'à corriger dans l'immédiat (une vraie protection nécessiterait une signature/jeton par appareil, disproportionné ici).

**32. Codes partiellement prévisibles**
- **Description** : le préfixe du code est le prénom du joueur en majuscules (ex. `CYRIL-XXXXXX`) — seul le suffixe de 6 caractères est réellement aléatoire.
- **Impact** : réduit l'effort d'un attaquant ciblé (qui connaît déjà le prénom) au seul espace du suffixe. Reste un espace de recherche large (1,3 milliard), mais moins que si le nom entier était aléatoire aussi.
- **Solution recommandée** : non urgent, cosmétique par rapport au point n°29 (le vrai verrou manquant est le rate limiting, pas la prévisibilité du préfixe).

**Synthèse Worker odyssee-sync** : code propre et une bonne base CORS, mais deux vrais manques pour un service qui stocke des données d'enfants à distance : pas de limitation de débit (n°29, correctif dashboard en 5 minutes) et un DELETE trop peu protégé (n°30). Le reste est proportionné à l'usage (familial, non critique).


---

## Lot 10 (suite) — Worker Cloudflare `odyssee-chat` (audit point n°15)

*Architecture : chaque profil a un `id` public ("code ami", partageable) + un `secret` privé (jamais partagé) ; toute requête doit fournir les deux. Stockage D1 (SQL). Bonne base de conception, nettement plus robuste que `odyssee-sync` sur l'authentification — mais plusieurs points à corriger.*

### 🟢 Points positifs à souligner
- **Vraie authentification** (`id` + `secret` privé, jamais exposé) — bien plus solide que le "code = mot de passe" de `odyssee-sync`.
- **Toutes les requêtes SQL sont paramétrées** (`.bind()`) — aucune injection SQL trouvée.
- Le modèle "messagerie fermée, contacts validés des deux côtés" est correctement appliqué côté serveur (`msgSend`/`msgFetch` vérifient `status='accepted'`), pas seulement côté client.
- Gestion du blocage bidirectionnelle bien pensée (`isBlocked` vérifie les deux sens).

### 🟠 Important

**33. CORS entièrement ouvert (`Access-Control-Allow-Origin: '*'`)**
- **Description** : contrairement à `odyssee-sync` (liste blanche stricte), ce Worker autorise **n'importe quelle origine**.
- **Pourquoi c'est un problème** : incohérence avec l'autre Worker, et défense en profondeur inutilement affaiblie. Risque pratique limité aujourd'hui car l'authentification repose sur un secret explicite dans le corps JSON (pas un cookie ambiant), donc un site tiers ne peut pas "emprunter" l'identité d'un enfant sans déjà connaître son secret — mais ce n'est pas une raison de laisser la porte grande ouverte.
- **Solution recommandée** : remplacer `'*'` par la même liste blanche que `odyssee-sync` (`https://odyssee-des-chiffres.pages.dev`, `http://localhost:8788`).
- **Impact** : aucun risque de régression, une ligne à changer.

**34. Le nom et l'avatar de la cible sont révélés dès l'envoi d'une demande d'ami — avant toute acceptation**
- **Description** (`friendRequest`) : dès qu'un compte (n'importe lequel, l'inscription étant libre et instantanée) envoie une demande vers un `code`, la réponse contient `name` et `avatar` de la cible — **avant même que la cible n'ait rien accepté ou soit notifiée.**
- **Pourquoi c'est un problème** : le "code ami" est conçu pour être partagé (c'est son but), mais quiconque le possède peut ainsi apprendre le prénom réel et l'avatar d'un enfant sans son consentement ni celui de ses parents, simplement en "demandant". Combiné à une inscription libre et sans limite (point n°35), cela permet aussi de sonder l'existence d'un code (`no_such_code` vs succès).
- **Conséquences possibles** : fuite d'identité mineure mais réelle (prénom + avatar) pour un public d'enfants — sensible même si ce n'est pas une donnée à haut risque en soi.
- **Solution recommandée** : ne renvoyer `name`/`avatar` qu'après acceptation effective (dans `friendList`, déjà bien scopé à l'utilisateur authentifié), pas dans la réponse immédiate de `friendRequest`. Remplacer par une confirmation neutre (`{ok:true, status:'pending'}` sans identité).
- **Impact** : correctif ciblé sur une fonction, à vérifier côté client (`17-messaging.js`) si l'affichage du nom lors de l'envoi d'une demande est utilisé quelque part — sinon aucun changement visible pour l'utilisateur légitime.

**35. Inscription (`/register`) libre, illimitée, sans aucune vérification**
- **Description** : n'importe qui peut créer un nombre illimité de comptes en une requête, sans CAPTCHA ni limitation.
- **Pourquoi c'est un problème** : combiné au point n°34, permet de créer des comptes jetables pour sonder des codes ou spammer des demandes d'ami vers un enfant donné (harcèlement léger/désagrément, pas une intrusion technique).
- **Solution recommandée** : couvert par la même limitation de débit dashboard que le point n°29 (Cloudflare → Sécurité → Limitation de débit), appliquée notamment sur `/register` et `/friend/request`.

**36. Messages d'erreur bruts renvoyés au client**
- **Description** : le `catch` global renvoie `String(e.message)` tel quel dans la réponse HTTP 500.
- **Pourquoi c'est un problème** : une exception inattendue peut révéler des détails d'implémentation (structure de requête SQL, noms de colonnes/tables) utiles à un attaquant qui teste l'API. Les "Journaux Workers" sont déjà activés côté dashboard (visible sur ta capture) — le détail devrait y rester, pas partir au client.
- **Solution recommandée** : renvoyer un message générique (`{error:'server'}`) au client, et garder `console.error(e)` pour le détail (visible dans les Journaux Workers déjà activés).
- **Impact** : aucun risque de régression, une ligne à changer.

### 🟡 Moyen

**37. Aucune limitation de débit** — même remarque qu'au point n°29 pour `odyssee-sync` : à traiter avec la même règle Cloudflare, étendue aux routes de ce Worker (`/register`, `/friend/request`, `/msg/send` notamment).

**38. Comparaison du secret non "constant-time"**
- **Description** : `u.secret === secret` est une comparaison JS classique, pas une comparaison à temps constant.
- **Pourquoi c'est un problème (en théorie)** : ouvre la porte à une attaque par mesure de temps pour deviner le secret caractère par caractère.
- **En pratique** : sur une API distante via HTTP, le bruit du réseau rend ce type d'attaque extrêmement difficile à exploiter ; le secret fait 28 caractères aléatoires (entropie très large). Risque théorique, non prioritaire.
- **Solution recommandée** (optionnelle, bonne pratique) : comparer via un hash (`crypto.subtle.digest`) plutôt que la chaîne en clair, ou une fonction de comparaison à temps constant.

**39. Pas de mécanisme de rotation/révocation du secret**
- Si un `secret` venait à fuiter, rien ne permet de le régénérer pour le même `id` — il faudrait recréer une identité complète. Non urgent, mais à garder en tête si un jour un vrai incident de fuite survient.

**Synthèse Worker odyssee-chat** : bien mieux conçu que `odyssee-sync` sur l'authentification (vrai secret, pas juste un code), aucune injection SQL. Les points n°33/34/36 sont les plus simples et les plus utiles à corriger rapidement (quelques lignes chacun, zéro risque de régression).


---

## Clôture du point n°15 (Worker Cloudflare) — ✅ Résolu

Toutes les actions ont été mises en œuvre et déployées :
- **`odyssee-sync`** : endpoint DELETE public retiré (n°30) ; limitation de débit ajoutée, 1000 req/min (n°29)
- **`odyssee-chat`** : CORS restreint à une liste blanche (n°33) ; nom/avatar non révélés avant acceptation d'une demande d'ami (n°34) ; erreurs génériques renvoyées au client (n°36) ; limitation de débit ajoutée, 2000 req/min (n°37)
- **Correctif supplémentaire découvert en cours de route** : le compteur de débit initial se réinitialisait mal (jamais tant que le trafic continuait) — corrigé avec une vraie fenêtre à heure de départ fixe.
- **Correctif supplémentaire découvert en cours de route (2)** : écrire dans KV à chaque requête aurait pu épuiser le quota gratuit (1000 écritures/jour) et planter les Workers — corrigé par échantillonnage des écritures (facteur ~50) + repli sûr en cas d'échec KV.
- Tout testé en local via wrangler (KV/D1 simulés) avant déploiement : fonctionnalités inchangées, limitation de débit vérifiée numériquement (blocage au bon seuil, écritures réduites comme prévu).
- Points n°31/n°32/n°35/n°38/n°39 : conservés tels quels (risques résiduels faibles, acceptés consciemment pour un usage familial).


---

## Point n°18 — Filet de sécurité posé (refonte elle-même laissée de côté)

9 tests de caractérisation ajoutés (`validate-characterization.test.js`), couvrant les mécaniques les plus centrales de `validate()` :
- Bonne réponse (score, combo, stats d'opération, dégâts au boss)
- Bonus de combo élevé (≥10)
- Mauvaise réponse (reset combo, stats d'échec, log d'erreur)
- Réponse invalide (`null`)
- Boss vaincu (dernier coup)
- Bouclier de boss (absorption puis rupture)
- Phase d'enrage (déclenchement à mi-vie)
- Mode maternelle (absence de sanction)

Deux ajouts au harnais de test (`loadGame.js`, pas au code du jeu) ont été nécessaires : exposition de `validate`/`GS`/`powers`, et un `remove()` manquant sur le stub DOM. Suite complète revalidée : **165/165 tests passent**, aucune régression.

**Refonte proprement dite (séparer calcul/affichage) : volontairement laissée de côté**, à reconsidérer un jour si une évolution majeure du système de combat le justifie — le filet de sécurité posé aujourd'hui rendrait cette refonte nettement moins risquée le moment venu.

