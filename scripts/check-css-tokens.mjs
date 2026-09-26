#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// check-css-tokens.mjs — audit AUD-09-003 (cohérence globale, ADR-166)
// ═══════════════════════════════════════════════════════════════
// Problème résolu : CLAUDE.md §4 demande de vérifier les tokens du design
// system avant d'écrire une nouvelle valeur de rayon/ombre en CSS, mais rien
// ne le vérifiait — la règle était purement documentaire. AUD-04-003/004
// (audit graphique, jamais traité) mesuraient déjà une dérive importante.
//
// Ce script compte, dans css/styles.css, les déclarations border-radius et
// box-shadow qui utilisent une valeur brute plutôt qu'un token var(--...),
// et échoue si ce compte AUGMENTE par rapport à la référence ci-dessous.
// Objectif : ne pas bloquer la dette déjà là (chantier AUD-04, hors scope
// de ce script), seulement empêcher qu'elle continue de grossir.

import { readFileSync } from 'node:fs';

const CSS_FILE = 'css/styles.css';
// Référence mesurée le 2026-09-26 (ADR-166) : à ne baisser qu'en traitant
// réellement AUD-04-003/004, jamais en assouplissant ce script.
const BASELINE = { radius: 84, shadow: 135 };

const css = readFileSync(CSS_FILE, 'utf8');

function countRaw(prop) {
  const re = new RegExp(`${prop}:\\s*(?!var\\()[^;]+;`, 'g');
  return (css.match(re) || []).length;
}

const current = { radius: countRaw('border-radius'), shadow: countRaw('box-shadow') };

let failed = false;
for (const key of Object.keys(BASELINE)) {
  const prop = key === 'radius' ? 'border-radius' : 'box-shadow';
  if (current[key] > BASELINE[key]) {
    console.error(`❌ ${prop} : ${current[key]} valeur(s) brute(s) hors token (référence ADR-166 : ${BASELINE[key]}) — nouvelle dérive détectée.`);
    console.error(`   Utilise un token var(--radius-*)/var(--shadow-*) existant (voir DESIGN-SYSTEM.md / :root dans ${CSS_FILE}).`);
    failed = true;
  } else {
    console.log(`✅ ${prop} : ${current[key]} valeur(s) brute(s) (référence ADR-166 : ${BASELINE[key]}) — pas de nouvelle dérive.`);
  }
}

if (failed) process.exit(1);
