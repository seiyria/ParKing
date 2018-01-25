
import * as _ from 'lodash';
import * as weighted from 'weighted';
import * as p2 from 'p2';

import { GameMode } from './gamemode';
import { Helpers } from '../global/helpers';
import { PlayerColor, World } from '../global/world';
import { GameState } from '../global/gamestate';

import * as Cars from '../actors/AllCars';
import { ControlledEntity } from '../actors/ControlledEntity';

export class MultiplayerValet extends GameMode {

  private carsText: PIXI.Text;
  private isDone: boolean;
  private isFiringNextRound: boolean;

  constructor(private carsLeft: number) {
    super();

    GameState.resetPlayerScores();
    this.updateCarsText();
  }

  private updateCarsText() {
    if(!this.carsText) {
      this.carsText = new PIXI.Text('Cars Left: 24', Helpers.defaultTextOptions());
      this.carsText.x = 10;
      this.carsText.y = 10;
      World.stage.addChild(this.carsText);
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
      return p2.vec2.length(_.get(car, 'body.velocity', 0)) > 0.1;
    });
  }

  private shouldBeDone(): boolean {
    return this.carsLeft <= 0;
  }

  loop(now: number, callback: () => void) {
    const state = GameState.state;

    if(!state.playing || this.isDone) {
      requestAnimationFrame(callback);
      World.rerender();
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
          const spawn = state.level.getSpawnPoint(i);
          const newCar = new CarProto(spawn);
          newCars.push(newCar);
        }

        GameState.setPlayerCars(newCars);

        this.carsLeft -= newCars.length;
        this.updateCarsText();

        this.isFiringNextRound = false;

      }, _.random(300, 900));

    }

    state.playerCars.forEach(car => {
      car.update();
    });

    requestAnimationFrame(callback);
    World.p2world.step(1 / 60);
    World.rerender();
  }

  private done() {
    this.isDone = true;
    console.log('done');
  }

  unload() {
    World.stage.removeChild(this.carsText);
  }

  debug(isDebug: boolean) {
    const state = GameState.state;
    state.playerCars.forEach(player => player.debug(isDebug));
    state.cars.forEach(car => car.debug(isDebug));

  }
}
