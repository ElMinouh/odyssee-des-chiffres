// 05-profile.js — L'Odyssée des Chiffres
'use strict';

// Gestion du profil joueur : chargement, sauvegarde, préférences, XP, niveaux.

// ═══════════════════════════════════════════════════════
// VERSIONING DE LA SAUVEGARDE
// ═══════════════════════════════════════════════════════
// Incrémenter SAVE_VERSION quand le format change. Ajouter une fonction de
// migration `migrate_v{N-1}_to_v{N}` qui transforme l'ancien format en nouveau.
const SAVE_VERSION = 6;

const _MIGRATIONS = {
 // De V5 vers V6 : ajout du champ opFilters et mapBossBeaten.
 // Exemple de migration future :
 // 6: (raw) => { raw.newField = 'default'; return raw; },
};

function migrateProfile(raw){
 const fromV = raw._v || 1;
 if(fromV >= SAVE_VERSION) return raw;
 let cur = raw;
 for(let v = fromV + 1; v <= SAVE_VERSION; v++){
  if(typeof _MIGRATIONS[v] === 'function'){
   try{ cur = _MIGRATIONS[v](cur); }
   catch(e){ console.warn(`[migration] échec V${v-1}→V${v} :`, e); }
  }
 }
 cur._v = SAVE_VERSION;
 return cur;
}

// ═══════════════════════════════════════════════════════
// VALIDATION DU PROFIL
// ═══════════════════════════════════════════════════════
// Garde-fous : un profil corrompu (ou bidouillé) ne doit pas crasher l'app.
// Toutes les valeurs sont bornées à des plages raisonnables et typées.

const _ALLOWED_LEVELS = ['CP','CE1','CE2','CM1','CM2'];
const _ALLOWED_MODES = ['keyboard','qcm'];
const _ALLOWED_MODES2 = ['normal','survie','chrono','combat','revision'];
const _ALLOWED_THEMES = ['standard','espace','foret','volcan'];
const _ALLOWED_APPEARANCE = ['dark','light','auto'];

function _clampNum(v, min, max, defaultV){
 const n = Number(v);
 if(!Number.isFinite(n)) return defaultV;
 return Math.max(min, Math.min(max, Math.floor(n)));
}
function _safeStr(v, maxLen, defaultV){
 if(typeof v !== 'string') return defaultV;
 return v.slice(0, maxLen);
}
function _safeArr(v, defaultV){
 return Array.isArray(v) ? v : (defaultV ?? []);
}
function _safeBool(v, defaultV){
 return typeof v === 'boolean' ? v : defaultV;
}

function validateProfile(raw, defaultName){
 if(!raw || typeof raw !== 'object') return null;
 const def = defProfile(defaultName);
 const out = {
  _v: SAVE_VERSION,
  name: _safeStr(raw.name, 30, defaultName),
  stars: _clampNum(raw.stars, 0, 999999, 0),
  xp: _clampNum(raw.xp, 0, 9999999, 0),
  skills: {
   shield: _clampNum(raw.skills?.shield, 0, 3, 0),
   sword:  _clampNum(raw.skills?.sword,  0, 3, 0),
   clock:  _clampNum(raw.skills?.clock,  0, 3, 0),
  },
  inventory: {
   potion: _clampNum(raw.inventory?.potion, 0, 99, 0),
   bomb:   _clampNum(raw.inventory?.bomb,   0, 99, 0),
  },
  history: _safeArr(raw.history).slice(-50),
  historyDetailed: _safeArr(raw.historyDetailed).slice(-30),
  errors: _safeArr(raw.errors).slice(-60).filter(e => typeof e === 'string'),
  errorLog: _safeArr(raw.errorLog).slice(-30).filter(e => e && typeof e==='object' && typeof e.q==='string' && typeof e.t==='number'),
  milestonesClaimed: _safeArr(raw.milestonesClaimed).filter(s => typeof s === 'string'),
  _bestCombo: _clampNum(raw._bestCombo, 0, 99999, 0),
  _totalStarsEarned: _clampNum(raw._totalStarsEarned, 0, 9999999, 0),
  badgesEarned: _safeArr(raw.badgesEarned).filter(b => typeof b === 'string'),
  quests: raw.quests ?? null,
  questsDate: _safeStr(raw.questsDate, 12, null),
  opStats: { ...def.opStats, ...(raw.opStats || {}) },
  levelWins: {
   CP:  _clampNum(raw.levelWins?.CP,  0, 9999, 0),
   CE1: _clampNum(raw.levelWins?.CE1, 0, 9999, 0),
   CE2: _clampNum(raw.levelWins?.CE2, 0, 9999, 0),
   CM1: _clampNum(raw.levelWins?.CM1, 0, 9999, 0),
   CM2: _clampNum(raw.levelWins?.CM2, 0, 9999, 0),
  },
  mapBossBeaten: _safeArr(raw.mapBossBeaten).filter(b => typeof b === 'string'),
  prefs: {
   level:  _ALLOWED_LEVELS.includes(raw.prefs?.level)  ? raw.prefs.level  : 'CP',
   mode:   _ALLOWED_MODES.includes(raw.prefs?.mode)    ? raw.prefs.mode   : 'keyboard',
   mode2:  _ALLOWED_MODES2.includes(raw.prefs?.mode2)  ? raw.prefs.mode2  : 'normal',
   theme:  _ALLOWED_THEMES.includes(raw.prefs?.theme)  ? raw.prefs.theme  : 'standard',
   appearance: ['dark','light','auto'].includes(raw.prefs?.appearance) ? raw.prefs.appearance : 'dark',
  },
  sessionMinutes: _clampNum(raw.sessionMinutes, 0, 999999, 0),
  weeklyChallenge: raw.weeklyChallenge ?? null,
  wcDate: _safeStr(raw.wcDate, 12, null),
  objective: _clampNum(raw.objective, 0, 99, 0),
  objectiveDone: _clampNum(raw.objectiveDone, 0, 99, 0),
  objDate: _safeStr(raw.objDate, 12, null),
  avatar: _safeStr(raw.avatar, 8, '🧙'),
  heroTitle: _safeStr(raw.heroTitle, 30, 'novice'),
  ownedSkins: _safeArr(raw.ownedSkins).filter(s => typeof s === 'string'),
  equippedSkin: _safeStr(raw.equippedSkin, 30, null),
  victorySound: _safeStr(raw.victorySound, 20, 'fanfare'),
  ownedFigurines: _safeArr(raw.ownedFigurines).filter(f => typeof f === 'string').slice(0, 500),
  opFilters: {
   add:  _safeBool(raw.opFilters?.add,  true),
   sub:  _safeBool(raw.opFilters?.sub,  true),
   mult: _safeBool(raw.opFilters?.mult, true),
   div:  _safeBool(raw.opFilters?.div,  true),
   miss: _safeBool(raw.opFilters?.miss, true),
   frac: _safeBool(raw.opFilters?.frac, true),
   geo:  _safeBool(raw.opFilters?.geo,  true),
  },
 };
 return out;
}

// ═══════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════
function defProfile(name){
 return{_v:SAVE_VERSION,name,stars:0,xp:0,skills:{shield:0,sword:0,clock:0},inventory:{potion:0,bomb:0},
  history:[],historyDetailed:[],errors:[],errorLog:[],badgesEarned:[],milestonesClaimed:[],_bestCombo:0,_totalStarsEarned:0,
  quests:null,questsDate:null,opStats:{'+':{ ok:0,fail:0},'-':{ok:0,fail:0},'x':{ok:0,fail:0},'/':{ ok:0,fail:0},'geo':{ok:0,fail:0}},
  levelWins:{CP:0,CE1:0,CE2:0,CM1:0,CM2:0},mapBossBeaten:[],
  prefs:{level:'CP',mode2:'normal',mode:'keyboard',theme:'standard'},
  sessionMinutes:0,weeklyChallenge:null,wcDate:null,
  objective:0,objectiveDone:0,objDate:null,
  avatar:'🧙',heroTitle:'novice',ownedSkins:[],equippedSkin:null,victorySound:'fanfare',ownedFigurines:[],
  opFilters:{add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true}};
}
function loadProfile(){
 const sel=$('playerSelect').value;
 let name=sel==='Autre'?($('customInput').value.trim()||localStorage.getItem('customPlayerName')||'Joueur'):sel;
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem('user_'+name)||'null');}
 catch(e){
  console.warn('[profil] sauvegarde corrompue pour',name,'— restauration des valeurs par défaut');
  if(typeof toast==='function')toast('⚠️ Sauvegarde corrompue, profil réinitialisé.',4000);
 }
 if(saved){
  // 1. Migration : si format ancien, on le met à jour.
  saved = migrateProfile(saved);
  // 2. Validation : on garantit que toutes les valeurs sont bien typées et bornées.
  const validated = validateProfile(saved, name);
  if(validated){
   P = validated;
  }else{
   console.warn('[profil] validation échouée — profil par défaut');
   P = defProfile(name);
  }
 }else{P=defProfile(name);}
 if(P.questsDate!==todayKey()){P.quests=genQuests();P.questsDate=todayKey();}
 if(P.wcDate!==weekKey()){
  const wc=WEEKLY_CH[ri(0,WEEKLY_CH.length-1)];
  P.weeklyChallenge={id:wc.id,label:wc.label,target:wc.target,reward:wc.reward,progress:0,done:false};
  P.wcDate=weekKey();
 }
 if(P.objDate!==todayKey()){P.objectiveDone=0;P.objDate=todayKey();}
 applyPrefs();updateMenuUI();
}
// saveProfile avec debounce : évite de sérialiser à chaque micro-action (quêtes, badges…)
// saveProfileNow() force la sauvegarde immédiate (fin de partie, achats)
let _saveTimer=null;
function saveProfile(){
 clearTimeout(_saveTimer);
 _saveTimer=setTimeout(()=>{
  try{localStorage.setItem('user_'+P.name,JSON.stringify(P));}
  catch(e){if(e.name==='QuotaExceededError'||e.code===22||e.code===1014)toast('⚠️ Stockage plein ! Progression non sauvegardée.',4000);}
 },800);
}
function saveProfileNow(){
 clearTimeout(_saveTimer);
 try{localStorage.setItem('user_'+P.name,JSON.stringify(P));}
 catch(e){if(e.name==='QuotaExceededError'||e.code===22||e.code===1014)toast('⚠️ Stockage plein ! Progression non sauvegardée.',4000);}
}
function applyPrefs(){
 const p=P.prefs||{};
 const ls=$('levelSelect');
 ls.innerHTML=['CP','CE1','CE2','CM1','CM2'].map(l=>{
  const ok=isUnlocked(l),pW=prevWins(l),req=UNLOCK_REQ[l];
  return `<option value="${l}"${!ok?' disabled':''}${l===(p.level||'CP')?' selected':''}>${ok?'':'🔒 '}${l}${!ok?' ('+pW+'/'+req+' vic.)':''}`;
 }).join('');
 $('modeSelect').value=p.mode||'keyboard';
 $('gameModeSelect').value=p.mode2||'normal';
 applyTheme(p.theme||'standard');
 $('themeSelect').value=p.theme||'standard';
 // Chantier B1 : appliquer le mode clair/sombre sauvegardé
 if(typeof initAppearance === 'function') initAppearance();
}
// Table de correspondance niveau→index (évite indexOf à chaque appel)
const LEVEL_IDX={CP:0,CE1:1,CE2:2,CM1:3,CM2:4};
const VALID_LEVELS=['CP','CE1','CE2','CM1','CM2'];
function savePrefs(){
 const lvl=$('levelSelect').value;
 P.prefs={level:VALID_LEVELS.includes(lvl)?lvl:'CP',mode:$('modeSelect').value,mode2:$('gameModeSelect').value,theme:$('themeSelect').value};
 saveProfile();
}
function updateMenuUI(){
 $('menu-stars').innerText=P.stars||0;
 $('menu-avatar').innerText=P.avatar||'🧙';
 $('cnt-potion').innerText=P.inventory.potion||0;
 $('cnt-bomb').innerText=P.inventory.bomb||0;
 const t=getTopTitle();$('menu-htitle').innerText=t?t.label:'';
 updateXPBar();renderWC();
}
function updateXPBar(){
 const xp=P.xp||0,lvl=levelFromXP(xp);
 $('lvl-badge').innerText='Niv.'+lvl;
 // calcul de l'XP dans le niveau courant sans risque de négatif
 let rem=xp;for(let i=0;i<lvl-1&&i<XP_TABLE.length;i++)rem-=XP_TABLE[i];
 const need=XP_TABLE[Math.min(lvl-1,XP_TABLE.length-1)]||1;
 const cur=Math.max(0,rem);
 const pct=Math.min(100,Math.round(cur/need*100));
 $('xp-bar').style.width=pct+'%';
 $('xp-label').innerText=`XP Niv.${lvl} · ${cur}/${need}`;
}
function onPlayerChange(){
 const v=$('playerSelect').value;
 $('custom-zone').classList.toggle('hidden',v!=='Autre');
 if(v!=='Autre')loadProfile();
}
function applyCustom(){const n=$('customInput').value.trim();if(n)localStorage.setItem('customPlayerName',n);loadProfile();}
function isUnlocked(lvl){return UNLOCK_REQ[lvl]===0||prevWins(lvl)>=UNLOCK_REQ[lvl];}
function prevWins(lvl){const i=LEVEL_IDX[lvl];return i<=0?0:(P.levelWins[VALID_LEVELS[i-1]]||0);}
function applyTheme(t){document.body.className=t==='standard'?'':'theme-'+t;if(musicOn){stopMusic();startMusic();}}

// ═══════════════════════════════════════════════════════
// XP & LEVEL UP CINÉMATIQUE
// ═══════════════════════════════════════════════════════
function gainXP(amt,won){
 const xpGain=Math.round(amt*(won?3:1)*0.8);
 const oldLvl=levelFromXP(P.xp||0);
 P.xp=(P.xp||0)+xpGain;
 const newLvl=levelFromXP(P.xp);
 saveProfile();updateXPBar();
 // vérifie si un niveau scolaire a été débloqué
 const scolaires=['CP','CE1','CE2','CM1','CM2'];
 const ks=Object.keys(UNLOCK_REQ);
 ks.forEach(lvl=>{
  if(isUnlocked(lvl)){
   const key='unlocked_anim_'+lvl;
   if(!localStorage.getItem('unlocked_anim_'+P.name+'_'+lvl)){
    localStorage.setItem('unlocked_anim_'+P.name+'_'+lvl,'1');
    setTimeout(()=>showLevelUpAnim(lvl,xpGain),800);
   }
  }
 });
 return xpGain;
}
function showLevelUpAnim(lvl,xpGain){
 const icons={CP:'🌱',CE1:'🌿',CE2:'🌳',CM1:'🔥',CM2:'💎'};
 const descs={CP:'Les bases sont là !',CE1:'Addition, soustraction… maîtrisées !',CE2:'Les tables de multiplication t\'attendent !',CM1:'La géométrie entre en jeu !',CM2:'Fractions et défis ultimes !'};
 $('lu-title').innerText='NIVEAU DÉBLOQUÉ !';
 $('lu-icon').innerText=icons[lvl]||'🎓';
 $('lu-lvl').innerText=lvl+' débloqué !';
 $('lu-sub').innerText=descs[lvl]||'Nouveau défi !';
 $('lu-xp').innerText=`+${xpGain} XP gagnés`;
 $('level-up-screen').classList.remove('hidden');
 startConfetti();vibrate(VIBE.levelup);
 [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.4,.15),i*120));
 $('level-up-screen').onclick=()=>{$('level-up-screen').classList.add('hidden');$('level-up-screen').onclick=null;};
}
