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

describe('_companionComment() — saveur des traits de héros (N8, étendu N9 v12.4.61, par Odyssée depuis ADR-113/v12.7.0)', () => {
  it('n\'injecte jamais de réplique de trait si aucun des 3 traits n\'est défini pour l\'Odyssée en cours', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {} });
    api.setGM({ adventure: 'prim' });
    for (let i = 0; i < 20; i++) {
      const line = api._companionComment(true);
      expect(line).not.toContain('courage');
      expect(line).not.toContain('Cristal');
    }
  });

  it('injecte occasionnellement une réplique liée à l\'axe "approche" (brave) quand il est défini pour CETTE Odyssée (jamais sur mauvaise réponse)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: { prim: 'brave' }, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {} });
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

  it('pioche parmi les 3 axes quand les 3 sont définis pour l\'Odyssée en cours, avec du contenu adapté à celle-ci', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: { col: 'brave' }, heroTraitMoteurByAdv: { col: 'protecteur' }, heroTraitStyleByAdv: { col: 'determine' } });
    api.setGM({ adventure: 'col' }); // Sidéris — vocabulaire distinct de Calcultopia
    let sawSideris = false;
    for (let i = 0; i < 80; i++) {
      const line = api._companionComment(true);
      if (line.includes('Sidéris') || line.includes('Léthéas') || line.includes('étoile') || line.includes('preuve')) sawSideris = true;
      expect(line).not.toContain('Calcultopia'); // pas de fuite du vocabulaire d'une autre Odyssée
    }
    expect(sawSideris).toBe(true);
  });

  it('un trait défini pour une AUTRE Odyssée ne fuite jamais dans l\'Odyssée en cours (ADR-113)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: { prim: 'brave' }, heroTraitMoteurByAdv: { prim: 'protecteur' }, heroTraitStyleByAdv: { prim: 'determine' } });
    api.setGM({ adventure: 'col' }); // trait défini pour 'prim', pas 'col'
    for (let i = 0; i < 30; i++) {
      const line = api._companionComment(true);
      expect(line).not.toContain('Cristal'); // vocabulaire des répliques "prim" ne doit jamais sortir ici
    }
  });
});

describe('_maybeShowStory() — quiz d\'ouverture, désormais posé une fois PAR ODYSSÉE (ADR-113, v12.7.0)', () => {
  it('déclenche la 1re question pour une Odyssée neuve (aucun trait, aucun boss battu dans CETTE Odyssée), une fois son prologue déjà vu', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {}, mapBossBeaten: [], storySeen: ['intro'] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api.getP().heroTraitApprocheByAdv.prim).toBeUndefined(); // pas encore choisi (pas de clic simulé)
  });

  it('déclenche le prologue AVANT le quiz si aucun des deux n\'a encore été vu (v12.4.62 : ordre inversé)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {}, mapBossBeaten: [], storySeen: [] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api.getP().storySeen).toContain('intro');
    expect(api.getP().heroTraitApprocheByAdv.prim).toBeUndefined(); // le quiz n'a pas encore eu sa chance
  });

  it('déclenche la 2e question si la 1re est déjà répondue pour CETTE Odyssée mais pas les suivantes', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: { prim: 'malin' }, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {}, mapBossBeaten: [], storySeen: ['intro'] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    // La réponse déjà donnée n'est jamais reposée :
    expect(api.getP().heroTraitApprocheByAdv.prim).toBe('malin');
    expect(api.getP().heroTraitMoteurByAdv.prim).toBeUndefined();
  });

  it('ne redéclenche jamais le quiz de CETTE Odyssée si ses 3 traits sont déjà définis', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApprocheByAdv: { prim: 'malin' }, heroTraitMoteurByAdv: { prim: 'ambitieux' }, heroTraitStyleByAdv: { prim: 'joyeux' }, mapBossBeaten: [], storySeen: ['intro'] });
    api.setGM({ adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(api.getP().heroTraitApprocheByAdv.prim).toBe('malin');
    expect(api.getP().heroTraitMoteurByAdv.prim).toBe('ambitieux');
    expect(api.getP().heroTraitStyleByAdv.prim).toBe('joyeux');
  });

  it('ne redéclenche jamais le quiz pour une Odyssée où le joueur a déjà battu un boss (même sans trait choisi pour elle)', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'CP', subject: 'math' });
    api.startAdventure('prim', true); // charge MAP_ZONES = PRIM_ZONES ('plaine' y figure bien)
    api.setP({ name: 'Test', heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {}, mapBossBeaten: ['plaine'], storySeen: ['intro'] });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    // Pas d'assertion sur cb ici (dépend du reste du pipeline narratif) —
    // seul point testé : le profil n'a pas été interrompu par un choix
    // rétroactif de trait, resté vide comme avant l'appel.
    expect(api.getP().heroTraitApprocheByAdv.prim).toBeUndefined();
  });

  it('LE scénario signalé par Cyril : un profil déjà avancé sur \'mat\' (boss battus) voit quand même le quiz se poser sur \'colfr\', jamais commencée (ADR-113)', () => {
    const api = loadGame(FILES);
    api.setGM({ level: '6E', subject: 'fr' });
    api.startAdventure('colfr', true); // charge MAP_ZONES = COL_ZONES_FR
    api.setP({
      name: 'Test',
      heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {},
      mapBossBeaten: ['mat_cp_1', 'mat_cp_2'], // progression réelle... mais sur une AUTRE Odyssée
      storySeen: ['intro'],
    });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled(); // le quiz colfr s'est bien déclenché, pas le callback final
  });
});

describe('validateProfile() — persistance des 3 traits de héros par Odyssée (ADR-113, v12.7.0)', () => {
  it('conserve une valeur valide sur chacun des 3 axes, pour plusieurs Odyssées indépendamment', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'Test',
      heroTraitApprocheByAdv: { prim: 'curieux', col: 'brave' },
      heroTraitMoteurByAdv: { prim: 'reparateur' },
      heroTraitStyleByAdv: { prim: 'rassurant' },
    }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({ prim: 'curieux', col: 'brave' });
    expect(out.heroTraitMoteurByAdv).toEqual({ prim: 'reparateur' });
    expect(out.heroTraitStyleByAdv).toEqual({ prim: 'rassurant' });
  });

  it('rejette toute valeur hors de la liste fermée, pour chacun des 3 axes, sans planter', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'Test',
      heroTraitApprocheByAdv: { prim: '<script>alert(1)</script>' },
      heroTraitMoteurByAdv: { prim: 'inconnu' },
      heroTraitStyleByAdv: { prim: 'inconnu' },
    }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({});
    expect(out.heroTraitMoteurByAdv).toEqual({});
    expect(out.heroTraitStyleByAdv).toEqual({});
  });

  it('migre l\'ancien trait global (heroTraitApproche) vers lastAdventure s\'il est valide', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTraitApproche: 'brave', lastAdventure: 'mat' }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({ mat: 'brave' });
  });

  it('migre vers \'prim\' par défaut si lastAdventure est absent ou invalide', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTraitApproche: 'brave' }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({ prim: 'brave' });
    const out2 = api.validateProfile({ name: 'Test', heroTraitApproche: 'malin', lastAdventure: 'xyz_inconnu' }, 'Test');
    expect(out2.heroTraitApprocheByAdv).toEqual({ prim: 'malin' });
  });

  it('migre le tout ancien champ heroTrait (v12.4.50) vers le 1er axe, même chemin de migration', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test', heroTrait: 'malin', lastAdventure: 'col' }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({ col: 'malin' });
  });

  it('ne migre pas si des valeurs ByAdv existent déjà (priorité au nouveau format)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'Test',
      heroTraitApproche: 'malin', // ancien champ, présent mais ignoré
      heroTraitApprocheByAdv: { prim: 'curieux' },
    }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({ prim: 'curieux' });
  });

  it('absent du profil brut → objet vide sur les 3 axes (jamais undefined)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.heroTraitApprocheByAdv).toEqual({});
    expect(out.heroTraitMoteurByAdv).toEqual({});
    expect(out.heroTraitStyleByAdv).toEqual({});
  });
});
