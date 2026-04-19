// tests/game.test.js
// 5 tests pivots couvrant le cœur du jeu :
//   1. Calcul XP/niveau : xpForLevel et levelFromXP sont bien réciproques
//   2. Calcul des étoiles de fin : computeStars(score, won)
//   3. Génération de questions CP : structure et bornes
//   4. Validation profil : un profil bidouillé est assaini
//   5. Anti-répétition boss : _nextBossType ne renvoie jamais 2× le même type d'affilée

import { describe, it, expect, beforeAll } from 'vitest';
import { loadGame } from './loadGame.js';

let game;
beforeAll(() => {
  game = loadGame();
});

describe('1. XP et niveaux', () => {
  it('xpForLevel(1) vaut 0 (pas d\'XP requise pour le niveau 1)', () => {
    expect(game.xpForLevel(1)).toBe(0);
  });

  it('xpForLevel est strictement croissante', () => {
    for (let l = 1; l < 10; l++) {
      expect(game.xpForLevel(l + 1)).toBeGreaterThan(game.xpForLevel(l));
    }
  });

  it('levelFromXP(xpForLevel(N)) === N pour des niveaux variés', () => {
    for (const n of [1, 2, 5, 10, 25, 50]) {
      const xp = game.xpForLevel(n);
      expect(game.levelFromXP(xp)).toBe(n);
    }
  });

  it('levelFromXP plafonne à 50 même avec un XP énorme', () => {
    expect(game.levelFromXP(99999999)).toBe(50);
  });
});

describe('2. Calcul des étoiles de fin de partie', () => {
  it('computeStars renvoie 0 si la partie est perdue, peu importe le score', () => {
    expect(game.computeStars(0, false)).toBe(0);
    expect(game.computeStars(50, false)).toBe(0);
    expect(game.computeStars(999, false)).toBe(0);
  });

  it('computeStars : 1 étoile pour score 1-7, 2 pour 8-14, 3 pour 15+', () => {
    expect(game.computeStars(1, true)).toBe(1);
    expect(game.computeStars(7, true)).toBe(1);
    expect(game.computeStars(8, true)).toBe(2);
    expect(game.computeStars(14, true)).toBe(2);
    expect(game.computeStars(15, true)).toBe(3);
    expect(game.computeStars(100, true)).toBe(3);
  });
});

describe('3. Générateur de questions CP', () => {
  it('genQ_CP renvoie une question avec une réponse correcte', () => {
    // Réinitialiser GS pour le tracking anti-doublon
    game.GS.recentQ = [];
    const q = game.genQ_CP(false);
    expect(q).toBeDefined();
    expect(q.res).toBeTypeOf('number');
    expect(q.res).toBeGreaterThanOrEqual(0);
    expect(q.display).toBeTypeOf('string');
    expect(q.display.length).toBeGreaterThan(0);
    expect(['+', '-']).toContain(q.opKey);
  });

  it('genQ_CP en mode normal : nombres ≤ 10', () => {
    game.GS.recentQ = [];
    for (let i = 0; i < 20; i++) {
      const q = game.genQ_CP(false);
      // En mode non-boss, a et b restent dans des bornes raisonnables
      if (q.a !== undefined) expect(q.a).toBeLessThanOrEqual(10);
      if (q.b !== undefined) expect(q.b).toBeLessThanOrEqual(10);
      expect(q.res).toBeLessThanOrEqual(20);
    }
  });

  it('genQ_CP boss : produit aussi des soustractions et des nombres manquants', () => {
    game.GS.recentQ = [];
    game.GS.bossTypeQ = {};
    const types = new Set();
    for (let i = 0; i < 30; i++) {
      const q = game.genQ_CP(true);
      types.add(q.type);
    }
    // Le boss a un pool varié (normal + missing)
    expect(types.size).toBeGreaterThanOrEqual(2);
  });
});

describe('4. Validation et versioning du profil', () => {
  it('validateProfile rejette les valeurs aberrantes', () => {
    const malicious = {
      name: '<script>alert(1)</script>'.repeat(50),
      stars: 99999999,
      xp: -42,
      skills: { shield: 999, sword: 'NaN', clock: 2 },
      inventory: { potion: -10, bomb: 50 },
      prefs: { level: 'XYZ', mode: 'hack', theme: 'dark' },
      history: 'pas un tableau',
      ownedFigurines: ['valid_id', 42, null, { bad: true }, 'autre_id'],
      randomGarbage: 'should be ignored',
    };
    const v = game.validateProfile(malicious, 'Soren');
    expect(v.name.length).toBeLessThanOrEqual(30);
    expect(v.stars).toBeLessThanOrEqual(999999);
    expect(v.xp).toBeGreaterThanOrEqual(0);
    expect(v.skills.shield).toBeLessThanOrEqual(3);
    expect(v.skills.sword).toBe(0); // NaN → 0
    expect(v.inventory.potion).toBe(0); // négatif → 0
    expect(v.prefs.level).toBe('CP'); // invalide → défaut
    expect(v.prefs.mode).toBe('keyboard');
    expect(v.prefs.theme).toBe('standard');
    expect(Array.isArray(v.history)).toBe(true);
    // Seuls les IDs strings restent dans ownedFigurines
    expect(v.ownedFigurines).toEqual(['valid_id', 'autre_id']);
    expect(v.randomGarbage).toBeUndefined();
    expect(v._v).toBe(game.SAVE_VERSION);
  });

  it('validateProfile renvoie null pour des entrées invalides', () => {
    expect(game.validateProfile(null, 'X')).toBeNull();
    expect(game.validateProfile(undefined, 'X')).toBeNull();
    expect(game.validateProfile('garbage', 'X')).toBeNull();
    expect(game.validateProfile(42, 'X')).toBeNull();
  });

  it('validateProfile préserve un profil valide', () => {
    const ok = {
      _v: 6,
      name: 'Tomi',
      stars: 42,
      xp: 100,
      skills: { shield: 1, sword: 2, clock: 0 },
      inventory: { potion: 3, bomb: 0 },
      prefs: { level: 'CE2', mode: 'qcm', mode2: 'survie', theme: 'foret' },
      history: [{ score: 10 }],
      ownedFigurines: ['sw01', 'hp03'],
    };
    const v = game.validateProfile(ok, 'Tomi');
    expect(v.stars).toBe(42);
    expect(v.skills.shield).toBe(1);
    expect(v.skills.sword).toBe(2);
    expect(v.prefs.level).toBe('CE2');
    expect(v.prefs.theme).toBe('foret');
    expect(v.ownedFigurines).toEqual(['sw01', 'hp03']);
  });
});

describe('5. Anti-répétition boss (_nextBossType)', () => {
  it('Sur 100 appels avec 4 types, ne renvoie jamais le même type 2 fois d\'affilée', () => {
    game.GS.bossTypeQ = {};
    const types = ['add', 'sub', 'miss', 'mult'];
    let last = null;
    let collisions = 0;
    for (let i = 0; i < 100; i++) {
      const t = game._nextBossType(types, 'CE1');
      if (t === last) collisions++;
      last = t;
    }
    expect(collisions).toBe(0);
  });

  it('Avec un seul type, retourne toujours ce type (pas d\'erreur)', () => {
    game.GS.bossTypeQ = {};
    for (let i = 0; i < 5; i++) {
      expect(game._nextBossType(['solo'], 'CP')).toBe('solo');
    }
  });

  it('Tous les types sont distribués équitablement (sur un grand échantillon)', () => {
    game.GS.bossTypeQ = {};
    const types = ['a', 'b', 'c'];
    const counts = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 300; i++) {
      counts[game._nextBossType(types, 'CM2')]++;
    }
    // Distribution attendue : ~100 chacun, on tolère ±25
    for (const t of types) {
      expect(counts[t]).toBeGreaterThan(75);
      expect(counts[t]).toBeLessThan(125);
    }
  });
});
