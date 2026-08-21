// 05-profile.js — L'Odyssée des Chiffres
'use strict';

// Gestion du profil joueur : chargement, sauvegarde, préférences, XP, niveaux.

// ═══════════════════════════════════════════════════════
// VERSIONING DE LA SAUVEGARDE
// ═══════════════════════════════════════════════════════
// Incrémenter SAVE_VERSION quand le format change. Ajouter une fonction de
// migration `migrate_v{N-1}_to_v{N}` qui transforme l'ancien format en nouveau.
const SAVE_VERSION = 8;

const _MIGRATIONS = {
 // De V5 vers V6 : ajout du champ opFilters et mapBossBeaten.
 // De V6 vers V7 : ajout du champ heroStageId (chantier B2).
 7: (raw) => { raw.heroStageId = raw.heroStageId || 'oeuf'; return raw; },
 // De V7 vers V8 (Lot 3, audit engagement, 13e conversation, pt.16) : les clés de
 // paliers déjà validées (`P.milestonesClaimed`) utilisaient l'INDEX du palier
 // dans le tableau (`id_0`, `id_1`...) — fragile dès qu'on insère un palier
 // intermédiaire (les index suivants se décaleraient et fausseraient les
 // récompenses déjà obtenues). On les convertit ici en clés basées sur le SEUIL
 // lui-même (`id_goal`), stables même si de nouveaux paliers sont insérés
 // n'importe où dans la liste. Mapping figé sur la structure MILESTONES telle
 // qu'elle existait AVANT ce lot (donc AVANT l'ajout des paliers intermédiaires).
 8: (raw) => {
  const OLD_GOALS = {
   veteran:['10','50','100','500'], collector:['10','25','50','100'],
   combo:['10','20','30','50'], mastermath:['100','500','1000','5000'],
   fortune:['100','500','1000','5000'], explorer:['1','3','5','10'],
  };
  if(Array.isArray(raw.milestonesClaimed)){
   raw.milestonesClaimed = raw.milestonesClaimed.map(k=>{
    const m=/^([a-z]+)_(\d+)$/.exec(k);
    if(!m) return k;
    const id=m[1], idx=+m[2];
    const goals=OLD_GOALS[id];
    if(!goals || idx>=goals.length) return k; // déjà au nouveau format ou id inconnu
    return `${id}_${goals[idx]}`;
   });
  }
  return raw;
 },
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
// v11.6.6 — Contrairement à _safeStr, on REJETTE entièrement (→ defaultV) une
// chaîne trop longue au lieu de la tronquer : tronquer un data URL base64 le
// rendrait corrompu (image cassée), ce qui serait pire que ne rien afficher.
function _safeDataUrl(v, maxLen, defaultV){
 if(typeof v !== 'string') return defaultV;
 if(v.length > maxLen) return defaultV;
 if(!/^data:image\/(jpeg|png|webp);base64,/.test(v)) return defaultV;
 return v;
}
// v11.6.6 — Code du profil : exactement 2 chiffres, ou rien.
function _safePlayerCode(v){
 return (typeof v === 'string' && /^[0-9]{2}$/.test(v)) ? v : null;
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
  opStatsFr: { ...def.opStatsFr, ...(raw.opStatsFr || {}) },
  opStatsHist: { ...def.opStatsHist, ...(raw.opStatsHist || {}) },
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
  // Victoires PAR MATIÈRE → déblocage indépendant des niveaux.
  // Migration : l'historique global est attribué aux maths ; le français (et les
  // autres matières) repartent à zéro, donc seuls PS/CP/6e y sont accessibles d'office.
  levelWinsBySubj: Object.assign(
    { math: Object.assign({}, raw.levelWins||{}), fr: {}, hist: {} },
    (raw.levelWinsBySubj && typeof raw.levelWinsBySubj==='object') ? raw.levelWinsBySubj : {}
  ),
  // M (bilan parent) : réussites par monde maternelle { PS:{ok,total}, MS:..., GS:... }
  matStats: (raw.matStats && typeof raw.matStats === 'object') ? raw.matStats : {},
  // P9.1 : stats par classe et par type d'exercice { CE2:{'+':{ok,fail},'frac':{ok,fail}}, ... }
  classStats: (raw.classStats && typeof raw.classStats === 'object') ? raw.classStats : {},
  // P9 : progression intra-année par classe (valeur 0..1 par niveau)
  yearProgress: (function(){ const o={}, src=(raw.yearProgress&&typeof raw.yearProgress==='object')?raw.yearProgress:{}; for(const k in src){ const v=+src[k]; if(isFinite(v)) o[k]=Math.max(0,Math.min(1,v)); } return o; })(),
  mapBossBeaten: _safeArr(raw.mapBossBeaten).filter(b => typeof b === 'string'),
  // v8.7.67 (O5) : chapitres narratifs déjà vus (extensible — un id par chapitre)
  storySeen: _safeArr(raw.storySeen).filter(s => typeof s === 'string'),
  // O3 — Position du mini-personnage sur la carte régionalisée
  mapAvatarZone: (typeof raw.mapAvatarZone==='string' && raw.mapAvatarZone) ? raw.mapAvatarZone : 'plaine',
  // Position de l'avatar mémorisée séparément par aventure/matière.
  mapAvatarZoneByAdv: (function(){
   const src = (raw.mapAvatarZoneByAdv && typeof raw.mapAvatarZoneByAdv === 'object') ? raw.mapAvatarZoneByAdv : {};
   const out = {};
   Object.keys(src).forEach(k=>{ if(typeof src[k]==='string' && src[k]) out[k] = src[k]; });
   return out;
  })(),
  // v12.4.49 (Lot 3, audit immersion narrative N4) : carnet de voyage à la
  // première personne, par Odyssée. Chaque entrée est un petit objet validé
  // champ par champ (jamais une simple copie), plafonné aux 20 dernières
  // par Odyssée (même plafond qu'à l'écriture, 07-game.js).
  journalEntriesByAdv: (function(){
   const src = (raw.journalEntriesByAdv && typeof raw.journalEntriesByAdv === 'object') ? raw.journalEntriesByAdv : {};
   const out = {};
   Object.keys(src).forEach(k=>{
    const arr = Array.isArray(src[k]) ? src[k] : [];
    out[k] = arr.filter(e => e && typeof e === 'object' && typeof e.text === 'string').map(e => ({
     text: _safeStr(e.text, 300, ''),
     flawless: !!e.flawless,
     bossName: _safeStr(e.bossName, 60, ''),
     zoneLabel: _safeStr(e.zoneLabel, 60, ''),
    })).slice(-20);
   });
   return out;
  })(),
  // narratif tiré, par Odyssée — texte déjà substitué ({villain} etc.),
  // affiché comme "à suivre..." dans le Carnet. Objet { advKey: texte }.
  lastTwistLineByAdv: (function(){
   const src = (raw.lastTwistLineByAdv && typeof raw.lastTwistLineByAdv === 'object') ? raw.lastTwistLineByAdv : {};
   const out = {};
   Object.keys(src).forEach(k=>{ if(typeof src[k]==='string' && src[k]) out[k] = _safeStr(src[k], 400, ''); });
   return out;
  })(),
  // Correctif adjacent (découvert en implémentant N7, même défaut qu'ADR-80) :
  // twistLinesUsedByAdv (tirage sans remise des rebondissements par Odyssée,
  // v12.1.8) n'a jamais été ajouté à cette liste blanche — effacé
  // silencieusement à chaque rechargement de profil, ce qui autorisait des
  // répétitions dans une même Odyssée malgré le mécanisme prévu pour les
  // éviter. Objet { advKey: [indices déjà tirés] }.
  twistLinesUsedByAdv: (function(){
   const src = (raw.twistLinesUsedByAdv && typeof raw.twistLinesUsedByAdv === 'object') ? raw.twistLinesUsedByAdv : {};
   const out = {};
   Object.keys(src).forEach(k=>{ out[k] = _safeArr(src[k]).filter(i => Number.isInteger(i) && i>=0 && i<100); });
   return out;
  })(),
  // v8.7.8 (O1) : progression dans chaque zone (sous-niveaux)
  zoneProgress: (function(){
   const src = (raw.zoneProgress && typeof raw.zoneProgress === 'object') ? raw.zoneProgress : {};
   const out = {};
   // Plafond d'étapes par zone connue (zones de la matière courante uniquement)
   const maxById = {};
   if(typeof MAP_ZONES !== 'undefined' && Array.isArray(MAP_ZONES)){
    MAP_ZONES.forEach(z=>{ maxById[z.id] = (Array.isArray(z.steps) ? z.steps.length : 5); });
   }
   // Conserver TOUTES les zones déjà enregistrées, y compris celles des autres
   // matières (absentes du MAP_ZONES courant) : sinon leur progression est effacée
   // au changement de matière. On sanitise, sans plafonner les zones inconnues.
   Object.keys(src).forEach(zid=>{
    const s = src[zid] || {};
    const max = (typeof maxById[zid] === 'number') ? maxById[zid] : 999;
    out[zid] = {
     stepsCompleted: _clampNum(s.stepsCompleted, 0, max, 0),
     completed: !!s.completed
    };
   });
   // Garantir une entrée par défaut pour les zones de la matière courante.
   if(typeof MAP_ZONES !== 'undefined' && Array.isArray(MAP_ZONES)){
    MAP_ZONES.forEach(z=>{ if(!out[z.id]) out[z.id] = { stepsCompleted:0, completed:false }; });
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
  // v11.7.3 (audit n°9) : genre explicite optionnel ('m'/'f'), sinon null (→ heuristique)
  gender: (raw.gender==='m'||raw.gender==='f') ? raw.gender : null,
  avatar: _safeStr(raw.avatar, 8, '🧙'),
  heroTitle: _safeStr(raw.heroTitle, 30, 'novice'),
  ownedSkins: _safeArr(raw.ownedSkins).filter(s => typeof s === 'string'),
  ownedMusics: (function(){var a=_safeArr(raw.ownedMusics).filter(s=>typeof s==='string');return a.includes('theme')?a:['theme'].concat(a);})(),
  music: (typeof raw.music==='string'?raw.music:'theme'),
  ownedSounds: _safeArr(raw.ownedSounds).filter(s => typeof s === 'string'),
  errorsFr: _safeArr(raw.errorsFr).filter(e => e && typeof e === 'object'),
  errorsHist: _safeArr(raw.errorsHist).filter(e => e && typeof e === 'object'),
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
  // v11.5.2 — filtres par catégorie pour l'histoire (miroir de opFilters).
  histCatFilters: {
   frise:        _safeBool(raw.histCatFilters?.frise,        true),
   personnages:  _safeBool(raw.histCatFilters?.personnages,  true),
   evenements:   _safeBool(raw.histCatFilters?.evenements,   true),
   civilisation: _safeBool(raw.histCatFilters?.civilisation, true),
   temps:        _safeBool(raw.histCatFilters?.temps,        true),
   repere:       _safeBool(raw.histCatFilters?.repere,       true),
  },
  // v11.5.3 — filtres par catégorie pour le français (miroir de histCatFilters).
  frCatFilters: {
   conj:  _safeBool(raw.frCatFilters?.conj,  true),
   orth:  _safeBool(raw.frCatFilters?.orth,  true),
   gram:  _safeBool(raw.frCatFilters?.gram,  true),
   vocab: _safeBool(raw.frCatFilters?.vocab, true),
  },
  homework: (raw.homework && typeof raw.homework==='object') ? raw.homework : null,
  heroStageId: _safeStr(raw.heroStageId, 20, 'oeuf'),
  // Chantier Cloud Sync : préserver le code joueur et le statut d'activation
  cloudCode: _safeStr(raw.cloudCode, 40, null),
  cloudEnabled: _safeBool(raw.cloudEnabled, false),
  // v11.6.2 — marqueur "visite du compte déjà vue" (système d'onboarding,
  // 19-onboarding.js). Sans cette ligne, le champ n'étant pas dans cette
  // liste blanche, il était silencieusement effacé à CHAQUE rechargement
  // du profil (retour à l'accueil, changement de joueur, etc.), ce qui
  // relançait la visite guidée en boucle malgré ob3MarkCompleted().
  onbAccountSeen: _safeBool(raw.onbAccountSeen, false),
  // v12.4.38 — même marqueur pour la visite de la carte (Système 4,
  // 19-onboarding.js, #U3) : oublié de cette liste blanche à sa création
  // (v12.4.34), reproduisant exactement le bug documenté juste au-dessus
  // pour onbAccountSeen — la visite se relançait à chaque connexion malgré
  // ob4MarkCompleted(). Toujours ajouter tout nouveau marqueur ici.
  onbMapSeen: _safeBool(raw.onbMapSeen, false),
  // v12.4.50 (Lot 4, audit immersion narrative N8) : trait de héros choisi
  // au premier lancement — valeur fermée (jamais une chaîne libre).
  heroTrait: (raw.heroTrait === 'brave' || raw.heroTrait === 'malin') ? raw.heroTrait : null,
  // v12.4.51 (suite immersion narrative, point 4) : le Talisman ne s'anime
  // qu'une seule fois — flag one-shot.
  talismanRevealShown: _safeBool(raw.talismanRevealShown, false),
  // v12.4.53 (audit Cohérence Globale, C2) : extension aux 6 autres
  // Odyssées, même principe de flag one-shot.
  rainbowRevealShown: _safeBool(raw.rainbowRevealShown, false),
  bookRevealShown: _safeBool(raw.bookRevealShown, false),
  badgeRevealShown: _safeBool(raw.badgeRevealShown, false),
  armorRevealShown: _safeBool(raw.armorRevealShown, false),
  libraryRevealShown: _safeBool(raw.libraryRevealShown, false),
  histLibraryRevealShown: _safeBool(raw.histLibraryRevealShown, false),
  // v12.4.55 (ADR-97, Option B) : horodatage du dernier reset d'Odyssée,
  // lu par _mergeCloudProfiles (12-cloud.js). Borné à "maintenant + 1 jour"
  // pour tolérer un léger décalage d'horloge entre appareils sans accepter
  // une valeur aberrante.
  adventureResetAt: _clampNum(raw.adventureResetAt, 0, Date.now() + 86400000, 0),
  // v11.6.6 — photo de profil (facultative, recadrée/compressée côté appareil
  // avant stockage, 200 Ko max) et code du profil (2 chiffres, facultatif).
  photo: _safeDataUrl(raw.photo, 200000, null),
  playerCode: _safePlayerCode(raw.playerCode),
  // v11.6.5 — épilogues déjà crédités du bonus de fin de scénario (+200⭐),
  // pour ne jamais le recréditer deux fois (voir migration rétroactive
  // juste après, et le crédit "à chaud" dans _maybeShowStory, 07-story.js).
  _epilogueBonusCredited: _safeArr(raw._epilogueBonusCredited).filter(s => typeof s === 'string'),
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
 // v11.6.5 : MIGRATION RÉTROACTIVE — bonus de +200⭐ pour Odyssée(s) déjà
 // terminée(s) AVANT l'introduction de ce bonus. Pour chaque épilogue déjà
 // présent dans storySeen mais pas encore dans _epilogueBonusCredited, on
 // crédite 200⭐ une seule fois, puis on marque l'épilogue comme "déjà
 // crédité" pour ne plus jamais le recréditer aux chargements suivants.
 try{
  const ALL_EPILOGUE_IDS = ['epilogue','mat_epilogue','matfr_epilogue','primfr_epilogue','primhist_epilogue','col_epilogue','colfr_epilogue'];
  const credited = new Set(out._epilogueBonusCredited || []);
  let _toCredit = 0;
  ALL_EPILOGUE_IDS.forEach(eid => {
   if(out.storySeen.includes(eid) && !credited.has(eid)){
    credited.add(eid);
    _toCredit += 200;
   }
  });
  if(_toCredit > 0){
   out.stars = (out.stars || 0) + _toCredit;
   out._epilogueBonusCredited = Array.from(credited);
  }
 }catch(e){ console.warn('epilogue bonus migration failed', e); }
 return out;
}

// ═══════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════
function defProfile(name){
 return{_v:SAVE_VERSION,name,stars:0,xp:0,skills:{shield:0,sword:0,clock:0},inventory:{potion:0,bomb:0},
  history:[],historyDetailed:[],errors:[],errorLog:[],badgesEarned:[],milestonesClaimed:[],_bestCombo:0,_totalStarsEarned:0,
  quests:null,questsDate:null,opStats:{'+':{ ok:0,fail:0},'-':{ok:0,fail:0},'x':{ok:0,fail:0},'/':{ ok:0,fail:0},'geo':{ok:0,fail:0}},
  opStatsFr:{'conj':{ok:0,fail:0},'orth':{ok:0,fail:0},'gram':{ok:0,fail:0},'vocab':{ok:0,fail:0}},
  opStatsHist:{'frise':{ok:0,fail:0},'personnages':{ok:0,fail:0},'evenements':{ok:0,fail:0},'civilisation':{ok:0,fail:0},'temps':{ok:0,fail:0},'repere':{ok:0,fail:0}},
  levelWins:{CP:0,CE1:0,CE2:0,CM1:0,CM2:0},levelWinsBySubj:{math:{},fr:{},hist:{}},mapBossBeaten:[],mapAvatarZone:'plaine',mapAvatarZoneByAdv:{},
  // v8.7.8 (O1) : progression sous-niveaux par zone (5 étapes par zone)
  zoneProgress:(function(){const o={};if(typeof MAP_ZONES!=='undefined'&&Array.isArray(MAP_ZONES))MAP_ZONES.forEach(z=>{o[z.id]={stepsCompleted:0,completed:false};});return o;})(),
  prefs:{level:'CP',mode2:'normal',mode:'keyboard',theme:'standard'},
  sessionMinutes:0,weeklyChallenge:null,wcDate:null,
  objective:0,objectiveDone:0,objDate:null,
  avatar:'🧙',heroTitle:'novice',ownedSkins:[],equippedSkin:null,victorySound:'fanfare',ownedMusics:['theme'],music:'theme',ownedSounds:[],errorsFr:[],errorsHist:[],ownedFigurines:[],
  opFilters:{add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true},
  histCatFilters:{frise:true,personnages:true,evenements:true,civilisation:true,temps:true,repere:true},
  frCatFilters:{conj:true,orth:true,gram:true,vocab:true},
  heroStageId:'oeuf',
  cloudCode:null,cloudEnabled:false,onbAccountSeen:false,onbMapSeen:false,_epilogueBonusCredited:[],photo:null,playerCode:null,
  // v11.7.3 (audit n°9) : genre explicite optionnel, réglable par le parent —
  // prioritaire sur l'heuristique orthographique de heroGender() dans 02-data.js.
  gender:null};
}
function fillPlayerSelect(){
 const sel=$('playerSelect'); if(!sel) return;
 const cur=sel.value;
 const roster=(typeof getRoster==='function')?getRoster():[];
 const _e=(typeof esc==='function')?esc:(s=>String(s));
 let html=roster.map(n=>`<option value="${_e(n)}">${_e(n)}</option>`).join('');
 html+='<option value="Autre">✏️ Autre joueur…</option>';
 sel.innerHTML=html;
 if(cur && Array.from(sel.options).some(o=>o.value===cur)) sel.value=cur;
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
  // 1bis. Purge définitive des erreurs NON rejouables du journal espacé
  // (questions-texte mal reconstruites, ex. « Combien de dizaines… »). On ne garde
  // que les QCM (instantané) et les calculs purement numériques.
  if(saved && Array.isArray(saved.errorLog)){
   saved.errorLog = saved.errorLog.filter(e=> e && (
     (e.payload && Array.isArray(e.payload.choices) && e.payload.choices.length) ||
     /^[\d().,+\-x×\/÷\s]+=\d+$/.test(String(e.q||''))
   ));
  }
  // 2. Validation : on garantit que toutes les valeurs sont bien typées et bornées.
  const validated = validateProfile(saved, name);
  if(validated){
   P = validated;
   // v12.4.42 (audit performances, P3) : purge silencieuse des entrées de
   // zoneProgress/mapAvatarZoneByAdv qui ne correspondent plus à AUCUNE zone
   // existante dans AUCUNE des 7 Odyssées — évite une croissance non bornée
   // du profil au fil des années à mesure que du contenu est ajouté/retiré.
   // Prudence : n'agit QUE si tous les tableaux de zones des 7 Odyssées sont
   // bien chargés (sinon on risquerait de supprimer des entrées valides d'une
   // Odyssée pas encore définie à ce stade) — ne supprime jamais en cas de doute.
   try{
    const allArrays = [MAT_ZONES, PRIM_ZONES, COL_ZONES, MAT_ZONES_FR, PRIM_ZONES_FR, PRIM_ZONES_HIST, COL_ZONES_FR];
    if(allArrays.every(a => Array.isArray(a) && a.length > 0)){
     const validIds = new Set();
     allArrays.forEach(arr => arr.forEach(z => { if(z && z.id) validIds.add(z.id); }));
     if(P.zoneProgress && typeof P.zoneProgress === 'object'){
      Object.keys(P.zoneProgress).forEach(id => { if(!validIds.has(id)) delete P.zoneProgress[id]; });
     }
     if(P.mapAvatarZoneByAdv && typeof P.mapAvatarZoneByAdv === 'object'){
      Object.keys(P.mapAvatarZoneByAdv).forEach(adv => {
       if(P.mapAvatarZoneByAdv[adv] && !validIds.has(P.mapAvatarZoneByAdv[adv])) delete P.mapAvatarZoneByAdv[adv];
      });
     }
    }
   }catch(e){} // silencieux : en cas de doute, on ne touche à rien
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
 // Lot 4 (audit engagement, 13e conversation, pt.18) : série de jours consécutifs,
 // affichée avec bienveillance (cf. affichage dashboard, 08-ui.js). Aucune perte
 // d'acquis en cas de rupture — on repart simplement à 1, sans pénalité ni
 // message culpabilisant, conformément à l'esprit du lot (pt.19).
 {
  const _today=todayKey();
  if(P.streakLastDate!==_today){
   const _yesterday=(typeof _dayKeyOffset==='function')?_dayKeyOffset(-1):null;
   P.streak=(P.streakLastDate===_yesterday)?(P.streak||0)+1:1;
   P.streakLastDate=_today;
  }
 }
 if(P.wcDate!==weekKey()){
  // Lot 3 (audit engagement, 13e conversation, pt.22) : quand une opération faible
  // est identifiable (mêmes seuils qu'analyzeOpProfile), le défi hebdo ciblant
  // cette opération est favorisé (70% du temps) plutôt qu'un tirage purement
  // aléatoire. Reste aléatoire si aucune correspondance ou données insuffisantes.
  let wc;
  try{
   const _prof=(typeof analyzeOpProfile==='function')?analyzeOpProfile():null;
   const _match=(_prof && _prof.weakest) ? WEEKLY_CH.filter(c=>c.weakOpKey===_prof.weakest) : [];
   wc=(_match.length && Math.random()<0.7) ? _match[ri(0,_match.length-1)] : WEEKLY_CH[ri(0,WEEKLY_CH.length-1)];
  }catch(e){ wc=WEEKLY_CH[ri(0,WEEKLY_CH.length-1)]; }
  P.weeklyChallenge={id:wc.id,label:wc.label,target:wc.target,reward:wc.reward,progress:0,done:false};
  P.wcDate=weekKey();
 }
 if(P.objDate!==todayKey()){P.objectiveDone=0;P.objDate=todayKey();}
 // v8.6.3 : mémoriser le joueur actif pour le restaurer au prochain démarrage
 // (essentiel pour la récupération cloud forcée qui recharge la page)
 try{ if(P && P.name) localStorage.setItem('lastPlayer', P.name); }catch(e){ console.warn('[profil] échec écriture lastPlayer — le prochain démarrage pourrait ouvrir le mauvais profil', e); }
 applyPrefs();updateMenuUI();
 // Chantier Cloud Sync : génère le code (silencieux) + relance le timer + bandeau
 if(typeof ensureCloudCode==='function') ensureCloudCode(P);
 if(typeof saveProfile==='function') saveProfile();
 if(typeof cancelCloudSync==='function') cancelCloudSync();
 if(P.cloudEnabled && typeof scheduleCloudSync==='function') scheduleCloudSync();
 if(typeof refreshCloudIndicator==='function') setTimeout(refreshCloudIndicator, 200);
 // v11.7.44 : le déclenchement du Système 3 (visite du compte) a déménagé
 // dans gotoSubjects() (01-core.js) — se lancer ICI, à CHAQUE chargement de
 // l'app (même sans profil réel créé), provoquait le bug signalé par Cyril.
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
 // v11.7.28 (Audit DA #7/#8, Lot 7) : reflète le dernier cycle connu du profil
 // dès l'affichage des menus, avant même une éventuelle re-confirmation via savePrefs().
 document.documentElement.setAttribute('data-cycle', _groupKeyOf(p.level||'CP'));
 $('modeSelect').value=p.mode||'keyboard';
 $('gameModeSelect').value=p.mode2||'normal';
 // v8.7.6 : la clé globale sert de repli tôt au boot (avant que le profil ne soit
 // chargé, cf. 11-init.js) et pour un profil qui n'a jamais choisi de thème.
 // Audit fonctionnel (#13) : donner ici la priorité à la clé globale au lieu du
 // thème PROPRE au profil créait une fuite entre profils frère/sœur sur le même
 // appareil — le dernier thème choisi par l'un écrasait silencieusement (et de
 // façon persistante, via la ligne juste en dessous) la préférence de l'autre.
 // Une fois le profil réellement chargé (ici), on fait confiance à p.theme s'il
 // existe déjà ; la clé globale ne sert plus que de valeur par défaut initiale.
 let _theme='standard';
 try{
  const g=localStorage.getItem('odyssee_theme');
  _theme = (p.theme!=null) ? p.theme : (g || 'standard');
 }catch(e){ _theme = p.theme || 'standard'; }
 applyTheme(_theme);
 $('themeSelect').value=_theme;
 // Garder les prefs du profil cohérentes avec le thème effectif
 if(P && (!p.theme || p.theme!==_theme)){ P.prefs=P.prefs||{}; P.prefs.theme=_theme; }
 // Chantier B1 : appliquer le mode clair/sombre sauvegardé
 if(typeof initAppearance === 'function') initAppearance();
 // Audit UX : appliquer la taille de texte sauvegardée
 if(typeof initFontScale === 'function') initFontScale();
 // Audit accessibilité : appliquer le temps par question sauvegardé
 if(typeof initTimerScale === 'function') initTimerScale();
}
// Table de correspondance niveau→index (évite indexOf à chaque appel)
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
 // v11.7.28 (Audit DA #7/#8, Lot 7) : cycle mis à jour dès que le niveau est reconfirmé
 document.documentElement.setAttribute('data-cycle', _groupKeyOf(P.prefs.level));
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
   if(typeof _setAvatarEl==='function') _setAvatarEl(av,P,52); else if(av)av.textContent=P.avatar||'🧙';
   if(nm)nm.textContent=P.name||'Joueur';
   if(sb){const lvl=levelFromXP(P.xp||0);const tt=(t?t.label:'');sb.textContent='Niveau '+lvl+(tt?' · '+tt:'');}
  }catch(e){}
 }
 if(document.getElementById('m2-name')){
  try{
   const av=$('m2-avatar'),nm=$('m2-name'),lv=$('m2-lvl'),tt=$('m2-title'),st=$('m2-stars');
   if(typeof _setAvatarEl==='function') _setAvatarEl(av,P,46); else if(av)av.textContent=P.avatar||'🧙';
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
function isUnlocked(lvl,subj){return UNLOCK_REQ[lvl]===0||prevWins(lvl,subj)>=UNLOCK_REQ[lvl];}
// v9.0.8 : deux cursus de déblocage indépendants (Primaire / Collège).
// Le « niveau précédent » d'un niveau est celui qui le précède DANS SON propre groupe ;
// CP et 6ᵉ sont chacun en tête de leur cursus (aucun prérequis).
function _levelGroupArr(lvl){
 if(typeof MATERNELLE_LEVELS!=='undefined' && MATERNELLE_LEVELS.includes(lvl)) return MATERNELLE_LEVELS;
 if(typeof COLLEGE_LEVELS!=='undefined' && COLLEGE_LEVELS.includes(lvl)) return COLLEGE_LEVELS;
 return PRIMARY_LEVELS;
}
// Victoires du niveau pour la MATIÈRE en cours (déblocage indépendant par matière).
// Hors contexte de matière (profil, héros…), on retombe sur les maths.
// v11.1.1 : accepte un paramètre subj explicite (sélecteur dashboard), sinon GM.subject.
function _subjWinsKey(subj){ return subj || (typeof GM!=='undefined' && GM.subject) || 'math'; }
function _subjWins(lvl,subj){
 const byS = P && P.levelWinsBySubj;
 const m = byS && byS[_subjWinsKey(subj)];
 if(m) return m[lvl]||0;
 return (P && P.levelWins && P.levelWins[lvl]) || 0;
}
function prevWins(lvl,subj){ const g=_levelGroupArr(lvl); const i=g.indexOf(lvl); return i<=0?0:_subjWins(g[i-1],subj); }
function applyTheme(t){
 // v8.7.5 : ne plus écraser TOUTES les classes du body (préserver
 // no-parallax, mode clair/sombre, etc.). On retire seulement les
 // anciennes classes theme-* puis on applique la nouvelle.
 const b=document.body;
 [...b.classList].forEach(c=>{ if(c.indexOf('theme-')===0) b.classList.remove(c); });
 if(t && t!=='standard') b.classList.add('theme-'+t);
 // v11.1.8 : le changement de thème (visuel, appelé à chaque navigation/zone/étape)
 // ne doit plus jamais couper/relancer la musique. La musique ne doit être
 // affectée que par un choix explicite (selectMusic) ou une (dés)activation
 // volontaire (toggleMusic) — jamais par le simple fait de naviguer dans le jeu.
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
 P.xp=(P.xp||0)+xpGain;
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

// ═══════════════════════════════════════════════════════
// VÉRIFICATION D'IDENTITÉ (v11.6.7 : déclenchée par gotoSubjects(), au clic
// sur CONTINUER — PAS au simple chargement de la page/du profil, pour ne
// pas apparaître avant même d'avoir choisi qui va jouer).
// Par profil : soit une simple confirmation par défaut ("C'est bien toi ?"),
// soit un code à 2 chiffres si le parent l'a activé POUR CE PROFIL — jamais
// les deux à la fois (voir P.playerCode, réglé dans Vue Parent → Comptes).
// Ne s'affiche jamais à la toute première connexion d'un profil : à ce
// moment précis le parent est juste à côté en train de le configurer.
// ═══════════════════════════════════════════════════════
let _pcPendingSuccess = null;
function _pcMaybeShow(onSuccess){
 const go = (typeof onSuccess==='function') ? onSuccess : function(){};
 if(typeof P==='undefined' || !P || !P.name){ go(); return; }
 if(!P.onbAccountSeen){ go(); return; } // toute première connexion → pas de vérification
 _pcPendingSuccess = go;
 if(P.playerCode) _pcShowPin(); else _pcShowConfirm();
}
function _pcEl(){
 let ov = document.getElementById('pc-overlay');
 if(!ov){
  ov = document.createElement('div');
  ov.id = 'pc-overlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px;';
  document.body.appendChild(ov);
 }
 return ov;
}
function _pcClose(){
 const ov = document.getElementById('pc-overlay');
 if(ov){ if(ov._releaseTrap){ov._releaseTrap();delete ov._releaseTrap;} ov.remove(); }
}
function _pcShowConfirm(){
 const ov = _pcEl();
 const _e = (typeof esc==='function') ? esc : (s=>String(s));
 const av = P.photo
  ? '<img src="'+P.photo+'" alt="" style="width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #f1c40f;margin:0 auto 12px;display:block;">'
  : '<div style="font-size:4em;margin-bottom:8px;">'+(P.avatar||'🙂')+'</div>';
 ov.innerHTML = '<div style="background:linear-gradient(135deg,rgba(241,196,15,.10),rgba(241,196,15,.02));border:1px solid rgba(241,196,15,.3);border-radius:18px;padding:26px 20px;text-align:center;max-width:340px;width:100%;">'
  + av
  + '<div style="font-size:1.3em;font-weight:800;color:#f1c40f;">'+_e(P.name)+'</div>'
  + '<div style="font-size:1em;color:#dce3f0;margin:6px 0 20px;">C\'est bien toi qui vas jouer ?</div>'
  + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">'
  +  '<button onclick="_pcConfirmYes()" style="background:#27ae60;color:#fff;border:none;border-radius:10px;padding:12px 20px;font-weight:700;">✅ Oui, c\'est moi</button>'
  +  '<button onclick="_pcConfirmNo()" style="background:#555;color:#fff;border:none;border-radius:10px;padding:12px 20px;font-weight:700;">↩️ Non, changer</button>'
  + '</div></div>';
 if(typeof trapFocus==='function') ov._releaseTrap=trapFocus(ov);
}
function _pcConfirmYes(){
 _pcClose();
 const cb=_pcPendingSuccess; _pcPendingSuccess=null;
 if(typeof cb==='function') cb();
}
function _pcConfirmNo(){
 _pcClose();
 _pcPendingSuccess=null;
 const sel=$('playerSelect');
 if(sel){ try{ sel.scrollIntoView({block:'center'}); sel.focus(); }catch(e){} }
 if(typeof toast==='function') toast('👆 Choisis ton profil dans la liste',2500);
}
function _pcShowPin(){
 const ov = _pcEl();
 const _e = (typeof esc==='function') ? esc : (s=>String(s));
 ov.innerHTML = '<div style="background:linear-gradient(135deg,rgba(241,196,15,.10),rgba(241,196,15,.02));border:1px solid rgba(241,196,15,.3);border-radius:18px;padding:26px 20px;text-align:center;max-width:340px;width:100%;">'
  + '<div style="font-size:3.2em;margin-bottom:6px;">'+(P.avatar||'🙂')+'</div>'
  + '<div style="font-size:1.3em;font-weight:800;color:#f1c40f;">'+_e(P.name)+'</div>'
  + '<div style="font-size:1em;color:#dce3f0;margin:6px 0 14px;">Entre ton code à 2 chiffres</div>'
  + '<input type="password" id="pc-pin-input" maxlength="2" inputmode="numeric" style="width:90px;text-align:center;font-family:monospace;font-size:1.6em;letter-spacing:8px;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.3);color:#fff;" onkeydown="if(event.key===\'Enter\')_pcCheckPin()">'
  + '<div style="margin-top:16px;"><button onclick="_pcCheckPin()" style="background:#27ae60;color:#fff;border:none;border-radius:10px;padding:12px 20px;font-weight:700;">Valider</button></div>'
  + '<div id="pc-pin-msg" style="font-size:.8em;color:#e74c3c;margin-top:10px;min-height:1em;"></div>'
  + '<button onclick="_pcConfirmNo()" style="background:none;border:none;color:#bdc3c7;font-size:.8em;margin-top:14px;text-decoration:underline;cursor:pointer;">Ce n\'est pas moi</button>'
  + '</div>';
 setTimeout(()=>{ const inp=$('pc-pin-input'); if(inp) inp.focus(); }, 50);
 if(typeof trapFocus==='function') ov._releaseTrap=trapFocus(ov);
}
function _pcCheckPin(){
 const inp=$('pc-pin-input'), msg=$('pc-pin-msg');
 const v=(inp&&inp.value||'').trim();
 if(v && P && v===P.playerCode){
  _pcClose();
  const cb=_pcPendingSuccess; _pcPendingSuccess=null;
  if(typeof cb==='function') cb();
 }
 else{
  if(msg) msg.textContent='Code incorrect.';
  if(inp){ inp.value=''; inp.focus(); }
  if(typeof beep==='function') beep(200,'sawtooth',.3);
 }
}
