
import * as _ from 'lodash';

import { Menu } from './Menu';
import { DelayedInputHandler } from '../../global/key';
import { GameState } from '../../global/gamestate';
import { VariantManager } from '../../global/variant';

export class VariantsMenu extends Menu {

  protected menuTitle = ['Variants'];

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

      const opt = this.addOption(VariantManager.keyDisplay(variantKey), {
        keys: (option, menu) => {

          this.watchForKey('Left', { player: this.menuControlPlayer, option, menu }, () => {
            let resIdx = _.indexOf(options, VariantManager.getKey(variantKey));
            if(resIdx === -1) resIdx = 0;

            const newIdx = resIdx - 1 === -1 ? options.length - 1 : resIdx - 1;
            VariantManager.setKey(variantKey, (<any>options)[newIdx]);
            opt.textObj.text = VariantManager.keyDisplay(variantKey);
          });

          this.watchForKey('Right', { player: this.menuControlPlayer, option, menu }, () => {
            let resIdx = _.indexOf(options, VariantManager.getKey(variantKey));
            if(resIdx === -1) resIdx = 0;

            const newIdx = resIdx + 1 === options.length ? 0 : resIdx + 1;
            VariantManager.setKey(variantKey, (<any>options)[newIdx]);
            opt.textObj.text = VariantManager.keyDisplay(variantKey);
          });
        }});

      opt.textObj.inputEnabled = true;
      opt.textObj.events.onInputDown.add((t, e) => {
        const { x } = e.position;

        const textMod = t.x + (t.width / 2) + (t.width / 4);

        let resIdx = _.indexOf(options, VariantManager.getKey(variantKey));
        let newIdx;
        if(x > textMod) {
          newIdx = resIdx + 1 === options.length ? 0 : resIdx + 1;
        } else {
          newIdx = resIdx - 1 === -1 ? options.length - 1 : resIdx - 1;
        }

        VariantManager.setKey(variantKey, (<any>options)[newIdx]);
        opt.textObj.text = VariantManager.keyDisplay(variantKey);
      });
    };

    allYesNoRandomVariants.forEach(variant => {
      createOption(variant, ['Random', 'No', 'Yes']);
    });

    allZeroToFourVariants.forEach(variant => {
      createOption(variant, [0, 1, 2, 3, 4]);
    });

    this.addOption('Back', { callback: () => {
      GameState.popState();
    }});

    this.recalculateVisibleOptions();

  }
}
