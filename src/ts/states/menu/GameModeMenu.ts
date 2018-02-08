
import { Menu } from './Menu';
import { GameState } from '../../global/gamestate';
import { ConfigManager } from '../../global/config';
import { Helpers } from '../../global/helpers';

const PARKING_1P_MENU   = 0;
const PARKING_MP_MENU   = 1;
const PARKING_GOLF_MENU = 2;

export class GameModeMenu extends Menu {

  protected menuTitle = ['Parking (1P)', 'Parking (2-4P)', 'Par King (1P)'];

  protected menuDescs = [
    'Park your cars as best as you can and get a new high score!',
    'Park your cars with your friends and compete to see who parks the best!',
    'Try to get under par while par king your cars! [not yet implemented]'
  ];

  protected menuDescText: Phaser.Text;
  protected menuLeftArrow: Phaser.Text;
  protected menuRightArrow: Phaser.Text;

  constructor() {
    super({ menuVerticalOffset: 300, menuOptionSpacing: 100, menuAlign: 'center' });
  }

  private goLeft() {
    this.selectedMenu--;
    if(this.selectedMenu < 0) this.selectedMenu = this.options.length - 1;
    ConfigManager.setGameMenu(this.selectedMenu);
    this.recalculateVisibleOptions();
  }

  private goRight() {
    this.selectedMenu++;
    if(this.selectedMenu >= this.options.length) this.selectedMenu = 0;
    ConfigManager.setGameMenu(this.selectedMenu);
    this.recalculateVisibleOptions();
  }

  public init(): void {
    super.init();

    this.watchForKey('Back', { player: this.menuControlPlayer }, () => {
      GameState.popState();
    });

    this.watchForKey('Left', { player: this.menuControlPlayer }, () => {
      this.goLeft();
    });

    this.watchForKey('Right', { player: this.menuControlPlayer }, () => {
      this.goRight();
    });
  }

  create() {
    super.create();

    this.addOption('Play', { callback: () => {
      GameState.setPlayer(0, true);
      GameState.pushState('SingleplayerValet');
      GameState.setPlaying(true);
    }}, PARKING_1P_MENU);

    this.addOption('Play', { callback: () => {
      GameState.setPlayer(0, true);
      GameState.pushState('MultiplayerValet');
      GameState.setPlaying(true);
    }}, PARKING_MP_MENU);

    this.addOption('Play', { callback: () => {
      console.log('not yet implemented');
    }}, PARKING_GOLF_MENU);

    this.addOption('Variants', { callback: () => {
      GameState.pushState('VariantsMenu');
    }}, PARKING_MP_MENU);

    for(let i = 0; i < this.menuTitle.length; i++) {
      this.addOption('Back', { callback: () => {
        GameState.popState();
      }}, i);
    }

    this.selectedMenu = ConfigManager.gameMenu;
    this.recalculateVisibleOptions();

    const titleOpts = Helpers.defaultTextOptions();
    titleOpts.align = 'center';
    titleOpts.fontSize = 20;
    titleOpts.wordWrap = true;
    titleOpts.wordWrapWidth = 500;

    this.menuDescText = this.game.add.text(0, 200, this.menuDescs[this.selectedMenu], titleOpts);
    this.menuDescText.anchor.set(0.5);

    const arrowOpts = Helpers.defaultTextOptions();
    arrowOpts.fontSize = 50;

    this.menuLeftArrow = this.game.add.text(0, 150, '◀', arrowOpts);
    this.menuRightArrow = this.game.add.text(0, 150, '▶', arrowOpts);

    this.menuLeftArrow.inputEnabled = true;
    this.menuRightArrow.inputEnabled = true;

    this.menuLeftArrow.events.onInputDown.add(() => this.goLeft());
    this.menuRightArrow.events.onInputDown.add(() => this.goRight());
  }

  update() {
    super.update();

    this.menuDescText.setText(this.menuDescs[this.selectedMenu]);
    this.menuDescText.position.x = this.game.width / 2;

    this.menuLeftArrow.position.x = this.game.width * 1 / 8;
    this.menuRightArrow.position.x = this.game.width * 7 / 8;
  }

  shutdown() {
    super.shutdown();

    this.menuDescText.destroy();
  }

}
