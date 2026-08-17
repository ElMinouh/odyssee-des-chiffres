import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '05-profile.js', '12-cloud.js'];

// Garde-fou de non-régression pour ADR-99 : la synchronisation de routine
// (pushProfileToCloud, appelée par le timer périodique) doit désormais
// D'ABORD récupérer et fusionner le profil serveur, PAS pousser la copie
// locale à l'aveugle — sans ça, un appareil resté sur une ancienne
// progression ne corrige jamais son propre état, même quand le cloud a déjà
// la bonne version (ex. un reset fait sur un autre appareil).
describe('pushProfileToCloud() — pull + fusion avant le push (ADR-99)', () => {
  it('adopte localement la progression serveur plus avancée avant de pousser', async () => {
    const api = loadGame(FILES);
    // Appareil local : ancienne progression, pas encore au courant du reset.
    api.setP({
      name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true,
      mapBossBeaten: ['plaine', 'village'],
      zoneProgress: { plaine: { stepsCompleted: 5, completed: true } },
      adventureResetAt: 0,
    });
    // Le serveur a déjà le reset (un autre appareil l'a poussé plus tôt).
    api.setPullProfileFromCloud(async () => ({
      ok: true,
      profile: {
        name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true,
        mapBossBeaten: [], zoneProgress: {}, adventureResetAt: 9000,
      },
    }));

    await api.pushProfileToCloud();

    // Le push final échoue forcément (pas de vrai réseau dans ce bac à
    // sable) — ce qui compte ici : P a déjà été corrigé AVANT cet échec.
    expect(api.getP().mapBossBeaten).toEqual([]);
    expect(api.getP().adventureResetAt).toBe(9000);
  });

  it('conserve la progression locale si elle est plus avancée que le serveur (comportement de fusion normal)', async () => {
    const api = loadGame(FILES);
    api.setP({
      name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true,
      xp: 800, ownedFigurines: ['fig_rare'],
    });
    api.setPullProfileFromCloud(async () => ({
      ok: true,
      profile: { name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true, xp: 300, ownedFigurines: [] },
    }));

    await api.pushProfileToCloud();

    expect(api.getP().xp).toBe(800); // max conservé, rien perdu
    expect(api.getP().ownedFigurines).toContain('fig_rare');
  });

  it('retombe sur le comportement précédent (push direct de P) si le pull échoue', async () => {
    const api = loadGame(FILES);
    api.setP({ name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true, xp: 500 });
    api.setPullProfileFromCloud(async () => { throw new Error('hors ligne'); });

    // Ne doit pas planter, ni modifier P de façon inattendue (best-effort).
    await expect(api.pushProfileToCloud()).resolves.not.toThrow?.();
    expect(api.getP().xp).toBe(500);
  });

  it('ne fait rien si le profil n\'a pas de code cloud', async () => {
    const api = loadGame(FILES);
    api.setP({ name: 'TestKid' });
    let pullCalled = false;
    api.setPullProfileFromCloud(async () => { pullCalled = true; return { ok: false }; });

    const result = await api.pushProfileToCloud();

    expect(pullCalled).toBe(false);
    expect(result).toBe(false);
  });
});
