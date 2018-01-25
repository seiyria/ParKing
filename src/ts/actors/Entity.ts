
import * as p2 from 'p2';
import * as _ from 'lodash';

import { ConfigManager } from '../global/config';
import { World } from '../global/world';

const defaults = {
  x                 : 0,
  y                 : 0,
  angle             : 0,
  velX              : 0,
  velY              : 0,
  mass              : 1,
  angV              : 0
};

export abstract class Entity {

  protected body: p2.Body;
  protected box: p2.Box;
  protected graphics: PIXI.Graphics;
  protected sprite: PIXI.Sprite;

  constructor(opts) {
    opts = _.defaults(opts, defaults);

    this.body = new p2.Body({
      position: [ConfigManager.scaleXAndZoom(opts.x), ConfigManager.scaleYAndZoom(opts.y)],
      mass: opts.mass,
      angle: opts.angle,
      velocity: [opts.velX, opts.velY],
      angularVelocity: opts.angV
    });

    this.graphics = new PIXI.Graphics();
    this.addToWorld();

    this.init(opts);
    this.update();
  }

  protected abstract init(opts?);

  protected addToWorld() {
    World.p2world.addBody(this.body);
    World.container.addChild(this.graphics);
  }

  protected removeFromWorld() {
    World.p2world.removeBody(this.body);
    World.container.removeChild(this.graphics);
  }

  update() {
    this.graphics.position.x = this.body.position[0];
    this.graphics.position.y = this.body.position[1];
    this.graphics.rotation =   this.body.angle;
  }

  debug(isDebug: boolean) {
    if(!isDebug) {
      this.graphics.clear();
      this.sprite.alpha = 1;
      return;
    }

    this.graphics.beginFill(0x000000);
    this.graphics.drawRect(-this.box.width / 2, -this.box.height / 2, this.box.width, this.box.height);
    this.sprite.alpha = 0.6;
  }

}
