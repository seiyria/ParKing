
import * as Phaser from 'phaser-ce';
import { ResourceManager } from '../global/resources';

export class Boot extends Phaser.State {

  public preload(): void {
    ResourceManager.UISprites.forEach(({ name, path }) => {
      this.game.load.image(name, path);
    });
  }

  public create(): void {
    this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

    this.game.state.start('Preloader');
  }
}
