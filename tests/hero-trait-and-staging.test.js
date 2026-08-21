import { describe, it, expect, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
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

describe('_companionComment() — saveur des traits de héros (N8, étendu N9 v12.4.61)', () => {
  it('n\'injecte jamais de réplique de trait si aucun des 3 traits n\'est défini', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: null, heroTraitMoteur: null, heroTraitStyle: null });
    api.setGM({ adventure: 'prim' });
    for (let i = 0; i < 20; i++) {
      const line = api._companionComment(true);
      expect(line).not.toContain('courage');
      expect(line).not.toContain('Cristal');
    }
  });

  it('injecte occasionnellement une réplique liée à l\'axe "approche" (brave) quand il est défini (jamais sur mauvaise réponse)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: 'brave', heroTraitMoteur: null, heroTraitStyle: null });
    api.setGM({ adventure: 'prim' });
    let traitSeen = false;
    for (let i = 0; i < 60; i++) {
      const line = api._companionComment(true);
      if (line.includes('arrête') || line.includes('Cristal glacé')) traitSeen = true;
    }
    expect(traitSeen).toBe(true);
    for (let i = 0; i < 20; i++) {
      const line = api._companionComment(false);
      expect(line).not.toContain('arrête');
    }
  });

  it('pioche parmi les 3 axes quand les 3 sont définis, avec du contenu adapté à l\'Odyssée en cours', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: 'brave', heroTraitMoteur: 'protecteur', heroTraitStyle: 'determine' });
    api.setGM({ adventure: 'col' }); // Sidéris — vocabulaire distinct de Calcultopia
    let sawSideris = false;
    for (let i = 0; i < 80; i++) {
      const line = api._companionComment(true);
      if (line.includes('Sidéris') || line.includes('Léthéas') || line.includes('étoile') || line.includes('preuve')) sawSideris = true;
      expect(line).not.toContain('Calcultopia'); // pas de fuite du vocabulaire d'une autre Odyssée
    }
    expect(sawSideris).toBe(true);
  });
});

describe('_maybeShowStory() — quiz d\'ouverture à 3 questions (N9, v12.4.61)', () => {
  it('déclenche la 1re question (ne rappelle PAS le callback tout de suite) pour un profil neuf sans trait', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: null, heroTraitMoteur: null, heroTraitStyle: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api.getP().heroTraitApproche).toBe(null); // pas encore choisi (pas de clic simulé)
  });

  it('déclenche la 2e question si la 1re est déjà répondue mais pas les suivantes', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: 'malin', heroTraitMoteur: null, heroTraitStyle: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    // Les réponses déjà données ne sont jamais reposées :
    expect(api.getP().heroTraitApproche).toBe('malin');
    expect(api.getP().heroTraitMoteur).toBe(null);
  });

  it('ne redéclenche jamais le quiz si les 3 traits sont déjà définis', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: 'malin', heroTraitMoteur: 'ambitieux', heroTraitStyle: 'joyeux', mapBossBeaten: [], storySeen: ['intro'] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(api.getP().heroTraitApproche).toBe('malin');
    expect(api.getP().heroTraitMoteur).toBe('ambitieux');
    expect(api.getP().heroTraitStyle).toBe('joyeux');
  });

  it('ne redéclenche jamais le quiz pour un profil déjà avancé (même sans trait choisi)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: null, heroTraitMoteur: null, heroTraitStyle: null, mapBossBeaten: ['plaine'], storySeen: ['intro'] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    // Pas d'assertion sur cb ici (dépend du reste du pipeline narratif) —
    // seul point testé : le profil n'a pas été interrompu par un choix
    // rétroactif de trait, resté null comme avant l'appel.
    expect(api.getP().heroTraitApproche).toBe(null);
  });
});

describe('validateProfile() — persistance des 3 traits de héros (N9, v12.4.61)', () => {
  it('conserve une valeur valide sur chacun des 3 axes', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTraitApproche: 'curieux', heroTraitMoteur: 'reparateur', heroTraitStyle: 'rassurant' }, 'Test');
    expect(out.heroTraitApproche).toBe('curieux');
    expect(out.heroTraitMoteur).toBe('reparateur');
    expect(out.heroTraitStyle).toBe('rassurant');
  });

  it('rejette toute valeur hors de la liste fermée, pour chacun des 3 axes', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTraitApproche: '<script>alert(1)</script>', heroTraitMoteur: 'inconnu', heroTraitStyle: 'inconnu' }, 'Test');
    expect(out.heroTraitApproche).toBe(null);
    expect(out.heroTraitMoteur).toBe(null);
    expect(out.heroTraitStyle).toBe(null);
  });

  it('migre l\'ancien champ heroTrait (v12.4.50) vers heroTraitApproche s\'il est absent', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTrait: 'brave' }, 'Test');
    expect(out.heroTraitApproche).toBe('brave');
  });

  it('ne migre pas l\'ancien champ si le nouveau est déjà présent (priorité au nouveau)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTrait: 'malin', heroTraitApproche: 'curieux' }, 'Test');
    expect(out.heroTraitApproche).toBe('curieux');
  });
});
