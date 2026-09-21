import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['17-messaging.js'];

// Non-régression AUD-01-001 : le filtre bloquait par sous-chaîne (`includes`),
// ce qui déclenchait sur du vocabulaire scolaire courant contenant un mot
// interdit comme sous-chaîne ("content" contient "con", "pique-nique"
// contient "nique"). Le correctif matche par mot ENTIER (split sur les
// espaces uniquement, pas sur les tirets/apostrophes).
describe('Filtre anti-injures messagerie (_chatContainsBlockedWord)', () => {
  it('ne bloque plus les faux positifs de sous-chaîne', () => {
    const api = loadGame(FILES);
    const fn = api._chatContainsBlockedWord;
    expect(typeof fn).toBe('function');
    ['content', 'contente', 'contents', 'pique-nique', 'constellation', 'confiture', 'continuer', 'conjugaison', 'reconnaître', 'raconte']
      .forEach(txt => expect(fn(txt), txt).toBe(false));
  });

  it('bloque toujours les mots interdits en tant que mots entiers', () => {
    const api = loadGame(FILES);
    const fn = api._chatContainsBlockedWord;
    ['con', 'Con', 'connard', 'sale con', 'espèce de con !', 'CONNASSE', 'niquer', 'pd']
      .forEach(txt => expect(fn(txt), txt).toBe(true));
  });

  it('gère les accents et la casse sans casser la détection', () => {
    const api = loadGame(FILES);
    const fn = api._chatContainsBlockedWord;
    expect(fn('Bâtard')).toBe(true);
    expect(fn('Pédé')).toBe(true);
  });

  it('ignore un message vide ou sans mot interdit', () => {
    const api = loadGame(FILES);
    const fn = api._chatContainsBlockedWord;
    expect(fn('')).toBe(false);
    expect(fn('Salut, comment ça va ?')).toBe(false);
  });
});
