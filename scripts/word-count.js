#!/usr/bin/env node
/**
 * scripts/word-count.js
 * ────────────────────────────────────────────────────────────────
 * Compte le nombre de mots réel des histoires principales et des
 * livres/contes bonus du mode Odyssée, pour vérifier leur conformité
 * aux fourchettes cibles ADR-2 (voir CONTEXTE_TRANSITION_ODYSSEE.md).
 *
 * Reconstruit un script ad hoc utilisé pendant les chantiers narratifs
 * (1ère et 2e conversations), jamais versionné jusqu'ici. Ne touche à
 * AUCUN fichier du dépôt : lecture seule, zéro risque de régression.
 *
 * USAGE :
 *   node scripts/word-count.js
 * (à lancer depuis la racine du dépôt — le script lit js/07-story.js
 * et js/07-boss.js relativement au dossier courant)
 *
 * PIÈGES CONNUS, DÉJÀ RENCONTRÉS EN PRATIQUE (ne pas les redécouvrir) :
 *  1. Les histoires sont déclarées `const NOM = { ... }` mais du contenu
 *     non lié peut être physiquement intercalé entre deux déclarations
 *     dans le fichier (ex. _MAT_STORY est intercalée entre _PRIM_STORY
 *     et _PRIM_STORY_FR). → Ce script retrouve chaque bloc par comptage
 *     d'accolades (en ignorant les accolades à l'intérieur des chaînes
 *     de caractères), jamais par une recherche naïve entre deux noms.
 *  2. _MAT_STORY_FR et _PRIM_STORY_FR contiennent un `bookTale` imbriqué
 *     (le conte/livre bonus est niché DANS l'histoire principale) → il
 *     faut le compter à part, sous peine de gonfler le total de
 *     l'histoire principale avec les mots du livre bonus.
 *  3. Le conte _MAT_TALE_RAINBOW (Maternelle Maths, dans 07-boss.js)
 *     utilise un pattern différent des autres contes bonus :
 *     `const P = []; P.push({text:"...", illus:...}); ... return P;`
 *     plutôt qu'un tableau littéral retourné directement. Une regex de
 *     comptage cherchant uniquement un tableau littéral échoue
 *     silencieusement dessus (0 mot trouvé, sans erreur). → Ce script
 *     cherche `text:"..."` où qu'il apparaisse dans le bloc, donc
 *     couvre nativement les deux patterns.
 *  4. Pour les collections factuelles (tomes Histoire/Français), le
 *     champ à compter est `html:"..."` et non `text:"..."`, et chaque
 *     tome est une fonction séparée (_colBookNPages, _histBookNPages)
 *     qu'il faut sommer individuellement puis globalement.
 * ────────────────────────────────────────────────────────────────
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ── Utilitaires de comptage ──────────────────────────────────────
function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ');
}
function countWords(s) {
  const words = s.match(/[A-Za-zÀ-ÿ0-9'-]+/g) || [];
  return words.length;
}
// Dé-échappe les séquences JS les plus courantes qu'on trouve dans ces
// chaînes (\", \', \\, \n) avant comptage — sans ça, `n'y` compte "n" et "y"
// comme mots séparés si l'apostrophe est échappée en \'.
function unescapeJs(s) {
  return s.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
}

// Extrait le contenu d'un champ (ex: text: "..." ou html: "...") où qu'il
// apparaisse dans `chunk`, en gérant correctement les guillemets échappés.
function extractFieldValues(chunk, field) {
  const re = new RegExp(field + ':"((?:[^"\\\\]|\\\\.)*)"', 'g');
  const out = [];
  let m;
  while ((m = re.exec(chunk))) out.push(m[1]);
  return out;
}

// Trouve la position de l'accolade ouvrante qui suit `marker` dans
// `content` à partir de `fromIndex`, puis retourne [start, end] du bloc
// équilibré correspondant (en ignorant les accolades dans les chaînes
// de caractères '...', "...", `...`).
function findBalancedBlock(content, marker, fromIndex) {
  const markerIdx = content.indexOf(marker, fromIndex || 0);
  if (markerIdx === -1) return null;
  const braceIdx = content.indexOf('{', markerIdx);
  if (braceIdx === -1) return null;
  let depth = 0, inStr = null, i = braceIdx;
  for (; i < content.length; i++) {
    const c = content[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return { start: braceIdx, end: i, text: content.slice(braceIdx, i) };
}

function wordsInField(chunk, field) {
  const vals = extractFieldValues(chunk, field);
  let total = 0;
  for (const v of vals) total += countWords(stripHtml(unescapeJs(v)));
  return { pages: vals.length, words: total };
}

// ── Sources à auditer ─────────────────────────────────────────────
const ROOT = process.cwd();
const storyPath = path.join(ROOT, 'js', '07-story.js');
const bossPath = path.join(ROOT, 'js', '07-boss.js');

if (!fs.existsSync(storyPath) || !fs.existsSync(bossPath)) {
  console.error('Fichiers introuvables. Lance ce script depuis la racine du dépôt (celle qui contient le dossier js/).');
  process.exit(1);
}
const storySrc = fs.readFileSync(storyPath, 'utf-8');
const bossSrc = fs.readFileSync(bossPath, 'utf-8');

const results = [];

// -- Histoires principales "simples" (pas de bookTale imbriqué) -----
const SIMPLE_STORIES = [
  ['_PRIM_STORY', 'Primaire Maths (histoire principale)'],
  ['_MAT_STORY', 'Maternelle Maths (histoire principale)'],
  ['_PRIM_STORY_HIST', 'Primaire Histoire (histoire principale)'],
  ['_COL_STORY', 'Collège Maths (histoire principale)'],
];
for (const [varName, label] of SIMPLE_STORIES) {
  const block = findBalancedBlock(storySrc, `const ${varName} = {`);
  if (!block) { results.push({ label, error: 'bloc introuvable' }); continue; }
  const r = wordsInField(block.text, 'text');
  results.push({ label, ...r });
}

// -- Histoires principales AVEC bookTale imbriqué --------------------
const NESTED_STORIES = [
  ['_MAT_STORY_FR', 'Maternelle Français (histoire principale)', 'Maternelle Français — livre/conte bonus (bookTale imbriqué)'],
  ['_PRIM_STORY_FR', 'Primaire Français (histoire principale)', 'Primaire Français — livre/conte bonus (bookTale imbriqué)'],
  ['_COL_STORY_FR', 'Collège Français (histoire principale)', null], // bookTale de _COL_STORY_FR non utilisé (code mort retiré, cf. lot 1)
];
for (const [varName, mainLabel, bookTaleLabel] of NESTED_STORIES) {
  const block = findBalancedBlock(storySrc, `const ${varName} = {`);
  if (!block) { results.push({ label: mainLabel, error: 'bloc introuvable' }); continue; }
  const bookTaleBlock = findBalancedBlock(block.text, 'bookTale:');
  const mainOnly = bookTaleBlock
    ? block.text.slice(0, bookTaleBlock.start) + block.text.slice(bookTaleBlock.end)
    : block.text;
  results.push({ label: mainLabel, ...wordsInField(mainOnly, 'text') });
  if (bookTaleLabel && bookTaleBlock) {
    results.push({ label: bookTaleLabel, ...wordsInField(bookTaleBlock.text, 'text') });
  }
}

// -- Contes/livres bonus en IIFE dans 07-boss.js (pattern P.push) ---
const BOSS_TALES = [
  ['_MAT_TALE_RAINBOW', 'Maternelle Maths — conte bonus (Le Trésor au bout de l\'Arc-en-ciel)'],
  ['_PRIM_TALE_NUMBERS', 'Primaire Maths — livre bonus (La Grande Histoire des Nombres)'],
  ['_COL_TALE_ARMOR', 'Collège Maths — conte bonus (La Saga des Porteurs de l\'Armure)'],
];
for (const [varName, label] of BOSS_TALES) {
  const block = findBalancedBlock(bossSrc, `const ${varName} = (function(){`);
  if (!block) { results.push({ label, error: 'bloc introuvable' }); continue; }
  results.push({ label, ...wordsInField(block.text, 'text') });
}

// -- Collections factuelles (tomes), champ html: ---------------------
function sumFunctions(src, fnPattern, groupLabel) {
  const re = new RegExp(fnPattern.source, 'g');
  let m, total = { pages: 0, words: 0 };
  const perTome = [];
  while ((m = re.exec(src))) {
    const fnName = m[0].replace('function ', '').replace('(){', '');
    const block = findBalancedBlock(src, m[0]);
    if (!block) continue;
    const r = wordsInField(block.text, 'html');
    perTome.push({ label: `  · ${fnName}`, ...r });
    total.pages += r.pages; total.words += r.words;
  }
  results.push({ label: groupLabel, ...total });
  results.push(...perTome);
}
sumFunctions(storySrc, /function _colBook\d+Pages\(\)\{/, 'Collège Français — collection bonus (5 tomes, TOTAL)');
sumFunctions(storySrc, /function _histBook\d+Pages\(\)\{/, 'Primaire Histoire — collection bonus (6 tomes, TOTAL)');

// ── Affichage ────────────────────────────────────────────────────
console.log('\n=== Comptage de mots — mode Odyssée ===\n');
let maxLabel = Math.max(...results.map(r => r.label.length));
for (const r of results) {
  const label = r.label.padEnd(maxLabel + 2);
  if (r.error) { console.log(`${label} ERREUR: ${r.error}`); continue; }
  console.log(`${label} ${String(r.pages).padStart(3)} pages,  ${String(r.words).padStart(6)} mots`);
}
console.log('\nRappel : compare ces chiffres aux fourchettes cibles ADR-2 (voir document de transition).');
