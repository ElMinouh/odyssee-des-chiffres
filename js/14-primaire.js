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

// ── Pools par niveau ──────────────────────────────────────────────────
const _PRIM_POOL = {
 CP:  [_primSuite, _primRangListe, _primComparer, _primValeurPosition],
 CE1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines],
 CE2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi],
 CM1: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi],
 CM2: [_primSuite, _primRangListe, _primComparer, _primValeurPosition, _primDizaines, _primArrondi],
};

// Renvoie une question d'enrichissement pour le niveau, ou null.
function _primEnrich(level){
 const pool = _PRIM_POOL[level];
 if(!pool || !pool.length) return null;
 try{ return pool[ri(0, pool.length - 1)](level); }
 catch(e){ return null; }
}
