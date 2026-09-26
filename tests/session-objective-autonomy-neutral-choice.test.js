import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-019 (audit pédagogique 2026-09-26, pt.12 de l'audit pédagogique initial,
// resté non traité depuis ADR-38) — le choix "renforcer/défier" (autonomie, SDT)
// ne s'affichait que si l'écart de réussite atteignait 25 points, retombant sur
// un message imposé le reste du temps. Seuil abaissé à 15 points + choix neutre
// (aucun jugement de performance) quand ≥2 catégories ont des données mais sans
// écart suffisant.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js'];

describe('getSessionObjectiveCandidates() — autonomie de choix élargie (06a-adaptive.js)', () => {
  it("aucune catégorie avec assez de données : pas de choix (comportement inchangé)", () => {
    const api = loadGame(FILES);
    api.setP({ opStats: { '+': { ok: 8, fail: 2 } } }); // une seule catégorie avec données
    expect(api.getSessionObjectiveCandidates('math')).toBeNull();
  });

  it("écart net (≥15 points) : choix 'renforcer/défier' comme avant", () => {
    const api = loadGame(FILES);
    api.setP({ opStats: { '+': { ok: 18, fail: 2 } /*90%*/, '-': { ok: 12, fail: 8 } /*60%*/ } }); // écart 30 points
    const cands = api.getSessionObjectiveCandidates('math');
    expect(cands).toHaveLength(2);
    expect(cands[0].id).toBe('reinforce');
    expect(cands[1].id).toBe('challenge');
  });

  it("écart entre 15 et 25 points : désormais un choix (avant : aucun, seuil était 25)", () => {
    const api = loadGame(FILES);
    api.setP({ opStats: { '+': { ok: 16, fail: 4 } /*80%*/, '-': { ok: 13, fail: 7 } /*65%*/ } }); // écart 15 points pile
    const cands = api.getSessionObjectiveCandidates('math');
    expect(cands).toHaveLength(2);
  });

  it("écart faible (<15 points) : choix neutre, sans jugement de performance", () => {
    const api = loadGame(FILES);
    api.setP({ opStats: { '+': { ok: 14, fail: 6 } /*70%*/, '-': { ok: 13, fail: 7 } /*65%*/ } }); // écart 5 points
    const cands = api.getSessionObjectiveCandidates('math');
    expect(cands).toHaveLength(2);
    expect(cands[0].id).toBe('choiceA');
    expect(cands[1].id).toBe('choiceB');
    // Aucune formulation de type "renforcer" ou "défi" (pas de jugement de performance)
    expect(cands[0].text).not.toMatch(/renforc|défi/i);
  });
});
