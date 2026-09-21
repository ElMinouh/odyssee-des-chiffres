// AUD-02-009 (audit fonctionnel 2026-09-21) — GS.eventLeft (durée restante d'un
// événement aléatoire, ex. "Monstre Enragé" -> minuteur réduit) ne se décrémentait
// que sur une bonne réponse (validate(), 07-game.js). Un enfant qui enchaînait des
// mauvaises réponses pendant un tel événement le subissait indéfiniment — l'inverse
// de l'intention (le Mode Serein exclut déjà cet événement, ADR-38). Corrigé :
// décrément à CHAQUE question jouée, juste ou fausse.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '13-maternelle.js', '07-game.js'];

const Q = () => ({ res: 4, opKey: '+', type: 'normal', display: '2 + 2', a: 2, b: 2, op: '+' });

function setupGame(patchGS = {}) {
  const api = loadGame(FILES);
  api.setP(api.defProfile('Test'));
  api.setGM({ level: 'CP', mode2: 'normal' });
  api.setGS({ q: Q(), monsterHP: 3, monsterMaxHP: 3, isBoss: false, combo: 0, errInGame: 0, score: 0, ...patchGS });
  api.getPowers()['Test'] = {};
  return api;
}

describe('AUD-02-009 — la durée d\'un événement décompte aussi sur les mauvaises réponses', () => {
  it('une mauvaise réponse décrémente GS.eventLeft, comme le fait déjà une bonne réponse', () => {
    const api = setupGame({ activeEvent: 'reduce_timer', eventLeft: 2 });
    api.validate(999); // mauvaise réponse
    expect(api.getGS().eventLeft).toBe(1);
    expect(api.getGS().activeEvent).toBe('reduce_timer'); // pas encore terminé
  });

  it('l\'événement se termine (activeEvent remis à null) quand eventLeft atteint 0 sur une mauvaise réponse', () => {
    const api = setupGame({ activeEvent: 'reduce_timer', eventLeft: 1 });
    api.validate(999);
    expect(api.getGS().eventLeft).toBe(0);
    expect(api.getGS().activeEvent).toBeNull();
  });

  it('sans événement actif, une mauvaise réponse ne touche pas eventLeft/activeEvent', () => {
    const api = setupGame({ activeEvent: null, eventLeft: 0 });
    api.validate(999);
    expect(api.getGS().activeEvent).toBeNull();
    expect(api.getGS().eventLeft).toBe(0);
  });

  it('non-régression : une bonne réponse continue aussi de décrémenter eventLeft', () => {
    const api = setupGame({ activeEvent: 'reduce_timer', eventLeft: 2 });
    api.validate(4); // bonne réponse
    expect(api.getGS().eventLeft).toBe(1);
  });

  it('scénario du signalement : 2 erreurs consécutives suffisent à clore un événement de durée 2, plus jamais infini', () => {
    const api = setupGame({ activeEvent: 'reduce_timer', eventLeft: 2 });
    api.validate(999); // 1re erreur
    expect(api.getGS().activeEvent).toBe('reduce_timer');
    // Question suivante générée par la branche mauvaise réponse elle-même (showCorr/hitPlayer
    // ne rappellent pas generateQ ici) : on repositionne une question valide pour le 2e essai.
    api.setGS({ q: Q(), answering: false });
    api.validate(999); // 2e erreur consécutive
    expect(api.getGS().eventLeft).toBe(0);
    expect(api.getGS().activeEvent).toBeNull();
  });
});
