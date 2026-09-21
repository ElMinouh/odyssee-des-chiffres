// AUD-02-020 (audit fonctionnel 2026-09-21) — importProfileFile() (09-parent.js)
// écrivait le contenu brut du fichier importé en localStorage, sans jamais
// appeler migrateProfile()/validateProfile() (contrairement à
// restoreProfileByCode()/forceRestoreFromCloud(), 12-cloud.js), et écrasait un
// profil existant sans jamais comparer son contenu à celui importé. Corrigé :
// chaque profil importé est désormais migré/validé avant écriture, et la
// confirmation affiche l'état du profil déjà présent sur l'appareil (s'il y en
// a un) en plus de celui du fichier.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '09-parent.js'];

function fakeImportEvent(payload) {
  return { target: { files: [{ name: 'save.json', __content: JSON.stringify(payload) }], value: '' } };
}

function setupGame() {
  const api = loadGame(FILES);
  api.setShowConfirm((msg, onConfirm) => { api._lastConfirmMsg = msg; onConfirm(); });
  return api;
}

describe('importProfileFile() — migre et valide chaque profil importé (AUD-02-020)', () => {
  it('un profil minimal (juste un nom) est migré/validé avant écriture, sans planter', () => {
    const api = setupGame();
    api.importProfileFile(fakeImportEvent({ app: 'odyssee-des-chiffres', version: '1', players: { Léo: { name: 'Léo' } } }));
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored).toBeTruthy();
    // validateProfile() pose des valeurs par défaut sûres (bornées/typées) sur
    // un profil minimal — signe que la migration/validation a bien eu lieu,
    // pas une simple recopie brute du fichier (qui n'aurait par exemple aucun
    // champ `prefs` ni `_v`).
    expect(stored._v).toBe(api.SAVE_VERSION);
    expect(stored.prefs?.level).toBeTruthy();
    expect(Array.isArray(stored.ownedFigurines)).toBe(true);
  });

  it('un profil déjà migré (champs complets) conserve ses valeurs après import', () => {
    const api = setupGame();
    api.importProfileFile(fakeImportEvent({
      app: 'odyssee-des-chiffres', version: '1',
      players: { Léo: { name: 'Léo', stars: 500, ownedFigurines: ['db01'], prefs: { level: 'CE1' } } },
    }));
    const stored = JSON.parse(api._ls.getItem('user_Léo'));
    expect(stored.stars).toBe(500);
    expect(stored.ownedFigurines).toContain('db01');
    expect(stored.prefs.level).toBe('CE1');
  });

  it('la confirmation affiche l\'état du profil déjà présent sur l\'appareil avant d\'écraser', () => {
    const api = setupGame();
    api._ls.setItem('user_Léo', JSON.stringify({ name: 'Léo', stars: 9999, ownedFigurines: ['a', 'b', 'c'] }));
    api.importProfileFile(fakeImportEvent({
      app: 'odyssee-des-chiffres', version: '1',
      players: { Léo: { name: 'Léo', stars: 10 } },
    }));
    expect(api._lastConfirmMsg).toContain('Remplace le profil actuel');
    expect(api._lastConfirmMsg).toContain('9999⭐');
  });

  it('sans profil existant sous ce nom, aucune mention de remplacement dans la confirmation', () => {
    const api = setupGame();
    api.importProfileFile(fakeImportEvent({
      app: 'odyssee-des-chiffres', version: '1',
      players: { Nouveau: { name: 'Nouveau', stars: 10 } },
    }));
    expect(api._lastConfirmMsg).not.toContain('Remplace le profil actuel');
  });

  it('un fichier corrompu (JSON invalide) est rejeté sans planter', () => {
    const api = setupGame();
    const event = { target: { files: [{ name: 'save.json', __content: "{ ceci n'est pas du JSON" }], value: '' } };
    expect(() => api.importProfileFile(event)).not.toThrow();
    expect(api._ls.getItem('user_Léo')).toBeNull();
  });
});
