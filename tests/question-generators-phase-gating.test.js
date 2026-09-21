// AUD-02-014 (audit fonctionnel 2026-09-21) — les générateurs de calcul
// mental de base (04-questions.js) ne suivaient pas le système de phase
// (progression douce début/milieu/fin d'année, README "Progression adaptative
// (P9)") déjà appliqué aux autres modules : seule la PLAGE de nombres était
// resserrée (_ari()/_progScaleRange), jamais la VARIÉTÉ de types — un enfant
// en tout début d'année pouvait recevoir dès sa première question un type
// aussi abstrait qu'un nombre manquant. Le README exige explicitement que "la
// variété de questions en phase 1 soit inférieure à celle en phase 3" ; ces
// tests vérifient concrètement cette propriété (l'équivalent, pour ce fichier,
// du garde-fou _progSelfCheck() — structurellement inapplicable ici, voir
// ADR : 04-questions.js n'utilise pas le pattern "tableau de fonctions taguées
// .ph" des autres modules, mais des pools de chaînes construits inline).
import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js'];

function setPhase(api, level, phase) {
  // _phaseFromVal (06a-adaptive.js) : <0.34 -> 1, <0.67 -> 2, sinon 3.
  const v = phase === 1 ? 0.1 : phase === 2 ? 0.5 : 0.9;
  const p = api.getP();
  p.yearProgress = p.yearProgress || {};
  p.yearProgress[level] = v;
}

function sampleTypes(fn, n = 200) {
  const types = new Set();
  for (let i = 0; i < n; i++) {
    const q = fn();
    types.add((q.type || 'normal') + '|' + (q.opKey || ''));
  }
  return types;
}

describe('genQ_CE1() — nombre manquant réservé à partir de la phase 2', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('Test')); api.setGM({ level: 'CE1' }); });

  it('phase 1 : jamais de type "missing"', () => {
    setPhase(api, 'CE1', 1);
    const types = sampleTypes(() => api.genQ_CE1(false));
    expect([...types].some(t => t.startsWith('missing'))).toBe(false);
  });

  it('phase 3 : le type "missing" apparaît (comportement actuel inchangé)', () => {
    setPhase(api, 'CE1', 3);
    const types = sampleTypes(() => api.genQ_CE1(false));
    expect([...types].some(t => t.startsWith('missing'))).toBe(true);
  });
});

describe('genQ_CE2() — nombre manquant et tables 3/10 réservés à partir de la phase 2/3', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('Test')); api.setGM({ level: 'CE2' }); });

  it('phase 1 : jamais de "missing", jamais la table de 3 (la plus difficile des 4)', () => {
    setPhase(api, 'CE2', 1);
    let sawMissing = false; const tablesUsed = new Set();
    for (let i = 0; i < 200; i++) {
      const q = api.genQ_CE2(false);
      if (q.type === 'missing') sawMissing = true;
      if (typeof q.a === 'number') tablesUsed.add(q.a);
    }
    expect(sawMissing).toBe(false);
    expect(tablesUsed.has(3)).toBe(false);
  });

  it('phase 3 : la table de 3 devient accessible (comportement actuel inchangé)', () => {
    setPhase(api, 'CE2', 3);
    const tablesUsed = new Set();
    for (let i = 0; i < 300; i++) {
      const q = api.genQ_CE2(false);
      if (typeof q.a === 'number') tablesUsed.add(q.a);
    }
    expect(tablesUsed.has(3)).toBe(true);
  });
});

describe('genQ_CM1() — nombre manquant en phase 2, géométrie réservée à la phase 3', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('Test')); api.setGM({ level: 'CM1' }); });

  it('phase 1 : ni "missing" ni géométrie', () => {
    setPhase(api, 'CM1', 1);
    const types = sampleTypes(() => api.genQ_CM1(false));
    expect([...types].some(t => t.startsWith('missing'))).toBe(false);
    expect([...types].some(t => t.endsWith('|geo'))).toBe(false);
  });

  it('phase 2 : "missing" possible mais pas encore la géométrie', () => {
    setPhase(api, 'CM1', 2);
    const types = sampleTypes(() => api.genQ_CM1(false));
    expect([...types].some(t => t.startsWith('missing'))).toBe(true);
    expect([...types].some(t => t.endsWith('|geo'))).toBe(false);
  });

  it('phase 3 : géométrie accessible (comportement actuel inchangé)', () => {
    setPhase(api, 'CM1', 3);
    const types = sampleTypes(() => api.genQ_CM1(false));
    expect([...types].some(t => t.endsWith('|geo'))).toBe(true);
  });
});

describe('genQ_CM2() — géométrie en phase 2, fractions réservées à la phase 3', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('Test')); api.setGM({ level: 'CM2' }); });

  it('phase 1 : ni géométrie ni fractions', () => {
    setPhase(api, 'CM2', 1);
    const types = sampleTypes(() => api.genQ_CM2(false));
    expect([...types].some(t => t.endsWith('|geo'))).toBe(false);
    expect([...types].some(t => t.startsWith('fraction'))).toBe(false);
  });

  it('phase 2 : géométrie possible, pas encore les fractions', () => {
    setPhase(api, 'CM2', 2);
    const types = sampleTypes(() => api.genQ_CM2(false));
    expect([...types].some(t => t.endsWith('|geo'))).toBe(true);
    expect([...types].some(t => t.startsWith('fraction'))).toBe(false);
  });

  it('phase 3 : fractions accessibles (comportement actuel inchangé)', () => {
    setPhase(api, 'CM2', 3);
    const types = sampleTypes(() => api.genQ_CM2(false));
    expect([...types].some(t => t.startsWith('fraction'))).toBe(true);
  });
});

describe('Non-régression : le combat de boss reste inchangé par ce lot (pool toujours varié dès le début)', () => {
  it('genQ_CE1(boss=true) en phase 1 propose toujours le nombre manquant (comportement boss non touché)', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api.setGM({ level: 'CE1' });
    setPhase(api, 'CE1', 1);
    const types = sampleTypes(() => api.genQ_CE1(true));
    expect([...types].some(t => t.startsWith('missing'))).toBe(true);
  });
});
