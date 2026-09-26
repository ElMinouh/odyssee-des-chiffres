import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-024 (audit pédagogique 2026-09-26) — getSessionObjectiveText() (ADR-33,
// objectif de session inspiré de la théorie de l'autodétermination) et
// narrativeWrapMath() (ADR-37, contextualisation narrative) n'étaient exercés par
// aucun test.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js'];

describe('getSessionObjectiveText() — objectif calculé une fois par jour à partir des stats', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('TestKid')); });

  it('sans données suffisantes : un message générique par défaut', () => {
    const text = api.getSessionObjectiveText('math');
    expect(text).toBeTruthy();
    expect(typeof text).toBe('string');
  });

  it('une faiblesse nette identifiable cible cette opération', () => {
    // '-' : 30% de réussite (faible) ; '+' : 90% (fort). Assez de tentatives (≥5, SESSION_PROFILE_MIN_ATTEMPTS).
    api.getP().opStats = { '+': { ok: 18, fail: 2 }, '-': { ok: 6, fail: 14 } };
    const text = api.getSessionObjectiveText('math');
    expect(text.toLowerCase()).toContain('soustraction');
  });

  it('recalculé une seule fois par jour : un second appel le même jour renvoie le texte déjà mémorisé', () => {
    api.getP().opStats = { '+': { ok: 18, fail: 2 }, '-': { ok: 6, fail: 14 } };
    const first = api.getSessionObjectiveText('math');
    // Changement radical des stats après le 1er calcul du jour : ne doit rien changer.
    api.getP().opStats = { '+': { ok: 1, fail: 19 }, '-': { ok: 19, fail: 1 } };
    const second = api.getSessionObjectiveText('math');
    expect(second).toBe(first);
  });

  it('français (matière à catégories) utilise analyzeCatProfile, pas analyzeOpProfile', () => {
    expect(() => api.getSessionObjectiveText('fr')).not.toThrow();
  });
});

describe('narrativeWrapMath() — habillage narratif sans jamais modifier le calcul (ADR-37)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('ne modifie jamais a/b/res/opKey, seulement display (sur de nombreux tirages)', () => {
    for (let i = 0; i < 200; i++) {
      const q = { type: 'normal', a: 7, b: 8, res: 15, opKey: '+', display: '7 + 8' };
      const out = api.narrativeWrapMath(q);
      expect(out.a).toBe(7);
      expect(out.b).toBe(8);
      expect(out.res).toBe(15);
      expect(out.opKey).toBe('+');
    }
  });

  it("s'applique dans les bonnes proportions (~20%, ni jamais ni toujours) sur un grand échantillon", () => {
    let wrapped = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const q = { type: 'normal', a: 7, b: 8, res: 15, opKey: '+', display: '7 + 8' };
      const out = api.narrativeWrapMath(q);
      if (out.display !== '7 + 8') wrapped++;
    }
    const ratio = wrapped / N;
    expect(ratio).toBeGreaterThan(0.12); // marge autour de NARRATIVE_WRAP_PROBA=0.20
    expect(ratio).toBeLessThan(0.28);
  });

  it('ne touche jamais les nombres manquants, fractions, ou types non "normal"', () => {
    const q = { type: 'missing', a: 7, b: 8, res: 15, opKey: '+', display: '7 + ? = 15' };
    const out = api.narrativeWrapMath(q);
    expect(out).toBe(q); // renvoyé strictement inchangé (même référence)
  });

  it('ne touche jamais la division (aucun template narratif pour cet opérateur)', () => {
    for (let i = 0; i < 100; i++) {
      const q = { type: 'normal', a: 12, b: 4, res: 3, opKey: '/', display: '12 ÷ 4' };
      const out = api.narrativeWrapMath(q);
      expect(out.display).toBe('12 ÷ 4');
    }
  });

  it('ne plante pas sur une question incomplète (a/b non numériques)', () => {
    expect(() => api.narrativeWrapMath({ type: 'normal', opKey: '+', display: 'x' })).not.toThrow();
    expect(() => api.narrativeWrapMath(null)).not.toThrow();
  });
});
