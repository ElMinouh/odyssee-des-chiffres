// AUD-02-030 (audit fonctionnel 2026-09-21) — les 6 sélecteurs d'enfant de
// l'espace parent (parent-player, hw-player, calm-player, block-player,
// filter-player, bsubj-player) n'étaient jamais synchronisés entre eux : changer
// d'enfant dans un onglet (ex. Suivi) n'avait aucune influence sur les autres
// (ex. Devoir du jour), qui restaient sur le premier enfant du roster par
// défaut — risque de mauvaise manipulation silencieuse dans un foyer
// multi-enfants. _onParentPlayerSelectChange() (09-parent.js) propage désormais
// le choix à tous les sélecteurs.
//
// AUD-03-002 (audit UX 2026-09-25) — ces 6 sélecteurs redondants (dont un,
// enc-msg-player, pas même synchronisé) ont été remplacés par un seul
// sélecteur 'enc-player', sticky en haut de l'onglet Encadrement. Il ne
// reste donc plus que 2 sélecteurs "enfant" au total : 'parent-player'
// (onglet Suivi) et 'enc-player' (onglet Encadrement, pilote les 6 panneaux).
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '06b-time-block.js', '09-parent.js'];

const SELECT_IDS = ['parent-player', 'enc-player'];

function setupGame() {
  const api = loadGame(FILES);
  api._ls.setItem('roster', JSON.stringify(['Adam', 'Emma']));
  api.setP(api.defProfile('Emma'));
  SELECT_IDS.forEach(id => { api._domEl(id).value = 'Adam'; }); // état initial désynchronisé
  return api;
}

describe('_onParentPlayerSelectChange() — synchronise les sélecteurs d\'enfant (parent-player + enc-player)', () => {
  it('changer un sélecteur propage la valeur à tous les autres', () => {
    const api = setupGame();
    api._onParentPlayerSelectChange('Emma');
    SELECT_IDS.forEach(id => {
      expect(api._domEl(id).value, `${id} désynchronisé`).toBe('Emma');
    });
  });

  it('ne plante pas si un sélecteur est absent du DOM (robustesse)', () => {
    const api = loadGame(FILES);
    api._ls.setItem('roster', JSON.stringify(['Adam']));
    api.setP(api.defProfile('Adam'));
    expect(() => api._onParentPlayerSelectChange('Adam')).not.toThrow();
  });
});
