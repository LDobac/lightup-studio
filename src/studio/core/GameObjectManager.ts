import type GameModuleRegistry from "./GameModuleRegistry";
import type { IExposeMetadata } from "./runtime/ExposeDecorator";
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

export interface IExposedValue {
  gameObjectId: string;

  modules: Array<{
    gameModuleUid: string;
    metadata: IExposeMetadata;
  }>;
}

export default class GameObjectManager {
  // NOTE : 최적화를 위해서 gameObjects 변수를 Key:Value 컨테이너로 교체?
  private _gameObjects: Array<GameObject>;

  private running: boolean;

  public constructor() {
    this._gameObjects = [];

    this.running = false;
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

  public QueryExposeData(
    type: unknown,
    ignoreList: GameObject[] = []
  ): IExposedValue[] {
    const exposedValues: IExposedValue[] = [];

    for (const gameObject of this._gameObjects) {
      if (ignoreList.includes(gameObject)) {
        continue;
      }

      const exposeValue: IExposedValue = {
        gameObjectId: gameObject.id,
        modules: [],
      };

      // NOTE : 최적화 필요시 별도의 metadata 값 생성 수 type으로 해시 테이블?
      for (const gameModule of gameObject.prototypeGameModule) {
        const exposeMetadata: IExposeMetadata = {};

        const metadata = gameModule.module.exposeMetadata;

        for (const propertyName of Object.keys(metadata)) {
          if (
            metadata[propertyName].type === type ||
            (metadata[propertyName].type as object).toString().toLowerCase() ===
              (type as object).toString().toLowerCase()
          ) {
            exposeMetadata[propertyName] = metadata[propertyName];
          }
        }

        if (Object.keys(exposeMetadata).length > 0) {
          exposeValue.modules.push({
            gameModuleUid: gameModule.uid,
            metadata: exposeMetadata,
          });
        }
      }

      if (exposeValue.modules.length > 0) {
        exposedValues.push(exposeValue);
      }
    }

    return exposedValues;
  }

  public GameSetup(gameModuleRegistry: GameModuleRegistry) {
    this._gameObjects.forEach((go) => {
      go.Setup(gameModuleRegistry);
    });
  }

  public GameStart() {
    this.running = true;

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
    this.running = false;

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
