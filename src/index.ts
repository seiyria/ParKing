
import 'p2';
import 'pixi';
import 'phaser';

import * as WebFont from 'webfontloader';

import { World } from './ts/global/world';
import { GameState } from './ts/global/gamestate';
import { MainMenu } from './ts/menus/MainMenu';

import './index.css';

import { Boot } from './ts/states/boot';

class Game extends Phaser.Game {
  constructor(config) {
    super(config);

    this.state.add('boot', Boot);

    this.state.start('boot');
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

export let game: Game;

Promise.all([fontPromise, pixiPromise])
  .then(() => {
    game = new Game({
      width: '100%',
      height: '100%',
      renderer: Phaser.AUTO,
      resolution: 1
    });
  });
