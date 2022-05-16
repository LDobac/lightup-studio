import type GameModuleRegistry from "./GameModuleRegistry";
import GameObject from "./runtime/GameObject";

export class GameObjectNotFoundError extends Error {
  constructor() {
    super("GameObject Not Found!");
  }
}

export class GameObjectDuplicatedError extends Error {
  constructor() {
    super("GameObject already added!");
  }
}

export default class GameObjectManager {
  // NOTE : 최적화를 위해서 gameObjects 변수를 Key:Value 컨테이너로 교체?
  private _gameObjects: Array<GameObject>;

  public constructor() {
    this._gameObjects = [];
  }

  public CreateGameObject(id = ""): GameObject {
    const newGameObject = new GameObject(id);

    this._gameObjects.push(newGameObject);

    return newGameObject;
  }

  public AddGameObject(gameObject: GameObject): GameObject {
    if (this.IsDuplicated(gameObject)) {
      throw new GameObjectDuplicatedError();
    }

    this._gameObjects.push(gameObject);

    return gameObject;
  }

  public RemoveGameObject(gameObject: GameObject): void {
    this.RemoveGameObjectById(gameObject.id);
  }

  public RemoveGameObjectById(gameObjectId: string): void {
    const index = this._gameObjects.findIndex((go) => go.id === gameObjectId);

    if (index < 0) {
      throw new GameObjectNotFoundError();
    }

    this._gameObjects.splice(index, 1);
  }

  public GetGameObjectById(gameObjectId: string): GameObject {
    const go = this._gameObjects.find((go) => go.id === gameObjectId);

    if (!go) {
      throw new GameObjectNotFoundError();
    }

    return go;
  }

  public Clear() {
    this._gameObjects = [];
  }

  public QueryExposeData(type: string) {
    throw "Not Implement.";
  }

  public GameSetup(gameModuleRegistry: GameModuleRegistry) {
    this._gameObjects.forEach((go) => {
      go.Setup(gameModuleRegistry);
    });
  }

  public GameStart() {
    this._gameObjects.forEach((go) => {
      go.Start();
    });
  }

  public GameUpdate(deltaTime: number) {
    this._gameObjects.forEach((go) => {
      go.Update(deltaTime);
    });
  }

  public GameFinish() {
    this._gameObjects.forEach((go) => {
      go.Finish();
    });
  }

  public get gameObjects(): Array<GameObject> {
    return this._gameObjects;
  }

  private IsDuplicated(gameObject: GameObject): boolean {
    for (const go of this._gameObjects) {
      if (go.id === gameObject.id) {
        return true;
      }
    }

    return false;
  }
}
