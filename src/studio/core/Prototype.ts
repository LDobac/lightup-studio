import type { Nullable } from "babylonjs";
import { v4 as uuid } from "uuid";
import type { CompileMachine } from "./CompileMachine";
import GameEngine, { GameEngineAlreadyRunning } from "./GameEngine";
import GameModuleRegistry from "./GameModuleRegistry";
import type SceneManager from "./SceneManager";
import { Lib } from "./runtime/RuntimeLibrary";
import type { Serializer } from "../utils/ISerializable";
import PrototypeSerializer from "../utils/PrototypeSerializer";
import type { ISerializedPrototype } from "../utils/SerializedStructures";
import PrototypeGameModule from "./PrototypeGameModule";
import { SceneNotFoundError, SceneObject } from "./SceneManager";
import GameObject from "./runtime/GameObject";

export interface PrototypeFile {
  name: string;
  content: string;
}

export default class Prototype implements Serializer<ISerializedPrototype> {
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

    this._gameModuleRegistry = new GameModuleRegistry();

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

  public async GenerateTestScene(compiler: CompileMachine) {
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
      ].join("\n"),
      compiler
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

  public Clear(compiler: CompileMachine) {
    if (this.gameEngine.isRunning) {
      throw new GameEngineAlreadyRunning();
    }

    this.gameEngine.Finalize();
    this.gameEngine.sceneManager.Clear();

    this.gameModuleRegistry.Clear(compiler);
  }

  public Save(): PrototypeFile {
    return {
      name: this.name + ".lup",
      content: this.Serialize(),
    };
  }

  public async Load(file: PrototypeFile, compiler: CompileMachine) {
    this.Clear(compiler);

    const deserialized = this.Deserialize(file.content);

    this._id = deserialized.id;
    this._name = deserialized.name;

    for (const module of deserialized.gameModuleRegistry.modules) {
      const prototypeModule = new PrototypeGameModule(module.id, module.name);
      prototypeModule.originSource = module.source;

      await this.gameModuleRegistry.RegisterByModule(prototypeModule, compiler);
    }

    for (const scene of deserialized.sceneManager.scenes) {
      const loadedScene = new SceneObject(
        scene.name,
        this.gameEngine.babylonEngine,
        scene.id
      );

      const gameObjectManager = loadedScene.gameObjectManager;
      for (const gameObject of scene.gameObjectManager.gameObjects) {
        const loadedGameObject = new GameObject(
          loadedScene,
          gameObject.name,
          gameObject.id
        );

        for (const gameModule of gameObject.instantiableProtoGMs) {
          loadedGameObject.prototypeGameModule.push({
            uid: gameModule.uid,
            module: this.gameModuleRegistry.GetPrototypeGameModuleById(
              gameModule.moduleId
            ),
          });
        }

        gameObjectManager.AddGameObject(loadedGameObject);
      }

      this.sceneManager.AddScene(loadedScene);
    }

    if (deserialized.sceneManager.defaultSceneId) {
      const defaultScene = this.sceneManager.scenes.find(
        (s) => s.id === deserialized.sceneManager.defaultSceneId
      );

      if (!defaultScene) {
        throw new SceneNotFoundError();
      }

      this.sceneManager.defaultScene = defaultScene;
    }
  }

  public Serialize(): string {
    const serializer = new PrototypeSerializer(this);

    return serializer.Serialize();
  }

  public Deserialize(serialized: string): ISerializedPrototype {
    const serializer = new PrototypeSerializer(this);

    return serializer.Deserialize(serialized);
  }
}
