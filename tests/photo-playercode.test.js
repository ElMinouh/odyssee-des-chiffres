import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js'];

describe('validateProfile : photo de profil (v11.6.6)', () => {
  it('accepte un data URL JPEG valide et raisonnable', () => {
    const api = loadGame(FILES);
    const photo = 'data:image/jpeg;base64,' + 'A'.repeat(1000);
    const out = api.validateProfile({ name: 'Léo', photo }, 'Léo');
    expect(out.photo).toBe(photo);
  });

  it('rejette (→ null) un data URL trop long plutôt que de le tronquer (éviterait une image corrompue)', () => {
    const api = loadGame(FILES);
    const photo = 'data:image/jpeg;base64,' + 'A'.repeat(300000);
    const out = api.validateProfile({ name: 'Léo', photo }, 'Léo');
    expect(out.photo).toBeNull();
  });

  it('rejette une chaîne qui ne ressemble pas à une image (protection basique)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo', photo: 'javascript:alert(1)' }, 'Léo');
    expect(out.photo).toBeNull();
  });

  it('un profil sans photo a bien photo=null', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo' }, 'Léo');
    expect(out.photo).toBeNull();
  });

  it('defProfile() initialise photo à null', () => {
    const api = loadGame(FILES);
    expect(api.defProfile('Zoé').photo).toBeNull();
  });
});

describe('validateProfile : code du profil à 2 chiffres (v11.6.6)', () => {
  it('accepte un code de 2 chiffres', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo', playerCode: '42' }, 'Léo');
    expect(out.playerCode).toBe('42');
  });

  it('rejette un code à 1 ou 3+ chiffres', () => {
    const api = loadGame(FILES);
    expect(api.validateProfile({ name: 'Léo', playerCode: '4' }, 'Léo').playerCode).toBeNull();
    expect(api.validateProfile({ name: 'Léo', playerCode: '123' }, 'Léo').playerCode).toBeNull();
  });

  it('rejette un code non numérique', () => {
    const api = loadGame(FILES);
    expect(api.validateProfile({ name: 'Léo', playerCode: 'ab' }, 'Léo').playerCode).toBeNull();
  });

  it('defProfile() initialise playerCode à null (confirmation simple par défaut)', () => {
    const api = loadGame(FILES);
    expect(api.defProfile('Zoé').playerCode).toBeNull();
  });
});
