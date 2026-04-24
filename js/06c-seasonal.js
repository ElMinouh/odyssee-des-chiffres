// 06c-seasonal.js — L'Odyssée des Chiffres
'use strict';
// ═══════════════════════════════════════════════════════
// BOSS SAISONNIERS ET D'ANNIVERSAIRE (chantier 2.2)
// ═══════════════════════════════════════════════════════
// Détecte si la date du jour correspond à un événement spécial
// et renvoie le boss correspondant (ou null sinon).
// Chaque boss vaincu débloque une figurine exclusive (figId).

const SEASONAL_WINDOW_DAYS = 7; // chaque boss saisonnier est actif 7 jours

// ── Calcul des dates variables ────────────────────────────────
function _easter(year){
 const a=year%19, b=Math.floor(year/100), c=year%100;
 const d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30, i=Math.floor(c/4), k=c%4;
 const l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
 const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
 return new Date(year, month-1, day);
}
function _mardiGras(year){
 const e=_easter(year); const d=new Date(e); d.setDate(d.getDate()-47); return d;
}
const _CHINESE_NY = {
 2025:[1,29], 2026:[2,17], 2027:[2,6],  2028:[1,26], 2029:[2,13],
 2030:[2,3],  2031:[1,23], 2032:[2,11], 2033:[1,31], 2034:[2,19], 2035:[2,8]
};
function _chineseNY(year){
 const d=_CHINESE_NY[year]; return d?new Date(year, d[0]-1, d[1]):null;
}
function _isInWindow(today, startMonth, startDay, days=SEASONAL_WINDOW_DAYS){
 const year=today.getFullYear();
 const start=new Date(year, startMonth-1, startDay);
 const end=new Date(year, startMonth-1, startDay+days);
 if(today>=start && today<end) return true;
 const startPrev=new Date(year-1, startMonth-1, startDay);
 const endPrev=new Date(year-1, startMonth-1, startDay+days);
 return today>=startPrev && today<endPrev;
}
function _isInDateWindow(today, dateObj, days=SEASONAL_WINDOW_DAYS){
 if(!dateObj) return false;
 const end=new Date(dateObj); end.setDate(end.getDate()+days);
 return today>=dateObj && today<end;
}

// ── Boss saisonniers à dates fixes ────────────────────────────
// figId : id de la figurine exclusive débloquée en battant ce boss
const SEASONAL_BOSSES = [
 {key:'epiphanie',  startMonth:1,  startDay:6,  emoji:'👑', name:'Roi de la Galette',     title:'Épiphanie',          intro:'Qui trouvera la fève ?',                       col:'#f39c12', mult:2, figId:'sx_epiphanie'},
 {key:'valentin',   startMonth:2,  startDay:14, emoji:'💘', name:'Cœur Piégé',            title:'Saint-Valentin',     intro:"Mes flèches mathématiques sont implacables…",  col:'#e84393', mult:2, figId:'sx_valentin'},
 {key:'printemps',  startMonth:3,  startDay:20, emoji:'🌸', name:'Esprit du Printemps',   title:'Équinoxe de Printemps', intro:'La nature se réveille, et moi avec !',     col:'#27ae60', mult:2, figId:'sx_printemps'},
 {key:'avril1',     startMonth:4,  startDay:1,  emoji:'🐟', name:'Poisson d\'Avril',      title:'Poisson d\'Avril',   intro:"Crois-tu vraiment savoir compter ? Ha ha !",   col:'#3498db', mult:2, figId:'sx_avril1'},
 {key:'ete',        startMonth:6,  startDay:21, emoji:'☀️', name:'Soleil de Feu',         title:'Solstice d\'Été',    intro:'Mes rayons brûleront tes calculs !',           col:'#e67e22', mult:2, figId:'sx_ete'},
 {key:'14juillet',  startMonth:7,  startDay:14, emoji:'🎆', name:'Fureur Tricolore',      title:'Fête Nationale',     intro:'Vive la République des nombres !',             col:'#e74c3c', mult:2, figId:'sx_14juillet'},
 {key:'rentree',    startMonth:9,  startDay:1,  emoji:'🎒', name:'Cancre Insolent',       title:'Rentrée des Classes', intro:"Je n'ai jamais fait mes devoirs et pourtant…", col:'#8e44ad', mult:2, figId:'sx_rentree'},
 {key:'automne',    startMonth:9,  startDay:22, emoji:'🍂', name:'Esprit d\'Automne',     title:'Équinoxe d\'Automne', intro:'Les feuilles tombent, et tes scores aussi.',  col:'#d35400', mult:2, figId:'sx_automne'},
 {key:'halloween',  startMonth:10, startDay:31, emoji:'🎃', name:'Citrouille Maudite',    title:'Halloween',          intro:'Bouh ! Saurras-tu déjouer mes calculs ?',       col:'#d35400', mult:2, figId:'sx_halloween'},
 {key:'hiver',      startMonth:12, startDay:21, emoji:'❄️', name:'Esprit d\'Hiver',       title:'Solstice d\'Hiver',  intro:'Je vais geler tes neurones !',                  col:'#3498db', mult:2, figId:'sx_hiver'},
 {key:'noel',       startMonth:12, startDay:24, emoji:'🎄', name:'Père Fouettard',        title:'Noël',               intro:"Tu n'auras pas de cadeaux si tu ne calcules pas !", col:'#27ae60', mult:3, figId:'sx_noel'},
 {key:'nouvelan',   startMonth:12, startDay:31, emoji:'🥂', name:'Horloge Infernale',     title:'Nouvel An',          intro:'À minuit, je doublerai ma puissance !',         col:'#f1c40f', mult:3, figId:'sx_nouvelan'},
];

// ── Anniversaires des joueurs (boss perso) ───────────────────
const BIRTHDAY_BOSSES = {
 'Soren': {month:8,  day:1,  emoji:'🎂', name:'Gâteau de Soren', col:'#e84393', figId:'sx_anniv_soren'},
 'Peyo':  {month:7,  day:7,  emoji:'🎂', name:'Gâteau de Peyo',  col:'#3498db', figId:'sx_anniv_peyo'},
 'Tomi':  {month:3,  day:13, emoji:'🎂', name:'Gâteau de Tomi',  col:'#9b59b6', figId:'sx_anniv_tomi'},
 'Papa':  {month:4,  day:28, emoji:'🎂', name:'Gâteau de Papa',  col:'#27ae60', figId:'sx_anniv_papa'},
 'Maman': {month:4,  day:11, emoji:'🎂', name:'Gâteau de Maman', col:'#e67e22', figId:'sx_anniv_maman'},
};

/**
 * Renvoie le boss saisonnier ou d'anniversaire actif aujourd'hui pour le joueur,
 * ou null si aucun.
 * Priorité : anniversaire > saisonnier (anniversaire prime !)
 */
function getActiveSeasonalBoss(playerName){
 const today = new Date();
 const year  = today.getFullYear();

 // 1. Boss d'anniversaire (priorité absolue)
 const bday = BIRTHDAY_BOSSES[playerName];
 if(bday){
  const bdayDate = new Date(year, bday.month-1, bday.day);
  if(_isInDateWindow(today, bdayDate, SEASONAL_WINDOW_DAYS)){
   return {
    key:`birthday_${playerName}`,
    emoji: bday.emoji,
    name: bday.name,
    title:`Joyeux anniversaire ${playerName} !`,
    intro:`🎉 ${playerName}, c'est ton jour spécial ! Bats-moi pour ouvrir ton cadeau !`,
    col: bday.col,
    anim:'glow',
    mult: 3,
    figId: bday.figId,
    isBirthday: true,
    playerName
   };
  }
 }

 // 2. Boss saisonniers à dates variables (Pâques, Mardi gras, Nouvel an chinois)
 const variables = [
  (()=>{
   const e=_easter(year);
   if(_isInDateWindow(today, e)) return {key:'paques', emoji:'🐣', name:'Lapin de l\'Ombre', title:'Pâques', intro:'Mes œufs cachent des pièges !', col:'#f1c40f', mult:2, figId:'sx_paques'};
   return null;
  })(),
  (()=>{
   const m=_mardiGras(year);
   if(_isInDateWindow(today, m)) return {key:'mardigras', emoji:'🎭', name:'Masque Trompeur', title:'Mardi Gras', intro:'Devine qui je suis vraiment !', col:'#9b59b6', mult:2, figId:'sx_mardigras'};
   return null;
  })(),
  (()=>{
   const c=_chineseNY(year);
   if(_isInDateWindow(today, c)) return {key:'cny', emoji:'🐲', name:'Dragon de Jade', title:'Nouvel An Chinois', intro:'Que la fortune mathématique soit avec toi !', col:'#c0392b', mult:2, figId:'sx_cny'};
   return null;
  })(),
 ].filter(Boolean);
 if(variables.length) return {...variables[0], anim:'glow'};

 // 3. Boss saisonniers à dates fixes
 for(const sb of SEASONAL_BOSSES){
  if(_isInWindow(today, sb.startMonth, sb.startDay)){
   return {...sb, anim:'glow'};
  }
 }

 return null;
}

/**
 * Débloque la figurine exclusive d'un boss saisonnier (si pas déjà possédée)
 * et déclenche l'animation de découverte.
 * Retourne true si une nouvelle figurine vient d'être débloquée.
 */
function unlockSeasonalFigurine(figId){
 if(!P||!figId)return false;
 P.ownedFigurines = Array.isArray(P.ownedFigurines) ? P.ownedFigurines : [];
 if(P.ownedFigurines.includes(figId)) return false;
 P.ownedFigurines.push(figId);
 if(typeof saveProfileNow==='function') saveProfileNow();
 return true;
}