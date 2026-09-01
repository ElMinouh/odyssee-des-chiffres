import { describe, it, expect, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// v12.7.29 — Récap "Précédemment dans..." affiché à l'entrée dans une
// Odyssée après 1 jour ou plus sans y avoir joué (demande de Cyril, maquette
// dédiée validée : contenu littéraire complet, sans encarts séparés pour le
// lieu/les boss/le rebondissement — tout est fondu dans le texte).

describe("validateProfile() — persistance de lastAdvVisitDayByAdv", () => {
  it('conserve le jour de dernière visite par Odyssée', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', lastAdvVisitDayByAdv: { mat: '2026-8-31' } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.lastAdvVisitDayByAdv.mat).toBe('2026-8-31');
  });

  it('ignore les valeurs non conformes sans planter (durcissement)', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', lastAdvVisitDayByAdv: { mat: 12345, col: '' } };
    expect(() => api.validateProfile(raw, 'Test')).not.toThrow();
    const out = api.validateProfile(raw, 'Test');
    expect(out.lastAdvVisitDayByAdv.mat).toBeUndefined();
    expect(out.lastAdvVisitDayByAdv.col).toBeUndefined();
  });
});

function setupOdyssey(api, { boss = [], zoneProgressEntry = null, twist = null, lastDay = null } = {}) {
  api.setGM({ level: 'PS', subject: 'math' });
  api.startAdventure('mat', true);
  const p = {
    name: 'Peyo',
    mapBossBeaten: boss,
    zoneProgress: {},
    lastTwistLineByAdv: twist ? { mat: twist } : {},
    lastAdvVisitDayByAdv: lastDay ? { mat: lastDay } : {},
  };
  if (zoneProgressEntry) p.zoneProgress[zoneProgressEntry] = { stepsCompleted: 1, completed: false };
  api.setP(p);
  return p;
}

describe('_maybeShowOdysseyRecap() — condition de déclenchement (1 jour ou plus + progression réelle)', () => {
  it('ne montre rien à la toute première visite (aucune progression), même si aucun jour n\'a encore été enregistré', () => {
    const api = loadGame(FILES);
    setupOdyssey(api, {});
    const cb = vi.fn();
    api._maybeShowOdysseyRecap(cb);
    expect(cb).toHaveBeenCalled();
    expect(api._createdElements().length).toBe(0);
    // Le jour est tout de même mémorisé, pour ne pas fausser la première vraie visite future.
    expect(api.getP().lastAdvVisitDayByAdv.mat).toBe(api.todayKey());
  });

  it('affiche le récap si progression existante ET dernier passage un autre jour', () => {
    const api = loadGame(FILES);
    setupOdyssey(api, { boss: ['mat_cp_1'], lastDay: '2000-1-1' });
    const cb = vi.fn();
    api._maybeShowOdysseyRecap(cb);
    expect(cb).not.toHaveBeenCalled(); // la fenêtre bloque, le callback attend la fermeture
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('recap-overlay');
    expect(api.getP().lastAdvVisitDayByAdv.mat).toBe(api.todayKey());
  });

  it('ne réaffiche pas si l\'Odyssée a déjà été visitée aujourd\'hui', () => {
    const api = loadGame(FILES);
    const today = api.todayKey();
    setupOdyssey(api, { boss: ['mat_cp_1'], lastDay: today });
    const cb = vi.fn();
    api._maybeShowOdysseyRecap(cb);
    expect(cb).toHaveBeenCalled();
    expect(api._createdElements().length).toBe(0);
  });

  it('détecte aussi une progression via zoneProgress, pas seulement un boss déjà vaincu', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    const zones = api.getMapZones();
    setupOdyssey(api, { zoneProgressEntry: zones[0].id, lastDay: '2000-1-1' });
    const cb = vi.fn();
    api._maybeShowOdysseyRecap(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api._lastCreatedElement().className).toBe('recap-overlay');
  });
});

describe('_advRecapText() — texte littéraire assemblé (une seule source pour le pitch + la situation)', () => {
  it('accorde correctement la phrase selon le nombre de boss déjà vaincus (zéro / un / plusieurs)', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    const zones = api.getMapZones();

    api.setP({ name: 'Peyo', mapBossBeaten: [] });
    expect(api._advRecapText('mat').situation).toContain("Aucun gardien du ciel n'a encore cédé");

    api.setP({ name: 'Peyo', mapBossBeaten: [zones[0].id] });
    expect(api._advRecapText('mat').situation).toContain('Tu as déjà vaincu un gardien du ciel');

    api.setP({ name: 'Peyo', mapBossBeaten: [zones[0].id, zones[1].id] });
    expect(api._advRecapText('mat').situation).toContain('Tu as déjà vaincu 2 gardiens du ciel');
  });

  it('inclut le lieu actuel et substitue {hero}/{villain} sans laisser de placeholder', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    api.setP({ name: 'Peyo', mapBossBeaten: [] });
    const r = api._advRecapText('mat');
    expect(r.pitch).toContain('Peyo');
    expect(r.pitch).toContain('Nuage Grognon');
    expect(r.pitch).not.toContain('{hero}');
    expect(r.pitch).not.toContain('{villain}');
    const zones = api.getMapZones();
    api._setAvatarZone(zones[2].id);
    expect(api._advRecapText('mat').situation).toContain(zones[2].label);
  });

  it('reprend tel quel le dernier rebondissement existant (lastTwistLineByAdv), sans le régénérer', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    api.setP({ name: 'Peyo', mapBossBeaten: [], lastTwistLineByAdv: { mat: 'Le dragon se réveille au loin.' } });
    expect(api._advRecapText('mat').twist).toBe('Le dragon se réveille au loin.');
  });

  it('fonctionne pour les 7 Odyssées sans texte vide ni placeholder oublié', () => {
    const api = loadGame(FILES);
    const odysseys = [
      ['mat', 'PS'], ['matfr', 'PS'], ['prim', 'CP'], ['primfr', 'CP'],
      ['primhist', 'CP'], ['col', '6E'], ['colfr', '6E'],
    ];
    for (const [adv, level] of odysseys) {
      api.setP({ name: 'Test' });
      api.setGM({ level, subject: 'math' });
      api.startAdventure(adv, true);
      const r = api._advRecapText(adv);
      expect(r.pitch.length).toBeGreaterThan(0);
      expect(r.pitch).not.toMatch(/\{hero\}|\{villain\}|\{kingdom\}/);
      expect(r.situation.length).toBeGreaterThan(0);
    }
  });
});

describe('closeOdysseyRecap() — ferme la fenêtre et relance le callback en attente', () => {
  it('retire l\'overlay et appelle le callback fourni à l\'ouverture', () => {
    const api = loadGame(FILES);
    setupOdyssey(api, { boss: ['mat_cp_1'], lastDay: '2000-1-1' });
    const cb = vi.fn();
    api._maybeShowOdysseyRecap(cb);
    expect(cb).not.toHaveBeenCalled();
    api.closeOdysseyRecap();
    expect(cb).toHaveBeenCalled();
  });
});
