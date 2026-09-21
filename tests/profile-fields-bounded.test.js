// AUD-02-021 (audit fonctionnel 2026-09-21) — quests, weeklyChallenge et
// homework échappaient au bornage systématique appliqué à ~70 autres champs
// de validateProfile() (05-profile.js). En particulier, un `quests` corrompu
// (mauvais type) traversait intact et faisait planter renderQuests()
// (07-game.js, `P.quests.map(...)` sans vérification de type). Corrigé :
// les trois champs sont désormais typés/bornés comme le reste du profil.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js'];

describe('validateProfile() — quests borné (AUD-02-021)', () => {
  it('un quests corrompu (chaîne au lieu d\'un tableau) devient null, sans planter', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', quests: 'oups un texte' }, 'X');
    expect(out.quests).toBeNull();
  });

  it('un quests objet (pas tableau) devient null', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', quests: { not: 'an array' } }, 'X');
    expect(out.quests).toBeNull();
  });

  it('un tableau de quêtes bien formées est conservé et typé/borné', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'X',
      quests: [{ id: 'q_3win', label: 'Gagner 3 parties', goal: 3, key: 'wins', reward: 12, progress: 1, done: false }],
    }, 'X');
    expect(out.quests).toHaveLength(1);
    expect(out.quests[0]).toMatchObject({ id: 'q_3win', label: 'Gagner 3 parties', goal: 3, key: 'wins', reward: 12, progress: 1, done: false });
  });

  it('des entrées mal formées dans le tableau sont filtrées, pas l\'ensemble', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', quests: [null, 'texte', 42, { id: 'q_ok', label: 'OK', goal: 1, key: 'x', reward: 1 }] }, 'X');
    expect(out.quests).toHaveLength(1);
    expect(out.quests[0].id).toBe('q_ok');
  });

  it('absent (undefined/null) reste null (comportement inchangé)', () => {
    const api = loadGame(FILES);
    expect(api.validateProfile({ name: 'X' }, 'X').quests).toBeNull();
    expect(api.validateProfile({ name: 'X', quests: null }, 'X').quests).toBeNull();
  });
});

describe('validateProfile() — weeklyChallenge borné', () => {
  it('une valeur non-objet devient null', () => {
    const api = loadGame(FILES);
    expect(api.validateProfile({ name: 'X', weeklyChallenge: 'texte' }, 'X').weeklyChallenge).toBeNull();
    expect(api.validateProfile({ name: 'X', weeklyChallenge: [1, 2] }, 'X').weeklyChallenge).toBeNull();
  });

  it('un objet bien formé est typé/borné', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'X',
      weeklyChallenge: { id: 'wc1', label: 'Défi', target: 10, reward: 20, progress: 3, done: false },
    }, 'X');
    expect(out.weeklyChallenge).toEqual({ id: 'wc1', label: 'Défi', target: 10, reward: 20, progress: 3, done: false });
  });

  it('des valeurs hors bornes/mal typées sont neutralisées', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', weeklyChallenge: { target: 'pas un nombre', done: 'oui' } }, 'X');
    expect(out.weeklyChallenge.target).toBe(0);
    expect(out.weeklyChallenge.done).toBe(false);
  });
});

describe('validateProfile() — homework borné (au-delà du typage déjà existant)', () => {
  it('un tableau (au lieu d\'un objet) devient null', () => {
    const api = loadGame(FILES);
    expect(api.validateProfile({ name: 'X', homework: [1, 2, 3] }, 'X').homework).toBeNull();
  });

  it('un devoir bien formé est typé/borné', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({
      name: 'X',
      homework: { type: 'add', level: 'CE2', subject: 'math', count: 10, reward: 50, progress: 4, done: false, createdAt: 1700000000000 },
    }, 'X');
    expect(out.homework).toMatchObject({ type: 'add', level: 'CE2', subject: 'math', count: 10, reward: 50, progress: 4, done: false });
  });
});

describe('validateProfile() — champs critiques ajoutés à la liste blanche (AUD-02-022) survivent bien un rechargement', () => {
  it('blockedSubjects (AUD-02-027) survit à validateProfile()', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', blockedSubjects: ['fr', 'hist'] }, 'X');
    expect(out.blockedSubjects).toEqual(['fr', 'hist']);
  });

  it('chatFlags (AUD-02-046) survit à validateProfile()', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', chatFlags: [{ ts: 123, kind: 'blocked_word' }] }, 'X');
    expect(out.chatFlags).toEqual([{ ts: 123, kind: 'blocked_word' }]);
  });

  it('streak/streakLastDate survivent (bug du "repart à 1 à chaque rechargement" corrigé)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'X', streak: 7, streakLastDate: '2026-09-20' }, 'X');
    expect(out.streak).toBe(7);
    expect(out.streakLastDate).toBe('2026-09-20');
  });
});
