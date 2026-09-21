// AUD-02-041 (audit fonctionnel 2026-09-21) — une demande d'ami envoyée restait
// invisible et impossible à annuler : le Worker odyssee-chat renvoyait déjà
// `outgoing` (friendList()) mais rien côté client ne le lisait, et aucune
// route ne permettait à l'expéditeur de retirer sa propre demande (seul
// /friend/decline existait, côté DESTINATAIRE). /friend/cancel comble ce
// manque, symétriquement à /friend/decline.
//
// Premier test automatisé pour ce Worker (aucun n'existait jusqu'ici, cf.
// audit technique AUD-01 section C7) : utilise un mock D1 minimal
// (tests/helpers/fakeD1.js) et appelle le point d'entrée public fetch(),
// comme le ferait un vrai client — pas les fonctions internes (non exportées).
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

describe('POST /friend/cancel — annule une demande d\'ami envoyée, encore en attente', () => {
  it('retire la demande : elle disparaît de outgoing() chez l\'expéditeur', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');

    const reqRes = await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    expect((await reqRes.json()).ok).toBe(true);

    let listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    let listBody = await listRes.json();
    expect(listBody.outgoing.map(o => o.id)).toContain('KID2');

    const cancelRes = await worker.fetch(post('/friend/cancel', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2' }), env);
    expect((await cancelRes.json()).ok).toBe(true);

    listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    listBody = await listRes.json();
    expect(listBody.outgoing.map(o => o.id)).not.toContain('KID2');
  });

  it('la demande annulée disparaît aussi des demandes reçues (incoming) du destinataire', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/cancel', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2' }), env);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID2', secret: 'secretB1secretB1' }), env);
    const listBody = await listRes.json();
    expect(listBody.incoming.map(i => i.id)).not.toContain('KID1');
  });

  it('n\'affecte pas une demande déjà acceptée (ne désamie pas silencieusement)', async () => {
    const env = makeEnv();
    env._seedUser('KID1', 'secretA1secretA1', 'Léo');
    env._seedUser('KID2', 'secretB1secretB1', 'Emma');
    await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);

    await worker.fetch(post('/friend/cancel', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2' }), env);

    const listRes = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const listBody = await listRes.json();
    expect(listBody.contacts.map(c => c.id)).toContain('KID2'); // toujours amis
  });

  it('rejette sans authentification valide', async () => {
    const env = makeEnv();
    const res = await worker.fetch(post('/friend/cancel', { id: 'KID1', secret: 'mauvais', to: 'KID2' }), env);
    expect(res.status).toBe(401);
  });
});
