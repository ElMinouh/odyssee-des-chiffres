import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['12-cloud.js'];

// v12.7.0 (ADR-113) : le trait de héros devient propre à chaque Odyssée —
// ajouté à ODYSSEY_PROGRESS_FIELDS avec une vraie stratégie de fusion DÈS
// SA CRÉATION (règle ADR-111 pt.3), pour ne jamais reproduire le bug
// ADR-108 sur ce nouveau champ (deux appareils répondant chacun au
// questionnaire d'une Odyssée différente ne doivent jamais s'écraser).
describe('_mergeCloudProfiles() — heroTrait{Approche,Moteur,Style}ByAdv', () => {
  it('fusion normale : les traits de 2 Odyssées différentes répondues sur 2 appareils se combinent', () => {
    const api = loadGame(FILES);
    const local = { heroTraitApprocheByAdv: { mat: 'brave' }, adventureResetAt: 0 };
    const imported = { heroTraitApprocheByAdv: { colfr: 'malin' }, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.heroTraitApprocheByAdv).toEqual({ mat: 'brave', colfr: 'malin' });
  });

  it('en cas de conflit sur la même Odyssée, la valeur locale l\'emporte (comme majorChoiceByAdv)', () => {
    const api = loadGame(FILES);
    const local = { heroTraitMoteurByAdv: { mat: 'protecteur' }, adventureResetAt: 0 };
    const imported = { heroTraitMoteurByAdv: { mat: 'ambitieux' }, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.heroTraitMoteurByAdv.mat).toBe('protecteur');
  });

  it('ne perd jamais un trait répondu localement mais pas encore reçu côté serveur', () => {
    const api = loadGame(FILES);
    const local = { heroTraitStyleByAdv: { col: 'determine' }, adventureResetAt: 0 };
    const imported = { heroTraitStyleByAdv: {}, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.heroTraitStyleByAdv.col).toBe('determine');
  });

  it('reset d\'Odyssée local plus récent : les 3 maps repartent de la valeur locale (vide après reset)', () => {
    const api = loadGame(FILES);
    const local = { heroTraitApprocheByAdv: {}, heroTraitMoteurByAdv: {}, heroTraitStyleByAdv: {}, adventureResetAt: 9000 };
    const imported = { heroTraitApprocheByAdv: { mat: 'brave' }, heroTraitMoteurByAdv: { mat: 'protecteur' }, heroTraitStyleByAdv: { mat: 'determine' }, adventureResetAt: 1000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.heroTraitApprocheByAdv).toEqual({});
    expect(out.heroTraitMoteurByAdv).toEqual({});
    expect(out.heroTraitStyleByAdv).toEqual({});
  });

  it('absent des deux côtés : ne plante pas, renvoie un objet vide', () => {
    const api = loadGame(FILES);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.heroTraitApprocheByAdv).toEqual({});
    expect(out.heroTraitMoteurByAdv).toEqual({});
    expect(out.heroTraitStyleByAdv).toEqual({});
  });
});
