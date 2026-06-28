// 07-game.js — L'Odyssée des Chiffres
'use strict';

// Flux principal du jeu : musique, particules, boutique, quêtes, badges,
// combat, pouvoirs, timers, transitions, événements aléatoires, tour de jeu,
// validation, fin de partie, carte d'exploration.

// ═══════════════════════════════════════════════════════
// CARTE D'EXPLORATION + PARALLAXE (chantier B3)
// ═══════════════════════════════════════════════════════
function openMap(){
 if(typeof navTo==='function') navTo('v-map'); else showView('v-map');
 _mapAutoFocus = true;  // v8.7.57 (O3-C.6) : cadrage caméra sur la région active à l'ouverture
 renderMap();
 // Chantier B3 : démarrer la parallaxe une fois le DOM stabilisé
 setTimeout(()=>{
  if(typeof initMapParallax==='function') initMapParallax();
 }, 50);
 // v8.7.67 (O5) : déclencher la narration (prologue, ou chapitre de la région active)
 setTimeout(()=>{ if(typeof _maybeShowStory==='function') _maybeShowStory(); }, 500);
}

/**
 * Chantier B3 : ferme proprement la carte (cleanup parallaxe + retour menu).
 * Remplace l'ancien onclick="showView('v-menu')" du bouton retour.
 */
function closeMap(){
 if(typeof teardownMapParallax==='function') teardownMapParallax();
 if(typeof navBack==='function') navBack(); else showView('v-menu');
}

// ═══════════════════════════════════════════════════════
// v10.1.0 — Trois aventures : permutation des globals actifs
// (zones, régions, histoire, antagoniste, royaume) puis ouverture
// de la carte. Le primaire est l'aventure par défaut.
// ═══════════════════════════════════════════════════════
function startAdventure(advId){
 // Variante française de la maternelle : « L'Odyssée des mots » (Le Grand Livre du
 // Conteur). Déclenchée si la matière active est le français, ou au retour via 'matfr'.
 const _wantFr = (advId==='matfr') || (advId==='mat' && typeof GM!=='undefined' && GM.subject==='fr');
 if(advId==='matfr') advId='mat';
 GM.adventure = advId;
 if(advId==='mat'){
  if(_wantFr){
   if(typeof GM!=='undefined' && GM.subject!=='fr') GM.subject='fr';
   MAP_ZONES=MAT_ZONES_FR; _ARCH_REGIONS=_MAT_REGIONS_FR; _STORY=_MAT_STORY_FR;
   STORY_VILLAIN=_MAT_VILLAIN_FR; STORY_KINGDOM=_MAT_KINGDOM_FR;
   GM.adventure='matfr';
  } else {
   MAP_ZONES=MAT_ZONES; _ARCH_REGIONS=_MAT_REGIONS; _STORY=_MAT_STORY;
   STORY_VILLAIN=_MAT_VILLAIN; STORY_KINGDOM=_MAT_KINGDOM;
  }
 } else if(advId==='col' || advId==='colfr'){
  // Variante française du collège : « L'Odyssée des mots — La Bibliothèque infinie ».
  const _wantColFr = (advId==='colfr') || (advId==='col' && typeof GM!=='undefined' && GM.subject==='fr');
  if(_wantColFr){
   if(typeof GM!=='undefined' && GM.subject!=='fr') GM.subject='fr';
   MAP_ZONES=COL_ZONES_FR; _ARCH_REGIONS=_COL_REGIONS_FR; _STORY=_COL_STORY_FR;
   STORY_VILLAIN=_COL_VILLAIN_FR; STORY_KINGDOM=_COL_KINGDOM_FR;
   GM.adventure='colfr';
  } else {
   GM.adventure='col';
   MAP_ZONES=COL_ZONES; _ARCH_REGIONS=_COL_REGIONS; _STORY=_COL_STORY;
   STORY_VILLAIN=_COL_VILLAIN; STORY_KINGDOM=_COL_KINGDOM;
  }
 } else {
  const _wantPrimFr = (advId==='primfr') || (advId==='prim' && typeof GM!=='undefined' && GM.subject==='fr');
  if(_wantPrimFr){
   if(typeof GM!=='undefined' && GM.subject!=='fr') GM.subject='fr';
   MAP_ZONES=PRIM_ZONES_FR; _ARCH_REGIONS=_PRIM_REGIONS_FR; _STORY=_PRIM_STORY_FR;
   STORY_VILLAIN=_PRIM_VILLAIN_FR; STORY_KINGDOM=_PRIM_KINGDOM_FR;
   GM.adventure='primfr';
  } else {
   GM.adventure='prim';
   MAP_ZONES=PRIM_ZONES; _ARCH_REGIONS=_PRIM_REGIONS; _STORY=_PRIM_STORY;
   STORY_VILLAIN='Comte Zéro de Cafouillac'; STORY_KINGDOM='Calcultopia';
  }
 }
 if(typeof P==='object' && P) P.lastAdventure = GM.adventure;
 openMap();
}

// v10.2.1 — Zone-avatar PAR AVENTURE (corrige le mélange entre primaire / maternelle /
// collège). Avant, un seul champ P.mapAvatarZone était partagé : en changeant
// d'aventure, la zone restait celle de l'autre niveau (et la recherche échouait,
// ce qui sautait le rafraîchissement de la mini-carte et du livre).
function _avAdvKey(){ return (typeof GM!=='undefined' && GM && GM.adventure) || 'prim'; }
function _firstZoneId(){ try{ return (MAP_ZONES[0] && MAP_ZONES[0].id) || 'plaine'; }catch(e){ return 'plaine'; } }
function _getAvatarZone(){
 if(typeof P==='undefined' || !P) return _firstZoneId();
 P.mapAvatarZoneByAdv = P.mapAvatarZoneByAdv || {};
 const k = _avAdvKey();
 // migration : ancien champ unique → primaire
 if(P.mapAvatarZone && !P.mapAvatarZoneByAdv.prim) P.mapAvatarZoneByAdv.prim = P.mapAvatarZone;
 let z = P.mapAvatarZoneByAdv[k];
 if(!z || !MAP_ZONES.find(x => x.id === z)) z = _firstZoneId();
 P.mapAvatarZoneByAdv[k] = z;
 return z;
}
function _setAvatarZone(id){
 if(typeof P==='undefined' || !P) return;
 P.mapAvatarZoneByAdv = P.mapAvatarZoneByAdv || {};
 P.mapAvatarZoneByAdv[_avAdvKey()] = id;
 P.mapAvatarZone = id; // compat héritée
}
// Ouvre l'écran de choix des trois aventures
// v10.12.5 — Logo selon la matière : « L'Odyssée des Mots » en français,
// « L'Odyssée des Chiffres » en maths. Les <img class="subj-logo"> sont basculées.
function _setSubjectLogos(){
 try{
  const fr = (typeof GM!=='undefined' && GM && GM.subject==='fr');
  document.querySelectorAll('img.subj-logo').forEach(function(im){
   im.src = fr ? 'assets/logo-mots.webp?v=1020' : 'assets/logo-main.webp?v=1020';
   im.alt = fr ? "L'Odyssée des Mots" : "L'Odyssée des Chiffres";
  });
  const lbl = document.getElementById('ody-btn-label');
  if(lbl) lbl.textContent = fr ? "L'ODYSSÉE : L'AVENTURE LITTÉRAIRE" : "L'ODYSSÉE : L'AVENTURE MATHÉMATIQUE";
 }catch(e){}
}
function openOdysseeSelect(){
 try{
  const fr=(typeof GM!=='undefined'&&GM.subject==='fr');
  const t=document.getElementById('ody-sel-title'); if(t) t.textContent=fr?"L'Odyssée : l'aventure littéraire":"L'Odyssée : l'aventure mathématique";
  const su=document.getElementById('ody-sel-sub'); if(su) su.textContent=fr?"Maîtrise les secrets du langage":"Choisis ton aventure";
  const ms=document.getElementById('ody-mat-sub'); if(ms) ms.textContent=fr?"Le Grand Livre du Conteur":"Le Pays des Couleurs";
  const ps=document.getElementById('ody-prim-sub'); if(ps) ps.textContent=fr?"Le journal intime":"L'Ombre sur Calcultopia";
  const cs=document.getElementById('ody-col-sub'); if(cs) cs.textContent=fr?"La Bibliothèque infinie":"Le Forgeron des Étoiles";
  if(typeof _setSubjectLogos==='function') _setSubjectLogos();
 }catch(e){}
 if(typeof navTo==='function') navTo('v-odyssey-select'); else showView('v-odyssey-select');
}

// ═══════════════════════════════════════════════════════
// O1 — CARTE DE ZONE (sous-niveaux v8.7.8)
// Affiche les 5 étapes d'une zone, gère la progression
// ═══════════════════════════════════════════════════════

// État courant : quelle zone et quelle étape on joue
let _currentZoneId = null;
let _currentStepIdx = -1;

// Ouvre la carte de zone (au lieu de lancer directement le boss)
function openZone(zoneId){
 const zone = MAP_ZONES.find(z=>z.id===zoneId);
 if(!zone) return;
 _currentZoneId = zoneId;
 // S'assurer que zoneProgress existe pour cette zone
 P.zoneProgress = P.zoneProgress || {};
 if(!P.zoneProgress[zoneId]){
  P.zoneProgress[zoneId] = { stepsCompleted: 0, completed: false };
 }
 renderZoneMap();
 if(typeof navTo==='function') navTo('v-zone'); else showView('v-zone');
}

// Affiche les étapes de la zone courante
function renderZoneMap(){
 const zone = MAP_ZONES.find(z=>z.id===_currentZoneId);
 if(!zone) return;
 const steps = Array.isArray(zone.steps) ? zone.steps : [];
 const prog = (P.zoneProgress && P.zoneProgress[zone.id]) || { stepsCompleted: 0, completed: false };
 const done = prog.stepsCompleted;
 // Header
 const _t=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
 _t('zone-emoji', zone.emoji);
 _t('zone-title', zone.label);
 _t('zone-sub', 'Niveau ' + zone.level + ' · ' + steps.length + ' étapes');
 // Barre de progression
 const total = steps.length || 1;
 const pct = Math.round((done/total)*100);
 const fill = document.getElementById('zone-progress-fill');
 if(fill) fill.style.width = pct+'%';
 _t('zone-progress-text', `${done}/${total} étape${done>1?'s':''} franchie${done>1?'s':''}`);
 // Liste des étapes
 const TAGS = { monster:'Monstre', puzzle:'Énigme', minibss:'Mini-boss', boss:'BOSS' };
 const box = document.getElementById('zone-steps-path');
 if(!box) return;
 box.innerHTML = steps.map((s, i)=>{
  let cls='locked', click='', extra='<span class="zone-step-lock">🔒</span>';
  if(i < done){ cls='done'; click=`onclick="startMapStep('${zone.id}',${i})"`; extra=''; }
  else if(i === done){ cls='current'; click=`onclick="startMapStep('${zone.id}',${i})"`; extra=''; }
  const tagCls = 'tag-' + (s.type || 'monster');
  const tagLabel = TAGS[s.type] || 'Étape';
  const q = s.questions || 5;
  return `
   <div class="zone-step ${cls}" ${click}>
    <div class="zone-step-emoji">${s.emoji||'❓'}</div>
    <div class="zone-step-info">
     <div class="zone-step-num">Étape ${i+1} / ${steps.length}</div>
     <div class="zone-step-name">${s.name||'Étape'}<span class="zone-step-tag ${tagCls}">${tagLabel}</span></div>
     <div class="zone-step-meta">${q} questions${s.dropCommon?' · 🎁 figurine':''}${s.dropRare?' · ⭐ figurine rare':''}</div>
    </div>
    ${extra}
   </div>`;
 }).join('');
}

// Lance une étape précise d'une zone
// ─── v8.7.27 / v8.7.28 : Pool de dialogues diversifiés pour les monstres ───
// 3 catégories, pools enrichis avec interpolations ${zone} et ${name}.
// v8.7.28 : le tirage est un Fisher-Yates seedé par zoneId, et l'index utilisé est
// la position du monstre dans la séquence d'étapes du MÊME type (withinKindIdx).
// Garantie : dans une même zone, deux étapes "monster" ne tirent jamais la même phrase
// (tant que pool.length >= nb d'étapes de ce type).
const MONSTER_DIALOGUES = {
 monster: [
  "Te voilà donc l'aventurier qui ose s'aventurer ici…",
  "Encore un curieux à terrasser. Le temps presse !",
  "Tu pensais traverser ${zone} sans m'affronter ? Quelle erreur.",
  "Approche, petit téméraire. Ton voyage s'arrête ici.",
  "Mes énigmes ont fait pleurer plus d'un héros…",
  "Sens-tu mon souffle ? Il porte le défi.",
  "Voyons si ton esprit vaut mieux que tes pas.",
  "Tu trembles déjà ? Et pourtant je n'ai rien dit…",
  "Réponds vite, ou tombe à mes pieds !",
  "Beaucoup ont essayé. Beaucoup ont échoué.",
  "On m'appelle ${name}, et je ne fais jamais de cadeaux.",
  "Tu sens cette odeur ? C'est celle de mes précédentes victimes.",
  "${zone} n'est pas pour toi. Rebrousse chemin.",
  "Petit, mon ombre est plus dangereuse que mes griffes.",
  "Tu crois pouvoir filer ? Pas avant d'avoir résolu mes questions.",
  "J'ai dévoré des sorciers, des chevaliers, des rois. Pourquoi pas toi ?",
  "Bienvenue dans ma tanière. La sortie sera plus difficile.",
  "Je vais te poser une question. Réponds, ou disparais.",
 ],
 miniboss: [
  "Avant d'atteindre le boss, tu devras me passer !",
  "Je garde le chemin. Personne ne passe sans payer le prix.",
  "Tu crois avoir vaincu mes serviteurs ? Mauvaise nouvelle : me voilà.",
  "Le boss de ${zone} m'attend de l'autre côté. Mais d'abord… moi !",
  "Ton ascension s'arrête ici, intrus.",
  "Je suis le dernier rempart avant le maître des lieux.",
  "Sans m'abattre, tu ne verras jamais ce qui se cache plus loin.",
  "On ne devient pas légende sans m'avoir affronté.",
  "Si tu chutes ici, le boss n'aura même pas à se déplacer.",
  "Petite leçon avant la fin : combien de chances te reste-t-il ?",
  "Le maître de ${zone} a choisi son lieutenant avec soin. Devine qui.",
  "${name} ne laisse passer aucun aventurier. Tu n'échapperas pas à la règle.",
 ],
 boss: [
  "Tu oses entrer dans mon territoire ? ${zone} n'a pas de pitié pour les ignorants.",
  "Bienvenue à ${zone}, mortel. Personne n'en repart vivant.",
  "${zone} est ma forteresse. Tu ne franchiras pas mes portes.",
  "Tu as combattu pour arriver jusqu'ici. Tu mourras pour en repartir.",
  "Je règne sur ${zone} depuis des siècles. Tu n'es qu'un grain de poussière.",
  "Mes serviteurs t'ont laissé passer pour mieux savourer ta défaite.",
  "Tant d'héros sont tombés ici… Veux-tu vraiment être le suivant ?",
  "${zone} sera ton tombeau, aventurier.",
  "Tu sens cette aura ? C'est celle de ta propre fin.",
  "Beaucoup parlent de courage. Peu en montrent face à moi.",
  "On m'appelle ${name}. C'est le dernier nom que tu entendras.",
  "Avant moi, des armées ont marché sur ${zone}. Aucune n'a survécu.",
 ],
};

// Fisher-Yates seedé par zoneId+kind : renvoie un pool mélangé de façon
// déterministe (même zone → même ordre, donc cohérent entre rejeux).
function _shuffledDialogues(kind, zoneId){
 const base = MONSTER_DIALOGUES[kind] || MONSTER_DIALOGUES.monster;
 const arr = [...base];
 for(let i = arr.length - 1; i > 0; i--){
  const j = Math.floor(_archHash(zoneId + '_' + kind + '_' + i, 13) * (i + 1));
  const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
 }
 return arr;
}
// Tire la phrase à la position `withinKindIdx` du pool mélangé pour cette zone+type.
function _pickDialogue(kind, zoneId, withinKindIdx){
 const shuffled = _shuffledDialogues(kind, zoneId || 'def');
 const i = Math.max(0, withinKindIdx || 0) % shuffled.length;
 return shuffled[i];
}

function startMapStep(zoneId, stepIdx){
 const zone = MAP_ZONES.find(z=>z.id===zoneId);
 if(!zone || !Array.isArray(zone.steps)) return;
 const step = zone.steps[stepIdx];
 if(!step) return;
 const prog = (P.zoneProgress && P.zoneProgress[zoneId]) || { stepsCompleted:0 };
 // Étape verrouillée ? On refuse silencieusement
 if(stepIdx > prog.stepsCompleted) return;
 _currentZoneId = zoneId;
 _currentStepIdx = stepIdx;
 // Préparer GM avec la zone (réutilise tout le moteur existant)
 GM.mapZone = zone;
 GM.mapStep = { idx: stepIdx, def: step };
 GM.level = zone.level;
 GM.mode2 = 'normal';
 GM.mode = P.prefs.mode || 'keyboard';
 // v10.1.0 : en aventure maternelle, mêmes réglages que le mode solo
 // (rendu 100% visuel via qcm, ambiance douce). Le chrono est déjà neutralisé
 // par le retour anticipé de renderQ sur les questions maternelle.
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level)){
  GM.mode = 'qcm';
  if(typeof _matApplyAmbiance==='function') _matApplyAmbiance(GM.level);
 }
 applyTheme(zone.theme);
 // Construire le monstre/boss à partir de la définition de l'étape
 const isBoss = (step.type === 'boss');
 const isMiniBoss = (step.type === 'minibss');
 const monster = {
  emoji: step.emoji || '👹',
  name:  step.name  || 'Adversaire',
  title: isBoss ? `Gardien de : ${zone.label}` : (isMiniBoss ? `Mini-boss · ${zone.label}` : `Étape ${stepIdx+1}`),
  // v8.7.28 : tirage diversifié + unicité dans la zone.
  // withinKindIdx = position du monstre dans la séquence d'étapes du même type
  // (ex: si la zone a 3 "monster", ils prendront shuffled[0], [1], [2] → tous distincts).
  intro: (() => {
   const kind = isBoss ? 'boss' : (isMiniBoss ? 'miniboss' : 'monster');
   const withinKindIdx = (Array.isArray(zone.steps) ? zone.steps : []).slice(0, stepIdx + 1).filter(s => {
    if(kind === 'boss')     return s.type === 'boss';
    if(kind === 'miniboss') return s.type === 'minibss';
    return s.type !== 'boss' && s.type !== 'minibss';
   }).length - 1;
   const tpl = _pickDialogue(kind, zoneId, withinKindIdx);
   return tpl.replace(/\$\{zone\}/g, zone.label).replace(/\$\{name\}/g, step.name || 'l\'Inconnu');
  })(),
  anim: 'glow',
  col:  isBoss ? '#e74c3c' : (isMiniBoss ? '#e67e22' : '#3498db')
 };
 const _startCombat = ()=>{
  loadProfile();
  gameActive=true; clearPendingTimers(); resetGS();
  GS.isBoss = isBoss;
  GS.isSeasonalBoss=false; GS.isBirthdayBoss=false; GS.seasonalMult=1; GS.seasonalFigId=null;
  // Nombre de questions de l'étape (override pour mini-parties)
  GS.questionsTarget = step.questions || 5;
  // v8.7.9 (O1) : fixer _currentMonster au monstre de l'étape pour cohérence
  // (taunts, voix, emoji affiché pendant les questions).
  _currentMonster = monster;
  powers={};
  const pwI = Math.abs((P.name.charCodeAt(0)||0)) % POWERS.length;
  const pw = POWERS[pwI];
  powers[P.name] = { id:pw.id, eff:pw.effect, charge:0, recharge:pw.recharge, shielded:false, dbl:false };
  $('combat-bar').classList.add('hidden');
  $('hud-name').innerText = (P.avatar||'👤') + ' ' + P.name;
  $('hud-chrono').classList.add('hidden'); $('hud-combo').classList.add('hidden');
  $('qcm-options').classList.toggle('hidden', GM.mode!=='qcm');
  $('input-zone').classList.toggle('hidden', GM.mode==='qcm');
  toggleNumpadForMode(GM.mode);
  $('BODY').classList.remove('body-alert','urgency-bg');
  showView('v-game');
  nextTurn();
  if(typeof startZoneSkin==='function') startZoneSkin(zone);
 };
 // Pour les étapes mineures : pas de cinématique d'entrée de zone (pour ne pas surcharger).
 // Pour le boss final : on garde la cinématique d'entrée de zone (existante).
 if(isBoss){
  const _afterIntro = ()=>showMonsterIntro(monster, _startCombat);
  if(typeof playZoneIntro==='function') playZoneIntro(zone, _afterIntro);
  else _afterIntro();
 } else {
  showMonsterIntro(monster, _startCombat);
 }
}

// Quitte la carte de zone
function closeZone(){
 _currentZoneId = null;
 _currentStepIdx = -1;
 if(typeof navBack==='function') navBack(); else showView('v-map');
}

// v8.7.27 : retour direct à la modale zoom de la zone qu'on vient de jouer
// (depuis l'écran v-end après une étape).
function returnToModule(){
 const btn = document.getElementById('btn-return-module');
 const zoneId = btn ? btn.dataset.zoneId : null;
 if(!zoneId){ if(typeof returnMenu === 'function') returnMenu(); return; }
 // Reset état de partie + revenir à la carte mondiale puis ouvrir la modale.
 // L'avatar est déjà sur la bonne zone (mapAvatarZone = zoneId puisqu'on y a joué),
 // donc requestZoneOpen ne déclenchera PAS d'animation et ouvrira la modale direct.
 GM.mapZone = null;
 GM.mapStep = null;
 gameActive = false;
 clearPendingTimers();
 if(typeof navTo === 'function') navTo('v-map'); else showView('v-map');
 renderMap();
 setTimeout(()=>{
  try{ requestZoneOpen(zoneId); }catch(e){ openArchipelZoom(zoneId); }
 }, 60);
}

// ═══════════════════════════════════════════════════════
// O3-A — ARCHIPEL D'UNIVERS (v8.7.15)
// Carte mondiale unique avec îlots organiques variés sur fond cosmique,
// sentier sinueux continu qui traverse tout, zoom intelligent vers
// vue détaillée d'une sous-zone (avec ses étapes).
// ═══════════════════════════════════════════════════════

// Métadonnées des 5 régions + Sanctuaire (titres calligraphiés)
const _PRIM_REGIONS = [
 { id:'cp',    label:'Région des Débuts',     levels:['CP'],  shape:'colline' },
 { id:'ce1',   label:'Bois et Plages',         levels:['CE1'], shape:'feuille' },
 { id:'ce2',   label:'Terres d\'Aventure',     levels:['CE2'], shape:'dune' },
 { id:'cm1',   label:'Royaumes Périlleux',     levels:['CM1'], shape:'citadelle' },
 { id:'cm2',   label:'Au-delà des Étoiles',    levels:['CM2'], shape:'nebuleuse' },
 { id:'final', label:'Sanctuaire Final',       levels:['FINAL'], shape:'mandala' },
];
// v10.1.0 — Régions des nouvelles aventures (mêmes 6 ids → thème réutilisé,
// labels propres à chaque aventure). Le groupement se fait par z.region.
const _MAT_REGIONS = [
 { id:'cp',    label:'La Plaine des Coquelicots', levels:['PS'], shape:'colline' },
 { id:'ce1',   label:'Le Verger des Oranges',     levels:['PS'], shape:'feuille' },
 { id:'ce2',   label:'Les Bois Dorés',            levels:['MS'], shape:'dune' },
 { id:'cm1',   label:'Le Lagon aux Tortues',      levels:['MS'], shape:'citadelle' },
 { id:'cm2',   label:'La Colline des Bleuets',    levels:['GS'], shape:'nebuleuse' },
 { id:'final', label:'Le Château du Soir',        levels:['GS'], shape:'mandala' },
];
const _COL_REGIONS = [
 { id:'cp',    label:'Le Port des Décimales',      levels:['6E'], shape:'colline' },
 { id:'ce1',   label:'Les Cavernes Fractionnaires',levels:['6E'], shape:'feuille' },
 { id:'ce2',   label:'Le Plateau des Relatifs',    levels:['5E'], shape:'dune' },
 { id:'cm1',   label:'La Citadelle Algébrique',    levels:['4E'], shape:'citadelle' },
 { id:'cm2',   label:'Les Gorges de Pythagore',    levels:['4E'], shape:'nebuleuse' },
 { id:'final', label:'L\'Observatoire des Fonctions',levels:['3E'], shape:'mandala' },
 { id:'titan', label:'L\'Antre du Titan',          levels:['3E'], shape:'citadelle' },
];
let _ARCH_REGIONS = _PRIM_REGIONS;

// v8.7.35 (O3-B.3) : Transports thématiques par région.
// Sur la carte mondiale uniquement (jamais dans la modale zoom), pendant l'animation
// pas-à-pas de l'avatar, l'emoji change selon la région traversée pour évoquer
// le mode de déplacement adapté au biome. À l'arrêt, l'avatar reprend P.avatar.
const _REGION_TRANSPORTS = {
 cp:    '🚶',  // marcheur — humble débutant dans la Région des Débuts
 ce1:   '🛶',  // canoë — forêts et plages humides
 ce2:   '🐪',  // dromadaire — déserts et plaines venteuses
 cm1:   '⛷️',  // skieur — montagnes, glaces, forteresses
 cm2:   '🚀',  // fusée — au-delà des étoiles
 final: '✨',  // téléportation — Sanctuaire Final
};

// v8.7.40 (O3-C.1) : Bannière de transition entre biomes.
// Affichée quand l'avatar franchit la frontière entre deux îlots pendant son
// déplacement animé. Emoji, couleurs et phrase d'accueil thématiques par région.
const _BIOME_BANNER_META = {
 cp:    { emoji:'🌾', accent:'#a8e6a2', bgGrad:'linear-gradient(135deg,#27ae60,#74b9ff)',     subtitle:'Région des Débuts' },
 ce1:   { emoji:'🌲', accent:'#5fb95a', bgGrad:'linear-gradient(135deg,#1b6b3a,#2ecc71)',     subtitle:'Bois et Plages' },
 ce2:   { emoji:'🏜️', accent:'#f6cb8b', bgGrad:'linear-gradient(135deg,#c87b27,#e67e22)',     subtitle:'Terres d\'Aventure' },
 cm1:   { emoji:'🏰', accent:'#b6c8d4', bgGrad:'linear-gradient(135deg,#4b6584,#1f2733)',     subtitle:'Royaumes Périlleux' },
 cm2:   { emoji:'🌌', accent:'#cbb1ee', bgGrad:'linear-gradient(135deg,#3a0a4a,#9b59b6)',     subtitle:'Au-delà des Étoiles' },
 final: { emoji:'🕉️', accent:'#fff4c0', bgGrad:'linear-gradient(135deg,#b7950b,#f1c40f)',     subtitle:'Sanctuaire Final' },
};
// v8.7.48 (O3-C.5) : Signature sonore régionale.
// Court motif mélodique synthétisé (via beep) joué à l'entrée d'une région.
// Chaque biome a sa "couleur" musicale. Pas de nappe continue (fatigante et
// difficile à rendre convaincante sans assets audio) — un jingle ponctuel.
const _REGION_AUDIO_SIGNATURE = {
 // CP : fanfare douce ascendante, accueillante (do-mi-sol-do aigu)
 cp:    { notes:[523, 659, 784, 1047],        type:'sine',     gap:130, dur:.35, vol:.10 },
 // CE1 : quintes boisées, mystère doux de forêt (sol-si-ré-si)
 ce1:   { notes:[392, 494, 587, 494],         type:'triangle', gap:150, dur:.40, vol:.10 },
 // CE2 : motif oriental/désertique légèrement mineur (la-do-si-sol-la)
 ce2:   { notes:[440, 523, 494, 392, 440],    type:'triangle', gap:140, dur:.38, vol:.10 },
 // CM1 : accord héroïque puissant de montagne (do grave-sol-do-mi)
 cm1:   { notes:[262, 392, 523, 659],         type:'triangle', gap:150, dur:.42, vol:.11 },
 // CM2 : intervalles larges éthérés, cosmiques (do-sol-mi-do aigu)
 cm2:   { notes:[523, 784, 659, 1047],        type:'sine',     gap:170, dur:.50, vol:.09 },
 // Final : montée glorieuse et sacrée (do-mi-sol-do-mi aigus)
 final: { notes:[523, 659, 784, 1047, 1319],  type:'sine',     gap:160, dur:.50, vol:.11 },
};
function _playRegionSignature(regionId){
 const sig = _REGION_AUDIO_SIGNATURE[regionId];
 if(!sig || typeof beep !== 'function') return;
 sig.notes.forEach((f, i) => {
  setTimeout(() => { try{ beep(f, sig.type, sig.dur, sig.vol); }catch(e){} }, i * sig.gap);
 });
}
function _showBiomeBanner(regionId){
 const meta = _BIOME_BANNER_META[regionId] || { emoji:'📖', accent:'#ffe08a', bgGrad:'linear-gradient(135deg,#27ae60,#74b9ff)' };
 // v10.13.7 — Le NOM affiché ET prononcé vient TOUJOURS de l'aventure courante
 // (_ARCH_REGIONS), jamais du libellé math par défaut. Vrai pour toutes les
 // odyssées (maths/français/futures), même celles aux ids de région inédits.
 let _regionName = '';
 try{ const _r=(typeof _ARCH_REGIONS!=='undefined'&&Array.isArray(_ARCH_REGIONS))?_ARCH_REGIONS.find(r=>r.id===regionId):null; _regionName=(_r&&_r.label)||''; }catch(e){}
 if(!_regionName) _regionName = meta.subtitle || '';
 if(!_regionName) return;
 // Si une bannière précédente existe encore (cas d'enchaînement rapide), la retirer
 const existing = document.querySelector('.biome-banner');
 if(existing) existing.remove();
 const banner = document.createElement('div');
 banner.className = 'biome-banner';
 banner.style.background = meta.bgGrad;
 banner.style.borderColor = meta.accent;
 banner.innerHTML = `
  <div class="biome-banner-emoji">${meta.emoji}</div>
  <div class="biome-banner-text">
   <div class="biome-banner-lead">Vous entrez dans</div>
   <div class="biome-banner-name" style="color:${meta.accent};">${_regionName}</div>
  </div>
  <div class="biome-banner-emoji">${meta.emoji}</div>
 `;
 document.body.appendChild(banner);
 // v8.7.48 : signature sonore du biome (jingle court synthétisé)
 _playRegionSignature(regionId);
 // Narration vocale discrète : annonce du nouveau biome (après le jingle)
 if(typeof speak === 'function'){
  setTimeout(()=>{ try{ speak(_regionName); }catch(e){} }, 850);
 }
 // Cycle : slide-in (0.5s) → hold (1.6s) → slide-out (0.5s) → remove
 setTimeout(()=> banner.classList.add('biome-banner-out'), 2100);
 setTimeout(()=> banner.remove(), 2700);
}

// v8.7.41 (O3-C.2) : Météo locale par région.
// Particules ambiantes animées sur les îlots DÉBLOQUÉS (les foggés ont déjà leurs
// nuages). Animation très légère pour donner vie à chaque biome sans surcharger.
const _WEATHER_BY_REGION = {
 cp:    { emojis:['🦋','🌸','🐝','🍀'],     count:5, anim:'drift'   },
 ce1:   { emojis:['🍃','🌿','🐚','🍂'],     count:6, anim:'falling' },
 ce2:   { emojis:['🌪️','💨','☀️'],          count:4, anim:'wind'    },
 cm1:   { emojis:['❄️','🌨️','💎'],          count:7, anim:'falling' },
 cm2:   { emojis:['⭐','✨','💫','🌟'],      count:8, anim:'twinkle' },
 final: { emojis:['✨','🌟','💛'],           count:6, anim:'rising'  },
};
// v8.7.42 (O3-C.3) : PNJ et figurants sur les îlots débloqués.
// 2 personnages secondaires par région qui donnent vie au monde, avec dialogue
// d'accueil au clic. Position seedée stable, animation idle bobbing.
const _NPCS_BY_REGION = {
 cp: [
  { emoji:'🧙‍♂️', name:'Maître Élio',   line:'Bienvenue, jeune aventurier ! Le courage sera ton allié.' },
  { emoji:'🐑',   name:'Berger Pâquerette', line:'Mes moutons sont presque aussi malins que toi !' },
 ],
 ce1: [
  { emoji:'🧚',   name:'Fée Lumelle',   line:'Les forêts murmurent leurs secrets, écoute-les !' },
  { emoji:'🦌',   name:'Cerf Sylvain',  line:'Avance avec sagesse, brave héros. Chaque pas compte.' },
 ],
 ce2: [
  { emoji:'🧞',   name:'Génie Sablo',   line:'Trois vœux pour qui résout trois énigmes ! Mais d\'abord, prouve-toi.' },
  { emoji:'🦅',   name:'Aigle Vent-Pur', line:'Mes ailes connaissent tous les secrets du désert.' },
 ],
 cm1: [
  { emoji:'🛡️',  name:'Sir Cassel',    line:'Halte ! Seuls les plus braves passent par cette voie.' },
  { emoji:'🧝',   name:'Elfe Veylis',   line:'Les anciens secrets sont gravés dans la pierre des montagnes.' },
 ],
 cm2: [
  { emoji:'👽',   name:'Zorbax du Nébula', line:'Bzzip ! Tes exploits résonnent dans toute la galaxie.' },
  { emoji:'🪐',   name:'Sage Cosmik',    line:'L\'univers entier est une énigme. Perce-la.' },
 ],
 final: [
  { emoji:'🦄',   name:'Licorne Astralia', line:'Tu es arrivé jusqu\'ici. Le Sanctuaire t\'observe.' },
  { emoji:'🕊️',  name:'Esprit Aelune',  line:'Les trésors sacrés t\'attendent. Sois digne.' },
 ],
};
// Génère le HTML des PNJ pour un îlot débloqué.
// v8.7.43 : placement intelligent — chaque PNJ teste 24 positions candidates dans
// la bbox STRICTE des zones (qui est forcément à l'intérieur du blob, puisque les
// zones sont dans le blob). Filtres durs : >55px des zones, >55px de la boutique,
// >80px des autres PNJ déjà placés. Score = max(distance aux zones) − 0.3 × distance
// au centroïde des zones (pour rester dans le ventre de l'îlot).
function _buildNpcsOverlay(regionId, bbox, zonePositions, shopPos, mapW){
 const npcs = _NPCS_BY_REGION[regionId];
 if(!npcs || npcs.length === 0) return '';
 if(zonePositions.length === 0) return '';
 const W_vb = mapW || 560; // largeur de référence du viewBox (cohérente avec p.x)
 // Bbox STRICTE = celle des zones (sans marge) — garantie d'être à l'intérieur du blob.
 // On la rétrécit de 8% de chaque côté pour rester bien dans le ventre.
 const zoneXs = zonePositions.map(p => p.x);
 const zoneYs = zonePositions.map(p => p.y);
 const minX = Math.min(...zoneXs);
 const maxX = Math.max(...zoneXs);
 const minY = Math.min(...zoneYs);
 const maxY = Math.max(...zoneYs);
 const padX = (maxX - minX) * 0.08;
 const padY = (maxY - minY) * 0.08;
 const sMinX = minX + padX, sMaxX = maxX - padX;
 const sMinY = minY + padY, sMaxY = maxY - padY;
 const widthAbs = Math.max(1, sMaxX - sMinX);
 const heightAbs = Math.max(1, sMaxY - sMinY);
 // Centroïde des zones (pour préférer les candidats proches du centre du blob)
 const cx = zonePositions.reduce((s,p)=>s+p.x,0) / zonePositions.length;
 const cy = zonePositions.reduce((s,p)=>s+p.y,0) / zonePositions.length;
 // Choix des positions une à une (chaque PNJ évite les précédents)
 const placed = [];
 npcs.forEach((npc, i) => {
  let best = null, bestScore = -Infinity;
  let fallback = null, fallbackDist = -Infinity; // meilleur candidat même s'il viole les filtres
  for(let attempt = 0; attempt < 32; attempt++){
   const r1 = _archHash(regionId, 1000 + i*200 + attempt*7);
   const r2 = _archHash(regionId, 2000 + i*200 + attempt*7);
   const absX = sMinX + r1 * widthAbs;
   const absY = sMinY + r2 * heightAbs;
   // Distance min aux zones
   let minDistZone = Infinity;
   for(const p of zonePositions){
    const d = Math.hypot(p.x - absX, p.y - absY);
    if(d < minDistZone) minDistZone = d;
   }
   // Distance à la boutique + autres PNJ
   const dShop = shopPos ? Math.hypot(shopPos.x - absX, shopPos.y - absY) : Infinity;
   let minDistOther = Infinity;
   for(const o of placed){
    const d = Math.hypot(o.absX - absX, o.absY - absY);
    if(d < minDistOther) minDistOther = d;
   }
   // Suivi du candidat de repli : celui qui combine le mieux distance zones + boutique + autres
   const combinedClearance = Math.min(minDistZone, dShop, minDistOther);
   if(combinedClearance > fallbackDist){
    fallbackDist = combinedClearance;
    fallback = { absX, absY };
   }
   // Filtres durs
   if(minDistZone < 62) continue;
   if(dShop < 58) continue;
   if(minDistOther < 75) continue;
   // Score : maximiser distance aux zones, mais pénaliser éloignement du centroïde
   const dCentroid = Math.hypot(cx - absX, cy - absY);
   const score = minDistZone - 0.3 * dCentroid;
   if(score > bestScore){
    bestScore = score;
    best = { absX, absY };
   }
  }
  // Si aucun candidat n'a passé les filtres durs, prendre le candidat de repli
  // (le plus dégagé possible) plutôt qu'une position fixe arbitraire.
  if(!best) best = fallback || { absX: cx, absY: cy };
  placed.push(best);
 });
 // Construire le HTML — positions absolues converties en % de la bbox du layer
 const layerW = (bbox.widthPct / 100) * W_vb;
 const html = placed.map((pos, i) => {
  const npc = npcs[i];
  const layerLeftAbs = (bbox.leftPct / 100) * W_vb;
  const lx = ((pos.absX - layerLeftAbs) / Math.max(1, layerW)) * 100;
  const ly = ((pos.absY - bbox.topPx) / Math.max(1, bbox.heightPx)) * 100;
  const delay = (_archHash(regionId, 900+i) * 2).toFixed(2);
  return `<div class="archipel-npc" data-region="${regionId}" data-npc-idx="${i}"
              style="left:${lx.toFixed(1)}%;top:${ly.toFixed(1)}%;animation-delay:${delay}s;"
              onclick="_npcClicked('${regionId}',${i})"
              title="${npc.name}">
           <span class="archipel-npc-emoji">${npc.emoji}</span>
          </div>`;
 }).join('');
 return `<div class="archipel-npcs-layer" data-region="${regionId}" style="left:${bbox.leftPct.toFixed(1)}%;top:${bbox.topPx.toFixed(0)}px;width:${bbox.widthPct.toFixed(1)}%;height:${bbox.heightPx.toFixed(0)}px;">${html}</div>`;
}
// Handler clic sur un PNJ : affiche une bulle de dialogue + narration vocale.
function _npcClicked(regionId, idx){
 const npc = (_NPCS_BY_REGION[regionId] || [])[idx];
 if(!npc) return;
 // Bulle de dialogue flottante au-dessus du PNJ
 const npcEl = document.querySelector(`.archipel-npc[data-region="${regionId}"][data-npc-idx="${idx}"]`);
 if(!npcEl) return;
 // Si une bulle existe déjà, la retirer (et restaurer le z-index de son layer)
 const existing = document.querySelector('.archipel-npc-bubble');
 if(existing){
  const prevLayer = existing.closest('.archipel-npcs-layer');
  if(prevLayer) prevLayer.style.zIndex = '';
  existing.remove();
 }
 // v8.7.44 : élever le z-index du layer parent pendant l'affichage de la bulle.
 // Sinon la bulle (z-index:20 interne) reste piégée dans le stacking context du
 // layer (z-index:4) et passe SOUS les zones (z-index:10) et autres PNJ → texte
 // illisible. En remontant le layer à 80, toute la bulle passe au-dessus.
 const layer = npcEl.closest('.archipel-npcs-layer');
 if(layer) layer.style.zIndex = '80';
 // v8.7.44 : élever aussi le PNJ cliqué au-dessus de ses frères du même layer
 // (sinon un autre PNJ rendu plus tard dans le DOM masque la bulle).
 npcEl.style.zIndex = '10';
 const bubble = document.createElement('div');
 bubble.className = 'archipel-npc-bubble';
 bubble.innerHTML = `
  <div class="archipel-npc-bubble-name">${npc.name}</div>
  <div class="archipel-npc-bubble-line">${npc.line}</div>
 `;
 npcEl.appendChild(bubble);
 // Narration vocale
 if(typeof speak === 'function'){
  setTimeout(()=>{ try{ speak(npc.line); }catch(e){} }, 150);
 }
 // Vibration douce
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate(VIBE.good || 30);
 }
 // Auto-close après 4.5s ou au clic n'importe où
 const close = () => {
  bubble.classList.add('archipel-npc-bubble-out');
  if(layer) layer.style.zIndex = '';   // restaurer le z-index normal du layer
  npcEl.style.zIndex = '';              // restaurer le z-index normal du PNJ
  setTimeout(() => bubble.remove(), 350);
  document.removeEventListener('click', closeOnOutside, true);
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
 };
 const closeOnOutside = (ev) => {
  if(!bubble.contains(ev.target) && ev.target !== npcEl && !npcEl.contains(ev.target)){
   close();
  }
 };
 setTimeout(close, 4500);
 // Délai avant d'activer le click-outside (sinon le clic actuel le ferme immédiatement)
 setTimeout(() => document.addEventListener('click', closeOnOutside, true), 100);
}
// Génère le HTML des particules météo pour un îlot débloqué.
// bbox = {leftPct, topPx, widthPct, heightPx} relative au conteneur map-zones.
function _buildWeatherOverlay(regionId, bbox){
 const cfg = _WEATHER_BY_REGION[regionId];
 if(!cfg) return '';
 // Hash déterministe pour répartition pseudo-aléatoire mais stable entre renders
 const seed = _archHash(regionId, 1);
 const particles = [];
 for(let i=0;i<cfg.count;i++){
  const emoji = cfg.emojis[i % cfg.emojis.length];
  // Position aléatoire seedée dans la bbox
  const lx = (_archHash(regionId, 100+i) * 100); // 0-100% de la bbox
  const ly = (_archHash(regionId, 200+i) * 100);
  const delay = (_archHash(regionId, 300+i) * 4).toFixed(2);  // 0-4s
  const dur = (4 + _archHash(regionId, 400+i) * 4).toFixed(2); // 4-8s
  const size = (0.85 + _archHash(regionId, 500+i) * 0.5).toFixed(2); // 0.85-1.35em
  particles.push(`<span class="weather-particle wp-${cfg.anim}" style="left:${lx.toFixed(1)}%;top:${ly.toFixed(1)}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${size}em;">${emoji}</span>`);
 }
 return `<div class="archipel-weather" data-region="${regionId}" style="left:${bbox.leftPct.toFixed(1)}%;top:${bbox.topPx.toFixed(0)}px;width:${bbox.widthPct.toFixed(1)}%;height:${bbox.heightPx.toFixed(0)}px;">${particles.join('')}</div>`;
}

// Hash simple d'une chaîne (pour générer des positions pseudo-aléatoires reproductibles).
// Retourne un nombre entre 0 et 1.
function _archHash(str, salt=0){
 let h = 5381 + salt;
 for(let i=0;i<str.length;i++){ h = ((h<<5)+h) + str.charCodeAt(i); h |= 0; }
 // Normaliser entre 0 et 1
 return (Math.abs(h % 10000) / 10000);
}

// ─── v8.7.27 / v8.7.28 : Boutiques par îlot ───
// Chaque région a une boutique stylisée selon son thème. Position dans le blob,
// dans une zone libre du sentier (ajustée d'après les retours visuels).
// xPctOffset = % du W ajouté au centre X du blob (négatif=gauche, positif=droite).
// yShift = px ajouté au centre Y du blob (négatif=haut, positif=bas).
const _ARCH_SHOPS = {
 'cp':    { emoji:'🍬', name:'Échoppe Sucrée',     theme:'sweets',
            bg:'linear-gradient(160deg,#ffc7e4 0%,#ff8fb1 45%,#f368a0 100%)',
            accent:'#c0398a',
            xPctOffset: 15, yShift: 35 },   // v8.7.28 : moitié droite du blob CP, à hauteur médiane
 'ce1':   { emoji:'🍃', name:'Cabane du Bûcheron',  theme:'forest',
            bg:'linear-gradient(160deg,#a8e6a2 0%,#5fb95a 50%,#2c6e26 100%)',
            accent:'#1f5a1c',
            xPctOffset: 10, yShift: 70 },   // v8.7.28 : centre-bas-droite (entre Trolls et Plage)
 'ce2':   { emoji:'🐪', name:'Bazar du Désert',     theme:'desert',
            bg:'linear-gradient(160deg,#fde7b6 0%,#e9b04e 45%,#b76b1c 100%)',
            accent:'#834a14',
            xPctOffset: 8, yShift: -12 },   // v8.7.28 : centre-droite (entre Plaines Venteuses et Profondeurs)
 'cm1':   { emoji:'⚒️', name:'Forge Royale',         theme:'castle',
            bg:'linear-gradient(160deg,#d3dce6 0%,#7e8fa3 50%,#3d4a5d 100%)',
            accent:'#1f2733',
            xPctOffset:-14, yShift:-100 }, // v8.7.29 : Forge Royale était hors du blob → ramenée plus à droite et plus haut
 'cm2':   { emoji:'🛸', name:'Comptoir Stellaire',   theme:'space',
            bg:'linear-gradient(160deg,#cbb1ee 0%,#7e57c4 50%,#2a1357 100%)',
            accent:'#1f0a45',
            xPctOffset: 13, yShift: -15 }, // v8.7.29 : décalée à droite pour quitter le sentier doré
 'final': { emoji:'💎', name:'Trésor Sacré',         theme:'sacred',
            bg:'linear-gradient(160deg,#fff4c0 0%,#f1c40f 50%,#a17806 100%)',
            accent:'#6a4d04',
            xPctOffset:-22, yShift: 0 },    // Sanctuaire : inchangé (îlot trop petit)
};
// Layout vertical : chaque sous-zone a une coordonnée Y croissante.
// X est généré par hash de l'id pour des positions variées mais déterministes.
// IMPORTANT : x est stocké en POURCENTAGE (0-100) pour être responsive.
//
// Overrides : positions forcées pour les zones qui sortaient des îlots avec le hash naturel.
// xPctOverride : pourcentage forcé (0-100). yShiftOverride : décalage Y en pixels (peut être négatif).
const _ARCH_OVERRIDES = {
 'bonbons':  { xPctOverride: 55, yShiftOverride: -55 }, // remonter franchement dans le blob CP
 'foret':    { xPctOverride: 32, yShiftOverride: 150 }, // descendre sous Vallée des Champignons (qui devient minY)
 'glace':    { xPctOverride: 50, yShiftOverride: 60  }, // inchangé (déjà OK)
 'nocturne': { xPctOverride: 55                       }, // inchangé
 'volcan':   { xPctOverride: 60, yShiftOverride: 130 }, // HAUT-DROITE du blob CM2 (bosse adoucie i=1-2), sentier lisible vers Galaxie sans enchevêtrement
 'ile':      { excludeFromBlob: true                  }, // Île Mystérieuse : DÉTACHÉE du continent CM2 — cohérence narrative (c'est une île). Ne participe pas au calcul de la bbox du blob, donc reste visuellement hors-îlot tout en restant connectée par le sentier.
};

function _computeArchipelLayout(){
 const W = 560; // largeur de référence pour les calculs SVG (viewBox)
 const positions = [];
 const regionTitleY = [];
 let curY = 55;
 const dyZone = 115;
 const titleSpace = 70;
 const dyBetweenRegion = 50;
 const xMinPct = 22;
 const xMaxPct = 78;
 _ARCH_REGIONS.forEach((region, rIdx)=>{
  const zonesInRegion = MAP_ZONES.map((z,i)=>({z,i})).filter(({z})=>{
   if(z.region) return z.region===region.id;                 // nouvelles aventures
   if(region.id==='final') return z.id==='sanctuaire';        // primaire (inchangé)
   return region.levels.includes(z.level) && z.id!=='sanctuaire';
  });
  if(zonesInRegion.length === 0) return;
  regionTitleY.push({ regionId: region.id, y: curY });
  curY += titleSpace;
  let lastSide = (rIdx % 2 === 0) ? 'right' : 'left';
  zonesInRegion.forEach(({z,i}, jdx)=>{
   const side = (jdx % 2 === 0) ? lastSide : (lastSide === 'left' ? 'right' : 'left');
   const variationRange = (xMaxPct - xMinPct) * 0.32;
   const noise = (_archHash(z.id, jdx) - 0.5) * variationRange;
   let xPct;
   if(side === 'left'){
    xPct = xMinPct + (xMaxPct - xMinPct) * 0.25 + noise;
   } else {
    xPct = xMinPct + (xMaxPct - xMinPct) * 0.75 + noise;
   }
   xPct = Math.max(xMinPct, Math.min(xMaxPct, xPct));
   const yNoise = (_archHash(z.id, jdx + 100) - 0.5) * 25;
   let y = curY + yNoise;
   // Appliquer les overrides éventuels
   const ov = _ARCH_OVERRIDES[z.id];
   let excludeFromBlob = false;
   if(ov){
    if(typeof ov.xPctOverride === 'number') xPct = ov.xPctOverride;
    if(typeof ov.yShiftOverride === 'number') y += ov.yShiftOverride;
    if(ov.excludeFromBlob === true) excludeFromBlob = true;
   }
   const x = (xPct / 100) * W;
   positions.push({ x, y, xPct, zone: z, regionId: region.id, zoneIdx: i, jdx, excludeFromBlob });
   curY += dyZone;
   lastSide = side;
  });
  curY += dyBetweenRegion;
 });
 const totalHeight = curY + 60;
 return { positions, totalHeight, W, regionTitleY };
}

// Génère un chemin SVG vraiment sinueux entre les nœuds.
// Utilise des points de contrôle excentrés alternés pour créer de vraies courbes.
function _buildArchipelPath(positions){
 if(positions.length === 0) return '';
 let d = `M ${positions[0].x.toFixed(1)},${positions[0].y.toFixed(1)} `;
 for(let i=1;i<positions.length;i++){
  const prev = positions[i-1];
  const cur = positions[i];
  const dx = cur.x - prev.x;
  const dy = cur.y - prev.y;
  // Vraie distance euclidienne (et non |dx+dy| qui peut s'annuler)
  const dist = Math.sqrt(dx*dx + dy*dy);
  // Vecteur perpendiculaire normalisé
  const perpX = -dy / (dist || 1);
  const perpY = dx / (dist || 1);
  // Amplitude alternée gauche/droite, variée par hash (en pixels absolus)
  const dir = (i % 2 === 0) ? 1 : -1;
  const ampPx = (60 + _archHash(cur.zone.id, i) * 50) * dir; // 60-110px excentrement
  const cpX = (prev.x + cur.x) / 2 + perpX * ampPx;
  const cpY = (prev.y + cur.y) / 2 + perpY * ampPx * 0.4; // moins de Y pour éviter rebroussement
  d += `Q ${cpX.toFixed(1)},${cpY.toFixed(1)} ${cur.x.toFixed(1)},${cur.y.toFixed(1)} `;
 }
 return d;
}

// Génère le SVG d'un îlot organique selon sa forme et ses positions de zones
function _renderIslandSvg(regionId, shape, zonePositions, totalH, W, fogged){
 if(zonePositions.length === 0) return '';
 // Pour le calcul de la bbox du blob, exclure les zones marquées "détachées"
 // (ex: Île Mystérieuse, qui doit rester franchement hors du continent CM2).
 // Le sentier doré, lui, traverse toutes les positions sans exclusion.
 const blobZones = zonePositions.filter(p => !p.excludeFromBlob);
 if(blobZones.length === 0) return '';
 const xs = blobZones.map(p=>p.x);
 const ys = blobZones.map(p=>p.y);
 const minX = Math.min(...xs) - 70;
 const maxX = Math.max(...xs) + 70;
 const minY = Math.min(...ys) - 50;
 const maxY = Math.max(...ys) + 60;
 const cx = (minX + maxX) / 2;
 const cy = (minY + maxY) / 2;
 const w = maxX - minX;
 const h = maxY - minY;
 // Génère un blob organique selon la forme
 const blobPath = _generateBlobPath(shape, cx, cy, w, h);
 // Couleurs et textures selon la région
 const styles = {
  cp:    { fill:'url(#archGradCP)',    stroke:'#2c5a1c', deco:['🌾','🌻','🦋','🐝'] },
  ce1:   { fill:'url(#archGradCE1)',   stroke:'#0a2418', deco:['🌳','🍄','🌿','🐌'] },
  ce2:   { fill:'url(#archGradCE2)',   stroke:'#5e3208', deco:['🌵','🏺','🦅','💨'] },
  cm1:   { fill:'url(#archGradCM1)',   stroke:'#1a3a5a', deco:['❄️','🏰','🗡️','💎'] },
  cm2:   { fill:'url(#archGradCM2)',   stroke:'#1a0530', deco:['✨','🌟','🪐','👽'] },
  final: { fill:'url(#archGradFinal)', stroke:'#8b6914', deco:['⛩️','🌟','✨','💫'] },
 };
 const st = styles[regionId] || styles.cp;
 // Ajout de quelques décorations thématiques posées sur l'îlot
 const decoElements = [];
 const decoCount = Math.min(6, st.deco.length * 2);
 for(let i=0;i<decoCount;i++){
  const angle = (i / decoCount) * Math.PI * 2;
  const dx = cx + Math.cos(angle) * (w * 0.32);
  const dy = cy + Math.sin(angle) * (h * 0.32);
  const emoji = st.deco[i % st.deco.length];
  decoElements.push(`<text x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" font-size="14" opacity="0.5" text-anchor="middle">${emoji}</text>`);
 }
 return `<g class="archipel-island-svg${fogged?' fogged':''}" data-region="${regionId}"><path d="${blobPath}" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.5" stroke-opacity="0.45" opacity="0.93"/>${decoElements.join('')}</g>`;
}

// Génère un blob organique selon la forme demandée
function _generateBlobPath(shape, cx, cy, w, h){
 // 8 points autour du centre, avec variations radiales selon la forme
 const points = 12;
 const pts = [];
 // Profils de variations pour chaque forme (12 valeurs entre ~0.88 et 1.2).
 // Les creux les plus profonds (0.7-0.75) ont été adoucis vers 0.88-0.92 :
 // les zones first/last d'une région tombent naturellement aux positions HAUT/BAS du blob,
 // où les profils avaient des creux qui faisaient déborder les nœuds hors de l'îlot.
 const profiles = {
  colline:    [1.1, 1.15, 1.2, 1.15, 1.0, 0.92, 0.88, 0.92, 0.95, 1.0, 1.1, 1.15],
  feuille:    [0.9, 0.95, 1.1, 1.2, 1.15, 0.95, 0.9, 0.95, 1.1, 1.2, 1.15, 0.95],
  dune:       [1.0, 1.15, 1.2, 1.1, 0.95, 0.92, 0.88, 0.92, 0.95, 1.1, 1.2, 1.15],
  citadelle:  [1.15, 0.9, 1.2, 0.9, 1.15, 0.9, 1.2, 0.9, 1.15, 0.9, 1.2, 0.9],
  nebuleuse:  [1.18, 0.95, 1.15, 0.92, 1.18, 0.95, 1.15, 0.92, 1.18, 0.95, 1.15, 0.92],
  mandala:    [1.1, 1.0, 1.1, 1.0, 1.1, 1.0, 1.1, 1.0, 1.1, 1.0, 1.1, 1.0],
 };
 const prof = profiles[shape] || profiles.colline;
 for(let i=0;i<points;i++){
  const angle = (i / points) * Math.PI * 2 - Math.PI/2;
  const r = prof[i % prof.length];
  const px = cx + Math.cos(angle) * (w/2) * r;
  const py = cy + Math.sin(angle) * (h/2) * r;
  pts.push([px, py]);
 }
 // Construire un path avec courbes Q lissées
 let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} `;
 for(let i=1;i<=points;i++){
  const cur = pts[i % points];
  const prev = pts[i-1];
  const mx = (prev[0] + cur[0]) / 2;
  const my = (prev[1] + cur[1]) / 2;
  d += `Q ${prev[0].toFixed(1)},${prev[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} `;
 }
 d += 'Z';
 return d;
}

// ─── v8.7.26 (O3-B.1bis) : Animation pas-à-pas multi-segments ───
// L'avatar est le personnage du joueur sur la carte. À chaque clic sur une zone
// (carte mondiale) ou une étape (modale zoom), il parcourt le sentier réel jusqu'à
// destination, puis le contenu s'ouvre. Skip au clic = téléport + ouverture immédiate.
//
// Compromis 1 (accélération adaptative) PAR SEGMENT :
//   duréeTotale = min(5000ms, N × 500ms)   où N = nombre de cases (≈ 1 case / 30px)
//   duréeParCase = max(80ms, duréeTotale / N)   ← floor de sécurité
// Persistance : mapAvatarZone est saved DÈS LE DÉBUT de l'animation (cohérence si crash).

let _mapAvatarAnimRunning = false;
let _mapAvatarSkipRequested = false;

// Échantillonne un segment Q-curve en un path SVG temporaire ; retourne le path DOM
// et sa longueur, à utiliser via getPointAtLength.
function _archMakeSegmentPath(prev, cur, segIdx){
 const dx = cur.x - prev.x;
 const dy = cur.y - prev.y;
 const dist = Math.sqrt(dx*dx + dy*dy) || 1;
 const perpX = -dy / dist;
 const perpY = dx / dist;
 const dir = (segIdx % 2 === 0) ? 1 : -1;
 // Note : on utilise cur.zone.id si dispo (carte mondiale), sinon un fallback
 const hashKey = (cur.zone && cur.zone.id) ? cur.zone.id : ('s'+segIdx);
 const ampPx = (60 + _archHash(hashKey, segIdx) * 50) * dir;
 const cpX = (prev.x + cur.x) / 2 + perpX * ampPx;
 const cpY = (prev.y + cur.y) / 2 + perpY * ampPx * 0.4;
 const NS = 'http://www.w3.org/2000/svg';
 const tmpSvg = document.createElementNS(NS, 'svg');
 tmpSvg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none;';
 const tmpPath = document.createElementNS(NS, 'path');
 tmpPath.setAttribute('d', `M ${prev.x} ${prev.y} Q ${cpX} ${cpY} ${cur.x} ${cur.y}`);
 tmpSvg.appendChild(tmpPath);
 document.body.appendChild(tmpSvg);
 return { svg: tmpSvg, path: tmpPath, length: tmpPath.getTotalLength() };
}

// Anime un avatar (DOM element) le long d'une LISTE de segments (multi-zones).
// `viewportW` = largeur logique du viewBox SVG (pour convertir x→xPct).
// `containerSel` = sélecteur du conteneur sur lequel poser le skip handler.
// Retourne une Promise résolue quand l'animation est finie (terminée ou skippée).
function _animateAlongSegments(avatarEl, segmentPositions, viewportW, containerSel){
 return new Promise(resolve => {
  if(_mapAvatarAnimRunning){ resolve(); return; }
  if(!avatarEl || segmentPositions.length < 2){ resolve(); return; }
  _mapAvatarAnimRunning = true;
  _mapAvatarSkipRequested = false;
  // v8.7.35 (O3-B.3) : transports thématiques par région — uniquement sur la carte
  // mondiale (la modale zoom garde l'avatar du joueur, plus personnel).
  const _isMainMap = containerSel.indexOf('zoom') < 0;
  const _originalEmoji = avatarEl.textContent;
  // Préparer tous les paths à l'avance
  const segs = [];
  for(let i=1;i<segmentPositions.length;i++){
   segs.push({
    prev: segmentPositions[i-1],
    cur: segmentPositions[i],
    seg: _archMakeSegmentPath(segmentPositions[i-1], segmentPositions[i], i),
   });
  }
  // Position initiale sur le 1er point (au cas où l'avatar serait ailleurs)
  const first = segmentPositions[0];
  avatarEl.style.left = ((first.x / viewportW) * 100).toFixed(2) + '%';
  avatarEl.style.top = first.y.toFixed(1) + 'px';
  // Skip handler en capture sur le conteneur : tout clic = skip
  const cont = document.querySelector(containerSel);
  const skipHandler = (ev) => {
   ev.stopPropagation();
   ev.preventDefault();
   _mapAvatarSkipRequested = true;
  };
  if(cont) cont.addEventListener('click', skipHandler, { capture: true });
  // Helper scroll (seulement si l'avatar est dans la fenêtre principale, pas dans une modale)
  const scrollIfOutOfView = () => {
   const isInModal = containerSel.indexOf('zoom') >= 0;
   if(isInModal) return; // pas de scroll dans la modale (elle est en overlay)
   const r = avatarEl.getBoundingClientRect();
   const margin = 100;
   if(r.top < margin || r.bottom > window.innerHeight - margin){
    avatarEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
   }
  };
  const cleanup = () => {
   _mapAvatarAnimRunning = false;
   _mapAvatarSkipRequested = false;
   if(cont) cont.removeEventListener('click', skipHandler, { capture: true });
   segs.forEach(s => { if(s.seg.svg.parentNode) s.seg.svg.parentNode.removeChild(s.seg.svg); });
   // v8.7.35 : restaurer l'emoji original (P.avatar) en fin d'animation,
   // y compris en cas de skip ou d'erreur (toujours appelé via finally).
   if(_isMainMap) avatarEl.textContent = _originalEmoji;
  };
  (async function loop(){
   // v8.7.40 (O3-C.1) : suivi de la région courante pour détecter les franchissements
   // de frontière entre îlots (et déclencher la bannière de biome correspondante).
   let _lastRegionId = segmentPositions[0] && segmentPositions[0].regionId;
   try{
    for(const s of segs){
     if(_mapAvatarSkipRequested) break;
     // v8.7.40 (O3-C.1) : Si on entre dans une nouvelle région, afficher la
     // bannière calligraphique du biome. Non-bloquant : l'animation continue
     // pendant que la bannière apparaît, ce qui donne un effet "voyage" naturel.
     if(_isMainMap && s.cur && s.cur.regionId && s.cur.regionId !== _lastRegionId){
      if(typeof _showBiomeBanner === 'function'){
       try{ _showBiomeBanner(s.cur.regionId); }catch(e){}
      }
      _lastRegionId = s.cur.regionId;
     }
     // v8.7.35 : avant chaque segment, adapter l'emoji au transport de la région
     // de DESTINATION. La région CHANGE quand on franchit la frontière entre îlots
     // → l'avatar prend le nouveau mode de transport dès qu'il entre dans la région.
     if(_isMainMap && s.cur && s.cur.regionId){
      const transport = _REGION_TRANSPORTS[s.cur.regionId];
      if(transport) avatarEl.textContent = transport;
     }
     const totalLen = s.seg.length;
     const N = Math.max(2, Math.round(totalLen / 30));
     const totalMs = Math.min(5000, N * 500);
     const dtMs = Math.max(80, Math.round(totalMs / N));
     for(let step = 1; step <= N; step++){
      if(_mapAvatarSkipRequested) break;
      const pt = s.seg.path.getPointAtLength((step / N) * totalLen);
      avatarEl.style.left = ((pt.x / viewportW) * 100).toFixed(2) + '%';
      avatarEl.style.top = pt.y.toFixed(1) + 'px';
      if(step % 3 === 0) scrollIfOutOfView();
      await new Promise(r => setTimeout(r, dtMs));
     }
    }
    // Position finale forcée (utile si skip)
    const last = segmentPositions[segmentPositions.length - 1];
    avatarEl.style.left = ((last.x / viewportW) * 100).toFixed(2) + '%';
    avatarEl.style.top = last.y.toFixed(1) + 'px';
    scrollIfOutOfView();
   }catch(e){
    console.warn('Avatar anim error', e);
   }finally{
    cleanup();
    resolve();
   }
  })();
 });
}

// Wrapper public : déplace l'avatar de la carte mondiale vers la zone cliquée,
// puis ouvre la modale zoom. Multi-segments : parcourt tout le sentier réel.
function requestZoneOpen(zoneId){
 if(_mapAvatarAnimRunning) return; // ignore les clics pendant une anim en cours
 const targetZone = MAP_ZONES.find(z => z.id === zoneId);
 if(!targetZone) return;
 const currentZoneId = _getAvatarZone();
 if(currentZoneId === zoneId){
  // Déjà sur place, ouvrir directement
  openArchipelZoom(zoneId);
  return;
 }
 const layout = _computeArchipelLayout();
 const { positions, W } = layout;
 const iFrom = positions.findIndex(p => p.zone.id === currentZoneId);
 const iTo = positions.findIndex(p => p.zone.id === zoneId);
 if(iFrom < 0 || iTo < 0){
  // Avatar perdu / zone invalide → ouvrir directement sans anim
  openArchipelZoom(zoneId);
  return;
 }
 // Construire la séquence de positions traversées (en avant ou en arrière)
 const step = iFrom < iTo ? 1 : -1;
 const seqPositions = [];
 for(let i = iFrom; i !== iTo + step; i += step){
  seqPositions.push(positions[i]);
 }
 // Save destination immédiatement (cohérence si app fermée pendant l'anim)
 _setAvatarZone(zoneId);
 if(typeof saveProfileNow === 'function') saveProfileNow();
 const avatarEl = document.querySelector('.archipel-avatar');
 if(!avatarEl){
  openArchipelZoom(zoneId);
  return;
 }
 _animateAlongSegments(avatarEl, seqPositions, W, '#map-zones').then(()=>{
  // Petite pause avant l'ouverture de la modale, pour que l'utilisateur voie l'avatar arrivé
  setTimeout(()=> openArchipelZoom(zoneId), 180);
 });
}

// Wrapper public : déplace l'avatar dans la modale zoom vers l'étape cliquée,
// puis lance l'étape. Multi-segments à l'intérieur de la zone.
function requestStepStart(zoneId, stepIdx){
 if(_mapAvatarAnimRunning) return;
 const zoomAv = document.querySelector('.archipel-zoom-avatar');
 if(!zoomAv){
  // Pas d'avatar visible → fallback direct
  startMapStep(zoneId, stepIdx);
  closeArchipelZoom();
  return;
 }
 const curStep = parseInt(zoomAv.dataset.curStep || '0', 10);
 const stepPositions = window._zoomStepPositions || [];
 const containerW = window._zoomStepContainerW || 320;
 if(stepIdx === curStep || stepPositions.length === 0){
  startMapStep(zoneId, stepIdx);
  closeArchipelZoom();
  return;
 }
 const iFrom = curStep, iTo = stepIdx;
 const step = iFrom < iTo ? 1 : -1;
 const seqPositions = [];
 for(let i = iFrom; i !== iTo + step; i += step){
  seqPositions.push(stepPositions[i]);
 }
 _animateAlongSegments(zoomAv, seqPositions, containerW, '#archipel-zoom-overlay').then(()=>{
  zoomAv.dataset.curStep = String(stepIdx);
  setTimeout(()=>{
   startMapStep(zoneId, stepIdx);
   closeArchipelZoom();
  }, 180);
 });
}

function renderMap(){
 const beaten = P.mapBossBeaten || [];
 const starsTotal = P.stars || 0;
 // Vérifier que l'avatar pointe vers une zone existante
 let avatarZoneId = _getAvatarZone();
 // Calculer le layout
 const layout = _computeArchipelLayout();
 const { positions, totalHeight, W } = layout;
 // v8.7.36+ (O3-B.4 strict) : un îlot est "foggé" tant qu'AUCUNE de ses zones n'est
 // accessible. Dès qu'au moins une zone devient canPlay (avatar peut entrer dans
 // l'îlot), TOUT l'îlot sort du brouillard d'un coup. L'effet englobe le SVG,
 // le nom de région, toutes les zones, et la boutique.
 const _islandFogged = {};
 _ARCH_REGIONS.forEach(r => {
  const zonesOfRegion = positions.filter(p => p.regionId === r.id);
  const anyAccessible = zonesOfRegion.some(p => _zoneReachable(p, beaten, starsTotal));
  // Une région complètement battue n'est jamais foggée (cas du joueur qui revient)
  const anyBeaten = zonesOfRegion.some(p => beaten.includes(p.zone.id));
  _islandFogged[r.id] = !anyAccessible && !anyBeaten;
 });
 // Construire le SVG global (sentier + îlots)
 const pathD = _buildArchipelPath(positions);
 // Grouper les positions par région pour générer les îlots
 const byRegion = {};
 positions.forEach(p => { (byRegion[p.regionId] = byRegion[p.regionId] || []).push(p); });
 // Générer les îlots SVG (avec flag fogged)
 const islandsSvg = _ARCH_REGIONS.map(r =>
  _renderIslandSvg(r.id, r.shape, byRegion[r.id] || [], totalHeight, W, _islandFogged[r.id])
 ).join('');
 // Noms de régions : recalculés plus bas, une fois les bboxes des îlots connus
 // (v9.0.0 : placement juste au-dessus de chaque îlot, sans chevauchement).
 let regionNamesHtml = '';
 // Générer les nœuds de zones
 const zonesHtml = positions.map(p=>{
  const z = p.zone;
  const idx = p.zoneIdx;
  const prev = idx===0 || beaten.includes(MAP_ZONES[idx-1].id);
  const done = beaten.includes(z.id);
  const canPlay = _zoneReachable(p, beaten, starsTotal);
  let cls = 'archipel-zone';
  if(done) cls += ' completed';
  else if(canPlay) cls += ' current';
  else cls += ' locked';
  if(_islandFogged[p.regionId]) cls += ' island-fogged';
  // Badge progression (étapes faites / total)
  let badgeHtml = '';
  if(canPlay && !done){
   const zp = (P.zoneProgress && P.zoneProgress[z.id]) || {stepsCompleted:0};
   const total = (z.steps && z.steps.length) || 5;
   if(zp.stepsCompleted > 0){
    badgeHtml = `<div class="archipel-zone-progress">${zp.stepsCompleted}/${total}</div>`;
   }
  }
  const checkHtml = done ? `<div class="archipel-zone-check">✓</div>` : '';
  // v8.7.39 (O3-B.5) : Trophée du boss vaincu sur la zone complétée.
  // Médaillon doré qui montre l'emoji du boss avec un anneau pulsant subtil.
  // Marqueur de fierté permanent sur la carte mondiale.
  const trophyHtml = done ? `<div class="archipel-zone-trophy" title="Boss vaincu : ${z.bossName||'Inconnu'}">${z.boss||'🏆'}</div>` : '';
  const lockHtml = (!canPlay && !done) ? `<div class="archipel-zone-lock">🔒</div>` : '';
  const reqHtml = (!canPlay && !done && prev) ? `<div class="archipel-zone-req">${z.starsReq}★</div>` : '';
  const onclick = canPlay ? `onclick="requestZoneOpen('${z.id}')"` : '';
  return `
   <div class="${cls}" style="left:${p.xPct.toFixed(1)}%;top:${p.y}px;" data-zone-id="${z.id}" ${onclick}>
    <div class="archipel-zone-circle">${z.emoji}${checkHtml}${lockHtml}</div>
    ${trophyHtml}
    <div class="archipel-zone-label">${z.label}</div>
    ${badgeHtml}${reqHtml}
   </div>`;
 }).join('');
 // v8.7.64 : couche de décors thématiques par zone (sous les nœuds)
 const zoneDecorHtml = (typeof _buildZoneDecorHtml==='function') ? _buildZoneDecorHtml(positions, _islandFogged, W) : '';
 // Avatar
 const avatarPos = positions.find(p => p.zone.id === avatarZoneId);
 const avatarHtml = avatarPos ?
  `<div class="archipel-avatar" style="left:${avatarPos.xPct.toFixed(1)}%;top:${avatarPos.y}px;">${(P&&P.avatar)||'🧙'}</div>` : '';
 // v8.7.27 : boutiques par îlot — 1 par région, positionnée à l'opposé du sentier doré.
 const _islandShopPos = {};
 const shopsHtml = _ARCH_REGIONS.map(region => {
  const shop = _ARCH_SHOPS[region.id];
  if(!shop) return '';
  // Calcul du centre du blob de cette région (mêmes zones que pour l'îlot)
  const zonesInRegion = positions.filter(p => p.regionId === region.id && !p.excludeFromBlob);
  if(zonesInRegion.length === 0) return '';
  const xs = zonesInRegion.map(p => p.x);
  const ys = zonesInRegion.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  // Application de l'offset configuré
  const shopX = cx + (shop.xPctOffset / 100) * W;
  const shopY = cy + shop.yShift;
  const shopXPct = (shopX / W) * 100;
  // v8.7.43 : mémoriser la position absolue de la boutique pour le placement des PNJ
  _islandShopPos[region.id] = { x: shopX, y: shopY };
  return `<div class="archipel-shop${_islandFogged[region.id]?' island-fogged':''}" data-theme="${shop.theme}" data-region="${region.id}"
              style="left:${shopXPct.toFixed(1)}%;top:${shopY.toFixed(1)}px;background:${shop.bg};border-color:${shop.accent};"
              onclick="openArchipelShop('${region.id}')">
            <div class="archipel-shop-emoji">${shop.emoji}</div>
            <div class="archipel-shop-label" style="color:${shop.accent};">${shop.name}</div>
          </div>`;
 }).join('');
 // v8.7.38 (O3-B.4 polish) : Overlay nuageux animé par-dessus chaque îlot foggé.
 // v8.7.41 (O3-C.2) : OU météo locale pour les îlots débloqués (papillons,
 // feuilles, flocons, étoiles, etc. selon le biome).
 // Calcul de bbox factorisé : utilisé pour les deux types d'overlay.
 const _islandBboxes = {};
 _ARCH_REGIONS.forEach(r => {
  const zonesOfRegion = (byRegion[r.id] || []).filter(p => !p.excludeFromBlob);
  if(zonesOfRegion.length === 0) return;
  const xs = zonesOfRegion.map(p => p.x);
  const ys = zonesOfRegion.map(p => p.y);
  const minX = Math.min(...xs) - 90;
  const maxX = Math.max(...xs) + 90;
  const minY = Math.min(...ys) - 70;
  const maxY = Math.max(...ys) + 80;
  _islandBboxes[r.id] = {
   leftPct: (minX / W) * 100,
   topPx:   minY,
   widthPct:((maxX - minX) / W) * 100,
   heightPx:(maxY - minY),
  };
 });
 _miniMapBboxes = _islandBboxes;  // v8.7.60 : exposé pour la navigation mini-map
 // v9.0.0 (demande 4) : placer chaque nom d'îlot juste au-dessus de SON îlot,
 // centré sur lui, sans chevaucher l'îlot ni ses lieux.
 regionNamesHtml = _ARCH_REGIONS.map(r => {
  const b = _islandBboxes[r.id];
  if(!b) return '';
  const foggedCls = _islandFogged[r.id] ? ' island-fogged' : '';
  const centerPct = b.leftPct + b.widthPct / 2;
  const ty = Math.max(4, b.topPx - 30);   // juste au-dessus du sommet de l'îlot
  return `<div class="archipel-region-name${foggedCls}" data-region="${r.id}" `
       + `style="left:${centerPct.toFixed(1)}%;top:${ty.toFixed(0)}px;">${r.label}</div>`;
 }).join('');
 const fogOverlaysHtml = _ARCH_REGIONS.map(r => {
  if(!_islandFogged[r.id]) return '';
  const b = _islandBboxes[r.id];
  if(!b) return '';
  return `<div class="archipel-fog-overlay" data-region="${r.id}" style="left:${b.leftPct.toFixed(1)}%;top:${b.topPx.toFixed(0)}px;width:${b.widthPct.toFixed(1)}%;height:${b.heightPx.toFixed(0)}px;"></div>`;
 }).join('');
 // v8.7.41 : météo locale sur les îlots débloqués uniquement.
 const weatherOverlaysHtml = _ARCH_REGIONS.map(r => {
  if(_islandFogged[r.id]) return ''; // les foggés ont déjà leurs nuages
  const b = _islandBboxes[r.id];
  if(!b) return '';
  return _buildWeatherOverlay(r.id, b);
 }).join('');
 // v8.7.42 (O3-C.3) : PNJ et figurants sur les îlots débloqués.
 const npcsOverlaysHtml = _ARCH_REGIONS.map(r => {
  if(_islandFogged[r.id]) return '';
  const b = _islandBboxes[r.id];
  if(!b) return '';
  return _buildNpcsOverlay(r.id, b, byRegion[r.id] || [], _islandShopPos[r.id], W);
 }).join('');
 // Assemblage final
 const cont = $('map-zones');
 if(!cont) return;
 cont.style.minHeight = totalHeight + 'px';
 cont.dataset.baseHeight = totalHeight;   // v8.7.49 : base pour le calcul du zoom
 cont.innerHTML = `
  <div class="archipel-stars"></div>
  <svg class="archipel-path-svg" viewBox="0 0 ${W} ${totalHeight}" preserveAspectRatio="none" style="height:${totalHeight}px;">
   <defs>
    <radialGradient id="archGradCP" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#a8e8a8"/><stop offset="100%" stop-color="#5dba5d"/></radialGradient>
    <radialGradient id="archGradCE1" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#3a8c5a"/><stop offset="100%" stop-color="#1b4d2e"/></radialGradient>
    <radialGradient id="archGradCE2" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#f4c578"/><stop offset="100%" stop-color="#c47a1f"/></radialGradient>
    <radialGradient id="archGradCM1" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#dfe6e9"/><stop offset="100%" stop-color="#74b9ff"/></radialGradient>
    <radialGradient id="archGradCM2" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#b074d4"/><stop offset="100%" stop-color="#3a0a4a"/></radialGradient>
    <radialGradient id="archGradFinal" cx="0.5" cy="0.5"><stop offset="0%" stop-color="#f1c40f"/><stop offset="100%" stop-color="#8b6914"/></radialGradient>
   </defs>
   ${islandsSvg}
   <path d="${pathD}" stroke="#f1c40f" stroke-width="3" fill="none" stroke-dasharray="6,4" opacity="0.78" stroke-linecap="round"/>
  </svg>
  ${regionNamesHtml}
  ${zoneDecorHtml}
  ${zonesHtml}
  ${shopsHtml}
  ${weatherOverlaysHtml}
  ${npcsOverlaysHtml}
  ${fogOverlaysHtml}
  ${avatarHtml}
 `;
 // Auto-centrer sur l'avatar après rendu
 setTimeout(()=>_autoCenterOnAvatar(), 50);
 // v8.7.49 : réappliquer le niveau de zoom courant (la box vient d'être recréée)
 if(typeof _applyMapZoom === 'function') _applyMapZoom();
 // v8.7.57 (O3-C.6) : à l'ouverture (depuis le menu), cadrer en douceur sur la région active
 if(_mapAutoFocus){
  _mapAutoFocus = false;
  setTimeout(()=>{ if(typeof _autoFocusActiveRegion==='function') _autoFocusActiveRegion(); }, 80);
 }
 // v8.7.48 (O3-C.5) : signature sonore de la région où se trouve l'avatar, jouée
 // à l'ouverture de la carte. Cooldown de 30s pour éviter la répétition si on
 // ouvre/ferme rapidement la carte.
 try{
  const avatarZone = MAP_ZONES.find(z => z.id === avatarZoneId);
  const avatarRegion = avatarZone
   ? ((typeof _regionOfZone==='function') ? _regionOfZone(avatarZone) : _ARCH_REGIONS.find(r => r.levels.includes(avatarZone.level)))
   : null;
  // v10.2.1 : la mini-carte et le livre se rafraîchissent TOUJOURS depuis l'état
  // courant (aventure active), même si l'avatar n'est pas localisé. Avant, ce
  // rafraîchissement était sauté → tiroirs figés sur l'ancienne aventure.
  _lastFog = _islandFogged;
  _lastActiveRegionId = avatarRegion ? avatarRegion.id : null;
  if(typeof _refreshMiniMap === 'function'){
   const ry = (avatarPos && totalHeight) ? (avatarPos.y / totalHeight) : null;
   _refreshMiniMap(_lastActiveRegionId, _islandFogged, ry, (P&&P.avatar)||'🧙');
  }
  if(typeof _refreshQuestJournal === 'function') _refreshQuestJournal(_islandFogged);
  if(avatarRegion){
   const now = Date.now();
   if(!_lastRegionSignatureTime || (now - _lastRegionSignatureTime) > 30000){
    _lastRegionSignatureTime = now;
    setTimeout(() => _playRegionSignature(avatarRegion.id), 350);
   }
  }
 }catch(e){}
}
let _lastFog = {};
let _lastActiveRegionId = null;
let _lastRegionSignatureTime = 0;

// Ouvre la vue zoomée d'une sous-zone (modale qui montre les 5 étapes)
function openArchipelZoom(zoneId){
 const zone = MAP_ZONES.find(z=>z.id===zoneId);
 if(!zone) return;
 // v8.7.25 (O3-B.1) : on n'avance plus l'avatar au clic sur une zone.
 // L'avatar marque maintenant la dernière zone CONQUISE (animation pas-à-pas après victoire boss).
 // Construire la vue zoomée
 const prog = (P.zoneProgress && P.zoneProgress[zoneId]) || { stepsCompleted: 0 };
 const steps = Array.isArray(zone.steps) ? zone.steps : [];
 const done = prog.stepsCompleted;
 // Couleur de fond de l'îlot zoomé selon le niveau de la zone
 const bgColors = {
  CP:  {top:'#a8e8a8', bot:'#2c5a1c'},
  CE1: {top:'#3a8c5a', bot:'#0a2418'},
  CE2: {top:'#f4c578', bot:'#5e3208'},
  CM1: {top:'#dfe6e9', bot:'#1a3a5a'},
  CM2: {top:'#b074d4', bot:'#1a0530'},
 };
 const bg = bgColors[zone.level] || bgColors.CP;
 // Layout des étapes : positions VRAIMENT VARIÉES selon la zone
 // - Côté de départ aléatoire (par zone, déterministe)
 // - Amplitude de bruit plus large
 // - Bruit Y important pour casser l'alignement vertical
 // - Pattern interne de la zone (zigzag franc, zigzag mou, courbe S, vague, étoile)
 const stepCount = steps.length;
 const stepPositions = [];
 const containerW = 480;
 const containerH = 340;
 const xMarginPct = 16;
 const yMargin = 40;
 // Caractéristiques globales de cette modale (déterminées par hash de l'id de zone)
 const startSide = _archHash(zoneId, 999) < 0.5 ? -1 : 1; // -1 = gauche, +1 = droite
 const patternType = Math.floor(_archHash(zoneId, 777) * 4); // 0..3 : 4 patterns différents
 const baseAmplitude = 18 + _archHash(zoneId, 555) * 15; // 18 à 33% d'amplitude
 const yJitter = _archHash(zoneId, 333) * 0.35; // 0 à 35% de jitter Y
 for(let i=0;i<stepCount;i++){
  const t = i / Math.max(1, stepCount-1);
  // Position Y : monte progressivement avec un bruit qui DÉPEND DE LA ZONE
  const ySpan = (containerH - 2*yMargin);
  const yLocalNoise = (_archHash(zoneId, i*7+11) - 0.5) * ySpan * yJitter;
  // Pour certains patterns, casser la stricte progression Y
  let yShift = 0;
  if(patternType === 1){ // pattern "vague" : Y oscille
   yShift = Math.sin(t * Math.PI * 2) * ySpan * 0.08;
  } else if(patternType === 2){ // pattern "accélération" : étapes serrées au début, espacées à la fin
   const tCurved = t * t;
   yShift = (tCurved - t) * ySpan;
  }
  const y = yMargin + ySpan * t + yLocalNoise + yShift;
  // Position X : différentes stratégies selon patternType
  let xPct;
  if(patternType === 0){
   // Zigzag classique mais avec côté de départ déterminé par la zone
   const direction = ((i % 2 === 0) ? startSide : -startSide);
   const center = 50 + direction * baseAmplitude * 0.7;
   const xNoise = (_archHash(zoneId, i*13+3) - 0.5) * baseAmplitude * 0.6;
   xPct = center + xNoise;
  } else if(patternType === 1){
   // Pattern "vague" : courbe sinusoïdale en X
   const phase = _archHash(zoneId, 222) * Math.PI * 2;
   xPct = 50 + Math.sin(t * Math.PI * 2 + phase) * baseAmplitude;
  } else if(patternType === 2){
   // Pattern "drift" : tendance globale gauche→droite ou droite→gauche
   const drift = startSide * (t - 0.5) * baseAmplitude * 2;
   const xNoise = (_archHash(zoneId, i*17+5) - 0.5) * baseAmplitude * 1.0;
   xPct = 50 + drift + xNoise;
  } else {
   // Pattern "chaotique" : positions vraiment aléatoires (mais déterministes)
   const xNoise = (_archHash(zoneId, i*23+7) - 0.5) * baseAmplitude * 2.4;
   xPct = 50 + xNoise;
  }
  xPct = Math.max(xMarginPct, Math.min(100 - xMarginPct, xPct));
  const x = (xPct / 100) * containerW;
  stepPositions.push({x, y, xPct});
 }
 // Sentier rouge SINUEUX entre les étapes (courbes de Bézier excentrées)
 let stepPathD = '';
 if(stepPositions.length > 0){
  stepPathD = `M ${stepPositions[0].x.toFixed(1)},${stepPositions[0].y.toFixed(1)} `;
  for(let i=1;i<stepPositions.length;i++){
   const prev = stepPositions[i-1];
   const cur = stepPositions[i];
   const dx = cur.x - prev.x;
   const dy = cur.y - prev.y;
   const dist = Math.sqrt(dx*dx + dy*dy);
   const perpX = -dy / (dist || 1);
   const perpY = dx / (dist || 1);
   const dir = (i % 2 === 0) ? 1 : -1;
   const ampPx = (40 + _archHash(zoneId, i*5) * 35) * dir;
   const cpX = (prev.x + cur.x) / 2 + perpX * ampPx;
   const cpY = (prev.y + cur.y) / 2 + perpY * ampPx * 0.3;
   stepPathD += `Q ${cpX.toFixed(1)},${cpY.toFixed(1)} ${cur.x.toFixed(1)},${cur.y.toFixed(1)} `;
  }
 }
 // HTML des étapes
 // v8.7.26 (O3-B.1bis) : le clic sur une étape déclenche l'animation de l'avatar
 // dans la modale (multi-segments le long du sentier rouge interne), puis lance
 // l'étape à l'arrivée. L'avatar est positionné par défaut sur stepsCompleted
 // (l'étape suivante à jouer, ou la dernière si zone terminée).
 const TAGS = { monster:'Monstre', puzzle:'Énigme', minibss:'Mini-boss', boss:'BOSS' };
 const stepsHtml = steps.map((s, i)=>{
  const p = stepPositions[i];
  let cls = 'archipel-zoom-step';
  if(i < done) cls += ' completed';
  else if(i === done) cls += ' current';
  else cls += ' locked';
  if(s.type === 'boss') cls += ' boss';
  const click = (i <= done) ? `onclick="requestStepStart('${zoneId}',${i})"` : '';
  return `
   <div class="${cls}" style="left:${p.xPct.toFixed(1)}%;top:${p.y}px;" ${click}>
    <div class="archipel-zoom-step-circle">${s.emoji||'❓'}</div>
    <div class="archipel-zoom-step-label">Étape ${i+1}</div>
    <div class="archipel-zoom-step-name">${s.name||TAGS[s.type]||''}</div>
   </div>`;
 }).join('');
 // Avatar dans la modale : position initiale = étape "current" (= done si zone non terminée,
 // sinon la dernière étape). Bornée à [0, stepCount-1].
 const avatarStepIdx = Math.max(0, Math.min(stepCount - 1, done));
 const avatarStepPos = stepPositions[avatarStepIdx];
 const zoomAvatarHtml = avatarStepPos ?
  `<div class="archipel-zoom-avatar" data-cur-step="${avatarStepIdx}" style="left:${avatarStepPos.xPct.toFixed(1)}%;top:${avatarStepPos.y}px;">${(P&&P.avatar)||'🧙'}</div>` : '';
 // Exposer les positions des étapes pour _animateAlongSegments (utilisé par requestStepStart)
 window._zoomStepPositions = stepPositions;
 window._zoomStepContainerW = containerW;
 const total = stepCount;
 const overlay = document.createElement('div');
 overlay.className = 'archipel-zoom-overlay';
 overlay.id = 'archipel-zoom-overlay';
 overlay.onclick = function(e){ if(e.target === overlay) closeArchipelZoom(); };
 overlay.innerHTML = `
  <div class="archipel-zoom-content" style="--zone-bg-top:${bg.top};--zone-bg-bot:${bg.bot};">
   <button class="archipel-zoom-close" onclick="closeArchipelZoom()">✕</button>
   <div class="archipel-zoom-header">
    <div style="font-size:2em;line-height:1;">${zone.emoji}</div>
    <div class="archipel-zoom-title">${zone.label}</div>
    <div class="archipel-zoom-sub">${zone.level} · ${done}/${total} étapes franchies</div>
    ${(P.mapBossBeaten||[]).includes(zoneId) ? `
    <div class="archipel-zoom-trophy-banner" title="Zone conquise">
     <span class="archipel-zoom-trophy-emoji">${zone.boss||'🏆'}</span>
     <span class="archipel-zoom-trophy-text">
      <span class="archipel-zoom-trophy-title">BOSS VAINCU</span>
      <span class="archipel-zoom-trophy-name">${zone.bossName||''}</span>
     </span>
     <span class="archipel-zoom-trophy-medal">🏆</span>
    </div>` : ''}
   </div>
   <div class="archipel-zoom-steps" style="height:${containerH+20}px;">
    <div class="archipel-zoom-scene">${(typeof _buildZoomSceneHtml==='function')?_buildZoomSceneHtml(zoneId, zone, stepPositions, containerW, containerH+20):''}</div>
    <svg class="archipel-zoom-path-svg" viewBox="0 0 ${containerW} ${containerH+20}" preserveAspectRatio="none">
     <path d="${stepPathD}" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-dasharray="5,3" opacity="0.85" stroke-linecap="round"/>
    </svg>
    ${stepsHtml}
    ${zoomAvatarHtml}
   </div>
  </div>`;
 document.body.appendChild(overlay);
}

function closeArchipelZoom(){
 const el = document.getElementById('archipel-zoom-overlay');
 if(el) el.remove();
}

// Action point d'entrée (legacy compat) — anime aussi maintenant
function onMapNodeClick(zoneId){
 requestZoneOpen(zoneId);
}

// Toggle d'une région (legacy compat, désactivé en O3)
function toggleRegion(regionId){ /* no-op en mode Archipel */ }

// ─── v8.7.27 : Boutiques par îlot ───
// Ouvre une modale boutique stylisée selon le thème de la région.
// Contient les mêmes items que la boutique du tableau de bord :
//   - Skills (Armure, Puissance, Sablier) achetables jusqu'à Niv.3
//   - Items consommables (Potion, Bombe)
// Tarif identique au dashboard, paiement en étoiles ⭐.
// v8.7.28 : refactor pour utiliser addEventListener (fix bouton X qui ne fonctionnait pas).
function openArchipelShop(regionId){
 const shop = _ARCH_SHOPS[regionId];
 if(!shop){ return; }
 // Skills disponibles : structure identique à renderSkills()
 const SKILL_DEFS = [
  ['shield', '🛡️', 'Armure',    '+1 ❤️ max'],
  ['sword',  '⚔️', 'Puissance', '+2 pts par bonne réponse'],
  ['clock',  '⏳', 'Sablier',   '+5 secondes par question'],
 ];
 const skillsHtml = SKILL_DEFS.map(([id, emoji, name, desc]) => {
  const lvl = (P.skills && P.skills[id]) || 0;
  const maxed = lvl >= 3;
  const price = (lvl + 1) * 20;
  const btn = maxed
   ? `<button class="shop-buy-btn" disabled style="background:#7f8c8d;">MAX</button>`
   : `<button class="shop-buy-btn" data-action="buy-skill" data-id="${id}" style="background:${shop.accent};">${price} ⭐</button>`;
  return `<div class="shop-row">
    <div class="shop-row-icon">${emoji}</div>
    <div class="shop-row-body">
     <div class="shop-row-name">${name} <span class="shop-row-lvl">Niv.${lvl}</span></div>
     <div class="shop-row-desc">${desc}</div>
    </div>
    ${btn}
   </div>`;
 }).join('');
 const ITEM_DEFS = [
  ['potion', '🧪', 'Potion de Vie',  'Restaure +1 ❤️ pendant la partie',                10],
  ['bomb',   '💣', 'Bombe Réponse', 'Répond automatiquement à la question en cours',    20],
 ];
 const itemsHtml = ITEM_DEFS.map(([id, emoji, name, desc, price]) => {
  const owned = (P.inventory && P.inventory[id]) || 0;
  return `<div class="shop-row">
    <div class="shop-row-icon">${emoji}</div>
    <div class="shop-row-body">
     <div class="shop-row-name">${name} <span class="shop-row-lvl">×${owned}</span></div>
     <div class="shop-row-desc">${desc}</div>
    </div>
    <button class="shop-buy-btn" data-action="buy-item" data-id="${id}" data-price="${price}" style="background:${shop.accent};">${price} ⭐</button>
   </div>`;
 }).join('');
 // Solde étoiles courant
 const stars = (P && P.stars) || 0;
 // Construction overlay
 const existing = document.getElementById('archipel-shop-overlay');
 if(existing) existing.remove();
 const overlay = document.createElement('div');
 overlay.className = 'archipel-shop-overlay';
 overlay.id = 'archipel-shop-overlay';
 overlay.innerHTML = `
  <div class="archipel-shop-content" data-theme="${shop.theme}" style="background:${shop.bg};border-color:${shop.accent};">
   <button class="archipel-shop-close" data-action="close" style="color:${shop.accent};">✕</button>
   <div class="archipel-shop-header">
    <div class="archipel-shop-header-emoji">${shop.emoji}</div>
    <div class="archipel-shop-header-title" style="color:${shop.accent};">${shop.name}</div>
    <div class="archipel-shop-header-stars">${stars} ⭐</div>
   </div>
   <div class="archipel-shop-section">
    <div class="archipel-shop-section-title" style="color:${shop.accent};">✨ Améliorations</div>
    ${skillsHtml}
   </div>
   <div class="archipel-shop-section">
    <div class="archipel-shop-section-title" style="color:${shop.accent};">🧰 Objets</div>
    ${itemsHtml}
   </div>
  </div>`;
 document.body.appendChild(overlay);
 // v8.7.28 : tous les handlers via addEventListener (au lieu de onclick inline)
 // pour éviter les problèmes de bubble / scope global.
 // Fermeture au clic sur le fond (en dehors de la modale)
 overlay.addEventListener('click', (e) => {
  if(e.target === overlay) closeArchipelShop();
 });
 // Boutons internes : close, buy-skill, buy-item
 const closeBtn = overlay.querySelector('[data-action="close"]');
 if(closeBtn){
  closeBtn.addEventListener('click', (e) => {
   e.stopPropagation();
   closeArchipelShop();
  });
 }
 overlay.querySelectorAll('[data-action="buy-skill"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
   e.stopPropagation();
   const id = btn.dataset.id;
   if(!id) return;
   buySkill(id);
   // Rerender la modale pour refléter le nouveau niveau / solde
   openArchipelShop(regionId);
  });
 });
 overlay.querySelectorAll('[data-action="buy-item"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
   e.stopPropagation();
   const id = btn.dataset.id;
   const price = parseInt(btn.dataset.price, 10) || 0;
   if(!id) return;
   buyItem(id, price);
   openArchipelShop(regionId);
  });
 });
}
function closeArchipelShop(){
 const el = document.getElementById('archipel-shop-overlay');
 if(el) el.remove();
}

// ═══ ZOOM ADAPTATIF (carte mondiale, conservé) ═══
let _mapZoom = 'default';
function _applyMapZoom(){
 const cont = $('map-zones');
 if(!cont) return;
 cont.classList.remove('zoom-overview','zoom-default','zoom-close','zoom-veryclose');
 cont.classList.add('zoom-'+_mapZoom);
 // v8.7.49 : ajuster la hauteur de la box pour que le scroll de page suive le scale.
 // transform:scale ne modifie pas la box → sans ça, en vue rapprochée le bas serait
 // coupé, et en vue d'ensemble il resterait un grand vide.
 const scale = _mapZoom==='overview' ? 0.62
             : _mapZoom==='close'    ? 1.3
             : _mapZoom==='veryclose'? 1.9
             : 1;
 let baseH = parseFloat(cont.dataset.baseHeight || '0');
 if(!baseH){
  baseH = parseFloat(cont.style.minHeight) || 1200;
  cont.dataset.baseHeight = baseH;
 }
 cont.style.height = (baseH * scale) + 'px';
 cont.style.minHeight = (baseH * scale) + 'px';  // sinon min-height bloque le rétrécissement en vue d'ensemble
 const lbl = $('map-zoom-label');
 if(lbl){
  lbl.textContent = _mapZoom==='overview' ? 'Vue d\'ensemble'
                  : _mapZoom==='close'    ? 'Vue rapprochée'
                  : _mapZoom==='veryclose'? 'Vue détaillée'
                  : 'Vue régions';
 }
}
// v8.7.59 (O3-C.6.2) : MINI-MAP — vignette verticale des régions sous le carnet.
// Montre les 6 régions empilées (haut→bas), grise les verrouillées, marque la
// région active, et permet de sauter à une région débloquée d'un clic.
function _refreshMiniMap(avatarRegionId, foggedMap, avatarRatioY, avatarEmoji){
 const mm = document.getElementById('minimap-body');
 if(!mm) return;
 const rows = _ARCH_REGIONS.map(r => {
  const meta = _BIOME_BANNER_META[r.id] || {};
  const fogged = !!(foggedMap && foggedMap[r.id]);
  const active = (r.id === avatarRegionId);
  return `<div class="drawer-row${fogged?' locked':''}${active?' active':''}" style="--row-c:${meta.accent||'#888'};" `
    + (fogged?'':`onclick="_miniMapGoTo('${r.id}')"`) + ` role="button" title="${r.label}${fogged?' (verrouillé)':''}">`
    + `<div class="drawer-row-badge">${fogged?'🔒':(meta.emoji||'•')}</div>`
    + `<div class="drawer-row-label">${r.label}${active?' <span class="drawer-row-sub">• ici</span>':''}</div>`
    + `</div>`;
 }).join('');
 mm.innerHTML = rows;
}
function _miniMapGoTo(regionId){
 try{
  const bb = (typeof _miniMapBboxes !== 'undefined') ? _miniMapBboxes[regionId] : null;
  const cont = document.getElementById('map-zones');
  if(bb && cont){
   // Marqueur temporaire au centre de l'îlot (coords non-scalées), puis scrollIntoView.
   // scrollIntoView fonctionne quel que soit le conteneur de défilement (≠ window.scrollTo).
   const marker = document.createElement('div');
   marker.style.cssText = `position:absolute;left:50%;top:${(bb.topPx + bb.heightPx/2)}px;width:1px;height:1px;pointer-events:none;`;
   cont.appendChild(marker);
   marker.scrollIntoView({behavior:'smooth', block:'center'});
   setTimeout(()=>{ try{ marker.remove(); }catch(e){} }, 900);
   return;
  }
  // Repli : centrer le nom de région
  const el = document.querySelector(`.archipel-region-name[data-region="${regionId}"]`);
  if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
 }catch(e){}
}
function mapZoomIn(){
 _mapZoom = _mapZoom==='overview' ? 'default'
          : _mapZoom==='default'  ? 'close'
          : 'veryclose';
 _applyMapZoom();
}
// v8.7.57 (O3-C.6) : focus caméra cinématique sur la région active à l'ouverture.
// La carte s'ouvre en vue d'ensemble puis « plonge » (zoom) sur la région de l'avatar.
let _mapAutoFocus = false;
let _miniMapBboxes = {};  // v8.7.60 : bbox des îlots pour la navigation mini-map
function _autoFocusActiveRegion(){
 try{
  const cont = $('map-zones');
  // 1) Vue d'ensemble : on voit tout le monde (1,5s)
  _mapZoom = 'overview';
  _applyMapZoom();
  setTimeout(()=>_autoCenterOnAvatar(true), 80);
  // 2) Puis zoom-in très progressif sur la région active.
  //    La classe .map-cinematic applique une transition longue et douce,
  //    sans ralentir les boutons loupe (qui gardent la transition standard).
  setTimeout(()=>{
   if(cont) cont.classList.add('map-cinematic');
   _mapZoom = 'close';
   _applyMapZoom();
   setTimeout(()=>_autoCenterOnAvatar(true), 900);
   setTimeout(()=>{ if(cont) cont.classList.remove('map-cinematic'); }, 2300);
  }, 1500);
 }catch(e){}
}
function mapZoomOut(){
 _mapZoom = _mapZoom==='veryclose' ? 'close'
          : _mapZoom==='close'     ? 'default'
          : 'overview';
 _applyMapZoom();
}
function mapCenterOnAvatar(){
 _autoCenterOnAvatar(true);
}
// v8.7.62 (O3-C.6.4) : aller à la prochaine zone jouable (objectif suivant).
// Centre la première zone « current » (débloquée mais pas encore terminée) et la
// met en valeur quelques secondes pour guider le joueur vers son prochain défi.
function mapGoToNextZone(){
 try{
  const zones = Array.from(document.querySelectorAll('.archipel-zone.current'));
  if(zones.length === 0){
   // Plus aucune zone jouable disponible : recentrer sur l'avatar
   _autoCenterOnAvatar(true);
   if(typeof toast === 'function') toast('Tu es à jour ! Débloque plus d\'étoiles pour la suite ⭐');
   return;
  }
  const target = zones[0]; // première dans l'ordre de progression
  target.scrollIntoView({behavior:'smooth', block:'center'});
  target.classList.add('zone-highlight-pulse');
  setTimeout(()=>{ try{ target.classList.remove('zone-highlight-pulse'); }catch(e){} }, 2600);
  if(typeof beep === 'function'){ try{ beep(660,'sine',.12,.06); setTimeout(()=>beep(880,'sine',.14,.06),90); }catch(e){} }
 }catch(e){}
}
function _autoCenterOnAvatar(force){
 try{
  const avatar = document.querySelector('.archipel-avatar');
  if(!avatar) return;
  const rect = avatar.getBoundingClientRect();
  if(force || rect.top < 60 || rect.bottom > window.innerHeight - 60){
   avatar.scrollIntoView({behavior:'smooth', block:'center', inline:'center'});
  }
 }catch(e){}
}




// ──────────────────────────────────────────────────────────────────────
// MOTEUR PARALLAXE (chantier B3)
// ──────────────────────────────────────────────────────────────────────
// Trois sources de mouvement combinées :
//  1) Scroll vertical → translation Y des couches à vitesses différentes
//  2) Souris (desktop) → translation X selon la position du curseur
//  3) Accéléromètre (mobile) → translation X selon l'inclinaison du téléphone
// La couche du ciel s'anime en couleur selon la zone visible au centre du viewport
// (Intersection Observer). Tout est désactivé proprement si la pref est OFF.

const _MP = {
 active: false,
 layers: null,            // {sky, stars, mountainsFar, mountainsNear, foreground}
 currentZoneId: null,
 io: null,                // IntersectionObserver
 rafId: null,
 mouseX: 0,               // -1..1
 mouseY: 0,               // -1..1
 tiltX: 0,                // -1..1 depuis l'accéléromètre
 scrollY: 0,
 scrollEl: null,
 onScroll: null, onMouse: null, onTilt: null, onResize: null,
};

/**
 * Initialise la parallaxe sur la carte. Idempotent : safe à appeler plusieurs fois.
 */
function initMapParallax(){
 // Toujours peindre les couches (même statiques) pour avoir le ciel/montagnes
 _MP.layers = {
  sky:           document.querySelector('#map-parallax .mp-sky'),
  stars:         document.querySelector('#map-parallax .mp-stars'),
  mountainsFar:  document.querySelector('#map-parallax .mp-mountains-far'),
  mountainsNear: document.querySelector('#map-parallax .mp-mountains-near'),
  foreground:    document.querySelector('#map-parallax .mp-foreground'),
 };
 if(!_MP.layers.sky) return;
 _paintParallaxStatic();
 _setupZoneObserver();
 // v9.0.4 (anti-jank) : sur petit écran / tactile, on garde le décor STATIQUE
 // mais on coupe le mouvement au scroll (source de reflows et de saccades).
 const _smallOrTouch = (window.innerWidth <= 768) ||
   (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
 // Mouvement actif uniquement si toggle ON, pas reduced-motion, et pas petit/tactile
 const enabled = (typeof getParallaxEnabled==='function') ? getParallaxEnabled() : true;
 if(enabled && !_smallOrTouch){
  _attachMotionListeners();
  _MP.active = true;
 }
}

/**
 * Démontage propre. Appelé au returnMenu et au closeMap.
 */
function teardownMapParallax(){
 _detachMotionListeners();
 if(_MP.io){ try{_MP.io.disconnect();}catch(e){} _MP.io = null; }
 if(_MP.rafId){ cancelAnimationFrame(_MP.rafId); _MP.rafId = null; }
 _MP.active = false;
}

/**
 * Réagit à un changement de toggle pendant que la carte est ouverte.
 */
function refreshParallaxState(){
 if(document.getElementById('v-map')?.classList.contains('hidden')) return;
 const enabled = (typeof getParallaxEnabled==='function') ? getParallaxEnabled() : true;
 if(enabled && !_MP.active){
  _attachMotionListeners();
  _MP.active = true;
 } else if(!enabled && _MP.active){
  _detachMotionListeners();
  // Reset des transforms
  ['stars','mountainsFar','mountainsNear','foreground'].forEach(k=>{
   if(_MP.layers[k]) _MP.layers[k].style.transform = 'translate3d(0,0,0)';
  });
  _MP.active = false;
 }
}

/**
 * Peint le contenu statique des couches (étoiles, silhouettes de montagnes,
 * éléments de premier plan). N'a pas besoin du mouvement.
 */
function _paintParallaxStatic(){
 // Couche étoiles : 30 points lumineux à positions pseudo-aléatoires stables
 if(_MP.layers.stars && !_MP.layers.stars.dataset.painted){
  const stars = [];
  for(let i=0;i<30;i++){
   const x = (i*37.13) % 100;
   const y = (i*23.7) % 100;
   const size = 1 + (i%3);
   const opacity = 0.3 + ((i*0.13) % 0.7);
   stars.push(`<span class="mp-star" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size}px;height:${size}px;opacity:${opacity.toFixed(2)};animation-delay:${(i*0.17).toFixed(2)}s;"></span>`);
  }
  _MP.layers.stars.innerHTML = stars.join('') + '<span class="mp-astro">☀️</span>';
  _MP.layers.stars.dataset.painted = '1';
 }
 // Montagnes : SVG inline (chaînes simples, le style donne la couleur)
 if(_MP.layers.mountainsFar && !_MP.layers.mountainsFar.dataset.painted){
  _MP.layers.mountainsFar.innerHTML = `<svg viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,200 L0,140 L80,90 L160,120 L240,70 L340,110 L440,60 L560,100 L660,75 L780,115 L880,80 L1000,105 L1100,75 L1200,110 L1200,200 Z" fill="currentColor"/></svg>`;
  _MP.layers.mountainsFar.dataset.painted = '1';
 }
 if(_MP.layers.mountainsNear && !_MP.layers.mountainsNear.dataset.painted){
  _MP.layers.mountainsNear.innerHTML = `<svg viewBox="0 0 1200 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,200 L0,170 L100,120 L200,150 L320,100 L440,140 L580,95 L700,135 L840,110 L960,145 L1080,115 L1200,140 L1200,200 Z" fill="currentColor"/></svg>`;
  _MP.layers.mountainsNear.dataset.painted = '1';
 }
 // Premier plan : 4 nuages dérivants
 if(_MP.layers.foreground && !_MP.layers.foreground.dataset.painted){
  const clouds = [];
  for(let i=0;i<4;i++){
   const top = 8 + i*16;
   const delay = i*4;
   const dur = 35 + (i*7)%18;
   clouds.push(`<span class="mp-cloud" style="top:${top}%;animation-duration:${dur}s;animation-delay:-${delay}s;">☁️</span>`);
  }
  // 6 emojis de décor par défaut (ceux de la zone seront remplacés dynamiquement)
  const decor = [];
  for(let i=0;i<6;i++){
   decor.push(`<span class="mp-decor" data-decor-slot="${i}" style="left:${(i*17.3)%100}%;top:${60+(i*7)%30}%;animation-delay:-${i*3}s;">·</span>`);
  }
  _MP.layers.foreground.innerHTML = clouds.join('') + decor.join('');
  _MP.layers.foreground.dataset.painted = '1';
 }
 // Ciel par défaut : on prend la première zone si on n'a pas encore d'observation
 const firstZone = MAP_ZONES[0];
 if(firstZone && firstZone.parallax){
  _applyZoneParallax(firstZone);
  _MP.currentZoneId = firstZone.id;
 }
}

/**
 * Applique la palette parallaxe d'une zone donnée (ciel, montagnes, décor, astro).
 */
function _applyZoneParallax(zone){
 if(!zone || !zone.parallax || !_MP.layers.sky) return;
 const px = zone.parallax;
 _MP.layers.sky.style.background = `linear-gradient(180deg, ${px.sky[0]} 0%, ${px.sky[1]} 55%, ${px.sky[2]} 100%)`;
 if(_MP.layers.mountainsFar) _MP.layers.mountainsFar.style.color = px.mountains[0];
 if(_MP.layers.mountainsNear) _MP.layers.mountainsNear.style.color = px.mountains[1];
 // Astro
 const astro = _MP.layers.stars?.querySelector('.mp-astro');
 if(astro) astro.textContent = px.astro || '☀️';
 // Décor
 const decorEls = _MP.layers.foreground?.querySelectorAll('.mp-decor');
 if(decorEls && px.decor){
  decorEls.forEach((el,i)=>{ el.textContent = px.decor[i % px.decor.length]; });
 }
}

/**
 * Observe quelle zone est au centre du viewport pour mettre à jour la palette.
 */
function _setupZoneObserver(){
 if(_MP.io){ try{_MP.io.disconnect();}catch(e){} }
 if(typeof IntersectionObserver==='undefined') return;
 // O3 : adapté à la nouvelle carte régionalisée (.mr-node remplace .map-zone)
 const zoneEls = document.querySelectorAll('.mr-node[data-zone-id], .map-zone[data-zone-id]');
 if(!zoneEls.length) return;
 _MP.io = new IntersectionObserver((entries)=>{
  // On prend la zone avec le ratio d'intersection le plus élevé
  let best = null;
  entries.forEach(e=>{
   if(e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
  });
  if(best){
   const id = best.target.dataset.zoneId;
   if(id && id !== _MP.currentZoneId){
    const zone = MAP_ZONES.find(z=>z.id===id);
    if(zone){
     _applyZoneParallax(zone);
     _MP.currentZoneId = id;
    }
   }
  }
 }, { threshold: [0.2, 0.5, 0.8], rootMargin: '-30% 0px -30% 0px' });
 zoneEls.forEach(el=>_MP.io.observe(el));
}

/**
 * Attache les listeners de mouvement (scroll, mouse, accéléromètre).
 */
function _attachMotionListeners(){
 _MP.scrollEl = document.getElementById('v-map');
 // Scroll : on lit le scroll de la window (#v-map est dans le flux normal)
 _MP.onScroll = ()=>{
  _MP.scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  _scheduleParallaxUpdate();
 };
 window.addEventListener('scroll', _MP.onScroll, { passive: true });
 // Souris (desktop)
 _MP.onMouse = (e)=>{
  const w = window.innerWidth || 1, h = window.innerHeight || 1;
  _MP.mouseX = (e.clientX / w) * 2 - 1; // -1 .. 1
  _MP.mouseY = (e.clientY / h) * 2 - 1;
  _scheduleParallaxUpdate();
 };
 window.addEventListener('mousemove', _MP.onMouse, { passive: true });
 // Accéléromètre (mobile) avec gestion permission iOS 13+
 _setupTiltListener();
 // Resize
 _MP.onResize = ()=>_scheduleParallaxUpdate();
 window.addEventListener('resize', _MP.onResize, { passive: true });
 // Premier rendu
 _MP.scrollY = window.scrollY || 0;
 _scheduleParallaxUpdate();
}

function _detachMotionListeners(){
 if(_MP.onScroll) window.removeEventListener('scroll', _MP.onScroll);
 if(_MP.onMouse) window.removeEventListener('mousemove', _MP.onMouse);
 if(_MP.onTilt) window.removeEventListener('deviceorientation', _MP.onTilt);
 if(_MP.onResize) window.removeEventListener('resize', _MP.onResize);
 _MP.onScroll = _MP.onMouse = _MP.onTilt = _MP.onResize = null;
}

/**
 * Demande la permission d'accès à l'accéléromètre (requis sur iOS 13+) puis
 * attache le handler. Sur Android et desktop, attache directement.
 */
function _setupTiltListener(){
 const handler = (e)=>{
  // gamma = inclinaison gauche/droite (-90..90), beta = avant/arrière (-180..180)
  const gamma = e.gamma;
  if(gamma == null) return;
  // Seuil anti-jitter : on ignore les variations < 1°
  const raw = Math.max(-30, Math.min(30, gamma)) / 30; // -1..1
  // Lissage exponentiel léger
  _MP.tiltX = _MP.tiltX * 0.85 + raw * 0.15;
  _scheduleParallaxUpdate();
 };
 const isIOS = typeof DeviceOrientationEvent !== 'undefined'
            && typeof DeviceOrientationEvent.requestPermission === 'function';
 if(isIOS){
  // Sur iOS 13+, requestPermission DOIT être appelé depuis un événement utilisateur.
  // On greffe un one-shot click-listener qui demande puis attache le handler.
  const askThenAttach = ()=>{
   try{
    DeviceOrientationEvent.requestPermission().then(state=>{
     if(state === 'granted'){
      window.addEventListener('deviceorientation', handler, { passive: true });
      _MP.onTilt = handler;
     }
    }).catch(()=>{ /* refusé : pas de tilt, on garde scroll+mouse */ });
   }catch(e){}
   document.removeEventListener('click', askThenAttach);
   document.removeEventListener('touchstart', askThenAttach);
  };
  document.addEventListener('click', askThenAttach, { once: true });
  document.addEventListener('touchstart', askThenAttach, { once: true, passive: true });
 } else if(typeof DeviceOrientationEvent !== 'undefined'){
  window.addEventListener('deviceorientation', handler, { passive: true });
  _MP.onTilt = handler;
 }
}

/**
 * rAF throttle : update au plus une fois par frame.
 */
function _scheduleParallaxUpdate(){
 if(_MP.rafId) return;
 _MP.rafId = requestAnimationFrame(()=>{
  _MP.rafId = null;
  _updateParallaxTransforms();
 });
}

function _updateParallaxTransforms(){
 if(!_MP.active || !_MP.layers.stars) return;
 // Décalage horizontal combiné souris + tilt (en px max)
 // Couches lointaines bougent plus que les proches (parallaxe inversée vs scroll)
 const dxFar  = (_MP.mouseX + _MP.tiltX*2) * 18; // ±18 px
 const dxMid  = (_MP.mouseX + _MP.tiltX*2) * 10;
 const dxNear = (_MP.mouseX + _MP.tiltX*2) * 4;
 // Décalage vertical au scroll (parallaxe : plus on est loin, moins on bouge avec le scroll)
 const sy = _MP.scrollY;
 const tyStars     = sy * -0.12;
 const tyMtnFar    = sy * -0.30;
 const tyMtnNear   = sy * -0.50;
 const tyForeground = sy * -0.70;
 // Application
 if(_MP.layers.stars)         _MP.layers.stars.style.transform         = `translate3d(${dxFar}px, ${tyStars}px, 0)`;
 if(_MP.layers.mountainsFar)  _MP.layers.mountainsFar.style.transform  = `translate3d(${dxMid}px, ${tyMtnFar}px, 0)`;
 if(_MP.layers.mountainsNear) _MP.layers.mountainsNear.style.transform = `translate3d(${dxNear}px, ${tyMtnNear}px, 0)`;
 if(_MP.layers.foreground)    _MP.layers.foreground.style.transform    = `translate3d(${dxNear*0.6}px, ${tyForeground}px, 0)`;
}

function startMapBoss(zoneId){
 const zone=MAP_ZONES.find(z=>z.id===zoneId);if(!zone)return;
 GM.mapZone=zone;GM.level=zone.level;GM.mode2='normal';GM.mode=P.prefs.mode||'keyboard';
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level)){ GM.mode='qcm'; if(typeof _matApplyAmbiance==='function') _matApplyAmbiance(GM.level); }
 applyTheme(zone.theme);
 const bossMonster={emoji:zone.boss,name:zone.bossName,title:`Gardien de : ${zone.label}`,
  // v8.7.28 : tirage diversifié (boss legacy entry point, 1 seul boss → withinKindIdx=0)
  intro: _pickDialogue('boss', zoneId, 0).replace(/\$\{zone\}/g, zone.label).replace(/\$\{name\}/g, zone.bossName || 'l\'Inconnu'),
  anim:'glow',col:'#e74c3c'};
 // Chantier 3.10 : cinématique d'entrée de zone, puis intro boss, puis combat
 const _startCombat = ()=>{
  loadProfile();gameActive=true;clearPendingTimers();resetGS();GS.isBoss=false;GS.isSeasonalBoss=false;GS.isBirthdayBoss=false;GS.seasonalMult=1;GS.seasonalFigId=null;
  powers={};const pwI=Math.abs((P.name.charCodeAt(0)||0))%POWERS.length;const pw=POWERS[pwI];
  powers[P.name]={id:pw.id,eff:pw.effect,charge:0,recharge:pw.recharge,shielded:false,dbl:false};
  $('combat-bar').classList.add('hidden');
  $('hud-name').innerText=(P.avatar||'👤')+' '+P.name;
  $('hud-chrono').classList.add('hidden');$('hud-combo').classList.add('hidden');
  $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
  $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
  toggleNumpadForMode(GM.mode);
  $('BODY').classList.remove('body-alert','urgency-bg');
  showView('v-game');nextTurn();
  // Chantier B4 : skin d'ambiance pendant le combat
  if(typeof startZoneSkin === 'function') startZoneSkin(zone);
 };
 const _afterZoneIntro = ()=>showMonsterIntro(bossMonster, _startCombat);
 if(typeof playZoneIntro==='function') playZoneIntro(zone, _afterZoneIntro);
 else _afterZoneIntro();
}

// ═══════════════════════════════════════════════════════
// MUSIQUE
// ═══════════════════════════════════════════════════════
function startMusic(){
 stopMusic();const ctx=getAudio();
 const th={
  standard:[261,329,392,523,392,329],
  espace:[220,277,330,440,330,277,196],
  foret:[293,349,440,587,440,349,293,392],
  volcan:[233,277,311,466,311,233,392],
 };
 const t=(([...document.body.classList].find(c=>c.indexOf('theme-')===0)||'').replace('theme-',''))||'standard';
 const notes=th[t]||th.standard;
 let step=0;
 function loop(){
  if(!musicOn)return;
  const f=notes[step%notes.length];
  pNote(ctx,f,'sine',1.4,.04);
  if(Math.random()>.55)pNote(ctx,f*1.5,'sine',1.2,.02);
  if(Math.random()>.75)pNote(ctx,f*2,'triangle',.8,.015);
  step++;
  musicTimer=setTimeout(loop,900+ri(0,500));
 }
 loop();const _mv=$('music-viz');if(_mv)_mv.classList.add('viz-anim');
}
function stopMusic(){clearTimeout(musicTimer);musicTimer=null;const _mv=$('music-viz');if(_mv)_mv.classList.remove('viz-anim');}
function toggleMusic(){const _mt=$('musicToggle');musicOn=_mt?_mt.checked:false;if(musicOn)startMusic();else stopMusic();}
function playVS(){const s=VSOUNDS.find(v=>v.id===(P.victorySound||'fanfare'))||VSOUNDS[0];try{s.play(getAudio());}catch(e){}}

// ═══════════════════════════════════════════════════════
// PARTICULES
// ═══════════════════════════════════════════════════════
// OPT-2 : spawnP n'assigne plus canvas.width/height (fait une seule fois dans _initCachedDOM)
// OPT-4 : animP évite filter() qui alloue un nouveau tableau à chaque frame RAF
function spawnP(x,y,n=12){
 const t=(([...document.body.classList].find(c=>c.indexOf('theme-')===0)||'').replace('theme-',''))||'standard';
 // Rich theme palettes
 const themeP={
  standard:['#f1c40f','#e67e22','#fff','#f39c12'],
  espace:['#c39bd3','#9b59b6','#74b9ff','#fff','#e91e8c'],
  foret:['#a9dfbf','#2ecc71','#27ae60','#f1c40f','#a8e6cf'],
  volcan:['#e74c3c','#e67e22','#f39c12',`hsl(${ri(10,40)},100%,55%)`,`hsl(${ri(0,20)},90%,65%)`],
 };
 const pal=themeP[t]||themeP.standard;
 const col=pal[ri(0,pal.length-1)];
 for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*9,vy:(Math.random()-.7)*10,life:1,col,sz:ri(4,10)});
 if(!particleRaf)animP();
}
function animP(){
 const ctx=_particleCtx||_particleCanvas?.getContext('2d');
 if(!ctx){particleRaf=null;return;}
 ctx.clearRect(0,0,_particleCanvas.width,_particleCanvas.height);
 // OPT-4 : suppression in-place sans créer de nouveau tableau
 for(let i=particles.length-1;i>=0;i--){if(particles[i].life<=.04)particles.splice(i,1);}
 particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.life-=.025;ctx.globalAlpha=p.life;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;});
 if(particles.length){particleRaf=requestAnimationFrame(animP);}
 else{particleRaf=null;ctx.clearRect(0,0,_particleCanvas.width,_particleCanvas.height);}
}

// ═══════════════════════════════════════════════════════
// SKILLS / BOUTIQUE
// ═══════════════════════════════════════════════════════
function renderSkills(){
 $('p-skills').innerHTML=[['shield','🛡️ Armure (+1 ❤️ max)'],['sword','⚔️ Puissance (+2 pts/rép.)'],['clock','⏳ Sablier (+5s/question)']].map(([s,label])=>{
  const lvl=P.skills[s]||0,price=(lvl+1)*40;
  return `<div class="skill-item"><span>${label} Niv.${lvl}</span><button onclick="buySkill('${s}')"${lvl>=3?' disabled':''}>${lvl>=3?'MAX':price+' ⭐'}</button></div>`;
 }).join('');
}
function spend(amt,cb){if((P.stars||0)<amt){beep(200,'sawtooth');return false;}P.stars-=amt;cb();saveProfileNow();updateMenuUI();beep(800,'sine',.3);return true;}
function buySkill(s){if((P.skills[s]||0)>=3)return;spend(((P.skills[s]||0)+1)*20,()=>{P.skills[s]=(P.skills[s]||0)+1;renderSkills();});}
function buyItem(it,price){spend(price,()=>{P.inventory[it]=(P.inventory[it]||0)+1;updateMenuUI();toast('Acheté !');});}
function useItem(it){
 if(!(P.inventory[it]>0))return;P.inventory[it]--;$('cnt-'+it).innerText=P.inventory[it];saveProfile();
 if(it==='potion'){
  GS.pv++;updateHUD();beep(600,'sine',.5);
  // Chantier A4 : animation potion
  if(typeof playItemAnimation==='function') playItemAnimation('potion');
  vibrate?.(VIBE.good);
 }
 if(it==='bomb'&&GS.q){
  // Chantier A4 : animation bombe avant validation
  if(typeof playItemAnimation==='function') playItemAnimation('bomb');
  vibrate?.(VIBE.boss);
  setTimeout(()=>validate(GS.q.res), 400);
  return;
 }
}

// ═══════════════════════════════════════════════════════
// QUÊTES, BADGES, HEBDO
// ═══════════════════════════════════════════════════════
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function genQuests(){
 // Chantier A3 : si données suffisantes, génère des quêtes adaptées au profil
 if(typeof genSmartQuests === 'function'){
  return genSmartQuests();
 }
 return shuffle(QUESTS).slice(0,3).map(q=>({...q,progress:0,done:false}));
}
function renderQuests(){
 if(!P.quests)return;
 $('p-quests').innerHTML=P.quests.map(q=>{
  // Chantier A3 : icône différente selon le type de quête
  const icon = q.smart==='weak' ? '🎯' : q.smart==='strong' ? '🌟' : '📜';
  const tooltip = q.smart==='weak' ? 'Renforcement (zone à travailler)'
                : q.smart==='strong' ? 'Défi (zone maîtrisée)'
                : 'Quête classique';
  return `<div class="quest-row">
  <div style="font-size:1.2em;" title="${tooltip}">${icon}</div>
  <div style="flex:1;text-align:left;">
   <div style="font-weight:700;font-size:.82em;">${q.label} ${q.done?'✅':''}</div>
   <div style="color:#f1c40f;font-size:.72em;">+${q.reward} ⭐</div>
   <div class="quest-prog"><div class="quest-prog-fill" style="width:${Math.min(100,Math.round(q.progress/q.goal*100))}%"></div></div>
  </div>
  <div style="font-size:.75em;color:#bdc3c7;">${Math.min(q.progress,q.goal)}/${q.goal}</div>
 </div>`;
 }).join('');
}
// Chantier A3 : helper pour les quêtes "combo dans une opération"
function _checkOpComboQuest(opKey, currentCombo){
 if(!P.quests)return;
 const q=P.quests.find(qq=>!qq.done && qq.key===`combo_${opKey}`);
 if(!q)return;
 if(currentCombo>=q.goal && q.progress<q.goal){
  q.progress=q.goal;
  q.done=true;
  P.stars+=q.reward;
  if(typeof toast==='function')toast(`🎉 Quête ! +${q.reward}⭐`);
 }
}
function updateQuests(key,amt=1){
 if(!P.quests)return;
 P.quests.forEach(q=>{
  if(q.done||q.key!==key)return;
  q.progress=Math.min(q.goal,q.progress+amt);
  if(q.progress>=q.goal){q.done=true;P.stars+=q.reward;toast(`🎉 Quête ! +${q.reward}⭐`);}
 });saveProfile();
}
function renderBadges(){
 $('p-badges').innerHTML='<div class="badge-g">'+BADGES.map(b=>{
  const e=(P.badgesEarned||[]).includes(b.id);
  return `<span class="badge ${e?'earned':'locked'}">${b.e} ${b.l}</span>`;
 }).join('')+'</div>';
}
function checkBadges(){
 const nb=[];
 BADGES.forEach(b=>{
  if((P.badgesEarned||[]).includes(b.id))return;
  if(b.ok(P.history||[],P.errors||[],GS)){P.badgesEarned=(P.badgesEarned||[]);P.badgesEarned.push(b.id);nb.push(b);}
 });
 if(nb.length)saveProfile();return nb;
}
function renderWC(){
 const wc=P.weeklyChallenge,box=$('wc-box');
 if(!box) return; // box absente (selon écran) : rien à faire
 if(!wc){box.classList.add('hidden');return;}
 box.classList.remove('hidden');
 const _s=(id,v)=>{const e=$(id);if(e)e.innerText=v;};
 _s('wc-title','📅 Défi : '+wc.label);
 _s('wc-desc',`Réussir ${wc.target} questions · +${wc.reward}⭐${wc.done?' ✅':''}`);
 const pct=Math.min(100,Math.round(wc.progress/wc.target*100));
 const f=$('wc-fill');if(f)f.style.width=pct+'%';
 _s('wc-text',`${wc.progress}/${wc.target} (${pct}%)`);
}
function updateWC(q){
 const wc=P.weeklyChallenge;if(!wc||wc.done)return;
 const filterFn=getWCFilter(wc.id);
 if(filterFn&&filterFn(q)){
  wc.progress++;
  if(wc.progress>=wc.target){wc.done=true;P.stars+=wc.reward;toast(`🏆 Défi hebdo ! +${wc.reward}⭐`,3000);beep(880,'sine',.8);}
  renderWC();saveProfile();
 }
}

// ═══════════════════════════════════════════════════════
// COMBAT CONFIG
// ═══════════════════════════════════════════════════════
function onGameModeChange(){
 const isCombat=$('gameModeSelect').value==='combat';
 $('combat-config').classList.toggle('hidden',!isCombat);
 if(isCombat&&combatCfg.length===0){combatCfg=[{name:P.name,level:P.prefs.level||'CP'},{name:'',level:'CP'}];renderCombatCfg();}
 savePrefs();
}
function renderCombatCfg(){
 $('combat-cfg-rows').innerHTML=combatCfg.map((p,i)=>`
  <div class="combat-row">
   <span>👤</span>
   <select onchange="onCCP(${i},this.value)" style="flex:1.2;">
    ${getRoster().map(n=>`<option value="${esc(n)}"${n===p.name?' selected':''}>${esc(n)}</option>`).join('')}
    <option value="__c__"${!getRoster().includes(p.name)?' selected':''}>✏️ Autre…</option>
   </select>
   ${!getRoster().includes(p.name)?`<input type="text" placeholder="Prénom…" value="${esc(p.name)}" maxlength="16" oninput="combatCfg[${i}].name=this.value" style="flex:1;">`:''}
   <select onchange="combatCfg[${i}].level=this.value" style="flex:.8;">
    ${(()=>{ const _gi=(l)=>(typeof _groupIcon==='function')?_groupIcon(l)+' ':''; const _ll=(l)=>(typeof _levelLabel==='function')?_levelLabel(l):l; const o=(l)=>`<option value="${l}"${l===p.level?' selected':''}>${_gi(l)}${_ll(l)}</option>`; const prim=(typeof PRIMARY_LEVELS!=='undefined')?PRIMARY_LEVELS:['CP','CE1','CE2','CM1','CM2']; const coll=(typeof COLLEGE_LEVELS!=='undefined')?COLLEGE_LEVELS:[]; const gm=(typeof GROUP_META!=='undefined')?GROUP_META:{primaire:{icon:'🎒',name:'Primaire'},college:{icon:'🎓',name:'Collège'}}; return `<optgroup label="${gm.primaire.icon} ${gm.primaire.name}">${prim.map(o).join('')}</optgroup>`+(coll.length?`<optgroup label="${gm.college.icon} ${gm.college.name}">${coll.map(o).join('')}</optgroup>`:''); })()}
   </select>
   ${combatCfg.length>2?`<button class="rm-btn" onclick="rmCC(${i})">✕</button>`:''}
  </div>`).join('');
 $('btn-add-combat').disabled=combatCfg.length>=5;
}
function onCCP(i,v){combatCfg[i].name=v==='__c__'?'':v;renderCombatCfg();}
function addCombatSlot(){if(combatCfg.length<5){combatCfg.push({name:'',level:'CP'});renderCombatCfg();}}
function rmCC(i){combatCfg.splice(i,1);renderCombatCfg();}

// ═══════════════════════════════════════════════════════
// POUVOIRS
// ═══════════════════════════════════════════════════════
function initPowers(players){
 powers={};
 players.forEach((pl,i)=>{const pw=POWERS[i%POWERS.length];powers[pl.name]={id:pw.id,eff:pw.effect,charge:0,recharge:pw.recharge,shielded:false,dbl:false};});
}
function renderPowerBar(){
 const el=$('power-bar');el.classList.remove('hidden');
 const pname=GM.mode2==='combat'?combatPlayers[combatIdx]?.name:P.name;
 const pw=powers[pname];
 if(!pw){el.classList.add('hidden');return;}
 const cfg=POWERS.find(c=>c.id===pw.id);if(!cfg){el.classList.add('hidden');return;}
 const ready=pw.charge>=pw.recharge;
 el.innerHTML=`<button class="pow-btn ${ready?'ready':'charging'}" onclick="usePower('${pname}')" ${ready?'':'disabled'}>
  ${cfg.emoji} ${cfg.label}<span class="pow-charge">${ready?'PRÊT !':pw.charge+'/'+pw.recharge+' ⚡'}</span></button>`;
}
function chargePower(name){const pw=powers[name];if(pw&&pw.charge<pw.recharge){pw.charge++;renderPowerBar();}}
function usePower(name){
 const pw=powers[name];if(!pw||pw.charge<pw.recharge)return;
 const cfg=POWERS.find(c=>c.id===pw.id);if(!cfg)return;
 pw.charge=0;
 switch(pw.eff){
  case'shield': pw.shielded=true;toast('🛡️ Bouclier activé !');break;
  case'double': pw.dbl=true;toast('⚡ Double attaque !');break;
  case'heal':
   if(GM.mode2==='combat'){const p=combatPlayers.find(x=>x.name===name);if(p&&p.pv<6)p.pv++;updateCombatHUD();}
   else{GS.pv++;updateHUD();}
   toast('💚 +1 PV !');beep(600,'sine',.4);break;
  case'steal':
   if(GM.mode2==='combat'){
    const oth=combatPlayers.filter(p=>p.name!==name&&p.alive&&p.score>0);
    if(oth.length){const vic=oth.reduce((a,b)=>a.score>b.score?a:b);vic.score=Math.max(0,vic.score-2);const me=combatPlayers.find(p=>p.name===name);if(me)me.score+=2;updateCombatHUD();toast(`🦊 Vol à ${vic.name} !`);}
   }break;
  case'freeze': GS.frozen=true;toast('❄️ Timer gelé !');break;
 }
 renderPowerBar();beep(700,'sine',.3,.12);
}

// ═══════════════════════════════════════════════════════
// TIMERS
// ═══════════════════════════════════════════════════════
function stopTimer(){if(timerRaf){cancelAnimationFrame(timerRaf);timerRaf=null;}}
function startTimer(){
 stopTimer();if(GS.frozen)return;
 totalTime=(GS.isBoss?12:20)+(P.skills.clock||0)*5;
 // v8.7.50 (O4) : en phase enragée, le boss met plus de pression (timer -3s, plancher 9s)
 if(GS.isBoss && GS.bossEnraged) totalTime = Math.max(9, totalTime - 3);
 if(GS.activeEvent?.effect==='reduce_timer')totalTime=Math.max(8,totalTime-5);
 // Plus de temps pour les questions à lire/observer (problèmes en barres, exercices visuels)
 if(GS.q && (GS.q.visualHtml || (GS.q.display && GS.q.display.length>40))) totalTime += 12;
 timerEnd=performance.now()+totalTime*1000;
 _timerTauntFired=false;
 const tb=_timerBarEl||$('timer-bar');
 const heart=$('timer-heart');
 function tick(){
  if(GS.frozen){timerEnd+=(1000/60);timerRaf=requestAnimationFrame(tick);return;}
  const rem=Math.max(0,(timerEnd-performance.now())/1000);
  tb.style.width=(rem/totalTime*100)+'%';
  if(rem<=3){
   tb.className='td';
   $('BODY').classList.add('body-alert','urgency-bg');
   if(heart)heart.style.display='inline';
   // One-shot timer taunt
   if(!_timerTauntFired){_timerTauntFired=true;monsterSpeak(TIMER_TAUNTS[ri(0,TIMER_TAUNTS.length-1)],2000);}
  }else if(rem<=8){
   tb.className='tw';
   $('BODY').classList.remove('urgency-bg');
   if(heart)heart.style.display='none';
  }else{
   tb.className='';
   $('BODY').classList.remove('urgency-bg');
   if(heart)heart.style.display='none';
  }
  if(rem<=0){timerRaf=null;$('BODY').classList.remove('urgency-bg');if(heart)heart.style.display='none';hitPlayer('⌛ Temps écoulé !');}
  else timerRaf=requestAnimationFrame(tick);
 }
 timerRaf=requestAnimationFrame(tick);
}
function stopChrono(){if(chronoRaf){cancelAnimationFrame(chronoRaf);chronoRaf=null;}}
function startChrono(){
 stopChrono();chronoEnd=performance.now()+60000;
 function tick(){const rem=Math.max(0,(chronoEnd-performance.now())/1000);$('hud-chronov').innerText=Math.ceil(rem);if(rem<=0){chronoRaf=null;endGame(true);}else chronoRaf=requestAnimationFrame(tick);}
 chronoRaf=requestAnimationFrame(tick);
}

// ═══════════════════════════════════════════════════════
// TRANSITION
// ═══════════════════════════════════════════════════════
function showTrans(emoji,msg,dur,cb){
 $('trans-monster').innerText=emoji;$('trans-msg').innerHTML=msg;
 $('transition-screen').classList.remove('hidden');
 setTimeout(()=>{$('transition-screen').classList.add('hidden');cb();},dur);
}

// ═══════════════════════════════════════════════════════
// ÉVÉNEMENTS ALÉATOIRES
// ═══════════════════════════════════════════════════════
function maybeEvent(){
 if(GS.activeEvent||GS.qCount%3!==0||Math.random()>.15)return;
 GS.activeEvent=EVENTS[ri(0,EVENTS.length-1)];GS.eventLeft=GS.activeEvent.dur;
 const ev=GS.activeEvent;
 const b=$('event-banner');
 b.innerHTML=`<div style="background:${ev.color};padding:10px;font-size:1em;font-weight:700;">${ev.label} — ${ev.desc}</div>`;
 b.classList.remove('hidden');b.classList.add('banner-anim');
 setTimeout(()=>{b.classList.add('hidden');b.classList.remove('banner-anim');},3500);
 if(ev.effect==='heal_all'){GS.pv=Math.min(GS.pv+1,8);updateHUD();}
 beep(440,'sine',.8,.15);
}

// ═══════════════════════════════════════════════════════
// DÉMARRAGE
// ═══════════════════════════════════════════════════════
function startGame(){
 getAudio();loadProfile();
 // v8.7.4 : mode/niveau/saisie forcés depuis le sous-écran de config (Étape B).
 // Appliqués APRÈS loadProfile/applyPrefs (qui réécrivent les selects).
 if(window._forcedMode){
  const gm=$('gameModeSelect');
  if(gm){ gm.value=window._forcedMode; }
  if(window._forcedMode==='combat' && typeof onGameModeChange==='function'){ onGameModeChange(); }
  window._forcedMode=null;
 }
 if(window._forcedLevel){
  const ls=$('levelSelect');
  if(ls){
   if(![...ls.options].some(o=>o.value===window._forcedLevel)){
    const opt=document.createElement('option');opt.value=window._forcedLevel;opt.textContent=window._forcedLevel;ls.appendChild(opt);
   }
   ls.value=window._forcedLevel;
  }
  window._forcedLevel=null;
 }
 if(window._forcedInput){
  const ms=$('modeSelect');
  if(ms) ms.value=window._forcedInput;
  window._forcedInput=null;
 }
 // vérif blocage horaire
 if(isTimeBlocked()){showBlockScreen();return;}
 gameActive=true;clearPendingTimers();
 savePrefs();
 const rawLevel=$('levelSelect').value;
 GM.mode=$('modeSelect').value;GM.mode2=$('gameModeSelect').value;
 GM.level=VALID_LEVELS.includes(rawLevel)?rawLevel:'CP';GM.mapZone=null;
 // M-A : la maternelle est un mode solo guidé, 100% visuel, sans combat ni chrono
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level)){
  GM.mode='qcm'; GM.mode2='normal';
 }
 if(typeof _matApplyAmbiance==='function') _matApplyAmbiance(GM.level);
 resetGS();powers={};isRevision=false;
 if(GM.mode2==='combat'){
  const valid=combatCfg.filter(p=>p.name&&p.name.trim());
  if(valid.length<2){alert('Il faut au moins 2 joueurs nommés !');return;}
  // Chantier A2 v1 : avatars + stats enrichies pour chaque joueur
  const avatars = ['🧙','🧝','🥷','🧛','🦸','🧚','🤖','👻'];
  combatPlayers=valid.map((p,i)=>({
   name:p.name.trim(), level:p.level||'CP',
   pv:3+(P.skills.shield||0), score:0, alive:true,
   avatar: avatars[i % avatars.length],
   hits: 0,           // touches portées (a fait perdre un PV à un autre)
   bestCombo: 0,       // meilleur combo personnel
   currentCombo: 0,    // combo en cours
   totalAnswerTime: 0, // somme des temps de réponse
   correctAnswers: 0,  // pour calculer la moyenne
   eliminated: null,   // qui m'a éliminé (null si vivant)
   killCount: 0,       // nombre d'éliminations
  }));
  combatIdx=0;initPowers(combatPlayers);
  $('combat-bar').classList.remove('hidden');updateCombatHUD();
 }else{
  $('combat-bar').classList.add('hidden');
  const pwI=Math.abs((P.name.charCodeAt(0)||0))%POWERS.length;const pw=POWERS[pwI];
  powers[P.name]={id:pw.id,eff:pw.effect,charge:0,recharge:pw.recharge,shielded:false,dbl:false};
 }
 showView('v-game');
 $('hud-name').innerText=(P.avatar||'👤')+' '+P.name;
 $('hud-chrono').classList.toggle('hidden',GM.mode2!=='chrono' || !(GM.subject==='math'||!GM.subject));
 $('hud-combo').classList.add('hidden');
 $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
 $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
  toggleNumpadForMode(GM.mode);
 $('BODY').classList.remove('body-alert');
 if(GM.mode2==='chrono' && (GM.subject==='math'||!GM.subject))startChrono();else stopChrono();
 nextTurn();
}
function startRevision(){
 loadProfile();
 const _subj=(typeof GM!=='undefined'&&GM.subject)||'math';
 let queue=[];
 if(_subj==='math'){
  const unique=[...new Set(P.errors||[])].filter(e=>/^\d/.test(e));
  queue=[...unique,...unique];
 }else{
  const objs=(P.errorLog||[]).filter(e=>(e.subj||'math')===_subj && e.payload && Array.isArray(e.payload.choices)).map(e=>Object.assign({},e.payload));
  queue=[...objs,...objs];
 }
 if(!queue.length){alert('Aucune erreur à réviser !');return;}
 gameActive=true;clearPendingTimers();
 revQueue=queue;isRevision=true;
 GM.mode=$('modeSelect').value;GM.mode2='revision';GM.level=$('levelSelect').value;
 resetGS();
 $('combat-bar').classList.add('hidden');
 $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
 $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
 toggleNumpadForMode(GM.mode);
 $('hud-chrono').classList.add('hidden');
 showView('v-game');$('hud-name').innerText='📖 Révision – '+P.name;
 nextTurn();
}

// ═══════════════════════════════════════════════════════
// TOUR DE JEU
// ═══════════════════════════════════════════════════════
function nextTurn(){
 if(GM.mode2==='combat')return nextCombat();
 if(GS.pv<=0)return endGame(false);
 // v8.7.8 (O1) : nombre de questions cible (par défaut 6 pour le mode normal classique,
 // surchargé par questionsTarget pour les étapes de zone).
 const _qTarget = (GS.questionsTarget && GS.questionsTarget>0) ? GS.questionsTarget : 6;
 if(GM.mode2==='normal'&&!isRevision&&GS.qCount>=_qTarget)return endGame(true);
 if(GM.mode2==='revision'&&revQueue.length===0&&GS.qCount>0)return endGame(true);
 GS.qCount++;
 // v8.7.33 : logique de GS.isBoss clarifiée — bug critique avant.
 // - Étape de map moderne (GM.mapStep défini) : GS.isBoss reste comme startMapStep
 //   l'a positionné (true si step.type === 'boss', false sinon). On NE TOUCHE PAS.
 //   Avant : la ligne suivante écrasait GS.isBoss à false → mapBossBeaten non
 //   poussé → zone suivante restait verrouillée même après réussite du boss.
 // - Carte legacy (mapZone sans mapStep) : forcer boss à la dernière question.
 // - Mode normal classique : boss à la dernière question.
 if(GM.mapZone && GM.mapStep){
  // No-op : GS.isBoss déjà bon depuis startMapStep
 } else if(GM.mapZone){
  GS.isBoss = (GS.qCount === _qTarget);
 } else {
  GS.isBoss = (GM.mode2 === 'normal' && GS.qCount === _qTarget);
 }
 GS.bossTypeQ={};
 GS.isGolden=Math.random()<.15;GS.frozen=false;
 _timerTauntFired=false;
 GS.monsterMaxHP=GS.isBoss?HP_LVL[GM.level]+2:HP_LVL[GM.level];GS.monsterHP=GS.monsterMaxHP;
 GS.bossEnraged=false;  // v8.7.50 (O4) : reset de la phase d'enrage à chaque combat
 GS.bossShieldActive=false; GS.bossShieldHits=0; GS.bossRegenCount=0;  // v8.7.54 (O4.2c)
 GS.bossFury=false;  // v8.7.56 (O4.4) : 3e phase des gros boss
 { const _ma=$('monster-area'); if(_ma) _ma.classList.remove('monster-enraged','boss-shielded','monster-fury'); }
 maybeEvent();GS.q=generateQ();
 $('BODY').classList.remove('body-alert','urgency-bg');$('correction').classList.add('hidden');
 clearMonsterSpeech();
 const heart=$('timer-heart');if(heart)heart.style.display='none';
 // Pick monster personality
 // v8.7.9 (O1) : en étape de zone (hors boss), garder le monstre défini par startMapStep.
 // Le boss de zone garde l'intro spéciale ci-dessous.
 if(!(GM.mapZone && GM.mapStep && !GS.isBoss)){
  _currentMonster=pickMonster(GM.level,GS.isBoss);
 }
 if(GS.isBoss){
  // Boss: full cinematic intro
  const mapBoss=GM.mapZone;
  // Chantier 2.2 : si un boss saisonnier ou anniversaire est actif aujourd'hui,
  // il prend la priorité sur le boss générique (sauf en mode carte)
  let seasonalBoss=null;
  if(!mapBoss && typeof getActiveSeasonalBoss==='function'){
   seasonalBoss=getActiveSeasonalBoss(P.name);
   if(seasonalBoss){
    GS.isSeasonalBoss=true;
    GS.seasonalMult=seasonalBoss.mult||2;
    GS.isBirthdayBoss=!!seasonalBoss.isBirthday;
    GS.seasonalFigId=seasonalBoss.figId||null;
   }
  }
  const bossM = seasonalBoss
   ? {emoji:seasonalBoss.emoji, name:seasonalBoss.name, title:seasonalBoss.title, intro:seasonalBoss.intro, anim:seasonalBoss.anim||'glow', col:seasonalBoss.col}
   : (mapBoss
    ? {emoji:mapBoss.boss,name:mapBoss.bossName,title:'Boss de la Carte',intro:`Bienvenue dans ${mapBoss.label}. Tu ne repartiras pas vivant.`,anim:'glow',col:'#e74c3c'}
    : _currentMonster);
  showMonsterIntro((typeof _themeMonster==='function')?_themeMonster(bossM):bossM,renderQ);
 }else if((GS.qCount===1||(GM.mode2==='survie'&&GS.qCount%4===1)) && !(GM.mapZone && GM.mapStep)){
  // v8.7.9 (O1) : ne PAS rejouer l'intro en étape de zone : on l'a déjà
  // jouée dans startMapStep avec le bon monstre. Sinon un 2e monstre
  // aléatoire apparaîtrait par-dessus celui de l'étape.
  // Show intro for first monster and every 4 in survie
  showMonsterIntro(_currentMonster,renderQ);
 }else renderQ();
}
function generateQ(){
 if(isRevision&&revQueue.length>0){
  const e=revQueue.shift();
  if(e && typeof e==='object'){ const out=Object.assign({},e); out.isRevision=true; return out; }
  const m=String(e).match(/^(\d+)([+\-x×\/÷])(\d+)=(\d+)$/);
  if(m)return{a:+m[1],b:+m[3],op:m[2],res:+m[4],type:'normal',opKey:m[2],display:`${m[1]} ${m[2]} ${m[3]}`,img:''};
 }
 // Chantier 1.2 : révision espacée en mode normal (pas en boss ni en combat/révision)
 if(GM.mode2==='normal' && !GS.isBoss && !(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && typeof getRevisionErrorToAsk==='function'){
  const rev = getRevisionErrorToAsk();
  if(rev) return rev;
 }
 // P1 : exercices d'enrichissement numération (primaire, en mode normal hors boss)
 if((GM.subject==='math'||!GM.subject) && GM.mode2==='normal' && !GS.isBoss && !(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && typeof _primEnrich==='function' && typeof _PRIM_LEVELS!=='undefined' && _PRIM_LEVELS.includes(GM.level) && Math.random()<0.33){
  const pe=_primEnrich(GM.level); if(pe) return pe;
 }
 // C : exercices d'enrichissement collège (relatifs, etc.) en mode normal hors boss
 if((GM.subject==='math'||!GM.subject) && GM.mode2==='normal' && !GS.isBoss && typeof _collEnrich==='function' && typeof _COL_LEVELS!=='undefined' && _COL_LEVELS.includes(GM.level) && Math.random()<0.33){
  const ce=_collEnrich(GM.level); if(ce) return ce;
 }
 const _GS=(typeof GM!=='undefined'&&GM.subject==='fr'&&typeof GEN_FR!=='undefined')?GEN_FR:GEN;
 const fn=_GS[GM.level]||_GS.CP||GEN.CP;let q=fn(GS.isBoss);
 if(GS.activeEvent?.effect==='next_golden'){GS.isGolden=true;GS.activeEvent=null;}
 return q;
}
function getSkin(){const s=SKINS.find(x=>x.id===(P.equippedSkin||'default'))||SKINS[0];return s.m;}
function renderQ(){
 GS.answering=false;
 // v8.7.53 (O4.2b) : nettoyer les effets d'attaque de la question précédente
 if(typeof _resetBossAttackEffects==='function') _resetBossAttackEffects();
 const q=GS.q;
 // M-A : rendu 100% visuel pour la maternelle (images cliquables, pas de pavé ni chrono)
 if(q && q.maternelle && typeof _matRenderQ==='function'){ _matRenderQ(q); return; }
 const txt=q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res));
 $('question').innerText=txt;$('question').className=GS.isGolden?'gold-q':q.isRevision?'revision-q-inline':'';
 // Chantier 1.2 : petit toast discret quand une question de révision espacée apparaît
 if(q.isRevision && typeof toast==='function') toast('🔁 Révision', 1200);
 { const _pi=$('problem-image'); if(q.visualHtml){ _pi.innerHTML=q.visualHtml; } else { _pi.innerText=q.img||''; } }
 const sk=getSkin();const ml=GS.isGolden?sk.g:GS.isBoss?sk.b:sk.n;
 const ma=$('monster-area');
 // Use monster roster emoji or skin emoji
 const mEmoji=_currentMonster&&!GM.mapZone?_currentMonster.emoji:(GM.mapZone&&GS.isBoss?GM.mapZone.boss:ml[ri(0,ml.length-1)]);
 ma.textContent=mEmoji;
 // Apply personality animation
 if(_currentMonster&&!GS.isBoss){
  applyMonsterAnim(ma,_currentMonster);
 }else if(GS.isBoss){
  ma.className='';void ma.offsetWidth;
  ma.style.setProperty('--mcol','#e74c3c');
  ma.classList.add('anim-glow');
 }else{
  ma.className='monster-intro';setTimeout(()=>ma.className='',600);
 }
 requestAnimationFrame(()=>{const r=ma.getBoundingClientRect();_monsterCenter={x:r.left+r.width/2,y:r.top+r.height/2};});
 updateMonsterHP();
 let ttl='';
 if(GM.mode2==='survie')ttl=`💀 #${GS.qCount}`;
 else if(GS.isBoss)ttl=GM.mapZone?`⚔️ Boss : ${GM.mapZone.bossName}`:'👹 BOSS';
 else if(GS.isGolden)ttl='✨ DORÉ';
 else if(isRevision)ttl='📖 Révision';
 else ttl=`👾 ${GS.qCount}/6`;
 $('quest-title').innerHTML=`${ttl} <span class="mode-badge m-${GM.mapZone?'map':GM.mode2}">${GM.mapZone?'carte':GM.mode2}</span>`;
 $('feedback').innerText='';
 // Lecture audio de la question. Loto sonore : on lit la CONSIGNE puis on joue le
 // cri À LA FIN (plus de superposition). Sinon lecture normale. Dans tous les cas,
 // on diffère après une éventuelle réplique de boss (anti-coupure).
 (function(){
  const _say=()=>{ try{ speak(_ttsClean(q.speakText||txt)); }catch(e){} };
  const _rem=(window._monsterSpeakEnd||0)-Date.now();
  const _base=(_rem>60)?(_rem+150):0;
  if(q.sound && typeof _speakThenCri==='function'){
   if(typeof safeTimeout==='function'){ safeTimeout(()=>{ try{ _speakThenCri(q); }catch(e){} },_base); }
   else { try{ _speakThenCri(q); }catch(e){} }
  } else if(_base>0 && typeof safeTimeout==='function'){ safeTimeout(_say,_base); }
  else { _say(); }
 })();
 const _hasChoices = q.choices && q.choices.length;
 const _txt = !!q.textInput;
 // Visibilité pavé/choix : saisie texte (français) > choix visuels > mode
 $('qcm-options').classList.toggle('hidden', _txt || !(_hasChoices || GM.mode==='qcm'));
 $('input-zone').classList.toggle('hidden', !_txt && (_hasChoices || GM.mode==='qcm'));
 if(_txt){
  const ai=$('answer-input');ai.value='';
  const np=$('numpad'); if(np)np.style.display='none';
  ai.setAttribute('inputmode','text');ai.setAttribute('autocapitalize','none');ai.setAttribute('autocomplete','off');ai.setAttribute('spellcheck','false');
  setTimeout(()=>ai.focus(),120);
 }else if(_hasChoices){
  const qcmEl=$('qcm-options');
  qcmEl.classList.toggle('prim-choices', !!q.visualChoices);
  qcmEl.innerHTML=q.choices.map(c=>`<button class="qcm-btn${q.visualChoices?' prim-choice':''}" data-val="${c.val}">${c.html!==undefined?c.html:c.label}</button>`).join('');
  qcmEl.onclick=e=>{const b=e.target.closest('.qcm-btn');if(b&&!b.disabled)validate(+b.dataset.val);};
 }else if(GM.mode==='qcm'){
  const correct=q.res;
  const offsets=shuffle([-7,-5,-3,-2,-1,1,2,3,5,7]);
  const opts=[correct];
  for(let i=0;opts.length<4;i++)opts.push(Math.max(0,correct+offsets[i%offsets.length]));
  const dedup=[...new Set(opts)];while(dedup.length<4)dedup.push(dedup[dedup.length-1]+1);
  const qcmEl=$('qcm-options');
  qcmEl.classList.remove('prim-choices');
  qcmEl.innerHTML=shuffle(dedup).map(o=>`<button class="qcm-btn" data-val="${o}">${o}</button>`).join('');
  qcmEl.onclick=e=>{const b=e.target.closest('.qcm-btn');if(b&&!b.disabled)validate(+b.dataset.val);};
 }else{
  const ai=$('answer-input');ai.value='';
  const np=$('numpad'); if(np)np.style.display='';
  ai.setAttribute('inputmode','decimal');
  if(!_numpadIsTouch())setTimeout(()=>ai.focus(),100);
 }
 renderPowerBar();
 if((GM.subject==='math'||!GM.subject)){ if(GM.mode2!=='chrono')startTimer(); }
 else { if(typeof stopTimer==='function')stopTimer(); const _tb=(typeof _timerBarEl!=='undefined'&&_timerBarEl)||$('timer-bar'); if(_tb){_tb.style.width='0%';_tb.className='';} $('BODY').classList.remove('body-alert','urgency-bg'); }
 // v10.0.0 (C3 debug) : forçage immédiat de l'enrage si le drapeau debug est posé
 if(GS.isBoss && !GS.bossEnraged && _dbgForceEnrage()){
  GS.bossEnraged=true;
  if(typeof _triggerBossEnrage==='function') _triggerBossEnrage();
 }
 // v8.7.52 (O4.2) : en phase enragée, le boss peut lancer une attaque spéciale
 if(GS.isBoss && GS.bossEnraged && typeof _maybeBossAttack==='function') _maybeBossAttack();
}
// v10.0.0 (C3) : lecture du drapeau debug « forcer l'enrage » (posé par debug.html)
function _dbgForceEnrage(){
 try{ return localStorage.getItem('odyssee_dbg_enrage')==='1'; }catch(e){ return false; }
}
function _frNorm(s){ return (s||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' '); }
// Nettoie le texte AVANT lecture vocale : retire les emojis (sinon « 🔊 » est lu
// « volume ») et remplace les blancs « ___ » (sinon lus « tiret bas »).
function _ttsClean(s){
 return String(s||'')
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}\u{20E3}\u{2122}\u{2139}]/gu,' ')
  .replace(/_+/g,' ')
  .replace(/\s+/g,' ')
  .trim();
}
function submitAns(){
 const q=GS.q;
 if(q && q.textInput){
  const raw=($('answer-input').value||'').trim();
  if(raw==='') return validate(null);
  const ok=_frNorm(raw)===_frNorm(q.answer||'');
  return validate(ok ? q.res : (q.res||0)+9999);
 }
 const raw=($('answer-input').value||'').replace(',','.').trim();const v=parseFloat(raw);validate((raw===''||isNaN(v))?null:v);
}
function validate(ans){
 if(!GS.q||GS.answering)return; // guard : question null ou déjà en train de traiter
 GS.answering=true;
 if(GM.mode2==='combat')return validateCombat(ans);
 if(GM.mode2!=='chrono')stopTimer();
 if(ans===null){hitPlayer('Réponse invalide !');return;}
 // M-A : maternelle = aucune sanction. Mauvaise réponse → on grise le choix et on réessaie.
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level) && Math.abs(ans-GS.q.res)>=1e-6){
  const qcm=$('qcm-options');
  if(qcm){ const b=qcm.querySelector(`.qcm-btn[data-val="${ans}"]`); if(b){ b.classList.add('mat-wrong'); b.disabled=true; } }
  const fb=$('feedback'); if(fb){ fb.style.color='#e67e22'; fb.innerText='Presque ! Essaie encore 💛'; }
  if(typeof speak==='function') speak('Essaie encore');
  GS.matFirstTry=false;
  if(typeof _progUpdate==='function') _progUpdate(GM.level, false);
  GS.answering=false;
  return;
 }
 const q=GS.q;
 if(ans!==null && Math.abs(ans-q.res)<1e-6){
GS.combo++;GS.maxCombo=Math.max(GS.maxCombo,GS.combo);
  // Chantier A4 : flash de milestone à 10/20/30/50
  if([10,20,30,50].includes(GS.combo) && typeof flashComboMilestone==='function'){
   flashComboMilestone(GS.combo);
  }
  // Multiplicateur niveau : plus c'est difficile, plus c'est rentable
  // CP~1-2⭐ CE1~1-3⭐ CE2~2-3⭐ CM1~2-4⭐ CM2~3-5⭐
  const _lvlBase={PS:[1,1],MS:[1,2],GS:[2,3],CP:[1,2],CE1:[1,3],CE2:[2,3],CM1:[2,4],CM2:[3,5],'6E':[3,5],'5E':[3,6],'4E':[4,7],'3E':[4,8]}[GM.level]||[1,2];
  const _swordBonus=Math.floor(((P.skills.sword||0)*2)*0.5);
  let pts=_lvlBase[0]+Math.floor(Math.random()*(_lvlBase[1]-_lvlBase[0]+1))+_swordBonus;
  if(GS.isBoss)pts=Math.max(pts,_lvlBase[1]);
  // Chantier 2.2 : multiplicateur de récompense pour boss saisonniers/anniversaires
  if(GS.isBoss && GS.isSeasonalBoss && GS.seasonalMult) pts*=GS.seasonalMult;
  if(GS.isGolden)pts*=3;
  if(GS.activeEvent?.effect==='double_score')pts*=2;
  if(GS.combo>=10){pts*=2;$('gc').classList.add('combo-breaker');}
  const pw=powers[P.name];if(pw?.dbl){pts*=2;pw.dbl=false;toast('⚡ Double !');}
  GS.score+=pts;
  const opK=q.opKey||'+';P.opStats[opK]=P.opStats[opK]||{ok:0,fail:0};P.opStats[opK].ok++;
  if(typeof _progUpdate==="function") _progUpdate(GM.level, true);
  if(typeof _classStatUpdate==="function") _classStatUpdate(GM.level, q.opKey, true);
  // Chantier 1.2 : si c'était une question de révision et que l'enfant a réussi → on réduit sa présence
  if(q.isRevision && typeof clearErrorFromLog==='function' && q.display && q.res!==undefined) clearErrorFromLog(q.display, q.res);
  if(q.type==='fraction')GS.fracOk++;
  if(q.type==='missing')GS.missingOk++;
  chargePower(P.name);
  updateQuests('questions');if(GS.combo>=5)updateQuests('combo5');
  // Chantier C3 : tracker la progression du devoir
  if(typeof _trackHomework==='function') _trackHomework(q);
  if(q.type==='fraction')updateQuests('fractions');if(q.type==='missing')updateQuests('missing');
  // Chantier A3 : tracker quêtes intelligentes par opération
  if(q.opKey){
   updateQuests('op_'+q.opKey);
   // Suivi combo par opération (réinit si on change d'op ou si on échoue)
   if(GS.lastOpKey===q.opKey) GS.opCombo=(GS.opCombo||0)+1;
   else GS.opCombo=1;
   GS.lastOpKey=q.opKey;
   // À chaque palier de combo dans la même op, incrémenter la quête
   _checkOpComboQuest(q.opKey, GS.opCombo);
  }
  updateWC(q);
  beep(523,'square',.2);vibrate(VIBE.good);$('BODY').classList.add('flash');setTimeout(()=>$('BODY').classList.remove('flash'),50);
  $('feedback').style.color='#2ecc71';$('correction').classList.add('hidden');
  const ma=$('monster-area');
  if(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)){ma.classList.remove('mat-joy');void ma.offsetWidth;ma.classList.add('mat-joy');setTimeout(()=>ma.classList.remove('mat-joy'),750);}
  else{ma.classList.add('monster-hit');setTimeout(()=>ma.classList.remove('monster-hit'),350);}
  // Chantier 3.1 : amplification graduelle selon combo + popups
  const _partN = GS.combo>=10?25:GS.combo>=5?18:12;
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,_partN);
  floatScore(`+${pts} ⭐`, _monsterCenter.x||window.innerWidth/2, _monsterCenter.y||window.innerHeight/2, GS.combo>=5);
  if(COMBO_MILESTONES.has(GS.combo))comboBanner(GS.combo);
  // Monster reacts to being hit
  if(!(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && Math.random()<.55)monsterSpeak(CORRECT_TAUNTS[ri(0,CORRECT_TAUNTS.length-1)],1800);
  if(GM.mode==='qcm'||(GS.q&&GS.q.choices&&GS.q.choices.length))markQCM(ans,true);updateHUD();
  if(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)&&typeof _matCelebrate==='function')_matCelebrate();
  // v8.7.54 (O4.2c) : bouclier du boss — absorbe le 1er coup, cède au 2e.
  let _shieldHeld = false;
  if(GS.isBoss && GS.bossShieldActive){
   GS.bossShieldHits = (GS.bossShieldHits||0) + 1;
   if(GS.bossShieldHits >= 2){
    GS.bossShieldActive = false; GS.bossShieldHits = 0;
    if(typeof _bossShieldBreak === 'function') _bossShieldBreak();
    GS.monsterHP--; updateMonsterHP();
   } else {
    _shieldHeld = true;
    if(typeof _bossShieldBlock === 'function') _bossShieldBlock();
   }
  } else {
   GS.monsterHP--; updateMonsterHP();
  }
  // v8.7.50 (O4) : phase d'enrage — quand le boss tombe à la moitié de ses HP,
  // il entre dans une phase plus difficile (transition épique + timer réduit).
  if(GS.isBoss && !GS.bossEnraged && GS.monsterHP > 0 && GS.monsterHP <= Math.ceil(GS.monsterMaxHP/2)){
   GS.bossEnraged = true;
   if(typeof _triggerBossEnrage === 'function') _triggerBossEnrage();
  }
  // v8.7.56 (O4.4) : 3e phase "Furie" — uniquement pour les gros boss (≥6 PV :
  // CM1, CM2, Sanctuaire). Déclenchée à 25% de vie, après l'enrage.
  if(GS.isBoss && GS.bossEnraged && !GS.bossFury && GS.monsterMaxHP >= 6 && GS.monsterHP > 0 && GS.monsterHP <= Math.ceil(GS.monsterMaxHP/4)){
   GS.bossFury = true;
   if(typeof _triggerBossFury === 'function') _triggerBossFury();
  }
  // Chantier A4 : taunt aléatoire en milieu de combat (HP bas)
  if(typeof maybeMidCombatTaunt==='function') maybeMidCombatTaunt();
  if(GS.activeEvent){GS.eventLeft--;if(GS.eventLeft<=0)GS.activeEvent=null;}
  if(GS.monsterHP>0){$('feedback').innerText=_shieldHeld?`🛡️ Le bouclier résiste ! Frappe encore !`:`✅ TOUCHÉ ! ❤️${GS.monsterHP}/${GS.monsterMaxHP}`;GS.q=generateQ();const _wait=Math.min(9000,Math.max(950,((window._monsterSpeakEnd||0)-Date.now())+350));safeTimeout(()=>{renderQ();},_wait);}
  else{$('feedback').innerText='✅ BRAVO !';ma.classList.add('monster-die');clearMonsterSpeech();if(GS.isBoss){vibrate(VIBE.boss);
   // Chantier 2.2 : débloquer la figurine exclusive du boss saisonnier
   if(GS.isSeasonalBoss && GS.seasonalFigId && typeof unlockSeasonalFigurine==='function'){
    const newlyUnlocked = unlockSeasonalFigurine(GS.seasonalFigId);
    if(newlyUnlocked){
     const fig = (typeof FIGURINES!=='undefined') ? FIGURINES.find(f=>f.id===GS.seasonalFigId) : null;
     const figName = fig ? fig.name : 'figurine exclusive';
     safeTimeout(()=>{
      toast(`✨ FIGURINE EXCLUSIVE DÉBLOQUÉE ! ${fig?fig.em:'🎁'} ${figName}`,5500);
      if(typeof startConfetti==='function') startConfetti();
     },800);
    }
   }
   // Chantier 2.2 : bannière festive anniversaire
   if(GS.isBirthdayBoss){
    safeTimeout(()=>{toast(`🎉 JOYEUX ANNIVERSAIRE ${P.name.toUpperCase()} ! 🎂`,5500);if(typeof startConfetti==='function')startConfetti();},300);
    P.stars=(P.stars||0)+20; // bonus cadeau
   }
   safeTimeout(playCongrats,600);
  }else safeTimeout(nextTurn,750);}
 }else{
GS.errInGame++;GS.combo=0;GS.opCombo=0;GS.lastOpKey=null;$('gc').classList.remove('combo-breaker');
  const opK=q.opKey||'+';P.opStats[opK]=P.opStats[opK]||{ok:0,fail:0};P.opStats[opK].fail++;
  if(typeof _progUpdate==="function") _progUpdate(GM.level, false);
  if(typeof _classStatUpdate==="function") _classStatUpdate(GM.level, q.opKey, false);
  if(q.display&&q.res!==undefined)P.errors=([...(P.errors||[])]).concat(`${q.a||'?'}${q.op||'?'}${q.b||'?'}=${q.res}`).slice(-60);
  // Chantier 1.2 : log dans le registre de révision espacée
  if(typeof logError==="function" && q.display && q.res!==undefined) logError(q.display, q.res, q);
  // v10.0.0 (C2) : liste de session propre pour le récap de fin de partie
  if(q.res!==undefined){
   const _disp = q.display || (q.a!==undefined&&q.b!==undefined ? `${q.a} ${q.op||'='} ${q.b}` : String(q.res));
   GS.errList = Array.isArray(GS.errList) ? GS.errList : [];
   if(!GS.errList.some(e=>e.display===_disp && e.res===q.res)){
    GS.errList.push({display:_disp, res:q.res, opKey:q.opKey||q.op||'+', type:q.type||'normal'});
   }
   // Erreur commise : on retire la question de l'anti-répétition pour qu'elle
   // puisse réapparaître plus tôt (entraînement ciblé).
   try{ if(typeof _untrackQ==='function') _untrackQ(q); }catch(e){}
  }
  // Monster taunts on wrong answer
  monsterSpeak(WRONG_TAUNTS[ri(0,WRONG_TAUNTS.length-1)],2200);
  showCorr(q);if(GM.mode==='qcm'||(q&&q.choices&&q.choices.length))markQCM(ans,false,q.res);hitPlayer('💥 FAUX !');
 }
}
function markQCM(chosen,correct,right){
 // OPT-8 : utilise data-val au lieu de l'id qo-N
 document.querySelectorAll('.qcm-btn').forEach(b=>{
  b.disabled=true;const v=+b.dataset.val;
  if(correct&&v===chosen)b.classList.add('correct');
  if(!correct){if(v===chosen)b.classList.add('wrong');if(v===right)b.classList.add('correct');}
 });
}
const _OP_LABEL={'+':'+','-':'-','×':'×','x':'×','÷':'÷','/':'÷'};
function showCorr(q){
 const el=$('correction');
 let txt=q.hint
  ||(q.type==='fraction'?`${q.display} = ${q.res}`
  :q.type==='missing'?`${q.display} → réponse : ${q.res}`
  :q.op?`${q.a} ${_OP_LABEL[q.op]||q.op} ${q.b} = ${q.res}`
  :`Réponse : ${q.res}`);
 el.innerText='💡 '+txt;el.classList.remove('hidden');
}
function hitPlayer(msg){
 const pw=powers[P.name];
 if(pw?.shielded){pw.shielded=false;$('feedback').style.color='#3498db';$('feedback').innerText='🛡️ Bouclier ! Erreur annulée !';setTimeout(nextTurn,1200);return;}
 GS.pv--;updateHUD();beep(150,'sawtooth',.5);vibrate(VIBE.bad);
 $('gc').classList.add('shake');setTimeout(()=>$('gc').classList.remove('shake'),400);
 $('feedback').style.color='#e74c3c';$('feedback').innerText=msg;$('BODY').classList.add('body-alert');
 if(GS.pv<=0)safeTimeout(()=>endGame(false),1200);else safeTimeout(nextTurn,1600);
}
function updateHUD(){
 $('hud-pv').innerText=GS.pv;$('hud-score').innerText=GS.score;
 const sc=GS.combo>=2;$('hud-combo').classList.toggle('hidden',!sc);if(sc)$('hud-combov').innerText=GS.combo;
}
function updateMonsterHP(){
 const wrap=$('monster-hp-wrap'),show=GS.monsterMaxHP>1;
 wrap.classList.toggle('hidden',!show);
 if(show){
  $('mhp-val').innerText=GS.monsterHP;$('mhp-max').innerText=GS.monsterMaxHP;
  const pct=Math.max(0,GS.monsterHP/GS.monsterMaxHP*100);
  const bar=$('monster-hp-bar');bar.style.width=pct+'%';
  // v8.7.55 (O4.3) : en phase enragée la barre vire au rouge sombre menaçant,
  // sinon dégradé vert→jaune→rouge classique selon le niveau de vie.
  const enraged = !!(GS.isBoss && GS.bossEnraged);
  const fury = !!(GS.isBoss && GS.bossFury);
  bar.style.background = fury ? '#6a0dad' : enraged ? '#c0392b' : (pct>60?'#2ecc71':pct>30?'#f1c40f':'#e74c3c');
  // Marqueur du seuil d'enrage (boss uniquement) : repère visuel de mi-vie
  const thr=$('monster-hp-threshold');
  if(thr){
   if(GS.isBoss){
    const seuil=Math.ceil(GS.monsterMaxHP/2);
    thr.style.left=((seuil/GS.monsterMaxHP)*100)+'%';
    thr.classList.remove('hidden');
    // Une fois enragé, le seuil est franchi : on l'estompe
    thr.classList.toggle('threshold-passed', enraged);
   } else {
    thr.classList.add('hidden');
   }
  }
  // v8.7.56 (O4.4) : 2e marqueur (seuil de Furie à 25%) pour les boss à 3 phases
  const thr2=$('monster-hp-threshold-fury');
  if(thr2){
   if(GS.isBoss && GS.monsterMaxHP >= 6){
    const seuilF=Math.ceil(GS.monsterMaxHP/4);
    thr2.style.left=((seuilF/GS.monsterMaxHP)*100)+'%';
    thr2.classList.remove('hidden');
    thr2.classList.toggle('threshold-passed', fury);
   } else {
    thr2.classList.add('hidden');
   }
  }
  // État enragé / furie sur le conteneur
  wrap.classList.toggle('boss-enraged-bar', enraged && !fury);
  wrap.classList.toggle('boss-fury-bar', fury);
 }
}

// ═══════════════════════════════════════════════════════
// COMBAT
// ═══════════════════════════════════════════════════════
function updateCombatHUD(){
 // Chantier A2 v2 : flag mort subite (passé par GS.suddenDeath)
 const sd = GS.suddenDeath ? ' cp-sudden-death' : '';
 $('combat-players-row').innerHTML=combatPlayers.map((p,i)=>`
  <div class="cp-card${i===combatIdx?' active':''}${p.alive?'':' dead'}${p.alive?sd:''}">
   <div class="cp-avatar">${p.alive?(p.avatar||'🧙'):'💀'}</div>
   <div class="cp-name">${i===combatIdx?'▶ ':''}${esc(p.name)}</div>
   <div class="cp-stats">❤️${p.pv} ⭐${p.score}</div>
   <div class="cp-level">${esc(p.level)}${p.hits>0?` · ⚔️${p.hits}`:''}</div>
  </div>`).join('');
 const cp=combatPlayers[combatIdx];
 if(cp){$('hud-name').innerText=(cp.avatar||'⚔️')+' '+cp.name;$('hud-pv').innerText=cp.pv;$('hud-score').innerText=cp.score;}
 // Chantier A2 v2 : animation slide entre joueurs
 const cards = document.querySelectorAll('.cp-card');
 if(cards[combatIdx]){
  cards[combatIdx].classList.add('cp-incoming');
  setTimeout(()=>cards[combatIdx]?.classList.remove('cp-incoming'), 500);
 }
}

// Chantier A2 v2 : déclenche la mort subite si conditions remplies
function checkSuddenDeath(){
 if(GS.suddenDeath) return; // déjà active
 if(!combatPlayers || combatPlayers.length < 2) return;
 const alive = combatPlayers.filter(p=>p.alive);
 if(alive.length !== 2) return;
 // Compteur de tours sans perte de PV
 GS._noPVLossStreak = GS._noPVLossStreak || 0;
 if(GS._noPVLossStreak < 5) return;
 GS.suddenDeath = true;
 // Affichage du banner
 const banner = document.createElement('div');
 banner.id = 'sudden-death-banner';
 banner.innerHTML = '⚡ MORT SUBITE ! ⚡';
 document.body.appendChild(banner);
 setTimeout(()=>banner.remove(), 3000);
 // Effets son + vibration
 if(typeof beep==='function'){
  [330,277,220,165].forEach((f,i)=>setTimeout(()=>beep(f,'sawtooth',.4,.18),i*120));
 }
 if(typeof vibrate==='function' && typeof VIBE!=='undefined') vibrate(VIBE.boss);
 if(typeof toast==='function') toast('⚡ Une mauvaise réponse = ÉLIMINATION DIRECTE !', 4000);
 updateCombatHUD();
}
function nextAlive(){
 const alive=combatPlayers.filter(p=>p.alive);if(!alive.length)return;
 const n=combatPlayers.length;let nx=(combatIdx+1)%n,t=0;
 while(!combatPlayers[nx].alive&&t<n){nx=(nx+1)%n;t++;}
 if(combatPlayers[nx]?.alive)combatIdx=nx;
}
function nextCombat(){
 const alive=combatPlayers.filter(p=>p.alive);if(alive.length<=1){GS.combatWon=true;return endGame(true);}
 GS.qCount++;GS.isGolden=Math.random()<.15;GS.frozen=false;
 GM.level=combatPlayers[combatIdx].level;
 GS.monsterMaxHP=HP_LVL[GM.level]||1;GS.monsterHP=GS.monsterMaxHP;
 GS.q=((typeof GM!=='undefined'&&GM.subject==='fr'&&typeof GEN_FR!=='undefined'?GEN_FR:GEN)[GM.level]||GEN.CP)(false);$('correction').classList.add('hidden');renderQ();
 const cp = combatPlayers[combatIdx];
 $('quest-title').innerHTML=`⚔️ Tour de <strong>${cp.avatar||'🧙'} ${esc(cp.name)}</strong> <span class="mode-badge m-combat">combat</span>`;
 // Chantier A2 v1 : annonce du tour avec toast + son distinctif
 if(typeof toast==='function') toast(`${cp.avatar||'🧙'} À toi, ${cp.name} !`, 1500);
 if(typeof beep==='function') beep(660,'sine',.25,.18);
 // Chantier A2 v1 : enregistre le timestamp pour mesurer le temps de réponse
 GS._turnStartTime = Date.now();
 // Chantier A2 v1 : commentaire arbitral occasionnel
 if(typeof maybeRefereeComment==='function') maybeRefereeComment();
 renderPowerBar();
}
function validateCombat(ans){
 stopTimer();const q=GS.q,cp=combatPlayers[combatIdx];
 // Chantier A2 v1 : enregistre le temps de réponse
 if(GS._turnStartTime){
  const elapsed = (Date.now() - GS._turnStartTime) / 1000;
  cp.totalAnswerTime = (cp.totalAnswerTime||0) + elapsed;
 }
 if(ans===q.res){
  cp.score+=GS.isGolden?3:1;chargePower(cp.name);
  // Chantier A2 v1 : combo personnel
  cp.currentCombo = (cp.currentCombo||0) + 1;
  cp.bestCombo = Math.max(cp.bestCombo||0, cp.currentCombo);
  cp.correctAnswers = (cp.correctAnswers||0) + 1;
  // Chantier A2 v2 : incrémente streak sans PV perdus
  GS._noPVLossStreak = (GS._noPVLossStreak||0) + 1;
  $('monster-area').classList.add('monster-hit');setTimeout(()=>$('monster-area').classList.remove('monster-hit'),350);
  beep(523,'square',.2);$('feedback').style.color='#2ecc71';$('feedback').innerText=`✅ ${cp.name} touche !`;
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,10); // OPT-5
 }else{
  // Chantier A2 v1 : reset combo personnel
  cp.currentCombo = 0;
  // Chantier A2 v2 : reset du streak "pas de PV perdus"
  GS._noPVLossStreak = 0;
  const pw=powers[cp.name];
  if(pw?.shielded){pw.shielded=false;$('feedback').innerText=`🛡️ ${cp.name} bloqué !`;}
  else{
   // Chantier A2 v2 : en mort subite, élimination directe au lieu de -1 PV
   if(GS.suddenDeath){
    cp.pv = 0; cp.alive = false;
    if(typeof toast==='function') toast(`⚡ ${cp.name} ÉLIMINÉ EN MORT SUBITE !`, 2500);
   } else {
    cp.pv--;
   }
   // Chantier A2 v1 : crédit du "hit" au joueur précédent (qui avait bien répondu et passé le tour)
   _attributeCombatHit(cp);
   if(cp.pv<=0){
    cp.pv=0;cp.alive=false;
    // Chantier A2 v1 : son distinctif d'élimination + qui a éliminé
    if(typeof beep==='function'){
     [220,196,165,131].forEach((f,i)=>setTimeout(()=>beep(f,'sawtooth',.3,.15),i*80));
    }
    if(typeof vibrate==='function' && typeof VIBE!=='undefined') vibrate(VIBE.boss);
   }
  }
  beep(150,'sawtooth',.4);$('feedback').style.color='#e74c3c';
  $('feedback').innerText=`💥 ${cp.name} ${cp.alive?'prend un coup !':'est éliminé ! ❌'}`;showCorr(q);
 }
 updateCombatHUD();
 const alive=combatPlayers.filter(p=>p.alive);
 if(alive.length<=1){GS.combatWon=true;if(alive.length===1)$('feedback').innerText=`🏆 ${alive[0].name} GAGNE !`;safeTimeout(()=>endGame(true),2000);}
 else{
  nextAlive();updateCombatHUD();
  // Chantier A2 v2 : check mort subite après chaque tour
  if(typeof checkSuddenDeath==='function') checkSuddenDeath();
  safeTimeout(nextCombat,1300);
 }
}

// Chantier A2 v1 : crédite la "touche portée" au précédent joueur ayant bien répondu
function _attributeCombatHit(victim){
 // On crédite le joueur "précédent" dans l'ordre de tour qui a répondu juste à sa dernière question
 // Approche simple : on prend le joueur qui était actif AVANT le tour courant
 const idx = combatPlayers.findIndex(p=>p===victim);
 if(idx<0) return;
 // Trouver le joueur précédent (en arrière dans la liste, en sautant les morts)
 const n = combatPlayers.length;
 for(let i=1;i<n;i++){
  const candIdx = (idx - i + n) % n;
  const cand = combatPlayers[candIdx];
  if(cand && cand !== victim && cand.alive){
   cand.hits = (cand.hits||0) + 1;
   // Si la victime est éliminée, c'est aussi un kill
   if(victim.pv<=0){
    cand.killCount = (cand.killCount||0) + 1;
    victim.eliminated = cand.name;
    if(typeof toast==='function') toast(`☠️ ${cand.avatar||''} ${cand.name} élimine ${victim.name} !`, 2200);
   }
   return;
  }
 }
}

// ═══════════════════════════════════════════════════════
// FIN DE PARTIE
// ═══════════════════════════════════════════════════════
function computeStars(score,won){if(!won)return 0;if(score>=15)return 3;if(score>=8)return 2;return 1;}
function renderEndStars(n){
 $('end-stars-visual').innerHTML=['0','1','2'].map(i=>`<span id="es${i}" style="${+i<n?'':'opacity:.3'}">${+i<n?'⭐':'☆'}</span>`).join('');
 for(let i=0;i<n;i++)setTimeout(()=>{const s=$('es'+i);if(s){s.classList.add('star-earned');beep(523+i*150,'sine',.2,.12);}},i*350+200);
}
function endGame(won){
 gameActive=false;clearPendingTimers();
 stopTimer();stopChrono();
 $('BODY').classList.remove('urgency-bg','body-alert');
 clearMonsterSpeech();
 const heart=$('timer-heart');if(heart)heart.style.display='none';
 P.sessionMinutes=(P.sessionMinutes||0)+Math.round((Date.now()-GS.sessionStart)/60000);
 const fl=GM.mode2==='combat'?combatPlayers.map(p=>p.level).join('+'):GM.level;
 P.history=([...(P.history||[]),{date:fmtDate(),timestamp:Date.now(),score:GS.score,mode:GM.mode2,level:fl,won}]).slice(-50);
 P.historyDetailed=([...(P.historyDetailed||[]),{date:fmtDate(),timestamp:Date.now(),score:GS.score,mode:GM.mode2,level:fl,won,maxCombo:GS.maxCombo,errorsCount:GS.errInGame}]).slice(-60);
 // v8.7.0 : gains d'étoiles ×1.5 (beaucoup de figurines à collectionner,
 // éviter la frustration). Math.round pour garder des entiers.
 const _starsGain = Math.round(GS.score * 1.5);
 P.stars=(P.stars||0)+_starsGain;
 // Chantier 2.1 : stats cumulatives pour les paliers
 P._totalStarsEarned=(P._totalStarsEarned||0)+_starsGain;
 P._bestCombo=Math.max(P._bestCombo||0, GS.maxCombo||0);
if(typeof checkMilestones==='function') checkMilestones();
 // Chantier B2 : vérifier l'évolution du stade héros
 if(typeof checkHeroStageProgress==='function') setTimeout(checkHeroStageProgress, 1500);
 // XP
 const xpGained=gainXP(GS.score,won);
 // v8.7.8 (O1) : mise à jour de la progression de zone (sous-niveaux)
 // Si on a gagné une étape de zone, on incrémente stepsCompleted.
 if(won && GM.mapZone && GM.mapStep){
  P.zoneProgress = P.zoneProgress || {};
  const zid = GM.mapZone.id;
  const totalSteps = (Array.isArray(GM.mapZone.steps) ? GM.mapZone.steps.length : 5);
  const cur = P.zoneProgress[zid] || { stepsCompleted:0, completed:false };
  // N'avancer que si on a battu l'étape attendue (évite triche / rejeu déjà fait)
  if(GM.mapStep.idx === cur.stepsCompleted){
   cur.stepsCompleted = Math.min(totalSteps, cur.stepsCompleted + 1);
   if(cur.stepsCompleted >= totalSteps){ cur.completed = true; }
   P.zoneProgress[zid] = cur;
  }
 }
// boss carte
 // v8.7.33 : on vérifie le TYPE de l'étape (source de vérité immuable) plutôt que
 // GS.isBoss (état mouvant pendant le combat). Plus robuste face à d'éventuels
 // futurs bugs qui pourraient altérer GS.isBoss en cours de partie.
 const _isMapBossStep = !!(GM.mapStep && GM.mapStep.def && GM.mapStep.def.type === 'boss');
 if(won && GM.mapZone && _isMapBossStep){
  GS.mapBossWon=true;
  // v8.7.9 (O1) : drop figurine rare au boss de zone uniquement (pas mini-boss)
  if(GM.mapStep && GM.mapStep.def && GM.mapStep.def.dropRare){
   try{
    const owned = P.ownedFigurines || [];
    // Cherche une figurine non possédée parmi les rares/épiques pour récompenser
    const RARE_LIKE = ['rare','épique','epique','légendaire','legendaire','mythique'];
    const FIG = (typeof FIGURINES!=='undefined' && Array.isArray(FIGURINES)) ? FIGURINES : [];
    const candidates = FIG.filter(f=>f && f.id && !owned.includes(f.id) && RARE_LIKE.includes((f.rarity||'').toLowerCase()));
    if(candidates.length){
     const pick = candidates[Math.floor(Math.random()*candidates.length)];
     P.ownedFigurines = [...owned, pick.id];
     if(typeof toast==='function') toast(`🎉 ${pick.name} ajouté à ta collection !`, 3500);
     if(typeof beep==='function'){beep(880,'sine',.4);setTimeout(()=>beep(1100,'sine',.3),180);}
    }
   }catch(e){console.warn('drop figurine boss zone failed', e);}
  }
  if(!(P.mapBossBeaten||[]).includes(GM.mapZone.id)){
   P.mapBossBeaten=[...(P.mapBossBeaten||[]),GM.mapZone.id];
   // Chantier 3.10 : cinématique de zone conquise (remplace l'ancien transition-screen)
   const _zone = GM.mapZone;
   // v8.7.30 (O3-B.2) : détection de la conquête d'un îlot complet.
   // Si toutes les zones de la région sont battues, on enchaîne avec playIslandVictory.
   let _conqueredRegionId = null;
   try{
    const _zoneRegion = (typeof _regionOfZone==='function') ? _regionOfZone(_zone) : null;
    if(_zoneRegion && _regionConquered(_zoneRegion.id)) _conqueredRegionId = _zoneRegion.id;
   }catch(e){ console.warn('Island conquest detection failed', e); }
   setTimeout(()=>{
    if(typeof playZoneVictory==='function'){
     try{startConfetti();}catch(e){}
     // v8.7.30 : si l'îlot est entièrement conquis, enchaîne playZoneVictory → playIslandVictory
     playZoneVictory(_zone, _conqueredRegionId ? () => {
      try{
       if(typeof startConfetti==='function') startConfetti();
       if(typeof playIslandVictory==='function') playIslandVictory(_conqueredRegionId);
      }catch(e){ console.warn('Island victory chain failed', e); }
     } : undefined);
    } else {
     // Fallback ancien comportement si le module cinematics n'est pas chargé
     const trans=$('transition-screen');
     $('trans-monster').textContent='🗺️';
     $('trans-msg').innerHTML=`<div style="color:#f1c40f;font-size:.9em;font-weight:700;letter-spacing:.05em;">ZONE CONQUISE !</div>
      <div style="font-family:'Cinzel Decorative',cursive;font-size:1.3em;color:#2ecc71;margin:8px 0;">${_zone.label}</div>
      <div style="font-size:.85em;color:#bdc3c7;">Une nouvelle zone s'ouvre à toi…</div>`;
     trans.classList.remove('hidden');
     try{startConfetti();
     [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.4,.15),i*120));
     }catch(e){}
     setTimeout(()=>trans.classList.add('hidden'),6000);
    }
   },800);
  }
 }
 if(won&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone)){
  P.levelWins[GM.level]=(P.levelWins[GM.level]||0)+1;
  const _sj=(GM.subject)||'math';
  if(!P.levelWinsBySubj||typeof P.levelWinsBySubj!=='object')P.levelWinsBySubj={};
  if(!P.levelWinsBySubj[_sj])P.levelWinsBySubj[_sj]={};
  P.levelWinsBySubj[_sj][GM.level]=(P.levelWinsBySubj[_sj][GM.level]||0)+1;
 }
 if(won){updateQuests('wins');if(GS.errInGame===0)updateQuests('perfect');updateQuests('stars',GS.score);}
 if(won){P.objectiveDone=(P.objectiveDone||0)+1;if((P.objective||0)>0&&P.objectiveDone>=P.objective)toast('🎯 Objectif du jour atteint !',3500);}
 const newBadges=checkBadges();saveProfileNow(); // sauvegarde immédiate en fin de partie
 if(typeof syncCloudOnEndGame==='function') syncCloudOnEndGame();
 // reset thème si mode carte (priorité clé globale = dernier choix explicite)
 if(GM.mapZone){
  let _th='standard';
  try{ _th=localStorage.getItem('odyssee_theme')||(P.prefs&&P.prefs.theme)||'standard'; }
  catch(e){ _th=(P.prefs&&P.prefs.theme)||'standard'; }
  applyTheme(_th);
  const _ts=$('themeSelect'); if(_ts)_ts.value=_th;
 }
 // v8.7.9 (O1) : adapter le bouton "Rejouer / Retour à la carte" selon contexte
 const _btnReplay = $('btn-replay');
 if(_btnReplay){
  if(GM.mapZone && GM.mapStep){
   _btnReplay.innerHTML = '🗺️ Retour à la carte';
   _btnReplay.style.background = '#16a085';
  } else {
   _btnReplay.innerHTML = '🔄 REJOUER';
   _btnReplay.style.background = '';
  }
 }
 // v8.7.27 : bouton "Retour au module" affiché si on vient d'une étape de map.
 // Mémorise la zone pour pouvoir y revenir directement.
 const _btnReturnModule = $('btn-return-module');
 if(_btnReturnModule){
  if(GM.mapZone && GM.mapStep){
   _btnReturnModule.classList.remove('hidden');
   _btnReturnModule.dataset.zoneId = GM.mapZone.id;
  } else {
   _btnReturnModule.classList.add('hidden');
   _btnReturnModule.dataset.zoneId = '';
  }
 }
 showView('v-end');
 if(GM.mode2==='combat'){
  const sorted=[...combatPlayers].sort((a,b)=>b.score-a.score);const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];
  $('end-title').innerText='⚔️ COMBAT TERMINÉ !';$('end-mode').innerText='Mode Combat';
  // Chantier A2 v1 : classement enrichi avec stats individuelles
  $('end-score').innerHTML='<strong>🏁 Classement :</strong><br>'+sorted.map((p,i)=>{
   const status = p.alive?'❤️':'💀';
   const elim = p.eliminated?` <span style="font-size:.85em;color:#bdc3c7;">(par ${esc(p.eliminated)})</span>`:'';
   return `${medals[i]} ${p.avatar||''} ${esc(p.name)} — ${p.score} pts ${status}${elim}`;
  }).join('<br>');
  // Calcul des prix spéciaux
  const trophies = [];
  // Meilleur combo
  const bestComboP = sorted.reduce((a,b)=>(b.bestCombo||0)>(a.bestCombo||0)?b:a, sorted[0]);
  if(bestComboP.bestCombo >= 3){
   trophies.push(`🌟 <strong>Combo King</strong> : ${bestComboP.avatar||''} ${esc(bestComboP.name)} (×${bestComboP.bestCombo})`);
  }
  // Plus rapide
  const speedP = sorted.filter(p=>p.correctAnswers>=2).reduce((a,b)=>{
   const ta = a.totalAnswerTime/(a.correctAnswers||1), tb = b.totalAnswerTime/(b.correctAnswers||1);
   return tb < ta ? b : a;
  }, sorted.find(p=>p.correctAnswers>=2) || sorted[0]);
  if(speedP && speedP.correctAnswers>=2){
   const avgT = (speedP.totalAnswerTime/speedP.correctAnswers).toFixed(1);
   trophies.push(`⚡ <strong>Éclair</strong> : ${speedP.avatar||''} ${esc(speedP.name)} (${avgT}s/réponse)`);
  }
  // Plus de touches portées
  const fighterP = sorted.reduce((a,b)=>(b.hits||0)>(a.hits||0)?b:a, sorted[0]);
  if(fighterP.hits >= 2){
   trophies.push(`⚔️ <strong>Guerrier</strong> : ${fighterP.avatar||''} ${esc(fighterP.name)} (${fighterP.hits} touches)`);
  }
  // Tueur en série
  const killerP = sorted.reduce((a,b)=>(b.killCount||0)>(a.killCount||0)?b:a, sorted[0]);
  if(killerP.killCount >= 1){
   trophies.push(`☠️ <strong>Chasseur</strong> : ${killerP.avatar||''} ${esc(killerP.name)} (${killerP.killCount} élim.)`);
  }
  if(trophies.length){
   $('end-score').innerHTML += '<br><br><strong>🏆 Prix spéciaux :</strong><br><div style="font-size:.92em;color:#f1c40f;text-align:left;display:inline-block;">'+trophies.join('<br>')+'</div>';
  }
  $('end-stars').innerText='';$('end-enc').innerText='🏆 Bravo à tous !';
  $('end-xp').innerText=`+${xpGained} XP`;
  $('end-correction').innerHTML='';$('end-badges').innerHTML='';renderEndStars(3);startConfetti();return;
 }
 const msgs=ENC[P.name]||ENC.def;
 $('end-title').innerText=won?'🏆 RÉUSSI !':'💀 DÉFAITE…';
 $('end-mode').innerText=`${GM.mapZone?'🗺️ Carte : '+GM.mapZone.label:'Mode : '+GM.mode2} · Niv. ${GM.level}`;
 $('end-score').innerText=`Score : ${GS.score} pts · Combo max : ×${GS.maxCombo}`;
 $('end-stars').innerText=`+${won?Math.round(GS.score*1.5):0} ⭐`;
 $('end-xp').innerText=`+${xpGained} XP · Niv.${levelFromXP(P.xp)}`;
 $('end-enc').innerText=won?String(msgs[ri(0,msgs.length-1)]).replace(/\{name\}/g,P.name||''):'';
 renderEndStars(computeStars(GS.score,won));
 $('end-badges').innerHTML=newBadges.length?'<p style="color:#f1c40f;margin:3px 0;">🏅 '+newBadges.map(b=>b.e+' '+b.l).join(', ')+'</p>':'';
 _renderEndRecap(won);
 if(won)startConfetti();
 // v8.7.10 : NE PAS reset GM.mapZone ici. Le contexte doit être préservé
 // pour que le bouton "Retour à la carte" sache où retourner.
 // Le reset est désormais fait dans returnMenu/endReplayAction au clic.
}
// ═══════════════════════════════════════════════════════
// v10.0.0 (Chantier 2) : récap des erreurs côté enfant
// Regroupe les erreurs de la session par domaine (opKey) avec
// un libellé lisible, la bonne réponse en vert, et un ton encourageant.
// ═══════════════════════════════════════════════════════
const _RECAP_DOMAINS={
 '+':{e:'➕',l:'Addition'}, '-':{e:'➖',l:'Soustraction'},
 'x':{e:'✖️',l:'Multiplication'}, '×':{e:'✖️',l:'Multiplication'},
 '/':{e:'➗',l:'Division'}, '÷':{e:'➗',l:'Division'},
 'frac':{e:'½',l:'Fractions'}, 'num':{e:'🔢',l:'Nombres décimaux'},
 'geo':{e:'📐',l:'Géométrie'}, 'mes':{e:'📏',l:'Grandeurs et mesures'},
 'prop':{e:'⚖️',l:'Proportionnalité'}, 'rel':{e:'±',l:'Nombres relatifs'},
 'litt':{e:'🔤',l:'Calcul littéral'}, 'fonc':{e:'📈',l:'Fonctions'},
 'stat':{e:'📊',l:'Statistiques'}, 'arith':{e:'🔟',l:'Puissances et arithmétique'},
 'algo':{e:'🤖',l:'Algorithmique'}
};
const _RECAP_MAX_LINES=8;
const _RECAP_ENCOURAGE=[
 'Pas grave, ce sont tes pistes d’entraînement. Tu vas y arriver !',
 'Ces petites erreurs, on les retravaille et hop, elles disparaissent !',
 'Chaque erreur t’apprend quelque chose. Bravo d’avoir essayé !',
 'On revoit ça ensemble la prochaine fois — tu progresses !'
];
function _renderEndRecap(won){
 const el=$('end-correction'); if(!el) return;
 const btn=$('btn-end-revision');
 const list=Array.isArray(GS.errList)?GS.errList:[];
 if(!list.length){
  el.innerHTML = won ? '<span style="color:#2ecc71;font-weight:700;">✅ Sans faute, bravo !</span>' : '';
  if(btn) btn.classList.add('hidden');
  return;
 }
 // Regroupe par domaine en préservant l'ordre d'apparition
 const groups=[]; const byKey={};
 for(const it of list){
  const key=it.opKey||'+';
  if(!byKey[key]){ byKey[key]={key, items:[]}; groups.push(byKey[key]); }
  byKey[key].items.push(it);
 }
 let lines=0, html='<strong style="color:#f6b93b;">📒 Ce que tu peux revoir</strong>';
 for(const g of groups){
  if(lines>=_RECAP_MAX_LINES) break;
  const d=_RECAP_DOMAINS[g.key]||{e:'📝',l:'À revoir'};
  html+=`<div style="color:#86b8e6;margin:7px 0 2px;font-weight:700;font-size:.92em;">${d.e} ${d.l}</div>`;
  for(const it of g.items){
   if(lines>=_RECAP_MAX_LINES) break;
   html+=`<div style="padding:1px 0;">${esc(String(it.display))} = <strong style="color:#2ecc71;">${esc(String(it.res))}</strong></div>`;
   lines++;
  }
 }
 const remaining=list.length-lines;
 if(remaining>0) html+=`<div style="color:#bdc3c7;margin-top:4px;font-size:.9em;">… et ${remaining} autre${remaining>1?'s':''}.</div>`;
 html+=`<div style="color:#9fd3a0;margin-top:9px;font-style:italic;font-size:.95em;">${_RECAP_ENCOURAGE[ri(0,_RECAP_ENCOURAGE.length-1)]}</div>`;
 el.innerHTML=html;
 // Bouton « Rejouer mes erreurs » : seulement si des erreurs arithmétiques sont rejouables
 if(btn){
  const _subj=(typeof GM!=='undefined'&&GM.subject)||'math';
  const replayable = _subj==='math'
   ? (P.errors||[]).some(e=>/^\d/.test(e))
   : (P.errorLog||[]).some(e=>(e.subj||'math')===_subj && e.payload && Array.isArray(e.payload.choices));
  btn.classList.toggle('hidden', !replayable);
 }
}
function playCongrats(){
 playVS();const h=GIFS[ri(0,GIFS.length-1)];
 $('congrats-gif').src=h.url;$('congrats-name').innerText=`Bravo ${P.name} ! 🎉`;
 $('v-game').classList.add('hidden');$('gif-overlay').classList.remove('hidden');
 safeTimeout(()=>{$('gif-overlay').classList.add('hidden');endGame(true);},4500);
}
function startConfetti(){
 if(confettiRaf){cancelAnimationFrame(confettiRaf);confettiRaf=null;}
 const can=$('confetti-canvas');can.width=window.innerWidth;can.height=window.innerHeight;const ctx=can.getContext('2d');
 const cs=Array.from({length:90},()=>({x:ri(0,can.width),y:ri(-can.height,0),r:ri(4,10),c:`hsl(${ri(0,360)},100%,55%)`,v:ri(2,6),rot:ri(0,360),dr:ri(-3,3)}));
 function a(){ctx.clearRect(0,0,can.width,can.height);cs.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);ctx.restore();p.y+=p.v;p.rot+=p.dr;});if(cs[0].y<can.height*1.3){confettiRaf=requestAnimationFrame(a);}else{confettiRaf=null;ctx.clearRect(0,0,can.width,can.height);}}
 confettiRaf=requestAnimationFrame(a);
}
// ═══════════════════════════════════════════════════════
// Chantier C3 : Mode "Devoirs" parents — affichage + jeu
// ═══════════════════════════════════════════════════════

/**
 * Renderer de la carte "Devoir du jour" sur l'accueil.
 * Affichée seulement si P.homework existe et !done.
 */
function renderHomework(){
 const box = $('hw-box');
 if(!box) return;
 const hw = P?.homework;
 if(!hw || hw.done){ box.classList.add('hidden'); return; }
 box.classList.remove('hidden');
 const labels = {
  any:'opérations variées', add:'additions', sub:'soustractions',
  mult:'multiplications', div:'divisions',
  table_2:'la table de 2', table_3:'la table de 3', table_4:'la table de 4',
  table_5:'la table de 5', table_6:'la table de 6', table_7:'la table de 7',
  table_8:'la table de 8', table_9:'la table de 9', table_10:'la table de 10',
 };
 const opLabel = labels[hw.type] || 'questions';
 $('hw-desc').innerHTML = `Réussir <strong>${hw.count}</strong> ${opLabel} (niveau ${hw.level}) · <span style="color:#f1c40f;">+${hw.reward} ⭐</span>`;
 const pct = Math.min(100, Math.round((hw.progress || 0) / hw.count * 100));
 $('hw-fill').style.width = pct + '%';
 $('hw-text').innerText = `${hw.progress || 0}/${hw.count} (${pct}%)`;
}

/**
 * Lance une partie en mode "devoir" : toutes les questions sont du type prescrit.
 */
function startHomework(){
 if(!P?.homework || P.homework.done){ toast('⚠️ Aucun devoir actif.'); return; }
 const hw = P.homework;
 // Force la matière, le niveau et le mode
 GM.subject = hw.subject || 'math';
 GM.level = hw.level || 'CE2';
 GM.mode = $('modeSelect').value || 'keyboard';
 GM.mode2 = 'normal';
 GM.homework = true;
 GM.homeworkConfig = hw;
 // Lance comme une partie normale
 startGame();
}

/**
 * Vérifie si une question correspond au type du devoir.
 * Renvoie true si elle compte pour la progression.
 */
function _matchesHomework(q){
 if(!GM.homework || !GM.homeworkConfig) return false;
 const type = GM.homeworkConfig.type;
 if(type === 'any') return true;
 // Devoir d'une matière non-maths : seules les questions de cette matière comptent,
 // et seul le type « tout » est proposé → tout le reste ne compte pas.
 if(GM.homeworkConfig.subject && GM.homeworkConfig.subject !== 'math') return false;
 if(type === 'add') return q.opKey === '+';
 if(type === 'sub') return q.opKey === '-';
 if(type === 'mult') return q.opKey === 'x' || q.opKey === '×';
 if(type === 'div') return q.opKey === '/' || q.opKey === '÷';
 if(type.startsWith('table_')){
  const n = parseInt(type.split('_')[1], 10);
  return (q.opKey === 'x' || q.opKey === '×') && (q.a === n || q.b === n);
 }
 return false;
}

/**
 * Incrémente la progression du devoir si la question matche.
 */
function _trackHomework(q){
 if(!GM.homework || !P.homework || P.homework.done) return;
 if(!_matchesHomework(q)) return;
 P.homework.progress = (P.homework.progress || 0) + 1;
 if(P.homework.progress >= P.homework.count){
  // Devoir complété !
  P.homework.done = true;
  P.stars = (P.stars || 0) + (P.homework.reward || 50);
  if(typeof saveProfileNow === 'function') saveProfileNow();
  if(typeof toast === 'function') toast(`🎉 Devoir terminé ! +${P.homework.reward}⭐`, 4000);
  if(typeof beep === 'function'){
   [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.3,.12),i*120));
  }
 }
 if(typeof saveProfile === 'function') saveProfile();
}
// ═══════════════════════════════════════════════════════
// Chantier A2 v1 : commentaires arbitraux pendant le combat
// ═══════════════════════════════════════════════════════
let _refereeLastIdx = -1;
function maybeRefereeComment(){
 // ne pas spammer : seulement si plus de 2 questions jouées et 25% de chance
 if(GS.qCount < 3 || Math.random() > 0.25) return;
 if(!combatPlayers || combatPlayers.length < 2) return;
 const alive = combatPlayers.filter(p=>p.alive);
 if(alive.length < 2) return;
 const sorted = [...alive].sort((a,b)=>b.score-a.score);
 const leader = sorted[0];
 const last = sorted[sorted.length-1];
 const gap = leader.score - last.score;
 const comments = [];
 // Égalité parfaite
 if(alive.length===2 && alive[0].score===alive[1].score && alive[0].score>0){
  comments.push(`⚖️ Égalité parfaite ! ${alive[0].name} et ${alive[1].name} sont à ${alive[0].score} pts !`);
 }
 // Domination
 if(gap >= 5){
  comments.push(`🔥 ${leader.avatar||''} ${leader.name} domine la partie !`);
 }
 // Combo en cours
 const bigCombo = alive.find(p=>p.currentCombo>=4);
 if(bigCombo){
  comments.push(`🌟 ${bigCombo.avatar||''} ${bigCombo.name} est en feu (×${bigCombo.currentCombo}) !`);
 }
 // PV bas
 const lowHP = alive.find(p=>p.pv===1);
 if(lowHP){
  comments.push(`💔 ${lowHP.avatar||''} ${lowHP.name} ne tient qu'à un fil...`);
 }
 // Outsider remonte
 if(alive.length>=3 && last.score > 0 && gap <= 2){
  comments.push(`🐢 ${last.name} reste dans la course !`);
 }
 if(!comments.length) return;
 // Évite de répéter le même type
 let idx;
 do { idx = ri(0, comments.length-1); } while(comments.length>1 && idx===_refereeLastIdx);
 _refereeLastIdx = idx;
 if(typeof toast === 'function') toast(comments[idx], 2400);
}

// ═══════════════════════════════════════════════════════
// v8.7.45 (O3-C.4) : CARNET D'AVENTURE
// Modale visuelle accessible depuis la carte. Montre la progression par région
// (barres colorées), la galerie des boss vaincus (médaillons), et les stats clés.
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
// v10.2.0 — CARNET DE COLLECTION (section en tête du carnet d'aventure)
// Maternelle : l'arc-en-ciel se complète (6 couleurs d'îlots + violet offert).
// Collège : l'Armure Solaire se forge pièce par pièce (+ Lame d'Aurore).
// État dérivé de _regionConquered / P.storySeen — aucun nouveau stockage.
// ═══════════════════════════════════════════════════════
const _ADV_MAT_ORDER = ['cp','ce1','ce2','cm1','cm2','final']; // rouge→indigo
const _ADV_COL_ORDER = ['cp','ce1','ce2','cm1','cm2','final']; // jambes→casque
const _ADV_COL_PIECES = [
 { key:'legL',  name:'Jambière gauche', power:'Aplomb',       eff:'stabilité',        gem:'radial-gradient(circle at 35% 30%,#ff5a6e,#7a0016)' },
 { key:'legR',  name:'Jambière droite', power:'Élan',         eff:'combo',            gem:'radial-gradient(circle at 35% 30%,#4da3ff,#0a2f7a)' },
 { key:'armL',  name:'Brassard gauche', power:'Égide',        eff:'défense',          gem:'radial-gradient(circle at 35% 30%,#3ddc84,#0a5a2a)' },
 { key:'armR',  name:'Brassard droit',  power:'Frappe',       eff:'puissance',        gem:'radial-gradient(circle at 35% 30%,#b06cff,#3a0a7a)' },
 { key:'torso', name:'Cuirasse',        power:'Cœur d\'Or',   eff:'vitalité',         gem:'radial-gradient(circle at 35% 30%,#ffb13d,#7a4400)' },
 { key:'helm',  name:'Heaume',          power:'Clairvoyance', eff:'lit les attaques', gem:'radial-gradient(circle at 35% 30%,#bfe9ff,#4f86b0)' },
];
function _advCollectionHtml(){
 try{
  const adv = (typeof GM!=='undefined' && GM && GM.adventure) || 'prim';
  if(adv==='matfr') return _advBookHtml();
  if(adv==='primfr') return _advBadgeHtml();
  if(adv==='colfr') return _advLibraryHtml();
  if(adv==='mat') return _advRainbowHtml();
  if(adv==='col') return _advArmorHtml();
  return _advTalismanHtml();
 }catch(e){ return ''; }
}
// ── Carnet maternelle : Mon Arc-en-ciel ─────────────────────────────
function _advRainbowHtml(){
 const seen = (P && P.storySeen) || [];
 const got = _ADV_MAT_ORDER.map(rid => _regionConquered(rid));
 const violet = seen.includes('mat_epilogue');
 const n = got.filter(Boolean).length + (violet?1:0);
 const happy = got.slice(0,6).every(Boolean);
 const BANDS = [ // [d, couleur, largeur] — rouge extérieur → violet intérieur
  ['M40 210 A110 110 0 0 1 260 210','#ff6b6b',13],
  ['M55 210 A95 95 0 0 1 245 210','#ffa94d',12],
  ['M70 210 A80 80 0 0 1 230 210','#ffd43b',12],
  ['M85 210 A65 65 0 0 1 215 210','#69db7c',11],
  ['M100 210 A50 50 0 0 1 200 210','#4dabf7',11],
  ['M115 210 A35 35 0 0 1 185 210','#7c8cf8',10],
  ['M130 210 A20 20 0 0 1 170 210','#c08cf8',10],
 ];
 const on = [...got, violet]; // 7 états dans l'ordre des bandes
 const bands = BANDS.map((b,i)=> on[i]
  ? `<path d="${b[0]}" fill="none" stroke="${b[1]}" stroke-width="${b[2]}" stroke-linecap="round" class="advcol-band-on"/>`
  : `<path d="${b[0]}" fill="none" stroke="#d9d4e8" stroke-width="${Math.max(4,b[2]-6)}" stroke-linecap="round" stroke-dasharray="2 9" opacity=".55"/>`
 ).join('');
 const taleSeen = seen.includes('mat_tale_rainbow');
 const clickable = violet ? `onclick="_openTaleIllus(_MAT_TALE_RAINBOW)" role="button" tabindex="0" title="Lire l'histoire du trésor" style="cursor:pointer"` : '';
 const cloudFill = happy ? '#ffffff' : '#cfd6e6';
 const mouth = happy ? 'M-11 13 q11 12 22 0' : 'M-9 16 q9 -2 18 0';
 const sparks = (violet)
  ? `<g fill="#fff3b0" stroke="#ffd84d" stroke-width="1" class="advcol-spark">
      <path d="M150 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z"/>
      <path d="M196 52 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z"/>
      <path d="M104 52 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z"/></g>` : '';
 const msg = violet ? (taleSeen ? "Arc-en-ciel complet — touche-le pour relire l'histoire du trésor 📖" : "Arc-en-ciel complet ! Touche-le pour lire l'histoire du trésor 🌈✨")
  : happy ? 'Six couleurs ! Le nuage sourit… une surprise t\'attend ✨'
  : n>0 ? `${n} couleur${n>1?'s':''} retrouvée${n>1?'s':''} — continue !`
  : 'Rapporte les couleurs, île après île !';
 return `
  <div class="advlog-section-title">🌈 Mon Arc-en-ciel</div>
  <div class="advcol-box advcol-mat${violet?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 300 226" class="advcol-svg" aria-label="Arc-en-ciel : ${n} couleurs sur 7">
    ${bands}
    <path d="M-10 212 q60 -26 120 0 t140 0 t80 0 V230 H-10 Z" fill="#b5e3b0"/>
    <path d="M-10 218 q80 -16 160 0 t160 0 V230 H-10 Z" fill="#9bd69a"/>
    <g transform="translate(150 78)">
     <g fill="${cloudFill}" ${happy?'filter="drop-shadow(0 3px 8px rgba(255,210,120,.5))"':''}>
      <circle cx="-26" cy="6" r="20"/><circle cx="0" cy="-6" r="26"/><circle cx="28" cy="6" r="20"/>
      <rect x="-44" y="2" width="88" height="22" rx="11"/>
     </g>
     <circle cx="-12" cy="2" r="3.2" fill="#5a5570"/><circle cx="12" cy="2" r="3.2" fill="#5a5570"/>
     <path d="${mouth}" fill="none" stroke="#5a5570" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    ${sparks}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 7</b></div>
  </div>`;
}
// ── Carnet français (maternelle) : Le Grand Livre du Conteur ────────
// Les pages se retrouvent monde après monde ; une fois le Livre complet,
// un clic dessus ouvre l'Histoire B (le conte du Livre).
// ── Lecteur d'histoire illustré (grande image + texte + lecture vocale) ─
function _markTaleSeen(id){ try{ if(P && P.storySeen && P.storySeen.indexOf(id)<0){ P.storySeen.push(id); if(typeof saveProfile==='function') saveProfile(); } }catch(e){} }
function _openTaleIllus(tale){
 try{
  if(!tale || !tale.pages || !tale.pages.length) return;
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(function(){ _renderTaleIllus(tale); }, 300);
 }catch(e){}
}
function _renderTaleIllus(tale){
 const pages=tale.pages, total=pages.length; let step=0;
 _markTaleSeen(tale.id);
 const ov=document.createElement('div'); ov.className='story-overlay';
 function _hero(){ try{ return (typeof P!=='undefined'&&P&&P.name)?String(P.name):'mon ami'; }catch(e){ return 'mon ami'; } }
 function _fill(s){ s=String(s||''); const h=_hero().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return s.replace(/\{hero\}/g,h); }
 function sayCur(){ try{ if(typeof speak==='function'){ const t=_fill(pages[step].text||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); speak(t); } }catch(e){} }
 function stopSay(){ try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){} }
 function close(){ stopSay(); ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
 function render(){
  const p=pages[step];
  ov.innerHTML='<div class="story-parchment" style="max-width:560px;border-top:6px solid '+(tale.accent||'#7c5bd0')+';">'
   +'<div style="text-align:center;font-family:Georgia,serif;font-weight:700;color:'+(tale.accent||'#7c5bd0')+';font-size:15px;margin-bottom:8px;">'+tale.title+'</div>'
   +(p.illus?('<div style="background:#fffaf0;border:2px solid #e6d3a3;border-radius:12px;padding:6px;overflow:hidden;">'+p.illus+'</div>'):'')
   +'<div style="font-family:Georgia,serif;font-size:18px;line-height:1.55;color:#3a2a18;text-align:center;margin:12px 8px 6px;">'+_fill(p.text||'')+'</div>'
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn ti-prev">‹ Avant</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:54%;">'+pages.map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn ti-next">'+(step===total-1?'Fin ✨':'Après ›')+'</button>'
   +'</div>'
   +'<div style="text-align:center;margin-top:6px;"><button class="story-btn ti-read">🔊 Relire</button> <span style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-left:8px;">page '+(step+1)+' / '+total+'</span></div>'
   +'</div>';
  const nx=ov.querySelector('.ti-next'); nx.onclick=function(){ stopSay(); if(step<total-1){ step++; render(); if(tale.autoSpeak) sayCur(); } else close(); };
  const pv=ov.querySelector('.ti-prev'); if(pv) pv.onclick=function(){ stopSay(); if(step>0){ step--; render(); if(tale.autoSpeak) sayCur(); } };
  ov.querySelector('.ti-read').onclick=sayCur;
  if(typeof beep==='function'){ try{ beep(560,'sine',.08,.04); }catch(e){} }
 }
 render(); document.body.appendChild(ov); if(tale.autoSpeak) setTimeout(sayCur,260);
}

// ── Histoire maternelle (maths) : « Le Trésor au bout de l'Arc-en-ciel » ─
// Débloquée au clic sur l'arc-en-ciel reconstitué. Niveau fin de GS.
const _MAT_TALE_RAINBOW = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#dff0ff')+'"/>';
 const ground=(y,c)=>'<path d="M-5 '+y+' q80 -20 155 0 t160 0 V205 H-5 Z" fill="'+(c||'#9bd69a')+'"/>';
 const sun=(x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#ffe066"/><circle cx="'+x+'" cy="'+y+'" r="'+(r+5)+'" fill="#ffe066" opacity=".25"/>';
 const rainbow=(cx,cy,s)=>{ const C=['#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#7c8cf8','#c08cf8']; let p=''; for(let i=0;i<7;i++){ const r=(72-i*8)*s; p+='<path d="M'+(cx-r)+' '+cy+' a'+r+' '+r+' 0 0 1 '+(2*r)+' 0" fill="none" stroke="'+C[i]+'" stroke-width="'+(7*s)+'"/>'; } return p; };
 const pim=(x,y,s)=>{ s=s||1; return '<g transform="translate('+x+' '+y+') scale('+s+')">'
  +'<ellipse cx="0" cy="40" rx="15" ry="4" fill="#000" opacity=".12"/>'
  +'<rect x="-8" y="34" width="5" height="8" rx="2" fill="#5a3a1a"/><rect x="3" y="34" width="5" height="8" rx="2" fill="#5a3a1a"/>'
  +'<path d="M-12 38 L-9 18 L9 18 L12 38 Z" fill="#2e8b57"/>'
  +'<rect x="-12" y="30" width="24" height="3" fill="#d4af37"/>'
  +'<circle cx="0" cy="11" r="9" fill="#f2c79b"/>'
  +'<path d="M-8 14 q8 13 16 0 q-8 5 -16 0 Z" fill="#f0f0f0"/>'
  +'<circle cx="-3" cy="10" r="1.2" fill="#2a1a0a"/><circle cx="3" cy="10" r="1.2" fill="#2a1a0a"/>'
  +'<path d="M-1 12 q1 1.4 2 0" fill="none" stroke="#c0884a" stroke-width="1"/>'
  +'<path d="M-11 4 q11 -7 22 0 Z" fill="#1f6b3a"/><rect x="-7" y="-8" width="14" height="9" rx="2" fill="#2e8b57"/><rect x="-7" y="-2" width="14" height="3" fill="#d4af37"/>'
  +'</g>'; };
 const pot=(x,y,s,open)=>{ s=s||1; let g='<g transform="translate('+x+' '+y+') scale('+s+')">'
  +'<ellipse cx="0" cy="28" rx="26" ry="5" fill="#000" opacity=".15"/>'
  +'<path d="M-24 4 Q-27 28 0 30 Q27 28 24 4 Z" fill="#2b2b33"/>'
  +'<ellipse cx="0" cy="4" rx="24" ry="7" fill="#1c1c22"/>';
  if(open) g+='<ellipse cx="0" cy="2" rx="20" ry="5.5" fill="#ffd84d"/><circle cx="-9" cy="0" r="3.4" fill="#ffe680"/><circle cx="0" cy="-2" r="3.4" fill="#ffe680"/><circle cx="9" cy="0" r="3.4" fill="#ffd84d"/><circle cx="-3" cy="2" r="3.4" fill="#ffd84d"/><circle cx="5" cy="2" r="3.4" fill="#ffe680"/>';
  else g+='<ellipse cx="0" cy="3" rx="20" ry="5" fill="#3a3a44"/>';
  return g+'</g>'; };
 const coin=(x,y,num,r)=>{ r=r||11; return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#e0a81f"/><circle cx="'+x+'" cy="'+y+'" r="'+(r-2.4)+'" fill="#ffd84d"/><text x="'+x+'" y="'+(y+r*0.42)+'" text-anchor="middle" font-family="Georgia,serif" font-size="'+(r*1.05)+'" font-weight="700" fill="#9a6a12">'+num+'</text>'; };
 const lady=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="6" ry="5.2" fill="#e23b3b"/><line x1="'+x+'" y1="'+(y-5)+'" x2="'+x+'" y2="'+(y+5)+'" stroke="#3a1010" stroke-width="1"/><circle cx="'+x+'" cy="'+(y-6)+'" r="2.6" fill="#222"/><circle cx="'+(x-2.5)+'" cy="'+(y-1)+'" r="1" fill="#3a1010"/><circle cx="'+(x+2.5)+'" cy="'+(y+1.5)+'" r="1" fill="#3a1010"/></g>';
 const fly=(x,y,c)=>'<g><ellipse cx="'+(x-3.5)+'" cy="'+(y-2)+'" rx="3.6" ry="4.4" fill="'+c+'"/><ellipse cx="'+(x+3.5)+'" cy="'+(y-2)+'" rx="3.6" ry="4.4" fill="'+c+'"/><ellipse cx="'+(x-3)+'" cy="'+(y+3)+'" rx="3" ry="3.4" fill="'+c+'" opacity=".85"/><ellipse cx="'+(x+3)+'" cy="'+(y+3)+'" rx="3" ry="3.4" fill="'+c+'" opacity=".85"/><rect x="'+(x-0.6)+'" y="'+(y-4)+'" width="1.2" height="9" rx="0.6" fill="#5a3a1a"/></g>';
 const chick=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="6" ry="5.5" fill="#ffd84d"/><circle cx="'+x+'" cy="'+(y-5)+'" r="4.2" fill="#ffe066"/><path d="M'+(x+4)+' '+(y-5)+' l4 -1 -4 -1 Z" fill="#f0922a"/><circle cx="'+(x+1)+'" cy="'+(y-6)+'" r="0.9" fill="#2a1a0a"/><line x1="'+(x-2)+'" y1="'+(y+5)+'" x2="'+(x-2)+'" y2="'+(y+8)+'" stroke="#f0922a" stroke-width="1"/><line x1="'+(x+2)+'" y1="'+(y+5)+'" x2="'+(x+2)+'" y2="'+(y+8)+'" stroke="#f0922a" stroke-width="1"/></g>';
 const frog=(x,y)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="7" ry="5" fill="#5fbf57"/><circle cx="'+(x-3)+'" cy="'+(y-4)+'" r="2.6" fill="#5fbf57"/><circle cx="'+(x+3)+'" cy="'+(y-4)+'" r="2.6" fill="#5fbf57"/><circle cx="'+(x-3)+'" cy="'+(y-4)+'" r="1.1" fill="#1a1a1a"/><circle cx="'+(x+3)+'" cy="'+(y-4)+'" r="1.1" fill="#1a1a1a"/><path d="M'+(x-3)+' '+(y+2)+' q3 2 6 0" fill="none" stroke="#2f7a30" stroke-width="1"/></g>';
 const pad=(x,y)=>'<ellipse cx="'+x+'" cy="'+(y+6)+'" rx="11" ry="4" fill="#3f9a55"/>';
 const fish=(x,y,c)=>'<g><ellipse cx="'+x+'" cy="'+y+'" rx="7" ry="4.4" fill="'+c+'"/><path d="M'+(x+6)+' '+y+' l6 -4 0 8 Z" fill="'+c+'"/><circle cx="'+(x-3)+'" cy="'+(y-1)+'" r="1" fill="#fff"/></g>';
 const firefly=(x,y)=>'<g><circle cx="'+x+'" cy="'+y+'" r="5" fill="#fff3b0" opacity=".55"/><circle cx="'+x+'" cy="'+y+'" r="2.3" fill="#ffe066"/></g>';
 const row=(n,fn,x0,dx,y,jit)=>{ let s=''; for(let i=0;i<n;i++){ s+=fn(x0+i*dx, y+((i%2)?(jit||0):0)); } return s; };

 const P=[];
 P.push({ text:"<b>Le Trésor au bout de l'Arc-en-ciel</b>", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+rainbow(150,150,1.05)+pot(150,120,1.1,false)+pim(214,118,1.15)+sun(258,40,16)) });
 P.push({ text:"Après la grosse pluie, un magnifique arc-en-ciel apparaît dans le ciel. {hero} lève la tête : « Qu'y a-t-il, tout au bout ? »", illus:SV(bg('#dff0ff')+ground(158,'#9bd69a')+rainbow(150,158,1.1)+'<circle cx="60" cy="130" r="10" fill="#f2c79b"/><rect x="54" y="140" width="12" height="22" rx="5" fill="#e8533f"/>'+sun(255,38,15)) });
 P.push({ text:"Soudain, un petit lutin surgit ! Il s'appelle <b>Pim</b>. « Au bout de l'arc-en-ciel se cache un trésor… mais il faut grimper mes <b>sept couleurs</b> ! »", illus:SV(bg('#eaf6ff')+ground(155,'#9bd69a')+rainbow(180,155,0.9)+pim(95,120,2.0)) });
 P.push({ text:"La première couleur, c'est le <b>ROUGE</b> ! Dans le pré rouge, compte les coccinelles avec moi : 1, 2, 3, 4, 5. <b>Cinq</b> coccinelles !", illus:SV(bg('#ffe3e3')+ground(150,'#e86b6b')+row(5,lady,70,42,120,-8)) });
 P.push({ text:"Voici l'<b>ORANGE</b> ! Six papillons orange dansent dans l'air. Comptons-les : 1, 2, 3, 4, 5, 6. <b>Six</b> papillons !", illus:SV(bg('#fff0e0')+ground(155,'#f0a35a')+row(6,(x,y)=>fly(x,y,'#ff922b'),58,40,95,16)) });
 P.push({ text:"Le <b>JAUNE</b>, comme le soleil ! Sept poussins suivent maman poule. 1, 2, 3, 4, 5, 6, 7. <b>Sept</b> poussins !", illus:SV(bg('#fff8d6')+ground(150,'#ffd84d')+sun(40,38,16)+row(7,chick,46,36,125,-7)) });
 P.push({ text:"Le <b>VERT</b> du gazon ! Sur les nénuphars tout ronds, combien de grenouilles ? 1 à 8. <b>Huit</b> grenouilles !", illus:SV(bg('#e3f7e0')+ground(150,'#5fbf57')+row(8,pad,40,32,128,0)+row(8,frog,40,32,124,-6)) });
 P.push({ text:"Le <b>BLEU</b> de l'eau fraîche ! Neuf petits poissons nagent. Compte-les avec Pim : 1 à 9. <b>Neuf</b> poissons !", illus:SV(bg('#d6efff')+'<rect x="0" y="120" width="300" height="85" fill="#4dabf7"/>'+row(9,(x,y)=>fish(x,y,'#ff8f3f'),34,30,150,-12)) });
 P.push({ text:"L'<b>INDIGO</b> du soir qui tombe ! Dix lucioles s'allument une à une, jusqu'à <b>dix</b>. 1, 2, 3… 10 !", illus:SV(bg('#2a2d6a')+ground(160,'#23265a')+row(10,firefly,28,27,120,-16)+'<circle cx="270" cy="35" r="12" fill="#fdf6c3"/>') });
 P.push({ text:"Et enfin le <b>VIOLET</b>, la dernière couleur ! {hero} a grimpé les <b>sept</b> couleurs de l'arc-en-ciel. Bravo, quel courage !", illus:SV(bg('#efe3ff')+ground(155,'#9b6fdf')+rainbow(150,155,1.05)+'<g fill="#a86fd6">'+row(6,(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="4"/><circle cx="'+(x-4)+'" cy="'+(y+3)+'" r="3"/><circle cx="'+(x+4)+'" cy="'+(y+3)+'" r="3"/>',60,36,140,0)+'</g>') });
 P.push({ text:"Tout en haut brille le trésor : un grand <b>chaudron d'or</b> ! Mais il est fermé. Pim demande : « Combien de couleurs as-tu grimpées ? » — « SEPT ! » répond {hero}.", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+pot(150,118,1.5,false)+pim(225,120,1.2)) });
 P.push({ text:"Clic ! Le chaudron s'ouvre. Il déborde de <b>pièces d'or</b>, et sur chacune, un chiffre : 1, 2, 3… jusqu'à 10 !", illus:SV(bg('#fff6df')+ground(155,'#9bd69a')+pot(150,120,1.5,true)+coin(96,150,1)+coin(120,158,2)+coin(150,162,3)+coin(180,158,4)+coin(204,150,5)+coin(110,170,6)+coin(140,174,7)+coin(170,174,8)+coin(200,170,9)+coin(150,150,10)) });
 P.push({ text:"Mais Pim baisse les yeux et soupire. « Ce trésor… je le garde tout seul. Depuis très, très longtemps. Je n'ai personne avec qui jouer. »", illus:SV(bg('#e9eef6')+ground(150,'#9bd69a')+pot(95,120,1.3,true)+pim(180,122,1.6)+'<path d="M186 112 q3 4 0 7" stroke="#6aa6e0" stroke-width="2" fill="none"/>') });
 P.push({ text:"{hero} a une idée. « Et si on <b>partageait</b> ? » Pim appelle tous les amis de la forêt : l'ours, les canetons, le mouton et le hibou !", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')
   +'<g><circle cx="60" cy="120" r="13" fill="#a06a34"/><circle cx="51" cy="108" r="5" fill="#a06a34"/><circle cx="69" cy="108" r="5" fill="#a06a34"/><circle cx="56" cy="118" r="1.6" fill="#2a1a0a"/><circle cx="64" cy="118" r="1.6" fill="#2a1a0a"/></g>'
   +chick(110,130)+chick(124,130)
   +'<g><ellipse cx="175" cy="124" rx="14" ry="11" fill="#f3f3f3"/><circle cx="175" cy="110" r="8" fill="#f3f3f3"/><ellipse cx="170" cy="123" rx="3" ry="4" fill="#3a3a3a"/></g>'
   +'<g><ellipse cx="230" cy="120" rx="12" ry="13" fill="#b07a3a"/><circle cx="225" cy="114" r="4" fill="#fff"/><circle cx="235" cy="114" r="4" fill="#fff"/><circle cx="225" cy="114" r="1.6" fill="#000"/><circle cx="235" cy="114" r="1.6" fill="#000"/><path d="M228 120 l4 0 -2 3 Z" fill="#f0922a"/></g>'
   +pim(20,124,1.0)) });
 P.push({ text:"On partage les pièces : une pour l'ours, deux pour les canetons, trois pour les oiseaux… Chacun reçoit sa part. <b>Partager</b>, c'est joyeux !", illus:SV(bg('#fff6df')+ground(150,'#9bd69a')+coin(60,118,1,12)+coin(120,118,2,12)+coin(150,118,2,12)+coin(200,116,3,12)+coin(218,124,3,12)+'<circle cx="60" cy="150" r="11" fill="#a06a34"/>'+chick(126,150)+chick(146,150)+'<g><ellipse cx="210" cy="150" rx="11" ry="12" fill="#b07a3a"/></g>') });
 P.push({ text:"Pim sourit enfin, de toutes ses dents. « Le <b>vrai trésor</b>, dit-il, c'est d'avoir des amis avec qui partager ! »", illus:SV(bg('#eaf6ff')+ground(150,'#9bd69a')+pim(150,108,2.2)+'<g fill="#ffd84d">'+row(5,(x,y)=>'<path d="M'+x+' '+(y-4)+' l1.2 3 3.2 0 -2.6 2 1 3 -2.8-1.8 -2.8 1.8 1-3 -2.6-2 3.2 0 Z"/>',70,40,70,-6)+'</g>') });
 P.push({ text:"Alors l'arc-en-ciel se met à briller plus fort que jamais, et tout le monde danse de joie sous ses sept couleurs.", illus:SV(bg('#fff0d0')+ground(155,'#9bd69a')+rainbow(150,155,1.15)+pim(110,128,1.0)+chick(150,138)+'<circle cx="190" cy="124" r="11" fill="#a06a34"/>') });
 P.push({ text:"{hero} garde une seule petite pièce d'or, en souvenir. Car le plus beau des trésors, c'était l'<b>amitié</b>. ✨ <b>FIN</b>", illus:SV(bg('#efe3ff')+ground(155,'#9bd69a')+'<circle cx="150" cy="120" r="12" fill="#f2c79b"/><rect x="142" y="132" width="16" height="26" rx="6" fill="#e8533f"/>'+coin(176,120,1,12)+'<path d="M150 86 q8 -10 16 0 q0 9 -8 14 q-8 -5 -8 -14 Z" fill="#ff6b8a"/>') });
 return { id:'mat_tale_rainbow', title:"Le Trésor au bout de l'Arc-en-ciel", accent:'#c08cf8', autoSpeak:true, pages:P };
})();

// ── Histoire primaire (maths) : « La Grande Histoire des Nombres » ──────
// Débloquée au clic sur le Talisman de Calcultopia complet. Niveau fin CM2.
// Fond historique vérifié ; forme romancée et illustrée.
const _PRIM_TALE_NUMBERS = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#f3ecdb')+'"/>';
 const digit=(x,y,n,s,c)=>'<text x="'+x+'" y="'+y+'" font-family="Georgia,serif" font-size="'+(s||18)+'" font-weight="700" fill="'+(c||'#b9893a')+'" text-anchor="middle">'+n+'</text>';
 const tally=(x,y,n)=>{ let s='<g stroke="#5a3a1a" stroke-width="2" stroke-linecap="round">'; for(let i=0;i<n;i++){ s+='<line x1="'+(x+i*6)+'" y1="'+y+'" x2="'+(x+i*6)+'" y2="'+(y+16)+'"/>'; } return s+'</g>'; };
 const spiral=(cx,cy)=>{ const C=['#e0584f','#e7943f','#e9c33d','#56b96a','#3f8fd0','#7a6bd0','#b06cff']; let s=''; for(let i=0;i<7;i++){ const a=i*0.9, r=8+i*7; s+='<circle cx="'+(cx+r*Math.cos(a)).toFixed(1)+'" cy="'+(cy+r*Math.sin(a)).toFixed(1)+'" r="9" fill="'+C[i]+'"/>'+digit((cx+r*Math.cos(a)),(cy+r*Math.sin(a)+4),i+1,11,'#fff'); } return s; };

 const P=[];
 P.push({ text:"<b>La Grande Histoire des Nombres</b> — Les nombres n'ont pas toujours existé. Voici leur incroyable voyage, à travers le monde et les siècles.", illus:SV(bg('#10204a')+spiral(150,100)+'<g fill="#ffe07a">'+'<path d="M40 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z"/><path d="M262 150 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z"/></g>') });
 P.push({ text:"Il y a très longtemps, on ne savait compter que « un, deux… beaucoup ». Pour suivre leur troupeau, les hommes traçaient une encoche par bête sur un bâton ou un os.", illus:SV(bg('#caa86f')+'<path d="M0 130 q150 -40 300 0 V200 H0 Z" fill="#8a6a3a"/><ellipse cx="150" cy="150" rx="110" ry="14" fill="#6e5230"/>'+tally(96,120,5)+tally(140,120,5)+tally(184,120,3)+'<circle cx="60" cy="120" r="10" fill="#3a2a18"/><circle cx="62" cy="116" r="2" fill="#fff"/>') });
 P.push({ text:"Près du lac Édouard, en Afrique, on a retrouvé un os vieux d'environ <b>20 000 ans</b>, couvert d'entailles rangées en colonnes : l'<b>os d'Ishango</b>, peut-être le plus ancien outil de comptage du monde !", illus:SV(bg('#e7d8b0')+'<g transform="rotate(-8 150 110)"><rect x="60" y="92" width="180" height="34" rx="16" fill="#d8c69a" stroke="#9a855a" stroke-width="2"/><rect x="232" y="96" width="14" height="26" rx="5" fill="#b9b6c4"/>'+'<g stroke="#5a4a2a" stroke-width="1.6">'+(function(){let s='';const groups=[3,6,4,8,5,7];let x=78;groups.forEach(g=>{for(let i=0;i<g;i++){s+='<line x1="'+x+'" y1="98" x2="'+x+'" y2="120"/>';x+=4;}x+=8;});return s;})()+'</g></g>') });
 P.push({ text:"Bien plus tard, à Sumer puis à <b>Babylone</b>, les marchands notaient leurs comptes en pressant un roseau dans des <b>tablettes d'argile</b>. Surprise : ils comptaient par paquets de <b>60</b> !", illus:SV(bg('#cdb083')+'<rect x="78" y="44" width="144" height="112" rx="10" fill="#b48a52" stroke="#7a5a2e" stroke-width="3"/>'+'<g fill="#5a3f1e">'+(function(){let s='';for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=98+c*24,y=66+r*22;s+='<path d="M'+x+' '+y+' l4 6 -4 6 -4 -6 Z"/><rect x="'+(x+4)+'" y="'+(y-1)+'" width="9" height="2.4"/>';}return s;})()+'</g>') });
 P.push({ text:"Cette idée nous suit encore aujourd'hui : c'est pour cela qu'une heure dure <b>60 minutes</b>, une minute <b>60 secondes</b>, et qu'un tour complet fait <b>360 degrés</b> !", illus:SV(bg('#dff0ff')+'<circle cx="100" cy="100" r="56" fill="#fff" stroke="#3f6ad0" stroke-width="4"/>'+(function(){let s='<g stroke="#3f6ad0" stroke-width="2">';for(let i=0;i<12;i++){const a=i*30*Math.PI/180;s+='<line x1="'+(100+48*Math.cos(a)).toFixed(1)+'" y1="'+(100+48*Math.sin(a)).toFixed(1)+'" x2="'+(100+54*Math.cos(a)).toFixed(1)+'" y2="'+(100+54*Math.sin(a)).toFixed(1)+'"/>';}return s+'</g>';})()+'<line x1="100" y1="100" x2="100" y2="64" stroke="#16306e" stroke-width="3"/><line x1="100" y1="100" x2="128" y2="100" stroke="#16306e" stroke-width="3"/>'+'<circle cx="225" cy="100" r="40" fill="none" stroke="#e0843a" stroke-width="3" stroke-dasharray="3 4"/>'+digit(225,106,'360°',15,'#c0631a')) });
 P.push({ text:"En <b>Égypte</b>, chaque année, le Nil débordait et effaçait les champs. Des « arpenteurs » les re-mesuraient avec une corde à nœuds. Mesurer la terre, en grec, se dit <b>géométrie</b>.", illus:SV(bg('#f4e3b0')+'<path d="M0 150 q150 -16 300 0 V200 H0 Z" fill="#7ab06a"/><path d="M120 0 q-10 100 0 200 l40 0 q-10 -100 0 -200 Z" fill="#4da3d0"/>'+'<g stroke="#7a5a2e" stroke-width="2"><polyline points="190,150 215,120 245,140" fill="none"/></g><circle cx="190" cy="150" r="2.6" fill="#5a3a1a"/><circle cx="215" cy="120" r="2.6" fill="#5a3a1a"/><circle cx="245" cy="140" r="2.6" fill="#5a3a1a"/>'+'<circle cx="60" cy="120" r="9" fill="#c8945a"/><rect x="54" y="129" width="12" height="22" rx="4" fill="#e8d28a"/>') });
 P.push({ text:"Les Égyptiens écrivaient leurs nombres avec de petits dessins (des <b>hiéroglyphes</b>) et adoraient les <b>fractions</b> : un pain se partageait en 1/2, puis 1/4, puis 1/8…", illus:SV(bg('#efe2bd')+'<g stroke="#8a5a2a" stroke-width="2.4" fill="none"><path d="M50 60 v26"/><path d="M70 62 a10 10 0 1 0 0.1 0"/><path d="M96 58 q8 8 0 28 q-8 -20 0 -28"/></g>'+'<g><circle cx="210" cy="95" r="44" fill="#e8c98a" stroke="#b9893a" stroke-width="2"/><line x1="210" y1="51" x2="210" y2="139" stroke="#b9893a" stroke-width="2"/><line x1="166" y1="95" x2="254" y2="95" stroke="#b9893a" stroke-width="2"/><path d="M210 95 L254 95 A44 44 0 0 0 210 51 Z" fill="#d4a85a"/>'+digit(232,80,'¼',13,'#7a5320')+'</g>') });
 P.push({ text:"En <b>Grèce</b>, le savant <b>Pythagore</b> et ses élèves formaient une école presque secrète. Leur devise : « <b>Tout est nombre !</b> » On leur doit le célèbre théorème du triangle rectangle.", illus:SV(bg('#eef3f7')+'<polygon points="90,150 90,80 150,150" fill="#cfe0f0" stroke="#3f6ad0" stroke-width="2"/><rect x="90" y="138" width="12" height="12" fill="none" stroke="#3f6ad0" stroke-width="1.5"/>'+'<rect x="60" y="80" width="30" height="30" fill="#a7c8ec" opacity=".8"/><rect x="90" y="150" width="60" height="30" fill="#f0c98a" opacity=".8"/>'+digit(150,70,'a² + b² = c²',14,'#2a4a86')) });
 P.push({ text:"Les Grecs poursuivirent un nombre mystérieux, caché dans tous les cercles : <b>π</b> (pi), un peu plus que 3, et dont les chiffres après la virgule ne s'arrêtent jamais !", illus:SV(bg('#fff3df')+'<circle cx="110" cy="100" r="58" fill="none" stroke="#e0843a" stroke-width="4"/><line x1="52" y1="100" x2="168" y2="100" stroke="#16306e" stroke-width="2.4" stroke-dasharray="5 4"/>'+digit(232,96,'π',40,'#c0631a')+digit(232,128,'≈ 3,14…',13,'#7a4a18')) });
 P.push({ text:"Mais il manquait encore un nombre très étrange : le nombre de… <b>rien</b> ! Comment écrire « il ne reste rien » ? Et comment différencier <b>25</b> de <b>205</b> ?", illus:SV(bg('#eceff5')+'<rect x="40" y="70" width="80" height="60" rx="8" fill="#fff" stroke="#9aa6c0" stroke-width="2" stroke-dasharray="5 4"/>'+digit(80,108,'?',30,'#9aa6c0')+digit(210,95,'25',26,'#2a4a86')+digit(210,135,'205',26,'#c0631a')) });
 P.push({ text:"La réponse vint d'<b>Inde</b>. En <b>628</b>, le savant <b>Brahmagupta</b> donna enfin des règles au <b>zéro</b> et en fit un vrai nombre. On l'appelait « sunya » : le vide.", illus:SV(bg('#f1e6d0')+'<circle cx="200" cy="100" r="50" fill="none" stroke="#b9893a" stroke-width="10"/><circle cx="200" cy="100" r="50" fill="none" stroke="#e9c33d" stroke-width="3"/>'+'<g><circle cx="80" cy="86" r="16" fill="#d8a36a"/><path d="M62 150 q18 -34 36 0 Z" fill="#7a4fa0"/><path d="M66 78 q14 -12 28 0" stroke="#3a2a18" stroke-width="2" fill="none"/></g>'+digit(80,140,'628',12,'#5a3a1a')) });
 P.push({ text:"Génial : avec le zéro et la <b>position</b> des chiffres (unités, dizaines, centaines…), on peut écrire <b>tous</b> les nombres avec seulement dix signes : 0 1 2 3 4 5 6 7 8 9 !", illus:SV(bg('#eef3f7')+'<g>'+['centaines','dizaines','unités'].map((t,i)=>{const x=70+i*80;return '<rect x="'+(x-30)+'" y="60" width="60" height="60" rx="6" fill="#fff" stroke="#3f6ad0" stroke-width="2"/>'+digit(x,104,[2,0,5][i],30,'#2a4a86')+'<text x="'+x+'" y="138" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#3f6ad0">'+t+'</text>';}).join('')+'</g>'+digit(150,168,'= 205',16,'#c0631a')) });
 P.push({ text:"À <b>Bagdad</b>, dans la « <b>Maison de la Sagesse</b> », le savant <b>Al-Khwarizmi</b> rassembla ces idées vers l'an 820. De son livre « al-jabr » vient le mot <b>algèbre</b> ; et de son nom vient le mot <b>algorithme</b> !", illus:SV(bg('#f3e7c8')+'<rect x="70" y="80" width="160" height="76" fill="#caa86f" stroke="#7a5a2e" stroke-width="2"/><path d="M60 80 L150 40 L240 80 Z" fill="#9a6a3a" stroke="#7a5a2e" stroke-width="2"/><path d="M150 100 a16 16 0 0 1 0 56 Z" fill="#8a5a2a"/><path d="M150 100 a16 16 0 0 0 0 56 Z" fill="#7a4a1f"/>'+'<rect x="96" y="110" width="36" height="44" rx="3" fill="#3f6ad0"/>'+digit(112,138,'الجبر',12,'#fff')) });
 P.push({ text:"En Europe, on s'embrouillait avec les lourds <b>chiffres romains</b>. En <b>1202</b>, l'Italien <b>Léonard de Pise</b>, dit <b>Fibonacci</b>, publia un livre qui fit découvrir les <b>chiffres « arabes »</b>, bien plus pratiques.", illus:SV(bg('#eef3f7')+'<rect x="30" y="60" width="110" height="80" rx="6" fill="#f6efe0" stroke="#b08a4a" stroke-width="2"/>'+digit(85,108,'MCMXIV',16,'#8a6a3a')+'<text x="85" y="130" text-anchor="middle" font-size="10" fill="#b08a4a">compliqué…</text>'+'<rect x="160" y="60" width="110" height="80" rx="6" fill="#dff0ff" stroke="#3f6ad0" stroke-width="2"/>'+digit(215,110,'1914',24,'#2a4a86')+'<text x="215" y="130" text-anchor="middle" font-size="10" fill="#3f6ad0">facile !</text>') });
 P.push({ text:"Dans ce livre, une drôle d'énigme : si un couple de lapins en fait naître un autre chaque mois… combien à la fin de l'année ? La réponse forme une suite magique : <b>1, 1, 2, 3, 5, 8, 13…</b>, qu'on retrouve jusque dans les fleurs !", illus:SV(bg('#eaf6e6')+'<g fill="#f3f3f3" stroke="#cfcfcf">'+[[55,140],[80,140],[110,135],[150,130]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="9" ry="7"/><circle cx="'+(p[0]-6)+'" cy="'+(p[1]-7)+'" r="3"/><circle cx="'+(p[0]-2)+'" cy="'+(p[1]-9)+'" r="3"/>').join('')+'</g>'+(function(){const seq=[1,1,2,3,5,8,13];let s='';seq.forEach((n,i)=>{s+=digit(190+i*15,70,n,12,'#2a7a4a');});return s;})()+'<path d="M210 150 a26 26 0 1 1 -26 -26" fill="none" stroke="#e0a83a" stroke-width="3"/>') });
 P.push({ text:"Le changement ne fut pas facile : méfiantes, certaines villes <b>interdirent</b> même le zéro, qu'elles trouvaient « louche » ! Mais les chiffres arabes l'emportèrent : on calculait dix fois plus vite.", illus:SV(bg('#f1e6d0')+'<circle cx="120" cy="100" r="44" fill="none" stroke="#caa64e" stroke-width="8"/>'+digit(120,114,'0',42,'#b9893a')+'<circle cx="120" cy="100" r="56" fill="none" stroke="#cc3b3b" stroke-width="6"/><line x1="84" y1="64" x2="156" y2="136" stroke="#cc3b3b" stroke-width="6"/>'+'<g fill="#2a7a4a">'+digit(225,90,'+',16)+digit(225,120,'×',16)+'</g>') });
 P.push({ text:"Puis vinrent les <b>machines</b> : la <b>Pascaline</b> de Blaise Pascal (1642), puis, bien plus tard, les <b>ordinateurs</b>… qui calculent avec seulement deux chiffres : <b>0 et 1</b> !", illus:SV(bg('#e7e2d4')+'<rect x="40" y="90" width="90" height="46" rx="5" fill="#8a6a3a" stroke="#5a3f1e" stroke-width="2"/>'+(function(){let s='<g fill="#caa86f">';for(let i=0;i<4;i++)s+='<circle cx="'+(54+i*22)+'" cy="113" r="8"/>';return s+'</g>';})()+digit(85,82,'1642',11,'#5a3f1e')+'<rect x="180" y="74" width="86" height="60" rx="5" fill="#2a3450" stroke="#16306e" stroke-width="2"/><rect x="188" y="82" width="70" height="44" fill="#0c2a5a"/>'+digit(223,112,'0 1 0 1',13,'#5fd0ff')+'<rect x="206" y="134" width="34" height="10" fill="#2a3450"/>') });
 P.push({ text:"Des encoches sur un vieil os jusqu'aux ordinateurs, les nombres ont voyagé à travers le monde et les siècles. Et toi, quand tu calcules aujourd'hui, tu écris la suite de cette grande histoire ! ✨ <b>FIN</b>", illus:SV(bg('#10204a')+spiral(150,100)+'<g fill="#ffe07a"><path d="M150 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z"/></g>') });
 return { id:'prim_tale_numbers', title:"La Grande Histoire des Nombres", accent:'#3f6ad0', autoSpeak:false, pages:P };
})();

// ── Histoire collège (maths) : « La Saga des Porteurs de l'Armure » ─────
// Débloquée au clic sur l'Armure Solaire complète, le Titan Léthéas vaincu.
// Niveau fin de 3e. Chronique épique (mythologie du jeu).
const _COL_TALE_ARMOR = (function(){
 const SV=(inner)=>'<svg viewBox="0 0 300 200" width="100%" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>';
 const bg=(c)=>'<rect x="0" y="0" width="300" height="200" fill="'+(c||'#15131f')+'"/>';
 const titan=(cx,by,s,glow)=>{ s=s||1; const g='<g transform="translate('+cx+' '+by+') scale('+s+')">'
  +'<path d="M0 0 C-46 -6 -58 -70 -40 -120 C-30 -148 -16 -160 0 -162 C16 -160 30 -148 40 -120 C58 -70 46 -6 0 0 Z" fill="#0c0a16"/>'
  +'<path d="M-22 -150 q22 -22 44 0 q-10 -6 -22 -6 q-12 0 -22 6 Z" fill="#0c0a16"/>'
  +'<circle cx="-12" cy="-128" r="4.5" fill="'+(glow||'#b06cff')+'"/><circle cx="12" cy="-128" r="4.5" fill="'+(glow||'#b06cff')+'"/>'
  +'<g stroke="#2a2440" stroke-width="3" stroke-linecap="round" opacity=".7"><line x1="-44" y1="-70" x2="-72" y2="-58"/><line x1="44" y1="-70" x2="72" y2="-58"/></g>'
  +'</g>'; return g; };
 const armor=(cx,cy,s)=>{ s=s||1; return '<g transform="translate('+cx+' '+cy+') scale('+s+')">'
  +'<ellipse cx="0" cy="86" rx="40" ry="7" fill="#000" opacity=".3"/>'
  +'<circle cx="0" cy="-58" r="16" fill="#e8c24a" stroke="#fff6cc" stroke-width="1.5"/><path d="M-12 -62 a12 12 0 0 1 24 0 Z" fill="#caa23a"/>'
  +'<path d="M-26 -40 Q0 -50 26 -40 L30 36 Q0 50 -30 36 Z" fill="#f0c44a" stroke="#fff6cc" stroke-width="1.6"/>'
  +'<path d="M-26 -40 Q0 -50 26 -40 L24 -30 Q0 -40 -24 -30 Z" fill="#fffdf0" opacity=".5"/>'
  +'<circle cx="0" cy="-6" r="9" fill="#ffe89a" stroke="#7a5200" stroke-width="1.2"/><circle cx="0" cy="-6" r="4.5" fill="#ff8a3d"/>'
  +'<path d="M-26 -38 l-16 6 -2 50 16 2 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/><path d="M26 -38 l16 6 2 50 -16 2 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'<path d="M-18 38 q9 6 18 0 l-2 44 q-7 4 -14 0 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/><path d="M2 38 q9 6 18 0 l-2 44 q-7 4 -14 0 Z" fill="#e0a82a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'</g>'; };
 const sword=(cx,cy,s)=>{ s=s||1; return '<g transform="translate('+cx+' '+cy+') scale('+s+')">'
  +'<circle cx="0" cy="0" r="50" fill="#ffe89a" opacity=".25"/>'
  +'<polygon points="0,-70 7,-50 -7,-50" fill="#fffbe6"/>'
  +'<rect x="-7" y="-54" width="14" height="96" rx="3" fill="#fff2b8" stroke="#fff" stroke-width="1"/>'
  +'<line x1="0" y1="-50" x2="0" y2="40" stroke="#fff" stroke-width="1.4" opacity=".8"/>'
  +'<path d="M-24 44 q24 8 48 0 l-4 9 q-20 6 -40 0 Z" fill="#e8c24a" stroke="#fff6cc" stroke-width="1.2"/>'
  +'<rect x="-5" y="50" width="10" height="22" rx="3" fill="#caa23a"/><circle cx="0" cy="78" r="7" fill="#ff8a3d" stroke="#fff6cc" stroke-width="1.2"/>'
  +'</g>'; };
 const dawn=()=>'<rect x="0" y="0" width="300" height="200" fill="#1a1830"/><path d="M0 130 H300 V200 H0 Z" fill="#241f3e"/><circle cx="150" cy="132" r="42" fill="#ffd24a"/><circle cx="150" cy="132" r="58" fill="#ffd24a" opacity=".25"/><path d="M0 132 H300" stroke="#caa23a" stroke-width="1" opacity=".5"/>';
 const halo=(c)=>'<circle cx="150" cy="100" r="92" fill="'+(c||'#caa23a')+'" opacity=".12"/>';

 const P=[];
 P.push({ text:"<b>La Saga des Porteurs de l'Armure</b> — Cette chronique, gravée à l'intérieur du plastron, n'apparaît qu'à celui qui a reconstitué l'Armure et terrassé le Titan. Tu peux enfin la lire.", illus:SV(bg('#13111d')+halo('#caa23a')+armor(150,100,1.0)) });
 P.push({ text:"Avant les royaumes, avant même les noms, il y avait l'Oubli. On l'appela plus tard <b>Léthéas, le Titan de l'Oubli</b>. Là où s'étendait son ombre, les peuples oubliaient leur langue, leurs ancêtres, jusqu'à leur propre visage.", illus:SV(bg('#0f0d1a')+titan(150,182,1.0)) });
 P.push({ text:"Ce que Léthéas dévorait n'était ni l'or ni le sang, mais la <b>mémoire</b>. Et il le savait : un peuple qui oublie son passé est un peuple sans avenir, aussi vide qu'une page effacée.", illus:'' });
 P.push({ text:"Une seule force résistait à l'Oubli : la <b>lumière</b>. Au sommet d'une montagne battue par les vents, un forgeron-sage, <b>Orïas</b>, recueillit un éclat tombé du soleil et le martela sur son enclume, mille jours et mille nuits durant.", illus:SV(bg('#1b1018')+'<g><circle cx="150" cy="120" r="26" fill="#ff8a3d" opacity=".5"/><rect x="96" y="120" width="108" height="30" rx="6" fill="#2a2230"/><rect x="120" y="104" width="60" height="20" rx="4" fill="#3a3040"/><circle cx="150" cy="114" r="9" fill="#ffd24a"/><g stroke="#ffb13d" stroke-width="2" stroke-linecap="round"><line x1="150" y1="100" x2="146" y2="88"/><line x1="158" y1="102" x2="162" y2="90"/><line x1="142" y1="102" x2="136" y2="92"/></g><rect x="184" y="74" width="9" height="34" rx="3" fill="#6a4a2a" transform="rotate(28 188 90)"/><rect x="196" y="70" width="22" height="12" rx="3" fill="#8a8a92" transform="rotate(28 207 76)"/></g>') });
 P.push({ text:"De ce feu naquit l'<b>Armure Solaire</b> : six pièces, six pouvoirs, et un serment gravé contre le cœur — « <i>Tant qu'un seul se souviendra, l'Oubli ne vaincra pas.</i> »", illus:SV(bg('#13111d')+halo()+armor(150,100,1.05)) });
 P.push({ text:"Mais Orïas était trop vieux pour la revêtir. Il comprit alors la vérité qui ferait sa force comme sa fragilité : l'Armure ne serait jamais l'affaire d'un seul. Elle devrait se <b>transmettre</b>, d'épaule en épaule, à travers les âges.", illus:'' });
 P.push({ text:"<b>Première porteuse — l'Antiquité.</b> Ce fut <b>Cassia l'Archiviste</b>, gardienne de la grande bibliothèque de Mémosa. Quand l'ombre du Titan tomba sur la cité, les habitants oublièrent jusqu'au nom de leurs enfants.", illus:SV(bg('#171426')+'<g stroke="#caa23a" stroke-width="3" fill="none">'+[60,110,160,210,250].map(x=>'<line x1="'+x+'" y1="70" x2="'+x+'" y2="150"/>').join('')+'</g><rect x="44" y="60" width="222" height="12" fill="#b89540"/><rect x="44" y="150" width="222" height="10" fill="#9a7a30"/><rect x="120" y="96" width="56" height="40" rx="3" fill="#e8d8a8"/><line x1="148" y1="96" x2="148" y2="136" stroke="#9a7a30"/></g>') });
 P.push({ text:"Revêtant l'Armure, Cassia illumina les rues et, toute la nuit, lut à voix haute chaque nom inscrit dans ses registres. Un à un, les habitants se souvinrent. Au matin, Mémosa avait retrouvé sa mémoire — mais Cassia, épuisée, savait qu'elle ne tiendrait pas un second assaut.", illus:'' });
 P.push({ text:"Elle confia l'Armure à un jeune messager et lui fit prêter le serment. « Ce n'est pas la force qui fait le porteur, lui dit-elle, mais le <b>refus d'oublier</b>. »", illus:'' });
 P.push({ text:"<b>Deuxième porteur — le Moyen Âge.</b> L'Oubli revint sous la forme d'une étrange fièvre : dans tout un royaume, les chroniques s'effaçaient et les gens perdaient le fil de leur histoire. <b>Sire Aldric</b> reçut l'Armure d'un moine mourant.", illus:SV(bg('#141220')+'<path d="M0 150 H300 V200 H0 Z" fill="#241f33"/><rect x="20" y="150" width="100" height="12" fill="#3a3145"/><rect x="180" y="150" width="100" height="12" fill="#3a3145"/><rect x="120" y="150" width="60" height="14" fill="#2a2230"/>'+armor(150,118,0.62)+'<rect x="150" y="80" width="3" height="40" fill="#caa23a"/>') });
 P.push({ text:"Tandis que des moines copiaient en hâte les derniers livres, Aldric tint seul un pont étroit contre les spectres de l'Oubli. Quand les cartes elles-mêmes s'effacèrent dans le brouillard, le <b>casque</b> de l'Armure lui souffla le chemin du retour.", illus:'' });
 P.push({ text:"Grièvement blessé, il remit l'Armure à une jeune paysanne qui, seule au village, savait lire. À ceux qui s'en étonnaient, il répondit : « L'Armure ne se mérite pas par la naissance, mais par ce qu'on accepte de <b>sauvegarder</b>. »", illus:'' });
 P.push({ text:"<b>Troisième porteuse — la Renaissance.</b> En un temps de redécouvertes, <b>Livia</b> servait dans un atelier d'<b>imprimerie</b>. Elle comprit la première qu'une arme nouvelle venait de naître contre le Titan : la <b>copie</b>.", illus:SV(bg('#1a1726')+'<rect x="96" y="60" width="108" height="78" rx="4" fill="#5a4a2e" stroke="#caa23a" stroke-width="2"/><rect x="110" y="74" width="80" height="40" fill="#2a2230"/><rect x="118" y="50" width="64" height="14" fill="#3a3040"/><g fill="#efe6cf">'+[ [40,150],[70,160],[230,150],[260,162],[150,168]].map(p=>'<rect x="'+p[0]+'" y="'+p[1]+'" width="22" height="16" rx="1" transform="rotate('+((p[0]%30)-12)+' '+p[0]+' '+p[1]+')"/>').join('')+'</g>') });
 P.push({ text:"Là où l'Oubli ne pouvait brûler qu'un livre à la fois, Livia en imprima des milliers, qu'elle dispersa aux quatre coins du monde. « Désormais, dit-elle, pour effacer un savoir, il faudrait tous nous effacer. »", illus:'' });
 P.push({ text:"Elle passa l'Armure en murmurant le serment, qui s'allongeait à présent de tous les noms de celles et ceux qui l'avaient porté avant elle.", illus:'' });
 P.push({ text:"<b>Quatrième porteur — le siècle des Lumières.</b> Vint <b>Augustin</b>, l'un de ces savants qui rêvaient de rassembler toutes les connaissances humaines en un seul grand ouvrage, afin que nul ne puisse plus les confisquer.", illus:SV(bg('#17131f')+'<g><path d="M150 60 l18 10 0 60 -18 10 -18 -10 0 -60 Z" fill="#2a2230" stroke="#caa23a" stroke-width="1.6"/><circle cx="150" cy="104" r="14" fill="#ffd24a"/><circle cx="150" cy="104" r="20" fill="#ffd24a" opacity=".25"/><rect x="146" y="118" width="8" height="24" fill="#5a4a2e"/></g><g fill="#e8d8a8">'+[[70,150],[210,150]].map(p=>'<rect x="'+p[0]+'" y="'+p[1]+'" width="26" height="34" rx="2"/>').join('')+'</g>') });
 P.push({ text:"Quand un pouvoir tyrannique voulut effacer l'histoire d'un peuple entier, Augustin, sous l'Armure, mit les archives à l'abri et alluma la « lanterne de mémoire » : la preuve que la lumière d'un seul peut traverser les nuits les plus noires.", illus:'' });
 P.push({ text:"À sa suite, l'Armure traversa les révolutions et les empires, portée par des héros dont l'Histoire, ironie de l'Oubli, n'a pas toujours retenu le nom — mais l'Armure, elle, se souvient de chacun.", illus:'' });
 P.push({ text:"<b>Cinquième porteuse — l'époque des machines.</b> En un siècle de fer, de vitesse et de guerres, des villes entières furent rasées, et avec elles leurs registres. <b>Nora</b> porta l'Armure parmi les décombres.", illus:'' });
 P.push({ text:"Elle ne sauva ni trône ni trésor, mais des <b>témoignages</b> : des lettres, des photographies, des voix. « Tant qu'un seul témoin parle, répétait-elle, l'Oubli recule d'un pas. »", illus:'' });
 P.push({ text:"Puis l'Armure parvint jusqu'à notre temps. Et c'est ici que la chronique cesse de parler du passé… pour parler de <b>toi</b>.", illus:'' });
 P.push({ text:"Car Léthéas, mille fois repoussé, n'était pas mort : l'Oubli ne meurt pas, il <b>attend</b>. À notre époque, il se réveilla plus puissant que jamais.", illus:SV(bg('#0e0c18')+titan(150,188,1.18,'#c46bff')) });
 P.push({ text:"Mais il avait appris à se déguiser. Non plus en ombre terrifiante, mais en <b>distraction</b> : un flot ininterrompu de bruits et d'images, si rapide qu'on oublie aussitôt ce que l'on vient de voir. Le plus dangereux des oublis est celui que l'on ne remarque même pas.", illus:'' });
 P.push({ text:"C'est alors que l'Armure choisit son nouveau porteur : <b>toi</b>, {hero}. Pièce après pièce, île après île, épreuve après épreuve, tu l'as patiemment reconstituée.", illus:SV(bg('#13111d')+halo('#ffd24a')+armor(150,100,1.05)) });
 P.push({ text:"Et lorsque la dernière pièce, le casque, s'ajusta sur ton front, une lumière jaillit dans ta main : la <b>Lame d'Aurore</b>, forgée par Orïas pour le jour — ce jour — où il faudrait affronter le Titan en personne.", illus:SV(bg('#120f1d')+sword(150,100,1.0)) });
 P.push({ text:"Léthéas se dressa, immense, et prononça le plus terrible de ses sortilèges : il te fit oublier ton propre <b>nom</b>. Un instant, tu vacillas, ne sachant plus qui tu étais, ni pourquoi tu te battais.", illus:SV(bg('#0e0c18')+titan(150,190,1.25,'#c46bff')) });
 P.push({ text:"Mais le serment gravé contre ton cœur se mit à briller. Tu te souvins : de la forge d'Orïas, de Cassia, d'Aldric, de Livia, d'Augustin, de Nora — de <b>tous</b> les porteurs. Et en te souvenant d'eux, tu te souvins enfin de <b>toi</b>.", illus:'' });
 P.push({ text:"D'un seul éclat de la Lame d'Aurore, tu déchiras l'ombre. Léthéas ne fut pas anéanti — l'Oubli ne se tue pas — mais <b>repoussé</b>, renvoyé attendre dans les ténèbres, vaincu une fois encore.", illus:SV(bg('#1a1226')+sword(108,100,0.9)+titan(238,196,0.7,'#5a3a7a')+'<path d="M150 40 L150 170" stroke="#ffe89a" stroke-width="3" opacity=".5"/>') });
 P.push({ text:"Tu connais désormais le secret de l'Armure : sa véritable puissance n'est pas dans son or ni dans sa lame, mais dans la <b>chaîne ininterrompue</b> de celles et ceux qui, de siècle en siècle, ont refusé d'oublier.", illus:SV(dawn()+armor(150,118,0.7)) });
 P.push({ text:"Un jour, à ton tour, tu transmettras l'Armure et le serment à qui saura le tenir. Car tant qu'un seul se souviendra… l'Oubli ne vaincra jamais. ✨ <b>FIN</b>", illus:SV(dawn()) });
 return { id:'col_tale_armor', title:"La Saga des Porteurs de l'Armure", accent:'#caa64e', autoSpeak:false, pages:P };
})();

function _openBookTale(){
 try{
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(()=>{ try{
    var tale = (typeof _STORY!=='undefined' && _STORY && _STORY.bookTale) ? _STORY.bookTale
             : (typeof _MAT_STORY_FR!=='undefined' && _MAT_STORY_FR.bookTale ? _MAT_STORY_FR.bookTale : null);
    if(tale && typeof _showStoryModal==='function') _showStoryModal(tale, null);
  }catch(e){} }, 320);
 }catch(e){}
}
function _advBookHtml(){
 const got = _ADV_MAT_ORDER.map(rid => _regionConquered(rid));
 const n = got.filter(Boolean).length;                 // pages retrouvées (0..6)
 const done = got.every(Boolean);
 const seen = (P && P.storySeen) || [];
 const taleSeen = seen.includes('matfr_booktale');
 // Couleur propre à chaque monde (chatoyant) une fois la page acquise.
 const WORLD=[{c:'#2ecc71',r:'#1e8e4e'},{c:'#ff7fb0',r:'#c64d80'},{c:'#f5a623',r:'#b9791a'},{c:'#3aa0e8',r:'#1f6fb0'},{c:'#9b6fdf',r:'#6e47ac'},{c:'#e74c5b',r:'#b02a38'}];
 const memb=(i,x,y,em)=>{
  if(i===0) return `<g fill="${em}"><circle cx="${x}" cy="${y+1}" r="3.8"/><circle cx="${x-3.3}" cy="${y-2.8}" r="1.7"/><circle cx="${x+3.3}" cy="${y-2.8}" r="1.7"/></g>`;
  if(i===1) return `<g fill="${em}"><circle cx="${x}" cy="${y}" r="1.7"/><circle cx="${x}" cy="${y-3.3}" r="1.7"/><circle cx="${x}" cy="${y+3.3}" r="1.7"/><circle cx="${x-3.3}" cy="${y}" r="1.7"/><circle cx="${x+3.3}" cy="${y}" r="1.7"/></g>`;
  if(i===2) return `<g fill="${em}"><ellipse cx="${x-2}" cy="${y+3}" rx="2.3" ry="1.7"/><rect x="${x-0.1}" y="${y-4}" width="1.5" height="7.3"/><path d="M${x+1.4} ${y-4} q3.8 0 3.8 2.8 q-1.9 -1.9 -3.8 -1 Z"/></g>`;
  if(i===3) return `<path d="M${x} ${y-4.4} q3.9 5 0 9 q-3.9 -4 0 -9 Z" fill="${em}"/>`;
  if(i===4) return `<path d="M${x} ${y-4.6} l1.3 3.2 3.5 0 -2.8 2.2 1.1 3.3 -3.1 -2.1 -3.1 2.1 1.1 -3.3 -2.8 -2.2 3.5 0 Z" fill="${em}"/>`;
  return `<text x="${x}" y="${y+4}" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="${em}">A</text>`;
 };
 const coin=(i,x,y,on)=>{
  const w=WORLD[i], fill=on?w.c:'#cdd0c9', rim=on?w.r:'#a6a89e', em=on?'#ffffff':'#eef0ea';
  return `<circle cx="${x}" cy="${y}" r="12.5" fill="${rim}"/><circle cx="${x}" cy="${y}" r="11" fill="${fill}"/>`
   +`<ellipse cx="${x}" cy="${y-4}" rx="7" ry="3.4" fill="#ffffff" opacity="${on?0.28:0.16}"/>`+memb(i,x,y,em);
 };
 let coins=''; const cxs=[32,66,100,134,168,202]; for(let i=0;i<6;i++){ coins+=coin(i,cxs[i],194,i<n); }
 const glow = done ? ' filter="drop-shadow(0 3px 8px rgba(255,210,90,.5))"' : '';
 const msg = (done && taleSeen) ? "Le Livre est complet — touche-le pour réécouter son histoire 📖"
  : done ? "Le Livre est complet ! Touche-le pour écouter son histoire ✨"
  : n>0 ? `${n} page${n>1?'s':''} retrouvée${n>1?'s':''} — continue, page après page !`
  : "Retrouve les mots, monde après monde !";
 const clickable = done ? `onclick="_openBookTale()" role="button" tabindex="0" title="Écouter l'histoire du Livre" style="cursor:pointer"` : '';
 const haloR = done ? `<ellipse cx="120" cy="100" rx="112" ry="92" fill="url(#gbGlo)"/>` : '';
 return `
  <div class="advlog-section-title">📖 Le Grand Livre</div>
  <div class="advcol-box advcol-mat${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 240 212" class="advcol-svg"${glow} aria-label="Le Grand Livre : ${n} pages sur 6">
    <defs>
     <linearGradient id="gbLea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6678ec"/><stop offset=".5" stop-color="#3a44ad"/><stop offset="1" stop-color="#232a86"/></linearGradient>
     <linearGradient id="gbGld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeead"/><stop offset=".5" stop-color="#e6bd58"/><stop offset="1" stop-color="#bd8f2e"/></linearGradient>
     <linearGradient id="gbPag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff9ec"/><stop offset="1" stop-color="#f0e2bf"/></linearGradient>
     <linearGradient id="gbEdg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efe3c4"/><stop offset="1" stop-color="#cdb98c"/></linearGradient>
     <linearGradient id="gbVal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#6b5a2e" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
     <radialGradient id="gbGlo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
     <radialGradient id="gbSky" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#dff0ff"/><stop offset="1" stop-color="#bfe3c8"/></radialGradient>
    </defs>
    ${haloR}
    <ellipse cx="122" cy="174" rx="94" ry="10" fill="#000000" opacity="0.16"/>
    <rect x="26" y="27" width="188" height="138" rx="9" fill="#1a2070"/>
    <rect x="26" y="26" width="188" height="136" rx="9" fill="url(#gbLea)"/>
    <rect x="27" y="27" width="186" height="3" rx="2" fill="#ffffff" opacity="0.16"/>
    <rect x="32" y="32" width="176" height="124" rx="6" fill="none" stroke="url(#gbGld)" stroke-width="2"/>
    <rect x="36" y="36" width="168" height="116" rx="4" fill="none" stroke="url(#gbGld)" stroke-width=".7"/>
    <g fill="url(#gbGld)"><path d="M32 32 h12 v2.4 h-9.6 v9.6 h-2.4 z"/><path d="M208 32 h-12 v2.4 h9.6 v9.6 h2.4 z"/><path d="M32 156 h12 v-2.4 h-9.6 v-9.6 h-2.4 z"/><path d="M208 156 h-12 v-2.4 h9.6 v9.6 h2.4 z"/></g>
    <rect x="33" y="39" width="174" height="117" rx="4" fill="url(#gbEdg)"/>
    <g stroke="#cbb88c" stroke-width="0.6" opacity="0.7"><line x1="36" y1="154" x2="204" y2="154"/><line x1="38" y1="157" x2="202" y2="157"/></g>
    <path d="M40 42 Q37 100 40 156 L118 156 Q121 100 118 42 Z" fill="url(#gbPag)" stroke="#e3d3a8" stroke-width="1"/>
    <path d="M122 42 Q119 100 122 156 L200 156 Q203 100 200 42 Z" fill="url(#gbPag)" stroke="#e3d3a8" stroke-width="1"/>
    <rect x="117" y="42" width="6" height="114" fill="url(#gbVal)"/>
    <g><rect x="50" y="52" width="58" height="34" rx="4" fill="url(#gbSky)" stroke="#cdbf94" stroke-width="1"/><ellipse cx="79" cy="84" rx="30" ry="9" fill="#86c98a"/><rect x="93" y="72" width="3" height="12" fill="#8a5a2a"/><circle cx="94.5" cy="69" r="7" fill="#4aa85f"/><circle cx="70" cy="79" r="6" fill="#8a5a2a"/><circle cx="70" cy="73.5" r="4.6" fill="#a06a34"/><circle cx="67.6" cy="73" r="1" fill="#2a1a0a"/><circle cx="72.4" cy="73" r="1" fill="#2a1a0a"/><circle cx="66.6" cy="69.5" r="1.6" fill="#a06a34"/><circle cx="73.4" cy="69.5" r="1.6" fill="#a06a34"/></g>
    <g stroke="#c79a3a" stroke-width="1" opacity="0.6"><line x1="50" y1="96" x2="108" y2="96"/><line x1="50" y1="101" x2="100" y2="101"/><line x1="50" y1="106" x2="108" y2="106"/></g>
    <g><path d="M134 96 a30 30 0 0 1 60 0" fill="none" stroke="#e74c3c" stroke-width="3.4"/><path d="M138 96 a26 26 0 0 1 52 0" fill="none" stroke="#f1c40f" stroke-width="3.4"/><path d="M142 96 a22 22 0 0 1 44 0" fill="none" stroke="#2ecc71" stroke-width="3.4"/><path d="M146 96 a18 18 0 0 1 36 0" fill="none" stroke="#3498db" stroke-width="3.4"/><ellipse cx="164" cy="96" rx="22" ry="6" fill="#86c98a"/><circle cx="150" cy="66" r="5" fill="#fff6c8"/></g>
    <g stroke="#c79a3a" stroke-width="1" opacity="0.6"><line x1="132" y1="110" x2="196" y2="110"/><line x1="132" y1="115" x2="186" y2="115"/><line x1="132" y1="120" x2="196" y2="120"/></g>
    <path d="M117 26 L123 26 L123 64 L120 59 L117 64 Z" fill="#c0392b"/><path d="M120 26 L123 26 L123 64 L120 59 Z" fill="#9b2620"/>
    <path d="M58 8 L182 8 Q190 16 182 24 L58 24 Q50 16 58 8 Z" fill="url(#gbGld)" stroke="#a9781f" stroke-width="1"/>
    <path d="M58 8 L46 14 L58 20 Z" fill="#a9781f"/><path d="M182 8 L194 14 L182 20 Z" fill="#a9781f"/>
    <text x="120" y="20" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="700" fill="#5a3d12">Le Grand Livre du Conteur</text>
    ${coins}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 6</b></div>
  </div>`;
}
// ── Carnet primaire FR : le Journal intime du héros ─────────────────
// Couverture de journal intime ornée du médaillon des Gardiens (insigne 3),
// avec un petit super-héros au centre (le héros est fan de ses héros !).
// 5 pierres de district se dorent et révèlent leur emblème ; au complet le
// médaillon rayonne. Cliquable une fois Babel vaincu → Histoire B.
function _advBadgeHtml(){
 const order = (typeof _ADV_MAT_ORDER!=='undefined') ? _ADV_MAT_ORDER : ['cp','ce1','ce2','cm1','cm2','final'];
 const got = order.map(rid => _regionConquered(rid));
 const nD = got.slice(0,5).filter(Boolean).length;   // districts libérés (0..5)
 const islandDone = !!got[5];
 const done = got.every(Boolean);
 const n = got.filter(Boolean).length;
 const seen = (P && P.storySeen) || [];
 const taleSeen = seen.includes('primfr_booktale');
 const gold = '#e9c64a';
 // emblème de chaque district : sons, lecture, vocabulaire, temps, phrase
 const glyph = (i,x,y,on)=>{
  const c = on ? '#5a3e0a' : '#9aa0b0';
  if(i===0) return `<g fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"><circle cx="${x-4}" cy="${y}" r="1.3" fill="${c}"/><path d="M${x-1} ${y-3} a4 4 0 0 1 0 6"/><path d="M${x+2} ${y-5} a7 7 0 0 1 0 10"/></g>`;
  if(i===1) return `<g fill="${c}"><path d="M${x-5} ${y-3} q5 -2 5 0 v6 q-5 -2 -5 0 Z"/><path d="M${x+5} ${y-3} q-5 -2 -5 0 v6 q5 -2 5 0 Z"/></g>`;
  if(i===2) return `<g fill="none" stroke="${c}" stroke-width="1.5"><circle cx="${x-2}" cy="${y-2}" r="2.6"/><path d="M${x} ${y} l4 4 M${x+3} ${y+3} l1.6 -1.6"/></g>`;
  if(i===3) return `<path d="M${x-3.5} ${y-4} h7 l-7 8 h7" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`;
  return `<g fill="${c}"><rect x="${x-5}" y="${y-1.6}" width="3" height="3" rx="1"/><rect x="${x-1.5}" y="${y-1.6}" width="3" height="3" rx="1"/><rect x="${x+2}" y="${y-1.6}" width="3" height="3" rx="1"/></g>`;
 };
 const star = (x,y,c,s)=>{ s=s||4; return `<path d="M${x} ${y-s} l${s*0.34} ${s} ${s} ${s*0.34} -${s*0.82} ${s*0.62} ${s*0.3} ${s} -${s*0.82} -${s*0.6} -${s*0.82} ${s*0.6} ${s*0.3} -${s} -${s*0.82} -${s*0.62} ${s} -${s*0.34} Z" fill="${c}"/>`; };
 // super-héros au centre du médaillon (cape, masque, poing levé)
 const hero = (cx,cy)=>`<g>`
  +`<path d="M${cx-9} ${cy-9} q-12 14 -3 30 l7 -7 q-3 -12 3 -19 Z" fill="#8e1a20"/>`
  +`<path d="M${cx+9} ${cy-9} q12 14 3 30 l-7 -7 q3 -12 -3 -19 Z" fill="#b5232b"/>`
  +`<rect x="${cx-4.5}" y="${cy+11}" width="4" height="10" rx="1.5" fill="#16306e"/><rect x="${cx+0.5}" y="${cy+11}" width="4" height="10" rx="1.5" fill="#16306e"/>`
  +`<rect x="${cx-5.5}" y="${cy+19}" width="5.5" height="4" rx="1.5" fill="#b5232b"/><rect x="${cx}" y="${cy+19}" width="5.5" height="4" rx="1.5" fill="#b5232b"/>`
  +`<path d="M${cx-7} ${cy-3} q7 -3 14 0 l-2 16 h-10 Z" fill="#2e57c8"/>`
  +star(cx,cy+4,gold,3.2)
  +`<path d="M${cx-6} ${cy-1} l-7 7" stroke="#2e57c8" stroke-width="3.4" stroke-linecap="round"/><circle cx="${cx-14}" cy="${cy+7}" r="2.4" fill="#f2c79b"/>`
  +`<path d="M${cx+6} ${cy-2} l9 -11" stroke="#2e57c8" stroke-width="3.4" stroke-linecap="round"/><circle cx="${cx+16}" cy="${cy-14}" r="3" fill="#f2c79b"/>`
  +`<circle cx="${cx}" cy="${cy-12}" r="6.2" fill="#f2c79b"/>`
  +`<path d="M${cx-6.4} ${cy-15} q6.4 -6 12.8 0 q-2 -3 -6.4 -3 q-4.4 0 -6.4 3 Z" fill="#16306e"/>`
  +`<rect x="${cx-6.4}" y="${cy-13}" width="12.8" height="3.6" rx="1.8" fill="#16306e"/>`
  +`<circle cx="${cx-2.6}" cy="${cy-11.2}" r="1" fill="#fff"/><circle cx="${cx+2.6}" cy="${cy-11.2}" r="1" fill="#fff"/>`
  +`</g>`;
 const cx=100, cy=132, R=46, ang=[-90,-18,54,126,198];
 let slots=''; for(let i=0;i<5;i++){ const a=ang[i]*Math.PI/180, x=cx+R*Math.cos(a), y=cy+R*Math.sin(a), on=got[i];
  slots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11" fill="${on?'#f1d979':'#cfd5e6'}" stroke="${on?'#b8902a':'#aab2c8'}" stroke-width="2"/>`+glyph(i,x,y,on); }
 const rays = done ? `<g stroke="${gold}" stroke-width="2.6" stroke-linecap="round" opacity=".75">`+[0,45,90,135,180,225,270,315].map(d=>{ const a=d*Math.PI/180; return `<line x1="${(cx+60*Math.cos(a)).toFixed(1)}" y1="${(cy+60*Math.sin(a)).toFixed(1)}" x2="${(cx+70*Math.cos(a)).toFixed(1)}" y2="${(cy+70*Math.sin(a)).toFixed(1)}"/>`; }).join('')+`</g>` : '';
 const glow = done ? ' filter="drop-shadow(0 4px 12px rgba(233,198,74,.5))"' : '';
 const msg = (done && taleSeen) ? "Journal complet — touche-le pour relire le dossier du Docteur Babel 📖"
  : done ? "Tu es Gardien de l'Alphabet ! Touche le journal pour lire le dossier secret 🦸"
  : nD>0 ? `${nD} district${nD>1?'s':''} libéré${nD>1?'s':''} — le médaillon se forge !`
  : "Libère les districts de Verbopolis, un par un !";
 const clickable = done ? `onclick="_openBookTale()" role="button" tabindex="0" title="Lire le dossier du Docteur Babel" style="cursor:pointer"` : '';
 const _hn = (typeof P!=='undefined' && P && P.name) ? String(P.name) : 'le héros';
 const heroEsc = _hn.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 return `
  <div class="advlog-section-title">📔 Le Journal intime</div>
  <div class="advcol-box advcol-mat${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 200 256" class="advcol-svg"${glow} aria-label="Le Journal intime : ${n} sur 6">
    <defs>
     <linearGradient id="jcLeather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a2a3b"/><stop offset=".5" stop-color="#6e1f2e"/><stop offset="1" stop-color="#46121d"/></linearGradient>
     <linearGradient id="jcSpine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#360c15"/><stop offset="1" stop-color="#5c1824"/></linearGradient>
     <radialGradient id="jcGlow" cx=".5" cy=".4" r=".62"><stop offset="0" stop-color="#a83249" stop-opacity=".5"/><stop offset="1" stop-color="#6e1f2e" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="98" cy="248" rx="80" ry="9" fill="#000" opacity=".28"/>
    <rect x="168" y="26" width="13" height="206" rx="3" fill="#c9bb95"/>
    <rect x="166" y="23" width="13" height="208" rx="3" fill="#e3d7b3"/>
    <rect x="164" y="20" width="13" height="210" rx="3" fill="#f5ecd2" stroke="#d8c79c" stroke-width=".6"/>
    <g stroke="#d8c79c" stroke-width=".5" opacity=".7"><line x1="166" y1="44" x2="176" y2="44"/><line x1="166" y1="74" x2="176" y2="74"/><line x1="166" y1="120" x2="176" y2="120"/><line x1="166" y1="178" x2="176" y2="178"/><line x1="166" y1="208" x2="176" y2="208"/></g>
    <rect x="18" y="14" width="150" height="226" rx="13" fill="url(#jcLeather)" stroke="#2a0a12" stroke-width="3"/>
    <rect x="18" y="14" width="150" height="226" rx="13" fill="url(#jcGlow)"/>
    <rect x="18" y="14" width="22" height="226" rx="11" fill="url(#jcSpine)"/>
    <line x1="40" y1="18" x2="40" y2="236" stroke="#2a0a12" stroke-width="1.3" opacity=".55"/>
    <rect x="23" y="18" width="140" height="218" rx="10" fill="none" stroke="#cf6f86" stroke-width="1.2" opacity=".35"/>
    <rect x="25" y="20" width="136" height="214" rx="9" fill="none" stroke="#360c15" stroke-width="1.2" opacity=".5"/>
    <rect x="30" y="26" width="126" height="202" rx="8" fill="none" stroke="${gold}" stroke-width="1.3" stroke-dasharray="2 4" opacity=".75"/>
    <text x="100" y="41" text-anchor="middle" font-size="13" font-weight="bold" fill="${gold}" font-family="Georgia,serif">Journal intime</text>
    <text x="100" y="56" text-anchor="middle" font-size="11" fill="#f0d98a" font-family="Georgia,serif">de ${heroEsc}</text>
    <text x="100" y="226" text-anchor="middle" font-size="8.6" fill="#e7b9c4" font-family="Georgia,serif">— Gardiens de l'Alphabet —</text>
    <rect x="158" y="14" width="6" height="226" rx="2" fill="#2a0a12" opacity=".7"/>
    <rect x="158.6" y="14" width="2" height="226" fill="#7a2a3a" opacity=".5"/>
    ${rays}
    <circle cx="${cx}" cy="${cy}" r="55" fill="#000" opacity=".22"/>
    <circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="${gold}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="52" fill="#b5232b" stroke="#7a141a" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="42" fill="#1c3f8f" stroke="${gold}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="34" fill="#24499a"/>
    <ellipse cx="${cx}" cy="${cy-12}" rx="28" ry="14" fill="#3a62c8" opacity=".35"/>
    ${hero(cx,cy)}
    ${slots}
   </svg>
   <div class="advcol-caption">${msg} <b>${n} / 6</b></div>
  </div>`;
}
// ── Carnet collège : l'Armure Solaire ───────────────────────────────
function _advArmorHtml(){
 const got = {}; _ADV_COL_ORDER.forEach((rid,i)=>{ got[_ADV_COL_PIECES[i].key] = _regionConquered(rid); });
 const count = Object.values(got).filter(Boolean).length;
 const sword = count>=6;
 const v = k => got[k] ? '' : 'style="display:none"';   // pièce
 const l = k => got[k] ? 'style="display:none"' : '';   // verrou
 const powers = _ADV_COL_PIECES.map(p=>`
   <div class="advcol-power ${got[p.key]?'on':''}">
    <span class="advcol-gem" style="background:${p.gem}"></span> ${p.power}
    <span class="advcol-eff">· ${got[p.key]?p.eff:'verrouillé'}</span>
   </div>`).join('');
 const ult = sword
  ? `<div class="advcol-ult on">⚔️ <b>Lame d'Aurore</b> — puissance à son paroxysme. Prêt pour le Titan.</div>`
  : `<div class="advcol-ult">⚔️ <b>Lame d'Aurore</b> — apparaît quand l'armure est complète.</div>`;
 const titanDone = _regionConquered('titan');
 const seenC=(P&&P.storySeen)||[]; const taleSeenC=seenC.includes('col_tale_armor');
 const clickableC = titanDone ? `onclick="_openTaleIllus(_COL_TALE_ARMOR)" role="button" tabindex="0" title="Lire La Saga des Porteurs de l'Armure" style="cursor:pointer"` : '';
 const sagaInvite = titanDone ? `<div class="advcol-caption">${taleSeenC?"Titan vaincu — touche l'Armure pour relire la Saga 📖":"Titan vaincu ! Touche l'Armure pour lire la Saga des Porteurs ⚔️📜"}</div>` : '';
 return `
  <div class="advlog-section-title">🛡️ Armure Solaire <span class="advcol-count">${count} / 6 pièces</span></div>
  <div class="advcol-box advcol-col${titanDone?' advbook-done':''}" ${clickableC}>
   <svg viewBox="0 0 300 340" class="advcol-svg" aria-label="Armure Solaire : ${count} pièces sur 6">
    <defs>
     <radialGradient id="acAura" cx="50%" cy="38%" r="60%"><stop offset="0%" stop-color="#ffe89a" stop-opacity=".62"/><stop offset="45%" stop-color="#d4a017" stop-opacity=".18"/><stop offset="100%" stop-color="#d4a017" stop-opacity="0"/></radialGradient>
     <linearGradient id="acGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="20%" stop-color="#ffe89a"/><stop offset="52%" stop-color="#f0c44a"/><stop offset="80%" stop-color="#a96f0c"/><stop offset="100%" stop-color="#5e3a00"/></linearGradient>
     <radialGradient id="acDome" cx="36%" cy="28%" r="85%"><stop offset="0%" stop-color="#fffdf0"/><stop offset="32%" stop-color="#ffe89a"/><stop offset="68%" stop-color="#e0a82a"/><stop offset="90%" stop-color="#9a6606"/><stop offset="100%" stop-color="#5e3a00"/></radialGradient>
     <linearGradient id="acGoldH" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="50%" stop-color="#f3cf63"/><stop offset="100%" stop-color="#8a5d06"/></linearGradient>
     <radialGradient id="acRuby" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff0f0"/><stop offset="35%" stop-color="#ff5a6e"/><stop offset="100%" stop-color="#7a0016"/></radialGradient>
     <radialGradient id="acSaph" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#eaf6ff"/><stop offset="35%" stop-color="#4da3ff"/><stop offset="100%" stop-color="#0a2f7a"/></radialGradient>
     <radialGradient id="acEmer" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#eafff2"/><stop offset="35%" stop-color="#3ddc84"/><stop offset="100%" stop-color="#0a5a2a"/></radialGradient>
     <radialGradient id="acAmet" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#f6ecff"/><stop offset="35%" stop-color="#b06cff"/><stop offset="100%" stop-color="#3a0a7a"/></radialGradient>
     <radialGradient id="acTopz" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#fff6d6"/><stop offset="35%" stop-color="#ffb13d"/><stop offset="100%" stop-color="#7a4400"/></radialGradient>
     <radialGradient id="acDiam" cx="38%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#bfe9ff"/><stop offset="100%" stop-color="#4f86b0"/></radialGradient>
     <linearGradient id="acBlade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#ffe89a"/><stop offset="100%" stop-color="#ff8a3d"/></linearGradient>
     <linearGradient id="acRivet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fffbe6"/><stop offset="100%" stop-color="#8a5e10"/></linearGradient>
    </defs>
    <ellipse cx="150" cy="168" rx="128" ry="160" fill="url(#acAura)" opacity="${(0.15+count*0.14).toFixed(2)}"/>
    <g fill="#2a3450" stroke="#3a4670" stroke-width="1.4">
     <circle cx="150" cy="52" r="25"/>
     <path d="M118 92 Q150 84 182 92 L188 168 Q150 186 112 168 Z"/>
     <rect x="86" y="98" width="20" height="78" rx="10"/><rect x="194" y="98" width="20" height="78" rx="10"/>
     <path d="M122 168 q14 8 28 0 l-2 130 q-13 8 -25 0 Z"/><path d="M150 168 q14 8 28 0 l-2 130 q-13 8 -25 0 Z"/>
    </g>
    <g ${l('legL')}><path d="M122 168 q14 8 28 0 l-2 132 q-13 8 -25 0 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('legR')}><path d="M150 168 q14 8 28 0 l-2 132 q-13 8 -25 0 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('armL')}><path d="M104 90 l-22 6 -2 86 24 2 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('armR')}><path d="M196 90 l22 6 2 86 -24 2 Z" fill="none" stroke="#caa64e" stroke-width="1.4" stroke-dasharray="4 4"/></g>
    <g ${l('torso')}><path d="M114 86 Q150 78 186 86 L192 170 Q150 190 108 170 Z" fill="none" stroke="#caa64e" stroke-width="1.5" stroke-dasharray="5 4"/></g>
    <g ${l('helm')}><path d="M120 56 a30 30 0 0 1 60 0 q0 18 -10 26 l-40 0 q-10 -8 -10 -26 Z" fill="none" stroke="#caa64e" stroke-width="1.6" stroke-dasharray="5 4"/></g>
    <g ${v('legL')} class="advcol-piece">
     <path d="M120 166 q15 9 30 0 l-3 52 q-12 6 -24 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M122 168 q14 7 27 0 l-1 6 q-13 6 -25 0 Z" fill="#fffdf0" opacity=".4"/>
     <path d="M121 212 q14 6 28 0 l-1 6 q-13 6 -26 0 Z" fill="#3a2600" opacity=".3"/>
     <g stroke="#fff6cc" stroke-width="1.4" stroke-linecap="round" opacity=".85"><line x1="135" y1="205" x2="135" y2="210"/><line x1="135" y1="226" x2="135" y2="231"/><line x1="124" y1="218" x2="129" y2="218"/><line x1="141" y1="218" x2="146" y2="218"/></g>
     <circle cx="135" cy="218" r="8.5" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.2"/><circle cx="135" cy="218" r="4" fill="url(#acRuby)" stroke="#5a0010" stroke-width=".7"/><circle cx="133.5" cy="216.5" r="1.2" fill="#fff" opacity=".8"/>
     <path d="M124 230 q11 5 22 0 l-3 66 q-9 5 -16 0 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.2"/>
     <path d="M133 232 l-2 64" stroke="#fffdf0" stroke-width="1.4" opacity=".5"/>
     <g stroke="#5e3a00" stroke-width="1" opacity=".5"><line x1="129" y1="240" x2="128" y2="292"/><line x1="139" y1="240" x2="140" y2="292"/></g>
     <circle cx="135" cy="290" r="1.4" fill="url(#acRivet)"/>
    </g>
    <g ${v('legR')} class="advcol-piece">
     <path d="M150 166 q15 9 30 0 l-3 52 q-12 6 -24 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M152 168 q14 7 27 0 l-1 6 q-13 6 -25 0 Z" fill="#fffdf0" opacity=".4"/>
     <path d="M151 212 q14 6 28 0 l-1 6 q-13 6 -26 0 Z" fill="#3a2600" opacity=".3"/>
     <g stroke="#fff6cc" stroke-width="1.4" stroke-linecap="round" opacity=".85"><line x1="165" y1="205" x2="165" y2="210"/><line x1="165" y1="226" x2="165" y2="231"/><line x1="154" y1="218" x2="159" y2="218"/><line x1="171" y1="218" x2="176" y2="218"/></g>
     <circle cx="165" cy="218" r="8.5" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.2"/><circle cx="165" cy="218" r="4" fill="url(#acSaph)" stroke="#08245e" stroke-width=".7"/><circle cx="163.5" cy="216.5" r="1.2" fill="#fff" opacity=".8"/>
     <path d="M154 230 q11 5 22 0 l-3 66 q-9 5 -16 0 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.2"/>
     <path d="M163 232 l-2 64" stroke="#fffdf0" stroke-width="1.4" opacity=".5"/>
     <g stroke="#5e3a00" stroke-width="1" opacity=".5"><line x1="159" y1="240" x2="158" y2="292"/><line x1="169" y1="240" x2="170" y2="292"/></g>
     <circle cx="165" cy="290" r="1.4" fill="url(#acRivet)"/>
    </g>
    <g ${v('armL')} class="advcol-piece">
     <path d="M114 84 Q88 80 74 94 Q69 103 72 112 Q88 109 110 102 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M114 86 Q92 83 80 93" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M76 90 Q66 94 63 102 L73 105 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="95" cy="94" r="3.4" fill="url(#acDome)" stroke="#7a5200" stroke-width="1"/><circle cx="95" cy="94" r="2" fill="url(#acEmer)"/>
     <path d="M84 118 l22 -4 -3 56 -20 -3 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.1"/>
     <path d="M93 116 l-1 56" stroke="#fffdf0" stroke-width="1.3" opacity=".45"/>
     <g stroke="#5e3a00" stroke-width=".9" opacity=".5"><line x1="89" y1="122" x2="88" y2="166"/><line x1="99" y1="122" x2="99" y2="166"/></g>
     <circle cx="94" cy="164" r="1.3" fill="url(#acRivet)"/>
    </g>
    <g ${v('armR')} class="advcol-piece">
     <path d="M186 84 Q212 80 226 94 Q231 103 228 112 Q212 109 190 102 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.3"/>
     <path d="M186 86 Q208 83 220 93" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M224 90 Q234 94 237 102 L227 105 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="205" cy="94" r="3.4" fill="url(#acDome)" stroke="#7a5200" stroke-width="1"/><circle cx="205" cy="94" r="2" fill="url(#acAmet)"/>
     <path d="M216 118 l-22 -4 3 56 20 -3 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1.1"/>
     <path d="M207 116 l1 56" stroke="#fffdf0" stroke-width="1.3" opacity=".45"/>
     <g stroke="#5e3a00" stroke-width=".9" opacity=".5"><line x1="211" y1="122" x2="212" y2="166"/><line x1="201" y1="122" x2="201" y2="166"/></g>
     <circle cx="206" cy="164" r="1.3" fill="url(#acRivet)"/>
    </g>
    <g ${v('torso')} class="advcol-piece">
     <path d="M132 80 q18 -7 36 0 l-3 12 q-15 -5 -30 0 Z" fill="url(#acGoldH)" stroke="#fff6cc" stroke-width="1.1"/>
     <circle cx="140" cy="84" r="1.3" fill="url(#acRivet)"/><circle cx="160" cy="84" r="1.3" fill="url(#acRivet)"/>
     <path d="M114 90 Q150 80 186 90 L190 150 Q150 166 110 150 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.5"/>
     <path d="M114 90 Q150 80 186 90 L184 96 Q150 87 116 96 Z" fill="#fffdf0" opacity=".45"/>
     <path d="M112 142 Q150 158 188 142 L190 150 Q150 166 110 150 Z" fill="#3a2600" opacity=".32"/>
     <path d="M118 94 Q150 85 182 94 L185 146 Q150 160 115 146 Z" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <g fill="url(#acRivet)"><circle cx="120" cy="98" r="1.4"/><circle cx="180" cy="98" r="1.4"/><circle cx="116" cy="130" r="1.4"/><circle cx="184" cy="130" r="1.4"/></g>
     <path d="M126 96 Q140 91 147 97 Q147 116 138 126 Q128 122 124 108 Z" fill="#fffdf0" opacity=".26"/>
     <path d="M174 96 Q160 91 153 97 Q153 116 162 126 Q172 122 176 108 Z" fill="#3a2600" opacity=".26"/>
     <path d="M122 104 q8 14 4 34" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <path d="M178 104 q-8 14 -4 34" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".5"/>
     <g stroke="#fff6cc" stroke-width="2" stroke-linecap="round">
      <line x1="150" y1="100" x2="150" y2="108"/><line x1="150" y1="140" x2="150" y2="148"/><line x1="126" y1="124" x2="134" y2="124"/><line x1="166" y1="124" x2="174" y2="124"/>
      <line x1="134" y1="108" x2="139" y2="113"/><line x1="166" y1="108" x2="161" y2="113"/><line x1="134" y1="140" x2="139" y2="135"/><line x1="166" y1="140" x2="161" y2="135"/>
     </g>
     <circle cx="150" cy="124" r="11" fill="url(#acDome)" stroke="#7a5200" stroke-width="1.4"/>
     <circle cx="150" cy="124" r="5.5" fill="url(#acTopz)" stroke="#5a3a00" stroke-width=".8"/><circle cx="148.5" cy="122.5" r="1.3" fill="#fff" opacity=".8"/>
     <g fill="url(#acGold)" stroke="#fff6cc" stroke-width="1">
      <path d="M120 150 Q150 162 180 150 L178 158 Q150 168 122 158 Z"/>
      <path d="M124 160 Q150 170 176 160 L174 167 Q150 176 126 167 Z" opacity=".96"/>
     </g>
    </g>
    <g ${v('helm')} class="advcol-piece">
     <g fill="url(#acGoldH)" stroke="#fff6cc" stroke-width="1">
      <path d="M122 54 q-9 -2 -17 3 q7 1 10 4 q-6 0 -10 4 q8 0 12 -2 q-2 4 -5 6 q9 -4 13 -9 Z"/>
      <path d="M178 54 q9 -2 17 3 q-7 1 -10 4 q6 0 10 4 q-8 0 -12 -2 q2 4 5 6 q-9 -4 -13 -9 Z"/>
     </g>
     <path d="M122 58 a28 30 0 0 1 56 0 q0 8 -3 14 l-50 0 q-3 -6 -3 -14 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1.5"/>
     <path d="M125 56 a25 26 0 0 1 50 0" fill="none" stroke="#fffdf0" stroke-width="1.6" opacity=".5"/>
     <path d="M127 70 l46 0 q-3 4 -8 6 l-30 0 q-5 -2 -8 -6 Z" fill="#3a2600" opacity=".25"/>
     <path d="M132 44 q18 -10 36 0" fill="none" stroke="#8a5e10" stroke-width="1" opacity=".55"/>
     <g fill="#8a5e10" opacity=".5"><path d="M134 46 l3 -4 1 4 Z"/><path d="M142 42 l3 -4 1 4 Z"/><path d="M158 42 l-3 -4 -1 4 Z"/><path d="M166 46 l-3 -4 -1 4 Z"/></g>
     <g fill="url(#acRivet)"><circle cx="128" cy="66" r="1.3"/><circle cx="172" cy="66" r="1.3"/></g>
     <path d="M150 14 q6 2 6 11 l-2 24 q-4 4 -8 0 l-2 -24 q0 -9 6 -11 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M150 18 q8 9 6 28 q10 -6 12 -17 q-2 -9 -18 -11 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width=".8" opacity=".9"/>
     <line x1="150" y1="22" x2="150" y2="44" stroke="#fffdf0" stroke-width=".8" opacity=".7"/>
     <path d="M150 55 l7 8 -7 10 -7 -10 Z" fill="url(#acDiam)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M150 57 l3 5 -3 4 -3 -4 Z" fill="#ffffff" opacity=".85"/>
     <path d="M126 72 l8 0 2 26 -8 6 -4 -10 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <path d="M174 72 l-8 0 -2 26 8 6 4 -10 Z" fill="url(#acGold)" stroke="#fff6cc" stroke-width="1"/>
     <circle cx="130" cy="78" r="1.2" fill="url(#acRivet)"/><circle cx="170" cy="78" r="1.2" fill="url(#acRivet)"/>
     <rect x="147" y="74" width="6" height="26" rx="2" fill="url(#acGoldH)" stroke="#fff6cc" stroke-width=".8"/>
     <path d="M134 76 q16 -5 32 0 l-2 12 q-14 -4 -28 0 Z" fill="#0a0e1c" opacity=".85"/>
     <g fill="#bfe9ff"><circle cx="143" cy="84" r="1.6"/><circle cx="157" cy="84" r="1.6"/></g>
    </g>
    <g ${sword?'':'style="display:none"'} class="advcol-piece">
     <g transform="rotate(20 236 220)">
      <polygon points="236,108 241,124 231,124" fill="#fffbe6"/>
      <rect x="231" y="120" width="10" height="124" rx="3" fill="url(#acBlade)" stroke="#fff" stroke-width=".6"/>
      <line x1="236" y1="124" x2="236" y2="242" stroke="#fff" stroke-width="1" opacity=".7"/>
      <path d="M214 244 q22 8 44 0 l-3 8 q-19 6 -38 0 Z" fill="url(#acDome)" stroke="#fff6cc" stroke-width="1"/>
      <rect x="232" y="250" width="8" height="22" rx="3" fill="url(#acGold)" stroke="#fff6cc" stroke-width=".8"/>
      <circle cx="236" cy="276" r="7" fill="url(#acTopz)" stroke="#fff6cc" stroke-width="1.2"/>
     </g>
    </g>
    <g fill="#fffef2">
     <path class="advcol-glint" d="M150 116 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4 Z"/>
     <path class="advcol-glint" style="animation-delay:1.2s" d="M150 40 l1.2 3.5 3.5 1.2 -3.5 1.2 -1.2 3.5 -1.2 -3.5 -3.5 -1.2 3.5 -1.2 Z"/>
    </g>
   </svg>
   <div class="advcol-powers">${powers}</div>
   ${ult}
   ${sagaInvite}
  </div>`;
}

// ── Carnet primaire : le Talisman de Calcultopia ────────────────────
const _ADV_PRIM_CRYSTALS = [
 { rid:'cp',  name:"Cristal de l'Unité",     color:'rouge',  grad:'tlRed', dot:'radial-gradient(circle at 35% 30%,#ff6b6b,#7a0016)' },
 { rid:'ce1', name:"Cristal de l'Élan",      color:'orange', grad:'tlOra', dot:'radial-gradient(circle at 35% 30%,#ffa94d,#7a3a00)' },
 { rid:'ce2', name:"Cristal du Voyage",      color:'vert',   grad:'tlGrn', dot:'radial-gradient(circle at 35% 30%,#51d88a,#0a5a2a)' },
 { rid:'cm1', name:"Cristal de la Bravoure", color:'bleu',   grad:'tlBlu', dot:'radial-gradient(circle at 35% 30%,#4dabf7,#0a2f7a)' },
 { rid:'cm2', name:"Cristal de l'Infini",    color:'violet', grad:'tlVio', dot:'radial-gradient(circle at 35% 30%,#b06cff,#3a0a7a)' },
];
function _advTalismanHtml(){
 const CX=150, CY=150, R=104;
 const gemAng=[-90,-18,54,126,198], innerAng=[-54,18,90,162,234];
 const pt=(d,r)=>{ const a=d*Math.PI/180; return [CX+r*Math.cos(a), CY+r*Math.sin(a)]; };
 const fx=v=>v.toFixed(1);
 const got = _ADV_PRIM_CRYSTALS.map(c=>_regionConquered(c.rid));
 const count = got.filter(Boolean).length;
 const done = count>=5;
 // monture étoile 3D + rivets
 const sp=[]; for(let i=0;i<5;i++){ sp.push(pt(gemAng[i],100)); sp.push(pt(innerAng[i],46)); }
 const _ptsStr = sp.map(q=>fx(q[0])+','+fx(q[1])).join(' ');
 let rivets=''; for(let i=0;i<5;i++){ const o=pt(gemAng[i],100), ii=pt(innerAng[i],46);
  rivets+=`<circle cx="${fx(o[0])}" cy="${fx(o[1])}" r="2.1" fill="url(#tlRivet)"/><circle cx="${fx(ii[0])}" cy="${fx(ii[1])}" r="1.6" fill="url(#tlRivet)"/>`; }
 const mount = `
  <polygon points="${_ptsStr}" fill="none" stroke="#0a1228" stroke-width="12" stroke-linejoin="round" transform="translate(0 1.5)"/>
  <polygon points="${_ptsStr}" fill="none" stroke="url(#tlMetalV)" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="${_ptsStr}" fill="none" stroke="#eef5ff" stroke-width="3" stroke-linejoin="round" opacity=".45" transform="translate(0 -1.2)"/>
  <polygon points="${_ptsStr}" fill="none" stroke="#1a2748" stroke-width=".8" stroke-linejoin="round"/>${rivets}`;
 // sertissures
 let bez=''; for(let i=0;i<5;i++){ const c=pt(gemAng[i],R);
  bez+=`<circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="15" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1"/><circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="15" fill="none" stroke="#eef5ff" stroke-width="1" opacity=".4"/><circle cx="${fx(c[0])}" cy="${fx(c[1])}" r="11.5" fill="#0c1530"/>`; }
 // cristaux facettés (seulement ceux libérés)
 const poly=p=>p.map(q=>fx(q[0])+','+fx(q[1])).join(' ');
 let gems=''; for(let i=0;i<5;i++){ if(!got[i]) continue;
  const [cx,cy]=pt(gemAng[i],R); const r=12.5, tr=r*0.46; const oct=[],tab=[];
  for(let k=0;k<8;k++){ const a=(k*45-90)*Math.PI/180; oct.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); tab.push([cx+tr*Math.cos(a),cy+tr*Math.sin(a)]); }
  let fac=''; for(let k=0;k<8;k++) fac+=`<line x1="${fx(oct[k][0])}" y1="${fx(oct[k][1])}" x2="${fx(tab[k][0])}" y2="${fx(tab[k][1])}" stroke="#fff" stroke-width=".5" opacity=".4"/>`;
  gems+=`<g class="advtal-slot">`
   +`<polygon points="${poly(oct)}" fill="url(#${_ADV_PRIM_CRYSTALS[i].grad})" stroke="#fff" stroke-width=".7"/>`
   +fac
   +`<polygon points="${poly(tab)}" fill="#fff" opacity=".22"/><polygon points="${poly(tab)}" fill="none" stroke="#fff" stroke-width=".6" opacity=".5"/>`
   +`<polygon points="${poly([oct[5],oct[6],tab[6],tab[5]])}" fill="#fff" opacity=".5"/>`
   +`<path class="advtal-gleam" transform="translate(${fx(cx-4)} ${fx(cy-5)})" d="M4 0 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z" fill="#fff"/>`
   +`</g>`;
 }
 const center = done
  ? `<g class="advtal-burst" stroke="#ffe07a" stroke-width="2.5" stroke-linecap="round">
      <line x1="150" y1="92" x2="150" y2="72"/><line x1="150" y1="208" x2="150" y2="228"/><line x1="92" y1="150" x2="72" y2="150"/><line x1="208" y1="150" x2="228" y2="150"/>
      <line x1="112" y1="112" x2="98" y2="98"/><line x1="188" y1="112" x2="202" y2="98"/><line x1="112" y1="188" x2="98" y2="202"/><line x1="188" y1="188" x2="202" y2="202"/></g>
     <circle cx="150" cy="150" r="24" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1.5"/><circle cx="150" cy="150" r="24" fill="none" stroke="#eef5ff" stroke-width="1.4" opacity=".4"/>
     <circle cx="150" cy="150" r="19" fill="url(#tlCore)" stroke="#fff6d6" stroke-width="1.2"/>
     <path d="M150 134 l4.5 11.5 12.5 0 -10 8 4 12.5 -11 -7 -11 7 4 -12.5 -10 -8 12.5 0 Z" fill="#fffef2"/>
     <g fill="#fff3b0"><circle class="advtal-spark" cx="150" cy="68" r="2.4"/><circle class="advtal-spark" cx="234" cy="150" r="2.4"/><circle class="advtal-spark" cx="150" cy="232" r="2.4"/><circle class="advtal-spark" cx="66" cy="150" r="2.4"/></g>`
  : `<circle cx="150" cy="150" r="24" fill="url(#tlBezel)" stroke="#1a2748" stroke-width="1.5"/><circle cx="150" cy="150" r="24" fill="none" stroke="#eef5ff" stroke-width="1.4" opacity=".4"/>
     <circle cx="150" cy="150" r="19" fill="url(#tlCore)" stroke="#fff6d6" stroke-width="1.2" opacity="${(0.3+count*0.1).toFixed(2)}"/>`;
 const legend = _ADV_PRIM_CRYSTALS.map((c,i)=>
  `<div class="advtal-lg ${got[i]?'on':''}"><span class="advtal-dot" style="background:${c.dot}"></span><b>${c.name}</b> <span style="opacity:.85">(${c.color})</span></div>`).join('');
 const seen=(P&&P.storySeen)||[]; const taleSeen=seen.includes('prim_tale_numbers');
 const clickable = done ? `onclick="_openTaleIllus(_PRIM_TALE_NUMBERS)" role="button" tabindex="0" title="Lire La Grande Histoire des Nombres" style="cursor:pointer"` : '';
 const msg = done ? (taleSeen ? "Talisman complet — touche-le pour relire La Grande Histoire des Nombres 📖" : "Talisman complet ! Touche-le pour lire La Grande Histoire des Nombres 📜✨")
  : count>0 ? `${count} Cristal${count>1?'aux':''} libéré${count>1?'s':''} — continue !`
  : 'Libère les Cristaux pour reformer le Talisman !';
 return `
  <div class="advlog-section-title">💎 Talisman de Calcultopia <span class="advcol-count">${count} / 5 cristaux</span></div>
  <div class="advcol-box advtal-box${done?' advbook-done':''}" ${clickable}>
   <svg viewBox="0 0 300 300" class="advcol-svg" aria-label="Talisman : ${count} cristaux sur 5">
    <defs>
     <radialGradient id="tlHalo" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="#9fd0ff" stop-opacity=".5"/><stop offset="55%" stop-color="#3f6ad0" stop-opacity=".14"/><stop offset="100%" stop-color="#3f6ad0" stop-opacity="0"/></radialGradient>
     <linearGradient id="tlMetalV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e6eeff"/><stop offset="42%" stop-color="#8ea4d4"/><stop offset="78%" stop-color="#4a5e92"/><stop offset="100%" stop-color="#26345e"/></linearGradient>
     <radialGradient id="tlBezel" cx="38%" cy="30%" r="80%"><stop offset="0%" stop-color="#f2f7ff"/><stop offset="45%" stop-color="#8ea4d4"/><stop offset="100%" stop-color="#26345e"/></radialGradient>
     <linearGradient id="tlRivet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2f7ff"/><stop offset="100%" stop-color="#26345e"/></linearGradient>
     <radialGradient id="tlCore" cx="42%" cy="34%" r="72%"><stop offset="0%" stop-color="#fffef2"/><stop offset="45%" stop-color="#ffe07a"/><stop offset="100%" stop-color="#b9760f"/></radialGradient>
     <radialGradient id="tlRed" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#fff0f0"/><stop offset="35%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#7a0016"/></radialGradient>
     <radialGradient id="tlOra" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#fff3e0"/><stop offset="35%" stop-color="#ffa94d"/><stop offset="100%" stop-color="#7a3a00"/></radialGradient>
     <radialGradient id="tlGrn" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#eafff2"/><stop offset="35%" stop-color="#51d88a"/><stop offset="100%" stop-color="#0a5a2a"/></radialGradient>
     <radialGradient id="tlBlu" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#eaf6ff"/><stop offset="35%" stop-color="#4dabf7"/><stop offset="100%" stop-color="#0a2f7a"/></radialGradient>
     <radialGradient id="tlVio" cx="38%" cy="28%" r="78%"><stop offset="0%" stop-color="#f6ecff"/><stop offset="35%" stop-color="#b06cff"/><stop offset="100%" stop-color="#3a0a7a"/></radialGradient>
    </defs>
    <circle cx="150" cy="150" r="122" fill="url(#tlHalo)" opacity="${(0.25+count*0.12).toFixed(2)}"/>
    <g class="advtal-rays" opacity=".4" stroke="#3f6ad0" stroke-width="1">
     <line x1="150" y1="150" x2="150" y2="30"/><line x1="150" y1="150" x2="264" y2="113"/><line x1="150" y1="150" x2="220" y2="252"/><line x1="150" y1="150" x2="80" y2="252"/><line x1="150" y1="150" x2="36" y2="113"/>
    </g>
    ${mount}${bez}${gems}${center}
   </svg>
   <div class="advcol-caption">${msg}</div>
   <div class="advtal-legend">${legend}</div>
  </div>`;
}

function openAdventureLog(){
 if(typeof P === 'undefined' || !P) return;
 const beaten = P.mapBossBeaten || [];
 // Couleurs accent par région (réutilise la palette des cinématiques d'îlot)
 const regionAccent = {
  cp:'#a8e6a2', ce1:'#5fb95a', ce2:'#f6cb8b', cm1:'#b6c8d4', cm2:'#cbb1ee', final:'#fff4c0', titan:'#ff9a5a',
 };
 // Progression globale
 const totalZones = MAP_ZONES.length;
 const totalBeaten = MAP_ZONES.filter(z => beaten.includes(z.id)).length;
 const globalPct = totalZones > 0 ? Math.round((totalBeaten / totalZones) * 100) : 0;
 // Progression par région
 const regionRows = _ARCH_REGIONS.map(r => {
  const zonesOfRegion = (typeof _zonesOfRegion==='function') ? _zonesOfRegion(r.id) : MAP_ZONES.filter(z => r.levels.includes(z.level));
  if(zonesOfRegion.length === 0) return '';
  const done = zonesOfRegion.filter(z => beaten.includes(z.id)).length;
  const pct = Math.round((done / zonesOfRegion.length) * 100);
  const accent = regionAccent[r.id] || '#f1c40f';
  const isComplete = done === zonesOfRegion.length && done > 0;
  return `
   <div class="advlog-region-row">
    <div class="advlog-region-head">
     <span class="advlog-region-name">${r.label}${isComplete ? ' <span class="advlog-region-crown">👑</span>' : ''}</span>
     <span class="advlog-region-count">${done}/${zonesOfRegion.length}</span>
    </div>
    <div class="advlog-bar-track">
     <div class="advlog-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,${accent},#fff);"></div>
    </div>
   </div>`;
 }).join('');
 // Galerie des boss vaincus (dans l'ordre des zones)
 const bossMedals = MAP_ZONES.filter(z => beaten.includes(z.id)).map(z => `
  <div class="advlog-medal" onclick="closeAdventureLog();setTimeout(()=>_openBossCard('${z.id}'),300);" role="button" title="${z.bossName || 'Boss'} — ${z.label} (voir la carte)">
   <div class="advlog-medal-boss">${z.boss || '🏆'}</div>
   <div class="advlog-medal-zone">${z.label}</div>
  </div>`).join('');
 const bossGallery = bossMedals
  ? `<div class="advlog-medals">${bossMedals}</div>`
  : `<div class="advlog-empty">Aucun boss vaincu pour l'instant. À l'aventure !</div>`;
 // Stats clés
 const stars = P.stars || 0;
 const figs = (P.ownedFigurines || []).length;
 const xp = P.xp || 0;
 const lvl = Math.floor(xp / 100) + 1;
 // Construction de l'overlay
 const overlay = document.createElement('div');
 overlay.className = 'advlog-overlay';
 overlay.innerHTML = `
  <div class="advlog-modal">
   <button class="advlog-close" onclick="closeAdventureLog()" aria-label="Fermer">✕</button>
   <div class="advlog-header">
    <div class="advlog-avatar">${P.avatar || '🧒'}</div>
    <div class="advlog-header-text">
     <div class="advlog-hero-name">${P.name || 'Héros'}</div>
     <div class="advlog-hero-level">Niveau ${lvl} · Aventurier${heroGender(P.name)==='f'?'ère':''}</div>
    </div>
   </div>
   <div class="advlog-global">
    <div class="advlog-global-label">Progression de l'Odyssée</div>
    <div class="advlog-bar-track advlog-bar-big">
     <div class="advlog-bar-fill" style="width:${globalPct}%;background:linear-gradient(90deg,#f1c40f,#f39c12,#fff5d6);"></div>
     <span class="advlog-global-pct">${totalBeaten}/${totalZones} zones · ${globalPct}%</span>
    </div>
   </div>
   <div class="advlog-stats">
    <div class="advlog-stat"><span class="advlog-stat-ico">⭐</span><span class="advlog-stat-val">${stars}</span><span class="advlog-stat-lbl">étoiles</span></div>
    <div class="advlog-stat"><span class="advlog-stat-ico">🎭</span><span class="advlog-stat-val">${figs}</span><span class="advlog-stat-lbl">figurines</span></div>
    <div class="advlog-stat"><span class="advlog-stat-ico">⚡</span><span class="advlog-stat-val">${xp}</span><span class="advlog-stat-lbl">XP</span></div>
   </div>
   ${(typeof _advCollectionHtml==='function')?_advCollectionHtml():''}
   <div class="advlog-section-title">🗺️ Progression par région</div>
   <div class="advlog-regions">${regionRows}</div>
   <div class="advlog-section-title">🏆 Boss vaincus (${totalBeaten})</div>
   ${bossGallery}
   ${(typeof _questJournalCarnetHtml==='function')?_questJournalCarnetHtml():''}
  </div>
 `;
 document.body.appendChild(overlay);
 // Fermeture au clic sur le fond
 overlay.addEventListener('click', (ev) => {
  if(ev.target === overlay) closeAdventureLog();
 });
 // Animation d'entrée
 requestAnimationFrame(() => overlay.classList.add('advlog-show'));
}
function closeAdventureLog(){
 const overlay = document.querySelector('.advlog-overlay');
 if(!overlay) return;
 overlay.classList.remove('advlog-show');
 setTimeout(() => overlay.remove(), 300);
}

// v8.7.46 (O3-C.4 polish) : Animation de la boussole au clic.
// L'aiguille (l'emoji entier) tourne rapidement dans tous les sens pendant 4s.
let _compassSpinning = false;
function _spinCompass(el){
 if(!el || _compassSpinning) return;
 _compassSpinning = true;
 el.classList.add('compass-spinning');
 // Petit retour sonore/haptique
 if(typeof beep === 'function'){ try{ beep(660,'sine',.12,.06); }catch(e){} }
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){ vibrate(VIBE.good || 30); }
 setTimeout(() => {
  el.classList.remove('compass-spinning');
  _compassSpinning = false;
 }, 4000);
}

// ═══════════════════════════════════════════════════════
// v8.7.50 (O4) : PHASE D'ENRAGE DES BOSS
// Déclenchée quand un boss de zone tombe à la moitié de ses HP. Transition
// épique : screen shake, flash rouge, le monstre devient enragé (rouge + grossit),
// dialogue menaçant, son grave. Effet gameplay : timer réduit (géré dans startTimer).
// ═══════════════════════════════════════════════════════
const _BOSS_ENRAGE_LINES = [
 "Tu m'as assez énervé… Maintenant je ne retiens plus rien !",
 "GRAAH ! Tu vas regretter de m'avoir défié !",
 "Assez joué ! Voici ma vraie puissance !",
 "Tu crois m'avoir ? La vraie bataille commence MAINTENANT !",
 "Impossible… tu es plus fort que prévu. Mais je ne céderai pas !",
 "Ma colère décuple mes forces ! Prépare-toi !",
 "Tu as réveillé ma fureur… tant pis pour toi !",
 "Chaque bonne réponse m'enrage un peu plus !",
 "Tu ne souris plus pour longtemps ! À mon tour de jouer !",
 "Mes attaques vont devenir IMPITOYABLES !",
 "Je gronde, je tremble, je RUGIS de colère !",
 "Tu m'as poussé à bout… voici ma forme déchaînée !",
 "Personne ne m'avait résisté aussi longtemps. ÇA SUFFIT !",
 "Sens ma rage monter : ma fureur va pleuvoir !",
 "Tu as gratté ma fierté… et ça, JAMAIS !",
 "Mes yeux rougeoient ! Plus aucune pitié pour tes neurones !",
];
// Répliques d'enrage adaptées au collège (ton plus mûr, adversaire respecté)
const _BOSS_ENRAGE_LINES_COL = [
 "Tu raisonnes mieux que je ne le pensais. Je cesse de te ménager.",
 "Assez d'échauffement. Montre-moi vraiment de quoi tu es capable.",
 "Chaque réponse juste fissure ma certitude. Soit : passons aux choses sérieuses.",
 "Tu refuses de plier ? Alors je relève la difficulté.",
 "Un esprit qui ne renonce pas… voyons jusqu'où il tient.",
 "Tu as forcé mon respect. Tu auras donc ma pleine puissance.",
];
// Répliques d'enrage maternelle : douces et encourageantes (jamais effrayantes)
const _BOSS_ENRAGE_LINES_MAT = [
 "Oh là là, tu es trop fort ! Bravo !",
 "Waouh ! Tu réponds super bien ! On continue à jouer ?",
 "Tu y arrives très bien ! Encore un petit peu !",
 "Youpi ! Quel champion ! Je suis tout content !",
];
function _triggerBossEnrage(){
 const ma = document.getElementById('monster-area');
 // Effet visuel sur le monstre : classe enragée (rouge + grossissement pulsant)
 if(ma){
  ma.classList.add('monster-enraged');
 }
 // Screen shake + flash rouge sur tout l'écran de jeu
 const gameView = document.getElementById('v-game') || document.body;
 gameView.classList.add('boss-enrage-shake');
 setTimeout(() => gameView.classList.remove('boss-enrage-shake'), 700);
 // Flash rouge overlay
 const flash = document.createElement('div');
 flash.className = 'boss-enrage-flash';
 document.body.appendChild(flash);
 setTimeout(() => flash.remove(), 800);
 // Bannière "ENRAGÉ !"
 const banner = document.createElement('div');
 banner.className = 'boss-enrage-banner';
 banner.textContent = '⚡ ENRAGÉ ! ⚡';
 document.body.appendChild(banner);
 setTimeout(() => banner.classList.add('boss-enrage-banner-out'), 1400);
 setTimeout(() => banner.remove(), 1900);
 // Dialogue menaçant (via le système de voix du monstre si dispo)
 const _mat = (typeof _isMaternelle==='function' && typeof GM!=='undefined' && _isMaternelle(GM.level));
 const _col = (typeof _COL_LEVELS!=='undefined' && typeof GM!=='undefined' && _COL_LEVELS.includes(GM.level));
 const _enPool = _mat ? _BOSS_ENRAGE_LINES_MAT : (_col ? _BOSS_ENRAGE_LINES_COL : _BOSS_ENRAGE_LINES);
 const line = _enPool[Math.floor(Math.random() * _enPool.length)];
 if(typeof monsterSpeak === 'function'){
  try{ monsterSpeak(line, 2600); }catch(e){}
 }
 // v9.2.4 : plus de son d'enrage (trop proche du bip d'erreur). On s'appuie sur la
 // réplique parlée du boss (_BOSS_ENRAGE_LINES) + les effets visuels (shake, flash, bannière).
 // Vibration forte
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate(VIBE.boss || [60, 30, 60, 30, 100]);
 }
}

// ═══════════════════════════════════════════════════════
// v8.7.52 (O4.2a) : ATTAQUES SPÉCIALES DES BOSS ENRAGÉS — effets cosmétiques
// Déclenchées aléatoirement par question pendant la phase enragée.
// (Les attaques touchant la logique de combat sont en O4.2b.)
// ═══════════════════════════════════════════════════════
function _maybeBossAttack(){
 if(!GS.isBoss || !GS.bossEnraged) return;
 // v8.7.56 : en Furie (phase 3), les attaques sont bien plus fréquentes
 const proba = GS.bossFury ? 0.80 : 0.55;
 if(Math.random() > proba) return;
 const attacks = [_atkRoar, _atkLightning, _atkLureRain, _atkWobble, _atkFireflies,
                  _atkFreeze, _atkScramble, _atkWords, _atkShield, _atkRegen,
                  _atkFog, _atkInk, _atkFlip, _atkQuake, _atkEclipse, _atkFrost];
 const atk = attacks[Math.floor(Math.random() * attacks.length)];
 try{ atk(); }catch(e){ console.warn('boss attack failed', e); }
}
// 🐉 Rugissement intimidant : zoom sur le boss + son grave + vibration
function _atkRoar(){
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-roar'); setTimeout(()=>ma.classList.remove('boss-roar'), 750); }
 // v9.2.4 : plus de bip de rugissement (proche du son d'erreur) — on garde le « GROAAAR » parlé + le zoom.
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined') vibrate(VIBE.boss || [50, 30, 50]);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('GROAAAR !', 1400); }catch(e){} }
}
// ⚡ Éclair surprise : flash bleu-blanc plein écran + tonnerre
function _atkLightning(){
 const f = document.createElement('div');
 f.className = 'boss-lightning-flash';
 document.body.appendChild(f);
 setTimeout(()=> f.remove(), 650);
 if(typeof beep === 'function'){
  try{ beep(70, 'sawtooth', .45, .12); setTimeout(()=>beep(55, 'square', .3, .1), 60); }catch(e){}
 }
 if(typeof vibrate === 'function') vibrate(45);
}
// 🌟 Pluie de leurres : symboles mathématiques qui tombent en fond
function _atkLureRain(){
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-lure-layer';
 const syms = ['➕','➖','✖️','➗','🟰','❓','🔢','💢'];
 let html = '';
 for(let i = 0; i < 14; i++){
  const left = Math.random() * 100;
  const delay = Math.random() * 1.2;
  const dur = 2 + Math.random() * 1.6;
  const sz = 0.8 + Math.random() * 0.9;
  html += `<span class="boss-lure" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${sz}em;">${syms[i % syms.length]}</span>`;
 }
 layer.innerHTML = html;
 host.appendChild(layer);
 setTimeout(()=> layer.remove(), 4000);
}
// 🌀 Énoncé qui tangue : la question oscille/pivote doucement
function _atkWobble(){
 const q = document.getElementById('question');
 if(!q) return;
 q.classList.add('boss-wobble');
 setTimeout(()=> q.classList.remove('boss-wobble'), 2600);
}
// ✨ Distraction lucioles : lucioles dorées qui flottent devant l'écran
function _atkFireflies(){
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-firefly-layer';
 let html = '';
 for(let i = 0; i < 12; i++){
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 2;
  const dur = 2.5 + Math.random() * 2;
  html += `<span class="boss-firefly" style="left:${left}%;top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s;">✨</span>`;
 }
 layer.innerHTML = html;
 host.appendChild(layer);
 setTimeout(()=> layer.remove(), 4500);
}

// ═══════════════════════════════════════════════════════
// v8.7.53 (O4.2b) : ATTAQUES BOSS — effets sur saisie & affichage
// Gel temporaire, pavé mélangé, chiffres en lettres.
// ═══════════════════════════════════════════════════════
// Nettoyage des effets d'attaque entre deux questions (appelé en début de renderQ)
// ── v9.4.15 : 6 nouveaux malus de colère. Le timer est mis en pause pendant
//    l'effet (GS.frozen) — donc non punitif ; sans effet en maternelle (pas de chrono).
function _atkFog(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-fog-layer';
 host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Brouillard épais !", 1400); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 3000);
}
function _atkInk(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-ink-layer';
 let html = '';
 for(let i=0;i<6;i++){ const left=8+Math.random()*78, top=12+Math.random()*64, sz=58+Math.random()*70, delay=(Math.random()*0.3).toFixed(2);
  html += `<span class="boss-ink" style="left:${left}%;top:${top}%;width:${sz}px;height:${sz}px;animation-delay:${delay}s;"></span>`; }
 layer.innerHTML = html; host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Tache d'encre !", 1300); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 2600);
}
function _atkFlip(){
 const q = document.getElementById('question');
 GS.frozen = true;
 if(q) q.classList.add('boss-upside');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Sens dessus dessous !", 1500); }catch(e){} }
 setTimeout(()=>{ if(q) q.classList.remove('boss-upside'); GS.frozen = false; }, 2200);
}
function _atkQuake(){
 const gv = document.getElementById('v-game');
 GS.frozen = true;
 if(gv) gv.classList.add('boss-quake');
 if(typeof vibrate === 'function') vibrate([30,40,30,40,30]);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Tremblement de terre !", 1300); }catch(e){} }
 setTimeout(()=>{ if(gv) gv.classList.remove('boss-quake'); GS.frozen = false; }, 1600);
}
function _atkEclipse(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-eclipse-layer';
 host.appendChild(layer);
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Éclipse !", 1400); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 2200);
}
function _atkFrost(){
 const host = document.getElementById('v-game') || document.body;
 GS.frozen = true;
 const layer = document.createElement('div'); layer.className = 'boss-frost-layer';
 host.appendChild(layer);
 if(typeof beep === 'function'){ try{ beep(1200,'sine',.18,.05); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak("Givre rampant !", 1300); }catch(e){} }
 setTimeout(()=>{ layer.remove(); GS.frozen = false; }, 3000);
}
function _resetBossAttackEffects(){
 const numpad = document.getElementById('numpad');
 if(numpad){
  numpad.classList.remove('numpad-frozen','numpad-scrambled');
  _restoreNumpadOrder();
 }
 const ai = document.getElementById('answer-input');
 if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false; }
 const qEl = document.getElementById('question');
 if(qEl) qEl.classList.remove('boss-words-q','boss-upside');
 const gv = document.getElementById('v-game');
 if(gv) gv.classList.remove('boss-quake');
 document.querySelectorAll('.boss-fog-layer,.boss-ink-layer,.boss-eclipse-layer,.boss-frost-layer').forEach(el=>el.remove());
 if(typeof GS !== 'undefined') GS.frozen = false;
}
// Restaure l'ordre canonique 1..9 des touches chiffres du pavé
function _restoreNumpadOrder(){
 const numpad = document.getElementById('numpad');
 if(!numpad) return;
 const minusBtn = numpad.querySelector('.np-minus');
 if(!minusBtn) return;
 // Réinsérer les boutons 1..9 dans l'ordre avant le bouton "−"
 for(let d = 1; d <= 9; d++){
  const btn = numpad.querySelector(`.np-btn[data-k="${d}"]`);
  if(btn) numpad.insertBefore(btn, minusBtn);
 }
}
// ❄️ Gel temporaire : pavé givré + timer en pause 2s (non punitif grâce à GS.frozen)
function _atkFreeze(){
 const numpad = document.getElementById('numpad');
 const ai = document.getElementById('answer-input');
 GS.frozen = true; // met le timer en pause (géré dans le tick de startTimer)
 if(numpad) numpad.classList.add('numpad-frozen');
 if(ai){ ai.classList.add('input-frozen'); ai.disabled = true; }
 if(typeof beep === 'function'){ try{ beep(880,'sine',.2,.07); setTimeout(()=>beep(660,'sine',.25,.06),120); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Gèle sur place !', 1600); }catch(e){} }
 setTimeout(() => {
  GS.frozen = false;
  if(numpad) numpad.classList.remove('numpad-frozen');
  if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false;
   // PC/clavier : redonner le focus au champ (sinon il faut recliquer). Pas sur
   // tactile, pour ne pas faire surgir le clavier par-dessus le pavé.
   if(typeof _numpadIsTouch !== 'function' || !_numpadIsTouch()){ try{ ai.focus(); }catch(e){} }
  }
 }, 2000);
}
// 🔀 Pavé mélangé : les touches 1..9 changent de place (la valeur reste correcte)
function _atkScramble(){
 const numpad = document.getElementById('numpad');
 if(!numpad) return;
 const minusBtn = numpad.querySelector('.np-minus');
 if(!minusBtn) return;
 const digits = [];
 for(let d = 1; d <= 9; d++){
  const btn = numpad.querySelector(`.np-btn[data-k="${d}"]`);
  if(btn) digits.push(btn);
 }
 if(digits.length < 9) return;
 // Mélange Fisher-Yates
 for(let i = digits.length - 1; i > 0; i--){
  const j = Math.floor(Math.random() * (i + 1));
  [digits[i], digits[j]] = [digits[j], digits[i]];
 }
 digits.forEach(b => numpad.insertBefore(b, minusBtn));
 numpad.classList.add('numpad-scrambled');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Bonne chance pour trouver les chiffres !', 2000); }catch(e){} }
}
// 🔢 Chiffres en lettres : l'énoncé affiche les nombres en toutes lettres
function _atkWords(){
 const qEl = document.getElementById('question');
 if(!qEl) return;
 const original = qEl.innerText;
 const converted = original.replace(/\d+/g, m => _numberToFrenchWords(parseInt(m, 10)));
 if(converted === original) return; // pas de chiffre converti → effet inutile
 qEl.innerText = converted;
 qEl.classList.add('boss-words-q');
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Sais-tu encore lire ?', 1800); }catch(e){} }
}
// Conversion d'un entier (0-9999) en toutes lettres françaises
function _numberToFrenchWords(n){
 if(n === 0) return 'zéro';
 if(n < 0) return 'moins ' + _numberToFrenchWords(-n);
 const units = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix',
  'onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
 const tens = ['','','vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt'];
 function below100(x){
  if(x < 20) return units[x];
  const t = Math.floor(x / 10), u = x % 10;
  if(t === 7 || t === 9){ // soixante-dix / quatre-vingt-dix
   const base = t === 7 ? 'soixante' : 'quatre-vingt';
   const rem = below100(10 + u); // dix..dix-neuf
   return base + '-' + rem;
  }
  if(u === 0) return tens[t] + (t === 8 ? 's' : '');
  if(u === 1 && t !== 8) return tens[t] + '-et-un';
  return tens[t] + '-' + units[u];
 }
 function below1000(x){
  if(x < 100) return below100(x);
  const h = Math.floor(x / 100), rem = x % 100;
  const hPart = (h === 1 ? 'cent' : units[h] + '-cent');
  if(rem === 0) return hPart + (h > 1 ? 's' : '');
  return hPart + ' ' + below100(rem);
 }
 if(n < 1000) return below1000(n);
 const th = Math.floor(n / 1000), rem = n % 1000;
 const thPart = (th === 1 ? 'mille' : below1000(th) + ' mille');
 return rem === 0 ? thPart : thPart + ' ' + below1000(rem);
}

// ═══════════════════════════════════════════════════════
// v8.7.54 (O4.2c) : ATTAQUES BOSS — mécaniques de combat
// ⚔️ Bouclier (2 bonnes réponses pour 1 PV) + 💚 Régénération (le boss récupère 1 PV)
// ═══════════════════════════════════════════════════════
// ⚔️ Bouclier : le boss lève un bouclier qui absorbe le prochain coup
function _atkShield(){
 if(GS.bossShieldActive) return; // déjà levé
 GS.bossShieldActive = true;
 GS.bossShieldHits = 0;
 const ma = document.getElementById('monster-area');
 if(ma) ma.classList.add('boss-shielded');
 if(typeof beep === 'function'){ try{ beep(330,'square',.18,.08); setTimeout(()=>beep(440,'square',.2,.07),110); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Mon bouclier va me protéger !', 2000); }catch(e){} }
 if(typeof vibrate === 'function') vibrate(35);
}
// Bouclier qui absorbe un coup (le 1er) : flash métallique + son
function _bossShieldBlock(){
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-shield-clang'); setTimeout(()=>ma.classList.remove('boss-shield-clang'), 450); }
 if(typeof beep === 'function'){ try{ beep(700,'square',.12,.09); setTimeout(()=>beep(520,'square',.14,.07),70); }catch(e){} }
 if(typeof vibrate === 'function') vibrate(25);
}
// Bouclier brisé (au 2e coup) : éclats + son de bris
function _bossShieldBreak(){
 const ma = document.getElementById('monster-area');
 if(ma){
  ma.classList.remove('boss-shielded');
  ma.classList.add('boss-shield-shatter');
  setTimeout(()=>ma.classList.remove('boss-shield-shatter'), 600);
 }
 if(typeof beep === 'function'){ try{ [600,440,300,200].forEach((f,i)=>setTimeout(()=>beep(f,'triangle',.14,.08), i*55)); }catch(e){} }
 if(typeof vibrate === 'function') vibrate([30,20,40]);
}
// 💚 Régénération : le boss récupère 1 PV (cap au max, 2 fois max par combat)
function _atkRegen(){
 if((GS.bossRegenCount||0) >= 2) return;            // max 2 régénérations par combat
 if(GS.monsterHP >= GS.monsterMaxHP) return;        // déjà au max
 GS.bossRegenCount = (GS.bossRegenCount||0) + 1;
 GS.monsterHP++;
 if(typeof updateMonsterHP === 'function') updateMonsterHP();
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-regen'); setTimeout(()=>ma.classList.remove('boss-regen'), 1200); }
 // particules de soin vertes
 const host = document.getElementById('v-game') || document.body;
 const layer = document.createElement('div');
 layer.className = 'boss-regen-layer';
 let html='';
 for(let i=0;i<8;i++){
  const left=35+Math.random()*30, delay=Math.random()*.5, dur=1+Math.random()*.8;
  html+=`<span class="boss-regen-plus" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">💚</span>`;
 }
 layer.innerHTML=html;
 host.appendChild(layer);
 setTimeout(()=>layer.remove(), 2000);
 if(typeof beep === 'function'){ try{ [440,550,660].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.2,.07), i*100)); }catch(e){} }
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak('Je me soigne, hé hé !', 1800); }catch(e){} }
}

// ═══════════════════════════════════════════════════════
// v8.7.56 (O4.4) : 3e PHASE "FURIE" des gros boss (≥6 PV)
// Déclenchée à 25% de vie, après l'enrage. Transition encore plus intense :
// le monstre vire au violet-noir, double secousse, dialogue désespéré, attaques
// plus fréquentes (gérées dans _maybeBossAttack).
// ═══════════════════════════════════════════════════════
const _BOSS_FURY_LINES = [
 "NON ! C'est impossible… Je vais TOUT donner !",
 "Tu ne me vaincras JAMAIS ! JAMAIS !",
 "Ma dernière once de pouvoir… RECEVEZ MA FUREUR !",
 "Si je tombe, je t'emporte avec moi !",
 "AAARGH ! Mes forces ultimes se déchaînent !",
];
// Répliques de furie adaptées au collège
const _BOSS_FURY_LINES_COL = [
 "Impossible… ma logique se brise. Je n'ai plus rien à perdre !",
 "Tu es à un théorème de me vaincre. Je ne te le concéderai pas !",
 "Mes dernières équations, je les lance toutes contre toi !",
 "Si je dois tomber, que ce soit face à un adversaire digne. Prouve-le encore.",
 "Tout mon savoir condensé en un ultime défi. Relève-le, si tu l'oses.",
];
// Répliques de furie maternelle : tout en douceur
const _BOSS_FURY_LINES_MAT = [
 "Tu as presque gagné, c'est génial !",
 "Bravo bravo bravo ! Encore une petite question !",
 "Tu es le plus courageux des petits champions !",
];
function _triggerBossFury(){
 const ma = document.getElementById('monster-area');
 if(ma){
  ma.classList.remove('monster-enraged');
  ma.classList.add('monster-fury');
 }
 // Double secousse plus violente
 const gameView = document.getElementById('v-game') || document.body;
 gameView.classList.add('boss-fury-shake');
 setTimeout(() => gameView.classList.remove('boss-fury-shake'), 900);
 // Flash violet
 const flash = document.createElement('div');
 flash.className = 'boss-fury-flash';
 document.body.appendChild(flash);
 setTimeout(() => flash.remove(), 900);
 // Bannière "FURIE !"
 const banner = document.createElement('div');
 banner.className = 'boss-fury-banner';
 banner.textContent = '🔥 FURIE ! 🔥';
 document.body.appendChild(banner);
 setTimeout(() => banner.classList.add('boss-fury-banner-out'), 1600);
 setTimeout(() => banner.remove(), 2100);
 // Dialogue désespéré
 const _matF = (typeof _isMaternelle==='function' && typeof GM!=='undefined' && _isMaternelle(GM.level));
 const _colF = (typeof _COL_LEVELS!=='undefined' && typeof GM!=='undefined' && _COL_LEVELS.includes(GM.level));
 const _fuPool = _matF ? _BOSS_FURY_LINES_MAT : (_colF ? _BOSS_FURY_LINES_COL : _BOSS_FURY_LINES);
 const line = _fuPool[Math.floor(Math.random() * _fuPool.length)];
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak(line, 2800); }catch(e){} }
 // v9.2.4 : plus de son de furie (trop proche du bip d'erreur). Réplique parlée
 // (_BOSS_FURY_LINES) + effets visuels suffisent à exprimer la rage.
 // Vibration prolongée
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate([80, 40, 80, 40, 80, 40, 140]);
 }
}

// ═══════════════════════════════════════════════════════
// v8.7.64 (esthétique) : DÉCORS THÉMATIQUES PAR ZONE
// Petits éléments décoratifs dispersés autour de chaque nœud de zone pour rendre
// chaque lieu vivant et reconnaissable. Affichés seulement sur les îlots débloqués.
// ═══════════════════════════════════════════════════════
const _ZONE_DECOR = {
 plaine:           ['🌾','🐰','🦋','🌼'],
 village:          ['🏠','🧑‍🌾','🐔','🌳'],
 prairie:          ['🌻','🌷','🐝','🦋'],
 bonbons:          ['🍬','🧁','🍩','🍫'],
 foret:            ['🌲','🦌','🧚','🦉'],
 champignons:      ['🍄','🐌','🌿','🦋'],
 trolls:           ['🌲','⛺','🪵','👺'],
 plage:            ['🌴','🦀','🐚','⛱️'],
 desert:           ['🌵','🦂','🌞','🦎'],
 plaines_venteuses:['🌾','💨','🦬','🍃'],
 temple:           ['🗿','🏺','📜','🕯️'],
 profondeurs:      ['🐠','🐚','🪸','🐙'],
 glace:            ['❄️','⛄','🧊','🐧'],
 marais:           ['🐸','🕷️','🌿','🐍'],
 forteresse:       ['⚔️','🛡️','🚩','🐉'],
 sakura:           ['🌸','🏯','🎏','🐦'],
 nocturne:         ['🌙','⭐','🦇','🦉'],
 volcan:           ['🔥','🪨','💨','🦎'],
 espace:           ['⭐','🪐','🚀','☄️'],
 cimes:            ['🦅','☁️','🪨','🌬️'],
 mecanique:        ['⚙️','🔧','🔩','💡'],
 ile:              ['🌴','🦜','🗺️','💰'],
 sanctuaire:       ['✨','🔮','🏮','⛩️'],
};
function _buildZoneDecorHtml(positions, foggedMap, W){
 let html = '';
 positions.forEach(p => {
  if(foggedMap && foggedMap[p.regionId]) return;          // rien sur les îlots verrouillés
  const decor = _ZONE_DECOR[p.zone.id];
  if(!decor) return;
  decor.forEach((emoji, i) => {
   // Position déterministe autour du nœud (stable entre les rendus, pas de scintillement)
   const angle = (i / decor.length) * Math.PI * 2 + (p.zoneIdx * 0.7) + 0.4;
   const radius = 48 + (i % 2) * 16;
   const dx = Math.cos(angle) * radius;
   const dy = Math.sin(angle) * radius * 0.62 - 8;        // aplati + remonté (évite le label sous le nœud)
   const leftPct = p.xPct + (dx / W) * 100;
   const topPx = p.y + dy;
   const delay = ((p.zoneIdx + i) % 5) * 0.4;
   html += `<div class="archipel-zone-decor" style="left:${leftPct.toFixed(1)}%;top:${topPx.toFixed(0)}px;animation-delay:${delay}s;">${emoji}</div>`;
  });
 });
 return html;
}

// v8.7.66 (esthétique) : SCÈNE PAYSAGE dans la modale de zoom de zone.
// Vraie composition : dégradé ciel→sol par biome, éléments aériens en haut,
// éléments posés sur la ligne d'horizon en bas, tailles proportionnées, et
// placement par rejet pour ne jamais chevaucher les étapes ni les autres décors.
// Tout est confiné à la zone des étapes (sous l'encart "boss vaincu").
const _BIOME_SCENE = {
 CP:  { sky:'#bfe9ff', ground:'#5fa83f' },
 CE1: { sky:'#a7dcc6', ground:'#2f6b4e' },
 CE2: { sky:'#ffe0a6', ground:'#c47e38' },
 CM1: { sky:'#d2e2ee', ground:'#7d8a99' },
 CM2: { sky:'#2a1448', ground:'#532a76' },
};
// Taille relative par emoji (un arbre/maison >> une poule/fleur)
const _DECOR_SIZE = {
 '🌳':1.75,'🌲':1.85,'🌴':1.75,'🏠':1.7,'🏡':1.7,'🏯':1.95,'🏰':2.05,'🏛️':1.9,'🗿':1.6,'🌋':2.0,'⛰️':1.95,'🏔️':1.95,'🪐':1.8,'🏝️':1.7,'⛩️':1.85,'🏮':1.35,
 '🦌':1.3,'🐂':1.35,'🐄':1.35,'🐑':1.2,'🦬':1.4,'🐉':1.55,'🐙':1.35,'⛺':1.45,'🚀':1.55,'🤖':1.35,'⛄':1.25,'⚙️':1.25,'🏺':1.05,'🛡️':1.05,'⚔️':1.1,'🚩':1.15,'🗺️':1.1,
};
const _decorSize = (e)=> _DECOR_SIZE[e] || 0.82;
// Éléments aériens (placés dans le ciel)
const _DECOR_SKY = new Set(['☀️','🌞','🌙','⭐','☁️','🦋','🦅','🦜','🐦','🦇','☄️','🪐','🌌','💨','🌬️','✨','🎏','🧚','🦉']);

function _buildZoomSceneHtml(zoneId, zone, stepPositions, containerW, sceneH){
 const decor = _ZONE_DECOR[zoneId];
 if(!decor || typeof _archHash !== 'function') return '';
 const biome = _BIOME_SCENE[(zone&&zone.level)] || _BIOME_SCENE.CP;
 const horizonPct = 72;                                  // ligne d'horizon (sol en dessous)
 const horizonPx = (horizonPct/100) * sceneH;
 const skyEls = decor.filter(e=>_DECOR_SKY.has(e));
 const groundEls = decor.filter(e=>!_DECOR_SKY.has(e));
 const groundList = groundEls.length ? groundEls : decor;
 const skyList = skyEls.length ? skyEls : ['☁️'];
 const placed = [];
 const STEP_R = 48;                                       // rayon d'exclusion autour des étapes
 function free(xPx, yPx, rPx){
  for(const sp of stepPositions){
   const dx=xPx-sp.x, dy=yPx-sp.y;
   if(Math.sqrt(dx*dx+dy*dy) < STEP_R + rPx) return false;
  }
  for(const p of placed){
   const dx=xPx-p.x, dy=yPx-p.y;
   if(Math.sqrt(dx*dx+dy*dy) < p.r + rPx + 8) return false;
  }
  return true;
 }
 // Dégradé ciel + bande de sol (avec ligne d'horizon)
 let html = `<div class="zoom-scene-sky" style="background:linear-gradient(to bottom, ${biome.sky}, ${biome.sky}00 ${horizonPct}%);"></div>`
          + `<div class="zoom-scene-ground" style="top:${horizonPct}%;background:linear-gradient(to bottom, ${biome.ground}, ${biome.ground}cc);"></div>`;
 // Éléments de sol : posés sur la ligne d'horizon, répartis horizontalement
 const groundCount = Math.min(8, 5 + groundList.length);
 for(let i=0;i<groundCount;i++){
  const e = groundList[i % groundList.length];
  const sz = _decorSize(e);
  const fontPx = 17 * sz;                                 // taille rendue approx (em→px)
  const rPx = fontPx * 0.55;
  let placedOk=false;
  for(let k=0;k<18 && !placedOk;k++){
   const xPct = 7 + _archHash(zoneId, i*37+k*7+1)*86;
   const xPx = xPct/100*containerW;
   // base posée sur la ligne d'horizon (+ légère variation pour profondeur)
   const yPx = horizonPx - rPx*0.2 + _archHash(zoneId,i*11+k+2)*26 - 4;
   if(free(xPx, yPx, rPx)){
    placed.push({x:xPx,y:yPx,r:rPx});
    const op = (0.6 + _archHash(zoneId,i*5+9)*0.25).toFixed(2);
    const delay = ((i)%5)*0.4, dur=(4.5+(i%3)).toFixed(1);
    html += `<div class="archipel-zoom-decor" style="left:${xPct.toFixed(1)}%;top:${yPx.toFixed(0)}px;font-size:${(sz).toFixed(2)}em;opacity:${op};animation-delay:${delay}s;animation-duration:${dur}s;">${e}</div>`;
    placedOk=true;
   }
  }
 }
 // Éléments de ciel : flottant dans la moitié haute
 const skyCount = Math.min(5, 3 + skyList.length);
 for(let i=0;i<skyCount;i++){
  const e = skyList[i % skyList.length];
  const sz = _decorSize(e);
  const fontPx = 17 * sz;
  const rPx = fontPx * 0.5;
  let placedOk=false;
  for(let k=0;k<18 && !placedOk;k++){
   const xPct = 8 + _archHash(zoneId, i*53+k*5+3)*84;
   const xPx = xPct/100*containerW;
   const yPx = 16 + _archHash(zoneId, i*29+k+4)*(horizonPx*0.42);
   if(free(xPx, yPx, rPx)){
    placed.push({x:xPx,y:yPx,r:rPx});
    const op = (0.55 + _archHash(zoneId,i*7+1)*0.25).toFixed(2);
    const delay = ((i)%5)*0.5, dur=(5+(i%3)).toFixed(1);
    html += `<div class="archipel-zoom-decor sky" style="left:${xPct.toFixed(1)}%;top:${yPx.toFixed(0)}px;font-size:${(sz).toFixed(2)}em;opacity:${op};animation-delay:${delay}s;animation-duration:${dur}s;">${e}</div>`;
    placedOk=true;
   }
  }
 }
 return html;
}

// ═══════════════════════════════════════════════════════
// v8.7.67 (O5) : FIL NARRATIF — « Les Cristaux de Calcultopia »
// Système data-driven et EXTENSIBLE : pour ajouter un îlot (et donc un Cristal),
// il suffit d'ajouter une région à _ARCH_REGIONS et un chapitre à _STORY.chapters.
// Le nombre de Cristaux et les déclencheurs s'adaptent automatiquement.
// ═══════════════════════════════════════════════════════
let STORY_VILLAIN = 'Comte Zéro de Cafouillac';
let STORY_KINGDOM = 'Calcultopia';
// Nombre de Cristaux régionaux = nombre de régions de jeu (hors Sanctuaire final).
function _storyCrystalCount(){
 try{ return _ARCH_REGIONS.filter(r => r.id !== _lastRegionId()).length; }catch(e){ return 5; }
}
// Interpolation des textes : {hero}, {villain}, {kingdom}, {crystals}
function _storyText(s){
 const hero = (typeof P!=='undefined' && P && P.name) ? P.name : 'jeune Calculateur';
 return String(s)
  .replace(/\{hero\}/g, hero)
  .replace(/\{villain\}/g, STORY_VILLAIN)
  .replace(/\{kingdom\}/g, STORY_KINGDOM)
  .replace(/\{crystals\}/g, _storyCrystalCount());
}
const _PRIM_STORY = {
 intro: {
  id:'intro',
  title:'Prologue — L\'Ombre sur Calcultopia',
  pages:[
   { emoji:'🏰', text:"Il était une fois un royaume lumineux nommé <b>Calcultopia</b>, où les nombres dansaient dans l'air comme des lucioles dorées. Tout y était harmonie : les rivières comptaient leurs vagues, les arbres alignaient leurs feuilles, et chaque matin le soleil se levait pile à l'heure." },
   { emoji:'💎', text:"Cette harmonie venait des <b>Cristaux de Calcultopia</b>, des joyaux magiques cachés à travers le monde. Tant qu'ils brillaient, l'ordre régnait, les récoltes étaient justes et personne ne se trompait jamais dans ses calculs." },
   { emoji:'🌑', text:"Mais une nuit sans étoiles, surgi du Grand Vide, apparut le terrible <b>{villain}</b> ! D'un rire glacial qui gela les fontaines, il hurla : « Plus de nombres ! Plus d'ordre ! Que TOUT devienne FLOU ! »" },
   { emoji:'💥', text:"D'un claquement de doigts, il fit voler les Cristaux en éclats de lumière. Un à un, ils s'éteignirent... et un épais <b>brouillard</b> recouvrit chaque région du royaume, emmêlant les nombres et brouillant tous les calculs." },
   { emoji:'👹', text:"Le {villain} confia alors chaque Cristal brisé à un <b>gardien corrompu</b>, une bête transformée par sa magie noire, pour qu'aucun héros ne puisse jamais les reprendre. Puis il se retira dans son Sanctuaire, tout au bout du monde." },
   { emoji:'🦸', text:"Mais une vieille légende murmurait qu'un jour se lèverait un <b>jeune Calculateur</b> au cœur vaillant et à l'esprit vif... {hero}, ce héros annoncé, c'est <b>TOI</b> !" },
   { emoji:'🗺️', text:"Ton odyssée commence. Traverse les {crystals} régions, affronte les gardiens, reprends les Cristaux un par un, puis marche jusqu'au Sanctuaire affronter le {villain} lui-même. <b>Calcultopia compte sur toi !</b>" },
  ],
 },
 // Chapitres d'ENTRÉE de région (indexés par regionId — extensible)
 chapters: {
  cp: {
   id:'chap_cp',
   title:'Chapitre I — La Région des Débuts',
   crystal:'Cristal de l\'Unité',
   pages:[
    { emoji:'🌾', text:"Te voici dans la <b>Région des Débuts</b>, de douces plaines vallonnées où ton aventure prend racine. Ici, le brouillard est encore léger — mais les animaux errent, perdus, incapables de compter leurs propres pas." },
    { emoji:'🧙', text:"Un vieux sage à la barbe d'argent s'approche : « Enfin, te voilà, brave {hero} ! Le tout premier joyau, le <b>Cristal de l'Unité</b>, est gardé par le <b>Loup des Plaines</b>, devenu féroce depuis que le {villain} l'a corrompu. »" },
    { emoji:'💎', text:"« Relève les défis de chaque lieu pour gagner en courage, puis affronte le Loup au bout du chemin. Libère le Cristal de l'Unité... et la toute première lueur d'espoir renaîtra sur Calcultopia ! » En avant, héros !" },
   ],
  },
  ce1: {
   id:'chap_ce1',
   title:'Chapitre II — Bois et Plages',
   crystal:'Cristal de l\'Élan',
   pages:[
    { emoji:'🌲', text:"Le Cristal de l'Unité brille de nouveau ! Mais à peine as-tu quitté les plaines que tu pénètres dans les <b>Bois et Plages</b>, où les arbres murmurent et les vagues ont oublié comment compter leurs rouleaux." },
    { emoji:'🧙', text:"Maître Comptin, le vieux sage, t'a suivi : « Tu progresses vite, {hero} ! Mais sois prudent... » Soudain, une petite lumière dorée volette autour de toi en pétillant !" },
    { emoji:'✨', text:"« Bonjour ! Je suis <b>Lumo</b>, une étincelle née d'un Cristal ! » couine la luciole. « Là où je vole, le brouillard recule. Je viens avec toi ! » Tu as trouvé un compagnon fidèle." },
    { emoji:'🦌', text:"Maître Comptin reprend : « Le <b>Cristal de l'Élan</b> est gardé par le Cerf Spectral, au cœur de la forêt. Mais prends garde : le {villain} sait désormais qu'un héros se dresse contre lui... »" },
    { emoji:'⚔️', text:"Au loin, un rire glacial résonne entre les arbres. Le {villain} t'observe ! Qu'importe — tu serres les poings, Lumo brille plus fort, et tu t'enfonces dans les bois. Rien ne t'arrêtera." },
   ],
  },
  ce2: {
   id:'chap_ce2',
   title:'Chapitre III — Les Terres d\'Aventure',
   crystal:'Cristal du Voyage',
   pages:[
    { emoji:'🏜️', text:"Deux Cristaux retrouvés ! Te voilà dans les <b>Terres d'Aventure</b> : déserts brûlants et temples oubliés où le sable efface les chiffres aussi vite qu'on les trace." },
    { emoji:'🥷', text:"Mais une ombre te barre la route ! C'est le <b>Sergent Virgule</b>, lieutenant du {villain}. « Halte, petit héros ! Le maître m'envoie te ralentir ! » ricane-t-il en brouillant les dunes." },
    { emoji:'💪', text:"Lumo se cache, effrayée. Mais toi, {hero}, tu redresses la tête : « Je n'ai pas peur de toi ! » Ton courage fait reculer le Sergent, qui s'enfuit en jurant que le maître se vengera." },
    { emoji:'🏺', text:"Maître Comptin te rejoint, essoufflé : « Bravo ! Quel cran ! Le <b>Cristal du Voyage</b> repose dans le Temple Antique, gardé par le Sphinx des Sables. Réponds à ses énigmes et il sera tien. »" },
    { emoji:'🌟', text:"Lumo réapparaît, un peu honteuse : « Tu es si brave... je serai courageuse moi aussi ! » Ensemble, vous avancez vers le temple, le cœur vaillant. Trois Cristaux bientôt !" },
   ],
  },
  cm1: {
   id:'chap_cm1',
   title:'Chapitre IV — Les Royaumes Périlleux',
   crystal:'Cristal de la Bravoure',
   pages:[
    { emoji:'🏰', text:"Les <b>Royaumes Périlleux</b> t'accueillent dans le froid : forteresses de pierre, remparts de givre, et un brouillard si épais qu'on n'y voit plus ses propres mains." },
    { emoji:'😰', text:"Soudain, un cri ! Le {villain} a capturé <b>Maître Comptin</b> et l'enferme dans une tour de glace ! « Si tu veux ton vieil ami, héros, viens donc le chercher... si tu l'oses ! » tonne sa voix." },
    { emoji:'🔥', text:"Ton sang ne fait qu'un tour. Lumo tremble : « C'est un piège ! » — « Peut-être, » réponds-tu, « mais on n'abandonne jamais un ami. » C'est ton plus grand acte de bravoure." },
    { emoji:'🐉', text:"Pour atteindre la tour, tu devras vaincre le Dragon des Remparts, gardien du <b>Cristal de la Bravoure</b>. Chaque calcul juste fissure la glace qui retient Maître Comptin." },
    { emoji:'💎', text:"« Tiens bon, {hero} ! » lance Lumo, brillant de mille feux. « Quatre Cristaux, et déjà tu fais reculer les ténèbres ! » Tu inspires un grand coup... et tu t'élances." },
   ],
  },
  cm2: {
   id:'chap_cm2',
   title:'Chapitre V — Au-delà des Étoiles',
   crystal:'Cristal de l\'Infini',
   pages:[
    { emoji:'🌌', text:"Maître Comptin libéré, vous voilà projetés <b>Au-delà des Étoiles</b>, dans le grand vide cosmique où flottent les derniers nombres du royaume, scintillant comme des constellations." },
    { emoji:'🧙', text:"Maître Comptin devient grave : « {hero}, il est temps que tu saches la vérité. Le {villain}... fut jadis le plus grand mathématicien de Calcultopia. »" },
    { emoji:'💔', text:"« Mais un jour, une seule erreur de calcul lui coûta tout. De honte et de colère, il jura d'effacer TOUS les nombres, pour que plus personne ne puisse jamais se tromper... ni réussir. »" },
    { emoji:'🌠', text:"Tu comprends alors : le {villain} n'est pas qu'un monstre, mais un cœur brisé. Le <b>Cristal de l'Infini</b>, gardé par le Colosse Stellaire, pourrait bien être la clé pour le raisonner." },
    { emoji:'✨', text:"« Cinq Cristaux, {hero} ! » s'écrie Lumo. « Il ne reste plus que le Sanctuaire ! » Le destin de Calcultopia tient désormais entre tes mains. Sois fort. Sois juste." },
   ],
  },
  final: {
   id:'chap_final',
   title:'Chapitre VI — Le Sanctuaire',
   crystal:'',
   pages:[
    { emoji:'🕉️', text:"Les cinq Cristaux flottent autour de toi, irradiant une lumière pure. Devant s'élève le <b>Sanctuaire Final</b>, dernier repaire du {villain}, là où tout a commencé... et où tout va se jouer." },
    { emoji:'👹', text:"« Te voilà donc, » murmure le {villain}, plus las que furieux. « Tu as repris mes Cristaux... mais comprends-tu seulement pourquoi je les ai brisés ? » Sa voix tremble." },
    { emoji:'❤️', text:"Maître Comptin pose une main sur ton épaule : « Montre-lui, {hero}. Montre-lui qu'une erreur n'est pas une fin — mais le début d'un nouvel apprentissage. C'est ça, la vraie magie des nombres. »" },
    { emoji:'⚔️', text:"Le {villain} lève les bras dans un dernier sursaut de colère : « Assez de belles paroles ! Prouve-moi ta valeur, héros ! » Le combat ultime commence. Pour Calcultopia. Pour Maître Comptin. Pour Lumo. <b>Pour toi.</b>" },
   ],
  },
 },
 // Scènes de VICTOIRE : jouées quand un Cristal est récupéré (région conquise)
 victories: {
  cp: { id:'win_cp', title:'Cristal de l\'Unité libéré !', crystal:'Cristal de l\'Unité', pages:[
   { emoji:'💎', text:"Le Loup des Plaines pousse un dernier grognement... puis la magie noire se dissipe ! Ses yeux redeviennent doux comme avant. De son pelage jaillit le <b>Cristal de l'Unité</b>, d'un <b>rouge</b> rubis éclatant, scintillant de mille feux !" },
   { emoji:'🌅', text:"La toute première lueur revient sur Calcultopia ! Le brouillard recule. Lumo danse de joie : « Bravo {hero} ! » Et Maître Comptin sourit : « Je savais que tu en étais capable. La quête ne fait que commencer. »" },
  ]},
  ce1: { id:'win_ce1', title:'Cristal de l\'Élan libéré !', crystal:'Cristal de l\'Élan', pages:[
   { emoji:'💎', text:"Le Cerf Spectral incline sa noble ramure et s'évapore en une pluie d'étincelles dorées. Le <b>Cristal de l'Élan</b>, d'un <b>orange</b> flamboyant, est à toi ! Les bois retrouvent leurs couleurs et les vagues se remettent à compter leurs rouleaux." },
   { emoji:'✨', text:"« Un Cristal de plus, {hero} ! » s'émerveille Lumo. Au loin, le {villain} grince des dents : « Comment ose-t-il me défier ainsi... » Ta légende grandit dans tout le royaume." },
  ]},
  ce2: { id:'win_ce2', title:'Cristal du Voyage libéré !', crystal:'Cristal du Voyage', pages:[
   { emoji:'💎', text:"Le Sphinx des Sables s'incline avec respect : « Tes réponses sont justes, jeune sage. Le Cristal t'appartient. » Le <b>Cristal du Voyage</b>, d'un <b>vert</b> émeraude profond, s'élève des sables anciens dans un tourbillon de lumière." },
   { emoji:'🏜️', text:"Vaincu et humilié, le Sergent Virgule déguerpit pour de bon ! Maître Comptin pose la main sur ton épaule : « Te voilà à mi-chemin. Le plus dur reste à venir... mais regarde comme tu as grandi. »" },
  ]},
  cm1: { id:'win_cm1', title:'Cristal de la Bravoure libéré !', crystal:'Cristal de la Bravoure', pages:[
   { emoji:'💎', text:"Dans un fracas titanesque, le Dragon des Remparts s'effondre, enfin libéré de la corruption ! La tour de glace se fissure et explose — <b>Maître Comptin est libre</b> ! Le <b>Cristal de la Bravoure</b>, d'un <b>bleu</b> saphir intense, brille entre tes mains." },
   { emoji:'🤝', text:"« Tu es venu... pour moi, » murmure le vieux sage, les yeux humides. « Toujours, » réponds-tu simplement. Lumo essuie une larme de lumière. Un Cristal de plus, et surtout : un ami sauvé." },
  ]},
  cm2: { id:'win_cm2', title:'Cristal de l\'Infini libéré !', crystal:'Cristal de l\'Infini', pages:[
   { emoji:'💎', text:"Le Colosse Stellaire s'agenouille, et toutes les étoiles applaudissent en scintillant ! Le <b>Cristal de l'Infini</b>, d'un <b>violet</b> améthyste, rejoint les autres et, ensemble, ils tournoient autour de toi en une couronne de lumière pure." },
   { emoji:'🌌', text:"« Tu as réuni tous les Cristaux, {hero} ! » s'écrie Lumo, éblouie. Il ne reste plus qu'une chose à faire : marcher vers le Sanctuaire, et affronter le {villain} en personne. Le moment de vérité est venu." },
  ]},
 },
 // ÉPILOGUE : joué après la victoire au Sanctuaire Final
 epilogue: {
  id:'epilogue',
  title:'Épilogue — La Lumière Retrouvée',
  pages:[
   { emoji:'⚔️', text:"Au terme d'un ultime affrontement, le {villain} tombe à genoux, à bout de forces. Mais au lieu de le frapper, {hero}, tu fais une chose que personne n'attendait : tu tends la main, et tu déposes doucement les Cristaux devant lui." },
   { emoji:'❤️', text:"« Une erreur ne fait pas de toi un monstre, » dis-tu d'une voix calme. « Elle fait de toi quelqu'un qui peut apprendre, et recommencer. » Le {villain} contemple les Cristaux... et pour la première fois depuis mille ans, une larme roule sur sa joue." },
   { emoji:'✨', text:"« J'avais... oublié cela, » souffle-t-il. « Merci, {hero}. » Alors son cœur s'illumine : il était le dernier Cristal manquant ! Tous les Cristaux fusionnent en une lumière éclatante qui balaie le tout dernier brouillard de Calcultopia." },
   { emoji:'🌈', text:"Les nombres dansent à nouveau dans l'air, les rivières comptent leurs vagues, et le soleil se lève pile à l'heure. Le royaume est sauvé ! Sur la grande place s'élève bientôt une statue à ton effigie : {hero}, Héros de Calcultopia." },
   { emoji:'🎉', text:"Maître Comptin, la fidèle Lumo, et même l'ancien Comte — devenu un humble professeur de mathématiques — t'acclament sous les étoiles. Ton odyssée restera gravée à jamais dans le ciel de Calcultopia. <b>FÉLICITATIONS, champion !</b>" },
  ],
 },
};

// v10.1.0 — _STORY est un pointeur permutable vers l'histoire de l'aventure active.
let _STORY = _PRIM_STORY;

// ─── Histoire MATERNELLE : « Le Pays des Couleurs » (v10.2.0, finale) ───
const _MAT_VILLAIN = 'Nuage Grognon';
const _MAT_KINGDOM = 'le Pays des Couleurs';
const _MAT_STORY = {
 intro: { id:'mat_intro', title:'Le Pays des Couleurs', pages:[
  { emoji:'🌈', text:"Il était une fois un pays magnifique : <b>{kingdom}</b>. Les coquelicots étaient rouges, les oranges bien orange, et le ciel tout bleu." },
  { emoji:'☁️', text:"Mais un matin, un gros nuage tout gris est arrivé : le <b>{villain}</b>. Il était si triste qu'il a aspiré toutes les couleurs ! Tout est devenu gris…" },
  { emoji:'🧒', text:"Les animaux ont besoin de toi, {hero} ! Sur chaque île, joue avec eux pour retrouver une couleur. En route, petit héros !" },
 ]},
 chapters: {
  cp:    { id:'mat_c_cp',  title:'La Plaine des Coquelicots', crystal:'le Rouge', pages:[
   { emoji:'🌱', text:"Te voilà dans la <b>Plaine des Coquelicots</b>. Les fleurs sont toutes grises et ça rend le petit lapin très triste." },
   { emoji:'🐰', text:"« {hero}, aide-nous ! » dit le lapin. « Si tu joues avec nous, le <b>rouge</b> reviendra ! »" },
  ]},
  ce1:   { id:'mat_c_ce1', title:'Le Verger des Oranges', crystal:'l\'Orange', pages:[
   { emoji:'🍊', text:"Dans le <b>Verger des Oranges</b>, les fruits sont gris comme des cailloux. L'ourson n'a plus envie de goûter !" },
   { emoji:'🐻', text:"« Mmm… aide-nous à retrouver la couleur <b>orange</b>, {hero}, et le verger sentira bon à nouveau ! »" },
  ]},
  ce2:   { id:'mat_c_ce2', title:'Les Bois Dorés', crystal:'le Jaune', pages:[
   { emoji:'🍂', text:"Chut… voici les <b>Bois Dorés</b>. D'habitude, les feuilles brillent comme des petits soleils. Mais tout est gris." },
   { emoji:'🦉', text:"« Hou hou ! » fait le hibou. « Le <b>jaune</b> se cache par ici. Joue avec nous pour le retrouver, {hero} ! »" },
  ]},
  cm1:   { id:'mat_c_cm1', title:'Le Lagon aux Tortues', crystal:'le Vert', pages:[
   { emoji:'🐢', text:"Plouf ! Bienvenue au <b>Lagon aux Tortues</b>. Les palmiers et les tortues ont perdu leur joli <b>vert</b>." },
   { emoji:'🌊', text:"« Viens jouer dans l'eau, {hero} ! » disent les poissons. « Ensemble, on va rendre le lagon tout vert ! »" },
  ]},
  cm2:   { id:'mat_c_cm2', title:'La Colline des Bleuets', crystal:'le Bleu', pages:[
   { emoji:'🪁', text:"Sur la <b>Colline des Bleuets</b>, le vent fait danser les cerfs-volants. Mais le ciel et les fleurs ont perdu leur <b>bleu</b>." },
   { emoji:'🐦', text:"« Encore un effort, {hero} ! » chante l'oiseau. « Quand le bleu reviendra, le ciel sera magnifique ! »" },
  ]},
  final: { id:'mat_c_final', title:'Le Château du Soir', crystal:'l\'Indigo', pages:[
   { emoji:'🏰', text:"Tout là-haut, voici le <b>Château du Soir</b>. C'est ici que dort le {villain}, dans le ciel couleur de nuit." },
   { emoji:'🌙', text:"Il garde la couleur <b>indigo</b>, celle du soir qui tombe. N'aie pas peur, {hero} : il a surtout besoin d'un ami." },
  ]},
 },
 victories: {
  cp:  { id:'mat_w_cp',  title:'Le Rouge est revenu !',  crystal:'le Rouge',  pages:[
   { emoji:'❤️', text:"Hourra ! Les coquelicots redeviennent <b>rouges</b>, un par un, comme des petites flammes ! Le lapin saute de joie." },
   { emoji:'🌈', text:"Regarde ton carnet, {hero} : la première couleur de l'arc-en-ciel brille déjà !" },
  ]},
  ce1: { id:'mat_w_ce1', title:'L\'Orange est revenue !',  crystal:'l\'Orange',  pages:[
   { emoji:'🧡', text:"Les oranges redeviennent <b>orange</b> et toutes brillantes ! L'ourson croque dedans : « Merci {hero} ! »" },
   { emoji:'🌈', text:"Deux couleurs dans ton arc-en-ciel ! Tu es un vrai petit magicien des couleurs." },
  ]},
  ce2: { id:'mat_w_ce2', title:'Le Jaune est revenu !',     crystal:'le Jaune',  pages:[
   { emoji:'💛', text:"Les feuilles des bois redeviennent <b>jaunes</b> et dorées. Tout scintille ! Le hibou fait « hou hou » de bonheur." },
   { emoji:'🌈', text:"Trois couleurs déjà ! L'arc-en-ciel de ton carnet devient de plus en plus joli." },
  ]},
  cm1: { id:'mat_w_cm1', title:'Le Vert est revenu !',  crystal:'le Vert',  pages:[
   { emoji:'💚', text:"Le <b>vert</b> coule sur les palmiers et les carapaces des tortues ! Le lagon est redevenu tout beau." },
   { emoji:'🌈', text:"Quatre couleurs, {hero} ! Plus que deux îles et le {villain} verra quelque chose de magnifique…" },
  ]},
  cm2: { id:'mat_w_cm2', title:'Le Bleu est revenu !', crystal:'le Bleu', pages:[
   { emoji:'💙', text:"Le ciel redevient <b>bleu</b>, et les bleuets aussi ! Les cerfs-volants dansent de joie dans le vent." },
   { emoji:'🌈', text:"Cinq couleurs ! Il ne manque plus que celle du soir. Direction le château, petit héros !" },
  ]},
 },
 epilogue: { id:'mat_epilogue', title:'L\'Arc-en-ciel complet', pages:[
  { emoji:'🌌', text:"Bravo {hero} ! L'<b>indigo</b> du soir est revenu. Et là… le {villain} ouvre grand les yeux : tout le pays brille de mille couleurs !" },
  { emoji:'☁️', text:"« Comme c'est beau… » murmure le nuage. Et pour la première fois, il <b>sourit</b> ! Il n'est plus gris du tout." },
  { emoji:'💜', text:"Alors, pour te dire merci, il souffle une couleur rien que pour toi : le <b>violet</b> ! La septième couleur, celle qui manquait." },
  { emoji:'🌈', text:"Regarde ton carnet : l'arc-en-ciel est <b>complet</b> ! {kingdom} est sauvé, et c'est grâce à toi. <b>BRAVO, petit héros des couleurs !</b>" },
 ]},
};

// ═══════════════════════════════════════════════════════
// L'ODYSSÉE DES MOTS — Maternelle (français) : « Le Grand Livre du Conteur »
// Aventure française pour GM.subject==='fr' en maternelle. Zones isolées
// (ids 'matfr_…') → progression séparée des maths. Histoire A (cadre) +
// Histoire B (le conte du Livre, débloqué à la fin).
// ═══════════════════════════════════════════════════════
const _MAT_VILLAIN_FR = 'le Silence';
const _MAT_KINGDOM_FR = 'le Pays des Mots';
// Zones : on réutilise la géométrie maternelle douce, avec des ids distincts
// pour isoler totalement la conquête (P.mapBossBeaten) de celle des maths, et des
// labels thématisés monde par monde (« Le Grand Livre du Conteur »).
const _MATFR_ZONE_LABELS = {
 // La Forêt des Animaux Muets (cris d'animaux)
 'matfr_cp_1':'La Clairière Silencieuse','matfr_cp_2':'Le Terrier du Lapin','matfr_cp_3':'La Mare aux Canards','matfr_cp_4':'Le Sentier des Bêtes','matfr_cp_5':'Le Grand Chêne Creux',
 // Le Pré des Premiers Mots (vocabulaire, intrus)
 'matfr_ce1_1':'Le Pré aux Mille Choses','matfr_ce1_2':'Le Panier Renversé','matfr_ce1_3':'Le Jardin des Noms','matfr_ce1_4':"L'Allée des Images",'matfr_ce1_5':'Le Sentier des Trouvailles',
 // Les Collines qui Chantent (syllabes)
 'matfr_ce2_1':"La Colline de l'Écho",'matfr_ce2_2':'Le Sentier qui Résonne','matfr_ce2_3':'Les Trois Sommets','matfr_ce2_4':'La Vallée des Tambours','matfr_ce2_5':'Le Pic des Refrains',
 // Le Lac aux Échos (rimes)
 'matfr_cm1_1':'La Rive aux Rimes','matfr_cm1_2':"L'Îlot des Reflets",'matfr_cm1_3':'Le Ponton Chantant','matfr_cm1_4':'La Crique des Échos','matfr_cm1_5':"Le Miroir d'Eau",
 // La Grotte des Premiers Sons (son d'attaque)
 'matfr_cm2_1':"L'Entrée Murmurante",'matfr_cm2_2':'La Galerie des Sons','matfr_cm2_3':'La Source Chuchotante','matfr_cm2_4':'Le Couloir Bleu','matfr_cm2_5':'La Chambre des Murmures',
 // Le Château des Lettres (lettres)
 'matfr_final_1':'Le Pont des Lettres','matfr_final_2':"La Tour de l'Alphabet",'matfr_final_3':'La Salle du Grand A','matfr_final_4':"L'Escalier des Mots",'matfr_final_5':'Le Donjon du Conteur',
};
const MAT_ZONES_FR = (typeof MAT_ZONES!=='undefined' ? MAT_ZONES : []).map(z => {
 const id = String(z.id).replace('mat_','matfr_');
 return Object.assign({}, z, { id, label: _MATFR_ZONE_LABELS[id] || z.label });
});
const _MAT_REGIONS_FR = [
 { id:'cp',    label:'La Forêt des Animaux Muets', levels:['PS'], shape:'colline' },
 { id:'ce1',   label:'Le Pré des Premiers Mots',   levels:['PS'], shape:'feuille' },
 { id:'ce2',   label:'Les Collines qui Chantent',  levels:['MS'], shape:'dune' },
 { id:'cm1',   label:'Le Lac aux Échos',           levels:['MS'], shape:'citadelle' },
 { id:'cm2',   label:'La Grotte des Premiers Sons',levels:['GS'], shape:'nebuleuse' },
 { id:'final', label:'Le Château des Lettres',     levels:['GS'], shape:'mandala' },
];
const _MAT_STORY_FR = {
 intro: { id:'matfr_intro', title:'Le Grand Livre du Conteur', pages:[
  { emoji:'📖', text:"Il était une fois un vieux Conteur, et un Livre pas comme les autres. Quand il l'ouvrait, les mots s'envolaient de ses pages comme des papillons : on entendait chanter les oiseaux, rire les enfants, souffler le vent." },
  { emoji:'🌑', text:"Mais une nuit, <b>{villain}</b> entra par la fenêtre. Il referma le Livre d'un coup sec — clap ! — et tous les mots s'échappèrent, effrayés, aux quatre coins du monde." },
  { emoji:'🪶', text:"Depuis, les pages sont toutes blanches. Alors une petite plume glisse du Livre et se pose sur ta main. « Petit ami {hero}, veux-tu m'aider à retrouver les mots, page après page ? Notre histoire commence ici. »" },
 ]},
 chapters: {
  cp:    { id:'matfr_c_cp',  title:'La Forêt des Animaux Muets', crystal:'la première page', pages:[
   { emoji:'🌲', text:"La première page t'emmène dans une <b>forêt</b> toute verte. D'habitude, ça chante et ça gazouille du matin au soir… mais aujourd'hui, plus un seul bruit." },
   { emoji:'🐾', text:"Les animaux ont perdu leur voix ! « Tends bien l'oreille, {hero}, chuchote Plume. Reconnais chaque cri, et la forêt rechantera. »" },
  ]},
  ce1:   { id:'matfr_c_ce1', title:'Le Pré des Premiers Mots', crystal:'la deuxième page', pages:[
   { emoji:'🌼', text:"Au bout de la forêt s'ouvre un grand <b>pré</b> doré. Mais ici, plus personne ne sait comment s'appellent les choses : tout s'est mélangé !" },
   { emoji:'🧺', text:"« Nomme chaque chose, {hero}, dit Plume, et chasse le petit <b>intrus</b> qui s'est glissé là où il ne fallait pas ! »" },
  ]},
  ce2:   { id:'matfr_c_ce2', title:'Les Collines qui Chantent', crystal:'la troisième page', pages:[
   { emoji:'⛰️', text:"Voici de grandes <b>collines</b> magiques. Quand on dit un mot tout fort, l'écho le renvoie en petits morceaux : pa-pi-llon !" },
   { emoji:'👏', text:"« Ces morceaux, ce sont les <b>syllabes</b>, explique Plume. Tape dans tes mains pour les compter, et les collines chanteront avec toi ! »" },
  ]},
  cm1:   { id:'matfr_c_cm1', title:'Le Lac aux Échos', crystal:'la quatrième page', pages:[
   { emoji:'💧', text:"Après les collines, un <b>lac</b> tranquille comme un miroir. Quand un mot tombe dans l'eau, un autre lui répond en finissant pareil : chat… rat !" },
   { emoji:'🌊', text:"« Trouve les mots qui sonnent pareil à la fin — ce sont des <b>rimes</b> — et tu rendras au lac toutes ses chansons, {hero} ! »" },
  ]},
  cm2:   { id:'matfr_c_cm2', title:'La Grotte des Premiers Sons', crystal:'la cinquième page', pages:[
   { emoji:'🕳️', text:"Voici une <b>grotte</b> fraîche et bleutée, où les sons aiment se cacher. Chaque mot commence par un petit son, comme une porte qui s'ouvre : sssserpent…" },
   { emoji:'✨', text:"« Devine par quel <b>son</b> commence chaque mot, souffle Plume, et une lumière s'allumera dans la grotte. »" },
  ]},
  final: { id:'matfr_c_final', title:'Le Château des Lettres', crystal:'la dernière page', pages:[
   { emoji:'🏰', text:"Au sortir de la grotte se dresse le <b>Château des Lettres</b>. Le A pointu comme un toit, le O rond comme une bulle… chaque lettre chante son petit son." },
   { emoji:'🔤', text:"« Tu es presque au bout du voyage, {hero}, murmure Plume, très fière. Reconnais les <b>lettres</b> et leur chanson, et le château ouvrira sa dernière porte. »" },
  ]},
 },
 victories: {
  cp:  { id:'matfr_w_cp',  title:'Une page retrouvée !', crystal:'la première page', pages:[
   { emoji:'🐱', text:"Hourra ! Un cri par-ci, un chant par-là… la forêt se réveille ! Les animaux ont retrouvé leur voix." },
   { emoji:'📖', text:"La première page du Livre se remplit de mots tout neufs. <b>Page après page</b>, le Livre revit !" },
  ]},
  ce1: { id:'matfr_w_ce1', title:'Une page retrouvée !', crystal:'la deuxième page', pages:[
   { emoji:'🍎', text:"Chaque chose a retrouvé son nom, et l'intrus est reparti ! Le pré brille de mille couleurs." },
   { emoji:'📖', text:"La deuxième page se couvre de jolis dessins. Encore une page sauvée, {hero} !" },
  ]},
  ce2: { id:'matfr_w_ce2', title:'Une page retrouvée !', crystal:'la troisième page', pages:[
   { emoji:'🎵', text:"Les collines résonnent de bonheur et te renvoient leur plus belle musique !" },
   { emoji:'📖', text:"La troisième page se met à fredonner toute seule. Bravo, {hero} !" },
  ]},
  cm1: { id:'matfr_w_cm1', title:'Une page retrouvée !', crystal:'la quatrième page', pages:[
   { emoji:'🌟', text:"À chaque rime trouvée, une vaguelette part danser sur l'eau. Le lac te dit merci !" },
   { emoji:'📖', text:"La quatrième page brille comme le soleil sur l'eau. Déjà quatre pages !" },
  ]},
  cm2: { id:'matfr_w_cm2', title:'Une page retrouvée !', crystal:'la cinquième page', pages:[
   { emoji:'💡', text:"Une à une, les petites lumières s'allument : la grotte scintille comme un ciel d'étoiles !" },
   { emoji:'📖', text:"La cinquième page s'éclaire d'une douce clarté. Plus qu'une, {hero} !" },
  ]},
 },
 epilogue: { id:'matfr_epilogue', title:'La Dernière Page', pages:[
  { emoji:'🦋', text:"Il ne reste qu'une page blanche : la <b>dernière</b>. Tous les mots que tu as délivrés tournoient autour de toi comme des papillons, prêts à rentrer à la maison." },
  { emoji:'📖', text:"« Rassemble-les tous, {hero} ! » souffle Plume. Tu ouvres grand les bras… et un à un, les mots se posent sur la dernière page. Le Livre se referme, tout chaud, rempli à nouveau." },
  { emoji:'🌟', text:"Vaincu, <b>{villain}</b> s'enfuit par la fenêtre, et la première étoile se met à briller." },
  { emoji:'🪶', text:"Le vieux Conteur ouvre les yeux. Il ouvre le Livre… et les mots s'envolent à nouveau, par milliers ! « Tu as sauvé toutes les histoires du monde, {hero}. Merci. »" },
  { emoji:'📖', text:"« Maintenant que le Livre est complet, il peut enfin raconter sa <b>propre</b> histoire. Assieds-toi près du feu… et écoute. »" },
 ]},
 // Histoire B — débloquée à la fin : le conte du Livre (origines du Conteur).
 bookTale: { id:'matfr_booktale', title:'Le conte du Livre', pages:[
  { emoji:'👴', text:"Il y a très longtemps, bien avant d'être vieux, le Conteur était un tout petit garçon." },
  { emoji:'🏚️', text:"Il vivait dans un village au bout du monde, où l'on ne parlait presque plus. Les gens avaient oublié les mots, un par un, comme on perd des billes au fond d'une poche." },
  { emoji:'👂', text:"Mais le petit garçon avait un secret : il <b>écoutait</b>. La pluie sur les toits, le feu qui craque, l'oiseau du matin. Pour lui, le monde était plein de petites musiques." },
  { emoji:'🪶', text:"Un jour d'automne, il trouva au pied d'un arbre une plume blanche qui brillait à peine. Et la plume se mit à parler, tout bas : « Tu entends les sons du monde ? Ce sont des mots qui attendent qu'on les garde. »" },
  { emoji:'📖', text:"Elle fit apparaître dans ses bras un grand livre aux pages blanches. « Va par le monde, écoute, et garde chaque mot ici. Un Livre plein de mots, c'est un Livre plein de vie. »" },
  { emoji:'🌍', text:"Alors le garçon partit. Il traversa forêts, prés, collines et lacs. Partout il s'arrêtait pour écouter, et partout il ramassait des mots comme on ramasse des fleurs." },
  { emoji:'✨', text:"Un mot, puis un autre, puis un autre encore. Le Livre devint lourd et chaud entre ses mains. L'enfant, lui, devint vieux, avec une longue barbe blanche." },
  { emoji:'🏡', text:"Il revint enfin dans son village silencieux. Et là, pour la première fois, il ouvrit son Livre devant tout le monde." },
  { emoji:'🦋', text:"Les mots s'envolèrent par centaines ! Quelqu'un dit « bonjour ». Puis « merci ». Puis un enfant éclata de rire. Le village tout entier se réveilla, et plus jamais il ne se tut." },
  { emoji:'🌑', text:"C'est ainsi qu'il devint le Conteur. Mais quelque part, dans le froid, le <b>Silence</b> avait entendu ce premier « bonjour »… et il guettait la nuit où il pourrait refermer le Livre. Cette nuit-là, justement, fut celle où commença <b>ton</b> aventure." },
  { emoji:'💛', text:"Car tant qu'un enfant voudra bien tendre l'oreille et retrouver les mots, page après page, le Livre ne se taira jamais. « Garde-le bien, {hero}. Maintenant, c'est un peu le tien aussi. »" },
 ]},
};

// ═══════════════════════════════════════════════════════
// L'ODYSSÉE DES MOTS — Primaire (français) : « Le carnet de Verbe »
// Aventure française pour GM.subject==='fr' en primaire. Zones isolées
// (ids 'primfr_…'). Histoire A (carnet du héros) + Histoire B (origines de Babel).
// ═══════════════════════════════════════════════════════
const _PRIM_VILLAIN_FR = 'le Docteur Babel';
const _PRIM_KINGDOM_FR = 'Verbopolis';
const _PRIMFR_ZONE_LABELS = {
 // CP — district des Sons
 plaine:'Les Faubourgs de Verbopolis', village:'La Place des Lettres', prairie:"L'Allée des Voyelles", bonbons:'Le Marché aux Syllabes',
 // CE1 — quartier de la Lecture
 foret:'La Rue des Libraires', champignons:'Le Passage des Conteurs', trolls:"L'Impasse des Syllabes", plage:'Les Quais de la Lecture',
 // CE2 — halles du Vocabulaire
 desert:'Les Halles aux Mots', plaines_venteuses:'Le Jardin des Synonymes', temple:'La Grande Bibliothèque', profondeurs:'Les Souterrains du Sens',
 // CM1 — tour du Temps
 glace:'Le Quartier des Horloges', marais:'La Gare des Temps', forteresse:'La Tour des Verbes', sakura:'Le Beffroi des Conjugaisons', nocturne:"L'Observatoire du Temps",
 // CM2 — citadelle de la Phrase
 volcan:"L'Imprimerie du Scribe Noir", espace:'Les Toits de la Syntaxe', cimes:'Le Grand Pont des Mots', mecanique:"L'Atelier des Phrases", ile:'La Citadelle de la Phrase',
 // Final — île de la Rature
 sanctuaire:"L'Antre du Docteur Babel",
};
const PRIM_ZONES_FR = (typeof PRIM_ZONES!=='undefined' ? PRIM_ZONES : []).map(z => Object.assign({}, z, { id:'primfr_'+z.id, label: _PRIMFR_ZONE_LABELS[z.id] || z.label }));
const _PRIM_REGIONS_FR = [
 { id:'cp',    label:'Le district des Sons',       levels:['CP'],    shape:'colline' },
 { id:'ce1',   label:'Le quartier de la Lecture',  levels:['CE1'],   shape:'feuille' },
 { id:'ce2',   label:'Les halles du Vocabulaire',  levels:['CE2'],   shape:'dune' },
 { id:'cm1',   label:'La tour du Temps',           levels:['CM1'],   shape:'citadelle' },
 { id:'cm2',   label:'La citadelle de la Phrase',  levels:['CM2'],   shape:'nebuleuse' },
 { id:'final', label:"L'île de la Rature",         levels:['FINAL'], shape:'mandala' },
];
const _PRIM_STORY_FR = {
 intro: { id:'primfr_intro', title:'Le journal intime', pages:[
  { emoji:'🦸', text:"Cher carnet. Avant aujourd'hui, j'étais l'écolier le plus ordinaire de <b>Verbopolis</b> — la dernière ville où les gens se comprennent encore. Dehors, la <b>Guilde de la Rature</b> a brisé la langue commune des hommes, et plus personne ne se comprend." },
  { emoji:'🛡️', text:"Notre ville tient debout : elle est gardée par les <b>Gardiens de l'Alphabet</b>, qui repoussent chaque attaque de la Guilde et de son chef, {villain}. Moi, {hero}, je n'avais jamais eu peur… jusqu'à ce soir." },
  { emoji:'🌑', text:"Une ombre grise m'a barré la route : <b>Mutisme</b>. Tous les sons se sont éteints. Sans réfléchir, j'ai voulu hurler « STOP » — et le mot est devenu un vrai <b>mur de pierre</b> ! Mes mots prennent vie ?!" },
  { emoji:'⚡', text:"Mutisme allait bondir quand une cape rouge a fendu la nuit : <b>L'Orateur</b>, le héros le plus célèbre de la ville ! Il a chassé le monstre : « Beau réflexe, gamin. Tes mots prennent vie. Viens — et ça commence par l'orthographe ! »" },
  { emoji:'🏛️', text:"C'est ainsi que je suis entré à l'<b>Académie des super-héros</b>. Sur le perron, <b>Dame Calligraphe</b>, la directrice, m'a dit : « Ici, un mot mal dit est un mot perdu. » Demain commence ma formation de héros — et puisque mes mots prennent vie, on m'a déjà trouvé un nom de code : désormais, je serai <b>Verbe</b>." },
 ]},
 chapters: {
  cp:    { id:'primfr_c_cp',  title:'Le district des Sons', crystal:'le pouvoir de la Voix', pages:[
   { emoji:'🔤', text:"Cher carnet. Pour impressionner les recrues, j'ai voulu un <b>bouclier</b> — j'ai dit « bouclié », et un truc tout mou m'est tombé sur le pied ! « Ton pouvoir n'accepte pas les fautes », a ri L'Orateur." },
   { emoji:'🗣️', text:"Le district est tombé sous la coupe de <b>Mutisme</b>, un sbire de la <b>Guilde de la Rature</b> qui a volé les voix. Pour le vaincre, je dois rendre à chaque lettre son chant : le <i>sss</i>, le <i>rrr</i>, le <i>ch</i>… Chaque <b>son</b> juste est une arme !" },
  ]},
  ce1:   { id:'primfr_c_ce1', title:'Le quartier de la Lecture', crystal:"le pouvoir d'enchaîner les mots", pages:[
   { emoji:'📖', text:"Nouveau vilain de la <b>Guilde de la Rature</b> : <b>Cacophon</b>, un tambour couvert de mille bouches qui brouille les syllabes. J'ai voulu une « échelle » ; j'ai bafouillé « léchelle » — et une langue géante a léché le mur !" },
   { emoji:'🎵', text:"« La lecture, c'est de la musique : chaque <b>syllabe</b> sur le bon temps ! » Alors j'apprends à enchaîner, calmement : <i>é–chel–le</i>. Plus je lis juste, plus mes mots sortent vite et nets." },
  ]},
  ce2:   { id:'primfr_c_ce2', title:'Les halles du Vocabulaire', crystal:'le pouvoir du mot juste', pages:[
   { emoji:'🧠', text:"Le pire ennemi de la Guilde, jusqu'ici : <b>Amnésios</b>, élégant et glacé, qui efface le <b>sens</b> des mots. Un boulanger m'a tendu un parapluie en croyant me donner du pain !" },
   { emoji:'🎯', text:"Mon pouvoir déraille : je dis « lampe » en pensant « lance ». « Connais le <b>sens</b> exact, ou ton pouvoir te trahira ! » Alors je réapprends les mots, leurs familles, leurs nuances." },
  ]},
  cm1:   { id:'primfr_c_cm1', title:'La tour du Temps', crystal:'le pouvoir sur le temps', pages:[
   { emoji:'⏳', text:"La Guilde envoie un nouveau monstre : <b>Le Conjurateur</b>, un sablier vivant dont le sable coule à l'envers. Il fige les verbes hors du temps : tout le quartier est coincé dans un présent sans fin." },
   { emoji:'🏃', text:"J'ai crié « je bondirai ! » pour sauter un gouffre — et mon saut est arrivé <b>trop tard</b> ! « Le bon pouvoir au bon <b>temps</b> : présent pour maintenant, futur pour après ! »" },
  ]},
  cm2:   { id:'primfr_c_cm2', title:'La citadelle de la Phrase', crystal:'le pouvoir des phrases', pages:[
   { emoji:'🧩', text:"Dernier district, et le boss le plus retors de la <b>Guilde de la Rature</b> : <b>Syntax</b>, un marionnettiste qui mêle l'ordre des mots, secondé du <b>Scribe Noir</b> qui réécrit les livres en cachette." },
   { emoji:'🥽', text:"Mes pièges, ce sont les <b>homophones</b> : j'ai voulu un « ver », j'ai fait apparaître un <b>verre</b>, puis un <b>vers</b>, puis un mur <b>vert</b> ! « Le son ne suffit plus : il faut le sens ET l'orthographe. »" },
  ]},
 },
 victories: {
  cp:  { id:'primfr_w_cp',  title:'Un pouvoir gagné !', crystal:'la Voix', pages:[
   { emoji:'🗯️', text:"Hourra ! J'ai prononcé, fort et clair, tous les sons volés — et <b>Mutisme</b> s'est dissous comme une fumée grise. Les voix sont revenues dans tout le quartier !" },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>la Voix</b> — je fais surgir des mots simples, à condition de les dire parfaitement. Me voilà <b>Apprenti</b> ! (J'ai crié « victoir » : une banderole molle m'est retombée sur la tête.)" },
  ]},
  ce1: { id:'primfr_w_ce1', title:'Un pouvoir gagné !', crystal:'la Lecture', pages:[
   { emoji:'🔊', text:"À chaque mot remis dans le bon ordre, une bouche de <b>Cacophon</b> se taisait. À la fin, la dernière a chuchoté « bravo » avant de disparaître !" },
   { emoji:'🎖️', text:"Pouvoir gagné : je peux <b>enchaîner plusieurs mots</b> sans me tromper — des phrases courtes qui prennent vie d'un coup. Grade d'<b>Écuyer</b> !" },
  ]},
  ce2: { id:'primfr_w_ce2', title:'Un pouvoir gagné !', crystal:'le Vocabulaire', pages:[
   { emoji:'💡', text:"J'ai rendu aux gens le sens de leurs mots, jusqu'à ce qu'<b>Amnésios</b> n'ait plus rien à effacer. « Tu te souviens de trop de choses… », a-t-il murmuré en s'évanouissant." },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>le mot juste</b> — je fais surgir l'objet précis dont j'ai besoin. Grade de <b>Cadet</b> !" },
  ]},
  cm1: { id:'primfr_w_cm1', title:'Un pouvoir gagné !', crystal:'le Temps', pages:[
   { emoji:'🕰️', text:"J'ai conjugué plus vite que lui : à chaque verbe juste, je remettais une horloge à l'heure. Quand la dernière a sonné, <b>Le Conjurateur</b> s'est éteint comme une bougie." },
   { emoji:'🎖️', text:"Pouvoir gagné : j'agis sur le <b>temps court</b> — figer une seconde, relancer un geste. Grade de <b>Lieutenant</b> ! Dame Calligraphe a écrit « Progrès remarquables ». Une médaille, venant d'elle." },
  ]},
  cm2: { id:'primfr_w_cm2', title:'Un pouvoir gagné !', crystal:'la Phrase', pages:[
   { emoji:'🏗️', text:"J'ai appris à bâtir des <b>phrases entières</b> — sujet, verbe, accords, le bon homophone — et mon pouvoir a changé d'échelle ! <b>Syntax</b> s'est emmêlé tout seul, et j'ai rattrapé le <b>Scribe Noir</b> d'une phrase bien tournée." },
   { emoji:'🎖️', text:"Grade de <b>Champion</b> ! Ce soir, L'Orateur est venu, sérieux : « Tu es prêt, {hero}. Les <b>Gardiens de l'Alphabet</b> t'attendent. Demain, on part pour l'île de la Rature. »" },
  ]},
 },
 epilogue: { id:'primfr_epilogue', title:"L'île de la Rature", pages:[
  { emoji:'⛵', text:"Cher carnet, je l'écris vite, on accoste. L'<b>île de la Rature</b> est noire, hérissée de tours. Autour de moi, les <b>Gardiens de l'Alphabet</b> au complet — et moi, {hero}, alias Verbe, debout parmi eux !" },
  { emoji:'⚔️', text:"Pour atteindre {villain}, on repousse un à un tous ses sbires : Mutisme, Cacophon, Amnésios, le Conjurateur, Syntax. Chaque mot juste est un coup porté à l'ombre." },
  { emoji:'🌑', text:"Tout en haut de la dernière tour, il y avait <b>lui</b>. Plus petit que je l'imaginais. Plus triste, aussi. Dans ses yeux, pas de haine : de la <b>solitude</b>." },
  { emoji:'💬', text:"Il a lancé son plus terrible sort : un grand charabia où plus personne ne se comprenait. Alors j'ai prononcé, justes et vrais, les mots les plus simples — <i>bonjour, merci, ami, ensemble</i> — et chacun déchirait son charabia." },
  { emoji:'🛡️', text:"La <b>Guilde de la Rature</b> est tombée. Partout, les peuples ont recommencé à se parler. Et moi… je suis devenu <b>Gardien de l'Alphabet</b>, le plus jeune de tous. Reste une question : pourquoi {villain} a-t-il voulu briser les mots ? À l'Académie, un vieux dossier raconte tout. J'ai le droit de l'ouvrir…" },
 ]},
 // Histoire B — débloquée à la fin : les origines du Docteur Babel.
 bookTale: { id:'primfr_booktale', title:'Les origines du Docteur Babel', pages:[
  { emoji:'👶', text:"Bien avant d'être le Docteur Babel, il fut un petit garçon. On l'appelait <b>Aldric</b>, l'enfant le plus intelligent que Verbopolis eût jamais porté. Trop, peut-être." },
  { emoji:'🧠', text:"À deux ans, il parlait comme un livre ; à cinq, il trouvait les mots des grands trop pauvres pour dire ce qu'il avait dans la tête. Il habitait un palais et devait le décrire avec trois cailloux." },
  { emoji:'✨', text:"Alors il inventa <b>sa propre langue</b> : <i>le Verbe pur</i>, d'une précision vertigineuse, où chaque chagrin, chaque lumière avait son mot. La plus belle langue du monde. Hélas, personne ne pouvait lui répondre." },
  { emoji:'🎂', text:"Le jour de ses sept ans, il récita pour ses camarades le plus beau poème du Verbe pur — sur l'amitié. Silence. Puis : « On n'a rien compris ! » Et tous éclatèrent de rire. « Parle normalement ! »" },
  { emoji:'💧', text:"Mais « normalement », pour lui, c'était parler petit. Il voulait être compris <b>entièrement</b> — et il ne le fut jamais. Pas même par sa mère, qui pleurait le soir en l'entendant murmurer des mots qu'elle ne reconnaissait pas." },
  { emoji:'🗼', text:"La solitude monta comme une eau froide. Il devint un savant immense et seul, enfermé dans une tour pleine de livres qu'il était le seul à lire. Son palais de mots était devenu sa prison." },
  { emoji:'⛈️', text:"Un soir d'orage, une pensée terrible lui vint : « Si personne ne veut me comprendre, alors plus personne ne comprendra personne. » Cette nuit-là, Aldric mourut, et le <b>Docteur Babel</b> naquit." },
  { emoji:'⚙️', text:"Il bâtit une machine capable de <b>briser la langue commune</b> des hommes. Pour l'aider, il alla chercher ceux que les mots avaient blessés." },
  { emoji:'🤍', text:"Un <b>muet</b> qu'on n'avait jamais écouté devint <b>Mutisme</b>. Un enfant <b>bègue</b> qu'on avait moqué devint <b>Cacophon</b>. Une savante qu'on n'avait jamais crue devint <b>Amnésios</b>." },
  { emoji:'🔮', text:"Un voyant qu'on prenait pour un fou devint le <b>Sous-Entendu</b>. À tous, Babel fit la même promesse douce et empoisonnée : « Plus jamais vous ne souffrirez de n'être pas compris. » Ainsi naquit la <b>Guilde de la Rature</b>." },
  { emoji:'🌍', text:"La machine s'éveilla. D'un bout à l'autre de la Terre, les mots se vidèrent. Les peuples se turent, se déchirèrent, se murèrent dans leur charabia. Le monde devint cette mosaïque d'îles solitaires." },
  { emoji:'🕯️', text:"Mais Babel avait commis la plus belle des erreurs : il restait une ville qui croyait que comprendre l'autre est ce qu'il y a de plus précieux — <b>Verbopolis</b>. Là naquit un garçon qui ferait jaillir des mots : <b>toi</b>." },
  { emoji:'🤝', text:"Car voici son secret jamais compris : un mot juste n'est pas un mot <b>parfait</b>, c'est un mot <b>partagé</b>. La langue commune n'était pas une prison : c'était un <b>pont</b>. Et Babel avait passé sa vie à brûler les ponts." },
  { emoji:'🙏', text:"Le jour où tu l'as vaincu, ce n'est pas ta force qui l'a désarmé : c'est qu'un enfant avait pris la peine de le comprendre. Avant de disparaître, il prononça le mot qu'il refusait de dire depuis l'enfance : « <b>Pardon.</b> »" },
  { emoji:'💛', text:"Au même instant, très loin, un enfant que personne n'avait su comprendre leva la tête : on venait de dire son prénom. — {hero} referma le dossier et écrivit : « Demain, j'irai m'asseoir près de celui qui reste seul dans la cour. Les mots, ça ne sert à rien si on les garde pour soi. »" },
 ]},
};

// ─── Histoire COLLÈGE : « Le Forgeron des Étoiles » (v10.2.0, mini-roman) ───
const _COL_VILLAIN = 'Léthéas, le Titan de l\'Oubli';
const _COL_KINGDOM = 'Sidéris';
const _COL_STORY = {
 intro: { id:'col_intro', title:'Le Forgeron des Étoiles', pages:[
  { emoji:'🌌', text:"Au commencement, il n'y avait que la nuit. Puis vinrent les forgerons d'étoiles, qui martelaient la lumière comme d'autres martèlent le fer. De leurs forges naquit <b>{kingdom}</b>, un royaume suspendu entre les constellations, où chaque vérité mathématique faisait briller une étoile." },
  { emoji:'⚒️', text:"Le plus grand d'entre eux s'appelle <b>Maître Alaric Forgétoile</b>. C'est lui qui forgea jadis l'<b>Armure Solaire</b> : six pièces d'or stellaire, trempées dans le cœur d'un soleil, capables de résister à l'oubli lui-même." },
  { emoji:'🌑', text:"Car l'oubli a un nom : <b>Léthéas</b>. Le Titan. Là où passe son ombre, les nombres se taisent, les théorèmes s'effacent, les étoiles s'éteignent une à une. Nul ne sait d'où il vient. Alaric, lui, détourne les yeux quand on pose la question." },
  { emoji:'💥', text:"Une nuit, Léthéas frappa la forge céleste. L'Armure Solaire vola en éclats, et ses six pièces tombèrent du ciel, dispersées sur les îles de {kingdom}. Depuis, l'ombre gagne. Île après île. Étoile après étoile." },
  { emoji:'🎓', text:"C'est alors qu'Alaric t'a trouvé, {hero}. « L'or stellaire ne répond ni à la force, ni à la magie », dit-il en posant son marteau. « Il répond à l'esprit. Résous, comprends, progresse — et chaque pièce reconnaîtra son porteur. » Ton odyssée commence." },
 ]},
 chapters: {
  cp:    { id:'col_c_cp',  title:'Le Port des Décimales', crystal:'la Jambière Gauche', pages:[
   { emoji:'⚓', text:"Le <b>Port des Décimales</b> fut le premier touché. Le brouillard de Léthéas y a tout déréglé : les virgules dérivent comme des bateaux sans amarres, les balances mentent, les marchands ne savent plus compter leur monnaie." },
   { emoji:'🗺️', text:"« La <b>Jambière Gauche</b> est tombée quelque part dans ces docks », t'écrit Alaric. « C'est la pièce de l'<b>Aplomb</b> : celui qui la porte ne vacille jamais. Commence par remettre de l'ordre dans les nombres — l'or t'observera. »" },
  ]},
  ce1:   { id:'col_c_ce1', title:'Les Cavernes Fractionnaires', crystal:'la Jambière Droite', pages:[
   { emoji:'🍰', text:"Sous la forêt, les <b>Cavernes Fractionnaires</b> résonnent d'un silence étrange. Ici, jadis, on apprenait l'art du partage : tout se divisait en parts justes. Léthéas a brisé cette harmonie — les parts ne s'assemblent plus." },
   { emoji:'⚒️', text:"« La <b>Jambière Droite</b> gît au plus profond des galeries », dit Alaric. « C'est la pièce de l'<b>Élan</b> : la vitesse de celui qui enchaîne sans trébucher. Méfie-toi des dénominateurs, petit forgeron. Ils ne pardonnent rien. »" },
  ]},
  ce2:   { id:'col_c_ce2', title:'Le Plateau des Relatifs', crystal:'le Brassard Gauche', pages:[
   { emoji:'🌡️', text:"Le froid mord, sur le <b>Plateau des Relatifs</b>. Au-dessus de zéro, en dessous de zéro… la frontière s'est effacée avec le reste. Les nombres positifs et négatifs errent, mélangés, sans plus savoir de quel côté de l'axe ils vivent." },
   { emoji:'🛡️', text:"« Le <b>Brassard Gauche</b> est pris dans les glaces », annonce Alaric. « C'est la pièce de l'<b>Égide</b>, le bouclier de l'esprit. Pour la libérer, redonne à chaque nombre sa place exacte. Le signe d'abord. Toujours le signe d'abord. »" },
  ]},
  cm1:   { id:'col_c_cm1', title:'La Citadelle Algébrique', crystal:'le Brassard Droit', pages:[
   { emoji:'🏰', text:"La <b>Citadelle Algébrique</b> se dresse, intacte en apparence. Mais à l'intérieur, ses gardiens de pierre sont devenus fous : ils ont oublié ce que valent leurs propres lettres. x, y… des inconnues, partout, qui hurlent qu'on les résolve." },
   { emoji:'✊', text:"« Le <b>Brassard Droit</b> est enfermé dans la salle du trésor », murmure Alaric. « C'est la pièce de la <b>Frappe</b> : la puissance pure du raisonnement. Les gardiens ne s'inclinent que devant celui qui réduit, développe et résout sans trembler. »" },
  ]},
  cm2:   { id:'col_c_cm2', title:'Les Gorges de Pythagore', crystal:'la Cuirasse', pages:[
   { emoji:'📐', text:"Dans les <b>Gorges de Pythagore</b>, la lave a tout déformé. Les distances mentent, les angles trichent, les ponts s'effondrent sous ceux qui les mesurent mal. Une seule loi tient encore debout : celle du triangle rectangle." },
   { emoji:'☀️', text:"« La <b>Cuirasse</b> est au cœur du volcan », dit Alaric, et sa voix tremble un peu. « C'est la pièce maîtresse : le <b>Cœur d'Or</b>, la vitalité même de l'Armure. Hypoténuse, carrés, racines… prouve chaque pas, ou les gorges te dévoreront. »" },
  ]},
  final: { id:'col_c_final', title:'L\'Observatoire des Fonctions', crystal:'le Heaume', pages:[
   { emoji:'🔭', text:"Au sommet du monde, l'<b>Observatoire des Fonctions</b> scrute un ciel presque éteint. Ici, chaque courbe racontait l'avenir d'une étoile. Léthéas a déchiré les graphiques — les images ont perdu leurs antécédents, les droites leur pente." },
   { emoji:'👁️', text:"« Le <b>Heaume</b> t'attend là-haut », dit Alaric. « C'est la pièce de la <b>Clairvoyance</b> : porter ce casque, c'est lire les attaques avant qu'elles ne frappent. Lis les courbes, {hero}. Elles disent toujours la vérité à qui sait les interroger. »" },
   { emoji:'🌑', text:"Au loin, par-delà l'Observatoire, une île noire fume à l'horizon. L'<b>Antre du Titan</b>. Alaric la fixe longuement, sans un mot. Tu comprends que la fin approche." },
  ]},
  titan: { id:'col_c_titan', title:'L\'Antre du Titan', crystal:'', pages:[
   { emoji:'⚒️', text:"L'Armure Solaire est complète. Alors, dans la forge d'Alaric, un phénomène que nul n'avait revu depuis cent ans : les six pièces se mettent à chanter. Et de leur lumière unie naît une lame. La <b>Lame d'Aurore</b>." },
   { emoji:'⚔️', text:"« Elle ne coupe pas la chair », dit Alaric en te la tendant. « Elle tranche l'oubli. » Puis il pose la main sur ton épaule, et pour la première fois, son regard fuit : « {hero}… quand tu verras le Titan, regarde son visage. Promets-le-moi. »" },
   { emoji:'🌋', text:"L'<b>Antre du Titan</b> t'attend : un seuil de cendres, une galerie d'étoiles mortes, et tout au fond, un trône. Ta puissance est à son paroxysme. La dernière marche commence." },
  ]},
 },
 victories: {
  cp:  { id:'col_w_cp',  title:'La Jambière Gauche reforgée', crystal:'la Jambière Gauche', pages:[
   { emoji:'🦵', text:"Au dernier calcul juste, l'or s'embrase. La <b>Jambière Gauche</b> s'élève des docks, se reforge sous tes yeux et vient s'ajuster à ta jambe comme si elle t'avait toujours attendu. Le pouvoir d'<b>Aplomb</b> coule en toi : tes pas ne vacilleront plus." },
   { emoji:'⚓', text:"Au port, les virgules regagnent leur place et les balances disent à nouveau la vérité. « Une », compte Alaric dans la forge lointaine, et son marteau frappe l'enclume comme une cloche de fête." },
  ]},
  ce1: { id:'col_w_ce1', title:'La Jambière Droite reforgée', crystal:'la Jambière Droite', pages:[
   { emoji:'🦿', text:"La <b>Jambière Droite</b> jaillit des profondeurs dans une pluie d'étincelles. À l'instant où elle se verrouille, l'<b>Élan</b> t'envahit : tu sens que tu pourrais enchaîner mille calculs sans reprendre ton souffle." },
   { emoji:'🍰', text:"Dans les cavernes, les parts se rassemblent enfin : les fractions s'additionnent, se simplifient, s'accordent. L'art du partage est sauvé. « Deux », sourit Alaric. « Tu marches déjà comme un forgeron d'étoiles. »" },
  ]},
  ce2: { id:'col_w_ce2', title:'Le Brassard Gauche reforgé', crystal:'le Brassard Gauche', pages:[
   { emoji:'🛡️', text:"La glace cède. Le <b>Brassard Gauche</b> se libère et s'enroule autour de ton avant-bras, encore tiède de forge. L'<b>Égide</b> t'enveloppe : une assurance tranquille, le bouclier de ceux qui connaissent la règle des signes." },
   { emoji:'🌡️', text:"Sur le plateau, l'axe des nombres se redresse : les positifs à droite, les négatifs à gauche, le zéro en sentinelle. « Trois », dit Alaric. « La moitié du chemin. L'ombre de Léthéas recule — il l'a senti, crois-moi. »" },
  ]},
  cm1: { id:'col_w_cm1', title:'Le Brassard Droit reforgé', crystal:'le Brassard Droit', pages:[
   { emoji:'✊', text:"Les gardiens de pierre s'inclinent. Le <b>Brassard Droit</b> est à toi, et avec lui la <b>Frappe</b> : la puissance de celui qui résout. Tu serres le poing — l'or répond par un éclat bref, comme un salut." },
   { emoji:'🏰', text:"Dans la Citadelle, les inconnues retrouvent leurs valeurs et les équations s'équilibrent dans un grand soupir de soulagement. « Quatre », compte Alaric. « Les bras et les jambes. Reste le cœur… et la tête. »" },
  ]},
  cm2: { id:'col_w_cm2', title:'La Cuirasse reforgée', crystal:'la Cuirasse', pages:[
   { emoji:'☀️', text:"Le volcan rugit une dernière fois, puis s'apaise. La <b>Cuirasse</b> émerge de la lave, intacte, son soleil d'or rayonnant sur le plastron. Quand elle épouse ta poitrine, le <b>Cœur d'Or</b> bat avec le tien : une vitalité immense, ancienne, chaude." },
   { emoji:'📐', text:"Les gorges retrouvent leurs justes mesures : les distances disent vrai, les angles aussi. « Cinq », souffle Alaric — puis, plus bas, comme pour lui-même : « Il portait la même, autrefois… » Tu n'oses pas demander qui." },
  ]},
  final: { id:'col_w_final', title:'Le Heaume reforgé', crystal:'le Heaume', pages:[
   { emoji:'👁️', text:"Sous la coupole de l'Observatoire, le <b>Heaume</b> descend sur ta tête comme une couronne. La <b>Clairvoyance</b> s'ouvre en toi : les courbes te parlent, les attaques se lisent, l'avenir des étoiles redevient déchiffrable." },
   { emoji:'⚔️', text:"Six pièces. L'<b>Armure Solaire</b> est complète — et au loin, dans la forge, quelque chose s'éveille. Alaric lève son marteau : « Viens, {hero}. Il est temps de forger la <b>Lame d'Aurore</b>. Et il est temps… que je te dise la vérité. »" },
  ]},
 },
 epilogue: { id:'col_epilogue', title:'Le Frère de Forge', pages:[
  { emoji:'🌑', text:"La Lame d'Aurore traverse l'ombre — et le Titan tombe à genoux. Tu t'avances pour le coup final… puis tu te souviens de la promesse. Tu regardes son visage. Et sous la cendre, tu vois : des yeux d'or. Les mêmes que ceux d'Alaric." },
  { emoji:'⚒️', text:"« Son nom était <b>Théos</b> », dit une voix derrière toi. Alaric est là, son marteau à la main, les larmes aux yeux. « Mon frère de forge. Le plus doué de nous deux. Il a voulu forger une étoile à lui seul… et l'étoile l'a dévoré. L'oubli a pris le reste. »" },
  { emoji:'💛', text:"Alors tu comprends pourquoi la Lame ne coupe pas la chair. Tu la poses sur l'épaule du Titan — et elle tranche l'oubli. La cendre s'effrite. Les souvenirs reviennent un à un : la forge, les rires, les théorèmes appris ensemble. « Alaric… ? » murmure Théos." },
  { emoji:'🌟', text:"Cette nuit-là, au-dessus de {kingdom}, les étoiles se rallument toutes en même temps — on dit que deux forgerons réconciliés frappaient l'enclume ensemble. Quant à toi, {hero}, ton nom est gravé dans l'or stellaire, sur la garde de la Lame d'Aurore : <b>premier Chevalier de l'Armure Solaire</b>. Félicitations." },
 ]},
};

// ═══════════════════════════════════════════════════════════════════════
// ─── Odyssée des MOTS — COLLÈGE : « La Bibliothèque infinie » (v10.13.0) ──
// Dystopie : le Chancelier Suprême Ulrich Morne a réduit la langue de
// Monotonia à quelques mots dociles. {hero}, alias « le Porteur de Mots »,
// découvre une bibliothèque infinie ; chaque îlot est un livre-monde dont la
// conquête rend un pouvoir — puis un livre lisible rejoint sa bibliothèque.
// Voix : épopée lyrique (général) · sobriété glaçante (Monotonia) · romanesque
// (plongées) · ironie légère (Morne). Routage 'colfr' (cf. startAdventure).
// ═══════════════════════════════════════════════════════════════════════
const _COL_VILLAIN_FR = 'le Chancelier Suprême Ulrich Morne';
const _COL_KINGDOM_FR = 'Monotonia';
const _COLFR_ZONE_LABELS = {
 // 6e — Livre I : Le Français des Origines
 col_cp_1:'Le Fleuve des Langues', col_cp_2:'Les Ruines Latines', col_cp_3:'Le Bois Gaulois', col_cp_4:'Le Cloître des Moines', col_cp_5:'La Source du Verbe',
 // 5e — Livre II : Le Trésor des Mots
 col_ce1_1:'La Caverne aux Mille Reflets', col_ce1_2:'Le Verger des Familles', col_ce1_3:'Le Marché des Synonymes', col_ce1_4:'La Galerie des Registres', col_ce1_5:'Le Prisme du Sens',
 // 4e — Livre III : L'Art de Convaincre
 col_ce2_1:"L'Agora", col_ce2_2:'La Tribune des Orateurs', col_ce2_3:"L'Amphithéâtre", col_ce2_4:'Le Forum du Débat', col_ce2_5:'La Flamme de Cicéron',
 // 4e/3e — Livre IV : Les Mécaniques du Verbe
 col_cm1_1:"La Cité-Horlogerie", col_cm1_2:'Les Grands Engrenages', col_cm1_3:'La Salle des Temps', col_cm1_4:'Le Pont des Subordonnées', col_cm1_5:'Le Cœur de la Machine',
 // 3e — Livre V : Le Miroir des Genres
 col_cm2_1:'Le Théâtre-Monde', col_cm2_2:'La Galerie des Masques', col_cm2_3:'La Scène aux Mille Voix', col_cm2_4:'Le Cabinet des Miroirs', col_cm2_5:"L'Étoile des Genres",
 // 3e — Livre VI : Le Réveil (le soulèvement)
 col_final_1:'Les Faubourgs Gris', col_final_2:'La Place du Silence', col_final_3:'Les Toits de Monotonia', col_final_4:'La Grande Tribune', col_final_5:"L'Aube du Verbe",
 // Antre du Chancelier
 col_titan_1:'Le Palais de Cendre', col_titan_2:'La Galerie des Mots Morts', col_titan_3:'Le Trône du Chancelier',
};
const COL_ZONES_FR = (typeof COL_ZONES!=='undefined' ? COL_ZONES : []).map(z => Object.assign({}, z, { id:'colfr_'+z.id, label: _COLFR_ZONE_LABELS[z.id] || z.label }));
const _COL_REGIONS_FR = [
 { id:'cp',    label:'Livre I — Le Français des Origines', levels:['6E'],     shape:'colline' },
 { id:'ce1',   label:'Livre II — Le Trésor des Mots',      levels:['5E'],     shape:'feuille' },
 { id:'ce2',   label:"Livre III — L'Art de Convaincre",    levels:['4E'],     shape:'dune' },
 { id:'cm1',   label:'Livre IV — Les Mécaniques du Verbe', levels:['4E'],     shape:'citadelle' },
 { id:'cm2',   label:'Livre V — Le Miroir des Genres',     levels:['3E'],     shape:'nebuleuse' },
 { id:'final', label:'Livre VI — Le Réveil',               levels:['3E'],     shape:'mandala' },
 { id:'titan', label:'L\'Antre du Chancelier',             levels:['3E'],     shape:'citadelle' },
];
const _COL_STORY_FR = {
 intro: { id:'colfr_intro', title:'La Bibliothèque infinie', pages:[
  { emoji:'🏙️', text:"Il fut un temps, dit-on, où les hommes de ce pays possédaient autant de mots qu'il y a d'étoiles. Puis vint <b>{villain}</b>, et il fit de la langue un désert. Aujourd'hui, à <b>Monotonia</b>, on n'enseigne plus qu'une poignée de mots dociles." },
  { emoji:'🌫️', text:"La ville est grise — d'un gris décrété, administratif, définitif. Les gens se croisent sans se parler : il ne reste plus grand-chose à dire. Car {villain} l'a compris — sans mot, pas d'idée ; sans nuance, pas de désaccord ; sans passé, pas d'« avant »." },
  { emoji:'😐', text:"« À quoi bon mille mots, répète le Chancelier dans son infinie sollicitude, quand un seul suffit à obéir ? » On l'applaudit beaucoup — du reste, <i>applaudir</i> et <i>approuver</i> se disent désormais d'un même mot, ce qui simplifie la vie publique." },
  { emoji:'🧱', text:"Toi, {hero}, tu t'ennuies au collège, où l'on récite les rares mots permis. Un matin, au fond du préau désert, ton coude heurte une dalle disjointe. Un déclic sec. Et le mur, lentement, s'ouvre." },
  { emoji:'📚', text:"Derrière : un escalier, puis une salle sans fin — des rayonnages qui montent jusqu'à des cieux de parchemin. Une <b>bibliothèque infinie</b>, oubliée de tous. « Bienvenue », murmure un vieil homme surgi de l'ombre. « Je suis le <b>Bibliothécaire</b>. Je t'attendais. »" },
  { emoji:'🗝️', text:"« Chaque livre est un monde, dit-il. Plonge dedans, traverse ses épreuves, et tu en rapporteras un <b>pouvoir</b> — un morceau de la langue volée. Quand tu les auras tous, tu pourras réveiller Monotonia. On t'appellera le <b>Porteur de Mots</b>. Commence par le premier tome : <i>Le Français des Origines</i>. »" },
 ]},
 chapters: {
  cp:    { id:'colfr_c_cp',  title:'Livre I — Le Français des Origines', crystal:"le pouvoir d'Étymologie", pages:[
   { emoji:'🌊', text:"À peine as-tu posé la main sur la page que le sol se dérobe : te voici au bord d'un <b>fleuve des langues</b>, sous un ciel de parchemin. De l'autre rive montent des voix anciennes — du latin, du grec, des mots qui résonnent en toi comme un souvenir." },
   { emoji:'🗝️', text:"« Ce livre garde l'<b>origine des mots</b>, souffle le Bibliothécaire. Son gardien est <b>l'Oubli</b>, une brume qui efface les racines. Rends à chaque mot sa source, et tu gagneras l'<b>Étymologie</b> : le pouvoir de lire, sous chaque mot, les siècles qui l'ont façonné. »" },
  ]},
  ce1:   { id:'colfr_c_ce1', title:'Livre II — Le Trésor des Mots', crystal:'le pouvoir de Nuance', pages:[
   { emoji:'💎', text:"Le deuxième tome t'engloutit dans une <b>caverne aux mille reflets</b>, où chaque mot scintille d'une lueur différente. Ici dorment les familles, les synonymes, les registres — toute la richesse que Monotonia a perdue." },
   { emoji:'🌑', text:"Son gardien est <b>la Platitude</b>, une créature qui aplatit tout en un seul mot terne. « Apprends à distinguer la lueur exacte d'un mot, dit le Bibliothécaire, et tu gagneras la <b>Nuance</b> : le pouvoir de préciser, et donc de contredire. »" },
  ]},
  ce2:   { id:'colfr_c_ce2', title:"Livre III — L'Art de Convaincre", crystal:"le pouvoir d'Éloquence", pages:[
   { emoji:'🏛️', text:"Le troisième livre t'ouvre une <b>agora antique</b> baignée de soleil, où des foules écoutent, debout, des orateurs enflammés. C'est ici qu'on apprend à transformer un récit en argument, et un argument en flamme." },
   { emoji:'🎭', text:"Son gardien est <b>le Sophiste</b>, un beau parleur qui plie la vérité à son gré. « Distingue convaincre de manipuler, prévient le Bibliothécaire, et tu gagneras l'<b>Éloquence</b> : le pouvoir d'émouvoir et de rallier une foule. »" },
  ]},
  cm1:   { id:'colfr_c_cm1', title:'Livre IV — Les Mécaniques du Verbe', crystal:'le pouvoir de Précision', pages:[
   { emoji:'⚙️', text:"Le quatrième tome te précipite dans une <b>cité-horlogerie</b> aux engrenages géants, où chaque rouage est une fonction de la phrase : sujet, verbe, complément, subordonnée. Tout s'emboîte, ou tout se grippe." },
   { emoji:'🔧', text:"Son gardien est <b>le Solécisme</b>, un monstre fait de phrases brisées et de temps mal accordés. « Règle chaque rouage, dit le Bibliothécaire, et tu gagneras la <b>Précision</b> : le pouvoir d'énoncer sans la moindre faille. »" },
  ]},
  cm2:   { id:'colfr_c_cm2', title:'Livre V — Le Miroir des Genres', crystal:"le pouvoir d'Imaginaire", pages:[
   { emoji:'🪞', text:"Le cinquième livre t'entraîne dans un <b>théâtre-monde</b>, une galerie de miroirs où vivent tous les genres : le conte et le merveilleux, la poésie, la tragédie, le roman, la littérature qui s'engage." },
   { emoji:'👻', text:"Son gardien est <b>le Spectre des Lieux communs</b>, qui n'a plus que des phrases mortes et rebattues à la bouche. « Ranime l'invention, dit le Bibliothécaire, et tu gagneras l'<b>Imaginaire</b> : le pouvoir de faire rêver, d'émouvoir, de créer. »" },
  ]},
  final: { id:'colfr_c_final', title:'Livre VI — Le Réveil', crystal:'le pouvoir du Verbe libre', pages:[
   { emoji:'✊', text:"Tu as tous les pouvoirs. Le dernier livre, lui, ne t'emporte nulle part : il te ramène <b>chez toi</b>, dans les faubourgs gris de Monotonia. Car le moment est venu de rendre au peuple les mots qu'on lui a volés." },
   { emoji:'🤫', text:"« Tu n'es pas seul, dit le Bibliothécaire. Dans l'ombre survivent les <b>Murmureurs</b>, ceux qui se transmettent en secret les mots interdits. Rassemble-les. Monte à la <b>Grande Tribune</b>. Et prononce les mots qui réveillent. » Au loin veillent les <b>Censeurs</b> du Chancelier." },
  ]},
  titan: { id:'colfr_c_titan', title:"L'Antre du Chancelier", crystal:'', pages:[
   { emoji:'🏯', text:"La foule réveillée gronde derrière toi. Il ne reste qu'un seuil à franchir : le <b>Palais de Cendre</b>, où trône {villain}, seul gardien des derniers grands mots du pays." },
   { emoji:'🌑', text:"Tu remontes la <b>galerie des mots morts</b> — tous les mots qu'il a fait taire, alignés comme des stèles. Au bout, un trône, et un homme petit, gris, qui t'attend en souriant à peine. La dernière joute commence : non pas d'épée, mais de <b>verbe</b>." },
  ]},
 },
 victories: {
  cp:  { id:'colfr_w_cp',  title:'Pouvoir gagné : l\'Étymologie', crystal:"l'Étymologie", pages:[
   { emoji:'🗝️', text:"À mesure que tu rends aux mots leurs racines — latines, grecques, gauloises, franques —, l'<b>Oubli</b> se dissipe comme une brume au soleil. Une clé d'or t'apparaît : tu tiens l'<b>Étymologie</b>." },
   { emoji:'📕', text:"Le tome se referme et rejoint ta <b>bibliothèque</b> : désormais, tu peux relire <i>Le Français des Origines</i> page à page. « Premier pouvoir reconquis, sourit le Bibliothécaire. Monotonia vient de respirer un peu mieux, sans le savoir. »" },
  ]},
  ce1: { id:'colfr_w_ce1', title:'Pouvoir gagné : la Nuance', crystal:'la Nuance', pages:[
   { emoji:'💎', text:"Tu rends à chaque mot sa lueur exacte, jusqu'à ce que <b>la Platitude</b> n'ait plus rien à aplatir. Un prisme de lumière naît dans ta main : la <b>Nuance</b> est à toi." },
   { emoji:'📗', text:"<i>Le Trésor des Mots</i> rejoint ta bibliothèque. « Avec la nuance revient le <b>doute</b>, murmure le Bibliothécaire — et avec le doute, le droit de n'être pas d'accord. C'est exactement ce que le Chancelier craint le plus. »" },
  ]},
  ce2: { id:'colfr_w_ce2', title:"Pouvoir gagné : l'Éloquence", crystal:"l'Éloquence", pages:[
   { emoji:'🔥', text:"Tu démêles le vrai du beau parler, et <b>le Sophiste</b> s'effondre sous ses propres pièges. Une flamme calme se pose sur tes lèvres : tu possèdes l'<b>Éloquence</b>." },
   { emoji:'📙', text:"<i>L'Art de Convaincre</i> rejoint ta bibliothèque. « Te voilà capable de rallier une foule, dit le Bibliothécaire, gravement. Garde ce pouvoir pur : l'éloquence sert la vérité, jamais le mensonge. »" },
  ]},
  cm1: { id:'colfr_w_cm1', title:'Pouvoir gagné : la Précision', crystal:'la Précision', pages:[
   { emoji:'⚙️', text:"Tu remets chaque rouage à sa place — accords, temps, subordonnées — et <b>le Solécisme</b> se disloque dans un grincement. Une plume d'acier se forme : la <b>Précision</b> est tienne." },
   { emoji:'📘', text:"<i>Les Mécaniques du Verbe</i> rejoint ta bibliothèque. « Une phrase juste est une arme que nul ne peut retourner contre toi, dit le Bibliothécaire. Le Chancelier déteste les phrases qu'il ne peut pas tordre. »" },
  ]},
  cm2: { id:'colfr_w_cm2', title:"Pouvoir gagné : l'Imaginaire", crystal:"l'Imaginaire", pages:[
   { emoji:'⭐', text:"Tu chasses les phrases mortes et ranimes l'invention, jusqu'à ce que <b>le Spectre des Lieux communs</b> se dissolve dans un dernier cliché. Une étoile se lève en toi : l'<b>Imaginaire</b>." },
   { emoji:'📓', text:"<i>Le Miroir des Genres</i> rejoint ta bibliothèque. « Cinq pouvoirs, dit le Bibliothécaire, et sa voix tremble. Il ne te manque plus que le dernier — celui que l'on ne reçoit pas d'un livre, mais que l'on prend soi-même. Rentre à Monotonia, {hero}. Il est temps. »" },
  ]},
  final: { id:'colfr_w_final', title:'Pouvoir gagné : le Verbe libre', crystal:'le Verbe libre', pages:[
   { emoji:'🌅', text:"Du haut de la <b>Grande Tribune</b>, tu parles. Les mots reconquis — <i>liberté, injustice, ensemble, demain</i> — tombent sur la foule grise comme une pluie sur une terre sèche. Et la foule, pour la première fois, <b>comprend</b>." },
   { emoji:'✊', text:"Un murmure, puis une clameur : Monotonia se réveille. Tu sens naître en toi le dernier pouvoir, le plus grand — le <b>Verbe libre</b>, celui qui soulève les peuples. Les Murmureurs sortent de l'ombre. La révolution est en marche." },
  ]},
 },
 epilogue: { id:'colfr_epilogue', title:'Le Réveil de Sémantia', pages:[
  { emoji:'🌑', text:"Au sommet du Palais de Cendre, {villain} t'attend. Il lance son dernier sort : un grand charabia où plus personne ne se comprend. Mais tu prononces, justes et vrais, les mots qu'il croyait morts — et chacun déchire son brouillard." },
  { emoji:'💬', text:"« Pourquoi ? lui demandes-tu. Pourquoi avoir volé les mots ? » Il te regarde, et pour la première fois, son sourire d'ironie se fissure : « Parce qu'un peuple qui sait nommer sa peine… finit toujours par exiger qu'on y mette fin. »" },
  { emoji:'⚖️', text:"Alors la foule, en bas, scande des mots qu'elle vient de réapprendre. Le Chancelier comprend qu'aucun mur ne tient contre une langue rendue au peuple. Son trône de cendre s'effondre. {villain} tombe — vaincu non par la force, mais par le <b>sens</b>." },
  { emoji:'🌅', text:"À l'aube, on demande à {hero}, le <b>Porteur de Mots</b>, de gouverner. Tu acceptes — à une condition : que jamais plus on ne touche aux mots du peuple. On rouvre les écoles, les bibliothèques, les théâtres." },
  { emoji:'📖', text:"Et d'une seule voix, sous les acclamations, le pays se choisit un nom nouveau, à la mesure de sa parole retrouvée : <b>Sémantia</b>, le pays du sens. Le vieux Bibliothécaire essuie une larme : « Il restait une ville où l'on croyait que comprendre est ce qu'il y a de plus précieux. C'était toi. »" },
 ]},
 // Livre VI lisible — le récit romancé du Réveil, débloqué après l'épilogue.
 bookTale: { id:'colfr_booktale', title:'Le Livre du Réveil', pages:[
  { emoji:'🕯️', text:"Longtemps après, on écrivit ce livre pour que nul n'oubliât comment Sémantia retrouva la parole. Il commence par une nuit grise, la dernière de Monotonia, et par un enfant qui ne savait pas encore qu'il était un héros." },
  { emoji:'📚', text:"Le Porteur de Mots avait conquis les cinq livres-mondes : l'Étymologie, la Nuance, l'Éloquence, la Précision, l'Imaginaire. Cinq pouvoirs, cinq fragments de la langue volée. Mais le sixième ne dormait dans aucun livre : il dormait dans le <b>peuple</b>." },
  { emoji:'🤫', text:"Une nuit, par les caves et les toits, il rassembla les <b>Murmureurs</b> — couturières, vieux maîtres, enfants têtus — tous ceux qui avaient gardé en secret quelques mots interdits, comme on garde des braises sous la cendre." },
  { emoji:'📜', text:"À l'aube, il monta à la <b>Grande Tribune</b>, là où le Chancelier ne laissait dire qu'un mot par jour. Et il prononça le <b>grand discours</b> : non un discours de haine, mais de mots simples, rendus un à un à ceux qui les avaient perdus." },
  { emoji:'🗣️', text:"« On vous a dit que vous étiez <i>contents</i>. Mais pour dire la <i>joie</i>, la <i>colère</i>, l'<i>espoir</i>, il vous manquait les mots — et sans les mots, vous ne pouviez même pas savoir ce qui vous manquait. On ne vous a pas seulement réduits au silence : on vous a réduits à l'<b>aveuglement</b>. »" },
  { emoji:'🌊', text:"Un frisson parcourut la foule grise. Des hommes pleuraient sans savoir nommer pourquoi — puis le mot leur revenait : <i>injustice</i>. Et avec le mot, la colère ; et avec la colère, le courage." },
  { emoji:'🔥', text:"Les <b>Censeurs</b> chargèrent pour faire taire la Tribune. Mais comment fait-on taire dix mille bouches qui viennent de retrouver la parole ? Chaque mot rendu était un pavé ; chaque phrase, une barricade." },
  { emoji:'⚔️', text:"Ce ne fut pas une bataille d'épées. Ce fut une bataille de <b>voix</b>. Là où passait le Porteur de Mots, les murs d'affiches à un seul mot tombaient, et les gens recommençaient à se parler, à se nommer, à se reconnaître." },
  { emoji:'🏯', text:"Au cœur du Palais de Cendre, le Chancelier comprit qu'il avait perdu. Il avait cru qu'en ôtant les mots, il ôtait les idées. Il découvrait, trop tard, qu'une idée rendue à un seul homme contamine aussitôt tous les autres." },
  { emoji:'🌅', text:"Quand le tyran tomba, on ne le mit pas à mort : on lui rendit, lui aussi, les mots qu'il avait perdus en chemin — et l'on dit qu'il prononça enfin, en pleurant, ceux qu'il refusait depuis l'enfance : « <b>J'avais peur.</b> »" },
  { emoji:'🕊️', text:"Le pays se choisit un nom : <b>Sémantia</b>. On grava au fronton de la bibliothèque enfin rouverte une phrase que les écoliers récitent encore : « <i>Un peuple qui possède ses mots possède son destin.</i> »" },
  { emoji:'💛', text:"Et toi qui lis ces lignes : souviens-toi que ce livre, comme les cinq autres, faillit disparaître à jamais. Les mots ne sont pas un décor. Ce sont des outils, des armes, des ponts. Garde-les vivants, et nul Chancelier ne te réduira jamais au silence." },
 ]},
};

// ── Livres lisibles de la Bibliothèque infinie ──────────────────────────
// Seul le Livre I a son contenu rédigé/vérifié (v10.13.0). Les tomes II→V
// seront rédigés et vérifiés un par un (ready:false → « bientôt »). Le Livre
// VI lisible = le récit romancé _COL_STORY_FR.bookTale (débloqué à l'épilogue).
const _COL_BOOKS_FR = [
 { roman:'I',   short:'Origines',   region:'cp',    accent:'#9E4326', accent2:'#C2603A', dark:'#5a2718', title:'Le Français des Origines', power:"l'Étymologie",  ready:true, pages: _colBook1Pages() },
 { roman:'II',  short:'Trésor',     region:'ce1',   accent:'#1D6E56', accent2:'#1D9E75', dark:'#134a3a', title:'Le Trésor des Mots',       power:'la Nuance',      ready:true, pages: _colBook2Pages() },
 { roman:'III', short:'Convaincre', region:'ce2',   accent:'#854F0B', accent2:'#BA7517', dark:'#5a350a', title:"L'Art de Convaincre",      power:"l'Éloquence",   ready:true, pages: _colBook3Pages() },
 { roman:'IV',  short:'Mécaniques', region:'cm1',   accent:'#0C447C', accent2:'#185FA5', dark:'#082f56', title:'Les Mécaniques du Verbe',  power:'la Précision',  ready:true, pages: _colBook4Pages() },
 { roman:'V',   short:'Genres',     region:'cm2',   accent:'#3C3489', accent2:'#534AB7', dark:'#2a2456', title:'Le Miroir des Genres',     power:"l'Imaginaire",  ready:true, pages: _colBook5Pages() },
 { roman:'VI',  short:'Réveil',     region:'final', accent:'#7A2A1E', accent2:'#A33D2D', dark:'#511a12', title:'Le Livre du Réveil',       power:'le Verbe libre', ready:true, bookTale:true },
 { roman:'',    short:'Bonus',      region:'titan', accent:'#34333c', accent2:'#4a4856', dark:'#232228', gold:'#cdcdd6', title:"L'Antre du Chancelier", power:'', ready:true, bonus:true, pages: _colBook7Pages() },
];
function _colBook1Pages(){
 const I_KEY = '<svg viewBox="0 0 120 90" width="100%"><circle cx="60" cy="34" r="9" fill="none" stroke="#C79A3A" stroke-width="3"/><circle cx="60" cy="34" r="3" fill="#C79A3A"/><line x1="60" y1="43" x2="60" y2="62" stroke="#C79A3A" stroke-width="3.5" stroke-linecap="round"/><path d="M60 62 C52 68 49 72 44 78" fill="none" stroke="#C79A3A" stroke-width="2.4" stroke-linecap="round"/><path d="M60 62 C68 68 71 72 76 78" fill="none" stroke="#C79A3A" stroke-width="2.4" stroke-linecap="round"/><path d="M60 62 C56 70 54 74 51 80" fill="none" stroke="#C79A3A" stroke-width="2" stroke-linecap="round"/><path d="M60 62 C64 70 66 74 69 80" fill="none" stroke="#C79A3A" stroke-width="2" stroke-linecap="round"/></svg>';
 const XVXX = '<svg viewBox="0 0 130 70" width="100%"><rect x="20" y="14" width="90" height="44" rx="3" fill="#E7D7AE" stroke="#B79A63" stroke-width="1.5"/><text x="65" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#7A2A1E">XV-XX</text></svg>';
 const PARCH = '<svg viewBox="0 0 160 96" width="100%"><rect x="22" y="10" width="116" height="76" rx="3" fill="#EFE2BE" stroke="#B79A63" stroke-width="1.5"/><g stroke="#B79A63" stroke-width="0.8"><line x1="34" y1="26" x2="126" y2="26"/><line x1="34" y1="36" x2="118" y2="36"/><line x1="34" y1="46" x2="126" y2="46"/><line x1="34" y1="56" x2="110" y2="56"/></g><circle cx="50" cy="74" r="9" fill="#A33D2D" stroke="#7A2A1E" stroke-width="1.5"/><circle cx="110" cy="74" r="9" fill="#7A6BB0" stroke="#534AB7" stroke-width="1.5"/></svg>';
 const CIRC = '<svg viewBox="0 0 150 70" width="100%"><text x="75" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#3A2A18">for<tspan fill="#9E4326">ê</tspan>t</text><text x="92" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#B79A63" font-style="italic">s</text></svg>';
 return [
  { chap:'Frontispice', illus:I_KEY, cap:'La clé-racine — le pouvoir d\'Étymologie.', html:"<p><i>Tout mot que tu prononces a vécu mille ans avant toi.</i></p><p>Ce livre raconte d'où vient le français, comme un voyage. Tu remonteras le cours du temps jusqu'aux sources de ta langue, et tu apprendras à lire, derrière chaque mot, les siècles qui l'ont façonné.</p>" },
  { chap:'I — Les racines latines', html:"<p>Avant le français, il y eut le <b>gaulois</b>, langue d'un peuple celte qui ne savait pas écrire son histoire. Une centaine de mots seulement nous en restent, presque tous nés de la terre et des bois : <i>chêne, bouleau, alouette, mouton, ruche, charrue, chemin, lieue</i>. Quand tu marches dans la campagne, tu parles encore la langue des druides.</p>" },
  { chap:'I — Les racines latines', illus:XVXX, cap:'Les Quinze-Vingts : 15 × 20 = 300.', html:"<p>Les Gaulois comptaient <b>par vingt</b> — on pense que c'est d'eux que vient notre <i>quatre-vingts</i>, « quatre fois vingt ». À Paris, l'hôpital des <b>Quinze-Vingts</b> garde la trace de cet usage : fondé pour trois cents aveugles, soit <i>quinze fois vingt</i>.</p>" },
  { chap:'I — Les racines latines', html:"<p>Puis vinrent les légions de Rome, et avec elles le <b>latin</b> — non le latin des poètes, mais celui, vivant et déformé, des soldats et des marchands. C'est de cette langue parlée qu'est né le français : une <b>langue romane</b>, « issue de Rome », sœur de l'espagnol et de l'italien.</p><p>Les mots s'usaient à l'oreille comme des galets : <i>caballus</i> devint <i>cheval</i>, <i>schola</i> devint <i>école</i>.</p>" },
  { chap:'I — Les racines latines', html:"<p><b>L'anecdote du sel.</b> Le mot <b>salaire</b> vient du latin <i>salarium</i>, qui contient <i>sal</i> : le sel. On raconte depuis l'Antiquité que les soldats romains étaient payés en sel. La vérité est plus prudente : les historiens doutent aujourd'hui de cette jolie légende. Retiens la leçon — une étymologie séduisante n'est pas toujours vraie.</p>" },
  { chap:'II — L\'héritage grec', html:"<p>Si le latin est la mère du français, le <b>grec</b> en est le parrain savant. Il nous a donné les mots du savoir — <i>philosophie</i> (« amour de la sagesse »), <i>démocratie</i> (« pouvoir du peuple »), <i>théâtre</i> — et des <b>briques</b> qu'on assemble : <i>télé-</i> (loin), <i>-phone</i> (la voix), <i>-graphe</i> (écrire), <i>bio-</i> (la vie).</p>" },
  { chap:'II — L\'héritage grec', html:"<p>Deux mots pour sourire. <b>Musée</b> vient des <b>Muses</b>, les neuf déesses des arts : un musée est un « temple des Muses ». Et <b>barbare</b> désignait, pour les Grecs, ceux qui ne parlaient pas leur langue : à leurs oreilles, ils semblaient dire « bar-bar-bar » ! Un mot peut naître d'une moquerie.</p>" },
  { chap:'III — Le Moyen Âge', html:"<p>Au Moyen Âge, les <b>Francs</b>, guerriers germaniques, donnèrent leur nom à la <b>France</b>. Ils ne remplacèrent pas le latin : ils le colorèrent. On leur doit les mots de la guerre (<i>guerre, heaume, maréchal</i>), des couleurs (<i>bleu, blanc, gris, blond</i>) et le mot <i>jardin</i>. On dit que le français est <b>la plus germanique des langues romanes</b>.</p>" },
  { chap:'III — Le Moyen Âge', illus:PARCH, cap:'Les Serments de Strasbourg, scellés des deux frères.', html:"<p><b>Le plus vieux français du monde.</b> En <b>842</b>, deux petits-fils de Charlemagne se jurèrent alliance à Strasbourg, chacun dans la langue de l'autre. Ces <b>Serments de Strasbourg</b>, recopiés par l'historien Nithard, sont le plus ancien texte conservé dans la langue qui allait devenir le français.</p>" },
  { chap:'IV — Le français moderne', html:"<p><b>Le jour où le français devint roi.</b> En <b>1539</b>, <b>François Ier</b> signa l'ordonnance de <b>Villers-Cotterêts</b> : désormais, la justice et l'administration se feraient en français, et non plus en latin. La même loi créa les registres de baptême, ancêtres de l'état civil. C'est le plus ancien texte de loi français encore en partie en vigueur.</p>" },
  { chap:'IV — Le français moderne', html:"<p>En <b>1549</b>, le poète <b>Joachim du Bellay</b> et ses amis de la <b>Pléiade</b> proclamèrent, dans un texte au titre flamboyant, que le français pouvait être aussi beau que le latin. En <b>1635</b>, Richelieu fonda l'<b>Académie française</b>. Au siècle des Lumières, le français rayonnait sur toute l'Europe cultivée.</p>" },
  { chap:'V — La langue vivante', illus:CIRC, cap:'L\'accent circonflexe : la pierre tombale d\'un « s ».', html:"<p>Une langue est un être vivant. <b>Le chapeau qui cache un fantôme :</b> l'accent circonflexe est, le plus souvent, la trace d'un <b>s disparu</b>. On écrivait jadis <i>forest, hospital, feste, isle, chasteau</i> — devenus <i>forêt, hôpital, fête, île, château</i>.</p>" },
  { chap:'V — La langue vivante', html:"<p><b>Le truc du détective :</b> pour débusquer ce <i>s</i> enfui, cherche un mot de la même famille — il l'a souvent gardé : <i>forêt → forestier</i>, <i>hôpital → hospitalier</i>, <i>fête → festin</i>. Et si tu connais l'anglais, observe : <i>forest, hospital, feast</i> ont gardé le <i>s</i> d'avant.</p>" },
  { chap:'V — Clôture', illus:I_KEY, cap:'Premier pouvoir reconquis.', html:"<p>Te voici au bout du premier livre. Ta langue est l'héritage de Gaulois et de Romains, de Grecs savants et de Francs guerriers, de rois et de poètes — un trésor que mille générations t'ont transmis. {villain} voudrait te faire croire que les mots ne servent qu'à obéir. Mais tu sais, désormais, qu'ils portent toute l'histoire des hommes.</p>" },
 ];
}

function _colBook2Pages(){
 const PRISME='<svg viewBox="0 0 150 80" width="100%"><polygon points="60,16 88,64 32,64" fill="none" stroke="#1D9E75" stroke-width="2"/><line x1="10" y1="40" x2="48" y2="40" stroke="#cfcabf" stroke-width="2"/><line x1="72" y1="46" x2="120" y2="26" stroke="#e74c3c" stroke-width="2"/><line x1="74" y1="50" x2="122" y2="44" stroke="#f1c40f" stroke-width="2"/><line x1="74" y1="54" x2="120" y2="62" stroke="#1D9E75" stroke-width="2"/><line x1="73" y1="58" x2="118" y2="74" stroke="#3498db" stroke-width="2"/></svg>';
 const TREE='<svg viewBox="0 0 170 92" width="100%"><rect x="60" y="62" width="50" height="20" rx="3" fill="#1D6E56"/><text x="85" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#fff" font-weight="700">TERRE</text><g stroke="#1D9E75" stroke-width="1.5" fill="none"><path d="M70 62 C50 48 40 42 30 32"/><path d="M85 62 V30"/><path d="M100 62 C120 48 130 42 140 32"/></g><g font-family="Georgia,serif" font-size="9" fill="#185c46" text-anchor="middle"><text x="28" y="28">terrien</text><text x="85" y="24">atterrir</text><text x="142" y="28">souterrain</text></g></svg>';
 const STAIRS='<svg viewBox="0 0 170 86" width="100%"><rect x="14" y="58" width="46" height="20" fill="#cfe8dd"/><rect x="62" y="42" width="46" height="36" fill="#8fd3bd"/><rect x="110" y="26" width="46" height="52" fill="#1D9E75"/><g font-family="Georgia,serif" font-size="9" text-anchor="middle"><text x="37" y="71" fill="#185c46">bagnole</text><text x="85" y="64" fill="#0d3a2c">voiture</text><text x="133" y="50" fill="#fff">automobile</text></g></svg>';
 const ANTO='<svg viewBox="0 0 160 80" width="100%"><rect x="26" y="30" width="30" height="36" rx="2" fill="#1D6E56"/><rect x="22" y="24" width="38" height="8" rx="2" fill="#155a44"/><text x="41" y="77" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#185c46">poubelle</text><rect x="96" y="34" width="40" height="10" rx="3" fill="#e7b96b"/><rect x="96" y="44" width="40" height="6" fill="#6fae5a"/><rect x="96" y="50" width="40" height="10" rx="3" fill="#e7b96b"/><text x="116" y="77" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#185c46">sandwich</text></svg>';
 return [
  { chap:'Frontispice', illus:PRISME, cap:'Le prisme — le pouvoir de Nuance.', html:"<p><i>Un seul mot peut renfermer mille reflets ; encore faut-il savoir le faire tourner dans la lumière.</i></p><p>Là où Monotonia n'a gardé qu'un mot par idée, ce livre en révèle des familles entières, des nuances infinies, des registres et des images. Apprends à choisir le mot exact, et tu tiendras la <b>Nuance</b> : le pouvoir de dire précisément — donc de penser librement.</p>" },
  { chap:'I — Les familles de mots', illus:TREE, cap:'Du radical « terre » naît toute une famille.', html:"<p>Les mots vivent en <b>familles</b>. Autour d'un même cœur — le <b>radical</b> — se rassemblent des frères et des cousins, façonnés par des <b>préfixes</b> (devant) et des <b>suffixes</b> (derrière). Du radical <i>terre</i> naissent <i>terrien, terrestre, atterrir, déterrer, souterrain, territoire</i>.</p>" },
  { chap:'I — Les familles de mots', html:"<p>Connaître la famille d'un mot, c'est en deviner le sens — et souvent l'orthographe. Tu hésites sur le <i>d</i> muet de <i>marchand</i> ? Le cousin <i>marchandise</i> le révèle. Tu doutes du <i>t</i> de <i>petit</i> ? <i>Petitesse</i> te répond. Un mot bien entouré ne se trompe jamais longtemps.</p>" },
  { chap:'II — Synonymes & nuances', html:"<p>On dit que les <b>synonymes</b> ont le même sens. C'est presque vrai — et c'est là tout l'art. Car il n'existe presque jamais de synonymes <b>parfaits</b> : chaque mot porte sa nuance, sa température, son ombre.</p><p>Entre <i>content</i>, <i>heureux</i>, <i>ravi</i> et <i>comblé</i>, il y a toute une montée de la joie. Entre <i>la peur</i>, <i>la crainte</i> et <i>la terreur</i>, toute une gradation. Choisir, c'est nuancer ; nuancer, c'est penser juste.</p>" },
  { chap:'II — Synonymes & nuances', html:"<p><b>Le saviez-vous ?</b> <i>Vélo</i> et <i>bicyclette</i> désignent le même objet, mais non tout à fait la même chose : l'un est vif et familier, l'autre plus ancien et soigné. Voilà pourquoi {villain} rêve d'une langue d'un seul mot par idée : qui n'a qu'un mot pour la joie ne distingue plus le plaisir du bonheur — et finit par ne plus très bien savoir ce qu'il ressent.</p>" },
  { chap:'III — Les registres de langue', illus:STAIRS, cap:'Trois marches pour un même objet.', html:"<p>Un même sens se dit de plusieurs façons, selon à qui l'on parle : ce sont les <b>registres</b>. Pour une voiture, le <b>familier</b> dit <i>bagnole</i>, le <b>courant</b> dit <i>voiture</i>, le <b>soutenu</b> dit <i>automobile</i>. Pour la mort : <i>clamser</i>, <i>mourir</i>, <i>décéder</i>, <i>trépasser</i>.</p>" },
  { chap:'III — Les registres de langue', html:"<p>Savoir changer de registre — comme on change de vêtement selon l'occasion — c'est être à l'aise partout : dans la cour de récréation comme devant un jury d'examen. Le registre n'est pas une prison : c'est une garde-robe.</p>" },
  { chap:'IV — Sens propre & sens figuré', html:"<p>Chaque mot a d'abord un <b>sens propre</b>, concret : le <i>pied</i>, c'est le bas de la jambe. Puis la langue, poète sans le savoir, lui invente un <b>sens figuré</b> : le <i>pied</i> de la montagne, le <i>pied</i> de la lampe, le <i>pied</i> d'un vers.</p><p>Notre parole est pleine de ces images endormies : on <i>dévore</i> un livre, on <i>brûle</i> d'impatience, on porte un <i>poids</i> sur le cœur. Comprendre le figuré, c'est entendre la poésie cachée dans les mots de tous les jours.</p>" },
  { chap:'V — Les figures de style', html:"<p>Quand on cultive ces images à dessein, on crée des <b>figures de style</b>. La <b>comparaison</b> rapproche à l'aide d'un outil (<i>fort comme un lion</i>) ; la <b>métaphore</b> ose sans outil (<i>cet homme est un lion</i>) ; la <b>personnification</b> prête la vie aux choses (<i>le vent murmure</i>) ; l'<b>hyperbole</b> exagère (<i>mourir de rire</i>) ; la <b>litote</b> en dit moins pour suggérer plus (<i>« Va, je ne te hais point »</i> pour dire « je t'aime »).</p>" },
  { chap:'V — Les figures de style', html:"<p><b>Une figure née d'un malentendu.</b> Le maréchal <b>Jacques de La Palice</b>, mort à Pavie en 1525, fut chanté par ses soldats : « S'il n'était mort, il ferait encore envie. » Or, à l'époque, le <i>s</i> long ressemblait à un <i>f</i> : on finit par lire « il <i>serait</i> encore en vie » ! De cette bévue naquit la <b>lapalissade</b> — ces vérités si évidentes qu'elles font sourire : « Un quart d'heure avant sa mort, il était encore en vie. »</p>" },
  { chap:'V — Les figures de style', illus:ANTO, cap:'Deux noms propres devenus communs.', html:"<p><b>Quand un nom propre devient commun :</b> c'est l'<b>antonomase</b>. Un préfet de Paris, <b>Eugène Poubelle</b>, imposa en 1884 des boîtes à ordures : on les baptisa de son nom. Un lord anglais, le <b>comte de Sandwich</b>, aimait manger sa viande entre deux tranches de pain sans quitter sa table de jeu : le <i>sandwich</i> était né. Même la <b>silhouette</b> doit son nom à un homme, le ministre Étienne de Silhouette.</p>" },
  { chap:'V — Clôture', illus:PRISME, cap:'Deuxième pouvoir reconquis.', html:"<p>Te voici au bout du deuxième tome. Tu sais désormais qu'un mot n'est jamais seul : il a une famille, des cousins plus précis, un registre, un double sens, et mille façons de briller. {villain} voudrait n'en garder qu'un par idée. Mais celui qui possède la <b>Nuance</b> possède le doute, la précision, et le droit de n'être pas tout à fait d'accord.</p>" },
 ];
}

function _colBook3Pages(){
 const FLAME='<svg viewBox="0 0 140 88" width="100%"><rect x="50" y="44" width="40" height="36" rx="3" fill="#854F0B"/><rect x="44" y="40" width="52" height="8" rx="2" fill="#6b3f08"/><path d="M70 38 C62 28 80 22 70 8 C84 16 82 30 70 38 Z" fill="#e08a1e" stroke="#BA7517" stroke-width="1.2"/><path d="M70 36 C66 30 75 26 70 18 C77 23 76 31 70 36 Z" fill="#f6cd6a"/></svg>';
 const TRI='<svg viewBox="0 0 160 92" width="100%"><polygon points="80,18 26,78 134,78" fill="none" stroke="#BA7517" stroke-width="2"/><text x="80" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">ethos</text><text x="22" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">logos</text><text x="138" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">pathos</text><text x="80" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#9a6a1a">persuasion</text></svg>';
 const SEA='<svg viewBox="0 0 160 82" width="100%"><rect x="0" y="50" width="160" height="32" fill="#cfe0e8"/><path d="M0 56 q20 -4 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#8fb0c0" stroke-width="1.4"/><path d="M0 66 q20 -4 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#8fb0c0" stroke-width="1.2"/><circle cx="58" cy="34" r="6" fill="#e0b88a"/><rect x="53" y="40" width="10" height="20" rx="3" fill="#854F0B"/><path d="M63 30 l8 -3 M63 33 l8 0 M63 36 l8 3" stroke="#9a6a1a" stroke-width="1" stroke-linecap="round"/><circle cx="68" cy="34" r="1.1" fill="#6b3f08"/></svg>';
 const BAL='<svg viewBox="0 0 150 86" width="100%"><line x1="75" y1="14" x2="75" y2="66" stroke="#854F0B" stroke-width="3"/><line x1="33" y1="26" x2="117" y2="26" stroke="#854F0B" stroke-width="3"/><rect x="60" y="66" width="30" height="8" rx="2" fill="#6b3f08"/><circle cx="33" cy="42" r="12" fill="none" stroke="#1D9E75" stroke-width="2"/><text x="33" y="47" text-anchor="middle" font-size="14" fill="#1D9E75">✓</text><circle cx="117" cy="42" r="12" fill="none" stroke="#c0392b" stroke-width="2"/><text x="117" y="47" text-anchor="middle" font-size="14" fill="#c0392b">✗</text></svg>';
 return [
  { chap:'Frontispice', illus:FLAME, cap:'La tribune et la flamme — le pouvoir d\'Éloquence.', html:"<p><i>Une idée juste mal défendue est une idée vaincue ; le vrai a besoin d'une voix.</i></p><p>Ce livre enseigne l'art le plus redoutable : convaincre. Non par la force, mais par la parole ordonnée. Apprends-en les règles, et tu tiendras l'<b>Éloquence</b> : le pouvoir d'émouvoir une foule et de la rallier à la vérité.</p>" },
  { chap:'I — Du récit à l\'argument', html:"<p>Raconter et convaincre sont deux arts voisins. Le récit montre ; l'<b>argument</b> démontre. Convaincre, c'est défendre une <b>thèse</b> — une idée que l'on tient pour vraie — à l'aide d'<b>arguments</b> (les raisons) et d'<b>exemples</b> (les preuves).</p><p>Un bon raisonnement avance comme un escalier : chaque marche, posée d'aplomb, porte la suivante jusqu'à la conclusion.</p>" },
  { chap:'II — Les trois leviers', illus:TRI, cap:'Aristote : convaincre repose sur trois appuis.', html:"<p>Le philosophe <b>Aristote</b>, il y a vingt-quatre siècles, observa qu'on persuade par trois leviers. L'<b>ethos</b> : la confiance qu'inspire celui qui parle. Le <b>pathos</b> : l'émotion qu'il éveille. Le <b>logos</b> : la force logique de ses raisons.</p><p>Un discours qui n'a que le pathos flatte ; qui n'a que le logos ennuie. Le grand orateur, lui, tient les trois en équilibre.</p>" },
  { chap:'III — La rhétorique antique', illus:SEA, cap:'Démosthène s\'exerçant face à la mer.', html:"<p>Dans la Grèce antique, sur l'<b>agora</b>, savoir parler décidait du sort des cités. Le plus célèbre des orateurs, <b>Démosthène</b> (384-322 av. J.-C.), était, dit-on, gêné par un défaut d'élocution.</p><p>Selon Plutarque, il s'entraîna en parlant la bouche pleine de <b>galets</b>, et en couvrant de sa voix le fracas des vagues. L'anecdote est aujourd'hui discutée par les historiens — mais elle dit une vérité : l'éloquence se conquiert par le travail.</p>" },
  { chap:'III — La rhétorique antique', html:"<p>À Rome, ce fut <b>Cicéron</b>. Son attaque contre le conspirateur Catilina s'ouvre par une phrase restée célèbre : « Jusques à quand, Catilina, abuseras-tu de notre patience ? » En une question, il dresse le Sénat entier contre l'accusé. Voilà la rhétorique : la bonne phrase, au bon moment, frappe plus fort qu'une armée.</p>" },
  { chap:'IV — Le débat & la réfutation', html:"<p>Convaincre, ce n'est pas parler seul : c'est aussi <b>répondre</b>. Dans un débat, on écoute d'abord l'adversaire — vraiment —, puis on <b>concède</b> ce qui est juste (« vous avez raison sur ce point »), avant de <b>réfuter</b> ce qui ne l'est pas.</p><p>Celui qui caricature l'autre pour le vaincre n'a rien prouvé ; celui qui réfute l'adversaire dans sa version la plus forte a vraiment gagné.</p>" },
  { chap:'V — Convaincre ou manipuler', illus:BAL, cap:'La même arme, deux usages.', html:"<p>Voici le cœur de ce livre. Les mêmes procédés peuvent servir le vrai… ou le mentir. <b>Convaincre</b>, c'est aider l'autre à voir ce qui est vrai. <b>Manipuler</b>, c'est lui faire croire ce qui l'arrange, vous.</p>" },
  { chap:'V — Convaincre ou manipuler', html:"<p>Apprends à repérer les pièges du manipulateur : la <b>flatterie</b> qui endort, la <b>peur</b> qui paralyse, la <b>généralisation</b> hâtive (« tous les… »), l'<b>homme de paille</b> (déformer l'idée adverse pour l'abattre plus aisément). Les reconnaître, c'est déjà s'en défendre.</p><p>C'est exactement ce que {villain} redoute : un peuple capable de distinguer un argument d'un mensonge bien tourné.</p>" },
  { chap:'V — Clôture', illus:FLAME, cap:'Troisième pouvoir reconquis.', html:"<p>Te voici au bout du troisième tome. Tu sais défendre une thèse, équilibrer l'ethos, le pathos et le logos, débattre loyalement, et démasquer la manipulation. L'<b>Éloquence</b> est tienne. Mais souviens-toi du serment des vrais orateurs : cette flamme éclaire, elle ne brûle pas. Mets-la au service de la vérité — jamais du tyran.</p>" },
 ];
}

function _colBook4Pages(){
 const GEAR='<svg viewBox="0 0 130 92" width="100%"><g transform="translate(52,50)"><circle r="20" fill="none" stroke="#185FA5" stroke-width="3"/><circle r="7" fill="#0C447C"/><g stroke="#185FA5" stroke-width="3" stroke-linecap="round"><line x1="20" y1="0" x2="27" y2="0"/><line x1="14.1" y1="14.1" x2="19.1" y2="19.1"/><line x1="0" y1="20" x2="0" y2="27"/><line x1="-14.1" y1="14.1" x2="-19.1" y2="19.1"/><line x1="-20" y1="0" x2="-27" y2="0"/><line x1="-14.1" y1="-14.1" x2="-19.1" y2="-19.1"/><line x1="0" y1="-20" x2="0" y2="-27"/><line x1="14.1" y1="-14.1" x2="19.1" y2="-19.1"/></g></g><path d="M70 36 L98 12" stroke="#0C447C" stroke-width="3" stroke-linecap="round"/><path d="M94 10 l9 -4 -2 9 Z" fill="#185FA5"/></svg>';
 const MACH='<svg viewBox="0 0 175 82" width="100%"><g font-family="Georgia,serif" font-weight="700" fill="#fff" text-anchor="middle"><circle cx="34" cy="46" r="18" fill="#0C447C"/><text x="34" y="50" font-size="10">sujet</text><circle cx="86" cy="40" r="21" fill="#185FA5"/><text x="86" y="44" font-size="11">verbe</text><circle cx="142" cy="48" r="16" fill="#0C447C"/><text x="142" y="52" font-size="8">compl.</text></g></svg>';
 const MODES='<svg viewBox="0 0 180 86" width="100%"><circle cx="16" cy="44" r="5" fill="#0C447C"/><g stroke="#185FA5" stroke-width="1.4" fill="none"><path d="M21 44 H44"/><path d="M44 44 V14 H58"/><path d="M44 44 V44 H58"/><path d="M44 44 V74 H58"/></g><g font-family="Georgia,serif" font-size="9" fill="#0c3a66"><text x="61" y="17">indicatif (le réel)</text><text x="61" y="47">subjonctif (le souhaité)</text><text x="61" y="77">conditionnel (le possible)</text></g></svg>';
 const DOLLS='<svg viewBox="0 0 175 80" width="100%"><rect x="12" y="22" width="150" height="40" rx="4" fill="none" stroke="#0C447C" stroke-width="2"/><rect x="42" y="30" width="104" height="24" rx="3" fill="none" stroke="#185FA5" stroke-width="1.6"/><rect x="66" y="36" width="62" height="12" rx="2" fill="none" stroke="#5a93c4" stroke-width="1.3"/><g font-family="Georgia,serif" font-size="8" fill="#0c3a66"><text x="16" y="19">principale</text><text x="48" y="28" font-size="7">subordonnée</text></g></svg>';
 const SCROLL='<svg viewBox="0 0 150 84" width="100%"><rect x="28" y="18" width="92" height="52" rx="3" fill="#EFE2BE" stroke="#B79A63"/><g stroke="#9a7b45" stroke-width="0.8"><line x1="38" y1="30" x2="110" y2="30"/><line x1="38" y1="40" x2="104" y2="40"/><line x1="38" y1="50" x2="110" y2="50"/><line x1="38" y1="58" x2="94" y2="58"/></g><path d="M112 20 L132 2" stroke="#0C447C" stroke-width="3" stroke-linecap="round"/><path d="M128 0 l7 -2 -1 7 Z" fill="#185FA5"/></svg>';
 return [
  { chap:'Frontispice', illus:GEAR, cap:'Le rouage et la plume — le pouvoir de Précision.', html:"<p><i>Une pensée vague produit une phrase boiteuse ; une pensée claire, une phrase d'aplomb.</i></p><p>Ce livre est une horlogerie : il montre comment les mots s'emboîtent pour former des phrases qui ne trahissent jamais l'idée. Maîtrise ses rouages, et tu tiendras la <b>Précision</b> : le pouvoir d'énoncer sans la moindre faille.</p>" },
  { chap:'I — La phrase et ses fonctions', illus:MACH, cap:'Chaque mot, un rouage à sa place.', html:"<p>Une phrase est une petite machine. En son centre, le <b>verbe</b> — le moteur, qui dit l'action ou l'état. Devant lui, le <b>sujet</b>, qui fait l'action. Autour, les <b>compléments</b>, qui précisent : quoi ? où ? quand ? comment ?</p>" },
  { chap:'I — La phrase et ses fonctions', html:"<p>Chaque mot occupe une <b>fonction</b>, comme un rouage occupe sa place : déplace-le, et toute la machine se grippe. « Le chat mange la souris » ne dit pas du tout la même chose que « La souris mange le chat » — pourtant, ce sont les mêmes mots. L'ordre est déjà du sens.</p>" },
  { chap:'II — Les modes et les temps', illus:MODES, cap:'Un même verbe, plusieurs façons de le dire.', html:"<p>Le verbe se dit de plusieurs façons : ce sont les <b>modes</b>. L'<b>indicatif</b> énonce le réel (<i>il vient</i>) ; le <b>subjonctif</b>, le souhaité ou l'incertain (<i>qu'il vienne</i>) ; le <b>conditionnel</b>, le possible (<i>il viendrait</i>) ; l'<b>impératif</b>, l'ordre (<i>viens !</i>).</p>" },
  { chap:'II — Les modes et les temps', html:"<p>Et chaque mode déploie ses <b>temps</b>, pour situer l'action dans le cours du temps : hier, maintenant, demain. Choisir le bon mode et le bon temps, c'est dire exactement ce que l'on pense — ni plus, ni moins. Un seul temps qui glisse, et tout le sens dérape.</p>" },
  { chap:'III — La concordance des temps', html:"<p>Les temps d'une phrase doivent s'<b>accorder entre eux</b>, comme des engrenages qui tournent ensemble. On ne dit pas « Si j'<i>aurais</i> su », mais « Si j'<i>avais</i> su, je ne serais pas venu » : à <i>si</i> + imparfait répond le conditionnel.</p><p>Cette <b>concordance</b> est la clé d'un récit limpide : le lecteur sait toujours où il se trouve dans le temps.</p>" },
  { chap:'IV — La subordination', illus:DOLLS, cap:'Les idées s\'emboîtent comme des poupées russes.', html:"<p>Les idées s'<b>emboîtent</b> les unes dans les autres. Une proposition <b>principale</b> peut contenir une <b>subordonnée</b> qui la complète : « Je sais [que tu viendras]. » La <b>relative</b> précise un nom (« le livre <i>que je lis</i> ») ; la <b>conjonctive</b> complète le verbe (« je crois <i>qu'il pleut</i> »).</p>" },
  { chap:'V — La cohérence du texte', html:"<p>Un texte tient debout grâce à ses <b>connecteurs logiques</b> : <i>d'abord, ensuite, car, pourtant, donc</i>. Ce sont les chevilles qui assemblent les idées en un raisonnement solide. Sans eux, des phrases justes restent un tas de briques ; avec eux, elles deviennent un mur.</p>" },
  { chap:'V — La cohérence du texte', illus:SCROLL, cap:'Clément Marot et sa règle de 1538.', html:"<p><b>Le saviez-vous ?</b> La fameuse règle de l'accord du participe passé — « les pommes que j'ai <i>mangées</i> » — fut fixée en <b>1538</b> par le poète <b>Clément Marot</b>, qui l'emprunta à l'italien. Il l'enferma même dans un petit poème pour qu'on la retienne : « <i>Le terme qui va devant / Volontiers régit le suivant.</i> » Une règle vieille de près de cinq siècles, qui fait encore trébucher les meilleurs !</p>" },
  { chap:'V — Clôture', illus:GEAR, cap:'Quatrième pouvoir reconquis.', html:"<p>Te voici au bout du quatrième tome. Tu sais bâtir une phrase d'aplomb, choisir le mode et le temps justes, accorder les temps, emboîter les subordonnées et lier les idées. La <b>Précision</b> est tienne. Souviens-toi : une phrase juste est une arme que nul ne peut retourner contre toi — et c'est précisément ce que {villain} ne sait pas tordre.</p>" },
 ];
}

function _colBook5Pages(){
 const MASK='<svg viewBox="0 0 150 88" width="100%"><path d="M30 24 q22 -6 22 18 q0 24 -22 30 q-22 -6 -22 -30 q0 -24 22 -18 Z" fill="#534AB7"/><circle cx="23" cy="40" r="2" fill="#fff"/><circle cx="37" cy="40" r="2" fill="#fff"/><path d="M22 54 q8 8 16 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M100 24 q22 -6 22 18 q0 24 -22 30 q-22 -6 -22 -30 q0 -24 22 -18 Z" fill="#3C3489"/><circle cx="93" cy="40" r="2" fill="#fff"/><circle cx="107" cy="40" r="2" fill="#fff"/><path d="M92 58 q8 -8 16 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M75 6 l2.4 7 7 0 -5.7 4.4 2.2 7 -5.9 -4.4 -5.9 4.4 2.2 -7 -5.7 -4.4 7 0 Z" fill="#e0c84a"/></svg>';
 const ALEX='<svg viewBox="0 0 175 64" width="100%"><g fill="#534AB7"><circle cx="14" cy="34" r="4"/><circle cx="26" cy="34" r="4"/><circle cx="38" cy="34" r="4"/><circle cx="50" cy="34" r="4"/><circle cx="62" cy="34" r="4"/><circle cx="74" cy="34" r="4"/><circle cx="100" cy="34" r="4"/><circle cx="112" cy="34" r="4"/><circle cx="124" cy="34" r="4"/><circle cx="136" cy="34" r="4"/><circle cx="148" cy="34" r="4"/><circle cx="160" cy="34" r="4"/></g><line x1="87" y1="22" x2="87" y2="46" stroke="#534AB7" stroke-width="1.4" stroke-dasharray="3 3"/><text x="87" y="16" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">césure</text><text x="44" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">6 syllabes</text><text x="130" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">6 syllabes</text></svg>';
 const THEA='<svg viewBox="0 0 160 84" width="100%"><rect x="14" y="16" width="132" height="58" rx="3" fill="#2a2456"/><path d="M14 16 q22 30 0 58 Z" fill="#7a2a3a"/><path d="M146 16 q-22 30 0 58 Z" fill="#7a2a3a"/><path d="M70 34 q10 -4 20 0 q0 20 -10 26 q-10 -6 -10 -26 Z" fill="#e0d6f5"/><circle cx="76" cy="46" r="1.7" fill="#2a2456"/><circle cx="84" cy="46" r="1.7" fill="#2a2456"/><path d="M75 56 q5 4 10 0" fill="none" stroke="#2a2456" stroke-width="1.4"/></svg>';
 const PLUME='<svg viewBox="0 0 160 84" width="100%"><rect x="28" y="22" width="86" height="50" rx="2" fill="#EFE2BE" stroke="#B79A63"/><text x="71" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" font-style="italic" fill="#3C3489">J\'accuse</text><g stroke="#9a7b45" stroke-width="0.8"><line x1="38" y1="50" x2="104" y2="50"/><line x1="38" y1="58" x2="98" y2="58"/><line x1="38" y1="66" x2="104" y2="66"/></g><path d="M118 20 L140 4" stroke="#3C3489" stroke-width="3" stroke-linecap="round"/><path d="M136 2 l7 -2 -1 8 Z" fill="#534AB7"/></svg>';
 return [
  { chap:'Frontispice', illus:MASK, cap:'Le masque et l\'étoile — le pouvoir d\'Imaginaire.', html:"<p><i>Quand les mots ne se contentent plus de dire le monde, mais en inventent d'autres, naît la littérature.</i></p><p>Ce dernier livre-monde est une galerie de miroirs où vivent tous les genres : le conte, la poésie, le théâtre, le roman, l'écrit qui s'engage. Traverse-les, et tu tiendras l'<b>Imaginaire</b> : le pouvoir de faire rêver, d'émouvoir et de créer.</p>" },
  { chap:'I — Le conte & le merveilleux', html:"<p>Le <b>conte</b> est sans doute le plus ancien des récits : on se le transmettait, le soir, de bouche à oreille. Il obéit à des lois secrètes — un héros, une épreuve, des aides et des obstacles, une fin qui répare le tort.</p><p>En <b>1697</b>, <b>Charles Perrault</b> mit par écrit ces histoires dans ses <i>Contes de ma mère l'Oye</i> : la Belle au bois dormant, le Petit Chaperon rouge, Cendrillon. Le conte accueille le <b>merveilleux</b> — fées, ogres, citrouilles changées en carrosses — sans jamais s'en étonner.</p>" },
  { chap:'II — La poésie & le lyrisme', illus:ALEX, cap:'L\'alexandrin : douze syllabes, une césure au milieu.', html:"<p>La <b>poésie</b> fait chanter la langue. Elle compte les syllabes, marie les sons par la <b>rime</b> et donne au vers un rythme. Le plus noble des vers français est l'<b>alexandrin</b> : douze syllabes, partagées en leur milieu par une pause appelée la <b>césure</b>.</p>" },
  { chap:'II — La poésie & le lyrisme', html:"<p>Quand le poète dit « je » et chante ses émotions — l'amour, le chagrin, l'émerveillement —, on parle de <b>lyrisme</b>, du nom de la <i>lyre</i>, l'instrument des poètes de la Grèce antique. La poésie n'explique pas le monde : elle le fait ressentir. Là où le tyran voudrait une langue plate, le poète prouve qu'un mot peut faire pleurer ou sourire.</p>" },
  { chap:'III — Le théâtre', illus:THEA, cap:'La scène, les rideaux, le masque.', html:"<p>Le <b>théâtre</b> ne se lit pas seulement : il se <b>joue</b>. Des comédiens incarnent les personnages, en chair et en voix, devant un public. On distingue la <b>comédie</b>, qui fait rire pour corriger les travers des hommes, et la <b>tragédie</b>, qui inspire la terreur et la pitié devant un destin trop grand.</p>" },
  { chap:'III — Le théâtre', html:"<p><b>Une fin digne d'une pièce.</b> Le 17 février 1673, <b>Molière</b> jouait Argan, le faux malade du <i>Malade imaginaire</i>. Pris d'un malaise pendant la représentation, il acheva pourtant la pièce — puis mourut chez lui quelques heures plus tard. La légende dit qu'il s'éteignit « sur scène » : la vérité est à peine moins théâtrale, car le plus grand de nos auteurs comiques rendit l'âme en jouant un homme qui se croyait mourant.</p>" },
  { chap:'IV — Le roman & le réalisme', html:"<p>Le <b>roman</b> est le genre de la liberté : en prose, sans contrainte de vers ni de scène, il peut tout raconter. Au XIXe siècle, des écrivains voulurent y peindre la société entière, sans rien embellir : c'est le <b>réalisme</b>.</p><p><b>Balzac</b> rêva d'une <i>Comédie humaine</i> où reparaîtraient les mêmes personnages, de livre en livre ; <b>Zola</b> descendit au fond des mines pour écrire <i>Germinal</i>. Le romancier devient l'œil de son époque.</p>" },
  { chap:'V — La littérature engagée', illus:PLUME, cap:'Quand la plume devient une arme.', html:"<p>Parfois, l'écrivain prend les armes — mais ses armes sont des mots. C'est la <b>littérature engagée</b> : mettre son talent au service d'une cause, et dresser sa plume contre l'injustice. <b>Voltaire</b> défendit les victimes de l'erreur judiciaire ; <b>Victor Hugo</b> plaida pour les misérables et contre la peine de mort.</p>" },
  { chap:'V — La littérature engagée', html:"<p><b>« J'accuse… ! »</b> Le 13 janvier 1898, dans le journal <i>L'Aurore</i>, <b>Émile Zola</b> publia une lettre ouverte pour défendre <b>Alfred Dreyfus</b>, un officier injustement condamné. Le titre fit le tour du pays ; un seul article obligea toute une nation à regarder la vérité en face. Voilà ce que peut un écrivain : par la seule force des mots, ébranler les puissants.</p>" },
  { chap:'V — Clôture', illus:MASK, cap:'Cinquième pouvoir reconquis.', html:"<p>Te voici au bout du cinquième et dernier livre-monde. Tu connais le conte et son merveilleux, la poésie et son chant, le théâtre et ses masques, le roman et son regard, et l'écrit qui combat. L'<b>Imaginaire</b> est tien. Cinq pouvoirs reconquis ! Il ne te reste qu'à rentrer à Monotonia — car ces mots, désormais, tu vas devoir les rendre à tout un peuple. Le <b>Réveil</b> approche.</p>" },
 ];
}

// ── Symbole de pouvoir (unité, réutilisé tranche + couverture) ──────────
function _colSymbol(i,cx,cy,s,col){
 const g='<g transform="translate('+cx+' '+cy+') scale('+s+')" fill="none" stroke="'+col+'" stroke-linecap="round">';
 if(i===0) return g+'<circle cx="0" cy="-8" r="4.5" stroke-width="1.3"/><circle cx="0" cy="-8" r="1.5" fill="'+col+'"/><line x1="0" y1="-3.5" x2="0" y2="9" stroke-width="1.7"/><line x1="0" y1="3" x2="4.2" y2="3" stroke-width="1.4"/><line x1="0" y1="6" x2="4.2" y2="6" stroke-width="1.4"/><path d="M0 9 C-4 12 -5 13 -7 15" stroke-width="1.1"/><path d="M0 9 C4 12 5 13 7 15" stroke-width="1.1"/></g>';
 if(i===1) return g+'<polygon points="0,-9 9,8 -9,8" stroke-width="1.4"/><line x1="-13" y1="-1" x2="-3" y2="-1" stroke-width="1.1"/><line x1="3" y1="-3" x2="13" y2="-7" stroke-width="1.1"/><line x1="3" y1="1" x2="13" y2="3" stroke-width="1.1"/><line x1="3" y1="5" x2="12" y2="11" stroke-width="1.1"/></g>';
 if(i===2) return g+'<path d="M0 10 C-7 3 6 -3 0 -12 C9 -3 7 4 0 10 Z" stroke-width="1.5"/></g>';
 if(i===3) return g+'<circle cx="0" cy="0" r="8" stroke-width="1.5"/><circle cx="0" cy="0" r="2.6" fill="'+col+'"/><line x1="0" y1="-11" x2="0" y2="-8" stroke-width="1.5"/><line x1="0" y1="8" x2="0" y2="11" stroke-width="1.5"/><line x1="-11" y1="0" x2="-8" y2="0" stroke-width="1.5"/><line x1="8" y1="0" x2="11" y2="0" stroke-width="1.5"/><line x1="-7.8" y1="-7.8" x2="-5.7" y2="-5.7" stroke-width="1.5"/><line x1="7.8" y1="7.8" x2="5.7" y2="5.7" stroke-width="1.5"/><line x1="-7.8" y1="7.8" x2="-5.7" y2="5.7" stroke-width="1.5"/><line x1="7.8" y1="-7.8" x2="5.7" y2="-5.7" stroke-width="1.5"/></g>';
 if(i===4) return g+'<path d="M0 -11 l3 7.5 8 0 -6.5 5 2.5 7.7 -7 -4.8 -7 4.8 2.5 -7.7 -6.5 -5 8 0 Z" stroke-width="1.3"/></g>';
 if(i===5) return g+'<path d="M-9 6 a9 9 0 0 1 18 0" stroke-width="1.6"/><line x1="-13" y1="6" x2="13" y2="6" stroke-width="1.3"/><line x1="0" y1="-9" x2="0" y2="-5" stroke-width="1.2"/><line x1="-8" y1="-5" x2="-5.5" y2="-2.5" stroke-width="1.2"/><line x1="8" y1="-5" x2="5.5" y2="-2.5" stroke-width="1.2"/></g>';
 return g+'<path d="M-6 8 L-6 -8 L6 -8 L6 8" stroke-width="1.4"/><circle cx="-6" cy="-9.5" r="1.6" fill="'+col+'"/><circle cx="6" cy="-9.5" r="1.6" fill="'+col+'"/><path d="M0 -5 l2.6 2.6 -2.6 2.6 -2.6 -2.6 Z" fill="'+col+'"/><line x1="-8.5" y1="2" x2="8.5" y2="2" stroke-width="1.4"/><line x1="-8.5" y1="2" x2="-8.5" y2="8" stroke-width="1.4"/><line x1="8.5" y1="2" x2="8.5" y2="8" stroke-width="1.4"/><line x1="-9.5" y1="8" x2="9.5" y2="8" stroke-width="1.3"/><line x1="-11.5" y1="11" x2="11.5" y2="11" stroke-width="1.3"/></g>';
}
function _colLock(cx,y,c){ return '<rect x="'+(cx-4).toFixed(1)+'" y="'+(y).toFixed(1)+'" width="8" height="6.5" rx="1.4" fill="none" stroke="'+c+'" stroke-width="1.1"/><path d="M'+(cx-2.4).toFixed(1)+' '+(y).toFixed(1)+' v-1.8 a2.4 2.4 0 0 1 4.8 0 v1.8" fill="none" stroke="'+c+'" stroke-width="1.1"/>'; }
function _wrapTitle(t,max){ max=max||14; const w=String(t).split(' '); const lines=[]; let cur=''; for(let k=0;k<w.length;k++){ const x=w[k]; if((cur+' '+x).trim().length>max && cur){ lines.push(cur); cur=x; } else { cur=(cur?cur+' ':'')+x; } } if(cur) lines.push(cur); return lines.slice(0,3); }

// ── Grande couverture (1re page) et dos de couverture (dernière page) ────
function _colCoverSvg(book,idx){
 const acc=book.accent||'#9E4326', dk=book.dark||'#5a2718', gold=book.gold||'#E0B24F', gly=book.gold?'#e7e7ef':'#F4DCA0';
 const lines=_wrapTitle(book.title,14);
 const ty=(lines.length>=3?96:104);
 let title=''; for(let k=0;k<lines.length;k++){ title+='<text x="180" y="'+(ty+k*23)+'" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="0.6" font-weight="700" fill="'+gold+'">'+lines[k]+'</text>'; }
 const ruleY=ty+lines.length*23-8;
 const bottom=book.bonus?'Bonus':('Tome '+(book.roman||''));
 return '<svg viewBox="0 0 360 470" width="100%" style="max-width:300px;display:block;margin:0 auto" role="img" aria-label="Couverture : '+book.title+'">'
  +'<ellipse cx="186" cy="424" rx="132" ry="16" fill="#000000" opacity="0.16"/>'
  +'<polygon points="285,56 297,68 297,410 285,398" fill="#EFE3C4"/>'
  +'<polygon points="75,398 87,410 297,410 285,398" fill="#D6C49A"/>'
  +'<rect x="75" y="56" width="210" height="342" rx="6" fill="'+acc+'"/>'
  +'<rect x="75" y="56" width="13" height="342" rx="5" fill="#000000" opacity="0.20"/>'
  +'<rect x="77" y="58" width="206" height="5" fill="#FFFFFF" opacity="0.13"/>'
  +'<rect x="91" y="70" width="178" height="314" rx="4" fill="none" stroke="'+gold+'" stroke-width="2.6"/>'
  +'<rect x="97" y="76" width="166" height="302" rx="3" fill="none" stroke="'+gold+'" stroke-width="1"/>'
  +'<g fill="'+gold+'"><path d="M91 70 h16 v3 h-13 v13 h-3 z"/><path d="M269 70 h-16 v3 h13 v13 h3 z"/><path d="M91 384 h16 v-3 h-13 v-13 h-3 z"/><path d="M269 384 h-16 v-3 h13 v-13 h3 z"/></g>'
  +title
  +'<line x1="135" y1="'+ruleY+'" x2="225" y2="'+ruleY+'" stroke="'+gold+'" stroke-width="1"/>'
  +'<circle cx="180" cy="244" r="56" fill="none" stroke="'+gold+'" stroke-width="6"/>'
  +'<circle cx="180" cy="244" r="48" fill="'+dk+'"/>'
  +_colSymbol(idx,180,244,3.7,gly)
  +'<text x="180" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="14" letter-spacing="3.5" font-weight="700" fill="'+gold+'">'+bottom+'</text>'
  +'</svg>';
}
function _colBackCoverSvg(book,idx){
 const acc=book.accent||'#9E4326', dk=book.dark||'#5a2718', gold=book.gold||'#E0B24F', gly=book.gold?'#e7e7ef':'#F4DCA0';
 const quote=book.bonus?'« Les mots reviennent toujours. »':(book.power?('Pouvoir : '+book.power):'La Bibliothèque infinie');
 return '<svg viewBox="0 0 360 470" width="100%" style="max-width:300px;display:block;margin:0 auto" role="img" aria-label="Dos de couverture : '+book.title+'">'
  +'<ellipse cx="186" cy="424" rx="132" ry="16" fill="#000000" opacity="0.16"/>'
  +'<rect x="75" y="56" width="210" height="342" rx="6" fill="'+acc+'"/>'
  +'<rect x="75" y="56" width="13" height="342" rx="5" fill="#000000" opacity="0.20"/>'
  +'<rect x="91" y="70" width="178" height="314" rx="4" fill="none" stroke="'+gold+'" stroke-width="2"/>'
  +'<circle cx="180" cy="150" r="34" fill="'+dk+'"/><circle cx="180" cy="150" r="34" fill="none" stroke="'+gold+'" stroke-width="3"/>'
  +_colSymbol(idx,180,150,2.1,gly)
  +'<text x="180" y="252" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-style="italic" fill="'+gold+'">'+quote+'</text>'
  +'<text x="180" y="356" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2" fill="'+gold+'">La Bibliothèque infinie</text>'
  +'</svg>';
}

// ── Lecteur de livre : couverture → double page enluminée → dos ─────────
function _resolveBookPages(book){
 let ps=book.pages;
 if(!ps && book.bookTale && typeof _COL_STORY_FR!=='undefined' && _COL_STORY_FR.bookTale) ps=_COL_STORY_FR.bookTale.pages;
 ps=ps||[];
 return ps.map(function(p){ return { chap:p.chap||'', html:p.html||p.text||'', illus:p.illus||'', cap:p.cap||'' }; });
}
function _openColBook(idx){
 try{
  const book=(typeof _COL_BOOKS_FR!=='undefined'?_COL_BOOKS_FR:[])[idx];
  if(!book) return;
  const pages=_resolveBookPages(book);
  if(!pages.length) return;
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(function(){ _renderColBook(book,idx,pages); },300);
 }catch(e){}
}
function _renderColBook(book,idx,pages){
 const acc=book.accent||'#9E4326', gold=book.gold||'#C79A3A';
 const S=Math.ceil(pages.length/2), total=S+2;
 let step=0;
 const ov=document.createElement('div'); ov.className='story-overlay';
 function close(){ ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
 function _heroName(){ try{ return (typeof P!=='undefined'&&P&&P.name)?String(P.name):'le Porteur de Mots'; }catch(e){ return 'le Porteur de Mots'; } }
 function _fill(s){ try{ s=String(s||''); const h=_heroName().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return s.replace(/\{hero\}/g,'<b>'+h+'</b>').replace(/\{villain\}/g,(typeof _COL_VILLAIN_FR!=='undefined'?_COL_VILLAIN_FR:'le Chancelier')); }catch(e){ return s; } }
 function half(p,isLeft){
  if(!p) return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;min-height:240px;"></div></div>';
  let body=_fill(p.html||'');
  if(isLeft && /^<p>/.test(body)) body=body.replace(/^<p>\s*(.)/,'<p><span style="float:left;font-family:Georgia,serif;font-size:44px;line-height:.74;font-weight:700;color:'+acc+';padding:2px 8px 0 0;">$1</span>');
  const illus=p.illus?'<div style="background:#e7d7ae;border:1px solid #c9b486;border-radius:4px;padding:7px;margin-bottom:8px;">'+p.illus+(p.cap?'<div style="font-family:Georgia,serif;font-style:italic;font-size:11px;color:#6b5638;text-align:center;margin-top:3px;">'+p.cap+'</div>':'')+'</div>':'';
  return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;padding:13px;min-height:240px;">'+illus+'<div style="font-family:Georgia,serif;font-size:13px;line-height:1.65;color:#3A2A18;text-align:justify;">'+body+'</div></div></div>';
 }
 function render(){
  let inner='';
  if(step===0){ inner='<div style="text-align:center;">'+_colCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Touche « Feuilleter » pour ouvrir le livre.</div></div>'; }
  else if(step===total-1){ inner='<div style="text-align:center;">'+_colBackCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Fin.</div></div>'; }
  else {
   const li=(step-1)*2, L=pages[li], R=pages[li+1];
   const chap=(L&&L.chap)||(R&&R.chap)||'';
   inner='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid #d8c79c;padding-bottom:6px;margin-bottom:10px;">'
    +'<span style="font-family:Georgia,serif;font-weight:700;color:'+acc+';font-size:1.0em;">'+book.title+'</span>'
    +'<span style="font-family:Georgia,serif;font-size:.76em;color:#8a6a45;">'+chap+'</span></div>'
    +'<div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:0;background:#EBDFBF;border-radius:5px;overflow:hidden;">'
    +'<div style="background:linear-gradient(90deg,#F3E8CD,#ECE0C2 86%,#DCCBA0);padding:13px 13px 13px 15px;">'+half(L,true)+'</div>'
    +'<div style="background:linear-gradient(90deg,#DCCBA0,#ECE0C2 14%,#F3E8CD);padding:13px 15px 13px 13px;">'+half(R,false)+'</div>'
    +'<div style="position:absolute;top:0;bottom:0;left:50%;width:18px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,.20) 50%,rgba(0,0,0,0));pointer-events:none;"></div>'
    +'</div>';
  }
  const prevLbl=step===total-1?'‹ Pages':'‹ Précédent';
  const nextLbl=step===0?'Feuilleter ›':(step===total-1?'Fermer le livre':'Suivant ›');
  let counter; if(step===0) counter='Couverture'; else if(step===total-1) counter='Dos de couverture'; else { const a=(step-1)*2+1, b=Math.min(a+1,pages.length); counter=(a===b?('page '+a):('pages '+a+'–'+b))+' / '+pages.length; }
  ov.innerHTML='<div class="story-parchment" style="max-width:'+((step===0||step===total-1)?'360':'600')+'px;border-top:6px solid '+acc+';">'
   +inner
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn cb-prev">'+prevLbl+'</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:58%;">'+Array.apply(null,{length:total}).map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn cb-next">'+nextLbl+'</button>'
   +'</div>'
   +'<div style="text-align:center;font-family:Georgia,serif;font-size:.76em;color:#8a6a45;margin-top:4px;">'+counter+'</div>'
   +'</div>';
  const nx=ov.querySelector('.cb-next'); if(nx) nx.onclick=function(){ if(step<total-1){step++;render();} else close(); };
  const pv=ov.querySelector('.cb-prev'); if(pv) pv.onclick=function(){ if(step>0){step--;render();} };
  if(typeof beep==='function'){ try{ beep(520,'sine',.09,.04); }catch(e){} }
 }
 render(); document.body.appendChild(ov);
}

// ── Carnet collège FR : La Bibliothèque infinie (7 tranches 3D) ─────────
function _advLibraryHtml(){
 const seen=(typeof P!=='undefined'&&P&&P.storySeen)||[];
 const books=(typeof _COL_BOOKS_FR!=='undefined')?_COL_BOOKS_FR:[];
 const reg=['cp','ce1','ce2','cm1','cm2'];
 const unlocked=function(i){ if(i<5) return _regionConquered(reg[i]); if(i===5) return seen.indexOf('colfr_booktale')>=0; return seen.indexOf('colfr_c_titan')>=0; };
 const N=books.length||7;
 const nUn=books.reduce(function(a,b,i){return a+(unlocked(i)?1:0);},0);
 const bw=22, gap=2.2, totalW=N*bw+(N-1)*gap, x0=(200-totalW)/2;
 let spines='';
 for(let i=0;i<N;i++){
  const b=books[i]||{}; const on=unlocked(i); const x=x0+i*(bw+gap), cx=x+bw/2;
  const col=on?(b.accent||'#9E4326'):'#615d57';
  const dk=on?(b.dark||'#3a1c10'):'#46433e';
  const gold=on?(b.gold||'#E0B24F'):'#8a857d';
  const gly=on?(b.gold?'#dcdce4':'#f0d68a'):'#8a857d';
  const click=on?(' onclick="_openColBook('+i+')" style="cursor:pointer" role="button" tabindex="0" title="Lire : '+(b.title||'')+'"'):'';
  spines+='<g'+click+'>'
   +'<polygon points="'+x.toFixed(1)+',24 '+(x+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',21 '+(x+bw).toFixed(1)+',24" fill="'+dk+'"/>'
   +'<polygon points="'+(x+bw).toFixed(1)+',24 '+(x+bw+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',127 '+(x+bw).toFixed(1)+',130" fill="'+dk+'"/>'
   +'<rect x="'+x.toFixed(1)+'" y="24" width="'+bw+'" height="106" rx="2" fill="'+col+'"/>'
   +'<rect x="'+(x+1.5).toFixed(1)+'" y="26" width="2" height="102" fill="#ffffff" opacity="0.10"/>'
   +'<rect x="'+(x+2).toFixed(1)+'" y="33" width="'+(bw-4)+'" height="2" fill="'+gold+'"/><rect x="'+(x+2).toFixed(1)+'" y="119" width="'+(bw-4)+'" height="2" fill="'+gold+'"/>'
   +'<text x="'+cx.toFixed(1)+'" y="52" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="7" fill="'+gly+'" transform="rotate(-90 '+cx.toFixed(1)+' 52)">'+(b.short||b.roman||(i+1))+'</text>'
   +(on?_colSymbol(i,cx,80,0.5,gly):_colLock(cx,77,'#cfcabf'))
   +'<circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="'+dk+'"/><circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="none" stroke="'+gold+'" stroke-width="1.4"/>'
   +'<text x="'+cx.toFixed(1)+'" y="108" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="'+(b.roman?8:9)+'" font-weight="700" fill="'+gly+'">'+(b.roman||'✦')+'</text>'
   +'</g>';
 }
 const shelf='<rect x="6" y="130" width="188" height="9" rx="2" fill="#5a4126"/><rect x="6" y="130" width="188" height="3" fill="#7a5a34"/><rect x="6" y="20" width="188" height="4" rx="2" fill="#3c2c18"/>';
 const msg=nUn>0?'Touche un tome débloqué pour le feuilleter.':"Conquiers les îlots : chaque tome rejoindra ta bibliothèque.";
 return ''
  +'<div class="advlog-section-title">📚 La Bibliothèque infinie</div>'
  +'<div class="advcol-box advcol-mat">'
  +' <svg viewBox="0 0 200 150" class="advcol-svg" aria-label="Bibliothèque : '+nUn+' livres sur '+N+'">'
  +'  '+shelf+spines
  +' </svg>'
  +' <div class="advcol-caption">'+msg+' <b>'+nUn+' / '+N+'</b></div>'
  +'</div>';
}

// ── Livre VII (Bonus) : « L'Antre du Chancelier » ──────────────────────
function _colBook7Pages(){
 const THRONE='<svg viewBox="0 0 150 96" width="100%"><g fill="none" stroke="#4a4856" stroke-width="2" stroke-linecap="round"><path d="M58 70 L58 30 L92 30 L92 70"/><path d="M52 70 L98 70"/><path d="M52 70 L52 82 M98 70 L98 82"/><path d="M44 82 L106 82 M36 90 L114 90"/></g><circle cx="58" cy="27" r="3.5" fill="#6a6878"/><circle cx="92" cy="27" r="3.5" fill="#6a6878"/><path d="M75 42 l5 5 -5 5 -5 -5 Z" fill="#7a6bb0"/></svg>';
 const STELES='<svg viewBox="0 0 160 80" width="100%"><g fill="#d8cdb6" stroke="#9a8f78" stroke-width="1"><path d="M14 74 V40 a8 8 0 0 1 16 0 V74 Z"/><path d="M42 74 V44 a8 8 0 0 1 16 0 V74 Z"/><path d="M70 74 V38 a8 8 0 0 1 16 0 V74 Z"/><path d="M98 74 V46 a8 8 0 0 1 16 0 V74 Z"/><path d="M126 74 V42 a8 8 0 0 1 16 0 V74 Z"/></g><g stroke="#9a8f78" stroke-width="1"><line x1="18" y1="52" x2="26" y2="60"/><line x1="26" y1="52" x2="18" y2="60"/><line x1="74" y1="50" x2="82" y2="58"/><line x1="82" y1="50" x2="74" y2="58"/><line x1="130" y1="54" x2="138" y2="62"/><line x1="138" y1="54" x2="130" y2="62"/></g></svg>';
 return [
  { chap:'L\'Antre du Chancelier', illus:THRONE, cap:'Le trône de cendre, au cœur du Palais.', html:"<p>Ce tome ne figurait sur aucune carte. Il raconte ce qui advint derrière les portes closes du <b>Palais de Cendre</b>, le jour où {hero} y pénétra seul pour affronter {villain}.</p>" },
  { chap:'Le Palais de Cendre', html:"<p>Le palais ne brûlait pas. Il ne brillait pas. Il était gris — d'un gris qui avait oublié jusqu'au souvenir des couleurs. Nulle garde aux portes : à quoi bon défendre un lieu que plus aucun mot ne savait nommer ?</p>" },
  { chap:'La galerie des mots morts', illus:STELES, cap:'Les mots que le Chancelier fit taire.', html:"<p>Une longue galerie menait au trône. De part et d'autre, dressées comme des stèles, veillaient les mots que le Chancelier avait fait taire : <i>liberté</i>, <i>peut-être</i>, <i>autrefois</i>, <i>ensemble</i>, <i>demain</i>. Chacun gravé, puis soigneusement raturé.</p>" },
  { chap:'Le trône', html:"<p>Au bout l'attendait un homme petit, gris, presque ordinaire — rien d'un monstre. « Te voilà, dit {villain} avec un demi-sourire. Le fameux Porteur de Mots. Je l'avoue : je t'imaginais plus grand. »</p>" },
  { chap:'La joute de verbe', html:"<p>Il leva la main et lança son dernier sort : un grand charabia où les sons s'entrechoquaient sans plus rien vouloir dire, un brouillard où nul ne pouvait se comprendre. Mais {hero} répondit par des mots justes, et chacun perça le brouillard comme une lame perce la brume.</p>" },
  { chap:'Pourquoi ?', html:"<p>« Pourquoi ? demanda {hero}. Pourquoi avoir volé les mots d'un peuple entier ? » Le sourire du vieil homme se fissura. « Parce qu'un peuple qui sait nommer sa peine finit toujours par exiger qu'on y mette fin. Sans les mots, ils étaient… tranquilles. »</p>" },
  { chap:'L\'aveu', html:"<p>« Tranquilles, repris-tu, ou seulement muets ? » Le Chancelier baissa les yeux. Et pour la première fois depuis des années, il prononça, d'une voix qui tremblait, les deux mots qu'il s'était toujours interdits : « <b>J'avais peur.</b> »</p>" },
  { chap:'La chute', html:"<p>Au-dehors, la foule scandait des mots qu'elle venait de réapprendre. Aucun mur, aucun trône ne tient contre une langue rendue au peuple. Le siège de cendre s'effondra, et {villain} avec lui — vaincu non par la force, mais par le <b>sens</b>.</p>" },
  { chap:'Épilogue', illus:THRONE, cap:'On posa, sur le trône, un livre ouvert.', html:"<p>On ne détruisit pas le Palais : on en fit la plus grande bibliothèque de <b>Sémantia</b>. Et sur le trône de cendre, désormais, on posa simplement un livre ouvert. Ainsi s'achève l'histoire de l'Antre — et commence celle d'un peuple qui n'aura plus jamais peur de ses propres mots.</p>" },
 ];
}

// Affiche une scène narrative (parchemin paginé). onDone() appelé à la fermeture.
// ── Narration chaleureuse du livre (mode Odyssée) ──────────────────────
// Voix de conteur : lente, posée, en privilégiant une voix française
// naturelle/expressive (féminine de préférence).
let _storyUtter = null;
function _pickNarratorVoice(){
 try{
  // Respecte le choix explicite de l'utilisateur (sélecteur de voix)
  if(typeof _frVoice!=='undefined' && _frVoice) return _frVoice;
  const vs = (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
  const fr = vs.filter(v => /fr(-|_)?/i.test(v.lang||''));
  if(!fr.length) return null;
  const prefs = [
   /google.*fran/i,                                   // "Google français" (très naturelle)
   /amélie|amelie|audrey|aurélie|aurelie|virginie|charlotte|léa|lea|marie/i, // conteuses
   /natural|enhanced|premium|neural|siri|eloquence/i, // voix améliorées
   /thomas|nicolas|paul|daniel/i,
  ];
  for(const p of prefs){ const f = fr.find(v => p.test(v.name||'')); if(f) return f; }
  return fr[0];
 }catch(e){ return null; }
}
function _narrateStop(){ try{ window.speechSynthesis.cancel(); }catch(e){} _storyUtter = null; }
function _narratePause(){ try{ if(window.speechSynthesis.speaking && !window.speechSynthesis.paused) window.speechSynthesis.pause(); }catch(e){} }
function _narrateStory(rawHtml){
 if(!window.speechSynthesis) return;
 try{
  // Si une lecture est en pause, on reprend simplement.
  if(window.speechSynthesis.paused){ window.speechSynthesis.resume(); return; }
  window.speechSynthesis.cancel();
  // Extraire le texte brut (sans balises) de la page
  const tmp = document.createElement('div'); tmp.innerHTML = _storyText(rawHtml);
  let plain = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  if(!plain) return;
  const hum = (typeof _humanizeForSpeech === 'function') ? _humanizeForSpeech(plain) : plain;
  const u = new SpeechSynthesisUtterance(hum);
  u.lang = 'fr-FR';
  u.rate = 0.84;   // posé, comme un conteur
  u.pitch = 1.05;  // chaleureux
  u.volume = 1;
  const v = _pickNarratorVoice(); if(v) u.voice = v;
  _storyUtter = u;
  window.speechSynthesis.speak(u);
 }catch(e){}
}

function _showStoryModal(chapter, onDone){
 if(!chapter || !Array.isArray(chapter.pages) || !chapter.pages.length){ if(onDone) onDone(); return; }
 let page = 0;
 const overlay = document.createElement('div');
 overlay.className = 'story-overlay';
 // v10.3.2 — Lecture enchaînée du chapitre : lit page après page en faisant
 // défiler l'affichage, sans s'arrêter à chaque page (3 niveaux concernés).
 let _readActive = false, _readUtter = null;
 function _bSyncPlay(){ const pl = overlay.querySelector('.snarr-play'); if(pl) pl.classList.toggle('reading', !!_readActive); }
 function _bSpeak(idx){
  if(!window.speechSynthesis){ _readActive=false; return; }
  if(idx >= chapter.pages.length){ _readActive=false; _bSyncPlay(); return; }
  page = idx; render();                                   // défilement visuel synchronisé
  const tmp = document.createElement('div'); tmp.innerHTML = _storyText(chapter.pages[idx].text || '');
  const plain = (tmp.textContent || tmp.innerText || '').replace(/\s+/g,' ').trim();
  if(!plain){ _bSpeak(idx+1); return; }
  const hum = (typeof _humanizeForSpeech==='function') ? _humanizeForSpeech(plain) : plain;
  const u = new SpeechSynthesisUtterance(hum);
  u.lang='fr-FR'; u.rate=0.84; u.pitch=1.05; u.volume=1;
  try{ const v=_pickNarratorVoice(); if(v) u.voice=v; }catch(e){}
  u.onend = ()=>{ if(_readActive && _readUtter===u) _bSpeak(idx+1); };   // enchaîne la page suivante
  _readUtter = u; _storyUtter = u;
  try{ window.speechSynthesis.speak(u); }catch(e){ _readActive=false; }
 }
 function _bPlay(){
  if(!window.speechSynthesis) return;
  try{ if(window.speechSynthesis.paused){ window.speechSynthesis.resume(); _bSyncPlay(); return; } }catch(e){}
  try{ window.speechSynthesis.cancel(); }catch(e){}
  _readActive = true; _bSpeak(page); _bSyncPlay();         // démarre à la page courante puis enchaîne
 }
 function _bPause(){ try{ if(window.speechSynthesis.speaking && !window.speechSynthesis.paused){ window.speechSynthesis.pause(); _bSyncPlay(); } }catch(e){} }
 function _bStop(){ _readActive=false; _readUtter=null; try{ window.speechSynthesis.cancel(); }catch(e){} _bSyncPlay(); }
 function close(){
  _bStop();
  overlay.classList.add('story-out');
  setTimeout(()=>{ try{ overlay.remove(); }catch(e){} if(onDone) onDone(); }, 300);
 }
 function render(){
  const p = chapter.pages[page];
  const last = page >= chapter.pages.length - 1;
  overlay.innerHTML = `
   <div class="story-parchment">
    <div class="story-title">${chapter.title||''}</div>
    <div class="story-emoji">${p.emoji||'📖'}</div>
    <div class="story-text">${_storyText(p.text)}</div>
    <div class="story-narrate">
     <button class="story-audio-btn snarr-play" title="Écouter l'histoire" aria-label="Lecture">▶</button>
     <button class="story-audio-btn snarr-pause" title="Mettre en pause" aria-label="Pause">⏸</button>
     <button class="story-audio-btn snarr-stop" title="Arrêter la lecture" aria-label="Stop">⏹</button>
    </div>
    <div class="story-nav">
     ${page>0?`<button class="story-btn story-prev">‹</button>`:`<span class="story-spacer"></span>`}
     <div class="story-dots">${chapter.pages.map((_,i)=>`<span class="story-dot${i===page?' on':''}"></span>`).join('')}</div>
     <button class="story-btn story-next">${last?'Commencer ! ⚔️':'Suivant ›'}</button>
    </div>
    ${!last?`<button class="story-skip">Passer l'histoire</button>`:''}
   </div>`;
  const nx = overlay.querySelector('.story-next');
  if(nx) nx.onclick = ()=>{ _bStop(); if(!last){ page++; render(); } else close(); };
  const pv = overlay.querySelector('.story-prev');
  if(pv) pv.onclick = ()=>{ _bStop(); if(page>0){ page--; render(); } };
  const sk = overlay.querySelector('.story-skip');
  if(sk) sk.onclick = close;
  const _pl = overlay.querySelector('.snarr-play');  if(_pl){ _pl.onclick = _bPlay; if(_readActive) _pl.classList.add('reading'); }
  const _pa = overlay.querySelector('.snarr-pause'); if(_pa) _pa.onclick = _bPause;
  const _st = overlay.querySelector('.snarr-stop');  if(_st) _st.onclick = _bStop;
  if(!_readActive && typeof beep==='function'){ try{ beep(520,'sine',.12,.05); }catch(e){} }
 }
 render();
 document.body.appendChild(overlay);
}
function _markStorySeen(id){
 if(typeof P==='undefined' || !P) return;
 P.storySeen = P.storySeen || [];
 if(!P.storySeen.includes(id)){
  P.storySeen.push(id);
  if(typeof saveProfile==='function') saveProfile();
 }
}
// Une région est « conquise » quand toutes ses zones sont battues (cohérent avec
// la détection de conquête d'îlot du moteur). Extensible via _ARCH_REGIONS/MAP_ZONES.
// v10.2.0 — Helpers génériques zone↔région (compatibles 3 aventures).
// Les zones des nouvelles aventures portent z.region ; le primaire se résout
// par niveau (+ cas sanctuaire). Toute logique de région DOIT passer par ici.
function _regionOfZone(zone){
 if(!zone) return null;
 if(zone.region) return _ARCH_REGIONS.find(r => r.id === zone.region) || null;
 if(zone.id === 'sanctuaire') return _ARCH_REGIONS.find(r => r.id === 'final') || null;
 return _ARCH_REGIONS.find(r => r.levels.includes(zone.level) && r.id !== 'final') || null;
}
function _zonesOfRegion(regionId){
 const reg = _ARCH_REGIONS.find(r => r.id === regionId);
 if(!reg) return [];
 return MAP_ZONES.filter(z => {
  if(z.region) return z.region === reg.id;
  if(reg.id === 'final') return z.id === 'sanctuaire';
  return reg.levels.includes(z.level) && z.id !== 'sanctuaire';
 });
}
// Dernière région de l'aventure active (porte l'épilogue)
function _lastRegionId(){
 try{ return _ARCH_REGIONS[_ARCH_REGIONS.length-1].id; }catch(e){ return 'final'; }
}

function _regionConquered(regionId){
 try{
  const zones = _zonesOfRegion(regionId);
  if(!zones.length) return false;
  const beaten = (typeof P!=='undefined' && P && P.mapBossBeaten) ? P.mapBossBeaten : [];
  return zones.every(z => beaten.includes(z.id));
 }catch(e){ return false; }
}
// v10.13.6 — Accessibilité d'une zone, avec garde anti-soft-lock : si la zone
// précédente est battue ET qu'on franchit une frontière de région entièrement
// conquise, la 1re zone de la région suivante est TOUJOURS jouable, sans exiger
// le palier d'étoiles (sinon un joueur peu scoreur reste bloqué entre deux îles).
function _zoneReachable(p, beaten, starsTotal){
 try{
  const idx = p.zoneIdx;
  const prevZone = idx > 0 ? MAP_ZONES[idx-1] : null;
  const prev = idx === 0 || (prevZone && beaten.includes(prevZone.id));
  if(!prev) return false;
  if(starsTotal >= p.zone.starsReq) return true;
  if(prevZone && prevZone.region && p.zone.region && prevZone.region !== p.zone.region && _regionConquered(prevZone.region)) return true;
  return false;
 }catch(e){ return false; }
}
// Déclencheur principal : prologue, puis victoire de Cristal, puis épilogue, puis chapitre d'entrée.
function _maybeShowStory(){
 if(typeof P==='undefined' || !P) return;
 P.storySeen = P.storySeen || [];
 // 1) Prologue, une seule fois, au tout début
 const _introId = (_STORY.intro && _STORY.intro.id) || 'intro';
 if(!P.storySeen.includes(_introId)){
  _markStorySeen(_introId);
  _showStoryModal(_STORY.intro, null);
  return;
 }
 // 2) Scène de victoire : une région vient d'être conquise et son Cristal n'a pas été célébré
 try{
  for(const r of _ARCH_REGIONS){
   if(r.id === _lastRegionId()) continue;         // la dernière région → épilogue, géré plus bas
   const win = _STORY.victories && _STORY.victories[r.id];
   if(win && !P.storySeen.includes(win.id) && _regionConquered(r.id)){
    _markStorySeen(win.id);
    _showStoryModal(win, null);
    return;
   }
  }
 }catch(e){}
 // 3) Épilogue : le Sanctuaire Final est conquis
 try{
  if(_STORY.epilogue && !P.storySeen.includes(_STORY.epilogue.id) && _regionConquered(_lastRegionId())){
   _markStorySeen(_STORY.epilogue.id);
   // Si l'aventure a une « histoire du Livre » (Histoire B), elle s'enchaîne juste
   // après l'épilogue, en récompense.
   const _after = (_STORY.bookTale) ? (function(){ try{ _markStorySeen(_STORY.bookTale.id); _showStoryModal(_STORY.bookTale, null); }catch(e){} }) : null;
   _showStoryModal(_STORY.epilogue, _after);
   return;
  }
 }catch(e){}
 // 4) Chapitre d'entrée de la région où se trouve l'avatar (si pas encore vu)
 try{
  const avZone = MAP_ZONES.find(z => z.id === _getAvatarZone());
  if(!avZone) return;
  const reg = (typeof _regionOfZone==='function') ? _regionOfZone(avZone) : _ARCH_REGIONS.find(r => r.levels.includes(avZone.level));
  if(!reg) return;
  const chap = _STORY.chapters[reg.id];
  if(chap && !P.storySeen.includes(chap.id)){
   _markStorySeen(chap.id);
   _showStoryModal(chap, null);
  }
 }catch(e){}
}

// ═══════════════════════════════════════════════════════
// v8.7.69 (O5) : JOURNAL DE QUÊTE — relire les chapitres de l'histoire.
// Panneau fixe à droite de la carte (symétrique à la mini-map) + section dans
// le carnet d'aventure. Chaque chapitre est relisable s'il est débloqué (région
// atteinte), verrouillé (🔒) sinon. Extensible : suit _ARCH_REGIONS / _STORY.
// ═══════════════════════════════════════════════════════
let _questUnlockedCache = {};
// Liste ordonnée des entrées du journal : prologue, puis pour chaque région son
// chapitre d'arrivée ET sa victoire de Cristal, enfin l'épilogue. Extensible.
// v10.2.3 — Vocabulaire du livre de quête PAR AVENTURE (les libellés "Cristal",
// "Région" venaient du primaire et s'affichaient aussi en maternelle/collège).
function _questVocab(){
 const adv = (typeof GM!=='undefined' && GM && GM.adventure) || 'prim';
 if(adv==='mat') return { icon:'🌈', lockCollect:'🌈 Couleur à retrouver', collected:'Couleur retrouvée', region:'Île à atteindre', end:'Arc-en-ciel à compléter' };
 if(adv==='matfr') return { icon:'📖', lockCollect:'📖 Page à retrouver', collected:'Page retrouvée', region:'Monde à atteindre', end:'Livre à compléter' };
 if(adv==='primfr') return { icon:'🎖️', lockCollect:'🎖️ District à libérer', collected:'District libéré', region:'District à atteindre', end:'Insigne à compléter' };
 if(adv==='colfr') return { icon:'📚', lockCollect:'📚 Tome à conquérir', collected:'Tome conquis', region:'Livre à atteindre', end:'Bibliothèque à compléter' };
 if(adv==='col') return { icon:'🛡️', lockCollect:'🛡️ Pièce à forger',     collected:'Pièce forgée',    region:'Îlot à atteindre',  end:'Forge finale à débloquer' };
 return { icon:'💎', lockCollect:'💎 Cristal à libérer', collected:'Cristal libéré', region:'Région à atteindre', end:'Fin à débloquer' };
}
function _questEntries(){
 const vocab = _questVocab();
 const _introId=(_STORY.intro&&_STORY.intro.id)||'intro';
 const entries = [{ id:_introId, kind:'intro', label:'📜', regionId:null, color:'#c9a86a' }];
 const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
 let i = 0;
 _ARCH_REGIONS.forEach(r => {
  const chap = _STORY.chapters[r.id];
  if(!chap) return;
  const meta = _BIOME_BANNER_META[r.id] || {};
  const col = meta.accent || '#888';
  entries.push({ id:chap.id, kind:'chapter', label:(roman[i]||String(i+1)), regionId:r.id, color:col });
  const win = _STORY.victories && _STORY.victories[r.id];
  if(win) entries.push({ id:win.id, kind:'victory', label:vocab.icon, regionId:r.id, color:col });
  i++;
 });
 if(_STORY.epilogue) entries.push({ id:_STORY.epilogue.id, kind:'epilogue', label:'🏆', regionId:'final', color:'#ffd700' });
 return entries;
}
function _chapterUnlocked(entry, foggedMap){
 const seen = (typeof P!=='undefined' && P && Array.isArray(P.storySeen)) ? P.storySeen : [];
 if(seen.includes(entry.id)) return true;                       // déjà vu → relisable
 if(entry.kind === 'intro')   return !!(foggedMap && _ARCH_REGIONS[0] && !foggedMap[_ARCH_REGIONS[0].id]) || _ARCH_REGIONS.some(function(r){return _regionConquered(r.id);});
 if(entry.kind === 'chapter') return !!(entry.regionId && foggedMap && !foggedMap[entry.regionId]); // région atteinte
 if(entry.kind === 'victory') return _regionConquered(entry.regionId);   // Cristal mérité = région conquise
 if(entry.kind === 'epilogue')return _regionConquered('final');
 return false;
}
function _refreshQuestJournal(foggedMap){
 const q = document.getElementById('quest-body');
 if(!q) return;
 _questUnlockedCache = {};
 const _qv = _questVocab();
 const rows = _questEntries().map(e => {
  const unlocked = _chapterUnlocked(e, foggedMap);
  _questUnlockedCache[e.id] = unlocked;
  const chap = _findChapter(e.id);
  let label;
  if(unlocked && chap) label = chap.title;
  else if(e.kind === 'victory') label = _qv.lockCollect;
  else if(e.kind === 'chapter') label = _qv.region;
  else if(e.kind === 'epilogue') label = _qv.end;
  else label = 'Verrouillé';
  return `<div class="drawer-row${unlocked?'':' locked'}" style="--row-c:${e.color};" `
       + (unlocked?`onclick="_replayChapter('${e.id}')"`:'') + ` role="button" `
       + `title="${unlocked?'Relire ce chapitre':'Chapitre verrouillé'}">`
       + `<div class="drawer-row-badge">${unlocked?e.label:'🔒'}</div>`
       + `<div class="drawer-row-label">${label}</div>`
       + `</div>`;
 }).join('');
 q.innerHTML = rows;
}
// v9.0.1 : ouvre/ferme un panneau déroulant VERTICAL (mini-carte / livre d'aventure)
function _toggleDrawer(name){
 const el = document.getElementById('drawer-'+name);
 const btn = document.getElementById('btn-'+name);
 if(!el) return;
 const open = el.classList.toggle('open');
 if(btn) btn.classList.toggle('drawer-open', open);
 // v10.2.1 : à l'ouverture, reconstruire le contenu depuis l'aventure courante
 if(open){
  try{
   if(name==='minimap' && typeof _refreshMiniMap==='function') _refreshMiniMap(_lastActiveRegionId, _lastFog, null, (typeof P!=='undefined'&&P&&P.avatar)||'🧙');
   if(name==='quest' && typeof _refreshQuestJournal==='function') _refreshQuestJournal(_lastFog);
  }catch(e){}
 }
 if(typeof beep==='function'){ try{ beep(open?520:320,'sine',.08,.04); }catch(e){} }
}
// Retrouve un chapitre par son id (intro, chap_xxx, win_xxx, epilogue)
function _findChapter(id){
 if(_STORY.intro && _STORY.intro.id === id) return _STORY.intro;
 if(id === 'intro') return _STORY.intro;
 if(_STORY.epilogue && _STORY.epilogue.id === id) return _STORY.epilogue;
 for(const k in _STORY.chapters){ if(_STORY.chapters[k].id === id) return _STORY.chapters[k]; }
 if(_STORY.victories){ for(const k in _STORY.victories){ if(_STORY.victories[k].id === id) return _STORY.victories[k]; } }
 return null;
}
function _replayChapter(id){
 if(!_questUnlockedCache[id]){
  if(typeof beep==='function'){ try{ beep(180,'square',.12,.06); }catch(e){} }
  return; // verrouillé
 }
 const chap = _findChapter(id);
 if(chap) _showStoryModal(chap, null);
}

// v8.7.69 (O5) : HTML de la section « Journal de quête » dans le carnet d'aventure
function _questJournalCarnetHtml(){
 const entries = _questEntries();
 const _qv = _questVocab();
 const seen = (typeof P!=='undefined' && P && Array.isArray(P.storySeen)) ? P.storySeen : [];
 const items = entries.map(e => {
  const cached = _questUnlockedCache[e.id];
  const unlocked = (cached !== undefined) ? cached : seen.includes(e.id);
  const chap = _findChapter(e.id);
  const title = chap ? chap.title : '';
  let sub = '';
  if(e.kind === 'intro') sub = "Le commencement de l'odyssée";
  else if(e.kind === 'chapter'){ const reg = _ARCH_REGIONS.find(r => r.id === e.regionId); sub = 'Arrivée' + (reg ? (' — ' + reg.label) : ''); }
  else if(e.kind === 'victory') sub = (chap && chap.crystal) ? (_qv.icon + ' ' + chap.crystal) : _qv.collected;
  else if(e.kind === 'epilogue') sub = "Le dénouement de l'aventure";
  let lockedLabel = 'Chapitre verrouillé';
  if(e.kind === 'victory') lockedLabel = _qv.lockCollect;
  else if(e.kind === 'chapter') lockedLabel = _qv.region;
  else if(e.kind === 'epilogue') lockedLabel = _qv.end;
  return `<div class="advlog-quest-item${unlocked?'':' locked'}" `
       + (unlocked?`onclick="closeAdventureLog();setTimeout(()=>_replayChapter('${e.id}'),320);"`:'')
       + `>`
       + `<div class="advlog-quest-badge" style="background:${unlocked?e.color:'#777'};">${unlocked?e.label:'🔒'}</div>`
       + `<div><div class="advlog-quest-label">${unlocked?title:lockedLabel}</div>`
       + `${(unlocked&&sub)?`<div class="advlog-quest-sub">${sub}</div>`:''}</div>`
       + `</div>`;
 }).join('');
 return `<div class="advlog-quest">`
      + `<button class="advlog-accordion-btn" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open');">📜 Journal de quête <span class="drawer-caret">▾</span></button>`
      + `<div class="advlog-accordion"><div class="advlog-quest-list">${items}</div></div>`
      + `</div>`;
}

// ═══════════════════════════════════════════════════════
// v9.0.5 (anti-jank) : GELER l'arrière-plan animé quand une modale est ouverte.
// La carte porte ~89 animations en boucle (PNJ, météo, décors, parallaxe...).
// Tant qu'une modale (zone, livre, carnet, boutique...) est affichée par-dessus,
// on masque + fige toute la vue carte : le GPU n'a plus rien à recomposer
// derrière l'overlay → fin de la recomposition par tuiles (clignotement).
(function(){
 const OVERLAYS = '.archipel-zoom-overlay,.story-overlay,.advlog-overlay,.archipel-shop-overlay,#hero-evolution-overlay,.figurine-overlay,.bosscard-overlay';
 function sync(){
  try{
   const hasOverlay = !!document.querySelector(OVERLAYS);
   document.body.classList.toggle('has-overlay', hasOverlay);
  }catch(e){}
 }
 if(typeof MutationObserver !== 'undefined' && document.body){
  const mo = new MutationObserver(sync);
  mo.observe(document.body, { childList:true });
  sync();
 }
})();

// ═══════════════════════════════════════════════════════
// v9.0.6 (O5) : CARTES DE BOSS — recto (portrait) / verso (biographie).
// Cliquer un boss vaincu dans le carnet ouvre sa carte, qui se retourne au clic.
// Biographies cohérentes avec l'univers (gardiens corrompus par le Comte Zéro).
// Extensible : ajouter une zone → ajouter une entrée ici (sinon bio générique).
// ═══════════════════════════════════════════════════════
const _BOSS_BIOS = {
 plaine:"Jadis gardien bienveillant des troupeaux, le Loup des Plaines hurlait pour rassembler les moutons égarés. Le Comte Zéro a empoisonné son cœur, et il s'est mis à brouiller les comptes des bergers. Vaincu, il a retrouvé toute sa noblesse d'antan.",
 village:"Le fier coq qui réveillait le Village Joyeux à l'heure pile, chaque matin. Corrompu, il chantait à n'importe quelle heure et semait la pagaille dans les horaires. Sa défaite a rendu au village ses matins réglés comme une horloge.",
 prairie:"Souveraine de la Prairie Fleurie, elle organisait ses ruches à l'abeille près. La magie du Comte Zéro l'a rendue furieuse, et ses abeilles comptaient tout de travers. Libérée, elle butine de nouveau en parfaite harmonie.",
 bonbons:"Une simple douceur transformée en monstre sucré par le Comte Zéro. Il volait les friandises des enfants pour brouiller leurs additions gourmandes. Vaincu, il est redevenu un délicieux donut tout à fait inoffensif.",
 foret:"Protecteur millénaire de la Forêt Enchantée, ce dragon veillait sur chaque arbre. Corrompu, son souffle brûlait les chiffres gravés dans l'écorce des troncs. Apaisé, il veille à nouveau sur la grande canopée.",
 champignons:"Lent mais très sage, il comptait patiemment les spores de la Vallée des Champignons. La corruption l'a rendu visqueux et grognon, embrouillant tous les sentiers. Vaincu, il reprend enfin sa route tranquille.",
 trolls:"Le plus costaud des trolls, gardien des vieux ponts de la forêt. Le Comte Zéro lui a soufflé de réclamer des péages impossibles à calculer. Battu, il laisse de nouveau passer les voyageurs en souriant.",
 plage:"Roi des sables de la Plage Ensoleillée, il rangeait les coquillages par dizaines bien alignées. Corrompu, il pinçait quiconque osait compter juste. Vaincu, il retourne paisiblement à ses châteaux de sable.",
 desert:"Sentinelle brûlante du Désert de Feu, son dard traçait des chiffres dans le sable chaud. La magie noire l'a rendu venimeux et confus. Apaisé, il garde de nouveau les précieuses oasis.",
 plaines_venteuses:"Sa course faisait gronder les Plaines Venteuses comme un véritable orage. Corrompu, il piétinait les nombres au grand galop. Vaincu, son tonnerre n'effraie plus que les nuages.",
 temple:"Statue éveillée du Temple Antique, gardienne d'énigmes oubliées depuis des siècles. Le Comte Zéro a effacé les réponses gravées dans sa mémoire de pierre. Vaincu, il révèle de nouveau ses secrets aux esprits dignes.",
 profondeurs:"Colosse des Profondeurs Océanes, ses tentacules comptaient les courants marins. Corrompu, il créait des tourbillons de chiffres affolés. Apaisé, il sombre paisiblement au fond des abysses.",
 glace:"Gardien gelé des Pics de Glace, il sculptait des flocons d'une symétrie parfaite. La corruption a figé son cœur et brouillé tous ses cristaux. Vaincu, sa banquise scintille de nouveau.",
 marais:"Chacune de ses têtes comptait une partie du Marais Lugubre. Le Comte Zéro les a fait se contredire sans cesse les unes les autres. Vaincue, l'Hydre raisonne enfin d'une seule et même voix.",
 forteresse:"Défenseur d'acier de la Forteresse Médiévale, nul ne franchissait ses remparts sans résoudre ses défis. Corrompu, il emprisonnait les voyageurs dans des calculs sans fin. Battu, il rouvre grand ses portes.",
 sakura:"Ombre véloce du Mont Sakura, il comptait ses shurikens plus vite que l'éclair. La corruption a troublé sa concentration légendaire. Vaincu, il s'incline avec un profond respect.",
 nocturne:"Maître du Royaume Nocturne, il comptait les étoiles pour endormir le monde entier. Corrompu, il volait le sommeil en mélangeant les nombres. Vaincu, la nuit retrouve toute sa douceur.",
 volcan:"Né du cœur brûlant du Volcan Maudit, il forgeait les nombres dans la lave en fusion. La magie du Comte Zéro a attisé sa colère ardente. Apaisé, sa flamme réchauffe sans plus jamais détruire.",
 espace:"Voyageur de la Galaxie Infinie, il calculait à la vitesse de la lumière. Corrompu, il dispersait les chiffres aux quatre coins du cosmos. Vaincu, il repart explorer les étoiles en paix.",
 cimes:"Aigle colossal régnant sur les Cimes Vertigineuses, son regard portait jusqu'à l'infini. La corruption a obscurci sa vue autrefois si perçante. Libéré, il plane de nouveau au-dessus des nuages.",
 mecanique:"Chef-d'œuvre de la Cité Mécanique, ses milliers de rouages calculaient sans la moindre erreur. Le Comte Zéro a déréglé ses engrenages délicats. Réparé, il bourdonne de nouveau avec une précision parfaite.",
 ile:"Spectre d'un vieux pirate hantant l'Île Mystérieuse, il comptait un trésor introuvable. Corrompu, il enterrait les nombres comme autant de butins. Vaincu, il trouve enfin le repos qu'il cherchait.",
 sanctuaire:"Ultime gardien du Sanctuaire, gigantesque colosse né de la magie du Comte Zéro lui-même. Il veille sur le cœur du royaume et sur le dernier secret de Calcultopia. Le vaincre ouvre la voie vers la vérité finale.",
};
function _bossBio(zoneId){
 return _BOSS_BIOS[zoneId] || "Un gardien corrompu par le Comte Zéro de Cafouillac, qui veillait jadis sur sa contrée. Vaincu par ton courage, il a retrouvé la paix et rendu sa lumière à Calcultopia.";
}
const _BOSS_CARD_ACCENT = {
 CP:'#6ab04c', CE1:'#2f8f5b', CE2:'#d68a3a', CM1:'#7d8fa6', CM2:'#7a4fc0', FINAL:'#caa92a',
};
function _openBossCard(zoneId){
 const z = (typeof MAP_ZONES!=='undefined') ? MAP_ZONES.find(x => x.id === zoneId) : null;
 if(!z) return;
 const accent = _BOSS_CARD_ACCENT[z.level] || '#b8893f';
 const emoji = z.boss || '🏆';
 const name = z.bossName || 'Gardien';
 const zone = z.label || '';
 const lvl = z.level || '';
 const bio = _bossBio(zoneId);
 const overlay = document.createElement('div');
 overlay.className = 'bosscard-overlay';
 overlay.innerHTML = `
  <button class="bosscard-close" aria-label="Fermer">✕</button>
  <div class="bosscard" role="button" tabindex="0" title="Touche la carte pour la retourner">
   <div class="bosscard-inner" style="--bc-accent:${accent};">
    <div class="bosscard-face bosscard-front">
     <div class="bosscard-badge">BOSS VAINCU 🏆</div>
     <div class="bosscard-portrait">${emoji}</div>
     <div class="bosscard-name">${name}</div>
     <div class="bosscard-zone">${zone}${lvl?` · ${lvl}`:''}</div>
     <div class="bosscard-flip-hint">↺ Touche pour lire son histoire</div>
    </div>
    <div class="bosscard-face bosscard-back">
     <div class="bosscard-back-head"><span class="bosscard-back-emoji">${emoji}</span><span class="bosscard-back-name">${name}</span></div>
     <div class="bosscard-bio">${bio}</div>
     <div class="bosscard-flip-hint">↺ Touche pour revenir</div>
    </div>
   </div>
  </div>`;
 const card = overlay.querySelector('.bosscard');
 card.addEventListener('click', () => card.classList.toggle('flipped'));
 overlay.querySelector('.bosscard-close').addEventListener('click', (e) => { e.stopPropagation(); _closeBossCard(overlay); });
 overlay.addEventListener('click', (e) => { if(e.target === overlay) _closeBossCard(overlay); });
 document.body.appendChild(overlay);
 requestAnimationFrame(() => overlay.classList.add('show'));
 if(typeof beep==='function'){ try{ beep(440,'sine',.1,.05); }catch(e){} }
}
function _closeBossCard(overlay){
 overlay.classList.remove('show');
 setTimeout(() => { try{ overlay.remove(); }catch(e){} }, 280);
}
