import { describe, it, expect } from "vitest";
import { Engine } from "babylonjs";
import PrototypeGameModule, {
  SourceNotValidError,
} from "@/studio/core/PrototypeGameModule";

import { Lib } from "@/studio/core/runtime/RuntimeLibrary";
import GameObject from "@/studio/core/runtime/GameObject";
import type { IExposeMetadata } from "@/studio/core/runtime/ExposeDecorator";
import { SceneObject, type ISceneObject } from "@/studio/core/SceneManager";

const dummyScene: ISceneObject = new SceneObject(
  "DummyScene",
  new Engine(null)
);

function NameTest(gm: PrototypeGameModule, expectName: string) {
  gm.name = expectName;

  expect(gm.name).toEqual(expectName);
}

function SafeNameTest(gm: PrototypeGameModule, expectSafeName: string) {
  expect(gm.GetSafeName()).toEqual(expectSafeName);
}

function OriginCodePassTest(gm: PrototypeGameModule, expectCode: string) {
  gm.originSource = expectCode;

  expect(gm.originSource).toEqual(expectCode);

  return expectCode;
}

function CompiledCodeTest(gm: PrototypeGameModule) {
  const expectCompiledSource = [
    `class ${gm.GetSafeName()} extends Lib.GameModule {`,
    "  Start() { console.log('Start'); }",
    "  Update(deltaTime) { console.log(deltaTime); }",
    "}",
  ].join("\n");

  const expectDeclaration = [
    `declare class ${gm.GetSafeName()} extends Lib.GameModule {`,
    "  Start(): void;",
    "  Update(deltaTime: number): void;",
    "}",
  ].join("\n");

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

  it("originSource Getter/Setter Validate Test Pass 1", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).not.toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource Getter/Setter Validate Test Pass 2", () => {
    const gm = new PrototypeGameModule("", "__GameModule2__    sd");

    const expectCode = [
      `     class      ${gm.GetSafeName()}      extends     Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).not.toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource Getter/Setter Validate Test Pass 3", () => {
    const gm = new PrototypeGameModule("", "GameModule 3");

    const expectCode = [
      "class",
      gm.GetSafeName(),
      "extends Lib.GameModule",
      "{",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).not.toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource Getter/Setter Validate Test Pass 4", () => {
    const gm = new PrototypeGameModule("", "GameModule 4");

    const expectCode = [
      "class A {}",
      "class B {}",
      "class",
      gm.GetSafeName(),
      "extends Lib.GameModule",
      "{",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).not.toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource have to change when name has changed", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).not.toThrow(
      new SourceNotValidError()
    );

    gm.name = "New Name";
    const matchClassRegex = new RegExp(
      `\\s*(class)\\s*(${gm.GetSafeName()})`,
      "gmi"
    );

    const matches = gm.originSource.matchAll(matchClassRegex);
    let isPass = false;

    for (const match of matches) {
      if (match.includes(gm.GetSafeName())) {
        isPass = true;
      }
    }

    expect(isPass).toBeTruthy();
  });

  it("originSource Getter/Setter Validate Test Failed 1", () => {
    // Does not have class
    const gm = new PrototypeGameModule("", "GameModule 5");

    const expectCode = ["function x() { console.log('hello'); }"].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource Getter/Setter Validate Test Failed 2", () => {
    // Have class But does class name not matched
    const gm = new PrototypeGameModule("", "GameModule 6");

    const expectCode = [
      "class GameModule extends Lib.GameModule {",
      "Start() {}",
      "Update(deltaTime) {}",
      "}",
    ].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).toThrow(
      new SourceNotValidError()
    );
  });

  it("originSource Getter/Setter Validate Test Failed 3", () => {
    // Not inhertence GameModule Class
    const gm = new PrototypeGameModule("", "GameModule 7");

    const expectCode = ["class", gm.GetSafeName(), "{ }"].join("\n");

    expect(() => OriginCodePassTest(gm, expectCode)).toThrow(
      new SourceNotValidError()
    );
  });

  it("compiledSource Get/Set Test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    OriginCodePassTest(gm, expectCode);

    CompiledCodeTest(gm);
  });

  it("constructor wrapper type test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    OriginCodePassTest(gm, expectCode);

    CompiledCodeTest(gm);

    const constructorWrapper = gm.GetConstructorWrapper();

    expect(constructorWrapper).toBeDefined();
    expect(constructorWrapper).toBeTypeOf("function");
  });

  it("constructor wrapper call success", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    OriginCodePassTest(gm, expectCode);

    CompiledCodeTest(gm);

    const constructorWrapper = gm.GetConstructorWrapper();

    expect(() => constructorWrapper(Lib)).not.toThrow();
  });

  it("constructor wrapper has create class instance successfully", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    OriginCodePassTest(gm, expectCode);

    CompiledCodeTest(gm);

    const constructorWrapper = gm.GetConstructorWrapper();

    expect(() => constructorWrapper(Lib)).not.toThrow();

    const classConstructor = constructorWrapper(Lib);
    expect(classConstructor).toBeDefined();

    const classInstance = new classConstructor(
      new GameObject(dummyScene, "GameObject Test Name"),
      gm.id,
      ""
    );
    expect(classInstance).toBeDefined();
    expect(classInstance).toHaveProperty("Start");
    expect(classInstance).toHaveProperty("Update");

    expect(classInstance.Start).toBeTypeOf("function");
    expect(classInstance.Update).toBeTypeOf("function");
  });

  it("GetDeclaration Test", () => {
    const gm = new PrototypeGameModule("", "GameModule 1");

    const expectCode = [
      `class ${gm.GetSafeName()} extends Lib.GameModule`,
      "{",
      "\tStart() { console.log('Start'); }",
      "\tUpdate(deltaTime : number) { console.log(deltaTime); }",
      "}",
    ].join("\n");

    OriginCodePassTest(gm, expectCode);

    const testedData = CompiledCodeTest(gm);

    const declaration = gm.GetDeclaration();
    expect(declaration).toBeDefined();
    expect(declaration).toHaveProperty("uri", gm.GetSafeName() + ".d.ts");
    expect(declaration).toHaveProperty("text", testedData[1]);
  });
});

describe("PrototypeGameModule ExposeMetadata Test", () => {
  it("Initialized metadata value test", () => {
    const gm = new PrototypeGameModule("", "Test GameModule");

    expect(gm.exposeMetadata).toEqual({});
  });

  it("Get/Set metadata test", () => {
    const gm = new PrototypeGameModule("", "Test GameModule");

    const data: IExposeMetadata = {
      Test: {
        type: "this is type",
        paramtypes: ["this", "is", "param"],
        returntype: "this is return type",
      },
    };

    gm.exposeMetadata = data;

    expect(gm.exposeMetadata).toEqual(data);
  });
});
