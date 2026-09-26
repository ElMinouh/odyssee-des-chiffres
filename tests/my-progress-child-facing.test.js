import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-018 (audit pédagogique 2026-09-26) — l'enfant n'avait accès à sa propre
// progression que via le récap de LA session en cours, jamais une vue consolidée.
// renderMyProgress() (08-ui.js), affiché dans l'onglet "Révisions et paliers" du
// tableau de bord (accessible sans PIN parent, contrairement à la Vue Parent),
// réutilise analyzeOpProfile()/analyzeCatProfile() pour un résumé exclusivement
// positif — jamais un classement ni une liste de faiblesses brute.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '08-ui.js'];

describe('renderMyProgress() (08-ui.js)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); api.setP(api.defProfile('TestKid')); });

  it("sans aucune donnée : message d'encouragement générique", () => {
    api.renderMyProgress();
    expect(api._domEl('p-myprogress').innerHTML).toContain('Joue encore un peu');
  });

  it('avec un écart net en maths : mentionne le point fort ET la piste de travail', () => {
    api.getP().opStats = { '+': { ok: 18, fail: 2 } /*90%*/, '-': { ok: 12, fail: 8 } /*60%*/ };
    api.renderMyProgress();
    const html = api._domEl('p-myprogress').innerHTML;
    expect(html).toContain('additions');
    expect(html).toContain('soustractions');
  });

  it('sans écart net en maths : message positif générique, pas de comparaison', () => {
    api.getP().opStats = { '+': { ok: 14, fail: 6 } /*70%*/, '-': { ok: 13, fail: 7 } /*65%*/ };
    api.renderMyProgress();
    const html = api._domEl('p-myprogress').innerHTML;
    expect(html).toContain('tu progresses bien');
  });

  it('inclut le français si des données existent pour cette matière', () => {
    api.getP().opStatsFr = { conj: { ok: 15, fail: 5 }, orth: { ok: 6, fail: 14 } };
    api.renderMyProgress();
    expect(api._domEl('p-myprogress').innerHTML).toContain('français');
  });

  it('ne mentionne jamais un pourcentage brut ni un classement (texte exclusivement positif)', () => {
    api.getP().opStats = { '+': { ok: 5, fail: 15 } }; // 25% de réussite, une seule opération
    api.renderMyProgress();
    const html = api._domEl('p-myprogress').innerHTML;
    expect(html).not.toMatch(/%/);
    expect(html).not.toMatch(/classement|faible/i);
  });

  it('ne plante jamais sur un profil incomplet', () => {
    api.setP({ name: 'Vide' });
    expect(() => api.renderMyProgress()).not.toThrow();
  });
});

describe("stab('milestones') — déclenche bien renderMyProgress() (vérification source)", () => {
  it('la fonction est appelée dans stab()', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '01-core.js'), 'utf8');
    expect(src).toContain("if(name==='milestones'){ if(typeof renderMyProgress==='function')renderMyProgress();");
  });
});
