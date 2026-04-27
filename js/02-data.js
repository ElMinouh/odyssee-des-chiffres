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
const MAP_ZONES=[
 {id:'plaine',  label:'Plaine des Débuts',bg:'linear-gradient(135deg,#27ae60,#2ecc71)',emoji:'🌾',boss:'🐺',bossName:'Loup des Plaines',level:'CP', starsReq:0,   theme:'standard'},
 {id:'foret',   label:'Forêt Enchantée',  bg:'linear-gradient(135deg,#1b6b3a,#2ecc71)',emoji:'🌲',boss:'🐲',bossName:'Dragon de Forêt', level:'CE1',starsReq:10,  theme:'foret'},
 {id:'desert',  label:'Désert de Feu',    bg:'linear-gradient(135deg,#e67e22,#c0392b)',emoji:'🏜️',boss:'🦂',bossName:'Scorpion Géant',  level:'CE2',starsReq:30,  theme:'volcan'},
 {id:'glace',   label:'Pics de Glace',    bg:'linear-gradient(135deg,#2980b9,#74b9ff)',emoji:'🏔️',boss:'❄️',bossName:'Géant de Glace',  level:'CM1',starsReq:60,  theme:'standard'},
 {id:'volcan',  label:'Volcan Maudit',    bg:'linear-gradient(135deg,#8b0000,#e74c3c)',emoji:'🌋',boss:'🔥',bossName:'Seigneur des Flammes',level:'CM2',starsReq:100,theme:'volcan'},
 {id:'espace',  label:'Galaxie Infinie',  bg:'linear-gradient(135deg,#1a1c2c,#9b59b6)',emoji:'🌌',boss:'👽',bossName:'Alien Quantique',  level:'CM2',starsReq:200,theme:'espace'},
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
const GIFS=[
 {url:'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHp4d2lyY3kwY3Z4enZhMnh1d29nZWNjbTFpeG5ld2owYXVtNWd3ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1gVUhlXhETaRRxzeHO/giphy.gif',n:'Goku'},
 {url:'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGExbWFqd2k3a2NodHVnYzVibzZqdHBvZ3hhMzlnYnp6MTFtbG8wciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZwxpIHk5LutMc/giphy.gif',n:'Yoda'},
 {url:'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnJ5ZHRlMWQzeHR1c3k3M2g4ZDlldDd5cGIwYmJ5MTBjOGNoNzdzOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TJO5x5QQM72Q0weWXN/giphy.gif',n:'Harry Potter'},
 {url:'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWc2Nmlyd2o2a294eTdqeWIzYm0xa2Z3eGVja2g1em0zM214NTh0YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Q56gcfTAteVZS/giphy.gif',n:'Krilin'},
 {url:'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2hvc3VmOGQyNG5iYnFibDkxOGtwamFnMDV0YzBxYzBuamhlbHBpayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8bS2vbeZ3hEuk/giphy.gif',n:'Trunks'},
 {url:'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cWtkOHh3a3dpenIxNTgwNjV1aTQxODVtZWx6bHkxd25qcnV2YXlydCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/m32zTHRBlr8WY/giphy.gif',n:'Vegeta'},
 {url:'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHRudnUwZ3JuZmQ3ajNnYXg2bDFqbzFtcm9wM21yaXk4czRycGwyNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/AKEbkxfHZIzBLEyjEb/giphy.gif',n:'Tortue Géniale'},
 {url:'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWh0d3B0a2k5MHYxODdqdXVzZXU1c2JhYndldDhxaXczbDVvN3lkbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UXKy7mHAZ5Mqc/giphy.gif',n:'Hermione'},
 {url:'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MG9lYTI4N3dqaG1najdyZDN4bmtianZubWxmZGp2bG5sb3k2bjZ4bCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/e65ESgfYs1IzhuUUei/giphy.gif',n:'Dark Vador'},
 {url:'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d3V5NGgyamp0azNpeDNvOWJwNXR5bTl6aDgyaWNhbTlwdjlpcjRwZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uicy8S4i5eNnQMajJT/giphy.gif',n:'Ron Weasley'},
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