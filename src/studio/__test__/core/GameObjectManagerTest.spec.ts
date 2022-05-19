import { Engine } from "babylonjs";
import { describe, it, expect, afterEach } from "vitest";
import GameModuleRegistry, {
  GameModuleNotFoundError,
} from "@/studio/core/GameModuleRegistry";
import MockCompiler from "./MockCompiler";
import GameObjectManager, {
  FailedToResolveExposeData,
  GameNotRunningError,
  GameObjectDuplicatedError,
  GameObjectNotFoundError,
  KEY_INJECTION_META,
  type IInjectionMetadata,
} from "@/studio/core/GameObjectManager";
import GameObject from "@/studio/core/runtime/GameObject";
import type GameModule from "@/studio/core/runtime/GameModule";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";
import { SceneObject, type ISceneObject } from "@/studio/core/SceneManager";

const compiler = new MockCompiler();
const gameModuleRegistry = new GameModuleRegistry(compiler);

const dummyScene: ISceneObject = new SceneObject(
  "DummyScene",
  new Engine(null)
);

const counterModule = await gameModuleRegistry.RegisterBySource(
  "Counter",
  [
    "class counter extends Lib.GameModule {",
    "   @Lib.Expose()",
    "   public count : number = 0;",
    "   public Start() { this.count = 10; }",
    "   public Update(deltaTime : number) { this.Count(); }",
    "   @Lib.Expose()",
    "   public Count() : number {this.count++; return this.count;}",
    "}",
  ].join("\n")
);

const countAModule = await gameModuleRegistry.RegisterBySource(
  "CountA",
  [
    "class counta extends Lib.GameModule {",
    "   @Lib.Expose()",
    "   public a : string = '';",
    "   public Start() { this.a = 'start' }",
    "   public Update(deltaTime : number) { this.GetA() }",
    "   @Lib.Expose()",
    "   public GetA() : string {this.a += 'a'; return this.a;}",
    "}",
  ].join("\n")
);

const doublingModule = await gameModuleRegistry.RegisterBySource(
  "Doubling",
  [
    "class doubling extends Lib.GameModule {",
    "   @Lib.Expose()",
    "   public doublingNumber : number = 0;",
    "   public Start() { }",
    "   public Update(deltaTime : number) { }",
    "   @Lib.Expose()",
    "   public GetDouble() : number { return this.doublingNumber * 2; }",
    "}",
  ].join("\n")
);

describe("GameObjectManagerTest", () => {
  let gameObjectManager = new GameObjectManager(dummyScene);

  afterEach(() => {
    gameObjectManager = new GameObjectManager(dummyScene);
  });

  it("Create GameObject Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    expect(newGameObject).toBeDefined();
    expect(newGameObject.prototypeGameModule.length).toEqual(0);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Create GameObject multiple times", () => {
    for (let i = 0; i < 10; i++) {
      const newGameObject =
        gameObjectManager.CreateGameObject("Test GameObject");

      expect(newGameObject).toBeDefined();
      expect(newGameObject.prototypeGameModule.length).toEqual(0);

      expect(gameObjectManager.gameObjects.length).toEqual(i + 1);
    }
  });

  it("Create Gameobject given id Test", () => {
    const expectId = "Given GameObject Id";

    const newGameObject = gameObjectManager.CreateGameObject(
      "Test GameObject",
      expectId
    );

    expect(newGameObject.id).toEqual(expectId);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Add GameObject test", () => {
    const newGameObject = new GameObject(dummyScene, "GameObject Test Name");

    const gameObject = gameObjectManager.AddGameObject(newGameObject);

    expect(gameObject).toEqual(newGameObject);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Add GameObject Duplicate Test", () => {
    const newGameObject = new GameObject(dummyScene, "GameObject Test Name");

    gameObjectManager.AddGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    expect(() => gameObjectManager.AddGameObject(newGameObject)).toThrow(
      GameObjectDuplicatedError
    );
    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("RemoveGameObject Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    gameObjectManager.RemoveGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("RemoveGameObject twice to same object", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    gameObjectManager.RemoveGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(0);

    expect(() => gameObjectManager.RemoveGameObject(newGameObject)).toThrow(
      GameObjectNotFoundError
    );
  });

  it("RemoveGameObject Not exists module", () => {
    gameObjectManager.CreateGameObject("Test GameObject");

    const notExistsObject = new GameObject(dummyScene, "GameObject Test Name");

    expect(() => gameObjectManager.RemoveGameObject(notExistsObject)).toThrow(
      GameObjectNotFoundError
    );
  });

  it("RemoveGameObjectById Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    gameObjectManager.RemoveGameObjectById(newGameObject.id);
    expect(gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("RemoveGameObjectById twice to same object", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    gameObjectManager.RemoveGameObjectById(newGameObject.id);
    expect(gameObjectManager.gameObjects.length).toEqual(0);

    expect(() =>
      gameObjectManager.RemoveGameObjectById(newGameObject.id)
    ).toThrow(GameObjectNotFoundError);
  });

  it("RemoveGameObjectById Not exists module", () => {
    gameObjectManager.CreateGameObject("Test GameObject");

    const notExistsObject = new GameObject(dummyScene, "GameObject Test Name");

    expect(() =>
      gameObjectManager.RemoveGameObjectById(notExistsObject.id)
    ).toThrow(GameObjectNotFoundError);
  });

  it("GetGameObjectById Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    const findGameObject = gameObjectManager.GetGameObjectById(
      newGameObject.id
    );

    expect(newGameObject).toEqual(findGameObject);
  });

  it("GetGameObjectById Not exists test", () => {
    gameObjectManager.CreateGameObject("Test GameObject");

    expect(() =>
      gameObjectManager.GetGameObjectById("Not exists game module id ")
    ).toThrow(GameObjectNotFoundError);
  });

  it("Query Types only single game object Test 1", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    expect(exposeList.length).toEqual(1);

    const exposeMetadata = exposeList[0];
    expect(exposeMetadata.gameObjectId).toEqual(newGameObject.id);
    expect(exposeMetadata.modules.length).toEqual(1);

    expect(Object.keys(exposeMetadata.modules[0].metadata).length).toEqual(1);
    expect(Object.keys(exposeMetadata.modules[0].metadata)[0]).toEqual("count");

    expect(exposeMetadata.modules[0].metadata["count"].type).toEqual(Number);

    const addedPGM = newGameObject.prototypeGameModule.find(
      (v) => v.uid === exposeMetadata.modules[0].gameModuleUid
    );
    expect(addedPGM?.module).toEqual(counterModule);
  });

  it("Query Types only single game object Test 2", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Function);

    expect(exposeList.length).toEqual(1);

    const exposeMetadata = exposeList[0];
    expect(exposeMetadata.gameObjectId).toEqual(newGameObject.id);
    expect(exposeMetadata.modules.length).toEqual(1);

    expect(Object.keys(exposeMetadata.modules[0].metadata).length).toEqual(1);
    expect(Object.keys(exposeMetadata.modules[0].metadata)[0]).toEqual("Count");

    expect(exposeMetadata.modules[0].metadata["Count"].type).toEqual(Function);

    const addedPGM = newGameObject.prototypeGameModule.find(
      (v) => v.uid === exposeMetadata.modules[0].gameModuleUid
    );
    expect(addedPGM?.module).toEqual(counterModule);
  });

  it("Query types multiple object Test", () => {
    const gameObject1 = gameObjectManager.CreateGameObject("Test GameObject");
    const gameObject2 = gameObjectManager.CreateGameObject("Test GameObject");

    gameObject1.AddPrototypeGM(counterModule);
    gameObject1.AddPrototypeGM(countAModule);

    gameObject2.AddPrototypeGM(counterModule);
    gameObject2.AddPrototypeGM(countAModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    expect(exposeList.length).toEqual(2);

    for (const expose of exposeList) {
      for (const module of expose.modules) {
        expect(Object.keys(module.metadata).length).toEqual(1);

        for (const metadata of Object.values(module.metadata)) {
          expect(metadata.type).toEqual(Number);
        }
      }
    }
  });

  it("Query Types ignore test 1", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");

    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [
      newGameObject,
    ]);

    expect(exposeList.length).toEqual(0);
  });

  it("Query Types ignore test 2", () => {
    const gameObject1 = gameObjectManager.CreateGameObject("Test GameObject");
    const gameObject2 = gameObjectManager.CreateGameObject("Test GameObject");

    gameObject1.AddPrototypeGM(counterModule);
    gameObject1.AddPrototypeGM(countAModule);

    gameObject2.AddPrototypeGM(counterModule);
    gameObject2.AddPrototypeGM(countAModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [gameObject2]);

    expect(exposeList.length).toEqual(1);
  });

  it("Query Types ignore test 3", () => {
    const gameObject1 = gameObjectManager.CreateGameObject("Test GameObject");
    const gameObject2 = gameObjectManager.CreateGameObject("Test GameObject");

    gameObject1.AddPrototypeGM(counterModule);
    gameObject1.AddPrototypeGM(countAModule);

    gameObject2.AddPrototypeGM(counterModule);
    gameObject2.AddPrototypeGM(countAModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [
      gameObject1,
      gameObject2,
    ]);

    expect(exposeList.length).toEqual(0);
  });

  it("AcquireExposeData Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const exposeList = gameObjectManager.QueryExposeData(Function);

    const exposedValues = gameObjectManager.AcquireExposeValue(exposeList[0]);

    expect(exposedValues.length).toEqual(1);

    const exposeValue = exposedValues[0];

    expect(exposeValue.gameObjectId).toEqual(newGameObject.id);
    expect(() =>
      newGameObject.GetProtoGMByUid(exposeValue.gameModuleUid)
    ).not.toThrow(GameModuleNotFoundError);

    expect(exposeValue.propertyKey).toEqual("Count");
    expect(exposeValue.type).toEqual(Function);

    const gm = newGameObject.runtimeGameModule.find(
      (v) => v.uid === exposeValue.gameModuleUid
    );
    const CountFunc = (exposeValue.GetValue() as () => number).bind(gm);

    let result = CountFunc();
    expect(result).toEqual(11);

    result = CountFunc();
    expect(result).toEqual(12);
  });

  it("AcquireExposeData Test2", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);
    newGameObject.AddPrototypeGM(countAModule);

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const exposeList = gameObjectManager.QueryExposeData(Function);

    const exposedValues = gameObjectManager.AcquireExposeValue(exposeList[0]);
    expect(exposedValues.length).toEqual(2);
  });

  it("AcquireExposeData Failed test when game does not start", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Function);

    expect(() => gameObjectManager.AcquireExposeValue(exposeList[0])).toThrow(
      GameNotRunningError
    );
  });

  it("AcquireExposeData GetValue/SetValue Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const exposeValue = gameObjectManager.AcquireExposeValue(exposeList[0])[0];

    const GetCountVal = () => exposeValue.GetValue() as number;

    expect(GetCountVal()).toEqual(10);

    exposeValue.SetValue(123);
    expect(GetCountVal()).toEqual(123);
  });

  it("Get Scene test", () => {
    expect(gameObjectManager.scene).toEqual(dummyScene);
  });
});

describe("GameObjectManager Value Injection Test", () => {
  let gameObjectManager = new GameObjectManager(dummyScene);

  afterEach(() => {
    gameObjectManager = new GameObjectManager(dummyScene);
  });

  it("Value Injection Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const expose = exposeList[0];
    const countMeta = expose.modules[0];

    const expectNum = 998822;

    gameObjectManager.AddValueInjection(expectNum, {
      gameObjectId: expose.gameObjectId,
      gameModuleUid: countMeta.gameModuleUid,
      propertyKey: "count",
    });

    gameObjectManager.GameSetup(gameModuleRegistry);

    const exposeValue = gameObjectManager.AcquireExposeValue(expose)[0];

    const GetCountVal = () => exposeValue.GetValue() as number;

    expect(GetCountVal()).toEqual(expectNum);

    // Counter 모듈의 Start 함수는 count를 10으로 변경함
    gameObjectManager.GameStart();

    expect(GetCountVal()).toEqual(10);
  });

  it("Value Injection invalid game object id test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const AddInjectionFunc = () => {
      gameObjectManager.AddValueInjection(1, {
        gameObjectId: "invalid game object",
        gameModuleUid: "invalid game module",
        propertyKey: "count",
      });
    };

    expect(AddInjectionFunc).toThrow(GameObjectNotFoundError);
  });

  it("Value Injection invalid game module id test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const expose = exposeList[0];

    const AddInjectionFunc = () => {
      gameObjectManager.AddValueInjection(1, {
        gameObjectId: expose.gameObjectId,
        gameModuleUid: "invalid game module",
        propertyKey: "count",
      });
    };

    expect(AddInjectionFunc).toThrow(GameModuleNotFoundError);
  });

  it("Value Injection invalid metadata test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const expose = exposeList[0];
    const countMeta = expose.modules[0];

    const expectNum = 998822;

    gameObjectManager.AddValueInjection(expectNum, {
      gameObjectId: expose.gameObjectId,
      gameModuleUid: countMeta.gameModuleUid,
      propertyKey: "invalid_field",
    });

    expect(() => gameObjectManager.GameSetup(gameModuleRegistry)).toThrow(
      FailedToResolveExposeData
    );
  });

  it("Value Injection Remove Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject("Test GameObject");
    newGameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const expose = exposeList[0];
    const countMeta = expose.modules[0];

    const handler = gameObjectManager.AddValueInjection(1, {
      gameObjectId: expose.gameObjectId,
      gameModuleUid: countMeta.gameModuleUid,
      propertyKey: "count",
    });

    gameObjectManager.RemoveInjection(handler);

    gameObjectManager.GameSetup(gameModuleRegistry);

    const exposeValue = gameObjectManager.AcquireExposeValue(expose)[0];

    const GetCountVal = () => exposeValue.GetValue() as number;

    // Counter 모듈은 생성자에서 0으로 값을 초기화
    expect(GetCountVal()).toEqual(0);

    // Counter 모듈의 Start 함수는 count를 10으로 변경함
    gameObjectManager.GameStart();
    expect(GetCountVal()).toEqual(10);
  });
});

describe("GameObjectManager Dependency Injection Test", () => {
  const GetRuntimeGM = (
    gameObject: GameObject,
    gameModuleUid: string
  ): GameModule => {
    const rtGameModule = gameObject.runtimeGameModule.find(
      (v) => v.uid === gameModuleUid
    );

    if (!rtGameModule) {
      throw new GameModuleNotFoundError();
    }

    return rtGameModule;
  };

  const PrepareTwoObjAndGetNumberExpose = (
    module1: PrototypeGameModule,
    module2: PrototypeGameModule
  ) => {
    const gameObject1 = gameObjectManager.CreateGameObject("Test GameObject");
    const gameObject2 = gameObjectManager.CreateGameObject("Test GameObject");

    gameObject1.AddPrototypeGM(module1);
    gameObject2.AddPrototypeGM(module2);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const obj1Expose = exposeList.find(
      (v) => v.gameObjectId === gameObject1.id
    );
    const obj2Expose = exposeList.find(
      (v) => v.gameObjectId === gameObject2.id
    );

    if (!obj1Expose || !obj2Expose) throw "Cannot find Metadata.";

    return {
      gameObject1,
      gameObject2,
      obj1Expose,
      obj2Expose,
    };
  };

  let gameObjectManager = new GameObjectManager(dummyScene);

  afterEach(() => {
    gameObjectManager = new GameObjectManager(dummyScene);
  });

  it("Dependency Injection Test", () => {
    const { gameObject1, gameObject2, obj1Expose, obj2Expose } =
      PrepareTwoObjAndGetNumberExpose(counterModule, counterModule);

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1CounterModule = GetRuntimeGM(
      gameObject1,
      obj1Expose.modules[0].gameModuleUid
    );
    const obj2CounterModule = GetRuntimeGM(
      gameObject2,
      obj2Expose.modules[0].gameModuleUid
    );

    const obj1Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj1CounterModule
      ) as IInjectionMetadata
    ).proxyModule;
    const obj2Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj2CounterModule
      ) as IInjectionMetadata
    ).proxyModule;

    let obj1CountValue = Reflect.get(obj1Proxy, "count");
    let obj2CountValue = Reflect.get(obj2Proxy, "count");

    expect(obj1CountValue).toEqual(10);
    expect(obj2CountValue).toEqual(10);

    Reflect.set(obj1Proxy, "count", 100);

    obj1CountValue = Reflect.get(obj1Proxy, "count");
    obj2CountValue = Reflect.get(obj2Proxy, "count");

    expect(obj1CountValue).toEqual(100);
    expect(obj2CountValue).toEqual(100);
  });

  it("Dependency Injection Test with inner modules", () => {
    const gameObject = gameObjectManager.CreateGameObject("Test GameObject");

    gameObject.AddPrototypeGM(counterModule);
    gameObject.AddPrototypeGM(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number);

    const mod1Expose = exposeList[0].modules[0];
    const mod2Expose = exposeList[0].modules[1];

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: gameObject.id,
        gameModuleUid: mod1Expose.gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: gameObject.id,
        gameModuleUid: mod2Expose.gameModuleUid,
        propertyKey: "count",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1CounterModule = GetRuntimeGM(
      gameObject,
      mod1Expose.gameModuleUid
    );
    const obj2CounterModule = GetRuntimeGM(
      gameObject,
      mod2Expose.gameModuleUid
    );

    const obj1Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj1CounterModule
      ) as IInjectionMetadata
    ).proxyModule;
    const obj2Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj2CounterModule
      ) as IInjectionMetadata
    ).proxyModule;

    let obj1CountValue = Reflect.get(obj1Proxy, "count");
    let obj2CountValue = Reflect.get(obj2Proxy, "count");

    expect(obj1CountValue).toEqual(10);
    expect(obj2CountValue).toEqual(10);

    Reflect.set(obj1Proxy, "count", 100);

    obj1CountValue = Reflect.get(obj1Proxy, "count");
    obj2CountValue = Reflect.get(obj2Proxy, "count");

    expect(obj1CountValue).toEqual(100);
    expect(obj2CountValue).toEqual(100);
  });

  it("Dependency Injection Test With AcquireExposeValue Func", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1Count = gameObjectManager.AcquireExposeValue(obj1Expose)[0];
    const obj2Count = gameObjectManager.AcquireExposeValue(obj2Expose)[0];

    expect(obj1Count.GetValue()).toEqual(10);
    expect(obj2Count.GetValue()).toEqual(10);

    obj1Count.SetValue(100);
    expect(obj1Count.GetValue()).toEqual(100);
    expect(obj2Count.GetValue()).toEqual(100);

    obj2Count.SetValue(200);
    expect(obj1Count.GetValue()).toEqual(100);
    expect(obj2Count.GetValue()).toEqual(200);
  });

  it("Dependency Injection Test invalid source game object id test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    const AddInjectionFunc = () => {
      gameObjectManager.AddDependencyInjection(
        {
          gameObjectId: "invalid source id",
          gameModuleUid: obj1Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        },
        {
          gameObjectId: obj2Expose.gameObjectId,
          gameModuleUid: obj2Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        }
      );
    };

    expect(AddInjectionFunc).toThrow(GameObjectNotFoundError);
  });

  it("Dependency Injection Test invalid source game module uid test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    const AddInjectionFunc = () => {
      gameObjectManager.AddDependencyInjection(
        {
          gameObjectId: obj1Expose.gameObjectId,
          gameModuleUid: "invalid game module uid",
          propertyKey: "count",
        },
        {
          gameObjectId: obj2Expose.gameObjectId,
          gameModuleUid: obj2Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        }
      );
    };

    expect(AddInjectionFunc).toThrow(GameModuleNotFoundError);
  });

  it("Dependency Injection Test invalid source property test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "invalid_count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    expect(() => gameObjectManager.GameSetup(gameModuleRegistry)).toThrow(
      FailedToResolveExposeData
    );
  });

  it("Dependency Injection Test invalid target game object id test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    const AddInjectionFunc = () => {
      gameObjectManager.AddDependencyInjection(
        {
          gameObjectId: obj1Expose.gameObjectId,
          gameModuleUid: obj1Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        },
        {
          gameObjectId: "invalid source id",
          gameModuleUid: obj2Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        }
      );
    };

    expect(AddInjectionFunc).toThrow(GameObjectNotFoundError);
  });

  it("Dependency Injection Test invalid target game module uid test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    const AddInjectionFunc = () => {
      gameObjectManager.AddDependencyInjection(
        {
          gameObjectId: obj1Expose.gameObjectId,
          gameModuleUid: obj1Expose.modules[0].gameModuleUid,
          propertyKey: "count",
        },
        {
          gameObjectId: obj2Expose.gameObjectId,
          gameModuleUid: "invalid game module uid",
          propertyKey: "count",
        }
      );
    };

    expect(AddInjectionFunc).toThrow(GameModuleNotFoundError);
  });

  it("Dependency Injection Test invalid target property test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "invalid_count",
      }
    );

    expect(() => gameObjectManager.GameSetup(gameModuleRegistry)).toThrow(
      FailedToResolveExposeData
    );
  });

  it("Dependency Injection Remove Test", () => {
    const { gameObject1, gameObject2, obj1Expose, obj2Expose } =
      PrepareTwoObjAndGetNumberExpose(counterModule, counterModule);

    //             Send
    // obj1.count ------> obj2.count
    const handler = gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1CounterModule = GetRuntimeGM(
      gameObject1,
      obj1Expose.modules[0].gameModuleUid
    );
    const obj2CounterModule = GetRuntimeGM(
      gameObject2,
      obj2Expose.modules[0].gameModuleUid
    );

    const obj1Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj1CounterModule
      ) as IInjectionMetadata
    ).proxyModule;
    const obj2Proxy = (
      Reflect.getMetadata(
        KEY_INJECTION_META,
        obj2CounterModule
      ) as IInjectionMetadata
    ).proxyModule;

    expect(Reflect.get(obj1Proxy, "count")).toEqual(10);
    expect(Reflect.get(obj2Proxy, "count")).toEqual(10);

    Reflect.set(obj1Proxy, "count", 100);

    expect(Reflect.get(obj1Proxy, "count")).toEqual(100);
    expect(Reflect.get(obj2Proxy, "count")).toEqual(100);

    // Remove dependency injection
    gameObjectManager.RemoveInjection(handler);

    Reflect.set(obj1Proxy, "count", 500);

    expect(Reflect.get(obj1Proxy, "count")).toEqual(500);
    expect(Reflect.get(obj2Proxy, "count")).toEqual(100);
  });

  it("Dependency Injection chaning test", () => {
    const { obj1Expose, obj2Expose } = PrepareTwoObjAndGetNumberExpose(
      counterModule,
      counterModule
    );
    const { obj1Expose: obj3Expose, obj2Expose: obj4Expose } =
      PrepareTwoObjAndGetNumberExpose(counterModule, counterModule);

    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    // obj2.count ------> obj3.count
    const secToThirdhandle = gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj3Expose.gameObjectId,
        gameModuleUid: obj3Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    // obj3.count ------> obj4.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj3Expose.gameObjectId,
        gameModuleUid: obj3Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj4Expose.gameObjectId,
        gameModuleUid: obj4Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1Count = gameObjectManager.AcquireExposeValue(obj1Expose)[0];
    const obj2Count = gameObjectManager.AcquireExposeValue(obj2Expose)[0];
    const obj3Count = gameObjectManager.AcquireExposeValue(obj3Expose)[0];
    const obj4Count = gameObjectManager.AcquireExposeValue(obj4Expose)[0];

    expect(obj1Count.GetValue()).toEqual(10);
    expect(obj2Count.GetValue()).toEqual(10);
    expect(obj3Count.GetValue()).toEqual(10);
    expect(obj4Count.GetValue()).toEqual(10);

    obj1Count.SetValue(100);
    expect(obj1Count.GetValue()).toEqual(100);
    expect(obj2Count.GetValue()).toEqual(100);
    expect(obj3Count.GetValue()).toEqual(100);
    expect(obj4Count.GetValue()).toEqual(100);

    // Remove dependency obj2 -> obj3
    gameObjectManager.RemoveInjection(secToThirdhandle);

    obj1Count.SetValue(500);
    expect(obj1Count.GetValue()).toEqual(500);
    expect(obj2Count.GetValue()).toEqual(500);
    expect(obj3Count.GetValue()).toEqual(100);
    expect(obj4Count.GetValue()).toEqual(100);

    obj3Count.SetValue(250);
    expect(obj1Count.GetValue()).toEqual(500);
    expect(obj2Count.GetValue()).toEqual(500);
    expect(obj3Count.GetValue()).toEqual(250);
    expect(obj4Count.GetValue()).toEqual(250);
  });

  it("Dependency Injection in module action have to change injection value successfully test", () => {
    const { obj1Expose, gameObject2, obj2Expose } =
      PrepareTwoObjAndGetNumberExpose(counterModule, doublingModule);

    const exposeList = gameObjectManager.QueryExposeData(Function);
    const obj2FuncExpose = exposeList.find(
      (v) => v.gameObjectId === gameObject2.id
    );
    if (!obj2FuncExpose) throw "Unknown Testing Error";

    //             Send
    // obj1.count ------> obj2.count
    gameObjectManager.AddDependencyInjection(
      {
        gameObjectId: obj1Expose.gameObjectId,
        gameModuleUid: obj1Expose.modules[0].gameModuleUid,
        propertyKey: "count",
      },
      {
        gameObjectId: obj2Expose.gameObjectId,
        gameModuleUid: obj2Expose.modules[0].gameModuleUid,
        propertyKey: "doublingNumber",
      }
    );

    gameObjectManager.GameSetup(gameModuleRegistry);
    gameObjectManager.GameStart();

    const obj1Count = gameObjectManager.AcquireExposeValue(obj1Expose)[0];
    const obj2GetDoubledCountFunc =
      gameObjectManager.AcquireExposeValue(obj2FuncExpose)[0];

    const obj2GetDoubledCount = () => {
      const gameModule = gameObject2.runtimeGameModule.find(
        (gm) => gm.uid === obj2FuncExpose.modules[0].gameModuleUid
      );
      return (obj2GetDoubledCountFunc.GetValue() as () => number).bind(
        gameModule
      )();
    };

    expect(obj1Count.GetValue()).toEqual(10);
    expect(obj2GetDoubledCount()).toEqual(20);

    gameObjectManager.GameUpdate(-1);

    expect(obj1Count.GetValue()).toEqual(11);
    expect(obj2GetDoubledCount()).toEqual(22);

    obj1Count.SetValue(123);

    expect(obj1Count.GetValue()).toEqual(123);
    expect(obj2GetDoubledCount()).toEqual(246);
  });
});
