import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    // audit AUD-01-020 : aucune mesure de couverture n'existait — 530+ tests
    // verts ne disaient rien sur la proportion de code réellement exercée.
    //
    // LIMITE CONNUE (non résolue) : `npm run test:coverage` rapporte 0% sur
    // TOUS les fichiers, y compris ceux massivement exercés par la suite.
    // Ce n'est pas un manque de tests : tests/helpers/loadGame.js concatène
    // tout js/*.js dans un seul `vm.Script` nommé "game-bundle.js"
    // (vm.runInContext(sources, context, {filename:'game-bundle.js'})).
    // Le code s'exécute réellement, mais V8/Vitest ne peut pas relier cette
    // exécution aux fichiers sources réels de `include` ci-dessous — il n'y
    // a qu'un seul script synthétique, pas un module par fichier.
    // Pour un chiffre fiable, il faudrait charger chaque fichier comme son
    // propre vm.Script (filename = son vrai chemin) dans loadGame.js — hors
    // périmètre ici : ce fichier est partagé par les 60 suites de test,
    // toucher à son mécanisme de chargement mérite son propre lot dédié
    // avec validation complète de la suite avant/après.
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
      reporter: ['text', 'html'],
    },
  },
});
