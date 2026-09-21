// AUD-02-025 (audit fonctionnel 2026-09-21) — resetProfile() (10-figurines.js)
// et _resetAllConfirm() (09-parent.js) qualifient leur action d'« irréversible »
// mais n'effaçaient que localStorage['user_'+nom] — laissant orphelins sous ce
// même prénom l'anniversaire (birthdays), l'historique de messagerie
// (chatProfiles) et les horaires autorisés (block_+nom). Un profil recréé plus
// tard avec le même prénom héritait silencieusement de ces données. Les deux
// fonctions appellent désormais _purgeChildData(name) en plus de la
// suppression du profil.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '09-parent.js', '10-figurines.js'];

function seedOrphanableData(api, name) {
  api._ls.setItem('user_' + name, JSON.stringify({ name }));
  api._ls.setItem('block_' + name, JSON.stringify({ start: '17:00', end: '18:00', enabled: true }));
  api._ls.setItem('birthdays', JSON.stringify({ [name]: { m: 4, d: 12 }, Autre: { m: 1, d: 1 } }));
  api._ls.setItem('chatProfiles', JSON.stringify({ [name]: { id: 'abc', enabled: true }, Autre: { id: 'xyz' } }));
}

describe('_purgeChildData() — purge anniversaire, messagerie et horaires pour un prénom donné', () => {
  it('efface les 3 structures associées au prénom, sans toucher aux autres profils', () => {
    const api = loadGame(FILES);
    seedOrphanableData(api, 'Léo');
    api._purgeChildData('Léo');
    expect(api._ls.getItem('block_Léo')).toBeNull();
    expect(JSON.parse(api._ls.getItem('birthdays'))).toEqual({ Autre: { m: 1, d: 1 } });
    expect(JSON.parse(api._ls.getItem('chatProfiles'))).toEqual({ Autre: { id: 'xyz' } });
  });

  it('ne plante pas si aucune donnée n\'existe pour ce prénom', () => {
    const api = loadGame(FILES);
    expect(() => api._purgeChildData('Inconnu')).not.toThrow();
  });
});

describe('resetProfile() — purge aussi les données orphelines (pas seulement user_+nom)', () => {
  it('efface anniversaire/messagerie/horaires en plus du profil', () => {
    const api = loadGame(FILES);
    seedOrphanableData(api, 'Léo');
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    api.resetProfile('Léo');
    expect(api._ls.getItem('user_Léo')).toBeNull();
    expect(api._ls.getItem('block_Léo')).toBeNull();
    expect(JSON.parse(api._ls.getItem('birthdays'))).toEqual({ Autre: { m: 1, d: 1 } });
    expect(JSON.parse(api._ls.getItem('chatProfiles'))).toEqual({ Autre: { id: 'xyz' } });
  });
});

describe('_resetAllConfirm() — purge aussi les données orphelines pour tous les profils du roster', () => {
  it('efface anniversaire/messagerie/horaires de chaque profil réinitialisé', () => {
    const api = loadGame(FILES);
    api._ls.setItem('roster', JSON.stringify(['Léo', 'Emma']));
    seedOrphanableData(api, 'Léo');
    api._ls.setItem('user_Emma', JSON.stringify({ name: 'Emma' }));
    api._ls.setItem('block_Emma', JSON.stringify({ start: '17:00', end: '18:00' }));

    api.resetAllProfiles(); // construit l'overlay (factice), positionne _resetAllTarget en interne
    api._domEl('reset-all-input').value = 'Léo, Emma'; // doit correspondre exactement à getRoster().join(', ')
    api._resetAllConfirm();

    expect(api._ls.getItem('user_Léo')).toBeNull();
    expect(api._ls.getItem('user_Emma')).toBeNull();
    expect(api._ls.getItem('block_Léo')).toBeNull();
    expect(api._ls.getItem('block_Emma')).toBeNull();
    expect(JSON.parse(api._ls.getItem('birthdays'))).toEqual({ Autre: { m: 1, d: 1 } });
    expect(JSON.parse(api._ls.getItem('chatProfiles'))).toEqual({ Autre: { id: 'xyz' } });
  });

  it('ne réinitialise rien si le texte retapé ne correspond pas exactement (non-régression du garde-fou existant)', () => {
    const api = loadGame(FILES);
    api._ls.setItem('roster', JSON.stringify(['Léo']));
    api._ls.setItem('user_Léo', JSON.stringify({ name: 'Léo' }));

    api.resetAllProfiles();
    api._domEl('reset-all-input').value = 'Mauvaise saisie';
    api._resetAllConfirm();

    expect(api._ls.getItem('user_Léo')).toBeTruthy(); // rien effacé
  });
});
