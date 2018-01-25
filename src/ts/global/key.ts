
const playerGamepads = [];

const _keys = {
  37: 0,              // left
  39: 0,              // right
  38: 0,              // up
  40: 0,              // down
  13: 0,              // enter
  27: 0,              // escape
  8 : 0,              // backspace
  32: 0,              // spacebar
  17: 0,              // ctrl
  18: 0,              // alt
  91: 0,              // Windows Key / Left Command
  93: 0,              // Windows Menu / Right Command
  16: 0,              // shift
  9 : 0,              // tab
  20: 0,              // caps lock
  192: 0,             // backtick / tilde ("grave accent")
  220: 0,             // back slash
};

export const KeyMap = {
  Left       : 37,    // left arrow
  Right      : 39,    // right arrow
  Up         : 38,    // up arrow
  Down       : 40,    // down arrow
  Enter      : 13,    // enter button
  Escape     : 27,    // escape button
  Pause      : 13,    // enter button
  SteerLeft  : 37,    // left arrow
  SteerRight : 39,    // right arrow
  Brake      : 40,    // down arrow
  Debug      : 192    // tilde
};

export const ButtonMap = {
  Left       : 14,    // dpad-L
  Right      : 15,    // dpad-R
  Up         : 12,    // dpad-U
  Down       : 13,    // dpad-D
  Enter      : 0,     // xbox-A
  Escape     : 1,     // xbox-B
  Pause      : 9,     // xbox-Pause
  SteerLeft  : 14,    // dpad-L
  SteerRight : 15,    // dpad-R
  Brake      : 0,     // xbox-A
  Debug      : 4      // xbox-RB
};

type Key = 'Left' | 'Right' | 'Up' | 'Down' | 'Enter' | 'Escape' | 'Backspace'
| 'SteerLeft' | 'SteerRight' | 'Brake' | 'Debug' | 'Pause';

export function isKeyDown(key: Key, player = 0) {
  const baseCond = _keys[KeyMap[key]];

  // only check gamepads if the doc has focus
  if(playerGamepads[player] && document.hasFocus()) {
    const gamepad = navigator.getGamepads()[player];
    const button = gamepad.buttons[ButtonMap[key]];
    return baseCond || button.pressed;
  }

  return baseCond;
}

export function setKeyValue(key: number, val: number) {
  _keys[key] = val;
}

export function setKey(key: number) {
  setKeyValue(key, 1);
}

export function unsetKey(key: number) {
  setKeyValue(key, 0);
}

window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
  const pad = e.gamepad;
  playerGamepads[pad.index] = true;
});

window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
  const pad = e.gamepad;
  playerGamepads[pad.index] = null;
});
