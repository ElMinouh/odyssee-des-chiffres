import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// Audit fonctionnel (#14/#15/#19) : avant ce fichier, aucun test ne chargeait
// 12-cloud.js — la logique de synchronisation cloud (fusion, codes) n'avait
// donc aucune couverture. On teste ici la fonction pure introduite pour le
// fix #2 (fusion non destructive), qui ne dépend d'aucun accès réseau.
const FILES = ['12-cloud.js'];

describe('_mergeCloudProfiles (#2 : fusion non destructive)', () => {
  it('fait l\'union des collections au lieu d\'écraser', () => {
    const api = loadGame(FILES);
    const local = { ownedFigurines: ['fig_a', 'fig_b'], mapBossBeaten: ['zone1'] };
    const imported = { ownedFigurines: ['fig_b', 'fig_c'], mapBossBeaten: ['zone2'] };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.ownedFigurines.sort()).toEqual(['fig_a', 'fig_b', 'fig_c']);
    expect(out.mapBossBeaten.sort()).toEqual(['zone1', 'zone2']);
  });

  it('prend le MAX des compteurs, jamais la somme', () => {
    const api = loadGame(FILES);
    const local = { xp: 400, stars: 120, sessionMinutes: 90 };
    const imported = { xp: 250, stars: 300, sessionMinutes: 40 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.xp).toBe(400);       // local gagne
    expect(out.stars).toBe(300);    // imported gagne
    expect(out.sessionMinutes).toBe(90);
  });

  it('ne perd pas une figurine rare acquise localement même si XP local < XP serveur', () => {
    // Scénario exact du problème identifié dans l'audit : l'appareil avec le
    // moins d'XP a débloqué une figurine que l'autre n'a pas.
    const api = loadGame(FILES);
    const local = { xp: 400, ownedFigurines: ['fig_rare'] };
    const imported = { xp: 420, ownedFigurines: [] };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.xp).toBe(420);
    expect(out.ownedFigurines).toContain('fig_rare');
  });

  it('fusionne levelWins par niveau avec un max, pas un écrasement', () => {
    const api = loadGame(FILES);
    const local = { levelWins: { CP: 5, CE1: 2 } };
    const imported = { levelWins: { CP: 3, CE1: 8, CE2: 1 } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.levelWins).toEqual({ CP: 5, CE1: 8, CE2: 1 });
  });

  it('fusionne zoneProgress (max stepsCompleted, completed en OU logique)', () => {
    const api = loadGame(FILES);
    const local = { zoneProgress: { plaine: { stepsCompleted: 5, completed: true } } };
    const imported = { zoneProgress: { plaine: { stepsCompleted: 2, completed: false } } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.zoneProgress.plaine).toEqual({ stepsCompleted: 5, completed: true });
  });

  it('fusionne opStats (max ok/fail par catégorie)', () => {
    const api = loadGame(FILES);
    const local = { opStats: { '+': { ok: 10, fail: 2 } } };
    const imported = { opStats: { '+': { ok: 6, fail: 5 } } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.opStats['+']).toEqual({ ok: 10, fail: 5 });
  });

  it('fusionne history par union dédupliquée, triée et tronquée à 50', () => {
    const api = loadGame(FILES);
    const local = { history: [{ timestamp: 100, score: 5, mode: 'normal' }] };
    const imported = { history: [
      { timestamp: 100, score: 5, mode: 'normal' }, // doublon exact → dédupliqué
      { timestamp: 200, score: 8, mode: 'chrono' },
    ] };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.history).toHaveLength(2);
    expect(out.history[0].timestamp).toBe(100);
    expect(out.history[1].timestamp).toBe(200);
  });

  it('conserve les champs non-collection du profil "imported" (prefs, thème...)', () => {
    const api = loadGame(FILES);
    const local = { prefs: { theme: 'dark' } };
    const imported = { prefs: { theme: 'standard' }, name: 'Léo' };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.prefs.theme).toBe('standard'); // pas de fusion sur les préférences, comportement inchangé
    expect(out.name).toBe('Léo');
  });

  it('gère un profil local vide/absent sans planter (nouvel appareil)', () => {
    const api = loadGame(FILES);
    const imported = { xp: 100, ownedFigurines: ['fig_a'] };
    const out = api._mergeCloudProfiles(null, imported);
    expect(out).toBe(imported);
  });
});

describe('isValidCloudCode', () => {
  it('accepte un code bien formé', () => {
    const api = loadGame(FILES);
    expect(api.isValidCloudCode('SOREN-7B4K9X')).toBe(true);
  });
  it('rejette un code trop court, vide ou avec des caractères invalides', () => {
    const api = loadGame(FILES);
    expect(api.isValidCloudCode('AB')).toBe(false);
    expect(api.isValidCloudCode('')).toBe(false);
    expect(api.isValidCloudCode('abc def!')).toBe(false);
    expect(api.isValidCloudCode(null)).toBe(false);
  });
});

describe('generateCloudCode', () => {
  it('produit un code au format NOM-XXXXXX, suffixe sans caractères ambigus (0/O/I/1)', () => {
    const api = loadGame(FILES);
    const code = api.generateCloudCode('Léo');
    expect(code).toMatch(/^[A-Z0-9]+-[A-Z0-9]{6}$/);
    const suffix = code.split('-')[1];
    expect(suffix).not.toMatch(/[0OI1]/);
  });
});
