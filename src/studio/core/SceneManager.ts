import { v4 as uuid } from "uuid";
import { Engine, Scene } from "babylonjs";
import type GameEngine from "./GameEngine";
import GameObjectManager from "./GameObjectManager";

export interface ISceneObject {
  id: string;
  name: string;
  scene: Scene;
  gameObjectManager: GameObjectManager;
}

export class SceneObject implements ISceneObject {
  public id: string;
  public name: string;
  public scene: Scene;
  public gameObjectManager: GameObjectManager;

  constructor(name: string, engine: Engine) {
    this.id = uuid();
    this.name = name;
    this.scene = new Scene(engine);
    this.gameObjectManager = new GameObjectManager(this);
  }
}

export class SceneNotFoundError extends Error {
  constructor() {
    super("Could not found scene!");
  }
}

export class SceneNameDuplicated extends Error {
  constructor() {
    super("Scene name has duplicated");
  }
}

export class SceneNameEmpty extends Error {
  constructor() {
    super("Scene name has empty");
  }
}

export class CurrentSceneNotExists extends Error {
  constructor() {
    super("Current Scene is undefined!");
  }
}

export class CannotStartScene extends Error {
  constructor() {
    super(
      "Cannot start the Scene. Maybe there are no scenes for start the Scene"
    );
  }
}

export default class SceneManager {
  private gameEngine: GameEngine;

  private scenes: Array<ISceneObject>;

  private _defaultScene?: ISceneObject;
  private _currentScene?: ISceneObject;

  constructor(gameEngine: GameEngine) {
    this.scenes = [];

    this.gameEngine = gameEngine;
  }

  public NewScene(name: string): ISceneObject {
    if (name.length < 1) {
      throw new SceneNameEmpty();
    }

    if (this.scenes.find((s) => s.name === name)) {
      throw new SceneNameDuplicated();
    }

    const newSceneObj = new SceneObject(name, this.gameEngine.babylonEngine);

    this.scenes.push(newSceneObj);

    return newSceneObj;
  }

  public RemoveSceneById(id: string): void {
    this.RemoveScene(this.scenes.findIndex((s) => s.id === id));
  }

  public RemoveSceneByName(name: string): void {
    this.RemoveScene(this.scenes.findIndex((s) => s.name === name));
  }

  public StartSceneById(id: string): void {
    const scene = this.scenes.find((s) => s.id === id);

    if (!scene) {
      throw new SceneNotFoundError();
    }

    this.StartScene(scene);
  }

  public StartSceneByName(name: string): void {
    const scene = this.scenes.find((s) => s.name === name);

    if (!scene) {
      throw new SceneNotFoundError();
    }

    this.StartScene(scene);
  }

  public StartScene(scene?: ISceneObject): void {
    if (this._currentScene) {
      this._currentScene.gameObjectManager.GameFinish();
    }

    if (scene) {
      if (!this.scenes.includes(scene)) {
        throw new SceneNotFoundError();
      }

      this._currentScene = scene;
    } else if (!scene && !this._currentScene) {
      if (!this._defaultScene) {
        throw new CannotStartScene();
      }

      this._currentScene = this._defaultScene;
    }

    if (this._currentScene) {
      this._currentScene.gameObjectManager.GameSetup(
        this.gameEngine.gameModuleRegistry
      );
      this._currentScene.gameObjectManager.GameStart();
    } else {
      throw new CurrentSceneNotExists();
    }
  }

  public FinishCurrentScene(): void {
    if (!this._currentScene) {
      throw new CurrentSceneNotExists();
    }

    this._currentScene.gameObjectManager.GameFinish();

    this._currentScene = undefined;
  }

  public SwapById(id: string): void {
    this.StartSceneById(id);
  }

  public SwapByName(name: string): void {
    this.StartSceneByName(name);
  }

  public SceneRender() {
    if (!this._currentScene) {
      throw new CurrentSceneNotExists();
    }

    this._currentScene.scene.render();
  }

  public SceneUpdate(deltaTime: number) {
    if (!this._currentScene) {
      throw new CurrentSceneNotExists();
    }

    this._currentScene.gameObjectManager.GameUpdate(deltaTime);
  }

  public set defaultScene(scene: ISceneObject | undefined) {
    if (scene && !this.scenes.find((s) => s.id === scene.id)) {
      throw new SceneNotFoundError();
    }

    this._defaultScene = scene;
  }

  public get defaultScene(): ISceneObject | undefined {
    return this._defaultScene;
  }

  public get currentScene(): ISceneObject | undefined {
    return this._currentScene;
  }

  public get _scenes(): ISceneObject[] {
    return this.scenes;
  }

  private RemoveScene(index: number) {
    if (index < 0) {
      throw new SceneNotFoundError();
    }

    this.scenes.splice(index, 1);
  }
}
