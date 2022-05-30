import { Engine, type Nullable } from "babylonjs";
import SceneManager, { type ISceneObject } from "./SceneManager";

export type PropagateType = "deleted" | "modified";

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

  private _canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>;

  constructor(
    canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>
  ) {
    this._isRunning = false;
    this._isEditing = false;

    this._canvasOrContext = canvasOrContext;

    this._babylonEngine = new Engine(this._canvasOrContext, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this._sceneManager = new SceneManager(this);
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
    if (this._isRunning) {
      this._sceneManager.StartScene(this._sceneManager.currentScene);
    }
  }

  public PropagateModuleChange(
    msgType: PropagateType,
    prototypeModuleId: string
  ) {
    this.sceneManager.PropagateModuleChange(msgType, prototypeModuleId);
  }

  public get sceneManager(): SceneManager {
    return this._sceneManager;
  }

  public get babylonEngine(): Engine {
    return this._babylonEngine;
  }

  public get canvasOrContext(): Nullable<
    HTMLCanvasElement | WebGLRenderingContext
  > {
    return this._canvasOrContext;
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
