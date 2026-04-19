// tests/setup.js
// Stubs minimalistes des API navigateur pour que les modules JS
// puissent être évalués dans Node.js sans planter.
import { vi, beforeEach } from 'vitest';

const makeEl = () => ({
  innerHTML: '',
  innerText: '',
  textContent: '',
  value: '',
  checked: false,
  className: '',
  style: new Proxy({}, { get: () => '', set: () => true }),
  classList: {
    add() {},
    remove() {},
    toggle() {},
    contains() {
      return false;
    },
  },
  addEventListener() {},
  removeEventListener() {},
  querySelector: () => null,
  querySelectorAll: () => [],
  appendChild() {},
  removeChild() {},
  click() {},
  focus() {},
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
  dataset: {},
  nextElementSibling: null,
  offsetWidth: 0,
});

global.window = global;
global.document = {
  body: {
    className: '',
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  },
  getElementById: () => makeEl(),
  createElement: () => makeEl(),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  activeElement: null,
};

global.localStorage = {
  store: {},
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  },
  setItem(k, v) {
    this.store[k] = String(v);
  },
  removeItem(k) {
    delete this.store[k];
  },
  clear() {
    this.store = {};
  },
};

global.alert = () => {};
global.confirm = () => true;

// AudioContext stub : tous les noeuds renvoient des objets neutres.
global.AudioContext = function () {
  const ramp = { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, value: 0 };
  return {
    createOscillator: () => ({ type: '', frequency: ramp, connect() {}, start() {}, stop() {}, onended: null }),
    createGain: () => ({ gain: ramp, connect() {} }),
    createBiquadFilter: () => ({ type: '', frequency: ramp, Q: ramp, connect() {} }),
    createDynamicsCompressor: () => ({
      connect() {},
      threshold: ramp,
      ratio: ramp,
      attack: ramp,
      release: ramp,
    }),
    createWaveShaper: () => ({ connect() {}, curve: null, oversample: '' }),
    createDelay: () => ({ delayTime: ramp, connect() {} }),
    createAnalyser: () => ({ connect() {}, getByteFrequencyData() {}, frequencyBinCount: 0, fftSize: 0 }),
    createBufferSource: () => ({ buffer: null, connect() {}, start() {}, stop() {}, loop: false }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(1024), duration: 1, length: 1024 }),
    createPeriodicWave: () => ({}),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: () => Promise.resolve(),
  };
};

global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.performance = { now: () => Date.now() };
global.speechSynthesis = { cancel() {}, speak() {}, getVoices: () => [] };
global.SpeechSynthesisUtterance = function (t) {
  this.text = t;
};
global.Image = function () {
  this.src = '';
};
global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve('') });
global.DOMParser = function () {
  return { parseFromString: () => ({ querySelectorAll: () => [] }) };
};

// Réinitialiser localStorage entre les tests pour éviter les fuites d'état.
beforeEach(() => {
  global.localStorage.clear();
});

// Helper : charger tous les modules JS dans l'ordre déclaré dans index.html.
// Utilisé par les tests qui veulent vérifier le projet en entier.
global.__loadAllModules = function () {
  const fs = require('node:fs');
  const path = require('node:path');
  const files = [
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
  for (const f of files) {
    const code = fs.readFileSync(path.join(process.cwd(), f), 'utf8');
    // eslint-disable-next-line no-new-func
    new Function(code).call(global);
  }
};
