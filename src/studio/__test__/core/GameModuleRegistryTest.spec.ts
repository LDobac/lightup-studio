import type { CompileMachine } from "@/studio/core/CompileMachine";
import GameModuleRegistry from "@/studio/core/GameModuleRegistry";
import { describe, it, expect, afterEach } from "vitest";
import MockCompiler from "./MockCompiler";

describe("GameModuleRegistry Test", () => {
  const compiler: CompileMachine = new MockCompiler();
  let gameModuleRegistry = new GameModuleRegistry(compiler);

  afterEach(() => {
    gameModuleRegistry = new GameModuleRegistry(compiler);
  });

  it("Register New Model Test", () => {
    expect(false).toBeTruthy();
  });

  it("Register New Model Test More", () => {
    expect(false).toBeTruthy();
  });

  it("Register New Model Test Failed", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Source Test", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Source Test More", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Source Failed", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Module Test", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Module Test More", () => {
    expect(false).toBeTruthy();
  });

  it("Register By Module Test Failed", () => {
    expect(false).toBeTruthy();
  });

  it("Complex Register Test", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByModule Test", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByModule Test More", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByModule Test try not exists Module", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByName Test", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByName Test More", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleByName Test try not exists Module", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleById Test", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleById Test More", () => {
    expect(false).toBeTruthy();
  });

  it("RemoveGameModuleById Test try not exists Module", () => {
    expect(false).toBeTruthy();
  });

  it("Complex RemoveGameModule Test", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Name Test", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Name Test not exists", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Id Test", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Id Test not exists", () => {
    expect(false).toBeTruthy();
  });

  it("Modify Module By Name Test", () => {
    expect(false).toBeTruthy();
  });

  it("Modify Module By Name Test not exists", () => {
    expect(false).toBeTruthy();
  });

  it("Modify Module By Name Test invalid source", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Id Test", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Id Test not exists", () => {
    expect(false).toBeTruthy();
  });

  it("Get Module By Id Test invalid source", () => {
    expect(false).toBeTruthy();
  });
});
