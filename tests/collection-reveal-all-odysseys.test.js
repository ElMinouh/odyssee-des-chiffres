import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

const ALL_ADV_KEYS = ['prim', 'mat', 'matfr', 'primfr', 'col', 'colfr', 'primhist'];

function beatAllRegions(api, regionIds) {
  let beaten = [];
  for (const rid of regionIds) beaten = beaten.concat(api._zonesOfRegion(rid).map(z => z.id));
  return beaten;
}

describe('_COLLECTION_REVEAL — une entrée par Odyssée, chacune avec sa condition (C2)', () => {
  it('les 7 Odyssées ont bien une entrée, chacune avec flag/title/emoji/text/check', () => {
    const api = loadGame(FILES);
    for (const adv of ALL_ADV_KEYS) {
      const r = api._COLLECTION_REVEAL[adv];
      expect(r).toBeTruthy();
      expect(typeof r.flag).toBe('string');
      expect(typeof r.title).toBe('string');
      expect(typeof r.text).toBe('string');
      expect(typeof r.check).toBe('function');
    }
  });

  it('les 7 flags sont bien tous distincts (aucun risque de collision entre Odyssées)', () => {
    const api = loadGame(FILES);
    const flags = ALL_ADV_KEYS.map(a => api._COLLECTION_REVEAL[a].flag);
    expect(new Set(flags).size).toBe(7);
  });

  it('matfr/primfr/col : check() devient vrai quand les 6 régions (cp..final) sont conquises', () => {
    const api = loadGame(FILES);
    const beaten = beatAllRegions(api, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: [] });
    expect(api._COLLECTION_REVEAL.matfr.check()).toBe(true);
    expect(api._COLLECTION_REVEAL.primfr.check()).toBe(true);
    expect(api._COLLECTION_REVEAL.col.check()).toBe(true);
  });

  it('matfr/primfr/col : check() reste faux tant qu\'une région manque', () => {
    const api = loadGame(FILES);
    const beaten = beatAllRegions(api, ['cp', 'ce1', 'ce2', 'cm1']); // cm2 + final manquants
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: [] });
    expect(api._COLLECTION_REVEAL.matfr.check()).toBe(false);
    expect(api._COLLECTION_REVEAL.primfr.check()).toBe(false);
    expect(api._COLLECTION_REVEAL.col.check()).toBe(false);
  });

  it('mat : nécessite les 6 régions ET le flag epilogue "mat_epilogue" (pas l\'un sans l\'autre)', () => {
    const api = loadGame(FILES);
    const beaten = beatAllRegions(api, ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final']);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: [] }); // épilogue pas encore vu
    expect(api._COLLECTION_REVEAL.mat.check()).toBe(false);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: ['mat_epilogue'] });
    expect(api._COLLECTION_REVEAL.mat.check()).toBe(true);
  });

  it('primhist : nécessite les 5 régions (hors final) ET le flag epilogue "primhist_epilogue"', () => {
    const api = loadGame(FILES);
    const beaten = beatAllRegions(api, ['cp', 'ce1', 'ce2', 'cm1', 'cm2']);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: [] });
    expect(api._COLLECTION_REVEAL.primhist.check()).toBe(false);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: ['primhist_epilogue'] });
    expect(api._COLLECTION_REVEAL.primhist.check()).toBe(true);
  });

  it('colfr : nécessite exactement les 5 régions cp..cm2 (pas "final")', () => {
    const api = loadGame(FILES);
    const beaten = beatAllRegions(api, ['cp', 'ce1', 'ce2', 'cm1', 'cm2']);
    api.setP({ name: 'Test', mapBossBeaten: beaten, storySeen: [] });
    expect(api._COLLECTION_REVEAL.colfr.check()).toBe(true);
  });

  it('prim (Talisman) : comportement inchangé depuis ADR-92', () => {
    const api = loadGame(FILES);
    let beaten = [];
    for (const c of api._ADV_PRIM_CRYSTALS) beaten = beaten.concat(api._zonesOfRegion(c.rid).map(z => z.id));
    api.setP({ name: 'Test', mapBossBeaten: beaten });
    expect(api._COLLECTION_REVEAL.prim.check()).toBe(true);
  });
});

describe('validateProfile() — persistance des 6 nouveaux flags one-shot (C2)', () => {
  it('conserve chaque flag après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', rainbowRevealShown: true, bookRevealShown: true, badgeRevealShown: true, armorRevealShown: true, libraryRevealShown: true, histLibraryRevealShown: true };
    const out = api.validateProfile(raw, 'Test');
    expect(out.rainbowRevealShown).toBe(true);
    expect(out.bookRevealShown).toBe(true);
    expect(out.badgeRevealShown).toBe(true);
    expect(out.armorRevealShown).toBe(true);
    expect(out.libraryRevealShown).toBe(true);
    expect(out.histLibraryRevealShown).toBe(true);
  });

  it('valent false par défaut si absents', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.rainbowRevealShown).toBe(false);
    expect(out.histLibraryRevealShown).toBe(false);
  });
});
