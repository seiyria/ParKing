
import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';

import { Subject } from 'rxjs';

export type Key = 'Left' | 'Right' | 'Up' | 'Down'
  | 'Confirm' | 'Back' | 'Pause' | 'Debug'
  | 'Brake' | 'SteerLeft' | 'SteerRight';

const KeyToPhaserKey = {
  Up:         Phaser.Keyboard.UP,
  Down:       Phaser.Keyboard.DOWN,
  Left:       Phaser.Keyboard.LEFT,
  Right:      Phaser.Keyboard.RIGHT,

  Confirm:    Phaser.Keyboard.ENTER,
  Back:       Phaser.Keyboard.ESC,
  Pause:      Phaser.Keyboard.SPACEBAR,
  Debug:      Phaser.Keyboard.TILDE,

  Brake:      0,
  SteerLeft:  0,
  SteerRight: 0
};

KeyToPhaserKey.Brake = KeyToPhaserKey.Down;
KeyToPhaserKey.SteerLeft = KeyToPhaserKey.Left;
KeyToPhaserKey.SteerRight = KeyToPhaserKey.Right;

const KeyToGamepad = {
  Up: (gamepad: Phaser.Gamepad): boolean => {
    return gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)
      || (<any>gamepad).axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) <= -0.1;
  },
  Down: (gamepad: Phaser.Gamepad): boolean => {
    return gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)
        || (<any>gamepad).axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) >= 0.1;
  },
  Left: (gamepad: Phaser.Gamepad): boolean => {
    return gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)
      || (<any>gamepad).axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) <= -0.1;
  },
  Right: (gamepad: Phaser.Gamepad): boolean => {
    return gamepad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)
      || (<any>gamepad).axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) >= 0.1;
  },

  Confirm: (gamepad: Phaser.Gamepad): boolean => gamepad.isDown(Phaser.Gamepad.XBOX360_A),
  Back: (gamepad: Phaser.Gamepad): boolean => {
    return gamepad.isDown(Phaser.Gamepad.XBOX360_B) || gamepad.isDown(Phaser.Gamepad.XBOX360_BACK);
  },
  Pause: (gamepad: Phaser.Gamepad): boolean => gamepad.isDown(Phaser.Gamepad.XBOX360_START),
  Debug: (gamepad: Phaser.Gamepad): boolean => gamepad.isDown(Phaser.Gamepad.XBOX360_LEFT_BUMPER),

  Brake: (gamepad: Phaser.Gamepad): boolean => gamepad.isDown(Phaser.Gamepad.XBOX360_X),
  SteerLeft: (gamepad: Phaser.Gamepad): boolean => false,
  SteerRight: (gamepad: Phaser.Gamepad): boolean => false
};

KeyToGamepad.SteerLeft = KeyToGamepad.Left;
KeyToGamepad.SteerRight = KeyToGamepad.Right;

const GamepadToKey = {
  [Phaser.Gamepad.XBOX360_DPAD_UP]: 'Up',
  [Phaser.Gamepad.XBOX360_DPAD_DOWN]: 'Down',
  [Phaser.Gamepad.XBOX360_DPAD_LEFT]: 'Left',
  [Phaser.Gamepad.XBOX360_DPAD_RIGHT]: 'Right',
  [Phaser.Gamepad.XBOX360_A]: 'Confirm',
  [Phaser.Gamepad.XBOX360_B]: 'Back',
  [Phaser.Gamepad.XBOX360_BACK]: 'Back',
  [Phaser.Gamepad.XBOX360_START]: 'Pause',
  [Phaser.Gamepad.XBOX360_LEFT_BUMPER]: 'Debug'
};

export class InstantInputHandler {

  private game: Phaser.Game;

  public init(game: Phaser.Game) {
    if(this.game) throw new Error('Cannot re-init KeyMapHandler');
    this.game = game;
  }

  public isDown(key: Key, player = 0) {

    const keyboard = this.isKeyDown(key, player);
    const gamepad = this.isGamepadDown(key, player);

    return keyboard || gamepad;
  }

  private isKeyDown(key: Key, player = 0): boolean {
    if(player !== 0) return false;
    return this.game.input.keyboard.isDown(KeyToPhaserKey[key]);
  }

  private isGamepadDown(key: Key, player = 0): boolean {
    const gamepadContainer = this.game.input.gamepad;
    const gamepad = gamepadContainer[`pad${player + 1}`];

    if(!gamepadContainer.supported || !gamepadContainer.active || !gamepad || !gamepad.connected) return false;

    return KeyToGamepad[key](gamepad);
  }
}

export class DelayedInputHandler {

  private game: Phaser.Game;

  public keyEmitter: Subject<{ key: string, player: number }> = new Subject();

  public init(game: Phaser.Game) {
    if(this.game) throw new Error('Cannot re-init KeyMapHandler');
    this.game = game;

    this.initKeys();
  }

  private initKeys() {
    this.initKeyboard();
    this.initGamepad();
  }

  private initKeyboard() {

    // this is for m~e~n~u~s only.
    // game key handling is shown above
    const keyMap = this.game.input.keyboard.addKeys(
      _.omitBy(KeyToPhaserKey, (val, key) => _.includes(['Brake', 'SteerLeft', 'SteerRight'], key))
    );

    Object.keys(keyMap).forEach(key => {
      keyMap[key].onDown.add(() => {
        this.keyEmitter.next({ key, player: 0 });
      });
    });
  }

  private initGamepad() {
    for(let i = 1; i <= 4; i++) {
      const gamepad = this.game.input.gamepad[`pad${i}`];

      let lastFired = '';

      gamepad.onAxisCallback = _.throttle((pad, axis, value) => {
        if(value === 0) lastFired = '';

        // ¯\_(ツ)_/¯
        if(axis === Phaser.Gamepad.XBOX360_STICK_LEFT_X) {
          if(value > 0) {
            if(lastFired !== 'x+') {
              lastFired = 'x+';
              this.keyEmitter.next({ key: 'Right', player: i - 1 });
            }
          } else if(value < 0) {
            if(lastFired !== 'x-') {
              lastFired = 'x-';
              this.keyEmitter.next({ key: 'Left', player: i - 1 });
            }
          }

        } else if(axis === Phaser.Gamepad.XBOX360_STICK_LEFT_Y) {
          if(value > 0) {
            if(lastFired !== 'y-') {
              lastFired = 'y-';
              this.keyEmitter.next({ key: 'Down', player: i - 1 });
            }
          } else if(value < 0) {
            if(lastFired !== 'y+') {
              lastFired = 'y+';
              this.keyEmitter.next({ key: 'Up', player: i - 1 });
            }
          }

        }
      }, 100);

      gamepad.onDownCallback = (sentInputKey) => {
        this.keyEmitter.next({ key: GamepadToKey[sentInputKey], player: i - 1 });
      }


    }
  }
}
