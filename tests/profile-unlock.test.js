import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// Fichiers suffisants pour la logique de déblocage.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '09-parent.js', '16-francais.js'];

describe('déblocage de niveaux par matière (isUnlocked / prevWins)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('un niveau de tête de cursus est toujours débloqué (UNLOCK_REQ = 0)', () => {
    api.setP({ levelWins: {}, levelWinsBySubj: { math: {}, fr: {} } });
    expect(api.isUnlocked('CP')).toBe(true);   // primaire
    expect(api.isUnlocked('6E')).toBe(true);   // collège
    expect(api.isUnlocked('PS')).toBe(true);   // maternelle
  });

  it('déblocage indépendant maths / français sur le même niveau', () => {
    // CP maths = 5 victoires (≥ CE1 requis:3), CP français = 1 (< 3)
    api.setP({
      levelWins: {},
      levelWinsBySubj: { math: { CP: 5 }, fr: { CP: 1 } },
    });
    expect(api.isUnlocked('CE1', 'math')).toBe(true);
    expect(api.isUnlocked('CE1', 'fr')).toBe(false);
  });

  it('prevWins lit bien la matière demandée, pas la matière courante', () => {
    api.setP({
      levelWins: {},
      levelWinsBySubj: { math: { CE1: 10 }, fr: { CE1: 0 } },
    });
    api.setGMsubject('fr'); // matière courante = fr
    // On demande explicitement les maths → doit ignorer GM.subject
    expect(api.prevWins('CE2', 'math')).toBe(10);
    expect(api.prevWins('CE2', 'fr')).toBe(0);
  });

  it('sans paramètre matière, retombe sur GM.subject', () => {
    api.setP({
      levelWins: {},
      levelWinsBySubj: { math: { CP: 9 }, fr: { CP: 0 } },
    });
    api.setGMsubject('math');
    expect(api.isUnlocked('CE1')).toBe(true);
    api.setGMsubject('fr');
    expect(api.isUnlocked('CE1')).toBe(false);
  });

  it('chaque cursus est indépendant : les maths CM2 ne débloquent pas la 5e', () => {
    api.setP({
      levelWins: {},
      levelWinsBySubj: { math: { CM2: 99 }, fr: {} },
    });
    // 5E dépend de 6E (même cursus collège), pas de CM2 (cursus primaire)
    expect(api.isUnlocked('5E', 'math')).toBe(false);
  });
});

describe('migration levelWinsBySubj (validateProfile)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('un ancien profil (sans levelWinsBySubj) attribue tout aux maths, fr à zéro', () => {
    const migrated = api.validateProfile({ name: 'Léo', levelWins: { CP: 7, CE1: 2 } }, 'Léo');
    expect(migrated.levelWinsBySubj.math.CP).toBe(7);
    expect(migrated.levelWinsBySubj.fr).toEqual({});

    // Conséquence concrète : maths débloqué, français verrouillé
    api.setP(migrated);
    expect(api.isUnlocked('CE1', 'math')).toBe(true);
    expect(api.isUnlocked('CE1', 'fr')).toBe(false);
  });

  it('un profil récent conserve son levelWinsBySubj existant', () => {
    const raw = { name: 'Zoé', levelWins: { CP: 1 }, levelWinsBySubj: { math: { CP: 4 }, fr: { CP: 4 } } };
    const out = api.validateProfile(raw, 'Zoé');
    expect(out.levelWinsBySubj).toEqual({ math: { CP: 4 }, fr: { CP: 4 } });
  });
});
