
import * as Phaser from 'phaser-ce';

import { ResourceManager } from '../global/resources';
import { GameState } from '../global/gamestate';

export class Boot extends Phaser.State {

  public preload(): void {
    const allSprites = ResourceManager.UISprites;

    allSprites.forEach(({ name, path }) => {
      this.game.load.image(name, path);
    });
  }

  public create(): void {
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    this.game.stage.disableVisibilityChange = true;

    this.game.input.gamepad.start();
    GameState.init(this.game);

    this.game.state.start('Preloader');
  }
}
