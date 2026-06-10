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
 // Si déjà vu cette session, on cache immédiatement
 let alreadySeen = false;
 try{ alreadySeen = sessionStorage.getItem('splashSeen') === '1'; }catch(e){}
 if(alreadySeen){
  splash.classList.add('skipped');
  return;
 }
 // Marquer comme vu dès maintenant pour éviter rebond si l'utilisateur recharge vite
 try{ sessionStorage.setItem('splashSeen', '1'); }catch(e){}
 // Permettre de skipper le splash en cliquant/touchant
 const skip = () => {
  splash.style.transition = 'opacity .4s';
  splash.style.opacity = '0';
  setTimeout(() => { splash.classList.add('skipped'); }, 400);
 };
 splash.addEventListener('click', skip, { once: true });
 splash.addEventListener('touchstart', skip, { once: true, passive: true });
 // Retrait automatique du DOM après l'animation complète (10s + 0.6s fade + marge)
 setTimeout(() => { splash.classList.add('skipped'); }, 11800);
})();

// ═══════════════════════════════════════════════════════
// v9.4.16 : garde-fou de chargement des modules.
// Si un fichier JS manque au déploiement (copie oubliée, cache SW partiel),
// l'écran cassait silencieusement. Ici : détection + message clair.
// ═══════════════════════════════════════════════════════
function _bootSanityCheck(){
 const required = {
  '01-core': ['$','esc','toast','navTo','pickMonster'],
  '02-data': ['SKINS','BOSS_ROSTER'],
  '04-questions': ['GEN'],
  '05-profile': ['loadProfile'],
  '06a-adaptive': ['_progPhase','logError','getRevisionErrorToAsk'],
  '07-game': ['generateQ','renderQ','validate'],
  '13-maternelle': ['_matGen'],
  '14-primaire': ['_primEnrich'],
  '15-college': ['_collEnrich'],
 };
 const missing = [];
 for(const mod in required){
  for(const sym of required[mod]){
   try{ if(typeof window[sym] === 'undefined' && typeof eval(sym) === 'undefined') missing.push(mod+'.'+sym); }
   catch(e){ missing.push(mod+'.'+sym); }
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
 try{ _bootSanityCheck(); }catch(e){}
 // OPT-1+2 : init des références DOM cachées et du canvas particules
 _initCachedDOM();
 // Force l'affichage correct : seul v-menu visible au démarrage
 showView('v-menu');
 document.querySelectorAll('.accordion').forEach(btn=>{
  btn.addEventListener('click',function(){const p=this.nextElementSibling;p.style.display=p.style.display==='block'?'none':'block';});
 });
 $('gameModeSelect').addEventListener('change',()=>{if($('gameModeSelect').value!=='combat')combatCfg=[];});
 $('modeSelect').addEventListener('change',()=>savePrefs());
 $('parent-player').addEventListener('change',()=>{renderReport();renderWeeklySummary();});
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
};
