// 07-map.js — L'Odyssée du Savoir
'use strict';

// Carte d'exploration + parallaxe (extrait de 07-game.js) :
// zones, archipel, mini-map, régions, PNJ, météo, décor, boss de carte.

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
  const subj = (typeof GM!=='undefined' && GM && GM.subject) ? GM.subject : 'math';
  let src, alt, lbl;
  if(subj==='fr'){ src='assets/logo-mots.webp?v=1069'; alt="L'Odyssée des Mots"; lbl="L'ODYSSÉE : L'AVENTURE LITTÉRAIRE"; }
  else if(subj==='math'){ src='assets/logo-main.webp?v=1069'; alt="L'Odyssée des Chiffres"; lbl="L'ODYSSÉE : L'AVENTURE MATHÉMATIQUE"; }
  else { src='assets/logo-savoir.webp?v=1069'; alt="L'Odyssée du Savoir"; lbl="L'ODYSSÉE DU SAVOIR"; }
  document.querySelectorAll('img.subj-logo').forEach(function(im){ im.src=src; im.alt=alt; });
  const el = document.getElementById('ody-btn-label');
  if(el) el.textContent = lbl;
  const hdr = document.getElementById('menu2-header'); // logo de la matière en fond de l'en-tête + voile (comme l'accueil)
  if(hdr){ hdr.style.backgroundImage = "url('"+src+"')"; }
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
 if(typeof _setAvatarZone==='function') _setAvatarZone(zoneId); // avatar mémorisé sur la zone jouée
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
 if(typeof _setAvatarZone==='function') _setAvatarZone(zoneId); // avatar déjà sur place → pas de marche depuis le 1er lieu
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
 // Une zone déjà conquise (boss battu) = toutes ses étapes réputées réussies.
 // Évite de refaire les étapes d'un module déjà terminé, et répare les profils
 // dont la progression d'étapes avait été perdue.
 try{
  P.zoneProgress = P.zoneProgress || {};
  if(typeof MAP_ZONES!=='undefined' && Array.isArray(MAP_ZONES)){
   MAP_ZONES.forEach(z=>{
    if(beaten.indexOf(z.id) >= 0){
     const total = (Array.isArray(z.steps) ? z.steps.length : 5);
     const cur = P.zoneProgress[z.id] || { stepsCompleted:0, completed:false };
     if(cur.stepsCompleted < total || !cur.completed){
      P.zoneProgress[z.id] = { stepsCompleted: total, completed: true };
     }
    }
   });
  }
 }catch(e){}
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
  const reqHtml = ''; // progression linéaire : plus de seuil d'étoiles affiché
  const onclick = (canPlay || done) ? `onclick="requestZoneOpen('${z.id}')"` : ''; // 'done' : zone conquise toujours re-jouable
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
