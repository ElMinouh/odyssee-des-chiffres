import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

describe('Filtres "Types de questions autorisés" pour l\u2019histoire (v11.5.2)', () => {
  it('getHistCatFilters() : tout est autorisé par défaut (profil neuf, sans réglage parent)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test' }); // pas de histCatFilters défini
    const f = api.getGM ? undefined : undefined; // no-op (garde le linter tranquille)
    // getHistCatFilters n'est pas exposée directement : on la teste via _histCatAllowed.
    const q = { opKey: 'hist-perso' };
    expect(api._histCatAllowed ? api._histCatAllowed(q) : true).toBe(true);
  });

  it('_histCatAllowed() respecte un filtre désactivé pour chaque catégorie', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', histCatFilters: { frise: true, personnages: false, evenements: true, civilisation: true, temps: true, repere: true } });
    expect(api._histCatAllowed({ opKey: 'hist-perso' })).toBe(false);
    expect(api._histCatAllowed({ opKey: 'hist-frise' })).toBe(true);
    expect(api._histCatAllowed({ opKey: 'hist-vie' })).toBe(true);
  });

  it('_histCatAllowed() respecte les catégories maternelle (temps/repere) via les opKey histmat-*', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', histCatFilters: { frise: true, personnages: true, evenements: true, civilisation: true, temps: false, repere: true } });
    expect(api._histCatAllowed({ opKey: 'histmat-temps-journuit' })).toBe(false);
    expect(api._histCatAllowed({ opKey: 'histmat-repere-frise4' })).toBe(true);
  });

  it('_histUnique() rejette (renvoie null) une question dont la catégorie est désactivée par le parent', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', histCatFilters: { frise: true, personnages: false, evenements: true, civilisation: true, temps: true, repere: true } });
    const q = { display: 'Qui suis-je ?', choices: [{ val: 1, label: 'A' }, { val: 2, label: 'B' }], opKey: 'hist-perso' };
    expect(api._histUnique(q)).toBeNull();
  });

  it('genQ_HIST_CM1 (personnages désactivés) : 300 tirages, jamais la catégorie "personnages"', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', histCatFilters: { frise: true, personnages: false, evenements: true, civilisation: true, temps: true, repere: true }, yearProgress: { 'hist|CM1': 0.9 } });
    api.setGMsubject('hist');
    for (let i = 0; i < 300; i++) {
      const q = api.GEN_HIST ? api.GEN_HIST.CM1(false) : null;
      expect(q).toBeTruthy();
      expect(api._histCatOf(q.opKey)).not.toBe('personnages');
    }
  });

  it('onFilterSubjectChange() affiche le bon bloc de filtres selon la matière choisie (math/hist/fr)', () => {
    const api = loadGame(FILES);
    api._domEl('filter-subject').value = 'math';
    api.onFilterSubjectChange();
    expect(api._domEl('op-filters').classList.contains('hidden')).toBe(false);
    expect(api._domEl('hist-filters').classList.contains('hidden')).toBe(true);
    expect(api._domEl('filter-fr-note').classList.contains('hidden')).toBe(true);

    api._domEl('filter-subject').value = 'hist';
    api.onFilterSubjectChange();
    expect(api._domEl('hist-filters').classList.contains('hidden')).toBe(false);
    expect(api._domEl('op-filters').classList.contains('hidden')).toBe(true);
    expect(api._domEl('filter-fr-note').classList.contains('hidden')).toBe(true);

    api._domEl('filter-subject').value = 'fr';
    api.onFilterSubjectChange();
    expect(api._domEl('filter-fr-note').classList.contains('hidden')).toBe(false);
    expect(api._domEl('op-filters').classList.contains('hidden')).toBe(true);
    expect(api._domEl('hist-filters').classList.contains('hidden')).toBe(true);
  });

  it('loadFilterSettings() peuple bien le bloc hist-filters avec les 6 catégories', () => {
    const api = loadGame(FILES);
    api._domEl('filter-player').value = 'Zoe';
    api._ls.setItem('user_Zoe', JSON.stringify({ histCatFilters: { frise: false, personnages: true, evenements: true, civilisation: true, temps: true, repere: true } }));
    api.loadFilterSettings();
    const html = api._domEl('hist-filters').innerHTML;
    expect(html).toMatch(/histf-frise/);
    expect(html).toMatch(/histf-repere/);
    // La case "frise" doit refléter le réglage sauvegardé (décochée).
    expect(html).toMatch(/id="histf-frise"(?!\s*checked)/);
  });

  it('saveFilterSettings() enregistre bien histCatFilters dans le profil (en plus de opFilters)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Zoe' });
    api._ls.setItem('user_Zoe', JSON.stringify({}));
    api._domEl('filter-player').value = 'Zoe';
    api.loadFilterSettings(); // peuple les cases (tout coché par défaut)
    api._domEl('histf-personnages').checked = false; // simule un décochage manuel
    api.saveFilterSettings();
    const saved = JSON.parse(api._ls.getItem('user_Zoe'));
    expect(saved.histCatFilters).toBeTruthy();
    expect(saved.histCatFilters.personnages).toBe(false);
    expect(saved.histCatFilters.frise).toBe(true);
    expect(saved.opFilters).toBeTruthy(); // non-régression : toujours sauvegardé aussi
  });
});
