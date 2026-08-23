import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
  '13-maternelle.js',
];

// Demande de Cyril : le décor par lieu réel doit concerner TOUTES les
// Odyssées, TOUTES les matières, TOUS les niveaux actuels ET futurs — pas
// seulement la maternelle. v12.7.5 : les petits motifs sont donc gérés par
// une fonction UNIQUE et universelle (_applyZoneMotifs, 07-map.js), appelée
// depuis startMapStep() (toute Odyssée/niveau) et nettoyée dans startGame()
// (mode solo classique) et endGame() (fin de partie). Entièrement piloté
// par _THEME_META — une future Odyssée n'a besoin d'aucun code nouveau.
// Corrige au passage un bug d'empilement CSS : #v-game n'établissait pas
// son propre contexte d'empilement (position:relative seul ne suffit pas),
// donc le z-index négatif des motifs les rendait invisibles derrière le
// fond de #v-game lui-même (signalé par Cyril, captures à l'appui).
describe('_applyZoneMotifs() — motifs de lieu universels, tous niveaux (v12.7.5)', () => {
  it('en zone maternelle (sakura) : pose 2 motifs + la classe d\'empilement sur #v-game', () => {
    const api = loadGame(FILES);
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_ce1_3'); // "Le Rucher Doré", thème sakura
    expect(zone.theme).toBe('sakura');
    api._applyZoneMotifs(zone);
    const box = api._domEl('zone-motifs');
    expect((box.innerHTML.match(/zone-motif/g) || []).length).toBe(2);
    expect(box.innerHTML).toContain('🌸');
    expect(api._domEl('v-game').classList.contains('has-zone-motifs')).toBe(true);
  });

  it('en zone NON-maternelle (col, thème ocean) : mêmes motifs, comportement identique', () => {
    const api = loadGame(FILES);
    api.startAdventure('col', true);
    const zone = api.getMapZones().find(z => z.id === 'col_cp_1'); // "Le Port des Décimales", thème ocean
    expect(zone.theme).toBe('ocean');
    api._applyZoneMotifs(zone);
    const box = api._domEl('zone-motifs');
    expect((box.innerHTML.match(/zone-motif/g) || []).length).toBe(2);
    expect(box.innerHTML).toContain('🐚'); // emoji du thème ocean (_THEME_META)
    expect(api._domEl('v-game').classList.contains('has-zone-motifs')).toBe(true);
  });

  it('zone=null (mode solo classique) : aucun motif, classe d\'empilement retirée', () => {
    const api = loadGame(FILES);
    api._domEl('v-game').classList.add('has-zone-motifs'); // simule un résidu d'une zone précédente
    api._applyZoneMotifs(null);
    expect(api._domEl('zone-motifs').innerHTML).toBe('');
    expect(api._domEl('v-game').classList.contains('has-zone-motifs')).toBe(false);
  });

  it('thème de zone introuvable (garde-fou) : ne plante pas, aucun motif', () => {
    const api = loadGame(FILES);
    expect(() => api._applyZoneMotifs({ id: 'x', theme: 'inconnu' })).not.toThrow();
    expect(api._domEl('zone-motifs').innerHTML).toBe('');
  });

  it('startMapStep() appelle bien _applyZoneMotifs() automatiquement, pour n\'importe quel niveau', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.zoneProgress = { primhist_plaine_1: { stepsCompleted: 0, completed: false } };
    api.setP(p);
    api.startAdventure('primhist', true);
    const zone = api.getMapZones()[0];
    api._setAvatarZone(zone.id);
    api.startMapStep(zone.id, 0);
    const box = api._domEl('zone-motifs');
    expect((box.innerHTML.match(/zone-motif/g) || []).length).toBe(2);
  });
});

describe('_matApplyAmbiance() — fond doux maternelle selon le vrai lieu (v12.7.3, inchangé par le refactor v12.7.5)', () => {
  it('hors Odyssée (mode solo classique) : --mat-accent suit le monde du niveau (PS)', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: null });
    api._matApplyAmbiance('PS');
    expect(api._domEl('BODY').style.getPropertyValue('--mat-accent')).toBe('#1d9e75');
  });

  it('en Odyssée (zone-step), --mat-accent suit le vrai thème du lieu joué (sakura), pas le niveau', () => {
    const api = loadGame(FILES);
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_ce1_3');
    api.setGM({ mapZone: zone });
    api._matApplyAmbiance('PS');
    expect(api._domEl('BODY').style.getPropertyValue('--mat-accent')).toBe('#ffb3d9');
  });

  it('thème de zone introuvable (garde-fou) : retombe sur le monde du niveau, ne plante pas', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: { id: 'x', label: 'Zone Test', theme: 'inconnu' } });
    expect(() => api._matApplyAmbiance('MS')).not.toThrow();
    expect(api._domEl('BODY').style.getPropertyValue('--mat-accent')).toBe('#ba7517');
  });
});

describe('_matRenderQ() — badge de titre affiche le vrai lieu en Odyssée (v12.7.3)', () => {
  it('affiche le vrai nom du lieu (GM.mapZone.label) pendant une étape d\'Odyssée', () => {
    const api = loadGame(FILES);
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_ce1_3');
    api.setGM({ mapZone: zone });
    api.setP(api.defProfile('Test'));
    api.setGS({ qCount: 1, matZoneStepIdx: 0 });
    api._matRenderQ({ level: 'PS', consigne: 'Touche le crabe.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain('Le Rucher Doré');
    expect(api._domEl('quest-title').innerHTML).not.toContain('tout doux');
  });

  it('hors Odyssée : affiche le monde générique du niveau (comportement inchangé)', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: null });
    api.setP(api.defProfile('Test'));
    api.setGS({ qCount: 1, matZoneStepIdx: 0 });
    api._matRenderQ({ level: 'PS', consigne: 'Touche le crabe.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain("L'océan tout doux");
  });
});
