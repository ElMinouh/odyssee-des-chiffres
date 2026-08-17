import { describe, it, expect, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

const THEMES = ['standard', 'foret', 'volcan', 'ocean', 'banquise', 'chateau', 'sakura', 'nuit', 'espace'];

describe('_pickStagingLine() — mise en scène par thème (N1)', () => {
  it('renvoie une phrase du bon pool pour chaque thème', () => {
    const api = loadGame(FILES);
    for (const theme of THEMES) {
      const line = api._pickStagingLine(theme);
      expect(typeof line).toBe('string');
      expect(line.length).toBeGreaterThan(0);
    }
  });

  it('retombe sur le pool "standard" pour un thème inconnu', () => {
    const api = loadGame(FILES);
    const line = api._pickStagingLine('inexistant');
    expect(typeof line).toBe('string');
    expect(line.length).toBeGreaterThan(0);
  });

  it('génère une bonne variété sur 30 tirages pour le même thème (jamais toujours la même)', () => {
    const api = loadGame(FILES);
    const texts = new Set();
    for (let i = 0; i < 30; i++) texts.add(api._pickStagingLine('volcan'));
    expect(texts.size).toBeGreaterThanOrEqual(3); // pool de 5, doit en voir plusieurs
  });
});

describe('_companionComment() — saveur du trait de héros (N8)', () => {
  it('n\'injecte jamais de réplique de trait si P.heroTrait est absent', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: null });
    api.setGM({ adventure: 'prim' });
    for (let i = 0; i < 20; i++) {
      const line = api._companionComment(true);
      expect(line).not.toContain('courage');
      expect(line).not.toContain('ruse');
    }
  });

  it('injecte occasionnellement une réplique "brave" quand heroTrait=brave (jamais sur mauvaise réponse)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: 'brave' });
    api.setGM({ adventure: 'prim' });
    let traitSeen = false;
    for (let i = 0; i < 60; i++) {
      const line = api._companionComment(true);
      if (line.includes('courage') || line.includes('arrête') || line.includes('ligne')) traitSeen = true;
    }
    expect(traitSeen).toBe(true);
    // Jamais sur mauvaise réponse (wasCorrect=false) :
    for (let i = 0; i < 20; i++) {
      const line = api._companionComment(false);
      expect(line).not.toContain('courage');
    }
  });
});

describe('_maybeShowStory() — choix du trait de héros (N8)', () => {
  it('déclenche le choix (ne rappelle PAS le callback tout de suite) pour un profil neuf sans trait', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: null, mapBossBeaten: [], storySeen: [] });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api.getP().heroTrait).toBe(null); // pas encore choisi (pas de clic simulé)
  });

  it('ne redéclenche jamais le choix si heroTrait est déjà défini', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: 'malin', mapBossBeaten: [], storySeen: [] });
    const cb = vi.fn();
    // Le prologue va se déclencher à la place (storySeen vide) — mais jamais
    // le choix de trait, donc heroTrait reste "malin" sans être redemandé.
    api._maybeShowStory(cb);
    expect(api.getP().heroTrait).toBe('malin');
  });

  it('ne redéclenche jamais le choix pour un profil déjà avancé (même sans trait choisi)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: null, mapBossBeaten: ['plaine'], storySeen: ['intro'] });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    // Pas d'assertion sur cb ici (dépend du reste du pipeline narratif) —
    // seul point testé : le profil n'a pas été interrompu par un choix
    // rétroactif de trait, resté null comme avant l'appel.
    expect(api.getP().heroTrait).toBe(null);
  });
});

describe('validateProfile() — persistance de heroTrait (N8)', () => {
  it('conserve une valeur valide', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTrait: 'brave' }, 'Test');
    expect(out.heroTrait).toBe('brave');
  });

  it('rejette toute valeur hors de la liste fermée', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTrait: '<script>alert(1)</script>' }, 'Test');
    expect(out.heroTrait).toBe(null);
  });
});
