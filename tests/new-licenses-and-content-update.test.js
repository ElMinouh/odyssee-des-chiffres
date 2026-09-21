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

  it('Balaïna (tl17) est achetable normalement ; le Cœur de Balaïna (tl18) reste exclusif, payant, avec un indice clair', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    expect(byId.tl17.r).not.toBe('exclusif');
    expect(byId.tl17.p).toBeGreaterThan(0);
    expect(byId.tl18.r).toBe('exclusif');
    // v12.7.37 : plus jamais offerte gratuitement, même une fois débloquée à l'achat.
    expect(byId.tl18.p).toBeGreaterThan(0);
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


// v12.7.37 (demande de Cyril) : CHANGEMENT DE COMPORTEMENT — une figurine
// completionLock n'est plus jamais offerte automatiquement. Elle devient
// simplement ACHETABLE (au prix normal) une fois la licence complète ; avant
// cela, son achat reste refusé. Remplace l'ancien mécanisme d'auto-don
// (_checkLicenseCompletions, testé ici jusqu'à v12.7.36).
describe('_isLicenseCompletionUnlocked() / buyFigurine() — achat gated par complétion de licence (v12.7.37)', () => {
  const ALL_TL_17 = ['tl01','tl02','tl03','tl04','tl05','tl06','tl07','tl08','tl09','tl10','tl11','tl12','tl13','tl14','tl15','tl16','tl17'];

  it('_isLicenseCompletionUnlocked(tl18) est vrai quand les 17 autres Tobie Lolness sont possédées', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = [...ALL_TL_17];
    api.setP(p);
    const tl18 = api.FIGURINES.find(f => f.id === 'tl18');
    expect(api._isLicenseCompletionUnlocked(tl18)).toBe(true);
  });

  it('_isLicenseCompletionUnlocked(tl18) est faux s\'il manque UNE seule figurine sur les 17', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = ALL_TL_17.slice(0, -1); // il en manque une
    api.setP(p);
    const tl18 = api.FIGURINES.find(f => f.id === 'tl18');
    expect(api._isLicenseCompletionUnlocked(tl18)).toBe(false);
  });

  it('buyFigurine("tl18") est refusé (sans dépenser d\'étoiles) tant que la licence n\'est pas complète', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = ALL_TL_17.slice(0, -1); // il manque tl17
    p.stars = 9999;
    api.setP(p);
    api.buyFigurine('tl18');
    expect(api.getP().ownedFigurines).not.toContain('tl18');
    expect(api.getP().stars).toBe(9999); // rien dépensé
  });

  it('buyFigurine("tl18") réussit (et dépense ses étoiles) une fois les 17 autres possédées', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = [...ALL_TL_17];
    p.stars = 9999;
    api.setP(p);
    const tl18 = api.FIGURINES.find(f => f.id === 'tl18');
    api.buyFigurine('tl18');
    expect(api.getP().ownedFigurines).toContain('tl18');
    expect(api.getP().stars).toBe(9999 - tl18.p);
  });

  it('acheter la 17e pièce de base (Balaïna, tl17) ne donne PAS tl18 automatiquement', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.ownedFigurines = ALL_TL_17.slice(0, -1); // il manque tl17 (Balaïna)
    p.stars = 9999;
    api.setP(p);
    api.buyFigurine('tl17');
    expect(api.getP().ownedFigurines).toContain('tl17');
    expect(api.getP().ownedFigurines).not.toContain('tl18'); // reste à acheter séparément
  });

  it('licence à 2 figurines verrouillées (Goldorak, gd10+gd11) : les deux deviennent achetables en même temps', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const others = api.FIGURINES.filter(f => f.uk === 'gd' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = others;
    p.stars = 9999;
    api.setP(p);
    const gd10 = api.FIGURINES.find(f => f.id === 'gd10');
    const gd11 = api.FIGURINES.find(f => f.id === 'gd11');
    expect(api._isLicenseCompletionUnlocked(gd10)).toBe(true);
    expect(api._isLicenseCompletionUnlocked(gd11)).toBe(true);
    api.buyFigurine('gd10'); api.buyFigurine('gd11');
    expect(api.getP().ownedFigurines).toContain('gd10');
    expect(api.getP().ownedFigurines).toContain('gd11');
  });

  it('licence à 2 figurines verrouillées (Dragon Ball, db12+db36) : achat refusé s\'il manque un item normal', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const others = api.FIGURINES.filter(f => f.uk === 'db' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = others.slice(0, -1); // il en manque un
    p.stars = 9999;
    api.setP(p);
    api.buyFigurine('db12'); api.buyFigurine('db36');
    expect(api.getP().ownedFigurines).not.toContain('db12');
    expect(api.getP().ownedFigurines).not.toContain('db36');
  });

  it('les 11 figurines historiques sont bien verrouillées, exclusives et PAYANTES (plus de prix 0)', () => {
    const api = loadGame(FILES);
    const ids = ['kp11','kp12','nj09','db12','db36','pk09','pk10','gd10','gd11','co08','al06'];
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ids.forEach(id => {
      const f = byId[id];
      expect(f, `${id} introuvable`).toBeTruthy();
      expect(f.completionLock, `${id}.completionLock`).toBe(true);
      expect(f.r, `${id}.r`).toBe('exclusif');
      expect(f.p, `${id}.p`).toBeGreaterThan(0);
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
    // v12.7.34 : les deux notifications existantes doivent être marquées vues
    // pour que ces tests ("plus rien à afficher") restent valides après
    // l'ajout de la notification des figurines exclusives.
    // v2 (audit AUD-01-010) : nouvelle notification ajoutée (règle des
    // exclusifs) — même principe que le commentaire v12.7.34 ci-dessus,
    // reconduit à chaque ajout de notification pour garder ces tests
    // "plus rien à afficher" valides.
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp', 'update_2026_09_regle_exclusifs'];
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
    // v12.7.34 : les deux notifications existantes doivent être marquées vues
    // pour que ces tests ("plus rien à afficher") restent valides après
    // l'ajout de la notification des figurines exclusives.
    // v2 (audit AUD-01-010) : nouvelle notification ajoutée (règle des
    // exclusifs) — même principe que le commentaire v12.7.34 ci-dessus,
    // reconduit à chaque ajout de notification pour garder ces tests
    // "plus rien à afficher" valides.
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp', 'update_2026_09_regle_exclusifs'];
    api.setP(p);
    api.gotoSubjects();
    expect(api._createdElements().length).toBe(0);
    expect(api._domEl('subj-player').textContent).toBe('Zoé');
  });
});

// v12.7.34 — 22 nouvelles figurines exclusives (déblocables par complétion de
// licence uniquement) : Star Wars, Cités d'Or, Astérix, Tintin, Dragon Ball.
const SW_NEW_IDS = ['sw18','sw19','sw20','sw21','sw22','sw23'];
const MC_NEW_IDS = ['mc12','mc13','mc14','mc15'];
const AX_NEW_IDS = ['ax10'];
const TN_NEW_IDS = ['tn09','tn10'];
const DB_NEW_IDS = ['db37','db38','db39','db40','db41','db42','db43','db44','db45'];
const ALL_NEW_EXCLUSIFS = [...SW_NEW_IDS, ...MC_NEW_IDS, ...AX_NEW_IDS, ...TN_NEW_IDS, ...DB_NEW_IDS];

describe('Nouvelles figurines exclusives v12.7.34 (SW/MC/AX/TN/DB)', () => {
  it('22 nouvelles figurines présentes, avec tous les champs requis', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ALL_NEW_EXCLUSIFS.forEach(id => {
      const f = byId[id];
      expect(f, `figurine ${id} manquante`).toBeTruthy();
      ['name','uni','uk','em','color','gc','r','desc'].forEach(field => {
        expect(f[field], `${id}.${field}`).toBeTruthy();
      });
      expect(typeof f.desc).toBe('string');
      expect(f.desc.length).toBeGreaterThan(30);
    });
  });

  it('aucun id dupliqué avec les figurines existantes', () => {
    const api = loadGame(FILES);
    const ids = api.FIGURINES.map(f => f.id);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dups).toEqual([]);
  });

  it('toutes sont exclusives, verrouillées par complétion, PAYANTES (v12.7.37 : plus de prix 0), avec un indice clair', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ALL_NEW_EXCLUSIFS.forEach(id => {
      const f = byId[id];
      expect(f.r, `${id}.r`).toBe('exclusif');
      expect(f.p, `${id}.p`).toBeGreaterThan(0);
      expect(f.completionLock, `${id}.completionLock`).toBe(true);
      expect(f.unlockHint, `${id}.unlockHint`).toBeTruthy();
    });
  });

  it('les 22 nouveaux ids sont dans FIG_IMG_PRELOAD', () => {
    const api = loadGame(FILES);
    ALL_NEW_EXCLUSIFS.forEach(id => {
      expect(api.FIG_IMG_PRELOAD, `${id} absent de FIG_IMG_PRELOAD`).toContain(id);
    });
  });

  // v12.7.37 : posséder la collection de base rend les exclusifs ACHETABLES
  // (_isLicenseCompletionUnlocked), ne les ajoute plus automatiquement.
  it('Star Wars (17 de base) : posséder les 17 rend les 6 nouveaux exclusifs achetables', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'sw' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    SW_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
      expect(api.getP().ownedFigurines).not.toContain(id); // toujours pas possédées sans achat
    });
  });

  it('Star Wars : pas achetables s\'il manque un item de base', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'sw' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base.slice(0, -1);
    api.setP(p);
    SW_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(false);
    });
  });

  it('Cités d\'Or : posséder toute la collection de base rend les 4 nouveaux exclusifs achetables', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'mc' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    MC_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
    });
  });

  it('Tintin : posséder toute la collection de base rend les 2 nouveaux exclusifs achetables', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'tn' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    TN_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
    });
  });

  it('Astérix : posséder toute la collection de base rend le nouvel exclusif achetable', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'ax' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    AX_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
    });
  });

  it('Dragon Ball : posséder toute la collection de base rend achetables les 9 nouveaux + db12 + db36 (11 exclusifs)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'db' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    [...DB_NEW_IDS, 'db12', 'db36'].forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
    });
  });
});

describe('Migration V9 (v12.7.37) — retrait des figurines completionLock déjà offertes gratuitement', () => {
  it('validateProfile()/migrateProfile() retire une figurine completionLock possédée dans un profil ancien format', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', _v: 8, ownedFigurines: ['tl17', 'tl18', 'db12'] };
    const migrated = api.migrateProfile(raw);
    expect(migrated.ownedFigurines).toContain('tl17'); // figurine normale : conservée
    expect(migrated.ownedFigurines).not.toContain('tl18'); // completionLock : retirée
    expect(migrated.ownedFigurines).not.toContain('db12'); // completionLock : retirée
    expect(migrated._v).toBe(9);
  });

  it('ne touche pas un profil sans figurine completionLock', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', _v: 8, ownedFigurines: ['tl17', 'db01'] };
    const migrated = api.migrateProfile(raw);
    expect(migrated.ownedFigurines.sort()).toEqual(['db01', 'tl17']);
  });

  it('est idempotente (rejouer la migration sur un profil déjà en V9 ne change rien)', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', _v: 9, ownedFigurines: ['tl17'] };
    const migrated = api.migrateProfile(raw);
    expect(migrated.ownedFigurines).toEqual(['tl17']);
  });
});

describe('_maybeShowContentUpdate() — notification v12.7.34 (nouvelles figurines exclusives)', () => {
  it('affiche la modale des nouvelles figurines exclusives pour un profil ayant déjà vu update_2026_08_av_tl', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
    expect(overlay.innerHTML).toContain('Star Wars');
    expect(overlay.innerHTML).toContain('Dragon Ball');
  });

  it('marque update_2026_09_exclusifs comme vue après affichage', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    expect(api.getP().contentUpdatesSeen).toContain('update_2026_09_exclusifs');
  });
});

// v12.7.36 — bug signalé par Cyril : la notif se marquait "vue" AVANT même
// de tenter l'affichage, ce qui pouvait la faire disparaître sans jamais
// avoir été montrée. Et nouveaux points d'accroche (ouverture de matière,
// création d'Odyssée) en plus du clic sur CONTINUER existant.
describe('_maybeShowContentUpdate() — ne marque "vu" que si _showStoryModal a réellement pu être appelée (v12.7.36)', () => {
  // Test au niveau du code source : simuler l'absence réelle de _showStoryModal
  // dans le sandbox (fonction déclarée en top-level, non redéfinissable depuis
  // le test) n'est pas possible avec ce harness — on vérifie donc que le
  // "push" dans contentUpdatesSeen apparaît bien APRÈS le early-return sur
  // typeof _showStoryModal, jamais avant, dans la source réelle.
  it('le early-return sur typeof _showStoryModal précède bien le marquage "vu" dans le code', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '03-figurines-data.js'), 'utf8');
    const guardIdx = src.indexOf("typeof _showStoryModal !== 'function'){ _done(); return; }");
    const pushIdx = src.indexOf('P.contentUpdatesSeen.push(next.id);');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(pushIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(pushIdx);
  });
});

describe('Nouveaux points d\'accroche pour la notif "nouveau contenu" (v12.7.36)', () => {
  it('chooseSubject("math") affiche la notif non vue avant de rejoindre le menu 2', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    // v2 (audit AUD-01-010) : nouvelle notification ajoutée (règle des
    // exclusifs) — même principe que le commentaire v12.7.34 ci-dessus,
    // reconduit à chaque ajout de notification pour garder ces tests
    // "plus rien à afficher" valides.
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp', 'update_2026_09_regle_exclusifs'];
    // Ajoute artificiellement une annonce non vue pour isoler le test du
    // contenu réel de _CONTENT_UPDATES (qui grossira avec le temps).
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api.chooseSubject('math');
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
  });

  it('chooseSubject("math") ne bloque pas si tout est déjà vu (comportement inchangé)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    // v2 (audit AUD-01-010) : nouvelle notification ajoutée (règle des
    // exclusifs) — même principe que le commentaire v12.7.34 ci-dessus,
    // reconduit à chaque ajout de notification pour garder ces tests
    // "plus rien à afficher" valides.
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp', 'update_2026_09_regle_exclusifs'];
    api.setP(p);
    api.chooseSubject('math');
    expect(api.getGM().subject).toBe('math');
  });

  it('startAdventure("mat") (nouvelle Odyssée) affiche la notif non vue', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api.startAdventure('mat');
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
  });

  it('startAdventure("mat", true) (reprise via continueAdventure) NE déclenche PAS la notif', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl'];
    api.setP(p);
    api.startAdventure('mat', true);
    expect(api._createdElements().length).toBe(0);
  });
});

// v12.7.38 (demande de Cyril) — 8 nouvelles figurines exclusives : Mario Bros
// (mr09-mr11) et Harry Potter (hp13-hp17). Mêmes règles que v12.7.37 : jamais
// offertes, seulement achetables (500⭐) une fois la collection de base complète.
const MR_NEW_IDS = ['mr09','mr10','mr11'];
const HP_NEW_IDS = ['hp13','hp14','hp15','hp16','hp17'];
const ALL_NEW_EXCLUSIFS_V38 = [...MR_NEW_IDS, ...HP_NEW_IDS];

describe('Nouvelles figurines exclusives v12.7.38 (Mario Bros/Harry Potter)', () => {
  it('8 nouvelles figurines présentes, avec tous les champs requis', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ALL_NEW_EXCLUSIFS_V38.forEach(id => {
      const f = byId[id];
      expect(f, `figurine ${id} manquante`).toBeTruthy();
      ['name','uni','uk','em','color','gc','r','desc'].forEach(field => {
        expect(f[field], `${id}.${field}`).toBeTruthy();
      });
      expect(typeof f.desc).toBe('string');
      expect(f.desc.length).toBeGreaterThan(30);
    });
  });

  it('aucun id dupliqué avec les figurines existantes', () => {
    const api = loadGame(FILES);
    const ids = api.FIGURINES.map(f => f.id);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dups).toEqual([]);
  });

  it('toutes sont exclusives, verrouillées par complétion, payantes (500⭐), avec un indice clair', () => {
    const api = loadGame(FILES);
    const byId = Object.fromEntries(api.FIGURINES.map(f => [f.id, f]));
    ALL_NEW_EXCLUSIFS_V38.forEach(id => {
      const f = byId[id];
      expect(f.r, `${id}.r`).toBe('exclusif');
      expect(f.p, `${id}.p`).toBe(500);
      expect(f.completionLock, `${id}.completionLock`).toBe(true);
      expect(f.unlockHint, `${id}.unlockHint`).toBeTruthy();
    });
  });

  it('les 8 nouveaux ids sont dans FIG_IMG_PRELOAD', () => {
    const api = loadGame(FILES);
    ALL_NEW_EXCLUSIFS_V38.forEach(id => {
      expect(api.FIG_IMG_PRELOAD, `${id} absent de FIG_IMG_PRELOAD`).toContain(id);
    });
  });

  it('Mario Bros (8 de base) : posséder les 8 rend les 3 nouveaux exclusifs achetables', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'mr' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    MR_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
      expect(api.getP().ownedFigurines).not.toContain(id);
    });
  });

  it('Mario Bros : pas achetables s\'il manque un item de base', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'mr' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base.slice(0, -1);
    api.setP(p);
    MR_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(false);
    });
  });

  it('Harry Potter (12 de base) : posséder les 12 rend les 5 nouveaux exclusifs achetables', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'hp' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    api.setP(p);
    HP_NEW_IDS.forEach(id => {
      const f = api.FIGURINES.find(x => x.id === id);
      expect(api._isLicenseCompletionUnlocked(f), id).toBe(true);
    });
  });

  it('Harry Potter : achat effectif d\'une figurine exclusive une fois la collection complète', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    const base = api.FIGURINES.filter(f => f.uk === 'hp' && !f.completionLock).map(f => f.id);
    p.ownedFigurines = base;
    p.stars = 9999;
    api.setP(p);
    api.buyFigurine('hp13');
    expect(api.getP().ownedFigurines).toContain('hp13');
    expect(api.getP().stars).toBe(9999 - 500);
  });
});

describe('_maybeShowContentUpdate() — notification v12.7.38 (Mario Bros/Harry Potter)', () => {
  it('affiche la modale pour un profil ayant déjà vu les annonces précédentes', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
    expect(overlay.innerHTML).toContain('Mario Bros');
    expect(overlay.innerHTML).toContain('Harry Potter');
  });

  it('marque update_2026_09_mario_hp comme vue après affichage', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    expect(api.getP().contentUpdatesSeen).toContain('update_2026_09_mario_hp');
  });
});

// Non-régression AUD-01-010 : la migration V8→V9 retire silencieusement les
// figurines exclusives obtenues gratuitement sous l'ancien système, sans
// notification. Cette notification explique la nouvelle règle (achat, pas
// don automatique) à tous les joueurs.
describe('_maybeShowContentUpdate() — notification règle des exclusifs (AUD-01-010)', () => {
  it('affiche la modale pour un profil ayant déjà vu les 3 annonces précédentes', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('story-overlay');
    expect(overlay.innerHTML).toContain('acheter avec des étoiles');
  });

  it('marque update_2026_09_regle_exclusifs comme vue après affichage', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.contentUpdatesSeen = ['update_2026_08_av_tl', 'update_2026_09_exclusifs', 'update_2026_09_mario_hp'];
    api.setP(p);
    api._maybeShowContentUpdate(() => {});
    expect(api.getP().contentUpdatesSeen).toContain('update_2026_09_regle_exclusifs');
  });
});
