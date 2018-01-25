
import * as p2 from 'p2';

import { ConfigManager } from '../global/config';
import { World } from '../global/world';
import { Entity } from './Entity';

export class Wall extends Entity {

  constructor(opts: { x: number, y: number, w: number, h: number, angle: number }) {
    super(opts);
  }

  init(opts) {
    const { w, h } = opts;

    (<any>this.body).onCollision = () => {
      World.screenShake(2, 1);
    };

    this.box = new p2.Box({ width: ConfigManager.scaleXAndZoom(w), height: ConfigManager.scaleYAndZoom(h) });
    this.box.collisionGroup = ConfigManager.collisionMasks.WALL;
    this.box.collisionMask = ConfigManager.collisionMasks.PLAYER | ConfigManager.collisionMasks.CAR | ConfigManager.collisionMasks.TRUCKBACK;

    this.body.addShape(this.box);

    this.graphics.beginFill(0xFFFF00);
    this.graphics.drawRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height);
    this.graphics.position.x = this.body.position[0];
    this.graphics.position.y = this.body.position[1];
  }

  load() {}
  unload() {}

  debug(isDebug?: boolean) {
    if(!isDebug) {
      World.container.removeChild(this.graphics);
      return;
    }

    World.container.addChild(this.graphics);
  }
}
