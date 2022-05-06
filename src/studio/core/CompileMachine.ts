import type * as monaco from "monaco-editor";

export interface IDiagnostic {
  position: monaco.Position;
  message: string | monaco.languages.typescript.DiagnosticMessageChain;
}

export interface ICompileResult {
  diagnostic: Array<IDiagnostic>;
  js?: string;
  declaration?: string;
}

export class CompileError extends Error {
  constructor(diagnostic: Array<IDiagnostic>) {
    let msg = "";
    diagnostic.forEach((diagnostic) => {
      msg += `${diagnostic.position} : ${diagnostic.message}\n`;
    });

    super(msg);
  }
}

export abstract class CompileMachine {
  public abstract SetCode(source: string): void;
  public abstract GetCode(): string;

  public abstract GetCompiledCode(): Promise<ICompileResult>;
}
