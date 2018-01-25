
import * as p2 from 'p2';

import { Entity } from './Entity';
import { ConfigManager } from '../global/config';
import { ResourceManager } from '../global/resources';
import { World } from '../global/world';

const PARKING_SPACE_SCALE_X = 0.6;
const PARKING_SPACE_SCALE_Y = 0.35;

export class ParkingSpace extends Entity {

  constructor(opts: { x: number, y: number, angle: number }) {
    super(opts);
  }

  init(opts) {
    this.box = new p2.Box({
      width: ConfigManager.scaleXAndZoom(PARKING_SPACE_SCALE_X),
      height: ConfigManager.scaleYAndZoom(PARKING_SPACE_SCALE_Y)
    });

    this.box.collisionGroup = ConfigManager.collisionMasks.SCORE;
    this.box.collisionMask = ConfigManager.collisionMasks.CAR | ConfigManager.collisionMasks.TRUCKBACK;
    this.box.collisionResponse = false;
    this.box.sensor = true;

    this.body.addShape(this.box);

    this.sprite = new PIXI.Sprite(ResourceManager.getResource('parking-outline'));
    this.sprite.scale.x = ConfigManager.scaleXAndZoom(PARKING_SPACE_SCALE_X);
    this.sprite.scale.y = ConfigManager.scaleYAndZoom(PARKING_SPACE_SCALE_Y);
    this.sprite.rotation = Math.PI;

    this.graphics = new PIXI.Graphics();
    this.graphics.position.x = this.body.position[0];
    this.graphics.position.y = this.body.position[1];
    this.graphics.rotation = this.body.angle;

    this.graphics.addChild(this.sprite);
    World.container.addChild(this.graphics);
  }

  load() {}
  unload() {
    World.container.removeChild(this.graphics);
  }

  debug(isDebug: boolean) {
    if(!isDebug) {
      this.graphics.clear();
      this.sprite.alpha = 1;
      return;
    }

    this.graphics.beginFill(0xFF0000);
    this.graphics.drawRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height);
    this.sprite.alpha = 0.6;
  }
}
