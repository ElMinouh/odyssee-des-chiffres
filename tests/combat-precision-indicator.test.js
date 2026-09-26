import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-013 (audit pédagogique 2026-09-26) — le score de combat (cp.score) mélange
// bonus de jeu (question dorée ×3, combo, objets) sans lien direct avec la précision
// réelle, ce qui biaisait la comparaison entre enfants au classement de fin de combat.
// cp.wrongAnswers (nouveau, en complément de cp.correctAnswers déjà suivi) permet
// d'afficher une précision distincte du score gamifié, sans changer le score ni
// l'ordre du classement lui-même.
const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '07-game.js', '08-ui.js', '09-parent.js', '10-figurines.js'];

describe('validateCombat() — suivi de la précision par joueur (07-game.js)', () => {
  it('une mauvaise réponse incrémente cp.wrongAnswers sans toucher cp.score', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Léo'));
    api.setGM({ mode2: 'combat' });
    const gs = api.getGS();
    gs.q = { res: 7 };
    api.combatPlayers.length = 0;
    api.combatPlayers.push(
      { name: 'A', pv: 3, alive: true, score: 5, correctAnswers: 2 },
      { name: 'B', pv: 3, alive: true, score: 0 },
    );
    api.validateCombat(999); // mauvaise réponse du joueur courant (A)
    expect(api.combatPlayers[0].wrongAnswers).toBe(1);
    expect(api.combatPlayers[0].score).toBe(5); // score gamifié inchangé
    expect(api.combatPlayers[0].correctAnswers).toBe(2); // pas altéré par l'échec
  });

  it("une bonne réponse n'affecte pas cp.wrongAnswers", () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Léo'));
    api.setGM({ mode2: 'combat' });
    const gs = api.getGS();
    gs.q = { res: 7 };
    api.combatPlayers.length = 0;
    api.combatPlayers.push(
      { name: 'A', pv: 3, alive: true, score: 0 },
      { name: 'B', pv: 3, alive: true, score: 0 },
    );
    api.validateCombat(7); // bonne réponse
    expect(api.combatPlayers[0].wrongAnswers || 0).toBe(0);
    expect(api.combatPlayers[0].correctAnswers).toBe(1);
  });

  it('le classement de fin de combat affiche une précision distincte du score (vérification source)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain('const _tot = (p.correctAnswers||0)+(p.wrongAnswers||0);');
    expect(src).toContain('${p.correctAnswers||0}/${_tot} 🎯');
  });
});
