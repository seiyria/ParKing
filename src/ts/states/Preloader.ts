
import * as Phaser from 'phaser-ce';

import { AllMaps } from '../../maps';
import { ResourceManager } from '../global/resources';
import { GameState } from '../global/gamestate';

export class Preloader extends Phaser.State {

  private preloadBarSprite: Phaser.Sprite = null;
  private preloadFrameSprite: Phaser.Sprite = null;

  public preload(): void {
    this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preload-bar');
    this.preloadBarSprite.anchor.setTo(0, 0.5);
    this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;

    this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preload-frame');
    this.preloadFrameSprite.anchor.setTo(0.5);

    this.game.load.setPreloadSprite(this.preloadBarSprite);

    const allSprites = []
      .concat(ResourceManager.VehicleSprites)
      .concat(ResourceManager.ObjectSprites);

    allSprites.forEach(({ name, path }) => {
      this.game.load.image(name, path);
    });

    ResourceManager.InGameSpriteSheets.forEach(({ name, path }) => {
      this.game.load.spritesheet(name, path, 64, 64);
    });

    Object.keys(AllMaps).forEach(mapName => {
      this.game.load.tilemap(mapName, null, AllMaps[mapName], Phaser.Tilemap.TILED_JSON);
    });
  }

  public create(): void {

    // lets see that beautiful loading bar
    setTimeout(() => {
      GameState.pushState('MainMenu');
    }, 1000);
  }
}
