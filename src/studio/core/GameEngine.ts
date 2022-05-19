import { Engine } from "babylonjs";
import type { CompileMachine } from "./CompileMachine";
import GameModuleRegistry from "./GameModuleRegistry";
import SceneManager, { type ISceneObject } from "./SceneManager";

export class GameEngineAlreadyRunning extends Error {
  constructor() {
    super("Game Engine already running.");
  }
}

export default class GameEngine {
  private _isRunning: boolean;
  private _isEditing: boolean;

  private _babylonEngine: Engine;

  private _sceneManager: SceneManager;
  private _gameModuleRegistry: GameModuleRegistry;

  private canvasEl: HTMLCanvasElement | null;

  constructor(canvasEl: HTMLCanvasElement | null, compiler: CompileMachine) {
    this._isRunning = false;
    this._isEditing = false;

    this.canvasEl = canvasEl;

    this._babylonEngine = new Engine(this.canvasEl, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this._sceneManager = new SceneManager(this);
    this._gameModuleRegistry = new GameModuleRegistry(compiler);
  }

  public Start(scene?: ISceneObject) {
    if (!this._isRunning) {
      this._sceneManager.StartScene(scene);

      this._babylonEngine.runRenderLoop(this.RenderingLoop.bind(this));

      this._isRunning = true;
    } else {
      throw new GameEngineAlreadyRunning();
    }
  }

  public Stop() {
    if (this._isRunning) {
      this._isRunning = false;
    }
  }

  public Finalize() {
    if (this._isRunning) {
      this._isRunning = false;

      this._babylonEngine.stopRenderLoop();

      this._sceneManager.FinishCurrentScene();
    }
  }

  public SetEditMode(mode: boolean) {
    this._isEditing = mode;

    // Restart Scene
    this._sceneManager.StartScene(this._sceneManager.currentScene);
  }

  public get sceneManager(): SceneManager {
    return this._sceneManager;
  }

  public get gameModuleRegistry(): GameModuleRegistry {
    return this._gameModuleRegistry;
  }

  public get babylonEngine(): Engine {
    return this._babylonEngine;
  }

  public get canvas(): HTMLCanvasElement | null {
    return this.canvasEl;
  }

  public get isRunning(): boolean {
    return this._isRunning;
  }

  public get isEditing(): boolean {
    return this._isEditing;
  }

  private RenderingLoop() {
    if (this._isRunning) {
      this._sceneManager.SceneRender();

      if (!this._isEditing) {
        const deltaTime = this._babylonEngine.getDeltaTime();
        this._sceneManager.SceneUpdate(deltaTime);
      }
    }
  }
}
