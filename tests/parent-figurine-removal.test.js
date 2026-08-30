import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.18 (demande de Cyril) : suppression de figurines depuis la Vue
// Parent — individuellement ou par licence entière — avec propagation à
// tous les appareils synchronisés via une liste "tombstone" (blockedFigurines)
// qui l'emporte toujours sur la fusion cloud de ownedFigurines.

const FIG_FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

describe('validateProfile() — blockedFigurinesAt / figAcquiredAt (05-profile.js, ADR-111 pt.3)', () => {
  it('conserve blockedFigurinesAt et figAcquiredAt après une passe de désérialisation', () => {
    const api = loadGame(['05-profile.js']);
    const raw = { name: 'Léo', blockedFigurinesAt: { db01: 1000 }, figAcquiredAt: { db01: 500 } };
    const out = api.validateProfile(raw, 'Léo');
    expect(out.blockedFigurinesAt).toEqual({ db01: 1000 });
    expect(out.figAcquiredAt).toEqual({ db01: 500 });
  });

  it('valeurs par défaut correctes si absentes du profil brut', () => {
    const api = loadGame(['05-profile.js']);
    const out = api.validateProfile({ name: 'Léo' }, 'Léo');
    expect(out.blockedFigurinesAt).toEqual({});
    expect(out.figAcquiredAt).toEqual({});
  });

  it('defProfile() initialise les deux cartes à vide', () => {
    const api = loadGame(['05-profile.js']);
    const p = api.defProfile('Léo');
    expect(p.blockedFigurinesAt).toEqual({});
    expect(p.figAcquiredAt).toEqual({});
  });
});

describe('_mergeCloudProfiles() — un rachat légitime l\'emporte sur un retrait plus ancien (12-cloud.js)', () => {
  it('une figurine retirée localement mais encore possédée côté serveur disparaît après fusion (aucun rachat depuis)', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01'], blockedFigurinesAt: { db02: 5000 }, figAcquiredAt: {}, adventureResetAt: 0 };
    const imported = { ownedFigurines: ['db01', 'db02'], blockedFigurinesAt: {}, figAcquiredAt: {}, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines).not.toContain('db02');
    expect(out.blockedFigurinesAt.db02).toBe(5000);
  });

  it('symétrique : retirée sur l\'AUTRE appareil (imported) suffit aussi à la faire disparaître localement après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01', 'db02'], blockedFigurinesAt: {}, figAcquiredAt: {}, adventureResetAt: 0 };
    const imported = { ownedFigurines: ['db01'], blockedFigurinesAt: { db02: 5000 }, figAcquiredAt: {}, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines).not.toContain('db02');
  });

  it('un RACHAT postérieur au retrait l\'emporte : la figurine reste possédée après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    // Retiré à t=1000, racheté à t=2000 (sur l'appareil local) : le rachat gagne.
    const local = { ownedFigurines: ['db02'], blockedFigurinesAt: { db02: 1000 }, figAcquiredAt: { db02: 2000 }, adventureResetAt: 0 };
    const imported = { ownedFigurines: [], blockedFigurinesAt: { db02: 1000 }, figAcquiredAt: {}, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines).toContain('db02');
  });

  it('un appareil resté sur l\'ancien état (avant le retrait) ne fait pas revivre une figurine déjà retirée ET rachetée ailleurs', () => {
    const api = loadGame(['12-cloud.js']);
    // Appareil A (imported) : a retiré (t=1000) PUIS rejoué/racheté (t=2000).
    // Appareil B (local) : jamais synchronisé depuis avant le retrait — ne
    // sait rien de tout ça, a toujours eu db02 dans ownedFigurines.
    const local = { ownedFigurines: ['db02'], blockedFigurinesAt: {}, figAcquiredAt: {}, adventureResetAt: 0 };
    const imported = { ownedFigurines: ['db02'], blockedFigurinesAt: { db02: 1000 }, figAcquiredAt: { db02: 2000 }, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    // Résultat correct dans ce cas précis (rachat après retrait) : reste possédée.
    expect(out.ownedFigurines).toContain('db02');
  });

  it('les figurines jamais retirées restent normalement fusionnées en union', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01'], blockedFigurinesAt: {}, figAcquiredAt: {}, adventureResetAt: 0 };
    const imported = { ownedFigurines: ['hp01'], blockedFigurinesAt: {}, figAcquiredAt: {}, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines.sort()).toEqual(['db01', 'hp01'].sort());
  });

  it('blockedFigurinesAt/figAcquiredAt absents des deux côtés : ne plante pas', () => {
    const api = loadGame(['12-cloud.js']);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.blockedFigurinesAt).toEqual({});
    expect(out.figAcquiredAt).toEqual({});
  });
});

describe('parentRemoveFigurines() — suppression réelle depuis la Vue Parent (10-figurines.js)', () => {
  it('retire les figurines sélectionnées de ownedFigurines et horodate le retrait dans blockedFigurinesAt', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.ownedFigurines = ['db01', 'db02', 'hp01'];
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const before = Date.now();
    const res = api.parentRemoveFigurines('Léo', ['db01', 'hp01']);
    expect(res.ok).toBe(true);
    expect(res.removed).toBe(2);

    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.ownedFigurines).toEqual(['db02']);
    expect(stored.blockedFigurinesAt.db01).toBeGreaterThanOrEqual(before);
    expect(stored.blockedFigurinesAt.hp01).toBeGreaterThanOrEqual(before);
  });

  it('ignore les ids non possédés (rien à supprimer) sans planter', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.ownedFigurines = ['db01'];
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const res = api.parentRemoveFigurines('Léo', ['sw01', 'sw02']);
    expect(res.ok).toBe(false);
    expect(res.removed).toBe(0);
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.ownedFigurines).toEqual(['db01']);
  });

  it('licence entière : supprime bien toutes les figurines possédées passées en une fois', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    const dbOwned = api.FIGURINES.filter(f => f.uk === 'db').slice(0, 4).map(f => f.id);
    profile.ownedFigurines = [...dbOwned, 'hp01'];
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const res = api.parentRemoveFigurines('Léo', dbOwned);
    expect(res.removed).toBe(dbOwned.length);
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.ownedFigurines).toEqual(['hp01']);
    dbOwned.forEach(id => expect(stored.blockedFigurinesAt[id]).toBeTypeOf('number'));
  });

  it('met aussi à jour P en mémoire et sauvegarde si le profil ciblé est le profil actif', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.ownedFigurines = ['db01', 'db02'];
    api.setP(profile);
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    api.parentRemoveFigurines('Léo', ['db01']);
    expect(api.getP().ownedFigurines).toEqual(['db02']);
    expect(api.getP().blockedFigurinesAt.db01).toBeTypeOf('number');
    // Persisté immédiatement (saveProfileNow), pas seulement en mémoire
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.blockedFigurinesAt.db01).toBeTypeOf('number');
  });

  it('ne touche pas P en mémoire si le profil ciblé n\'est PAS le profil actif', () => {
    const api = loadGame(FIG_FILES);
    const activeProfile = api.defProfile('Zoé');
    activeProfile.ownedFigurines = ['sw01'];
    api.setP(activeProfile);

    const otherProfile = api.defProfile('Léo');
    otherProfile.ownedFigurines = ['db01'];
    api._ls.setItem('user_Léo', JSON.stringify(otherProfile));

    api.parentRemoveFigurines('Léo', ['db01']);
    // Le profil actif (Zoé) reste totalement inchangé
    expect(api.getP().ownedFigurines).toEqual(['sw01']);
    expect(api.getP().blockedFigurinesAt).toEqual({});
    // Mais le profil ciblé (Léo), sur disque, est bien modifié
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.ownedFigurines).toEqual([]);
  });

  it('paramètres invalides : ne plante pas', () => {
    const api = loadGame(FIG_FILES);
    expect(api.parentRemoveFigurines(null, ['db01'])).toEqual({ ok: false, removed: 0 });
    expect(api.parentRemoveFigurines('Léo', [])).toEqual({ ok: false, removed: 0 });
    expect(api.parentRemoveFigurines('ProfilInexistant', ['db01'])).toEqual({ ok: false, removed: 0 });
  });

  // v12.7.22 — Bug signalé par Cyril : une figurine retirée depuis un
  // appareil où l'enfant n'était PAS le profil actif ne se propageait
  // jamais aux autres appareils, car pushProfileToCloud() n'agit que sur P.
  describe('propagation cloud immédiate même quand le profil ciblé n\'est PAS le profil actif (12-cloud.js)', () => {
    it('appelle _pushOtherProfileToCloud() avec les données mises à jour si le profil a le cloud activé', () => {
      const api = loadGame(FIG_FILES);
      const activeProfile = api.defProfile('Zoé'); // un AUTRE profil est actif sur cet appareil
      api.setP(activeProfile);

      const target = api.defProfile('Léo');
      target.ownedFigurines = ['db01'];
      target.cloudEnabled = true;
      target.cloudCode = 'ABCD1234';
      api._ls.setItem('user_Léo', JSON.stringify(target));

      let calledWith = null;
      api.setPushOtherProfileToCloud(async (data) => { calledWith = data; return true; });

      api.parentRemoveFigurines('Léo', ['db01']);

      expect(calledWith).not.toBeNull();
      expect(calledWith.name).toBe('Léo');
      expect(calledWith.ownedFigurines).toEqual([]);
      expect(calledWith.blockedFigurinesAt.db01).toBeTypeOf('number');
      // Le profil actif (Zoé) n'a pas bougé
      expect(api.getP().name).toBe('Zoé');
    });

    it('n\'appelle PAS _pushOtherProfileToCloud() si le profil ciblé n\'a pas le cloud activé', () => {
      const api = loadGame(FIG_FILES);
      const activeProfile = api.defProfile('Zoé');
      api.setP(activeProfile);

      const target = api.defProfile('Léo');
      target.ownedFigurines = ['db01'];
      target.cloudEnabled = false;
      api._ls.setItem('user_Léo', JSON.stringify(target));

      let called = false;
      api.setPushOtherProfileToCloud(async () => { called = true; });

      api.parentRemoveFigurines('Léo', ['db01']);

      expect(called).toBe(false);
      // Le retrait local, lui, a bien eu lieu
      const stored = JSON.parse(api._ls.getItem('user_Léo'));
      expect(stored.ownedFigurines).toEqual([]);
    });

    it('_pushOtherProfileToCloud() récupère et fusionne le profil serveur AVANT de pousser, sans toucher à P (profil actif)', async () => {
      const api = loadGame(['01-core.js', '05-profile.js', '12-cloud.js']);
      api.setP({ name: 'Zoé', xp: 10 }); // profil actif totalement différent
      api.setPullProfileFromCloud(async () => ({
        ok: true,
        profile: { name: 'Léo', cloudCode: 'ABCD1234', cloudEnabled: true, ownedFigurines: ['sw01'] },
      }));

      const target = { name: 'Léo', cloudCode: 'ABCD1234', cloudEnabled: true, ownedFigurines: [] };
      await api._pushOtherProfileToCloud(target);

      // Le push réseau final échoue forcément (pas de vrai réseau dans ce
      // bac à sable) — ce qui compte : la fusion a eu lieu et a été
      // enregistrée localement pour Léo, SANS toucher au profil actif (Zoé).
      const stored = JSON.parse(api._ls.getItem('user_Léo'));
      expect(stored.ownedFigurines).toContain('sw01');
      expect(api.getP().name).toBe('Zoé'); // profil actif intact
      expect(api.getP().xp).toBe(10);
    });

    it('_pushOtherProfileToCloud() ne plante pas si le profil n\'a pas de code cloud', async () => {
      const api = loadGame(['01-core.js', '05-profile.js', '12-cloud.js']);
      const result = await api._pushOtherProfileToCloud({ name: 'Léo' });
      expect(result).toBe(false);
    });
  });
});

describe('Une figurine retirée peut être rachetée/regagnée normalement ensuite (10-figurines.js, 06c-seasonal.js)', () => {
  it('buyFigurine() autorise le rachat d\'une figurine précédemment retirée, et horodate ce rachat', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 9999;
    profile.blockedFigurinesAt = { db01: 1000 };
    api.setP(profile);
    api.buyFigurine('db01');
    expect(api.getP().ownedFigurines).toContain('db01');
    expect(api.getP().figAcquiredAt.db01).toBeTypeOf('number');
    expect(api.getP().figAcquiredAt.db01).toBeGreaterThan(1000);
  });

  it('unlockSeasonalFigurine() autorise le regain d\'une figurine précédemment retirée, et horodate ce regain', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.blockedFigurinesAt = { sx01: 1000 };
    api.setP(profile);
    const result = api.unlockSeasonalFigurine('sx01');
    expect(result).toBe(true);
    expect(api.getP().ownedFigurines).toContain('sx01');
    expect(api.getP().figAcquiredAt.sx01).toBeGreaterThan(1000);
  });

  it('_checkLicenseCompletions() NE réattribue PAS automatiquement une figurine de complétion retirée (pas d\'action d\'achat délibérée)', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    const tlLocked = api.FIGURINES.find(f => f.uk === 'tl' && f.completionLock);
    expect(tlLocked).toBeTruthy();
    const others = api.FIGURINES.filter(f => f.uk === 'tl' && f.id !== tlLocked.id && !f.completionLock).map(f => f.id);
    profile.ownedFigurines = [...others]; // toutes les autres figurines Tobie Lolness possédées
    profile.blockedFigurinesAt = { [tlLocked.id]: 1000 }; // mais celle-ci a été retirée par un parent
    api.setP(profile);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).not.toContain(tlLocked.id);
  });
});
