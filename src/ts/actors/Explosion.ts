
import { Entity } from './Entity';
import { ConfigManager } from '../global/config';
import { GameState } from '../global/gamestate';

export class Explosion extends Entity {

  private force: number;
  private radius: number;
    /*
    const circle = new p2.Circle({ radius: this.radius });
    circle.collisionGroup = ConfigManager.collisionMasks.BOMB;
    circle.collisionMask = ConfigManager.collisionMasks.PLAYER | ConfigManager.collisionMasks.CAR;
    this.body.addShape(circle);

    this.graphics.beginFill(0xFFFFFF);
    this.graphics.drawCircle(0, 0, this.radius - 0.5);
    this.graphics.position.x = this.body.position[0];
    this.graphics.position.y = this.body.position[1];

    (<any>this.body).onCollision = (otherBody) => {
      const target = otherBody.position;
      const bomb = this.body.position;

      const distance = p2.vec2.distance(target, bomb);
      const direction = [];
      p2.vec2.sub(direction, target, bomb);
      direction[0] = (direction[0] / distance) * this.force;
      direction[1] = (direction[1] / distance) * this.force;
      otherBody.applyImpulse(direction);
    };
    */

  explode() {
    GameState.screenShake();

    setTimeout(() => {
      // this.removeFromWorld();
    }, 33);
  }
}
