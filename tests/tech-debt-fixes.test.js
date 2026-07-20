import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// ─────────────────────────────────────────────────────────────
// Correctif 1 — bug de résolution de région finale pour primfr
// (dette technique section 17.5/18, ADR-22 étendue à primfr en v11.5.4)
// ─────────────────────────────────────────────────────────────
describe('Correctif région finale — PRIM_ZONES_FR (primfr)', () => {
  it('chaque zone de PRIM_ZONES_FR porte un champ region explicite valide', () => {
    const api = loadGame(FILES);
    const zones = api.PRIM_ZONES_FR;
    const regionIds = api._PRIM_REGIONS_FR.map((r) => r.id);
    expect(Array.isArray(zones)).toBe(true);
    expect(zones.length).toBeGreaterThanOrEqual(20);
    for (const z of zones) {
      expect(z.id.startsWith('primfr_')).toBe(true);
      expect(regionIds).toContain(z.region);
    }
  });

  it('la zone finale (primfr_sanctuaire) est rattachée à la région "final", pas "cm2"', () => {
    const api = loadGame(FILES);
    const z = api.PRIM_ZONES_FR.find((z) => z.id === 'primfr_sanctuaire');
    expect(z).toBeTruthy();
    expect(z.region).toBe('final');
  });

  it('_regionOfZone résout bien primfr_sanctuaire vers la région "final" (bug reproduit avant correctif)', () => {
    const api = loadGame(FILES);
    api.startAdventure('primfr');
    const zones = api.getMapZones();
    const z = zones.find((z) => z.id === 'primfr_sanctuaire');
    const region = api._regionOfZone(z);
    expect(region).toBeTruthy();
    expect(region.id).toBe('final');
    expect(region.id).not.toBe('cm2');
  });

  it('non-régression : matfr et colfr résolvent déjà correctement leur zone finale (region natif inchangé)', () => {
    const api = loadGame(FILES);
    api.startAdventure('matfr');
    let z = api.getMapZones().find((z) => z.region === 'final');
    expect(api._regionOfZone(z).id).toBe('final');
    api.startAdventure('colfr');
    z = api.getMapZones().find((z) => z.region === 'final');
    expect(api._regionOfZone(z).id).toBe('final');
  });

  it('non-régression : primhist (session précédente) résout toujours correctement sa zone finale', () => {
    const api = loadGame(FILES);
    api.startAdventure('primhist');
    const z = api.getMapZones().find((z) => z.id === 'primhist_sanctuaire');
    expect(api._regionOfZone(z).id).toBe('final');
  });
});

// ─────────────────────────────────────────────────────────────
// Correctif 2 — _advCollectionHtml() généralisé via table (dette technique 18)
// ─────────────────────────────────────────────────────────────
describe('Correctif carnet de collection — table _ADV_COLLECTION_FN', () => {
  it('la table couvre les 6 aventures connues avec le bon nom de fonction', () => {
    const api = loadGame(FILES);
    const t = api._ADV_COLLECTION_FN;
    expect(t.matfr).toBe('_advBookHtml');
    expect(t.primfr).toBe('_advBadgeHtml');
    expect(t.colfr).toBe('_advLibraryHtml');
    expect(t.mat).toBe('_advRainbowHtml');
    expect(t.col).toBe('_advArmorHtml');
    expect(t.primhist).toBe('_advHistLibraryHtml');
  });

  it('_advCollectionHtml() ne plante jamais, quelle que soit la valeur de GM.adventure', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [] });
    for (const adv of ['matfr', 'primfr', 'colfr', 'mat', 'col', 'primhist', 'prim', 'inconnu', undefined]) {
      api.setGMadventure(adv);
      expect(() => api._advCollectionHtml()).not.toThrow();
      expect(typeof api._advCollectionHtml()).toBe('string');
    }
  });
});

// ─────────────────────────────────────────────────────────────
// Correctif 3 — stats/erreurs par matière généralisées (dette technique 18)
// ─────────────────────────────────────────────────────────────
describe('Correctif stats par matière — _trackSubjCatStat / _trackSubjCatError', () => {
  it('_trackSubjCatStat incrémente P.opStatsFr[catégorie].ok pour le français', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    const before = (api.getP().opStatsFr.orth || { ok: 0 }).ok;
    api._trackSubjCatStat('fr', 'fr-orth-1', true);
    expect(api.getP().opStatsFr[api._frCatOf('fr-orth-1')].ok).toBe(before + 1);
  });

  it('_trackSubjCatStat incrémente P.opStatsHist[catégorie].fail pour l\'histoire', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    const cat = api._histCatOf('hist-frise-1');
    const before = (api.getP().opStatsHist[cat] || { fail: 0 }).fail;
    api._trackSubjCatStat('hist', 'hist-frise-1', false);
    expect(api.getP().opStatsHist[cat].fail).toBe(before + 1);
  });

  it('_trackSubjCatStat ne fait rien (ne plante pas) pour "math" ou une matière inconnue', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    expect(() => api._trackSubjCatStat('math', '+', true)).not.toThrow();
    expect(() => api._trackSubjCatStat('geo', 'x', true)).not.toThrow();
  });

  it('_trackSubjCatError journalise dans P.errorsFr et renvoie true pour le français', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    const ok = api._trackSubjCatError('fr', { display: 'Le chat <b>mange</b>.', hint: 'Réponse : mangent', res: 'mangent' });
    expect(ok).toBe(true);
    const last = api.getP().errorsFr[api.getP().errorsFr.length - 1];
    expect(last.q).toBe('Le chat mange.');
    expect(last.ok).toBe('mangent');
  });

  it('_trackSubjCatError renvoie false pour une matière non gérée (math), sans toucher P.errorsFr/errorsHist', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    const nFrBefore = api.getP().errorsFr.length;
    const nHistBefore = api.getP().errorsHist.length;
    const ok = api._trackSubjCatError('math', { display: '2+2', hint: '4', res: 4 });
    expect(ok).toBe(false);
    expect(api.getP().errorsFr.length).toBe(nFrBefore);
    expect(api.getP().errorsHist.length).toBe(nHistBefore);
  });
});

// ─────────────────────────────────────────────────────────────
// Correctif 4 — boutiques par îlot alignées sur l'environnement de chaque
// odyssée (elles gardaient toujours les noms/thèmes "maths primaire" quelle
// que soit l'aventure active)
// ─────────────────────────────────────────────────────────────
describe('Correctif boutiques par îlot — une table dédiée par aventure', () => {
  it('chaque table de boutiques couvre toutes les régions de son aventure (y compris "titan" pour col/colfr)', () => {
    const api = loadGame(FILES);
    const check = (shops, regionIds) => {
      for (const id of regionIds) expect(shops[id]).toBeTruthy();
    };
    check(api._ARCH_SHOPS_MAT, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
    check(api._ARCH_SHOPS_COL, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final', 'titan']);
    check(api._ARCH_SHOPS_MATFR, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
    check(api._ARCH_SHOPS_PRIMFR, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
    check(api._ARCH_SHOPS_COLFR, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final', 'titan']);
    check(api._ARCH_SHOPS_HIST, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
  });

  it('startAdventure() bascule bien _ARCH_SHOPS vers la table dédiée à chaque odyssée', () => {
    const api = loadGame(FILES);
    const cases = [
      ['mat', 'matfr', undefined], // ambigu seul (dépend de GM.subject) → testé séparément
      ['col', undefined, '_ARCH_SHOPS_COL'],
      ['colfr', undefined, '_ARCH_SHOPS_COLFR'],
      ['prim', undefined, '_ARCH_SHOPS_PRIM'],
      ['primfr', undefined, '_ARCH_SHOPS_PRIMFR'],
      ['primhist', undefined, '_ARCH_SHOPS_HIST'],
    ];
    for (const [advId, , tableName] of cases) {
      if (!tableName) continue;
      api.setP({ name: 'Test' });
      api.setGMsubject('math');
      api.startAdventure(advId);
      expect(api.getArchShops()).toBe(api[tableName]);
    }
    // 'mat' seul, sans matière fr : doit prendre _ARCH_SHOPS_MAT
    api.setGMsubject('math');
    api.startAdventure('mat');
    expect(api.getArchShops()).toBe(api._ARCH_SHOPS_MAT);
    // 'mat' avec matière fr active : doit basculer vers _ARCH_SHOPS_MATFR
    api.setGMsubject('fr');
    api.startAdventure('mat');
    expect(api.getArchShops()).toBe(api._ARCH_SHOPS_MATFR);
  });

  it('les noms de boutiques ne sont plus les mêmes entre deux aventures différentes pour une même région (ex. "cp")', () => {
    const api = loadGame(FILES);
    const names = new Set([
      api._ARCH_SHOPS_PRIM.cp.name,
      api._ARCH_SHOPS_MAT.cp.name,
      api._ARCH_SHOPS_COL.cp.name,
      api._ARCH_SHOPS_MATFR.cp.name,
      api._ARCH_SHOPS_PRIMFR.cp.name,
      api._ARCH_SHOPS_COLFR.cp.name,
      api._ARCH_SHOPS_HIST.cp.name,
    ]);
    // 7 aventures, 7 noms distincts attendus (aucune n'a été oubliée / recopiée telle quelle)
    expect(names.size).toBe(7);
  });
});
