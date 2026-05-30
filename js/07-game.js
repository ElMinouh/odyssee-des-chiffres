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
 renderMap();
 // Chantier B3 : démarrer la parallaxe une fois le DOM stabilisé
 setTimeout(()=>{
  if(typeof initMapParallax==='function') initMapParallax();
 }, 50);
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
const _ARCH_REGIONS = [
 { id:'cp',    label:'Région des Débuts',     levels:['CP'],  shape:'colline' },
 { id:'ce1',   label:'Bois et Plages',         levels:['CE1'], shape:'feuille' },
 { id:'ce2',   label:'Terres d\'Aventure',     levels:['CE2'], shape:'dune' },
 { id:'cm1',   label:'Royaumes Périlleux',     levels:['CM1'], shape:'citadelle' },
 { id:'cm2',   label:'Au-delà des Étoiles',    levels:['CM2'], shape:'nebuleuse' },
 { id:'final', label:'Sanctuaire Final',       levels:['FINAL'], shape:'mandala' },
];

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
 const meta = _BIOME_BANNER_META[regionId];
 if(!meta) return;
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
   <div class="biome-banner-name" style="color:${meta.accent};">${meta.subtitle}</div>
  </div>
  <div class="biome-banner-emoji">${meta.emoji}</div>
 `;
 document.body.appendChild(banner);
 // v8.7.48 : signature sonore du biome (jingle court synthétisé)
 _playRegionSignature(regionId);
 // Narration vocale discrète : annonce du nouveau biome (après le jingle)
 if(typeof speak === 'function'){
  setTimeout(()=>{ try{ speak(meta.subtitle); }catch(e){} }, 850);
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
  { emoji:'🧙‍♂️', name:'Maître Élio',   line:'Bienvenue, jeune aventurier ! Les chiffres seront tes alliés.' },
  { emoji:'🐑',   name:'Berger Pâquerette', line:'Mes moutons savent compter… presque aussi bien que toi !' },
 ],
 ce1: [
  { emoji:'🧚',   name:'Fée Lumelle',   line:'Les forêts murmurent les tables de multiplication, écoute-les !' },
  { emoji:'🦌',   name:'Cerf Sylvain',  line:'Avance avec sagesse, brave héros. Chaque pas compte.' },
 ],
 ce2: [
  { emoji:'🧞',   name:'Génie Sablo',   line:'Trois vœux pour qui résout trois énigmes ! Mais d\'abord, prouve-toi.' },
  { emoji:'🦅',   name:'Aigle Vent-Pur', line:'Mes ailes connaissent tous les nombres du désert.' },
 ],
 cm1: [
  { emoji:'🛡️',  name:'Sir Cassel',    line:'Halte ! Seuls les vrais mathématiciens passent par cette voie.' },
  { emoji:'🧝',   name:'Elfe Veylis',   line:'Les anciens calculs sont gravés dans la pierre des montagnes.' },
 ],
 cm2: [
  { emoji:'👽',   name:'Zorbax du Nébula', line:'Bzzip ! Tes équations résonnent dans toute la galaxie.' },
  { emoji:'🪐',   name:'Sage Cosmik',    line:'L\'univers entier est un théorème. Décompose-le.' },
 ],
 final: [
  { emoji:'🦄',   name:'Licorne Astralia', line:'Tu es arrivé jusqu\'ici. Le Sanctuaire t\'observe.' },
  { emoji:'🕊️',  name:'Esprit Aelune',  line:'Les nombres sacrés t\'attendent. Sois digne.' },
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
   if(region.id==='final') return z.id==='sanctuaire';
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
 const currentZoneId = P.mapAvatarZone || 'plaine';
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
 P.mapAvatarZone = zoneId;
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
 let avatarZoneId = P.mapAvatarZone || 'plaine';
 if(!MAP_ZONES.find(z=>z.id===avatarZoneId)){ avatarZoneId = 'plaine'; P.mapAvatarZone = 'plaine'; }
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
  const anyAccessible = zonesOfRegion.some(p => {
   const idx = p.zoneIdx;
   const prev = idx === 0 || beaten.includes(MAP_ZONES[idx-1].id);
   return prev && (starsTotal >= p.zone.starsReq);
  });
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
 // Noms de régions : utiliser regionTitleY (positions calculées avec espace réservé)
 const titleByRegion = {};
 (layout.regionTitleY || []).forEach(rt => { titleByRegion[rt.regionId] = rt.y; });
 const regionNamesHtml = _ARCH_REGIONS.map(r=>{
  const ty = titleByRegion[r.id];
  if(ty === undefined) return '';
  const foggedCls = _islandFogged[r.id] ? ' island-fogged' : '';
  return `<div class="archipel-region-name${foggedCls}" data-region="${r.id}" style="top:${ty}px;">${r.label}</div>`;
 }).join('');
 // Générer les nœuds de zones
 const zonesHtml = positions.map(p=>{
  const z = p.zone;
  const idx = p.zoneIdx;
  const prev = idx===0 || beaten.includes(MAP_ZONES[idx-1].id);
  const done = beaten.includes(z.id);
  const canPlay = prev && (starsTotal >= z.starsReq);
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
  <div class="archipel-logbook" onclick="openAdventureLog()" title="Carnet d'aventure" role="button">📖</div>
  <div class="archipel-compass" onclick="_spinCompass(this)" title="Boussole">🧭</div>
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
 // v8.7.48 (O3-C.5) : signature sonore de la région où se trouve l'avatar, jouée
 // à l'ouverture de la carte. Cooldown de 30s pour éviter la répétition si on
 // ouvre/ferme rapidement la carte.
 try{
  const avatarZone = MAP_ZONES.find(z => z.id === avatarZoneId);
  if(avatarZone){
   const avatarRegion = _ARCH_REGIONS.find(r => r.levels.includes(avatarZone.level));
   if(avatarRegion){
    const now = Date.now();
    if(!_lastRegionSignatureTime || (now - _lastRegionSignatureTime) > 30000){
     _lastRegionSignatureTime = now;
     setTimeout(() => _playRegionSignature(avatarRegion.id), 350);
    }
   }
  }
 }catch(e){}
}
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
 cont.classList.remove('zoom-overview','zoom-default','zoom-close');
 cont.classList.add('zoom-'+_mapZoom);
 // v8.7.49 : ajuster la hauteur de la box pour que le scroll de page suive le scale.
 // transform:scale ne modifie pas la box → sans ça, en vue rapprochée le bas serait
 // coupé, et en vue d'ensemble il resterait un grand vide.
 const scale = _mapZoom==='overview' ? 0.62 : _mapZoom==='close' ? 1.3 : 1;
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
                  : 'Vue régions';
 }
}
function mapZoomIn(){
 _mapZoom = _mapZoom==='overview' ? 'default' : 'close';
 _applyMapZoom();
}
function mapZoomOut(){
 _mapZoom = _mapZoom==='close' ? 'default' : 'overview';
 _applyMapZoom();
}
function mapCenterOnAvatar(){
 _autoCenterOnAvatar(true);
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
 // Mouvement actif uniquement si toggle ON et pas reduced-motion
 const enabled = (typeof getParallaxEnabled==='function') ? getParallaxEnabled() : true;
 if(enabled){
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
    ${KNOWN.map(n=>`<option value="${esc(n)}"${n===p.name?' selected':''}>${esc(n)}</option>`).join('')}
    <option value="__c__"${!KNOWN.includes(p.name)?' selected':''}>✏️ Autre…</option>
   </select>
   ${!KNOWN.includes(p.name)?`<input type="text" placeholder="Prénom…" value="${esc(p.name)}" maxlength="16" oninput="combatCfg[${i}].name=this.value" style="flex:1;">`:''}
   <select onchange="combatCfg[${i}].level=this.value" style="flex:.8;">
    ${['CP','CE1','CE2','CM1','CM2'].map(l=>`<option value="${l}"${l===p.level?' selected':''}>${l}</option>`).join('')}
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
 $('hud-chrono').classList.toggle('hidden',GM.mode2!=='chrono');
 $('hud-combo').classList.add('hidden');
 $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
 $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
  toggleNumpadForMode(GM.mode);
 $('BODY').classList.remove('body-alert');
 if(GM.mode2==='chrono')startChrono();else stopChrono();
 nextTurn();
}
function startRevision(){
 loadProfile();const unique=[...new Set(P.errors||[])].filter(e=>/^\d/.test(e));
 if(!unique.length){alert('Aucune erreur à réviser !');return;}
 gameActive=true;clearPendingTimers();
 revQueue=[...unique,...unique];isRevision=true;
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
  showMonsterIntro(bossM,renderQ);
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
  const e=revQueue.shift();const m=e.match(/^(\d+)([+\-x×\/÷])(\d+)=(\d+)$/);
  if(m)return{a:+m[1],b:+m[3],op:m[2],res:+m[4],type:'normal',opKey:m[2],display:`${m[1]} ${m[2]} ${m[3]}`,img:''};
 }
 // Chantier 1.2 : révision espacée en mode normal (pas en boss ni en combat/révision)
 if(GM.mode2==='normal' && !GS.isBoss && typeof getRevisionErrorToAsk==='function'){
  const rev = getRevisionErrorToAsk();
  if(rev) return rev;
 }
 const fn=GEN[GM.level]||GEN.CP;let q=fn(GS.isBoss);
 if(GS.activeEvent?.effect==='next_golden'){GS.isGolden=true;GS.activeEvent=null;}
 return q;
}
function getSkin(){const s=SKINS.find(x=>x.id===(P.equippedSkin||'default'))||SKINS[0];return s.m;}
function renderQ(){
 GS.answering=false;
 // v8.7.53 (O4.2b) : nettoyer les effets d'attaque de la question précédente
 if(typeof _resetBossAttackEffects==='function') _resetBossAttackEffects();
 const q=GS.q;
 const txt=q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res));
 $('question').innerText=txt;$('question').className=GS.isGolden?'gold-q':q.isRevision?'revision-q-inline':'';
 // Chantier 1.2 : petit toast discret quand une question de révision espacée apparaît
 if(q.isRevision && typeof toast==='function') toast('🔁 Révision', 1200);
 $('problem-image').innerText=q.img||'';
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
 $('feedback').innerText='';speak(txt);
 if(GM.mode==='qcm'){
  const correct=q.res;
  const offsets=shuffle([-7,-5,-3,-2,-1,1,2,3,5,7]);
  const opts=[correct];
  for(let i=0;opts.length<4;i++)opts.push(Math.max(0,correct+offsets[i%offsets.length]));
  const dedup=[...new Set(opts)];while(dedup.length<4)dedup.push(dedup[dedup.length-1]+1);
  const qcmEl=$('qcm-options');
  qcmEl.innerHTML=shuffle(dedup).map(o=>`<button class="qcm-btn" data-val="${o}">${o}</button>`).join('');
  qcmEl.onclick=e=>{const b=e.target.closest('.qcm-btn');if(b&&!b.disabled)validate(+b.dataset.val);};
 }else{const ai=$('answer-input');ai.value='';if(!_numpadIsTouch())setTimeout(()=>ai.focus(),100);}
 renderPowerBar();
 if(GM.mode2!=='chrono')startTimer();
 // v8.7.52 (O4.2) : en phase enragée, le boss peut lancer une attaque spéciale
 if(GS.isBoss && GS.bossEnraged && typeof _maybeBossAttack==='function') _maybeBossAttack();
}
function submitAns(){const v=parseInt($('answer-input').value);validate(isNaN(v)?null:v);}
function validate(ans){
 if(!GS.q||GS.answering)return; // guard : question null ou déjà en train de traiter
 GS.answering=true;
 if(GM.mode2==='combat')return validateCombat(ans);
 if(GM.mode2!=='chrono')stopTimer();
 if(ans===null){hitPlayer('Réponse invalide !');return;}
 const q=GS.q;
 if(ans===q.res){
GS.combo++;GS.maxCombo=Math.max(GS.maxCombo,GS.combo);
  // Chantier A4 : flash de milestone à 10/20/30/50
  if([10,20,30,50].includes(GS.combo) && typeof flashComboMilestone==='function'){
   flashComboMilestone(GS.combo);
  }
  // Multiplicateur niveau : plus c'est difficile, plus c'est rentable
  // CP~1-2⭐ CE1~1-3⭐ CE2~2-3⭐ CM1~2-4⭐ CM2~3-5⭐
  const _lvlBase={CP:[1,2],CE1:[1,3],CE2:[2,3],CM1:[2,4],CM2:[3,5]}[GM.level]||[1,2];
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
  const ma=$('monster-area');ma.classList.add('monster-hit');setTimeout(()=>ma.classList.remove('monster-hit'),350);
  // Chantier 3.1 : amplification graduelle selon combo + popups
  const _partN = GS.combo>=10?25:GS.combo>=5?18:12;
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,_partN);
  floatScore(`+${pts} ⭐`, _monsterCenter.x||window.innerWidth/2, _monsterCenter.y||window.innerHeight/2, GS.combo>=5);
  if(COMBO_MILESTONES.has(GS.combo))comboBanner(GS.combo);
  // Monster reacts to being hit
  if(Math.random()<.55)monsterSpeak(CORRECT_TAUNTS[ri(0,CORRECT_TAUNTS.length-1)],1800);
  if(GM.mode==='qcm')markQCM(ans,true);updateHUD();
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
  if(GS.monsterHP>0){$('feedback').innerText=_shieldHeld?`🛡️ Le bouclier résiste ! Frappe encore !`:`✅ TOUCHÉ ! ❤️${GS.monsterHP}/${GS.monsterMaxHP}`;GS.q=generateQ();safeTimeout(()=>{clearMonsterSpeech();renderQ();},800);}
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
  if(q.display&&q.res!==undefined)P.errors=([...(P.errors||[])]).concat(`${q.a||'?'}${q.op||'?'}${q.b||'?'}=${q.res}`).slice(-60);
  // Chantier 1.2 : log dans le registre de révision espacée
  if(typeof logError==='function' && q.display && q.res!==undefined) logError(q.display, q.res);
  // Monster taunts on wrong answer
  monsterSpeak(WRONG_TAUNTS[ri(0,WRONG_TAUNTS.length-1)],2200);
  showCorr(q);if(GM.mode==='qcm')markQCM(ans,false,q.res);hitPlayer('💥 FAUX !');
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
 GS.q=GEN[GM.level](false);$('correction').classList.add('hidden');renderQ();
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
    const _zoneRegion = _ARCH_REGIONS.find(r => r.levels.includes(_zone.level));
    if(_zoneRegion){
     const _zonesOfRegion = MAP_ZONES.filter(z => _zoneRegion.levels.includes(z.level));
     const _allBeaten = _zonesOfRegion.every(z => (P.mapBossBeaten || []).includes(z.id));
     if(_allBeaten) _conqueredRegionId = _zoneRegion.id;
    }
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
 if(won&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone))P.levelWins[GM.level]=(P.levelWins[GM.level]||0)+1;
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
 $('end-enc').innerText=won?msgs[ri(0,msgs.length-1)]:'';
 renderEndStars(computeStars(GS.score,won));
 $('end-badges').innerHTML=newBadges.length?'<p style="color:#f1c40f;margin:3px 0;">🏅 '+newBadges.map(b=>b.e+' '+b.l).join(', ')+'</p>':'';
 const errs=(P.errors||[]).slice(-GS.errInGame);
 $('end-correction').innerHTML=errs.length?'<strong style="color:#e74c3c">❌ Erreurs :</strong><br>'+[...new Set(errs)].map(e=>{const m=e.match(/^(.+?)([+\-x×\/÷])(.+?)=(\d+)$/);return m?`• ${m[1]} ${m[2]} ${m[3]} = <strong>${m[4]}</strong>`:' • '+e;}).join('<br>'):(won?'<span style="color:#2ecc71">✅ Parfait !</span>':'');
 if(won)startConfetti();
 // v8.7.10 : NE PAS reset GM.mapZone ici. Le contexte doit être préservé
 // pour que le bouton "Retour à la carte" sache où retourner.
 // Le reset est désormais fait dans returnMenu/endReplayAction au clic.
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
 // Force le niveau et le mode
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
function openAdventureLog(){
 if(typeof P === 'undefined' || !P) return;
 const beaten = P.mapBossBeaten || [];
 // Couleurs accent par région (réutilise la palette des cinématiques d'îlot)
 const regionAccent = {
  cp:'#a8e6a2', ce1:'#5fb95a', ce2:'#f6cb8b', cm1:'#b6c8d4', cm2:'#cbb1ee', final:'#fff4c0',
 };
 // Progression globale
 const totalZones = MAP_ZONES.length;
 const totalBeaten = MAP_ZONES.filter(z => beaten.includes(z.id)).length;
 const globalPct = totalZones > 0 ? Math.round((totalBeaten / totalZones) * 100) : 0;
 // Progression par région
 const regionRows = _ARCH_REGIONS.map(r => {
  const zonesOfRegion = MAP_ZONES.filter(z => r.levels.includes(z.level));
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
  <div class="advlog-medal" title="${z.bossName || 'Boss'} — ${z.label}">
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
   <div class="advlog-section-title">🗺️ Progression par région</div>
   <div class="advlog-regions">${regionRows}</div>
   <div class="advlog-section-title">🏆 Boss vaincus (${totalBeaten})</div>
   ${bossGallery}
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
 const line = _BOSS_ENRAGE_LINES[Math.floor(Math.random() * _BOSS_ENRAGE_LINES.length)];
 if(typeof monsterSpeak === 'function'){
  try{ monsterSpeak(line, 2600); }catch(e){}
 }
 // Son grave menaçant (descente de notes)
 if(typeof beep === 'function'){
  [220, 185, 155, 130].forEach((f, i) => setTimeout(() => { try{ beep(f, 'sawtooth', .25, .12); }catch(e){} }, i * 90));
 }
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
                  _atkFreeze, _atkScramble, _atkWords, _atkShield, _atkRegen];
 const atk = attacks[Math.floor(Math.random() * attacks.length)];
 try{ atk(); }catch(e){ console.warn('boss attack failed', e); }
}
// 🐉 Rugissement intimidant : zoom sur le boss + son grave + vibration
function _atkRoar(){
 const ma = document.getElementById('monster-area');
 if(ma){ ma.classList.add('boss-roar'); setTimeout(()=>ma.classList.remove('boss-roar'), 750); }
 if(typeof beep === 'function'){
  [140, 115, 95].forEach((f, i) => setTimeout(()=>{ try{ beep(f, 'sawtooth', .3, .13); }catch(e){} }, i * 80));
 }
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
function _resetBossAttackEffects(){
 const numpad = document.getElementById('numpad');
 if(numpad){
  numpad.classList.remove('numpad-frozen','numpad-scrambled');
  _restoreNumpadOrder();
 }
 const ai = document.getElementById('answer-input');
 if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false; }
 const qEl = document.getElementById('question');
 if(qEl) qEl.classList.remove('boss-words-q');
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
  if(ai){ ai.classList.remove('input-frozen'); ai.disabled = false; }
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
 const line = _BOSS_FURY_LINES[Math.floor(Math.random() * _BOSS_FURY_LINES.length)];
 if(typeof monsterSpeak === 'function'){ try{ monsterSpeak(line, 2800); }catch(e){} }
 // Son très grave et menaçant (descente profonde)
 if(typeof beep === 'function'){
  [180, 150, 120, 95, 75].forEach((f, i) => setTimeout(()=>{ try{ beep(f, 'sawtooth', .3, .14); }catch(e){} }, i * 100));
 }
 // Vibration prolongée
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate([80, 40, 80, 40, 80, 40, 140]);
 }
}
