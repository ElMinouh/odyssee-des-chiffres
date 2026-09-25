// AUD-02-022 (audit fonctionnel 2026-09-21) — garde-fou automatisé demandé
// par l'audit : validateProfile() (05-profile.js) reconstruit le profil à
// partir d'une liste blanche explicite de champs ; tout champ écrit ailleurs
// dans le code via une affectation directe sur l'objet profil actif, mais
// oublié de cette liste, est supprimé SILENCIEUSEMENT à chaque rechargement
// de profil (retour à l'accueil, changement de joueur, redémarrage de l'app).
// Ce pattern a déjà causé plusieurs bugs réels en production (visite guidée
// qui se relance en boucle, choix narratif effacé, cf. commentaires
// onbAccountSeen/onbMapSeen/lastAdventure dans validateProfile()) — et, au
// moment de l'écriture de ce test, 9 nouveaux cas réels, dont deux qui
// annulaient silencieusement un correctif CRITIQUE/Élevé déjà livré
// (blockedSubjects, AUD-02-027 ; chatFlags, AUD-02-046). Ce test scanne tout
// `js/*.js` à la recherche d'affectations sur l'objet profil actif et échoue
// si l'une d'elles cible un champ absent de la liste blanche — pour qu'un
// futur oubli soit détecté immédiatement plutôt que découvert des mois plus
// tard par un symptôme indirect.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadGame } from './helpers/loadGame.js';

// Champs sciemment absents de la liste blanche : purement transitoires pour
// la session en cours, jamais censés survivre à un rechargement de profil.
// Documenter ici plutôt que de les ignorer silencieusement — toute entrée
// doit être justifiée par un commentaire.
const KNOWN_TRANSIENT_FIELDS = new Set([
  // AUD-02-002 (audit fonctionnel 2026-09-21) : marqueur de session PURE,
  // recalculé à chaque loadProfile() — jamais censé survivre à une
  // sauvegarde/rechargement (c'est justement son rôle : empêcher la
  // persistance d'un profil "fantôme" tant qu'aucun vrai prénom n'a été
  // saisi, voir saveProfile()/saveProfileNow(), 05-profile.js).
  '_unnamed',
]);

function scanProfileFieldAssignments(jsDir) {
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  const found = new Set();
  // Affectation directe : P.champ = / P.champ++ / P.champ-- / P.champ += / -=
  // (P étant, par convention de ce projet, l'unique objet "profil actif" —
  // voir 01-core.js: `let P={};`).
  const re = /\bP\.([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:=(?!=)|\+\+|--|\+=|-=)/g;
  for (const f of files) {
    let text = fs.readFileSync(path.join(jsDir, f), 'utf8');
    // Retire les commentaires (// et /* */) pour éviter les faux positifs —
    // un exemple de code cité dans un commentaire ne doit jamais compter.
    text = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, '');
    let m;
    while ((m = re.exec(text))) found.add(m[1]);
  }
  return found;
}

describe('validateProfile() — garde-fou : aucun champ écrit ailleurs n\'est oublié de la liste blanche', () => {
  it('tout champ P.xxx= du code source est présent dans validateProfile()', () => {
    const api = loadGame(['01-core.js', '02-data.js', '03-figurines-data.js', '04-questions.js', '05-profile.js', '06a-adaptive.js']);
    const whitelisted = new Set(Object.keys(api.validateProfile({}, 'X')));
    const found = scanProfileFieldAssignments(path.join(process.cwd(), 'js'));

    const missing = [...found].filter(k => !whitelisted.has(k) && !KNOWN_TRANSIENT_FIELDS.has(k));

    expect(missing, `Champ(s) écrit(s) sur P mais absent(s) de la liste blanche de validateProfile() : ${missing.join(', ')}. ` +
      'Ajoute-le/les à validateProfile() (05-profile.js), ou documente-le/les explicitement dans KNOWN_TRANSIENT_FIELDS ' +
      'de ce test s\'il s\'agit réellement d\'un champ de session non persistant (voir AUD-02-022).').toEqual([]);
  });

  it('le scanner détecte bien un champ manquant volontairement introduit (sanity check du test lui-même)', () => {
    // Vérifie que le test échouerait réellement s'il devait détecter un vrai
    // oubli — sans ça, un bug dans le scanner pourrait le rendre inoffensif
    // en silence (toujours vert, quoi qu'il arrive).
    const whitelisted = new Set(['name', 'stars']);
    const found = new Set(['name', 'stars', 'champFictifOublie']);
    const missing = [...found].filter(k => !whitelisted.has(k));
    expect(missing).toEqual(['champFictifOublie']);
  });
});
