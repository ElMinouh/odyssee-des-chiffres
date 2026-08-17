import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// Garde-fou de non-régression pour l'Audit qualité perçue #3 (Q2) : la
// galerie de Trophées doit afficher UNE médaille par boss de l'Odyssée en
// cours, verrouillée (classe "locked") pour ceux non vaincus, jamais les
// omettre — c'était le défaut trouvé par l'audit (0 emplacement visible pour
// les boss non vaincus, contrairement au Talisman/Arc-en-ciel).
describe('openAdventureLog() — galerie de Trophées avec emplacements verrouillés (Q2)', () => {
  it('affiche une médaille pour chaque zone, verrouillée si non vaincue', () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify({ name: 'TestKid', mapBossBeaten: [] }) });
    api.setP({ name: 'TestKid', mapBossBeaten: [] });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    const totalZones = api.getMapZones().length;
    const lockedCount = (html.match(/class="advlog-medal locked"/g) || []).length;
    const wonCount = (html.match(/class="advlog-medal"/g) || []).length;
    expect(wonCount + lockedCount).toBe(totalZones);
    expect(lockedCount).toBe(totalZones); // aucun boss vaincu → tout verrouillé
  });

  it('déverrouille uniquement les boss réellement vaincus', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    const firstId = zones[0].id;
    api.setP({ name: 'TestKid', mapBossBeaten: [firstId] });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    const lockedCount = (html.match(/class="advlog-medal locked"/g) || []).length;
    expect(lockedCount).toBe(zones.length - 1);
  });

  it('le titre de section affiche le format vaincus/total', () => {
    const api = loadGame(FILES);
    const zones = api.getMapZones();
    api.setP({ name: 'TestKid', mapBossBeaten: [zones[0].id, zones[1].id] });
    api.openAdventureLog();
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    const html = el ? el.innerHTML : '';
    expect(html).toContain(`Boss vaincus (2/${zones.length})`);
  });
});
