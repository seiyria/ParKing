
import * as PIXI from 'pixi.js';
import * as _ from 'lodash';

import { ResourceManager } from '../global/resources';
import { World } from '../global/world';
import { ConfigManager } from '../global/config';
import { isKeyDown } from '../global/key';
import { GameLevel } from '../gamelevels/GameLevel';
import { GameState } from '../global/gamestate';
import { Helpers } from '../global/helpers';

export const ACCUMULATOR_THRESHOLD = 75;

export class Option {

  callback: () => {};
  onInputChange: () => boolean;
  update: (now: number, delta: number, state?: any) => {};
  state: any;
  textObj: PIXI.Text;

  constructor(opts: { callback?: Function, onInputChange?: Function, update?: Function, state?: any }) {
    _.extend(this, opts);
  }
}

export abstract class Menu extends PIXI.Container {

  protected options: Option[] = [];
  protected visibleOptions: Option[] = [];
  protected selectedOption = 0;

  protected menuVerticalOffset = 100;
  protected menuOptionSpacing = 50;
  protected menuAlign: 'left'|'center' = 'left';

  protected background: PIXI.Sprite;
  protected pointer: PIXI.Sprite;
  protected alphaText: PIXI.Text;
  protected titleText: PIXI.Text;

  constructor(opts) {
    super();
    _.extend(this, opts);
    this.init();
  }

  protected init() {
    this.background = new PIXI.Sprite(ResourceManager.getResource('default'));
    this.background.width = World.renderer.width;
    this.background.height = World.renderer.height;
    this.background.tint = World.renderer.backgroundColor;
    this.addChild(this.background);

    this.pointer = new PIXI.Sprite(ResourceManager.getResource('menu-arrow'));
    this.pointer.width = 16;
    this.pointer.height = 16;
    this.addChild(this.pointer);

    const opts = Helpers.defaultTextOptions();
    opts.align = 'center';
    opts.fontSize = 10;
    this.alphaText = new PIXI.Text('MEGA ALPHA EDITION', opts);
    this.alphaText.x = 5;
    this.alphaText.y = 5;
    this.addChild(this.alphaText);
  }

  protected setMenuTextXY(textObj: PIXI.Text, optIndex: number) {

    const originalSet = !textObj.x && !textObj.y;

    if(this.menuAlign === 'left') {
      textObj.x = World.renderer.width / 6;

    } else {

      // normally we'd subtract textObj.width / 2, but we want the arrow to be the same position for all of the options
      textObj.x = (World.renderer.width / 2) - 50;
    }

    textObj.y = this.menuVerticalOffset + ConfigManager.scaleY(this.menuOptionSpacing * optIndex);

    if(originalSet) {
      (<any>textObj).originalX = textObj.x;
      (<any>textObj).originalY = textObj.y;
    }
  }

  protected addOption(text: string, opts: { callback?: Function, onInputChange?: Function, update?: Function, state?: any }) {

    const newIndex = this.options.length;

    const newOpt = new Option(opts);
    const textObj = new PIXI.Text(text, Helpers.defaultTextOptions());
    newOpt.textObj = textObj;

    this.setMenuTextXY(textObj, newIndex);

    this.options.push(newOpt);
    this.addChild(textObj);

    if(newIndex === 0) {
      this.pointer.visible = true;
      this.pointer.x = textObj.x - ConfigManager.scaleX(20 * newIndex);
      this.pointer.y = textObj.y + ConfigManager.scaleY(5);
    }

    this.recalculateVisibleOptions();
  }

  protected getCurrentOption(): Option {
    return this.options[this.selectedOption];
  }

  public onInputChange(): { playing?: boolean, done?: boolean, level?: GameLevel } {
    const option = this.getCurrentOption();

    let overrideDefault = false;

    if(option && option.onInputChange) {
      overrideDefault = option.onInputChange();
    }

    if(!overrideDefault) {
      if(isKeyDown('Down')) {
        this.selectedOption++;
        if(this.selectedOption >= this.options.length) this.selectedOption = 0;
        this.recalculateVisibleOptions();
        return { done: true };
      }

      if(isKeyDown('Up')) {
        this.selectedOption--;
        if(this.selectedOption < 0) this.selectedOption = this.options.length - 1;
        this.recalculateVisibleOptions();
        return { done: true };
      }

      if(isKeyDown('Escape')) {
        GameState.removeMenu();
        return { done: true };
      }

      if(isKeyDown('Enter') && option && option.callback) {
        return option.callback();
      }
    }

    return {};
  }

  protected recalculateVisibleOptions() {
    const optionHeight = this.options[0].textObj.y;
    const heightBuffer = this.titleText ? this.titleText.height + this.menuVerticalOffset : 0;
    const optionsVisible = _.reject(this.options, opt => heightBuffer + (<any>opt.textObj).originalY - optionHeight >= ConfigManager.HEIGHT);
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

  protected addMenu(menu: Menu) {
    GameState.addMenu(menu);
    World.stage.addChild(menu);
  }

  public update(now: number, delta: number) {
    this.visibleOptions.forEach((opt, index) => {
      (<any>opt.textObj).style = Helpers.defaultTextOptions(); // shouldn't need <any> cast, but ts.d is broken
      this.setMenuTextXY(opt.textObj, index);
    });

    const opt = this.getCurrentOption();
    if(!opt) return;

    if(opt.update) {
      const state = opt.state || {};
      state.opt = opt;
      opt.update(now, delta, state);
    }

    const menuPointerAnimation = (now / 25) % 28;

    if(menuPointerAnimation < 14) {
      this.pointer.height = ConfigManager.scaleY(16 - menuPointerAnimation);
      this.pointer.y = (opt.textObj.y + menuPointerAnimation / 2) - 3;
    } else {
      this.pointer.height = ConfigManager.scaleY(menuPointerAnimation - 12);
      this.pointer.y = (opt.textObj.y + 14 - (menuPointerAnimation / 2)) - 3;
    }

    this.pointer.width = ConfigManager.scaleX(16);
    this.pointer.x = opt.textObj.x - ConfigManager.scaleX(60);
  }
}
