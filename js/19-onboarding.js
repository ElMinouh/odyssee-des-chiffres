// 19-onboarding.js — L'Odyssée du Savoir
'use strict';
// ═══════════════════════════════════════════════════════
// SYSTÈME D'INFOBULLES PAS-À-PAS (visites guidées) — v11.6.5
//
// 3 visites guidées séquentielles, indépendantes du système d'aide
// contextuelle déjà en place (icônes "i" / pGuide() / PARENT_GUIDES,
// 09-parent.js) qui n'est ni modifié ni remplacé par ce fichier.
//
//  Système 1 — 10 étapes — Premier accès parent (installation initiale).
//              Déclenché automatiquement au tout premier déverrouillage
//              réussi de la Vue Parent. Relançable via le bouton
//              "🔰 Revoir l'installation de démarrage" (Vue Parent).
//              v11.6.5 : VÉRITABLEMENT interactive — la zone en
//              surbrillance est réellement cliquable/saisissable (le
//              reste de l'écran seul est bloqué), et les étapes 3 à 10
//              ciblent automatiquement le profil créé à l'étape 2 (voir
//              _obPendingProfile plus bas), sans rien forcer si aucun
//              profil n'a été créé pendant cette visite.
//  Système 2 — 22 étapes — Présentation exhaustive de la Vue Parent.
//              Déclenché automatiquement une seule fois, juste après que
//              le Système 1 a été TERMINÉ avec succès (bouton "Terminer",
//              pas juste "Passer"). Relançable via le bouton
//              "🔰 Revoir la présentation de la Vue Parent".
//  Système 3 — 28 étapes — Visite exhaustive du compte joueur.
//              Déclenché automatiquement à la toute première connexion
//              de CHAQUE profil (marqueur stocké dans le profil lui-même,
//              donc indépendant d'un profil à l'autre). Relançable via le
//              bouton "🔰 Revoir la visite du compte" (Tableau de bord).
//
// Chaque étape peut définir :
//   nav      : { view, ptab, stab, fn } — navigation réelle avant affichage
//   target   : id DOM de l'élément à mettre en surbrillance (optionnel)
//   accordion: true si `target` est un bouton .accordion à déplier au besoin
// ═══════════════════════════════════════════════════════

// v11.6.5 — Pour les étapes du Système 1 qui pilotent un réglage PAR PROFIL
// (anniversaire, cloud, fichier, messagerie, matières, horaires, filtres),
// associe le sélecteur de profil concerné + la fonction à rappeler pour
// rafraîchir le panneau une fois ce sélecteur repositionné automatiquement
// sur le profil qu'on vient de créer à l'étape 2 (voir _obApplyPendingProfile).
const OB1_PROFILE_TARGETS = {
 'acc-birthday':   { select:'opt-profile',    after:'optSelectProfile' },
 'acc-cloud':      { select:'opt-profile',    after:'optSelectProfile' },
 'acc-fichier':    { select:'opt-profile',    after:'optSelectProfile' },
 'acc-messagerie': { select:'enc-msg-player', after:'renderOptMessaging', passName:true },
 'acc-matieres':   { select:'bsubj-player',   after:'loadBlockedSubjects' },
 'acc-horaires':   { select:'block-player',   after:'loadBlockSettings' },
 'acc-filtres':    { select:'filter-player',  after:'loadFilterSettings' },
};


// ─────────────────────────────────────────────────────────
// SYSTÈME 1 — Premier accès parent (installation initiale)
// ─────────────────────────────────────────────────────────
const OB_STEPS_1 = [
 { icon:'🔑', title:'Bienvenue ! Premier réglage : le code parent',
   body:"Bienvenue dans <b>L'Odyssée du Savoir</b> ! Cette visite guidée va vous accompagner, en 10 étapes, pour mettre en place tout ce qu'il faut avant de laisser votre enfant jouer. Vous pourrez la revoir quand vous voulez grâce à un bouton dédié, en haut de cette page.<br><br>Premier réglage : le <b>code parent</b>. C'est un code à 4 chiffres qui protège l'accès à cette Vue Parent, pour que votre enfant ne puisse pas modifier les réglages tout seul. Par défaut, il vaut <b>1234</b> — un code que tout le monde connaît, donc peu protecteur. Changez-le ici, et notez une <b>question secrète</b> (par exemple « Quelle est votre ville de naissance ? ») qui permettra de le retrouver en cas d'oubli.",
   nav:{ptab:'avance'}, target:'acc-pin', accordion:true },
 { icon:'👥', title:'Créer le profil de votre enfant',
   body:"Un <b>profil</b> est l'espace personnel de votre enfant dans le jeu : son avatar, ses étoiles, ses figurines, sa progression. Chaque enfant de la famille doit avoir son propre profil, pour ne jamais mélanger deux progressions.<br><br>Pour créer un profil, tapez le prénom de votre enfant puis validez « Ajouter ». Vous pourrez ensuite lui ajouter une photo (📷, facultatif — utile pour reconnaître son profil au premier coup d'œil), le renommer ou le retirer depuis ce même endroit, sans jamais perdre sa progression.",
   nav:{ptab:'comptes'}, target:'acc-profils-manage', accordion:true },
 { icon:'🎂', title:"La date d'anniversaire",
   body:"Indiquer le jour et le mois de naissance de votre enfant permet au jeu de lui proposer, une fois par an, un petit contenu spécial pour son anniversaire. Ce n'est pas obligatoire, mais c'est une jolie attention automatique.<br><br>Cette information reste strictement locale : elle ne sert qu'à l'intérieur du jeu.",
   nav:{ptab:'comptes'}, target:'acc-birthday', accordion:true, extraTarget:'opt-profile' },
 { icon:'☁️', title:'La sauvegarde en ligne',
   body:"Ce jeu enregistre normalement la progression de votre enfant uniquement <b>sur cet appareil</b> (cet ordinateur, cette tablette…). Si l'appareil est perdu, cassé, ou si votre enfant joue aussi sur un autre appareil, cette progression ne le suivra pas automatiquement.<br><br>La <b>sauvegarde en ligne</b> résout ce problème : elle copie la progression sur un serveur, avec un <b>code unique</b> (par exemple <code>SOREN-7B4K9X</code>). Ce code permet de retrouver le profil de votre enfant sur n'importe quel autre appareil, simplement en le saisissant.<br><br>👉 Notez ce code dans un endroit sûr (photo, carnet, gestionnaire de mots de passe) avant de continuer.",
   nav:{ptab:'comptes'}, target:'acc-cloud', accordion:true, extraTarget:'opt-profile' },
 { icon:'💾', title:'La sauvegarde dans un fichier',
   body:"En plus (ou à la place) de la sauvegarde en ligne, vous pouvez télécharger un <b>fichier</b> contenant toute la progression du profil sélectionné. C'est un peu comme une photo de la sauvegarde à un instant donné, que vous rangez où vous voulez (clé USB, votre propre espace de stockage personnel…).<br><br>En cas de souci, ce même fichier permet de tout restaurer exactement comme avant, grâce au bouton « Importer un fichier ».",
   nav:{ptab:'comptes'}, target:'acc-fichier', accordion:true, extraTarget:'opt-profile' },
 { icon:'✉️', title:"La messagerie de l'enfant",
   body:"Le jeu propose une messagerie qui permet à votre enfant d'échanger de courts messages avec des amis (uniquement via un code ami, jamais par recherche libre). Elle est <b>désactivée par défaut</b>.<br><br>Depuis cet endroit, vous pouvez l'activer, la suspendre à tout moment (sans perdre le code ni les amis de votre enfant), consulter les conversations, et bloquer un contact si besoin. Rien n'est caché à un parent : tout reste consultable ici.",
   nav:{ptab:'encadrement'}, target:'acc-messagerie', accordion:true },
 { icon:'📖', title:'Les matières autorisées',
   body:"Le jeu propose plusieurs matières (mathématiques, français, histoire…). Si vous souhaitez que votre enfant ne s'entraîne que sur certaines d'entre elles pour l'instant, vous pouvez décocher les autres ici — elles redeviendront disponibles dès que vous le déciderez.",
   nav:{ptab:'encadrement'}, target:'acc-matieres', accordion:true },
 { icon:'⏰', title:'Les horaires autorisés',
   body:"Vous pouvez limiter le jeu à une plage horaire précise dans la journée (par exemple, seulement entre 17h et 18h). En dehors de cette plage, le jeu reste installé mais empêche de démarrer une partie, avec un message expliquant pourquoi.<br><br>Cette limite est <b>désactivée par défaut</b> : le jeu reste utilisable à toute heure tant que vous ne l'activez pas volontairement ici.",
   nav:{ptab:'encadrement'}, target:'acc-horaires', accordion:true },
 { icon:'🔢', title:'Les types de questions autorisés',
   body:"Pour chaque matière, vous pouvez retirer certains types de questions précis (par exemple, ne plus poser de divisions, ou retirer une catégorie d'exercices de français). C'est utile si un type d'exercice précis pose problème à votre enfant et que vous préférez le retirer temporairement, sans toucher au reste.",
   nav:{ptab:'encadrement'}, target:'acc-filtres', accordion:true },
 { icon:'🩺', title:'Pour finir : le diagnostic technique',
   body:"Dernière chose à connaître : si la synchronisation entre plusieurs appareils semble ne pas fonctionner un jour, un <b>diagnostic technique</b> est disponible ici. Il affiche un rapport à copier-coller, utile si vous demandez de l'aide.<br><br>Vous n'avez rien à faire ici maintenant — c'est juste utile de savoir que ça existe.<br><br>🎉 <b>Bravo, l'installation initiale est terminée !</b> Une seconde visite guidée va maintenant vous présenter, en détail, tout ce que propose la Vue Parent.",
   nav:{ptab:'avance'}, target:'acc-diagnostic', accordion:true },
];

// ─────────────────────────────────────────────────────────
// SYSTÈME 2 — Présentation exhaustive de la Vue Parent
// ─────────────────────────────────────────────────────────
const OB_STEPS_2 = [
 // Onglet Suivi
 { icon:'👤', title:'Choisir quel enfant regarder',
   body:"Si vous avez plusieurs enfants, ce menu déroulant permet de choisir de qui vous voulez consulter la progression et les réglages. Tout ce que vous verrez dans les prochains écrans concernera l'enfant sélectionné ici.",
   nav:{ptab:'suivi'}, target:'parent-player' },
 { icon:'📈', title:'La Progression',
   body:"Ce bloc résume en un coup d'œil où en est votre enfant : son niveau, les zones de l'aventure déjà conquises, le nombre d'étoiles gagnées, et les badges (récompenses) débloqués.",
   nav:{ptab:'suivi'}, target:'acc-progression', accordion:true },
 { icon:'📊', title:'Les Statistiques',
   body:"Deux vues sont proposées ici : un <b>rapport hebdomadaire</b> (résumé de la semaine de jeu) et la liste des <b>100 dernières questions ratées</b>, avec le détail de chaque erreur. C'est l'endroit le plus précis pour repérer une difficulté qui revient souvent.",
   nav:{ptab:'suivi'}, target:'acc-stats-parent', accordion:true },
 { icon:'📄', title:'Exporter un bilan PDF',
   body:"Ce bouton génère un document PDF récapitulatif de la progression de l'enfant sélectionné, que vous pouvez imprimer ou transmettre (par exemple à un enseignant).",
   nav:{ptab:'suivi'}, target:'btn-export-pdf' },
 // Onglet Encadrement
 { icon:'📚', title:'Le devoir du jour',
   body:"Vous pouvez fixer un <b>exercice précis</b> à réussir dans la journée (une matière, un type d'opération, un niveau, un nombre de questions), avec une récompense en étoiles à la clé. Il apparaîtra pour l'enfant sur son écran d'accueil tant qu'il n'est pas terminé.",
   nav:{ptab:'encadrement'}, target:'acc-hw', accordion:true },
 { icon:'⏰', title:'Les horaires autorisés',
   body:"Comme vu lors de l'installation initiale : vous pouvez restreindre le jeu à une plage horaire précise de la journée. Désactivé par défaut.",
   nav:{ptab:'encadrement'}, target:'acc-horaires', accordion:true },
 { icon:'🔢', title:'Les types de questions autorisés',
   body:"Vous pouvez retirer certains types de questions précis, matière par matière (par exemple, ne plus poser de divisions en mathématiques).",
   nav:{ptab:'encadrement'}, target:'acc-filtres', accordion:true },
 { icon:'📖', title:'Les matières autorisées',
   body:"Vous pouvez n'autoriser que certaines matières pour le moment (mathématiques, français, histoire…) ; les autres resteront simplement grisées pour l'enfant jusqu'à ce que vous les réautorisiez.",
   nav:{ptab:'encadrement'}, target:'acc-matieres', accordion:true },
 { icon:'✉️', title:"La messagerie de l'enfant",
   body:"Depuis ici, vous activez ou suspendez la messagerie, consultez les conversations de votre enfant, et bloquez un contact indésirable. Une messagerie suspendue conserve le code et les amis de l'enfant : la réactiver plus tard ne perd rien.",
   nav:{ptab:'encadrement'}, target:'acc-messagerie', accordion:true },
 // Onglet Comptes
 { icon:'👤', title:'Choisir le profil concerné',
   body:"Ce menu déroulant sélectionne le profil sur lequel agiront tous les réglages de cet onglet : sauvegardes, anniversaire, réinitialisation…",
   nav:{ptab:'comptes'}, target:'opt-profile' },
 { icon:'☁️', title:'La sauvegarde en ligne',
   body:"Retrouvez ici le code de sauvegarde en ligne du profil sélectionné, ainsi que la zone permettant de récupérer un profil sur un nouvel appareil à partir de son code.",
   nav:{ptab:'comptes'}, target:'acc-cloud', accordion:true },
 { icon:'💾', title:'La sauvegarde dans un fichier',
   body:"Téléchargez un fichier de sauvegarde du profil sélectionné, ou restaurez-en un précédemment téléchargé.",
   nav:{ptab:'comptes'}, target:'acc-fichier', accordion:true },
 { icon:'🎂', title:"L'anniversaire de l'enfant",
   body:"Renseignez ou modifiez ici la date d'anniversaire du profil sélectionné.",
   nav:{ptab:'comptes'}, target:'acc-birthday', accordion:true },
 { icon:'🔒', title:'Le code du profil',
   body:"Par défaut, une simple confirmation (« C'est bien toi ? ») s'affiche à chaque connexion de l'enfant, pour éviter qu'il joue par inadvertance sur le profil d'un frère ou d'une sœur.<br><br>Vous pouvez remplacer cette confirmation par un <b>code à 2 chiffres</b> propre à ce profil : il sera alors demandé à la place, jamais en plus. Facultatif et désactivé par défaut.",
   nav:{ptab:'comptes'}, target:'acc-playercode', accordion:true },
 { icon:'🗑', title:'Réinitialiser ce profil',
   body:"Ce bouton efface <b>définitivement</b> toute la progression du profil sélectionné (étoiles, figurines, niveau, badges). Il ne supprime pas le profil lui-même : l'enfant repart simplement de zéro. Cette action est <b>irréversible</b>.",
   nav:{ptab:'comptes'}, target:'acc-reset-one', accordion:true },
 { icon:'👥', title:'Ajouter, renommer ou retirer un enfant',
   body:"Gérez ici la liste complète des profils : ajoutez un nouvel enfant, donnez-lui une photo (📷 sur son avatar, facultatif), renommez un profil existant (sans perdre ses amis ni sa progression), ou retirez un profil de la liste (sa progression reste stockée sur l'appareil, au cas où). La suppression d'un profil vous demande toujours une confirmation.",
   nav:{ptab:'comptes'}, target:'acc-profils-manage', accordion:true },
 { icon:'📦', title:'Tout sauvegarder en un seul fichier',
   body:"Ce bouton télécharge un unique fichier regroupant <b>tous</b> les profils de la famille en une fois — pratique pour tout transférer d'un coup vers un autre appareil, plutôt que profil par profil.",
   nav:{ptab:'comptes'}, target:'acc-export-all', accordion:true },
 // Onglet Figurines
 { icon:'🎴', title:"Les figurines de l'enfant",
   body:"Cet onglet permet de consulter la collection de figurines d'un enfant, de filtrer entre celles déjà possédées et celles qui manquent encore, et de lui en offrir directement sans qu'il ait besoin de les gagner en jouant.",
   nav:{ptab:'figurines'}, target:'ptab-figurines' },
 // Onglet Avancé
 { icon:'🔄', title:'Réparer la synchronisation entre appareils',
   body:"Si les profils ou les messages ne sont pas identiques entre deux appareils (ordinateur, tablette, téléphone), ce bouton renvoie toutes les données de <b>cet</b> appareil vers le serveur. À faire depuis l'appareil qui a les données les plus à jour, puis rouvrir le jeu sur les autres appareils.",
   nav:{ptab:'avance'}, target:'acc-synchro', accordion:true },
 { icon:'🩺', title:'Le diagnostic de synchronisation',
   body:"Affiche un rapport technique détaillé, à copier-coller si vous demandez de l'aide au sujet d'un souci de synchronisation ou de sauvegarde.",
   nav:{ptab:'avance'}, target:'acc-diagnostic', accordion:true },
 { icon:'🔑', title:'Changer le code parent',
   body:"Modifiez ici le code à 4 chiffres qui protège l'accès à cette Vue Parent, ainsi que la question secrète permettant de le retrouver en cas d'oubli.",
   nav:{ptab:'avance'}, target:'acc-pin', accordion:true },
 { icon:'⚠️', title:'Tout réinitialiser',
   body:"Ce bouton remet <b>tous les profils</b> de la famille à zéro d'un seul coup. C'est une action extrême, réservée aux situations exceptionnelles, et elle est <b>totalement irréversible</b>. Préférez « Réinitialiser ce profil » (onglet Comptes) si un seul enfant est concerné.<br><br>🎉 C'est la fin de cette visite de la Vue Parent ! Vous pouvez la revoir à tout moment grâce au bouton dédié, en haut de cette page.",
   nav:{ptab:'avance'}, target:'acc-reset-all', accordion:true },
];

// ─────────────────────────────────────────────────────────
// SYSTÈME 3 — Visite exhaustive du compte joueur
// ─────────────────────────────────────────────────────────
const OB_STEPS_3 = [
 { icon:'🧙', title:'Bienvenue dans ton compte !',
   body:"Bienvenue ! Cette visite va te faire découvrir tout ce que tu peux faire ici. Tu pourras la revoir quand tu veux, grâce à un bouton dans ton tableau de bord.<br><br>Ici, en haut de l'écran d'accueil, tu retrouves ta carte de joueur : ton avatar, ton prénom, et ton niveau.",
   nav:{view:'v-menu'}, target:'menu1-playercard' },
 { icon:'🎨', title:'Le thème visuel',
   body:"Ce menu change le décor et les couleurs de toute l'application (espace, forêt, volcan, océan…). Choisis celui que tu préfères : tu peux en changer à tout moment.",
   nav:{view:'v-menu'}, target:'themeSelect' },
 { icon:'🔊', title:'La voix et la musique',
   body:"Ces deux cases activent ou coupent la voix qui lit les questions à voix haute, et la musique de fond du jeu.",
   nav:{view:'v-menu'}, target:'menu1-toggles-row' },
 { icon:'☁️', title:'La sauvegarde en ligne',
   body:"Ce bloc t'indique si ta progression est sauvegardée en ligne. S'il affiche « Activer », elle n'est encore enregistrée que sur cet appareil : tape dessus pour la retrouver aussi sur une tablette ou un autre téléphone. S'il affiche une coche verte, c'est déjà fait !",
   nav:{view:'v-menu'}, target:'cloud-optin-banner' },
 { icon:'✉️', title:'La messagerie',
   body:"Si ce bouton est visible, tu peux échanger de courts messages avec des amis, grâce à un code ami (jamais de recherche libre). Un parent peut à tout moment consulter tes conversations.",
   nav:{view:'v-menu'}, target:'menu-msg-btn' },
 { icon:'📅', title:'Le défi et le devoir du jour',
   body:"Sur cet écran, tu peux voir un <b>défi de la semaine</b> et, si un parent en a donné un, un <b>devoir du jour</b> : un petit exercice à réussir pour gagner des étoiles en plus.",
   nav:{view:'v-menu2'}, target:'wc-box' },
 { icon:'📖', title:'Choisir sa matière',
   body:"Ce bouton t'amène vers l'écran de choix de la matière : mathématiques, français, histoire, et bientôt d'autres. Chaque matière a sa propre aventure et sa propre progression.",
   nav:{view:'v-subjects'}, target:'subjects-grid' },
 { icon:'🗺️', title:"L'Odyssée : l'aventure",
   body:"Ce grand bouton lance l'aventure principale : une carte à explorer, région par région, remplie de petits défis et de monstres à vaincre en répondant à des questions. Chaque région conquise rapproche un peu plus de la fin de l'histoire.",
   nav:{view:'v-menu2'}, target:'btn-start-odyssee' },
 { icon:'🎮', title:'Les 4 modes de jeu',
   body:"En plus de l'Odyssée, 4 façons de jouer librement : <b>Normal</b> (une série de monstres), <b>Survie</b> (aussi longtemps que possible sans se tromper), <b>Chrono</b> (le plus de bonnes réponses en 60 secondes), et <b>Combat</b> (de 2 à 5 joueurs qui s'affrontent à tour de rôle).",
   nav:{view:'v-menu2'}, target:'modes-grid' },
 { icon:'📊', title:'Le tableau de bord',
   body:"Ce bouton ouvre ton <b>tableau de bord</b> : l'endroit où tout ce que tu as gagné et débloqué est rangé. Regarde en haut : tes étoiles, ton niveau, tes figurines et tes badges, en un coup d'œil.",
   nav:{fn:'toggleSettings'}, target:'tab-hero-header' },
 { icon:'🧩', title:'La boutique de figurines',
   body:"Ici, tu peux échanger les étoiles que tu as gagnées contre de nouvelles figurines à collectionner.",
   nav:{stab:'hero'}, target:'acc-shop-figurines', accordion:true },
 { icon:'😀', title:'Ton avatar',
   body:"Choisis le personnage qui te représente. De nouveaux avatars se débloquent au fil de ta progression.",
   nav:{stab:'hero'}, target:'acc-avatar', accordion:true },
 { icon:'🔊', title:'Ton son de victoire',
   body:"Choisis le petit son ou la petite musique qui joue quand tu gagnes un combat. Certains sont à débloquer avec des étoiles.",
   nav:{stab:'hero'}, target:'acc-vsound', accordion:true },
 { icon:'👾', title:'Les skins de monstres',
   body:"Change l'apparence des monstres que tu affrontes, pour varier les décors de tes combats.",
   nav:{stab:'hero'}, target:'acc-skins', accordion:true },
 { icon:'🏵️', title:'Tes titres de héros',
   body:"Un <b>titre</b> est une petite phrase qui s'affiche à côté de ton nom (par exemple « Maître des Additions »). Tu en débloques de nouveaux en progressant, et tu choisis ici lequel afficher.",
   nav:{stab:'hero'}, target:'acc-titles', accordion:true },
 { icon:'🎵', title:'Les musiques',
   body:"Achète et choisis la musique de fond qui t'accompagne pendant que tu joues.",
   nav:{stab:'hero'}, target:'acc-musics', accordion:true },
 { icon:'🎴', title:'Ta collection de figurines',
   body:"Retrouve ici toutes les figurines que tu as déjà obtenues, rangées par univers, et celles qu'il te reste à découvrir.",
   nav:{stab:'figurines'}, target:'tab-figurines' },
 { icon:'📖', title:'Tes révisions',
   body:"Le jeu garde en mémoire tes dernières erreurs (en mathématiques et en français) pour te permettre de les rejouer et de t'améliorer là où c'est utile.",
   nav:{stab:'milestones'}, target:'acc-revisions', accordion:true },
 { icon:'✖️', title:'Les tables de multiplication',
   body:"Un espace d'entraînement dédié, rien que pour t'exercer sur les tables de 1 à 10, à ton rythme.",
   nav:{stab:'milestones'}, target:'acc-multtable', accordion:true },
 { icon:'🔒', title:'Tes niveaux',
   body:"Visualise ici ta progression de classe en classe (CP, CE1, CE2…) et ce qu'il te reste à accomplir pour débloquer la suivante.",
   nav:{stab:'milestones'}, target:'acc-levels', accordion:true },
 { icon:'🏆', title:'Les paliers à conquérir',
   body:"Des objectifs à plus long terme, qui se remplissent petit à petit au fil de tes parties.",
   nav:{stab:'milestones'}, target:'acc-milestones-list', accordion:true },
 { icon:'🏅', title:'Tes badges',
   body:"Des récompenses spéciales débloquées en accomplissant certains exploits précis (par exemple, une série de bonnes réponses d'affilée).",
   nav:{stab:'milestones'}, target:'acc-badges', accordion:true },
 { icon:'📅', title:'Tes quêtes du jour',
   body:"Chaque jour, de petits défis renouvelés t'attendent ici, avec une récompense à la clé pour chacun.",
   nav:{stab:'stats'}, target:'acc-quests', accordion:true },
 { icon:'🏆', title:'Le classement',
   body:"Compare tes résultats à ceux des autres joueurs de la famille, toutes matières confondues.",
   nav:{stab:'stats'}, target:'acc-lb', accordion:true },
 { icon:'🥇', title:'Tes records',
   body:"Retrouve ici tes meilleurs scores obtenus dans chaque mode de jeu.",
   nav:{stab:'stats'}, target:'acc-records', accordion:true },
 { icon:'📊', title:'Ton graphique de progression',
   body:"Un graphique visuel de tes 7 dernières parties en mathématiques, pour voir ta progression d'un coup d'œil.",
   nav:{stab:'stats'}, target:'acc-chart', accordion:true },
 { icon:'📜', title:'Ton historique détaillé',
   body:"Le détail complet de toutes tes parties précédentes, une par une.",
   nav:{stab:'stats'}, target:'acc-history', accordion:true },
 { icon:'⚙️', title:'Les réglages avancés',
   body:"Pour finir : vibration, ambiance sonore, effets visuels, mode d'affichage clair ou sombre, et choix de la voix qui te parle pendant le jeu — tout se règle depuis cet écran, accessible via le bouton « Paramètres » de l'écran d'accueil.<br><br>🎉 Voilà, tu connais maintenant tout ton compte ! Amuse-toi bien dans L'Odyssée du Savoir.",
   nav:{fn:'gotoParams'}, target:'params-list' },
];

// ═══════════════════════════════════════════════════════
// MOTEUR GÉNÉRIQUE
// ═══════════════════════════════════════════════════════
let _obSystem = null;   // 1, 2 ou 3 (système en cours) ou null
let _obIdx = 0;
let _obSteps = [];
// v11.6.5 : nom du profil créé à l'étape 2 du Système 1 pendant LA VISITE
// EN COURS. Reste null si aucun profil n'a été créé (visite relancée alors
// que des profils existent déjà, étape sautée…) — dans ce cas, chaque
// sélecteur de profil garde son comportement normal (choix manuel).
let _obPendingProfile = null;

function _obStepsFor(n){ return n===1?OB_STEPS_1:(n===2?OB_STEPS_2:OB_STEPS_3); }

// Appelée par pmAddProfile() (09-parent.js) au moment de la création d'un
// profil. Ne mémorise le nom que si on est bien en train de dérouler le
// Système 1 (sans effet en usage normal, hors visite guidée).
function _obNoteProfileCreated(name){
 if(_obSystem===1 && name) _obPendingProfile = name;
}

// Aligne le sélecteur de profil concerné par l'étape en cours sur
// _obPendingProfile, si cette étape en a un ET que ce profil y figure déjà
// (roster à jour). Ne force rien sinon : le sélecteur garde sa valeur/
// son comportement normal, laissant le parent choisir lui-même.
function _obApplyPendingProfile(step){
 if(!_obPendingProfile || !step || !step.target) return;
 const cfg = OB1_PROFILE_TARGETS[step.target];
 if(!cfg) return;
 const sel = document.getElementById(cfg.select);
 if(!sel) return;
 const has = Array.prototype.some.call(sel.options, o => o.value === _obPendingProfile);
 if(!has) return;
 sel.value = _obPendingProfile;
 if(cfg.after && typeof window[cfg.after] === 'function'){
  if(cfg.passName) window[cfg.after](_obPendingProfile); else window[cfg.after]();
 }
}

// ── Marqueurs de progression (Systèmes 1 et 2 : globaux à l'appareil) ──
function _obSeenKey(n){ return 'onb'+n+'_seen'; }         // affichée au moins une fois (Terminer OU Passer)
function _obDoneKey(n){ return 'onb'+n+'_completed'; }    // terminée avec succès (bouton "Terminer")
function obIsSeen(n){ try{ return localStorage.getItem(_obSeenKey(n))==='1'; }catch(e){ return false; } }
function obIsCompleted(n){ try{ return localStorage.getItem(_obDoneKey(n))==='1'; }catch(e){ return false; } }
function _obMarkSeen(n){ try{ localStorage.setItem(_obSeenKey(n),'1'); }catch(e){} }
function _obMarkCompleted(n){ try{ localStorage.setItem(_obDoneKey(n),'1'); }catch(e){} }

// ── Système 3 : marqueur PAR PROFIL (comme les autres préférences de P) ──
function ob3IsCompleted(){ return !!(typeof P!=='undefined' && P && P.onbAccountSeen); }
function ob3MarkCompleted(){
 if(typeof P!=='undefined' && P){
  P.onbAccountSeen = true;
  if(typeof saveProfileNow==='function') saveProfileNow();
  else if(typeof saveProfile==='function') saveProfile();
 }
}

// ── Démarrage / relance (le bouton de relance rappelle TOUJOURS obStart,
//    qui repart systématiquement de l'étape 1 : la visite est relancée
//    dans sa TOTALITÉ, jamais partiellement). ──
function obStart(n){
 _obSystem = n;
 _obIdx = 0;
 _obSteps = _obStepsFor(n);
 _obRenderStep();
}
function obReplay(n){ obStart(n); }

function _obEl(){
 let ov = document.getElementById('ob-overlay');
 if(!ov){
  ov = document.createElement('div');
  ov.id = 'ob-overlay';
  document.body.appendChild(ov);
 }
 return ov;
}

function _obOpenAccordionById(id){
 const btn = document.getElementById(id);
 if(!btn) return null;
 const panel = btn.nextElementSibling;
 if(panel && panel.classList && panel.classList.contains('panel') && panel.style.display!=='block'){
  try{ btn.click(); }catch(e){} // réutilise le mécanisme d'accordéon existant (11-init.js)
 }
 return btn;
}

function _obRenderStep(){
 const step = _obSteps[_obIdx];
 if(!step){ _obFinishClick(); return; }

 // 1) Navigation réelle vers l'écran/onglet concerné
 try{
  if(step.nav){
   if(step.nav.view && typeof navTo==='function') navTo(step.nav.view);
   if(step.nav.ptab && typeof ptab==='function') ptab(step.nav.ptab);
   if(step.nav.stab && typeof stab==='function') stab(step.nav.stab);
   if(step.nav.fn && typeof window[step.nav.fn]==='function') window[step.nav.fn]();
  }
 }catch(e){}

 // 2) Cible à surligner (+ dépliage d'accordéon si besoin), après un court
 //    délai pour laisser le DOM se stabiliser suite à la navigation.
 setTimeout(()=>{
  let targetEl = null;
  if(step.target){
   targetEl = step.accordion ? _obOpenAccordionById(step.target) : document.getElementById(step.target);
   if(targetEl && targetEl.offsetParent===null) targetEl = null; // caché → pas de cible
  }
  // v11.6.5 : aligne le sélecteur de profil concerné (s'il y en a un pour
  // cette étape) sur le profil créé à l'étape 2, AVANT de mesurer/surligner
  // la zone (le contenu du panneau peut changer suite à ce rafraîchissement).
  _obApplyPendingProfile(step);
  // Correctif signalé par Cyril : scroller sur l'accordéon (targetEl) seul
  // le pousse en haut de l'écran et fait sortir step.extraTarget (le
  // sélecteur, situé juste au-dessus dans la page) de la zone visible AVANT
  // même le calcul du spotlight — la fusion de rectangles dans
  // _obTargetRect() donnait alors un rectangle qui remontait bien au-dessus
  // de l'écran, mais _obPositionBox() le recadre ensuite à 0 (haut de
  // l'écran), annulant tout gain visible. On scrolle donc sur l'extraTarget
  // quand elle existe : elle précède toujours la cible principale dans la
  // page, donc l'accordéon reste naturellement visible juste en dessous.
  const _obScrollAnchor = (step.extraTarget && document.getElementById(step.extraTarget)) || targetEl;
  if(_obScrollAnchor && typeof _obScrollAnchor.scrollIntoView==='function'){
   // v11.6.7 : on scrolle la cible EN HAUT de l'écran (pas centrée) — la
   // bulle d'explication est désormais ancrée en bas (voir _obPositionBox),
   // ça laisse toute la partie haute, visible et cliquable, à la cible.
   try{ _obScrollAnchor.scrollIntoView({block:'start'}); window.scrollBy(0,-16); }catch(e){}
  }
  setTimeout(()=>_obShowTooltip(step, targetEl), targetEl?70:0);
 }, 90);
}

// v11.6.5 : rectangle RÉEL de la cible. Pour un accordéon, on unit le
// bouton d'en-tête ET son panneau ouvert (contient les vrais champs/
// boutons) — sinon seul l'en-tête serait rendu cliquable, pas le
// formulaire qu'il contient.
function _obMergeRect(a, b){
 const top = Math.min(a.top, b.top);
 const left = Math.min(a.left, b.left);
 const right = Math.max(a.right, b.right);
 const bottom = Math.max(a.bottom, b.bottom);
 return { top, left, right, bottom, width: right-left, height: bottom-top };
}
function _obTargetRect(step, targetEl){
 if(!targetEl) return null;
 let r = targetEl.getBoundingClientRect();
 if(step.accordion){
  const panel = targetEl.nextElementSibling;
  if(panel && panel.style && panel.style.display === 'block'){
   r = _obMergeRect(r, panel.getBoundingClientRect());
  }
 }
 // Signalé par Cyril : les étapes ciblant acc-birthday/acc-cloud/acc-fichier
 // (onglet Comptes) laissaient le sélecteur de profil #opt-profile — situé
 // juste au-dessus, hors de la zone surlignée — impossible à atteindre
 // pendant ces étapes précises. step.extraTarget permet d'inclure un second
 // élément dans le trou de surbrillance en réutilisant la même fusion.
 if(step.extraTarget){
  const extraEl = document.getElementById(step.extraTarget);
  if(extraEl) r = _obMergeRect(r, extraEl.getBoundingClientRect());
 }
 return r;
}

function _obShowTooltip(step, targetEl){
 const ov = _obEl();
 const total = _obSteps.length;
 const num = _obIdx+1;
 const isLast = num===total;
 const dots = _obSteps.map((s,i)=>
  '<span class="ob-dot'+(i<_obIdx?' ob-done':'')+(i===_obIdx?' ob-current':'')+'"></span>'
 ).join('');
 const hasTarget = !!targetEl;
 ov.innerHTML =
  (hasTarget
   ? '<div class="ob-blocker-piece" id="ob-bp-t"></div><div class="ob-blocker-piece" id="ob-bp-b"></div><div class="ob-blocker-piece" id="ob-bp-l"></div><div class="ob-blocker-piece" id="ob-bp-r"></div><div class="ob-spotlight" id="ob-spotlight"></div>'
   : '<div class="ob-blocker"></div>')
  + '<div class="ob-box'+(hasTarget?'':' ob-centered')+'" id="ob-box">'
  +  '<div class="ob-box-scroll">'
  +   '<div class="ob-progress">'+dots+'</div>'
  +   '<div class="ob-counter">ÉTAPE '+num+' SUR '+total+'</div>'
  +   '<div class="ob-icon">'+(step.icon||'💡')+'</div>'
  +   '<div class="ob-title">'+step.title+'</div>'
  +   '<div class="ob-body">'+step.body+'</div>'
  +  '</div>'
  +  '<div class="ob-footer">'
  +   '<div class="ob-nav">'
  +    '<button class="ob-btn-prev" onclick="obPrev()" style="'+(_obIdx===0?'visibility:hidden;':'')+'">&#8592; Précédent</button>'
  +    '<button class="ob-btn-next" onclick="'+(isLast?'_obFinishClick()':'obNext()')+'">'+(isLast?'Terminer ✅':'Suivant →')+'</button>'
  +   '</div>'
  +   '<div style="text-align:center;margin-top:8px;">'
  +    '<button class="ob-btn-skip" onclick="obSkip()">Passer le reste de la visite</button>'
  +   '</div>'
  +  '</div>'
  + '</div>';
 ov.classList.remove('hidden');
 _obPositionBox(step, targetEl);
 // v11.7.41 (P4) : piège de focus seulement quand la bulle est centrée
 // (pas de vraie zone de la page à surligner) — quand une cible réelle
 // est mise en avant (spotlight), l'utilisateur doit pouvoir interagir
 // avec elle directement, donc on ne piège pas le focus dans ce cas.
 if(ov._releaseTrap){ ov._releaseTrap(); delete ov._releaseTrap; }
 if(!hasTarget && typeof trapFocus==='function'){
  ov._releaseTrap = trapFocus(ov);
 } else if(typeof focusFirstIn==='function'){
  focusFirstIn(ov);
 }
}

function _obPositionBox(step, targetEl){
 const box = document.getElementById('ob-box');
 if(!box) return;
 try{
  const vh = window.innerHeight || 600, vw = window.innerWidth || 360;
  const r = _obTargetRect(step, targetEl);
  if(!r){
   // Cas général (pas de cible précise) : carte centrée classique (CSS .ob-centered).
   box.style.maxHeight = Math.max(200, vh-24)+'px';
   return;
  }
  const pad = 8;
  // Trou RÉEL (pas seulement visuel) exactement calé sur la cible.
  const holeTop = Math.max(0, r.top - pad);
  const holeBottom = Math.min(vh, r.bottom + pad);
  const holeLeft = Math.max(0, r.left - pad);
  const holeRight = Math.min(vw, r.right + pad);
  const holeH = Math.max(0, holeBottom - holeTop);
  const holeW = Math.max(0, holeRight - holeLeft);

  const spot = document.getElementById('ob-spotlight');
  if(spot){
   spot.style.top = holeTop+'px'; spot.style.left = holeLeft+'px';
   spot.style.width = holeW+'px'; spot.style.height = holeH+'px';
  }
  // 4 pans opaques encadrant EXACTEMENT ce trou : tout le reste de l'écran
  // reste bloqué, mais la zone en surbrillance redevient réellement
  // cliquable/saisissable.
  const bpT=document.getElementById('ob-bp-t'), bpB=document.getElementById('ob-bp-b'),
        bpL=document.getElementById('ob-bp-l'), bpR=document.getElementById('ob-bp-r');
  if(bpT){ bpT.style.top='0px'; bpT.style.left='0px'; bpT.style.width=vw+'px'; bpT.style.height=holeTop+'px'; }
  if(bpB){ bpB.style.top=holeBottom+'px'; bpB.style.left='0px'; bpB.style.width=vw+'px'; bpB.style.height=Math.max(0,vh-holeBottom)+'px'; }
  if(bpL){ bpL.style.top=holeTop+'px'; bpL.style.left='0px'; bpL.style.width=holeLeft+'px'; bpL.style.height=holeH+'px'; }
  if(bpR){ bpR.style.top=holeTop+'px'; bpR.style.left=holeRight+'px'; bpR.style.width=Math.max(0,vw-holeRight)+'px'; bpR.style.height=holeH+'px'; }

  // v11.6.8 — CORRECTIF (cibles en bas de page cachées par le tiroir bas
  // systématique de la v11.6.7) : on ancre désormais la bulle du côté
  // (HAUT ou BAS) qui a le PLUS d'espace libre RÉEL autour de la cible,
  // mesuré après le scroll. Un ancrage systématique en bas ne fonctionne
  // pas pour une cible déjà tout en bas de la page : impossible de la faire
  // remonter en haut de l'écran (plus rien à faire défiler en dessous), donc
  // le tiroir bas la recouvrait. Un minimum de 130px est garanti même dans
  // les cas extrêmes (cible qui occupe presque tout l'écran) ; le contenu
  // de la bulle défile alors en interne (.ob-box-scroll) plutôt que de
  // déborder ou d'être rogné.
  const spaceAbove = r.top;
  const spaceBelow = vh - r.bottom;
  const gap = 8, MIN_DRAWER = 130;
  const dockBottom = spaceBelow >= spaceAbove;
  const avail = Math.max(MIN_DRAWER, (dockBottom ? spaceBelow : spaceAbove) - gap);
  const drawerH = Math.min(vh*0.46, vh-40, avail);

  box.style.position='fixed';
  box.style.width='100%'; box.style.maxWidth='none';
  box.style.maxHeight = drawerH+'px';
  box.style.left='0px'; box.style.right='0px';
  if(dockBottom){
   box.style.top='auto'; box.style.bottom='0px';
   box.style.borderRadius='16px 16px 0 0';
  } else {
   box.style.top='0px'; box.style.bottom='auto';
   box.style.borderRadius='0 0 16px 16px';
  }
 }catch(e){
  // Filet de sécurité ultime : si le calcul échoue pour une raison
  // quelconque, on recentre plutôt que de risquer un blocage silencieux.
  try{ box.classList.add('ob-centered'); box.style.maxHeight=Math.max(200,(window.innerHeight||600)-24)+'px'; }catch(e2){}
 }
}
try{
 const _obReposition = ()=>{
  if(!_obSystem) return;
  const step = _obSteps[_obIdx]; if(!step) return;
  const t = step.target ? document.getElementById(step.target) : null;
  _obPositionBox(step, t);
 };
 window.addEventListener('resize', _obReposition);
 // v11.6.8 : la page ne défile pas au niveau de la fenêtre mais dans le
 // conteneur #gc (overflow-y:auto) — sans ce second listener, repositionner
 // au scroll ne marchait tout simplement jamais en usage réel.
 window.addEventListener('scroll', _obReposition, {passive:true});
 const _obGc = document.getElementById('gc');
 if(_obGc) _obGc.addEventListener('scroll', _obReposition, {passive:true});
}catch(e){}

function obNext(){ _obIdx++; _obRenderStep(); }
function obPrev(){ if(_obIdx>0){ _obIdx--; _obRenderStep(); } }

function _obCloseUI(){
 const ov = document.getElementById('ob-overlay');
 if(ov){ if(ov._releaseTrap){ov._releaseTrap();delete ov._releaseTrap;} ov.classList.add('hidden'); ov.innerHTML=''; }
}

// v11.6.7 : à la fin d'une visite (Terminer OU Passer), replie tous les
// accordéons qu'elle a pu ouvrir en chemin — Vue Parent (Systèmes 1 et 2)
// et Tableau de bord (Système 3). Sans effet sur les onglets qui n'ont pas
// d'accordéon ouvert (dashCollapseAll ne fait rien s'il n'y a rien à replier).
function _obCollapseAllAccordions(){
 if(typeof dashCollapseAll!=='function') return;
 ['ptab-suivi','ptab-encadrement','ptab-comptes','ptab-avance','tab-hero','tab-figurines','tab-milestones','tab-stats'].forEach(id=>{
  try{ dashCollapseAll(id); }catch(e){}
 });
}

// "Passer" : ferme la visite, la marque comme vue (pour ne plus la relancer
// automatiquement), mais SANS la marquer "terminée avec succès" — ce qui
// signifie qu'elle n'enchaînera pas automatiquement vers la suivante.
function obSkip(){
 const n = _obSystem;
 _obCloseUI();
 _obSystem = null;
 _obPendingProfile = null;
 _obCollapseAllAccordions();
 if(n===1||n===2) _obMarkSeen(n);
 if(typeof _obRefreshButtons==='function') _obRefreshButtons();
}

// "Terminer" (dernière étape) : ferme la visite et la marque comme
// terminée AVEC SUCCÈS. C'est cette réussite, et uniquement elle, qui
// déclenche l'enchaînement automatique du Système 2 après le Système 1.
function _obFinishClick(){
 const n = _obSystem;
 _obCloseUI();
 _obSystem = null;
 _obPendingProfile = null;
 _obCollapseAllAccordions();
 if(n===1||n===2){ _obMarkSeen(n); _obMarkCompleted(n); }
 if(n===3){ ob3MarkCompleted(); }
 if(typeof _obRefreshButtons==='function') _obRefreshButtons();
 if(_obShouldChainToSystem2(n)){
  setTimeout(()=>{ obStart(2); }, 350);
 }
}
// Alias exposé (utilisé par le bouton "Terminer" généré dynamiquement)
function obFinishClick(){ _obFinishClick(); }

// ── Fonctions de décision PURES (sans effet, sans minuteur) : elles
// déterminent SI une visite doit démarrer automatiquement. Séparées des
// setTimeout d'affichage pour rester testables indépendamment du minutage
// visuel (le harness de test n'exécute pas les callbacks setTimeout). ──
function _obShouldChainToSystem2(n){ return n===1 && !obIsSeen(2); }
function _obShouldAutoStart1(){ return !obIsSeen(1); }
function _obShouldFallbackStart2(){ return obIsCompleted(1) && !obIsSeen(2); }
function _obShouldAutoStart3(){ return !!(typeof P!=='undefined' && P && P.name && !P.onbAccountSeen); }
// v11.7.44 (correctif signalé par Cyril) : tant qu'AUCUN profil n'existe dans
// le trousseau, l'installation de démarrage doit revenir à chaque chargement
// de l'app — même si le parent a déjà cliqué "Passer" une fois. Volontairement
// PAS basé sur obIsSeen(1) (qui, lui, reste "vu pour de bon" dès qu'un profil
// existe) : ici c'est la présence d'un profil, et seulement elle, qui arrête
// le rappel automatique.
function _obShouldAutoStartFreshInstall(){
 return (typeof getRoster==='function') && getRoster().length===0;
}

// ── Déclenchement automatique ──
// Système 1 (+ filet de sécurité pour le Système 2) : à chaque déverrouillage
// réussi de la Vue Parent (appelé depuis checkPin(), 09-parent.js).
function obOnParentUnlocked(){
 try{
  const tours = document.getElementById('parent-content-tours');
  if(tours) tours.classList.remove('hidden');
 }catch(e){}
 if(typeof _obRefreshButtons==='function') _obRefreshButtons();
 if(_obShouldAutoStart1()){ setTimeout(()=>{ if(!_obSystem) obStart(1); }, 300); return; }
 // Filet de sécurité : le Système 1 a été complété lors d'une session
 // précédente mais le Système 2 n'a jamais pu s'enchaîner (app fermée
 // entre-temps) → on le propose dès la prochaine ouverture de la Vue Parent.
 if(_obShouldFallbackStart2()){ setTimeout(()=>{ if(!_obSystem) obStart(2); }, 300); }
}

// v11.7.44 : Système 1, cas "tout premier lancement, aucun profil" — appelé
// depuis 11-init.js, à chaque démarrage de l'app. Contrairement à
// obOnParentUnlocked() (qui suppose que le parent a déjà lui-même ouvert la
// Vue Parent et saisi le code), ici on saute directement dans la Vue Parent
// déverrouillée : rien à protéger par un code tant qu'aucun enfant n'est
// configuré sur l'appareil.
function obMaybeAutoStartFreshInstall(){
 if(_obSystem) return;
 if(!_obShouldAutoStartFreshInstall()) return;
 if(typeof openParent==='function') openParent();
 const lock=document.getElementById('parent-lock'); if(lock) lock.classList.add('hidden');
 const content=document.getElementById('parent-content'); if(content) content.classList.remove('hidden');
 if(typeof renderReport==='function') renderReport();
 if(typeof renderReportView==='function') renderReportView();
 if(typeof _obRefreshButtons==='function') _obRefreshButtons();
 obStart(1);
}

// Système 3 : au clic sur "Continuer" pour un profil qui ne l'a jamais vue
// (appelé depuis gotoSubjects(), 01-core.js — plus depuis loadProfile(), qui
// se déclenchait à CHAQUE démarrage de l'app, même sans profil réel créé).
// Le marqueur vit DANS le profil (P), donc chaque enfant a sa propre visite,
// indépendante des autres.
function obMaybeAutoStart3(){
 if(_obSystem) return;
 if(_obShouldAutoStart3()){
  setTimeout(()=>{ if(!_obSystem) obStart(3); }, 400);
 }
}

// ── Boutons de relance : active/désactive le 2e bouton de la Vue Parent
//    tant que le Système 1 n'a pas été complété au moins une fois. ──
function _obRefreshButtons(){
 const b2 = document.getElementById('btn-revisit-tour-2');
 if(b2) b2.disabled = !obIsCompleted(1);
}
