import type { ITypeDeclaration } from "../CompileMachine";
import type { GameModuleConstructor } from "../PrototypeGameModule";
import { Expose } from "./ExposeDecorator";
import GameModule from "./GameModule";
import GameObject from "./GameObject";

export interface RuntimeLibrary {
  // Class or Objects
  readonly GameModule: typeof GameModule;
  readonly GameObject: typeof GameObject;

  // Decorators
  readonly Expose: typeof Expose;

  // User module
  modules: {
    [key: string]: GameModuleConstructor;
  };
}

export type RuntimeDeclarations = Array<ITypeDeclaration>;

export const Lib: RuntimeLibrary = {
  // Class or Objects
  GameModule,
  GameObject,

  // Decorators
  Expose,

  // User module
  modules: {},
};

export const DefaultDeclarations: RuntimeDeclarations = [
  {
    uri: "ts:filename/runtime_objects.d.ts",
    text: [
      "namespace Lib {",

      // Class or Objects
      "export declare class GameObject {",
      "  private gameModule;",
      "  constructor();",
      "  Start(): void;",
      "  Update(deltaTime: number): void;",
      "}",

      "export declare abstract class GameModule {",
      "    private _gameObject;",
      "    constructor(gameObject: GameObject, prototypeId: string, uid: string);",
      "    abstract Start(): void;",
      "    abstract Update(deltaTime: number): void;",
      "    get gameObject(): GameObject;",
      "}",

      // Decorators
      "export declare function Expose(): (target: Object, propertyKey: string) => void;",

      "}",
    ].join("\n"),
  },
];
