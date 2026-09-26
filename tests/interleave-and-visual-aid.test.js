import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-024 (audit pédagogique 2026-09-26) — applyInterleaveGuard() (ADR-31,
// alternance forcée des 2 catégories les plus faibles, Rohrer & Taylor) et
// getVisualAid() (ADR-32/36, double codage) n'étaient exercés par aucun test.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js'];

describe('applyInterleaveGuard() — alterne entre les 2 catégories les plus faibles', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
  });

  it("ne modifie rien s'il y a moins de 2 catégories en vraie difficulté (ADAPT_STRUGGLE)", () => {
    api.getP().opStats = { '+': { ok: 2, fail: 8 } }; // seule catégorie faible : pas de paire
    const genFn = () => ({ opKey: '+' });
    const q = api.applyInterleaveGuard('math', genFn);
    expect(q.opKey).toBe('+');
  });

  it('force le tirage vers la catégorie cible quand 2 catégories sont simultanément faibles', () => {
    // '+' et '-' toutes deux ≤50% de réussite sur ≥8 tentatives : paire faible détectée.
    api.getP().opStats = { '+': { ok: 3, fail: 9 }, '-': { ok: 4, fail: 8 }, 'x': { ok: 9, fail: 1 } };
    let calls = 0;
    // Générateur qui boucle sur les 3 catégories pour laisser applyInterleaveGuard
    // retirer jusqu'à obtenir la catégorie cible (comportement réel : ré-appelle
    // genFn() jusqu'à INTERLEAVE_MAX_TRIES si besoin).
    const sequence = ['x', '+', '-', 'x', '+', '-'];
    const genFn = () => ({ opKey: sequence[calls++ % sequence.length] });
    const q = api.applyInterleaveGuard('math', genFn);
    expect(['+', '-']).toContain(q.opKey); // jamais 'x', la catégorie non faible
  });

  it('alterne la cible entre 2 appels successifs (pas 2 fois de suite la même)', () => {
    api.getP().opStats = { '+': { ok: 3, fail: 9 }, '-': { ok: 4, fail: 8 } };
    // Générateur qui alterne '+'/'-' à chaque appel : quelle que soit la cible
    // choisie par le guard, elle sera atteinte en 1-2 tentatives — on peut donc
    // observer directement l'alternance de _nextInterleaveTarget() via q.opKey.
    let n = 0;
    const genFn = () => ({ opKey: (n++ % 2 === 0) ? '+' : '-' });
    const q1 = api.applyInterleaveGuard('math', genFn);
    const q2 = api.applyInterleaveGuard('math', genFn);
    expect(q1.opKey).not.toBe(q2.opKey);
  });

  it("ne plante pas si genFn() renvoie null/undefined", () => {
    api.getP().opStats = { '+': { ok: 3, fail: 9 }, '-': { ok: 4, fail: 8 } };
    expect(() => api.applyInterleaveGuard('math', () => null)).not.toThrow();
  });
});

describe('getVisualAid() — double codage avec garde-fous de lisibilité', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('addition simple : renvoie une droite numérique', () => {
    const html = api.getVisualAid('math', { opKey: '+', a: 3, b: 4, type: 'normal', display: '3 + 4' });
    expect(html).toContain('<svg');
  });

  it('addition avec un écart trop grand (>20) : refuse le visuel plutôt que produire un rendu illisible', () => {
    const html = api.getVisualAid('math', { opKey: '+', a: 5, b: 30, type: 'normal', display: '5 + 30' });
    expect(html).toBeNull();
  });

  it('multiplication : renvoie un groupement de points', () => {
    const html = api.getVisualAid('math', { opKey: 'x', a: 3, b: 4, type: 'normal', display: '3 × 4' });
    expect(html).toContain('<svg');
  });

  it('multiplication avec trop de points (>48) : refuse le visuel', () => {
    const html = api.getVisualAid('math', { opKey: 'x', a: 12, b: 12, type: 'normal', display: '12 × 12' });
    expect(html).toBeNull();
  });

  it('fraction : renvoie une barre de fraction si le format du display matche', () => {
    const html = api.getVisualAid('math', { type: 'fraction', display: '3/4 de 8', res: 6 });
    expect(html).toContain('<svg');
  });

  it("histoire : jamais de visuel additionnel (déjà couvert nativement dès l'énoncé)", () => {
    const html = api.getVisualAid('hist', { opKey: 'frise', display: 'Peu importe' });
    expect(html).toBeNull();
  });

  it('ne plante jamais, même sur une question incomplète', () => {
    expect(() => api.getVisualAid('math', {})).not.toThrow();
    expect(api.getVisualAid('math', null)).toBeNull();
  });
});
