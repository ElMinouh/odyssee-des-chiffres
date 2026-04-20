// 07-game.js — L'Odyssée des Chiffres
'use strict';

// Flux principal du jeu : musique, particules, boutique, quêtes, badges,
// combat, pouvoirs, timers, transitions, événements aléatoires, tour de jeu,
// validation, fin de partie, carte d'exploration.

// ═══════════════════════════════════════════════════════
// CARTE D'EXPLORATION
// ═══════════════════════════════════════════════════════
function openMap(){showView('v-map');renderMap();}
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
  return `
   ${i>0?'<div class="map-path"></div>':''}
   <div class="map-zone">
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
function startMapBoss(zoneId){
 const zone=MAP_ZONES.find(z=>z.id===zoneId);if(!zone)return;
 GM.mapZone=zone;GM.level=zone.level;GM.mode2='normal';GM.mode=P.prefs.mode||'keyboard';
 applyTheme(zone.theme);
 const bossMonster={emoji:zone.boss,name:zone.bossName,title:`Gardien de : ${zone.label}`,
  intro:`Tu oses entrer dans mon territoire ? ${zone.label} n'a pas de pitié pour les ignorants.`,
  anim:'glow',col:'#e74c3c'};
 showMonsterIntro(bossMonster,()=>{
  loadProfile();gameActive=true;clearPendingTimers();resetGS();GS.isBoss=false;
  powers={};const pwI=Math.abs((P.name.charCodeAt(0)||0))%POWERS.length;const pw=POWERS[pwI];
  powers[P.name]={id:pw.id,eff:pw.effect,charge:0,recharge:pw.recharge,shielded:false,dbl:false};
  $('combat-bar').classList.add('hidden');
  $('hud-name').innerText=(P.avatar||'👤')+' '+P.name;
  $('hud-chrono').classList.add('hidden');$('hud-combo').classList.add('hidden');
  $('qcm-options').classList.toggle('hidden',GM.mode!=='qcm');
  $('input-zone').classList.toggle('hidden',GM.mode==='qcm');
  $('BODY').classList.remove('body-alert','urgency-bg');
  showView('v-game');nextTurn();
 });
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
 if(it==='potion'){GS.pv++;updateHUD();beep(600,'sine',.5);}
 if(it==='bomb'&&GS.q)validate(GS.q.res);
}

// ═══════════════════════════════════════════════════════
// QUÊTES, BADGES, HEBDO
// ═══════════════════════════════════════════════════════
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function genQuests(){return shuffle(QUESTS).slice(0,3).map(q=>({...q,progress:0,done:false}));}
function renderQuests(){
 if(!P.quests)return;
 $('p-quests').innerHTML=P.quests.map(q=>`<div class="quest-row">
  <div style="font-size:1.2em;">📜</div>
  <div style="flex:1;text-align:left;">
   <div style="font-weight:700;font-size:.82em;">${q.label} ${q.done?'✅':''}</div>
   <div style="color:#f1c40f;font-size:.72em;">+${q.reward} ⭐</div>
   <div class="quest-prog"><div class="quest-prog-fill" style="width:${Math.min(100,Math.round(q.progress/q.goal*100))}%"></div></div>
  </div>
  <div style="font-size:.75em;color:#bdc3c7;">${Math.min(q.progress,q.goal)}/${q.goal}</div>
 </div>`).join('');
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
  combatPlayers=valid.map(p=>({name:p.name.trim(),level:p.level||'CP',pv:3+(P.skills.shield||0),score:0,alive:true}));
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
  const bossM=mapBoss?{emoji:mapBoss.boss,name:mapBoss.bossName,title:'Boss de la Carte',intro:`Bienvenue dans ${mapBoss.label}. Tu ne repartiras pas vivant.`,anim:'glow',col:'#e74c3c'}:_currentMonster;
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
 const fn=GEN[GM.level]||GEN.CP;let q=fn(GS.isBoss);
 if(GS.activeEvent?.effect==='next_golden'){GS.isGolden=true;GS.activeEvent=null;}
 return q;
}
function getSkin(){const s=SKINS.find(x=>x.id===(P.equippedSkin||'default'))||SKINS[0];return s.m;}
function renderQ(){
 GS.answering=false;
 const q=GS.q;
 const txt=q.display||(q.a!==undefined&&q.b!==undefined?`${q.a} ${q.op||'='} ${q.b}`:String(q.res));
 $('question').innerText=txt;$('question').className=GS.isGolden?'gold-q':'';
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
 }else{const ai=$('answer-input');ai.value='';setTimeout(()=>ai.focus(),100);}
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
  // Multiplicateur niveau : plus c'est difficile, plus c'est rentable
  // CP~1-2⭐ CE1~1-3⭐ CE2~2-3⭐ CM1~2-4⭐ CM2~3-5⭐
  const _lvlBase={CP:[1,2],CE1:[1,3],CE2:[2,3],CM1:[2,4],CM2:[3,5]}[GM.level]||[1,2];
  const _swordBonus=Math.floor(((P.skills.sword||0)*2)*0.5);
  let pts=_lvlBase[0]+Math.floor(Math.random()*(_lvlBase[1]-_lvlBase[0]+1))+_swordBonus;
  if(GS.isBoss)pts=Math.max(pts,_lvlBase[1]);
  if(GS.isGolden)pts*=3;
  if(GS.activeEvent?.effect==='double_score')pts*=2;
  if(GS.combo>=10){pts*=2;$('gc').classList.add('combo-breaker');}
  const pw=powers[P.name];if(pw?.dbl){pts*=2;pw.dbl=false;toast('⚡ Double !');}
  GS.score+=pts;
  const opK=q.opKey||'+';P.opStats[opK]=P.opStats[opK]||{ok:0,fail:0};P.opStats[opK].ok++;
  if(q.type==='fraction')GS.fracOk++;
  if(q.type==='missing')GS.missingOk++;
  chargePower(P.name);
  updateQuests('questions');if(GS.combo>=5)updateQuests('combo5');
  if(q.type==='fraction')updateQuests('fractions');if(q.type==='missing')updateQuests('missing');
  updateWC(q);
  beep(523,'square',.2);vibrate(VIBE.good);$('BODY').classList.add('flash');setTimeout(()=>$('BODY').classList.remove('flash'),50);
  $('feedback').style.color='#2ecc71';$('correction').classList.add('hidden');
  const ma=$('monster-area');ma.classList.add('monster-hit');setTimeout(()=>ma.classList.remove('monster-hit'),350);
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,12);
  // Monster reacts to being hit
  if(Math.random()<.55)monsterSpeak(CORRECT_TAUNTS[ri(0,CORRECT_TAUNTS.length-1)],1800);
  if(GM.mode==='qcm')markQCM(ans,true);updateHUD();
  GS.monsterHP--;updateMonsterHP();
  if(GS.activeEvent){GS.eventLeft--;if(GS.eventLeft<=0)GS.activeEvent=null;}
  if(GS.monsterHP>0){$('feedback').innerText=`✅ TOUCHÉ ! ❤️${GS.monsterHP}/${GS.monsterMaxHP}`;GS.q=generateQ();safeTimeout(()=>{clearMonsterSpeech();renderQ();},800);}
  else{$('feedback').innerText='✅ BRAVO !';ma.classList.add('monster-die');clearMonsterSpeech();if(GS.isBoss){vibrate(VIBE.boss);safeTimeout(playCongrats,600);}else safeTimeout(nextTurn,750);}
 }else{
  GS.errInGame++;GS.combo=0;$('gc').classList.remove('combo-breaker');
  const opK=q.opKey||'+';P.opStats[opK]=P.opStats[opK]||{ok:0,fail:0};P.opStats[opK].fail++;
  if(q.display&&q.res!==undefined)P.errors=([...(P.errors||[])]).concat(`${q.a||'?'}${q.op||'?'}${q.b||'?'}=${q.res}`).slice(-60);
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
 $('combat-players-row').innerHTML=combatPlayers.map((p,i)=>`
  <div class="cp-card${i===combatIdx?' active':''}${p.alive?'':' dead'}">
   <div class="cp-name">${i===combatIdx?'▶ ':''}${p.alive?esc(p.name):'💀 '+esc(p.name)}</div>
   <div class="cp-stats">❤️${p.pv} ⭐${p.score}</div>
   <div class="cp-level">${esc(p.level)}</div>
  </div>`).join('');
 const cp=combatPlayers[combatIdx];
 if(cp){$('hud-name').innerText='⚔️ '+cp.name;$('hud-pv').innerText=cp.pv;$('hud-score').innerText=cp.score;}
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
 $('quest-title').innerHTML=`⚔️ Tour de <strong>${esc(combatPlayers[combatIdx].name)}</strong> <span class="mode-badge m-combat">combat</span>`;
 renderPowerBar();
}
function validateCombat(ans){
 stopTimer();const q=GS.q,cp=combatPlayers[combatIdx];
 if(ans===q.res){
  cp.score+=GS.isGolden?3:1;chargePower(cp.name);
  $('monster-area').classList.add('monster-hit');setTimeout(()=>$('monster-area').classList.remove('monster-hit'),350);
  beep(523,'square',.2);$('feedback').style.color='#2ecc71';$('feedback').innerText=`✅ ${cp.name} touche !`;
  spawnP(_monsterCenter.x||0,_monsterCenter.y||0,10); // OPT-5
 }else{
  const pw=powers[cp.name];
  if(pw?.shielded){pw.shielded=false;$('feedback').innerText=`🛡️ ${cp.name} bloqué !`;}
  else{cp.pv--;if(cp.pv<=0){cp.pv=0;cp.alive=false;}}
  beep(150,'sawtooth',.4);$('feedback').style.color='#e74c3c';
  $('feedback').innerText=`💥 ${cp.name} ${cp.alive?'prend un coup !':'est éliminé ! ❌'}`;showCorr(q);
 }
 updateCombatHUD();
 const alive=combatPlayers.filter(p=>p.alive);
 if(alive.length<=1){GS.combatWon=true;if(alive.length===1)$('feedback').innerText=`🏆 ${alive[0].name} GAGNE !`;safeTimeout(()=>endGame(true),2000);}
 else{nextAlive();updateCombatHUD();safeTimeout(nextCombat,1300);}
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
 P.history=([...(P.history||[]),{date:fmtDate(),score:GS.score,mode:GM.mode2,level:fl,won}]).slice(-50);
 P.historyDetailed=([...(P.historyDetailed||[]),{date:fmtDate(),score:GS.score,mode:GM.mode2,level:fl,won,maxCombo:GS.maxCombo,errorsCount:GS.errInGame}]).slice(-30);
 P.stars=(P.stars||0)+GS.score;
 // XP
 const xpGained=gainXP(GS.score,won);
 // boss carte
 if(won&&GM.mapZone&&GS.isBoss){
  GS.mapBossWon=true;
  if(!(P.mapBossBeaten||[]).includes(GM.mapZone.id)){
   P.mapBossBeaten=[...(P.mapBossBeaten||[]),GM.mapZone.id];
   // Zone unlock cinematic
   const zLabel=GM.mapZone.label;
   setTimeout(()=>{
    const trans=$('transition-screen');
    $('trans-monster').textContent='🗺️';
    $('trans-msg').innerHTML=`<div style="color:#f1c40f;font-size:.9em;font-weight:700;letter-spacing:.05em;">ZONE CONQUISE !</div>
     <div style="font-family:'Cinzel Decorative',cursive;font-size:1.3em;color:#2ecc71;margin:8px 0;">${zLabel}</div>
     <div style="font-size:.85em;color:#bdc3c7;">Une nouvelle zone s'ouvre à toi…</div>`;
    trans.classList.remove('hidden');
    try{startConfetti();
    [523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.4,.15),i*120));
    }catch(e){}
    setTimeout(()=>trans.classList.add('hidden'),3000);
   },800);
  }
 }
 if(won&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone))P.levelWins[GM.level]=(P.levelWins[GM.level]||0)+1;
 if(won){updateQuests('wins');if(GS.errInGame===0)updateQuests('perfect');updateQuests('stars',GS.score);}
 if(won){P.objectiveDone=(P.objectiveDone||0)+1;if((P.objective||0)>0&&P.objectiveDone>=P.objective)toast('🎯 Objectif du jour atteint !',3500);}
 const newBadges=checkBadges();saveProfileNow(); // sauvegarde immédiate en fin de partie
 // reset thème si mode carte
 if(GM.mapZone)applyTheme(P.prefs.theme||'standard');
 showView('v-end');
 if(GM.mode2==='combat'){
  const sorted=[...combatPlayers].sort((a,b)=>b.score-a.score);const medals=['🥇','🥈','🥉','4️⃣','5️⃣'];
  $('end-title').innerText='⚔️ COMBAT TERMINÉ !';$('end-mode').innerText='Mode Combat';
  $('end-score').innerHTML='<strong>Classement :</strong><br>'+sorted.map((p,i)=>`${medals[i]} ${esc(p.name)} — ${p.score}pts ${p.alive?'❤️':'💀'}`).join('<br>');
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
