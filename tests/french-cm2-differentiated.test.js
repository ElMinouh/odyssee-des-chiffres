// AUD-02-016 (audit fonctionnel 2026-09-21) — GEN_FR.CM2 pointait vers
// genFR_CM1 : un enfant de CM2 recevait exactement le même contenu de
// français qu'un enfant de CM1, sans aucune notion propre au programme CM2.
// genFR_CM2() est désormais un générateur dédié, phase-gaté : discours
// direct/indirect (contenu nouveau, FR_DISCOURS) et phrase simple/complexe
// (FR6_PHRASE, réutilisée depuis la 6e comme première exposition) à partir de
// la phase 2 ; fonctions sujet/COD/CC (FR6_FONC) réservées à la phase 3.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '16-francais.js'];

function setPhase(api, level, phase) {
  const v = phase === 1 ? 0.1 : phase === 2 ? 0.5 : 0.9;
  const p = api.getP();
  p.yearProgress = p.yearProgress || {};
  p.yearProgress[level] = v;
}

function sampleOpKeys(fn, n = 300) {
  const keys = new Set();
  for (let i = 0; i < n; i++) keys.add(fn().opKey);
  return keys;
}

describe('GEN_FR.CM2 n\'est plus le même générateur que CM1', () => {
  it('genFR_CM2 et genFR_CM1 sont deux fonctions distinctes', () => {
    const api = loadGame(FILES);
    expect(api.GEN_FR.CM2).not.toBe(api.GEN_FR.CM1);
    expect(typeof api.genFR_CM2).toBe('function');
  });
});

describe('FR_DISCOURS — les 8 phrases discours direct/indirect', () => {
  it('contient exactement 8 entrées, chacune avec ok cohérent (direct/indirect) et bad complémentaire', () => {
    const api = loadGame(FILES);
    expect(api.FR_DISCOURS).toHaveLength(8);
    api.FR_DISCOURS.forEach(d => {
      expect(['direct', 'indirect']).toContain(d.ok);
      expect(d.bad).toEqual([d.ok === 'direct' ? 'indirect' : 'direct']);
      expect(typeof d.rule).toBe('string');
      expect(d.rule.length).toBeGreaterThan(0);
    });
  });

  it('4 phrases "direct" (avec guillemets) et 4 "indirect" (sans guillemets)', () => {
    const api = loadGame(FILES);
    const direct = api.FR_DISCOURS.filter(d => d.ok === 'direct');
    const indirect = api.FR_DISCOURS.filter(d => d.ok === 'indirect');
    expect(direct).toHaveLength(4);
    expect(indirect).toHaveLength(4);
    direct.forEach(d => expect(d.ph).toContain('«'));
    indirect.forEach(d => expect(d.ph).not.toContain('«'));
  });
});

describe('genFR_CM2() — phase-gating', () => {
  it('phase 1 : ni discours direct/indirect, ni phrase simple/complexe, ni fonctions', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api.setGM({ level: 'CM2' });
    setPhase(api, 'CM2', 1);
    const keys = sampleOpKeys(() => api.genFR_CM2(false));
    expect(keys.has('fr-discours')).toBe(false);
    expect(keys.has('fr6-phrase')).toBe(false);
    expect(keys.has('fr6-fonc')).toBe(false);
  });

  it('phase 2 : discours direct/indirect et phrase simple/complexe apparaissent, pas encore les fonctions', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api.setGM({ level: 'CM2' });
    setPhase(api, 'CM2', 2);
    const keys = sampleOpKeys(() => api.genFR_CM2(false));
    expect(keys.has('fr-discours')).toBe(true);
    expect(keys.has('fr6-phrase')).toBe(true);
    expect(keys.has('fr6-fonc')).toBe(false);
  });

  it('phase 3 : les fonctions sujet/COD/CC apparaissent aussi', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api.setGM({ level: 'CM2' });
    setPhase(api, 'CM2', 3);
    const keys = sampleOpKeys(() => api.genFR_CM2(false));
    expect(keys.has('fr6-fonc')).toBe(true);
    expect(keys.has('fr-discours')).toBe(true);
  });
});

describe('Non-régression : CM1 reste inchangé par ce lot', () => {
  it('genFR_CM1() ne propose jamais discours/phrase6/fonc6 (contenu CM2 n\'a pas fuité vers CM1)', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api.setGM({ level: 'CM1' });
    setPhase(api, 'CM1', 3);
    const keys = sampleOpKeys(() => api.genFR_CM1(false));
    expect(keys.has('fr-discours')).toBe(false);
    expect(keys.has('fr6-phrase')).toBe(false);
    expect(keys.has('fr6-fonc')).toBe(false);
  });
});
