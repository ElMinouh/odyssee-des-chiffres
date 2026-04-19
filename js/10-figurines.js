// 10-figurines.js — L'Odyssée des Chiffres
'use strict';

// Boutique figurines, viewer 3D, animations iconiques, sons synthétiques,
// réinitialisation des profils.

function renderFigurinesShop(filter){
 // Garantir que les portraits sont disponibles (ne fait rien si déjà chargé).
 if(typeof loadPortraits==='function')loadPortraits().then(()=>{
  if(_figFilter===(filter??_figFilter))_renderFigurinesShop(_figFilter);
 });
 _renderFigurinesShop(filter);
}
function _renderFigurinesShop(filter){
 if(filter!==undefined)_figFilter=filter;
 const owned=P.ownedFigurines||[];
 const total=FIGURINES.length;

 // Build filter bar
 const SHOP_LICENSES=[
  {k:'all',label:'🌐 Toutes les licences'},
  {k:'mine',label:'⭐ Ma collection'},
  {k:'db',label:'🐉 Dragon Ball'},
  {k:'hp',label:'⚡ Harry Potter'},
  {k:'sw',label:'🚀 Star Wars'},
  {k:'nj',label:'🥷 Ninjago'},
  {k:'tu',label:'🐢 Tortues Ninja'},
  {k:'sm',label:'🌙 Sailor Moon'},
  {k:'mi',label:'🐞 Miraculous'},
  {k:'pj',label:'🦸 Pyjamasques'},
  {k:'bl',label:'🐕 Bluey'},
  {k:'dr',label:'🐉 Dragons'},
  {k:'mv',label:'🦸 Marvel'},
  {k:'pk',label:'⚡ Pokémon'},
  {k:'fr',label:'❄️ Reine des Neiges'},
  {k:'mk',label:'🐭 Mickey & Amis'},
  {k:'mr',label:'🍄 Mario Bros'},
  {k:'br',label:'💗 Barbie'},
  {k:'sp',label:'🕵️ Totally Spies'},
  {k:'ot',label:'⚽ Olive & Tom'},
  {k:'mc',label:'🌟 Cités d\'Or'},
  {k:'gd',label:'🤖 Goldorak'},
  {k:'cz',label:'🏆 Chevaliers du Zodiaque'},
  {k:'tm',label:'⚔️ 3 Mousquetaires'},
  {k:'bm',label:'🦇 Batman'},
  {k:'tn',label:'🔍 Tintin'},
  {k:'ax',label:'🏺 Astérix'},
  {k:'co',label:'🔫 Cobra'},
  {k:'al',label:'☠️ Albator'},
 ];

 const searchId='shop-search-'+Math.random().toString(36).slice(2,6);
 let html=`<div class="shop-filter-bar">
  <div class="shop-quick-btns">
   <button class="shop-quick-btn${_figFilter==='all'?' active':''}" onclick="renderFigurinesShop('all')">🌐 Tout</button>
   <button class="shop-quick-btn${_figFilter==='mine'?' active':''}" onclick="renderFigurinesShop('mine')">⭐ Moi</button>
  </div>
  <select id="shop-license-sel" onchange="renderFigurinesShop(this.value)" style="flex:1;min-width:130px;">`;
 SHOP_LICENSES.forEach(({k,label})=>{
  const cnt=k==='all'?FIGURINES.length:k==='mine'?owned.length:FIGURINES.filter(f=>f.uk===k).length;
  html+=`<option value="${k}"${_figFilter===k?' selected':''}>${label} (${cnt})</option>`;
 });
 html+=`</select>
  <input id="shop-search-input" class="shop-search" type="text" placeholder="🔍 Rechercher…" value="${_shopSearch}" oninput="_shopSearch=this.value;renderFigurinesShop()" maxlength="30">
 </div>`;

 // Filter list
 let list;
 if(_figFilter==='all') list=FIGURINES;
 else if(_figFilter==='mine') list=FIGURINES.filter(f=>owned.includes(f.id));
 else list=FIGURINES.filter(f=>f.uk===_figFilter);

 // Apply search
 if(_shopSearch.trim()){
  const q=_shopSearch.trim().toLowerCase();
  list=list.filter(f=>f.name.toLowerCase().includes(q)||f.uni.toLowerCase().includes(q));
 }

 if(list.length===0){
  html+='<div style="color:rgba(255,255,255,.4);font-size:.82em;text-align:center;padding:20px;">Aucune figurine trouvée.</div>';
  $('p-figurines').innerHTML=html;
  return;
 }
 html+='<div class="fig-grid">';
 list.forEach(fig=>{
  const isOwned=owned.includes(fig.id);
  html+=`<div class="fig-card${isOwned?' owned':''}"${isOwned?` onclick="openFigViewer('${fig.id}')" title="Voir en 3D 🎬"`:''}>`;
  if(isOwned) html+='<div class="fig-mark">✓</div>';
  html+=`<span class="fig-em">${CHAR_PORTRAITS[fig.id]||'<div style="font-size:2em;line-height:75px;text-align:center;">'+(fig.em||'❓')+'</div>'}</span>`;
  html+=`<div class="fig-rv" style="color:${RARITY_COL[fig.r]}">${RARITY_STARS[fig.r]}</div>`;
  html+=`<div class="fig-nm">${fig.name}</div>`;
  html+=`<span class="fig-unib u-${fig.uk}">${UNI_ICON[fig.uk]} ${fig.uni}</span><br>`;
  if(isOwned){
   html+=`<span style="font-size:.65em;color:#2ecc71;font-weight:700;">🔍 Voir →</span>`;
  } else {
   html+=`<button class="fig-buy-btn" data-figid="${fig.id}" style="margin:3px 0 0;padding:4px 10px;font-size:.63em;background:${fig.color};border-bottom:2px solid rgba(0,0,0,.3);border-radius:8px;">${fig.p} ⭐</button>`;
  }
  html+='</div>';
 });
 html+='</div>';
 const ownedCount=owned.length;
 html+=`<div style="font-size:.72em;color:rgba(255,255,255,.4);text-align:center;margin-top:8px;">${ownedCount}/${total} figurines collectées · ${list.length} affichées</div>`;
 $('p-figurines').innerHTML=html;
 // Event delegation for buy buttons — assigned once per render, no accumulation
 $('p-figurines').onclick=function(e){
  const btn=e.target.closest('.fig-buy-btn');
  if(btn){e.stopPropagation();buyFigurine(btn.dataset.figid);}
 };
 // Restore search focus if was searching
 if(_shopSearch){
  const si=$('shop-search-input');
  if(si){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
 }
}

function buyFigurine(id){
 if(!id)return;
 const fig=FIGURINES.find(f=>f&&f.id===id);
 if(!fig){console.warn('Figurine introuvable:',id);return;}
 const owned=P.ownedFigurines||[];
 if(owned.includes(id)){toast('Déjà dans ta collection !');return;}
 spend(fig.p,()=>{
  P.ownedFigurines=[...owned,id];
  toast(`🎉 ${fig.name} ajouté à ta collection !`,3000);
  beep(880,'sine',.4);
  setTimeout(()=>beep(1100,'sine',.3),180);
  renderFigurinesShop(_figFilter);
 });
}

// ── Collection (onglet dédié) ──────────────────────────
// ── State: collection view mode
let _colView='all'; // 'all','shelf','license'
function setColView(v){
 _colView=v;
 ['all','shelf','license'].forEach(k=>{
  const b=$('col-btn-'+k);if(b)b.classList.toggle('active',k===v);
  if(b&&k!==v)b.style.background='rgba(255,255,255,.1)';
  if(b&&k===v)b.style.background='';
 });
 renderFigCollection();
}

function _sortedFigs(list){
 const sort=$('col-sort')?.value||'default';
 const rarOrd={commun:0,rare:1,épique:2,légendaire:3,mythique:4};
 const copy=[...list];
 if(sort==='rarity') copy.sort((a,b)=>(rarOrd[b.r]||0)-(rarOrd[a.r]||0));
 else if(sort==='name') copy.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
 else if(sort==='price') copy.sort((a,b)=>b.p-a.p);
 return copy;
}

function _figShelfCard(fig, anim=false){
 const col=RARITY_COL[fig.r]||'#888';
 const portrait=CHAR_PORTRAITS[fig.id]||`<div style="font-size:1.8em;line-height:58px;text-align:center;">${fig.em||'❓'}</div>`;
 return `<div class="shelf-fig" data-r="${fig.r}" onclick="openFigViewer('${fig.id}')" title="${fig.name}">
  <div class="shelf-fig-img" style="border-color:${col}22;border-width:1.5px;border-style:solid;">${portrait}</div>
  <div class="shelf-fig-glow" style="background:${col};"></div>
  <div class="shelf-fig-base"></div>
  <div class="shelf-fig-name">${fig.name}</div>
  <div class="shelf-fig-rar" style="color:${col}">${RARITY_STARS[fig.r]}</div>
 </div>`;
}

const UNIVERS_LIST=[
 {k:'db',label:'Dragon Ball'},{k:'hp',label:'Harry Potter'},{k:'sw',label:'Star Wars'},
 {k:'nj',label:'Ninjago'},{k:'fr',label:'Reine des Neiges'},{k:'mk',label:'Mickey & Amis'},
 {k:'mv',label:'Marvel'},{k:'pk',label:'Pokémon'},{k:'mr',label:'Mario Bros'},{k:'br',label:'Barbie'},
 {k:'mc',label:'Cités d\'Or'},{k:'gd',label:'Goldorak'},{k:'cz',label:'Chevaliers du Zodiaque'},
 {k:'tm',label:'3 Mousquetaires'},{k:'bm',label:'Batman'},{k:'tn',label:'Tintin'},{k:'ax',label:'Astérix'},
 {k:'mi',label:'Miraculous'},{k:'pj',label:'Pyjamasques'},{k:'ot',label:'Olive & Tom'},
 {k:'co',label:'Cobra'},{k:'al',label:'Albator'},{k:'tu',label:'Tortues Ninja'},
 {k:'sm',label:'Sailor Moon'},{k:'sp',label:'Totally Spies'},{k:'bl',label:'Bluey'},{k:'dr',label:'Dragons'}
];

function renderFigCollection(){
 // Précharge les portraits si pas déjà fait. Re-rend une fois prêt.
 if(typeof loadPortraits==='function'&&!_portraitsLoaded){
  loadPortraits().then(()=>renderFigCollection());
 }
 const owned=P.ownedFigurines||[];
 const total=FIGURINES.length;
 $('fig-count-hdr').textContent=`${owned.length} / ${total} figurines collectées`;
 const el=$('p-col-figurines');
 if(owned.length===0){
  el.innerHTML='<div style="color:rgba(255,255,255,.4);font-size:.85em;text-align:center;padding:24px;line-height:2;">🔒 Aucune figurine encore...<br><span style="font-size:.85em;">Gagnez des étoiles ⭐ et achetez vos premières figurines dans la Boutique !</span></div>';
  return;
 }
 const owned_figs=FIGURINES.filter(f=>owned.includes(f.id));
 const sorted=_sortedFigs(owned_figs);

 if(_colView==='all'){
  // Grid compacte toutes figurines
  let html='<div style="display:flex;flex-wrap:wrap;gap:7px;padding:4px 0;">';
  sorted.forEach(fig=>{ html+=_figShelfCard(fig); });
  html+='</div>';
  el.innerHTML=html;
 }
 else if(_colView==='shelf'){
  // Étagères visuelles — 6 figurines par étagère
  let html='';
  const SHELF_SIZE=6;
  let all=[...sorted];
  let shelf=0;
  while(all.length>0){
   const row=all.splice(0,SHELF_SIZE);
   html+=`<div class="shelf-row" data-shelf="${shelf}">`;
   row.forEach(fig=>{ html+=_figShelfCard(fig); });
   // Remplir cases vides
   for(let i=row.length;i<SHELF_SIZE;i++) html+='<div class="shelf-empty"><div class="shelf-empty-box"></div></div>';
   html+='</div>';
   shelf++;
  }
  el.innerHTML=html;
 }
 else {
  // Par licence avec accordéon
  let html='';
  UNIVERS_LIST.forEach(({k,label},idx)=>{
   const uList=_sortedFigs(owned_figs.filter(f=>f.uk===k));
   if(!uList.length)return;
   const totalInLicense=FIGURINES.filter(f=>f.uk===k).length;
   const isOpen=uList.length>0; // open by default if has items
   html+=`<div class="shelf-section">
    <div class="shelf-header" onclick="toggleShelfSection('sl-${k}')">
     <span class="shelf-header-icon">${UNI_ICON[k]||'🎴'}</span>
     <span class="shelf-header-label">${label}</span>
     <span class="shelf-header-count">${uList.length}/${totalInLicense}</span>
     <span class="shelf-header-arrow open" id="arr-sl-${k}">▶</span>
    </div>
    <div class="shelf-panel open" id="sl-${k}">
     <div class="shelf-row" style="border-radius:0 0 0 0;">`;
   uList.forEach(fig=>{ html+=_figShelfCard(fig); });
   // Empty slots
   const empties=Math.min(3,Math.max(0,4-uList.length%4));
   for(let i=0;i<empties;i++) html+='<div class="shelf-empty"><div class="shelf-empty-box"></div></div>';
   html+=`</div></div></div>`;
  });
  el.innerHTML=html;
 }
}

function toggleShelfSection(id){
 const panel=$(id);if(!panel)return;
 const isOpen=panel.classList.contains('open');
 panel.classList.toggle('open',!isOpen);
 const arr=$('arr-'+id);if(arr)arr.classList.toggle('open',!isOpen);
}

// ── Viewer 3D ──────────────────────────────────────────
let _fvRotY=0,_fvSpeed=0.55,_fvAuto=true,_fvWasAuto=true,_fvRaf=null,_fvDrag=false,_fvDragX=0,_fvDragMoved=false,_fvResumeT=null;
let _fvCurrentId=null,_fvCurrentGc=null,_fvParentMode=false;
let _pfigFilter='all';

function openFigViewer(id,_pm){
 _fvParentMode=!!_pm;
 const fig=FIGURINES.find(f=>f.id===id);
 if(!fig)return;
 // Garantir que le sprite des portraits est bien chargé avant d'afficher.
 // Si déjà en cache, loadPortraits() résout immédiatement (aucune latence visible).
 if(typeof loadPortraits==='function'&&!_portraitsLoaded){
  loadPortraits().then(()=>_renderFigViewer(fig,id));
 }else{
  _renderFigViewer(fig,id);
 }
}
function _renderFigViewer(fig,id){
 _fvRotY=0;_fvAuto=true;_fvSpeed=0.55;
 // Fond dynamique selon univers
 const bgCols={db:'#3d1c00',hp:'#3d0000',sw:'#001040',nj:'#003d00',fr:'#001428',mk:'#0a0a0a',mv:'#0a0010',pk:'#0a0a00',mr:'#1a0000',br:'#1a0028'};
 $('fig-vbg').style.background=`radial-gradient(ellipse at 50% 110%,${fig.gc}44 0%,${bgCols[fig.uk]||'#000'} 55%,#000 100%)`;
 $('fig-pglow').style.background=fig.gc;
 $('fig-card3d').style.setProperty('--fglow',fig.gc);
 // En-tête
 $('fig-vuni').textContent=UNI_ICON[fig.uk]+' '+fig.uni;
 $('fig-vuni').className=`fig-unib u-${fig.uk}`;
 $('fig-vtitle').textContent=fig.name;
 // Face avant
 const portrait=CHAR_PORTRAITS[fig.id];
 $('fv-em2').textContent=''; // portrait SVG remplace l'emoji
 if(portrait){$('fv-chr').innerHTML=portrait;$('fv-chr').style.filter=`drop-shadow(0 0 18px ${fig.gc})`;_initFigArms(fig.id);}
 else{$('fv-chr').textContent=fig.em;$('fv-chr').style.filter=`drop-shadow(0 0 24px ${fig.gc}) drop-shadow(0 6px 12px rgba(0,0,0,.6))`;$('fv-chr').style.fontSize='5.6em';}
 $('fv-nm').textContent=fig.name;
 $('fv-nm').style.textShadow=`0 0 14px ${fig.gc}`;
 $('fv-rar').textContent=RARITY_STARS[fig.r]+' '+fig.r;
 $('fv-rar').style.cssText=`background:${RARITY_COL[fig.r]}33;color:${RARITY_COL[fig.r]};border:1px solid ${RARITY_COL[fig.r]};font-size:.62em;margin-top:6px;padding:3px 12px;border-radius:12px;font-weight:700;`;
 // Face arrière
 $('fv-buni').textContent=UNI_ICON[fig.uk]||''; // face arrière
 $('fv-bdesc').textContent=fig.desc;
 // Bouton état
 $('fig-spin-btn').textContent='⏸ Pause';
 // Générer les étoiles de fond
 _genFigStars();
 // Afficher
 $('fig-viewer').classList.remove('hidden');
 // Animation si figurine possédée
 if(_fvParentMode||(P.ownedFigurines||[]).includes(id)){setTimeout(()=>playFullFigAnim(id,fig.gc),80);}
 _fvCurrentId=id;_fvCurrentGc=fig.gc;
 const replayBtn=$('fig-replay-btn');
 if(replayBtn){replayBtn.style.display=((_fvParentMode||(P.ownedFigurines||[]).includes(id))?'inline-block':'none');}
 // RAF
 if(_fvRaf)cancelAnimationFrame(_fvRaf);
 _fvLoop();
 // Touche Escape pour fermer
 $('fig-viewer')._escHandler=e=>{if(e.key==='Escape')closeFigViewer();};
 document.addEventListener('keydown',$('fig-viewer')._escHandler);
}

function closeFigViewer(){
 $('fig-viewer').classList.add('hidden');
 if(_fvRaf){cancelAnimationFrame(_fvRaf);_fvRaf=null;}
 clearTimeout(_fvResumeT);
 if($('fig-viewer')._escHandler){
  document.removeEventListener('keydown',$('fig-viewer')._escHandler);
  delete $('fig-viewer')._escHandler;
 }
}

function _fvLoop(){
 if(_fvAuto)_fvRotY+=_fvSpeed;
 $('fig-card3d').style.transform=`rotateY(${_fvRotY}deg)`;
 _fvRaf=requestAnimationFrame(_fvLoop);
}

function figToggleSpin(){
 _fvAuto=!_fvAuto;
 $('fig-spin-btn').textContent=_fvAuto?'⏸ Pause':'▶ Auto';
}
function figClickToggle(){
 // Clic simple sur le personnage → toggle pause
 clearTimeout(_fvResumeT);
 _fvAuto=!_fvAuto;
 $('fig-spin-btn').textContent=_fvAuto?'⏸ Pause':'▶ Auto';
 beep(_fvAuto?440:330,'sine',.15);
}

function figReverseDir(){
 _fvSpeed=-_fvSpeed;
 beep(600,'sine',.2);
}

function _genFigStars(){
 const c=$('fig-vstars');c.innerHTML='';
 for(let i=0;i<70;i++){
  const s=document.createElement('div');
  s.className='fvs';
  const sz=Math.random()*2.5+.5;
  s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*5}s;--dl:${Math.random()*4}s;`;
  c.appendChild(s);
 }
}

// Drag / Touch pour rotation manuelle
function _fvDragStart(e){
 _fvDrag=true;
 _fvWasAuto=_fvAuto;
 _fvAuto=false;
 _fvDragMoved=false;
 clearTimeout(_fvResumeT);
 $('fig-spin-btn').textContent='▶ Auto';
 _fvDragX=e.touches?e.touches[0].clientX:e.clientX;
}
function _fvDragMove(e){
 if(!_fvDrag)return;
 const x=e.touches?e.touches[0].clientX:e.clientX;
 const dx=x-_fvDragX;
 if(Math.abs(dx)>3)_fvDragMoved=true;
 _fvRotY+=dx*0.55;
 _fvDragX=x;
}
function _fvDragEnd(){
 if(!_fvDrag)return;
 _fvDrag=false;
 if(!_fvDragMoved){
  // Clic simple sans mouvement → inverser la rotation
  _fvAuto=!_fvWasAuto;
  $('fig-spin-btn').textContent=_fvAuto?'⏸ Pause':'▶ Auto';
  clearTimeout(_fvResumeT);
  try{beep(_fvAuto?440:330,'sine',.15);}catch(e){}
  return;
 }
 // Après drag : reprendre si c'était actif
 if(_fvWasAuto){
  _fvResumeT=setTimeout(()=>{
   _fvAuto=true;
   $('fig-spin-btn').textContent='⏸ Pause';
  },2000);
 }
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION PERSONNAGE v5 — épaules calibrées + voix naturelles
// ═══════════════════════════════════════════════════════════════════════

// ── Positions d'épaules calibrées sur chaque SVG ──────────────────────
// [lx, ly, rx, ry]  (espace SVG viewBox 0 0 100 110)
const _SH={ br01:[26,76,74,76], br02:[30,78,70,78], br03:[32,78,68,78], br04:[36,80,64,80], br05:[24,72,76,72], db01:[35,88,65,88], db02:[32,82,68,82], db03:[33,78,67,78], db04:[22,80,78,80], db05:[30,85,70,85], db06:[30,85,70,85], db07:[18,88,82,88], db08:[28,84,72,84], db09:[38,85,62,85], db10:[38,82,62,82], db11:[36,83,64,83], db12:[38,90,62,90], fr01:[30,80,70,80], fr02:[26,82,74,82], fr03:[26,84,74,84], fr04:[26,82,74,82], fr05:[20,82,80,82], fr06:[20,78,80,78], fr07:[36,80,64,80], fr08:[22,80,78,80], hp01:[28,84,72,84], hp02:[28,84,72,84], hp03:[28,84,72,84], hp04:[22,78,78,78], hp05:[26,80,74,80], hp06:[38,79,62,79], hp07:[18,76,82,76], hp08:[28,84,72,84], hp09:[28,84,72,84], hp10:[32,72,68,72], hp11:[40,78,60,78], hp12:[26,80,74,80], mk01:[28,82,72,82], mk02:[24,82,76,82], mk03:[28,82,72,82], mk04:[26,82,74,82], mk05:[26,82,74,82], mk06:[18,82,82,82], mk07:[24,76,76,76], mk08:[24,76,76,76], mr01:[36,80,64,80], mr02:[36,80,64,80], mr03:[22,76,78,76], mr04:[20,76,80,76], mr05:[20,76,80,76], mr06:[30,82,70,82], mr07:[34,80,66,80], mv01:[38,80,62,80], mv02:[30,78,70,78], mv03:[26,82,74,82], mv04:[32,80,68,80], mv05:[18,78,82,78], mv06:[38,80,62,80], mv07:[26,78,74,78], mv08:[30,72,70,72], mv09:[26,82,74,82], mv10:[24,80,76,80], mv11:[22,78,78,78], mv12:[30,78,70,78], nj01:[28,84,72,84], nj02:[28,84,72,84], nj03:[28,84,72,84], nj04:[28,84,72,84], nj05:[28,84,72,84], nj06:[28,84,72,84], nj07:[32,78,68,78], nj08:[30,78,70,78], nj09:[24,78,76,78], nj10:[32,72,68,72], nj11:[28,78,72,78], nj12:[28,84,72,84], nj13:[32,78,68,78], pk01:[22,74,78,74], pk02:[20,78,80,78], pk03:[26,78,74,78], pk04:[20,76,80,76], pk05:[20,74,80,74], pk06:[24,76,76,76], pk07:[18,72,82,72], pk08:[6,74,94,74], pk09:[36,78,64,78], pk10:[26,84,74,84], sw01:[36,82,64,82], sw02:[22,80,78,80], sw03:[34,78,66,78], sw04:[38,82,62,82], sw05:[36,82,64,82], sw06:[34,78,66,78], sw07:[26,84,74,84], sw08:[26,84,74,84], sw09:[34,82,66,82], sw10:[32,78,68,78], sw11:[30,78,70,78], sw12:[28,74,72,74], sw13:[32,78,68,78],mc01:[34,80,66,80], mc02:[28,82,72,82], mc03:[28,82,72,82], mc04:[26,82,74,82], mc05:[26,82,74,82], mc06:[30,82,70,82], mc07:[28,82,72,82], mc08:[18,80,82,80], gd01:[28,82,72,82], gd02:[28,82,72,82], gd03:[24,82,76,82], gd04:[28,82,72,82], gd05:[14,74,86,74], gd06:[22,78,78,78], gd07:[18,78,82,78], gd08:[18,78,82,78], gd09:[28,82,72,82], gd10:[16,80,84,80], gd11:[16,78,84,78], cz01:[18,80,82,80], cz02:[18,80,82,80], cz03:[18,80,82,80], cz04:[18,80,82,80], cz05:[18,80,82,80], cz06:[18,80,82,80], cz07:[16,80,84,80], cz08:[10,78,90,78], cz09:[16,80,84,80], cz10:[16,80,84,80], cz11:[16,80,84,80], cz12:[16,80,84,80], cz13:[16,80,84,80], cz14:[16,80,84,80],tm01:[22,82,78,82], tm02:[20,82,80,82], tm03:[14,80,86,80], tm04:[24,82,76,82], tm05:[18,80,82,80], tm06:[20,80,80,80], tm07:[26,82,74,82], tm08:[24,82,76,82], tm09:[16,80,84,80], bm01:[16,78,84,78], bm02:[24,82,76,82], bm03:[22,82,78,82], bm04:[24,80,76,80], bm05:[26,82,74,82], bm06:[22,82,78,82], bm07:[20,80,80,80], bm08:[26,82,74,82], tn01:[26,82,74,82], tn02:[22,82,78,82], tn03:[22,82,78,82], tn04:[26,82,74,82], tn05:[24,82,76,82], tn06:[18,80,82,80], ax01:[30,82,70,82], ax02:[14,80,86,80], ax03:[26,82,74,82], ax04:[20,80,80,80], ax05:[26,82,74,82], ax06:[20,80,80,80], ax07:[22,82,78,82],mi01:[24,80,76,80], mi02:[24,80,76,80], mi03:[22,80,78,80], mi04:[28,82,72,82], mi05:[26,80,74,80], mi06:[26,80,74,80], pj01:[20,80,80,80], pj02:[20,80,80,80], pj03:[18,80,82,80], pj04:[28,82,72,82], pj05:[30,82,70,82], pj06:[14,80,86,80], pj07:[22,82,78,82], ot01:[24,82,76,82], ot02:[22,82,78,82], ot03:[24,82,76,82], ot04:[24,82,76,82], ot05:[14,80,86,80], ot06:[24,82,76,82], ot07:[24,82,76,82], ot08:[26,82,74,82], ot09:[26,82,74,82], ot10:[24,82,76,82], co01:[22,82,78,82], co02:[22,80,78,80], co03:[28,82,72,82], co04:[20,78,80,78], al01:[16,80,84,80], al02:[22,82,78,82], al03:[28,82,72,82], al04:[24,82,76,82], al05:[28,82,72,82], al06:[10,88,90,88],tu01:[20,80,80,80], tu02:[20,80,80,80], tu03:[20,80,80,80], tu04:[20,80,80,80], tu05:[18,80,82,80], tu06:[26,82,74,82], tu07:[16,74,84,74], sm01:[20,80,80,80], sm02:[20,80,80,80], sm03:[20,80,80,80], sm04:[26,82,74,82], sm05:[20,80,80,80], sp01:[24,82,76,82], sp02:[24,82,76,82], sp03:[24,82,76,82], sp04:[28,82,72,82], sp05:[28,82,72,82], bl01:[22,82,78,82], bl02:[22,82,78,82], bl03:[18,80,82,80], bl04:[22,82,78,82], bl05:[22,82,78,82], bl06:[22,82,78,82], dr01:[22,82,78,82], dr02:[12,80,88,80], dr03:[22,82,78,82], dr04:[12,78,88,78], dr05:[24,82,76,82], dr06:[12,80,88,80], dr07:[12,80,88,80], dr08:[14,80,86,80], dr09:[24,82,76,82], dr10:[12,80,88,80], dr11:[14,80,86,80], dr12:[14,80,86,80], dr13:[12,80,88,80]};
function _sh(id){return _SH[id]||[36,73,64,73];}

// ── SÉQUENCES DE BRAS — relatives aux épaules ─────────────────────────
// Format: [t, dLex,dLey,dLhx,dLhy,  dRex,dRey,dRhx,dRhy]
// d = delta depuis l'épaule (SVG units)
// Coude ≈ 11 units depuis épaule, Main ≈ 11 units depuis coude
// Bras au repos : elbow (-7,+10), hand (-10,+20)
const _SEQ={
 rest:[[0, -8,8,-7,16,  8,8,12,16]],

 kame:[  // Charge droite → blast gauche
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.20,  5, 8, 14,14,  3, 8, 12,14],  // mains se groupent
  [0.40,  6, 9, 15,16,  4, 9, 13,16],  // appui charge
  [0.58, -5, 5,-9, 8, -7, 5,-9, 8],  // extension gauche
  [1.00,-7, 4,-14, 5,-7, 4,-14, 5],  // blast complet
 ],
 gallic:[ // Bras montent en V vers le ciel
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.30, -5, 4, -8,-4,   5, 4,  8,-6],
  [0.60, -4,-1, -7,-9,  4,-1,  7,-14],
  [1.00, -3,-3, -6,-11,  3,-3,  6,-18],
 ],
 beam:[  // Doigt droit pointé vers l'avant
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.30, -7,10,-6,20,  9, 4, 16,-4],
  [1.00, -7,10,-6,20, 10, 3, 18,-5],
 ],
 aura:[  // Bras légèrement écartés, paume ouverte
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40,-6,10,-9,21,  10,10,14,21],
  [0.70,-6, 9,-9,20,  10, 9,14,20],
  [1.00,-6,10,-9,21,  10,10,14,21],
 ],
 wand:[  // Bras droit lève la baguette
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.22, -7,10,-6,20,  8, 4, 11,-4],
  [0.48, -7,10,-6,20,  8,-1, 10,-11],
  [0.75, -7,10,-6,20,  7,-2,  9,-15],
  [1.00, -7,10,-6,20,  7,-4,  8,-17],
 ],
 saber:[ // Bras gauche lève le sabre
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.22, -8, 4,-6,-6,  7,10,10,20],
  [0.48, -8,-1, -9,-8, 7,10,10,20],
  [0.72, -6, 6, 0, 2,   7,10,10,20],  // swing
  [1.00, -2,10, 5, 4,   7,10,10,20],
 ],
 force:[ // Main gauche levée, projection Force
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.35, -8, 4,-7, -6, 7,10,10,20],
  [0.65, -9,-1,-12,-7, 7,10,10,20],
  [1.00,-6,-5,-8,-17, 7,10,10,20],
 ],
 blast:[ // Bras gauche tendu, viseur
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.35, -3, 6,  5, 1,  7,10,10,20],
  [1.00, -2, 5,  7, 0,  7,10,10,20],
 ],
 scream:[// Bras grands ouverts, cri
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.35,-7, 6,-11,-2, 12, 6,18,-2],
  [0.70,-9, 3,-13,-7, 14, 3,21,-7],
  [1.00,-9, 3,-13,-7, 14, 3,21,-7],
 ],
 roar:[ // Bras grands ouverts, roar
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40,-8, 5,-12,-3, 13, 5,19,-3],
  [1.00,-9, 2,-14,-8, 15, 2,22,-8],
 ],
 spin:[ // Rotation Spinjitzu
  [0.00,-7, 6,-11,-2, 12, 6,18,-2],
  [0.25, -4, 9,-1, 18,  4, 9,10, 9],
  [0.50, 10, 5,14,-2,  -5, 7,-5,14],
  [0.75, -5, 3,-5, 14, 10, 5,14,-4],
  [1.00,-7, 6,-11,-2, 12, 6,18,-2],
 ],
 ice:[  // Deux bras tendus vers l'avant, mains ouvertes
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.32, -4, 5,  0,-2,  4, 5, 0,-4],
  [0.65, -3, 2,  2,-5,  3, 2,-1,-8],
  [1.00, -2, 1,  3,-6, 2, 1,-2,-10],
 ],
 heart:[ // Mains qui se rejoignent au centre
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.32, -2, 7,  4, 1,  2, 7,-2, 1],
  [0.65,  1, 4,  6,-2, -1, 4,-4,-4],
  [1.00,  2, 2,  7,-4, -2, 2,-4,-7],
 ],
 web:[  // Bras droit tendu, poignet tourné
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.25, -7,10,-6,20,  9, 5, 17,-3],
  [0.55, -7,10,-6,20, 10, 2, 19,-8],
  [1.00, -7,10,-6,20, 11,-1, 21,-12],
 ],
 repulsor:[ // Bras gauche tendu, paume avant
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.32, -2, 6,  6, 0,  7,10,10,20],
  [0.65, -1, 4,  8,-2,  7,10,10,20],
  [1.00,  0, 3, 10,-3,  7,10,10,20],
 ],
 shield:[ // Bouclier sur bras gauche, lancer
  [0.00, -8, 5,-7,-5,  7,10,10,20],
  [0.22,-6, 2,-9,-9,  7,10,10,20],
  [0.50, -5, 7, 2, 2,   7,10,10,20],
  [0.80, -3, 9, 5, 5,   7,10,10,20],
  [1.00, -2,10, 6, 6,   7,10,10,20],
 ],
 slash:[ // Griffes ou épée bras gauche, slash
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.22, -9, 3,-7,-7,  7,10,10,20],
  [0.50,-6,-2,-8,-13, 7,10,10,20],
  [0.75, -4, 7, 3, 4,   7,10,10,20],
  [1.00,  0,10, 7, 7,   7,10,10,20],
 ],
 portal:[ // Mains tracent un portail circulaire
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.28, -3, 5,  3,-1,  3, 5,-2,-2],
  [0.55, -1, 2,  5,-4, -1, 2,-3,-7],
  [0.80,  1,-1,  7,-6,-1,-1,-7,-10],
  [1.00, -1, 1,  5,-5,  1, 1,-3,-8],
 ],
 gauntlet:[ // Poing gauche levé, gemmes
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.30, -2, 6,  5, 0,  7,10,10,20],
  [0.62, -1, 3,  7,-2,  7,10,10,20],
  [1.00,  0, 1,  8,-4,  7,10,10,20],
 ],
 vanish:[ // Bras qui s'écartent doucement
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.50,-6,11,-9,22,  10,11,14,22],
  [1.00,-7,12,-9,23,  11,12,15,23],
 ],
 jump:[  // Bras levés, saut
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.30,-6, 4,-9,-5, 10, 4,14,-5],
  [0.60,-7, 0,-9,-10,11, 0,15,-10],
  [1.00, -9, 5,-7,-4,  9, 5,12,-4],
 ],
 bounce:[ // Bras qui s'agitent en joie
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.32,-7, 9,-9,19, 11, 9,15,19],
  [0.65,-7, 7,-9,17, 11, 7,15,17],
  [1.00,-7, 9,-9,19, 11, 9,15,19],
 ],
 wave:[  // Un bras salue, l'autre reste
  [0.00,-6, 3,-9,-7,  7,10,10,20],
  [0.33, -7,10,-6,20, -9, 3,-8,-7],
  [0.66,-6, 3,-9,-7,  7,10,10,20],
  [1.00, -7,10,-6,20, -9, 3,-8,-7],
 ],
 fire:[  // Bras légèrement en arrière, souffle
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40, -9,11,-7,21,  9,11,12,21],
  [1.00, -9,11,-7,21,  9,11,12,21],
 ],
 vine:[  // Bras gauche projette une liane
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.50,-6, 5,-9,-5,  7,10,10,20],
  [1.00,-7, 1,-10,-10, 7,10,10,20],
 ],
 water:[ // Bras gauche projette un jet d'eau
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40, -3, 6,  3, 0,  7,10,10,20],
  [1.00, -2, 4,  5,-2,  7,10,10,20],
 ],
 cannon:[ // Bras gauche se transforme en canon
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40, -2, 6,  5, 0,  7,10,10,20],
  [1.00, -1, 4,  7,-2,  7,10,10,20],
 ],
 tea:[   // Bras droit porte une tasse
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.40, -7,10,-6,20,  6, 5,  9,-2],
  [1.00, -7,10,-6,20,  5, 4,  8,-4],
 ],
 disc:[  // Disque Kienzan bras gauche levé
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.22, -9, 3,-7,-7,  7,10,10,20],
  [0.44,-6,-2,-8,-13, 7,10,10,20],
  [0.68, -4, 7, 3, 4,   7,10,10,20],
  [1.00,  1,10, 8, 6,   7,10,10,20],
 ],
 thunder:[ // Bras gauche levé vers le ciel
  [0.00, -7,10,-6,20,  7,10,10,20],
  [0.28, -8, 3,-6,-7,  7,10,10,20],
  [0.56, -8,-1, -9,-9, 7,10,10,20],
  [1.00, -8,-3, -9,-11, 7,10,10,20],
 ],
 none:[[0,-4,10,-6,20, 7,10,10,20],[1,-4,10,-6,20, 7,10,10,20]],
};

// ── DONNÉES PERSONNAGES ────────────────────────────────────────────────
// p=pitch (0.8-1.3 naturel), r=rate (0.7=lent/menaçant, 1.5=rapide/excité)
// g=genre, sk=peau, sp=son synthétique
// La clé de naturalité : utiliser le rate pour l'émotion, pitch modéré
const FIG_CHAR_DATA={
 // Dragon Ball — attaques = rapide+fort, normal = grave+lent
 db01:{fn:'kame',    col:'#3af',v:"Kamé... a-méa !", p:1.1,r:1.45,g:'m',sk:'#f5cba7'},
 db02:{fn:'gallic',  col:'#a0f',v:"Gallik-Ganne !",    p:0.88,r:1.2,g:'m',sk:'#f5cba7'},
 db03:{fn:'scream',  col:'#fff',v:"C'est fini !",    p:1.12,r:1.35,g:'m',sk:'#f5cba7'},
 db04:{fn:'beam',    col:'#0f0',v:"Makanko-sappô !",    p:0.82,r:0.9, g:'m',sk:'#4a8a4a'},
 db05:{fn:'beam',    col:'#f00',v:"Rayon de la mort.", p:0.78,r:0.82,g:'m',sk:'#f5cba7'},
 db06:{fn:'aura',    col:'#0ff',v:"Je suis... parfait.",p:1.0,r:0.88,g:'m',sk:'#c0e8c0'},
 db07:{fn:'roar',    col:'#f6f',v:"Bou va l'écraser !", p:1.05,r:1.1, g:'m',sk:'#f0b0c0'},
 db08:{fn:'slash',   col:'#fc0',v:"Mon épée !",        p:1.0, r:1.3, g:'m',sk:'#f5cba7'},
 db09:{fn:'disc',    col:'#ff0',v:"Ki-ennzane !",         p:1.05,r:1.3, g:'m',sk:'#f5cba7'},
 db10:{fn:'cannon',  col:'#08f',v:"À l'attaque !",     p:1.05,r:1.15,g:'f',sk:'#f5cba7'},
 db11:{fn:'scream',  col:'#fa0',v:"Kakarotte !",       p:0.82,r:0.88,g:'m',sk:'#f0c080'},
 db12:{fn:'aura',    col:'#ddf',v:"Ultra... Instinn.",   p:1.0, r:0.82,g:'m',sk:'#f5cba7'},
 // Harry Potter — sorts = autorité calme ou urgence
 hp01:{fn:'wand',    col:'#f44',v:"Expèl-yar-mousse !",    p:1.08,r:1.2, g:'m',sk:'#fde3bb'},
 hp02:{fn:'wand',    col:'#af6',v:"Vinn-gardioum... Lévi-oza !",p:1.1,r:0.92,g:'f',sk:'#fde3bb'},
 hp03:{fn:'wand',    col:'#ff6',v:"Riddicoulouss !",      p:1.1, r:1.15,g:'m',sk:'#fde3bb'},
 hp04:{fn:'wand',    col:'#f80',v:"Incèn-dio !",        p:0.9, r:1.1, g:'m',sk:'#fde3bb'},
 hp05:{fn:'wand',    col:'#0f0',v:"Avada... Kédavra.",    p:0.78,r:0.72,g:'m',sk:'#f0e0e0'},
 hp06:{fn:'wand',    col:'#808',v:"Sèktum-sèmpra.",     p:0.75,r:0.78,g:'m',sk:'#f5cba7'},
 hp07:{fn:'wand',    col:'#adf',v:"Expèkto... Patr-onum !", p:1.05,r:0.95,g:'m',sk:'#fde3bb'},
 hp08:{fn:'wand',    col:'#900',v:"Tu le regretteras.",p:0.9, r:0.85,g:'f',sk:'#f5cba7'},
 hp09:{fn:'wand',    col:'#88f',v:"Lou-môs.",            p:1.0, r:0.88,g:'m',sk:'#fde3bb'},
 hp10:{fn:'jump',    col:'#ff0',v:"Dobi est libre !",  p:1.2, r:1.15,g:'m',sk:'#e0d0b0'},
 hp11:{fn:'wand',    col:'#4af',v:"Alo-omora !",       p:1.05,r:1.05,g:'f',sk:'#fde3bb'},
 hp12:{fn:'wand',    col:'#0f0',v:"Krouci-at-eusse.",        p:0.72,r:0.75,g:'f',sk:'#f5cba7'},
 // Star Wars — grave et posé pour héros, menaçant pour vilains
 sw01:{fn:'saber',   col:'#38f',v:"Que la Force soit avec toi.",p:1.0,r:0.88,g:'m',sk:'#fde3bb'},
 sw02:{fn:'saber',   col:'#f22',v:"Je... suis... ton père.",p:0.82,r:0.7, g:'m',sk:'#1a1a1a',sp:'vader'},
 sw03:{fn:'force',   col:'#6f6',v:"Puissant... tu es.",   p:0.85,r:0.65,g:'m',sk:'#80b060'},
 sw04:{fn:'saber',   col:'#38f',v:"Ensemble on peut !", p:1.08,r:1.05,g:'f',sk:'#fde3bb'},
 sw05:{fn:'blast',   col:'#fa0',v:"En avant Tchoui !",  p:1.0, r:1.1, g:'m',sk:'#fde3bb'},
 sw06:{fn:'saber',   col:'#0f0',v:"Que la Force guide.",p:0.95,r:0.88,g:'f',sk:'#fde3bb'},
 sw07:{fn:'none',    col:'#4cf',v:'',p:1,r:1,g:'n',sk:'#d4a017',sp:'r2d2'},
 sw08:{fn:'wave',    col:'#fa0',v:"Nous sommes condamnés.",p:0.95,r:1.0,g:'m',sk:'#d4a017'},
 sw09:{fn:'roar',    col:'#a60',v:'',p:1,r:1,g:'n',sk:'#a07040',sp:'chewie'},
 sw10:{fn:'blast',   col:'#888',v:"C'est la Voie.",    p:0.88,r:0.78,g:'m',sk:'#808070'},
 sw11:{fn:'saber',   col:'#f22',v:"Votre Force est dérisoire.",p:0.8,r:0.82,g:'m',sk:'#fde3bb'},
 sw12:{fn:'roar',    col:'#840',v:"Rrrgh !",           p:0.78,r:1.0, g:'m',sk:'#a07040'},
 sw13:{fn:'blast',   col:'#888',v:"À moi la prime !",   p:0.95,r:1.05,g:'m',sk:'#808070'},
 // Ninjago — énergie, combat, maîtrise
 nj01:{fn:'spin',    col:'#0f0',v:"Spinn-jit-sou !",        p:1.1, r:1.35,g:'m',sk:'#fde3bb'},
 nj02:{fn:'spin',    col:'#f60',v:"Puissance du feu !", p:1.08,r:1.3, g:'m',sk:'#fde3bb'},
 nj03:{fn:'spin',    col:'#aff',v:"Glace !",            p:1.05,r:1.25,g:'m',sk:'#c8e8ff'},
 nj04:{fn:'spin',    col:'#840',v:"Force de la terre !", p:0.92,r:1.1,g:'m',sk:'#a08060'},
 nj05:{fn:'spin',    col:'#ff0',v:"Éclair !",           p:1.12,r:1.4, g:'m',sk:'#fde3bb'},
 nj06:{fn:'spin',    col:'#08f',v:"Vague océanique !",  p:1.08,r:1.2, g:'f',sk:'#fde3bb'},
 nj07:{fn:'tea',     col:'#fc0',v:"Le thé résout tout.", p:0.88,r:0.72,g:'m',sk:'#f0c080'},
 nj08:{fn:'roar',    col:'#808',v:"Personne ne peut me vaincre !",p:0.82,r:0.9,g:'m',sk:'#4040a0'},
 nj09:{fn:'cannon',  col:'#f80',v:"Quatre bras, double force !",p:0.85,r:1.0,g:'m',sk:'#8060c0'},
 nj10:{fn:'vanish',  col:'#408',v:"Je... disparais.",   p:0.88,r:0.78,g:'m',sk:'#404040'},
 nj11:{fn:'spin',    col:'#dfd',v:"Le vent souffle fort.",p:1.0,r:0.98,g:'f',sk:'#fde3bb'},
 nj12:{fn:'aura',    col:'#f08',v:"Je copie vos pouvoirs !",p:1.1,r:1.05,g:'f',sk:'#fde3bb'},
 nj13:{fn:'slash',   col:'#888',v:"La paix a un prix.", p:0.9, r:0.82,g:'m',sk:'#fde3bb'},
 // Frozen — lyrique, émotionnel
 fr01:{fn:'ice',     col:'#aef',v:"Libérée, délivrée !", p:1.12,r:0.95,g:'f',sk:'#fde3bb'},
 fr02:{fn:'heart',   col:'#f8c',v:"L'amour est la clé.", p:1.05,r:0.92,g:'f',sk:'#fde3bb'},
 fr03:{fn:'bounce',  col:'#fc0',v:"Certains aiment l'été !", p:1.15,r:1.05,g:'f',sk:'#fde3bb'},
 fr04:{fn:'wave',    col:'#fa0',v:"En avant, Svène !",   p:1.0, r:1.05,g:'m',sk:'#fde3bb'},
 fr05:{fn:'bounce',  col:'#ada',v:"Meuuh !",            p:0.98,r:1.1, g:'m',sk:'#c8a870'},
 fr06:{fn:'roar',    col:'#640',v:"Graaah !",           p:0.78,r:1.0, g:'m',sk:'#905030'},
 fr07:{fn:'ice',     col:'#88f',v:"L'hiver éternel commence.",p:0.88,r:0.82,g:'f',sk:'#c0d0ff'},
 fr08:{fn:'aura',    col:'#aae',v:"Hiver, renonce.",    p:0.85,r:0.85,g:'f',sk:'#fde3bb'},
 // Mickey — jovial, enfantin
 mk01:{fn:'bounce',  col:'#f00',v:"Oh boy !",           p:1.18,r:1.15,g:'m',sk:'#f5cba7'},
 mk02:{fn:'heart',   col:'#f8c',v:"Yoouhou !",           p:1.2, r:1.1, g:'f',sk:'#fde3bb'},
 mk03:{fn:'wave',    col:'#ff0',v:"Sacré blagueur !",   p:1.0, r:1.15,g:'m',sk:'#f5cba7'},
 mk04:{fn:'heart',   col:'#f8c',v:"Dar-ling !",          p:1.15,r:1.05,g:'f',sk:'#fde3bb'},
 mk05:{fn:'bounce',  col:'#fc0',v:"A-iouke !",          p:0.95,r:0.95,g:'m',sk:'#f5cba7'},
 mk06:{fn:'bounce',  col:'#a60',v:"Ouaf ouaf !",        p:1.2, r:1.2, g:'m',sk:'#a06030'},
 mk07:{fn:'spin',    col:'#840',v:"C'est ma noisette !",p:1.1, r:1.18,g:'m',sk:'#906030'},
 mk08:{fn:'roar',    col:'#840',v:"Miens ! Miens ! Miens !",p:1.08,r:1.12,g:'m',sk:'#906030'},
 // Marvel — héroïque, puissant
 mv01:{fn:'web',     col:'#f44',v:"Avec grand pouvoir vient grande responsabilité.",p:1.05,r:0.92,g:'m',sk:'#f0b090'},
 mv02:{fn:'repulsor',col:'#fc0',v:"Je suis Aïronne Mane.",  p:1.0, r:0.9, g:'m',sk:'#c00808'},
 mv03:{fn:'shield',  col:'#38f',v:"Avènn-djeurze, en avant !", p:1.05,r:1.05,g:'m',sk:'#fde3bb'},
 mv04:{fn:'thunder', col:'#ff8',v:"Par Odine !",          p:0.98,r:1.15,g:'m',sk:'#fde3bb'},
 mv05:{fn:'roar',    col:'#0a0',v:"Alk écraser.",       p:0.82,r:1.0, g:'m',sk:'#40a040',sp:'hulk'},
 mv06:{fn:'web',     col:'#f4f',v:"Tu ne m'attraperas pas !",p:1.1,r:1.15,g:'f',sk:'#f0b090'},
 mv07:{fn:'gauntlet',col:'#f80',v:"In-né-vitable.",         p:0.82,r:0.7, g:'m',sk:'#8060a0'},
 mv08:{fn:'shield',  col:'#8af',v:"Wakanda... Forèveur !",   p:0.95,r:0.95,g:'m',sk:'#604030'},
 mv09:{fn:'slash',   col:'#ff0',v:"Je suis le meilleur dans ce que je fais.",p:0.88,r:0.85,g:'m',sk:'#f5cba7'},
 mv10:{fn:'portal',  col:'#f80',v:"Par les Vi-chan-ti !",  p:1.0, r:0.98,g:'m',sk:'#f0c080'},
 mv11:{fn:'wand',    col:'#c00',v:"Tout est réel.",      p:1.02,r:0.88,g:'f',sk:'#fde3bb'},
 mv12:{fn:'vanish',  col:'#0a0',v:"Je suis Loki. Je fais ce qu'il me plaît.",p:1.0,r:0.88,g:'m',sk:'#f0e8c0'},
 // Pokémon — animaux, cris caractéristiques
 pk01:{fn:'thunder', col:'#ff0',v:"Pika pika !",         p:1.3, r:1.3, g:'f',sk:'#f0c030',sp:'pika'},
 pk02:{fn:'fire',    col:'#f60',v:"Dracouu !",          p:0.88,r:1.05,g:'m',sk:'#e06020'},
 pk03:{fn:'aura',    col:'#f8f',v:"Mioutou.",             p:0.82,r:0.72,g:'m',sk:'#c0a0c0'},
 pk04:{fn:'vine',    col:'#0a0',v:"Bulbi bulbi !",       p:1.12,r:1.05,g:'m',sk:'#60a040'},
 pk05:{fn:'water',   col:'#08f',v:"Carapuce cara !",     p:1.15,r:1.1, g:'m',sk:'#4080a0'},
 pk06:{fn:'bounce',  col:'#fa0',v:"Évoli !",             p:1.25,r:1.1, g:'f',sk:'#d09040'},
 pk07:{fn:'vanish',  col:'#8f8',v:"Ecto ecto.",          p:1.0, r:0.88,g:'m',sk:'#90c090'},
 pk08:{fn:'bounce',  col:'#aaf',v:"Zzz...",              p:0.85,r:0.6, g:'m',sk:'#c0b870'},
 pk09:{fn:'aura',    col:'#48f',v:"Aura-sfèr !",       p:1.0, r:1.05,g:'m',sk:'#6080c0'},
 pk10:{fn:'roar',    col:'#0f0',v:"Rèk-ouaza !",          p:0.78,r:0.88,g:'m',sk:'#208020'},
 // Mario — vivant, enthousiaste
 mr01:{fn:'jump',    col:'#f44',v:"C'est moi, Mario !",  p:1.12,r:1.05,g:'m',sk:'#f5cba7'},
 mr02:{fn:'bounce',  col:'#0a0',v:"Mamma mia !",         p:1.08,r:0.95,g:'m',sk:'#f5cba7'},
 mr03:{fn:'heart',   col:'#f8c',v:"Merci, Mario !",      p:1.1, r:0.95,g:'f',sk:'#fde3bb'},
 mr04:{fn:'roar',    col:'#840',v:"Vous n'avez aucune chance contre moi.",p:0.82,r:0.85,g:'m',sk:'#c06020'},
 mr05:{fn:'bounce',  col:'#0f0',v:"Yoshi !",             p:1.25,r:1.2, g:'m',sk:'#40a040'},
 mr06:{fn:'bounce',  col:'#f00',v:"Toad !",              p:1.3, r:1.15,g:'m',sk:'#f5cba7'},
 mr07:{fn:'roar',    col:'#ff0',v:"Wahaha, l'argent est à moi !",p:0.88,r:1.05,g:'m',sk:'#c0a060'},
 // Barbie — positif, féminin
 br01:{fn:'heart',   col:'#f6a',v:"Tout est possible !",  p:1.1, r:1.0, g:'f',sk:'#fde3bb'},
 br02:{fn:'jump',    col:'#acf',v:"Cap sur les étoiles !",p:1.12,r:0.98,g:'f',sk:'#fde3bb'},
 br03:{fn:'bounce',  col:'#0c0',v:"La santé avant tout !", p:1.05,r:0.98,g:'f',sk:'#fde3bb'},
 br04:{fn:'wave',    col:'#f80',v:"Je suis juste Kène.",   p:1.0, r:0.95,g:'m',sk:'#fde3bb'},
 br05:{fn:'water',   col:'#08f',v:"Vive l'océan !",       p:1.08,r:1.0, g:'f',sk:'#fde3bb'},
// ── NOUVELLES LICENCES
mc01:{fn:'jump',    col:'#f1c40f',v:'Le soleil va briller !',    p:1.12,r:1.2, g:'m',sk:'#fde3bb'},
 mc02:{fn:'aura',    col:'#e74c3c',v:'Les cités nous attendent !',p:1.08,r:1.0, g:'f',sk:'#d4956a'},
 mc03:{fn:'wand',    col:'#3498db',v:'Je connais le chemin.',     p:0.95,r:0.88,g:'m',sk:'#e8c88a'},
 mc04:{fn:'slash',   col:'#7f8c8d',v:'À l\'or, toujours à l\'or !', p:0.92,r:1.0, g:'m',sk:'#d4956a'},
 mc05:{fn:'bounce',  col:'#e74c3c',v:'Ahi ahi ahi !',             p:1.1, r:1.15,g:'m',sk:'#e8c88a'},
 mc06:{fn:'bounce',  col:'#2980b9',v:'Pedro, attends-moi !',      p:1.08,r:1.1, g:'m',sk:'#e8c88a'},
 mc07:{fn:'wand',    col:'#8e44ad',v:'Le secret des anciens...',  p:0.88,r:0.75,g:'m',sk:'#fde3bb'},
 mc08:{fn:'vanish',  col:'#9b59b6',v:'Vous ne m\'arrêterez pas.', p:0.82,r:0.8, g:'m',sk:'#d4a070'},
 gd01:{fn:'thunder', col:'#f1c40f',v:'Goldorak, alerte !',        p:1.0, r:1.1, g:'m',sk:'#fde3bb'},
 gd02:{fn:'repulsor',col:'#27ae60',v:'Je suis avec toi, Actarus !',p:1.05,r:1.05,g:'m',sk:'#fde3bb'},
 gd03:{fn:'heart',   col:'#e91e8c',v:'Actarus, sois prudent !',   p:1.1, r:1.0, g:'f',sk:'#fde3bb'},
 gd04:{fn:'beam',    col:'#74b9ff',v:'Les données sont claires.', p:1.0, r:0.9, g:'f',sk:'#fde3bb'},
 gd05:{fn:'scream',  col:'#e74c3c',v:'Détruisez la Terre !',      p:0.75,r:0.7, g:'m',sk:'#0a0808'},
 gd06:{fn:'roar',    col:'#27ae60',v:'Mecaboïde, attaquez !',     p:0.82,r:0.88,g:'m',sk:'#2a5a2a'},
 gd07:{fn:'aura',    col:'#74b9ff',v:'',                          p:1.0, r:1.0, g:'n',sk:'#2980b9',sp:'robot_gd'},
 gd08:{fn:'aura',    col:'#e74c3c',v:'',                          p:1.0, r:1.0, g:'n',sk:'#c0392b',sp:'robot_gd'},
 gd09:{fn:'slash',   col:'#e67e22',v:'Goldorak ne m\'échappera pas !',p:0.88,r:1.0,g:'m',sk:'#c8a070'},
 gd10:{fn:'thunder', col:'#f1c40f',v:'Double Harken !',           p:0.88,r:0.88,g:'m',sk:'#2980b9',sp:'goldorak'},
 gd11:{fn:'spin',    col:'#9b59b6',v:'Goldorak, décolle !',       p:1.0, r:1.05,g:'m',sk:'#2980b9',sp:'goldorak'},
 cz01:{fn:'kame',    col:'#74b9ff',v:'Meteore de Pégase !',       p:1.08,r:1.25,g:'m',sk:'#fde3bb'},
 cz02:{fn:'thunder', col:'#3498db',v:'Rozan Sho Ryu Ha !',        p:0.92,r:1.1, g:'m',sk:'#fde3bb'},
 cz03:{fn:'ice',     col:'#74b9ff',v:'Diamond Dust !',            p:1.0, r:1.0, g:'m',sk:'#fde3bb'},
 cz04:{fn:'vine',    col:'#e91e8c',v:'Nebula Chain !',            p:1.05,r:1.0, g:'m',sk:'#fde3bb'},
 cz05:{fn:'roar',    col:'#9b59b6',v:'Griffe Illusion !',         p:0.85,r:1.0, g:'m',sk:'#fde3bb'},
 cz06:{fn:'aura',    col:'#f1c40f',v:'Athéna Exclamation !',      p:1.0, r:0.88,g:'f',sk:'#fde3bb'},
 cz07:{fn:'portal',  col:'#ff69b4',v:'Stardust Revolution !',     p:0.95,r:0.95,g:'m',sk:'#fde3bb'},
 cz08:{fn:'scream',  col:'#e74c3c',v:'Grand Horn !',              p:0.8, r:0.88,g:'m',sk:'#fde3bb'},
 cz09:{fn:'thunder', col:'#f1c40f',v:'Lightning Plasma !',        p:1.05,r:1.15,g:'m',sk:'#fde3bb'},
 cz10:{fn:'beam',    col:'#f39c12',v:'Flèches d\'Or du Sagittaire !',p:1.0,r:1.05,g:'m',sk:'#fde3bb'},
 cz11:{fn:'aura',    col:'#ecf0f1',v:'Ton âme ne vibre plus... Tennyo Horin.',p:0.85,r:0.7,g:'m',sk:'#fde3bb'},
 cz12:{fn:'gauntlet',col:'#3498db',v:'Galaxian Explosion !',      p:0.88,r:1.0, g:'m',sk:'#fde3bb'},
 cz13:{fn:'ice',     col:'#00bcd4',v:'Zéro absolu. Aurora Execution.',p:0.82,r:0.78,g:'m',sk:'#fde3bb'},
 cz14:{fn:'vanish',  col:'#e91e8c',v:'Piranha Rose !',            p:0.95,r:0.9, g:'m',sk:'#fde3bb'},
// ── TM / BM / TN / AX
tm01:{fn:'slash',  col:'#3498db',v:"Tous pour un !",          p:1.1, r:1.2, g:'m',sk:'#d4a860'},
 tm02:{fn:'slash',  col:'#7f8c8d',v:"La noblesse impose.",     p:0.88,r:0.82,g:'m',sk:'#9a9a9a'},
 tm03:{fn:'scream', col:'#e67e22',v:"Je suis beau, je suis fort !",p:1.05,r:1.05,g:'m',sk:'#c8a060'},
 tm04:{fn:'wand',   col:'#27ae60',v:"Un pour tous !",          p:0.98,r:0.95,g:'m',sk:'#b8906a'},
 tm05:{fn:'vanish', col:'#c0392b',v:"La France avant tout.",   p:0.8, r:0.78,g:'m',sk:'#b89070'},
 tm06:{fn:'beam',   col:'#9b59b6',v:"Vous regretterez cela.",  p:0.88,r:0.88,g:'f',sk:'#f0e8d8'},
 tm07:{fn:'heart',  col:'#e67e22',v:"Soyez prudent !",         p:1.1, r:1.05,g:'f',sk:'#f0e0c8'},
 tm08:{fn:'slash',  col:'#2c3e50',v:"Nous nous retrouverons.", p:0.85,r:0.88,g:'m',sk:'#a09080'},
 tm09:{fn:'aura',   col:'#f1c40f',v:"Vive la France !",        p:1.0, r:0.95,g:'m',sk:'#e8c890'},
 bm01:{fn:'slash',  col:'#3498db',v:"Je suis la nuit !",       p:0.82,r:0.75,g:'m',sk:'#2c2c40',sp:'batman'},
 bm02:{fn:'jump',   col:'#e74c3c',v:"Sainte Mère de Dieu !",   p:1.1, r:1.15,g:'m',sk:'#fde3bb'},
 bm03:{fn:'roar',   col:'#27ae60',v:'Hahaha !',                  p:1.15,r:0.88,g:'m',sk:'#f0f0e0',sp:'joker'},
 bm04:{fn:'wand',   col:'#2c3e50',v:"Très cher homme-chauve-souris.",p:0.85,r:0.82,g:'m',sk:'#fde3bb'},
 bm05:{fn:'gauntlet',col:'#e74c3c',v:"Je laisse le hasard décider.",p:0.9,r:0.88,g:'m',sk:'#fde3bb'},
 bm06:{fn:'vine',   col:'#9b59b6',v:"Méow...",                 p:1.05,r:1.05,g:'f',sk:'#fde3bb'},
 bm07:{fn:'aura',   col:'#27ae60',v:"La nature reprend ses droits.",p:1.0,r:0.92,g:'f',sk:'#fde3bb'},
 bm08:{fn:'bounce', col:'#ecf0f1',v:"Très bien, Monsieur Wayne.",p:0.9,r:0.85,g:'m',sk:'#fde3bb'},
 tn01:{fn:'wand',   col:'#3498db',v:"Mille millions de mille sabords !",p:1.05,r:1.0,g:'m',sk:'#fde3bb'},
 tn02:{fn:'roar',   col:'#2c3e50',v:"Troglodyte !",             p:0.88,r:1.05,g:'m',sk:'#fde3bb',sp:'haddock'},
 tn03:{fn:'bounce', col:'#ecf0f1',v:'',                          p:1.2, r:1.2, g:'m',sk:'#ecf0f1',sp:'milou'},
 tn04:{fn:'portal', col:'#27ae60',v:"Hein ? Quoi ?",           p:1.0, r:0.82,g:'m',sk:'#fde3bb'},
 tn05:{fn:'beam',   col:'#7f8c8d',v:"Permettez-moi de vous présenter mon collègue.",p:0.95,r:0.95,g:'m',sk:'#fde3bb'},
 tn06:{fn:'aura',   col:'#8e44ad',v:"Ah, je ris de me voir si belle en ce miroir !",p:1.1,r:0.88,g:'f',sk:'#fde3bb'},
 ax01:{fn:'kame',   col:'#3498db',v:"Ces Romains sont fous !",  p:1.05,r:1.05,g:'m',sk:'#fde3bb'},
 ax02:{fn:'scream', col:'#e74c3c',v:"Ils sont fous ces Romains !Woa !!",p:1.08,r:1.1,g:'m',sk:'#fde3bb'},
 ax03:{fn:'bounce', col:'#27ae60',v:'',                          p:1.3, r:1.3, g:'m',sk:'#ecf0f1',sp:'idefix'},
 ax04:{fn:'wand',   col:'#f1c40f',v:"Bois ce breuvage !",       p:0.88,r:0.82,g:'m',sk:'#fde3bb'},
 ax05:{fn:'aura',   col:'#9b59b6',v:"La la la la la !",         p:1.15,r:0.85,g:'m',sk:'#fde3bb',sp:'assurancetourix'},
 ax06:{fn:'aura',   col:'#f1c40f',v:"Veni vidi vici.",          p:0.88,r:0.82,g:'m',sk:'#fde3bb'},
 ax07:{fn:'slash',  col:'#c0392b',v:"Pour Rome et César !",     p:0.95,r:1.05,g:'m',sk:'#fde3bb'},
// ── MI / PJ / OT / CO / AL
mi01:{fn:'spin',    col:'#e91e8c',v:"Miraculous Ladybug !",    p:1.1, r:1.2, g:'f',sk:'#fde3bb',sp:'ladybug'},
 mi02:{fn:'slash',   col:'#27ae60',v:"Cataclysme !",            p:1.05,r:1.1, g:'m',sk:'#fde3bb',sp:'chatnoir'},
 mi03:{fn:'vanish',  col:'#9b59b6',v:"Vole mon akuma !",        p:0.82,r:0.78,g:'m',sk:'#fde3bb'},
 mi04:{fn:'wand',    col:'#e67e22',v:"J\'ai tout filmé !",       p:1.1, r:1.1, g:'f',sk:'#d4956a'},
 mi05:{fn:'bounce',  col:'#27ae60',v:"Camembert d\'abord !",     p:1.15,r:1.2, g:'m',sk:'#1a1a1a',sp:'plagg'},
 mi06:{fn:'aura',    col:'#e91e8c',v:"Tikki, transforme-moi !", p:1.2, r:1.1, g:'f',sk:'#e74c3c',sp:'tikki'},
 pj01:{fn:'jump',    col:'#27ae60',v:"Au nom de la lune... non, de la nuit !",p:1.1,r:1.15,g:'m',sk:'#27ae60'},
 pj02:{fn:'slash',   col:'#3498db',v:"Pyjamasques, en avant !", p:1.08,r:1.1, g:'m',sk:'#3498db'},
 pj03:{fn:'roar',    col:'#e74c3c',v:"Ailes d\'Owlette !",       p:1.1, r:1.05,g:'f',sk:'#e74c3c'},
 pj04:{fn:'wand',    col:'#9b59b6',v:"Mes sorts vont vous avoir !",p:0.9,r:0.95,g:'f',sk:'#b0d0a0'},
 pj05:{fn:'aura',    col:'#3498db',v:"Mon génie est imbattable !",p:0.95,r:1.0, g:'m',sk:'#fde3bb'},
 pj06:{fn:'scream',  col:'#e67e22',v:'Howl !',                    p:0.88,r:1.05,g:'m',sk:'#c8a060',sp:'farfeloups'},
 pj07:{fn:'vanish',  col:'#9b59b6',v:"Night Ninja frappe dans l\'ombre !",p:0.85,r:0.9,g:'m',sk:'#5b2d8e'},
 ot01:{fn:'kame',    col:'#3498db',v:"Drive Shoot !",             p:1.1, r:1.2, g:'m',sk:'#fde3bb',sp:'olive'},
 ot02:{fn:'shield',  col:'#c0392b',v:"Je l\'arrête !",            p:0.95,r:1.0, g:'m',sk:'#fde3bb',sp:'becker'},
 ot03:{fn:'slash',   col:'#27ae60',v:"Let\'s go !",               p:1.05,r:1.1, g:'m',sk:'#fde3bb'},
 ot04:{fn:'bounce',  col:'#f1c40f',v:"Yeah !",                    p:1.1, r:1.15,g:'m',sk:'#d4956a'},
 ot05:{fn:'scream',  col:'#e74c3c',v:"On va vous écraser !",      p:0.88,r:0.95,g:'m',sk:'#fde3bb'},
 ot06:{fn:'beam',    col:'#3498db',v:"Bien joué, équipe.",         p:0.95,r:0.92,g:'m',sk:'#fde3bb'},
 ot07:{fn:'slash',   col:'#e74c3c',v:"Für Deutschland !",          p:0.98,r:1.0, g:'m',sk:'#fde3bb'},
 ot08:{fn:'vanish',  col:'#9b59b6',v:"Regardez bien...",           p:0.9, r:0.88,g:'m',sk:'#fde3bb'},
 ot09:{fn:'jump',    col:'#e91e8c',v:"Le foot c\'est aussi pour moi !",p:1.1,r:1.1,g:'f',sk:'#fde3bb'},
 ot10:{fn:'aura',    col:'#7f8c8d',v:"En équipe, tout est possible.",p:0.92,r:0.88,g:'m',sk:'#fde3bb'},
 co01:{fn:'beam',    col:'#e74c3c',v:"Psycho-gun !",               p:0.92,r:0.95,g:'m',sk:'#fde3bb',sp:'cobra'},
 co02:{fn:'aura',    col:'#3498db',v:"Analyses complètes.",        p:0.9, r:0.85,g:'f',sk:'#d8d8d8'},
 co03:{fn:'slash',   col:'#27ae60',v:"Je suis avec toi, Cobra.",   p:1.0, r:0.95,g:'f',sk:'#fde3bb'},
 co04:{fn:'portal',  col:'#74b9ff',v:"Vous serez cristallisé.",    p:0.82,r:0.78,g:'m',sk:'#74b9ff'},
 al01:{fn:'slash',   col:'#e74c3c',v:"Je suis un pirate libre !",  p:0.85,r:0.82,g:'m',sk:'#fde3bb',sp:'albator'},
 al02:{fn:'scream',  col:'#7f8c8d',v:"Je suis là, capitaine.",     p:0.88,r:0.88,g:'m',sk:'#fde3bb'},
 al03:{fn:'beam',    col:'#3498db',v:"L\'Atlantis vole encore.",    p:1.0, r:0.92,g:'f',sk:'#fde3bb'},
 al04:{fn:'slash',   col:'#e67e22',v:"Mon katana ne ment pas.",    p:0.9, r:0.9, g:'m',sk:'#e8c88a'},
 al05:{fn:'vanish',  col:'#9b59b6',v:"La liberté vaut ce prix.",   p:0.95,r:0.88,g:'f',sk:'#fde3bb'},
 al06:{fn:'spin',    col:'#e74c3c',v:"L\'Atlantis!",               p:0.88,r:0.85,g:'n',sk:'#2c3e50',sp:'albator'},
// ── TU / SM / SP / BL / DR
tu01:{fn:'slash',  col:'#3498db',v:"Cowabunga !",              p:1.0, r:1.05,g:'m',sk:'#2ecc71',sp:'tmnt'},
 tu02:{fn:'slash',  col:'#e74c3c',v:"C\'est l\'heure de se battre !",p:0.95,r:1.1,g:'m',sk:'#2ecc71'},
 tu03:{fn:'beam',   col:'#9b59b6',v:"Fascinant !",               p:1.05,r:0.95,g:'m',sk:'#2ecc71'},
 tu04:{fn:'bounce', col:'#e67e22',v:"Pizza !",                   p:1.15,r:1.2, g:'m',sk:'#2ecc71',sp:'tmnt'},
 tu05:{fn:'wand',   col:'#9a9a9a',v:"Mes enfants...",            p:0.88,r:0.8, g:'m',sk:'#9a9a9a'},
 tu06:{fn:'aura',   col:'#f1c40f',v:"J\'ai tout filmé !",        p:1.05,r:1.05,g:'f',sk:'#fde3bb'},
 tu07:{fn:'scream', col:'#ecf0f1',v:"Vengeance !",               p:0.78,r:0.78,g:'m',sk:'#95a5a6',sp:'shredder'},
 sm01:{fn:'spin',   col:'#e91e8c',v:"Moon Prism Power, make up !",p:1.15,r:1.05,g:'f',sk:'#fde3bb',sp:'sailormoon'},
 sm02:{fn:'fire',   col:'#c0392b',v:"Mars Flame Sniper !",        p:1.05,r:1.1, g:'f',sk:'#fde3bb'},
 sm03:{fn:'aura',   col:'#f1c40f',v:"Venus Love-Me Chain !",      p:1.08,r:1.1, g:'f',sk:'#fde3bb'},
 sm04:{fn:'ice',    col:'#3498db',v:"Mercury Aqua Rhapsody !",    p:1.0, r:1.0, g:'f',sk:'#fde3bb'},
 sm05:{fn:'thunder',col:'#27ae60',v:"Jupiter Oak Evolution !",    p:1.05,r:1.05,g:'f',sk:'#fde3bb'},
 sp01:{fn:'heart',  col:'#e91e8c',v:"Trop de la balle !",        p:1.15,r:1.15,g:'f',sk:'#fde3bb'},
 sp02:{fn:'portal', col:'#27ae60',v:"WOOHP en action !",          p:1.0, r:1.0, g:'f',sk:'#fde3bb'},
 sp03:{fn:'jump',   col:'#f1c40f',v:"On assure !",               p:1.1, r:1.1, g:'f',sk:'#fde3bb'},
 sp04:{fn:'wand',   col:'#2c3e50',v:"Bonsoir mesdames !",        p:0.9, r:0.85,g:'m',sk:'#fde3bb'},
 sp05:{fn:'vanish', col:'#9b59b6',v:"Je suis la meilleure.",     p:0.95,r:0.9, g:'f',sk:'#fde3bb'},
 bl01:{fn:'bounce', col:'#3498db',v:"On joue !",                  p:1.2, r:1.2, g:'f',sk:'#3498db',sp:'bluey'},
 bl02:{fn:'heart',  col:'#e67e22',v:"D\'accord !",               p:1.15,r:1.15,g:'f',sk:'#e67e22',sp:'bluey'},
 bl03:{fn:'jump',   col:'#2c3e50',v:"Allez, on se lance !",       p:1.0, r:1.05,g:'m',sk:'#2c3e50'},
 bl04:{fn:'aura',   col:'#e91e8c',v:"Je t\'aime mon coeur.",     p:1.05,r:1.0, g:'f',sk:'#e91e8c'},
 bl05:{fn:'slash',  col:'#c0392b',v:"Attention !",               p:1.1, r:1.1, g:'m',sk:'#c0392b'},
 bl06:{fn:'bounce', col:'#f1c40f',v:"Chouette !",                p:1.18,r:1.2, g:'f',sk:'#f1c40f'},
 dr01:{fn:'wand',   col:'#8B6914',v:"Je l\'ai eu !",              p:1.05,r:1.05,g:'m',sk:'#fde3bb',sp:'httyd'},
 dr02:{fn:'roar',   col:'#111',   v:'',                           p:1.0, r:1.0, g:'n',sk:'#111',   sp:'toothless'},
 dr03:{fn:'slash',  col:'#3498db',v:"Attaque de hache !",         p:1.1, r:1.1, g:'f',sk:'#fde3bb'},
 dr04:{fn:'scream', col:'#e67e22',v:"Fils de Beurk !",            p:0.85,r:0.95,g:'m',sk:'#fde3bb'},
 dr05:{fn:'spin',   col:'#8B6914',v:"Crochefer a dit non !",      p:1.05,r:1.1, g:'f',sk:'#fde3bb'},
 dr06:{fn:'fire',   col:'#c0392b',v:'',                           p:1.0, r:1.0, g:'n',sk:'#c0392b',sp:'dragon'},
 dr07:{fn:'roar',   col:'#27ae60',v:'',                           p:1.0, r:1.0, g:'n',sk:'#27ae60',sp:'dragon'},
 dr08:{fn:'bounce', col:'#8B6914',v:'',                           p:1.0, r:1.0, g:'n',sk:'#8B6914',sp:'dragon'},
 dr09:{fn:'scream', col:'#c0392b',v:"C\'est moi le chef !",       p:1.0, r:1.1, g:'m',sk:'#fde3bb'},
 dr10:{fn:'slash',  col:'#3498db',v:'',                           p:1.0, r:1.0, g:'n',sk:'#3498db',sp:'dragon'},
 dr11:{fn:'roar',   col:'#8B6914',v:'',                           p:1.0, r:1.0, g:'n',sk:'#6d4c00',sp:'dragon'},
 dr12:{fn:'bounce', col:'#8B6914',v:"Pas toi, moi !",            p:1.0, r:1.1, g:'m',sk:'#fde3bb'},
 dr13:{fn:'spin',   col:'#9b59b6',v:'',                           p:1.0, r:1.0, g:'n',sk:'#9b59b6',sp:'dragon'},
};

// ── Sons synthétiques ───────────────────────────────────────────────────

function _sndRobotGd(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[140,.0,.12],[200,.14,.08],[160,.24,.14],[240,.40,.10],[180,.56,.12]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
      lp.type='lowpass';lp.frequency.value=800;
      o.type='sawtooth';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);
      g.gain.linearRampToValueAtTime(.35,A.currentTime+d+.02);
      g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(lp);lp.connect(g);g.connect(A.destination);
      o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndGoldorak(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Goldorak theme stinger - epic robotic
    const o=A.createOscillator(),d=A.createWaveShaper(),g=A.createGain(),hp=A.createBiquadFilter();
    hp.type='highpass';hp.frequency.value=80;
    const c=new Float32Array(512);
    for(let i=0;i<512;i++){const x=i*2/512-1;c[i]=x<0?-Math.pow(-x,.45):Math.pow(x,.45);}
    d.curve=c;
    o.type='sawtooth';
    o.frequency.setValueAtTime(110,A.currentTime);
    o.frequency.linearRampToValueAtTime(220,A.currentTime+.2);
    o.frequency.setValueAtTime(165,A.currentTime+.3);
    o.frequency.linearRampToValueAtTime(330,A.currentTime+.55);
    g.gain.setValueAtTime(0,A.currentTime);
    g.gain.linearRampToValueAtTime(.55,A.currentTime+.06);
    g.gain.setValueAtTime(.55,A.currentTime+.45);
    g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.4);
    o.connect(d);d.connect(hp);hp.connect(g);g.connect(A.destination);
    o.start();o.stop(A.currentTime+1.5);
  }catch(e){}
}

function _sndBatman(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[80,.0,.25],[100,.2,.2],[80,.35,.3],[130,.55,.45]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
      lp.type='lowpass';lp.frequency.value=500;o.type='sawtooth';o.frequency.setValueAtTime(f,A.currentTime+d);
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.45,A.currentTime+d+.03);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(lp);lp.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndJoker(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [800,900,1000,850,1100,750,1200].forEach((f,i)=>{
      const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=f;const d=i*.12;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.3,A.currentTime+d+.04);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+.1);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+.15);
    });
  }catch(e){}
}
function _sndHaddock(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='bandpass';lp.frequency.value=300;lp.Q.value=3;o.type='sawtooth';
    o.frequency.setValueAtTime(160,A.currentTime);o.frequency.linearRampToValueAtTime(280,A.currentTime+.3);
    o.frequency.linearRampToValueAtTime(120,A.currentTime+.8);o.frequency.linearRampToValueAtTime(240,A.currentTime+1.2);
    g.gain.setValueAtTime(.5,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.5);
    o.connect(lp);lp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.6);
  }catch(e){}
}
function _sndMilou(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[600,.0,.08],[800,.12,.06],[600,.22,.09]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain(),hp=A.createBiquadFilter();
      hp.type='highpass';hp.frequency.value=400;o.type='square';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.38,A.currentTime+d+.01);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(hp);hp.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndIdefix(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[900,.0,.06],[1100,.1,.05],[900,.18,.07],[1200,.28,.05]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();o.type='square';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.28,A.currentTime+d+.01);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndAssurancetourix(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [523,415,587,466,523,369,494].forEach((f,i)=>{
      const o=A.createOscillator(),g=A.createGain();o.type='triangle';
      o.frequency.setValueAtTime(f*(1+(Math.random()*.08-.04)),A.currentTime+i*.22);
      g.gain.setValueAtTime(0,A.currentTime+i*.22);g.gain.linearRampToValueAtTime(.25,A.currentTime+i*.22+.05);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+i*.22+.2);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+i*.22);o.stop(A.currentTime+i*.22+.25);
    });
  }catch(e){}
}


function _sndTMNT(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Cowabunga! - electric guitar riff
    [[196,.0,.12],[196,.14,.08],[220,.25,.12],[196,.38,.1],[247,.5,.18]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain(),dist=A.createWaveShaper();
      const c=new Float32Array(256);for(let i=0;i<256;i++){const x=i*2/256-1;c[i]=x<0?-Math.pow(-x,.5):Math.pow(x,.5);}
      dist.curve=c;o.type='sawtooth';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.3,A.currentTime+d+.015);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(dist);dist.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndShredder(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Metallic menacing chord
    [[55,.0,.9],[82,.03,.85],[110,.06,.8],[138,.09,.75]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain(),dist=A.createWaveShaper();
      const c=new Float32Array(256);for(let i=0;i<256;i++){const x=i*2/256-1;c[i]=x<0?-Math.pow(-x,.3):Math.pow(x,.3);}
      dist.curve=c;o.type='sawtooth';o.frequency.value=f;
      g.gain.setValueAtTime(.22,A.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(dist);dist.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.05);
    });
  }catch(e){}
}
function _sndSailorMoon(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Transformation sparkle arpeggio
    [523,659,784,1047,1319,1568,2093].forEach((f,i)=>{
      const o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=f;
      const d=i*.09;g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.28,A.currentTime+d+.018);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+.15);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+.18);
    });
  }catch(e){}
}
function _sndBluey(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Joyful children's jingle
    [[523,.0,.1],[659,.12,.1],[784,.24,.1],[880,.36,.15],[1047,.52,.2],[880,.74,.1],[1047,.88,.18]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.25,A.currentTime+d+.015);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndToothless(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Plasma blast charging + fire
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='lowpass';lp.frequency.setValueAtTime(300,A.currentTime);lp.frequency.exponentialRampToValueAtTime(2000,A.currentTime+.6);
    o.type='sawtooth';o.frequency.setValueAtTime(60,A.currentTime);o.frequency.exponentialRampToValueAtTime(800,A.currentTime+.5);
    o.frequency.exponentialRampToValueAtTime(100,A.currentTime+.9);
    g.gain.setValueAtTime(.45,A.currentTime);g.gain.setValueAtTime(.45,A.currentTime+.5);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.1);
    o.connect(lp);lp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.2);
  }catch(e){}
}
function _sndDragon(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Dragon roar - low rumble
    const o=A.createOscillator(),g=A.createGain(),dist=A.createWaveShaper(),lp=A.createBiquadFilter();
    lp.type='lowpass';lp.frequency.value=600;
    const c=new Float32Array(512);for(let i=0;i<512;i++){const x=i*2/512-1;c[i]=x<0?-Math.pow(-x,.25):Math.pow(x,.25);}
    dist.curve=c;o.type='sawtooth';
    o.frequency.setValueAtTime(80,A.currentTime);o.frequency.linearRampToValueAtTime(200,A.currentTime+.3);o.frequency.linearRampToValueAtTime(60,A.currentTime+1.0);
    g.gain.setValueAtTime(.55,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.4);
    o.connect(dist);dist.connect(lp);lp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.5);
  }catch(e){}
}
function _sndHTTYD(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // "How to Train Your Dragon" heroic motif
    [[392,.0,.18],[440,.2,.18],[523,.4,.22],[392,.65,.18],[349,.85,.18],[392,1.05,.28]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.22,A.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}

function _sndLadybug(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Lucky charm sparkle ascending
    [523,659,784,1047,1319,1568].forEach((f,i)=>{
      const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=f;
      const d=i*.08;g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.3,A.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+.12);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+.15);
    });
  }catch(e){}
}
function _sndChatNoir(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Cataclysme dark rumble
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='lowpass';lp.frequency.value=400;o.type='sawtooth';
    o.frequency.setValueAtTime(80,A.currentTime);o.frequency.linearRampToValueAtTime(160,A.currentTime+.4);o.frequency.linearRampToValueAtTime(60,A.currentTime+.9);
    g.gain.setValueAtTime(.5,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.2);
    o.connect(lp);lp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.3);
  }catch(e){}
}
function _sndPlagg(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Lazy cat meow-ish
    [[400,.0,.15],[350,.2,.1],[420,.35,.18]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(f,A.currentTime+d);o.frequency.linearRampToValueAtTime(f*1.2,A.currentTime+d+du*.5);
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.3,A.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndTikki(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Bright magical chime
    [1047,1319,1047,1568,1319,1047].forEach((f,i)=>{
      const o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=f;
      const d=i*.1;g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.25,A.currentTime+d+.015);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+.09);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+.12);
    });
  }catch(e){}
}
function _sndFarfeloups(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Wolf howl
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='bandpass';lp.frequency.value=500;lp.Q.value=2;o.type='sawtooth';
    o.frequency.setValueAtTime(200,A.currentTime);o.frequency.linearRampToValueAtTime(600,A.currentTime+.6);o.frequency.linearRampToValueAtTime(350,A.currentTime+1.4);
    g.gain.setValueAtTime(.4,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.6);
    o.connect(lp);lp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+1.7);
  }catch(e){}
}
function _sndOlive(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Football kick + whistle
    const o=A.createOscillator(),g=A.createGain(),hp=A.createBiquadFilter();
    hp.type='highpass';hp.frequency.value=1000;o.type='square';
    o.frequency.setValueAtTime(1800,A.currentTime);o.frequency.linearRampToValueAtTime(1200,A.currentTime+.4);
    g.gain.setValueAtTime(.3,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+.5);
    o.connect(hp);hp.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.55);
    // Kick thud
    setTimeout(()=>{try{const o2=A.createOscillator(),g2=A.createGain();o2.type='sine';o2.frequency.setValueAtTime(80,A.currentTime);o2.frequency.exponentialRampToValueAtTime(30,A.currentTime+.12);g2.gain.setValueAtTime(.5,A.currentTime);g2.gain.exponentialRampToValueAtTime(.001,A.currentTime+.12);o2.connect(g2);g2.connect(A.destination);o2.start();o2.stop(A.currentTime+.15);}catch(e){}},0);
  }catch(e){}
}
function _sndBecker(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Save impact sound
    const o=A.createOscillator(),g=A.createGain();o.type='square';
    o.frequency.setValueAtTime(100,A.currentTime);o.frequency.linearRampToValueAtTime(60,A.currentTime+.2);
    g.gain.setValueAtTime(.55,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+.3);
    o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.35);
  }catch(e){}
}
function _sndCobra(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Psychogun laser
    const o=A.createOscillator(),g=A.createGain();o.type='sawtooth';
    o.frequency.setValueAtTime(200,A.currentTime);o.frequency.exponentialRampToValueAtTime(2000,A.currentTime+.5);
    g.gain.setValueAtTime(.4,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+.6);
    o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.65);
  }catch(e){}
}
function _sndAlbator(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Space pirate dramatic chord
    [[110,.0,.8],[138,.05,.75],[164,.1,.7],[220,.15,.65]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();o.type='sawtooth';o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);g.gain.linearRampToValueAtTime(.18,A.currentTime+d+.08);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.05);
    });
  }catch(e){}
}
function _sndVader(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    // Souffle grave filtré + légère modulation
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='lowpass'; lp.frequency.value=320; lp.Q.value=2;
    o.type='sawtooth';
    o.frequency.setValueAtTime(55,A.currentTime);
    o.frequency.linearRampToValueAtTime(50,A.currentTime+.5);
    o.frequency.linearRampToValueAtTime(55,A.currentTime+1.0);
    o.frequency.linearRampToValueAtTime(48,A.currentTime+1.5);
    g.gain.setValueAtTime(0,A.currentTime);
    g.gain.linearRampToValueAtTime(.42,A.currentTime+.15);
    g.gain.setValueAtTime(.42,A.currentTime+1.2);
    g.gain.linearRampToValueAtTime(0,A.currentTime+1.6);
    o.connect(lp);lp.connect(g);g.connect(A.destination);
    o.start();o.stop(A.currentTime+1.7);
  }catch(e){}
}
function _sndHulk(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    const o=A.createOscillator(),d=A.createWaveShaper(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='lowpass'; lp.frequency.value=500;
    const c=new Float32Array(512);
    for(let i=0;i<512;i++){const x=i*2/512-1;c[i]=x<0?-Math.pow(-x,.35):Math.pow(x,.35);}
    d.curve=c;
    o.type='sawtooth';
    o.frequency.setValueAtTime(72,A.currentTime);
    o.frequency.linearRampToValueAtTime(140,A.currentTime+.4);
    o.frequency.linearRampToValueAtTime(60,A.currentTime+1.1);
    g.gain.setValueAtTime(0,A.currentTime);
    g.gain.linearRampToValueAtTime(.52,A.currentTime+.08);
    g.gain.setValueAtTime(.52,A.currentTime+.9);
    g.gain.exponentialRampToValueAtTime(.001,A.currentTime+1.6);
    o.connect(d);d.connect(lp);lp.connect(g);g.connect(A.destination);
    o.start();o.stop(A.currentTime+1.7);
  }catch(e){}
}
function _sndR2D2(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[920,.0,.09],[1450,.14,.07],[750,.26,.11],[1650,.42,.08],[850,.58,.12],[1300,.74,.09]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);
      g.gain.linearRampToValueAtTime(.38,A.currentTime+d+.015);
      g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);
      o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}
function _sndChewie(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();
    lp.type='lowpass'; lp.frequency.value=680; lp.Q.value=1.5;
    o.type='sawtooth';
    o.frequency.setValueAtTime(110,A.currentTime);
    o.frequency.linearRampToValueAtTime(310,A.currentTime+.38);
    o.frequency.linearRampToValueAtTime(160,A.currentTime+.72);
    o.frequency.linearRampToValueAtTime(380,A.currentTime+1.15);
    o.frequency.linearRampToValueAtTime(95,A.currentTime+1.82);
    g.gain.setValueAtTime(.52,A.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,A.currentTime+2.0);
    o.connect(lp);lp.connect(g);g.connect(A.destination);
    o.start();o.stop(A.currentTime+2.1);
  }catch(e){}
}
function _sndPika(){
  try{
    const A=new(window.AudioContext||window.webkitAudioContext)();
    [[1500,.0,.09],[820,.12,.1],[1700,.26,.08],[950,.38,.09],[1900,.52,.1]].forEach(([f,d,du])=>{
      const o=A.createOscillator(),g=A.createGain();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0,A.currentTime+d);
      g.gain.linearRampToValueAtTime(.35,A.currentTime+d+.018);
      g.gain.exponentialRampToValueAtTime(.001,A.currentTime+d+du);
      o.connect(g);g.connect(A.destination);
      o.start(A.currentTime+d);o.stop(A.currentTime+d+du+.02);
    });
  }catch(e){}
}

// ── Sélection de voix ───────────────────────────────────────────────────
let _vList=[];
function _loadVoices(){_vList=window.speechSynthesis.getVoices();}
if(window.speechSynthesis){
  _loadVoices();
  window.speechSynthesis.onvoiceschanged=_loadVoices;
}
function _pickVoice(g){
  const fr=_vList.filter(v=>v.lang&&v.lang.startsWith('fr'));
  if(!fr.length)return null;
  const mRx=/thomas|paul|nicolas|pierre|claude|male|homme|masc|yann/i;
  const fRx=/amelie|marie|aurelie|hortense|fem|femme|audrey|chloe|lea|emilie/i;
  if(g==='m') return fr.find(v=>mRx.test(v.name))||fr.find(v=>!fRx.test(v.name)&&v.localService)||fr.find(v=>!fRx.test(v.name))||fr[0];
  if(g==='f') return fr.find(v=>fRx.test(v.name))||fr.find(v=>v.localService)||fr[0];
  return fr.find(v=>v.localService)||fr[0];
}
function _speak(txt,pitch,rate,gender){
  if(!window.speechSynthesis||!txt)return;
  if($('voiceToggle')&&!$('voiceToggle').checked)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(txt);
  u.lang='fr-FR';
  u.pitch=1.0;
  const rateJitter=.06*(Math.random()-.5);
  u.rate=Math.max(0.8,Math.min(1.3,(rate||1)+rateJitter));
  u.volume=0.95+0.05*Math.random();
  const v=_pickVoice(gender);
  if(v)u.voice=v;
  window.speechSynthesis.speak(u);
}

// ── Interpolation ────────────────────────────────────────────────────────
function _eio(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function _lerp(a,b,t){return a+(b-a)*t;}
function _poseAt(fn,p){
  const seq=_SEQ[fn]||_SEQ.bounce;
  if(p<=seq[0][0]) return seq[0].slice(1);
  const last=seq[seq.length-1];
  if(p>=last[0]) return last.slice(1);
  for(let i=0;i<seq.length-1;i++){
    if(p>=seq[i][0]&&p<=seq[i+1][0]){
      const t=_eio((p-seq[i][0])/(seq[i+1][0]-seq[i][0]));
      const A=seq[i].slice(1),B=seq[i+1].slice(1);
      return A.map((v,j)=>_lerp(v,B[j],t));
    }
  }
  return last.slice(1);
}

// ── Bras SVG ─────────────────────────────────────────────────────────────
const _NS='http://www.w3.org/2000/svg';
function _ensureArms(svg,sk){
  if(!svg)return;
  ['_la','_lb','_ra','_rb'].forEach(id=>{
    if(!svg.querySelector('#'+id)){
      const l=document.createElementNS(_NS,'line');
      l.id=id; l.setAttribute('stroke-linecap','round');
      svg.appendChild(l);
    }
  });
  // Proportionnel: torse ≈18 unités large → bras ≈3.8 unités épaisseur
  [['_la',7],['_lb',5.5],['_ra',7],['_rb',5.5]].forEach(([id,w])=>{
    const el=svg.querySelector('#'+id);
    if(el){el.setAttribute('stroke',sk||'#f5cba7');el.setAttribute('stroke-width',String(w));}
  });
}
function _setLine(svg,id,x1,y1,x2,y2){
  const l=svg.querySelector('#'+id);
  if(!l)return;
  l.setAttribute('x1',x1);l.setAttribute('y1',y1);
  l.setAttribute('x2',x2);l.setAttribute('y2',y2);
}
function _applyPose(svg,id,pose){
  // pose = [dLex,dLey,dLhx,dLhy, dRex,dRey,dRhx,dRhy] (deltas depuis épaule)
  const sh=_sh(id);
  const[lsx,lsy,rsx,rsy]=sh;
  const[dLex,dLey,dLhx,dLhy,dRex,dRey,dRhx,dRhy]=pose;
  _setLine(svg,'_la',lsx,lsy, lsx+dLex,lsy+dLey);
  _setLine(svg,'_lb',lsx+dLex,lsy+dLey, lsx+dLhx,lsy+dLhy);
  _setLine(svg,'_ra',rsx,rsy, rsx+dRex,rsy+dRey);
  _setLine(svg,'_rb',rsx+dRex,rsy+dRey, rsx+dRhx,rsy+dRhy);
}

// ── Canvas effets ─────────────────────────────────────────────────────────
function _getFXCanvas(){
  const chr=$('fv-chr'); if(!chr)return null;
  let cv=chr.querySelector('canvas.fxcv');
  if(!cv){
    cv=document.createElement('canvas');
    cv.className='fxcv';
    cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:20;border-radius:22px;';
    if(getComputedStyle(chr).position==='static')chr.style.position='relative';
    chr.appendChild(cv);
  }
  const r=chr.getBoundingClientRect();
  if(cv.width!==(r.width|0)||cv.height!==(r.height|0)){cv.width=r.width||360;cv.height=r.height||396;}
  return cv;
}
// Coord SVG (0-100,0-110) → canvas px
function _cx(x,W){return x*W/100;}
function _cy(y,H){return y*H/110;}
function _hexA(h,a){
  const s=h.replace('#','');const n=parseInt((s+'000000').slice(0,6),16);
  return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${Math.max(0,Math.min(1,a))})`;
}
function _drawHeart(ctx,x,y,r){
  ctx.beginPath();ctx.moveTo(x,y+r*.3);
  ctx.bezierCurveTo(x,y-r*.5,x-r*1.2,y-r*.5,x-r*1.2,y);
  ctx.bezierCurveTo(x-r*1.2,y+r*.5,x,y+r*.8,x,y+r*.3);
  ctx.bezierCurveTo(x,y+r*.8,x+r*1.2,y+r*.5,x+r*1.2,y);
  ctx.bezierCurveTo(x+r*1.2,y-r*.5,x,y-r*.5,x,y+r*.3);
  ctx.fill();
}

function _drawFX(fn,p,cv,col,id,pose){
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  // Mains en px (depuis pose SVG + épaules)
  const sh=_sh(id);
  const[dLex,dLey,dLhx,dLhy,dRex,dRey,dRhx,dRhy]=pose;
  const lhx=_cx(sh[0]+dLhx,W),lhy=_cy(sh[1]+dLhy,H);
  const rhx=_cx(sh[2]+dRhx,W),rhy=_cy(sh[3]+dRhy,H);
  const midX=(lhx+rhx)*.5,midY=(lhy+rhy)*.5;
  const ep=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;

  switch(fn){
  case 'kame':{
    if(p>.3&&p<.58){
      const cp=(p-.3)/.28;
      const g=ctx.createRadialGradient(midX,midY,0,midX,midY,W*.12*cp);
      g.addColorStop(0,`rgba(255,255,255,${.9*cp})`);g.addColorStop(.3,`rgba(120,210,255,${.7*cp})`);g.addColorStop(1,'rgba(0,80,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(midX,midY,W*.16*cp,0,Math.PI*2);ctx.fill();
    }
    if(p>=.58){
      const bp=(p-.58)/.42;
      ctx.save();ctx.shadowColor='#38f';ctx.shadowBlur=20;
      const bw=H*(.065+.04*bp);
      const gr=ctx.createLinearGradient(lhx,0,0,0);
      gr.addColorStop(0,`rgba(255,255,255,${.9*bp})`);gr.addColorStop(.4,`rgba(100,200,255,${.72*bp})`);gr.addColorStop(1,'rgba(0,60,255,0)');
      ctx.fillStyle=gr;ctx.fillRect(0,midY-bw*.5,lhx,bw);ctx.restore();
    }
    break;
  }
  case 'gallic':{
    if(p>=.42){
      const bp=(p-.42)/.58;
      ctx.save();ctx.shadowColor='#a0f';ctx.shadowBlur=18;
      const bw=W*(.065+.03*bp);
      const gr=ctx.createLinearGradient(0,midY,0,0);
      gr.addColorStop(0,`rgba(255,255,255,${.88*bp})`);gr.addColorStop(.35,`rgba(180,100,255,${.72*bp})`);gr.addColorStop(1,'rgba(80,0,200,0)');
      ctx.fillStyle=gr;ctx.fillRect(midX-bw*.5,0,bw,midY);ctx.restore();
    }
    break;
  }
  case 'beam':{
    if(p>=.28){
      const bp=(p-.28)/.72;
      ctx.save();ctx.shadowColor=col;ctx.shadowBlur=14;
      ctx.strokeStyle=col;ctx.lineWidth=W*.022*(1+.35*Math.sin(p*18));ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(rhx,rhy);ctx.lineTo(W+W*.1,rhy-.015*H*bp);ctx.stroke();ctx.restore();
      const g=ctx.createRadialGradient(rhx,rhy,0,rhx,rhy,W*.055*bp);
      g.addColorStop(0,`rgba(255,255,255,${.88*bp})`);g.addColorStop(1,_hexA(col,0));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(rhx,rhy,W*.07*bp,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'aura':{
    const pu=.5+.5*Math.sin(p*Math.PI*5);
    const cX=W*.5,cY=H*.5;
    for(let i=3;i>=0;i--){
      const r=W*(.22+i*.1+.05*pu);
      const g=ctx.createRadialGradient(cX,cY,0,cX,cY,r);
      g.addColorStop(0,_hexA(col,0));g.addColorStop(.55,_hexA(col,(.14-i*.03)*pu));g.addColorStop(1,_hexA(col,(.07-i*.015)*pu));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cX,cY,r,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'wand':{
    const tx=rhx,ty=rhy-H*.04;
    if(p>=.28){
      const wp=(p-.28)/.72;
      const g=ctx.createRadialGradient(tx,ty,0,tx,ty,W*.1*wp);
      g.addColorStop(0,`rgba(255,255,255,${.92*wp})`);g.addColorStop(.3,_hexA(col,.78*wp));g.addColorStop(1,_hexA(col,0));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,W*.12*wp,0,Math.PI*2);ctx.fill();
      for(let i=0;i<6;i++){
        const sa=p*9+i*Math.PI*.33;
        ctx.fillStyle=_hexA(col,.65*wp);
        ctx.beginPath();ctx.arc(tx+Math.cos(sa)*W*(.04+.06*wp),ty+Math.sin(sa)*W*.04,W*.008,0,Math.PI*2);ctx.fill();
      }
      if(wp>.32){
        const rp=(wp-.32)/.68;
        ctx.save();ctx.shadowColor=col;ctx.shadowBlur=12;
        ctx.strokeStyle=col;ctx.lineWidth=W*.022;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx-W*.52*rp,ty-H*.35*rp);ctx.stroke();ctx.restore();
      }
    }
    break;
  }
  case 'saber':{
    if(p>=.08){
      const sl=Math.min(p/.2,1);
      ctx.save();ctx.shadowColor=col;ctx.shadowBlur=24;
      ctx.strokeStyle=col;ctx.lineWidth=W*.024;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(lhx,lhy);ctx.lineTo(lhx-W*.03*(1-p),lhy-H*.58*sl);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=W*.009;
      ctx.beginPath();ctx.moveTo(lhx,lhy);ctx.lineTo(lhx-W*.03*(1-p),lhy-H*.58*sl);ctx.stroke();
      ctx.restore();
    }
    break;
  }
  case 'thunder':{
    if(p>=.22){
      const tp=(p-.22)/.78;
      for(let b=0;b<4;b++){
        const lA=-Math.PI*.5+(b-1.5)*.22;
        ctx.save();ctx.strokeStyle=`rgba(255,248,80,${.82*tp})`;ctx.shadowColor='#ff0';ctx.shadowBlur=16;
        ctx.lineWidth=W*.016;ctx.lineCap='round';
        ctx.beginPath();let cx2=lhx,cy2=lhy;ctx.moveTo(cx2,cy2);
        for(let s=0;s<5;s++){
          const nx=cx2+Math.cos(lA+(s%2?.28:-.28))*W*.1*tp;
          const ny=cy2+Math.sin(lA+(s%2?.28:-.28))*H*.08*tp;
          ctx.lineTo(nx,ny);cx2=nx;cy2=ny;
        }
        ctx.stroke();ctx.restore();
      }
    }
    break;
  }
  case 'web':{
    if(p>=.2){
      const wp=(p-.2)/.8;
      ctx.save();
      for(let t=0;t<4;t++){
        const wA=-Math.PI*.1+(t-1.5)*.08;
        ctx.strokeStyle=`rgba(255,255,255,${.6*wp})`;ctx.lineWidth=W*.011;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(rhx,rhy);
        ctx.quadraticCurveTo(rhx+Math.cos(wA-.22)*W*.2*wp,rhy+Math.sin(wA-.22)*H*.18*wp,rhx+Math.cos(wA)*W*.5*wp,rhy+Math.sin(wA)*H*.36*wp);
        ctx.stroke();
      }
      ctx.restore();
    }
    break;
  }
  case 'repulsor':{
    if(p>=.28){
      const rp=(p-.28)/.72;
      const g=ctx.createRadialGradient(lhx,lhy,0,lhx,lhy,W*.15*rp);
      g.addColorStop(0,`rgba(255,230,120,${.92*rp})`);g.addColorStop(.3,`rgba(255,160,30,${.62*rp})`);g.addColorStop(1,'rgba(200,100,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(lhx,lhy,W*.18*rp,0,Math.PI*2);ctx.fill();
      if(rp>=.4){
        const bp=(rp-.4)/.6;
        ctx.save();ctx.shadowColor='#fc0';ctx.shadowBlur=14;
        ctx.strokeStyle=`rgba(255,200,80,${.8*bp})`;ctx.lineWidth=W*.022;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(lhx,lhy);ctx.lineTo(-W*.04,lhy);ctx.stroke();ctx.restore();
      }
    }
    break;
  }
  case 'shield':{
    const sA=p<.5?-(p/.5)*Math.PI*.52:-(1-(p-.5)/.5)*Math.PI*.52;
    ctx.save();ctx.translate(lhx,lhy);ctx.rotate(sA);ctx.shadowColor=col;ctx.shadowBlur=10;
    for(let i=0;i<3;i++){ctx.strokeStyle=i%2===0?col:'#e22';ctx.lineWidth=W*.026;ctx.beginPath();ctx.arc(0,0,W*(.07+i*.04),0,Math.PI*2);ctx.stroke();}
    ctx.restore();
    break;
  }
  case 'ice':{
    if(p>=.25){
      const ip=(p-.25)/.75;
      [[lhx,lhy],[rhx,rhy]].forEach(([hx,hy])=>{
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3+p*Math.PI*.8;
          const r=W*(.04+.13*ip);
          ctx.strokeStyle=`rgba(180,235,255,${ip*.8})`;ctx.lineWidth=W*.012;ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(a)*r,hy+Math.sin(a)*r*.72);ctx.stroke();
          ctx.fillStyle=`rgba(225,248,255,${ip*.58})`;
          ctx.beginPath();ctx.arc(hx+Math.cos(a)*r,hy+Math.sin(a)*r*.72,W*.009,0,Math.PI*2);ctx.fill();
        }
      });
    }
    break;
  }
  case 'heart':{
    if(p>=.3){
      const hp=(p-.3)/.7;
      ctx.save();ctx.shadowColor=col;ctx.shadowBlur=12;ctx.fillStyle=_hexA(col,.7*hp);
      _drawHeart(ctx,midX,midY-H*.06,W*.13*hp);ctx.restore();
      for(let i=0;i<3;i++){
        const lp=Math.max(0,(hp-.2-i*.16)/.52);if(lp<=0)continue;
        ctx.save();ctx.translate(midX+(i-1)*W*.16,midY-H*.05-H*.26*lp);
        ctx.globalAlpha=(1-lp)*.6;ctx.fillStyle=col;_drawHeart(ctx,0,0,W*.05);ctx.restore();
      }
    }
    break;
  }
  case 'portal':{
    if(p>=.14){
      const pp=(p-.14)/.86;
      ctx.save();ctx.shadowColor=col;ctx.shadowBlur=14;
      ctx.strokeStyle='rgba(255,145,0,.86)';ctx.lineWidth=W*.028;
      const cX=midX,cY=midY-H*.08;
      ctx.beginPath();ctx.arc(cX,cY,W*.22,-Math.PI*.5,-Math.PI*.5+Math.PI*2*pp);ctx.stroke();ctx.restore();
      for(let i=0;i<6;i++){
        const a=-Math.PI*.5+Math.PI*2*pp*(i/6);
        ctx.fillStyle=`rgba(255,160,40,${.78*pp})`;
        ctx.beginPath();ctx.arc(cX+Math.cos(a)*W*.22,cY+Math.sin(a)*W*.22,W*.01,0,Math.PI*2);ctx.fill();
      }
    }
    break;
  }
  case 'gauntlet':{
    const gemC=['#f00','#f80','#ff0','#0f0','#00f','#80f'];
    gemC.forEach((gc,i)=>{
      if(p>i*.14){
        const gp=Math.min((p-i*.14)/.18,1);
        const a=i*Math.PI*.33;
        const gx=lhx+Math.cos(a)*W*.055,gy=lhy+Math.sin(a)*W*.04;
        ctx.save();ctx.shadowColor=gc;ctx.shadowBlur=10;ctx.fillStyle=_hexA(gc,gp*.9);
        ctx.beginPath();ctx.arc(gx,gy,W*.02*gp,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    });
    if(p>=.78){
      const fp=(p-.78)/.22;
      const g=ctx.createRadialGradient(lhx,lhy,0,lhx,lhy,W*.28*fp);
      g.addColorStop(0,`rgba(255,150,50,${.48*fp})`);g.addColorStop(1,'rgba(255,100,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(lhx,lhy,W*.32*fp,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'vanish':{
    for(let i=0;i<8;i++){
      const a=p*Math.PI*2+i*Math.PI*.25;
      const r=W*(.1+.3*p);
      ctx.fillStyle=_hexA(col,(1-p)*.48);
      ctx.beginPath();ctx.arc(W*.5+Math.cos(a)*r,H*.5+Math.sin(a)*r*.55,W*.013,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'scream': case 'roar':{
    for(let i=0;i<4;i++){
      const r=W*(.1+i*.09+.13*ep);if(r<0)continue;
      ctx.strokeStyle=_hexA(col,(.45-i*.1)*(1-p*.4)*ep);ctx.lineWidth=W*.015;
      ctx.beginPath();ctx.arc(W*.5,H*.44,r,Math.PI*.58,Math.PI*2.42);ctx.stroke();
    }
    break;
  }
  case 'spin':{
    const pu=.5+.5*Math.sin(p*Math.PI*3);
    for(let i=2;i>=0;i--){
      const r=W*(.18+i*.09+.05*pu);
      const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,r);
      g.addColorStop(0,_hexA(col,0));g.addColorStop(.6,_hexA(col,.2*pu));g.addColorStop(1,_hexA(col,.1*pu));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*.5,H*.5,r,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'fire':{
    if(p>=.2){
      const fp=(p-.2)/.8;
      for(let f=0;f<12;f++){
        const a=(Math.random()-.5)*.5-Math.PI*.06;const r=W*(.06+.38*fp*Math.random());
        ctx.globalAlpha=.36*fp;ctx.fillStyle=`hsl(${18+Math.random()*22},100%,${52+Math.random()*22}%)`;
        ctx.beginPath();ctx.ellipse(lhx+Math.cos(a)*r,lhy+Math.sin(a)*r*.48,W*.026,W*.055,a,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    break;
  }
  case 'force':{
    if(p>=.22){
      const fp=(p-.22)/.78;
      const g=ctx.createRadialGradient(lhx,lhy,0,lhx,lhy,W*.2*fp);
      g.addColorStop(0,`rgba(100,220,100,${.6*fp})`);g.addColorStop(1,'rgba(0,180,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(lhx,lhy,W*.26*fp,0,Math.PI*2);ctx.fill();
    }
    break;
  }
  case 'vine':{
    if(p>=.1){
      const vp=(p-.1)/.9;
      ctx.strokeStyle=`rgba(30,160,30,${.8*vp})`;ctx.lineWidth=W*.036;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(lhx,lhy);
      ctx.quadraticCurveTo(lhx-W*.22*vp,lhy-H*.26*vp,lhx-W*.45*vp,lhy-H*.48*vp);ctx.stroke();
    }
    break;
  }
  case 'water':{
    if(p>=.2){
      const wp=(p-.2)/.8;
      for(let i=0;i<8;i++){
        const a=-Math.PI*.12+(i-3.5)*.038*wp;const r=W*(.07+.44*wp);
        ctx.strokeStyle=`rgba(50,160,255,${.56*wp})`;ctx.lineWidth=W*.02;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(lhx,lhy);ctx.lineTo(lhx+Math.cos(a)*r,lhy+Math.sin(a)*r*.44);ctx.stroke();
      }
    }
    break;
  }
  case 'slash':{
    if(p>=.4){
      const sp=(p-.4)/.6;
      for(let i=0;i<6;i++){
        const a=p*8+i*Math.PI*.33;const r=W*(.04+.1*sp);
        ctx.fillStyle=`rgba(255,220,100,${sp*.6})`;
        ctx.beginPath();ctx.arc(lhx+Math.cos(a)*r,lhy+Math.sin(a)*r,W*.009,0,Math.PI*2);ctx.fill();
      }
    }
    break;
  }
  default:{
    const pu=.4+.3*Math.sin(p*Math.PI*4);
    const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,W*.34);
    g.addColorStop(0,_hexA(col,0));g.addColorStop(1,_hexA(col,pu*.18));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(W*.5,H*.5,W*.36,0,Math.PI*2);ctx.fill();
    break;
  }
  }
}

// ── Boucle principale ────────────────────────────────────────────────────
const _PDUR=1300;
let _pRaf=null;

// ── Lookup table des sons de figurines ──
// Remplace une chaîne de 29 `else if`. Ajouter un son = ajouter une entrée.
// Clés alignées sur la propriété `sp` de FIG_CHAR_DATA.
const SOUND_MAP = {
  vader: _sndVader,
  hulk: _sndHulk,
  r2d2: _sndR2D2,
  chewie: _sndChewie,
  pika: _sndPika,
  robot_gd: _sndRobotGd,
  goldorak: _sndGoldorak,
  batman: _sndBatman,
  joker: _sndJoker,
  haddock: _sndHaddock,
  milou: _sndMilou,
  idefix: _sndIdefix,
  assurancetourix: _sndAssurancetourix,
  ladybug: _sndLadybug,
  chatnoir: _sndChatNoir,
  plagg: _sndPlagg,
  tikki: _sndTikki,
  farfeloups: _sndFarfeloups,
  olive: _sndOlive,
  becker: _sndBecker,
  cobra: _sndCobra,
  albator: _sndAlbator,
  tmnt: _sndTMNT,
  shredder: _sndShredder,
  sailormoon: _sndSailorMoon,
  bluey: _sndBluey,
  toothless: _sndToothless,
  dragon: _sndDragon,
  httyd: _sndHTTYD,
};

function playFullFigAnim(id,glowColor){
  const d=FIG_CHAR_DATA[id]; if(!d)return;
  // 1. Son / voix — lookup table (cf. SOUND_MAP ci-dessus)
  SOUND_MAP[d.sp]?.();
  if(d.v){const vd=d.sp?180:0;setTimeout(()=>_speak(d.v,d.p,d.r,d.g),vd);}
  // 2. Préparer bras SVG
  const chr=$('fv-chr');
  const svg=chr?chr.querySelector('svg'):null;
  if(svg)_ensureArms(svg,d.sk);
  // 3. Boucle
  if(_pRaf)cancelAnimationFrame(_pRaf);
  let startT=null;
  function loop(ts){
    if(!startT)startT=ts;
    const p=Math.min((ts-startT)/_PDUR,1);
    const pose=_poseAt(d.fn,p);
    if(svg)_applyPose(svg,id,pose);
    const cv=_getFXCanvas();
    if(cv)_drawFX(d.fn,p,cv,d.col||glowColor||'gold',id,pose);
    if(p<1)_pRaf=requestAnimationFrame(loop);
    else{if(cv){cv.getContext('2d').clearRect(0,0,cv.width,cv.height);}  _pRaf=null;}
  }
  _pRaf=requestAnimationFrame(loop);
  // 4. Animation iconique
  // animation iconique déjà gérée par la boucle
}

function _initFigArms(id){
  const d=FIG_CHAR_DATA[id]; if(!d)return;
  requestAnimationFrame(()=>{
    const chr=$('fv-chr');if(!chr)return;
    const svg=chr.querySelector('svg');if(!svg)return;
    _ensureArms(svg,d.sk);
    _applyPose(svg,id,_poseAt(d.fn,0));
  });
}


// ── Réinitialisation profil ───────────────────────────────
function resetProfile(playerName){
  if(!playerName)return;
  const msg=`Réinitialiser le profil de ${playerName} ? Cette action supprime toutes les étoiles, figurines, XP et badges. Elle est irréversible.`;
  if(!confirm(msg))return;
  localStorage.removeItem('user_'+playerName);
  toast(`✅ Profil de ${playerName} réinitialisé !`);
  // Si c'est le joueur actif, recharger
  if(P&&P.name===playerName){
    loadProfile();updateHUD();renderSkills();renderBadges();renderQuests();
  }
  renderResetZone();
}
function renderResetZone(){
  const z=$('reset-zone');if(!z)return;
  // Utiliser KNOWN (liste fixe) + le joueur custom si existant
  const knownPlayers=typeof KNOWN!=='undefined'?KNOWN:['Soren','Peyo','Tomi','Maman','Papa'];
  const custom=localStorage.getItem('customPlayerName');
  const players=[...knownPlayers,...(custom&&!knownPlayers.includes(custom)?[custom]:[])];
  z.innerHTML=players.map(name=>{
    let stars=0,figs=0,lvl=1;
    try{const p=JSON.parse(localStorage.getItem('user_'+name)||'null');
      if(p){stars=p.stars||0;figs=(p.ownedFigurines||[]).length;lvl=p.xp?Math.floor(p.xp/100)+1:1;}
    }catch(e){}
    const enc=encodeURIComponent(name);
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin:4px 0;background:rgba(255,255,255,.08);border-radius:10px;gap:8px;">'
      +'<div style="text-align:left;flex:1;">'
      +'<div style="font-weight:700;font-size:.9em;">'+esc(name)+'</div>'
      +'<div style="font-size:.72em;color:#bdc3c7;">Niv.'+lvl+' · '+stars+' étoiles · '+figs+' figurines</div>'
      +'</div>'
      +'<button data-pname="'+enc+'" onclick="resetProfile(decodeURIComponent(this.dataset.pname))" style="background:#c0392b;color:#fff;padding:8px 14px;font-size:.82em;font-weight:700;border-radius:8px;white-space:nowrap;border:2px solid #ff6b6b;">&#128465; Reset</button>'
      +'</div>';
  }).join('');
}
