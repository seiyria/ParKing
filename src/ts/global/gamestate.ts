
import * as _ from 'lodash';
import { GameMode } from '../gamemodes/gamemode';
import { Menu } from '../menus/Menu';
import { GameLevel } from '../gamelevels/GameLevel';
import { World } from './world';
import { ControlledEntity } from '../actors/ControlledEntity';

class GameStateProps {
  menus: Menu[] = [];                   // menu stack
  playing: boolean;                     // are we currently playing

  // these get reset when play is quit
  players: boolean[] = [];              // player identifiers, maps to control schemes etc
  playerCars: ControlledEntity[] = [];  // current player cars
  playerScores: number[] = [];          // current player scores
  cars = [];                            // all cars
  level: GameLevel;                     // current game level
  gameMode: GameMode;                   // current game mode
  debug: boolean;                       // are we in debug mode
}

export class GameState {

  private static _state: GameStateProps;
  public static get state(): GameStateProps {
    return _.clone(GameState._state);
  }

  static init() {
    if(GameState._state) throw new Error('Cannot re-init GameState');
    GameState._state = new GameStateProps();
  }

  static toggleDebug(): boolean {
    GameState._state.debug = !GameState._state.debug;
    return GameState._state.debug;
  }

  static setGameMode(mode: GameMode) {
    GameState._state.gameMode = mode;
  }

  static addMenu(menu: Menu) {
    GameState._state.menus.push(menu);
  }

  static removeMenu(menu?: Menu): void {
    if(GameState._state.menus.length === 0) return;

    if(!menu) menu = _.last(GameState._state.menus);

    GameState._state.menus.splice(GameState._state.menus.indexOf(menu));
    World.stage.removeChild(menu);
  }

  static setPlaying(playing: boolean) {
    GameState._state.playing = playing;

    if(!playing) {
      GameState.reset();
    }
  }

  static setLevel(level: GameLevel) {
    GameState._state.level = level;
  }

  static setPlayerCars(cars: ControlledEntity[]) {
    GameState._state.playerCars = cars;
  }

  static addHaltedCar(car: ControlledEntity) {
    GameState._state.cars.push(car);
  }

  static resetPlayerScores() {
    GameState._state.playerScores = [0, 0, 0, 0];
  }

  static setPlayer(idx: number, exists: boolean) {
    GameState._state.players[idx] = exists;
  }

  // reset everything
  private static reset() {
    GameState._state.cars = [];
    GameState._state.debug = false;
    GameState._state.players = [];
    GameState._state.playerCars = [];
    GameState._state.playerScores = [];
    GameState._state.level = null;
    GameState._state.gameMode = null;
  }
}

GameState.init();
