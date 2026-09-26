import { describe, it, expect } from 'vitest';

// AUD-10-007 et AUD-10-009 (audit pédagogique 2026-09-26).
//
// Note : pas de test bout-en-bout via startTimer() — comme endGame()/startGame()
// déjà documentés dans stars-only-on-win.test.js, cette fonction pilote
// requestAnimationFrame et de nombreux éléments DOM sans rapport pour ce harnais
// minimal. Vérification au niveau source, comme pour les autres correctifs de
// 07-game.js.
describe('startTimer() — un exercice de lecture/compréhension peut être exempté de chrono (AUD-10-007)', () => {
  it("q.noTimePressure déclenche le même chemin que le réglage parent \"illimité\"", async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("if(_tScale===Infinity || (GS.q && GS.q.noTimePressure)){");
  });

  it('les 3 générateurs de lecture fine du français (phase 3) posent bien ce flag', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '16-francais.js'), 'utf8');
    const occurrences = src.split('q.noTimePressure=true;').length - 1;
    expect(occurrences).toBe(3); // _frD_genre, _frD_spell, _frB_flash
  });
});

describe("startTimer() — un seul signal d'urgence sonore/textuel en moins pour CP/CE1/CE2 (AUD-10-009)", () => {
  it('la réplique moqueuse de fin de chrono est désormais conditionnée au niveau', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("const _youngLevel = (typeof GM!=='undefined' && ['CP','CE1','CE2'].includes(GM.level));");
    expect(src).toContain("if(!_youngLevel && !_timerTauntFired){_timerTauntFired=true;monsterSpeak(TIMER_TAUNTS[ri(0,TIMER_TAUNTS.length-1)],2000);}");
  });

  it('les signaux visuels (fond urgence, cœur) restent inchangés pour tous les niveaux', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("if(!GS.readingDisruptionActive) $('BODY').classList.add('body-alert','urgency-bg');");
    expect(src).toContain("if(heart)heart.style.display='inline';");
  });
});
