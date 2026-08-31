import { describe, it, expect } from 'vitest';

// v12.7.28 — BUG CRITIQUE trouvé via les captures de Cyril : un boss (ex.
// "Renard Chercheur") ne durait que 3 questions alors que l'étape
// précédente, dans le même lieu, en affichait correctement 5 (et la donnée
// de la zone prévoit 6 pour ce boss). Cause : les PV du boss suivaient une
// formule générique HP_LVL[niveau]+2 (=3 pour les niveaux PS/MS/GS/CP),
// totalement indépendante du nombre de questions RÉELLEMENT configuré sur
// l'étape (GS.questionsTarget) — et atteindre 0 PV sur un boss termine le
// combat directement (playCongrats), sans jamais vérifier GS.qCount/_qTarget.
//
// Note : pas de test bout-en-bout via nextTurn()/validate() — ces fonctions
// ont trop d'effets de bord DOM (rendu de question, animations) pour être
// instrumentées simplement dans ce harnais minimal (même limitation déjà
// documentée pour endGame()/checkHeroStageProgress()). On vérifie donc la
// formule exacte au niveau source.
describe('PV du boss alignés sur le nombre de questions de l\'étape (07-game.js)', () => {
  const readSrc = async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    return fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
  };

  it('en Odyssée, monsterMaxHP suit GS.questionsTarget pour un boss, pas seulement HP_LVL+2', async () => {
    const src = await readSrc();
    expect(src).toContain('GS.monsterMaxHP=GS.isBoss?(GS.questionsTarget||(HP_LVL[GM.level]+2)):HP_LVL[GM.level];');
  });

  it('l\'ancienne formule (HP_LVL[niveau]+2 seule, sans questionsTarget) a bien disparu', async () => {
    const src = await readSrc();
    expect(src).not.toContain('GS.monsterMaxHP=GS.isBoss?HP_LVL[GM.level]+2:HP_LVL[GM.level];');
  });

  it('le mode Combat (nextCombat, hors Odyssée) n\'est pas concerné par ce correctif — formule inchangée', async () => {
    const src = await readSrc();
    expect(src).toContain('GS.monsterMaxHP=HP_LVL[GM.level]||1;GS.monsterHP=GS.monsterMaxHP;');
  });
});

describe('Calcul direct de la formule corrigée (reproductible sans dépendances DOM)', () => {
  // Reproduit exactement la formule pour vérifier son comportement sur les
  // cas concrets du signalement (PS/MS/GS/CP → HP_LVL=1, boss auparavant à 3 PV).
  const HP_LVL = { PS: 1, MS: 1, GS: 1, CP: 1, CE1: 2, CE2: 3, CM1: 4, CM2: 5, '6E': 3, '5E': 3, '4E': 4, '3E': 4 };
  const computeMonsterMaxHP = (isBoss, level, questionsTarget) =>
    isBoss ? (questionsTarget || (HP_LVL[level] + 2)) : HP_LVL[level];

  it('boss niveau PS avec 6 questions configurées : 6 PV désormais, plus 3', () => {
    expect(computeMonsterMaxHP(true, 'PS', 6)).toBe(6);
  });

  it('boss niveau PS avec 4 questions configurées (autre lieu) : 4 PV, cohérent avec l\'étape', () => {
    expect(computeMonsterMaxHP(true, 'PS', 4)).toBe(4);
  });

  it('boss SANS questionsTarget (mode classique/legacy) : repli sur l\'ancienne formule', () => {
    expect(computeMonsterMaxHP(true, 'PS', 0)).toBe(3); // HP_LVL.PS(1) + 2
    expect(computeMonsterMaxHP(true, 'CM2', undefined)).toBe(7); // HP_LVL.CM2(5) + 2
  });

  it('monstre normal (non-boss) : formule inchangée, jamais influencée par questionsTarget', () => {
    expect(computeMonsterMaxHP(false, 'PS', 6)).toBe(1);
    expect(computeMonsterMaxHP(false, 'CM2', 6)).toBe(5);
  });
});
