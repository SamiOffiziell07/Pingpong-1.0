import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { GameScene } from './scenes/GameScene.js';
import { createTuningPanel } from './ui/TuningPanel.js';
import { initStartScreen } from './ui/startScreen.js';
import { initPauseMenu } from './ui/pauseMenu.js';
import { initSettings } from './ui/settings.js';
import { tuning, showTuningPanel } from './config.js';

// 1. Wire up the HTML start screen (emojis, button, font preloading)
initStartScreen();
initSettings();

// 3. Build the tuning panel (dev tool — only when enabled)
if (showTuningPanel) {
  createTuningPanel(tuning);
  const panel = document.getElementById('tuning-panel');
  if (panel) panel.style.display = '';
}

// 3. Boot Phaser immediately behind the start screen overlay.
//    BootScene warms up WebGL and waits for the user to click Play.
//    GameScene is launched on demand, and signals 'scene' readiness
//    when create() completes — triggering the final transition.
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0b0b0e',
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  render: {
    powerPreference: 'high-performance',
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
};

const game = new Phaser.Game(config);
window.samixGame = game; // handy for debugging in the browser console

// 4. Pause button + pause menu (needs the game instance to pause the scene)
initPauseMenu(game);
