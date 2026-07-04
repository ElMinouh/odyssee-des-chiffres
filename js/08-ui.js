// 08-ui.js — L'Odyssée des Chiffres
'use strict';

// Tableau de bord, avatars, skins, titres, historique, table de multiplications.

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
function renderLevelUnlocks(){
 const lab=(l)=>(typeof _levelLabel==='function')?_levelLabel(l):l;
 const row=(lvl,icon)=>{
  const ok=isUnlocked(lvl),pW=prevWins(lvl),req=UNLOCK_REQ[lvl];
  return `<div class="level-lock ${ok?'unlocked':'locked'}"><span>${icon} ${lab(lvl)}</span><span style="font-size:.78em;color:${ok?'#2ecc71':'#e74c3c'};">${ok?'✅ Débloqué':'🔒 '+pW+'/'+req+' victoires'}</span></div>`;
 };
 const groups=(typeof GROUP_ORDER!=='undefined' && typeof GROUP_META!=='undefined')
   ? GROUP_ORDER.map(k=>GROUP_META[k])
   : [{icon:'🎒',name:'Primaire',levels:['CP','CE1','CE2','CM1','CM2']},{icon:'🎓',name:'Collège',levels:['6E','5E','4E','3E']}];
 $('p-levels').innerHTML = groups.map(g=>
   `<div class="level-group-title">${g.icon} ${g.name}</div>` + g.levels.map(l=>row(l,g.icon)).join('')
 ).join('');
}
function renderChart(){
 const h=(P.history||[]).slice(-7);const el=$('p-chart');
 if(!h.length){el.innerHTML='<span style="color:#bdc3c7;align-self:center;">Aucune partie encore !</span>';return;}
 const mx=Math.max(...h.map(x=>x.score),1);
 el.innerHTML=h.map(x=>`<div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.round(x.score/mx*70)}px"></div><span class="chart-label">${x.date}<br>${x.score}⭐</span></div>`).join('');
}
function renderErrors(){
 const u=[...new Set(P.errors||[])].slice(-10);
 if(!u.length){$('p-errors').innerHTML='<span style="color:#2ecc71;">✅ Aucune erreur !</span>';$('btn-revision').classList.add('hidden');return;}
 $('p-errors').innerHTML=u.map(e=>{const m=e.match(/^(.+?)([+\-x×\/÷])(.+?)=(\d+)$/);return m?`<div class="revision-q"><span>${m[1]} ${m[2]} ${m[3]} = ?</span><strong style="color:#f1c40f;">${m[4]}</strong></div>`:`<div class="revision-q">${e}</div>`;}).join('');
 $('btn-revision').classList.remove('hidden');
}
function renderRecords(){
 const h=P.history||[];const best=h.length?Math.max(...h.map(x=>x.score)):0;
 const xp=P.xp||0,lvl=levelFromXP(xp);
 $('p-records').innerHTML=`<div class="lb-row"><span>🔮 Niveau XP</span><span class="lb-score">Niv.${lvl} (${xp} XP)</span></div><div class="lb-row"><span>🏅 Meilleur score</span><span class="lb-score">${best}</span></div><div class="lb-row"><span>🎮 Parties jouées</span><span>${h.length}</span></div><div class="lb-row"><span>⏱️ Temps de jeu</span><span>${P.sessionMinutes||0} min</span></div><div class="lb-row"><span>⭐ Trésor total</span><span class="lb-score">${P.stars||0}</span></div><div class="lb-row"><span>🗺️ Boss battus</span><span>${(P.mapBossBeaten||[]).length}/${MAP_ZONES.length}</span></div>`;
}
function renderLB(){
 const all=[...getRoster()];const cu=localStorage.getItem('customPlayerName');if(cu&&!all.includes(cu))all.push(cu);
 const rows=[];all.forEach(n=>{try{const d=JSON.parse(localStorage.getItem('user_'+n)||'null');if(d&&((d.stars||0)>0||(d.history||[]).length))rows.push({name:n,stars:d.stars||0,xp:d.xp||0});}catch(e){}});
 rows.sort((a,b)=>b.xp-a.xp);const m=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'];
 $('p-lb').innerHTML=rows.length?rows.map((r,i)=>`<div class="lb-row"><span>${m[i]||'•'}</span><span class="lb-name">${esc(r.name)}${r.name===P.name?' (moi)':''}</span><span class="lb-score">Niv.${levelFromXP(r.xp)} · ${r.stars}⭐</span></div>`).join(''):'<span style="color:#bdc3c7;">Aucune donnée.</span>';
}
function renderOpStats(){
 const ops=['+','-','x','/','geo'];const names={'+':"Addition",'-':"Soustraction",'x':"Multiplication",'/':'Division','geo':'Géométrie'};
 $('p-opstats').innerHTML='<strong>📊 Par opération :</strong><br>'+
  ops.map(op=>{const s=P.opStats[op]||{ok:0,fail:0};const t=s.ok+s.fail;if(!t)return'';const pct=Math.round(s.ok/t*100);const col=pct>=80?'#2ecc71':pct>=60?'#f1c40f':'#e74c3c';
  return`<div class="op-stat-row"><span style="width:90px;text-align:left;font-size:.82em;">${names[op]}</span><div class="op-stat-bar"><div class="op-stat-fill" style="width:${pct}%;background:${col};"></div></div><span style="color:${col};font-weight:700;margin-left:6px;font-size:.82em;">${pct}%</span></div>`;}).filter(Boolean).join('')||'<span style="color:#bdc3c7;">Pas encore de données.</span>';
}

// ═══════════════════════════════════════════════════════
// AVATAR & PERSO
// ═══════════════════════════════════════════════════════
function getTopTitle(){
 const d={stars:P.stars||0,badgesEarned:P.badgesEarned||[],levelWins:P.levelWins||{},history:P.history||[]};
 const earned=HERO_TITLES.filter(t=>t.ok(d));return earned[earned.length-1]||HERO_TITLES[0];
}
// Chantier B2 : barre de progression vers le stade suivant
function renderStageProgress(stage){
 const next = getNextHeroStage();
 if(!next) return ' <span style="color:#f1c40f;">🏆 Stade ultime atteint !</span>';
 const totalWins = Object.values(P.levelWins||{}).reduce((s,n)=>s+n, 0);
 const totalStars = P._totalStarsEarned || 0;
 const figs = (P.ownedFigurines||[]).length;
 // Calcule pourcentage de progression vers le stade suivant
 let pct = 0;
 if(next.id === 'apprenti'){ pct = totalWins / 5 * 100; }
 else if(next.id === 'aventurier'){ pct = totalWins / 25 * 100; }
 else if(next.id === 'maitre'){ pct = Math.min(totalWins/50, totalStars/100) * 100; }
 else if(next.id === 'legende'){ pct = Math.min(totalWins/100, totalStars/500, figs/30) * 100; }
 pct = Math.min(100, Math.max(0, pct));
 return `<div style="margin-top:6px;font-size:.74em;color:#bdc3c7;">
  Prochain stade : <span style="color:${next.color};">${next.icon} ${next.label}</span>
  <div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px;margin-top:4px;overflow:hidden;">
   <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,${stage.color},${next.color});transition:width .5s;"></div>
  </div>
 </div>`;
}

function renderAvatars(){
 $('p-ava-disp').innerText=P.avatar||'🧙';
 const t=getTopTitle();$('p-title-disp').innerHTML=`<span style="color:${t.col}">${t.label}</span>`;
// Chantier B2 : afficher uniquement les avatars du stade actuel + précédents
 const unlocked = (typeof getUnlockedAvatars==='function') ? getUnlockedAvatars() : AVATAR_LIST;
 const stage = (typeof getHeroStage==='function') ? getHeroStage() : null;
 const stageHTML = stage ? `<div style="text-align:center;margin:10px 0 4px;font-size:.9em;">
  <span style="color:${stage.color};font-weight:700;">${stage.icon} ${stage.label}</span>
  ${(typeof getNextHeroStage==='function' && getNextHeroStage()) ? renderStageProgress(stage) : ''}
 </div>` : '';
 // Liste des avatars débloqués (stade actuel et précédents)
 const unlockedHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0;">'+unlocked.map(a=>`<span class="ava${a===P.avatar?' sel':''}" onclick="selectAvatar('${a}')">${a}</span>`).join('')+'</div>';
 // Liste des avatars verrouillés (stades suivants)
 const lockedAvatars = AVATAR_LIST.filter(a => !unlocked.includes(a));
 const lockedHTML = lockedAvatars.length ? `<details style="margin-top:8px;">
  <summary style="cursor:pointer;font-size:.84em;color:#bdc3c7;">🔒 ${lockedAvatars.length} avatars à débloquer</summary>
  <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0;opacity:.45;">${lockedAvatars.map(a=>`<span class="ava" style="filter:grayscale(.7);cursor:not-allowed;">${a}</span>`).join('')}</div>
 </details>` : '';
 $('p-avatars').innerHTML = stageHTML + unlockedHTML + lockedHTML;
}
function selectAvatar(a){P.avatar=a;saveProfileNow();renderAvatars();updateMenuUI();toast('Avatar : '+a);}
function renderVSounds(){
 $('p-vsounds').innerHTML=VSOUNDS.map(s=>{
  const owned=(P.ownedSounds||[]).includes(s.id)||!s.price;
  const sel=s.id===(P.victorySound||'fanfare');
  return `<div style="display:flex;align-items:center;gap:8px;margin:5px 0;">
   <button class="vsnd-btn${sel?' sel':''}" onclick="${owned?`selectVS('${s.id}')`:`buySound('${s.id}',${s.price})`}">${s.label}${owned?'':' · '+s.price+' ⭐'}</button>
   <button onclick="testVS('${s.id}')" style="padding:5px 10px;font-size:.8em;background:#2c3e50;">▶ Test</button>
  </div>`;
 }).join('');
}
function buySound(id,p){spend(p,()=>{P.ownedSounds=[...(P.ownedSounds||[]),id];renderVSounds();toast('Son acheté !');});}
function selectVS(id){P.victorySound=id;saveProfileNow();renderVSounds();toast('Son : '+VSOUNDS.find(s=>s.id===id)?.label);}
function testVS(id){const s=VSOUNDS.find(v=>v.id===id);if(s)try{s.play(getAudio());}catch(e){}}
// ── Rayon Musiques (achat + choix, à la manière des skins) ──
function renderMusics(){
 const el=$('p-musics'); if(!el) return;
 el.innerHTML=MUSICS.map(s=>{
  const owned=(P.ownedMusics||['theme']).includes(s.id)||s.price===0;
  const cur=(P.music||'theme')===s.id;
  return `<div class="skin-row"><span style="font-size:1.3em;width:34px;">🎵</span>
   <div style="flex:1;text-align:left;"><div style="font-weight:700;">${s.label}</div><div style="font-size:.75em;color:#bdc3c7;">${s.price===0?'Gratuit':s.price+' ⭐'}</div></div>
   <button onclick="testMusic('${s.id}')" style="font-size:.8em;padding:5px 8px;background:#2c3e50;" title="Aperçu">▶</button>
   ${owned?`<button onclick="selectMusic('${s.id}')" style="font-size:.8em;padding:5px 10px;margin-left:4px;background:${cur?'#27ae60':'#2c3e50'};">${cur?'✅ Choisie':'Choisir'}</button>`:
            `<button onclick="buyMusic('${s.id}',${s.price})" style="font-size:.8em;padding:5px 10px;margin-left:4px;">Acheter</button>`}
  </div>`;
 }).join('');
}
function buyMusic(id,p){spend(p,()=>{P.ownedMusics=[...(P.ownedMusics||['theme']),id];renderMusics();toast('Musique achetée !');});}
function selectMusic(id){P.music=id;saveProfileNow();renderMusics();toast('Musique choisie !');try{ if(typeof musicOn!=='undefined'&&musicOn){stopMusic();startMusic();} }catch(e){}}
var _musPrev=null;
function testMusic(id){
 try{ if(_musPrev){_musPrev.pause();_musPrev=null;} }catch(e){}
 const m=(typeof MUSICS!=='undefined')?MUSICS.find(x=>x.id===id):null; if(!m)return;
 try{ _musPrev=new Audio('assets/'+m.file); _musPrev.volume=.5; _musPrev.play().catch(function(){}); setTimeout(function(){ if(_musPrev){try{_musPrev.pause();}catch(e){}} },12000); }catch(e){}
}
function renderSkins(){
 $('p-skins').innerHTML=SKINS.map(s=>{
  const owned=(P.ownedSkins||[]).includes(s.id)||s.price===0;
  const equipped=(P.equippedSkin||'default')===s.id;
  return`<div class="skin-row"><span style="font-size:1.7em;width:40px;">${s.prv}</span>
   <div style="flex:1;text-align:left;"><div style="font-weight:700;">${s.label}</div><div style="font-size:.75em;color:#bdc3c7;">${s.price===0?'Gratuit':s.price+' ⭐'}</div></div>
   ${owned?`<button onclick="equipSkin('${s.id}')" style="font-size:.8em;padding:5px 10px;background:${equipped?'#27ae60':'#2c3e50'};">${equipped?'✅ Équipé':'Équiper'}</button>`:
            `<button onclick="buySkin('${s.id}',${s.price})" style="font-size:.8em;padding:5px 10px;">Acheter</button>`}
  </div>`;
 }).join('');
}
function buySkin(id,p){spend(p,()=>{P.ownedSkins=[...(P.ownedSkins||[]),id];renderSkins();toast('Skin acheté !');});}
function equipSkin(id){P.equippedSkin=id==='default'?null:id;saveProfileNow();renderSkins();toast('Skin équipé !');}
function renderTitles(){
 const d={stars:P.stars||0,badgesEarned:P.badgesEarned||[],levelWins:P.levelWins||{},history:P.history||[]};
 $('p-titles').innerHTML=HERO_TITLES.map(t=>{
  const ok=t.ok(d),active=P.heroTitle===t.id;
  return`<div class="skill-item" style="${ok?'':'opacity:.4'}"><span style="color:${t.col};">${ok?'✅':'🔒'} ${t.label}</span>${ok?`<button onclick="setTitle('${t.id}')" style="font-size:.8em;padding:5px 10px;background:${active?'#27ae60':'var(--accent)'};">${active?'Actif':'Choisir'}</button>`:''}</div>`;
 }).join('');
}
function setTitle(id){P.heroTitle=id;saveProfile();renderTitles();updateMenuUI();toast('Titre : '+HERO_TITLES.find(t=>t.id===id)?.label);}

// ═══════════════════════════════════════════════════════
// HISTORIQUE
// ═══════════════════════════════════════════════════════
function renderHistory(){
 const h=(P.historyDetailed||[]).slice(-20).reverse();const el=$('p-history');
 if(!h.length){el.innerHTML='<span style="color:#bdc3c7;">Aucune partie enregistrée.</span>';return;}
 el.innerHTML=h.map((g,i)=>`
  <div class="hist-row ${g.won?'won':'lost'}" onclick="toggleHD(${i})">
   ${g.won?'🏆':'💀'} ${g.date} · ${g.level} · ${g.mode} · ${g.score}pts · Combo×${g.maxCombo||0}
  </div>
  <div class="hist-detail" id="hd-${i}"><div style="margin-top:4px;color:${g.won?'#2ecc71':'#e74c3c'};">${g.errorsCount||0} erreur(s) · ${g.won?'Victoire':'Défaite'}</div></div>`).join('');
}
function toggleHD(i){const d=$('hd-'+i);if(d)d.style.display=d.style.display==='block'?'none':'block';}

// ═══════════════════════════════════════════════════════
// TABLES DE MULTIPLICATION
// ═══════════════════════════════════════════════════════
function openMultTable(){
 showView('v-mult');
 const sel=$('mult-select');
 sel.innerHTML='<option value="0">Toutes les tables</option>'+[...Array(10)].map((_,i)=>`<option value="${i+1}">Table de ${i+1}</option>`).join('');
 renderMult(0);
}
function renderMult(n){
 n=+n;const grid=$('mult-table-grid');grid.innerHTML='';
 const c=document.createElement('div');c.className='mt-cell mt-hd';c.innerText='×';grid.appendChild(c);
 for(let col=1;col<=10;col++){const d=document.createElement('div');d.className='mt-cell mt-hd';d.innerText=col;grid.appendChild(d);}
 for(let row=1;row<=10;row++){
  const rh=document.createElement('div');rh.className='mt-cell mt-hd';rh.innerText=row;grid.appendChild(rh);
  for(let col=1;col<=10;col++){
   const d=document.createElement('div');const hl=n>0&&(row===n||col===n);
   d.className='mt-cell'+(hl?' mt-hl':'');d.innerText=row*col;
   d.onclick=()=>speak(`${row} fois ${col} égale ${row*col}`);grid.appendChild(d);
  }
 }
}
// ═══════════════════════════════════════════════════════
// RENDU DES PALIERS (chantier 2.1)
// ═══════════════════════════════════════════════════════
function renderMilestones(){
 if(typeof MILESTONES==='undefined') return;
 const el=$('milestones-list'); if(!el) return;
 const html = MILESTONES.map(m => {
  const prog = getMilestoneProgress(m, P);
  const pctRaw = prog.isMaxed ? 100 : (prog.current / prog.nextGoal) * 100;
  const pct = Math.min(100, Math.round(pctRaw));
  const rewardTxt = prog.isMaxed
   ? '<span style="color:#f1c40f;font-weight:700;">✨ COMPLÉTÉ ✨</span>'
   : (()=>{
      const r = prog.nextReward;
      const parts = [
       r.xp?`<span style="color:#9b59b6;">+${r.xp}XP</span>`:null,
       r.stars?`<span style="color:#f1c40f;">+${r.stars}⭐</span>`:null,
       r.badge?`<span style="color:#e67e22;">🎖️</span>`:null,
      ].filter(Boolean).join(' ');
      return `<span style="font-size:.8em;">Prochain : ${parts}</span>`;
    })();
  // Barre de progression avec segments pour chaque palier
  const segments = m.tiers.map((t,i)=>{
   const done = i <= prog.currentTier;
   return `<span title="${t.goal}" style="display:inline-block;min-width:28px;text-align:center;font-size:.68em;padding:1px 4px;border-radius:6px;margin:0 2px;${done?'background:#2ecc71;color:#000;font-weight:700;':'background:rgba(255,255,255,.12);color:#bdc3c7;'}">${t.goal}</span>`;
  }).join('');
  return `<div class="milestone-row">
   <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
    <span style="font-size:1.6em;">${m.icon}</span>
    <div style="flex:1;">
     <div style="font-weight:700;font-size:.95em;">${m.label}</div>
     <div style="font-size:.72em;color:#bdc3c7;">${m.desc} : <strong style="color:#fff;">${prog.current}</strong>${prog.isMaxed?'':` / ${prog.nextGoal}`}</div>
    </div>
   </div>
   <div class="milestone-bar"><div class="milestone-bar-fill" style="width:${pct}%;"></div></div>
   <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
    <div>${segments}</div>
    <div>${rewardTxt}</div>
   </div>
  </div>`;
 }).join('');
 el.innerHTML = html;
}
