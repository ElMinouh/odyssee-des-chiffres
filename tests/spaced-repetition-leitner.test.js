import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-024 (audit pédagogique 2026-09-26) — le système de révision espacée façon
// Leitner (ADR-30) est l'un des mécanismes pédagogiques les plus sophistiqués du
// jeu (cases 0-3, délais cibles 0/3h/1j/7j, rappel inter-session) mais n'était
// exercé par AUCUN test avant ce lot — un refactor futur pouvait le casser
// silencieusement sans faire échouer un seul des tests existants.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js'];

describe('logError() / clearErrorFromLog() — progression des cases Leitner', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ subject: 'math' });
  });

  it('une nouvelle erreur est journalisée en case 0', () => {
    api.logError('7 + 5', 12, { display: '7 + 5', res: 12, opKey: '+' }, 5000);
    const item = api.getP().errorLog.find(e => e.q === '7+5=12');
    expect(item.box).toBe(0);
    expect(item.inattention).toBe(false); // 5000ms >= seuil d'inattention (2000ms)
  });

  it('une réponse rapide et fausse (<2000ms) est marquée "inattention"', () => {
    api.logError('7 + 5', 12, { display: '7 + 5', res: 12, opKey: '+' }, 800);
    const item = api.getP().errorLog.find(e => e.q === '7+5=12');
    expect(item.inattention).toBe(true);
  });

  it('une nouvelle erreur sur une question déjà en case avancée la fait retomber en case 0', () => {
    api.logError('7 + 5', 12, { display: '7 + 5', res: 12, opKey: '+' }, 5000);
    api.getP().errorLog[0].box = 2; // consolidation déjà avancée
    api.logError('7 + 5', 12, { display: '7 + 5', res: 12, opKey: '+' }, 5000); // re-échec
    expect(api.getP().errorLog[0].box).toBe(0);
  });

  it('clearErrorFromLog() exige 2 bonnes réponses avant de passer à la case suivante', () => {
    api.logError('7 + 5', 12, { display: '7 + 5', res: 12, opKey: '+' }, 5000);
    api.clearErrorFromLog('7 + 5', 12); // 1ère bonne réponse : tries passe de 1 à 0... puis re-init à 2
    const item = api.getP().errorLog.find(e => e.q === '7+5=12');
    expect(item.box).toBe(1);
    expect(item.tries).toBe(2); // 2 bonnes réponses nécessaires à la nouvelle case
  });

  it('à la case maximale, une réussite programme une vérification finale différée avant retrait', () => {
    const item = { q: '7+5=12', t: Date.now(), tries: 1, box: 3, subj: 'math', inattention: false, failStreak: 0 };
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    api.clearErrorFromLog('7 + 5', 12);
    const stillThere = api.getP().errorLog.find(e => e.q === '7+5=12');
    expect(stillThere).toBeTruthy();
    expect(stillThere.pendingFinalCheck).toBe(true);
  });

  it('la vérification finale réussie retire vraiment la question du suivi', () => {
    const item = { q: '7+5=12', t: Date.now(), tries: 1, box: 3, subj: 'math', pendingFinalCheck: true };
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    api.clearErrorFromLog('7 + 5', 12);
    expect(api.getP().errorLog.find(e => e.q === '7+5=12')).toBeUndefined();
  });
});

describe('getRevisionErrorToAsk() — respecte les délais cibles des cases Leitner', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ subject: 'math' });
  });

  it("une erreur en case 1 (délai cible 3h) n'est jamais reposée avant 70% de ce délai", () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const item = { q: '7+5=12', t: now - 60 * 60 * 1000, tries: 2, box: 1, subj: 'math', inattention: false }; // 1h < 70% de 3h
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    // force:true ignore le seuil de déclenchement global, mais pas le "pas encore due" des cases hautes
    const result = api.getRevisionErrorToAsk();
    expect(result).toBeNull();
    vi.restoreAllMocks();
  });

  it('une erreur en case 1 largement en retard est éligible en mode forcé (rappel inter-session)', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const item = { q: '7+5=12', t: now - 10 * 24 * 60 * 60 * 1000, tries: 2, box: 1, subj: 'math', inattention: false }; // 10 jours de retard
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    const result = api.getRevisionErrorToAsk({ force: true });
    expect(result).toBeTruthy();
    expect(result.isRevision).toBe(true);
    vi.restoreAllMocks();
  });

  it('une erreur "inattention" suit une courbe rapprochée, indépendante de sa case', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    // case 3 (délai cible 7j) mais marquée inattention : doit suivre la courbe rapide, pas le délai de 7j.
    const item = { q: '7+5=12', t: now - 6 * 60 * 1000, tries: 2, box: 3, subj: 'math', inattention: true }; // 6 min
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    const result = api.getRevisionErrorToAsk({ force: true });
    expect(result).toBeTruthy(); // éligible immédiatement, contrairement à ce qu'imposerait la case 3
    vi.restoreAllMocks();
  });

  it("ne reroule jamais 2 fois de suite la même question", () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const items = [
      { q: '7+5=12', t: now - 10 * 24 * 60 * 60 * 1000, tries: 2, box: 1, subj: 'math', inattention: false },
    ];
    api.setP({ ...api.defProfile('TestKid'), errorLog: items });
    const first = api.getRevisionErrorToAsk({ force: true });
    expect(first).toBeTruthy();
    const second = api.getRevisionErrorToAsk({ force: true }); // seule candidate déjà "dernière posée"
    expect(second).toBeNull();
    vi.restoreAllMocks();
  });

  it('un QCM journalisé avec son instantané (payload) est rejoué tel quel', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const payload = { display: 'Quel mot ?', choices: [{ val: 1, label: 'chat' }], res: 1, opKey: 'fr-orth' };
    const item = { q: 'quelmot=1', t: now - 10 * 24 * 60 * 60 * 1000, tries: 2, box: 1, subj: 'math', inattention: false, payload };
    api.setP({ ...api.defProfile('TestKid'), errorLog: [item] });
    const result = api.getRevisionErrorToAsk({ force: true });
    expect(result.choices).toEqual(payload.choices);
    expect(result.isRevision).toBe(true);
    vi.restoreAllMocks();
  });
});

describe('checkInterSessionRevision() — rappel au retour après une absence', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ subject: 'math' });
  });

  it('aucun rappel lors de la toute première partie (lastPlayTs absent)', () => {
    expect(api.checkInterSessionRevision()).toBe(0);
  });

  it("aucun rappel si l'enfant a joué il y a moins d'un jour", () => {
    api.getP().lastPlayTs = Date.now() - 60 * 60 * 1000; // 1h
    api.getP().errorLog = [{ q: 'a=1', t: Date.now(), box: 0, subj: 'math' }];
    expect(api.checkInterSessionRevision()).toBe(0);
  });

  it("force jusqu'à 3 révisions au retour après ≥1 jour d'absence, plafonné au nombre d'erreurs en attente", () => {
    api.getP().lastPlayTs = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 jours
    api.getP().errorLog = [
      { q: 'a=1', t: Date.now(), box: 0, subj: 'math' },
      { q: 'b=2', t: Date.now(), box: 0, subj: 'math' },
    ];
    expect(api.checkInterSessionRevision()).toBe(2); // 2 erreurs en attente, plafond 3 non atteint
  });

  it('ne compte que les erreurs de la matière du jour', () => {
    api.getP().lastPlayTs = Date.now() - 3 * 24 * 60 * 60 * 1000;
    api.getP().errorLog = [
      { q: 'a=1', t: Date.now(), box: 0, subj: 'fr' },
      { q: 'b=2', t: Date.now(), box: 0, subj: 'fr' },
    ];
    api.setGM({ subject: 'math' });
    expect(api.checkInterSessionRevision()).toBe(0);
  });
});
