import { describe, it, expect } from "vitest";
import GameModuleRegistry, {
  GameModuleNotFoundError,
} from "@/studio/core/GameModuleRegistry";
import GameModule from "@/studio/core/runtime/GameModule";
import GameObject from "@/studio/core/runtime/GameObject";
import MockCompiler from "../core/MockCompiler";

describe("GameObjectTest", async () => {
  const compiler = new MockCompiler();
  const gameModuleRegistry = new GameModuleRegistry(compiler);

  class class_counter extends GameModule {
    public count = 0;
    public Start() {
      /** Empty */
    }
    public Update() {
      /** Empty */
    }
    public Count(): number {
      this.count++;
      return this.count;
    }
  }
  const counterModule = await gameModuleRegistry.RegisterBySource(
    "Counter",
    [
      "class counter extends Lib.GameModule {",
      "   public count : number = 0;",
      "   public Start() { this.count = 10; }",
      "   public Update(deltaTime : number) { this.Count(); }",
      "   public Count() : number {this.count++; return this.count;}",
      "}",
    ].join("\n")
  );

  class class_counta extends GameModule {
    public a = "";
    public Start() {
      /** Empty */
    }
    public Update() {
      /** Empty */
    }
    public GetA(): string {
      this.a += "a";
      return this.a;
    }
  }
  const countAModule = await gameModuleRegistry.RegisterBySource(
    "CountA",
    [
      "class counta extends Lib.GameModule {",
      "   public a : string = '';",
      "   public Start() { this.a = 'start' }",
      "   public Update(deltaTime : number) { this.GetA() }",
      "   public GetA() : string {this.a += 'a'; return this.a;}",
      "}",
    ].join("\n")
  );

  it("AddPrototypeGameModule Test add one module", () => {
    const gameObject = new GameObject();

    gameObject.AddPrototypeGameModule(counterModule);

    expect(gameObject.prototypeGameModule.length).toEqual(1);
  });

  it("AddPrototypeGameModule Test add extra module", () => {
    const gameObject = new GameObject();

    gameObject.AddPrototypeGameModule(counterModule);

    expect(gameObject.prototypeGameModule.length).toEqual(1);

    gameObject.AddPrototypeGameModule(countAModule);

    expect(gameObject.prototypeGameModule.length).toEqual(2);
  });

  it("AddPrototypeGameModule Test add same module", () => {
    const gameObject = new GameObject();

    gameObject.AddPrototypeGameModule(counterModule);

    expect(gameObject.prototypeGameModule.length).toEqual(1);

    gameObject.AddPrototypeGameModule(counterModule);

    expect(gameObject.prototypeGameModule.length).toEqual(2);
  });

  it("RemovePrototypeGameModuleByUid test", () => {
    const gameObject = new GameObject();

    const remainInstProtoGM = gameObject.AddPrototypeGameModule(counterModule);
    const instantiableProtoGM = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.RemovePrototypeGameModuleByUid(instantiableProtoGM.uid);

    expect(gameObject.prototypeGameModule.length).toEqual(1);

    expect(gameObject.prototypeGameModule[0].uid).toEqual(
      remainInstProtoGM.uid
    );
    expect(gameObject.prototypeGameModule[0].module).toEqual(
      remainInstProtoGM.module
    );
  });

  it("RemovePrototypeGameModuleByUid all modules by manually test", () => {
    const gameObject = new GameObject();

    const instProtoGM1 = gameObject.AddPrototypeGameModule(counterModule);
    const instProtoGM2 = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.RemovePrototypeGameModuleByUid(instProtoGM1.uid);
    gameObject.RemovePrototypeGameModuleByUid(instProtoGM2.uid);

    expect(gameObject.prototypeGameModule.length).toEqual(0);
  });

  it("RemovePrototypeGameModuleByUid try delete not exists module.", () => {
    const gameObject = new GameObject();

    gameObject.AddPrototypeGameModule(counterModule);
    gameObject.AddPrototypeGameModule(countAModule);

    expect(() =>
      gameObject.RemovePrototypeGameModuleByUid("asdasdasd")
    ).toThrow(GameModuleNotFoundError);

    expect(gameObject.prototypeGameModule.length).toEqual(2);
  });

  it("Remove all prototype gamemodule by 'Clear' function", () => {
    const gameObject = new GameObject();

    gameObject.AddPrototypeGameModule(counterModule);
    gameObject.AddPrototypeGameModule(countAModule);

    gameObject.Clear();

    expect(gameObject.prototypeGameModule.length).toEqual(0);
    expect(gameObject.runtimeGameModule.length).toEqual(0);
  });

  it("Test Runtime GameModule successfully created by 'Setup' Function", () => {
    const gameObject = new GameObject();

    const instProtoGM1 = gameObject.AddPrototypeGameModule(counterModule);
    const instProtoGM2 = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.Setup(gameModuleRegistry);

    const runtimeGameModule = gameObject.runtimeGameModule;

    expect(runtimeGameModule.length).toBe(2);

    expect(
      runtimeGameModule.findIndex(
        (v) => v.prototypeId === instProtoGM1.module.id
      )
    ).toBeGreaterThan(-1);
    expect(
      runtimeGameModule.findIndex(
        (v) => v.prototypeId === instProtoGM2.module.id
      )
    ).toBeGreaterThan(-1);

    expect(
      runtimeGameModule.findIndex((v) => v.uid === instProtoGM1.uid)
    ).toBeGreaterThan(-1);
    expect(
      runtimeGameModule.findIndex((v) => v.uid === instProtoGM2.uid)
    ).toBeGreaterThan(-1);

    for (const gameModule of runtimeGameModule) {
      expect(gameModule.gameObject).toEqual(gameObject);
    }
  });

  it("Test every gamemodule have to successfully call 'Start' Function", () => {
    const gameObject = new GameObject();

    const instProtoGM1 = gameObject.AddPrototypeGameModule(counterModule);
    const instProtoGM2 = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.Setup(gameModuleRegistry);

    const runtimeGameModule = gameObject.runtimeGameModule;

    expect(runtimeGameModule.length).toBe(2);

    const counterInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM1.module.id
    );
    const countaInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM2.module.id
    );

    expect(counterInst).toBeDefined();
    expect(countaInst).toBeDefined();

    const counter = counterInst as class_counter;
    const counta = countaInst as class_counta;

    expect(counter.count).toEqual(0);
    expect(counta.a).toEqual("");

    gameObject.Start();

    expect(counter.count).toEqual(10);
    expect(counta.a).toEqual("start");
  });

  it("Test every gamemodule have to successfully call 'Update' function", () => {
    const gameObject = new GameObject();

    const instProtoGM1 = gameObject.AddPrototypeGameModule(counterModule);
    const instProtoGM2 = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.Setup(gameModuleRegistry);

    const runtimeGameModule = gameObject.runtimeGameModule;

    const counterInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM1.module.id
    );
    const countaInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM2.module.id
    );

    const counter = counterInst as class_counter;
    const counta = countaInst as class_counta;

    gameObject.Start();

    for (let i = 0; i < 10; i++) {
      expect(counter.count).toEqual(10 + i);
      expect(counta.a).toEqual("start" + "a".repeat(i));

      gameObject.Update(0);
    }
  });

  it("Test Finish function", () => {
    const gameObject = new GameObject();

    const instProtoGM1 = gameObject.AddPrototypeGameModule(counterModule);
    const instProtoGM2 = gameObject.AddPrototypeGameModule(countAModule);

    gameObject.Setup(gameModuleRegistry);

    const runtimeGameModule = gameObject.runtimeGameModule;

    const counterInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM1.module.id
    );
    const countaInst = runtimeGameModule.find(
      (v) => v.prototypeId === instProtoGM2.module.id
    );

    const counter = counterInst as class_counter;
    const counta = countaInst as class_counta;

    gameObject.Start();

    for (let i = 0; i < 10; i++) {
      expect(counter.count).toEqual(10 + i);
      expect(counta.a).toEqual("start" + "a".repeat(i));

      gameObject.Update(0);
    }

    gameObject.Finish();

    expect(gameObject.runtimeGameModule.length).toEqual(0);
  });
});
