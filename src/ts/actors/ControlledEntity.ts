
import * as _ from 'lodash';
import * as p2 from 'p2';

import { Entity } from './Entity';
import { ConfigManager } from '../global/config';
import { ResourceManager } from '../global/resources';
import { GameState } from '../global/gamestate';
import { KeyMapHandler } from '../global/key';

export abstract class ControlledEntity extends Entity {

  private myPlayer: number;

  protected vehicle: any;     // p2.TopDownVehicle
  protected frontWheel: any;  // p2.WheelConstraint;
  protected backWheel: any;   // p2.WheelConstraint;

  protected wheelSprites: Phaser.Group;

  protected maxSteer: number;
  protected wheelRotationSpeed: number;

  private isHalted: boolean;

  create(opts) {
    super.create(opts);

    opts.wheelPositions = opts.wheelPositions || [
      [-(this.width / 2) - 5, -this.height / 2],
      [(this.width / 2),      -this.height / 2],
      [-(this.width / 2) - 5, (this.height / 2) - 10],
      [(this.width / 2),      (this.height / 2) - 10]
    ];

    if(!this.wheelRotationSpeed) this.wheelRotationSpeed = 300;
    if(!this.maxSteer) this.maxSteer = 50;
    if(!this.body.mass) this.body.mass = 1;

    /*
    (<any>this.body).onCollision = (body) => {
      this.setSideFriction(3, 3);
      GameState.screenShake(3, 3);

      if(body.shapes[0].collisionGroup === ConfigManager.collisionMasks.WALL) {
        setTimeout(() => {
          this.setSideFriction(200, 200);
        }, 100);
      }
    };









    this.vehicle = new (<any>p2).TopDownVehicle(this.body);
    this.vehicle.addToWorld(this.game.physics.p2.world);
     */

    this.setSideFriction(150, 150);

    this.wheelSprites = this.game.add.group(this);

    for(let i = 0; i < opts.wheelPositions.length; i++) {
      const [x, y] = opts.wheelPositions[i];
      const wheelSprite = this.game.make.sprite(x, y, 'car-wheel');

      // this.game.physics.p2.enable(wheelSprite);
      // this.game.physics.p2.createRevoluteConstraint(this.body, [x, y], wheelSprite.body, [0, 0], this.maxSteer);
      this.wheelSprites.addChild(wheelSprite);
    }
  }

  update() {
    if(this.isHalted) return;

    const left = KeyMapHandler.isDown('SteerLeft', this.myPlayer, false);
    const right = KeyMapHandler.isDown('SteerRight', this.myPlayer, false);

    // this.wheelSprites.children[0].rotation = this.wheelSprites.children[1].rotation = 0.5 * (+left - +right);

    let angle = 0;

    if(left) {
      angle = -15;
      this.wheelSprites.children.forEach(wheel => (<Phaser.Sprite>wheel).angle = angle);
      this.body.rotateLeft(Math.abs(angle));

    } else if(right) {
      angle = 15;
      this.wheelSprites.children.forEach(wheel => (<Phaser.Sprite>wheel).angle = angle);
      this.body.rotateRight(Math.abs(angle));

    } else {
      this.wheelSprites.children.forEach(wheel => (<Phaser.Sprite>wheel).angle = angle);
      this.body.setZeroRotation();
    }

    if(KeyMapHandler.isDown('Brake', this.myPlayer, false)) {
      // Moving forward - add some brake force to slow down
      /*
      if(this.backWheel.getSpeed() > 0) {
        this.backWheel.setBrakeForce(2);
      }
      */
    }
  }

  protected setSideFriction(front: number, back: number) {
    // this.frontWheel.setSideFriction(front);
    // this.backWheel.setSideFriction(back);
  }

  public halt() {
    this.isHalted = true;
    // this.backWheel.setBrakeForce(2);
    // this.box.collisionGroup = ConfigManager.collisionMasks.CAR;
  }
}
