
import * as _ from 'lodash';

import { Menu } from './Menu';
import { KeyMapHandler } from '../../global/key';
import { GameState } from '../../global/gamestate';
import { ConfigManager } from '../../global/config';

const PARKING_1P_MENU   = 0;
const PARKING_MP_MENU   = 1;
const PARKING_GOLF_MENU = 2;

export class GameModeMenu extends Menu {

  protected menuTitle = ['Parking (1P)', 'Parking (2-4P)', 'Par King (1P)'];

  protected menuDescs = [
    'Park your cars as best as you can and get a new high score!',
    'Park your cars with your friends and compete to see who parks the best!',
    'Try to get under par while par king your cars!'
  ];

  constructor() {
    super({ menuVerticalOffset: 300, menuOptionSpacing: 100, menuAlign: 'center' });
  }

  create() {
    super.create();

    this.addOption('Play', { callback: () => {
      GameState.setPlayer(0, true);
      GameState.pushState('SingleplayerValet');
      GameState.setPlaying(true);
    }}, PARKING_1P_MENU);

    this.addOption('Play', { callback: () => {
      GameState.setPlayer(0, true);
      GameState.pushState('MultiplayerValet');
      GameState.setPlaying(true);
    }}, PARKING_MP_MENU);

    this.addOption('Play', { callback: () => {
      console.log('not yet implemented');
    }}, PARKING_GOLF_MENU);

    this.addOption('Variants', { callback: () => {
      GameState.pushState('VariantsMenu');
    }}, PARKING_MP_MENU);

    for(let i = 0; i < this.menuTitle.length; i++) {
      this.addOption('Back', { callback: () => {
        GameState.popState();
      }}, i);
    }

    this.recalculateVisibleOptions();
    this.selectedMenu = ConfigManager.gameMenu;
  }

  update() {
    super.update();

    if(KeyMapHandler.isDown('Left', this.menuControlPlayer)) {
      this.selectedMenu--;
      if(this.selectedMenu < 0) this.selectedMenu = this.options.length - 1;
      ConfigManager.setGameMenu(this.selectedMenu);
      this.recalculateVisibleOptions();
      return;
    }

    if(KeyMapHandler.isDown('Right', this.menuControlPlayer)) {
      this.selectedMenu++;
      if(this.selectedMenu >= this.options.length) this.selectedMenu = 0;
      ConfigManager.setGameMenu(this.selectedMenu);
      this.recalculateVisibleOptions();
      return;
    }
  }

}
