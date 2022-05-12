import { v4 as uuid } from "uuid";
import type GameModuleRegistry from "../GameModuleRegistry";
import { GameModuleNotFoundError } from "../GameModuleRegistry";
import type PrototypeGameModule from "../PrototypeGameModule";
import type GameModule from "./GameModule";

export type InstantiableProtoGMID = string;

export interface InstantiableProtoGM {
  uid: InstantiableProtoGMID;
  module: PrototypeGameModule;
}

export default class GameObject {
  private _id: string;
  private _prototypeGameModule: Array<InstantiableProtoGM>;
  private _gameModule: Array<GameModule>;

  constructor(id = "") {
    if (id.length) {
      this._id = id;
    } else {
      this._id = uuid();
    }

    this._prototypeGameModule = [];
    this._gameModule = [];
  }

  public Setup(gameModuleRegistry: GameModuleRegistry) {
    this._prototypeGameModule.forEach((v) => {
      const Constructor = gameModuleRegistry.GetGameModuleConstructorById(
        v.module.id
      );

      this._gameModule.push(new Constructor(this, v.module.id, v.uid));
    });
  }

  public Clear() {
    this._gameModule = [];
    this._prototypeGameModule = [];
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

  public Finish()
  {
    this._gameModule = [];
  }

  public AddPrototypeGameModule(newModule: PrototypeGameModule) : InstantiableProtoGM {
    const instantiablePrototypeGameModule = {
      uid: uuid(),
      module: newModule,
    };
    
    this._prototypeGameModule.push(instantiablePrototypeGameModule);

    return instantiablePrototypeGameModule;
  }

  public RemovePrototypeGameModuleByUid(uid: InstantiableProtoGMID) : PrototypeGameModule {
    const index = this._prototypeGameModule.findIndex(
      (v) => v.uid === uid
    );

    if (!(index > -1)) {
      throw new GameModuleNotFoundError();
    }
    
    return this._prototypeGameModule.splice(index, 1)[0].module;
  }

  public get id(): string {
    return this._id;
  }

  public get runtimeGameModule(): Array<GameModule> {
    return this._gameModule;
  }

  public get prototypeGameModule(): Array<InstantiableProtoGM> {
    return this._prototypeGameModule;
  }
}
