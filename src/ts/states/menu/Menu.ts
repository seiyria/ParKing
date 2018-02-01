
import * as _ from 'lodash';

import { KeyMapHandler } from '../../global/key';
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

  protected options: Option[] = [];
  protected visibleOptions: Option[] = [];
  protected selectedOption = 0;

  protected menuVerticalOffset = 100;
  protected menuOptionSpacing = 50;
  protected menuAlign: 'left'|'center' = 'left';

  protected menuTitle: string;

  protected background: Phaser.Sprite;
  protected pointer: Phaser.Sprite;
  protected alphaText: Phaser.Text;
  protected titleText: Phaser.Text;

  constructor(opts) {
    super();
    _.extend(this, opts);
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
    this.titleText = this.game.add.text(0, 100, this.menuTitle, titleOpts);
    this.titleText.anchor.set(0.5);
  }

  public update() {
    this.titleText.position.x = this.game.width / 2;

    this.visibleOptions.forEach((opt, index) => {
      this.setMenuTextXY(opt.textObj, index);
    });

    const opt = this.getCurrentOption();

    if(opt) {
      this.pointer.x = opt.textObj.x - 60;

      const menuPointerAnimation = (this.game.time.now / 25) % 28;
      if(menuPointerAnimation < 14) {
        this.pointer.height = 16 - menuPointerAnimation;
        this.pointer.y = (opt.textObj.y + menuPointerAnimation / 2) - 3;
      } else {
        this.pointer.height = menuPointerAnimation - 12;
        this.pointer.y = (opt.textObj.y + 14 - (menuPointerAnimation / 2)) - 3;
      }

      if(opt.update) {
        opt.update();
      }

      if(KeyMapHandler.isDown('Confirm', 0) && opt.callback) {
        opt.callback();
        return;
      }
    }

    if(KeyMapHandler.isDown('Down', 0)) {
      this.selectedOption++;
      if(this.selectedOption >= this.options.length) this.selectedOption = 0;
      this.recalculateVisibleOptions();
      return;
    }

    if(KeyMapHandler.isDown('Up', 0)) {
      this.selectedOption--;
      if(this.selectedOption < 0) this.selectedOption = this.options.length - 1;
      this.recalculateVisibleOptions();
      return;
    }

  }

  protected setMenuTextXY(textObj: Phaser.Text, optIndex: number) {

    const originalSet = !textObj.x && !textObj.y;

    if(this.menuAlign === 'left') {
      textObj.x = this.game.width / 6;

    } else {

      // normally we'd subtract textObj.width / 2, but we want the arrow to be the same position for all of the options
      textObj.x = (this.game.width / 2) - 50;
    }

    textObj.y = this.menuVerticalOffset + (this.menuOptionSpacing * optIndex);

    if(originalSet) {
      (<any>textObj).originalX = textObj.x;
      (<any>textObj).originalY = textObj.y;
    }
  }

  protected addOption(text: string, opts: { callback?: Function, update?: Function }): Option {

    const newIndex = this.options.length;

    const newOpt = new Option(opts);
    const textObj = this.game.add.text(0, 0, text, Helpers.defaultTextOptions());
    newOpt.textObj = textObj;

    textObj.inputEnabled = true;
    if(opts.callback) textObj.events.onInputDown.add(opts.callback);
    textObj.events.onInputOver.add(() => {
      this.selectedOption = newIndex;
    });

    this.setMenuTextXY(textObj, newIndex);

    this.options.push(newOpt);

    if(newIndex === 0) {
      this.pointer.visible = true;
      this.pointer.x = textObj.x - 70;
      this.pointer.y = textObj.y + 3;
    }

    this.recalculateVisibleOptions();

    return newOpt;
  }

  protected getCurrentOption(): Option {
    return this.options[this.selectedOption];
  }

  protected recalculateVisibleOptions() {
    const optionHeight = this.options[0].textObj.y;
    const heightBuffer = this.titleText ? this.titleText.height + this.menuVerticalOffset : 0;
    const optionsVisible = _.reject(this.options, opt => heightBuffer + (<any>opt.textObj).originalY - optionHeight >= this.game.height);
    const numOptsVisible = optionsVisible.length;
    if(numOptsVisible === this.options.length) {
      this.visibleOptions = this.options;
      return;
    }

    let sliceStart = 0;
    if(this.selectedOption > numOptsVisible / 2) sliceStart = Math.floor(this.selectedOption - numOptsVisible / 2);

    this.options.forEach(opt => opt.textObj.visible = false);

    this.visibleOptions = this.options.slice(sliceStart);
    this.visibleOptions.forEach((opt, idx) => {
      this.setMenuTextXY(opt.textObj, idx);
      opt.textObj.visible = true;
    });

  }
}
