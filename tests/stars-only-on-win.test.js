import { describe, it, expect } from 'vitest';

// v12.7.17 — Bug trouvé lors de l'audit des gains d'étoiles demandé par
// Cyril : P.stars était crédité même en cas de défaite, contrairement à
// l'écran de fin de partie ("+0⭐" affiché sur défaite) et à la quête
// "Gagner X étoiles" (qui ne comptait déjà que les victoires).
//
// Note : pas de test bout-en-bout via endGame() — comme déjà noté dans
// journal-callback-variety.test.js, cette fonction a trop d'effets de bord
// DOM sans rapport pour être instrumentée simplement dans ce harnais minimal.
// On vérifie donc directement, au niveau source, que le crédit est bien
// conditionné à la victoire, pour le joueur actif ET pour les autres joueurs
// en mode Combat (même bug trouvé en double à la relecture).
describe('endGame() — étoiles créditées uniquement en cas de victoire (07-game.js)', () => {
  const readSrc = async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    return fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
  };

  it('le joueur actif : _starsGain est conditionné à "won" (0 sur défaite)', async () => {
    const src = await readSrc();
    expect(src).toContain('const _starsGain = won ? Math.round(GS.score * 1.5) : 0;');
    // L'ancienne version non conditionnée ne doit plus exister
    expect(src).not.toContain('const _starsGain = Math.round(GS.score * 1.5);');
  });

  it('mode Combat : les AUTRES joueurs ont aussi leur gain conditionné à leur propre victoire (cpWon)', async () => {
    const src = await readSrc();
    expect(src).toContain('const starsGain = cpWon ? Math.round((cp.score||0) * 1.5) : 0;');
    expect(src).not.toContain('const starsGain = Math.round((cp.score||0) * 1.5);');
  });

  it('SESSION_STATS.stars et P._totalStarsEarned réutilisent bien _starsGain (déjà conditionné, pas de second bug caché)', async () => {
    const src = await readSrc();
    expect(src).toContain('SESSION_STATS.stars=(SESSION_STATS.stars||0)+_starsGain;');
    expect(src).toContain('P._totalStarsEarned=(P._totalStarsEarned||0)+_starsGain;');
  });
});
