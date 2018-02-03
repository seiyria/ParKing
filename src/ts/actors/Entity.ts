
import * as _ from 'lodash';

export abstract class Entity extends Phaser.Sprite {

  private isDebug: boolean;

  public create(opts: any) {
    _.extend(this, opts);
    if(this.isDebug) this.toggleDebug(true);
  }

  public toggleDebug(isDebug: boolean) {
    this.isDebug = isDebug;

    if(this.body) this.body.debug = isDebug;
  }

}
