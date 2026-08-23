import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js','02-data.js','03-figurines-data.js','04-questions.js','16-francais.js','18-histoire.js',
  '05-profile.js','06a-adaptive.js','06b-time-block.js','06c-seasonal.js','06d-cinematics.js',
  '07-story-core.js','07-map.js','07-game.js','07-boss.js','07-story.js','08-ui.js','09-parent.js',
  '10-figurines.js','12-cloud.js',
];

// Correctif trouvé lors de l'audit technique des 7 Odyssées : majorChoiceByAdv
// (ADR-59, le choix du joueur à un moment charnière de l'histoire, par
// Odyssée) était écrit en mémoire et fusionné correctement au cloud, mais
// absent de la liste blanche validateProfile() — donc silencieusement
// effacé à chaque rechargement de profil. Même défaut qu'ADR-80/lastAdventure.
describe('Correctif whitelist — P.majorChoiceByAdv survit à validateProfile()', () => {
  it('conserve un choix valide ({advKey: {idx: "A"|"B"}}) après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', majorChoiceByAdv: { mat: { 0: 'A', 1: 'B' }, col: { 0: 'B' } } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.majorChoiceByAdv).toEqual({ mat: { 0: 'A', 1: 'B' }, col: { 0: 'B' } });
  });

  it('vaut {} par défaut si absent du profil brut (jamais undefined)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.majorChoiceByAdv).toEqual({});
  });

  it('filtre les valeurs invalides (non-chaîne, trop longues) sans planter', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', majorChoiceByAdv: { mat: { 0: 'A', 1: 12345, 2: 'x'.repeat(50) }, bad: 'pas un objet', col: null } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.majorChoiceByAdv).toEqual({ mat: { 0: 'A' } });
  });

  it('bout en bout : le choix posé via le moment charnière survit à un cycle save→validateProfile', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    const p = api.getP();
    p.majorChoiceByAdv = p.majorChoiceByAdv || {};
    p.majorChoiceByAdv.mat = { 0: 'A' };
    const reloaded = api.validateProfile(JSON.parse(JSON.stringify(p)), 'Test');
    expect(reloaded.majorChoiceByAdv.mat).toEqual({ 0: 'A' });
  });
});
