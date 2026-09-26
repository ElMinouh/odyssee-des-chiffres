import { describe, it, expect } from 'vitest';

// AUD-10-001 (audit pédagogique 2026-09-26) — endGame(true) était déclenché dès que
// l'enfant répondait au nombre de questions cible, quel que soit son taux de réussite
// (seule condition de défaite : PV à 0). Le crédit de progression de niveau
// (P.levelWins / P.levelWinsBySubj, base de UNLOCK_REQ/isUnlocked()) suivait cette
// même "victoire" sans aucun seuil de réussite minimal.
//
// Note : pas de test bout-en-bout via endGame() — comme déjà documenté dans
// stars-only-on-win.test.js, cette fonction a trop d'effets de bord DOM (confettis,
// audio, transitions) pour être instrumentée simplement dans ce harnais minimal.
// On vérifie donc, comme pour les autres correctifs d'endGame(), la condition au
// niveau source.
describe('endGame() — le crédit de levelWins exige un taux de réussite minimal (07-game.js)', () => {
  const readSrc = async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    return fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
  };

  it('un taux de réussite minimal (LEVEL_WIN_MASTERY_RATIO) conditionne désormais le crédit hors Combat', async () => {
    const src = await readSrc();
    expect(src).toContain("const _winMasteryOk = (GM.mode2==='combat') ? true : (");
    expect(src).toContain('((GS.qCount-(GS.errInGame||0))/GS.qCount) >= LEVEL_WIN_MASTERY_RATIO');
    expect(src).toContain("if(won&&_winMasteryOk&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone)){");
    // L'ancienne condition non gatée ne doit plus exister telle quelle.
    expect(src).not.toContain("if(won&&(GM.mode2==='normal'||GM.mode2==='combat'||GM.mapZone)){");
  });

  it('le mode Combat reste exempté du seuil (contexte de survie entre joueurs, cf. ADR-34)', async () => {
    const src = await readSrc();
    expect(src).toContain("(GM.mode2==='combat') ? true :");
  });
});

describe('LEVEL_WIN_MASTERY_RATIO — seuil pédagogique défini et documenté (06a-adaptive.js)', () => {
  it('le seuil est fixé à 0.6 et documenté comme lié à AUD-10-001', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '06a-adaptive.js'), 'utf8');
    expect(src).toContain('const LEVEL_WIN_MASTERY_RATIO = 0.6;');
    expect(src).toContain('AUD-10-001');
  });
});
