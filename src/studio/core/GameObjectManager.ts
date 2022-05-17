import { v4 as uuid } from "uuid";
import "reflect-metadata";
import type GameModuleRegistry from "./GameModuleRegistry";
import {
  GameModuleNameDuplicatedError,
  GameModuleNotFoundError,
} from "./GameModuleRegistry";
import type { IExposeMetadata } from "./runtime/ExposeDecorator";
import GameObject from "./runtime/GameObject";
import type GameModule from "./runtime/GameModule";

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

  GetValue: () => unknown;
  SetValue: (val: unknown) => void;
}

export interface IInjectionInfo {
  gameObjectId: string;
  gameModuleUid: string;

  propertyKey: string;
}

export type InjectionDisposeHandle = string;

export const KEY_INJECTION_META = "KEY_EXPOSE_INJECTION_META";

export interface IInjectionMetadata {
  proxyModule: object;
  handlers: Record<
    // PropertyKey
    string | symbol,
    Array<{
      handle: InjectionDisposeHandle;
      callback: (v: unknown) => void;
    }>
  >;
}

export default class GameObjectManager {
  // NOTE : 최적화를 위해서 gameObjects 변수를 Key:Value 컨테이너로 교체?
  private _gameObjects: Array<GameObject>;

  private valueInjections: Record<
    InjectionDisposeHandle,
    {
      target: IInjectionInfo;
      value: unknown;
    }
  >;

  private dependencyInjections: Record<
    InjectionDisposeHandle,
    {
      target: IInjectionInfo;
      source: IInjectionInfo;
    }
  >;

  // private runtimeDI

  private running: boolean;

  public constructor() {
    this._gameObjects = [];

    this.valueInjections = {};
    this.dependencyInjections = {};

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

  public AcquireExposeValue(metadata: IGameObjectExposedData): IExposedValue[] {
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

        const proxyModule = this.GetInjectionMetadata(
          metadata.gameObjectId,
          module.gameModuleUid
        ).proxyModule;

        result.push({
          gameObjectId: metadata.gameObjectId,
          gameModuleUid: module.gameModuleUid,
          GetValue: () => Reflect.get(proxyModule, propertyKey),
          SetValue: (val: unknown) =>
            Reflect.set(proxyModule, propertyKey, val),
          type: exposeMetadata[propertyKey].type,
          propertyKey: propertyKey,
        });
      }
    }

    return result;
  }

  public AddValueInjection(
    value: unknown,
    target: IInjectionInfo
  ): InjectionDisposeHandle {
    const handle = uuid();

    // Validation of game object/game module exists
    const targetObject = this.GetGameObjectById(target.gameObjectId);
    targetObject.GetProtoGMByUid(target.gameModuleUid);

    this.valueInjections[handle] = {
      value: value,
      target: target,
    };

    return handle;
  }

  public AddDependencyInjection(
    source: IInjectionInfo,
    target: IInjectionInfo
  ): InjectionDisposeHandle {
    const handle = uuid();

    // Validation of game object/game module exists
    const sourceObject = this.GetGameObjectById(source.gameObjectId);
    sourceObject.GetProtoGMByUid(source.gameModuleUid);

    const targetObject = this.GetGameObjectById(target.gameObjectId);
    targetObject.GetProtoGMByUid(target.gameModuleUid);

    this.dependencyInjections[handle] = {
      source: source,
      target: target,
    };

    return handle;
  }

  public RemoveInjection(handle: InjectionDisposeHandle) {
    if (Reflect.has(this.valueInjections, handle)) {
      delete this.valueInjections[handle];
    } else if (Reflect.has(this.dependencyInjections, handle)) {
      const injection = this.dependencyInjections[handle];

      const gameObjId = injection.source.gameObjectId;
      const gameModuleId = injection.source.gameModuleUid;
      const propertyKey = injection.source.propertyKey;

      const injectionMeta = this.GetInjectionMetadata(gameObjId, gameModuleId);

      const index = injectionMeta.handlers[propertyKey].findIndex(
        (v) => v.handle === handle
      );
      if (index > -1) {
        injectionMeta.handlers[propertyKey].splice(index, 1);
      }

      delete this.dependencyInjections[handle];
    }
  }

  private ClearValueInjection() {
    Object.keys(this.valueInjections).forEach((handle) => {
      this.RemoveInjection(handle);
    });
  }

  private ClearDependencyInjection() {
    Object.keys(this.dependencyInjections).forEach((handle) => {
      this.RemoveInjection(handle);
    });
  }

  public GameSetup(gameModuleRegistry: GameModuleRegistry) {
    this.running = true;

    this._gameObjects.forEach((go) => {
      go.Setup(gameModuleRegistry);
    });

    this.SetupDependencyInjection();
    this.SetupValueInjection();
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
    this.running = false;

    this._gameObjects.forEach((go) => {
      go.Finish();
    });
  }

  public get gameObjects(): Array<GameObject> {
    return this._gameObjects;
  }

  private SetupValueInjection() {
    for (const handle in this.valueInjections) {
      const injection = this.valueInjections[handle];

      const target = injection.target;
      const value = injection.value;

      const injectionMetadata = this.GetInjectionMetadata(
        target.gameObjectId,
        target.gameModuleUid
      );

      if (!Reflect.has(injectionMetadata.proxyModule, target.propertyKey)) {
        throw new FailedToResolveExposeData();
      }

      Reflect.set(injectionMetadata.proxyModule, target.propertyKey, value);
    }
  }

  private SetupDependencyInjection() {
    for (const handle in this.dependencyInjections) {
      const injection = this.dependencyInjections[handle];

      const source = injection.source;
      const target = injection.target;

      const sourceDIMetadata = this.GetInjectionMetadata(
        source.gameObjectId,
        source.gameModuleUid
      );
      const targetDIMetadata = this.GetInjectionMetadata(
        target.gameObjectId,
        target.gameModuleUid
      );

      if (!sourceDIMetadata.handlers[source.propertyKey]) {
        sourceDIMetadata.handlers[source.propertyKey] = [];
      }

      // Register Observer handler
      const valueChangedHandler = (v: unknown) => {
        Reflect.set(targetDIMetadata.proxyModule, target.propertyKey, v);
      };

      sourceDIMetadata.handlers[source.propertyKey].push({
        handle: handle,
        callback: valueChangedHandler,
      });

      // Initailize value
      if (!Reflect.has(sourceDIMetadata.proxyModule, source.propertyKey)) {
        throw new FailedToResolveExposeData();
      }

      if (!Reflect.has(targetDIMetadata.proxyModule, target.propertyKey)) {
        throw new FailedToResolveExposeData();
      }

      const initValue = Reflect.get(
        sourceDIMetadata.proxyModule,
        source.propertyKey
      );
      Reflect.set(targetDIMetadata.proxyModule, target.propertyKey, initValue);
    }
  }

  private IsDuplicated(gameObject: GameObject): boolean {
    for (const go of this._gameObjects) {
      if (go.id === gameObject.id) {
        return true;
      }
    }

    return false;
  }

  private GetInjectionMetadata(
    gameObjectId: string,
    gameModuleUid: string
  ): IInjectionMetadata {
    const CreateInjectionMetadata = (gameModule: GameModule) => {
      const proxyModule = new Proxy(gameModule, {
        set: (target: GameModule, prop: string | symbol, value: unknown) => {
          Reflect.set(target, prop, value);

          const injectionMeta = Reflect.getMetadata(
            KEY_INJECTION_META,
            target
          ) as IInjectionMetadata;

          if (injectionMeta.handlers[prop]) {
            injectionMeta.handlers[prop].forEach((handler) => {
              handler.callback(value);
            });
          }

          return true;
        },
      });

      const metadata: IInjectionMetadata = {
        proxyModule: proxyModule,
        handlers: {},
      };

      Reflect.defineMetadata(KEY_INJECTION_META, metadata, gameModule);
    };

    const GetRuntimeGM = (
      gameObjectId: string,
      gameModuleUid: string
    ): GameModule => {
      const gameObject = this.GetGameObjectById(gameObjectId);

      const rtGameModule = gameObject.runtimeGameModule.find(
        (v) => v.uid === gameModuleUid
      );

      if (!rtGameModule) {
        throw new GameModuleNotFoundError();
      }

      return rtGameModule;
    };

    const gameModule = GetRuntimeGM(gameObjectId, gameModuleUid);

    if (!Reflect.hasMetadata(KEY_INJECTION_META, gameModule)) {
      CreateInjectionMetadata(gameModule);
    }

    return Reflect.getMetadata(KEY_INJECTION_META, gameModule);
  }
}
