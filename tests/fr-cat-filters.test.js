import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

describe('Filtres "Types de questions autorisés" pour le français (v11.5.3)', () => {
  it('_frCatAllowed() respecte un filtre désactivé pour chaque catégorie', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', frCatFilters: { conj: false, orth: true, gram: true, vocab: true } });
    expect(api._frCatAllowed({ opKey: 'fr-conj' })).toBe(false);
    expect(api._frCatAllowed({ opKey: 'fr-orth' })).toBe(true);
  });

  it('_frUnique() rejette une question dont la catégorie est désactivée par le parent', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', frCatFilters: { conj: false, orth: true, gram: true, vocab: true } });
    const q = { display: 'Conjugue le verbe être', choices: [], opKey: 'fr-conj' };
    expect(api._frUnique(q)).toBeNull();
  });

  it('genFR_CE2 (conjugaison désactivée) : 300 tirages, jamais la catégorie "conj"', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', frCatFilters: { conj: false, orth: true, gram: true, vocab: true }, yearProgress: { 'fr|CE2': 0.9 } });
    api.setGMsubject('fr');
    for (let i = 0; i < 300; i++) {
      const q = api.GEN_FR ? api.GEN_FR.CE2(false) : null;
      expect(q).toBeTruthy();
      expect(api._frCatOf(q.opKey)).not.toBe('conj');
    }
  });

  it('onFilterSubjectChange("fr") affiche bien le bloc fr-filters (plus de note "arrivera prochainement")', () => {
    const api = loadGame(FILES);
    api._domEl('filter-subject').value = 'fr';
    api.onFilterSubjectChange();
    expect(api._domEl('fr-filters').classList.contains('hidden')).toBe(false);
  });

  it('loadFilterSettings()/saveFilterSettings() peuplent et sauvegardent bien frCatFilters', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Zoe' });
    api._ls.setItem('user_Zoe', JSON.stringify({}));
    api._domEl('filter-player').value = 'Zoe';
    api.loadFilterSettings();
    expect(api._domEl('fr-filters').innerHTML).toMatch(/frf-conj/);
    api._domEl('frf-gram').checked = false;
    api.saveFilterSettings();
    const saved = JSON.parse(api._ls.getItem('user_Zoe'));
    expect(saved.frCatFilters.gram).toBe(false);
    expect(saved.frCatFilters.conj).toBe(true);
  });
});

describe('Devoir du jour : vraies catégories pour fr/hist (v11.5.3)', () => {
  it('_matchesHomework() : devoir de français "conj" ne compte que les questions de conjugaison', () => {
    const api = loadGame(FILES);
    const gm = api.getGM();
    gm.homework = true;
    gm.homeworkConfig = { subject: 'fr', type: 'conj' };
    expect(api._matchesHomework({ opKey: 'fr-conj' })).toBe(true);
    expect(api._matchesHomework({ opKey: 'fr-orth' })).toBe(false);
  });

  it('_matchesHomework() : devoir d\u2019histoire "frise" ne compte que les questions de frise', () => {
    const api = loadGame(FILES);
    const gm = api.getGM();
    gm.homework = true;
    gm.homeworkConfig = { subject: 'hist', type: 'frise' };
    expect(api._matchesHomework({ opKey: 'hist-frise' })).toBe(true);
    expect(api._matchesHomework({ opKey: 'hist-perso' })).toBe(false);
  });

  it('_matchesHomework() : type "any" compte toujours, quelle que soit la matière', () => {
    const api = loadGame(FILES);
    const gm = api.getGM();
    gm.homework = true;
    gm.homeworkConfig = { subject: 'hist', type: 'any' };
    expect(api._matchesHomework({ opKey: 'hist-perso' })).toBe(true);
  });

  it('_matchesHomework() : non-régression maths (add/sub/mult/div/tables toujours corrects)', () => {
    const api = loadGame(FILES);
    const gm = api.getGM();
    gm.homework = true;
    gm.homeworkConfig = { subject: 'math', type: 'mult' };
    expect(api._matchesHomework({ opKey: 'x' })).toBe(true);
    expect(api._matchesHomework({ opKey: '+' })).toBe(false);
  });
});
