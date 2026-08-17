import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

const THEMES = ['standard', 'foret', 'volcan', 'ocean', 'banquise', 'chateau', 'sakura', 'nuit', 'espace'];

describe('N5 — tous les PNJ de _NPCS_BY_THEME ont une réplique "région terminée"', () => {
  it('chaque PNJ des 9 thèmes possède un champ lineDone non vide', () => {
    const api = loadGame(FILES);
    for (const theme of THEMES) {
      for (const npc of api._NPCS_BY_THEME[theme]) {
        expect(typeof npc.lineDone).toBe('string');
        expect(npc.lineDone.length).toBeGreaterThan(0);
        expect(npc.lineDone).not.toBe(npc.line); // vraie variante, pas un doublon
      }
    }
  });
});

describe('_resolveNpcLine() — sélection de la réplique selon la progression réelle', () => {
  it('renvoie la réplique normale quand la région n\'est pas terminée', () => {
    const api = loadGame(FILES);
    const region = api.getArchRegions()[0];
    api.setP({ name: 'Test', mapBossBeaten: [] });
    const resolved = api._resolveNpcLine(region.id, 'standard', 0);
    expect(resolved.regionDone).toBe(false);
    expect(resolved.line).toBe(api._NPCS_BY_THEME.standard[0].line);
  });

  it('renvoie lineDone (avec {hero} substitué) quand TOUTES les zones de la région sont vaincues', () => {
    const api = loadGame(FILES);
    const region = api.getArchRegions()[0];
    const zones = api._zonesOfRegion(region.id);
    api.setP({ name: 'Test', mapBossBeaten: zones.map(z => z.id) });
    const resolved = api._resolveNpcLine(region.id, 'standard', 0);
    expect(resolved.regionDone).toBe(true);
    // v12.4.51 : {hero} est désormais substitué par le vrai prénom — on
    // compare après la même substitution plutôt qu'au texte brut.
    expect(resolved.line).toBe(api._NPCS_BY_THEME.standard[0].lineDone.replace(/\{hero\}/g, 'Test'));
  });

  it('reste sur la réplique normale si UNE seule zone de la région manque encore', () => {
    const api = loadGame(FILES);
    const region = api.getArchRegions()[0];
    const zones = api._zonesOfRegion(region.id);
    api.setP({ name: 'Test', mapBossBeaten: zones.slice(0, -1).map(z => z.id) });
    const resolved = api._resolveNpcLine(region.id, 'standard', 0);
    expect(resolved.regionDone).toBe(false);
  });
});
