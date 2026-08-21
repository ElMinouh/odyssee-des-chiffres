import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

const ODYSSEES_CONNUES = ['prim', 'primfr', 'primhist', 'mat', 'matfr', 'col', 'colfr'];
const SHAPES = ['colline', 'feuille', 'dune', 'citadelle', 'nebuleuse', 'mandala'];

// Garde-fou de non-régression pour ADR-86 (Lot 3, dette technique v19) :
// chacune des 7 Odyssées connues doit recevoir une variante de forme
// STRICTEMENT différente des 6 autres, pour chaque forme de région.
describe('_islandVariantIdx() — zéro partage de forme entre Odyssées (ADR-86)', () => {
  it('assigne un index distinct à chacune des 7 Odyssées, pour chaque forme', () => {
    const api = loadGame(FILES);
    for (const shape of SHAPES) {
      const indices = ODYSSEES_CONNUES.map(adv => api._islandVariantIdx(shape, adv));
      expect(new Set(indices).size).toBe(ODYSSEES_CONNUES.length);
    }
  });

  it('chaque forme dispose bien de 7 profils (3 historiques + 4 nouveaux)', () => {
    const api = loadGame(FILES);
    for (const shape of SHAPES) {
      expect(api._ISLAND_PROFILE_VARIANTS[shape].length).toBe(7);
    }
  });

  it('reste stable/déterministe pour une Odyssée future non répertoriée (repli hash)', () => {
    const api = loadGame(FILES);
    const a = api._islandVariantIdx('colline', 'odyssee_future_inconnue');
    const b = api._islandVariantIdx('colline', 'odyssee_future_inconnue');
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(7);
  });
});
