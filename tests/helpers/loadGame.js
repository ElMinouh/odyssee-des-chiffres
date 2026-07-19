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

  // v11.5.1 — Registre d'éléments persistants par id : contrairement à un
  // stub qui renvoie systématiquement null (ou un nouvel élément jetable à
  // chaque appel), ce registre renvoie LE MÊME objet pour un id donné, ce qui
  // permet d'écrire des tests qui appellent une fonction du jeu (ex.
  // openOdysseeSelect()) puis vérifient le textContent qu'elle a posé sur un
  // élément (ex. document.getElementById('ody-prim-sub').textContent).
  const elementRegistry = new Map();
  function registryEl(id) {
    if (!elementRegistry.has(id)) {
      const el = fakeEl();
      el.id = id;
      elementRegistry.set(id, el);
    }
    return elementRegistry.get(id);
  }

  const documentStub = {
    getElementById: (id) => registryEl(id),
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
;// Le harness DOM est volontairement minimal (pas de vrai rendu) : openMap()
// et navTo() manipulent des éléments réels du DOM et plantent dans ce sandbox.
// On les neutralise pour pouvoir tester startAdventure() (permutation des
// globals d'aventure) sans avoir besoin d'un DOM complet.
if (typeof openMap === 'function') { globalThis.openMap = function(){}; }
if (typeof navTo === 'function') { globalThis.navTo = function(){}; }
globalThis.__api = {
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
  // --- Odyssée du Temps : histoire primaire (v11.5.0) ---
  startAdventure: (typeof startAdventure==='function') ? startAdventure : undefined,
  PRIM_ZONES_HIST: (typeof PRIM_ZONES_HIST!=='undefined') ? PRIM_ZONES_HIST : undefined,
  _PRIM_REGIONS_HIST: (typeof _PRIM_REGIONS_HIST!=='undefined') ? _PRIM_REGIONS_HIST : undefined,
  _PRIM_STORY_HIST: (typeof _PRIM_STORY_HIST!=='undefined') ? _PRIM_STORY_HIST : undefined,
  _PRIM_VILLAIN_HIST: (typeof _PRIM_VILLAIN_HIST!=='undefined') ? _PRIM_VILLAIN_HIST : undefined,
  _HIST_BOOKS: (typeof _HIST_BOOKS!=='undefined') ? _HIST_BOOKS : undefined,
  _advCollectionHtml: (typeof _advCollectionHtml==='function') ? _advCollectionHtml : undefined,
  _advHistLibraryHtml: (typeof _advHistLibraryHtml==='function') ? _advHistLibraryHtml : undefined,
  _questVocab: (typeof _questVocab==='function') ? _questVocab : undefined,
  _questEntries: (typeof _questEntries==='function') ? _questEntries : undefined,
  _regionOfZone: (typeof _regionOfZone==='function') ? _regionOfZone : undefined,
  _zonesOfRegion: (typeof _zonesOfRegion==='function') ? _zonesOfRegion : undefined,
  _regionConquered: (typeof _regionConquered==='function') ? _regionConquered : undefined,
  getMapZones: () => (typeof MAP_ZONES!=='undefined') ? MAP_ZONES : undefined,
  getArchRegions: () => (typeof _ARCH_REGIONS!=='undefined') ? _ARCH_REGIONS : undefined,
  getStory: () => (typeof _STORY!=='undefined') ? _STORY : undefined,
  getStoryVillain: () => (typeof STORY_VILLAIN!=='undefined') ? STORY_VILLAIN : undefined,
  // --- correctifs v11.5.1 (oublis "Histoire" dans plusieurs écrans) ---
  IMPLEMENTED_SUBJECTS: (typeof IMPLEMENTED_SUBJECTS!=='undefined') ? IMPLEMENTED_SUBJECTS : undefined,
  _BSUBJ_LIST: (typeof _BSUBJ_LIST!=='undefined') ? _BSUBJ_LIST : undefined,
  openOdysseeSelect: (typeof openOdysseeSelect==='function') ? openOdysseeSelect : undefined,
  renderHistory: (typeof renderHistory==='function') ? renderHistory : undefined,
  setHistSubj: (typeof setHistSubj==='function') ? setHistSubj : undefined,
  onHwLevelChange: (typeof onHwLevelChange==='function') ? onHwLevelChange : undefined,
  renderHomework: (typeof renderHomework==='function') ? renderHomework : undefined,
  loadBlockedSubjects: (typeof loadBlockedSubjects==='function') ? loadBlockedSubjects : undefined,
  // Accesseur DOM générique : renvoie l'élément (persistant) pour un id donné,
  // pour lire ce qu'une fonction testée y a posé (textContent, innerHTML, value...).
  _domEl: (id) => { try{ return document.getElementById(id); }catch(e){ return undefined; } },
  // --- filtres "types de questions autorisés" histoire (v11.5.2) ---
  _histUnique: (typeof _histUnique==='function') ? _histUnique : undefined,
  _histCatAllowed: (typeof _histCatAllowed==='function') ? _histCatAllowed : undefined,
  getHistCatFilters: (typeof getHistCatFilters==='function') ? getHistCatFilters : undefined,
  onFilterSubjectChange: (typeof onFilterSubjectChange==='function') ? onFilterSubjectChange : undefined,
  loadFilterSettings: (typeof loadFilterSettings==='function') ? loadFilterSettings : undefined,
  saveFilterSettings: (typeof saveFilterSettings==='function') ? saveFilterSettings : undefined,
};
`;

  const context = vm.createContext(sandbox);
  vm.runInContext(sources + epilogue, context, { filename: 'game-bundle.js' });
  return sandbox.__api;
}
