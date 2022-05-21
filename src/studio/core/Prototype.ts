import type { Nullable } from "babylonjs";
import type { CompileMachine } from "./CompileMachine";
import GameEngine from "./GameEngine";
import GameModuleRegistry from "./GameModuleRegistry";
import type SceneManager from "./SceneManager";
import type PrototypeGameModule from "./PrototypeGameModule";
import { Lib } from "./runtime/RuntimeLibrary";

export default class Prototype {
  private _gameModuleRegistry: GameModuleRegistry;
  private _gameEngine: GameEngine;

  constructor(
    canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>,
    compiler: CompileMachine
  ) {
    this._gameModuleRegistry = new GameModuleRegistry(compiler);

    this._gameEngine = new GameEngine(canvasOrContext);
    this._gameEngine.SetEditMode(true);

    Lib.gameEngine = this._gameEngine;
  }

  public GenerateEmptyPrototype() {
    const sceneManager = this._gameEngine.sceneManager;

    const scene = sceneManager.NewScene("New Scene");
    sceneManager.defaultScene = scene;
  }

  public GenerateTestScene() {
    const sceneManager = this._gameEngine.sceneManager;

    const scene = sceneManager.NewScene("New Scene");
    sceneManager.defaultScene = scene;

    setTimeout(() => {
      this._gameModuleRegistry
        .RegisterBySource(
          "TestGameModule",
          [
            "class  testgamemodule extends Lib.GameModule {",
            " private camera : Lib.BABYLON.FreeCamera;",
            " private ground : Lib.BABYLON.Mesh",
            " Start() {",
            "   const Babylon = Lib.BABYLON;",
            "   const currentScene = this.gameObject.scene.scene;\n",
            "   this.camera = new Babylon.FreeCamera('camera1', new Babylon.Vector3(0, 5, -10), currentScene);",
            "   this.camera.setTarget(Babylon.Vector3.Zero());",
            "   this.camera.attachControl(Lib.gameEngine.canvasOrContext, false);\n",
            "   new Babylon.HemisphericLight('light1', new Babylon.Vector3(0, 1, 0), currentScene);\n",
            "   const sphere = Babylon.MeshBuilder.CreateSphere('sphere1', { segments: 16, diameter: 2, sideOrientation: Babylon.Mesh.FRONTSIDE }, currentScene);",
            "   sphere.position.y = 1",
            "   this.ground = Babylon.MeshBuilder.CreateGround('ground1', { width: 6, height: 6, subdivisions: 2, updatable: false }, currentScene)",
            " }",
            " Update(deltaTime : number) {",
            "   this.ground.rotate(Lib.BABYLON.Vector3.Up(), deltaTime);",
            " }",
            "}",
          ].join("\n")
        )
        .then((testGameModule: PrototypeGameModule) => {
          const gameObject =
            scene.gameObjectManager.CreateGameObject("New GameObject");
          gameObject.AddPrototypeGM(testGameModule);

          console.log("Init succ");

          this._gameEngine.Start();
        });
    }, 1000);
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
