// AUD-02-018 (audit fonctionnel 2026-09-21) — HIST_MAT_MS_SEQ3 (18-histoire.js)
// est la banque de séquences "remets dans le bon ordre" pour la maternelle
// (4-5 ans, module repères temporels/causaux). L'entrée météo présentait
// l'ordre pluie -> nuage -> arc-en-ciel comme LA bonne réponse (_histMatMS_seq3()
// utilise l'ordre littéral du tableau comme vérité terrain) — une causalité
// inversée : le nuage précède la pluie, l'arc-en-ciel apparaît après. Corrigé
// en nuage -> pluie -> arc-en-ciel.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['18-histoire.js'];

describe('HIST_MAT_MS_SEQ3 — séquence météo dans le bon ordre causal', () => {
  it('l\'ordre correct est nuage -> pluie -> arc-en-ciel', () => {
    const api = loadGame(FILES);
    const seq = api.HIST_MAT_MS_SEQ3.find(s => s.includes('🌈'));
    expect(seq).toEqual(['☁️', '🌧️', '🌈']);
  });

  it('l\'ancien ordre causalement inversé (pluie avant nuage) n\'existe plus', () => {
    const api = loadGame(FILES);
    const hasOldOrder = api.HIST_MAT_MS_SEQ3.some(s => s.join('') === ['🌧️', '☁️', '🌈'].join(''));
    expect(hasOldOrder).toBe(false);
  });
});
