import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['07-boss.js'];

// Non-régression AUD-01-015 : "million" est un nom (contrairement à "mille",
// invariable), donc "quatre-vingts"/"cents" doivent prendre le -s du pluriel
// devant lui. Avant ce correctif, le multiplicateur était toujours calculé
// avec final=false, donnant "quatre-vingt millions" (faux) au lieu de
// "quatre-vingts millions".
describe('_numberToFrenchWords() — accord devant "millions"', () => {
  it('80 000 000 → "quatre-vingts millions" (accord pluriel)', () => {
    const api = loadGame(FILES);
    expect(api._numberToFrenchWords(80000000)).toBe('quatre-vingts millions');
  });

  it('200 000 000 → "deux-cents millions" (accord pluriel)', () => {
    const api = loadGame(FILES);
    expect(api._numberToFrenchWords(200000000)).toBe('deux-cents millions');
  });

  it('1 000 000 → "un million" (inchangé)', () => {
    const api = loadGame(FILES);
    expect(api._numberToFrenchWords(1000000)).toBe('un million');
  });

  it('80 000 (mille, invariable) → "quatre-vingt mille" (inchangé, pas de -s)', () => {
    const api = loadGame(FILES);
    expect(api._numberToFrenchWords(80000)).toBe('quatre-vingt mille');
  });

  it('80 000 020 → "quatre-vingts millions vingt" (reste inchangé)', () => {
    const api = loadGame(FILES);
    expect(api._numberToFrenchWords(80000020)).toBe('quatre-vingts millions vingt');
  });
});
