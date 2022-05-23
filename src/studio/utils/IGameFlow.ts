export default interface IGameFlow {
  Setup: () => void;

  Start: () => void;

  Update: (deltaTime: number) => void;

  Finish: () => void;
}
