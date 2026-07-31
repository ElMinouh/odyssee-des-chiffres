import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js'];

describe('validateProfile : bonus de +200⭐ à l\'épilogue (v11.6.5)', () => {
  it('ne crédite rien pour un profil sans épilogue vu', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo', stars: 10, storySeen: [] }, 'Léo');
    expect(out.stars).toBe(10);
    expect(out._epilogueBonusCredited).toEqual([]);
  });

  it('migration rétroactive : crédite 200⭐ pour un épilogue déjà vu avant l\'existence du bonus', () => {
    const api = loadGame(FILES);
    // Profil ancien : epilogue déjà dans storySeen, mais jamais crédité
    // (le champ _epilogueBonusCredited n'existait pas encore à l'époque).
    const out = api.validateProfile({ name: 'Léo', stars: 10, storySeen: ['epilogue'] }, 'Léo');
    expect(out.stars).toBe(210);
    expect(out._epilogueBonusCredited).toEqual(['epilogue']);
  });

  it('migration rétroactive : crédite un bonus PAR Odyssée déjà terminée (plusieurs épilogues)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'Léo', stars: 0,
      storySeen: ['epilogue', 'col_epilogue', 'primfr_epilogue'],
    }, 'Léo');
    expect(out.stars).toBe(600); // 3 × 200
    expect(out._epilogueBonusCredited.sort()).toEqual(['col_epilogue', 'epilogue', 'primfr_epilogue']);
  });

  it('ne recrédite JAMAIS un épilogue déjà marqué comme crédité', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'Léo', stars: 50,
      storySeen: ['epilogue'],
      _epilogueBonusCredited: ['epilogue'],
    }, 'Léo');
    expect(out.stars).toBe(50); // inchangé : déjà crédité précédemment
    expect(out._epilogueBonusCredited).toEqual(['epilogue']);
  });

  it('un profil totalement neuf a bien un tableau _epilogueBonusCredited vide', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Zoé');
    expect(p._epilogueBonusCredited).toEqual([]);
  });
});
