
import * as _ from 'lodash';

import { ACCUMULATOR_THRESHOLD, Menu } from './Menu';
import { World } from '../global/world';
import { GameState } from '../global/gamestate';
import { VariantManager } from '../global/variant';

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

    // yes/no/random variants
    const allYesNoRandomVariants = [
      'Snow', 'RandomParking', 'RoadCones', 'NoBrakes',
      'CarWash', 'Lakeside', 'Bombs', 'FreeMoney', 'Obstacles'
    ];

    // 0/1/2/3/4 variants
    const allZeroToFourVariants = [
      'VIPSpaces', 'HandicapSpaces'
    ];

    const createOption = (variantKey: string, options: string[]|number[]) => {

      this.addOption(VariantManager.keyDisplay(variantKey), {
        state: { accumulator: 0 },
        update: (now, delta, state) => {

          // debounce input
          state.accumulator += delta;
          if(state.accumulator < ACCUMULATOR_THRESHOLD) return;
          state.accumulator = 0;

          let resIdx = _.indexOf(options, VariantManager.getKey(variantKey));
          if(resIdx === -1) resIdx = 0;

          if(isKeyDown('Left')) {
            const newIdx = resIdx - 1 === -1 ? options.length - 1 : resIdx - 1;
            VariantManager.setKey(variantKey, (<any>options)[newIdx]);
            state.opt.textObj.text = VariantManager.keyDisplay(variantKey);
          }

          if(isKeyDown('Right')) {
            const newIdx = resIdx + 1 === options.length ? 0 : resIdx + 1;
            VariantManager.setKey(variantKey, (<any>options)[newIdx]);
            state.opt.textObj.text = VariantManager.keyDisplay(variantKey);
          }
        }});
    };

    allYesNoRandomVariants.forEach(variant => {
      createOption(variant, ['Random', 'No', 'Yes']);
    });

    allZeroToFourVariants.forEach(variant => {
      createOption(variant, [0, 1, 2, 3, 4]);
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
