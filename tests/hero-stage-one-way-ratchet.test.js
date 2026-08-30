import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.25 — Bug signalé par Cyril (captures à l'appui) : l'animation
// "ÉVOLUTION ! MAÎTRE" réapparaissait après chaque partie. Cause probable :
// la condition du stade "Maître" dépend de _totalStarsEarned (>=100), un
// compteur récent (v12.7.21) dont une lecture transitoirement plus basse
// (ex. pendant une synchronisation cloud) pouvait faire recalculer un stade
// inférieur à celui déjà enregistré — et checkHeroStageProgress() ne
// vérifiait pas la DIRECTION du changement, donc traitait une régression
// comme un nouveau stade "franchi", qui se re-déclenchait ensuite dès que
// le bon stade se recalculait normalement.
const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js',
];

describe('checkHeroStageProgress() — le stade du héros est un cliquet à sens unique (06a-adaptive.js)', () => {
  // Note : pas de test bout-en-bout pour la PROGRESSION réelle — comme déjà
  // noté pour endGame()/checkHeroStageProgress() (voir stars-only-on-win),
  // showHeroEvolution() déclenche des confettis sur canvas non stubés dans
  // ce harnais minimal. On vérifie donc la condition de déclenchement au
  // niveau source.
  it('la condition de déclenchement compare bien les RANGS (progression stricte), pas juste une inégalité', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '06a-adaptive.js'), 'utf8');
    const fnStart = src.indexOf('function checkHeroStageProgress');
    const fnEnd = src.indexOf('function showHeroEvolution');
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('_rankOf(current.id) > _rankOf(lastStageId)');
  });

  it('une lecture transitoirement plus BASSE (régression) n\'écrase plus heroStageId', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('TestKid');
    // Stade déjà enregistré : maitre. Mais la lecture actuelle de
    // _totalStarsEarned est transitoirement sous le seuil (99 < 100) —
    // simule le scénario exact du bug (valeur pas encore synchronisée).
    profile.levelWins = { CP: 50 };
    profile._totalStarsEarned = 99;
    profile.heroStageId = 'maitre';
    api.setP(profile);
    expect(() => api.checkHeroStageProgress()).not.toThrow();
    expect(api.getP().heroStageId).toBe('maitre'); // jamais rétrogradé à 'aventurier'
  });

  it('scénario complet en 2 temps : plus de ré-déclenchement en boucle après une lecture basse suivie d\'un retour à la normale', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('TestKid');
    profile.levelWins = { CP: 50 };
    profile.heroStageId = 'maitre';

    // Partie 1 : lecture transitoirement basse (comme dans le bug)
    profile._totalStarsEarned = 99;
    api.setP(profile);
    api.checkHeroStageProgress();
    expect(api.getP().heroStageId).toBe('maitre'); // toujours maitre, pas de régression

    // Partie 2 : la valeur redevient normale (>=100)
    api.getP()._totalStarsEarned = 150;
    api.checkHeroStageProgress();
    // Avant le correctif, ce second appel aurait re-déclenché l'évolution
    // "maitre" (puisque heroStageId aurait été rétrogradé à 'aventurier'
    // entre-temps). Ici, rien ne doit se passer : déjà au bon stade.
    expect(api.getP().heroStageId).toBe('maitre');
  });

  it('aucun changement de stade : ne plante pas', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('TestKid');
    profile.levelWins = { CP: 1 };
    profile.heroStageId = 'oeuf';
    api.setP(profile);
    expect(() => api.checkHeroStageProgress()).not.toThrow();
    expect(api.getP().heroStageId).toBe('oeuf');
  });

  it('le code source appelle toujours saveProfileNow() (déjà vérifié en v12.7.14, non régressé)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '06a-adaptive.js'), 'utf8');
    const fnStart = src.indexOf('function checkHeroStageProgress');
    const fnEnd = src.indexOf('function showHeroEvolution');
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('saveProfileNow');
  });
});
