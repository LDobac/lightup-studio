import { v4 as uuid } from "uuid";
import { Engine, Scene } from "babylonjs";
import type GameEngine from "./GameEngine";
import GameObjectManager from "./GameObjectManager";
import type IGameFlow from "../utils/IGameFlow";

export interface ISceneObject extends IGameFlow {
  id: string;
  name: string;
  scene: Scene;
  gameObjectManager: GameObjectManager;

  Render: () => void;
}

export class SceneObject implements ISceneObject {
  public id: string;
  public name: string;
  public scene: Scene;
  public gameObjectManager: GameObjectManager;

  private engine: Engine;

  constructor(
    name: string,
    engine: Engine,
    id = "",
    gameObjectManager: GameObjectManager | null = null
  ) {
    this.id = id.length > 0 ? id : uuid();
    this.name = name;
    this.scene = new Scene(engine);
    this.gameObjectManager = gameObjectManager
      ? gameObjectManager
      : new GameObjectManager(this);

    this.engine = engine;
  }

  public Render() {
    this.scene.render();
  }

  public Setup() {
    this.gameObjectManager.Setup();
  }

  public Start() {
    this.gameObjectManager.Start();
  }

  public Update(deltaTime: number) {
    this.gameObjectManager.Update(deltaTime);
  }

  public Finish() {
    this.gameObjectManager.Finish();

    // this.scene.dispose();

    this.scene = new Scene(this.engine);
  }
}

export class SceneNotFoundError extends Error {
  constructor() {
    super("Could not found scene!");
  }
}

export class SceneDuplicated extends Error {
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

  private _scenes: Array<ISceneObject>;

  private _defaultScene?: ISceneObject;
  private _currentScene?: ISceneObject;

  constructor(gameEngine: GameEngine) {
    this._scenes = [];

    this.gameEngine = gameEngine;
  }

  public NewScene(name: string): ISceneObject {
    if (name.length < 1) {
      throw new SceneNameEmpty();
    }

    if (this.scenes.find((s) => s.name === name)) {
      throw new SceneDuplicated();
    }

    const newSceneObj = new SceneObject(name, this.gameEngine.babylonEngine);

    this.scenes.push(newSceneObj);

    return newSceneObj;
  }

  public AddScene(scene: ISceneObject): ISceneObject {
    if (scene.name.length < 1) {
      throw new SceneNameEmpty();
    }

    if (this.scenes.find((s) => (s.name === scene.name) || (s.id === scene.id))) {
      throw new SceneDuplicated();
    }

    this.scenes.push(scene);

    return scene;
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
      const tmpCurrentScene = this._currentScene;
      this.FinishCurrentScene();
      this._currentScene = tmpCurrentScene;
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
      this._currentScene.Setup();
      this._currentScene.Start();
    } else {
      throw new CurrentSceneNotExists();
    }
  }

  public FinishCurrentScene(): void {
    if (!this._currentScene) {
      throw new CurrentSceneNotExists();
    }

    this._currentScene.Finish();

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

    this._currentScene.Render();
  }

  public SceneUpdate(deltaTime: number) {
    if (!this._currentScene) {
      throw new CurrentSceneNotExists();
    }

    this._currentScene.Update(deltaTime);
  }

  public Clear() {
    this._defaultScene = undefined;
    this._currentScene = undefined;

    this._scenes.forEach((scene) => {
      scene.gameObjectManager.Clear();

      scene.Finish();
    });
    this._scenes = [];
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

  public get scenes(): ISceneObject[] {
    return this._scenes;
  }

  private RemoveScene(index: number) {
    if (index < 0) {
      throw new SceneNotFoundError();
    }

    this.scenes.splice(index, 1);
  }
}
