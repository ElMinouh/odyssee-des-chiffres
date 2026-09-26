import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-008 (audit pédagogique 2026-09-26) — un timeout de chronomètre appelait
// hitPlayer() directement (coût en vie) sans jamais mettre à jour P.opStats ni
// journaliser l'échec via logError() : une vraie lacune signalée uniquement par des
// timeouts répétés restait invisible à l'adaptativité (getDifficultySignal) et à la
// révision espacée (P.errorLog). _trackTimeoutAsError() reprend le même
// sous-ensemble de mises à jour que la branche d'échec de validate().
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '07-game.js'];

describe('_trackTimeoutAsError() — un timeout est tracké comme une erreur pédagogique (07-game.js)', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ level: 'CE1', subject: 'math' });
    api.setGS({ _opsPlayed: [] });
  });

  it('incrémente P.opStats[opKey].fail comme une vraie erreur', () => {
    const q = { display: '7 + 5', res: 12, opKey: '+' };
    api._trackTimeoutAsError(q);
    expect(api.getP().opStats['+'].fail).toBe(1);
  });

  it('journalise la question dans P.errorLog (révision espacée)', () => {
    const q = { display: '7 + 5', res: 12, opKey: '+' };
    api._trackTimeoutAsError(q);
    const logged = api.getP().errorLog.find(e => e.q === '7+5=12');
    expect(logged).toBeTruthy();
    // Un timeout n'est pas une réponse trop rapide : jamais marqué "inattention".
    expect(logged.inattention).toBe(false);
  });

  it("n'échoue pas silencieusement si aucune question n'est fournie", () => {
    expect(() => api._trackTimeoutAsError(null)).not.toThrow();
  });

  it('startTimer() appelle bien _trackTimeoutAsError() à l\'expiration (vérification source)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain("if(typeof _trackTimeoutAsError==='function')_trackTimeoutAsError(GS.q);hitPlayer('⌛ Trop lent, il esquive !');");
  });
});
