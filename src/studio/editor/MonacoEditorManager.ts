// import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
// import "monaco-editor/esm/vs/editor/editor.all.js";
// import "monaco-editor/esm/vs/editor/editor.main.js";

import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import { flattenDiagnosticMessageText } from "typescript";

import {
  CompileMachine,
  type ITypeDeclaration,
} from "@/studio/core/CompileMachine";
import type { ICompileResult } from "@/studio/core/CompileMachine";

export default class MonacoEditorManager extends CompileMachine {
  private monacoEditor: monaco.editor.IStandaloneCodeEditor;

  private declarations: Array<{ uri: string; disposable: monaco.IDisposable }>;

  private editorOptions: monaco.editor.IStandaloneEditorConstructionOptions;
  private diagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions;
  private compilerOptions: monaco.languages.typescript.CompilerOptions;

  public constructor(element: HTMLElement, defaultSource = "") {
    super();

    // eslint-disable-next-line
    // @ts-ignore
    self.MonacoEnvironment = {
      // eslint-disable-next-line
      // @ts-ignore
      getWorker: (_, label): Worker => {
        switch (label) {
          case "json":
            return new jsonWorker();
          case "css":
          case "scss":
          case "less":
            return new cssWorker();
          case "html":
          case "handlebars":
          case "razor":
            return new htmlWorker();
          case "typescript":
          case "javascript":
            return new tsWorker();
          default:
            return new editorWorker();
        }
      },
    };

    this.declarations = [];

    this.diagnosticsOptions = {};
    this.SetDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    this.compilerOptions = {};
    this.SetCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.AMD,
      allowNonTsExtensions: true,
      declaration: true,
      noLib: false,
      strict: false,
      alwaysStrict: false,
      strictFunctionTypes: false,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    });

    if (!defaultSource) {
      defaultSource = this.GetDefaultSourceCode();
    }

    this.editorOptions = {
      value: defaultSource,
      language: "typescript",
      lineNumbers: "on",
      roundedSelection: true,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      contextmenu: true,
      folding: true,
      showFoldingControls: "always",
    };

    this.monacoEditor = monaco.editor.create(element, this.editorOptions);
    this.monacoEditor.layout();
  }

  public SetDiagnosticsOptions(
    diagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions
  ): void {
    this.diagnosticsOptions = diagnosticsOptions;

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
      this.diagnosticsOptions
    );
  }

  public SetCompilerOptions(
    compilerOptions: monaco.languages.typescript.CompilerOptions
  ): void {
    this.compilerOptions = compilerOptions;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      this.compilerOptions
    );
  }

  public SetDeclaration(declaration: ITypeDeclaration[]): void {
    this.declarations.forEach((v) => {
      v.disposable.dispose();
    });

    declaration.forEach((v) => {
      this.AddDeclaration(v);
    });
  }

  public AddDeclaration(declaration: ITypeDeclaration): void {
    const disposable =
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        declaration.text,
        declaration.uri
      );

    this.declarations.push({
      uri: declaration.uri,
      disposable: disposable,
    });
  }

  public RemoveDeclaration(uri: string): void {
    const index = this.declarations.findIndex((v) => v.uri === uri);

    if (index > -1) {
      this.declarations[index].disposable.dispose();
      this.declarations.splice(index, 1);
    }
  }

  public SetCode(newCode: string): void {
    this.monacoEditor.setValue(newCode);
  }

  public GetCode(): string {
    return this.monacoEditor.getValue();
  }

  public async GetCompiledCode(): Promise<ICompileResult> {
    const compiledResult: ICompileResult = {
      diagnostic: [],
    };

    const model = this.monacoEditor.getModel();
    if (!model) throw "Model not found!";

    const uri = model.uri;

    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const languageService = await worker(uri);

    const uriStr = uri.toString();

    const diagnostic = await Promise.all([
      languageService.getSyntacticDiagnostics(uriStr),
      languageService.getSemanticDiagnostics(uriStr),
    ]);

    diagnostic.forEach(function (diagset) {
      if (diagset.length) {
        const diagnostic = diagset[0];
        const position = model.getPositionAt(diagnostic.start ?? 0);
        const message = flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );

        compiledResult.diagnostic.push({
          position: {
            line: position.lineNumber,
            column: position.column,
          },
          message: message,
        });
      }
    });

    const emitResult = await languageService.getEmitOutput(uriStr);
    const outputFiles = emitResult.outputFiles;

    outputFiles.forEach((output) => {
      if (output.name.endsWith(".js")) {
        compiledResult.js = output.text;
      } else if (output.name.endsWith(".d.ts")) {
        compiledResult.declaration = output.text;
      }
    });

    return compiledResult;
  }

  private GetDefaultSourceCode(): string {
    return [
      "function x(str : string) : void",
      "{",
      "\tconsole.log(str);",
      "}",
    ].join("\n");
  }
}
