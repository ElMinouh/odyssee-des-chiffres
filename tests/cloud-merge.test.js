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
    const local = { xp: 400, sessionMinutes: 90 };
    const imported = { xp: 250, sessionMinutes: 40 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.xp).toBe(400);       // local gagne
    expect(out.sessionMinutes).toBe(90);
  });

  // v12.7.21 (bug critique corrigé, signalé par Cyril) : stars N'EST PLUS
  // fusionné par un simple max — un simple max ramenait le solde à son
  // maximum historique après chaque achat suivi d'une resynchronisation
  // (achat + fermeture + réouverture du jeu = étoiles remboursées à
  // l'infini, figurine gardée). stars est désormais DÉRIVÉ de deux
  // compteurs qui ne font qu'augmenter (_totalStarsEarned − _totalStarsSpent),
  // chacun fusionné par un max en toute sécurité.
  it('stars est dérivé de _totalStarsEarned − _totalStarsSpent, pas fusionné directement', () => {
    const api = loadGame(FILES);
    const local = { _totalStarsEarned: 400, _totalStarsSpent: 300 }; // solde local : 100
    const imported = { _totalStarsEarned: 250, _totalStarsSpent: 0 }; // solde serveur (avant achat) : 250
    const out = api._mergeCloudProfiles(local, imported);
    expect(out._totalStarsEarned).toBe(400); // max des deux
    expect(out._totalStarsSpent).toBe(300);  // max des deux
    expect(out.stars).toBe(100);             // 400 − 300, PAS max(100, 250)
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

// v12.4.67 : correctif d'une régression signalée par Cyril — avant ce lot,
// storySeen/mapAvatarZoneByAdv (et les autres champs de ODYSSEY_PROGRESS_FIELDS)
// prenaient TOUJOURS la valeur "imported" (serveur) en fusion normale (aucun
// reset en jeu), au lieu d'être fusionnés comme le reste (union / max /
// préférence locale). Comme pushProfileToCloud() fait un pull+fusion avant
// CHAQUE synchronisation (déclenchée après chaque partie), un contenu narratif
// tout juste vu localement — ou un déplacement d'avatar tout juste fait —
// pouvait être silencieusement effacé par un serveur pas encore à jour.
describe('_mergeCloudProfiles (v12.4.67 : plus de perte de progression narrative en fusion normale)', () => {
  it('fait l\'union de storySeen au lieu de ne garder que le côté importé', () => {
    const api = loadGame(FILES);
    const local = { storySeen: ['intro', 'chap_cp'] };       // vient de voir chap_cp localement
    const imported = { storySeen: ['intro'] };                // le serveur ne l'a pas encore
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.storySeen.sort()).toEqual(['chap_cp', 'intro']);
  });

  it('garde la position d\'avatar LOCALE (l\'appareil qui joue maintenant) plutôt que celle, plus ancienne, du serveur', () => {
    const api = loadGame(FILES);
    const local = { mapAvatarZoneByAdv: { prim: 'foret' } };      // vient de bouger localement
    const imported = { mapAvatarZoneByAdv: { prim: 'plaine' } };  // le serveur n'a pas encore ce déplacement
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapAvatarZoneByAdv.prim).toBe('foret');
  });

  it('fait l\'union de mapAvatarZoneByAdv entre Odyssées différentes (une par appareil, par ex.)', () => {
    const api = loadGame(FILES);
    const local = { mapAvatarZoneByAdv: { prim: 'foret' } };
    const imported = { mapAvatarZoneByAdv: { col: 'sideris_1' } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapAvatarZoneByAdv).toEqual({ prim: 'foret', col: 'sideris_1' });
  });

  it('fait l\'union de _epilogueBonusCredited (jamais de perte, jamais de double-crédit)', () => {
    const api = loadGame(FILES);
    const local = { _epilogueBonusCredited: ['epilogue_prim'] };
    const imported = { _epilogueBonusCredited: [] };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out._epilogueBonusCredited).toEqual(['epilogue_prim']);
  });

  it('fait un OR logique sur les flags de révélation (talismanRevealShown, etc.)', () => {
    const api = loadGame(FILES);
    const local = { talismanRevealShown: true };
    const imported = { talismanRevealShown: false };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.talismanRevealShown).toBe(true);
  });

  it('un reset local plus récent reprend le comportement précédent (priorité totale au local, pas de fusion)', () => {
    const api = loadGame(FILES);
    const local = { adventureResetAt: 2000, storySeen: [], mapAvatarZoneByAdv: {} };
    const imported = { adventureResetAt: 1000, storySeen: ['intro', 'chap_cp'], mapAvatarZoneByAdv: { prim: 'foret' } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.storySeen).toEqual([]);
    expect(out.mapAvatarZoneByAdv).toEqual({});
  });
});
