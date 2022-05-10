import { CompileError, CompileMachine } from "./CompileMachine";
import PrototypeGameModule, {
  type GameModuleConstructor,
} from "./PrototypeGameModule";
import {
  DefaultDeclarations,
  Lib as DefaultLibrary,
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

export default class GameModuleRegistry {
  private compiler: CompileMachine;
  private modules: Array<PrototypeGameModule>;

  public Lib = DefaultLibrary;
  public Declarations: RuntimeDeclarations = [];

  constructor(compiler: CompileMachine) {
    this.compiler = compiler;
    this.modules = [];

    this.compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
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

    return this.Lib.modules[module.safeName];
  }

  public GetGameModuleConstructorById(id: string): GameModuleConstructor {
    const module = this.modules.find((module) => module.id === id);

    if (!module) {
      throw new GameModuleNotFoundError();
    }

    return this.Lib.modules[module.safeName];
  }

  private async CompileModule(gameModule: PrototypeGameModule): Promise<void> {
    this.compiler.SetCode(gameModule.originSource);

    const result = await this.compiler.GetCompiledCode();

    if (result.diagnostic.length > 0) {
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

  private AddLibAndDeclaration(gameModule: PrototypeGameModule) {
    this.Lib.modules[gameModule.GetSafeName()] =
      gameModule.GetConstructorWrapper()(this.Lib);

    const moduleDeclaration = gameModule.GetDeclaration();
    this.Declarations.push({
      uri: moduleDeclaration.uri,
      text: this.WrapDeclaration(moduleDeclaration.text),
    });

    this.compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
  }

  private SetLibAndDeclaration(gameModule: PrototypeGameModule) {
    this.Lib.modules[gameModule.GetSafeName()] =
      gameModule.GetConstructorWrapper()(this.Lib);

    const moduleDeclaration = gameModule.GetDeclaration();

    const declaration = this.Declarations.find(
      (d) => d.uri === moduleDeclaration.uri
    );
    if (!declaration) {
      throw new GameModuleNotFoundError();
    }

    declaration.text = this.WrapDeclaration(moduleDeclaration.text);

    this.compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
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
    delete this.Lib.modules[deletedModule.safeName];

    this.compiler.SetDeclaration(DefaultDeclarations.concat(this.Declarations));
  }

  private async AddGameModule(
    gameModule: PrototypeGameModule
  ): Promise<PrototypeGameModule> {
    for (const prototypeGameModule of this.modules) {
      if (prototypeGameModule.name === gameModule.name) {
        throw new GameModuleNameDuplicatedError();
      }
    }

    await this.CompileModule(gameModule);

    // Add Module to list
    this.modules.push(gameModule);

    // Add Library and Declaration
    this.AddLibAndDeclaration(gameModule);

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

    this.SetLibAndDeclaration(modifiedModule);
  }
}
