// 01-core.js — L'Odyssée des Chiffres
'use strict';

// État global, utilitaires de base, gestion des vues, helpers monstres.

// ═══════════════════════════════════════════════════════
// ÉTAT
// ═══════════════════════════════════════════════════════
let P={};
const GM={level:'CP',mode:'keyboard',mode2:'normal',mapZone:null,subject:'math'};
const GS={
 pv:3,score:0,combo:0,maxCombo:0,qCount:0,q:null,answering:false,
 isBoss:false,isGolden:false,errInGame:0,fracOk:0,missingOk:0,combatWon:false,mapBossWon:false,
 sessionStart:0,frozen:false,monsterHP:1,monsterMaxHP:1,activeEvent:null,eventLeft:0,errList:[]
};
function resetGS(){
 Object.assign(GS,{pv:3+(P.skills.shield||0),score:0,combo:0,maxCombo:0,qCount:0,q:null,answering:false,
  isBoss:false,isGolden:false,errInGame:0,fracOk:0,missingOk:0,combatWon:false,mapBossWon:false,
  sessionStart:Date.now(),frozen:false,monsterHP:1,monsterMaxHP:1,activeEvent:null,eventLeft:0,
  recentQ:[],bossTypeQ:{},errList:[]});
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
  // v8.7.31 : onomatopées avec consonnes répétées (grrrr, brrr, etc.)
  // → ajout d'une voyelle pour que la TTS prononce comme syllabe au lieu d'épeler
  // v9.2.3 : grognements/rugissements rendus prononçables, y compris collés à d'autres
  // lettres ("Rrrgh", "Grrr!", "GROAAAR") qui échappaient aux anciennes règles (\b final).
  .replace(/([aeiouyàâ])\1{2,}/gi, '$1$1')               // voyelle répétée 3+ → 2 ("GROAAAR" → "GROAAR")
  .replace(/\b([gbv]?)r{3,}(?:gh|h|g)?/gi, '$1raah')     // 3+ r : "grrr"/"rrrgh"/"grrrr" → "(g)raah"
  .replace(/\b([gbv])r{2,}(?:gh|h|g)?/gi, '$1raah')      // "gr/br/vr" + 2 r en début de mot → "(g)raah"
  .replace(/\bh[aâ]{2,}\b/gi, 'ha ha ha')                // "haaaa" → "ha ha ha" (rire)
  .replace(/\bh[eé]{2,}\b/gi, 'hé hé hé')                // "héééé" → "hé hé hé"
  .replace(/\bm[uû]{2,}\b/gi, 'mouah')                   // "muuu" → "mouah"
  // Fallback générique : 3+ consonnes identiques → seulement 2 (évite l'épellation)
  .replace(/([bcdfghjklmnpqrstvwxz])\1{2,}/gi, '$1$1')
  // Opérateurs math
  .replace(/\bb?[vz]z{1,}[a-zéèê]*/gi,' ')   // onomatopées « Bzzz / Vzzz » : pas d'épellation
  .replace(/×/g,' fois ')                      // symbole de multiplication uniquement
  .replace(/(\d)\s*[x]\s*(\d)/gi,'$1 fois $2')  // « x » entre deux nombres (ex. 3x4), pas la lettre dans un mot
  .replace(/÷|\//g,' divisé par ')
  .replace(/−/g,' moins ')                    // signe « moins » typographique (maths)
  .replace(/(\d)\s*-\s*(\d)/g,'$1 moins $2')   // tiret entre deux nombres = soustraction
  .replace(/\+/g,' plus ')
  .replace(/=/g,' égale ')
  // v8.7.31 : "?" n'est plus remplacé par "quoi" (anomalie vocale).
  // Le ton interrogatif est porté par la formulation ("combien", "quel"…).
  .replace(/\?/g,' ')
  // Multiples ! → un seul (évite "exclamation exclamation exclamation")
  .replace(/!{2,}/g,'!')
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

// ═══════════════════════════════════════════════════════
// VOIX DIFFÉRENCIÉES PAR PERSONNAGE (v8.7.0)
// Chaque monstre/boss reçoit un profil vocal (pitch + rate)
// cohérent avec son physique, déduit de son emoji/animation.
// ═══════════════════════════════════════════════════════
// Profils : pitch (0=très grave, 2=très aigu), rate (vitesse)
function _voiceProfileFor(monster){
 if(!monster) return { pitch:1, rate:0.95 };
 if(monster.voice) return monster.voice;
 const e = monster.emoji || '';
 const anim = monster.anim || '';
 const name = (monster.name||'').toLowerCase();
 // Gros / lourds / dragons / boss → voix grave et lente, menaçante
 if(/🐉|🐲|🦖|🦕|🦏|🦛|🐘|🦣|👹|👺|👿|😈|🔥|🌋|🐊|🦁|🦂|💀|☠️|🗿/.test(e)
    || /dragon|géant|seigneur|roi|maître|titan|colosse|boss|démon|monstre/.test(name)
    || anim==='shake2'){
  return { pitch:0.45, rate:0.82 };
 }
 // Petits / insectes / agiles → voix aiguë et rapide
 if(/🐛|🐝|🐜|🦗|🕷️|🦟|🐞|🦋|🐭|🐹|🐤|🐣|🦠|🍄/.test(e)
    || /larve|insecte|abeille|petit|mini|champign/.test(name)
    || anim==='float'){
  return { pitch:1.65, rate:1.12 };
 }
 // Reptiles / rampants / sournois → voix médium-grave, lente, sifflante
 if(/🐍|🦎|🐊|🦂|🦗|🕸️/.test(e)
    || /serpent|lézard|reptile|rampant|subtract|diviseur/.test(name)
    || anim==='slither'){
  return { pitch:0.7, rate:0.86 };
 }
 // Créatures glacées / éthérées / fantômes → voix médium, lente, posée
 if(/❄️|🧊|👻|🌬️|🦇|🌌|👽|🛸|🔮|💎/.test(e)
    || /glace|givre|fantôme|spectre|alien|quantique|cosmi/.test(name)
    || anim==='freeze'){
  return { pitch:0.92, rate:0.84 };
 }
 // Énergiques / lumineux / félins → voix médium-aiguë, dynamique
 if(/🦊|🐺|🦝|🐯|🦁|⚡|✨|🌟|💥/.test(e)
    || /renard|loup|lion|tigre|félin|éclair/.test(name)
    || anim==='glow' || anim==='spin2'){
  return { pitch:1.15, rate:1.0 };
 }
 // Rebondissants / amphibiens → voix médium, rythme enjoué
 if(/🐸|🐰|🦘|🤺/.test(e) || anim==='bounce'){
  return { pitch:1.25, rate:1.05 };
 }
 // Défaut : médium neutre
 return { pitch:1, rate:0.92 };
}

// Fait parler un personnage avec sa voix propre.
// Utilisé pour les intros, taunts, paroles de boss (avant/pendant/après).
function speakAs(text, monster){
 if(!$('voiceToggle')?.checked) return;
 if(!window.speechSynthesis) return;
 try{
  window.speechSynthesis.cancel();
  const prof = _voiceProfileFor(monster);
  const m = new SpeechSynthesisUtterance(_humanizeForSpeech(text));
  m.lang='fr-FR';
  m.pitch = prof.pitch;
  m.rate = Math.min(prof.rate || 0.9, 0.9);
  if(_frVoice) m.voice=_frVoice;
  window.speechSynthesis.speak(m);
 }catch(e){}
}
function saveVoice(){
 const t=$('voiceToggle');if(!t)return;
 localStorage.setItem(VOICE_KEY,t.checked?'1':'0');
}
function loadVoice(){
 const t=$('voiceToggle');if(!t)return;
 // v8.7.2 : activé par défaut (lecture des questions ET voix des monstres),
 // désactivé seulement si l'utilisateur l'a explicitement coupé ('0').
 t.checked=localStorage.getItem(VOICE_KEY)!=='0';
 if(typeof initVoicePicker==='function') initVoicePicker();
}
// ── Sélecteur de voix (v9.4.8) : choix d'une voix appliquée partout
//    (questions, monstres, narration du livre). Mémorisé via VOICE_URI_KEY. ──
const VOICE_URI_KEY='odyssee_voice_uri';
let _voicePickerHooked=false;
function _allVoices(){ try{ return (window.speechSynthesis&&window.speechSynthesis.getVoices())||[]; }catch(e){ return []; } }
function applySavedVoice(){
 try{
  const uri=localStorage.getItem(VOICE_URI_KEY)||'';
  const vs=_allVoices();
  if(uri){ const v=vs.find(x=>x.voiceURI===uri); _frVoice = v || _pickFrenchVoice(); }
  else { _frVoice = _pickFrenchVoice(); }
 }catch(e){}
}
function populateVoiceSelect(){
 const sel=$('voiceSelect'); if(!sel) return;
 const vs=_allVoices(); if(!vs.length) return; // sera rappelé via 'voiceschanged'
 const fr=vs.filter(v=>/^fr/i.test(v.lang||''));
 const others=vs.filter(v=>!/^fr/i.test(v.lang||''));
 const saved=localStorage.getItem(VOICE_URI_KEY)||'';
 const opt=v=>`<option value="${v.voiceURI}"${v.voiceURI===saved?' selected':''}>${v.name} (${v.lang})</option>`;
 sel.innerHTML=`<option value=""${saved===''?' selected':''}>Voix automatique</option>`
  +(fr.length?`<optgroup label="Français">${fr.map(opt).join('')}</optgroup>`:'')
  +(others.length?`<optgroup label="Autres langues">${others.map(opt).join('')}</optgroup>`:'');
}
function onVoiceSelectChange(){
 const sel=$('voiceSelect'); if(!sel) return;
 localStorage.setItem(VOICE_URI_KEY, sel.value||'');
 applySavedVoice();
 // Échantillon chaleureux de conteur pour tester la voix choisie
 try{
  if(window.speechSynthesis){
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance('Il était une fois, dans le royaume de Calcultopia, un héros prêt à relever tous les défis.');
   u.lang='fr-FR'; u.rate=0.86; u.pitch=1.05; if(_frVoice) u.voice=_frVoice;
   window.speechSynthesis.speak(u);
  }
 }catch(e){}
}
function initVoicePicker(){
 populateVoiceSelect();
 applySavedVoice();
 if(window.speechSynthesis && !_voicePickerHooked){
  _voicePickerHooked=true;
  // addEventListener (et non onvoiceschanged=) pour ne pas écraser d'autres écouteurs
  try{ window.speechSynthesis.addEventListener('voiceschanged', ()=>{ populateVoiceSelect(); applySavedVoice(); }); }catch(e){}
 }
}
// Répéter la dernière question à la demande de l'utilisateur
function repeatQuestion(){
 const q=typeof GS!=='undefined'?GS.q:null;if(!q)return;
 const txt=q.maternelle?(q.consigne||''):(q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res)));
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
const VIEWS=['v-menu','v-subjects','v-menu2','v-params','v-mode-config','v-settings','v-game','v-end','v-mult','v-parent','v-odyssey-select','v-map','v-zone'];
function showView(id){VIEWS.forEach(v=>$(v).classList.toggle('hidden',v!==id));const si=document.querySelector('.settings-icon');if(si)si.classList.toggle('si-hidden',id!=='v-menu');}
// ═══════════════════════════════════════════════════════
// PILE DE NAVIGATION (v8.7.3)
// Permet à "Retour" de revenir à la vue PRÉCÉDENTE réelle,
// et à "Accueil" de revenir à l'écran 1 en vidant la pile.
// ═══════════════════════════════════════════════════════
let _navStack = [];
// Va vers une vue en empilant la vue courante
function navTo(viewId){
 const cur = VIEWS.find(v=>!$(v).classList.contains('hidden'));
 if(cur && cur!==viewId) _navStack.push(cur);
 showView(viewId);
}
// Retour à la vue précédente (dépile). Si pile vide → écran 1.
function navBack(){
 const prev = _navStack.pop();
 if(prev){
  showView(prev);
  if(prev==='v-menu'){ if(typeof loadProfile==='function') loadProfile(); if(typeof refreshMenu1Card==='function') refreshMenu1Card(); }
  if(prev==='v-menu2' && typeof refreshMenu2==='function') refreshMenu2();
  if(prev==='v-settings' && typeof stab==='function') stab('hero');
 }else{
  goHome();
 }
}
// Accueil : vide la pile, retourne à l'écran 1
function goHome(){
 _navStack = [];
 if(typeof loadProfile==='function') loadProfile();
 if(typeof refreshMenu1Card==='function') refreshMenu1Card();
 showView('v-menu');
}

function toggleSettings(){
 const open=!$('v-settings').classList.contains('hidden');
 if(open){navBack();}
 else{navTo('v-settings');if($('dash-player-name'))$('dash-player-name').textContent=P.name||'';stab('hero');if($('th-stars'))$('th-stars').textContent=P.stars||0;if($('th-figs'))$('th-figs').textContent=(P.ownedFigurines||[]).length;if($('th-badges'))$('th-badges').textContent=(P.badgesEarned||[]).length;renderSkills();renderBadges();renderQuests();}
}
function closeSettings(){navBack();}
function stab(name){
 const ts=['hero','scores','stats','milestones','levels','revision','avatar','figurines'];
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
 if(name==='scores'){renderLB();renderRecords();}
 if(name==='stats'){renderChart();renderOpStats();if(typeof renderHistory==='function')renderHistory();}
 if(name==='levels')renderLevelUnlocks();
 if(name==='milestones')renderMilestones();
 if(name==='figurines')renderFigCollection();
}
function returnMenu(){
 gameActive=false;clearPendingTimers();clearMonsterSpeech();
 // v8.7.9 (O1) : annuler aussi les boucles requestAnimationFrame en cours
 if(typeof stopTimer==='function') stopTimer();
 if(typeof stopChrono==='function') stopChrono();
 $('BODY').classList.remove('urgency-bg','body-alert');
 const heart=$('timer-heart');if(heart)heart.style.display='none';
 // v8.7.8 (O1) : si on sort d'une étape de zone, on revient à la carte de zone
 // (avec l'étape suivante débloquée si on a gagné). Sinon, retour à l'accueil.
 const fromZoneStep = (typeof GM!=='undefined' && GM.mapZone && GM.mapStep);
 if(fromZoneStep){
  const zid = GM.mapZone.id;
  // Reset état de partie mais on garde _currentZoneId pour renderZoneMap
  GM.mapStep = null;
  if(typeof stopZoneSkin==='function') stopZoneSkin();
  // Si la zone est entièrement complétée, on retourne à la carte du monde (v-map)
  const prog = (P.zoneProgress && P.zoneProgress[zid]);
  if(prog && prog.completed){
   GM.mapZone = null;
   _navStack = [];
   if(typeof loadProfile==='function') loadProfile();
   if(typeof renderMap==='function') renderMap();
   showView('v-map');
  } else {
   // Sinon retour à la carte de zone avec l'étape suivante prête
   _currentZoneId = zid;
   if(typeof renderZoneMap==='function') renderZoneMap();
   showView('v-zone');
  }
  if(typeof renderHomework==='function') renderHomework();
  return;
 }
 _navStack=[];showView('v-menu');loadProfile();
 // v8.7.10 : reset complet du contexte carte (sinon une partie classique
 // lancée ensuite hériterait d'un GM.mapZone résiduel)
 if(typeof GM!=='undefined'){GM.mapZone=null;GM.mapStep=null;}
 // Chantier B4 : retirer le skin de zone en revenant au menu
 if(typeof stopZoneSkin==='function') stopZoneSkin();
 // Chantier B3 : démonter le moteur parallaxe de la carte
 if(typeof teardownMapParallax==='function') teardownMapParallax();
 // Chantier C3 : reset du flag devoir
 if(typeof GM!=='undefined'){GM.homework=false;GM.homeworkConfig=null;}
 // Chantier C3 : afficher la carte devoir si actif
 if(typeof renderHomework==='function') renderHomework();
 // Chantier C4 : à la sortie d'une partie, vérifier s'il y a un plateau à signaler
 if(typeof showPlateauHint==='function') setTimeout(showPlateauHint, 1500);
}

// v8.7.7 : interrompre une partie en cours (boutons Retour/Accueil en jeu).
// dest='back' → page précédente · dest='home' → écran d'accueil.
// Demande confirmation pour éviter les abandons accidentels.
function quitGame(dest){
 const ok = (typeof confirm==='function')
  ? confirm('Quitter la partie en cours ? Ta progression de cette partie sera perdue.')
  : true;
 if(!ok) return;
 // Arrêt propre de la partie (comme returnMenu mais sans forcer l'écran)
 gameActive=false;
 if(typeof clearPendingTimers==='function') clearPendingTimers();
 if(typeof clearMonsterSpeech==='function') clearMonsterSpeech();
 // v8.7.9 (O1) : annuler les boucles requestAnimationFrame en cours
 // (timer de question, chrono mode 60s) — sinon les alertes visuelles
 // continuent et peuvent même appeler endGame après le retour à la carte.
 if(typeof stopTimer==='function') stopTimer();
 if(typeof stopChrono==='function') stopChrono();
 const b=$('BODY'); if(b) b.classList.remove('urgency-bg','body-alert');
 const heart=$('timer-heart'); if(heart) heart.style.display='none';
 if(typeof stopZoneSkin==='function') stopZoneSkin();
 if(typeof teardownMapParallax==='function') teardownMapParallax();
 // v8.7.8 (O1) : si on quitte une étape de zone via "Retour" (pas "Accueil"),
 // revenir à la carte de zone (l'étape non terminée n'est pas marquée).
 const fromZoneStep = (typeof GM!=='undefined' && GM.mapZone && GM.mapStep);
 if(fromZoneStep && dest!=='home'){
  const zid = GM.mapZone.id;
  GM.mapStep = null;
  _currentZoneId = zid;
  if(typeof renderZoneMap==='function') renderZoneMap();
  showView('v-zone');
  if(typeof stopMusic==='function') stopMusic();
  return;
 }
 if(typeof GM!=='undefined'){GM.homework=false;GM.homeworkConfig=null;}
 if(typeof stopMusic==='function') stopMusic();
 if(dest==='home'){
  if(typeof goHome==='function') goHome(); else { showView('v-menu'); if(typeof loadProfile==='function') loadProfile(); }
 }else{
  if(typeof navBack==='function') navBack(); else { showView('v-menu'); if(typeof loadProfile==='function') loadProfile(); }
 }
}

// v8.7.9 (O1) : action du bouton replay de l'écran de fin (v-end).
// En étape de zone : retour à la carte de zone (étape suivante déverrouillée si gagnée).
// Sinon : relance la partie normale (comme avant).
function endReplayAction(){
 if(typeof GM!=='undefined' && GM.mapZone && GM.mapStep){
  // Retour à la carte de zone : on réutilise returnMenu qui gère bien ce cas
  if(typeof returnMenu==='function') returnMenu();
  return;
 }
 if(typeof startGame==='function') startGame();
}

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
 // ── Boss MATERNELLE (PS/MS/GS) : doux, rassurants, voix tendre ──
 PS: {emoji:'🦄',name:'Étoile la Licorne',title:'Amie des Petits',intro:'Coucou petit champion ! Tu veux jouer avec les nombres ? On va bien s\'amuser tous les deux !',anim:'float',col:'#ff9ec7',voice:{pitch:1.5,rate:0.9}},
 MS: {emoji:'🐼',name:'Panpan le Panda',title:'Gros Câlin Rigolo',intro:'Bonjour ! Je suis un panda tout doux et tout rond. Montre-moi comme tu sais bien compter !',anim:'bounce',col:'#8fd3a8',voice:{pitch:1.25,rate:0.9}},
 GS: {emoji:'🦕',name:'Dino le Gentil Géant',title:'Grand Ami Tranquille',intro:'Bravo d\'être arrivé jusqu\'ici ! Un petit défi tout gentil ? Je crois très fort en toi !',anim:'pulse',col:'#7ec8e3',voice:{pitch:1.15,rate:0.9}},
 CP:  {emoji:'🐲',name:'Drakon l\'Ancien',title:'Boss Légendaire',intro:'Tu as survécu jusqu\'ici… Impressionnant. Mais moi, je suis INVINCIBLE.',anim:'glow',col:'#e74c3c'},
 CE1: {emoji:'🧟',name:'Zombie Matheux',title:'Boss Redouté',intro:'Je mange les cerveaux… surtout ceux qui ne savent pas calculer.',anim:'shake2',col:'#27ae60'},
 CE2: {emoji:'🦖',name:'Dino-Tables',title:'Boss Titanesque',intro:'Je suis là depuis des millions d\'années. Tes tables… je les connais toutes.',anim:'pulse',col:'#f39c12'},
 CM1: {emoji:'🤖',name:'Méga-Calculateur',title:'Boss Cybernétique',intro:'Mes circuits traitent des milliards de calculs par seconde. Toi ?',anim:'freeze',col:'#3498db'},
 CM2: {emoji:'👑',name:'Roi des Maths',title:'Boss Ultime',intro:'Tu as osé venir jusqu\'à moi. Tu vas le regretter.',anim:'glow',col:'#f1c40f'},
 // ── Boss COLLÈGE (6e→3e) : ton plus mûr, thèmes du cycle 4 ──
 '6E': {emoji:'🗿',name:'le Sphinx Sans Réponse',title:'Gardien du Seuil',intro:'Tu quittes l\'enfance des nombres. Ici, on ne récite plus : on raisonne. À toi de le prouver.',anim:'shake2',col:'#6b7a8f'},
 '5E': {emoji:'🌑',name:'Abyssos, Seigneur du Négatif',title:'Maître des Profondeurs',intro:'Sous le zéro s\'ouvre mon royaume. Beaucoup s\'y égarent. Sauras-tu en revenir ?',anim:'freeze',col:'#34495e'},
 '4E': {emoji:'⚖️',name:'l\'Équateur, Maître de l\'Inconnue',title:'Juge des Équilibres',intro:'Tout doit s\'équilibrer. Une faute d\'un côté, et la balance te condamne. Résous… ou romps.',anim:'pulse',col:'#8e44ad'},
 '3E': {emoji:'🌌',name:'Sigma, Seigneur des Fonctions',title:'l\'Ultime Théorème',intro:'Avant le Brevet, il y a moi. Je suis chaque démonstration que tu n\'as pas terminée. Achève-la.',anim:'glow',col:'#2c3e50'},
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
 // Reset des styles inline mais on PRÉSERVE le font-size pour que l'emoji
 // reste à la bonne taille (sinon il tombe sur la valeur par défaut du body ~16px).
 monEl.style.cssText='font-size:5em;';
 monEl.style.setProperty('--mcol',monster.col);
 // Remove old class then reapply to trigger reflow
 monEl.className='';void monEl.offsetWidth;
 if(monster.anim!=='none')monEl.className='anim-'+monster.anim;
 // v8.7.27 : indicateur de skip "Toucher pour passer"
 msgEl.innerHTML=`
  <div id="monster-intro-badge" style="background:${monster.col}33;color:${monster.col};border:1px solid ${monster.col}60;">${monster.title}</div>
  <div id="monster-intro-name" style="color:${monster.col};">${monster.name}</div>
  <div id="monster-intro-quote">"${monster.intro}"</div>
  <div id="monster-intro-skip-hint">Toucher pour passer</div>`;
 trans.classList.remove('hidden');
 // v8.7.0 : le monstre prononce son intro avec sa voix propre
 if(typeof speakAs==='function') speakAs(monster.intro, monster);
 // Themed beep
 try{
  const ctx=getAudio();
  const freqMap={glow:[523,659,784],pulse:[220,330,440],slither:[180,270,360],bounce:[523,659],shake2:[200,160,200],float:[440,550,660],freeze:[880,1100],spin2:[330,440,550,660]};
  const ff=freqMap[monster.anim]||[440,550];
  ff.forEach((f,i)=>setTimeout(()=>pNote(ctx,f,'sine',.38,.1),i*130));
 }catch(e){}
 // v8.7.27 : skip au clic. Timer + handler nettoyés ensemble pour éviter double-trigger.
 let _introDone = false;
 const _finishIntro = () => {
  if(_introDone) return;
  _introDone = true;
  clearTimeout(_introTimer);
  trans.removeEventListener('click', _finishIntro);
  trans.classList.add('hidden');
  monEl.className='';
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
  cb();
 };
 const _introTimer = setTimeout(_finishIntro, Math.max(5700, _speechMs(monster.intro) + 700));
 trans.addEventListener('click', _finishIntro);
}

function applyMonsterAnim(el,monster){
 el.className='';void el.offsetWidth;
 el.style.setProperty('--mcol',monster.col||'#e74c3c');
 if(monster&&monster.anim&&monster.anim!=='none')el.className='anim-'+monster.anim;
}

// Estime la durée de lecture vocale (ms) d'un texte, à la vitesse réelle (~0.9).
// Sert à NE PAS couper les longues répliques (intro + taunts).
function _speechMs(text){
 try{ const t=(typeof _humanizeForSpeech==='function'?_humanizeForSpeech(text):text)||''; return Math.min(14000, Math.max(1400, Math.round(t.length*78))); }catch(e){ return 4000; }
}

function monsterSpeak(text,duration=5300){
 const wrap=$('monster-wrap');if(!wrap)return;
 clearMonsterSpeech();
 // v8.7.0 : le monstre prononce son taunt avec sa voix propre
 if(typeof speakAs==='function') speakAs(text, _currentMonster);
 // v9.4.6 : la bulle ET la fenêtre de non-interruption durent au moins le temps de lecture
 const _dur = Math.max(duration||0, _speechMs(text));
 // Durée estimée de la phrase parlée (sert à différer la question suivante)
 window._monsterSpeakEnd = Date.now() + _dur;
 const b=document.createElement('div');
 b.id='monster-speech';b.textContent=text;
 wrap.appendChild(b);
 _speechBubble=b;
 _speechTimer=setTimeout(()=>{
  if(_speechBubble){
   _speechBubble.style.animation='speechFade .32s ease forwards';
   setTimeout(()=>{if(_speechBubble){_speechBubble.remove();_speechBubble=null;}},330);
  }
 },_dur);
}

function clearMonsterSpeech(){
 clearTimeout(_speechTimer);
 // v8.7.0 : couper aussi la synthèse vocale en cours (sinon le monstre
 // continue de parler après la fin de la partie / changement d'écran)
 try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
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
  if(k===','){
   // Virgule décimale : une seule, jamais en première position
   const v = input.value;
   if(!v.includes(',') && v !== '' && v !== '-') input.value = v + ',';
   return;
  }
  // Chiffre : on append (limite 6 caractères pour éviter les abus)
  if(input.value.replace(/[-,]/g,'').length < 6) input.value += k;
 });
}
// Affiche / masque le numpad selon le mode en cours (clavier vs QCM)
function toggleNumpadForMode(mode){
 const pad=$('numpad'); if(!pad) return;
 if(mode==='keyboard' && _numpadIsTouch()) pad.classList.add('enabled');
 else pad.classList.remove('enabled');
}
// ═══════════════════════════════════════════════════════
// Chantier B1 : Mode clair / sombre
// ═══════════════════════════════════════════════════════
// Bascule entre 3 états : 'dark' (défaut), 'light', 'auto' (suit le système)
function applyAppearance(mode){
 const m = mode || 'dark';
 if(m === 'auto'){
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-appearance', prefersDark ? 'dark' : 'light');
 } else {
  document.documentElement.setAttribute('data-appearance', m);
 }
 // Mise à jour de l'icône du bouton
 const btn = document.getElementById('appearance-toggle');
 if(btn){
  const current = document.documentElement.getAttribute('data-appearance');
  btn.textContent = current === 'light' ? '☀️' : '🌙';
  btn.title = current === 'light' ? 'Mode clair actif (cliquer pour sombre)' : 'Mode sombre actif (cliquer pour clair)';
 }
}

function toggleAppearance(){
 if(!P) return;
 P.prefs = P.prefs || {};
 const current = P.prefs.appearance || 'dark';
 const next = current === 'dark' ? 'light' : 'dark';
 P.prefs.appearance = next;
 if(typeof saveProfile === 'function') saveProfile();
 applyAppearance(next);
 if(typeof toast === 'function') toast(next === 'light' ? '☀️ Mode clair' : '🌙 Mode sombre', 1500);
}

// Initialisation : au chargement, applique la préférence sauvegardée
function initAppearance(){
 const mode = (P?.prefs?.appearance) || 'dark';
 applyAppearance(mode);
}

// Si le système change de mode et qu'on est en 'auto', on suit
if(window.matchMedia){
 window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if(P?.prefs?.appearance === 'auto') applyAppearance('auto');
 });
}
// ═══════════════════════════════════════════════════════
// Chantier A4 : Animations de combat enrichies
// ═══════════════════════════════════════════════════════

/**
 * Joue une animation visuelle pour un objet utilisé en combat.
 * Type : 'potion', 'bomb', 'powerSword', 'powerShield', 'powerClock'
 */
function playItemAnimation(type){
 const monsterArea = document.getElementById('monster-area');
 if(!monsterArea) return;
 const overlay = document.createElement('div');
 overlay.className = `combat-fx combat-fx-${type}`;

 const config = {
  potion: { emoji:'💚', count:6, sound:[440, 587, 740, 880], duration:1200 },
  bomb:   { emoji:'💥', count:1, sound:[110, 80, 60], duration:600 },
  powerSword:  { emoji:'⚔️', count:3, sound:[800, 600, 1000], duration:800 },
  powerShield: { emoji:'🛡️', count:1, sound:[300, 500, 700], duration:1000 },
  powerClock:  { emoji:'⏰', count:8, sound:[523, 659, 784], duration:1000 },
 };
 const cfg = config[type];
 if(!cfg) return;

 // Crée plusieurs particules animées
 for(let i = 0; i < cfg.count; i++){
  const particle = document.createElement('span');
  particle.className = `combat-particle combat-particle-${type}`;
  particle.textContent = cfg.emoji;
  particle.style.animationDelay = (i * 0.08)+'s';
  particle.style.left = (40 + Math.random() * 20) + '%';
  overlay.appendChild(particle);
 }

 // Pour la bombe, ajoute un flash + secousse
 if(type === 'bomb'){
  document.body.classList.add('combat-shake');
  setTimeout(()=>document.body.classList.remove('combat-shake'), 400);
 }
 monsterArea.appendChild(overlay);

 // Joue les sons
 if(typeof beep === 'function' && Array.isArray(cfg.sound)){
  cfg.sound.forEach((freq, i) => setTimeout(()=>beep(freq, type==='bomb'?'sawtooth':'sine', .35, .12), i * 80));
 }
 // Auto-clean
 setTimeout(() => overlay.remove(), cfg.duration + 200);
}

/**
 * Affiche un flash de combo milestone avec texte.
 * Appelé pour combo 10, 20, 30...
 */
function flashComboMilestone(combo){
 const tier = combo >= 30 ? 'berserk' : combo >= 20 ? 'epic' : 'streak';
 const labels = { streak:'STREAK', epic:'ÉPIQUE', berserk:'BERSERK' };
 const flash = document.createElement('div');
 flash.className = `combo-milestone combo-${tier}`;
 flash.innerHTML = `<span class="cm-text">${labels[tier]}</span><span class="cm-num">×${combo}</span>`;
 document.body.appendChild(flash);
 if(typeof beep==='function'){
  if(tier==='berserk') [220,277,330,440,587].forEach((f,i)=>setTimeout(()=>beep(f,'sawtooth',.25,.1),i*80));
  else if(tier==='epic') [659,784,988,1175].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.3,.1),i*80));
  else [523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.25,.1),i*80));
 }
 vibrate?.(tier==='berserk' ? VIBE.boss : VIBE.levelup);
 setTimeout(()=>{ flash.classList.add('cm-fadeout'); setTimeout(()=>flash.remove(), 400); }, 1400);
}

/**
 * Le monstre lâche une réplique de combat aléatoire (différente de l'intro).
 * Appelée si combat long ou HP bas.
 */
const _COMBAT_TAUNTS = [
 'Tu commences à m\'agacer…',
 'Tu es plus fort que prévu !',
 'Continue, je faiblis !',
 'Cette fois c\'est la fin pour toi !',
 'Mes calculs ne te résistent plus ?',
];
function maybeMidCombatTaunt(){
 if(!GS.isBoss || !GS.monsterHP || !GS.monsterMaxHP) return;
 // Si HP < 30% : 30% de chance de placer une taunt
 const hpRatio = GS.monsterHP / GS.monsterMaxHP;
 if(hpRatio < 0.3 && Math.random() < 0.3 && typeof monsterSpeak === 'function'){
  monsterSpeak(_COMBAT_TAUNTS[ri(0, _COMBAT_TAUNTS.length-1)], 2200);
 }
}
// ═══════════════════════════════════════════════════════
// NAVIGATION REFONTE ÉCRAN D'ACCUEIL (v8.7.2 — Étape A)
// 2 écrans successifs + page paramètres.
// Écran 1 (v-menu) : joueur, thème, voix/musique, cloud
// Écran 2 (v-menu2) : modes de jeu + tableau de bord
// Page params (v-params) : vibration, ambiance, mouvement
// ═══════════════════════════════════════════════════════

// Rafraîchit la carte du joueur sur l'écran 1
function refreshMenu1Card(){
 try{
  if(typeof loadProfile==='function') loadProfile();
  const av=$('menu1-avatar'), nm=$('menu1-name'), sb=$('menu1-sub');
  if(av) av.textContent = (P && P.avatar) ? P.avatar : '🧙';
  if(nm) nm.textContent = (P && P.name) ? P.name : 'Joueur';
  if(sb){
   const lvl = (typeof levelFromXP==='function' && P) ? levelFromXP(P.xp||0) : 1;
   const ttl = (P && P.heroTitle) ? P.heroTitle : '';
   sb.textContent = 'Niveau ' + lvl + (ttl ? ' · ' + ttl : '');
  }
 }catch(e){}
}

// Rafraîchit la barre joueur de l'écran 2
function refreshMenu2(){
 try{
  if(P){
   const av=$('m2-avatar'), nm=$('m2-name'), lv=$('m2-lvl'), tt=$('m2-title'), st=$('m2-stars');
   if(av) av.textContent = P.avatar || '🧙';
   if(nm) nm.textContent = P.name || 'Joueur';
   if(lv){ const lvl=(typeof levelFromXP==='function')?levelFromXP(P.xp||0):1; lv.textContent='Niv.'+lvl; }
   if(tt) tt.textContent = P.heroTitle || '';
   if(st) st.textContent = P.stars || 0;
  }
  // Défi hebdo + Devoir du jour (réutilisent les rendus existants)
  if(typeof renderWC==='function') renderWC();
  if(typeof renderHomework==='function') renderHomework();
  if(typeof renderChallenges==='function') renderChallenges();
 }catch(e){}
}

// Écran 1 → Écran 2
function gotoMenu2(){
 if(typeof savePrefs==='function') savePrefs();
 refreshMenu2();
 navTo('v-menu2');
}
// Écran 1 → Écran « Choisis ta matière » (v10.5.0 : app multi-matières)
function gotoSubjects(){
 if(typeof savePrefs==='function') savePrefs();
 try{ const nm=$('subj-player'); if(nm) nm.textContent=(P&&P.name)||'Joueur'; }catch(e){}
 navTo('v-subjects');
}
// Choix d'une matière. Maths → flux actuel (modes). Autres → bientôt disponibles.
const SUBJECT_LABELS={ math:'Mathématiques', fr:'Français', hist:'Histoire', geo:'Géographie', en:'Anglais', svt:'SVT', pc:'Physique-Chimie' };
function chooseSubject(key){
 if(key==='math'){
  GM.subject='math';
  try{ if(typeof beep==='function') beep(660,'sine',.12); }catch(e){}
  gotoMenu2();
 }else{
  if(typeof toast==='function') toast('🔒 '+(SUBJECT_LABELS[key]||'Cette matière')+' — bientôt disponible !');
  try{ if(typeof beep==='function') beep(220,'sine',.12); }catch(e){}
 }
}
// Écran 2 → Écran 1 (bouton Retour de l'écran 2)
function backToMenu1(){
 navBack();
}
// Écran 1 → Paramètres
function gotoParams(){
 // Synchroniser les cases UI avec l'état réel
 try{
  const v=$('vibrateToggle'), a=$('ambianceToggle'), p=$('parallaxToggle');
  if($('vibrateToggleUI')&&v) $('vibrateToggleUI').checked=v.checked;
  if($('ambianceToggleUI')&&a) $('ambianceToggleUI').checked=a.checked;
  if($('parallaxToggleUI')&&p) $('parallaxToggleUI').checked=p.checked;
 }catch(e){}
 navTo('v-params');
}
// Synchronise un toggle de la page Paramètres vers le toggle réel (caché)
function syncParamToggle(which, val){
 try{
  if(which==='vibrate'){ const t=$('vibrateToggle'); if(t){ t.checked=val; if(typeof saveVibrate==='function') saveVibrate(); } }
  else if(which==='ambiance'){ const t=$('ambianceToggle'); if(t){ t.checked=val; if(typeof saveAmbiance==='function') saveAmbiance(); } }
  else if(which==='parallax'){ const t=$('parallaxToggle'); if(t){ t.checked=val; if(typeof saveParallax==='function') saveParallax(); } }
 }catch(e){}
}

// Lance directement l'Odyssée (la carte d'exploration)
function startOdyssee(){
 if(typeof openOdysseeSelect==='function') openOdysseeSelect();
 else if(typeof openMap==='function') openMap();
}

// ═══════════════════════════════════════════════════════
// SOUS-ÉCRANS DE CONFIGURATION DE MODE (v8.7.4 — Étape B)
// Normal/Survie/Chrono → choix niveau + saisie + commencer
// Combat → joueurs (nom+niveau chacun) + saisie + commencer
// ═══════════════════════════════════════════════════════
const _MODE_META = {
 normal:  { icon:'⚔️', title:'Mode Normal',  sub:'Affronte 6 monstres à la suite' },
 survie:  { icon:'💀', title:'Mode Survie',  sub:'Enchaîne sans fin, une erreur = fin' },
 chrono:  { icon:'⏱️', title:'Mode Chrono',  sub:'Un maximum de bonnes réponses en 60 secondes' },
 combat:  { icon:'🏆', title:'Mode Combat',  sub:'2 à 5 joueurs s\'affrontent' },
};
let _mcMode = 'normal';
// Config combat locale au sous-écran (réutilise la structure de combatCfg)
let _mcCombat = [];

function openModeConfig(mode){
 _mcMode = mode;
 const meta = _MODE_META[mode] || _MODE_META.normal;
 const _t=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
 _t('mc-icon', meta.icon); _t('mc-title', meta.title); _t('mc-sub', meta.sub);

 const solo = document.getElementById('mc-solo');
 const combat = document.getElementById('mc-combat');

 if(mode === 'combat'){
  if(solo) solo.classList.add('hidden');
  if(combat) combat.classList.remove('hidden');
  // Initialiser 2 joueurs par défaut (le joueur courant + 1 vide)
  _mcCombat = [
   { name: (P && P.name) ? P.name : 'Joueur 1', level: (P && P.prefs && P.prefs.level) || 'CP' },
   { name: '', level: 'CP' },
  ];
  mcRenderCombat();
  const ic=document.getElementById('mc-input-combat');
  if(ic) ic.value = (P && P.prefs && P.prefs.mode) || 'keyboard';
 } else {
  if(combat) combat.classList.add('hidden');
  if(solo) solo.classList.remove('hidden');
  // Peupler le sélecteur de niveau (avec verrouillage comme l'original)
  const ls = document.getElementById('mc-level');
  if(ls){
   const cur = (P && P.prefs && P.prefs.level) || 'CP';
   const _gi = (l)=> (typeof _groupIcon==='function') ? _groupIcon(l)+' ' : '';
   const _ll = (l)=> (typeof _levelLabel==='function') ? _levelLabel(l) : l;
   const opt = (l)=>{
    const ok = (typeof isUnlocked==='function') ? isUnlocked(l) : true;
    const pW = (typeof prevWins==='function') ? prevWins(l) : 0;
    const req = (typeof UNLOCK_REQ!=='undefined' && UNLOCK_REQ) ? UNLOCK_REQ[l] : 0;
    return `<option value="${l}"${!ok?' disabled':''}${l===cur?' selected':''}>${ok?'':'🔒 '}${_gi(l)}${_ll(l)}${!ok?' ('+pW+'/'+req+' vic.)':''}</option>`;
   };
   const groups = (typeof GROUP_ORDER!=='undefined' && typeof GROUP_META!=='undefined')
     ? GROUP_ORDER.map(k=>GROUP_META[k])
     : [{icon:'🎒',name:'Primaire',levels:(typeof PRIMARY_LEVELS!=='undefined'?PRIMARY_LEVELS:['CP','CE1','CE2','CM1','CM2'])},
        {icon:'🎓',name:'Collège',levels:(typeof COLLEGE_LEVELS!=='undefined'?COLLEGE_LEVELS:[])}];
   ls.innerHTML = groups.map(g=>
     `<optgroup label="${g.icon} ${g.name}">${g.levels.map(opt).join('')}</optgroup>`
   ).join('');
  }
  const inp = document.getElementById('mc-input');
  if(inp) inp.value = (P && P.prefs && P.prefs.mode) || 'keyboard';
 }
 navTo('v-mode-config');
}

// Rendu des lignes joueurs du sous-écran Combat
function mcRenderCombat(){
 const box = document.getElementById('mc-combat-rows');
 if(!box) return;
 const KN = (typeof getRoster==='function') ? getRoster() : [];
 const _esc = (typeof esc==='function') ? esc : (s=>String(s).replace(/[<>"']/g,''));
 box.innerHTML = _mcCombat.map((p,i)=>{
  const isCustom = !KN.includes(p.name);
  return `<div style="display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.04);padding:8px;border-radius:8px;">
   <span style="font-size:1.1em;">👤</span>
   <select onchange="mcCombatName(${i},this.value)" style="flex:1.2;margin:0;">
    ${KN.map(n=>`<option value="${_esc(n)}"${n===p.name?' selected':''}>${_esc(n)}</option>`).join('')}
    <option value="__c__"${isCustom?' selected':''}>✏️ Autre…</option>
   </select>
   ${isCustom?`<input type="text" placeholder="Prénom…" value="${_esc(p.name)}" maxlength="16" oninput="_mcCombat[${i}].name=this.value" style="flex:1;margin:0;">`:''}
   <select onchange="_mcCombat[${i}].level=this.value" style="flex:.7;margin:0;">
    ${(()=>{ const _gi=(l)=>(typeof _groupIcon==='function')?_groupIcon(l)+' ':''; const _ll=(l)=>(typeof _levelLabel==='function')?_levelLabel(l):l; const o=(l)=>`<option value="${l}"${l===p.level?' selected':''}>${_gi(l)}${_ll(l)}</option>`; const prim=(typeof PRIMARY_LEVELS!=='undefined')?PRIMARY_LEVELS:['CP','CE1','CE2','CM1','CM2']; const coll=(typeof COLLEGE_LEVELS!=='undefined')?COLLEGE_LEVELS:[]; const gm=(typeof GROUP_META!=='undefined')?GROUP_META:{primaire:{icon:'🎒',name:'Primaire'},college:{icon:'🎓',name:'Collège'}}; return `<optgroup label="${gm.primaire.icon} ${gm.primaire.name}">${prim.map(o).join('')}</optgroup>`+(coll.length?`<optgroup label="${gm.college.icon} ${gm.college.name}">${coll.map(o).join('')}</optgroup>`:''); })()}
   </select>
   ${_mcCombat.length>2?`<button onclick="mcRmCombat(${i})" style="background:#c0392b;padding:4px 9px;font-size:.8em;margin:0;">✕</button>`:''}
  </div>`;
 }).join('');
 const addBtn = document.getElementById('mc-add-btn');
 if(addBtn) addBtn.style.display = _mcCombat.length>=5 ? 'none' : '';
}
function mcCombatName(i,v){ _mcCombat[i].name = (v==='__c__') ? '' : v; mcRenderCombat(); }
function mcAddCombatPlayer(){ if(_mcCombat.length<5){ _mcCombat.push({name:'',level:'CP'}); mcRenderCombat(); } }
function mcRmCombat(i){ _mcCombat.splice(i,1); mcRenderCombat(); }

// Lance la partie avec la config du sous-écran
function mcStart(){
 if(_mcMode === 'combat'){
  const valid = _mcCombat.filter(p=>p.name && p.name.trim());
  if(valid.length < 2){
   if(typeof toast==='function') toast('⚠️ Il faut au moins 2 joueurs nommés !', 3000);
   else alert('Il faut au moins 2 joueurs nommés !');
   return;
  }
  // Alimenter la structure globale combatCfg utilisée par startGame
  combatCfg = valid.map(p=>({ name:p.name.trim(), level:p.level||'CP' }));
  const ic = document.getElementById('mc-input-combat');
  const inputMode = ic ? ic.value : 'keyboard';
  // Positionner les selects cachés
  const ms=$('modeSelect'), gm=$('gameModeSelect');
  if(ms) ms.value = inputMode;
  if(gm) gm.value = 'combat';
  window._forcedMode = 'combat';
  window._forcedInput = inputMode;
  if(typeof startGame==='function') startGame();
 } else {
  const lvl = document.getElementById('mc-level');
  const inp = document.getElementById('mc-input');
  const level = lvl ? lvl.value : 'CP';
  const inputMode = inp ? inp.value : 'keyboard';
  // Positionner les selects cachés
  const ls=$('levelSelect'), ms=$('modeSelect'), gm=$('gameModeSelect');
  if(ls){
   // S'assurer que l'option existe dans le select caché
   if(![...ls.options].some(o=>o.value===level)){
    const opt=document.createElement('option'); opt.value=level; opt.textContent=level; ls.appendChild(opt);
   }
   ls.value = level;
  }
  if(ms) ms.value = inputMode;
  if(gm) gm.value = _mcMode;
  window._forcedMode = _mcMode;
  window._forcedLevel = level;
  window._forcedInput = inputMode;
  if(typeof startGame==='function') startGame();
 }
}
