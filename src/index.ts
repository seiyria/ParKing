
import 'p2';
import 'pixi';
import 'phaser';

import * as Phaser from 'phaser-ce';

import './index.css';

import * as WebFont from 'webfontloader';

import { Boot } from './ts/states/Boot';
import { Preloader } from './ts/states/Preloader';

import * as MenuStates from './ts/states/menu';
import * as GameModes from './ts/states/gamemode';

class ParkingGame extends Phaser.Game {
  constructor(config) {
    super(config);

    this.state.add('Boot', Boot);
    this.state.add('Preloader', Preloader);

    Object.keys(MenuStates).forEach(key => {
      this.state.add(key, MenuStates[key]);
    });

    Object.keys(GameModes).forEach(key => {
      this.state.add(key, GameModes[key]);
    });

    this.state.start('Boot');
  }
}

const fontPromise = new Promise(resolve => {
  WebFont.load({
    custom: {
      families: ['Game']
    },
    active: resolve
  });
});

export let game: ParkingGame;

Promise.all([fontPromise])
  .then(() => {
    game = new ParkingGame({
      width: window.innerWidth,
      height: window.innerHeight,
      renderer: Phaser.AUTO
    });

    setTimeout(() => {
      game.stage.disableVisibilityChange = true;
    });
  });
