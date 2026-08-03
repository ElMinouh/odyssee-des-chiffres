// v11.7.4 — Tests de caractérisation de validate() (07-game.js), en vue
// d'une future factorisation prudente (audit technique, point n°18).
//
// Objectif : ce ne sont PAS des tests de correction mathématique (déjà
// couverts par genq-invariants.test.js) mais des tests qui capturent le
// COMPORTEMENT ACTUEL de validate() — la fonction la plus critique et la
// plus dense du moteur de jeu (combat, score, quêtes, boss...) — pour
// qu'une future modification (même minime) ne puisse pas silencieusement
// changer ce comportement sans faire échouer un test.
//
// Portée volontairement limitée aux mécaniques les plus centrales (bonne/
// mauvaise réponse, dégâts au boss, bouclier, maternelle). Les mécaniques
// annexes (enrage, furie, figurines exclusives, quêtes détaillées...) ne
// sont pas couvertes ici — à ajouter si une future refactorisation les
// touche directement.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '13-maternelle.js', '07-game.js'];

// Question fixe et simple, utilisée dans la plupart des scénarios : 2 + 2 = 4.
const Q = () => ({ res: 4, opKey: '+', type: 'normal', display: '2 + 2', a: 2, b: 2, op: '+' });

function setupGame(patchGS = {}, patchGM = {}) {
  const api = loadGame(FILES);
  api.setP(api.defProfile('Test'));
  api.setGM({ level: 'CP', mode2: 'normal', ...patchGM });
  api.setGS({ q: Q(), monsterHP: 3, monsterMaxHP: 3, isBoss: false, combo: 0, errInGame: 0, score: 0, ...patchGS });
  api.getPowers()['Test'] = {};
  return api;
}

describe('validate() — bonne réponse (cas normal, non-boss)', () => {
  it('augmente le score, incrémente le combo et les stats d\'opération, fait perdre 1 PV au monstre', () => {
    const api = setupGame();
    api.validate(4);
    const gs = api.getGS();
    expect(gs.combo).toBe(1);
    expect(gs.maxCombo).toBe(1);
    expect(gs.score).toBeGreaterThan(0);
    expect(gs.errInGame).toBe(0);
    expect(gs.monsterHP).toBe(2); // 3 - 1
    expect(api.getP().opStats['+'].ok).toBe(1);
    expect(api.getP().opStats['+'].fail).toBe(0);
  });

  it('avec un combo déjà élevé (>=10), le multiplicateur de combo s\'applique (score encore plus élevé)', () => {
    // Fix flake (découvert en session de debug, hors Top 20 initial) : les points
    // de base sont tirés par Math.random() (07-game.js). Comparer deux tirages
    // indépendants pouvait faire échouer le test par malchance statistique (tirage
    // "sans combo" élevé + tirage "avec combo" bas = le ×2 ne suffit pas à
    // compenser), sans aucun bug réel dans le jeu. On fixe Math.random() pour que
    // les deux scénarios tirent exactement les mêmes points de base, et isoler
    // ainsi uniquement l'effet du multiplicateur de combo.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    try {
      const apiBase = setupGame({ combo: 0 });
      apiBase.validate(4);
      const scoreSansCombo = apiBase.getGS().score;

      const apiCombo = setupGame({ combo: 9 }); // le 10e coup déclenche le bonus
      apiCombo.validate(4);
      const scoreAvecCombo = apiCombo.getGS().score;

      expect(apiCombo.getGS().combo).toBe(10);
      // Le bonus de combo double les points de base : avec le même tirage de base
      // (Math.random figé), le score avec bonus doit être exactement le double.
      expect(scoreAvecCombo).toBe(scoreSansCombo * 2);
    } finally {
      randomSpy.mockRestore();
    }
  });
});

describe('validate() — mauvaise réponse (cas normal, non-boss)', () => {
  it('réinitialise le combo, incrémente errInGame et les stats d\'échec, enregistre l\'erreur', () => {
    const api = setupGame({ combo: 5 });
    api.validate(999); // mauvaise réponse
    const gs = api.getGS();
    expect(gs.combo).toBe(0);
    expect(gs.opCombo).toBe(0);
    expect(gs.errInGame).toBe(1);
    expect(api.getP().opStats['+'].fail).toBe(1);
    expect(api.getP().opStats['+'].ok).toBe(0);
    expect(gs.errList).toHaveLength(1);
    expect(gs.errList[0]).toMatchObject({ display: '2 + 2', res: 4 });
  });

  it('une réponse invalide (null) est traitée comme une erreur, sans faire planter le jeu', () => {
    const api = setupGame();
    expect(() => api.validate(null)).not.toThrow();
  });
});

describe('validate() — combat de boss', () => {
  it('le coup qui amène le boss à 0 PV le vainc', () => {
    const api = setupGame({ monsterHP: 1, monsterMaxHP: 3, isBoss: true });
    api.validate(4);
    expect(api.getGS().monsterHP).toBe(0);
  });

  it('un coup qui ne tue pas le boss enchaîne sur une nouvelle question', () => {
    const api = setupGame({ monsterHP: 3, monsterMaxHP: 3, isBoss: true });
    api.validate(4);
    const gs = api.getGS();
    expect(gs.monsterHP).toBe(2);
    expect(gs.q).toBeTruthy(); // une nouvelle question a été générée
  });

  it('bouclier de boss : le 1er coup est absorbé (aucun dégât), le 2e casse le bouclier et inflige 1 dégât', () => {
    const api = setupGame({ monsterHP: 3, monsterMaxHP: 3, isBoss: true, bossShieldActive: true });
    api.validate(4);
    expect(api.getGS().monsterHP).toBe(3); // absorbé, aucun dégât
    expect(api.getGS().bossShieldActive).toBe(true); // bouclier tient encore
    expect(api.getGS().bossShieldHits).toBe(1);

    // Simule le rendu de la question suivante (answering=false), comme le
    // ferait renderQ() en conditions réelles.
    api.setGS({ q: Q(), answering: false });
    api.validate(4);
    expect(api.getGS().monsterHP).toBe(2); // le bouclier cède, 1 dégât passe
    expect(api.getGS().bossShieldActive).toBe(false);
  });

  it('phase d\'enrage déclenchée à mi-vie (boss avec plusieurs PV)', () => {
    const api = setupGame({ monsterHP: 5, monsterMaxHP: 10, isBoss: true, bossEnraged: false });
    api.validate(4); // 5 -> 4, <= ceil(10/2)=5 : doit déclencher l'enrage
    expect(api.getGS().bossEnraged).toBe(true);
  });
});

describe('validate() — mode maternelle (PS/MS/GS)', () => {
  it('une mauvaise réponse ne pénalise pas (pas de perte de combo, pas d\'incrément errInGame)', () => {
    const api = setupGame({ combo: 5, errInGame: 0 }, { level: 'PS' });
    api.validate(999);
    const gs = api.getGS();
    expect(gs.combo).toBe(5); // inchangé
    expect(gs.errInGame).toBe(0); // inchangé
    expect(gs.matFirstTry).toBe(false);
  });
});
