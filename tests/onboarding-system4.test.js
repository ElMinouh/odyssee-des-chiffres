import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
  '19-onboarding.js',
];

describe('Système 4 d\'onboarding — ob4IsCompleted / ob4MarkCompleted', () => {
  it('ob4IsCompleted() est faux par défaut, vrai après ob4MarkCompleted()', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'TestKid', onbMapSeen: false });
    expect(api.ob4IsCompleted()).toBe(false);

    api.ob4MarkCompleted();
    expect(api.ob4IsCompleted()).toBe(true);
  });
});

// Garde-fou de non-régression pour ADR-80 : toute nouvelle propriété du
// profil joueur doit être ajoutée à la liste blanche de désérialisation de
// validateProfile() (05-profile.js), sinon elle est silencieusement effacée
// à chaque rechargement de profil — c'est exactement ce qui était arrivé à
// onbMapSeen avant correctif (marqueur sauvegardé à true, mais reperdu au
// rechargement, provoquant une répétition en boucle de la visite guidée).
describe('validateProfile() — persistance de onbMapSeen (ADR-80)', () => {
  it('conserve onbMapSeen=true après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'TestKid', onbMapSeen: true };
    const out = api.validateProfile(raw, 'TestKid');
    expect(out.onbMapSeen).toBe(true);
  });

  it('conserve onbMapSeen=false par défaut si absent du profil brut', () => {
    const api = loadGame(FILES);
    const raw = { name: 'TestKid' };
    const out = api.validateProfile(raw, 'TestKid');
    expect(out.onbMapSeen).toBe(false);
  });
});
