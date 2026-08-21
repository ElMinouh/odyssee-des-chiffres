import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// Garde-fou de non-régression pour l'audit Immersion narrative, Lot 1.
describe('N6 — progression dotée : le prologue compte dans la barre GLOBALE', () => {
  it('affiche un pourcentage global > 0 même sans aucune zone vaincue', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    api.setP({ name: 'TestKid', mapBossBeaten: [] });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    expect(html).toContain(`Prologue + 0/${zones.length} zones`);
    // (0+1)/(N+1) arrondi — doit être strictement positif dès lors qu'il y a des zones.
    expect(html).not.toContain('· 0%');
  });

  it('atteint toujours exactement 100% quand toutes les zones sont vaincues (condition inchangée)', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    api.setP({ name: 'TestKid', mapBossBeaten: zones.map(z => z.id) });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    expect(html).toContain('· 100%');
  });

  it('ne modifie pas les barres de progression PAR RÉGION (comptage réel, sans bonus)', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    api.setP({ name: 'TestKid', mapBossBeaten: [] });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    // Au moins une région doit afficher 0% (aucun bonus par région).
    expect(html).toMatch(/0%/);
  });
});
