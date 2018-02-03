
import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';

import { PausableMenu } from '../menu/PausableMenu';
import { GameState } from '../../global/gamestate';
import { ParkingSpace } from '../../actors/ParkingSpace';
import { ControlledEntity } from '../../actors/ControlledEntity';
import { KeyMapHandler } from '../../global/key';

const MAP_GIDS = {
  PARKING_SPACE_PLAIN: 17
};

export abstract class GameMode extends PausableMenu {

  protected possibleMaps: string[] = [];
  protected chosenMapName: string;
  protected map: Phaser.Tilemap;

  private groupParkingSpaces: Phaser.Group;
  private groupCars: Phaser.Group;

  private physicsCars: Phaser.Physics.P2.CollisionGroup;
  private physicsWalls: Phaser.Physics.P2.CollisionGroup;

  private isDebug: boolean;

  init() {
    GameState.resetPlayerScores();
  }

  create() {
    super.create();
    this.loadMap();
  }

  update() {
    super.update();

    if(KeyMapHandler.isDown('Debug')) {
      const isDebug = GameState.toggleDebug();
      this.isDebug = isDebug;
      this.groupCars.children.forEach(car => (<ControlledEntity>car).toggleDebug(isDebug));
    }

    if(this.gamePaused) {
      if(KeyMapHandler.isDown('Pause', this.menuControlPlayer)) {
        this.togglePause(this.menuControlPlayer);
        this.menuControlPlayer = null;
      }

    } else {
      for(let i = 0; i < GameState.state.players.length; i++) {
        if(!KeyMapHandler.isDown('Pause', i)) continue;
        this.togglePause(i);
      }
    }
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

    this.moveGroups();

    this.map.setCollision([3], true, wallLayer);
    const allTiles = this.game.physics.p2.convertTilemap(this.map, wallLayer);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    this.createPhysicsGroups();
    allTiles.forEach(tile => {
      tile.setCollisionGroup(this.physicsWalls);
      tile.collides(this.physicsCars);
    });
  }

  private addGroups() {

    this.groupParkingSpaces = this.game.add.group();

    this.groupCars = this.game.add.group();
    this.groupCars.enableBody = true;
    this.groupCars.physicsBodyType = Phaser.Physics.P2JS;
  }

  private moveGroups() {
    this.game.world.bringToTop(this.groupParkingSpaces);
    this.game.world.bringToTop(this.groupCars);
  }

  private startPhysics() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.physics.p2.setImpactEvents(true);
    this.game.physics.p2.restitution = 0.8;
  }

  private createPhysicsGroups() {
    this.physicsCars = this.game.physics.p2.createCollisionGroup();
    this.physicsWalls = this.game.physics.p2.createCollisionGroup();
  }

  private fixParkingSpaces() {
    const twoSpaces = _.sampleSize(this.groupParkingSpaces.children, 2);
    twoSpaces[0].frame = 1;
    twoSpaces[1].frame = 2;

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

  protected spawnCar(CarProto, { x, y, minVelX, maxVelX, rotate }, playerIdx: number) {

    const xMod = rotate < 0 ? -32 : 32;
    const car: ControlledEntity = new CarProto(this.game, x - xMod, y - 32);

    const decidedVelX = _.random(minVelX, maxVelX) * _.sample([80, 70, 60]);

    this.game.add.existing(car);
    this.groupCars.add(car);

    car.scale.set(1, 0.8);

    this.game.physics.p2.enable(car);
    car.body.setRectangle(car.width, car.height);
    car.body.velocity.x = rotate < 0 ? -decidedVelX : decidedVelX;
    car.body.angle = rotate;

    car.body.setCollisionGroup(this.physicsCars);
    car.body.collides(this.physicsCars, () => {
      car.handleCarCollision();
    });

    car.body.collides(this.physicsWalls, () => {
      car.handleWallCollision();
    });

    car.create({ myPlayer: playerIdx, thrust: decidedVelX, isDebug: this.isDebug });

    return car;
  }

  protected getSpawnPoint(idx: number) {
    let spawn = null;
    const numPlayers = GameState.state.players.length;
    const carSpawns = (<any>this.map.objects).CarSpawns;

    // 1 player can spawn anywhere
    if(numPlayers === 1) spawn = _.sample(carSpawns);

    // 2 players will get sides
    if(numPlayers === 2) {
      spawn = _.sample(_.filter(carSpawns, (spawn) => Math.floor(spawn.properties.player / 2) === idx));
    }

    // more than 2 players means they spawn in their set spots
    if(numPlayers > 2) spawn = _.sample(_.filter(carSpawns, ['properties.player', idx]));

    if(!spawn) throw new Error(`No spawn on map ${this.chosenMapName} for player ${idx}.`);

    return {
      x: spawn.x,
      y: spawn.y,
      minVelX: spawn.properties.minVelX,
      maxVelX: spawn.properties.maxVelX,
      rotate: spawn.properties.rotate
    };
  }
}
