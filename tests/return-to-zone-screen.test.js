import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

// Signalé par Cyril (captures d'écran à l'appui) : "Retour à la zone" / le
// bouton "Retour" en cours de partie ramenait vers l'ancien écran v-zone
// (renderZoneMap()), visuellement figé et différent de la modale utilisée
// PARTOUT ailleurs sur la carte (openArchipelZoom(), via requestZoneOpen()).
// Correctif v12.7.2 : reprend le pattern déjà éprouvé de returnToModule()
// (07-map.js) — l'avatar est déjà sur la zone jouée (posé par startMapStep),
// donc requestZoneOpen() rouvre directement openArchipelZoom(), sans
// animation de marche.
function setupZoneStep(api, zoneId, stepIdx = 0, stepsCompleted = 0){
  const p = api.defProfile('Test');
  p.zoneProgress = { [zoneId]: { stepsCompleted, completed: false } };
  api.setP(p);
  api.startAdventure('mat', true);
  const zone = api.getMapZones().find(z => z.id === zoneId);
  api._setAvatarZone(zoneId);
  api.setGM({ mapZone: zone, mapStep: { idx: stepIdx, def: zone.steps[stepIdx] } });
  return zone;
}

describe('returnMenu() — rouvre la VRAIE modale de zone (openArchipelZoom), pas l\'ancien écran v-zone', () => {
  it('étape non terminée : ouvre openArchipelZoom() sur la bonne zone, v-zone reste caché', () => {
    const api = loadGame(FILES);
    setupZoneStep(api, 'mat_ce1_3', 0, 0); // "Le Rucher Doré"
    api.returnMenu();
    const overlay = api._lastCreatedElement();
    expect(overlay).toBeTruthy();
    expect(overlay.className).toBe('archipel-zoom-overlay');
    expect(overlay.innerHTML).toContain('Le Rucher Doré');
    expect(api._domEl('v-zone').classList.contains('hidden')).toBe(true);
    expect(api._domEl('v-map').classList.contains('hidden')).toBe(false);
  });

  it('zone entièrement terminée : va à la carte du monde, sans ouvrir de zoom (comportement inchangé)', () => {
    const api = loadGame(FILES);
    setupZoneStep(api, 'mat_ce1_3', 4, 5);
    const p = api.getP();
    p.zoneProgress.mat_ce1_3.completed = true;
    api.setP(p);
    api.returnMenu();
    expect(api._domEl('v-map').classList.contains('hidden')).toBe(false);
    expect(api._createdElements().length).toBe(0);
  });

  it('fonctionne pour une autre Odyssée que "mat" (col), avec le vrai nom de zone', () => {
    const api = loadGame(FILES);
    const p = api.defProfile('Test');
    p.zoneProgress = { col_cp_1: { stepsCompleted: 0, completed: false } };
    api.setP(p);
    api.startAdventure('col', true);
    const zone = api.getMapZones().find(z => z.id === 'col_cp_1');
    api._setAvatarZone('col_cp_1');
    api.setGM({ mapZone: zone, mapStep: { idx: 0, def: zone.steps[0] } });
    api.returnMenu();
    const overlay = api._lastCreatedElement();
    expect(overlay.className).toBe('archipel-zoom-overlay');
    expect(overlay.innerHTML).toContain(zone.label);
  });
});

describe('quitGame("back") confirmé — même correctif que returnMenu()', () => {
  it('étape non terminée : ouvre openArchipelZoom() sur la bonne zone', () => {
    const api = loadGame(FILES);
    setupZoneStep(api, 'mat_ce1_3', 0, 0);
    api.setShowConfirm((msg, onConfirm) => onConfirm());
    api.quitGame('back');
    const overlay = api._lastCreatedElement();
    expect(overlay).toBeTruthy();
    expect(overlay.className).toBe('archipel-zoom-overlay');
    expect(overlay.innerHTML).toContain('Le Rucher Doré');
    expect(api._domEl('v-zone').classList.contains('hidden')).toBe(true);
  });
});
