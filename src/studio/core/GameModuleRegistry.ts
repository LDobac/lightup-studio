import { CompileError, CompileMachine } from "./CompileMachine";
import type PrototypeGameModule from "./PrototypeGameModule";
import { Declaration, Lib } from "./runtime/RuntimeLibrary";

export default class GameModuleRegistry {
  private compiler: CompileMachine;
  private modules: Array<PrototypeGameModule>;

  public Lib = Lib;
  public Declaration = Declaration;

  constructor(compiler: CompileMachine) {
    this.compiler = compiler;
    this.modules = [];
  }

  // public RegisterNewModule(name : string) : PrototypeGameModule
  // {

  // }

  // public RegisterBySource(name : string, source : string) : PrototypeGameModule
  // {

  // }

  // public RegisterByModule(gameModule : PrototypeGameModule) : PrototypeGameModule
  // {

  // }

  // public GetModuleByName(name : string) : PrototypeGameModule
  // {

  // }

  // public GetModuleById(id : string) : PrototypeGameModule
  // {

  // }

  // private ValidateModule(gameModule : PrototypeGameModule) : boolean
  // {

  // }

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

  private AddModule(gameModule: PrototypeGameModule): void {
    // Add Module to list
    // Add Library
  }
}
