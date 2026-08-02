// v11.7.3 — Tests d'invariant sur les 9 générateurs de questions numériques
// (audit technique, point n°28). Jusqu'ici AUCUN test ne vérifiait que la
// réponse attendue (res) correspondait réellement à la question affichée
// (display) — c'est exactement ce qui a permis au bug n°11 (genQ_5E, branche
// "priorité opératoire") de passer inaperçu. Ces tests recalculent la réponse
// indépendamment, à partir du texte affiché ou des champs a/b/op, et
// comparent au res renvoyé par le générateur, sur un grand nombre de tirages
// (pour couvrir les branches aléatoires).
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '04-questions.js'];
const N = 400; // nombre de tirages par générateur/mode — assez pour couvrir toutes les branches

function applyOp(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case 'x': case '×': return a * b;
    case '/': case '÷': return a / b;
    default: throw new Error('opérateur inconnu : ' + op);
  }
}

// Vérifie une question "normale" (a, b, op, res tous présents) : res doit être
// exactement a op b.
function checkNormal(q) {
  if (q.type !== 'normal' || q.a === undefined || q.b === undefined) return null;
  const expected = applyOp(q.a, q.op, q.b);
  return { expected, actual: q.res };
}

// v11.7.3 : certaines questions 'normal' n'ont pas de champs a/b (ex. division
// brute en CM2 : `${b*r} ÷ ${b}`) — on recalcule alors depuis le texte affiché
// quand il s'agit d'une expression à deux termes sans inconnue.
const PURE_EXPR_RE = /^\s*(-?\d+(?:[.,]\d+)?)\s*([+\-x×÷])\s*(-?\d+(?:[.,]\d+)?)\s*$/;
function checkPureExpr(q) {
  if (q.a !== undefined || q.b !== undefined) return null; // déjà couvert par checkNormal
  const m = PURE_EXPR_RE.exec(q.display);
  if (!m) return null;
  const a = Number(m[1].replace(',', '.'));
  const b = Number(m[3].replace(',', '.'));
  const opNorm = m[2] === '×' ? 'x' : (m[2] === '÷' ? '/' : m[2]);
  return { expected: applyOp(a, opNorm, b), actual: q.res };
}

// v11.7.3 : questions de type 'fraction' (ex. CM2 : "N/D de W")
const FRACTION_RE = /^(\d+)\/(\d+) de (\d+)$/;
function checkFraction(q) {
  if (q.type !== 'fraction') return null;
  const m = FRACTION_RE.exec(q.display);
  if (!m) return null;
  const [, n, d, w] = m.map(Number);
  return { expected: Math.round(w * n / d), actual: q.res };
}

// Vérifie une question "nombre manquant" du type "A op B = C" où l'une des
// trois valeurs est remplacée par "?" — générique, ne suppose rien sur quel
// générateur l'a produite.
const MISSING_RE = /^\s*(\?|-?\d+)\s*([+\-x×÷])\s*(\?|-?\d+)\s*=\s*(\?|-?\d+)\s*$/;
function checkMissing(q) {
  if (q.type !== 'missing') return null;
  const m = MISSING_RE.exec(q.display);
  if (!m) return { skipped: true };
  let [, A, op, B, C] = m;
  const slot = A === '?' ? 'A' : (B === '?' ? 'B' : 'C');
  A = A === '?' ? q.res : Number(A);
  B = B === '?' ? q.res : Number(B);
  C = C === '?' ? q.res : Number(C);
  const opNorm = op === '×' ? 'x' : (op === '÷' ? '/' : op);
  if (slot === 'C') {
    return { expected: applyOp(A, opNorm, B), actual: C };
  }
  // A ou B manquant : on vérifie que l'équation est vraie une fois res substitué
  return { expected: C, actual: applyOp(A, opNorm, B) };
}

function runGenerator(gen, boss) {
  const results = [];
  for (let i = 0; i < N; i++) {
    const q = gen(boss);
    results.push(q);
  }
  return results;
}

describe('Générateurs primaires CP → CM2 : la réponse correspond à la question affichée', () => {
  const levels = ['genQ_CP', 'genQ_CE1', 'genQ_CE2', 'genQ_CM1', 'genQ_CM2'];
  for (const name of levels) {
    for (const boss of [false, true]) {
      it(`${name}(${boss ? 'boss' : 'normal'}) : ${N} tirages, aucune incohérence`, () => {
        const api = loadGame(FILES);
        const gen = api[name];
        expect(typeof gen).toBe('function');
        const qs = runGenerator(gen, boss);
        let checkedNormal = 0, checkedMissing = 0, checkedOther = 0;
        for (const q of qs) {
          expect(q, 'la question ne doit jamais être null/undefined').toBeTruthy();
          expect(typeof q.res, 'res doit être un nombre').not.toBe('undefined');
          const rNormal = checkNormal(q);
          if (rNormal) {
            checkedNormal++;
            expect(rNormal.actual, `question "${q.display}" (type normal)`).toBeCloseTo(rNormal.expected, 6);
          }
          const rMissing = checkMissing(q);
          if (rMissing && !rMissing.skipped) {
            checkedMissing++;
            expect(rMissing.actual, `question "${q.display}" (nombre manquant)`).toBeCloseTo(rMissing.expected, 6);
          }
          const rPure = checkPureExpr(q);
          if (rPure) {
            checkedOther++;
            expect(rPure.actual, `question "${q.display}" (expression directe)`).toBeCloseTo(rPure.expected, 6);
          }
          const rFrac = checkFraction(q);
          if (rFrac) {
            checkedOther++;
            expect(rFrac.actual, `question "${q.display}" (fraction)`).toBeCloseTo(rFrac.expected, 6);
          }
        }
        // Garde-fou : si le générateur ne produit plus AUCUNE question
        // vérifiable (ex. après un futur refactor qui changerait le format),
        // ce test doit échouer plutôt que de "passer" silencieusement à vide.
        expect(checkedNormal + checkedMissing + checkedOther, 'au moins une partie des questions doit être vérifiable').toBeGreaterThan(0);
      });
    }
  }
});

// ── Générateurs collège (6e → 3e) : questions à réponse numérique via _mkQ ──
// Chaque sous-type de question a un format d'affichage propre ; on le
// reconnaît par motif et on recalcule la réponse attendue indépendamment.
const _SUP_REV = { '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
function unsup(s) { return s.split('').map(c => _SUP_REV[c] || c).join(''); }
function parseRel(tok) {
  const m = /^\(−(\d+(?:[.,]\d+)?)\)$/.exec(tok.trim());
  if (m) return -Number(m[1].replace(',', '.'));
  return Number(tok.trim().replace(',', '.'));
}
function round2(x) { return Math.round(x * 100) / 100; }

// Renvoie {expected} si le format est reconnu, sinon null (question ignorée —
// on ne veut pas de faux positifs sur un format qu'on ne sait pas parser).
function expectedForCollegeQ(display) {
  let m;
  // "N/D de W" (fraction d'une quantité, 6e)
  if ((m = /^(\d+)\/(\d+) de (\d+)$/.exec(display))) {
    const [, n, d, w] = m.map(Number);
    return round2(w * n / d);
  }
  // décimal × base / ÷ base (6e)
  if ((m = /^([\d,]+) × (\d+)$/.exec(display))) {
    const x = Number(m[1].replace(',', '.'));
    return round2(x * Number(m[2]));
  }
  if ((m = /^(\d+) ÷ (\d+)$/.exec(display))) {
    return round2(Number(m[1]) / Number(m[2]));
  }
  // décimal + décimal (6e dadd)
  if ((m = /^([\d,]+) \+ ([\d,]+)$/.exec(display))) {
    return round2(Number(m[1].replace(',', '.')) + Number(m[2].replace(',', '.')));
  }
  // "Le Ne multiple de M" (6e)
  if ((m = /^Le (\d+)ᵉ multiple de (\d+)$/.exec(display))) {
    return Number(m[1]) * Number(m[2]);
  }
  // "Le double de V" / "La moitié de V" (6e)
  if ((m = /^Le double de (\d+)$/.exec(display))) return Number(m[1]) * 2;
  if ((m = /^La moitié de (\d+)$/.exec(display))) return Number(m[1]) / 2;
  // relatifs +/− (5e)
  if ((m = /^(\(−\d+(?:[.,]\d+)?\)|-?\d+(?:[.,]\d+)?) \+ (\(−\d+(?:[.,]\d+)?\)|-?\d+(?:[.,]\d+)?)$/.exec(display))) {
    return round2(parseRel(m[1]) + parseRel(m[2]));
  }
  if ((m = /^(\(−\d+(?:[.,]\d+)?\)|-?\d+(?:[.,]\d+)?) − (\(−\d+(?:[.,]\d+)?\)|-?\d+(?:[.,]\d+)?)$/.exec(display))) {
    return round2(parseRel(m[1]) - parseRel(m[2]));
  }
  // pourcentage simple "P% de BASE" (5e)
  if ((m = /^(\d+)% de (\d+)$/.exec(display))) {
    return round2(Number(m[2]) * Number(m[1]) / 100);
  }
  // priorité opératoire (5e) — LE CAS DIRECTEMENT LIÉ AU BUG n°11
  if ((m = /^(-?\d+) \+ (\d+) × (\d+)$/.exec(display))) {
    const [, a, b, c] = m.map(Number);
    return round2(a + b * c);
  }
  if ((m = /^(-?\d+) − (\d+) × (\d+)$/.exec(display))) {
    const [, a, b, c] = m.map(Number);
    return round2(a - b * c);
  }
  // relatifs × / ÷ (4e)
  if ((m = /^(\(−\d+\)|-?\d+) × (\(−\d+\)|-?\d+)$/.exec(display))) {
    return parseRel(m[1]) * parseRel(m[2]);
  }
  if ((m = /^(\(−\d+\)|-?\d+) ÷ (\(−\d+\)|-?\d+)$/.exec(display))) {
    return parseRel(m[1]) / parseRel(m[2]);
  }
  // puissances (4e/3e) : "N^exp" ou "10^exp"
  if ((m = /^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/.exec(display))) {
    return Math.pow(Number(m[1]), Number(unsup(m[2])));
  }
  // calcul littéral "Si x = N :  Ax + B" / "Si x = N :  Ax − B" (4e/3e)
  if ((m = /^Si x = (-?\d+) :\s+(\d+)x \+ (\d+)$/.exec(display))) {
    const [, x, a, b] = m.map(Number);
    return a * x + b;
  }
  if ((m = /^Si x = (-?\d+) :\s+(\d+)x − (\d+)$/.exec(display))) {
    const [, x, a, b] = m.map(Number);
    return a * x - b;
  }
  // "Si x = N :  A(x + B)" (3e)
  if ((m = /^Si x = (-?\d+) :\s+(\d+)\(x \+ (\d+)\)$/.exec(display))) {
    const [, x, a, b] = m.map(Number);
    return a * (x + b);
  }
  // "A² + B²" (4e carre)
  if ((m = /^(\d+)² \+ (\d+)²$/.exec(display))) {
    const [, a, b] = m.map(Number);
    return a * a + b * b;
  }
  // racine carrée (3e)
  if ((m = /^√(\d+)$/.exec(display))) {
    return Math.sqrt(Number(m[1]));
  }
  // PGCD (3e)
  if ((m = /^PGCD\((\d+) ; (\d+)\)$/.exec(display))) {
    const a = Number(m[1]), b = Number(m[2]);
    let x = a, y = b; while (y) { [x, y] = [y, x % y]; }
    return x;
  }
  // évolution en pourcentage (3e)
  if ((m = /^(\d+) augmenté de (\d+)%$/.exec(display))) {
    const [, base, p] = m.map(Number);
    return round2(base * (1 + p / 100));
  }
  if ((m = /^(\d+) diminué de (\d+)%$/.exec(display))) {
    const [, base, p] = m.map(Number);
    return round2(base * (1 - p / 100));
  }
  return null; // format non reconnu (ex. conversions d'unités 6e) — ignoré, pas de faux positif
}

describe('Générateurs collège 6e → 3e : la réponse correspond à la question affichée', () => {
  const levels = ['genQ_6E', 'genQ_5E', 'genQ_4E', 'genQ_3E'];
  for (const name of levels) {
    for (const boss of [false, true]) {
      it(`${name}(${boss ? 'boss' : 'normal'}) : ${N} tirages, aucune incohérence sur les formats reconnus`, () => {
        const api = loadGame(FILES);
        const gen = api[name];
        expect(typeof gen).toBe('function');
        let checked = 0;
        for (let i = 0; i < N; i++) {
          const q = gen(boss);
          expect(q, 'la question ne doit jamais être null/undefined').toBeTruthy();
          const expected = expectedForCollegeQ(q.display);
          if (expected === null) continue; // format non couvert par ce test (ex. conversions), pas d'échec
          checked++;
          expect(q.res, `question "${q.display}"`).toBeCloseTo(expected, 6);
        }
        expect(checked, 'au moins une partie des questions doit être vérifiable').toBeGreaterThan(0);
      });
    }
  }
});

// ── Régression ciblée sur le bug n°11 (genQ_5E, branche priorité, 2e cas) ──
// On force un grand nombre de tirages pour être quasi certain de retomber sur
// la branche fautive (probabilité ~1/8 par tirage) et on vérifie spécifiquement
// ce cas.
describe('[régression n°11] genQ_5E : priorité opératoire, branche "A − B × C"', () => {
  it('la réponse inclut bien le terme aléatoire ajouté au premier nombre affiché', () => {
    const api = loadGame(FILES);
    let sawTheBuggyShape = false;
    for (let i = 0; i < 3000; i++) {
      const q = api.genQ_5E(true); // boss=true : pool complet, inclut 'prio'
      const m = /^(-?\d+) − (\d+) × (\d+)$/.exec(q.display);
      if (!m) continue;
      sawTheBuggyShape = true;
      const [, a, b, c] = m.map(Number);
      expect(q.res, `question "${q.display}"`).toBe(a - b * c);
    }
    expect(sawTheBuggyShape, 'le format concerné par le bug n°11 doit apparaître dans 3000 tirages').toBe(true);
  });
});
