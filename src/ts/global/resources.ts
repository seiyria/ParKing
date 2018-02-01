
export class ResourceManager {
  private static rootPath = '../../assets';

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
    'car-wheel'
  ];

  private static uiSprites = [
    'default',
    'menu-arrow',
    'preload-bar',
    'preload-frame'
  ];

  private static gameSpriteSheets = [
    'parking-map',
    'parking-objects'
  ];

  static get UISprites() {
    return ResourceManager.uiSprites.map(sprite => ({
      name: sprite,
      path: `${ResourceManager.rootPath}/ui/${sprite}.png`
    }));
  }

  static get InGameSpriteSheets() {
    return ResourceManager.gameSpriteSheets.map(sprite => ({
      name: sprite,
      path: `${ResourceManager.rootPath}/game/${sprite}.png`
    }));
  }

  static get ObjectSprites() {
    return ResourceManager.objectSprites.map(sprite => ({
      name: sprite,
      path: `${ResourceManager.rootPath}/game/objects/${sprite}.png`
    }));
  }

  static get VehicleSprites() {
    const carSprites = ResourceManager.carSprites.map(sprite => ({
      name: `car-${sprite}`,
      path: `${ResourceManager.rootPath}/game/vehicles/car-${sprite}.png`
    }));

    const truckSprites = ResourceManager.truckSprites.map(sprite => ({
      name: `truck-${sprite}`,
      path: `${ResourceManager.rootPath}/game/vehicles/truck-${sprite}.png`
    }));

    return carSprites.concat(truckSprites);
  }

}
