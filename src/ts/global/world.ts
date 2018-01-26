
import * as p2 from 'p2';
import * as Random from 'random-js';

import { ConfigManager } from './config';
import { isKeyDown, setKey, unsetKey } from './key';
import { GameState } from './gamestate';
import { MainMenu } from '../menus/MainMenu';
import { Bomb } from '../actors/Bomb';

const mt = Random.engines.mt19937();
mt.autoSeed();

export enum PlayerColor {
  RED = 0,
  BLUE = 1,
  GREEN = 2,
  YELLOW = 3
}

export class World {

  private static shakeFrames = 0;
  private static shakeStrength = 0;

  private static lastMenuTime = 0;

  private static _renderer;
  private static _manager;

  public static get renderer() {
    return World._renderer;
  }

  private static _stage;

  public static get stage(): PIXI.Container {
    return World._stage;
  }

  private static _container: PIXI.Container;

  public static get container() {
    return World._container;
  }

  private static _world: p2.World;

  public static get p2world() {
    return World._world;
  }

  public static init() {
    if(World._world) throw new Error('Cannot re-init World');

    World._world = new p2.World({
      gravity: [0, 0]
    });

    World._renderer = PIXI.autoDetectRenderer(ConfigManager.WIDTH, ConfigManager.HEIGHT);
    World._stage = new PIXI.Container();
    World._container = new PIXI.Container();

    World._manager = new PIXI.interaction.InteractionManager(World.renderer);
    World._manager.on('mousedown', (e) => {
      console.log(e);
      if(GameState.state.playing) {
        new Bomb({ x: e.data.originalEvent.offsetX, y: -e.data.originalEvent.offsetY });
      }
    });

    World._stage.addChild(World._container);

    World.registerWorldEvents();
    World.registerKeylistener();

    requestAnimationFrame(World.loop);
  }

  private static registerWorldEvents() {
    World.p2world.on('impact', ({ bodyA, bodyB, shapeA, shapeB }) => {

      if(bodyA.onCollision) {
        bodyA.onCollision(bodyB, shapeA);
      }

      if(bodyB.onCollision) {
        bodyB.onCollision(bodyA, shapeB);
      }

    }, World);
  }

  private static registerKeylistener() {
    setInterval(() => {
      World.handleInput();
    }, 75);

    window.addEventListener('keydown', evt => {
      setKey(evt.keyCode);
    });

    window.addEventListener('keyup', evt => {
      unsetKey(evt.keyCode);
    });
  }

  private static handleInput() {

    const state = GameState.state;

    if(isKeyDown('Escape')) {

      if(state.menus.length === 1 && !state.playing) return; // can't quit to main menu from main menu

      World.reset();

      // if there are no menus we need to add one back
      setTimeout(() => {
        if(state.menus.length > 0) return;
        const menu = new MainMenu();
        GameState.addMenu(menu);
        World.stage.addChild(menu);
      });
    }

    if(isKeyDown('Debug') && state.gameMode) {
      const isDebug = GameState.toggleDebug();
      state.gameMode.debug(isDebug);
      state.level.debug(isDebug);
    }

    if(state.playing && state.players.length > 0) {
      state.playerCars.forEach(car => car.onInput());
    }

    const curMenu = state.menus[state.menus.length - 1];
    if(curMenu) {
      const ret = curMenu.onInputChange() || {};
      const { playing } = ret;

      if(playing) {
        GameState.setPlaying(playing);
        const level = GameState.state.level;
        level.load();
      }

      if(state.menus.length === 0) {
        GameState.setPlaying(true);
      }
    }
  }

  public static reset() {
    if(World._container.parent) {
      World._stage.removeChild(World._container);
    }

    const state = GameState.state;
    if(state.level) state.level.unload();
    if(state.gameMode) state.gameMode.unload();

    GameState.setGameMode(null);
    GameState.setPlaying(false);

    World._container = new PIXI.Container();

    World._stage.addChild(World._container);

    World.resetPosition();
    World.resetScale();
  }

  public static resize(width: number) {
    ConfigManager.resize(width);
    World.renderer.resize(ConfigManager.WIDTH, ConfigManager.HEIGHT);
    World.resetScale();
  }

  public static resetPosition() {
    World._container.position.x = 0;
    World._container.position.y = 0;
  }

  public static resetScale() {
    World._container.scale.x = ConfigManager.ZOOM;
    World._container.scale.y = -ConfigManager.ZOOM;
  }

  public static screenShake(frames = 12, strength = 16) {
    World.shakeFrames = (frames / 4) * 3 + (frames / 4) * ConfigManager.options.screenShake;
    World.shakeStrength = strength;
  }

  public static shakeUpdate() {
    if(World.shakeFrames > 0) {
      const magnitude = (World.shakeFrames / World.shakeStrength) * World.shakeStrength * ConfigManager.options.screenShake;
      const x = Random.integer(-magnitude, magnitude)(mt);
      const y = Random.integer(-magnitude, magnitude)(mt);

      World.stage.position.x = x;
      World.stage.position.y = y;
      World.shakeFrames--;

    } else {
      World.stage.position.x = 0;
      World.stage.position.y = 0;
    }
  }

  public static loop(now?: number) {
    World.shakeUpdate();

    if(GameState.state.gameMode) {
      GameState.state.gameMode.loop(now, World.loop);
    } else {
      World.menuloop(now, World.loop);
    }
  }

  public static menuloop(now: number, callback: () => void) {
    const delta = now - World.lastMenuTime;
    World.lastMenuTime = now;

    const state = GameState.state;
    if(state.menus.length > 0) {
      state.menus[state.menus.length - 1].update(now, delta);
    }

    requestAnimationFrame(callback);

    World.rerender();
  }

  public static rerender() {
    World.renderer.render(World.stage);
  }

}

World.init();
