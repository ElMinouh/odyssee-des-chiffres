// 07-game.js — L'Odyssée des Chiffres
'use strict';

// Flux principal du jeu : musique, particules, boutique, quêtes, badges,
// combat, pouvoirs, timers, transitions, événements aléatoires, tour de jeu,
// validation, fin de partie, carte d'exploration.

// ═══════════════════════════════════════════════════════
// CARTE D'EXPLORATION + PARALLAXE (chantier B3)
// ═══════════════════════════════════════════════════════
function openMap(){
 showView('v-map');
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
 showView('v-menu');
}

function renderMap(){
 const beaten=P.mapBossBeaten||[];
 $('map-zones').innerHTML=MAP_ZONES.map((z,i)=>{
  const prev=i===0||beaten.includes(MAP_ZONES[i-1].id);
  const done=beaten.includes(z.id);
  const cur=prev&&!done;
  let st=prev?'unlocked':'locked';if(done)st='completed';if(cur)st+=' current';
  const stars=done?'⭐⭐⭐':cur?'☆☆☆':'🔒';
  const starsTotal=P.stars||0;
  const canPlay=prev&&(starsTotal>=z.starsReq);
  // Chantier B3 : data-zone-id permet à l'observer de détecter la zone "active" pendant le scroll
  return `
   ${i>0?`<div class="map-path ${prev?'lit':''}"><svg class="mp-path-svg" viewBox="0 0 40 60" preserveAspectRatio="none"><path d="M20,0 Q5,30 20,60" fill="none" stroke="${prev?'#f1c40f':'rgba(255,255,255,.18)'}" stroke-width="2" stroke-dasharray="4 4"/></svg></div>`:''}
   <div class="map-zone" data-zone-id="${z.id}" data-zone-idx="${i}">
    <div class="map-zone-inner ${st}" style="background:${z.bg};" onclick="${canPlay?`startMapBoss('${z.id}')`:''}" title="${!canPlay?'Besoin de '+z.starsReq+' ⭐':''}">
     <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:1.8em;">${z.emoji}</span>
      <span class="zone-boss">${z.boss}</span>
     </div>
     <div class="zone-title">${done?'✅ ':cur?'⚔️ ':'🔒 '}${z.label}</div>
     <div class="zone-sub">Boss : ${z.bossName} · Niveau ${z.level}</div>
     <div class="zone-stars">${stars}</div>
     ${!prev?`<div class="zone-req">🔒 Bat le boss précédent</div>`:!canPlay&&!done?`<div class="zone-req">Besoin de ${z.starsReq} ⭐ (tu as ${starsTotal})</div>`:''}
    </div>
   </div>`;
 }).join('');
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
 const zoneEls = document.querySelectorAll('.map-zone[data-zone-id]');
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
  intro:`Tu oses entrer dans mon territoire ? ${zone.label} n'a pas de pitié pour les ignorants.`,
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
 const t=document.body.className.replace('theme-','')||'standard';
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
 loop();$('music-viz').classList.add('viz-anim');
}
function stopMusic(){clearTimeout(musicTimer);musicTimer=null;$('music-viz').classList.remove('viz-anim');}
function toggleMusic(){musicOn=$('musicToggle').checked;if(musicOn)startMusic();else stopMusic();}
function playVS(){const s=VSOUNDS.find(v=>v.id===(P.victorySound||'fanfare'))||VSOUNDS[0];try{s.play(getAudio());}catch(e){}}

// ═══════════════════════════════════════════════════════
// PARTICULES
// ═══════════════════════════════════════════════════════
// OPT-2 : spawnP n'assigne plus canvas.width/height (fait une seule fois dans _initCachedDOM)
// OPT-4 : animP évite filter() qui alloue un nouveau tableau à chaque frame RAF
function spawnP(x,y,n=12){
 const t=document.body.className.replace('theme-','')||'standard';
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
 if(!wc){box.classList.add('hidden');return;}
 box.classList.remove('hidden');
 $('wc-title').innerText='📅 Défi : '+wc.label;
 $('wc-desc').innerText=`Réussir ${wc.target} questions · +${wc.reward}⭐${wc.done?' ✅':''}`;
 const pct=Math.min(100,Math.round(wc.progress/wc.target*100));
 $('wc-fill').style.width=pct+'%';
 $('wc-text').innerText=`${wc.progress}/${wc.target} (${pct}%)`;
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
 if(GM.mode2==='normal'&&!isRevision&&GS.qCount>=6)return endGame(true);
 if(GM.mode2==='revision'&&revQueue.length===0&&GS.qCount>0)return endGame(true);
 GS.qCount++;GS.isBoss=GM.mode2==='normal'&&GS.qCount===6&&!GM.mapZone;
 if(GM.mapZone&&GS.qCount===6)GS.isBoss=true;
 GS.bossTypeQ={};
 GS.isGolden=Math.random()<.15;GS.frozen=false;
 _timerTauntFired=false;
 GS.monsterMaxHP=GS.isBoss?HP_LVL[GM.level]+2:HP_LVL[GM.level];GS.monsterHP=GS.monsterMaxHP;
 maybeEvent();GS.q=generateQ();
 $('BODY').classList.remove('body-alert','urgency-bg');$('correction').classList.add('hidden');
 clearMonsterSpeech();
 const heart=$('timer-heart');if(heart)heart.style.display='none';
 // Pick monster personality
_currentMonster=pickMonster(GM.level,GS.isBoss);
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
 }else if(GS.qCount===1||(GM.mode2==='survie'&&GS.qCount%4===1)){
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
  GS.monsterHP--;updateMonsterHP();
  // Chantier A4 : taunt aléatoire en milieu de combat (HP bas)
  if(typeof maybeMidCombatTaunt==='function') maybeMidCombatTaunt();
  if(GS.activeEvent){GS.eventLeft--;if(GS.eventLeft<=0)GS.activeEvent=null;}
  if(GS.monsterHP>0){$('feedback').innerText=`✅ TOUCHÉ ! ❤️${GS.monsterHP}/${GS.monsterMaxHP}`;GS.q=generateQ();safeTimeout(()=>{clearMonsterSpeech();renderQ();},800);}
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
  bar.style.background=pct>60?'#2ecc71':pct>30?'#f1c40f':'#e74c3c';
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
 P.stars=(P.stars||0)+GS.score;
 // Chantier 2.1 : stats cumulatives pour les paliers
 P._totalStarsEarned=(P._totalStarsEarned||0)+GS.score;
 P._bestCombo=Math.max(P._bestCombo||0, GS.maxCombo||0);
if(typeof checkMilestones==='function') checkMilestones();
 // Chantier B2 : vérifier l'évolution du stade héros
 if(typeof checkHeroStageProgress==='function') setTimeout(checkHeroStageProgress, 1500);
 // XP
 const xpGained=gainXP(GS.score,won);
// boss carte
 if(won&&GM.mapZone&&GS.isBoss){
  GS.mapBossWon=true;
  if(!(P.mapBossBeaten||[]).includes(GM.mapZone.id)){
   P.mapBossBeaten=[...(P.mapBossBeaten||[]),GM.mapZone.id];
   // Chantier 3.10 : cinématique de zone conquise (remplace l'ancien transition-screen)
   const _zone = GM.mapZone;
   setTimeout(()=>{
    if(typeof playZoneVictory==='function'){
     try{startConfetti();}catch(e){}
     playZoneVictory(_zone);
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
 // reset thème si mode carte
 if(GM.mapZone)applyTheme(P.prefs.theme||'standard');
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
 $('end-stars').innerText=`+${GS.score} ⭐`;
 $('end-xp').innerText=`+${xpGained} XP · Niv.${levelFromXP(P.xp)}`;
 $('end-enc').innerText=won?msgs[ri(0,msgs.length-1)]:'';
 renderEndStars(computeStars(GS.score,won));
 $('end-badges').innerHTML=newBadges.length?'<p style="color:#f1c40f;margin:3px 0;">🏅 '+newBadges.map(b=>b.e+' '+b.l).join(', ')+'</p>':'';
 const errs=(P.errors||[]).slice(-GS.errInGame);
 $('end-correction').innerHTML=errs.length?'<strong style="color:#e74c3c">❌ Erreurs :</strong><br>'+[...new Set(errs)].map(e=>{const m=e.match(/^(.+?)([+\-x×\/÷])(.+?)=(\d+)$/);return m?`• ${m[1]} ${m[2]} ${m[3]} = <strong>${m[4]}</strong>`:' • '+e;}).join('<br>'):(won?'<span style="color:#2ecc71">✅ Parfait !</span>':'');
 if(won)startConfetti();
 GM.mapZone=null;
}
function playCongrats(){
 playVS();const h=GIFS[ri(0,GIFS.length-1)];
 $('congrats-gif').src=h.url;$('congrats-name').innerText=`Bravo ${P.name} ! 🎉`;
 $('v-game').classList.add('hidden');$('gif-overlay').classList.remove('hidden');
 safeTimeout(()=>{$('gif-overlay').classList.add('hidden');endGame(true);},3500);
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
