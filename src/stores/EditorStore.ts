import { defineStore } from "pinia";
import type { Nullable } from "babylonjs";
import type GameObject from "@/studio/core/runtime/GameObject";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";

export interface EditorStoreState {
  editMode: "Code" | "Visual";
  _selectedGameObject: Nullable<GameObject>;
  _selectedGameModule: Nullable<PrototypeGameModule>;
}

export const useEditorStore = defineStore({
  id: "EditorStore",
  state: (): EditorStoreState => {
    return {
      editMode: "Visual",
      _selectedGameObject: null,
      _selectedGameModule: null,
    };
  },
  getters: {
    selectedGameObject(): Nullable<GameObject> {
      return this._selectedGameObject as Nullable<GameObject>;
    },
    selectedGameModule(): Nullable<PrototypeGameModule> {
      return this._selectedGameModule as Nullable<PrototypeGameModule>;
    },
  },
  actions: {
    GoCodeEditor(gameModule: PrototypeGameModule) {
      this._selectedGameModule = gameModule;
      this.editMode = "Code";
    },
    GoVisualEditor(gameObject: GameObject) {
      this._selectedGameObject = gameObject;
      this.editMode = "Visual";
    },
  },
});
