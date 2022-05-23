import { describe, it, expect } from "vitest";
import Prototype from "@/studio/core/Prototype";
import MockCompiler from "./MockCompiler";

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
});
