import type { ITypeDeclaration } from "../CompileMachine";
import type GameEngine from "../GameEngine";
import type { GameModuleConstructor } from "../PrototypeGameModule";
import { Expose } from "./ExposeDecorator";
import GameModule from "./GameModule";
import GameObject from "./GameObject";

import BabylonDtxt from "./declarations/babylon.d.ts.txt?raw";
import ExposeDtxt from "./declarations/Expose.d.ts.txt?raw";
import GameEngineDtxt from "./declarations/GameEngine.d.ts.txt?raw";
import GameModuleDtxt from "./declarations/GameModule.d.ts.txt?raw";
import GameObjectDtxt from "./declarations/GameObject.d.ts.txt?raw";
import ISceneObjectDtxt from "./declarations/ISceneObject.d.ts.txt?raw";
import SceneManagerDtxt from "./declarations/SceneManager.d.ts.txt?raw";

export interface RuntimeLibrary {
  // 3rd party lib
  readonly BABYLON: typeof BABYLON;

  // Class or Objects
  readonly GameModule: typeof GameModule;
  readonly GameObject: typeof GameObject;

  gameEngine: GameEngine | null;

  // Decorators
  readonly Expose: typeof Expose;

  // User module
  modules: {
    [key: string]: GameModuleConstructor;
  };
}

export type RuntimeDeclarations = Array<ITypeDeclaration>;

export const Lib: RuntimeLibrary = {
  // 3rd party lib
  BABYLON: BABYLON,

  // Class or Objects
  gameEngine: null,

  GameModule,
  GameObject,

  // Decorators
  Expose,

  // User module
  modules: {},
};

export const DefaultDeclarations: RuntimeDeclarations = [
  {
    uri: "ts:filename/babylon.d.ts",
    text: ["namespace Lib {", BabylonDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/ExposeDtxt.d.ts",
    text: ["namespace Lib {", ExposeDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/GameEngineDtxt.d.ts",
    text: ["namespace Lib {", GameEngineDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/GameModuleDtxt.d.ts",
    text: ["namespace Lib {", GameModuleDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/GameObjectDtxt.d.ts",
    text: ["namespace Lib {", GameObjectDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/ISceneObjectDtxt.d.ts",
    text: ["namespace Lib {", ISceneObjectDtxt, "}"].join("\n"),
  },
  {
    uri: "ts:filename/SceneManager.d.ts",
    text: ["namespace Lib {", SceneManagerDtxt, "}"].join("\n"),
  },
];
