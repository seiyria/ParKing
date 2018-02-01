
import { Entity } from './Entity';
import { Explosion } from './Explosion';
import { ConfigManager } from '../global/config';

export class Bomb extends Entity {

    /*
    const circle = new p2.Circle({ radius: 1 });
    circle.collisionGroup = ConfigManager.collisionMasks.BOMB;
    circle.collisionMask = ConfigManager.collisionMasks.PLAYER | ConfigManager.collisionMasks.CAR;
    this.body.addShape(circle);

    this.graphics.beginFill(0xFFFFFF);
    this.graphics.drawCircle(0, 0, 0.5);
    this.graphics.position.x = this.body.position[0];
    this.graphics.position.y = this.body.position[1];

    (<any>this.body).onCollision = () => {
      this.removeFromWorld();

      const explosion = new Explosion(this.graphics.position, 8, 2);
      explosion.explode();
    }
    */

}
