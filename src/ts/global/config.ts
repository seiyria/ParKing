
import * as _ from 'lodash';
import * as Lockr from 'lockr';
import { Config } from 'codelyzer';


const OPTION_PADDING_RIGHT = 15;

class UserOptions {
  screenShake = 1;
  masterVolume = 1;
  gameMenu = 0;
}

export class ConfigManager {

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

  public static get gameMenu(): number {
    return this._options.gameMenu;
  }

  public static get screenShakeDisplay(): string {
    const val = this.screenShake;

    let str = `${val}%`;
    if(val === 0) str = `None`;
    if(val === 200) str = 'Vlambeer';

    return this.formatOptionText('Screen Shake', str, val !== 0, val !== 200);
  }

  public static init() {
    if(ConfigManager._options) throw new Error('Cannot re-init Config');
    ConfigManager._options = new UserOptions();

    ConfigManager.loadUserOptions();
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

  public static setGameMenu(menu: number): number {
    return ConfigManager.setOption('gameMenu', menu);
  }

}

ConfigManager.init();
