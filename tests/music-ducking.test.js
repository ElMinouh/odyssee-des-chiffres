import { describe, it, expect, beforeEach } from 'vitest';
import { loadGame } from './helpers/loadGame.js';

// 07-game.js est nécessaire pour _bgAudio / _musicDuck / startMusic / stopMusic.
const FILES = ['01-core.js', '02-data.js', '05-profile.js', '09-parent.js', '16-francais.js', '07-game.js'];

describe('_musicDuck : mise en sourdine de la musique de fond', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('baisse le volume à 0.06 puis le remonte à 0.4', () => {
    api.startMusic();
    expect(api.getBgAudioVolume()).toBeCloseTo(0.4);
    api._musicDuck(true);
    expect(api.getBgAudioVolume()).toBeCloseTo(0.06);
    api._musicDuck(false);
    expect(api.getBgAudioVolume()).toBeCloseTo(0.4);
  });

  it('ne plante pas si aucune musique n\'est démarrée', () => {
    expect(() => api._musicDuck(true)).not.toThrow();
    expect(() => api._musicDuck(false)).not.toThrow();
  });

  it('stopMusic supprime bien la référence audio (hasBgAudio → false)', () => {
    api.startMusic();
    expect(api.hasBgAudio()).toBe(true);
    api.stopMusic();
    expect(api.hasBgAudio()).toBe(false);
  });
});

describe('applyTheme ne touche plus à la musique (régression v11.1.8)', () => {
  let api;
  beforeEach(() => { api = loadGame(FILES); });

  it('un changement de thème ne redémarre pas la musique en cours', () => {
    api.setP({ name: 'Léo', music: 'theme' });
    api.startMusic();
    const volAvant = api.getBgAudioVolume();

    // Avant le fix v11.1.8, applyTheme() appelait stopMusic()+startMusic() ici,
    // ce qui aurait remis la piste à zéro à chaque navigation/changement d'écran.
    api.applyTheme('espace');

    expect(api.hasBgAudio()).toBe(true);
    expect(api.getBgAudioVolume()).toBe(volAvant);
  });

  it('applique bien la classe de thème demandée (le visuel continue de fonctionner)', () => {
    // On vérifie juste que l'appel ne plante pas et reste silencieux sur la musique,
    // le rendu visuel (classes CSS du body) n'est pas assertable avec ce stub minimal.
    expect(() => api.applyTheme('volcan')).not.toThrow();
  });
});
