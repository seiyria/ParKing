
import * as _ from 'lodash';

import { Observable } from 'rxjs';

import { Key, DelayedInputHandler } from '../../global/key';
import { Helpers } from '../../global/helpers';

class Option {

  callback: () => void;
  update: (state?: any) => void;
  textObj: Phaser.Text;

  constructor(opts: { callback?: Function, update?: Function }) {
    _.extend(this, opts);
  }
}

export abstract class Menu extends Phaser.State {

  protected options: Array<Option[]> = [];
  protected visibleOptions: Option[] = [];
  protected selectedOption = 0;
  protected selectedMenu = 0;

  protected menuVerticalOffset = 100;
  protected menuOptionSpacing = 50;
  protected menuAlign: 'left'|'center' = 'left';

  protected menuTitle: string[];

  protected pointer: Phaser.Sprite;
  protected alphaText: Phaser.Text;
  protected titleText: Phaser.Text;

  protected menuItems: Phaser.Group;

  protected menuControlPlayer: number = 0;

  protected keyMapHandler: DelayedInputHandler;
  protected key$: Observable<{ key: string, player: number }>;

  protected get currentOption(): Option {
    return this.currentOptions[this.selectedOption];
  }

  protected get currentOptions(): Option[] {
    return this.options[this.selectedMenu] || [];
  }

  protected get widthScaler(): number {
    return this.game.world.width;
  }

  constructor(opts) {
    super();
    _.extend(this, opts);
  }

  public init() {
    this.menuItems = this.game.add.group();

    this.initKeyHandler();

    const manualUpdate = () => {
      this.repositionTitleText();
      this.repositionPointer();
    };

    this.watchForKey('Down', { player: this.menuControlPlayer }, () => {
      this.selectedOption++;
      if(this.selectedOption >= this.currentOptions.length) this.selectedOption = 0;
      this.recalculateVisibleOptions();
      this.manuallyRepositionTitleAndPointer();
    });

    this.watchForKey('Up', { player: this.menuControlPlayer }, () => {
      this.selectedOption--;
      if(this.selectedOption < 0) this.selectedOption = this.currentOptions.length - 1;
      this.recalculateVisibleOptions();
      this.manuallyRepositionTitleAndPointer();
    });

    this.watchForKey('Confirm', { player: this.menuControlPlayer }, () => {
      const opt = this.currentOption;
      if(!opt) return;

      opt.callback();
    });
  }

  public create() {

    this.game.world.scale.set(1, 1);
    this.options = [];

    this.pointer = this.game.add.sprite(0, 0, 'menu-arrow');
    this.pointer.scale.y = 0.5;
    this.pointer.scale.x = 0.5;

    const opts = Helpers.defaultTextOptions();
    opts.align = 'center';
    opts.fontSize = 10;
    this.alphaText = this.game.add.text(10, 10, 'MEGA ALPHA EDITION', opts);

    const titleOpts = Helpers.defaultTextOptions();
    titleOpts.align = 'center';
    titleOpts.fontSize = 50;
    this.titleText = this.game.add.text(0, 100, this.menuTitle[0], titleOpts);
    this.titleText.anchor.set(0.5);

    this.menuItems.add(this.pointer);
    this.menuItems.add(this.alphaText);
    this.menuItems.add(this.titleText);
  }

  public update() {
    this.titleText.setText(this.menuTitle[this.selectedMenu]);
    this.repositionTitleText();

    this.visibleOptions.forEach((opt, index) => {
      this.setMenuTextXY(opt.textObj, index);
    });

    this.repositionPointer();

    const opt = this.currentOption;

    if(opt && opt.update) {
      opt.update();
    }

  }

  public shutdown() {
    this.pointer.destroy();
    this.alphaText.destroy();
    this.titleText.destroy();
    this.menuItems.destroy();

    for(let i = 0; i < this.options.length; i++) {
      this.options[i].forEach(opt => {
        opt.textObj.destroy();
      });
    }
  }

  protected manuallyRepositionTitleAndPointer() {
    this.recalculateVisibleOptions();
    this.repositionTitleText();
    this.repositionPointer(true);
  }

  protected repositionTitleText() {
    this.titleText.position.x = this.widthScaler / 2;
  }

  protected repositionPointer(forceFullSize = false) {

    const opt = this.currentOption;

    this.pointer.x = opt.textObj.x - 60;

    if(forceFullSize) {
      this.pointer.height = 16;
      this.pointer.y = opt.textObj.y + 1;
      return;
    }

    const menuPointerAnimation = (this.game.time.now / 25) % 28;
    if(menuPointerAnimation < 14) {
      this.pointer.height = 16 - menuPointerAnimation;
      this.pointer.y = (opt.textObj.y + menuPointerAnimation / 2) + 1;
    } else {
      this.pointer.height = menuPointerAnimation - 12;
      this.pointer.y = (opt.textObj.y + 14 - (menuPointerAnimation / 2)) + 1;
    }
  }

  private initKeyHandler() {
    this.keyMapHandler = new DelayedInputHandler();
    this.keyMapHandler.init(this.game);
  }

  protected watchForKey(watchKey: Key, watch: { player?: number, option?: number, menu?: number }, callback: (args) => void) {
    this.keyMapHandler.keyEmitter
      .filter(({ key, player }) => key === watchKey
                                && (_.isUndefined(watch.player) || watch.player === player)
                                && (_.isUndefined(watch.option) || watch.option === this.selectedOption)
                                && (_.isUndefined(watch.menu)   || watch.menu   === this.selectedMenu)
      )
      .subscribe(callback);
  }

  protected setMenuTextXY(textObj: Phaser.Text, optIndex: number) {

    const originalSet = !textObj.x && !textObj.y;

    if(this.menuAlign === 'left') {
      textObj.x = this.widthScaler / 6;

    } else {

      // normally we'd subtract textObj.width / 2, but we want the arrow to be the same position for all of the options
      textObj.x = (this.widthScaler / 2) - 50;
    }

    textObj.y = this.menuVerticalOffset + (this.menuOptionSpacing * optIndex);

    if(originalSet) {
      (<any>textObj).originalX = textObj.x;
      (<any>textObj).originalY = textObj.y;
    }
  }

  protected addOption(text: string, opts: { callback?: Function, update?: Function, keys?: Function }, menu: number = 0): Option {

    const newIndex = this.currentOptions.length;

    const newOpt = new Option(opts);
    const textObj = this.game.add.text(0, 0, text, Helpers.defaultTextOptions());
    newOpt.textObj = textObj;

    if(opts.keys) {
      opts.keys(newIndex, menu);
    }

    textObj.inputEnabled = true;
    if(opts.callback) textObj.events.onInputDown.add(opts.callback);
    textObj.events.onInputOver.add(() => {
      this.selectedOption = newIndex;
    });

    this.options[menu] = this.options[menu] || [];
    this.options[menu].push(newOpt);

    this.setMenuTextXY(textObj, newIndex);

    if(newIndex === 0) {
      this.pointer.visible = true;
      this.pointer.x = textObj.x - 70;
      this.pointer.y = textObj.y + 3;
    }

    this.menuItems.add(textObj);

    return newOpt;
  }

  private hideAllOptions(): boolean {
    // don't hide all when there's only one menu to hide in
    if(this.options.length === 1) return false;

    for(let i = 0; i < this.options.length; i++) {
      this.options[i].forEach(opt => {
        opt.textObj.visible = false;
      });
    }

    return true;
  }

  protected recalculateVisibleOptions() {

    const didHide = this.hideAllOptions();

    const optionHeight = this.currentOptions[0].textObj.y;
    const heightBuffer = this.titleText ? this.titleText.height + this.menuVerticalOffset : 0;
    const optionsVisible = _.reject(this.currentOptions, opt => heightBuffer + (<any>opt.textObj).originalY - optionHeight >= this.game.height);

    const numOptsVisible = optionsVisible.length;
    if(numOptsVisible === this.currentOptions.length) {
      this.visibleOptions = this.currentOptions;
      this.visibleOptions.forEach((opt, idx) => {
        this.setMenuTextXY(opt.textObj, idx);
        if(didHide) opt.textObj.visible = true;
      });
      return;
    }

    let sliceStart = 0;
    if(this.selectedOption > numOptsVisible / 2) sliceStart = Math.floor(this.selectedOption - numOptsVisible / 2);

    this.currentOptions.forEach(opt => opt.textObj.visible = false);

    this.visibleOptions = this.currentOptions.slice(sliceStart);
    this.visibleOptions.forEach((opt, idx) => {
      this.setMenuTextXY(opt.textObj, idx);
      opt.textObj.visible = true;
    });

  }
}
