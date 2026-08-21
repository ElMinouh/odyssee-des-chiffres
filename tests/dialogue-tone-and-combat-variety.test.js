import { describe, it, expect, vi } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '13-maternelle.js',
];

describe('C3 — pools de variété de combat doublés', () => {
  it('COMBAT_HIT_MSGS contient 20 messages distincts', () => {
    const api = loadGame(FILES);
    expect(api.COMBAT_HIT_MSGS).toHaveLength(20);
    expect(new Set(api.COMBAT_HIT_MSGS).size).toBe(20);
  });
  it('COMBAT_MISS_MSGS contient 10 messages distincts', () => {
    const api = loadGame(FILES);
    expect(api.COMBAT_MISS_MSGS).toHaveLength(10);
    expect(new Set(api.COMBAT_MISS_MSGS).size).toBe(10);
  });
});

describe('C4 — texte du choix de trait adapté au ton (âge)', () => {
  it('utilise le texte "tender" pour un niveau maternelle', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ level: 'PS', adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    expect(el.innerHTML).toContain('tu es plutôt');
  });

  it('utilise le texte "standard" pour un niveau primaire/collège', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTrait: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ level: 'CM2', adventure: 'prim' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    expect(el.innerHTML).toContain('qui tu es vraiment');
  });
});
