import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// v12.5.0 (session 21, ADR-112) : fragments de lore hors-combat — 5e voix
// narrative (registre ADR-94, "Le Monde"), déclenchée par un clic
// volontaire, sans rapport avec les questions/calculs. Pilote sur
// l'Odyssée 'mat' (maths maternelle) uniquement pour l'instant.

describe('_LORE_FRAGMENTS — intégrité des données du pilote (mat)', () => {
  it('contient exactement 12 fragments, tous avec un id unique', () => {
    const api = loadGame(FILES);
    const list = api._loreFragmentsFor('mat');
    expect(list).toHaveLength(12);
    const ids = list.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque fragment référence une zone qui existe réellement dans MAT_ZONES, et a un type valide', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    const zoneIds = api.getMapZones().map(z => z.id);
    const list = api._loreFragmentsFor('mat');
    list.forEach(f => {
      expect(zoneIds, `zoneId inconnu : ${f.zoneId} (fragment ${f.id})`).toContain(f.zoneId);
      expect(['zone', 'map']).toContain(f.type);
      expect(typeof f.emoji).toBe('string');
      expect(typeof f.title).toBe('string');
      expect(f.title.length).toBeGreaterThan(0);
      expect(typeof f.text).toBe('string');
      // Rédaction "riche" : on vérifie juste un plancher de longueur, pas de
      // règle stricte de style (le ton exact est une décision éditoriale).
      expect(f.text.length).toBeGreaterThan(80);
    });
  });

  it('une Odyssée jamais couverte renvoie une liste vide (pas d\'erreur)', () => {
    const api = loadGame(FILES);
    expect(api._loreFragmentsFor('inconnue_xyz')).toEqual([]);
  });
});

describe('_LORE_FRAGMENTS — intégrité des données, les 7 Odyssées (ADR-112, extension v12.6.0)', () => {
  it('chaque Odyssée a des fragments dont les zoneId existent réellement dans SA propre carte', () => {
    const api = loadGame(FILES);
    const cases = [
      { adv: 'mat', level: 'PS', subject: 'math' },
      { adv: 'matfr', level: 'PS', subject: 'fr' },
      { adv: 'prim', level: 'CP', subject: 'math' },
      { adv: 'primfr', level: 'CP', subject: 'fr' },
      { adv: 'primhist', level: 'CP', subject: 'hist' },
      { adv: 'col', level: '6E', subject: 'math' },
      { adv: 'colfr', level: '6E', subject: 'fr' },
    ];
    let total = 0;
    cases.forEach(({ adv, level, subject }) => {
      api.setGM({ level, subject });
      api.startAdventure(adv, true);
      const zoneIds = api.getMapZones().map(z => z.id);
      const list = api._loreFragmentsFor(adv);
      expect(list.length, `${adv} ne devrait pas être vide`).toBeGreaterThan(0);
      list.forEach(f => {
        expect(zoneIds, `zoneId inconnu : ${f.zoneId} (fragment ${f.id}, Odyssée ${adv})`).toContain(f.zoneId);
      });
      total += list.length;
    });
    expect(total).toBe(77); // 12+12+9+9+9+13+13
  });

  it('aucun id de fragment n\'est dupliqué, toutes Odyssées confondues', () => {
    const api = loadGame(FILES);
    const advs = ['mat', 'matfr', 'prim', 'primfr', 'primhist', 'col', 'colfr'];
    const allIds = [];
    advs.forEach(adv => api._loreFragmentsFor(adv).forEach(f => allIds.push(f.id)));
    expect(new Set(allIds).size).toBe(allIds.length);
  });
});

describe('_loreZoneFragment() / _loreMapFragmentsNear() — sélection par ancrage', () => {
  it('_loreZoneFragment() renvoie le fragment de type "zone" pour un lieu qui en a un, null sinon', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    expect(api._loreZoneFragment('mat_cp_1').id).toBe('mat_lore_1');
    // mat_cp_2 n'a volontairement aucun fragment (fréquence ~1 zone sur 2-3)
    expect(api._loreZoneFragment('mat_cp_2')).toBeNull();
  });

  it('_loreMapFragmentsNear() renvoie le(s) fragment(s) de type "map" ancrés sur ce lieu', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    const near = api._loreMapFragmentsNear('mat_cp_3');
    expect(near).toHaveLength(1);
    expect(near[0].id).toBe('mat_lore_2');
    expect(api._loreMapFragmentsNear('mat_cp_1')).toEqual([]); // celui-ci est de type 'zone', pas 'map'
  });
});

describe('_isLoreFound() / _markLoreFound() — marquage "trouvé", scindé par Odyssée', () => {
  it('un fragment non trouvé renvoie false, puis true après _markLoreFound()', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    api.setP({ name: 'Test', loreFoundIdsByAdv: {} });
    expect(api._isLoreFound('mat_lore_1')).toBe(false);
    api._markLoreFound('mat_lore_1');
    expect(api._isLoreFound('mat_lore_1')).toBe(true);
    expect(api.getP().loreFoundIdsByAdv.mat).toEqual(['mat_lore_1']);
  });

  it('ne duplique pas un id déjà marqué trouvé', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    api.setP({ name: 'Test', loreFoundIdsByAdv: { mat: ['mat_lore_1'] } });
    api._markLoreFound('mat_lore_1');
    expect(api.getP().loreFoundIdsByAdv.mat).toEqual(['mat_lore_1']);
  });

  it('le marquage est scindé par Odyssée (advKey) — pas de fuite entre Odyssées', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', loreFoundIdsByAdv: {} });
    api.setGM({ adventure: 'mat' });
    api._markLoreFound('mat_lore_1');
    api.setGM({ adventure: 'matfr' });
    expect(api._isLoreFound('mat_lore_1')).toBe(false); // pas trouvé côté matfr
  });
});

describe('_openLoreFragment() — ouverture au clic (carte ou écran de lieu)', () => {
  it('marque le fragment trouvé et affiche une modale au style violet dédié', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    api.setP({ name: 'Test', loreFoundIdsByAdv: {} });
    api._openLoreFragment('mat_lore_1');
    expect(api._isLoreFound('mat_lore_1')).toBe(true);
    const el = api._lastCreatedElement();
    expect(el.className).toBe('story-overlay lore-overlay');
    expect(el.innerHTML).toContain('lore-parchment');
    expect(el.innerHTML).toContain('Secret du monde');
    expect(el.innerHTML).toContain('champignon'); // texte du fragment mat_lore_1
  });

  it('un id inconnu ne fait rien (pas d\'erreur, pas de modale)', () => {
    const api = loadGame(FILES);
    api.setGM({ adventure: 'mat' });
    api.setP({ name: 'Test', loreFoundIdsByAdv: {} });
    expect(() => api._openLoreFragment('id_inexistant')).not.toThrow();
    expect(api._isLoreFound('id_inexistant')).toBe(false);
  });
});

describe('validateProfile() — persistance de loreFoundIdsByAdv', () => {
  it('conserve les ids déjà trouvés à la relecture du profil', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', loreFoundIdsByAdv: { mat: ['mat_lore_1', 'mat_lore_3'] } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.loreFoundIdsByAdv.mat).toEqual(['mat_lore_1', 'mat_lore_3']);
  });

  it('ignore silencieusement des entrées corrompues sans planter', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', loreFoundIdsByAdv: { mat: [42, null, 'mat_lore_1'], matfr: 'pas_un_tableau' } };
    expect(() => api.validateProfile(raw, 'Test')).not.toThrow();
    const out = api.validateProfile(raw, 'Test');
    expect(out.loreFoundIdsByAdv.mat).toEqual(['mat_lore_1']);
  });

  it('absent du profil brut → objet vide (jamais undefined)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.loreFoundIdsByAdv).toEqual({});
  });
});

describe('openArchipelZoom() — le fragment "de site" apparaît bien dans l\'écran RÉELLEMENT ouvert au clic sur un lieu', () => {
  // v12.5.1 : correctif d'un bug de câblage — la 1ère version de ce système
  // avait été branchée sur renderZoneMap()/v-zone, un écran secondaire peu
  // emprunté (retour d'une partie en cours seulement), et non sur
  // openArchipelZoom(), l'écran réellement ouvert par requestZoneOpen() au
  // clic sur un lieu depuis la carte. Ce test verrouille le bon écran.
  it('un lieu avec un fragment "zone" affiche un .lore-point dans la modale zoom', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', zoneProgress: {}, mapBossBeaten: [], loreFoundIdsByAdv: {} });
    api.setGM({ level: 'PS', subject: 'math', adventure: 'mat' });
    api.startAdventure('mat', true);
    api.openArchipelZoom('mat_cp_1'); // a un fragment de type 'zone' (mat_lore_1)
    const el = api._lastCreatedElement();
    expect(el.className).toBe('archipel-zoom-overlay');
    expect(el.innerHTML).toContain('lore-point');
    expect(el.innerHTML).toContain('data-lore-id="mat_lore_1"');
  });

  it('un lieu sans fragment n\'ajoute aucun .lore-point', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', zoneProgress: {}, mapBossBeaten: [], loreFoundIdsByAdv: {} });
    api.setGM({ level: 'PS', subject: 'math', adventure: 'mat' });
    api.startAdventure('mat', true);
    api.openArchipelZoom('mat_cp_2'); // volontairement sans fragment
    const el = api._lastCreatedElement();
    expect(el.innerHTML).not.toContain('lore-point');
  });

  it('même vérification sur les 6 autres Odyssées (extension v12.6.0) — un fragment "zone" par Odyssée est bien visible', () => {
    const api = loadGame(FILES);
    const cases = [
      { adv: 'matfr', level: 'PS', subject: 'fr', zoneId: 'matfr_cp_1', loreId: 'matfr_lore_1' },
      { adv: 'prim', level: 'CP', subject: 'math', zoneId: 'plaine', loreId: 'prim_lore_1' },
      { adv: 'primfr', level: 'CP', subject: 'fr', zoneId: 'primfr_plaine', loreId: 'primfr_lore_1' },
      { adv: 'primhist', level: 'CP', subject: 'hist', zoneId: 'primhist_plaine', loreId: 'primhist_lore_1' },
      { adv: 'col', level: '6E', subject: 'math', zoneId: 'col_cp_1', loreId: 'col_lore_1' },
      { adv: 'colfr', level: '6E', subject: 'fr', zoneId: 'colfr_col_cp_1', loreId: 'colfr_lore_1' },
    ];
    cases.forEach(({ adv, level, subject, zoneId, loreId }) => {
      api.setP({ name: 'Test', zoneProgress: {}, mapBossBeaten: [], loreFoundIdsByAdv: {} });
      api.setGM({ level, subject, adventure: adv });
      api.startAdventure(adv, true);
      api.openArchipelZoom(zoneId);
      const el = api._lastCreatedElement();
      expect(el.innerHTML, `${adv} / ${zoneId}`).toContain('lore-point');
      expect(el.innerHTML, `${adv} / ${zoneId}`).toContain(`data-lore-id="${loreId}"`);
    });
  });
});

