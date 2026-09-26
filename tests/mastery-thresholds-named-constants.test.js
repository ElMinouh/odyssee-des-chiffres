import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-011 (audit pédagogique 2026-09-26) — plusieurs seuils de "maîtrise/difficulté"
// coexistaient en littéraux non nommés à des valeurs différentes selon l'usage (choix
// assumé : l'alerte parent doit être plus sensible que la félicitation à l'enfant) mais
// difficiles à retrouver. Nommage sans changement de valeur ni de comportement.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '07-game.js'];

describe('Seuils de maîtrise nommés (06a-adaptive.js / 07-game.js)', () => {
  it('les 3 constantes existent avec les valeurs historiques inchangées', () => {
    const api = loadGame(FILES);
    expect(api.SESSION_PROFILE_MIN_ATTEMPTS).toBe(5);
    expect(api.MASTERY_ANNOUNCE_MIN_ATTEMPTS).toBe(15);
    expect(api.MASTERY_ANNOUNCE_RATIO).toBe(0.85);
  });

  it('analyzeOpProfile() ignore toujours un opérateur avec moins de SESSION_PROFILE_MIN_ATTEMPTS tentatives', () => {
    const api = loadGame(FILES);
    api.setP({ opStats: { '+': { ok: 3, fail: 1 }, '-': { ok: 8, fail: 2 } } }); // + : 4 tentatives (<5), - : 10 (>=5)
    const profile = api.analyzeOpProfile();
    // Un seul opérateur avec assez de données : pas de comparaison possible (weakest/strongest null).
    expect(profile.weakest).toBeNull();
  });

  it('_checkMasteryAnnouncements() : toujours 15 tentatives et 85% pour annoncer une maîtrise', async () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ subject: 'math' });
    api.setGS({ _opsPlayed: ['+'] });
    // 14 tentatives à 100% : sous le seuil de tentatives, pas d'annonce.
    api.getP().opStats = { '+': { ok: 14, fail: 0 } };
    expect(api._checkMasteryAnnouncements()).toEqual([]);
    // 15 tentatives à 85% pile : annonce déclenchée.
    api.getP().masteryAnnounced = {};
    api.getP().opStats = { '+': { ok: 13, fail: 2 } }; // 13/15 ≈ 86.6% >= 85%
    expect(api._checkMasteryAnnouncements().length).toBe(1);
  });
});
