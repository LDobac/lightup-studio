import { CompileError, CompileMachine } from "./CompileMachine";
import PrototypeGameModule from "./PrototypeGameModule";
import { Declaration, Lib } from "./runtime/RuntimeLibrary";

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

  public Lib = Lib;
  public Declaration = Declaration;

  constructor(compiler: CompileMachine) {
    this.compiler = compiler;
    this.modules = [];
  }

  public async RegisterNewModule(name: string): Promise<PrototypeGameModule> {
    this.modules.forEach((prototypeGameModule) => {
      if (prototypeGameModule.name === name) {
        throw new GameModuleNameDuplicatedError();
      }
    });

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
    this.modules.forEach((prototypeGameModule) => {
      if (prototypeGameModule.name === name) {
        throw new GameModuleNameDuplicatedError();
      }
    });

    const newPrototypeModule = new PrototypeGameModule("", name);
    newPrototypeModule.originSource = source;

    return this.AddGameModule(newPrototypeModule);
  }

  public RegisterByModule(
    gameModule: PrototypeGameModule
  ): Promise<PrototypeGameModule> {
    this.modules.forEach((prototypeGameModule) => {
      if (prototypeGameModule.name === gameModule.name) {
        throw new GameModuleNameDuplicatedError();
      }
    });

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

  public GetGameModuleByName(name: string): PrototypeGameModule {
    const deletedModule = this.modules.find((module) => module.name === name);

    if (!deletedModule) {
      throw new GameModuleNotFoundError();
    }

    return deletedModule;
  }

  public GetGameModuleById(id: string): PrototypeGameModule {
    const deletedModule = this.modules.find((module) => module.id === id);

    if (!deletedModule) {
      throw new GameModuleNotFoundError();
    }

    return deletedModule;
  }

  public ModifyGameModuleByName(name: string, source: string) {
    const index = this.modules.findIndex((module) => module.name === name);

    this.ModifyGameModule(index, source);
  }

  public ModifyGameModuleById(id: string, source: string) {
    const index = this.modules.findIndex((module) => module.id === id);

    this.ModifyGameModule(index, source);
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

  private async AddGameModule(
    gameModule: PrototypeGameModule
  ): Promise<PrototypeGameModule> {
    // Add Module to list
    // Add Library
    // TODO

    return new Promise(() => {
      //
    });
  }

  private RemoveGameModule(index: number): void {
    // TODO
  }

  private ModifyGameModule(index: number, source: string): void {
    // TODO
  }
}
