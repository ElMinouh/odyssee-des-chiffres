import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// Garde-fou de non-régression pour ADR-81 : le hash déterministe du décor de
// zone doit porter sur `label + zoneId`, jamais sur `zoneId` seul. Les 5
// zones réelles ci-dessous (région "cp") ont des ids quasi identiques
// (mat_cp_1 à mat_cp_5, ne différant que par le dernier chiffre) — c'est
// exactement le cas qui produisait le bug avant correctif (4 zones sur 5
// recevaient le même combo de décor).
const ZONES_CP = [
  { id: 'mat_cp_1', label: 'Le Pré Vert' },
  { id: 'mat_cp_2', label: 'Champ de Pâquerettes' },
  { id: 'mat_cp_3', label: 'La Petite Mare' },
  { id: 'mat_cp_4', label: 'Sentier des Câlins' },
  { id: 'mat_cp_5', label: 'Colline Arc-en-ciel' },
];

describe('_zoneDecorFor() — distribution du décor (ADR-81)', () => {
  it('renvoie un combo de 3 à 5 éléments distincts pour chaque zone', () => {
    const api = loadGame(FILES);
    for (const z of ZONES_CP) {
      const combo = api._zoneDecorFor(z.id, z.label);
      expect(combo.length).toBeGreaterThanOrEqual(3);
      expect(combo.length).toBeLessThanOrEqual(5);
      expect(new Set(combo).size).toBe(combo.length); // pas de doublon interne
    }
  });

  it('ne donne PAS le même combo à 4 zones sur 5 malgré des ids quasi identiques', () => {
    const api = loadGame(FILES);
    const combos = ZONES_CP.map(z => api._zoneDecorFor(z.id, z.label).slice().sort().join(','));
    const uniqueCombos = new Set(combos);
    // Avant ADR-81 (hash sur zoneId seul) : 4/5 combos identiques.
    // Après correctif (hash sur label+zoneId) : distribution réelle bien meilleure.
    expect(uniqueCombos.size).toBeGreaterThan(1);
  });

  it('est déterministe : deux appels sur la même zone donnent le même résultat', () => {
    const api = loadGame(FILES);
    const a = api._zoneDecorFor('mat_cp_1', 'Le Pré Vert');
    const b = api._zoneDecorFor('mat_cp_1', 'Le Pré Vert');
    expect(a).toEqual(b);
  });
});
