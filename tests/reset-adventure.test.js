import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js',
];

// Garde-fou de non-régression pour ADR-51 (correctif du reset Odyssée, qui
// avait laissé plusieurs champs persistants non réinitialisés). Vérifie
// qu'un profil rempli sur TOUS les champs Odyssée actuellement connus est
// intégralement nettoyé par resetAdventure(), et que rien d'étranger à
// l'Odyssée n'est effacé au passage.
//
// Limite assumée (ADR-52) : ce test protège contre une régression sur les
// champs déjà listés ci-dessous. Il ne peut pas détecter automatiquement
// l'oubli d'un TOUT NOUVEAU champ persistant introduit par un futur système
// narratif — celui-ci doit être ajouté manuellement à buildFullProfile() et
// aux assertions, en même temps qu'il est ajouté à resetAdventure() (voir
// ADR-51, conséquence pour l'avenir).
describe('resetAdventure() — remise à zéro complète (ADR-51)', () => {
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
    };
  }

  it('nettoie tous les champs Odyssée connus sans toucher aux données hors-Odyssée', () => {
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
