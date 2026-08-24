import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.14 — Bug signalé par Cyril (captures à l'appui) : la visite guidée
// de la carte ("La Boussole") réapparaissait à chaque retour dans l'Odyssée.
// Cause : onbAccountSeen/onbMapSeen n'étaient traités par AUCUNE stratégie
// de fusion dans _mergeCloudProfiles() — une synchronisation cloud de
// routine leur faisait donc prendre la valeur "imported" à chaque pull,
// effaçant silencieusement le marqueur "vu" tout juste posé localement.
describe('_mergeCloudProfiles() — marqueurs onboarding (onbAccountSeen / onbMapSeen)', () => {
  it('un marqueur vu localement mais pas encore reçu côté serveur ne redevient jamais false', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { onbMapSeen: true, onbAccountSeen: true, adventureResetAt: 0 };
    const imported = { onbMapSeen: false, onbAccountSeen: false, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.onbMapSeen).toBe(true);
    expect(out.onbAccountSeen).toBe(true);
  });

  it('symétrique : vu sur l\'autre appareil (imported) suffit aussi à le garder vu partout', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { onbMapSeen: false, onbAccountSeen: false, adventureResetAt: 0 };
    const imported = { onbMapSeen: true, onbAccountSeen: true, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.onbMapSeen).toBe(true);
    expect(out.onbAccountSeen).toBe(true);
  });

  it('reste correct même si un reset d\'Odyssée est en jeu (ces marqueurs ne sont jamais réinitialisés par un reset)', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { onbMapSeen: true, onbAccountSeen: true, adventureResetAt: 9000 };
    const imported = { onbMapSeen: false, onbAccountSeen: false, adventureResetAt: 1000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.onbMapSeen).toBe(true);
    expect(out.onbAccountSeen).toBe(true);
  });

  it('absent des deux côtés : ne plante pas, reste false', () => {
    const api = loadGame(['12-cloud.js']);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.onbMapSeen).toBe(false);
    expect(out.onbAccountSeen).toBe(false);
  });
});

// v12.7.14 — Bug signalé par Cyril (captures à l'appui) : l'animation
// "ÉVOLUTION ! APPRENTI" réapparaissait à chaque lieu. Deux causes cumulées :
// (1) heroStageId, comme onbMapSeen ci-dessus, n'était traité par aucune
// stratégie de fusion cloud ; (2) checkHeroStageProgress() (06a-adaptive.js)
// sauvegardait via saveProfile() (débounce 800ms, déjà lancé 1500ms après la
// fin de partie) — trop tard : _startCombat() (07-map.js), au lieu suivant,
// rappelle loadProfile() avant cette écriture et efface le changement encore
// en mémoire seulement.
describe('_mergeCloudProfiles() — heroStageId (stade du héros)', () => {
  it('le stade le plus avancé l\'emporte, quel que soit le côté', () => {
    const api = loadGame(['12-cloud.js']);
    const out1 = api._mergeCloudProfiles(
      { heroStageId: 'apprenti', adventureResetAt: 0 },
      { heroStageId: 'oeuf', adventureResetAt: 0 }
    );
    expect(out1.heroStageId).toBe('apprenti');

    const out2 = api._mergeCloudProfiles(
      { heroStageId: 'oeuf', adventureResetAt: 0 },
      { heroStageId: 'aventurier', adventureResetAt: 0 }
    );
    expect(out2.heroStageId).toBe('aventurier');
  });

  it('absent des deux côtés : retombe sur "oeuf", ne plante pas', () => {
    const api = loadGame(['12-cloud.js']);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.heroStageId).toBe('oeuf');
  });
});

// Note : pas de test bout-en-bout via checkHeroStageProgress() quand un
// changement de stade se produit réellement — comme déjà noté dans
// journal-callback-variety.test.js pour endGame(), showHeroEvolution()
// déclenche des effets de bord DOM (confettis sur canvas) non stubés dans ce
// harnais minimal. On vérifie donc directement, au niveau source, que
// l'écriture utilise bien saveProfileNow() et non saveProfile() (débounce).
describe('checkHeroStageProgress() — sauvegarde immédiate du nouveau stade (06a-adaptive.js)', () => {
  it('le code source appelle saveProfileNow() (immédiat), pas seulement saveProfile() (débounce 800ms)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '06a-adaptive.js'), 'utf8');
    const fnStart = src.indexOf('function checkHeroStageProgress');
    const fnEnd = src.indexOf('function showHeroEvolution');
    expect(fnStart).toBeGreaterThan(-1);
    expect(fnEnd).toBeGreaterThan(fnStart);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('saveProfileNow');
  });

  it('aucun changement de stade : checkHeroStageProgress() ne plante pas et ne réécrit rien', () => {
    const FILES = [
      '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
      '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
      '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
      '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js',
    ];
    const api = loadGame(FILES);
    const profile = api.defProfile('TestKid');
    profile.levelWins = { CP: 1 }; // pas assez de victoires pour évoluer
    profile.heroStageId = 'oeuf';
    api.setP(profile);
    expect(() => api.checkHeroStageProgress()).not.toThrow();
    expect(api.getP().heroStageId).toBe('oeuf');
  });
});
