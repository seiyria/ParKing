
import 'p2';
import 'pixi';
import 'phaser';

import * as WebFont from 'webfontloader';

import { World } from './ts/global/world';
import { GameState } from './ts/global/gamestate';
import { MainMenu } from './ts/menus/MainMenu';

import { Boot } from './ts/states/boot';

import './index.css';

class Game extends Phaser.Game {
  constructor(config) {
    super(config);

    this.state.add('Boot', Boot);

    this.state.start('Boot');
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

export let game: Game;

Promise.all([fontPromise])
  .then(() => {
    game = new Game({
      width: '100%',
      height: '100%',
      renderer: Phaser.AUTO,
      resolution: 1
    });
  });
