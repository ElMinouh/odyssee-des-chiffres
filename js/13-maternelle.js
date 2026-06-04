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
  objs:['🐟','🐠','🐡','🐙','🦀','🐚','🐬','🫧'],
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

// Noms (pluriel) pour la consigne lue à voix haute
const _MAT_OBJ_NAME = {
 '🐟':'poissons','🐠':'poissons','🐡':'poissons','🐙':'poulpes','🦀':'crabes','🐚':'coquillages','🐬':'dauphins','🫧':'bulles',
 '🐤':'poussins','🐥':'poussins','🥚':'œufs','🐑':'moutons','🐄':'vaches','🐖':'cochons','🍎':'pommes','🌻':'tournesols',
 '🌸':'fleurs','🌼':'fleurs','🦋':'papillons','🍄':'champignons','⭐':'étoiles','🌙':'lunes','☁️':'nuages','🐞':'coccinelles',
};
function _matObjName(e){ return _MAT_OBJ_NAME[e] || 'objets'; }

// ── Petits utilitaires de rendu visuel ──────────────────────────────
// Une collection de N objets identiques (l'énoncé à dénombrer)
function _matCollectionHtml(obj, n){
 let s = '';
 for(let i=0;i<n;i++) s += `<span class="mat-obj">${obj}</span>`;
 return `<div class="mat-collection">${s}</div>`;
}
// Une « carte à points » (constellation) représentant une quantité — réponse PS/MS
function _matDotsHtml(k, accent){
 let s = '';
 for(let i=0;i<k;i++) s += `<span class="mat-dot" style="background:${accent}"></span>`;
 return `<div class="mat-dots">${s}</div>`;
}
// Un chiffre — réponse GS
function _matNumHtml(v){ return `<span class="mat-num">${v}</span>`; }

// Construit les réponses : points en PS/MS, chiffres en GS
function _matChoices(n, level){
 const w = _MAT_WORLDS[level];
 const set = new Set([n]);
 let guard = 0;
 while(set.size < 3 && guard++ < 60){
  const d = n + [-2,-1,1,2][ri(0,3)];
  if(d >= 1 && d <= w.max) set.add(d);
 }
 let v = 1; while(set.size < 3 && v <= w.max){ set.add(v); v++; }
 const vals = shuffle([...set]).slice(0,3);
 return vals.map(val => ({
  val,
  html: (level === 'GS') ? _matNumHtml(val) : _matDotsHtml(val, w.accent),
 }));
}

// ── Générateur d'exercice « Combien ? » (M-A) ───────────────────────
function _matGenCombien(level){
 const w = _MAT_WORLDS[level];
 const n = ri(1, w.max);
 const obj = w.objs[ri(0, w.objs.length-1)];
 return {
  maternelle:true, level, type:'mat', opKey:'mat',
  consigne:`Combien de ${_matObjName(obj)} y a-t-il ?`,
  visuelHtml:_matCollectionHtml(obj, n),
  choices:_matChoices(n, level),
  res:n, img:'',
 };
}

// Dispatcher par niveau (M-A : un seul type d'exercice ; M-B ajoutera les autres)
function genQ_PS(){ return _matGenCombien('PS'); }
function genQ_MS(){ return _matGenCombien('MS'); }
function genQ_GS(){ return _matGenCombien('GS'); }

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
 if(pi){ pi.innerHTML = q.visuelHtml; }

 // Réponses cliquables (images en PS/MS, chiffres en GS)
 const qcm = $('qcm-options');
 if(qcm){
  qcm.classList.remove('hidden');
  qcm.classList.add('mat-choices');
  qcm.innerHTML = q.choices
   .map(c => `<button class="qcm-btn mat-choice" data-val="${c.val}">${c.html}</button>`)
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
