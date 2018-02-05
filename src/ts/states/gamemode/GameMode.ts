
import * as Phaser from 'phaser-ce';
import * as _ from 'lodash';

import { PausableMenu } from '../menu/PausableMenu';
import { GameState } from '../../global/gamestate';
import { ParkingSpace } from '../../actors/ParkingSpace';
import { ControlledEntity } from '../../actors/ControlledEntity';
import { KeyMapHandler } from '../../global/key';

const MAP_GIDS = {
  PARKING_SPACE_PLAIN: 17,
  DECOR_ARROW: 21
};

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

    this.groupParkingSpaces.children.forEach((space: Phaser.Sprite) => {
      this.game.physics.p2.enable(space);
      space.body.setRectangle(space.width, space.height);
      space.body.kinematic = true;
    });
  }

  private fixRotations(layer: Phaser.Group) {

    layer.children.forEach((space: Phaser.Sprite) => {

      if(space.body) {
        space.body.rotation = space.rotation;
      }

      // apparently phaser doesn't like rotations
      switch(Phaser.Math.radToDeg(space.rotation)) {

        case 0: {
          if(space.body) {
            space.body.x += 32;
            space.body.y += 32;
          }
          break;
        }

        case 90: {
          if(space.body) {
            space.body.x += 32;
            space.body.y += 96;
          } else {
            space.position.x += 64;
            space.position.y += 64;
          }
          break;
        }

        case -90: {
          if(space.body) {
            space.body.x -= 32;
            space.body.y += 32;
          } else {
            space.position.x -= 64;
            space.position.y += 64;
          }
          break;
        }

        case -180: {
          if(space.body) {
            space.body.x -= 32;
            space.body.y += 96;
          } else {
            space.position.y += 128;
          }
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

  protected checkParkingOverlaps() {

    // TODO each car gets 1 score, and each space gets 1 score. the car in the space the deepest scores that space

    const allScores = [];

    this.game.physics.p2.pause();

    this.groupParkingSpaces.children.forEach((space: Phaser.Sprite, idx) => {
      space.body.kinematic = false;
      space.body.static = false;

      allScores[idx] = [];

      space.body.onBeginContact.add((phaserp2body, p2body, shapeA, shapeB, contactEquations) => {
        if(phaserp2body.sprite instanceof ParkingSpace) return;

        const contactEq = contactEquations[0];
        const penetrationVec = contactEq.penetrationVec;

        p2.vec2.add(penetrationVec, contactEq.contactPointB, contactEq.bodyB.position);
        p2.vec2.sub(penetrationVec, penetrationVec, contactEq.bodyA.position);
        p2.vec2.sub(penetrationVec, penetrationVec, contactEq.contactPointA);

        const _score = {
          depth: p2.vec2.dot(contactEq.penetrationVec, contactEq.normalA),
          body: shapeB // TODO there should probably be something else passed here, like the car inst
        };

        allScores[idx].push(_score);

      });

    });

    // take one step to calculate contact
    this.game.physics.p2.world.step(this.game.physics.p2.frameRate);

    // 500ms should be enough to finish calculating score
    setTimeout(() => {
      finishContact();
    }, 500);

    const finishContact = () => {

      // TODO do all calculations

      this.groupParkingSpaces.children.forEach((space: Phaser.Sprite) => {
        space.body.kinematic = true;
      });

      this.game.physics.p2.resume();
    };

    /*
    // cars are the top level iterator because they can be in multiple spaces and we only want them to score once
    this.groupCars.children.forEach((car: Phaser.Sprite) => {

      const allOverlappingSpaces = [];

      this.groupParkingSpaces.children.forEach((space: Phaser.Sprite) => {
        if(!space.body.data.aabb.overlaps(car.body.data.aabb)) return;

        allOverlappingSpaces.push(space);
      });

      allOverlappingSpaces.forEach(space => {

      });
    });
    */
  }
}
