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

// ════════════════ Chantier P5 : Problèmes en barres ════════════════
const _PB_NAMES = ['Léa','Tom','Jade','Hugo','Manon','Noé','Lila','Sami'];
const _PB_NOUNS = ['billes','cartes','images','jetons','perles','bonbons','autocollants'];
function _pbRange(level){ return {CP:[2,9], CE1:[5,40], CE2:[20,150], CM1:[50,400], CM2:[100,800]}[level] || [5,40]; }
function _pbTwo(arr){ const a=_primPick(arr); let b=_primPick(arr),t=0; while(b===a&&t++<6) b=_primPick(arr); return [a,b]; }
function _pbDe(noun){ return (/^[aeiouhéàâ]/i.test(noun) ? "d'" : 'de ') + noun; }
// Barre partie-tout (segments proportionnels + accolade du tout)
function _primBarModel(segs, totalLabel){
 const segHtml = segs.map(s=>`<div class="pb-seg ${s.cls||''}" style="flex:${s.v}">${s.label}</div>`).join('');
 const brace = totalLabel!=null ? `<div class="pb-total">${totalLabel}</div>` : '';
 return `<div class="prim-barmodel">${brace}<div class="pb-bar">${segHtml}</div></div>`;
}
// Barres de comparaison (deux lignes, à l'échelle)
function _primBarCmpHtml(rows){
 const max = Math.max(...rows.map(r=>r.segs.reduce((s,x)=>s+x.v,0)));
 return `<div class="prim-barcmp">` + rows.map(r=>{
  const tot = r.segs.reduce((s,x)=>s+x.v,0);
  const segs = r.segs.map(x=>`<div class="pb-seg ${x.cls||''}" style="flex:${x.v}">${x.label}</div>`).join('');
  return `<div class="pb-row"><span class="pb-name">${r.name}</span><div class="pb-bar pb-bar-row" style="width:${Math.max(12,tot/max*100)}%">${segs}</div></div>`;
 }).join('') + `</div>`;
}
// Partie-tout : trouver le tout (addition)
function _primProblemeTout(level){
 const [lo,hi]=_pbRange(level); const a=ri(lo,hi), b=ri(lo,hi); const nm=_primPick(_PB_NAMES); const noun=_primPick(_PB_NOUNS);
 return { display:`${nm} a ${a} ${noun} rouges et ${b} ${noun} bleues. Combien en tout ?`,
  visualHtml:_primBarModel([{v:a,label:a},{v:b,label:b,cls:'alt'}], '?'), res:a+b, type:'normal', opKey:'+', img:'' };
}
// Partie-tout : trouver une partie (soustraction)
function _primProblemePartie(level){
 const [lo,hi]=_pbRange(level); const a=ri(lo,hi), b=ri(lo,hi); const t=a+b; const nm=_primPick(_PB_NAMES); const noun=_primPick(_PB_NOUNS);
 return { display:`Il y a ${t} ${noun}. ${nm} en prend ${a}. Combien en reste-t-il ?`,
  visualHtml:_primBarModel([{v:a,label:a},{v:b,label:'?',cls:'unknown'}], t), res:b, type:'normal', opKey:'-', img:'' };
}
// Comparaison : combien de plus (soustraction)
function _primProblemeCompareDiff(level){
 const [lo,hi]=_pbRange(level); let b=ri(lo,hi), s=ri(lo,hi); if(s>b){const k=s;s=b;b=k;} if(s===b) s=Math.max(lo,b-ri(1,3));
 const [nA,nB]=_pbTwo(_PB_NAMES); const noun=_primPick(_PB_NOUNS);
 return { display:`${nA} a ${b} ${noun}. ${nB} a ${s} ${noun}. Combien ${_pbDe(noun)} en plus a ${nA} ?`,
  visualHtml:_primBarCmpHtml([{name:nA,segs:[{v:b,label:b}]},{name:nB,segs:[{v:s,label:s,cls:'alt'}]}]), res:b-s, type:'normal', opKey:'-', img:'' };
}
// Comparaison : « de plus que » → trouver le plus grand (addition)
function _primProblemeComparePlus(level){
 const [lo,hi]=_pbRange(level); const s=ri(lo,hi), d=ri(Math.max(1,Math.floor(lo/2)),hi); const [nA,nB]=_pbTwo(_PB_NAMES); const noun=_primPick(_PB_NOUNS);
 return { display:`${nB} a ${s} ${noun}. ${nA} en a ${d} de plus. Combien en a ${nA} ?`,
  visualHtml:_primBarCmpHtml([{name:nB,segs:[{v:s,label:s,cls:'alt'}]},{name:nA,segs:[{v:s,label:s,cls:'alt'},{v:d,label:'+'+d}]}]), res:s+d, type:'normal', opKey:'+', img:'' };
}
// Groupes égaux → le tout (multiplication, CE2→CM2)
function _primProblemeFois(level){
 const n=ri(2, level==='CE2'?4:6); const p=ri(2, level==='CE2'?10:level==='CM1'?20:40); const noun=_primPick(_PB_NOUNS);
 const segs=[]; for(let i=0;i<n;i++) segs.push({v:p,label:p});
 return { display:`${n} paquets de ${p} ${noun}. Combien de ${noun} en tout ?`,
  visualHtml:_primBarModel(segs, '?'), res:n*p, type:'normal', opKey:'x', img:'' };
}

// ════════════════ Chantier P6 : Grandeurs & mesures ════════════════
// Monnaie — composer un total
function _primMonnaieTotal(level){
 const coins = {CP:[1,2], CE1:[1,2,5], CE2:[1,2,5,10], CM1:[1,2,5,10], CM2:[1,2,5,10,20]}[level] || [1,2,5];
 const a=_primPick(coins); const rest=coins.filter(x=>x!==a); const b=rest.length?_primPick(rest):a;
 const na=ri(1,3), nb=ri(1,3);
 const pc=n=>n>1?'pièces':'pièce';
 return { display:`J'ai ${na} ${pc(na)} de ${a}€ et ${nb} ${pc(nb)} de ${b}€. Combien en tout (en €) ?`, res:na*a+nb*b, type:'normal', opKey:'+', img:'' };
}
// Monnaie — rendre la monnaie
function _primRendreMonnaie(level){
 const max = {CP:9, CE1:19, CE2:49, CM1:49, CM2:99}[level] || 19;
 const price = ri(2, max);
 const bills = [5,10,20,50,100].filter(x=>x>price);
 const paid = bills.length ? bills[0] : price + ri(1,5);
 return { display:`Tu paies un objet à ${price}€ avec un billet de ${paid}€. Combien te rend-on (en €) ?`, res:paid-price, type:'normal', opKey:'-', img:'' };
}
// Durées (heures entières, ou minutes dans l'heure)
function _primDuree(level){
 if(ri(0,1)){
  const h1=ri(8,14), dh=ri(1,4);
  return { display:`De ${h1}h à ${h1+dh}h, combien d'heures se sont écoulées ?`, res:dh, type:'normal', opKey:'mes', img:'' };
 }
 const startM=_primPick([0,15,30]); const dm=_primPick([15,30,45]); const startH=ri(9,14);
 let endH=startH, endM=startM+dm; if(endM>=60){ endH++; endM-=60; }
 const f=(H,M)=>`${H}h${String(M).padStart(2,'0')}`;
 return { display:`De ${f(startH,startM)} à ${f(endH,endM)}, combien de minutes se sont écoulées ?`, res:dm, type:'normal', opKey:'mes', img:'' };
}
// Horloge analogique (SVG) → lire l'heure
function _primClockSvg(h, m){
 const cx=60, cy=60, r=54;
 const ha=((h%12)+m/60)*30, ma=m*6;
 const hand=(ang,len,w,col)=>{ const a=(ang-90)*Math.PI/180; return `<line x1="${cx}" y1="${cy}" x2="${(cx+len*Math.cos(a)).toFixed(1)}" y2="${(cy+len*Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
 let ticks=''; for(let i=0;i<12;i++){ const a=(i*30-90)*Math.PI/180; ticks+=`<line x1="${(cx+(r-5)*Math.cos(a)).toFixed(1)}" y1="${(cy+(r-5)*Math.sin(a)).toFixed(1)}" x2="${(cx+r*Math.cos(a)).toFixed(1)}" y2="${(cy+r*Math.sin(a)).toFixed(1)}" stroke="#34495e" stroke-width="2"/>`; }
 return `<svg viewBox="0 0 120 120" class="prim-clock"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#2c3e50" stroke-width="3"/>${ticks}${hand(ha,28,5,'#2c3e50')}${hand(ma,42,3,'#e67e22')}<circle cx="${cx}" cy="${cy}" r="3.5" fill="#2c3e50"/></svg>`;
}
function _primHeure(level){
 const mins = {CE1:[0,30], CE2:[0,15,30,45], CM1:[0,5,10,15,20,25,30,35,40,45,50,55], CM2:[0,5,10,15,20,25,30,35,40,45,50,55]}[level] || [0,30];
 const h=ri(1,12), m=_primPick(mins);
 const f=(H,M)=>`${H}h${M===0?'00':String(M).padStart(2,'0')}`;
 const correct=f(h,m); const set=new Set([correct]); let g=0;
 while(set.size<4 && g++<50){ const hh=Math.max(1,Math.min(12,h+ri(-3,3))); set.add(f(hh,_primPick(mins))); }
 const labels=shuffle([...set]);
 return { display:`Quelle heure est-il ?`, visualHtml:_primClockSvg(h,m), choices:labels.map((l,i)=>({val:i,label:l})), res:labels.indexOf(correct), type:'normal', opKey:'mes', img:'' };
}
// Quadrillage : périmètre & aire
function _primGridRectHtml(L, l){
 let rows=''; for(let r=0;r<l;r++){ let c=''; for(let k=0;k<L;k++) c+=`<span class="pg-cell"></span>`; rows+=`<div class="pg-row">${c}</div>`; }
 return `<div class="prim-grid">${rows}</div>`;
}
function _primPerimetre(level){
 const L=ri(2,8), l=ri(2,6);
 return { display:`Quel est le périmètre de ce rectangle (en carreaux) ?`, visualHtml:_primGridRectHtml(L,l), res:2*(L+l), type:'normal', opKey:'mes', img:'' };
}
function _primAire(level){
 const L=ri(2,8), l=ri(2,6);
 return { display:`Quelle est l'aire de ce rectangle (en carreaux) ?`, visualHtml:_primGridRectHtml(L,l), res:L*l, type:'normal', opKey:'mes', img:'' };
}

// ════════════════ Chantier P7 : Géométrie ════════════════
function _primRegPoly(n){
 const cx=50, cy=52, r=38, pts=[];
 for(let i=0;i<n;i++){ const a=(-90+i*360/n)*Math.PI/180; pts.push(`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`); }
 return `<polygon points="${pts.join(' ')}" fill="#7fb2e8" stroke="#2c3e50" stroke-width="3"/>`;
}
function _primShapeSvg(type){
 const S='<svg viewBox="0 0 100 104" class="prim-shape">', E='</svg>';
 const st='stroke="#2c3e50" stroke-width="3"', f='fill="#7fb2e8"';
 switch(type){
  case 'cercle':    return S+`<circle cx="50" cy="52" r="38" ${f} ${st}/>`+E;
  case 'carré':     return S+`<rect x="16" y="18" width="68" height="68" rx="2" ${f} ${st}/>`+E;
  case 'rectangle': return S+`<rect x="8" y="32" width="84" height="44" rx="2" ${f} ${st}/>`+E;
  case 'triangle':  return S+`<polygon points="50,14 86,86 14,86" ${f} ${st}/>`+E;
  case 'losange':   return S+`<polygon points="50,12 86,52 50,92 14,52" ${f} ${st}/>`+E;
  case 'pentagone': return S+_primRegPoly(5)+E;
  case 'hexagone':  return S+_primRegPoly(6)+E;
  default:          return S+_primRegPoly(8)+E;
 }
}
// Reconnaître une figure (choix visuels)
function _primFigureReco(level){
 const pool = {CP:['triangle','carré','rectangle','cercle'], CE1:['triangle','carré','rectangle','cercle','losange'],
  CE2:['triangle','carré','rectangle','cercle','losange','pentagone'], CM1:['triangle','carré','rectangle','losange','pentagone','hexagone'],
  CM2:['triangle','carré','rectangle','losange','pentagone','hexagone']}[level] || ['triangle','carré','rectangle','cercle'];
 const opts = shuffle(pool.slice()).slice(0,4);
 const target = _primPick(opts);
 const art = /^[aeiouyéèh]/i.test(target) ? "l'" : 'le ';
 return { display:`Touche ${art}${target}.`, choices: opts.map((t,i)=>({val:i, html:_primShapeSvg(t)})), visualChoices:true, res:opts.indexOf(target), type:'normal', opKey:'geo', img:'' };
}
// Compter les côtés d'une figure (lecture sur le dessin)
function _primCotes(level){
 const ns = {CE1:[3,4], CE2:[3,4,5], CM1:[3,4,5,6], CM2:[3,4,5,6,8]}[level] || [3,4,5];
 const n = _primPick(ns);
 const shape = n===3?'triangle':n===4?'carré':n===5?'pentagone':n===6?'hexagone':'octogone';
 return { display:`Combien de côtés a cette figure ?`, visualHtml:_primShapeSvg(shape), res:n, type:'normal', opKey:'geo', img:'' };
}
// Comparer un angle à l'angle droit (CM1→CM2)
function _primAngleSvg(deg){
 const cx=22, cy=82, len=66, a=-deg*Math.PI/180;
 const sq = deg===90 ? `<rect x="${cx}" y="${cy-12}" width="12" height="12" fill="none" stroke="#fff" stroke-width="2"/>` : '';
 return `<svg viewBox="0 0 110 100" class="prim-angle"><line x1="${cx}" y1="${cy}" x2="${cx+len}" y2="${cy}" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${(cx+len*Math.cos(a)).toFixed(1)}" y2="${(cy+len*Math.sin(a)).toFixed(1)}" stroke="#f1c40f" stroke-width="4" stroke-linecap="round"/>${sq}<circle cx="${cx}" cy="${cy}" r="3" fill="#fff"/></svg>`;
}
function _primAngle(level){
 const deg = _primPick([30,40,45,60,90,120,135,150]);
 const labels = ["plus petit qu'un angle droit", "un angle droit", "plus grand qu'un angle droit"];
 const res = deg<90 ? 0 : deg===90 ? 1 : 2;
 return { display:`Cet angle est…`, visualHtml:_primAngleSvg(deg), choices:labels.map((l,i)=>({val:i,label:l})), res, type:'normal', opKey:'geo', img:'' };
}
// Axe de symétrie : oui / non (CE2→CM2)
function _primSymetrie(level){
 const kind = _primPick(['v','h','d1','d2']);
 const yes = (kind==='v' || kind==='h');
 const rect = '<rect x="18" y="32" width="64" height="40" fill="#7fb2e8" stroke="#2c3e50" stroke-width="3"/>';
 const lines = {
  v:'<line x1="50" y1="22" x2="50" y2="82" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>',
  h:'<line x1="8" y1="52" x2="92" y2="52" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>',
  d1:'<line x1="18" y1="32" x2="82" y2="72" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>',
  d2:'<line x1="82" y1="32" x2="18" y2="72" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>'
 };
 const visual = `<svg viewBox="0 0 100 100" class="prim-shape">${rect}${lines[kind]}</svg>`;
 const opts = shuffle([{label:'Oui', y:true}, {label:'Non', y:false}]);
 return { display:`La ligne rouge est-elle un axe de symétrie ?`, visualHtml:visual, choices:opts.map((c,i)=>({val:i, label:c.label})), res:opts.findIndex(c=>c.y===yes), type:'normal', opKey:'geo', img:'' };
}

// ── Pools par niveau ──────────────────────────────────────────────────
const _PRIM_POOL = {
 CP:  [_primSuite, _primRangListe, _primComparer, _primValeurPosition,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie, _primPartage, _primDroiteLire, _primDroitePlacer, _primProblemeTout, _primProblemePartie, _primProblemeCompareDiff, _primMonnaieTotal, _primRendreMonnaie, _primDuree, _primFigureReco],
 CE1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie, _primFractionBar, _primPartage, _primDroiteLire, _primDroitePlacer, _primProblemeTout, _primProblemePartie, _primProblemeCompareDiff, _primProblemeComparePlus, _primMonnaieTotal, _primRendreMonnaie, _primDuree, _primHeure, _primFigureReco, _primCotes],
 CE2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primPartage, _primDroiteLire, _primDroitePlacer, _primProblemeTout, _primProblemePartie, _primProblemeCompareDiff, _primProblemeComparePlus, _primProblemeFois, _primMonnaieTotal, _primRendreMonnaie, _primDuree, _primHeure, _primPerimetre, _primAire, _primFigureReco, _primCotes, _primSymetrie],
 CM1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primFracDecimal, _primDecimalFrac, _primFracEquiv, _primPartage, _primDroiteLire, _primDroitePlacer, _primProblemeTout, _primProblemePartie, _primProblemeCompareDiff, _primProblemeComparePlus, _primProblemeFois, _primMonnaieTotal, _primRendreMonnaie, _primDuree, _primHeure, _primPerimetre, _primAire, _primFigureReco, _primCotes, _primSymetrie, _primAngle],
 CM2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie,
       _primFractionBar, _primFracCompare, _primFracDecimal, _primDecimalFrac, _primFracEquiv, _primPartage, _primDroiteLire, _primDroitePlacer, _primProblemeTout, _primProblemePartie, _primProblemeCompareDiff, _primProblemeComparePlus, _primProblemeFois, _primMonnaieTotal, _primRendreMonnaie, _primDuree, _primHeure, _primPerimetre, _primAire, _primFigureReco, _primCotes, _primSymetrie, _primAngle],
};

// Renvoie une question d'enrichissement pour le niveau, ou null.
// Rotation par « sac » mélangé : chaque type sort à tour de rôle avant de se répéter
// → variété garantie et plus d'oublis de certains exercices.
const _primBags = {};
function _primEnrich(level){
 const pool = _PRIM_POOL[level];
 if(!pool || !pool.length) return null;
 let bag = _primBags[level];
 if(!bag || !bag.length){ bag = _primBags[level] = (typeof shuffle==='function' ? shuffle(pool.slice()) : pool.slice()); }
 const fn = bag.pop();
 try{ return fn(level); }
 catch(e){ return null; }
}
