// AUD-02-027 (audit fonctionnel 2026-09-21) — saveBlockedSubjects() (09-parent.js)
// écrivait P.blockedSubjects/localStorage mais aucun point de jeu ne le relisait :
// un enfant pouvait jouer normalement dans une matière que son parent avait cochée
// comme interdite, sans le moindre message. chooseSubject() (01-core.js), seul point
// d'entrée d'une matière depuis l'écran "Choisis ta matière", applique désormais
// réellement ce blocage.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js'];

function setupGame(blockedSubjects) {
  const api = loadGame(FILES);
  api.setP({ name: 'Test', blockedSubjects });
  api.setGM({});
  return api;
}

describe('chooseSubject() applique réellement P.blockedSubjects', () => {
  it('une matière bloquée reste inaccessible : GM.subject n\'est pas modifié', () => {
    const api = setupGame(['fr']);
    api.getGM().subject = undefined;
    api.chooseSubject('fr');
    expect(api.getGM().subject).toBeUndefined();
  });

  it('une matière NON bloquée reste accessible normalement', () => {
    const api = setupGame(['fr']);
    api.chooseSubject('math');
    expect(api.getGM().subject).toBe('math');
  });

  it('sans aucune matière bloquée (cas par défaut), tout reste accessible', () => {
    const api = setupGame(undefined);
    api.chooseSubject('hist');
    expect(api.getGM().subject).toBe('hist');
  });

  it('les 3 matières implémentées (math/fr/hist) sont chacune bloquables indépendamment', () => {
    for (const subj of ['math', 'fr', 'hist']) {
      const api = setupGame([subj]);
      api.getGM().subject = null; // GM.subject vaut 'math' par défaut (01-core.js) : on neutralise pour isoler l'effet du blocage
      api.chooseSubject(subj);
      expect(api.getGM().subject).toBeNull(); // inchangé : le blocage a bien empêché l'affectation
    }
  });
});
