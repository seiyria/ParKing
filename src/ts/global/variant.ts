
import * as Lockr from 'lockr';
import * as _ from 'lodash';

type YesNoRandom = 'Yes' | 'No' | 'Random';
type ZeroToFour = 0 | 1 | 2 | 3 | 4;

class Variants {
  Snow: YesNoRandom = 'Random';                 // snow on the ground
  RandomParking: YesNoRandom = 'Random';        // randomly placed parking spots
  RoadCones: YesNoRandom = 'Random';            // road cone obstacles
  NoBrakes: YesNoRandom = 'Random';             // no brakes allowed
  CarWash: YesNoRandom = 'Random';              // car wash map
  Lakeside: YesNoRandom = 'Random';             // lakeside map
  Bombs: YesNoRandom = 'Random';                // explosions in map
  FreeMoney: YesNoRandom = 'Random';            // free money on map
  Obstacles: YesNoRandom = 'Random';            // pre-spawned cars on map,
  VIPSpaces: ZeroToFour = 1;                    // number of VIP spaces on the map
  HandicapSpaces: ZeroToFour = 1;               // number of Handicap spaces on the map
}

const OPTION_PADDING_RIGHT = 15;

export class VariantManager {

  private static _options: Variants;

  public static get options() {
    return _.clone(VariantManager._options);
  }

  public static init() {
    if(VariantManager._options) throw new Error('Cannot re-init Variants');

    VariantManager._options = new Variants();

    VariantManager.loadUserOptions();
  }

  private static formatOptionText(optionName: string, optionVal: string, hasBeginning: boolean, hasEnd: boolean): string {
    let start = _.padEnd(optionName, OPTION_PADDING_RIGHT);

    if(hasBeginning) start = `${start} ◀`;
    else             start = `${start}  `;

    start = `${start} ${_.pad(optionVal, 10)}`;

    if(hasEnd) start = `${start} ▶`;

    return start;
  }

  private static setOption(opt: string, val: any): any {
    VariantManager._options[opt] = val;
    Lockr.set(opt, val);
    return val;
  }

  public static loadUserOptions() {
    Object.keys(VariantManager._options).forEach(key => {
      const defaultVal = VariantManager._options[key];
      let loadedVal = Lockr.get(key);

      if(_.isUndefined(loadedVal)) {
        loadedVal = defaultVal;
      }

      VariantManager._options[key] = loadedVal;

      Lockr.set(key, loadedVal);
    });
  }

  public static keyDisplay(key: string): string {
    const val = this.options[key];
    return this.formatOptionText(_.startCase(key), val, true, true);
  }

  public static getKey(key: string): any {
    return this.options[key];
  }

  public static setKey(key: string, val: YesNoRandom): void {
    this.setOption(key, val);
  }
}

VariantManager.init();
