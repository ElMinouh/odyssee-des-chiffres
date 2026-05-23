// 02-data.js — L'Odyssée des Chiffres
'use strict';

// Constantes du jeu : niveaux, zones, skins, sons, pouvoirs, événements,
// badges, quêtes, défis hebdo, encouragements, GIFs, géométrie, filtres ops.

const KNOWN=['Soren','Peyo','Tomi','Maman','Papa'];
const UNLOCK_REQ={CP:0,CE1:3,CE2:5,CM1:4,CM2:5};
const HP_LVL={CP:1,CE1:2,CE2:3,CM1:4,CM2:5};
const EMOJIS=['🍎','🎂','⭐','🎈','🐟','🌸','🍬','🚗','🐱','🐶'];
// AVATAR_LIST = ensemble exhaustif des avatars du jeu, réparti par stade dans HERO_STAGES (chantier B2).
// Si tu ajoutes un avatar, ajoute-le ICI **et** dans le stade correspondant de HERO_STAGES.unlockedAvatars.
const AVATAR_LIST=[
 // Œuf (15) — visages enfantins, animaux mignons, formes basiques
 '🧒','🧑','👦','👧','🐣','🐥','🐶','🐕','🐭','🐸','🟢','🟠','🔵','⭐','🍬',
 // Apprenti (27) — mages débutants, animaux, nature, couleurs, jeux
 '🧙','🧝','🦊','🐺','🐻','🦌','🐯','🐍','🐿️','🦆','🦎','🌿','🌸','🎋','🍄','💐','💚','💙','💜','💛','💗','📚','🎲','♟️','🌀','🎀','🧦',
 // Aventurier (30) — héros, créatures, équipement, sciences, éléments
 '🦸','🦹','🥷','🧜','🦄','🐉','🛡️','⚔️','🦁','🤴','🧔','🪖','🪨','⛏️','🎯','🧬','🧪','🐾','🕷️','🕸️','👻','👹','🔪','⚕️','💧','❄️','🧊','😤','😴','🧘',
 // Maître (23) — sages avancés, magie cosmique, créatures puissantes
 '🧙\u200D♂️','🧙\u200D♀️','🦸\u200D♂️','🦸\u200D♀️','🧜\u200D♀️','🧜\u200D♂️','🧚','💎','🔮','🌟','⚡','🔥','🌙','☀️','⛄','😈','🧛','🧟','💀','🦾','🎭','☯️','🚀',
 // Légende (14) — symboles ultimes, divin, futur
 '👑','🏆','🌈','✨','💫','🎆','🎇','🪐','🛸','👽','🤖','💥','👱\u200D♀️','👱',
];

// ── XP SYSTÈME ── niveau 1→50
const XP_TABLE=Array.from({length:50},(_,i)=>Math.round(20+i*25));
// Table cumulative précalculée : xpForLevel(n) = O(1) au lieu de O(n)+allocation
const XP_CUMUL=XP_TABLE.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);
function xpForLevel(lvl){return lvl<=1?0:(XP_CUMUL[lvl-2]??0);}
function levelFromXP(xp){let l=1;for(let i=0;i<XP_TABLE.length;i++){if(xp>=XP_TABLE[i]){xp-=XP_TABLE[i];l++;}else break;}return Math.min(l,50);}
function xpInLevel(xp){for(let i=0;i<XP_TABLE.length;i++){if(xp>=XP_TABLE[i])xp-=XP_TABLE[i];else return{cur:xp,need:XP_TABLE[i]};}return{cur:0,need:XP_TABLE[49]};}

// ── ZONES DE LA CARTE ──
// Le champ `parallax` (chantier B3) définit l'ambiance visuelle de la couche de fond
// affichée derrière la carte d'exploration : couleurs du ciel (3 stops du gradient),
// teinte des montagnes (2 stops), et emoji décoratifs flottants.
const MAP_ZONES=[
 // ═══════════════════════════════════════════════════════
 // CP — 4 zones douces pour débutants (15→60⭐)
 // ═══════════════════════════════════════════════════════
 {id:'plaine',  label:'Plaine des Débuts',bg:'linear-gradient(135deg,#27ae60,#2ecc71)',emoji:'🌾',boss:'🐺',bossName:'Loup des Plaines',level:'CP', starsReq:15,  theme:'standard',
  parallax:{sky:['#87ceeb','#b8e0d2','#a8d8a8'], mountains:['#5a8c5a','#3a6c3a'], decor:['🦋','🌼','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐰', name:'Lapin agile',     questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧩', name:'Énigme du champ', questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🦊', name:'Renard rusé',     questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐗', name:'Sanglier furieux',questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐺', name:'Loup des Plaines',questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'village', label:'Village Joyeux',   bg:'linear-gradient(135deg,#f4a261,#e9c46a)',emoji:'🏡',boss:'🐔',bossName:'Coq Gigantesque',level:'CP', starsReq:25,  theme:'standard',
  parallax:{sky:['#f4a261','#e9c46a','#fff5d6'], mountains:['#8b6f3f','#5e4825'], decor:['🌻','🐄','🐓'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐑', name:'Mouton bondissant',  questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧺', name:'Énigme du marché',   questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🐖', name:'Cochon glouton',     questions:5, difficulty:'easy'},
   {type:'minibss', emoji:'🐄', name:'Taureau du village', questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐔', name:'Coq Gigantesque',    questions:6, difficulty:'medium', dropRare:true}
  ]},
 {id:'prairie', label:'Prairie Fleurie',  bg:'linear-gradient(135deg,#ffd166,#a8d8a8)',emoji:'🌻',boss:'🐝',bossName:'Reine des Abeilles',level:'CP', starsReq:40,  theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#a8d8a8'], mountains:['#7ab87a','#4a884a'], decor:['🌷','🦋','🐝'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐞', name:'Coccinelle malicieuse',questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🌷', name:'Énigme des fleurs',  questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🦗', name:'Sauterelle vive',    questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐛', name:'Chenille géante',    questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐝', name:'Reine des Abeilles', questions:6, difficulty:'medium', dropRare:true}
  ]},
 {id:'bonbons', label:'Pays des Bonbons', bg:'linear-gradient(135deg,#ff9ec7,#ffd6e8)',emoji:'🍭',boss:'🍩',bossName:'Donut Maléfique',level:'CP', starsReq:60,  theme:'sakura',
  parallax:{sky:['#ffd6e8','#ff9ec7','#ff7eb3'], mountains:['#c44a7b','#8b2d56'], decor:['🍬','🧁','🍡'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🍬', name:'Bonbon piquant',     questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧁', name:'Énigme du cupcake',  questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🍡', name:'Brochette dragée',   questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🍪', name:'Cookie monstrueux',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🍩', name:'Donut Maléfique',    questions:6, difficulty:'medium', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CE1 — 4 zones d'exploration et curiosité (80→185⭐)
 // ═══════════════════════════════════════════════════════
 {id:'foret',   label:'Forêt Enchantée',  bg:'linear-gradient(135deg,#1b6b3a,#2ecc71)',emoji:'🌲',boss:'🐲',bossName:'Dragon de Forêt', level:'CE1',starsReq:80,  theme:'foret',
  parallax:{sky:['#2d5a3d','#1a4d2e','#0f3520'], mountains:['#1b3a2a','#0a2418'], decor:['🍂','🦉','🌿'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦋', name:'Papillon mystique', questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🌿', name:'Énigme des lianes', questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🐗', name:'Sanglier sylvestre',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦉', name:'Hibou millénaire',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐲', name:'Dragon de Forêt',   questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'champignons',label:'Vallée des Champignons',bg:'linear-gradient(135deg,#7a5c3a,#a0826d)',emoji:'🍄',boss:'🐌',bossName:'Escargot Géant',level:'CE1',starsReq:110, theme:'foret',
  parallax:{sky:['#a0826d','#7a5c3a','#4a3825'], mountains:['#3a2e1f','#1a1408'], decor:['🍄','🌿','🐛'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🐜', name:'Fourmi guerrière',   questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'🍄', name:'Énigme des spores',  questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🕷️', name:'Araignée tisseuse', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐸', name:'Crapaud farceur',    questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐌', name:'Escargot Géant',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'trolls',  label:'Forêt des Trolls', bg:'linear-gradient(135deg,#2d4a2d,#5a7a5a)',emoji:'⛺',boss:'👺',bossName:'Grand Troll',     level:'CE1',starsReq:145, theme:'foret',
  parallax:{sky:['#5a7a5a','#2d4a2d','#1a3a1a'], mountains:['#0f2810','#051405'], decor:['🌳','🍄','🪵'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐗', name:'Marcassin sauvage',  questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'🌉', name:'Énigme du pont',     questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦝', name:'Raton farceur',      questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👹', name:'Troll des cavernes', questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'👺', name:'Grand Troll',        questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'plage',   label:'Plage Ensoleillée',bg:'linear-gradient(135deg,#fff5d6,#fcbf49)',emoji:'🏖️',boss:'🦀',bossName:'Crabe Royal',     level:'CE1',starsReq:185, theme:'ocean',
  parallax:{sky:['#fff5d6','#fcbf49','#f77f00'], mountains:['#a85a10','#5c3208'], decor:['🐚','⛱️','🌴'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐚', name:'Coquillage chanteur',questions:3, difficulty:'easy'},
   {type:'puzzle',  emoji:'⛱️', name:'Énigme du sable',   questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐟', name:'Poisson saute-vague',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐢', name:'Tortue centenaire',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🦀', name:'Crabe Royal',        questions:6, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CE2 — 4 zones d'aventure (235→415⭐)
 // ═══════════════════════════════════════════════════════
 {id:'desert',  label:'Désert de Feu',    bg:'linear-gradient(135deg,#e67e22,#c0392b)',emoji:'🏜️',boss:'🦂',bossName:'Scorpion Géant',  level:'CE2',starsReq:235, theme:'volcan',
  parallax:{sky:['#f4a261','#e76f51','#9c2a1a'], mountains:['#a04020','#5e2410'], decor:['🌵','🦅','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐍', name:'Serpent du sable',   questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'🏺', name:'Énigme du désert',   questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐪', name:'Chameau enragé',     questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦅', name:'Faucon des dunes',   questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🦂', name:'Scorpion Géant',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'plaines_venteuses',label:'Plaines Venteuses',bg:'linear-gradient(135deg,#c2a878,#8b7355)',emoji:'🌪️',boss:'🦬',bossName:'Bison Tonnerre',level:'CE2',starsReq:290, theme:'standard',
  parallax:{sky:['#c2a878','#8b7355','#5a4830'], mountains:['#3a2e1f','#1a1408'], decor:['🌾','🪶','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐎', name:'Cheval sauvage',     questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'🪶', name:'Énigme du vent',     questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐺', name:'Coyote rusé',        questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🪃', name:'Chasseur des plaines',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🦬', name:'Bison Tonnerre',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'temple',  label:'Temple Antique',   bg:'linear-gradient(135deg,#8b6914,#d4af37)',emoji:'🏛️',boss:'🗿',bossName:'Gardien de Pierre',level:'CE2',starsReq:350, theme:'chateau',
  parallax:{sky:['#d4a847','#b8902a','#8b6914'], mountains:['#5a4410','#2c2008'], decor:['🪨','🏺','📜'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐫', name:'Chamelier perdu',    questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'📜', name:'Énigme des hiéroglyphes',questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris du temple',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🏺', name:'Vase Ensorcelé',     questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🗿', name:'Gardien de Pierre',  questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'profondeurs',label:'Profondeurs Océanes',bg:'linear-gradient(135deg,#011f3f,#013a63)',emoji:'🌊',boss:'🐙',bossName:'Kraken Abyssal',level:'CE2',starsReq:415, theme:'ocean',
  parallax:{sky:['#011f3f','#012a4a','#013a63'], mountains:['#001a35','#000d1c'], decor:['🐠','🪸','🫧'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐡', name:'Poisson-globe',      questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'🪸', name:'Énigme du récif',    questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦑', name:'Calamar géant',      questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🦈', name:'Requin des abysses', questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐙', name:'Kraken Abyssal',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CM1 — 5 zones complexes (490→890⭐)
 // ═══════════════════════════════════════════════════════
 {id:'glace',   label:'Pics de Glace',    bg:'linear-gradient(135deg,#2980b9,#74b9ff)',emoji:'🏔️',boss:'❄️',bossName:'Géant de Glace',  level:'CM1',starsReq:490, theme:'banquise',
  parallax:{sky:['#dfe6e9','#a8c8e0','#74b9ff'], mountains:['#7a9eb8','#3a5a7a'], decor:['❄️','💎','🌬️'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐧', name:'Manchot guerrier',   questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'💎', name:'Énigme de cristal',  questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐺', name:'Loup polaire',       questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🐻‍❄️',name:'Ours des neiges',  questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'❄️', name:'Géant de Glace',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'marais',  label:'Marais Lugubre',   bg:'linear-gradient(135deg,#4a5d3a,#2d3a1f)',emoji:'🕷️',boss:'🐍',bossName:'Hydre Marécageuse',level:'CM1',starsReq:575, theme:'foret',
  parallax:{sky:['#4a5d3a','#2d3a1f','#141a0a'], mountains:['#0a1208','#040804'], decor:['🌿','🐸','💧'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐸', name:'Grenouille géante',  questions:3, difficulty:'medium'},
   {type:'puzzle',  emoji:'💧', name:'Énigme des eaux',    questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🦎', name:'Lézard venimeux',    questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🐊', name:'Crocodile du marais',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐍', name:'Hydre Marécageuse',  questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'forteresse',label:'Forteresse Médiévale',bg:'linear-gradient(135deg,#3a2e1f,#5c4530)',emoji:'🏰',boss:'🐉',bossName:'Dragon Cuirassé',level:'CM1',starsReq:670, theme:'chateau',
  parallax:{sky:['#5c4530','#3a2e1f','#1a1408'], mountains:['#2c1810','#0d0804'], decor:['⚔️','🛡️','🏹'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🐀', name:'Rat des donjons',    questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🗝️', name:'Énigme des cachots', questions:4, difficulty:'hard'},
   {type:'monster', emoji:'⚔️', name:'Garde royal',        questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🛡️', name:'Capitaine de la garde',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐉', name:'Dragon Cuirassé',    questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'sakura',  label:'Mont Sakura',      bg:'linear-gradient(135deg,#ff8fb3,#e56b9b)',emoji:'🌸',boss:'🥷',bossName:'Maître Ninja',     level:'CM1',starsReq:775, theme:'sakura',
  parallax:{sky:['#ffd6e8','#ffb3d1','#ff8fb3'], mountains:['#9c4a6b','#5e2c40'], decor:['🌸','🍃','🏯'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🦊', name:'Kitsune farceur',    questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🏮', name:'Énigme des lanternes',questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🐅', name:'Tigre de bambou',    questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'⛩️', name:'Samouraï errant',    questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🥷', name:'Maître Ninja',       questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'nocturne',label:'Royaume Nocturne', bg:'linear-gradient(135deg,#1b2735,#090a0f)',emoji:'🌙',boss:'🧛',bossName:'Seigneur des Ombres',level:'CM1',starsReq:890, theme:'nuit',
  parallax:{sky:['#090a0f','#1b2735','#2a3145'], mountains:['#050609','#000000'], decor:['🦇','🕯️','💀'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🐺', name:'Loup-garou',         questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🕯️', name:'Énigme du grimoire', questions:4, difficulty:'hard'},
   {type:'monster', emoji:'👻', name:'Spectre errant',     questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'💀', name:'Liche maudite',      questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🧛', name:'Seigneur des Ombres',questions:6, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CM2 — 5 zones ultimes (1015→1525⭐)
 // ═══════════════════════════════════════════════════════
 {id:'volcan',  label:'Volcan Maudit',    bg:'linear-gradient(135deg,#8b0000,#e74c3c)',emoji:'🌋',boss:'🔥',bossName:'Seigneur des Flammes',level:'CM2',starsReq:1015,theme:'volcan',
  parallax:{sky:['#3a0a0a','#6b1010','#a02020'], mountains:['#4a0808','#1a0202'], decor:['🔥','💥','⚡'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🦎', name:'Salamandre de feu',  questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🪨', name:'Énigme de magma',    questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🐉', name:'Drake écailleux',    questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'👹', name:'Démon des cendres',  questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🔥', name:'Seigneur des Flammes',questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'espace',  label:'Galaxie Infinie',  bg:'linear-gradient(135deg,#1a1c2c,#9b59b6)',emoji:'🌌',boss:'👽',bossName:'Alien Quantique',  level:'CM2',starsReq:1150,theme:'espace',
  parallax:{sky:['#0a0a2e','#1a1c4a','#3a2c6e'], mountains:['#2a1a4a','#0a0530'], decor:['✨','🌠','🪐'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🤖', name:'Robot sentinelle',   questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🛸', name:'Énigme cosmique',    questions:4, difficulty:'hard'},
   {type:'monster', emoji:'👾', name:'Envahisseur',        questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🪐', name:'Gardien astral',     questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'👽', name:'Alien Quantique',    questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'cimes',   label:'Cimes Vertigineuses',bg:'linear-gradient(135deg,#4a6d8c,#a0b8d0)',emoji:'⛰️',boss:'🦅',bossName:'Roc Empereur',    level:'CM2',starsReq:1295,theme:'standard',
  parallax:{sky:['#a0b8d0','#7090b0','#4a6d8c'], mountains:['#3a5a7a','#1a3a5a'], decor:['☁️','🪶','🦅'], astro:'🌞'},
  steps:[
   {type:'monster', emoji:'🐐', name:'Bouquetin agile',    questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'☁️', name:'Énigme des nuages',  questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🦉', name:'Hibou des sommets',  questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🦇', name:'Wyverne aérienne',   questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🦅', name:'Roc Empereur',       questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'mecanique',label:'Cité Mécanique',  bg:'linear-gradient(135deg,#7a3a08,#c47a1f)',emoji:'⚙️',boss:'🤖',bossName:'Mecha Suprême',    level:'CM2',starsReq:1450,theme:'volcan',
  parallax:{sky:['#7a3a08','#9c4a10','#c47a1f'], mountains:['#3a1a04','#1a0a02'], decor:['⚙️','🔩','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🔩', name:'Boulon vivant',      questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'⚡', name:'Énigme des circuits',questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🦾', name:'Bras mécanique',     questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🚂', name:'Locomotive d\'acier',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🤖', name:'Mecha Suprême',      questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'ile',     label:'Île Mystérieuse',  bg:'linear-gradient(135deg,#1b4332,#2d6a4f)',emoji:'🏝️',boss:'🏴‍☠️',bossName:'Capitaine Fantôme',level:'CM2',starsReq:1525,theme:'foret',
  parallax:{sky:['#2d6a4f','#1b4332','#081c15'], mountains:['#06150f','#020a05'], decor:['🌴','🦜','💎'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦜', name:'Perroquet pirate',   questions:3, difficulty:'hard'},
   {type:'puzzle',  emoji:'🗺️', name:'Énigme de la carte', questions:4, difficulty:'hard'},
   {type:'monster', emoji:'🐊', name:'Crocodile de jungle',questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'⚓', name:'Quartier-maître',    questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🏴‍☠️', name:'Capitaine Fantôme', questions:6, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // SANCTUAIRE FINAL — 8 étapes, climax de l'Odyssée
 // ═══════════════════════════════════════════════════════
 {id:'sanctuaire',label:'Sanctuaire Final',bg:'linear-gradient(135deg,#0a0014,#3a0a4a)',emoji:'⛩️',boss:'👹',bossName:'Empereur Cosmique',level:'CM2',starsReq:1600,theme:'nuit',
  parallax:{sky:['#0a0014','#1a0530','#3a0a4a'], mountains:['#050008','#000000'], decor:['✨','💫','🌌'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'👁️',  name:'Sentinelle astrale',  questions:4, difficulty:'hard'},
   {type:'puzzle',  emoji:'🔮',  name:'Énigme de l\'au-delà',questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🌀',  name:'Vortex chaotique',    questions:5, difficulty:'hard'},
   {type:'monster', emoji:'⚡',  name:'Foudre primordiale',  questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'🧿',  name:'Énigme cosmique ultime',questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🌟',  name:'Étoile noire',        questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'👁️‍🗨️',name:'Œil de l\'Empereur', questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'👹',  name:'Empereur Cosmique',   questions:8, difficulty:'hard', dropRare:true}
  ]},
];

const HERO_TITLES=[
 {id:'novice',   label:'Novice',               ok:p=>true,                                    col:'#bdc3c7'},
 {id:'apprenti', label:'Apprenti Calculateur', ok:p=>(p.levelWins.CP||0)>=3,                 col:'#3498db'},
 {id:'guerrier', label:'Guerrier des Maths',   ok:p=>(p.badgesEarned||[]).includes('combo5'), col:'#e67e22'},
 {id:'champion', label:'Champion des Tables',  ok:p=>(p.badgesEarned||[]).includes('combo10'),col:'#9b59b6'},
 {id:'sage',     label:'Sage des Fractions',   ok:p=>(p.badgesEarned||[]).includes('fractions'),col:'#2ecc71'},
 {id:'legende',  label:'Légende Mathématique', ok:p=>(p.stars||0)>=500,                      col:'#f1c40f'},
 {id:'maitre',   label:"Maître de l'Odyssée",  ok:p=>(p.history||[]).length>=20,             col:'#e74c3c'},
];
const SKINS=[
 {id:'default',label:'Classiques',  prv:'👾🧟🐉',price:0,  m:{n:['👾','🧟','🐉','🦄','🤖','🧌'],b:['👹','💀','🔥','🐲'],g:['✨','🌟','💎','👑']}},
 {id:'nature', label:'Nature 🌿',   prv:'🐸🦊🐺',price:100,m:{n:['🐸','🦊','🐺','🦁','🐯','🦅'],b:['🐲','🦈','🦖'],g:['🌈','🌸','🌺']}},
 {id:'space',  label:'Espace 🚀',   prv:'👽🤖🛸',price:160,m:{n:['👽','🛸','☄️','🌑','💫','🌀'],b:['⚫','🌌','🔭'],g:['⭐','🌟','💫']}},
 {id:'food',   label:'Gourmand 🍕', prv:'🍕🍟🍩',price:120,m:{n:['🍕','🍟','🍩','🌮','🍔','🍦'],b:['🎂','🍰','🧁'],g:['🍭','🍬','🍫']}},
 {id:'horror', label:'Horreur 💀',  prv:'💀👻🕷️',price:200,m:{n:['💀','👻','🕷️','🦇','🕸️','☠️'],b:['🧟','🧛','👹'],g:['💎','🔮','🩸']}},
];
const VSOUNDS=[
 {id:'fanfare', label:'Fanfare 🎺', play:ctx=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'square',.25,.12),i*120));}},
 {id:'bells',   label:'Cloches 🔔', play:ctx=>{[880,1100,1320,880].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.4,.1),i*200));}},
 {id:'laser',   label:'Laser ⚡',   play:ctx=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+.5);o.type='sawtooth';g.gain.setValueAtTime(.15,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.5);}},
 {id:'chiptune',label:'Chiptune 🎮',play:ctx=>{[262,330,392,523,659].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'square',.15,.08),i*80));}},
 {id:'zen',     label:'Zen 🎵',     play:ctx=>{[528,660,792].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.8,.08),i*300));}},
];
const POWERS=[
 {id:'shield',emoji:'🛡️',label:'Bouclier',     recharge:4,effect:'shield'},
 {id:'double',emoji:'⚡', label:'Double Attaque',recharge:3,effect:'double'},
 {id:'steal', emoji:'🦊', label:'Vol de Points', recharge:5,effect:'steal'},
 {id:'freeze',emoji:'❄️', label:'Gel Timer',     recharge:4,effect:'freeze'},
 {id:'heal',  emoji:'💚', label:'Guérison',      recharge:4,effect:'heal'},
];
const EVENTS=[
 {label:'⛈️ Tempête de Maths !',desc:'×2 points !',      color:'#2980b9',effect:'double_score',dur:3},
 {label:'✨ Tour Doré !',         desc:'Prochaine ×3 !',  color:'#f1c40f',effect:'next_golden',dur:1},
 {label:'👹 Monstre Enragé !',   desc:'Timer réduit !',  color:'#e74c3c',effect:'reduce_timer',dur:2},
 {label:'💊 Soin Magique !',      desc:'Tous +1 PV !',   color:'#2ecc71',effect:'heal_all',dur:1},
];
const BADGES=[
 {id:'first_win',  e:'🥇',l:'Première victoire',   ok:(h,e,gs)=>h.length>=1},
 {id:'combo5',     e:'🔥',l:'Combo x5',             ok:(h,e,gs)=>gs.maxCombo>=5},
 {id:'combo10',    e:'💥',l:'Combo x10',            ok:(h,e,gs)=>gs.maxCombo>=10},
 {id:'no_error',   e:'✨',l:'Partie parfaite',       ok:(h,e,gs)=>gs.errInGame===0&&gs.qCount>=4},
 {id:'score50',    e:'⭐',l:'Score 50+',             ok:(h,e,gs)=>gs.score>=50},
 {id:'score100',   e:'🌟',l:'Score 100+',            ok:(h,e,gs)=>gs.score>=100},
 {id:'survie20',   e:'💀',l:'Survie 20 questions',   ok:(h,e,gs)=>gs.qCount>=20&&GM.mode2==='survie'},
 {id:'speed',      e:'⚡',l:'Chrono maîtrisé',      ok:(h,e,gs)=>GM.mode2==='chrono'&&gs.score>=10},
 {id:'fractions',  e:'🍕',l:'Maître des fractions',  ok:(h,e,gs)=>gs.fracOk>=3},
 {id:'missing_num',e:'🔍',l:'Détective des nombres', ok:(h,e,gs)=>gs.missingOk>=5},
 {id:'veteran',    e:'🏛️',l:'Vétéran (10 parties)', ok:(h,e,gs)=>h.length>=10},
 {id:'combat_win', e:'⚔️',l:'Combattant',           ok:(h,e,gs)=>GM.mode2==='combat'&&gs.combatWon},
 {id:'map_boss1',  e:'🗺️',l:'Explorateur',          ok:(h,e,gs)=>gs.mapBossWon},
 {id:'lvl10',      e:'🔮',l:'Niveau 10',             ok:(h,e,gs)=>(P.xp||0)>=xpForLevel(10)},
];
const QUESTS=[
 {id:'q_3win',   label:'Gagner 3 parties',              goal:3, key:'wins',     reward:12},
 {id:'q_combo5', label:'Faire un combo x5',             goal:1, key:'combo5',   reward:16},
 {id:'q_perf',   label:'Finir sans erreur',             goal:1, key:'perfect',  reward:20},
 {id:'q_stars',  label:"Gagner 50 étoiles aujourd'hui", goal:50,key:'stars',    reward:8},
 {id:'q_10q',    label:'Répondre à 10 questions',       goal:10,key:'questions',reward:8},
 {id:'q_frac',   label:'Réussir 3 fractions',           goal:3, key:'fractions',reward:16},
 {id:'q_miss',   label:'Réussir 5 nbs manquants',       goal:5, key:'missing',  reward:16},
];
// WEEKLY_CH : les filtres sont des fonctions → non-sérialisables en JSON.
// On stocke un id et on reconstruit le filtre à la volée.
const WEEKLY_CH=[
 {id:'w0',label:'Tables de 2',   target:20,reward:32,filter:q=>q.a===2||q.b===2},
 {id:'w1',label:'Tables de 7',   target:20,reward:48,filter:q=>q.a===7||q.b===7},
 {id:'w2',label:'Soustractions', target:15,reward:32,filter:q=>q.op==='-'},
 {id:'w3',label:'Fractions',     target:10,reward:56,filter:q=>q.type==='fraction'},
 {id:'w4',label:'Nbs manquants', target:15,reward:32,filter:q=>q.type==='missing'},
];
function getWCFilter(id){return(WEEKLY_CH.find(c=>c.id===id)||WEEKLY_CH[0]).filter;}
const ENC={
 Soren:['Allez Soren, tu es le meilleur !','Super Soren !','Soren champion ! 🏆'],
 Peyo:['Trop fort Peyo !','Peyo, tu déchires !','Bravo Peyo, quel génie ! 🧠'],
 Tomi:['Tomi en feu ! 🔥','Tomi le guerrier !','Super Tomi !'],
 Maman:['Bravo Maman ! 💪','Maman la meilleure ! 🌟'],
 Papa:["Papa champion ! 🏅","Bravo Papa ! 👑"],
 def:['Bravo champion !','Excellent travail ! 🌟','Tu es incroyable ! 🔥'],
};
// ── GIFS DE FIN DE PARTIE ──
// Hébergés en local dans assets/gifs/ (chantier v8.4.0)
// Avantages : fonctionnement hors-ligne, affichage instantané, pas de dépendance à Giphy.
// Format des fichiers : `prefixeUnivers_descriptif.gif` (cohérent avec les figurines).
// Pour ajouter de nouveaux GIFs : déposer le fichier dans assets/gifs/ + ajouter une
// entrée ci-dessous + ajouter au précache dans sw.js (PRECACHE_GIFS).
const GIFS=[
 {url:'assets/gifs/ax_obelix.gif',         n:'Obélix'},
 {url:'assets/gifs/bl_happydance.gif',     n:'Bluey Dance'},
 {url:'assets/gifs/cz_hyoga.gif',          n:'Hyoga'},
 {url:'assets/gifs/cz_lion.gif',           n:'Aiolia du Lion'},
 {url:'assets/gifs/cz_seiya.gif',          n:'Seiya'},
 {url:'assets/gifs/cz_shiryu.gif',         n:'Shiryu'},
 {url:'assets/gifs/db_goku.gif',           n:'Goku'},
 {url:'assets/gifs/db_krilin.gif',         n:'Krilin'},
 {url:'assets/gifs/db_tortue_geniale.gif', n:'Tortue Géniale'},
 {url:'assets/gifs/db_trunks.gif',         n:'Trunks'},
 {url:'assets/gifs/db_vegeta.gif',         n:'Vegeta'},
 {url:'assets/gifs/dc_batman.gif',         n:'Batman'},
 {url:'assets/gifs/dr_krokmou.gif',        n:'Krokmou'},
 {url:'assets/gifs/dr_mains.gif',          n:'Dragons'},
 {url:'assets/gifs/fr_cerf.gif',           n:'Sven'},
 {url:'assets/gifs/fr_elsa.gif',           n:'Elsa'},
 {url:'assets/gifs/fr_olaf.gif',           n:'Olaf'},
 {url:'assets/gifs/gd_actarus.gif',        n:'Actarus'},
 {url:'assets/gifs/hp_harry_potter.gif',   n:'Harry Potter'},
 {url:'assets/gifs/hp_hermione.gif',       n:'Hermione'},
 {url:'assets/gifs/hp_ron_weasley.gif',    n:'Ron Weasley'},
 {url:'assets/gifs/kp_applause.gif',       n:'KPop Demon Hunter'},
 {url:'assets/gifs/mc_tao.gif',            n:'Tao'},
 {url:'assets/gifs/mi_ladybug.gif',        n:'Ladybug'},
 {url:'assets/gifs/mk_donald.gif',         n:'Donald'},
 {url:'assets/gifs/mk_mickey.gif',         n:'Mickey'},
 {url:'assets/gifs/mr_mario.gif',          n:'Mario'},
 {url:'assets/gifs/mv_hulk.gif',           n:'Hulk'},
 {url:'assets/gifs/mv_ironman.gif',        n:'Iron Man'},
 {url:'assets/gifs/nj_danse.gif',          n:'Ninjago'},
 {url:'assets/gifs/ot_hyuga.gif',          n:'Mark Landers'},
 {url:'assets/gifs/ot_tsubasa.gif',        n:'Olivier Atton'},
 {url:'assets/gifs/pj_victoire.gif',       n:'Pyjamasques'},
 {url:'assets/gifs/pk_pikachu.gif',        n:'Pikachu'},
 {url:'assets/gifs/sc_dance.gif',          n:'Schtroumpfs'},
 {url:'assets/gifs/sm_lune.gif',           n:'Sailor Moon'},
 {url:'assets/gifs/sp_toutes.gif',         n:'Totally Spies'},
 {url:'assets/gifs/sw_dark_vador.gif',     n:'Dark Vador'},
 {url:'assets/gifs/sw_yoda.gif',           n:'Yoda'},
 {url:'assets/gifs/tu_highfive.gif',       n:'Tortues Ninja'},
 {url:'assets/gifs/zl_link.gif',           n:'Link'},
];
const GEO_Q=[
 ()=>{const s=ri(2,9);return{display:`Périmètre carré côté ${s}`,res:s*4,type:'geo',opKey:'geo',hint:`${s}×4=${s*4}`};},
 ()=>{const l=ri(2,9),w=ri(1,6);return{display:`Périmètre rectangle ${l}×${w}`,res:2*(l+w),type:'geo',opKey:'geo',hint:`(${l}+${w})×2=${2*(l+w)}`};},
 ()=>{const s=ri(2,8);return{display:`Aire carré côté ${s}`,res:s*s,type:'geo',opKey:'geo',hint:`${s}×${s}=${s*s}`};},
 ()=>{const l=ri(2,9),w=ri(1,6);return{display:`Aire rectangle ${l}×${w}`,res:l*w,type:'geo',opKey:'geo',hint:`${l}×${w}=${l*w}`};},
 ()=>{const a=ri(3,7)*10,b=ri(2,5)*10;return{display:`Triangle : angles ${a}° et ${b}°, 3ème ?`,res:180-a-b,type:'geo',opKey:'geo',hint:`180-${a}-${b}=${180-a-b}`};},
];
// ── FILTRES OPS DISPONIBLES ──
const OP_FILTERS=[
 {key:'add',  label:'Additions (+)',       affects:['CP','CE1','CM1']},
 {key:'sub',  label:'Soustractions (−)',   affects:['CE1']},
 {key:'mult', label:'Multiplications (×)', affects:['CE2','CM1','CM2']},
 {key:'div',  label:'Divisions (÷)',       affects:['CM2']},
 {key:'miss', label:'Nombres manquants',   affects:['CE1','CE2','CM1']},
 {key:'frac', label:'Fractions',           affects:['CM2']},
 {key:'geo',  label:'Géométrie',           affects:['CM1','CM2']},
];

// ── Générateurs de questions ──
// ═══════════════════════════════════════════════════════
// PALIERS LONGUE DURÉE (chantier 2.1)
// ═══════════════════════════════════════════════════════
// Chaque entrée : id unique, label, icon, fonction qui retourne le "compte" actuel
// depuis le profil, et un tableau de paliers avec récompenses.
const MILESTONES = [
 {
  id:'veteran', icon:'🏆', label:'Vétéran',
  desc:'Partes gagnées',
  count:p=>Object.values(p.levelWins||{}).reduce((s,n)=>s+n,0),
  tiers:[
   {goal:10,  xp:20, stars:1},
   {goal:50,  xp:30, stars:3},
   {goal:100, xp:40, stars:5},
   {goal:500, xp:50, stars:10, badge:'veteran_gold'},
  ],
 },
 {
  id:'collector', icon:'🎴', label:'Collectionneur',
  desc:'Figurines possédées',
  count:p=>(p.ownedFigurines||[]).length,
  tiers:[
   {goal:10,  xp:20, stars:2},
   {goal:25,  xp:30, stars:4},
   {goal:50,  xp:40, stars:6},
   {goal:100, xp:50, stars:10, badge:'collector_gold'},
  ],
 },
 {
  id:'combo', icon:'🔥', label:'Combo Master',
  desc:'Meilleur combo',
  count:p=>p._bestCombo||0,
  tiers:[
   {goal:10, xp:20, stars:1},
   {goal:20, xp:30, stars:3},
   {goal:30, xp:40, stars:5},
   {goal:50, xp:50, stars:10, badge:'combo_gold'},
  ],
 },
 {
  id:'mastermath', icon:'🧮', label:'Maître Calcul',
  desc:'Questions réussies au total',
  count:p=>Object.values(p.opStats||{}).reduce((s,o)=>s+(o.ok||0),0),
  tiers:[
   {goal:100,  xp:20, stars:2},
   {goal:500,  xp:30, stars:4},
   {goal:1000, xp:40, stars:6},
   {goal:5000, xp:50, stars:10, badge:'math_gold'},
  ],
 },
 {
  id:'fortune', icon:'⭐', label:'Fortune',
  desc:'Étoiles cumulées',
  count:p=>p._totalStarsEarned||p.stars||0,
  tiers:[
   {goal:100,  xp:20, stars:0},
   {goal:500,  xp:30, stars:0},
   {goal:1000, xp:40, stars:0},
   {goal:5000, xp:50, stars:0, badge:'fortune_gold'},
  ],
 },
 {
  id:'explorer', icon:'🗺️', label:'Explorateur',
  desc:'Zones de la carte conquises',
  count:p=>(p.mapBossBeaten||[]).length,
  tiers:[
   {goal:1,  xp:20, stars:2},
   {goal:3,  xp:30, stars:4},
   {goal:5,  xp:40, stars:6},
   {goal:10, xp:50, stars:10, badge:'explorer_gold'},
  ],
 },
];

// Retourne pour une quête donnée : {current, nextGoal, nextReward, currentTier, isMaxed}
function getMilestoneProgress(m, p){
 const current = m.count(p);
 let currentTier = -1;
 for(let i=0;i<m.tiers.length;i++){
  if(current >= m.tiers[i].goal) currentTier = i; else break;
 }
 const nextTier = currentTier + 1;
 const isMaxed = nextTier >= m.tiers.length;
 return {
  current,
  currentTier,
  nextGoal: isMaxed ? m.tiers[m.tiers.length-1].goal : m.tiers[nextTier].goal,
  nextReward: isMaxed ? null : m.tiers[nextTier],
  isMaxed,
 };
}
// ═══════════════════════════════════════════════════════
// Chantier B2 : Stades évolutifs du héros
// ═══════════════════════════════════════════════════════
// Plus le joueur progresse, plus son héros évolue.
// Chaque stade débloque de nouveaux avatars.

const HERO_STAGES = [
 {
  id:'oeuf',
  label:'Œuf',
  icon:'🥚',
  color:'#bdc3c7',
  desc:'Tu fais tes premiers pas dans le monde des chiffres.',
  ok: d => true, // toujours dispo (stade de départ)
  unlockedAvatars: ['🧒','🧑','👦','👧','🐣','🐥','🐶','🐕','🐭','🐸','🟢','🟠','🔵','⭐','🍬'],
 },
 {
  id:'apprenti',
  label:'Apprenti',
  icon:'🌱',
  color:'#2ecc71',
  desc:'Tu maîtrises tes premières opérations.',
  ok: d => (d.totalWins||0) >= 5,
  unlockedAvatars: ['🧙','🧝','🦊','🐺','🐻','🦌','🐯','🐍','🐿️','🦆','🦎','🌿','🌸','🎋','🍄','💐','💚','💙','💜','💛','💗','📚','🎲','♟️','🌀','🎀','🧦'],
 },
 {
  id:'aventurier',
  label:'Aventurier',
  icon:'⚔️',
  color:'#3498db',
  desc:'Tu es devenu un vrai héros !',
  ok: d => (d.totalWins||0) >= 25,
  unlockedAvatars: ['🦸','🦹','🥷','🧜','🦄','🐉','🛡️','⚔️','🦁','🤴','🧔','🪖','🪨','⛏️','🎯','🧬','🧪','🐾','🕷️','🕸️','👻','👹','🔪','⚕️','💧','❄️','🧊','😤','😴','🧘'],
 },
 {
  id:'maitre',
  label:'Maître',
  icon:'🌟',
  color:'#e67e22',
  desc:'Ta sagesse mathématique est reconnue.',
  ok: d => (d.totalWins||0) >= 50 && (d._totalStarsEarned||0) >= 100,
  unlockedAvatars: ['🧙\u200D♂️','🧙\u200D♀️','🦸\u200D♂️','🦸\u200D♀️','🧜\u200D♀️','🧜\u200D♂️','🧚','💎','🔮','🌟','⚡','🔥','🌙','☀️','⛄','😈','🧛','🧟','💀','🦾','🎭','☯️','🚀'],
 },
 {
  id:'legende',
  label:'Légende',
  icon:'👑',
  color:'#f1c40f',
  desc:'Tu fais partie des héros légendaires des chiffres !',
  ok: d => (d.totalWins||0) >= 100 && (d._totalStarsEarned||0) >= 500 && (d.figurinesCount||0) >= 30,
  unlockedAvatars: ['👑','🏆','🌈','✨','💫','🎆','🎇','🪐','🛸','👽','🤖','💥','👱\u200D♀️','👱'],
 },
];

/**
 * Retourne le stade actuel du joueur basé sur P.
 */
function getHeroStage(){
 if(typeof P === 'undefined' || !P) return HERO_STAGES[0];
 const totalWins = Object.values(P.levelWins||{}).reduce((s,n)=>s+n, 0);
 const data = {
  totalWins,
  _totalStarsEarned: P._totalStarsEarned || 0,
  figurinesCount: (P.ownedFigurines||[]).length,
  stars: P.stars || 0,
 };
 // Trouver le stade le plus élevé déverrouillé
 let current = HERO_STAGES[0];
 for(const stage of HERO_STAGES){
  if(stage.ok(data)) current = stage;
 }
 return current;
}

/**
 * Retourne le prochain stade non encore atteint, ou null si on est au max.
 */
function getNextHeroStage(){
 const current = getHeroStage();
 const idx = HERO_STAGES.findIndex(s=>s.id===current.id);
 return idx>=0 && idx < HERO_STAGES.length-1 ? HERO_STAGES[idx+1] : null;
}

/**
 * Retourne tous les avatars accessibles au joueur (cumul de tous les stades atteints).
 * Dédupe en cas de doublon inter-stade (filet de sécurité pour la maintenance).
 */
function getUnlockedAvatars(){
 const current = getHeroStage();
 const idx = HERO_STAGES.findIndex(s=>s.id===current.id);
 const unlocked = [];
 for(let i=0; i<=idx; i++){
  unlocked.push(...HERO_STAGES[i].unlockedAvatars);
 }
 return [...new Set(unlocked)];
}