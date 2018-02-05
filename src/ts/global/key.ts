
import * as Phaser from 'phaser-ce';

type Key = 'Left' | 'Right' | 'Up' | 'Down'
  | 'Confirm' | 'Back' | 'Pause' | 'Debug'
  | 'Brake' | 'SteerLeft' | 'SteerRight';

// TODO redo key handling so there is a hash (use window.onkeydown etc)
// TODO also include gamepad

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

  Brake: (gamepad: Phaser.Gamepad): boolean => false,
  SteerLeft: (gamepad: Phaser.Gamepad): boolean => false,
  SteerRight: (gamepad: Phaser.Gamepad): boolean => false
};

KeyToGamepad.Brake = KeyToGamepad.Down;
KeyToGamepad.SteerLeft = KeyToGamepad.Left;
KeyToGamepad.SteerRight = KeyToGamepad.Right;

const FRAME_MOD = 10;
const FRAMES_PERCENT = 80;
const DROPPED_FRAMES = FRAME_MOD * (FRAMES_PERCENT / 100);

export class KeyMapHandler {

  private static game: Phaser.Game;

  public static init(game: Phaser.Game) {
    if(KeyMapHandler.game) throw new Error('Cannot re-init KeyMapHandler');
    KeyMapHandler.game = game;
  }

  public static isDown(key: Key, player = 0, useFrameLimiter = true) {

    // drop some input, useful for menus
    if(useFrameLimiter && (KeyMapHandler.game.time.now / FRAME_MOD) % FRAME_MOD < DROPPED_FRAMES) return;

    const keyboard = KeyMapHandler.isKeyDown(key, player);
    const gamepad = KeyMapHandler.isGamepadDown(key, player);

    return keyboard || gamepad;
  }

  private static isKeyDown(key: Key, player = 0): boolean {
    if(player !== 0) return false;
    return KeyMapHandler.game.input.keyboard.isDown(KeyToPhaserKey[key]);
  }

  private static isGamepadDown(key: Key, player = 0): boolean {
    const gamepadContainer = KeyMapHandler.game.input.gamepad;
    const gamepad = gamepadContainer[`pad${player + 1}`];

    if(!gamepadContainer.supported || !gamepadContainer.active || !gamepad || !gamepad.connected) return false;

    return KeyToGamepad[key](gamepad);
  }
}
