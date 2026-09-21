// AUD-02-023 / AUD-02-024 (audit fonctionnel 2026-09-21) — l'espace parent
// n'offrait aucune visibilité sur la synchronisation cloud : (024) un échec ne
// produisait ni toast ni alerte visible (seul console.warn), un parent pouvait
// croire la sauvegarde active pendant des semaines alors qu'elle échouait
// silencieusement ; (023) une fusion réussie ne montrait jamais CE QUI avait
// changé — seul un toast fugace de 3s en cas de conflit. Corrigé : un compteur
// d'échecs consécutifs déclenche une alerte visible après 3 tentatives
// ratées, et chaque fusion appliquée au profil actif laisse un résumé en
// clair consultable via getCloudStatus().
import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '05-profile.js', '12-cloud.js'];

describe('pushProfileToCloud() — alerte visible après plusieurs échecs consécutifs (AUD-02-024)', () => {
  it('n\'alerte pas après un seul échec (évite le bruit sur un simple aléa réseau)', async () => {
    const api = loadGame(FILES);
    api.setP({ name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true });
    await api.pushProfileToCloud(); // échoue forcément (pas de vrai réseau dans ce bac à sable)
    expect(api.getCloudStatus().failStreak).toBe(1);
    expect(api._domEl('toast').innerText || '').not.toContain('Sauvegarde cloud impossible');
  });

  it('alerte (toast) après 3 échecs consécutifs, une seule fois', async () => {
    const api = loadGame(FILES);
    api.setP({ name: 'TestKid', cloudCode: 'ABCD1234', cloudEnabled: true });
    await api.pushProfileToCloud();
    await api.pushProfileToCloud();
    expect(api._domEl('toast').innerText || '').not.toContain('Sauvegarde cloud impossible');
    await api.pushProfileToCloud(); // 3e échec : seuil atteint
    expect(api.getCloudStatus().failStreak).toBe(3);
    expect(api._domEl('toast').innerText).toContain('Sauvegarde cloud impossible');
    // Un 4e échec ne doit pas re-déclencher le toast (déjà réinitialisé entre
    // temps par le test suivant à chaque nouvel appel de loadGame() — ici on
    // vérifie juste l'absence de re-déclenchement dans la MÊME série).
    api._domEl('toast').innerText = '';
    await api.pushProfileToCloud();
    expect(api._domEl('toast').innerText || '').toBe('');
  });

  it('le compteur d\'échecs est remis à zéro après un succès (source — best-effort non testable bout-en-bout sans réseau)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '12-cloud.js'), 'utf8');
    expect(src).toContain('_cloudFailStreak = 0;');
    expect(src).toContain('_cloudFailAlerted = false;');
  });
});

describe('_importProfileFromServer() — résumé en clair de ce qui a changé lors de la fusion (AUD-02-023)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  // Le solde d'étoiles est dérivé du ledger (_totalStarsEarned - _totalStarsSpent,
  // ADR-118) — jamais du champ brut "stars" — et les autres champs (heroStageId,
  // mapAvatarZone...) reçoivent des valeurs par défaut via validateProfile().
  // On part donc d'un profil réaliste (defProfile) des DEUX côtés, identique
  // sauf sur le champ qu'on fait varier, pour ne comparer QUE ce champ.

  it('signale un gain d\'étoiles (dérivé du ledger, pas du champ stars brut)', async () => {
    const local = api.defProfile('TestKid');
    local.stars = 100; local._totalStarsEarned = 100;
    api.setP(local);
    const imported = api.defProfile('TestKid');
    imported.stars = 250; imported._totalStarsEarned = 250;
    await api._importProfileFromServer(imported);
    const summary = api.getCloudStatus().lastMergeSummary;
    expect(summary.some(l => l.includes('Étoiles') && l.includes('100') && l.includes('250'))).toBe(true);
  });

  it('signale les figurines reçues d\'un autre appareil', async () => {
    const local = api.defProfile('TestKid');
    local.ownedFigurines = ['a'];
    api.setP(local);
    const imported = api.defProfile('TestKid');
    imported.ownedFigurines = ['a', 'b', 'c'];
    await api._importProfileFromServer(imported);
    const summary = api.getCloudStatus().lastMergeSummary;
    expect(summary.some(l => l.includes('figurine'))).toBe(true);
  });

  it('ne signale rien si la fusion n\'a rien changé (pas de bruit inutile)', async () => {
    const local = api.defProfile('TestKid');
    api.setP(local);
    const imported = api.defProfile('TestKid');
    await api._importProfileFromServer(imported);
    expect(api.getCloudStatus().lastMergeSummary).toEqual([]);
  });

  it('la synchronisation cloud (panneau parent) reste accessible même sans changement notable', async () => {
    // Non-régression : getCloudStatus() reste appelable et ne plante jamais,
    // même profil minimal.
    api.setP({ name: 'TestKid', cloudCode: 'ABCD1234' });
    await api._importProfileFromServer({ name: 'TestKid' });
    expect(() => api.getCloudStatus()).not.toThrow();
  });
});
