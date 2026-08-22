import { describe, it, expect, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

// v12.4.70 : texte d'ouverture propre à chaque lieu, montré au tout premier
// clic dessus, avant sa 1ère étape — pendant, à l'arrivée, de _ZONE_OUTRO
// (déjà existant, montré à la conquête). Rédigé Odyssée par Odyssée ; ce
// fichier ne teste pour l'instant que le MÉCANISME (générique, valable pour
// toutes les Odyssées) sur des lieux de 'mat', la seule entièrement rédigée.
describe('_maybeShowZoneIntro() — texte d\'ouverture d\'un lieu (v12.4.70)', () => {
  it('affiche le texte une fois pour un lieu qui en a un, puis ne le rejoue plus', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [] });
    const zone = { id: 'mat_cp_1', label: 'Le Pré Vert' };

    const cb1 = vi.fn();
    api._maybeShowZoneIntro(zone, cb1);
    expect(cb1).not.toHaveBeenCalled(); // modale affichée, callback pas encore rappelé
    expect(api.getP().storySeen).toContain('zintro_mat_cp_1');

    const cb2 = vi.fn();
    api._maybeShowZoneIntro(zone, cb2);
    expect(cb2).toHaveBeenCalled(); // déjà vu, callback rappelé immédiatement
  });

  it('ne fait rien (callback immédiat) pour un lieu sans texte défini', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [] });
    const zone = { id: 'zone_inconnue_xyz', label: 'Zone fictive' };
    const cb = vi.fn();
    api._maybeShowZoneIntro(zone, cb);
    expect(cb).toHaveBeenCalled();
    expect(api.getP().storySeen).not.toContain('zintro_zone_inconnue_xyz');
  });

  it('les 195 lieux des 7 Odyssées ont chacun un texte défini (couverture complète)', () => {
    const api = loadGame(FILES);
    const odysseys = [
      ['mat', 'PS'], ['matfr', 'PS'], ['prim', 'CP'], ['primfr', 'CP'],
      ['primhist', 'CP'], ['col', '6E'], ['colfr', '6E'],
    ];
    let total = 0;
    for (const [adv, level] of odysseys) {
      api.setP({ name: 'Test' });
      api.setGM({ level, subject: 'math' });
      api.startAdventure(adv, true);
      const zones = api.getMapZones();
      zones.forEach(z => {
        api.setP({ name: 'Test', storySeen: [] });
        const cb = vi.fn();
        api._maybeShowZoneIntro(z, cb);
        expect(cb, `lieu sans texte d'ouverture : ${adv}/${z.id} (${z.label})`).not.toHaveBeenCalled();
      });
      total += zones.length;
    }
    expect(total).toBe(195);
  });

  it('substitue {hero} et {villain} dans le texte affiché', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Cyril', storySeen: [] });
    api.setGM({ level: 'GS', subject: 'math' });
    api.startAdventure('mat', true);
    const zone = { id: 'mat_cm2_5', label: 'Colline de l\'Horizon' };
    api._maybeShowZoneIntro(zone, vi.fn());
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    expect(el.innerHTML).not.toContain('{villain}');
    expect(el.innerHTML).toContain('Nuage Grognon');
  });
});

describe('_maybeShowStory() — le texte d\'ouverture du lieu arrive en dernier dans la chaîne narrative', () => {
  it('un lieu déjà connu (prologue/quiz/chapitre/moment déjà vus) déclenche quand même son propre texte d\'ouverture', () => {
    const api = loadGame(FILES);
    api.setGM({ level: 'PS', subject: 'math' });
    api.startAdventure('mat', true);
    api.setP({
      name: 'Test', heroTraitApproche: 'brave', heroTraitMoteur: 'protecteur', heroTraitStyle: 'determine',
      mapBossBeaten: [], storySeen: ['mat_intro', 'mat_c_cp'],
      mapAvatarZoneByAdv: { mat: 'mat_cp_3' }, zoneProgress: {},
    });
    api.setGM({ level: 'PS', subject: 'math' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(api.getP().storySeen).toContain('zintro_mat_cp_3');
  });
});
