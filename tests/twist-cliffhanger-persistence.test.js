import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js',
];

describe('validateProfile() — persistance de lastTwistLineByAdv et twistLinesUsedByAdv (N7)', () => {
  it('conserve le dernier rebondissement tiré après une passe de désérialisation', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', lastTwistLineByAdv: { prim: 'Un rebondissement inattendu survient.' } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.lastTwistLineByAdv.prim).toBe('Un rebondissement inattendu survient.');
  });

  it('conserve le tirage sans remise par Odyssée (correctif adjacent, même défaut qu\'ADR-80)', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', twistLinesUsedByAdv: { prim: [2, 5, 9] } };
    const out = api.validateProfile(raw, 'Test');
    expect(out.twistLinesUsedByAdv.prim).toEqual([2, 5, 9]);
  });

  it('ignore les valeurs non conformes sans planter (durcissement)', () => {
    const api = loadGame(FILES);
    const raw = { name: 'Test', lastTwistLineByAdv: { prim: 12345 }, twistLinesUsedByAdv: { prim: ['x', -1, 3.5, 7] } };
    expect(() => api.validateProfile(raw, 'Test')).not.toThrow();
    const out = api.validateProfile(raw, 'Test');
    expect(out.lastTwistLineByAdv.prim).toBeUndefined();
    expect(out.twistLinesUsedByAdv.prim).toEqual([7]);
  });
});

describe('_advlogJournalHtml() — cliffhanger "à suivre..." (N7)', () => {
  it('affiche le dernier rebondissement de l\'Odyssée en cours s\'il existe', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', lastTwistLineByAdv: { prim: 'Le dragon se réveille au loin.' }, storySeen: [] });
    api.setGM({ adventure: 'prim' });
    const { html } = api._advlogJournalHtml();
    expect(html).toContain('À suivre...');
    expect(html).toContain('Le dragon se réveille au loin.');
  });

  it('n\'affiche rien si aucun rebondissement n\'a encore été tiré pour cette Odyssée', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', lastTwistLineByAdv: {}, storySeen: [] });
    api.setGM({ adventure: 'prim' });
    const { html } = api._advlogJournalHtml();
    expect(html).not.toContain('À suivre...');
  });
});

describe('_maybeShowTwist() — bout en bout : le tirage est bien persisté (N7)', () => {
  it('écrit le texte substitué dans P.lastTwistLineByAdv pour l\'Odyssée en cours', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', storySeen: [], twistLinesUsedByAdv: {}, lastTwistLineByAdv: {} });
    api.setGM({ adventure: 'prim' });
    const region = api.getArchRegions().find(r => r.id !== 'final');
    const zones = api._zonesOfRegion(region.id);
    const triggerIdx = api._twistZoneIdx(region.id, zones.length);
    if (triggerIdx < 0) return; // région trop petite pour ce mécanisme, rien à tester ici
    const zone = zones[triggerIdx];
    api._maybeShowTwist(zone, () => {});
    const stored = api.getP().lastTwistLineByAdv.prim;
    expect(typeof stored).toBe('string');
    expect(stored.length).toBeGreaterThan(0);
  });
});
