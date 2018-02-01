
import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';

import { GameState } from '../../global/gamestate';
import { ParkingSpace } from '../../actors/ParkingSpace';
import { ControlledEntity } from '../../actors/ControlledEntity';
import { KeyMapHandler } from '../../global/key';

const MAP_GIDS = {
  PARKING_SPACE_PLAIN: 17
};

export abstract class GameMode extends Phaser.State {

  protected possibleMaps: string[] = [];
  protected chosenMapName: string;
  protected map: Phaser.Tilemap;

  private groupParkingSpaces: Phaser.Group;
  private groupCars: Phaser.Group;

  private physicsCars: Phaser.Physics.P2.CollisionGroup;

  private isDebug: boolean;

  init() {
    GameState.resetPlayerScores();
  }

  preload() {
    this.game.stage.backgroundColor = '#333';
  }

  update() {
    if(KeyMapHandler.isDown('Debug')) {
      const isDebug = GameState.toggleDebug();
      this.isDebug = isDebug;
      this.groupCars.children.forEach(car => (<ControlledEntity>car).toggleDebug(isDebug));
    }
  }

  create() {
    this.loadMap();
  }

  shutdown() {
    GameState.resetGame();
  }

  private loadMap() {
    this.chosenMapName = _.sample(this.possibleMaps);
    if(!this.chosenMapName) throw new Error('No map was selected for this game mode');

    this.addGroups();
    this.startPhysics();

    this.map = this.game.add.tilemap(this.chosenMapName, 64, 64);
    this.map.addTilesetImage('Tiles', 'parking-map');
    this.map.addTilesetImage('Objects', 'parking-objects');

    this.game.world.scale.set(window.innerWidth / this.map.widthInPixels, window.innerHeight / this.map.heightInPixels);

    const baseLayer = this.map.createLayer('Floor');
    baseLayer.resizeWorld();

    const wallLayer = this.map.createLayer('Walls');

    this.map.createFromObjects(
      'Parking',
      MAP_GIDS.PARKING_SPACE_PLAIN,
      'parking-objects',
      0,
      true,
      false,
      this.groupParkingSpaces,
      ParkingSpace
    );

    this.fixParkingSpaces();

    this.game.world.bringToTop(this.groupParkingSpaces);
    this.game.world.bringToTop(this.groupCars);

    this.map.setCollision([3], true, wallLayer);
    this.game.physics.p2.convertTilemap(this.map, wallLayer);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    this.createPhysicsGroups();
  }

  private addGroups() {

    this.groupParkingSpaces = this.game.add.group();

    this.groupCars = this.game.add.group();
    this.groupCars.enableBody = true;
    this.groupCars.physicsBodyType = Phaser.Physics.P2JS;
  }

  private startPhysics() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.p2.setImpactEvents(true);
    (<any>this.game.physics.p2).defaultRestitution = 0.8;
  }

  private createPhysicsGroups() {
    this.physicsCars = this.game.physics.p2.createCollisionGroup();
  }

  private fixParkingSpaces() {
    this.groupParkingSpaces.children.forEach(space => {

      // apparently phaser doesn't like rotations
      switch(Phaser.Math.radToDeg(space.rotation)) {
        case 90: {
          space.position.x += 64;
          space.position.y += 64;
          break;
        }

        case -90: {
          space.position.x -= 64;
          space.position.y += 64;
          break;
        }

        case -180: {
          space.position.y += 128;
          break;
        }
      }
    });
  }

  protected spawnCar(CarProto, { x, y, minVelX, maxVelX }, playerIdx: number) {
    const car: ControlledEntity = new CarProto(this.game, x - 32, y - 32);

    const decidedVelX = _.random(minVelX, maxVelX) * 30;

    this.game.add.existing(car);
    this.groupCars.add(car);

    car.scale.set(1, 0.8);

    this.game.physics.p2.enable(car);
    car.body.setRectangle(car.width, car.height);
    car.body.setCollisionGroup(this.physicsCars);
    car.body.collides([this.physicsCars]);
    car.body.velocity.x = decidedVelX;
    car.body.angle = decidedVelX > 0 ? 90 : -90;

    // if we're traveling horizontally we move the car up by it's width (rotated) over half
    if(Math.abs(decidedVelX) > 0) {
      car.y -= car.width / 2;
    }

    car.create({ myPlayer: playerIdx, isDebug: this.isDebug });

    return car;
  }

  protected getSpawnPoint(idx: number) {
    const spawn = _.sample(_.filter((<any>this.map.objects).CarSpawns, ['properties.player', idx]));
    if(!spawn) throw new Error(`No spawn on map ${this.chosenMapName} for player ${idx}.`);

    return {
      x: spawn.x,
      y: spawn.y,
      minVelX: spawn.properties.minVelX,
      maxVelX: spawn.properties.maxVelX
    };
  }
}
