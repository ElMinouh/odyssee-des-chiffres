import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js', '09-parent.js', '16-francais.js'];

// Prépare un localStorage contenant un profil "Léo" complet.
function storageAvecLeo(extra = {}) {
  return {
    roster: JSON.stringify(['Léo', 'Zoé']),
    'user_Léo': JSON.stringify({ name: 'Léo', stars: 42 }),
    'block_Léo': JSON.stringify({ start: '18:00', end: '19:00' }),
    'user_Zoé': JSON.stringify({ name: 'Zoé', stars: 5 }),
    birthdays: JSON.stringify({ 'Léo': { m: 5, d: 12 } }),
    chatProfiles: JSON.stringify({ 'Léo': { chatId: 'abc' } }),
    ...extra,
  };
}

describe('renameProfile', () => {
  it('renomme Léo → Max en déplaçant toutes les clés par-nom', () => {
    const api = loadGame(FILES, storageAvecLeo());
    api.setP({ name: 'Léo', stars: 42 }); // P cohérent avec user_Léo (profil courant)

    const res = api.renameProfile('Léo', 'Max');
    expect(res.ok).toBe(true);

    const ls = api._ls;
    // roster : Max remplace Léo, même position, Zoé intacte
    expect(JSON.parse(ls.getItem('roster'))).toEqual(['Max', 'Zoé']);
    // profil déplacé, ancienne clé supprimée
    expect(ls.getItem('user_Léo')).toBe(null);
    expect(ls.getItem('user_Max')).not.toBe(null);
    // le nom interne au profil est mis à jour
    expect(JSON.parse(ls.getItem('user_Max')).name).toBe('Max');
    expect(JSON.parse(ls.getItem('user_Max')).stars).toBe(42);
    // horaires déplacés
    expect(ls.getItem('block_Léo')).toBe(null);
    expect(ls.getItem('block_Max')).not.toBe(null);
  });

  it('déplace anniversaire et identité messagerie', () => {
    const api = loadGame(FILES, storageAvecLeo());
    api.setP({ name: 'Léo' });
    api.renameProfile('Léo', 'Max');
    const ls = api._ls;

    const bd = JSON.parse(ls.getItem('birthdays'));
    expect(bd['Max']).toEqual({ m: 5, d: 12 });
    expect(bd['Léo']).toBeUndefined();

    const cp = JSON.parse(ls.getItem('chatProfiles'));
    expect(cp['Max']).toEqual({ chatId: 'abc' });
    expect(cp['Léo']).toBeUndefined();
  });

  it('met à jour P.name si on renomme le profil courant', () => {
    const api = loadGame(FILES, storageAvecLeo());
    api.setP({ name: 'Léo' });
    api.renameProfile('Léo', 'Max');
    expect(api.getP().name).toBe('Max');
  });

  it('refuse un prénom déjà pris (insensible à la casse)', () => {
    const api = loadGame(FILES, storageAvecLeo());
    api.setP({ name: 'Léo' });
    const res = api.renameProfile('Léo', 'zoé'); // Zoé existe déjà
    expect(res.ok).toBe(false);
    // rien n'a bougé
    expect(api._ls.getItem('user_Léo')).not.toBe(null);
  });

  it('refuse un profil introuvable', () => {
    const api = loadGame(FILES, storageAvecLeo());
    const res = api.renameProfile('Inconnu', 'Max');
    expect(res.ok).toBe(false);
  });

  it('ne touche pas les autres profils du roster', () => {
    const api = loadGame(FILES, storageAvecLeo());
    api.setP({ name: 'Léo' });
    api.renameProfile('Léo', 'Max');
    // Zoé reste intacte
    expect(JSON.parse(api._ls.getItem('user_Zoé')).name).toBe('Zoé');
  });
});
