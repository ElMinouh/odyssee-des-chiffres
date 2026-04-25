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
const GEN={CP:genQ_CP,CE1:genQ_CE1,CE2:genQ_CE2,CM1:genQ_CM1,CM2:genQ_CM2};
function getOpFilters(){
 const f=P.opFilters||{};const def={add:true,sub:true,mult:true,div:true,miss:true,frac:true,geo:true};
 return {...def,...f};
}
