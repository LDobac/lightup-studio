import GameEngine, { GameEngineAlreadyRunning } from "@/studio/core/GameEngine";
import { describe, it, expect, afterEach } from "vitest";
import MockCompiler from "./MockCompiler";

const mockCompiler = new MockCompiler();

describe("GameEngine Test", () => {
  let gameEngine = new GameEngine(null, mockCompiler);

  afterEach(() => {
    gameEngine = new GameEngine(null, mockCompiler);
  });

  it("Start without any scene have to throw", () => {
    expect(() => gameEngine.Start()).toThrow();

    expect(gameEngine.sceneManager.currentScene).not.toBeDefined();
  });

  it("Start successfully", () => {
    const sceneObj = gameEngine.sceneManager.NewScene("New Scene");

    gameEngine.sceneManager.defaultScene = sceneObj;

    gameEngine.Start();
    expect(gameEngine.isRunning).toBeTruthy();
    expect(gameEngine.isEditing).toBeFalsy();

    expect(gameEngine.sceneManager.currentScene).toBeDefined();
  });

  it("Start have to failed when call twice", () => {
    const sceneObj = gameEngine.sceneManager.NewScene("New Scene");

    gameEngine.sceneManager.defaultScene = sceneObj;

    gameEngine.Start();

    expect(gameEngine.sceneManager.currentScene).toBeDefined();
    expect(() => gameEngine.Start()).toThrow(GameEngineAlreadyRunning);
  });

  it("Stop successfully", () => {
    const sceneObj = gameEngine.sceneManager.NewScene("New Scene");

    gameEngine.sceneManager.defaultScene = sceneObj;

    gameEngine.Start();
    expect(gameEngine.isRunning).toBeTruthy();
    expect(gameEngine.isEditing).toBeFalsy();

    gameEngine.Stop();
    expect(gameEngine.isRunning).toBeFalsy();
    expect(gameEngine.isEditing).toBeFalsy();

    expect(gameEngine.sceneManager.currentScene).toBeDefined();
  });

  it("Finlize successfully", () => {
    const sceneObj = gameEngine.sceneManager.NewScene("New Scene");

    gameEngine.sceneManager.defaultScene = sceneObj;

    gameEngine.Start();
    expect(gameEngine.isRunning).toBeTruthy();
    expect(gameEngine.isEditing).toBeFalsy();

    gameEngine.Finalize();
    expect(gameEngine.isRunning).toBeFalsy();
    expect(gameEngine.isEditing).toBeFalsy();

    expect(gameEngine.sceneManager.currentScene).not.toBeDefined();
  });

  it("Edit mode on successfully", () => {
    const scene1 = gameEngine.sceneManager.NewScene("Scene1");
    const scene2 = gameEngine.sceneManager.NewScene("Scene2");

    gameEngine.sceneManager.defaultScene = scene1;

    gameEngine.Start(scene2);
    expect(gameEngine.sceneManager.currentScene).toEqual(scene2);

    gameEngine.SetEditMode(true);
    expect(gameEngine.isEditing).toBeTruthy();

    expect(gameEngine.sceneManager.currentScene).toEqual(scene2);
  });

  it("Edit mode off successfully", () => {
    const scene1 = gameEngine.sceneManager.NewScene("Scene1");
    const scene2 = gameEngine.sceneManager.NewScene("Scene2");

    gameEngine.sceneManager.defaultScene = scene1;

    gameEngine.Start(scene2);
    expect(gameEngine.sceneManager.currentScene).toEqual(scene2);

    gameEngine.SetEditMode(true);
    expect(gameEngine.isEditing).toBeTruthy();

    expect(gameEngine.sceneManager.currentScene).toEqual(scene2);

    gameEngine.sceneManager.SwapById(scene1.id);
    expect(gameEngine.isEditing).toBeTruthy();
    expect(gameEngine.sceneManager.currentScene).toEqual(scene1);

    gameEngine.SetEditMode(false);
    expect(gameEngine.isEditing).toBeFalsy();

    expect(gameEngine.sceneManager.currentScene).toEqual(scene1);
  });
});
