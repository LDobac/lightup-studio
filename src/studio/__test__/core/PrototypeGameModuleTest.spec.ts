import { describe, it, expect } from "vitest";

import PrototypeGameModule from "@/studio/core/PrototypeGameModule";

function NameTest(gm: PrototypeGameModule, expectName: string) {
  gm.name = expectName;

  expect(gm.name).toEqual(expectName);
}

function SafeNameTest(gm: PrototypeGameModule, expectSafeName: string) {
  expect(gm.GetSafeName()).toEqual(expectSafeName);
}

function OriginCodeTest(gm: PrototypeGameModule) {
  const expectCode = [
    "function x(str : string) {",
    " console.log(str);",
    "};",
  ].join("\n");

  gm.originSource = expectCode;

  expect(gm.originSource).toEqual(expectCode);

  return expectCode;
}

function CompiledCodeTest(gm: PrototypeGameModule) {
  const expectCompiledSource = [
    '"use strict";',
    "function x(str) {",
    " console.log(str);",
    "}",
    ";",
  ].join("\n");

  const expectDeclaration = ["declare function x(str: string): void;"].join(
    "\n"
  );

  gm.SetCompiledSource(expectCompiledSource, expectDeclaration);

  expect(gm.compiledSource).toEqual(expectCompiledSource);

  return [expectCompiledSource, expectDeclaration];
}

describe("PrototypeGameModule Unit Test", () => {
  it("Name Getter/Setter Test", () => {
    let expectName = "GameModule 1";
    const gm = new PrototypeGameModule("", expectName);

    NameTest(gm, expectName);

    expectName = "New Module Name";
    NameTest(gm, expectName);
  });

  it("PrototypeGameModule Safe Name Test 1", () => {
    const expectName = "GameModule 1";
    const gm = new PrototypeGameModule("", expectName);

    NameTest(gm, expectName);

    SafeNameTest(gm, "gamemodule_1");
  });

  it("PrototypeGameModule Safe Name Test 2", () => {
    const expectName = "GameModule2";
    const gm = new PrototypeGameModule("", expectName);

    NameTest(gm, expectName);
    SafeNameTest(gm, "gamemodule2");
  });

  it("PrototypeGameModule Safe Name Test 3", () => {
    const expectName = "  GameModule3  ";
    const gm = new PrototypeGameModule("", expectName);

    NameTest(gm, expectName);
    SafeNameTest(gm, "__gamemodule3__");
  });

  it("PrototypeGameModule Safe Name Test 4", () => {
    const expectName = "__NEW_MODULE_NAME__";
    const gm = new PrototypeGameModule("", expectName);

    NameTest(gm, expectName);
    SafeNameTest(gm, "__new_module_name__");
  });

  it("originSource Getter/Setter Test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    OriginCodeTest(gm);
  });

  it("compiledSource Get/Set Test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    OriginCodeTest(gm);

    CompiledCodeTest(gm);
  });

  it("GetDeclaration Test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    OriginCodeTest(gm);

    const testedData = CompiledCodeTest(gm);

    const declaration = gm.GetDeclaration();
    expect(declaration).toBeDefined();
    expect(declaration).toHaveProperty("uri", gm.GetSafeName() + ".d.ts");
    expect(declaration).toHaveProperty("text", testedData[1]);
  });
});
