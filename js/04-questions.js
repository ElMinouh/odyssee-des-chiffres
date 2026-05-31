// 04-questions.js — L'Odyssée des Chiffres
'use strict';

// Générateurs de questions par niveau scolaire (CP → CM2) + filtres.

// ── Générateurs de questions ──
// Helper Chantier C1 : ri() adaptatif selon l'historique du joueur
function _ari(min, max, opKey){
 if(typeof adaptRange === 'function'){
  const [m, M] = adaptRange(min, max, opKey);
  return ri(m, M);
 }
 return ri(min, max);
}
function genQ_CP(boss,_d=0){
 if(_d>12)return{a:2,b:3,op:'+',res:5,type:'normal',opKey:'+',display:'2 + 3',img:''};
 const em=EMOJIS[ri(0,9)];
 let q;
 if(boss){
  // Boss CP: pool varié (additions grandes, soustraction simple, nombre manquant)
  const bType=_nextBossType([0,1,2,3],'CP');
if(bType===0){const a=_ari(5,9,'+'),b=_ari(2,6,'+');q={a,b,op:'+',res:a+b,type:'normal',opKey:'+',display:`${a} + ${b}`,img:''};}
  else if(bType===1){const a=_ari(6,10,'-'),b=_ari(1,5,'-');if(a-b<0)return genQ_CP(boss,_d+1);q={a,b,op:'-',res:a-b,type:'normal',opKey:'-',display:`${a} - ${b}`,img:''};}
  else if(bType===2){const a=_ari(4,8,'+'),b=_ari(2,4,'+');q={display:`${a} + ? = ${a+b}`,res:b,type:'missing',opKey:'+',img:''};}
  else{const a=_ari(5,9,'+'),b=_ari(3,7,'+');q={display:`? + ${b} = ${a+b}`,res:a,type:'missing',opKey:'+',img:''};}
 } else {
  const a=_ari(1,6,'+'),b=_ari(1,4,'+');
  q={a,b,op:'+',res:a+b,type:'normal',opKey:'+',display:`${a} + ${b}`,img:a<=8?em.repeat(a)+' + '+em.repeat(b):''};
 }
 if(_seenQ(q))return genQ_CP(boss,_d+1);
 _trackQ(q);return q;
}
function genQ_CE1(boss,_depth=0){
 if(_depth>12)return genQ_CP(boss);
 const af=getOpFilters();
 let q;
 if(boss){
  // Boss CE1: pool enrichi — nombres manquants, soustractions, additions plus grandes
  const bTypes=['miss','sub','add_big','chain'];
  const pick=_nextBossType(bTypes,'CE1');
  if(pick==='miss'){const a=_ari(8,18,'+'),b=_ari(3,12,'+');q={display:`${a} + ? = ${a+b}`,res:b,type:'missing',opKey:'+',img:''};}
  else if(pick==='sub'){const a=_ari(10,20,'-'),b=_ari(3,10,'-');q={a,b,op:'-',res:a-b,type:'normal',opKey:'-',display:`${a} - ${b}`,img:''};}
  else if(pick==='add_big'){const a=_ari(10,20,'+'),b=_ari(8,15,'+');q={a,b,op:'+',res:a+b,type:'normal',opKey:'+',display:`${a} + ${b}`,img:''};}
  else{const a=_ari(5,12,'-'),b=_ari(3,8,'-');q={display:`? - ${b} = ${a}`,res:a+b,type:'missing',opKey:'-',img:''};}
 } else {
  const pool=[];
  if(af.miss)pool.push('miss');if(af.sub)pool.push('sub');pool.push('add','add');
  const pick=pool[ri(0,pool.length-1)];
  if(pick==='miss'){const a=_ari(5,15,'+'),b=_ari(1,10,'+');q={display:`${a} + ? = ${a+b}`,res:b,type:'missing',opKey:'+',img:''};}
  else{const op=(pick==='sub'||Math.random()>.5)?'-':'+';const a=_ari(5,15,op),b=_ari(1,10,op);
   const res=op==='+'?a+b:a-b;if(res<0)return genQ_CE1(boss,_depth+1);
   const em=EMOJIS[ri(0,9)];
   q={a,b,op,res,type:'normal',opKey:op,display:`${a} ${op} ${b}`,img:op==='+'&&a<=7?em.repeat(a)+' + '+em.repeat(b):''};}
 }
 if(_seenQ(q))return genQ_CE1(boss,_depth+1);
 _trackQ(q);return q;
}
function genQ_CE2(boss,_d=0){
 if(_d>12)return genQ_CE1(boss);
 const af=getOpFilters();
 let q;
 if(boss){
  // Boss CE2: toutes tables, nombres manquants multiplication, divisions simples
  const bTypes=['mult_full','miss_mult','div_simple','sub_big'];
  const pick=_nextBossType(bTypes,'CE2');
  if(pick==='mult_full'){const a=[2,3,4,5,6,7,8,9,10][ri(0,8)],b=_ari(2,10,'x');q={a,b,op:'×',res:a*b,type:'normal',opKey:'x',display:`${a} × ${b}`,img:''};}
  else if(pick==='miss_mult'){const a=[3,4,5,6,7,8,9][ri(0,6)],b=_ari(2,10,'x');q={display:`${a} × ? = ${a*b}`,res:b,type:'missing',opKey:'x',img:''};}
  else if(pick==='div_simple'){const b=[2,3,4,5][ri(0,3)],r=_ari(2,9,'/');q={display:`${b*r} ÷ ${b}`,res:r,type:'normal',opKey:'/',img:''};}
  else{const a=_ari(20,50,'-'),b=_ari(8,20,'-');if(a-b<0)return genQ_CE2(boss,_d+1);q={a,b,op:'-',res:a-b,type:'normal',opKey:'-',display:`${a} - ${b}`,img:''};}
 } else {
  if(af.miss&&Math.random()<.25){const t=_ari(2,10,'x'),b=_ari(1,10,'x');q={display:`${t} × ? = ${t*b}`,res:b,type:'missing',opKey:'x',img:''};}
  else if(!af.mult){return genQ_CE1(boss);}
  else{const ts=[2,3,5,10],a=ts[ri(0,ts.length-1)],b=_ari(1,10,'x');q={a,b,op:'×',res:a*b,type:'normal',opKey:'x',display:`${a} × ${b}`,img:''};}
 }
 if(!q||_seenQ(q))return genQ_CE2(boss,_d+1);
 _trackQ(q);return q;
}
function genQ_CM1(boss,_d=0){
 if(_d>12)return genQ_CE2(boss);
 const af=getOpFilters();
 let q;
 if(boss){
  // Boss CM1: pool très varié — additions/soustractions grands, multiplication, géométrie, nombre manquant
  const bTypes=af.geo?['add_big','sub_big','mult_mid','miss_sub','miss_mult','geo']:['add_big','sub_big','mult_mid','miss_sub','miss_mult'];
  const pick=_nextBossType(bTypes,'CM1');
  if(pick==='add_big'){const a=_ari(30,80,'+'),b=_ari(20,60,'+');q={a,b,op:'+',res:a+b,type:'normal',opKey:'+',display:`${a} + ${b}`,img:''};}
  else if(pick==='sub_big'){const a=_ari(40,99,'-'),b=_ari(10,40,'-');q={a,b,op:'-',res:a-b,type:'normal',opKey:'-',display:`${a} - ${b}`,img:''};}
  else if(pick==='mult_mid'){const a=[3,4,6,7,8,9][ri(0,5)],b=_ari(3,9,'x');q={a,b,op:'×',res:a*b,type:'normal',opKey:'x',display:`${a} × ${b}`,img:''};}
  else if(pick==='miss_sub'){const ans=_ari(15,40,'-'),b=_ari(5,20,'-');q={display:`? - ${b} = ${ans}`,res:ans+b,type:'missing',opKey:'-',img:''};}
  else if(pick==='miss_mult'){const a=[4,6,7,8,9][ri(0,4)],b=_ari(3,9,'x');q={display:`${a} × ? = ${a*b}`,res:b,type:'missing',opKey:'x',img:''};}
  else q=GEO_Q[ri(0,GEO_Q.length-1)]();
 } else {
  const pool=['add','add'];
  if(af.miss)pool.push('miss');if(af.geo)pool.push('geo');
  const pick=pool[ri(0,pool.length-1)];
  if(pick==='miss'){const a=_ari(10,50,'+'),ans=_ari(5,30,'+');q={display:`${a} + ? = ${a+ans}`,res:ans,type:'missing',opKey:'+',img:''};}
  else if(pick==='geo')q=GEO_Q[ri(0,GEO_Q.length-1)]();
  else{const a=_ari(10,50,'+'),b=_ari(10,40,'+');q={a,b,op:'+',res:a+b,type:'normal',opKey:'+',display:`${a} + ${b}`,img:''};}
 }
 if(!q||_seenQ(q))return genQ_CM1(boss,_d+1);
 _trackQ(q);return q;
}
function genQ_CM2(boss,_d2=0){
 if(_d2>12)return genQ_CM1(boss);
 const af=getOpFilters();
 let q;
 if(boss){
  const bTypes=['div','frac','geo','miss_div','mult_hard'];
  const validTypes=bTypes.filter(t=>(t==='geo'?af.geo:true)&&(t==='frac'?af.frac:true));
  const pick=_nextBossType(validTypes.length?validTypes:['div'],'CM2');
  if(pick==='div'){const b=_ari(2,9,'/'),res=_ari(2,12,'/');q={display:`${b*res} ÷ ${b}`,res,type:'normal',opKey:'/',img:''};}
  else if(pick==='miss_div'){const b=_ari(2,8,'/'),r=_ari(3,10,'/');q={display:`${b*r} ÷ ? = ${r}`,res:b,type:'missing',opKey:'/',img:''};}
  else if(pick==='frac'){const d=[2,4,5,10][ri(0,3)];const w=_ari(2,20,'/')*d,n=ri(1,d-1)||1;const r=Math.round(w*n/d);q={display:`${n}/${d} de ${w}`,res:r,type:'fraction',opKey:'/',img:''};}
  else if(pick==='mult_hard'){const a=[6,7,8,9,11,12][ri(0,5)],b=_ari(4,12,'x');q={display:`${a} × ${b}`,res:a*b,type:'normal',opKey:'x',img:''};}
  else q=GEO_Q[ri(0,GEO_Q.length-1)]();
 } else {
  const pool=['div'];
  if(af.geo)pool.push('geo','geo');if(af.frac)pool.push('frac','frac');
  const pick=pool[ri(0,pool.length-1)];
  if(pick==='geo')q=GEO_Q[ri(0,GEO_Q.length-1)]();
  else if(pick==='frac'){const d=[2,4,5,10][ri(0,3)];const w=_ari(2,20,'/')*d,n=ri(1,d-1)||1;const r=Math.round(w*n/d);q={display:`${n}/${d} de ${w}`,res:r,type:'fraction',opKey:'/',img:''};}
  else if(!af.div)return genQ_CM1(boss);
  else{const b=_ari(2,6,'/'),r=_ari(2,10,'/');q={display:`${b*r} ÷ ${b}`,res:r,type:'normal',opKey:'/',img:''};}
 }
 if(!q||_seenQ(q))return genQ_CM2(boss,_d2+1);
 _trackQ(q);return q;
}
const GEN={CP:genQ_CP,CE1:genQ_CE1,CE2:genQ_CE2,CM1:genQ_CM1,CM2:genQ_CM2,'6E':genQ_6E,'5E':genQ_5E,'4E':genQ_4E,'3E':genQ_3E};
function getOpFilters(){
 const f=P.opFilters||{};const def={add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true,
  dec:true,rel:true,pow:true,sqrt:true,pct:true,pgcd:true,lit:true,conv:true};
 return {...def,...f};
}

// ═══════════════════════════════════════════════════════
// v9.0.8 : NIVEAUX COLLÈGE (cycle 4) — 6e, 5e, 4e, 3e.
// Calcul mental conforme au programme français, à réponse numérique
// (entière, relative ou décimale). Hors Odyssée (carte = CP→CM2).
// ═══════════════════════════════════════════════════════
const _SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
function _supExp(n){ return String(n).split('').map(c=>_SUP[c]||c).join(''); }
function _fr(n){ return String(Math.round(n*100)/100).replace('.',','); }   // décimal "à la française"
function _rel(n){ return n<0 ? `(−${Math.abs(n)})` : `${n}`; }              // relatif entre parenthèses
function _round2(x){ return Math.round(x*100)/100; }
function _pgcdN(a,b){ a=Math.abs(a);b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a; }
function _pick(arr){ return arr[ri(0,arr.length-1)]; }
function _mkQ(display,res,opKey){ return {display,res:_round2(res),type:'normal',opKey:opKey||'+',img:''}; }

// ── 6ᵉ : décimaux, fraction d'une quantité, conversions, multiples, moitiés/doubles
function genQ_6E(boss,_d=0){
 if(_d>14) return genQ_CM2(boss);
 const af=getOpFilters(); const pool=[];
 if(af.dec)  pool.push('dmul','ddiv','dadd');
 if(af.frac) pool.push('fqty');
 if(af.conv) pool.push('conv');
 pool.push('mult','half');
 if(!pool.length) pool.push('mult');
 let q; const t=_pick(pool);
 if(t==='dmul'){ const base=_pick([10,100,1000]); const x=ri(11,boss?999:199)/10; q=_mkQ(`${_fr(x)} × ${base}`, x*base, 'x'); }
 else if(t==='ddiv'){ const base=_pick([10,100]); const n=ri(11,boss?999:499); q=_mkQ(`${n} ÷ ${base}`, n/base, '/'); }
 else if(t==='dadd'){ const a=ri(11,199)/10, b=ri(11,199)/10; q=_mkQ(`${_fr(a)} + ${_fr(b)}`, a+b, '+'); }
 else if(t==='fqty'){ const d=_pick([2,3,4,5,10]); const n=ri(1,d-1); const w=d*ri(2,boss?12:8); q=_mkQ(`${n}/${d} de ${w}`, w*n/d, '/'); }
 else if(t==='conv'){ const c=_pick([
    ()=>{const m=ri(2,9);return [`${m} m = ? cm`, m*100];},
    ()=>{const k=ri(2,9);return [`${k} km = ? m`, k*1000];},
    ()=>{const h=ri(2,6);return [`${h} h = ? min`, h*60];},
    ()=>{const m=ri(2,9);return [`${m} min = ? s`, m*60];},
    ()=>{const k=ri(2,9);return [`${k} kg = ? g`, k*1000];},
   ])(); q=_mkQ(c[0], c[1], '+'); }
 else if(t==='mult'){ const m=ri(2,9), rank=ri(2,boss?12:9); q=_mkQ(`Le ${rank}ᵉ multiple de ${m}`, m*rank, 'x'); }
 else { const v=ri(20,boss?198:98)*(_pick([1,1])); const isDouble=ri(0,1); if(isDouble){ q=_mkQ(`Le double de ${v}`, v*2, '+'); } else { const even=v*2; q=_mkQ(`La moitié de ${even}`, even/2, '/'); } }
 if(!q||_seenQ(q)) return genQ_6E(boss,_d+1);
 _trackQ(q); return q;
}

// ── 5ᵉ : relatifs (+/−), pourcentages simples, priorités opératoires
function genQ_5E(boss,_d=0){
 if(_d>14) return genQ_6E(boss);
 const af=getOpFilters(); const pool=[];
 if(af.rel) pool.push('radd','rsub');
 if(af.pct) pool.push('pct');
 pool.push('prio');
 let q; const t=_pick(pool); const M=boss?12:9;
 if(t==='radd'){ const a=ri(-M,M), b=ri(-M,M); q=_mkQ(`${_rel(a)} + ${_rel(b)}`, a+b, '+'); }
 else if(t==='rsub'){ const a=ri(-M,M), b=ri(-M,M); q=_mkQ(`${_rel(a)} − ${_rel(b)}`, a-b, '-'); }
 else if(t==='pct'){ const p=_pick([10,20,25,50,75,100]); const base=_pick([20,40,60,80,100,120,200]); q=_mkQ(`${p}% de ${base}`, base*p/100, 'pct'); }
 else { const a=ri(2,9), b=ri(2,9), c=ri(2,9); if(ri(0,1)) q=_mkQ(`${a} + ${b} × ${c}`, a+b*c, 'prio'); else q=_mkQ(`${a*c+ri(1,9)} − ${b} × ${c}`, (a*c+0)-(b*c), 'prio'); }
 if(!q||_seenQ(q)) return genQ_5E(boss,_d+1);
 _trackQ(q); return q;
}

// ── 4ᵉ : relatifs (× ÷), puissances, carrés (Pythagore), calcul littéral évalué
function genQ_4E(boss,_d=0){
 if(_d>14) return genQ_5E(boss);
 const af=getOpFilters(); const pool=[];
 if(af.rel) pool.push('rmul','rdiv');
 if(af.pow) pool.push('pow','pow10');
 if(af.lit) pool.push('lit');
 pool.push('carre');
 let q; const t=_pick(pool); const M=boss?12:9;
 if(t==='rmul'){ let a=ri(-M,M)||3, b=ri(-M,M)||2; q=_mkQ(`${_rel(a)} × ${_rel(b)}`, a*b, 'x'); }
 else if(t==='rdiv'){ const b=(ri(0,1)?1:-1)*ri(2,9); const res=(ri(0,1)?1:-1)*ri(2,9); q=_mkQ(`${_rel(b*res)} ÷ ${_rel(b)}`, res, '/'); }
 else if(t==='pow'){ const base=ri(2,9), exp=_pick([2,2,3]); q=_mkQ(`${base}${_supExp(exp)}`, Math.pow(base,exp), 'pow'); }
 else if(t==='pow10'){ const exp=ri(2,boss?6:4); q=_mkQ(`10${_supExp(exp)}`, Math.pow(10,exp), 'pow'); }
 else if(t==='lit'){ const x=ri(2,9), a=ri(2,5), b=ri(1,9); if(ri(0,1)) q=_mkQ(`Si x = ${x} :  ${a}x + ${b}`, a*x+b, 'lit'); else q=_mkQ(`Si x = ${x} :  ${a}x − ${b}`, a*x-b, 'lit'); }
 else { const a=ri(2,9), b=ri(2,9); q=_mkQ(`${a}² + ${b}²`, a*a+b*b, 'pow'); }
 if(!q||_seenQ(q)) return genQ_4E(boss,_d+1);
 _trackQ(q); return q;
}

// ── 3ᵉ : racines carrées, PGCD, pourcentages d'évolution, puissances, littéral
function genQ_3E(boss,_d=0){
 if(_d>14) return genQ_4E(boss);
 const af=getOpFilters(); const pool=[];
 if(af.sqrt) pool.push('sqrt');
 if(af.pgcd) pool.push('pgcd');
 if(af.pct)  pool.push('evol');
 if(af.pow)  pool.push('pow');
 if(af.lit)  pool.push('lit');
 if(!pool.length) pool.push('sqrt');
 let q; const t=_pick(pool);
 if(t==='sqrt'){ const r=ri(2,boss?15:12); q=_mkQ(`√${r*r}`, r, 'sqrt'); }
 else if(t==='pgcd'){ const g=ri(2,9), m=ri(2,8), n=ri(2,8); const a=g*m, b=g*n; q=_mkQ(`PGCD(${a} ; ${b})`, _pgcdN(a,b), 'pgcd'); }
 else if(t==='evol'){ const p=_pick([10,20,25,50]); const base=_pick([40,60,80,100,120,200]); if(ri(0,1)) q=_mkQ(`${base} augmenté de ${p}%`, base*(1+p/100), 'pct'); else q=_mkQ(`${base} diminué de ${p}%`, base*(1-p/100), 'pct'); }
 else if(t==='pow'){ const base=ri(2,boss?12:9), exp=_pick([2,2,3]); q=_mkQ(`${base}${_supExp(exp)}`, Math.pow(base,exp), 'pow'); }
 else { const x=ri(2,9), a=ri(2,6), b=ri(2,9); if(ri(0,1)) q=_mkQ(`Si x = ${x} :  ${a}x + ${b}`, a*x+b, 'lit'); else q=_mkQ(`Si x = ${x} :  ${a}(x + ${b})`, a*(x+b), 'lit'); }
 if(!q||_seenQ(q)) return genQ_3E(boss,_d+1);
 _trackQ(q); return q;
}
