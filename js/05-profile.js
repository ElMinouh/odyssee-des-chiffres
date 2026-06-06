// 05-profile.js — L'Odyssée des Chiffres
'use strict';

// Gestion du profil joueur : chargement, sauvegarde, préférences, XP, niveaux.

// ═══════════════════════════════════════════════════════
// VERSIONING DE LA SAUVEGARDE
// ═══════════════════════════════════════════════════════
// Incrémenter SAVE_VERSION quand le format change. Ajouter une fonction de
// migration `migrate_v{N-1}_to_v{N}` qui transforme l'ancien format en nouveau.
const SAVE_VERSION = 7;

const _MIGRATIONS = {
 // De V5 vers V6 : ajout du champ opFilters et mapBossBeaten.
 // De V6 vers V7 : ajout du champ heroStageId (chantier B2).
 7: (raw) => { raw.heroStageId = raw.heroStageId || 'oeuf'; return raw; },
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

const _ALLOWED_LEVELS = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6E','5E','4E','3E'];
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
  historyDetailed: _safeArr(raw.historyDetailed).slice(-60),
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
   PS:  _clampNum(raw.levelWins?.PS,  0, 9999, 0),
   MS:  _clampNum(raw.levelWins?.MS,  0, 9999, 0),
   GS:  _clampNum(raw.levelWins?.GS,  0, 9999, 0),
   CP:  _clampNum(raw.levelWins?.CP,  0, 9999, 0),
   CE1: _clampNum(raw.levelWins?.CE1, 0, 9999, 0),
   CE2: _clampNum(raw.levelWins?.CE2, 0, 9999, 0),
   CM1: _clampNum(raw.levelWins?.CM1, 0, 9999, 0),
   CM2: _clampNum(raw.levelWins?.CM2, 0, 9999, 0),
   '6E': _clampNum(raw.levelWins?.['6E'], 0, 9999, 0),
   '5E': _clampNum(raw.levelWins?.['5E'], 0, 9999, 0),
   '4E': _clampNum(raw.levelWins?.['4E'], 0, 9999, 0),
   '3E': _clampNum(raw.levelWins?.['3E'], 0, 9999, 0),
  },
  // M (bilan parent) : réussites par monde maternelle { PS:{ok,total}, MS:..., GS:... }
  matStats: (raw.matStats && typeof raw.matStats === 'object') ? raw.matStats : {},
  // P9 : progression intra-année par classe (valeur 0..1 par niveau)
  yearProgress: (function(){ const o={}, src=(raw.yearProgress&&typeof raw.yearProgress==='object')?raw.yearProgress:{}; for(const k in src){ const v=+src[k]; if(isFinite(v)) o[k]=Math.max(0,Math.min(1,v)); } return o; })(),
  mapBossBeaten: _safeArr(raw.mapBossBeaten).filter(b => typeof b === 'string'),
  // v8.7.67 (O5) : chapitres narratifs déjà vus (extensible — un id par chapitre)
  storySeen: _safeArr(raw.storySeen).filter(s => typeof s === 'string'),
  // O3 — Position du mini-personnage sur la carte régionalisée
  mapAvatarZone: (typeof raw.mapAvatarZone==='string' && raw.mapAvatarZone) ? raw.mapAvatarZone : 'plaine',
  // v8.7.8 (O1) : progression dans chaque zone (sous-niveaux)
  zoneProgress: (function(){
   const src = (raw.zoneProgress && typeof raw.zoneProgress === 'object') ? raw.zoneProgress : {};
   const out = {};
   // Garder uniquement les zones connues, sanitiser les valeurs
   if(typeof MAP_ZONES !== 'undefined' && Array.isArray(MAP_ZONES)){
    MAP_ZONES.forEach(z=>{
     const s = src[z.id] || {};
     const max = (Array.isArray(z.steps) ? z.steps.length : 5);
     out[z.id] = {
      stepsCompleted: _clampNum(s.stepsCompleted, 0, max, 0),
      completed: !!s.completed
     };
    });
   }
   return out;
  })(),
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
  homework: (raw.homework && typeof raw.homework==='object') ? raw.homework : null,
  heroStageId: _safeStr(raw.heroStageId, 20, 'oeuf'),
  // Chantier Cloud Sync : préserver le code joueur et le statut d'activation
  cloudCode: _safeStr(raw.cloudCode, 40, null),
  cloudEnabled: _safeBool(raw.cloudEnabled, false),
 };
 // v8.7.33 : MIGRATION RÉTROACTIVE pour le bug critique de GS.isBoss.
 // Avant ce fix, mapBossBeaten n'était pas mis à jour quand un joueur battait le boss
 // d'une zone (parce que GS.isBoss était écrasé à false pendant le combat). Du coup
 // les zones étaient marquées "5/5 étapes franchies" dans zoneProgress, mais la zone
 // suivante restait verrouillée. On répare ici : pour chaque zone complétée à 100%
 // dans zoneProgress, on s'assure qu'elle figure aussi dans mapBossBeaten.
 try{
  if(out.zoneProgress && typeof out.zoneProgress === 'object'){
   const beatenSet = new Set(out.mapBossBeaten || []);
   Object.keys(out.zoneProgress).forEach(zid => {
    if(out.zoneProgress[zid] && out.zoneProgress[zid].completed === true){
     beatenSet.add(zid);
    }
   });
   out.mapBossBeaten = Array.from(beatenSet);
  }
 }catch(e){ console.warn('mapBossBeaten migration failed', e); }
 return out;
}

// ═══════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════
function defProfile(name){
 return{_v:SAVE_VERSION,name,stars:0,xp:0,skills:{shield:0,sword:0,clock:0},inventory:{potion:0,bomb:0},
  history:[],historyDetailed:[],errors:[],errorLog:[],badgesEarned:[],milestonesClaimed:[],_bestCombo:0,_totalStarsEarned:0,
  quests:null,questsDate:null,opStats:{'+':{ ok:0,fail:0},'-':{ok:0,fail:0},'x':{ok:0,fail:0},'/':{ ok:0,fail:0},'geo':{ok:0,fail:0}},
  levelWins:{CP:0,CE1:0,CE2:0,CM1:0,CM2:0},mapBossBeaten:[],mapAvatarZone:'plaine',
  // v8.7.8 (O1) : progression sous-niveaux par zone (5 étapes par zone)
  zoneProgress:(function(){const o={};if(typeof MAP_ZONES!=='undefined'&&Array.isArray(MAP_ZONES))MAP_ZONES.forEach(z=>{o[z.id]={stepsCompleted:0,completed:false};});return o;})(),
  prefs:{level:'CP',mode2:'normal',mode:'keyboard',theme:'standard'},
  sessionMinutes:0,weeklyChallenge:null,wcDate:null,
  objective:0,objectiveDone:0,objDate:null,
  avatar:'🧙',heroTitle:'novice',ownedSkins:[],equippedSkin:null,victorySound:'fanfare',ownedFigurines:[],
  opFilters:{add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true},
  heroStageId:'oeuf',
  cloudCode:null,cloudEnabled:false};
}
function loadProfile(){
 const sel=$('playerSelect').value;
 let name=sel==='Autre'?($('customInput').value.trim()||localStorage.getItem('customPlayerName')||'Joueur'):sel;
 if(typeof _diagLog==='function')_diagLog('LOAD-PROFILE: playerSelect='+sel+' nom='+name+' lastPlayer='+localStorage.getItem('lastPlayer'));
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem('user_'+name)||'null');}
 catch(e){
  console.warn('[profil] sauvegarde corrompue pour',name,'— restauration des valeurs par défaut');
  if(typeof toast==='function')toast('⚠️ Sauvegarde corrompue, profil réinitialisé.',4000);
 }
 if(saved){
  if(typeof _diagLog==='function')_diagLog('LOAD-PROFILE: profil trouvé '+name+' xp='+saved.xp+' cloudCode='+saved.cloudCode+' cloudEnabled='+saved.cloudEnabled);
  // 1. Migration : si format ancien, on le met à jour.
  saved = migrateProfile(saved);
  // 2. Validation : on garantit que toutes les valeurs sont bien typées et bornées.
  const validated = validateProfile(saved, name);
  if(validated){
   P = validated;
   if(typeof _diagLog==='function')_diagLog('LOAD-PROFILE: ✅ chargé après validation cloudCode='+P.cloudCode+' cloudEnabled='+P.cloudEnabled);
  }else{
   if(typeof _diagLog==='function')_diagLog('LOAD-PROFILE: ❌ validation échouée → profil défaut');
   P = defProfile(name);
  }
 }else{
  if(typeof _diagLog==='function')_diagLog('LOAD-PROFILE: aucun profil pour '+name+' → défaut');
  P=defProfile(name);
 }
 if(P.questsDate!==todayKey()){P.quests=genQuests();P.questsDate=todayKey();}
 if(P.wcDate!==weekKey()){
  const wc=WEEKLY_CH[ri(0,WEEKLY_CH.length-1)];
  P.weeklyChallenge={id:wc.id,label:wc.label,target:wc.target,reward:wc.reward,progress:0,done:false};
  P.wcDate=weekKey();
 }
 if(P.objDate!==todayKey()){P.objectiveDone=0;P.objDate=todayKey();}
 // v8.6.3 : mémoriser le joueur actif pour le restaurer au prochain démarrage
 // (essentiel pour la récupération cloud forcée qui recharge la page)
 try{ if(P && P.name) localStorage.setItem('lastPlayer', P.name); }catch(e){}
 applyPrefs();updateMenuUI();
 // Chantier Cloud Sync : génère le code (silencieux) + relance le timer + bandeau
 if(typeof ensureCloudCode==='function') ensureCloudCode(P);
 if(typeof saveProfile==='function') saveProfile();
 if(typeof cancelCloudSync==='function') cancelCloudSync();
 if(P.cloudEnabled && typeof scheduleCloudSync==='function') scheduleCloudSync();
 if(typeof showCloudOptInBannerIfRelevant==='function') setTimeout(showCloudOptInBannerIfRelevant, 200);
}
// saveProfile avec debounce : évite de sérialiser à chaque micro-action (quêtes, badges…)
// saveProfileNow() force la sauvegarde immédiate (fin de partie, achats)
let _saveTimer=null;
// v8.6.7 : verrou anti-sauvegarde. Quand true, AUCUNE sauvegarde locale
// n'est effectuée. Utilisé par forceRestoreFromCloud pour empêcher qu'un
// saveProfile() différé (debounce 800ms) n'écrase le profil cloud restauré
// juste avant le reload de la page.
let _saveLocked=false;
function lockProfileSaves(){
 _saveLocked=true;
 clearTimeout(_saveTimer);
 _saveTimer=null;
}
function saveProfile(){
 if(_saveLocked) return;
 clearTimeout(_saveTimer);
 _saveTimer=setTimeout(()=>{
  if(_saveLocked) return;
  try{localStorage.setItem('user_'+P.name,JSON.stringify(P));}
  catch(e){if(e.name==='QuotaExceededError'||e.code===22||e.code===1014)toast('⚠️ Stockage plein ! Progression non sauvegardée.',4000);}
 },800);
}
function saveProfileNow(){
 if(_saveLocked) return;
 clearTimeout(_saveTimer);
 try{localStorage.setItem('user_'+P.name,JSON.stringify(P));}
 catch(e){if(e.name==='QuotaExceededError'||e.code===22||e.code===1014)toast('⚠️ Stockage plein ! Progression non sauvegardée.',4000);}
}
function applyPrefs(){
 const p=P.prefs||{};
 const ls=$('levelSelect');
 const _opt=(l)=>{
  const ok=isUnlocked(l),pW=prevWins(l),req=UNLOCK_REQ[l];
  const lab=_groupIcon(l)+' '+_levelLabel(l);
  return `<option value="${l}"${!ok?' disabled':''}${l===(p.level||'CP')?' selected':''}>${ok?'':'🔒 '}${lab}${!ok?' ('+pW+'/'+req+' vic.)':''}</option>`;
 };
 ls.innerHTML = GROUP_ORDER.map(gk=>{
   const g=GROUP_META[gk];
   return `<optgroup label="${g.icon} ${g.name}">${g.levels.map(_opt).join('')}</optgroup>`;
 }).join('');
 $('modeSelect').value=p.mode||'keyboard';
 $('gameModeSelect').value=p.mode2||'normal';
 // v8.7.6 : priorité à la clé globale (dernier choix explicite du joueur),
 // puis prefs profil, puis défaut. Corrige la non-persistance du thème.
 let _theme='standard';
 try{
  const g=localStorage.getItem('odyssee_theme');
  _theme = g || p.theme || 'standard';
 }catch(e){ _theme = p.theme || 'standard'; }
 applyTheme(_theme);
 $('themeSelect').value=_theme;
 // Garder les prefs du profil cohérentes avec le thème effectif
 if(P && (!p.theme || p.theme!==_theme)){ P.prefs=P.prefs||{}; P.prefs.theme=_theme; }
 // Chantier B1 : appliquer le mode clair/sombre sauvegardé
 if(typeof initAppearance === 'function') initAppearance();
}
// Table de correspondance niveau→index (évite indexOf à chaque appel)
const LEVEL_IDX={PS:0,MS:1,GS:2,CP:3,CE1:4,CE2:5,CM1:6,CM2:7,'6E':8,'5E':9,'4E':10,'3E':11};
const VALID_LEVELS=['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6E','5E','4E','3E'];
// v9.0.8 / M-A : libellés affichés (la valeur interne reste la clé GEN)
const LEVEL_LABEL={PS:'Petite section',MS:'Moyenne section',GS:'Grande section',CP:'CP',CE1:'CE1',CE2:'CE2',CM1:'CM1',CM2:'CM2','6E':'6ᵉ','5E':'5ᵉ','4E':'4ᵉ','3E':'3ᵉ'};
const MATERNELLE_LEVELS=['PS','MS','GS'];
const PRIMARY_LEVELS=['CP','CE1','CE2','CM1','CM2'];
const COLLEGE_LEVELS=['6E','5E','4E','3E'];
// Identité visuelle distincte par cursus (Maternelle en tête)
const GROUP_META={
 maternelle:{ icon:'🐣', name:'Maternelle', levels:MATERNELLE_LEVELS },
 primaire:  { icon:'🎒', name:'Primaire',   levels:PRIMARY_LEVELS },
 college:   { icon:'🎓', name:'Collège',    levels:COLLEGE_LEVELS },
};
const GROUP_ORDER=['maternelle','primaire','college'];
function _groupKeyOf(lvl){
 if(MATERNELLE_LEVELS.indexOf(lvl)!==-1) return 'maternelle';
 if(COLLEGE_LEVELS.indexOf(lvl)!==-1) return 'college';
 return 'primaire';
}
function _groupIcon(lvl){ return GROUP_META[_groupKeyOf(lvl)].icon; }
function _levelLabel(lvl){ return (LEVEL_LABEL&&LEVEL_LABEL[lvl])?LEVEL_LABEL[lvl]:lvl; }
function savePrefs(){
 const lvl=$('levelSelect').value;
 // Chantier B1 fix : préserver appearance et tout autre champ existant
 const oldPrefs = P.prefs || {};
 P.prefs = {
  ...oldPrefs,
  level: VALID_LEVELS.includes(lvl) ? lvl : 'CP',
  mode: $('modeSelect').value,
  mode2: $('gameModeSelect').value,
  theme: $('themeSelect').value,
 };
 saveProfile();
}
function updateMenuUI(){
 // v8.7.2 : accès défensifs — certains éléments (menu-stars, xp-bar, music-viz,
 // hw-box…) ont été retirés de l'écran d'accueil lors de la refonte Étape A.
 // On garde les écritures pour les éléments encore présents ailleurs (boutique…).
 const _set=(id,val)=>{const el=$(id);if(el)el.innerText=val;};
 _set('menu-stars',P.stars||0);
 _set('menu-avatar',P.avatar||'🧙');
 _set('cnt-potion',P.inventory.potion||0);
 _set('cnt-bomb',P.inventory.bomb||0);
 const t=getTopTitle();_set('menu-htitle',t?t.label:'');
 updateXPBar();renderWC();
 // Rafraîchir les nouveaux écrans de la refonte s'ils sont présents
 if(typeof refreshMenu1Card==='function' && document.getElementById('menu1-name')) {
  try{
   const av=$('menu1-avatar'),nm=$('menu1-name'),sb=$('menu1-sub');
   if(av)av.textContent=P.avatar||'🧙';
   if(nm)nm.textContent=P.name||'Joueur';
   if(sb){const lvl=levelFromXP(P.xp||0);const tt=(t?t.label:'');sb.textContent='Niveau '+lvl+(tt?' · '+tt:'');}
  }catch(e){}
 }
 if(document.getElementById('m2-name')){
  try{
   const av=$('m2-avatar'),nm=$('m2-name'),lv=$('m2-lvl'),tt=$('m2-title'),st=$('m2-stars');
   if(av)av.textContent=P.avatar||'🧙';
   if(nm)nm.textContent=P.name||'Joueur';
   if(lv)lv.textContent='Niv.'+levelFromXP(P.xp||0);
   if(tt)tt.textContent=(t?t.label:'');
   if(st)st.textContent=P.stars||0;
  }catch(e){}
 }
 // Chantier C3 : afficher la carte devoir si présent (élément peut être absent)
 if(typeof renderHomework==='function') renderHomework();
}
function updateXPBar(){
 // v8.7.2 : la jauge XP a été retirée de l'accueil — accès défensifs.
 const xp=P.xp||0,lvl=levelFromXP(xp);
 const lb=$('lvl-badge');if(lb)lb.innerText='Niv.'+lvl;
 const bar=$('xp-bar'), lab=$('xp-label');
 if(!bar && !lab) return; // jauge absente : rien à faire
 let rem=xp;for(let i=0;i<lvl-1&&i<XP_TABLE.length;i++)rem-=XP_TABLE[i];
 const need=XP_TABLE[Math.min(lvl-1,XP_TABLE.length-1)]||1;
 const cur=Math.max(0,rem);
 const pct=Math.min(100,Math.round(cur/need*100));
 if(bar)bar.style.width=pct+'%';
 if(lab)lab.innerText=`XP Niv.${lvl} · ${cur}/${need}`;
}
function onPlayerChange(){
 const v=$('playerSelect').value;
 $('custom-zone').classList.toggle('hidden',v!=='Autre');
 if(v!=='Autre')loadProfile();
}
function applyCustom(){const n=$('customInput').value.trim();if(n)localStorage.setItem('customPlayerName',n);loadProfile();}
function isUnlocked(lvl){return UNLOCK_REQ[lvl]===0||prevWins(lvl)>=UNLOCK_REQ[lvl];}
// v9.0.8 : deux cursus de déblocage indépendants (Primaire / Collège).
// Le « niveau précédent » d'un niveau est celui qui le précède DANS SON propre groupe ;
// CP et 6ᵉ sont chacun en tête de leur cursus (aucun prérequis).
function _levelGroupArr(lvl){
 if(typeof MATERNELLE_LEVELS!=='undefined' && MATERNELLE_LEVELS.includes(lvl)) return MATERNELLE_LEVELS;
 if(typeof COLLEGE_LEVELS!=='undefined' && COLLEGE_LEVELS.includes(lvl)) return COLLEGE_LEVELS;
 return PRIMARY_LEVELS;
}
function prevWins(lvl){ const g=_levelGroupArr(lvl); const i=g.indexOf(lvl); return i<=0?0:(P.levelWins[g[i-1]]||0); }
function applyTheme(t){
 // v8.7.5 : ne plus écraser TOUTES les classes du body (préserver
 // no-parallax, mode clair/sombre, etc.). On retire seulement les
 // anciennes classes theme-* puis on applique la nouvelle.
 const b=document.body;
 [...b.classList].forEach(c=>{ if(c.indexOf('theme-')===0) b.classList.remove(c); });
 if(t && t!=='standard') b.classList.add('theme-'+t);
 if(musicOn){stopMusic();startMusic();}
}

// v8.7.6 : sauvegarde IMMÉDIATE du thème (sans debounce) + clé globale
// de secours. Corrige le bug "le thème ne persiste pas après rechargement
// ou retour Accueil" (le debounce de 800ms perdait le choix si on
// rechargeait/naviguait trop vite).
function saveThemeNow(themeVal){
 try{
  const t = themeVal || ($('themeSelect') ? $('themeSelect').value : 'standard');
  applyTheme(t);
  if($('themeSelect')) $('themeSelect').value = t;
  // 1) Clé globale (indépendante du profil, restaurée très tôt au boot)
  localStorage.setItem('odyssee_theme', t);
  // 2) Dans les prefs du profil courant
  if(typeof P !== 'undefined' && P){
   P.prefs = P.prefs || {};
   P.prefs.theme = t;
   if(typeof saveProfileNow === 'function') saveProfileNow();
   else if(typeof saveProfile === 'function') saveProfile();
  }
 }catch(e){}
}

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
