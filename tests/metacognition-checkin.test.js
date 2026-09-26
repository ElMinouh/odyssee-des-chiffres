import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// AUD-10-017 (audit pédagogique 2026-09-26) — aucune invitation, nulle part, à
// réfléchir à la CAUSE d'une erreur (métacognition). _renderEndRecap() propose
// désormais un check-in ponctuel (3 choix simples) quand ≥3 erreurs dans la
// partie ; _metaCheckinAnswer() personnalise juste le message affiché ensuite.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '06a-adaptive.js', '07-game.js'];

describe('_renderEndRecap() — check-in métacognitif (07-game.js)', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
    api.setGM({ subject: 'math' });
  });

  it("n'affiche pas le check-in pour 1-2 erreurs seulement (pas systématique)", () => {
    api.setGS({ errList: [{ display: '7+5', res: 12, opKey: '+' }] });
    api._renderEndRecap(false);
    expect(api._domEl('end-correction').innerHTML).not.toContain('meta-checkin');
  });

  it('affiche le check-in à partir de 3 erreurs', () => {
    api.setGS({ errList: [
      { display: '7+5', res: 12, opKey: '+' },
      { display: '8+3', res: 11, opKey: '+' },
      { display: '9+4', res: 13, opKey: '+' },
    ] });
    api._renderEndRecap(false);
    expect(api._domEl('end-correction').innerHTML).toContain('meta-checkin');
    expect(api._domEl('end-correction').innerHTML).toContain("_metaCheckinAnswer('vite')");
  });

  it("n'affiche rien si la partie est sans faute", () => {
    api.setGS({ errList: [] });
    api._renderEndRecap(true);
    expect(api._domEl('end-correction').innerHTML).not.toContain('meta-checkin');
  });
});

describe('_metaCheckinAnswer() — personnalise le message et incrémente un compteur léger', () => {
  let api;
  beforeEach(() => {
    api = loadGame(FILES);
    api.setP(api.defProfile('TestKid'));
  });

  it('incrémente P.metaCheckin[reason]', () => {
    api._metaCheckinAnswer('fatigue');
    expect(api.getP().metaCheckin.fatigue).toBe(1);
    api._metaCheckinAnswer('fatigue');
    expect(api.getP().metaCheckin.fatigue).toBe(2);
  });

  it('remplace le contenu de #meta-checkin par un message adapté', () => {
    api._domEl('meta-checkin'); // s'assure que l'élément existe dans le registre
    api._metaCheckinAnswer('compris');
    expect(api._domEl('meta-checkin').innerHTML).toContain('indice');
  });

  it('ne plante pas pour une raison inconnue', () => {
    expect(() => api._metaCheckinAnswer('inconnu')).not.toThrow();
  });
});

describe('validateProfile() — metaCheckin fait partie de la liste blanche (AUD-02-022)', () => {
  it('un profil avec metaCheckin le conserve après validation', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo', metaCheckin: { vite: 3, compris: 1 } }, 'Léo');
    expect(out.metaCheckin).toEqual({ vite: 3, compris: 1 });
  });

  it('filtre les valeurs invalides (non numériques ou négatives)', () => {
    const api = loadGame(FILES);
    const out = api.validateProfile({ name: 'Léo', metaCheckin: { vite: -1, x: 'oops', fatigue: 2 } }, 'Léo');
    expect(out.metaCheckin).toEqual({ fatigue: 2 });
  });
});
