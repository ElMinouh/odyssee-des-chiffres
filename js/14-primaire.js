// ════════════════════════════════════════════════════════════════════
// 14-primaire.js — Enrichissement PRIMAIRE (CP→CM2)
// Chantier P1 : Numération & sens du nombre.
// Exercices à réponse numérique → compatibles pavé ET QCM auto (offsets autour de res).
// Injectés par generateQ() avec une probabilité modérée, hors boss.
// ════════════════════════════════════════════════════════════════════

const _PRIM_LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
function _primPick(a){ return a[ri(0, a.length - 1)]; }

// ── Valeur de position (aspect positionnel de la numération) ──────────
function _primValeurPosition(level){
 const dig = {CP:2, CE1:3, CE2:4, CM1:6, CM2:7}[level] || 3;
 const names = ['unités','dizaines','centaines','milliers','dizaines de mille','centaines de mille','millions'];
 let n, pos, d, t = 0;
 do{
  n = ri(Math.pow(10, dig-1), Math.pow(10, dig) - 1);
  pos = ri(0, dig - 1);
  d = Math.floor(n / Math.pow(10, pos)) % 10;
  t++;
 } while(d === 0 && t < 8);
 return { display:`Dans ${n}, quelle est la valeur du chiffre des ${names[pos]} ?`, res: d * Math.pow(10, pos), type:'normal', opKey:'num', img:'' };
}

// ── Suites numériques (régularités, comptage de n en n) ───────────────
function _primSuite(level){
 const steps = {CP:[1,2,5,10], CE1:[2,5,10,20], CE2:[10,25,50,100], CM1:[50,100,250,500], CM2:[100,250,500,1000]}[level] || [2,5,10];
 const step = _primPick(steps);
 const start = ri(1, 9) * (step <= 10 ? 1 : step);
 const seq = []; for(let i=0;i<4;i++) seq.push(start + i*step);
 return { display:`Suite : ${seq.join(', ')}, ?`, res: start + 4*step, type:'normal', opKey:'num', img:'' };
}

// ── Arrondi à la dizaine / centaine / millier (CE2→CM2) ───────────────
function _primArrondi(level){
 const units = level==='CE2' ? [10,100] : [100,1000];
 const max = {CE2:9999, CM1:99999, CM2:999999}[level] || 9999;
 const u = _primPick(units);
 const n = ri(u, max);
 const phrase = u===10 ? 'à la dizaine la plus proche' : u===100 ? 'à la centaine la plus proche' : 'au millier le plus proche';
 return { display:`Arrondi de ${n} ${phrase} ?`, res: Math.round(n/u)*u, type:'normal', opKey:'num', img:'' };
}

// ── Rang dans une liste (fonction ordinale, réponse = le nombre) ───────
function _primRangListe(level){
 const max = {CP:30, CE1:100, CE2:1000, CM1:10000, CM2:100000}[level] || 100;
 const set = new Set(); while(set.size < 5) set.add(ri(1, max));
 const list = [...set];
 const ORD = ['premier','deuxième','troisième','quatrième','cinquième'];
 const k = ri(1, 5);
 return { display:`Liste : ${list.join(', ')}. Quel est le ${ORD[k-1]} nombre ?`, res: list[k-1], type:'normal', opKey:'num', img:'' };
}

// ── Groupements (combien de dizaines/centaines/milliers) ──────────────
function _primDizaines(level){
 const opt = level==='CE1' ? [[10,'dizaines']]
           : level==='CE2' ? [[10,'dizaines'],[100,'centaines']]
           : [[10,'dizaines'],[100,'centaines'],[1000,'milliers']];
 const [u, name] = _primPick(opt);
 const kk = ri(2, u===10 ? 60 : 40);
 return { display:`Combien de ${name} y a-t-il dans ${kk*u} ?`, res: kk, type:'normal', opKey:'num', img:'' };
}

// ── Comparer / ordonner (le plus grand / le plus petit) ───────────────
function _primComparer(level){
 const dig = {CP:2, CE1:3, CE2:4, CM1:5, CM2:6}[level] || 3;
 const lo = Math.pow(10, dig-1), hi = Math.pow(10, dig) - 1;
 const a = ri(lo, hi); let b = ri(lo, hi), t = 0;
 while(b === a && t++ < 6) b = ri(lo, hi);
 const big = ri(0, 1) === 1;
 return { display:`Quel est le plus ${big?'grand':'petit'} : ${a} ou ${b} ?`, res: big ? Math.max(a,b) : Math.min(a,b), type:'normal', opKey:'num', img:'' };
}

// ════════════════ Chantier P2 : Calcul & fluence ════════════════
// Doubles / moitiés (faits-clés pour construire les tables)
function _primDouble(level){
 const r = {CP:[2,10], CE1:[5,20], CE2:[10,50], CM1:[15,100], CM2:[20,150]}[level] || [5,20];
 const n = ri(r[0], r[1]);
 return { display:`Le double de ${n} ?`, res: 2*n, type:'normal', opKey:'x', img:'' };
}
function _primMoitie(level){
 const r = {CP:[1,10], CE1:[2,20], CE2:[5,50], CM1:[10,100], CM2:[15,150]}[level] || [2,20];
 const half = ri(r[0], r[1]);
 return { display:`La moitié de ${2*half} ?`, res: half, type:'normal', opKey:'/', img:'' };
}
// Compléments (à 10 / 100 / 1000)
function _primComplement(level){
 const T = {CP:10, CE1:100, CE2:100, CM1:1000, CM2:1000}[level] || 100;
 const a = ri(1, T-1);
 return { display:`Combien faut-il ajouter à ${a} pour atteindre ${T} ?`, res: T-a, type:'normal', opKey:'+', img:'' };
}
// Familles de faits — addition/soustraction
function _primFamilleAdd(level){
 const r = {CP:[2,9], CE1:[5,20], CE2:[10,50], CM1:[20,80], CM2:[30,120]}[level] || [5,20];
 const a = ri(r[0], r[1]), b = ri(r[0], r[1]), s = a+b;
 const x = ri(0,1) ? b : a;
 return { display:`Sachant que ${a} + ${b} = ${s}, combien fait ${s} - ${x} ?`, res: s-x, type:'normal', opKey:'-', img:'' };
}
// Familles de faits — multiplication/division (CE2→CM2)
function _primFamilleMul(level){
 const hi = {CE2:9, CM1:10, CM2:12}[level] || 9;
 const a = ri(2, hi), b = ri(2, hi), p = a*b;
 const x = ri(0,1) ? b : a, res = p/x;
 return { display:`Sachant que ${a} × ${b} = ${p}, combien fait ${p} ÷ ${x} ?`, res, type:'normal', opKey:'/', img:'' };
}
// Commutativité de la multiplication (allège la mémorisation des tables)
function _primCommut(level){
 const hi = {CE2:9, CM1:12, CM2:12}[level] || 9;
 const a = ri(2, hi), b = ri(2, hi);
 return { display:`${a} × ${b} = ${a*b}, donc ${b} × ${a} = ?`, res: a*b, type:'normal', opKey:'x', img:'' };
}
// Stratégies de calcul rendues explicites (arrondir puis ajuster)
function _primStrategie(level){
 const ds = {CP:[9], CE1:[9,19], CE2:[9,19,99], CM1:[99,199], CM2:[99,999]}[level] || [9,19];
 const d = _primPick(ds);
 const base = {CP:[2,9], CE1:[5,40], CE2:[10,90], CM1:[50,400], CM2:[100,900]}[level] || [5,40];
 const a = ri(base[0], base[1]);
 if(ri(0,1)){
  return { display:`${a} + ${d} = ${a} + ${d+1} - 1 = ?`, res: a+d, type:'normal', opKey:'+', img:'' };
 }
 const big = a + d + ri(1, 20);
 return { display:`${big} - ${d} = ${big} - ${d+1} + 1 = ?`, res: big-d, type:'normal', opKey:'-', img:'' };
}

// ════════════════ Chantier P3 : Fractions (visuel) ════════════════
function _primFracBarHtml(n, d){
 let cells=''; for(let i=0;i<d;i++) cells += `<span class="pf-cell${i<n?' filled':''}"></span>`;
 return `<div class="prim-fracbar">${cells}</div>`;
}
// Barre-unité partagée en d, n coloriés → lire la fraction (concret-imagé → abstrait)
function _primFractionBar(level){
 const denoms = {CE1:[2,3,4], CE2:[2,3,4,5,6,8], CM1:[2,3,4,5,6,8,10], CM2:[2,3,4,5,6,8,10,12]}[level] || [2,3,4];
 const d = _primPick(denoms);
 const n = level==='CE1' ? 1 : ri(1, d-1);   // CE1 : fractions unitaires ; fractions < 1 (programme)
 const set = new Set([`${n}/${d}`]); let guard=0;
 while(set.size<4 && guard++<50){
  const dn = _primPick(denoms); const nn = (level==='CE1') ? 1 : ri(1, dn-1);
  set.add(`${nn}/${dn}`);
 }
 const labels = shuffle([...set]);
 const choices = labels.map((lab,i)=>({val:i, label:lab}));
 return {
  display:`Quelle fraction est coloriée ?`,
  visualHtml: _primFracBarHtml(n, d),
  choices, res: labels.indexOf(`${n}/${d}`),
  type:'normal', opKey:'frac', img:''
 };
}

// Comparer deux fractions de même dénominateur (visuel : deux barres)
function _primFracCompare(level){
 const denoms = {CE2:[3,4,5,6,8], CM1:[3,4,5,6,8,10], CM2:[3,4,5,6,8,10,12]}[level] || [3,4,5,6];
 const d = _primPick(denoms);
 let n1 = ri(1,d-1), n2 = ri(1,d-1), t=0; while(n2===n1 && t++<8) n2 = ri(1,d-1);
 const visual = `<div class="prim-fracstack">`
   + `<div class="pf-line"><span class="pf-lab">${n1}/${d}</span>${_primFracBarHtml(n1,d)}</div>`
   + `<div class="pf-line"><span class="pf-lab">${n2}/${d}</span>${_primFracBarHtml(n2,d)}</div></div>`;
 const big = ri(0,1)===1;
 const opts = shuffle([{frac:`${n1}/${d}`, nn:n1}, {frac:`${n2}/${d}`, nn:n2}]);
 const target = big ? Math.max(n1,n2) : Math.min(n1,n2);
 return {
  display:`Quelle fraction est la plus ${big?'grande':'petite'} ?`,
  visualHtml: visual,
  choices: opts.map((o,i)=>({val:i, label:o.frac})),
  res: opts.findIndex(o=>o.nn===target),
  type:'normal', opKey:'frac', img:''
 };
}
// Fraction décimale → écriture à virgule (CM1→CM2)
function _primFracDecimal(level){
 const k = ri(0,2);
 if(k===0){ const n=ri(1,9);  return { display:`${n}/10 = ? (nombre à virgule)`,  res:n/10,  type:'normal', opKey:'dec', img:'' }; }
 if(k===1){ const n=ri(1,99); return { display:`${n}/100 = ? (nombre à virgule)`, res:n/100, type:'normal', opKey:'dec', img:'' }; }
 const e=ri(1,9), n=ri(1,9);  return { display:`${e} + ${n}/10 = ? (nombre à virgule)`, res:e+n/10, type:'normal', opKey:'dec', img:'' };
}
// Écriture à virgule → fraction décimale (combien de dixièmes / centièmes)
function _frD(x){ return String(x).replace('.', ','); }
function _primDecimalFrac(level){
 if(ri(0,1)){ const n=ri(1,9);  return { display:`Dans ${_frD(n/10)}, combien y a-t-il de dixièmes ?`,  res:n, type:'normal', opKey:'dec', img:'' }; }
 const n=ri(1,99); return { display:`Dans ${_frD(n/100)}, combien y a-t-il de centièmes ?`, res:n, type:'normal', opKey:'dec', img:'' };
}
// Partage équitable (sens de la division, dès le CP via les problèmes)
function _primPartage(level){
 const cfg = {CP:[[1,3],[2,3]], CE1:[[2,5],[2,4]], CE2:[[2,6],[2,5]], CM1:[[2,9],[2,8]], CM2:[[2,12],[2,9]]}[level] || [[2,6],[2,5]];
 const each = ri(cfg[0][0], cfg[0][1]);
 const parts = ri(cfg[1][0], cfg[1][1]);
 const ctx = _primPick([['billes','enfants'],['bonbons','amis'],['cartes','joueurs'],['images','élèves'],['gâteaux','assiettes']]);
 return { display:`On partage ${each*parts} ${ctx[0]} entre ${parts} ${ctx[1]}. Combien chacun ?`, res:each, type:'normal', opKey:'/', img:'' };
}
// Fractions équivalentes (visuel : une barre, choisir la fraction égale) — CM1→CM2
function _primFracEquiv(level){
 const base = _primPick([[1,2],[1,3],[1,4],[2,3],[3,4],[2,5]]);
 const bn = base[0], bd = base[1], baseVal = bn/bd;
 const k = ri(2,3), en = bn*k, ed = bd*k;
 const set = new Set([`${en}/${ed}`]); let g=0;
 while(set.size<4 && g++<60){
  const dd = bd*ri(2,4), dn = ri(1, dd-1);
  if(Math.abs(dn/dd - baseVal) < 1e-9) continue;
  set.add(`${dn}/${dd}`);
 }
 const labels = shuffle([...set]);
 return {
  display:`Quelle fraction est égale à ${bn}/${bd} ?`,
  visualHtml: _primFracBarHtml(bn, bd),
  choices: labels.map((lab,i)=>({val:i, label:lab})),
  res: labels.indexOf(`${en}/${ed}`),
  type:'normal', opKey:'frac', img:''
 };
}

// ════════════════ Chantier P4 : Droite numérique ════════════════
function _lineRound(v){ return Math.round(v*1000)/1000; }
function _primLineCfg(level){
 return {
  CP:  [{max:10},{max:20}],
  CE1: [{max:100}],
  CE2: [{max:1000},{max:100}],
  CM1: [{max:1},{max:10}],
  CM2: [{max:1},{max:10}],
 }[level] || [{max:100}];
}
// Demi-droite graduée (10 intervalles) avec repères et marqueurs
function _primLineHtml(max, labels, markers){
 const pct = v => (v/max*100);
 let ticks=''; for(let i=0;i<=10;i++) ticks += `<span class="pl-tick" style="left:${i*10}%"></span>`;
 const labelsHtml = labels.map(v=>`<span class="pl-label" style="left:${pct(v)}%">${_frD(_lineRound(v))}</span>`).join('');
 const markHtml = markers.map(m=>`<span class="pl-mark" style="left:${pct(m.v)}%">${m.label?`<span class="pl-mark-lab">${m.label}</span>`:''}<span class="pl-arrow">▼</span></span>`).join('');
 return `<div class="prim-line"><div class="pl-axis"></div>${ticks}${labelsHtml}${markHtml}</div>`;
}
// Lire la position d'une flèche → choisir le bon nombre
function _primDroiteLire(level){
 const max = _primPick(_primLineCfg(level)).max;
 const val = _lineRound(ri(1,9) * max/10);
 const set = new Set([val]); let g=0;
 while(set.size<4 && g++<40) set.add(_lineRound(ri(0,10) * max/10));
 const opts = shuffle([...set]);
 return {
  display:`Quel nombre est indiqué par la flèche ?`,
  visualHtml: _primLineHtml(max, [0, max/2, max], [{v:val}]),
  choices: opts.map((x,i)=>({val:i, label:_frD(x)})),
  res: opts.indexOf(val),
  type:'normal', opKey:'num', img:''
 };
}
// Localiser un nombre parmi des points A–D sur la droite
function _primDroitePlacer(level){
 const max = _primPick(_primLineCfg(level)).max;
 const ks = shuffle([1,3,5,7,9]).slice(0,4);
 const targetK = _primPick(ks);
 const N = _lineRound(targetK * max/10);
 const L = ['A','B','C','D'];
 const markers = ks.map((k,i)=>({ v:_lineRound(k*max/10), label:L[i] }));
 return {
  display:`Quel point montre le nombre ${_frD(N)} ?`,
  visualHtml: _primLineHtml(max, [0, max/2, max], markers),
  choices: L.map((l,i)=>({val:i, label:l})),
  res: ks.indexOf(targetK),
  type:'normal', opKey:'num', img:''
 };
}

// ── Pools par niveau ──────────────────────────────────────────────────
const _PRIM_POOL = {
 CP:  [_primSuite, _primRangListe, _primComparer, _primValeurPosition,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie, _primPartage, _primDroiteLire, _primDroitePlacer],
 CE1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie, _primFractionBar, _primPartage, _primDroiteLire, _primDroitePlacer],
 CE2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primPartage, _primDroiteLire, _primDroitePlacer],
 CM1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primFracDecimal, _primDecimalFrac, _primFracEquiv, _primPartage, _primDroiteLire, _primDroitePlacer],
 CM2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primFracDecimal, _primDecimalFrac, _primFracEquiv, _primPartage, _primDroiteLire, _primDroitePlacer],
};

// Renvoie une question d'enrichissement pour le niveau, ou null.
function _primEnrich(level){
 const pool = _PRIM_POOL[level];
 if(!pool || !pool.length) return null;
 try{ return pool[ri(0, pool.length - 1)](level); }
 catch(e){ return null; }
}
