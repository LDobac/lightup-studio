import type GameModuleRegistry from "./GameModuleRegistry";
import {
  GameModuleNameDuplicatedError,
  GameModuleNotFoundError,
} from "./GameModuleRegistry";
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

export class GameNotRunningError extends Error {
  constructor() {
    super("Game Doesn't Start!");
  }
}

export class FailedToResolveExposeData extends Error {
  constructor() {
    super("Failed to resolve expose data from game module!");
  }
}

export interface IGameModuleExposedData {
  gameModuleUid: string;
  metadata: IExposeMetadata;
}

export interface IGameObjectExposedData {
  gameObjectId: string;

  modules: Array<IGameModuleExposedData>;
}

export interface IExposedValue {
  gameObjectId: string;
  gameModuleUid: string;

  type: unknown;
  propertyKey: string;

  value: unknown;
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
  ): IGameObjectExposedData[] {
    const exposedValues: IGameObjectExposedData[] = [];

    for (const gameObject of this._gameObjects) {
      if (ignoreList.includes(gameObject)) {
        continue;
      }

      const exposeValue: IGameObjectExposedData = {
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

  public AcquireExposeData(metadata: IGameObjectExposedData): IExposedValue[] {
    if (!this.running) {
      throw new GameNotRunningError();
    }

    const result: Array<IExposedValue> = [];

    const gameObject = this.GetGameObjectById(metadata.gameObjectId);

    for (const module of metadata.modules) {
      gameObject.prototypeGameModule;

      const runtimeGMs = gameObject.runtimeGameModule.filter(
        (v) => v.uid === module.gameModuleUid
      );

      if (runtimeGMs.length < 1) {
        throw new GameModuleNotFoundError();
      } else if (runtimeGMs.length > 1) {
        throw new GameModuleNameDuplicatedError();
      }

      const runtimeGM = runtimeGMs[0];
      const exposeMetadata = module.metadata;

      for (const propertyKey of Object.keys(exposeMetadata)) {
        const value: unknown = Reflect.get(runtimeGM, propertyKey);

        if (value === undefined) {
          throw new FailedToResolveExposeData();
        }

        result.push({
          gameObjectId: metadata.gameObjectId,
          gameModuleUid: module.gameModuleUid,
          value: value,
          type: exposeMetadata[propertyKey].type,
          propertyKey: propertyKey,
        });
      }
    }

    return result;
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
