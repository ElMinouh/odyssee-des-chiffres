// tests/loadGame.js
// Charge tous les modules JS du jeu dans une sandbox vm et retourne le contexte.
// Toutes les fonctions/variables top-level sont accessibles via le contexte retourné.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const FILES = [
  'js/01-core.js',
  'js/02-data.js',
  'js/03-figurines-data.js',
  'js/04-questions.js',
  'js/05-profile.js',
  'js/06-time-block.js',
  'js/07-game.js',
  'js/08-ui.js',
  'js/09-parent.js',
  'js/10-figurines.js',
  'js/11-init.js',
];

const makeEl = () => ({
  innerHTML: '', innerText: '', textContent: '', value: '', checked: false, className: '',
  style: new Proxy({}, { get: () => '', set: () => true }),
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  addEventListener() {}, removeEventListener() {},
  querySelector: () => null, querySelectorAll: () => [],
  appendChild() {}, removeChild() {}, click() {}, focus() {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
  dataset: {}, nextElementSibling: null, offsetWidth: 0,
});

export function loadGame() {
  const ctx = { console };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.addEventListener = () => {}; // window.addEventListener
  ctx.removeEventListener = () => {};
  ctx.document = {
    body: { className: '', classList: { add() {}, remove() {}, toggle() {}, contains: () => false } },
    getElementById: () => makeEl(),
    createElement: () => makeEl(),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    activeElement: null,
  };
  ctx.localStorage = {
    store: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; },
  };
  ctx.alert = () => {};
  ctx.confirm = () => true;
  const ramp = { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 0 };
  ctx.AudioContext = function () {
    return {
      createOscillator: () => ({ type: '', frequency: ramp, connect() {}, start() {}, stop() {} }),
      createGain: () => ({ gain: ramp, connect() {} }),
      createBiquadFilter: () => ({ type: '', frequency: ramp, Q: ramp, connect() {} }),
      createDynamicsCompressor: () => ({ connect() {}, threshold: ramp, ratio: ramp, attack: ramp, release: ramp }),
      createWaveShaper: () => ({ connect() {}, curve: null, oversample: '' }),
      createDelay: () => ({ delayTime: ramp, connect() {} }),
      createAnalyser: () => ({ connect() {}, getByteFrequencyData() {}, frequencyBinCount: 0, fftSize: 0 }),
      createBufferSource: () => ({ buffer: null, connect() {}, start() {}, stop() {} }),
      createBuffer: () => ({ getChannelData: () => new Float32Array(1024), duration: 1, length: 1024 }),
      createPeriodicWave: () => ({}),
      destination: {}, currentTime: 0, state: 'running',
      resume: () => Promise.resolve(),
    };
  };
  ctx.requestAnimationFrame = () => 0;
  ctx.cancelAnimationFrame = () => {};
  ctx.performance = { now: () => Date.now() };
  ctx.speechSynthesis = { cancel() {}, speak() {}, getVoices: () => [] };
  ctx.SpeechSynthesisUtterance = function (t) { this.text = t; };
  ctx.Image = function () { this.src = ''; };
  ctx.fetch = () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') });
  ctx.DOMParser = function () { return { parseFromString: () => ({ querySelectorAll: () => [] }) }; };
  ctx.setTimeout = setTimeout;
  ctx.clearTimeout = clearTimeout;
  ctx.setInterval = setInterval;
  ctx.clearInterval = clearInterval;
  // Exposer les built-ins JS (ils ne sont pas hérités automatiquement par vm.createContext)
  Object.assign(ctx, {
    Math, JSON, Date, Object, Array, String, Number, Boolean,
    parseInt, parseFloat, isNaN, isFinite,
    Promise, Set, Map, Symbol, Error, TypeError, RangeError,
    encodeURIComponent, decodeURIComponent,
    Float32Array, Uint8Array,
    Number_isFinite: Number.isFinite,
    Proxy, Reflect,
  });

  vm.createContext(ctx);

  for (const f of FILES) {
    const code = readFileSync(join(process.cwd(), f), 'utf8');
    vm.runInContext(code, ctx, { filename: f });
  }

  // Exposer les `let`/`const` top-level (non accessibles via le contexte par défaut)
  // en les ré-attachant explicitement à `globalThis`.
  vm.runInContext(`
    if (typeof GS !== 'undefined') globalThis.GS = GS;
    if (typeof GM !== 'undefined') globalThis.GM = GM;
    if (typeof P !== 'undefined') globalThis.P = P;
    if (typeof SAVE_VERSION !== 'undefined') globalThis.SAVE_VERSION = SAVE_VERSION;
    if (typeof XP_TABLE !== 'undefined') globalThis.XP_TABLE = XP_TABLE;
    if (typeof XP_CUMUL !== 'undefined') globalThis.XP_CUMUL = XP_CUMUL;
    if (typeof FIGURINES !== 'undefined') globalThis.FIGURINES = FIGURINES;
    if (typeof MONSTER_ROSTER !== 'undefined') globalThis.MONSTER_ROSTER = MONSTER_ROSTER;
    if (typeof BOSS_ROSTER !== 'undefined') globalThis.BOSS_ROSTER = BOSS_ROSTER;
    if (typeof MAP_ZONES !== 'undefined') globalThis.MAP_ZONES = MAP_ZONES;
    if (typeof BADGES !== 'undefined') globalThis.BADGES = BADGES;
    if (typeof QUESTS !== 'undefined') globalThis.QUESTS = QUESTS;
    if (typeof WEEKLY_CH !== 'undefined') globalThis.WEEKLY_CH = WEEKLY_CH;
    if (typeof SOUND_MAP !== 'undefined') globalThis.SOUND_MAP = SOUND_MAP;
  `, ctx);

  return ctx;
}
