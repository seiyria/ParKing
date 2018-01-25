
export abstract class GameMode {
  public abstract loop(now: number, callback: () => void);
  public abstract debug(isDebug: boolean);
  public abstract unload();
}
