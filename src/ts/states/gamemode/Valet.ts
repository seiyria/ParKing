
import * as _ from 'lodash';
import * as weighted from 'weighted';

import { GameMode } from './GameMode';
import { Helpers } from '../../global/helpers';
import { GameState, PlayerColor } from '../../global/gamestate';

import * as Cars from '../../actors/AllCars';
import { ControlledEntity } from '../../actors/ControlledEntity';

const VELOCITY_STOP_THRESHOLD = 1;

export abstract class Valet extends GameMode {

  private isDone: boolean;
  private hasShownAllScores: boolean;
  private isFiringNextRound: boolean;

  protected gameUI: Phaser.Group;
  private finalText: Phaser.Text;
  private carsText: Phaser.Text;
  protected carsLeft: number;
  protected scoreTexts: Phaser.Text[] = [];

  protected clearIntervalsOnShutdown = [];

  init() {
    super.init();

    this.gameUI = this.game.add.group();

    this.carsText = this.game.add.text(10, 10, 'Cars Left: 24', Helpers.defaultTextOptions());
    this.gameUI.add(this.carsText);

    GameState.allPlayers.forEach(playerId => {
      this.scoreTexts[playerId] = this.game.add.text(10, 50 * (playerId + 1), 'Score: $0', Helpers.defaultTextOptions());
      this.scoreTexts[playerId].visible = false;
      this.gameUI.add(this.scoreTexts[playerId]);
    });

    this.watchForKey('Confirm', {}, () => {
      if(!this.hasShownAllScores) return;
      GameState.popState();
    });
  }

  create() {
    super.create();
    this.game.world.bringToTop(this.gameUI);
    this.isDone = false;
    this.updateCarsText();
  }

  update() {
    super.update();

    const state = GameState.state;

    if(!state.playing || this.isDone || this.isFiringNextRound || !this.shouldNextRoundFire()) return;

    if(this.shouldBeDone()) {
      this.haltCurrentCars();
      this.done();
      return;
    }

    this.isFiringNextRound = true;

    // give a little break before the next set of cars
    setTimeout(() => {
      this.haltCurrentCars();

      const newCars: ControlledEntity[] = [];

      GameState.allPlayers.forEach(i => {
        const CarProto: any = this.chooseCar(i);
        const spawn = this.getSpawnPoint(i);

        const newCar = this.spawnCar(CarProto, spawn, i);
        newCars.push(newCar);
      });

      GameState.setPlayerCars(newCars);

      this.carsLeft -= newCars.length;
      this.updateCarsText();

      this.isFiringNextRound = false;

    }, _.random(500, 1300));

  }

  shutdown() {
    super.shutdown();

    this.carsText.destroy();
    if(this.finalText) this.finalText.destroy();

    this.scoreTexts.forEach(text => text.destroy());

    this.clearIntervalsOnShutdown.forEach(ivl => clearTimeout(ivl));
  }

  private haltCurrentCars() {
    GameState.state.playerCars.forEach(car => {
      car.halt();
      GameState.addHaltedCar(car);
    });
  }

  private updateCarsText() {
    this.carsText.setText(`Cars Left: ${this.carsLeft}`);
  }

  private chooseCar(player: number): ControlledEntity {
    let baseCars = [];
    switch(player) {
      case PlayerColor.RED:     { baseCars = [Cars.RedCar]; break; }
      case PlayerColor.BLUE:    { baseCars = [Cars.BlueCar]; break; }
      case PlayerColor.GREEN:   { baseCars = [Cars.GreenCar]; break; }
      case PlayerColor.YELLOW:  { baseCars = [Cars.OrangeCar]; break; }
    }

    const cars = baseCars.concat([
      Cars.RedStripeCar
    ]);

    const weights = [0.9, 0.1];

    return weighted.select(cars, weights);
  }

  private shouldNextRoundFire(): boolean {
    const state = GameState.state;
    if(state.playerCars.length === 0) return true;

    return !_.some(state.playerCars, car => {
      const [x, y] = car.body.velocity.destination.map(Math.abs);
      return x > VELOCITY_STOP_THRESHOLD
          || y > VELOCITY_STOP_THRESHOLD;
    });
  }

  private shouldBeDone(): boolean {
    return this.carsLeft <= 0;
  }

  protected done() {
    this.isDone = true;
  }

  protected canConfirm(): boolean {
    return super.canConfirm() || this.hasShownAllScores;
  }

  protected showFinishMessage(message: string) {
    this.hasShownAllScores = true;

    const opts = Helpers.defaultTextOptions();
    opts.fontSize = 40;

    this.finalText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 50, message, opts);
    this.finalText.anchor.set(0.5);
    this.gameUI.add(this.finalText);
  }

  protected updateScore(player: number, scoreMod: number) {
    let score = GameState.getPlayerScore(player);
    score += scoreMod;
    GameState.setPlayerScore(player, score);

    this.scoreTexts[player].setText(`Score: $${score}`);
    this.scoreTexts[player].visible = score > 0;
  };

}
