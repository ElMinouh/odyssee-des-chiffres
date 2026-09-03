import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['12-cloud.js'];

// v12.7.33 (dette technique, demande de Cyril) : _pushOtherProfileToCloud()
// (modération parentale sur un profil non actif sur cet appareil — retrait
// de figurine, correction du solde d'étoiles) n'avait aucun mécanisme de
// retry en cas d'échec réseau. La correction reste alors bloquée en local
// jusqu'à ce que le profil ciblé redevienne actif sur CET appareil — ce qui
// peut ne jamais arriver si le parent gère depuis un appareil que l'enfant
// n'utilise pas.
//
// Note : dans ce harnais de test, fetch/_cloudFetch échoue TOUJOURS (pas de
// réseau, AbortController non stubé) — c'est justement le chemin qu'on veut
// exercer ici : _pushOtherProfileToCloud() doit systématiquement retomber
// dans la file d'attente plutôt que de planter ou d'abandonner silencieusement.
describe('File d\'attente de retry pour _pushOtherProfileToCloud() (12-cloud.js)', () => {
  it('un échec de push ajoute le nom du profil à la file, sans planter', async () => {
    const api = loadGame(FILES);
    const profileData = { name: 'Peyo', cloudCode: 'PEYO-1234', cloudEnabled: true };
    const ok = await api._pushOtherProfileToCloud(profileData);
    expect(ok).toBe(false);
    expect(api._getPendingOtherPushes()).toContain('Peyo');
  });

  it('_addPendingOtherPush() ne doublonne jamais un même nom', () => {
    const api = loadGame(FILES);
    api._addPendingOtherPush('Peyo');
    api._addPendingOtherPush('Peyo');
    api._addPendingOtherPush('Soren');
    const names = api._getPendingOtherPushes();
    expect(names.filter(n => n === 'Peyo').length).toBe(1);
    expect(names).toContain('Soren');
  });

  it('_removePendingOtherPush() retire bien un nom précis, laisse les autres', () => {
    const api = loadGame(FILES);
    api._addPendingOtherPush('Peyo');
    api._addPendingOtherPush('Soren');
    api._removePendingOtherPush('Peyo');
    const names = api._getPendingOtherPushes();
    expect(names).not.toContain('Peyo');
    expect(names).toContain('Soren');
  });

  it('_flushPendingOtherProfilePushes() retire de la file un profil supprimé entre-temps, sans planter', async () => {
    const api = loadGame(FILES);
    api._addPendingOtherPush('ProfilSupprime');
    // Pas de localStorage['user_ProfilSupprime'] — simule un profil supprimé
    await expect(api._flushPendingOtherProfilePushes()).resolves.not.toThrow();
    expect(api._getPendingOtherPushes()).not.toContain('ProfilSupprime');
  });

  it('_flushPendingOtherProfilePushes() retire de la file un profil dont le cloud a été désactivé entre-temps', async () => {
    const api = loadGame(FILES);
    api._ls.setItem('user_Peyo', JSON.stringify({ name: 'Peyo', cloudEnabled: false }));
    api._addPendingOtherPush('Peyo');
    await api._flushPendingOtherProfilePushes();
    expect(api._getPendingOtherPushes()).not.toContain('Peyo');
  });

  it('_flushPendingOtherProfilePushes() retente un profil toujours cloud-actif (reste en file tant que le réseau échoue)', async () => {
    const api = loadGame(FILES);
    api._ls.setItem('user_Peyo', JSON.stringify({ name: 'Peyo', cloudCode: 'PEYO-1234', cloudEnabled: true }));
    api._addPendingOtherPush('Peyo');
    await api._flushPendingOtherProfilePushes();
    // Réseau toujours indisponible dans ce harnais : la tentative échoue de
    // nouveau, mais _pushOtherProfileToCloud() se recharge elle-même de la
    // file (voir test du haut) — le nom reste donc présent.
    expect(api._getPendingOtherPushes()).toContain('Peyo');
  });
});
