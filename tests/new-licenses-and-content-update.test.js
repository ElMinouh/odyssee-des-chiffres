import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

const AV_IDS = ['av01','av02','av03','av04','av05','av06','av07','av08','av09','av10','av11','av12'];
const TL_IDS = ['tl01','tl02','tl03','tl04','tl05','tl06','tl07','tl08','tl09','tl10','tl11','tl12','tl13','tl14','tl15','tl16','tl17','tl18'];

describe('Nouvelles licences — Avatar (12) et Tobie Lolness (18)', () => {
  it('30 nouvelles figurines présentes, avec tous les champs requis', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    [...AV_IDS, ...TL_IDS].forEach(id => {
      const f = byId[id];
      expect(f, `figurine ${id} manquante`).toBeTruthy();
      ['name','uni','uk','em','color','gc','r','pages'].forEach(field => {
        expect(f[field], `${id}.${field}`).toBeTruthy();
      });
      expect(Array.isArray(f.pages)).toBe(true);
      expect(f.pages.length).toBeGreaterThan(0);
      // format attendu par _fvRenderBackPage() : tableau de CHAÎNES (pas d'objets)
      f.pages.forEach(p => expect(typeof p).toBe('string'));
      f.pages.forEach(p => expect(p.length).toBeGreaterThan(30));
    });
  });

  it('aucun id dupliqué avec les figurines existantes', () => {
    const api = loadGame(FILES);
    const ids = api.FIGURINES.map(f => f.id);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dups).toEqual([]);
  });

  it('av et tl sont bien enregistrés dans UNI_ICON et UNIVERS_LIST', () => {
    const api = loadGame(FILES);
    expect(api.UNI_ICON.av).toBeTruthy();
    expect(api.UNI_ICON.tl).toBeTruthy();
    const keys = api.UNIVERS_LIST.map(u => u.k);
    expect(keys).toContain('av');
    expect(keys).toContain('tl');
  });

  it('tl17/tl18 (objets, pas personnages) sont bien en rareté exclusif', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    expect(byId.tl17.r).toBe('exclusif');
    expect(byId.tl18.r).toBe('exclusif');
  });
});

describe('_maybeShowContentUpdate() — notification de nouveau contenu', () => {
  it('affiche la modale au 1er appel pour un profil qui n\'a rien vu, avec les 2 licences', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    let doneCalled = false;
    api._maybeShowContentUpdate(() => { doneCalled = true; });
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
    expect(overlay.innerHTML).toContain('Avatar');
    expect(overlay.innerHTML).toContain('Tobie Lolness');
    // La modale interrompt la chaîne (comme les autres _showStoryModal) :
    // le callback n'est pas encore appelé, il attend la fermeture.
    expect(doneCalled).toBe(false);
  });

  it('ne réaffiche jamais une notification déjà marquée vue', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    let doneCalled = false;
    api._maybeShowContentUpdate(() => { doneCalled = true; });
    expect(api._createdElements().length).toBe(0);
    expect(doneCalled).toBe(true);
  });

  it('marque bien la notification comme vue après l\'avoir affichée', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api._maybeShowContentUpdate(() => {});
    expect(api.getP().contentUpdatesSeen).toContain('update_2026_08_av_tl');
  });

  it('ne plante pas avec un profil minimal (garde-fous)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test' });
    expect(() => api._maybeShowContentUpdate(() => {})).not.toThrow();
  });
});

describe('P.contentUpdatesSeen — persistance et fusion cloud', () => {
  it('survit à validateProfile() (liste blanche)', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', contentUpdatesSeen: ['update_2026_08_av_tl', 'autre_update'] };
    const out = api.validateProfile(raw, 'Test');
    expect(out.contentUpdatesSeen).toEqual(['update_2026_08_av_tl', 'autre_update']);
  });

  it('vaut [] par défaut si absent (jamais undefined)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Test' }, 'Test');
    expect(out.contentUpdatesSeen).toEqual([]);
  });

  it('fusion cloud en UNION (vu sur un appareil = vu partout)', () => {
    const api = loadGame(FILES);
    const local = api.defProfile('Test');
    local.contentUpdatesSeen = ['update_A'];
    const imported = api.defProfile('Test');
    imported.contentUpdatesSeen = ['update_B'];
    const merged = api._mergeCloudProfiles(local, imported);
    expect(merged.contentUpdatesSeen.sort()).toEqual(['update_A', 'update_B']);
  });
});

describe('gotoSubjects() — la notification s\'intercale avant l\'écran des matières', () => {
  it('un profil avec une notification non vue voit la modale avant navTo("v-subjects")', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.name = 'Zoé';
    api.setP(p);
    api.gotoSubjects();
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
    // _proceed() (qui écrit le nom du joueur dans #subj-player) ne doit PAS
    // encore avoir tourné : la modale est bloquante, elle attend sa fermeture.
    expect(api._domEl('subj-player').textContent).not.toBe('Zoé');
  });

  it('un profil sans notification à voir passe directement à v-subjects (comportement inchangé)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.name = 'Zoé';
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api.gotoSubjects();
    expect(api._createdElements().length).toBe(0);
    expect(api._domEl('subj-player').textContent).toBe('Zoé');
  });
});
