import type GameModule from "./GameModule";

export default class GameObject {
  private gameModule: Array<GameModule>;

  constructor() {
    this.gameModule = [];
  }

  public Start() {
    // Empty
  }

  public Update(deltaTime: number) {
    this.gameModule.forEach((module) => {
      module.Update(deltaTime);
    });
  }
}
