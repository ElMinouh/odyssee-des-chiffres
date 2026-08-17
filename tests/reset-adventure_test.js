import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js',
];

// Garde-fou de non-régression pour ADR-51/ADR-52 (reset Odyssée) + correctif
// v12.4.54 (reset multi-appareils) : push cloud immédiat après reset, et
// extension du nettoyage aux champs narratifs ajoutés après ADR-52 (journal,
// cliffhanger, révélations de collection) — exactement le risque que le
// commentaire ADR-52 avait anticipé pour tout futur système narratif.
describe('resetAdventure() — remise à zéro complète (ADR-51/52)', () => {
  function buildFullProfile(knownStoryIds) {
    return {
      name: 'TestKid',
      xp: 500, stars: 120, ownedFigurines: ['fig1'],
      mapBossBeaten: ['prim_z1', 'mat_z2'],
      mapAvatarZone: 'foret',
      mapAvatarZoneByAdv: { prim: 'foret', col: 'citadelle' },
      zoneProgress: { prim_z1: 3 },
      storySeen: [...knownStoryIds, 'unrelated_marker_should_survive'],
      // storyPageIdx : champ legacy (ADR-46, annulée par ADR-49, code mort
      // retiré en ADR-52) — doit rester nettoyable sans erreur pour
      // d'anciens profils qui le porteraient encore.
      storyPageIdx: { cm1: 2 },
      majorChoiceByAdv: { prim: {0:'A', 1:'B'}, col: {0:'B'} },
      twistLinesUsedByAdv: { prim: [1, 4, 7] },
      _epilogueBonusCredited: ['prim'],
      levelWins: { CE1: 12, '6e': 4 },
      // v12.4.54 : champs narratifs ajoutés après ADR-52.
      journalEntriesByAdv: { prim: [{ text: 'Une aventure.', flawless: true }] },
      lastTwistLineByAdv: { prim: 'Un rebondissement en cours.' },
      talismanRevealShown: true, rainbowRevealShown: true, bookRevealShown: true,
      badgeRevealShown: true, armorRevealShown: true, libraryRevealShown: true,
      histLibraryRevealShown: true,
      heroTrait: 'brave', // NE DOIT PAS être effacé (trait de personnage, pas progression)
    };
  }

  it('nettoie tous les champs Odyssée connus, y compris les systèmes narratifs récents, sans toucher aux données hors-Odyssée', () => {
    // Sonde à part pour lire la vraie liste d'ids Odyssée du jeu (ADR-51),
    // plutôt que de la recopier à la main ici (source unique de vérité).
    const probe = loadGame(FILES);
    const knownIds = [...probe._allOdysseyStorySeenIds()].slice(0, 5);
    expect(knownIds.length).toBeGreaterThan(0);

    const profile = buildFullProfile(knownIds);
    const api = loadGame(FILES, { user_TestKid: JSON.stringify(profile) });
    // Bypass la boîte de dialogue réelle (DOM non simulé dans ce sandbox) :
    // déclenche directement le onConfirm, comme un vrai clic sur "Confirmer".
    api.setShowConfirm((msg, onConfirm) => onConfirm());

    api.resetAdventure('TestKid');

    const after = JSON.parse(api._ls.getItem('user_TestKid'));

    expect(after.mapBossBeaten).toEqual([]);
    expect(after.mapAvatarZone).toBe('plaine');
    expect(after.mapAvatarZoneByAdv).toEqual({});
    expect(after.zoneProgress).toEqual({});
    expect(after.storyPageIdx).toEqual({});
    expect(after.majorChoiceByAdv).toEqual({});
    expect(after.twistLinesUsedByAdv).toEqual({});
    expect(after._epilogueBonusCredited).toEqual([]);
    expect(after.levelWins).toEqual({ CE1: 0, '6e': 0 });

    // v12.4.54 : nouveaux champs narratifs correctement nettoyés.
    expect(after.journalEntriesByAdv).toEqual({});
    expect(after.lastTwistLineByAdv).toEqual({});
    expect(after.talismanRevealShown).toBe(false);
    expect(after.rainbowRevealShown).toBe(false);
    expect(after.bookRevealShown).toBe(false);
    expect(after.badgeRevealShown).toBe(false);
    expect(after.armorRevealShown).toBe(false);
    expect(after.libraryRevealShown).toBe(false);
    expect(after.histLibraryRevealShown).toBe(false);
    // heroTrait est un trait de personnage, pas une progression — préservé.
    expect(after.heroTrait).toBe('brave');

    // Aucun des ids Odyssée connus ne doit survivre au reset...
    for (const id of knownIds) {
      expect(after.storySeen).not.toContain(id);
    }
    // ...mais un marqueur hors-Odyssée doit être préservé (le filtre ne doit
    // jamais effacer aveuglément tout storySeen, seulement ce qui appartient
    // réellement à l'Odyssée).
    expect(after.storySeen).toContain('unrelated_marker_should_survive');

    // Contrat affiché à l'utilisateur : étoiles/figurines/XP JAMAIS touchées
    // par ce reset (voir le message de confirmation dans resetAdventure()).
    expect(after.stars).toBe(120);
    expect(after.ownedFigurines).toEqual(['fig1']);
    expect(after.xp).toBe(500);
  });
});

// Garde-fou de non-régression pour le correctif "reset multi-appareils"
// (v12.4.54) : le reset doit pousser immédiatement vers le cloud plutôt que
// d'attendre la prochaine synchronisation périodique, sinon la fusion cloud
// (union des zones vaincues) réinjecte silencieusement l'ancienne
// progression au sync suivant.
describe('resetAdventure() — push cloud immédiat après reset (correctif multi-appareils)', () => {
  it('appelle pushProfileToCloud(true) quand le profil actif a un code cloud', () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify({ name: 'TestKid', cloudCode: 'ABCD1234' }) });
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    // loadProfile() lit le profil actif via $('playerSelect').value (un vrai
    // <select> du DOM), jamais via P.name — il faut simuler ce sélecteur
    // pour que le rechargement post-reset retrouve le bon profil.
    api._domEl('playerSelect').value = 'TestKid';
    let calledWith = null;
    api.setPushProfileToCloud((force) => { calledWith = force; return Promise.resolve(true); });
    api.setP({ name: 'TestKid', cloudCode: 'ABCD1234' }); // profil actif = celui qu'on reset

    api.resetAdventure('TestKid');

    expect(calledWith).toBe(true);
  });

  it("n'appelle PAS pushProfileToCloud si le profil n'a pas de code cloud (sync jamais activée)", () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify({ name: 'TestKid' }) });
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    api._domEl('playerSelect').value = 'TestKid';
    let called = false;
    api.setPushProfileToCloud(() => { called = true; return Promise.resolve(true); });
    api.setP({ name: 'TestKid' }); // pas de cloudCode

    api.resetAdventure('TestKid');

    expect(called).toBe(false);
  });

  it("n'appelle pas le push si le profil resetté n'est PAS le profil actif", () => {
    const api = loadGame(FILES, { user_TestKid: JSON.stringify({ name: 'TestKid', cloudCode: 'ABCD1234' }) });
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    // Sélecteur pointant vers un AUTRE joueur que celui qu'on reset.
    api._domEl('playerSelect').value = 'AutreJoueurActif';
    let called = false;
    api.setPushProfileToCloud(() => { called = true; return Promise.resolve(true); });
    api.setP({ name: 'AutreJoueurActif' }); // profil actif différent de celui resetté

    api.resetAdventure('TestKid');

    expect(called).toBe(false);
  });
});
