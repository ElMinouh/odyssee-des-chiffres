// ═══════════════════════════════════════════════════════════════════
// 13-maternelle.js — Mode MATERNELLE (PS / MS / GS)  [chantier M-A]
// Réponses 100% visuelles en PS/MS (aucun chiffre à lire), chiffres en GS.
// Trois mondes : PS = océan · MS = ferme · GS = jardin + ciel.
// Mascotte fil rouge : « Étincelle », la petite étoile, qui suit l'enfant.
// Conçu data-driven et ADDITIF : n'altère aucun mode existant.
// ═══════════════════════════════════════════════════════════════════

// MATERNELLE_LEVELS est défini dans 05-profile.js (chargé avant ce module)
function _isMaternelle(lvl){ return (typeof MATERNELLE_LEVELS!=='undefined') && MATERNELLE_LEVELS.indexOf(lvl) !== -1; }

// ── Les trois mondes ────────────────────────────────────────────────
// accent = couleur fil rouge du monde (halo d'Étincelle, cadres, points)
const _MAT_WORLDS = {
 PS: {
  name:'Petite section', world:"L'océan tout doux",
  accent:'#1d9e75', soft:'#e1f5ee', sky:'linear-gradient(180deg,#bdeadd 0%,#d8f3ec 100%)',
  objs:['🐟','🐠','🐡','🐙','🦀','🐚','🐬'],
  mascot:'⭐', mascotLabel:'Étincelle, l\'étoile de mer',
  max:3,
 },
 MS: {
  name:'Moyenne section', world:'La ferme câline',
  accent:'#ba7517', soft:'#faeeda', sky:'linear-gradient(180deg,#fbe7bf 0%,#fdf3df 100%)',
  objs:['🐤','🐥','🥚','🐑','🐄','🐖','🍎','🌻'],
  mascot:'⭐', mascotLabel:'Étincelle, l\'étoile du matin',
  max:5,
 },
 GS: {
  name:'Grande section', world:'Le jardin étoilé',
  accent:'#534ab7', soft:'#eeedfe', sky:'linear-gradient(180deg,#cfc8f0 0%,#e7e3fb 100%)',
  objs:['🌸','🌼','🦋','🍄','⭐','🌙','☁️','🐞'],
  mascot:'⭐', mascotLabel:'Étincelle, l\'étoile filante',
  max:10,
 },
};

// Objets : pluriel (p), singulier (s), genre (g) — pour accorder « un/une » et le nombre
const _MAT_OBJ = {
 '🐟':{p:'poissons',s:'poisson',g:'m'},'🐠':{p:'poissons',s:'poisson',g:'m'},'🐡':{p:'poissons',s:'poisson',g:'m'},
 '🐙':{p:'poulpes',s:'poulpe',g:'m'},'🦀':{p:'crabes',s:'crabe',g:'m'},'🐚':{p:'coquillages',s:'coquillage',g:'m'},'🐬':{p:'dauphins',s:'dauphin',g:'m'},
 '🐤':{p:'poussins',s:'poussin',g:'m'},'🐥':{p:'poussins',s:'poussin',g:'m'},'🥚':{p:'œufs',s:'œuf',g:'m'},'🐑':{p:'moutons',s:'mouton',g:'m'},'🐄':{p:'vaches',s:'vache',g:'f'},'🐖':{p:'cochons',s:'cochon',g:'m'},'🍎':{p:'pommes',s:'pomme',g:'f'},'🌻':{p:'tournesols',s:'tournesol',g:'m'},
 '🌸':{p:'fleurs',s:'fleur',g:'f'},'🌼':{p:'fleurs',s:'fleur',g:'f'},'🦋':{p:'papillons',s:'papillon',g:'m'},'🍄':{p:'champignons',s:'champignon',g:'m'},'⭐':{p:'étoiles',s:'étoile',g:'f'},'🌙':{p:'lunes',s:'lune',g:'f'},'☁️':{p:'nuages',s:'nuage',g:'m'},'🐞':{p:'coccinelles',s:'coccinelle',g:'f'},
};
function _matObjName(e){ return _MAT_OBJ[e] ? _MAT_OBJ[e].p : 'objets'; }
// Quantité accordée : « une fleur » / « un poisson » / « 3 fleurs »
function _matQty(n, e){
 const o=_MAT_OBJ[e]; if(!o) return n+' objets';
 if(n===1) return (o.g==='f'?'une ':'un ')+o.s;
 return n+' '+o.p;
}
// Élision : « de poissons » mais « d'œufs », « d'étoiles »
function _matDe(name){ return /^[aeiouyéèêàâîïôûœh]/i.test(name) ? "d'"+name : "de "+name; }

// ── Petits utilitaires de rendu visuel ──────────────────────────────
// Les objets bruts (sans conteneur)
function _matObjsRaw(obj, n){ let s=''; for(let i=0;i<n;i++) s += `<span class="mat-obj">${obj}</span>`; return s; }
function _matObjsCrossed(obj, n){ let s=''; for(let i=0;i<n;i++) s += `<span class="mat-obj mat-obj-gone">${obj}</span>`; return s; }
// Une collection de N objets identiques (l'énoncé à dénombrer)
function _matCollectionHtml(obj, n){ return `<div class="mat-collection">${_matObjsRaw(obj,n)}</div>`; }
// Une « carte à points » (constellation) représentant une quantité — réponse PS/MS
function _matDotsHtml(k, accent){
 let s = '';
 for(let i=0;i<k;i++) s += `<span class="mat-dot" style="background:${accent}"></span>`;
 return `<div class="mat-dots">${s}</div>`;
}
// Un chiffre — réponse GS
function _matNumHtml(v){ return `<span class="mat-num">${v}</span>`; }

// ── Construction des réponses ───────────────────────────────────────
function _matDistractors(n, max, count){
 const set = new Set([n]);
 let guard = 0;
 while(set.size < count && guard++ < 80){
  const d = n + [-2,-1,1,2][ri(0,3)];
  if(d >= 1 && d <= max) set.add(d);
 }
 let v = 1; while(set.size < count && v <= max){ set.add(v); v++; }
 return shuffle([...set]).slice(0, count);
}
function _matDistinct(min, max, count){
 const pool=[]; for(let i=min;i<=max;i++) pool.push(i);
 return shuffle(pool).slice(0, Math.min(count, pool.length));
}
function _matObj(w){ return w.objs[ri(0, w.objs.length-1)]; }
// Réponses : cartes à points (PS/MS), chiffres, ou collections d'objets
function _matChoicesDots(n, w){ return _matDistractors(n, w.max, 3).map(val=>({val, html:_matDotsHtml(val, w.accent)})); }
function _matChoicesNum(n, max, count){ return _matDistractors(n, max, count||3).map(val=>({val, html:_matNumHtml(val)})); }
function _matChoicesColl(n, w, obj){ const mx=Math.max(w.max, n+1); return _matDistractors(n, mx, 3).map(val=>({val, html:_matCollectionHtml(obj, val)})); }
// En PS/MS les réponses chiffrées sont remplacées par des points (sauf « associe »)
function _matAutoChoices(n, level){ const w=_MAT_WORLDS[level]; return (level==='GS') ? _matChoicesNum(n, Math.max(10,w.max)) : _matChoicesDots(n, w); }

// ════════════ CATALOGUE D'EXERCICES (chaque fonction → une question) ════════════
function _matBase(level, extra){ return Object.assign({ maternelle:true, level, type:'mat', opKey:'mat', img:'' }, extra); }

// « Combien ? » — dénombrer une collection
function _matCombien(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,w.max); const obj=_matObj(w);
 return _matBase(level, { consigne:`Combien ${_matDe(_matObjName(obj))} y a-t-il ?`, visuelHtml:_matCollectionHtml(obj,n), choices:_matAutoChoices(n,level), res:n });
}
// Carton-éclair — la collection apparaît brièvement puis se cache (subitizing)
function _matFlash(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,Math.min(w.max,5)); const obj=_matObj(w);
 return _matBase(level, { flash:true, flashMs:3000, consigne:`Regarde bien... Combien ${_matDe(_matObjName(obj))} ?`, visuelHtml:_matCollectionHtml(obj,n), choices:_matAutoChoices(n,level), res:n });
}
// « Trouve autant » — choisir la collection qui a autant que les points montrés
function _matPareil(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,w.max); const obj=_matObj(w);
 return _matBase(level, { consigne:`Touche le tas qui en a autant.`, visuelHtml:`<div class="mat-collection">${_matDotsHtml(n,w.accent)}</div>`, choices:_matChoicesColl(n,w,obj), res:n });
}
// « Le plus grand tas » — comparaison de quantités
function _matPlusGrand(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const vals=_matDistinct(1,w.max,3); const res=Math.max(...vals);
 return _matBase(level, { consigne:`Touche le plus grand tas de ${_matObjName(obj)}.`, visuelHtml:'', choices: vals.map(v=>({val:v, html:_matCollectionHtml(obj,v)})), res });
}
// « Le plus petit tas »
function _matPlusPetit(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const vals=_matDistinct(1,w.max,3); const res=Math.min(...vals);
 return _matBase(level, { consigne:`Touche le plus petit tas de ${_matObjName(obj)}.`, visuelHtml:'', choices: vals.map(v=>({val:v, html:_matCollectionHtml(obj,v)})), res });
}
// « Donne-moi N » — le nombre est dit, choisir la bonne collection
function _matDonne(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const n=ri(1,w.max);
 return _matBase(level, { consigne:`Touche le tas qui a ${_matQty(n,obj)}.`, visuelHtml:'', choices:_matChoicesColl(n,w,obj), res:n });
}
// « Complète » (MS) — combien en ajouter pour atteindre le total
function _matDecompose(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const total=ri(3,w.max); const have=ri(1,total-1); const need=total-have;
 return _matBase(level, { consigne:`Il en faut ${total}. Combien en ajouter ?`, visuelHtml:_matCollectionHtml(obj,have), choices:_matAutoChoices(need,level), res:need });
}
// « Associe » (MS) — collection → bon chiffre
function _matAssocie(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,w.max); const obj=_matObj(w);
 return _matBase(level, { consigne:`Quel chiffre va avec ce tas ?`, visuelHtml:_matCollectionHtml(obj,n), choices:_matChoicesNum(n, Math.max(6,w.max)), res:n });
}
// « Complément à 5 / à 10 » (GS)
function _matComplement(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const target=[5,10][ri(0,1)]; const have=ri(1,target-1); const need=target-have;
 return _matBase(level, { consigne:`Il y en a ${have}. Combien pour faire ${target} ?`, visuelHtml:_matCollectionHtml(obj,have), choices:_matChoicesNum(need, target), res:need });
}
// « Addition » (GS) — a et b, combien en tout
function _matAddition(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const a=ri(1,5); const b=ri(1,Math.min(5,10-a)); const res=a+b;
 return _matBase(level, { opKey:'+', consigne:`${a} et encore ${b}, combien en tout ?`, visuelHtml:`<div class="mat-collection mat-op">${_matObjsRaw(obj,a)}<span class="mat-op-sign">＋</span>${_matObjsRaw(obj,b)}</div>`, choices:_matChoicesNum(res,10), res });
}
// « Retrait » (GS) — on en enlève
function _matRetrait(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const a=ri(3,9); const b=ri(1,a-1); const res=a-b;
 return _matBase(level, { opKey:'-', consigne:`Il y a ${a} ${_matObjName(obj)}, on en enlève ${b}. Combien reste-t-il ?`, visuelHtml:`<div class="mat-collection mat-op">${_matObjsRaw(obj,a-b)}${_matObjsCrossed(obj,b)}</div>`, choices:_matChoicesNum(res,10), res });
}
// « Nombre d'avant / d'après » (GS) — suite numérique
function _matApres(level){
 const before=ri(0,1); const n=before?ri(2,10):ri(1,9); const res=before?n-1:n+1;
 return _matBase(level, { consigne: before?`Quel nombre vient juste avant ${n} ?`:`Quel nombre vient juste après ${n} ?`, visuelHtml:`<div class="mat-suite"><span class="mat-num mat-num-big">${n}</span></div>`, choices:_matChoicesNum(res,10), res });
}

// « Le dé » — lire une constellation classique du dé (motif organisé / subitizing)
const _DIE_POS = {1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,4,7,3,6,9]};
function _matDieFaceHtml(n){
 const pos=_DIE_POS[n]||[5]; let cells='';
 for(let i=1;i<=9;i++){ cells += `<span class="mat-die-cell">${pos.indexOf(i)>=0?'<span class="mat-die-pip"></span>':''}</span>`; }
 return `<div class="mat-die">${cells}</div>`;
}
function _matDie(level){
 const w=_MAT_WORLDS[level]; const max=Math.min(w.max,6); const n=ri(1,max);
 return _matBase(level, { consigne:`Combien de points sur le dé ?`, visuelHtml:`<div class="mat-collection">${_matDieFaceHtml(n)}</div>`, choices:_matAutoChoices(n,level), res:n });
}

// ── Pools par niveau & dispatchers ──────────────────────────────────
const _MAT_POOL = {
 PS: [_matCombien, _matCombien, _matDie, _matPareil, _matPlusGrand, _matPlusPetit, _matDonne],
 MS: [_matCombien, _matDie, _matFlash, _matDecompose, _matAssocie, _matPlusGrand, _matPlusPetit, _matDonne],
 GS: [_matCombien, _matDie, _matComplement, _matAddition, _matRetrait, _matApres, _matAssocie],
};
function _matGen(level){
 const pool = _MAT_POOL[level] || _MAT_POOL.PS;
 return pool[ri(0, pool.length-1)](level);
}
function genQ_PS(){ return _matGen('PS'); }
function genQ_MS(){ return _matGen('MS'); }
function genQ_GS(){ return _matGen('GS'); }

// Branchement dans le moteur de questions (GEN est défini dans 04-questions.js)
if(typeof GEN !== 'undefined'){
 GEN.PS = genQ_PS;
 GEN.MS = genQ_MS;
 GEN.GS = genQ_GS;
}

// ── Rendu visuel d'une question maternelle (appelé par renderQ) ──────
// Remplit la zone de jeu en mode « image cliquable », sans pavé ni chrono.
function _matRenderQ(q){
 const w = _MAT_WORLDS[q.level] || _MAT_WORLDS.PS;

 // Étincelle, déclinée par monde (halo coloré), à la place du « monstre »
 const ma = $('monster-area');
 if(ma){
  ma.className = '';
  ma.textContent = w.mascot;
  ma.style.setProperty('--mat-accent', w.accent);
  ma.classList.add('mat-mascot');
 }

 // Consigne (lisible + lue à voix haute)
 const qEl = $('question');
 if(qEl){ qEl.className = 'mat-consigne'; qEl.innerText = q.consigne; }

 // Énoncé visuel : la collection à dénombrer
 const pi = $('problem-image');
 if(pi){
  pi.innerHTML = q.visuelHtml || '';
  if(q.flash){
   pi.classList.add('mat-flash-on');
   setTimeout(()=>{ if(typeof GS!=='undefined' && GS.q===q && pi){ pi.classList.remove('mat-flash-on'); pi.innerHTML='<div class="mat-flash-hidden">👀</div>'; } }, q.flashMs||1500);
  } else {
   pi.classList.remove('mat-flash-on');
  }
 }

 // Réponses cliquables (images en PS/MS, chiffres en GS)
 const qcm = $('qcm-options');
 if(qcm){
  qcm.classList.remove('hidden');
  qcm.classList.add('mat-choices');
  qcm.innerHTML = q.choices
   .map(c => { const kind = c.html.indexOf('mat-collection')>=0?'coll':(c.html.indexOf('mat-dots')>=0?'dots':'num');
    return `<button class="qcm-btn mat-choice mat-choice-${kind}" data-val="${c.val}">${c.html}</button>`; })
   .join('');
  qcm.onclick = (e) => { const b = e.target.closest('.qcm-btn'); if(b && !b.disabled) validate(+b.dataset.val); };
 }
 // Cacher le pavé / la zone de saisie
 const iz = $('input-zone'); if(iz) iz.classList.add('hidden');

 // Titre doux, sans « monstre »
 const qt = $('quest-title');
 if(qt) qt.innerHTML = `⭐ ${GS.qCount}/6 <span class="mode-badge m-mat">${w.world}</span>`;

 // Cacher tout ce qui relève du « combat » (pas de pression en maternelle)
 ['timer-bar-container','monster-hp-wrap','power-bar','combat-bar'].forEach(id=>{
  const el=document.getElementById(id); if(el) el.classList.add('hidden');
 });

 // Lecture de la consigne
 const fb = $('feedback'); if(fb) fb.innerText = '';
 if(typeof speak === 'function') speak(q.consigne);
}

// Applique l'ambiance maternelle à l'écran de jeu (fond doux) / la retire
function _matApplyAmbiance(level){
 const gc = document.getElementById('v-game') || document.body;
 const card = document.getElementById('game-card') || gc;
 if(_isMaternelle(level)){
  const w = _MAT_WORLDS[level];
  document.body.classList.add('mat-mode');
  document.body.style.setProperty('--mat-accent', w.accent);
  document.body.style.setProperty('--mat-soft', w.soft);
 } else {
  document.body.classList.remove('mat-mode');
 }
}

// ── Félicitations d'Étincelle (bonne réponse) ───────────────────────
const _MAT_BRAVO = ['Bravo','Super','Génial','Bien joué','Youpi','Tu as réussi','Magnifique','Trop bien','Parfait'];
function _matCelebrate(){
 const fb=$('feedback');
 const msg=_MAT_BRAVO[ri(0,_MAT_BRAVO.length-1)];
 if(fb){ fb.style.color='#f1c40f'; fb.innerText='⭐ '+msg+' !'; }
 if(typeof speak==='function') speak(msg);
}
