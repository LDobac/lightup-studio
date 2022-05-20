// import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
// import "monaco-editor/esm/vs/editor/editor.all.js";
// import "monaco-editor/esm/vs/editor/editor.main.js";

import { createProject, ts } from "@ts-morph/bootstrap";

import {
  CompileMachine,
  type ICompileResult,
  type ITypeDeclaration,
} from "@/studio/core/CompileMachine";
import { DefaultDeclarations } from "@/studio/core/runtime/RuntimeLibrary";

DefaultDeclarations.splice(0, DefaultDeclarations.length);
DefaultDeclarations.push({
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
});

export default class MockCompiler extends CompileMachine {
  private source: string;

  public filename = "test_file.ts";

  private compilerOptions: ts.CompilerOptions;

  private declarations: Array<ITypeDeclaration>;

  constructor() {
    super();

    this.source = "";

    this.declarations = [];

    this.compilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.AMD,
      allowNonTsExtensions: true,
      declaration: true,
      noLib: false,
      strict: false,
      alwaysStrict: false,
      strictFunctionTypes: false,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    };
  }

  public SetCode(newCode: string): void {
    this.source = newCode;
  }

  public GetCode(): string {
    return this.source;
  }

  public SetDeclaration(declarations: ITypeDeclaration[]): void {
    this.declarations = declarations;
  }

  public AddDeclaration(declarations: ITypeDeclaration): void {
    this.declarations.push(declarations);
  }

  public RemoveDeclaration(): void {
    //
  }

  public async GetCompiledCode(): Promise<ICompileResult> {
    const project = await createProject({ useInMemoryFileSystem: true });

    let sourceWithLib = "";

    for (const declaration of this.declarations) {
      const libDts = [
        "\n",
        `//------${declaration.uri} Start------`,
        declaration.text,
        `//------${declaration.uri} End------`,
        "\n",
      ].join("\n");

      sourceWithLib += libDts;
    }

    sourceWithLib += "declare let __SPEA__ : number;" + this.source;

    const sourceFile = await project.createSourceFile(
      this.filename,
      sourceWithLib
    );

    const program = project.createProgram({
      rootNames: [sourceFile.fileName],
      options: this.compilerOptions,
    });

    const emitResult = program.emit();

    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);
    const diagnostic =
      diagnostics?.map((diagnostic) => {
        if (diagnostic.file) {
          const { line, character } = ts.getLineAndCharacterOfPosition(
            diagnostic.file,
            diagnostic.start ?? 0
          );

          return {
            position: {
              line: line,
              column: character,
            },
            message: ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            ),
          };
        } else {
          return {
            position: {
              line: 0,
              column: 0,
            },
            message: ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n"
            ),
          };
        }
      }) ?? [];

    const js = await project.fileSystem.readFile(
      this.filename.replace(".ts", ".js")
    );

    const d = await project.fileSystem.readFile(
      this.filename.replace(".ts", ".d.ts")
    );

    const da = d.split("declare let __SPEA__: number;");

    return {
      diagnostic: diagnostic,
      js: js,
      declaration: da[1],
    };
  }
}
