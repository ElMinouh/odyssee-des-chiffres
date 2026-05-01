// 09-parent.js — L'Odyssée des Chiffres
'use strict';

// Vue parentale : statistiques, rapport hebdo, sauvegarde cloud, export PDF.

// VUE PARENT
// ═══════════════════════════════════════════════════════
function openParent(){
 $('parent-lock').classList.remove('hidden');$('parent-content').classList.add('hidden');$('pin-input').value='';
 const opts=KNOWN.map(n=>`<option>${n}</option>`).join('');
['parent-player','obj-player','block-player','filter-player','hw-player'].forEach(id=>{const e=$(id);if(e)e.innerHTML=opts;});
 $('cloud-player').innerHTML='<option value="ALL">Tous les joueurs</option>'+opts;
 showView('v-parent');
}
function checkPin(){
 const now=Date.now();
 if(pinLockUntil>now){const sec=Math.ceil((pinLockUntil-now)/1000);toast(`🔒 Trop de tentatives. Réessayer dans ${sec}s.`,2500);return;}
 const pin=$('pin-input').value;
 if(checkStoredPin(pin)){
  pinAttempts=0;
  $('parent-lock').classList.add('hidden');$('parent-content').classList.remove('hidden');renderReport();renderWeeklySummary();
 }else{
  pinAttempts++;
  if(pinAttempts>=5){pinLockUntil=Date.now()+30000;pinAttempts=0;toast('🔒 5 tentatives échouées. Bloqué 30 secondes !',3500);}
  $('pin-input').value='';$('pin-input').placeholder='Code incorrect !';
  setTimeout(()=>{if($('pin-input'))$('pin-input').placeholder='****';},1500);beep(200,'sawtooth',.3);
 }
}
function ptab(name){
 ['rapport','objectifs','controles','options','figurines'].forEach(t=>$('ptab-'+t).classList.toggle('hidden',t!==name));
 document.querySelectorAll('#v-parent .tab').forEach((b,i)=>b.classList.toggle('active',['rapport','objectifs','controles','options','figurines'][i]===name));
 if(name==='rapport'){renderReport();renderWeeklySummary();}
 if(name==='controles'){loadBlockSettings();loadFilterSettings();}
 if(name==='options'){setTimeout(renderResetZone,60);}
 if(name==='figurines'){
  const sel=$('pfig-player');if(!sel)return;
  const cu=localStorage.getItem('customPlayerName');
  const allP=[...KNOWN,...(cu&&!KNOWN.includes(cu)?[cu]:[])]; 
  sel.innerHTML=allP.map(n=>`<option>${n}</option>`).join('');
  sel.value=P.name||KNOWN[0];
  _pfigFilter='all';
  renderParentFigurines();
 }
}
function renderParentFigurines(){
 // Précharge les portraits si pas déjà fait. Re-rend une fois prêt.
 if(typeof loadPortraits==='function'&&!_portraitsLoaded){
  loadPortraits().then(()=>renderParentFigurines());
 }
 const playerSel=$('pfig-player');
 if(!playerSel)return;
 const player=playerSel.value||P.name;
 let pd=null;
 try{pd=JSON.parse(localStorage.getItem('user_'+player)||'null');}catch(e){}
 const owned=(pd&&pd.ownedFigurines)||[];
 const total=FIGURINES.length;
 const pct=Math.round(owned.length/total*100);
 const stats=$('pfig-stats');
 if(stats) stats.textContent=`${owned.length}/${total} (${pct}%) · ${(pd&&pd.stars)||0} ⭐`;
 // Populate license select
 const licSel=$('pfig-license');
 if(licSel&&licSel.options.length<=1){
  UNIVERS_LIST.forEach(({k,label})=>{
   const opt=document.createElement('option');opt.value=k;opt.textContent=`${UNI_ICON[k]||'🎴'} ${label}`;
   licSel.appendChild(opt);
  });
 }
 const licFilter=licSel?licSel.value:'all';
 const el=$('pfig-content');if(!el)return;
 let html='';
 const listToShow=licFilter==='all'?UNIVERS_LIST:UNIVERS_LIST.filter(u=>u.k===licFilter);
 listToShow.forEach(({k,label})=>{
  const uFigs=FIGURINES.filter(f=>f.uk===k);
  let displayFigs=uFigs; // 'all' = ALL figurines in license, owned or not
  if(_pfigFilter==='owned') displayFigs=uFigs.filter(f=>owned.includes(f.id));
  if(_pfigFilter==='missing') displayFigs=uFigs.filter(f=>!owned.includes(f.id));
  if(!displayFigs.length)return;

  const uOwned=uFigs.filter(f=>owned.includes(f.id)).length;
  const isOpen=uOwned>0||_pfigFilter!=='owned';

  html+=`<div class="pfig-section">
   <div class="pfig-header" onclick="togglePfigSection('pf-${k}')">
    <span style="font-size:1em;">${UNI_ICON[k]||'🎴'}</span>
    <span class="pfig-label">${label}</span>
    <span class="pfig-stats">${uOwned}/${uFigs.length}</span>
    <span style="font-size:.65em;color:rgba(255,255,255,.3);transition:.2s;" id="parr-pf-${k}">${isOpen?'▲':'▼'}</span>
   </div>
   <div class="pfig-panel${isOpen?' open':''}" id="pf-${k}">
    <div class="pfig-grid">`;

  displayFigs.forEach(fig=>{
   const isOwned=owned.includes(fig.id);
   const col=RARITY_COL[fig.r]||'#888';
   const portrait=getCharPortrait(fig.id, {size:56, emoji:fig.em});
html+=`<div class="pfig-card${isOwned?' owned':' pfig-locked'}${fig.r==='exclusif'?' rarity-exclusif':''}" onclick="pfigCardClick('${fig.id}',${isOwned})" title="${fig.name} — ${isOwned?'Voir animation & son':'Aperçu disponible'}">`;
   if(!isOwned) html+=`<div style="position:absolute;top:2px;left:2px;font-size:.55em;background:rgba(0,0,0,.5);border-radius:4px;padding:1px 4px;color:#aaa;">🔒</div>`;
   html+=`<div class="pfig-mini" style="border-bottom:2px solid ${col}${isOwned?'88':'22'};${!isOwned?'filter:grayscale(.5) brightness(.8)':''}">${portrait}</div>
    <div class="pfig-name">${fig.name}</div>
    <div class="pfig-price" style="color:${isOwned?RARITY_COL[fig.r]:'rgba(255,255,255,.3)'};">${isOwned?RARITY_STARS[fig.r]:fig.p+'⭐'}</div>`;
   if(isOwned){
    html+=`<div style="font-size:.45em;color:#2ecc71;font-weight:700;margin-top:1px;">▶ Voir + son</div>`;
   }else{
    html+=`<div style="font-size:.45em;color:#f1c40f;font-weight:700;margin-top:1px;">👁 Aperçu</div>`;
   }
   html+=`</div>`;
  });

  html+=`</div>
    <!-- Barre de progression licence -->
    <div style="margin:6px 4px 2px;">
     <div style="background:rgba(0,0,0,.3);border-radius:4px;height:5px;overflow:hidden;">
      <div style="width:${Math.round(uOwned/uFigs.length*100)}%;height:100%;background:linear-gradient(90deg,var(--accent),#f1c40f);border-radius:4px;transition:width .5s;"></div>
     </div>
     <div style="font-size:.55em;color:rgba(255,255,255,.35);margin-top:2px;text-align:right;">${Math.round(uOwned/uFigs.length*100)}% complété</div>
    </div>
   </div>
  </div>`;
 });

 if(!html){
  el.innerHTML='<div style="text-align:center;padding:16px;color:rgba(255,255,255,.4);font-size:.82em;">Aucune figurine dans ce filtre.</div>';
  return;
 }
 el.innerHTML=html;
}


function pfigFilter(f){
 _pfigFilter=f;
 ['all','owned','missing'].forEach(k=>{
  const b=$('pfig-btn-'+k);if(!b)return;
  b.classList.toggle('active',k===f);
  b.style.background=k===f?'':'rgba(255,255,255,.1)';
 });
 renderParentFigurines();
}


function pfigCardClick(id,isOwned){
 const fig=FIGURINES.find(f=>f.id===id);if(!fig)return;
 openFigViewer(id,true);
}
function togglePfigSection(id){
 const panel=$(id);if(!panel)return;
 const isOpen=panel.classList.contains('open');
 panel.classList.toggle('open',!isOpen);
 const arr=$('parr-'+id);if(arr)arr.textContent=isOpen?'▼':'▲';
}
function renderReport(){
 const player=$('parent-player')?.value||'Soren';
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+player)||'null');}catch(e){}
 const el=$('report-content');
 if(!d||!(d.history||[]).length){el.innerHTML='<span style="color:#bdc3c7;">Aucune donnée pour '+player+'.</span>';return;}
 const h=d.history,total=h.length,wins=h.filter(x=>x.won).length;
 const avg=total?Math.round(h.reduce((a,b)=>a+b.score,0)/total):0;
 const best=total?Math.max(...h.map(x=>x.score)):0;
 const ops=d.opStats||{};const opN={'+':"Addition",'-':"Soustraction",'x':"Multiplication",'/':'Division','geo':'Géométrie'};
 const weak=Object.entries(ops).filter(([op,s])=>{const t=s.ok+s.fail;return t>2&&s.ok/t<.7;}).map(([op])=>opN[op]||op);
 const lvl=levelFromXP(d.xp||0);
 el.innerHTML=`<div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px;margin:6px 0;">
  <strong style="color:#f1c40f;">📋 ${player}</strong>
  <div style="margin-top:8px;">
   <div class="lb-row"><span>🔮 Niveau XP</span><span>Niv.${lvl} (${d.xp||0} XP)</span></div>
   <div class="lb-row"><span>🎮 Parties</span><span>${total}</span></div>
   <div class="lb-row"><span>🏆 Victoires</span><span>${wins} (${total?Math.round(wins/total*100):0}%)</span></div>
   <div class="lb-row"><span>⏱️ Temps</span><span>${d.sessionMinutes||0} min</span></div>
   <div class="lb-row"><span>📊 Score moyen</span><span>${avg}</span></div>
   <div class="lb-row"><span>🥇 Meilleur</span><span>${best}</span></div>
   <div class="lb-row"><span>⭐ Trésor</span><span>${d.stars||0}</span></div>
   <div class="lb-row"><span>🗺️ Boss battus</span><span>${(d.mapBossBeaten||[]).length}/${MAP_ZONES.length}</span></div>
  </div>
  ${weak.length?`<div style="margin-top:8px;padding:7px;background:rgba(231,76,60,.2);border-radius:8px;">⚠️ Points faibles : ${weak.join(', ')}</div>`:'<div style="margin-top:8px;padding:7px;background:rgba(46,204,113,.2);border-radius:8px;">✅ Aucun point faible !</div>'}
  ${h.slice(-7).map(x=>`<div style="display:flex;justify-content:space-between;font-size:.78em;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span>${x.date} · ${x.level||'?'} · ${x.mode||'?'}</span><span style="color:${x.won?'#2ecc71':'#e74c3c'}">${x.won?'✅':'❌'} ${x.score}⭐</span></div>`).join('')}
 </div>`;
}

// ═══════════════════════════════════════════════════════
// RAPPORT HEBDOMADAIRE ENRICHI (chantier C2)
// ═══════════════════════════════════════════════════════
// Le rapport combine plusieurs sources :
//  - history (timestamp ou fallback date DD/MM) → comptage parties par jour
//  - historyDetailed → maxCombo, errorsCount, opStats par partie
//  - errorLog (avec t = timestamp) → top erreurs récurrentes
// Comparaison S vs S-1, médailles, conseils, graph activité.

/**
 * Retourne un objet Date pour une entrée d'history :
 *  - utilise timestamp si présent (entrées créées après v8.1.2)
 *  - sinon fallback sur date DD/MM en supposant l'année en cours
 */
function _entryDate(entry){
 if(entry.timestamp){ return new Date(entry.timestamp); }
 if(!entry.date) return null;
 const m = entry.date.match(/^(\d{1,2})\/(\d{1,2})/);
 if(!m) return null;
 const now = new Date();
 const dd = +m[1], mm = +m[2];
 // Si le mois est dans le futur (ex. décembre alors qu'on est en janvier), c'est l'année passée
 let yr = now.getFullYear();
 if(mm > now.getMonth()+1) yr--;
 return new Date(yr, mm-1, dd);
}

/**
 * Retourne {start, end} pour la semaine ISO contenant `ref` (lundi 00:00 → dimanche 23:59).
 */
function _weekBounds(ref){
 const d = new Date(ref);
 const day = d.getDay() || 7; // dimanche = 0 → 7
 const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1);
 const end = new Date(start.getTime() + 7*86400000 - 1);
 return {start, end};
}

/**
 * Filtre les entrées history dans une fenêtre [start, end].
 */
function _entriesInWindow(history, start, end){
 return history.filter(e=>{
  const d = _entryDate(e);
  return d && d >= start && d <= end;
 });
}

/**
 * Calcule les KPIs d'un set d'entrées history.
 */
function _computeKPIs(entries, detailed){
 const total = entries.length;
 const wins = entries.filter(x=>x.won).length;
 const winRate = total ? Math.round(wins/total*100) : 0;
 const avgScore = total ? Math.round(entries.reduce((a,b)=>a+(b.score||0),0)/total) : 0;
 const bestScore = total ? Math.max(...entries.map(x=>x.score||0)) : 0;
 // maxCombo via croisement avec historyDetailed (par timestamp ou date+score)
 let maxCombo = 0;
 entries.forEach(e=>{
  const d = detailed.find(x =>
   (e.timestamp && x.timestamp === e.timestamp) ||
   (x.date===e.date && x.score===e.score && x.won===e.won)
  );
  if(d && d.maxCombo > maxCombo) maxCombo = d.maxCombo;
 });
 // Jours actifs (set des YYYY-MM-DD)
 const days = new Set(entries.map(e=>{
  const d = _entryDate(e);
  return d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : null;
 }).filter(Boolean));
 return {total, wins, winRate, avgScore, bestScore, maxCombo, activeDays: days.size};
}

/**
 * Renvoie un span coloré avec flèche selon le delta.
 */
function _deltaSpan(now, prev, suffix='', isPercent=false){
 if(prev === 0 && now === 0) return '<span style="color:#7f8c8d;">→ —</span>';
 if(prev === 0) return `<span style="color:#2ecc71;font-weight:700;">↗ nouveau</span>`;
 const diff = now - prev;
 const pctDiff = Math.round((diff/Math.abs(prev))*100);
 const sign = diff > 0 ? '+' : '';
 const arrow = diff > 0 ? '↗' : (diff < 0 ? '↘' : '→');
 const col = diff > 0 ? '#2ecc71' : (diff < 0 ? '#e74c3c' : '#7f8c8d');
 const txt = isPercent ? `${sign}${diff}pts` : `${sign}${diff}${suffix}`;
 const pctStr = (Math.abs(pctDiff) >= 5 && !isPercent) ? ` (${sign}${pctDiff}%)` : '';
 return `<span style="color:${col};font-weight:700;">${arrow} ${txt}${pctStr}</span>`;
}

/**
 * Construit un graphique d'activité 7 colonnes (Lun→Dim) en SVG inline.
 * Hauteur = nb de parties, couleur = taux de réussite ce jour-là.
 */
function _renderActivityChart(entries, weekStart){
 const days = ['L','M','M','J','V','S','D'];
 const buckets = [[],[],[],[],[],[],[]];
 entries.forEach(e=>{
  const d = _entryDate(e); if(!d) return;
  const dayIdx = (d.getDay() || 7) - 1; // 0..6 (lundi=0)
  buckets[dayIdx].push(e);
 });
 const maxN = Math.max(1, ...buckets.map(b=>b.length));
 const W = 280, H = 80, gap = 6, barW = (W - gap*8) / 7;
 const bars = buckets.map((bucket,i)=>{
  const n = bucket.length;
  const h = n ? Math.max(4, Math.round((n/maxN) * (H-22))) : 2;
  const w = bucket.filter(x=>x.won).length;
  const wRate = n ? w/n : 0;
  // Couleur : rouge < 50%, jaune 50-75%, vert ≥ 75%
  const col = !n ? '#3a4a5e' : (wRate >= 0.75 ? '#2ecc71' : (wRate >= 0.5 ? '#f1c40f' : '#e74c3c'));
  const x = gap + i*(barW + gap);
  const y = H - 14 - h;
  return `
   <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${col}" opacity="${n?1:.4}"/>
   ${n?`<text x="${x+barW/2}" y="${y-2}" text-anchor="middle" fill="#ecf0f1" font-size="9" font-weight="700">${n}</text>`:''}
   <text x="${x+barW/2}" y="${H-3}" text-anchor="middle" fill="#bdc3c7" font-size="10">${days[i]}</text>`;
 }).join('');
 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;display:block;margin:6px auto;">${bars}</svg>`;
}

/**
 * Identifie les 3 erreurs les plus récurrentes cette semaine via errorLog.
 * Retourne [{q, count}, ...] ordonné par fréquence.
 */
function _topRecurringErrors(d, weekStart){
 const log = (d.errorLog||[]).filter(e=> e && e.t && e.t >= weekStart.getTime());
 if(!log.length) return [];
 const counts = {};
 log.forEach(e=>{ counts[e.q] = (counts[e.q]||0) + 1; });
 return Object.entries(counts)
  .filter(([,n])=>n >= 2) // au moins 2 occurrences pour être "récurrente"
  .sort((a,b)=>b[1]-a[1])
  .slice(0,3)
  .map(([q,n])=>({q, count:n}));
}

/**
 * Calcule les médailles méritées cette semaine.
 */
function _weeklyMedals(now, prev){
 const medals = [];
 if(now.activeDays >= 5) medals.push({icon:'🌅', label:'Régulier', desc:`${now.activeDays}j sur 7`});
 if(prev.winRate > 0 && now.winRate - prev.winRate >= 10) medals.push({icon:'🚀', label:'En progrès', desc:`+${now.winRate-prev.winRate}pts de réussite`});
 if(now.total >= 5 && now.winRate >= 85) medals.push({icon:'🎯', label:'Précis', desc:`${now.winRate}% de réussite`});
 if(now.maxCombo >= 20) medals.push({icon:'🔥', label:'Combo King', desc:`combo ×${now.maxCombo}`});
 if(now.timeMin >= 60) medals.push({icon:'⏰', label:'Persévérant', desc:`${now.timeMin} min de jeu`});
 if(now.total > 0 && prev.total === 0) medals.push({icon:'🌱', label:'Nouveau départ', desc:'première semaine'});
 return medals;
}

/**
 * Génère un conseil pour la semaine prochaine selon le profil.
 */
function _weeklyAdvice(now, prev, opStats, topErrors){
 // Priorité 1 : erreurs récurrentes
 if(topErrors.length){
  return `🎯 <strong>Réviser :</strong> ${topErrors[0].q.replace('=?','')} est tombé ${topErrors[0].count}× cette semaine. Une session du mode "Révision" suffirait.`;
 }
 // Priorité 2 : régularité faible
 if(now.activeDays <= 2 && now.total > 0){
  return `🌅 <strong>Régularité :</strong> seulement ${now.activeDays} jour(s) actifs. Mieux vaut 2 sessions de 10 min plutôt qu'une longue.`;
 }
 // Priorité 3 : opération faible
 const opN = {'+':"l'addition", '-':"la soustraction", 'x':"la multiplication", '/':"la division", 'geo':"la géométrie"};
 const weak = Object.entries(opStats||{}).filter(([,s])=>{const t=s.ok+s.fail;return t>5 && s.ok/t<.6;}).map(([op])=>op);
 if(weak.length){
  return `📚 <strong>Renforcer ${opN[weak[0]]||weak[0]} :</strong> moins de 60% de réussite — privilégier les exercices ciblés.`;
 }
 // Priorité 4 : encouragement
 if(now.winRate >= 80 && now.total >= 5){
  return `🚀 <strong>Tente le mode Survie ou Chrono :</strong> les bases sont solides, le défi accéléré sera bénéfique.`;
 }
 if(now.total === 0){
  return `📅 <strong>Reprendre en douceur :</strong> aucune partie cette semaine. Un objectif de 5 min/jour serait un bon redémarrage.`;
 }
 return `👏 <strong>Continuer comme ça !</strong> La progression est régulière.`;
}

/**
 * Construit le verdict en 1 phrase pour l'en-tête du rapport.
 */
function _buildVerdict(player, now, prev){
 if(now.total === 0){
  return `${player} n'a pas joué cette semaine. ${prev.total>0?'(la semaine dernière : '+prev.total+' parties)':''}`;
 }
 const parts = [];
 if(prev.winRate > 0){
  const diff = now.winRate - prev.winRate;
  if(Math.abs(diff) >= 5){
   parts.push(`${diff>0?'+':''}${diff}pts de réussite vs S-1`);
  }
 }
 parts.push(`${now.activeDays} jour${now.activeDays>1?'s':''} sur 7 d'activité`);
 if(now.maxCombo >= 15) parts.push(`combo max ×${now.maxCombo}`);
 const tone = now.winRate >= 75 ? 'progresse très bien' :
              now.winRate >= 60 ? 'progresse bien' :
              now.winRate >= 40 ? 'travaille sérieusement' : 'a besoin de soutien';
 return `${player} ${tone} : ${parts.join(', ')}.`;
}

/**
 * Rend le rapport hebdomadaire complet dans #weekly-summary-zone.
 * Génère aussi le texte plat pour copier (dataset.text).
 */
function renderWeeklySummary(){
 const player=$('parent-player')?.value||'Soren';
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+player)||'null');}catch(e){}
 const el=$('weekly-summary-zone');
 if(!d){el.innerHTML='<span style="color:#bdc3c7;">Aucune donnée pour '+player+'.</span>';return;}
 const history = d.history||[];
 const detailed = d.historyDetailed||[];
 // Fenêtres temporelles
 const now = new Date();
 const wThis = _weekBounds(now);
 const wPrev = _weekBounds(new Date(wThis.start.getTime() - 86400000));
 const eThis = _entriesInWindow(history, wThis.start, wThis.end);
 const ePrev = _entriesInWindow(history, wPrev.start, wPrev.end);
 // KPIs
 const kThis = _computeKPIs(eThis, detailed);
 const kPrev = _computeKPIs(ePrev, detailed);
 // Estimation du temps de jeu cette semaine (proportionnel : sessionMinutes total × parties_semaine / parties_total)
 const totalParties = history.length || 1;
 kThis.timeMin = Math.round((d.sessionMinutes||0) * eThis.length / totalParties);
 kPrev.timeMin = Math.round((d.sessionMinutes||0) * ePrev.length / totalParties);
 // Verdict
 const verdict = _buildVerdict(player, kThis, kPrev);
 // Top erreurs
 const topErrors = _topRecurringErrors(d, wThis.start);
 // Médailles
 const medals = _weeklyMedals(kThis, kPrev);
 // Conseil
 const advice = _weeklyAdvice(kThis, kPrev, d.opStats, topErrors);
 // Graph d'activité
 const chart = _renderActivityChart(eThis, wThis.start);
 // ────── RENDU HTML ──────
 const fmtD = (date) => date.toLocaleDateString('fr-FR', {day:'2-digit', month:'2-digit'});
 const html = `
  <div class="wreport">
   <div class="wreport-head">
    <strong style="color:#f1c40f;font-size:1.05em;">📊 Semaine du ${fmtD(wThis.start)} au ${fmtD(wThis.end)}</strong>
    <div style="margin-top:6px;font-size:.92em;line-height:1.4;">${verdict}</div>
   </div>
   ${kThis.total === 0 ? '' : `
   <div class="wreport-section">
    <h4>📈 Cette semaine vs semaine dernière</h4>
    <table class="wreport-table">
     <tr><td>🎮 Parties</td><td class="wr-now">${kThis.total}</td><td class="wr-prev">${kPrev.total}</td><td>${_deltaSpan(kThis.total, kPrev.total)}</td></tr>
     <tr><td>🏆 Réussite</td><td class="wr-now">${kThis.winRate}%</td><td class="wr-prev">${kPrev.winRate}%</td><td>${_deltaSpan(kThis.winRate, kPrev.winRate, '', true)}</td></tr>
     <tr><td>⏱️ Temps</td><td class="wr-now">${kThis.timeMin}min</td><td class="wr-prev">${kPrev.timeMin}min</td><td>${_deltaSpan(kThis.timeMin, kPrev.timeMin, 'min')}</td></tr>
     <tr><td>📊 Score moy.</td><td class="wr-now">${kThis.avgScore}</td><td class="wr-prev">${kPrev.avgScore}</td><td>${_deltaSpan(kThis.avgScore, kPrev.avgScore)}</td></tr>
     <tr><td>🔥 Combo max</td><td class="wr-now">${kThis.maxCombo}</td><td class="wr-prev">${kPrev.maxCombo}</td><td>${_deltaSpan(kThis.maxCombo, kPrev.maxCombo)}</td></tr>
    </table>
   </div>
   <div class="wreport-section">
    <h4>📅 Activité quotidienne</h4>
    ${chart}
    <div style="text-align:center;font-size:.72em;color:#bdc3c7;">Hauteur = parties · Couleur = taux réussite (vert ≥75%, jaune ≥50%, rouge &lt;50%)</div>
   </div>
   `}
   ${topErrors.length ? `
   <div class="wreport-section">
    <h4>🎯 Erreurs récurrentes (≥2×)</h4>
    ${topErrors.map(e=>`<div class="wr-error-row"><span style="font-family:monospace;">${e.q.replace('=?','= ?')}</span><span class="wr-error-count">${e.count}×</span></div>`).join('')}
   </div>` : ''}
   ${medals.length ? `
   <div class="wreport-section">
    <h4>🏅 Médailles de la semaine</h4>
    <div class="wr-medals">${medals.map(m=>`<div class="wr-medal" title="${m.desc}"><span class="wr-medal-icon">${m.icon}</span><span class="wr-medal-label">${m.label}</span><span class="wr-medal-desc">${m.desc}</span></div>`).join('')}</div>
   </div>` : ''}
   <div class="wreport-section wr-advice">
    <h4>💡 Conseil pour la semaine prochaine</h4>
    <div style="line-height:1.5;">${advice}</div>
   </div>
   <div class="wreport-actions no-print">
    <button onclick="copyWeeklySummary()" style="background:#3498db;">📋 Copier le résumé</button>
    <button onclick="printReport()" style="background:#9b59b6;">🖨️ Imprimer / PDF</button>
   </div>
  </div>`;
 el.innerHTML = html;
 // Texte plat pour la copie (formaté SMS/email, max ~200 mots)
 const txtParts = [
  `📊 Odyssée des Chiffres — Semaine du ${fmtD(wThis.start)} au ${fmtD(wThis.end)}`,
  `Joueur : ${player} · ${verdict}`,
  '',
 ];
 if(kThis.total > 0){
  txtParts.push(
   `Cette semaine : ${kThis.total} partie(s), ${kThis.winRate}% réussite, ${kThis.timeMin} min`,
   `Vs S-1 : ${kPrev.total} partie(s), ${kPrev.winRate}% réussite, ${kPrev.timeMin} min`,
   `Score moyen : ${kThis.avgScore} · Meilleur : ${kThis.bestScore} · Combo max : ×${kThis.maxCombo}`,
  );
 }
 if(topErrors.length){
  txtParts.push('', 'Erreurs récurrentes :');
  topErrors.forEach(e=>txtParts.push(`  · ${e.q.replace('=?','= ?')}  (${e.count}×)`));
 }
 if(medals.length){
  txtParts.push('', 'Médailles : ' + medals.map(m=>`${m.icon} ${m.label}`).join(' · '));
 }
 // Conseil sans HTML
 const adviceTxt = advice.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 txtParts.push('', `Conseil : ${adviceTxt}`, '', '— Généré par L\'Odyssée des Chiffres');
 el.dataset.text = txtParts.join('\n');
}

/**
 * Lance l'impression du rapport (le CSS @media print s'occupe du formatage).
 */
function printReport(){
 // Petit titre temporaire pour la version imprimée
 const player = $('parent-player')?.value || 'Joueur';
 const oldTitle = document.title;
 document.title = `Rapport hebdomadaire — ${player} — ${new Date().toLocaleDateString('fr-FR')}`;
 setTimeout(()=>{
  window.print();
  setTimeout(()=>{ document.title = oldTitle; }, 500);
 }, 100);
}
function copyWeeklySummary(){
 const txt=$('weekly-summary-zone').dataset.text||'';
 navigator.clipboard.writeText(txt).then(()=>toast('📋 Résumé copié !',2500)).catch(()=>{
  const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);toast('📋 Résumé copié !');
 });
}

function saveObj(){
 const player=$('obj-player')?.value||'Soren',count=+($('obj-count')?.value||0);
 try{const d=JSON.parse(localStorage.getItem('user_'+player)||'{}');d.objective=count;localStorage.setItem('user_'+player,JSON.stringify(d));}catch(e){}
 $('obj-status').innerText=`✅ Objectif : ${count} partie(s)/jour pour ${player}.`;beep(600,'sine',.3);
}
function savePin(){
 const pin=$('new-pin')?.value.trim();if(!/^\d{4}$/.test(pin)){$('pin-msg').innerText='❌ 4 chiffres requis.';$('pin-msg').style.color='#e74c3c';return;}
 localStorage.setItem('parentPin',hashPin(pin));$('pin-msg').innerText='✅ Code mis à jour !';$('pin-msg').style.color='#2ecc71';$('new-pin').value='';beep(700,'sine',.3);
}

// ═══════════════════════════════════════════════════════
// CLOUD SAVE
// ═══════════════════════════════════════════════════════
function exportCloud(){
 const sel=$('cloud-player')?.value||'ALL';
 const players=sel==='ALL'?[...KNOWN]:([sel]);
 const cu=localStorage.getItem('customPlayerName');if(cu&&sel==='ALL')players.push(cu);
 const data={};players.forEach(p=>{try{const d=localStorage.getItem('user_'+p);if(d)data[p]=JSON.parse(d);}catch(e){}});
 const code=btoa(unescape(encodeURIComponent(JSON.stringify(data))));
 $('cloud-code').innerText=code;$('cloud-export-zone').classList.remove('hidden');$('cloud-import-zone').classList.add('hidden');
}
function showImportZone(){$('cloud-import-zone').classList.remove('hidden');$('cloud-export-zone').classList.add('hidden');}
function copyCloud(){
 const code=$('cloud-code')?.innerText||'';
 navigator.clipboard.writeText(code).then(()=>toast('📋 Copié !')).catch(()=>{const t=document.createElement('textarea');t.value=code;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);toast('📋 Copié !');});
}
function isValidPlayerData(d){return d&&typeof d==='object'&&!Array.isArray(d)&&typeof d.name==='string'&&d.name.length<=30;}
function sanitizePlayerKey(k){return/^[a-zA-ZÀ-ÿ0-9_\- ]{1,30}$/.test(k);}
// ═══════════════════════════════════════════════════════
// Chantier D1 : Export/Import de profil par fichier
// ═══════════════════════════════════════════════════════
function exportProfileFile(){
 const sel=$('cloud-player')?.value||'ALL';
 const players=sel==='ALL'?[...KNOWN]:([sel]);
 const cu=localStorage.getItem('customPlayerName');
 if(cu&&sel==='ALL'&&!players.includes(cu))players.push(cu);
 const data={};
 let cnt=0;
 players.forEach(p=>{
  try{
   const d=localStorage.getItem('user_'+p);
   if(d){data[p]=JSON.parse(d);cnt++;}
  }catch(e){}
 });
 if(cnt===0){toast('⚠️ Aucun profil à exporter');return;}
 // Wrap dans une enveloppe avec metadata
 const payload={
  app:'odyssee-des-chiffres',
  version:'1',
  exportedAt:new Date().toISOString(),
  players:data,
 };
 const json=JSON.stringify(payload, null, 2);
 const blob=new Blob([json],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;
 const today=new Date().toISOString().slice(0,10); // YYYY-MM-DD
 const playerName=sel==='ALL'?'tous':sel.replace(/[^a-zA-Z0-9]/g,'_');
 a.download=`odyssee_${playerName}_${today}.json`;
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 const msg=$('file-import-msg');
 if(msg){msg.innerText=`✅ ${cnt} profil(s) exporté(s) — ${a.download}`;msg.style.color='#2ecc71';}
 toast(`💾 ${cnt} profil(s) téléchargé(s) !`);
 try{beep(700,'sine',.3);}catch(e){}
}

function triggerImportFile(){
 const input=$('import-file-input');
 if(input)input.click();
}

function importProfileFile(event){
 const file=event.target.files?.[0];
 const msg=$('file-import-msg');
 if(!file){if(msg){msg.innerText='⚠️ Aucun fichier sélectionné.';msg.style.color='#e74c3c';}return;}
 if(!file.name.endsWith('.json')){if(msg){msg.innerText='❌ Le fichier doit être un .json';msg.style.color='#e74c3c';}return;}
 const reader=new FileReader();
 reader.onload=(e)=>{
  try{
   const text=String(e.target.result||'');
   const payload=JSON.parse(text);
   // Compat : soit format v1 (avec wrapper), soit ancien (juste un dict de joueurs)
   let players;
   if(payload.app==='odyssee-des-chiffres' && payload.players){
    players=payload.players;
   } else if(typeof payload==='object'&&!Array.isArray(payload)){
    // Format ancien (compat code base64) : c'est directement le dict des joueurs
    players=payload;
   } else {
    throw new Error('format inconnu');
   }
   // Construire un résumé pour confirmation
   const lines=[];
   let totalCnt=0;
   Object.entries(players).forEach(([name, d])=>{
    if(!sanitizePlayerKey(name)||!isValidPlayerData(d))return;
    const stars=d.stars||0;
    const figs=(d.ownedFigurines||[]).length;
    const wins=Object.values(d.levelWins||{}).reduce((s,n)=>s+n,0);
    lines.push(`• ${name} : ${stars}⭐, ${figs} figurines, ${wins} parties gagnées`);
    totalCnt++;
   });
   if(totalCnt===0){
    if(msg){msg.innerText='❌ Aucun profil valide trouvé dans le fichier.';msg.style.color='#e74c3c';}
    event.target.value='';
    return;
   }
   const recap=lines.join('\n');
   if(!confirm(`Importer ${totalCnt} profil(s) ? Cela écrasera les profils existants portant les mêmes noms.\n\n${recap}`)){
    event.target.value='';
    if(msg){msg.innerText='⚠️ Import annulé.';msg.style.color='#e67e22';}
    return;
   }
   // Effectuer l'import
   let cnt=0,skip=0;
   Object.entries(players).forEach(([name,d])=>{
    if(!sanitizePlayerKey(name)||!isValidPlayerData(d)){skip++;return;}
    localStorage.setItem('user_'+name,JSON.stringify(d));cnt++;
   });
   if(msg){msg.innerText=`✅ ${cnt} profil(s) importé(s)${skip?` (${skip} ignoré(s))`:''}.`;msg.style.color='#2ecc71';}
   toast(`📥 ${cnt} profil(s) importé(s) ! Rechargement…`,3000);
   try{beep(700,'sine',.4);}catch(e){}
   // Si l'utilisateur a importé son propre profil, recharger
   setTimeout(()=>{
    if(typeof loadProfile==='function')loadProfile();
   },800);
  }catch(err){
   console.error('[import] erreur :',err);
   if(msg){msg.innerText='❌ Fichier invalide ou corrompu.';msg.style.color='#e74c3c';}
  }finally{
   event.target.value=''; // reset pour pouvoir réimporter le même fichier
  }
 };
 reader.onerror=()=>{
  if(msg){msg.innerText='❌ Erreur de lecture du fichier.';msg.style.color='#e74c3c';}
 };
 reader.readAsText(file);
}
function doImport(){
 const enc=$('cloud-import')?.value.trim();if(!enc){$('import-msg').innerText='❌ Code vide.';return;}
 try{
  const data=JSON.parse(decodeURIComponent(escape(atob(enc))));
  if(typeof data!=='object'||Array.isArray(data))throw new Error('format invalide');
  let cnt=0,skip=0;
  Object.entries(data).forEach(([p,d])=>{
   if(!sanitizePlayerKey(p)||!isValidPlayerData(d)){skip++;return;}
   localStorage.setItem('user_'+p,JSON.stringify(d));cnt++;
  });
  $('import-msg').innerText=`✅ ${cnt} joueur(s) importé(s)${skip?` (${skip} ignoré(s))`:''}.`;$('import-msg').style.color='#2ecc71';
  $('cloud-import').value='';loadProfile();beep(700,'sine',.4);
 }catch(e){$('import-msg').innerText='❌ Code invalide ou corrompu.';$('import-msg').style.color='#e74c3c';}
}

// OPT-15 : jsPDF chargé dynamiquement à la demande (évite 300 Ko au démarrage)
async function exportPDF(){
 const player=$('parent-player')?.value||'Soren';
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+player)||'null');}catch(e){}
 if(!d){toast('Aucune donnée !');return;}
 if(!window.jspdf){
  await new Promise((res,rej)=>{
   const s=document.createElement('script');
   s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
   s.onload=res;s.onerror=()=>rej(new Error('jsPDF non chargé'));
   document.head.appendChild(s);
  }).catch(()=>{toast('❌ Impossible de charger jsPDF (hors-ligne ?)');return;});
  if(!window.jspdf)return;
 }
 const {jsPDF}=window.jspdf;
 const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
 const W=210,pH=297;let y=22;
 doc.setFillColor(44,62,80);doc.rect(0,0,W,40,'F');
 doc.setTextColor(241,196,15);doc.setFontSize(18);doc.setFont('helvetica','bold');
 doc.text("L'Odyssée des Chiffres",W/2,16,{align:'center'});
 doc.setFontSize(11);doc.setTextColor(255,255,255);
 doc.text(`Rapport de : ${player}  |  ${new Date().toLocaleDateString('fr-FR')}`,W/2,26,{align:'center'});
 y=52;doc.setTextColor(44,62,80);doc.setFontSize(12);doc.setFont('helvetica','normal');
 const h=d.history||[];const total=h.length,wins=h.filter(x=>x.won).length;
 const avg=total?Math.round(h.reduce((a,b)=>a+b.score,0)/total):0;
 const best=total?Math.max(...h.map(x=>x.score)):0;
 const lvl=levelFromXP(d.xp||0);
 const rows=[['Niveau XP','Niv.'+lvl+' ('+d.xp+' XP)'],['Parties jouées',total],['Victoires',`${wins} (${total?Math.round(wins/total*100):0}%)`],['Score moyen',avg],['Meilleur score',best],['Temps de jeu',`${d.sessionMinutes||0} min`],['Trésor (étoiles)',d.stars||0],['Boss battus',`${(d.mapBossBeaten||[]).length}/${MAP_ZONES.length}`]];
 rows.forEach(([k,v])=>{doc.setFont('helvetica','bold');doc.text(k+' :',20,y);doc.setFont('helvetica','normal');doc.text(String(v),110,y);y+=9;});
 y+=4;doc.setFontSize(13);doc.setFont('helvetica','bold');doc.text('10 dernières parties',20,y);y+=8;doc.setFontSize(10);doc.setFont('helvetica','normal');
 h.slice(-10).reverse().forEach(x=>{doc.text(`${x.date}  Niv.${x.level||'?'}  ${x.mode||'?'}  ${x.won?'Victoire':'Défaite'}  ${x.score}pts`,20,y);y+=7;if(y>260){doc.addPage();y=20;}});
 doc.setFillColor(44,62,80);doc.rect(0,pH-12,W,12,'F');doc.setTextColor(189,195,199);doc.setFontSize(8);
 doc.text("L'Odyssée des Chiffres – Rapport automatique",W/2,pH-5,{align:'center'});
 doc.save(`Rapport_${player}.pdf`);
}
// ═══════════════════════════════════════════════════════
// Chantier C3 : Mode "Devoirs" parents
// ═══════════════════════════════════════════════════════

/**
 * Charge dans la vue parent le devoir actuel du joueur sélectionné.
 */
function loadHomework(){
 const sel = $('hw-player')?.value;
 if(!sel) return;
 const status = $('hw-status');
 try{
  const raw = localStorage.getItem('user_'+sel);
  if(!raw){if(status)status.innerText='⚠️ Aucun profil pour ce joueur.';return;}
  const data = JSON.parse(raw);
  const hw = data.homework;
  if(!hw){
   if(status)status.innerHTML = '<span style="color:#bdc3c7;">Aucun devoir actif.</span>';
   return;
  }
  // Préremplir le formulaire
  if($('hw-type'))$('hw-type').value = hw.type || 'any';
  if($('hw-level'))$('hw-level').value = hw.level || 'CE2';
  if($('hw-count'))$('hw-count').value = String(hw.count || 10);
  if($('hw-reward'))$('hw-reward').value = String(hw.reward || 50);
  if(status){
   const prog = hw.progress || 0;
   const total = hw.count || 10;
   const doneTxt = hw.done ? ' ✅ TERMINÉ' : '';
   status.innerHTML = `<span style="color:#2ecc71;">📚 Devoir actif : ${prog}/${total}${doneTxt}</span>`;
  }
 }catch(e){
  console.warn('[homework] load error:', e);
 }
}

/**
 * Sauvegarde un devoir pour le joueur sélectionné.
 */
function saveHomework(){
 const sel = $('hw-player')?.value;
 if(!sel){toast('⚠️ Sélectionnez un joueur'); return;}
 const type = $('hw-type').value;
 const level = $('hw-level').value;
 const count = parseInt($('hw-count').value, 10) || 10;
 const reward = parseInt($('hw-reward').value, 10) || 50;
 try{
  const raw = localStorage.getItem('user_'+sel);
  if(!raw){toast('⚠️ Profil introuvable.', 3000); return;}
  const data = JSON.parse(raw);
  data.homework = { type, level, count, reward, progress: 0, done: false, createdAt: Date.now() };
  localStorage.setItem('user_'+sel, JSON.stringify(data));
  const status = $('hw-status');
  if(status) status.innerHTML = `<span style="color:#2ecc71;">✅ Devoir donné à ${sel} !</span>`;
  toast(`📚 Devoir donné à ${sel} !`, 2500);
  try{beep(700,'sine',.3);}catch(e){}
  // Si l'enfant est le profil actif, recharger
  if(P && P.name === sel){
   P.homework = data.homework;
   if(typeof renderHomework === 'function') renderHomework();
  }
 }catch(e){
  console.error('[homework] save error:', e);
  toast('❌ Erreur lors de la sauvegarde', 3000);
 }
}

/**
 * Annule le devoir actif d'un joueur.
 */
function clearHomework(){
 const sel = $('hw-player')?.value;
 if(!sel) return;
 if(!confirm(`Annuler le devoir de ${sel} ?`)) return;
 try{
  const raw = localStorage.getItem('user_'+sel);
  if(!raw) return;
  const data = JSON.parse(raw);
  delete data.homework;
  localStorage.setItem('user_'+sel, JSON.stringify(data));
  const status = $('hw-status');
  if(status) status.innerHTML = `<span style="color:#bdc3c7;">Devoir annulé.</span>`;
  toast(`🚫 Devoir annulé pour ${sel}`, 2000);
  if(P && P.name === sel){
   delete P.homework;
   if(typeof renderHomework === 'function') renderHomework();
  }
 }catch(e){
  console.error('[homework] clear error:', e);
 }
}
