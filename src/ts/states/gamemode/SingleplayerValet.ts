
import { Valet } from './Valet';

export class SingleplayerValet extends Valet {
  protected possibleMaps = ['BasicSingleplayer'];

  create() {
    this.carsLeft = 2;
    super.create();
  }
}
