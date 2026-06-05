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

// ── Pools par niveau ──────────────────────────────────────────────────
const _PRIM_POOL = {
 CP:  [_primSuite, _primRangListe, _primComparer, _primValeurPosition,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie],
 CE1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primStrategie],
 CE2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleAdd, _primFamilleMul, _primCommut, _primStrategie],
 CM1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie],
 CM2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi,
       _primDouble, _primMoitie, _primComplement, _primFamilleMul, _primCommut, _primStrategie],
};

// Renvoie une question d'enrichissement pour le niveau, ou null.
function _primEnrich(level){
 const pool = _PRIM_POOL[level];
 if(!pool || !pool.length) return null;
 try{ return pool[ri(0, pool.length - 1)](level); }
 catch(e){ return null; }
}
