import "reflect-metadata";
import { CompileError, CompileMachine } from "./CompileMachine";
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

  private compiler: CompileMachine;
  private modules: Array<PrototypeGameModule>;

  public Declarations: RuntimeDeclarations = [];

  constructor(compiler: CompileMachine) {
    this.compiler = compiler;
    this.modules = [];

    this.SetCompilerDeclarations();
  }

  public async RegisterNewModule(name: string): Promise<PrototypeGameModule> {
    const newPrototypeModule = new PrototypeGameModule("", name);
    newPrototypeModule.originSource = PrototypeGameModule.GetDefaultSource(
      newPrototypeModule.GetSafeName()
    );

    await this.AddGameModule(newPrototypeModule);

    return newPrototypeModule;
  }

  public async RegisterBySource(
    name: string,
    source: string
  ): Promise<PrototypeGameModule> {
    const newPrototypeModule = new PrototypeGameModule("", name);
    newPrototypeModule.originSource = source;

    return this.AddGameModule(newPrototypeModule);
  }

  public RegisterByModule(
    gameModule: PrototypeGameModule
  ): Promise<PrototypeGameModule> {
    return this.AddGameModule(gameModule);
  }

  public RemoveGameModuleByModule(gameModule: PrototypeGameModule): void {
    const deletedModule = this.modules.findIndex(
      (module) => gameModule === module
    );

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule);
    }
  }

  public RemoveGameModuleByName(name: string): void {
    const deletedModule = this.modules.findIndex(
      (module) => module.name === name
    );

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule);
    }
  }

  public RemoveGameModuleById(id: string): void {
    const deletedModule = this.modules.findIndex((module) => module.id === id);

    if (deletedModule > -1) {
      this.RemoveGameModule(deletedModule);
    }
  }

  public async ModifyGameModuleByModule(
    module: PrototypeGameModule,
    source: string
  ) {
    const index = this.modules.findIndex((m) => module === m);

    await this.ModifyGameModule(index, source);
  }

  public async ModifyGameModuleByName(name: string, source: string) {
    const index = this.modules.findIndex((module) => module.name === name);

    await this.ModifyGameModule(index, source);
  }

  public async ModifyGameModuleById(id: string, source: string) {
    const index = this.modules.findIndex((module) => module.id === id);

    await this.ModifyGameModule(index, source);
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

  public SetCompiler(compiler: CompileMachine) {
    if (this.compiler !== compiler) {
      this.compiler = compiler;

      this.SetCompilerDeclarations();
    }
  }

  public Clear() {
    this.modules = [];
    this.Declarations = [];

    this.compiler.SetCode("");

    this.SetCompilerDeclarations();
  }

  public get prototypeGameModules(): Array<PrototypeGameModule> {
    return this.modules;
  }

  private async CompileModule(gameModule: PrototypeGameModule): Promise<void> {
    this.compiler.SetCode(gameModule.originSource);

    const result = await this.compiler.GetCompiledCode();

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
  private AddDeclaration(gameModule: PrototypeGameModule) {
    const moduleDeclaration = gameModule.GetDeclaration();
    this.Declarations.push({
      uri: moduleDeclaration.uri,
      text: this.WrapDeclaration(moduleDeclaration.text),
    });

    this.SetCompilerDeclarations();
  }

  // Modify and Set exists game module
  private ModifyDeclaration(gameModule: PrototypeGameModule) {
    const moduleDeclaration = gameModule.GetDeclaration();

    const declaration = this.Declarations.find(
      (d) => d.uri === moduleDeclaration.uri
    );
    if (!declaration) {
      throw new GameModuleNotFoundError();
    }

    declaration.text = this.WrapDeclaration(moduleDeclaration.text);

    this.SetCompilerDeclarations();
  }

  private SetCompilerDeclarations() {
    this.compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
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

  private RemoveLibAndDeclaration(deletedModule: PrototypeGameModule) {
    // Delete declarations
    const dIndex = this.Declarations.findIndex(
      (v) => v.uri === deletedModule.GetDeclarationURI()
    );
    if (dIndex > -1) {
      this.Declarations.splice(dIndex, 1);
    }

    // Delete Lib modules
    delete Lib.modules[deletedModule.safeName];

    this.SetCompilerDeclarations();
  }

  private async AddGameModule(
    gameModule: PrototypeGameModule
  ): Promise<PrototypeGameModule> {
    for (const prototypeGameModule of this.modules) {
      if (prototypeGameModule.name === gameModule.name) {
        throw new GameModuleNameDuplicatedError();
      } else if (prototypeGameModule.id === gameModule.id) {
        throw new GameModuleIdDuplicatedError();
      }
    }

    await this.CompileModule(gameModule);

    this.modules.push(gameModule);

    this.AddDeclaration(gameModule);
    this.AddGameModuleToLibrary(gameModule);

    return gameModule;
  }

  private RemoveGameModule(index: number): void {
    // Delete modules
    const deletedModule = this.modules.splice(index, 1)[0];

    this.RemoveLibAndDeclaration(deletedModule);
  }

  private async ModifyGameModule(index: number, source: string): Promise<void> {
    if (index < 0) {
      throw new GameModuleNotFoundError();
    }

    const modifiedModule = this.modules[index];

    modifiedModule.originSource = source;

    await this.CompileModule(modifiedModule);

    this.ModifyDeclaration(modifiedModule);
    this.AddGameModuleToLibrary(modifiedModule);
  }
}
