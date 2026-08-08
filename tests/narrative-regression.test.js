import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.0.20 — Filet de non-régression narrative (fiche 9, audit de cohérence
// globale). Règle du projet : tout lecteur de contenu narratif DOIT toujours
// afficher un bouton de fermeture. Cette règle a déjà été oubliée une fois
// par le passé (_renderColBook) et corrigée manuellement — ce test empêche
// qu'un futur lot de code recrée le même oubli sans qu'on s'en aperçoive.
const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// Signature exacte du SVG de fermeture unifié (voir convention établie en
// 10e conversation : toujours ce SVG, jamais le glyphe texte "✕").
const CLOSE_SVG_PATH = 'M6 6l12 12M18 6L6 18';

function expectCloseButton(innerHTML, label) {
  expect(innerHTML, `${label} : devrait contenir un <button>`).toMatch(/<button/);
  expect(innerHTML, `${label} : devrait contenir le SVG de fermeture unifié`).toContain(CLOSE_SVG_PATH);
}

describe('Non-régression narrative : bouton de fermeture toujours présent', () => {
  it('_renderColBook (livre bonus collection) affiche un bouton de fermeture', () => {
    const api = loadGame(FILES);
    api._renderColBook({ accent: '#9E4326', gold: '#C79A3A' }, 0, [{ html: 'Page de test' }]);
    const ov = api._lastCreatedElement();
    expectCloseButton(ov.innerHTML, '_renderColBook');
  });

  it('_renderHistBook (livre bonus histoire) affiche un bouton de fermeture', () => {
    const api = loadGame(FILES);
    api._renderHistBook({ accent: '#3a5a9e', gold: '#C79A3A' }, 0, [{ html: 'Page de test' }]);
    const ov = api._lastCreatedElement();
    expectCloseButton(ov.innerHTML, '_renderHistBook');
  });

  it('_openBossCard (carte de boss vaincu) affiche un bouton de fermeture', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    expect(zones && zones.length, 'MAP_ZONES doit contenir au moins une zone pour ce test').toBeGreaterThan(0);
    api._openBossCard(zones[0].id);
    const ov = api._lastCreatedElement();
    expectCloseButton(ov.innerHTML, '_openBossCard');
  });

  it('_renderTaleIllus (illustration de conte) affiche un bouton de fermeture', () => {
    const api = loadGame(FILES);
    api._renderTaleIllus({
      id: 'test-tale',
      title: 'Conte de test',
      accent: '#7c5bd0',
      pages: [{ text: 'Il était une fois...', illus: '' }],
    });
    const ov = api._lastCreatedElement();
    expectCloseButton(ov.innerHTML, '_renderTaleIllus');
  });

  it('openAdventureLog (carnet d\'aventure) affiche un bouton de fermeture', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', mapBossBeaten: [], stars: 0, ownedFigurines: [], xp: 0 });
    api.openAdventureLog();
    const ov = api._lastCreatedElement();
    expectCloseButton(ov.innerHTML, 'openAdventureLog');
  });
});
