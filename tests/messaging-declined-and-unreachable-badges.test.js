// AUD-02-042 / AUD-02-044 (audit fonctionnel 2026-09-21) — côté client.
//
// renderContactsScreen() (17-messaging.js) doit désormais distinguer une
// demande refusée d'une demande toujours en attente (AUD-02-042), et signaler
// un ami "injoignable" quand sa messagerie a été désactivée durablement côté
// serveur (AUD-02-044). chatFriendList() est un appel réseau (_chatApi),
// non stubbable via AbortController dans ce sandbox minimal (même limite déjà
// documentée pour _chatSend/chatMsgSend) : on le remplace directement via
// api.setChatFriendList() pour tester le RENDU, indépendamment du réseau.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '17-messaging.js'];

function setupProf(api) {
  api.setMsgProf({ name: 'Léo', chatId: 'KID1', chatSecret: 'secret', chatEnabled: true, chatSeen: {} });
}

describe('renderContactsScreen() — état "injoignable" (AUD-02-044)', () => {
  it('affiche un badge "injoignable" pour un ami dont la messagerie est désactivée côté serveur', async () => {
    const api = loadGame(FILES);
    setupProf(api);
    api.setChatFriendList(async () => ({ ok: true, contacts: [{ id: 'KID2', name: 'Emma', avatar: '🧙', disabled: 1 }], incoming: [], outgoing: [], declined: [], blocked: [] }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).toContain('injoignable');
    expect(html).toContain('Emma');
  });

  it('n\'affiche aucun badge pour un ami dont la messagerie reste active', async () => {
    const api = loadGame(FILES);
    setupProf(api);
    api.setChatFriendList(async () => ({ ok: true, contacts: [{ id: 'KID2', name: 'Emma', avatar: '🧙', disabled: 0 }], incoming: [], outgoing: [], declined: [], blocked: [] }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).not.toContain('injoignable');
    expect(html).toContain('Emma');
  });
});

describe('renderContactsScreen() — demande refusée distincte d\'une demande en attente (AUD-02-042)', () => {
  it('affiche une demande refusée avec un libellé distinct, séparée des demandes en attente', async () => {
    const api = loadGame(FILES);
    setupProf(api);
    api.setChatFriendList(async () => ({ ok: true, contacts: [], incoming: [], outgoing: [], declined: [{ id: 'KID3', name: 'Tom', avatar: '🧙' }], blocked: [] }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).toContain('a refusé');
    expect(html).toContain('Tom');
    expect(html).not.toContain('en attente…');
  });

  it('affiche bien les deux sections en parallèle sans les confondre', async () => {
    const api = loadGame(FILES);
    setupProf(api);
    api.setChatFriendList(async () => ({
      ok: true, contacts: [], incoming: [],
      outgoing: [{ id: 'KID4', name: 'Zoé', avatar: '🧙' }],
      declined: [{ id: 'KID3', name: 'Tom', avatar: '🧙' }],
      blocked: [],
    }));
    await api.renderContactsScreen();
    const html = api._domEl('msg-body').innerHTML;
    expect(html).toContain('Zoé');
    expect(html).toContain('en attente…');
    expect(html).toContain('Tom');
    expect(html).toContain('a refusé');
  });
});
