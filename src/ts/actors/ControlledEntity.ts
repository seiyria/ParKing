

import { Entity } from './Entity';
import { KeyMapHandler } from '../global/key';
import { GameState } from '../global/gamestate';

// TODO tire tracks: https://jsfiddle.net/jolmos/yeL4Lbdh/

export abstract class ControlledEntity extends Entity {

  public gameid: number;

  private myPlayer: number;

  protected wheelSprites: Phaser.Group;

  protected thrust: number;
  protected brakeForce: number;
  protected manualBrakeForce: number;
  protected brakeHold: number;
  protected turnAngle: number;
  protected mass: number;
  protected damping: number;
  protected reverseThrustMod: number;
  protected thrustLossMult: number;

  protected baseThrust: number;

  private isHalted: boolean;

  create(opts) {
    super.create(opts);

    opts.wheelPositions = opts.wheelPositions || [
      [-(this.width / 2) - 3, -this.height / 2],
      [(this.width / 2)  - 1, -this.height / 2],
      [-(this.width / 2) - 3, (this.height / 2) - 10],
      [(this.width / 2)  - 1, (this.height / 2) - 10]
    ];

    if(!this.thrust)              this.thrust = 600;
    if(!this.brakeForce)          this.brakeForce = 2;
    if(!this.manualBrakeForce)    this.manualBrakeForce = 30;
    if(!this.brakeHold)           this.brakeHold = 10;
    if(!this.turnAngle)           this.turnAngle = 45;
    if(!this.reverseThrustMod)    this.reverseThrustMod = 4;
    if(!this.thrustLossMult)      this.thrustLossMult = 0.3;

    if(!this.mass)                this.mass = 1;
    if(!this.damping)             this.damping = 0.8;

    this.body.mass = this.mass;
    this.body.damping = this.damping;

    this.baseThrust = this.thrust;

    this.wheelSprites = this.game.add.group(this);

    for(let i = 0; i < opts.wheelPositions.length; i++) {
      const [x, y] = opts.wheelPositions[i];
      const wheelSprite = this.game.add.sprite(x, y, 'car-wheel');
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

    const dampenedAngle = this.dampenAngleBasedOnThrust(angle);

    if(angle !== 0) {
      this.body.rotateRight(dampenedAngle);
    }

    this.updateWheelAngles(dampenedAngle / 2);

    this.body.thrust(this.thrust);

    if(KeyMapHandler.isDown('Brake', this.myPlayer, false)) {
      this.loseThrust(this.manualBrakeForce);
    }

    // lose way more thrust while turning
    let thrustLoss = this.brakeForce / this.brakeHold;
    if(this.angle !== 0) thrustLoss *= 3;

    this.loseThrust(thrustLoss);

    this.checkForOffscreen();
  }

  private dampenAngleBasedOnThrust(angle: number): number {
    if(this.isHalted) return 0;
    return angle * Math.max(0.15, (Math.abs(this.thrust) / this.baseThrust));
  }

  private updateWheelAngles(angle: number) {
    this.wheelSprites.children.forEach((wheel) => {
      (<Phaser.Sprite>wheel).angle = angle;
    });
  }

  public handleCarCollision() {
    if(this.isHalted) return;

    this.loseThrust(20);
    GameState.screenShake(3, 5);
  }

  public handleWallCollision() {
    if(this.isHalted) return;

    // hitting a wall on a right angle = reverse thrust. otherwise you just graze it and lose thrust.
    const cleanAngle = (Math.abs(this.body.angle) % 90);

    if(cleanAngle >= 20 && cleanAngle <= 70) {
      let lostThrust = 50;
      if(cleanAngle >= 30 && cleanAngle <= 60) lostThrust -= 10;
      if(cleanAngle >= 40 && cleanAngle <= 50) lostThrust -= 20;
      this.loseThrust(lostThrust);
    } else {
      this.reverseThrust();
      GameState.screenShake(5, 5);
    }
  }

  private reverseThrust() {
    this.thrust = -this.thrust / this.reverseThrustMod;
  }

  private loseThrust(lost: number) {
    lost *= this.thrustLossMult;

    // if we hit a wall and are going backwards
    if(this.thrust < 0) {

      // you lose thrust *much* faster in reverse
      this.thrust += (lost * this.reverseThrustMod);
      if(this.thrust > 0) this.thrust = 0;
      return;
    }

    // if we're driving
    this.thrust -= lost;
    if(this.thrust < 0) this.thrust = 0;
  }

  // if a car goes offscreen, it's gone forever
  private checkForOffscreen() {
    if(this.x + this.width > 0 && this.x < this.game.width
    && this.y + this.height > 0 && this.y < this.game.height) return;

    this.halt();

    setTimeout(() => this.kill(), 2000);
  }

  public halt() {
    this.isHalted = true;
    this.thrust = 0;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    this.body.setZeroRotation();
    this.body.angularDamping = 0.9;
    this.updateWheelAngles(0);
  }
}
