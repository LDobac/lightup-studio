import { describe, it, expect, afterEach } from "vitest";
import MockCompiler from "../Mock/MockCompiler";

describe("MockCompiler Test", () => {
  let compiler = new MockCompiler();

  afterEach(() => {
    compiler = new MockCompiler();
  });

  it("Get/Set Code", () => {
    const expectCode = [
      "function x(str : string) {",
      "   console.log(str);",
      "}",
    ].join("\n");

    compiler.SetCode(expectCode);

    expect(compiler.GetCode()).toEqual(expectCode);
  });

  it("Get Compiled Code", async () => {
    const expectCode = [
      "function x(str : string) {",
      " console.log(str);",
      "}",
    ].join("\n");

    compiler.SetCode(expectCode);

    const result = await compiler.GetCompiledCode();
    expect(result.diagnostic.length).toEqual(0);
    expect(result.declaration).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.declaration?.length).toBeGreaterThan(0);
    expect(result.js?.length).toBeGreaterThan(0);
  });

  it("Get Compiled Code with error", async () => {
    const expectCode = [
      "function x(str : string) {",
      " console.log(str);",
      "}",
      "x(5);",
    ].join("\n");

    compiler.SetCode(expectCode);

    const result = await compiler.GetCompiledCode();
    expect(result.diagnostic.length).toBeGreaterThan(0);
    expect(result.declaration).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.declaration?.length).toBeGreaterThan(0);
    expect(result.js?.length).toBeGreaterThan(0);
  });

  it("Set declaration test", async () => {
    const expectCode = [
      "function x(str : string) {",
      " console.log(str);",
      " Facts.next();",
      "}",
      "x('abc');",
    ].join("\n");

    compiler.SetCode(expectCode);

    let result = await compiler.GetCompiledCode();
    expect(result.diagnostic.length).toBeGreaterThan(0);
    expect(result.declaration).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.declaration?.length).toBeGreaterThan(0);
    expect(result.js?.length).toBeGreaterThan(0);

    // extra libraries
    const libSource = [
      "declare class Facts {",
      "    /**",
      "     * Returns the next fact",
      "     */",
      "    static next():string",
      "}",
    ].join("\n");
    const libUri = "facts.d.ts";

    compiler.SetDeclaration([
      {
        uri: libUri,
        text: libSource,
      },
    ]);

    result = await compiler.GetCompiledCode();
    expect(result.diagnostic.length).toEqual(0);
    expect(result.declaration).toBeDefined();
    expect(result.js).toBeDefined();
    expect(result.declaration?.length).toBeGreaterThan(0);
    expect(result.js?.length).toBeGreaterThan(0);
  });
});
