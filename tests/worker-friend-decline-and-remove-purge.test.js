// AUD-02-042 / AUD-02-043 / AUD-02-044 (audit fonctionnel 2026-09-21).
//
// AUD-02-042 : friendDecline() supprimait simplement la ligne 'pending' — un
// refus était indiscernable, côté expéditeur, d'une absence totale de
// réponse. La ligne est désormais marquée 'declined' (jamais supprimée
// immédiatement), exposée par friendList() sous `declined`, et effaçable
// ensuite via /friend/cancel (réutilisé, plutôt qu'une route dédiée).
//
// AUD-02-043 : friendRemove() ne supprimait que la relation `contacts`,
// jamais l'historique de messages — qui ressurgissait intégralement en cas de
// réconciliation, alors que le message affiché au retrait laisse croire à une
// rupture propre et définitive.
//
// AUD-02-044 : la désactivation de la messagerie (chatDisableForProfile,
// 17-messaging.js) était purement locale, jamais communiquée au serveur — un
// ami restait un contact 'accepted' valide indéfiniment. La nouvelle route
// /account/setenabled synchronise `users.disabled`, exposé par friendList()
// (colonne `disabled` sur les contacts acceptés).
import { describe, it, expect } from 'vitest';
import worker from '../worker/odyssee-chat.js';
import { makeFakeD1 } from './helpers/fakeD1.js';

function makeEnv() {
  const d1 = makeFakeD1();
  const kvStore = new Map();
  return {
    ...d1,
    RATELIMIT: {
      async get(k) { return kvStore.has(k) ? kvStore.get(k) : null; },
      async put(k, v) { kvStore.set(k, v); },
    },
  };
}

function post(path, body) {
  return new Request('https://odyssee-chat.example.workers.dev' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://odyssee-des-chiffres.pages.dev' },
    body: JSON.stringify(body),
  });
}

describe('POST /friend/decline — un refus devient visible et distinct d\'un silence (AUD-02-042)', () => {
  it('la demande refusée apparaît dans `declined` chez l\'expéditeur, plus dans `outgoing`', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);

    const declineRes = await worker.fetch(post('/friend/decline', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);
    expect((await declineRes.json()).ok).toBe(true);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const listBody = await listRes.json();
    expect(listBody.outgoing.map(o => o.id)).not.toContain('KID2');
    expect(listBody.declined.map(d => d.id)).toContain('KID2');
  });

  it('/friend/cancel efface la notice "refusée" une fois lue', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/decline', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);

    await worker.fetch(post('/friend/cancel', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2' }), env);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const listBody = await listRes.json();
    expect(listBody.declined.map(d => d.id)).not.toContain('KID2');
  });

  it('une nouvelle demande après un refus relance normalement (n\'est plus bloquée sur "declined")', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/decline', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);

    const retryRes = await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    expect((await retryRes.json()).status).toBe('pending');

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID2', secret: 'secretB1secretB1' }), env);
    const listBody = await listRes.json();
    expect(listBody.incoming.map(i => i.id)).toContain('KID1'); // de nouveau visible côté destinataire
  });
});

describe('POST /friend/remove — purge l\'historique de conversation (AUD-02-043)', () => {
  async function becomeFriendsAndChat(env) {
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);
    await worker.fetch(post('/msg/send', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2', body: 'Salut !' }), env);
  }

  it('l\'historique disparaît après le retrait (ne ressurgit plus en cas de réconciliation)', async () => {
    const env = makeEnv();
    await becomeFriendsAndChat(env);
    expect(env._messages.length).toBe(1); // le message a bien été envoyé

    const removeRes = await worker.fetch(post('/friend/remove', { id: 'KID1', secret: 'secretA1secretA1', other: 'KID2' }), env);
    expect((await removeRes.json()).ok).toBe(true);
    expect(env._messages.length).toBe(0);

    // Réconciliation : redevenir amis ne doit PAS faire réapparaître l'ancien historique.
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);
    const fetchRes = await worker.fetch(post('/msg/fetch', { id: 'KID1', secret: 'secretA1secretA1', with: 'KID2', since: 0 }), env);
    const fetchBody = await fetchRes.json();
    expect(fetchBody.messages || []).toHaveLength(0);
  });
});

describe('POST /account/setenabled — état "injoignable" exposé aux amis (AUD-02-044)', () => {
  it('un ami désactivé apparaît avec disabled=1 dans la liste de contacts', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);

    const disableRes = await worker.fetch(post('/account/setenabled', { id: 'KID2', secret: 'secretB1secretB1', enabled: false }), env);
    expect((await disableRes.json()).ok).toBe(true);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const listBody = await listRes.json();
    const emma = listBody.contacts.find(c => c.id === 'KID2');
    expect(emma.disabled).toBe(1);
  });

  it('une réactivation efface l\'état "injoignable"', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);
    await worker.fetch(post('/account/setenabled', { id: 'KID2', secret: 'secretB1secretB1', enabled: false }), env);

    await worker.fetch(post('/account/setenabled', { id: 'KID2', secret: 'secretB1secretB1', enabled: true }), env);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const listBody = await listRes.json();
    const emma = listBody.contacts.find(c => c.id === 'KID2');
    expect(emma.disabled).toBe(0);
  });

  it('rejette sans authentification valide', async () => {
    const env = makeEnv();
    const res = await worker.fetch(post('/account/setenabled', { id: 'KID1', secret: 'mauvais', enabled: false }), env);
    expect(res.status).toBe(401);
  });
});
