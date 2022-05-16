import { describe, it, expect, afterEach } from "vitest";
import GameModuleRegistry from "@/studio/core/GameModuleRegistry";
import MockCompiler from "./MockCompiler";
import GameObjectManager, {
  GameObjectDuplicatedError,
  GameObjectNotFoundError,
} from "@/studio/core/GameObjectManager";
import GameObject from "@/studio/core/runtime/GameObject";

const compiler = new MockCompiler();
const gameModuleRegistry = new GameModuleRegistry(compiler);

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

describe("GameObjectManagerTest", () => {
  let gameObjectManager = new GameObjectManager();

  afterEach(() => {
    gameObjectManager = new GameObjectManager();
  });

  it("Create GameObject Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject();

    expect(newGameObject).toBeDefined();
    expect(newGameObject.prototypeGameModule.length).toEqual(0);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Create GameObject multiple times", () => {
    for (let i = 0; i < 10; i++) {
      const newGameObject = gameObjectManager.CreateGameObject();

      expect(newGameObject).toBeDefined();
      expect(newGameObject.prototypeGameModule.length).toEqual(0);

      expect(gameObjectManager.gameObjects.length).toEqual(i + 1);
    }
  });

  it("Create Gameobject given id Test", () => {
    const expectId = "Given GameObject Id";

    const newGameObject = gameObjectManager.CreateGameObject(expectId);

    expect(newGameObject.id).toEqual(expectId);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Add GameObject test", () => {
    const newGameObject = new GameObject();

    const gameObject = gameObjectManager.AddGameObject(newGameObject);

    expect(gameObject).toEqual(newGameObject);

    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("Add GameObject Duplicate Test", () => {
    const newGameObject = new GameObject();

    gameObjectManager.AddGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    expect(() => gameObjectManager.AddGameObject(newGameObject)).toThrow(
      GameObjectDuplicatedError
    );
    expect(gameObjectManager.gameObjects.length).toEqual(1);
  });

  it("RemoveGameObject Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject();
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    gameObjectManager.RemoveGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("RemoveGameObject twice to same object", () => {
    const newGameObject = gameObjectManager.CreateGameObject();

    gameObjectManager.RemoveGameObject(newGameObject);
    expect(gameObjectManager.gameObjects.length).toEqual(0);

    expect(() => gameObjectManager.RemoveGameObject(newGameObject)).toThrow(
      GameObjectNotFoundError
    );
  });

  it("RemoveGameObject Not exists module", () => {
    gameObjectManager.CreateGameObject();

    const notExistsObject = new GameObject();

    expect(() => gameObjectManager.RemoveGameObject(notExistsObject)).toThrow(
      GameObjectNotFoundError
    );
  });

  it("RemoveGameObjectById Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject();
    expect(gameObjectManager.gameObjects.length).toEqual(1);

    gameObjectManager.RemoveGameObjectById(newGameObject.id);
    expect(gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("RemoveGameObjectById twice to same object", () => {
    const newGameObject = gameObjectManager.CreateGameObject();

    gameObjectManager.RemoveGameObjectById(newGameObject.id);
    expect(gameObjectManager.gameObjects.length).toEqual(0);

    expect(() =>
      gameObjectManager.RemoveGameObjectById(newGameObject.id)
    ).toThrow(GameObjectNotFoundError);
  });

  it("RemoveGameObjectById Not exists module", () => {
    gameObjectManager.CreateGameObject();

    const notExistsObject = new GameObject();

    expect(() =>
      gameObjectManager.RemoveGameObjectById(notExistsObject.id)
    ).toThrow(GameObjectNotFoundError);
  });

  it("GetGameObjectById Test", () => {
    const newGameObject = gameObjectManager.CreateGameObject();

    const findGameObject = gameObjectManager.GetGameObjectById(
      newGameObject.id
    );

    expect(newGameObject).toEqual(findGameObject);
  });

  it("GetGameObjectById Not exists test", () => {
    gameObjectManager.CreateGameObject();

    expect(() =>
      gameObjectManager.GetGameObjectById("Not exists game module id ")
    ).toThrow(GameObjectNotFoundError);
  });

  it("Query Types only single game object Test 1", () => {
    const newGameObject = gameObjectManager.CreateGameObject();

    newGameObject.AddPrototypeGameModule(counterModule);

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
    const newGameObject = gameObjectManager.CreateGameObject();

    newGameObject.AddPrototypeGameModule(counterModule);

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
    const gameObject1 = gameObjectManager.CreateGameObject();
    const gameObject2 = gameObjectManager.CreateGameObject();

    gameObject1.AddPrototypeGameModule(counterModule);
    gameObject1.AddPrototypeGameModule(countAModule);

    gameObject2.AddPrototypeGameModule(counterModule);
    gameObject2.AddPrototypeGameModule(countAModule);

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
    const newGameObject = gameObjectManager.CreateGameObject();

    newGameObject.AddPrototypeGameModule(counterModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [newGameObject]);

    expect(exposeList.length).toEqual(0);
  });

  it("Query Types ignore test 2", () => {
    const gameObject1 = gameObjectManager.CreateGameObject();
    const gameObject2 = gameObjectManager.CreateGameObject();

    gameObject1.AddPrototypeGameModule(counterModule);
    gameObject1.AddPrototypeGameModule(countAModule);

    gameObject2.AddPrototypeGameModule(counterModule);
    gameObject2.AddPrototypeGameModule(countAModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [gameObject2]);

    expect(exposeList.length).toEqual(1);
  });

  it("Query Types ignore test 3", () => {
    const gameObject1 = gameObjectManager.CreateGameObject();
    const gameObject2 = gameObjectManager.CreateGameObject();

    gameObject1.AddPrototypeGameModule(counterModule);
    gameObject1.AddPrototypeGameModule(countAModule);

    gameObject2.AddPrototypeGameModule(counterModule);
    gameObject2.AddPrototypeGameModule(countAModule);

    const exposeList = gameObjectManager.QueryExposeData(Number, [gameObject1, gameObject2]);

    expect(exposeList.length).toEqual(0);
  });

  // TODO
  // Get Value by query types when game started
  // Have to failed getting get value by query types when game does not started.
});
