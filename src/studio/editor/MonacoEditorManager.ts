
// import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
// import "monaco-editor/esm/vs/editor/editor.all.js";
// import "monaco-editor/esm/vs/editor/editor.main.js";

import * as monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

export interface ICompileResult {
  diagnostic: Array<{
    position: monaco.Position;
    message: string | monaco.languages.typescript.DiagnosticMessageChain;
  }>;
  js?: string;
  declaration?: string;
}

export default class MonacoEditorManager {
  private monacoEditor: monaco.editor.IStandaloneCodeEditor;

  private editorOptions: monaco.editor.IStandaloneEditorConstructionOptions;
  private diagnosticsOptions: monaco.languages.typescript.DiagnosticsOptions;
  private compilerOptions: monaco.languages.typescript.CompilerOptions;

  public constructor(element: HTMLElement, defaultSource = "") {
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

  public AddLibrary(libSource: string, libUri: string): void {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      libSource,
      libUri
    );
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

        compiledResult.diagnostic.push({
          position: model.getPositionAt(diagnostic.start!),
          message: diagnostic.messageText,
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
