import { describe, it, expect, afterEach } from "vitest";
import { Engine } from "babylonjs";
import type { CompileMachine } from "@/studio/core/CompileMachine";
import GameModuleRegistry, {
  GameModuleIdDuplicatedError,
  GameModuleNameDuplicatedError,
  GameModuleNotFoundError,
} from "@/studio/core/GameModuleRegistry";
import MockCompiler from "../Mock/MockCompiler";
import PrototypeGameModule, {
  SourceNotValidError,
} from "@/studio/core/PrototypeGameModule";
import GameObject from "@/studio/core/runtime/GameObject";
import { SceneObject, type ISceneObject } from "@/studio/core/SceneManager";
import { Lib } from "@/studio/core/runtime/RuntimeLibrary";

const dummyScene: ISceneObject = new SceneObject(
  "DummyScene",
  new Engine(null)
);

function CheckModuleExists(
  registry: GameModuleRegistry,
  module: PrototypeGameModule
) {
  expect(() => registry.GetPrototypeGameModuleById(module.id)).not.toThrow(
    new GameModuleNotFoundError()
  );
  expect(() => registry.GetPrototypeGameModuleByName(module.name)).not.toThrow(
    new GameModuleNotFoundError()
  );

  expect(registry.GetPrototypeGameModuleById(module.id)).toEqual(module);
  expect(registry.GetPrototypeGameModuleByName(module.name)).toEqual(module);
}

function CheckModuleNotExists(
  registry: GameModuleRegistry,
  module: PrototypeGameModule
) {
  expect(() => registry.GetPrototypeGameModuleById(module.id)).toThrow(
    new GameModuleNotFoundError()
  );
  expect(() => registry.GetPrototypeGameModuleByName(module.name)).toThrow(
    new GameModuleNotFoundError()
  );
}

function CheckLib(
  registry: GameModuleRegistry,
  createdModules: Array<PrototypeGameModule>
) {
  expect(Object.keys(Lib.modules).length).toEqual(createdModules.length);

  createdModules.forEach((module) => {
    const expectClass = Lib.modules[module.GetSafeName()].name;
    const answerClass = module.GetConstructorWrapper()(Lib).name;

    expect(expectClass).toEqual(answerClass);
  });
}

function CheckDeclaration(
  registry: GameModuleRegistry,
  createdModules: Array<PrototypeGameModule>
) {
  expect(registry.Declarations.length).toEqual(createdModules.length);

  createdModules.forEach((module) => {
    const moduleDeclaration = module.GetDeclaration();

    const globalDeclaration = registry.Declarations.find(
      (globalDeclaration) => {
        return moduleDeclaration.uri == globalDeclaration.uri;
      }
    );

    if (!globalDeclaration) throw "Cannot Find Declaration!";

    expect(globalDeclaration.text).toContain(module.GetSafeName());
    expect(globalDeclaration.text).toContain("namespace Lib");
    expect(globalDeclaration.text).toContain("namespace modules");
  });
}

describe("GameModuleRegistry Test", () => {
  const compiler: CompileMachine = new MockCompiler();
  let gameModuleRegistry = new GameModuleRegistry();

  afterEach(() => {
    Lib.modules = {};
    gameModuleRegistry.Declarations = [];

    gameModuleRegistry = new GameModuleRegistry();
  });

  it("Register New Model Test", async () => {
    const module = await gameModuleRegistry.RegisterNewModule(
      "Test GameModule",
      compiler
    );

    expect(module.originSource).toEqual(
      PrototypeGameModule.GetDefaultSource("test_gamemodule")
    );

    CheckModuleExists(gameModuleRegistry, module);

    CheckLib(gameModuleRegistry, [module]);
    CheckDeclaration(gameModuleRegistry, [module]);
  });

  it("Register New Model Test 10 times", async () => {
    const modules: Array<PrototypeGameModule> = [];

    for (let index = 0; index < 10; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test GameModule${index}`,
        compiler
      );

      expect(module.originSource).toEqual(
        PrototypeGameModule.GetDefaultSource(`test_gamemodule${index}`)
      );

      CheckModuleExists(gameModuleRegistry, module);

      modules.push(module);

      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }
  });

  it("Register New Model Name duplicated test", async () => {
    const moduleName = "Test GameModule";

    await gameModuleRegistry.RegisterNewModule(moduleName, compiler);

    await expect(
      gameModuleRegistry.RegisterNewModule(moduleName, compiler)
    ).rejects.toThrow(new GameModuleNameDuplicatedError());
  });

  it("Register By Source Test", async () => {
    const moduleName = "Test GameModule";
    const source = [
      "class test_gamemodule extends Lib.GameModule",
      "{",
      "\tpublic Start() {",
      "\tconsole.log('Start Function');",
      "}",
      "\tpublic Update(deltaTime:number) {",
      "\tthis.CustomUpdate();",
      "}",
      "private CustomUpdate() { console.log('Updated'); }",
      "}",
    ].join("\n");

    const module = await gameModuleRegistry.RegisterBySource(
      moduleName,
      source,
      compiler
    );

    expect(module.originSource).toEqual(source);

    CheckModuleExists(gameModuleRegistry, module);

    CheckLib(gameModuleRegistry, [module]);
    CheckDeclaration(gameModuleRegistry, [module]);
  });

  it("Register By Source Test 10 times", async () => {
    const modules: Array<PrototypeGameModule> = [];
    const source = [
      "class test_gamemodule? extends Lib.GameModule",
      "{",
      "\tpublic Start() {",
      "\tconsole.log('Start Function');",
      "}",
      "\tpublic Update(deltaTime:number) {",
      "\tthis.CustomUpdate();",
      "}",
      "private CustomUpdate() { console.log('Updated'); }",
      "}",
    ].join("\n");

    for (let index = 0; index < 10; index++) {
      const module = await gameModuleRegistry.RegisterBySource(
        `Test GameModule${index}`,
        source.replace("?", index.toString()),
        compiler
      );

      expect(module.originSource).toEqual(
        source.replace("?", index.toString())
      );

      CheckModuleExists(gameModuleRegistry, module);

      modules.push(module);

      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }
  });

  it("Register By Source Failed With wrong class name", async () => {
    const moduleName = "Test GameModule";
    const source = [
      "class wrong_class_name extends Lib.GameModule",
      "{",
      "\tpublic Start() {",
      "\tconsole.log('Start Function');",
      "}",
      "\tpublic Update(deltaTime:number) {",
      "\tthis.CustomUpdate();",
      "}",
      "private CustomUpdate() { console.log('Updated'); }",
      "}",
    ].join("\n");

    await expect(
      gameModuleRegistry.RegisterBySource(moduleName, source, compiler)
    ).rejects.toThrow(SourceNotValidError);

    expect(Object.keys(Lib.modules).length).toEqual(0);
    expect(gameModuleRegistry.Declarations.length).toEqual(0);
  });

  it("Register By Source duplicated test", async () => {
    const moduleName = "Test GameModule";
    const source = [
      "class test_gamemodule extends Lib.GameModule",
      "{",
      "\tpublic Start() {",
      "\tconsole.log('Start Function');",
      "}",
      "\tpublic Update(deltaTime:number) {",
      "\tthis.CustomUpdate();",
      "}",
      "private CustomUpdate() { console.log('Updated'); }",
      "}",
    ].join("\n");

    await gameModuleRegistry.RegisterBySource(moduleName, source, compiler);

    await expect(
      gameModuleRegistry.RegisterBySource(moduleName, source, compiler)
    ).rejects.toThrow(new GameModuleNameDuplicatedError());
  });

  it("Register By Module Test", async () => {
    const module = new PrototypeGameModule("", "Test GameModule");
    module.originSource = PrototypeGameModule.GetDefaultSource(
      module.GetSafeName()
    );

    const returnedModel = await gameModuleRegistry.RegisterByModule(
      module,
      compiler
    );

    expect(module).toEqual(returnedModel);

    CheckModuleExists(gameModuleRegistry, returnedModel);

    CheckLib(gameModuleRegistry, [returnedModel]);
    CheckDeclaration(gameModuleRegistry, [returnedModel]);
  });

  it("Register By Module Test 10 times", async () => {
    const modules: Array<PrototypeGameModule> = [];

    for (let index = 0; index < 10; index++) {
      const module = new PrototypeGameModule("", `Test GameModule${index}`);
      module.originSource = PrototypeGameModule.GetDefaultSource(
        module.GetSafeName()
      );

      const returnedModel = await gameModuleRegistry.RegisterByModule(
        module,
        compiler
      );

      expect(module).toEqual(returnedModel);

      CheckModuleExists(gameModuleRegistry, returnedModel);

      modules.push(returnedModel);

      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }
  });

  it("Register By Module Test With empty source", async () => {
    const module = new PrototypeGameModule("", "Test GameModule");

    await expect(
      gameModuleRegistry.RegisterByModule(module, compiler)
    ).rejects.toThrow(SourceNotValidError);

    expect(Object.keys(Lib.modules).length).toEqual(0);
    expect(gameModuleRegistry.Declarations.length).toEqual(0);
  });

  it("Register By Module Test Duplicated name test", async () => {
    const module1 = new PrototypeGameModule("", "Test GameModule");
    const module2 = new PrototypeGameModule("", "Test GameModule");

    module1.originSource = PrototypeGameModule.GetDefaultSource(
      module1.safeName
    );
    module2.originSource = PrototypeGameModule.GetDefaultSource(
      module2.safeName
    );

    await expect(
      gameModuleRegistry.RegisterByModule(module1, compiler)
    ).resolves.toEqual(module1);

    await expect(
      gameModuleRegistry.RegisterByModule(module2, compiler)
    ).rejects.toThrow(GameModuleNameDuplicatedError);

    expect(Object.keys(Lib.modules).length).toEqual(1);
    expect(gameModuleRegistry.Declarations.length).toEqual(1);
  });

  it("Register By Module Test Duplicated id test", async () => {
    const module1 = new PrototypeGameModule("", "Test GameModule1");
    const module2 = new PrototypeGameModule(module1.id, "Test GameModule2");

    module1.originSource = PrototypeGameModule.GetDefaultSource(
      module1.safeName
    );
    module2.originSource = PrototypeGameModule.GetDefaultSource(
      module2.safeName
    );

    await expect(
      gameModuleRegistry.RegisterByModule(module1, compiler)
    ).resolves.toEqual(module1);

    await expect(
      gameModuleRegistry.RegisterByModule(module2, compiler)
    ).rejects.toThrow(GameModuleIdDuplicatedError);

    expect(Object.keys(Lib.modules).length).toEqual(1);
    expect(gameModuleRegistry.Declarations.length).toEqual(1);
  });

  it("Reference other game module type test", async () => {
    const returnMessage = "this is return message";
    const inputMessage = "Hello input message!";
    const expectMessage = inputMessage + returnMessage;

    const moduleSource1 = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      moduleSource1,
      compiler
    );

    const moduleSource2 = [
      "class test_gamemodule extends Lib.GameModule {",
      " Start() : string {",
      "   const gm = new Lib.modules.lib_gamemodule(this.gameObject, '', '');",
      `   return gm.CustomFunc('${inputMessage}');`,
      "}",
      " Update(deltaTime : number) {}",
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "test_gamemodule",
      moduleSource2,
      compiler
    );

    const TestGamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("test_gamemodule");

    const instance = new TestGamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    const result: string = (instance.Start as () => string)();

    expect(result).toEqual(expectMessage);
  });

  it("RemoveGameModuleByModule Test", async () => {
    const module = await gameModuleRegistry.RegisterNewModule(
      "Test Module",
      compiler
    );

    CheckModuleExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, [module]);
    CheckDeclaration(gameModuleRegistry, [module]);

    gameModuleRegistry.RemoveGameModuleByModule(module, compiler);

    CheckModuleNotExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, []);
    CheckDeclaration(gameModuleRegistry, []);
  });

  it("RemoveGameModuleByModule Test multiple times", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 10; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const deletedModule1 = modules.splice(3, 1)[0];
    const deletedModule2 = modules.splice(4, 1)[0];
    const deletedModule3 = modules.splice(7, 1)[0];

    gameModuleRegistry.RemoveGameModuleByModule(deletedModule1, compiler);
    gameModuleRegistry.RemoveGameModuleByModule(deletedModule2, compiler);
    gameModuleRegistry.RemoveGameModuleByModule(deletedModule3, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule1);
    CheckModuleNotExists(gameModuleRegistry, deletedModule2);
    CheckModuleNotExists(gameModuleRegistry, deletedModule3);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("RemoveGameModuleByModule Test try not exists Module", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 5; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const notExistsModule = new PrototypeGameModule("", "Not exists Module");
    notExistsModule.originSource = PrototypeGameModule.GetDefaultSource(
      notExistsModule.GetSafeName()
    );

    CheckModuleNotExists(gameModuleRegistry, notExistsModule);

    gameModuleRegistry.RemoveGameModuleByModule(notExistsModule, compiler);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("RemoveGameModuleByName Test", async () => {
    const module = await gameModuleRegistry.RegisterNewModule(
      "Test Module",
      compiler
    );

    CheckModuleExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, [module]);
    CheckDeclaration(gameModuleRegistry, [module]);

    gameModuleRegistry.RemoveGameModuleByName("Test Module", compiler);

    CheckModuleNotExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, []);
    CheckDeclaration(gameModuleRegistry, []);
  });

  it("RemoveGameModuleByName Test multiple times", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 10; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const deletedModule1 = modules.splice(3, 1)[0];
    const deletedModule2 = modules.splice(4, 1)[0];
    const deletedModule3 = modules.splice(7, 1)[0];

    gameModuleRegistry.RemoveGameModuleByName(deletedModule1.name, compiler);
    gameModuleRegistry.RemoveGameModuleByName(deletedModule2.name, compiler);
    gameModuleRegistry.RemoveGameModuleByName(deletedModule3.name, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule1);
    CheckModuleNotExists(gameModuleRegistry, deletedModule2);
    CheckModuleNotExists(gameModuleRegistry, deletedModule3);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("RemoveGameModuleByName Test try not exists Module", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 5; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const notExistsModule = new PrototypeGameModule("", "Not exists Module");
    notExistsModule.originSource = PrototypeGameModule.GetDefaultSource(
      notExistsModule.GetSafeName()
    );

    CheckModuleNotExists(gameModuleRegistry, notExistsModule);

    gameModuleRegistry.RemoveGameModuleByName(notExistsModule.name, compiler);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("RemoveGameModuleById Test", async () => {
    const module = await gameModuleRegistry.RegisterNewModule(
      "Test Module",
      compiler
    );

    CheckModuleExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, [module]);
    CheckDeclaration(gameModuleRegistry, [module]);

    gameModuleRegistry.RemoveGameModuleById(module.id, compiler);

    CheckModuleNotExists(gameModuleRegistry, module);
    CheckLib(gameModuleRegistry, []);
    CheckDeclaration(gameModuleRegistry, []);
  });

  it("RemoveGameModuleById Test multiple times", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 10; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const deletedModule1 = modules.splice(3, 1)[0];
    const deletedModule2 = modules.splice(4, 1)[0];
    const deletedModule3 = modules.splice(7, 1)[0];

    gameModuleRegistry.RemoveGameModuleById(deletedModule1.id, compiler);
    gameModuleRegistry.RemoveGameModuleById(deletedModule2.id, compiler);
    gameModuleRegistry.RemoveGameModuleById(deletedModule3.id, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule1);
    CheckModuleNotExists(gameModuleRegistry, deletedModule2);
    CheckModuleNotExists(gameModuleRegistry, deletedModule3);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("RemoveGameModuleById Test try not exists Module", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 5; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const notExistsModule = new PrototypeGameModule("", "Not exists Module");
    notExistsModule.originSource = PrototypeGameModule.GetDefaultSource(
      notExistsModule.GetSafeName()
    );

    CheckModuleNotExists(gameModuleRegistry, notExistsModule);

    gameModuleRegistry.RemoveGameModuleById(notExistsModule.id, compiler);

    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("Complex RemoveGameModule Test", async () => {
    const modules = Array<PrototypeGameModule>();
    for (let index = 0; index < 5; index++) {
      const module = await gameModuleRegistry.RegisterNewModule(
        `Test Module ${index}`,
        compiler
      );

      modules.push(module);

      CheckModuleExists(gameModuleRegistry, module);
      CheckLib(gameModuleRegistry, modules);
      CheckDeclaration(gameModuleRegistry, modules);
    }

    const deletedModule1 = modules.splice(1, 1)[0];

    gameModuleRegistry.RemoveGameModuleById(deletedModule1.id, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule1);
    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);

    const deletedModule2 = modules.splice(1, 1)[0];

    gameModuleRegistry.RemoveGameModuleByModule(deletedModule2, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule2);
    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);

    const deletedModule3 = modules.splice(1, 1)[0];

    gameModuleRegistry.RemoveGameModuleByName(deletedModule3.name, compiler);

    CheckModuleNotExists(gameModuleRegistry, deletedModule3);
    CheckLib(gameModuleRegistry, modules);
    CheckDeclaration(gameModuleRegistry, modules);
  });

  it("ModifyGameModuleByModule Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    let lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    let gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await gameModuleRegistry.ModifyGameModuleByModule(
      prototypeModule,
      modifiedSource,
      compiler
    );
    lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);
  });

  it("ModifyGameModuleByModule not exists Test", async () => {
    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + 'addition'; }`,
      "}",
    ].join("\n");

    // Try modified not exists module;
    const notExistsModule = new PrototypeGameModule("", "notExists");
    await expect(
      gameModuleRegistry.ModifyGameModuleByModule(
        notExistsModule,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(GameModuleNotFoundError);
  });

  it("ModifyGameModuleByModule invalid source Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    const lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    const gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class wrong_class_name extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await expect(
      gameModuleRegistry.ModifyGameModuleByModule(
        prototypeModule,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(SourceNotValidError);
  });

  it("ModifyGameModuleByName Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    let lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    let gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await gameModuleRegistry.ModifyGameModuleByName(
      prototypeModule.name,
      modifiedSource,
      compiler
    );
    lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);
  });

  it("ModifyGameModuleByName not exists Test", async () => {
    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + 'addition'; }`,
      "}",
    ].join("\n");

    // Try modified not exists module;
    const notExistsModule = new PrototypeGameModule("", "notExists");
    await expect(
      gameModuleRegistry.ModifyGameModuleByName(
        notExistsModule.name,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(GameModuleNotFoundError);
  });

  it("ModifyGameModuleByName invalid source Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    const lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    const gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class wrong_class_name extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await expect(
      gameModuleRegistry.ModifyGameModuleByName(
        prototypeModule.name,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(SourceNotValidError);
  });

  it("ModifyGameModuleById Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    let lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    let gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await gameModuleRegistry.ModifyGameModuleById(
      prototypeModule.id,
      modifiedSource,
      compiler
    );
    lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);
  });

  it("ModifyGameModuleById not exists Test", async () => {
    const modifiedSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + 'addition'; }`,
      "}",
    ].join("\n");

    // Try modified not exists module;
    const notExistsModule = new PrototypeGameModule("", "notExists");
    await expect(
      gameModuleRegistry.ModifyGameModuleById(
        notExistsModule.id,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(GameModuleNotFoundError);
  });

  it("ModifyGameModuleById invalid source Test", async () => {
    let returnMessage = ":This is returned message";
    const inputMessage = "InputMessage:";

    let expectMessage = inputMessage + returnMessage;

    const originSource = [
      "class lib_gamemodule extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}'; }`,
      "}",
    ].join("\n");
    const prototypeModule = await gameModuleRegistry.RegisterBySource(
      "lib_gamemodule",
      originSource,
      compiler
    );

    const lib_gamemodule =
      gameModuleRegistry.GetGameModuleConstructorByName("lib_gamemodule");
    const gmInstance = new lib_gamemodule(
      new GameObject(dummyScene, "GameObject Test Name"),
      prototypeModule.id,
      ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((gmInstance as any).CustomFunc(inputMessage)).toEqual(expectMessage);

    // Modfify Test
    returnMessage = "This is modified Message!";
    expectMessage = inputMessage + returnMessage + "addition";

    const modifiedSource = [
      "class wrong_class_name extends Lib.GameModule {",
      " Start() {}",
      " Update(deltaTime : number) {}",
      ` CustomFunc(str:string) :string { return str + '${returnMessage}' + 'addition'; }`,
      "}",
    ].join("\n");

    await expect(
      gameModuleRegistry.ModifyGameModuleById(
        prototypeModule.id,
        modifiedSource,
        compiler
      )
    ).rejects.toThrow(SourceNotValidError);
  });

  it("Clear Test", async () => {
    await gameModuleRegistry.RegisterNewModule("m1", compiler);
    await gameModuleRegistry.RegisterNewModule("m2", compiler);
    await gameModuleRegistry.RegisterNewModule("m3", compiler);

    expect(gameModuleRegistry.Declarations.length).toEqual(3);
    expect(gameModuleRegistry.prototypeGameModules.length).toEqual(3);

    gameModuleRegistry.Clear(compiler);

    expect(gameModuleRegistry.Declarations.length).toEqual(0);
    expect(gameModuleRegistry.prototypeGameModules.length).toEqual(0);
  });
});

describe("GameModuleRegistry GameModule ExposeMetadata inject Test", async () => {
  const compiler: CompileMachine = new MockCompiler();
  let gameModuleRegistry = new GameModuleRegistry();

  afterEach(() => {
    Lib.modules = {};
    gameModuleRegistry.Declarations = [];

    gameModuleRegistry = new GameModuleRegistry();
  });

  it("Test Empty GameModule expose metadata value", async () => {
    const module = await gameModuleRegistry.RegisterNewModule(
      "Test GameModule",
      compiler
    );

    expect(module.exposeMetadata).toEqual({});
  });

  it("Test Successfully GameModule Metadata injected", async () => {
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
      ].join("\n"),
      compiler
    );

    expect(counterModule.exposeMetadata).not.toEqual({});
    expect(counterModule.exposeMetadata).toHaveProperty("count");
    expect(counterModule.exposeMetadata).toHaveProperty("Count");

    expect(counterModule.exposeMetadata.count.type).toEqual(Number);

    expect(counterModule.exposeMetadata.Count.type).toEqual(Function);
    expect(counterModule.exposeMetadata.Count.paramtypes).toEqual([]);
    expect(counterModule.exposeMetadata.Count.returntype).toEqual(Number);
  });
});
