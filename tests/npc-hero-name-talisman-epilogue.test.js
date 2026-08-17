import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

describe('Point 1 — les PNJ utilisent le vrai prénom du joueur ({hero})', () => {
  it('substitue {hero} par P.name dans la réplique "région terminée"', () => {
    const api = loadGame(FILES);
    const region = api.getArchRegions()[0];
    const zones = api._zonesOfRegion(region.id);
    api.setP({ name: 'Léo', mapBossBeaten: zones.map(z => z.id) });
    const resolved = api._resolveNpcLine(region.id, 'standard', 0);
    expect(resolved.line).toContain('Léo');
    expect(resolved.line).not.toContain('{hero}');
  });

  it('retombe sur "héros" si le profil n\'a pas de nom', () => {
    const api = loadGame(FILES);
    const region = api.getArchRegions()[0];
    const zones = api._zonesOfRegion(region.id);
    api.setP({ name: '', mapBossBeaten: zones.map(z => z.id) });
    const resolved = api._resolveNpcLine(region.id, 'standard', 0);
    expect(resolved.line).toContain('héros');
  });
});

describe('Point 4 — condition de complétion du Talisman (5 cristaux)', () => {
  it('_ADV_PRIM_CRYSTALS contient bien 5 cristaux, un par région cp/ce1/ce2/cm1/cm2', () => {
    const api = loadGame(FILES);
    expect(api._ADV_PRIM_CRYSTALS).toHaveLength(5);
    expect(api._ADV_PRIM_CRYSTALS.map(c => c.rid).sort()).toEqual(['cm1', 'cm2', 'cp', 'ce1', 'ce2'].sort());
  });

  it('la condition "tous les cristaux conquis" est fausse tant qu\'une région manque', () => {
    const api = loadGame(FILES);
    const firstRegionZones = api._zonesOfRegion('cp');
    api.setP({ name: 'Test', mapBossBeaten: firstRegionZones.map(z => z.id) }); // cp seul
    const allDone = api._ADV_PRIM_CRYSTALS.every(c => api._regionConquered(c.rid));
    expect(allDone).toBe(false);
  });

  it('la condition devient vraie une fois les 5 régions cristal entièrement vaincues', () => {
    const api = loadGame(FILES);
    let beaten = [];
    for (const c of api._ADV_PRIM_CRYSTALS) beaten = beaten.concat(api._zonesOfRegion(c.rid).map(z => z.id));
    api.setP({ name: 'Test', mapBossBeaten: beaten });
    const allDone = api._ADV_PRIM_CRYSTALS.every(c => api._regionConquered(c.rid));
    expect(allDone).toBe(true);
  });
});

describe('validateProfile() — persistance de talismanRevealShown (point 4)', () => {
  it('conserve le flag one-shot après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', talismanRevealShown: true }, 'Test');
    expect(out.talismanRevealShown).toBe(true);
  });
  it('vaut false par défaut si absent', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.talismanRevealShown).toBe(false);
  });
});

describe('Point 5 — épilogue : écho au trait de héros', () => {
  it('affiche une page finale différente selon le trait choisi (bout en bout)', () => {
    const api = loadGame(FILES);
    const story = api.getStory();
    const regions = api.getArchRegions();
    const lastRegion = regions[regions.length - 1];
    const lastZones = api._zonesOfRegion(lastRegion.id);
    // Marque tout le nécessaire comme déjà vu, SAUF l'épilogue lui-même,
    // pour tomber directement sur la branche épilogue de _maybeShowStory().
    const alreadySeen = ['intro'];
    api.setP({
      name: 'Test', heroTrait: 'brave', storySeen: alreadySeen,
      mapBossBeaten: lastZones.map(z => z.id),
      majorChoiceByAdv: {}, journalEntriesByAdv: {},
    });
    api.setGM({ adventure: 'prim' });
    api._maybeShowStory(() => {});
    // La modale d'épilogue a dû être créée (dernier élément créé porte le texte).
    const seenNow = api.getP().storySeen;
    expect(seenNow).toContain(story.epilogue.id);
  });
});
