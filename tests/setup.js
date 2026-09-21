// Setup vitest. Les tests chargent le jeu dans un sandbox isolé
// via tests/helpers/loadGame.js, donc aucun stub global n'est
// nécessaire ici. Fichier requis par vitest.config.js.

// v2 (audit AUD-01-021) : le sandbox vm partage le VRAI `console` du process
// (voir tests/helpers/loadGame.js, `sandbox.console = console`), donc tout
// `console.error()` émis par le code du jeu pendant un test finit sur le
// stderr de Vitest SANS faire échouer le test — une vraie erreur interne
// (ex. ReferenceError avalée par un catch) pouvait donc rester invisible
// indéfiniment, noyée dans la sortie de la suite. On intercepte chaque appel
// et on fait échouer le test s'il ne correspond pas à un cas déjà identifié
// et volontairement accepté (limite du sandbox, pas un bug du jeu).
const ALLOWED_ERRORS = [
  // Le sandbox n'a pas d'accès réseau : ce message est le comportement
  // attendu du repli "portraits non chargés", pas une erreur du jeu.
  /Portraits non charg.s\s*:\s*no network in tests/,
  // `AbortController` n'existe pas dans le sandbox vm (pas un stub du DOM) :
  // ce message est le scénario d'échec réseau volontairement exercé par
  // tests/cloud-sync-pull-before-push.test.js, pas un bug du jeu.
  /AbortController is not defined/,
];

let originalConsoleError;
let unexpectedCalls;

beforeEach(() => {
  unexpectedCalls = [];
  originalConsoleError = console.error;
  console.error = (...args) => {
    const msg = args.map(a => (a && a.stack) ? a.stack : String(a)).join(' ');
    if (!ALLOWED_ERRORS.some(re => re.test(msg))) unexpectedCalls.push(msg);
    originalConsoleError.apply(console, args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
  if (unexpectedCalls.length) {
    throw new Error(
      'console.error inattendu pendant le test (voir ALLOWED_ERRORS dans tests/setup.js si c\'est un cas légitime à ajouter) :\n'
      + unexpectedCalls.join('\n')
    );
  }
});
