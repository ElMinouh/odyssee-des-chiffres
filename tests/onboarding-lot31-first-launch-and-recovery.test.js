// Lot 3.1 (audit fonctionnel 2026-09-21, Phase 3) — onboarding / création de
// profil : AUD-02-002 (profil fantôme "Joueur"), AUD-02-003 (aucun retour
// visuel sur champ vide), AUD-02-004 (date d'anniversaire incohérente
// acceptée), AUD-02-006 (enchaînement onboarding non interruptible).
// AUD-02-005 (prompt() natifs → showPrompt()) est couvert séparément par
// une simple présence de source (parcours de récupération, difficile à
// tester bout-en-bout sans DOM réel — même limite déjà documentée pour
// d'autres modales de ce fichier).
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '07-game.js', '08-ui.js', '09-parent.js', '19-onboarding.js'];

describe('AUD-02-002 — profil "Joueur" fantôme : jamais persisté tant qu\'aucun vrai prénom n\'est saisi', () => {
  it('loadProfile() avec le champ "Autre" vide marque le profil P._unnamed', () => {
    const api = loadGame(FILES);
    api._domEl('playerSelect').value = 'Autre';
    api._domEl('customInput').value = '';
    api.loadProfile();
    expect(api.getP().name).toBe('Joueur');
    expect(api.getP()._unnamed).toBe(true);
  });

  it('saveProfileNow() n\'écrit rien tant que le profil est _unnamed', () => {
    const api = loadGame(FILES);
    api._domEl('playerSelect').value = 'Autre';
    api._domEl('customInput').value = '';
    api.loadProfile();
    api.saveProfileNow();
    expect(api._ls.getItem('user_Joueur')).toBeNull();
  });

  it('taper un vrai prénom lève le verrou : le profil redevient sauvegardable', () => {
    const api = loadGame(FILES);
    api._domEl('playerSelect').value = 'Autre';
    api._domEl('customInput').value = '';
    api.loadProfile();
    expect(api.getP()._unnamed).toBe(true);

    api._domEl('customInput').value = 'Léo';
    api.loadProfile(); // applyCustom() rappelle loadProfile() à chaque frappe
    expect(api.getP().name).toBe('Léo');
    expect(api.getP()._unnamed).toBe(false);
    api.saveProfileNow();
    expect(api._ls.getItem('user_Léo')).not.toBeNull();
  });

  it('un profil "Joueur" légitime déjà existant (prénom réellement choisi par une famille) n\'est jamais bloqué', () => {
    const api = loadGame(FILES);
    // Simule un profil "Joueur" réel, déjà sauvegardé auparavant.
    const real = api.defProfile('Joueur'); real.xp = 42;
    api._ls.setItem('user_Joueur', JSON.stringify(real));
    api._domEl('playerSelect').value = 'Autre';
    api._domEl('customInput').value = '';
    api.loadProfile();
    expect(api.getP()._unnamed).toBe(false); // profil réel retrouvé, pas un repli
    expect(api.getP().xp).toBe(42);
  });

  it('_syncCustomZoneVisibility() démasque le champ dès que "Autre" est sélectionné', () => {
    const api = loadGame(FILES);
    const cz = api._domEl('custom-zone');
    cz.classList.add('hidden');
    api._domEl('playerSelect').value = 'Autre';
    api._syncCustomZoneVisibility();
    expect(cz.classList.contains('hidden')).toBe(false);
  });
});

describe('AUD-02-003 — "Ajouter un profil" avec un champ vide affiche un message', () => {
  it('un toast apparaît, symétrique au cas "profil déjà existant"', () => {
    const api = loadGame(FILES);
    api._domEl('pm-new').value = '';
    api.pmAddProfile();
    expect(api._domEl('toast').innerText).toContain('prénom');
  });

  it('ne crée aucune entrée dans le roster', () => {
    const api = loadGame(FILES);
    const before = api.getRoster().length;
    api._domEl('pm-new').value = '';
    api.pmAddProfile();
    expect(api.getRoster().length).toBe(before);
  });
});

describe('AUD-02-004 — date d\'anniversaire : cohérence jour/mois validée avant enregistrement', () => {
  it('refuse "31 avril" (avril n\'a que 30 jours) avec un message explicite, sans écraser l\'état précédent', () => {
    const api = loadGame(FILES);
    api.pmSetBirthday('Léo', 'm', '4');
    expect(api.getBirthday('Léo')).toEqual({ m: 4, d: 0 });
    api.pmSetBirthday('Léo', 'd', '31'); // combinaison invalide, refusée
    expect(api.getBirthday('Léo')).toEqual({ m: 4, d: 0 }); // état précédent inchangé
    expect(api._domEl('toast').innerText).toContain('existe pas');
  });

  it('refuse "30 février"', () => {
    const api = loadGame(FILES);
    api.pmSetBirthday('Léo', 'm', '2');
    api.pmSetBirthday('Léo', 'd', '30');
    expect(api.getBirthday('Léo')).toEqual({ m: 2, d: 0 }); // le jour invalide n'est jamais retenu
  });

  it('accepte une date calendaire valide', () => {
    const api = loadGame(FILES);
    api.pmSetBirthday('Léo', 'm', '4');
    api.pmSetBirthday('Léo', 'd', '30'); // 30 avril existe bien
    expect(api.getBirthday('Léo')).toEqual({ m: 4, d: 30 });
  });

  it('le 29 février reste accepté (marge de prudence bissextile)', () => {
    const api = loadGame(FILES);
    api.pmSetBirthday('Léo', 'm', '2');
    api.pmSetBirthday('Léo', 'd', '29');
    expect(api.getBirthday('Léo')).toEqual({ m: 2, d: 29 });
  });
});

describe('AUD-02-006 — enchaînement Système 1 → Système 2 : pause explicite proposée', () => {
  // _obFinishClick() appelle ce choix via setTimeout (non exécuté par le
  // harness de test, cf. tests/helpers/loadGame.js) : on teste directement
  // _obOfferSystem2Chain(), la fonction d'affichage extraite à cet effet.
  it('_obOfferSystem2Chain() propose un choix (showConfirm) plutôt que de démarrer automatiquement', () => {
    const api = loadGame(FILES);
    let confirmCalled = false;
    api.setShowConfirm(() => { confirmCalled = true; });
    api._obOfferSystem2Chain();
    expect(confirmCalled).toBe(true);
  });

  it('la confirmation propose explicitement "plus tard" (annulation possible)', () => {
    const api = loadGame(FILES);
    let cancelLabel = null;
    api.setShowConfirm((msg, onConfirm, opts) => { cancelLabel = opts && opts.cancelLabel; });
    api._obOfferSystem2Chain();
    expect(cancelLabel).toBeTruthy();
  });

  it('accepter le choix démarre bien le Système 2', () => {
    const api = loadGame(FILES);
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    api._obOfferSystem2Chain();
    expect(api.getObSystem()).toBe(2); // obStart(2) a bien été déclenché
  });

  it('refuser le choix ("Plus tard") ne démarre PAS le Système 2', () => {
    const api = loadGame(FILES);
    api.setShowConfirm(() => {}); // onConfirm jamais appelé (équivalent d'un clic "Plus tard")
    api._obOfferSystem2Chain();
    expect(api.getObSystem()).not.toBe(2);
  });
});
