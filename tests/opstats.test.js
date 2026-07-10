import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const FILES = ['01-core.js', '02-data.js', '05-profile.js', '09-parent.js', '16-francais.js'];

describe('structure opStats / opStatsFr', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('un profil neuf a les 5 catégories maths et 4 catégories français', () => {
    const p = api.defProfile('Nina');
    expect(Object.keys(p.opStats).sort()).toEqual(['+', '-', '/', 'geo', 'x'].sort());
    expect(Object.keys(p.opStatsFr).sort()).toEqual(['conj', 'gram', 'orth', 'vocab']);
    // toutes initialisées à {ok:0, fail:0}
    for (const k of Object.keys(p.opStatsFr)) {
      expect(p.opStatsFr[k]).toEqual({ ok: 0, fail: 0 });
    }
  });

  it('un ancien profil sans opStatsFr récupère les 4 catégories par défaut', () => {
    const migrated = api.validateProfile({ name: 'Léo' }, 'Léo'); // aucun opStatsFr
    expect(Object.keys(migrated.opStatsFr).sort()).toEqual(['conj', 'gram', 'orth', 'vocab']);
    expect(migrated.opStatsFr.conj).toEqual({ ok: 0, fail: 0 });
  });

  it('les compteurs opStatsFr déjà remplis sont préservés à la validation', () => {
    const migrated = api.validateProfile(
      { name: 'Léo', opStatsFr: { conj: { ok: 3, fail: 1 } } },
      'Léo'
    );
    expect(migrated.opStatsFr.conj).toEqual({ ok: 3, fail: 1 });
    // les catégories absentes sont complétées par défaut
    expect(migrated.opStatsFr.vocab).toEqual({ ok: 0, fail: 0 });
  });

  it('opStats maths est bien préservé et complété', () => {
    const migrated = api.validateProfile(
      { name: 'Léo', opStats: { '+': { ok: 10, fail: 2 } } },
      'Léo'
    );
    expect(migrated.opStats['+']).toEqual({ ok: 10, fail: 2 });
    expect(migrated.opStats['geo']).toEqual({ ok: 0, fail: 0 });
  });
});

describe('_frCatOf : mapping opKey français → 4 catégories', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  const cas = [
    ['conj', ['fr-conj', 'fr6-temps', 'frm-mode', 'conj-present']],
    ['orth', ['fr-dictee', 'fr-mbp', 'fr-pp', 'fr-plur', 'fr-accord', 'fr-graph', 'fr-orth', 'fr-lettre']],
    ['gram', ['fr-nature', 'fr-fonc', 'fr-ptype', 'fr-phrase', 'fr-cod', 'fr-rel', 'fr-voix', 'fr6-nat']],
    ['vocab', ['fr-syn', 'fr-pref', 'fr-fam', 'fr-homo', 'fr-syll', 'fr-son', 'frm-ecoute', 'nimporte']],
  ];

  for (const [attendu, cles] of cas) {
    it(`renvoie "${attendu}" pour : ${cles.join(', ')}`, () => {
      for (const k of cles) {
        expect(api._frCatOf(k)).toBe(attendu);
      }
    });
  }

  // v11.1.10 : l'anomalie "fr-opp" → "orth" (collision avec "pp") a été corrigée
  // par une exception explicite dans _frCatOf. Ce test vérifie maintenant le
  // comportement CORRIGÉ (auparavant il figeait le bug avec expect('orth')).
  it('[fixé v11.1.10] fr-opp (antonymes) est bien classé en vocab', () => {
    expect(api._frCatOf('fr-opp')).toBe('vocab');
  });

  it('gère les entrées vides / nulles sans planter (→ vocab par défaut)', () => {
    expect(api._frCatOf('')).toBe('vocab');
    expect(api._frCatOf(null)).toBe('vocab');
    expect(api._frCatOf(undefined)).toBe('vocab');
  });
});
