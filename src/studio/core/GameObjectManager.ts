import GameObject from "./runtime/GameObject";

export class GameObjecteNotFoundError extends Error {
  constructor() {
    super("GameObjecte Not Found!");
  }
}

export default class GameObjectManager {
  private _gameObjects: Array<GameObject>;

  public constructor() {
    this._gameObjects = [];
  }

  public CreateGameObject(id = ""): GameObject {
    const newGameObject = new GameObject(id);

    this._gameObjects.push(newGameObject);

    return newGameObject;
  }

  public AddGameObject(gameObject: GameObject): GameObject {
    return gameObject;
  }

  public RemoveGameObject(gameObject: GameObject): void {
    throw new GameObjecteNotFoundError();
  }

  public RemoveGameObjectById(gameObjectId: string): void {
    throw new GameObjecteNotFoundError();
  }

  public GetGameObjectById(gameObjectId: string): GameObject {
    throw new GameObjecteNotFoundError();
  }

  public Clear() {
    throw "Not Implement.";
  }

  public QueryType(type: string) {
    throw "Not Implement.";
  }

  public GameSetup() {
    throw "Not Implement.";
  }

  public GameStart() {
    throw "Not Implement.";
  }

  public GameUpdate(deltaTime: number) {
    throw "Not Implement.";
  }

  public GameFinish() {
    throw "Not Implement.";
  }

  public get gameObjects(): Array<GameObject> {
    return this._gameObjects;
  }
}
