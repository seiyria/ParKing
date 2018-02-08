
import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';

import { PausableMenu } from '../menu/PausableMenu';
import { GameState } from '../../global/gamestate';
import { ParkingSpace } from '../../actors/ParkingSpace';
import { ControlledEntity } from '../../actors/ControlledEntity';

const MAP_GIDS = {
  PARKING_SPACE_PLAIN: 17,
  DECOR_ARROW: 21
};

const GOOD_PARKING_ANGLE_DIFF = 10;

export abstract class GameMode extends PausableMenu {

  protected possibleMaps: string[] = [];
  protected chosenMapName: string;
  protected map: Phaser.Tilemap;

  protected groupParkingSpaces: Phaser.Group;
  protected groupDecoration: Phaser.Group;
  protected groupCars: Phaser.Group;

  private physicsCars: Phaser.Physics.P2.CollisionGroup;
  private physicsWalls: Phaser.Physics.P2.CollisionGroup;
  private physicsSpaces: Phaser.Physics.P2.CollisionGroup;

  private isDebug: boolean;

  private lastCarId = 0;

  public init(): void {
    super.init();

    this.watchForKey('Debug', {}, () => {
      const isDebug = GameState.toggleDebug();
      this.isDebug = isDebug;
      this.groupCars.children.forEach(car => (<ControlledEntity>car).toggleDebug(isDebug));
    });

    this.watchForKey('Pause', { player: this.menuControlPlayer }, (args) => {
      this.manuallyRepositionTitleAndPointer();

      if(this.gamePaused) {
        this.togglePause(this.menuControlPlayer);
        this.menuControlPlayer = undefined;

      } else {
        this.togglePause(args.player);
      }
    });
  }

  create() {
    GameState.resetGameForInit();
    super.create();
    this.loadMap();

    this.titleText.scale.set(this.map.widthInPixels / window.innerWidth, this.map.heightInPixels / window.innerHeight);
  }

  shutdown() {
    GameState.resetGame();

    this.groupParkingSpaces.destroy();
    this.groupDecoration.destroy();
    this.groupCars.destroy();
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

    this.map.setCollision([3], true, wallLayer);
    const allTiles = this.game.physics.p2.convertTilemap(this.map, wallLayer);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    this.createPhysicsGroups();

    this.createAllFromObjects();

    this.moveGroups();

    allTiles.forEach(tile => {
      tile.setCollisionGroup(this.physicsWalls);
      tile.collides(this.physicsCars);
    });
  }

  private createAllFromObjects() {
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

    this.map.createFromObjects(
      'Decoration',
      MAP_GIDS.DECOR_ARROW,
      'parking-objects',
      4,
      true,
      false,
      this.groupDecoration
    );

    this.fixParkingSpaces();

    this.fixRotations(this.groupParkingSpaces);
    this.fixRotations(this.groupDecoration);
  }

  private addGroups() {

    this.groupParkingSpaces = this.game.add.group();

    this.groupDecoration = this.game.add.group();

    this.groupCars = this.game.add.group();
    this.groupCars.enableBody = true;
    this.groupCars.physicsBodyType = Phaser.Physics.P2JS;
  }

  private moveGroups() {
    this.game.world.bringToTop(this.groupParkingSpaces);
    this.game.world.bringToTop(this.groupDecoration);
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
    this.physicsSpaces = this.game.physics.p2.createCollisionGroup();
  }

  private fixParkingSpaces() {
    const twoSpaces = _.sampleSize(this.groupParkingSpaces.children, 2);
    twoSpaces[0].frame = 1;
    twoSpaces[1].frame = 2;
  }

  private fixRotations(layer: Phaser.Group) {

    layer.children.forEach((space: Phaser.Sprite) => {

      space.anchor.set(0.5);

      // apparently phaser doesn't like rotations
      switch(Phaser.Math.radToDeg(space.rotation)) {

        case 0: {
          space.position.y += 32;
          space.position.x += 32;
          break;
        }

        case -180: {
          space.position.y += 96;
          space.position.x -= 32;
          break;
        }

        case 90: {
          space.position.x += 32;
          space.position.y += 96;
          break;
        }

        case -90: {
          space.position.x -= 32;
          space.position.y += 32;
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

    car.body.collides(this.physicsCars, () => car.handleCarCollision());
    car.body.collides(this.physicsWalls, () => car.handleWallCollision());
    car.body.collides([this.physicsSpaces]);

    car.create({ myPlayer: playerIdx, thrust: decidedVelX, isDebug: this.isDebug });
    car.gameid = this.lastCarId++;

    return car;
  }

  protected getSpawnPoint(idx: number) {
    let spawn = null;
    const numPlayers = GameState.allPlayers.length;
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

  protected checkParkingOverlaps() {

    this.groupParkingSpaces.children.forEach((space: ParkingSpace) => {

      const spaceCenter = [space.centerX, space.centerY];

      this.groupCars.children.forEach((car: ControlledEntity) => {

        const carCenter = [car.centerX, car.centerY];

        const dist = Phaser.Math.distance(spaceCenter[0], spaceCenter[1], carCenter[0], carCenter[1]);

        // too far away to park well
        if(dist > 32) return;

        // normalize the angles to be either 90 or 0
        let spaceAngle = Math.abs(space.angle) % 180;
        let carAngle = Math.abs(car.angle) % 180;

        if(spaceAngle > 90) spaceAngle -= 180;
        if(carAngle > 90)   carAngle -= 180;

        // if your car isn't parked within 10 degrees of the parking space, then you suck at parking
        if(carAngle - GOOD_PARKING_ANGLE_DIFF > spaceAngle || carAngle + GOOD_PARKING_ANGLE_DIFF < spaceAngle) return;

        let score = 10;
        if(dist > 10)       score = 5;
        else if(dist > 20)  score = 2;
        else if(dist > 25)  score = 1;

        console.log(score, car.player);

      });
    });

  }
}
