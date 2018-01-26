
import * as _ from 'lodash';

import { ConfigManager } from '../global/config';
import { World } from '../global/world';
import { ResourceManager } from '../global/resources';
import { Wall } from '../actors/Wall';
import { ParkingSpace } from '../actors/ParkingSpace';

export class GameLevel {

  protected walls: Wall[] = [];
  protected parkingSpaces: ParkingSpace[] = [];
  protected graphics: PIXI.Graphics;
  protected texture: PIXI.Sprite;
  protected spawnPoints: Array<{x: number, y: number, velX: number|number[], velY: number}> = [];

  constructor(protected name: string, textureString: string) {
    this.texture = new PIXI.Sprite(ResourceManager.getResource(textureString));
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xFF0000);
    this.graphics.width = 800;
    this.graphics.height = 600;
  }

  public init() {
    this.load();
  }

  public load() {
    // if loaded throw error
    this.texture.position.x = 0;
    this.texture.position.y = -ConfigManager.numBasedOnZoom(ConfigManager.HEIGHT);
    this.texture.scale.x = ConfigManager.scaleXAndZoom(1);
    this.texture.scale.y = ConfigManager.scaleYAndZoom(0.565);

    this.graphics.addChild(this.texture);
    World.container.addChild(this.graphics);

    this.walls.forEach(wall => wall.load());
    this.parkingSpaces.forEach(space => space.load());
  }

  public unload() {
    World.container.removeChild(this.graphics);

    this.walls.forEach(wall => wall.unload());
    this.parkingSpaces.forEach(space => space.unload());
  }

  protected addWall(x: number, y: number, w: number, h: number, angle: number) {
    this.walls.push(new Wall({ x, y, w, h, angle }));
  }

  protected addSpawn(x, y, velX = [7, 9, 11], velY = 0) {
    this.spawnPoints.push({ x, y, velX, velY });
  }

  protected addParkingSpace(x, y, angle) {
    this.parkingSpaces.push(new ParkingSpace({ x, y, angle }));
  }

  public debug(isDebug: boolean) {
    this.walls.forEach(wall => wall.debug(isDebug));
    this.parkingSpaces.forEach(space => space.debug(isDebug));
  }

  public getSpawnPoint(pos: number) {
    if(!this.spawnPoints[pos]) throw new Error(`Map does not have enough spawn points for pos ${pos}`);
    const spawnPoint = _.clone(this.spawnPoints[pos]);
    if(_.isArray(spawnPoint.velX)) spawnPoint.velX = _.sample(spawnPoint.velX);
    return spawnPoint;
  }
}
