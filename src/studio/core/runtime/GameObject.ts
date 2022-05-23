import { TransformNode } from "babylonjs";
import { v4 as uuid } from "uuid";
import { GameModuleNotFoundError } from "../GameModuleRegistry";
import { GameNotRunningError } from "../GameObjectManager";
import type IGameFlow from "../../utils/IGameFlow";
import type PrototypeGameModule from "../PrototypeGameModule";
import type { ISceneObject } from "../SceneManager";
import type GameModule from "./GameModule";
import { Lib } from "./RuntimeLibrary";

export type InstantiableProtoGMID = string;

export interface InstantiableProtoGM {
  uid: InstantiableProtoGMID;
  module: PrototypeGameModule;
}

export default class GameObject implements IGameFlow {
  private _id: string;
  private _name: string;

  private _prototypeGameModule: Array<InstantiableProtoGM>;
  private _gameModule: Array<GameModule>;

  private _scene: ISceneObject;

  private _node: TransformNode | null;

  constructor(scene: ISceneObject, name: string, id = "") {
    if (id.length) {
      this._id = id;
    } else {
      this._id = uuid();
    }

    this._name = name;

    this._prototypeGameModule = [];
    this._gameModule = [];

    this._scene = scene;

    this._node = null;
  }

  public Setup() {
    this._node = new TransformNode(this._name, this._scene.scene);
    this._node.id = this._id;

    this._prototypeGameModule.forEach((v) => {
      const Constructor = v.module.GetConstructorWrapper()(Lib);

      this._gameModule.push(new Constructor(this, v.module.id, v.uid));
    });
  }

  public Clear() {
    this._gameModule = [];
    this._prototypeGameModule = [];

    this._node = null;
  }

  public Start() {
    this._gameModule.forEach((module) => {
      module.Start();
    });
  }

  public Update(deltaTime: number) {
    this._gameModule.forEach((module) => {
      module.Update(deltaTime);
    });
  }

  public Finish() {
    this._gameModule = [];

    this._node = null;
  }

  public AddPrototypeGM(newModule: PrototypeGameModule): InstantiableProtoGM {
    const instantiablePrototypeGameModule = {
      uid: uuid(),
      module: newModule,
    };

    this._prototypeGameModule.push(instantiablePrototypeGameModule);

    return instantiablePrototypeGameModule;
  }

  public RemoveProtoGMByUid(uid: InstantiableProtoGMID): PrototypeGameModule {
    const index = this._prototypeGameModule.findIndex((v) => v.uid === uid);

    if (!(index > -1)) {
      throw new GameModuleNotFoundError();
    }

    return this._prototypeGameModule.splice(index, 1)[0].module;
  }

  public GetProtoGMByUid(uid: InstantiableProtoGMID): InstantiableProtoGM {
    const protoGM = this._prototypeGameModule.find((v) => v.uid === uid);

    if (!protoGM) {
      throw new GameModuleNotFoundError();
    }

    return protoGM;
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get runtimeGameModule(): Array<GameModule> {
    return this._gameModule;
  }

  public get prototypeGameModule(): Array<InstantiableProtoGM> {
    return this._prototypeGameModule;
  }

  public get node(): TransformNode {
    if (!this._node) {
      throw new GameNotRunningError();
    }

    return this._node;
  }

  public get scene(): ISceneObject {
    return this._scene;
  }
}
