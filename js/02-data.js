// 02-data.js — L'Odyssée des Chiffres
'use strict';

// Constantes du jeu : niveaux, zones, skins, sons, pouvoirs, événements,
// badges, quêtes, défis hebdo, encouragements, GIFs, géométrie, filtres ops.

// ── Roster des profils ──────────────────────────────────────────────
// La liste des joueurs n'est plus codée en dur : elle est gérée par le
// parent (écran Options) et stockée dans localStorage (clé 'roster').
// Migration auto : si 'roster' est absent, on la reconstruit depuis les
// sauvegardes existantes (clés user_*) → aucun progrès n'est perdu.
function _scanSavedProfiles(){ const out=[]; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.slice(0,5)==='user_'){ const n=k.slice(5); if(n && out.indexOf(n)<0) out.push(n); } } }catch(e){} return out; }
function getRoster(){ try{ const r=JSON.parse(localStorage.getItem('roster')||'null'); if(Array.isArray(r)) return r.filter(Boolean); }catch(e){} const found=_scanSavedProfiles(); try{ localStorage.setItem('roster', JSON.stringify(found)); }catch(e){} return found; }
function setRoster(arr){ try{ const clean=(arr||[]).map(x=>String(x).trim()).filter(Boolean); localStorage.setItem('roster', JSON.stringify(clean)); }catch(e){} }
function addToRoster(name){ name=String(name||'').trim(); if(!name) return false; const r=getRoster(); if(r.some(x=>x.toLowerCase()===name.toLowerCase())) return false; r.push(name); setRoster(r); return true; }
function removeFromRoster(name){ setRoster(getRoster().filter(x=>x!==name)); }
// ── Anniversaires des profils (réglés par le parent) ────────────────
// Stockés localement (clé 'birthdays' : { "Prénom": {m,d} }). Aucun
// prénom n'est codé en dur : chaque famille règle les siens.
function getBirthdays(){ try{ const b=JSON.parse(localStorage.getItem('birthdays')||'null'); if(b && typeof b==='object' && !Array.isArray(b)) return b; }catch(e){} return {}; }
function getBirthday(name){ const b=getBirthdays(); return b[name]||null; }
function setBirthday(name,m,d){ name=String(name||'').trim(); if(!name) return; const b=getBirthdays(); m=parseInt(m,10)||0; d=parseInt(d,10)||0; if(m<0)m=0; if(m>12)m=12; if(d<0)d=0; if(d>31)d=31; if(!m&&!d){ delete b[name]; } else { b[name]={m,d}; } try{ localStorage.setItem('birthdays', JSON.stringify(b)); }catch(e){} }
// v8.7.47 : genre des joueurs connus pour les accords (Aventurier/Aventurière, etc.)
// 'm' = masculin, 'f' = féminin. Clés en minuscules pour comparaison insensible à la casse.
const KNOWN_GENDERS={ papa:'m', maman:'f' }; // mots génériques uniquement (pas de prénoms privés)
// Retourne 'm' ou 'f' pour un prénom donné.
// v11.7.3 (audit n°9) : ordre de priorité —
//  1) genre explicite réglé par le parent sur le profil (P.gender, le plus fiable) ;
//  2) table des prénoms génériques connus (papa/maman) ;
//  3) heuristique française en tout dernier recours (finit par 'a'/'e' → féminin) —
//     imparfaite : de nombreux prénoms masculins finissent en -e (Alexandre,
//     Maxime, Timothée…), d'où la priorité donnée aux deux options précédentes.
function heroGender(name, explicitGender){
 if(explicitGender==='m'||explicitGender==='f') return explicitGender;
 const key=(name||'').trim().toLowerCase();
 if(KNOWN_GENDERS[key]) return KNOWN_GENDERS[key];
 // Heuristique de repli pour les prénoms personnalisés sans genre renseigné
 if(/[ae]$/.test(key)) return 'f';
 return 'm';
}
const UNLOCK_REQ={PS:0,MS:3,GS:4,CP:0,CE1:3,CE2:5,CM1:4,CM2:5,'6E':0,'5E':5,'4E':6,'3E':6};
const HP_LVL={PS:1,MS:1,GS:1,CP:1,CE1:2,CE2:3,CM1:4,CM2:5,'6E':3,'5E':3,'4E':4,'3E':4};
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
const PRIM_ZONES=[
 // ═══════════════════════════════════════════════════════
 // CP — 4 zones douces pour débutants (15→60⭐)
 // ═══════════════════════════════════════════════════════
 {id:'plaine',  label:'Plaine des Débuts',bg:'linear-gradient(135deg,#27ae60,#2ecc71)',emoji:'🌾',boss:'🐺',bossName:'Loup des Plaines',level:'CP', starsReq:0,   theme:'standard',
  parallax:{sky:['#87ceeb','#b8e0d2','#a8d8a8'], mountains:['#5a8c5a','#3a6c3a'], decor:['🦋','🌼','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐰', name:'Lapin agile',     questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧩', name:'Énigme du champ', questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🦊', name:'Renard rusé',     questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐗', name:'Sanglier furieux',questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐺', name:'Loup des Plaines',questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'village', label:'Village Joyeux',   bg:'linear-gradient(135deg,#f4a261,#e9c46a)',emoji:'🏡',boss:'🐔',bossName:'Coq Gigantesque',level:'CP', starsReq:25,  theme:'standard',
  parallax:{sky:['#f4a261','#e9c46a','#fff5d6'], mountains:['#8b6f3f','#5e4825'], decor:['🌻','🐄','🐓'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐑', name:'Mouton bondissant',  questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧺', name:'Énigme du marché',   questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🐖', name:'Cochon glouton',     questions:5, difficulty:'easy'},
   {type:'minibss', emoji:'🐄', name:'Taureau du village', questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐔', name:'Coq Gigantesque',    questions:5, difficulty:'medium', dropRare:true}
  ]},
 {id:'prairie', label:'Prairie Fleurie',  bg:'linear-gradient(135deg,#ffd166,#a8d8a8)',emoji:'🌻',boss:'🐝',bossName:'Reine des Abeilles',level:'CP', starsReq:40,  theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#a8d8a8'], mountains:['#7ab87a','#4a884a'], decor:['🌷','🦋','🐝'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐞', name:'Coccinelle malicieuse',questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🌷', name:'Énigme des fleurs',  questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🦗', name:'Sauterelle vive',    questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐛', name:'Chenille géante',    questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐝', name:'Reine des Abeilles', questions:5, difficulty:'medium', dropRare:true}
  ]},
 {id:'bonbons', label:'Pays des Bonbons', bg:'linear-gradient(135deg,#ff9ec7,#ffd6e8)',emoji:'🍭',boss:'🍩',bossName:'Donut Maléfique',level:'CP', starsReq:60,  theme:'sakura',
  parallax:{sky:['#ffd6e8','#ff9ec7','#ff7eb3'], mountains:['#c44a7b','#8b2d56'], decor:['🍬','🧁','🍡'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🍬', name:'Bonbon piquant',     questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🧁', name:'Énigme du cupcake',  questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🍡', name:'Brochette dragée',   questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🍪', name:'Cookie monstrueux',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🍩', name:'Donut Maléfique',    questions:5, difficulty:'medium', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CE1 — 4 zones d'exploration et curiosité (80→185⭐)
 // ═══════════════════════════════════════════════════════
 {id:'foret',   label:'Forêt Enchantée',  bg:'linear-gradient(135deg,#1b6b3a,#2ecc71)',emoji:'🌲',boss:'🐲',bossName:'Dragon de Forêt', level:'CE1',starsReq:80,  theme:'foret',
  parallax:{sky:['#2d5a3d','#1a4d2e','#0f3520'], mountains:['#1b3a2a','#0a2418'], decor:['🍂','🦉','🌿'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦋', name:'Papillon mystique', questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🌿', name:'Énigme des lianes', questions:4, difficulty:'easy'},
   {type:'monster', emoji:'🐗', name:'Sanglier sylvestre',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦉', name:'Hibou millénaire',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐲', name:'Dragon de Forêt',   questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'champignons',label:'Vallée des Champignons',bg:'linear-gradient(135deg,#7a5c3a,#a0826d)',emoji:'🍄',boss:'🐌',bossName:'Escargot Géant',level:'CE1',starsReq:110, theme:'foret',
  parallax:{sky:['#a0826d','#7a5c3a','#4a3825'], mountains:['#3a2e1f','#1a1408'], decor:['🍄','🌿','🐛'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🐜', name:'Fourmi guerrière',   questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'🍄', name:'Énigme des spores',  questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🕷️', name:'Araignée tisseuse', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐸', name:'Crapaud farceur',    questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🐌', name:'Escargot Géant',     questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'trolls',  label:'Forêt des Trolls', bg:'linear-gradient(135deg,#2d4a2d,#5a7a5a)',emoji:'⛺',boss:'👺',bossName:'Grand Troll',     level:'CE1',starsReq:145, theme:'foret',
  parallax:{sky:['#5a7a5a','#2d4a2d','#1a3a1a'], mountains:['#0f2810','#051405'], decor:['🌳','🍄','🪵'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐗', name:'Marcassin sauvage',  questions:4, difficulty:'medium'},
   {type:'puzzle',  emoji:'🌉', name:'Énigme du pont',     questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦝', name:'Raton farceur',      questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👹', name:'Troll des cavernes', questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'👺', name:'Grand Troll',        questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'plage',   label:'Plage Ensoleillée',bg:'linear-gradient(135deg,#fff5d6,#fcbf49)',emoji:'🏖️',boss:'🦀',bossName:'Crabe Royal',     level:'CE1',starsReq:185, theme:'ocean',
  parallax:{sky:['#fff5d6','#fcbf49','#f77f00'], mountains:['#a85a10','#5c3208'], decor:['🐚','⛱️','🌴'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐚', name:'Coquillage chanteur',questions:4, difficulty:'easy'},
   {type:'puzzle',  emoji:'⛱️', name:'Énigme du sable',   questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐟', name:'Poisson saute-vague',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐢', name:'Tortue centenaire',  questions:5, difficulty:'medium'},
   {type:'boss',    emoji:'🦀', name:'Crabe Royal',        questions:5, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CE2 — 4 zones d'aventure (235→415⭐)
 // ═══════════════════════════════════════════════════════
 {id:'desert',  label:'Désert de Feu',    bg:'linear-gradient(135deg,#e67e22,#c0392b)',emoji:'🏜️',boss:'🦂',bossName:'Scorpion Géant',  level:'CE2',starsReq:235, theme:'volcan',
  parallax:{sky:['#f4a261','#e76f51','#9c2a1a'], mountains:['#a04020','#5e2410'], decor:['🌵','🦅','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐍', name:'Serpent du sable',   questions:4, difficulty:'medium'},
   {type:'puzzle',  emoji:'🏺', name:'Énigme du désert',   questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐪', name:'Chameau enragé',     questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦅', name:'Faucon des dunes',   questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🦂', name:'Scorpion Géant',     questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'plaines_venteuses',label:'Plaines Venteuses',bg:'linear-gradient(135deg,#c2a878,#8b7355)',emoji:'🌪️',boss:'🦬',bossName:'Bison Tonnerre',level:'CE2',starsReq:290, theme:'standard',
  parallax:{sky:['#c2a878','#8b7355','#5a4830'], mountains:['#3a2e1f','#1a1408'], decor:['🌾','🪶','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐎', name:'Cheval sauvage',     questions:4, difficulty:'medium'},
   {type:'puzzle',  emoji:'🪶', name:'Énigme du vent',     questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🐺', name:'Coyote rusé',        questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🪃', name:'Chasseur des plaines',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🦬', name:'Bison Tonnerre',     questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'temple',  label:'Temple Antique',   bg:'linear-gradient(135deg,#8b6914,#d4af37)',emoji:'🏛️',boss:'🗿',bossName:'Gardien de Pierre',level:'CE2',starsReq:350, theme:'chateau',
  parallax:{sky:['#d4a847','#b8902a','#8b6914'], mountains:['#5a4410','#2c2008'], decor:['🪨','🏺','📜'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐫', name:'Chamelier perdu',    questions:4, difficulty:'medium'},
   {type:'puzzle',  emoji:'📜', name:'Énigme des hiéroglyphes',questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris du temple',questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🏺', name:'Vase Ensorcelé',     questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🗿', name:'Gardien de Pierre',  questions:5, difficulty:'hard', dropRare:true}
  ]},
 {id:'profondeurs',label:'Profondeurs Océanes',bg:'linear-gradient(135deg,#011f3f,#013a63)',emoji:'🌊',boss:'🐙',bossName:'Kraken Abyssal',level:'CE2',starsReq:415, theme:'ocean',
  parallax:{sky:['#011f3f','#012a4a','#013a63'], mountains:['#001a35','#000d1c'], decor:['🐠','🪸','🫧'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐡', name:'Poisson-globe',      questions:4, difficulty:'medium'},
   {type:'puzzle',  emoji:'🪸', name:'Énigme du récif',    questions:4, difficulty:'medium'},
   {type:'monster', emoji:'🦑', name:'Calamar géant',      questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🦈', name:'Requin des abysses', questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐙', name:'Kraken Abyssal',     questions:5, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // CM1 — 5 zones complexes (490→890⭐)
 // ═══════════════════════════════════════════════════════
 {id:'glace',   label:'Pics de Glace',    bg:'linear-gradient(135deg,#2980b9,#74b9ff)',emoji:'🏔️',boss:'❄️',bossName:'Géant de Glace',  level:'CM1',starsReq:490, theme:'banquise',
  parallax:{sky:['#dfe6e9','#a8c8e0','#74b9ff'], mountains:['#7a9eb8','#3a5a7a'], decor:['❄️','💎','🌬️'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐧', name:'Manchot guerrier',   questions:5, difficulty:'medium'},
   {type:'puzzle',  emoji:'💎', name:'Énigme de cristal',  questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐺', name:'Loup polaire',       questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🐻‍❄️',name:'Ours des neiges',  questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'❄️', name:'Géant de Glace',     questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'marais',  label:'Marais Lugubre',   bg:'linear-gradient(135deg,#4a5d3a,#2d3a1f)',emoji:'🕷️',boss:'🐍',bossName:'Hydre Marécageuse',level:'CM1',starsReq:575, theme:'foret',
  parallax:{sky:['#4a5d3a','#2d3a1f','#141a0a'], mountains:['#0a1208','#040804'], decor:['🌿','🐸','💧'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐸', name:'Grenouille géante',  questions:5, difficulty:'medium'},
   {type:'puzzle',  emoji:'💧', name:'Énigme des eaux',    questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🦎', name:'Lézard venimeux',    questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🐊', name:'Crocodile du marais',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐍', name:'Hydre Marécageuse',  questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'forteresse',label:'Forteresse Médiévale',bg:'linear-gradient(135deg,#3a2e1f,#5c4530)',emoji:'🏰',boss:'🐉',bossName:'Dragon Cuirassé',level:'CM1',starsReq:670, theme:'chateau',
  parallax:{sky:['#5c4530','#3a2e1f','#1a1408'], mountains:['#2c1810','#0d0804'], decor:['⚔️','🛡️','🏹'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🐀', name:'Rat des donjons',    questions:5, difficulty:'hard'},
   {type:'puzzle',  emoji:'🗝️', name:'Énigme des cachots', questions:5, difficulty:'hard'},
   {type:'monster', emoji:'⚔️', name:'Garde royal',        questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🛡️', name:'Capitaine de la garde',questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🐉', name:'Dragon Cuirassé',    questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'sakura',  label:'Mont Sakura',      bg:'linear-gradient(135deg,#ff8fb3,#e56b9b)',emoji:'🌸',boss:'🥷',bossName:'Maître Ninja',     level:'CM1',starsReq:775, theme:'sakura',
  parallax:{sky:['#ffd6e8','#ffb3d1','#ff8fb3'], mountains:['#9c4a6b','#5e2c40'], decor:['🌸','🍃','🏯'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🦊', name:'Kitsune farceur',    questions:5, difficulty:'hard'},
   {type:'puzzle',  emoji:'🏮', name:'Énigme des lanternes',questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🐅', name:'Tigre de bambou',    questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'⛩️', name:'Samouraï errant',    questions:5, difficulty:'hard'},
   {type:'boss',    emoji:'🥷', name:'Maître Ninja',       questions:6, difficulty:'hard', dropRare:true}
  ]},
 {id:'nocturne',label:'Royaume Nocturne', bg:'linear-gradient(135deg,#1b2735,#090a0f)',emoji:'🌙',boss:'🧛',bossName:'Seigneur des Ombres',level:'CM1',starsReq:890, theme:'nuit',
  parallax:{sky:['#090a0f','#1b2735','#2a3145'], mountains:['#050609','#000000'], decor:['🦇','🕯️','💀'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🐺', name:'Loup-garou',         questions:5, difficulty:'hard'},
   {type:'puzzle',  emoji:'🕯️', name:'Énigme du grimoire', questions:5, difficulty:'hard'},
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
   {type:'monster', emoji:'🦎', name:'Salamandre de feu',  questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'🪨', name:'Énigme de magma',    questions:6, difficulty:'hard'},
   {type:'monster', emoji:'🐉', name:'Drake écailleux',    questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'👹', name:'Démon des cendres',  questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'🔥', name:'Seigneur des Flammes',questions:7, difficulty:'hard', dropRare:true}
  ]},
 {id:'espace',  label:'Galaxie Infinie',  bg:'linear-gradient(135deg,#1a1c2c,#9b59b6)',emoji:'🌌',boss:'👽',bossName:'Alien Quantique',  level:'CM2',starsReq:1150,theme:'espace',
  parallax:{sky:['#0a0a2e','#1a1c4a','#3a2c6e'], mountains:['#2a1a4a','#0a0530'], decor:['✨','🌠','🪐'], astro:'🌕'},
  steps:[
   {type:'monster', emoji:'🤖', name:'Robot sentinelle',   questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'🛸', name:'Énigme cosmique',    questions:6, difficulty:'hard'},
   {type:'monster', emoji:'👾', name:'Envahisseur',        questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'🪐', name:'Gardien astral',     questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'👽', name:'Alien Quantique',    questions:7, difficulty:'hard', dropRare:true}
  ]},
 {id:'cimes',   label:'Cimes Vertigineuses',bg:'linear-gradient(135deg,#4a6d8c,#a0b8d0)',emoji:'⛰️',boss:'🦅',bossName:'Roc Empereur',    level:'CM2',starsReq:1295,theme:'standard',
  parallax:{sky:['#a0b8d0','#7090b0','#4a6d8c'], mountains:['#3a5a7a','#1a3a5a'], decor:['☁️','🪶','🦅'], astro:'🌞'},
  steps:[
   {type:'monster', emoji:'🐐', name:'Bouquetin agile',    questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'☁️', name:'Énigme des nuages',  questions:6, difficulty:'hard'},
   {type:'monster', emoji:'🦉', name:'Hibou des sommets',  questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'🦇', name:'Wyverne aérienne',   questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'🦅', name:'Roc Empereur',       questions:7, difficulty:'hard', dropRare:true}
  ]},
 {id:'mecanique',label:'Cité Mécanique',  bg:'linear-gradient(135deg,#7a3a08,#c47a1f)',emoji:'⚙️',boss:'🤖',bossName:'Mecha Suprême',    level:'CM2',starsReq:1450,theme:'volcan',
  parallax:{sky:['#7a3a08','#9c4a10','#c47a1f'], mountains:['#3a1a04','#1a0a02'], decor:['⚙️','🔩','💨'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🔩', name:'Boulon vivant',      questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'⚡', name:'Énigme des circuits',questions:6, difficulty:'hard'},
   {type:'monster', emoji:'🦾', name:'Bras mécanique',     questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'🚂', name:'Locomotive d\'acier',questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'🤖', name:'Mecha Suprême',      questions:7, difficulty:'hard', dropRare:true}
  ]},
 {id:'ile',     label:'Île Mystérieuse',  bg:'linear-gradient(135deg,#1b4332,#2d6a4f)',emoji:'🏝️',boss:'🏴‍☠️',bossName:'Capitaine Fantôme',level:'CM2',starsReq:1525,theme:'ocean',
  parallax:{sky:['#2d6a4f','#1b4332','#081c15'], mountains:['#06150f','#020a05'], decor:['🌴','🦜','💎'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦜', name:'Perroquet pirate',   questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'🗺️', name:'Énigme de la carte', questions:6, difficulty:'hard'},
   {type:'monster', emoji:'🐊', name:'Crocodile de jungle',questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'⚓', name:'Quartier-maître',    questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'🏴‍☠️', name:'Capitaine Fantôme', questions:7, difficulty:'hard', dropRare:true}
  ]},
 // ═══════════════════════════════════════════════════════
 // SANCTUAIRE FINAL — 8 étapes, climax de l'Odyssée
 // ═══════════════════════════════════════════════════════
 {id:'sanctuaire',label:'Sanctuaire Final',bg:'linear-gradient(135deg,#0a0014,#3a0a4a)',emoji:'⛩️',boss:'🌌',bossName:'Empereur Cosmique',level:'CM2',starsReq:1600,theme:'nuit',
  parallax:{sky:['#0a0014','#1a0530','#3a0a4a'], mountains:['#050008','#000000'], decor:['✨','💫','🌌'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'👁️',  name:'Sentinelle astrale',  questions:4, difficulty:'hard'},
   {type:'puzzle',  emoji:'🔮',  name:'Énigme de l\'au-delà',questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🌀',  name:'Vortex chaotique',    questions:5, difficulty:'hard'},
   {type:'monster', emoji:'⚡',  name:'Foudre primordiale',  questions:6, difficulty:'hard'},
   {type:'puzzle',  emoji:'🧿',  name:'Énigme cosmique ultime',questions:5, difficulty:'hard'},
   {type:'monster', emoji:'🌟',  name:'Étoile noire',        questions:6, difficulty:'hard'},
   {type:'minibss', emoji:'👁️‍🗨️',name:'Œil de l\'Empereur', questions:6, difficulty:'hard'},
   {type:'boss',    emoji:'🌌',  name:'Empereur Cosmique',   questions:8, difficulty:'hard', dropRare:true}
  ]},
];

// ═══════════════════════════════════════════════════════
// v10.1.0 — Trois aventures (maternelle / primaire / collège)
// MAP_ZONES est désormais un POINTEUR permutable vers le jeu de zones
// de l'aventure active. Le primaire (PRIM_ZONES) reste identique.
// Les zones des nouvelles aventures portent un champ `region` explicite
// (id parmi cp/ce1/ce2/cm1/cm2/final) pour réutiliser tout le thème.
// MAT_ZONES et COL_ZONES sont définis plus bas (générés).
// ═══════════════════════════════════════════════════════
let MAP_ZONES = PRIM_ZONES;

// v12.4.16 (points hors-lot — répliques de boss uniques par Odyssée) : une
// réplique dédiée par boss, écrite pour SON lieu et SA personnalité — au lieu
// d'une pioche dans le pool générique partagé (MONSTER_DIALOGUES.boss dans
// 07-map.js, qui reste le repli pour toute zone pas encore couverte ici).
// Odyssée 1/7 — Maths Maternelle (30 zones). Les 6 autres Odyssées suivront,
// livrées une par une.
const _BOSS_LINES = {
 mat_cp_1: "Je garde ce pré bien au chaud... tu veux venir faire un gros câlin avec moi ?",
 mat_cp_2: "Mes petits poussins ont peur de tout ! Montre-leur que tu es un ami, pas un renard.",
 mat_cp_3: "L'eau de ma mare est calme comme moi... enfin, presque toujours calme.",
 mat_cp_4: "Je trotte partout sur ce sentier, mais je m'arrête toujours pour un petit câlin.",
 mat_cp_5: "On dit que je suis terrible, mais je crois surtout que je suis maladroit.",
 mat_ce1_1: "Mmmh, ce verger sent trop bon... j'ai croqué toutes les pommes, il ne reste plus que les problèmes !",
 mat_ce1_2: "Je me cache dans les fraisiers... trouve-moi, si tu es aussi malin qu'un petit renard !",
 mat_ce1_3: "Toutes mes abeilles bourdonnent d'impatience... sauras-tu répondre avant qu'elles s'envolent ?",
 mat_ce1_4: "J'ai caché toutes mes noisettes... et mes plus beaux secrets avec !",
 mat_ce1_5: "Je virevolte de fleur en fleur... attrape-moi si tu peux, petit jardinier !",
 mat_ce2_1: "Je tremble un peu... mais je crois que j'ai vraiment envie de jouer avec toi.",
 mat_ce2_2: "Je fouille sous les champignons toute la journée... viens m'aider à chercher !",
 mat_ce2_3: "Du haut de mon chêne, je vois tout... même si tu as un peu peur, héhou !",
 mat_ce2_4: "Splash ! L'eau est fraîche et je n'attends que toi pour jouer dedans !",
 mat_ce2_5: "Mon pelage brille comme la lune... viens voir de plus près, si tu oses.",
 mat_cm1_1: "Je marche de travers, mais mes pinces ne servent qu'à faire des câlins !",
 mat_cm1_2: "Je suis lente, mais j'ai tout mon temps pour t'apprendre mes secrets.",
 mat_cm1_3: "Huit bras, huit façons de dire bonjour... lequel préfères-tu ?",
 mat_cm1_4: "Mes bulles chatouillent, mon rire aussi... prêt à plonger avec moi ?",
 mat_cm1_5: "Je porte ma maison sur mon dos, et cette île tout entière dans mon cœur.",
 mat_cm2_1: "Je bourdonne tout doucement entre les bleuets... viens fredonner avec moi.",
 mat_cm2_2: "Je danse avec le vent plus haut que ton cerf-volant... suis-moi si tu peux !",
 mat_cm2_3: "Je broute tranquillement sous les nuages... tu veux voir le ciel avec moi ?",
 mat_cm2_4: "Le vent tourne mon moulin, et moi je tourne autour de toi, coin coin !",
 mat_cm2_5: "Je souffle un tout petit peu de fumée... mais jamais de feu, promis juré.",
 mat_final_1: "La nuit est tombée sur mon pont... mais avec toi, elle ne me fait plus peur.",
 mat_final_2: "Je flotte tout doux dans le ciel du soir... viens faire un dernier câlin avant la nuit.",
 mat_final_3: "Mon pelage scintille sous la lune... c'est peut-être ici que notre histoire se termine, ou commence.",
 mat_final_4: "Tout en haut de ma tour, une dernière poussière de magie t'attend.",
 mat_final_5: "Tu es arrivé jusqu'à mon château... les étoiles elles-mêmes applaudissent ton courage.",
 // v12.4.17 — Odyssée 2/7 : Français Maternelle (30 zones). Répliques écrites
 // pour les nouvelles identités de boss (voir _MATFR_BOSS_OVERRIDES,
 // 07-story.js), cohérentes avec l'histoire de Plume et des animaux muets.
 matfr_cp_1: "Chut... dans cette clairière, même moi j'ai peur de faire du bruit.",
 matfr_cp_2: "Entre dans mon terrier si tu veux... mais parle tout bas, veux-tu ?",
 matfr_cp_3: "Coin... coin ? Non, même ça, je n'arrive plus à le dire.",
 matfr_cp_4: "Je me faufile sans un bruit sur ce sentier... comme toutes les bêtes silencieuses d'ici.",
 matfr_cp_5: "Dans le creux de mon chêne, même mon hou-hou s'est envolé.",
 matfr_ce1_1: "Il y a tant de choses dans ce pré... sauras-tu toutes les nommer ?",
 matfr_ce1_2: "Hihi, c'est moi qui ai renversé ce panier ! Range tout, si tu peux !",
 matfr_ce1_3: "Chaque fleur de mon jardin porte un nom secret... les connais-tu tous ?",
 matfr_ce1_4: "J'adore collectionner de belles images... montre-moi que tu sais les reconnaître !",
 matfr_ce1_5: "Je flaire toutes les trouvailles de ce sentier... suis mes traces si tu l'oses.",
 matfr_ce2_1: "Écoute bien... ma colline te renvoie chaque mot, découpé en petits morceaux.",
 matfr_ce2_2: "Coa-coa-coa... entends-tu comme mon chant résonne en syllabes ?",
 matfr_ce2_3: "Du haut de mes trois sommets, je vois... et j'entends tout, jusqu'à la moindre syllabe.",
 matfr_ce2_4: "Boum, boum ! Ma vallée bat le rythme de chaque mot que tu prononces.",
 matfr_ce2_5: "Roucoule avec moi, tout en haut de mon pic... chaque syllabe est une petite note.",
 matfr_cm1_1: "Sur ma rive, chaque mot cherche son écho... trouve celui qui lui répond.",
 matfr_cm1_2: "Regarde mon reflet dans l'eau... et trouve le mot qui lui ressemble.",
 matfr_cm1_3: "Sur mon ponton, chaque pas fait naître une petite musique de mots.",
 matfr_cm1_4: "Suis mon écho dans cette crique... il cache toujours une rime facétieuse.",
 matfr_cm1_5: "Mon miroir d'eau ne ment jamais... il ne reflète que les mots qui riment vraiment.",
 matfr_cm2_1: "Écoute bien mon murmure à l'entrée de la grotte... il cache le tout premier son.",
 matfr_cm2_2: "Je me glisse sans bruit dans cette galerie... devine le son qui s'y cache.",
 matfr_cm2_3: "Cri-cri... ma source chuchote un secret : le tout premier son de chaque mot.",
 matfr_cm2_4: "Dans mon couloir bleu résonne un son... sauras-tu le reconnaître avant moi ?",
 matfr_cm2_5: "Croa... dans ma chambre, les murmures gardent tous les secrets des sons.",
 matfr_final_1: "Pour traverser mon pont, chaque lettre doit trouver sa juste place.",
 matfr_final_2: "Je garde ma tour avec fierté... montre-moi que tu connais chaque lettre, du début à la fin.",
 matfr_final_3: "J'ai tissé cette salle autour d'une seule lettre... la plus grande de toutes.",
 matfr_final_4: "Je porte tous les mots sur ma carapace, marche après marche... patience, et ils seront à toi.",
 matfr_final_5: "Le Grand Livre du Conteur t'attend... refermé depuis trop longtemps. À toi de lui redonner ses mots.",
 // v12.4.19 — Odyssée 3/7 : Maths Primaire (23 zones, identités déjà cohérentes).
 plaine: "Ces plaines sont miennes depuis toujours... crois-tu vraiment pouvoir les traverser ?",
 village: "Cocorico ! Dans mon village, c'est moi qui donne le signal du matin !",
 prairie: "Toute ma ruche bourdonne à l'unisson... tiens-tu tête à mille abeilles ?",
 bonbons: "Beaucoup parlent de courage. Peu en montrent face à moi.",
 foret: "Cette forêt respire à mon rythme... et bientôt, la tienne aussi.",
 champignons: "Lent ? Peut-être. Mais j'ai le temps pour toi... tout le temps du monde.",
 trolls: "Qui ose troubler MA forêt ? Réponds vite, ou je te transforme en pierre !",
 plage: "Cette plage m'appartient, pince par pince, grain de sable par grain de sable.",
 desert: "Le désert ne pardonne pas... et moi non plus.",
 plaines_venteuses: "J'arrive comme le tonnerre, et je repars rarement seul.",
 temple: "Ce temple garde ses secrets depuis mille ans... et moi avec lui.",
 profondeurs: "Dans mes profondeurs, même la lumière hésite à descendre.",
 glace: "Un seul de mes pas fait trembler la glace... et ton courage avec.",
 marais: "Coupe une de mes têtes... les autres se souviendront de toi.",
 forteresse: "Cette forteresse n'est jamais tombée. Ce ne sera pas aujourd'hui non plus.",
 sakura: "Tu ne me verras pas venir... mais tu sentiras que je suis déjà là.",
 nocturne: "Dans mon royaume, même ton ombre finit par m'appartenir.",
 volcan: "Approche, et laisse mes flammes juger de ta valeur.",
 espace: "Dans l'infini de cette galaxie, ta petite existence m'intrigue.",
 cimes: "Du sommet de mes cimes, je n'ai jamais vu personne redescendre vainqueur.",
 mecanique: "Systèmes en ligne. Menace détectée. Destruction... imminente.",
 ile: "Mon navire a coulé mille fois... et mille fois, j'ai survécu à mes adversaires.",
 sanctuaire: "Tu as traversé sept royaumes pour arriver ici... voyons si tu mérites d'aller plus loin.",
 // v12.4.19 — Odyssée 4/7 : Français Primaire (23 zones, nouvelles identités
 // "Verbopolis" — voir _PRIMFR_BOSS_OVERRIDES, 07-story.js).
 primfr_plaine: "Chaque mot que tu prononces ici résonne... et revient parfois transformé.",
 primfr_village: "Dring ! J'annonce chaque lettre qui entre dans Verbopolis... et je n'annoncerai pas ta victoire facilement.",
 primfr_prairie: "A, E, I, O, U... laquelle préfères-tu ? Moi, je les adore toutes, et je ne les lâche pas facilement.",
 primfr_bonbons: "Une syllabe par-ci, une syllabe par-là... mes syllabes ne se vendent pas si facilement.",
 primfr_foret: "J'ai lu tous les livres de cette rue... aucun ne parle de ta victoire.",
 primfr_champignons: "Je connais mille histoires... laisse-moi voir si la tienne mérite d'être racontée.",
 primfr_trolls: "Dans mon impasse, les syllabes se perdent... et les aventuriers aussi.",
 primfr_plage: "Sur ces quais, chaque mot est une marchandise précieuse... et je garde les miens.",
 primfr_desert: "Mes mots sont rares et précieux... prouve-moi que tu mérites d'en emporter un.",
 primfr_plaines_venteuses: "Dans mon jardin, chaque mot a un frère caché... sauras-tu tous les trouver ?",
 primfr_temple: "Cette bibliothèque garde ses secrets depuis mille ans... et moi, je veille sur chacun d'eux.",
 primfr_profondeurs: "Dans ces souterrains, le sens de chaque mot se cache... j'ai la seule lampe qui l'éclaire.",
 primfr_glace: "Tic. Tac. Chaque seconde qui passe ici est gelée... comme le temps que tu vas perdre face à moi.",
 primfr_marais: "Présent, passé, futur... tous les trains partent d'ici. Lequel prendras-tu ?",
 primfr_forteresse: "Dans ma tour, chaque verbe se conjugue à ma façon... pas à la tienne.",
 primfr_sakura: "Chaque coup de cloche marque un temps différent... écoute bien, ou tu seras perdu.",
 primfr_nocturne: "De mon observatoire, je vois tous les temps à la fois... passé, présent, et ce qui t'attend.",
 primfr_volcan: "Chaque mot que j'imprime devient loi... le tien devra attendre son tour.",
 primfr_espace: "Un mot mal placé, et c'est la chute... regarde-moi jongler avec la syntaxe.",
 primfr_cimes: "Pour traverser mon pont, chaque mot doit trouver sa juste place dans la phrase.",
 primfr_mecanique: "Une phrase mal réglée, ça ne tourne pas rond... laisse-moi vérifier la tienne.",
 primfr_ile: "Cette citadelle est la plus solide de Verbopolis... aucune phrase bancale n'y entre.",
 primfr_sanctuaire: "Toutes les langues se sont mélangées ici, à cause de moi... sauras-tu remettre de l'ordre ?",
 // v12.4.19 — Odyssée 5/7 : Histoire Primaire (23 zones, nouvelles identités
 // "périodes historiques" — voir _PRIMHIST_BOSS_OVERRIDES, 07-story.js).
 primhist_plaine: "Ce feu ne s'éteint jamais... celui qui le garde non plus.",
 primhist_village: "Ma tribu a survécu mille hivers... grâce à des épreuves comme celle-ci.",
 primhist_prairie: "Je foule cette plaine depuis des générations... rien ne m'a jamais fait reculer.",
 primhist_bonbons: "Chaque trait que je peins raconte une histoire... la tienne mérite-t-elle d'y figurer ?",
 primhist_foret: "Le Nil m'a vu naître, et j'en garde chaque rive avec la même patience.",
 primhist_champignons: "Ces pyramides dureront mille ans... ta mémoire, elle, ne durera peut-être pas si longtemps.",
 primhist_trolls: "Mon repos a été troublé... et ma vengeance sera à la mesure de mon sommeil.",
 primhist_plage: "Mes navires ont conquis mille rivages... le tien ne sera pas différent.",
 primhist_desert: "J'ai marché sur toutes les routes de Rome... celle-ci ne fera pas exception.",
 primhist_plaines_venteuses: "Mes mots ont convaincu des sénats entiers... les tiens devront être bien meilleurs.",
 primhist_temple: "L'arène ne m'a jamais vu perdre... le public attend un vrai combat.",
 primhist_profondeurs: "Ces eaux ont vu passer des empereurs... voyons ce que tu vaux, toi.",
 primhist_glace: "Mon armure a résisté à mille hivers... et à bien des défis comme celui-ci.",
 primhist_marais: "Mon marais garde tous les secrets du fief... et n'en laisse échapper aucun facilement.",
 primhist_forteresse: "Mon château tient encore debout... et il tiendra face à toi aussi.",
 primhist_sakura: "Je fais rire toute la cour... voyons si je peux aussi te faire perdre.",
 primhist_nocturne: "Je veille chaque nuit sur ce château... rien ne m'échappe, pas même toi.",
 primhist_volcan: "Chaque coup de marteau forge un monde nouveau... es-tu prêt à en faire partie ?",
 primhist_espace: "Mon ballon a survolé Paris entière... rien ne m'effraie plus, pas même toi.",
 primhist_cimes: "Chaque rouage que j'invente change l'avenir... le tien est entre mes mains.",
 primhist_mecanique: "Mon train n'a jamais eu de retard... et il n'attendra pas non plus pour toi.",
 primhist_ile: "J'ai mille idées par seconde... laisse-moi voir si tu peux suivre le rythme.",
 primhist_sanctuaire: "Le temps a passé sur cet atelier... mais son écho, lui, n'a jamais cessé de résonner.",
};

const MAT_ZONES = [
 {id:'mat_cp_1', region:'cp', label:'Le Pré Vert', bg:'linear-gradient(135deg,#a8e6cf,#dcedc1)', emoji:'🌱', boss:'🐻', bossName:'Gros Nounours', level:'PS', starsReq:0, theme:'standard',
  parallax:{sky:['#b8e0d2','#dcedc1','#fff5d6'], mountains:['#7ab87a','#4a884a'], decor:['🌼','🦋','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐰', name:'Petit lapin', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🧺', name:'Le panier', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐤', name:'Poussin doux', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐮', name:'Vache rigolote', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐻', name:'Gros Nounours', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cp_2', region:'cp', label:'Champ de Pâquerettes', bg:'linear-gradient(135deg,#a8e6cf,#dcedc1)', emoji:'🌼', boss:'🐔', bossName:'Maman Poule', level:'PS', starsReq:45, theme:'standard',
  parallax:{sky:['#b8e0d2','#dcedc1','#fff5d6'], mountains:['#7ab87a','#4a884a'], decor:['🌼','🦋','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐑', name:'Mouton frisé', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌷', name:'Les fleurs', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐞', name:'Coccinelle', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐷', name:'Cochon joueur', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐔', name:'Maman Poule', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cp_3', region:'cp', label:'La Petite Mare', bg:'linear-gradient(135deg,#a8e6cf,#dcedc1)', emoji:'💧', boss:'🦢', bossName:'Cygne Blanc', level:'PS', starsReq:90, theme:'standard',
  parallax:{sky:['#b8e0d2','#dcedc1','#fff5d6'], mountains:['#7ab87a','#4a884a'], decor:['🌼','🦋','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🦋', name:'Papillon', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🍃', name:'Les feuilles', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐌', name:'Escargot lent', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦆', name:'Canard bavard', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦢', name:'Cygne Blanc', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cp_4', region:'cp', label:'Sentier des Câlins', bg:'linear-gradient(135deg,#a8e6cf,#dcedc1)', emoji:'🐾', boss:'🐴', bossName:'Petit Poney', level:'PS', starsReq:135, theme:'standard',
  parallax:{sky:['#b8e0d2','#dcedc1','#fff5d6'], mountains:['#7ab87a','#4a884a'], decor:['🌼','🦋','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐸', name:'Grenouille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🎈', name:'Les ballons', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐹', name:'Hamster', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐮', name:'Vache rigolote', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🐴', name:'Petit Poney', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cp_5', region:'cp', label:'Colline Arc-en-ciel', bg:'linear-gradient(135deg,#a8e6cf,#dcedc1)', emoji:'🌈', boss:'🦄', bossName:'Doux Licorne', level:'PS', starsReq:180, theme:'standard',
  parallax:{sky:['#b8e0d2','#dcedc1','#fff5d6'], mountains:['#7ab87a','#4a884a'], decor:['🌼','🦋','🍃'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐰', name:'Petit lapin', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🧩', name:'Le puzzle doux', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐤', name:'Poussin doux', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐷', name:'Cochon joueur', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🦄', name:'Doux Licorne', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce1_1', region:'ce1', label:'Le Verger Sucré', bg:'linear-gradient(135deg,#ffd6e8,#ffe5b4)', emoji:'🍎', boss:'🐻', bossName:'Ourson Gourmand', level:'PS', starsReq:250, theme:'sakura',
  parallax:{sky:['#ffe5b4','#ffd6e8','#fff5d6'], mountains:['#c98aa0','#9b5e72'], decor:['🍓','🍎','🌸'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🐝', name:'Abeille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🍓', name:'Les fraises', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐛', name:'Chenille', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦆', name:'Cane maline', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐻', name:'Ourson Gourmand', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce1_2', region:'ce1', label:'Buisson de Fraises', bg:'linear-gradient(135deg,#ffd6e8,#ffe5b4)', emoji:'🍓', boss:'🦊', bossName:'Renardeau', level:'PS', starsReq:295, theme:'sakura',
  parallax:{sky:['#ffe5b4','#ffd6e8','#fff5d6'], mountains:['#c98aa0','#9b5e72'], decor:['🍓','🍎','🌸'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🐿️', name:'Écureuil', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🍯', name:'Le pot de miel', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦔', name:'Hérisson', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐢', name:'Tortue lente', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦊', name:'Renardeau', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce1_3', region:'ce1', label:'Le Rucher Doré', bg:'linear-gradient(135deg,#ffd6e8,#ffe5b4)', emoji:'🍯', boss:'🐝', bossName:'Reine Abeille', level:'PS', starsReq:340, theme:'sakura',
  parallax:{sky:['#ffe5b4','#ffd6e8','#fff5d6'], mountains:['#c98aa0','#9b5e72'], decor:['🍓','🍎','🌸'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🐤', name:'Caneton', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌰', name:'Les noisettes', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐰', name:'Lapinou', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐔', name:'Coq matinal', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐝', name:'Reine Abeille', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce1_4', region:'ce1', label:'Allée des Noisettes', bg:'linear-gradient(135deg,#ffd6e8,#ffe5b4)', emoji:'🌰', boss:'🐿️', bossName:'Roi Écureuil', level:'PS', starsReq:385, theme:'sakura',
  parallax:{sky:['#ffe5b4','#ffd6e8','#fff5d6'], mountains:['#c98aa0','#9b5e72'], decor:['🍓','🍎','🌸'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🦋', name:'Papillon rose', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🧺', name:'La cueillette', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐞', name:'Bête à bon Dieu', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦆', name:'Cane maline', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🐿️', name:'Roi Écureuil', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce1_5', region:'ce1', label:'Jardin Fleuri', bg:'linear-gradient(135deg,#ffd6e8,#ffe5b4)', emoji:'🌸', boss:'🦋', bossName:'Papillon Géant', level:'PS', starsReq:430, theme:'sakura',
  parallax:{sky:['#ffe5b4','#ffd6e8','#fff5d6'], mountains:['#c98aa0','#9b5e72'], decor:['🍓','🍎','🌸'], astro:'🌈'},
  steps:[
   {type:'monster', emoji:'🐝', name:'Abeille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🎀', name:'Le ruban', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐛', name:'Chenille', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐢', name:'Tortue lente', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🦋', name:'Papillon Géant', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce2_1', region:'ce2', label:'Clairière Mousse', bg:'linear-gradient(135deg,#88d8b0,#c5e99b)', emoji:'🌿', boss:'🦌', bossName:'Faon Timide', level:'MS', starsReq:500, theme:'foret',
  parallax:{sky:['#c5e99b','#88d8b0','#5ab87a'], mountains:['#3a6c3a','#244824'], decor:['🍄','🌿','🐛'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦉', name:'Hibou', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🍄', name:'Les champignons', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦊', name:'Renard rusé', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦌', name:'Faon Timide', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce2_2', region:'ce2', label:'Bois des Champignons', bg:'linear-gradient(135deg,#88d8b0,#c5e99b)', emoji:'🍄', boss:'🐗', bossName:'Sanglier Doux', level:'MS', starsReq:545, theme:'foret',
  parallax:{sky:['#c5e99b','#88d8b0','#5ab87a'], mountains:['#3a6c3a','#244824'], decor:['🍄','🌿','🐛'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🐗', name:'Marcassin', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌿', name:'Les herbes', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦝', name:'Raton', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐺', name:'Louveteau', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐗', name:'Sanglier Doux', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce2_3', region:'ce2', label:'Le Vieux Chêne', bg:'linear-gradient(135deg,#88d8b0,#c5e99b)', emoji:'🌳', boss:'🦉', bossName:'Grand-Duc', level:'MS', starsReq:590, theme:'foret',
  parallax:{sky:['#c5e99b','#88d8b0','#5ab87a'], mountains:['#3a6c3a','#244824'], decor:['🍄','🌿','🐛'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦔', name:'Hérisson', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🪵', name:'Le tronc', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐿️', name:'Écureuil', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦡', name:'Blaireau', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦉', name:'Grand-Duc', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce2_4', region:'ce2', label:'Ruisseau Frais', bg:'linear-gradient(135deg,#88d8b0,#c5e99b)', emoji:'💧', boss:'🦦', bossName:'Loutre Joueuse', level:'MS', starsReq:635, theme:'foret',
  parallax:{sky:['#c5e99b','#88d8b0','#5ab87a'], mountains:['#3a6c3a','#244824'], decor:['🍄','🌿','🐛'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🐸', name:'Crapaud', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🕸️', name:'La toile', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🕊️', name:'Colombe', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦊', name:'Renard rusé', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🦦', name:'Loutre Joueuse', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_ce2_5', region:'ce2', label:'Sous-Bois Étoilé', bg:'linear-gradient(135deg,#88d8b0,#c5e99b)', emoji:'✨', boss:'🦊', bossName:'Renard Argenté', level:'MS', starsReq:680, theme:'foret',
  parallax:{sky:['#c5e99b','#88d8b0','#5ab87a'], mountains:['#3a6c3a','#244824'], decor:['🍄','🌿','🐛'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦉', name:'Hibou', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌰', name:'Les glands', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐺', name:'Louveteau', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🦊', name:'Renard Argenté', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm1_1', region:'cm1', label:'Plage des Palmiers', bg:'linear-gradient(135deg,#a0e7e5,#b4f8c8)', emoji:'🏖️', boss:'🦀', bossName:'Crabe Câlin', level:'MS', starsReq:750, theme:'ocean',
  parallax:{sky:['#b4f8c8','#a0e7e5','#8ad5ff'], mountains:['#3a8fa0','#1f5c6e'], decor:['🐚','🐠','🫧'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐠', name:'Poisson', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🐚', name:'Les coquillages', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦀', name:'Petit crabe', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦭', name:'Phoque', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦀', name:'Crabe Câlin', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm1_2', region:'cm1', label:'Lagon Émeraude', bg:'linear-gradient(135deg,#a0e7e5,#b4f8c8)', emoji:'🌊', boss:'🐢', bossName:'Tortue Sage', level:'MS', starsReq:795, theme:'ocean',
  parallax:{sky:['#b4f8c8','#a0e7e5','#8ad5ff'], mountains:['#3a8fa0','#1f5c6e'], decor:['🐚','🐠','🫧'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐙', name:'Pieuvre', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🫧', name:'Les bulles', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦐', name:'Crevette', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐬', name:'Dauphin', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐢', name:'Tortue Sage', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm1_3', region:'cm1', label:'Récif Coloré', bg:'linear-gradient(135deg,#a0e7e5,#b4f8c8)', emoji:'🪸', boss:'🐙', bossName:'Poulpe Joyeux', level:'MS', starsReq:840, theme:'ocean',
  parallax:{sky:['#b4f8c8','#a0e7e5','#8ad5ff'], mountains:['#3a8fa0','#1f5c6e'], decor:['🐚','🐠','🫧'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐡', name:'Poisson-lune', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'⭐', name:'Les étoiles de mer', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐚', name:'Coquillage', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐧', name:'Manchot', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐙', name:'Poulpe Joyeux', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm1_4', region:'cm1', label:'Grotte aux Bulles', bg:'linear-gradient(135deg,#a0e7e5,#b4f8c8)', emoji:'🫧', boss:'🐬', bossName:'Dauphin Rieur', level:'MS', starsReq:885, theme:'ocean',
  parallax:{sky:['#b4f8c8','#a0e7e5','#8ad5ff'], mountains:['#3a8fa0','#1f5c6e'], decor:['🐚','🐠','🫧'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🦑', name:'Calmar', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🪸', name:'Le corail', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐢', name:'Tortue', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦭', name:'Phoque', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🐬', name:'Dauphin Rieur', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm1_5', region:'cm1', label:'Île aux Tortues', bg:'linear-gradient(135deg,#a0e7e5,#b4f8c8)', emoji:'⭐', boss:'🐢', bossName:'Tortue Marine', level:'MS', starsReq:930, theme:'ocean',
  parallax:{sky:['#b4f8c8','#a0e7e5','#8ad5ff'], mountains:['#3a8fa0','#1f5c6e'], decor:['🐚','🐠','🫧'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐠', name:'Poisson', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🏖️', name:'Le sable', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦀', name:'Petit crabe', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐬', name:'Dauphin', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🐢', name:'Tortue Marine', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm2_1', region:'cm2', label:'Champ de Bleuets', bg:'linear-gradient(135deg,#ffd166,#ffe5b4)', emoji:'🌻', boss:'🐝', bossName:'Bourdon Doux', level:'GS', starsReq:1000, theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#ffb347'], mountains:['#b8862f','#7a5a1f'], decor:['🌻','🐝','🦋'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐝', name:'Abeille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌻', name:'Les tournesols', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦋', name:'Papillon', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐓', name:'Coq', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐝', name:'Bourdon Doux', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm2_2', region:'cm2', label:'Le Grand Cerf-Volant', bg:'linear-gradient(135deg,#ffd166,#ffe5b4)', emoji:'🍏', boss:'🐦', bossName:'Hirondelle Facétieuse', level:'GS', starsReq:1045, theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#ffb347'], mountains:['#b8862f','#7a5a1f'], decor:['🌻','🐝','🦋'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐞', name:'Coccinelle', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🍯', name:'Le miel', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦗', name:'Grillon', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦃', name:'Dindon', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐦', name:'Hirondelle Facétieuse', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm2_3', region:'cm2', label:'Prairie du Ciel', bg:'linear-gradient(135deg,#ffd166,#ffe5b4)', emoji:'🌾', boss:'🐏', bossName:'Bélier Gentil', level:'GS', starsReq:1090, theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#ffb347'], mountains:['#b8862f','#7a5a1f'], decor:['🌻','🐝','🦋'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐜', name:'Fourmi', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌾', name:'Les épis', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🕷️', name:'Araignée', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦚', name:'Paon', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐏', name:'Bélier Gentil', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm2_4', region:'cm2', label:'Moulin des Vents', bg:'linear-gradient(135deg,#ffd166,#ffe5b4)', emoji:'🌾', boss:'🪿', bossName:'Oie Blanche', level:'GS', starsReq:1135, theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#ffb347'], mountains:['#b8862f','#7a5a1f'], decor:['🌻','🐝','🦋'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐛', name:'Chenille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🧮', name:'Le calcul', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🪲', name:'Scarabée', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐓', name:'Coq', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🪿', name:'Oie Blanche', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_cm2_5', region:'cm2', label:'Colline de l\'Horizon', bg:'linear-gradient(135deg,#ffd166,#ffe5b4)', emoji:'🌞', boss:'🐉', bossName:'Gentil Dragonnet', level:'GS', starsReq:1180, theme:'standard',
  parallax:{sky:['#fff5d6','#ffd166','#ffb347'], mountains:['#b8862f','#7a5a1f'], decor:['🌻','🐝','🦋'], astro:'☀️'},
  steps:[
   {type:'monster', emoji:'🐝', name:'Abeille', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🔢', name:'Les chiffres', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦋', name:'Papillon', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦃', name:'Dindon', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Gentil Dragonnet', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_final_1', region:'final', label:'Pont des Étoiles', bg:'linear-gradient(135deg,#b8c6ff,#e0c3fc)', emoji:'🌉', boss:'🦉', bossName:'Chouette Lune', level:'GS', starsReq:1250, theme:'nuit',
  parallax:{sky:['#e0c3fc','#b8c6ff','#8e9bff'], mountains:['#5a5f8f','#34375c'], decor:['⭐','🌙','✨'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦉', name:'Chouette', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'⭐', name:'Les étoiles', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦄', name:'Licorne', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦉', name:'Chouette Lune', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_final_2', region:'final', label:'Nuage Câlin', bg:'linear-gradient(135deg,#b8c6ff,#e0c3fc)', emoji:'☁️', boss:'🐑', bossName:'Mouton Nuage', level:'GS', starsReq:1295, theme:'nuit',
  parallax:{sky:['#e0c3fc','#b8c6ff','#8e9bff'], mountains:['#5a5f8f','#34375c'], decor:['⭐','🌙','✨'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🌟', name:'Étoile filante', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🌙', name:'La lune', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐈', name:'Chaton noir', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragonnet', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🐑', name:'Mouton Nuage', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_final_3', region:'final', label:'Jardin de Lune', bg:'linear-gradient(135deg,#b8c6ff,#e0c3fc)', emoji:'🌙', boss:'🦊', bossName:'Renard Étoilé', level:'GS', starsReq:1340, theme:'nuit',
  parallax:{sky:['#e0c3fc','#b8c6ff','#8e9bff'], mountains:['#5a5f8f','#34375c'], decor:['⭐','🌙','✨'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦊', name:'Renard de nuit', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🪐', name:'Les planètes', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦝', name:'Raton', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦢', name:'Cygne de nuit', questions:5, difficulty:'medium'},
   {type:'boss', emoji:'🦊', name:'Renard Étoilé', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_final_4', region:'final', label:'Tour Scintillante', bg:'linear-gradient(135deg,#b8c6ff,#e0c3fc)', emoji:'🗼', boss:'🧚', bossName:'Petite Fée', level:'GS', starsReq:1385, theme:'nuit',
  parallax:{sky:['#e0c3fc','#b8c6ff','#8e9bff'], mountains:['#5a5f8f','#34375c'], decor:['⭐','🌙','✨'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🐰', name:'Lapin lunaire', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'🔭', name:'Le télescope', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🕊️', name:'Colombe', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦄', name:'Licorne', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🧚', name:'Petite Fée', questions:6, difficulty:'hard', dropRare:true},
  ]},
 {id:'mat_final_5', region:'final', label:'Château des Nuages', bg:'linear-gradient(135deg,#b8c6ff,#e0c3fc)', emoji:'🏰', boss:'🌟', bossName:'Roi des Étoiles', level:'GS', starsReq:1430, theme:'nuit',
  parallax:{sky:['#e0c3fc','#b8c6ff','#8e9bff'], mountains:['#5a5f8f','#34375c'], decor:['⭐','🌙','✨'], astro:'🌙'},
  steps:[
   {type:'monster', emoji:'🦉', name:'Chouette', questions:4, difficulty:'easy'},
   {type:'puzzle', emoji:'💫', name:'Les comètes', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦇', name:'Chauve-souris', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragonnet', questions:5, difficulty:'hard'},
   {type:'boss', emoji:'🌟', name:'Roi des Étoiles', questions:6, difficulty:'hard', dropRare:true},
  ]},
];

const COL_ZONES = [
 {id:'col_cp_1', region:'cp', label:'Le Port des Décimales', bg:'linear-gradient(135deg,#1f618d,#2980b9)', emoji:'⚓', boss:'🐙', bossName:'Gardien des Virgules', level:'6E', starsReq:0, theme:'ocean',
  parallax:{sky:['#2980b9','#1f618d','#154360'], mountains:['#0e3a5c','#06223a'], decor:['⚓','🌊','🧭'], astro:'🌅'},
  steps:[
   {type:'monster', emoji:'🦈', name:'Requin des récifs', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🧭', name:'Énigme du cap', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐙', name:'Kraken mineur', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Serpent de mer', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🐙', name:'Gardien des Virgules', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cp_2', region:'cp', label:'Quai des Marchands', bg:'linear-gradient(135deg,#1f618d,#2980b9)', emoji:'⚖️', boss:'🦈', bossName:'Écumeur Décimal', level:'6E', starsReq:45, theme:'ocean',
  parallax:{sky:['#2980b9','#1f618d','#154360'], mountains:['#0e3a5c','#06223a'], decor:['⚓','🌊','🧭'], astro:'🌅'},
  steps:[
   {type:'monster', emoji:'🦑', name:'Calmar abyssal', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🗺️', name:'Carte décimale', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐡', name:'Globe épineux', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦭', name:'Léviathan jeune', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🦈', name:'Écumeur Décimal', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cp_3', region:'cp', label:'Phare Brisé', bg:'linear-gradient(135deg,#1f618d,#2980b9)', emoji:'🗼', boss:'🦑', bossName:'Spectre du Phare', level:'6E', starsReq:90, theme:'ocean',
  parallax:{sky:['#2980b9','#1f618d','#154360'], mountains:['#0e3a5c','#06223a'], decor:['⚓','🌊','🧭'], astro:'🌅'},
  steps:[
   {type:'monster', emoji:'🦞', name:'Homard cuirassé', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'⚓', name:'Les profondeurs', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐍', name:'Murène', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐊', name:'Crocodile marin', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🦑', name:'Spectre du Phare', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cp_4', region:'cp', label:'Récif Trompeur', bg:'linear-gradient(135deg,#1f618d,#2980b9)', emoji:'🪸', boss:'🐊', bossName:'Mâchoire des Bas-fonds', level:'6E', starsReq:135, theme:'ocean',
  parallax:{sky:['#2980b9','#1f618d','#154360'], mountains:['#0e3a5c','#06223a'], decor:['⚓','🌊','🧭'], astro:'🌅'},
  steps:[
   {type:'monster', emoji:'🦀', name:'Crabe-titan', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🧮', name:'Calcul des marées', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐠', name:'Banc affamé', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Serpent de mer', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐊', name:'Mâchoire des Bas-fonds', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cp_5', region:'cp', label:'Fosse aux Nombres', bg:'linear-gradient(135deg,#1f618d,#2980b9)', emoji:'🌀', boss:'🐉', bossName:'Hydre des Profondeurs', level:'6E', starsReq:180, theme:'ocean',
  parallax:{sky:['#2980b9','#1f618d','#154360'], mountains:['#0e3a5c','#06223a'], decor:['⚓','🌊','🧭'], astro:'🌅'},
  steps:[
   {type:'monster', emoji:'🦈', name:'Requin des récifs', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📐', name:'Relevé du fond', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐙', name:'Kraken mineur', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🦭', name:'Léviathan jeune', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Hydre des Profondeurs', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce1_1', region:'ce1', label:'Cavernes Fractionnaires', bg:'linear-gradient(135deg,#196f3d,#27ae60)', emoji:'🍰', boss:'🕷️', bossName:'Reine des Parts', level:'6E', starsReq:250, theme:'foret',
  parallax:{sky:['#27ae60','#196f3d','#0e4023'], mountains:['#0b3a1e','#04200f'], decor:['🍄','🌿','🕯️'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🕷️', name:'Tisseuse fractale', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🍄', name:'Cercle des fées', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐺', name:'Loup sylvestre', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐻', name:'Ours des cavernes', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🕷️', name:'Reine des Parts', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce1_2', region:'ce1', label:'Bois des Numérateurs', bg:'linear-gradient(135deg,#196f3d,#27ae60)', emoji:'🌳', boss:'🐺', bossName:'Alpha Sylvestre', level:'6E', starsReq:295, theme:'foret',
  parallax:{sky:['#27ae60','#196f3d','#0e4023'], mountains:['#0b3a1e','#04200f'], decor:['🍄','🌿','🕯️'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🦇', name:'Nuée d\'ombres', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🌿', name:'Énigme des lianes', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🐗', name:'Sanglier furieux', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🌳', name:'Tréant', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🐺', name:'Alpha Sylvestre', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce1_3', region:'ce1', label:'Sentier Partagé', bg:'linear-gradient(135deg,#196f3d,#27ae60)', emoji:'➗', boss:'👺', bossName:'Troll Diviseur', level:'6E', starsReq:340, theme:'foret',
  parallax:{sky:['#27ae60','#196f3d','#0e4023'], mountains:['#0b3a1e','#04200f'], decor:['🍄','🌿','🕯️'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🦂', name:'Scorpion des bois', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🕸️', name:'Toile fractionnaire', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐍', name:'Vipère', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👺', name:'Gobelin chef', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'👺', name:'Troll Diviseur', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce1_4', region:'ce1', label:'Grotte aux Échos', bg:'linear-gradient(135deg,#196f3d,#27ae60)', emoji:'🕳️', boss:'🦇', bossName:'Maître des Ombres', level:'6E', starsReq:385, theme:'foret',
  parallax:{sky:['#27ae60','#196f3d','#0e4023'], mountains:['#0b3a1e','#04200f'], decor:['🍄','🌿','🕯️'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🦉', name:'Strige', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🪵', name:'Le tronc partagé', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐜', name:'Légion grouillante', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐻', name:'Ours des cavernes', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🦇', name:'Maître des Ombres', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce1_5', region:'ce1', label:'Cœur de la Forêt', bg:'linear-gradient(135deg,#196f3d,#27ae60)', emoji:'💚', boss:'🐉', bossName:'Dragon des Fractions', level:'6E', starsReq:430, theme:'foret',
  parallax:{sky:['#27ae60','#196f3d','#0e4023'], mountains:['#0b3a1e','#04200f'], decor:['🍄','🌿','🕯️'], astro:'🌒'},
  steps:[
   {type:'monster', emoji:'🕷️', name:'Tisseuse fractale', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🔮', name:'Rune sylvestre', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐺', name:'Loup sylvestre', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🌳', name:'Tréant', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Dragon des Fractions', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce2_1', region:'ce2', label:'Plateau des Relatifs', bg:'linear-gradient(135deg,#5d4a8c,#34375c)', emoji:'🌡️', boss:'🧊', bossName:'Sentinelle du Froid', level:'5E', starsReq:500, theme:'nuit',
  parallax:{sky:['#5d4a8c','#34375c','#1a1c2c'], mountains:['#16182a','#0a0b16'], decor:['❄️','➕','➖'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🧊', name:'Golem de givre', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'❄️', name:'Énigme du gel', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'👻', name:'Spectre négatif', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Wyverne de glace', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🧊', name:'Sentinelle du Froid', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce2_2', region:'ce2', label:'Faille Négative', bg:'linear-gradient(135deg,#5d4a8c,#34375c)', emoji:'➖', boss:'👻', bossName:'Ombre du Moins', level:'5E', starsReq:545, theme:'nuit',
  parallax:{sky:['#5d4a8c','#34375c','#1a1c2c'], mountains:['#16182a','#0a0b16'], decor:['❄️','➕','➖'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐺', name:'Loup polaire', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🌡️', name:'Sous zéro', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦅', name:'Aigle des cimes', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Colosse runique', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'👻', name:'Ombre du Moins', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce2_3', region:'ce2', label:'Crête des Signes', bg:'linear-gradient(135deg,#5d4a8c,#34375c)', emoji:'➕', boss:'🦅', bossName:'Roc des Sommets', level:'5E', starsReq:590, theme:'nuit',
  parallax:{sky:['#5d4a8c','#34375c','#1a1c2c'], mountains:['#16182a','#0a0b16'], decor:['❄️','➕','➖'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🐻‍❄️', name:'Ours blanc', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'⚖️', name:'Balance des signes', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦬', name:'Bison des neiges', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👹', name:'Ogre des pics', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🦅', name:'Roc des Sommets', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce2_4', region:'ce2', label:'Glacier Gradué', bg:'linear-gradient(135deg,#5d4a8c,#34375c)', emoji:'🧭', boss:'🐉', bossName:'Wyverne Polaire', level:'5E', starsReq:635, theme:'nuit',
  parallax:{sky:['#5d4a8c','#34375c','#1a1c2c'], mountains:['#16182a','#0a0b16'], decor:['❄️','➕','➖'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🦂', name:'Scorpion gelé', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🧭', name:'Axe gradué', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🕷️', name:'Veuve glacée', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Wyverne de glace', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Wyverne Polaire', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_ce2_5', region:'ce2', label:'Pic du Zéro', bg:'linear-gradient(135deg,#5d4a8c,#34375c)', emoji:'⛰️', boss:'👹', bossName:'Titan de l\'Abîme', level:'5E', starsReq:680, theme:'nuit',
  parallax:{sky:['#5d4a8c','#34375c','#1a1c2c'], mountains:['#16182a','#0a0b16'], decor:['❄️','➕','➖'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🧊', name:'Golem de givre', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🔢', name:'Droite relative', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'👻', name:'Spectre négatif', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Colosse runique', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'👹', name:'Titan de l\'Abîme', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm1_1', region:'cm1', label:'Citadelle Algébrique', bg:'linear-gradient(135deg,#6c4f2e,#a07d4a)', emoji:'🏰', boss:'🤖', bossName:'Gardien des Inconnues', level:'4E', starsReq:750, theme:'chateau',
  parallax:{sky:['#a07d4a','#6c4f2e','#3a2a18'], mountains:['#2a1f12','#150f08'], decor:['📜','⚙️','🗝️'], astro:'🌗'},
  steps:[
   {type:'monster', emoji:'🤖', name:'Automate algébrique', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📜', name:'Énigme du parchemin', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🛡️', name:'Garde de pierre', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon de garde', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🤖', name:'Gardien des Inconnues', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm1_2', region:'cm1', label:'Salle des Variables', bg:'linear-gradient(135deg,#6c4f2e,#a07d4a)', emoji:'🔣', boss:'🐲', bossName:'Gargouille Littérale', level:'4E', starsReq:795, theme:'chateau',
  parallax:{sky:['#a07d4a','#6c4f2e','#3a2a18'], mountains:['#2a1f12','#150f08'], decor:['📜','⚙️','🗝️'], astro:'🌗'},
  steps:[
   {type:'monster', emoji:'🐲', name:'Gargouille', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'⚙️', name:'Mécanisme inconnu', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'⚔️', name:'Spectre d\'acier', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Golem runique', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🐲', name:'Gargouille Littérale', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm1_3', region:'cm1', label:'Forge des Identités', bg:'linear-gradient(135deg,#6c4f2e,#a07d4a)', emoji:'⚒️', boss:'🛡️', bossName:'Colosse Remarquable', level:'4E', starsReq:840, theme:'chateau',
  parallax:{sky:['#a07d4a','#6c4f2e','#3a2a18'], mountains:['#2a1f12','#150f08'], decor:['📜','⚙️','🗝️'], astro:'🌗'},
  steps:[
   {type:'monster', emoji:'🕯️', name:'Liche mineure', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🗝️', name:'Serrure littérale', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦅', name:'Aigle héraldique', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👺', name:'Champion noir', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🛡️', name:'Colosse Remarquable', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm1_4', region:'cm1', label:'Bibliothèque Secrète', bg:'linear-gradient(135deg,#6c4f2e,#a07d4a)', emoji:'📚', boss:'🕯️', bossName:'Liche des Équations', level:'4E', starsReq:885, theme:'chateau',
  parallax:{sky:['#a07d4a','#6c4f2e','#3a2a18'], mountains:['#2a1f12','#150f08'], decor:['📜','⚙️','🗝️'], astro:'🌗'},
  steps:[
   {type:'monster', emoji:'🐍', name:'Basilic', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🔣', name:'Glyphe variable', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'👤', name:'Assassin masqué', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon de garde', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🕯️', name:'Liche des Équations', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm1_5', region:'cm1', label:'Donjon du Calcul', bg:'linear-gradient(135deg,#6c4f2e,#a07d4a)', emoji:'🗝️', boss:'🐉', bossName:'Dragon Algébrique', level:'4E', starsReq:930, theme:'chateau',
  parallax:{sky:['#a07d4a','#6c4f2e','#3a2a18'], mountains:['#2a1f12','#150f08'], decor:['📜','⚙️','🗝️'], astro:'🌗'},
  steps:[
   {type:'monster', emoji:'🤖', name:'Automate algébrique', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'⚖️', name:'Équilibre des x', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🛡️', name:'Garde de pierre', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Golem runique', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Dragon Algébrique', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm2_1', region:'cm2', label:'Gorges de Pythagore', bg:'linear-gradient(135deg,#8b0000,#c0392b)', emoji:'📐', boss:'🔥', bossName:'Gardien des Hypoténuses', level:'4E', starsReq:1000, theme:'volcan',
  parallax:{sky:['#c0392b','#8b0000','#3a0000'], mountains:['#2a0000','#120000'], decor:['🔺','🪨','🔥'], astro:'🌋'},
  steps:[
   {type:'monster', emoji:'🔥', name:'Élémentaire de feu', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🔺', name:'Énigme du triangle', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🦂', name:'Scorpion de lave', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon de magma', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🔥', name:'Gardien des Hypoténuses', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm2_2', region:'cm2', label:'Crête des Carrés', bg:'linear-gradient(135deg,#8b0000,#c0392b)', emoji:'🟥', boss:'🦂', bossName:'Scorpion Géomètre', level:'4E', starsReq:1045, theme:'volcan',
  parallax:{sky:['#c0392b','#8b0000','#3a0000'], mountains:['#2a0000','#120000'], decor:['🔺','🪨','🔥'], astro:'🌋'},
  steps:[
   {type:'monster', emoji:'🐲', name:'Drake rouge', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📐', name:'Angle droit caché', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🗿', name:'Colosse obsidienne', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Titan de roche', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🦂', name:'Scorpion Géomètre', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm2_3', region:'cm2', label:'Pont des Racines', bg:'linear-gradient(135deg,#8b0000,#c0392b)', emoji:'√', boss:'🐲', bossName:'Drake des Diagonales', level:'4E', starsReq:1090, theme:'volcan',
  parallax:{sky:['#c0392b','#8b0000','#3a0000'], mountains:['#2a0000','#120000'], decor:['🔺','🪨','🔥'], astro:'🌋'},
  steps:[
   {type:'monster', emoji:'🦇', name:'Démon ailé', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🪨', name:'Le bloc carré', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🐍', name:'Salamandre', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👺', name:'Seigneur des cendres', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🐲', name:'Drake des Diagonales', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm2_4', region:'cm2', label:'Caldeira Brûlante', bg:'linear-gradient(135deg,#8b0000,#c0392b)', emoji:'🌋', boss:'🗿', bossName:'Colosse des Cathètes', level:'4E', starsReq:1135, theme:'volcan',
  parallax:{sky:['#c0392b','#8b0000','#3a0000'], mountains:['#2a0000','#120000'], decor:['🔺','🪨','🔥'], astro:'🌋'},
  steps:[
   {type:'monster', emoji:'👹', name:'Diablotin', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📏', name:'Mesure des côtés', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦅', name:'Phénix mineur', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon de magma', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🗿', name:'Colosse des Cathètes', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_cm2_5', region:'cm2', label:'Cœur du Volcan', bg:'linear-gradient(135deg,#8b0000,#c0392b)', emoji:'❤️‍🔥', boss:'🐉', bossName:'Dragon Pythagoricien', level:'4E', starsReq:1180, theme:'volcan',
  parallax:{sky:['#c0392b','#8b0000','#3a0000'], mountains:['#2a0000','#120000'], decor:['🔺','🪨','🔥'], astro:'🌋'},
  steps:[
   {type:'monster', emoji:'🔥', name:'Élémentaire de feu', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🧭', name:'Trace de Pythagore', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🦂', name:'Scorpion de lave', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Titan de roche', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Dragon Pythagoricien', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_final_1', region:'final', label:'Observatoire des Fonctions', bg:'linear-gradient(135deg,#1a0530,#3a0a4a)', emoji:'🔭', boss:'🛸', bossName:'Gardien des Courbes', level:'3E', starsReq:1250, theme:'nuit',
  parallax:{sky:['#3a0a4a','#1a0530','#0a0014'], mountains:['#08001a','#000000'], decor:['📈','✨','🪐'], astro:'🌌'},
  steps:[
   {type:'monster', emoji:'🛸', name:'Sentinelle céleste', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📈', name:'Énigme de la courbe', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'🌌', name:'Spectre cosmique', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon stellaire', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🛸', name:'Gardien des Courbes', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_final_2', region:'final', label:'Nébuleuse Affine', bg:'linear-gradient(135deg,#1a0530,#3a0a4a)', emoji:'📈', boss:'🌌', bossName:'Spectre Linéaire', level:'3E', starsReq:1295, theme:'nuit',
  parallax:{sky:['#3a0a4a','#1a0530','#0a0014'], mountains:['#08001a','#000000'], decor:['📈','✨','🪐'], astro:'🌌'},
  steps:[
   {type:'monster', emoji:'🪐', name:'Gardien orbital', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📉', name:'Pente cachée', questions:5, difficulty:'easy'},
   {type:'monster', emoji:'⭐', name:'Astre déchu', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Colosse galactique', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🌌', name:'Spectre Linéaire', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_final_3', region:'final', label:'Champ des Images', bg:'linear-gradient(135deg,#1a0530,#3a0a4a)', emoji:'🪞', boss:'🪐', bossName:'Titan des Antécédents', level:'3E', starsReq:1340, theme:'nuit',
  parallax:{sky:['#3a0a4a','#1a0530','#0a0014'], mountains:['#08001a','#000000'], decor:['📈','✨','🪐'], astro:'🌌'},
  steps:[
   {type:'monster', emoji:'🌀', name:'Vortex vivant', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🧮', name:'Calcul des images', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'👁️', name:'Œil du vide', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'👹', name:'Ombre du néant', questions:6, difficulty:'medium'},
   {type:'boss', emoji:'🪐', name:'Titan des Antécédents', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_final_4', region:'final', label:'Spirale du Calcul', bg:'linear-gradient(135deg,#1a0530,#3a0a4a)', emoji:'🌀', boss:'☄️', bossName:'Comète des Équations', level:'3E', starsReq:1385, theme:'nuit',
  parallax:{sky:['#3a0a4a','#1a0530','#0a0014'], mountains:['#08001a','#000000'], decor:['📈','✨','🪐'], astro:'🌌'},
  steps:[
   {type:'monster', emoji:'☄️', name:'Comète furieuse', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'🔢', name:'Antécédent perdu', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🔭', name:'Veilleur stellaire', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🐉', name:'Dragon stellaire', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'☄️', name:'Comète des Équations', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_final_5', region:'final', label:'Sanctuaire Stellaire', bg:'linear-gradient(135deg,#1a0530,#3a0a4a)', emoji:'⛩️', boss:'🐉', bossName:'Souverain des Fonctions', level:'3E', starsReq:1430, theme:'nuit',
  parallax:{sky:['#3a0a4a','#1a0530','#0a0014'], mountains:['#08001a','#000000'], decor:['📈','✨','🪐'], astro:'🌌'},
  steps:[
   {type:'monster', emoji:'🛸', name:'Sentinelle céleste', questions:5, difficulty:'easy'},
   {type:'puzzle', emoji:'📐', name:'Repère brisé', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🌌', name:'Spectre cosmique', questions:5, difficulty:'medium'},
   {type:'minibss', emoji:'🗿', name:'Colosse galactique', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🐉', name:'Souverain des Fonctions', questions:7, difficulty:'hard', dropRare:true},
  ]},
 // ── v10.2.0 : L'ANTRE DU TITAN (7e îlot, climax du Forgeron des Étoiles) ──
 {id:'col_titan_1', region:'titan', label:'Le Seuil de Cendres', bg:'linear-gradient(135deg,#1a0a05,#4a1505)', emoji:'🌑', boss:'🗿', bossName:'Veilleur de l\'Oubli', level:'3E', starsReq:1475, theme:'volcan',
  parallax:{sky:['#4a1505','#1a0a05','#0a0400'], mountains:['#120500','#000000'], decor:['🔥','⚒️','✨'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'👤', name:'Ombre sans nom', questions:5, difficulty:'medium'},
   {type:'puzzle', emoji:'⚒️', name:'Énigme de la Forge', questions:5, difficulty:'medium'},
   {type:'monster', emoji:'🌫️', name:'Brume dévorante', questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🛡️', name:'Champion oublié', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🗿', name:'Veilleur de l\'Oubli', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_titan_2', region:'titan', label:'La Galerie des Étoiles Mortes', bg:'linear-gradient(135deg,#1a0a05,#4a1505)', emoji:'💫', boss:'🦅', bossName:'Phénix de Cendre', level:'3E', starsReq:1520, theme:'volcan',
  parallax:{sky:['#4a1505','#1a0a05','#0a0400'], mountains:['#120500','#000000'], decor:['🔥','⚒️','✨'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'⭐', name:'Étoile éteinte', questions:5, difficulty:'medium'},
   {type:'puzzle', emoji:'🔭', name:'Carte du ciel effacée', questions:5, difficulty:'hard'},
   {type:'monster', emoji:'☄️', name:'Météore furieux', questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🌪️', name:'Tourmente de l\'Oubli', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🦅', name:'Phénix de Cendre', questions:7, difficulty:'hard', dropRare:true},
  ]},
 {id:'col_titan_3', region:'titan', label:'Le Trône de l\'Oubli', bg:'linear-gradient(135deg,#0a0400,#4a1505)', emoji:'👑', boss:'🌑', bossName:'Léthéas, Titan de l\'Oubli', level:'3E', starsReq:1565, theme:'volcan',
  parallax:{sky:['#4a1505','#1a0a05','#0a0400'], mountains:['#120500','#000000'], decor:['🔥','⚒️','✨'], astro:'🌑'},
  steps:[
   {type:'monster', emoji:'🌫️', name:'Garde du Trône', questions:5, difficulty:'hard'},
   {type:'puzzle', emoji:'⚖️', name:'Dernière Épreuve d\'Alaric', questions:5, difficulty:'hard'},
   {type:'monster', emoji:'👁️', name:'Regard du Néant', questions:5, difficulty:'hard'},
   {type:'minibss', emoji:'🗡️', name:'Bras Droit du Titan', questions:6, difficulty:'hard'},
   {type:'boss', emoji:'🌑', name:'Léthéas, Titan de l\'Oubli', questions:7, difficulty:'hard', dropRare:true},
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
 {id:'explorateur',label:'Explorateur du Savoir',ok:p=>(p.history||[]).length>=40,            col:'#1abc9c'},
 {id:'erudit',     label:'Érudit Polyvalent',   ok:p=>(p.stars||0)>=1000,                     col:'#16a085'},
 {id:'stratege',   label:'Stratège Aguerri',    ok:p=>((p.badgesEarned||[]).length)>=8,       col:'#8e44ad'},
 {id:'virtuose',   label:'Virtuose des Nombres',ok:p=>(p.badgesEarned||[]).includes('score100'),col:'#d35400'},
 {id:'conquerant', label:'Conquérant des Îles', ok:p=>(p.stars||0)>=2000,                     col:'#c0392b'},
 {id:'grandmaitre',label:'Grand Maître du Savoir',ok:p=>(p.stars||0)>=5000&&(p.history||[]).length>=60,col:'#f39c12'},
];
const SKINS=[
 {id:'default',label:'Classiques',  prv:'👾🧟🐉',price:0,  m:{n:['👾','🧟','🐉','🦄','🤖','🧌'],b:['👹','💀','🔥','🐲'],g:['✨','🌟','💎','👑']}},
 {id:'nature', label:'Nature 🌿',   prv:'🐸🦊🐺',price:100,m:{n:['🐸','🦊','🐺','🦁','🐯','🦅'],b:['🐲','🦈','🦖'],g:['🌈','🌸','🌺']}},
 {id:'space',  label:'Espace 🚀',   prv:'👽🤖🛸',price:160,m:{n:['👽','🛸','☄️','🌑','💫','🌀'],b:['⚫','🌌','🔭'],g:['⭐','🌟','💫']}},
 {id:'food',   label:'Gourmand 🍕', prv:'🍕🍟🍩',price:120,m:{n:['🍕','🍟','🍩','🌮','🍔','🍦'],b:['🎂','🍰','🧁'],g:['🍭','🍬','🍫']}},
 {id:'horror', label:'Horreur 💀',  prv:'💀👻🕷️',price:200,m:{n:['💀','👻','🕷️','🦇','🕸️','☠️'],b:['🧟','🧛','👹'],g:['💎','🔮','🩸']}},
 {id:'ocean',  label:'Océan 🌊',   prv:'🐙🦑🐠',price:150,m:{n:['🐙','🦑','🐠','🦀','🐡','🦞'],b:['🐋','🦈','🐊'],g:['🐚','🪸','💠']}},
 {id:'mythic', label:'Mythique 🐉',prv:'🐉🦅🦂',price:220,m:{n:['🐉','🦅','🦂','🐍','🦎','🕊️'],b:['🐲','🦖','🦕'],g:['🔱','⚜️','🗿']}},
 {id:'ice',    label:'Glace ❄️',   prv:'☃️🧊🐧',price:150,m:{n:['☃️','🧊','🐧','🦭','🐻‍❄️','❄️'],b:['🥶','🧟','🌬️'],g:['💎','🔷','🩵']}},
 {id:'robot',  label:'Cyborg 🤖',  prv:'🤖⚙️🔧',price:180,m:{n:['🤖','⚙️','🔧','🛠️','🔩','💻'],b:['🦾','🦿','🛰️'],g:['🔋','💡','⚡']}},
 {id:'party',  label:'Fête 🎉',    prv:'🎉🎈🎁',price:130,m:{n:['🎉','🎈','🎁','🎊','🪅','🎯'],b:['🎆','🎇','🧨'],g:['🏆','🥳','🎖️']}},
];
const VSOUNDS=[
 {id:'fanfare', label:'Fanfare 🎺', price:0, play:ctx=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'square',.25,.12),i*120));}},
 {id:'bells',   label:'Cloches 🔔', price:0, play:ctx=>{[880,1100,1320,880].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.4,.1),i*200));}},
 {id:'laser',   label:'Laser ⚡',   price:0, play:ctx=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(200,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+.5);o.type='sawtooth';g.gain.setValueAtTime(.15,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.5);}},
 {id:'chiptune',label:'Chiptune 🎮',price:0, play:ctx=>{[262,330,392,523,659].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'square',.15,.08),i*80));}},
 {id:'zen',     label:'Zen 🎵',     price:0, play:ctx=>{[528,660,792].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.8,.08),i*300));}},
 {id:'epic',    label:'Épique 🎬', price:150, play:ctx=>{[392,523,659,784,1047].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sawtooth',.3,.1),i*130));}},
 {id:'magic',   label:'Magie ✨',  price:150, play:ctx=>{[659,880,1047,1319,1047,880].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'triangle',.35,.09),i*90));}},
 {id:'triomphe',label:'Triomphe 🏆',price:150, play:ctx=>{[523,523,659,784,1047,784,1047].forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'square',.28,.11),i*110));}},
];
const MUSICS=[
 {id:'theme',        label:"L'Odyssée du Savoir",          file:'music/music-theme.mp3',        price:0},
 {id:'voyage',       label:'Le Premier Voyage',             file:'music/music-voyage.mp3',       price:300},
 {id:'clarte',       label:"La Clarté de l'Esprit",          file:'music/music-clarte.mp3',       price:300},
 {id:'murmure',      label:'Le Murmure du Passé',           file:'music/music-murmure.mp3',      price:300},
 {id:'verite',       label:'La Quête de la Vérité',         file:'music/music-verite.mp3',       price:300},
 {id:'souffle',      label:"Le Souffle de l'Aventure",       file:'music/music-souffle.mp3',      price:300},
 {id:'eveil',        label:"L'Esprit en Éveil",              file:'music/music-eveil.mp3',        price:300},
 {id:'reflexion',    label:'Les Chemins de la Réflexion',    file:'music/music-reflexion.mp3',    price:300},
 {id:'bout',         label:"Jusqu'au Bout de l'Odyssée",     file:'music/music-bout.mp3',         price:300},
 {id:'accomplie',    label:"L'Aventure Accomplie",           file:'music/music-accomplie.mp3',    price:300},
 {id:'surprise',     label:'Une Surprise Magique',           file:'music/music-surprise.mp3',     price:300},
 {id:'joyaux',       label:'Les Joyaux du Savoir',           file:'music/music-joyaux.mp3',       price:300},
 {id:'reveil',       label:"Le Réveil de l'Île",             file:'music/music-reveil.mp3',       price:300},
 {id:'boussole',     label:'La Boussole des Curieux',        file:'music/music-boussole.mp3',     price:300},
 {id:'promesses',    label:"Les Promesses de l'Horizon",     file:'music/music-promesses.mp3',    price:300},
 {id:'aubedec',      label:'L\u2019Aube des Découvertes',    file:'music/music-aubedec.mp3',      price:300},
 {id:'symphonie',    label:'La Symphonie des Rouages',       file:'music/music-symphonie.mp3',    price:300},
 {id:'automates',    label:'La Danse des Automates',         file:'music/music-automates.mp3',    price:300},
 {id:'echos',        label:"Les Échos de l'Atelier",         file:'music/music-echos.mp3',        price:300},
 {id:'rouages',      label:'Les Rouages du Savoir',          file:'music/music-rouages.mp3',      price:300},
 {id:'milleterres',  label:'Mille Terres à Découvrir',       file:'music/music-milleterres.mp3',  price:300},
 {id:'civilisations',label:'Le Souffle des Civilisations',   file:'music/music-civilisations.mp3',price:300},
 {id:'etoidesert',   label:'Les Étoiles du Désert',          file:'music/music-etoidesert.mp3',   price:300},
 {id:'chanthorizons',label:'Le Chant des Horizons',          file:'music/music-chanthorizons.mp3',price:300},
 {id:'lumieres',     label:'Les Lumières de Demain',         file:'music/music-lumieres.mp3',     price:300},
 {id:'aubemonde',    label:"L'Aube d'un Nouveau Monde",      file:'music/music-aubemonde.mp3',    price:300},
 {id:'infini',       label:"L'Infini des Possibles",         file:'music/music-infini.mp3',       price:300},
 {id:'etoiconn',     label:'Les Étoiles de la Connaissance', file:'music/music-etoiconn.mp3',     price:300},
 {id:'demain',       label:'Demain Sera Meilleur',           file:'music/music-demain.mp3',       price:300},
 {id:'chemincontinue',label:'Le Chemin Continue',            file:'music/music-chemincontinue.mp3',price:300},
 {id:'etoilesucces', label:"L'Étoile du Succès",             file:'music/music-etoilesucces.mp3', price:300},
 {id:'pasexplo',     label:'Le Pas des Explorateurs',        file:'music/music-pasexplo.mp3',     price:300},
 {id:'choixapproche',label:'Le Choix Approche',              file:'music/music-choixapproche.mp3',price:300},
 {id:'battement',    label:'Le Battement du Temps',          file:'music/music-battement.mp3',    price:300},
 {id:'terrenuages',  label:'Entre Terre et Nuages',          file:'music/music-terrenuages.mp3',  price:300},
 {id:'explocurieux', label:"L'Explorateur Curieux",          file:'music/music-explocurieux.mp3', price:300},
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
// Lot 3 (audit engagement, 13e conversation, pt.8) : messages occasionnels reliant
// une matière à son utilité concrète, pour nourrir le "sens" (théorie de
// l'autodétermination) — affichés au maximum une fois par jour (cf. startGame(),
// 07-game.js), pour ne jamais devenir un bruit de fond répétitif et ignoré.
const SENSE_MESSAGES = {
 math: [
  "Les fractions ? Comme partager une pizza en parts égales entre copains ! 🍕",
  "Les multiplications servent à calculer vite : par exemple, combien de bonbons dans 4 sachets de 6 ! 🍬",
  "Compter la monnaie, mesurer une recette, lire l'heure… les maths sont partout dans la vraie vie ! ⏰",
 ],
 fr: [
  "Bien conjuguer, c'est se faire comprendre clairement quand on raconte une histoire ! 📖",
  "Un bon vocabulaire, c'est plus de mots pour dire exactement ce qu'on pense ! 💬",
 ],
 hist: [
  "Connaître l'Histoire, c'est comprendre pourquoi le monde d'aujourd'hui est comme il est ! 🏛️",
  "Chaque personnage historique a affronté de grands défis… un peu comme toi dans ce jeu ! ⚔️",
 ],
};
const WEEKLY_CH=[
 {id:'w0',label:'Tables de 2',   target:20,reward:32,filter:q=>q.a===2||q.b===2},
 {id:'w1',label:'Tables de 7',   target:20,reward:48,filter:q=>q.a===7||q.b===7},
 // Lot 3 (audit engagement, 13e conversation, pt.22) : weakOpKey relie ce défi à
 // une clé de P.opStats — permet de le favoriser si c'est la faiblesse détectée
 // du joueur (cf. logique de sélection dans 05-profile.js). Uniquement renseigné
 // quand la correspondance est fiable (pas de lien clair table↔opStats pour w0/w1).
 {id:'w2',label:'Soustractions', target:15,reward:32,filter:q=>q.op==='-', weakOpKey:'-'},
 {id:'w3',label:'Fractions',     target:10,reward:56,filter:q=>q.type==='fraction'},
 {id:'w4',label:'Nbs manquants', target:15,reward:32,filter:q=>q.type==='missing'},
];
function getWCFilter(id){return(WEEKLY_CH.find(c=>c.id===id)||WEEKLY_CH[0]).filter;}
const ENC={
 // Encouragements génériques, personnalisés via le placeholder {name}.
 def:['Bravo {name} ! 🏆','Super {name} !','Excellent travail {name} ! 🌟','Tu es incroyable {name} ! 🔥','Champion {name} ! 👑','Continue comme ça {name} !'],
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
 ()=>{const s=ri(2,9);return{display:`Périmètre carré côté ${s}`,res:s*4,type:'geo',opKey:'geo',hint:`${s}×4=${s*4}`,visualHtml:(typeof _svgSquare==='function'?_svgSquare(s):'')};},
 ()=>{const l=ri(2,9),w=ri(1,6);return{display:`Périmètre rectangle ${l}×${w}`,res:2*(l+w),type:'geo',opKey:'geo',hint:`(${l}+${w})×2=${2*(l+w)}`,visualHtml:(typeof _svgRectangle==='function'?_svgRectangle(l,w):'')};},
 ()=>{const s=ri(2,8);return{display:`Aire carré côté ${s}`,res:s*s,type:'geo',opKey:'geo',hint:`${s}×${s}=${s*s}`,visualHtml:(typeof _svgSquare==='function'?_svgSquare(s):'')};},
 ()=>{const l=ri(2,9),w=ri(1,6);return{display:`Aire rectangle ${l}×${w}`,res:l*w,type:'geo',opKey:'geo',hint:`${l}×${w}=${l*w}`,visualHtml:(typeof _svgRectangle==='function'?_svgRectangle(l,w):'')};},
 ()=>{const a=ri(3,7)*10,b=ri(2,5)*10;return{display:`Triangle : angles ${a}° et ${b}°, 3ème ?`,res:180-a-b,type:'geo',opKey:'geo',hint:`180-${a}-${b}=${180-a-b}`,visualHtml:(typeof _svgTriangleAngles==='function'?_svgTriangleAngles(a,b):'')};},
];
// ── FILTRES OPS DISPONIBLES ──
const OP_FILTERS=[
 {key:'add',  label:'Additions (+)',       affects:['CP','CE1','CM1']},
 {key:'sub',  label:'Soustractions (−)',   affects:['CE1']},
 {key:'mult', label:'Multiplications (×)', affects:['CE2','CM1','CM2']},
 {key:'div',  label:'Divisions (÷)',       affects:['CM2']},
 {key:'miss', label:'Nombres manquants',   affects:['CE1','CE2','CM1']},
 {key:'frac', label:'Fractions',           affects:['CM2','6e']},
 {key:'geo',  label:'Géométrie',           affects:['CM1','CM2']},
 // ── Collège (cycle 4) — filtres déjà honorés par les générateurs 6e→3e ──
 {key:'dec',  label:'Décimaux (×/÷ 10…)',  affects:['6e']},
 {key:'conv', label:'Conversions d\'unités',affects:['6e']},
 {key:'rel',  label:'Nombres relatifs (±)',affects:['5e','4e']},
 {key:'pct',  label:'Pourcentages',        affects:['5e','3e']},
 {key:'pow',  label:'Puissances',          affects:['4e','3e']},
 {key:'lit',  label:'Calcul littéral',     affects:['4e','3e']},
 {key:'pgcd', label:'PGCD / nombres premiers', affects:['3e']},
 {key:'sqrt', label:'Racines carrées',     affects:['3e']},
];
// ── FILTRES CATÉGORIES HISTOIRE (v11.5.2) ──
// Miroir de OP_FILTERS pour la matière histoire : filtre par catégorie de
// question plutôt que par opération. temps/repere ne concernent que la
// maternelle (PS/MS/GS) ; les 4 autres couvrent primaire (CP→CM2) et collège
// (6e→3e), qui réutilisent les mêmes 4 catégories (cf. section 14 du projet).
const HIST_CAT_FILTERS=[
 {key:'frise',        label:'Frises & repères',   affects:['CP→3e']},
 {key:'personnages',  label:'Personnages',        affects:['CP→3e']},
 {key:'evenements',   label:'Événements',         affects:['CP→3e']},
 {key:'civilisation', label:'Vie & civilisation',  affects:['CP→3e']},
 {key:'temps',        label:'Le temps qui passe',  affects:['PS','MS','GS']},
 {key:'repere',       label:'Repérage visuel',     affects:['PS','MS','GS']},
];
// ── FILTRES CATÉGORIES FRANÇAIS (v11.5.3) ──
// Miroir de HIST_CAT_FILTERS. Les 4 catégories couvrent tous les niveaux
// implémentés (PS→3e) : pas de split maternelle/primaire ici (contrairement
// à l'histoire), _frCatOf ne dépend jamais du niveau.
const FR_CAT_FILTERS=[
 {key:'conj',  label:'Conjugaison', affects:['PS→3e']},
 {key:'orth',  label:'Orthographe', affects:['PS→3e']},
 {key:'gram',  label:'Grammaire',   affects:['PS→3e']},
 {key:'vocab', label:'Vocabulaire', affects:['PS→3e']},
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
   // Lot 3 (audit engagement, 13e conversation, pt.16) : palier intermédiaire
   // ajouté (écart 100→500 jugé trop lointain pour un jeune enfant).
   {goal:250, xp:45, stars:8},
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
   // Lot 3 (audit engagement, 13e conversation, pt.16) : palier intermédiaire
   // ajouté (écart 1000→5000 jugé trop lointain).
   {goal:2500, xp:45, stars:8},
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
   // Lot 3 (audit engagement, 13e conversation, pt.16) : palier intermédiaire
   // ajouté (écart 1000→5000 jugé trop lointain).
   {goal:2500, xp:45, stars:0},
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
  desc:'Tu fais tes premiers pas dans l\'aventure.',
  ok: d => true, // toujours dispo (stade de départ)
  unlockedAvatars: ['🧒','🧑','👦','👧','🐣','🐥','🐶','🐕','🐭','🐸','🟢','🟠','🔵','⭐','🍬'],
 },
 {
  id:'apprenti',
  label:'Apprenti',
  icon:'🌱',
  color:'#2ecc71',
  desc:'Tu maîtrises tes premiers défis.',
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
  desc:'Ta sagesse est reconnue de tous.',
  ok: d => (d.totalWins||0) >= 50 && (d._totalStarsEarned||0) >= 100,
  unlockedAvatars: ['🧙\u200D♂️','🧙\u200D♀️','🦸\u200D♂️','🦸\u200D♀️','🧜\u200D♀️','🧜\u200D♂️','🧚','💎','🔮','🌟','⚡','🔥','🌙','☀️','⛄','😈','🧛','🧟','💀','🦾','🎭','☯️','🚀'],
 },
 {
  id:'legende',
  label:'Légende',
  icon:'👑',
  color:'#f1c40f',
  desc:'Tu fais partie des héros légendaires !',
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