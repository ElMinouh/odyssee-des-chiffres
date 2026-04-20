// 01-core.js — L'Odyssée des Chiffres
'use strict';

// État global, utilitaires de base, gestion des vues, helpers monstres.

// ═══════════════════════════════════════════════════════
// ÉTAT
// ═══════════════════════════════════════════════════════
let P={};
const GM={level:'CP',mode:'keyboard',mode2:'normal',mapZone:null};
const GS={
 pv:3,score:0,combo:0,maxCombo:0,qCount:0,q:null,answering:false,
 isBoss:false,isGolden:false,errInGame:0,fracOk:0,missingOk:0,combatWon:false,mapBossWon:false,
 sessionStart:0,frozen:false,monsterHP:1,monsterMaxHP:1,activeEvent:null,eventLeft:0
};
function resetGS(){
 Object.assign(GS,{pv:3+(P.skills.shield||0),score:0,combo:0,maxCombo:0,qCount:0,q:null,answering:false,
  isBoss:false,isGolden:false,errInGame:0,fracOk:0,missingOk:0,combatWon:false,mapBossWon:false,
  sessionStart:Date.now(),frozen:false,monsterHP:1,monsterMaxHP:1,activeEvent:null,eventLeft:0,
  recentQ:[],bossTypeQ:{}});
}
// Enregistre une question dans l'historique et évite les répétitions
function _trackQ(q){
 GS.recentQ=GS.recentQ||[];
 GS.recentQ.push(q.res+'|'+q.display);
 if(GS.recentQ.length>10)GS.recentQ.shift();
}
function _seenQ(q){
 GS.recentQ=GS.recentQ||[];
 return GS.recentQ.includes(q.res+'|'+q.display);
}
// ── Anti-répétition boss : file shufflée par niveau ──────────────────
function _nextBossType(types,level){
 const unique=[...new Set(types)];
 const key=level||'x';
 if(!GS.bossTypeQ)GS.bossTypeQ={};
 if(!GS.bossTypeQ[key]||GS.bossTypeQ[key].length===0){
  // Fisher-Yates shuffle des types uniques
  const arr=[...unique];
  for(let i=arr.length-1;i>0;i--){
   const j=Math.floor(Math.random()*(i+1));
   [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  // S'assurer que le 1er type != dernier type utilisé
  if(GS.bossTypeQ[key+'_last']&&arr[0]===GS.bossTypeQ[key+'_last']&&arr.length>1){
   const tmp=arr[0];arr[0]=arr[1];arr[1]=tmp;
  }
  GS.bossTypeQ[key]=arr;
 }
 const t=GS.bossTypeQ[key].shift();
 GS.bossTypeQ[key+'_last']=t;
 return t;
}

let combatCfg=[],combatPlayers=[],combatIdx=0;
let powers={};
let isRevision=false,revQueue=[];
let timerRaf=null,timerEnd=0,totalTime=20;
let chronoRaf=null,chronoEnd=0;
let confettiRaf=null;
let audioCtx=null,musicOn=false,musicTimer=null;
let particleRaf=null,particles=[];
let blockClockInterval=null;
// ── Protection timers orphelins ──
let gameActive=false;
const pendingTimers=[];
function safeTimeout(fn,ms){
 const t=setTimeout(()=>{if(gameActive)fn();},ms);
 pendingTimers.push(t);return t;
}
function clearPendingTimers(){pendingTimers.forEach(clearTimeout);pendingTimers.length=0;}

// ── Références DOM mises en cache (OPT-1) ──
// Initialisées dans window.onload après que le DOM est prêt
let _timerBarEl=null,_particleCanvas=null,_particleCtx=null;
function _initCachedDOM(){
 _timerBarEl=$('timer-bar');
 // OPT-2 : canvas particules initialisé une seule fois, redimensionné via resize
 _particleCanvas=$('particle-canvas');
 _particleCanvas.width=window.innerWidth;
 _particleCanvas.height=window.innerHeight;
 _particleCtx=_particleCanvas.getContext('2d');
 window.addEventListener('resize',()=>{
  if(!_particleCanvas)return;
  _particleCanvas.width=window.innerWidth;
  _particleCanvas.height=window.innerHeight;
 },{passive:true});
}


// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const weekKey=()=>{const d=new Date(),j=new Date(d.getFullYear(),0,1);return `${d.getFullYear()}-W${Math.ceil(((d-j)/86400000+j.getDay()+1)/7)}`;};
const fmtDate=()=>{const d=new Date();return `${d.getDate()}/${d.getMonth()+1}`;};
const $=id=>document.getElementById(id);
function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
function pNote(ctx,f,type,dur,vol=0.1){try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,ctx.currentTime);g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur);}catch(e){}}
function beep(f,type='square',dur=.2,vol=.1){try{pNote(getAudio(),f,type,dur,vol);}catch(e){}}
// ═══════════════════════════════════════════════════════
// SYNTHÈSE VOCALE (TTS) — chantier 6.1
// ═══════════════════════════════════════════════════════
const VOICE_KEY='odyssee_voice';
let _frVoice=null;
// Remplace les symboles math par leur prononciation française
function _humanizeForSpeech(t){
 return String(t)
  .replace(/×|x/g,' fois ')
  .replace(/÷|\//g,' divisé par ')
  .replace(/−|-/g,' moins ')
  .replace(/\+/g,' plus ')
  .replace(/=/g,' égale ')
  .replace(/\?/g,' quoi ')
  .replace(/\s+/g,' ').trim();
}
// Choisit la meilleure voix française dispo (appelé 1 fois au boot)
function _pickFrenchVoice(){
 const voices=window.speechSynthesis?.getVoices?.()||[];
 if(!voices.length)return null;
 // Ordre de préférence : Google FR > Microsoft FR > première fr-FR > fallback fr
 const prefs=[
  v=>v.lang==='fr-FR' && /google/i.test(v.name),
  v=>v.lang==='fr-FR' && /microsoft/i.test(v.name),
  v=>v.lang==='fr-FR',
  v=>v.lang?.startsWith('fr'),
 ];
 for(const match of prefs){const f=voices.find(match);if(f)return f;}
 return null;
}
function speak(t){
 if(!$('voiceToggle')?.checked)return;
 if(!window.speechSynthesis)return;
 window.speechSynthesis.cancel();
 const m=new SpeechSynthesisUtterance(_humanizeForSpeech(t));
 m.lang='fr-FR';
 m.rate=0.95; // légèrement ralenti pour les petits
 m.pitch=1;
 if(_frVoice)m.voice=_frVoice;
 try{window.speechSynthesis.speak(m);}catch(e){}
}
function saveVoice(){
 const t=$('voiceToggle');if(!t)return;
 localStorage.setItem(VOICE_KEY,t.checked?'1':'0');
}
function loadVoice(){
 const t=$('voiceToggle');if(!t)return;
 // Activé par défaut ? Non : laissé désactivé sauf si l'utilisateur l'a activé explicitement.
 t.checked=localStorage.getItem(VOICE_KEY)==='1';
}
// Répéter la dernière question à la demande de l'utilisateur
function repeatQuestion(){
 const q=typeof GS!=='undefined'?GS.q:null;if(!q)return;
 const txt=q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res));
 // Forcer la lecture même si voix non activée : user a explicitement demandé
 if(!window.speechSynthesis)return;
 window.speechSynthesis.cancel();
 const m=new SpeechSynthesisUtterance(_humanizeForSpeech(txt));
 m.lang='fr-FR';m.rate=0.95;if(_frVoice)m.voice=_frVoice;
 try{window.speechSynthesis.speak(m);}catch(e){}
}
let toastT=null;
function toast(msg,dur=2200){const el=$('toast');el.innerText=msg;el.classList.remove('hidden');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.add('hidden'),dur);}

// ── PIN sécurisé ──
function hashPin(pin){let h=5381;for(const c of String(pin))h=((h<<5)+h)+c.charCodeAt(0);return(h>>>0).toString(16);}
const DEFAULT_PIN='1234';
function checkStoredPin(input){
 const stored=localStorage.getItem('parentPin');
 // Rien de stocké → code par défaut 1234
 if(!stored)return input===DEFAULT_PIN;
 // Migration : ancienne valeur stockée en clair (4 chiffres)
 if(/^\d{4}$/.test(stored))return input===stored;
 // Valeur hashée (format normal)
 return hashPin(input)===stored;
}
let pinAttempts=0,pinLockUntil=0;

let _monsterCenter={x:0,y:0}; // position précalculée du monstre (OPT-5)
// ═══════════════════════════════════════════════════════
const VIEWS=['v-menu','v-settings','v-game','v-end','v-mult','v-parent','v-map'];
function showView(id){VIEWS.forEach(v=>$(v).classList.toggle('hidden',v!==id));const si=document.querySelector('.settings-icon');if(si)si.classList.toggle('si-hidden',id!=='v-menu');}
function toggleSettings(){
 const open=!$('v-settings').classList.contains('hidden');
 if(open){showView('v-menu');loadProfile();}
 else{showView('v-settings');if($('dash-player-name'))$('dash-player-name').textContent=P.name||'';stab('hero');if($('th-stars'))$('th-stars').textContent=P.stars||0;if($('th-figs'))$('th-figs').textContent=(P.ownedFigurines||[]).length;if($('th-badges'))$('th-badges').textContent=(P.badgesEarned||[]).length;renderSkills();renderBadges();renderQuests();}
}
function closeSettings(){showView('v-menu');loadProfile();}
function stab(name){
 const ts=['hero','scores','stats','levels','revision','avatar','figurines','history'];
 ts.forEach(t=>$('tab-'+t).classList.toggle('hidden',t!==name));
 $('stabs').querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',ts[i]===name));
 if(name==='hero'){
  if($('dash-player-name'))$('dash-player-name').textContent=P.name||'';
  if($('th-stars'))$('th-stars').textContent=P.stars||0;
  if($('th-lvl')){const xp=P.xp||0;let lvl=1;for(let i=0;i<XP_TABLE.length;i++){if(xp>=XP_TABLE[i])lvl=i+2;else break;}$('th-lvl').textContent=lvl;}
  if($('th-figs'))$('th-figs').textContent=(P.ownedFigurines||[]).length;
  if($('th-badges'))$('th-badges').textContent=(P.badgesEarned||[]).length;
 }
 if(name==='revision')renderErrors();
 if(name==='avatar'){renderAvatars();renderVSounds();renderSkins();renderTitles();}
 if(name==='history')renderHistory();
 if(name==='scores'){renderLB();renderRecords();}
 if(name==='stats'){renderChart();renderOpStats();}
 if(name==='levels')renderLevelUnlocks();
 if(name==='figurines')renderFigCollection();
}
function returnMenu(){gameActive=false;clearPendingTimers();clearMonsterSpeech();$('BODY').classList.remove('urgency-bg','body-alert');const heart=$('timer-heart');if(heart)heart.style.display='none';showView('v-menu');loadProfile();}

// ═══════════════════════════════════════════════════════
// MONSTRES — Personnalités & Narration
// ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
const MONSTER_ROSTER={
 CP:[
  {emoji:'🌿',name:'Gobelin Vert',title:'Pilleur des Additions',intro:'Tu crois savoir additionner ? Prouve-le !',anim:'bounce',col:'#27ae60'},
  {emoji:'🍄',name:'Champignan',title:'Roi des Petits Nombres',intro:'Même les champignons te battent !',anim:'pulse',col:'#e74c3c'},
  {emoji:'🐛',name:'Larve Soustrante',title:'Ennemi des Chiffres',intro:'Tes soustractions me font rire…',anim:'slither',col:'#8e44ad'},
  {emoji:'🐝',name:'Abeille Calculette',title:'Gardienne du Total',intro:'Bzzz… te trompe pas !',anim:'float',col:'#f1c40f'},
  {emoji:'🐸',name:'Crapaud Sommeur',title:'Maître des Unités',intro:'J\'additionne les erreurs… tu as l\'air appétissant.',anim:'bounce',col:'#2ecc71'},
 ],
 CE1:[
  {emoji:'🦊',name:'Renard Malin',title:'Chasseur de Sommes',intro:'Aucun calcul ne me résiste, aucun…',anim:'slither',col:'#e67e22'},
  {emoji:'🕷️',name:'Araignée Comptable',title:'Tisseuse d\'Erreurs',intro:'Je tisse mes pièges de chiffres…',anim:'pulse',col:'#8e44ad'},
  {emoji:'🐺',name:'Loup des Tables',title:'Prédateur des CE1',intro:'Mon hurlement va efface tes certitudes !',anim:'shake2',col:'#7f8c8d'},
  {emoji:'🦇',name:'Chauve-Souris Inverse',title:'Maître du Nombre Manquant',intro:'Qu\'est-ce qui manque ici… ?',anim:'float',col:'#2c3e50'},
  {emoji:'🦎',name:'Lézard Subtracteur',title:'Gardien des Différences',intro:'Je dérobe tes points… un à un.',anim:'slither',col:'#16a085'},
 ],
 CE2:[
  {emoji:'🐉',name:'Dragon des Tables',title:'Seigneur des Multiplications',intro:'Connais-tu tes tables ? Je parie que non.',anim:'pulse',col:'#e74c3c'},
  {emoji:'🦂',name:'Scorpion Diviseur',title:'Maître des Divisions',intro:'Je coupe en deux ce que tu crois savoir.',anim:'slither',col:'#c0392b'},
  {emoji:'🦁',name:'Lion Times',title:'Roi des Multiplications',intro:'RUGIS le bon résultat !',anim:'glow',col:'#f39c12'},
  {emoji:'🐊',name:'Croco-Calcule',title:'Mâchoire des CE2',intro:'Je dévore les erreurs de tables.',anim:'bounce',col:'#27ae60'},
  {emoji:'🔥',name:'Ignis',title:'Dévoreur de Calculs',intro:'Je brûlerai tes erreurs en cendres…',anim:'pulse',col:'#e67e22'},
 ],
 CM1:[
  {emoji:'🧌',name:'Troll de Géométrie',title:'Gardien des Formes',intro:'Peux-tu calculer mon périmètre ?',anim:'shake2',col:'#8e44ad'},
  {emoji:'⚡',name:'Éclair Mental',title:'Champion du Calcul Rapide',intro:'Trop lent. Encore trop lent.',anim:'glow',col:'#f1c40f'},
  {emoji:'🤖',name:'Androïde Zéro',title:'Machine à Calculer',intro:'Je calcule en nanosecondes. Et toi ?',anim:'freeze',col:'#3498db'},
  {emoji:'🌋',name:'Volcan Mental',title:'Érupteur de Problèmes',intro:'Chaque erreur réchauffe la lave…',anim:'pulse',col:'#e74c3c'},
  {emoji:'🧊',name:'Cristal Gelé',title:'Maître des Nombres Manquants',intro:'Tes lacunes sont glaciales comme moi.',anim:'freeze',col:'#74b9ff'},
 ],
 CM2:[
  {emoji:'👾',name:'Spectre Décimal',title:'Fantôme des Fractions',intro:'Les fractions te hantent la nuit ?',anim:'float',col:'#9b59b6'},
  {emoji:'🔮',name:'Oracle du Reste',title:'Prophète des Divisions',intro:'Je vois déjà ton erreur venir…',anim:'glow',col:'#8e44ad'},
  {emoji:'💀',name:'Crâne Fractionnaire',title:'Maître des Fractions',intro:'Mourir de honte sur une fraction…',anim:'shake2',col:'#2c3e50'},
  {emoji:'🌀',name:'Vortex Mathématique',title:'Absorbeur de Logique',intro:'Tes certitudes disparaissent ici.',anim:'spin2',col:'#1abc9c'},
  {emoji:'🧿',name:'Œil Omniscient',title:'Voyant des Erreurs',intro:'Je vois chaque hésitation dans ton esprit.',anim:'glow',col:'#e91e8c'},
 ],
};
const BOSS_ROSTER={
 CP:  {emoji:'🐲',name:'Drakon l\'Ancien',title:'Boss Légendaire',intro:'Tu as survécu jusqu\'ici… Impressionnant. Mais moi, je suis INVINCIBLE.',anim:'glow',col:'#e74c3c'},
 CE1: {emoji:'🧟',name:'Zombie Matheux',title:'Boss Redouté',intro:'Je mange les cerveaux… surtout ceux qui ne savent pas calculer.',anim:'shake2',col:'#27ae60'},
 CE2: {emoji:'🦖',name:'Dino-Tables',title:'Boss Titanesque',intro:'Je suis là depuis des millions d\'années. Tes tables… je les connais toutes.',anim:'pulse',col:'#f39c12'},
 CM1: {emoji:'🤖',name:'Méga-Calculateur',title:'Boss Cybernétique',intro:'Mes circuits traitent des milliards de calculs par seconde. Toi ?',anim:'freeze',col:'#3498db'},
 CM2: {emoji:'👑',name:'Roi des Maths',title:'Boss Ultime',intro:'Tu as osé venir jusqu\'à moi. Tu vas le regretter.',anim:'glow',col:'#f1c40f'},
};
const WRONG_TAUNTS=[
 'AH AH ! Tu m\'as raté !','Erreur ! C\'est trop facile de te battre.','Encore raté… déçu.','HA ! Les maths, c\'est dur, hein ?','Pathétique. Recommence.','Tu trembles ? C\'est bien.',
];
const CORRECT_TAUNTS=[
 'Hmm… bonne réponse. T\'as eu de la chance.','Chanceux. La prochaine sera différente !','Pas mal… pour cette fois.','Grr… correcte. Ça ne durera pas.','Bien joué. Mais je suis loin d\'être vaincu !',
];
const TIMER_TAUNTS=[
 'Le temps presse… !','Dépêche-toi !','Tu n\'auras pas le temps…','Tic tac… tic tac…','Allez, réfléchis !',
];
let _currentMonster=null;
let _speechTimer=null;
let _speechBubble=null;
let _timerTauntFired=false;

function pickMonster(level,isBoss){
 if(isBoss)return BOSS_ROSTER[level]||BOSS_ROSTER.CP;
 const pool=MONSTER_ROSTER[level]||MONSTER_ROSTER.CP;
 return pool[ri(0,pool.length-1)];
}

function showMonsterIntro(monster,cb){
 _currentMonster=monster;
 const trans=$('transition-screen');
 const monEl=$('trans-monster');
 const msgEl=$('trans-msg');
 monEl.textContent=monster.emoji;
 monEl.style.cssText='';
 monEl.style.setProperty('--mcol',monster.col);
 // Remove old class then reapply to trigger reflow
 monEl.className='';void monEl.offsetWidth;
 if(monster.anim!=='none')monEl.className='anim-'+monster.anim;
 msgEl.innerHTML=`
  <div id="monster-intro-badge" style="background:${monster.col}33;color:${monster.col};border:1px solid ${monster.col}60;">${monster.title}</div>
  <div id="monster-intro-name" style="color:${monster.col};">${monster.name}</div>
  <div id="monster-intro-quote">"${monster.intro}"</div>`;
 trans.classList.remove('hidden');
 // Themed beep
 try{
  const ctx=getAudio();
  const freqMap={glow:[523,659,784],pulse:[220,330,440],slither:[180,270,360],bounce:[523,659],shake2:[200,160,200],float:[440,550,660],freeze:[880,1100],spin2:[330,440,550,660]};
  const ff=freqMap[monster.anim]||[440,550];
  ff.forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.38,.1),i*130));
 }catch(e){}
 setTimeout(()=>{trans.classList.add('hidden');monEl.className='';cb();},2700);
}

function applyMonsterAnim(el,monster){
 el.className='';void el.offsetWidth;
 el.style.setProperty('--mcol',monster.col||'#e74c3c');
 if(monster&&monster.anim&&monster.anim!=='none')el.className='anim-'+monster.anim;
}

function monsterSpeak(text,duration=2300){
 const wrap=$('monster-wrap');if(!wrap)return;
 clearMonsterSpeech();
 const b=document.createElement('div');
 b.id='monster-speech';b.textContent=text;
 wrap.appendChild(b);
 _speechBubble=b;
 _speechTimer=setTimeout(()=>{
  if(_speechBubble){
   _speechBubble.style.animation='speechFade .32s ease forwards';
   setTimeout(()=>{if(_speechBubble){_speechBubble.remove();_speechBubble=null;}},330);
  }
 },duration);
}

function clearMonsterSpeech(){
 clearTimeout(_speechTimer);
 if(_speechBubble){_speechBubble.remove();_speechBubble=null;}
}
// ═══════════════════════════════════════════════════════
// VIBRATIONS HAPTIQUES (chantier 3.7)
// ═══════════════════════════════════════════════════════
const VIBRATE_KEY='odyssee_vibrate';
const VIBE = {
  good:    40,                          // tap court (bonne réponse)
  bad:     [80, 50, 80],                // double buzz (mauvaise réponse)
  boss:    [100, 60, 100, 60, 200],     // crescendo (boss vaincu)
  levelup: [60, 40, 60, 40, 60]         // roulement festif (niveau débloqué)
};
function vibrate(pattern){
 const t=$('vibrateToggle');
 const enabled=t?t.checked:(localStorage.getItem(VIBRATE_KEY)!=='0');
 if(!enabled)return;
 if(!('vibrate' in navigator))return;
 try{navigator.vibrate(pattern);}catch(e){}
}
function saveVibrate(){
 const t=$('vibrateToggle');if(!t)return;
 localStorage.setItem(VIBRATE_KEY,t.checked?'1':'0');
 if(t.checked)vibrate(40); // feedback immédiat à l'activation
}
function loadVibrate(){
 const t=$('vibrateToggle');if(!t)return;
 // Activé par défaut, désactivé seulement si '0' explicitement stocké
 t.checked=localStorage.getItem(VIBRATE_KEY)!=='0';
}
// ═══════════════════════════════════════════════════════
// FEEDBACK VISUEL — POPUPS (chantier 3.1)
// ═══════════════════════════════════════════════════════
// Affiche un texte flottant (ex: "+5 ⭐") qui jaillit en (x,y) viewport
// et monte en s'estompant. `big`=true pour un combo bonus (combo>=5).
function floatScore(text, x, y, big){
 const el=document.createElement('div');
 el.className='score-pop'+(big?' score-pop-big':'');
 el.textContent=text;
 el.style.left=x+'px';el.style.top=y+'px';
 document.body.appendChild(el);
 setTimeout(()=>el.remove(),950);
}
// Affiche "COMBO xN !" en grand au centre, 1.2s
function comboBanner(combo){
 const el=document.createElement('div');
 el.className='combo-banner';
 el.textContent=`COMBO x${combo} !`;
 document.body.appendChild(el);
 setTimeout(()=>el.remove(),1250);
 vibrate(VIBE.good); // mini retour haptique synchro
}
// Paliers de combo qui déclenchent la bannière
const COMBO_MILESTONES = new Set([5, 10, 15, 20, 25, 30, 50]);
// ═══════════════════════════════════════════════════════
// NUMPAD TACTILE (chantier 3.6)
// ═══════════════════════════════════════════════════════
// Le pavé numérique custom se branche automatiquement sur le mode clavier
// pour les appareils tactiles. On n'ouvre jamais le clavier système.
function _numpadIsTouch(){
 // Détection fiable : écran étroit = mobile/tablette.
 // On n'utilise plus hover:none car certains Samsung (S Pen) se déclarent hover:hover.
 return window.innerWidth <= 820;
}
function setupNumpad(){
 const pad=$('numpad'); if(!pad) return;
 // Active visuellement sur tactile
 if(_numpadIsTouch()) pad.classList.add('enabled');
 // Sur tactile, empêche l'input de recevoir le focus (donc pas de clavier virtuel)
 const input=$('answer-input');
 if(input && _numpadIsTouch()){
  input.addEventListener('focus', e=>{ e.target.blur(); });
 }
 // Un seul handler délégué (perf + robustesse)
 pad.addEventListener('click', e=>{
  const b=e.target.closest('.np-btn'); if(!b) return;
  const k=b.dataset.k;
  const input=$('answer-input'); if(!input) return;
  if(k==='ok'){ submitAns(); return; }
  if(k==='del'){ input.value=input.value.slice(0,-1); return; }
  if(k==='-'){
   // Signe moins : toggle au début de la valeur
   input.value = input.value.startsWith('-') ? input.value.slice(1) : '-'+input.value;
   return;
  }
  // Chiffre : on append (limite 6 caractères pour éviter les abus)
  if(input.value.length < 6) input.value += k;
 });
}
// Affiche / masque le numpad selon le mode en cours (clavier vs QCM)
function toggleNumpadForMode(mode){
 const pad=$('numpad'); if(!pad) return;
 if(mode==='keyboard' && _numpadIsTouch()) pad.classList.add('enabled');
 else pad.classList.remove('enabled');
}