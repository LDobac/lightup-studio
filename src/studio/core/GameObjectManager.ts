import { v4 as uuid } from "uuid";
import "reflect-metadata";
import {
  GameModuleNameDuplicatedError,
  GameModuleNotFoundError,
} from "./GameModuleRegistry";
import type { IExposeMetadata } from "./runtime/ExposeDecorator";
import GameObject from "./runtime/GameObject";
import type GameModule from "./runtime/GameModule";
import type { ISceneObject } from "./SceneManager";
import type IGameFlow from "./IGameFlow";

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
export const KEY_PROXY_GAMEMODULE_META = "KEY_PROXY_GAMEMODULE_META";

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

export default class GameObjectManager implements IGameFlow {
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

  private running: boolean;

  private _scene: ISceneObject;

  public constructor(scene: ISceneObject) {
    this._gameObjects = [];

    this.valueInjections = {};
    this.dependencyInjections = {};

    this.running = false;

    this._scene = scene;
  }

  public CreateGameObject(name: string, id = ""): GameObject {
    const newGameObject = new GameObject(this._scene, name, id);

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

  public Setup() {
    this.running = true;

    this._gameObjects.forEach((go) => {
      go.Setup();
    });

    this.SetupDependencyInjection();
    this.SetupValueInjection();
  }

  public Start() {
    this._gameObjects.forEach((go) => {
      go.Start();
    });
  }

  public Update(deltaTime: number) {
    this._gameObjects.forEach((go) => {
      go.Update(deltaTime);
    });
  }

  public Finish() {
    this.running = false;

    this._gameObjects.forEach((go) => {
      go.Finish();
    });
  }

  public get gameObjects(): Array<GameObject> {
    return this._gameObjects;
  }

  public get scene(): ISceneObject {
    return this._scene;
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
    const gameObject = this.GetGameObjectById(gameObjectId);

    const gameModuleIdx = gameObject.runtimeGameModule.findIndex(
      (v) => v.uid === gameModuleUid
    );

    if (gameModuleIdx < 0) {
      throw new GameModuleNotFoundError();
    }

    let gameModule = gameObject.runtimeGameModule[gameModuleIdx];

    if (!Reflect.hasMetadata(KEY_INJECTION_META, gameModule)) {
      // Create Injection Metadata and replace game module in game object.

      // TODO : 추후 개선 시 Dependency Injection 추가 시 Proxy를 생성하는 것이 아닌, 애초에 Proxy 객체를 생성하여서 처리하도록 변경
      // 현재 문제점은 game module을 가져와서 hold한 후 조작 시 이후에 만약 해당 game module이 proxy 객체가 되면 hold 된 객체를
      //  수정해도 변화가 발생하지 않음
      //  따라서 무조건 GetInjectionMetadata.proxyModule로 가져오는게 가장 안전함
      //  위 방법으로 계속 가져오면 혼란도 있고 불편함도 있으니 수정 필요
      //  또한 replace 과정을 거쳐주지 않으면 게임 모듈 내부에서 this로 함수 호출하여 값 변경 시 Proxy set 함수가 호출되지 않음

      // NOTE : Proxy로 생성된 객체의 경우 dangling이 되면 자동으로 가비지 컬렉팅 되는지 확인 필요
      // 만약 되지 않는다면 recovable Proxy 객체로 변경 필요
      // 해당 부분 수정하려면 위 TODO를 먼저 수행해야 함

      const proxyModule = new Proxy(gameModule, {
        set: (target: GameModule, prop: string | symbol, value: unknown) => {
          Reflect.set(target, prop, value);

          const injectionMeta = Reflect.getMetadata(
            KEY_INJECTION_META,
            // "target" is original game module, so it does not have
            // metadata for dependency injectcion
            // use proxyModule cause I set Injection Metadata to proxyModule only.
            proxyModule
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

      // Set metadata proxy to original game module
      Reflect.defineMetadata(
        KEY_PROXY_GAMEMODULE_META,
        proxyModule,
        gameModule
      );

      // Set metadata proxy and handler to proxy game module
      Reflect.defineMetadata(KEY_INJECTION_META, metadata, proxyModule);

      // Replace Game Module to Proxy Game Module
      gameObject.runtimeGameModule[gameModuleIdx] = proxyModule;

      gameModule = proxyModule;
    }

    return Reflect.getMetadata(KEY_INJECTION_META, gameModule);
  }
}
