import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js', '16-francais.js', '18-histoire.js'];

describe('_histCatOf : mapping opKey histoire → 4 catégories', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  const cas = [
    ['frise', ['hist-frise', 'hist-avantapres', 'hist-ordre']],
    ['personnages', ['hist-perso']],
    ['evenements', ['hist-cause', 'hist-evt']],
    ['civilisation', ['hist-vie', 'hist-vocab', '', undefined]],
  ];

  for (const [attendu, cles] of cas) {
    it(`renvoie "${attendu}" pour : ${cles.join(', ')}`, () => {
      for (const k of cles) {
        expect(api._histCatOf(k)).toBe(attendu);
      }
    });
  }
});

describe('GEN_HIST : générateurs de questions par niveau (CP → CM2)', () => {
  const FILES2 = ['01-core.js', '02-data.js', '05-profile.js', '16-francais.js', '18-histoire.js'];
  const LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];

  for (const lvl of LEVELS) {
    it(`${lvl} : produit une question QCM valide (choix + bonne réponse cohérente)`, () => {
      const api = loadGame(FILES2);
      api.setP({ name: 'Test' });
      const q = api.GEN_HIST[lvl](false);
      expect(q).toBeTruthy();
      expect(q.subj).toBe('hist');
      expect(Array.isArray(q.choices)).toBe(true);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      // La bonne réponse (q.res) doit correspondre à un des choix proposés
      expect(q.choices.some(c => c.val === q.res)).toBe(true);
      // Un seul choix marqué comme la bonne réponse
      expect(q.choices.filter(c => c.val === q.res).length).toBe(1);
    });
  }

  it('les 20 tirages successifs restent cohérents (pas de crash, anti-répétition actif)', () => {
    const api = loadGame(FILES2);
    api.setP({ name: 'Test' });
    for (let i = 0; i < 20; i++) {
      const q = api.GEN_HIST.CE2(false);
      expect(q.choices.some(c => c.val === q.res)).toBe(true);
    }
  });

  it('300 tirages par niveau ne plantent jamais (détecte les trous de tableau type ",,")', () => {
    const api = loadGame(FILES2);
    api.setP({ name: 'Test' });
    for (const lvl of LEVELS) {
      for (let i = 0; i < 300; i++) {
        const q = api.GEN_HIST[lvl](false);
        expect(q).toBeTruthy();
        expect(q.display).toBeTruthy();
        expect(q.choices.some(c => c.val === q.res)).toBe(true);
      }
    }
  });
});
