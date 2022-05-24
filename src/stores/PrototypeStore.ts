import { shallowRef, type ShallowRef } from "vue";
import { defineStore } from "pinia";
import type { Nullable } from "babylonjs";

import type { CompileMachine } from "@/studio/core/CompileMachine";
import Prototype from "@/studio/core/Prototype";

export interface PrototypeState {
  prototype: Nullable<Prototype>;
  compiler: ShallowRef<Nullable<CompileMachine>>;
  canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>;
  isLoaded: boolean;
}

export const usePrototypeStore = defineStore({
  id: "prototype_store",
  state: (): PrototypeState => ({
    prototype: null,
    compiler: shallowRef<Nullable<CompileMachine>>(null),
    canvasOrContext: null,
    isLoaded: false,
  }),
  getters: {},
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
      if (this.compiler && this.canvasOrContext && !this.prototype) {
        this.prototype = new Prototype(this.canvasOrContext, this.compiler);

        this.isLoaded = true;
      }
    },
  },
});
