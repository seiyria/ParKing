
import * as _ from 'lodash';
import * as weighted from 'weighted';

import { GameMode } from './GameMode';
import { Helpers } from '../../global/helpers';
import { GameState, PlayerColor } from '../../global/gamestate';

import * as Cars from '../../actors/AllCars';
import { ControlledEntity } from '../../actors/ControlledEntity';

const VELOCITY_STOP_THRESHOLD = 1;

export class MultiplayerValet extends GameMode {

  protected possibleMaps = ['BasicArena'];

  private carsText: Phaser.Text;
  private isDone: boolean;
  private isFiringNextRound: boolean;
  private carsLeft: number;

  create() {
    super.create();

    // TODO make a variable for "game length" and make it scale to num of players (short = 2cpp, normal = 6cpp, long = 10cpp (cars per person)
    this.carsLeft = 8;
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
        this.done();
        return;
      }

      this.isFiringNextRound = true;

      // give a little break before the next set of cars
      setTimeout(() => {

        state.playerCars.forEach(car => {
          car.halt();
          GameState.addHaltedCar(car);
        });

        const newCars: ControlledEntity[] = [];

        for(let i = 0; i < state.players.length; i++) {
          const CarProto: any = this.chooseCar(i);
          const spawn = this.getSpawnPoint(i);

          const newCar = this.spawnCar(CarProto, spawn, i);
          newCars.push(newCar);
        }

        GameState.setPlayerCars(newCars);

        this.carsLeft -= newCars.length;
        this.updateCarsText();

        this.isFiringNextRound = false;

      }, _.random(500, 1300));

    }

  }

  private updateCarsText() {
    if(!this.carsText) {
      this.carsText = this.game.add.text(10, 10, 'Cars Left: 24', Helpers.defaultTextOptions());
    }

    this.carsText.text = `Cars Left: ${this.carsLeft}`;
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
    console.log('done');
  }

}
