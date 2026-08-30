import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// v12.7.21 — BUG CRITIQUE signalé par Cyril (captures à l'appui) : "les
// figurines sont bien acquises et le solde d'étoiles diminue correctement.
// Mais si on ferme le jeu et qu'on le rouvre, [...] le solde d'étoiles a
// remonté pour retrouver son montant maximal d'avant l'achat [...] ainsi on
// peut acheter des figurines à l'infini". Cause : out.stars = maxN(local,
// imported) dans _mergeCloudProfiles() — correct pour un compteur qui ne
// fait qu'augmenter, faux pour une monnaie qui peut légitimement diminuer
// (achat). Très probablement LA cause principale des 300 figurines/demi-
// odyssée signalées précédemment (bien plus que les bugs déjà corrigés).

const FULL_FILES = [
  '01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js',
  '16-francais.js', '18-histoire.js', '05-profile.js', '06a-adaptive.js',
  '06b-time-block.js', '06c-seasonal.js', '06d-cinematics.js',
  '07-story-core.js', '07-map.js', '07-game.js', '07-boss.js', '07-story.js', '08-ui.js', '09-parent.js', '10-figurines.js', '12-cloud.js',
];

describe('spend() — alimente _totalStarsSpent (07-game.js, point de dépense unique du jeu)', () => {
  it('un achat de figurine incrémente _totalStarsSpent du montant exact dépensé', () => {
    const api = loadGame(FULL_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 1000;
    const fig = api.FIGURINES.find(f => f.p > 0);
    api.setP(profile);
    api.buyFigurine(fig.id);
    expect(api.getP()._totalStarsSpent).toBe(fig.p);
    expect(api.getP().stars).toBe(1000 - fig.p);
  });

  it('deux achats successifs cumulent bien _totalStarsSpent', () => {
    const api = loadGame(FULL_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 1000;
    const figs = api.FIGURINES.filter(f => f.p > 0).slice(0, 2);
    api.setP(profile);
    api.buyFigurine(figs[0].id);
    api.buyFigurine(figs[1].id);
    expect(api.getP()._totalStarsSpent).toBe(figs[0].p + figs[1].p);
  });

  it('un achat via buySkill/buySound/buyMusic/buySkin alimente aussi _totalStarsSpent (même point de dépense unique)', () => {
    const api = loadGame(FULL_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 1000;
    api.setP(profile);
    api.buySkill('sword');
    expect(api.getP()._totalStarsSpent).toBeGreaterThan(0);
  });

  it('un achat refusé (pas assez d\'étoiles) n\'incrémente PAS _totalStarsSpent', () => {
    const api = loadGame(FULL_FILES);
    const profile = api.defProfile('Léo');
    profile.stars = 5;
    const fig = api.FIGURINES.find(f => f.p > 100);
    api.setP(profile);
    api.buyFigurine(fig.id);
    expect(api.getP()._totalStarsSpent).toBe(0);
    expect(api.getP().ownedFigurines).not.toContain(fig.id);
  });
});

describe('_mergeCloudProfiles() — stars dérivé, plus jamais remboursé par une synchronisation (12-cloud.js)', () => {
  it('SCÉNARIO EXACT DU BUG : achat local, puis synchronisation avec un serveur resté sur l\'ancien (plus haut) solde → le solde ne remonte plus', () => {
    const api = loadGame(['12-cloud.js']);
    // Avant achat : 1000⭐ gagnées, 0 dépensées, des deux côtés (synchronisé).
    // Achat LOCAL de 900⭐ de figurines : local dépense passe à 900.
    // Le serveur (imported), lui, n'a pas encore reçu ce push : reste à 0 dépensé.
    const local = { _totalStarsEarned: 1000, _totalStarsSpent: 900, adventureResetAt: 0 };
    const imported = { _totalStarsEarned: 1000, _totalStarsSpent: 0, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    // AVANT LE CORRECTIF : out.stars valait max(100, 1000) = 1000 (bug : le
    // solde "remontait" comme si l'achat n'avait jamais eu lieu).
    expect(out.stars).toBe(100);
  });

  it('un rachat ultérieur (nouvelle dépense) continue de fonctionner normalement après une fusion', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { _totalStarsEarned: 1000, _totalStarsSpent: 900, adventureResetAt: 0 };
    const imported = { _totalStarsEarned: 1000, _totalStarsSpent: 0, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out._totalStarsSpent).toBe(900); // le max des deux dépenses l'emporte, jamais moins
  });

  it('stars ne descend jamais sous 0 même dans un scénario incohérent', () => {
    const api = loadGame(['12-cloud.js']);
    const local = { _totalStarsEarned: 100, _totalStarsSpent: 500, adventureResetAt: 0 };
    const imported = { _totalStarsEarned: 100, _totalStarsSpent: 500, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out.stars).toBe(0);
  });

  it('un GAIN légitime sur un autre appareil (imported) s\'ajoute bien, sans revivre une ancienne dépense annulée', () => {
    const api = loadGame(['12-cloud.js']);
    // Local a dépensé 900 sur 1000 gagné (solde 100). Entre-temps, sur un
    // autre appareil, le joueur a gagné 200⭐ de plus (quête, palier...).
    const local = { _totalStarsEarned: 1000, _totalStarsSpent: 900, adventureResetAt: 0 };
    const imported = { _totalStarsEarned: 1200, _totalStarsSpent: 900, adventureResetAt: 0 };
    const out = api._mergeCloudProfiles(local, imported);
    expect(out._totalStarsEarned).toBe(1200);
    expect(out.stars).toBe(300); // 1200 − 900, le vrai solde à jour
  });
});

describe('validateProfile() — migration rétroactive unique du solde (05-profile.js, ADR-111 pt.3)', () => {
  it('un profil EXISTANT (jamais migré) voit son solde actuel préservé au premier chargement après ce correctif', () => {
    const api = loadGame(['05-profile.js']);
    // Profil "à l'ancienne" : 500⭐ en solde, _totalStarsEarned partiel (300,
    // ne reflétant qu'une partie de l'historique — normal pour un profil
    // créé avant ce correctif), _totalStarsSpent inexistant.
    const raw = { name: 'Léo', stars: 500, _totalStarsEarned: 300 };
    const out = api.validateProfile(raw, 'Léo');
    expect(out.stars).toBe(500); // solde réel préservé, pas écrasé
    expect(out._totalStarsEarned).toBe(500); // recalé sur le solde réel
    expect(out._totalStarsSpent).toBe(0);
    expect(out._starsLedgerMigrated).toBe(true);
  });

  it('la migration ne se déclenche qu\'une seule fois (idempotence)', () => {
    const api = loadGame(['05-profile.js']);
    const raw = { name: 'Léo', stars: 500, _totalStarsEarned: 300 };
    const migrated = api.validateProfile(raw, 'Léo');
    // Simule un rechargement ultérieur : le joueur a depuis dépensé 100⭐
    // normalement (stars=400, _totalStarsSpent=100 correctement suivi).
    const second = { ...migrated, stars: 400, _totalStarsSpent: 100 };
    const out = api.validateProfile(second, 'Léo');
    // Si la migration se relançait à tort, elle écraserait _totalStarsSpent
    // à 0 et _totalStarsEarned au solde actuel (400) au lieu de garder le
    // suivi réel — vérifié que ce n'est PAS le cas.
    expect(out._totalStarsSpent).toBe(100);
    expect(out._totalStarsEarned).toBe(500);
    expect(out.stars).toBe(400);
  });

  it('un profil NEUF (defProfile) n\'a jamais besoin de migration', () => {
    const api = loadGame(['05-profile.js']);
    const p = api.defProfile('Nouveau');
    expect(p._starsLedgerMigrated).toBe(true);
    expect(p._totalStarsEarned).toBe(0);
    expect(p._totalStarsSpent).toBe(0);
    expect(p.stars).toBe(0);
  });

  // v12.7.23 — BUG CRITIQUE trouvé en enquêtant sur le signalement de Cyril
  // (solde passé de ~1500 à plus de 7000⭐ sans rapport avec le jeu réel) :
  // la migration ci-dessus tournait aussi lors d'appels "secondaires" à
  // validateProfile() (parentRemoveFigurines, fusion cloud...), sur une
  // copie potentiellement PÉRIMÉE du profil (ex. l'appareil de gestion
  // parental n'a pas rejoué depuis longtemps). Une copie périmée avec un
  // ancien solde plus élevé se voyait alors "légitimer" à tort comme
  // nouveau plancher _totalStarsEarned — qui, une fois propagé, gagnait
  // pour de bon contre le vrai solde (maxN ne redescend jamais).
  it('{allowStarsMigration:false} empêche la migration de tourner sur une copie périmée', () => {
    const api = loadGame(['05-profile.js']);
    // Copie périmée (appareil de gestion), jamais migrée, avec un ancien
    // solde bien plus élevé que la réalité actuelle.
    const raw = { name: 'Léo', stars: 7000 };
    const out = api.validateProfile(raw, 'Léo', { allowStarsMigration: false });
    expect(out._totalStarsEarned).toBe(0); // PAS 7000 : aucun plancher inventé
    expect(out._totalStarsSpent).toBe(0);
    expect(out._starsLedgerMigrated).toBe(false); // pas marqué migré non plus
    expect(out.stars).toBe(7000); // le solde brut lui-même reste inchangé ici
  });

  it('SCÉNARIO EXACT DU BUG, de bout en bout : une copie périmée légitime NE PEUT PLUS l\'emporter après fusion', () => {
    const api = loadGame(['05-profile.js', '12-cloud.js']);
    // Le vrai solde actuel (appareil de l'enfant, déjà migré correctement) :
    const real = api.validateProfile({ name: 'Léo', stars: 1500, _totalStarsEarned: 1500, _totalStarsSpent: 0, _starsLedgerMigrated: true }, 'Léo');
    // L'appareil de gestion (parent), copie périmée jamais migrée, avec un
    // très ancien solde de 7000 (hérité par exemple de l'ancien bug de
    // fusion par maximum, avant qu'il ne soit corrigé) :
    const stale = api.validateProfile({ name: 'Léo', stars: 7000 }, 'Léo', { allowStarsMigration: false });
    const merged = api._mergeCloudProfiles(real, stale);
    // Avant le correctif v12.7.23 : stale aurait migré à earned=7000, et la
    // fusion aurait donné max(1500,7000)=7000 — le bug exact signalé.
    expect(merged._totalStarsEarned).toBe(1500);
    expect(merged.stars).toBe(1500);
  });
});
