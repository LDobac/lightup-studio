import { describe, it, expect, afterEach } from "vitest";

import SceneManager, {
  CannotStartScene,
  CurrentSceneNotExists,
  SceneDuplicated,
  SceneNameEmpty,
  SceneNotFoundError,
  SceneObject,
} from "@/studio/core/SceneManager";
import GameEngine from "@/studio/core/GameEngine";

const gameEngine = new GameEngine(null);

describe("SceneManager Test", () => {
  let sceneManager = new SceneManager(gameEngine);

  afterEach(() => {
    sceneManager = new SceneManager(gameEngine);
  });

  it("NewScene have to create new scene successfully", () => {
    const sceneName = "New Scene Name";
    const sceneObj = sceneManager.NewScene(sceneName);

    expect(sceneManager.scenes.length).toEqual(1);

    expect(sceneObj).toBeDefined();
    expect(sceneObj.name).toEqual(sceneName);
    expect(sceneObj.id).toBeDefined();

    expect(sceneObj.scene).toBeDefined();
    expect(sceneObj.scene).toBeTypeOf("object");

    expect(sceneObj.gameObjectManager).toBeDefined();
    expect(sceneObj.gameObjectManager).toBeTypeOf("object");
  });

  it("NewScene have to throw when name is empty", () => {
    expect(() => sceneManager.NewScene("")).toThrow(SceneNameEmpty);
  });

  it("NewScene have to throw when name is duplicated", () => {
    expect(() => sceneManager.NewScene("Duplicated")).not.toThrow(
      SceneDuplicated
    );
    expect(() => sceneManager.NewScene("Duplicated")).toThrow(
      SceneDuplicated
    );
  });

  it("RemoveSceneById Successfully", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    const scene2 = sceneManager.NewScene("Scene2");

    expect(() => sceneManager.RemoveSceneById(scene1.id)).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);

    expect(() => sceneManager.RemoveSceneById(scene2.id)).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(0);
  });

  it("RemoveSceneById have to throw when not exists id", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    expect(() => sceneManager.RemoveSceneById(scene1.id)).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);

    expect(() => sceneManager.RemoveSceneById("Not Exists Id")).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);
  });

  it("RemoveSceneByName Successfully", () => {
    sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    expect(() => sceneManager.RemoveSceneByName("Scene1")).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);

    expect(() => sceneManager.RemoveSceneByName("Scene2")).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(0);
  });

  it("RemoveSceneByName have to throw when not exists id", () => {
    sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    expect(() => sceneManager.RemoveSceneByName("Scene1")).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);

    expect(() => sceneManager.RemoveSceneByName("Not Exists Name")).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.scenes.length).toEqual(1);
  });

  it("StartSceneById have to throw when not exists id passed - 1", () => {
    expect(() => sceneManager.StartSceneById("not exists id")).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartSceneById have to throw when not exists id passed - 2", () => {
    const sceneObj = sceneManager.NewScene("Scene1");
    sceneManager.RemoveSceneById(sceneObj.id);

    expect(() => sceneManager.StartSceneById(sceneObj.id)).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartSceneById have to successfully", () => {
    const sceneObj = sceneManager.NewScene("Scene1");

    expect(sceneManager.currentScene).not.toBeDefined();

    expect(() => sceneManager.StartSceneById(sceneObj.id)).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).toBeDefined();
  });

  it("StartSceneByName have to throw when not exists id passed - 1", () => {
    expect(() => sceneManager.StartSceneByName("not exists name")).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartSceneByName have to throw when not exists id passed - 2", () => {
    const sceneObj = sceneManager.NewScene("Scene1");
    sceneManager.RemoveSceneById(sceneObj.id);

    expect(() => sceneManager.StartSceneByName("Scene1")).toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartSceneByName have to successfully", () => {
    sceneManager.NewScene("Scene1");

    expect(sceneManager.currentScene).not.toBeDefined();

    expect(() => sceneManager.StartSceneByName("Scene1")).not.toThrow(
      SceneNotFoundError
    );
    expect(sceneManager.currentScene).toBeDefined();
  });

  it("StartScene have to throw when no scenes", () => {
    expect(() => sceneManager.StartScene()).toThrow(CannotStartScene);
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartScene have to throw when no default scenes", () => {
    sceneManager.NewScene("Scene1");

    expect(() => sceneManager.StartScene()).toThrow(CannotStartScene);
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartScene have to success but no scene parameter", () => {
    const scene = sceneManager.NewScene("Scene1");
    sceneManager.defaultScene = scene;

    expect(() => sceneManager.StartScene()).not.toThrow();
    expect(sceneManager.currentScene).toBeDefined();
  });

  it("StartScene have to throw when pass scene parameter but not in scene manager", () => {
    const scene = sceneManager.NewScene("Scene1");
    sceneManager.RemoveSceneById(scene.id);

    expect(() => sceneManager.StartScene(scene)).toThrow();
    expect(sceneManager.currentScene).not.toBeDefined();
  });

  it("StartScene have to success when pass scene parameter", () => {
    const scene = sceneManager.NewScene("Scene1");

    expect(() => sceneManager.StartScene(scene)).not.toThrow();
    expect(sceneManager.currentScene).toBeDefined();
    expect(sceneManager.currentScene).toEqual(scene);
  });

  it("FinishCurrentScene have to throw when not started", () => {
    expect(() => sceneManager.FinishCurrentScene()).toThrow(
      CurrentSceneNotExists
    );
  });

  it("FinishCurrentScene have to success", () => {
    const scene = sceneManager.NewScene("Scene1");

    sceneManager.StartScene(scene);

    expect(() => sceneManager.FinishCurrentScene()).not.toThrow(
      CurrentSceneNotExists
    );
    expect(sceneManager.currentScene).toBeUndefined();
  });

  it("FinishCurrentScene have to throw call twice", () => {
    const scene = sceneManager.NewScene("Scene1");

    sceneManager.StartScene(scene);

    sceneManager.FinishCurrentScene();
    expect(sceneManager.currentScene).toBeUndefined();

    expect(() => sceneManager.FinishCurrentScene()).toThrow(
      CurrentSceneNotExists
    );
    expect(sceneManager.currentScene).toBeUndefined();
  });

  it("SwapById have to success", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    const scene2 = sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    sceneManager.SwapById(scene2.id);
    expect(sceneManager.currentScene).toEqual(scene2);
  });

  it("SwapById have to successfully swap itself", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    sceneManager.SwapById(scene1.id);
    expect(sceneManager.currentScene).toEqual(scene1);
  });

  it("SwapById have to throw not exists id", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    expect(() => sceneManager.SwapById("Not exists id")).toThrow(
      SceneNotFoundError
    );

    expect(sceneManager.currentScene).toEqual(scene1);
  });

  it("SwapByName have to success", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    const scene2 = sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    sceneManager.SwapByName("Scene2");
    expect(sceneManager.currentScene).toEqual(scene2);
  });

  it("SwapByName have to successfully swap itself", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    sceneManager.SwapByName("Scene1");
    expect(sceneManager.currentScene).toEqual(scene1);
  });

  it("SwapByName have to throw not exists id", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.NewScene("Scene2");

    sceneManager.StartScene(scene1);
    expect(sceneManager.currentScene).toEqual(scene1);

    expect(() => sceneManager.SwapByName("Not exists name")).toThrow(
      SceneNotFoundError
    );

    expect(sceneManager.currentScene).toEqual(scene1);
  });

  it("Set/Get Default Scene have to success", () => {
    const scene1 = sceneManager.NewScene("Scene1");

    expect(sceneManager.defaultScene).toBeUndefined();

    sceneManager.defaultScene = scene1;
    expect(sceneManager.defaultScene).toEqual(scene1);
  });

  it("Set defaultScene have to throw when scene not in sceneManager", () => {
    const scene1 = sceneManager.NewScene("Scene1");
    sceneManager.RemoveSceneById(scene1.id);

    expect(sceneManager.defaultScene).toBeUndefined();

    expect(() => (sceneManager.defaultScene = scene1)).toThrow(
      SceneNotFoundError
    );
  });

  it("Clear Test", () => {
    // Setup test environment
    const scene1 = sceneManager.NewScene("Scene1");
    const scene2 = sceneManager.NewScene("Scene2");

    scene1.gameObjectManager.CreateGameObject("a");

    scene2.gameObjectManager.CreateGameObject("b");
    scene2.gameObjectManager.CreateGameObject("c");

    sceneManager.defaultScene = scene2;

    expect(sceneManager.defaultScene).toEqual(scene2);
    expect(sceneManager.scenes.length).toEqual(2);

    expect(scene1.gameObjectManager.gameObjects.length).toEqual(1);
    expect(scene2.gameObjectManager.gameObjects.length).toEqual(2);

    // Do
    sceneManager.Clear();

    // Check
    expect(sceneManager.defaultScene).toBeUndefined();
    expect(sceneManager.scenes.length).toEqual(0);

    expect(scene1.gameObjectManager.gameObjects.length).toEqual(0);
    expect(scene2.gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("Add Scene successfully", () => {
    const newScene = new SceneObject("New Scene", gameEngine.babylonEngine);
    sceneManager.AddScene(newScene);

    expect(sceneManager.scenes[0]).toEqual(newScene);
  });

  it("Add Scene Failed cause name length too short", () => {
    const newScene = new SceneObject("", gameEngine.babylonEngine);
    expect(() => sceneManager.AddScene(newScene)).toThrow(SceneNameEmpty);
  });

  it("Add Scene Failed cause name duplicated", () => {
    sceneManager.NewScene("New Scene");

    const newScene = new SceneObject("New Scene", gameEngine.babylonEngine);

    expect(() => sceneManager.AddScene(newScene)).toThrow(SceneDuplicated);
  });
});

describe("SceneObject Test", () => {
  it("SceneObject create with default parameters", () => {
    const expectName = "TestName";

    const scene = new SceneObject(expectName, gameEngine.babylonEngine);

    expect(scene.name).toEqual(expectName);
    expect(scene.gameObjectManager.gameObjects.length).toEqual(0);
  });

  it("SceneObject create with id", () => {
    const expectName = "TestName";
    const expectId = "Thisisid";

    const scene = new SceneObject(
      expectName,
      gameEngine.babylonEngine,
      expectId
    );

    expect(scene.name).toEqual(expectName);
    expect(scene.id).toEqual(expectId);
    expect(scene.gameObjectManager.gameObjects.length).toEqual(0);
  });
});
