
import * as _ from 'lodash';
import * as Phaser from 'phaser-ce';

import { Menu } from './Menu';
import { GameState } from '../../global/gamestate';

export abstract class PausableMenu extends Menu {

  protected menuTitle = ['Paused'];
  private transparentSprite: Phaser.Sprite;
  protected gamePaused: boolean;

  constructor() {
    super({ menuVerticalOffset: 300, menuOptionSpacing: 100, menuAlign: 'center' });
  }

  init() {
    super.init();

    this.transparentSprite = this.game.add.sprite(0, 0, 'default');
    this.transparentSprite.width = this.game.width;
    this.transparentSprite.height = this.game.height;
    this.transparentSprite.alpha = 0.8;
    this.transparentSprite.tint = 0x000000;
    this.menuItems.addAt(this.transparentSprite, 0);
  }

  create() {
    super.create();

    this.addOption('Resume', { callback: () => {
      this.togglePause();
    }});

    this.addOption('Main Menu', { callback: () => {
      this.gamePaused = false;
      this.doUnpauseActions();
      GameState.popState();
    }});

    this.toggleSpriteVisibility();
    this.recalculateVisibleOptions();
  }

  update() {
    if(!this.gamePaused) return;

    super.update();
  }

  shutdown() {
    super.shutdown();

    this.gamePaused = false;
    this.transparentSprite.destroy();
  }

  protected repositionTitleText() {
    super.repositionTitleText();
    this.titleText.setText(`Paused (P${this.menuControlPlayer + 1 || '?'})`);
  }

  private doPauseActions() {
    GameState.setPlaying(false);
    this.game.paused = true;
    this.game.world.bringToTop(this.menuItems);
  }

  private doUnpauseActions() {
    GameState.setPlaying(true);
    this.game.paused = false;
  }

  protected runKeyCallback(callback: (args) => void, args: any) {
    // confirm would run the first button, which is "resume" which runs togglePause
    if(!this.gamePaused && args.key === 'Confirm') return;
    callback(args);
  }

  protected togglePause(player?: number) {
    this.gamePaused = !this.gamePaused;

    if(this.gamePaused) {
      this.doPauseActions();
    } else {
      this.doUnpauseActions();
    }

    this.selectedOption = 0;
    this.menuControlPlayer = this.gamePaused ? player : null;

    this.toggleSpriteVisibility();
  }

  private toggleSpriteVisibility() {
    const allSprites = [..._.map(this.currentOptions, 'textObj'), this.pointer, this.alphaText, this.titleText, this.transparentSprite];
    allSprites.forEach(sprite => {
      sprite.visible = !sprite.visible;
    });
  }

}
