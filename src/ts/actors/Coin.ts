
import { Entity } from './Entity';

const determineKeyFrameForScoreValue = (value: number) => {
  switch(value) {
    case 1:     return 5;
    case 2:     return 6;
    case 5:     return 7;
    case 10:    return 8;
    case -20:   return 9;
    case 50:    return 10;
  }
}

export class Coin extends Entity {

  private baseY: number;

  constructor(game, x, y, score) {
    super(game, x, y, 'parking-objects', determineKeyFrameForScoreValue(score));
    this.baseY = this.y;
    this.anchor.set(0.5);
  }

  update() {
    const coinBob = (this.game.time.now / 25) % 28;

    if(coinBob < 14) {
      this.y = (this.baseY + coinBob / 2) + 1;
    } else {
      this.y = (this.baseY + 14 - (coinBob / 2)) + 1;
    }
  }

}