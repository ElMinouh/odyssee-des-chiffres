import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '06b-time-block.js'];

function withClock(h, m, fn) {
  const real = Date;
  class FakeDate extends real {
    constructor(...args) {
      if (args.length) return new real(...args);
      return new real(2026, 0, 1, h, m, 0);
    }
    getHours() { return h; }
    getMinutes() { return m; }
  }
  global.Date = FakeDate;
  try { fn(); } finally { global.Date = real; }
}

// Non-régression AUD-01-011 : une plage start>end (ex. 20:00-07:00, jeu
// autorisé le soir jusqu'au matin) bloquait le jeu EN PERMANENCE, quelle
// que soit l'heure, alors que la configuration est parfaitement valide.
describe('isTimeBlocked() — plage horaire traversant minuit', () => {
  it('20:00-07:00 : autorisé à 22:00 et à 03:00 (dans la plage nocturne)', () => {
    const api = loadGame(FILES, { block_Léo: JSON.stringify({ enabled: true, start: '20:00', end: '07:00' }) });
    api.setP({ name: 'Léo' });
    withClock(22, 0, () => expect(api.isTimeBlocked()).toBe(false));
    withClock(3, 0, () => expect(api.isTimeBlocked()).toBe(false));
  });

  it('20:00-07:00 : bloqué à 12:00 (hors plage, en journée)', () => {
    const api = loadGame(FILES, { block_Léo: JSON.stringify({ enabled: true, start: '20:00', end: '07:00' }) });
    api.setP({ name: 'Léo' });
    withClock(12, 0, () => expect(api.isTimeBlocked()).toBe(true));
  });

  it('plage normale (start<end) : comportement inchangé (17:00-18:00)', () => {
    const api = loadGame(FILES, { block_Léo: JSON.stringify({ enabled: true, start: '17:00', end: '18:00' }) });
    api.setP({ name: 'Léo' });
    withClock(17, 30, () => expect(api.isTimeBlocked()).toBe(false));
    withClock(20, 0, () => expect(api.isTimeBlocked()).toBe(true));
  });
});
