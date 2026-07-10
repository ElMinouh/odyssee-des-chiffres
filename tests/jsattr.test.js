import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// _jsAttr est mutualisée dans 01-core.js depuis v11.1.10 (auparavant dupliquée
// entre 09-parent.js et 17-messaging.js). Ce fichier fige son comportement.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '09-parent.js', '16-francais.js'];

describe('esc() : échappement HTML de base', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('échappe &, <, >, "', () => {
    expect(api.esc('&<>"')).toBe('&amp;&lt;&gt;&quot;');
  });

  it("laisse l'apostrophe intacte (esc() seule ne suffit pas dans un onclick='...')", () => {
    expect(api.esc("O'Brien")).toBe("O'Brien");
  });
});

describe('_jsAttr() : échappement combiné HTML + argument JS (ADR-8)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('échappe l\'apostrophe pour un usage sûr dans onclick="fn(\'...\')"', () => {
    expect(api._jsAttr("O'Brien")).toBe("O\\'Brien");
  });

  it("échappe l'antislash AVANT l'apostrophe (ordre important, cf. faille v11.1.7)", () => {
    // Un nom contenant un antislash juste avant l'apostrophe finale ne doit pas
    // pouvoir casser la chaîne JS de l'attribut onclick. On construit l'entrée et
    // la sortie attendue caractère par caractère pour éviter toute erreur de
    // comptage de backslashs dans le test lui-même.
    const BS = '\\'; // un seul caractère antislash
    const input = 'a' + BS + "'" + 'b';                 // a \ ' b
    const expected = 'a' + BS.repeat(3) + "'" + 'b';     // a \\\ ' b (backslash doublé, puis apostrophe échappée)
    expect(api._jsAttr(input)).toBe(expected);
  });

  it('échappe aussi les caractères HTML (&, <, >, ")', () => {
    expect(api._jsAttr('<b>&"x')).toBe('&lt;b&gt;&amp;&quot;x');
  });

  it('gère les valeurs vides / non-string sans planter', () => {
    expect(() => api._jsAttr('')).not.toThrow();
    expect(() => api._jsAttr(null)).not.toThrow();
    expect(() => api._jsAttr(undefined)).not.toThrow();
  });

  it('un nom composite réaliste (contact messagerie) reste utilisable tel quel dans un attribut simple-guillemet', () => {
    const name = `L'éa\\`;
    const safe = api._jsAttr(name);
    // La chaîne échappée ne doit plus contenir d'apostrophe non échappée
    // ni d'antislash non échappé (ce qui garantit qu'elle ne casse pas
    // onclick="fn('...')").
    expect(/(^|[^\\])'/.test(safe)).toBe(false);
  });
});
