
import * as _ from 'lodash';

import { Car } from './Car';
import { ResourceManager } from '../global/resources';

export class RedCar extends Car {
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, 'car-red');
  }
}

export class BlueCar extends Car {
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, 'car-blue');
  }
}

export class GreenCar extends Car {
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, 'car-green');
  }
}

export class OrangeCar extends Car {
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, 'car-orange');
  }
}

export class RedStripeCar extends Car {
  constructor(game: Phaser.Game, x: number, y: number) {
    super(game, x, y, 'car-red-stripe');
  }
}
