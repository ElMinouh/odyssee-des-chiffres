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
   const portrait=CHAR_PORTRAITS[fig.id]||`<div style="font-size:1.4em;line-height:56px;text-align:center;">${fig.em||'❓'}</div>`;
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
// RÉSUMÉ HEBDOMADAIRE (copie email/SMS)
// ═══════════════════════════════════════════════════════
function renderWeeklySummary(){
 const player=$('parent-player')?.value||'Soren';
 let d=null;try{d=JSON.parse(localStorage.getItem('user_'+player)||'null');}catch(e){}
 const el=$('weekly-summary-zone');
 if(!d){el.innerHTML='<span style="color:#bdc3c7;">Aucune donnée.</span>';return;}
 const h=d.history||[];const now=new Date();
 const weekStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()-now.getDay());
 const thisWeek=h.filter(x=>{if(!x.date)return false;const[dd,mm]=x.date.split('/');const yr=now.getFullYear()-(now.getMonth()===0&&+mm===12?1:0);const hDate=new Date(yr,+mm-1,+dd);return hDate>=weekStart;});
 const wins=thisWeek.filter(x=>x.won).length,total=thisWeek.length;
 const avg=total?Math.round(thisWeek.reduce((a,b)=>a+(b.score||0),0)/total):0;
 const best=total?Math.max(...thisWeek.map(x=>x.score)):0;
 const lvl=levelFromXP(d.xp||0);
 const sumText=`📊 Résumé Odyssée des Chiffres – Semaine du ${weekStart.toLocaleDateString('fr-FR')}
Joueur : ${player} · Niveau ${lvl}
Parties cette semaine : ${total} (${wins} victoires)
Score moyen : ${avg} pts · Meilleur : ${best} pts
Temps de jeu total : ${d.sessionMinutes||0} min
Trésor : ${d.stars||0} ⭐ · Boss battus : ${(d.mapBossBeaten||[]).length}/${MAP_ZONES.length}
—
Généré par L'Odyssée des Chiffres`;
 el.innerHTML=`<pre style="white-space:pre-wrap;font-size:.8em;color:#ecf0f1;line-height:1.6;">${sumText}</pre>`;
 el.dataset.text=sumText;
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
