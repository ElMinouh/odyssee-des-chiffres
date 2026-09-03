import { describe, it, expect } from 'vitest';

// v12.7.32 (demande de Cyril, dette technique) : confirmation renforcée pour
// "Reset Aventure" — le parent doit retaper le prénom exact du profil avant
// que le bouton de confirmation ne s'active. showConfirm() (01-core.js) gagne
// un paramètre générique opts.retypeValue, réutilisable pour tout futur
// reset/action sensible.
//
// Note méthodologique (comme déjà pour checkHeroStageProgress(), voir
// hero-stage-one-way-ratchet.test.js) : le harnais de test (tests/helpers/
// loadGame.js) a un DOM factice minimal — document.createElement()/
// querySelector() renvoient des éléments jetables non reliés entre eux, donc
// aucune vraie interaction DOM (clic, saisie, activation de bouton) n'est
// simulable ici. On vérifie donc au niveau SOURCE que le mécanisme est bien
// câblé, plutôt que son rendu réel (à confirmer en conditions réelles par
// Cyril).
describe('showConfirm() — confirmation renforcée par retype de texte (01-core.js)', () => {
  it('accepte opts.retypeValue et n\'active le bouton de confirmation que si la saisie correspond exactement', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '01-core.js'), 'utf8');
    const fnStart = src.indexOf('function showConfirm');
    const fnEnd = src.indexOf('function showObjectiveChoice');
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('opts.retypeValue');
    // Garde-fou côté clic : ne confirme jamais si le texte ne correspond pas.
    expect(fnBody).toContain("input.value.trim()!==retypeValue) return");
    // Le bouton est désactivé par défaut tant qu'il y a un retypeValue.
    expect(fnBody).toContain('disabled');
  });
});

describe('resetAdventure() — branché sur la confirmation renforcée (10-figurines.js)', () => {
  it('passe bien le prénom du joueur en retypeValue à showConfirm()', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '10-figurines.js'), 'utf8');
    const fnStart = src.indexOf('function resetAdventure');
    const fnEnd = src.indexOf('\n}', fnStart);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).toContain('retypeValue:playerName');
  });
});
