// Lot 3.3 (audit fonctionnel 2026-09-21, Phase 3) — contenu résiduel.
//
// AUD-02-017 : _matRang (13-maternelle.js, "touche le premier/deuxième/…
// objet") était codé mais absent de tout pool jouable (_MAT_POOL) et du
// dictionnaire de phases — jamais joué par aucun enfant.
//
// AUD-02-038 : le texte unlockHint affiché pour une figurine completionLock
// verrouillée était une chaîne figée en dur dans les données
// (03-figurines-data.js), non recalculée si une figurine est ajoutée à une
// licence existante — contrairement à _isLicenseCompletionUnlocked() qui,
// lui, recalcule dynamiquement la même condition.
import { describe, it, expect } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

const MAT_FILES = ['01-core.js', '02-data.js', '13-maternelle.js'];
const FIG_FILES = ['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js', '07-game.js', '08-ui.js', '10-figurines.js'];

describe('AUD-02-017 — _matRang est désormais joué (MS)', () => {
  it('_matRang figure dans _MAT_POOL.MS', () => {
    const api = loadGame(MAT_FILES);
    expect(api._MAT_POOL.MS).toContain(api._matRang);
  });

  it('_matRang porte une phase assignée dans le dictionnaire de phases (source)', async () => {
    // Note harnais : l'IIFE qui pose .ph (13-maternelle.js) utilise
    // window[name] pour retrouver chaque fonction — le sandbox de test expose
    // `window` comme un stub SÉPARÉ du contexte global (pas un alias, comme
    // dans un vrai navigateur), donc .ph ne se pose jamais réellement ici,
    // pour AUCUNE fonction de ce fichier (limite pré-existante du harnais,
    // déjà documentée pour _progSelfCheck(), ADR-144). Vérifié au niveau
    // source à la place.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.join(process.cwd(), 'js', '13-maternelle.js'), 'utf8');
    expect(src).toMatch(/_matRang\s*:\s*2/);
  });

  it('produit bien une question ordinale jouable', () => {
    const api = loadGame(MAT_FILES);
    const q = api._matRang('MS');
    expect(q.consigne).toMatch(/Touche le (premier|deuxième|troisième|dernier)/);
    expect(Array.isArray(q.choices)).toBe(true);
    expect(q.choices.length).toBeGreaterThan(0);
  });

  it('n\'a pas été ajouté par erreur à PS ou GS (périmètre du lot : MS uniquement)', () => {
    const api = loadGame(MAT_FILES);
    expect(api._MAT_POOL.PS).not.toContain(api._matRang);
    expect(api._MAT_POOL.GS).not.toContain(api._matRang);
  });
});

describe('AUD-02-038 — unlockHint recalculé dynamiquement, jamais figé en dur', () => {
  it('_licenseUnlockHint() donne le même texte que la donnée figée en dur, pour une licence inchangée', () => {
    const api = loadGame(FIG_FILES);
    const gd10 = api.FIGURINES.find(f => f.id === 'gd10');
    expect(api._licenseUnlockHint(gd10)).toBe(gd10.unlockHint);
  });

  it('CŒUR DU CORRECTIF : le texte affiché s\'actualise automatiquement si une figurine est ajoutée à la licence', () => {
    const api = loadGame(FIG_FILES);
    const gd10 = api.FIGURINES.find(f => f.id === 'gd10');
    // Avant ajout : "les 9 autres figurines Goldorak" (10 figurines gd au total, gd10/gd11 completionLock).
    expect(api._licenseUnlockHint(gd10)).toContain('9 autres figurines Goldorak');
    // Simule l'ajout d'une nouvelle figurine Goldorak (non-completionLock) au catalogue.
    api.FIGURINES.push({ id: 'gd99', uni: 'Goldorak', uk: 'gd', p: 100, completionLock: false });
    // AVANT ce correctif, le texte figé en dur serait resté "les 9 autres" à
    // tort (désormais 10 figurines de base réellement à réunir) — la donnée
    // fig.unlockHint elle-même n'a pas bougé, mais _licenseUnlockHint() ne la
    // lit plus : elle recalcule à partir du catalogue réel.
    expect(api._licenseUnlockHint(gd10)).toContain('10 autres figurines Goldorak');
  });

  it('renderFigurinesShop() affiche bien le texte dynamique (pas la donnée figée) pour une figurine verrouillée', () => {
    const api = loadGame(FIG_FILES);
    const p = api.defProfile('Léo'); p.stars = 9999;
    api.setP(p);
    api.FIGURINES.push({ id: 'gd99', uni: 'Goldorak', uk: 'gd', p: 100, completionLock: false });
    api.renderFigurinesShop('gd');
    const html = api._domEl('p-figurines').innerHTML;
    expect(html).toContain('10 autres figurines Goldorak');
  });

  it('le toast de refus d\'achat (buyFigurine) utilise aussi le texte dynamique', () => {
    const api = loadGame(FIG_FILES);
    const p = api.defProfile('Léo'); p.stars = 9999;
    api.setP(p);
    api.buyFigurine('gd10'); // licence non complète : achat refusé
    expect(api._domEl('toast').innerText).toContain('9 autres figurines Goldorak');
  });

  it('licence sans figurine "de base" restante (fallback) reste protégée', () => {
    const api = loadGame(FIG_FILES);
    expect(api._licenseUnlockHint({ uk: 'inexistant', id: 'zzz', uni: 'Rien' })).toBe('À gagner en boss');
  });
});
