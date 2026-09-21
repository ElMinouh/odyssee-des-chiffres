// AUD-02-026 (audit fonctionnel 2026-09-21) — une synchronisation cloud qui
// modifie réellement le profil actif (_importProfileFromServer(), 12-cloud.js)
// laisse désormais une trace dans le journal fonctionnel persistant du
// profil (logProfileEvent(), 05-profile.js), en réutilisant le résumé déjà
// calculé par _summarizeCloudMerge() (Lot 1.4, AUD-02-023) — pas une
// synchronisation de routine sans changement, pour ne pas noyer le journal.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '05-profile.js', '12-cloud.js'];

describe('_importProfileFromServer() — journalise une fusion qui change réellement quelque chose', () => {
  it('journalise quand la fusion modifie le profil (ex. gain d\'étoiles depuis un autre appareil)', async () => {
    const api = loadGame(FILES);
    const local = api.defProfile('TestKid');
    local.stars = 100; local._totalStarsEarned = 100;
    api.setP(local);
    const imported = api.defProfile('TestKid');
    imported.stars = 250; imported._totalStarsEarned = 250;

    await api._importProfileFromServer(imported);

    const log = api.getProfileLog('TestKid');
    expect(log.length).toBeGreaterThan(0);
    expect(log[log.length - 1].text).toContain('Synchronisation cloud');
    expect(log[log.length - 1].text).toContain('Étoiles');
  });

  it('ne journalise rien pour une synchronisation de routine sans changement', async () => {
    const api = loadGame(FILES);
    const local = api.defProfile('TestKid');
    api.setP(local);
    const imported = api.defProfile('TestKid');

    await api._importProfileFromServer(imported);

    expect(api.getProfileLog('TestKid')).toEqual([]);
  });
});
