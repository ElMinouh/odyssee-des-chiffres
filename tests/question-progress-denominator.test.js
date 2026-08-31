import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
  '13-maternelle.js',
];

// v12.7.27 — Bug trouvé via les captures de Cyril : "⭐ I/6" restait affiché
// à l'identique sur deux étapes différentes d'un même lieu (une énigme et un
// combat), alors que le nombre réel de questions d'une étape varie de 4 à 6
// selon son type (monstre/énigme/mini-boss/boss). Cause : le dénominateur
// était écrit EN DUR ("/6"), sans jamais lire GS.questionsTarget — ce qui
// rendait cet indicateur impossible à utiliser pour vérifier une éventuelle
// anomalie sur le nombre de questions d'une étape (signalement initial de
// Cyril sur un boss à 3 questions).
describe('_matRenderQ() — le dénominateur reflète le vrai nombre de questions de l\'étape (13-maternelle.js)', () => {
  it('affiche GS.questionsTarget, pas "6" en dur, quand l\'étape a une autre valeur', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: { id: 'x', label: 'Zone Test', theme: 'inconnu' } });
    api.setP(api.defProfile('Test'));
    api.setGS({ qCount: 1, matZoneStepIdx: 0, questionsTarget: 4 });
    api._matRenderQ({ level: 'PS', consigne: 'Touche le crabe.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain('1/4');
    expect(api._domEl('quest-title').innerHTML).not.toContain('1/6');
  });

  it('deux étapes différentes (4 puis 6 questions) affichent bien des dénominateurs différents', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: { id: 'x', label: 'Zone Test', theme: 'inconnu' } });
    api.setP(api.defProfile('Test'));

    api.setGS({ qCount: 1, matZoneStepIdx: 0, questionsTarget: 4 });
    api._matRenderQ({ level: 'PS', consigne: 'A.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain('1/4');

    api.setGS({ qCount: 1, matZoneStepIdx: 4, questionsTarget: 6 });
    api._matRenderQ({ level: 'PS', consigne: 'B.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain('1/6');
  });

  it('valeur de repli à 6 si questionsTarget est absent (comportement historique préservé)', () => {
    const api = loadGame(FILES);
    api.setGM({ mapZone: { id: 'x', label: 'Zone Test', theme: 'inconnu' } });
    api.setP(api.defProfile('Test'));
    api.setGS({ qCount: 1, matZoneStepIdx: 0, questionsTarget: 0 });
    api._matRenderQ({ level: 'PS', consigne: 'Touche le crabe.', choices: [{ val: 1, html: '' }] });
    expect(api._domEl('quest-title').innerHTML).toContain('1/6');
  });
});

describe('renderQ() — même correctif dans le rendu standard non-maternelle (07-game.js)', () => {
  it('le code source lit bien GS.questionsTarget, plus de "6" écrit en dur', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '07-game.js'), 'utf8');
    expect(src).not.toContain('`👾 ${GS.qCount}/6`');
    expect(src).toContain('_renderQTarget');
  });
});
