
import * as _ from 'lodash';

import { Entity } from './Entity';
import { ConfigManager } from '../global/config';
import { ResourceManager } from '../global/resources';
import { GameState } from '../global/gamestate';
import { KeyMapHandler } from '../global/key';

export abstract class ControlledEntity extends Entity {

  private myPlayer: number;

  protected wheelSprites: Phaser.Group;

  protected maxSteer: number;
  protected wheelRotationSpeed: number;
  protected thrust: number;
  protected brakeForce: number;
  protected brakeHold: number
  protected turnAngle: number;

  protected baseThrust: number;

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
    if(!this.maxSteer)    this.maxSteer = 100;
    if(!this.thrust)      this.thrust = 100;
    if(!this.brakeForce)  this.brakeForce = 0.7;
    if(!this.brakeHold)   this.brakeHold = 10;
    if(!this.turnAngle)   this.turnAngle = 30;
    if(!this.body.mass)   this.body.mass = 1;

    this.baseThrust = this.thrust;

    this.body.damping = 0.9;
    this.wheelSprites = this.game.add.group(this);

    for(let i = 0; i < opts.wheelPositions.length; i++) {
      const [x, y] = opts.wheelPositions[i];
      const wheelSprite = this.game.make.sprite(x, y, 'car-wheel');
      this.wheelSprites.addChild(wheelSprite);
    }
  }

  update() {
    if(this.isHalted) return;

    const left = KeyMapHandler.isDown('SteerLeft', this.myPlayer, false);
    const right = KeyMapHandler.isDown('SteerRight', this.myPlayer, false);

    let angle = 0;

    if(left) {
      angle = -this.turnAngle;

    } else if(right) {
      angle = this.turnAngle;

    } else {
      this.body.setZeroRotation();
    }

    if(angle !== 0) {
      this.body.rotateRight(this.dampenAngleBasedOnThrust(angle));
    }

    this.updateWheelAngles(this.dampenAngleBasedOnThrust(angle / 2));

    this.body.thrust(this.thrust);

    if(KeyMapHandler.isDown('Brake', this.myPlayer, false)) {
      this.thrust -= this.brakeForce;
    }

    this.thrust -= this.brakeForce / this.brakeHold;
    if(this.thrust <= 0) this.thrust = 0;
  }

  private dampenAngleBasedOnThrust(angle: number): number {
    return angle * (this.thrust / this.baseThrust);
  }

  private updateWheelAngles(angle: number) {
    this.wheelSprites.children.forEach(wheel => (<Phaser.Sprite>wheel).angle = angle);
  }

  public halt() {
    this.isHalted = true;
    this.body.setZeroRotation();
    this.body.angularDamping = 0.9;
    this.updateWheelAngles(0);
  }
}
