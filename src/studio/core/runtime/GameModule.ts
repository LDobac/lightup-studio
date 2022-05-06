import type GameObject from "./GameObject";

export default abstract class GameModule {
  private _gameObject: GameObject;

  constructor(gameObject: GameObject) {
    this._gameObject = gameObject;
  }

  public abstract Start(): void;

  public abstract Update(deltaTime: number): void;

  public get gameObject(): GameObject {
    return this._gameObject;
  }

  public set gameObject(v: GameObject) {
    // TODO : 기존 GameObject 커넥션 정리, 삭제 함수 호출
    this._gameObject = v;
  }
}
