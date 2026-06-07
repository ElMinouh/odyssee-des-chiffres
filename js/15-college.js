// ════════════════════════════════════════════════════════════════════
// 15-college.js — Enrichissement COLLÈGE (6e→3e)
// Exercices à choix (socle visuel : visualHtml + choices) injectés par
// generateQ() hors boss. Difficulté évolutive via la PHASE d'année (.ph)
// et le facteur _progFactor (plages qui s'élargissent).
// RÈGLE P9.1 : chaque générateur DOIT porter une phase .ph (voir bloc PH).
// ════════════════════════════════════════════════════════════════════

const _COL_LEVELS = ['6E', '5E', '4E', '3E'];
function _colPick(a){ return a[ri(0, a.length - 1)]; }
function _colFmt(n){ return (n < 0 ? '−' : '') + Math.abs(n); }      // affichage relatif : −5 / 7
function _par(n){ return n < 0 ? `(${_colFmt(n)})` : `${n}`; }       // (−5) entre parenthèses
function _colFactor(level){ return (typeof _progFactor === 'function') ? _progFactor(level) : 1; }
// Amplitude des nombres : grandit avec le niveau ET la progression d'année
function _colMag(level){
 const base  = {'5E':6, '4E':10, '3E':12}[level] || 8;
 const extra = {'5E':6, '4E':12, '3E':18}[level] || 8;
 return Math.max(3, Math.round(base + extra * _colFactor(level)));
}
// Construit 4 choix : bonne réponse + distracteurs (dont erreurs de signe), res = index
function _colChoices(correct, distractors){
 const set = new Set([correct]);
 for(const d of (distractors || [])){ if(set.size >= 4) break; if(Number.isFinite(d) && d !== correct) set.add(d); }
 let g = 0;
 while(set.size < 4 && g++ < 40){ const c = correct + _colPick([-3,-2,-1,1,2,3]); if(c !== correct) set.add(c); }
 const arr = (typeof shuffle === 'function' ? shuffle([...set]) : [...set]);
 return { choices: arr.map((v,i)=>({ val:i, label:_colFmt(v) })), res: arr.indexOf(correct) };
}

// ════════════════ Chantier C1 : Nombres relatifs (5e→3e) ════════════════
// Droite graduée incluant les négatifs (réutilise l'axe, classes cl-*)
function _colLineHtml(min, max, markers){
 const span = max - min; const pct = v => ((v - min) / span * 100);
 const step = span <= 12 ? 1 : Math.ceil(span / 12);
 let ticks = '';
 for(let v = min; v <= max; v += step){
  ticks += `<span class="cl-tick${v===0?' cl-zero':''}" style="left:${pct(v)}%"><span class="cl-lab">${_colFmt(v)}</span></span>`;
 }
 const mk = markers.map(m => `<span class="cl-mark" style="left:${pct(m.v)}%"><span class="cl-mark-lab">${m.label}</span><span class="cl-arrow">▼</span></span>`).join('');
 return `<div class="coll-line"><div class="cl-axis"></div>${ticks}${mk}</div>`;
}

// Comparer deux relatifs (le piège : −7 < −3)
function _colRelComparer(level){
 const m = _colMag(level);
 let a = ri(-m, m), b = ri(-m, m), t = 0; while(b === a && t++ < 6) b = ri(-m, m);
 const big = ri(0,1) === 1; const correct = big ? Math.max(a,b) : Math.min(a,b);
 const opts = (typeof shuffle==='function'?shuffle([a,b]):[a,b]);
 return { display:`Quel est le plus ${big?'grand':'petit'} : ${_colFmt(a)} ou ${_colFmt(b)} ?`,
  choices: opts.map((v,i)=>({val:i, label:_colFmt(v)})), res: opts.indexOf(correct),
  type:'normal', opKey:'rel', img:'' };
}
// Localiser un relatif sur la droite graduée
function _colRelDroite(level){
 const m = Math.max(4, Math.min(_colMag(level), 10)); const min = -m, max = m;
 const vals = new Set(); while(vals.size < 3) vals.add(ri(min+1, max-1));
 const arr = [...vals]; const L = ['A','B','C']; const ti = ri(0,2); const N = arr[ti];
 return { display:`Quel point montre ${_colFmt(N)} ?`,
  visualHtml: _colLineHtml(min, max, arr.map((v,i)=>({v, label:L[i]}))),
  choices: L.map((l,i)=>({val:i, label:l})), res: ti,
  type:'normal', opKey:'rel', img:'' };
}
// Addition / soustraction de relatifs
function _colRelAddSous(level){
 const m = _colMag(level); const a = ri(-m, m), b = ri(-m, m); const sub = ri(0,1) === 1;
 const correct = sub ? a - b : a + b;
 const disp = `${_par(a)} ${sub?'−':'+'} ${_par(b)} = ?`;
 const { choices, res } = _colChoices(correct, [-correct, sub ? a+b : a-b, a-Math.abs(b)]);
 return { display:disp, choices, res, type:'normal', opKey:'rel', img:'' };
}
// Déplacement contextualisé (température, ascenseur)
function _colRelDeplacement(level){
 const m = Math.min(_colMag(level), 15); const start = ri(-m, m); const up = ri(0,1) === 1; const d = ri(1, m);
 const correct = up ? start + d : start - d;
 const disp = _colPick([
  `Il fait ${_colFmt(start)}°C. La température ${up?'monte':'descend'} de ${d}°. Quelle température ?`,
  `L'ascenseur est à l'étage ${_colFmt(start)}. Il ${up?'monte':'descend'} de ${d} étages. Quel étage ?`
 ]);
 const { choices, res } = _colChoices(correct, [start, up ? start-d : start+d, -correct]);
 return { display:disp, choices, res, type:'normal', opKey:'rel', img:'' };
}
// Multiplication de relatifs (règle des signes)
function _colRelMul(level){
 const m = Math.min(_colMag(level), 12); const a = ri(-m, m) || 2, b = ri(-m, m) || 2; const correct = a * b;
 const { choices, res } = _colChoices(correct, [-correct, Math.abs(correct), -Math.abs(correct)]);
 return { display:`${_par(a)} × ${_par(b)} = ?`, choices, res, type:'normal', opKey:'rel', img:'' };
}
// Division de relatifs (résultat entier garanti)
function _colRelDiv(level){
 const m = Math.min(_colMag(level), 12);
 const b = (ri(0,1)?1:-1) * ri(2, m); const q = (ri(0,1)?1:-1) * ri(2, m); const a = b * q;
 const { choices, res } = _colChoices(q, [-q, Math.abs(q), -Math.abs(q)]);
 return { display:`${_par(a)} ÷ ${_par(b)} = ?`, choices, res, type:'normal', opKey:'rel', img:'' };
}

// ── Phases (.ph) : 1 = début d'année, 2 = milieu, 3 = fin ──────────────
const _COL_PH = {
 _colRelComparer:1, _colRelDroite:1,
 _colRelAddSous:2, _colRelDeplacement:2,
 _colRelMul:3, _colRelDiv:3,
};
for(const name in _COL_PH){ try{ const f = eval(name); if(typeof f === 'function') f.ph = _COL_PH[name]; }catch(e){} }

// ── Pools par niveau (6e = cycle 3, pas de relatifs → rempli plus tard) ──
const _COL_POOL = {
 '6E': [],
 '5E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement],
 '4E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv],
 '3E': [_colRelComparer, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv],
};

// ── Tirage : sac sans remise, filtré par la phase d'année du niveau ──────
const _colBags = {}; const _colBagPhase = {};
function _collEnrich(level){
 const pool = _COL_POOL[level];
 if(!pool || !pool.length) return null;
 const phase = (typeof _progPhase === 'function') ? _progPhase(level) : 3;
 if(_colBagPhase[level] !== phase){ _colBags[level] = null; _colBagPhase[level] = phase; }
 let bag = _colBags[level];
 if(!bag || !bag.length){
  let avail = pool.filter(f => ((f && f.ph) || 1) <= phase);
  if(!avail.length) avail = pool.slice();
  bag = _colBags[level] = (typeof shuffle === 'function' ? shuffle(avail.slice()) : avail.slice());
 }
 const fn = bag.pop();
 try{ return fn(level); }
 catch(e){ return null; }
}
