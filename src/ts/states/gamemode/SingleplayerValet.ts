
import { Valet } from './Valet';
import { ParkingSpace } from '../../actors/ParkingSpace';
import { GameState } from '../../global/gamestate';

export class SingleplayerValet extends Valet {
  protected possibleMaps = ['BasicSingleplayer'];

  init() {
    super.init();
  }

  create() {
    this.carsLeft = 24;
    super.create();
  }

  protected done() {
    super.done();

    setTimeout(() => {

      this.checkParkingOverlapsAndAssignScores();

      const scoredSpaces = this.groupParkingSpaces.children
        .filter((space: ParkingSpace) => space.scoreData.score !== 0);

      scoredSpaces.forEach((space: ParkingSpace, idx) => {

        setTimeout(() => {

          // TODO abstract determine frame + anchor + baseY + their own update function for bobbing to a Coin actor
          const score = space.scoreData.score;

          const moneySprite = this.game.add.sprite(
            space.centerX, space.centerY, 'parking-objects',
            this.determineKeyFrameForScoreValue(score)
          );

          (<any>moneySprite).baseY = moneySprite.y;
          moneySprite.anchor.set(0.5);

          this.groupCoins.add(moneySprite);

          this.updateScore(0, score);

          if(idx === scoredSpaces.length - 1) this.decideFinishMessage();

        }, idx * 1250);

      });

      if(scoredSpaces.length === 0) this.showFinishMessage('No points! Try again!')

    }, 2000);
  }

  private decideFinishMessage() {
    const score = GameState.getPlayerScore(0);

    let message = 'No points! Try harder!';

    if(score < 0)     message = 'Terrible!';
    if(score > 0)     message = 'Novice!';
    if(score > 20)    message = 'Nice try!';
    if(score > 50)    message = 'Good effort!';
    if(score > 100)   message = 'Nice parking!';
    if(score > 150)   message = 'Excellent job!';
    if(score > 200)   message = 'Basically perfect!';

    // TODO update high score

    this.showFinishMessage(message);
  }
}
