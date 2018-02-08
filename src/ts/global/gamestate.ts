
import * as _ from 'lodash';
import * as Phaser from 'phaser-ce';

import { ControlledEntity } from '../actors/ControlledEntity';
import { ConfigManager } from './config';

export enum PlayerColor {
  RED = 0,
  BLUE = 1,
  GREEN = 2,
  YELLOW = 3
}

class GameStateProps {
  playing: boolean;                     // are we currently playing
  states: string[] = [];                // states for menus pushing and popping

  // these get reset when play is quit
  players: boolean|number[] = [];       // player identifiers, maps to control schemes etc
  playerCars: ControlledEntity[] = [];  // current player cars
  playerScores: number[] = [];          // current player scores
  cars = [];                            // all cars
  debug: boolean;                       // are we in toggleDebug mode
}

export class GameState {

  private static game: Phaser.Game;

  private static _state: GameStateProps;
  public static get state(): GameStateProps {
    return _.clone(GameState._state);
  }

  static get allPlayers(): number[] {
    return _.filter(GameState._state.players, _.isNumber);
  }

  static init(game: Phaser.Game) {
    if(GameState.game) throw new Error('Cannot re-init GameState');
    GameState.game = game;

    GameState._state = new GameStateProps();
  }

  static toggleDebug(): boolean {
    GameState._state.debug = !GameState._state.debug;
    return GameState._state.debug;
  }

  static setPlaying(playing: boolean) {
    GameState._state.playing = playing;
  }

  static setPlayerCars(cars: ControlledEntity[]) {
    GameState._state.playerCars = cars;
  }

  static addHaltedCar(car: ControlledEntity) {
    GameState._state.cars.push(car);
  }

  static getPlayerScore(playerId: number) {
    return GameState._state.playerScores[playerId] || 0;
  }

  static setPlayerScore(playerId: number, score: number) {
    GameState._state.playerScores[playerId] = score;
  }

  static setPlayer(idx: number, exists: boolean) {
    GameState._state.players[idx] = exists ? idx : false;
  }

  public static screenShake(frames = 12, strength = 16) {
    const shakeFrames = (frames / 4) * 3 + (frames / 4) * ConfigManager.options.screenShake;
    const shakeStrength = (strength / 1000) * ConfigManager.options.screenShake;


    this.game.camera.shake(shakeStrength, shakeFrames * 10);
  }

  static pushState(state: string) {
    GameState._state.states.push(state);
    GameState.game.state.start(state);
  }

  static popState() {
    GameState._state.states.pop();
    GameState.game.state.start(_.last(GameState._state.states));
  }

  // reset everything
  public static reset() {
    GameState._state.cars = [];
    GameState._state.debug = false;
    GameState._state.players = [];
    GameState._state.playerCars = [];
    GameState._state.playerScores = [];
  }

  public static resetGameForInit() {
    GameState._state.cars = [];
    GameState._state.debug = false;
    GameState._state.playerCars = [];
    GameState._state.playerScores = [];
  }

  public static resetGame() {
    GameState.setPlaying(false);

    for(let i = 0; i < 4; i++) {
      GameState.setPlayer(i, null);
    }
  }
}
