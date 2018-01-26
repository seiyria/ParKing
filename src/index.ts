
import * as PIXI from 'pixi.js';
import * as WebFont from 'webfontloader';

import { World } from './ts/global/world';
import { GameState } from './ts/global/gamestate';
import { MainMenu } from './ts/menus/MainMenu';

import './index.css';

class Game {

  static init() {
    World.renderer.backgroundColor = 0x040404;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const menu = new MainMenu();
    GameState.addMenu(menu);
    World.stage.addChild(menu);

    World.resetPosition();
    World.resetScale();

    document.body.appendChild(World.renderer.view);
  }
}

const fontPromise = new Promise(resolve => {
  WebFont.load({
    custom: {
      families: ['Game']
    },
    active: () => {
      resolve();
    }
  });
});

const pixiPromise = new Promise(resolve => {
  PIXI.loader.once('complete', resolve);
});

Promise.all([fontPromise, pixiPromise])
  .then(Game.init);
