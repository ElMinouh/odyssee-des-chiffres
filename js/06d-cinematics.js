// 06d-cinematics.js — L'Odyssée des Chiffres
'use strict';
// ═══════════════════════════════════════════════════════
// CINÉMATIQUES DE ZONE (chantier 3.10)
// ═══════════════════════════════════════════════════════
// Cinématique d'entrée (~3 sec) avant le combat de boss de zone,
// et cinématique de victoire quand la zone est conquise.

// Profil narratif et visuel par zone
const ZONE_CINEMATICS = {
 plaine: {
  intro:   'Les vents portent l\'écho de tes premiers pas…',
  victory: 'La plaine est apaisée. La nature te salue !',
  particles: ['🌿','🌱','🍃','🦋','🌾'],
  bgEntry:  'linear-gradient(180deg,#74b9ff 0%,#27ae60 60%,#1b6b3a 100%)',
  jingle: [392, 494, 587, 740],
  victoryJingle: [523, 659, 784, 1047, 1319],
 },
 foret: {
  intro:   'Les arbres murmurent ton arrivée dans la forêt enchantée.',
  victory: 'La canopée s\'illumine. La forêt est libérée !',
  particles: ['🍂','🌳','🦉','🍄','✨'],
  bgEntry:  'linear-gradient(180deg,#1b6b3a 0%,#2ecc71 100%)',
  jingle: [330, 415, 494, 622],
  victoryJingle: [392, 494, 587, 784, 988],
 },
 desert: {
  intro:   'Le soleil de plomb du désert sculpte ton ombre dans le sable.',
  victory: 'L\'oasis émerge. Le désert te révèle ses secrets !',
  particles: ['🔥','☀️','🏜️','💎','✨'],
  bgEntry:  'linear-gradient(180deg,#e67e22 0%,#c0392b 100%)',
  jingle: [294, 370, 466, 587],
  victoryJingle: [466, 587, 740, 932, 1175],
 },
 glace: {
  intro:   'Le froid pique tes joues. Les pics de glace t\'observent…',
  victory: 'La glace fond, l\'air vibre de cristal. La voie est libre !',
  particles: ['❄️','🧊','✨','💎','⛄'],
  bgEntry:  'linear-gradient(180deg,#74b9ff 0%,#2980b9 100%)',
  jingle: [523, 659, 784, 988],
  victoryJingle: [659, 784, 988, 1175, 1397],
 },
 volcan: {
  intro:   'Une chaleur infernale fait trembler la terre… Le volcan rugit !',
  victory: 'Les flammes s\'apaisent. Le volcan est dompté !',
  particles: ['🔥','🌋','💥','⚡','💎'],
  bgEntry:  'linear-gradient(180deg,#8b0000 0%,#e74c3c 100%)',
  jingle: [220, 277, 330, 415],
  victoryJingle: [330, 415, 494, 659, 831],
 },
 espace: {
  intro:   'Tu franchis le voile de l\'espace. Les étoiles t\'attendent.',
  victory: 'La galaxie résonne de ta gloire. L\'infini t\'appartient !',
  particles: ['⭐','🌟','✨','🪐','🌠'],
  bgEntry:  'linear-gradient(180deg,#1a1c2c 0%,#9b59b6 100%)',
  jingle: [659, 784, 988, 1319],
  victoryJingle: [784, 988, 1175, 1397, 1568],
 },
};

const ZONE_CINEMATIC_DURATION = 3000;     // entrée
const ZONE_VICTORY_DURATION   = 4000;     // victoire (un peu plus longue)

/**
 * Joue la cinématique d'entrée d'une zone, puis appelle `done`.
 */
function playZoneIntro(zone, done){
 const cfg = ZONE_CINEMATICS[zone.id];
 if(!cfg){ done?.(); return; }
 _playCinematic({
  bg: cfg.bgEntry,
  emoji: zone.emoji,
  particles: cfg.particles,
  title: zone.label.toUpperCase(),
  subtitle: cfg.intro,
  jingle: cfg.jingle,
  duration: ZONE_CINEMATIC_DURATION,
 }, done);
}

/**
 * Joue la cinématique de conquête d'une zone, puis appelle `done`.
 * v8.7.30 : fallback générique pour les zones non couvertes par ZONE_CINEMATICS.
 * Toujours une animation, même pour les zones sans config dédiée.
 */
function playZoneVictory(zone, done){
 const cfg = ZONE_CINEMATICS[zone.id] || _genericZoneCinematic(zone);
 _playCinematic({
  bg: cfg.bgEntry,
  emoji: '🏆',
  particles: cfg.particles,
  title: 'ZONE CONQUISE !',
  subtitle: cfg.victory,
  subtitleSmall: zone.label,
  jingle: cfg.victoryJingle,
  duration: ZONE_VICTORY_DURATION,
  victory: true,
 }, done);
}

// v8.7.30 : génère une config cinématique générique pour les zones non personnalisées.
// Utilise la couleur du boss (zone.col fallback) et des particules d'étoiles génériques.
function _genericZoneCinematic(zone){
 // Couleur de base = celle du thème si dispo, sinon doré
 const themeColors = {
  standard:'#74b9ff', foret:'#27ae60', volcan:'#e74c3c',
  ocean:'#3498db', banquise:'#5dade2', chateau:'#7f8c8d',
  sakura:'#f48fb1', nuit:'#5b3a8e', espace:'#9b59b6',
 };
 const base = themeColors[zone.theme] || '#f1c40f';
 return {
  victory: 'La zone est libérée. Tu as triomphé !',
  particles: ['⭐','✨','🌟','💫','🎉','🏆'],
  bgEntry: `radial-gradient(circle at 50% 40%, ${base} 0%, #1a1c2c 100%)`,
  victoryJingle: [523, 659, 784, 988, 1175, 1397],
 };
}

/**
 * v8.7.30 : Cinématique SPECTACULAIRE de conquête d'un îlot entier.
 * Déclenchée quand toutes les zones d'une région sont battues.
 * Beaucoup plus visuelle que playZoneVictory : feux d'artifice, bannière géante,
 * liste des zones cochées, et récompense bonus +50 ⭐.
 */
function playIslandVictory(regionId, done){
 // Trouver la région et ses zones
 const region = (typeof _ARCH_REGIONS !== 'undefined')
  ? _ARCH_REGIONS.find(r => r.id === regionId) : null;
 if(!region){ done?.(); return; }
 const zonesInRegion = (typeof MAP_ZONES !== 'undefined')
  ? MAP_ZONES.filter(z => region.levels.includes(z.level)) : [];
 if(zonesInRegion.length === 0){ done?.(); return; }
 // Couleur thématique selon la région
 const regionColors = {
  cp:    { bg:'linear-gradient(180deg,#27ae60 0%,#74b9ff 50%,#1b6b3a 100%)', accent:'#a8e6a2' },
  ce1:   { bg:'linear-gradient(180deg,#1b6b3a 0%,#2ecc71 50%,#0e3a1c 100%)', accent:'#5fb95a' },
  ce2:   { bg:'linear-gradient(180deg,#c87b27 0%,#e67e22 50%,#7d3c0f 100%)', accent:'#f6cb8b' },
  cm1:   { bg:'linear-gradient(180deg,#74b9ff 0%,#4b6584 50%,#1f2733 100%)', accent:'#b6c8d4' },
  cm2:   { bg:'linear-gradient(180deg,#3a0a4a 0%,#9b59b6 50%,#1a0d2e 100%)', accent:'#cbb1ee' },
  final: { bg:'linear-gradient(180deg,#b7950b 0%,#f1c40f 50%,#6a4d04 100%)', accent:'#fff4c0' },
 };
 const colors = regionColors[regionId] || regionColors.cp;
 // Crédit bonus +50 ⭐ (immédiat)
 const BONUS_STARS = 50;
 try{
  if(typeof P !== 'undefined' && P){
   P.stars = (P.stars || 0) + BONUS_STARS;
   if(typeof saveProfileNow === 'function') saveProfileNow();
   if(typeof updateMenuUI === 'function') updateMenuUI();
  }
 }catch(e){ console.warn('Bonus stars credit failed', e); }
 // Construction de l'overlay
 const overlay = document.createElement('div');
 overlay.className = 'island-cinematic';
 overlay.style.background = colors.bg;
 // 80 particules feux d'artifice
 const fwEmojis = ['🎆','🎇','✨','⭐','🌟','💫','🎉','🎊'];
 const fwHtml = Array.from({length: 80}).map((_,i)=>{
  const e = fwEmojis[i % fwEmojis.length];
  const left = Math.random() * 100;
  const top = Math.random() * 70;
  const delay = Math.random() * 2.2;
  const dur = 1.8 + Math.random() * 2.2;
  const sz = 0.7 + Math.random() * 1.6;
  return `<span class="ic-firework" style="left:${left}%;top:${top}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${sz}em;">${e}</span>`;
 }).join('');
 // Liste des zones avec checkmarks (animées une à une)
 const zonesList = zonesInRegion.map((z, i) => `
  <li class="ic-zone-item" style="animation-delay:${0.8 + i * 0.18}s;color:${colors.accent};">
   <span class="ic-zone-check">✓</span>
   <span class="ic-zone-emoji">${z.emoji}</span>
   <span class="ic-zone-name">${z.label}</span>
  </li>`).join('');
 overlay.innerHTML = `
  <div class="ic-fireworks">${fwHtml}</div>
  <div class="ic-content">
   <div class="ic-banner" style="background:${colors.accent};">ÎLOT CONQUIS !</div>
   <div class="ic-region-name">${region.label}</div>
   <ul class="ic-zone-list">${zonesList}</ul>
   <div class="ic-bonus" style="background:${colors.accent};">+${BONUS_STARS} ⭐ Bonus Conquérant</div>
   <div class="ic-skip-hint">Toucher pour passer</div>
  </div>
 `;
 document.body.appendChild(overlay);
 // Narration vocale
 if(typeof speak === 'function'){
  setTimeout(()=>{ try{ speak(`${region.label} : îlot conquis ! Bonus de ${BONUS_STARS} étoiles.`); }catch(e){} }, 400);
 }
 // Jingle plus long et plus aigu pour marquer l'événement
 if(typeof beep === 'function'){
  const jingle = [523, 659, 784, 988, 1175, 1397, 1568, 1760];
  jingle.forEach((freq, i) => setTimeout(()=>beep(freq, 'sine', .45, .14), i * 140));
 }
 // Vibration plus longue
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate([60, 40, 60, 40, 100]);
 }
 // Skip au tap + fermeture auto après 6.5s
 const DURATION = 6500;
 let _closed = false;
 const _close = () => {
  if(_closed) return;
  _closed = true;
  clearTimeout(_autoCloseTimer);
  overlay.removeEventListener('click', _close);
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
  overlay.classList.add('ic-fadeout');
  setTimeout(()=>{
   overlay.remove();
   done?.();
  }, 450);
 };
 const _autoCloseTimer = setTimeout(_close, DURATION);
 overlay.addEventListener('click', _close);
}

// ── Implémentation interne ──────────────────────────────────
function _playCinematic(opts, done){
 const overlay = document.createElement('div');
 overlay.className = 'zone-cinematic' + (opts.victory ? ' zc-victory' : '');
 overlay.style.background = opts.bg;
 // v8.7.30 : 40 particules (au lieu de 24) pour une animation plus riche
 const N_PARTICLES = opts.victory ? 40 : 24;
 const particlesHtml = Array.from({length: N_PARTICLES}).map((_,i)=>{
  const e = opts.particles[i % opts.particles.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const dur = 2.5 + Math.random() * 1.8;
  return `<span class="zc-particle" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">${e}</span>`;
 }).join('');
 // v8.7.30 : pour une victoire, ajout d'un anneau lumineux qui explose du centre
 // + pluie d'étoiles supplémentaires depuis le haut.
 const ringHtml = opts.victory ? `<div class="zc-ring"></div><div class="zc-ring zc-ring-2"></div>` : '';
 const starsHtml = opts.victory ? Array.from({length: 18}).map((_,i)=>{
  const left = Math.random() * 100;
  const delay = Math.random() * 1.2;
  const dur = 2.0 + Math.random() * 1.5;
  return `<span class="zc-star-rain" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">⭐</span>`;
 }).join('') : '';
 overlay.innerHTML = `
  <div class="zc-particles">${particlesHtml}</div>
  ${starsHtml}
  ${ringHtml}
  <div class="zc-content">
   <div class="zc-emoji">${opts.emoji}</div>
   <div class="zc-title">${opts.title}</div>
   <div class="zc-subtitle">${opts.subtitle}</div>
   ${opts.subtitleSmall ? `<div class="zc-subtitle-small">${opts.subtitleSmall}</div>` : ''}
   ${opts.victory ? '<div class="zc-skip-hint">Toucher pour passer</div>' : ''}
  </div>
 `;
 document.body.appendChild(overlay);
 // v8.7.0 : narration vocale du résultat (voix claire et posée)
 if(typeof speak === 'function'){
  const _spoken = [opts.title, opts.subtitle].filter(Boolean).join('. ');
  if(_spoken) setTimeout(()=>{ try{ speak(_spoken); }catch(e){} }, 300);
 }
 // Joue le jingle ascendant
 if(typeof beep === 'function' && Array.isArray(opts.jingle)){
  opts.jingle.forEach((freq, i) => setTimeout(()=>beep(freq, 'sine', .4, .12), i * 160));
 }
 // Vibration légère sur l'arrivée
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate(opts.victory ? VIBE.boss : VIBE.good);
 }
 // v8.7.30 : skip au tap pour la victoire (entrée non skippable pour préserver l'immersion)
 let _closed = false;
 const _close = () => {
  if(_closed) return;
  _closed = true;
  clearTimeout(_autoTimer);
  if(opts.victory) overlay.removeEventListener('click', _close);
  try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
  overlay.classList.add('zc-fadeout');
  setTimeout(() => {
   overlay.remove();
   done?.();
  }, 400);
 };
 const _autoTimer = setTimeout(_close, opts.duration);
 if(opts.victory) overlay.addEventListener('click', _close);
}
// ═══════════════════════════════════════════════════════
// SKIN DE ZONE PENDANT LA PARTIE (chantier B4)
// ═══════════════════════════════════════════════════════
// Ajoute un fond animé thématique pendant le combat (10-15 particules
// qui dérivent lentement). Toggle ON/OFF via #ambianceToggle.

let _zoneSkinEl = null;

/**
 * Active le skin pour une zone donnée. Si une partie n'est pas dans une zone,
 * on n'affiche rien (mode normal hors carte).
 */
function startZoneSkin(zone){
 stopZoneSkin();
 if(!zone || !ZONE_CINEMATICS[zone.id]) return;
 // Vérif toggle utilisateur
 const toggle = document.getElementById('ambianceToggle');
 if(toggle && !toggle.checked) return;
 const cfg = ZONE_CINEMATICS[zone.id];
 const skin = document.createElement('div');
 skin.className = 'zone-skin';
 skin.style.background = cfg.bgEntry;
 // 12 particules qui dérivent lentement
 const particlesHtml = Array.from({length: 12}).map((_,i)=>{
  const e = cfg.particles[i % cfg.particles.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 15;
  const dur = 15 + Math.random() * 10;
  return `<span class="zs-particle" style="left:${left}%;animation-delay:-${delay}s;animation-duration:${dur}s;">${e}</span>`;
 }).join('');
 skin.innerHTML = `<div class="zs-particles">${particlesHtml}</div>`;
 document.body.appendChild(skin);
 _zoneSkinEl = skin;
}

function stopZoneSkin(){
 if(_zoneSkinEl){
  _zoneSkinEl.remove();
  _zoneSkinEl = null;
 }
}

/**
 * Sauvegarde la préférence d'ambiance dans localStorage (global, pas par profil
 * car c'est un confort visuel comme la musique).
 */
function saveAmbiance(){
 const toggle = document.getElementById('ambianceToggle');
 if(!toggle) return;
 localStorage.setItem('ambiance_enabled', toggle.checked ? '1' : '0');
 // Si pendant une partie, réagir immédiatement
 if(typeof GM !== 'undefined' && GM.mapZone){
  if(toggle.checked) startZoneSkin(GM.mapZone);
  else stopZoneSkin();
 }
}

function loadAmbiancePref(){
 const toggle = document.getElementById('ambianceToggle');
 if(!toggle) return;
 const v = localStorage.getItem('ambiance_enabled');
 toggle.checked = (v === null) ? true : (v === '1');
}

// ═══════════════════════════════════════════════════════
// Chantier B3 : Préférence "Mouvement" (parallaxe carte)
// ═══════════════════════════════════════════════════════
// Stockée globalement (comme l'ambiance), respecte aussi prefers-reduced-motion.
function saveParallax(){
 const toggle = document.getElementById('parallaxToggle');
 if(!toggle) return;
 localStorage.setItem('parallax_enabled', toggle.checked ? '1' : '0');
 // v8.7.5 : figer aussi la décoration de fond animée des thèmes
 try{ document.body.classList.toggle('no-parallax', !toggle.checked); }catch(e){}
 // Si la carte est ouverte, réagir immédiatement
 if(typeof refreshParallaxState === 'function') refreshParallaxState();
}

function loadParallaxPref(){
 const toggle = document.getElementById('parallaxToggle');
 if(!toggle) return;
 const v = localStorage.getItem('parallax_enabled');
 toggle.checked = (v === null) ? true : (v === '1');
 // v8.7.5 : appliquer l'état à la décoration de fond dès le chargement
 try{ document.body.classList.toggle('no-parallax', !toggle.checked); }catch(e){}
}

/**
 * Source de vérité pour savoir si l'effet parallaxe doit être actif.
 * Combine : la préférence utilisateur + le respect de prefers-reduced-motion.
 */
function getParallaxEnabled(){
 // Respect strict de prefers-reduced-motion : prioritaire sur la pref
 try{
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
 }catch(e){}
 const v = localStorage.getItem('parallax_enabled');
 return v === null ? true : (v === '1');
}