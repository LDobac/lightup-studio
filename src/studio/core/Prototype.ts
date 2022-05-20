import {
  FreeCamera,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Vector3,
} from "babylonjs";
import type { Nullable } from "babylonjs";
import type { CompileMachine } from "./CompileMachine";
import GameEngine from "./GameEngine";
import GameModuleRegistry from "./GameModuleRegistry";
import type SceneManager from "./SceneManager";

export default class Prototype {
  private _gameModuleRegistry: GameModuleRegistry;
  private _gameEngine: GameEngine;

  constructor(
    canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>,
    compiler: CompileMachine
  ) {
    this._gameModuleRegistry = new GameModuleRegistry(compiler);

    this._gameEngine = new GameEngine(canvasOrContext);

    // tmp code
    {
      const sceneManager = this._gameEngine.sceneManager;

      const scene = sceneManager.NewScene("New Scene");
      sceneManager.defaultScene = scene;

      // const testGameModule = this._gameModuleRegistry.RegisterBySource("TestGameModule", [
      //   "class  testgamemodule extends Lib.GameModule {",
      //   "Start() {",
      //   "}",
      //   "Update(deltaTime : number) {",
      //   "}"
      //   "}",
      // ].join("\n"));

      const camera = new FreeCamera(
        "camera1",
        new Vector3(0, 5, -10),
        scene.scene
      );

      // Target the camera to scene origin
      camera.setTarget(Vector3.Zero());
      // Attach the camera to the canvas
      camera.attachControl(this._gameEngine.canvasOrContext, false);

      // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
      new HemisphericLight("light1", new Vector3(0, 1, 0), scene.scene);
      // Create a built-in "sphere" shape using the SphereBuilder
      const sphere = MeshBuilder.CreateSphere(
        "sphere1",
        { segments: 16, diameter: 2, sideOrientation: Mesh.FRONTSIDE },
        scene.scene
      );
      // Move the sphere upward 1/2 of its height
      sphere.position.y = 1;
      // Create a built-in "ground" shape;
      MeshBuilder.CreateGround(
        "ground1",
        { width: 6, height: 6, subdivisions: 2, updatable: false },
        scene.scene
      );
    }
  }

  public get gameModuleRegistry(): GameModuleRegistry {
    return this._gameModuleRegistry;
  }

  public get gameEngine(): GameEngine {
    return this._gameEngine;
  }

  public get sceneManager(): SceneManager {
    return this._gameEngine.sceneManager;
  }
}
