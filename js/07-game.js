// 07-game.js — L'Odyssée du Savoir
'use strict';

// Flux principal du jeu : musique, particules, boutique, quêtes, badges,
// combat, pouvoirs, timers, transitions, événements aléatoires, tour de jeu,
// validation, fin de partie, devoirs, arbitre.
// (Carte : 07-map.js. Boss/collection/décor : 07-boss.js. Histoire/livres : 07-story.js.)

var _bgAudio=null;
function _musicDuck(on){ if(_bgAudio){ try{ _bgAudio.volume = on ? 0.06 : 0.4; }catch(e){} } } // baisse la musique pendant la voix
function startMusic(){
 stopMusic();
 const m=(typeof MUSICS!=='undefined')?(MUSICS.find(x=>x.id===((P&&P.music)||'theme'))||MUSICS[0]):null;
 if(!m)return;
 try{ _bgAudio=new Audio('assets/'+m.file); _bgAudio.loop=true; _bgAudio.volume=.4; _bgAudio.play().catch(function(){}); }catch(e){}
 const _mv=$('music-viz');if(_mv)_mv.classList.add('viz-anim');
}
function stopMusic(){ if(_bgAudio){ try{_bgAudio.pause();}catch(e){} _bgAudio=null; } clearTimeout(musicTimer);musicTimer=null;const _mv=$('music-viz');if(_mv)_mv.classList.remove('viz-anim'); }
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
 if(!$('p-skills'))return;
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
    ${getRoster().map(n=>`<option value="${esc(n)}"${n===p.name?' selected':''}>${esc(n)}</option>`).join('')}
    <option value="__c__"${!getRoster().includes(p.name)?' selected':''}>✏️ Autre…</option>
   </select>
   ${!getRoster().includes(p.name)?`<input type="text" placeholder="Prénom…" value="${esc(p.name)}" maxlength="16" oninput="combatCfg[${i}].name=this.value" style="flex:1;">`:''}
   <select onchange="combatCfg[${i}].level=this.value" style="flex:.8;">
    ${(()=>{ const _gi=(l)=>(typeof _groupIcon==='function')?_groupIcon(l)+' ':''; const _ll=(l)=>(typeof _levelLabel==='function')?_levelLabel(l):l; const o=(l)=>`<option value="${l}"${l===p.level?' selected':''}>${_gi(l)}${_ll(l)}</option>`; const prim=(typeof PRIMARY_LEVELS!=='undefined')?PRIMARY_LEVELS:['CP','CE1','CE2','CM1','CM2']; const coll=(typeof COLLEGE_LEVELS!=='undefined')?COLLEGE_LEVELS:[]; const gm=(typeof GROUP_META!=='undefined')?GROUP_META:{primaire:{icon:'🎒',name:'Primaire'},college:{icon:'🎓',name:'Collège'}}; return `<optgroup label="${gm.primaire.icon} ${gm.primaire.name}">${prim.map(o).join('')}</optgroup>`+(coll.length?`<optgroup label="${gm.college.icon} ${gm.college.name}">${coll.map(o).join('')}</optgroup>`:''); })()}
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
 // Plus de temps pour les questions à lire/observer (problèmes en barres, exercices visuels)
 if(GS.q && (GS.q.visualHtml || (GS.q.display && GS.q.display.length>40))) totalTime += 12;
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
 // M-A : la maternelle est un mode solo guidé, 100% visuel, sans combat ni chrono
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level)){
  GM.mode='qcm'; GM.mode2='normal';
 }
 if(typeof _matApplyAmbiance==='function') _matApplyAmbiance(GM.level);
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
 $('hud-chrono').classList.toggle('hidden',GM.mode2!=='chrono' || !(GM.subject==='math'||!GM.subject));
 $('hud-combo').classList.add('hidden');
 $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
 $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
  toggleNumpadForMode(GM.mode);
 $('BODY').classList.remove('body-alert');
 if(GM.mode2==='chrono' && (GM.subject==='math'||!GM.subject))startChrono();else stopChrono();
 nextTurn();
}
function startRevision(){
 loadProfile();
 const _subj=(typeof GM!=='undefined'&&GM.subject)||'math';
 let queue=[];
 if(_subj==='math'){
  const unique=[...new Set(P.errors||[])].filter(e=>/^\d/.test(e));
  queue=[...unique,...unique];
 }else{
  const objs=(P.errorLog||[]).filter(e=>(e.subj||'math')===_subj && e.payload && Array.isArray(e.payload.choices)).map(e=>Object.assign({},e.payload));
  queue=[...objs,...objs];
 }
 if(!queue.length){alert('Aucune erreur à réviser !');return;}
 gameActive=true;clearPendingTimers();
 revQueue=queue;isRevision=true;
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
  showMonsterIntro((typeof _themeMonster==='function')?_themeMonster(bossM):bossM,renderQ);
 }else if((GS.qCount===1||(GM.mode2==='survie'&&GS.qCount%4===1)) && !(GM.mapZone && GM.mapStep)){
  // v8.7.9 (O1) : ne PAS rejouer l'intro en étape de zone : on l'a déjà
  // jouée dans startMapStep avec le bon monstre. Sinon un 2e monstre
  // aléatoire apparaîtrait par-dessus celui de l'étape.
  // Show intro for first monster and every 4 in survie
  showMonsterIntro(_currentMonster,renderQ);
 }else renderQ();
}
// v11.2.0 : table de générateurs par matière — GEN (maths, défaut), GEN_FR (français),
// GEN_HIST (histoire). Ajouter une nouvelle matière = ajouter une entrée ici, rien d'autre
// à toucher dans generateQ()/nextCombat().
function _subjGen(){
 const s = typeof GM!=='undefined' ? GM.subject : null;
 if(s==='fr' && typeof GEN_FR!=='undefined') return GEN_FR;
 if(s==='hist' && typeof GEN_HIST!=='undefined') return GEN_HIST;
 return GEN;
}
function generateQ(){
 if(isRevision&&revQueue.length>0){
  const e=revQueue.shift();
  if(e && typeof e==='object'){ const out=Object.assign({},e); out.isRevision=true; return out; }
  const m=String(e).match(/^(\d+)([+\-x×\/÷])(\d+)=(\d+)$/);
  if(m)return{a:+m[1],b:+m[3],op:m[2],res:+m[4],type:'normal',opKey:m[2],display:`${m[1]} ${m[2]} ${m[3]}`,img:''};
 }
 // Chantier 1.2 : révision espacée en mode normal (pas en boss ni en combat/révision)
 if(GM.mode2==='normal' && !GS.isBoss && !(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && typeof getRevisionErrorToAsk==='function'){
  const rev = getRevisionErrorToAsk();
  if(rev) return rev;
 }
 // P1 : exercices d'enrichissement numération (primaire, en mode normal hors boss)
 if((GM.subject==='math'||!GM.subject) && GM.mode2==='normal' && !GS.isBoss && !(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && typeof _primEnrich==='function' && typeof _PRIM_LEVELS!=='undefined' && _PRIM_LEVELS.includes(GM.level) && Math.random()<0.33){
  const pe=_primEnrich(GM.level); if(pe) return pe;
 }
 // C : exercices d'enrichissement collège (relatifs, etc.) en mode normal hors boss
 if((GM.subject==='math'||!GM.subject) && GM.mode2==='normal' && !GS.isBoss && typeof _collEnrich==='function' && typeof _COL_LEVELS!=='undefined' && _COL_LEVELS.includes(GM.level) && Math.random()<0.33){
  const ce=_collEnrich(GM.level); if(ce) return ce;
 }
 const _GS=_subjGen();
 const fn=_GS[GM.level]||_GS.CP||GEN.CP;let q=fn(GS.isBoss);
 if(GS.activeEvent?.effect==='next_golden'){GS.isGolden=true;GS.activeEvent=null;}
 return q;
}
function getSkin(){const s=SKINS.find(x=>x.id===(P.equippedSkin||'default'))||SKINS[0];return s.m;}
function renderQ(){
 GS.answering=false;
 // v8.7.53 (O4.2b) : nettoyer les effets d'attaque de la question précédente
 if(typeof _resetBossAttackEffects==='function') _resetBossAttackEffects();
 const q=GS.q;
 // M-A : rendu 100% visuel pour la maternelle (images cliquables, pas de pavé ni chrono)
 if(q && q.maternelle && typeof _matRenderQ==='function'){ _matRenderQ(q); return; }
 const txt=q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res));
 $('question').innerText=txt;$('question').className=GS.isGolden?'gold-q':q.isRevision?'revision-q-inline':'';
 // Chantier 1.2 : petit toast discret quand une question de révision espacée apparaît
 if(q.isRevision && typeof toast==='function') toast('🔁 Révision', 1200);
 { const _pi=$('problem-image'); if(q.visualHtml){ _pi.innerHTML=q.visualHtml; } else { _pi.innerText=q.img||''; } }
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
 $('feedback').innerText='';
 // Lecture audio de la question. Loto sonore : on lit la CONSIGNE puis on joue le
 // cri À LA FIN (plus de superposition). Sinon lecture normale. Dans tous les cas,
 // on diffère après une éventuelle réplique de boss (anti-coupure).
 (function(){
  const _say=()=>{ try{ speak(_ttsClean(q.speakText||txt)); }catch(e){} };
  const _rem=(window._monsterSpeakEnd||0)-Date.now();
  const _base=(_rem>60)?(_rem+150):0;
  if(q.sound && typeof _speakThenCri==='function'){
   if(typeof safeTimeout==='function'){ safeTimeout(()=>{ try{ _speakThenCri(q); }catch(e){} },_base); }
   else { try{ _speakThenCri(q); }catch(e){} }
  } else if(_base>0 && typeof safeTimeout==='function'){ safeTimeout(_say,_base); }
  else { _say(); }
 })();
 const _hasChoices = q.choices && q.choices.length;
 const _txt = !!q.textInput;
 // Visibilité pavé/choix : saisie texte (français) > choix visuels > mode
 $('qcm-options').classList.toggle('hidden', _txt || !(_hasChoices || GM.mode==='qcm'));
 $('input-zone').classList.toggle('hidden', !_txt && (_hasChoices || GM.mode==='qcm'));
 if(_txt){
  const ai=$('answer-input');ai.value='';
  const np=$('numpad'); if(np)np.style.display='none';
  ai.setAttribute('inputmode','text');ai.setAttribute('autocapitalize','none');ai.setAttribute('autocomplete','off');ai.setAttribute('spellcheck','false');
  setTimeout(()=>ai.focus(),120);
 }else if(_hasChoices){
  const qcmEl=$('qcm-options');
  qcmEl.classList.toggle('prim-choices', !!q.visualChoices);
  qcmEl.innerHTML=q.choices.map(c=>`<button class="qcm-btn${q.visualChoices?' prim-choice':''}" data-val="${c.val}">${c.html!==undefined?c.html:c.label}</button>`).join('');
  qcmEl.onclick=e=>{const b=e.target.closest('.qcm-btn');if(b&&!b.disabled)validate(+b.dataset.val);};
 }else if(GM.mode==='qcm'){
  const correct=q.res;
  const offsets=shuffle([-7,-5,-3,-2,-1,1,2,3,5,7]);
  const opts=[correct];
  for(let i=0;opts.length<4;i++)opts.push(Math.max(0,correct+offsets[i%offsets.length]));
  const dedup=[...new Set(opts)];while(dedup.length<4)dedup.push(dedup[dedup.length-1]+1);
  const qcmEl=$('qcm-options');
  qcmEl.classList.remove('prim-choices');
  qcmEl.innerHTML=shuffle(dedup).map(o=>`<button class="qcm-btn" data-val="${o}">${o}</button>`).join('');
  qcmEl.onclick=e=>{const b=e.target.closest('.qcm-btn');if(b&&!b.disabled)validate(+b.dataset.val);};
 }else{
  const ai=$('answer-input');ai.value='';
  const np=$('numpad'); if(np)np.style.display='';
  ai.setAttribute('inputmode','decimal');
  if(!_numpadIsTouch())setTimeout(()=>ai.focus(),100);
 }
 renderPowerBar();
 if((GM.subject==='math'||!GM.subject)){ if(GM.mode2!=='chrono')startTimer(); }
 else { if(typeof stopTimer==='function')stopTimer(); const _tb=(typeof _timerBarEl!=='undefined'&&_timerBarEl)||$('timer-bar'); if(_tb){_tb.style.width='0%';_tb.className='';} $('BODY').classList.remove('body-alert','urgency-bg'); }
 // v10.0.0 (C3 debug) : forçage immédiat de l'enrage si le drapeau debug est posé
 if(GS.isBoss && !GS.bossEnraged && _dbgForceEnrage()){
  GS.bossEnraged=true;
  if(typeof _triggerBossEnrage==='function') _triggerBossEnrage();
 }
 // v8.7.52 (O4.2) : en phase enragée, le boss peut lancer une attaque spéciale
 if(GS.isBoss && GS.bossEnraged && typeof _maybeBossAttack==='function') _maybeBossAttack();
}
// v10.0.0 (C3) : lecture du drapeau debug « forcer l'enrage » (posé par debug.html)
function _dbgForceEnrage(){
 try{ return localStorage.getItem('odyssee_dbg_enrage')==='1'; }catch(e){ return false; }
}
function _frNorm(s){ return (s||'').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' '); }
// Nettoie le texte AVANT lecture vocale : retire les emojis (sinon « 🔊 » est lu
// « volume ») et remplace les blancs « ___ » (sinon lus « tiret bas »).
function _ttsClean(s){
 return String(s||'')
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}\u{20E3}\u{2122}\u{2139}]/gu,' ')
  .replace(/_+/g,' ')
  .replace(/\s+/g,' ')
  .trim();
}
function submitAns(){
 const q=GS.q;
 if(q && q.textInput){
  const raw=($('answer-input').value||'').trim();
  if(raw==='') return validate(null);
  const ok=_frNorm(raw)===_frNorm(q.answer||'');
  return validate(ok ? q.res : (q.res||0)+9999);
 }
 const raw=($('answer-input').value||'').replace(',','.').trim();const v=parseFloat(raw);validate((raw===''||isNaN(v))?null:v);
}
function validate(ans){
 if(!GS.q||GS.answering)return; // guard : question null ou déjà en train de traiter
 GS.answering=true;
 if(GM.mode2==='combat')return validateCombat(ans);
 if(GM.mode2!=='chrono')stopTimer();
 if(ans===null){hitPlayer('Réponse invalide !');return;}
 // M-A : maternelle = aucune sanction. Mauvaise réponse → on grise le choix et on réessaie.
 if(typeof _isMaternelle==='function' && _isMaternelle(GM.level) && Math.abs(ans-GS.q.res)>=1e-6){
  const qcm=$('qcm-options');
  if(qcm){ const b=qcm.querySelector(`.qcm-btn[data-val="${ans}"]`); if(b){ b.classList.add('mat-wrong'); b.disabled=true; } }
  const fb=$('feedback'); if(fb){ fb.style.color='#e67e22'; fb.innerText='Presque ! Essaie encore 💛'; }
  if(typeof speak==='function') speak('Essaie encore');
  GS.matFirstTry=false;
  if(typeof _progUpdate==='function') _progUpdate(GM.level, false);
  GS.answering=false;
  return;
 }
 const q=GS.q;
 if(ans!==null && Math.abs(ans-q.res)<1e-6){
GS.combo++;GS.maxCombo=Math.max(GS.maxCombo,GS.combo);
  // Chantier A4 : flash de milestone à 10/20/30/50
  if([10,20,30,50].includes(GS.combo) && typeof flashComboMilestone==='function'){
   flashComboMilestone(GS.combo);
  }
  // Multiplicateur niveau : plus c'est difficile, plus c'est rentable
  // CP~1-2⭐ CE1~1-3⭐ CE2~2-3⭐ CM1~2-4⭐ CM2~3-5⭐
  const _lvlBase={PS:[1,1],MS:[1,2],GS:[2,3],CP:[1,2],CE1:[1,3],CE2:[2,3],CM1:[2,4],CM2:[3,5],'6E':[3,5],'5E':[3,6],'4E':[4,7],'3E':[4,8]}[GM.level]||[1,2];
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
  if(GM.subject==='fr' && typeof _frCatOf==='function'){ const c=_frCatOf(q.opKey); P.opStatsFr[c]=P.opStatsFr[c]||{ok:0,fail:0}; P.opStatsFr[c].ok++; }
  if(GM.subject==='hist' && typeof _histCatOf==='function'){ const c=_histCatOf(q.opKey); P.opStatsHist=P.opStatsHist||{}; P.opStatsHist[c]=P.opStatsHist[c]||{ok:0,fail:0}; P.opStatsHist[c].ok++; }
  if(typeof _progUpdate==="function") _progUpdate(GM.level, true);
  if(typeof _classStatUpdate==="function") _classStatUpdate(GM.level, q.opKey, true);
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
  const ma=$('monster-area');
  if(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)){ma.classList.remove('mat-joy');void ma.offsetWidth;ma.classList.add('mat-joy');setTimeout(()=>ma.classList.remove('mat-joy'),750);}
  else{ma.classList.add('monster-hit');setTimeout(()=>ma.classList.remove('monster-hit'),350);}
  // Chantier 3.1 : amplification graduelle selon combo + popups
  const _partN = GS.combo>=10?25:GS.combo>=5?18:12;
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,_partN);
  floatScore(`+${pts} ⭐`, _monsterCenter.x||window.innerWidth/2, _monsterCenter.y||window.innerHeight/2, GS.combo>=5);
  if(COMBO_MILESTONES.has(GS.combo))comboBanner(GS.combo);
  // Monster reacts to being hit
  if(!(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)) && Math.random()<.55)monsterSpeak(CORRECT_TAUNTS[ri(0,CORRECT_TAUNTS.length-1)],1800);
  if(GM.mode==='qcm'||(GS.q&&GS.q.choices&&GS.q.choices.length))markQCM(ans,true);updateHUD();
  if(typeof _isMaternelle==='function'&&_isMaternelle(GM.level)&&typeof _matCelebrate==='function')_matCelebrate();
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
  if(GS.monsterHP>0){$('feedback').innerText=_shieldHeld?`🛡️ Le bouclier résiste ! Frappe encore !`:`✅ TOUCHÉ ! ❤️${GS.monsterHP}/${GS.monsterMaxHP}`;GS.q=generateQ();const _wait=Math.min(9000,Math.max(950,((window._monsterSpeakEnd||0)-Date.now())+350));safeTimeout(()=>{renderQ();},_wait);}
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
  if(GM.subject==='fr' && typeof _frCatOf==='function'){ const c=_frCatOf(q.opKey); P.opStatsFr[c]=P.opStatsFr[c]||{ok:0,fail:0}; P.opStatsFr[c].fail++; }
  if(GM.subject==='hist' && typeof _histCatOf==='function'){ const c=_histCatOf(q.opKey); P.opStatsHist=P.opStatsHist||{}; P.opStatsHist[c]=P.opStatsHist[c]||{ok:0,fail:0}; P.opStatsHist[c].fail++; }
  if(typeof _progUpdate==="function") _progUpdate(GM.level, false);
  if(typeof _classStatUpdate==="function") _classStatUpdate(GM.level, q.opKey, false);
  if(q.display&&q.res!==undefined){
   if((q.subj==='fr')||(typeof GM!=='undefined'&&GM.subject==='fr')){
    const _qd=String(q.display||'').replace(/<[^>]+>/g,'').trim();
    const _ans=String(q.hint||'').replace(/^R[eé]ponse\s*:\s*/i,'').trim();
    if(_qd) P.errorsFr=([...(P.errorsFr||[])]).concat({q:_qd,ok:_ans}).slice(-60);
   } else if((q.subj==='hist')||(typeof GM!=='undefined'&&GM.subject==='hist')){
    const _qd=String(q.display||'').replace(/<[^>]+>/g,'').trim();
    const _ans=String(q.hint||'').replace(/^R[eé]ponse\s*:\s*/i,'').trim();
    if(_qd) P.errorsHist=([...(P.errorsHist||[])]).concat({q:_qd,ok:_ans}).slice(-60);
   } else {
    P.errors=([...(P.errors||[])]).concat(`${q.a||'?'}${q.op||'?'}${q.b||'?'}=${q.res}`).slice(-60);
   }
  }
  // Chantier 1.2 : log dans le registre de révision espacée
  if(typeof logError==="function" && q.display && q.res!==undefined) logError(q.display, q.res, q);
  // v10.0.0 (C2) : liste de session propre pour le récap de fin de partie
  if(q.res!==undefined){
   const _disp = q.display || (q.a!==undefined&&q.b!==undefined ? `${q.a} ${q.op||'='} ${q.b}` : String(q.res));
   GS.errList = Array.isArray(GS.errList) ? GS.errList : [];
   if(!GS.errList.some(e=>e.display===_disp && e.res===q.res)){
    GS.errList.push({display:_disp, res:q.res, opKey:q.opKey||q.op||'+', type:q.type||'normal'});
   }
   // Erreur commise : on retire la question de l'anti-répétition pour qu'elle
   // puisse réapparaître plus tôt (entraînement ciblé).
   try{ if(typeof _untrackQ==='function') _untrackQ(q); }catch(e){}
  }
  // Monster taunts on wrong answer
  monsterSpeak(WRONG_TAUNTS[ri(0,WRONG_TAUNTS.length-1)],2200);
  showCorr(q);if(GM.mode==='qcm'||(q&&q.choices&&q.choices.length))markQCM(ans,false,q.res);hitPlayer('💥 FAUX !');
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
 GS.q=((_subjGen())[GM.level]||GEN.CP)(false);$('correction').classList.add('hidden');renderQ();
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
 P.history=([...(P.history||[]),{date:fmtDate(),timestamp:Date.now(),score:GS.score,mode:GM.mode2,level:fl,won,subject:(typeof GM!=='undefined'&&GM.subject)||'math'}]).slice(-50);
 P.historyDetailed=([...(P.historyDetailed||[]),{date:fmtDate(),timestamp:Date.now(),score:GS.score,mode:GM.mode2,level:fl,won,maxCombo:GS.maxCombo,errorsCount:GS.errInGame,subject:(typeof GM!=='undefined'&&GM.subject)||'math'}]).slice(-60);
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
    const _zoneRegion = (typeof _regionOfZone==='function') ? _regionOfZone(_zone) : null;
    if(_zoneRegion && _regionConquered(_zoneRegion.id)) _conqueredRegionId = _zoneRegion.id;
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
 if(won&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone)){
  P.levelWins[GM.level]=(P.levelWins[GM.level]||0)+1;
  const _sj=(GM.subject)||'math';
  if(!P.levelWinsBySubj||typeof P.levelWinsBySubj!=='object')P.levelWinsBySubj={};
  if(!P.levelWinsBySubj[_sj])P.levelWinsBySubj[_sj]={};
  P.levelWinsBySubj[_sj][GM.level]=(P.levelWinsBySubj[_sj][GM.level]||0)+1;
 }
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
 $('end-enc').innerText=won?String(msgs[ri(0,msgs.length-1)]).replace(/\{name\}/g,P.name||''):'';
 renderEndStars(computeStars(GS.score,won));
 $('end-badges').innerHTML=newBadges.length?'<p style="color:#f1c40f;margin:3px 0;">🏅 '+newBadges.map(b=>b.e+' '+b.l).join(', ')+'</p>':'';
 _renderEndRecap(won);
 if(won)startConfetti();
 // v8.7.10 : NE PAS reset GM.mapZone ici. Le contexte doit être préservé
 // pour que le bouton "Retour à la carte" sache où retourner.
 // Le reset est désormais fait dans returnMenu/endReplayAction au clic.
}
// ═══════════════════════════════════════════════════════
// v10.0.0 (Chantier 2) : récap des erreurs côté enfant
// Regroupe les erreurs de la session par domaine (opKey) avec
// un libellé lisible, la bonne réponse en vert, et un ton encourageant.
// ═══════════════════════════════════════════════════════
const _RECAP_DOMAINS={
 '+':{e:'➕',l:'Addition'}, '-':{e:'➖',l:'Soustraction'},
 'x':{e:'✖️',l:'Multiplication'}, '×':{e:'✖️',l:'Multiplication'},
 '/':{e:'➗',l:'Division'}, '÷':{e:'➗',l:'Division'},
 'frac':{e:'½',l:'Fractions'}, 'num':{e:'🔢',l:'Nombres décimaux'},
 'geo':{e:'📐',l:'Géométrie'}, 'mes':{e:'📏',l:'Grandeurs et mesures'},
 'prop':{e:'⚖️',l:'Proportionnalité'}, 'rel':{e:'±',l:'Nombres relatifs'},
 'litt':{e:'🔤',l:'Calcul littéral'}, 'fonc':{e:'📈',l:'Fonctions'},
 'stat':{e:'📊',l:'Statistiques'}, 'arith':{e:'🔟',l:'Puissances et arithmétique'},
 'algo':{e:'🤖',l:'Algorithmique'}
};
const _RECAP_MAX_LINES=8;
const _RECAP_ENCOURAGE=[
 'Pas grave, ce sont tes pistes d’entraînement. Tu vas y arriver !',
 'Ces petites erreurs, on les retravaille et hop, elles disparaissent !',
 'Chaque erreur t’apprend quelque chose. Bravo d’avoir essayé !',
 'On revoit ça ensemble la prochaine fois — tu progresses !'
];
function _renderEndRecap(won){
 const el=$('end-correction'); if(!el) return;
 const btn=$('btn-end-revision');
 const list=Array.isArray(GS.errList)?GS.errList:[];
 if(!list.length){
  el.innerHTML = won ? '<span style="color:#2ecc71;font-weight:700;">✅ Sans faute, bravo !</span>' : '';
  if(btn) btn.classList.add('hidden');
  return;
 }
 // Regroupe par domaine en préservant l'ordre d'apparition
 const groups=[]; const byKey={};
 for(const it of list){
  const key=it.opKey||'+';
  if(!byKey[key]){ byKey[key]={key, items:[]}; groups.push(byKey[key]); }
  byKey[key].items.push(it);
 }
 let lines=0, html='<strong style="color:#f6b93b;">📒 Ce que tu peux revoir</strong>';
 for(const g of groups){
  if(lines>=_RECAP_MAX_LINES) break;
  const d=_RECAP_DOMAINS[g.key]||{e:'📝',l:'À revoir'};
  html+=`<div style="color:#86b8e6;margin:7px 0 2px;font-weight:700;font-size:.92em;">${d.e} ${d.l}</div>`;
  for(const it of g.items){
   if(lines>=_RECAP_MAX_LINES) break;
   html+=`<div style="padding:1px 0;">${esc(String(it.display))} = <strong style="color:#2ecc71;">${esc(String(it.res))}</strong></div>`;
   lines++;
  }
 }
 const remaining=list.length-lines;
 if(remaining>0) html+=`<div style="color:#bdc3c7;margin-top:4px;font-size:.9em;">… et ${remaining} autre${remaining>1?'s':''}.</div>`;
 html+=`<div style="color:#9fd3a0;margin-top:9px;font-style:italic;font-size:.95em;">${_RECAP_ENCOURAGE[ri(0,_RECAP_ENCOURAGE.length-1)]}</div>`;
 el.innerHTML=html;
 // Bouton « Rejouer mes erreurs » : seulement si des erreurs arithmétiques sont rejouables
 if(btn){
  const _subj=(typeof GM!=='undefined'&&GM.subject)||'math';
  const replayable = _subj==='math'
   ? (P.errors||[]).some(e=>/^\d/.test(e))
   : (P.errorLog||[]).some(e=>(e.subj||'math')===_subj && e.payload && Array.isArray(e.payload.choices));
  btn.classList.toggle('hidden', !replayable);
 }
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
 * v11.5.3 — Libellé du type de devoir, valable pour toute matière à
 * catégories (fr/hist) en plus des maths. CONVENTION pour une future
 * matière : ajouter un cas ici avec son XXX_CAT_FILTERS.
 */
function _hwOpLabel(hw){
 const labels = {
  any:'opérations variées', add:'additions', sub:'soustractions',
  mult:'multiplications', div:'divisions',
  table_2:'la table de 2', table_3:'la table de 3', table_4:'la table de 4',
  table_5:'la table de 5', table_6:'la table de 6', table_7:'la table de 7',
  table_8:'la table de 8', table_9:'la table de 9', table_10:'la table de 10',
 };
 if(hw.subject === 'fr'){
  if(hw.type === 'any') return 'questions de français variées';
  const c = (typeof FR_CAT_FILTERS!=='undefined'?FR_CAT_FILTERS:[]).find(x=>x.key===hw.type);
  return c ? c.label.toLowerCase() : 'questions';
 }
 if(hw.subject === 'hist'){
  if(hw.type === 'any') return "questions d'histoire variées";
  const c = (typeof HIST_CAT_FILTERS!=='undefined'?HIST_CAT_FILTERS:[]).find(x=>x.key===hw.type);
  return c ? c.label.toLowerCase() : 'questions';
 }
 return labels[hw.type] || 'questions';
}
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
 const opLabel = _hwOpLabel(hw);
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
 // Force la matière, le niveau et le mode
 GM.subject = hw.subject || 'math';
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
 * v11.5.3 — matières à catégories (fr/hist) : on compare désormais la
 * catégorie réelle de la question au type choisi par le parent, au lieu de
 * ne proposer que "any". CONVENTION pour une future matière à catégories :
 * ajouter un cas ici avec son _xxxCatOf (cf. commentaire détaillé dans
 * _hwTypeOptions, 09-parent.js).
 */
function _matchesHomework(q){
 if(!GM.homework || !GM.homeworkConfig) return false;
 const cfg = GM.homeworkConfig;
 const type = cfg.type;
 if(type === 'any') return true;
 const subj = cfg.subject || 'math';
 if(subj === 'fr')   return (typeof _frCatOf==='function')   && _frCatOf(q.opKey)   === type;
 if(subj === 'hist') return (typeof _histCatOf==='function') && _histCatOf(q.opKey) === type;
 if(subj !== 'math') return false;
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
// ═══════════════════════════════════════════════════════
// v10.2.0 — CARNET DE COLLECTION (section en tête du carnet d'aventure)
// Maternelle : l'arc-en-ciel se complète (6 couleurs d'îlots + violet offert).
// Collège : l'Armure Solaire se forge pièce par pièce (+ Lame d'Aurore).
// État dérivé de _regionConquered / P.storySeen — aucun nouveau stockage.
// ═══════════════════════════════════════════════════════
