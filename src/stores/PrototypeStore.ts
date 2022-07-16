import { shallowRef, type ShallowRef } from "vue";
import { defineStore } from "pinia";
import type { Nullable } from "babylonjs";

import type { CompileMachine } from "@/studio/core/CompileMachine";
import Prototype from "@/studio/core/Prototype";
import type GameObjectManager from "@/studio/core/GameObjectManager";

export interface PrototypeState {
  _prototype: Nullable<Prototype>;
  compiler: ShallowRef<Nullable<CompileMachine>>;
  canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>;
  isLoaded: boolean;
}

export const usePrototypeStore = defineStore({
  id: "prototype_store",
  state: (): PrototypeState => ({
    _prototype: null,
    compiler: shallowRef<Nullable<CompileMachine>>(null),
    canvasOrContext: null,
    isLoaded: false,
  }),
  getters: {
    currentGameObjectManager(): GameObjectManager | null {
      if (!this._prototype) return null;
      if (!this._prototype.sceneManager) return null;
      if (!this._prototype.sceneManager.currentScene) return null;
      if (!this._prototype.sceneManager.currentScene.gameObjectManager)
        return null;

      return this._prototype.sceneManager.currentScene
        .gameObjectManager as GameObjectManager;
    },
    prototype(): Prototype {
      if (this._prototype) {
        return this._prototype as Prototype;
      }

      throw "Prototype not opened!";
    },
    isPrototypeOpen(): boolean {
      return this._prototype !== null;
    },
  },
  actions: {
    SetCompiler(compiler: CompileMachine) {
      this.compiler = compiler;

      this.CreatePrototypeIfSetUp();
    },
    SetCanvasElement(
      canvasOrContext: HTMLCanvasElement | WebGLRenderingContext
    ) {
      this.canvasOrContext = canvasOrContext;

      this.CreatePrototypeIfSetUp();
    },
    CreatePrototypeIfSetUp() {
      if (this.compiler && this.canvasOrContext && !this._prototype) {
        this._prototype = new Prototype(this.canvasOrContext);

        this.isLoaded = true;
      }
    },
  },
});
