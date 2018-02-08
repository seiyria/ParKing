
import * as _ from 'lodash';
import * as weighted from 'weighted';

import { GameMode } from './GameMode';
import { Helpers } from '../../global/helpers';
import { GameState, PlayerColor } from '../../global/gamestate';

import * as Cars from '../../actors/AllCars';
import { ControlledEntity } from '../../actors/ControlledEntity';

const VELOCITY_STOP_THRESHOLD = 1;

export abstract class Valet extends GameMode {

  private gameUI: Phaser.Group;
  private carsText: Phaser.Text;
  private isDone: boolean;
  private isFiringNextRound: boolean;

  protected carsLeft: number;

  init() {
    super.init();

    this.gameUI = this.game.add.group();

    this.carsText = this.game.add.text(10, 10, 'Cars Left: 24', Helpers.defaultTextOptions());
    this.gameUI.add(this.carsText);
  }

  create() {
    super.create();
    this.game.world.bringToTop(this.gameUI);
    this.updateCarsText();
  }

  update() {
    super.update();

    const state = GameState.state;

    if(!state.playing || this.isDone) {
      return;
    }

    if(!this.isFiringNextRound && this.shouldNextRoundFire()) {

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

  }

  shutdown() {
    super.shutdown();

    this.carsText.destroy();
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

  private done() {
    this.isDone = true;

    setTimeout(() => {
      this.checkParkingOverlaps();
    }, 2000);
  }

}
