import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.23 (demande de Cyril) : modification manuelle du solde d'étoiles
// depuis la Vue Parent, avec propagation à tous les appareils synchronisés
// (même mécanisme que parentRemoveFigurines) et intégration correcte au
// ledger _totalStarsEarned/_totalStarsSpent mis en place en v12.7.21.
const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '05-profile.js',
  '06c-seasonal.js', '07-game.js', '10-figurines.js', '12-cloud.js',
];

describe('parentSetStars() — modification manuelle du solde (10-figurines.js)', () => {
  it('une augmentation alimente _totalStarsEarned de la différence exacte', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 500;
    profile._totalStarsEarned = 500;
    profile._totalStarsSpent = 0;
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const res = api.parentSetStars('Léo', 800);
    expect(res.ok).toBe(true);
    expect(res.changed).toBe(true);
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.stars).toBe(800);
    expect(stored._totalStarsEarned).toBe(800); // 500 + 300 de correction
    expect(stored._totalStarsSpent).toBe(0);
  });

  it('une diminution alimente _totalStarsSpent de la différence exacte', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 7000;
    profile._totalStarsEarned = 7000;
    profile._totalStarsSpent = 0;
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    const res = api.parentSetStars('Léo', 1500);
    expect(res.ok).toBe(true);
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.stars).toBe(1500);
    expect(stored._totalStarsEarned).toBe(7000); // inchangé
    expect(stored._totalStarsSpent).toBe(5500); // 0 + 5500 de correction
  });

  it('la correction résiste à une fusion cloud ultérieure avec un appareil resté sur l\'ancien solde', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 7000;
    profile._totalStarsEarned = 7000;
    profile._totalStarsSpent = 0;
    api._ls.setItem('user_Léo', JSON.stringify(profile));
    api.parentSetStars('Léo', 1500); // correction du parent

    const corrected = JSON.parse(api._ls.getItem('user_Léo'));
    // Un autre appareil, resté sur l'ancien état (jamais informé de la
    // correction), tente de fusionner sa propre copie (encore à 7000).
    const staleDevice = { ...corrected, stars: 7000, _totalStarsSpent: 0 };
    const merged = api._mergeCloudProfiles(corrected, staleDevice);
    expect(merged.stars).toBe(1500); // la correction tient, ne remonte pas
  });

  it('aucun changement si la nouvelle valeur est identique à l\'ancienne', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 500;
    api._ls.setItem('user_Léo', JSON.stringify(profile));
    const res = api.parentSetStars('Léo', 500);
    expect(res.ok).toBe(true);
    expect(res.changed).toBe(false);
  });

  it('la valeur est bornée entre 0 et 999999', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 500;
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    api.parentSetStars('Léo', -50);
    expect(JSON.parse(api._ls.getItem('user_Léo')).stars).toBe(0);

    api.parentSetStars('Léo', 5000000);
    expect(JSON.parse(api._ls.getItem('user_Léo')).stars).toBe(999999);
  });

  it('met à jour P en mémoire et sauvegarde si le profil ciblé est le profil actif', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 500;
    api.setP(profile);
    api._ls.setItem('user_Léo', JSON.stringify(profile));

    api.parentSetStars('Léo', 900);
    expect(api.getP().stars).toBe(900);
    expect(api.getP()._totalStarsEarned).toBe(400);
  });

  it('ne touche pas P si le profil ciblé n\'est PAS le profil actif, mais propage via _pushOtherProfileToCloud si le cloud est activé', () => {
    const api = loadGame(FILES);
    const activeProfile = api.defProfile('Zoé');
    api.setP(activeProfile);

    const target = api.defProfile('Léo');
    target.stars = 500;
    target.cloudEnabled = true;
    target.cloudCode = 'ABCD1234';
    api._ls.setItem('user_Léo', JSON.stringify(target));

    let calledWith = null;
    api.setPushOtherProfileToCloud(async (data) => { calledWith = data; return true; });

    api.parentSetStars('Léo', 900);

    expect(api.getP().name).toBe('Zoé'); // profil actif intact
    expect(calledWith).not.toBeNull();
    expect(calledWith.stars).toBe(900);
  });

  it('paramètres invalides : ne plante pas', () => {
    const api = loadGame(FILES);
    expect(api.parentSetStars(null, 500).ok).toBe(false);
    expect(api.parentSetStars('ProfilInexistant', 500).ok).toBe(false);
    expect(api.parentSetStars('Léo', 'abc').ok).toBe(false);
  });
});
