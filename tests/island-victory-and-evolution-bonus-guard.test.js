import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.15 — Bug signalé par Cyril (300 figurines / 500⭐ restantes après
// seulement une demi-Odyssée) : le bonus "Conquérant" (+50⭐), donné à la
// conquête d'un îlot, n'avait AUCUNE protection contre la répétition —
// contrairement au bonus de fin d'Odyssée (_epilogueBonusCredited). Il se
// recréditait à chaque partie terminée dans un îlot déjà entièrement
// conquis, y compris en rejouant une zone déjà terminée (fonctionnalité
// explicitement proposée au joueur).
const CINEMATICS_FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-story.js',
];

describe('playIslandVictory() — bonus "Conquérant" crédité une seule fois par îlot (06d-cinematics.js)', () => {
  it('un premier appel crédite +50⭐, un second appel sur le MÊME îlot ne recrédite rien', () => {
    const api = loadGame(CINEMATICS_FILES);
    api.setP(api.defProfile('TestKid'));
    api.startAdventure('prim', true); // charge MAP_ZONES/_ARCH_REGIONS du primaire sans ouvrir la carte
    const regions = api.getArchRegions();
    const regionId = regions[0].id; // 1re région (ex. 'cp')
    const before = api.getP().stars || 0;

    api.playIslandVictory(regionId, () => {});
    expect(api.getP().stars).toBe(before + 50);

    // Rejouer une zone déjà terminée dans cet îlot déjà conquis appelle à
    // nouveau playIslandVictory() avec le même regionId (c'est exactement le
    // chemin emprunté par le bug) — aucun second crédit ne doit avoir lieu.
    api.playIslandVictory(regionId, () => {});
    expect(api.getP().stars).toBe(before + 50);

    // Un 3e, 4e... appel non plus (répétable à l'infini avant correctif).
    api.playIslandVictory(regionId, () => {});
    api.playIslandVictory(regionId, () => {});
    expect(api.getP().stars).toBe(before + 50);
  });

  it('le callback "done" est bien appelé même quand l\'îlot était déjà crédité (la chaîne narrative ne doit pas se bloquer)', () => {
    const api = loadGame(CINEMATICS_FILES);
    api.setP(api.defProfile('TestKid'));
    api.startAdventure('prim', true);
    const regionId = api.getArchRegions()[0].id;

    api.playIslandVictory(regionId, () => {});
    let calledAgain = false;
    api.playIslandVictory(regionId, () => { calledAgain = true; });
    expect(calledAgain).toBe(true);
  });

  it('deux îlots différents sont crédités indépendamment (+50⭐ chacun)', () => {
    const api = loadGame(CINEMATICS_FILES);
    api.setP(api.defProfile('TestKid'));
    api.startAdventure('prim', true);
    const regions = api.getArchRegions();
    const before = api.getP().stars || 0;

    api.playIslandVictory(regions[0].id, () => {});
    api.playIslandVictory(regions[1].id, () => {});
    expect(api.getP().stars).toBe(before + 100);
  });

  it('le même regionId ("cp") sur DEUX Odyssées différentes se crédite bien 2 fois (champ par Odyssée)', () => {
    const api = loadGame(CINEMATICS_FILES);
    api.setP(api.defProfile('TestKid'));
    const before = api.getP().stars || 0;

    api.startAdventure('prim', true);
    api.playIslandVictory('cp', () => {});
    api.startAdventure('col', true);
    api.playIslandVictory('cp', () => {});

    expect(api.getP().stars).toBe(before + 100);
    expect(api.getP().islandVictoryCreditedByAdv.prim).toContain('cp');
    expect(api.getP().islandVictoryCreditedByAdv.col).toContain('cp');
  });
});

// v12.7.15 — Même classe de bug pour le bonus d'évolution de héros (déjà en
// partie neutralisé par le correctif v12.7.14 de persistance de heroStageId,
// mais durci ici en profondeur avec sa propre protection dédiée).
describe('_mergeCloudProfiles() — nouveaux champs anti-répétition (12-cloud.js)', () => {
  it('islandVictoryCreditedByAdv : union par advKey, jamais de recrédit possible après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { islandVictoryCreditedByAdv: { prim: ['cp'] }, adventureResetAt: 0 };
    const imported = { islandVictoryCreditedByAdv: { prim: ['ce1'], col: ['cp'] }, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.islandVictoryCreditedByAdv.prim.sort()).toEqual(['cp', 'ce1'].sort());
    expect(out.islandVictoryCreditedByAdv.col).toEqual(['cp']);
  });

  it('islandVictoryCreditedByAdv : reset local plus récent repart bien de la valeur locale', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { islandVictoryCreditedByAdv: {}, adventureResetAt: 9000 };
    const imported = { islandVictoryCreditedByAdv: { prim: ['cp', 'ce1', 'ce2'] }, adventureResetAt: 1000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.islandVictoryCreditedByAdv).toEqual({});
  });

  it('heroStageRewardsCredited : union simple, jamais de recrédit possible après fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { heroStageRewardsCredited: ['oeuf', 'apprenti'], adventureResetAt: 0 };
    const imported = { heroStageRewardsCredited: ['aventurier'], adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.heroStageRewardsCredited.sort()).toEqual(['aventurier', 'apprenti', 'oeuf'].sort());
  });
});

describe('validateProfile() — persistance des nouveaux champs anti-répétition (05-profile.js, ADR-111 pt.3)', () => {
  const FILES = ['05-profile.js'];

  it('conserve islandVictoryCreditedByAdv après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'TestKid', islandVictoryCreditedByAdv: { prim: ['cp', 'ce1'] } };
    const out = api.validateProfile(raw, 'TestKid');
    expect(out.islandVictoryCreditedByAdv).toEqual({ prim: ['cp', 'ce1'] });
  });

  it('conserve heroStageRewardsCredited après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'TestKid', heroStageRewardsCredited: ['oeuf', 'apprenti'] };
    const out = api.validateProfile(raw, 'TestKid');
    expect(out.heroStageRewardsCredited).toEqual(['oeuf', 'apprenti']);
  });

  it('valeurs par défaut correctes si absentes du profil brut', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'TestKid' }, 'TestKid');
    expect(out.islandVictoryCreditedByAdv).toEqual({});
    expect(out.heroStageRewardsCredited).toEqual([]);
  });
});

describe('resetAdventure() — islandVictoryCreditedByAdv repart à zéro avec les 7 aventures (10-figurines.js)', () => {
  it('un îlot déjà crédité avant reset n\'est plus bloqué après (source lue directement, sans DOM)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '10-figurines.js'), 'utf8');
    const fnStart = src.indexOf('function resetAdventure');
    const fnEnd = src.indexOf('\n}', src.indexOf('localStorage.setItem', fnStart));
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('data.islandVictoryCreditedByAdv = {}');
  });
});
