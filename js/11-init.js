// 11-init.js — L'Odyssée des Chiffres
'use strict';

// Initialisation : exécutée une fois le DOM prêt.

// ═══════════════════════════════════════════════════════
// Ajustement adaptatif du logo principal (v8.5.6)
// Le style inline garantit que la taille s'applique malgré
// d'éventuels conflits de cache CSS. Adaptatif PC/mobile.
// ═══════════════════════════════════════════════════════
function adjustGameLogoSize(){
 const logo = document.getElementById('game-logo-menu');
 if(!logo) return;
 const isLarge = window.innerWidth >= 768;
 const maxW = isLarge ? '180px' : '100px';
 logo.style.maxWidth = `min(${maxW}, ${isLarge ? '45%' : '32%'})`;
}
// Au chargement et au resize
window.addEventListener('DOMContentLoaded', adjustGameLogoSize);
window.addEventListener('resize', adjustGameLogoSize);
// Sécurité : aussi à l'init
adjustGameLogoSize();

// ═══════════════════════════════════════════════════════
// Chantier visuel v8.5.1 : gestion du splash screen narratif
// Affiché 10 secondes au tout premier chargement de la session.
// Animation en 4 phases : boussole centrale + chiffres volants → convergence → carte
// Si l'utilisateur clique/touche, on saute le splash immédiatement.
// On utilise sessionStorage pour ne PAS l'afficher à chaque navigation.
// ═══════════════════════════════════════════════════════
(function handleSplash(){
 const splash = document.getElementById('splash-screen');
 if(!splash) return;
 let alreadySeen = false;
 try{ alreadySeen = sessionStorage.getItem('splashSeen') === '1'; }catch(e){}
 if(alreadySeen){ splash.classList.add('skipped'); return; }
 try{ sessionStorage.setItem('splashSeen', '1'); }catch(e){}
 const vid = document.getElementById('intro-video');
 const cont = document.getElementById('intro-continue');
 const loading = document.getElementById('intro-loading');
 const muteBtn = document.getElementById('intro-mute');
 let done = false;
 const finish = () => {
  splash.style.transition = 'opacity .4s';
  splash.style.opacity = '0';
  setTimeout(() => { splash.classList.add('skipped'); }, 400);
 };
 // Audit qualité perçue #5 : sur une connexion lente, window.onload (qui
 // charge le profil et initialise l'écran d'accueil) peut ne pas être
 // terminé au moment où l'utilisateur passe ou termine la vidéo. Plutôt que
 // de révéler un menu pas encore prêt (clic sans effet, aucun signe de vie),
 // on affiche un signe de chargement — même identité visuelle (pulsation)
 // que « Appuie pour continuer » — le temps que window.onload se termine.
 const waitReadyThen = (action) => {
  if(window._appReady){ action(); return; }
  if(cont) cont.classList.add('hidden');
  if(loading) loading.classList.remove('hidden');
  let waited = 0;
  const check = setInterval(() => {
   waited += 150;
   // Filet de sécurité : ne jamais bloquer indéfiniment (ex. réseau coupé
   // pendant le préchargement de la vidéo, qui empêcherait "load" de se
   // déclencher). Mieux vaut révéler l'app après 8s même si _appReady
   // n'est jamais passé à true, comme c'était déjà le cas avant ce correctif.
   if(window._appReady || waited >= 8000){
    clearInterval(check);
    if(loading) loading.classList.add('hidden');
    action();
   }
  }, 150);
 };
 const skip = () => {
  if(done) return; done = true;
  try{ if(vid) vid.pause(); }catch(e){}
  waitReadyThen(finish);
 };
 splash.addEventListener('click', skip);
 splash.addEventListener('touchstart', skip, { passive: true });
 if(vid){
  vid.muted = false;                                   // musique dès le début
  const pr = vid.play();
  if(pr && pr.catch){ pr.catch(() => { vid.muted = true; if(muteBtn) muteBtn.textContent = '🔇'; vid.play().catch(()=>{}); }); } // repli si autoplay sonore bloqué
  if(muteBtn){
   muteBtn.addEventListener('click', (e) => { e.stopPropagation(); vid.muted = !vid.muted; muteBtn.textContent = vid.muted ? '🔇' : '🔊'; });
   muteBtn.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
  }
  vid.addEventListener('ended', () => { waitReadyThen(() => { if(cont) cont.classList.remove('hidden'); }); });  // fige + texte
 } else {
  setTimeout(() => { waitReadyThen(finish); }, 1500);
 }
})();

// ═══════════════════════════════════════════════════════
// v9.4.16 : garde-fou de chargement des modules.
// Si un fichier JS manque au déploiement (copie oubliée, cache SW partiel),
// l'écran cassait silencieusement. Ici : détection + message clair.
// ═══════════════════════════════════════════════════════
function _bootSanityCheck(){
 const required = {
  '01-core': ['esc','toast','navTo','pickMonster'],
  '02-data': ['getRoster','heroGender'],
  '03-figurines-data': ['getCharPortrait'],
  '04-questions': ['genQ_CP'],
  '05-profile': ['loadProfile','validateProfile','saveProfile'],
  '06a-adaptive': ['_progPhase','logError','getRevisionErrorToAsk'],
  '06b-time-block': ['isTimeBlocked'],
  '06c-seasonal': ['getActiveSeasonalBoss'],
  '06d-cinematics': ['playZoneIntro','playZoneVictory'],
  '07-game': ['generateQ','renderQ','validate'],
  '07-map': ['openMap','renderMap','startAdventure'],
  '07-boss': ['openAdventureLog'],
  '07-story': ['_storyText'],
  '08-ui': ['renderHistory','renderMilestones'],
  '09-parent': ['openParent','renderReport'],
  '10-figurines': ['renderFigCollection'],
  '12-cloud': ['ensureCloudCode'],
  '13-maternelle': ['_matGen'],
  '14-primaire': ['_primEnrich'],
  '15-college': ['_collEnrich'],
  '16-francais': ['_frRnd'],
  '17-messaging': ['ensureChatIdentity'],
  '18-histoire': ['_histCatOf'],
  '19-onboarding': ['_obNoteProfileCreated'],
 };
 // v11.7.4 (correctif urgent) : le garde-fou ne s'appuie plus QUE sur
 // typeof window[sym] (fonctions uniquement, jamais de const) — la CSP ajoutée
 // en v11.7.3 bloque eval() (pas de 'unsafe-eval' dans script-src), ce qui
 // faisait échouer silencieusement toute vérification passant par eval() et
 // affichait à tort le bandeau "Chargement incomplet" à chaque démarrage.
 const missing = [];
 for(const mod in required){
  for(const sym of required[mod]){
   if(typeof window[sym] === 'undefined') missing.push(mod+'.'+sym);
  }
 }
 if(missing.length){
  console.error('[Odyssée] Modules incomplets au boot :', missing);
  try{
   const d = document.createElement('div');
   d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#c0392b;color:#fff;font-size:14px;padding:10px 14px;text-align:center;';
   d.innerHTML = '⚠️ Chargement incomplet (' + esc(missing.slice(0,3).join(', ')) + (missing.length>3?'…':'') + '). Recharge la page ; si ça persiste, vide le cache.';
   document.body.appendChild(d);
   setTimeout(()=>d.remove(), 12000);
  }catch(e){}
 }
 return missing.length === 0;
}

window.onload=()=>{
try{
 try{ _bootSanityCheck(); }catch(e){}
 // OPT-1+2 : init des références DOM cachées et du canvas particules
 try{ _initCachedDOM(); }catch(e){ console.error('[init] _initCachedDOM a échoué', e); }
 // Force l'affichage correct : seul v-menu visible au démarrage
 try{ showView('v-menu'); }catch(e){ console.error('[init] showView a échoué', e); }
 try{
  document.querySelectorAll('.accordion').forEach(btn=>{
   btn.addEventListener('click',function(){const p=this.nextElementSibling;p.style.display=p.style.display==='block'?'none':'block';});
  });
 }catch(e){ console.error('[init] listeners accordéon ont échoué', e); }
 // v11.7.3 (audit n°1) : chaque listener protégé individuellement — un seul
 // élément DOM manquant ne doit plus interrompre le reste de l'initialisation
 // (restauration lastPlayer, thème, loadProfile, numpad, cloud sync…).
 try{ $('gameModeSelect').addEventListener('change',()=>{if($('gameModeSelect').value!=='combat')combatCfg=[];}); }catch(e){ console.error('[init] listener gameModeSelect a échoué', e); }
 try{ $('modeSelect').addEventListener('change',()=>savePrefs()); }catch(e){ console.error('[init] listener modeSelect a échoué', e); }
 try{ $('parent-player').addEventListener('change',()=>{renderReport();renderWeeklySummary();}); }catch(e){ console.error('[init] listener parent-player a échoué', e); }
 // v8.7.0 : nettoyage des profils corrompus (clés user_undefined, user_null,
 // ou JSON illisible / sans nom). On NE touche JAMAIS aux profils valides
 // (ceux avec un name défini), pour ne pas casser les sauvegardes actives.
 try{
  const toDelete = [];
  for(let i=0;i<localStorage.length;i++){
   const k = localStorage.key(i);
   if(!k || !k.startsWith('user_')) continue;
   const suffix = k.slice(5);
   // Clés explicitement corrompues
   if(suffix === 'undefined' || suffix === 'null' || suffix === ''){
    toDelete.push(k);
    continue;
   }
   // Contenu illisible ou profil sans nom valide
   try{
    const p = JSON.parse(localStorage.getItem(k));
    if(!p || typeof p !== 'object' || !p.name || p.name === 'undefined' || p.name === 'null'){
     toDelete.push(k);
    }
   }catch(e){
    toDelete.push(k); // JSON corrompu
   }
  }
  toDelete.forEach(k=>{
   try{ localStorage.removeItem(k); }catch(e){}
  });
  if(toDelete.length && typeof console!=='undefined'){
   console.log('[CLEANUP] profils corrompus supprimés:', toDelete.join(', '));
  }
 }catch(e){ /* nettoyage best-effort, ne bloque jamais le démarrage */ }
 // v8.6.3 : restaurer le dernier joueur actif (lastPlayer) AVANT loadProfile.
 // Indispensable pour que la récupération cloud forcée fonctionne :
 // forceRestoreFromCloud écrit lastPlayer puis recharge la page.
 try{
  if(typeof fillPlayerSelect==='function') fillPlayerSelect();
  const lastP = localStorage.getItem('lastPlayer');
  if(lastP){
   const sel = $('playerSelect');
   // Le joueur est-il dans la liste des options ?
   const optionExists = Array.from(sel.options).some(o => o.value === lastP || o.text === lastP);
   if(optionExists){
    sel.value = lastP;
   } else {
    // Joueur custom : on l'ajoute et sélectionne "Autre" + customInput
    localStorage.setItem('customPlayerName', lastP);
    sel.value = 'Autre';
    const ci = $('customInput');
    if(ci){ ci.value = lastP; }
    const cz = $('custom-zone');
    if(cz){ cz.classList.remove('hidden'); }
   }
  }
 }catch(e){ console.warn('[init] restauration lastPlayer échouée', e); }
 // v8.7.6 : appliquer le thème sauvegardé AVANT loadProfile, pour éviter
 // un flash du thème classique et garantir la persistance même si le
 // profil n'a pas encore la pref (clé globale = dernier choix explicite).
 try{
  const gTheme = localStorage.getItem('odyssee_theme');
  if(gTheme && typeof applyTheme==='function'){
   applyTheme(gTheme);
   const ts=$('themeSelect'); if(ts) ts.value=gTheme;
  }
 }catch(e){}
 loadProfile();
 loadVibrate();
 loadVoice();
 // Chantier B4 : préférence ambiance
 if(typeof loadAmbiancePref==='function') loadAmbiancePref();
 // Chantier B3 : préférence parallaxe (mouvement)
 if(typeof loadParallaxPref==='function') loadParallaxPref();
 setupNumpad();
 // Init voix française dès que la liste des voix est disponible
 if(window.speechSynthesis){
  _frVoice=_pickFrenchVoice();
  // Sur certains navigateurs, getVoices() est vide au premier appel
  window.speechSynthesis.addEventListener?.('voiceschanged',()=>{_frVoice=_pickFrenchVoice();});
 }
 // Sauvegarde auto quand on coche/décoche la case 🔊 Voix
 $('voiceToggle')?.addEventListener('change',saveVoice);
 // OPT-16 : préchargement discret des GIFs de victoire après 4 secondes
 setTimeout(()=>GIFS.forEach(g=>{const img=new Image();img.src=g.url;}),4000);
 // ── Drag events pour le viewer 3D ──
 const persp=$('fig-perspective');
 persp.addEventListener('mousedown',_fvDragStart);
 document.addEventListener('mousemove',_fvDragMove);
 document.addEventListener('mouseup',_fvDragEnd);
 persp.addEventListener('touchstart',e=>{_fvDragStart(e);e.preventDefault();},{passive:false});
 document.addEventListener('touchmove',e=>{_fvDragMove(e);},{passive:true});
 document.addEventListener('touchend',_fvDragEnd);
 // ── Chantier Cloud Sync : initialise après chargement du profil ──
 if(typeof initCloudSync==='function') initCloudSync();
 // v11.7.44 (correctif signalé par Cyril) : si aucun profil n'existe encore
 // sur cet appareil, lance automatiquement l'installation de démarrage —
 // à CHAQUE ouverture de l'app tant qu'aucun profil n'a été créé, même si
 // le parent a déjà cliqué "Passer" une fois.
 setTimeout(()=>{ if(typeof obMaybeAutoStartFreshInstall==='function') obMaybeAutoStartFreshInstall(); }, 500);
}finally{
 // Audit qualité perçue #5 : signale au splash screen que l'initialisation
 // est terminée — voir handleSplash() plus haut. Dans un finally pour être
 // certain que ce signal est envoyé même si une étape ci-dessus (non
 // protégée individuellement par son propre try/catch) a levé une erreur —
 // sans quoi le signe de chargement du splash tournerait indéfiniment.
 window._appReady = true;
}
};
