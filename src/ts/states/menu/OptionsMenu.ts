

import { Menu } from './Menu';
import { ConfigManager } from '../../global/config';
import { DelayedInputHandler } from '../../global/key';
import { GameState } from '../../global/gamestate';

export class OptionsMenu extends Menu {

  protected menuTitle = ['Options'];

  constructor() {
    super({ menuVerticalOffset: 200, menuOptionSpacing: 50, menuAlign: 'left' });
  }

  public init(): void {
    super.init();

    this.watchForKey('Back', { player: this.menuControlPlayer }, () => {
      GameState.popState();
    });
  }

  public create(): void {
    super.create();

    const volOpt = this.addOption(ConfigManager.masterVolumeDisplay, { keys: (option, menu) => {

      this.watchForKey('Left', { player: this.menuControlPlayer, option, menu }, () => {
        const curSet = ConfigManager.options.masterVolume;
        ConfigManager.setMasterVolume(curSet - 0.05);
        volOpt.textObj.text = ConfigManager.masterVolumeDisplay;
      });

      this.watchForKey('Right', { player: this.menuControlPlayer, option, menu }, () => {
        const curSet = ConfigManager.options.masterVolume;
        ConfigManager.setMasterVolume(curSet + 0.05);
        volOpt.textObj.text = ConfigManager.masterVolumeDisplay;
      });

    }});

    volOpt.textObj.inputEnabled = true;
    volOpt.textObj.events.onInputDown.add((t, e) => {
      const { x } = e.position;

      const textMod = t.x + (t.width / 2) + (t.width / 4);
      const volMod = x > textMod ? 0.05 : -0.05;

      const curSet = ConfigManager.options.masterVolume;
      ConfigManager.setMasterVolume(curSet + volMod);
      volOpt.textObj.text = ConfigManager.masterVolumeDisplay;
    });

    const ssOpt = this.addOption(ConfigManager.screenShakeDisplay, { keys: (option, menu) => {

      this.watchForKey('Left', { player: this.menuControlPlayer, option, menu }, () => {
        const curSet = ConfigManager.options.screenShake;
        ConfigManager.setScreenShake(curSet - 0.1);
        ssOpt.textObj.text = ConfigManager.screenShakeDisplay;
        GameState.screenShake(4);
      });

      this.watchForKey('Right', { player: this.menuControlPlayer, option, menu }, () => {
        const curSet = ConfigManager.options.screenShake;
        ConfigManager.setScreenShake(curSet + 0.1);
        ssOpt.textObj.text = ConfigManager.screenShakeDisplay;
        GameState.screenShake(4);
      });

    }});

    ssOpt.textObj.inputEnabled = true;
    ssOpt.textObj.events.onInputDown.add((t, e) => {
      const { x } = e.position;

      const textMod = t.x + (t.width / 2) + (t.width / 4);
      const ssMod = x > textMod ? 0.1 : -0.1;

      const curSet = ConfigManager.options.screenShake;
      ConfigManager.setScreenShake(curSet + ssMod);
      ssOpt.textObj.text = ConfigManager.screenShakeDisplay;
      GameState.screenShake(4);
    });

    this.addOption('Back', { callback: () => {
      GameState.popState();
    }});

    this.recalculateVisibleOptions();

  }
}
