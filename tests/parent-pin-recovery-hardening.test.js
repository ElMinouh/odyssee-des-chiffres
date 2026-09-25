// AUD-02-028 / AUD-02-029 (audit fonctionnel 2026-09-21) — deux failles dans la
// récupération du code parent (09-parent.js) :
//  - AUD-02-028 : "Code parent oublié ?" révélait le code par défaut '1234' en
//    clair, sans aucune vérification d'identité, dès lors qu'aucune question
//    secrète n'était configurée (cas par défaut de tout foyer n'ayant jamais
//    visité les réglages avancés).
//  - AUD-02-029 : la vérification de la question secrète n'était soumise à
//    aucun verrou anti-brute-force, contrairement au code PIN principal.
//
// Décision produit validée : la question secrète devient OBLIGATOIRE dès qu'un
// code personnalisé est défini (savePin()) ; le code par défaut '1234' reste
// mentionné UNIQUEMENT tant qu'il n'a jamais été changé (cas où le révéler
// n'ouvre aucune protection : un enfant peut de toute façon le taper directement
// à l'écran de verrouillage).
//
// Note sur le harnais : recoverParentPin() appelle prompt()/showAlert(), qui ne
// sont pas stubbés dans ce sandbox minimal (même limite déjà documentée pour
// nextTurn()/validate()). Les branches testées ci-dessous sont précisément
// celles qui RETOURNENT AVANT tout appel à prompt() — verrou actif, ou aucune
// question secrète configurée — donc s'exécutent sans erreur dans ce harnais ;
// une régression qui leur ferait atteindre prompt() par erreur ferait échouer
// le test (ReferenceError: prompt is not defined), ce qui est un signal utile
// en soi.
import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '09-parent.js'];

describe('savePin() — la question secrète est obligatoire (AUD-02-028)', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api._domEl('new-pin').value = '5678';
    api._domEl('new-secq').value = '';
    api._domEl('new-seca').value = '';
    api._domEl('pin-msg').innerText = '';
  });

  it('refuse d\'enregistrer un nouveau code sans question secrète', async () => {
    await api.savePin();
    expect(api._ls.getItem('parentPin')).toBeNull();
    expect(api._domEl('pin-msg').innerText).toMatch(/obligatoire/i);
  });

  it('refuse aussi si la question est remplie mais pas la réponse', async () => {
    api._domEl('new-secq').value = 'Ville de naissance ?';
    await api.savePin();
    expect(api._ls.getItem('parentPin')).toBeNull();
  });

  it('enregistre le code ET la question/réponse quand les deux sont fournies', async () => {
    api._domEl('new-secq').value = 'Ville de naissance ?';
    api._domEl('new-seca').value = 'Paris';
    await api.savePin();
    expect(api._ls.getItem('parentPin')).toBeTruthy();
    expect(api._ls.getItem('parentSecQ')).toBe('Ville de naissance ?');
    expect(api._ls.getItem('parentSecA')).toBeTruthy();
    expect(api._domEl('pin-msg').innerText).toMatch(/enregistrés/i);
  });
});

describe('recoverParentPin() — verrou anti-brute-force partagé + aucun code personnalisé révélé (AUD-02-028/029)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('respecte le verrou anti-brute-force du PIN principal : ne tente rien tant qu\'il est actif', async () => {
    api.setPinLockUntil(Date.now() + 15000);
    await expect(api.recoverParentPin()).resolves.toBeUndefined();
  });

  it('aucun code personnalisé, aucune question secrète : retourne sans planter (mentionne le défaut, sans danger)', async () => {
    // Ni 'parentPin' ni 'parentSecQ' en localStorage : cas par défaut d'un foyer
    // qui n'a jamais ouvert les réglages avancés.
    await expect(api.recoverParentPin()).resolves.toBeUndefined();
  });

  it('code personnalisé existant SANS question secrète : ne révèle jamais ce code (retourne sans planter)', async () => {
    api._ls.setItem('parentPin', 'un-hash-quelconque');
    // Pas de 'parentSecQ' : compte configuré avant que la question devienne obligatoire.
    await expect(api.recoverParentPin()).resolves.toBeUndefined();
  });

  it('le compteur de tentatives est bien remis à zéro après une réponse correcte (source)', async () => {
    // Vérifie au niveau source que le succès réinitialise le même compteur que
    // checkPin() (getPinAttempts/setPinAttempts partagés) — voir aussi les
    // assertions de position ci-dessous.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '09-parent.js'), 'utf8');
    const fnStart = src.indexOf('async function recoverParentPin()');
    // AUD-02-005 (audit fonctionnel 2026-09-21) : fenêtre élargie après le
    // remplacement des prompt() natifs par showPrompt() (callbacks imbriqués,
    // fonction plus longue) — la fonction entière tient largement dedans.
    const fnBody = src.slice(fnStart, fnStart + 2600);
    expect(fnBody).toContain('getPinLockUntil()');
    expect(fnBody).toContain('setPinAttempts(0)');
    expect(fnBody).toContain('getPinAttempts()+1');
    expect(fnBody).toContain('setPinLockUntil(Date.now()+30000)');
  });
});
