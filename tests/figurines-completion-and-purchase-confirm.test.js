// AUD-02-037 / AUD-02-039 (audit fonctionnel 2026-09-21).
//
// AUD-02-037 : le compteur de complétion de la licence Saisonnier comptait
// les 21 figurines "sx" du catalogue, dont 5 gâteaux d'anniversaire
// nominatifs (sx_anniv_soren/peyo/tomi/papa/maman) — un joueur ne peut
// structurellement en obtenir qu'UN SEUL (le sien si câblé, sinon le
// générique sx_anniv), jamais les 6 variantes. _countableFigurines()
// exclut désormais du DÉNOMINATEUR toute variante d'anniversaire autre que
// celle réellement accessible à ce joueur (la grille elle-même reste
// complète, seul le compteur X/Y change).
//
// AUD-02-039 : aucune confirmation n'existait avant un achat de figurine,
// quel que soit son prix (jusqu'à 500⭐) — un double-tap accidentel dépensait
// définitivement des étoiles. Confirmation requise à partir de 200⭐.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '06c-seasonal.js', '07-game.js', '08-ui.js', '10-figurines.js'];

describe('_playerBirthdayFigId() — identifie la seule variante d\'anniversaire accessible', () => {
  it('renvoie l\'id nominatif si le prénom du joueur est câblé', () => {
    const api = loadGame(FILES);
    expect(api._playerBirthdayFigId('Soren')).toBe('sx_anniv_soren');
  });
  it('renvoie le générique si le prénom n\'est pas câblé', () => {
    const api = loadGame(FILES);
    expect(api._playerBirthdayFigId('Léo')).toBe('sx_anniv');
  });
});

describe('_countableFigurines() — dénominateur réellement atteignable (AUD-02-037)', () => {
  it('pour un joueur au prénom câblé (Soren) : sa figurine nominative comptée, les 4 AUTRES nominatives et le générique exclus', () => {
    const api = loadGame(FILES);
    const ids = api._countableFigurines('Soren').map(f => f.id);
    expect(ids).toContain('sx_anniv_soren');
    ['sx_anniv_peyo', 'sx_anniv_tomi', 'sx_anniv_papa', 'sx_anniv_maman', 'sx_anniv'].forEach(id => {
      expect(ids).not.toContain(id);
    });
  });

  it('pour un joueur au prénom non câblé (Léo) : le générique compté, les 5 nominatives exclues', () => {
    const api = loadGame(FILES);
    const ids = api._countableFigurines('Léo').map(f => f.id);
    expect(ids).toContain('sx_anniv');
    ['sx_anniv_soren', 'sx_anniv_peyo', 'sx_anniv_tomi', 'sx_anniv_papa', 'sx_anniv_maman'].forEach(id => {
      expect(ids).not.toContain(id);
    });
  });

  it('le total comptable est de 16 figurines "sx" (15 fixes + 1 anniversaire), pas 21', () => {
    const api = loadGame(FILES);
    const sxCountable = api._countableFigurines('Léo').filter(f => f.uk === 'sx');
    expect(sxCountable).toHaveLength(16);
  });

  it('les autres licences (ex. Dragon Ball) ne sont pas affectées', () => {
    const api = loadGame(FILES);
    const dbAll = api.FIGURINES.filter(f => f.uk === 'db').length;
    const dbCountable = api._countableFigurines('Léo').filter(f => f.uk === 'db').length;
    expect(dbCountable).toBe(dbAll);
  });
});

describe('renderFigCollection() — affiche le compteur global corrigé (16 pour "sx" via le total réel, pas 21)', () => {
  it('fig-count-hdr utilise le total comptable (_countableFigurines), pas FIGURINES.length brut', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo');
    p.ownedFigurines = ['sx_epiphanie'];
    api.setP(p);
    api.renderFigCollection();
    const hdrText = api._domEl('fig-count-hdr').textContent;
    const expectedTotal = api._countableFigurines('Léo').length;
    expect(hdrText).toContain(`/ ${expectedTotal}`);
    expect(expectedTotal).toBeLessThan(api.FIGURINES.length); // preuve que le filtrage a bien un effet
  });
});

describe('buyFigurine() — confirmation requise à partir de 200⭐ (AUD-02-039)', () => {
  it('un achat SOUS le seuil (150⭐) se fait immédiatement, sans confirmation', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.stars = 999; p._totalStarsEarned = 999;
    api.setP(p);
    let confirmCalled = false;
    api.setShowConfirm(() => { confirmCalled = true; });
    api.buyFigurine('db16'); // Chichi, 150⭐
    expect(confirmCalled).toBe(false);
    expect(api.getP().ownedFigurines).toContain('db16');
  });

  it('un achat AU-DESSUS du seuil (500⭐) exige une confirmation avant de dépenser', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.stars = 999; p._totalStarsEarned = 999;
    api.setP(p);
    let confirmMsg = null;
    api.setShowConfirm((msg) => { confirmMsg = msg; }); // ne confirme PAS automatiquement
    api.buyFigurine('db28'); // Shenron, 500⭐
    expect(confirmMsg).toContain('500');
    expect(api.getP().ownedFigurines || []).not.toContain('db28'); // pas acheté tant que non confirmé
  });

  it('une fois confirmé, l\'achat au-dessus du seuil se déroule normalement', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.stars = 999; p._totalStarsEarned = 999;
    api.setP(p);
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    api.buyFigurine('db28');
    expect(api.getP().ownedFigurines).toContain('db28');
  });
});
