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
    ['temps', ['histmat-temps', 'histmat-temps-avantapres', 'histmat-temps-gener', 'histmat-temps-journuit']],
    ['repere', ['histmat-repere-seq3', 'histmat-repere-ancien', 'histmat-repere-frise4', 'histmat-repere-vraifaux']],
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

describe('GEN_HIST : générateurs maternelle (PS / MS / GS, v11.3.0)', () => {
  const FILES3 = ['01-core.js', '02-data.js', '05-profile.js', '16-francais.js', '18-histoire.js'];
  const MAT_LEVELS = ['PS', 'MS', 'GS'];

  for (const lvl of MAT_LEVELS) {
    it(`${lvl} : produit une question maternelle valide (consigne + choix + subj hist)`, () => {
      const api = loadGame(FILES3);
      api.setP({ name: 'Test' });
      const q = api.GEN_HIST[lvl](false);
      expect(q).toBeTruthy();
      expect(q.maternelle).toBe(true);
      expect(q.subj).toBe('hist');
      expect(q.consigne).toBeTruthy();
      expect(Array.isArray(q.choices)).toBe(true);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.choices.some(c => c.val === q.res)).toBe(true);
      expect(q.choices.filter(c => c.val === q.res).length).toBe(1);
    });
  }

  it('300 tirages par niveau maternelle ne plantent jamais (détecte les trous de tableau type ",,")', () => {
    const api = loadGame(FILES3);
    api.setP({ name: 'Test' });
    for (const lvl of MAT_LEVELS) {
      for (let i = 0; i < 300; i++) {
        const q = api.GEN_HIST[lvl](false);
        expect(q).toBeTruthy();
        expect(q.consigne).toBeTruthy();
        expect(q.choices.some(c => c.val === q.res)).toBe(true);
      }
    }
  });

  it('les catégories de suivi maternelle (temps / repere) sont bien atteintes sur 100 tirages', () => {
    const api = loadGame(FILES3);
    api.setP({ name: 'Test' });
    const seen = new Set();
    for (const lvl of MAT_LEVELS) {
      for (let i = 0; i < 100; i++) {
        const q = api.GEN_HIST[lvl](false);
        seen.add(api._histCatOf(q.opKey));
      }
    }
    expect(seen.has('temps')).toBe(true);
    expect(seen.has('repere')).toBe(true);
  });
});

// v11.3.1 — Régression sur un bug critique signalé par Cyril (captures d'écran) :
// la « bonne » réponse était parfois marquée sur la mauvaise case après mélange
// (val fixé avant shuffle + recherche d'index -> confusion val/position, ~1 fois sur 2).
// Ces tests vérifient la SÉMANTIQUE de la réponse, pas seulement l'absence de crash
// (le test structurel "choices.some(c => c.val === q.res)" passait déjà à 100% avec
// le bug, car il ne vérifie pas QUEL choix est marqué correct).
describe('GEN_HIST maternelle : non-régression bug val/index (v11.3.1)', () => {
  const FILES4 = ['01-core.js', '02-data.js', '05-profile.js', '16-francais.js', '18-histoire.js'];

  it('_histMatBinaryChoices : le res pointe toujours vers le contenu correct, quel que soit le mélange (500 essais)', () => {
    const api = loadGame(FILES4);
    for (let i = 0; i < 500; i++) {
      const { choices, res } = api._histMatBinaryChoices('CORRECT', 'FAUX');
      const picked = choices.find((c) => c.val === res);
      expect(picked.html).toBe('CORRECT');
    }
  });

  it('jour/nuit (PS) : la réponse correcte correspond bien à l\u2019icône affichée (400 tirages)', () => {
    const api = loadGame(FILES4);
    for (let i = 0; i < 400; i++) {
      const q = api._histMatPS_jourNuit();
      const item = api.HIST_MAT_PS_JOURNUIT.find((f) => q.visuelHtml.indexOf(f.ic) >= 0);
      expect(item).toBeTruthy();
      const expectedIcon = item.jour ? '☀️' : '🌙';
      const picked = q.choices.find((c) => c.val === q.res);
      expect(picked.html.includes(expectedIcon)).toBe(true);
    }
  });

  it('avant/après (PS) : la réponse correcte correspond bien à l\u2019objet "après" attendu (400 tirages)', () => {
    const api = loadGame(FILES4);
    for (let i = 0; i < 400; i++) {
      const q = api._histMatPS_avantApres();
      const item = api.HIST_MAT_PS_AVANTAPRES.find((f) => q.visuelHtml.indexOf(f.av) >= 0);
      expect(item).toBeTruthy();
      const picked = q.choices.find((c) => c.val === q.res);
      expect(picked.html.includes(item.ap)).toBe(true);
    }
  });
});
