// AUD-02-047 (audit fonctionnel 2026-09-21, Lot 3.4) — côté serveur.
// msgLatest() expose désormais un compteur optionnel de messages échangés
// depuis un horodatage (weekCount), et friendList() expose la date
// d'acceptation d'un contact (created) — deux briques nécessaires au résumé
// hebdomadaire d'activité sociale côté client (17-messaging.js).
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

async function becomeFriends(env) {
  env._seedUser('KID1', 'secretA1secretA1', 'Léo');
  env._seedUser('KID2', 'secretB1secretB1', 'Emma');
  await worker.fetch(post('/friend/request', { id: 'KID1', secret: 'secretA1secretA1', code: 'KID2' }), env);
  await worker.fetch(post('/friend/accept', { id: 'KID2', secret: 'secretB1secretB1', from: 'KID1' }), env);
}

describe('POST /msg/latest — weekCount (AUD-02-047)', () => {
  it('sans `since`, le comportement existant (latest) est inchangé, weekCount absent/nul', async () => {
    const env = makeEnv();
    await becomeFriends(env);
    await worker.fetch(post('/msg/send', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2', body: 'Salut' }), env);
    const res = await worker.fetch(post('/msg/latest', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.latest.KID2).toBeTruthy();
    expect(body.weekCount).toBe(0); // since absent → 0, jamais une erreur
  });

  it('avec `since`, compte uniquement les messages envoyés APRÈS cet horodatage', async () => {
    const env = makeEnv();
    await becomeFriends(env);
    await worker.fetch(post('/msg/send', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2', body: 'Ancien message' }), env);
    const cutoff = Date.now() + 10;
    await new Promise(r => setTimeout(r, 15));
    await worker.fetch(post('/msg/send', { id: 'KID1', secret: 'secretA1secretA1', to: 'KID2', body: 'Nouveau 1' }), env);
    await worker.fetch(post('/msg/send', { id: 'KID2', secret: 'secretB1secretB1', to: 'KID1', body: 'Nouveau 2' }), env);
    const res = await worker.fetch(post('/msg/latest', { id: 'KID1', secret: 'secretA1secretA1', since: cutoff }), env);
    const body = await res.json();
    expect(body.weekCount).toBe(2); // les 2 nouveaux, pas l'ancien
  });

  it('ne compte que les conversations impliquant réellement l\'appelant', async () => {
    const env = makeEnv();
    await becomeFriends(env);
    env._seedUser('KID3', 'secretC1secretC1', 'Tom');
    await worker.fetch(post('/friend/request', { id: 'KID2', secret: 'secretB1secretB1', code: 'KID3' }), env);
    await worker.fetch(post('/friend/accept', { id: 'KID3', secret: 'secretC1secretC1', from: 'KID2' }), env);
    await worker.fetch(post('/msg/send', { id: 'KID2', secret: 'secretB1secretB1', to: 'KID3', body: 'Conversation sans KID1' }), env);
    const res = await worker.fetch(post('/msg/latest', { id: 'KID1', secret: 'secretA1secretA1', since: 0 }), env);
    const body = await res.json();
    expect(body.weekCount).toBe(0);
  });
});

describe('POST /friend/list — contacts.created (AUD-02-047)', () => {
  it('expose la date d\'acceptation pour chaque contact', async () => {
    const env = makeEnv();
    await becomeFriends(env);
    const res = await worker.fetch(post('/friend/list', { id: 'KID1', secret: 'secretA1secretA1' }), env);
    const body = await res.json();
    const emma = body.contacts.find(c => c.id === 'KID2');
    expect(typeof emma.created).toBe('number');
    expect(emma.created).toBeGreaterThan(0);
  });
});
