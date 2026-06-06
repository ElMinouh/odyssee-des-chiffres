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
 return _matBase(level, { consigne:`Il y en a ${have}. Combien en ajouter pour faire ${target} ?`, visuelHtml:_matCollectionHtml(obj,have), choices:_matChoicesNum(need, target), res:need });
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
 PS: [_matCombien, _matDie, _matDoigts, _matPareil, _matPlusGrand, _matPlusPetit, _matDonne, _matForme, _matGrandeur, _matIntrus, _matSuite],
 MS: [_matCombien, _matDie, _matDoigts, _matTenFrame, _matDomino, _matFlash, _matDecompose, _matAssocie, _matPlusGrand, _matPlusPetit, _matDonne, _matForme, _matGrandeur, _matIntrus, _matSuite, _matNombreManque, _matRanger, _matChiffre, _matChiffreColl],
 GS: [_matCombien, _matDie, _matTenFrame, _matDomino, _matComplement, _matAddition, _matRetrait, _matApres, _matAssocie, _matSuite, _matIntrus, _matProbleme, _matForme, _matGrandeur, _matNombreManque, _matRanger, _matChiffre, _matChiffreColl, _matPartage],
};
function _matGen(level){
 const pool = _MAT_POOL[level] || _MAT_POOL.PS;
 const phase = (typeof _progPhase==='function') ? _progPhase(level) : 3;
 let avail = pool.filter(f => ((f && f.ph) || 1) <= phase);
 if(!avail.length) avail = pool;
 return avail[ri(0, avail.length-1)](level);
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
 if(typeof GS!=='undefined') GS.matFirstTry = true;

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
  qcm.classList.toggle('mat-row', !!q.row);
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
 if(typeof speak === 'function'){
  const intro = (typeof GS!=='undefined' && GS.qCount===1 && typeof _matWelcomeText==='function') ? _matWelcomeText(q.level)+' ' : '';
  const full = intro + q.consigne;
  speak(full);
  _matSpeakAnim(full);
 }
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
 // Bilan parent : compter la question (et le succès du premier coup)
 if(typeof P!=='undefined' && typeof GM!=='undefined' && typeof _isMaternelle==='function' && _isMaternelle(GM.level)){
  P.matStats = P.matStats || {};
  const st = P.matStats[GM.level] = (P.matStats[GM.level] || {ok:0,total:0});
  st.total++; if(typeof GS!=='undefined' && GS.matFirstTry !== false) st.ok++;
  if(typeof saveProfile==='function') saveProfile();
 }
}

// Bilan imagé pour le parent (injecté dans le rapport de l'espace parent)
function _matBilanHtml(d){
 const st = d && d.matStats; if(!st) return '';
 const worlds = [['PS','🐟 Petite section'],['MS','🐤 Moyenne section'],['GS','🌸 Grande section']];
 const rows = worlds.filter(([k]) => st[k] && st[k].total > 0).map(([k,name]) => {
  const s = st[k]; const pct = Math.round((s.ok / s.total) * 100);
  const appr = pct>=80 ? '🌟 très à l\'aise' : pct>=50 ? '🙂 en progrès' : '🌱 à encourager';
  return `<div class="lb-row"><span>${name}</span><span>${s.total} questions · ${pct}% du 1er coup · ${appr}</span></div>`;
 });
 if(!rows.length) return '';
 return `<div style="margin-top:10px;padding:8px;background:rgba(123,119,221,.18);border-radius:8px;"><strong style="color:#c8c2ff;">🐣 Maternelle</strong><div style="margin-top:6px;">${rows.join('')}</div></div>`;
}

// ═══════════════════ NOUVEAUX EXERCICES (lot v9.2) ═══════════════════
// Choix avec un plafond explicite (utile quand n dépasse w.max : ten-frame, doigts, domino)
function _matChoicesAt(n, cap, level, w){
 return _matDistractors(n, cap, 3).map(val=>({val, html:(level==='GS')?_matNumHtml(val):_matDotsHtml(val, w.accent)}));
}

// ── Cadre à dix (ten-frame) ─────────────────────────────────────────
function _matTenFrameHtml(n){
 let c=''; for(let i=0;i<10;i++){ c += `<span class="mat-tf-cell">${i<n?'<span class="mat-tf-dot"></span>':''}</span>`; }
 return `<div class="mat-tenframe">${c}</div>`;
}
function _matTenFrame(level){
 const w=_MAT_WORLDS[level]; const cap=(level==='GS')?10:(level==='MS')?6:5; const n=ri(1,cap);
 return _matBase(level,{ consigne:`Combien de cases sont remplies ?`, visuelHtml:_matTenFrameHtml(n), choices:_matChoicesAt(n,cap,level,w), res:n });
}

// ── Doigts de la main ───────────────────────────────────────────────
function _matHandHtml(n){
 // 4 doigts (index→auriculaire) levés d'abord (1→4), le pouce opposable complète à 5.
 const fingersUp=Math.min(n,4); const thumbUp=n>=5; let f='';
 for(let i=0;i<4;i++){ f += `<span class="mat-finger f${i+1} ${i<fingersUp?'up':'down'}"></span>`; }
 return `<div class="mat-hand"><span class="mat-thumb ${thumbUp?'up':'down'}"></span><div class="mat-fingers">${f}</div><div class="mat-palm"></div></div>`;
}
function _matDoigts(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,5);
 return _matBase(level,{ consigne:`Combien de doigts sont levés ?`, visuelHtml:`<div class="mat-collection">${_matHandHtml(n)}</div>`, choices:_matChoicesAt(n,5,level,w), res:n });
}

// ── Dominos (deux constellations à additionner) ─────────────────────
function _matDominoHtml(a,b){ return `<div class="mat-domino">${_matDieFaceHtml(a)}<span class="mat-domino-bar"></span>${_matDieFaceHtml(b)}</div>`; }
function _matDomino(level){
 const w=_MAT_WORLDS[level]; const a=ri(1,3), b=ri(1,3); const res=a+b;
 return _matBase(level,{ consigne:`Combien de points en tout ?`, visuelHtml:`<div class="mat-collection">${_matDominoHtml(a,b)}</div>`, choices:_matChoicesAt(res,6,level,w), res });
}

// ── Le rang (fonction ordinale) ─────────────────────────────────────
const _MAT_ORD = {1:'premier',2:'deuxième',3:'troisième',4:'quatrième'};
function _matRang(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const len=3; const k=ri(1,len);
 const o=_MAT_OBJ[obj]||{s:'objet',g:'m'};
 const label = (k===len) ? 'dernier' : (_MAT_ORD[k]||(k+'ᵉ'));
 const consigne = `Touche le ${label} ${o.s}.`;
 const choices = []; for(let p=1;p<=len;p++){ choices.push({val:p, html:_matCollectionHtml(obj,1)}); }
 return _matBase(level,{ row:true, consigne, visuelHtml:'', choices, res:k });
}

// ── Reconnaître les formes ──────────────────────────────────────────
const _MAT_SHAPES = [{id:'rond',n:'rond'},{id:'carre',n:'carré'},{id:'triangle',n:'triangle'}];
function _matShapeHtml(id){ return `<div class="mat-collection"><span class="mat-shape mat-shape-${id}"></span></div>`; }
function _matForme(level){
 const target=_MAT_SHAPES[ri(0,_MAT_SHAPES.length-1)];
 const opts=shuffle(_MAT_SHAPES.slice());
 const choices=opts.map((s,i)=>({val:i, html:_matShapeHtml(s.id)}));
 const res=opts.findIndex(s=>s.id===target.id);
 return _matBase(level,{ consigne:`Touche le ${target.n}.`, visuelHtml:'', choices, res });
}

// ── Les suites à motifs (algorithmes) ───────────────────────────────
function _matSuite(level){
 const w=_MAT_WORLDS[level]; const a=_matObj(w); let b=_matObj(w); let g=0; while(b===a && g++<12) b=_matObj(w);
 const period=[['A','B'],['A','A','B'],['A','B','B']][ri(0,2)];
 const shown=5; const map={A:a,B:b}; const seq=[];
 for(let i=0;i<shown;i++) seq.push(period[i%period.length]);
 const nextSym=period[shown%period.length];
 const visuel=`<div class="mat-suite-row">${seq.map(s=>`<span class="mat-suite-item">${map[s]}</span>`).join('')}<span class="mat-suite-q">?</span></div>`;
 const choices=shuffle([{val:0,html:_matCollectionHtml(a,1)},{val:1,html:_matCollectionHtml(b,1)}]);
 return _matBase(level,{ consigne:`Qu'est-ce qui vient après ?`, visuelHtml:visuel, choices, res:(nextSym==='A'?0:1) });
}

// ── L'intrus ────────────────────────────────────────────────────────
function _matIntrus(level){
 const w=_MAT_WORLDS[level]; const main=_matObj(w); let intr=_matObj(w); let g=0; while(intr===main && g++<12) intr=_matObj(w);
 const len=ri(3,4); const pos=ri(0,len-1); const arr=[];
 for(let i=0;i<len;i++) arr.push(i===pos?intr:main);
 const choices=arr.map((o,i)=>({val:i, html:_matCollectionHtml(o,1)}));
 return _matBase(level,{ consigne:`Touche celui qui n'est pas comme les autres.`, visuelHtml:'', choices, res:pos });
}

// ── Problèmes racontés par Étincelle ────────────────────────────────
function _matProbleme(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const o=_MAT_OBJ[obj]||{p:'objets'};
 if(ri(0,1)){ const a=ri(1,5), b=ri(1,Math.min(5,10-a)); const res=a+b;
  return _matBase(level,{ opKey:'+', consigne:`Étincelle voit ${a} ${o.p}. Il en arrive ${b} de plus. Combien en tout ?`, visuelHtml:`<div class="mat-collection mat-op">${_matObjsRaw(obj,a)}<span class="mat-op-sign">＋</span>${_matObjsRaw(obj,b)}</div>`, choices:_matChoicesNum(res,10), res }); }
 const a=ri(3,9), b=ri(1,a-1); const res=a-b;
 return _matBase(level,{ opKey:'-', consigne:`Il y a ${a} ${o.p}. ${b} s'en vont. Combien en reste-t-il ?`, visuelHtml:`<div class="mat-collection mat-op">${_matObjsRaw(obj,a-b)}${_matObjsCrossed(obj,b)}</div>`, choices:_matChoicesNum(res,10), res });
}

// ── Voix d'accueil d'Étincelle (1ère question d'une partie) ─────────
function _matWelcomeText(level){
 const hi=['Coucou, je suis Étincelle !','Bonjour, c\'est moi, Étincelle !','Salut ! Étincelle est là !'][ri(0,2)];
 return hi+' On compte ensemble ?';
}

// ═══════════════════ EXERCICES (lot v9.2.1) ═══════════════════
// ── Le nombre qui manque (bande numérique : 1, 2, _, 4) ─────────────
function _matNombreManque(level){
 const w=_MAT_WORLDS[level]; const span=(level==='GS')?7:4; const start=ri(1, Math.max(1,(level==='GS'?6:3)));
 const len=4; const seq=[]; for(let i=0;i<len;i++) seq.push(start+i);
 const hole=ri(1,len-2); const res=seq[hole];
 const cells=seq.map((v,i)=> i===hole ? `<span class="mat-band-cell mat-band-hole">?</span>` : `<span class="mat-band-cell">${v}</span>`).join('');
 return _matBase(level,{ consigne:`Quel nombre manque ?`, visuelHtml:`<div class="mat-band">${cells}</div>`, choices:_matChoicesNum(res, start+len), res });
}

// ── Ranger du plus petit au plus grand (choisir la rangée bien rangée) ──
function _matRowHtml(arr,obj){ return `<div class="mat-collection mat-rowtas">${arr.map(k=>`<span class="mat-tas">${_matObjsRaw(obj,k)}</span>`).join('')}</div>`; }
function _matRanger(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const vals=_matDistinct(1,4,3);
 const sorted=[...vals].sort((a,b)=>a-b); const perms=[]; let g=0;
 while(perms.length<2 && g++<40){ const p=shuffle([...vals]); if(p.join()!==sorted.join() && !perms.some(x=>x.join()===p.join())) perms.push(p); }
 const all=shuffle([sorted,...perms]); const res=all.findIndex(a=>a.join()===sorted.join());
 const choices=all.map((arr,i)=>({val:i, html:_matRowHtml(arr,obj)}));
 return _matBase(level,{ consigne:`Touche la rangée du plus petit au plus grand.`, visuelHtml:'', choices, res });
}

// ── Comparer des grandeurs (taille, pas quantité) ───────────────────
function _matGrandeur(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const o=_MAT_OBJ[obj]||{s:'objet'};
 const sizes=shuffle([1.4,2.1,2.9]).slice(0,3); const big=ri(0,1);
 const target=big?Math.max(...sizes):Math.min(...sizes);
 const choices=sizes.map((sz,i)=>({val:i, html:`<div class="mat-collection"><span class="mat-obj" style="font-size:${sz}em;animation:none;">${obj}</span></div>`}));
 return _matBase(level,{ consigne: big?`Touche le plus grand ${o.s}.`:`Touche le plus petit ${o.s}.`, visuelHtml:'', choices, res:sizes.indexOf(target) });
}

// ── Reconnaître le chiffre écrit (« Touche le 3 ») ──────────────────
function _matChiffre(level){
 const max=(level==='GS')?9:6; const n=ri(1,max);
 const choices=_matDistractors(n,max,3).map(v=>({val:v, html:_matNumHtml(v)}));
 return _matBase(level,{ consigne:`Touche le ${n}.`, visuelHtml:'', choices, res:n });
}

// ── Chiffre → collection (on montre « 4 », choisir le bon tas) ───────
function _matChiffreColl(level){
 const w=_MAT_WORLDS[level]; const n=ri(1,w.max); const obj=_matObj(w);
 return _matBase(level,{ consigne:`Touche le tas qui montre ce chiffre.`, visuelHtml:`<div class="mat-collection"><span class="mat-num mat-num-big">${n}</span></div>`, choices:_matChoicesColl(n,w,obj), res:n });
}

// ── Le partage équitable (GS) ───────────────────────────────────────
function _matPartage(level){
 const w=_MAT_WORLDS[level]; const obj=_matObj(w); const o=_MAT_OBJ[obj]||{p:'objets'};
 const friends=ri(2,3); const per=ri(2,4); const total=friends*per;
 return _matBase(level,{ consigne:`Partage ${total} ${o.p} entre ${friends} amis. Combien chacun ?`, visuelHtml:_matCollectionHtml(obj,total), choices:_matChoicesNum(per, total), res:per });
}

// ── Animation « Étincelle parle » : rebond vif pendant la lecture vocale ──
let _matSpeakT = null;
function _matSpeakAnim(text){
 const ma = $('monster-area'); if(!ma) return;
 ma.classList.add('mat-speaking');
 const dur = Math.min(7000, Math.max(1300, String(text).length * 85));
 clearTimeout(_matSpeakT);
 _matSpeakT = setTimeout(()=>{ ma.classList.remove('mat-speaking'); }, dur);
}

// ── P9 : phase pédagogique de chaque exercice maternelle (1=début, 2=milieu, 3=fin) ──
(function(){
 const PH={
  _matCombien:1,_matDie:1,_matDoigts:1,_matPareil:1,_matPlusGrand:1,_matPlusPetit:1,
  _matForme:1,_matGrandeur:1,_matChiffre:1,
  _matSuite:2,_matIntrus:2,_matDonne:2,_matTenFrame:2,_matDomino:2,_matFlash:2,
  _matAssocie:2,_matRanger:2,_matChiffreColl:2,_matApres:2,_matAddition:2,_matNombreManque:2,
  _matDecompose:3,_matComplement:3,_matRetrait:3,_matProbleme:3,_matPartage:3
 };
 for(const name in PH){ try{ const f=eval(name); if(typeof f==='function') f.ph=PH[name]; }catch(e){} }
})();
