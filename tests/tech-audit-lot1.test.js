import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

// Lot 1 de l'audit technique des 7 Odyssées (validé par Cyril) :
// 1a. Nettoyage du code mort v-zone/renderZoneMap()/closeZone(), orphelins
//     depuis le correctif v12.7.2 ("Retour à la zone" → openArchipelZoom()).
// 1b. Ajout du champ "region" explicite aux 23 zones de PRIM_ZONES (seule
//     Odyssée qui ne l'avait pas — incohérence structurelle, zéro impact
//     fonctionnel car _regionOfZone()/_zonesOfRegion() avaient déjà un repli).
describe('Lot 1a — code mort retiré (v-zone / renderZoneMap / closeZone)', () => {
  it('renderZoneMap, closeZone et _loreZoneStepHtml n\'existent plus', () => {
    const api = loadGame(FILES);
    expect(api.renderZoneMap).toBeUndefined();
    expect(api.closeZone).toBeUndefined();
    expect(api._loreZoneStepHtml).toBeUndefined();
  });

  it('_currentZoneId / _currentStepIdx n\'existent plus', () => {
    const api = loadGame(FILES);
    expect(api._currentZoneId).toBeUndefined();
    expect(api._currentStepIdx).toBeUndefined();
  });

  it("VIEWS ne contient plus 'v-zone'", () => {
    const api = loadGame(FILES);
    expect(api.VIEWS).not.toContain('v-zone');
  });
});

describe('Lot 1b — PRIM_ZONES a désormais un champ "region" explicite, sur les 23 zones', () => {
  it('23/23 zones de prim ont un champ region, cohérent avec le niveau', () => {
    const api = loadGame(FILES);
    api.startAdventure('prim', true);
    const zones = api.getMapZones();
    expect(zones.length).toBe(23);
    const expected = {
      CP: 'cp', CE1: 'ce1', CE2: 'ce2', CM1: 'cm1', CM2: 'cm2',
    };
    zones.forEach(z => {
      expect(z.region).toBeTruthy();
      if (z.id === 'sanctuaire') {
        expect(z.region).toBe('final');
      } else {
        expect(z.region).toBe(expected[z.level]);
      }
    });
  });

  it('_regionOfZone() donne le même résultat qu\'avant (comportement inchangé)', () => {
    const api = loadGame(FILES);
    api.startAdventure('prim', true);
    const zone = api.getMapZones().find(z => z.id === 'foret');
    const region = api._regionOfZone(zone);
    expect(region.id).toBe('ce1');
  });

  it('primfr et primhist (dérivées de PRIM_ZONES) ne sont pas affectées', () => {
    const api = loadGame(FILES);
    api.startAdventure('primfr', true);
    const zone = api.getMapZones().find(z => z.id === 'primfr_foret');
    expect(zone.region).toBe('ce1');
  });
});
