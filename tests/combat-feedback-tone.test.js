import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '13-maternelle.js', '07-game.js'];

const Q = () => ({ res: 4, opKey: '+', type: 'normal', display: '2 + 2', a: 2, b: 2, op: '+' });

function setupGame(patchGS = {}, patchGM = {}) {
  const api = loadGame(FILES);
  api.setP(api.defProfile('Test'));
  api.setGM({ level: 'CP', mode2: 'normal', ...patchGM });
  api.setGS({ q: Q(), monsterHP: 3, monsterMaxHP: 3, isBoss: false, combo: 0, errInGame: 0, score: 0, ...patchGS });
  api.getPowers()['Test'] = {};
  return api;
}

// Garde-fou de non-régression pour l'audit Immersion narrative, Lot 1, N2 :
// le feedback d'une mauvaise réponse doit rester dans le registre du combat
// ("le monstre esquive"), symétrique à "TOUCHÉ" côté victoire — jamais un
// verdict générique hors-fiction ("FAUX").
describe('N2 — feedback d\'échec combat-cohérent (ESQUIVE)', () => {
  it('affiche un message d\'esquive, jamais le verdict générique "FAUX"', () => {
    const api = setupGame();
    api.validate(999); // mauvaise réponse
    const el = api._domEl('feedback');
    expect(el.innerText).toContain('ESQUIVE');
    expect(el.innerText).not.toContain('FAUX');
  });
});
