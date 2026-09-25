// Lot 3.4 (audit fonctionnel 2026-09-21, Phase 3) — confort parental.
//
// AUD-02-033 : un enfant bloqué par les horaires n'avait aucun moyen de
// déclencher une dérogation ponctuelle depuis son écran — le parent devait
// aller modifier manuellement les horaires (avec le risque réel d'oublier de
// les remettre ensuite). Dérogation temporaire (1h) via re-saisie du code
// parent, sur l'écran de blocage lui-même.
//
// AUD-02-047 : le résumé hebdomadaire ne montrait que les incidents de
// langage bloqués, rien sur le reste de la vie sociale (amis, échanges) ; la
// vue "conversations" en lecture seule masquait en plus les demandes reçues,
// visibles uniquement dans un panneau Options distinct.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const TB_FILES = ['01-core.js', '06b-time-block.js'];
const MSG_FILES = ['01-core.js', '17-messaging.js'];

describe('AUD-02-033 — dérogation horaire ponctuelle depuis l\'écran de blocage', () => {
  function blockedProfile(api) {
    api.setP({ name: 'Léo' });
    // cfg.start/end est la fenêtre AUTORISÉE (cf. showBlockScreen: "Jeu
    // autorisé entre X et Y") — isTimeBlocked() est vrai HORS de cette
    // fenêtre. Fenêtre d'1 minute calée 2h dans le futur : ne contient
    // jamais "maintenant", sans risque de flakiness autour de minuit.
    const future = new Date(Date.now() + 2 * 3600000);
    const hh = String(future.getHours()).padStart(2, '0');
    const mm = String(future.getMinutes()).padStart(2, '0');
    api._ls.setItem('block_Léo', JSON.stringify({ enabled: true, start: `${hh}:${mm}`, end: `${hh}:${mm}` }));
  }

  it('un code parent correct (requestTemporaryUnblock) active la dérogation et masque l\'écran', async () => {
    const api = loadGame(TB_FILES);
    blockedProfile(api);
    expect(api.isTimeBlocked()).toBe(true);
    api._domEl('time-block-screen').classList.remove('hidden');
    api.setShowPrompt((msg, onSubmit) => onSubmit('1234')); // code par défaut, aucun parentPin stocké
    await api.requestTemporaryUnblock();
    expect(api.isTimeBlocked()).toBe(false);
    expect(api._domEl('time-block-screen').classList.contains('hidden')).toBe(true);
  });

  it('un code parent incorrect n\'active aucune dérogation', async () => {
    const api = loadGame(TB_FILES);
    blockedProfile(api);
    api.setShowPrompt((msg, onSubmit) => onSubmit('0000')); // ≠ code par défaut 1234
    await api.requestTemporaryUnblock();
    expect(api.isTimeBlocked()).toBe(true);
    expect(api._blockOverrideActive('Léo')).toBe(false);
  });

  it('_blockOverrideActive() reflète un horodatage futur, pas un horodatage passé', () => {
    const api = loadGame(TB_FILES);
    api.setP({ name: 'Léo' });
    expect(api._blockOverrideActive('Léo')).toBe(false);
    api._ls.setItem('blockOverrideUntil_Léo', String(Date.now() + 60000));
    expect(api._blockOverrideActive('Léo')).toBe(true);
    api._ls.setItem('blockOverrideUntil_Léo', String(Date.now() - 1000));
    expect(api._blockOverrideActive('Léo')).toBe(false);
  });

  it('isTimeBlocked() renvoie false tant que la dérogation est active, même en pleine plage bloquée', () => {
    const api = loadGame(TB_FILES);
    blockedProfile(api);
    expect(api.isTimeBlocked()).toBe(true);
    api._ls.setItem('blockOverrideUntil_Léo', String(Date.now() + 60000));
    expect(api.isTimeBlocked()).toBe(false);
  });

  it('la dérogation est bien scopée par joueur (ne débloque pas un autre profil)', () => {
    const api = loadGame(TB_FILES);
    api.setP({ name: 'Zoé' });
    const future = new Date(Date.now() + 2 * 3600000);
    const hh = String(future.getHours()).padStart(2, '0');
    const mm = String(future.getMinutes()).padStart(2, '0');
    api._ls.setItem('block_Zoé', JSON.stringify({ enabled: true, start: `${hh}:${mm}`, end: `${hh}:${mm}` }));
    api._ls.setItem('blockOverrideUntil_Léo', String(Date.now() + 60000)); // dérogation d'un AUTRE profil
    expect(api.isTimeBlocked()).toBe(true); // Zoé reste bloquée
  });

});

describe('AUD-02-047 — activité sociale dans le résumé hebdomadaire', () => {
  const weekStart = new Date('2026-09-21T00:00:00').getTime();

  it('_weeklySocialStats() renvoie null si la messagerie n\'est pas active', async () => {
    const api = loadGame(MSG_FILES);
    const stats = await api._weeklySocialStats('Léo', weekStart); // chatEnabled=false par défaut
    expect(stats).toBeNull();
  });

  it('calcule amis/nouveaux amis/demandes en attente/messages échangés à partir des données réseau', async () => {
    const api = loadGame(MSG_FILES);
    // Active la messagerie localement (sans réseau) pour que chatEnabled/chatId existent.
    api._ls.setItem('chatProfiles', JSON.stringify({ Léo: { id: 'KID1', secret: 'sec12345678901234567890123', enabled: true, registered: true, seen: {}, ts: 0 } }));
    api.setChatFriendList(async () => ({
      ok: true,
      contacts: [
        { id: 'A', name: 'Ami ancien', created: weekStart - 10 * 86400000 },
        { id: 'B', name: 'Ami récent', created: weekStart + 86400000 },
      ],
      incoming: [{ id: 'C', name: 'En attente' }],
      outgoing: [], declined: [], blocked: [],
    }));
    api.setChatApi(async (path, body) => {
      expect(path).toBe('/msg/latest');
      expect(body.since).toBe(weekStart);
      return { ok: true, weekCount: 17 };
    });
    const stats = await api._weeklySocialStats('Léo', weekStart);
    expect(stats).toEqual({ friendsTotal: 2, newFriends: 1, incoming: 1, msgCount: 17 });
  });

  it('_fillWeeklySocialStats() remplit #wreport-social avec un texte lisible', async () => {
    const api = loadGame(MSG_FILES);
    api._ls.setItem('chatProfiles', JSON.stringify({ Léo: { id: 'KID1', secret: 'sec12345678901234567890123', enabled: true, registered: true, seen: {}, ts: 0 } }));
    api.setChatFriendList(async () => ({ ok: true, contacts: [{ id: 'A', name: 'Ami', created: 0 }], incoming: [], outgoing: [], declined: [], blocked: [] }));
    api.setChatApi(async () => ({ ok: true, weekCount: 3 }));
    await api._fillWeeklySocialStats('Léo', weekStart);
    const html = api._domEl('wreport-social').innerHTML;
    expect(html).toContain('1 ami');
    expect(html).toContain('3 message');
  });

  it('_fillWeeklySocialStats() vide le bloc si la messagerie n\'est pas active (rien à afficher)', async () => {
    const api = loadGame(MSG_FILES);
    await api._fillWeeklySocialStats('Léo', weekStart);
    expect(api._domEl('wreport-social').innerHTML).toBe('');
  });
});

describe('AUD-02-047 — unification des vues : demandes visibles même en lecture seule', () => {
  it('renderContactsScreen() en mode lecture seule affiche les demandes reçues, SANS les boutons d\'action', async () => {
    const api = loadGame(MSG_FILES);
    api.setMsgProf({ name: 'Léo', chatId: 'KID1', chatSecret: 'secret', chatEnabled: true, chatSeen: {} }, true); // readOnly=true
    api.setChatFriendList(async () => ({ ok: true, contacts: [], incoming: [{ id: 'C', name: 'Tom' }], outgoing: [], declined: [], blocked: [] }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).toContain('Tom');
    expect(html).toContain('Demandes reçues');
    expect(html).not.toContain('chatAcceptContact');
    expect(html).not.toContain('chatDeclineContact');
  });

  it('en mode normal (enfant), les boutons d\'action restent bien présents', async () => {
    const api = loadGame(MSG_FILES);
    api.setMsgProf({ name: 'Léo', chatId: 'KID1', chatSecret: 'secret', chatEnabled: true, chatSeen: {} }, false);
    api.setChatFriendList(async () => ({ ok: true, contacts: [], incoming: [{ id: 'C', name: 'Tom' }], outgoing: [], declined: [], blocked: [] }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).toContain('chatAcceptContact');
    expect(html).toContain('chatDeclineContact');
  });
});
