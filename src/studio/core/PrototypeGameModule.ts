import { v4 as uuid } from "uuid";

export interface IGameModuleDeclaration {
  uri: string;
  text: string;
}

export default class PrototypeGameModule {
  private _id: string;
  private _name: string;

  private _originSource: string;
  private _compiledSource: string;

  private declaration: string;

  public constructor(id: string, name: string) {
    this._id = id.length ? id : uuid();

    this._name = name;

    this._originSource = "";
    this._compiledSource = "";

    this.declaration = "";
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(newName: string) {
    this._name = newName;
  }

  public get originSource(): string {
    return this._originSource;
  }

  public set originSource(v: string) {
    //   Validate code
    this._originSource = v;
  }

  public get compiledSource(): string {
    return this._compiledSource;
  }

  public SetCompiledSource(source: string, declaration: string): void {
    // Add Stub Code for return constructor
    this._compiledSource = source;

    // Create Function object to create class

    this.declaration = declaration;
  }

  public GetDeclaration(): IGameModuleDeclaration {
    const safeName = this.GetSafeName();

    return {
      uri: safeName + ".d.ts",
      text: this.declaration,
    };
  }

  public GetSafeName() {
    return this.name.toLowerCase().replace(/\s/gim, "_");
  }
}
