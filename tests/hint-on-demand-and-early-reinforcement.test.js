import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-026 (audit pédagogique 2026-09-26) — l'aide (hint) n'apparaissait
// qu'APRÈS une réponse fausse. showHintOnDemand() permet de la demander AVANT
// de répondre, sans pénalité de vie/score, mais neutralise le bonus de combo
// de cette question (GS._hintUsed) pour ne pas en faire un contournement gratuit.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '13-maternelle.js', '07-game.js'];

describe('showHintOnDemand() (01-core.js)', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ level: 'CE1' });
    api.setGS({ q: { display: '7 + 5', res: 12, hint: 'Pars de 7 et avance de 5.' }, answering: false });
  });

  it('affiche le hint dans #correction sans attendre une erreur', () => {
    api.showHintOnDemand();
    const el = api._domEl('correction');
    expect(el.innerHTML).toContain('Pars de 7 et avance de 5.');
    expect(el.classList.contains('hidden')).toBe(false);
  });

  it('marque GS._hintUsed pour neutraliser le bonus combo de cette question', () => {
    api.showHintOnDemand();
    expect(api.getGS()._hintUsed).toBe(true);
  });

  it("ne fait rien en maternelle (mécanisme d'aide progressive déjà propre à ce cycle)", () => {
    api.setGM({ level: 'PS' });
    api.showHintOnDemand();
    expect(api.getGS()._hintUsed).toBeFalsy();
  });

  it("ne plante pas si la question n'a pas de hint", () => {
    api.setGS({ q: { display: '7 + 5', res: 12 }, answering: false });
    expect(() => api.showHintOnDemand()).not.toThrow();
    expect(api.getGS()._hintUsed).toBeFalsy();
  });

  it("ne fait rien pendant le traitement d'une réponse (GS.answering)", () => {
    api.setGS({ q: { display: '7 + 5', res: 12, hint: 'x' }, answering: true });
    api.showHintOnDemand();
    expect(api.getGS()._hintUsed).toBeFalsy();
  });
});

describe('renderQ() — GS._hintUsed remis à zéro à chaque nouvelle question (vérification source)', () => {
  it('renderQ() réinitialise bien le flag', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain('GS._hintUsed=false;');
  });
});

describe('validate() — bonus combo ×2 neutralisé quand un indice a été utilisé (vérification source)', () => {
  it("la condition inclut désormais !GS._hintUsed", async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("if(GS.combo>=10 && !GS._hintUsed){pts*=2;$('gc').classList.add('combo-breaker');}");
  });
});

// AUD-10-025 — renforcement du raisonnement même sur bonne réponse, pour une
// notion encore fragile (≤3 réussites sur cet opérateur).
describe('validate() — renforcement du raisonnement sur les premières réussites (vérification source)', () => {
  it("un toast affiche le hint lors des 3 premières réussites sur un opérateur, jamais si un indice a déjà été montré", async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain('const _earlyMastery = P.opStats[opK].ok<=3;');
    expect(src).toContain("if(_earlyMastery && !GS._hintUsed && q.hint && typeof toast==='function') toast('💡 '+q.hint, 2200);");
  });
});
