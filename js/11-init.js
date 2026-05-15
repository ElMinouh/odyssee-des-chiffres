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
 const maxW = isLarge ? '360px' : '280px';
 logo.style.maxWidth = `min(${maxW}, 80%)`;
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
 setTimeout(() => { splash.classList.add('skipped'); }, 10800);
})();

window.onload=()=>{
 // OPT-1+2 : init des références DOM cachées et du canvas particules
 _initCachedDOM();
 // Force l'affichage correct : seul v-menu visible au démarrage
 showView('v-menu');
 document.querySelectorAll('.accordion').forEach(btn=>{
  btn.addEventListener('click',function(){const p=this.nextElementSibling;p.style.display=p.style.display==='block'?'none':'block';});
 });
 $('gameModeSelect').addEventListener('change',()=>{if($('gameModeSelect').value!=='combat')combatCfg=[];});
 $('themeSelect').addEventListener('change',()=>savePrefs());
 $('modeSelect').addEventListener('change',()=>savePrefs());
 $('parent-player').addEventListener('change',()=>{renderReport();renderWeeklySummary();});
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
