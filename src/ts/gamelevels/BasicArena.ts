
import { GameLevel } from './GameLevel';
import { ResourceManager } from '../global/resources';

// x, y, w, h
const walls = [
  [1,     0,    2167,     5],
  [1063,  0,    9,        677],
  [1,     -336, 2167,     5],

  // spawn point debug
  // [1,     -55,    75,      20],
  // [1,     -280,    75,      20],

  [1,     0,    397,      75],
  [1,     -168, 397,      186],
  [1,     -336, 397,      75]
];

// x, y, xVel, yVel
const spawns = [
  [20, -55],
  [20, -280]
];

export class BasicArena extends GameLevel {
  constructor() {
    super('Basic Arena', 'level-test');
  }

  public load() {
    super.load();

    walls.forEach(([x, y, w, h, ang]) => {
      this.addWall(x, y, w, h, ang || 0);
    });

    spawns.forEach(([x, y]) => {
      this.addSpawn(x, y);
    });

    const up = 0;
    const down = 180 * (Math.PI / 180);

    const psprite = new PIXI.Sprite(ResourceManager.getResource('parking-outline'));
    const psOffsetX = psprite.width / 1.76; // OC: MAGIC NUMBER DO NOT TOUCH

    const TOP_ROW_Y = -110;
    const BOTTOM_ROW_Y = -225;

    for (let i = 0; i < 10; i++) {

      const offsetX = (psOffsetX * i) + 360;

      this.addParkingSpace(offsetX, TOP_ROW_Y, down);
      this.addParkingSpace(offsetX + psOffsetX + 3, TOP_ROW_Y, up);

      this.addParkingSpace(offsetX, BOTTOM_ROW_Y, down);
      this.addParkingSpace(offsetX + psOffsetX + 3, BOTTOM_ROW_Y, up);
    }
  }
}
