// Lot 3.2 (audit fonctionnel 2026-09-21, Phase 3) — cohérence des règles
// secondaires du jeu.
//
// AUD-02-010 : potion et pouvoir de soin n'avaient AUCUN plafond de PV,
// contrairement à l'événement aléatoire de soin (plafonné à 8, une valeur
// arbitraire jamais atteignable) — incohérent avec la compétence achetable
// « Armure (+1❤️ max) ». _pvMax() (01-core.js) est désormais le point de
// vérité unique, réutilisé par les quatre sources de soin.
//
// AUD-02-013 : en mort subite (mode Combat), le streak de bonnes réponses
// consécutives n'était pas remis à zéro au moment où le nombre de joueurs
// vivants passe de 3 à 2 — un streak déjà accumulé pouvait déclencher une
// mort subite immédiate dès l'élimination du 3e joueur, sans vrai duel.
// (AUD-02-012, mode Combat toujours 3/3 étoiles, est documenté comme choix
// assumé dans ADR.md — aucun changement de code pour ce constat.)
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '07-game.js', '08-ui.js', '09-parent.js', '10-figurines.js'];

describe('AUD-02-010 — _pvMax() : plafond de PV commun à toutes les sources de soin', () => {
  it('_pvMax() vaut 3 sans Armure achetée', () => {
    const api = loadGame(FILES);
    api.setP(api.defProfile('Léo'));
    expect(api._pvMax()).toBe(3);
  });

  it('_pvMax() augmente d\'1 par Armure achetée (plafond réel : 3+3=6)', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.skills.shield = 3;
    api.setP(p);
    expect(api._pvMax()).toBe(6);
  });

  it('resetGS() initialise GS.pv à _pvMax(), pas un 3 fixe', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.skills.shield = 2;
    api.setP(p);
    api.resetGS();
    expect(api.getGS().pv).toBe(5);
  });

  it('une potion ne fait jamais dépasser _pvMax()', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Léo'); p.inventory = { potion: 1 };
    api.setP(p);
    api.resetGS();
    const gs = api.getGS();
    gs.pv = api._pvMax(); // déjà au plafond
    api.useItem('potion');
    expect(gs.pv).toBe(api._pvMax()); // pas au-delà
  });

  it('l\'événement "Soin Magique" utilise le même plafond que les autres sources (plus le 8 codé en dur)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("GS.pv=Math.min(GS.pv+1,_pvMax())");
    expect(src).not.toContain('Math.min(GS.pv+1,8)');
  });
});

describe('AUD-02-013 — mort subite : le streak repart de zéro à la transition 3→2 joueurs vivants', () => {
  function setupThreePlayers(api) {
    api.setP(api.defProfile('Léo'));
    api.setGM({ mode2: 'combat' });
    const gs = api.getGS();
    gs.suddenDeath = false;
    gs._noPVLossStreak = 5; // état artificiel : un streak déjà accumulé AVANT l'élimination
    gs.q = { res: 7 };
    api.combatPlayers.length = 0;
    api.combatPlayers.push(
      { name: 'A', pv: 1, alive: true, score: 0 }, // combatIdx=0 par défaut → c'est le joueur courant
      { name: 'B', pv: 3, alive: true, score: 0 },
      { name: 'C', pv: 3, alive: true, score: 0 },
    );
    return gs;
  }

  it('l\'élimination qui fait passer de 3 à 2 joueurs vivants remet le streak à zéro', () => {
    const api = loadGame(FILES);
    setupThreePlayers(api);
    api.validateCombat(999); // mauvaise réponse : A (pv:1) est éliminé
    expect(api.combatPlayers[0].alive).toBe(false);
    expect(api.combatPlayers.filter(p => p.alive).length).toBe(2);
    expect(api.getGS()._noPVLossStreak).toBe(0);
  });

  it('checkSuddenDeath() ne se déclenche PAS immédiatement après cette transition', () => {
    const api = loadGame(FILES);
    const gs = setupThreePlayers(api);
    api.validateCombat(999);
    expect(gs.suddenDeath).toBeFalsy();
  });

  it('un streak qui s\'accumule APRÈS la transition (vrai duel) déclenche bien la mort subite au 5e tour', () => {
    const api = loadGame(FILES);
    const gs = setupThreePlayers(api);
    api.validateCombat(999); // transition 3→2, streak remis à 0
    expect(gs.suddenDeath).toBeFalsy();
    // Simule 5 bonnes réponses consécutives du duel réel entre B et C.
    gs._noPVLossStreak = 5;
    api.checkSuddenDeath();
    expect(gs.suddenDeath).toBe(true);
  });
});
