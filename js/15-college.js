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

// ════════════════ Chantier C2 : Calcul littéral & équations (5e→3e) ════════════════
// Choix d'expressions (chaînes), distracteurs = erreurs classiques (oubli de
// distribuer, confusion + / ×, terme constant transformé en x…).
function _colChoicesTxt(correct, distractors){
 const set = new Set([correct]);
 for(const d of (distractors || [])){ if(set.size >= 4) break; if(d && d !== correct) set.add(d); }
 const arr = (typeof shuffle === 'function' ? shuffle([...set]) : [...set]);
 return { choices: arr.map((v,i)=>({ val:i, label:v })), res: arr.indexOf(correct) };
}
function _xterm(c){ if(c === 0) return '0'; if(c === 1) return 'x'; if(c === -1) return '−x'; return _colFmt(c) + 'x'; }
function _affine(a, b){ if(a === 0) return _colFmt(b); let s = _xterm(a); if(b > 0) s += ' + ' + b; else if(b < 0) s += ' − ' + Math.abs(b); return s; }

// Modèle d'aire : rectangle de hauteur k découpé en (x | b) → k·x et k·b
function _colAireHtml(k, xlab, b){
 const wx = 60, wb = Math.max(28, b * 6);
 return `<div class="coll-area"><div class="ca-top"><span style="flex:${wx}">${xlab}</span><span style="flex:${wb}">${b}</span></div>`
  + `<div class="ca-row"><div class="ca-side">${k}</div><div class="ca-cells">`
  + `<div class="ca-cell ca-x" style="flex:${wx}">${k}·${xlab}</div>`
  + `<div class="ca-cell ca-b" style="flex:${wb}">${k}·${b}</div></div></div></div>`;
}
// Balance d'équation : plateau gauche (ax+b) = plateau droit (c)
function _colBalanceHtml(a, b, c){
 const left = `${a}·<span class="cb-x">x</span>` + (b > 0 ? ` + ${b}` : (b < 0 ? ` − ${Math.abs(b)}` : ''));
 return `<div class="coll-balance"><div class="cb-beam"></div>`
  + `<div class="cb-pans"><div class="cb-pan"><div class="cb-val">${left}</div></div>`
  + `<div class="cb-pivot">⚖️</div><div class="cb-pan"><div class="cb-val">${c}</div></div></div></div>`;
}

// Substituer : évaluer ax+b pour une valeur de x (sens du calcul littéral)
function _colLitSubstituer(level){
 const m = Math.max(3, Math.min(_colMag(level), 12));
 const a = ri(2,5), b = ri(-m, m), x = ri(1,6); const correct = a*x + b;
 const { choices, res } = _colChoices(correct, [a + x + b, a*x - b, a*(x + b), -correct]);
 return { display:`Pour x = ${x}, combien vaut ${_affine(a,b)} ?`, choices, res, type:'normal', opKey:'litt', img:'' };
}
// Tester une égalité (sens relationnel du « = »)
function _colLitEgalite(level){
 const x = ri(2,6), a = ri(2,5); const lhs = a*x; const vrai = ri(0,1) === 1;
 const rhs = vrai ? lhs : lhs + _colPick([-2,-1,1,2,3]);
 const opts = ['Vrai','Faux']; const correct = vrai ? 'Vrai' : 'Faux';
 return { display:`Pour x = ${x} : l'égalité ${a}x = ${rhs} est-elle vraie ?`,
  choices: opts.map((v,i)=>({val:i, label:v})), res: opts.indexOf(correct), type:'normal', opKey:'litt', img:'' };
}
// Réduire une expression (regrouper les termes semblables)
function _colLitReduire(level){
 const a = ri(2,6), b = ri(1,5);
 if(_colFactor(level) > 0.45 && ri(0,1) === 1){
  const c = ri(1,6), d = ri(1,6);
  const correct = _affine(a + b, c + d);
  const { choices, res } = _colChoicesTxt(correct, [_affine(a + b, c), _affine(a*b, c + d), `${a+b+c+d}x`, _affine(a + b + c + d, 0)]);
  return { display:`Réduis : ${a}x + ${c} + ${b}x + ${d}`, choices, res, type:'normal', opKey:'litt', img:'' };
 }
 const correct = _xterm(a + b);
 const { choices, res } = _colChoicesTxt(correct, [`${a+b}`, _xterm(a*b), `${a+b}x²`]);
 return { display:`Réduis : ${a}x + ${b}x`, choices, res, type:'normal', opKey:'litt', img:'' };
}
// Développer k(x+b) — illustré par le modèle d'aire
function _colLitDevelopper(level){
 const k = ri(2,6), b = ri(2,9); const correct = `${k}x + ${k*b}`;
 const { choices, res } = _colChoicesTxt(correct, [`${k}x + ${b}`, `x + ${k*b}`, `${k+1}x + ${k*b}`, `${k}x + ${k+b}`]);
 return { display:`Développe : ${k}(x + ${b})`, visualHtml:_colAireHtml(k, 'x', b), choices, res, type:'normal', opKey:'litt', img:'' };
}
// Factoriser kx+kb → k(x+b)
function _colLitFactoriser(level){
 const k = ri(2,6), b = ri(2,8); const A = k, B = k*b; const correct = `${k}(x + ${b})`;
 const { choices, res } = _colChoicesTxt(correct, [`${k}(x + ${b*k})`, `${k}(${b}x + 1)`, `${A}(x + ${B})`, `x(${k} + ${b})`]);
 return { display:`Factorise : ${A}x + ${B}`, choices, res, type:'normal', opKey:'litt', img:'' };
}
// Programme de calcul (plusieurs étapes)
function _colLitProgramme(level){
 const p = ri(2,4), q = ri(1,9), n = ri(2,8); const correct = n*p + q;
 const { choices, res } = _colChoices(correct, [n + p + q, (n + p)*q, n*p - q, correct + _colPick([-2,2])]);
 return { display:`Programme : choisis ${n}, multiplie par ${p}, ajoute ${q}. Résultat ?`, choices, res, type:'normal', opKey:'litt', img:'' };
}
// Résoudre ax+b=c (balance), x entier
function _colLitEquation(level){
 const a = ri(2,5), x = ri(1,8), b = ri(-9, 9); const c = a*x + b;
 const { choices, res } = _colChoices(x, [c - b, c + b, Math.round(c / a), x + 1]);
 return { display:`Résous : ${_affine(a,b)} = ${c}   (trouve x)`, visualHtml:_colBalanceHtml(a, b, c), choices, res, type:'normal', opKey:'litt', img:'' };
}

// ════════════════ Chantier C3 : Proportionnalité & fonctions (5e→3e) ════════════════
// Plan repère SVG (clip automatique au viewBox). opKey 'prop' / 'fonc'.
function _colXY(x, y, R){ const W = 220, pad = 20, u = (W - 2*pad) / (2*R); return [ (pad + (x + R)*u).toFixed(1), (W - (pad + (y + R)*u)).toFixed(1) ]; }
function _colGridSvg(R){
 const W = 220, pad = 20; let g = '';
 for(let i = -R; i <= R; i++){ const vx = _colXY(i,0,R)[0], hy = _colXY(0,i,R)[1];
  g += `<line x1="${vx}" y1="${pad}" x2="${vx}" y2="${W-pad}" class="cg-grid"/>`;
  g += `<line x1="${pad}" y1="${hy}" x2="${W-pad}" y2="${hy}" class="cg-grid"/>`; }
 const o = _colXY(0,0,R);
 g += `<line x1="${pad}" y1="${o[1]}" x2="${W-pad}" y2="${o[1]}" class="cg-axis"/>`;
 g += `<line x1="${o[0]}" y1="${pad}" x2="${o[0]}" y2="${W-pad}" class="cg-axis"/>`;
 return g;
}
function _colRepereSvg(pts, R){
 let m = '';
 for(const p of pts){ const c = _colXY(p.x, p.y, R); m += `<circle cx="${c[0]}" cy="${c[1]}" r="4.5" class="cg-pt"/><text x="${+c[0]+7}" y="${+c[1]-6}" class="cg-ptlab">${p.label}</text>`; }
 return `<div class="coll-plane"><svg viewBox="0 0 220 220">${_colGridSvg(R)}${m}</svg></div>`;
}
function _colFoncSvg(a, b, R, rx){
 const p = _colXY(-R, a*(-R)+b, R), q = _colXY(R, a*R+b, R);
 const img = a*rx + b; const pt = _colXY(rx, img, R); const oX = _colXY(0,0,R)[0]; const ax0 = _colXY(0,0,R)[1];
 const read = `<line x1="${pt[0]}" y1="${ax0}" x2="${pt[0]}" y2="${pt[1]}" class="cg-read"/>`
  + `<line x1="${oX}" y1="${pt[1]}" x2="${pt[0]}" y2="${pt[1]}" class="cg-read"/>`
  + `<circle cx="${pt[0]}" cy="${pt[1]}" r="4" class="cg-pt"/>`;
 return `<div class="coll-plane"><svg viewBox="0 0 220 220">${_colGridSvg(R)}<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" class="cg-line"/>${read}</svg></div>`;
}

// Proportionnalité : prix unitaire (tableau implicite)
function _colPropCoef(level){
 const u = ri(2,6), k = ri(2,6); let n = ri(2,9); if(n === u) n++; const price = u*k; const ans = n*k;
 const ctx = _colPick([`${u} stylos coûtent ${price} €. Combien coûtent ${n} stylos ?`,
                       `${u} kg de pommes coûtent ${price} €. Prix de ${n} kg ?`]);
 const { choices, res } = _colChoices(ans, [price + (n - u), n*u, ans + k, ans - k]);
 return { display:ctx, choices, res, type:'normal', opKey:'prop', img:'' };
}
// Quatrième proportionnelle (tableau)
function _colPropQuatrieme(level){
 const k = ri(2,5), a = ri(2,6); let c = ri(2,9); if(c === a) c++; const b = a*k, d = c*k;
 const { choices, res } = _colChoices(d, [c + (b - a), b + (c - a), d + k, d - k]);
 return { display:`Tableau proportionnel : ${a} → ${b} ; ${c} → ?`, choices, res, type:'normal', opKey:'prop', img:'' };
}
// Pourcentage d'une quantité
function _colPourcentage(level){
 const p = _colPick([5,10,20,25,50,75]); const base = ri(1,10)*20; const ans = Math.round(base*p/100);
 const { choices, res } = _colChoices(ans, [base - ans, Math.round(base*p/10), ans + p, base - p]);
 return { display:`Combien font ${p} % de ${base} ?`, choices, res, type:'normal', opKey:'prop', img:'' };
}
// Évolution en pourcentage (hausse / baisse)
function _colPourcentEvol(level){
 const p = _colPick([10,20,25,50]); const base = ri(2,10)*20; const up = ri(0,1) === 1;
 const delta = Math.round(base*p/100); const ans = up ? base + delta : base - delta;
 const { choices, res } = _colChoices(ans, [up ? base - delta : base + delta, delta, base + (up ? p : -p), base]);
 return { display:`Un article à ${base} € ${up?'augmente':'baisse'} de ${p} %. Nouveau prix ?`, choices, res, type:'normal', opKey:'prop', img:'' };
}
// Repérage dans le plan : identifier un point
function _colRepere(level){
 const R = 5; const used = new Set(); const pts = []; const L = ['A','B','C'];
 while(pts.length < 3){ const x = ri(-R+1, R-1), y = ri(-R+1, R-1); const key = x+','+y; if(used.has(key)) continue; used.add(key); pts.push({x, y, label:L[pts.length]}); }
 const ti = ri(0,2); const t = pts[ti];
 return { display:`Quel point a pour coordonnées (${_colFmt(t.x)} ; ${_colFmt(t.y)}) ?`,
  visualHtml:_colRepereSvg(pts, R), choices:L.map((l,i)=>({val:i, label:l})), res:ti, type:'normal', opKey:'fonc', img:'' };
}
// Lire l'image d'un nombre sur le graphique d'une fonction
function _colFoncImage(level){
 const a = _colPick([1,2,-1,-2]); const b = ri(-2,2); const R = 6; const rx = ri(-2,2); const ans = a*rx + b;
 const { choices, res } = _colChoices(ans, [a*rx - b, rx, -ans, ans + 1]);
 return { display:`Sur le graphique, quelle est l'image de ${_colFmt(rx)} ?`,
  visualHtml:_colFoncSvg(a, b, R, rx), choices, res, type:'normal', opKey:'fonc', img:'' };
}
// Calculer une image f(x) = ax + b (notation fonction)
function _colFoncCalc(level){
 const a = ri(2,5), b = ri(-6,6), x = ri(1,6); const ans = a*x + b;
 const { choices, res } = _colChoices(ans, [a + x + b, a*x - b, a*(x + b), -ans]);
 return { display:`f(x) = ${_affine(a,b)}. Combien vaut f(${x}) ?`, choices, res, type:'normal', opKey:'fonc', img:'' };
}
// Reconnaître fonction linéaire (passe par l'origine) vs affine
function _colFoncLinAff(level){
 const a = _colPick([2,3,-2,1]); const lin = ri(0,1) === 1; const b = lin ? 0 : _colPick([1,2,3,-2]);
 const opts = ['Linéaire','Affine']; const correct = lin ? 'Linéaire' : 'Affine';
 return { display:`La fonction f(x) = ${_affine(a,b)} est-elle linéaire ou affine ?`,
  choices:opts.map((v,i)=>({val:i, label:v})), res:opts.indexOf(correct), type:'normal', opKey:'fonc', img:'' };
}

// ── Phases (.ph) : 1 = début d'année, 2 = milieu, 3 = fin ──────────────
const _COL_PH = {
 _colRelComparer:1, _colRelDroite:1,
 _colRelAddSous:2, _colRelDeplacement:2,
 _colRelMul:3, _colRelDiv:3,
 _colLitSubstituer:1, _colLitEgalite:1,
 _colLitReduire:2, _colLitDevelopper:2, _colLitProgramme:2,
 _colLitFactoriser:3, _colLitEquation:3,
 _colPropCoef:1, _colRepere:1,
 _colPropQuatrieme:2, _colPourcentage:2, _colFoncImage:2, _colFoncCalc:2,
 _colPourcentEvol:3, _colFoncLinAff:3,
};
for(const name in _COL_PH){ try{ const f = eval(name); if(typeof f === 'function') f.ph = _COL_PH[name]; }catch(e){} }

// ── Pools par niveau (6e = cycle 3, pas de relatifs → rempli plus tard) ──
const _COL_POOL = {
 '6E': [],
 '5E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement,
        _colLitSubstituer, _colLitEgalite, _colLitReduire, _colLitDevelopper, _colLitProgramme,
        _colRepere, _colPropCoef, _colPropQuatrieme],
 '4E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv,
        _colLitSubstituer, _colLitEgalite, _colLitReduire, _colLitDevelopper, _colLitProgramme, _colLitFactoriser, _colLitEquation,
        _colPropCoef, _colPropQuatrieme, _colPourcentage, _colPourcentEvol],
 '3E': [_colRelComparer, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv,
        _colLitReduire, _colLitDevelopper, _colLitFactoriser, _colLitEquation, _colLitProgramme,
        _colPropQuatrieme, _colPourcentage, _colPourcentEvol, _colRepere, _colFoncImage, _colFoncCalc, _colFoncLinAff],
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
