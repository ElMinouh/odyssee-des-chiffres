// AUD-02-007 / AUD-02-008 (audit fonctionnel 2026-09-21) — nextTurn() (07-game.js) est
// rappelée par hitPlayer() après une mauvaise réponse, uniquement pour afficher la
// question suivante. Avant ce correctif, elle réexécutait à chaque erreur tout le bloc
// de mise en place d'un combat : les PV du monstre/boss étaient entièrement régénérés
// (AUD-02-007, tout niveau >= CE1 où HP_LVL>1, boss ou non), et en mode classique la
// vérification de fin de partie déclarait une victoire dès que le compteur de questions
// atteignait sa cible, sans jamais vérifier que le monstre avait 0 PV (AUD-02-008).
//
// Note : comme documenté pour validate() (tests/validate-characterization.test.js) et pour
// la formule de PV du boss (tests/boss-hp-questions-alignment.test.js), nextTurn() a trop
// d'effets de bord navigateur (performance.now() via startTimer, canvas/confetti via
// endGame->startConfetti, speechSynthesis...) pour être appelée bout-en-bout dans ce
// harnais minimal. On vérifie donc (1) au niveau source que le garde-fou existe et est
// placé AVANT les points qui causaient les deux bugs, et (2) le comportement de la même
// logique de décision reproduite fidèlement, sur les scénarios concrets du signalement.
import { describe, it, expect } from 'vitest';

describe('AUD-02-007/008 — garde-fou présent et correctement positionné dans nextTurn() (07-game.js)', () => {
  const readSrc = async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    return fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
  };

  it('nextTurn() contient le court-circuit de continuation avant tout le reste', async () => {
    const src = await readSrc();
    expect(src).toContain('if(GS._turnSetupDone && GS.monsterHP>0){');
  });

  it('le court-circuit est positionné AVANT la vérification de fin de partie (celle qui déclenchait AUD-02-008)', async () => {
    const src = await readSrc();
    const idxShortcut = src.indexOf('if(GS._turnSetupDone && GS.monsterHP>0){');
    const idxEndGameCheck = src.indexOf("GS.qCount>=_qTarget)return endGame(true);");
    expect(idxShortcut).toBeGreaterThan(-1);
    expect(idxEndGameCheck).toBeGreaterThan(-1);
    expect(idxShortcut).toBeLessThan(idxEndGameCheck);
  });

  it('le court-circuit est positionné AVANT la réinitialisation des PV/état du boss (celle qui causait AUD-02-007)', async () => {
    const src = await readSrc();
    const idxShortcut = src.indexOf('if(GS._turnSetupDone && GS.monsterHP>0){');
    const idxHpReset = src.indexOf('GS.monsterMaxHP=GS.isBoss?(GS.questionsTarget||(HP_LVL[GM.level]+2)):HP_LVL[GM.level];GS.monsterHP=GS.monsterMaxHP;');
    expect(idxHpReset).toBeGreaterThan(-1);
    expect(idxShortcut).toBeLessThan(idxHpReset);
  });

  it('_turnSetupDone est bien marqué vrai à la fin de la VRAIE mise en place d\'une rencontre', async () => {
    const src = await readSrc();
    expect(src).toContain('GS._turnSetupDone=true;');
  });

  it('_turnSetupDone est réinitialisé à chaque resetGS() (01-core.js), pour ne jamais fuiter d\'une partie à l\'autre', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const coreSrc = fs.readFileSync(path.join(process.cwd(), 'js', '01-core.js'), 'utf8');
    const fnBody = coreSrc.slice(coreSrc.indexOf('function resetGS()'), coreSrc.indexOf('function resetGS()') + 700);
    expect(fnBody).toContain('_turnSetupDone:false');
  });
});

describe('AUD-02-007/008 — comportement de la logique de décision reproduite fidèlement', () => {
  // Reproduit exactement la structure de nextTurn() telle que corrigée : le court-circuit
  // de continuation d'abord, sinon la mise en place complète d'un nouveau tour (dont la
  // vérification de fin de partie, dont on sait maintenant qu'elle ne peut plus être
  // atteinte pendant un combat de boss non résolu).
  function simulateNextTurn(gs, { qTarget = 6, mode2 = 'normal' } = {}) {
    const events = [];
    if (gs._turnSetupDone && gs.monsterHP > 0) {
      events.push('continuation:new-question');
      return { gs, events };
    }
    if (mode2 === 'normal' && gs.qCount >= qTarget) {
      events.push('endGame(true)'); // AUD-02-008 : ne doit plus jamais être atteint boss vivant
      return { gs, events };
    }
    // ... mise en place complète (hors périmètre de cette reproduction : seule la
    // séquence de décision compte ici, déjà couverte au niveau source ci-dessus).
    events.push('full-setup:hp-reset');
    gs.monsterHP = gs.monsterMaxHP;
    gs._turnSetupDone = true;
    return { gs, events };
  }

  it('combat de boss en cours (monstre vivant, _turnSetupDone vrai) : simple continuation, PV intouchés', () => {
    const gs = { _turnSetupDone: true, monsterHP: 2, monsterMaxHP: 5, qCount: 6 };
    const { gs: out, events } = simulateNextTurn(gs);
    expect(events).toEqual(['continuation:new-question']);
    expect(out.monsterHP).toBe(2); // PAS régénéré
  });

  it('qCount déjà à la cible MAIS boss encore vivant (scénario exact d\'AUD-02-008) : pas de victoire prématurée', () => {
    const gs = { _turnSetupDone: true, monsterHP: 1, monsterMaxHP: 3, qCount: 6 };
    const { events } = simulateNextTurn(gs, { qTarget: 6 });
    expect(events).not.toContain('endGame(true)');
    expect(events).toEqual(['continuation:new-question']);
  });

  it('monstre vaincu (monsterHP<=0) et qCount pas encore à la cible : vraie mise en place d\'un nouveau tour', () => {
    const gs = { _turnSetupDone: true, monsterHP: 0, monsterMaxHP: 2, qCount: 2 };
    const { events } = simulateNextTurn(gs, { qTarget: 6 });
    expect(events).toEqual(['full-setup:hp-reset']);
  });

  it('monstre vaincu ET qCount à la cible (fin de partie normale légitime) : la victoire reste atteignable', () => {
    const gs = { _turnSetupDone: true, monsterHP: 0, monsterMaxHP: 2, qCount: 6 };
    const { events } = simulateNextTurn(gs, { qTarget: 6 });
    expect(events).toEqual(['endGame(true)']);
  });

  it('toute première rencontre (_turnSetupDone encore faux, monsterHP par défaut de resetGS()=1) : vraie mise en place', () => {
    const gs = { _turnSetupDone: false, monsterHP: 1, monsterMaxHP: 1, qCount: 0 };
    const { events } = simulateNextTurn(gs, { qTarget: 6 });
    expect(events).toEqual(['full-setup:hp-reset']);
  });
});
