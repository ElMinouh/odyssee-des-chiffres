import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js',
  '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

// Note : pas de test bout-en-bout via endGame() — comme déjà noté dans
// journal-callback-variety.test.js, cette fonction a trop d'effets de bord
// DOM sans rapport pour être instrumentée simplement. On vérifie donc au
// niveau source que le bloc fautif (champ f.rarity, jamais présent sur
// aucune figurine) a bien été retiré, pas seulement corrigé.
describe('v12.7.13 — Retrait du drop de figurine rare au boss (mécanisme jamais fonctionnel)', () => {
  it('le code source de 07-game.js ne référence plus le champ inexistant f.rarity', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).not.toContain('f.rarity');
    expect(src).not.toContain('RARE_LIKE');
  });

  it('aucune figurine du jeu ne porte de champ "rarity" (seul "r" existe) — confirme que le bug n\'a plus de prise', () => {
    const api = loadGame(FILES);
    api.FIGURINES.forEach(f => {
      expect(f.rarity).toBeUndefined();
    });
  });
});

describe('v12.7.13 — Fusion SHOP_LICENSES ← UNIVERS_LIST (source unique)', () => {
  it('_buildShopLicenses() contient exactement les 3 entrées spéciales + toutes les licences de UNIVERS_LIST', () => {
    const api = loadGame(FILES);
    const built = api._buildShopLicenses();
    const keys = built.map(l => l.k);
    expect(keys.slice(0, 3)).toEqual(['none', 'all', 'mine']);
    const universKeys = api.UNIVERS_LIST.map(u => u.k);
    expect(keys.slice(3)).toEqual(universKeys);
  });

  it('une licence hypothétique ajoutée UNIQUEMENT à UNIVERS_LIST apparaît automatiquement dans la boutique', () => {
    const api = loadGame(FILES);
    api.UNIVERS_LIST.push({ k: 'zz', label: 'Licence Test' });
    const built = api._buildShopLicenses();
    expect(built.some(l => l.k === 'zz')).toBe(true);
    api.UNIVERS_LIST.pop();
  });

  it('les 3 exceptions (nj, mv, sx) gardent leur libellé/icône boutique historique', () => {
    const api = loadGame(FILES);
    const built = api._buildShopLicenses();
    const byKey = Object.fromEntries(built.map(l => [l.k, l.label]));
    expect(byKey.nj).toBe('🥷 Ninjago');
    expect(byKey.mv).toBe('🦸 Marvel');
    expect(byKey.sx).toBe('🎂 Saisonnier');
  });

  it('une licence normale (ex. Dragon Ball) est dérivée de UNI_ICON + UNIVERS_LIST sans divergence', () => {
    const api = loadGame(FILES);
    const built = api._buildShopLicenses();
    const db = built.find(l => l.k === 'db');
    expect(db.label).toBe(`${api.UNI_ICON.db} Dragon Ball`);
  });

  it('la boutique affiche toujours av et tl (non-régression du bug déjà corrigé)', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Test'));
    api._renderFigurinesShop('none');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('Avatar');
    expect(html).toContain('Tobie Lolness');
  });
});
