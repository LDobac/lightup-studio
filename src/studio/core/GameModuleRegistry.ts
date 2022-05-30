import "reflect-metadata";
import { CompileError, CompileMachine } from "./CompileMachine";
import type GameEngine from "./GameEngine";
import PrototypeGameModule, {
  type GameModuleConstructor,
} from "./PrototypeGameModule";
import {
  KEY_EXPOSE_META,
  type IExposeMetadata,
} from "./runtime/ExposeDecorator";
import {
  DefaultDeclarations,
  Lib,
  type RuntimeDeclarations,
} from "./runtime/RuntimeLibrary";

export class GameModuleNameDuplicatedError extends Error {
  constructor() {
    super("GameModule Name duplicated!");
  }
}

export class GameModuleNotFoundError extends Error {
  constructor() {
    super("GameModule Not Found!");
  }
}

export class GameModuleIdDuplicatedError extends Error {
  constructor() {
    super("GameModule id duplicated!");
  }
}

export default class GameModuleRegistry {
  // NOTE : 현재 모듈, Lib 등 Array 타입으로 되어 있어 탐색시 O(n)임.
  // 추가적인 최적화가 필요하면 Key:Value 타입으로 변경

  private modules: Array<PrototypeGameModule>;

  private gameEngine: GameEngine | null;

  public Declarations: RuntimeDeclarations = [];

  constructor(gameEngine: GameEngine | null = null) {
    this.modules = [];

    this.gameEngine = gameEngine;
  }

  public async RegisterNewModule(
    name: string,
    compiler: CompileMachine
  ): Promise<PrototypeGameModule> {
    const newPrototypeModule = new PrototypeGameModule("", name);
    newPrototypeModule.originSource = PrototypeGameModule.GetDefaultSource(
      newPrototypeModule.GetSafeName()
    );

    await this.AddGameModule(newPrototypeModule, compiler);

    return newPrototypeModule;
  }

  public async RegisterBySource(
    name: string,
    source: string,
    compiler: CompileMachine
  ): Promise<PrototypeGameModule> {
    const newPrototypeModule = new PrototypeGameModule("", name);
    newPrototypeModule.originSource = source;

    return this.AddGameModule(newPrototypeModule, compiler);
  }

  public RegisterByModule(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ): Promise<PrototypeGameModule> {
    return this.AddGameModule(gameModule, compiler);
  }

  public RemoveGameModuleByModule(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ): void {
    const deletedModule = this.modules.findIndex(
      (module) => gameModule === module
    );

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule, compiler);
    }
  }

  public RemoveGameModuleByName(name: string, compiler: CompileMachine): void {
    const deletedModule = this.modules.findIndex(
      (module) => module.name === name
    );

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule, compiler);
    }
  }

  public RemoveGameModuleById(id: string, compiler: CompileMachine): void {
    const deletedModule = this.modules.findIndex((module) => module.id === id);

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule, compiler);
    }
  }

  public async ModifyGameModuleByModule(
    module: PrototypeGameModule,
    source: string,
    compiler: CompileMachine
  ) {
    const index = this.modules.findIndex((m) => module === m);

    await this.ModifyGameModule(index, source, compiler);
  }

  public async ModifyGameModuleByName(
    name: string,
    source: string,
    compiler: CompileMachine
  ) {
    const index = this.modules.findIndex((module) => module.name === name);

    await this.ModifyGameModule(index, source, compiler);
  }

  public async ModifyGameModuleById(
    id: string,
    source: string,
    compiler: CompileMachine
  ) {
    const index = this.modules.findIndex((module) => module.id === id);

    await this.ModifyGameModule(index, source, compiler);
  }

  public GetPrototypeGameModuleByName(name: string): PrototypeGameModule {
    const module = this.modules.find((module) => module.name === name);

    if (!module) {
      throw new GameModuleNotFoundError();
    }

    return module;
  }

  public GetPrototypeGameModuleById(id: string): PrototypeGameModule {
    const module = this.modules.find((module) => module.id === id);

    if (!module) {
      throw new GameModuleNotFoundError();
    }

    return module;
  }

  public GetGameModuleConstructorByName(name: string): GameModuleConstructor {
    const module = this.modules.find((module) => module.name === name);

    if (!module) {
      throw new GameModuleNotFoundError();
    }

    return Lib.modules[module.safeName];
  }

  public GetGameModuleConstructorById(id: string): GameModuleConstructor {
    const module = this.modules.find((module) => module.id === id);

    if (!module) {
      throw new GameModuleNotFoundError();
    }

    return Lib.modules[module.safeName];
  }

  public Clear(compiler: CompileMachine) {
    this.modules = [];
    this.Declarations = [];

    this.SetCompilerDeclarations(compiler);
  }

  public get prototypeGameModules(): Array<PrototypeGameModule> {
    return this.modules;
  }

  private async CompileModule(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ): Promise<void> {
    this.SetCompilerDeclarations(compiler);
    compiler.SetCode(gameModule.originSource);

    const result = await compiler.GetCompiledCode();

    // Ignore not critical errors
    if (result.diagnostic.length > 0 && !result.declaration && !result.js) {
      throw new CompileError(result.diagnostic);
    }

    const declaration = result.declaration ?? "";
    const js = result.js ?? "";

    gameModule.SetCompiledSource(js, declaration);
  }

  private WrapDeclaration(declaration: string) {
    return [
      "namespace Lib {",
      "export namespace modules {",
      `export ${declaration}`,
      "}",
      "}",
    ].join("\n");
  }

  // Add new game module
  private AddDeclaration(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ) {
    const moduleDeclaration = gameModule.GetDeclaration();
    this.Declarations.push({
      uri: moduleDeclaration.uri,
      text: this.WrapDeclaration(moduleDeclaration.text),
    });

    this.SetCompilerDeclarations(compiler);
  }

  // Modify and Set exists game module
  private ModifyDeclaration(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ) {
    const moduleDeclaration = gameModule.GetDeclaration();

    const declaration = this.Declarations.find(
      (d) => d.uri === moduleDeclaration.uri
    );
    if (!declaration) {
      throw new GameModuleNotFoundError();
    }

    declaration.text = this.WrapDeclaration(moduleDeclaration.text);

    this.SetCompilerDeclarations(compiler);
  }

  private SetCompilerDeclarations(compiler: CompileMachine) {
    compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
  }

  private AddGameModuleToLibrary(gameModule: PrototypeGameModule) {
    Lib.modules[gameModule.GetSafeName()] =
      gameModule.GetConstructorWrapper()(Lib);

    this.SetMetadata(gameModule, Lib.modules[gameModule.GetSafeName()]);
  }

  private SetMetadata(
    gameModule: PrototypeGameModule,
    constructor: GameModuleConstructor
  ) {
    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      constructor.prototype
    );

    const metadata = (rawMetadata ?? {}) as IExposeMetadata;

    gameModule.exposeMetadata = metadata;
  }

  private RemoveLibAndDeclaration(
    deletedModule: PrototypeGameModule,
    compiler: CompileMachine
  ) {
    // Delete declarations
    const dIndex = this.Declarations.findIndex(
      (v) => v.uri === deletedModule.GetDeclarationURI()
    );
    if (dIndex > -1) {
      this.Declarations.splice(dIndex, 1);
    }

    // Delete Lib modules
    delete Lib.modules[deletedModule.safeName];

    this.SetCompilerDeclarations(compiler);
  }

  private async AddGameModule(
    gameModule: PrototypeGameModule,
    compiler: CompileMachine
  ): Promise<PrototypeGameModule> {
    for (const prototypeGameModule of this.modules) {
      if (prototypeGameModule.name === gameModule.name) {
        throw new GameModuleNameDuplicatedError();
      } else if (prototypeGameModule.id === gameModule.id) {
        throw new GameModuleIdDuplicatedError();
      }
    }

    await this.CompileModule(gameModule, compiler);

    this.modules.push(gameModule);

    this.AddDeclaration(gameModule, compiler);
    this.AddGameModuleToLibrary(gameModule);

    return gameModule;
  }

  private RemoveGameModule(index: number, compiler: CompileMachine): void {
    // Delete modules
    const deletedModule = this.modules.splice(index, 1)[0];

    this.RemoveLibAndDeclaration(deletedModule, compiler);

    if (this.gameEngine) {
      this.gameEngine.PropagateModuleChange("deleted", deletedModule.id);
    }
  }

  private async ModifyGameModule(
    index: number,
    source: string,
    compiler: CompileMachine
  ): Promise<void> {
    if (index < 0) {
      throw new GameModuleNotFoundError();
    }

    const modifiedModule = this.modules[index];

    modifiedModule.originSource = source;

    await this.CompileModule(modifiedModule, compiler);

    this.ModifyDeclaration(modifiedModule, compiler);
    this.AddGameModuleToLibrary(modifiedModule);
  }
}
