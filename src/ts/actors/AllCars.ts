
import * as _ from 'lodash';

import { Car } from './Car';
import { ResourceManager } from '../global/resources';

export class RedCar extends Car {
  constructor(opts) {
    super(_.defaults({
      texture: ResourceManager.getResource('car-red')
    }, opts));
  }
}

export class BlueCar extends Car {
  constructor(opts) {
    super(_.defaults({
      texture: ResourceManager.getResource('car-blue')
    }, opts));
  }
}

export class GreenCar extends Car {
  constructor(opts) {
    super(_.defaults({
      texture: ResourceManager.getResource('car-green')
    }, opts));
  }
}

export class OrangeCar extends Car {
  constructor(opts) {
    super(_.defaults({
      texture: ResourceManager.getResource('car-orange')
    }, opts));
  }
}

export class RedStripeCar extends Car {
  constructor(opts) {
    super(_.defaults({
      texture: ResourceManager.getResource('car-red-stripe')
    }, opts));
  }
}
