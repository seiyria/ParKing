
import { Valet } from './Valet';
import { VariantManager } from '../../global/variant';

export class MultiplayerValet extends Valet {
  protected possibleMaps = ['BasicArena'];

  create() {
    this.carsLeft = 2;
    super.create();
  }

  protected numVIP(): number {
    return VariantManager.options.VIPSpaces;
  }

  protected numHandicap(): number {
    return VariantManager.options.HandicapSpaces;
  }

}
