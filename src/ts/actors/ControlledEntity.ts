

import { Entity } from './Entity';
import { InstantInputHandler } from '../global/key';
import { GameState } from '../global/gamestate';

// TODO tire tracks: https://jsfiddle.net/jolmos/yeL4Lbdh/

const MIN_TURN_WHEEL_PERCENT = 0.05;

export abstract class ControlledEntity extends Entity {

  public gameid: number;

  private myPlayer: number;

  public get player(): number {
    return this.myPlayer;
  }

  protected wheelSprites: Phaser.Group;

  protected thrust: number;
  protected brakeForce: number;
  protected manualBrakeForce: number;
  protected turnAngle: number;
  protected mass: number;
  protected damping: number;
  protected reverseThrustMod: number;
  protected thrustLossMult: number;

  protected baseThrust: number;

  private isHalted: boolean;
  private inputHandler: InstantInputHandler;

  private collisionIFrames = 0;

  create(opts) {
    super.create(opts);

    this.inputHandler = new InstantInputHandler();
    this.inputHandler.init(this.game);

    opts.wheelPositions = opts.wheelPositions || [
      [-(this.width / 2) - 1, -this.height / 2  + 2],
      [(this.width / 2)     , -this.height / 2  + 2],
      [-(this.width / 2) - 1, (this.height / 2) - 7],
      [(this.width / 2)     , (this.height / 2) - 7]
    ];

    if(!this.thrust)              this.thrust = 400;
    if(!this.brakeForce)          this.brakeForce = 0.5;
    if(!this.manualBrakeForce)    this.manualBrakeForce = 30;
    if(!this.turnAngle)           this.turnAngle = 70;
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
      wheelSprite.scale.set(2, 2);
      this.wheelSprites.addChild(wheelSprite);
    }
  }

  update() {
    this.collisionIFrames--;
    if(this.isHalted) return;

    const left = this.inputHandler.isDown('SteerLeft', this.myPlayer);
    const right = this.inputHandler.isDown('SteerRight', this.myPlayer);

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

    if(this.inputHandler.isDown('Brake', this.myPlayer)) {
      this.loseThrust(this.manualBrakeForce);
    }

    const isTurning = this.inputHandler.isDown('SteerLeft', this.myPlayer) || this.inputHandler.isDown('SteerRight', this.myPlayer);
    // lose way more thrust while turning
    let thrustLoss = this.brakeForce;
    if(isTurning) thrustLoss *= 3;

    this.loseThrust(thrustLoss);

    this.checkForOffscreen();
  }

  private dampenAngleBasedOnThrust(angle: number): number {
    if(this.isHalted) return 0;
    let calcAngle = angle * Math.max(MIN_TURN_WHEEL_PERCENT, (Math.abs(this.thrust) / this.baseThrust));
    if(this.thrust < 0) calcAngle *= -1;
    return calcAngle;
  }

  private updateWheelAngles(angle: number) {
    this.wheelSprites.children.forEach((wheel) => {
      (<Phaser.Sprite>wheel).angle = angle;
    });
  }

  public handleCollision() {
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

  public handleWallCollision() {
    if(this.collisionIFrames > 0) return;

    this.collisionIFrames = 10;
    this.handleCollision();

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
