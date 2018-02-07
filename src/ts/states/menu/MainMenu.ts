
import * as _ from 'lodash';

import { Menu } from './Menu';
import { Helpers } from '../../global/helpers';
import { GameState } from '../../global/gamestate';

const possibleTexts = [
  'Wow!',
  'Wowwie!',
  'Spooky!',
  'Ker Blam!',
  'Vroom vroom!',
  'Park it!',
  'No brakes 4 u!',
  'Has anyone gone so far as to decided how to be?'
];

export class MainMenu extends Menu {

  protected menuTitle = ['Par King'];
  private funText: Phaser.Text;

  private baseFunWidth: number;

  constructor() {
    super({ menuVerticalOffset: 300, menuOptionSpacing: 100, menuAlign: 'center' });
  }

  public create(): void {
    super.create();

    const splashOpts = Helpers.defaultTextOptions();
    splashOpts.align = 'center';
    splashOpts.fontSize = 20;
    splashOpts.fill = '#ff0';
    splashOpts.wordWrap = true;
    splashOpts.wordWrapWidth = 200;

    this.funText = this.game.add.text(0, this.titleText.y + this.titleText.height, _.sample(possibleTexts), splashOpts);
    this.funText.rotation = 100;

    this.baseFunWidth = this.funText.width / 2;

    this.addOption('Play', { callback: () => {
      GameState.pushState('GameModeMenu');
    }});

    this.addOption('Options', { callback: () => {
      GameState.pushState('OptionsMenu');
    }});

    this.addOption('Quit', { callback: () => {
      if(window.confirm('Are you sure you want to quit? Vroom vroom?')) {
        window.open(window.location.toString(), '_self').close();
      }
    }});

    this.recalculateVisibleOptions();
  }

  public update() {
    super.update();

    this.funText.x = 15 + this.titleText.x + (this.titleText.width / 2) - this.baseFunWidth;

    const nowMod = (this.game.time.now / 1500) % 1;

    const val = nowMod <= 0.5 ? 1.5 - nowMod : 0.5 + nowMod;

    this.funText.scale.x = this.funText.scale.y = val;
  }

  public shutdown() {
    super.shutdown();

    this.funText.destroy();
  }
}
