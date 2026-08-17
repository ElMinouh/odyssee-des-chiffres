import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['12-cloud.js'];

// Garde-fou de non-régression pour ADR-97 (Option B) : la fusion cloud doit
// respecter un reset d'Odyssée explicite (adventureResetAt) au lieu de le
// réparer silencieusement par union/max avec une progression plus ancienne
// — c'est le bug exact signalé par Cyril (reset non propagé aux autres
// appareils).
describe('_mergeCloudProfiles() — respecte un reset d\'Odyssée explicite (ADR-97)', () => {
  it('scénario exact du bug : local (ancien, jamais reseté) importe un profil cloud fraîchement reseté → le reset gagne, pas d\'union', () => {
    const api = loadGame(FILES);
    const local = {
      // Appareil B : ancienne progression, n'a jamais fait de reset lui-même.
      mapBossBeaten: ['plaine', 'village', 'prairie'],
      zoneProgress: { plaine: { stepsCompleted: 5, completed: true } },
      storySeen: ['prim_intro', 'prim_ch1'],
      adventureResetAt: 0,
    };
    const imported = {
      // Appareil A : vient de reset, a poussé vers le cloud (ADR-97).
      mapBossBeaten: [],
      zoneProgress: {},
      storySeen: [],
      adventureResetAt: 5000,
    };
    const out = api._mergeCloudProfiles(local, imported);
    // AVANT ADR-97 : mapBossBeaten aurait été l'union → les 3 zones seraient
    // revenues malgré le reset. APRÈS : le reset (imported) gagne.
    expect(out.mapBossBeaten).toEqual([]);
    expect(out.zoneProgress).toEqual({});
    expect(out.storySeen).toEqual([]);
    expect(out.adventureResetAt).toBe(5000);
  });

  it('sens inverse : local a reseté plus récemment que ce que le cloud connaît → le reset local gagne', () => {
    const api = loadGame(FILES);
    const local = {
      mapBossBeaten: [],
      zoneProgress: {},
      journalEntriesByAdv: {},
      talismanRevealShown: false,
      adventureResetAt: 9000,
    };
    const imported = {
      // Cloud encore ancien (n'a pas reçu le push du reset avant ce sync).
      mapBossBeaten: ['plaine', 'village'],
      zoneProgress: { plaine: { stepsCompleted: 5, completed: true } },
      journalEntriesByAdv: { prim: [{ text: 'Une vieille entrée.' }] },
      talismanRevealShown: true,
      adventureResetAt: 1000,
    };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapBossBeaten).toEqual([]);
    expect(out.zoneProgress).toEqual({});
    expect(out.journalEntriesByAdv).toEqual({});
    expect(out.talismanRevealShown).toBe(false);
    expect(out.adventureResetAt).toBe(9000);
  });

  it('aucun reset des deux côtés (adventureResetAt absent) : comportement historique inchangé (union/max)', () => {
    const api = loadGame(FILES);
    const local = { mapBossBeaten: ['zone1'], zoneProgress: { zone1: { stepsCompleted: 3, completed: false } } };
    const imported = { mapBossBeaten: ['zone2'], zoneProgress: { zone1: { stepsCompleted: 5, completed: true } } };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapBossBeaten.sort()).toEqual(['zone1', 'zone2']);
    expect(out.zoneProgress.zone1).toEqual({ stepsCompleted: 5, completed: true });
    expect(out.adventureResetAt).toBe(0);
  });

  it('reset égal des deux côtés (même horodatage) : retombe sur le comportement historique (aucun côté ne "gagne")', () => {
    const api = loadGame(FILES);
    const local = { mapBossBeaten: ['zone1'], adventureResetAt: 4000 };
    const imported = { mapBossBeaten: ['zone2'], adventureResetAt: 4000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapBossBeaten.sort()).toEqual(['zone1', 'zone2']); // union, comme avant
  });

  it('xp/stars restent toujours au max, jamais affectés par le reset (contrat "étoiles/XP conservés")', () => {
    const api = loadGame(FILES);
    const local = { xp: 500, stars: 120, adventureResetAt: 9000 };
    const imported = { xp: 300, stars: 80, adventureResetAt: 1000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.xp).toBe(500);
    expect(out.stars).toBe(120);
  });

  it('tous les champs de collection/révélation narrative basculent ensemble avec le reset gagnant', () => {
    const api = loadGame(FILES);
    const local = {
      mapAvatarZoneByAdv: {}, majorChoiceByAdv: {}, lastTwistLineByAdv: {},
      rainbowRevealShown: false, armorRevealShown: false,
      adventureResetAt: 5000,
    };
    const imported = {
      mapAvatarZoneByAdv: { prim: 'foret' }, majorChoiceByAdv: { prim: { 0: 'A' } },
      lastTwistLineByAdv: { prim: 'Un vieux rebondissement.' },
      rainbowRevealShown: true, armorRevealShown: true,
      adventureResetAt: 1000,
    };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.mapAvatarZoneByAdv).toEqual({});
    expect(out.majorChoiceByAdv).toEqual({});
    expect(out.lastTwistLineByAdv).toEqual({});
    expect(out.rainbowRevealShown).toBe(false);
    expect(out.armorRevealShown).toBe(false);
  });
});

describe('validateProfile() — persistance de adventureResetAt (ADR-97)', () => {
  it('conserve une valeur raisonnable', () => {
    const api = loadGame(['01-core.js', '05-profile.js']);
    const out = api.validateProfile({ name: 'Test', adventureResetAt: 123456 }, 'Test');
    expect(out.adventureResetAt).toBe(123456);
  });
  it('plafonne une valeur aberrante dans le futur lointain à la borne autorisée', () => {
    const api = loadGame(['01-core.js', '05-profile.js']);
    const farFuture = Date.now() + 999999999999;
    const out = api.validateProfile({ name: 'Test', adventureResetAt: farFuture }, 'Test');
    expect(out.adventureResetAt).toBeLessThan(farFuture);
    expect(out.adventureResetAt).toBeLessThanOrEqual(Date.now() + 86400000 + 1000); // marge de quelques ms d'exécution
  });
  it('vaut 0 par défaut si absent', () => {
    const api = loadGame(['01-core.js', '05-profile.js']);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.adventureResetAt).toBe(0);
  });
});
