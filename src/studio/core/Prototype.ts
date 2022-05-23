import type { Nullable } from "babylonjs";
import { v4 as uuid } from "uuid";
import type { CompileMachine } from "./CompileMachine";
import GameEngine from "./GameEngine";
import GameModuleRegistry from "./GameModuleRegistry";
import type SceneManager from "./SceneManager";
import type PrototypeGameModule from "./PrototypeGameModule";
import { Lib } from "./runtime/RuntimeLibrary";
import type ISerializable from "../utils/ISerializable";
import type { ISceneObject } from "./SceneManager";
import type GameObject from "./runtime/GameObject";
import type { InstantiableProtoGM } from "./runtime/GameObject";
import type GameObjectManager from "./GameObjectManager";
import type {
  ISerializedGameModuleRegistry,
  ISerializedGameObject,
  ISerializedGameObjectManager,
  ISerializedInstantiableProtoGM,
  ISerializedPrototype,
  ISerializedPrototypeGameModule,
  ISerializedScene,
  ISerializedSceneManager,
} from "../utils/SerializedStructures";

export default class Prototype implements ISerializable {
  private _id: string;
  private _name: string;

  private _gameModuleRegistry: GameModuleRegistry;
  private _gameEngine: GameEngine;

  constructor(
    canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>,
    compiler: CompileMachine,
    id = "",
    name = ""
  ) {
    this._id = id;
    this._name = name;

    this._gameModuleRegistry = new GameModuleRegistry(compiler);

    this._gameEngine = new GameEngine(canvasOrContext);
    this._gameEngine.SetEditMode(true);

    Lib.gameEngine = this._gameEngine;
  }

  public async GenerateEmptyPrototype() {
    this._id = uuid();

    const sceneManager = this._gameEngine.sceneManager;

    const scene = sceneManager.NewScene("New Scene");
    sceneManager.defaultScene = scene;
  }

  public async GenerateTestScene() {
    this._id = uuid();

    const sceneManager = this._gameEngine.sceneManager;

    const scene = sceneManager.NewScene("New Scene");
    sceneManager.defaultScene = scene;

    const testGameModule = await this._gameModuleRegistry.RegisterBySource(
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
    );

    const gameObject =
      scene.gameObjectManager.CreateGameObject("New GameObject");
    gameObject.AddPrototypeGM(testGameModule);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
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

  public Serialize(): string {
    const SerializeInstantiableProtoGM = (
      module: InstantiableProtoGM
    ): ISerializedInstantiableProtoGM => {
      return {
        uid: module.uid,
        moduleId: module.module.id,
      };
    };

    const SerializeGameObject = (
      gameObject: GameObject
    ): ISerializedGameObject => {
      return {
        id: gameObject.id,
        name: gameObject.name,
        instantiableProtoGMs: gameObject.prototypeGameModule.map((module) =>
          SerializeInstantiableProtoGM(module)
        ),
      };
    };

    const SerializeGameObjectManager = (
      gameObjectManager: GameObjectManager
    ): ISerializedGameObjectManager => {
      return {
        gameObjects: gameObjectManager.gameObjects.map(
          (gameObject: GameObject) => SerializeGameObject(gameObject)
        ),
      };
    };

    const SerializeScene = (scene: ISceneObject): ISerializedScene => {
      return {
        id: scene.id,
        name: scene.name,
        gameObjectManager: SerializeGameObjectManager(scene.gameObjectManager),
      };
    };

    const sceneManager: ISerializedSceneManager = {
      defaultSceneId: this.sceneManager.defaultScene
        ? this.sceneManager.defaultScene.id
        : null,
      scenes: this.sceneManager.scenes.map((scene: ISceneObject) =>
        SerializeScene(scene)
      ),
    };

    const SerializePrototypeGameModule = (
      module: PrototypeGameModule
    ): ISerializedPrototypeGameModule => {
      return {
        id: module.id,
        name: module.name,
        source: module.originSource,
      };
    };

    const gameModuleRegistry: ISerializedGameModuleRegistry = {
      modules: this._gameModuleRegistry.prototypeGameModules.map((module) =>
        SerializePrototypeGameModule(module)
      ),
    };

    const serializedPrototype: ISerializedPrototype = {
      id: this.id,
      name: this.name,
      sceneManager: sceneManager,
      gameModuleRegistry: gameModuleRegistry,
    };

    return JSON.stringify(serializedPrototype);
  }
}
