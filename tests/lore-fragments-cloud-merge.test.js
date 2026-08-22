import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['12-cloud.js'];

// v12.5.0 (session 21, ADR-112) : loreFoundIdsByAdv est un nouveau champ de
// progression narrative persistant — ajouté à ODYSSEY_PROGRESS_FIELDS avec
// une vraie stratégie de fusion DÈS SA CRÉATION (règle ADR-111 pt.3, tirée
// de la découverte douloureuse d'ADR-108 : ne jamais laisser un tel champ
// fusionner "imported gagne" par défaut).
describe('_mergeCloudProfiles() — loreFoundIdsByAdv (fragments de lore)', () => {
  it('fusion normale (aucun reset) : union des ids trouvés, par Odyssée', () => {
    const api = loadGame(FILES);
    const local = {
      loreFoundIdsByAdv: { mat: ['mat_lore_1', 'mat_lore_2'] },
      adventureResetAt: 0,
    };
    const imported = {
      loreFoundIdsByAdv: { mat: ['mat_lore_2', 'mat_lore_3'], matfr: ['matfr_lore_1'] },
      adventureResetAt: 0,
    };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.loreFoundIdsByAdv.mat.sort()).toEqual(['mat_lore_1', 'mat_lore_2', 'mat_lore_3']);
    expect(out.loreFoundIdsByAdv.matfr).toEqual(['matfr_lore_1']);
  });

  it('ne perd jamais un id trouvé localement qui manquerait encore côté serveur (c\'est exactement le bug ADR-108, reproduit ici pour ce nouveau champ)', () => {
    const api = loadGame(FILES);
    const local = { loreFoundIdsByAdv: { mat: ['mat_lore_12'] }, adventureResetAt: 0 };
    const imported = { loreFoundIdsByAdv: { mat: [] }, adventureResetAt: 0 }; // serveur pas encore synchro
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.loreFoundIdsByAdv.mat).toContain('mat_lore_12');
  });

  it('reset d\'Odyssée local plus récent : loreFoundIdsByAdv repart de la valeur locale (vide après reset), pas d\'union avec l\'ancien', () => {
    const api = loadGame(FILES);
    const local = { loreFoundIdsByAdv: { mat: [] }, adventureResetAt: 9000 };
    const imported = { loreFoundIdsByAdv: { mat: ['mat_lore_1', 'mat_lore_2'] }, adventureResetAt: 1000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.loreFoundIdsByAdv.mat).toEqual([]);
  });

  it('reset d\'Odyssée côté serveur plus récent : loreFoundIdsByAdv suit la valeur importée', () => {
    const api = loadGame(FILES);
    const local = { loreFoundIdsByAdv: { mat: ['mat_lore_1'] }, adventureResetAt: 1000 };
    const imported = { loreFoundIdsByAdv: { mat: [] }, adventureResetAt: 9000 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.loreFoundIdsByAdv.mat).toEqual([]);
  });

  it('absent des deux côtés : ne plante pas, renvoie un objet vide', () => {
    const api = loadGame(FILES);
    const out = api._mergeCloudProfiles({ adventureResetAt: 0 }, { adventureResetAt: 0 });
    expect(out.loreFoundIdsByAdv).toEqual({});
  });
});
