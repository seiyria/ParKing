
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

  create() {
    super.create();

    if(!this.transparentSprite) {
      this.transparentSprite = this.game.add.sprite(0, 0, 'default');
      this.transparentSprite.width = this.game.width;
      this.transparentSprite.height = this.game.height;
      this.transparentSprite.alpha = 0.5;
      this.transparentSprite.tint = 0x000000;
      this.menuItems.addAt(this.transparentSprite, 0);
    }

    this.addOption('Resume', { callback: () => {
      this.togglePause();
    }});

    this.addOption('Main Menu', { callback: () => {
      this.gamePaused = false;
      GameState.setPlaying(false);
      GameState.popState();
    }});

    this.toggleSpriteVisibility();
    this.recalculateVisibleOptions();
  }

  update() {
    if(!this.gamePaused) return;

    super.update();
    this.titleText.setText(`Paused (P${this.menuControlPlayer + 1 || '?'})`);
  }

  shutdown() {
    super.shutdown();

    this.gamePaused = false;
    this.transparentSprite.destroy();
  }

  protected togglePause(player?: number) {
    this.gamePaused = !this.gamePaused;
    GameState.setPlaying(this.gamePaused);

    if(this.gamePaused) {
      this.game.physics.p2.pause();
      this.game.world.bringToTop(this.menuItems);
    } else {
      this.game.physics.p2.resume();
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
