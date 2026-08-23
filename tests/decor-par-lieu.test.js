import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
  '13-maternelle.js',
];

// Demande de Cyril : décorer l'écran de jeu maternelle selon le VRAI lieu
// joué (variante "marquée", validée sur maquette), pas seulement le monde
// générique fixe du niveau scolaire (PS/MS/GS). Réutilise _THEME_META (déjà
// la source de vérité des couleurs/emoji par thème ailleurs dans le jeu) —
// aucune nouvelle couleur/emoji inventée. Corrige au passage le badge de
// titre, qui affichait le nom du monde générique plutôt que le vrai lieu.
describe('_matApplyAmbiance() — décor selon le vrai lieu en Odyssée (v12.7.3)', () => {
  it('hors Odyssée (mode solo classique) : --mat-accent suit le monde du niveau (PS), comportement inchangé', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: null });
    api._matApplyAmbiance('PS');
    expect(api._domEl('BODY').style.getPropertyValue('--mat-accent')).toBe('#1d9e75');
  });

  it('en Odyssée (zone-step), --mat-accent suit le vrai thème du lieu joué (sakura), pas le niveau', () => {
    const api = loadGame(FILES);
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_ce1_3'); // "Le Rucher Doré", thème sakura
    expect(zone.theme).toBe('sakura');
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

  it('pose 2 motifs (emoji du thème réel) dans #mat-motifs en Odyssée', () => {
    const api = loadGame(FILES);
    api.startAdventure('mat', true);
    const zone = api.getMapZones().find(z => z.id === 'mat_ce1_3');
    api.setGM({ mapZone: zone });
    api._matApplyAmbiance('PS');
    const box = api._domEl('mat-motifs');
    expect((box.innerHTML.match(/mat-motif/g) || []).length).toBe(2);
    expect(box.innerHTML).toContain('🌸'); // emoji du thème sakura (_THEME_META)
  });

  it('hors Odyssée : #mat-motifs reste vide (aucun motif hors contexte de lieu)', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: null });
    api._matApplyAmbiance('GS');
    expect(api._domEl('mat-motifs').innerHTML).toBe('');
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
