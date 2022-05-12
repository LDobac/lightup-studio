import { v4 as uuid } from "uuid";
import type { ITypeDeclaration } from "./CompileMachine";
import type GameModule from "./runtime/GameModule";
import type GameObject from "./runtime/GameObject";
import type { Lib } from "./runtime/RuntimeLibrary";

export interface GameModuleConstructor {
  new (gameObject: GameObject, prototypeId: string, uid: string): GameModule;
}

export interface GameModuleConstructorWrapper {
  (lib: typeof Lib): GameModuleConstructor;
}

export class SourceNotValidError extends Error {
  constructor() {
    super("Source doesn't vaild!");
  }
}

export class NotCompiledError extends Error {
  constructor() {
    super("Code doesn't compiled!");
  }
}

export default class PrototypeGameModule {
  private _id: string;
  private _name: string;

  private _originSource: string;
  private _compiledSource: string;

  private declaration: string;

  private constructorWrapper: GameModuleConstructorWrapper | null;

  public static GetDefaultSource(name: string): string {
    return [
      `class ${name} extends Lib.GameModule`,
      "{",
      "\tpublic Start() {}",
      "\tpublic Update(deltaTime:number) {}",
      "}",
    ].join("\n");
  }

  public constructor(id: string, name: string) {
    this._id = id.length ? id : uuid();

    this._name = name;

    this._originSource = "";
    this._compiledSource = "";

    this.declaration = "";

    this.constructorWrapper = null;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(newName: string) {
    this._name = newName;
  }

  public get originSource(): string {
    return this._originSource;
  }

  public set originSource(source: string) {
    if (!this.IsSourceValid(source)) {
      throw new SourceNotValidError();
    }

    this._originSource = source;
  }

  public get compiledSource(): string {
    return this._compiledSource;
  }

  public SetCompiledSource(compiledSource: string, declaration: string): void {
    if (!this.IsSourceValid(compiledSource)) {
      throw new SourceNotValidError();
    }

    this._compiledSource = compiledSource;
    this.declaration = declaration;

    const wrapperBody = [compiledSource, `return ${this.GetSafeName()};`].join(
      "\n"
    );

    this.constructorWrapper = new Function(
      "Lib",
      wrapperBody
    ) as GameModuleConstructorWrapper;
  }

  public GetDeclaration(): ITypeDeclaration {
    return {
      uri: this.GetDeclarationURI(),
      text: this.declaration,
    };
  }

  public GetSafeName() {
    return this.name.toLowerCase().replace(/\s/gim, "_");
  }

  public get safeName(): string {
    return this.GetSafeName();
  }

  public GetDeclarationURI() {
    return this.GetSafeName() + ".d.ts";
  }

  public GetConstructorWrapper(): GameModuleConstructorWrapper {
    if (!this.constructorWrapper) {
      throw new NotCompiledError();
    }

    return this.constructorWrapper;
  }

  private IsSourceValid(source: string): boolean {
    const matchValidClassRegex = new RegExp(
      `\\s*(class)\\s*(${this.GetSafeName()})\\s*(extends\\s*Lib\\.GameModule)`,
      "gmi"
    );

    const matchResult = source.match(matchValidClassRegex);

    if (!(matchResult && matchResult.length)) {
      return false;
    }

    return true;
  }
}
