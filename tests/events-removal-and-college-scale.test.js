import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.16 — Demande de Cyril, suite à l'audit des gains d'étoiles :
// suppression des évènements "Tempête de Maths" (double_score) et
// "Tour Doré" (next_golden), et resserrement du barème collège.
describe('EVENTS — "Tempête de Maths" et "Tour Doré" retirés (02-data.js)', () => {
  it('ne contient plus que 2 évènements, sans double_score ni next_golden', () => {
    const api = loadGame(['02-data.js']);
    const effects = api.EVENTS.map(e => e.effect);
    expect(effects).not.toContain('double_score');
    expect(effects).not.toContain('next_golden');
    expect(effects.sort()).toEqual(['heal_all', 'reduce_timer'].sort());
    expect(api.EVENTS.length).toBe(2);
  });
});

describe('Barème collège resserré (07-game.js, _lvlBase)', () => {
  const FILES = [
    '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
    '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
    '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
    '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js',
  ];

  // Le code source ne peut pas être appelé isolément (fonction interne à
  // validate()) ; on vérifie donc directement la table au niveau source,
  // comme déjà fait pour d'autres constantes internes de ce fichier.
  it('le code source contient bien le nouveau barème 6E=2-4, 5E=3-5, 4E=4-6, 3E=5-7', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("'6E':[2,4]");
    expect(src).toContain("'5E':[3,5]");
    expect(src).toContain("'4E':[4,6]");
    expect(src).toContain("'3E':[5,7]");
    // Anciennes valeurs bien disparues (pas juste ajoutées à côté)
    expect(src).not.toContain("'6E':[3,5]");
    expect(src).not.toContain("'5E':[3,6]");
    expect(src).not.toContain("'4E':[4,7]");
    expect(src).not.toContain("'3E':[4,8]");
  });

  it('plus aucune référence aux effets retirés (double_score / next_golden) dans 07-game.js', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).not.toContain('double_score');
    expect(src).not.toContain('next_golden');
  });

  it('le jeu se charge toujours sans erreur avec ces deux évènements en moins', () => {
    expect(() => loadGame(FILES)).not.toThrow();
  });
});
