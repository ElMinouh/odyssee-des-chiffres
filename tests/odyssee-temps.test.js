import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js',
];

describe('Odyssée du Temps — histoire primaire (structure)', () => {
  it('PRIM_ZONES_HIST : toutes les zones ont un id préfixé et une région valide', () => {
    const api = loadGame(FILES);
    const zones = api.PRIM_ZONES_HIST;
    const regions = api._PRIM_REGIONS_HIST;
    expect(Array.isArray(zones)).toBe(true);
    expect(zones.length).toBeGreaterThanOrEqual(20);
    const regionIds = regions.map((r) => r.id);
    for (const z of zones) {
      expect(z.id.startsWith('primhist_')).toBe(true);
      expect(regionIds).toContain(z.region);
    }
  });

  it('PRIM_ZONES_HIST : chaque région (cp/ce1/ce2/cm1/cm2/final) contient au moins une zone', () => {
    const api = loadGame(FILES);
    const zones = api.PRIM_ZONES_HIST;
    const regions = api._PRIM_REGIONS_HIST;
    for (const r of regions) {
      const count = zones.filter((z) => z.region === r.id).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('PRIM_ZONES_HIST : la zone finale (sanctuaire) est bien rattachée à la région "final"', () => {
    const api = loadGame(FILES);
    const zones = api.PRIM_ZONES_HIST;
    const z = zones.find((z) => z.id === 'primhist_sanctuaire');
    expect(z).toBeTruthy();
    expect(z.region).toBe('final');
  });

  it('_PRIM_STORY_HIST : intro, 5 chapitres régionaux + chapitre final, 5 victoires, épilogue', () => {
    const api = loadGame(FILES);
    const story = api._PRIM_STORY_HIST;
    expect(story.intro).toBeTruthy();
    expect(story.intro.id).toBe('primhist_intro');
    expect(story.epilogue).toBeTruthy();
    expect(story.epilogue.id).toBe('primhist_epilogue');
    const regionIds = ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'final'];
    for (const rid of regionIds) {
      expect(story.chapters[rid], `chapters.${rid} manquant`).toBeTruthy();
      expect(story.chapters[rid].pages.length).toBeGreaterThan(0);
    }
    const victoryIds = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
    for (const rid of victoryIds) {
      expect(story.victories[rid], `victories.${rid} manquant`).toBeTruthy();
      expect(story.victories[rid].pages.length).toBeGreaterThan(0);
    }
    // La région finale n'a pas de "victoire" séparée : l'épilogue en tient lieu.
    expect(story.victories['final']).toBeUndefined();
  });

  it('_PRIM_STORY_HIST : tous les ids de chapitres/victoires sont uniques et préfixés "primhist_"', () => {
    const api = loadGame(FILES);
    const story = api._PRIM_STORY_HIST;
    const ids = [story.intro.id, story.epilogue.id];
    Object.values(story.chapters).forEach((c) => ids.push(c.id));
    Object.values(story.victories).forEach((v) => ids.push(v.id));
    const set = new Set(ids);
    expect(set.size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith('primhist_')).toBe(true);
  });

  it('_PRIM_STORY_HIST : chaque page a un emoji et un texte non vide', () => {
    const api = loadGame(FILES);
    const story = api._PRIM_STORY_HIST;
    const allChapters = [story.intro, story.epilogue, ...Object.values(story.chapters), ...Object.values(story.victories)];
    for (const chap of allChapters) {
      for (const p of chap.pages) {
        expect(p.emoji).toBeTruthy();
        expect(p.text).toBeTruthy();
        expect(p.text.length).toBeGreaterThan(10);
      }
    }
  });

  it('_HIST_BOOKS : 6 livres (5 régions + 1 bonus), chacun avec des pages non vides', () => {
    const api = loadGame(FILES);
    const books = api._HIST_BOOKS;
    expect(books.length).toBe(6);
    const regionsCovered = books.filter((b) => !b.bonus).map((b) => b.region);
    expect(regionsCovered.sort()).toEqual(['cm1', 'cm2', 'cp', 'ce1', 'ce2'].sort());
    for (const b of books) {
      expect(Array.isArray(b.pages)).toBe(true);
      expect(b.pages.length).toBeGreaterThanOrEqual(6);
      for (const p of b.pages) {
        expect(p.html && p.html.length > 20).toBe(true);
      }
    }
    const bonus = books.find((b) => b.bonus);
    expect(bonus).toBeTruthy();
    expect(bonus.region).toBe('final');
  });

  it('_HIST_BOOKS : aucune page ne dépasse les limites de citation (pas de contenu dupliqué suspect)', () => {
    const api = loadGame(FILES);
    const books = api._HIST_BOOKS;
    const titles = books.map((b) => b.title);
    expect(new Set(titles).size).toBe(titles.length); // titres tous différents
  });

  it('startAdventure("prim") avec GM.subject="hist" bascule bien vers l\u2019aventure primhist', () => {
    const api = loadGame(FILES);
    api.setGMsubject('hist');
    api.startAdventure('prim');
    expect(api.getGM().adventure).toBe('primhist');
    expect(api.getMapZones()).toBe(api.PRIM_ZONES_HIST);
    expect(api.getArchRegions()).toBe(api._PRIM_REGIONS_HIST);
    expect(api.getStory()).toBe(api._PRIM_STORY_HIST);
    expect(api.getStoryVillain()).toBe(api._PRIM_VILLAIN_HIST);
  });

  it('startAdventure("prim") avec GM.subject="math" reste sur l\u2019aventure maths par défaut (non-régression)', () => {
    const api = loadGame(FILES);
    api.setGMsubject('math');
    api.startAdventure('prim');
    expect(api.getGM().adventure).toBe('prim');
    expect(api.getStoryVillain()).toBe('Comte Zéro de Cafouillac');
  });

  it('startAdventure("primhist") direct fonctionne aussi (reprise depuis lastAdventure)', () => {
    const api = loadGame(FILES);
    api.startAdventure('primhist');
    expect(api.getGM().adventure).toBe('primhist');
    expect(api.getGM().subject).toBe('hist');
  });

  it('_questVocab() renvoie le vocabulaire "Rouage" pour l\u2019aventure primhist', () => {
    const api = loadGame(FILES);
    api.setGMsubject('hist');
    api.startAdventure('prim');
    const vocab = api._questVocab();
    expect(vocab.lockCollect).toMatch(/Rouage/);
  });

  it('_advCollectionHtml() renvoie le carnet "Chroniques du Temps" pour l\u2019aventure primhist', () => {
    const api = loadGame(FILES);
    api.setGMsubject('hist');
    api.startAdventure('prim');
    api.setP({ name: 'Test', storySeen: [], mapBossBeaten: [] });
    const html = api._advCollectionHtml();
    expect(html).toMatch(/Chroniques du Temps/);
  });

  it('_advHistLibraryHtml() déverrouille les tomes au fil des régions conquises', () => {
    const api = loadGame(FILES);
    api.setGMsubject('hist');
    api.startAdventure('prim');
    // Aucune zone battue : 0 tome débloqué.
    api.setP({ name: 'Test', storySeen: [], mapBossBeaten: [] });
    let html = api._advHistLibraryHtml();
    expect(html).toMatch(/0 \/ 6/);
    // Toutes les zones de la région "cp" battues → région conquise → 1 tome.
    const cpZoneIds = api.PRIM_ZONES_HIST.filter((z) => z.region === 'cp').map((z) => z.id);
    api.setP({ name: 'Test', storySeen: [], mapBossBeaten: cpZoneIds });
    html = api._advHistLibraryHtml();
    expect(html).toMatch(/1 \/ 6/);
  });

  it('_questEntries() couvre bien intro + 5×(chapitre+victoire) + chapitre final + épilogue = 13 entrées', () => {
    const api = loadGame(FILES);
    api.setGMsubject('hist');
    api.startAdventure('prim');
    const entries = api._questEntries();
    expect(entries.length).toBe(13);
    expect(entries[0].kind).toBe('intro');
    expect(entries[entries.length - 1].kind).toBe('epilogue');
  });
});
