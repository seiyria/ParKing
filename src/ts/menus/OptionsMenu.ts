
import { ACCUMULATOR_THRESHOLD, Menu } from './Menu';
import { World } from '../global/world';
import { GameState } from '../global/gamestate';
import { VariantManager } from '../global/variant';

import * as GameModes from '../gamemodes';
import * as GameLevels from '../gamelevels';
import { ConfigManager, RESOLUTIONS } from '../global/config';
import { isKeyDown } from '../global/key';
import { Helpers } from '../global/helpers';

export class OptionsMenu extends Menu {

  constructor() {
    super({ menuVerticalOffset: 150, menuAlign: 'left', menuOptionSpacing: 35 });
  }

  protected init() {
    super.init();

    const titleOpts = Helpers.defaultTextOptions();
    titleOpts.align = 'center';
    titleOpts.fontSize = 50;
    this.titleText = new PIXI.Text('Options', titleOpts);
    this.addChild(this.titleText);

    this.addOption(ConfigManager.masterVolumeDisplay, {
      state: { accumulator: 0 },
      update: (now, delta, state) => {

        // debounce input
        state.accumulator += delta;
        if(state.accumulator < ACCUMULATOR_THRESHOLD) return;
        state.accumulator = 0;

        if(isKeyDown('Left')) {
          const curVol = ConfigManager.options.masterVolume;
          ConfigManager.setMasterVolume(curVol - 0.05);
          state.opt.textObj.text = ConfigManager.masterVolumeDisplay;
        }

        if(isKeyDown('Right')) {
          const curVol = ConfigManager.options.masterVolume;
          ConfigManager.setMasterVolume(curVol + 0.05);
          state.opt.textObj.text = ConfigManager.masterVolumeDisplay;
        }
      }});

    this.addOption(ConfigManager.screenShakeDisplay, {
      state: { accumulator: 0 },
      update: (now, delta, state) => {

        // debounce input
        state.accumulator += delta;
        if(state.accumulator < ACCUMULATOR_THRESHOLD) return;
        state.accumulator = 0;

        if(isKeyDown('Left')) {
          const curVol = ConfigManager.options.screenShake;
          ConfigManager.setScreenShake(curVol - 0.1);
          state.opt.textObj.text = ConfigManager.screenShakeDisplay;
          World.screenShake(4);
        }

        if(isKeyDown('Right')) {
          const curVol = ConfigManager.options.screenShake;
          ConfigManager.setScreenShake(curVol + 0.1);
          state.opt.textObj.text = ConfigManager.screenShakeDisplay;
          World.screenShake(4);
        }
      }});

    this.addOption(ConfigManager.screenResolutionDisplay, {
      state: { accumulator: 0, widthArr: Object.keys(RESOLUTIONS) },
      update: (now, delta, state) => {

        // debounce input
        state.accumulator += delta;
        if(state.accumulator < ACCUMULATOR_THRESHOLD) return;
        state.accumulator = 0;

        const curRes = ConfigManager.options.screenWidth;
        let resIdx = state.widthArr.indexOf(curRes);
        if(resIdx === -1) resIdx = 0;

        if(isKeyDown('Left')) {
          const newIdx = resIdx - 1 === -1 ? state.widthArr.length - 1 : resIdx - 1;
          ConfigManager.setScreenWidth(state.widthArr[newIdx]);
          state.opt.textObj.text = ConfigManager.screenResolutionDisplay;
          World.resize(state.widthArr[newIdx]);
        }

        if(isKeyDown('Right')) {
          const newIdx = resIdx + 1 === state.widthArr.length ? 0 : resIdx + 1;
          ConfigManager.setScreenWidth(state.widthArr[newIdx]);
          state.opt.textObj.text = ConfigManager.screenResolutionDisplay;
          World.resize(state.widthArr[newIdx]);
        }
      }});

    this.addOption('Back', { callback: () => {
      GameState.removeMenu();
      return { done: true };
    }});

  }

  update(now: number, delta: number) {
    super.update(now, delta);

    this.titleText.x = World.renderer.width / 2 - this.titleText.width / 2;
    this.titleText.y = ConfigManager.scaleY(20);
    this.titleText.style.fontSize = ConfigManager.scaleX(50);
  }
}
