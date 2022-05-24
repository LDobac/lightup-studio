import { describe, it, expect } from "vitest";
import Prototype from "@/studio/core/Prototype";
import MockCompiler from "../Mock/MockCompiler";

import duplicatedModuleNamePrototypeFile from "../Mock/MockPrototype_duplicated_module_name.json?raw";
import duplicatedModuleIdPrototypeFile from "../Mock/MockPrototype_duplicated_module_id.json?raw";
import duplicatedSceneIdPrototypeFile from "../Mock/MockPrototype_duplicated_scene_id.json?raw";
import duplicatedSceneNamePrototypeFile from "../Mock/MockPrototype_duplicated_scene_name.json?raw";
import duplicatedGameObjectIdPrototypeFile from "../Mock/MockPrototype_duplicated_gameobject_id.json?raw";
import incorrectGameModuleIdPrototypeFile from "../Mock/MockPrototype_gamemodule_not_found.json?raw";
import incorrectDefaultSceneIdPrototypeFile from "../Mock/MockPrototype_incorrect_default_scene_id.json?raw";

import {
  GameModuleIdDuplicatedError,
  GameModuleNameDuplicatedError,
  GameModuleNotFoundError,
} from "@/studio/core/GameModuleRegistry";
import { GameObjectDuplicatedError } from "@/studio/core/GameObjectManager";
import {
  SceneDuplicated,
  SceneNotFoundError,
} from "@/studio/core/SceneManager";

describe("Prototype Test", () => {
  const compiler = new MockCompiler();

  it("Serialize Test", () => {
    const prototype = new Prototype(null, compiler);

    const serialized = prototype.Serialize();

    expect(serialized).toBeTypeOf("string");
    expect(serialized.length).toBeGreaterThan(0);

    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveProperty("sceneManager");
    expect(deserialized).toHaveProperty("gameModuleRegistry");
  });

  it("Serialize Test with test scene", async () => {
    const prototype = new Prototype(null, compiler);

    await prototype.GenerateTestScene();

    const serialized = prototype.Serialize();

    expect(serialized).toBeTypeOf("string");
    expect(serialized.length).toBeGreaterThan(0);

    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveProperty("sceneManager");
    expect(deserialized).toHaveProperty("gameModuleRegistry");

    expect(deserialized["sceneManager"].defaultSceneId).not.toBeNull();
    expect(deserialized["sceneManager"].scenes.length).toBeGreaterThan(0);

    const gameObjectManager =
      deserialized["sceneManager"].scenes[0].gameObjectManager;
    expect(gameObjectManager.gameObjects.length).toBeGreaterThan(0);
  });

  it("Deseriailze Test", () => {
    const prototype = new Prototype(null, compiler);

    const serialized = prototype.Serialize();

    const deserializedPrototype = prototype.Deserialize(serialized);

    expect(deserializedPrototype.id.length).toEqual(0);
    expect(deserializedPrototype.name.length).toEqual(0);
    expect(deserializedPrototype.gameModuleRegistry.modules.length).toEqual(0);
    expect(deserializedPrototype.sceneManager.defaultSceneId).toBeNull();
    expect(deserializedPrototype.sceneManager.scenes.length).toEqual(0);
  });

  it("Deserialize with test scene", async () => {
    const prototype = new Prototype(null, compiler);

    await prototype.GenerateTestScene();

    const serialized = prototype.Serialize();
    const deserializedPrototype = prototype.Deserialize(serialized);

    expect(deserializedPrototype.id.length).not.toEqual(0);
    expect(deserializedPrototype.name.length).toEqual(0);
    expect(deserializedPrototype.gameModuleRegistry.modules.length).toEqual(1);
    expect(deserializedPrototype.sceneManager.defaultSceneId).not.toBeNull();
    expect(deserializedPrototype.sceneManager.scenes.length).toEqual(1);
  });

  it("Save Test", async () => {
    const prototype = new Prototype(null, compiler);

    await prototype.GenerateTestScene();

    const serialized = prototype.Serialize();

    const savedPrototype = prototype.Save();

    expect(savedPrototype.content).toEqual(serialized);
  });

  it("Load Test", async () => {
    const prototype = new Prototype(null, compiler);

    await prototype.GenerateTestScene();
    const serialized = prototype.Serialize();

    const newProto = new Prototype(null, compiler);
    await newProto.Load({ name: "", content: serialized });

    expect(prototype.id).toEqual(newProto.id);
    expect(prototype.name).toEqual(newProto.name);

    const curSceneManager = prototype.sceneManager;
    const newSceneManager = newProto.sceneManager;

    const curDefaultScene = curSceneManager.defaultScene;
    const newDefaultScene = newSceneManager.defaultScene;
    if (curDefaultScene) {
      expect(newDefaultScene).toBeDefined();

      expect(curDefaultScene.id).toEqual(newDefaultScene?.id);
      expect(curDefaultScene.name).toEqual(newDefaultScene?.name);
    } else {
      expect(curDefaultScene).toEqual(newDefaultScene);
    }

    const curScenes = curSceneManager.scenes;
    const newScenes = newSceneManager.scenes;

    expect(curScenes.length).toEqual(newScenes.length);

    curScenes.forEach((curScene) => {
      const findedScene = newScenes.find((s) => s.id === curScene.id);

      expect(findedScene).toBeDefined();
      expect(findedScene?.name).toEqual(curScene.name);

      const curObjects = curScene.gameObjectManager.gameObjects;
      const newObjects = findedScene?.gameObjectManager.gameObjects;

      curObjects.forEach((curObject) => {
        const findedObject = newObjects?.find((o) => o.id === curObject.id);

        expect(findedObject).toBeDefined();
        expect(findedObject?.name).toEqual(curObject.name);

        const curModules = curObject.prototypeGameModule;
        const newModules = findedObject?.prototypeGameModule;

        curModules.forEach((curModule) => {
          const findedModule = newModules?.find((m) => m.uid === curModule.uid);

          expect(findedModule).toBeDefined();
          expect(findedModule?.module.id).toEqual(curModule.module.id);
        });
      });
    });
  });

  it("Load failed cause duplicated prototype module name", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: duplicatedModuleNamePrototypeFile,
      });

    await expect(Load).rejects.toThrow(GameModuleNameDuplicatedError);
  });

  it("Load failed cause deuplicated prototype module id", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: duplicatedModuleIdPrototypeFile,
      });

    await expect(Load).rejects.toThrow(GameModuleIdDuplicatedError);
  });

  it("Load failed cause duplicated scene id", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: duplicatedSceneIdPrototypeFile,
      });

    await expect(Load).rejects.toThrow(SceneDuplicated);
  });

  it("Load failed cause duplicated scene name", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: duplicatedSceneNamePrototypeFile,
      });

    await expect(Load).rejects.toThrow(SceneDuplicated);
  });

  it("Load failed cause duplicated gameobject id", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: duplicatedGameObjectIdPrototypeFile,
      });

    await expect(Load).rejects.toThrow(GameObjectDuplicatedError);
  });

  it("Load failed cause game module not found", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: incorrectGameModuleIdPrototypeFile,
      });

    await expect(Load).rejects.toThrow(GameModuleNotFoundError);
  });

  it("Load failed cause default scene id incorrect", async () => {
    const newProto = new Prototype(null, compiler);
    const Load = async () =>
      await newProto.Load({
        name: "",
        content: incorrectDefaultSceneIdPrototypeFile,
      });

    await expect(Load).rejects.toThrow(SceneNotFoundError);
  });
});
