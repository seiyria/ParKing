
import * as _ from 'lodash';
import * as Lockr from 'lockr';
import { World } from './world';

const SCALE_DIVISOR_X = 1067;
const SCALE_DIVISOR_Y = 600;

const OPTION_PADDING_RIGHT = 15;

const BASE_RES_WIDTH = 1280;

export const RESOLUTIONS = {
  // 16:9
  1024: 576,
  1152: 648,
  1280: 720,
  1366: 768,
  1600: 900,
  1920: 1080,
  2560: 1440,
  3840: 2160
};

_.each(RESOLUTIONS, (val, key) => {
  if(key <= window.screen.availWidth && val <= window.screen.availHeight) return;
  delete RESOLUTIONS[key];
});

class UserOptions {
  screenShake = 1;
  masterVolume = 1;
  screenWidth = BASE_RES_WIDTH;
}

export class ConfigManager {

  static WIDTH = 0;
  static HEIGHT = 0;
  static ZOOM = 0;

  // OC: not sure if ConfigManager is a dirty hack but it works
  private static scaleFactorX = ConfigManager.WIDTH / SCALE_DIVISOR_X;
  private static scaleFactorY = ConfigManager.HEIGHT / SCALE_DIVISOR_Y;

  public static lastWidth = ConfigManager.WIDTH;
  public static lastHeight = ConfigManager.HEIGHT;

  // these are set in the init function.
  public static readonly collisionMasks = {
    SCORE: 0,
    PLAYER: 0,
    CAR: 0,
    WALL: 0,
    BOMB: 0,
    EXPLOSION: 0,
    TRUCKBACK: 0,

    ALL: 0
  };

  private static _options: UserOptions;

  public static get options() {
    return _.clone(ConfigManager._options);
  }

  private static formatOptionText(optionName: string, optionVal: string, hasBeginning: boolean, hasEnd: boolean): string {
    let start = _.padEnd(optionName, OPTION_PADDING_RIGHT);

    if(hasBeginning) start = `${start} ◀`;
    else             start = `${start}  `;

    start = `${start} ${_.pad(optionVal, 10)}`;

    if(hasEnd) start = `${start} ▶`;

    return start;
  }

  public static get masterVolume(): number {
    return Math.round(this._options.masterVolume * 100);
  }

  public static get masterVolumeDisplay(): string {
    const val = this.masterVolume;
    return this.formatOptionText('Volume', `${val}%`, val !== 0, val !== 100);
  }

  public static get screenShake(): number {
    return Math.round(this._options.screenShake * 100);
  }

  public static get screenShakeDisplay(): string {
    const val = this.screenShake;

    let str = `${val}%`;
    if(val === 0) str = `None`;
    if(val === 200) str = 'Vlambeer';

    return this.formatOptionText('Screen Shake', str, val !== 0, val !== 200);
  }

  public static get screenResolutionDisplay(): string {
    const val = this._options.screenWidth;

    const height = RESOLUTIONS[val] || '???';

    return this.formatOptionText('Resolution', `${val}x${height}`, true, true);
  }

  public static init() {
    if(ConfigManager._options) throw new Error('Cannot re-init Config');

    Object.keys(ConfigManager.collisionMasks).forEach((key, i) => {
      if(key === 'ALL') return;
      const val = Math.pow(2, i);
      ConfigManager.collisionMasks[key] = val;
      ConfigManager.collisionMasks.ALL |= val;
    });

    ConfigManager._options = new UserOptions();

    ConfigManager.loadUserOptions();

    const screenWidth = ConfigManager._options.screenWidth || BASE_RES_WIDTH;

    setTimeout(() => {
      World.resize(screenWidth);
    });
  }

  public static resize(newWidth: number) {
    const height = newWidth / 16 * 9;

    ConfigManager.WIDTH = newWidth;
    ConfigManager.HEIGHT = height;
    ConfigManager.ZOOM = ConfigManager.WIDTH * 0.05;

    ConfigManager.scaleFactorX = ConfigManager.WIDTH / SCALE_DIVISOR_X;
    ConfigManager.scaleFactorY = ConfigManager.WIDTH / SCALE_DIVISOR_Y;
  }

  public static numBasedOnZoom(num: number) {
    return num / ConfigManager.ZOOM;
  }

  public static scaleX(x: number) {
    return x * ConfigManager.scaleFactorX;
  }

  public static scaleY(y: number) {
    return y * ConfigManager.scaleFactorY;
  }

  public static scaleXAndZoom(x: number) {
    return this.numBasedOnZoom(this.scaleX(x));
  }

  public static scaleYAndZoom(y: number) {
    return this.numBasedOnZoom(this.scaleY(y));
  }

  private static revalidateOption(opt: string, val: any) {
    switch(opt) {
      case 'masterVolume': {
        let clamped = _.clamp(val, 0, 1);
        if(_.isNaN(clamped)) clamped = 1;
        return clamped;
      }
      case 'screenShake': {
        let clamped = _.clamp(val, 0, 2);
        if(_.isNaN(clamped)) clamped = 1;
        return clamped;
      }
    }

    return val;
  }

  private static setOption(opt: string, val: any): any {
    val = this.revalidateOption(opt, val);
    ConfigManager._options[opt] = val;
    Lockr.set(opt, val);
    return val;
  }

  public static loadUserOptions() {
    Object.keys(ConfigManager._options).forEach(key => {
      const defaultVal = ConfigManager._options[key];
      let loadedVal = Lockr.get(key);

      if(_.isUndefined(loadedVal)) {
        loadedVal = defaultVal;
      }

      loadedVal = ConfigManager.revalidateOption(key, loadedVal);
      ConfigManager._options[key] = loadedVal;

      Lockr.set(key, loadedVal);
    });
  }

  public static setMasterVolume(vol: number): number {
    return ConfigManager.setOption('masterVolume', vol);
  }

  public static setScreenShake(ss: number): number {
    return ConfigManager.setOption('screenShake', ss);
  }

  public static setScreenWidth(w: number): number {
    return ConfigManager.setOption('screenWidth', w);
  }

}

ConfigManager.init();
