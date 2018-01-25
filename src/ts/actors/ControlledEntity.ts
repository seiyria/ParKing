
import * as _ from 'lodash';
import * as p2 from 'p2';

import { Entity } from './Entity';
import { World } from '../global/world';
import { ConfigManager } from '../global/config';
import { isKeyDown } from '../global/key';
import { ResourceManager } from '../global/resources';

const overrideDefaults = {
  angle: -1.5708
};

export abstract class ControlledEntity extends Entity {

  private myPlayer: number;

  protected vehicle: any;     // p2.TopDownVehicle
  protected frontWheel: any;  // p2.WheelConstraint;
  protected backWheel: any;   // p2.WheelConstraint;

  protected wheelSprites: PIXI.Sprite[];

  protected maxSteer: number;

  constructor(opts) {
    super(_.defaults(opts, overrideDefaults));
  }

  init(opts) {
    opts.w = opts.w || 0.5;
    opts.h = opts.h || 0.875;
    opts.maxSteer = opts.maxSteer || 20000;
    opts.wheelTexture = opts.wheelTexture || ResourceManager.getResource('car-wheel');
    opts.wheelPositions = opts.wheelPositions || [
      [-0.22,       0.24],
      [0.4 - 0.098, 0.24],
      [-0.22,       -0.3],
      [0.4 - 0.098, -0.3]
    ];

    if(!opts.texture) {
      throw new Error('Car initialized with no texture');
    }

    this.maxSteer = opts.maxSteer;
    this.myPlayer = opts.player;

    (<any>this.body).onCollision = (body) => {
      this.setSideFriction(3, 3);
      World.screenShake(3, 3);

      if(body.shapes[0].collisionGroup === ConfigManager.collisionMasks.WALL) {
        setTimeout(() => {
          this.setSideFriction(200, 200);
        }, 100);
      }
    };

    this.box = new p2.Box({ width: opts.w, height: opts.h });
    this.box.collisionGroup = ConfigManager.collisionMasks.PLAYER;
    this.box.collisionMask = ConfigManager.collisionMasks.ALL;

    this.body.addShape(this.box);

    this.vehicle = new (<any>p2).TopDownVehicle(this.body);

    this.frontWheel = this.vehicle.addWheel({
      localPosition: [0, 0.5]
    });
    this.backWheel = this.vehicle.addWheel({
      localPosition: [0, -0.5]
    });

    this.setSideFriction(200, 200);

    this.vehicle.addToWorld(World.p2world);

    this.wheelSprites = [];
    for(let i = 0; i < opts.wheelPositions.length; i++) {
      this.wheelSprites[i] = new PIXI.Sprite(opts.wheelTexture);
      this.wheelSprites[i].scale.x = 0.016;
      this.wheelSprites[i].scale.y = 0.016;
      this.wheelSprites[i].anchor.x = 1;
      this.wheelSprites[i].anchor.x = 0.5;
      this.wheelSprites[i].position = opts.wheelPositions[i];
      this.graphics.addChild(this.wheelSprites[i]);
    }

    this.sprite = new PIXI.Sprite(opts.texture);
    this.graphics.addChild(this.sprite);
    this.sprite.width = -this.box.width;
    this.sprite.height = -this.box.height;
    this.sprite.position.x = -this.box.width / 2;
    this.sprite.position.y = this.box.height / 2;
    this.sprite.scale.x = -this.sprite.scale.x;
  }

  onInput() {
    const left = isKeyDown('SteerLeft', this.myPlayer);
    const right = isKeyDown('SteerRight', this.myPlayer);

    this.frontWheel.steerValue = this.maxSteer * (left - right);
    this.wheelSprites[0].rotation = this.wheelSprites[1].rotation = 0.5 * (left - right);
    this.backWheel.setBrakeForce(0);

    if(isKeyDown('Brake', this.myPlayer)) {
      if(this.backWheel.getSpeed() > 0.1) {
        // Moving forward - add some brake force to slow down
        this.backWheel.setBrakeForce(2);
      }
    }
  }

  protected setSideFriction(front: number, back: number) {
    this.frontWheel.setSideFriction(front);
    this.backWheel.setSideFriction(back);
  }

  public halt() {
    this.backWheel.setBrakeForce(2);
    this.box.collisionGroup = ConfigManager.collisionMasks.CAR;
  }
}
