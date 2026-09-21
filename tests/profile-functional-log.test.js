// AUD-02-026 (audit fonctionnel 2026-09-21) — un parent n'avait aucune trace
// consultable des évènements marquants d'un profil (migrations, imports,
// conflits cloud résolus) au-delà d'un diagnostic technique (getSyncDiag(),
// 12-cloud.js — en sessionStorage, effacé à la fermeture de l'onglet, pensé
// pour être copié-collé à un support technique). logProfileEvent()/
// getProfileLog() tiennent désormais un journal persistant et lisible par
// domaine (profileLog_+nom), affiché en Vue Parent (onglet Suivi).
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '09-parent.js'];

describe('logProfileEvent() / getProfileLog() / clearProfileLog() — journal persistant par profil', () => {
  it('round-trip simple', () => {
    const api = loadGame(FILES);
    api.logProfileEvent('Léo', 'Un évènement');
    const log = api.getProfileLog('Léo');
    expect(log).toHaveLength(1);
    expect(log[0].text).toBe('Un évènement');
    expect(typeof log[0].ts).toBe('number');
  });

  it('plafonne à 50 entrées (les plus anciennes sont retirées)', () => {
    const api = loadGame(FILES);
    for (let i = 0; i < 55; i++) api.logProfileEvent('Léo', 'evt' + i);
    const log = api.getProfileLog('Léo');
    expect(log).toHaveLength(50);
    expect(log[0].text).toBe('evt5'); // les 5 plus anciennes (evt0-4) ont été retirées
    expect(log[49].text).toBe('evt54');
  });

  it('clearProfileLog() vide le journal', () => {
    const api = loadGame(FILES);
    api.logProfileEvent('Léo', 'x');
    api.clearProfileLog('Léo');
    expect(api.getProfileLog('Léo')).toEqual([]);
  });

  it('des profils différents ont des journaux indépendants', () => {
    const api = loadGame(FILES);
    api.logProfileEvent('Léo', 'pour Léo');
    api.logProfileEvent('Emma', 'pour Emma');
    expect(api.getProfileLog('Léo')).toHaveLength(1);
    expect(api.getProfileLog('Emma')).toHaveLength(1);
    expect(api.getProfileLog('Léo')[0].text).toBe('pour Léo');
  });
});

describe('migrateProfile() — journalise une VRAIE migration, pas un profil déjà à jour', () => {
  it('journalise quand une migration a effectivement eu lieu', () => {
    const api = loadGame(FILES);
    api.migrateProfile({ name: 'Léo', _v: 7 });
    const log = api.getProfileLog('Léo');
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].text).toContain('v7');
    expect(log[0].text).toContain('v9');
  });

  it('ne journalise rien pour un profil déjà à la dernière version', () => {
    const api = loadGame(FILES);
    api.migrateProfile({ name: 'Léo', _v: 9 });
    expect(api.getProfileLog('Léo')).toEqual([]);
  });
});

describe('_purgeChildData() — le journal fonctionnel est purgé avec le reste des données orphelines (AUD-02-025)', () => {
  it('efface bien profileLog_+nom', () => {
    const api = loadGame(FILES);
    api.logProfileEvent('Léo', 'x');
    api._purgeChildData('Léo');
    expect(api.getProfileLog('Léo')).toEqual([]);
  });
});

describe('renderProfileLog() — affichage en Vue Parent', () => {
  it('affiche un message si aucun évènement', () => {
    const api = loadGame(FILES);
    api._domEl('parent-player').value = 'Léo';
    api.renderProfileLog();
    expect(api._domEl('profile-log-zone').innerHTML).toContain('Aucun');
  });

  it('affiche les évènements du profil sélectionné, avec un bouton pour les effacer', () => {
    const api = loadGame(FILES);
    api.logProfileEvent('Léo', 'Profil importé depuis un fichier de sauvegarde');
    api._domEl('parent-player').value = 'Léo';
    api.renderProfileLog();
    const html = api._domEl('profile-log-zone').innerHTML;
    expect(html).toContain('Profil importé depuis un fichier de sauvegarde');
    expect(html).toContain('clearProfileLog');
  });
});
