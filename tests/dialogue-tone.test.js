import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js',
  '09-parent.js', '10-figurines.js', '13-maternelle.js',
];

// Garde-fou de non-régression pour ADR-45 (ton des dialogues de combat adapté
// au cycle) : _dialogueTone() doit renvoyer 'tender' pour tous les niveaux
// maternelle (PS/MS/GS) et 'standard' pour tout le reste (CP à 3e). Découvert
// en 14e conversation : avant ADR-45, WRONG_TAUNTS était un pool unique et
// sombre partagé par tous les niveaux, y compris la maternelle — ce test
// protège contre une régression silencieuse du même type.
describe('_dialogueTone() — ton adapté au cycle (ADR-45)', () => {
  it('renvoie tender pour les 3 niveaux maternelle', () => {
    const api = loadGame(FILES);
    ['PS', 'MS', 'GS'].forEach(level => {
      api.setGM({ level });
      expect(api._dialogueTone()).toBe('tender');
    });
  });

  it('renvoie standard pour tous les niveaux primaire et collège', () => {
    const api = loadGame(FILES);
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6E', '5E', '4E', '3E'].forEach(level => {
      api.setGM({ level });
      expect(api._dialogueTone()).toBe('standard');
    });
  });

  it('les 2 tons existent bien dans MONSTER_DIALOGUES, avec les mêmes clés de pool', () => {
    const api = loadGame(FILES);
    const md = api.MONSTER_DIALOGUES;
    expect(md.tender).toBeDefined();
    expect(md.standard).toBeDefined();
    const tenderKeys = Object.keys(md.tender).sort();
    const standardKeys = Object.keys(md.standard).sort();
    expect(tenderKeys).toEqual(standardKeys);
    // Chaque pool doit avoir un contenu réel, pas un tableau vide oublié.
    tenderKeys.forEach(k => {
      expect(md.tender[k].length).toBeGreaterThan(0);
      expect(md.standard[k].length).toBeGreaterThan(0);
    });
  });
});
