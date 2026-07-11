// ─────────────────────────────────────────────────────────────
// Harness de test — charge les vrais fichiers du jeu dans un
// sandbox isolé (vm), sans navigateur, pour tester les fonctions
// globales sans dupliquer leur code.
//
// Principe : le jeu est en "global scope" (pas de modules).
//  - on concatène les fichiers sources nécessaires,
//  - on les exécute dans un contexte vm avec des stubs (DOM,
//    localStorage, window) suffisants pour que le chargement
//    passe sans erreur,
//  - un épilogue expose les fonctions + des accesseurs pour
//    piloter les variables globales P / GM depuis les tests.
//
// Aucun fichier du jeu n'est modifié : on ajoute seulement un
// bloc d'exposition à la fin du script concaténé.
// ─────────────────────────────────────────────────────────────
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Les fichiers du jeu sont dans le sous-dossier js/ du repo.
const GAME_DIR = path.resolve(HERE, '..', '..', 'js');

// localStorage factice (compatible avec l'API utilisée par le jeu)
function makeLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
    _dump: () => Object.fromEntries(store), // pratique pour les assertions
  };
}

// Élément DOM factice minimal (aucune de nos fonctions testées ne
// s'en sert vraiment, mais le stub évite un crash si appelé).
function fakeEl() {
  const cls = new Set();
  return {
    value: '', innerHTML: '', className: '', style: {},
    classList: {
      add(...c) { c.forEach((x) => cls.add(x)); },
      remove(...c) { c.forEach((x) => cls.delete(x)); },
      toggle(c, force) {
        const on = force !== undefined ? force : !cls.has(c);
        if (on) cls.add(c); else cls.delete(c);
        return on;
      },
      contains(c) { return cls.has(c); },
      [Symbol.iterator]() { return cls[Symbol.iterator](); },
    },
    appendChild() {}, removeChild() {}, setAttribute() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
  };
}

/**
 * Charge le jeu dans un sandbox et renvoie l'API exposée.
 * @param {string[]} files  liste des fichiers du jeu à charger, dans l'ordre
 * @param {object}   initialStorage  contenu initial du localStorage
 */
export function loadGame(files, initialStorage = {}) {
  const localStorage = makeLocalStorage(initialStorage);

  const documentStub = {
    getElementById: () => null,
    createElement: () => fakeEl(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: fakeEl(),
    documentElement: fakeEl(),
  };

  const windowStub = {
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    addEventListener: () => {},
    location: { href: '', reload() {} },
  };

  const sandbox = {
    console,
    localStorage,
    document: documentStub,
    window: windowStub,
    navigator: { language: 'fr-FR', onLine: true },
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    fetch: () => Promise.reject(new Error('no network in tests')),
    speechSynthesis: { speak() {}, cancel() {}, getVoices: () => [] },
    SpeechSynthesisUtterance: function () {},
    Audio: function () { return { play() { return Promise.resolve(); }, pause() {}, addEventListener() {} }; },
    Image: function () { return {}; },
    requestAnimationFrame: () => 0,
    // $ est souvent utilisé dans le jeu : on renvoie un élément factice
    $: () => fakeEl(),
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  // Concaténation des sources + épilogue d'exposition.
  const sources = files.map((f) => {
    const p = path.join(GAME_DIR, f);
    return `\n// ===== ${f} =====\n` + fs.readFileSync(p, 'utf8');
  }).join('\n');

  const epilogue = `
;globalThis.__api = {
  // --- fonctions testées (référencées par closure lexicale) ---
  isUnlocked: (typeof isUnlocked==='function') ? isUnlocked : undefined,
  prevWins:   (typeof prevWins==='function')   ? prevWins   : undefined,
  _subjWins:  (typeof _subjWins==='function')  ? _subjWins  : undefined,
  _subjWinsKey:(typeof _subjWinsKey==='function')? _subjWinsKey : undefined,
  renameProfile:(typeof renameProfile==='function')? renameProfile : undefined,
  validateProfile:(typeof validateProfile==='function')? validateProfile : undefined,
  defProfile:(typeof defProfile==='function')? defProfile : undefined,
  _frCatOf:   (typeof _frCatOf==='function')   ? _frCatOf   : undefined,
  getRoster:  (typeof getRoster==='function')  ? getRoster  : undefined,
  setRoster:  (typeof setRoster==='function')  ? setRoster  : undefined,
  getBirthdays:(typeof getBirthdays==='function')? getBirthdays : undefined,
  // --- musique / ducking (v11.1.10) ---
  applyTheme:  (typeof applyTheme==='function')  ? applyTheme  : undefined,
  startMusic:  (typeof startMusic==='function')  ? startMusic  : undefined,
  stopMusic:   (typeof stopMusic==='function')   ? stopMusic   : undefined,
  _musicDuck:  (typeof _musicDuck==='function')  ? _musicDuck  : undefined,
  getBgAudioVolume: () => (typeof _bgAudio!=='undefined' && _bgAudio) ? _bgAudio.volume : undefined,
  hasBgAudio:  () => (typeof _bgAudio!=='undefined') ? (_bgAudio !== null) : undefined,
  // --- échappement (v11.1.10 : _jsAttr mutualisée dans 01-core.js) ---
  esc:      (typeof esc==='function')     ? esc     : undefined,
  _jsAttr:  (typeof _jsAttr==='function') ? _jsAttr : undefined,
  // --- histoire (v11.2.0) + maternelle (v11.3.0/v11.3.1) ---
  _histCatOf: (typeof _histCatOf==='function') ? _histCatOf : undefined,
  GEN_HIST:   (typeof GEN_HIST!=='undefined')  ? GEN_HIST   : undefined,
  _histMatBinaryChoices: (typeof _histMatBinaryChoices==='function') ? _histMatBinaryChoices : undefined,
  _histMatPS_jourNuit: (typeof _histMatPS_jourNuit==='function') ? _histMatPS_jourNuit : undefined,
  _histMatPS_avantApres: (typeof _histMatPS_avantApres==='function') ? _histMatPS_avantApres : undefined,
  HIST_MAT_PS_JOURNUIT: (typeof HIST_MAT_PS_JOURNUIT!=='undefined') ? HIST_MAT_PS_JOURNUIT : undefined,
  HIST_MAT_PS_AVANTAPRES: (typeof HIST_MAT_PS_AVANTAPRES!=='undefined') ? HIST_MAT_PS_AVANTAPRES : undefined,
  HIST_6E_CHRONO: (typeof HIST_6E_CHRONO!=='undefined') ? HIST_6E_CHRONO : undefined,
  HIST_5E_CHRONO: (typeof HIST_5E_CHRONO!=='undefined') ? HIST_5E_CHRONO : undefined,
  HIST_4E_CHRONO: (typeof HIST_4E_CHRONO!=='undefined') ? HIST_4E_CHRONO : undefined,
  HIST_3E_CHRONO: (typeof HIST_3E_CHRONO!=='undefined') ? HIST_3E_CHRONO : undefined,
  HIST_6E_VRAIFAUX: (typeof HIST_6E_VRAIFAUX!=='undefined') ? HIST_6E_VRAIFAUX : undefined,
  HIST_5E_VRAIFAUX: (typeof HIST_5E_VRAIFAUX!=='undefined') ? HIST_5E_VRAIFAUX : undefined,
  HIST_4E_VRAIFAUX: (typeof HIST_4E_VRAIFAUX!=='undefined') ? HIST_4E_VRAIFAUX : undefined,
  HIST_3E_VRAIFAUX: (typeof HIST_3E_VRAIFAUX!=='undefined') ? HIST_3E_VRAIFAUX : undefined,
  // --- accès au localStorage factice pour les assertions ---
  _ls: (typeof localStorage!=='undefined') ? localStorage : undefined,
  // --- accesseurs pour piloter l'état global depuis les tests ---
  setP: (v) => { P = v; },
  getP: () => P,
  setGMsubject: (s) => { GM.subject = s; },
  getGM: () => GM,
};
`;

  const context = vm.createContext(sandbox);
  vm.runInContext(sources + epilogue, context, { filename: 'game-bundle.js' });
  return sandbox.__api;
}
