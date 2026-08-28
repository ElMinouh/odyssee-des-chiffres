import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.18 (demande de Cyril) : suppression de figurines depuis la Vue
// Parent — individuellement ou par licence entière — avec propagation à
// tous les appareils synchronisés via une liste "tombstone" (blockedFigurines)
// qui l'emporte toujours sur la fusion cloud de ownedFigurines.

const FIG_FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '05-profile.js',
  '06c-seasonal.js', '10-figurines.js', '12-cloud.js',
];

describe('validateProfile() — blockedFigurines (05-profile.js, ADR-111 pt.3)', () => {
  it('conserve blockedFigurines après une passe de désérialisation', () => {
    const api = loadGame(['05-profile.js']);
    const raw = { name: 'Léo', blockedFigurines: ['db01', 'hp02'] };
    const out = api.validateProfile(raw, 'Léo');
    expect(out.blockedFigurines).toEqual(['db01', 'hp02']);
  });

  it('valeur par défaut correcte si absente du profil brut', () => {
    const api = loadGame(['05-profile.js']);
    const out = api.validateProfile({ name: 'Léo' }, 'Léo');
    expect(out.blockedFigurines).toEqual([]);
  });

  it('defProfile() initialise blockedFigurines à un tableau vide', () => {
    const api = loadGame(['05-profile.js']);
    expect(api.defProfile('Léo').blockedFigurines).toEqual([]);
  });
});

describe('_mergeCloudProfiles() — blockedFigurines l\'emporte toujours sur ownedFigurines (12-cloud.js)', () => {
  it('une figurine retirée localement mais encore possédée côté serveur disparaît quand même après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01'], blockedFigurines: ['db02'], adventureResetAt: 0 };
    const imported = { ownedFigurines: ['db01', 'db02'], blockedFigurines: [], adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines).not.toContain('db02');
    expect(out.blockedFigurines).toContain('db02');
  });

  it('symétrique : retirée sur l\'AUTRE appareil (imported) suffit aussi à la faire disparaître localement après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01', 'db02'], blockedFigurines: [], adventureResetAt: 0 };
    const imported = { ownedFigurines: ['db01'], blockedFigurines: ['db02'], adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines).not.toContain('db02');
  });

  it('les figurines NON bloquées restent normalement fusionnées en union', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { ownedFigurines: ['db01'], blockedFigurines: [], adventureResetAt: 0 };
    const imported = { ownedFigurines: ['hp01'], blockedFigurines: [], adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines.sort()).toEqual(['db01', 'hp01'].sort());
  });

  it('blockedFigurines absent des deux côtés : ne plante pas', () => {
    const api = loadGame(['12-cloud.js']);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.blockedFigurines).toEqual([]);
  });
});

describe('parentRemoveFigurines() — suppression réelle depuis la Vue Parent (10-figurines.js)', () => {
  it('retire les figurines sélectionnées de ownedFigurines et les ajoute à blockedFigurines', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.ownedFigurines = ['db01', 'db02', 'hp01'];
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const res = api.parentRemoveFigurines('Léo', ['db01', 'hp01']);
    expect(res.ok).toBe(true);
    expect(res.removed).toBe(2);

    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.ownedFigurines).toEqual(['db02']);
    expect(stored.blockedFigurines.sort()).toEqual(['db01', 'hp01'].sort());
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
    dbOwned.forEach(id => expect(stored.blockedFigurines).toContain(id));
  });

  it('met aussi à jour P en mémoire et sauvegarde si le profil ciblé est le profil actif', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.ownedFigurines = ['db01', 'db02'];
    api.setP(profile);
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    api.parentRemoveFigurines('Léo', ['db01']);
    expect(api.getP().ownedFigurines).toEqual(['db02']);
    expect(api.getP().blockedFigurines).toContain('db01');
    // Persisté immédiatement (saveProfileNow), pas seulement en mémoire
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.blockedFigurines).toContain('db01');
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
    expect(api.getP().blockedFigurines).toEqual([]);
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
});

describe('Retrait définitif : une figurine bloquée ne peut plus être réattribuée (10-figurines.js, 06c-seasonal.js)', () => {
  it('buyFigurine() refuse le rachat d\'une figurine bloquée', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 9999;
    profile.blockedFigurines = ['db01'];
    api.setP(profile);
    api.buyFigurine('db01');
    expect(api.getP().ownedFigurines).not.toContain('db01');
    // Les étoiles ne doivent pas non plus avoir été dépensées
    expect(api.getP().stars).toBe(9999);
  });

  it('unlockSeasonalFigurine() refuse de réattribuer une figurine bloquée', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    profile.blockedFigurines = ['sx01'];
    api.setP(profile);
    const result = api.unlockSeasonalFigurine('sx01');
    expect(result).toBe(false);
    expect(api.getP().ownedFigurines).not.toContain('sx01');
  });

  it('_checkLicenseCompletions() ne réattribue jamais une figurine bloquée, même si les conditions sont remplies', () => {
    const api = loadGame(FIG_FILES);
    const profile = api.defProfile('Léo');
    const tlLocked = api.FIGURINES.find(f => f.uk === 'tl' && f.completionLock);
    expect(tlLocked).toBeTruthy();
    const others = api.FIGURINES.filter(f => f.uk === 'tl' && f.id !== tlLocked.id && !f.completionLock).map(f => f.id);
    profile.ownedFigurines = [...others]; // toutes les autres figurines Tobie Lolness possédées
    profile.blockedFigurines = [tlLocked.id]; // mais celle-ci a été retirée par un parent
    api.setP(profile);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).not.toContain(tlLocked.id);
  });
});
