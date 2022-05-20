import type { CompileMachine } from "@/studio/core/CompileMachine";
import Prototype from "@/studio/core/Prototype";
import type { Nullable } from "babylonjs";
import { defineStore } from "pinia";

export interface PrototypeState {
  prototype: Nullable<Prototype>;
  compiler: Nullable<CompileMachine>;
  canvasOrContext: Nullable<HTMLCanvasElement | WebGLRenderingContext>;
}

export const usePrototypeStore = defineStore({
  id: "prototype_store",
  state: (): PrototypeState => ({
    prototype: null,
    compiler: null,
    canvasOrContext: null,
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
      if (this.compiler && this.canvasOrContext) {
        this.prototype = new Prototype(this.canvasOrContext, this.compiler);
      }
    },
  },
});
