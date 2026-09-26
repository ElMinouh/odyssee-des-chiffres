import { describe, it, expect } from 'vitest';

// AUD-10-002 (audit pédagogique 2026-09-26) — le verrouillage de niveau
// (UNLOCK_REQ/isUnlocked()) n'était garanti que par l'attribut HTML `disabled` posé
// sur les <option> du sélecteur (applyPrefs(), 05-profile.js) — jamais revérifié au
// moment de lancer réellement une partie. startGame() lisait $('levelSelect').value
// brut, sans second appel à isUnlocked().
//
// Note : pas de test bout-en-bout via startGame() — cette fonction a, comme
// endGame(), trop d'effets de bord DOM (audio, thème, timers) pour ce harnais
// minimal (cf. stars-only-on-win.test.js). Vérification au niveau source.
describe('startGame() — le niveau choisi est revalidé par isUnlocked() (07-game.js)', () => {
  it("GM.level ne retombe plus sur la seule valeur brute du sélecteur", async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).toContain(
      "GM.level=(VALID_LEVELS.includes(rawLevel) && typeof isUnlocked==='function' && isUnlocked(rawLevel, GM.subject)) ? rawLevel : 'CP';"
    );
    // L'ancienne affectation sans revalidation ne doit plus exister telle quelle.
    expect(src).not.toContain("GM.level=VALID_LEVELS.includes(rawLevel)?rawLevel:'CP';GM.mapZone=null;");
  });
});
