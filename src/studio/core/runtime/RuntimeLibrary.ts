import type { ITypeDeclaration } from "../CompileMachine";
import type { GameModuleConstructor } from "../PrototypeGameModule";
import GameModule from "./GameModule";
import GameObject from "./GameObject";

export interface RuntimeLibrary {
  readonly GameModule: typeof GameModule;
  readonly GameObject: typeof GameObject;

  modules: {
    [key: string]: GameModuleConstructor;
  };
}

export type RuntimeDeclarations = Array<ITypeDeclaration>;

export const Lib: RuntimeLibrary = {
  GameModule,
  GameObject,

  modules: {},
};

export const DefaultDeclarations: RuntimeDeclarations = [
  {
    uri: "ts:filename/runtime_objects.d.ts",
    text: [
      "namespace Lib {",

      "export declare class GameObject {",
      "  private gameModule;",
      "  constructor();",
      "  Start(): void;",
      "  Update(deltaTime: number): void;",
      "}",

      "export declare abstract class GameModule {",
      "    private _gameObject;",
      "    constructor(gameObject: GameObject);",
      "    abstract Start(): void;",
      "    abstract Update(deltaTime: number): void;",
      "    get gameObject(): GameObject;",
      "    set gameObject(v: GameObject);",
      "}",

      "}",
    ].join("\n"),
  },
];
