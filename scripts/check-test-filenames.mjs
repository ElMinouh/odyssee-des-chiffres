#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// check-test-filenames.mjs — audit AUD-01-022 (ADR-85)
// ═══════════════════════════════════════════════════════════════
// Problème résolu : ADR-85 documente un incident réel — 3 fichiers nommés
// `*_test.js` au lieu de `*.test.js` ont été poussés sur le dépôt et n'ont
// JAMAIS été exécutés par Vitest (vitest.config.js ne scanne que
// `tests/**/*.test.js`), sans la moindre erreur ni échec visible. La seule
// parade en place depuis était procédurale ("vérifier avant de nommer un
// fichier") — aucun garde-fou automatisé.
//
// Ce script liste tous les fichiers .js de tests/ (hors tests/helpers/ et
// tests/setup.js, qui ne sont pas des suites de tests) et échoue si l'un
// d'eux ne matche pas *.test.js — pour que la récidive de l'incident ADR-85
// casse la CI au lieu de disparaître silencieusement.

import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const TESTS_DIR = 'tests';
const EXCEPTIONS = new Set(['setup.js']);

const entries = readdirSync(TESTS_DIR, { withFileTypes: true });
const offenders = entries
  .filter(e => e.isFile() && e.name.endsWith('.js') && !EXCEPTIONS.has(e.name))
  .map(e => e.name)
  .filter(name => !name.endsWith('.test.js'));

if (offenders.length > 0) {
  console.error('❌ Fichier(s) de test mal nommé(s) — jamais exécuté(s) par Vitest (vitest.config.js ne scanne que tests/**/*.test.js) :');
  for (const name of offenders) console.error(`   - ${join(TESTS_DIR, name)} → devrait finir par .test.js`);
  console.error('\nVoir ADR-85 dans ADR.md : c\'est exactement l\'incident que ce script existe pour empêcher.');
  process.exit(1);
}

console.log(`✅ Noms de fichiers de test OK (${entries.filter(e => e.isFile() && e.name.endsWith('.test.js')).length} fichiers *.test.js trouvés dans ${TESTS_DIR}/).`);
