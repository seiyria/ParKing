
export class ResourceManager {
  private static rootPath = '../../assets';

  private static resources: any;

  private static carSprites = [
    'blue',
    'green',
    'orange',
    'red',
    'red-stripe'
  ];

  private static truckSprites = [
    'orange',
    'orange-rekt'
  ];

  private static objectSprites = [
    'car',
    'car-wheel',
    'parking-outline'
  ];

  private static uiSprites = [
    'default',
    'menu-arrow',
    'preload_bar',
    'preload_frame'
  ];

  private static levels = [
    'test'
  ];

  public static get allResources() {
    return ResourceManager.resources;
  }

  public static getResource(resource: string) {
    if(!ResourceManager.resources[resource]) throw new Error(`Resource ${resource} does not exist.`);

    return ResourceManager.resources[resource].texture;
  }

  /*
  static init() {
    ResourceManager.carSprites.forEach(    sprite => ResourceManager.defaultLoader.add(`car-${sprite}`,
      `${ResourceManager.rootPath}/game/vehicles/car-${sprite}.png`));
    ResourceManager.truckSprites.forEach(  sprite => ResourceManager.defaultLoader.add(`truck-${sprite}`,
      `${ResourceManager.rootPath}/game/vehicles/truck-${sprite}.png`));
    ResourceManager.objectSprites.forEach( sprite => ResourceManager.defaultLoader.add(sprite,
      `${ResourceManager.rootPath}/game/objects/${sprite}.png`));
    ResourceManager.uiSprites.forEach(     sprite => ResourceManager.defaultLoader.add(sprite,
      `${ResourceManager.rootPath}/ui/${sprite}.png`));
    ResourceManager.levels.forEach(        sprite => ResourceManager.defaultLoader.add(`level-${sprite}`,
      `${ResourceManager.rootPath}/levels/${sprite}.png`));

    ResourceManager.load();
  }
  */

  static get UISprites() {
    return ResourceManager.uiSprites.map(sprite => ({ name: sprite, path: `${ResourceManager.rootPath}/ui/${sprite}.png` }));
  }

}