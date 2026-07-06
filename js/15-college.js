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

// ════════════════ Chantier C4 : Géométrie du raisonnement (5e→3e) ════════════════
// Les valeurs figurent dans l'énoncé (vérifiables) ; la figure illustre. opKey 'geo'.
// Helpers de tracé : étiquette texte + arc d'angle (polyline) exact
function _gT(x,y,t,c){ return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" class="gt-lab ${c||''}">${t}</text>`; }
function _gArc(vx,vy,th1,th2,R){
 let d=th2-th1; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI;
 const N=16,pts=[]; for(let i=0;i<=N;i++){ const a=th1+d*i/N; pts.push((vx+R*Math.cos(a)).toFixed(1)+','+(vy+R*Math.sin(a)).toFixed(1)); }
 return { line:`<polyline points="${pts.join(' ')}" class="gt-ang"/>`, mid:th1+d/2 };
}

// Triangle rectangle (Pythagore / trigonométrie), côtés proportionnels
function _colRightTriSvg(o){
 const ax=36, baseY=128;
 if(o.trig){
  const sc=30, A=[ax,baseY], B=[ax+4*sc,baseY], C=[ax,baseY-3*sc];
  const arc=_gArc(B[0],B[1],Math.atan2(A[1]-B[1],A[0]-B[0]),Math.atan2(C[1]-B[1],C[0]-B[0]),26);
  let m=`<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" class="gt-fill"/>`;
  m+=`<path d="M${ax+16},${baseY} L${ax+16},${baseY-16} L${ax},${baseY-16}" class="gt-sq"/>`;
  m+=`<line x1="${B[0]}" y1="${B[1]}" x2="${C[0]}" y2="${C[1]}" class="gt-hyp"/>${arc.line}`;
  m+=_gT((A[0]+C[0])/2-14,(A[1]+C[1])/2,'opp','gt-side')+_gT((A[0]+B[0])/2,baseY+16,'adj','gt-side')+_gT((B[0]+C[0])/2+12,(B[1]+C[1])/2-4,'hyp','gt-side');
  return `<div class="coll-geo"><svg viewBox="0 0 200 150">${m}</svg></div>`;
 }
 const scale=78/Math.max(o.a,o.b), A=[ax,baseY], B=[ax+o.a*scale,baseY], C=[ax,baseY-o.b*scale];
 const pill=(x,y)=>`<g class="gt-q"><rect x="${(x-13).toFixed(1)}" y="${(y-14).toFixed(1)}" width="26" height="20" rx="10"/><text x="${(+x).toFixed(1)}" y="${(y+1).toFixed(1)}" class="gt-qt">?</text></g>`;
 let m=`<polygon points="${A[0]},${A[1]} ${B[0].toFixed(1)},${B[1]} ${C[0]},${C[1].toFixed(1)}" class="gt-fill"/>`;
 m+=`<path d="M${ax+16},${baseY} L${ax+16},${baseY-16} L${ax},${baseY-16}" class="gt-sq"/>`;
 m+=`<line x1="${B[0].toFixed(1)}" y1="${B[1]}" x2="${C[0]}" y2="${C[1].toFixed(1)}" class="gt-hyp"/>`;
 const mbx=(A[0]+B[0])/2, lby=(A[1]+C[1])/2, hx=(B[0]+C[0])/2+12, hy=(B[1]+C[1])/2-4;
 m+=(o.unknown==='a')?pill(mbx,baseY+16):_gT(mbx,baseY+18,o.a);
 m+=(o.unknown==='b')?pill(ax-16,lby):_gT(ax-16,lby+4,o.b);
 m+=(o.unknown==='hyp')?pill(hx,hy):_gT(hx,hy,o.hyp);
 return `<div class="coll-geo"><svg viewBox="0 0 200 150">${m}</svg></div>`;
}
// Triangle quelconque construit à partir de ses angles de base (arcs exacts)
function _colTriAngSvg(a,b){
 const rad=Math.PI/180, ta=Math.tan(a*rad), tb=Math.tan(b*rad);
 const ux=tb/(ta+tb), uy=ux*ta, scale=Math.min(150,86/uy), x0=33, baseY=128;
 const B=[x0,baseY], C=[x0+scale,baseY], A=[x0+ux*scale,baseY-uy*scale];
 const arcAt=(V,P,Q,R,lab,cls)=>{ const w=_gArc(V[0],V[1],Math.atan2(P[1]-V[1],P[0]-V[0]),Math.atan2(Q[1]-V[1],Q[0]-V[0]),R); return w.line+_gT(V[0]+(R+11)*Math.cos(w.mid),V[1]+(R+11)*Math.sin(w.mid)+4,lab,cls); };
 let m=`<polygon points="${B[0]},${B[1]} ${C[0].toFixed(1)},${C[1]} ${A[0].toFixed(1)},${A[1].toFixed(1)}" class="gt-fill"/>`;
 m+=arcAt(B,C,A,22,a+'°')+arcAt(C,B,A,22,b+'°')+arcAt(A,B,C,17,'?','gt-angl2');
 return `<div class="coll-geo"><svg viewBox="0 0 216 150">${m}</svg></div>`;
}
// Deux parallèles + sécante : angle donné et angle cherché placés selon le type
function _colParallelSvg(x,kind){
 const topY=46, botY=104, sx=66, sy1=16, ex=150, ey2=134, dirx=ex-sx, diry=ey2-sy1;
 const at=yy=>[sx+dirx*((yy-sy1)/diry),yy]; const Pt=at(topY), Pb=at(botY);
 let m=`<line x1="22" y1="${topY}" x2="194" y2="${topY}" class="gt-par"/><line x1="22" y1="${botY}" x2="194" y2="${botY}" class="gt-par"/>`;
 m+=`<path d="M40,${topY-5} l7,5 l-7,5" class="gt-tick"/><path d="M40,${botY-5} l7,5 l-7,5" class="gt-tick"/>`;
 m+=`<line x1="${sx}" y1="${sy1}" x2="${ex}" y2="${ey2}" class="gt-sec"/>`;
 const gA=_gArc(Pt[0],Pt[1],0,Math.atan2(diry,dirx),16);
 m+=gA.line+_gT(Pt[0]+22*Math.cos(gA.mid),Pt[1]+22*Math.sin(gA.mid)+4,x+'°','gt-angl');
 const qA=(kind==='correspondant')?_gArc(Pb[0],Pb[1],0,Math.atan2(diry,dirx),16):_gArc(Pb[0],Pb[1],Math.PI,Math.atan2(-diry,-dirx),16);
 m+=qA.line+_gT(Pb[0]+22*Math.cos(qA.mid),Pb[1]+22*Math.sin(qA.mid)+4,'?','gt-angl2');
 return `<div class="coll-geo"><svg viewBox="0 0 210 150">${m}</svg></div>`;
}
// Thalès : M et N placés proportionnellement (AM/AB = AN/AC)
function _colThalesSvg(am,ab,an){
 const A=[108,26], B=[34,150], C=[182,150], r=am/ab;
 const M=[A[0]+r*(B[0]-A[0]),A[1]+r*(B[1]-A[1])], N=[A[0]+r*(C[0]-A[0]),A[1]+r*(C[1]-A[1])];
 const mid=(P,Q)=>[(P[0]+Q[0])/2,(P[1]+Q[1])/2]; const AM=mid(A,M),MB=mid(M,B),AN=mid(A,N),NC=mid(N,C);
 let m=`<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" class="gt-fill"/>`;
 m+=`<line x1="${M[0].toFixed(1)}" y1="${M[1].toFixed(1)}" x2="${N[0].toFixed(1)}" y2="${N[1].toFixed(1)}" class="gt-hyp"/>`;
 m+=`<path d="M${((M[0]+N[0])/2-2).toFixed(1)},${((M[1]+N[1])/2-5).toFixed(1)} l5,5 l-5,5" class="gt-tick"/><path d="M106,145 l5,5 l-5,5" class="gt-tick"/>`;
 m+=_gT(A[0],A[1]-8,'A')+_gT(B[0]-10,B[1]+4,'B')+_gT(C[0]+10,C[1]+4,'C');
 m+=_gT(AM[0]-17,AM[1],'AM='+am,'gt-side')+_gT(MB[0]-17,MB[1],'AB='+ab,'gt-side')+_gT(AN[0]+19,AN[1],'AN='+an,'gt-side')+_gT(NC[0]+21,NC[1],'AC=?','gt-q2');
 return `<div class="coll-geo"><svg viewBox="0 0 220 172">${m}</svg></div>`;
}
// ── Figures C5 (aires, volumes, stats, probas) ──
function _colRectSvg(L,l){ const s=Math.min(140/L,66/l), w=L*s, h=l*s, x=(200-w)/2, y=18;
 return `<div class="coll-geo"><svg viewBox="0 0 200 ${(y+h+34).toFixed(0)}"><rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" class="gt-fill"/>${_gT(100,y+h+18,'L = '+L)}${_gT(x-16,y+h/2+4,'l = '+l,'gt-side')}</svg></div>`; }
function _colTriBaseHSvg(b,h){ const s=Math.min(150/b,66/h), bw=b*s, hh=h*s, x0=(200-bw)/2, baseY=18+hh, apx=x0+bw*0.42;
 return `<div class="coll-geo"><svg viewBox="0 0 200 ${(baseY+30).toFixed(0)}"><polygon points="${x0.toFixed(1)},${baseY.toFixed(1)} ${(x0+bw).toFixed(1)},${baseY.toFixed(1)} ${apx.toFixed(1)},18" class="gt-fill"/><line x1="${apx.toFixed(1)}" y1="18" x2="${apx.toFixed(1)}" y2="${baseY.toFixed(1)}" class="gt-h"/>${_gT(x0+bw/2,baseY+18,'base = '+b)}${_gT(apx+18,(18+baseY)/2,'h = '+h,'gt-side')}</svg></div>`; }
function _colDiskSvg(r){ const R=Math.min(48,16+r*4), cx=100, cy=R+16;
 return `<div class="coll-geo"><svg viewBox="0 0 200 ${(cy+R+22).toFixed(0)}"><circle cx="${cx}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" class="gt-fill"/><line x1="${cx}" y1="${cy.toFixed(1)}" x2="${(cx+R).toFixed(1)}" y2="${cy.toFixed(1)}" class="gt-hyp"/>${_gT(cx+R/2,cy-6,'r = '+r,'gt-angl')}</svg></div>`; }
function _colPaveSvg(L,l,h){ const x=58,y=44,w=82,ht=52,dx=26,dy=18;
 let m=`<polygon points="${x},${y} ${x+dx},${y-dy} ${x+w+dx},${y-dy} ${x+w},${y}" class="gt-face2"/>`;
 m+=`<polygon points="${x+w},${y} ${x+w+dx},${y-dy} ${x+w+dx},${y+ht-dy} ${x+w},${y+ht}" class="gt-face3"/>`;
 m+=`<rect x="${x}" y="${y}" width="${w}" height="${ht}" class="gt-fill"/>`;
 m+=_gT(x+w/2,y+ht+18,'L = '+L)+_gT(x-14,y+ht/2+4,'l = '+l,'gt-side')+_gT(x+w+dx+16,y+ht/2-dy/2,'h = '+h,'gt-side');
 return `<div class="coll-geo"><svg viewBox="0 0 220 ${y+ht+30}">${m}</svg></div>`; }
function _colCylSvg(r,h){ const cx=100, rx=Math.min(34,12+r*4), ry=Math.round(rx*0.34), top=24, bh=Math.min(78,28+h*5), bot=top+bh;
 let m=`<rect x="${cx-rx}" y="${top}" width="${rx*2}" height="${bh}" class="gt-fill"/>`;
 m+=`<ellipse cx="${cx}" cy="${bot}" rx="${rx}" ry="${ry}" class="gt-face3"/><ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" class="gt-face2"/>`;
 m+=`<line x1="${cx}" y1="${top}" x2="${cx+rx}" y2="${top}" class="gt-hyp"/>${_gT(cx+rx/2,top-6,'r = '+r,'gt-angl')}`;
 m+=`<line x1="${cx-rx-12}" y1="${top}" x2="${cx-rx-12}" y2="${bot}" class="gt-h"/>${_gT(cx-rx-26,(top+bot)/2,'h = '+h,'gt-side')}`;
 return `<div class="coll-geo"><svg viewBox="0 0 200 ${bot+ry+22}">${m}</svg></div>`; }
function _colBarChartSvg(vals){ const max=Math.max(...vals,1), n=vals.length, bw=22, gap=12, x0=24, baseY=104, W=x0*2+n*bw+(n-1)*gap;
 let m=`<line x1="14" y1="${baseY}" x2="${W-8}" y2="${baseY}" class="gt-par"/>`;
 vals.forEach((v,i)=>{ const hh=Math.round(v/max*70)+4, x=x0+i*(bw+gap); m+=`<rect x="${x}" y="${baseY-hh}" width="${bw}" height="${hh}" class="gt-bar"/>`+_gT(x+bw/2,baseY+16,v); });
 return `<div class="coll-geo"><svg viewBox="0 0 ${W} ${baseY+26}">${m}</svg></div>`; }
function _colBallsSvg(r,b){ const per=20,x0=22,y=42,tot=r+b,W=Math.max(120,x0*2+(tot-1)*per+16); let m=`<rect x="8" y="18" width="${W-16}" height="46" rx="12" class="gt-sac"/>`; let i=0;
 for(let k=0;k<r;k++,i++) m+=`<circle cx="${x0+i*per}" cy="${y}" r="9" class="gt-red"/>`;
 for(let k=0;k<b;k++,i++) m+=`<circle cx="${x0+i*per}" cy="${y}" r="9" class="gt-blue"/>`;
 return `<div class="coll-geo"><svg viewBox="0 0 ${W} 78">${m}</svg></div>`; }

const _PYTH_TRIPLES = [[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[20,21,29]];
// Pythagore : longueur de l'hypoténuse
function _colPythHyp(level){
 const t = _colPick(_PYTH_TRIPLES); const ans = t[2];
 const { choices, res } = _colChoices(ans, [t[0] + t[1], ans + 1, ans - 1, t[1] + 1]);
 return { display:`Triangle rectangle, côtés de l'angle droit : ${t[0]} et ${t[1]}. Longueur de l'hypoténuse ?`,
  visualHtml:_colRightTriSvg({a:t[0], b:t[1], hyp:t[2], unknown:'hyp'}), choices, res, type:'normal', opKey:'geo', img:'' };
}
// Pythagore : longueur d'un côté de l'angle droit
function _colPythCote(level){
 const t = _colPick(_PYTH_TRIPLES); const ans = t[0];
 const { choices, res } = _colChoices(ans, [t[2] - t[1], ans + 1, ans - 1, t[2] - t[0]]);
 return { display:`Triangle rectangle : hypoténuse ${t[2]}, un côté ${t[1]}. Combien mesure l'autre côté ?`,
  visualHtml:_colRightTriSvg({a:t[0], b:t[1], hyp:t[2], unknown:'a'}), choices, res, type:'normal', opKey:'geo', img:'' };
}
// Réciproque : le triangle est-il rectangle ?
function _colPythReciproque(level){
 const t = _colPick(_PYTH_TRIPLES); const rect = ri(0,1) === 1; let c = t[2];
 if(!rect){ c = t[2] + _colPick([-2,-1,1,2]); }
 const opts = ['Vrai','Faux']; const correct = rect ? 'Vrai' : 'Faux';
 return { display:`Un triangle a pour côtés ${t[0]}, ${t[1]} et ${c}. Est-il rectangle ?`,
  choices:opts.map((v,i)=>({val:i, label:v})), res:opts.indexOf(correct), type:'normal', opKey:'geo', img:'' };
}
// Somme des angles d'un triangle
function _colAnglesTriangle(level){
 let A = ri(30,80), B = ri(30,80); while(A + B > 165){ B = ri(20,70); } const ans = 180 - A - B;
 const { choices, res } = _colChoices(ans, [180 - A, A + B, ans + 10, ans - 10]);
 return { display:`Dans un triangle, deux angles mesurent ${A}° et ${B}°. Combien mesure le troisième ?`,
  visualHtml:_colTriAngSvg(A, B), choices, res, type:'normal', opKey:'geo', img:'' };
}
// Angles et parallèles (alternes-internes / correspondants = égaux)
function _colAnglesParallel(level){
 const x = ri(35,75); const kind = _colPick(['alterne-interne','correspondant']);
 const { choices, res } = _colChoices(x, [180 - x, x + 10, x - 10, 90]);
 return { display:`Deux droites parallèles sont coupées par une sécante. Un angle vaut ${x}°. Combien mesure son angle ${kind} ?`,
  visualHtml:_colParallelSvg(x, kind), choices, res, type:'normal', opKey:'geo', img:'' };
}
// Théorème de Thalès : calculer une longueur
function _colThales(level){
 const k = ri(2,4); const am = ri(2,5); const ab = am*k; const an = ri(2,5); const ac = an*k;
 const { choices, res } = _colChoices(ac, [an + (ab - am), an*k + k, ac + k, ac - k]);
 return { display:`(MN) est parallèle à (BC). AM = ${am}, AB = ${ab}, AN = ${an}. Combien vaut AC ?`,
  visualHtml:_colThalesSvg(am, ab, an), choices, res, type:'normal', opKey:'geo', img:'' };
}
// Trigonométrie : identifier le rapport (SOH-CAH-TOA)
function _colTrigoRatio(level){
 const f = _colPick([['cosinus','côté adjacent / hypoténuse'], ['sinus','côté opposé / hypoténuse'], ['tangente','côté opposé / côté adjacent']]);
 const opts = shuffle(['côté adjacent / hypoténuse','côté opposé / hypoténuse','côté opposé / côté adjacent']);
 return { display:`Dans un triangle rectangle, le ${f[0]} d'un angle aigu est égal à :`,
  visualHtml:_colRightTriSvg({trig:true}),
  choices:opts.map((v,i)=>({val:i, label:v})), res:opts.indexOf(f[1]), type:'normal', opKey:'geo', img:'' };
}
// Transformation : symétrie de centre O (image d'un point)
function _colTransfoSym(level){
 const x = ri(-4,4) || 2, y = ri(-4,4) || 3; const ans = `(${_colFmt(-x)} ; ${_colFmt(-y)})`;
 const { choices, res } = _colChoicesTxt(ans, [`(${_colFmt(x)} ; ${_colFmt(y)})`, `(${_colFmt(-x)} ; ${_colFmt(y)})`, `(${_colFmt(x)} ; ${_colFmt(-y)})`]);
 return { display:`Quelle est l'image du point (${_colFmt(x)} ; ${_colFmt(y)}) par la symétrie de centre O ?`,
  visualHtml:_colRepereSvg([{x, y, label:'M'}], 5), choices, res, type:'normal', opKey:'geo', img:'' };
}

// ════════════════ Chantier C5 : Aires, volumes, stats & probabilités (5e→3e) ════════════════
function _colAireRect(level){
 const L = ri(3,12), l = ri(2,9); const ans = L*l;
 const { choices, res } = _colChoices(ans, [2*(L+l), L+l, ans+L, ans-l]);
 return { display:`Aire d'un rectangle de longueur ${L} et largeur ${l} ?`, visualHtml:_colRectSvg(L,l), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colAireTriangle(level){
 let b = ri(3,12), h = ri(2,10); if((b*h) % 2) h++; const ans = b*h/2;
 const { choices, res } = _colChoices(ans, [b*h, b+h, ans+b, ans-h > 0 ? ans-h : ans+1]);
 return { display:`Aire d'un triangle de base ${b} et hauteur ${h} ?`, visualHtml:_colTriBaseHSvg(b,h), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colAireDisque(level){
 const r = ri(2,9); const ans = `${r*r}π`;
 const { choices, res } = _colChoicesTxt(ans, [`${2*r}π`, `${r}π`, `${r*r*2}π`]);
 return { display:`Aire d'un disque de rayon ${r} ? (valeur exacte)`, visualHtml:_colDiskSvg(r), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colVolPave(level){
 const L = ri(2,8), l = ri(2,6), h = ri(2,6); const ans = L*l*h;
 const { choices, res } = _colChoices(ans, [L+l+h, L*l, 2*(L*l + L*h + l*h), ans+L]);
 return { display:`Volume d'un pavé droit ${L} × ${l} × ${h} ?`, visualHtml:_colPaveSvg(L,l,h), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colVolCylindre(level){
 const r = ri(2,6), h = ri(2,8); const ans = `${r*r*h}π`;
 const { choices, res } = _colChoicesTxt(ans, [`${2*r*h}π`, `${r*h}π`, `${r*r}π`]);
 return { display:`Volume d'un cylindre de rayon ${r} et hauteur ${h} ? (valeur exacte)`, visualHtml:_colCylSvg(r,h), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colMoyenne(level){
 const m = ri(4,12); let a = ri(1, m+4), b = ri(1, m+4); let c = m*3 - a - b; if(c < 1){ a = m; b = m; c = m; }
 const { choices, res } = _colChoices(m, [a+b+c, Math.max(a,b,c), Math.round((a+b)/2), m+1]);
 return { display:`Quelle est la moyenne de ${a}, ${b} et ${c} ?`, visualHtml:_colBarChartSvg([a,b,c]), choices, res, type:'normal', opKey:'stat', img:'' };
}
function _colMediane(level){
 const set = new Set(); while(set.size < 5) set.add(ri(1,20)); const v = [...set]; const s = [...v].sort((x,y)=>x-y); const ans = s[2];
 const { choices, res } = _colChoices(ans, [Math.round(v.reduce((t,x)=>t+x,0)/5), s[0], s[4], ans+1]);
 return { display:`Quelle est la médiane de ${v.join(', ')} ?`, visualHtml:_colBarChartSvg(v), choices, res, type:'normal', opKey:'stat', img:'' };
}
function _colEtendue(level){
 const set = new Set(); while(set.size < 4) set.add(ri(1,30)); const v = [...set]; const ans = Math.max(...v) - Math.min(...v);
 const { choices, res } = _colChoices(ans, [Math.max(...v), Math.min(...v), ans+2, ans-2 > 0 ? ans-2 : ans+1]);
 return { display:`Quelle est l'étendue de la série ${v.join(', ')} ?`, visualHtml:_colBarChartSvg(v), choices, res, type:'normal', opKey:'stat', img:'' };
}
function _colProba(level){
 const pgcd = (a,b) => b ? pgcd(b, a%b) : a;
 const r = ri(1,5), b = ri(1,5); const tot = r + b; const g = pgcd(r, tot); const gb = pgcd(b, tot); const ans = `${r/g}/${tot/g}`;
 const { choices, res } = _colChoicesTxt(ans, [`${b/gb}/${tot/gb}`, `${r}/${b}`, `${tot}/${r}`]);
 return { display:`Un sac contient ${r} boules rouges et ${b} boules bleues. Probabilité de tirer une rouge ?`, visualHtml:_colBallsSvg(r,b), choices, res, type:'normal', opKey:'stat', img:'' };
}

// ════════════════ Chantier C6 : Puissances, arithmétique & algorithmique (5e→3e) ════════════════
function _sup(n){ const M={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'}; return String(n).split('').map(c=>M[c]||c).join(''); }
function _colBlocksHtml(lines){ return `<div class="coll-blocks">` + lines.map(l=>`<div class="cb-line">${l}</div>`).join('') + `</div>`; }

function _colPuissance(level){
 const a = ri(2,5), n = ri(2,4); const ans = Math.pow(a,n);
 const { choices, res } = _colChoices(ans, [a*n, a+n, ans+a, Math.pow(a,n-1)]);
 return { display:`Combien vaut ${a}${_sup(n)} ?`, choices, res, type:'normal', opKey:'arith', img:'' };
}
function _colPuissance10(level){
 const n = ri(2,6); const ans = Math.pow(10,n);
 const { choices, res } = _colChoices(ans, [10*n, Math.pow(10,n-1), Math.pow(10,n+1), ans+10]);
 return { display:`Combien vaut 10${_sup(n)} ?`, choices, res, type:'normal', opKey:'arith', img:'' };
}
function _colNotationSci(level){
 const a = ri(2,9), n = ri(2,5); const ans = a*Math.pow(10,n);
 const { choices, res } = _colChoices(ans, [a*Math.pow(10,n-1), a*Math.pow(10,n+1), a*10*n, ans+a]);
 return { display:`Combien vaut ${a} × 10${_sup(n)} ?`, choices, res, type:'normal', opKey:'arith', img:'' };
}
function _colPGCD(level){
 const g = (a,b) => b ? g(b, a%b) : a;
 const k = ri(2,9); const a = k*ri(2,6), b = k*ri(2,6); const ans = g(a,b);
 const { choices, res } = _colChoices(ans, [k, Math.min(a,b), Math.abs(a-b), ans+1]);
 return { display:`Quel est le PGCD de ${a} et ${b} ?`, choices, res, type:'normal', opKey:'arith', img:'' };
}
function _colPremier(level){
 const isP = n => { if(n < 2) return false; for(let i=2; i*i<=n; i++) if(n%i===0) return false; return true; };
 const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47];
 const comps = [4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,27,33,35,49];
 const n = (ri(0,1) === 1) ? _colPick(primes) : _colPick(comps);
 const opts = ['Vrai','Faux']; const correct = isP(n) ? 'Vrai' : 'Faux';
 return { display:`Le nombre ${n} est-il un nombre premier ?`, choices:opts.map((v,i)=>({val:i, label:v})), res:opts.indexOf(correct), type:'normal', opKey:'arith', img:'' };
}
function _colAlgoVar(level){
 const x0 = ri(1,6), add = ri(2,8), mul = ri(2,3); let val, steps;
 if(ri(0,1)){ val = (x0 + add)*mul; steps = [`x = ${x0}`, `x = x + ${add}`, `x = x × ${mul}`]; }
 else { val = x0*mul + add; steps = [`x = ${x0}`, `x = x × ${mul}`, `x = x + ${add}`]; }
 const { choices, res } = _colChoices(val, [x0 + add + mul, val + add, val - mul, x0*add]);
 return { display:`Programme : ${steps.join(' ; ')}. Que vaut x à la fin ?`, visualHtml:_colBlocksHtml(steps), choices, res, type:'normal', opKey:'algo', img:'' };
}
function _colAlgoBoucle(level){
 const times = ri(3,6), step = ri(2,6), start = ri(0,4); const val = start + times*step;
 const { choices, res } = _colChoices(val, [times*step, times + step, start + step, val - step]);
 const steps = [`x = ${start}`, `Répéter ${times} fois :`, `\u00A0\u00A0\u00A0x = x + ${step}`];
 return { display:`Programme : x = ${start}, puis répéter ${times} fois « x = x + ${step} ». Que vaut x à la fin ?`, visualHtml:_colBlocksHtml(steps), choices, res, type:'normal', opKey:'algo', img:'' };
}

// ════════════════ Chantier 6e : consolidation cycle 3 ════════════════
function _dec(n){ return String(n).replace('.', ','); }
function _colFracBarHtml(num, den){
 let cells = '';
 for(let i=0;i<den;i++) cells += `<span style="flex:1;border:2px solid #2c3e50;border-radius:3px;background:${i<num?'#5b8def':'rgba(255,255,255,.08)'};"></span>`;
 return `<div class="coll-fracbar" style="display:flex;gap:3px;max-width:240px;height:34px;margin:10px auto;">${cells}</div>`;
}
function _colAngleCmpSvg(deg){
 const cx=80, cy=92, len=70, a=-deg*Math.PI/180;
 const x2=(cx+len*Math.cos(a)).toFixed(1), y2=(cy+len*Math.sin(a)).toFixed(1);
 const arc=_gArc(cx,cy,0,a,24);
 const ref=`<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-len}" stroke="#9bb4e8" stroke-width="2" stroke-dasharray="4 3"/>`;
 return `<div class="coll-geo"><svg viewBox="0 0 160 110"><line x1="${cx}" y1="${cy}" x2="${cx+len}" y2="${cy}" class="gt-hyp"/><line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" class="gt-hyp"/>${ref}${arc.line}<circle cx="${cx}" cy="${cy}" r="3" fill="#fff"/></svg></div>`;
}
// ph1 (début) : décimaux, fraction sur barre
function _colDecimalPosition(level){
 const ent=ri(1,99), d1=ri(0,9), d2=ri(1,9); const numStr=`${ent},${d1}${d2}`;
 const pick=_colPick([['dixièmes',d1],['centièmes',d2]]);
 const { choices, res } = _colChoices(pick[1], [d1, d2, (pick[1]+1)%10, (pick[1]+2)%10]);
 return { display:`Dans le nombre ${numStr}, quel est le chiffre des ${pick[0]} ?`, choices, res, type:'normal', opKey:'num', img:'' };
}
function _colDecimalCompare(level){
 const ent=ri(1,9); const A=Math.round((ent+ri(1,9)/10)*100)/100; let B=Math.round((ent+ri(10,99)/100)*100)/100; let t=0; while(B===A && t++<8) B=Math.round((ent+ri(10,99)/100)*100)/100;
 const big=ri(0,1)===1; const correct=big?Math.max(A,B):Math.min(A,B);
 const opts=shuffle([A,B]);
 return { display:`Quel est le plus ${big?'grand':'petit'} : ${_dec(A)} ou ${_dec(B)} ?`, choices:opts.map((v,i)=>({val:i, label:_dec(v)})), res:opts.indexOf(correct), type:'normal', opKey:'num', img:'' };
}
function _colFracBarRead(level){
 const den=_colPick([2,3,4,5,6,8]); const num=ri(1,den-1);
 const { choices, res } = _colChoicesTxt(`${num}/${den}`, [`${num+1>den-1?num-1:num+1}/${den}`, `${num}/${den+1}`, `${den-num}/${den}`]);
 return { display:`Quelle fraction de la barre est coloriée ?`, visualHtml:_colFracBarHtml(num,den), choices, res, type:'normal', opKey:'frac', img:'' };
}
// ph2 (milieu) : fraction d'une quantité, proportionnalité, périmètre, symétrie
function _colFractionQuantite(level){
 const den=_colPick([2,3,4,5]); const num=ri(1,den-1); const q=den*ri(2,6); const correct=num*q/den;
 const { choices, res } = _colChoices(correct, [q/den, q-correct, correct+den, num*q]);
 return { display:`Combien font les ${num}/${den} de ${q} ?`, choices, res, type:'normal', opKey:'frac', img:'' };
}
function _colPropSimple6(level){
 const unit=ri(2,5), qty1=ri(2,3), price1=unit*qty1, qty2=qty1*ri(2,4); const correct=unit*qty2;
 const ctx=_colPick([['stylos','€'],['bonbons','€'],['cahiers','€'],['pommes','€']]);
 const { choices, res } = _colChoices(correct, [price1+qty2, correct+unit, qty2*qty1, correct-unit]);
 return { display:`${qty1} ${ctx[0]} coûtent ${price1} ${ctx[1]}. Combien coûtent ${qty2} ${ctx[0]} ?`, choices, res, type:'normal', opKey:'prop', img:'' };
}
function _colPerimRect6(level){
 const L=ri(3,9), l=ri(2,Math.max(2,L-1)); const correct=2*(L+l);
 const { choices, res } = _colChoices(correct, [L+l, L*l, 2*L+l, correct+2]);
 return { display:`Quel est le périmètre d'un rectangle de longueur ${L} et largeur ${l} (en cm) ?`, visualHtml:_colRectSvg(L,l), choices, res, type:'normal', opKey:'geo', img:'' };
}
function _colSymetrie6(level){
 const shapes=[
  {bb:[28,40,84,40], svg:'<rect x="28" y="40" width="84" height="40" class="gt-fill"/>', ax:{v:1,h:1,d1:0,d2:0}},
  {bb:[40,30,60,60], svg:'<rect x="40" y="30" width="60" height="60" class="gt-fill"/>', ax:{v:1,h:1,d1:1,d2:1}},
  {bb:[30,22,80,76], svg:'<polygon points="70,22 110,98 30,98" class="gt-fill"/>', ax:{v:1,h:0,d1:0,d2:0}}
 ];
 const s=_colPick(shapes); const x=s.bb[0],y=s.bb[1],w=s.bb[2],h=s.bb[3]; const cx=x+w/2, cy=y+h/2;
 const k=_colPick(['v','h','d1','d2']); const yes=!!s.ax[k];
 const ln={
  v:`<line x1="${cx}" y1="${y-6}" x2="${cx}" y2="${y+h+6}" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>`,
  h:`<line x1="${x-6}" y1="${cy}" x2="${x+w+6}" y2="${cy}" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>`,
  d1:`<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y+h}" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>`,
  d2:`<line x1="${x+w}" y1="${y}" x2="${x}" y2="${y+h}" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5 4"/>`
 };
 const arr=shuffle([{l:'Oui', y:true}, {l:'Non', y:false}]);
 return { display:`La ligne rouge est-elle un axe de symétrie ?`, visualHtml:`<div class="coll-geo"><svg viewBox="0 0 140 110">${s.svg}${ln[k]}</svg></div>`, choices:arr.map((c,i)=>({val:i, label:c.l})), res:arr.findIndex(c=>c.y===yes), type:'normal', opKey:'geo', img:'' };
}
// ph3 (fin) : arrondi, pourcentage, angle vs droit, durées
function _colArrondiDecimal(level){
 const ent=ri(1,9), d1=ri(1,9); const num=Math.round((ent+d1/10)*10)/10; const correct=Math.round(num);
 const { choices, res } = _colChoices(correct, [ent, ent+1, Math.floor(num), Math.ceil(num)]);
 return { display:`Arrondir ${_dec(num)} à l'unité ?`, choices, res, type:'normal', opKey:'num', img:'' };
}
function _colPourcentSimple(level){
 const p=_colPick([50,25,10]); const base = p===50 ? 2*ri(3,25) : (p===25 ? 4*ri(2,15) : 10*ri(2,15)); const correct=base*p/100;
 const { choices, res } = _colChoices(correct, [base/2, base-correct, correct+(p===50?5:2), base*p/10]);
 return { display:`Combien font ${p} % de ${base} ?`, choices, res, type:'normal', opKey:'prop', img:'' };
}
function _colAngleDroit6(level){
 const cases=[[ri(25,75),"plus petit qu'un angle droit"],[90,"égal à un angle droit"],[ri(105,160),"plus grand qu'un angle droit"]];
 const c=_colPick(cases);
 const arr=shuffle(["plus petit qu'un angle droit","égal à un angle droit","plus grand qu'un angle droit"]);
 return { display:`Cet angle est… (comparé à l'angle droit, en pointillés)`, visualHtml:_colAngleCmpSvg(c[0]), choices:arr.map((v,i)=>({val:i, label:v})), res:arr.indexOf(c[1]), type:'normal', opKey:'geo', img:'' };
}
function _colDuree6(level){
 const h1=ri(1,2), m1=_colPick([0,15,30,45]), addM=_colPick([15,30,45,60,75,90]);
 const tot=h1*60+m1+addM, H=Math.floor(tot/60), M=tot%60;
 const fmt=(hh,mm)=>`${hh} h ${String(mm).padStart(2,'0')}`;
 const { choices, res } = _colChoicesTxt(fmt(H,M), [fmt(H+1,M), fmt(H,(M+15)%60), fmt(H,(M+30)%60)]);
 return { display:`${fmt(h1,m1)} + ${addM} min = ?`, choices, res, type:'normal', opKey:'mes', img:'' };
}

// ── Phases (.ph) : 1 = début d'année, 2 = milieu, 3 = fin ──────────────
const _COL_PH = {
 _colDecimalPosition:1, _colDecimalCompare:1, _colFracBarRead:1,
 _colFractionQuantite:2, _colPropSimple6:2, _colPerimRect6:2, _colSymetrie6:2,
 _colArrondiDecimal:3, _colPourcentSimple:3, _colAngleDroit6:3, _colDuree6:3,

 _colRelComparer:1, _colRelDroite:1,
 _colRelAddSous:2, _colRelDeplacement:2,
 _colRelMul:3, _colRelDiv:3,
 _colLitSubstituer:1, _colLitEgalite:1,
 _colLitReduire:2, _colLitDevelopper:2, _colLitProgramme:2,
 _colLitFactoriser:3, _colLitEquation:3,
 _colPropCoef:1, _colRepere:1,
 _colPropQuatrieme:2, _colPourcentage:2, _colFoncImage:2, _colFoncCalc:2,
 _colPourcentEvol:3, _colFoncLinAff:3,
 _colAnglesTriangle:1,
 _colAnglesParallel:2, _colPythHyp:2, _colTrigoRatio:2, _colTransfoSym:2,
 _colPythCote:3, _colPythReciproque:3, _colThales:3,
 _colAireRect:1, _colMoyenne:1,
 _colAireTriangle:2, _colAireDisque:2, _colVolPave:2, _colEtendue:2, _colProba:2,
 _colVolCylindre:3, _colMediane:3,
 _colPuissance:1,
 _colPuissance10:2, _colPGCD:2, _colPremier:2, _colAlgoVar:2,
 _colNotationSci:3, _colAlgoBoucle:3,
};
for(const name in _COL_PH){ try{ const f = window[name]; if(typeof f === 'function') f.ph = _COL_PH[name]; }catch(e){} }

// ── Pools par niveau (6e = cycle 3, pas de relatifs → rempli plus tard) ──
const _COL_POOL = {
 '6E': [_colDecimalPosition, _colDecimalCompare, _colFracBarRead,
        _colFractionQuantite, _colPropSimple6, _colPerimRect6, _colSymetrie6,
        _colArrondiDecimal, _colPourcentSimple, _colAngleDroit6, _colDuree6],
 '5E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement,
        _colLitSubstituer, _colLitEgalite, _colLitReduire, _colLitDevelopper, _colLitProgramme,
        _colRepere, _colPropCoef, _colPropQuatrieme,
        _colAnglesTriangle, _colAnglesParallel, _colTransfoSym,
        _colAireRect, _colAireTriangle, _colAireDisque, _colVolPave, _colProba,
        _colPuissance, _colAlgoVar, _colAlgoBoucle],
 '4E': [_colRelComparer, _colRelDroite, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv,
        _colLitSubstituer, _colLitEgalite, _colLitReduire, _colLitDevelopper, _colLitProgramme, _colLitFactoriser, _colLitEquation,
        _colPropCoef, _colPropQuatrieme, _colPourcentage, _colPourcentEvol,
        _colAnglesTriangle, _colAnglesParallel, _colPythHyp, _colPythCote, _colPythReciproque, _colTransfoSym,
        _colAireRect, _colAireTriangle, _colVolPave, _colMoyenne, _colEtendue, _colProba,
        _colPuissance, _colPuissance10, _colNotationSci, _colAlgoVar, _colAlgoBoucle],
 '3E': [_colRelComparer, _colRelAddSous, _colRelDeplacement, _colRelMul, _colRelDiv,
        _colLitReduire, _colLitDevelopper, _colLitFactoriser, _colLitEquation, _colLitProgramme,
        _colPropQuatrieme, _colPourcentage, _colPourcentEvol, _colRepere, _colFoncImage, _colFoncCalc, _colFoncLinAff,
        _colAnglesTriangle, _colPythHyp, _colPythCote, _colThales, _colTrigoRatio,
        _colAireDisque, _colVolPave, _colVolCylindre, _colMoyenne, _colMediane, _colEtendue, _colProba,
        _colPuissance, _colPuissance10, _colNotationSci, _colPGCD, _colPremier],
};

// ── Tirage : sac sans remise, filtré par la phase d'année du niveau ──────
const _colBags = {}; const _colBagPhase = {};
const _COL_PH_BY_LEVEL = {
 '5E': { _colLitDevelopper:3, _colPropQuatrieme:3, _colVolPave:3, _colTransfoSym:3 },
};
function _collEnrich(level){
 const pool = _COL_POOL[level];
 if(!pool || !pool.length) return null;
 const phase = (typeof _progPhase === 'function') ? _progPhase(level) : 3;
 if(_colBagPhase[level] !== phase){ _colBags[level] = null; _colBagPhase[level] = phase; }
 let bag = _colBags[level];
 if(!bag || !bag.length){
  const _ov = _COL_PH_BY_LEVEL[level] || {};
  let avail = pool.filter(f => (_ov[f.name] || (f && f.ph) || 1) <= phase);
  if(!avail.length) avail = pool.slice();
  bag = _colBags[level] = (typeof shuffle === 'function' ? shuffle(avail.slice()) : avail.slice());
 }
 const fn = bag.pop();
 try{ return fn(level); }
 catch(e){ return null; }
}
