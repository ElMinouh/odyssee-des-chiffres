import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

const ZONE = { id: 'test_zone', label: 'Zone Test', theme: 'volcan', boss: '🌋', bossName: 'Le Golem de Feu' };

describe('_pickJournalEntry() — combinatoire lieu × issue (N4)', () => {
  it('choisit le palier "sans faute" quand errCount = 0', () => {
    const api = loadGame(FILES);
    const entry = api._pickJournalEntry(ZONE, 0);
    expect(entry.flawless).toBe(true);
    expect(entry.text).toContain('Le Golem de Feu');
    expect(entry.bossName).toBe('Le Golem de Feu');
  });

  it('choisit un palier "difficile" quand errCount >= 3', () => {
    const api = loadGame(FILES);
    const entry = api._pickJournalEntry(ZONE, 5);
    expect(entry.flawless).toBe(false);
  });

  it('génère une bonne variété de textes distincts sur 40 tirages (jamais toujours le même)', () => {
    const api = loadGame(FILES);
    const texts = new Set();
    for (let i = 0; i < 40; i++) texts.add(api._pickJournalEntry(ZONE, 0).text);
    // 3 ouvreurs × 4 issues = 12 combinaisons possibles pour ce thème+palier —
    // sur 40 tirages, on doit en voir une bonne partie, pas 1 ou 2.
    expect(texts.size).toBeGreaterThanOrEqual(6);
  });

  it('retombe sur le thème "standard" si le thème de la zone est inconnu', () => {
    const api = loadGame(FILES);
    const entry = api._pickJournalEntry({ ...ZONE, theme: 'inexistant' }, 0);
    expect(typeof entry.text).toBe('string');
    expect(entry.text.length).toBeGreaterThan(0);
  });
});

describe('_pickCallbackLine() — callback de chapitre référençant la dernière performance (N3)', () => {
  it('renvoie null si aucune zone n\'a encore été conquise (1er chapitre)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', journalEntriesByAdv: {} });
    api.setGM({ adventure: 'prim' });
    expect(api._pickCallbackLine()).toBe(null);
  });

  it('référence le boss réel de la dernière entrée du journal', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', journalEntriesByAdv: { prim: [{ text: 'x', flawless: true, bossName: 'Le Golem de Feu', zoneLabel: 'Zone Test' }] } });
    api.setGM({ adventure: 'prim' });
    const line = api._pickCallbackLine();
    expect(line).toContain('Le Golem de Feu');
  });
});

// Note : pas de test bout-en-bout via endGame() ici — cette fonction a de
// nombreux effets de bord DOM sans rapport avec N4 (bouton retour module,
// XP, milestones...) qui la rendent trop fragile à instrumenter pour un test
// unitaire isolé. La logique réelle de génération (_pickJournalEntry, testée
// ci-dessus) est identique à ce qu'endGame() appelle — vérifié par relecture
// du code (07-game.js, bloc juste après P.mapBossBeaten.push).

describe('validateProfile() — persistance de journalEntriesByAdv (N4)', () => {
  it('conserve une entrée bien formée après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', journalEntriesByAdv: { prim: [{ text: 'Une aventure.', flawless: true, bossName: 'Le Golem', zoneLabel: 'Zone Test' }] } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.journalEntriesByAdv.prim).toHaveLength(1);
    expect(out.journalEntriesByAdv.prim[0].text).toBe('Une aventure.');
  });

  it('ignore les entrées malformées sans planter', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', journalEntriesByAdv: { prim: [null, 42, { noText: true }, { text: 'OK celle-ci' }] } };
    expect(() => api.validateProfile(raw, 'Test')).not.toThrow();
    const out = api.validateProfile(raw, 'Test');
    expect(out.journalEntriesByAdv.prim).toHaveLength(1);
    expect(out.journalEntriesByAdv.prim[0].text).toBe('OK celle-ci');
  });

  it('plafonne à 20 entrées par Odyssée', () => {
    const api = loadGame(FILES);
    const many = Array.from({ length: 30 }, (_, i) => ({ text: `Entrée ${i}` }));
    const raw = { name: 'Test', journalEntriesByAdv: { prim: many } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.journalEntriesByAdv.prim).toHaveLength(20);
  });
});

describe('_advlogJournalHtml() — carnet de voyage affiché (N4)', () => {
  it('affiche les entrées les plus récentes en premier', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [], journalEntriesByAdv: { prim: [{ text: 'Premier fragment.' }, { text: 'Dernier fragment.' }] } });
    api.setGM({ adventure: 'prim' });
    const { html } = api._advlogJournalHtml();
    expect(html).toContain('Mon carnet de voyage');
    expect(html).toContain('Dernier fragment.');
    expect(html.indexOf('Dernier fragment.')).toBeLessThan(html.indexOf('Premier fragment.'));
  });

  it('n\'affiche pas la section si aucune entrée pour l\'Odyssée en cours', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [], journalEntriesByAdv: {} });
    api.setGM({ adventure: 'prim' });
    const { html } = api._advlogJournalHtml();
    expect(html).not.toContain('Mon carnet de voyage');
  });
});
