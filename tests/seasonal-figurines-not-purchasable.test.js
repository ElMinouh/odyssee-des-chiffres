// AUD-02-035 (audit fonctionnel 2026-09-21) — les figurines saisonnières/
// anniversaire (uk:'sx', prix p:0, "Non-achetables — uniquement obtenues en
// battant le boss correspondant", 03-figurines-data.js ligne ~617) n'ont pas
// de completionLock, donc renderFigurinesShop() les affichait avec un bouton
// d'achat cliquable à "0 ⭐" (n'importe quelle figurine à prix nul, hors
// completionLock, retombait dans le "else" générique) et buyFigurine()
// acceptait l'achat sans broncher (spend(0, cb) réussit toujours). N'importe
// quel enfant pouvait ainsi obtenir gratuitement, en un clic, une figurine
// normalement réservée à la victoire d'un boss un jour précis de l'année.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '05-profile.js', '06a-adaptive.js', '06c-seasonal.js', '07-game.js', '08-ui.js', '10-figurines.js',
];

function setupGame() {
  const api = loadGame(FILES);
  const profile = api.defProfile('Test');
  profile.stars = 9999;
  api.setP(profile);
  return api;
}

describe('buyFigurine() refuse les figurines saisonnières/anniversaire (p:0, hors completionLock)', () => {
  it('refuse l\'achat et ne modifie ni la collection ni le solde d\'étoiles', () => {
    const api = setupGame();
    const starsBefore = api.getP().stars;
    api.buyFigurine('sx_epiphanie');
    expect(api.getP().ownedFigurines || []).not.toContain('sx_epiphanie');
    expect(api.getP().stars).toBe(starsBefore);
  });

  it('refuse aussi une figurine d\'anniversaire nominative (sx_anniv_soren)', () => {
    const api = setupGame();
    api.buyFigurine('sx_anniv_soren');
    expect(api.getP().ownedFigurines || []).not.toContain('sx_anniv_soren');
  });

  it('toutes les figurines à prix 0 du catalogue sont bien hors completionLock (hypothèse de la garde vérifiée)', () => {
    const api = loadGame(FILES);
    const zeroPriced = api.FIGURINES.filter(f => !(f.p > 0));
    expect(zeroPriced.length).toBeGreaterThan(0);
    zeroPriced.forEach(f => expect(f.completionLock, `${f.id} ne devrait pas avoir de completionLock`).toBeFalsy());
  });

  it('en revanche, unlockSeasonalFigurine() (le vrai mécanisme, via victoire de boss) continue de fonctionner', () => {
    const api = setupGame();
    const result = api.unlockSeasonalFigurine('sx_epiphanie');
    expect(result).toBe(true);
    expect(api.getP().ownedFigurines).toContain('sx_epiphanie');
  });
});

describe('Pas de régression sur les figurines normales et sur le déblocage par complétion de licence', () => {
  it('une figurine normale (prix > 0, hors completionLock) reste achetable normalement', () => {
    const api = setupGame();
    const normal = api.FIGURINES.find(f => f.p > 0 && !f.completionLock);
    expect(normal, 'aucune figurine normale trouvée dans le catalogue').toBeTruthy();
    api.buyFigurine(normal.id);
    expect(api.getP().ownedFigurines).toContain(normal.id);
    expect(api.getP().stars).toBe(9999 - normal.p);
  });

  it('une figurine completionLock reste achetable une fois la licence complète (comportement ADR-126 inchangé)', () => {
    const api = setupGame();
    const locked = api.FIGURINES.find(f => f.completionLock);
    expect(locked, 'aucune figurine completionLock trouvée').toBeTruthy();
    const others = api.FIGURINES.filter(f => f.uk === locked.uk && f.id !== locked.id && !f.completionLock).map(f => f.id);
    api.getP().ownedFigurines = [...others];
    api.buyFigurine(locked.id);
    expect(api.getP().ownedFigurines).toContain(locked.id);
  });

  it('une figurine completionLock reste refusée tant que la licence n\'est pas complète (comportement inchangé)', () => {
    const api = setupGame();
    const locked = api.FIGURINES.find(f => f.completionLock);
    api.buyFigurine(locked.id); // aucune autre figurine de la licence possédée
    expect(api.getP().ownedFigurines || []).not.toContain(locked.id);
  });
});

describe('renderFigurinesShop() — plus aucun bouton d\'achat sur les figurines saisonnières', () => {
  it('le filtre "sx" affiche les figurines saisonnières sans bouton fig-buy-btn associé, avec le message "À gagner en battant son boss"', () => {
    const api = setupGame();
    api._renderFigurinesShop('sx');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('Roi de la Galette'); // sx_epiphanie bien affichée
    expect(html).not.toContain('data-figid="sx_epiphanie"'); // mais pas de bouton d'achat
    expect(html).toContain('À gagner en battant son boss');
  });
});
