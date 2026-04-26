// 11-init.js — L'Odyssée des Chiffres
'use strict';

// Initialisation : exécutée une fois le DOM prêt.

// ═══════════════════════════════════════════════════════
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
};
