import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js',
];

// Portée assumée (Lot 2, dette technique v19) : resetProfile() supprime
// intégralement la clé localStorage du profil ciblé — ce test couvre ce
// chemin (le profil ciblé n'est PAS le profil actif P, cas le plus courant
// depuis le tableau de bord parent). resetAllProfiles() (reset en masse,
// confirmation par saisie du roster dans une modale DOM réelle) reste hors
// périmètre de ce lot : trop dépendant du DOM réel pour un test unitaire
// fiable dans ce harnais.
describe('resetProfile() — aucun champ résiduel après reset (purge profil)', () => {
  it('supprime intégralement la clé localStorage du profil ciblé', () => {
    const profile = {
      name: 'Léo', stars: 120, xp: 500, ownedFigurines: ['fig1'],
      mapBossBeaten: ['prim_z1'], onbMapSeen: true,
    };
    const api = loadGame(FILES, { user_Léo: JSON.stringify(profile) });
    api.setShowConfirm((msg, onConfirm) => onConfirm());

    api.resetProfile('Léo');

    expect(api._ls.getItem('user_Léo')).toBe(null);
  });

  it('ne touche pas aux autres profils du roster', () => {
    const api = loadGame(FILES, {
      user_Léo: JSON.stringify({ name: 'Léo', stars: 120 }),
      user_Zoé: JSON.stringify({ name: 'Zoé', stars: 5 }),
    });
    api.setShowConfirm((msg, onConfirm) => onConfirm());

    api.resetProfile('Léo');

    expect(JSON.parse(api._ls.getItem('user_Zoé'))).toEqual({ name: 'Zoé', stars: 5 });
  });

  it('ne fait rien si aucun nom de profil n\'est fourni', () => {
    const api = loadGame(FILES, { user_Léo: JSON.stringify({ name: 'Léo', stars: 120 }) });
    api.setShowConfirm((msg, onConfirm) => onConfirm());

    api.resetProfile();

    expect(api._ls.getItem('user_Léo')).not.toBe(null);
  });
});
