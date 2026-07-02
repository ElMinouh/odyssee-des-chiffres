// 09-parent.js — L'Odyssée des Chiffres
'use strict';

// Vue parentale : statistiques, rapport hebdo, sauvegarde cloud, export PDF.
// Variables globales du module
var _pfigFilter = 'none';
var _pfigSearch = '';

// VUE PARENT
// ═══════════════════════════════════════════════════════
function openParent(){
 $('parent-lock').classList.remove('hidden');$('parent-content').classList.add('hidden');$('pin-input').value='';
 const opts=getRoster().map(n=>`<option>${n}</option>`).join('');
['parent-player','obj-player','block-player','filter-player','hw-player','bsubj-player'].forEach(id=>{const e=$(id);if(e)e.innerHTML=opts;});
 $('cloud-player').innerHTML='<option value="ALL">Tous les joueurs</option>'+opts;
 if(typeof navTo==='function') navTo('v-parent'); else showView('v-parent');
}
function checkPin(){
 const now=Date.now();
 if(pinLockUntil>now){const sec=Math.ceil((pinLockUntil-now)/1000);toast(`🔒 Trop de tentatives. Réessayer dans ${sec}s.`,2500);return;}
 const pin=$('pin-input').value;
 if(checkStoredPin(pin)){
  pinAttempts=0;
  $('parent-lock').classList.add('hidden');$('parent-content').classList.remove('hidden');renderReport();renderReportView();
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
 if(name==='rapport'){renderReport();renderReportView();}
 if(name==='controles'){loadBlockSettings();loadFilterSettings();if(typeof onFilterSubjectChange==='function')onFilterSubjectChange();if(typeof loadBlockedSubjects==='function')loadBlockedSubjects();}
 if(name==='objectifs'){ if(typeof onHwLevelChange==='function') onHwLevelChange(); if(typeof loadHomework==='function') loadHomework(); }
 if(name==='options'){setTimeout(()=>{if(typeof optFillProfiles==='function')optFillProfiles(); if(typeof renderProfileManager==='function')renderProfileManager();},60);}
 if(name==='figurines'){
  const sel=$('pfig-player');if(!sel)return;
  const cu=localStorage.getItem('customPlayerName');
  const allP=[...getRoster(),...(cu&&!getRoster().includes(cu)?[cu]:[])]; 
  sel.innerHTML=allP.map(n=>`<option>${n}</option>`).join('');
  sel.value=P.name||getRoster()[0]||'';
  _pfigFilter='none'; _pfigSearch='';
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
  // Première option = "rien sélectionné" pour le lazy-load
  const optNone=document.createElement('option');optNone.value='none';optNone.textContent='— Sélectionne une licence —';
  licSel.appendChild(optNone);
  const optAll=document.createElement('option');optAll.value='all';optAll.textContent='🌐 Toutes les licences';
  licSel.appendChild(optAll);
  UNIVERS_LIST.forEach(({k,label})=>{
   const opt=document.createElement('option');opt.value=k;opt.textContent=`${UNI_ICON[k]||'🎴'} ${label}`;
   licSel.appendChild(opt);
  });
  licSel.value='none';
 }
 const licFilter=licSel?licSel.value:'none';
 const el=$('pfig-content');if(!el)return;

 // Lazy-load : si licence='none' ET pas de recherche, on n'affiche rien d'autre que le message d'accueil
 if(licFilter==='none' && !(_pfigSearch||'').trim()){
  el.innerHTML=`<div style="text-align:center;padding:30px 16px;color:#bdc3c7;">
   <div style="font-size:2.6em;margin-bottom:8px;">🎴</div>
   <p style="font-size:.95em;margin:6px 0;"><strong>Sélectionne une licence dans le menu déroulant</strong></p>
   <p style="font-size:.78em;margin:4px 0;">ou utilise la barre de recherche pour trouver un personnage.</p>
   <p style="font-size:.72em;margin-top:14px;color:#7f8c8d;">${total} figurines réparties dans 25 univers</p>
  </div>`;
  return;
 }

 let html='';
 // Filtrage par recherche
 const searchQ=(_pfigSearch||'').trim().toLowerCase();
 const listToShow = (licFilter==='all'||licFilter==='none')
  ? UNIVERS_LIST
  : UNIVERS_LIST.filter(u=>u.k===licFilter);
 listToShow.forEach(({k,label})=>{
  let uFigs=FIGURINES.filter(f=>f.uk===k);
  if(searchQ){
   uFigs=uFigs.filter(f=>(f.name||'').toLowerCase().includes(searchQ));
  }
  let displayFigs=uFigs; // 'all' = ALL figurines in license, owned or not
  if(_pfigFilter==='owned') displayFigs=uFigs.filter(f=>owned.includes(f.id));
  if(_pfigFilter==='missing') displayFigs=uFigs.filter(f=>!owned.includes(f.id));
  if(!displayFigs.length)return;

  const uOwned=uFigs.filter(f=>owned.includes(f.id)).length;
  const isOpen=uOwned>0||_pfigFilter!=='owned'||searchQ;

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
 const ops=d.opStats||{};const opN={'+':"Addition",'-':"Soustraction",'x':"Multiplication",'/':'Division','geo':'Géométrie','rel':'Nombres relatifs','litt':'Calcul littéral','prop':'Proportionnalité','fonc':'Fonctions / repérage','stat':'Statistiques & probabilités','arith':'Puissances & arithmétique','algo':'Algorithmique','num':'Nombres & décimaux','frac':'Fractions','mes':'Grandeurs & mesures'};
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
  ${typeof _matBilanHtml==='function'?_matBilanHtml(d):''}
  ${typeof _progPanelHtml==='function'?_progPanelHtml(d):''}
  ${h.slice(-7).map(x=>`<div style="display:flex;justify-content:space-between;font-size:.78em;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span>${x.date} · ${x.level||'?'} · ${x.mode||'?'}</span><span style="color:${x.won?'#2ecc71':'#e74c3c'}">${x.won?'✅':'❌'} ${x.score}⭐</span></div>`).join('')}
 </div>`;
}

// ═══════════════════════════════════════════════════════
// SÉLECTEUR DE VUE RAPPORT (v8.6.2)
// Bascule entre "Rapport hebdomadaire" et "100 dernières opérations ratées"
// ═══════════════════════════════════════════════════════
function renderReportView(){
 const mode = $('report-view-mode')?.value || 'weekly';
 const weeklyZone = $('report-view-weekly');
 const errorsZone = $('report-view-errors');
 if(!weeklyZone || !errorsZone) return;
 if(mode === 'errors'){
  weeklyZone.classList.add('hidden');
  errorsZone.classList.remove('hidden');
  renderErrorsList();
 } else {
  errorsZone.classList.add('hidden');
  weeklyZone.classList.remove('hidden');
  if(typeof renderWeeklySummary === 'function') renderWeeklySummary();
 }
}

// Affiche les opérations ratées les plus récentes (depuis errorLog).
// errorLog contient {q:"3+5=8", t:timestamp, tries:nbEchecs} dédupliqué.
function renderErrorsList(){
 const player = $('parent-player')?.value || 'Soren';
 let d = null;
 try{ d = JSON.parse(localStorage.getItem('user_'+player) || 'null'); }catch(e){}
 const el = $('errors-list-zone');
 if(!el) return;
 if(!d){
  el.innerHTML = '<span style="color:#bdc3c7;font-size:.82em;">Aucune donnée pour '+player+'.</span>';
  return;
 }
 const log = Array.isArray(d.errorLog) ? d.errorLog.slice() : [];
 if(!log.length){
  el.innerHTML = '<div style="text-align:center;padding:20px 10px;color:#2ecc71;font-size:.85em;">✅ Aucune opération ratée enregistrée pour '+player+' !<br><span style="color:#7f8c8d;font-size:.9em;">(Les erreurs apparaissent ici au fil des parties)</span></div>';
  return;
 }
 // Tri par date décroissante (plus récentes d'abord), max 100
 log.sort((a,b)=>(b.t||0)-(a.t||0));
 const items = log.slice(0,100);
 // Parse "3+5=8" → opération + bonne réponse
 const rows = items.map(e=>{
  const raw = String(e.q||'');
  const eqIdx = raw.lastIndexOf('=');
  const op = eqIdx>=0 ? raw.slice(0,eqIdx) : raw;
  const good = eqIdx>=0 ? raw.slice(eqIdx+1) : '?';
  const tries = e.tries||1;
  const when = e.t ? new Date(e.t) : null;
  const dateStr = when ? `${String(when.getDate()).padStart(2,'0')}/${String(when.getMonth()+1).padStart(2,'0')} ${String(when.getHours()).padStart(2,'0')}:${String(when.getMinutes()).padStart(2,'0')}` : '';
  const triesBadge = tries>1 ? `<span style="background:rgba(231,76,60,.3);color:#e74c3c;border-radius:4px;padding:1px 6px;font-size:.72em;margin-left:6px;">×${tries}</span>` : '';
  return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:.82em;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.06);">
   <span><strong style="color:#fff;">${op}</strong> = <strong style="color:#2ecc71;">${good}</strong>${triesBadge}</span>
   <span style="color:#7f8c8d;font-size:.85em;">${dateStr}</span>
  </div>`;
 }).join('');
 el.innerHTML = `<div style="background:rgba(255,255,255,.04);border-radius:10px;padding:6px;margin-top:6px;">
  <p style="font-size:.74em;color:#bdc3c7;margin:4px 8px 8px;">${items.length} opération(s) ratée(s) · la bonne réponse est en vert · ×N = nombre d'échecs</p>
  ${rows}
 </div>`;
}
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
 const opN = {'+':"l'addition", '-':"la soustraction", 'x':"la multiplication", '/':"la division", 'geo':"la géométrie", 'rel':"les nombres relatifs", 'litt':"le calcul littéral", 'prop':"la proportionnalité", 'fonc':"les fonctions", 'stat':"les statistiques", 'arith':"les puissances et l'arithmétique", 'algo':"l'algorithmique", 'num':"les nombres décimaux", 'frac':"les fractions", 'mes':"les grandeurs et mesures"};
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
 localStorage.setItem('parentPin',hashPin(pin));
 const q=$('new-secq')?.value.trim(), a=$('new-seca')?.value.trim();
 if(q && a){ localStorage.setItem('parentSecQ',q); localStorage.setItem('parentSecA',hashPin(a.toLowerCase())); }
 $('pin-msg').innerText=(q&&a)?'✅ Code et question secrète enregistrés !':'✅ Code mis à jour !';
 $('pin-msg').style.color='#2ecc71';$('new-pin').value='';if($('new-seca'))$('new-seca').value='';beep(700,'sine',.3);
}

// ═══════════════════════════════════════════════════════
// CLOUD SAVE
// ═══════════════════════════════════════════════════════
function exportCloud(){
 const sel=$('cloud-player')?.value||'ALL';
 const players=sel==='ALL'?[...getRoster()]:([sel]);
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
 const players=sel==='ALL'?[...getRoster()]:([sel]);
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
// v10.2.3 — Export PDF robuste & HORS-LIGNE.
// L'ancienne version dépendait de jsPDF via CDN (échec hors-ligne / interception
// service-worker → page blanche). On imprime désormais un rapport HTML mis en page
// dans une iframe cachée → l'utilisateur choisit « Enregistrer en PDF ».
function _reportLevel(xp){ try{ return (typeof levelFromXP==='function') ? levelFromXP(xp||0) : '?'; }catch(e){ return '?'; } }
function _esc(s){ return String(s==null?'':s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function _buildReportHTML(player, d){
 const h = d.history || [];
 const total = h.length, wins = h.filter(x=>x.won).length;
 const winPct = total ? Math.round(wins/total*100) : 0;
 const avg = total ? Math.round(h.reduce((a,b)=>a+(b.score||0),0)/total) : 0;
 const best = total ? Math.max(...h.map(x=>x.score||0)) : 0;
 const lvl = _reportLevel(d.xp||0);
 const bossTot = (typeof MAP_ZONES!=='undefined' && MAP_ZONES) ? MAP_ZONES.length : 0;
 const boss = (d.mapBossBeaten||[]).length;
 // Récap "hebdomadaire" : les 7 derniers jours d'activité présents dans l'historique
 const byDate = {};
 h.forEach(x=>{ const k = x.date || '—'; (byDate[k]=byDate[k]||[]).push(x); });
 const last7 = Object.keys(byDate).slice(-7);
 const weekRows = last7.map(dt=>{ const g=byDate[dt]; const w=g.filter(x=>x.won).length;
  const av = Math.round(g.reduce((a,b)=>a+(b.score||0),0)/g.length);
  return `<tr><td>${_esc(dt)}</td><td>${g.length}</td><td>${w}</td><td>${av}</td></tr>`; }).join('')
  || `<tr><td colspan="4" style="text-align:center;color:#888;">Aucune partie enregistrée cette période.</td></tr>`;
 const stat = (k,v)=>`<tr><td class="k">${k}</td><td class="v">${_esc(v)}</td></tr>`;
 const statRows = [
  stat('Niveau XP', 'Niv. '+lvl+' ('+(d.xp||0)+' XP)'),
  stat('Parties jouées', total),
  stat('Victoires', wins+' ('+winPct+'%)'),
  stat('Score moyen', avg),
  stat('Meilleur score', best),
  stat('Temps de jeu', (d.sessionMinutes||0)+' min'),
  stat('Trésor (étoiles)', d.stars||0),
  stat('Boss vaincus', boss+(bossTot?(' / '+bossTot):'')),
 ].join('');
 const gameRows = h.slice(-10).reverse().map(x=>
  `<tr><td>${_esc(x.date||'?')}</td><td>${_esc(x.level||'?')}</td><td>${_esc(x.mode||'?')}</td><td>${x.won?'✔ Victoire':'✘ Défaite'}</td><td>${x.score||0} pts</td></tr>`
 ).join('') || `<tr><td colspan="5" style="text-align:center;color:#888;">Aucune partie.</td></tr>`;
 const today = new Date().toLocaleDateString('fr-FR');
 return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport — ${_esc(player)}</title>
 <style>
  @page{ size:A4; margin:14mm; }
  *{ box-sizing:border-box; }
  body{ font-family:'Segoe UI',Arial,sans-serif; color:#1f2d3d; margin:0; }
  .band{ background:#2c3e50; color:#fff; padding:16px 20px; border-radius:8px; text-align:center; }
  .band h1{ margin:0; font-size:20px; color:#f1c40f; letter-spacing:.5px; }
  .band p{ margin:4px 0 0; font-size:12px; }
  h2{ font-size:14px; color:#2c3e50; border-bottom:2px solid #f1c40f; padding-bottom:3px; margin:20px 0 8px; }
  table{ width:100%; border-collapse:collapse; font-size:12px; }
  td,th{ padding:6px 8px; border-bottom:1px solid #e3e8ee; text-align:left; }
  th{ background:#f4f6f9; color:#2c3e50; font-weight:700; }
  td.k{ font-weight:700; width:45%; }
  td.v{ color:#34495e; }
  .foot{ margin-top:24px; text-align:center; font-size:10px; color:#9aa7b4; }
 </style></head><body>
  <div class="band"><h1>L'Odyssée des Chiffres</h1><p>Rapport de <b>${_esc(player)}</b> &nbsp;•&nbsp; ${today}</p></div>
  <h2>Synthèse</h2><table>${statRows}</table>
  <h2>Rapport hebdomadaire (7 derniers jours d'activité)</h2>
  <table><thead><tr><th>Jour</th><th>Parties</th><th>Victoires</th><th>Score moyen</th></tr></thead><tbody>${weekRows}</tbody></table>
  <h2>10 dernières parties</h2>
  <table><thead><tr><th>Date</th><th>Niveau</th><th>Mode</th><th>Résultat</th><th>Score</th></tr></thead><tbody>${gameRows}</tbody></table>
  <div class="foot">L'Odyssée des Chiffres — rapport généré le ${today}</div>
 </body></html>`;
}
function exportPDF(){
 const player = $('parent-player')?.value;
 if(!player){ toast('⚠️ Sélectionne un joueur.'); return; }
 let d=null; try{ d=JSON.parse(localStorage.getItem('user_'+player)||'null'); }catch(e){}
 if(!d){ toast('⚠️ Aucune donnée pour ce joueur !'); return; }
 let html;
 try{ html = _buildReportHTML(player, d); }
 catch(e){ console.error('[exportPDF] build', e); toast('❌ Erreur génération du rapport.'); return; }
 // Téléchargement direct (hors-ligne, sans CDN ni fenêtre d'impression) :
 // un fichier HTML autonome, ouvrable et imprimable en PDF si besoin.
 try{
  const stamp = new Date().toISOString().slice(0,10);
  const safe = String(player).replace(/[^\w\-]+/g,'_');
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Rapport_${safe}_${stamp}.html`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ try{ URL.revokeObjectURL(url); a.remove(); }catch(e){} }, 1500);
  toast('📄 Rapport téléchargé. Ouvre-le pour le lire ou l\'imprimer en PDF.', 4500);
 }catch(e){ console.error('[exportPDF] download', e); toast('❌ Téléchargement impossible sur cet appareil.'); }
}
// ═══════════════════════════════════════════════════════
// Chantier C3 : Mode "Devoirs" parents
// ═══════════════════════════════════════════════════════

/**
 * v10.2.3 — Adapte la liste des types de devoir au cycle du niveau choisi
 * (maternelle : activités globales ; primaire : opérations + tables ; collège : opérations).
 */
function _hwCycle(level){
 if(['PS','MS','GS'].includes(level)) return 'mat';
 if(['6E','5E','4E','3E'].includes(level)) return 'col';
 return 'prim';
}
function onHwLevelChange(){
 const lvlSel = $('hw-level'), typeSel = $('hw-type');
 if(!lvlSel || !typeSel) return;
 const subj = $('hw-subject')?.value || 'math';
 if(subj !== 'math'){ typeSel.innerHTML = '<option value="any">Tout le français</option>'; return; }
 const cycle = _hwCycle(lvlSel.value);
 const prev = typeSel.value;
 let opts;
 if(cycle === 'mat'){
  opts = [['any','Toutes les activités']];
 } else if(cycle === 'col'){
  opts = [['any','Toutes les opérations'],['add','Additions'],['sub','Soustractions'],['mult','Multiplications'],['div','Divisions']];
 } else {
  opts = [['any','Toutes opérations'],['add','Additions'],['sub','Soustractions'],['mult','Multiplications'],['div','Divisions'],
   ['table_2','Table de 2'],['table_3','Table de 3'],['table_4','Table de 4'],['table_5','Table de 5'],['table_6','Table de 6'],
   ['table_7','Table de 7'],['table_8','Table de 8'],['table_9','Table de 9'],['table_10','Table de 10']];
 }
 typeSel.innerHTML = opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
 if(opts.some(o=>o[0]===prev)) typeSel.value = prev;
}
// Matière du devoir : adapte la liste des types (français = « tout le français »).
function onHwSubjectChange(){
 if(typeof onHwLevelChange === 'function') onHwLevelChange();
}
// Filtres (Contrôles) : bascule entre filtres maths et note français.
function onFilterSubjectChange(){
 const subj = $('filter-subject')?.value || 'math';
 const isFr = subj !== 'math';
 const note = $('filter-fr-note'), ops = $('op-filters');
 if(note) note.classList.toggle('hidden', !isFr);
 if(ops) ops.classList.toggle('hidden', isFr);
}
// ── Blocage de matières entières (par joueur) ──
const _BSUBJ_LIST = [['math','🔢 Mathématiques'],['fr','📖 Français'],['hist','🏛️ Histoire'],['geo','🌍 Géographie'],['en','🇬🇧 Anglais'],['svt','🧬 SVT'],['pc','⚗️ Physique-Chimie']];
function loadBlockedSubjects(){
 const sel=$('bsubj-player')?.value; const list=$('bsubj-list'); if(!sel||!list) return;
 let blocked=[];
 try{ const raw=localStorage.getItem('user_'+sel); if(raw){ const d=JSON.parse(raw); blocked=Array.isArray(d.blockedSubjects)?d.blockedSubjects:[]; } }catch(e){}
 list.innerHTML=_BSUBJ_LIST.map(([k,l])=>`<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.9em;"><input type="checkbox" class="bsubj-cb" value="${k}" ${blocked.indexOf(k)>=0?'checked':''}> ${l}</label>`).join('');
 const st=$('bsubj-status'); if(st) st.innerText='';
}
function saveBlockedSubjects(){
 const sel=$('bsubj-player')?.value; if(!sel){if(typeof toast==='function')toast('⚠️ Sélectionnez un joueur');return;}
 const blocked=[].slice.call(document.querySelectorAll('.bsubj-cb:checked')).map(c=>c.value);
 try{
  const raw=localStorage.getItem('user_'+sel); if(!raw){if(typeof toast==='function')toast('⚠️ Profil introuvable.',3000);return;}
  const d=JSON.parse(raw); d.blockedSubjects=blocked; localStorage.setItem('user_'+sel,JSON.stringify(d));
  if(typeof P!=='undefined' && P && P.name===sel) P.blockedSubjects=blocked;
  const st=$('bsubj-status'); if(st) st.innerHTML=blocked.length?`<span style="color:#2ecc71;">✅ ${blocked.length} matière(s) bloquée(s) pour ${sel}.</span>`:`<span style="color:#2ecc71;">✅ Aucune matière bloquée.</span>`;
  if(typeof toast==='function')toast('🔒 Blocage enregistré pour '+sel,2200); try{beep(700,'sine',.3);}catch(e){}
 }catch(e){ console.error('[bsubj] save error:',e); if(typeof toast==='function')toast('❌ Erreur',3000); }
}

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
  // Préremplir le formulaire (matière + niveau → adapte la liste des types)
  if($('hw-subject'))$('hw-subject').value = hw.subject || 'math';
  if($('hw-level'))$('hw-level').value = hw.level || 'CE2';
  if(typeof onHwLevelChange === 'function') onHwLevelChange();
  if($('hw-type'))$('hw-type').value = hw.type || 'any';
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
 const subject = $('hw-subject')?.value || 'math';
 const count = parseInt($('hw-count').value, 10) || 10;
 const reward = parseInt($('hw-reward').value, 10) || 50;
 try{
  const raw = localStorage.getItem('user_'+sel);
  if(!raw){toast('⚠️ Profil introuvable.', 3000); return;}
  const data = JSON.parse(raw);
  data.homework = { type, level, subject, count, reward, progress: 0, done: false, createdAt: Date.now() };
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

// ═══════════════════════════════════════════════════════
// Chantier Cloud Sync : panneau de gestion (Vue Parent)
// ═══════════════════════════════════════════════════════

// Liste tous les profils joueurs présents en localStorage
function _listAllProfilesNames(){
 const names = new Set();
 // Profils prédéfinis (source de vérité : constante KNOWN dans 02-data.js)
 getRoster().forEach(n => names.add(n));
 // Profils personnalisés
 try{
  const customs = JSON.parse(localStorage.getItem('customPlayerNames') || '[]');
  customs.forEach(n => { if(typeof n === 'string') names.add(n); });
 }catch(e){}
 // Profils détectés en localStorage (user_*)
 for(let i=0;i<localStorage.length;i++){
  const k = localStorage.key(i);
  if(k && k.startsWith('user_')) names.add(k.slice(5));
 }
 return Array.from(names);
}

// Charge un profil depuis localStorage (sans toucher au profil actif P)
function _readProfile(name){
 try{ return JSON.parse(localStorage.getItem('user_'+name) || 'null'); }
 catch(e){ return null; }
}

// Écrit un profil dans localStorage
function _writeProfile(profile){
 try{ localStorage.setItem('user_'+profile.name, JSON.stringify(profile)); return true; }
 catch(e){ return false; }
}

// Met à jour le sélecteur du joueur dans le panneau cloud
function _populateCloudPlayerSelect(){
 const sel = document.getElementById('cloud-sync-player');
 if(!sel) return;
 const names = _listAllProfilesNames();
 const current = sel.value || (P && P.name) || names[0] || '';
 sel.innerHTML = names.map(n => `<option value="${n}"${n===current?' selected':''}>${n}</option>`).join('');
}

// Rendu du panneau Cloud pour le joueur sélectionné
function renderCloudPanel(){
 const container = document.getElementById('cloud-panel-content');
 if(!container) return;
 _populateCloudPlayerSelect();
 const sel = document.getElementById('cloud-sync-player');
 const name = sel ? sel.value : (P && P.name);
 if(!name){ container.innerHTML = '<p style="font-size:.78em;color:#bdc3c7;">Aucun profil détecté.</p>'; return; }
 // Si c'est le profil actif, on génère le code si manquant
 if(P && P.name === name){
  if(typeof ensureCloudCode === 'function') ensureCloudCode(P);
  if(typeof saveProfileNow === 'function') saveProfileNow();
 }
 const prof = (P && P.name === name) ? P : _readProfile(name);
 if(!prof){ container.innerHTML = '<p style="font-size:.78em;color:#bdc3c7;">Profil introuvable.</p>'; return; }
 // Pour les profils non-actifs, on génère aussi le code si manquant
 if(!prof.cloudCode && typeof generateCloudCode === 'function'){
  prof.cloudCode = generateCloudCode(prof.name);
  prof.cloudEnabled = false;
  _writeProfile(prof);
 }
 const isActive = !!prof.cloudEnabled;
 const code = prof.cloudCode || '(non généré)';
 const lastSync = isActive && (P && P.name === name) && typeof getCloudStatus === 'function'
  ? getCloudStatus().lastSync : 0;
 const lastSyncStr = lastSync
  ? new Date(lastSync).toLocaleString('fr-FR')
  : (isActive ? 'en attente…' : '—');
 // v9.4.16 : nom échappé pour le HTML (esc) et pour les onclick (apostrophes) —
 // un prénom comme « L'éa » cassait les boutons cloud.
 const _nH = esc(prof.name);
 const _nJ = String(prof.name).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
 container.innerHTML = `
  <div style="background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.3);border-radius:8px;padding:10px;margin-top:6px;">
   <p style="font-size:.78em;color:#bdc3c7;margin:0 0 4px;">Code de sauvegarde de <strong style="color:#fff;">${_nH}</strong> :</p>
   <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
    <code style="font-size:1.05em;color:#3498db;font-weight:700;background:rgba(0,0,0,.25);padding:6px 10px;border-radius:6px;letter-spacing:1px;font-family:monospace;">${code}</code>
    <button onclick="doCloudCopyFor('${_nJ}')" style="font-size:.78em;padding:5px 10px;background:#34495e;">📋 Copier</button>
   </div>
   <p style="font-size:.72em;color:#bdc3c7;margin:8px 0 4px;">Statut : <strong style="color:${isActive?'#2ecc71':'#e67e22'};">${isActive?'☁️ Activé':'⏸ Désactivé'}</strong></p>
   ${isActive ? `<p style="font-size:.72em;color:#bdc3c7;margin:4px 0;">Dernière sync : ${lastSyncStr}</p>` : `<p style="font-size:.74em;color:#e67e22;margin:6px 0;background:rgba(230,126,34,.12);border-radius:6px;padding:6px 8px;">⚠️ <b>Sauvegarde non activée</b> : tant que ce bouton n'est pas activé, la progression de ${_nH} n'est <b>pas envoyée au cloud</b> et ne peut pas être récupérée sur un autre appareil. Active-la ci-dessous.</p>`}
   <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
    ${isActive
     ? `<button onclick="doCloudSyncNow('${_nJ}')" style="background:#3498db;font-size:.82em;">🔄 Synchroniser maintenant</button>
        <button onclick="doCloudDisable('${_nJ}')" style="background:#7f8c8d;font-size:.82em;">⏸ Désactiver</button>`
     : `<button onclick="doCloudEnable('${_nJ}')" style="background:#27ae60;font-size:.82em;">☁️ Activer la sauvegarde cloud</button>`
    }
   </div>
  </div>
 `;
}

// Active la sync cloud pour un profil donné
async function doCloudEnable(name){
 if(!P || P.name !== name){
  toast('⚠️ Activation possible uniquement pour le profil actif',3500);
  return;
 }
 if(typeof enableCloudSync === 'function'){
  const ok = await enableCloudSync();
  renderCloudPanel();
 }
}

// Désactive la sync cloud
function doCloudDisable(name){
 if(!P || P.name !== name){
  toast('⚠️ Désactivation possible uniquement pour le profil actif',3500);
  return;
 }
 if(typeof disableCloudSync === 'function'){
  disableCloudSync();
  renderCloudPanel();
 }
}

// Force une synchronisation immédiate
async function doCloudSyncNow(name){
 if(!P || P.name !== name){
  toast('⚠️ Sync possible uniquement pour le profil actif',3500);
  return;
 }
 if(typeof pushProfileToCloud === 'function'){
  const ok = await pushProfileToCloud();
  if(ok) toast('☁️ Synchronisé !',2000);
  else toast('⚠️ Échec de synchronisation',2500);
  renderCloudPanel();
 }
}

// Copie le code d'un profil donné
async function doCloudCopyFor(name){
 const prof = (P && P.name === name) ? P : _readProfile(name);
 if(!prof || !prof.cloudCode){ toast('⚠️ Aucun code à copier',2000); return; }
 try{
  if(navigator.clipboard && navigator.clipboard.writeText){
   await navigator.clipboard.writeText(prof.cloudCode);
   toast('📋 Code copié !',2000);
   return;
  }
 }catch(e){}
 // Fallback
 const ta = document.createElement('textarea');
 ta.value = prof.cloudCode;
 ta.style.position='fixed';ta.style.opacity='0';
 document.body.appendChild(ta);
 ta.select();
 try{ document.execCommand('copy'); toast('📋 Code copié !',2000); }
 catch(e){ toast('⚠️ Impossible de copier',2500); }
 document.body.removeChild(ta);
}

// Affiche le diagnostic de sync dans la zone de texte (v8.6.6)
function showSyncDiag(){
 const zone = document.getElementById('sync-diag-zone');
 if(!zone) return;
 let diag = '(fonction de diagnostic indisponible)';
 if(typeof getSyncDiag === 'function') diag = getSyncDiag();
 let header = '=== DIAGNOSTIC SYNC ODYSSEE ===\n';
 try{
  header += 'Date: ' + new Date().toLocaleString('fr-FR') + '\n';
  header += 'CACHE_VERSION attendu: v8.6.6\n';
  header += 'En ligne: ' + (navigator.onLine ? 'OUI' : 'NON') + '\n';
  header += 'lastPlayer: ' + (localStorage.getItem('lastPlayer')||'(aucun)') + '\n';
  const profs = [];
  for(let i=0;i<localStorage.length;i++){
   const k = localStorage.key(i);
   if(k && k.startsWith('user_')){
    try{
     const p = JSON.parse(localStorage.getItem(k));
     profs.push('  '+k.slice(5)+': xp='+p.xp+' code='+p.cloudCode+' cloud='+p.cloudEnabled);
    }catch(e){ profs.push('  '+k.slice(5)+': (illisible)'); }
   }
  }
  header += 'Profils locaux:\n' + (profs.join('\n')||'  (aucun)') + '\n';
 }catch(e){ header += '(erreur lecture contexte: '+e.message+')\n'; }
 header += '=== JOURNAL DES ETAPES ===\n';
 zone.value = header + diag;
 zone.scrollTop = zone.scrollHeight;
}

// Restauration FORCÉE par code (v8.6.1) — simple et fiable.
// Écrase le profil local et recharge la page pour un état propre.
async function doForceCloudRestore(){
 const input = document.getElementById('cloud-force-code');
 const msg = document.getElementById('cloud-force-msg');
 if(!input || !msg) return;
 const code = (input.value || '').trim().toUpperCase();
 if(!code){ msg.style.color='#e74c3c'; msg.textContent='Entre un code valide.'; return; }
 if(typeof forceRestoreFromCloud !== 'function'){
  msg.style.color='#e74c3c'; msg.textContent='Récupération non disponible.'; return;
 }
 msg.style.color='#bdc3c7'; msg.textContent='⏳ Récupération en cours…';
 const result = await forceRestoreFromCloud(code);
 if(!result.ok){
  msg.style.color='#e74c3c';
  if(result.error === 'not_found'){
   msg.innerHTML='❌ <b>Ce code n\'existe pas sur le serveur cloud.</b><br><br>'+
    'Cause la plus probable : la <b>sauvegarde cloud n\'a jamais été activée</b> sur l\'appareil source (PC/tablette).<br><br>'+
    '👉 Sur l\'appareil où le profil fonctionne : va dans Vue Parent → Sauvegarde Cloud → clique sur le bouton vert <b>"☁️ Activer la sauvegarde cloud"</b>. Attends quelques secondes, puis réessaie ici avec le code affiché là-bas.';
  }
  else if(result.error === 'invalid_code') msg.textContent='❌ Format de code invalide. Exemple : SOREN-7B4K9X';
  else if(result.error === 'storage_full') msg.textContent='❌ Stockage local plein.';
  else if(result.error === 'network_error' || result.error === 'Failed to fetch') msg.textContent='❌ Pas de connexion internet. Connecte-toi et réessaie.';
  else msg.textContent='❌ Erreur : '+result.error;
  return;
 }
 msg.style.color='#2ecc71';
 msg.innerHTML=`✅ Profil <b>"${result.name}"</b> récupéré avec succès !<br>Rechargement de la page…`;
 input.value='';
 // Recharge complète après 2s pour un état 100% propre
 setTimeout(() => {
  try{ window.location.reload(); }
  catch(e){ window.location.href = window.location.href; }
 }, 2000);
}

// Restauration d'un profil par code (ANCIENNE méthode, sans rechargement)
async function doCloudRestore(){
 const input = document.getElementById('cloud-restore-code');
 const msg = document.getElementById('cloud-restore-msg');
 if(!input || !msg) return;
 const code = (input.value || '').trim().toUpperCase();
 if(!code){ msg.style.color='#e74c3c'; msg.textContent='Entre un code valide.'; return; }
 if(typeof restoreProfileByCode !== 'function'){
  msg.style.color='#e74c3c'; msg.textContent='Cloud sync non disponible.'; return;
 }
 msg.style.color='#bdc3c7'; msg.textContent='⏳ Récupération en cours…';
 const result = await restoreProfileByCode(code);
 if(!result.ok){
  msg.style.color='#e74c3c';
  if(result.error === 'not_found') msg.textContent='❌ Code introuvable. Vérifie l\'orthographe.';
  else if(result.error === 'invalid_code') msg.textContent='❌ Format de code invalide.';
  else if(result.error === 'storage_full') msg.textContent='❌ Espace de stockage local plein.';
  else msg.textContent='❌ Erreur : '+result.error;
  return;
 }
 msg.style.color='#2ecc71';
 msg.textContent=`✅ Profil "${result.name}" restauré ! Sélectionne-le sur l'écran d'accueil.`;
 input.value='';
 // Mettre à jour les listes déroulantes
 if(typeof renderResetZone === 'function') renderResetZone();
 _populateCloudPlayerSelect();
 renderCloudPanel();
 // Mettre à jour le selecteur de joueur sur l'accueil
 try{
  const playerSel = document.getElementById('playerSelect');
  if(playerSel){
   const exists = Array.from(playerSel.options).some(o => o.value === result.name);
   if(!exists){
    const opt = document.createElement('option');
    opt.value = result.name; opt.textContent = result.name;
    // Insérer avant "Autre"
    const autreOpt = Array.from(playerSel.options).find(o => o.value === 'Autre');
    if(autreOpt) playerSel.insertBefore(opt, autreOpt);
    else playerSel.appendChild(opt);
   }
  }
 }catch(e){}
}

// ── Gestion des profils (écran parent → Options) ────────────────────
// Ajout/retrait de profils. Retirer un profil n'efface PAS sa sauvegarde
// (user_*) : la progression réapparaît si on le rajoute.
function renderProfileManager(){
 const box=$('profile-manager'); if(!box) return;
 const _e=(typeof esc==='function')?esc:(s=>String(s));
 const roster=(typeof getRoster==='function')?getRoster():[];
 const rows = roster.length
  ? roster.map(n=>`<div class="lb-row"><span class="lb-name" style="flex:1;">${_e(n)}</span><button onclick="pmRemoveProfile(this.dataset.n)" data-n="${_e(n)}" title="Retirer ${_e(n)}" style="background:#e74c3c;color:#fff;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;font-weight:700;line-height:1;">✕</button></div>`).join('')
  : '<span style="color:#bdc3c7;">Aucun profil pour le moment. Ajoute-en un ci-dessous.</span>';
 box.innerHTML = `<div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px;">
   <strong>👤 Profils du jeu</strong>
   <div style="margin:8px 0;display:flex;flex-direction:column;gap:5px;">${rows}</div>
   <div style="display:flex;gap:6px;"><input id="pm-new" type="text" placeholder="Nouveau prénom…" maxlength="20" style="flex:1;" onkeydown="if(event.key==='Enter')pmAddProfile()"><button onclick="pmAddProfile()" style="background:#27ae60;color:#fff;border:none;border-radius:8px;padding:0 14px;cursor:pointer;font-weight:700;">Ajouter</button></div>
   <div style="font-size:.74em;color:#9aa6b2;margin-top:6px;line-height:1.4;">Les profils et tous leurs progrès sont enregistrés sur cet appareil. Retirer un profil n'efface pas sa progression : il réapparaîtra si tu le rajoutes. L'anniversaire se règle dans le panneau du profil ci-dessus.</div>
  </div>`;
}
function pmAddProfile(){
 const i=$('pm-new'); if(!i) return; const n=i.value.trim();
 if(!n) return;
 if(typeof addToRoster!=='function') return;
 if(!addToRoster(n)){ if(typeof toast==='function')toast('Ce profil existe déjà.',2000); return; }
 if(typeof chatEnableForProfile==='function'){ try{ chatEnableForProfile(n); }catch(e){} } // messagerie activée par défaut (contacts validés par les parents)
 i.value='';
 renderProfileManager();
 if(typeof fillPlayerSelect==='function') fillPlayerSelect();
 if(typeof toast==='function')toast('✅ Profil ajouté : '+n,2000);
}
function pmRemoveProfile(n){
 if(!n || typeof removeFromRoster!=='function') return;
 if(!confirm('Retirer « '+n+' » de la liste ?\n\nSa progression reste sauvegardée sur l\'appareil et réapparaîtra si tu le rajoutes.')) return;
 removeFromRoster(n);
 renderProfileManager();
 if(typeof fillPlayerSelect==='function') fillPlayerSelect();
}

function pmSetBirthday(name, field, val){
 if(typeof getBirthday!=='function' || typeof setBirthday!=='function') return;
 const cur=getBirthday(name)||{m:0,d:0};
 const v=parseInt(val,10)||0;
 if(field==='m') cur.m=v; else cur.d=v;
 setBirthday(name, cur.m, cur.d);
}

// ── Onglet Options réorganisé : pilotage par profil ──────────────────
function optFillProfiles(){
 const sel=$('opt-profile'); if(!sel) return;
 const _e=(typeof esc==='function')?esc:(s=>String(s));
 const roster=(typeof getRoster==='function')?getRoster():[];
 sel.innerHTML=roster.map(n=>`<option value="${_e(n)}">${_e(n)}</option>`).join('');
 if(P && P.name && roster.includes(P.name)) sel.value=P.name;
 optSelectProfile();
}
function optSelectProfile(){
 const sel=$('opt-profile'); if(!sel) return;
 const name=sel.value; if(!name){ const b=$('opt-birthday'); if(b)b.innerHTML='<span style="font-size:.78em;color:#bdc3c7;">Aucun profil. Ajoute-en un dans « Général ».</span>'; return; }
 const roster=(typeof getRoster==='function')?getRoster():[];
 const opts=roster.map(n=>`<option>${n}</option>`).join('');
 const cs=$('cloud-sync-player'); if(cs){ cs.innerHTML=opts; cs.value=name; }
 const cp=$('cloud-player'); if(cp){ cp.innerHTML=opts; cp.value=name; }
 if(typeof renderCloudPanel==='function') renderCloudPanel();
 renderOptBirthday(name);
 renderOptResetOne(name);
 if(typeof renderOptMessaging==="function") renderOptMessaging(name);
}
function renderOptBirthday(name){
 const box=$('opt-birthday'); if(!box) return;
 const b=(typeof getBirthday==='function')?getBirthday(name):null;
 const dd=(b&&b.d)?b.d:'', mm=(b&&b.m)?b.m:'';
 const _e=(typeof esc==='function')?esc:(s=>String(s));
 box.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
   <label style="font-size:.78em;color:#bdc3c7;">Jour d'anniversaire</label>
   <input type="number" min="1" max="31" value="${dd}" data-n="${_e(name)}" onchange="pmSetBirthday(this.dataset.n,'d',this.value)" style="width:56px;text-align:center;">
   <label style="font-size:.78em;color:#bdc3c7;">Mois d'anniversaire</label>
   <input type="number" min="1" max="12" value="${mm}" data-n="${_e(name)}" onchange="pmSetBirthday(this.dataset.n,'m',this.value)" style="width:56px;text-align:center;">
  </div>`;
}
function renderOptResetOne(name){
 const box=$('opt-reset-one'); if(!box) return;
 const en=encodeURIComponent(name);
 let stars=0,figs=0,lvl=1,zb=0;
 try{const p=JSON.parse(localStorage.getItem('user_'+name)||'null'); if(p){stars=p.stars||0;figs=(p.ownedFigurines||[]).length;lvl=p.xp?Math.floor(p.xp/100)+1:1;zb=(p.mapBossBeaten||[]).length;}}catch(e){}
 box.innerHTML=`<div style="font-size:.72em;color:#bdc3c7;margin-bottom:6px;">Niv.${lvl} · ${stars} étoiles · ${figs} figurines · ${zb}/23 zones</div>
  <div style="display:flex;gap:6px;">
   <button data-pname="${en}" onclick="resetAdventure(decodeURIComponent(this.dataset.pname))" style="flex:1;background:#16a085;color:#fff;padding:8px 10px;font-size:.78em;font-weight:700;border-radius:8px;border:2px solid #1abc9c;cursor:pointer;">🗺 Reset Aventure</button>
   <button data-pname="${en}" onclick="resetProfile(decodeURIComponent(this.dataset.pname))" style="flex:1;background:#c0392b;color:#fff;padding:8px 10px;font-size:.78em;font-weight:700;border-radius:8px;border:2px solid #ff6b6b;cursor:pointer;">🗑 Reset Total</button>
  </div>`;
}
// Sauvegarde globale : un seul fichier contenant tous les profils.
function exportAllProfiles(){
 const roster=(typeof getRoster==='function')?getRoster():[];
 const profiles={};
 roster.forEach(n=>{ try{ const d=localStorage.getItem('user_'+n); if(d) profiles[n]=JSON.parse(d); }catch(e){} });
 const bundle={ _type:'odyssee-all-profiles', _date:Date.now(), roster, birthdays:(typeof getBirthdays==='function'?getBirthdays():{}), profiles };
 try{
  const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download='odyssee-tous-profils-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  if(typeof toast==='function') toast('💾 Sauvegarde de tous les profils téléchargée !',2500);
 }catch(e){ if(typeof toast==='function') toast('Échec de la sauvegarde globale.',2500); }
}
// Réinitialisation globale (double confirmation).
function resetAllProfiles(){
 const roster=(typeof getRoster==='function')?getRoster():[];
 if(!roster.length){ if(typeof toast==='function') toast('Aucun profil.',2000); return; }
 if(!confirm('⚠️ Réinitialiser TOUS les profils ('+roster.join(', ')+') ?\n\nÉtoiles, figurines, XP, badges : tout sera remis à zéro. Action irréversible.')) return;
 if(!confirm('Confirmation finale : tout remettre à zéro ?')) return;
 roster.forEach(n=>{ try{ localStorage.removeItem('user_'+n); }catch(e){} });
 if(typeof toast==='function') toast('Tous les profils ont été réinitialisés.',2500);
 setTimeout(()=>{ try{ location.reload(); }catch(e){} }, 900);
}
// Récupération du code parent via question secrète (écran de verrouillage).
function recoverParentPin(){
 const q=localStorage.getItem('parentSecQ');
 if(!q){ alert("Aucune question secrète n'a été configurée.\n\nAstuce : si le code n'a jamais été changé, le code par défaut est 1234."); return; }
 const ans=prompt('Question secrète :\n\n'+q);
 if(ans===null) return;
 const stored=localStorage.getItem('parentSecA');
 if(stored && (typeof hashPin==='function') && hashPin(String(ans).trim().toLowerCase())===stored){
  const np=prompt('✅ Bonne réponse !\n\nChoisis un nouveau code parent (4 chiffres) :');
  if(np!==null){
   if(/^\d{4}$/.test(String(np).trim())){ localStorage.setItem('parentPin',hashPin(String(np).trim())); alert('Code mis à jour. Tu peux maintenant te connecter avec ce nouveau code.'); }
   else alert('Code invalide : il faut exactement 4 chiffres. Recommence.');
  }
 } else {
  alert('❌ Réponse incorrecte.');
 }
}
