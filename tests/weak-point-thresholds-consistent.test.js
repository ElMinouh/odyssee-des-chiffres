// AUD-02-031 (audit fonctionnel 2026-09-21) — trois calculs différents de
// "point faible" pouvaient se contredire dans le même écran Suivi : le
// bandeau global de renderReport() (opStats cumulatif, seuil t>2 && ok/t<.7)
// et le conseil de la semaine de _weeklyAdvice() (MÊME donnée opStats
// cumulative, mais seuil t>5 && ok/t<.6) pouvaient diverger sur la même
// opération. Le troisième (progression par notion, _progPanelHtml(),
// 06a-adaptive.js) porte sur une donnée différente (yearProgress, par
// niveau) — scope légitimement distinct, clarifié par un texte explicite
// plutôt qu'unifié de force.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '09-parent.js'];

describe('_weeklyAdvice() — seuil "opération faible" aligné sur le bandeau global de renderReport()', () => {
  it('un opérateur à 3 tentatives / 67% de réussite est signalé faible par les deux calculs (ancien seuil weeklyAdvice : non signalé)', () => {
    const api = loadGame(FILES);
    // Réplique exacte du calcul du bandeau (renderReport(), 09-parent.js:471) :
    const opStats = { '+': { ok: 2, fail: 1 } }; // t=3, ok/t=0.666...
    const bandeauWeak = Object.entries(opStats).filter(([, s]) => { const t = s.ok + s.fail; return t > 2 && s.ok / t < .7; });
    expect(bandeauWeak.length).toBe(1); // le bandeau le signale

    const advice = api._weeklyAdvice({ activeDays: 5, total: 10 }, {}, opStats, []);
    expect(advice).toContain('Renforcer'); // le conseil de la semaine le signale AUSSI désormais
  });

  it('un opérateur sain (>=70% de réussite) n\'est signalé par aucun des deux', () => {
    const api = loadGame(FILES);
    const opStats = { '+': { ok: 8, fail: 2 } }; // t=10, 80%
    const advice = api._weeklyAdvice({ activeDays: 5, total: 10 }, {}, opStats, []);
    expect(advice).not.toContain('Renforcer');
  });

  it('priorité aux erreurs récurrentes reste inchangée (non-régression)', () => {
    const api = loadGame(FILES);
    const advice = api._weeklyAdvice({ activeDays: 5, total: 10 }, {}, {}, [{ q: '3+4=?', count: 4 }]);
    expect(advice).toContain('Réviser');
  });
});

describe('_progPanelHtml() weakBox — précise explicitement sa portée (source)', () => {
  it('le texte de clarification "indépendant du bilan global" est présent dans le code', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '06a-adaptive.js'), 'utf8');
    expect(src).toContain('indépendant du bilan global');
  });
});
