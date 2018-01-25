
import { ACCUMULATOR_THRESHOLD, Menu } from './Menu';
import { World } from '../global/world';
import { GameState } from '../global/gamestate';
import { VariantManager } from '../global/variant';

import * as GameModes from '../gamemodes';
import * as GameLevels from '../gamelevels';
import { isKeyDown } from '../global/key';
import { ConfigManager } from '../global/config';
import { Helpers } from '../global/helpers';

export class VariantMenu extends Menu {

  constructor() {
    super({ menuVerticalOffset: 150, menuAlign: 'left', menuOptionSpacing: 35 });
  }

  protected init() {
    super.init();

    const titleOpts = Helpers.defaultTextOptions();
    titleOpts.align = 'center';
    titleOpts.fontSize = 50;
    this.titleText = new PIXI.Text('Variants', titleOpts);
    this.addChild(this.titleText);

    const variantSelectList = ['Random', 'No', 'Yes'];
    const allVariants = [
      'Snow', 'RandomParking', 'RoadCones', 'NoBrakes',
      'CarWash', 'Lakeside', 'Bombs', 'FreeMoney', 'Obstacles'
    ];

    allVariants.forEach(variant => {

      this.addOption(VariantManager.keyDisplay(variant), {
        state: { accumulator: 0 },
        update: (now, delta, state) => {

          // debounce input
          state.accumulator += delta;
          if(state.accumulator < ACCUMULATOR_THRESHOLD) return;
          state.accumulator = 0;

          let resIdx = variantSelectList.indexOf(VariantManager.getKey(variant));
          if(resIdx === -1) resIdx = 0;

          if(isKeyDown('Left')) {
            const newIdx = resIdx - 1 === -1 ? variantSelectList.length - 1 : resIdx - 1;
            VariantManager.setKey(variant, (<any>variantSelectList)[newIdx]);
            state.opt.textObj.text = VariantManager.keyDisplay(variant);
          }

          if(isKeyDown('Right')) {
            const newIdx = resIdx + 1 === variantSelectList.length ? 0 : resIdx + 1;
            VariantManager.setKey(variant, (<any>variantSelectList)[newIdx]);
            state.opt.textObj.text = VariantManager.keyDisplay(variant);
          }
        }});

    });

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
