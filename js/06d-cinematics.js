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
 */
function playZoneVictory(zone, done){
 const cfg = ZONE_CINEMATICS[zone.id];
 if(!cfg){ done?.(); return; }
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

// ── Implémentation interne ──────────────────────────────────
function _playCinematic(opts, done){
 const overlay = document.createElement('div');
 overlay.className = 'zone-cinematic' + (opts.victory ? ' zc-victory' : '');
 overlay.style.background = opts.bg;
 // Couches : particules en fond, texte en avant
 const particlesHtml = Array.from({length: 24}).map((_,i)=>{
  const e = opts.particles[i % opts.particles.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const dur = 2.5 + Math.random() * 1.8;
  return `<span class="zc-particle" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;">${e}</span>`;
 }).join('');
 overlay.innerHTML = `
  <div class="zc-particles">${particlesHtml}</div>
  <div class="zc-content">
   <div class="zc-emoji">${opts.emoji}</div>
   <div class="zc-title">${opts.title}</div>
   <div class="zc-subtitle">${opts.subtitle}</div>
   ${opts.subtitleSmall ? `<div class="zc-subtitle-small">${opts.subtitleSmall}</div>` : ''}
  </div>
 `;
 document.body.appendChild(overlay);
 // Joue le jingle ascendant
 if(typeof beep === 'function' && Array.isArray(opts.jingle)){
  opts.jingle.forEach((freq, i) => setTimeout(()=>beep(freq, 'sine', .4, .12), i * 160));
 }
 // Vibration légère sur l'arrivée
 if(typeof vibrate === 'function' && typeof VIBE !== 'undefined'){
  vibrate(opts.victory ? VIBE.boss : VIBE.good);
 }
 // Fade-out automatique
 setTimeout(() => {
  overlay.classList.add('zc-fadeout');
  setTimeout(() => {
   overlay.remove();
   done?.();
  }, 400);
 }, opts.duration);
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