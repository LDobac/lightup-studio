import { defineStore } from "pinia";
import type { Nullable } from "babylonjs";
import type GameObject from "@/studio/core/runtime/GameObject";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";
import { usePrototypeStore } from "./PrototypeStore";

export interface EditorStoreState {
  editMode: "Code" | "Visual";
  selectedGameObject: Nullable<GameObject>;
  selectedGameModule: Nullable<PrototypeGameModule>;
}

export const useEditorStore = defineStore({
  id: "EditorStore",
  state: (): EditorStoreState => {
    return {
      editMode: "Visual",
      selectedGameObject: null,
      selectedGameModule: null,
    };
  },
  actions: {
    GoCodeEditor(gameModule: PrototypeGameModule) {
      this.selectedGameModule = gameModule;
      this.editMode = "Code";

      const prototypeStore = usePrototypeStore();
      if (prototypeStore.compiler) {
        prototypeStore.compiler.SetCode(this.selectedGameModule.originSource);
      }
    },
    GoVisualEditor(gameObject: GameObject) {
      this.selectedGameObject = gameObject;
      this.editMode = "Visual";
    },
  },
});
