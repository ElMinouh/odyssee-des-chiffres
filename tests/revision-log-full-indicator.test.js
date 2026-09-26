import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-027 (audit pédagogique 2026-09-26) — le journal de révision espacée
// (P.errorLog) est plafonné à SPACED_MAX_LOG=30 entrées ; au-delà, les lacunes
// les plus anciennes/consolidées cessent silencieusement d'être suivies, sans
// aucun signal au parent — précisément pour l'enfant qui en aurait le plus
// besoin (difficulté généralisée sur de nombreuses notions à la fois).
const FILES = ['01-core.js', '02-data.js', '06a-adaptive.js', '09-parent.js'];

function profileWithErrorLog(n) {
  return {
    history: [{ date: '01/01', score: 10, won: true }],
    errorLog: Array.from({ length: n }, (_, i) => ({ q: `q${i}=1`, box: 0 })),
  };
}

describe("renderReport() — indicateur quand le journal de révision est plein (09-parent.js)", () => {
  it('affiche un avertissement quand errorLog atteint SPACED_MAX_LOG (30)', () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify(profileWithErrorLog(30)) });
    api._domEl('parent-player').value = 'TestKid';
    api.renderReport();
    const html = api._domEl('report-content').innerHTML;
    expect(html).toContain('Suivi de révision plein');
    expect(html).toContain('30/30');
  });

  it("n'affiche rien quand le journal est sous le plafond", () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify(profileWithErrorLog(5)) });
    api._domEl('parent-player').value = 'TestKid';
    api.renderReport();
    const html = api._domEl('report-content').innerHTML;
    expect(html).not.toContain('Suivi de révision plein');
  });

  it("ne plante pas si errorLog est absent (ancien profil)", () => {
    const p = profileWithErrorLog(0); delete p.errorLog;
    const api = loadGame(FILES, { user_TestKid: JSON.stringify(p) });
    api._domEl('parent-player').value = 'TestKid';
    expect(() => api.renderReport()).not.toThrow();
  });
});
