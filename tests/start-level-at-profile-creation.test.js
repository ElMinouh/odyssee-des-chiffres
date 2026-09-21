// AUD-02-001 (audit fonctionnel 2026-09-21) — tout nouveau profil démarrait
// systématiquement en CP (defProfile(), 05-profile.js), quel que soit l'âge
// réel de l'enfant déclaré à la création : un enfant de CM2 devait rejouer
// tout le primaire (12 victoires cumulées, CE1+CE2+CM1) avant d'atteindre son
// vrai niveau. Un parent peut désormais choisir le niveau de départ
// (pm-new-level, index.html) au moment d'ajouter un profil ; ce choix est
// mémorisé puis appliqué au tout premier chargement réel du profil.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '07-game.js', '08-ui.js', '09-parent.js'];

describe('_applyStartLevel() — débloque le niveau choisi SANS court-circuiter isUnlocked()', () => {
  it('crédite les victoires des niveaux précédents au seuil exact (levelWins ET levelWinsBySubj)', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    api._applyStartLevel(profile, 'CM2');
    expect(profile.prefs.level).toBe('CM2');
    // isUnlocked(next) compare levelWins[précédent] à UNLOCK_REQ[next] : on
    // crédite donc chaque niveau du seuil exigé par le SUIVANT dans la chaîne.
    // UNLOCK_REQ : CE1:3, CE2:5, CM1:4, CM2:5.
    expect(profile.levelWins.CP).toBe(3);  // débloque CE1
    expect(profile.levelWins.CE1).toBe(5); // débloque CE2
    expect(profile.levelWins.CE2).toBe(4); // débloque CM1
    expect(profile.levelWins.CM1).toBe(5); // débloque CM2
    expect(profile.levelWinsBySubj.math.CE1).toBe(5);
    expect(profile.levelWinsBySubj.fr.CM1).toBe(5);
  });

  it('le niveau choisi est réellement isUnlocked() après application (pas juste prefs.level)', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    api._applyStartLevel(profile, 'CM2');
    api.setP(profile);
    expect(api.isUnlocked('CM2')).toBe(true);
    expect(api.isUnlocked('CM2', 'math')).toBe(true);
    expect(api.isUnlocked('CM2', 'fr')).toBe(true);
  });

  it('ne fait rien pour CP (tête de cursus, déjà débloqué par défaut)', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    const before = JSON.stringify(profile.levelWins);
    api._applyStartLevel(profile, 'CP');
    expect(JSON.stringify(profile.levelWins)).toBe(before);
    expect(profile.prefs.level).toBe('CP');
  });

  it('fonctionne aussi pour le cursus collège (tête 6E, indépendant du primaire)', () => {
    const api = loadGame(FILES);
    const profile = api.defProfile('Léo');
    api._applyStartLevel(profile, '4E');
    api.setP(profile);
    expect(api.isUnlocked('4E')).toBe(true);
    expect(profile.levelWins.CP).toBe(0); // cursus primaire non affecté (valeur par défaut de defProfile(), inchangée)
  });
});

describe('_setPendingStartLevel() / _consumePendingStartLevel() — mémorisation ponctuelle', () => {
  it('round-trip simple', () => {
    const api = loadGame(FILES);
    api._setPendingStartLevel('Léo', 'CE2');
    expect(api._consumePendingStartLevel('Léo')).toBe('CE2');
  });

  it('consommé une seule fois : la deuxième lecture renvoie null', () => {
    const api = loadGame(FILES);
    api._setPendingStartLevel('Léo', 'CE2');
    api._consumePendingStartLevel('Léo');
    expect(api._consumePendingStartLevel('Léo')).toBeNull();
  });

  it('CP n\'est jamais mémorisé (rien à consommer, comportement déjà correct par défaut)', () => {
    const api = loadGame(FILES);
    api._setPendingStartLevel('Léo', 'CP');
    expect(api._consumePendingStartLevel('Léo')).toBeNull();
  });
});

describe('loadProfile() — applique le niveau en attente UNIQUEMENT pour un profil réellement neuf', () => {
  it('un profil neuf avec un niveau en attente démarre débloqué à ce niveau', () => {
    const api = loadGame(FILES);
    api._setPendingStartLevel('Léo', 'CM1');
    api._domEl('playerSelect').value = 'Léo';
    api.loadProfile();
    expect(api.getP().prefs.level).toBe('CM1');
    expect(api.isUnlocked('CM1')).toBe(true);
  });

  it('un profil DÉJÀ existant ignore un niveau en attente resté orphelin (jamais touché)', () => {
    const api = loadGame(FILES);
    const existing = api.defProfile('Léo');
    existing.prefs.level = 'CE1';
    existing.xp = 500; // marqueur qu'il s'agit bien du profil existant, pas d'un nouveau
    api._ls.setItem('user_Léo', JSON.stringify(existing));
    api._setPendingStartLevel('Léo', 'CM2'); // orphelin, ne doit pas s'appliquer
    api._domEl('playerSelect').value = 'Léo';
    api.loadProfile();
    expect(api.getP().prefs.level).toBe('CE1'); // inchangé
    expect(api.getP().xp).toBe(500);
  });
});
