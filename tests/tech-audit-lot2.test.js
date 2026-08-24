import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

const ADV_KEYS = ['prim', 'primfr', 'primhist', 'mat', 'matfr', 'col', 'colfr'];

// Lot 2 de l'audit technique des 7 Odyssées (validé par Cyril) : les 23
// zones qui n'avaient pas de texte de fin (_ZONE_OUTRO) — toujours la
// dernière zone de la dernière région de chaque Odyssée — en ont désormais
// un, écrit en miroir de leur _ZONE_INTRO existant.
describe('Lot 2 — _ZONE_OUTRO couvre désormais 195/195 lieux (7 Odyssées)', () => {
  it('chaque Odyssée a désormais un outro pour 100% de ses zones', () => {
    const problems = [];
    let total = 0;
    for (const adv of ADV_KEYS) {
      const api = loadGame(FILES);
      api.startAdventure(adv, true);
      const zones = api.getMapZones();
      const outro = api._ZONE_OUTRO || {};
      total += zones.length;
      zones.forEach(z => {
        const entry = outro[z.id];
        if (!entry) problems.push(`${adv}/${z.id}: outro manquant`);
        else if (!entry.text || entry.text.length < 20) problems.push(`${adv}/${z.id}: texte absent ou trop court`);
        else if (!entry.emoji) problems.push(`${adv}/${z.id}: emoji manquant`);
      });
    }
    expect(problems).toEqual([]);
    expect(total).toBe(195); // total connu de lieux sur les 7 Odyssées
  });

  it('les 23 zones précédemment signalées manquantes ont bien un outro cohérent', () => {
    const api = loadGame(FILES);
    const outro = api._ZONE_OUTRO || {};
    const ids = [
      'sanctuaire', 'primfr_sanctuaire', 'primhist_sanctuaire',
      'mat_final_1', 'mat_final_2', 'mat_final_3', 'mat_final_4', 'mat_final_5',
      'matfr_final_1', 'matfr_final_2', 'matfr_final_3', 'matfr_final_4', 'matfr_final_5',
      'col_final_1', 'col_final_2', 'col_final_3', 'col_final_4', 'col_final_5',
      'colfr_col_final_1', 'colfr_col_final_2', 'colfr_col_final_3', 'colfr_col_final_4', 'colfr_col_final_5',
    ];
    expect(ids.length).toBe(23);
    ids.forEach(id => {
      expect(outro[id]).toBeTruthy();
      expect(typeof outro[id].text).toBe('string');
      expect(outro[id].text.length).toBeGreaterThan(20);
    });
  });

  it('_maybeShowZoneOutro() affiche bien la modale pour une des 23 zones (bout en bout)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [] });
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_final_5');
    let called = false;
    api._maybeShowZoneOutro(zone, () => { called = true; });
    const modal = api._lastCreatedElement();
    expect(modal.innerHTML).toContain('Roi des Étoiles');
    // La modale interrompt la chaîne : le callback n'est PAS encore appelé
    // (attendra la fermeture de la modale, cohérent avec _maybeShowStory).
    expect(called).toBe(false);
  });
});
