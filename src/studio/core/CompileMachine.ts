export interface ITypeDeclaration {
  uri: string;
  text: string;
}

export interface IDiagnosticPosition {
  line: number;
  column: number;
}

export interface IDiagnostic {
  position: IDiagnosticPosition;
  message: string;
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
  public abstract SetDeclaration(declarations: Array<ITypeDeclaration>): void;
  public abstract AddDeclaration(declarations: ITypeDeclaration): void;
  public abstract RemoveDeclaration(uri: string): void;

  public abstract SetCode(source: string): void;
  public abstract GetCode(): string;

  public abstract GetCompiledCode(): Promise<ICompileResult>;
}
