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

describe('C4 — texte du quiz de trait adapté à l\'Odyssée (v12.4.61, remplace l\'ancien ton par niveau)', () => {
  it('utilise un texte simple pour l\'Odyssée maternelle (mat)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: null, heroTraitMoteur: null, heroTraitStyle: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ level: 'PS', adventure: 'mat' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    expect(el.innerHTML).toContain('Quand quelque chose semble difficile');
  });

  it('utilise un texte adapté au thème de Sidéris pour l\'Odyssée collège (col)', () => {
    const api = loadGame(FILES);
    api.setP({ name: 'Test', heroTraitApproche: null, heroTraitMoteur: null, heroTraitStyle: null, mapBossBeaten: [], storySeen: [] });
    api.setGM({ level: 'CM2', adventure: 'col' });
    const cb = vi.fn();
    api._maybeShowStory(cb);
    const el = api._lastCreatedElement ? api._lastCreatedElement() : null;
    expect(el.innerHTML).toContain('démonstration qui semble hors de portée');
  });
});
