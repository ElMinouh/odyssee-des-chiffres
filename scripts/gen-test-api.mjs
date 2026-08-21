#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// gen-test-api.mjs — Lot A (audit npm test, ADR-?)
// ═══════════════════════════════════════════════════════════════
// Problème résolu : .eslintrc.json (clé "globals") et
// tests/helpers/loadGame.js (bloc d'exposition __api) étaient deux
// listes MANUELLES de toutes les fonctions/variables globales du
// jeu. Chaque nouvelle fonction ajoutée dans js/*.js devait être
// recopiée à la main aux deux endroits — ce qui n'a manifestement
// pas toujours été fait (110 warnings ESLint "non défini" sur du
// code qui existe bel et bien, et plusieurs tests qui échouaient
// faute d'exposition dans loadGame.js).
//
// Ce script élimine cette synchronisation manuelle : il scanne
// js/*.js, retrouve TOUTES les déclarations top-level (function,
// const, let, var), et régénère automatiquement :
//   1. la clé "globals" de .eslintrc.json
//   2. le bloc auto-généré de tests/helpers/loadGame.js (les
//      accesseurs manuels écrits à la main — setP/getP, getGM,
//      _domEl, etc. — restent inchangés, ce script ne touche que
//      le bloc marqué ci-dessous).
//
// À relancer avec `npm run sync:test-api` après tout ajout d'une
// nouvelle fonction/constante globale dans js/*.js. Ne modifie
// jamais js/*.js lui-même — uniquement .eslintrc.json et le bloc
// auto-généré de loadGame.js.
// ═══════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JS_DIR = path.join(ROOT, 'js');
const ESLINTRC_PATH = path.join(ROOT, '.eslintrc.json');
const LOADGAME_PATH = path.join(ROOT, 'tests', 'helpers', 'loadGame.js');

// ── 1. Scan de js/*.js : extraction des déclarations top-level ──
function scanDeclarations() {
  const declared = new Map(); // nom -> 'function' | 'value'
  const files = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')).sort();

  for (const file of files) {
    const text = fs.readFileSync(path.join(JS_DIR, file), 'utf8');
    for (const rawLine of text.split('\n')) {
      const line = rawLine.replace(/\r$/, '');

      const fnMatch = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(line);
      if (fnMatch) { declared.set(fnMatch[1], 'function'); continue; }

      const declMatch = /^(?:const|let|var)\s+(.*)$/.exec(line);
      if (!declMatch) continue;

      // Découpe les déclarateurs séparés par des virgules de PROFONDEUR 0
      // (ex: "let a=[],b=1;" → ["a=[]", "b=1"]), sans se faire piéger par
      // les virgules à l'intérieur d'un objet/tableau/appel imbriqué.
      const rest = declMatch[1];
      let depth = 0, cur = '';
      const parts = [];
      for (const c of rest) {
        if ('{[('.includes(c)) depth++;
        else if ('}])'.includes(c)) depth--;
        if (depth === 0 && c === ',') { parts.push(cur); cur = ''; continue; }
        if (depth === 0 && c === ';') break;
        cur += c;
      }
      parts.push(cur);
      for (const part of parts) {
        const nameMatch = /^\s*([A-Za-z_$][\w$]*)/.exec(part);
        if (nameMatch) declared.set(nameMatch[1], 'value');
      }
    }
  }
  return declared;
}

// ── 2. Régénération de .eslintrc.json (clé "globals") ──
function updateEslintrc(declared) {
  const config = JSON.parse(fs.readFileSync(ESLINTRC_PATH, 'utf8'));
  const globals = {};
  for (const name of [...declared.keys()].sort()) {
    globals[name] = 'writable';
  }
  config.globals = globals;
  fs.writeFileSync(ESLINTRC_PATH, JSON.stringify(config, null, 2) + '\n');
  return Object.keys(globals).length;
}

// ── 3. Régénération du bloc auto-généré de loadGame.js ──
const AUTO_START = '  // ─── BLOC AUTO-GÉNÉRÉ (ne pas éditer à la main — voir scripts/gen-test-api.mjs) ───\n';
const AUTO_END = '  // ─── FIN BLOC AUTO-GÉNÉRÉ ───\n';

function buildAutoBlock(declared) {
  const lines = [AUTO_START];
  for (const name of [...declared.keys()].sort()) {
    const kind = declared.get(name);
    if (kind === 'function') {
      lines.push(`  ${name}: (typeof ${name}==='function') ? ${name} : undefined,\n`);
    } else {
      lines.push(`  ${name}: (typeof ${name}!=='undefined') ? ${name} : undefined,\n`);
    }
  }
  lines.push(AUTO_END);
  return lines.join('');
}

function updateLoadGame(declared) {
  const text = fs.readFileSync(LOADGAME_PATH, 'utf8');
  const startIdx = text.indexOf(AUTO_START);
  const endIdx = text.indexOf(AUTO_END);
  const autoBlock = buildAutoBlock(declared);

  let newText;
  if (startIdx === -1 || endIdx === -1) {
    // Première exécution : pas encore de bloc marqué, on l'insère juste
    // après l'ouverture de "globalThis.__api = {".
    const anchor = 'globalThis.__api = {\n';
    const anchorIdx = text.indexOf(anchor);
    if (anchorIdx === -1) throw new Error('Ancre "globalThis.__api = {" introuvable dans loadGame.js');
    const insertAt = anchorIdx + anchor.length;
    newText = text.slice(0, insertAt) + autoBlock + text.slice(insertAt);
  } else {
    newText = text.slice(0, startIdx) + autoBlock + text.slice(endIdx + AUTO_END.length);
  }
  fs.writeFileSync(LOADGAME_PATH, newText);
  return declared.size;
}

// ── Exécution ──
const declared = scanDeclarations();
const nGlobals = updateEslintrc(declared);
const nApi = updateLoadGame(declared);
console.log(`gen-test-api : ${nGlobals} globals régénérés dans .eslintrc.json`);
console.log(`gen-test-api : ${nApi} entrées auto-générées dans tests/helpers/loadGame.js`);
