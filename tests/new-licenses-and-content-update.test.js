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

  it('Balaïna (tl17) est achetable normalement ; le Cœur de Balaïna (tl18) reste exclusif avec un indice clair', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    expect(byId.tl17.r).not.toBe('exclusif');
    expect(byId.tl17.p).toBeGreaterThan(0);
    expect(byId.tl18.r).toBe('exclusif');
    expect(byId.tl18.unlockHint).toBeTruthy();
  });
});

describe('Correctif — licences av/tl visibles dans la boutique (bug signalé par Cyril)', () => {
  it('SHOP_LICENSES (menu déroulant de la boutique) contient av et tl', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api._renderFigurinesShop('none');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('Avatar');
    expect(html).toContain('Tobie Lolness');
  });

  it('filtrer sur la licence "av" affiche bien les 12 figurines Avatar', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api._renderFigurinesShop('av');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('Aang');
    expect(html).toContain('Korra');
  });

  it('filtrer sur la licence "tl" affiche bien les 18 figurines Tobie Lolness', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api._renderFigurinesShop('tl');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('Tobie Lolness');
    expect(html).toContain('Léo Blue');
  });
});

describe('Correctif — images HD des 30 nouvelles figurines préchargées (bug signalé par Cyril)', () => {
  it('les 30 nouveaux ids sont dans FIG_IMG_PRELOAD (comme toutes les autres licences)', () => {
    const api = loadGame(FILES);
    [...AV_IDS, ...TL_IDS].forEach(id => {
      expect(api.FIG_IMG_PRELOAD, `${id} absent de FIG_IMG_PRELOAD`).toContain(id);
    });
  });
});


describe('_checkLicenseCompletions() — mécanisme générique de déblocage par complétion', () => {
  const ALL_TL_17 = ['tl01','tl02','tl03','tl04','tl05','tl06','tl07','tl08','tl09','tl10','tl11','tl12','tl13','tl14','tl15','tl16','tl17'];

  it('débloque tl18 (Cœur de Balaïna) quand les 17 autres Tobie Lolness sont possédées', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = [...ALL_TL_17];
    api.setP(p);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).toContain('tl18');
  });

  it('ne débloque rien s\'il manque UNE seule figurine sur les 17', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = ALL_TL_17.slice(0, -1); // il en manque une
    api.setP(p);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).not.toContain('tl18');
  });

  it('ne fait rien si déjà débloqué (pas de doublon)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = [...ALL_TL_17, 'tl18'];
    api.setP(p);
    api._checkLicenseCompletions();
    const count = api.getP().ownedFigurines.filter(id => id === 'tl18').length;
    expect(count).toBe(1);
  });

  it('buyFigurine() déclenche bien le check de complétion (achat de la 17e pièce)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = ALL_TL_17.slice(0, -1); // il manque tl17 (Balaïna)
    p.stars = 9999;
    api.setP(p);
    api.buyFigurine('tl17');
    expect(api.getP().ownedFigurines).toContain('tl17');
    expect(api.getP().ownedFigurines).toContain('tl18');
  });

  it('licence à 2 figurines verrouillées (Goldorak, gd10+gd11) : débloque les 2 en même temps', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const others = api.FIGURINES.filter(f => f.uk === 'gd' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = others;
    api.setP(p);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).toContain('gd10');
    expect(api.getP().ownedFigurines).toContain('gd11');
  });

  it('licence à 2 figurines verrouillées (Dragon Ball, db12+db36) : ne débloque rien s\'il manque un item normal', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const others = api.FIGURINES.filter(f => f.uk === 'db' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = others.slice(0, -1); // il en manque un
    api.setP(p);
    api._checkLicenseCompletions();
    expect(api.getP().ownedFigurines).not.toContain('db12');
    expect(api.getP().ownedFigurines).not.toContain('db36');
  });

  it('les 11 figurines demandées sont bien verrouillées avec un indice clair', () => {
    const api = loadGame(FILES);
    const ids = ['kp11','kp12','nj09','db12','db36','pk09','pk10','gd10','gd11','co08','al06'];
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ids.forEach(id => {
      const f = byId[id];
      expect(f, `${id} introuvable`).toBeTruthy();
      expect(f.completionLock, `${id}.completionLock`).toBe(true);
      expect(f.r, `${id}.r`).toBe('exclusif');
      expect(f.p, `${id}.p`).toBe(0);
      expect(f.unlockHint, `${id}.unlockHint`).toBeTruthy();
    });
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
