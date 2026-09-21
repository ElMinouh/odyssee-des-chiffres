// AUD-02-046 (audit fonctionnel 2026-09-21) — la section messagerie du résumé
// hebdomadaire (renderWeeklySummary(), 09-parent.js) n'était rendue QUE si la
// messagerie était activée au moment de la consultation (chatIsEnabledByName).
// Un parent qui suspendait la messagerie après un incident (mots bloqués) perdait
// ainsi, dans le résumé de la semaine où l'incident a eu lieu, la trace même de
// ce qui avait motivé sa décision — au pire moment pour un outil de suivi
// parental. La section s'affiche désormais aussi si des données existent pour
// LA SEMAINE consultée (chatFlagsThis), indépendamment de l'état actuel.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '09-parent.js', '17-messaging.js'];

function setupWithChatFlags({ chatEnabledNow, flagTs }) {
  const api = loadGame(FILES);
  api._ls.setItem('user_Test', JSON.stringify({
    name: 'Test', history: [], historyDetailed: [], opStats: {},
    chatFlags: flagTs != null ? [{ ts: flagTs, word: 'con' }] : [],
  }));
  api._ls.setItem('chatProfiles', JSON.stringify({
    Test: { enabled: chatEnabledNow },
  }));
  api._domEl('parent-player').value = 'Test';
  return api;
}

describe('renderWeeklySummary() — la section messagerie/alerte reste visible même messagerie suspendue depuis', () => {
  it('messagerie ACTIVE + mot bloqué cette semaine : section affichée (cas déjà correct)', () => {
    const api = setupWithChatFlags({ chatEnabledNow: true, flagTs: Date.now() });
    api.renderWeeklySummary();
    const html = api._domEl('weekly-summary-zone').innerHTML;
    expect(html).toContain('1 message bloqué');
  });

  it('messagerie SUSPENDUE ENTRE-TEMPS, mais mot bloqué la semaine consultée : l\'alerte reste visible (correctif AUD-02-046)', () => {
    const api = setupWithChatFlags({ chatEnabledNow: false, flagTs: Date.now() });
    api.renderWeeklySummary();
    const html = api._domEl('weekly-summary-zone').innerHTML;
    expect(html).toContain('1 message bloqué');
    expect(html).toContain('Messagerie de');
  });

  it('messagerie suspendue ET aucune donnée pour cette semaine : la section reste masquée (pas de bruit inutile)', () => {
    const api = setupWithChatFlags({ chatEnabledNow: false, flagTs: null });
    api.renderWeeklySummary();
    const html = api._domEl('weekly-summary-zone').innerHTML;
    expect(html).not.toContain('Messagerie de');
  });

  it('messagerie active mais aucun mot bloqué cette semaine : section affichée sans badge d\'alerte (non-régression)', () => {
    const api = setupWithChatFlags({ chatEnabledNow: true, flagTs: null });
    api.renderWeeklySummary();
    const html = api._domEl('weekly-summary-zone').innerHTML;
    expect(html).toContain('Messagerie de');
    expect(html).not.toContain('message bloqué');
  });
});
