
import * as _ from 'lodash';

import { Menu } from './Menu';
import { World } from '../global/world';
import { GameState } from '../global/gamestate';

import * as GameModes from '../gamemodes';
import * as GameLevels from '../gamelevels';
import { VariantMenu } from './VariantMenu';
import { OptionsMenu } from './OptionsMenu';
import { ConfigManager } from '../global/config';
import { Helpers } from '../global/helpers';

const possibleTexts = [
  'Wow!',
  'Wowwie!',
  'Spooky!',
  'Ker Blam!',
  'Vroom vroom!',
  'Park it!',
  'Antidisestablishmentarianism!',
  'Has anyone gone so far as to decided how to be?'
];

export class MainMenu extends Menu {

  private splashText: PIXI.Text;

  constructor() {
    super({ menuVerticalOffset: 300, menuAlign: 'center' });
  }

  protected init() {
    super.init();

    // TODO go to a menu that has more play options
    this.addOption('Play', { callback: () => {
      GameState.removeMenu(this);
      GameState.setPlayer(0, true);
      GameState.setLevel(new GameLevels.BasicArena());
      GameState.setGameMode(new GameModes.MultiplayerValet(8));
      return { playing: true };
    }});

    this.addOption('Variants', { callback: () => {
      this.addMenu(new VariantMenu());
    }});

    this.addOption('Options', { callback: () => {
      this.addMenu(new OptionsMenu());
    }});

    const titleOpts = Helpers.defaultTextOptions();
    titleOpts.align = 'center';
    titleOpts.fontSize = 50;
    this.titleText = new PIXI.Text('Par King', titleOpts);
    this.addChild(this.titleText);

    const splashOpts = Helpers.defaultTextOptions();
    splashOpts.align = 'center';
    splashOpts.fontSize = 20;
    splashOpts.fill = 0xFFFF00;
    splashOpts.wordWrap = true;
    splashOpts.wordWrapWidth = 150;
    splashOpts.breakWords = true;
    this.splashText = new PIXI.Text(_.sample(possibleTexts), splashOpts);
    this.splashText.rotation = 100;
    this.addChild(this.splashText);
  }

  update(now: number, delta: number) {
    super.update(now, delta);

    this.titleText.x = World.renderer.width / 2 - this.titleText.width / 2;
    this.titleText.y = ConfigManager.scaleY(20);
    this.titleText.style.fontSize = ConfigManager.scaleX(50);

    this.splashText.x = 15 + this.titleText.x + this.titleText.width - this.splashText.width / 2;
    this.splashText.y = 20 + this.titleText.y + this.titleText.height;

    const nowMod = (now / 2000) % 1;
    if(nowMod <= 0.5) {
      this.splashText.scale.x = 1.5 - nowMod;
      this.splashText.scale.y = 1.5 - nowMod;
    } else {
      this.splashText.scale.x = 0.5 + nowMod;
      this.splashText.scale.y = 0.5 + nowMod;
    }
  }
}
