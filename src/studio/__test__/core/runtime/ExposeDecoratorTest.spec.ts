import { describe, it, expect } from "vitest";
import "reflect-metadata";
import { Engine } from "babylonjs";

import GameModuleRegistry from "@/studio/core/GameModuleRegistry";
import MockCompiler from "../../Mock/MockCompiler";
import {
  KEY_EXPOSE_META,
  type IExposeMetadata,
} from "@/studio/core/runtime/ExposeDecorator";
import GameObject from "@/studio/core/runtime/GameObject";
import { SceneObject, type ISceneObject } from "@/studio/core/SceneManager";

const dummyScene: ISceneObject = new SceneObject(
  "DummyScene",
  new Engine(null)
);

describe("Expose decorator test", async () => {
  const compiler = new MockCompiler();
  const gameModuleRegistry = new GameModuleRegistry(compiler);

  const counterModule = await gameModuleRegistry.RegisterBySource(
    "Counter",
    [
      "class counter extends Lib.GameModule {",
      "   @Lib.Expose()",
      "   public count : number = 0;",
      "   public Start() { this.count = 10; }",
      "   public Update(deltaTime : number) { this.Count(); }",
      "   @Lib.Expose()",
      "   public Count() : number {this.count++; return this.count;}",
      "}",
    ].join("\n")
  );

  const countAModule = await gameModuleRegistry.RegisterBySource(
    "CountA",
    [
      "class counta extends Lib.GameModule {",
      "   @Lib.Expose()",
      "   public a : string = '';",
      "   public Start() { this.a = 'start' }",
      "   public Update(deltaTime : number) { this.GetA() }",
      "   @Lib.Expose()",
      "   public GetA() : string {this.a += 'a'; return this.a;}",
      "}",
    ].join("\n")
  );

  class NewType {
    public str = "str_value";
  }
  const extraTypeModule = await gameModuleRegistry.RegisterBySource(
    "ExtraType",
    [
      "class NewType {",
      " public str = 'str_value'",
      "}",
      "class extratype extends Lib.GameModule {",
      "   @Lib.Expose()",
      "   public obj : NewType",
      "   public Start() { }",
      "   public Update(deltaTime : number) { }",
      "}",
    ].join("\n")
  );

  it("Test Metadata generate successfully By Constructor 1", () => {
    const counterConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      counterModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      counterConstructor.prototype
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata).toHaveProperty("count");
    expect(metadata).toHaveProperty("Count");
  });

  it("Test Metadata generate successfully By Constructor 2", () => {
    const countAConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      countAModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      countAConstructor.prototype
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata).toHaveProperty("a");
    expect(metadata).toHaveProperty("GetA");
  });

  it("Test Metadata generate successfully By Instance 1", () => {
    const counterConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      counterModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      new counterConstructor(
        new GameObject(dummyScene, "GameObject Test Name"),
        counterModule.id,
        ""
      )
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata).toHaveProperty("count");
    expect(metadata).toHaveProperty("Count");
  });

  it("Test Metadata generate successfully By Instance 2", () => {
    const countAConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      countAModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      new countAConstructor(
        new GameObject(dummyScene, "GameObject Test Name"),
        countAModule.id,
        ""
      )
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata).toHaveProperty("a");
    expect(metadata).toHaveProperty("GetA");
  });

  it("Test Metadata have correct types 1", () => {
    const counterConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      counterModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      counterConstructor.prototype
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata["count"].paramtypes).toBeUndefined();
    expect(metadata["count"].returntype).toBeUndefined();
    expect(metadata["count"].type).toEqual(Number);

    expect(metadata["Count"].paramtypes).toEqual([]);
    expect(metadata["Count"].returntype).toEqual(Number);
    expect(metadata["Count"].type).toEqual(Function);
  });

  it("Test Metadata have correct types 2", () => {
    const countAConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      countAModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      countAConstructor.prototype
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata["a"].paramtypes).toBeUndefined();
    expect(metadata["a"].returntype).toBeUndefined();
    expect(metadata["a"].type).toEqual(String);

    expect(metadata["GetA"].paramtypes).toEqual([]);
    expect(metadata["GetA"].returntype).toEqual(String);
    expect(metadata["GetA"].type).toEqual(Function);
  });

  it("Test Metadata have correct types 3", () => {
    const moduleConstructor = gameModuleRegistry.GetGameModuleConstructorById(
      extraTypeModule.id
    );

    const rawMetadata = Reflect.getMetadata(
      KEY_EXPOSE_META,
      moduleConstructor.prototype
    );

    expect(rawMetadata).toBeDefined();

    const metadata = rawMetadata as IExposeMetadata;

    expect(metadata["obj"].paramtypes).toBeUndefined();
    expect(metadata["obj"].returntype).toBeUndefined();

    const objectPrototype = (
      metadata["obj"].type as Record<string, unknown>
    ) /** Same as 'any' type */["prototype"];
    expect(objectPrototype).toEqual(NewType.prototype);
  });
});
