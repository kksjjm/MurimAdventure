// =============================================================================
// main.js - Phaser Game Entry Point for 무림기행 (Murim Adventure)
// =============================================================================

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import WorldScene from './scenes/WorldScene.js';
import UIScene from './scenes/UIScene.js';

// --- Game Configuration ---
const config = {
  type: Phaser.CANVAS,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, WorldScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

// --- Create Game Instance ---
const game = new Phaser.Game(config);

// --- Handle Window Resize ---
function handleResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Maintain 16:9 game resolution.
  const ratio = 960 / 540;
  let newWidth = w;
  let newHeight = w / ratio;

  if (newHeight > h) {
    newHeight = h;
    newWidth = h * ratio;
  }

  game.scale.resize(newWidth, newHeight);
}

window.addEventListener('resize', handleResize);

export default game;
