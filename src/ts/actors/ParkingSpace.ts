
import { Entity } from './Entity';
import { ConfigManager } from '../global/config';
import { ResourceManager } from '../global/resources';

export class ParkingSpace extends Entity {

  public gameid: number;
  public scoreData: { player: number, score: number } = { player: -1, score: 0 };

  public get isHandicap(): boolean {
    return this.frame === 1;
  }

  public get isVIP(): boolean {
    return this.frame === 2;
  }

}
