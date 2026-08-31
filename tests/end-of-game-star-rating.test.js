import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.26 (demande de Cyril) : la notation 1-3 étoiles de fin de partie
// (affichage ⭐⭐⭐ à l'écran de résultats, PAS la monnaie du jeu) se basait
// sur un score brut à seuils fixes, ne tenant pas compte du niveau scolaire
// — un enfant de maternelle ne pouvait mathématiquement jamais obtenir 3
// étoiles, même à 100% de réussite. Basée désormais sur le taux de réussite
// réel (nombre d'erreurs), identique à tous les niveaux.
const FILES = ['01-core.js', '02-data.js', '07-game.js'];

describe('computeStars() — notation basée sur le taux de réussite, pas le score brut (07-game.js)', () => {
  it('défaite : toujours 0 étoile, quel que soit le score', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 0, qCount: 6 });
    expect(api.computeStars(999, false)).toBe(0);
  });

  it('victoire sans aucune erreur : 3 étoiles, même avec un score bas (cas maternelle du signalement)', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 0, qCount: 6 });
    // Score bas typique d'un niveau maternelle (1 pt/bonne réponse) qui,
    // avec l'ANCIEN calcul (score>=15), n'aurait jamais pu dépasser 1 étoile.
    expect(api.computeStars(6, true)).toBe(3);
  });

  it('victoire avec un score ÉLEVÉ mais des erreurs : ne décroche plus 3 étoiles automatiquement', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 4, qCount: 6 });
    // Avant : un score>=15 suffisait à lui seul, sans regarder les erreurs.
    expect(api.computeStars(30, true)).not.toBe(3);
  });

  it('victoire avec environ 30% d\'erreurs ou moins : 2 étoiles', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 2, qCount: 6 }); // 2/6 = 33%, arrondi ceil(6*0.3)=2 → limite incluse
    expect(api.computeStars(10, true)).toBe(2);
  });

  it('victoire avec plus de ~30% d\'erreurs : 1 étoile (victoire quand même récompensée)', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 3, qCount: 6 }); // 3/6 = 50%, au-delà du seuil
    expect(api.computeStars(10, true)).toBe(1);
  });

  it('fonctionne identiquement à tous les niveaux scolaires (0 erreur = 3 étoiles, peu importe le score)', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: 0, qCount: 6 });
    // Score maternelle (bas) et score collège (élevé) : même résultat à 0 erreur.
    expect(api.computeStars(6, true)).toBe(3);
    expect(api.computeStars(45, true)).toBe(3);
  });

  it('ne plante pas et retombe sur 0 erreur par défaut si GS n\'a pas encore ces champs', () => {
    const api = loadGame(FILES);
    api.setGS({ errInGame: undefined, qCount: undefined });
    expect(() => api.computeStars(10, true)).not.toThrow();
    expect(api.computeStars(10, true)).toBe(3); // 0 erreur par défaut (||0)
  });
});
