// AUD-02-034 (audit fonctionnel 2026-09-21) — "Réinitialiser TOUS les profils"
// (resetAllProfiles()/_resetAllConfirm(), 09-parent.js) exécute la remise à
// zéro immédiatement dès validation, sans jamais proposer d'exporter une
// sauvegarde au préalable — alors que la fonctionnalité d'export existe déjà
// dans le même onglet. _resetAllExportFirst() comble ce manque : un bouton
// d'export est désormais proposé dans la modale de confirmation elle-même.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '09-parent.js'];

describe('_resetAllExportFirst() — propose l\'export avant une réinitialisation totale', () => {
  it('appelle exportProfileFile() et affiche un statut de succès', () => {
    const api = loadGame(FILES);
    let called = false;
    api.setExportProfileFile(() => { called = true; });
    api._resetAllExportFirst();
    expect(called).toBe(true);
    expect(api._domEl('reset-all-export-status').innerHTML).toContain('exportée');
  });

  it('ne plante pas si exportProfileFile est indisponible (robustesse)', () => {
    const api = loadGame(FILES);
    expect(() => api._resetAllExportFirst()).not.toThrow();
  });
});

describe('resetAllProfiles() — la modale propose bien le bouton d\'export (source)', () => {
  it('le bouton _resetAllExportFirst() est câblé dans la modale de reset total', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '09-parent.js'), 'utf8');
    const fnStart = src.indexOf('function resetAllProfiles()');
    const fnBody = src.slice(fnStart, fnStart + 2500);
    expect(fnBody).toContain('_resetAllExportFirst()');
    expect(fnBody).toContain('reset-all-export-status');
  });
});
