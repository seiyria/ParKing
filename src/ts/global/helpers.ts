
import { ConfigManager } from './config';

export class Helpers {
  public static defaultTextOptions(): PIXI.TextStyleOptions {
    return { fontFamily: 'Game', fontSize: ConfigManager.scaleX(24), fill: 0xFFFFFF, align: 'left' };
  }
}
