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
    appendChild() {}, removeChild() {}, remove() {}, setAttribute() {}, addEventListener() {},
    querySelector() { return fakeEl(); }, querySelectorAll() { return []; },
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

  // v12.0.20 — Registre des éléments créés dynamiquement (document.createElement),
  // distinct du registre par id ci-dessus : plusieurs fonctions du jeu créent un
  // <div> overlay et posent son innerHTML sans jamais lui donner d'id ni l'exposer
  // (_renderColBook, _openBossCard, openAdventureLog...). Ce registre permet aux
  // tests d'inspecter le dernier overlay créé (voir _lastCreatedElement ci-dessous).
  const createdElements = [];

  const documentStub = {
    getElementById: (id) => registryEl(id),
    createElement: () => { const el = fakeEl(); createdElements.push(el); return el; },
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
    // Découvert en corrigeant un test flaky (validate-characterization) : un
    // contexte vm a par défaut son PROPRE objet Math, distinct de celui du
    // process de test. vi.spyOn(Math,'random') dans un test n'a donc AUCUN
    // effet sur le Math.random() utilisé par le code du jeu tant qu'on ne
    // partage pas explicitement le même objet Math ici.
    Math,
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
  GEN_FR:     (typeof GEN_FR!=='undefined')    ? GEN_FR     : undefined,
  _frUnique:  (typeof _frUnique==='function')  ? _frUnique  : undefined,
  _frCatAllowed: (typeof _frCatAllowed==='function') ? _frCatAllowed : undefined,
  getFrCatFilters: (typeof getFrCatFilters==='function') ? getFrCatFilters : undefined,
  _matchesHomework: (typeof _matchesHomework==='function') ? _matchesHomework : undefined,
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
  // --- correctifs v11.5.4 (bugs/dette technique : région finale FR, carnet
  // de collection généralisé, stats par matière généralisées) ---
  PRIM_ZONES_FR: (typeof PRIM_ZONES_FR!=='undefined') ? PRIM_ZONES_FR : undefined,
  _PRIM_REGIONS_FR: (typeof _PRIM_REGIONS_FR!=='undefined') ? _PRIM_REGIONS_FR : undefined,
  MAT_ZONES_FR: (typeof MAT_ZONES_FR!=='undefined') ? MAT_ZONES_FR : undefined,
  _MAT_REGIONS_FR: (typeof _MAT_REGIONS_FR!=='undefined') ? _MAT_REGIONS_FR : undefined,
  COL_ZONES_FR: (typeof COL_ZONES_FR!=='undefined') ? COL_ZONES_FR : undefined,
  _COL_REGIONS_FR: (typeof _COL_REGIONS_FR!=='undefined') ? _COL_REGIONS_FR : undefined,
  _ADV_COLLECTION_FN: (typeof _ADV_COLLECTION_FN!=='undefined') ? _ADV_COLLECTION_FN : undefined,
  _trackSubjCatStat: (typeof _trackSubjCatStat==='function') ? _trackSubjCatStat : undefined,
  _trackSubjCatError: (typeof _trackSubjCatError==='function') ? _trackSubjCatError : undefined,
  setGMadventure: (v) => { GM.adventure = v; },
  // --- correctif v11.5.4 (boutiques par îlot alignées sur l'environnement) ---
  getArchShops: () => (typeof _ARCH_SHOPS!=='undefined') ? _ARCH_SHOPS : undefined,
  _ARCH_SHOPS_PRIM: (typeof _ARCH_SHOPS_PRIM!=='undefined') ? _ARCH_SHOPS_PRIM : undefined,
  _ARCH_SHOPS_MAT: (typeof _ARCH_SHOPS_MAT!=='undefined') ? _ARCH_SHOPS_MAT : undefined,
  _ARCH_SHOPS_COL: (typeof _ARCH_SHOPS_COL!=='undefined') ? _ARCH_SHOPS_COL : undefined,
  _ARCH_SHOPS_MATFR: (typeof _ARCH_SHOPS_MATFR!=='undefined') ? _ARCH_SHOPS_MATFR : undefined,
  _ARCH_SHOPS_PRIMFR: (typeof _ARCH_SHOPS_PRIMFR!=='undefined') ? _ARCH_SHOPS_PRIMFR : undefined,
  _ARCH_SHOPS_COLFR: (typeof _ARCH_SHOPS_COLFR!=='undefined') ? _ARCH_SHOPS_COLFR : undefined,
  _ARCH_SHOPS_HIST: (typeof _ARCH_SHOPS_HIST!=='undefined') ? _ARCH_SHOPS_HIST : undefined,
  // --- v11.7.3 (audit n°28) : générateurs de questions, jusqu'ici non exposés,
  // ce qui explique l'absence totale de tests sur le cœur mathématique du jeu.
  GEN: (typeof GEN!=='undefined') ? GEN : undefined,
  genQ_CP:  (typeof genQ_CP==='function')  ? genQ_CP  : undefined,
  genQ_CE1: (typeof genQ_CE1==='function') ? genQ_CE1 : undefined,
  genQ_CE2: (typeof genQ_CE2==='function') ? genQ_CE2 : undefined,
  genQ_CM1: (typeof genQ_CM1==='function') ? genQ_CM1 : undefined,
  genQ_CM2: (typeof genQ_CM2==='function') ? genQ_CM2 : undefined,
  genQ_6E:  (typeof genQ_6E==='function')  ? genQ_6E  : undefined,
  genQ_5E:  (typeof genQ_5E==='function')  ? genQ_5E  : undefined,
  genQ_4E:  (typeof genQ_4E==='function')  ? genQ_4E  : undefined,
  genQ_3E:  (typeof genQ_3E==='function')  ? genQ_3E  : undefined,
  // --- v11.7.4 (filet de sécurité pour validate(), en vue d'une future
  // factorisation prudente — voir audit n°18) : accès à GS et powers, et à
  // validate() elle-même. GM est déjà accessible via getGM/setGMsubject ;
  // setGM() ajouté ici pour couvrir les autres champs (mode2, level...).
  validate: (typeof validate==='function') ? validate : undefined,
  resetGS: (typeof resetGS==='function') ? resetGS : undefined,
  getGS: () => (typeof GS!=='undefined') ? GS : undefined,
  setGS: (patch) => { Object.assign(GS, patch); },
  setGM: (patch) => { Object.assign(GM, patch); },
  getPowers: () => (typeof powers!=='undefined') ? powers : undefined,
  // --- Audit fonctionnel (#14/#19) : le module cloud (12-cloud.js) n'était
  // chargé par aucun test. On expose ici la logique de fusion non destructive
  // (#2) et les helpers de code, qui sont des fonctions pures testables sans
  // réseau (les fonctions async qui appellent fetch restent hors périmètre :
  // le sandbox n'a pas de vrai réseau, cf. helpers/loadGame.js).
  _mergeCloudProfiles: (typeof _mergeCloudProfiles==='function') ? _mergeCloudProfiles : undefined,
  isValidCloudCode: (typeof isValidCloudCode==='function') ? isValidCloudCode : undefined,
  generateCloudCode: (typeof generateCloudCode==='function') ? generateCloudCode : undefined,
  // --- v12.0.20 (filet de non-régression narrative, fiche 9 de l'audit de
  // cohérence globale) : les fonctions de rendu de contenu narratif qui
  // doivent TOUJOURS produire un bouton de fermeture visible.
  _renderColBook: (typeof _renderColBook==='function') ? _renderColBook : undefined,
  _renderHistBook: (typeof _renderHistBook==='function') ? _renderHistBook : undefined,
  _openBossCard: (typeof _openBossCard==='function') ? _openBossCard : undefined,
  _renderTaleIllus: (typeof _renderTaleIllus==='function') ? _renderTaleIllus : undefined,
  openAdventureLog: (typeof openAdventureLog==='function') ? openAdventureLog : undefined,
  // --- ADR-52 (Lot 2, garde-fou de non-régression pour le reset Odyssée) ---
  // resetAdventure() passe par showConfirm() (boîte de dialogue réelle, DOM) ;
  // ce stub minimal permet aux tests de déclencher directement le onConfirm
  // sans simuler un vrai clic sur un bouton fictif.
  setShowConfirm: (fn) => { globalThis.showConfirm = fn; },
  resetAdventure: (typeof resetAdventure==='function') ? resetAdventure : undefined,
  _allOdysseyStorySeenIds: (typeof _allOdysseyStorySeenIds==='function') ? _allOdysseyStorySeenIds : undefined,
  // --- ADR-57 (Lot 6, garde-fou ton tender/standard, ADR-45) ---
  _dialogueTone: (typeof _dialogueTone==='function') ? _dialogueTone : undefined,
  MONSTER_DIALOGUES: (typeof MONSTER_DIALOGUES!=='undefined') ? MONSTER_DIALOGUES : undefined,
};
`;

  const context = vm.createContext(sandbox);
  vm.runInContext(sources + epilogue, context, { filename: 'game-bundle.js' });
  // Exposition côté Node (pas dans l'épilogue vm) : le registre d'éléments créés
  // vit dans la closure de loadGame(), inaccessible depuis le code vm.
  sandbox.__api._createdElements = () => createdElements;
  sandbox.__api._lastCreatedElement = () => createdElements[createdElements.length - 1];
  return sandbox.__api;
}
