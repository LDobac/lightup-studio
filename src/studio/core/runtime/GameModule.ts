import type IGameFlow from "../../utils/IGameFlow";
import type GameObject from "./GameObject";

export default abstract class GameModule implements IGameFlow {
  private _prototypeId: string;
  private _uid: string;

  private _gameObject: GameObject;

  constructor(gameObject: GameObject, prototypeId: string, uid: string) {
    this._gameObject = gameObject;

    this._prototypeId = prototypeId;
    this._uid = uid;
  }

  public Setup() {
    throw "Not Implement";
  }
  public Finish() {
    throw "Not Implement";
  }

  public abstract Start(): void;

  public abstract Update(deltaTime: number): void;

  public get gameObject(): GameObject {
    return this._gameObject;
  }

  public get prototypeId(): string {
    return this._prototypeId;
  }

  public get uid(): string {
    return this._uid;
  }
}
